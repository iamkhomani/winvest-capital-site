#!/usr/bin/env python3
"""Build Listmonk *visual editor* (drag & drop) versions of the Winvest Capital emails.

Output: listmonk-visual/*.json (email-builder-js documents, stored by Listmonk as body_source).
The branded header and footer are fixed HTML blocks; everything in between is made of
normal editable blocks (Heading, Text, Button, Columns, Container, Divider) so content can be
written and styled in the Listmonk visual editor without touching code.
"""
import itertools
import json
import os

RED, INK, MUTED, LINE, SURFACE, WHITE = '#DA291C', '#141414', '#5F5B55', '#E4E0D8', '#F5F3EF', '#FFFFFF'
UP, DOWN = '#1E7B4A', '#9E1B12'
DISCORD = 'https://discord.gg/2ApK2MSnxZ'
PAYBOT = 'https://go.paybotapp.com/RTTDqS3p/rCK4CxHl'
SITE = 'https://winvestcapital.nl'
FONT = "Inter,'Segoe UI',Helvetica,Arial,sans-serif"


def attr(key):
    """Live value from campaign attributes, set by price-updater/winvest-prices.py."""
    return '{{ .Campaign.Attribs.%s | default "–" }}' % key


def attr_html(key):
    return '{{ with .Campaign.Attribs.%s }}{{ Safe . }}{{ else }}–{{ end }}' % key


CHG_LABEL = '{{ .Campaign.Attribs.chg_label | default "7 days" }}'
ASOF = '{{ .Campaign.Attribs.prices_asof | default "the time of sending" }}'

_ids = itertools.count(1)


class Doc:
    def __init__(self):
        self.blocks = {}

    def add(self, type_, data):
        bid = f'block-wc{next(_ids):04d}'
        self.blocks[bid] = {'type': type_, 'data': data}
        return bid

    # ---- block helpers -------------------------------------------------
    def pad(self, t=8, b=8, l=32, r=32):
        return {'top': t, 'bottom': b, 'left': l, 'right': r}

    def html(self, contents, padding=None):
        return self.add('Html', {'style': {'padding': padding or self.pad(0, 0, 0, 0)}, 'props': {'contents': contents}})

    def eyebrow(self, text, color=RED, padding=None):
        return self.add('Text', {'style': {'color': color, 'fontSize': 12, 'fontWeight': 'bold', 'padding': padding or self.pad(24, 0)},
                                 'props': {'text': text}})

    def heading(self, text, level='h2', color=INK, padding=None):
        return self.add('Heading', {'style': {'color': color, 'padding': padding or self.pad(8, 4)}, 'props': {'text': text, 'level': level}})

    def text(self, text, size=16, color=INK, weight='normal', align=None, padding=None, markdown=True, bg=None):
        style = {'color': color, 'fontSize': size, 'fontWeight': weight, 'padding': padding or self.pad(6, 6)}
        if align:
            style['textAlign'] = align
        if bg:
            style['backgroundColor'] = bg
        return self.add('Text', {'style': style, 'props': {'text': text, 'markdown': markdown}})

    def button(self, text, url, bg=RED, color=WHITE, padding=None, align='left'):
        return self.add('Button', {'style': {'textAlign': align, 'padding': padding or self.pad(12, 12)},
                                   'props': {'buttonBackgroundColor': bg, 'buttonTextColor': color, 'buttonStyle': 'pill',
                                             'size': 'medium', 'fullWidth': False, 'text': text, 'url': url}})

    def divider(self, padding=None):
        return self.add('Divider', {'style': {'padding': padding or self.pad(20, 20)}, 'props': {'lineColor': LINE, 'lineHeight': 1}})

    def spacer(self, h=16):
        return self.add('Spacer', {'props': {'height': h}})

    def container(self, children, bg=SURFACE, border=None, radius=12, padding=None, outer=None):
        style = {'backgroundColor': bg, 'borderRadius': radius, 'padding': padding or self.pad(12, 16, 8, 8)}
        if border:
            style['borderColor'] = border
        inner = self.add('Container', {'style': style, 'props': {'childrenIds': children}})
        # wrap so the box gets side margins inside the canvas
        return self.add('Container', {'style': {'padding': outer or self.pad(8, 8, 24, 24)}, 'props': {'childrenIds': [inner]}})

    def row(self, cells, header=False):
        """A 3-column table row: asset | price | change.
        cells = [label, key] for live prices (filled in by winvest-prices.py), or 3 header labels."""
        if header:
            texts = [cells[0], cells[1], CHG_LABEL]
        else:
            label, key = cells
            texts = [label, attr(f'{key}_price'), attr_html(f'{key}_chg_html')]
        cols = []
        for i, t in enumerate(texts):
            align = 'left' if i == 0 else 'right'
            size, weight, color = (12, 700, MUTED) if header else (15, 700 if i != 1 else 400, INK)
            cols.append({'childrenIds': [self.html(f'<p style="margin:0;padding:8px 0;font-family:{FONT};font-size:{size}px;font-weight:{weight};color:{color};text-align:{align}">{t}</p>')]})
        return self.add('ColumnsContainer', {'style': {'padding': self.pad(0, 0, 32, 32)},
                                             'props': {'columnsCount': 3, 'columnsGap': 8, 'contentAlignment': 'middle',
                                                       'fixedWidths': [250, 140, 110], 'columns': cols}})

    def build(self, children):
        root = {'type': 'EmailLayout', 'data': {'backdropColor': SURFACE, 'canvasColor': WHITE, 'textColor': INK,
                                                'fontFamily': 'MODERN_SANS', 'borderColor': LINE, 'borderRadius': 12,
                                                'childrenIds': children}}
        return {'root': root, **self.blocks}


