<template>
    <div class="port-vlan-set">
        <nms-table :rows="pvData" border>
            <nms-table-column type="expand">
                <template slot-scope="row">
                    <template v-if="row.port_type === 2">
                        <div class="nms-table-expand-item">
                            <span>{{ lanMap["vlan_list"] }}:</span>
                            <span>{{ row.tagged_vlan }}</span>
                        </div>
                    </template>
                    <template v-if="row.port_type === 3">
                        <div class="nms-table-expand-item">
                            <span>{{ lanMap["tagged"] }}:</span>
                            <span>{{ row.tagged_vlan }}</span>
                        </div>
                        <div class="nms-table-expand-item">
                            <span>{{ lanMap["untagged"] }}:</span>
                            <span>{{ row.untagged_vlan }}</span>
                        </div>
                    </template>
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['port_id']">
                <template slot-scope="row">{{
                    row.port_id | getPortName
                }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['port_type']">
                <template slot-scope="row">{{
                    PORT_TYPE_MAP[row.port_type]
                }}</template>
            </nms-table-column>
            <nms-table-column
                :label="lanMap['pvid']"
                prop="pvid"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['priority']"
                prop="priority"
            ></nms-table-column>
            <!-- <nms-table-column :label="lanMap['tagged']">
                <template slot-scope="row">{{
                    row.tagged_vlan || "-"
                }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['untagged']">
                <template slot-scope="row">{{
                    row.untagged_vlan || "-"
                }}</template>
            </nms-table-column> -->
            <nms-table-column :label="lanMap['config']">
                <template slot-scope="row">
                    <nms-dropdown @command="dropdownClick">
                        <span>{{ lanMap["config"] }}</span>
                        <div slot="dropdown">
                            <nms-dropdown-item
                                :command="{ action: 'port_type', row }"
                                >{{ lanMap["port_type"] }}
                            </nms-dropdown-item>
                            <nms-dropdown-item
                                :command="{ action: 'pvid', row }"
                                >{{ lanMap["pvid"] }}
                            </nms-dropdown-item>
                            <template v-if="row.port_type !== 1">
                                <nms-dropdown-item
                                    :command="{ action: 'add_vlan', row }"
                                    >{{ lanMap["add_vlan_list"] }}
                                </nms-dropdown-item>
                                <nms-dropdown-item
                                    :command="{ action: 'del_vlan', row }"
                                    >{{ lanMap["del_vlan_list"] }}
                                </nms-dropdown-item>
                            </template>
                        </div>
                    </nms-dropdown>
                </template>
            </nms-table-column>
        </nms-table>
        <div class="modal-dialog" v-if="modal_show">
            <div class="cover"></div>
            <!-- port vlan basic config -->
            <div class="pv-type" v-if="port_type_show" key="pv-type">
                <div class="pv-type-item">
                    <span>{{ lanMap["port_id"] }}</span>
                    <span>
                        {{ row.port_id | getPortName }}
                    </span>
                </div>
                <div class="pv-type-item">
                    <span>{{ lanMap["port_type"] }}</span>
                    <span>
                        <select v-model.number="port_type">
                            <option :value="1">Access</option>
                            <option :value="2">Trunk</option>
                            <option :value="3">Hybrid</option>
                        </select>
                    </span>
                </div>
                <div>
                    <a
                        href="javascript:void(0);"
                        @click="submit_set_port_type"
                        >{{ lanMap["apply"] }}</a
                    >
                    <a
                        href="javascript:void(0);"
                        @click="close_modal_porttype"
                        >{{ lanMap["cancel"] }}</a
                    >
                </div>
                <div class="close" @click="close_modal_porttype"></div>
            </div>
            <!-- port vlan default vlan -->
            <div class="pv-def-vid" v-if="port_defvid_show" key="pv-def-vid">
                <div class="pv-defvlan-item">
                    <span>{{ lanMap["port_id"] }}</span>
                    <span>
                        {{ row.port_id | getPortName }}
                    </span>
                </div>
                <div class="pv-defvlan-item">
                    <span>{{ lanMap["def_vlan_id"] }}</span>
                    <span>
                        <input
                            type="text"
                            v-focus
                            v-model.number="pvid"
                            :style="{
                                'border-color':
                                    pvid < 1 || pvid > 4094 ? 'red' : '',
                            }"
                        />
                    </span>
                </div>
                <div class="pv-defvlan-item">
                    <span>{{ lanMap["priority"] }}</span>
                    <span>
                        <select v-model.number="priority">
                            <option :value="0">0</option>
                            <template v-for="i in 7">
                                <option :value="i">{{ i }}</option>
                            </template>
                        </select>
                    </span>
                </div>
                <div>
                    <a
                        href="javascript:void(0);"
                        @click="submit_set_pv_def_vlan"
                        >{{ lanMap["apply"] }}</a
                    >
                    <a href="javascript:void(0);" @click="close_pv_def_vlan">{{
                        lanMap["cancel"]
                    }}</a>
                </div>
                <div class="close" @click="close_pv_def_vlan"></div>
            </div>
            <!-- port vlan tag/untag vlan list -->
            <div class="pv-vlan-list" v-if="port_vlist_show" key="pv-clan-list">
                <div>
                    <h3 v-if="set_vlist_type === 1">{{ lanMap["add"] }}</h3>
                    <h3 v-if="set_vlist_type === 0">{{ lanMap["delete"] }}</h3>
                </div>
                <div class="pv-vlist-item">
                    <span>{{ lanMap["port_id"] }}</span>
                    <span>
                        {{ row.port_id | getPortName }}
                    </span>
                </div>
                <div class="pv-vlist-item">
                    <span>{{ lanMap["port_type"] }}</span>
                    <span>{{ PORT_TYPE_MAP[row.port_type] }}</span>
                </div>
                <div class="pv-vlist-item">
                    <span>{{ lanMap["vlan_list"] }}</span>
                    <span>
                        <input
                            type="text"
                            v-focus
                            v-model="vlan_list"
                            placeholder="ex: 100,200-300,400"
                        />
                    </span>
                </div>
                <div class="pv-vlist-item">
                    <span>{{ lanMap["vlan_mode"] }}</span>
                    <span>
                        <select
                            v-model.number="vlan_mode"
                            :disabled="row.port_type !== 3"
                        >
                            <option :value="1">{{ lanMap["tagged"] }}</option>
                            <option :value="2">{{ lanMap["untagged"] }}</option>
                        </select>
                    </span>
                </div>
                <div
                    style="
                        margin: 15px 0;
                        font-size: 14px;
                        color: #67aef7;
                        text-align: center;
                        height: 16px;
                    "
                >
                    <template v-if="row.link_aggregation">
                        {{ lanMap["link_aggregation_tips"] }}
                    </template>
                </div>
                <div>
                    <a
                        href="javascript:void(0);"
                        v-if="this.set_vlist_type === 1"
                        @click="submit_add_pv_vlist"
                        >{{ lanMap["apply"] }}</a
                    >
                    <a
                        href="javascript:void(0);"
                        v-if="this.set_vlist_type === 0"
                        @click="submit_del_pv_vlist"
                        >{{ lanMap["apply"] }}</a
                    >
                    <a href="javascript:void(0);" @click="close_pv_vlist">{{
                        lanMap["cancel"]
                    }}</a>
                </div>
                <div class="pv-vlist-tips">
                    <i></i>
                    <div>
                        <p>{{ lanMap["pv_vlist_tips"] }}</p>
                        <p>ex: 100,200-300,400</p>
                        <p>{{ lanMap["pv_vmode_tips"] }}</p>
                    </div>
                </div>
                <div class="close" @click="close_pv_vlist"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { isFunction } from "@/utils/common";
export default {
    name: "pvSet",
    props: {
        pvData: {
            type: Array,
            default: () => [],
        },
    },
    computed: mapState(["lanMap", "port_name"]),
    data() {
        return {
            modal_show: false,
            PORT_TYPE_MAP: { 1: "Access", 2: "Trunk", 3: "Hybrid" },
            port_type: 0,
            pvid: 0,
            priority: 0,
            vlan_list: "",
            vlan_mode: 1,
            set_vlist_type: 0, //  0 -> delete   1 -> add
            port_type_show: false,
            port_defvid_show: false,
            port_vlist_show: false,
            row: {},
            // pvData: [
            //     {
            //         port_id: 1,
            //         port_type: 2,
            //         pvid: 1,
            //         priority: 0,
            //         tagged_vlan: " ",
            //         untagged_vlan: "1",
            //         link_aggregation: 0,
            //     },
            // ],
        };
    },
    methods: {
        set_port_type() {
            this.modal_show = true;
            this.port_type_show = true;
            this.port_type = this.row.port_type;
        },
        submit_set_port_type() {
            if (this.port_type === this.row.port_type) {
                this.$message.info(this.lanMap["modify_tips"]);
                return;
            }
            var post_params = {
                method: "set",
                param: {
                    port_id: this.row.port_id,
                    port_type: this.port_type,
                },
            };
            this.$http
                .post("/switch_port?form=vlan_type", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.$emit("refresh-data");
                    } else {
                        this.$message.error(
                            "(" + res.data.code + ") " + res.data.message
                        );
                    }
                })
                .catch((err) => {})
                .finally(() => {
                    this.close_modal_porttype();
                });
        },
        close_modal_porttype() {
            this.modal_show = false;
            this.port_type_show = false;
        },
        set_pv_def_vlan() {
            this.modal_show = true;
            this.port_defvid_show = true;
            this.pvid = this.row.pvid;
            this.priority = this.row.priority;
        },
        submit_set_pv_def_vlan() {
            if (this.pvid < 1 || this.pvid > 4094 || isNaN(this.pvid)) {
                this.$message.error(
                    this.lanMap["param_error"] + ": " + this.lanMap["pvid"]
                );
                return;
            }
            const flags = { pvid: 0x1, priority: 0x2 };
            const flag = Object.keys(flags).reduce((pre, item) => {
                if (this[item] !== this.row[item]) {
                    pre |= flags[item];
                }
                return pre;
            }, 0);
            if (!flag) {
                this.$message.info(this.lanMap["modify_tips"]);
                return;
            }
            var post_params = {
                method: "set",
                param: {
                    flags: flag,
                    port_id: this.row.port_id,
                    pvid: this.pvid,
                    priority: this.priority,
                },
            };
            this.$http
                .post("/switch_port?form=defaultvlan", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.$emit("refresh-data");
                    } else {
                        this.$message.error(
                            "(" + res.data.code + ") " + res.data.message
                        );
                        if (res.data.type === "warning") {
                            this.$emit("refresh-data");
                        }
                    }
                })
                .catch((err) => {})
                .finally(() => {
                    this.close_pv_def_vlan();
                });
        },
        close_pv_def_vlan() {
            this.modal_show = false;
            this.port_defvid_show = false;
        },
        set_pv_vlist_add() {
            this.modal_show = true;
            this.port_vlist_show = true;
            this.set_vlist_type = 1;
        },
        set_pv_vlist_del() {
            this.modal_show = true;
            this.port_vlist_show = true;
            this.set_vlist_type = 0;
        },
        submit_add_pv_vlist() {
            var vlist;
            if (this.row.port_type === 1) {
                vlist = this.row.untagged_vlan;
            }
            if (this.row.port_type === 2) {
                vlist = this.row.tagged_vlan;
            }
            if (this.row.port_type === 3) {
                vlist = this.row.tagged_vlan + "," + this.row.untagged_vlan;
            }
            vlist = vlist.replace(/^\s*,|\s+|,\s*$/g, "");
            if (!this.vlan_list) {
                this.$message.error(
                    this.lanMap["param_error"] + ": " + this.lanMap["vlan_list"]
                );
                return;
            }
            if (vlist && this.vlan_list.replace(/\s+/g, "") === vlist) {
                this.$message.info(this.lanMap["modify_tips"]);
                return;
            }
            var post_params = {
                method: "set",
                param: {
                    port_id: this.row.port_id,
                    port_type: this.row.port_type,
                    vlan_list: this.vlan_list.replace(/\s+/g, ""),
                    vlan_mode: this.vlan_mode, // (hybrid)
                },
            };
            this.$http
                .post("/switch_port?form=vlan", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"],
                        });
                        this.$emit("refresh-data");
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message,
                        });
                        if (res.data.type === "warning") {
                            this.$emit("refresh-data");
                        }
                    }
                })
                .catch((err) => {})
                .finally(() => {
                    this.close_pv_vlist();
                });
        },
        submit_del_pv_vlist() {
            var post_params = {
                method: "delete",
                param: {
                    port_id: this.row.port_id,
                    port_type: this.row.port_type,
                    vlan_list: this.vlan_list.replace(/\s+/g, ""),
                    vlan_mode: this.vlan_mode, // (hybrid)
                },
            };
            this.$http
                .post("/switch_port?form=vlan", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.$emit("refresh-data");
                    } else if (res.data.code > 1) {
                        this.$message.error(
                            "(" + res.data.code + ") " + res.data.message
                        );
                        if (res.data.type === "warning") {
                            this.$emit("refresh-data");
                        }
                    }
                })
                .catch((err) => {})
                .finally(() => {
                    this.close_pv_vlist();
                });
        },
        close_pv_vlist() {
            this.modal_show = false;
            this.port_vlist_show = false;
        },
        dropdownClick({ action, row }) {
            const ACTIONS = {
                port_type(row) {
                    this.set_port_type();
                },
                pvid(row) {
                    this.set_pv_def_vlan();
                },
                add_vlan(row) {
                    this.set_pv_vlist_add();
                },
                del_vlan(row) {
                    this.set_pv_vlist_del();
                },
            };
            if (isFunction(ACTIONS[action])) {
                this.row = row;
                ACTIONS[action].call(this, row);
            }
        },
    },
};
</script>

