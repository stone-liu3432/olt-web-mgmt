<template>
    <div class="onu-batch-upgrade">
        <h2>{{ lanMap['onu_batch_upgrade'] }}</h2>
        <div>
            <hr />
            <div class="onu-type-mgmt">
                <h3>{{ lanMap['upgrade_type_mgmt'] }}</h3>
                <div>
                    <a href="javascript:void(0);" @click="open_otp_dialog(1)">{{ lanMap['add'] }}</a>
                    <a href="javascript:void(0);" @click="open_otp_dialog(0)">{{ lanMap['delete'] }}</a>
                    <a
                        href="javascript:void(0);"
                        @click="open_bind_modal"
                    >{{ lanMap['onu_bind_upgrade_type'] }}</a>
                </div>
                <div>
                    <span>{{ lanMap['current_upgrade_type'] + '：' }}</span>
                    <span
                        v-if="upgrade_type.data && upgrade_type.data.length > 0"
                    >{{ upgrade_type.data.toString() }}</span>
                    <span v-else>{{ lanMap['no_upgrade_type'] }}</span>
                </div>
            </div>
            <br />
            <hr />
            <div class="onu-type-mgmt">
                <h3>{{ lanMap['onu_batch_upgrade'] }}</h3>
                <div class="onu-upgrade">
                    <span>{{ lanMap['file_click'] }}</span>
                    <form class="upload-form">
                        <input
                            type="file"
                            id="onu-upgrade-file"
                            class="hide"
                            @change="changeFile('onu-upgrade-file','onu-upgrade-filename')"
                        />
                        <span
                            class="updateFile"
                            id="onu-upgrade-filename"
                        >{{ lanMap['file_click'] }}</span>
                    </form>
                </div>
                <div class="onu-upgrade">
                    <span>{{ lanMap['select_upgrade_type'] }}</span>
                    <select v-model="param_otp" v-if="upgrade_type.data">
                        <option value>{{ lanMap['choose'] }}</option>
                        <option
                            :value="item"
                            v-for="(item,index) in upgrade_type.data"
                            :key="index"
                        >{{ item }}</option>
                    </select>
                    <span v-else>{{ lanMap['no_upgrade_type'] }}</span>
                </div>
                <div class="onu-upgrade">
                    <span>{{ lanMap['port_id'] }}</span>
                    <select v-model.number="param_pid">
                        <option value="0">{{ lanMap['choose'] }}</option>
                        <option
                            :value="item.id"
                            v-for="(item,key) in port_name.pon"
                            :key="key"
                        >{{ item.name }}</option>
                    </select>
                </div>
                <div class="onu-upgrade">
                    <a href="javascript:void(0);" @click="open_cfm_upgrade">{{ lanMap['apply'] }}</a>
                </div>
            </div>
        </div>
        <div class="modal-dialog" v-if="show_otp_modal">
            <div class="cover"></div>
            <div class="onu-type-modal">
                <h3 v-if="show_add_modal" class="modal-header">{{ lanMap['add_onu_type'] }}</h3>
                <h3 v-else class="modal-header">{{ lanMap['del_onu_type'] }}</h3>
                <div>
                    <span>{{ lanMap['upgrade_type'] }}</span>
                    <input
                        v-if="show_add_modal"
                        v-focus
                        v-model.trim="add_otp"
                        type="text"
                        :style="{ 'border-color' : add_otp !== '' && !reg_otp.test(add_otp) ? 'red' : ''}"
                        placeholder="4-32 characters"
                    />
                    <select
                        v-if="!show_add_modal && otp_list.length && otp_list.length > 0"
                        v-model="del_otp"
                    >
                        <option value>{{ lanMap['choose'] }}</option>
                        <option
                            :value="item"
                            v-for="(item,index) in upgrade_type.data"
                            :key="index"
                        >{{ item }}</option>
                    </select>
                    <span
                        v-if="!show_add_modal && !upgrade_type.data"
                    >{{ lanMap['no_upgrade_type'] }}</span>
                </div>
                <p v-if="show_add_modal">{{ lanMap['onu_upgrade_tips'] }}</p>
                <p v-else></p>
                <div v-if="show_add_modal">
                    <a href="javascript:void(0);" @click="add_otp_submit">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" @click="close_otp_dialog">{{ lanMap['cancel'] }}</a>
                </div>
                <div v-else>
                    <a href="javascript:void(0);" @click="del_otp_submit">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" @click="close_otp_dialog">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="close_otp_dialog"></div>
            </div>
        </div>
        <div class="modal-dialog" v-if="show_select_modal">
            <div class="cover"></div>
            <div class="bind-upgrade-type">
                <div>
                    <h3>{{ lanMap['onu_bind_upgrade_type'] }}</h3>
                    <div>
                        <span>{{ lanMap['upgrade_type'] }}：</span>
                        <select v-if="otp_list.length && otp_list.length > 0" v-model="bind_otp">
                            <option value>{{ lanMap['choose'] }}</option>
                            <option
                                :value="item"
                                v-for="(item,index) in otp_list"
                                :key="index"
                            >{{ item }}</option>
                        </select>
                        <span v-else>{{ lanMap['no_upgrade_type'] }}</span>
                    </div>
                    <div>
                        <span>{{ lanMap['port_id'] }}：</span>
                        <select v-model.number="portid">
                            <option value="0">{{ lanMap['choose'] }}</option>
                            <option
                                :value="item.id"
                                v-for="(item,key) in port_name.pon"
                                :key="key"
                            >{{ item.name }}</option>
                        </select>
                    </div>
                    <div class="onu-list">
                        <ul>
                            <li>
                                <input
                                    type="checkbox"
                                    id="checked-otp"
                                    v-model="checked_otp"
                                    @click="change_ck_all_state"
                                />
                            </li>
                            <li>{{ lanMap['onu_name'] }}</li>
                            <li>{{ lanMap['vendor'] }}</li>
                            <li>{{ lanMap['sn_model'] }}</li>
                            <li>{{ lanMap['chip_model'] }}</li>
                            <li>{{ lanMap['onu_chip'] }}</li>
                            <li>{{ lanMap['software_ver'] }}</li>
                            <li>{{ lanMap['upgrade_type'] }}</li>
                        </ul>
                        <ul
                            v-if="port_bind_type.length"
                            v-for="(item,index) in port_bind_type"
                            :key="index"
                        >
                            <li>
                                <input
                                    type="checkbox"
                                    :value="item.onu_id"
                                    name="checked-onu-bind"
                                    v-model="bind_onu"
                                />
                            </li>
                            <li
                                :title="item.onu_name || 'ONU0' + item.port_id + '/' + item.onu_id"
                            >{{ item.onu_name || 'ONU0' + item.port_id + '/' + item.onu_id }}</li>
                            <li :title="item.vendor || ' - '">{{ item.vendor || ' - ' }}</li>
                            <li :title="item.sn_mode || ' - '">{{ item.sn_mode || ' - ' }}</li>
                            <li :title="item.chip_model || ' - '">{{ item.chip_model || ' - ' }}</li>
                            <li :title="item.onu_chip || ' - '">{{ item.onu_chip || ' - ' }}</li>
                            <li :title="item.software_ver || ' - '">{{ item.software_ver || ' - ' }}</li>
                            <li :title="item.upgrade_type || ' - '">{{ item.upgrade_type || ' - ' }}</li>
                        </ul>
                    </div>
                    <div class="onu-upgrade-dialog-btn-group">
                        <a href="javascript:void(0);" @click="submit_upgrade">{{ lanMap['apply'] }}</a>
                        <a
                            href="javascript:void(0);"
                            @click="close_bind_modal"
                        >{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="close_bind_modal"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "onuBatchUpgrade",
    computed: {
        ...mapState(["lanMap", "port_name", "change_url"])
    },
    data() {
        return {
            upgrade_type: {},
            // otp  --> onu type
            otp_list: [],
            //  待添加的升级类型
            add_otp: "",
            //  将要删除的升级类型
            del_otp: "",
            //  升级提交时，选择的升级类型
            param_otp: "",
            //  绑定升级类型
            bind_otp: "",
            //  模态框 显示/隐藏 控制*4
            show_otp_modal: false,
            show_add_modal: false,
            show_select_modal: false,
            //  输入框正则，4-32位大小写字母，数字或者 -
            reg_otp: /^[a-zA-Z0-9-]{4,32}$/,
            upgrade_file: "",
            //  提交时选择的端口号
            param_pid: 0,
            //  全局端口号，用于获取数据
            portid: 0,
            //  所有PON口下的ONU列表
            onu_base_info: {},
            //  单个PON口下的所有onu信息
            port_bind_type: [],
            //  选中的onu
            bind_onu: [],
            checked_otp: false
        };
    },
    created() {
        this.get_upgrade_type();
        //this.get_onu_baseinfo();
    },
    methods: {
        get_upgrade_type() {
            this.$http
                .get("/onu_upgrade?form=upgrade_type")
                .then(res => {
                    if (res.data.code === 1) {
                        this.upgrade_type = res.data;
                        if (this.upgrade_type.data) {
                            this.otp_list = this.upgrade_type.data;
                        }
                    } else {
                        this.upgrade_type = {};
                        this.otp_list = [];
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        //  打开 添加/删除 模态框
        open_otp_dialog(type) {
            if (!type && (!this.otp_list.length || this.otp_list.length < 1)) {
                this.$message({
                    type: "error",
                    text: this.lanMap["no_upgrade_type"]
                });
                return;
            }
            this.show_otp_modal = true;
            if (type) {
                this.show_add_modal = true;
            } else {
                this.show_add_modal = false;
            }
        },
        //  添加提交
        add_otp_submit() {
            if (!this.reg_otp.test(this.add_otp)) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["upgrade_type"]
                });
                return;
            }
            var post_params = {
                method: "add",
                param: {
                    upgrade_type: this.add_otp
                }
            };
            this.$http
                .post("/onu_upgrade?form=upgrade_type", post_params)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"]
                        });
                        this.get_upgrade_type();
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message
                        });
                    }
                })
                .catch(err => {
                    // to do
                });
            this.close_otp_dialog();
        },
        //  删除提交
        del_otp_submit() {
            if (!this.del_otp) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["upgrade_type"]
                });
                return;
            }
            var post_params = {
                method: "delete",
                param: {
                    upgrade_type: this.del_otp
                }
            };
            this.$http
                .post("/onu_upgrade?form=upgrade_type", post_params)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["etting_ok"]
                        });
                        this.get_upgrade_type();
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message
                        });
                    }
                })
                .catch(err => {
                    // to do
                });
            this.close_otp_dialog();
        },
        close_otp_dialog() {
            this.show_otp_modal = false;
            this.show_add_modal = false;
            this.add_otp = "";
            this.del_otp = "";
        },
        //  文件选择框
        changeFile(fileid, fnameid) {
            var file = document.getElementById(fileid);
            var fileName = document.getElementById(fnameid);
            var files = file.files[0];
            fileName.innerText = file.value.substring(
                file.value.lastIndexOf("\\") + 1
            );
            this.upgrade_file = fileName.innerText;
            if (!files) {
                fileName.innerText = this.lanMap["file_click"];
                return;
            }
        },
        open_cfm_upgrade() {
            if (!this.upgrade_file) {
                this.$message({
                    type: "error",
                    text: this.lanMap["file_not_select"]
                });
                return;
            }
            if (!this.param_otp) {
                this.$message({
                    type: "error",
                    text: this.lanMap["no_upgrade_type"]
                });
                return;
            }
            if (!this.param_pid) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["port_id"]
                });
                return;
            }
            this.$confirm()
                .then(_ => {
                    this.upload_file();
                })
                .catch(_ => {});
        },
        //  上传文件
        upload_file() {
            var formData = new FormData();
            var file = document.getElementById("onu-upgrade-file");
            var files = file.files[0];
            formData.append("file", files);
            this.$http
                .post("/onu_upload?type=" + this.param_otp, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    timeout: 0
                })
                .then(res => {
                    if (res.data.code === 1) {
                        this.start_upgrade_onu();
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message
                        });
                    }
                })
                .catch(error => {
                    // to do
                });
        },
        //  文件上传成功，开始进行升级
        start_upgrade_onu() {
            var post_params = {
                method: "set",
                param: {
                    port_id: this.param_pid,
                    onu_id: 0,
                    upgrade_type: this.param_otp
                }
            };
            this.$http
                .post("/onu_upgrade?form=upgrade", post_params)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["onu_upgrade_start"]
                        });
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message
                        });
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        get_onu_baseinfo() {
            this.$http
                .get(this.change_url.get_onu_baseinfo)
                .then(res => {
                    if (res.data.code === 1) {
                        this.onu_base_info = res.data;
                    } else {
                        this.onu_base_info = {};
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        //  打开ONU绑定升级类型模态框
        open_bind_modal() {
            if (!this.otp_list.length || this.otp_list.length < 1) {
                this.$message({
                    type: "error",
                    text: this.lanMap["no_upgrade_type"]
                });
                return;
            }
            this.show_select_modal = true;
            this.get_onu_baseinfo();
        },
        close_bind_modal() {
            this.show_select_modal = false;
            this.bind_onu = [];
            this.portid = 0;
            this.bind_otp = "";
        },
        //  全选/反选 按钮
        change_ck_all_state() {
            this.checked_otp = !this.checked_otp;
            this.bind_onu = [];
            if (this.checked_otp) {
                var olist = document.getElementsByName("checked-onu-bind");
                olist.forEach(item => {
                    this.bind_onu.push(item.value);
                });
            }
        },
        //  ONU绑定升级类型，提交时的操作
        submit_upgrade() {
            if (!this.bind_otp) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["upgrade_type"]
                });
                return;
            }
            if (!this.portid) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["port_id"]
                });
                return;
            }
            if (!this.bind_onu.length) {
                this.$message({
                    type: "info",
                    text: this.lanMap["no_select_onu"]
                });
                return;
            }
            var post_params = {
                method: "set",
                param: {
                    port_id: this.portid,
                    onu_list: this.bind_onu,
                    upgrade_type: this.bind_otp
                }
            };
            this.$http
                .post("/onu_upgrade?form=bind_upgrade_type", post_params)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"]
                        });
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message
                        });
                    }
                })
                .catch(err => {
                    // to do
                });
            this.close_bind_modal();
        }
    },
    watch: {
        portid() {
            this.bind_onu = [];
            if (this.onu_base_info.data) {
                this.port_bind_type = this.onu_base_info.data.filter(item => {
                    return item.port_id === this.portid;
                });
            }
        },
        bind_onu() {
            if (this.bind_onu.length !== this.port_bind_type.length) {
                this.checked_otp = false;
            } else {
                this.checked_otp = true;
            }
        }
    }
};
</script>

