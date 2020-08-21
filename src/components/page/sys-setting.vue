<template>
    <div id="sys-set">
        <div class="change-lang rt">
            <a href="javascript:void(0);" @click="backto_devmgmt">{{ lanMap['goback_devmgmt'] }}</a>
            <template v-if="!custom.fix_lang">
                <span>{{ lanMap['lang'] }}</span>
                <select v-model="lang">
                    <option value="zh">简体中文</option>
                    <option value="en">English</option>
                </select>
            </template>
        </div>
        <h1 class="sys-set-title">{{ lanMap['sysinfo_set'] }}</h1>
        <div class="sys-set-item">
            <h1>login logo</h1>
            <p class="tips">{{ lanMap['imagesize_tips'] }}</p>
            <form>
                <input
                    type="file"
                    name="sys-file"
                    class="hide"
                    ref="login-logo-file"
                    @change="changeFile('loginLogo','login-logo-file', 'login-logo-fileName')"
                    accept="image/png, image/jpg, image/jpeg"
                />
                <span class="updateFile" ref="login-logo-fileName">{{ lanMap['file_click'] }}</span>
                <a
                    href="javascript:void(0);"
                    @click="commit_logo('loginLogo','login-logo-file', 'login-logo-fileName')"
                >{{ lanMap['commit'] }}</a>
            </form>
        </div>
        <div class="sys-set-item">
            <h1>logo</h1>
            <p class="tips">{{ lanMap['logosize_tips'] }}</p>
            <form>
                <input
                    type="file"
                    name="sys-file"
                    class="hide"
                    ref="sys-file"
                    @change="changeFile('logo', 'sys-file', 'sys-fileName')"
                    accept="image/png, image/jpg, image/jpeg"
                />
                <span class="updateFile" ref="sys-fileName">{{ lanMap['file_click'] }}</span>
                <a
                    href="javascript:void(0);"
                    @click="commit_logo('logo', 'sys-file', 'sys-fileName')"
                >{{ lanMap['commit'] }}</a>
            </form>
        </div>
        <div class="sys-set-item">
            <h1>{{ lanMap['company_info'] }}</h1>
            <h3>{{ lanMap['company_name'] }}</h3>
            <input type="text" v-model="company_name" maxlength="128" />
            <br />
            <h3>{{ lanMap['company_addr'] }}</h3>
            <input type="text" v-model="company_addr" maxlength="256" />
            <h3>{{ lanMap['company_email'] }}</h3>
            <input type="text" v-model="company_email" maxlength="32" />
            <h3>{{ lanMap['company_phone'] }}</h3>
            <input type="text" v-model="company_phone" maxlength="32" />
            <h3>{{ lanMap['supplier_info'] }}</h3>
            <input type="text" maxlength="128" v-model="supplier_info" />
        </div>
        <div class="sys-set-item">
            <a href="javascript:void(0);" @click="commit_info">{{ lanMap['commit'] }}</a>
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import loading from "@/components/common/loading";
export default {
    name: "sys_setting",
    components: { loading },
    computed: mapState(["lanMap", "language", "custom"]),
    data() {
        return {
            lang: "zh",
            company_name: "",
            company_addr: "",
            company_email: "",
            company_phone: "",
            supplier_info: "",
        };
    },
    created() {
        this.lang = sessionStorage.getItem("def_lang") || "en";
        if (sessionStorage.getItem("uname") !== "devol") {
            this.$router.back();
        }
    },
    methods: {
        ...mapMutations({
            set_language: "updateLang",
        }),
        backto_devmgmt() {
            this.$router.replace("/main");
        },
        //  选择上传文件
        changeFile(type, ref1, ref2) {
            var file = this.$refs[ref1];
            var fileName = this.$refs[ref2];
            var files = file.files[0];
            if (!files) {
                fileName.innerText = this.lanMap["file_click"];
                return;
            }
            var _this = this;
            var myImg = URL.createObjectURL(files);
            var img = new Image();
            img.src = myImg;
            img.onload = function () {
                if (
                    type === "logo" &&
                    (img.width !== 240 || img.height !== 70)
                ) {
                    file.value = "";
                    fileName.innerText = _this.lanMap["file_click"];
                }
            };
            fileName.innerText = file.value.substring(
                file.value.lastIndexOf("\\") + 1
            );
        },
        commit_logo(type, ref1, ref2) {
            var formData = new FormData();
            var file = this.$refs[ref1];
            var files = file.files[0];
            console.log(files);
            var fileName = this.$refs[ref2];
            if (!files) {
                fileName.innerText = this.lanMap["file_click"];
                this.$message({
                    type: "warning",
                    text: this.lanMap["file_not_select"],
                });
                return;
            }
            // 文件大小限制为 50kb
            const limit = 50;
            if (files.size / 1024 > limit) {
                this.$message({
                    type: "warning",
                    text: this.lanMap["imagesize_tips"],
                });
                return;
            }
            formData.append("file", files);
            const loading = this.$loading();
            const url =
                type === "logo"
                    ? "/upgrade?type=logo"
                    : "/upgrade?type=login_logo";
            this.$http
                .post(url, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    timeout: 0,
                })
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"],
                        });
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: `(${res.data.code}) ${res.data.message}`,
                        });
                    }
                })
                .catch((err) => {})
                .finally((_) => {
                    loading && loading.close();
                });
        },
        commit_info() {
            var post_data = {
                param: {
                    name: this.company_name,
                    addr: this.company_addr,
                    email: this.company_email,
                    phone: this.company_phone,
                    supplier_info: this.supplier_info,
                },
            };
            this.$http
                .post("/board?info=setting_board", post_data)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"],
                        });
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_fail"],
                        });
                    }
                })
                .catch((err) => {
                    // to do
                });
        },
    },
    watch: {
        lang() {
            this.set_language(this.lang);
        },
        language() {
            this.lang = this.language;
        },
    },
};
</script>

<style lang="less" scoped>
#sys-set {
    padding-top: 10px;
}
.sys-set-item {
    padding-left: 30px;
    h2,
    h3,
    input,
    form,
    p,
    > a {
        margin-left: 20px;
    }
}
form {
    position: relative;
    margin: 10px 0;
    height: 40px;
    input[type="file"] {
        width: 300px;
    }
    .updateFile {
        position: absolute;
        left: 0;
        top: 0;
        width: 300px;
        height: 38px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        border: 1px solid #ddd;
        text-align: center;
        line-height: 38px;
        z-index: 9;
        border-radius: 5px;
        background: #ddd;
    }
    .hide {
        height: 40px;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 99;
        opacity: 0;
        cursor: pointer;
    }
    span + a {
        width: 300px;
        height: 38px;
        line-height: 40px;
        padding: 0;
        margin: 0 0 0 330px;
    }
}
input[type="text"] {
    width: 60%;
}
.sys-set-title {
    height: 60px;
    line-height: 80px;
    padding-left: 20px;
    color: #018dff;
}
h2 {
    color: #67aef6;
    font-size: 20px;
    margin: 10px 0;
}
h3 {
    font-size: 18px;
    color: #333;
    margin: 10px 0;
}
p.tips {
    font-size: 15px;
    color: #666;
}
a {
    width: 200px;
    margin: 10px 0;
}
h1 {
    color: #67aef6;
    font-size: 32px;
    height: 60px;
    line-height: 60px;
}
.change-lang {
    margin: 20px 30px 0 0;
    span {
        margin-right: 10px;
        font-weight: 600;
        color: #555;
    }
    select {
        width: 120px;
    }
    a {
        margin-right: 30px;
        width: auto;
        padding: 0 20px;
        background: #20bb44;
    }
}
</style>
