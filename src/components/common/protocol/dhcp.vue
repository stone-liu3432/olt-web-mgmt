<template>
    <div>
        <page-header type="none">
            <div slot="title">{{ lanMap['dhcp'] }}</div>
        </page-header>
        <tab-bar :tab="tabs" v-model="tab"></tab-bar>
        <dhcp-relay v-if="tab === 'DHCP Relay'" :global-data="dhcpInfo"></dhcp-relay>
        <dhcp-option82 v-if="tab === 'DHCP Option82'" :global-data="dhcpInfo"></dhcp-option82>
        <dhcp-snooping v-if="tab === 'DHCP Snooping'" :global-data="dhcpInfo"></dhcp-snooping>
    </div>
</template>

<script>
import { mapState } from "vuex";
import dhcpRelay from './dhcp/relay';
import dhcpOption82 from './dhcp/option82';
import dhcpSnooping from './dhcp/snooping';
export default {
    name: "dhcp",
    computed: mapState(["lanMap"]),
    components: { dhcpRelay, dhcpOption82, dhcpSnooping },
    data() {
        return {
            tabs: ["DHCP Relay", "DHCP Option82", "DHCP Snooping"],
            tab: "DHCP Relay",
            dhcpInfo: {}
        };
    },
    created() {
        //this.getData();
    },
    mounted() {
        this.dhcpInfo = {
            dhcp_admin: 1,
            relay_admin: 1,
            relay_policy: 0,
            option82_admin: 1,
            option82_policy: 0,
            option82_circuit: 1,
            option82_remote: 1,
            snooping_admin: 1,
            chaddr_check: 1,
            response_time: 60,
            trust_portlist: "5-12"
        };
    },
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
        }
    }
};
</script>

<style lang="less" scoped>
</style>