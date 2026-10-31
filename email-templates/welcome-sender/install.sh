#!/usr/bin/env bash
# Run as root on the Proxmox host (or any machine on your network with python3).
set -euo pipefail
BASE=https://raw.githubusercontent.com/iamkhomani/winvest-capital-site/main/email-templates/welcome-sender
curl -fsSL "$BASE/winvest-welcome.py" -o /usr/local/bin/winvest-welcome.py
chmod 755 /usr/local/bin/winvest-welcome.py
curl -fsSL "$BASE/winvest-welcome.service" -o /etc/systemd/system/winvest-welcome.service
curl -fsSL "$BASE/winvest-welcome.timer" -o /etc/systemd/system/winvest-welcome.timer
if [ ! -f /etc/winvest-welcome.env ]; then
  printf 'LISTMONK_URL=http://192.168.68.14:9000\nLISTMONK_API_USER=welcome-bot\nLISTMONK_API_TOKEN=PASTE_TOKEN_HERE\nSERIES_TEMPLATE_IDS=7,8,9\nSERIES_DELAYS_DAYS=0,2,5\n' > /etc/winvest-welcome.env
fi
chmod 600 /etc/winvest-welcome.env
systemctl daemon-reload
echo "Installed. Now edit /etc/winvest-welcome.env (nano /etc/winvest-welcome.env), then run:"
echo "  set -a; . /etc/winvest-welcome.env; set +a; python3 /usr/local/bin/winvest-welcome.py --init"
echo "  systemctl enable --now winvest-welcome.timer"
