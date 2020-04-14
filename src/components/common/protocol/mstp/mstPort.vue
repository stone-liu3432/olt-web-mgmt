<template>
    <div>
        <nms-table :rows="mstPorts" border>
            <nms-table-column :label="lanMap['port_id']" prop="port_id">
                <template slot-scope="row">{{ row.port_id | getPortName }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['bpdu_guard_port']">
                <template
                    slot-scope="row"
                >{{ row.bpdu_guard_port ? lanMap['enable'] : lanMap['disable'] }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['loop_detect_guard']">
                <template
                    slot-scope="row"
                >{{ row.loop_detect_guard ? lanMap['enable'] : lanMap['disable'] }}</template>
            </nms-table-column>
            <!-- <nms-table-column :label="lanMap['edge_port']">
                <template slot-scope="row">
                    {{ row.auto_edge_port ? 'auto' : row.admin_edge_port ? 'true' : 'false' }}

                </template>
            </nms-table-column>-->
            <nms-table-column :label="lanMap['edge_port']">
                <template
                    slot-scope="row"
                >{{ row.auto_edge_port === 1 ? 'Auto' : row.admin_edge_port ? 'True' : 'False' }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['admin_p2p']">
                <template slot-scope="row">{{ ADMIN_P2P_MAP[row.admin_p2p] || '' }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['oper_p2p']">
                <template slot-scope="row">{{ row.oper_p2p ? 'true' : 'false' }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['config']" width="140px">
                <template slot-scope="row">
                    <nms-dropdown @command="dropdownClick">
                        <span>{{ lanMap['config'] }}</span>
                        <div slot="dropdown">
                            <nms-dropdown-item
                                :command="{ action: 'bpdu', data: row }"
                            >{{ lanMap['bpdu_guard_port'] }}</nms-dropdown-item>
                            <nms-dropdown-item
                                :command="{ action: 'loop', data: row }"
                            >{{ lanMap['loop_detect_guard'] }}</nms-dropdown-item>
                            <nms-dropdown-item
                                :command="{ action: 'edge', data: row }"
                            >{{ lanMap['admin_edge_port'] }}</nms-dropdown-item>
                            <nms-dropdown-item
                                :command="{ action: 'p2p', data: row }"
                            >{{ lanMap['admin_p2p'] }}</nms-dropdown-item>
                            <nms-dropdown-item
                                :command="{ action: 'mcheck', data: row }"
                            >{{ lanMap['mcheck'] }}</nms-dropdown-item>
                        </div>
                    </nms-dropdown>
                </template>
            </nms-table-column>
        </nms-table>
        <nms-dialog :visible.sync="dialogVisible" width="500px">
            <span slot="title">{{ lanMap['config'] }}</span>
            <mstp-port-form ref="mstp-port-form"></mstp-port-form>
            <div slot="footer">
                <nms-button @click="submitForm('mstp-port-form')">{{ lanMap['apply'] }}</nms-button>
                <nms-button @click="dialogVisible = false;">{{ lanMap['cancel'] }}</nms-button>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import mstpPortForm from "./mstpPortForm";
export default {
    name: "mstPort",
    components: { mstpPortForm },
    computed: {
        ...mapState(["lanMap"])
    },
    data() {
        return {
            ADMIN_P2P_MAP: ["auto", "true", "false"],
            dialogVisible: false,
            type: "",
            cache: {},
            mstPorts: [
                // {
                //     port_id: 5,
                //     bpdu_guard_port: 0,
                //     loop_detect_guard: 0,
                //     admin_edge_port: 0,
                //     auto_edge_port: 0,
                //     admin_p2p: 0,
                //     oper_p2p: 0
                // }
            ]
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.mstPorts = [];
            this.$http
                .get("/switch_mstp?form=port_status_get")
                .then(res => {
                    if (res.data.code === 1) {
                        if (Array.isArray(res.data.data)) {
                            this.mstPorts = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        dropdownClick({ action, data }) {
            if (action === "mcheck") {
                this.triggerMcheck(data);
            } else {
                this.openDialog(action, data);
            }
        },
        openDialog(type, row) {
            this.dialogVisible = true;
            this.cache = row;
            this.$nextTick(_ => {
                this.$refs["mstp-port-form"].init(type, row);
            });
        },
        triggerMcheck(row) {
            this.$confirm()
                .then(_ => {
                    const url = "/switch_mstp?form=mcheck_trigger",
                        data = {
                            method: "set",
                            param: {
                                port_id: row.port_id,
                                mcheck: 1
                            }
                        };
                    this.postData(url, data)
                        .then(_ => {
                            this.getData();
                            this.dialogVisible = false;
                        })
                        .catch(_ => {
                            this.dialogVisible = false;
                        });
                })
                .catch(err => {});
        },
        submitForm(formName) {
            this.$refs[formName].validate((type, val) => {
                const ACTIONS = {
                    bpdu(param) {
                        if (!param.set_bpdu_guard_port) {
                            this.$message.info(this.lanMap["modify_tips"]);
                            this.dialogVisible = false;
                            return;
                        }
                        return {
                            url: "/switch_mstp?form=cist_port_set",
                            data: {
                                method: "set",
                                param
                            }
                        };
                    },
                    loop(param) {
                        if (
                            this.cache.loop_detect_guard ===
                            param.loop_detect_guard
                        ) {
                            this.$message.info(this.lanMap["modify_tips"]);
                            this.dialogVisible = false;
                            return;
                        }
                        return {
                            url: "/switch_mstp?form=loop_detect_guard",
                            data: {
                                method: "set",
                                param
                            }
                        };
                    },
                    p2p(param) {
                        if (!param.set_admin_p2p) {
                            this.$message.info(this.lanMap["modify_tips"]);
                            this.dialogVisible = false;
                            return;
                        }
                        return {
                            url: "/switch_mstp?form=cist_port_set",
                            data: {
                                method: "set",
                                param
                            }
                        };
                    },
                    edge(param) {
                        if (
                            (param.admin_edge_port === 0 &&
                                this.cache.auto_edge_port === 1) ||
                            (param.admin_edge_port === 1 &&
                                this.cache.auto_edge_port === 0 &&
                                this.cache.admin_edge_port === 1) ||
                            (param.admin_edge_port === 2 &&
                                this.cache.auto_edge_port === 0 &&
                                this.cache.admin_edge_port === 0)
                        ) {
                            this.$message.info(this.lanMap["modify_tips"]);
                            this.dialogVisible = false;
                            return;
                        }
                        return {
                            url: "/switch_mstp?form=cist_edge_port_set",
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
                        this.postData(url, data)
                            .then(_ => {
                                this.dialogVisible = false;
                                this.getData();
                            })
                            .catch(_ => {
                                this.dialogVisible = false;
                            });
                    }
                }
            });
        },
        postData(url, data) {
            return this.$http
                .post(url, data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        return Promise.resolve(res);
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                        return Promise.reject(res);
                    }
                })
                .catch(err => {
                    return Promise.reject(err);
                });
        }
    }
};
</script>

<style lang="less" scoped>
</style>