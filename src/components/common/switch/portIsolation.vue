<template>
    <div>
        <page-header type="none">
            <div slot="title">{{ lanMap['port_group'] }}</div>
        </page-header>
        <div class="port-group-title">
            <span>{{ lanMap['port_group_mode'] }}:</span>
            <span style="margin-left: 12px;">{{ lanMap[PORT_GROUP_MODE_MAP[portMode]] }}</span>
            <nms-button
                style="margin-left: 30px;"
                @click="setPortGroupMode"
                size="mini"
            >{{ lanMap['config'] }}</nms-button>
        </div>
        <!-- isolation -->
        <template v-if="portMode === 1">
            <div class="isolate">
                <span class="title">PON{{ lanMap['port_isolation'] }}</span>
                <nms-button
                    @click="openDialog('add', 'pon')"
                    size="mini"
                >{{ `${lanMap['add']}${lanMap['port']}` }}</nms-button>
                <nms-button
                    @click="openDialog('delete', 'pon')"
                    size="mini"
                >{{ `${lanMap["delete"]}${lanMap['port']}` }}</nms-button>
            </div>
            <div class="isolate isolate-portlist">
                <span style="width: 240px;">{{ `${lanMap['pon_isolate_portlist']}` }}:</span>
                <span v-if="!!isolate_pon">{{ isolate_pon | parsePortList }}</span>
                <span v-else>-</span>
            </div>
            <br />
            <div class="isolate">
                <span class="title">{{ `${lanMap['uplink']}${lanMap['port_isolation']}` }}</span>
                <nms-button
                    @click="openDialog('add', 'ge')"
                    size="mini"
                >{{ `${lanMap['add']}${lanMap['port']}` }}</nms-button>
                <nms-button
                    @click="openDialog('delete', 'ge')"
                    size="mini"
                >{{ `${lanMap["delete"]}${lanMap['port']}` }}</nms-button>
            </div>
            <div class="isolate isolate-portlist">
                <span style="width: 240px;">{{ `${lanMap['uplink_isolate_portlist']}` }}:</span>
                <span v-if="!!isolate_ge">{{ isolate_ge | parsePortList }}</span>
                <span v-else>-</span>
            </div>
        </template>
        <!-- inter-working -->
        <template v-if="portMode === 2">
            <div class="port-group-title">
                <span>{{ lanMap['port_maps'] }}</span>
                <nms-button
                    size="mini"
                    style="margin-left: 30px;"
                    @click="openDialog('set', 'group')"
                >{{ lanMap['config'] }}</nms-button>
                <nms-button
                    size="mini"
                    style="margin-left: 30px;"
                    @click="resetConfig"
                >{{ lanMap['reset'] }}</nms-button>
            </div>
            <nms-table :rows="interWorkingList" border>
                <nms-table-column :label="lanMap['ingress']" width="200px">
                    <template slot-scope="row">{{ row.port_id | getPortName }}</template>
                </nms-table-column>
                <nms-table-column :label="lanMap['egress']">
                    <template slot-scope="row">{{ row.inter_working_portlist | parsePortList }}</template>
                </nms-table-column>
            </nms-table>
        </template>
        <nms-dialog :visible.sync="visible" width="750px">
            <div slot="title">{{ `${lanMap[dialogType] || ''}${lanMap['port'] || ''}` }}</div>
            <template v-if="dialogType === 'add' || dialogType === 'delete'">
                <div class="isolate" style="margin: 0;">
                    <span style="width: 150px;">{{ lanMap['port_id'] }}</span>
                    <span>
                        <template v-for="item in port_name.pon" v-if="portType === 'pon'">
                            <label :class="{ 'disabled': disabledItem(item.id) }">
                                <input
                                    type="checkbox"
                                    v-model="portlist"
                                    :value="item.id"
                                    :disabled="disabledItem(item.id)"
                                />
                                {{ item.name }}
                            </label>
                        </template>
                        <template v-for="item in port_name.ge" v-if="portType !== 'pon'">
                            <label :class="{ 'disabled': disabledItem(item.id) }">
                                <input
                                    type="checkbox"
                                    v-model="portlist"
                                    :value="item.id"
                                    :disabled="disabledItem(item.id)"
                                />
                                {{ item.name }}
                            </label>
                        </template>
                        <template v-if="port_name.xge && portType !== 'pon'">
                            <template v-for="item in port_name.xge">
                                <label :class="{ 'disabled': disabledItem(item.id) }">
                                    <input
                                        type="checkbox"
                                        v-model="portlist"
                                        :value="item.id"
                                        :disabled="disabledItem(item.id)"
                                    />
                                    {{ item.name }}
                                </label>
                            </template>
                        </template>
                    </span>
                </div>
            </template>
            <template v-if="dialogType === 'set'">
                <div class="port-group-form-item">
                    <span>{{ lanMap['ingress'] }}:</span>
                    <select v-model="port_id">
                        <template v-for="item in port_info.data || []">
                            <option :value="item.port_id">{{ item.port_id | getPortName }}</option>
                        </template>
                    </select>
                </div>
                <div class="port-group-form-item">
                    <span>{{ lanMap['egress'] }}:</span>
                    <span>
                        <template v-for="item in port_info.data || []">
                            <template v-if="item.port_id !== port_id">
                                <label>
                                    <input type="checkbox" v-model="portlist" :value="item.port_id" />
                                    {{ item.port_id | getPortName }}
                                </label>
                            </template>
                        </template>
                    </span>
                </div>
            </template>
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
    name: "portIsolation",
    computed: {
        ...mapState(["lanMap", "port_name", "port_info"]),
        isolatePonList() {
            return parsePort(this.isolate_pon);
        },
        isolateGeList() {
            return parsePort(this.isolate_ge);
        },
        portMode() {
            //  1 - isolation    2 - inter-working
            return this.portGroupData.port_group_mode || 1;
        },
        isolate_pon() {
            return this.portGroupData.pon_isolate_portlist;
        },
        isolate_ge() {
            return this.portGroupData.uplink_isolate_portlist;
        },
        interWorkingList() {
            return this.portGroupData.inter_working || [];
        }
    },
    data() {
        return {
            PORT_GROUP_MODE_MAP: { 1: "isolation", 2: "inter_working" },
            visible: false,
            dialogType: "",
            portType: "",
            portlist: [],
            portGroupMode: 1,
            port_id: 0,
            portGroupData: {
                // port_group_mode: 2,
                // pon_isolate_portlist: "",
                // uplink_isolate_portlist: "",
                // inter_working: [
                //     {
                //         port_id: 1,
                //         inter_working_portlist: "2-3,5-9"
                //     }
                // ]
            }
        };
    },
    created() {
        this.getGroupData();
    },
    methods: {
        getGroupData() {
            this.portGroupData = {};
            this.$http
                .get("/switch_isolate?form=port_group")
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.portGroupData = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        openDialog(action, portType) {
            this.visible = true;
            this.dialogType = action;
            this.portType = portType;
            this.port_id = 1;
            this.portlist =
                portType === "pon" ? this.isolatePonList : this.isolateGeList;
        },
        closeDialog() {
            this.visible = false;
            this.port_id = 0;
        },
        disabledItem(port_id) {
            // string转number & 取整
            port_id = port_id >>> 0;
            if (this.portType === "pon") {
                if (this.dialogType === "add") {
                    return this.isolatePonList.includes(port_id);
                }
                if (this.dialogType === "delete") {
                    return !this.isolatePonList.includes(port_id);
                }
            } else {
                if (this.dialogType === "add") {
                    return this.isolateGeList.includes(port_id);
                }
                if (this.dialogType === "delete") {
                    return !this.isolateGeList.includes(port_id);
                }
            }
        },
        submitForm() {
            if (this.dialogType === "set") {
                this.submitPortMapping();
                return;
            }
            let isolatePortlist =
                this.portType === "pon"
                    ? this.isolatePonList
                    : this.isolateGeList;
            if (
                !this.portlist.length ||
                (this.dialogType === "add" &&
                    this.portlist.length === isolatePortlist.length)
            ) {
                return this.$message.error(this.lanMap["modify_tips"]);
            }
            const list = (this.dialogType === "add"
                ? this.portlist.filter(item => !isolatePortlist.includes(item))
                : this.portlist
            )
                .sort((a, b) => a - b)
                .toString();
            let post_param = {
                method: this.dialogType,
                param: {
                    pon_isolate_portlist:
                        this.portType === "pon" ? list : undefined,
                    uplink_isolate_portlist:
                        this.portType !== "pon" ? list : undefined
                }
            };
            const url =
                this.portType === "pon"
                    ? "/switch_isolate?form=isolate_pon"
                    : "/switch_isolate?form=isolate_uplink";
            this.postData(url, post_param, this.dialogType);
            this.closeDialog();
        },
        postData(url, data, type = "config") {
            this.$http
                .post(url, data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message.success(
                            `${this.lanMap[type]}${this.lanMap["st_success"]}`
                        );
                        this.getGroupData();
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                })
                .catch(err => {});
        },
        setPortGroupMode() {
            this.portGroupMode = this.portGroupData.port_group_mode;
            this.$confirm(
                <div class="set-port-group-mode-item">
                    <span>{this.lanMap["port_group_mode"]}:</span>
                    <select
                        value={this.portGroupMode}
                        onChange={e =>
                            (this.portGroupMode = Number(e.target.value))
                        }
                    >
                        {Object.keys(this.PORT_GROUP_MODE_MAP).map(key => (
                            <option value={Number(key)}>
                                {this.lanMap[this.PORT_GROUP_MODE_MAP[key]]}
                            </option>
                        ))}
                    </select>
                </div>,
                this.lanMap["config"]
            )
                .then(_ => {
                    this.submitSetMode(this.portGroupMode);
                })
                .catch(_ => {});
        },
        submitSetMode(mode) {
            if (mode === this.portMode) {
                this.$message.info(this.lanMap["modify_tips"]);
                return;
            }
            this.postData("/switch_isolate?form=port_group_mode", {
                method: "set",
                param: {
                    port_group_mode: mode
                }
            });
        },
        resetConfig() {
            this.$confirm()
                .then(_ => {
                    this.postData(
                        "/switch_isolate?form=inter_working_default",
                        {
                            method: "set",
                            param: {}
                        }
                    )
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["reset"] +
                                        this.lanMap["st_success"]
                                );
                                this.getGroupData();
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
        submitPortMapping() {
            const list = this.portlist.slice(0);
            list.sort((a, b) => a - b);
            this.postData("/switch_isolate?form=inter_working", {
                method: "set",
                param: {
                    port_id: this.port_id,
                    inter_working_portlist: list.toString()
                }
            });
            this.closeDialog();
        }
    },
    watch: {
        port_id() {
            if (this.port_id === 0) {
                return;
            }
            const list = this.portGroupData.inter_working || [];
            const res = list.filter(item => item.port_id === this.port_id)[0];
            if (res) {
                this.portlist = parsePort(res.inter_working_portlist);
            } else {
                this.portlist = [];
            }
        }
    }
};
</script>

<style lang="less" scoped>
div.isolate {
    margin: 20px 0;
    &:after {
        content: "";
        display: table;
        clear: both;
    }
    > span {
        float: left;
        width: 180px;
        line-height: 24px;
        & + span {
            width: calc(~"100% - 180px");
            word-break: break-all;
            word-wrap: break-word;
        }
        label {
            user-select: none;
            display: inline-block;
            width: 24%;
            line-height: 30px;
        }
        label.disabled {
            cursor: not-allowed;
            color: #aaa;
        }
    }
    a {
        margin-left: 30px;
    }
    .title {
        font-size: 18px;
        color: @titleColor;
        line-height: 32px;
        width: 200px;
    }
}
div.isolate-portlist {
    > span + span {
        width: calc(~"100% - 240px");
    }
}
div.port-group-title {
    margin: 20px 0;
    font-weight: 500;
}
div.set-port-group-mode-item {
    > span {
        margin: 0 20px 0 0;
    }
    > select {
        width: 200px;
    }
}
div.port-group-form-item {
    margin: 12px 0;
    > span {
        display: inline-block;
        vertical-align: middle;
        width: 150px;
        text-align: right;
        padding-right: 12px;
        box-sizing: border-box;
    }
    select {
        width: 200px;
    }
    span + span {
        width: calc(~"100% - 160px");
        text-align: left;
        label {
            user-select: none;
            display: inline-block;
            width: 24%;
            line-height: 30px;
        }
    }
}
</style>