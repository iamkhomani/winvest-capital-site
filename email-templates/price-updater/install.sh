#!/usr/bin/env bash
# Run as root on the Proxmox host (same machine as the welcome sender).
set -euo pipefail
BASE=https://raw.githubusercontent.com/iamkhomani/winvest-capital-site/main/email-templates/price-updater
curl -fsSL "$BASE/winvest-prices.py" -o /usr/local/bin/winvest-prices.py
chmod 755 /usr/local/bin/winvest-prices.py
curl -fsSL "$BASE/winvest-prices.service" -o /etc/systemd/system/winvest-prices.service
curl -fsSL "$BASE/winvest-prices.timer" -o /etc/systemd/system/winvest-prices.timer
if [ ! -f /etc/winvest-prices.env ]; then
  if [ -f /etc/winvest-welcome.env ]; then
    # reuse the Listmonk API user of the welcome sender
    grep -E '^LISTMONK_(URL|API_USER|API_TOKEN)=' /etc/winvest-welcome.env > /etc/winvest-prices.env
  else
    printf 'LISTMONK_URL=http://192.168.68.14:9000\nLISTMONK_API_USER=welcome-bot\nLISTMONK_API_TOKEN=PASTE_TOKEN_HERE\n' > /etc/winvest-prices.env
  fi
  printf 'CHANGE_DAYS=7\nTIMEZONE=Europe/Amsterdam\n' >> /etc/winvest-prices.env
fi
chmod 600 /etc/winvest-prices.env
systemctl daemon-reload
systemctl enable --now winvest-prices.timer
echo "Installed. Test it with:"
echo "  set -a; . /etc/winvest-prices.env; set +a; python3 /usr/local/bin/winvest-prices.py --dry-run"
echo "  systemctl start winvest-prices.service; journalctl -u winvest-prices.service -n 20"
