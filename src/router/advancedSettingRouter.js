//  文件切割
//  system page
const runStatus = () =>
    import(
        /* webpackChunkName: "system-page" */ "@/components/common/system/runStatus"
    );
const devMgmt = () =>
    import(
        /* webpackChunkName: "system-page" */ "@/components/common/system/devMgmt"
    );
const diagonose = () =>
    import(
        /* webpackChunkName: "system-page" */ "@/components/common/system/diagonose"
    );
const remoteMgmt = () =>
    import(
        /* webpackChunkName: "system-page" */ "@/components/common/system/remoteMgmt"
    );
const cliAcl = () =>
    import(
        /* webpackChunkName: "system-page" */ "@/components/common/system/cliAcl"
    );
const upgrade = () =>
    import(
        /* webpackChunkName: "system-page" */ "@/components/common/system/upgrade"
    );
const timeMgmt = () =>
    import(
        /* webpackChunkName: "system-page" */ "@/components/common/system/timeMgmt"
    );
const service = () =>
    import(
        /* webpackChunkName: "system-page" */ "@/components/common/system/service"
    );
const alarm = () =>
    import(
        /* webpackChunkName: "system-page" */ "@/components/common/system/alarm"
    );
const userMgmt = () =>
    import(
        /* webpackChunkName: "system-page" */ "@/components/common/system/userMgmt"
    );

// pon
const onuDeny = () =>
    import(
        /* webpackChunkName: "ponmgmt-page" */ "@/components/common/pon/onuDeny"
    );
const slaCfg = () =>
    import(
        /* webpackChunkName: "ponmgmt-page" */ "@/components/common/pon/slaCfg"
    );
const ponSetting = () =>
    import(
        /* webpackChunkName: "ponmgmt-page" */ "@/components/common/pon/ponSetting"
    );
const onuBasicInfo = () =>
    import(
        /* webpackChunkName: "ponmgmt-page" */ "@/components/common/pon/onuBasicInfo"
    );
const onuPortCfg = () =>
    import(
        /* webpackChunkName: "ponmgmt-page" */ "@/components/common/pon/onuPortCfg"
    );
const onuBatchUpgrade = () =>
    import(
        /* webpackChunkName: "ponmgmt-page" */ "@/components/common/pon/onuBatchUpgrade"
    );
const onuMulticast = () =>
    import(
        /* webpackChunkName: "ponmgmt-page" */ "@/components/common/pon/onuMulticast"
    );
const ponOptical = () =>
    import(
        /* webpackChunkName: "ponmgmt-page" */ "@/components/common/pon/ponOptical"
    );
const loid = () =>
    import(
        /* webpackChunkName: "ponmgmt-page" */ "@/components/common/pon/loid"
    );
const onuPerf = () =>
    import(
        /* webpackChunkName: "ponmgmt-page" */ "@/components/common/pon/onuPerf"
    );
const batchConfig = () =>
    import(
        /* webpackChunkName: "ponmgmt-page" */ "@/components/common/pon/batchConfig"
    );

// switch
const portInfo = () =>
    import(
        /* webpackChunkName: "switch-page" */ "@/components/common/switch/portInfo"
    );
const perfInfo = () =>
    import(
        /* webpackChunkName: "switch-page" */ "@/components/common/switch/perfInfo"
    );
const stormctrl = () =>
    import(
        /* webpackChunkName: "switch-page" */ "@/components/common/switch/stormctrl"
    );
const mirror = () =>
    import(
        /* webpackChunkName: "switch-page" */ "@/components/common/switch/mirror"
    );
const loopDetect = () =>
    import(
        /* webpackChunkName: "switch-page" */ "@/components/common/switch/loopDetect"
    );
const macMgmt = () =>
    import(
        /* webpackChunkName: "switch-page" */ "@/components/common/switch/macMgmt"
    );
const ponMac = () =>
    import(
        /* webpackChunkName: "switch-page" */ "@/components/common/switch/ponMac"
    );
const portIsolation = () =>
    import(
        /* webpackChunkName: "switch-page" */ "@/components/common/switch/portIsolation"
    );
// protocol
const rstp = () =>
    import(
        /* webpackChunkName: "protocol-page" */ "@/components/common/protocol/rstp"
    );
const igmp = () =>
    import(
        /* webpackChunkName: "protocol-page" */ "@/components/common/protocol/igmp"
    );
const dhcp = () =>
    import(
        /* webpackChunkName: "protocol-page" */ "@/components/common/protocol/dhcp"
    );

