# Email templates

Branded Winvest Capital email templates for Listmonk (not part of the website build).

- `listmonk/campaign-template.html`: campaign wrapper (Listmonk template, uses `{{ template "content" . }}`)
- `listmonk/market-update-body.html`: body of the bi-weekly market update
- `listmonk/welcome-tx.html`: transactional welcome email

Regenerate with `python3 build_listmonk.py` from this folder.
