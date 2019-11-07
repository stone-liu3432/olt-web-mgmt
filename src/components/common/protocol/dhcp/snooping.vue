<template>
    <div>
        <div class="dhcp-snooping-item">
            <span>{{ lanMap['snooping_admin'] }}</span>
            <span>{{ admin === 1 ? lanMap['enable'] : lanMap['disable'] }}</span>
            <a href="javascript: void(0);" @click="openDialog('admin')">{{ lanMap['config'] }}</a>
        </div>
        <div v-if="admin === 1">
            <div class="dhcp-snooping-item">
                <span>{{ lanMap['chaddr_check'] }}</span>
                <span>{{ check === 1 ? lanMap['enable'] : lanMap['disable'] }}</span>
                <a href="javascript: void(0);" @click="openDialog('check')">{{ lanMap['config'] }}</a>
            </div>
            <div class="dhcp-snooping-item">
                <span>{{ lanMap['response_time'] }}</span>
                <span>{{ time }} s</span>
                <a href="javascript: void(0);" @click="openDialog('time')">{{ lanMap['config'] }}</a>
            </div>
            <div class="dhcp-snooping-item">
                <span>{{ lanMap['trust_portlist'] }}</span>
                <span>{{ portlist | parsePortList }}</span>
                <a href="javascript: void(0);" @click="openDialog('portlist')">{{ lanMap['add'] }}</a>
                <a
                    href="javascript: void(0);"
                    @click="openDialog('portlist', 'delete')"
                >{{ lanMap['delete'] }}</a>
            </div>
        </div>
        <div class="dhcp-snooping-item table-title">
            <span>{{ lanMap['snooping_table'] }}</span>
            <a href="javascript: void(0);" @click="clearSnoopingTable">{{ lanMap['clear'] }}</a>
        </div>
        <nms-table :rows="snoopingTable" border>
            <nms-table-column prop="ipaddr" :label="lanMap['ipaddr']"></nms-table-column>
            <nms-table-column prop="macaddr" :label="lanMap['macaddr']"></nms-table-column>
            <nms-table-column prop="port_id" :label="lanMap['port_id']">
                <template slot-scope="rows">{{ rows.port_id | getPortName }}</template>
            </nms-table-column>
            <nms-table-column prop="vlan_id" :label="lanMap['vlan_id']"></nms-table-column>
            <nms-table-column prop="lease_time" :label="lanMap['lease_time']"></nms-table-column>
            <nms-table-column prop="entry_status" :label="lanMap['entry_status']">
                <template slot-scope="rows">{{ rows.entry_status ? 'Valid' : 'Invalid' }}</template>
            </nms-table-column>
        </nms-table>
        <nms-dialog :visible.sync="visible" :width="dialogType === 'portlist' ? '700px' : '500px'">
            <div
                slot="title"
            >{{ dialogType === 'portlist' ? dialogMethod === 'delete' ? lanMap['delete'] : lanMap['add'] :lanMap['set'] }}</div>
            <div v-if="dialogType === 'admin'" class="dhcp-dialog-content">
                <span>{{ lanMap['snooping_admin'] }}</span>
                <select v-model.number="snooping_admin">
                    <option :value="0">{{ lanMap['disable'] }}</option>
                    <option :value="1">{{ lanMap['enable'] }}</option>
                </select>
            </div>
            <div v-if="dialogType === 'check'" class="dhcp-dialog-content">
                <span>{{ lanMap['chaddr_check'] }}</span>
                <select v-model.number="chaddr_check">
                    <option :value="0">{{ lanMap['disable'] }}</option>
                    <option :value="1">{{ lanMap['enable'] }}</option>
                </select>
            </div>
            <div v-if="dialogType === 'time'" class="dhcp-dialog-content">
                <span>{{ lanMap['response_time'] }}</span>
                <input type="text" v-model="response_time" style="width: 100px;" />
                <span class="tips">Range: 3 - 3600 s</span>
            </div>
            <div v-if="dialogType === 'portlist'" class="dhcp-dialog-content">
                <span style="width: 120px;" class="lf">{{ lanMap['trust_portlist'] }}:</span>
                <div class="lf">
                    <template v-for="(item, index) in port_name.ge">
                        <label>
                            <input type="checkbox" v-model="trust_portlist" :value="item.id" />
                            {{ item.name }}
                        </label>
                    </template>
                    <template v-if="port_name.xge">
                        <template v-for="item in port_name.xge">
                            <label>
                                <input type="checkbox" v-model="trust_portlist" :value="item.id" />
                                {{ item.name }}
                            </label>
                        </template>
                    </template>
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
import { parsePort } from "@/utils/common";
export default {
    name: "snooping",
    computed: {
        ...mapState(["lanMap", "port_name"]),
        admin() {
            return this.globalData.snooping_admin;
        },
        check() {
            return this.globalData.chaddr_check;
        },
        time() {
            return this.globalData.response_time;
        },
        portlist() {
            return this.globalData.trust_portlist;
        },
        validTime() {}
    },
    data() {
        return {
            snoopingTable: [],
            visible: false,
            snooping_admin: 0,
            chaddr_check: 0,
            response_time: "",
            trust_portlist: [],
            //  dialog的 type:  admin / check / time / portlist
            dialogType: "",
            dialogMethod: ""
        };
    },
    props: {
        globalData: {
            type: Object,
            required: true
        }
    },
    mounted() {
        this.snoopingTable = [
            {
                ipaddr: "192.168.1.1",
                macaddr: "38:3a:21:f0:01:b0",
                port_id: 1,
                vlan_id: 1,
                lease_time: 86400,
                entry_status: 0
            }
        ];
    },
    methods: {
        getData() {
            this.$http
                .get("/switch_dhcp?form=snooping_table")
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data && res.data.data.length) {
                            this.snoopingTable = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        updateData() {
            this.$emit("update-data");
        },
        postData(url, data) {
            this.$http
                .post(url, data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message.success(
                            this.lanMap[data.method] + this.lanMap["st_success"]
                        );
                        this.updateData();
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                    this.closeDialog();
                })
                .catch(err => {});
        },
        openDialog(flag, method = "add") {
            this.dialogType = flag;
            this.visible = true;
            if (flag === "time") {
                this.response_time = this.time;
            }
            if (flag === "portlist") {
                this.trust_portlist = parsePort(this.portlist);
                this.dialogMethod = method;
            }
        },
        closeDialog() {
            this.visible = false;
        },
        clearSnoopingTable() {
            this.$confirm()
                .then(_ => {
                    const data = {
                        method: "set",
                        param: {}
                    };
                    this.$http
                        .post("/switch_dhcp?form=snooping_flush", data)
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["clear"] +
                                        this.lanMap["st_success"]
                                );
                                this.getData();
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
        submitForm() {
            const actions = {
                admin() {
                    const data = {
                        method: "set",
                        param: {
                            snooping_admin: this.snooping_admin
                        }
                    };
                    const url = "/switch_dhcp?form=snooping_admin";
                    this.postData(url, data);
                },
                check() {
                    const data = {
                        method: "set",
                        param: {
                            chaddr_check: this.chaddr_check
                        }
                    };
                    const url = "/switch_dhcp?form=snooping_chaddr";
                    this.postData(url, data);
                },
                time() {
                    const data = {
                        method: "set",
                        param: {
                            response_time: this.response_time
                        }
                    };
                    const url = "/switch_dhcp?form=snooping_response";
                    this.postData(url, data);
                },
                portlist() {
                    if (!this.trust_portlist.toString()) {
                        this.closeDialog();
                        return;
                    }
                    const data = {
                        method: "set",
                        param: {
                            trust_portlist: this.trust_portlist
                                .sort((a, b) => a - b)
                                .toString()
                        }
                    };
                    let url;
                    if (this.dialogMethod === "add") {
                        url = "/switch_dhcp?form=snooping_trust_add";
                    } else {
                        url = "/switch_dhcp?form=snooping_trust_del";
                    }
                    this.postData(url, data);
                }
            };
            if (typeof actions[this.dialogType] === "function") {
                actions[this.dialogType].call(this);
            }
        }
    },
    watch: {
        admin() {
            this.snoopingTable = [];
            if (this.admin) {
                this.getData();
            }
        }
    }
};
</script>

<style lang="less" scoped>
.dhcp-snooping-item {
    margin: 20px 0 0 0;
    > span {
        display: inline-block;
        max-width: 50%;
        word-wrap: break-word;
        word-break: break-word;
        vertical-align: middle;
        &:first-child {
            width: 200px;
        }
    }
    > a {
        margin: 0 0 0 30px;
    }
    a + a {
        margin-left: 20px;
    }
}
.table-title {
    font-size: 18px;
    font-weight: 600;
    color: #67aef6;
}
.dhcp-dialog-content {
    span:first-child {
        display: inline-block;
        width: 180px;
    }
    select {
        width: 200px;
    }
    .tips {
        font-size: 14px;
        color: #666;
        margin-left: 12px;
    }
    &:after {
        content: "";
        display: table;
        clear: both;
    }
    > div {
        width: calc(~"100% - 120px");
        input[type="checkbox"] {
            vertical-align: middle;
        }
        label {
            display: inline-block;
            vertical-align: middle;
            width: 25%;
            line-height: 30px;
        }
    }
}
</style>