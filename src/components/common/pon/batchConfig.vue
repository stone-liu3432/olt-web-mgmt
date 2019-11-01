<template>
    <div>
        <page-header type="pon" @change="updatePort">
            <div slot="title">{{ lanMap['batch_mgmt_onu'] }}</div>
        </page-header>
        <tab-bar :tab="tabs" @togglePage="changePage"></tab-bar>
        <batch-config-vlan v-if="showIndex === 'op_vlan'" :portid="port_id"></batch-config-vlan>
        <batch-config-wan v-if="showIndex === 'wan_connect'" :portid="port_id"></batch-config-wan>
        <batch-config-wlan v-if="showIndex === 'onu_wlan'" :portid="port_id"></batch-config-wlan>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import batchConfigVlan from "./onuBatchConfig/batchConfigVlan";
import batchConfigWan from "./onuBatchConfig/batchConfigWan";
import batchConfigWlan from "./onuBatchConfig/batchConfigWlan";
export default {
    name: "batchConfig",
    components: { batchConfigVlan, batchConfigWan, batchConfigWlan },
    data() {
        return {
            tabs: ["op_vlan", "onu_wlan", "wan_connect"],
            showIndex: "op_vlan",
            port_id: 0
        };
    },
    computed: {
        ...mapState(["lanMap"])
    },
    created() {},
    methods: {
        updatePort(port_id) {
            this.port_id = port_id;
        },
        changePage(name) {
            this.showIndex = name;
        },
        routeLeave(to, from ,next){
            
        }
    }
};
</script>

<style lang="less" scoped>
</style>