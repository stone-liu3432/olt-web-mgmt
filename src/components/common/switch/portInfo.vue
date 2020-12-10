<template>
    <div class="port-info">
        <page-header type="none">
            <template slot="title">{{ lanMap["port_cfg"] }}</template>
            <template slot="action">
                <nms-button @click="refreshData">
                    {{ lanMap["refresh"] }}
                </nms-button>
            </template>
        </page-header>
        <nms-table :rows="port_info" border ref="port-info-table">
            <nms-table-column type="expand">
                <template slot-scope="scope">
                    <div class="nms-table-expand-item">
                        <span>{{ lanMap["duplex"] }}:</span>
                        <span>{{
                            scope.duplex ? lanMap["full"] : lanMap["half"]
                        }}</span>
                    </div>
                    <div class="nms-table-expand-item">
                        <span>{{ lanMap["flow_ctrl"] }}:</span>
                        <span>{{
                            scope.flow_ctrl
                                ? lanMap["enable"]
                                : lanMap["disable"]
                        }}</span>
                    </div>
                    <div class="nms-table-expand-item">
                        <span>{{ lanMap["mtu"] }}:</span>
                        <span>{{ scope.mtu }}</span>
                    </div>
                    <template v-if="scope.port_id > system.data.ponports">
                        <div class="nms-table-expand-item">
                            <span>{{ lanMap["erate"] }}:</span>
                            <span>{{ scope.erate }}</span>
                        </div>
                        <div class="nms-table-expand-item">
                            <span>{{ lanMap["irate"] }}:</span>
                            <span>{{ scope.irate }}</span>
                        </div>
                    </template>
                </template>
            </nms-table-column>
            <nms-table-column
                prop="port_id"
                :label="lanMap['port_id']"
                min-width="80px"
            >
                <template slot-scope="row">
                    {{ row.port_id | getPortName }}
                </template>
            </nms-table-column>
            <nms-table-column
                prop="admin_status"
                :label="lanMap['admin_status']"
            >
                <template slot-scope="row">
                    {{ row.admin_status >= 1 ? "Enable" : "Disable" }}
                </template>
            </nms-table-column>
            <nms-table-column
                prop="link_status"
                :label="lanMap['link_status']"
                :cell-style="statusStyle"
            >
                <template slot-scope="row">
                    {{
                        row.link_status >= 1
                            ? lanMap["link_up"]
                            : lanMap["link_down"]
                    }}
                </template>
            </nms-table-column>
            <nms-table-column prop="speed" :label="lanMap['speed']">
                <template slot-scope="row">
                    {{
                        row.auto_neg
                            ? `Auto(${row.speed === "0M" ? "--" : row.speed})`
                            : row.speed
                    }}
                </template>
            </nms-table-column>
            <nms-table-column prop="media" :label="lanMap['media']">
                <template slot-scope="row">
                    {{ lanMap[row.media] }}
                </template>
            </nms-table-column>
            <nms-table-column
                prop="pvid"
                :label="lanMap['pvid']"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['desc']"
                prop="port_desc"
            ></nms-table-column>
            <nms-table-column :label="lanMap['config']" width="90px">
                <template slot-scope="row">
                    <a
                        href="javascript: void(0);"
                        class="btn-text"
                        @click="openDialog(row)"
                        >{{ lanMap["config"] }}</a
                    >
                </template>
            </nms-table-column>
        </nms-table>
        <nms-dialog :visible.sync="dialogVisible" width="550px">
            <template slot="title">{{ lanMap["config"] }}</template>
            <div class="nms-form-item">
                <span>{{ lanMap["port_id"] }}:</span>
                <span>{{ row.port_id | getPortName }}</span>
            </div>
            <template v-if="!isPon">
                <div class="nms-form-item">
                    <span>{{ lanMap["admin_status"] }}:</span>
                    <select
                        v-model.number="formData.admin_status"
                        key="admin-status"
                    >
                        <option value="0">{{ lanMap["disable"] }}</option>
                        <option value="1">{{ lanMap["enable"] }}</option>
                    </select>
                </div>
                <div class="nms-form-item">
                    <span>{{ lanMap["auto_neg"] }}:</span>
                    <select
                        v-model.number="formData.auto_neg"
                        disabled
                        key="auto-neg"
                    >
                        <option value="0">{{ lanMap["disable"] }}</option>
                        <option value="1">{{ lanMap["enable"] }}</option>
                    </select>
                </div>
                <div class="nms-form-item">
                    <span>{{ lanMap["speed"] }}:</span>
                    <select v-model="formData.speed" key="speed">
                        <option value="0M" disabled>Auto</option>
                        <option
                            v-if="
                                row.port_id <=
                                system.data.ponports + system.data.geports
                            "
                            value="10M"
                        >
                            10M
                        </option>
                        <option
                            v-if="
                                row.port_id <=
                                system.data.ponports + system.data.geports
                            "
                            value="100M"
                        >
                            100M
                        </option>
                        <option value="1000M">1000M</option>
                        <option
                            v-if="
                                row.port_id >
                                system.data.ponports + system.data.geports
                            "
                            value="10000M"
                        >
                            10000M
                        </option>
                        <option value="auto">Auto</option>
                    </select>
                </div>
                <div class="nms-form-item">
                    <span>{{ lanMap["duplex"] }}:</span>
                    <select v-model.number="formData.duplex" key="duplex">
                        <option value="0">{{ lanMap["half"] }}</option>
                        <option value="1">{{ lanMap["full"] }}</option>
                    </select>
                </div>
            </template>
            <div class="nms-form-item">
                <span>{{ lanMap["flow_ctrl"] }}:</span>
                <select v-model.number="formData.flow_ctrl" key="flow-ctrl">
                    <option value="0">{{ lanMap["disable"] }}</option>
                    <option value="1">{{ lanMap["enable"] }}</option>
                </select>
            </div>
            <div class="nms-form-item">
                <span>{{ lanMap["mtu"] }}:</span>
                <input
                    type="text"
                    v-model.number="formData.mtu"
                    v-validator="{ min: 128, max: 2000 }"
                    key="mtu"
                />
                <span class="tips">128 - 2000</span>
            </div>
            <template v-if="!isPon">
                <div class="nms-form-item">
                    <span>{{ lanMap["erate"] }}:</span>
                    <input
                        type="text"
                        key="erate"
                        v-model.number="formData.erate"
                        v-validator:allow0="{ min: 64, max: 1024000 }"
                    />
                    <span class="tips">0, 64 - 1024000</span>
                </div>
                <div class="nms-form-item">
                    <span>{{ lanMap["irate"] }}:</span>
                    <input
                        type="text"
                        key="irate"
                        v-model.number="formData.irate"
                        v-validator:allow0="{ min: 64, max: 1024000 }"
                    />
                    <span class="tips">0, 64 - 1024000</span>
                </div>
            </template>
            <div class="nms-form-item">
                <span>{{ lanMap["pvid"] }}:</span>
                <input
                    type="text"
                    v-model.number="formData.pvid"
                    v-validator="{ min: 1, max: 4094 }"
                    key="pvid"
                />
                <span class="tips">1 - 4094</span>
            </div>
            <div class="nms-form-item">
                <span>{{ lanMap["port_desc"] }}:</span>
                <textarea
                    v-model="formData.port_desc"
                    key="port-desc"
                    :style="{
                        'border-color':
                            formData.port_desc.length &&
                            formData.port_desc.length > 64
                                ? 'red'
                                : '',
                    }"
                ></textarea>
                <span class="tips">{{ lanMap.composeRange(0, 64) }}</span>
            </div>
            <div slot="footer">
                <nms-button @click="submitForm">{{
                    lanMap["apply"]
                }}</nms-button>
                <nms-button @click="dialogVisible = false">{{
                    lanMap["cancel"]
                }}</nms-button>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { isArray, debounce, isDef } from "@/utils/common";
