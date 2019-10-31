import Vue from "vue";
const analysis = str => {
    if (!str) return "";
    var result = [];
    var arr = str.split(",");
    for (var i = 0, len = arr.length; i < len; i++) {
        var substrs = arr[i];
        if (substrs.indexOf("-") !== -1) {
            var subArr = substrs.split("-");
            var min = Number(subArr[0]),
                max = Number(subArr[subArr.length - 1]);
            if (isNaN(min) || isNaN(max)) throw new TypeError();
            result.push(min);
            for (var j = 1; j < max - min; j++) {
                result.push(min + j);
            }
            result.push(max);
        } else {
            if (isNaN(Number(substrs))) throw new TypeError();
            result.push(Number(substrs));
        }
    }
    return result.filter(item => !!item);
};

export default {
    updateSystem({ commit, state }) {
        Vue.prototype.$http
            .get(state.change_url.system)
            .then(res => {
                if (res.data.code === 1) {
                    commit("updateSysData", res.data);
                }
            })
            .catch(err => {
                commit("updateSysData", {});
            });
    },
    updateMenu({ commit, state }) {
        Vue.prototype.$http
            .get(state.change_url.menu)
            .then(res => {
                if (res.data.code === 1) {
                    commit("updateMenu", res.data);
                }
            })
            .catch(err => {
                commit("updateMenu", {});
            });
    },
    // 获取 PON下存在的 onu
    updatePortUsedResource({ commit, state }, port_id) {
        let baseURL = '';
        if (process.env.NODE_ENV === "development") {
            //  开发模式
            baseURL = "http://192.168.5.58:8281/onu_allow_list";
        } else if (process.env.NODE_ENV == "production") {
            //  生产模式
            baseURL = "/onu_allow_list";
        }
        Vue.prototype.$http
            .get(baseURL, { params: { form: "resource", port_id } })
            .then(res => {
                if (res.data.code === 1) {
                    let onu_list = analysis(res.data.data.resource);
                    if (!onu_list) {
                        commit("updateOnuList", {});
                        return;
                    }
                    let obj = {
                        port_id: res.data.data.port_id,
                        data: onu_list
                    };
                    commit("updateOnuList", obj);
                } else {
                    commit("updateOnuList", {});
                }
            })
            .catch(err => {
                commit("updateOnuList", {});
            });
    }
};
