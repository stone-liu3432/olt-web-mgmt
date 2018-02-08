// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import Hsgq from './Hsgq'
import router from './router'
import Vuex from 'Vuex'
import axios from 'axios'
import store from './vuex/store'
import VueMessage from '@/components/common/message'

Vue.use(VueMessage)
Vue.use(Vuex)

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
        console.log(`${err.response.status} ${err.response.statusText}`);
        return Promise.reject(err);
    }
);

Vue.prototype.$http = axios

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
