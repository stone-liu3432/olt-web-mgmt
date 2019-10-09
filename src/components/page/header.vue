<template>
    <!-- <div class="top-banner">
      <div class="top-banner-logo lf" v-if="system.data">
            <img v-if="has_logo" id="logo">
            <a href="#" v-else>{{ system.data.vendor ? system.data.vendor.length > 16 ? system.data.vendor.substring(0,16) : system.data.vendor : "HSGQ"  }}</a>
      </div>
      <h1 class="lf">|</h1>
      <div class="product-type lf" v-if="system.data">{{ system.data.product_name }}</div>
      <div class="user-login rt">
        <div class="change-lang lf">
            <span>{{ lanMap['lang'] }}</span>
            <select v-model="lang">
                <option value="zh">简体中文</option>
                <option value="en">English</option>
            </select>
        </div>
        <div class="lf show-user">
          <i></i>
          <span>{{ uName }}</span>
        </div>
        <div class="lf log-out" @click="login_out">
          <i></i>
          <span>{{ lanMap['logout'] }}</span>
        </div>
      </div>
      <div class="modal-dialog" v-if="false">
          <div class="cover"></div>
          <div class="modal-body">
              <div class="close"></div>
          </div>
      </div>
      <confirm :tool-tips="lanMap['logout'] + '?'" @choose="result" v-if="login_out_modal"></confirm>
    </div>-->
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
                    :class="{ 'active' : item === nav_menu }"
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
        <confirm :tool-tips="lanMap['logout'] + '?'" @choose="result" v-if="login_out_modal"></confirm>
        <confirm
            :tool-tips="lanMap['save_cfg_confirm']"
            @choose="savecfg_result"
            v-if="savecfgConfirm"
        ></confirm>
        <loading class="load" v-if="isLoading"></loading>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
const f_menu = ["status", "onu_allow", "vlan_mgmt", "advanced_setting"];
import loading from "@/components/common/loading";
export default {
    name: "topBanner",
    computed: mapState([
        "system",
        "lanMap",
        "language",
        "menu",
        "change_url",
        "nav_menu"
    ]),
    data() {
        return {
            //lang: '',
            uName: "",
            login_out_modal: false,
            has_logo: true,
            f_menu: f_menu,
            savecfgConfirm: false,
            isLoading: false
        };
    },
    components: { loading },
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
            this.login_out_modal = true;
        },
        //  退出登录
        result(bool) {
            if (bool) {
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
                        this.$router.push("/login");
                    })
                    .catch(err => {
                        // to do
                    });
            }
            this.login_out_modal = false;
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
            this.savecfgConfirm = true;
        },
        savecfg_result(bool) {
            if (bool) {
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
            }
            this.savecfgConfirm = false;
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
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    background: #184777;
    color: #fff;
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
                color: rgb(204, 131, 102);
                transition: all 0.3s linear;
            }
        }
        li.active:hover {
            background: #e0efe7;
            color: #000;
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
        width: 20%;
    }
}
div.top-banner-user {
    width: 20%;
    li {
        width: 33%;
        overflow: hidden;
        text-overflow: ellipsis;
        &:hover {
            color: rgb(204, 131, 102);
            transition: all 0.3s linear;
        }
    }
}
li.active {
    background: #e0efe7;
    color: #000;
}

//   .top-banner h1{
//     font-size:42px;
//     line-height:70px;
//   }
//   .top-banner-logo{
//     min-width:200px;
//     max-width: 400px;
//     height:70px;
//     line-height:70px;
//     text-align: center;
//     padding: 0 20px;
//   }
.top-banner-logo a {
    border: none;
    font-size: 42px;
    font-weight: bold;
    color: #fff;
    background: transparent;
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
//   .product-type{
//     width:200px;
//     height:70px;
//     font-size:20px;
//     line-height:70px;
//     text-align: center;
//   }
//   div.user-login div{
//     width:150px;
//     text-align: center;
//     height:70px;
//     line-height:70px;
//     font-size:16px;
//     cursor:pointer;
//   }
//   div.user-login>div.change-lang{
//     width: 240px;
//     margin-right: 20px;
//     >span{
//         margin-right: 10px;
//         display: inline-block;
//         width: 80px;
//         color: #fff;
//         text-align: right;
//         padding-right: 10px;
//     }
//     >select{
//         vertical-align: middle;
//         width: 120px;
//         height: 30px;
//         font-size: 16px;
//         text-indent: 10px;
//         border-radius: 5px;
//     }
// }
// div.modal-body{
//     width: 500px;
//     height: 300px;
//     background: #fff;
//     position: absolute;
//     top: 0;
//     left: 0;
//     right: 0;
//     bottom: 0;
//     margin: auto;
//     border-radius: 10px;
// }
// div.log-out{
//     vertical-align: middle;
//     >i{
//         display: inline-block;
//         vertical-align: middle;
//         width: 32px;
//         height: 32px;
//         background: url('../../assets/logout.png') no-repeat;
//     }
// }
// div.show-user{
//     vertical-align: middle;
//     >i{
//         display: inline-block;
//         vertical-align: middle;
//         width: 32px;
//         height: 32px;
//         background: url('../../assets/user.png') no-repeat;
//     }
// }
</style>
