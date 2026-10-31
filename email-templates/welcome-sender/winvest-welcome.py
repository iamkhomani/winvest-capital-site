#!/usr/bin/env python3
"""Winvest Capital welcome series for Listmonk.

Sends a series of transactional emails to every new subscriber of the newsletter
list (with double opt-in: after confirmation): email 1 right away, then the next emails after the
configured number of days. Stops for anyone who unsubscribes or is disabled.

Runs every few minutes via a systemd timer. Python standard library only.
Config comes from /etc/winvest-welcome.env (see README.md).
"""
import json, os, sys, time, urllib.request, urllib.error, datetime

URL = os.environ.get('LISTMONK_URL', 'http://192.168.68.14:9000').rstrip('/')
USER = os.environ['LISTMONK_API_USER']
TOKEN = os.environ['LISTMONK_API_TOKEN']
LIST_ID = int(os.environ.get('LIST_ID', '2'))
# Template IDs and delays (in days after confirmation), one per email in the series.
TEMPLATE_IDS = [int(x) for x in os.environ.get('SERIES_TEMPLATE_IDS', os.environ.get('WELCOME_TEMPLATE_ID', '6')).split(',')]
DELAYS = [float(x) for x in os.environ.get('SERIES_DELAYS_DAYS', '0,2,5').split(',')][:len(TEMPLATE_IDS)]
FROM = os.environ.get('FROM_EMAIL', 'Winvest Capital <info@winvestcapital.nl>')
# 'single': everyone on the list who has not unsubscribed gets the series (no confirmation step).
# 'double': only subscribers who clicked the confirmation link get it.
OPTIN = os.environ.get('LIST_OPTIN', 'single').lower()
STATE = os.environ.get('STATE_FILE', '/var/lib/winvest-welcome/state.json')
OLD_STATE = os.path.join(os.path.dirname(STATE), 'sent.json')

def api(method, path, body=None):
    req = urllib.request.Request(URL + path, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={'Authorization': f'token {USER}:{TOKEN}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read() or b'{}')

def confirmed_subscribers():
    page, out = 1, {}
    while True:
        d = api('GET', f'/api/subscribers?list_id={LIST_ID}&per_page=100&page={page}')['data']
        for s in d.get('results') or []:
            sub = next((l for l in s.get('lists', []) if l.get('id') == LIST_ID), None)
            ok = sub and (sub.get('subscription_status') == 'confirmed' or
                          (OPTIN == 'single' and sub.get('subscription_status') == 'unconfirmed'))
            if s.get('status') == 'enabled' and ok:
                out[str(s['id'])] = s
        if page * 100 >= d.get('total', 0):
            return out
        page += 1

def load_state():
    try:
        with open(STATE) as f:
            return json.load(f)
    except FileNotFoundError:
        pass
    try:  # migrate the old single-email state: those subscribers are done
        with open(OLD_STATE) as f:
            return {str(i): {'since': 0, 'sent': len(TEMPLATE_IDS)} for i in json.load(f)}
    except FileNotFoundError:
        return None

def save_state(st):
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    tmp = STATE + '.tmp'
    with open(tmp, 'w') as f:
        json.dump(st, f)
    os.replace(tmp, STATE)

def log(msg):
    print(f'{datetime.datetime.now().isoformat(timespec="seconds")} {msg}', flush=True)

def main():
    subs = confirmed_subscribers()
    st = load_state()
    now = time.time()
    if st is None or '--init' in sys.argv:
        # First run: everyone already confirmed counts as done, so nobody gets old emails.
        st = {sid: {'since': now, 'sent': len(TEMPLATE_IDS)} for sid in subs}
        save_state(st)
        log(f'initialised with {len(subs)} existing confirmed subscriber(s); nothing sent')
        return
    for sid in subs:
        st.setdefault(sid, {'since': now, 'sent': 0})
    sent_any = False
    for sid, rec in st.items():
        if sid not in subs:      # unsubscribed, disabled or deleted: stop the series
            continue
        while rec['sent'] < len(TEMPLATE_IDS) and now >= rec['since'] + DELAYS[rec['sent']] * 86400:
            n = rec['sent']
            try:
                api('POST', '/api/tx', {'subscriber_id': int(sid), 'template_id': TEMPLATE_IDS[n],
                                        'from_email': FROM, 'content_type': 'html'})
            except urllib.error.HTTPError as e:
                log(f'email {n + 1} failed for subscriber {sid}: HTTP {e.code} {e.read()[:200]!r}')
                break
            rec['sent'] = n + 1
            save_state(st)
            sent_any = True
            log(f'email {n + 1}/{len(TEMPLATE_IDS)} sent to subscriber {sid}')
    save_state(st)
    if not sent_any:
        log('nothing due')

if __name__ == '__main__':
    main()
