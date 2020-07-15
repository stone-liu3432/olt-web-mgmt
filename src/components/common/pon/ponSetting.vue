<template>
    <div class="pon-setting">
        <h2>{{ lanMap['pon_setting'] }}</h2>
        <hr />
        <nms-table :rows="ponSetting" border>
            <nms-table-column :label="lanMap['port_id']">
                <template slot-scope="rows">{{ rows.port_id | getPortName }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['optstate']">
                <template slot-scope="row">{{ row.optstate ? lanMap['on'] : lanMap['off'] }}</template>
            </nms-table-column>
            <nms-table-column prop="auth_type" :label="lanMap['auth_type']">
                <template slot-scope="rows">{{ def_auth_type[rows.auth_type] }}</template>
            </nms-table-column>
            <nms-table-column prop="auth_mode" :label="lanMap['auth_mode']">
                <template slot-scope="rows">
                    <template>{{ def_auth_mode[rows.auth_mode] }}</template>
                </template>
            </nms-table-column>
            <nms-table-column prop="p2p_flag" :label="lanMap['p2p_flag']">
                <template
                    slot-scope="rows"
                >{{ rows.p2p_flag === 1 ? lanMap['enable'] : lanMap['disable'] }}</template>
            </nms-table-column>
            <nms-table-column prop="rogue_mode" :label="lanMap['rogue_mode']">
                <template slot-scope="rows">{{ modes[rows.rogue_mode] }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['opt_limit']">
                <template slot-scope="rows">{{ `${rows.opt_min || "-"}(dBm)` }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['opt_below_limit']">
                <template
                    slot-scope="row"
                >{{ row.opt_min_action ? lanMap['add_to_deny'] : lanMap['no_operation'] }}</template>
            </nms-table-column>
            <!-- <nms-table-column :label="lanMap['opt_exceed_limit']">
                <template slot-scope="row">{{ lanMap['no_operation'] }}</template>
            </nms-table-column>-->
            <nms-table-column :label="lanMap['config']" width="160px">
                <template slot-scope="row">
                    <nms-dropdown @command="commandHandle">
                        <span>{{ lanMap['config'] }}</span>
                        <div slot="dropdown">
                            <template v-if="custom.pon_authmode">
                                <nms-dropdown-item
                                    :command="{ action: 'auth_mode', data: row }"
                                >{{ lanMap['auth_mode'] }}</nms-dropdown-item>
                            </template>
                            <nms-dropdown-item
                                :command="{ action: 'p2p_flag', data: row }"
                            >{{ (row.p2p_flag === 1 ? lanMap['off'] : lanMap['on']) + ' P2P' }}</nms-dropdown-item>
                            <nms-dropdown-item
                                :command="{ action: 'rogue_mode', data: row }"
                            >{{ lanMap['rogue_mode'] }}</nms-dropdown-item>
                            <template v-if="row.rogue_mode === 2">
                                <nms-dropdown-item
                                    :command="{ action: 'detection', data: row }"
                                >{{ lanMap['detection'] }}</nms-dropdown-item>
                            </template>
                            <nms-dropdown-item
                                :command="{ action: 'opt_limit', data: row }"
                            >{{ lanMap['opt_limit'] }}</nms-dropdown-item>
                            <nms-dropdown-item
                                :command="{ action: 'optstate', data: row }"
                            >{{ (row.optstate ? lanMap['off'] : lanMap['on']) + lanMap['optstate'] }}</nms-dropdown-item>
                        </div>
                    </nms-dropdown>
                </template>
            </nms-table-column>
        </nms-table>
        <div class="modal-dialog" v-if="isSetAuth">
            <div class="cover"></div>
            <div class="ponmgmt-cfg">
                <template v-if="dialogType === ''">
                    <div class="modal-header">{{ lanMap['pon_auth'] }}</div>
                    <div>
                        <div>{{ lanMap['port_id'] }}</div>
                        <span>{{ port_id }}</span>
                    </div>
                    <div>
                        <div>{{ lanMap['auth_type'] }}</div>
                        <select v-model.number="auth_type">
                            <option value="0">Auto</option>
                            <option value="1">Manual</option>
                        </select>
                    </div>
                    <div>
                        <div>{{ lanMap['auth_mode'] }}</div>
                        <select v-model.number="auth_mode">
                            <option value="0">MAC</option>
                            <option value="1">LOID</option>
                            <option value="2">LOID+password</option>
                            <option value="3">Hybrid</option>
                        </select>
                    </div>
                    <div>
                        <a href="javascript: void(0);" @click="set_auth">{{ lanMap['apply'] }}</a>
                        <a href="javascript: void(0);" @click="closeDialog">{{ lanMap['cancel'] }}</a>
                    </div>
                </template>
                <template v-if="dialogType === 'opt_limit'">
                    <div class="modal-header">{{ lanMap['opt_limit'] }}</div>
                    <div>
                        <div>{{ lanMap['port_id'] }}</div>
                        <span>{{ port_name.pon[port_id].name }}</span>
                    </div>
                    <div>
                        <div>{{ lanMap['lower_limit'] }}</div>
                        <input
                            type="text"
                            v-model.number="opt_min"
                            :style="{ 'border-color': isNaN(opt_min) || (opt_min && opt_min > -20) ? 'red' : '' }"
                        />
                        <span>dBm</span>
                    </div>
                    <div>
                        <div>{{ lanMap['opt_below_limit'] }}</div>
                        <select v-model.number="opt_min_action">
                            <option :value="0">{{ lanMap['no_operation'] }}</option>
                            <option :value="1">{{ lanMap['add_to_deny'] }}</option>
                        </select>
                    </div>
                    <div>
                        <a href="javascript: void(0);" @click="setOptLimit">{{ lanMap['apply'] }}</a>
                        <a href="javascript: void(0);" @click="closeDialog">{{ lanMap['cancel'] }}</a>
                    </div>
                </template>
                <div class="close" @click="closeDialog"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { debounce, isFunction } from "@/utils/common";
export default {
    name: "ponSetting",
    computed: mapState(["lanMap", "port_name", "change_url", "custom"]),
    data() {
        return {
            port_id: 0,
            auth_type: 0,
            auth_mode: 0,
            def_auth_type: ["Auto", "Manual"],
            def_auth_mode: ["mac", "LOID", "Loid+password", "hybrid"],
            isSetAuth: false,
            modes: ["OFF", "Auto", "Manual"],
            detect_mode: 0,
            ponSetting: [],
            dialogType: "",
            opt_min: 0,
            opt_min_action: 0
        };
    },
    created() {
        // this.getData();
    },
    activated() {
        this.getData();
    },
    methods: {
        getData() {
            this.ponSetting = [];
            this.$http
                .get(this.change_url.pon_setting)
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data && res.data.data.length) {
                            this.ponSetting = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        authConfirm(row) {
            this.isSetAuth = true;
            this.dialogType = "";
            this.port_id = row.port_id;
            this.auth_type = row.auth_type;
            this.auth_mode = row.auth_mode;
        },
        set_auth() {
            var params = {
                method: "set",
                param: {
                    port_id: this.port_id,
                    auth_type: this.auth_type,
                    auth_mode: this.auth_mode
                }
            };
            this.$http
                .post("/ponmgmt?form=authorize", params)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["st_success"]
                        });
                        this.getData();
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
            this.isSetAuth = false;
            this.port_id = 0;
        },
        closeDialog() {
            this.isSetAuth = false;
        },
        openP2PCfm(node) {
            const msg =
                this.lanMap["if_sure"] +
                (node.p2p_flag ? this.lanMap["off"] : this.lanMap["on"]) +
                " " +
                this.port_name.pon[node.port_id].name +
                " P2P ?";
            this.$confirm(msg)
                .then(_ => {
                    const post_data = {
                        method: "set",
                        param: {
                            port_id: node.port_id,
                            p2p_flag: node.p2p_flag ? 0 : 1
                        }
                    };
                    this.$http
                        .post("/ponmgmt?form=p2p", post_data)
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message({
                                    type: res.data.type,
                                    text: this.lanMap["setting_ok"]
                                });
                                this.getData();
                            } else if (res.data.code > 1) {
                                this.$message({
                                    type: res.data.type,
                                    text:
                                        "(" +
                                        res.data.code +
                                        ") " +
                                        res.data.message
                                });
                            }
                        })
                        .catch(err => {
                            // to do
                        });
                })
                .catch(_ => {});
        },
        setDetectMode(node) {
            this.detect_mode = node.rogue_mode;
            this.$confirm(
                <div class="modal-content-item">
                    <span>{this.lanMap["mode"]}</span>
                    <select value={this.detect_mode} onChange={this.modeChange}>
                        {this.modes.map((item, index) => {
                            return <option value={index}>{item}</option>;
                        })}
                    </select>
                </div>,
                { title: this.lanMap["set"], center: true }
            )
                .then(_ => {
                    if (this.detect_mode === node.rogue_mode) {
                        return;
                    }
                    const data = {
                        method: "set",
                        param: {
                            port_id: node.port_id,
                            rogue_mode: this.detect_mode
                        }
                    };
                    this.setMode(data);
                })
                .catch(_ => {});
        },
        modeChange(e) {
            this.detect_mode = Number(e.target.value);
        },
        setMode(data) {
            this.$http
                .post("/ponmgmt?form=rogueonu", data)
                .then(res => {
                    if (res.data.code === 1) {
                        if (data.param.rogue_mode === 2) {
                            this.$message.success(
                                this.lanMap["rogueonu_detect_tips"]
                            );
                        } else {
                            this.$message.success(this.lanMap["setting_ok"]);
                        }
                        this.getData();
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                })
                .catch(err => {});
        },
        manualDetect(rows) {
            const data = {
                method: "set",
                param: {
                    port_id: rows.port_id,
                    rogue_mode: 2
                }
            };
            debounce(this.setMode, 1000, this, data);
        },
        commandHandle({ action, data }) {
            const ACTIONS = {
                auth_mode(row) {
                    this.authConfirm(row);
                },
                p2p_flag(row) {
                    this.openP2PCfm(row);
                },
                rogue_mode(row) {
                    this.setDetectMode(row);
                },
                detection(row) {
                    this.manualDetect(row);
                },
                opt_limit(row) {
                    this.isSetAuth = true;
                    this.dialogType = "opt_limit";
                    this.port_id = row.port_id;
                    this.opt_min = row.opt_min;
                    this.opt_min_action = row.opt_min_action;
                },
                optstate(row) {
                    this.setOptState(row);
                }
            };
            if (isFunction(ACTIONS[action])) {
                ACTIONS[action].call(this, data);
            }
        },
        setOptState(row) {
            const msg =
                this.lanMap["if_sure"] +
                (row.optstate ? this.lanMap["off"] : this.lanMap["on"]) +
                " " +
                this.port_name.pon[row.port_id].name +
                this.lanMap["optstate"] +
                " ?";
            this.$confirm(msg)
                .then(_ => {
                    this.$http
                        .post("/ponmgmt?form=optstate", {
                            method: "set",
                            param: {
                                port_id: row.port_id,
                                optstate: Number(!row.optstate)
                            }
                        })
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["setting_ok"]
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
        setOptLimit() {
            if ((this.opt_min && this.opt_min > -20) || isNaN(this.opt_min)) {
                return this.$message.error(
                    this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["lower_limit"]
                );
            }
            this.$http
                .post("/ponmgmt?form=optical_range", {
                    method: "set",
                    param: {
                        port_id: this.port_id,
                        opt_min: Number(this.opt_min),
                        opt_min_action: this.opt_min_action,
                        opt_max: 0,
                        opt_max_action: 0
                    }
                })
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.getData();
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                })
                .catch(err => {});
            this.closeDialog();
        }
    }
};
</script>

<style lang="less" scoped>
div.pon-setting {
    margin-top: 20px;
    h2 {
        font-size: 24px;
        font-weight: 600;
        color: #67aef7;
        margin: 10px 0 20px 10px;
    }
    h3 {
        margin: 20px 0 20px 15px;
        font-size: 18px;
        font-weight: 500;
        color: #67aef7;
    }
    h3 + ul {
        margin: 0 0 0 10px;
        li {
            background: #2361a2;
            color: #fff;
        }
    }
    ul {
        margin: 0 0 0 10px;
    }
}
div.ponmgmt-cfg {
    width: 500px;
    height: 300px;
    border-radius: 10px;
    > div {
        margin: 20px;
        height: 30px;
        line-height: 30px;
        &:after {
            content: "";
            display: table;
            clear: both;
        }
        &:first-child {
            color: #67aef7;
            margin: 0;
            height: 60px;
            line-height: 60px;
        }
        > div {
            float: left;
            width: 200px;
            text-align: right;
            padding-right: 20px;
        }
        select {
            width: 150px;
            text-indent: 6px;
            border-radius: 5px;
            height: 30px;
            font-size: 15px;
            line-height: 30px;
        }
    }
    div.close {
        margin: 0;
        height: 60px;
    }
    a {
        width: 120px;
        padding: 0;
        margin-left: 70px;
        margin-top: 20px;
    }
}
div.modal-content-item {
    > span:first-child {
        display: inline-block;
        width: 120px;
    }
    select {
        width: 200px;
    }
}
</style>
