<template>
    <div class="pon-setting">
        <h2>{{ lanMap['pon_setting'] }}</h2>
        <hr />
        <h3>
            {{ lanMap['port_isolation'] }}
            <div class="switch" @click="setPortIsolate">
                <input type="checkbox" v-model="port_isolate" />
                <span :class="{ 'checked' : port_isolate }"></span>
            </div>
            <span class="tips">( {{ lanMap['pon_isolation_tips'] }} )</span>
        </h3>
        <h3>{{ lanMap['pon_setting'] }}</h3>
        <nms-table :rows="ponSetting" border>
            <nms-table-column :label="lanMap['port_id']">
                <template slot-scope="rows">{{ rows.port_id | getPortName }}</template>
            </nms-table-column>
            <nms-table-column prop="auth_type" :label="lanMap['auth_type']">
                <template slot-scope="rows">{{ def_auth_type[rows.auth_type] }}</template>
            </nms-table-column>
            <nms-table-column prop="auth_mode" :label="lanMap['auth_mode']">
                <template slot-scope="rows">
                    <div class="pon-setting-table-content">{{ def_auth_mode[rows.auth_mode] }}</div>
                    <div>
                        <a
                            href="javascript:void(0);"
                            class="btn-text"
                            @click="auth_confirm(rows.port_id)"
                        >{{ lanMap['config'] }}</a>
                    </div>
                </template>
            </nms-table-column>
            <nms-table-column prop="p2p_flag" :label="lanMap['p2p_flag']">
                <template slot-scope="rows">
                    <div
                        class="pon-setting-table-content"
                    >{{ rows.p2p_flag === 1 ? lanMap['enable'] : lanMap['disable'] }}</div>
                    <div>
                        <template v-if="rows.p2p_flag === 1">
                            <a
                                href="javascript:void(0);"
                                class="btn-text"
                                @click="openP2PCfm(rows)"
                            >{{ lanMap['off'] }}</a>
                        </template>
                        <template v-else>
                            <a
                                href="javascript:void(0);"
                                class="btn-text"
                                @click="openP2PCfm(rows)"
                            >{{ lanMap['on'] }}</a>
                        </template>
                    </div>
                </template>
            </nms-table-column>
            <nms-table-column prop="rogue_mode" :label="lanMap['rogue_mode']">
                <template slot-scope="rows">
                    <div class="pon-setting-table-content">{{ modes[rows.rogue_mode] }}</div>
                    <div>
                        <a
                            href="javascript: void(0);"
                            class="btn-text"
                            @click="setDetectMode(rows)"
                        >{{ lanMap['config'] }}</a>
                        <a
                            href="javascript: void(0);"
                            class="btn-text"
                            v-if="rows.rogue_mode === 2"
                            @click="manualDetect(rows)"
                        >{{ lanMap['detection'] }}</a>
                    </div>
                </template>
            </nms-table-column>
        </nms-table>
        <div class="modal-dialog" v-if="isSetAuth">
            <div class="cover"></div>
            <div class="ponmgmt-cfg">
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
                    <a href="javascript:void(0);" @click="set_auth">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" @click="cancel_confirm">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="cancel_confirm"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { debounce } from "@/utils/common";
export default {
    name: "ponSetting",
    computed: mapState(["lanMap", "port_name", "change_url"]),
    data() {
        return {
            port_id: 0,
            auth_type: 0,
            auth_mode: 0,
            def_auth_type: ["Auto", "Manual"],
            def_auth_mode: ["mac", "LOID", "Loid+password", "hybrid"],
            pon_authorize: {},
            isSetAuth: false,
            p2pMsg: "",
            p2p: [],
            port_isolate: 0,
            _timer: false,
            modes: ["OFF", "Auto", "Manual"],
            rogue_onu_list: [],
            detect_mode: 0,
            ponSetting: []
        };
    },
    created() {
        // this.getData();
    },
    activated() {
        this.getData();
        this.getPortIsolation();
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
                .catch(err => {
                    // to do
                });
        },
        auth_confirm(port_id) {
            this.isSetAuth = true;
            this.port_id = port_id;
            this.ponSetting.forEach(item => {
                if (item.port_id === port_id) {
                    this.auth_type = item.auth_type;
                    this.auth_mode = item.auth_mode;
                }
            });
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
        cancel_confirm() {
            this.isSetAuth = false;
            this.port_id = 0;
            this.auth_type = 0;
            this.auth_mode = 0;
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
        getPortIsolation() {
            this.$http
                .get("/switch_isolate?form=isolate")
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.port_isolate = !!res.data.data.isolate_status;
                        }
                    }
                })
                .catch(err => {});
        },
        setPortIsolate() {
            if (this._timer) {
                this.$message({
                    type: "warning",
                    text: this.lanMap["click_often"]
                });
                return;
            }
            this._timer = true;
            this.$http
                .post("/switch_isolate?form=isolate", {
                    method: "set",
                    param: {
                        isolate_status: Number(!this.port_isolate)
                    }
                })
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: "success",
                            text: this.lanMap["st_success"]
                        });
                        this.getPortIsolation();
                    } else {
                        this.$message({
                            type: res.data.type,
                            text: `(${res.data.code}) ${res.data.message}`
                        });
                    }
                })
                .catch(err => {});
            setTimeout(_ => {
                this._timer = false;
            }, 1000);
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
div.switch {
    display: inline-block;
    margin: 20px 20px 20px 20px;
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
    & + span.tips {
        font-size: 14px;
        color: #666;
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
.pon-setting-table-content {
    line-height: 23px;
    float: left;
    width: 50%;
    & + div {
        line-height: 23px;
        width: 40%;
        float: left;
        text-align: center;
        a {
            vertical-align: initial;
        }
    }
}
</style>
