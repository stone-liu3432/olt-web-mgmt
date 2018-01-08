// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Hsgq from './Hsgq'
import router from './router'
import Vuex from 'Vuex'
import axios from 'axios'
import store from './vuex/store'

Vue.use(Vuex)
axios.interceptors.request.use(
    config => {
        var xtoken = sessionStorage.getItem('x-token');
        config.headers['X-Token'] = xtoken
        return config
    },function(err){
        return Promise.reject(err)
    }  
)

Vue.prototype.$http = axios

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<Hsgq/>',
  components: { Hsgq }
});
