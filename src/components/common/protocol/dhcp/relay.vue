<template>
    <div class="dhcp-relay">
        <div style="margin: 0 0 10px 10px;">
            <span>{{ lanMap['relay_admin'] }}:</span>
            <span>{{ this.admin ? lanMap['enable'] : lanMap['disable'] }}</span>
            <a
                href="javascript: void(0);"
                style="margin-left: 30px;"
                @click="openDialog('admin')"
            >{{ lanMap['config'] }}</a>
        </div>
        <div v-if="admin === 1">
            <div style="margin: 0 0 10px 10px;">
                <span>{{ lanMap['relay_policy'] }}:</span>
                <span>{{ policies[policy] }}</span>
                <a
                    href="javascript: void(0);"
                    style="margin-left: 30px;"
                    @click="openDialog('policy')"
                >{{ lanMap['config'] }}</a>
                <a
                    href="javascript: void(0);"
                    style="margin-left: 30px;"
                    @click="openDialog('add')"
                >{{ lanMap['add'] + lanMap['server_ip'] }}</a>
            </div>
            <div v-if="policy === 0">
                <nms-table :rows="dataTable" border>
                    <nms-table-column prop="vlan_id" :label="lanMap['vlan_id']"></nms-table-column>
                    <nms-table-column prop="server_ip" :label="lanMap['server_ip']"></nms-table-column>
                    <nms-table-column :label="lanMap['config']" width="100px">
                        <template slot-scope="rows">
                            <a
                                href="javascript: void(0);"
                                class="btn-text"
                                @click="deleteRelay(rows)"
                            >{{ lanMap['delete'] }}</a>
                        </template>
                    </nms-table-column>
                </nms-table>
            </div>
            <div v-if="policy === 1">
                <nms-table :rows="dataTable" border>
                    <nms-table-column prop="option60" :label="lanMap['option60']"></nms-table-column>
                    <nms-table-column prop="server_ip" :label="lanMap['server_ip']"></nms-table-column>
                    <nms-table-column :label="lanMap['config']" width="100px">
                        <template slot-scope="rows">
                            <a
                                href="javascript: void(0);"
                                class="btn-text"
                                @click="deleteRelay(rows)"
                            >{{ lanMap['delete'] }}</a>
                        </template>
                    </nms-table-column>
                </nms-table>
            </div>
        </div>
        <nms-dialog :visible.sync="visible" width="500px" :before-close="beforeClose">
            <div slot="title">{{ policies.includes(dialogType) ? lanMap['add'] : lanMap['set'] }}</div>
            <div v-if="dialogType === 'admin'" class="relay-form-item">
                <span>{{ lanMap['relay_admin'] }}</span>
                <select v-model.number="relay_admin">
                    <option :value="0">{{ lanMap['disable'] }}</option>
                    <option :value="1">{{ lanMap['enable'] }}</option>
                </select>
            </div>
            <div v-if="dialogType === 'policy'" class="relay-form-item">
                <span>{{ lanMap['relay_policy'] }}</span>
                <select v-model.number="relay_policy">
                    <option :value="0">{{ lanMap['standard'] }}</option>
                    <option :value="1">{{ lanMap['option60'] }}</option>
                </select>
            </div>
            <div v-if="dialogType === 'standard'" class="relay-form-item">
                <span>{{ lanMap['vlan_id'] }}</span>
                <input
                    type="text"
                    v-model.number="vlan_id"
                    :style="{ 'border-color': vlan_id !== '' && !validVlan ? 'red' : '' }"
                />
                <span class="tips" style="width: 125px;">{{ lanMap.composeRange(1, 4094) }}</span>
            </div>
            <div v-if="dialogType === 'option60'" class="relay-form-item">
                <span>{{ lanMap['option60'] }}</span>
                <input
                    type="text"
                    v-model="option60"
                    :style="{ 'border-color': option60 !== '' && !validOption60 ? 'red' : '' }"
                />
                <span class="tips">{{ lanMap.composeRange(1, 64) }}</span>
            </div>
            <div
                v-if="dialogType === 'standard' || dialogType === 'option60'"
                class="relay-form-item"
            >
                <span>{{ lanMap['server_ip'] }}</span>
                <input
                    type="text"
                    v-model="server_ip"
                    :style="{ 'border-color': server_ip !== '' && !validServer ? 'red' : '' }"
                />
                <span class="tips">ex: 127.0.0.1</span>
            </div>
            <div slot="footer">
                <a href="javascript: void(0);" @click="submitDialog">{{ lanMap['apply'] }}</a>
                <a href="javascript: void(0);" @click="closeDialog">{{ lanMap['cancel'] }}</a>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { testIPAddr } from "@/utils/common";
