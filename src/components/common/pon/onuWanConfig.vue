<template>
    <div>
        <h3>
            {{ lanMap['wan_connect'] }}
            <select v-model.number="formData.index" style="margin-left: 30px;">
                <option :value="-1">{{ lanMap['create'] }}</option>
                <template v-for="item in wanInfo">
                    <option :value="item.index">{{ item.name }}</option>
                </template>
            </select>
            <a
                href="javascript: void(0);"
                style="margin-left: 60px; height: 28px; line-height: 28px;"
                @click="confirm_clear"
            >{{ lanMap['delete_all'] }}</a>
        </h3>
        <div class="onu-wan-form" v-if="formData.index === -1" style="margin-top: 20px;">
            <div>
                <span>{{ lanMap['name'] }}</span>
                <input
                    type="text"
                    v-model="formData.name"
                    :class="{ 'invalid-input': !valid_name }"
                />
                <span class="tips">4-32 characters</span>
            </div>
        </div>
        <div class="onu-wan-form">
            <div>
                <span>{{ lanMap['ipmode'] }}</span>
                <select v-model.number="formData.ipmode">
                    <template v-for="(item, index) in ipmodes">
                        <option :value="index">{{ item }}</option>
                    </template>
                </select>
            </div>
        </div>
        <div class="onu-wan-form">
            <div>
                <span>{{ lanMap['ctype'] }}</span>
                <select v-model.number="formData.ctype" disabled>
                    <template v-for="(item, index) in ctypes">
                        <option :value="index">{{ item }}</option>
                    </template>
                </select>
            </div>
        </div>
        <div class="onu-wan-form" v-if="formData.ipmode !== 3">
            <div>
                <span>{{ lanMap['mtu'] }}</span>
                <input type="text" v-model.number="formData.mtu" :class="{ 'invalid-input': !valid_mtu }" />
                <span class="tips">Range: 70 - 1500</span>
            </div>
        </div>
        <div class="onu-wan-form">
            <div>
                <span>{{ lanMap['tagmode'] }}</span>
                <div class="switch">
                    <input type="checkbox" v-model="formData.tagmode" />
                    <span :class="{ 'checked' : formData.tagmode }" @click="changeVlanMode"></span>
                </div>
            </div>
        </div>
        <div class="onu-wan-form">
            <div>
                <span>{{ lanMap['vlan_id'] }}</span>
                <input
                    type="text"
                    v-model.number="formData.vlan_id"
                    :disabled="!formData.tagmode"
                    :class="{ 'invalid-input': !valid_vlanid }"
                />
                <span class="tips">Range: 1 - 4094</span>
            </div>
        </div>
        <!-- static IP && DHCP && PPPoE -->
        <div class="onu-wan-form" v-if="formData.ipmode === 0 || formData.ipmode === 1">
            <div>
                <span>{{ lanMap['ipproto'] }}</span>
                <select v-model.number="formData.ipproto" disabled>
                    <template v-for="(item, index) in ipprotos">
                        <option :value="index">{{ item }}</option>
                    </template>
                </select>
            </div>
        </div>
        <!-- static IP && DHCP -->
        <template v-if="formData.ipmode === 0 || formData.ipmode === 1">
            <!-- static IP  -->
            <template v-if="formData.ipmode === 0">
                <div class="onu-wan-form">
                    <div>
                        <span>{{ lanMap['ipaddr'] }}</span>
                        <input
                            type="text"
                            v-model="formData.ipaddr"
                            :class="{ 'invalid-input': !valid_ipaddr }"
                        />
                        <span class="tips">ex: 127.0.0.1</span>
                    </div>
                </div>
                <div class="onu-wan-form">
                    <div>
                        <span>{{ lanMap['ipmask'] }}</span>
                        <input
                            type="text"
                            v-model="formData.ipmask"
                            :class="{ 'invalid-input': !valid_ipmask }"
                        />
                        <span class="tips">ex: 127.0.0.1</span>
                    </div>
                </div>
                <div class="onu-wan-form">
                    <div>
                        <span>{{ lanMap['gateway'] }}</span>
                        <input
                            type="text"
                            v-model="formData.gateway"
                            :class="{ 'invalid-input': !valid_gateway }"
                        />
                        <span class="tips">ex: 127.0.0.1</span>
                    </div>
                </div>
            </template>
            <div class="onu-wan-form">
                <div>
                    <span>{{ lanMap['reqdns'] }}</span>
                    <div class="switch">
                        <input type="checkbox" v-model="formData.reqdns" />
                        <span :class="{ 'checked' : formData.reqdns }" @click="changeDnsMode"></span>
                    </div>
                </div>
            </div>
            <div class="onu-wan-form">
                <div>
                    <span>{{ lanMap['pridns'] }}</span>
                    <input
                        type="text"
                        v-model="formData.pridns"
                        :disabled="!formData.reqdns"
                        :class="{ 'invalid-input': !valid_pridns }"
                    />
                    <span class="tips">ex: 127.0.0.1</span>
                </div>
            </div>
            <div class="onu-wan-form">
                <div>
                    <span>{{ lanMap['secdns'] }}</span>
                    <input
                        type="text"
                        v-model="formData.secdns"
                        :disabled="!formData.reqdns"
                        :class="{ 'invalid-input': !valid_secdns }"
                    />
                    <span class="tips">ex: 127.0.0.1</span>
                </div>
            </div>
        </template>
        <!-- PPPoE -->
        <template v-if="formData.ipmode === 2">
            <div class="onu-wan-form">
                <div>
                    <span>{{ lanMap['user'] }}</span>
                    <input
                        type="text"
                        v-model="formData.user"
                        :class="{ 'invalid-input': !valid_user }"
                    />
                    <span class="tips">4-32 characters</span>
                </div>
            </div>
            <div class="onu-wan-form">
                <div>
                    <span>{{ lanMap['password'] }}</span>
                    <input
                        type="text"
                        v-model="formData.password"
                        :class="{ 'invalid-input': !valid_password }"
                    />
                    <span class="tips">4-32 characters</span>
                </div>
            </div>
            <div class="onu-wan-form">
                <div>
                    <span>{{ lanMap['pppoemode'] }}</span>
                    <select v-model.number="formData.pppoemode">
                        <template v-for="(item, index) in pppoemodes">
                            <option :value="index">{{ item }}</option>
                        </template>
                    </select>
                </div>
            </div>
        </template>
        <div class="onu-wan-form">
            <div>
                <span>{{ lanMap['portmap'] }}</span>
                <label>
                    <input type="checkbox" :value="1" v-model="formData.portmap" />
                    lan 1
                </label>
            </div>
        </div>
        <div class="onu-wan-form">
            <div>
                <span>{{ lanMap['igmpproxy'] }}</span>
                <select v-model.number="formData.igmpproxy">
                    <template v-for="(item, index) in igmpproxys">
                        <option :value="index">{{ lanMap[item] }}</option>
                    </template>
                </select>
            </div>
        </div>
        <div class="onu-wan-btn-group">
            <a href="javascript: void(0);" @click="confirm_submit">{{ lanMap['apply'] }}</a>
            <a
                href="javascript: void(0);"
                :class="{ 'disabled': formData.index === -1 }"
                @click="confirm_delete"
            >{{ lanMap['delete'] }}</a>
        </div>
        <confirm v-if="showConfirm" @choose="result"></confirm>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { testIPAddr } from "@/utils/common";
