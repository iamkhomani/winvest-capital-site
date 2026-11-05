// Automated token risk analysis for the DeFi scanner.
// Combines GoPlus Security (contract + holder data), Honeypot.is (buy/sell simulation, EVM),
// DexScreener (market data, copycat check) and our own bytecode scan via public RPC nodes.
// Everything runs in the visitor's browser; nothing is stored. Heuristics, not a manual audit.
import { CHAINS, goplusChain, searchPairs } from './defi'
import type { Pair } from './defi'

type T = { en: string; nl: string }
export type Sev = 'critical' | 'high' | 'medium' | 'low'
export type Cat = 'scam' | 'contract' | 'liquidity' | 'holders'
export type Finding = { sev: Sev; cat: Cat; t: T; d: T }
export type Grade = 'low' | 'medium' | 'high' | 'critical'
export type Report = {
  score: number
  grade: Grade
  findings: Finding[]
  good: T[]
  sources: string[]
  failed: string[]
  audit?: { codeSize: number; functions: string[]; delegatecall: boolean; selfdestruct: boolean; implementation?: string }
  checks: number
}

const W: Record<Sev, number> = { critical: 45, high: 20, medium: 8, low: 3 }
const yes = (v: unknown) => v === '1' || v === 1 || v === true
const num = (v: unknown) => (v === undefined || v === null || v === '' ? null : Number(v))
const short = (a: string) => (a.length > 14 ? a.slice(0, 6) + '…' + a.slice(-4) : a)
const DEAD = /^(0x0{40}|0x0{36}dead|0x000000000000000000000000000000000000dead)$/i

async function getJson(url: string, init?: RequestInit): Promise<any> {
  const r = await fetch(url, { ...init, signal: AbortSignal.timeout(15000) })
  if (!r.ok) throw new Error(String(r.status))
  return r.json()
}
async function rpc(url: string, method: string, params: unknown[]): Promise<any> {
  const j = await getJson(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) })
  if (j.error) throw new Error(j.error.message || 'rpc error')
  return j.result
}

// Function selectors of privileged functions often abused in scam tokens (keccak256 of the signature, first 4 bytes).
const SELECTORS: Record<string, string> = {
  '40c10f19': 'mint', a0712d68: 'mint', '8456cb59': 'pause',
  f9f92be4: 'blacklist', '44337ea1': 'blacklist', '153b0d1e': 'blacklist', '455a4396': 'blacklist', b515566a: 'blacklist (bots)', d34628cc: 'blacklist (bots)',
  '69fe0e2d': 'set fee', '0b78f9c0': 'set fee', '061c82d0': 'set fee', '0cc835a3': 'set fee', '8b4cee08': 'set fee', c647b20e: 'set fee', '6db79437': 'set fee',
  ec28438a: 'set max transaction', ea1644d5: 'set max wallet', '5d0044ca': 'set max wallet',
  e30443bc: 'set balance', '3ccfd60b': 'withdraw', db2e21bc: 'withdraw',
  '3659cfe6': 'upgrade', '4f1ef286': 'upgrade',
  c9567bf9: 'enable trading', '8a8c523c': 'enable trading', c2e5ec04: 'enable trading', '5932ead1': 'cooldown',
}
const IMPL_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc' // EIP-1967

