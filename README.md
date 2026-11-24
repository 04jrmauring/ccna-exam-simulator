# CCNA 200-301 Exam & Cisco Packet Tracer Lab Simulator

A modern, dark-mode **CCNA 200-301 Examination & Virtual Lab Platform** built with pure HTML, CSS, and JavaScript (zero external dependencies — works offline and deploys directly to GitHub Pages).

## Features

- **1,000-Question Blueprint-Weighted Pool** (`data/questions.js`):
  - **1.0 Network Fundamentals** — 20% (200 pool → 20 per exam)
  - **2.0 Network Access** — 20% (200 pool → 20 per exam)
  - **3.0 IP Connectivity** — 25% (250 pool → 25 per exam)
  - **4.0 IP Services** — 10% (100 pool → 10 per exam)
  - **5.0 Security Fundamentals** — 15% (150 pool → 15 per exam)
  - **6.0 Automation and Programmability** — 10% (100 pool → 10 per exam)
- **20-Lab Cisco Packet Tracer-Style Pool** (`data/labs.js`):
  - Covers all 11 previous-passer topics (ACL, OSPF Election, VLAN, EtherChannel, Voice VLAN, CDP/LLDP, IPv4 & IPv6 Addressing, NAT/PAT, NTP, DHCP Snooping, DAI) plus 9 core blueprint labs.
  - Interactive Logical Topology canvas with Cisco Router/Switch/Server/PC icons, green/orange/red link indicators, Simple PDU ping, Fast Forward convergence, and docked `CLI` / `Config` / `Physical` / `Desktop` device tabs.
  - Authentic Cisco IOS **`?` context-sensitive config helper** and **`Tab` auto-completion**.
- **2-Phase Exam Flow:**
  - **Part 1:** 6 randomized Packet Tracer labs (`Lab 1/6` → `Lab 6/6`) with `Next Lab (Skip) >` so candidates are never blocked.
  - **Part 2:** 100 randomized weighted multiple-choice questions with a `02:00:00` countdown timer, 100-question filterable jump grid, `Mark for Review`, Study vs. Strict Exam Mode, and Cisco-style `300–1000` scaled score report.

## Run Locally

```bash
node server.js
```

Then open **http://localhost:3000**.

## Deploy Free on GitHub Pages

1. Push this repository to GitHub (`main` branch).
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select **`main`** and **`/ (root)`**, then click **Save**.
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.