import confirm from "./../confirm";
export default {
    name: "onuWanConfig",
    components: { confirm },
    props: {
        portData: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            // IP模式：0-static ip, 1-dhcp, 2-pppoe, 3-bridge
            ipmodes: ["Static IP", "DHCP", "PPPoE", "Bridge"],
            //  链接类型,0x1-tr069, 0x2-internet, 0x4-other, 0x8-voice
            ctypes: {
                0x1: "TR069",
                0x2: "INTERNET",
                0x4: "Other",
                0x8: "VOICE"
            },
            //  1-ipv4, 2-ipv6, 3-ipv4/6
            ipprotos: { 1: "IPv4", 2: "IPv6", 3: "IPv4/IPv6" },
            //  0-auto, 1-CHAP, 2-PAP
            pppoemodes: ["AUTO", "CHAP", "PAP"],
            igmpproxys: ["not_concerned", "enable", "disable"],
            //  form
            formData: {
                name: "",
                //  index 值为-1时，表示create，否则为set
                index: -1,
                ipmode: 3,
                ctype: 2,
                igmpproxy: 0,
                ipproto: 1,
                mtu: 1500,
                ipaddr: "",
                ipmask: "",
                gateway: "",
                pppoemode: 1,
                user: "",
                password: "",
                tagmode: 0,
                vlan_id: "",
                reqdns: 0,
                pridns: "",
                secdns: "",
                portmap: []
            },
            handleFlag: "",
            //  重置表单用
            resetData: {},
            cacheForm: {},
            showConfirm: false,
            wanInfo: []
        };
    },
    computed: {
        ...mapState(["lanMap"]),
        portid() {
            return this.portData.portid;
        },
        onuid() {
            return this.portData.onuid;
        },
        valid_ipaddr() {
            if (this.formData.ipmode !== 0) {
                return true;
            }
            return testIPAddr(this.formData.ipaddr);
        },
        valid_ipmask() {
            if (this.formData.ipmode !== 0) {
                return true;
            }
            return testIPAddr(this.formData.ipmask);
        },
        valid_gateway() {
            if (this.formData.ipmode !== 0) {
                return true;
            }
            return testIPAddr(this.formData.gateway);
        },
        valid_user() {
            if (this.formData.ipmode !== 2) {
                return true;
            }
            return /^.{4,32}$/.test(this.formData.user);
        },
        valid_password() {
            if (this.formData.ipmode !== 2) {
                return true;
            }
            return /^.{4,32}$/.test(this.formData.password);
        },
        valid_pridns() {
            if (!this.formData.reqdns) {
                return true;
            }
            return testIPAddr(this.formData.pridns);
        },
        valid_secdns() {
            if (!this.formData.reqdns) {
                return true;
            }
            return (
                testIPAddr(this.formData.secdns) || this.formData.secdns === ""
            );
        },
        valid_mtu() {
            if (this.formData.ipmode === 3) {
                return true;
            }
            return !(
                isNaN(this.formData.mtu) ||
                this.formData.mtu < 70 ||
                this.formData.mtu > 1500
            );
        },
        valid_name() {
            if (this.formData.index !== -1) {
                return true;
            }
            return /^.{4,32}$/.test(this.formData.name);
        },
        valid_vlanid() {
            if (!this.formData.tagmode) {
                return true;
            }
            return !(
                isNaN(this.formData.vlan_id) ||
                this.formData.vlan_id < 1 ||
                this.formData.vlan_id > 4094
            );
        }
    },
    created() {
        //  保存表单的初始化状态
        this.resetData = Object.assign({}, this.formData);
        this.getData();
    },
    methods: {
        getData() {
            this.$http
                .get("/onumgmt?form=wan", {
                    params: { port_id: this.portid, onu_id: this.onuid }
                })
                .then(res => {
                    this.wanInfo = [];
                    if (res.data.code === 1) {
                        if (res.data.data && res.data.data.length) {
                            this.wanInfo = res.data.data;
                            const wan = this.wanInfo[0];
                            this.formData.index = wan.index;
                        }
                    }
                })
                .catch(err => {});
        },
        changeVlanMode() {
            this.formData.tagmode = Number(!this.formData.tagmode);
        },
        changeDnsMode() {
            this.formData.reqdns = Number(!this.formData.reqdns);
        },
        submitForm() {
            this.$http
                .post("/onumgmt?form=wan", this.cacheForm)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: "success",
                            text: this.lanMap["setting_ok"]
                        });
                        this.getData();
                    } else {
                        this.$message({
                            type: res.data.type,
                            text: res.data.message
                        });
                    }
                })
                .catch(err => {});
        },
        resetForm() {
            for (var key in this.resetData) {
                if (this.resetData.hasOwnProperty(key)) {
                    this.formData[key] = this.resetData[key];
                }
            }
        },
        submit_static_ip() {
            if (!this.valid_ipaddr) {
                return this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${
                        this.lanMap["ipaddr"]
                    }`
                });
            }
            if (!this.valid_ipmask) {
                return this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${
                        this.lanMap["ipmask"]
                    }`
                });
            }
            if (!this.valid_gateway) {
                return this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${
                        this.lanMap["gateway"]
                    }`
                });
            }
            if (!this.valid_pridns) {
                return this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${
                        this.lanMap["pridns"]
                    }`
                });
            }
            if (!this.valid_secdns) {
                return this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${
                        this.lanMap["secdns"]
                    }`
                });
            }
            const data = {
                method: this.formData.index === -1 ? "add" : "set",
                param: {
                    port_id: this.portid,
                    onu_id: this.onuid,
                    name: this.formData.name,
                    index: this.formData.index,
                    ipmode: this.formData.ipmode,
                    ctype: this.formData.ctype,
                    mtu: this.formData.mtu,
                    igmpproxy: this.formData.igmpproxy,
                    ipproto: this.formData.ipproto,
                    ipaddr: this.formData.ipaddr,
                    ipmask: this.formData.ipmask,
                    gateway: this.formData.gateway,
                    tagmode: this.formData.tagmode,
                    vlan_id: this.formData.vlan_id,
                    reqdns: this.formData.reqdns,
                    pridns: this.formData.pridns,
                    secdns: this.formData.secdns,
                    portmap: this.formData.portmap
                }
            };
            this.submit(data);
        },
        submit_dhcp() {
            if (!this.valid_pridns) {
                return this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${
                        this.lanMap["pridns"]
                    }`
                });
            }
            if (!this.valid_secdns) {
                return this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${
                        this.lanMap["secdns"]
                    }`
                });
            }
            const data = {
                method: this.formData.index === -1 ? "add" : "set",
                param: {
                    port_id: this.portid,
                    onu_id: this.onuid,
                    name: this.formData.name,
                    index: this.formData.index,
                    ipmode: this.formData.ipmode,
                    ctype: this.formData.ctype,
                    mtu: this.formData.mtu,
                    igmpproxy: this.formData.igmpproxy,
                    ipproto: this.formData.ipproto,
                    tagmode: this.formData.tagmode,
                    vlan_id: this.formData.vlan_id,
                    reqdns: this.formData.reqdns,
                    pridns: this.formData.pridns,
                    secdns: this.formData.secdns,
                    portmap: this.formData.portmap
                }
            };
            this.submit(data);
        },
        submit_pppoe() {
            if (!this.valid_user) {
                return this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${
                        this.lanMap["user"]
                    }`
                });
            }
            if (!this.valid_password) {
                return this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${
                        this.lanMap["password"]
                    }`
                });
            }
            const data = {
                method: this.formData.index === -1 ? "add" : "set",
                param: {
                    port_id: this.portid,
                    onu_id: this.onuid,
                    name: this.formData.name,
                    index: this.formData.index,
                    ipmode: this.formData.ipmode,
                    ctype: this.formData.ctype,
                    mtu: this.formData.mtu,
                    igmpproxy: this.formData.igmpproxy,
                    ipproto: this.formData.ipproto,
                    pppoemode: this.formData.pppoemode,
                    user: this.formData.user,
                    password: this.formData.password,
                    tagmode: this.formData.tagmode,
                    vlan_id: this.formData.vlan_id,
                    portmap: this.formData.portmap
                }
            };
            this.submit(data);
        },
        submit_bridge() {
            const data = {
                method: this.formData.index === -1 ? "add" : "set",
                param: {
                    port_id: this.portid,
                    onu_id: this.onuid,
                    name: this.formData.name,
                    index: this.formData.index,
                    ipmode: this.formData.ipmode,
                    ctype: this.formData.ctype,
                    igmpproxy: this.formData.igmpproxy,
                    tagmode: this.formData.tagmode,
                    vlan_id: this.formData.vlan_id,
                    portmap: this.formData.portmap
                }
            };
            this.submit(data);
        },
        submit(data) {
            this.cacheForm = data;
            this.handleFlag = "config";
            this.showConfirm = true;
        },
        confirm_submit() {
            const handles = {
                "Static IP"() {
                    this.submit_static_ip();
                },
                DHCP() {
                    this.submit_dhcp();
                },
                PPPoE() {
                    this.submit_pppoe();
                },
                Bridge() {
                    this.submit_bridge();
                }
            };
            if (!this.valid_name) {
                return this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${
                        this.lanMap["name"]
                    }`
                });
            }
            if (!this.valid_mtu) {
                return this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${this.lanMap["mtu"]}`
                });
            }
            if (!this.valid_vlanid) {
                return this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${
                        this.lanMap["vlan_id"]
                    }`
                });
            }
            if (
                typeof handles[this.ipmodes[this.formData.ipmode]] ===
                "function"
            ) {
                handles[this.ipmodes[this.formData.ipmode]].call(this);
            }
        },
        confirm_delete() {
            if (this.formData.index === -1) {
                return;
            }
            this.showConfirm = true;
            this.handleFlag = "delete";
        },
        confirm_clear() {
            this.showConfirm = true;
            this.handleFlag = "clear";
        },
        delWan() {
            const data = {
                method: "delete",
                param: {
                    port_id: this.portid,
                    onu_id: this.onuid,
                    name: this.formData.name,
                    index: this.formData.index
                }
            };
            this.$http
                .post("/onumgmt?form=wan", data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: "success",
                            text: `${this.lanMap["delete_ok"]}`
                        });
                        this.getData();
                    } else {
                        this.$message({
                            type: "success",
                            text: res.data.message
                        });
                    }
                })
                .catch(err => {});
        },
        result(bool) {
            if (bool) {
                if (this.handleFlag === "config") {
                    this.submitForm();
                }
                if (this.handleFlag === "delete") {
                    this.delWan();
                }
                if (this.handleFlag === "clear") {
                    this.clearAll();
                }
            }
            this.showConfirm = false;
        },
        clearAll() {
            const data = {
                method: "clear",
                param: {
                    port_id: this.portid,
                    onu_id: this.onuid
                }
            };
            this.$http
                .post("/onumgmt?form=wan", data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["delete_ok"]
                        });
                        this.wanInfo = [];
                    } else {
                        this.$message({
                            type: res.data.type,
                            text: res.data.message
                        });
                    }
                })
                .catch(err => {});
        }
    },
    watch: {
        "formData.index"() {
            if (this.formData.index === -1) {
                this.resetForm();
            } else {
                this.wanInfo.forEach(item => {
                    if (item.index === this.formData.index) {
                        Object.keys(item).forEach(key => {
                            this.formData[key] = item[key];
                        });
                        if(!this.formData.name){
                            this.formData.name = `wan${item['index']}`;
                        }
                    }
                });
            }
        }
    }
};
</script>

