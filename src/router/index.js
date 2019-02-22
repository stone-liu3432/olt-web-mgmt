import Vue from "vue";
import Router from "vue-router";
import store from "../vuex/store";
import login from "../components/page/login";
import sysSetting from '../components/page/sys-setting';
import advancedSettingRouter from './advancedSettingRouter';

Vue.use(Router);

//  文件切割 
//  main
const main = () => import(/* webpackChunkName: "main-page" */  '@/components/page/main')
const contentArea = () => import(/* webpackChunkName: "main-page" */  '@/components/page/content')
const status = () => import(/* webpackChunkName: "main-page" */  '@/components/common/system/status')
const onuAllow = () => import(/* webpackChunkName: "main-page" */  '@/components/common/pon/onuAllow')
const vlanMgmt = () => import(/* webpackChunkName: "main-page" */  '@/components/common/switch/vlanMgmt')

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
			path: "/sys-setting",
			meta: {
				// 添加该字段，表示进入这个路由是需要登录的
				requireAuth: true
			},
			component: sysSetting
		},
		{
			path: "/main",
			meta: {
				requireAuth: true
			},
			component: main,
			children: [
				{
					path: '/main',
					meta: {
						requireAuth: true
					},
					component: status
				},
				{
					path: '/status',      // status
					meta: {
						requireAuth: true
					},
					component: status
				},
				{
					path: '/onu_allow',
					meta: {
						requireAuth: true
					},
					component: onuAllow
				},
				{
					path: '/vlan_mgmt',
					meta: {
						requireAuth: true
					},
					component: vlanMgmt
				},
				{
					path: '/advanced_setting',
					meta: {
						requireAuth: true
					},
					component: contentArea,
					children: advancedSettingRouter
				}
			]
		}
	],
	scrollBehavior (to, from, savedPosition) {
		return { x: 0, y: 0 }
	}
});

router.beforeEach((to, from, next)=>{
	store.commit("updateLoad", true);
	// 判断该路由是否需要登录权限
	if (to.meta.requireAuth) {
		if (process.env.NODE_ENV == 'development'){
			next();
		}else if(process.env.NODE_ENV == 'production'){
			if (sessionStorage.getItem("x-token")){
				next();
			}else{
				next({ path: "/login" });
			}
		}
	}else{
		if(!sessionStorage.getItem("x-token")){
			next();
		}else{
			next("/main");
		}
	}
});

router.afterEach((to, from)=>{
	store.commit("updateLoad", false);
});

export default router;
