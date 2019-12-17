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
    var reg = /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/;
    return reg.test(str) || str.replace(/(^\s*)|(\s*$)/g) === "0.0.0.0";
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
            return `${initVal},${
                store.state.port_name.pon[val]
                    ? store.state.port_name.pon[val].name
                    : store.state.port_name.ge[val]
                    ? store.state.port_name.ge[val].name
                    : store.state.port_name.xge[val].name
            }`;
        }
        return `${
            store.state.port_name.pon[val]
                ? store.state.port_name.pon[val].name
                : store.state.port_name.ge[val]
                ? store.state.port_name.ge[val].name
                : store.state.port_name.xge[val].name
        }`;
    }, "");
}

export function parsePort(str) {
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
    return result;
}