export default {
    name: "portInfo",
    computed: {
        ...mapState(["lanMap", "port_name", "change_url", "system"]),
        isPon() {
            return this.row.port_id <= this.system.data.ponports;
        },
    },
    data() {
        return {
            port_info: [],
            dialogVisible: false,
            row: {},
            formData: {
                admin_status: 0,
                auto_neg: 0,
                speed: 0,
                duplex: 0,
                flow_ctrl: 0,
                mtu: "",
                erate: "",
                irate: "",
                pvid: "",
                port_desc: "",
            },
        };
    },
    activated() {
        this.getData();
    },
    inject: ["scrollRef"],
    created() {
        this.getData();
    },
    methods: {
        statusStyle(row) {
            if (row.link_status) {
                return {
                    color: "#3990E5",
                };
            }
            return { color: "#F56C6C" };
        },
        getData() {
            this.port_info = [];
            this.$http
                .get(this.change_url.port)
                .then((res) => {
                    if (res.data.code === 1) {
                        if (isArray(res.data.data)) {
                            this.port_info = res.data.data;
                            if (this.$route.query.port_id) {
                                const port_id = Number(
                                    this.$route.query.port_id
                                );
                                delete this.$route.query.port_id;
                                this.$nextTick(() => {
                                    const row = this.port_info.filter(
                                        (item) => item.port_id === port_id
                                    )[0];
                                    if (row) {
                                        this.$refs[
                                            "port-info-table"
                                        ].expandedRows.push(row);
                                        this.$nextTick(() => {
                                            const el = document.getElementsByClassName(
                                                "table-expanded-row"
                                            )[0];
                                            if (el) {
                                                const {
                                                    top,
                                                } = el.getBoundingClientRect();
                                                this.scrollRef(top - 70);
                                            }
                                        });
                                    }
                                });
                            }
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
            const keys = [
                "admin_status",
                "auto_neg",
                "speed",
                "duplex",
                "flow_ctrl",
                "mtu",
                "erate",
                "irate",
                "pvid",
                "port_desc",
            ];
            keys.forEach((key) => {
                if (isDef(row[key])) {
                    this.formData[key] = row[key];
                }
                if (row.auto_neg) {
                    this.formData.speed = "auto";
                }
            });
            this.dialogVisible = true;
        },
        submitForm() {
            if (this.validForm()) {
                const flags = {
                        admin_status: 0x01,
                        auto_neg: 0x02,
                        duplex: 0x04,
                        flow_ctrl: 0x18,
                        speed: 0x40,
                        mtu: 0x80,
                        pvid: 0x400,
                        port_desc: 0x800,
                    },
                    flag = this.computedFlag(
                        this.isPon
                            ? flags
                            : { ...flags, erate: 0x100, irate: 0x200 },
                        this.formData,
                        this.row
                    );
                if (!flag) {
                    return this.$message.info(this.lanMap["modify_tips"]);
                }
                const url = "/switch_port?form=port_info",
                    post_params = {
                        method: "set",
                        param: {
                            port_id: this.row.port_id,
                            flags: flag,
                            admin_status: this.formData.admin_status,
                            auto_neg: this.formData.auto_neg,
                            speed: this.formData.speed,
                            duplex: this.formData.duplex,
                            flow_ctrl: this.formData.flow_ctrl,
                            mtu: this.formData.mtu,
                            erate: this.formData.erate,
                            irate: this.formData.irate,
                            pvid: this.formData.pvid,
                            port_desc: this.formData.port_desc,
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
            }
        },
        validForm() {
            const mtu = this.formData.mtu,
                pvid = this.formData.pvid,
                port_desc = this.formData.port_desc,
                erate = this.formData.erate,
                irate = this.formData.irate;
            if (mtu < 128 || mtu > 2000 || isNaN(mtu)) {
                this.$message.error(`${this.lanMap["param_error"]}: mtu`);
                return false;
            }
            if (pvid < 1 || pvid > 4094 || isNaN(pvid)) {
                this.$message.error(`${this.lanMap["param_error"]}: VLAN ID`);
                return false;
            }
            if (!this.isPon) {
                if (
                    erate != 0 &&
                    (erate < 64 || erate > 1024000 || isNaN(erate))
                ) {
                    this.$message.error(
                        `${this.lanMap["param_error"]}: ${this.lanMap["erate"]}`
                    );
                    return false;
                }
                if (
                    irate != 0 &&
                    (irate < 64 || irate > 1024000 || isNaN(irate))
                ) {
                    this.$message.error(
                        `${this.lanMap["param_error"]}: ${this.lanMap["irate"]}`
                    );
                    return false;
                }
            }
            if (port_desc.length > 64) {
                this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["desc"]}`
                );
                return false;
            }
            return true;
        },
        computedFlag(flags, data, baseData) {
            let flag = 0;
            Object.keys(flags).forEach((key) => {
                if (key === "speed") {
                    if (baseData.auto_neg && data[key] !== "auto") {
                        flag |= flags[key];
                        return;
                    }
                }
                if (data[key] !== baseData[key]) {
                    flag |= flags[key];
                }
            });
            return flag;
        },
    },
    directives: {
        validator: {
            update(el, { value, arg }) {
                const val = Number(el.value),
                    { min, max } = value;
                if (arg === "allow0" && !val && !isNaN(val)) {
                    el.style.borderColor = "";
                    return;
                }
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

<style scoped lang="less">
textarea {
    vertical-align: top;
    width: 197px;
    border-radius: 3px;
    resize: none;
    padding: 3px 6px;
    box-sizing: border-box;
    height: 100px;
    margin-top: 3px;
    border-color: @borderColor;
    outline: none;
    &:focus {
        border-color: @activedFormBorderColor;
    }
}
.nms-form-item {
    margin: 12px 0;
    > span {
        &:first-child {
            display: inline-block;
            vertical-align: middle;
            width: 140px;
            text-align: right;
            padding: 0 12px 0 0;
            box-sizing: border-box;
        }
    }
    select {
        width: 197px;
    }
    span.tips {
        color: @tipsColor;
        font-size: @tipsFontSize;
        margin-left: 12px;
    }
}
.nms-table-expand-item {
    margin: 10px 0;
    text-align: left;
    float: left;
    width: 30%;
    > span {
        &:first-child {
            padding: 0 12px;
        }
    }
}
</style>