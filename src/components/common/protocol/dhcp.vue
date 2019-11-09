<template>
    <div>
        <page-header type="none">
            <div slot="title">{{ lanMap['dhcp'] }}</div>
        </page-header>
        <div class="dhcp-config">
            <span>{{ lanMap['dhcp_admin'] }}:</span>
            <span>{{ dhcpInfo.dhcp_admin ? lanMap['enable'] : lanMap['disable'] }}</span>
            <a href="javascript: void(0);" @click="openDialog">{{ lanMap['config'] }}</a>
        </div>
        <div v-if="admin === 1">
            <tab-bar :tab="tabs" v-model="tab"></tab-bar>
            <dhcp-relay v-if="tab === 'DHCP Relay'" :global-data="dhcpInfo" @update-data="getData"></dhcp-relay>
            <dhcp-option82
                v-if="tab === 'DHCP Option82'"
                :global-data="dhcpInfo"
                @update-data="getData"
            ></dhcp-option82>
            <dhcp-snooping
                v-if="tab === 'DHCP Snooping'"
                :global-data="dhcpInfo"
                @update-data="getData"
            ></dhcp-snooping>
        </div>
        <nms-dialog :visible.sync="visible" width="500px" :title="lanMap['set']">
            <div class="global-dhcp-form-item">
                <span>{{ lanMap['dhcp_admin'] }}</span>
                <select v-model.number="dhcp_admin">
                    <option :value="0">{{ lanMap['disable'] }}</option>
                    <option :value="1">{{ lanMap['enable'] }}</option>
                </select>
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
import dhcpRelay from "./dhcp/relay";
import dhcpOption82 from "./dhcp/option82";
import dhcpSnooping from "./dhcp/snooping";
export default {
    name: "dhcp",
    computed: {
        ...mapState(["lanMap"]),
        admin() {
            return this.dhcpInfo.dhcp_admin;
        }
    },
    components: { dhcpRelay, dhcpOption82, dhcpSnooping },
    data() {
        return {
            tabs: ["DHCP Relay", "DHCP Option82", "DHCP Snooping"],
            tab: "DHCP Relay",
            dhcpInfo: {},
            dhcp_admin: 0,
            visible: false
        };
    },
    created() {
        this.getData();
    },
    // mounted() {
    //     this.dhcpInfo = {
    //         dhcp_admin: 1,
    //         relay_admin: 1,
    //         relay_policy: 0,
    //         option82_admin: 1,
    //         option82_policy: 0,
    //         option82_circuit: 1,
    //         option82_remote: 1,
    //         snooping_admin: 1,
    //         chaddr_check: 1,
    //         response_time: 60,
    //         trust_portlist: "5-9"
    //     };
    // },
    methods: {
        getData() {
            this.dhcpInfo = {};
            this.$http
                .get("/switch_dhcp?form=global_config")
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.dhcpInfo = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        openDialog() {
            this.dhcp_admin = this.admin || 0;
            this.visible = true;
        },
        closeDialog() {
            this.visible = false;
        },
        submitForm() {
            if (this.admin === this.dhcp_admin) {
                this.closeDialog();
                return;
            }
            const data = {
                method: "set",
                param: {
                    dhcp_admin: this.dhcp_admin
                }
            };
            this.$http
                .post("/switch_dhcp?form=dhcp_admin", data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.getData();
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                    this.closeDialog();
                })
                .catch(err => {});
        }
    }
};
</script>

<style lang="less" scoped>
.dhcp-config {
    a {
        margin-left: 30px;
    }
}
.global-dhcp-form-item{
    >span{
        display: inline-block;
        width: 150px;
    }
    select{
        width: 200px;
    }
}
</style>