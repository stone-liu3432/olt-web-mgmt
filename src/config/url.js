var change_url = {
    testUrl: {
        menu: "./menu.json",
        system: "./systemInfo.json",
        cpu: "./cpuInfo.json",
        pon: "./ponInfo.json",
        port: "./portInfo.json",
        outbound: "./outbound.json",
        inbound: "./inbound.json",
        time: "./time.json",
        onu_allow: "./onuallow.json",
        onu_list: './onu_resource.json',
        onu_deny: "./onu_deny_list.json",
        bandwidth: "./onuBandwidth.json",
        onumgmt: "./onu_basic_info.json",
        swich_port: "./geInfo.json",
        perf: "./perfInfo.json",
        vlan: "./VLANInfo.json",
        vlancfg: "./vlan_list.json",
        macage: "./mac_age.json",
        mactab: "./mac_table.json"
    },
    betaUrl: {
        menu: "/board?info=menu",
        system: "/board?info=system",
        cpu: "/board?info=cpu",
        pon: "/board?info=pon",
        port: "/switch_port?form=portlist_info",
        outbound: "/system?form=outbound",
        inbound: "/system?form=inbound",
        time: "/time?form=info",
        onu_allow: "/onu_allow_list?port_id=",
        onu_list: '/onu_allow_list?form=resource&port_id=',
        onu_deny: "/onu_deny_list?port_id=",
        bandwidth: "/onu_bandwidth?port_id=",
        onumgmt: "/onumgmt?form=base-info&port_id="+this.portid+"onu_id="+this.onuid,
        swich_port: "/switch_port?form=info",
        perf: "/switch_port?form=statistic&port_id=",
        vlan: "/switch_port?form=vlan",
        vlancfg: "/switch_vlan?count=",
        macage: "/switch_mac?form=age",
        mactab: "/switch_mac?form=table"
    }
}

export default change_url