<template>
    <div class="top-banner" v-if="system && system.data">
        <div
            class="top-banner-logo lf"
            :style="{ 'font-size': system.data.vendor.length > 12 ? '28px' : '32px' }"
        >
            <img v-if="has_logo" ref="logo-image" @error="isNoLogo" />
            <a
                href="javascript: void(0);"
                v-else
            >{{ system.data.vendor ? system.data.vendor.length > 18 ? system.data.vendor.substring(0, 18) : system.data.vendor : "Neutral" }}</a>
        </div>
        <div class="top-banner-nav lf">
            <ul class="top-banner-group">
                <li
                    v-for="(item,index) in f_menu"
                    :key="index"
                    @click="nav_click(item)"
                    :class="[{ 'active' : item === nav_menu }, { 'advanced-setting': item === 'advanced_setting' }]"
                >{{ lanMap[item] }}</li>
            </ul>
        </div>
        <div class="top-banner-user lf">
            <ul class="top-banner-group">
                <li style="overflow: visible;">
                    <nms-dropdown style="line-height: 70px;" width="200px" @command="shortcut">
                        <span>{{ lanMap['shortcut'] }}</span>
                        <template slot="dropdown">
                            <nms-dropdown-item command="socket">{{ socketFlag }}</nms-dropdown-item>
                            <nms-dropdown-item command="save">{{ lanMap['save_config'] }}</nms-dropdown-item>
                            <nms-dropdown-item command="logout">{{ lanMap['logout'] }}</nms-dropdown-item>
                            <nms-dropdown-item command="reboot">{{ lanMap['reboot'] }}</nms-dropdown-item>
                            <nms-dropdown-item command="optical">{{ lanMap['pon_optical'] }}</nms-dropdown-item>
                            <nms-dropdown-item command="viewConfig">{{ lanMap['view_cfg'] }}</nms-dropdown-item>
                            <nms-dropdown-item command="zh">简体中文</nms-dropdown-item>
                            <nms-dropdown-item command="en">English</nms-dropdown-item>
                        </template>
                    </nms-dropdown>
                </li>
                <li @click="user_mgmt">{{ uName }}</li>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { wsUrl } from "@/config/url.js";
