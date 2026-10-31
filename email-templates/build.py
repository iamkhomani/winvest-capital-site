# Builds Winvest Capital branded HTML emails (table layout, inline styles, MailerLite merge tags).
RED='#DA291C'; INK='#141414'; SURFACE='#F5F3EF'; WHITE='#FFFFFF'; MUTED='#5F5B55'; LINE='#E4E0D8'
FONT="Inter,'Segoe UI',Helvetica,Arial,sans-serif"
SITE='https://winvestcapital.nl'; DISCORD='https://discord.gg/2ApK2MSnxZ'; LOGO=SITE+'/logo.jpeg'
SLOGAN='Elevate your trades, empower your future.'

def btn(label, href, secondary=False):
    bg = WHITE if secondary else RED; fg = INK if secondary else WHITE; border = INK if secondary else RED
    return f'''<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px"><tr><td style="border-radius:999px;background:{bg};border:2px solid {border}"><a href="{href}" style="display:inline-block;padding:13px 26px;font-family:{FONT};font-size:15px;font-weight:700;color:{fg};text-decoration:none;border-radius:999px">{label}</a></td></tr></table>'''

def h1(t): return f'<h1 style="margin:0 0 16px;font-family:{FONT};font-size:28px;line-height:1.2;font-weight:800;color:{INK};letter-spacing:-0.5px">{t}</h1>'
def h2(t): return f'<h2 style="margin:32px 0 12px;font-family:{FONT};font-size:19px;line-height:1.3;font-weight:800;color:{INK}">{t}</h2>'
def p(t, muted=False, size=16): return f'<p style="margin:0 0 16px;font-family:{FONT};font-size:{size}px;line-height:1.6;color:{MUTED if muted else INK}">{t}</p>'
def kicker(t): return f'<p style="margin:0 0 10px;font-family:{FONT};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:{RED}">{t}</p>'
def a(label, href): return f'<a href="{href}" style="color:{RED};font-weight:600;text-decoration:underline">{label}</a>'
def rule(): return f'<div style="height:1px;background:{LINE};margin:28px 0;line-height:1px;font-size:1px">&nbsp;</div>'

def steps(items):
    rows=''
    for i,(title,desc,link,label) in enumerate(items,1):
        rows+=f'''<tr><td valign="top" style="padding:0 14px 18px 0;width:36px"><div style="width:32px;height:32px;line-height:32px;border-radius:999px;background:{RED};color:{WHITE};font-family:{FONT};font-weight:800;font-size:15px;text-align:center">{i}</div></td>
<td valign="top" style="padding:0 0 18px"><p style="margin:2px 0 4px;font-family:{FONT};font-size:16px;font-weight:700;color:{INK}">{title}</p><p style="margin:0;font-family:{FONT};font-size:15px;line-height:1.55;color:{MUTED}">{desc} {a(label, link) if link else ''}</p></td></tr>'''
    return f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:8px 0">{rows}</table>'

def card(inner, accent=False):
    border = RED if accent else LINE; bg = '#FDF2F1' if accent else SURFACE
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 16px"><tr><td style="background:{bg};border:1px solid {border};border-left:4px solid {RED if accent else INK};border-radius:12px;padding:20px 22px">{inner}</td></tr></table>'

