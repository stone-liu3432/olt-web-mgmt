import store from "../vuex/store";

//  解析后台返回的字符串
export function analysis(str, pon, ge) {
    if (!str) return [];
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
    return nomenclature(result, pon, ge);
}

//  根据返回数据，命名端口号
function nomenclature(arr, pon_count, ge_count) {
    if (!arr) return "";
    var results = "";
    for (var i = 0, len = arr.length; i < len; i++) {
        var m = arr[i];
        if (m <= pon_count) {
            results += m < 10 ? "PON0" + m + "," : "PON" + m + ",";
        } else if (m > pon_count && m <= pon_count + ge_count) {
            results +=
                m - pon_count < 10
                    ? "GE0" + (m - pon_count) + ","
                    : "GE" + (m - pon_count) + ",";
        } else {
            results +=
                m - (pon_count + ge_count) < 10
                    ? "XGE0" + (m - (pon_count + ge_count)) + ","
                    : "XGE" + (m - (pon_count + ge_count)) + ",";
        }
    }
    return results.replace(/\,$/, "");
}

//  替换所有双字节字符为空
export function replaceDBCS(str) {
    return str.replace(/[^\x00-\x80]/gi, "");
}

//  IP地址检查
export function testIPAddr(str) {
    var reg = /^((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)$/;
    return reg.test(str) && str !== "0.0.0.0" && str !== "255.255.255.255";
}

//  MAC地址检查   0000-0000-0000
export function testMACAddr(str) {
    var reg = /^([0-9abcdefABCDEF]{4}\-){2}[0-9abcdefABCDEF]{4}$/;
    return reg.test(str) || str === "";
}

//  MAC地址掩码检查
export function testMACMask(str) {
    var reg = /^([0-9abcdefABCDEF]{4}\-){2}[0-9abcdefABCDEF]{4}$/;
    return reg.test(str) || str === "";
}

export function parsePortList(str) {
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
    return result.reduce((initVal, val) => {
        if (initVal) {
            return `${initVal},${getPortName(val)}`;
        }
        return getPortName(val);
    }, "");
}

export function getPortName(port_id) {
    const names = store.state.port_name;
    const system = store.state.system.data;
    if (system) {
        let ports = system.ponports + system.geports;
        if (system.xgeports) {
            ports += system.xgeports;
        }
        if (port_id <= 0 || !names || port_id > ports) {
            return "";
        }
        return names.pon[port_id]
            ? names.pon[port_id].name
            : names.ge[port_id]
            ? names.ge[port_id].name
            : names.xge && names.xge[port_id]
            ? names.xge[port_id].name
            : "";
    }
    return "";
}

export function parsePort(str) {
    if (!str) return [];
    const result = [];
    const arr = str.split(",");
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
    return result;
}

/*
 *  @method 防抖函数 间隔时间内点击，只执行一次
 *  @param {Fucntion} func 需要执行防抖的回调
 *  @param {Number} delay 执行延迟时间
 *  @param {Object} context 回调函数的this指向
 *  @param {Array} args 回调的参数
 */
export function debounce(func, delay, context, ...args) {
    if (func.timer) {
        clearTimeout(func.timer);
        func.timer = setTimeout(_ => {
            func.apply(context, args);
            func.timer = null;
        }, delay);
    } else {
        func.timer = setTimeout(_ => {
            func.apply(context, args);
            func.timer = null;
        }, delay);
    }
}

/*
 *  @method throttle 节流函数 每隔固定时间执行一次
 *  @param {Function} func 要执行节流的函数
 *  @param {Number} wait 回调执行的间隔
 *  @param {Object} context 回调内的this指向
 *  @param {Array} 回调的参数
 */
export function throttle(func, wait, context) {
    let last = 0,
        timer = null;
    return function() {
        let current = +new Date();
        clearTimeout(timer);
        if (current - last > wait) {
            func.apply(context, arguments);
            last = current;
        } else {
            timer = setTimeout(_ => {
                func.apply(context, arguments);
                last = current;
            }, wait);
        }
    };
}

export function isDef(val) {
    return val !== null && val !== undefined;
}

export function removeItem(arr, item) {
    const result = [];
    for (let i = 0, l = arr.length; i < l; i++) {
        if (arr[i] === item) {
            result.push(arr.splice(i, 1));
        }
    }
    return result;
}

export function isFunction(func) {
    return typeof func === "function";
}

export function clearSessionStorage() {
    const lang = sessionStorage.getItem("def_lang");
    sessionStorage.clear();
    sessionStorage.setItem("def_lang", lang);
}

export function isArray(val) {
    if (isFunction(Array.isArray)) {
        return Array.isArray(val);
    }
    return Object.prototype.toString.call(val).slice(8, -1) === "Array";
}

export function isReg(val) {
    return Object.prototype.toString.call(val) === "[object RegExp]";
}

/**
 * @param {String} a String
 * @return {Boolean} true if the String is a valid IPv6 address; false otherwise
 */
export function isIPv6(value) {
    const components = value.split(":");
    if (components.length < 2 || components.length > 8) {
        return false;
    }
    if (components[0] !== "" || components[1] !== "") {
        // Address does not begin with a zero compression ("::")
        if (!components[0].match(/^[\da-f]{1,4}/i)) {
            // Component must contain 1-4 hex characters
            return false;
        }
    }
    let numberOfZeroCompressions = 0;
    for (let i = 1; i < components.length; ++i) {
        if (components[i] === "") {
            // We're inside a zero compression ("::")
            ++numberOfZeroCompressions;
            if (numberOfZeroCompressions > 1) {
                // Zero compression can only occur once in an address
                return false;
            }
            continue;
        }
        if (!components[i].match(/^[\da-f]{1,4}/i)) {
            // Component must contain 1-4 hex characters
            return false;
        }
    }
    if (value.match(/[0-9a-f]:$/i)) {
        return false;
    }
    return true;
}