// acl/qos
const aclMgmt = () =>
    import(
        /* webpackChunkName: "acl-qos-page" */ "@/components/common/acl-QoS/aclMgmt"
    );
const timeRange = () =>
    import(
        /* webpackChunkName: "acl-qos-page" */ "@/components/common/acl-QoS/timeRange"
    );
const qos = () =>
    import(
        /* webpackChunkName: "acl-qos-page" */ "@/components/common/acl-QoS/qos"
    );
const packetFilter = () =>
    import(
        /* webpackChunkName: "acl-qos-page" */ "@/components/common/acl-QoS/packetFilter"
    );

// router
const staticRoute = () =>
    import(
        /* webpackChunkName: "acl-qos-page" */ "@/components/common/route/staticRoute"
    );
const arp = () =>
    import(
        /* webpackChunkName: "acl-qos-page" */ "@/components/common/route/arp"
    );
const linkAggregation = () =>
    import(
        /* webpackChunkName: "switch-page" */ "@/components/common/switch/linkAggregation"
    );
const mstp = () =>
    import(
        /* webpackChunkName: "protocol-page" */ "@/components/common/protocol/mstp"
    );
const dhcpV6 = () =>
    import(
        /* webpackChunkName: "protocol-page" */ "@/components/common/protocol/dhcpv6"
    );
export default [
    {
        path: "/advanced_setting",
        component: runStatus,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/running_status",
        component: runStatus,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/dev_mgmt",
        component: devMgmt,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/diagonose",
        component: diagonose,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/remote_mgmt",
        component: remoteMgmt,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/cli_acl",
        component: cliAcl,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/upgrade",
        component: upgrade,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/user_mgmt",
        component: userMgmt,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/pon_setting",
        component: ponSetting,
        meta: {
            requireAuth: true,
            keepAlive: true
        }
    },
    {
        path: "/onu_deny",
        component: onuDeny,
        meta: {
            requireAuth: true,
            keepAlive: true
        }
    },
    {
        path: "/sla_cfg",
        component: slaCfg,
        meta: {
            requireAuth: true,
            keepAlive: true
        }
    },
    {
        path: "/loid_mgmt",
        component: loid,
        meta: {
            requireAuth: true,
            keepAlive: true
        }
    },
    {
        path: "/onu_batch_upgrade",
        component: onuBatchUpgrade,
        meta: {
            requireAuth: true,
            keepAlive: true
        }
    },
    {
        path: "/onu_basic_info",
        component: onuBasicInfo,
        meta: {
            requireAuth: true,
            keepAlive: true
        }
    },
    {
        path: "/onu_port_cfg",
        component: onuPortCfg,
        meta: {
            requireAuth: true,
            keepAlive: true
        }
    },
    {
        path: "/onu_perf_info",
        component: onuPerf,
        meta: {
            requireAuth: true,
            keepAlive: true
        }
    },
    {
        path: "/onu_multicast",
        component: onuMulticast,
        meta: {
            requireAuth: true,
            keepAlive: true
        }
    },
    {
        path: "/batch_config",
        component: batchConfig,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/perf_info",
        component: perfInfo,
        meta: {
            requireAuth: true,
            keepAlive: true
        }
    },
    {
        path: "/port_info",
        component: portInfo,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/stormctrl",
        component: stormctrl,
        meta: {
            requireAuth: true,
            keepAlive: true
        }
    },
    {
        path: "/pon_optical",
        component: ponOptical,
        meta: {
            requireAuth: true,
            keepAlive: true
        }
    },
    {
        path: "/mac_table",
        component: macMgmt,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/pon_mac",
        component: ponMac,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/rstp",
        component: rstp,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/dhcp",
        component: dhcp,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/time",
        component: timeMgmt,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/service",
        component: service,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/alarm",
        component: alarm,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/mirror",
        component: mirror,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/igmp",
        component: igmp,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/acl_mgmt",
        component: aclMgmt,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/time_range",
        component: timeRange,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/packet_filter",
        component: packetFilter,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/qos",
        component: qos,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/route_mgmt",
        component: staticRoute,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/arp",
        component: arp,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/loop_detect",
        component: loopDetect,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/link_aggregation",
        component: linkAggregation,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/port_group",
        component: portIsolation,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/mstp",
        component: mstp,
        meta: {
            requireAuth: true
        }
    },
    {
        path: "/dhcp_v6",
        component: dhcpV6,
        meta: {
            requireAuth: true
        }
    }
];