<style lang="less" scoped>
a {
    padding: 0 20px;
    height: 30px;
    line-height: 30px;
    border: 1px solid transparent;
    border-radius: 3px;
    &:active {
        border: 1px solid #67aef7;
    }
}
select {
    width: 180px;
    height: 30px;
    line-height: 30px;
    font-size: 15px;
    text-indent: 6px;
    border-radius: 3px;
}
.onu-batch-upgrade {
    margin: 20px 0 0 0;
    h2 {
        font-size: 24px;
        font-weight: 600;
        color: #67aef7;
    }
}
form.upload-form {
    position: relative;
    width: 300px;
    height: 40px;
    display: inline-block;
    vertical-align: middle;
    input {
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
        background: #eee;
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
}
.onu-type-mgmt {
    margin: 20px 0;
    h3 {
        font-size: 18px;
        margin: 20px 0;
        color: #67aef6;
    }
    > div {
        margin-left: 10px;
    }
    > div + div {
        margin-top: 20px;
    }
}
div.onu-upgrade {
    > span:first-child {
        display: inline-block;
        width: 180px;
    }
    > a {
        padding: 0 50px;
    }
}
div.onu-type-modal {
    width: 500px;
    height: 220px;
    // h3{
    //     height: 60px;
    //     line-height: 60px;
    //     font-size: 20px;
    //     color: #67aef6;
    //     text-indent: 20px;
    // }
    h3 + div {
        margin: 20px 0 10px 30px;
        span:first-child {
            display: inline-block;
            width: 150px;
            text-align: center;
        }
    }
    p {
        font-size: 13px;
        color: #666;
        text-align: center;
        height: 17px;
    }
    div {
        margin-top: 26px;
    }
    a {
        margin: 0 0 0 110px;
    }
    div.close {
        margin: 0;
    }
}
div.bind-upgrade-type {
    // width: 80%;
    min-width: 1024px;
    height: auto;
    //overflow-y: scroll;
    h3 {
        font-size: 20px;
        font-weight: 600;
        color: #67aef7;
        margin: 20px 0;
    }
    > div:first-child {
        margin: 20px;
        div {
            margin: 20px 0 20px 10px;
            > span:first-child {
                display: inline-block;
                width: 150px;
                > input {
                    vertical-align: middle;
                }
            }
        }
        ul {
            &:first-child {
                border-top: 1px solid #ddd;
            }
            border-bottom: 1px solid #ddd;
            &:after {
                content: "";
                display: table;
                clear: both;
            }
            li {
                float: left;
                height: 30px;
                line-height: 30px;
                width: 13%;
                text-align: center;
                overflow: hidden;
                text-overflow: ellipsis;
                &:first-child {
                    width: 50px;
                    text-align: center;
                }
            }
        }
        div.onu-upgrade-dialog-btn-group {
            text-align: center;
            margin-top: 30px;
            a {
                margin: 0 50px;
                padding: 0 50px;
            }
        }
        div.onu-list {
            max-height: 330px;
            overflow-y: auto;
        }
    }
}
</style>
