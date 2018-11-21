import Vue from "vue";
import messageVue from "./message.vue";
const defaults = {
    show: false,
    text: "",
    duration: "4000",
    type: ""
};
const messageVueConstructor = Vue.extend(messageVue);
messageVueConstructor.prototype.close = function() {
    var vm = this;
    this.$on("after-leave", _ => {
        if (vm.$el && vm.$el.parentNode) {
            vm.$el.parentNode.removeChild(vm.$el);
        }
        this.$destroy();
    });
    vm.show = false;
};
const messageBox = (options = {}) => {
    if (Vue.prototype.$isServer) return;
    options = Object.assign({}, defaults, options);
    let parent = document.body;
    var timeout;
    let instance = new messageVueConstructor({
        el: document.createElement("div"),
        data: options
    });
    if (document.querySelectorAll("div.mei-message").length !== 0) {
        document.querySelectorAll("div.mei-message").forEach(item => {
            parent.removeChild(item);
        });
    }
    parent.appendChild(instance.$el);
    if (options.type === "success" || options.type === "info")
        options.duration = "2000";
    Vue.nextTick(() => {
        instance.show = true;
        Vue.nextTick(()=>{
            instance.$el.addEventListener('mouseover',function(e){
                if(timeout) clearInterval(timeout);
            })
            instance.$el.addEventListener('mouseout',function(e){
                timeout = setTimeout(function() {
                    instance.close();
                }, options.duration);
            })
        })
        timeout = setTimeout(function() {
            instance.close();
        }, options.duration);
    });
    return instance;
};

export default messageBox;