HEADER = f'''<div style="padding:24px 32px 8px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td><a href="{SITE}" style="text-decoration:none"><img src="{SITE}/logo.jpeg" width="40" height="40" alt="Winvest Capital" style="display:inline-block;vertical-align:middle;border-radius:999px;border:0"><span style="display:inline-block;vertical-align:middle;margin-left:10px;font-family:{FONT};font-size:18px;font-weight:800;color:{INK};letter-spacing:-0.3px">WINVEST <span style="color:{RED};font-weight:600;letter-spacing:2px">CAPITAL</span></span></a></td>
<td align="right" style="font-family:{FONT};font-size:12px;color:{MUTED}"><a href="{{{{ MessageURL }}}}" style="color:{MUTED};text-decoration:underline">View in browser</a></td>
</tr></table></div>
<div style="height:4px;line-height:4px;font-size:4px;background:{RED};margin:12px 0 0">&nbsp;</div>'''

FOOTER = f'''<div style="padding:24px 0 0"><div style="background:{INK};padding:26px 32px">
<p style="margin:0 0 6px;font-family:{FONT};font-size:16px;font-weight:800;color:#FFFFFF">Elevate your trades, empower your future.</p>
<p style="margin:0 0 16px;font-family:{FONT};font-size:13px;color:#BDB8B0"><a href="{SITE}" style="color:#FFFFFF;text-decoration:none">Website</a> &nbsp;·&nbsp; <a href="{DISCORD}" style="color:#FFFFFF;text-decoration:none">Discord</a> &nbsp;·&nbsp; <a href="{SITE}/learn/" style="color:#FFFFFF;text-decoration:none">Learn</a> &nbsp;·&nbsp; <a href="{SITE}/lot-size-calculator/" style="color:#FFFFFF;text-decoration:none">Lot size calculator</a></p>
<p style="margin:0 0 12px;font-family:{FONT};font-size:12px;line-height:1.55;color:#9A958D">Everything Winvest Capital shares is for educational purposes only and is not financial advice. Trading stocks, crypto and FX carries a high risk of loss. Only risk what you can afford to lose.</p>
<p style="margin:0;font-family:{FONT};font-size:12px;line-height:1.55;color:#9A958D">You receive this email because you subscribed on winvestcapital.nl. <a href="{{{{ UnsubscribeURL }}}}" style="color:#FFFFFF;text-decoration:underline">Unsubscribe</a></p>
</div></div>'''


def intro(d, eyebrow_text, headline, body):
    return [d.eyebrow(eyebrow_text, padding=d.pad(28, 0)), d.heading(headline, 'h1', padding=d.pad(6, 4)), d.text(body, size=16)]


def price_table(d, title, note_prefix, rows):
    note = d.html(f'<p style="margin:0;padding:4px 32px 8px;font-family:{FONT};font-size:13px;color:{MUTED}">{note_prefix} {ASOF}. Change over the last {CHG_LABEL}. Updated automatically.</p>')
    out = [d.heading(title, 'h2', padding=d.pad(8, 0)), note, d.row(['Asset', 'Price', ''], header=True)]
    out += [d.row(r) for r in rows]
    return out


