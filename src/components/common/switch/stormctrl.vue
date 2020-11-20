<template>
    <div>
        <page-header type="none">
            <template slot="title">{{ lanMap["stormctrl"] }}</template>
            <template slot="action">
                <nms-button @click="refreshData">
                    {{ lanMap["refresh"] }}
                </nms-button>
            </template>
        </page-header>
        <nms-table :rows="stormctrls" border>
            <nms-table-column :label="lanMap['port_id']">
                <template slot-scope="scope">
                    {{ scope.port_id | getPortName }}
                </template>
            </nms-table-column>
            <nms-table-column
                :label="lanMap['broadcast']"
                prop="broadcast"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['multicast']"
                prop="multicast"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['unicast']"
                prop="unicast"
            ></nms-table-column>
            <nms-table-column :label="lanMap['config']" width="120px">
                <template slot-scope="row">
                    <nms-button type="text" @click="openDialog(row)">
                        {{ lanMap["config"] }}
                    </nms-button>
                </template>
            </nms-table-column>
        </nms-table>
        <nms-dialog :visible.sync="dialogVisible" border width="550px">
            <template slot="title">{{ lanMap["config"] }}</template>
            <div class="nms-dialog-content-item">
                <span>{{ lanMap["port_id"] }}:</span>
                <span>{{ row.port_id | getPortName }}</span>
            </div>
            <div class="nms-dialog-content-item">
                <span>{{ lanMap["broadcast"] }}:</span>
                <input
                    type="text"
                    v-model.number="formData.broadcast"
                    v-validator="{ min: 0, max: 1488100 }"
                />
                <span class="tips">0-1488100</span>
            </div>
            <div class="nms-dialog-content-item">
                <span>{{ lanMap["multicast"] }}:</span>
                <input
                    type="text"
                    v-model.number="formData.multicast"
                    v-validator="{ min: 0, max: 1488100 }"
                />
                <span class="tips">0-1488100</span>
            </div>
            <div class="nms-dialog-content-item">
                <span>{{ lanMap["unicast"] }}:</span>
                <input
                    type="text"
                    v-model.number="formData.unicast"
                    v-validator="{ min: 0, max: 1488100 }"
                />
                <span class="tips">0-1488100</span>
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
    name: "stormctrl",
    computed: {
        ...mapState(["lanMap"]),
    },
    data() {
        return {
            stormctrls: [],
            dialogVisible: false,
            row: {},
            formData: {
                broadcast: 0, // 0 - 1488100
                multicast: 0,
                unicast: 0,
            },
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.stormctrls = [];
            this.$http
                .get("/switch_port?form=stormctrl_all")
                .then((res) => {
                    if (res.data.code === 1) {
                        if (isArray(res.data.data)) {
                            this.stormctrls = res.data.data;
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
        submitForm() {
            const bct = this.formData.broadcast,
                mct = this.formData.multicast,
                uct = this.formData.unicast;
            const valid = (val) => val >= 0 && val <= 1488100;
            if (!valid(bct)) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["broadcast"]}`
                );
            }
            if (!valid(mct)) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["multicast"]}`
                );
            }
            if (!valid(uct)) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["unicast"]}`
                );
            }
            const flags = {
                broadcast: 0x04,
                multicast: 0x02,
                unicast: 0x01,
            };
            const flag = this.computedFlag(flags, this.formData, this.row);
            if (flag === 0) {
                this.$message.info(this.lanMap["modify_tips"]);
                return;
            }
            const url = "/switch_port?form=stormctrl",
                post_params = {
                    method: "set",
                    param: {
                        port_id: this.row.port_id,
                        flags: flag,
                        broadcast: this.formData.broadcast,
                        multicast: this.formData.multicast,
                        unicast: this.formData.unicast,
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
        computedFlag(flags, data, baseData) {
            let flag = 0;
            Object.keys(flags).forEach((key) => {
                if (data[key] !== baseData[key]) {
                    flag |= flags[key];
                }
            });
            return flag;
        },
    },
    directives: {
        validator: {
            update(el, { value }) {
                const val = Number(el.value),
                    { min, max } = value;
                if (val < min || val > max || isNaN(val)) {
                    el.style.borderColor = "red";
                } else {
                    el.style.borderColor = "";
                }
            },
        },
    },
};
</script>

<style lang="less" scoped>
.nms-dialog-content-item {
    margin: 10px 0;
    > span {
        display: inline-block;
        vertical-align: middle;
        width: 120px;
        text-align: right;
        padding-right: 12px;
        & + span {
            text-align: left;
        }
    }
    span.tips {
        color: @tipsColor;
        font-size: @tipsFontSize;
        margin-left: 12px;
        text-align: left;
    }
}
</style>