<style lang="less" scoped>
h3 {
    font-size: 18px;
    height: 30px;
    font-weight: 500;
    line-height: 30px;
    color: #67aef7;
    padding-left: 10px;
}
select {
    width: 197px;
}
input:disabled,
select:disabled,
a.disabled {
    cursor: not-allowed;
}
a.disabled {
    &:hover {
        color: #fff;
    }
    &:active {
        border: 1px solid transparent;
        background: #666;
    }
}
.onu-wan-form {
    margin: 12px 0;
    &::after {
        display: table;
        content: "";
        clear: both;
    }
    > div {
        vertical-align: middle;
        height: 32px;
        line-height: 32px;
        &:first-child {
            margin-left: 20px;
            & > span {
                display: inline-block;
                width: 180px;
            }
        }
        & + div {
            margin-left: 120px;
        }
    }
}
div.switch {
    display: inline-block;
    vertical-align: sub;
    cursor: pointer;
    input {
        position: absolute;
        width: 0;
        height: 0;
        margin: 0;
        opacity: 0;
    }
    span {
        display: inline-block;
        position: relative;
        width: 40px;
        height: 20px;
        background: #666;
        border-radius: 10px;
        transition: all 0.3s linear;
        &::after {
            content: "";
            position: absolute;
            top: 2px;
            left: 2px;
            background: #fff;
            border-radius: 100%;
            width: 16px;
            height: 16px;
            transition: all 0.2s linear;
        }
    }
    span.checked {
        background: #13ce66;
        &::after {
            left: 22px;
        }
    }
    & + span {
        font-size: 15px;
        color: #333;
        margin-left: 30px;
    }
}
.onu-wan-btn-group {
    margin: 30px 0 20px 0;
    a {
        margin-left: 80px;
        &:first-child {
            margin-left: 20px;
        }
    }
}
.invalid-input {
    border-color: red;
    &:focus {
        border-color: red;
    }
    &:active {
        border-color: red;
    }
}
span.tips {
    display: inline;
    margin-left: 8px;
    font-size: 14px;
    color: #666;
}
input[type="checkbox"] {
    vertical-align: middle;
}
</style>