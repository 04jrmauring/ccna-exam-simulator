// CCNA 200-301 Enterprise Lab Builder Pool — 20 Build & Break-Fix Multi-Device Labs (LAB-26 to LAB-45)
// Appends 20 scenario-only multi-device labs covering all 6 CCNA 200-301 domains to window.CCNA_LAB_POOL (total: 45 labs).
(function () {
  const ENTERPRISE_LABS = [
    // =========================================================================
    // Domain 1.0: Network Fundamentals (Labs 01–04 -> LAB-26 to LAB-29)
    // =========================================================================
    {
      id: "LAB-26",
      passerTag: "Enterprise Lab 01 • Build • VLSM & Dual-Stack (2 Devices)",
      sectionCode: "1.0",
      section: "1.0 Network Fundamentals",
      title: "Enterprise VLSM Subnetting & Dual-Stack Addressing",
      devices: ["R1", "SW1"],
      scenario: "A branch office requires VLSM allocation from 192.168.10.0/24: Engineering needs 60 hosts (192.168.10.0/26 on R1 Gi0/0), Sales needs 28 hosts (192.168.10.64/27 on R1 Gi0/1), Management needs 12 hosts (192.168.10.96/28 on R1 Gi0/2), and WAN needs 2 hosts (192.168.10.112/30 on R1 Gi0/3). On R1, enable IPv6 unicast routing, configure Gi0/0 with first usable IPv4 192.168.10.1/26, IPv6 2001:db8:acad::1/64, link-local fe80::1, and bring it up; configure Gi0/1 with 192.168.10.65/27 and Gi0/2 with 192.168.10.97/28. On SW1, configure Management SVI Vlan 30 with 192.168.10.98/28 (up) and set default gateway 192.168.10.97.",
      nodes: [
        { id: "N1", type: "router", label: "R1", sub: "Branch VLSM GW", x: 115, y: 58, status: "blue", configurable: true, selected: true },
        { id: "N2", type: "switch", label: "SW1", sub: "Mgmt .10.98/28", x: 330, y: 58, status: "blue", configurable: true },
        { id: "N3", type: "pc", label: "ENG-LAN", sub: ".10.0/26 + IPv6", x: 75, y: 175, status: "green" },
        { id: "N4", type: "pc", label: "SALES-LAN", sub: ".10.64/27", x: 355, y: 175, status: "green" }
      ],
      links: [
        { x1: 185, y1: 86, x2: 345, y2: 86, label: "Mgmt .10.96/28", status: "blue" },
        { x1: 145, y1: 110, x2: 110, y2: 185, label: "Gi0/0 /26", status: "green" },
        { x1: 375, y1: 110, x2: 390, y2: 185, label: "Gi0/1 /27", status: "green" }
      ],
      objectives: [
        { id: "o1", device: "R1", text: "[R1] Enable IPv6 unicast routing", pattern: /ipv6\s+unicast-routing/i },
        { id: "o2", device: "R1", text: "[R1] Assign 192.168.10.1 255.255.255.192 on Gi0/0", pattern: /ip\s+address\s+192\.168\.10\.1\s+255\.255\.255\.192/i },
        { id: "o3", device: "R1", text: "[R1] Assign IPv6 2001:db8:acad::1/64 and fe80::1 on Gi0/0", pattern: /ipv6\s+address\s+2001:db8:acad::1\/64/i },
        { id: "o4", device: "R1", text: "[R1] Assign Sales subnet gateway 192.168.10.65/27 on Gi0/1", pattern: /ip\s+address\s+192\.168\.10\.65\s+255\.255\.255\.224/i },
        { id: "o5", device: "R1", text: "[R1] Assign Management gateway 192.168.10.97/28 on Gi0/2", pattern: /ip\s+address\s+192\.168\.10\.97\s+255\.255\.255\.240/i },
        { id: "o6", device: "SW1", text: "[SW1] Assign 192.168.10.98 255.255.255.240 on SVI Vlan 30", pattern: /ip\s+address\s+192\.168\.10\.98\s+255\.255\.255\.240/i },
        { id: "o7", device: "SW1", text: "[SW1] Configure default gateway 192.168.10.97", pattern: /ip\s+default-gateway\s+192\.168\.10\.97/i }
      ],
      solutions: {
        R1: ["ipv6 unicast-routing", "interface gigabitethernet 0/0", "ip address 192.168.10.1 255.255.255.192", "ipv6 address 2001:db8:acad::1/64", "ipv6 address fe80::1 link-local", "no shutdown", "interface gigabitethernet 0/1", "ip address 192.168.10.65 255.255.255.224", "no shutdown", "interface gigabitethernet 0/2", "ip address 192.168.10.97 255.255.255.240", "no shutdown"],
        SW1: ["interface vlan 30", "ip address 192.168.10.98 255.255.255.240", "no shutdown", "exit", "ip default-gateway 192.168.10.97"]
      },
      verifyOutput: "R1 VLSM Interfaces UP/UP (Eng /26 + IPv6, Sales /27, Mgmt /28)\nSW1 SVI Vlan 30 (.10.98) -> Default GW .10.97 Reachable"
    },
    {
      id: "LAB-27",
      passerTag: "Enterprise Lab 02 • Break-Fix • Media & Duplex (2 Devices)",
      sectionCode: "1.0",
      section: "1.0 Network Fundamentals",
      title: "Physical Media, SFP Fiber & Duplex Troubleshooting",
      devices: ["SW1", "SW2"],
      scenario: "Break-Fix Ticket: Users on access switch SW2 report slow file transfers, rising CRC errors, and late collisions on FastEthernet 0/1 (currently mismatched at 100 Mbps half-duplex against core switch SW1), and SFP fiber uplink GigabitEthernet 0/1 on SW2 is err-disabled. On SW2, force Fa0/1 to 100 Mbps full-duplex, bounce Gi0/1 (shut then no shut) to recover the SFP port, and enable global errdisable recovery for all causes. On SW1, match Fa0/1 to 100 Mbps full-duplex and ensure Gi0/1 is administratively up.",
      nodes: [
        { id: "N1", type: "switch", label: "SW1", sub: "Core Switch", x: 115, y: 58, status: "blue", configurable: true },
        { id: "N2", type: "switch", label: "SW2", sub: "Duplex/SFP Fault", x: 330, y: 58, status: "red", configurable: true, selected: true },
        { id: "N3", type: "server", label: "FILE-SRV", sub: "Slow Transfers", x: 75, y: 175, status: "orange" },
        { id: "N4", type: "pc", label: "USER-PC", sub: "CRC/Late Coll", x: 355, y: 175, status: "red" }
      ],
      links: [
        { x1: 185, y1: 78, x2: 345, y2: 78, label: "Fa0/1 100/Half!", status: "red" },
        { x1: 185, y1: 98, x2: 345, y2: 98, label: "Gi0/1 SFP Err-Dis", status: "red" },
        { x1: 145, y1: 114, x2: 110, y2: 185, label: "Server Link", status: "green" }
      ],
      objectives: [
        { id: "o1", device: "SW2", text: "[SW2] Set Fa0/1 speed 100 and duplex full", pattern: /^duplex\s+full$/i },
        { id: "o2", device: "SW2", text: "[SW2] Set Fa0/1 speed 100", pattern: /^speed\s+100$/i },
        { id: "o3", device: "SW2", text: "[SW2] Bounce err-disabled Gi0/1 with shutdown then no shutdown", pattern: /^shutdown$/i },
        { id: "o4", device: "SW2", text: "[SW2] Re-enable Gi0/1 with no shutdown", pattern: /^no\s+shutdown$/i },
        { id: "o5", device: "SW2", text: "[SW2] Enable errdisable recovery globally", pattern: /errdisable\s+recovery\s+cause\s+(all|gbic-invalid)/i },
        { id: "o6", device: "SW1", text: "[SW1] Match Fa0/1 duplex full and speed 100", pattern: /^duplex\s+full$/i },
        { id: "o7", device: "SW1", text: "[SW1] Ensure Gi0/1 is administratively up", pattern: /^no\s+shutdown$/i }
      ],
      solutions: {
        SW2: ["errdisable recovery cause all", "interface fastethernet 0/1", "speed 100", "duplex full", "interface gigabitethernet 0/1", "shutdown", "no shutdown"],
        SW1: ["interface fastethernet 0/1", "speed 100", "duplex full", "interface gigabitethernet 0/1", "no shutdown"]
      },
      verifyOutput: "SW1 <-> SW2 Fa0/1: 100/Full Matched (0 CRC / 0 Late Collisions)\nSW2 Gi0/1 SFP Fiber Uplink: Connected (Recovered from err-disabled)"
    },
    {
      id: "LAB-28",
      passerTag: "Enterprise Lab 03 • Build • TCP/UDP Service Ports (2 Devices)",
      sectionCode: "1.0",
      section: "1.0 Network Fundamentals",
      title: "Transport Layer Protocols (TCP vs. UDP) & Service Ports",
      devices: ["R1", "R2"],
      scenario: "A junior admin blocked critical enterprise services on perimeter routers R1 and R2. On R1, create extended named ACL SVC_ALLOW permitting UDP services DNS (port 53), DHCP server (port 67), TFTP (port 69), and SNMP (port 161), plus TCP services SSH (port 22) and HTTPS (port 443) from any to any without permitting Telnet (23) or HTTP (80), and apply SVC_ALLOW inbound on Gi0/0. On R2, create extended ACL 105 permitting TCP SSH (22) and HTTPS (443) to host 10.10.10.50 and apply it inbound on Gi0/0.",
      nodes: [
        { id: "N1", type: "pc", label: "BRANCH-USR", sub: "10.1.1.0/24", x: 35, y: 170, status: "green" },
        { id: "N2", type: "router", label: "R1", sub: "Perimeter ACL", x: 145, y: 55, status: "blue", configurable: true, selected: true },
        { id: "N3", type: "router", label: "R2", sub: "DC Edge ACL", x: 315, y: 55, status: "blue", configurable: true },
        { id: "N4", type: "server", label: "CORE-SVCS", sub: "10.10.10.50", x: 375, y: 170, status: "green" }
      ],
      links: [
        { x1: 175, y1: 108, x2: 95, y2: 185, label: "R1 Gi0/0 In", status: "orange" },
        { x1: 215, y1: 84, x2: 335, y2: 84, label: "WAN Link", status: "blue" },
        { x1: 360, y1: 108, x2: 400, y2: 185, label: "R2 Gi0/0 In", status: "orange" }
      ],
      objectives: [
        { id: "o1", device: "R1", text: "[R1] Permit UDP DNS (53)", pattern: /permit\s+udp\s+any\s+any\s+eq\s+(53|domain)/i },
        { id: "o2", device: "R1", text: "[R1] Permit UDP DHCP (67) and TFTP (69)", pattern: /permit\s+udp\s+any\s+any\s+eq\s+(69|tftp)/i },
        { id: "o3", device: "R1", text: "[R1] Permit UDP SNMP (161)", pattern: /permit\s+udp\s+any\s+any\s+eq\s+(161|snmp)/i },
        { id: "o4", device: "R1", text: "[R1] Permit TCP SSH (22) and HTTPS (443)", pattern: /permit\s+tcp\s+any\s+any\s+eq\s+(443|https)/i },
        { id: "o5", device: "R1", text: "[R1] Apply SVC_ALLOW inbound on Gi0/0", pattern: /ip\s+access-group\s+SVC_ALLOW\s+in/i },
        { id: "o6", device: "R2", text: "[R2] Permit TCP 443 to host 10.10.10.50 in ACL 105", pattern: /access-list\s+105\s+permit\s+tcp\s+any\s+host\s+10\.10\.10\.50\s+eq\s+443/i },
        { id: "o7", device: "R2", text: "[R2] Apply ACL 105 inbound on Gi0/0", pattern: /ip\s+access-group\s+105\s+in/i }
      ],
      solutions: {
        R1: ["ip access-list extended SVC_ALLOW", "permit udp any any eq 53", "permit udp any any eq 67", "permit udp any any eq 69", "permit udp any any eq 161", "permit tcp any any eq 22", "permit tcp any any eq 443", "interface gigabitethernet 0/0", "ip access-group SVC_ALLOW in"],
        R2: ["access-list 105 permit tcp any host 10.10.10.50 eq 22", "access-list 105 permit tcp any host 10.10.10.50 eq 443", "interface gigabitethernet 0/0", "ip access-group 105 in"]
      },
      verifyOutput: "R1 SVC_ALLOW: UDP 53/67/69/161 & TCP 22/443 Restored (Telnet 23 & HTTP 80 Blocked)\nR2 ACL 105: SSH/HTTPS Active to 10.10.10.50"
    },
    {
      id: "LAB-29",
      passerTag: "Enterprise Lab 04 • Build • Hypervisor & Container VLANs (2 Devices)",
      sectionCode: "1.0",
      section: "1.0 Network Fundamentals",
      title: "Type 1 Bare-Metal Hypervisor vSwitch & Container Trunking",
      devices: ["SW1", "SW2"],
      scenario: "Migrate physical servers onto a Type 1 bare-metal ESXi hypervisor host running VMs (VLAN 100, name VM_PROD) and Docker containers (VLAN 200, name DOCKER_APP) connected to Top-of-Rack switch SW1 and upstream switch SW2: On SW1, create VLAN 100 (VM_PROD) and VLAN 200 (DOCKER_APP), configure hypervisor pNIC port Gi0/1 as an 802.1Q trunk allowing only VLANs 100,200 with DTP disabled (nonegotiate), and configure uplink Gi0/2 as a trunk allowing VLANs 100,200. On SW2, create VLANs 100 and 200 and match trunk Gi0/2 allowing VLANs 100,200.",
      nodes: [
        { id: "N1", type: "server", label: "ESXi-HOST", sub: "vSwitch V100/200", x: 55, y: 175, status: "green" },
        { id: "N2", type: "switch", label: "SW1", sub: "ToR Switch", x: 145, y: 55, status: "blue", configurable: true, selected: true },
        { id: "N3", type: "switch", label: "SW2", sub: "DC Dist SW", x: 330, y: 55, status: "blue", configurable: true },
        { id: "N4", type: "server", label: "DOCKER-REG", sub: "VLAN 200", x: 365, y: 175, status: "green" }
      ],
      links: [
        { x1: 165, y1: 108, x2: 95, y2: 185, label: "Gi0/1 vSwitch", status: "blue" },
        { x1: 215, y1: 84, x2: 345, y2: 84, label: "Gi0/2 V100,200", status: "blue" },
        { x1: 375, y1: 108, x2: 395, y2: 185, label: "Container Net", status: "green" }
      ],
      objectives: [
        { id: "o1", device: "SW1", text: "[SW1] Create VLAN 100 named VM_PROD", pattern: /^name\s+VM_PROD$/i },
        { id: "o2", device: "SW1", text: "[SW1] Create VLAN 200 named DOCKER_APP", pattern: /^name\s+DOCKER_APP$/i },
        { id: "o3", device: "SW1", text: "[SW1] Configure static trunk allowing VLANs 100,200", pattern: /switchport\s+trunk\s+allowed\s+vlan\s+100,200/i },
        { id: "o4", device: "SW1", text: "[SW1] Disable DTP on hypervisor trunk (nonegotiate)", pattern: /switchport\s+nonegotiate/i },
        { id: "o5", device: "SW2", text: "[SW2] Create VLAN 100 and VLAN 200", pattern: /^vlan\s+200$/i },
        { id: "o6", device: "SW2", text: "[SW2] Match trunk Gi0/2 allowing VLANs 100,200", pattern: /switchport\s+trunk\s+allowed\s+vlan\s+100,200/i }
      ],
      solutions: {
        SW1: ["vlan 100", "name VM_PROD", "vlan 200", "name DOCKER_APP", "interface gigabitethernet 0/1", "switchport mode trunk", "switchport trunk allowed vlan 100,200", "switchport nonegotiate", "interface gigabitethernet 0/2", "switchport mode trunk", "switchport trunk allowed vlan 100,200"],
        SW2: ["vlan 100", "name VM_PROD", "vlan 200", "name DOCKER_APP", "interface gigabitethernet 0/2", "switchport mode trunk", "switchport trunk allowed vlan 100,200"]
      },
      verifyOutput: "SW1 <-> ESXi vSwitch Trunk UP (VLANs 100,200, DTP Off)\nSW1 <-> SW2 DC Trunk Forwarding VM_PROD & DOCKER_APP"
    },

    // =========================================================================
    // Domain 2.0: Network Access (Labs 05–08 -> LAB-30 to LAB-33)
    // =========================================================================
    {
      id: "LAB-30",
      passerTag: "Enterprise Lab 05 • Break-Fix • 3-Switch Native 99 (3 Devices)",
      sectionCode: "2.0",
      section: "2.0 Network Access",
      title: "3-Switch VLANs, 802.1Q Trunks & Native VLAN Mismatch Fix",
      devices: ["SW1", "SW2", "SW3"],
      scenario: "Break-Fix Ticket: CDP is flooding Native VLAN mismatch alerts between SW1, SW2, and SW3, and staff phones/PCs on SW3 are stuck in VLAN 1. Standardize across all 3 switches with VLAN 10 (STAFF), VLAN 20 (VOICE), and VLAN 99 (NATIVE): On SW1, create VLANs 10, 20, and 99 and set trunk Gi0/1 with Native VLAN 99 allowing 10,20,99. On SW2, match trunk Gi0/1 and Gi0/2 with Native VLAN 99 allowing 10,20,99. On SW3, match uplink trunk Gi0/1 with Native VLAN 99 allowing 10,20,99, and configure access port Fa0/1 with Data VLAN 10 and Voice VLAN 20.",
      nodes: [
        { id: "N1", type: "switch", label: "SW1", sub: "Core SW", x: 55, y: 58, status: "orange", configurable: true, selected: true },
        { id: "N2", type: "switch", label: "SW2", sub: "Dist SW", x: 205, y: 58, status: "red", configurable: true },
        { id: "N3", type: "switch", label: "SW3", sub: "Access SW", x: 355, y: 58, status: "red", configurable: true },
        { id: "N4", type: "pc", label: "STAFF+PHONE", sub: "V10 / Voice V20", x: 355, y: 175, status: "red" }
      ],
      links: [
        { x1: 125, y1: 86, x2: 225, y2: 86, label: "Native Mismatch!", status: "red" },
        { x1: 275, y1: 86, x2: 375, y2: 86, label: "Native Mismatch!", status: "red" },
        { x1: 400, y1: 110, x2: 400, y2: 185, label: "Fa0/1 V10/20", status: "orange" }
      ],
      objectives: [
        { id: "o1", device: "SW1", text: "[SW1] Set trunk Gi0/1 Native VLAN 99", pattern: /switchport\s+trunk\s+native\s+vlan\s+99/i },
        { id: "o2", device: "SW1", text: "[SW1] Allow VLANs 10,20,99 on Gi0/1", pattern: /switchport\s+trunk\s+allowed\s+vlan\s+10,20,99/i },
        { id: "o3", device: "SW2", text: "[SW2] Match Native VLAN 99 on trunks", pattern: /switchport\s+trunk\s+native\s+vlan\s+99/i },
        { id: "o4", device: "SW2", text: "[SW2] Allow VLANs 10,20,99 on trunks", pattern: /switchport\s+trunk\s+allowed\s+vlan\s+10,20,99/i },
        { id: "o5", device: "SW3", text: "[SW3] Match Native VLAN 99 on Gi0/1", pattern: /switchport\s+trunk\s+native\s+vlan\s+99/i },
        { id: "o6", device: "SW3", text: "[SW3] Assign Fa0/1 to Data VLAN 10", pattern: /switchport\s+access\s+vlan\s+10/i },
        { id: "o7", device: "SW3", text: "[SW3] Assign Fa0/1 to Voice VLAN 20", pattern: /switchport\s+voice\s+vlan\s+20/i }
      ],
      solutions: {
        SW1: ["vlan 10", "name STAFF", "vlan 20", "name VOICE", "vlan 99", "name NATIVE", "interface gigabitethernet 0/1", "switchport mode trunk", "switchport trunk native vlan 99", "switchport trunk allowed vlan 10,20,99"],
        SW2: ["vlan 10", "vlan 20", "vlan 99", "interface range gigabitethernet 0/1 - 2", "switchport mode trunk", "switchport trunk native vlan 99", "switchport trunk allowed vlan 10,20,99"],
        SW3: ["vlan 10", "vlan 20", "vlan 99", "interface gigabitethernet 0/1", "switchport mode trunk", "switchport trunk native vlan 99", "switchport trunk allowed vlan 10,20,99", "interface fastethernet 0/1", "switchport mode access", "switchport access vlan 10", "switchport voice vlan 20"]
      },
      verifyOutput: "SW1 <-> SW2 <-> SW3 Native VLAN 99 Matched (0 CDP Mismatches)\nSW3 Fa0/1: Data VLAN 10 + Voice VLAN 20 Operational"
    },
    {
      id: "LAB-31",
      passerTag: "Enterprise Lab 06 • Break-Fix • 4-Link LACP Repair (2 Devices)",
      sectionCode: "2.0",
      section: "2.0 Network Access",
      title: "LACP EtherChannel Misconfiguration Repair & Load-Balancing",
      devices: ["DSW1", "DSW2"],
      scenario: "Break-Fix Ticket: Four GigabitEthernet links (Gi0/1–4) between DSW1 and DSW2 are stuck in suspended (s) state because two ports were misconfigured with PAgP desirable and allowed VLANs don't match. On BOTH DSW1 and DSW2: clear old bundling on Gi0/1–4 and bundle all four ports into Port-Channel 1 using LACP active mode, configure Port-Channel 1 as an 802.1Q trunk allowing VLANs 10,20,30, and set global EtherChannel load-balancing to src-dst-ip.",
      nodes: [
        { id: "N1", type: "switch", label: "DSW1", sub: "Po1 Suspended (s)", x: 115, y: 58, status: "red", configurable: true, selected: true },
        { id: "N2", type: "switch", label: "DSW2", sub: "PAgP/VLAN Bug", x: 330, y: 58, status: "red", configurable: true },
        { id: "N3", type: "server", label: "DB-CLUSTER", sub: "VLAN 20", x: 75, y: 175, status: "green" },
        { id: "N4", type: "server", label: "APP-CLUSTER", sub: "VLAN 30", x: 355, y: 175, status: "green" }
      ],
      links: [
        { x1: 185, y1: 86, x2: 345, y2: 86, label: "Po1 (Gi0/1-4)", status: "red" },
        { x1: 145, y1: 110, x2: 110, y2: 185, label: "VLAN 20", status: "green" },
        { x1: 375, y1: 110, x2: 390, y2: 185, label: "VLAN 30", status: "green" }
      ],
      objectives: [
        { id: "o1", device: "DSW1", text: "[DSW1] Bundle Gi0/1-4 in LACP active mode", pattern: /channel-group\s+1\s+mode\s+active/i },
        { id: "o2", device: "DSW1", text: "[DSW1] Set Po1 trunk allowing VLANs 10,20,30", pattern: /switchport\s+trunk\s+allowed\s+vlan\s+10,20,30/i },
        { id: "o3", device: "DSW1", text: "[DSW1] Set port-channel load-balance src-dst-ip", pattern: /port-channel\s+load-balance\s+src-dst-ip/i },
        { id: "o4", device: "DSW2", text: "[DSW2] Bundle Gi0/1-4 in LACP active mode", pattern: /channel-group\s+1\s+mode\s+active/i },
        { id: "o5", device: "DSW2", text: "[DSW2] Set Po1 trunk allowing VLANs 10,20,30", pattern: /switchport\s+trunk\s+allowed\s+vlan\s+10,20,30/i },
        { id: "o6", device: "DSW2", text: "[DSW2] Set port-channel load-balance src-dst-ip", pattern: /port-channel\s+load-balance\s+src-dst-ip/i }
      ],
      solutions: {
        DSW1: ["port-channel load-balance src-dst-ip", "interface range gigabitethernet 0/1 - 4", "no channel-group", "channel-group 1 mode active", "interface port-channel 1", "switchport mode trunk", "switchport trunk allowed vlan 10,20,30"],
        DSW2: ["port-channel load-balance src-dst-ip", "interface range gigabitethernet 0/1 - 4", "no channel-group", "channel-group 1 mode active", "interface port-channel 1", "switchport mode trunk", "switchport trunk allowed vlan 10,20,30"]
      },
      verifyOutput: "DSW1 Po1(SU) LACP Gi0/1-4(P) <-> DSW2 Po1(SU) LACP Gi0/1-4(P)\nLoad-Balance: src-dst-ip | Allowed VLANs 10,20,30 Matched"
    },
    {
      id: "LAB-32",
      passerTag: "Enterprise Lab 07 • Build • Rapid PVST+ Priority 4096 (3 Devices)",
      sectionCode: "2.0",
      section: "2.0 Network Access",
      title: "Triangle Rapid PVST+ Priority 4096 Root & Edge Protection",
      devices: ["SW1", "SW2", "SW3"],
      scenario: "Upgrade a redundant 3-switch triangle topology (SW1, SW2, SW3) from legacy PVST+ to Rapid PVST+: Enable Rapid PVST+ on all three switches. Make SW1 the primary Root Bridge for VLAN 10 with explicit bridge priority 4096 (or root primary), make SW2 the secondary Root Bridge for VLAN 10, and on SW3 enable PortFast and BPDU Guard on host access range Fa0/1–4.",
      nodes: [
        { id: "N1", type: "switch", label: "SW1", sub: "Priority 4096", x: 75, y: 48, status: "blue", configurable: true, selected: true },
        { id: "N2", type: "switch", label: "SW2", sub: "Secondary Root", x: 335, y: 48, status: "blue", configurable: true },
        { id: "N3", type: "switch", label: "SW3", sub: "Edge PortFast", x: 205, y: 158, status: "green", configurable: true },
        { id: "N4", type: "pc", label: "USERS", sub: "Fa0/1-4 Edge", x: 55, y: 175, status: "green" }
      ],
      links: [
        { x1: 145, y1: 76, x2: 350, y2: 76, label: "Trunk", status: "green" },
        { x1: 120, y1: 102, x2: 225, y2: 168, label: "Root Port", status: "green" },
        { x1: 365, y1: 102, x2: 270, y2: 168, label: "Alt Discard", status: "orange" }
      ],
      objectives: [
        { id: "o1", device: "SW1", text: "[SW1] Enable Rapid PVST+", pattern: /spanning-tree\s+mode\s+rapid-pvst/i },
        { id: "o2", device: "SW1", text: "[SW1] Set VLAN 10 priority 4096 or root primary", pattern: /spanning-tree\s+vlan\s+10\s+(priority\s+4096|root\s+primary)/i },
        { id: "o3", device: "SW2", text: "[SW2] Enable Rapid PVST+", pattern: /spanning-tree\s+mode\s+rapid-pvst/i },
        { id: "o4", device: "SW2", text: "[SW2] Set VLAN 10 root secondary", pattern: /spanning-tree\s+vlan\s+10\s+root\s+secondary/i },
        { id: "o5", device: "SW3", text: "[SW3] Enable Rapid PVST+", pattern: /spanning-tree\s+mode\s+rapid-pvst/i },
        { id: "o6", device: "SW3", text: "[SW3] Enable PortFast on host ports", pattern: /spanning-tree\s+portfast/i },
        { id: "o7", device: "SW3", text: "[SW3] Enable BPDU Guard on host ports", pattern: /spanning-tree\s+bpduguard\s+enable/i }
      ],
      solutions: {
        SW1: ["spanning-tree mode rapid-pvst", "spanning-tree vlan 10 priority 4096"],
        SW2: ["spanning-tree mode rapid-pvst", "spanning-tree vlan 10 root secondary"],
        SW3: ["spanning-tree mode rapid-pvst", "interface range fastethernet 0/1 - 4", "spanning-tree portfast", "spanning-tree bpduguard enable"]
      },
      verifyOutput: "Rapid PVST+ VLAN 10 Converged: SW1=Root (4106), SW2=Secondary, SW3 Fa0/1-4=Edge+BPDUGuard"
    },
    {
      id: "LAB-33",
      passerTag: "Enterprise Lab 08 • Build • WLC CAPWAP & WLANs (3 Devices)",
      sectionCode: "2.0",
      section: "2.0 Network Access",
      title: "Cisco WLC CAPWAP Discovery, Option 43 & Dual WLAN Setup",
      devices: ["SW1", "R1", "WLC1"],
      scenario: "Onboard a Lightweight AP over CAPWAP and provision Corporate + Guest wireless networks across 3 devices: On SW1, configure WLC trunk Gi0/1 as an 802.1Q trunk with Native VLAN 10 (AP Mgmt) allowing VLANs 10,30,40. On R1, configure DHCP pool AP_MGMT for 10.10.10.0/24 with default gateway 10.10.10.1 and DHCP Option 43 pointing to WLC IP 10.10.10.5 (hex f1040a0a0a05 or ip 10.10.10.5). On WLC1, map WLAN CORP to VLAN 30 with WPA2-Enterprise (802.1X RADIUS) and map WLAN GUEST to VLAN 40 with WPA2-PSK.",
      nodes: [
        { id: "N1", type: "router", label: "R1", sub: "DHCP Opt 43", x: 55, y: 58, status: "blue", configurable: true },
        { id: "N2", type: "switch", label: "SW1", sub: "WLC Trunk", x: 205, y: 58, status: "blue", configurable: true, selected: true },
        { id: "N3", type: "server", label: "WLC1", sub: "10.10.10.5 CAPWAP", x: 355, y: 58, status: "blue", configurable: true },
        { id: "N4", type: "pc", label: "LAP-1", sub: "CORP V30 / GUEST V40", x: 205, y: 175, status: "green" }
      ],
      links: [
        { x1: 125, y1: 86, x2: 225, y2: 86, label: "DHCP Opt 43", status: "blue" },
        { x1: 275, y1: 86, x2: 375, y2: 86, label: "Gi0/1 V10,30,40", status: "blue" },
        { x1: 250, y1: 110, x2: 250, y2: 185, label: "CAPWAP 5246/47", status: "green" }
      ],
      objectives: [
        { id: "o1", device: "SW1", text: "[SW1] Set Gi0/1 Native VLAN 10", pattern: /switchport\s+trunk\s+native\s+vlan\s+10/i },
        { id: "o2", device: "SW1", text: "[SW1] Allow VLANs 10,30,40 on WLC trunk Gi0/1", pattern: /switchport\s+trunk\s+allowed\s+vlan\s+10,30,40/i },
        { id: "o3", device: "R1", text: "[R1] Configure DHCP pool network 10.10.10.0/24", pattern: /network\s+10\.10\.10\.0\s+255\.255\.255\.0/i },
        { id: "o4", device: "R1", text: "[R1] Configure DHCP Option 43 for WLC discovery", pattern: /option\s+43\s+(hex|ip)\s+\S+/i },
        { id: "o5", device: "WLC1", text: "[WLC1] Map WLAN CORP to VLAN 30", pattern: /wlan\s+CORP\s+vlan\s+30/i },
        { id: "o6", device: "WLC1", text: "[WLC1] Enable WPA2-Enterprise on CORP", pattern: /wlan\s+CORP\s+security\s+wpa2-enterprise/i },
        { id: "o7", device: "WLC1", text: "[WLC1] Map WLAN GUEST to VLAN 40 with WPA2-PSK", pattern: /wlan\s+GUEST\s+vlan\s+40/i },
        { id: "o8", device: "WLC1", text: "[WLC1] Enable WPA2-PSK on GUEST", pattern: /wlan\s+GUEST\s+security\s+wpa2-psk/i }
      ],
      solutions: {
        SW1: ["interface gigabitethernet 0/1", "switchport mode trunk", "switchport trunk native vlan 10", "switchport trunk allowed vlan 10,30,40"],
        R1: ["ip dhcp pool AP_MGMT", "network 10.10.10.0 255.255.255.0", "default-router 10.10.10.1", "option 43 hex f1040a0a0a05"],
        WLC1: ["wlan CORP vlan 30", "wlan CORP security wpa2-enterprise", "wlan GUEST vlan 40", "wlan GUEST security wpa2-psk CiscoGuest123"]
      },
      verifyOutput: "LAP-1 Joined WLC1 (10.10.10.5) via CAPWAP UDP 5246/5247\nSSID CORP (VLAN 30, 802.1X) & GUEST (VLAN 40, WPA2-PSK) Broadcasting"
    },

    // =========================================================================
    // Domain 3.0: IP Connectivity (Labs 09–13 -> LAB-34 to LAB-38)
    // =========================================================================
    {
      id: "LAB-34",
      passerTag: "Enterprise Lab 09 • Build • Longest Prefix & AD Steering (2 Devices)",
      sectionCode: "3.0",
      section: "3.0 IP Connectivity",
      title: "Routing Table Longest Prefix Match & AD Traffic Steering",
      devices: ["R1", "R2"],
      scenario: "Steer traffic across overlapping 172.16.0.0/16 paths on multi-homed routers R1 and R2: On R1, steer 172.16.10.0/25 onto the primary fiber link (next-hop 10.0.1.2) using longest-prefix static routing, configure a floating backup /24 route for 172.16.10.0/24 via secondary link 10.0.2.2 with AD 120, and add a /32 host route for server 172.16.10.10 via 10.0.1.2. On R2, set OSPF interface cost to 10 on primary fiber Gi0/0 and configure a return route for 10.10.0.0/16 via 10.0.1.1.",
      nodes: [
        { id: "N1", type: "router", label: "R1", sub: "Multi-Homed Edge", x: 115, y: 58, status: "blue", configurable: true, selected: true },
        { id: "N2", type: "router", label: "R2", sub: "Core Hub", x: 330, y: 58, status: "blue", configurable: true },
        { id: "N3", type: "pc", label: "BRANCH", sub: "10.10.0.0/16", x: 75, y: 175, status: "green" },
        { id: "N4", type: "server", label: "DC-SRV", sub: "172.16.10.10", x: 355, y: 175, status: "green" }
      ],
      links: [
        { x1: 185, y1: 76, x2: 345, y2: 76, label: "Fiber 10.0.1.0/30", status: "green" },
        { x1: 185, y1: 98, x2: 345, y2: 98, label: "Backup 10.0.2.0/30", status: "orange" },
        { x1: 375, y1: 114, x2: 390, y2: 185, label: "172.16.10.0/24", status: "blue" }
      ],
      objectives: [
        { id: "o1", device: "R1", text: "[R1] Longest-prefix /25 route via 10.0.1.2", pattern: /ip\s+route\s+172\.16\.10\.0\s+255\.255\.255\.128\s+10\.0\.1\.2/i },
        { id: "o2", device: "R1", text: "[R1] Floating backup /24 route via 10.0.2.2 AD 120", pattern: /ip\s+route\s+172\.16\.10\.0\s+255\.255\.255\.0\s+10\.0\.2\.2\s+120/i },
        { id: "o3", device: "R1", text: "[R1] /32 host route to 172.16.10.10 via 10.0.1.2", pattern: /ip\s+route\s+172\.16\.10\.10\s+255\.255\.255\.255\s+10\.0\.1\.2/i },
        { id: "o4", device: "R2", text: "[R2] Set OSPF cost 10 on Gi0/0", pattern: /ip\s+ospf\s+cost\s+10/i },
        { id: "o5", device: "R2", text: "[R2] Return static route to 10.10.0.0/16 via 10.0.1.1", pattern: /ip\s+route\s+10\.10\.0\.0\s+255\.255\.0\.0\s+10\.0\.1\.1/i }
      ],
      solutions: {
        R1: ["ip route 172.16.10.0 255.255.255.128 10.0.1.2", "ip route 172.16.10.0 255.255.255.0 10.0.2.2 120", "ip route 172.16.10.10 255.255.255.255 10.0.1.2"],
        R2: ["interface gigabitethernet 0/0", "ip ospf cost 10", "exit", "ip route 10.10.0.0 255.255.0.0 10.0.1.1"]
      },
      verifyOutput: "R1 Routing Decision: 172.16.10.10 -> /32 Host via Fiber 10.0.1.2 (Longest Match)\nR1 Backup /24 (AD 120) Standing By | R2 Cost 10 & Return Route Active"
    },
    {
      id: "LAB-35",
      passerTag: "Enterprise Lab 10 • Build • Dual-Stack Failover AD 200 (2 Devices)",
      sectionCode: "3.0",
      section: "3.0 IP Connectivity",
      title: "Dual-Stack IPv4/IPv6 Default & AD 200 LTE Floating Failover",
      devices: ["R1", "R2"],
      scenario: "Configure symmetric dual-stack WAN failover across Branch R1 and HQ R2 with a primary ISP fiber circuit and a backup LTE circuit (AD 200): Enable IPv6 unicast routing on both routers. On R1, configure a primary IPv4 default route via 203.0.113.1, a floating IPv4 default route via 198.51.100.1 with AD 200, a primary IPv6 default route via 2001:db8:1::1, and a floating IPv6 default route via 2001:db8:2::1 with AD 200. On R2, configure primary IPv4 return route to 10.50.0.0/24 via 203.0.113.2 and floating LTE backup via 198.51.100.2 with AD 200.",
      nodes: [
        { id: "N1", type: "router", label: "R1", sub: "Branch Edge", x: 115, y: 58, status: "blue", configurable: true, selected: true },
        { id: "N2", type: "router", label: "R2", sub: "HQ Hub", x: 330, y: 58, status: "blue", configurable: true },
        { id: "N3", type: "pc", label: "BRANCH-PC", sub: "10.50.0.10", x: 75, y: 175, status: "green" },
        { id: "N4", type: "server", label: "HQ-CLOUD", sub: "2001:db8:hq::1", x: 355, y: 175, status: "green" }
      ],
      links: [
        { x1: 185, y1: 76, x2: 345, y2: 76, label: "Primary ISP AD 1", status: "green" },
        { x1: 185, y1: 98, x2: 345, y2: 98, label: "LTE Backup AD 200", status: "orange" },
        { x1: 145, y1: 114, x2: 110, y2: 185, label: "Branch LAN", status: "blue" }
      ],
      objectives: [
        { id: "o1", device: "R1", text: "[R1] Enable IPv6 unicast routing", pattern: /ipv6\s+unicast-routing/i },
        { id: "o2", device: "R1", text: "[R1] Primary IPv4 default route via 203.0.113.1", pattern: /ip\s+route\s+0\.0\.0\.0\s+0\.0\.0\.0\s+203\.0\.113\.1$/i },
        { id: "o3", device: "R1", text: "[R1] Floating IPv4 LTE default route via 198.51.100.1 AD 200", pattern: /ip\s+route\s+0\.0\.0\.0\s+0\.0\.0\.0\s+198\.51\.100\.1\s+200/i },
        { id: "o4", device: "R1", text: "[R1] Primary IPv6 default route via 2001:db8:1::1", pattern: /ipv6\s+route\s+::\/0\s+2001:db8:1::1$/i },
        { id: "o5", device: "R1", text: "[R1] Floating IPv6 LTE default route via 2001:db8:2::1 AD 200", pattern: /ipv6\s+route\s+::\/0\s+2001:db8:2::1\s+200/i },
        { id: "o6", device: "R2", text: "[R2] Primary return route to 10.50.0.0/24 via 203.0.113.2", pattern: /ip\s+route\s+10\.50\.0\.0\s+255\.255\.255\.0\s+203\.0\.113\.2$/i },
        { id: "o7", device: "R2", text: "[R2] Floating LTE return route via 198.51.100.2 AD 200", pattern: /ip\s+route\s+10\.50\.0\.0\s+255\.255\.255\.0\s+198\.51\.100\.2\s+200/i }
      ],
      solutions: {
        R1: ["ipv6 unicast-routing", "ip route 0.0.0.0 0.0.0.0 203.0.113.1", "ip route 0.0.0.0 0.0.0.0 198.51.100.1 200", "ipv6 route ::/0 2001:db8:1::1", "ipv6 route ::/0 2001:db8:2::1 200"],
        R2: ["ipv6 unicast-routing", "ip route 10.50.0.0 255.255.255.0 203.0.113.2", "ip route 10.50.0.0 255.255.255.0 198.51.100.2 200"]
      },
      verifyOutput: "R1 & R2 Dual-Stack Primary ISP (AD 1) Active | LTE Backup Routes (AD 200) Armed for Automatic Failover"
    },
    {
      id: "LAB-36",
      passerTag: "Enterprise Lab 11 • Build • OSPFv2 Proc 10 P2P (3 Devices)",
      sectionCode: "3.0",
      section: "3.0 IP Connectivity",
      title: "3-Router Single-Area OSPFv2 Process 10, RID & Point-to-Point",
      devices: ["R1", "R2", "R3"],
      scenario: "Build a 3-router OSPFv2 enterprise core (Process ID 10, Area 0) with zero DR/BDR wait timers: On R1, configure Router-ID 1.1.1.1, advertise 10.1.0.0/24 in Area 0, suppress Hellos on LAN Gi0/1, and set WAN Gi0/0 to OSPF point-to-point. On R2, configure Router-ID 2.2.2.2, advertise 10.1.0.0/16 in Area 0, and set WAN Gi0/0 and Gi0/1 to point-to-point. On R3, configure Router-ID 3.3.3.3, advertise 10.1.3.0/24 in Area 0, suppress Hellos on LAN Gi0/1, and set WAN Gi0/0 to point-to-point.",
      nodes: [
        { id: "N1", type: "router", label: "R1", sub: "RID 1.1.1.1", x: 55, y: 58, status: "blue", configurable: true, selected: true },
        { id: "N2", type: "router", label: "R2", sub: "RID 2.2.2.2", x: 205, y: 58, status: "blue", configurable: true },
        { id: "N3", type: "router", label: "R3", sub: "RID 3.3.3.3", x: 355, y: 58, status: "blue", configurable: true },
        { id: "N4", type: "pc", label: "LAN-USERS", sub: "Passive Gi0/1", x: 355, y: 175, status: "green" }
      ],
      links: [
        { x1: 125, y1: 86, x2: 225, y2: 86, label: "P2P Area 0", status: "blue" },
        { x1: 275, y1: 86, x2: 375, y2: 86, label: "P2P Area 0", status: "blue" },
        { x1: 400, y1: 110, x2: 400, y2: 185, label: "Passive LAN", status: "green" }
      ],
      objectives: [
        { id: "o1", device: "R1", text: "[R1] Set OSPF 10 Router-ID 1.1.1.1", pattern: /router-id\s+1\.1\.1\.1/i },
        { id: "o2", device: "R1", text: "[R1] Set passive-interface Gi0/1", pattern: /passive-interface\s+g(igabitethernet)?\s*0\/1/i },
        { id: "o3", device: "R1", text: "[R1] Set Gi0/0 OSPF point-to-point", pattern: /ip\s+ospf\s+network\s+point-to-point/i },
        { id: "o4", device: "R2", text: "[R2] Set OSPF 10 Router-ID 2.2.2.2", pattern: /router-id\s+2\.2\.2\.2/i },
        { id: "o5", device: "R2", text: "[R2] Set WAN interfaces OSPF point-to-point", pattern: /ip\s+ospf\s+network\s+point-to-point/i },
        { id: "o6", device: "R3", text: "[R3] Set OSPF 10 Router-ID 3.3.3.3", pattern: /router-id\s+3\.3\.3\.3/i },
        { id: "o7", device: "R3", text: "[R3] Set passive-interface Gi0/1", pattern: /passive-interface\s+g(igabitethernet)?\s*0\/1/i },
        { id: "o8", device: "R3", text: "[R3] Set Gi0/0 OSPF point-to-point", pattern: /ip\s+ospf\s+network\s+point-to-point/i }
      ],
      solutions: {
        R1: ["router ospf 10", "router-id 1.1.1.1", "network 10.1.0.0 0.0.0.255 area 0", "passive-interface gigabitethernet 0/1", "interface gigabitethernet 0/0", "ip ospf network point-to-point"],
        R2: ["router ospf 10", "router-id 2.2.2.2", "network 10.1.0.0 0.0.255.255 area 0", "interface range gigabitethernet 0/0 - 1", "ip ospf network point-to-point"],
        R3: ["router ospf 10", "router-id 3.3.3.3", "network 10.1.3.0 0.0.0.255 area 0", "passive-interface gigabitethernet 0/1", "interface gigabitethernet 0/0", "ip ospf network point-to-point"]
      },
      verifyOutput: "OSPF Process 10 Area 0: R1 (1.1.1.1) <-> R2 (2.2.2.2) <-> R3 (3.3.3.3) FULL/- (Point-to-Point)"
    },
    {
      id: "LAB-37",
      passerTag: "Enterprise Lab 12 • Break-Fix • 4-Router OSPF Faults (4 Devices)",
      sectionCode: "3.0",
      section: "3.0 IP Connectivity",
      title: "4-Router OSPFv2 Adjacency Failure Troubleshooting",
      devices: ["R1", "R2", "R3", "R4"],
      scenario: "Break-Fix Ticket: Four routers in OSPF Process 1 Area 0 have broken adjacencies caused by 4 distinct faults: (1) R1–R2 have mismatched Hello/Dead timers (R2 is stuck on 5/20 instead of 10/40); (2) R2–R3 are stuck in EXSTART due to an IP MTU mismatch on R3 Gi0/0 (needs IP MTU 1500 or MTU-ignore); (3) R3 Gi0/1 facing R4 was placed in Area 10 instead of Area 0; and (4) R4 has a duplicate Router-ID matching R3 (must be changed to 4.4.4.4). Repair all four faults across R1, R2, R3, and R4.",
      nodes: [
        { id: "N1", type: "router", label: "R1", sub: "10s/40s Ref", x: 32, y: 58, status: "orange", configurable: true, selected: true },
        { id: "N2", type: "router", label: "R2", sub: "Timer Fault", x: 145, y: 58, status: "red", configurable: true },
        { id: "N3", type: "router", label: "R3", sub: "MTU/Area Fault", x: 265, y: 58, status: "red", configurable: true },
        { id: "N4", type: "router", label: "R4", sub: "Dup RID Fault", x: 380, y: 58, status: "red", configurable: true }
      ],
      links: [
        { x1: 95, y1: 86, x2: 165, y2: 86, label: "Timer Bug", status: "red" },
        { x1: 210, y1: 86, x2: 285, y2: 86, label: "EXSTART MTU", status: "red" },
        { x1: 330, y1: 86, x2: 395, y2: 86, label: "Area/RID Bug", status: "red" }
      ],
      objectives: [
        { id: "o1", device: "R1", text: "[R1] Confirm standard Hello 10 on Gi0/0", pattern: /ip\s+ospf\s+hello-interval\s+10/i },
        { id: "o2", device: "R2", text: "[R2] Fix Hello interval to 10 on Gi0/0", pattern: /ip\s+ospf\s+hello-interval\s+10/i },
        { id: "o3", device: "R2", text: "[R2] Fix Dead interval to 40 on Gi0/0", pattern: /ip\s+ospf\s+dead-interval\s+40/i },
        { id: "o4", device: "R3", text: "[R3] Fix MTU mismatch on Gi0/0 (ip mtu 1500 or mtu-ignore)", pattern: /ip\s+(mtu\s+1500|ospf\s+mtu-ignore)/i },
        { id: "o5", device: "R3", text: "[R3] Move Gi0/1 into Area 0", pattern: /ip\s+ospf\s+1\s+area\s+0/i },
        { id: "o6", device: "R4", text: "[R4] Assign unique OSPF Router-ID 4.4.4.4", pattern: /router-id\s+4\.4\.4\.4/i }
      ],
      solutions: {
        R1: ["interface gigabitethernet 0/0", "ip ospf hello-interval 10", "ip ospf dead-interval 40"],
        R2: ["interface gigabitethernet 0/0", "ip ospf hello-interval 10", "ip ospf dead-interval 40"],
        R3: ["interface gigabitethernet 0/0", "ip mtu 1500", "interface gigabitethernet 0/1", "ip ospf 1 area 0"],
        R4: ["router ospf 1", "router-id 4.4.4.4"]
      },
      verifyOutput: "R1 <-> R2 (Timers 10/40) FULL | R2 <-> R3 (MTU 1500) FULL | R3 <-> R4 (Area 0, RID 4.4.4.4) FULL"
    },
    {
      id: "LAB-38",
      passerTag: "Enterprise Lab 13 • Build • HSRP Tracking & Failover (2 Devices)",
      sectionCode: "3.0",
      section: "3.0 IP Connectivity",
      title: "HSRP Active/Standby Gateway Redundancy & Object Tracking",
      devices: ["R1", "R2"],
      scenario: "Provide resilient default gateway 10.10.10.1 for VLAN 10 (10.10.10.0/24) using HSRP Group 10 across R1 and R2: On R1 Gi0/0, configure HSRP Group 10 with virtual IP 10.10.10.1, set priority 150, enable preemption, and track uplink object 1 with a priority decrement of 60 so R1 drops below R2 upon WAN outage. On R2 Gi0/0, configure HSRP Group 10 with virtual IP 10.10.10.1, priority 100, and preemption.",
      nodes: [
        { id: "N1", type: "router", label: "R1", sub: "Active P150 Track", x: 115, y: 55, status: "blue", configurable: true, selected: true },
        { id: "N2", type: "router", label: "R2", sub: "Standby P100", x: 330, y: 55, status: "blue", configurable: true },
        { id: "N3", type: "switch", label: "SW-V10", sub: "VIP 10.10.10.1", x: 222, y: 135, status: "green" },
        { id: "N4", type: "pc", label: "CLIENT-10", sub: "10.10.10.50", x: 222, y: 192, status: "green" }
      ],
      links: [
        { x1: 165, y1: 105, x2: 245, y2: 148, label: "R1 Track -60", status: "green" },
        { x1: 355, y1: 105, x2: 295, y2: 148, label: "R2 Standby", status: "orange" },
        { x1: 270, y1: 170, x2: 270, y2: 200, label: "VIP .10.1", status: "blue" }
      ],
      objectives: [
        { id: "o1", device: "R1", text: "[R1] Set HSRP Group 10 VIP 10.10.10.1", pattern: /standby\s+10\s+ip\s+10\.10\.10\.1/i },
        { id: "o2", device: "R1", text: "[R1] Set HSRP Group 10 priority 150", pattern: /standby\s+10\s+priority\s+150/i },
        { id: "o3", device: "R1", text: "[R1] Enable HSRP Group 10 preempt", pattern: /standby\s+10\s+preempt/i },
        { id: "o4", device: "R1", text: "[R1] Track object 1 with decrement 60", pattern: /standby\s+10\s+track\s+1\s+decrement\s+60/i },
        { id: "o5", device: "R2", text: "[R2] Set HSRP Group 10 VIP 10.10.10.1", pattern: /standby\s+10\s+ip\s+10\.10\.10\.1/i },
        { id: "o6", device: "R2", text: "[R2] Enable HSRP Group 10 preempt on R2", pattern: /standby\s+10\s+preempt/i }
      ],
      solutions: {
        R1: ["interface gigabitethernet 0/0", "standby 10 ip 10.10.10.1", "standby 10 priority 150", "standby 10 preempt", "standby 10 track 1 decrement 60"],
        R2: ["interface gigabitethernet 0/0", "standby 10 ip 10.10.10.1", "standby 10 priority 100", "standby 10 preempt"]
      },
      verifyOutput: "HSRP Grp 10 VIP 10.10.10.1: R1 Active (Pri 150, Track 1 -60 -> 90 on fail) | R2 Standby (Pri 100, Preempt)"
    },

    // =========================================================================
    // Domain 4.0: IP Services (Labs 14–15 -> LAB-39 to LAB-40)
    // =========================================================================
    {
      id: "LAB-39",
      passerTag: "Enterprise Lab 14 • Build • PAT + Static NAT DMZ (2 Devices)",
      sectionCode: "4.0",
      section: "4.0 IP Services",
      title: "Enterprise PAT Overload & Static NAT Web Server Publishing",
      devices: ["R1", "R2"],
      scenario: "Configure combined PAT overload and Static NAT on Edge Router R1 plus internal routing on R2: On R1, mark outside ISP interface Gi0/0 as NAT outside, mark inside LAN Gi0/1 and DMZ Gi0/2 as NAT inside, create standard ACL 1 permitting internal LAN 192.168.50.0/24, enable PAT overload for ACL 1 using Gi0/0, and publish DMZ web server 192.168.100.10 to public IP 203.0.113.5 via Static NAT. On R2 (Internal Router), configure a default route via R1 (192.168.50.1).",
      nodes: [
        { id: "N1", type: "pc", label: "LAN-50", sub: "192.168.50.0/24", x: 35, y: 170, status: "green" },
        { id: "N2", type: "router", label: "R2", sub: "Internal Core", x: 145, y: 55, status: "blue", configurable: true },
        { id: "N3", type: "router", label: "R1", sub: "PAT + Static NAT", x: 315, y: 55, status: "blue", configurable: true, selected: true },
        { id: "N4", type: "server", label: "DMZ-WEB", sub: ".100.10 -> .113.5", x: 375, y: 170, status: "green" }
      ],
      links: [
        { x1: 175, y1: 108, x2: 95, y2: 185, label: "LAN 50", status: "green" },
        { x1: 215, y1: 84, x2: 335, y2: 84, label: "Gi0/1 NAT In", status: "blue" },
        { x1: 360, y1: 108, x2: 400, y2: 185, label: "Gi0/2 DMZ In", status: "orange" }
      ],
      objectives: [
        { id: "o1", device: "R1", text: "[R1] Create ACL 1 permitting 192.168.50.0/24", pattern: /access-list\s+1\s+permit\s+192\.168\.50\.0\s+0\.0\.0\.255/i },
        { id: "o2", device: "R1", text: "[R1] Mark NAT outside and NAT inside interfaces", pattern: /^ip\s+nat\s+outside$/i },
        { id: "o3", device: "R1", text: "[R1] Mark NAT inside interface", pattern: /^ip\s+nat\s+inside$/i },
        { id: "o4", device: "R1", text: "[R1] Enable PAT overload via Gi0/0", pattern: /ip\s+nat\s+inside\s+source\s+list\s+1\s+int(erface)?\s+g(igabitethernet)?\s*0\/0\s+overload/i },
        { id: "o5", device: "R1", text: "[R1] Map Static NAT 192.168.100.10 to 203.0.113.5", pattern: /ip\s+nat\s+inside\s+source\s+static\s+192\.168\.100\.10\s+203\.0\.113\.5/i },
        { id: "o6", device: "R2", text: "[R2] Default route via 192.168.50.1", pattern: /ip\s+route\s+0\.0\.0\.0\s+0\.0\.0\.0\s+192\.168\.50\.1/i }
      ],
      solutions: {
        R1: ["access-list 1 permit 192.168.50.0 0.0.0.255", "interface gigabitethernet 0/0", "ip nat outside", "interface gigabitethernet 0/1", "ip nat inside", "interface gigabitethernet 0/2", "ip nat inside", "exit", "ip nat inside source list 1 interface gigabitethernet 0/0 overload", "ip nat inside source static 192.168.100.10 203.0.113.5"],
        R2: ["ip route 0.0.0.0 0.0.0.0 192.168.50.1"]
      },
      verifyOutput: "R1 PAT Active (192.168.50.0/24 -> Gi0/0) + Static NAT Active (203.0.113.5 <-> 192.168.100.10)\nR2 Default Route -> 192.168.50.1 Up"
    },
    {
      id: "LAB-40",
      passerTag: "Enterprise Lab 15 • Build • Core IP Services & QoS (2 Devices)",
      sectionCode: "4.0",
      section: "4.0 IP Services",
      title: "Core IP Services: DHCP Relay, NTP, Syslog, SNMPv3 & QoS",
      devices: ["R1", "SW1"],
      scenario: "Deploy all core enterprise IP services across Branch Router R1 and Access Switch SW1: On R1, configure DHCP relay on LAN Gi0/0 pointing to 10.1.1.50, synchronize clock to NTP server 10.1.1.50, send Syslog messages up to severity informational to host 10.1.1.60, and configure SNMPv3 authPriv group NOC with user netmon (SHA auth + AES 128 privacy). On SW1, enable QoS globally and configure DSCP trust on uplink Gi0/1, plus point Syslog to 10.1.1.60.",
      nodes: [
        { id: "N1", type: "router", label: "R1", sub: "DHCP/NTP/SNMPv3", x: 115, y: 58, status: "blue", configurable: true, selected: true },
        { id: "N2", type: "switch", label: "SW1", sub: "QoS Trust DSCP", x: 330, y: 58, status: "blue", configurable: true },
        { id: "N3", type: "server", label: "NOC-NMS", sub: "10.1.1.50 / .60", x: 75, y: 175, status: "green" },
        { id: "N4", type: "pc", label: "VOIP-USER", sub: "EF DSCP 46", x: 355, y: 175, status: "green" }
      ],
      links: [
        { x1: 185, y1: 86, x2: 345, y2: 86, label: "Gi0/1 Trust DSCP", status: "blue" },
        { x1: 145, y1: 110, x2: 110, y2: 185, label: "NTP/Syslog/SNMP", status: "green" },
        { x1: 375, y1: 110, x2: 390, y2: 185, label: "VoIP LAN", status: "green" }
      ],
      objectives: [
        { id: "o1", device: "R1", text: "[R1] Configure DHCP relay to 10.1.1.50 on Gi0/0", pattern: /ip\s+helper-address\s+10\.1\.1\.50/i },
        { id: "o2", device: "R1", text: "[R1] Sync NTP to 10.1.1.50", pattern: /ntp\s+server\s+10\.1\.1\.50/i },
        { id: "o3", device: "R1", text: "[R1] Configure Syslog host 10.1.1.60 and trap informational", pattern: /logging\s+trap\s+(informational|6)/i },
        { id: "o4", device: "R1", text: "[R1] Configure SNMPv3 authPriv group NOC", pattern: /snmp-server\s+group\s+NOC\s+v3\s+priv/i },
        { id: "o5", device: "R1", text: "[R1] Create SNMPv3 user netmon with SHA + AES 128", pattern: /snmp-server\s+user\s+netmon\s+NOC\s+v3\s+auth\s+sha\s+\S+\s+priv\s+aes\s+128\s+\S+/i },
        { id: "o6", device: "SW1", text: "[SW1] Enable QoS globally and trust DSCP on Gi0/1", pattern: /mls\s+qos\s+trust\s+dscp/i },
        { id: "o7", device: "SW1", text: "[SW1] Point Syslog to 10.1.1.60", pattern: /logging\s+host\s+10\.1\.1\.60/i }
      ],
      solutions: {
        R1: ["interface gigabitethernet 0/0", "ip helper-address 10.1.1.50", "exit", "ntp server 10.1.1.50", "logging host 10.1.1.60", "logging trap informational", "snmp-server group NOC v3 priv", "snmp-server user netmon NOC v3 auth sha AuthPass123 priv aes 128 PrivPass123"],
        SW1: ["mls qos", "interface gigabitethernet 0/1", "mls qos trust dscp", "exit", "logging host 10.1.1.60"]
      },
      verifyOutput: "R1: DHCP Relay, NTP (.50), Syslog Informational (.60) & SNMPv3 authPriv Active\nSW1: MLS QoS Trust DSCP Active on Gi0/1 + Syslog Forwarding"
    },

    // =========================================================================
    // Domain 5.0: Security Fundamentals (Labs 16–18 -> LAB-41 to LAB-43)
    // =========================================================================
    {
      id: "LAB-41",
      passerTag: "Enterprise Lab 16 • Build • Named Extended ACL & SSHv2 (2 Devices)",
      sectionCode: "5.0",
      section: "5.0 Security Fundamentals",
      title: "Extended Named ACL (BRANCH-FILTER) & SSHv2 Hardening",
      devices: ["R1", "SW1"],
      scenario: "Enforce granular traffic filtering and SSHv2 management across R1 and SW1: On R1, create extended named ACL BRANCH-FILTER that denies all IP traffic from HR (10.10.20.0/24) to Finance servers (10.10.30.0/24), permits UDP DNS (53) and TCP HTTPS (443) to any, and permits ICMP echo-reply, then apply BRANCH-FILTER inbound on Gi0/0; also configure domain corp.local, local user admin with secret CiscoSec123, 2048-bit RSA keys, SSHv2, and VTY 0–15 local login with SSH-only transport. On SW1, configure domain corp.local, SSHv2, and VTY SSH-only transport.",
      nodes: [
        { id: "N1", type: "pc", label: "HR-USERS", sub: "10.10.20.0/24", x: 35, y: 170, status: "orange" },
        { id: "N2", type: "router", label: "R1", sub: "BRANCH-FILTER", x: 145, y: 55, status: "blue", configurable: true, selected: true },
        { id: "N3", type: "switch", label: "SW1", sub: "SSHv2 Hardened", x: 315, y: 55, status: "blue", configurable: true },
        { id: "N4", type: "server", label: "FIN-SRVS", sub: "10.10.30.0/24", x: 375, y: 170, status: "green" }
      ],
      links: [
        { x1: 175, y1: 108, x2: 95, y2: 185, label: "Gi0/0 ACL In", status: "orange" },
        { x1: 215, y1: 84, x2: 335, y2: 84, label: "SSHv2 Mgmt", status: "blue" },
        { x1: 360, y1: 108, x2: 400, y2: 185, label: "Finance Net", status: "green" }
      ],
      objectives: [
        { id: "o1", device: "R1", text: "[R1] Deny HR 10.10.20.0/24 to Finance 10.10.30.0/24", pattern: /deny\s+ip\s+10\.10\.20\.0\s+0\.0\.0\.255\s+10\.10\.30\.0\s+0\.0\.0\.255/i },
        { id: "o2", device: "R1", text: "[R1] Permit UDP DNS (53) and TCP HTTPS (443)", pattern: /permit\s+tcp\s+any\s+any\s+eq\s+443/i },
        { id: "o3", device: "R1", text: "[R1] Permit ICMP echo-reply", pattern: /permit\s+icmp\s+any\s+any\s+echo-reply/i },
        { id: "o4", device: "R1", text: "[R1] Apply BRANCH-FILTER inbound on Gi0/0", pattern: /ip\s+access-group\s+BRANCH-FILTER\s+in/i },
        { id: "o5", device: "R1", text: "[R1] Generate 2048-bit RSA keys & enforce SSHv2", pattern: /crypto\s+key\s+generate\s+rsa/i },
        { id: "o6", device: "R1", text: "[R1] Enforce VTY SSH-only transport", pattern: /transport\s+input\s+ssh/i },
        { id: "o7", device: "SW1", text: "[SW1] Enforce SSHv2 and VTY SSH-only transport", pattern: /transport\s+input\s+ssh/i }
      ],
      solutions: {
        R1: ["ip access-list extended BRANCH-FILTER", "deny ip 10.10.20.0 0.0.0.255 10.10.30.0 0.0.0.255", "permit udp any any eq 53", "permit tcp any any eq 443", "permit icmp any any echo-reply", "interface gigabitethernet 0/0", "ip access-group BRANCH-FILTER in", "exit", "ip domain-name corp.local", "username admin secret CiscoSec123", "crypto key generate rsa modulus 2048", "ip ssh version 2", "line vty 0 15", "login local", "transport input ssh"],
        SW1: ["ip domain-name corp.local", "ip ssh version 2", "line vty 0 15", "transport input ssh"]
      },
      verifyOutput: "R1 BRANCH-FILTER Active (HR->Finance Blocked, DNS/HTTPS/Echo-Reply Permitted) + SSHv2 Enforced\nSW1 SSHv2 Hardened"
    },
    {
      id: "LAB-42",
      passerTag: "Enterprise Lab 17 • Build • Full L2 Switch Hardening (2 Devices)",
      sectionCode: "5.0",
      section: "5.0 Security Fundamentals",
      title: "Integrated L2 Hardening: Port Security + DHCP Snooping + DAI",
      devices: ["SW1", "SW2"],
      scenario: "Implement defense-in-depth Layer 2 security on Access Switch SW1 and Distribution Switch SW2 for VLAN 10: On SW1, enable DHCP Snooping globally and on VLAN 10, enable DAI on VLAN 10, trust uplink Gi0/1 for BOTH DHCP Snooping and DAI, and harden access port Fa0/1 as static access with Port Security (max 2 MACs, sticky learning, violation restrict). On SW2, enable DHCP Snooping globally and on VLAN 10, enable DAI on VLAN 10, and trust DHCP/GW uplink Gi0/1 for both DHCP Snooping and DAI.",
      nodes: [
        { id: "N1", type: "switch", label: "SW1", sub: "P-Sec+Snoop+DAI", x: 115, y: 58, status: "blue", configurable: true, selected: true },
        { id: "N2", type: "switch", label: "SW2", sub: "Dist Snoop+DAI", x: 330, y: 58, status: "blue", configurable: true },
        { id: "N3", type: "pc", label: "ROGUE-HOST", sub: "Fa0/1 Blocked", x: 75, y: 175, status: "red" },
        { id: "N4", type: "server", label: "DHCP+GW", sub: "Gi0/1 Trusted", x: 355, y: 175, status: "green" }
      ],
      links: [
        { x1: 185, y1: 86, x2: 345, y2: 86, label: "Gi0/1 Trusted", status: "blue" },
        { x1: 145, y1: 110, x2: 110, y2: 185, label: "Fa0/1 Sticky/2", status: "red" },
        { x1: 375, y1: 110, x2: 390, y2: 185, label: "DHCP/GW Trust", status: "green" }
      ],
      objectives: [
        { id: "o1", device: "SW1", text: "[SW1] Enable DHCP Snooping on VLAN 10", pattern: /ip\s+dhcp\s+snooping\s+vlan\s+10/i },
        { id: "o2", device: "SW1", text: "[SW1] Enable DAI on VLAN 10", pattern: /ip\s+arp\s+inspection\s+vlan\s+10/i },
        { id: "o3", device: "SW1", text: "[SW1] Trust Gi0/1 for DHCP Snooping and DAI", pattern: /ip\s+arp\s+inspection\s+trust/i },
        { id: "o4", device: "SW1", text: "[SW1] Configure Port Security sticky max 2 restrict on Fa0/1", pattern: /switchport\s+port-security\s+violation\s+restrict/i },
        { id: "o5", device: "SW2", text: "[SW2] Enable DHCP Snooping and DAI on VLAN 10", pattern: /ip\s+arp\s+inspection\s+vlan\s+10/i },
        { id: "o6", device: "SW2", text: "[SW2] Trust Gi0/1 for DHCP Snooping and DAI", pattern: /ip\s+dhcp\s+snooping\s+trust/i }
      ],
      solutions: {
        SW1: ["ip dhcp snooping", "ip dhcp snooping vlan 10", "ip arp inspection vlan 10", "interface gigabitethernet 0/1", "ip dhcp snooping trust", "ip arp inspection trust", "interface fastethernet 0/1", "switchport mode access", "switchport port-security", "switchport port-security maximum 2", "switchport port-security mac-address sticky", "switchport port-security violation restrict"],
        SW2: ["ip dhcp snooping", "ip dhcp snooping vlan 10", "ip arp inspection vlan 10", "interface gigabitethernet 0/1", "ip dhcp snooping trust", "ip arp inspection trust"]
      },
      verifyOutput: "SW1 & SW2 Full L2 Defense Active: Port Security (Max 2 Sticky Restrict) + DHCP Snooping VLAN 10 + DAI VLAN 10"
    },
    {
      id: "LAB-43",
      passerTag: "Enterprise Lab 18 • Build • Site-to-Site GRE VPN Tunnel (2 Devices)",
      sectionCode: "5.0",
      section: "5.0 Security Fundamentals",
      title: "Site-to-Site GRE Tunnel over WAN & Private Subnet Routing",
      devices: ["R1", "R2"],
      scenario: "Connect HQ Router R1 (public WAN Gi0/0 = 203.0.113.1) and Branch Router R2 (public WAN Gi0/0 = 203.0.113.2) using a GRE Tunnel0 interface: On R1, create interface Tunnel 0 with IP 10.255.0.1/30, tunnel source Gi0/0, tunnel destination 203.0.113.2, tunnel mode gre ip, and route Branch subnet 172.16.20.0/24 across Tunnel 0. On R2, create interface Tunnel 0 with IP 10.255.0.2/30, tunnel source Gi0/0, tunnel destination 203.0.113.1, tunnel mode gre ip, and route HQ subnet 172.16.10.0/24 across Tunnel 0.",
      nodes: [
        { id: "N1", type: "pc", label: "HQ-LAN", sub: "172.16.10.0/24", x: 35, y: 170, status: "green" },
        { id: "N2", type: "router", label: "R1", sub: "HQ 203.0.113.1", x: 145, y: 55, status: "blue", configurable: true, selected: true },
        { id: "N3", type: "router", label: "R2", sub: "BR 203.0.113.2", x: 315, y: 55, status: "blue", configurable: true },
        { id: "N4", type: "pc", label: "BRANCH-LAN", sub: "172.16.20.0/24", x: 375, y: 170, status: "green" }
      ],
      links: [
        { x1: 175, y1: 108, x2: 95, y2: 185, label: "HQ LAN", status: "green" },
        { x1: 215, y1: 84, x2: 335, y2: 84, label: "Tunnel0 GRE/IPsec", status: "orange" },
        { x1: 360, y1: 108, x2: 400, y2: 185, label: "Branch LAN", status: "green" }
      ],
      objectives: [
        { id: "o1", device: "R1", text: "[R1] Assign Tunnel0 IP 10.255.0.1/30", pattern: /ip\s+address\s+10\.255\.0\.1\s+255\.255\.255\.252/i },
        { id: "o2", device: "R1", text: "[R1] Configure Tunnel0 source Gi0/0 and destination 203.0.113.2", pattern: /tunnel\s+destination\s+203\.0\.113\.2/i },
        { id: "o3", device: "R1", text: "[R1] Set tunnel mode gre ip on Tunnel0", pattern: /tunnel\s+mode\s+gre\s+ip/i },
        { id: "o4", device: "R1", text: "[R1] Route 172.16.20.0/24 via Tunnel 0", pattern: /ip\s+route\s+172\.16\.20\.0\s+255\.255\.255\.0\s+(tunnel\s*0|10\.255\.0\.2)/i },
        { id: "o5", device: "R2", text: "[R2] Assign Tunnel0 IP 10.255.0.2/30", pattern: /ip\s+address\s+10\.255\.0\.2\s+255\.255\.255\.252/i },
        { id: "o6", device: "R2", text: "[R2] Configure Tunnel0 destination 203.0.113.1 and mode gre ip", pattern: /tunnel\s+destination\s+203\.0\.113\.1/i },
        { id: "o7", device: "R2", text: "[R2] Route 172.16.10.0/24 via Tunnel 0", pattern: /ip\s+route\s+172\.16\.10\.0\s+255\.255\.255\.0\s+(tunnel\s*0|10\.255\.0\.1)/i }
      ],
      solutions: {
        R1: ["interface tunnel 0", "ip address 10.255.0.1 255.255.255.252", "tunnel source gigabitethernet 0/0", "tunnel destination 203.0.113.2", "tunnel mode gre ip", "exit", "ip route 172.16.20.0 255.255.255.0 tunnel 0"],
        R2: ["interface tunnel 0", "ip address 10.255.0.2 255.255.255.252", "tunnel source gigabitethernet 0/0", "tunnel destination 203.0.113.1", "tunnel mode gre ip", "exit", "ip route 172.16.10.0 255.255.255.0 tunnel 0"]
      },
      verifyOutput: "R1 <-> R2 Tunnel0 UP/UP (GRE/IPsec Encapsulation Active)\nPrivate Subnets 172.16.10.0/24 <-> 172.16.20.0/24 Routed Over Tunnel0"
    },

    // =========================================================================
    // Domain 6.0: Automation & Programmability (Labs 19–20 -> LAB-44 to LAB-45)
    // =========================================================================
    {
      id: "LAB-44",
      passerTag: "Enterprise Lab 19 • Build • SDN & RESTCONF API Prep (2 Devices)",
      sectionCode: "6.0",
      section: "6.0 Automation and Programmability",
      title: "SDN Controller Integration: RESTCONF JSON & NETCONF-YANG",
      devices: ["R1", "SW1"],
      scenario: "Prepare IOS-XE Router R1 and Fabric Edge Switch SW1 for Cisco Catalyst Center SDN orchestration and RESTCONF JSON API calls (application/yang-data+json): On R1, configure domain sdn.local, create privilege-15 API user apiadmin with secret ApiPass123, enable the HTTPS secure server, activate RESTCONF and NETCONF-YANG, and configure GigabitEthernet 0/1 with IP 10.200.1.1/24 (up) for SDN controller reachability. On SW1, enable HTTPS secure server, activate RESTCONF, and create privilege-15 user apiadmin with secret ApiPass123.",
      nodes: [
        { id: "N1", type: "server", label: "CATALYST-CTR", sub: "RESTCONF HTTPS", x: 55, y: 175, status: "green" },
        { id: "N2", type: "router", label: "R1", sub: "IOS-XE API Node", x: 145, y: 55, status: "blue", configurable: true, selected: true },
        { id: "N3", type: "switch", label: "SW1", sub: "Fabric Edge", x: 330, y: 55, status: "blue", configurable: true },
        { id: "N4", type: "server", label: "POSTMAN-DEV", sub: "GET / PATCH JSON", x: 365, y: 175, status: "green" }
      ],
      links: [
        { x1: 165, y1: 108, x2: 95, y2: 185, label: "HTTPS 443 / 830", status: "blue" },
        { x1: 215, y1: 84, x2: 345, y2: 84, label: "SD-Access Fabric", status: "blue" },
        { x1: 375, y1: 108, x2: 395, y2: 185, label: "RESTCONF JSON", status: "green" }
      ],
      objectives: [
        { id: "o1", device: "R1", text: "[R1] Create privilege-15 API user apiadmin", pattern: /username\s+apiadmin\s+privilege\s+15\s+secret\s+\S+/i },
        { id: "o2", device: "R1", text: "[R1] Enable HTTPS secure server", pattern: /ip\s+http\s+secure-server/i },
        { id: "o3", device: "R1", text: "[R1] Enable RESTCONF and NETCONF-YANG", pattern: /^restconf$/i },
        { id: "o4", device: "R1", text: "[R1] Enable NETCONF-YANG", pattern: /^netconf-yang$/i },
        { id: "o5", device: "R1", text: "[R1] Configure Gi0/1 IP 10.200.1.1/24", pattern: /ip\s+address\s+10\.200\.1\.1\s+255\.255\.255\.0/i },
        { id: "o6", device: "SW1", text: "[SW1] Enable HTTPS secure server and RESTCONF", pattern: /^restconf$/i },
        { id: "o7", device: "SW1", text: "[SW1] Create privilege-15 API user apiadmin", pattern: /username\s+apiadmin\s+privilege\s+15\s+secret\s+\S+/i }
      ],
      solutions: {
        R1: ["ip domain-name sdn.local", "username apiadmin privilege 15 secret ApiPass123", "ip http secure-server", "restconf", "netconf-yang", "interface gigabitethernet 0/1", "ip address 10.200.1.1 255.255.255.0", "no shutdown"],
        SW1: ["ip http secure-server", "restconf", "username apiadmin privilege 15 secret ApiPass123"]
      },
      verifyOutput: "R1 & SW1 RESTCONF (HTTPS 443) + NETCONF (TCP 830) Ready\nHTTP 200 OK: application/yang-data+json GET & PATCH Verified"
    },
    {
      id: "LAB-45",
      passerTag: "Enterprise Lab 20 • Build • Ansible & Fleet Baseline (3 Devices)",
      sectionCode: "6.0",
      section: "6.0 Automation and Programmability",
      title: "Network Automation Fleet Baseline (Ansible SSHv2, NTP, Syslog & VLAN)",
      devices: ["R1", "SW1", "SW2"],
      scenario: "Standardize a 3-device campus fleet (R1, SW1, SW2) for agentless Ansible YAML playbook automation (cisco.ios.ios_vlans / NTP / Syslog): On ALL three devices (R1, SW1, SW2), create privilege-15 automation user ansible with secret AutoPass123, enforce SSHv2, restrict VTY 0–15 to local login with SSH-only transport, sync NTP to 10.99.0.10, and forward Syslog logs to 10.99.0.20. Additionally, on SW1 and SW2 create VLAN 50 named AUTOMATION.",
      nodes: [
        { id: "N1", type: "router", label: "R1", sub: "Ansible Managed", x: 55, y: 58, status: "blue", configurable: true, selected: true },
        { id: "N2", type: "switch", label: "SW1", sub: "VLAN 50 Auto", x: 205, y: 58, status: "blue", configurable: true },
        { id: "N3", type: "switch", label: "SW2", sub: "VLAN 50 Auto", x: 355, y: 58, status: "blue", configurable: true },
        { id: "N4", type: "server", label: "ANSIBLE-CTL", sub: "YAML / SSHv2", x: 205, y: 175, status: "green" }
      ],
      links: [
        { x1: 125, y1: 86, x2: 225, y2: 86, label: "Mgmt Net", status: "blue" },
        { x1: 275, y1: 86, x2: 375, y2: 86, label: "Mgmt Net", status: "blue" },
        { x1: 250, y1: 110, x2: 250, y2: 185, label: "SSH TCP 22", status: "green" }
      ],
      objectives: [
        { id: "o1", device: "R1", text: "[R1] Create privilege-15 user ansible and enforce SSHv2", pattern: /username\s+ansible\s+privilege\s+15\s+secret\s+\S+/i },
        { id: "o2", device: "R1", text: "[R1] Sync NTP to 10.99.0.10 and Syslog to 10.99.0.20", pattern: /ntp\s+server\s+10\.99\.0\.10/i },
        { id: "o3", device: "R1", text: "[R1] Forward Syslog to 10.99.0.20", pattern: /logging\s+host\s+10\.99\.0\.20/i },
        { id: "o4", device: "SW1", text: "[SW1] Create privilege-15 user ansible", pattern: /username\s+ansible\s+privilege\s+15\s+secret\s+\S+/i },
        { id: "o5", device: "SW1", text: "[SW1] Sync NTP 10.99.0.10 & create VLAN 50 AUTOMATION", pattern: /^name\s+AUTOMATION$/i },
        { id: "o6", device: "SW2", text: "[SW2] Create privilege-15 user ansible", pattern: /username\s+ansible\s+privilege\s+15\s+secret\s+\S+/i },
        { id: "o7", device: "SW2", text: "[SW2] Sync NTP 10.99.0.10 & create VLAN 50 AUTOMATION", pattern: /^name\s+AUTOMATION$/i }
      ],
      solutions: {
        R1: ["username ansible privilege 15 secret AutoPass123", "ip ssh version 2", "ntp server 10.99.0.10", "logging host 10.99.0.20", "line vty 0 15", "login local", "transport input ssh"],
        SW1: ["username ansible privilege 15 secret AutoPass123", "ip ssh version 2", "ntp server 10.99.0.10", "logging host 10.99.0.20", "vlan 50", "name AUTOMATION", "line vty 0 15", "login local", "transport input ssh"],
        SW2: ["username ansible privilege 15 secret AutoPass123", "ip ssh version 2", "ntp server 10.99.0.10", "logging host 10.99.0.20", "vlan 50", "name AUTOMATION", "line vty 0 15", "login local", "transport input ssh"]
      },
      verifyOutput: "Ansible Playbook Run Complete (ok=3 changed=0 — Idempotent!): R1, SW1, SW2 SSHv2 + NTP + Syslog + VLAN 50 Synced"
    }
  ];

  window.CCNA_LAB_POOL = (window.CCNA_LAB_POOL || []).concat(ENTERPRISE_LABS);
})();
