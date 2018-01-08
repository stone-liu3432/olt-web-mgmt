import Vue from 'vue'
import Vuex from 'vuex'
import change_url from '@/config/url'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 系统信息  
    system: {},
    // 端口信息 => pon info && ge info
    port_info: {},
    // 端口映射 => port_id : port_name
    port_name: {},
    // 选择语言输出到页面 => 语言映射
    lanMap: {},
    // 菜单映射
    menu: {},
    // onu列表
    onu_list: {},
    //  加载中
    isLoading: false,
    //  是否登陆
    accessToken: '',
    //  全局替换url  testUrl => 开发版本   betaUrl => 测试版本
    change_url: change_url.testUrl
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
    },
    updatePortName(state,data){
        state.port_name = data;
    },
    updateMenu(state,data){
        state.menu = data;
    },
    updateOnuList(state,data){
        state.onu_list = data;
    },
    updateLogin(state,data){
        state.accessToken = data;
    },
    updateLoading(state,data){
        state.isLoading = data;
    }
  }
})
