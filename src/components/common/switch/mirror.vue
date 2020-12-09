<template>
    <div>
        <page-header type="none">
            <template slot="title">{{ lanMap["mirror"] }}</template>
            <template slot="action">
                <nms-button @click="refreshData">
                    {{ lanMap["refresh"] }}
                </nms-button>
            </template>
        </page-header>
        <nms-table :rows="mirrors" border>
            <nms-table-column :label="lanMap['src_port']">
                <template slot-scope="row">
                    {{ row.port_id | getPortName }}
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['dst_port']">
                <template slot-scope="row">
                    {{ row.dst_port | getPortName }}
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['type']">
                <template slot-scope="row">
                    {{ lanMap[PORT_MIRROR_TYPE_MAP[row.type]] || "-" }}
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['config']" width="200px">
                <template slot-scope="row">
                    <nms-button type="text" @click="openDialog(row)">
                        {{ lanMap["config"] }}
                    </nms-button>
                    <nms-button type="text" @click="flushMirror(row)">
                        {{ lanMap["flush"] }}
                    </nms-button>
                </template>
            </nms-table-column>
        </nms-table>
        <nms-dialog :visible.sync="dialogVisible" width="550px">
            <template slot="title">{{ lanMap["config"] }}</template>
            <div class="nms-dialog-content-item">
                <span>{{ lanMap["src_port"] }}:</span>
                <span>{{ row.port_id | getPortName }}</span>
            </div>
            <div class="nms-dialog-content-item">
                <span>{{ lanMap["dst_port"] }}:</span>
                <select v-model.number="formData.dst_port">
                    <template v-for="item in port_name.ge">
                        <option :value="item.id">{{ item.name }}</option>
                    </template>
                    <template v-if="port_name.xge">
                        <template v-for="item in port_name.xge">
                            <option :value="item.id">{{ item.name }}</option>
                        </template>
                    </template>
                </select>
            </div>
            <div class="nms-dialog-content-item">
                <span>{{ lanMap["type"] }}:</span>
                <select v-model.number="formData.type">
                    <option :value="1">{{ lanMap["ingress"] }}</option>
                    <option :value="2">{{ lanMap["egress"] }}</option>
                    <option :value="3">{{ lanMap["all"] }}</option>
                </select>
            </div>
            <div slot="footer">
                <nms-button @click="submitForm">
                    {{ lanMap["apply"] }}
                </nms-button>
                <nms-button @click="dialogVisible = false">
                    {{ lanMap["cancel"] }}
                </nms-button>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { isArray, debounce } from "@/utils/common";
export default {
    name: "mirror",
    computed: {
        ...mapState(["lanMap", "system", "port_name", "port_info"]),
    },
    data() {
        return {
            mirrors: [],
            PORT_MIRROR_TYPE_MAP: [" - ", "ingress", "egress", "all"],
            dialogVisible: false,
            row: {},
            formData: {
                dst_port: 0,
                type: 3,
            },
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.mirrors = [];
            this.$http
                .get("/switch_port?form=mirror_all")
                .then((res) => {
                    if (res.data.code === 1) {
                        if (isArray(res.data.data)) {
                            this.mirrors = res.data.data;
                        }
                    }
                })
                .catch((err) => {});
        },
        refreshData() {
            debounce(this.getData, 1000, this);
        },
        openDialog(row) {
            this.row = row;
            this.dialogVisible = true;
            Object.keys(this.formData).forEach((key) => {
                this.formData[key] = row[key];
            });
        },
        flushMirror(row) {
            this.$confirm(this.lanMap["if_sure"] + this.lanMap["clear"] + " ?")
                .then(() => {
                    const url = "/switch_port?form=mirror",
                        post_params = {
                            method: "clear",
                            param: {
                                src_port: row.port_id,
                            },
                        };
                    this.$http
                        .post(url, post_params)
                        .then((res) => {
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
                        .catch((err) => {});
                })
                .catch(() => {});
        },
        submitForm() {
            if (
                this.formData.dst_port === this.row.dst_port &&
                this.formData.type === this.row.type
            ) {
                return this.$message.info(this.lanMap["modify_tips"]);
            }
            const url = "/switch_port?form=mirror",
                post_params = {
                    method: "set",
                    param: {
                        src_port: this.row.port_id,
                        dst_port: this.formData.dst_port,
                        type: this.formData.type,
                    },
                };
            this.$http
                .post(url, post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.getData();
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                })
                .catch((err) => {})
                .finally(() => {
                    this.dialogVisible = false;
                });
        },
    },
};
</script>

<style lang="less" scoped>
.nms-dialog-content-item {
    margin: 12px 0;
    > span {
        display: inline-block;
        vertical-align: middle;
        text-align: right;
        &:first-child {
            width: 140px;
            padding-right: 12px;
            box-sizing: border-box;
            & + span {
                text-align: left;
            }
        }
    }
    select {
        width: 200px;
    }
}
</style>