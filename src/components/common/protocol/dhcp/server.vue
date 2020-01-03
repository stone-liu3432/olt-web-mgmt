<template>
    <div>
        <div class="dhcp-server-item">
            <span>DHCP Server Status:</span>
            <span>{{ status ? lanMap['enable'] : lanMap['disable'] }}</span>
            <a href="javascript: void(0);" @click="chagneState">{{ buttonText }}</a>
            <a href="javascript: void(0);" @click="openDialog" v-if="status">{{ lanMap['config'] }}</a>
        </div>
        <template v-if="status">
            <div class="dhcp-server-item">
                <span>{{ lanMap['ipaddress_s'] }}:</span>
                <span>{{ globalData.ipaddress_s }}</span>
            </div>
            <div class="dhcp-server-item">
                <span>{{ lanMap['ipaddress_e'] }}:</span>
                <span>{{ globalData.ipaddress_e }}</span>
            </div>
            <div class="dhcp-server-item">
                <span>{{ lanMap['ipmask'] }}:</span>
                <span>{{ globalData.ipmask }}</span>
            </div>
            <div class="dhcp-server-item">
                <span>{{ lanMap['interface'] }}:</span>
                <span>{{ getInterface(globalData.interface) }}</span>
            </div>
            <div class="dhcp-server-item">
                <span>{{ lanMap['pridns'] }}:</span>
                <span>{{ globalData.pridns }}</span>
            </div>
            <div class="dhcp-server-item">
                <span>{{ lanMap['secdns'] }}:</span>
                <span>{{ globalData.secdns }}</span>
            </div>
            <div class="dhcp-server-item">
                <span>{{ lanMap['gateway'] }}:</span>
                <span>{{ globalData.gateway }}</span>
            </div>
            <div class="dhcp-server-item">
                <span>{{ lanMap['lease_time'] }}:</span>
                <span>{{ globalData.lease_time }}</span>
            </div>
        </template>
        <nms-dialog :visible.sync="dialogVisible" width="550px">
            <template slot="title">{{ lanMap['config'] }}</template>
            <div class="dhcp-server-form">
                <div>
                    <span>{{ lanMap['ipaddress_s'] }}</span>
                    <input
                        type="text"
                        v-model="formData.ipaddress_s"
                        :style="validate('ipaddress_s')"
                    />
                    <span>ex. 127.0.0.1</span>
                </div>
                <div>
                    <span>{{ lanMap['ipaddress_e'] }}</span>
                    <input
                        type="text"
                        v-model="formData.ipaddress_e"
                        :style="validate('ipaddress_e')"
                    />
                    <span>ex. 127.0.0.1</span>
                </div>
                <div>
                    <span>{{ lanMap['ipmask'] }}</span>
                    <input type="text" v-model="formData.ipmask" :style="validate('ipmask')" />
                    <span>ex. 255.255.255.0</span>
                </div>
                <div>
                    <span>{{ lanMap['interface'] }}</span>
                    <select v-model.number="formData.interface">
                        <template v-for="item in inbound">
                            <option :value="item.vlan_id">{{ item.interface }}</option>
                        </template>
                    </select>
                </div>
                <div>
                    <span>{{ lanMap['pridns'] }}</span>
                    <input type="text" v-model="formData.pridns" :style="validate('pridns')" />
                    <span>ex. 127.0.0.1</span>
                </div>
                <div>
                    <span>{{ lanMap['secdns'] }}</span>
                    <input type="text" v-model="formData.secdns" :style="validate('secdns')" />
                    <span>ex. 127.0.0.1</span>
                </div>
                <div>
                    <span>{{ lanMap['gateway'] }}</span>
                    <input type="text" v-model="formData.gateway" :style="validate('gateway')" />
                    <span>ex. 127.0.0.1</span>
                </div>
                <div>
                    <span>{{ lanMap['lease_time'] }}</span>
                    <input
                        type="text"
                        v-model.number="formData.lease_time"
                        :style="validate('lease_time')"
                    />
                    <span>Range: 60-864000</span>
                </div>
            </div>

            <div slot="footer">
                <a href="javascript: void(0);" @click="submitForm">{{ lanMap['apply'] }}</a>
                <a href="javascript: void(0);" @click="closeDialog">{{ lanMap['cancel'] }}</a>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { isDef, testIPAddr } from "@/utils/common";
