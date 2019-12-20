<template>
    <div>
        <h3>
            {{ lanMap['wan_connect'] }}
            <a
                href="javascript: void(0);"
                style="margin-left: 60px; height: 28px; line-height: 28px;"
                @click="openDialog(null, 'add')"
            >{{ lanMap['add'] }}</a>
            <!-- <a
                href="javascript: void(0);"
                style="margin-left: 30px; height: 28px; line-height: 28px;"
                @click="confirm_clear"
                v-if="wanInfo.length"
            >{{ lanMap['delete_all'] }}</a>-->
            <a
                href="javascript: void(0);"
                style="margin-left: 30px; height: 28px; line-height: 28px;"
                @click="refreshData"
            >{{ lanMap['refresh'] }}</a>
        </h3>
        <nms-table :rows="wanInfo" border>
            <nms-table-column prop="name" :label="lanMap['name']">
                <template slot-scope="row">{{ row.name || `wan-${row.index}` }}</template>
            </nms-table-column>
            <nms-table-column prop="vlan_id" :label="lanMap['vlan_id']"></nms-table-column>
            <nms-table-column prop="ctype" :label="lanMap['ctype']">
                <template slot-scope="row">{{ ctypes[row.ctype] }}</template>
            </nms-table-column>
            <nms-table-column prop="ipmode" :label="lanMap['ipmode']">
                <template slot-scope="row">{{ ipmodes[row.ipmode] }}</template>
            </nms-table-column>
            <nms-table-column prop="ipaddr" :label="lanMap['ipaddr']">
                <template slot-scope="row">{{ row.ipaddr || ' - ' }}</template>
            </nms-table-column>
            <nms-table-column prop="gateway" :label="lanMap['gateway']">
                <template slot-scope="row">{{ row.gateway || ' - ' }}</template>
            </nms-table-column>
            <nms-table-column prop="status" :label="lanMap['status']">
                <template slot-scope="row">{{ row.status ? 'Up' : 'Down' }}</template>
            </nms-table-column>
            <nms-table-column prop="config" :label="lanMap['config']" width="150px">
                <template slot-scope="row">
                    <a
                        href="javascript: void(0);"
                        @click="openDialog(row, 'set')"
                        class="btn-text"
                    >{{ lanMap['detail'] }}</a>
                    <a
                        href="javascript: void(0);"
                        @click="confirm_delete(row)"
                        class="btn-text"
                    >{{ lanMap['delete'] }}</a>
                </template>
            </nms-table-column>
        </nms-table>
        <div class="modal-dialog" v-if="showDialog">
            <div class="cover"></div>
            <div class="wan-connect-modal-content" ref="wan-config-content">
                <div>
                    <div
                        class="modal-header"
                    >{{ formData.index === -1 ? lanMap['add'] : (formData.name || `wan_${formData.index}`) }}</div>
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
                                        <option
                                            :value="index"
                                            :disabled="disableCtype(item, Number(index))"
                                        >{{ item }}</option>
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
                                    <span
                                        :class="{ 'checked' : formData.tagmode }"
                                        @click="changeVlanMode"
                                    ></span>
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
                        <div
                            class="onu-wan-form"
                            v-if="formData.ipmode === 0 || formData.ipmode === 1"
                        >
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
                                        <span
                                            :class="{ 'checked' : formData.reqdns }"
                                            @click="changeDnsMode"
                                        ></span>
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
                                    <template v-for="i in geports">
                                        <label :class="{'disabled': portMaps.includes(i) }">
                                            <input
                                                type="checkbox"
                                                :value="i"
                                                v-model="formData.portmap"
                                                :disabled="portMaps.includes(i)"
                                            />
                                            LAN{{ i }}
                                        </label>
                                    </template>
                                    <template v-for="(i, index) in [5, 10].slice(0, wlan)">
                                        <label :class="{'disabled': portMaps.includes(i) }">
                                            <input
                                                type="checkbox"
                                                :value="i"
                                                v-model="formData.portmap"
                                                :disabled="portMaps.includes(i)"
                                            />
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
                    <div class="onu-wan-btn-group" v-if="formData.index === -1">
                        <a href="javascript: void(0);" @click="confirm_submit">{{ lanMap['apply'] }}</a>
                        <a href="javascript: void(0);" @click="closeDialog">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="closeDialog"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { testIPAddr, debounce } from "@/utils/common";
