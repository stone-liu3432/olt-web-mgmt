<template>
    <div>
        <page-header type="none">
            <template slot="title">{{ lanMap["port_optical"] }}</template>
            <template slot="action">
                <nms-button @click="refreshData">
                    {{ lanMap["refresh"] }}
                </nms-button>
            </template>
        </page-header>
        <nms-table :rows="portOpticals" border>
            <nms-table-column :label="lanMap['port_id']">
                <template slot-scope="row">
                    {{ row.port_id | getPortName }}
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['portstate']">
                <template slot-scope="row">
                    {{ row.portstate ? lanMap["online"] : lanMap["offline"] }}
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['mstate']">
                <template slot-scope="row">
                    {{ row.mstate ? lanMap["detected"] : lanMap["undetected"] }}
                </template>
            </nms-table-column>
            <nms-table-column
                :label="lanMap['work_temprature']"
                prop="work_temprature"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['work_voltage']"
                prop="work_voltage"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['transmit_bias']"
                prop="transmit_bias"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['transmit_power']"
                prop="transmit_power"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['receive_power']"
                prop="receive_power"
            ></nms-table-column>
            <nms-table-column :label="lanMap['config']">
                <template slot-scope="row">
                    <nms-button type="text" @click="showDetail(row)">
                        {{ lanMap["show_detail"] }}
                    </nms-button>
                </template>
            </nms-table-column>
        </nms-table>
        <nms-dialog :visible.sync="dialogVisible" width="900px">
            <template slot="title">
                <span>{{ lanMap["port_id"] }}:</span>
                <span style="margin-left: 30px">
                    {{ opInfo.port_id | getPortName }}
                </span>
            </template>
            <div class="layout-row">
                <div class="row-40">
                    <cus-table
                        :data="mstateData"
                        :title="lanMap['o_m_state']"
                        :cus-layout="layoutMtype('mtype')"
                    ></cus-table>
                </div>
                <div class="row-60">
                    <cus-table
                        :data="manuInfoData"
                        :title="lanMap['o_m_maunu_info']"
                    ></cus-table>
                </div>
            </div>
            <div class="layout-row">
                <div class="row-40">
                    <cus-table
                        :data="staticInfoData"
                        :title="lanMap['o_m_static_info']"
                    ></cus-table>
                </div>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { isArray, debounce } from "@/utils/common";
import cusTable from "../pon/table";
export default {
    name: "portOptical",
    computed: {
        ...mapState(["lanMap"]),
        mstateData() {
            const mStates = [
                "portstate",
                "mstate",
                "mtype",
                "work_temprature",
                "work_voltage",
                "transmit_bias",
                "transmit_power",
                "receive_power",
            ];
            return mStates.reduce((prev, item) => {
                if (!prev[item]) {
                    prev[item] = this.opInfo[item];
                    if (item === "portstate") {
                        prev[item] = this.opInfo[item]
                            ? this.lanMap["online"]
                            : this.lanMap["offline"];
                    }
                    if (item === "mstate") {
                        prev[item] = this.opInfo[item]
                            ? this.lanMap["detected"]
                            : this.lanMap["undetected"];
                    }
                }
                return prev;
            }, {});
        },
        manuInfoData() {
            const manuInfos = [
                "vendor_name",
                "vendor_oui",
                "vendor_rev",
                "vendor_pn",
                "vendor_sn",
                "date_code",
                "vendor_specific",
            ];
            return manuInfos.reduce((prev, item) => {
                if (!prev[item]) {
                    prev[item] = this.opInfo[item];
                    if (this.opInfo[item] instanceof Array) {
                        prev[item] = this.opInfo[item]
                            .map((i) => i.toString(16))
                            .join(" ");
                    }
                }
                return prev;
            }, {});
        },
        staticInfoData() {
            const staticInfos = [
                "module_type",
                "max_distance",
                "wave_length",
                "fiber_type",
                "identifier",
                "connector",
                "encoding",
            ];
            return staticInfos.reduce((prev, item) => {
                if (!prev[item]) {
                    prev[item] = this.opInfo[item];
                }
                return prev;
            }, {});
        },
    },
    components: { cusTable },
    data() {
        return {
            portOpticals: [],
            opInfo: {},
            dialogVisible: false,
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.portOpticals = [];
            this.$http
                .get("/switch_port?form=optical_uplinkinfo")
                .then((res) => {
                    if (res.data.code === 1) {
                        if (isArray(res.data.data)) {
                            this.portOpticals = res.data.data;
                        }
                    }
                })
                .catch((err) => {});
        },
        refreshData() {
            debounce(this.getData, 1000, this);
        },
        showDetail(row) {
            const loading = this.$loading();
            this.opInfo = {};
            this.$http
                .get(
                    `/switch_port?form=optical_uplinkinfo&port_id=${row.port_id}`
                )
                .then((res) => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.opInfo = res.data.data;
                            this.dialogVisible = true;
                        }
                    }
                })
                .catch((err) => {
                    this.$message.error(this.lanMap["get_data_fail"]);
                })
                .finally(() => {
                    loading.close();
                });
        },
        layoutMtype() {
            const mtype_map = ["in_cali", "ex_cali"],
                _this = this;
            return {
                mtype(val) {
                    return _this.lanMap[mtype_map[val]];
                },
            };
        },
    },
};
</script>

<style lang="less" scoped>
.layout-row {
    &::after {
        content: "";
        display: table;
        clear: both;
    }
    .row-50 {
        float: left;
        width: 50%;
    }
    .row-40 {
        float: left;
        width: 40%;
    }
    .row-60 {
        float: left;
        width: 60%;
    }
}
</style>