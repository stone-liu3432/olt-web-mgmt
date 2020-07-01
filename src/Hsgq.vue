<template>
    <div id="hsgq" v-if="lanMap">
        <router-view></router-view>
        <loading v-if="isLoading"></loading>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import loading from "@/components/common/loading";
import zh from "@/config/lang_zh";
import en from "@/config/lang_en";
export default {
    name: "hsgq",
    components: { loading },
    data() {
        return {
            lang: {
                zh: {},
                en: {}
            }
        };
    },
    created() {
        this.lang = {
            zh,
            en
        };
        var def_lang = sessionStorage.getItem("def_lang");
        if (def_lang) {
            this.set_language(def_lang);
            this.add_lanMap(this.lang[def_lang]);
        } else {
            this.$http
                .get(this.change_url.get_lang)
                .then(res => {
                    if (res.data.code === 1) {
                        const lang = res.data.data.lang || "en";
                        this.set_language(lang.replace(/[\r\n\s]/g, ""));
                        //  缓存用户选择的语言类型，防止用户手动刷新数据消失
                        sessionStorage.setItem(
                            "def_lang",
                            lang.replace(/[\r\n\s]/g, "")
                        );
                    } else {
                        this.set_language("en");
                        sessionStorage.setItem("def_lang", "en");
                    }
                })
                .catch(err => {
                    // to do
                });
        }
        this.http_interceptors();
    },
    methods: {
        ...mapMutations({
            add_lanMap: "updateLanMap",
            loading: "updateLoading",
            set_language: "updateLang"
        }),
        //  http响应拦截器，如返回登录超时或登录信息异常时进行强制跳转
        http_interceptors() {
            this.$http.interceptors.response.use(
                response => {
                    //  返回 0 ，非法登录信息
                    if (response.data.code === 0) {
                        this.$message({
                            type: "error",
                            text: this.lanMap["illegal_login_info"]
                        });
                        sessionStorage.clear();
                        this.$router.push("/login");
                    }
                    //  返回 -1，登录超时
                    if (response.data.code === -1) {
                        this.$message({
                            type: "error",
                            text: this.lanMap["login_timeout"]
                        });
                        sessionStorage.clear();
                        this.$router.push("/login");
                    }
                    if (response.data.code > 1) {
                        if (/^\s*error/i.test(response.data.message)) {
                            response.data.type = "error";
                        } else if (/^\s*warning/i.test(response.data.message)) {
                            response.data.type = "warning";
                        } else {
                            response.data.type = "info";
                        }
                    } else if (response.data.code === 1) {
                        response.data.type = "success";
                    }
                    return response;
                },
                err => {
                    return Promise.reject(err);
                }
            );
        }
    },
    computed: {
        ...mapState([
            "port_info",
            "system",
            "isLoading",
            "language",
            "change_url",
            "lanMap"
        ])
    },
    watch: {
        language() {
            this.add_lanMap(this.lang[this.language]);
            sessionStorage.setItem("def_lang", this.language);
        }
    }
};
</script>

<style lang="less">
//  #184777
//  #2C72BB
//  #E0EFE7
body {
    background: @bgColor;
    overflow-y: hidden;
}
#hsgq {
    font-family: Arial, "Avenir", Helvetica, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
    width: 100%;
    min-width: 1280px;
    max-width: 1980px;
    font-size: 16px;
}
.global-load {
    display: none;
}
html,
body {
    height: 100%;
}
/**************** RESET STYLE****************/
body,
div,
dl,
dt,
dd,
ul,
ol,
li,
h1,
h2,
h3,
h4,
h5,
h6,
pre,
form,
fieldset,
input,
textarea,
p,
blockquote,
th,
td {
    padding: 0;
    margin: 0;
}
table {
    border-collapse: collapse;
    border-spacing: 0;
}
fieldset,
img {
    border: 0;
}
address,
caption,
cite,
code,
dfn,
em,
strong,
th,
var {
    font-weight: normal;
    font-style: normal;
}
ol,
ul {
    list-style: none;
}
caption,
th {
    text-align: left;
}
h1,
h2,
h3,
h4,
h5,
h6 {
    font-weight: normal;
    font-size: 100%;
}
q:before,
q:after {
    content: "";
    /*content:none;*/
}
abbr,
acronym {
    border: 0;
}
.lf {
    float: left;
}
.rt {
    float: right;
}
select {
    border: 1px solid @formBorderColor;
    padding-left: 10px\9\0;
}
.flex-box {
    display: flex;
}
input[type="text"] {
    text-indent: 10px;
    font-size: 16px;
    height: 30px;
    line-height: 30px;
    border: 1px solid @formBorderColor;
    border-radius: 3px;
    color: @formColor;
    outline: 0;
    text-decoration: none;
}
input[type="text"]:focus {
    border: 1px solid @activedFormBorderColor;
    border-radius: 3px;
}
select {
    border-radius: 3px;
    font-size: 16px;
    height: 30px;
    line-height: 30px;
    text-indent: 6px;
    &:focus {
        outline: none;
    }
}
a {
    border: 1px solid transparent;
    user-select: none;
    text-decoration: none;
    border-radius: 3px;
    font-size: 16px;
    display: inline-block;
    padding: 0 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    background: @buttonBgColor;
    color: @buttonColor;
    vertical-align: middle;
    transition: all 0.2s linear;
}
a:hover {
    color: @hoverButtonColor;
}
a:active {
    border: 1px solid @activedButtonBorderColor;
    background: @activedButtonBgColor;
}
i {
    user-select: none;
}
/* 复用模态框类 */
.modal-dialog {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    min-width: 896px;
    height: 100%;
    z-index: 99999;
    overflow-y: auto;
    margin: 0 !important;
}
.cover {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background: @modalCoverBgColor;
    opacity: 0.5;
    z-index: 999;
}
.close {
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    cursor: pointer;
    background: url("./assets/close_msg.png") no-repeat;
}
.close:hover {
    background: url("./assets/close_msg_hover.png") no-repeat;
}
div.cover + div {
    z-index: 1000;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 400px;
    background: @modalContentBgColor;
    border-radius: 5px;
    .modal-header {
        box-sizing: border-box;
        width: 100%;
        height: 60px;
        line-height: 60px;
        font-size: 18px;
        font-weight: 600;
        color: @titleColor;
        text-indent: 10px;
        padding: 0 20px;
        border-bottom: 2px solid #ddd;
    }
}
a.btn-text {
    background: transparent;
    color: @textBtnColor;
    width: auto;
    height: auto;
    line-height: initial;
    padding: 6px 6px;
    &:hover {
        color: @hoverTextBtnColor;
    }
    &:active {
        border-color: transparent;
        color: @textBtnColor;
    }
}
.flexible-layout {
    display: flex;
}
.flex-evenly {
    justify-content: space-evenly;
}
td a.btn-text {
    padding: 0 6px;
}
</style>
