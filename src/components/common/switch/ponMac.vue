<template>
    <div>
        <h2>{{ lanMap["pon_mac"] }}</h2>
        <hr />
        <div class="mac-age">
            <span>{{ lanMap["age"] }}:</span>
            <span>{{ age.age_time || "-" }}</span>
            <nms-button @click="setMacAge">{{ lanMap["config"] }}</nms-button>
        </div>
        <hr />
        <div>
            <h3>{{ lanMap["detail"] }}</h3>
            <div>
                <nms-button @click="openDialog">{{
                    lanMap["flush_mac"]
                }}</nms-button>
            </div>
            <mac-query
                :data="macTable"
                type="pon"
                @data-change="dataChange"
            ></mac-query>
        </div>
        <nms-table :rows="ponMacTable" border>
            <nms-table-column
                :label="lanMap['macaddr']"
                prop="macaddr"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['vlan_id']"
                prop="vlan_id"
            ></nms-table-column>
            <nms-table-column :label="lanMap['port_id']">
                <template slot-scope="row">{{
                    row.port_id | getPortName
                }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['onu_id']">
                <template slot-scope="row">{{
                    `${row.port_id} / ${row.onu_id}`
                }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['mac_type']">
                <template slot-scope="row">{{
                    lanMap[MAC_TYPES_MAP[row.mac_type]]
                }}</template>
            </nms-table-column>
        </nms-table>
        <nms-pagination
            :total="macList.length"
            :current-page="pagination.index"
            @current-change="changeIndex"
            style="float: right"
            hide-on-single-page
        ></nms-pagination>
        <nms-dialog :visible.sync="dialogVisible" width="550px">
            <div slot="title">{{ lanMap["flush_mac"] }}</div>
            <div class="form-item">
                <span>{{ lanMap["flush_way"] }}</span>
                <select v-model.number="form.flush_way">
                    <option value="0">{{ lanMap["all"] }}</option>
                    <option value="1">{{ lanMap["vlan_id"] }}</option>
                    <option value="2">{{ lanMap["port_id"] }}</option>
                    <option value="3">{{ lanMap["onu_id"] }}</option>
                </select>
            </div>
            <div class="form-item" v-if="form.flush_way === 1" key="vlan-id">
                <span>{{ lanMap["vlan_id"] }}</span>
                <input
                    type="text"
                    v-model.number="form.vlan_id"
                    v-validator:number="{ min: 1, max: 4094 }"
                />
                <span class="tips">1 - 4094</span>
            </div>
            <div
                class="form-item"
                v-if="form.flush_way === 2 || form.flush_way === 3"
                key="port-id"
            >
                <span>{{ lanMap["port_id"] }}</span>
                <select v-model.number="form.port_id" key="port-id">
                    <template v-for="item in port_name.pon">
                        <option :value="item.id">{{ item.name }}</option>
                    </template>
                </select>
            </div>
            <div class="form-item" v-if="form.flush_way === 3" key="onu-id">
                <span>{{ lanMap["onu_id"] }}</span>
                <input
                    type="text"
                    v-model.number="form.onu_id"
                    v-validator:number="{ mix: 1, max: 64 }"
                />
                <span class="tips">1 - 64</span>
            </div>
            <div slot="footer">
                <nms-button @click="fulshMac">{{ lanMap["apply"] }}</nms-button>
                <nms-button @click="dialogVisible = false">{{
                    lanMap["cancel"]
                }}</nms-button>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import macQuery from "./mac/query";
import { isArray, isDef, isReg } from "@/utils/common";
export default {
    name: "ponMac",
    components: { macQuery },
    computed: {
        ...mapState(["lanMap", "change_url", "system", "port_name"]),
        ponMacTable() {
            const start = this.pagination.display * (this.pagination.index - 1);
            return this.macList.slice(start, start + this.pagination.display);
        },
        ponports() {
            if (!this.system.data) {
                return 8;
            }
            return this.system.data.ponports;
        },
    },
    data() {
        return {
            MAC_TYPES_MAP: ["dynamic", "static", "blackhole", "all"],
            age: {},
            macTable: [],
            macList: [],
            pagination: {
                index: 1,
                display: 20,
            },
            form: {
                flush_way: 0,
                vlan_id: "",
                port_id: 1,
                onu_id: "",
            },
            dialogVisible: false,
            age_time: 0,
        };
    },
    created() {
        this.getAge();
        this.getMacTable();
    },
    methods: {
        getAge() {
            this.age = {};
            this.$http
                .get("/pon_mac?form=age")
                .then((res) => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.age = res.data.data;
                        }
                    }
                })
                .catch((err) => {});
        },
        getMacTable() {
            this.macTable = [];
            this.$http
                .get(this.change_url.pon_mac_list)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$http
                            .get(this.change_url.pon_mac_table)
                            .then((_res) => {
                                if (_res.data.code === 1) {
                                    if (isArray(_res.data.data)) {
                                        this.macTable = _res.data.data;
                                    }
                                }
                            })
                            .catch((err) => {});
                    }
                })
                .catch((err) => {});
        },
        dataChange(list) {
            this.macList = list;
        },
        changeIndex(index) {
            this.pagination.index = index;
        },
        openDialog() {
            this.resetForm();
            this.dialogVisible = true;
        },
        fulshMac() {
            if (
                this.form.flush_way === 1 &&
                (this.form.vlan_id < 1 ||
                    this.form.vlan_id > 4094 ||
                    isNaN(this.form.vlan_id))
            ) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["vlan_id"]}`
                );
            }
            if (this.form.flush_way === 2 || this.form.flush_way === 3) {
                const pid = this.form.port_id,
                    oid = this.form.onu_id,
                    valid_pid = pid < 1 || pid > this.ponports || isNaN(pid),
                    valid_oid = oid < 1 || oid > 64 || isNaN(oid);
                if (valid_pid) {
                    return this.$message.error(
                        `${this.lanMap["param_error"]}: ${this.lanMap["port_id"]}`
                    );
                }
                if (this.form.flush_way === 3 && valid_oid) {
                    return this.$message.error(
                        `${this.lanMap["param_error"]}: ${this.lanMap["onu_id"]}`
                    );
                }
            }
            this.$http
                .post("/pon_mac?form=flush", {
                    method: "set",
                    param: {
                        flush_type: this.form.flush_way,
                        vlan_id: this.form.vlan_id,
                        port_id: this.form.port_id,
                        onu_id: this.form.onu_id,
                    },
                })
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.getMacTable();
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
        resetForm() {
            this.form = {
                flush_way: 0,
                vlan_id: "",
                port_id: 1,
                onu_id: "",
            };
        },
        setMacAge() {
            this.age_time = this.age.age_time || "";
            this.$confirm(
                <div>
                    <span style="margin: 0 12px;">{this.lanMap["age"]}:</span>
                    <input
                        type="text"
                        value={this.age_time}
                        onInput={(e) =>
                            (this.age_time = Number(e.target.value))
                        }
                        style={{
                            "border-color":
                                this.age_time >= 0 && this.age_time <= 65535
                                    ? ""
                                    : "red",
                        }}
                    />
                    <span class="tips"> 0 - 65535</span>
                </div>,
                this.lanMap["config"]
            )
                .then(() => {
                    if (
                        this.age_time < 0 ||
                        this.age_time > 65535 ||
                        isNaN(this.age_time)
                    ) {
                        return this.$message.error(
                            `${this.lanMap["param_error"]}: ${this.lanMap["age"]}`
                        );
                    }
                    this.$http
                        .post(`/pon_mac?form=age_time`, {
                            method: "set",
                            param: {
                                age_time: this.age_time,
                            },
                        })
                        .then((res) => {
                            if (res.data.cdoe === 1) {
                                this.$message.success(
                                    this.lanMap["setting_ok"]
                                );
                                this.getAge();
                            } else {
                                this.$message.error(
                                    `(${res.data.code}]) ${res.data.message}`
                                );
                            }
                        })
                        .catch((err) => {});
                })
                .catch(() => {});
        },
    },
    directives: {
        validator: {
            update(el, { value, arg }) {
                if (arg === "number") {
                    const val = Number(el.value),
                        { min, max } = value;
                    if (val < min || val > max || isNaN(val)) {
                        el.style.borderColor = "red";
                    } else {
                        el.style.borderColor = "";
                    }
                } else if (arg === "string") {
                    const val = el.value,
                        { min, max, reg } = value;
                    if (isReg(reg)) {
                        if (!reg.test(val)) {
                            el.style.borderColor = "red";
                        } else {
                            el.style.borderColor = "";
                        }
                    } else {
                        if (val.length < min || val.length > max) {
                            el.style.borderColor = "red";
                        } else {
                            el.style.borderColor = "";
                        }
                    }
                }
            },
        },
    },
};
</script>

<style lang="less" scoped>
h2 {
    font-size: 24px;
    font-weight: 600;
    color: @titleColor;
    margin: 10px 0 20px 0;
}
h3 {
    margin: 20px 0 10px 10px;
    font-size: 18px;
    font-weight: 600;
    color: @titleColor;
    & + div {
        margin-left: 15px;
    }
}
div.mac-age {
    margin: 10px 0;
    span {
        display: inline-block;
        vertical-align: middle;
        width: 100px;
        &:first-child {
            margin-left: 10px;
            font-size: 18px;
            font-weight: 600;
            color: @titleColor;
        }
    }
}
div.form-item {
    margin: 12px 0;
    > span {
        display: inline-block;
        width: 120px;
        text-align: right;
        padding-right: 20px;
        box-sizing: border-box;
    }
    span.tips {
        width: auto;
        margin-left: 12px;
        text-align: left;
        padding: 0;
        color: @tipsColor;
        font-size: @tipsFontSize;
    }
    select {
        width: 197px;
    }
}
.tips {
    color: @tipsColor;
    font-size: @tipsFontSize;
    margin-left: 12px;
}
</style>