export default {
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
    updateNavMenu(state, data) {
        state.nav_menu = data;
    },
    updateAdvMenu(state, data) {
        state.adv_menu = data;
    },
    updateAdvFMenu(state, data) {
        state.adv_f_menu = data;
    },
    updateTimeRange(state, data) {
        state.time_range = data;
    },
    updateCustom(state, data) {
        state.custom = data;
    },
    updateHostName(state, data) {
        state.hostname = data;
    }
};