<style lang="less" scoped>
a {
    font-size: 16px;
    font-weight: normal;
    width: 120px;
    padding: 0;
}
select {
    width: 120px;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
    text-indent: 6px;
    border-radius: 3px;
    &:focus {
        border-radius: 3px;
    }
}
div.port-vlan-set {
    > div.pv-set-item {
        margin: 10px 0 10px 10px;
        height: 30px;
        > span {
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 120px;
            max-width: 800px;
            height: 30px;
            line-height: 30px;
            vertical-align: middle;
            &:first-child {
                width: 130px;
            }
            a {
                box-sizing: border-box;
            }
        }
        a.large-btn {
            padding: 0 20px;
            width: auto;
        }
    }
}
div.modal-dialog {
    div.pv-type {
        width: 500px;
        height: 220px;
        background: #fff;
        > div.pv-type-item {
            margin: 20px 0;
        }
        > div:first-child {
            margin-top: 60px;
        }
        span {
            display: inline-block;
            &:first-child {
                width: 150px;
                margin-left: 50px;
            }
        }
        a {
            width: 120px;
            margin-left: 83px;
            margin-top: 5px;
        }
    }
    div.pv-def-vid {
        width: 500px;
        height: 250px;
        background: #fff;
        > div.pv-defvlan-item {
            margin: 20px 0;
        }
        > div:first-child {
            margin-top: 60px;
        }
        span {
            display: inline-block;
            &:first-child {
                width: 150px;
                margin-left: 50px;
            }
        }
        input {
            width: 120px;
        }
        a {
            width: 120px;
            margin-left: 83px;
            margin-top: 5px;
        }
    }
    div.pv-vlan-list {
        width: 500px;
        height: 342px;
        background: #fff;
        > div.pv-vlist-item {
            margin: 20px 0;
        }
        > div:first-child {
            h3 {
                font-size: 18px;
                height: 60px;
                line-height: 60px;
                padding: 0 0 0 20px;
                text-indent: 10px;
                border-bottom: 2px solid #ddd;
                font-weight: 600;
                color: #67aef7;
            }
        }
        span {
            display: inline-block;
            &:first-child {
                width: 150px;
                margin-left: 50px;
            }
        }
        input {
            width: 240px;
        }
        a {
            width: 120px;
            margin-left: 83px;
            margin-top: 5px;
        }
        div.pv-vlist-tips {
            position: absolute;
            top: 16px;
            right: 60px;
            i {
                display: inline-block;
                width: 32px;
                height: 32px;
                background: url("../../../../assets/tips.png") no-repeat;
                cursor: pointer;
                &:hover {
                    & + div {
                        display: block;
                    }
                }
            }
            i + div {
                display: none;
                width: 300px;
                background: #67aef7;
                position: absolute;
                top: 23px;
                right: 27px;
                border-radius: 6px;
                p {
                    margin: 15px;
                    color: #fff;
                }
            }
        }
    }
}
.nms-table-expand-item {
    text-align: left;
    margin: 10px;
    > span {
        display: inline-block;
        vertical-align: middle;
        width: calc(~"100% - 125px");
        &:first-child {
            width: 120px;
            text-align: right;
            padding-right: 12px;
            box-sizing: border-box;
        }
    }
}
</style>
