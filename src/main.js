// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import "babel-polyfill";
import Vue from "vue";
import Hsgq from "./Hsgq";
import router from "./router";
import axios from "axios";
import store from "./vuex/store";
import VueMessage from "@/components/common/message";
import tabBar from "@/components/common/commonComponent/tabs";
import serviceConfirm from "@/components/common/commonComponent/confirm";
import Notification from "@/components/common/commonComponent/notify";
import table from "@/components/common/commonComponent/table";
import dialog from "@/components/common/commonComponent/dialog";
import loading from "@/components/common/commonComponent/loading";
import portHeader from "@/components/common/commonComponent/pageHeader";
import dropdown from "@/components/common/commonComponent/dropdown";
import nmsPagination from "@/components/common/commonComponent/pagination";
import popover from "@/components/common/commonComponent/popover";
import nmsButton from "@/components/common/commonComponent/button";
import portCheckbox from "@/components/common/commonComponent/portCheckbox";
import {
    analysis,
    getPortName,
    isFunction,
    parsePortList,
    isReg
} from "@/utils/common";

Vue.use(VueMessage);
Vue.use(portHeader);
Vue.use(tabBar);
Vue.use(dropdown);
Vue.use(nmsPagination);
Vue.use(popover);
Vue.use(nmsButton);
Vue.use(table);
Vue.use(dialog);
Vue.use(portCheckbox);

Vue.filter("analysis", analysis);
Vue.filter("getPortName", getPortName);
Vue.filter("parsePortList", parsePortList);
//  request拦截器  -->  全局request添加请求头
axios.interceptors.request.use(
    config => {
        var xtoken = sessionStorage.getItem("x-token");
        config.headers["X-Token"] = xtoken;
        return config;
    },
    err => {
        return Promise.reject(err);
    }
);

//  response拦截器  -->  全局错误处理
axios.interceptors.response.use(
    response => {
        return response;
    },
    err => {
        err.response
            ? console.log(`${err.response.status} ${err.response.statusText}`)
            : console.log("Unknow error");
        return Promise.reject(err);
    }
);

Vue.prototype.$confirm = serviceConfirm;
Vue.prototype.$notify = Notification;
Vue.prototype.$http = axios;
Vue.prototype.$loading = loading;

//  页面加载时，该元素将获取焦点  调用： v-focus
Vue.directive("focus", {
    inserted(el) {
        el.focus();
    }
});

Vue.directive("validator", {
    update(el, { value, arg }) {
        const val = el.value,
            { regexp, min, max, nullable, validator } = value;
        if (isFunction(validator)) {
            if (validator(val)) {
                el.style.borderColor = "";
            } else {
                el.style.borderColor = "red";
            }
            return;
        }
        if (nullable && !val) {
            el.style.borderColor = "";
            return;
        }
        if (isReg(regexp)) {
            if (!regexp.test(val)) {
                el.style.borderColor = "red";
            } else {
                el.style.borderColor = "";
            }
            return;
        }
        if (arg === "number") {
            if (val < min || val > max || isNaN(val)) {
                el.style.borderColor = "red";
            } else {
                el.style.borderColor = "";
            }
        } else if (arg === "string") {
            if (val.length < min || val.length > max) {
                el.style.borderColor = "red";
            } else {
                el.style.borderColor = "";
            }
        }
    }
});

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: "#app",
    router,
    store,
    template: "<Hsgq/>",
    components: {
        Hsgq
    }
});
