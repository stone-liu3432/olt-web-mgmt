import Vue from "vue";
import notify from "./notify";

const notificationConstructor = Vue.extend(notify);
//  每次追加时的偏移量
const OFFSET_Y = 16;
const POSITION_MAP = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

let instances = [];
//  编号
let num = 1;
let zindex = 99999;

const Notification = function(options) {
    if (Vue.prototype.$isServer) return;
    const id = `notification_${num++}`;
    //  传入的位置不存在时，应用默认的 bottom-right
    const position = POSITION_MAP.includes(options.position) ? options.position : "bottom-right";
    //  用户传入的关闭时调用的回调
    const userCloseCb = options.onClose;
    options.onClose = function() {
        Notification.close(id, userCloseCb);
    };
    let instance = new notificationConstructor({ data: options });
    //  下方弹出时保留底部栏的距离(30px)，上方弹出保留顶部导航栏的距离(70px)
    let verticalOffset =
        options.offset || instance.verticalPosition === "bottom" ? 30 : 70;
    instance.id = id;
    instance.$mount();
    instance.$el.style.zIndex = zindex++;
    document.body.appendChild(instance.$el);
    instances
        .filter(item => item.position === position)
        .forEach(item => {
            verticalOffset += item.$el.offsetHeight + OFFSET_Y;
        });
    verticalOffset += OFFSET_Y;
    instance.verticalOffset = verticalOffset;
    instances.push(instance);
    return instance;
};

["success", "warning", "error", "info"].forEach(type => {
    Notification[type] = function(options) {
        if (typeof options === "string") {
            return Notification({
                type,
                message: options
            });
        }
    };
});

Notification.close = function(id, userCloseCb) {
    let index = -1;
    const len = instances.length;
    const instance = instances.filter((item, i) => {
        if (item.id === id) {
            index = i;
            return true;
        }
        return false;
    })[0];
    if (!instance) return;
    if (typeof userCloseCb === "function") {
        userCloseCb(instance);
    }
    instances.splice(index, 1);

    if (len <= 1) return;
    const position = instance.position;
    const removedHeight = instance.$el.offsetHeight;
    //  instances按载入顺序,在要关闭的节点后载入并且偏移位置相同的节点才需要移动位置
    for (let i = index; i < len - 1; i++) {
        if (instances[i].position === position) {
            instances[i].$el.style[instance.verticalPosition] =
                parseInt(
                    instances[i].$el.style[instance.verticalPosition],
                    10
                ) -
                removedHeight -
                OFFSET_Y +
                "px";
        }
    }
};

Notification.closeAll = function() {
    for (let i = instances.length - 1; i >= 0; i--) {
        instances[i].close();
    }
};

export default Notification;
