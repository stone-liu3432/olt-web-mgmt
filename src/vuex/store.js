import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  // 定义状态
  state: {
    system: {},
    port_info: {},
    lanMap: {}
  },
  mutations:{
    updateSysData(state,data){
        state.system = data;
    },
    updatePortData(state,data){
        state.port_info = data;
    },
    updateLanMap(state,data){
        state.lanMap = data;
    }
  }
})
