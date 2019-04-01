import Vue from "vue";
import Router from "vue-router";
import store from "../vuex/store";
import login from "../components/page/login";
import sysSetting from '../components/page/sys-setting';
import advancedSettingRouter from './advancedSettingRouter';
import hsgq from '../Hsgq'

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
				sessionStorage.clear();
			}
		}
	}else{
		if(!sessionStorage.getItem("x-token")){
			next();
			sessionStorage.clear();
		}else{
			next("/main");
		}
	}
});

const f_menu = ['main', 'status', 'onu_allow', 'vlan_mgmt', 'advanced_setting']

router.afterEach((to, from)=>{
	store.commit("updateLoad", false);
	// 分辨率低时，路由跳转时页面滚动到顶部
	if(document){
		var content = document.getElementById('hsgq');
		if(content){
			content.scrollTop = 0;
		}
	}
	//  2019-3-4 修改导航跳转方式
	if(store.state.menu.data){
		let menu = store.state.menu.data.menu, path = to.path.substr(1);
		if(f_menu.indexOf(path) !== -1 && path !== 'advanced_setting'){
			store.commit('updateNavMenu', path);
			store.commit('updateAdvFMenu', '');
			store.commit('updateAdvMenu', '');
			sessionStorage.setItem('f_menu', path);
			sessionStorage.removeItem('first_menu');
			sessionStorage.removeItem('sec_menu');
			if(path === 'main'){
				store.commit('updateNavMenu', 'status');
				sessionStorage.setItem('f_menu', 'status');
			}
		}else{
			store.commit('updateNavMenu', 'advanced_setting');
			sessionStorage.setItem('f_menu', 'advanced_setting');
			menu.forEach(item =>{
				if(item.name === path){
					store.commit('updateAdvFMenu', path);
					store.commit('updateAdvMenu', '');
					sessionStorage.setItem('first_menu', path);
					sessionStorage.removeItem('sec_menu');
				}else{
					if(item.children){
						item.children.forEach(_item =>{
							if(_item.name === path){
								sessionStorage.setItem('first_menu', item.name);
								sessionStorage.setItem('sec_menu', path);
								store.commit('updateAdvFMenu', item.name);
								store.commit('updateAdvMenu', path);
							}
						})
					}
				}
			})
		}
	}
});

export default router;
