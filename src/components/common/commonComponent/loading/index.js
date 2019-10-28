import Vue from "vue";
import loadingBox from "../../loading";

const loadingInstance = Vue.extend(loadingBox);

const loading = () => {
    if (Vue.prototype.$isServer) return;
    let instance = null;
    return () => {
        if (!instance) {
            instance = new loadingInstance().$mount();
            document.body.appendChild(instance.$el);
        }
        instance.loading = true;
        return instance;
    };
};

export default loading();