export default {
    name: "dhcpServer",
    computed: {
        ...mapState(["lanMap", "change_url"]),
        status() {
            return !!this.globalData.server_admin;
        },
        buttonText() {
            return this.status ? this.lanMap["off"] : this.lanMap["on"];
        }
    },
    props: {
        globalData: {
            type: Object
        }
    },
    data() {
        return {
            inbound: [],
            formData: {
                ipaddress_s: "",
                ipaddress_e: "",
                ipmask: "",
                interface: "",
                pridns: "",
                secdns: "",
                gateway: "",
                lease_time: ""
            },
            dialogVisible: false
        };
    },
    created() {
        this.getInbound();
    },
    methods: {
        getInbound() {
            this.inbound = [];
            this.$http
                .get(this.change_url.inbound)
                .then(res => {
                    if (res.data.code == 1) {
                        if (res.data.data && Array.isArray(res.data.data)) {
                            this.inbound = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        openDialog() {
            if (!this.inbound.length) {
                this.$confirm("none_inbound_tips")
                    .then(_ => {
                        this.$router.push("/remote_mgmt");
                    })
                    .catch(_ => {});
            } else {
                this.dialogVisible = true;
                Object.keys(this.formData).forEach(key => {
                    if (isDef(this.globalData[key])) {
                        this.formData[key] = this.globalData[key] || "";
                    }
                });
            }
        },
        chagneState() {
            const msg = `${this.lanMap["if_sure"]}${
                this.status ? this.lanMap["close"] : this.lanMap["open"]
            } DHCP Server`;
            this.$confirm(msg)
                .then(_ => {
                    const post_params = {
                        method: "set",
                        param: {
                            server_admin: !this.status >>> 0
                        }
                    };
                    this.$http
                        .post("/switch_dhcp?form=server_admin", post_params)
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["set"] +
                                        this.lanMap["st_success"]
                                );
                                this.$emit("update-data");
                            } else {
                                this.$message.error(
                                    `(${res.data.code}) ${res.data.message}`
                                );
                            }
                        })
                        .catch(err => {});
                })
                .catch(_ => {});
        },
        getInterface(vlan_id) {
            const result = this.inbound.filter(
                item => item.vlan_id === vlan_id
            )[0];
            return result ? (result.interface ? result.interface : "-") : "-";
        },
        closeDialog() {
            this.dialogVisible = false;
        },
        validate(key) {
            if (
                (key === "secdns" && this.formData.secdns === "") ||
                key === "interface"
            ) {
                return;
            }
            const t = this.formData[key];
            const errorStyle = { "border-color": "red" };
            if (key === "lease_time") {
                if (t < 60 || t > 864000) {
                    return errorStyle;
                }
                return;
            }
            if (!testIPAddr(t)) {
                return errorStyle;
            }
        },
        submitForm() {
            const form = Object.keys(this.formData);
            for (let i = 0, l = form.length; i < l; i++) {
                const valid = this.validate(form[i]);
                if (valid) {
                    return this.$message.error(
                        `${this.lanMap["param_error"]}: ${this.lanMap[form[i]]}`
                    );
                }
            }
            const result = this.composeData(this.formData);
            // 此处表单已经验证通过，result为 undefined 时代表无任何更改
            if (result) {
                const { url, data } = result;
                if (url && data) {
                    this.$http
                        .post(url, data)
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["set"] +
                                        this.lanMap["st_success"]
                                );
                                this.$emit("update-data");
                            } else {
                                this.$message.error(
                                    `(${res.data.code}) ${res.data.message}`
                                );
                            }
                        })
                        .catch(err => {});
                }
            } else {
                this.$message.warning(this.lanMap["modify_tips"]);
            }
            this.closeDialog();
        },
        composeData(data) {
            const flags = {
                ipaddress_s: 0x01,
                ipaddress_e: 0x01,
                ipmask: 0x02,
                interface: 0x04,
                pridns: 0x08,
                secdns: 0x08,
                gateway: 0x10,
                lease_time: 0x20
            };
            const flag = Object.keys(flags).reduce((prev, key) => {
                if (data[key] !== this.globalData[key]) {
                    if ((prev & flags[key]) !== flags[key]) {
                        prev |= flags[key];
                    }
                }
                return prev;
            }, 0);
            if (flag === 0) {
                return;
            }
            return {
                url: "/switch_dhcp?form=server_cfg",
                data: {
                    method: "set",
                    param: {
                        flags: flag,
                        ipaddress_s: data.ipaddress_s,
                        ipaddress_e: data.ipaddress_e,
                        ipmask: data.ipmask,
                        interface: data.interface,
                        pridns: data.pridns,
                        secdns: data.secdns,
                        gateway: data.gateway,
                        lease_time: data.lease_time
                    }
                }
            };
        }
    }
};
</script>

<style lang="less" scoped>
.dhcp-server-item {
    margin: 0 0 10px 10px;
    span {
        display: inline-block;
        vertical-align: middle;
        width: 180px;
        line-height: 30px;
    }
    span + span {
        width: auto;
    }
    a {
        margin-left: 30px;
    }
}
.dhcp-server-form {
    > div {
        margin: 10px 0;
        > span {
            display: inline-block;
            width: 180px;
            vertical-align: middle;
        }
        input + span {
            color: @tipsColor;
            font-size: @tipsFontSize;
            margin-left: 6px;
            width: auto;
        }
        select {
            width: 197px;
        }
    }
}
</style>