def focus(d, n):
    return [
        d.eyebrow(f'FOCUS {n}', padding=d.pad(20, 0)),
        d.heading('[Project or topic name]', 'h3', padding=d.pad(4, 2)),
        d.text('**What it is:** [Two or three sentences explaining the project or topic in plain language.]\n\n'
               '**Why it is on our radar:** [What changed or why it matters right now.]\n\n'
               '**What we are watching:** [Key levels, structure or upcoming catalysts. ▲ bullish if …, ▼ bearish if …]\n\n'
               '**Risks:** [What could invalidate the idea.]', size=15),
    ]


def events_box(d, what):
    return d.container([
        d.heading('Key events this week', 'h3', padding=d.pad(4, 2, 16, 16)),
        d.text(f'{what} We post the dates, times and what to watch for in our Discord, so you can plan your trades around them.', size=15, padding=d.pad(4, 4, 16, 16)),
        d.button('See this week’s events in Discord', DISCORD, padding=d.pad(8, 4, 16, 16)),
    ])


def pitch(d, topic):
    discord = d.container([
        d.heading('Trade it together', 'h3', color=WHITE, padding=d.pad(4, 2, 16, 16)),
        d.text(f'Want to discuss these {topic} with likeminded traders? Join the free Winvest Capital Discord: daily setups, the SMC guides and Market Whisper AI with your member card, news, FX calendar events and the lot size calculator.',
               size=15, color='#E9E6E0', padding=d.pad(4, 4, 16, 16)),
        d.button('Join the Discord, free', DISCORD, padding=d.pad(8, 4, 16, 16)),
    ], bg=INK)
    opc = d.container([
        d.eyebrow('ONE PERCENT CLUB', padding=d.pad(4, 0, 16, 16)),
        d.heading('Go from tools to personal guidance', 'h3', padding=d.pad(4, 2, 16, 16)),
        d.text('The One Percent Club adds the projects I am looking at, my time to research and analyse assets and charts with you, and the full Market Whisper AI toolkit: interactive conversations about the markets, plus market and fundamental analysis.',
               size=15, padding=d.pad(4, 4, 16, 16)),
        d.text('**€150** one-time payment, no subscription', size=14, color=MUTED, padding=d.pad(2, 4, 16, 16)),
        d.button('Join the One Percent Club', PAYBOT, bg=INK, padding=d.pad(8, 4, 16, 16)),
    ], bg='#FBEAE8')
    return [d.divider(), discord, opc]


def closing(d, text):
    return [d.text(text, size=13, color=MUTED, padding=d.pad(16, 8)), d.html(FOOTER)]


def crypto_radar():
    d = Doc()
    ch = [d.html(HEADER)]
    ch += intro(d, 'CRYPTO RADAR · EDITION [#] · [DATE]', '[Headline: the main crypto theme of these two weeks]',
                '[Two or three sentences on the big picture in crypto: what moved, what the market is focused on.]')
    ch.append(d.divider())
    ch += price_table(d, 'Top crypto prices', 'Prices in USD as of',
                      [['Bitcoin (BTC)', 'btc'], ['Ethereum (ETH)', 'eth'], ['XRP', 'xrp'], ['BNB', 'bnb'], ['Solana (SOL)', 'sol']])
    ch.append(d.spacer(12))
    ch.append(events_box(d, 'Token unlocks, network upgrades, ETF news and macro data can move crypto fast.'))
    ch.append(d.heading('On the radar this edition', 'h2', padding=d.pad(24, 0)))
    ch += focus(d, 1) + focus(d, 2)
    ch += pitch(d, 'projects')
    ch += closing(d, 'This edition shares scenarios and education, not recommendations or financial advice. Always do your own research and manage your risk.')
    return d.build(ch)


