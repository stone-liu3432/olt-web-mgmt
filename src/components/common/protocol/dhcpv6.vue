<template>
    <div>
        <page-header type="none">
            <template slot="title">{{ lanMap["dhcp_v6"] }}</template>
        </page-header>
        <div class="dhcp-v6-item">
            <span>{{ lanMap["dhcpv6_admin"] }}:</span>
            <span>{{ dhcpV6Admin }}</span>
            <nms-button size="small" @click="openDialog('v6')">
                {{ lanMap["config"] }}
            </nms-button>
        </div>
        <template v-if="globalInfo.dhcpv6_admin">
            <div class="dhcp-v6-item">
                <span>{{ lanMap["option18_admin"] }}:</span>
                <span>{{ opt18Admin }}</span>
                <nms-button size="small" @click="openDialog('opt18')">
                    {{ lanMap["config"] }}
                </nms-button>
            </div>
            <div class="dhcp-v6-item">
                <span>{{ lanMap["option37_admin"] }}:</span>
                <span>{{ opt37Admin }}</span>
                <nms-button size="small" @click="openDialog('opt37')">
                    {{ lanMap["config"] }}
                </nms-button>
            </div>
        </template>
        <nms-dialog :visible.sync="dialogVisible" width="400px">
            <template slot="title">{{ lanMap["config"] }}</template>
            <template v-if="dialogType === 'v6'">
                <div class="nms-dialog-content-item">
                    <span>{{ lanMap["dhcpv6_admin"] }}</span>
                    <select v-model.number="form.dhcpv6_admin">
                        <template v-for="(item, index) in ADMIN_STATUS_MAP">
                            <option :value="index">{{ lanMap[item] }}</option>
                        </template>
                    </select>
                </div>
            </template>
            <template v-if="dialogType === 'opt18'">
                <div class="nms-dialog-content-item">
                    <span>{{ lanMap["option18_admin"] }}</span>
                    <select v-model.number="form.option18_admin">
                        <template v-for="(item, index) in ADMIN_STATUS_MAP">
                            <option :value="index">{{ lanMap[item] }}</option>
                        </template>
                    </select>
                </div>
            </template>
            <template v-if="dialogType === 'opt37'">
                <div class="nms-dialog-content-item">
                    <span>{{ lanMap["option37_admin"] }}</span>
                    <select v-model.number="form.option37_admin">
                        <template v-for="(item, index) in ADMIN_STATUS_MAP">
                            <option :value="index">{{ lanMap[item] }}</option>
                        </template>
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
import { isFunction } from "@/utils/common";
export default {
    name: "dhcpV6",
    computed: {
        ...mapState(["lanMap"]),
        dhcpV6Admin() {
            return this.globalInfo.dhcpv6_admin
                ? this.lanMap["enable"]
                : this.lanMap["disable"];
        },
        opt18Admin() {
            return this.globalInfo.option18_admin
                ? this.lanMap["enable"]
                : this.lanMap["disable"];
        },
        opt37Admin() {
            return this.globalInfo.option37_admin
                ? this.lanMap["enable"]
                : this.lanMap["disable"];
        },
    },
    data() {
        return {
            ADMIN_STATUS_MAP: ["disable", "enable"],
            globalInfo: {},
            dialogVisible: false,
            dialogType: "",
            form: {
                dhcpv6_admin: 0,
                option18_admin: 0,
                option37_admin: 0,
            },
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.globalInfo = {};
            this.$http
                .get("/switch_dhcp?form=dhcpv6_global")
                .then((res) => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.globalInfo = res.data.data;
                        }
                    }
                })
                .catch((err) => {});
        },
        openDialog(type) {
            this.dialogType = type;
            this.dialogVisible = true;
            switch (type) {
                case "v6":
                    this.form.dhcpv6_admin = this.globalInfo.dhcpv6_admin;
                    break;
                case "opt18":
                    this.form.option18_admin = this.globalInfo.option18_admin;
                    break;
                case "opt37":
                    this.form.option37_admin = this.globalInfo.option37_admin;
                    break;
            }
        },
        submitForm() {
            const ACTIONS = {
                v6(form) {
                    if (
                        this.form.dhcpv6_admin === this.globalInfo.dhcpv6_admin
                    ) {
                        this.$message.info(this.lanMap["modify_tips"]);
                        return;
                    }
                    return {
                        url: "/switch_dhcp?form=dhcpv6_admin",
                        data: {
                            method: "set",
                            param: {
                                dhcpv6_admin: form.dhcpv6_admin,
                            },
                        },
                    };
                },
                opt18(form) {
                    if (
                        this.form.option18_admin ===
                        this.globalInfo.option18_admin
                    ) {
                        this.$message.info(this.lanMap["modify_tips"]);
                        return;
                    }
                    return {
                        url: "/switch_dhcp?form=option18_admin",
                        data: {
                            method: "set",
                            param: {
                                option18_admin: form.option18_admin,
                            },
                        },
                    };
                },
                opt37(form) {
                    if (
                        this.form.option37_admin ===
                        this.globalInfo.option37_admin
                    ) {
                        this.$message.info(this.lanMap["modify_tips"]);
                        return;
                    }
                    return {
                        url: "/switch_dhcp?form=option37_admin",
                        data: {
                            method: "set",
                            param: {
                                option37_admin: form.option37_admin,
                            },
                        },
                    };
                },
            };
            if (isFunction(ACTIONS[this.dialogType])) {
                const res = ACTIONS[this.dialogType].call(this, this.form);
                if (res) {
                    const { url, data } = res;
                    url &&
                        data &&
                        this.$http
                            .post(url, data)
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
                    this.dialogVisible = false;
                }
            }
        },
    },
};
</script>

<style lang="less" scoped>
.dhcp-v6-item {
    margin: 20px 0 20px 10px;
    > span {
        display: inline-block;
        vertical-align: middle;
        width: 150px;
    }
}
.nms-dialog-content-item {
    margin: 20px 0;
    > span {
        display: inline-block;
        vertical-align: middle;
        width: 140px;
        text-align: right;
        padding-right: 12px;
        box-sizing: border-box;
    }
    > select {
        width: 200px;
    }
}
</style>