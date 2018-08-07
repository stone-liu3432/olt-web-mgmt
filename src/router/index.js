import Vue from "vue";
import Router from "vue-router";
import store from "../vuex/store";
import login from "../components/page/login";

Vue.use(Router);

//  文件切割  -->  懒加载，提高首页打开速度
//  main
const main = () => import(/* webpackChunkName: "main-page" */  '@/components/page/main')
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
const onuAllow = () => import(/* webpackChunkName: "ponmgmt-page" */  '@/components/common/pon/onuAllow')
const onuDeny = () => import(/* webpackChunkName: "ponmgmt-page" */  '@/components/common/pon/onuDeny')
const slaCfg = () => import(/* webpackChunkName: "ponmgmt-page" */  '@/components/common/pon/slaCfg')
const ponSetting = () => import(/* webpackChunkName: "ponmgmt-page" */  '@/components/common/pon/ponSetting')
const onuBasicInfo = () => import(/* webpackChunkName: "ponmgmt-page" */  '@/components/common/pon/onuBasicInfo')
const onuPortCfg = () => import(/* webpackChunkName: "ponmgmt-page" */  '@/components/common/pon/onuPortCfg')
const onuBatchUpgrade = () => import(/* webpackChunkName: "ponmgmt-page" */  '@/components/common/pon/onuBatchUpgrade')
// switch
const portInfo = () => import(/* webpackChunkName: "switch-page" */  '@/components/common/switch/portInfo')
const perfInfo = () => import(/* webpackChunkName: "switch-page" */  '@/components/common/switch/perfInfo')
const portCfg = () => import(/* webpackChunkName: "switch-page" */  '@/components/common/switch/portCfg')
const portVlan = () => import(/* webpackChunkName: "switch-page" */  '@/components/common/switch/portVlan')
const vlanMgmt = () => import(/* webpackChunkName: "switch-page" */  '@/components/common/switch/vlanMgmt')
const macMgmt = () => import(/* webpackChunkName: "switch-page" */  '@/components/common/switch/macMgmt')
// protocol
const rstp = () => import(/* webpackChunkName: "protocol-page" */  '@/components/common/protocol/rstp')

const router = new Router({
	routes: [
		{
			path: "/",
			component: login
		},
		{
			path: "/login",
			component: login
		},
		{
			path: "/main",
			meta: {
				// 添加该字段，表示进入这个路由是需要登录的
				requireAuth: true
			},
			component: main,
			children: [
				{
					path: "/main",
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
					path: "/onu_allow",
					component: onuAllow,
					meta: {
						requireAuth: true,
						keepAlive: true
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
					path: "/vlan_mgmt",
					component: vlanMgmt,
					meta: {
						requireAuth: true
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
				}
			]
		}
	],
	scrollBehavior (to, from, savedPosition) {
		return { x: 0, y: 0 }
	}
});

router.beforeEach((to, from, next) => {
	store.commit("updateLoad", true);
	// 判断该路由是否需要登录权限
	if (to.meta.requireAuth) {
		// if (sessionStorage.getItem("x-token")) {
		// 	next();
		// } else {
		// 	next({ path: "/login" });
		// }
		next();
	} else {
		if (!sessionStorage.getItem("x-token")) {
			next();
		} else {
			next("/main");
		}
	}
});

router.afterEach((to, from) => {
	store.commit("updateLoad", false);
});

export default router;
