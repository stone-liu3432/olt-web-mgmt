import Vue from "vue";
import messageVue from "./message.vue";

const messageVueConstructor = Vue.extend(messageVue);

const messageBox = (options) => {
    if (Vue.prototype.$isServer) return;
    let parent = document.body;
    let instance = new messageVueConstructor({
        data: options
    }).$mount();
    parent.appendChild(instance.$el);
    if (options.type === "success" || options.type === "info") {
        options.duration = "2000";
    }
    return instance;
};

["warning", "error", "info", "success"].forEach(type => {
    messageBox[type] = msg => {
        if (typeof msg === "string") {
            const options = {
                type,
                msg
            };
            messageBox(options);
        }
    };
});

export default messageBox;