def layout(preheader, body):
    return f'''<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">
<title>Winvest Capital</title>
<!--[if !mso]><!--><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"><!--<![endif]-->
<style>
body{{margin:0;padding:0;background:{SURFACE}}} a{{color:{RED}}}
@media (max-width:620px){{.wc-pad{{padding-left:22px!important;padding-right:22px!important}} .wc-h1 h1{{font-size:24px!important}}}}
</style>
</head>
<body style="margin:0;padding:0;background:{SURFACE}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">{preheader}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{SURFACE}">
<tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">
<tr><td style="padding:0 4px 18px">
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
 <td><a href="{SITE}" style="text-decoration:none"><img src="{LOGO}" width="40" height="40" alt="Winvest Capital" style="display:inline-block;vertical-align:middle;border-radius:999px;border:0"><span style="display:inline-block;vertical-align:middle;margin-left:10px;font-family:{FONT};font-size:18px;font-weight:800;color:{INK};letter-spacing:-0.3px">WINVEST <span style="color:{RED};font-weight:600;letter-spacing:2px">CAPITAL</span></span></a></td>
 <td align="right" style="font-family:{FONT};font-size:12px;color:{MUTED}"><a href="{{$url}}" style="color:{MUTED};text-decoration:underline">View in browser</a></td>
 </tr></table>
</td></tr>
<tr><td style="background:{RED};height:4px;line-height:4px;font-size:4px;border-radius:12px 12px 0 0">&nbsp;</td></tr>
<tr><td class="wc-pad wc-h1" style="background:{WHITE};padding:40px 44px 32px;border-radius:0 0 12px 12px">
{body}
</td></tr>
<tr><td style="padding:24px 4px 0">
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{INK};border-radius:12px"><tr><td style="padding:26px 28px">
  <p style="margin:0 0 6px;font-family:{FONT};font-size:16px;font-weight:800;color:{WHITE}">{SLOGAN}</p>
  <p style="margin:0 0 16px;font-family:{FONT};font-size:13px;color:#BDB8B0">
   <a href="{SITE}" style="color:{WHITE};text-decoration:none">Website</a> &nbsp;·&nbsp; <a href="{DISCORD}" style="color:{WHITE};text-decoration:none">Discord</a> &nbsp;·&nbsp; <a href="{SITE}/learn/" style="color:{WHITE};text-decoration:none">Learn</a> &nbsp;·&nbsp; <a href="{SITE}/lot-size-calculator/" style="color:{WHITE};text-decoration:none">Lot size calculator</a></p>
  <p style="margin:0 0 12px;font-family:{FONT};font-size:12px;line-height:1.55;color:#9A958D">Everything Winvest Capital shares is for educational purposes only and is not financial advice. Trading stocks, crypto and FX carries a high risk of loss. Only risk what you can afford to lose.</p>
  <p style="margin:0;font-family:{FONT};font-size:12px;line-height:1.55;color:#9A958D">You receive this email because you subscribed on winvestcapital.nl. <a href="{{$unsubscribe}}" style="color:{WHITE};text-decoration:underline">Unsubscribe</a></p>
 </td></tr></table>
</td></tr>
</table>
</td></tr></table>
</body></html>'''

emails = {}

emails['welcome-1'] = dict(
 subject='Welcome to Winvest Capital',
 preheader='Your next steps: the free Discord, the SMC guides and the lot size calculator.',
 body = kicker('Welcome') + h1('You are in. Here is where to start.') +
  p('Thank you for subscribing to Winvest Capital. Every two weeks you will receive a market update with the key levels, the events that matter and what we are watching across crypto, stocks and FX.') +
  p('Until the first update lands, three things to do today:') +
  steps([
   ('Join the free Discord','Our community of likeminded traders, where we discuss setups every day. Free for everyone.',DISCORD,'Open the Discord'),
   ('Learn the SMC basics','Seven short guides, from market structure to order blocks and risk management.',SITE+'/learn/','Start the guides'),
   ('Size every trade correctly','Work out your lot size from your balance, risk and stop loss.',SITE+'/lot-size-calculator/','Open the calculator'),
  ]) + btn('Join the Discord, free', DISCORD) +
  rule() + p('Questions or feedback? Just reply to this email.', muted=True, size=14),
 plain=f'''Welcome to Winvest Capital

Thank you for subscribing. Every two weeks you will receive a market update with the key levels, the events that matter and what we are watching across crypto, stocks and FX.

Three things to do today:
1. Join the free Discord: {DISCORD}
2. Learn the SMC basics: {SITE}/learn/
3. Size every trade correctly with the lot size calculator: {SITE}/lot-size-calculator/

Questions or feedback? Just reply to this email.

{SLOGAN}
Educational only. Not financial advice.
Unsubscribe: {{$unsubscribe}}''')

