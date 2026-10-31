import importlib.util, json, os
spec = importlib.util.spec_from_file_location('b', 'build.py'); b = importlib.util.module_from_spec(spec)
import contextlib, io
with contextlib.redirect_stdout(io.StringIO()): spec.loader.exec_module(b)
PAY = 'https://go.paybotapp.com/RTTDqS3p/rCK4CxHl'

def lm_layout(inner, unsub=True, webview=True):
    h = b.layout('', inner)
    h = h.replace('href="{$url}"', 'href="{{ MessageURL }}"') if webview else h.replace('<a href="{$url}" style="color:#5F5B55;text-decoration:underline">View in browser</a>', '')
    if unsub:
        h = h.replace('href="{$unsubscribe}"', 'href="{{ UnsubscribeURL }}"')
    else:
        h = h.replace('You receive this email because you subscribed on winvestcapital.nl. <a href="{$unsubscribe}" style="color:#FFFFFF;text-decoration:underline">Unsubscribe</a>',
                      'You receive this email because you subscribed on winvestcapital.nl. Every newsletter has an unsubscribe link at the bottom.')
    h = h.replace('<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">&#847;', '<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">{{ .Campaign.AltBody }}&#847;') if False else h
    return h.replace('</body>', '{{ TrackView }}</body>') if unsub else h

# 1. Campaign template (wrapper)
campaign_tpl = lm_layout('{{ template "content" . }}')
# 2. Market update body (goes inside the template)
mu_body = b.emails['market-update']['body']
# 3. Welcome (transactional): summary of the three onboarding emails, focus on One Percent Club
F=b.FONT; RED=b.RED; INK=b.INK; MUTED=b.MUTED
def li(t): return f'<li style="margin:0 0 8px;font-family:{F};font-size:15px;line-height:1.55;color:{INK}">{t}</li>'
def ul(items): return f'<ul style="margin:0 0 16px;padding-left:20px">{"".join(li(x) for x in items)}</ul>'
welcome_body = (
  b.kicker('Welcome') + b.h1('Welcome to Winvest Capital') +
  b.p('Thank you for confirming your subscription. Every two weeks you will receive our market update: the key levels, the events that matter and the scenarios we are watching across crypto, stocks and FX.') +
  b.h2('Start for free') +
  ul([f'{b.a("Join the free Discord", b.DISCORD)}: likeminded traders discussing setups every day.',
      f'{b.a("Learn Smart Money Concepts", b.SITE+"/learn/")}: seven short guides, from market structure to risk management.',
      f'{b.a("Use the lot size calculator", b.SITE+"/lot-size-calculator/")}: size every trade to your risk.']) +
  b.p('Inside the Discord, every member can use <strong>Market Whisper AI</strong>: your member card with trading stats and style, news updates, FX calendar events and the lot size calculator.', size=15) +
  b.h2('Go further with the One Percent Club') +
  b.card(
    b.p('The free community gives you the tools. The <strong>One Percent Club</strong> adds guidance:', size=15) +
    ul(['The projects I am looking at, released regularly',
        'My time: research and analysis of assets and FX charts, to help and guide you',
        'Market Whisper AI market analysis on crypto and stocks',
        'Market Whisper AI fundamental analysis on crypto projects and assets']) +
    f'<p style="margin:0;font-family:{F};font-size:22px;font-weight:800;color:{INK}">€150 <span style="font-size:14px;font-weight:600;color:{MUTED}">one-time payment, no subscription</span></p>' +
    b.btn('Join the One Percent Club', PAY) +
    f'<p style="margin:0;font-family:{F};font-size:13px;line-height:1.55;color:{MUTED}">Secure payment via Stripe. Your One Percent Club role is added to Discord automatically. EU customers have a 14-day right of withdrawal.</p>',
    accent=True) +
  b.p(b.a('Compare free and One Percent Club', b.SITE+'/#membership'), size=15) +
  b.rule() + b.p('Questions? Just reply to this email. Educational only, not financial advice.', muted=True, size=13)
)
welcome_tx = lm_layout(welcome_body, unsub=False, webview=False)

os.makedirs('listmonk', exist_ok=True)
open('listmonk/campaign-template.html','w').write(campaign_tpl)
open('listmonk/market-update-body.html','w').write(mu_body)
open('listmonk/welcome-tx.html','w').write(welcome_tx)
print({k: len(v) for k, v in [('campaign', campaign_tpl), ('mu', mu_body), ('welcome', welcome_tx)]})
print('content tag:', '{{ template "content" . }}' in campaign_tpl, 'unsub:', '{{ UnsubscribeURL }}' in campaign_tpl, 'msgurl:', '{{ MessageURL }}' in campaign_tpl)
