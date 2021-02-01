import change_url from "@/config/url";

let _url;
if (process.env.NODE_ENV == "development") {
    _url = change_url.testUrl;
} else if (process.env.NODE_ENV == "production") {
    _url = change_url.betaUrl;
}

export default {
    // 系统信息
    system: {},
    // 端口信息 => pon info && ge info
    port_info: {},
    // 端口映射 => port_id : port_name
    port_name: {},
    // 选择语言输出到页面 => 语言映射
    lanMap: null,
    // 菜单映射
    menu: {},
    // onu列表
    onu_list: {},
    //  系统时间  --> 13位时间戳
    system_time: 0,
    //  loading状态
    isLoading: false,
    //  切换语言
    language: "",
    //  全局替换url
    change_url: _url,
    //  首页导航菜单
    nav_menu: "status",
    //  高级设置一级菜单
    adv_f_menu: "running_status",
    //  高级设置二级菜单
    adv_menu: "running_status",
    //  time range
    time_range: {},
    // custom function
    custom: {},
    hostname: ""
};
