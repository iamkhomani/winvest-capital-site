import importlib.util, contextlib, io, os, re
spec = importlib.util.spec_from_file_location('b', 'build.py'); b = importlib.util.module_from_spec(spec)
with contextlib.redirect_stdout(io.StringIO()): spec.loader.exec_module(b)
PAY = 'https://go.paybotapp.com/RTTDqS3p/rCK4CxHl'
UNSUB = 'https://news.winvestcapital.nl/subscription/00000000-0000-0000-0000-000000000000/{{ .Subscriber.UUID }}'
F=b.FONT; INK=b.INK; MUTED=b.MUTED; RED=b.RED

def tx(preheader, body):
    h = b.layout(preheader, body)
    h = h.replace('<a href="{$url}" style="color:#5F5B55;text-decoration:underline">View in browser</a>', '')
    return h.replace('{$unsubscribe}', UNSUB)

# Email 3 with a stronger One Percent Club focus and a direct checkout button
def li(t): return f'<li style="margin:0 0 8px;font-family:{F};font-size:15px;line-height:1.55;color:{INK}">{t}</li>'
e3 = (b.kicker('One Percent Club') + b.h1('From free tools to personal guidance') +
  b.p('By now you have seen the free side of Winvest Capital: the Discord, the SMC guides and Market Whisper AI with your member card, news, FX calendar events and the lot size calculator.') +
  b.p('The <strong>One Percent Club</strong> is for traders who want more than tools:') +
  f'<ul style="margin:0 0 16px;padding-left:20px">{li("The projects I am looking at, released regularly")}{li("My time: research and analysis of assets and FX charts, to help and guide you")}{li("Market Whisper AI market analysis on crypto and stocks")}{li("Market Whisper AI fundamental analysis on crypto projects and assets")}</ul>' +
  b.card(f'<p style="margin:0;font-family:{F};font-size:24px;font-weight:800;color:{INK}">€150 <span style="font-size:14px;font-weight:600;color:{MUTED}">one-time payment, no subscription</span></p>' +
         b.btn('Join the One Percent Club', PAY) +
         f'<p style="margin:0;font-family:{F};font-size:13px;line-height:1.55;color:{MUTED}">Secure payment via Stripe. Your One Percent Club role is added to Discord automatically. EU customers have a 14-day right of withdrawal.</p>', accent=True) +
  b.p(b.a('Compare free and One Percent Club', b.SITE + '/#membership'), size=15) +
  b.rule() + b.p('Educational only. Not financial advice.', muted=True, size=13))

series = {
  'welcome-1': ('Welcome to Winvest Capital', b.emails['welcome-1']['preheader'], b.emails['welcome-1']['body']),
  'welcome-2': ('The SMC learning path, step by step', b.emails['welcome-2']['preheader'], b.emails['welcome-2']['body']),
  'welcome-3': ('The One Percent Club: from tools to guidance', 'What the One Percent Club adds, for a one-time €150.', e3),
}
os.makedirs('listmonk', exist_ok=True)
for k, (subj, pre, body) in series.items():
    open(f'listmonk/{k}-tx.html', 'w').write(tx(pre, body))
    print(k, subj, len(tx(pre, body)))