export default {
    name: "relay",
    computed: {
        ...mapState(["lanMap"]),
        admin() {
            return this.globalData.relay_admin;
        },
        policy() {
            return this.globalData.relay_policy;
        },
        validVlan() {
            return this.vlan_id >= 1 && this.vlan_id <= 4094;
        },
        validOption60() {
            const reg = /^\w{1,64}$/;
            return reg.test(this.option60);
        },
        validServer() {
            return testIPAddr(this.server_ip);
        }
    },
    data() {
        return {
            policies: ["standard", "option60"],
            getPolicy: {
                standard() {
                    return this.$http.get("/switch_dhcp?form=relay_standard");
                },
                option60() {
                    return this.$http.get("/switch_dhcp?form=relay_option60");
                }
            },
            postPolicy: {
                standard: {
                    set: { url: "/switch_dhcp?form=relay_standard_add" },
                    delete: { url: "/switch_dhcp?form=relay_standard_del" },
                    keys: ["vlan_id", "server_ip"]
                },
                option60: {
                    set: { url: "/switch_dhcp?form=relay_option60_add" },
                    delete: { url: "/switch_dhcp?form=relay_option60_del" },
                    keys: ["option60", "server_ip"]
                },
                admin: {
                    set: { url: "/switch_dhcp?form=relay_admin" },
                    keys: ["relay_admin"]
                },
                policy: {
                    set: { url: "/switch_dhcp?form=relay_policy" },
                    keys: ["relay_policy"]
                }
            },
            dataTable: [],
            visible: false,
            //  dialog的 type:  admin / policy / standard / option60
            dialogType: "",
            relay_admin: 0,
            relay_policy: 0,
            vlan_id: "",
            option60: "",
            server_ip: ""
        };
    },
    created() {
        if (this.admin) {
            this.getData();
        }
    },
    // mounted() {
    //     this.dataTable = [
    //         {
    //             vlan_id: 1,
    //             server_ip: "192.168.100.100"
    //         }
    //     ];
    // },
    props: {
        globalData: {
            type: Object,
            required: true
        }
    },
    methods: {
        deleteRelay(node) {
            this.$confirm(this.lanMap["if_sure"])
                .then(_ => {
                    const { url, data } = this.composeData(node, "delete");
                    this.postData(url, data, "delete");
                })
                .catch(_ => {});
        },
        composeData(data, method) {
            let _data = this.postPolicy[this.policies[this.policy]];
            if (this.dialogType && !this.policies.includes(this.dialogType)) {
                _data = this.postPolicy[this.dialogType];
            }
            const { keys } = _data;
            let param = keys.reduce((pre, val) => {
                if (!pre[val]) {
                    pre[val] = data[val];
                }
                return pre;
            }, {});
            const { url } = _data[method];
            return {
                url,
                data: {
                    method: "set",
                    param
                }
            };
        },
        updateData() {
            this.$emit("update-data");
        },
        /*
         * @param {url} 要发送请求的 url
         * @param {data} 要发送的数据
         * @param {flag} 请求类型( add / delete / set)
         */
        postData(url, data, flag) {
            this.$http
                .post(url, data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message.success(
                            this.lanMap[flag] + this.lanMap["st_success"]
                        );
                        if (
                            this.dialogType === "option60" ||
                            this.dialogType === "standard" ||
                            flag === "delete"
                        ) {
                            this.getData();
                        } else {
                            this.updateData();
                        }
                    } else {
                        if (
                            res.data.message.indexOf(
                                "dhcp realy function must be enable ip route"
                            ) > -1
                        ) {
                            this.$confirm(this.lanMap["dhcp_relay_tips"])
                                .then(_ => {
                                    this.enableRoute(
                                        `(${res.data.code}) ${res.data.message}`
                                    );
                                })
                                .catch(_ => {});
                            this.visible && this.closeDialog();
                            return;
                        }
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                    this.visible && this.closeDialog();
                })
                .catch(err => {});
        },
        openDialog(flag) {
            this.visible = true;
            this.dialogType = flag;
            this.relay_admin = this.admin || 0;
            this.relay_policy = this.policy;
            if (flag === "add") {
                this.dialogType = this.policies[this.policy];
            }
        },
        submitDialog() {
            const actions = {
                admin() {
                    return this.composeData(
                        { relay_admin: this.relay_admin },
                        "set"
                    );
                },
                policy() {
                    return this.composeData(
                        { relay_policy: this.relay_policy },
                        "set"
                    );
                },
                standard() {
                    if (!this.validVlan) {
                        this.$message.error(
                            `${this.lanMap["param_error"]}: ${this.lanMap["vlan_id"]}`
                        );
                        return;
                    }
                    if (!this.validServer) {
                        this.$message.error(
                            `${this.lanMap["param_error"]}: ${this.lanMap["server_ip"]}`
                        );
                        return;
                    }
                    return this.composeData(
                        { vlan_id: this.vlan_id, server_ip: this.server_ip },
                        "set"
                    );
                },
                option60() {
                    if (!this.validOption60) {
                        this.$message.error(
                            `${this.lanMap["param_error"]}: ${this.lanMap["option60"]}`
                        );
                        return;
                    }
                    if (!this.validServer) {
                        this.$message.error(
                            `${this.lanMap["param_error"]}: ${this.lanMap["server_ip"]}`
                        );
                        return;
                    }
                    return this.composeData(
                        { option60: this.option60, server_ip: this.server_ip },
                        "set"
                    );
                }
            };
            if (typeof actions[this.dialogType] === "function") {
                const _data = actions[this.dialogType].call(this);
                if (_data) {
                    const { url, data } = _data;
                    this.postData(url, data, "set");
                }
            }
        },
        closeDialog() {
            this.beforeClose(_ => {
                this.visible = false;
            });
        },
        beforeClose(done) {
            this.resetForm();
            if (typeof done === "function") {
                done();
            }
        },
        resetForm() {
            this.vlan_id = "";
            this.option60 = "";
            this.server_ip = "";
        },
        getData() {
            this.dataTable = [];
            if (
                typeof this.getPolicy[this.policies[this.policy]] === "function"
            ) {
                const request = this.getPolicy[this.policies[this.policy]].call(
                    this
                );
                request
                    .then(res => {
                        if (res.data.code === 1) {
                            if (res.data.data && res.data.data.length) {
                                this.dataTable = res.data.data;
                            }
                        }
                    })
                    .catch(err => {});
            }
        },
        //  DHCP Ready 在三层路由未开启的状态下会返回错误，需提示用户是否打开 route
        enableRoute(msg) {
            this.$http
                .post("/switch_route?form=admin", {
                    method: "set",
                    param: {
                        status: 1
                    }
                })
                .then(res => {
                    if (res.data.code === 1) {
                        const data = {
                            method: "set",
                            param: {
                                relay_admin: 1
                            }
                        };
                        this.postData("/switch_dhcp?form=relay_admin", data);
                    } else {
                        this.$message.error(msg);
                    }
                })
                .catch(err => {});
        }
    },
    watch: {
        admin() {
            if (this.admin) {
                this.getData();
            }
        }
    }
};
</script>

<style lang="less" scoped>
.no-data-tips {
    color: red;
}
.relay-form-item {
    & + .relay-form-item {
        margin-top: 20px;
    }
    select {
        width: 200px;
    }
    > span {
        display: inline-block;
        width: 100px;
    }
    input + span {
        width: auto;
    }
}
.tips {
    font-size: 14px;
    color: #666;
}
</style>