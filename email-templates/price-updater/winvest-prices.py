#!/usr/bin/env python3
"""Winvest Capital live prices for Listmonk campaigns.

Fetches current prices and the % change over the last CHANGE_DAYS days and stores them as
campaign attributes on every draft or scheduled campaign whose body uses them
({{ .Campaign.Attribs.<key> }}). The email templates show these values automatically.

Runs every 15 minutes via a systemd timer, so a campaign always carries recent prices
when it is sent. Python standard library only. Config: /etc/winvest-prices.env

Sources (no API key needed):
  crypto  CoinGecko public API            https://api.coingecko.com
  stocks, indices, FX, gold  Yahoo Finance chart endpoint (unofficial, may change)

Keys written per asset (e.g. btc):  btc_price, btc_chg, btc_chg_html
Plus: prices_asof (e.g. "1 Nov 2026, 15:40 CET") and chg_label (e.g. "7 days").
"""
import datetime as dt
import json
import os
import sys
import urllib.parse
import urllib.request
from zoneinfo import ZoneInfo

URL = os.environ.get('LISTMONK_URL', 'http://192.168.68.131:9000').rstrip('/')
USER = os.environ['LISTMONK_API_USER']
TOKEN = os.environ['LISTMONK_API_TOKEN']
DAYS = int(os.environ.get('CHANGE_DAYS', '7'))
TZ = ZoneInfo(os.environ.get('TIMEZONE', 'Europe/Amsterdam'))
UP, DOWN, FLAT = '#1E7B4A', '#9E1B12', '#5F5B55'
UA = {'User-Agent': 'Mozilla/5.0 (WinvestCapital price updater)', 'Accept': 'application/json'}

# key: (coingecko id, decimals rule)
CRYPTO = {'btc': 'bitcoin', 'eth': 'ethereum', 'xrp': 'ripple', 'bnb': 'binancecoin', 'sol': 'solana'}
# key: (yahoo symbol, prefix, decimals)
MARKETS = {
    'spx': ('^GSPC', '', 2), 'ndx': ('^NDX', '', 2), 'dji': ('^DJI', '', 2),
    'nvda': ('NVDA', '$', 2), 'aapl': ('AAPL', '$', 2), 'msft': ('MSFT', '$', 2), 'googl': ('GOOGL', '$', 2), 'amzn': ('AMZN', '$', 2),
    'eurusd': ('EURUSD=X', '', 4), 'gold': ('GC=F', '$', 2),
}


def get(url, headers=None, body=None, method='GET'):
    req = urllib.request.Request(url, method=method, data=body, headers=headers or UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read() or b'{}')


def api(method, path, body=None):
    return get(URL + path, method=method, body=json.dumps(body).encode() if body is not None else None,
               headers={'Authorization': f'token {USER}:{TOKEN}', 'Content-Type': 'application/json'})


def money(v, prefix='$', decimals=None):
    if decimals is None:
        decimals = 2 if v >= 1 else 4
    return f'{prefix}{v:,.{decimals}f}'


def change(key, pct):
    arrow, color = ('▲', UP) if pct > 0.005 else ('▼', DOWN) if pct < -0.005 else ('■', FLAT)
    sign = '+' if pct > 0 else '−' if pct < 0 else ''
    txt = f'{arrow} {sign}{abs(pct):.1f}%'
    return {f'{key}_chg': txt, f'{key}_chg_html': f'<span style="color:{color};font-weight:700">{txt}</span>'}


def fetch_crypto():
    out = {}
    q = urllib.parse.urlencode({'vs_currency': 'usd', 'ids': ','.join(CRYPTO.values()), 'price_change_percentage': f'{DAYS}d'})
    rows = {r['id']: r for r in get('https://api.coingecko.com/api/v3/coins/markets?' + q)}
    for key, cid in CRYPTO.items():
        r = rows.get(cid)
        pct = r and r.get(f'price_change_percentage_{DAYS}d_in_currency')
        if not r or r.get('current_price') is None or pct is None:
            print(f'warn: no data for {cid}', file=sys.stderr)
            continue
        out[f'{key}_price'] = money(r['current_price'], decimals=0 if r['current_price'] >= 1000 else None)
        out.update(change(key, pct))
    return out


def fetch_market(key, symbol, prefix, decimals):
    q = urllib.parse.urlencode({'range': '1mo', 'interval': '1d'})
    d = get(f'https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(symbol)}?' + q)
    res = d['chart']['result'][0]
    price = res['meta']['regularMarketPrice']
    cutoff = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=DAYS)).timestamp()
    closes = [(t, c) for t, c in zip(res['timestamp'], res['indicators']['quote'][0]['close']) if c is not None and t <= cutoff]
    if not closes:
        raise ValueError('no close before cutoff')
    ref = closes[-1][1]
    return {f'{key}_price': money(price, prefix, decimals), **change(key, (price / ref - 1) * 100)}


def collect():
    data = {}
    try:
        data.update(fetch_crypto())
    except Exception as e:  # keep going: stocks can still update
        print(f'warn: crypto failed: {e}', file=sys.stderr)
    for key, (sym, prefix, dec) in MARKETS.items():
        try:
            data.update(fetch_market(key, sym, prefix, dec))
        except Exception as e:
            print(f'warn: {sym} failed: {e}', file=sys.stderr)
    now = dt.datetime.now(TZ)
    data['prices_asof'] = f'{now.day} {now:%b %Y, %H:%M} {now.tzname()}'
    data['chg_label'] = f'{DAYS} days'
    return data


def campaigns_to_update():
    page, out = 1, []
    while True:
        d = api('GET', f'/api/campaigns?per_page=50&page={page}')['data']
        for c in d.get('results') or []:
            if c['status'] in ('draft', 'scheduled', 'paused'):
                out.append(c['id'])
        if page * 50 >= d.get('total', 0):
            return out
        page += 1


def update(cid, data):
    c = api('GET', f'/api/campaigns/{cid}')['data']
    if 'Campaign.Attribs' not in (c.get('body') or ''):
        return False
    attribs = {**(c.get('attribs') or {}), **data}
    body = {k: c.get(k) for k in ('name', 'subject', 'from_email', 'type', 'content_type', 'body', 'body_source', 'altbody',
                                  'template_id', 'archive', 'archive_template_id', 'archive_meta', 'archive_slug', 'tags',
                                  'messenger', 'headers', 'send_at')}
    body['lists'] = [l['id'] for l in c.get('lists') or []]
    body['media'] = [m['id'] for m in c.get('media') or []]
    body['attribs'] = attribs
    body['send_later'] = bool(c.get('send_at'))
    body = {k: v for k, v in body.items() if v is not None}
    api('PUT', f'/api/campaigns/{cid}', body)
    return True


def main():
    data = collect()
    if '--dry-run' in sys.argv:
        print(json.dumps(data, ensure_ascii=False, indent=1))
        return
    n = 0
    for cid in campaigns_to_update():
        try:
            n += update(cid, data)
        except Exception as e:
            print(f'warn: campaign {cid} not updated: {e}', file=sys.stderr)
    print(f'updated {n} campaign(s), {len(data)} values, as of {data["prices_asof"]}')


if __name__ == '__main__':
    main()
