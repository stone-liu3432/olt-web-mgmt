import Vue from 'vue'
import main from '../components/page/main'
import login from '../components/page/login'
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
import slaCfg from '../components/common/slaCfg'
import upgrade from '../components/common/upgrade'
import portCfg from '../components/common/portCfg'
import vlanMgmt from '../components/common/vlanMgmt'
import time from '../components/common/time'
import devMgmt from "../components/common/devMgmt"
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [{
      path: '/',
      component: login
    },
    {
      path: '/login',
      component: login
    },
    {
      path: '/main',
      meta: {
        // 添加该字段，表示进入这个路由是需要登录的
        requireAuth: true
      },
      component: main,
      children: [{
          path: '/main',
          component: runStatus,
          meta: {
            requireAuth: true
          }
        },
        {
          path: '/running_status',
          component: runStatus,
          meta: {
            requireAuth: true
          }
        }, {
          path: '/dev_mgmt',
          component: devMgmt,
          meta: {
            requireAuth: true
          }
        }, {
          path: "/diagonose",
          component: diagonose,
          meta: {
            requireAuth: true
          }
        }, {
          path: "/remote_mgmt",
          component: remoteMgmt,
          meta: {
            requireAuth: true
          }
        }, {
          path: "/upgrade",
          component: upgrade,
          meta: {
            requireAuth: true
          }
        }, {
          path: "/onu_allow",
          component: onuAllow,
          meta: {
            requireAuth: true
          }
        }, {
          path: "/onu_deny",
          component: onuDeny,
          meta: {
            requireAuth: true
          }
        }, {
          path: "/sla_cfg",
          component: slaCfg,
          meta: {
            requireAuth: true
          }
        }, {
          path: "/onu_basic_info",
          component: onuBasicInfo,
          meta: {
            requireAuth: true
          }
        }, {
          path: "/perf_info",
          component: perfInfo,
          meta: {
            requireAuth: true
          }
        }, {
          path: "/port_info",
          component: portInfo,
          meta: {
            requireAuth: true
          }
        }, {
          path: "/port_cfg",
          component: portCfg,
          meta: {
            requireAuth: true
          }
        }, {
          path: "/vlan_mgmt",
          component: vlanMgmt,
          meta: {
            requireAuth: true
          }
        }, {
          path: "/mac_mgmt",
          component: macMgmt,
          meta: {
            requireAuth: true
          }
        }, {
          path: "/rstp",
          component: rstp,
          meta: {
            requireAuth: true
          }
        }, {
          path: "/time",
          component: time,
          meta: {
            requireAuth: true
          }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  // 判断该路由是否需要登录权限
  if (to.meta.requireAuth) {
    // 通过vuex state获取当前的token是否存在
    // if (store.state.token) {
    //     next();
    // } else {
    //     next({path: '/login'})
    // }
    console.log('未验证登陆状态');
    // next({ path:'/main' });
    next();
  }else{
    next();
  }
})

export default router
