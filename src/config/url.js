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
        mactab: "./mac_table.json",
        swich_port_info: './swich_port_info.json',
        beta: 'test',
        rstp: './rstp.json',
        rstp_port: './rstp_port.json',
        get_lang: 'get_lang.json',
        get_onu_baseinfo:"./onu_base_info.json",
        get_igmp: "./igmp_info.json",
        get_multicast: './multicast_info.json'
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
        onumgmt: "/onumgmt?form=base-info&port_id=",
        swich_port: "/switch_port?form=info",
        perf: "/switch_port?form=statistic&port_id=",
        vlan: "/switch_port?form=vlan",
        vlancfg: "/switch_vlan?count=",
        macage: "/switch_mac?form=age",
        mactab: "/switch_mac?form=table",
        swich_port_info: '/switch_port?form=port_info&port_id=',
        beta: 'beta',
        rstp: '/switch_rstp?form=bridge',
        rstp_port: '/switch_rstp?form=port',
        get_lang: '/system_lang',
        get_onu_baseinfo:"/onumgmt?form=base-info",
        get_igmp: "/switch_igmp?form=config",
        get_multicast: '/switch_igmp?form=entry'
    }
}

export default change_url