const f_menu = ["status", "topo", "onu_allow", "vlan_mgmt", "advanced_setting"];
const LEVEL = ["error", "warning", "warning", "info"];
const TYPE_MAP = { 1: "alarm", 2: "message" };
const MESSAGE_ACTION_MAP = { 1: "register", 2: "timeout", 3: "heartbeats" };
const messageActions = {
    //  server推送，登录超时
    timeout() {
        this.$message.error(this.lanMap["login_timeout"]);
        sessionStorage.removeItem("x-token");
        sessionStorage.removeItem("uname");
        this.$router.replace("/login");
    },
    //  接收到服务器返回的register消息直接忽略，不作任何处理
    register() {},
    //  接收到server发送的pong包时的动作
    heartbeats() {
        this.resetHeartBeat();
    }
};
const typeActions = {
    alarm(data) {
        const { content, level, alarm_id } = data;
        content &&
            this.$notify({
                message: content,
                position: "top-right",
                type: LEVEL[level] || "info"
            });
        //  设备重启告警
        if (alarm_id === 0x1001) {
            this.$message({
                type: "warning",
                text: content,
                duration: 60000
            });
            sessionStorage.removeItem("x-token");
            sessionStorage.removeItem("uname");
            this.$router.replace("/login");
        }
    },
    message(data) {
        //  action:  1-resgister，2-timeout，3-heartbeats
        const { action } = data;
        action && messageActions[MESSAGE_ACTION_MAP[action]].call(this);
    }
};
export default {
    name: "topBanner",
    computed: {
        ...mapState([
            "system",
            "lanMap",
            "language",
            "menu",
            "change_url",
            "nav_menu"
        ]),
        socketFlag() {
            if (this.socketState) {
                return this.lanMap["close_rt_alarm"];
            }
            return this.lanMap["open_rt_alarm"];
        }
    },
    data() {
        return {
            uName: "",
            has_logo: true,
            f_menu: f_menu,
            loading: null,
            ws: null,
            ws_limit: 0,
            timeout: 0,
            heartbeat: 30000,
            socketState: true
        };
    },
    created() {
        this.uName = sessionStorage.getItem("uname");
        var first_menu = sessionStorage.getItem("f_menu");
        if (first_menu) {
            this.changeMenu(first_menu);
        } else {
            this.changeMenu("status");
        }
    },
    mounted() {
        this.initSocket();
        this.$once("hook:beforeDestroy", _ => {
            this.closeWs();
        });
    },
    methods: {
        ...mapMutations({
            addmenu: "updateMenu",
            changeMenu: "updateNavMenu",
            changeAdvMenu: "updateAdvMenu",
            changeFMenu: "updateAdvFMenu",
            change_lang: "updateLang"
        }),
        login_out() {
            this.$confirm(this.lanMap["logout"] + " ?")
                .then(_ => {
                    const post_params = {
                        method: "set",
                        param: {
                            name: this.uName
                        }
                    };
                    this.$http
                        .post("/userlogin?form=logout", post_params)
                        .then(res => {
                            this.$message({
                                type: "success",
                                text: this.lanMap["login_out"]
                            });
                            sessionStorage.removeItem("x-token");
                            sessionStorage.removeItem("uname");
                            this.$router.push("/login");
                        })
                        .catch(err => {});
                })
                .catch(_ => {});
        },
        savecfg() {
            this.$confirm(this.lanMap["save_cfg_confirm"])
                .then(_ => {
                    this.$http
                        .get("/system_save")
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message({
                                    type: res.data.type,
                                    text: this.lanMap["save_succ"]
                                });
                            } else if (res.data.code > 1) {
                                this.$message({
                                    type: res.data.type,
                                    text:
                                        "(" +
                                        res.data.code +
                                        ") " +
                                        res.data.message
                                });
                            }
                        })
                        .catch(err => {});
                })
                .catch(_ => {});
        },
        user_mgmt() {
            this.$router.push("user_mgmt");
        },
        nav_click(node) {
            this.$router.push(node);
            if (node === "advanced_setting") {
                this.$http
                    .get(this.change_url.menu)
                    .then(res => {
                        if (res.data.code === 1) {
                            this.addmenu(res.data);
                        }
                    })
                    .catch(err => {});
            }
            this.changeMenu(node);
            sessionStorage.setItem("f_menu", node);
        },
        isNoLogo() {
            this.has_logo = false;
        },
        reboot() {
            this.$confirm(this.lanMap["reboot_olt_hit"])
                .then(_ => {
                    this.$http
                        .get("/system_reboot")
                        .then(res => {})
                        .catch(err => {});
                    this.reboot_req();
                    this.loading = this.$loading();
                })
                .catch(_ => {});
        },
        reboot_req() {
            this.$http
                .get("/system_start", { timeout: 3000 })
                .then(res => {
                    if (res.data.code === 1) {
                        this.loading && this.loading.close();
                        sessionStorage.clear();
                        this.$router.push("/login");
                    }
                })
                .catch(err => {
                    setTimeout(_ => {
                        this.reboot_req();
                    }, 3000);
                });
        },
        viewCurrentConfig() {
            this.$confirm()
                .then(_ => {
                    this.$http
                        .get("/system_running_config")
                        .then(res => {
                            if (res.data.code === 1) {
                                try {
                                    var a = document.createElement("a");
                                    a.href = "/" + "oltconfigtmp.txt";
                                    a.setAttribute(
                                        "download",
                                        "oltconfigtmp.txt"
                                    );
                                    a.style.display = "none";
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                } catch (e) {}
                            } else {
                                this.$message({
                                    type: res.data.type,
                                    text:
                                        "(" +
                                        res.data.code +
                                        ") " +
                                        res.data.message
                                });
                            }
                        })
                        .catch(err => {});
                })
                .catch(_ => {});
        },
        changeLang(lang) {
            this.change_lang(lang);
            const data = {
                method: "set",
                param: {
                    lang
                }
            };
            this.$http
                .post("/system_lang", data)
                .then(res => {})
                .catch(err => {});
        },
        shortcut(command) {
            const ACTIONS = {
                socket() {
                    if (this.socketState) {
                        this.closeWs();
                    } else {
                        this.initSocket();
                    }
                    this.socketState = !this.socketState;
                },
                save() {
                    this.savecfg();
                },
                logout() {
                    this.login_out();
                },
                reboot() {
                    this.reboot();
                },
                optical() {
                    this.$router.push("pon_optical");
                },
                viewConfig() {
                    this.viewCurrentConfig();
                },
                zh() {
                    if (this.language === "zh") return;
                    this.changeLang("zh");
                },
                en() {
                    if (this.language === "en") return;
                    this.changeLang("en");
                }
            };
            if (typeof ACTIONS[command] === "function") {
                ACTIONS[command].call(this);
            }
        },
        initSocket() {
            if ("WebSocket" in window) {
                let ws = new WebSocket(wsUrl);
                ws.onopen = e => {
                    if (ws.readyState === 1) {
                        this.sendRegisterMsg();
                        //  心跳检测
                        this.startHeartBeat();
                    }
                };
                ws.onmessage = e => {
                    //  type: 1-alarm 2-message
                    const { type, ...data } = JSON.parse(e.data);
                    type && typeActions[TYPE_MAP[type]].call(this, data);
                };
                ws.onclose = e => {
                    if (e.code !== 0x3e8) {
                        if (this.ws_limit >= 3) {
                            this.$message.error(this.lanMap["conn_error"]);
                            sessionStorage.removeItem("x-token");
                            sessionStorage.removeItem("uname");
                            this.$router.replace("/login");
                        } else {
                            this.ws_limit++;
                            this.initSocket();
                        }
                    } else {
                        this.ws_limit = 0;
                    }
                };
                ws.onerror = e => {};
                this.ws = ws;
            }
        },
        closeWs(code = 0x3e8) {
            if (this.ws) {
                this.ws.onclose = e => {};
                this.ws.close(code);
                this.ws = null;
            }
        },
        startHeartBeat() {
            this.timeout = setTimeout(_ => {
                this.ws &&
                    this.ws.send(
                        JSON.stringify({
                            type: 2,
                            action: 3
                        })
                    );
            }, this.heartbeat);
        },
        resetHeartBeat() {
            clearTimeout(this.timeout);
            this.startHeartBeat();
        },
        sendRegisterMsg() {
            const xtoken = sessionStorage.getItem("x-token"),
                username = sessionStorage.getItem("uname");
            xtoken &&
                username &&
                this.ws.send(
                    JSON.stringify({
                        type: 2, // message
                        action: 1, // register
                        xtoken,
                        username
                    })
                );
        }
    },
    watch: {
        system() {
            this.$nextTick(_ => {
                this.$refs["logo-image"].src = "../../logo.png";
            });
        }
    }
};
</script>