export default {
    name: "onuWanConfig",
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
                pppoemode: 0,
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
            showDialog: false,
            wanInfo: []
        };
    },
    // mounted() {
    //     this.wanInfo = Array.from({ length: 5 }).map((item, index) => {
    //         return {
    //             name: "wan0",
    //             index: 0,
    //             ipmode: 1,
    //             ctype: 1,
    //             tagmode: 0,
    //             vlan_id: 123,
    //             ipaddr: "192.168.5.11",
    //             ipmask: "255.255.255.0",
    //             gateway: "192.168.5.1",
    //             pppoemode: 1,
    //             user: "123",
    //             password: "123",
    //             requestdns: 0,
    //             pridns: "8.8.8.8",
    //             secdns: "4.4.4.4",
    //             portmap: [1]
    //         };
    //     });
    // },
    computed: {
        ...mapState(["lanMap"]),
        portid() {
            return this.portData.portid;
        },
        onuid() {
            return this.portData.onuid;
        },
        voip() {
            return this.portData.voip || 0;
        },
        geports() {
            return this.portData.geports || 1;
        },
        wlan() {
            return this.portData.wlan || 0;
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
        },
        portMaps() {
            const maps = [];
            if (this.wanInfo.length) {
                this.wanInfo.forEach(item => {
                    if (item.portmap && item.portmap.length) {
                        maps.push(...item.portmap);
                    }
                });
            }
            return [...new Set(maps)];
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
                    this.formData.index = -1;
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
            const load = this.$loading();
            this.$http
                .post("/onumgmt?form=wan", this.cacheForm)
                .then(res => {
                    load && load.close();
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
                .catch(err => {
                    load && load.close();
                });
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
                    portmap:
                        this.formData.ctype !== 8
                            ? this.formData.portmap.sort((a, b) => a - b)
                            : null
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
                    portmap:
                        this.formData.ctype !== 8
                            ? this.formData.portmap.sort((a, b) => a - b)
                            : null
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
                    portmap:
                        this.formData.ctype !== 8
                            ? this.formData.portmap.sort((a, b) => a - b)
                            : null
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
                    portmap:
                        this.formData.ctype !== 8
                            ? this.formData.portmap.sort((a, b) => a - b)
                            : null
                }
            };
            this.submit(data);
        },
        submit(data) {
            this.cacheForm = data;
            this.handleFlag = "config";
            this.result(true);
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
                !this.formData.portmap.length &&
                this.formData.ctype !== 8 &&
                this.formData.ctype !== 1
            ) {
                return this.$message({
                    type: "error",
                    text: `${this.lanMap["required"]}: ${
                        this.lanMap["portmap"]
                    }`
                });
            }
            if (
                typeof handles[this.ipmodes[this.formData.ipmode]] ===
                "function"
            ) {
                handles[this.ipmodes[this.formData.ipmode]].call(this);
            }
            this.closeDialog();
        },
        closeDialog() {
            this.showDialog = false;
            if (this.formData.index === -1) {
                this.resetForm();
            } else {
                this.formData.index = -1;
            }
        },
        confirm_delete(node) {
            this.$confirm(this.lanMap["if_sure"])
                .then(_ => {
                    const data = {
                        method: "delete",
                        param: {
                            port_id: this.portid,
                            onu_id: this.onuid,
                            name: node.name,
                            index: node.index
                        }
                    };
                    this.delWan(data);
                })
                .catch(_ => {});
        },
        confirm_clear() {
            this.$confirm(this.lanMap["if_sure"])
                .then(_ => {
                    this.clearAll();
                })
                .catch(_ => {});
        },
        delWan(data) {
            const load = this.$loading();
            this.$http
                .post("/onumgmt?form=wan", data)
                .then(res => {
                    load && load.close();
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
                .catch(err => {
                    load && load.close();
                });
        },
        result(bool) {
            if (bool) {
                if (this.handleFlag === "config") {
                    this.submitForm();
                }
            }
            this.showConfirm = false;
            this.resetForm();
        },
        clearAll() {
            const data = {
                method: "clear",
                param: {
                    port_id: this.portid,
                    onu_id: this.onuid
                }
            };
            const load = this.$loading();
            this.$http
                .post("/onumgmt?form=wan", data)
                .then(res => {
                    load && load.close();
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["delete_ok"]
                        });
                        this.wanInfo = [];
                        this.formData.index = -1;
                    } else {
                        this.$message({
                            type: res.data.type,
                            text: res.data.message
                        });
                    }
                })
                .catch(err => {
                    load && load.close();
                });
        },
        openDialog(node, action) {
            this.showDialog = true;
            if (action === "add") {
                this.formData.index = -1;
            }
            if (action === "set" && node) {
                this.formData.index = node.index;
                //  config 更改为 show detail，不能配置，只能查看
                this.$nextTick(_ => {
                    const el = this.$refs["wan-config-content"];
                    const inputs = Array.from(el.getElementsByTagName("input"));
                    const selects = Array.from(
                        el.getElementsByTagName("select")
                    );
                    inputs.forEach(item => {
                        item.disabled = true;
                    });
                    selects.forEach(item => {
                        item.disabled = true;
                    });
                });
            }
        },
        disableCtype(item, index) {
            if (this.geports === 1) {
                return index !== 2;
            }
            return index === 8 && !this.voip;
        },
        refreshData() {
            debounce(this.getData, 1000, this);
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
                        if (!this.formData.name) {
                            this.formData.name = `wan-${item["index"]}`;
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
label.disabled,
input:disabled,
select:disabled,
a.disabled {
    cursor: not-allowed;
}
label.disabled {
    color: #aaa;
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
span.tips {
    display: inline;
    margin-left: 8px;
    font-size: 14px;
    color: #666;
}
input[type="checkbox"] {
    vertical-align: middle;
}
table {
    border: 1px solid #ddd;
    margin: 20px 10px 20px 10px;
    width: calc(~"100% - 20px");
    th,
    td {
        text-align: center;
        padding: 6px 0;
    }
    th {
        font-weight: 600;
        color: #666;
        padding: 12px;
    }
}
a.btn-text {
    padding: 0 6px;
}
div.wan-connect-modal-content {
    width: 620px;
    height: auto;
    max-height: 100%;
    a {
        margin: 12px 0px 16px 135px;
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
</style>