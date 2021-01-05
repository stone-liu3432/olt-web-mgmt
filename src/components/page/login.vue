<template>
    <div class="login">
        <div class="login-body">
            <div class="login-logo">
                <template v-if="hasLogo">
                    <img src="/login_logo.png" />
                    <template v-if="custom.hsgq">
                        <div class="copyright-design-info">
                            Copyright 2017-2020. Design by HSGQ.
                        </div>
                    </template>
                </template>
                <div :class="['device-type', { 'is-no-logo': !hasLogo }]">
                    EPON-OLT
                </div>
                <div class="device-vendor" v-if="system.data">
                    <span>{{ system.data.product_name }}</span>
                    <span style="color: #000"
                        >{{ `(${system.data.ponports} port OLT)` }}
                    </span>
                </div>
            </div>
            <div class="login-form">
                <h3>{{ lanMap["login_page_login_hit"] }}</h3>
                <form :class="formStyle">
                    <div class="login-form-item">
                        <span>{{ lanMap["user_name"] }}:</span>
                        <input
                            type="text"
                            v-model="userName"
                            :class="[verify_uname ? 'input-error' : '']"
                            v-focus
                        />
                    </div>
                    <div class="login-form-item user-pwd">
                        <span>{{ lanMap["password"] }}:</span>
                        <input
                            type="password"
                            v-model="userPwd"
                            id="userPwd"
                            :class="[verify_upwd ? 'input-error' : '']"
                            autocomplete="off"
                            @keyup.enter="userLogin"
                        />
                        <i
                            :class="[visible ? 'visible' : 'invisible']"
                            @click="changeVisible"
                        ></i>
                    </div>
                    <template v-if="custom.fix_lang === 0">
                        <div class="login-form-item">
                            <span>{{ lanMap["lang"] }}:</span>
                            <label>
                                <input type="radio" v-model="lang" value="zh" />
                                简体中文
                            </label>
                            <label>
                                <input type="radio" v-model="lang" value="en" />
                                English
                            </label>
                        </div>
                    </template>
                    <template v-if="custom.captcha">
                        <div class="login-form-item login-form-captcha">
                            <!-- 有订制要求，需要验证码时 -->
                            <span>{{ lanMap["verification_code"] }}:</span>
                            <img @click="getCaptcha" ref="captcha-img" />
                            <input type="text" v-model="captcha" />
                        </div>
                    </template>

                    <p>
                        <template v-if="verify_uname">{{
                            lanMap["username_length_fail"]
                        }}</template>
                    </p>
                    <p>
                        <template v-if="verify_upwd">{{
                            lanMap["password_length_fail"]
                        }}</template>
                    </p>
                    <div class="login-form-submit">
                        <a href="javascript: void(0);" @click="userLogin">{{
                            lanMap["login_user"]
                        }}</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import md5 from "md5";
import { mapState, mapMutations, mapActions } from "vuex";
import { clearSessionStorage } from "@/utils/common";
export default {
    name: "login",
    data() {
        return {
            userName: "",
            userPwd: "",
            //  密码可见或不可见
            visible: false,
            //  语言选项
            lang: "",
            captchaSrc: "",
            captcha: "",
            hasLogo: false,
            system: {},
        };
    },
    computed: {
        ...mapState(["lanMap", "language", "custom"]),
        verify_uname() {
            const reg = /^[a-zA-Z][a-zA-Z_\d]{3,15}$/;
            return !reg.test(this.userName) && this.userName !== "";
        },
        verify_upwd() {
            const reg = /^[^\s\?\\\/\'\"]{5,16}$/;
            return !reg.test(this.userPwd) && this.userPwd !== "";
        },
        formStyle() {
            if (this.custom.fix_lang && !this.custom.captcha) {
                return "large-gutter";
            }
            if (
                (this.custom.fix_lang && this.custom.captcha) ||
                (!this.custom.fix_lang && !this.custom.captcha)
            ) {
                return "medium-gutter";
            }
        },
    },
    created() {
        this.lang = this.language;
        this.updateCustom();
        this.updateSystem();
        clearSessionStorage();
        this.$http
            .get("/login_logo.png")
            .then((res) => {
                this.hasLogo = true;
            })
            .catch((err) => {
                this.hasLogo = false;
            });
    },
    methods: {
        ...mapMutations({
            setLanguage: "updateLang",
        }),
        ...mapActions(["updateCustom"]),
        userLogin() {
            if (
                this.verify_uname ||
                this.verify_upwd ||
                this.userName === "" ||
                this.userPwd === "" ||
                (this.captchaSrc && !this.captcha)
            ) {
                return;
            }
            var self = this;
            this.$http({
                url: "/userlogin?form=login",
                method: "POST",
                data: {
                    method: "set",
                    param: {
                        name: this.userName,
                        key: md5(self.userName + ":" + self.userPwd),
                        captcha_v: this.captcha || "",
                        captcha_f: this.captchaSrc || "",
                    },
                },
                timeout: 5000,
            })
                .then((res) => {
                    // this.userPwd = "";
                    if (res.data.code === 1) {
                        sessionStorage.setItem(
                            "x-token",
                            res.headers["x-token"]
                        );
                        sessionStorage.setItem("uname", this.userName);
                        this.$message({
                            type: "success",
                            text:
                                this.lanMap["login_success"] +
                                "," +
                                this.userName,
                        });
                        this.$router.push("/main");
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: "error",
                            text: "(" + res.data.code + ") " + res.data.message,
                        });
                    }
                })
                .catch((err) => {
                    // 登录超时时的处理，默认为5秒无响应超时
                    this.$message({
                        type: "error",
                        text: this.lanMap["http_login_timeout"],
                    });
                });
        },
        changeVisible() {
            this.visible = !this.visible;
            var uPwd = document.getElementById("userPwd");
            if (this.visible) {
                uPwd.type = "text";
            } else {
                uPwd.type = "password";
            }
        },
        getCaptcha() {
            this.captchaSrc = "";
            this.$http
                .get("/system_captcha")
                .then((res) => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            const fname = res.data.data.filename;
                            this.$refs["captcha-img"].src = fname;
                            this.captchaSrc = fname;
                        }
                    }
                })
                .catch((err) => {});
        },
        updateSystem() {
            this.$http.get("/board_info").then((res) => {
                if (res.data.code === 1) {
                    this.system = res.data;
                }
            });
        },
    },
    watch: {
        lang(nv, ov) {
            if (this.custom.fix_lang || ov === "") {
                return;
            }
            this.setLanguage(this.lang);
            sessionStorage.setItem("def_lang", this.lang);
            const data = {
                method: "set",
                param: {
                    lang: this.lang,
                },
            };
            this.$http
                .post("/system_lang", data)
                .then((res) => {})
                .catch((err) => {});
        },
        language() {
            this.lang = this.language;
        },
        custom() {
            if (this.custom.captcha) {
                this.getCaptcha();
            }
        },
    },
};
</script>

