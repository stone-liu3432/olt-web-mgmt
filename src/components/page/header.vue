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
            <ul>
                <li
                    v-for="(item,index) in f_menu"
                    :key="index"
                    @click="nav_click(item)"
                    :class="[{ 'active' : item === nav_menu }, { 'advanced-setting': item === 'advanced_setting' }]"
                >{{ lanMap[item] }}</li>
            </ul>
        </div>
        <div class="top-banner-user lf">
            <ul>
                <li @click="login_out">{{ lanMap['logout'] }}</li>
                <li @click="savecfg">{{ lanMap["save"] }}</li>
                <li @click="user_mgmt">{{ uName }}</li>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
const f_menu = ["status", "topo", "onu_allow", "vlan_mgmt", "advanced_setting"];
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
        ])
    },
    data() {
        return {
            //lang: '',
            uName: "",
            has_logo: true,
            f_menu: f_menu,
        };
    },
    created() {
        this.uName = sessionStorage.getItem("uname");
        this.lang = this.language;
        var first_menu = sessionStorage.getItem("f_menu");
        if (first_menu) {
            this.changeMenu(first_menu);
        } else {
            this.changeMenu("status");
        }
    },
    methods: {
        ...mapMutations({
            addmenu: "updateMenu",
            changeMenu: "updateNavMenu",
            changeAdvMenu: "updateAdvMenu",
            changeFMenu: "updateAdvFMenu"
        }),
        login_out() {
            this.$confirm(this.lanMap['logout'] + ' ?').then(_ => {
                this.result();
            }).catch(_ => {})
        },
        //  退出登录
        result() {
            var post_params = {
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
                    sessionStorage.removeItem('uname');
                    this.$router.push("/login");
                })
                .catch(err => {
                    // to do
                });
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
                    .catch(err => {
                        // to do
                    });
            }
            this.changeMenu(node);
            sessionStorage.setItem("f_menu", node);
        },
        savecfg() {
            this.$confirm(this.lanMap['save_cfg_confirm']).then(_ => {
                this.savecfg_result();
            }).catch(_ => {})
        },
        savecfg_result() {
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
                .catch(err => {
                    // to do
                });
        },
        user_mgmt() {
            this.$router.push("user_mgmt");
        },
        isNoLogo() {
            this.has_logo = false;
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
    ul {
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
    .advanced-setting{
        padding: 0 20px;
    }
}
div.top-banner-user {
    width: 20%;
    li {
        width: 33%;
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
