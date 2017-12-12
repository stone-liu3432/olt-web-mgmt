import Vue from 'vue'
import detail from '../components/page/detail'
import runStatus from '../components/common/runStatus'
import diagonose from '../components/common/diagonose'
import macMgmt from '../components/common/macMgmt'
import onuDeny from '../components/common/onuDeny'
import onuAllow from '../components/common/onuAllow'
import onuBasicInfo from '../components/common/onuBasicInfo'
import perfInfo from '../components/common/perfInfo'
import portInfo from '../components/common/portInfo'
import remoteMgmt from '../components/common/remoteMgmt'
import rstp from '../components/common/rstp'
import onuBandwidth from '../components/common/onuBandwidth'
import upgrade from '../components/common/upgrade'
import portCfg from '../components/common/portCfg'
import vlanMgmt from '../components/common/vlanMgmt'
import time from '../components/common/time'
import devMgmt from "../components/common/devMgmt"
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: runStatus
    },
    {
      path: '/running_status',
      component: runStatus
    },{
      path: '/dev_mgmt',
      component: devMgmt
    },{
      path: "/diagonose",
      component: diagonose
    }, {
      path: "/remote_mgmt",
      component: remoteMgmt
    },{
      path: "/upgrade",
      component: upgrade
    },{
      path: "/onu_allow",
      component: onuAllow
    },{
      path: "/onu_deny",
      component: onuDeny
    },{
      path: "/onu_bandwidth",
      component: onuBandwidth
    },{
      path: "/onu_basic_info",
      component: onuBasicInfo
    },{
      path: "/perf_info",
      component: perfInfo
    },{
      path: "/port_info",
      component: portInfo
    },{
      path: "/port_cfg",
      component: portCfg
    },{
      path: "/vlan_mgmt",
      component: vlanMgmt
    },{
      path: "/mac_mgmt",
      component: macMgmt
    },{
      path: "/rstp",
      component: rstp
    },{
      path: "/time",
      component: time
    }
  ]
})