<style scoped lang="less">
div.login {
    width: 100%;
    min-width: 1280px;
    height: 100%;
    min-height: 768px;
    background: #6c6d69;
    div.login-banner {
        height: 90px;
    }
    div.login-body {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        margin: auto;
        width: 700px;
        height: 400px;
        background: #fff;
        border-radius: 8px;
        div.login-logo {
            float: left;
            width: 300px;
            height: 100%;
            box-sizing: border-box;
            border-radius: 8px 0 0 8px;
            border-right: 1px solid @borderColor;
            text-align: center;
            position: relative;
            img {
                max-width: 298px;
                max-height: 240px;
                vertical-align: middle;
            }
            div.is-no-logo {
                margin-top: 160px;
            }
            div.device-type {
                font-size: 42px;
                font-weight: 600;
                text-align: center;
                color: @titleColor;
            }
            div.copyright-design-info {
                position: absolute;
                bottom: 6px;
                left: 0;
                width: 100%;
                height: 32px;
                line-height: 32px;
                text-align: center;
                font-size: 14px;
                color: @infoColor;
            }
            div.device-vendor {
                color: @titleColor;
                font-weight: bold;
                margin-top: 12px;
                font-size: 18px;
            }
        }
    }
    h3 {
        font-size: 14px;
        height: 60px;
        line-height: 60px;
        color: #49a3ff;
        text-align: center;
    }
    &::after {
        content: "";
        display: table;
        clear: both;
    }
}
div.login-form {
    float: left;
    width: 400px;
    height: 400px;
    padding: 20px 0;
    box-sizing: border-box;
    border-radius: 0 8px 8px 0;
    p {
        height: 28px;
        color: red;
        font-size: 12px;
        padding: 0px 20px;
        box-sizing: border-box;
        text-align: center;
    }
    div.login-form-item {
        margin: 6px 0;
        height: 36px;
        line-height: 36px;
        span {
            display: inline-block;
            vertical-align: middle;
            width: 100px;
            text-align: right;
            padding: 0 8px 0 0;
            box-sizing: border-box;
        }
        img {
            width: 120px;
            height: 32px;
            vertical-align: middle;
            border: 1px solid @borderColor;
        }
    }
    div.login-form-captcha > input[type="text"] {
        width: 133px;
    }
    div.login-form-submit {
        padding: 10px 0;
        text-align: center;
        a {
            width: 200px;
            height: 36px;
            line-height: 36px;
            background: @hoverButtonColor;
            &:hover {
                color: @buttonColor;
                background: @hoverTextBtnColor;
            }
        }
    }
    form.large-gutter {
        .login-form-item {
            margin-top: 40px;
        }
    }
    form.medium-gutter {
        .login-form-item {
            margin-top: 24px;
        }
    }
}
div.user-pwd {
    position: relative;
}
form i {
    display: inline-block;
    width: 32px;
    height: 32px;
    position: absolute;
    top: 2px;
    right: 40px;
    cursor: pointer;
}
i.invisible {
    background: url("../../assets/invisible.png") no-repeat;
}
i.visible {
    background: url("../../assets/visible.png") no-repeat;
}
input[type="text"],
input[type="password"] {
    width: 260px;
    height: 32px;
    text-indent: 10px;
    border: 1px solid #ccc;
    font-size: 16px;
    border-radius: 3px;
    outline: none;
    &:focus {
        border: 1px solid #1e90ff;
    }
}
label {
    vertical-align: middle;
    & + label {
        margin-left: 20px;
    }
}
input.input-error {
    border-color: red;
    &:focus {
        border-color: red;
    }
}
</style>
