//  文件切割 
//  system page
const runStatus = () => import(/* webpackChunkName: "system-page" */  '@/components/common/system/runStatus')
const devMgmt = () => import(/* webpackChunkName: "system-page" */  '@/components/common/system/devMgmt')
const diagonose = () => import(/* webpackChunkName: "system-page" */  '@/components/common/system/diagonose')
const remoteMgmt = () => import(/* webpackChunkName: "system-page" */  '@/components/common/system/remoteMgmt')
const upgrade = () => import(/* webpackChunkName: "system-page" */  '@/components/common/system/upgrade')
const timeMgmt = () => import(/* webpackChunkName: "system-page" */  '@/components/common/system/timeMgmt')
const service = () => import(/* webpackChunkName: "system-page" */  '@/components/common/system/service')
const alarm = () => import(/* webpackChunkName: "system-page" */  '@/components/common/system/alarm')
const userMgmt = () => import(/* webpackChunkName: "system-page" */  '@/components/common/system/userMgmt')
// pon
//const onuAllow = () => import(/* webpackChunkName: "ponmgmt-page" */  '@/components/common/pon/onuAllow')
const onuDeny = () => import(/* webpackChunkName: "ponmgmt-page" */  '@/components/common/pon/onuDeny')
const slaCfg = () => import(/* webpackChunkName: "ponmgmt-page" */  '@/components/common/pon/slaCfg')
const ponSetting = () => import(/* webpackChunkName: "ponmgmt-page" */  '@/components/common/pon/ponSetting')
const onuBasicInfo = () => import(/* webpackChunkName: "ponmgmt-page" */  '@/components/common/pon/onuBasicInfo')
const onuPortCfg = () => import(/* webpackChunkName: "ponmgmt-page" */  '@/components/common/pon/onuPortCfg')
const onuBatchUpgrade = () => import(/* webpackChunkName: "ponmgmt-page" */  '@/components/common/pon/onuBatchUpgrade')
const onuMulticast = () => import(/* webpackChunkName: "ponmgmt-page" */  '@/components/common/pon/onuMulticast')
const ponOptical = () => import(/* webpackChunkName: "ponmgmt-page" */  '@/components/common/pon/ponOptical')
// switch
const portInfo = () => import(/* webpackChunkName: "switch-page" */  '@/components/common/switch/portInfo')
const perfInfo = () => import(/* webpackChunkName: "switch-page" */  '@/components/common/switch/perfInfo')
const portCfg = () => import(/* webpackChunkName: "switch-page" */  '@/components/common/switch/portCfg')
const portVlan = () => import(/* webpackChunkName: "switch-page" */  '@/components/common/switch/portVlan')
//const vlanMgmt = () => import(/* webpackChunkName: "switch-page" */  '@/components/common/switch/vlanMgmt')
const macMgmt = () => import(/* webpackChunkName: "switch-page" */  '@/components/common/switch/macMgmt')
// protocol
const rstp = () => import(/* webpackChunkName: "protocol-page" */  '@/components/common/protocol/rstp')
const igmp = () => import(/* webpackChunkName: "protocol-page" */  '@/components/common/protocol/igmp')

// acl/qos
const aclMgmt = () => import(/* webpackChunkName: "acl-qos-page" */  '@/components/common/acl-QoS/aclMgmt')
const timeRange = () => import(/* webpackChunkName: "acl-qos-page" */  '@/components/common/acl-QoS/timeRange')
const qos = () => import(/* webpackChunkName: "acl-qos-page" */  '@/components/common/acl-QoS/qos')
const packetFilter = () => import(/* webpackChunkName: "acl-qos-page" */  '@/components/common/acl-QoS/packetFilter')

// router
const staticRouter = () => import(/* webpackChunkName: "acl-qos-page" */  '@/components/common/router/staticRouter')
const arp = () => import(/* webpackChunkName: "acl-qos-page" */  '@/components/common/router/arp')

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
        path: "/onu_multicast",
        component: onuMulticast,
        meta: {
            requireAuth: true,
            keepAlive: true
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
        path: "/port_cfg",
        component: portCfg,
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
        path: "/mac_mgmt",
        component: macMgmt,
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
        path: "/port_vlan",
        component: portVlan,
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
        path: "/static_route",
        component: staticRouter,
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
    }
]