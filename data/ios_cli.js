// Complete Cisco IOS / Packet Tracer Command Tree, Context-Sensitive '?' Helper,
// Tab Auto-Completion, and Unambiguous Abbreviation Expander (e.g., ex -> exit, conf t -> configure terminal,
// int g0/0 -> interface gigabitethernet 0/0, sw tr na vl 99 -> switchport trunk native vlan 99).

(function () {
  const SHOW_TREE = {
    "running-config": { desc: "Current operating configuration", cr: true },
    "startup-config": { desc: "Contents of startup configuration", cr: true },
    version: { desc: "System hardware and software status", cr: true },
    ip: {
      desc: "IP information",
      sub: {
        interface: { desc: "IP interface status and configuration", sub: { brief: { desc: "Brief summary of IP status and configuration", cr: true } }, cr: true },
        route: { desc: "IP routing table", sub: { ospf: { desc: "OSPF routes", cr: true }, static: { desc: "Static routes", cr: true }, connected: { desc: "Connected routes", cr: true } }, cr: true },
        ospf: { desc: "OSPF information", sub: { neighbor: { desc: "OSPF neighbor list", cr: true }, interface: { desc: "OSPF interface info", sub: { brief: { desc: "Brief OSPF interface summary", cr: true } }, cr: true }, database: { desc: "Database summary", cr: true } } },
        protocols: { desc: "IP routing protocol process parameters", cr: true },
        nat: { desc: "IP NAT information", sub: { translations: { desc: "Translation entries", cr: true }, statistics: { desc: "Translation statistics", cr: true } } },
        dhcp: { desc: "DHCP information", sub: { snooping: { desc: "DHCP snooping status", sub: { binding: { desc: "DHCP snooping bindings", cr: true } }, cr: true }, binding: { desc: "DHCP server address bindings", cr: true }, pool: { desc: "DHCP pool information", cr: true } } },
        arp: { desc: "IP ARP table / inspection", sub: { inspection: { desc: "Dynamic ARP Inspection status", sub: { interfaces: { desc: "DAI interface trust states", cr: true }, vlan: { desc: "DAI VLAN status <vlan-id>", cr: true } }, cr: true } }, cr: true },
        "access-lists": { desc: "List IP access lists", cr: true },
      },
    },
    ipv6: {
      desc: "IPv6 information",
      sub: {
        interface: { desc: "IPv6 interface status", sub: { brief: { desc: "Brief summary of IPv6 addresses", cr: true } }, cr: true },
        route: { desc: "IPv6 routing table", cr: true },
      },
    },
    vlan: { desc: "VTP VLAN status", sub: { brief: { desc: "VTP all VLAN status in brief", cr: true } }, cr: true },
    interfaces: {
      desc: "Interface status and configuration",
      sub: {
        trunk: { desc: "Show interface trunking information", cr: true },
        status: { desc: "Show interface line status", cr: true },
        switchport: { desc: "Show interface switchport information", cr: true },
      },
      cr: true,
    },
    etherchannel: { desc: "EtherChannel information", sub: { summary: { desc: "One-line summary per channel-group", cr: true }, "port-channel": { desc: "Port-channel details", cr: true } } },
    "spanning-tree": { desc: "Spanning tree topology", sub: { vlan: { desc: "VLAN Switch Spanning Tree <1-4094>", cr: true }, summary: { desc: "Summary of port states", cr: true } }, cr: true },
    "port-security": { desc: "Show secure port information", sub: { interface: { desc: "Show port-security for an interface", cr: true }, address: { desc: "Show secure MAC addresses", cr: true } }, cr: true },
    cdp: { desc: "CDP information", sub: { neighbors: { desc: "CDP neighbor entries", sub: { detail: { desc: "Show detailed neighbor info", cr: true } }, cr: true } } },
    lldp: { desc: "LLDP information", sub: { neighbors: { desc: "LLDP neighbor entries", sub: { detail: { desc: "Show detailed LLDP neighbor info", cr: true } }, cr: true } } },
    ntp: { desc: "Network time protocol", sub: { status: { desc: "NTP status", cr: true }, associations: { desc: "NTP associations", cr: true } } },
    "access-lists": { desc: "List access lists", cr: true },
    standby: { desc: "HSRP information", sub: { brief: { desc: "Brief HSRP status", cr: true } }, cr: true },
    "mac": { desc: "MAC configuration", sub: { "address-table": { desc: "MAC forwarding table", cr: true } } },
    logging: { desc: "Show the contents of logging buffers", cr: true },
    clock: { desc: "Display the system clock", cr: true },
  };

  const ACL_PORT_SUB = {
    eq: { desc: "Match only packets on a given port number", sub: { "<port>": { desc: "Port number or keyword (80, www, 443, 22, 23, 53)", cr: true } } },
    neq: { desc: "Match only packets not on a given port", sub: { "<port>": { desc: "Port number", cr: true } } },
    range: { desc: "Match packets in a range of ports", sub: { "<start-port>": { desc: "Starting port number", cr: true } } },
  };

  const ACL_DST_SUB = {
    any: { desc: "Any destination host", sub: ACL_PORT_SUB, cr: true },
    host: { desc: "A single destination host", sub: { "<dst-ip>": { desc: "Destination host IP address", sub: ACL_PORT_SUB, cr: true } } },
    "<dst-ip>": { desc: "Destination network address", sub: { "<dst-wildcard>": { desc: "Destination wildcard bits", sub: ACL_PORT_SUB, cr: true } } },
  };

  const ACL_SRC_SUB = {
    any: { desc: "Any source host", sub: ACL_DST_SUB },
    host: { desc: "A single source host", sub: { "<src-ip>": { desc: "Source host IP address", sub: ACL_DST_SUB } } },
    "<src-ip>": { desc: "Source network address", sub: { "<src-wildcard>": { desc: "Source wildcard bits (e.g. 0.0.0.255)", sub: ACL_DST_SUB } } },
  };

  const ACL_PROTO_SUB = {
    ip: { desc: "Any Internet Protocol", sub: ACL_SRC_SUB },
    tcp: { desc: "Transmission Control Protocol", sub: ACL_SRC_SUB },
    udp: { desc: "User Datagram Protocol", sub: ACL_SRC_SUB },
    icmp: { desc: "Internet Control Message Protocol", sub: ACL_SRC_SUB },
  };

  const STD_ACL_ACTION_SUB = {
    any: { desc: "Any source host", cr: true },
    host: { desc: "A single host address", sub: { "<ip>": { desc: "Host IP address", cr: true } } },
    "<ip>": { desc: "Address to match", sub: { "<wildcard>": { desc: "Wildcard bits (e.g. 0.0.0.255)", cr: true } }, cr: true },
  };

  const DO_SUB = {
    show: { desc: "Show running system information", sub: SHOW_TREE },
    write: { desc: "Save running configuration to startup-config", sub: { memory: { desc: "Write to NV memory", cr: true } }, cr: true },
    copy: { desc: "Copy configuration", sub: { "running-config": { desc: "Current configuration", sub: { "startup-config": { desc: "Startup configuration", cr: true } } } } },
    ping: { desc: "Send echo messages", sub: { "<ip>": { desc: "Destination IP address", cr: true } } },
    verify: { desc: "Check lab verification status", cr: true },
  };

  const ACL_COMBINED_SUB = {
    ...ACL_PROTO_SUB,
    any: { desc: "Any source host (standard ACL)", cr: true },
    host: { desc: "A single host address (standard ACL)", sub: { "<ip>": { desc: "Host IP address", cr: true } } },
    "<ip>": { desc: "Source IP network address", sub: { "<wildcard>": { desc: "Wildcard bits (e.g. 0.0.0.255)", cr: true } }, cr: true },
  };

  const IFACE_TYPE_SUB = {
    gigabitethernet: { desc: "GigabitEthernet IEEE 802.3z (e.g. 0/0, 0/1, 0/0.10)", sub: { "<slot/port>": { desc: "Interface number (e.g. 0/0, 0/1, 0/0.10)", cr: true } } },
    fastethernet: { desc: "FastEthernet IEEE 802.3 (e.g. 0/1, 0/2, 0/3, 0/5)", sub: { "<slot/port>": { desc: "Interface number (e.g. 0/1, 0/2, 0/5)", cr: true } } },
    "port-channel": { desc: "Ethernet Channel of interfaces", sub: { "<1-64>": { desc: "Port-channel interface number", cr: true } } },
    vlan: { desc: "Catalyst Vlans (SVI)", sub: { "<1-4094>": { desc: "VLAN interface number", cr: true } } },
    loopback: { desc: "Loopback interface", sub: { "<0-2147483647>": { desc: "Loopback interface number", cr: true } } },
  };

  const IOS_TREES = {
    user: {
      enable: { desc: "Turn on privileged commands", cr: true },
      ping: { desc: "Send echo messages", sub: { "<ip>": { desc: "Destination IP address", cr: true } } },
      show: { desc: "Show running system information", sub: SHOW_TREE },
      traceroute: { desc: "Trace route to destination", sub: { "<ip>": { desc: "Destination IP address", cr: true } } },
      exit: { desc: "Exit from the EXEC", cr: true },
    },
    priv: {
      configure: { desc: "Enter configuration mode", sub: { terminal: { desc: "Configure from the terminal", cr: true } }, cr: true },
      show: { desc: "Show running system information", sub: SHOW_TREE },
      copy: { desc: "Copy from one file to another", sub: { "running-config": { desc: "Copy from current system configuration", sub: { "startup-config": { desc: "Copy to startup configuration", cr: true } } } } },
      write: { desc: "Write running configuration to memory", sub: { memory: { desc: "Write to NV memory", cr: true } }, cr: true },
      clear: { desc: "Reset functions", sub: { ip: { desc: "IP clear commands", sub: { ospf: { desc: "Clear OSPF", sub: { process: { desc: "Reset OSPF process", cr: true } } }, nat: { desc: "Clear NAT", sub: { translation: { desc: "Clear dynamic NAT translations (*)", cr: true } } } } }, counters: { desc: "Clear interface counters", cr: true } }, cr: true },
      ping: { desc: "Send echo messages", sub: { "<ip>": { desc: "Target IPv4 or IPv6 address", cr: true } } },
      traceroute: { desc: "Trace route to destination", sub: { "<ip>": { desc: "Target IP address", cr: true } } },
      terminal: { desc: "Set terminal line parameters", sub: { monitor: { desc: "Copy debug/syslog output to current terminal", cr: true } } },
      disable: { desc: "Turn off privileged commands (return to User EXEC >)", cr: true },
      verify: { desc: "Run Packet Tracer lab check", cr: true },
      exit: { desc: "Exit from the EXEC", cr: true },
    },
    config: {
      "access-list": {
        desc: "Add an access list entry",
        sub: {
          "<1-99>": { desc: "IP standard access list", sub: { permit: { desc: "Specify packets to forward", sub: STD_ACL_ACTION_SUB }, deny: { desc: "Specify packets to reject", sub: STD_ACL_ACTION_SUB } } },
          "<100-199>": { desc: "IP extended access list", sub: { permit: { desc: "Specify packets to forward", sub: ACL_PROTO_SUB }, deny: { desc: "Specify packets to reject", sub: ACL_PROTO_SUB } } },
        },
      },
      banner: { desc: "Define a login banner", sub: { motd: { desc: "Set Message of the Day banner", sub: { "<text>": { desc: "Delimited banner message", cr: true } } } } },
      cdp: { desc: "Global CDP configuration subcommands", sub: { run: { desc: "Enable CDP globally", cr: true }, timer: { desc: "Specify rate at which CDP packets are sent", sub: { "<5-254>": { desc: "Seconds", cr: true } } }, holdtime: { desc: "Specify holdtime sent in CDP packets", sub: { "<10-255>": { desc: "Seconds", cr: true } } } } },
      crypto: { desc: "Encryption module", sub: { key: { desc: "Long term key operations", sub: { generate: { desc: "Generate new keys", sub: { rsa: { desc: "Generate RSA keys", cr: true } } } } } } },
      do: { desc: "To run exec commands in config mode", sub: DO_SUB },
      enable: { desc: "Modify enable password parameters", sub: { secret: { desc: "Assign the secret password", sub: { "<password>": { desc: "Cleartext secret", cr: true } } } } },
      end: { desc: "Exit from configure mode to Privileged EXEC", cr: true },
      errdisable: { desc: "Error disable", sub: { recovery: { desc: "Error disable recovery", sub: { cause: { desc: "Enable recovery for specific cause", sub: { "psecure-violation": { desc: "Port security violation", cr: true }, bpduguard: { desc: "BPDU Guard violation", cr: true } } } } } } },
      exit: { desc: "Exit from configure mode", cr: true },
      hostname: { desc: "Set system's network name", sub: { "<name>": { desc: "System host name", cr: true } } },
      interface: {
        desc: "Select an interface to configure",
        sub: {
          ...IFACE_TYPE_SUB,
          range: { desc: "Interface range command", sub: { gigabitethernet: { desc: "GigabitEthernet range (e.g. 0/1 - 2)", sub: { "<range>": { desc: "Port range", cr: true } } }, fastethernet: { desc: "FastEthernet range (e.g. 0/1 - 5)", sub: { "<range>": { desc: "Port range", cr: true } } } } },
        },
      },
      ip: {
        desc: "Global IP configuration subcommands",
        sub: {
          "access-list": { desc: "Named access-list", sub: { standard: { desc: "Standard Access List", sub: { "<name>": { desc: "Access-list name", cr: true } } }, extended: { desc: "Extended Access List", sub: { "<name>": { desc: "Access-list name", cr: true } } } } },
          arp: {
            desc: "Global ARP configuration",
            sub: {
              inspection: {
                desc: "Dynamic ARP Inspection (DAI)",
                sub: {
                  vlan: { desc: "Enable/Disable ARP Inspection on VLANs", sub: { "<vlan-list>": { desc: "VLAN ID or range (e.g. 10)", cr: true } } },
                  validate: {
                    desc: "Validate addresses in ARP packets",
                    sub: {
                      "src-mac": { desc: "Validate source MAC address", sub: { "dst-mac": { desc: "Validate destination MAC address", sub: { ip: { desc: "Validate IP addresses", cr: true } }, cr: true } }, cr: true },
                      "dst-mac": { desc: "Validate destination MAC address", sub: { "src-mac": { desc: "Validate source MAC", cr: true } }, cr: true },
                      ip: { desc: "Validate IP addresses", cr: true },
                    },
                  },
                },
              },
            },
          },
          "default-gateway": { desc: "Specify default gateway (L2 switch)", sub: { "<ip>": { desc: "Gateway IP address", cr: true } } },
          dhcp: {
            desc: "Configure DHCP server, relay, and snooping",
            sub: {
              "excluded-address": { desc: "Prevent DHCP from assigning certain addresses", sub: { "<low-ip>": { desc: "Low IP address", sub: { "<high-ip>": { desc: "High IP address (optional)", cr: true } }, cr: true } } },
              pool: { desc: "Configure DHCP address pool", sub: { "<name>": { desc: "Pool name", cr: true } } },
              snooping: {
                desc: "DHCP Snooping",
                sub: {
                  vlan: { desc: "DHCP Snooping VLAN", sub: { "<vlan-list>": { desc: "VLAN ID (e.g. 10)", cr: true } } },
                  information: { desc: "DHCP Snooping information option", sub: { option: { desc: "Option 82 insertion", cr: true } } },
                },
                cr: true,
              },
            },
          },
          "domain-lookup": { desc: "Enable IP DNS hostname translation", cr: true },
          "domain-name": { desc: "Define the default domain name", sub: { "<domain>": { desc: "Domain name (e.g. corp.local)", cr: true } } },
          http: { desc: "HTTP server configuration", sub: { "secure-server": { desc: "Enable HTTP secure server (HTTPS/RESTCONF)", cr: true }, server: { desc: "Enable HTTP server", cr: true } } },
          nat: {
            desc: "NAT configuration commands",
            sub: {
              inside: {
                desc: "Inside address translation",
                sub: {
                  source: {
                    desc: "Source address translation",
                    sub: {
                      list: {
                        desc: "Specify access list describing local addresses",
                        sub: {
                          "<acl>": {
                            desc: "Access list number or name",
                            sub: {
                              interface: {
                                desc: "Specify interface for global address",
                                sub: {
                                  gigabitethernet: { desc: "GigabitEthernet interface", sub: { "<slot/port>": { desc: "Port number (e.g. 0/1)", sub: { overload: { desc: "Overload an address translation (PAT)", cr: true } }, cr: true } } },
                                  fastethernet: { desc: "FastEthernet interface", sub: { "<slot/port>": { desc: "Port number", sub: { overload: { desc: "Overload (PAT)", cr: true } }, cr: true } } },
                                },
                              },
                              pool: { desc: "Name pool of global addresses", sub: { "<pool-name>": { desc: "Pool name", sub: { overload: { desc: "Overload (PAT)", cr: true } }, cr: true } } },
                            },
                          },
                        },
                      },
                      static: { desc: "Specify static local->global mapping", sub: { "<local-ip>": { desc: "Inside local IP address", sub: { "<global-ip>": { desc: "Inside global IP address", cr: true } } } } },
                    },
                  },
                },
              },
            },
          },
          route: {
            desc: "Establish static routes",
            sub: {
              "<prefix>": {
                desc: "Destination prefix (e.g. 0.0.0.0 or 192.168.10.0)",
                sub: {
                  "<mask>": {
                    desc: "Destination subnet mask (e.g. 0.0.0.0 or 255.255.255.0)",
                    sub: {
                      "<next-hop>": { desc: "Forwarding router's IP address", sub: { "<1-255>": { desc: "Administrative Distance (e.g. 5 for floating static)", cr: true } }, cr: true },
                    },
                  },
                },
              },
            },
          },
          routing: { desc: "Enable IP routing (Layer 3 switch)", cr: true },
          ssh: { desc: "Configure SSH options", sub: { version: { desc: "Specify protocol version", sub: { "2": { desc: "SSH version 2", cr: true }, "1": { desc: "SSH version 1", cr: true } } } } },
        },
      },
      ipv6: {
        desc: "Global IPv6 configuration commands",
        sub: {
          "unicast-routing": { desc: "Enable unicast IPv6 routing", cr: true },
          route: { desc: "Configure static IPv6 route", sub: { "<prefix/len>": { desc: "IPv6 prefix (e.g. ::/0)", sub: { "<next-hop>": { desc: "Next-hop IPv6 address", sub: { "<1-255>": { desc: "Administrative Distance", cr: true } }, cr: true } } } } },
        },
      },
      line: {
        desc: "Configure a terminal line",
        sub: {
          vty: { desc: "Virtual terminal", sub: { "<first>": { desc: "First line number (e.g. 0)", sub: { "<last>": { desc: "Last line number (e.g. 15 or 4)", cr: true } }, cr: true } } },
          console: { desc: "Primary terminal line", sub: { "0": { desc: "Console line 0", cr: true } } },
        },
      },
      lldp: { desc: "Global LLDP configuration subcommands", sub: { run: { desc: "Enable LLDP globally", cr: true }, timer: { desc: "Specify LLDP transmit timer", sub: { "<5-65534>": { desc: "Seconds", cr: true } } }, holdtime: { desc: "Specify LLDP holdtime", sub: { "<0-65535>": { desc: "Seconds", cr: true } } } } },
      logging: { desc: "Modify message logging facilities", sub: { host: { desc: "Set syslog server IP address", sub: { "<ip>": { desc: "Syslog server IP", cr: true } } }, trap: { desc: "Set syslog server logging level", sub: { "<level>": { desc: "0-7 or keyword (warnings, informational, etc.)", cr: true } } }, buffered: { desc: "Set buffered logging", cr: true } } },
      "netconf-yang": { desc: "Enable NETCONF YANG server over SSH port 830", cr: true },
      no: {
        desc: "Negate a command or set its defaults",
        sub: {
          "access-list": { desc: "Remove an access list", sub: { "<1-199>": { desc: "ACL number", cr: true } } },
          cdp: { desc: "Disable CDP", sub: { run: { desc: "Disable CDP globally", cr: true } } },
          ip: {
            desc: "Negate global IP settings",
            sub: {
              "domain-lookup": { desc: "Disable DNS lookup on typos", cr: true },
              dhcp: { desc: "Negate DHCP", sub: { snooping: { desc: "Disable DHCP snooping", cr: true } } },
              arp: { desc: "Negate ARP inspection", sub: { inspection: { desc: "Disable DAI", sub: { vlan: { desc: "VLAN list", sub: { "<vlan>": { desc: "VLAN ID", cr: true } } } } } } },
              route: { desc: "Remove static route", sub: { "<prefix>": { desc: "Prefix", cr: true } } },
              nat: { desc: "Remove NAT rule", cr: true },
              routing: { desc: "Disable IP routing", cr: true },
            },
          },
          lldp: { desc: "Disable LLDP", sub: { run: { desc: "Disable LLDP globally", cr: true } } },
          ntp: { desc: "Negate NTP configuration", sub: { server: { desc: "Remove NTP server", sub: { "<ip>": { desc: "IP", cr: true } } }, authenticate: { desc: "Disable NTP auth", cr: true } } },
          router: { desc: "Remove routing process", sub: { ospf: { desc: "OSPF process", sub: { "<1-65535>": { desc: "Process ID", cr: true } } } } },
          "spanning-tree": { desc: "Negate spanning-tree setting", sub: { vlan: { desc: "VLAN ID", sub: { "<1-4094>": { desc: "VLAN", cr: true } } } } },
          vlan: { desc: "Delete a VLAN", sub: { "<1-4094>": { desc: "VLAN ID", cr: true } } },
        },
      },
      ntp: {
        desc: "Configure Network Time Protocol (NTP)",
        sub: {
          authenticate: { desc: "Authenticate time sources", cr: true },
          "authentication-key": { desc: "Authentication key for trusted time sources", sub: { "<1-65535>": { desc: "Key number", sub: { md5: { desc: "MD5 authentication", sub: { "<secret>": { desc: "Authentication key string", cr: true } } } } } } },
          master: { desc: "Act as NTP master clock", sub: { "<1-15>": { desc: "Stratum number (e.g. 2)", cr: true } }, cr: true },
          "trusted-key": { desc: "Key numbers for trusted time sources", sub: { "<1-65535>": { desc: "Key number", cr: true } } },
          server: { desc: "Configure NTP server", sub: { "<ip>": { desc: "NTP server IP address", sub: { key: { desc: "Configure peer authentication key", sub: { "<1-65535>": { desc: "Key number", cr: true } } } }, cr: true } } },
        },
      },
      restconf: { desc: "Enable RESTCONF HTTPS API server", cr: true },
      router: { desc: "Enable a routing process", sub: { ospf: { desc: "Open Shortest Path First (OSPF)", sub: { "<1-65535>": { desc: "Process ID (e.g. 1)", cr: true } } } } },
      service: { desc: "Modify use of network based services", sub: { "password-encryption": { desc: "Encrypt system passwords", cr: true }, timestamps: { desc: "Timestamp debug/log messages", sub: { log: { desc: "Timestamp log messages", sub: { datetime: { desc: "Timestamp with date and time", sub: { msec: { desc: "Include milliseconds", cr: true } }, cr: true } } } } } } },
      "spanning-tree": {
        desc: "Spanning Tree Subsystem",
        sub: {
          mode: { desc: "Spanning tree operating mode", sub: { "rapid-pvst": { desc: "Per-Vlan rapid spanning tree mode", cr: true }, pvst: { desc: "Per-Vlan spanning tree mode", cr: true } } },
          vlan: {
            desc: "VLAN Switch Spanning Tree",
            sub: {
              "<1-4094>": {
                desc: "VLAN ID (e.g. 10)",
                sub: {
                  root: { desc: "Configure switch as root", sub: { primary: { desc: "Configure this switch as primary root", cr: true }, secondary: { desc: "Configure switch as secondary root", cr: true } } },
                  priority: { desc: "Set the bridge priority", sub: { "<0-61440>": { desc: "Priority in increments of 4096", cr: true } } },
                },
              },
            },
          },
          portfast: { desc: "Spanning tree portfast options", sub: { default: { desc: "Enable portfast by default on all access ports", cr: true }, bpduguard: { desc: "BPDU guard", sub: { default: { desc: "Enable bpduguard by default on all portfast ports", cr: true } } } } },
        },
      },
      username: { desc: "Establish User Name Authentication", sub: { "<name>": { desc: "Username", sub: { secret: { desc: "Specify the secret password", sub: { "<password>": { desc: "Password", cr: true } } }, privilege: { desc: "Set user privilege level", sub: { "<0-15>": { desc: "Privilege level", cr: true } } } } } } },
      vlan: { desc: "Vlan commands", sub: { "<1-4094>": { desc: "ISL VLAN ID (e.g. 10)", cr: true }, dot1q: { desc: "dot1q parameters", sub: { tag: { desc: "Tag native VLAN", sub: { native: { desc: "Tag native VLAN frames", cr: true } } } } } } },
    },
    "config-if": {
      cdp: { desc: "CDP interface subcommands", sub: { enable: { desc: "Enable CDP on interface", cr: true } } },
      "channel-group": {
        desc: "EtherChannel/port bundling configuration",
        sub: {
          "<1-64>": {
            desc: "Channel group number",
            sub: {
              mode: {
                desc: "EtherChannel Mode of the interface",
                sub: {
                  active: { desc: "Enable LACP unconditionally", cr: true },
                  passive: { desc: "Enable LACP only if a LACP device is detected", cr: true },
                  desirable: { desc: "Enable PAgP unconditionally", cr: true },
                  auto: { desc: "Enable PAgP only if a PAgP device is detected", cr: true },
                  on: { desc: "Enable EtherChannel only (static)", cr: true },
                },
              },
            },
          },
        },
      },
      description: { desc: "Interface specific description", sub: { "<text>": { desc: "Description string", cr: true } } },
      do: { desc: "To run exec commands in config mode", sub: DO_SUB },
      duplex: { desc: "Configure duplex operation", sub: { auto: { desc: "Enable AUTO duplex", cr: true }, full: { desc: "Force full duplex", cr: true }, half: { desc: "Force half-duplex", cr: true } } },
      encapsulation: {
        desc: "Set encapsulation type for an interface",
        sub: {
          dot1q: { desc: "IEEE 802.1Q Virtual LAN", sub: { "<1-4094>": { desc: "IEEE 802.1Q VLAN ID", sub: { native: { desc: "Make this as native vlan", cr: true } }, cr: true } } },
        },
      },
      end: { desc: "Exit from configure mode to Privileged EXEC", cr: true },
      exit: { desc: "Exit from interface configuration mode", cr: true },
      interface: { desc: "Switch directly to another interface", sub: IFACE_TYPE_SUB },
      ip: {
        desc: "Interface Internet Protocol config commands",
        sub: {
          "access-group": { desc: "Specify access control for packets", sub: { "<acl>": { desc: "ACL number or name", sub: { in: { desc: "Inbound packets", cr: true }, out: { desc: "Outbound packets", cr: true } } } } },
          address: { desc: "Set the IP address of an interface", sub: { "<ip>": { desc: "IPv4 address", sub: { "<mask>": { desc: "IPv4 subnet mask", cr: true } } }, dhcp: { desc: "IP Address negotiated via DHCP", cr: true } } },
          arp: { desc: "Configure ARP features", sub: { inspection: { desc: "Arp Inspection configuration", sub: { trust: { desc: "Configure Trust state (DAI)", cr: true }, limit: { desc: "Configure Rate limit", sub: { rate: { desc: "Packets per second", sub: { "<pps>": { desc: "Rate limit pps", cr: true } } } } } } } } },
          dhcp: {
            desc: "Configure DHCP parameters for this interface",
            sub: {
              snooping: {
                desc: "DHCP Snooping",
                sub: {
                  trust: { desc: "DHCP Snooping trust config", cr: true },
                  limit: { desc: "DHCP Snooping limit", sub: { rate: { desc: "DHCP Snooping rate limit", sub: { "<1-2048>": { desc: "Packets per second (e.g. 15)", cr: true } } } } },
                },
              },
            },
          },
          "helper-address": { desc: "Specify a destination address for UDP broadcasts (DHCP relay)", sub: { "<ip>": { desc: "DHCP server IP address", cr: true } } },
          nat: { desc: "NAT interface commands", sub: { inside: { desc: "Inside interface for address translation", cr: true }, outside: { desc: "Outside interface for address translation", cr: true } } },
          ospf: {
            desc: "OSPF interface commands",
            sub: {
              priority: { desc: "Router priority for DR/BDR election", sub: { "<0-255>": { desc: "Priority (0=ineligible, 1-255)", cr: true } } },
              network: { desc: "Network type", sub: { "point-to-point": { desc: "Specify OSPF point-to-point network", cr: true }, broadcast: { desc: "Specify OSPF broadcast multi-access", cr: true } } },
              cost: { desc: "Interface cost", sub: { "<1-65535>": { desc: "Cost value", cr: true } } },
              "<1-65535>": { desc: "Process ID", sub: { area: { desc: "Set the OSPF area ID", sub: { "<area-id>": { desc: "Area ID (e.g. 0)", cr: true } } } } },
            },
          },
        },
      },
      ipv6: {
        desc: "IPv6 interface subcommands",
        sub: {
          address: { desc: "Configure IPv6 address on interface", sub: { "<prefix/len>": { desc: "IPv6 address/prefix (e.g. 2001:db8:12::1/64 or fe80::1)", sub: { "link-local": { desc: "Use link-local address", cr: true }, "eui-64": { desc: "Use EUI-64 interface ID", cr: true } }, cr: true } } },
          enable: { desc: "Enable IPv6 on interface", cr: true },
          ospf: { desc: "OSPFv3 interface commands", sub: { "<1-65535>": { desc: "Process ID", sub: { area: { desc: "Area ID", sub: { "<area>": { desc: "Area number", cr: true } } } } } } },
        },
      },
      lldp: { desc: "LLDP interface subcommands", sub: { transmit: { desc: "Enable LLDP transmission on interface", cr: true }, receive: { desc: "Enable LLDP reception on interface", cr: true } } },
      no: {
        desc: "Negate a command or set its defaults",
        sub: {
          cdp: { desc: "Disable CDP on interface", sub: { enable: { desc: "Disable CDP on this interface", cr: true } } },
          "channel-group": { desc: "Remove interface from EtherChannel", cr: true },
          description: { desc: "Remove interface description", cr: true },
          ip: { desc: "Negate interface IP setting", sub: { address: { desc: "Remove IP address", cr: true }, "access-group": { desc: "Remove ACL binding", cr: true }, nat: { desc: "Remove NAT role", cr: true }, dhcp: { desc: "Negate DHCP snooping on port", cr: true }, arp: { desc: "Negate DAI on port", cr: true } } },
          ipv6: { desc: "Negate IPv6 interface setting", sub: { address: { desc: "Remove IPv6 address", cr: true } } },
          lldp: { desc: "Disable LLDP on interface", sub: { transmit: { desc: "Disable LLDP transmit", cr: true }, receive: { desc: "Disable LLDP receive", cr: true } } },
          shutdown: { desc: "Restart / enable the selected interface", cr: true },
          "spanning-tree": { desc: "Negate STP port option", sub: { portfast: { desc: "Disable PortFast", cr: true }, bpduguard: { desc: "Disable BPDU Guard", cr: true } } },
          standby: { desc: "Remove HSRP setting", cr: true },
          switchport: { desc: "Put interface into Layer 3 routed mode", cr: true },
        },
      },
      shutdown: { desc: "Shutdown the selected interface", cr: true },
      "spanning-tree": {
        desc: "Spanning Tree Subsystem",
        sub: {
          portfast: { desc: "Allow a change from blocking to forwarding immediately", cr: true },
          bpduguard: { desc: "Don't accept BPDUs on this interface", sub: { enable: { desc: "Enable BPDU guard", cr: true }, disable: { desc: "Disable BPDU guard", cr: true } } },
          guard: { desc: "Change an interface's spanning tree guard mode", sub: { root: { desc: "Enable Root Guard", cr: true }, loop: { desc: "Enable Loop Guard", cr: true } } },
        },
      },
      speed: { desc: "Configure speed operation", sub: { auto: { desc: "Enable AUTO speed", cr: true }, "100": { desc: "Force 100 Mbps", cr: true }, "1000": { desc: "Force 1000 Mbps", cr: true } } },
      standby: {
        desc: "HSRP interface configuration commands",
        sub: {
          version: { desc: "HSRP version", sub: { "2": { desc: "HSRP version 2", cr: true }, "1": { desc: "HSRP version 1", cr: true } } },
          "<0-4095>": {
            desc: "Group number (e.g. 10)",
            sub: {
              ip: { desc: "Enable HSRP and set the virtual IP address", sub: { "<vip>": { desc: "Virtual IP address", cr: true } } },
              priority: { desc: "Priority level", sub: { "<0-255>": { desc: "Priority value (default 100)", cr: true } } },
              preempt: { desc: "Overthrow lower priority Active routers", cr: true },
            },
          },
        },
      },
      switchport: {
        desc: "Set switching mode characteristics",
        sub: {
          mode: {
            desc: "Set trunking mode of the interface",
            sub: {
              access: { desc: "Set trunking mode to ACCESS unconditionally", cr: true },
              trunk: { desc: "Set trunking mode to TRUNK unconditionally", cr: true },
              dynamic: { desc: "Set trunking mode to dynamically negotiate", sub: { auto: { desc: "Dynamic auto", cr: true }, desirable: { desc: "Dynamic desirable", cr: true } } },
            },
          },
          access: { desc: "Set access mode characteristics of the interface", sub: { vlan: { desc: "Set VLAN when interface is in access mode", sub: { "<1-4094>": { desc: "VLAN ID (e.g. 10)", cr: true } } } } },
          voice: { desc: "Voice appliance attributes", sub: { vlan: { desc: "Vlan for voice traffic", sub: { "<1-4094>": { desc: "Voice VLAN ID (e.g. 20)", cr: true } } } } },
          trunk: {
            desc: "Set trunking characteristics of the interface",
            sub: {
              native: { desc: "Set trunking native characteristics", sub: { vlan: { desc: "Set native VLAN", sub: { "<1-4094>": { desc: "Native VLAN ID (e.g. 99)", cr: true } } } } },
              allowed: {
                desc: "Set allowed VLAN characteristics",
                sub: {
                  vlan: {
                    desc: "Set allowed VLANs when interface is in trunking mode",
                    sub: {
                      add: { desc: "VLANs to add to the current list", sub: { "<vlan-list>": { desc: "VLAN list", cr: true } } },
                      remove: { desc: "VLANs to remove from the current list", sub: { "<vlan-list>": { desc: "VLAN list", cr: true } } },
                      "<vlan-list>": { desc: "Allowed VLANs (e.g. 10,20)", cr: true },
                    },
                  },
                },
              },
              encapsulation: { desc: "Set trunking encapsulation", sub: { dot1q: { desc: "IEEE 802.1Q encapsulation", cr: true } } },
            },
          },
          "port-security": {
            desc: "Security related command",
            sub: {
              maximum: { desc: "Max secure addresses", sub: { "<1-132>": { desc: "Maximum number of MAC addresses", cr: true } } },
              "mac-address": { desc: "Secure mac address", sub: { sticky: { desc: "Configure dynamic secure addresses as sticky", cr: true }, "<H.H.H>": { desc: "48-bit MAC address", cr: true } } },
              violation: { desc: "Security violation mode", sub: { protect: { desc: "Drop silently", cr: true }, restrict: { desc: "Drop and send Syslog/SNMP alert", cr: true }, shutdown: { desc: "Put interface into err-disabled state", cr: true } } },
            },
            cr: true,
          },
          nonegotiate: { desc: "Device will not engage in negotiation protocol (DTP)", cr: true },
        },
      },
    },
    "config-vlan": {
      name: { desc: "Ascii name of the VLAN", sub: { "<name>": { desc: "VLAN name (e.g. SALES)", cr: true } } },
      do: { desc: "To run exec commands in config mode", sub: DO_SUB },
      exit: { desc: "Apply changes and exit from VLAN configuration mode", cr: true },
      end: { desc: "Exit from configure mode", cr: true },
    },
    "config-router": {
      "router-id": { desc: "router-id for this OSPF process", sub: { "<A.B.C.D>": { desc: "OSPF router-id in IP address format (e.g. 1.1.1.1)", cr: true } } },
      network: {
        desc: "Enable routing on an IP network",
        sub: {
          "<network>": {
            desc: "Network number (e.g. 10.0.0.0)",
            sub: {
              "<wildcard>": { desc: "OSPF wild card bits (e.g. 0.0.255.255)", sub: { area: { desc: "Set the OSPF area ID", sub: { "<area-id>": { desc: "Area ID (e.g. 0)", cr: true } } } } },
            },
          },
        },
      },
      "passive-interface": {
        desc: "Suppress routing updates on an interface",
        sub: {
          default: { desc: "Suppress routing updates on all interfaces", cr: true },
          ...IFACE_TYPE_SUB,
        },
      },
      "default-information": { desc: "Control distribution of default information", sub: { originate: { desc: "Distribute a default route", sub: { always: { desc: "Always advertise default route", cr: true } }, cr: true } } },
      "auto-cost": { desc: "Calculate OSPF interface cost according to bandwidth", sub: { "reference-bandwidth": { desc: "Use reference bandwidth method", sub: { "<1-4294967>": { desc: "Reference bandwidth in Mbps", cr: true } } } } },
      do: { desc: "To run exec commands in config mode", sub: DO_SUB },
      exit: { desc: "Exit from routing protocol configuration mode", cr: true },
      end: { desc: "Exit from configure mode", cr: true },
    },
    "config-acl": {
      permit: { desc: "Specify packets to forward", sub: ACL_COMBINED_SUB },
      deny: { desc: "Specify packets to reject", sub: ACL_COMBINED_SUB },
      remark: { desc: "Access list entry comment", sub: { "<text>": { desc: "Comment text", cr: true } } },
      do: { desc: "To run exec commands in config mode", sub: DO_SUB },
      exit: { desc: "Exit from access-list configuration mode", cr: true },
      end: { desc: "Exit from configure mode", cr: true },
    },
    "config-line": {
      "access-class": { desc: "Filter connections based on an IP access list", sub: { "<acl>": { desc: "ACL name or number", sub: { in: { desc: "Filter incoming connections", cr: true }, out: { desc: "Filter outgoing connections", cr: true } } } } },
      transport: { desc: "Define transport protocols for line", sub: { input: { desc: "Define which protocols to use when connecting", sub: { ssh: { desc: "TCP/IP SSH protocol", cr: true }, telnet: { desc: "TCP/IP Telnet protocol", cr: true }, all: { desc: "All protocols", cr: true }, none: { desc: "No protocols", cr: true } } } } },
      login: { desc: "Enable password checking", sub: { local: { desc: "Local password checking", cr: true } }, cr: true },
      "exec-timeout": { desc: "Set the EXEC timeout", sub: { "<min>": { desc: "Timeout in minutes", sub: { "<sec>": { desc: "Timeout in seconds", cr: true } }, cr: true } } },
      do: { desc: "To run exec commands in config mode", sub: DO_SUB },
      exit: { desc: "Exit from line configuration mode", cr: true },
      end: { desc: "Exit from configure mode", cr: true },
    },
    "config-dhcp": {
      network: { desc: "Network number and mask", sub: { "<net>": { desc: "Network IP", sub: { "<mask>": { desc: "Subnet mask", cr: true } } } } },
      "default-router": { desc: "Default routers", sub: { "<ip>": { desc: "Gateway IP address", cr: true } } },
      "dns-server": { desc: "DNS servers", sub: { "<ip>": { desc: "DNS server IP address", cr: true } } },
      "domain-name": { desc: "Domain name", sub: { "<domain>": { desc: "Domain name", cr: true } } },
      do: { desc: "To run exec commands in config mode", sub: DO_SUB },
      exit: { desc: "Exit from DHCP pool configuration mode", cr: true },
      end: { desc: "Exit from configure mode", cr: true },
    },
  };

  // Pre-split attached Cisco interface shorthand like "g0/0" -> ["g", "0/0"], "fa0/1" -> ["fa", "0/1"], "po1" -> ["po", "1"]
  function tokenizeIos(raw) {
    const rough = raw.trim().split(/\s+/).filter(Boolean);
    const out = [];
    for (const tok of rough) {
      const m = tok.match(/^(gigabitethernet|fastethernet|port-channel|loopback|gig|gi|g|fa|f|po|lo|vl|vlan)(\d[\d/.-]*)$/i);
      if (m) {
        out.push(m[1], m[2]);
      } else {
        out.push(tok);
      }
    }
    return out;
  }

  function matchKeyInNode(node, token) {
    const low = token.toLowerCase();
    const keys = Object.keys(node);
    const literalKeys = keys.filter((k) => !k.startsWith("<"));

    // 1. Exact literal match
    const exact = literalKeys.find((k) => k.toLowerCase() === low);
    if (exact) return { kind: "literal", key: exact, entry: node[exact] };

    // 2. Unambiguous prefix match (supports ex -> exit, sw -> switchport, tr -> trunk, vl -> vlan, en -> enable, etc.)
    const pref = literalKeys.filter((k) => k.toLowerCase().startsWith(low));
    if (pref.length === 1) return { kind: "literal", key: pref[0], entry: node[pref[0]] };
    if (pref.length > 1) return { kind: "ambiguous", matches: pref };

    // 3. Placeholder match (<ip>, <1-99>, <100-199>, <name>, etc.)
    const placeholders = keys.filter((k) => k.startsWith("<"));
    if (placeholders.length > 0) {
      // If numeric, prefer matching numeric range placeholder if multiple exist (<1-99> vs <100-199>)
      if (/^\d+$/.test(low)) {
        const num = Number(low);
        const rangeMatch = placeholders.find((p) => {
          const rm = p.match(/^<(\d+)-(\d+)>$/);
          return rm && num >= Number(rm[1]) && num <= Number(rm[2]);
        });
        if (rangeMatch) return { kind: "placeholder", key: rangeMatch, entry: node[rangeMatch] };
      }
      return { kind: "placeholder", key: placeholders[0], entry: node[placeholders[0]] };
    }
    return { kind: "none" };
  }

  // Context-sensitive '?' resolver (works at EVERY depth in EVERY mode!)
  function resolveContext(mode, rawInput) {
    const root = IOS_TREES[mode] || IOS_TREES.config;
    const hasTrailingSpace = /\s$/.test(rawInput);
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return { entries: Object.entries(root), cr: false, completedTokens: [] };
    }
    const tokens = tokenizeIos(trimmed);
    const walkTokens = hasTrailingSpace ? tokens : tokens.slice(0, -1);
    const partial = hasTrailingSpace ? "" : tokens[tokens.length - 1].toLowerCase();

    let node = root;
    let currentCr = false;
    const completedTokens = [];

    for (const tok of walkTokens) {
      const m = matchKeyInNode(node, tok);
      if (m.kind === "none" || m.kind === "ambiguous") {
        return { entries: [], cr: false, ambiguous: m.kind === "ambiguous" ? m.matches : null, completedTokens };
      }
      completedTokens.push(m.kind === "literal" ? m.key : tok);
      currentCr = Boolean(m.entry.cr);
      if (!m.entry.sub) {
        return { entries: [], cr: currentCr, leafDesc: m.entry.desc, completedTokens };
      }
      node = m.entry.sub;
    }

    const entries = Object.entries(node).filter(([k]) => {
      if (!partial) return true;
      return !k.startsWith("<") && k.toLowerCase().startsWith(partial);
    });
    return { entries, cr: hasTrailingSpace && currentCr, completedTokens };
  }

  const SUBMODE_JUMP_KEYS = new Set(["interface", "line", "router", "vlan"]);

  // Expand shortened Cisco IOS command (e.g., "sw tr na vl 99" -> "switchport trunk native vlan 99", "ex" -> "exit")
  function expandCommand(mode, rawInput) {
    const trimmed = rawInput.trim();
    if (!trimmed) return { ok: true, expanded: "", tokens: [], rootMatched: true };

    // Universal Cisco shortcuts requested by candidates
    if (/^ex(i(t)?)?$/i.test(trimmed)) {
      return { ok: true, expanded: "exit", tokens: ["exit"], rootMatched: true };
    }
    if (/^wr(\s+mem(ory)?)?$/i.test(trimmed)) {
      if (mode === "user") {
        return { ok: false, error: "% Invalid input detected at '^' marker. (Enter 'enable' first)" };
      }
      return { ok: true, expanded: "write memory", tokens: ["write", "memory"], rootMatched: true };
    }
    if (/^do\s+wr(\s+mem(ory)?)?$/i.test(trimmed) && mode.startsWith("config")) {
      return { ok: true, expanded: "do write memory", tokens: ["do", "write", "memory"], rootMatched: true };
    }

    let root = IOS_TREES[mode] || IOS_TREES.config;
    const tokens = tokenizeIos(trimmed);

    // Authentic IOS submode-jump: e.g., typing "int g0/0" or "line vty 0 15" from config-router / config-vlan / config-acl
    const firstTest = matchKeyInNode(root, tokens[0]);
    if (firstTest.kind === "none" && mode.startsWith("config-")) {
      const globalTest = matchKeyInNode(IOS_TREES.config, tokens[0]);
      if (globalTest.kind === "literal" && SUBMODE_JUMP_KEYS.has(globalTest.key)) {
        root = IOS_TREES.config;
      }
    }

    let node = root;
    let rootMatched = false;
    const expanded = [];

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (!node) {
        expanded.push(tok);
        continue;
      }
      let m = matchKeyInNode(node, tok);
      if (m.kind === "ambiguous" && i + 1 < tokens.length) {
        const nextTok = tokens[i + 1];
        const viable = m.matches.filter((cand) => {
          const sub = node[cand] && node[cand].sub;
          if (!sub) return false;
          const nm = matchKeyInNode(sub, nextTok);
          return nm.kind !== "none";
        });
        if (viable.length === 1) {
          m = { kind: "literal", key: viable[0], entry: node[viable[0]] };
        }
      }
      if (m.kind === "ambiguous") {
        return { ok: false, error: `% Ambiguous command: "${trimmed}" (matches: ${m.matches.join(", ")})` };
      }
      if (m.kind === "literal") {
        if (i === 0) rootMatched = true;
        expanded.push(m.key);
        node = m.entry.sub || null;
      } else if (m.kind === "placeholder") {
        if (i === 0) rootMatched = true;
        expanded.push(tok);
        node = m.entry.sub || null;
      } else {
        if (i === 0) {
          return { ok: false, rootMatched: false, error: `% Invalid input detected at '^' marker.` };
        }
        expanded.push(tok);
      }
    }

    return { ok: true, expanded: expanded.join(" "), tokens: expanded, rootMatched };
  }

  window.CISCO_IOS_CLI = {
    trees: IOS_TREES,
    resolveContext,
    expandCommand,
    tokenizeIos,
  };
})();
