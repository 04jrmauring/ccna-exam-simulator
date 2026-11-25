// CCNA 200-301 Hard Multi-Device Packet Tracer Lab Pool (20 Labs — 2 to 3 Configurable Devices per Lab)
// Covers ALL 11 previous-passer topics (ACL, OSPF Election, VLAN, EtherChannel, Voice VLAN,
// CDP/LLDP, IPv4 & IPv6 Addressing, NAT, NTP, DHCP Snooping, DAI) + 9 blueprint labs.
// Each exam draws 6 unique labs from this 20-lab pool.

window.CCNA_LAB_POOL = [
  {
    id: "LAB-01",
    passerTag: "Passer Lab #1 • ACL (2 Devices)",
    sectionCode: "5.0",
    section: "5.0 Security Fundamentals",
    title: "Multi-Router Extended & VTY ACL Policy",
    devices: ["R1", "R2"],
    scenario: "Configure 2 routers: On R1, create Extended ACL 100 blocking HTTP (TCP 80) from VLAN 10 (192.168.10.0/24) to Web Server 10.10.50.10 while permitting all other IP traffic, applied inbound on Gi0/0. On R2, create Named Standard ACL 'MGMT_SSH' permitting only 10.99.0.0/24 and apply it inbound to VTY lines 0 15 with SSH-only transport.",
    nodes: [
      { id: "N1", type: "pc", label: "PC-LAN", sub: "192.168.10.15", x: 35, y: 170, status: "green" },
      { id: "N2", type: "router", label: "R1", sub: "Branch Edge", x: 145, y: 52, status: "blue", configurable: true, selected: true },
      { id: "N3", type: "router", label: "R2", sub: "Core Gateway", x: 315, y: 52, status: "blue", configurable: true },
      { id: "N4", type: "server", label: "WEB-SRV", sub: "10.10.50.10", x: 365, y: 170, status: "green" }
    ],
    links: [
      { x1: 175, y1: 108, x2: 95, y2: 185, label: "R1 Gi0/0", status: "green" },
      { x1: 210, y1: 84, x2: 335, y2: 84, label: "Gi0/1 WAN", status: "blue" },
      { x1: 355, y1: 108, x2: 395, y2: 185, label: "R2 Gi0/0", status: "green" }
    ],
    objectives: [
      { id: "o1", device: "R1", text: "[R1] Deny TCP 80 from 192.168.10.0/24 to host 10.10.50.10 in ACL 100", pattern: /access-list\s+100\s+deny\s+tcp\s+192\.168\.10\.0\s+0\.0\.0\.255\s+host\s+10\.10\.50\.10\s+eq\s+(80|www)/i },
      { id: "o2", device: "R1", text: "[R1] Permit all other IP traffic in ACL 100", pattern: /access-list\s+100\s+permit\s+ip\s+any\s+any/i },
      { id: "o3", device: "R1", text: "[R1] Apply ACL 100 inbound on Gi0/0 ('ip access-group 100 in')", pattern: /ip\s+access-group\s+100\s+in/i },
      { id: "o4", device: "R2", text: "[R2] Create standard ACL MGMT_SSH permitting 10.99.0.0 0.0.0.255", pattern: /permit\s+10\.99\.0\.0\s+0\.0\.0\.255/i },
      { id: "o5", device: "R2", text: "[R2] Apply 'access-class MGMT_SSH in' on line vty 0 15", pattern: /access-class\s+MGMT_SSH\s+in/i },
      { id: "o6", device: "R2", text: "[R2] Restrict VTY lines to SSH ('transport input ssh')", pattern: /transport\s+input\s+ssh/i }
    ],
    solutions: {
      R1: [
        "access-list 100 deny tcp 192.168.10.0 0.0.0.255 host 10.10.50.10 eq 80",
        "access-list 100 permit ip any any",
        "interface gigabitethernet 0/0",
        "ip access-group 100 in"
      ],
      R2: [
        "ip access-list standard MGMT_SSH",
        "permit 10.99.0.0 0.0.0.255",
        "line vty 0 15",
        "access-class MGMT_SSH in",
        "transport input ssh"
      ]
    },
    verifyOutput: "R1 Gi0/0: Inbound Extended ACL 100 active (HTTP blocked, other IP permitted)\nR2 VTY 0-15: Standard ACL MGMT_SSH inbound + SSH-only enforced"
  },
  {
    id: "LAB-02",
    passerTag: "Passer Lab #2 • OSPF Election (3 Devices)",
    sectionCode: "3.0",
    section: "3.0 IP Connectivity",
    title: "3-Router OSPF DR / BDR / DROTHER Election",
    devices: ["R1", "R2", "R3"],
    scenario: "Configure all 3 routers on broadcast segment 10.0.12.0/24 (Area 0, Gi0/0): Force R1 to become DR (RID 1.1.1.1, priority 200), R2 to become BDR (RID 2.2.2.2, priority 100), and R3 to remain DROTHER permanently (RID 3.3.3.3, priority 0).",
    nodes: [
      { id: "N1", type: "router", label: "R1", sub: "Target DR (.1)", x: 45, y: 48, status: "blue", configurable: true, selected: true },
      { id: "N2", type: "router", label: "R2", sub: "Target BDR (.2)", x: 350, y: 48, status: "blue", configurable: true },
      { id: "N3", type: "switch", label: "SW-LAN", sub: "10.0.12.0/24", x: 196, y: 112, status: "green" },
      { id: "N4", type: "router", label: "R3", sub: "DROTHER (.3)", x: 196, y: 185, status: "orange", configurable: true }
    ],
    links: [
      { x1: 105, y1: 80, x2: 220, y2: 128, label: "R1 Gi0/0", status: "blue" },
      { x1: 375, y1: 80, x2: 265, y2: 128, label: "R2 Gi0/0", status: "green" },
      { x1: 245, y1: 158, x2: 245, y2: 195, label: "R3 Gi0/0", status: "orange" }
    ],
    objectives: [
      { id: "o1", device: "R1", text: "[R1] Set OSPF router-id 1.1.1.1 under 'router ospf 1'", pattern: /router-id\s+1\.1\.1\.1/i },
      { id: "o2", device: "R1", text: "[R1] On Gi0/0 set 'ip ospf priority 200' and 'ip ospf 1 area 0'", pattern: /ip\s+ospf\s+priority\s+200/i },
      { id: "o3", device: "R1", text: "[R1] Activate OSPF Area 0 on Gi0/0 ('ip ospf 1 area 0')", pattern: /ip\s+ospf\s+1\s+area\s+0/i },
      { id: "o4", device: "R2", text: "[R2] Set OSPF router-id 2.2.2.2", pattern: /router-id\s+2\.2\.2\.2/i },
      { id: "o5", device: "R2", text: "[R2] On Gi0/0 set 'ip ospf priority 100' and 'ip ospf 1 area 0'", pattern: /ip\s+ospf\s+priority\s+100/i },
      { id: "o6", device: "R3", text: "[R3] Set OSPF router-id 3.3.3.3", pattern: /router-id\s+3\.3\.3\.3/i },
      { id: "o7", device: "R3", text: "[R3] Make R3 ineligible for DR/BDR on Gi0/0 ('ip ospf priority 0')", pattern: /ip\s+ospf\s+priority\s+0/i }
    ],
    solutions: {
      R1: ["router ospf 1", "router-id 1.1.1.1", "interface gigabitethernet 0/0", "ip ospf priority 200", "ip ospf 1 area 0"],
      R2: ["router ospf 1", "router-id 2.2.2.2", "interface gigabitethernet 0/0", "ip ospf priority 100", "ip ospf 1 area 0"],
      R3: ["router ospf 1", "router-id 3.3.3.3", "interface gigabitethernet 0/0", "ip ospf priority 0", "ip ospf 1 area 0"]
    },
    verifyOutput: "Segment 10.0.12.0/24 OSPF Election:\n  R1 (1.1.1.1) -> FULL/DR (Pri 200)\n  R2 (2.2.2.2) -> FULL/BDR (Pri 100)\n  R3 (3.3.3.3) -> FULL/DROTHER (Pri 0)"
  },
  {
    id: "LAB-03",
    passerTag: "Passer Lab #3 • VLAN & Trunk (3 Devices)",
    sectionCode: "2.0",
    section: "2.0 Network Access",
    title: "End-to-End VLANs, Native 99 Trunk & ROAS",
    devices: ["SW1", "SW2", "R1"],
    scenario: "Configure 3 devices: On SW1, create VLAN 10 (SALES), assign Fa0/1 to VLAN 10, and configure Gi0/1 as an 802.1Q trunk with Native VLAN 99. On SW2, create VLAN 10 and match trunk Gi0/1 with Native VLAN 99. On R1, configure subinterface Gi0/0.10 (dot1Q 10) with gateway IP 192.168.10.1/24.",
    nodes: [
      { id: "N1", type: "pc", label: "PC-SALES", sub: "192.168.10.11", x: 32, y: 176, status: "green" },
      { id: "N2", type: "switch", label: "SW1", sub: "Access SW", x: 115, y: 55, status: "blue", configurable: true, selected: true },
      { id: "N3", type: "switch", label: "SW2", sub: "Dist SW", x: 255, y: 55, status: "blue", configurable: true },
      { id: "N4", type: "router", label: "R1", sub: "ROAS GW", x: 380, y: 155, status: "blue", configurable: true }
    ],
    links: [
      { x1: 145, y1: 108, x2: 80, y2: 185, label: "Fa0/1 V10", status: "green" },
      { x1: 180, y1: 84, x2: 280, y2: 84, label: "Gi0/1 Native 99", status: "orange" },
      { x1: 315, y1: 108, x2: 395, y2: 168, label: "R1 Gi0/0.10", status: "blue" }
    ],
    objectives: [
      { id: "o1", device: "SW1", text: "[SW1] Create VLAN 10 named SALES and assign Fa0/1 to VLAN 10", pattern: /switchport\s+access\s+vlan\s+10/i },
      { id: "o2", device: "SW1", text: "[SW1] Configure Gi0/1 as trunk with Native VLAN 99", pattern: /switchport\s+trunk\s+native\s+vlan\s+99/i },
      { id: "o3", device: "SW2", text: "[SW2] Create VLAN 10 ('vlan 10') and configure Gi0/1 trunk mode", pattern: /switchport\s+mode\s+trunk/i },
      { id: "o4", device: "SW2", text: "[SW2] Match Native VLAN 99 on Gi0/1 to resolve mismatch", pattern: /switchport\s+trunk\s+native\s+vlan\s+99/i },
      { id: "o5", device: "R1", text: "[R1] Configure 'encapsulation dot1q 10' on Gi0/0.10", pattern: /encapsulation\s+dot1q\s+10/i },
      { id: "o6", device: "R1", text: "[R1] Assign IP 192.168.10.1 255.255.255.0 on Gi0/0.10", pattern: /ip\s+address\s+192\.168\.10\.1\s+255\.255\.255\.0/i }
    ],
    solutions: {
      SW1: ["vlan 10", "name SALES", "interface fastethernet 0/1", "switchport mode access", "switchport access vlan 10", "interface gigabitethernet 0/1", "switchport mode trunk", "switchport trunk native vlan 99"],
      SW2: ["vlan 10", "name SALES", "interface gigabitethernet 0/1", "switchport mode trunk", "switchport trunk native vlan 99"],
      R1: ["interface gigabitethernet 0/0", "no shutdown", "interface gigabitethernet 0/0.10", "encapsulation dot1q 10", "ip address 192.168.10.1 255.255.255.0"]
    },
    verifyOutput: "SW1 <-> SW2 Trunk: 802.1Q Native VLAN 99 matched (no CDP mismatch)\nR1 Gi0/0.10: 192.168.10.1/24 up/up -> PC-SALES gateway reachable"
  },
  {
    id: "LAB-04",
    passerTag: "Passer Lab #4 • EtherChannel (2 Devices)",
    sectionCode: "2.0",
    section: "2.0 Network Access",
    title: "Dual-Switch LACP EtherChannel Trunk Bundle",
    devices: ["SW1", "SW2"],
    scenario: "Configure both switches: On SW1, bundle Gi0/1–2 into Port-channel 1 using LACP active mode and set Po1 as an 802.1Q trunk allowing VLANs 10,20. On SW2, bundle Gi0/1–2 using LACP passive mode and match Po1 as a trunk allowing VLANs 10,20.",
    nodes: [
      { id: "N1", type: "switch", label: "SW1", sub: "LACP Active", x: 115, y: 60, status: "blue", configurable: true, selected: true },
      { id: "N2", type: "switch", label: "SW2", sub: "LACP Passive", x: 330, y: 60, status: "blue", configurable: true },
      { id: "N3", type: "pc", label: "HOST-A", sub: "VLAN 10", x: 75, y: 175, status: "green" },
      { id: "N4", type: "pc", label: "HOST-B", sub: "VLAN 20", x: 355, y: 175, status: "green" }
    ],
    links: [
      { x1: 185, y1: 88, x2: 345, y2: 88, label: "Po1 (Gi0/1-2)", status: "blue" },
      { x1: 145, y1: 112, x2: 110, y2: 185, label: "Fa0/1", status: "green" },
      { x1: 375, y1: 112, x2: 390, y2: 185, label: "Fa0/2", status: "green" }
    ],
    objectives: [
      { id: "o1", device: "SW1", text: "[SW1] Bundle Gi0/1-2 with 'channel-group 1 mode active'", pattern: /channel-group\s+1\s+mode\s+active/i },
      { id: "o2", device: "SW1", text: "[SW1] Configure Po1 as static trunk ('switchport mode trunk')", pattern: /switchport\s+mode\s+trunk/i },
      { id: "o3", device: "SW1", text: "[SW1] Allow VLANs 10,20 on Po1 ('switchport trunk allowed vlan 10,20')", pattern: /switchport\s+trunk\s+allowed\s+vlan\s+10,20/i },
      { id: "o4", device: "SW2", text: "[SW2] Bundle Gi0/1-2 with 'channel-group 1 mode passive'", pattern: /channel-group\s+1\s+mode\s+passive/i },
      { id: "o5", device: "SW2", text: "[SW2] Configure Po1 as static trunk ('switchport mode trunk')", pattern: /switchport\s+mode\s+trunk/i },
      { id: "o6", device: "SW2", text: "[SW2] Match allowed VLANs 10,20 on Po1", pattern: /switchport\s+trunk\s+allowed\s+vlan\s+10,20/i }
    ],
    solutions: {
      SW1: ["interface range gigabitethernet 0/1 - 2", "channel-group 1 mode active", "interface port-channel 1", "switchport mode trunk", "switchport trunk allowed vlan 10,20"],
      SW2: ["interface range gigabitethernet 0/1 - 2", "channel-group 1 mode passive", "interface port-channel 1", "switchport mode trunk", "switchport trunk allowed vlan 10,20"]
    },
    verifyOutput: "SW1 Po1(SU) LACP Gi0/1(P) Gi0/2(P) <-> SW2 Po1(SU) LACP Gi0/1(P) Gi0/2(P)\nAllowed VLANs matched: 10,20"
  },
  {
    id: "LAB-05",
    passerTag: "Passer Lab #5 • Voice VLAN (2 Devices)",
    sectionCode: "2.0",
    section: "2.0 Network Access",
    title: "Voice & Data Access Switch + Voice Gateway",
    devices: ["SW1", "R1"],
    scenario: "Configure 2 devices: On SW1, configure Fa0/5 as an access port with Data VLAN 10, Voice VLAN 20, and PortFast, and trunk Gi0/1 to R1. On R1, create subinterface Gi0/0.20 (dot1Q 20) with Voice gateway 10.20.0.1/24 and point DHCP relay to CallManager 10.99.0.20.",
    nodes: [
      { id: "N1", type: "pc", label: "IP-PHONE+PC", sub: "V10 / Voice V20", x: 45, y: 172, status: "green" },
      { id: "N2", type: "switch", label: "SW1", sub: "PoE+ Access", x: 155, y: 55, status: "blue", configurable: true, selected: true },
      { id: "N3", type: "router", label: "R1", sub: "Voice Gateway", x: 335, y: 55, status: "blue", configurable: true },
      { id: "N4", type: "server", label: "CUCM-DHCP", sub: "10.99.0.20", x: 365, y: 172, status: "green" }
    ],
    links: [
      { x1: 185, y1: 108, x2: 100, y2: 185, label: "Fa0/5 V10/20", status: "green" },
      { x1: 220, y1: 84, x2: 350, y2: 84, label: "Gi0/1 Trunk", status: "blue" },
      { x1: 375, y1: 108, x2: 395, y2: 185, label: "Gi0/1 Server", status: "green" }
    ],
    objectives: [
      { id: "o1", device: "SW1", text: "[SW1] Set Fa0/5 Data VLAN 10 ('switchport access vlan 10')", pattern: /switchport\s+access\s+vlan\s+10/i },
      { id: "o2", device: "SW1", text: "[SW1] Set Fa0/5 Voice VLAN 20 ('switchport voice vlan 20')", pattern: /switchport\s+voice\s+vlan\s+20/i },
      { id: "o3", device: "SW1", text: "[SW1] Enable PortFast on Fa0/5 ('spanning-tree portfast')", pattern: /spanning-tree\s+portfast/i },
      { id: "o4", device: "R1", text: "[R1] Configure 'encapsulation dot1q 20' on Gi0/0.20", pattern: /encapsulation\s+dot1q\s+20/i },
      { id: "o5", device: "R1", text: "[R1] Assign Voice GW IP 10.20.0.1 255.255.255.0 on Gi0/0.20", pattern: /ip\s+address\s+10\.20\.0\.1\s+255\.255\.255\.0/i },
      { id: "o6", device: "R1", text: "[R1] Configure 'ip helper-address 10.99.0.20' on Gi0/0.20", pattern: /ip\s+helper-address\s+10\.99\.0\.20/i }
    ],
    solutions: {
      SW1: ["interface fastethernet 0/5", "switchport mode access", "switchport access vlan 10", "switchport voice vlan 20", "spanning-tree portfast"],
      R1: ["interface gigabitethernet 0/0.20", "encapsulation dot1q 20", "ip address 10.20.0.1 255.255.255.0", "ip helper-address 10.99.0.20"]
    },
    verifyOutput: "SW1 Fa0/5: Access VLAN 10 + Voice VLAN 20 + PortFast OK\nR1 Gi0/0.20: 10.20.0.1/24 up/up + DHCP Relay -> 10.99.0.20"
  },
  {
    id: "LAB-06",
    passerTag: "Passer Lab #6 • CDP & LLDP (2 Devices)",
    sectionCode: "2.0",
    section: "2.0 Network Access",
    title: "Multi-Switch CDP Hardening & LLDP Interop",
    devices: ["SW1", "SW2"],
    scenario: "Configure both switches: On SW1, enable LLDP globally, enable LLDP transmit & receive on Gi0/2, and disable CDP on external link Gi0/1. On SW2, enable LLDP globally, enable LLDP transmit & receive on Gi0/2 to peer with SW1, and disable CDP globally ('no cdp run').",
    nodes: [
      { id: "N1", type: "switch", label: "SW1", sub: "Edge Switch", x: 115, y: 58, status: "blue", configurable: true, selected: true },
      { id: "N2", type: "switch", label: "SW2", sub: "Core Switch", x: 330, y: 58, status: "blue", configurable: true },
      { id: "N3", type: "router", label: "ISP-EDGE", sub: "Untrusted", x: 65, y: 175, status: "red" },
      { id: "N4", type: "pc", label: "3RD-PARTY AP", sub: "LLDP Peer", x: 365, y: 175, status: "green" }
    ],
    links: [
      { x1: 185, y1: 86, x2: 345, y2: 86, label: "Gi0/2 LLDP", status: "green" },
      { x1: 145, y1: 110, x2: 105, y2: 185, label: "Gi0/1 No CDP", status: "red" },
      { x1: 375, y1: 110, x2: 395, y2: 185, label: "Gi0/3 LLDP", status: "green" }
    ],
    objectives: [
      { id: "o1", device: "SW1", text: "[SW1] Enable LLDP globally ('lldp run')", pattern: /^lldp\s+run$/i },
      { id: "o2", device: "SW1", text: "[SW1] Disable CDP on Gi0/1 ('no cdp enable')", pattern: /no\s+cdp\s+enable/i },
      { id: "o3", device: "SW1", text: "[SW1] Enable LLDP transmit and receive on Gi0/2", pattern: /lldp\s+transmit/i },
      { id: "o4", device: "SW2", text: "[SW2] Enable LLDP globally ('lldp run')", pattern: /^lldp\s+run$/i },
      { id: "o5", device: "SW2", text: "[SW2] Disable CDP globally ('no cdp run')", pattern: /no\s+cdp\s+run/i },
      { id: "o6", device: "SW2", text: "[SW2] Enable LLDP receive on Gi0/2 ('lldp receive')", pattern: /lldp\s+receive/i }
    ],
    solutions: {
      SW1: ["lldp run", "interface gigabitethernet 0/1", "no cdp enable", "interface gigabitethernet 0/2", "lldp transmit", "lldp receive"],
      SW2: ["lldp run", "no cdp run", "interface gigabitethernet 0/2", "lldp transmit", "lldp receive"]
    },
    verifyOutput: "SW1 <-> SW2 LLDP Adjacency: ACTIVE (Gi0/2)\nCDP Disabled on SW1 Gi0/1 and globally on SW2"
  },
  {
    id: "LAB-07",
    passerTag: "Passer Lab #7 • IPv4 & IPv6 (2 Devices)",
    sectionCode: "1.0",
    section: "1.0 Network Fundamentals",
    title: "Dual-Stack IPv4 & IPv6 Point-to-Point Link",
    devices: ["R1", "R2"],
    scenario: "Configure dual-stack routing across R1 and R2 (connected via Gi0/0): Enable 'ipv6 unicast-routing' on BOTH routers. On R1 Gi0/0 assign 10.1.1.1/30, 2001:db8:12::1/64, Link-Local fe80::1, and 'no shutdown'. On R2 Gi0/0 assign 10.1.1.2/30, 2001:db8:12::2/64, Link-Local fe80::2, and 'no shutdown'.",
    nodes: [
      { id: "N1", type: "router", label: "R1", sub: ".1.1 / ::1", x: 115, y: 60, status: "blue", configurable: true, selected: true },
      { id: "N2", type: "router", label: "R2", sub: ".1.2 / ::2", x: 330, y: 60, status: "blue", configurable: true },
      { id: "N3", type: "pc", label: "LAN-A", sub: "2001:db8:a::10", x: 75, y: 175, status: "green" },
      { id: "N4", type: "server", label: "LAN-B", sub: "2001:db8:b::10", x: 355, y: 175, status: "green" }
    ],
    links: [
      { x1: 185, y1: 88, x2: 345, y2: 88, label: "Gi0/0 Dual-Stack", status: "orange" },
      { x1: 145, y1: 112, x2: 110, y2: 185, label: "Gi0/1", status: "green" },
      { x1: 375, y1: 112, x2: 390, y2: 185, label: "Gi0/1", status: "green" }
    ],
    objectives: [
      { id: "o1", device: "R1", text: "[R1] Enable 'ipv6 unicast-routing'", pattern: /ipv6\s+unicast-routing/i },
      { id: "o2", device: "R1", text: "[R1] Assign IPv4 10.1.1.1 255.255.255.252 on Gi0/0", pattern: /ip\s+address\s+10\.1\.1\.1\s+255\.255\.255\.252/i },
      { id: "o3", device: "R1", text: "[R1] Assign IPv6 2001:db8:12::1/64 & link-local fe80::1 + no shut", pattern: /ipv6\s+address\s+2001:db8:12::1\/64/i },
      { id: "o4", device: "R2", text: "[R2] Enable 'ipv6 unicast-routing'", pattern: /ipv6\s+unicast-routing/i },
      { id: "o5", device: "R2", text: "[R2] Assign IPv4 10.1.1.2 255.255.255.252 on Gi0/0", pattern: /ip\s+address\s+10\.1\.1\.2\s+255\.255\.255\.252/i },
      { id: "o6", device: "R2", text: "[R2] Assign IPv6 2001:db8:12::2/64 & link-local fe80::2 + no shut", pattern: /ipv6\s+address\s+2001:db8:12::2\/64/i }
    ],
    solutions: {
      R1: ["ipv6 unicast-routing", "interface gigabitethernet 0/0", "ip address 10.1.1.1 255.255.255.252", "ipv6 address 2001:db8:12::1/64", "ipv6 address fe80::1 link-local", "no shutdown"],
      R2: ["ipv6 unicast-routing", "interface gigabitethernet 0/0", "ip address 10.1.1.2 255.255.255.252", "ipv6 address 2001:db8:12::2/64", "ipv6 address fe80::2 link-local", "no shutdown"]
    },
    verifyOutput: "R1 <-> R2 Gi0/0 Dual-Stack Link UP/UP\nIPv4 Ping 10.1.1.2: 5/5 (100%) | IPv6 Ping 2001:DB8:12::2: 5/5 (100%)"
  },
  {
    id: "LAB-08",
    passerTag: "Passer Lab #8 • NAT / PAT (2 Devices)",
    sectionCode: "4.0",
    section: "4.0 IP Services",
    title: "PAT Overload Edge + Internal Default Route",
    devices: ["R1", "R2"],
    scenario: "Configure 2 routers: On R1 (Internet Edge), configure PAT overload for 10.10.0.0/16 (ACL 1) using outside Gi0/1, mark Gi0/0 inside & Gi0/1 outside. On R2 (Internal Core), configure a default route pointing to R1 (10.10.0.1) so LAN hosts reach the Internet.",
    nodes: [
      { id: "N1", type: "pc", label: "CORP-LAN", sub: "10.10.2.15", x: 35, y: 172, status: "green" },
      { id: "N2", type: "router", label: "R2", sub: "Internal Core", x: 145, y: 55, status: "blue", configurable: true },
      { id: "N3", type: "router", label: "R1", sub: "NAT Edge .113.1", x: 315, y: 55, status: "blue", configurable: true, selected: true },
      { id: "N4", type: "server", label: "ISP-DNS", sub: "8.8.8.8", x: 375, y: 172, status: "green" }
    ],
    links: [
      { x1: 175, y1: 108, x2: 95, y2: 185, label: "R2 LAN", status: "green" },
      { x1: 215, y1: 84, x2: 335, y2: 84, label: "R1 Gi0/0 In", status: "blue" },
      { x1: 360, y1: 108, x2: 400, y2: 185, label: "R1 Gi0/1 Out", status: "orange" }
    ],
    objectives: [
      { id: "o1", device: "R1", text: "[R1] Create ACL 1 permitting 10.10.0.0 0.0.255.255", pattern: /access-list\s+1\s+permit\s+10\.10\.0\.0\s+0\.0\.255\.255/i },
      { id: "o2", device: "R1", text: "[R1] Mark Gi0/0 'ip nat inside' and Gi0/1 'ip nat outside'", pattern: /ip\s+nat\s+inside$/i },
      { id: "o3", device: "R1", text: "[R1] Mark Gi0/1 'ip nat outside'", pattern: /ip\s+nat\s+outside$/i },
      { id: "o4", device: "R1", text: "[R1] Enable PAT overload ('ip nat inside source list 1 int gi0/1 overload')", pattern: /ip\s+nat\s+inside\s+source\s+list\s+1\s+int(erface)?\s+g(igabitethernet)?\s*0\/1\s+overload/i },
      { id: "o5", device: "R2", text: "[R2] Configure default route via R1 ('ip route 0.0.0.0 0.0.0.0 10.10.0.1')", pattern: /ip\s+route\s+0\.0\.0\.0\s+0\.0\.0\.0\s+10\.10\.0\.1/i }
    ],
    solutions: {
      R1: ["access-list 1 permit 10.10.0.0 0.0.255.255", "interface gigabitethernet 0/0", "ip nat inside", "interface gigabitethernet 0/1", "ip nat outside", "exit", "ip nat inside source list 1 interface gigabitethernet 0/1 overload"],
      R2: ["ip route 0.0.0.0 0.0.0.0 10.10.0.1"]
    },
    verifyOutput: "R2 Default Route -> 10.10.0.1 Active\nR1 PAT Active: tcp 203.0.113.1:1024 <-> 10.10.2.15:1024 -> 8.8.8.8:443"
  },
  {
    id: "LAB-09",
    passerTag: "Passer Lab #9 • NTP Hierarchy (3 Devices)",
    sectionCode: "4.0",
    section: "4.0 IP Services",
    title: "3-Device Authenticated NTP Master & Clients",
    devices: ["R1", "R2", "SW1"],
    scenario: "Build a 3-device NTP hierarchy: Configure R1 as authoritative Stratum 2 NTP Master ('ntp master 2') with authentication key 1 (MD5 'CiscoNTP'). Sync both R2 and SW1 to R1 (10.0.0.1) using NTP authentication and trusted key 1.",
    nodes: [
      { id: "N1", type: "router", label: "R1", sub: "NTP Master .0.1", x: 196, y: 46, status: "blue", configurable: true, selected: true },
      { id: "N2", type: "router", label: "R2", sub: "NTP Client S3", x: 60, y: 168, status: "green", configurable: true },
      { id: "N3", type: "switch", label: "SW1", sub: "NTP Client S3", x: 335, y: 168, status: "green", configurable: true },
      { id: "N4", type: "server", label: "SIEM-LOG", sub: "10.0.0.60", x: 365, y: 50, status: "green" }
    ],
    links: [
      { x1: 215, y1: 102, x2: 115, y2: 175, label: "UDP 123", status: "blue" },
      { x1: 265, y1: 102, x2: 365, y2: 175, label: "UDP 123", status: "blue" },
      { x1: 268, y1: 78, x2: 380, y2: 78, label: "Syslog 514", status: "green" }
    ],
    objectives: [
      { id: "o1", device: "R1", text: "[R1] Configure 'ntp master 2' and 'ntp authenticate'", pattern: /ntp\s+master\s+2/i },
      { id: "o2", device: "R1", text: "[R1] Define key 1 ('ntp authentication-key 1 md5 CiscoNTP') & trust it", pattern: /ntp\s+authentication-key\s+1\s+md5\s+\S+/i },
      { id: "o3", device: "R2", text: "[R2] Enable 'ntp authenticate' and 'ntp trusted-key 1'", pattern: /ntp\s+trusted-key\s+1/i },
      { id: "o4", device: "R2", text: "[R2] Point R2 to R1 ('ntp server 10.0.0.1 key 1')", pattern: /ntp\s+server\s+10\.0\.0\.1(\s+key\s+1)?/i },
      { id: "o5", device: "SW1", text: "[SW1] Enable 'ntp authenticate' and 'ntp trusted-key 1'", pattern: /ntp\s+trusted-key\s+1/i },
      { id: "o6", device: "SW1", text: "[SW1] Point SW1 to R1 ('ntp server 10.0.0.1 key 1')", pattern: /ntp\s+server\s+10\.0\.0\.1(\s+key\s+1)?/i }
    ],
    solutions: {
      R1: ["ntp master 2", "ntp authenticate", "ntp authentication-key 1 md5 CiscoNTP", "ntp trusted-key 1"],
      R2: ["ntp authenticate", "ntp authentication-key 1 md5 CiscoNTP", "ntp trusted-key 1", "ntp server 10.0.0.1 key 1"],
      SW1: ["ntp authenticate", "ntp authentication-key 1 md5 CiscoNTP", "ntp trusted-key 1", "ntp server 10.0.0.1 key 1"]
    },
    verifyOutput: "R1: Authoritative Stratum 2 Master\nR2 & SW1: Synchronized to 10.0.0.1 (Stratum 3, Auth Key 1 verified)"
  },
  {
    id: "LAB-10",
    passerTag: "Passer Lab #10 • DHCP Snooping (2 Devices)",
    sectionCode: "5.0",
    section: "5.0 Security Fundamentals",
    title: "Multi-Switch DHCP Snooping Defense",
    devices: ["SW1", "SW2"],
    scenario: "Harden VLAN 10 across BOTH Access SW1 and Distribution SW2: On SW1, enable DHCP snooping globally & on VLAN 10, trust uplink Gi0/1 (toward SW2), and rate-limit untrusted Fa0/2 to 15 pps. On SW2, enable DHCP snooping globally & on VLAN 10, and trust Gi0/2 facing the legitimate DHCP server.",
    nodes: [
      { id: "N1", type: "switch", label: "SW1", sub: "Access SW", x: 115, y: 58, status: "blue", configurable: true, selected: true },
      { id: "N2", type: "switch", label: "SW2", sub: "Dist SW", x: 270, y: 58, status: "blue", configurable: true },
      { id: "N3", type: "server", label: "DHCP-SRV", sub: "10.10.10.2", x: 390, y: 172, status: "green" },
      { id: "N4", type: "pc", label: "ROGUE-PC2", sub: "Fa0/2 Alert", x: 55, y: 172, status: "red" }
    ],
    links: [
      { x1: 185, y1: 86, x2: 290, y2: 86, label: "SW1 Gi0/1 Trust", status: "blue" },
      { x1: 330, y1: 108, x2: 405, y2: 185, label: "SW2 Gi0/2 Trust", status: "green" },
      { x1: 140, y1: 110, x2: 95, y2: 185, label: "Fa0/2 15pps", status: "red" }
    ],
    objectives: [
      { id: "o1", device: "SW1", text: "[SW1] Enable 'ip dhcp snooping' and 'ip dhcp snooping vlan 10'", pattern: /ip\s+dhcp\s+snooping\s+vlan\s+10/i },
      { id: "o2", device: "SW1", text: "[SW1] Trust uplink Gi0/1 ('ip dhcp snooping trust')", pattern: /ip\s+dhcp\s+snooping\s+trust/i },
      { id: "o3", device: "SW1", text: "[SW1] Rate-limit Fa0/2 ('ip dhcp snooping limit rate 15')", pattern: /ip\s+dhcp\s+snooping\s+limit\s+rate\s+15/i },
      { id: "o4", device: "SW2", text: "[SW2] Enable 'ip dhcp snooping' globally", pattern: /^ip\s+dhcp\s+snooping$/i },
      { id: "o5", device: "SW2", text: "[SW2] Enable 'ip dhcp snooping vlan 10'", pattern: /ip\s+dhcp\s+snooping\s+vlan\s+10/i },
      { id: "o6", device: "SW2", text: "[SW2] Trust DHCP server port Gi0/2 ('ip dhcp snooping trust')", pattern: /ip\s+dhcp\s+snooping\s+trust/i }
    ],
    solutions: {
      SW1: ["ip dhcp snooping", "ip dhcp snooping vlan 10", "interface gigabitethernet 0/1", "ip dhcp snooping trust", "interface fastethernet 0/2", "ip dhcp snooping limit rate 15"],
      SW2: ["ip dhcp snooping", "ip dhcp snooping vlan 10", "interface gigabitethernet 0/2", "ip dhcp snooping trust"]
    },
    verifyOutput: "SW1 & SW2 DHCP Snooping VLAN 10: ACTIVE\nTrusted Chain: DHCP-SRV -> SW2 Gi0/2 -> SW1 Gi0/1 | Rogue OFFER dropped on SW1 Fa0/2"
  },
  {
    id: "LAB-11",
    passerTag: "Passer Lab #11 • DAI (2 Devices)",
    sectionCode: "5.0",
    section: "5.0 Security Fundamentals",
    title: "Multi-Switch Dynamic ARP Inspection (DAI)",
    devices: ["SW1", "SW2"],
    scenario: "Stop ARP spoofing across SW1 and SW2 for VLAN 10: On SW1, enable DAI on VLAN 10, enable src-mac/dst-mac validation, and trust uplink Gi0/1. On SW2, enable DAI on VLAN 10, trust trunk Gi0/1 (to SW1), and trust router uplink Gi0/2.",
    nodes: [
      { id: "N1", type: "switch", label: "SW1", sub: "Access DAI", x: 115, y: 58, status: "blue", configurable: true, selected: true },
      { id: "N2", type: "switch", label: "SW2", sub: "Core DAI", x: 270, y: 58, status: "blue", configurable: true },
      { id: "N3", type: "router", label: "GW-RTR", sub: "10.10.10.1", x: 385, y: 172, status: "green" },
      { id: "N4", type: "pc", label: "MITM-HOST", sub: "Spoofed ARP", x: 55, y: 172, status: "red" }
    ],
    links: [
      { x1: 185, y1: 86, x2: 290, y2: 86, label: "Gi0/1 DAI Trust", status: "blue" },
      { x1: 330, y1: 108, x2: 405, y2: 185, label: "Gi0/2 GW Trust", status: "green" },
      { x1: 140, y1: 110, x2: 95, y2: 185, label: "Fa0/2 Untrusted", status: "red" }
    ],
    objectives: [
      { id: "o1", device: "SW1", text: "[SW1] Enable DAI on VLAN 10 ('ip arp inspection vlan 10')", pattern: /ip\s+arp\s+inspection\s+vlan\s+10/i },
      { id: "o2", device: "SW1", text: "[SW1] Validate src-mac & dst-mac ('ip arp inspection validate src-mac dst-mac')", pattern: /ip\s+arp\s+inspection\s+validate\s+.*src-mac/i },
      { id: "o3", device: "SW1", text: "[SW1] Trust uplink Gi0/1 ('ip arp inspection trust')", pattern: /ip\s+arp\s+inspection\s+trust/i },
      { id: "o4", device: "SW2", text: "[SW2] Enable DAI on VLAN 10 ('ip arp inspection vlan 10')", pattern: /ip\s+arp\s+inspection\s+vlan\s+10/i },
      { id: "o5", device: "SW2", text: "[SW2] Trust inter-switch/router uplinks ('ip arp inspection trust')", pattern: /ip\s+arp\s+inspection\s+trust/i }
    ],
    solutions: {
      SW1: ["ip arp inspection vlan 10", "ip arp inspection validate src-mac dst-mac", "interface gigabitethernet 0/1", "ip arp inspection trust"],
      SW2: ["ip arp inspection vlan 10", "interface range gigabitethernet 0/1 - 2", "ip arp inspection trust"]
    },
    verifyOutput: "SW1 & SW2 DAI Active on VLAN 10 | Header MAC Validation ON | Forged ARPs dropped on SW1 Fa0/2"
  },
  {
    id: "LAB-12",
    passerTag: "Blueprint Lab • Multi-Area OSPF & Passive (3 Devices)",
    sectionCode: "3.0",
    section: "3.0 IP Connectivity",
    title: "3-Router Single-Area OSPF & Default Injection",
    devices: ["R1", "R2", "R3"],
    scenario: "Configure 3 routers in OSPF Process 1 Area 0: On R1 (ISP Edge), enable OSPF on Gi0/0 and inject a default route ('default-information originate'). On R2 (Transit), advertise 10.0.0.0/16 in Area 0. On R3 (Branch), enable OSPF on Gi0/0 and suppress Hellos on LAN Gi0/1 ('passive-interface gigabitethernet 0/1').",
    nodes: [
      { id: "N1", type: "router", label: "R1", sub: "ASBR Edge", x: 55, y: 60, status: "blue", configurable: true, selected: true },
      { id: "N2", type: "router", label: "R2", sub: "Core OSPF", x: 205, y: 60, status: "blue", configurable: true },
      { id: "N3", type: "router", label: "R3", sub: "Branch LAN", x: 355, y: 60, status: "blue", configurable: true },
      { id: "N4", type: "pc", label: "BRANCH-PC", sub: "Passive LAN", x: 355, y: 175, status: "green" }
    ],
    links: [
      { x1: 125, y1: 88, x2: 225, y2: 88, label: "Area 0", status: "blue" },
      { x1: 275, y1: 88, x2: 375, y2: 88, label: "Area 0", status: "blue" },
      { x1: 400, y1: 112, x2: 400, y2: 185, label: "Gi0/1 Passive", status: "green" }
    ],
    objectives: [
      { id: "o1", device: "R1", text: "[R1] Inject default route into OSPF ('default-information originate')", pattern: /default-information\s+originate/i },
      { id: "o2", device: "R1", text: "[R1] Enable OSPF Area 0 on Gi0/0 ('ip ospf 1 area 0')", pattern: /ip\s+ospf\s+1\s+area\s+0/i },
      { id: "o3", device: "R2", text: "[R2] Advertise 10.0.0.0 0.0.255.255 into Area 0", pattern: /network\s+10\.0\.0\.0\s+0\.0\.255\.255\s+area\s+0/i },
      { id: "o4", device: "R3", text: "[R3] Enable OSPF Area 0 on Gi0/0 ('ip ospf 1 area 0')", pattern: /ip\s+ospf\s+1\s+area\s+0/i },
      { id: "o5", device: "R3", text: "[R3] Set 'passive-interface gigabitethernet 0/1'", pattern: /passive-interface\s+g(igabitethernet)?\s*0\/1/i }
    ],
    solutions: {
      R1: ["router ospf 1", "default-information originate", "interface gigabitethernet 0/0", "ip ospf 1 area 0"],
      R2: ["router ospf 1", "network 10.0.0.0 0.0.255.255 area 0"],
      R3: ["router ospf 1", "passive-interface gigabitethernet 0/1", "interface gigabitethernet 0/0", "ip ospf 1 area 0"]
    },
    verifyOutput: "R1 <-> R2 <-> R3 FULL Adjacencies | R3 learned O*E2 0.0.0.0/0 | R3 Gi0/1 Passive"
  },
  {
    id: "LAB-13",
    passerTag: "Blueprint Lab • Port Security (2 Devices)",
    sectionCode: "5.0",
    section: "5.0 Security Fundamentals",
    title: "Dual-Switch Port Security & Sticky MAC Hardening",
    devices: ["SW1", "SW2"],
    scenario: "Harden user ports across SW1 and SW2: On SW1 Fa0/3, set static access, enable port-security, max 2 MACs, sticky learning, violation restrict. On SW2 Fa0/4, set static access, enable port-security, max 1 MAC, sticky learning, violation shutdown.",
    nodes: [
      { id: "N1", type: "switch", label: "SW1", sub: "Restrict Mode", x: 115, y: 58, status: "blue", configurable: true, selected: true },
      { id: "N2", type: "switch", label: "SW2", sub: "Shutdown Mode", x: 330, y: 58, status: "blue", configurable: true },
      { id: "N3", type: "pc", label: "PC+PHONE", sub: "Max 2 Sticky", x: 75, y: 175, status: "green" },
      { id: "N4", type: "pc", label: "ROGUE-PC", sub: "Max 1 Shut", x: 355, y: 175, status: "red" }
    ],
    links: [
      { x1: 185, y1: 86, x2: 345, y2: 86, label: "Trunk Gi0/1", status: "blue" },
      { x1: 145, y1: 110, x2: 110, y2: 185, label: "SW1 Fa0/3", status: "green" },
      { x1: 375, y1: 110, x2: 390, y2: 185, label: "SW2 Fa0/4", status: "red" }
    ],
    objectives: [
      { id: "o1", device: "SW1", text: "[SW1] On Fa0/3 set access mode & enable 'switchport port-security'", pattern: /^switchport\s+port-security$/i },
      { id: "o2", device: "SW1", text: "[SW1] Set max 2 MACs and sticky learning on Fa0/3", pattern: /switchport\s+port-security\s+maximum\s+2/i },
      { id: "o3", device: "SW1", text: "[SW1] Set violation restrict on Fa0/3", pattern: /switchport\s+port-security\s+violation\s+restrict/i },
      { id: "o4", device: "SW2", text: "[SW2] On Fa0/4 set access mode & enable 'switchport port-security'", pattern: /^switchport\s+port-security$/i },
      { id: "o5", device: "SW2", text: "[SW2] Enable sticky MAC learning on Fa0/4", pattern: /switchport\s+port-security\s+mac-address\s+sticky/i },
      { id: "o6", device: "SW2", text: "[SW2] Set violation shutdown on Fa0/4", pattern: /switchport\s+port-security\s+violation\s+shutdown/i }
    ],
    solutions: {
      SW1: ["interface fastethernet 0/3", "switchport mode access", "switchport port-security", "switchport port-security maximum 2", "switchport port-security mac-address sticky", "switchport port-security violation restrict"],
      SW2: ["interface fastethernet 0/4", "switchport mode access", "switchport port-security", "switchport port-security maximum 1", "switchport port-security mac-address sticky", "switchport port-security violation shutdown"]
    },
    verifyOutput: "SW1 Fa0/3: Secure-up (Max 2, Sticky, Restrict)\nSW2 Fa0/4: Secure-up (Max 1, Sticky, Shutdown)"
  },
  {
    id: "LAB-14",
    passerTag: "Blueprint Lab • L3 Switch SVI Routing (2 Devices)",
    sectionCode: "3.0",
    section: "3.0 IP Connectivity",
    title: "Multilayer Switch Inter-VLAN SVI + Upstream Router",
    devices: ["SW1", "R1"],
    scenario: "Configure Layer 3 switching on SW1 and routing on R1: On SW1, enable 'ip routing', configure SVI Vlan10 (192.168.10.1/24), convert uplink Gi0/1 to routed port ('no switchport', IP 10.0.0.2/30), and add default route via 10.0.0.1. On R1, add a return static route for 192.168.10.0/24 via 10.0.0.2.",
    nodes: [
      { id: "N1", type: "pc", label: "PC-V10", sub: "192.168.10.10", x: 45, y: 172, status: "green" },
      { id: "N2", type: "switch", label: "SW1", sub: "L3 Catalyst", x: 155, y: 55, status: "blue", configurable: true, selected: true },
      { id: "N3", type: "router", label: "R1", sub: "WAN Router", x: 335, y: 55, status: "blue", configurable: true },
      { id: "N4", type: "server", label: "HQ-APP", sub: "172.16.1.10", x: 365, y: 172, status: "green" }
    ],
    links: [
      { x1: 185, y1: 108, x2: 100, y2: 185, label: "VLAN 10", status: "green" },
      { x1: 220, y1: 84, x2: 350, y2: 84, label: "10.0.0.0/30 L3", status: "blue" },
      { x1: 375, y1: 108, x2: 395, y2: 185, label: "HQ Link", status: "green" }
    ],
    objectives: [
      { id: "o1", device: "SW1", text: "[SW1] Enable Layer 3 routing ('ip routing')", pattern: /^ip\s+routing$/i },
      { id: "o2", device: "SW1", text: "[SW1] Configure SVI Vlan10 IP 192.168.10.1 255.255.255.0", pattern: /ip\s+address\s+192\.168\.10\.1\s+255\.255\.255\.0/i },
      { id: "o3", device: "SW1", text: "[SW1] Convert Gi0/1 to routed port ('no switchport') with 10.0.0.2/30", pattern: /no\s+switchport/i },
      { id: "o4", device: "SW1", text: "[SW1] Set default route via R1 ('ip route 0.0.0.0 0.0.0.0 10.0.0.1')", pattern: /ip\s+route\s+0\.0\.0\.0\s+0\.0\.0\.0\s+10\.0\.0\.1/i },
      { id: "o5", device: "R1", text: "[R1] Add return route for 192.168.10.0/24 via 10.0.0.2", pattern: /ip\s+route\s+192\.168\.10\.0\s+255\.255\.255\.0\s+10\.0\.0\.2/i }
    ],
    solutions: {
      SW1: ["ip routing", "interface vlan 10", "ip address 192.168.10.1 255.255.255.0", "no shutdown", "interface gigabitethernet 0/1", "no switchport", "ip address 10.0.0.2 255.255.255.252", "exit", "ip route 0.0.0.0 0.0.0.0 10.0.0.1"],
      R1: ["ip route 192.168.10.0 255.255.255.0 10.0.0.2"]
    },
    verifyOutput: "SW1 L3 Routing Active (SVI Vlan10 + Routed Gi0/1) <-> R1 Return Route verified"
  },
  {
    id: "LAB-15",
    passerTag: "Blueprint Lab • Floating Static Failover (2 Devices)",
    sectionCode: "3.0",
    section: "3.0 IP Connectivity",
    title: "Dual-Router Primary & Floating Static Routes",
    devices: ["R1", "R2"],
    scenario: "Configure redundant routing on BOTH R1 and R2: On R1, configure a primary default route via 203.0.113.2, a floating backup default route via 198.51.100.2 with AD 5, and an IPv6 default route via 2001:db8:1::2. On R2, configure static return route for 10.20.0.0/24 via 203.0.113.1 and floating backup via 198.51.100.1 with AD 5.",
    nodes: [
      { id: "N1", type: "router", label: "R1", sub: "Branch Edge", x: 115, y: 60, status: "blue", configurable: true, selected: true },
      { id: "N2", type: "router", label: "R2", sub: "HQ Hub", x: 330, y: 60, status: "blue", configurable: true },
      { id: "N3", type: "pc", label: "BRANCH-LAN", sub: "10.20.0.0/24", x: 75, y: 175, status: "green" },
      { id: "N4", type: "server", label: "HQ-DC", sub: "172.16.0.10", x: 355, y: 175, status: "green" }
    ],
    links: [
      { x1: 185, y1: 80, x2: 345, y2: 80, label: "Primary AD 1", status: "green" },
      { x1: 185, y1: 100, x2: 345, y2: 100, label: "Backup AD 5", status: "orange" },
      { x1: 145, y1: 112, x2: 110, y2: 185, label: "LAN", status: "blue" }
    ],
    objectives: [
      { id: "o1", device: "R1", text: "[R1] Primary default route via 203.0.113.2", pattern: /ip\s+route\s+0\.0\.0\.0\s+0\.0\.0\.0\s+203\.0\.113\.2$/i },
      { id: "o2", device: "R1", text: "[R1] Floating backup default route via 198.51.100.2 AD 5", pattern: /ip\s+route\s+0\.0\.0\.0\s+0\.0\.0\.0\s+198\.51\.100\.2\s+5/i },
      { id: "o3", device: "R1", text: "[R1] IPv6 default route via 2001:db8:1::2", pattern: /ipv6\s+route\s+::\/0\s+2001:db8:1::2/i },
      { id: "o4", device: "R2", text: "[R2] Primary return route to 10.20.0.0/24 via 203.0.113.1", pattern: /ip\s+route\s+10\.20\.0\.0\s+255\.255\.255\.0\s+203\.0\.113\.1$/i },
      { id: "o5", device: "R2", text: "[R2] Floating backup return route via 198.51.100.1 AD 5", pattern: /ip\s+route\s+10\.20\.0\.0\s+255\.255\.255\.0\s+198\.51\.100\.1\s+5/i }
    ],
    solutions: {
      R1: ["ip route 0.0.0.0 0.0.0.0 203.0.113.2", "ip route 0.0.0.0 0.0.0.0 198.51.100.2 5", "ipv6 route ::/0 2001:db8:1::2"],
      R2: ["ip route 10.20.0.0 255.255.255.0 203.0.113.1", "ip route 10.20.0.0 255.255.255.0 198.51.100.1 5"]
    },
    verifyOutput: "R1 & R2 Primary Routes Active (AD 1) | Symmetric Floating Backups (AD 5) Ready"
  },
  {
    id: "LAB-16",
    passerTag: "Blueprint Lab • STP Root Primary/Secondary (3 Devices)",
    sectionCode: "2.0",
    section: "2.0 Network Access",
    title: "3-Switch Rapid PVST+ Root Primary, Secondary & BPDU Guard",
    devices: ["SW1", "SW2", "SW3"],
    scenario: "Configure Rapid PVST+ across all 3 switches: Make SW1 Primary Root for VLAN 10, make SW2 Secondary Root for VLAN 10, and on Access SW3 enable Rapid PVST+ plus PortFast & BPDU Guard on host port Fa0/1.",
    nodes: [
      { id: "N1", type: "switch", label: "SW1", sub: "Root Primary", x: 75, y: 48, status: "blue", configurable: true, selected: true },
      { id: "N2", type: "switch", label: "SW2", sub: "Root Secondary", x: 335, y: 48, status: "blue", configurable: true },
      { id: "N3", type: "switch", label: "SW3", sub: "Access Edge", x: 205, y: 158, status: "green", configurable: true },
      { id: "N4", type: "pc", label: "HOST-1", sub: "Fa0/1 Edge", x: 55, y: 175, status: "green" }
    ],
    links: [
      { x1: 145, y1: 76, x2: 350, y2: 76, label: "Dist Trunk", status: "green" },
      { x1: 120, y1: 102, x2: 225, y2: 168, label: "Root Path", status: "green" },
      { x1: 365, y1: 102, x2: 270, y2: 168, label: "Alt Blk", status: "orange" }
    ],
    objectives: [
      { id: "o1", device: "SW1", text: "[SW1] Enable 'spanning-tree mode rapid-pvst'", pattern: /spanning-tree\s+mode\s+rapid-pvst/i },
      { id: "o2", device: "SW1", text: "[SW1] Set Primary Root for VLAN 10 ('spanning-tree vlan 10 root primary')", pattern: /spanning-tree\s+vlan\s+10\s+root\s+primary/i },
      { id: "o3", device: "SW2", text: "[SW2] Enable 'spanning-tree mode rapid-pvst'", pattern: /spanning-tree\s+mode\s+rapid-pvst/i },
      { id: "o4", device: "SW2", text: "[SW2] Set Secondary Root for VLAN 10 ('spanning-tree vlan 10 root secondary')", pattern: /spanning-tree\s+vlan\s+10\s+root\s+secondary/i },
      { id: "o5", device: "SW3", text: "[SW3] Enable PortFast on Fa0/1 ('spanning-tree portfast')", pattern: /spanning-tree\s+portfast/i },
      { id: "o6", device: "SW3", text: "[SW3] Enable BPDU Guard on Fa0/1 ('spanning-tree bpduguard enable')", pattern: /spanning-tree\s+bpduguard\s+enable/i }
    ],
    solutions: {
      SW1: ["spanning-tree mode rapid-pvst", "spanning-tree vlan 10 root primary"],
      SW2: ["spanning-tree mode rapid-pvst", "spanning-tree vlan 10 root secondary"],
      SW3: ["spanning-tree mode rapid-pvst", "interface fastethernet 0/1", "spanning-tree portfast", "spanning-tree bpduguard enable"]
    },
    verifyOutput: "VLAN0010 Rapid PVST+ Converged: SW1=Root Primary (24586), SW2=Secondary (28682), SW3 Fa0/1=Edge+BPDUGuard"
  },
  {
    id: "LAB-17",
    passerTag: "Blueprint Lab • Static NAT & Firewall ACL (2 Devices)",
    sectionCode: "4.0",
    section: "4.0 IP Services",
    title: "DMZ Static NAT + Perimeter HTTPS Filter",
    devices: ["R1", "R2"],
    scenario: "Publish DMZ server 192.168.50.10 across 2 routers: On R1 (Edge), map 192.168.50.10 to 203.0.113.10 via Static NAT (Gi0/0 inside, Gi0/1 outside). On R2 (DMZ Firewall Router), permit HTTPS (TCP 443) to host 192.168.50.10 in ACL 110 and apply it inbound on Gi0/0.",
    nodes: [
      { id: "N1", type: "pc", label: "EXT-USER", sub: "198.51.100.55", x: 35, y: 170, status: "green" },
      { id: "N2", type: "router", label: "R1", sub: "Static NAT", x: 145, y: 55, status: "blue", configurable: true, selected: true },
      { id: "N3", type: "router", label: "R2", sub: "DMZ Filter", x: 315, y: 55, status: "blue", configurable: true },
      { id: "N4", type: "server", label: "DMZ-WEB", sub: "192.168.50.10", x: 375, y: 170, status: "green" }
    ],
    links: [
      { x1: 175, y1: 108, x2: 95, y2: 185, label: "R1 Gi0/1 Out", status: "orange" },
      { x1: 215, y1: 84, x2: 335, y2: 84, label: "R1 In / R2 Gi0/0", status: "blue" },
      { x1: 360, y1: 108, x2: 400, y2: 185, label: "DMZ LAN", status: "green" }
    ],
    objectives: [
      { id: "o1", device: "R1", text: "[R1] Map 192.168.50.10 to 203.0.113.10 via static NAT", pattern: /ip\s+nat\s+inside\s+source\s+static\s+192\.168\.50\.10\s+203\.0\.113\.10/i },
      { id: "o2", device: "R1", text: "[R1] Configure 'ip nat inside' on Gi0/0", pattern: /ip\s+nat\s+inside$/i },
      { id: "o3", device: "R1", text: "[R1] Configure 'ip nat outside' on Gi0/1", pattern: /ip\s+nat\s+outside$/i },
      { id: "o4", device: "R2", text: "[R2] Permit TCP 443 to host 192.168.50.10 in ACL 110", pattern: /access-list\s+110\s+permit\s+tcp\s+any\s+host\s+192\.168\.50\.10\s+eq\s+443/i },
      { id: "o5", device: "R2", text: "[R2] Apply ACL 110 inbound on Gi0/0", pattern: /ip\s+access-group\s+110\s+in/i }
    ],
    solutions: {
      R1: ["ip nat inside source static 192.168.50.10 203.0.113.10", "interface gigabitethernet 0/0", "ip nat inside", "interface gigabitethernet 0/1", "ip nat outside"],
      R2: ["access-list 110 permit tcp any host 192.168.50.10 eq 443", "interface gigabitethernet 0/0", "ip access-group 110 in"]
    },
    verifyOutput: "R1 Static NAT 203.0.113.10 <-> 192.168.50.10 Active | R2 ACL 110 permitting HTTPS 443 only"
  },
  {
    id: "LAB-18",
    passerTag: "Blueprint Lab • Central DHCP Server & Relay (2 Devices)",
    sectionCode: "4.0",
    section: "4.0 IP Services",
    title: "Central IOS DHCP Server + Remote Branch Relay Agent",
    devices: ["R1", "R2"],
    scenario: "Configure DHCP across 2 routers: On R1 (Central DHCP Server at 10.0.0.1), exclude 192.168.30.1–10 and create pool 'BRANCH_LAN' for 192.168.30.0/24 with default-router 192.168.30.1 and DNS 8.8.8.8. On R2 (Branch Gateway), configure 'ip helper-address 10.0.0.1' on LAN interface Gi0/0.",
    nodes: [
      { id: "N1", type: "router", label: "R1", sub: "DHCP Server .0.1", x: 115, y: 58, status: "blue", configurable: true, selected: true },
      { id: "N2", type: "router", label: "R2", sub: "Branch Relay", x: 330, y: 58, status: "blue", configurable: true },
      { id: "N3", type: "pc", label: "PC-1", sub: "192.168.30.11", x: 260, y: 175, status: "green" },
      { id: "N4", type: "pc", label: "PC-2", sub: "192.168.30.12", x: 390, y: 175, status: "green" }
    ],
    links: [
      { x1: 185, y1: 86, x2: 345, y2: 86, label: "WAN Relay", status: "blue" },
      { x1: 350, y1: 110, x2: 300, y2: 185, label: "R2 Gi0/0", status: "green" },
      { x1: 380, y1: 110, x2: 410, y2: 185, label: "Branch LAN", status: "green" }
    ],
    objectives: [
      { id: "o1", device: "R1", text: "[R1] Exclude 192.168.30.1 through 192.168.30.10", pattern: /ip\s+dhcp\s+excluded-address\s+192\.168\.30\.1\s+192\.168\.30\.10/i },
      { id: "o2", device: "R1", text: "[R1] Create pool BRANCH_LAN with network 192.168.30.0 255.255.255.0", pattern: /network\s+192\.168\.30\.0\s+255\.255\.255\.0/i },
      { id: "o3", device: "R1", text: "[R1] Set default-router 192.168.30.1 and dns-server 8.8.8.8", pattern: /default-router\s+192\.168\.30\.1/i },
      { id: "o4", device: "R1", text: "[R1] Configure 'dns-server 8.8.8.8' in pool BRANCH_LAN", pattern: /dns-server\s+8\.8\.8\.8/i },
      { id: "o5", device: "R2", text: "[R2] Configure 'ip helper-address 10.0.0.1' on Gi0/0", pattern: /ip\s+helper-address\s+10\.0\.0\.1/i }
    ],
    solutions: {
      R1: ["ip dhcp excluded-address 192.168.30.1 192.168.30.10", "ip dhcp pool BRANCH_LAN", "network 192.168.30.0 255.255.255.0", "default-router 192.168.30.1", "dns-server 8.8.8.8"],
      R2: ["interface gigabitethernet 0/0", "ip helper-address 10.0.0.1"]
    },
    verifyOutput: "R2 Gi0/0 relaying UDP 67 -> 10.0.0.1 | R1 Pool BRANCH_LAN leased .30.11 & .30.12"
  },
  {
    id: "LAB-19",
    passerTag: "Blueprint Lab • Dual-Router HSRPv2 (2 Devices)",
    sectionCode: "3.0",
    section: "3.0 IP Connectivity",
    title: "Dual-Router HSRPv2 Active & Standby Redundancy",
    devices: ["R1", "R2"],
    scenario: "Configure HSRPv2 Group 10 (Virtual IP 10.10.10.1) on Gi0/0 of BOTH routers: On R1, enable version 2, set virtual IP 10.10.10.1, priority 120, and preempt (Active). On R2, enable version 2, set virtual IP 10.10.10.1, and priority 90 (Standby).",
    nodes: [
      { id: "N1", type: "router", label: "R1", sub: "Active Prio 120", x: 115, y: 55, status: "blue", configurable: true, selected: true },
      { id: "N2", type: "router", label: "R2", sub: "Standby Prio 90", x: 330, y: 55, status: "blue", configurable: true },
      { id: "N3", type: "switch", label: "SW-LAN", sub: "VIP 10.10.10.1", x: 222, y: 135, status: "green" },
      { id: "N4", type: "pc", label: "HOST-1", sub: "GW 10.10.10.1", x: 222, y: 192, status: "green" }
    ],
    links: [
      { x1: 165, y1: 105, x2: 245, y2: 148, label: "R1 Gi0/0", status: "green" },
      { x1: 355, y1: 105, x2: 295, y2: 148, label: "R2 Gi0/0", status: "orange" },
      { x1: 270, y1: 170, x2: 270, y2: 200, label: "VIP .10.1", status: "blue" }
    ],
    objectives: [
      { id: "o1", device: "R1", text: "[R1] Set 'standby version 2' and 'standby 10 ip 10.10.10.1' on Gi0/0", pattern: /standby\s+10\s+ip\s+10\.10\.10\.1/i },
      { id: "o2", device: "R1", text: "[R1] Set 'standby 10 priority 120'", pattern: /standby\s+10\s+priority\s+120/i },
      { id: "o3", device: "R1", text: "[R1] Enable preemption ('standby 10 preempt')", pattern: /standby\s+10\s+preempt/i },
      { id: "o4", device: "R2", text: "[R2] Set 'standby version 2' on Gi0/0", pattern: /standby\s+version\s+2/i },
      { id: "o5", device: "R2", text: "[R2] Set 'standby 10 ip 10.10.10.1' and 'standby 10 priority 90'", pattern: /standby\s+10\s+priority\s+90/i }
    ],
    solutions: {
      R1: ["interface gigabitethernet 0/0", "standby version 2", "standby 10 ip 10.10.10.1", "standby 10 priority 120", "standby 10 preempt"],
      R2: ["interface gigabitethernet 0/0", "standby version 2", "standby 10 ip 10.10.10.1", "standby 10 priority 90"]
    },
    verifyOutput: "HSRPv2 Group 10 (VIP 10.10.10.1, VMAC 0000.0C9F.F00A):\n  R1 = Active (Pri 120, Preempt) | R2 = Standby (Pri 90)"
  },
  {
    id: "LAB-20",
    passerTag: "Blueprint Lab • Automation Onboarding (2 Devices)",
    sectionCode: "6.0",
    section: "6.0 Automation and Programmability",
    title: "Multi-Device SSHv2, RESTCONF & NETCONF-YANG Prep",
    devices: ["R1", "SW1"],
    scenario: "Onboard BOTH R1 and SW1 for Ansible & Catalyst Center automation: On R1, configure domain 'corp.local', SSHv2, HTTPS server ('ip http secure-server'), 'restconf', and 'netconf-yang'. On SW1, configure domain 'corp.local', SSHv2, and restrict VTY 0 15 to SSH ('transport input ssh').",
    nodes: [
      { id: "N1", type: "router", label: "R1", sub: "RESTCONF/830", x: 115, y: 58, status: "blue", configurable: true, selected: true },
      { id: "N2", type: "switch", label: "SW1", sub: "Ansible SSHv2", x: 330, y: 58, status: "blue", configurable: true },
      { id: "N3", type: "server", label: "CATALYST-CTR", sub: "HTTPS 443", x: 75, y: 175, status: "green" },
      { id: "N4", type: "server", label: "ANSIBLE-CTL", sub: "SSH TCP 22", x: 355, y: 175, status: "green" }
    ],
    links: [
      { x1: 185, y1: 86, x2: 345, y2: 86, label: "Mgmt VLAN", status: "blue" },
      { x1: 145, y1: 110, x2: 110, y2: 185, label: "RESTCONF/830", status: "green" },
      { x1: 375, y1: 110, x2: 390, y2: 185, label: "SSHv2 YAML", status: "green" }
    ],
    objectives: [
      { id: "o1", device: "R1", text: "[R1] Set 'ip domain-name corp.local' and 'ip ssh version 2'", pattern: /ip\s+ssh\s+version\s+2/i },
      { id: "o2", device: "R1", text: "[R1] Enable HTTPS server ('ip http secure-server')", pattern: /ip\s+http\s+secure-server/i },
      { id: "o3", device: "R1", text: "[R1] Enable RESTCONF ('restconf')", pattern: /^restconf$/i },
      { id: "o4", device: "R1", text: "[R1] Enable NETCONF YANG ('netconf-yang')", pattern: /^netconf-yang$/i },
      { id: "o5", device: "SW1", text: "[SW1] Set 'ip domain-name corp.local' and 'ip ssh version 2'", pattern: /ip\s+ssh\s+version\s+2/i },
      { id: "o6", device: "SW1", text: "[SW1] Restrict VTY 0 15 to SSH ('transport input ssh')", pattern: /transport\s+input\s+ssh/i }
    ],
    solutions: {
      R1: ["ip domain-name corp.local", "ip ssh version 2", "ip http secure-server", "restconf", "netconf-yang"],
      SW1: ["ip domain-name corp.local", "ip ssh version 2", "line vty 0 15", "transport input ssh"]
    },
    verifyOutput: "R1: SSHv2 + RESTCONF (443) + NETCONF-YANG (830) Ready\nSW1: SSHv2 + VTY SSH-Only Ready for Ansible Playbooks"
  }
];