/** Walks EVM bytecode (skipping PUSH data and the metadata trailer) and returns pushed 4-byte selectors and dangerous opcodes. */
export function scanBytecode(hex: string) {
  const b = hex.replace(/^0x/, '')
  const bytes = new Uint8Array(b.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(b.substr(i * 2, 2), 16)
  let end = bytes.length
  if (end > 2) {
    const meta = (bytes[end - 2] << 8) | bytes[end - 1]
    if (meta + 2 < end) end -= meta + 2
  }
  const found = new Set<string>()
  let delegatecall = false
  let selfdestruct = false
  for (let i = 0; i < end; i++) {
    const op = bytes[i]
    if (op >= 0x60 && op <= 0x7f) {
      const n = op - 0x5f
      if (n === 4 && i + 4 < end) {
        const sel = Array.from(bytes.slice(i + 1, i + 5), (x) => x.toString(16).padStart(2, '0')).join('')
        if (SELECTORS[sel]) found.add(SELECTORS[sel])
      }
      i += n
    } else if (op === 0xf4) delegatecall = true
    else if (op === 0xff) selfdestruct = true
  }
  return { codeSize: bytes.length, functions: [...found].sort(), delegatecall, selfdestruct }
}

const HONEYPOT_IS: Record<string, number> = { ethereum: 1, bsc: 56, base: 8453 }

export async function analyzeToken(pairs: Pair[]): Promise<Report> {
  const p = pairs[0]
  const address = p.baseToken.address
  const chainId = p.chainId
  const evm = /^0x[0-9a-fA-F]{40}$/.test(address)
  const gpChain = goplusChain(chainId)
  const sources: string[] = ['DexScreener']
  const failed: string[] = []
  const F: Finding[] = []
  const good: T[] = []
  let checks = 0
  const add = (sev: Sev, cat: Cat, t: T, d: T) => F.push({ sev, cat, t, d })

  const [gpRes, hpRes, codeRes, implRes, copyRes] = await Promise.allSettled([
    gpChain
      ? getJson(gpChain === 'solana' ? 'https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=' + address : `https://api.gopluslabs.io/api/v1/token_security/${gpChain}?contract_addresses=${address}`)
      : Promise.reject(new Error('unsupported')),
    HONEYPOT_IS[chainId] ? getJson(`https://api.honeypot.is/v2/IsHoneypot?address=${address}&chainID=${HONEYPOT_IS[chainId]}`) : Promise.reject(new Error('unsupported')),
    evm && (CHAINS as Record<string, { rpc?: string }>)[chainId]?.rpc ? rpc((CHAINS as Record<string, { rpc?: string }>)[chainId].rpc!, 'eth_getCode', [address, 'latest']) : Promise.reject(new Error('unsupported')),
    evm && (CHAINS as Record<string, { rpc?: string }>)[chainId]?.rpc ? rpc((CHAINS as Record<string, { rpc?: string }>)[chainId].rpc!, 'eth_getStorageAt', [address, IMPL_SLOT, 'latest']) : Promise.reject(new Error('unsupported')),
    searchPairs(p.baseToken.symbol),
  ])

  // ---------- GoPlus contract and holder checks ----------
  let g: any = null
  if (gpRes.status === 'fulfilled') {
    const r = gpRes.value?.result || {}
    g = r[address] || r[address.toLowerCase()] || Object.values(r)[0] || null
    if (g) sources.push('GoPlus Security')
  } else if (gpChain) failed.push('GoPlus Security')

  let owned = true
  if (g && gpChain !== 'solana') {
    checks += 22
    const ownerAddr = String(g.owner_address ?? '')
    const renounced = (!ownerAddr || DEAD.test(ownerAddr)) && !yes(g.hidden_owner) && !yes(g.can_take_back_ownership)
    owned = !renounced
    const ownerSev = (s: Sev): Sev => (owned ? s : 'low')
    const ownerNote: T = owned ? { en: 'The owner can use this at any time.', nl: 'De owner kan dit op elk moment gebruiken.' } : { en: 'Ownership is renounced, so nobody can use it anymore.', nl: 'Ownership is opgegeven, dus niemand kan dit nog gebruiken.' }

    if (yes(g.is_honeypot)) add('critical', 'scam', { en: 'Honeypot: tokens cannot be sold', nl: 'Honeypot: tokens kunnen niet verkocht worden' }, { en: 'Buyers are unable to sell. This is a classic scam.', nl: 'Kopers kunnen niet verkopen. Dit is een klassieke scam.' })
    if (yes(g.cannot_sell_all)) add('critical', 'scam', { en: 'You cannot sell all your tokens', nl: 'Je kunt niet al je tokens verkopen' }, { en: 'The contract blocks selling your full balance.', nl: 'Het contract blokkeert het verkopen van je volledige saldo.' })
    if (yes(g.cannot_buy)) add('high', 'contract', { en: 'Buying is blocked', nl: 'Kopen is geblokkeerd' }, { en: 'The contract currently does not allow buys.', nl: 'Het contract staat op dit moment geen aankopen toe.' })
    if (yes(g.fake_token)) add('critical', 'scam', { en: 'Flagged as a fake token', nl: 'Gemarkeerd als nep-token' }, { en: 'GoPlus marks this token as an imitation of a known token.', nl: 'GoPlus markeert dit token als imitatie van een bekend token.' })
    if (yes(g.is_airdrop_scam)) add('critical', 'scam', { en: 'Airdrop scam', nl: 'Airdrop-scam' }, { en: 'Tokens like this are sent unasked to lure wallets to phishing sites. Do not interact.', nl: 'Zulke tokens worden ongevraagd gestuurd om wallets naar phishingsites te lokken. Doe er niets mee.' })
    if (yes(g.honeypot_with_same_creator)) add('high', 'scam', { en: 'Creator made honeypots before', nl: 'Maker heeft eerder honeypots gemaakt' }, { en: 'The deployer of this token also created known honeypot tokens.', nl: 'De maker van dit token heeft ook bekende honeypot-tokens gemaakt.' })
    if (yes(g.hidden_owner)) add('critical', 'contract', { en: 'Hidden owner', nl: 'Verborgen owner' }, { en: 'Someone keeps control while ownership looks renounced.', nl: 'Iemand houdt controle terwijl ownership opgegeven lijkt.' })
    if (yes(g.can_take_back_ownership)) add('high', 'contract', { en: 'Ownership can be taken back', nl: 'Ownership kan worden teruggenomen' }, { en: 'A renounced owner can regain control.', nl: 'Een opgegeven owner kan de controle terugkrijgen.' })
    if (yes(g.owner_change_balance)) add(ownerSev('critical'), 'contract', { en: 'Owner can change balances', nl: 'Owner kan saldi wijzigen' }, ownerNote)
    if (yes(g.selfdestruct)) add('high', 'contract', { en: 'Self-destruct function', nl: 'Self-destruct-functie' }, { en: 'The contract can be destroyed, which can make tokens worthless.', nl: 'Het contract kan worden vernietigd, waardoor tokens waardeloos kunnen worden.' })
    if (g.is_open_source !== undefined && !yes(g.is_open_source)) add('high', 'contract', { en: 'Source code not verified', nl: 'Broncode niet geverifieerd' }, { en: 'Nobody can check what the contract really does.', nl: 'Niemand kan controleren wat het contract echt doet.' })
    else if (yes(g.is_open_source)) good.push({ en: 'Source code verified', nl: 'Broncode geverifieerd' })
    if (yes(g.is_mintable)) add(ownerSev('high'), 'contract', { en: 'New tokens can be minted', nl: 'Er kunnen nieuwe tokens gemaakt worden' }, ownerNote)
    if (yes(g.is_proxy)) add(ownerSev('medium'), 'contract', { en: 'Upgradeable contract (proxy)', nl: 'Aanpasbaar contract (proxy)' }, { en: 'The code can be replaced later. ' + ownerNote.en, nl: 'De code kan later worden vervangen. ' + ownerNote.nl })
    if (yes(g.slippage_modifiable)) add(ownerSev('high'), 'contract', { en: 'Taxes can be changed', nl: 'Taxes kunnen worden aangepast' }, { en: 'Buy and sell tax can be raised, up to blocking sells. ' + ownerNote.en, nl: 'Buy- en sell tax kunnen worden verhoogd, tot verkopen blokkeren aan toe. ' + ownerNote.nl })
    if (yes(g.personal_slippage_modifiable)) add(ownerSev('high'), 'contract', { en: 'Tax per wallet can be set', nl: 'Tax per wallet instelbaar' }, ownerNote)
    if (yes(g.transfer_pausable)) add(ownerSev('medium'), 'contract', { en: 'Trading can be paused', nl: 'Handel kan worden gepauzeerd' }, ownerNote)
    if (yes(g.is_blacklisted)) add(ownerSev('medium'), 'contract', { en: 'Blacklist function', nl: 'Blacklist-functie' }, { en: 'Wallets can be blocked from trading. ' + ownerNote.en, nl: 'Wallets kunnen worden geblokkeerd. ' + ownerNote.nl })
    if (yes(g.trading_cooldown)) add('medium', 'contract', { en: 'Trading cooldown', nl: 'Trading-cooldown' }, { en: 'You may have to wait between trades.', nl: 'Je moet mogelijk wachten tussen trades.' })
    if (yes(g.external_call)) add('medium', 'contract', { en: 'Calls external contracts', nl: 'Roept externe contracten aan' }, { en: 'Behaviour can depend on other contracts.', nl: 'Het gedrag kan afhangen van andere contracten.' })
    if (yes(g.anti_whale_modifiable)) add(ownerSev('low'), 'contract', { en: 'Max transaction size can be changed', nl: 'Maximale transactiegrootte aanpasbaar' }, ownerNote)
    const buy = num(g.buy_tax), sell = num(g.sell_tax)
    if (sell !== null && sell >= 0.5) add('critical', 'scam', { en: `Sell tax ${(sell * 100).toFixed(0)}%`, nl: `Sell tax ${(sell * 100).toFixed(0)}%` }, { en: 'At least half of every sell goes to the contract.', nl: 'Minstens de helft van elke verkoop gaat naar het contract.' })
    else if ((sell ?? 0) > 0.1 || (buy ?? 0) > 0.1) add('high', 'contract', { en: `High taxes: buy ${((buy ?? 0) * 100).toFixed(1)}%, sell ${((sell ?? 0) * 100).toFixed(1)}%`, nl: `Hoge taxes: buy ${((buy ?? 0) * 100).toFixed(1)}%, sell ${((sell ?? 0) * 100).toFixed(1)}%` }, { en: 'You lose more than 10% on a trade.', nl: 'Je verliest meer dan 10% per trade.' })
    else if ((sell ?? 0) > 0 || (buy ?? 0) > 0) add('low', 'contract', { en: `Taxes: buy ${((buy ?? 0) * 100).toFixed(1)}%, sell ${((sell ?? 0) * 100).toFixed(1)}%`, nl: `Taxes: buy ${((buy ?? 0) * 100).toFixed(1)}%, sell ${((sell ?? 0) * 100).toFixed(1)}%` }, { en: 'A fee is charged on every trade.', nl: 'Er wordt bij elke trade een vergoeding ingehouden.' })
    if (renounced) good.push({ en: 'Ownership renounced', nl: 'Ownership opgegeven' })
    try {
      const cex = typeof g.is_in_cex === 'string' ? JSON.parse(g.is_in_cex) : g.is_in_cex
      if (cex && yes(cex.listed) && Array.isArray(cex.cex_list) && cex.cex_list.length) good.push({ en: 'Listed on ' + cex.cex_list.slice(0, 3).join(', '), nl: 'Genoteerd op ' + cex.cex_list.slice(0, 3).join(', ') })
    } catch {
      /* ignore */
    }
    if (yes(g.trust_list)) good.push({ en: 'On the GoPlus trust list', nl: 'Op de GoPlus trust list' })

    // Holders: exclude burn addresses, locked wallets, contracts (LP pools, vesting) from concentration
    const holders: any[] = Array.isArray(g.holders) ? g.holders : []
    const top = holders.filter((h) => !DEAD.test(String(h.address)) && !yes(h.is_locked) && !yes(h.is_contract)).slice(0, 10).reduce((s, h) => s + Number(h.percent || 0), 0) * 100
    if (holders.length) {
      if (top > 70) add('high', 'holders', { en: `Top wallets own ${top.toFixed(0)}%`, nl: `Top-wallets bezitten ${top.toFixed(0)}%` }, { en: 'A few wallets can crash the price by selling.', nl: 'Een paar wallets kunnen de koers laten crashen door te verkopen.' })
      else if (top > 40) add('medium', 'holders', { en: `Top wallets own ${top.toFixed(0)}%`, nl: `Top-wallets bezitten ${top.toFixed(0)}%` }, { en: 'Supply is concentrated in few wallets (excluding pools, locks and burns).', nl: 'De supply zit bij weinig wallets (exclusief pools, locks en burns).' })
    }
    const creator = num(g.creator_percent), owner = num(g.owner_percent)
    const insider = Math.max(creator ?? 0, owner ?? 0) * 100
    if (insider > 20) add('high', 'holders', { en: `Creator or owner holds ${insider.toFixed(0)}%`, nl: `Maker of owner bezit ${insider.toFixed(0)}%` }, { en: 'The team can dump a large part of the supply.', nl: 'Het team kan een groot deel van de supply verkopen.' })
    else if (insider > 5) add('medium', 'holders', { en: `Creator or owner holds ${insider.toFixed(0)}%`, nl: `Maker of owner bezit ${insider.toFixed(0)}%` }, { en: 'A notable share sits with the team.', nl: 'Een flink deel zit bij het team.' })
    const hc = num(g.holder_count)
    if (hc !== null && hc < 100) add('medium', 'holders', { en: `Only ${hc} holders`, nl: `Maar ${hc} holders` }, { en: 'Very few people hold this token.', nl: 'Heel weinig mensen bezitten dit token.' })
    else if (hc !== null && hc > 10000) good.push({ en: `${hc.toLocaleString('en-US')} holders`, nl: `${hc.toLocaleString('nl-NL')} holders` })

    // Liquidity lock (classic AMM LP tokens only)
    const lp: any[] = Array.isArray(g.lp_holders) ? g.lp_holders : []
    if (lp.length) {
      const safe = lp.filter((h) => yes(h.is_locked) || DEAD.test(String(h.address)) || String(h.address).toLowerCase() === address.toLowerCase()).reduce((s, h) => s + Number(h.percent || 0), 0) * 100
      if (safe < 50) add('high', 'liquidity', { en: `Only ${safe.toFixed(0)}% of liquidity locked or burned`, nl: `Maar ${safe.toFixed(0)}% van de liquidity gelockt of verbrand` }, { en: 'The rest can be withdrawn at any time (rug pull risk).', nl: 'De rest kan op elk moment worden weggehaald (rug pull-risico).' })
      else if (safe < 90) add('medium', 'liquidity', { en: `${safe.toFixed(0)}% of liquidity locked or burned`, nl: `${safe.toFixed(0)}% van de liquidity gelockt of verbrand` }, { en: 'Part of the liquidity can still be withdrawn.', nl: 'Een deel van de liquidity kan nog worden weggehaald.' })
      else good.push({ en: `${safe.toFixed(0)}% of liquidity locked, burned or held by the token contract`, nl: `${safe.toFixed(0)}% van de liquidity gelockt, verbrand of in het tokencontract` })
    }
  }

  if (g && gpChain === 'solana') {
    checks += 12
    const st = (o: any) => yes(o?.status)
    if (st(g.balance_mutable_authority)) add('critical', 'contract', { en: 'Balances can be changed', nl: 'Saldi kunnen worden gewijzigd' }, { en: 'An authority can change wallet balances.', nl: 'Een authority kan saldi van wallets wijzigen.' })
    if (yes(g.non_transferable)) add('critical', 'scam', { en: 'Token cannot be transferred', nl: 'Token kan niet worden overgemaakt' }, { en: 'You cannot sell or send it.', nl: 'Je kunt het niet verkopen of versturen.' })
    if (String(g.default_account_state) === '2') add('critical', 'scam', { en: 'New accounts start frozen', nl: 'Nieuwe accounts starten bevroren' }, { en: 'Buyers can be blocked from selling.', nl: 'Kopers kunnen worden geblokkeerd bij verkopen.' })
    if (st(g.freezable)) add('high', 'contract', { en: 'Freeze authority active', nl: 'Freeze authority actief' }, { en: 'Your tokens can be frozen so you cannot sell.', nl: 'Je tokens kunnen worden bevroren zodat je niet kunt verkopen.' })
    else good.push({ en: 'No freeze authority', nl: 'Geen freeze authority' })
    if (st(g.mintable)) add('high', 'contract', { en: 'Mint authority active', nl: 'Mint authority actief' }, { en: 'Unlimited new tokens can be created.', nl: 'Er kunnen onbeperkt nieuwe tokens worden gemaakt.' })
    else good.push({ en: 'Mint authority renounced', nl: 'Mint authority opgegeven' })
    if (st(g.closable)) add('medium', 'contract', { en: 'Token can be closed', nl: 'Token kan worden gesloten' }, { en: 'The mint can be closed by an authority.', nl: 'De mint kan door een authority worden gesloten.' })
    if (Array.isArray(g.transfer_hook) && g.transfer_hook.length) add('high', 'contract', { en: 'Transfer hook', nl: 'Transfer hook' }, { en: 'Custom code runs on every transfer and can block sells.', nl: 'Bij elke transfer draait extra code die verkopen kan blokkeren.' })
    const fee = g.transfer_fee && typeof g.transfer_fee === 'object' ? num(g.transfer_fee.fee_rate ?? g.transfer_fee.current_fee_rate) : null
    if (fee !== null && fee > 0) add(fee > 0.1 ? 'high' : 'low', 'contract', { en: `Transfer fee ${(fee * 100).toFixed(1)}%`, nl: `Transfer fee ${(fee * 100).toFixed(1)}%` }, { en: 'A fee is taken on every transfer.', nl: 'Bij elke transfer wordt een fee ingehouden.' })
    if (st(g.transfer_fee_upgradable)) add('medium', 'contract', { en: 'Transfer fee can be changed', nl: 'Transfer fee aanpasbaar' }, { en: 'The fee can be raised later.', nl: 'De fee kan later worden verhoogd.' })
    if (yes(g.trusted_token)) good.push({ en: 'Trusted token (GoPlus)', nl: 'Vertrouwd token (GoPlus)' })
    const holders: any[] = Array.isArray(g.holders) ? g.holders : []
    const top = holders.slice(0, 10).reduce((s, h) => s + Number(h.percent || 0), 0) * 100
    if (top > 70) add('high', 'holders', { en: `Top 10 wallets own ${top.toFixed(0)}%`, nl: `Top 10 wallets bezitten ${top.toFixed(0)}%` }, { en: 'Includes pools and exchanges; check who they are.', nl: 'Inclusief pools en exchanges; controleer wie het zijn.' })
    const hc = num(g.holder_count)
    if (hc !== null && hc > 10000) good.push({ en: `${hc.toLocaleString('en-US')} holders`, nl: `${hc.toLocaleString('nl-NL')} holders` })
  }

  // ---------- Honeypot.is buy/sell simulation ----------
  if (hpRes.status === 'fulfilled' && hpRes.value?.simulationSuccess !== undefined) {
    sources.push('Honeypot.is')
    checks += 3
    const h = hpRes.value
    if (h.honeypotResult?.isHoneypot) add('critical', 'scam', { en: 'Sell simulation failed (honeypot)', nl: 'Verkoopsimulatie mislukt (honeypot)' }, { en: h.honeypotResult?.honeypotReason || 'A simulated sell did not go through.', nl: h.honeypotResult?.honeypotReason || 'Een gesimuleerde verkoop ging niet door.' })
    else if (h.simulationSuccess) {
      const bt = Number(h.simulationResult?.buyTax ?? 0).toFixed(1), stx = Number(h.simulationResult?.sellTax ?? 0).toFixed(1)
      good.push({ en: `Buy and sell simulation passed (tax ${bt}% / ${stx}%)`, nl: `Koop- en verkoopsimulatie geslaagd (tax ${bt}% / ${stx}%)` })
    }
    const ha = h.holderAnalysis
    if (ha && Number(ha.holders) > 20 && Number(ha.failed) / Number(ha.holders) > 0.1) add('high', 'scam', { en: `${ha.failed} of ${ha.holders} holders cannot sell`, nl: `${ha.failed} van ${ha.holders} holders kunnen niet verkopen` }, { en: 'Simulated sells from real holder wallets failed.', nl: 'Gesimuleerde verkopen vanuit echte holder-wallets mislukten.' })
  } else if (HONEYPOT_IS[chainId]) failed.push('Honeypot.is')

  // ---------- Own bytecode scan ----------
  let audit: Report['audit']
  if (codeRes.status === 'fulfilled' && typeof codeRes.value === 'string' && codeRes.value.length > 2) {
    sources.push('On-chain bytecode')
    checks += 4
    const scan = scanBytecode(codeRes.value)
    let implementation: string | undefined
    if (implRes.status === 'fulfilled' && typeof implRes.value === 'string' && !/^0x0*$/.test(implRes.value)) implementation = '0x' + implRes.value.slice(-40)
    audit = { ...scan, implementation }
    if (implementation && !(g && yes(g.is_proxy))) add(owned ? 'medium' : 'low', 'contract', { en: 'Upgradeable contract (EIP-1967 proxy)', nl: 'Aanpasbaar contract (EIP-1967-proxy)' }, { en: `The code lives at ${short(implementation)} and can be swapped.`, nl: `De code staat op ${short(implementation)} en kan worden vervangen.` })
    if (scan.selfdestruct && !(g && yes(g.selfdestruct))) add('medium', 'contract', { en: 'SELFDESTRUCT opcode in bytecode', nl: 'SELFDESTRUCT-opcode in bytecode' }, { en: 'The contract may be able to destroy itself.', nl: 'Het contract kan zichzelf mogelijk vernietigen.' })
    const risky = scan.functions.filter((f) => ['set balance', 'blacklist (bots)'].includes(f))
    if (risky.length && owned) add('medium', 'contract', { en: 'Owner functions: ' + risky.join(', '), nl: 'Owner-functies: ' + risky.join(', ') }, { en: 'Found in the bytecode. Check who controls them.', nl: 'Gevonden in de bytecode. Controleer wie ze beheert.' })
  } else if (evm && (CHAINS as Record<string, { rpc?: string }>)[chainId]?.rpc) failed.push('On-chain bytecode')

  // ---------- Market and liquidity (DexScreener) ----------
  checks += 6
  const liq = pairs.reduce((s, x) => s + (x.liquidity?.usd ?? 0), 0)
  if (liq < 10000) add('high', 'liquidity', { en: `Very low liquidity ($${Math.round(liq).toLocaleString('en-US')})`, nl: `Zeer lage liquidity ($${Math.round(liq).toLocaleString('nl-NL')})` }, { en: 'Small trades move the price a lot and you may not be able to exit.', nl: 'Kleine trades bewegen de prijs sterk en je komt er mogelijk niet meer uit.' })
  else if (liq < 50000) add('medium', 'liquidity', { en: `Low liquidity ($${Math.round(liq).toLocaleString('en-US')})`, nl: `Lage liquidity ($${Math.round(liq).toLocaleString('nl-NL')})` }, { en: 'Expect high slippage.', nl: 'Reken op veel slippage.' })
  else if (liq > 1e6) good.push({ en: 'Liquidity above $1M', nl: 'Liquidity boven $1M' })
  const created = Math.min(...pairs.map((x) => x.pairCreatedAt || Infinity))
  if (isFinite(created)) {
    const days = (Date.now() - created) / 864e5
    if (days < 1) add('high', 'liquidity', { en: 'Less than a day old', nl: 'Minder dan een dag oud' }, { en: 'Most scams happen in the first hours after launch.', nl: 'De meeste scams gebeuren in de eerste uren na de lancering.' })
    else if (days < 7) add('medium', 'liquidity', { en: 'Less than a week old', nl: 'Minder dan een week oud' }, { en: 'No track record yet.', nl: 'Nog geen trackrecord.' })
    else if (days > 365) good.push({ en: 'Trading for more than a year', nl: 'Langer dan een jaar verhandeld' })
  }
  const tx = p.txns?.h24
  if (tx && tx.buys >= 50 && tx.sells <= tx.buys * 0.03) add('high', 'scam', { en: `${tx.buys} buys but only ${tx.sells} sells today`, nl: `${tx.buys} aankopen maar maar ${tx.sells} verkopen vandaag` }, { en: 'Almost nobody is selling: a common honeypot sign.', nl: 'Bijna niemand verkoopt: een veelvoorkomend honeypot-signaal.' })
  const vol = p.volume?.h24 ?? 0
  if (liq > 0 && vol / liq > 20) add('medium', 'liquidity', { en: 'Volume is extremely high vs liquidity', nl: 'Volume extreem hoog t.o.v. liquidity' }, { en: 'Can indicate wash trading or bots.', nl: 'Kan wijzen op wash trading of bots.' })
  if ((p.priceChange?.h24 ?? 0) > 300) add('medium', 'liquidity', { en: `+${p.priceChange!.h24!.toFixed(0)}% in 24h`, nl: `+${p.priceChange!.h24!.toFixed(0)}% in 24 uur` }, { en: 'Extreme pumps are often followed by a dump.', nl: 'Extreme pumps worden vaak gevolgd door een dump.' })
  if ((p.fdv ?? 0) > 0 && liq > 0 && (p.fdv ?? 0) / liq > 200) add('medium', 'liquidity', { en: 'Valuation far above liquidity', nl: 'Waardering ver boven liquidity' }, { en: 'The market cap cannot be realised by selling.', nl: 'De marktwaarde kan niet echt verkocht worden.' })
  if (!p.info?.websites?.length && !p.info?.socials?.length) add('low', 'scam', { en: 'No website or socials listed', nl: 'Geen website of socials vermeld' }, { en: 'Anonymous projects carry more risk.', nl: 'Anonieme projecten hebben meer risico.' })

  // ---------- Copycat check ----------
  if (copyRes.status === 'fulfilled') {
    checks += 1
    const sym = p.baseToken.symbol.toLowerCase()
    const rival = copyRes.value.find((x) => x.baseToken.symbol.toLowerCase() === sym && x.baseToken.address.toLowerCase() !== address.toLowerCase() && (x.liquidity?.usd ?? 0) > Math.max(liq * 20, 100000) && (x.pairCreatedAt ?? Infinity) < created)
    if (rival) add('high', 'scam', { en: `Possible copycat of ${rival.baseToken.name}`, nl: `Mogelijke kopie van ${rival.baseToken.name}` }, { en: `A much larger ${rival.baseToken.symbol} exists at ${short(rival.baseToken.address)} (${rival.chainId}). Check you have the right contract.`, nl: `Er bestaat een veel grotere ${rival.baseToken.symbol} op ${short(rival.baseToken.address)} (${rival.chainId}). Controleer of je het juiste contract hebt.` })
  }

  const order: Sev[] = ['critical', 'high', 'medium', 'low']
  F.sort((a, b) => order.indexOf(a.sev) - order.indexOf(b.sev))
  const score = Math.min(100, F.reduce((s, f) => s + W[f.sev], 0))
  const grade: Grade = F.some((f) => f.sev === 'critical') || score >= 60 ? 'critical' : score >= 35 ? 'high' : score >= 15 ? 'medium' : 'low'
  return { score, grade, findings: F, good, sources, failed, audit, checks }
}
