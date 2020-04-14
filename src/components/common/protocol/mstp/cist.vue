<template>
    <div>
        <h3>
            <span>{{ lanMap['info'] }}</span>
            <nms-button
                style="margin-left: 30px;"
                size="mini"
                @click="openDialog('info', cistBridge)"
            >{{ lanMap['config'] }}</nms-button>
            <nms-button
                style="margin-left: 30px;"
                size="mini"
                @click="setPriority"
            >{{ lanMap['config'] + lanMap['priority'] }}</nms-button>
        </h3>
        <div class="cist-bridge">
            <template v-for="item in infoEnum">
                <div class="cist-bridge-row">
                    <template v-for="key in item">
                        <div
                            class="cist-bridge-item"
                            :style="{ 'width': item.length === 1 ? '100%' : '' }"
                        >
                            <span>{{ lanMap[key] }}:</span>
                            <span>{{ key === 'root_port_name' ? (cistBridge[key] || 'None') : cistBridge[key] }}</span>
                        </div>
                    </template>
                </div>
            </template>
            <template v-for="(item, key) in timeEnum">
                <div class="cist-bridge-time">
                    <div>
                        <div>{{ lanMap[key] }}:</div>
                        <template v-for="sub in item">
                            <div>
                                <span>{{ lanMap[sub] }}:</span>
                                <span>{{ cistBridge[sub] }}</span>
                            </div>
                        </template>
                    </div>
                </div>
            </template>
        </div>
        <h3>{{ lanMap['port_list'] }}</h3>
        <nms-table :rows="cistPorts" border>
            <nms-table-column :label="lanMap['port_id']">
                <template slot-scope="row">{{ row.port_id | getPortName }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['port_role']">
                <template slot-scope="row">{{ PORT_ROLE_MAP[row.port_role] }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['port_priority']" prop="port_priority"></nms-table-column>
            <nms-table-column :label="lanMap['port_state']">
                <template slot-scope="row">{{ PORT_STATE_MAP[row.port_state] }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['admin_external_cost']">
                <template slot-scope="row">{{ row.admin_external_cost ? 'Manual' : 'Auto' }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['external_cost']" prop="external_cost"></nms-table-column>
            <nms-table-column :label="lanMap['config']">
                <template slot-scope="row">
                    <nms-button type="text" @click="openDialog('port', row)">{{ lanMap['config'] }}</nms-button>
                </template>
            </nms-table-column>
        </nms-table>
        <nms-dialog :visible.sync="dialogVisible" width="535px">
            <div slot="title">{{ lanMap['config'] }}</div>
            <cist-form ref="cist-form"></cist-form>
            <div slot="footer">
                <nms-button @click="submitForm('cist-form')">{{ lanMap['apply'] }}</nms-button>
                <nms-button @click="dialogVisible = false;">{{ lanMap['cancel'] }}</nms-button>
            </div>
        </nms-dialog>
        <nms-dialog :visible.sync="priVisible" width="500px">
            <div slot="title">{{ lanMap['config'] }}</div>
            <msti-form ref="msti-form"></msti-form>
            <div slot="footer">
                <nms-button @click="submitForm('msti-form')">{{ lanMap['apply'] }}</nms-button>
                <nms-button @click="priVisible = false;">{{ lanMap['cancel'] }}</nms-button>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import cistForm from "./cistForm";
import mstiForm from "./mstiForm";
export default {
    name: "cistInfo",
    components: { cistForm, mstiForm },
    computed: {
        ...mapState(["lanMap"])
    },
    data() {
        return {
            PORT_ROLE_MAP: [
                "Disable",
                "Root",
                "Designated",
                "Alternate",
                "Backup",
                "Master"
            ],
            PORT_STATE_MAP: [
                "Discarding",
                "Discarding",
                "Learning",
                "Forwarding",
                "Discarding"
            ],
            infoEnum: [
                ["msti_vlanlist"],
                ["bridge_prio", "bridge_addr"],
                ["designate_prio", "designate_addr"],
                ["regional_prio", "regional_addr"],
                ["root_port_name"],
                ["root_path_cost"],
                ["internal_path_cost"]
            ],
            timeEnum: {
                bridge_time: [
                    "bridge_hello_time",
                    "bridge_forward_delay",
                    "bridge_max_age",
                    "max_hops"
                ],
                root_time: [
                    "root_hello_time",
                    "root_forward_delay",
                    "root_max_age"
                ]
            },
            cistBridge: {
                // msti_vlanlist: "1-4094",
                // bridge_addr: "00:00:00:00:00:11",
                // bridge_prio: 32768,
                // designate_addr: "00:00:00:00:00:11",
                // designate_prio: 32768,
                // regional_addr: "00:00:00:00:00:11",
                // regional_prio: 32768,
                // root_port_name: "port",
                // internal_path_cost: 0,
                // root_path_cost: 0,
                // bridge_max_age: 12,
                // bridge_forward_delay: 15,
                // bridge_hello_time: 20,
                // max_hops: 10,
                // root_hello_time: 8,
                // root_forward_delay: 15,
                // root_max_age: 20
            },
            cistPorts: [
                // {
                //     port_id: 5,
                //     port_role: 0,
                //     port_priority: 0,
                //     port_state: 0,
                //     admin_external_cost: 0,
                //     external_cost: 0
                // }
            ],
            dialogVisible: false,
            priVisible: false
        };
    },
    created() {
        this.getBridge();
        this.getCistPort();
    },
    methods: {
        getBridge() {
            this.cistBridge = {};
            this.$http
                .get("/switch_mstp?form=cist_bridge_get")
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.cistBridge = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        getCistPort() {
            this.cistPorts = [];
            this.$http
                .get("/switch_mstp?form=cist_port_get")
                .then(res => {
                    if (res.data.code === 1) {
                        if (Array.isArray(res.data.data)) {
                            this.cistPorts = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        openDialog(type, data) {
            this.dialogVisible = true;
            this.$nextTick(_ => {
                this.$refs["cist-form"].init(type, data);
            });
        },
        submitForm(formName) {
            this.$refs[formName].validate((type, val) => {
                const ACTIONS = {
                    info(param) {
                        const {
                            set_bridge_max_age,
                            set_bridge_hello_time,
                            set_max_hops,
                            set_bridge_forward_delay
                        } = param;
                        if (
                            !set_bridge_max_age &&
                            !set_bridge_hello_time &&
                            !set_max_hops &&
                            !set_bridge_forward_delay
                        ) {
                            this.$message.info(this.lanMap["modify_tips"]);
                            this.dialogVisible = false;
                            return;
                        }
                        return {
                            url: "/switch_mstp?form=cist_bridge_set",
                            data: {
                                method: "set",
                                param
                            }
                        };
                    },
                    port(param) {
                        const {
                            set_admin_external_cost,
                            set_port_priority
                        } = param;
                        if (!set_admin_external_cost && !set_port_priority) {
                            this.$message.info(this.lanMap["modify_tips"]);
                            this.dialogVisible = false;
                            return;
                        }
                        const url = set_port_priority
                            ? "/switch_mstp?form=msti_port_set"
                            : "/switch_mstp?form=cist_port_set";
                        return {
                            url,
                            data: {
                                method: "set",
                                param
                            }
                        };
                    },
                    pri(param) {
                        if (param.bridge_prio === this.cistBridge.bridge_prio) {
                            this.$message.info(this.lanMap["modify_tips"]);
                            this.priVisible = false;
                            return;
                        }
                        return {
                            url: "/switch_mstp?form=msti_priority_set",
                            data: {
                                method: "set",
                                param
                            }
                        };
                    }
                };
                if (typeof ACTIONS[type] === "function") {
                    const res = ACTIONS[type].call(this, val);
                    if (res) {
                        const { url, data } = res;
                        this.$http
                            .post(url, data)
                            .then(res => {
                                if (res.data.code === 1) {
                                    this.$message.success(
                                        this.lanMap["setting_ok"]
                                    );
                                    (type === "info" || type === "pri") &&
                                        this.getBridge();
                                    type === "port" && this.getCistPort();
                                } else {
                                    this.$message.error(
                                        `(${res.data.code}) ${res.data.message}`
                                    );
                                }
                                this.dialogVisible = false;
                                this.priVisible = false;
                            })
                            .catch(err => {});
                    }
                }
            });
        },
        setPriority() {
            this.priVisible = true;
            this.$nextTick(_ => {
                this.$refs["msti-form"].init("pri", this.cistBridge);
            });
        }
    }
};
</script>

<style lang="less" scoped>
.cist-bridge {
    .cist-bridge-row {
        .cist-bridge-item {
            margin: 6px 0;
            float: left;
            width: 400px;
            span {
                display: inline-block;
                vertical-align: middle;
                &:first-child {
                    width: 180px;
                    text-align: right;
                    padding-right: 12px;
                }
                & + span {
                    max-width: 800px;
                    word-wrap: break-word;
                    word-break: break-all;
                }
            }
        }
        &::after {
            content: "";
            display: table;
            clear: both;
        }
    }
}

h3 {
    color: @titleColor;
    font-size: 20px;
    font-weight: 500;
    margin: 12px 0;
}
.cist-bridge-time {
    > div {
        margin: 6px 0;
        > div {
            float: left;
            width: 180px;
            line-height: 28px;
            > span {
                display: inline-block;
                vertical-align: middle;
                padding-left: 6px;
            }
            &:first-child {
                padding-right: 12px;
                text-align: right;
            }
        }
        &:after {
            content: "";
            display: table;
            clear: both;
        }
    }
}
</style>