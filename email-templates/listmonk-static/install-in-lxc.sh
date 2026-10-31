#!/usr/bin/env bash
# Run as root INSIDE the Listmonk LXC (pct enter 116).
set -euo pipefail
BASE=https://raw.githubusercontent.com/iamkhomani/winvest-capital-site/main/email-templates/listmonk-static/email-templates
DIR=/opt/listmonk/static/email-templates
mkdir -p "$DIR"
for f in base.html campaign-status.html default-archive.tpl default-visual.json default-visual.tpl default.tpl forgot-password.html import-status.html sample-tx.tpl smtp-test.html subscriber-data.html subscriber-optin-campaign.html subscriber-optin.html; do
  curl -fsSL "$BASE/$f" -o "$DIR/$f"
done
SVC=$(systemctl list-unit-files --type=service --no-legend | awk '{print $1}' | grep -i '^listmonk' | head -1)
if [ -z "$SVC" ]; then echo "Could not find the listmonk systemd service. Run: systemctl list-units | grep -i listmonk"; exit 1; fi
mkdir -p "/etc/systemd/system/$SVC.d"
printf '[Service]\nEnvironment=LISTMONK_static_dir=/opt/listmonk/static\n' > "/etc/systemd/system/$SVC.d/winvest-static.conf"
systemctl daemon-reload
systemctl restart "$SVC"
sleep 3
systemctl is-active "$SVC" && echo "Done: $SVC restarted with branded email templates."
journalctl -u "$SVC" -n 5 --no-pager
