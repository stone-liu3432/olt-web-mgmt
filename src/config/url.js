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
        get_user_info:"./user-info.json",
        get_igmp: "./igmp_info.json",
        get_multicast: './multicast_info.json',
        get_multi_vlan: './multicast_vlan.json',
        get_mc_unknow: './mc_unknow.json',
        get_program: './program.json',
        get_mc_eth_config: "./mc_eth_config.json",
        get_acl: './acl.json',
        get_timerange: './timerange.json',
        get_packetfilter: './packfilter.json',
        get_qos: './qos.json',
        get_static_router: './staticRouter.json',
        get_arp: './arp.json'
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
        vlancfg: "/switch_vlan",
        macage: "/switch_mac?form=age",
        mactab: "/switch_mac?form=table",
        swich_port_info: '/switch_port?form=port_info&port_id=',
        beta: 'beta',
        rstp: '/switch_rstp?form=bridge',
        rstp_port: '/switch_rstp?form=port',
        get_lang: '/system_lang',
        get_onu_baseinfo:"/onumgmt?form=base-info",
        get_user_info:"/usermgmt?form=userlist",
        get_igmp: "/switch_igmp?form=config",
        get_multicast: '/switch_igmp?form=entry',
        get_multi_vlan: '/switch_igmp?form=multicast_vlan',
        get_mc_unknow: '/switch_igmp?form=mc_unknown&mvlan=',
        get_program: '/switch_igmp?form=program&mvlan=',
        get_mc_eth_config: "/onumgmt?form=mc_eth_config",
        get_acl: '/switch_acl?form=acl',
        get_timerange: '/switch_acl?form=time_range&name=all',
        get_packetfilter: '/switch_pkfilter',
        get_qos: '/switch_qos?form=qos',
        get_static_router: '/switch_route?form=route_table',
        get_arp: '/switch_route?form=arp_table'
    }
}

export default change_url

let wsUrl;
if(process.env.NODE_ENV == 'development'){
    wsUrl = `ws://${window.location.hostname}:8201/ws`;
}else if(process.env.NODE_ENV == 'production'){
    wsUrl = `ws://${window.location.hostname}:8080/ws`;
}

export { wsUrl }