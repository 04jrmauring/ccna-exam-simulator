// CCNA 200-301 Virtual Lab Simulation Pool (20 Labs)
// Covers ALL 11 previous-passer topics (ACL, OSPF Election, VLAN, EtherChannel, Voice VLAN,
// CDP/LLDP, IPv4 & IPv6 Addressing, NAT, NTP, DHCP Snooping, DAI) + 9 core CCNA blueprint labs.
// Every exam attempt draws 6 randomized labs from this 20-lab pool.

window.CCNA_LAB_POOL = [
  {
    id: "LAB-01",
    passerTag: "Passer Lab #1 • ACL",
    sectionCode: "5.0",
    section: "5.0 Security Fundamentals",
    title: "Extended ACL Traffic Filtering",
    deviceName: "R1",
    initialMode: "config",
    initialPrompt: "R1(config)#",
    scenario: "Block HTTP (TCP 80) from VLAN 10 (192.168.10.0/24) to Web Server 10.10.50.10 while permitting all other IP traffic, and apply ACL 100 inbound on GigabitEthernet0/0.",
    nodes: [
      { id: "N1", type: "pc", label: "PC-LAN", sub: "192.168.10.15", x: 52, y: 168, status: "green" },
      { id: "N2", type: "router", label: "R1", sub: "Edge Router", x: 186, y: 52, status: "blue", selected: true },
      { id: "N3", type: "server", label: "WEB-SRV", sub: "10.10.50.10", x: 342, y: 52, status: "green" },
      { id: "N4", type: "pc", label: "ADMIN-PC", sub: "192.168.10.5", x: 302, y: 168, status: "orange" }
    ],
    links: [
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "Gi0/0", status: "green" },
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "Gi0/1", status: "blue" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "Gi0/2", status: "orange" }
    ],
    initialHistory: [
      { prompt: "R1#", cmd: "configure terminal" },
      { prompt: "R1(config)#", cmd: "! Configure Extended ACL 100 and apply inbound on Gi0/0" }
    ],
    objectives: [
      { id: "o1", text: "Deny TCP port 80 from 192.168.10.0/24 to host 10.10.50.10 in ACL 100", pattern: /access-list\s+100\s+deny\s+tcp\s+192\.168\.10\.0\s+0\.0\.0\.255\s+host\s+10\.10\.50\.10\s+eq\s+(80|www)/i },
      { id: "o2", text: "Permit all other IP traffic in ACL 100", pattern: /access-list\s+100\s+permit\s+ip\s+any\s+any/i },
      { id: "o3", text: "Enter interface GigabitEthernet0/0", pattern: /int(erface)?\s+g(igabitethernet)?\s*0\/0/i },
      { id: "o4", text: "Apply ACL 100 inbound on GigabitEthernet0/0", pattern: /ip\s+access-group\s+100\s+in/i }
    ],
    solution: [
      "access-list 100 deny tcp 192.168.10.0 0.0.0.255 host 10.10.50.10 eq 80",
      "access-list 100 permit ip any any",
      "interface gigabitethernet 0/0",
      "ip access-group 100 in"
    ],
    verifyOutput: "Extended IP access list 100\n    10 deny tcp 192.168.10.0 0.0.0.255 host 10.10.50.10 eq www\n    20 permit ip any any\nInterface Gi0/0: Inbound access list is 100"
  },
  {
    id: "LAB-02",
    passerTag: "Passer Lab #2 • OSPF Election",
    sectionCode: "3.0",
    section: "3.0 IP Connectivity",
    title: "OSPF DR/BDR Election Control",
    deviceName: "R1",
    initialMode: "config",
    initialPrompt: "R1(config)#",
    scenario: "Ensure R1 is elected as the OSPF Designated Router (DR) on GigabitEthernet0/0 (Area 0) with Router ID 1.1.1.1 and OSPF interface priority 200.",
    nodes: [
      { id: "N1", type: "router", label: "R1 (Target DR)", sub: "RID 1.1.1.1", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "router", label: "R2 (BDR)", sub: "RID 2.2.2.2", x: 342, y: 52, status: "green" },
      { id: "N3", type: "router", label: "R3 (DROTHER)", sub: "Prio 0", x: 52, y: 168, status: "green" },
      { id: "N4", type: "switch", label: "SW-CORE", sub: "10.0.12.0/24", x: 302, y: 168, status: "blue" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "Gi0/0", status: "blue" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "Area 0", status: "green" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "Seg-A", status: "green" }
    ],
    initialHistory: [
      { prompt: "R1#", cmd: "configure terminal" },
      { prompt: "R1(config)#", cmd: "! Configure OSPF process 1, router-id 1.1.1.1, and Gi0/0 priority 200" }
    ],
    objectives: [
      { id: "o1", text: "Enter OSPF process 1 ('router ospf 1')", pattern: /router\s+ospf\s+1/i },
      { id: "o2", text: "Set OSPF Router ID to 1.1.1.1", pattern: /router-id\s+1\.1\.1\.1/i },
      { id: "o3", text: "Enter interface GigabitEthernet0/0", pattern: /int(erface)?\s+g(igabitethernet)?\s*0\/0/i },
      { id: "o4", text: "Set OSPF interface priority to 200 and assign Area 0", pattern: /ip\s+ospf\s+priority\s+200/i },
      { id: "o5", text: "Enable OSPF process 1 Area 0 on Gi0/0 ('ip ospf 1 area 0')", pattern: /ip\s+ospf\s+1\s+area\s+0/i }
    ],
    solution: [
      "router ospf 1",
      "router-id 1.1.1.1",
      "interface gigabitethernet 0/0",
      "ip ospf priority 200",
      "ip ospf 1 area 0"
    ],
    verifyOutput: "Neighbor ID  Pri   State       Dead Time   Address      Interface\n2.2.2.2      100   FULL/BDR    00:00:36    10.0.12.2    Gi0/0\n3.3.3.3        0   FULL/DROTHER 00:00:38   10.0.12.3    Gi0/0\nLocal R1 State: DR (Priority 200, RID 1.1.1.1)"
  },
  {
    id: "LAB-03",
    passerTag: "Passer Lab #3 • VLAN",
    sectionCode: "2.0",
    section: "2.0 Network Access",
    title: "VLAN Assignment & 802.1Q Trunking",
    deviceName: "SW1",
    initialMode: "config",
    initialPrompt: "SW1(config)#",
    scenario: "Create VLAN 10 named SALES, assign FastEthernet0/1 as an access port in VLAN 10, and configure GigabitEthernet0/1 as an 802.1Q trunk with Native VLAN 99.",
    nodes: [
      { id: "N1", type: "switch", label: "SW1", sub: "Access Switch", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "switch", label: "SW2", sub: "Dist Switch", x: 342, y: 52, status: "green" },
      { id: "N3", type: "pc", label: "PC-SALES", sub: "VLAN 10", x: 52, y: 168, status: "green" },
      { id: "N4", type: "pc", label: "PC-HR", sub: "VLAN 20", x: 302, y: 168, status: "green" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "Gi0/1 Trunk", status: "blue" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "Fa0/1", status: "green" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "Fa0/2", status: "green" }
    ],
    initialHistory: [
      { prompt: "SW1#", cmd: "configure terminal" },
      { prompt: "SW1(config)#", cmd: "! Create VLAN 10 (SALES), configure Fa0/1 access, Gi0/1 trunk native 99" }
    ],
    objectives: [
      { id: "o1", text: "Create VLAN 10 and name it SALES", pattern: /name\s+sales/i },
      { id: "o2", text: "Configure Fa0/1 as static access port in VLAN 10", pattern: /switchport\s+access\s+vlan\s+10/i },
      { id: "o3", text: "Configure Gi0/1 as static trunk ('switchport mode trunk')", pattern: /switchport\s+mode\s+trunk/i },
      { id: "o4", text: "Set Native VLAN 99 on trunk Gi0/1", pattern: /switchport\s+trunk\s+native\s+vlan\s+99/i }
    ],
    solution: [
      "vlan 10",
      "name SALES",
      "interface fastethernet 0/1",
      "switchport mode access",
      "switchport access vlan 10",
      "interface gigabitethernet 0/1",
      "switchport mode trunk",
      "switchport trunk native vlan 99"
    ],
    verifyOutput: "VLAN Name      Status   Ports\n10   SALES     active   Fa0/1\nPort  Mode  Encapsulation  Status    Native vlan\nGi0/1 on    802.1q         trunking  99"
  },
  {
    id: "LAB-04",
    passerTag: "Passer Lab #4 • EtherChannel",
    sectionCode: "2.0",
    section: "2.0 Network Access",
    title: "LACP EtherChannel Link Aggregation",
    deviceName: "SW1",
    initialMode: "config",
    initialPrompt: "SW1(config)#",
    scenario: "Bundle interfaces GigabitEthernet0/1 and 0/2 into Port-channel 1 using LACP active mode, then configure Port-channel 1 as an 802.1Q trunk.",
    nodes: [
      { id: "N1", type: "switch", label: "SW1", sub: "LACP Active", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "switch", label: "SW2", sub: "LACP Passive", x: 342, y: 52, status: "green" },
      { id: "N3", type: "pc", label: "HOST-A", sub: "VLAN 10", x: 52, y: 168, status: "green" },
      { id: "N4", type: "pc", label: "HOST-B", sub: "VLAN 20", x: 302, y: 168, status: "green" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "Po1 (Gi0/1-2)", status: "blue" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "Fa0/1", status: "green" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "Fa0/2", status: "green" }
    ],
    initialHistory: [
      { prompt: "SW1#", cmd: "configure terminal" },
      { prompt: "SW1(config)#", cmd: "! Bundle Gi0/1-2 with LACP active into Po1 and trunk Po1" }
    ],
    objectives: [
      { id: "o1", text: "Select interface range GigabitEthernet0/1 - 2", pattern: /int(erface)?\s+range\s+g(igabitethernet)?\s*0\/1\s*-\s*2/i },
      { id: "o2", text: "Assign LACP active mode to channel-group 1", pattern: /channel-group\s+1\s+mode\s+active/i },
      { id: "o3", text: "Enter interface Port-channel 1", pattern: /int(erface)?\s+po(rt-channel)?\s*1/i },
      { id: "o4", text: "Configure Port-channel 1 as a trunk", pattern: /switchport\s+mode\s+trunk/i }
    ],
    solution: [
      "interface range gigabitethernet 0/1 - 2",
      "channel-group 1 mode active",
      "interface port-channel 1",
      "switchport mode trunk"
    ],
    verifyOutput: "Group  Port-channel  Protocol  Ports\n1      Po1(SU)       LACP      Gi0/1(P) Gi0/2(P)"
  },
  {
    id: "LAB-05",
    passerTag: "Passer Lab #5 • Voice VLAN",
    sectionCode: "2.0",
    section: "2.0 Network Access",
    title: "Voice VLAN & Data Access Port",
    deviceName: "SW1",
    initialMode: "config",
    initialPrompt: "SW1(config)#",
    scenario: "Configure FastEthernet0/5 to carry untagged PC traffic in Data VLAN 10, 802.1Q-tagged Cisco IP Phone traffic in Voice VLAN 20, and enable PortFast.",
    nodes: [
      { id: "N1", type: "switch", label: "SW1", sub: "PoE+ Switch", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "server", label: "CUCM-PBX", sub: "VLAN 20", x: 342, y: 52, status: "green" },
      { id: "N3", type: "pc", label: "IP-PHONE + PC", sub: "V10 / Voice V20", x: 52, y: 168, status: "green" },
      { id: "N4", type: "pc", label: "WORKSTATION", sub: "10.10.10.25", x: 302, y: 168, status: "green" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "Gi0/1", status: "blue" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "Fa0/5", status: "green" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "Fa0/6", status: "green" }
    ],
    initialHistory: [
      { prompt: "SW1#", cmd: "configure terminal" },
      { prompt: "SW1(config)#", cmd: "! Configure Fa0/5 with Data VLAN 10, Voice VLAN 20, and PortFast" }
    ],
    objectives: [
      { id: "o1", text: "Enter interface FastEthernet0/5", pattern: /int(erface)?\s+f(astethernet)?\s*0\/5/i },
      { id: "o2", text: "Set static access mode and Data VLAN 10", pattern: /switchport\s+access\s+vlan\s+10/i },
      { id: "o3", text: "Assign Voice VLAN 20 ('switchport voice vlan 20')", pattern: /switchport\s+voice\s+vlan\s+20/i },
      { id: "o4", text: "Enable Spanning Tree PortFast on Fa0/5", pattern: /spanning-tree\s+portfast/i }
    ],
    solution: [
      "interface fastethernet 0/5",
      "switchport mode access",
      "switchport access vlan 10",
      "switchport voice vlan 20",
      "spanning-tree portfast"
    ],
    verifyOutput: "Name: Fa0/5\nAdministrative Mode: static access\nAccess Mode VLAN: 10 (DATA)\nVoice VLAN: 20 (VOICE)\nSpanning Tree PortFast: Enabled"
  },
  {
    id: "LAB-06",
    passerTag: "Passer Lab #6 • CDP & LLDP",
    sectionCode: "2.0",
    section: "2.0 Network Access",
    title: "CDP Hardening & LLDP Discovery",
    deviceName: "SW1",
    initialMode: "config",
    initialPrompt: "SW1(config)#",
    scenario: "Enable standards-based LLDP globally, enable LLDP transmit/receive on GigabitEthernet0/2 (to third-party AP), and disable CDP on untrusted uplink GigabitEthernet0/1.",
    nodes: [
      { id: "N1", type: "switch", label: "SW1", sub: "Cisco Switch", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "router", label: "ISP-EDGE", sub: "Untrusted", x: 342, y: 52, status: "red" },
      { id: "N3", type: "pc", label: "3RD-PARTY AP", sub: "LLDP Peer", x: 52, y: 168, status: "green" },
      { id: "N4", type: "switch", label: "SW2-CISCO", sub: "CDP Peer", x: 302, y: 168, status: "green" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "Gi0/1 (No CDP)", status: "red" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "Gi0/2 LLDP", status: "green" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "Gi0/3", status: "green" }
    ],
    initialHistory: [
      { prompt: "SW1#", cmd: "configure terminal" },
      { prompt: "SW1(config)#", cmd: "! Enable LLDP globally, configure Gi0/2 LLDP, disable CDP on Gi0/1" }
    ],
    objectives: [
      { id: "o1", text: "Enable LLDP globally ('lldp run')", pattern: /^lldp\s+run$/i },
      { id: "o2", text: "Disable CDP on GigabitEthernet0/1 ('no cdp enable')", pattern: /no\s+cdp\s+enable/i },
      { id: "o3", text: "Enable LLDP transmit on GigabitEthernet0/2", pattern: /lldp\s+transmit/i },
      { id: "o4", text: "Enable LLDP receive on GigabitEthernet0/2", pattern: /lldp\s+receive/i }
    ],
    solution: [
      "lldp run",
      "interface gigabitethernet 0/1",
      "no cdp enable",
      "interface gigabitethernet 0/2",
      "lldp transmit",
      "lldp receive"
    ],
    verifyOutput: "Global LLDP Status: ACTIVE\nGi0/1 CDP: Disabled\nGi0/2 LLDP: Tx/Rx Enabled -> Neighbor: AP-VENDOR-01"
  },
  {
    id: "LAB-07",
    passerTag: "Passer Lab #7 • IPv4 & IPv6",
    sectionCode: "1.0",
    section: "1.0 Network Fundamentals",
    title: "Dual-Stack IPv4 & IPv6 Addressing",
    deviceName: "R1",
    initialMode: "config",
    initialPrompt: "R1(config)#",
    scenario: "Enable IPv6 unicast routing on R1, configure Gi0/0 with IPv4 192.168.10.1/24, IPv6 Global Unicast 2001:db8:10::1/64, Link-Local fe80::1, and bring the interface up.",
    nodes: [
      { id: "N1", type: "router", label: "R1", sub: "Dual-Stack GW", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "router", label: "ISP-RTR", sub: "2001:db8:ff::1", x: 342, y: 52, status: "green" },
      { id: "N3", type: "pc", label: "HOST-V4/V6", sub: "Dual-Stack PC", x: 52, y: 168, status: "green" },
      { id: "N4", type: "server", label: "DNS-SRV", sub: "2001:db8:10::53", x: 302, y: 168, status: "green" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "Gi0/1 WAN", status: "blue" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "Gi0/0 LAN", status: "green" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "LAN-B", status: "green" }
    ],
    initialHistory: [
      { prompt: "R1#", cmd: "configure terminal" },
      { prompt: "R1(config)#", cmd: "! Enable ipv6 unicast-routing and configure dual-stack on Gi0/0" }
    ],
    objectives: [
      { id: "o1", text: "Enable IPv6 routing globally ('ipv6 unicast-routing')", pattern: /ipv6\s+unicast-routing/i },
      { id: "o2", text: "Assign IPv4 192.168.10.1 255.255.255.0 on Gi0/0", pattern: /ip\s+address\s+192\.168\.10\.1\s+255\.255\.255\.0/i },
      { id: "o3", text: "Assign IPv6 GUA 2001:db8:10::1/64 on Gi0/0", pattern: /ipv6\s+address\s+2001:db8:10::1\/64/i },
      { id: "o4", text: "Assign IPv6 Link-Local fe80::1 and enable Gi0/0 ('no shutdown')", pattern: /ipv6\s+address\s+fe80::1\s+link-local/i },
      { id: "o5", text: "Bring interface up with 'no shutdown'", pattern: /no\s+sh(utdown)?/i }
    ],
    solution: [
      "ipv6 unicast-routing",
      "interface gigabitethernet 0/0",
      "ip address 192.168.10.1 255.255.255.0",
      "ipv6 address 2001:db8:10::1/64",
      "ipv6 address fe80::1 link-local",
      "no shutdown"
    ],
    verifyOutput: "GigabitEthernet0/0 is up, line protocol is up\n  IPv4: 192.168.10.1/24\n  IPv6 Link-Local: FE80::1\n  IPv6 Global: 2001:DB8:10::1/64"
  },
  {
    id: "LAB-08",
    passerTag: "Passer Lab #8 • NAT / PAT",
    sectionCode: "4.0",
    section: "4.0 IP Services",
    title: "PAT (NAT Overload) Internet Edge",
    deviceName: "R1",
    initialMode: "config",
    initialPrompt: "R1(config)#",
    scenario: "Configure PAT Overload on R1 so internal network 10.10.0.0/16 (matched by ACL 1) translates to the outside interface Gi0/1 IP address. Mark Gi0/0 inside and Gi0/1 outside.",
    nodes: [
      { id: "N1", type: "router", label: "R1 (NAT Edge)", sub: "203.0.113.1", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "server", label: "INTERNET", sub: "8.8.8.8", x: 342, y: 52, status: "green" },
      { id: "N3", type: "pc", label: "PC-1", sub: "10.10.1.10", x: 52, y: 168, status: "green" },
      { id: "N4", type: "pc", label: "PC-2", sub: "10.10.2.20", x: 302, y: 168, status: "green" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "Gi0/1 Outside", status: "blue" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "Gi0/0 Inside", status: "green" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "LAN", status: "green" }
    ],
    initialHistory: [
      { prompt: "R1#", cmd: "configure terminal" },
      { prompt: "R1(config)#", cmd: "! Configure ACL 1, NAT inside/outside, and PAT overload on Gi0/1" }
    ],
    objectives: [
      { id: "o1", text: "Create ACL 1 permitting 10.10.0.0 0.0.255.255", pattern: /access-list\s+1\s+permit\s+10\.10\.0\.0\s+0\.0\.255\.255/i },
      { id: "o2", text: "Configure 'ip nat inside' on Gi0/0", pattern: /ip\s+nat\s+inside$/i },
      { id: "o3", text: "Configure 'ip nat outside' on Gi0/1", pattern: /ip\s+nat\s+outside$/i },
      { id: "o4", text: "Enable PAT overload using ACL 1 on Gi0/1", pattern: /ip\s+nat\s+inside\s+source\s+list\s+1\s+int(erface)?\s+g(igabitethernet)?\s*0\/1\s+overload/i }
    ],
    solution: [
      "access-list 1 permit 10.10.0.0 0.0.255.255",
      "interface gigabitethernet 0/0",
      "ip nat inside",
      "interface gigabitethernet 0/1",
      "ip nat outside",
      "exit",
      "ip nat inside source list 1 interface gigabitethernet 0/1 overload"
    ],
    verifyOutput: "Pro  Inside global       Inside local      Outside local   Outside global\ntcp  203.0.113.1:1024    10.10.1.10:1024   8.8.8.8:443     8.8.8.8:443"
  },
  {
    id: "LAB-09",
    passerTag: "Passer Lab #9 • NTP",
    sectionCode: "4.0",
    section: "4.0 IP Services",
    title: "NTP Client Synchronization & Auth",
    deviceName: "R1",
    initialMode: "config",
    initialPrompt: "R1(config)#",
    scenario: "Configure R1 to synchronize with Stratum 1 NTP server 10.0.0.50 using authentication key 1 (MD5 secret 'CiscoNTP'), enable NTP authentication, and trust key 1.",
    nodes: [
      { id: "N1", type: "router", label: "R1", sub: "NTP Client", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "server", label: "NTP-MASTER", sub: "10.0.0.50 S1", x: 342, y: 52, status: "green" },
      { id: "N3", type: "switch", label: "SW1", sub: "Stratum 3", x: 52, y: 168, status: "green" },
      { id: "N4", type: "server", label: "SYSLOG-SRV", sub: "10.0.0.60", x: 302, y: 168, status: "green" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "UDP 123", status: "blue" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "Gi0/1", status: "green" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "UDP 514", status: "green" }
    ],
    initialHistory: [
      { prompt: "R1#", cmd: "configure terminal" },
      { prompt: "R1(config)#", cmd: "! Configure authenticated NTP client pointing to 10.0.0.50" }
    ],
    objectives: [
      { id: "o1", text: "Enable NTP authentication ('ntp authenticate')", pattern: /ntp\s+authenticate/i },
      { id: "o2", text: "Define MD5 key 1 ('ntp authentication-key 1 md5 CiscoNTP')", pattern: /ntp\s+authentication-key\s+1\s+md5\s+\S+/i },
      { id: "o3", text: "Trust key 1 ('ntp trusted-key 1')", pattern: /ntp\s+trusted-key\s+1/i },
      { id: "o4", text: "Point to NTP server 10.0.0.50 with key 1", pattern: /ntp\s+server\s+10\.0\.0\.50(\s+key\s+1)?/i }
    ],
    solution: [
      "ntp authenticate",
      "ntp authentication-key 1 md5 CiscoNTP",
      "ntp trusted-key 1",
      "ntp server 10.0.0.50 key 1"
    ],
    verifyOutput: "Clock is synchronized, stratum 2, reference is 10.0.0.50\nAuthentication: Enabled (Trusted Key 1 verified)"
  },
  {
    id: "LAB-10",
    passerTag: "Passer Lab #10 • DHCP Snooping",
    sectionCode: "5.0",
    section: "5.0 Security Fundamentals",
    title: "Layer 2 Security: DHCP Snooping",
    deviceName: "SW1",
    initialMode: "config",
    initialPrompt: "SW1(config)#",
    scenario: "Protect VLAN 10 from rogue DHCP servers on SW1: enable DHCP snooping globally, apply it to VLAN 10, trust uplink Gi0/1 facing the legitimate DHCP server, and rate-limit Fa0/2 to 15 pps.",
    nodes: [
      { id: "N1", type: "switch", label: "SW1", sub: "L3 Multilayer", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "server", label: "DHCP Server", sub: "Trusted .10.2", x: 342, y: 52, status: "green" },
      { id: "N3", type: "pc", label: "PC-1 (Host A)", sub: "10.10.10.11 OK", x: 52, y: 168, status: "green" },
      { id: "N4", type: "pc", label: "PC-2 (Rogue)", sub: "Untrusted Alert", x: 302, y: 168, status: "red" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "Gi0/1 Trust", status: "blue" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "Fa0/1", status: "green" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "Fa0/2 Alert", status: "red" }
    ],
    initialHistory: [
      { prompt: "SW1(config)#", cmd: "ip dhcp snooping" },
      { prompt: "SW1(config)#", cmd: "ip dhcp snooping vlan 10" },
      { prompt: "SW1(config)#", cmd: "interface gigabitethernet 0/1" },
      { prompt: "SW1(config-if)#", cmd: "ip dhcp snooping trust" }
    ],
    objectives: [
      { id: "o1", text: "Enable DHCP snooping globally ('ip dhcp snooping')", pattern: /^ip\s+dhcp\s+snooping$/i, preCompleted: true },
      { id: "o2", text: "Enable DHCP snooping on VLAN 10 ('ip dhcp snooping vlan 10')", pattern: /ip\s+dhcp\s+snooping\s+vlan\s+10/i, preCompleted: true },
      { id: "o3", text: "Trust uplink GigabitEthernet0/1 ('ip dhcp snooping trust')", pattern: /ip\s+dhcp\s+snooping\s+trust/i, preCompleted: true },
      { id: "o4", text: "Limit DHCP rate to 15 pps on Fa0/2 ('ip dhcp snooping limit rate 15')", pattern: /ip\s+dhcp\s+snooping\s+limit\s+rate\s+15/i }
    ],
    solution: [
      "ip dhcp snooping",
      "ip dhcp snooping vlan 10",
      "interface gigabitethernet 0/1",
      "ip dhcp snooping trust",
      "interface fastethernet 0/2",
      "ip dhcp snooping limit rate 15"
    ],
    verifyOutput: "Switch DHCP snooping is enabled (VLAN 10)\nGi0/1   Trusted: yes   Rate limit: unlimited\nFa0/1   Trusted: no    Rate limit: 15\nFa0/2   Trusted: no    Rate limit: 15 (Rogue OFFER dropped)"
  },
  {
    id: "LAB-11",
    passerTag: "Passer Lab #11 • DAI",
    sectionCode: "5.0",
    section: "5.0 Security Fundamentals",
    title: "Dynamic ARP Inspection (DAI)",
    deviceName: "SW1",
    initialMode: "config",
    initialPrompt: "SW1(config)#",
    scenario: "Prevent ARP spoofing in VLAN 10: enable DAI on VLAN 10, enable src-mac and dst-mac validation, and configure uplink GigabitEthernet0/1 as an ARP inspection trusted port.",
    nodes: [
      { id: "N1", type: "switch", label: "SW1", sub: "DAI Enabled", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "router", label: "GW-RTR", sub: "10.10.10.1", x: 342, y: 52, status: "green" },
      { id: "N3", type: "pc", label: "PC-VALID", sub: "Valid ARP", x: 52, y: 168, status: "green" },
      { id: "N4", type: "pc", label: "MITM-HOST", sub: "Spoofed ARP", x: 302, y: 168, status: "red" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "Gi0/1 Trust", status: "blue" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "Fa0/1", status: "green" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "Fa0/2 Spoof", status: "red" }
    ],
    initialHistory: [
      { prompt: "SW1#", cmd: "configure terminal" },
      { prompt: "SW1(config)#", cmd: "! Enable DAI on VLAN 10, validate MACs, and trust Gi0/1" }
    ],
    objectives: [
      { id: "o1", text: "Enable DAI on VLAN 10 ('ip arp inspection vlan 10')", pattern: /ip\s+arp\s+inspection\s+vlan\s+10/i },
      { id: "o2", text: "Validate source and destination MACs ('ip arp inspection validate src-mac dst-mac')", pattern: /ip\s+arp\s+inspection\s+validate\s+.*src-mac/i },
      { id: "o3", text: "Enter uplink interface GigabitEthernet0/1", pattern: /int(erface)?\s+g(igabitethernet)?\s*0\/1/i },
      { id: "o4", text: "Configure 'ip arp inspection trust' on Gi0/1", pattern: /ip\s+arp\s+inspection\s+trust/i }
    ],
    solution: [
      "ip arp inspection vlan 10",
      "ip arp inspection validate src-mac dst-mac",
      "interface gigabitethernet 0/1",
      "ip arp inspection trust"
    ],
    verifyOutput: "Source Mac Validation: Enabled | Dest Mac Validation: Enabled\nVLAN 10 DAI Status: Active\nGi0/1 Trust State: Trusted | Fa0/2: Untrusted (3 forged ARP packets dropped)"
  },
  {
    id: "LAB-12",
    passerTag: "Blueprint Lab • Standard VTY ACL",
    sectionCode: "5.0",
    section: "5.0 Security Fundamentals",
    title: "Named Standard ACL for SSH VTY Control",
    deviceName: "R1",
    initialMode: "config",
    initialPrompt: "R1(config)#",
    scenario: "Create a named standard ACL 'ADMIN_VTY' permitting only management subnet 10.99.0.0/24, and apply it inbound to VTY lines 0 15 with SSH-only transport.",
    nodes: [
      { id: "N1", type: "router", label: "R1", sub: "Mgmt Target", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "pc", label: "ADMIN-NMS", sub: "10.99.0.10", x: 342, y: 52, status: "green" },
      { id: "N3", type: "pc", label: "GUEST-PC", sub: "192.168.50.9", x: 52, y: 168, status: "red" },
      { id: "N4", type: "server", label: "AAA-ISE", sub: "10.99.0.5", x: 302, y: 168, status: "green" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "SSH Permit", status: "green" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "VTY Deny", status: "red" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "Mgmt", status: "blue" }
    ],
    initialHistory: [
      { prompt: "R1#", cmd: "configure terminal" },
      { prompt: "R1(config)#", cmd: "! Create standard ACL ADMIN_VTY and apply to line vty 0 15" }
    ],
    objectives: [
      { id: "o1", text: "Create named standard ACL ADMIN_VTY", pattern: /ip\s+access-list\s+standard\s+ADMIN_VTY/i },
      { id: "o2", text: "Permit 10.99.0.0 0.0.0.255 inside ACL", pattern: /permit\s+10\.99\.0\.0\s+0\.0\.0\.255/i },
      { id: "o3", text: "Apply 'access-class ADMIN_VTY in' on line vty 0 15", pattern: /access-class\s+ADMIN_VTY\s+in/i },
      { id: "o4", text: "Restrict VTY lines to SSH ('transport input ssh')", pattern: /transport\s+input\s+ssh/i }
    ],
    solution: [
      "ip access-list standard ADMIN_VTY",
      "permit 10.99.0.0 0.0.0.255",
      "line vty 0 15",
      "access-class ADMIN_VTY in",
      "transport input ssh"
    ],
    verifyOutput: "Standard IP access list ADMIN_VTY\n    10 permit 10.99.0.0, wildcard bits 0.0.0.255\nline vty 0 15: access-class ADMIN_VTY in | transport input ssh"
  },
  {
    id: "LAB-13",
    passerTag: "Blueprint Lab • Port Security",
    sectionCode: "5.0",
    section: "5.0 Security Fundamentals",
    title: "Switch Port Security & Sticky MAC",
    deviceName: "SW1",
    initialMode: "config",
    initialPrompt: "SW1(config)#",
    scenario: "Harden FastEthernet0/3 on SW1: force static access mode, enable port-security, allow maximum 2 MAC addresses, enable sticky MAC learning, and set violation mode to restrict.",
    nodes: [
      { id: "N1", type: "switch", label: "SW1", sub: "PortSec Active", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "pc", label: "CORP-PC", sub: "Sticky MAC #1", x: 342, y: 52, status: "green" },
      { id: "N3", type: "pc", label: "IP-PHONE", sub: "Sticky MAC #2", x: 52, y: 168, status: "green" },
      { id: "N4", type: "pc", label: "ROGUE-HUB", sub: "Violation Alert", x: 302, y: 168, status: "red" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "Fa0/3", status: "green" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "Authorized", status: "green" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "Restrict Drop", status: "red" }
    ],
    initialHistory: [
      { prompt: "SW1#", cmd: "configure terminal" },
      { prompt: "SW1(config)#", cmd: "! Configure Port Security (max 2, sticky, restrict) on Fa0/3" }
    ],
    objectives: [
      { id: "o1", text: "Enter Fa0/3 and set 'switchport mode access'", pattern: /switchport\s+mode\s+access/i },
      { id: "o2", text: "Enable 'switchport port-security'", pattern: /^switchport\s+port-security$/i },
      { id: "o3", text: "Set maximum 2 MAC addresses", pattern: /switchport\s+port-security\s+maximum\s+2/i },
      { id: "o4", text: "Enable sticky MAC learning", pattern: /switchport\s+port-security\s+mac-address\s+sticky/i },
      { id: "o5", text: "Set violation mode to restrict", pattern: /switchport\s+port-security\s+violation\s+restrict/i }
    ],
    solution: [
      "interface fastethernet 0/3",
      "switchport mode access",
      "switchport port-security",
      "switchport port-security maximum 2",
      "switchport port-security mac-address sticky",
      "switchport port-security violation restrict"
    ],
    verifyOutput: "Port Security: Enabled | Port Status: Secure-up\nViolation Mode: Restrict | Maximum MAC Addresses: 2 | Sticky MACs: 2"
  },
  {
    id: "LAB-14",
    passerTag: "Blueprint Lab • Inter-VLAN Routing",
    sectionCode: "3.0",
    section: "3.0 IP Connectivity",
    title: "Router-on-a-Stick Inter-VLAN Routing",
    deviceName: "R1",
    initialMode: "config",
    initialPrompt: "R1(config)#",
    scenario: "Configure subinterfaces Gi0/0.10 (VLAN 10, IP 192.168.10.1/24) and Gi0/0.20 (VLAN 20, IP 192.168.20.1/24) on R1, and ensure parent interface Gi0/0 is enabled.",
    nodes: [
      { id: "N1", type: "router", label: "R1", sub: "ROAS Gateway", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "switch", label: "SW1", sub: "802.1Q Trunk", x: 342, y: 52, status: "green" },
      { id: "N3", type: "pc", label: "PC-V10", sub: "192.168.10.10", x: 52, y: 168, status: "green" },
      { id: "N4", type: "pc", label: "PC-V20", sub: "192.168.20.10", x: 302, y: 168, status: "green" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "Gi0/0.10/.20", status: "blue" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "VLAN 10", status: "green" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "VLAN 20", status: "green" }
    ],
    initialHistory: [
      { prompt: "R1#", cmd: "configure terminal" },
      { prompt: "R1(config)#", cmd: "! Configure dot1Q subinterfaces Gi0/0.10 and Gi0/0.20" }
    ],
    objectives: [
      { id: "o1", text: "Enable parent Gi0/0 with 'no shutdown'", pattern: /no\s+sh(utdown)?/i },
      { id: "o2", text: "Configure 'encapsulation dot1q 10' on Gi0/0.10", pattern: /encapsulation\s+dot1q\s+10/i },
      { id: "o3", text: "Assign IP 192.168.10.1 255.255.255.0 on Gi0/0.10", pattern: /ip\s+address\s+192\.168\.10\.1\s+255\.255\.255\.0/i },
      { id: "o4", text: "Configure 'encapsulation dot1q 20' and IP 192.168.20.1 on Gi0/0.20", pattern: /encapsulation\s+dot1q\s+20/i },
      { id: "o5", text: "Assign IP 192.168.20.1 255.255.255.0 on Gi0/0.20", pattern: /ip\s+address\s+192\.168\.20\.1\s+255\.255\.255\.0/i }
    ],
    solution: [
      "interface gigabitethernet 0/0",
      "no shutdown",
      "interface gigabitethernet 0/0.10",
      "encapsulation dot1q 10",
      "ip address 192.168.10.1 255.255.255.0",
      "interface gigabitethernet 0/0.20",
      "encapsulation dot1q 20",
      "ip address 192.168.20.1 255.255.255.0"
    ],
    verifyOutput: "Gi0/0.10   192.168.10.1   up   up   (VLAN 10)\nGi0/0.20   192.168.20.1   up   up   (VLAN 20)"
  },
  {
    id: "LAB-15",
    passerTag: "Blueprint Lab • Floating Static",
    sectionCode: "3.0",
    section: "3.0 IP Connectivity",
    title: "Primary & Floating Static Default Routes",
    deviceName: "R1",
    initialMode: "config",
    initialPrompt: "R1(config)#",
    scenario: "Configure a primary IPv4 default route via ISP-A (203.0.113.2), a floating backup IPv4 default route via ISP-B (198.51.100.2) with AD 5, and an IPv6 default route via 2001:db8:1::2.",
    nodes: [
      { id: "N1", type: "router", label: "R1 (Branch)", sub: "Dual-ISP", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "router", label: "ISP-A (Pri)", sub: "203.0.113.2", x: 342, y: 52, status: "green" },
      { id: "N3", type: "router", label: "ISP-B (Backup)", sub: "198.51.100.2", x: 52, y: 168, status: "orange" },
      { id: "N4", type: "pc", label: "BRANCH-LAN", sub: "10.20.0.0/24", x: 302, y: 168, status: "green" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "Primary AD 1", status: "green" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "Backup AD 5", status: "orange" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "Gi0/2 LAN", status: "blue" }
    ],
    initialHistory: [
      { prompt: "R1#", cmd: "configure terminal" },
      { prompt: "R1(config)#", cmd: "! Configure primary default route, floating backup AD 5, and IPv6 default route" }
    ],
    objectives: [
      { id: "o1", text: "Configure primary IPv4 default route via 203.0.113.2", pattern: /ip\s+route\s+0\.0\.0\.0\s+0\.0\.0\.0\s+203\.0\.113\.2$/i },
      { id: "o2", text: "Configure floating backup IPv4 route via 198.51.100.2 with AD 5", pattern: /ip\s+route\s+0\.0\.0\.0\s+0\.0\.0\.0\s+198\.51\.100\.2\s+5/i },
      { id: "o3", text: "Configure IPv6 default route via 2001:db8:1::2", pattern: /ipv6\s+route\s+::\/0\s+2001:db8:1::2/i }
    ],
    solution: [
      "ip route 0.0.0.0 0.0.0.0 203.0.113.2",
      "ip route 0.0.0.0 0.0.0.0 198.51.100.2 5",
      "ipv6 route ::/0 2001:db8:1::2"
    ],
    verifyOutput: "S* 0.0.0.0/0 [1/0] via 203.0.113.2 (Active; Backup via 198.51.100.2 AD 5 standby)\nS  ::/0 [1/0] via 2001:DB8:1::2"
  },
  {
    id: "LAB-16",
    passerTag: "Blueprint Lab • Rapid PVST+ & BPDU Guard",
    sectionCode: "2.0",
    section: "2.0 Network Access",
    title: "STP Root Bridge & Edge BPDU Guard",
    deviceName: "SW1",
    initialMode: "config",
    initialPrompt: "SW1(config)#",
    scenario: "Configure SW1 to run Rapid PVST+, make SW1 the primary Root Bridge for VLAN 10, and enable PortFast + BPDU Guard on access port FastEthernet0/1.",
    nodes: [
      { id: "N1", type: "switch", label: "SW1 (Root)", sub: "Rapid PVST+", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "switch", label: "SW2", sub: "Non-Root", x: 342, y: 52, status: "green" },
      { id: "N3", type: "pc", label: "HOST-EDGE", sub: "PortFast+BPDUGuard", x: 52, y: 168, status: "green" },
      { id: "N4", type: "switch", label: "SW3", sub: "Alt Port Blk", x: 302, y: 168, status: "orange" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "Desig FWD", status: "green" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "Fa0/1 Edge", status: "blue" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "Desig FWD", status: "green" }
    ],
    initialHistory: [
      { prompt: "SW1#", cmd: "configure terminal" },
      { prompt: "SW1(config)#", cmd: "! Enable rapid-pvst, root primary VLAN 10, and PortFast/BPDU Guard on Fa0/1" }
    ],
    objectives: [
      { id: "o1", text: "Set STP mode to rapid-pvst", pattern: /spanning-tree\s+mode\s+rapid-pvst/i },
      { id: "o2", text: "Set SW1 as root primary for VLAN 10", pattern: /spanning-tree\s+vlan\s+10\s+root\s+primary/i },
      { id: "o3", text: "Enable PortFast on Fa0/1", pattern: /spanning-tree\s+portfast/i },
      { id: "o4", text: "Enable BPDU Guard on Fa0/1 ('spanning-tree bpduguard enable')", pattern: /spanning-tree\s+bpduguard\s+enable/i }
    ],
    solution: [
      "spanning-tree mode rapid-pvst",
      "spanning-tree vlan 10 root primary",
      "interface fastethernet 0/1",
      "spanning-tree portfast",
      "spanning-tree bpduguard enable"
    ],
    verifyOutput: "VLAN0010 Spanning tree enabled protocol rstp\nRoot ID Priority 24586 — This bridge is the root\nFa0/1: Edge PortFast + BPDU Guard Enabled"
  },
  {
    id: "LAB-17",
    passerTag: "Blueprint Lab • Static NAT DMZ",
    sectionCode: "4.0",
    section: "4.0 IP Services",
    title: "Static 1:1 NAT for DMZ Server",
    deviceName: "R1",
    initialMode: "config",
    initialPrompt: "R1(config)#",
    scenario: "Publish internal DMZ server 192.168.50.10 to the Internet at public IP 203.0.113.10 via Static NAT. Mark Gi0/0 inside and Gi0/1 outside.",
    nodes: [
      { id: "N1", type: "router", label: "R1 (Edge)", sub: "Static NAT", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "pc", label: "EXT-CLIENT", sub: "198.51.100.55", x: 342, y: 52, status: "green" },
      { id: "N3", type: "server", label: "DMZ-WEB", sub: "192.168.50.10", x: 52, y: 168, status: "green" },
      { id: "N4", type: "server", label: "APP-DB", sub: "192.168.50.20", x: 302, y: 168, status: "green" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "Gi0/1 Outside", status: "blue" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "Gi0/0 Inside", status: "green" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "DMZ", status: "green" }
    ],
    initialHistory: [
      { prompt: "R1#", cmd: "configure terminal" },
      { prompt: "R1(config)#", cmd: "! Map 192.168.50.10 <-> 203.0.113.10 and assign inside/outside" }
    ],
    objectives: [
      { id: "o1", text: "Configure static NAT mapping 192.168.50.10 to 203.0.113.10", pattern: /ip\s+nat\s+inside\s+source\s+static\s+192\.168\.50\.10\s+203\.0\.113\.10/i },
      { id: "o2", text: "Mark Gi0/0 as 'ip nat inside'", pattern: /ip\s+nat\s+inside$/i },
      { id: "o3", text: "Mark Gi0/1 as 'ip nat outside'", pattern: /ip\s+nat\s+outside$/i }
    ],
    solution: [
      "ip nat inside source static 192.168.50.10 203.0.113.10",
      "interface gigabitethernet 0/0",
      "ip nat inside",
      "interface gigabitethernet 0/1",
      "ip nat outside"
    ],
    verifyOutput: "Pro  Inside global   Inside local     Outside local  Outside global\n---  203.0.113.10    192.168.50.10    ---            ---"
  },
  {
    id: "LAB-18",
    passerTag: "Blueprint Lab • DHCP Server & Pool",
    sectionCode: "4.0",
    section: "4.0 IP Services",
    title: "Cisco IOS DHCP Server & Exclusions",
    deviceName: "R1",
    initialMode: "config",
    initialPrompt: "R1(config)#",
    scenario: "Configure R1 as a DHCP server for 192.168.30.0/24: exclude .1 through .10, create pool 'BRANCH_LAN', define the network, default-router 192.168.30.1, and DNS 8.8.8.8.",
    nodes: [
      { id: "N1", type: "router", label: "R1 (DHCP)", sub: "192.168.30.1", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "server", label: "DNS-EXT", sub: "8.8.8.8", x: 342, y: 52, status: "green" },
      { id: "N3", type: "pc", label: "PC-DHCP1", sub: "192.168.30.11", x: 52, y: 168, status: "green" },
      { id: "N4", type: "pc", label: "PC-DHCP2", sub: "192.168.30.12", x: 302, y: 168, status: "green" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "Gi0/1 WAN", status: "blue" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "DORA Lease", status: "green" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "Gi0/0 LAN", status: "green" }
    ],
    initialHistory: [
      { prompt: "R1#", cmd: "configure terminal" },
      { prompt: "R1(config)#", cmd: "! Exclude 192.168.30.1-10 and configure DHCP pool BRANCH_LAN" }
    ],
    objectives: [
      { id: "o1", text: "Exclude 192.168.30.1 through 192.168.30.10", pattern: /ip\s+dhcp\s+excluded-address\s+192\.168\.30\.1\s+192\.168\.30\.10/i },
      { id: "o2", text: "Create pool 'ip dhcp pool BRANCH_LAN'", pattern: /ip\s+dhcp\s+pool\s+BRANCH_LAN/i },
      { id: "o3", text: "Configure 'network 192.168.30.0 255.255.255.0'", pattern: /network\s+192\.168\.30\.0\s+255\.255\.255\.0/i },
      { id: "o4", text: "Configure 'default-router 192.168.30.1' and 'dns-server 8.8.8.8'", pattern: /default-router\s+192\.168\.30\.1/i },
      { id: "o5", text: "Configure DNS server 8.8.8.8", pattern: /dns-server\s+8\.8\.8\.8/i }
    ],
    solution: [
      "ip dhcp excluded-address 192.168.30.1 192.168.30.10",
      "ip dhcp pool BRANCH_LAN",
      "network 192.168.30.0 255.255.255.0",
      "default-router 192.168.30.1",
      "dns-server 8.8.8.8"
    ],
    verifyOutput: "Pool BRANCH_LAN : 192.168.30.0 /24 | Excluded: .1-.10\nActive Bindings: 192.168.30.11 (PC-DHCP1), 192.168.30.12 (PC-DHCP2)"
  },
  {
    id: "LAB-19",
    passerTag: "Blueprint Lab • HSRP FHRP",
    sectionCode: "3.0",
    section: "3.0 IP Connectivity",
    title: "HSRPv2 Active Gateway & Preemption",
    deviceName: "R1",
    initialMode: "config",
    initialPrompt: "R1(config)#",
    scenario: "Configure HSRPv2 on R1 GigabitEthernet0/0 for Group 10 with virtual gateway IP 10.10.10.1, priority 120 (to become Active), and preemption enabled.",
    nodes: [
      { id: "N1", type: "router", label: "R1 (Active)", sub: "HSRP Prio 120", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "router", label: "R2 (Standby)", sub: "HSRP Prio 100", x: 342, y: 52, status: "green" },
      { id: "N3", type: "pc", label: "HOST-1", sub: "GW 10.10.10.1", x: 52, y: 168, status: "green" },
      { id: "N4", type: "pc", label: "HOST-2", sub: "GW 10.10.10.1", x: 302, y: 168, status: "green" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "HSRP Hello", status: "blue" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "VIP .10.1", status: "green" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "Standby Path", status: "orange" }
    ],
    initialHistory: [
      { prompt: "R1#", cmd: "configure terminal" },
      { prompt: "R1(config)#", cmd: "! Configure HSRPv2 Group 10, VIP 10.10.10.1, priority 120, preempt on Gi0/0" }
    ],
    objectives: [
      { id: "o1", text: "Enter interface GigabitEthernet0/0", pattern: /int(erface)?\s+g(igabitethernet)?\s*0\/0/i },
      { id: "o2", text: "Set HSRP version 2 ('standby version 2')", pattern: /standby\s+version\s+2/i },
      { id: "o3", text: "Assign virtual IP 10.10.10.1 for group 10", pattern: /standby\s+10\s+ip\s+10\.10\.10\.1/i },
      { id: "o4", text: "Set priority 120 and enable preempt", pattern: /standby\s+10\s+priority\s+120/i },
      { id: "o5", text: "Enable preemption ('standby 10 preempt')", pattern: /standby\s+10\s+preempt/i }
    ],
    solution: [
      "interface gigabitethernet 0/0",
      "standby version 2",
      "standby 10 ip 10.10.10.1",
      "standby 10 priority 120",
      "standby 10 preempt"
    ],
    verifyOutput: "Gi0/0 - Group 10 (version 2) | State is Active | Priority 120 (Preempt enabled)\nVirtual IP address is 10.10.10.1 | Virtual MAC 0000.0C9F.F00A"
  },
  {
    id: "LAB-20",
    passerTag: "Blueprint Lab • Automation & SSH/RESTCONF",
    sectionCode: "6.0",
    section: "6.0 Automation and Programmability",
    title: "SSHv2 Hardening & RESTCONF/NETCONF Enablement",
    deviceName: "R1",
    initialMode: "config",
    initialPrompt: "R1(config)#",
    scenario: "Prepare R1 for Ansible & Catalyst Center automation: set domain name 'corp.local', enable SSH version 2, enable HTTPS secure server, and activate both 'restconf' and 'netconf-yang'.",
    nodes: [
      { id: "N1", type: "router", label: "R1 (IOS-XE)", sub: "RESTCONF/SSH", x: 186, y: 52, status: "blue", selected: true },
      { id: "N2", type: "server", label: "ANSIBLE-CTL", sub: "SSH / YAML", x: 342, y: 52, status: "green" },
      { id: "N3", type: "server", label: "CATALYST-CTR", sub: "HTTPS 443", x: 52, y: 168, status: "green" },
      { id: "N4", type: "pc", label: "NETOPS-DEV", sub: "Postman/Py", x: 302, y: 168, status: "green" }
    ],
    links: [
      { x1: 230, y1: 84, x2: 365, y2: 84, label: "SSHv2 / 830", status: "blue" },
      { x1: 205, y1: 108, x2: 112, y2: 184, label: "RESTCONF 443", status: "green" },
      { x1: 255, y1: 108, x2: 342, y2: 184, label: "JSON API", status: "green" }
    ],
    initialHistory: [
      { prompt: "R1#", cmd: "configure terminal" },
      { prompt: "R1(config)#", cmd: "! Configure domain corp.local, SSHv2, HTTPS server, restconf & netconf-yang" }
    ],
    objectives: [
      { id: "o1", text: "Set domain name 'ip domain-name corp.local'", pattern: /ip\s+domain[- ]name\s+corp\.local/i },
      { id: "o2", text: "Enforce SSH version 2 ('ip ssh version 2')", pattern: /ip\s+ssh\s+version\s+2/i },
      { id: "o3", text: "Enable HTTPS server ('ip http secure-server')", pattern: /ip\s+http\s+secure-server/i },
      { id: "o4", text: "Enable RESTCONF ('restconf')", pattern: /^restconf$/i },
      { id: "o5", text: "Enable NETCONF YANG ('netconf-yang')", pattern: /^netconf-yang$/i }
    ],
    solution: [
      "ip domain-name corp.local",
      "ip ssh version 2",
      "ip http secure-server",
      "restconf",
      "netconf-yang"
    ],
    verifyOutput: "SSH Enabled - version 2.0 | HTTPS Server: Enabled (Port 443)\nRESTCONF: Running (/restconf/data) | NETCONF-YANG: Listening TCP 830"
  }
];
