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
            <nms-table-column :label="lanMap['wan_count']">
                <template slot-scope="rows">{{ `${rows.count}/${rows.wanmax}` }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['vlan_id']">
                <template slot-scope="rows">{{ rows.wan0 ? (rows.wan0.vlan_id || '-') : '-' }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['ipmode']">
                <template
                    slot-scope="rows"
                >{{ rows.wan0 ? (ipmodes[rows.wan0.ipmode] || '-') : '-' }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['ctype']">
                <template slot-scope="rows">{{ rows.wan0 ? (ctypes[rows.wan0.ctype] || '-') : '-' }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['desc']">
                <template slot-scope="rows">{{ rows.wan0 ? (rows.wan0.desc || '-') : '-' }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['config']">
                <template slot-scope="rows">
                    <a
                        href="javascript: void(0);"
                        class="btn-text"
                        @click="openDialog(rows)"
                    >{{ lanMap['detail'] }}</a>
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
            portData: {},
            ipmodes: ["Static IP", "DHCP", "PPPoE", "Bridge"],
            ctypes: {
                0x1: "TR069",
                0x2: "INTERNET",
                0x4: "Other",
                0x8: "VOICE"
            }
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
    //             onu_name: "sadfas",
    //             macaddr: "38:3a:21:20:10:11",
    //             status: 1,
    //             count: 0,
    //             wanmax: 2,
    //             lanports: 4,
    //             wlan: 2,
    //             voip: 2,
    //             wan0: {
    //                 vlan_id: 100,
    //                 ipmode: 1,
    //                 ctype: 2,
    //                 desc: "123"
    //             }
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