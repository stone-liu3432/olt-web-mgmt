<template>
    <div>
        <div style="margin: 0 0 0 10px;">
            <a href="javascript: void(0);" @click="visible = true;">{{ lanMap['add'] }}</a>
        </div>
        <nms-table :rows="opVlans" border>
            <nms-table-column prop="pid" :label="lanMap['onu_port_id']"></nms-table-column>
            <nms-table-column prop="mode" :label="lanMap['mode']">
                <template slot-scope="rows">{{ vlanModes[rows.mode] }}</template>
            </nms-table-column>
            <nms-table-column prop="vlan_id" :label="lanMap['vlan_id']"></nms-table-column>
            <nms-table-column :label="lanMap['config']">
                <template slot-scope="rows">
                    <a
                        href="javascript: void(0);"
                        class="btn-text"
                        @click="clearData(rows)"
                    >{{ lanMap['clear'] }}</a>
                </template>
            </nms-table-column>
        </nms-table>
        <nms-dialog
            :visible.sync="visible"
            :title="lanMap['add']"
            width="500px"
            :before-close="clearForm"
        >
            <div class="modal-item">
                <span>{{ lanMap['port_id'] }}</span>
                <span>{{ portid | getPortName }}</span>
            </div>
            <div class="modal-item">
                <span>{{ lanMap['onu_port_id'] }}</span>
                <select v-model.number="opid">
                    <template v-for="item in 8">
                        <option :value="item">{{ item }}</option>
                    </template>
                </select>
            </div>
            <div class="modal-item">
                <span>{{ lanMap['vlan_mode'] }}</span>
                <select v-model.number="op_mode">
                    <template v-for="(item, index) in vlanModes">
                        <option :value="index">{{ item }}</option>
                    </template>
                </select>
            </div>
            <div class="modal-item">
                <span>{{ lanMap['vlan_id'] }}</span>
                <input
                    type="text"
                    v-model.number="vlan_id"
                    :style="{ 'border-color': vlan_id === '' || valid_vlanid ? '' : 'red' }"
                />
                <span>Range: 1-4094</span>
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
export default {
    name: "batchVlan",
    computed: {
        ...mapState(["lanMap"]),
        valid_vlanid() {
            return (
                this.vlan_id >= 1 &&
                this.vlan_id <= 4094 &&
                !isNaN(this.vlan_id)
            );
        }
    },
    data() {
        return {
            opVlans: [],
            vlanModes: ["transparent", "tag"],
            visible: false,
            opid: 1,
            op_mode: 0,
            vlan_id: ""
        };
    },
    props: {
        portid: {
            type: Number,
            required: true
        }
    },
    created() {
        if (this.portid) {
            this.getData(this.portid);
        }
    },
    // mounted() {
    //     this.opVlans = [
    //         {
    //             port_id: 1,
    //             pid: 1,
    //             mode: 1,
    //             vlan_id: 123
    //         }
    //     ];
    // },
    methods: {
        getData(port_id) {
            this.opVlans = [];
            this.$http
                .get("/ponmgmt", {
                    params: { form: "profvlan", port_id }
                })
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data && res.data.data.length) {
                            this.opVlans = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        clearData(row) {
            this.$confirm(this.lanMap["if_sure"])
                .then(_ => {
                    const data = {
                        method: "clear",
                        param: {
                            port_id: row.port_id,
                            pid: row.pid,
                            mode: row.mode,
                            vlan_id: row.vlan_id
                        }
                    };
                    this.$http
                        .post("/ponmgmt?form=profvlan", data)
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    `${this.lanMap["clear"]}${this.lanMap["st_success"]}`
                                );
                                this.getData(row.port_id);
                            } else {
                                this.$message.error(res.data.message);
                            }
                        })
                        .catch(err => {});
                })
                .catch(_ => {});
        },
        submitForm() {
            if (this.vlan_id === "" || !this.valid_vlanid) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["vlan_id"]}`
                );
            }
            const data = {
                method: "set",
                param: {
                    port_id: this.portid,
                    pid: this.opid,
                    mode: this.op_mode,
                    vlan_id: this.vlan_id
                }
            };
            this.$http
                .post("/ponmgmt?form=profvlan", data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.getData(this.portid);
                    } else {
                        this.$message.error(res.data.message);
                    }
                    this.closeDialog();
                })
                .catch(err => {});
        },
        clearForm(done) {
            this.opid = 1;
            this.op_mode = 0;
            this.vlan_id = "";
            typeof done === "function" && done();
        },
        closeDialog() {
            this.clearForm(_ => {
                this.visible = false;
            });
        }
    },
    watch: {
        portid() {
            if (this.portid) {
                this.getData(this.portid);
            }
        }
    }
};
</script>

<style lang="less" scoped>
select {
    width: 197px;
    vertical-align: middle;
}
.modal-item {
    margin: 12px 0;
    > span {
        display: inline-block;
        vertical-align: middle;
        line-height: 30px;
        &:first-child {
            width: 120px;
        }
    }
    input + span {
        font-size: 14px;
        color: #666;
        margin-left: 6px;
    }
}
</style>