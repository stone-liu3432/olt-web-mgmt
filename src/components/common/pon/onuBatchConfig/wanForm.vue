<template>
    <div>
        <div style="margin: 20px 0;" class="wan-dialog-scroll">
            <div class="onu-wan-form" v-if="formData.index === -1">
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
                    <select v-model.number="formData.ctype">
                        <template v-for="(item, index) in ctypes">
                            <!-- :disabled="disableCtype(item, Number(index))" -->
                            <option :value="index">{{ item }}</option>
                        </template>
                    </select>
                </div>
            </div>
            <div class="onu-wan-form" v-if="formData.ipmode !== 3">
                <div>
                    <span>{{ lanMap['mtu'] }}</span>
                    <input
                        type="text"
                        v-model.number="formData.mtu"
                        :class="{ 'invalid-input': !valid_mtu }"
                    />
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
                            <span class="tips">ex: 255.255.255.0</span>
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
                        <span class="tips">1-32 characters</span>
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
                        <span class="tips">1-32 characters</span>
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
            <div
                class="onu-wan-form wan-form-portmap"
                v-if="formData.ctype !== 8 && formData.ctype !== 1"
            >
                <div>
                    <span>{{ lanMap['portmap'] }}</span>
                    <div>
                        <template v-for="i in 4">
                            <label>
                                <input type="checkbox" :value="i" v-model="formData.portmap" />
                                LAN{{ i }}
                            </label>
                        </template>
                        <template v-for="(i, index) in [5, 10]">
                            <label>
                                <input type="checkbox" :value="i" v-model="formData.portmap" />
                                WLAN{{ index + 1 }}
                            </label>
                        </template>
                    </div>
                </div>
            </div>
            <div
                class="onu-wan-form"
                :style="{ 'margin-bottom': formData.index === -1 ? '' : '20px;'}"
            >
                <div>
                    <span>{{ lanMap['igmpproxy'] }}</span>
                    <select v-model.number="formData.igmpproxy">
                        <template v-for="(item, index) in igmpproxys">
                            <option :value="index">{{ lanMap[item] }}</option>
                        </template>
                    </select>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { testIPAddr } from "@/utils/common";
export default {
    name: "wanForm",
    computed: {
        ...mapState(["lanMap"]),
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
            return /^.{1,32}$/.test(this.formData.user);
        },
        valid_password() {
            if (this.formData.ipmode !== 2) {
                return true;
            }
            return /^.{1,32}$/.test(this.formData.password);
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
    props: {},
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
                pppoemode: 0,
                user: "",
                password: "",
                tagmode: 0,
                vlan_id: "",
                reqdns: 0,
                pridns: "",
                secdns: "",
                portmap: []
            }
        };
    },
    methods: {
        changeVlanMode() {
            this.formData.tagmode = Number(!this.formData.tagmode);
        },
        changeDnsMode() {
            this.formData.reqdns = Number(!this.formData.reqdns);
        },
        static_ip() {
            if (!this.valid_ipaddr) {
                this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${this.lanMap["ipaddr"]}`
                });
                return false;
            }
            if (!this.valid_ipmask) {
                this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${this.lanMap["ipmask"]}`
                });
                return false;
            }
            if (!this.valid_gateway) {
                this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${this.lanMap["gateway"]}`
                });
                return false;
            }
            if (!this.valid_pridns) {
                this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${this.lanMap["pridns"]}`
                });
                return false;
            }
            if (!this.valid_secdns) {
                this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${this.lanMap["secdns"]}`
                });
                return false;
            }
            return true;
        },
        dhcp() {
            if (!this.valid_pridns) {
                this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${this.lanMap["pridns"]}`
                });
                return false;
            }
            if (!this.valid_secdns) {
                this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${this.lanMap["secdns"]}`
                });
                return false;
            }
            return true;
        },
        pppoe() {
            if (!this.valid_user) {
                return this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${this.lanMap["user"]}`
                });
                return false;
            }
            if (!this.valid_password) {
                this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${this.lanMap["password"]}`
                });
                return false;
            }
            return true;
        },
        bridge() {
            return true;
        },
        validate(fn) {
            const Handles = {
                "Static IP"() {
                    this.static_ip();
                },
                DHCP() {
                    this.dhcp();
                },
                PPPoE() {
                    this.pppoe();
                },
                Bridge() {
                    this.bridge();
                }
            };
            if (!this.valid_name) {
                return this.$message({
                    type: "error",
                    text: `${this.lanMap["param_error"]}: ${this.lanMap["name"]}`
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
                    text: `${this.lanMap["param_error"]}: ${this.lanMap["vlan_id"]}`
                });
            }
            if (
                !this.formData.portmap.length &&
                this.formData.ctype !== 8 &&
                this.formData.ctype !== 1
            ) {
                return this.$message({
                    type: "error",
                    text: `${this.lanMap["required"]}: ${this.lanMap["portmap"]}`
                });
            }
            if (
                typeof Handles[this.ipmodes[this.formData.ipmode]] ===
                "function"
            ) {
                const res = Handles[this.ipmodes[this.formData.ipmode]].call(
                    this
                );
                if (res) {
                    fn.call(this, this.formData);
                }
            }
        }
    }
};
</script>

<style lang="less" scoped>
select {
    width: 197px;
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
.wan-form-portmap {
    > div {
        user-select: none;
        &:after {
            content: "";
            display: table;
            clear: both;
        }
        span {
            float: left;
        }
        > div {
            float: left;
            width: calc(~"100% - 180px");
        }
        label {
            width: 24%;
            display: inline-block;
            &:first-child {
                margin-left: 0;
            }
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
.invalid-input {
    border-color: red;
    &:focus {
        border-color: red;
    }
    &:active {
        border-color: red;
    }
}
.wan-dialog-scroll {
    max-height: 500px;
    overflow-y: auto;
}
//  溢出时的处理
@media (max-height: 768px) {
    .wan-dialog-scroll {
        max-height: 320px;
        overflow-y: auto;
    }
}
@media (min-height: 769px) and (max-height: 900px) {
    .wan-dialog-scroll {
        max-height: 500px;
        overflow-y: auto;
    }
}
span.tips {
    display: inline;
    margin-left: 8px;
    font-size: 14px;
    color: #666;
}
</style>