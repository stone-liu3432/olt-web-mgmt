import Vue from "vue";
import Vuex from "vuex";
import change_url from "@/config/url";

Vue.use(Vuex);

var _url;
if (process.env.NODE_ENV == 'development') {    
    _url = change_url.testUrl;
}else if (process.env.NODE_ENV == 'production') {    
    _url = change_url.betaUrl;
}

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
        //  系统时间  --> 13位时间戳
        system_time: 0,
        //  loading状态
        isLoading: false,
        //  切换语言
        language: "",
        //  全局替换url
        change_url: _url,
        //  首页导航菜单
        nav_menu: 'status',
        //  高级设置一级菜单
        adv_f_menu: 'running_status',
        //  高级设置二级菜单
        adv_menu: 'running_status',
        //  time range
        time_range: {}
    },
    mutations: {
        updateSysData(state, data) {
            state.system = data;
        },
        updatePortData(state, data) {
            state.port_info = data;
        },
        updateLanMap(state, data) {
            state.lanMap = data;
        },
        updatePortName(state, data) {
            state.port_name = data;
        },
        updateMenu(state, data) {
            state.menu = data;
        },
        updateOnuList(state, data) {
            state.onu_list = data;
        },
        updateLang(state, data) {
            state.language = data;
        },
        updateLoad(state, data) {
            state.isLoading = data;
        },
        updateTime(state, data) {
            state.system_time = data;
        },
        updateNavMenu(state, data){
            state.nav_menu = data;
        },
        updateAdvMenu(state, data){
            state.adv_menu = data;
        },
        updateAdvFMenu(state, data){
            state.adv_f_menu = data;
        },
        updateTimeRange(state, data){
            state.time_range = data;
        }
    },
    actions: {
        updateSystem({ commit, state }){
            Vue.prototype.$http.get(state.change_url.system).then(res=>{
                if(res.data.code === 1){
                    commit('updateSysData', res.data);
                }
            }).catch(err=>{
                commit('updateSysData', {});
            })
        },
        updateMenu({ commit, state }){
            Vue.prototype.$http.get(state.change_url.menu).then(res=>{
                if(res.data.code === 1){
                    commit('updateMenu', res.data);
                }
            }).catch(err=>{
                commit('updateMenu', {});
            })
        }
    }
});
