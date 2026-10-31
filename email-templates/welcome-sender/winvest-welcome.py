#!/usr/bin/env python3
"""Send the Winvest Capital welcome email (Listmonk transactional template)
to every newly confirmed subscriber of the newsletter list, exactly once.

Runs every few minutes via a systemd timer. Uses only the Python standard library.
Config comes from /etc/winvest-welcome.env (see README.md).
"""
import json, os, sys, urllib.request, urllib.error, base64, datetime

URL = os.environ.get('LISTMONK_URL', 'http://192.168.68.14:9000').rstrip('/')
USER = os.environ['LISTMONK_API_USER']
TOKEN = os.environ['LISTMONK_API_TOKEN']
LIST_ID = int(os.environ.get('LIST_ID', '2'))
TEMPLATE_ID = int(os.environ.get('WELCOME_TEMPLATE_ID', '6'))
FROM = os.environ.get('FROM_EMAIL', 'Winvest Capital <info@winvestcapital.nl>')
STATE = os.environ.get('STATE_FILE', '/var/lib/winvest-welcome/sent.json')

def api(method, path, body=None):
    req = urllib.request.Request(URL + path, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={'Authorization': f'token {USER}:{TOKEN}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read() or b'{}')

def confirmed_subscribers():
    page, out = 1, []
    while True:
        d = api('GET', f'/api/subscribers?list_id={LIST_ID}&per_page=100&page={page}')['data']
        for s in d.get('results') or []:
            sub = next((l for l in s.get('lists', []) if l.get('id') == LIST_ID), None)
            if s.get('status') == 'enabled' and sub and sub.get('subscription_status') == 'confirmed':
                out.append(s)
        if page * 100 >= d.get('total', 0):
            return out
        page += 1

def load_state():
    try:
        with open(STATE) as f:
            return set(json.load(f))
    except FileNotFoundError:
        return None

def save_state(ids):
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    tmp = STATE + '.tmp'
    with open(tmp, 'w') as f:
        json.dump(sorted(ids), f)
    os.replace(tmp, STATE)

def log(msg):
    print(f'{datetime.datetime.now().isoformat(timespec="seconds")} {msg}', flush=True)

def main():
    subs = confirmed_subscribers()
    sent = load_state()
    if sent is None or '--init' in sys.argv:
        # First run: mark everyone already confirmed as done, so nobody gets an old welcome.
        save_state({s['id'] for s in subs})
        log(f'initialised with {len(subs)} existing confirmed subscriber(s); nothing sent')
        return
    new = [s for s in subs if s['id'] not in sent]
    for s in new:
        try:
            api('POST', '/api/tx', {'subscriber_id': s['id'], 'template_id': TEMPLATE_ID,
                                    'from_email': FROM, 'content_type': 'html'})
            sent.add(s['id'])
            save_state(sent)
            log(f'welcome sent to subscriber {s["id"]}')
        except urllib.error.HTTPError as e:
            log(f'failed for subscriber {s["id"]}: HTTP {e.code} {e.read()[:200]!r}')
    if not new:
        log('no new confirmed subscribers')

if __name__ == '__main__':
    main()