emails['welcome-2'] = dict(
 subject='The SMC learning path, step by step',
 preheader='Seven guides in the right order, from market structure to risk management.',
 body = kicker('Learn') + h1('Smart Money Concepts, in the right order') +
  p('Most traders learn SMC in a random order and end up marking every candle as an order block. Each concept builds on the previous one, so the order matters.') +
  steps([
   ('What are Smart Money Concepts?','The idea behind SMC and its four building blocks.',SITE+'/learn/what-is-smart-money-concepts/','Read'),
   ('Market structure: BOS and CHoCH','How to read the trend and spot when it changes.',SITE+'/learn/market-structure-bos-choch/','Read'),
   ('Liquidity','Where stop losses cluster and what a liquidity sweep is.',SITE+'/learn/liquidity-in-trading/','Read'),
   ('Order blocks','How to find valid zones and what makes them fail.',SITE+'/learn/order-blocks/','Read'),
   ('Fair value gaps','Three-candle imbalances and how traders use them.',SITE+'/learn/fair-value-gaps/','Read'),
   ('Premium, discount and OTE','Buy low and sell high within a range.',SITE+'/learn/premium-discount-ote/','Read'),
   ('Risk management and lot size','The 1% rule and how to calculate your position size.',SITE+'/learn/risk-management-lot-size/','Read'),
  ]) +
  card(p('<strong>Tip:</strong> practise each concept on historical charts before moving on. Marking ten examples of market structure teaches more than reading about it twice.', size=15)) +
  btn('Start with guide 1', SITE+'/learn/what-is-smart-money-concepts/'),
 plain=f'''Smart Money Concepts, in the right order

Each concept builds on the previous one, so the order matters:
1. What are Smart Money Concepts? {SITE}/learn/what-is-smart-money-concepts/
2. Market structure: BOS and CHoCH {SITE}/learn/market-structure-bos-choch/
3. Liquidity {SITE}/learn/liquidity-in-trading/
4. Order blocks {SITE}/learn/order-blocks/
5. Fair value gaps {SITE}/learn/fair-value-gaps/
6. Premium, discount and OTE {SITE}/learn/premium-discount-ote/
7. Risk management and lot size {SITE}/learn/risk-management-lot-size/

Tip: practise each concept on historical charts before moving on.

{SLOGAN}
Educational only. Not financial advice.
Unsubscribe: {{$unsubscribe}}''')

emails['welcome-3'] = dict(
 subject='Meet Market Whisper AI, your trading toolkit',
 preheader='Member card, news, FX calendar events and a lot size calculator, free in Discord.',
 body = kicker('Market Whisper AI') + h1('The free toolkit inside our Discord') +
  p('Market Whisper AI is the bot we built for Winvest Capital members. It helps you analyse markets and make more calculated decisions. Every member of the free Discord can use:') +
  steps([
   ('Member card','Your official Winvest Capital card with your trading stats and trading style.','',''),
   ('News updates','Frequent news on crypto, stocks and FX.','',''),
   ('FX calendar events','The events that move FX pairs, so you are not caught off guard.','',''),
   ('Lot size calculator','Size positions to your risk before you enter.','',''),
  ]) + btn('Open the Discord', DISCORD) +
  rule() + h2('Want more guidance?') +
  card(p('The <strong>One Percent Club</strong> is a one-time upgrade of <strong>€150</strong>, no subscription. It adds the projects I am looking at, my time to research and analyse assets and FX charts with you, and Market Whisper AI market analysis and fundamental analysis on crypto projects and assets.', size=15), accent=True) +
  p(a('See what the One Percent Club includes', SITE+'/#membership'), size=15) +
  p('Educational only. Not financial advice.', muted=True, size=13),
 plain=f'''The free toolkit inside our Discord

Market Whisper AI is the bot we built for Winvest Capital members. Every member of the free Discord can use:
- Member card with your trading stats and trading style
- News updates on crypto, stocks and FX
- FX calendar events
- Lot size calculator

Open the Discord: {DISCORD}

Want more guidance? The One Percent Club is a one-time upgrade of EUR 150, no subscription. It adds the projects I am looking at, my time to research and analyse assets and FX charts with you, and Market Whisper AI market and fundamental analysis.
{SITE}/#membership

{SLOGAN}
Educational only. Not financial advice.
Unsubscribe: {{$unsubscribe}}''')