def stock_watch():
    d = Doc()
    ch = [d.html(HEADER)]
    ch += intro(d, 'STOCK WATCH · EDITION [#] · [DATE]', '[Headline: the main stock market theme of these two weeks]',
                '[Two or three sentences on the big picture in stocks: what moved, what the market is focused on.]')
    ch.append(d.divider())
    ch += price_table(d, 'Indices', 'Levels as of',
                      [['S&P 500', 'spx'], ['Nasdaq 100', 'ndx'], ['Dow Jones', 'dji']])
    ch.append(d.spacer(8))
    ch += price_table(d, 'Largest stocks', 'Prices in USD as of',
                      [['Nvidia (NVDA)', 'nvda'], ['Apple (AAPL)', 'aapl'], ['Microsoft (MSFT)', 'msft'], ['Alphabet (GOOGL)', 'googl'], ['Amazon (AMZN)', 'amzn']])
    ch.append(d.spacer(12))
    ch.append(events_box(d, 'Earnings reports, interest rate decisions, inflation and jobs data can move stocks fast.'))
    ch.append(d.heading('On the watchlist this edition', 'h2', padding=d.pad(24, 0)))
    ch += focus(d, 1) + focus(d, 2)
    ch += pitch(d, 'stocks')
    ch += closing(d, 'This edition shares scenarios and education, not recommendations or financial advice. Always do your own research and manage your risk.')
    return d.build(ch)


def market_update():
    d = Doc()
    ch = [d.html(HEADER)]
    ch += intro(d, 'MARKET UPDATE · [DATE]', '[Headline: the one thing that matters this fortnight]',
                '[Two or three sentences with the big picture: what happened in the last two weeks and what we focus on next.]')
    ch.append(d.divider())
    ch += price_table(d, 'Market snapshot', 'Prices as of',
                      [['Bitcoin', 'btc'], ['Ethereum', 'eth'], ['S&P 500', 'spx'], ['EUR/USD', 'eurusd'], ['Gold', 'gold']])
    ch.append(d.heading('What we are watching', 'h2', padding=d.pad(28, 0)))
    for n in (1, 2):
        ch.append(d.container([
            d.heading(f'[Asset {n}, e.g. {"Bitcoin (BTC/USD)" if n == 1 else "EUR/USD"}]', 'h3', padding=d.pad(4, 2, 16, 16)),
            d.text('**Observed structure:** [What the chart shows now, e.g. higher highs and higher lows on the daily, last BOS at …]\n\n'
                   '**▲ Bullish scenario:** [Condition for continuation, e.g. hold above … and a 4H BOS above …]\n\n'
                   '**▼ Bearish scenario:** [Condition for a reversal, e.g. a daily close below …]\n\n'
                   '**Invalidation and key risk:** [Level or event that cancels the idea]', size=15, padding=d.pad(4, 4, 16, 16)),
        ]))
    ch.append(d.heading('Key events next two weeks', 'h2', padding=d.pad(24, 0)))
    for n, ev in ((1, 'US CPI. Why it matters for FX, stocks and crypto.'), (2, 'ECB rate decision.'), (3, 'NFP jobs report.')):
        ch.append(d.text(f'**{n}. [Day, date · time CET]**  \n[Event, e.g. {ev}]', size=15))
    ch.append(d.button('Full economic calendar', SITE + '/#calendar', bg=INK))
    ch.append(d.container([
        d.eyebrow('LEARN THIS FORTNIGHT', padding=d.pad(4, 0, 16, 16)),
        d.heading('[Guide title]', 'h3', padding=d.pad(4, 2, 16, 16)),
        d.text(f'[One sentence on why this concept matters right now.] [Read the guide]({SITE}/learn/)', size=15, padding=d.pad(4, 4, 16, 16)),
    ]))
    ch.append(d.button('Discuss it in the Discord', DISCORD, padding=d.pad(16, 8)))
    ch += closing(d, 'This update describes scenarios, not certainties. Always wait for your own confirmation and manage your risk.')
    return d.build(ch)


def blank():
    d = Doc()
    ch = [d.html(HEADER)]
    ch += intro(d, 'WINVEST CAPITAL · [DATE]', '[Your headline]', '[Write your message here. Use the + button to add headings, text, images, buttons or columns.]')
    ch.append(d.button('Join the Discord, free', DISCORD))
    ch += closing(d, 'Educational content only, not financial advice.')
    return d.build(ch)


if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), 'listmonk-visual')
    os.makedirs(out, exist_ok=True)
    for name, fn in [('template-blank', blank), ('market-update', market_update), ('crypto-radar', crypto_radar), ('stock-watch', stock_watch)]:
        doc = fn()
        with open(os.path.join(out, name + '.json'), 'w') as f:
            json.dump(doc, f, ensure_ascii=False, indent=1)
        print(name, len(doc) - 1, 'blocks')
