// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import Hsgq from './Hsgq'
import router from './router'
import axios from 'axios'
import store from './vuex/store'
import VueMessage from '@/components/common/message'
import confirm from '@/components/common/confirm'
import tabBar from '@/components/common/tabBar'
import { analysis } from './utils/common.js'

Vue.use(VueMessage)

Vue.component('confirm', confirm)
Vue.component('tabBar', tabBar)

Vue.filter('analysis', analysis)
//  request拦截器  -->  全局request添加请求头
axios.interceptors.request.use(config => {
	var xtoken = sessionStorage.getItem('x-token');
	config.headers['X-Token'] = xtoken;
	return config
}, err => {
  	return Promise.reject(err)
})

//  response拦截器  -->  全局错误处理
axios.interceptors.response.use(response=>{
        return response;
    },
    err=>{
        err.response ? console.log(`${err.response.status} ${err.response.statusText}`) : console.log('Unknow error');
        return Promise.reject(err);
    }
);

Vue.prototype.$http = axios

//  页面加载时，该元素将获取焦点  调用： v-focus
Vue.directive('focus',{
	inserted(el){
		el.focus();
	}
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
	el: '#app',
	router,
	store,
	template: '<Hsgq/>',
	components: {
		Hsgq
	}
});