# Bi-weekly market update template (placeholders in [BRACKETS])
def row(asset, price, chg, color):
    return f'<tr><td style="padding:10px 0;border-bottom:1px solid {LINE};font-family:{FONT};font-size:15px;font-weight:700;color:{INK}">{asset}</td><td align="right" style="padding:10px 0;border-bottom:1px solid {LINE};font-family:{FONT};font-size:15px;color:{INK};font-variant-numeric:tabular-nums">{price}</td><td align="right" style="padding:10px 0 10px 12px;border-bottom:1px solid {LINE};font-family:{FONT};font-size:15px;font-weight:700;color:{color};font-variant-numeric:tabular-nums">{chg}</td></tr>'
UP='#1E7B4A'; DOWN='#9E1B12'
def scenario(asset):
    return card(
      f'<p style="margin:0 0 10px;font-family:{FONT};font-size:17px;font-weight:800;color:{INK}">{asset}</p>' +
      p('<strong>Observed structure:</strong> [What the chart shows now, e.g. higher highs and higher lows on the daily, last BOS at …]', size=15) +
      p(f'<strong style="color:{UP}">▲ Bullish scenario:</strong> [Condition for continuation, e.g. hold above … and a 4H BOS above …]', size=15) +
      p(f'<strong style="color:{DOWN}">▼ Bearish scenario:</strong> [Condition for a reversal, e.g. a daily close below …]', size=15) +
      p('<strong>Invalidation and key risk:</strong> [Level or event that cancels the idea]', size=15))

emails['market-update'] = dict(
 subject='Market update: [key theme of the fortnight]',
 preheader='[One line on the main theme, e.g. BTC holds structure while the dollar weakens ahead of CPI]',
 body = kicker('Market update · [date]') + h1('[Headline: the one thing that matters this fortnight]') +
  p('[Two or three sentences with the big picture: what happened in the last two weeks and what we focus on next.]') +
  h2('Market snapshot') +
  p('Prices at [time, date]. Change over the last two weeks.', muted=True, size=13) +
  f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px">{row("Bitcoin","[price]","[▲ +0.0%]",UP)}{row("Ethereum","[price]","[▼ −0.0%]",DOWN)}{row("S&amp;P 500","[price]","[▲ +0.0%]",UP)}{row("EUR/USD","[price]","[▲ +0.0%]",UP)}{row("Gold","[price]","[▲ +0.0%]",UP)}</table>' +
  h2('What we are watching') + scenario('[Asset 1, e.g. Bitcoin (BTC/USD)]') + scenario('[Asset 2, e.g. EUR/USD]') +
  h2('Key events next two weeks') +
  steps([('[Day, date · time CET]','[Event, e.g. US CPI. Why it matters for FX, stocks and crypto.]','',''),('[Day, date · time CET]','[Event, e.g. ECB rate decision.]','',''),('[Day, date · time CET]','[Event, e.g. NFP jobs report.]','','')]) +
  p(a('Full economic calendar', SITE+'/#calendar'), size=15) +
  h2('Learn this fortnight') +
  card(p('<strong>[Guide title]</strong><br>[One sentence on why this concept matters right now.] ' + a('Read the guide', SITE+'/learn/'), size=15)) +
  btn('Discuss it in the Discord', DISCORD) +
  rule() + p('This update describes scenarios, not certainties. Always wait for your own confirmation and manage your risk.', muted=True, size=13),
 plain='''Market update: [key theme]

[Big picture]

Market snapshot ([time, date]):
Bitcoin [price] [change]
Ethereum [price] [change]
S&P 500 [price] [change]
EUR/USD [price] [change]
Gold [price] [change]

What we are watching:
[Asset 1] Observed structure / Bullish scenario / Bearish scenario / Invalidation
[Asset 2] Observed structure / Bullish scenario / Bearish scenario / Invalidation

Key events next two weeks:
[Day, date, time] [Event]

Discuss it in the Discord: https://discord.gg/2ApK2MSnxZ

Elevate your trades, empower your future.
Educational only. Not financial advice.
Unsubscribe: {$unsubscribe}''')

import json
for k,v in emails.items():
    html = layout(v['preheader'], v['body'])
    open(f'{k}.html','w').write(html)
    v['html']=html
json.dump(emails, open('emails.json','w'), indent=1)
print({k: len(v['html']) for k,v in emails.items()})
