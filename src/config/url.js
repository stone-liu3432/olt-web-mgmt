var change_url = {
    testUrl: {
        menu: "./simulation_data/menu.json",
        system: "./simulation_data/systemInfo.json",
        cpu: "./simulation_data/cpuInfo.json",
        pon: "./simulation_data/ponInfo.json",
        port: "./simulation_data/portInfo.json",
        outbound: "./simulation_data/outbound.json",
        inbound: "./simulation_data/inbound.json",
        time: "./simulation_data/time.json",
        onu_allow: "./simulation_data/onuallow.json",
        onu_list: './simulation_data/onu_resource.json',
        onu_deny: "./simulation_data/onu_deny_list.json",
        bandwidth: "./simulation_data/onuBandwidth.json",
        onumgmt: "./simulation_data/onu_basic_info.json",
        swich_port: "./simulation_data/geInfo.json",
        perf: "./simulation_data/perfInfo.json",
        vlan: "./simulation_data/VLANInfo.json",
        vlancfg: "./simulation_data/vlan_list.json",
        macage: "./simulation_data/mac_age.json",
        mactab: "./simulation_data/mac_table.json",
        swich_port_info: './simulation_data/swich_port_info.json',
        beta: 'test',
        rstp: './simulation_data/rstp.json',
        rstp_port: './simulation_data/rstp_port.json',
        get_lang: '/simulation_data/get_lang.json',
        get_onu_baseinfo:"./simulation_data/onu_base_info.json",
        get_user_info:"./simulation_data/user-info.json",
        get_igmp: "./simulation_data/igmp_info.json",
        get_multicast: './simulation_data/multicast_info.json',
        get_multi_vlan: './simulation_data/multicast_vlan.json',
        get_mc_unknow: './simulation_data/mc_unknow.json',
        get_program: './simulation_data/program.json',
        get_mc_eth_config: "./simulation_data/mc_eth_config.json",
        get_acl: './simulation_data/acl.json',
        get_timerange: './simulation_data/timerange.json',
        get_packetfilter: './simulation_data/packfilter.json',
        get_qos: './simulation_data/qos.json',
        get_static_router: './simulation_data/staticRouter.json',
        get_arp: './simulation_data/arp.json'
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
let protocol = location.protocol.indexOf('https') > -1 ? 'wss:' : 'ws:';
if(process.env.NODE_ENV == 'development'){
    wsUrl = `${protocol}//${window.location.hostname}:8201/ws`;
}else if(process.env.NODE_ENV == 'production'){
    wsUrl = `${protocol}//${window.location.host}/ws`;
}

export { wsUrl }