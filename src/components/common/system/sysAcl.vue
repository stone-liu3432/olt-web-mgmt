<template>
    <div>
        <page-header type="none">
            <template slot="title">{{ lanMap["sys_acl"] }}</template>
            <template slot="action">
                <nms-button @click="openDialog">{{ lanMap["add"] }}</nms-button>
                <nms-button style="margin-left: 30px" @click="refreshData">
                    {{ lanMap["refresh"] }}
                </nms-button>
            </template>
        </page-header>
        <nms-table :rows="ruleTabs" border>
            <nms-table-column
                :label="lanMap['name']"
                prop="name"
            ></nms-table-column>
            <nms-table-column :label="lanMap['afi']" prop="afi">
                <template slot-scope="row">
                    {{ AFI_MAP[row.afi] }}
                </template></nms-table-column
            >
            <nms-table-column :label="lanMap['type']">
                <template slot-scope="row">
                    {{ lanMap[TYPE_MAP[row.type]] }}
                </template>
            </nms-table-column>
            <nms-table-column
                :label="lanMap['hostip']"
                prop="hostip"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['macaddr']"
                prop="macaddr"
            ></nms-table-column>
            <nms-table-column :label="lanMap['access']">
                <template slot-scope="row">
                    {{ ACCESS_MAP[row.access] }}
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['config']">
                <template slot-scope="row">
                    <nms-button type="text" @click="delSystemAcl(row)">
                        {{ lanMap["delete"] }}
                    </nms-button>
                </template>
            </nms-table-column>
        </nms-table>
        <nms-dialog :visible.sync="dialogVisible" width="550px">
            <template slot="title">{{ lanMap["add"] }}</template>
            <div class="system-acl-form-item">
                <span>{{ lanMap["name"] }}</span>
                <input
                    type="text"
                    v-model="form.name"
                    v-validator="{ regexp: regName }"
                />
            </div>
            <div class="system-acl-form-item">
                <span>{{ lanMap["afi"] }}</span>
                <select v-model.number="form.afi">
                    <template v-for="(item, index) in AFI_MAP">
                        <option :value="Number(index)">{{ item }}</option>
                    </template>
                </select>
            </div>
            <!-- <div class="system-acl-form-item">
                <span>{{ lanMap["type"] }}</span>
                <select v-model.number="form.type">
                    <template v-for="(item, index) in TYPE_MAP">
                        <option :value="index">{{ lanMap[item] }}</option>
                    </template>
                </select>
            </div> -->
            <template v-if="form.afi === 1">
                <div class="system-acl-form-item">
                    <span>{{ lanMap["hostip"] }}</span>
                    <input
                        type="text"
                        v-model="form.hostip"
                        v-validator="{ regexp: regIpaddr }"
                    />
                    <span class="tips">ex. 127.0.0.1/24</span>
                </div>
            </template>
            <template v-if="form.afi === 2">
                <div class="system-acl-form-item">
                    <span>{{ lanMap["hostip"] }}</span>
                    <input
                        type="text"
                        v-model="form.hostip"
                        v-validator="{ validator: isIPv6 }"
                    />
                    <span class="tips">ex. 2000::1/64</span>
                </div>
            </template>
            <div class="system-acl-form-item">
                <span>{{ lanMap["macaddr"] }}</span>
                <input
                    type="text"
                    v-model="form.macaddr"
                    v-validator="{ regexp: regMac }"
                />
            </div>
            <div class="system-acl-form-item">
                <span>{{ lanMap["access"] }}</span>
                <select v-model.number="form.access">
                    <template v-for="(item, index) in ACCESS_MAP">
                        <option :value="Number(index)">{{ item }}</option>
                    </template>
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
import { isArray, debounce, isIPv6 } from "@/utils/common";
export default {
    name: "systemAcl",
    computed: {
        ...mapState(["lanMap"]),
    },
    data() {
        return {
            TYPE_MAP: ["deny", "permit"],
            AFI_MAP: { 1: "IPv4", 2: "IPv6" },
            ACCESS_MAP: {
                1: "Telnet",
                2: "Web",
                3: "SSH",
                4: "All",
            },
            ruleTabs: [],
            form: {
                name: "",
                afi: 1,
                type: 1,
                hostip: "",
                macaddr: "",
                access: 1,
            },
            dialogVisible: false,
            regMac: /^([a-f\d]{2}(:(?!$)|$)){6}$/i,
            regIpaddr: /^((25[0-5]|2[0-4]\d|1?\d?\d)(\.(?!$)|$|\/\d{1,3}$)){4}/,
            regName: /^\w{1,32}$/,
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.ruleTabs = [];
            this.$http
                .get(`/system_accesslist?form=rule_tab`)
                .then((res) => {
                    if (res.data.code === 1) {
                        if (isArray(res.data.data)) {
                            this.ruleTabs = res.data.data;
                        }
                    }
                })
                .catch((err) => {});
        },
        refreshData() {
            debounce(this.getData, 1000, this);
        },
        openDialog() {
            this.resetForm();
            this.dialogVisible = true;
        },
        resetForm() {
            this.form = {
                name: "",
                afi: 1,
                type: 1,
                hostip: "",
                macaddr: "",
                access: 1,
            };
        },
        isIPv6(val) {
            return isIPv6(val);
        },
        submitForm() {
            if (!this.regName.test(this.form.name)) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["name"]}`
                );
            }
            if (this.form.afi === 1 && !this.regIpaddr.test(this.form.hostip)) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["hostip"]}`
                );
            }
            if (this.form.afi === 2 && !this.isIPv6(this.form.hostip)) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["hostip"]}`
                );
            }
            if (!this.regMac.test(this.form.macaddr)) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["macaddr"]}`
                );
            }
            this.$http
                .post("/system_accesslist?form=rule_tab", {
                    method: "add",
                    param: {
                        name: this.form.name,
                        afi: this.form.afi,
                        type: this.form.type,
                        hostip: this.form.hostip,
                        macaddr: this.form.macaddr,
                        access: this.form.access,
                    },
                })
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message.success(
                            this.lanMap["add"] + this.lanMap["st_success"]
                        );
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
        delSystemAcl(row) {
            this.$confirm(this.lanMap["if_sure"] + this.lanMap["delete"] + " ?")
                .then(() => {
                    this.$http
                        .post("/system_accesslist?form=rule_tab", {
                            method: "delete",
                            param: {
                                name: row.name,
                            },
                        })
                        .then((res) => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["delete"] +
                                        this.lanMap["st_success"]
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
    },
};
</script>

<style lang="less" scoped>
.system-acl-form-item {
    margin: 12px 0;
    > span:first-child {
        display: inline-block;
        width: 120px;
        vertical-align: middle;
        padding-right: 12px;
        box-sizing: border-box;
        text-align: right;
    }
    span.tips {
        color: @tipsColor;
        font-size: @tipsFontSize;
        margin-left: 6px;
    }
    select {
        width: 197px;
    }
}
</style>