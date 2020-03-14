<template>
    <div>
        <h2>{{ lanMap['perf_info'] }}</h2>
        <hr />
        <nms-table :rows="perf_list" border>
            <nms-table-column prop="port_id" :label="lanMap['port_id']" min-width="80px">
                <template slot-scope="{ port_id }">{{ port_id | getPortName }}</template>
            </nms-table-column>
            <nms-table-column prop="rx_octets" :label="lanMap['rx_octets']"></nms-table-column>
            <nms-table-column prop="rx_frame" :label="lanMap['rx_frame']"></nms-table-column>
            <nms-table-column prop="rx_discard_frame" :label="lanMap['rx_discard_frame']"></nms-table-column>
            <nms-table-column prop="rx_error_frame" :label="lanMap['rx_error_frame']"></nms-table-column>
            <nms-table-column prop="tx_octets" :label="lanMap['tx_octets']"></nms-table-column>
            <nms-table-column prop="tx_frame" :label="lanMap['tx_frame']"></nms-table-column>
            <nms-table-column prop="tx_discard_frame" :label="lanMap['tx_discard_frame']"></nms-table-column>
            <nms-table-column prop="tx_error_frame" :label="lanMap['tx_error_frame']"></nms-table-column>
            <nms-table-column :label="lanMap['config']" width="150px">
                <template slot-scope="row">
                    <a
                        href="javascript: void(0);"
                        class="btn-text"
                        @click="showDetail(row.port_id)"
                    >{{ lanMap['detail'] }}</a>
                    <a
                        href="javascript: void(0);"
                        class="btn-text"
                        @click="clearPerf(row.port_id)"
                    >{{ lanMap['clear'] }}</a>
                </template>
            </nms-table-column>
        </nms-table>
        <nms-dialog :visible.sync="visible">
            <template slot="title">{{ lanMap['port_id'] }}: &nbsp;{{ portid | getPortName }}</template>
            <div class="perf-detail-content">
                <template v-for="(item, key) in perf_detail">
                    <div v-if="key !== 'port_id'">
                        <span>{{ key.replace(/_/g, ' ') }}</span>
                        <span>{{ item }}</span>
                    </div>
                </template>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "perfInfo",
    computed: mapState(["lanMap", "port_name", "port_info", "change_url"]),
    data() {
        return {
            portid: 0,
            visible: false,
            perf_list: [],
            perf_detail: {}
        };
    },
    activated() {
        this.getData();
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.perf_list = [];
            this.$http
                .get("/switch_port?form=statistictab")
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data && res.data.data.length) {
                            this.perf_list = res.data.data;
                        }
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        clearPerf(portid) {
            this.$confirm(this.lanMap["if_sure"])
                .then(_ => {
                    this.$http
                        .get("/switch_port?form=nostatistic", {
                            params: { port_id: portid }
                        })
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message({
                                    type: res.data.type,
                                    text:
                                        this.lanMap["clear_perf"] +
                                        this.lanMap["setting_ok"]
                                });
                                this.getData();
                            } else {
                                this.$message({
                                    type: res.data.type,
                                    text:
                                        "(" +
                                        res.data.code +
                                        ")" +
                                        res.data.message
                                });
                            }
                        })
                        .catch(err => {});
                })
                .catch(_ => {});
        },
        showDetail(portid) {
            this.visible = true;
            this.getDetail(portid);
        },
        getDetail(port_id) {
            this.perf_detail = {};
            this.portid = port_id;
            this.$http
                .get("/switch_port", { params: { form: "statistic", port_id } })
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.perf_detail = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        }
    }
};
</script>

<style lang="less" scoped>
h2 {
    margin: 10px 0 10px 0;
    display: inline-block;
    width: 300px;
    font-size: 24px;
    font-weight: 600;
    color: #67aef7;
}
a.btn-text {
    padding: 0 6px;
}
.perf-detail-content {
    > div {
        border-bottom: 1px solid #ccc;
        float: left;
        padding: 3px 6px;
        box-sizing: border-box;
        width: 50%;
        line-height: 24px;
        span {
            text-transform: capitalize;
            display: inline-block;
            box-sizing: border-box;
            vertical-align: middle;
            width: 49%;
            &:first-child {
                text-align: right;
            }
            &:last-child {
                padding-left: 30px;
            }
        }
    }
}
</style>