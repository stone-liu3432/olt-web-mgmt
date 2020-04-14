<template>
    <div>
        <h3>
            <span>{{ lanMap['msti'] + lanMap['info'] }}</span>
            <nms-button
                size="mini"
                style="margin-left: 30px;"
                @click="openDialog('msti')"
            >{{ lanMap['add'] }}</nms-button>
        </h3>
        <nms-table :rows="mstiInfo" border>
            <nms-table-column :label="`${lanMap['instance']} ID`" prop="mstid"></nms-table-column>
            <nms-table-column :label="lanMap['msti_vlanlist']" prop="msti_vlanlist"></nms-table-column>
            <nms-table-column :label="lanMap['bridge_addr']" prop="bridge_addr"></nms-table-column>
            <nms-table-column :label="lanMap['bridge_prio']" prop="bridge_prio"></nms-table-column>
            <nms-table-column :label="lanMap['designate_addr']" prop="designate_addr"></nms-table-column>
            <nms-table-column :label="lanMap['designate_prio']" prop="designate_prio"></nms-table-column>
            <nms-table-column :label="lanMap['root_port_name']">
                <template slot-scope="row">{{ row.root_port_name || 'None' }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['internal_path_cost']" prop="internal_path_cost"></nms-table-column>
            <nms-table-column :label="lanMap['config']" width="130px">
                <template slot-scope="row">
                    <nms-dropdown @command="command">
                        <span>{{ lanMap['config'] }}</span>
                        <div slot="dropdown">
                            <nms-dropdown-item
                                :command="{ action: 'detail', data: row }"
                            >{{ lanMap['show_detail'] }}</nms-dropdown-item>
                            <nms-dropdown-item
                                :command="{ action: 'add', data: row }"
                            >{{ lanMap['add'] + lanMap['vlan_list'] }}</nms-dropdown-item>
                            <nms-dropdown-item
                                :command="{ action: 'delete', data: row }"
                            >{{ lanMap['delete'] + lanMap['vlan_list'] }}</nms-dropdown-item>
                            <nms-dropdown-item
                                :command="{ action: 'pri', data: row }"
                            >{{ lanMap['config'] }}</nms-dropdown-item>
                        </div>
                    </nms-dropdown>
                </template>
            </nms-table-column>
        </nms-table>
        <nms-dialog :visible.sync="dialogDetail" width="800px">
            <div slot="title">{{ lanMap['detail'] }}</div>
            <msti-detail ref="msti-detail" @config-port="configPort" @set-msti-info="setMstiInfo"></msti-detail>
        </nms-dialog>
        <nms-dialog :visible.sync="dialogVisible" width="535px">
            <div slot="title">{{ lanMap[dialogTitle] }}</div>
            <msti-form ref="msti-form"></msti-form>
            <div slot="footer">
                <nms-button @click="submitForm('msti-form')">{{ lanMap['apply'] }}</nms-button>
                <nms-button @click="dialogVisible = false;">{{ lanMap['cancel'] }}</nms-button>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import mstiForm from "./mstiForm";
import mstiDetail from "./mstiDetail";
export default {
    name: "mstiInfo",
    components: { mstiForm, mstiDetail },
    computed: {
        ...mapState(["lanMap"]),
        dialogTitle() {
            if (this.type === "msti") {
                return "add";
            }
            return this.type === "add" || this.type === "delete"
                ? this.type
                : "config";
        }
    },
    data() {
        return {
            dialogVisible: false,
            dialogDetail: false,
            type: "",
            mstid: 0,
            mstiInfo: [
                // {
                //     mstid: 2,
                //     msti_vlanlist: "2-4094",
                //     bridge_addr: "00:00:00:00:00:11",
                //     bridge_prio: 32768,
                //     designate_addr: "00:00:00:00:00:11",
                //     designate_prio: 32768,
                //     root_port_name: "root name",
                //     internal_path_cost: 0,
                //     msti_port: [
                //         {
                //             port_id: 6,
                //             port_role: 6,
                //             port_priority: 64,
                //             port_state: 6,
                //             admin_internal_cost: 6,
                //             internal_cost: 6
                //         }
                //     ]
                // }
            ]
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.mstiInfo = [];
            this.$http
                .get("/switch_mstp?form=msti_status_get")
                .then(res => {
                    if (res.data.code === 1) {
                        if (Array.isArray(res.data.data)) {
                            this.mstiInfo = res.data.data;
                            // detail 打开状态下，更新数据时更新detail数据
                            if (this.dialogDetail) {
                                this.mstiInfo.forEach(item => {
                                    if (item.mstid === this.mstid) {
                                        this.$refs["msti-detail"].init(item);
                                    }
                                });
                            }
                        }
                    }
                })
                .catch(err => {});
        },
        openDialog(type, row, portInfo) {
            this.dialogVisible = true;
            this.type = type;
            this.$nextTick(_ => {
                this.$refs["msti-form"].init(type, row, portInfo);
            });
        },
        command({ action, data }) {
            if (action === "detail") {
                this.dialogDetail = true;
                this.mstid = data.mstid;
                this.$nextTick(_ => {
                    this.$refs["msti-detail"].init(data);
                });
                return;
            }
            this.openDialog(action, data);
        },
        submitForm(formName) {
            this.$refs[formName].validate((type, val) => {
                const ACTIONS = {
                    add(param) {
                        return {
                            url: "/switch_mstp?form=mstp_vlan_map",
                            data: {
                                method: "set",
                                param
                            }
                        };
                    },
                    delete(param) {
                        return {
                            url: "/switch_mstp?form=mstp_vlan_map",
                            data: {
                                method: "set",
                                param
                            }
                        };
                    },
                    pri(param) {
                        return {
                            url: "/switch_mstp?form=msti_priority_set",
                            data: {
                                method: "set",
                                param
                            }
                        };
                    },
                    port(param) {
                        if (
                            !param.set_admin_internal_cost &&
                            !param.set_port_priority
                        ) {
                            this.$message.error(this.lanMap["modify_tips"]);
                            this.dialogVisible = false;
                            return;
                        }
                        return {
                            url: "/switch_mstp?form=msti_port_set",
                            data: {
                                method: "set",
                                param
                            }
                        };
                    },
                    msti(param) {
                        return {
                            url: "/switch_mstp?form=mstp_vlan_map",
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
                                    this.getData();
                                } else {
                                    this.$message.error(
                                        `(${res.data.code}) ${res.data.message}`
                                    );
                                }
                                this.dialogVisible = false;
                            })
                            .catch(err => {});
                    }
                }
            });
        },
        configPort(row, portInfo) {
            this.openDialog("port", row, portInfo);
        },
        setMstiInfo(type, row) {
            this.openDialog(type, row);
        }
    }
};
</script>

<style lang="less" scoped>
h3 {
    color: @titleColor;
    font-size: 18px;
    font-weight: 600;
}
</style>