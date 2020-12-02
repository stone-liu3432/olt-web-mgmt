<template>
    <div>
        <page-header type="none">
            <template slot="title">{{ lanMap["cli_acl"] }}</template>
        </page-header>
        <div class="acl-acl-item">
            <span>{{ lanMap["vtyacl"] }}:</span>
            <span>{{ vtyacl || "-" }}</span>
        </div>
        <div class="acl-acl-item">
            <span>{{ lanMap["vtyacl_ipv6"] }}:</span>
            <span>{{ vtyacl_ipv6 || "-" }}</span>
        </div>
        <div class="acl-acl-item">
            <span>{{ lanMap["cli_acl_list"] }}</span>
            <nms-button style="margin-left: 30px" @click="openDialog('add')">
                {{ lanMap["add"] + " CLI  ACL" }}
            </nms-button>
            <nms-button style="margin-left: 30px" @click="openDialog('bind')">
                {{ lanMap["bind_cli_acl"] }}
            </nms-button>
        </div>
        <nms-table :rows="aclList" border>
            <nms-table-column
                :label="lanMap['name']"
                prop="name"
            ></nms-table-column>
            <nms-table-column :label="lanMap['afi']">
                <template slot-scope="row">
                    {{ lanMap[AFI_MAP[row.afi]] }}
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['type']">
                <template slot-scope="row">
                    {{ lanMap[TYPE_MAP[row.type]] }}
                </template>
            </nms-table-column>
            <nms-table-column
                :label="lanMap['hostip']"
                prop="hostip"
            ></nms-table-column>
            <nms-table-column :label="lanMap['exact']" prop="exact">
                <template slot-scope="row">
                    {{ row.exact ? lanMap["enable"] : lanMap["disable"] }}
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['config']">
                <template slot-scope="row">
                    <nms-button type="text" @click="deleteAcl(row)">
                        {{ lanMap["delete"] }}
                    </nms-button>
                </template>
            </nms-table-column>
        </nms-table>
        <nms-dialog :visible.sync="dialogVisible" width="550px">
            <template slot="title">
                {{
                    dialogType === "add"
                        ? lanMap["add"] + " CLI ACL"
                        : lanMap["bind_cli_acl"]
                }}
            </template>
            <template v-if="dialogType === 'bind'">
                <div class="cli-acl-form-item" v-if="vtyaclList.length">
                    <span>{{ lanMap["vtyacl"] }}</span>
                    <select v-model="form.vtyacl" :disabled="form.clearVtyacl">
                        <template v-for="item in vtyaclList">
                            <template v-if="item.afi === 1">
                                <option :value="item.name">
                                    {{ item.name }}
                                </option>
                            </template>
                        </template>
                    </select>
                    <label style="margin-left: 20px">
                        <input type="checkbox" v-model="form.clearVtyacl" />
                        <span>{{ lanMap["clear"] }}</span>
                    </label>
                </div>
                <div class="cli-acl-form-item" v-if="vtyaclIpv6List.length">
                    <span>{{ lanMap["vtyacl_ipv6"] }}</span>
                    <select
                        v-model="form.vtyacl_ipv6"
                        :disabled="form.clearVtyaclIpv6"
                    >
                        <template v-for="item in vtyaclIpv6List">
                            <template v-if="item.afi === 2">
                                <option :value="item.name">
                                    {{ item.name }}
                                </option>
                            </template>
                        </template>
                    </select>
                    <label style="margin-left: 20px">
                        <input type="checkbox" v-model="form.clearVtyaclIpv6" />
                        <span>{{ lanMap["clear"] }}</span>
                    </label>
                </div>
            </template>
            <template v-if="dialogType === 'add'">
                <div class="cli-acl-form-item">
                    <span>{{ lanMap["name"] }}</span>
                    <input
                        type="text"
                        v-model="form.name"
                        v-validator="{ regexp: regName }"
                    />
                </div>
                <div class="cli-acl-form-item">
                    <span>{{ lanMap["afi"] }}</span>
                    <select v-model.number="form.afi">
                        <template v-for="(item, index) in AFI_MAP">
                            <option :value="Number(index)">
                                {{ lanMap[item] }}
                            </option>
                        </template>
                    </select>
                </div>
                <div class="cli-acl-form-item">
                    <span>{{ lanMap["type"] }}</span>
                    <select v-model.number="form.type">
                        <template v-for="(item, index) in TYPE_MAP">
                            <option :value="index">{{ lanMap[item] }}</option>
                        </template>
                    </select>
                </div>
                <div class="cli-acl-form-item">
                    <span>{{ lanMap["hostip"] }}</span>
                    <input
                        type="text"
                        spellcheck="false"
                        v-model="form.hostip"
                        :placeholder="
                            form.afi === 1 ? '0.0.0.0/0' : '2001:250:6000::/48'
                        "
                        :style="{ width: form.afi === 2 ? '300px' : '' }"
                        v-validator="ipValidator"
                    />
                </div>
                <div class="cli-acl-form-item">
                    <span>{{ lanMap["exact"] }}</span>
                    <select v-model.number="form.exact">
                        <option :value="0">{{ lanMap["disable"] }}</option>
                        <option :value="1">{{ lanMap["enable"] }}</option>
                    </select>
                </div>
            </template>
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
import { isArray, isIPv6, isFunction } from "@/utils/common";
export default {
    name: "cliAcl",
    computed: {
        ...mapState(["lanMap"]),
        vtyaclList() {
            return this.aclList.filter((item) => item.afi === 1);
        },
        vtyaclIpv6List() {
            return this.aclList.filter((item) => item.afi === 2);
        },
        ipValidator() {
            if (this.form.afi === 1) {
                return {
                    validator: this.testIPAddr,
                };
            }
            return {
                validator: isIPv6,
            };
        },
    },
    data() {
        return {
            AFI_MAP: { 1: "ipv4", 2: "ipv6" },
            TYPE_MAP: ["deny", "permit"],
            aclList: [
                {
                    name: "filter1",
                    afi: 1,
                    type: 1,
                    hostip: "any",
                    exact: 1,
                },
                {
                    name: "filter2",
                    afi: 2,
                    type: 1,
                    hostip: "any",
                    exact: 1,
                },
            ],
            vtyacl: "fdsaf",
            vtyacl_ipv6: "adsfas",
            dialogVisible: false,
            dialogType: "",
            regName: /^\w{1,32}$/,
            form: {
                vtyacl: "",
                vtyacl_ipv6: "",
                clearVtyacl: false,
                clearVtyaclIpv6: false,
                name: "",
                afi: 1,
                type: 0,
                hostip: "",
                exact: 0,
            },
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.vtyacl = "";
            this.vtyacl_ipv6 = "";
            this.aclList = [];
            this.$http
                .get("/system_accesslist?form=info")
                .then((res) => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.vtyacl = res.data.data.vtyacl || "";
                            this.vtyacl_ipv6 = res.data.data.vtyacl_ipv6 || "";
                            if (isArray(res.data.data.filter)) {
                                this.aclList = res.data.data.filter;
                            }
                        }
                    }
                })
                .catch((err) => {});
        },
        openDialog(type) {
            if (type === "bind" && !this.aclList.length) {
                return this.$message.error(this.lanMap["bind_cli_acl_tips"]);
            }
            this.dialogType = type;
            this.dialogVisible = true;
            switch (type) {
                case "bind":
                    this.form.vtyacl = this.vtyaclList[0]
                        ? this.vtyaclList[0].name
                        : "";
                    this.form.vtyacl_ipv6 = this.vtyaclIpv6List[0]
                        ? this.vtyaclIpv6List[0].name
                        : "";
                    break;
                case "add":
                    this.resetForm();
                    break;
            }
        },
        resetForm() {
            this.form.vtyacl = "";
            this.form.vtyacl_ipv6 = "";
            this.form.name = "";
            this.form.afi = 1;
            this.form.type = 0;
            this.form.hostip = "";
            this.form.exact = 0;
        },
        submitForm() {
            const ACTIONS = {
                bind(form) {
                    return {
                        url: "/system_accesslist?form=aclbind",
                        data: {
                            method: "set",
                            param: {
                                vtyacl: this.clearVtyacl ? "" : form.vtyacl,
                                vtyacl_ipv6: this.clearVtyaclIpv6
                                    ? ""
                                    : form.vtyacl_ipv6,
                            },
                        },
                    };
                },
                add(form) {
                    if (!this.regName.test(this.form.name)) {
                        this.$message.error(
                            `${this.lanMap["param_error"]}: ${this.lanMap["name"]}`
                        );
                        return;
                    }
                    if (this.form.afi === 1) {
                        if (!this.testIPAddr(this.form.hostip)) {
                            this.$message.error(
                                `${this.lanMap["param_error"]}: ${this.lanMap["hostip"]}`
                            );
                            return;
                        }
                    } else {
                        if (!isIPv6(this.form.hostip)) {
                            this.$message.error(
                                `${this.lanMap["param_error"]}: ${this.lanMap["hostip"]}`
                            );
                            return;
                        }
                    }
                    return {
                        url: "/system_accesslist?form=aclrule",
                        data: {
                            method: "set",
                            param: {
                                name: form.name,
                                afi: form.afi,
                                type: form.type,
                                hostip: form.hostip,
                                exact: form.exact,
                                flag: 1,
                            },
                        },
                    };
                },
            };
            if (isFunction(ACTIONS[this.dialogType])) {
                const res = ACTIONS[this.dialogType].call(this, this.form);
                if (res) {
                    const { url, data } = res;
                    this.$http
                        .post(url, data)
                        .then((res) => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.dialogType === "add"
                                        ? this.lanMap["add"] +
                                              this.lanMap["st_success"]
                                        : this.lanMap["setting_ok"]
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
                            this.resetForm();
                        });
                }
            }
        },
        deleteAcl(row) {
            this.$confirm(this.lanMap["if_sure"] + this.lanMap["delete"] + " ?")
                .then(() => {
                    const url = "/system_accesslist?form=aclrule",
                        post_param = {
                            method: "set",
                            param: {
                                name: row.name,
                                afi: row.afi,
                                type: row.type,
                                hostip: row.hostip,
                                exact: row.exact,
                                flag: 0,
                            },
                        };
                    this.$http
                        .post(url, post_param)
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
        testIPAddr(val) {
            const reg = /^((25[0-5]|2[0-4]\d|1?\d?\d)(\.(?!\/)|(\/\d{1,3}$|$))){4}/;
            return reg.test(val);
        },
    },
};
</script>

<style lang="less" scoped>
.acl-acl-item {
    margin: 20px 0 20px 10px;
    > span {
        vertical-align: middle;
        display: inline-block;
        &:first-child {
            color: @titleColor;
            font-size: 18px;
            font-weight: 500;
            padding-right: 12px;
        }
    }
}
.cli-acl-form-item {
    margin: 20px 0;
    > span {
        display: inline-block;
        vertical-align: middle;
        width: 180px;
        padding-right: 12px;
        text-align: right;
    }
    select {
        width: 200px;
    }
}
</style>