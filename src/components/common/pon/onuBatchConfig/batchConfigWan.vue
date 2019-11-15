<template>
    <div>
        <nms-table :rows="wanList" border>
            <nms-table-column :label="lanMap['onu_id']">
                <template slot-scope="rows">{{ `ONU${rows.port_id}/${rows.onu_id}` }}</template>
            </nms-table-column>
            <nms-table-column prop="macaddr" :label="lanMap['macaddr']"></nms-table-column>
            <nms-table-column prop="status" :label="lanMap['status']">
                <template slot-scope="rows">{{ rows.status ? lanMap['online'] : lanMap['offline'] }}</template>
            </nms-table-column>
            <nms-table-column prop="count" :label="lanMap['wan_count']"></nms-table-column>
            <nms-table-column prop="wanmax" :label="lanMap['wan_count_max']"></nms-table-column>
            <nms-table-column :label="lanMap['config']">
                <template slot-scope="rows">
                    <a
                        href="javascript: void(0);"
                        class="btn-text"
                        @click="openDialog(rows)"
                    >{{ lanMap['detail'] }}</a>
                    <!-- <nms-dropdown :offset-y="30" @command="command">
                        {{ lanMap['config'] }}
                        <template slot="dropdown">
                            <nms-dropdown-item :command="composeData('add', rows)">1</nms-dropdown-item>
                            <nms-dropdown-item
                                :command="composeData('detail', rows)"
                                :disabled="rows.count === 0"
                            >3</nms-dropdown-item>
                        </template>
                    </nms-dropdown> -->
                </template>
            </nms-table-column>
        </nms-table>
        <nms-dialog :visible.sync="visible">
            <div slot="title">{{ lanMap['detail'] }}</div>
            <onu-wan-config :port-data="portData" style="height: 600px;"></onu-wan-config>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import onuWanConfig from "./onuWanConfig";
export default {
    name: "batchWan",
    components: { onuWanConfig },
    computed: {
        ...mapState(["lanMap"])
    },
    props: {
        portid: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            wanList: [],
            visible: false,
            portData: {}
        };
    },
    created() {
        if (this.portid) {
            this.getData(this.portid);
        }
    },
    // mounted() {
    //     this.wanList = Array.from({ length: 30 }).map((item, index) => {
    //         return {
    //             port_id: 1,
    //             onu_id: index + 1,
    //             macaddr: "38:3a:21:20:10:11",
    //             status: 1,
    //             count: 0,
    //             wanmax: 2,
    //             lanports: 4,
    //             wlan: 2,
    //             voip: 2
    //         };
    //     });
    // },
    methods: {
        getData(port_id) {
            this.wanList = [];
            this.$http
                .get("/onumgmt", { params: { form: "wantab", port_id } })
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data && res.data.data.length) {
                            this.wanList = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        openDialog(row) {
            this.portData = {
                portid: row.port_id,
                onuid: row.onu_id,
                geports: row.lanports,
                wlan: row.wlan,
                voip: row.voip
            };
            this.visible = true;
        }
    },
    watch: {
        portid() {
            if (this.portid) {
                this.getData(this.portid);
            }
        }
    }
};
</script>

<style lang="less" scoped>
</style>