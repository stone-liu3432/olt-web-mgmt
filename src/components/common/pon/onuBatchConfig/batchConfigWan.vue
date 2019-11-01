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
                        @click="jumpToWanConfig(rows.port_id, rows.onu_id)"
                    >{{ lanMap['detail'] }}</a>
                </template>
            </nms-table-column>
        </nms-table>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "batchWan",
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
            wanList: []
        };
    },
    created() {
        if (this.portid) {
            this.getData(this.portid);
        }
    },
    // mounted() {
    //     this.wanList = [
    //         {
    //             port_id: 1,
    //             onu_id: 2,
    //             macaddr: "38:3a:21:20:10:11",
    //             status: 1,
    //             count: 0,
    //             wanmax: 2
    //         }
    //     ];
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
        jumpToWanConfig(port_id, onu_id) {
            this.$router.push({
                path: "/onu_basic_info",
                query: {
                    port_id,
                    onu_id,
                    flag: "wan"
                }
            });
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