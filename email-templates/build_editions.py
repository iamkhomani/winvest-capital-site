import importlib.util, contextlib, io, os
spec = importlib.util.spec_from_file_location('b', 'build.py'); b = importlib.util.module_from_spec(spec)
with contextlib.redirect_stdout(io.StringIO()): spec.loader.exec_module(b)
F=b.FONT; INK=b.INK; MUTED=b.MUTED; RED=b.RED; LINE=b.LINE
PAY='https://go.paybotapp.com/RTTDqS3p/rCK4CxHl'; UP='#1E7B4A'; DOWN='#9E1B12'

def price_table(rows, note):
    head = f'<tr><td style="padding:0 0 8px;font-family:{F};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:{MUTED}">Asset</td><td align="right" style="padding:0 0 8px;font-family:{F};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:{MUTED}">Price</td><td align="right" style="padding:0 0 8px 12px;font-family:{F};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:{MUTED}">2 weeks</td></tr>'
    body = ''.join(b.row(name, '[price]', chg, UP if up else DOWN) for name, chg, up in rows)
    return b.p(note, muted=True, size=13) + f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px">{head}{body}</table>'

def section_label(t): return f'<p style="margin:0 0 6px;font-family:{F};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:{RED}">{t}</p>'

def discord_events(what):
    return b.card(
      f'<p style="margin:0 0 6px;font-family:{F};font-size:17px;font-weight:800;color:{INK}">Key events this week</p>' +
      b.p(f'{what} We post the dates, times and what to watch for in our Discord, so you can plan your trades around them.', size=15) +
      b.btn('See this week’s events in Discord', b.DISCORD))

def focus(n):
    return b.card(
      section_label(f'Focus {n}') +
      f'<p style="margin:0 0 12px;font-family:{F};font-size:19px;font-weight:800;color:{INK}">[Project or topic name]</p>' +
      b.p('<strong>What it is:</strong> [Two or three sentences explaining the project or topic in plain language.]', size=15) +
      b.p('<strong>Why it is on our radar:</strong> [What changed or why it matters right now.]', size=15) +
      b.p(f'<strong>What we are watching:</strong> [Key levels, structure or upcoming catalysts. <span style="color:{UP}">▲</span> bullish if …, <span style="color:{DOWN}">▼</span> bearish if …]', size=15) +
      b.p('<strong>Risks:</strong> [What could invalidate the idea.]', size=15))

def pitch(topic):
    return (b.h2('Trade it together') +
      b.p(f'Want to discuss {topic} with likeminded traders? Join the free Winvest Capital Discord: daily setups, the SMC guides and Market Whisper AI with your member card, news, FX calendar events and the lot size calculator.') +
      b.btn('Join the Discord, free', b.DISCORD, secondary=True) +
      b.card(
        section_label('One Percent Club') +
        f'<p style="margin:0 0 10px;font-family:{F};font-size:19px;font-weight:800;color:{INK}">Go from tools to personal guidance</p>' +
        b.p('The One Percent Club adds the projects I am looking at, my time to research and analyse assets and charts with you, and the full Market Whisper AI toolkit: interactive conversations about the markets, plus market and fundamental analysis.', size=15) +
        f'<p style="margin:0;font-family:{F};font-size:22px;font-weight:800;color:{INK}">€150 <span style="font-size:14px;font-weight:600;color:{MUTED}">one-time payment, no subscription</span></p>' +
        b.btn('Join the One Percent Club', PAY), accent=True) +
      b.rule() + b.p('This edition shares scenarios and education, not recommendations or financial advice. Always do your own research and manage your risk.', muted=True, size=13))

crypto = (b.kicker('Crypto Radar · Edition [#] · [date]') + b.h1('[Headline: the main crypto theme of these two weeks]') +
  b.p('[Two or three sentences on the big picture in crypto: what moved, what the market is focused on.]') +
  b.h2('Top crypto prices') +
  price_table([('Bitcoin (BTC)','[▲ +0.0%]',1),('Ethereum (ETH)','[▼ −0.0%]',0),('XRP','[▲ +0.0%]',1),('BNB','[▲ +0.0%]',1),('Solana (SOL)','[▼ −0.0%]',0)],
              'Prices in USD at [time, date]. Change over the last two weeks.') +
  discord_events('Token unlocks, network upgrades, ETF news and macro data can move crypto fast.') +
  b.h2('On the radar this edition') + focus(1) + focus(2) +
  pitch('these projects'))

stocks = (b.kicker('Stock Watch · Edition [#] · [date]') + b.h1('[Headline: the main stock market theme of these two weeks]') +
  b.p('[Two or three sentences on the big picture in stocks: what moved, what the market is focused on.]') +
  b.h2('Indices') +
  price_table([('S&amp;P 500','[▲ +0.0%]',1),('Nasdaq 100','[▲ +0.0%]',1),('Dow Jones','[▼ −0.0%]',0)], 'Levels at [time, date]. Change over the last two weeks.') +
  b.h2('Largest stocks') +
  price_table([('Nvidia (NVDA)','[▲ +0.0%]',1),('Apple (AAPL)','[▲ +0.0%]',1),('Microsoft (MSFT)','[▼ −0.0%]',0),('Alphabet (GOOGL)','[▲ +0.0%]',1),('Amazon (AMZN)','[▲ +0.0%]',1)],
              'Prices in USD at [time, date]. Change over the last two weeks.') +
  discord_events('Earnings reports, interest rate decisions, inflation and jobs data can move stocks fast.') +
  b.h2('On the watchlist this edition') + focus(1) + focus(2) +
  pitch('these stocks'))

os.makedirs('listmonk', exist_ok=True)
open('listmonk/crypto-radar-body.html','w').write(crypto)
open('listmonk/stock-watch-body.html','w').write(stocks)
# previews with the full layout
for k, body, pre in [('crypto-radar', crypto, '[Preview line]'), ('stock-watch', stocks, '[Preview line]')]:
    open(f'preview-{k}.html','w').write(b.layout(pre, body))
print(len(crypto), len(stocks))