<style scoped lang="less">
.top-banner {
    width: 100%;
    min-width: 1280px;
    max-width: 1980px;
    height: 70px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 999;
    background: @headerBgColor;
    color: @headerColor;
    div.top-banner-logo,
    div.top-banner-nav,
    div.top-banner-user {
        height: 70px;
        line-height: 70px;
        text-align: center;
    }
    div.top-banner-logo {
        font-size: 32px;
        font-weight: 600;
    }
    ul.top-banner-group {
        li {
            float: left;
            cursor: pointer;
            user-select: none;
            &:hover {
                color: @hoverHeaderColor;
                transition: all 0.3s linear;
            }
        }
        li.active:hover {
            background: @activedHeaderBgColor;
            color: @activedHeaderColor;
            transition: none;
        }
        &::after {
            content: "";
            display: table;
            clear: both;
        }
    }
}
.top-banner::after {
    content: "";
    display: table;
    clear: both;
}
div.top-banner-logo {
    width: 20%;
}
div.top-banner-nav {
    width: 60%;
    li {
        width: 18%;
    }
    .advanced-setting {
        padding: 0 20px;
    }
}
div.top-banner-user {
    width: 20%;
    li {
        width: 50%;
        padding: 0 12px;
        box-sizing: border-box;
        overflow: hidden;
        text-overflow: ellipsis;
        &:hover {
            color: @hoverHeaderColor;
            transition: all 0.3s linear;
        }
    }
}
li.active {
    background: @activedHeaderBgColor;
    color: @activedHeaderColor;
}
.top-banner-logo a {
    border: none;
    font-size: 42px;
    font-weight: bold;
    color: @logoColor;
    background: @logoBgColor;
    padding: 0;
    width: 100%;
    height: 100%;
    line-height: 70px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: bottom;
    &:active {
        border: none;
        outline: none;
    }
    &:focus {
        border: none;
        outline: none;
    }
}
</style>
