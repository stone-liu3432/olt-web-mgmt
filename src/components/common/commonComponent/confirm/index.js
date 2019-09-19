import Vue from "vue";
import store from "@/vuex/store";
import confirm from "./confirm.vue";

const ConfirmBox = Vue.extend(confirm);

confirm.install = (content, title, options) => {
    if (typeof title === "object") {
        options = title;
        title = "";
    }
    options = Object.assign(
        {
            title,
            content,
            confirmBtnText: store.state.lanMap["apply"],
            cancelBtnText: store.state.lanMap["cancel"]
        },
        options
    );
    let instance = new ConfirmBox({
        data: options
    }).$mount();
    document.body.appendChild(instance.$el);
    return instance.confirm();
};

export default confirm.install;
