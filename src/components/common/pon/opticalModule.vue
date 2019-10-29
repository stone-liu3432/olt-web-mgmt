<template>
    <div>
        <table border="1" v-if="data.length">
            <thead>
                <th>{{ lanMap['port_id'] }}</th>
                <th>{{ lanMap['portstate'] }}</th>
                <th>{{ lanMap['mstate'] }}</th>
                <th>{{ lanMap['work_temprature'] }}</th>
                <th>{{ lanMap['work_voltage'] }}</th>
                <th>{{ lanMap['transmit_bias'] }}</th>
                <th>{{ lanMap['transmit_power'] }}</th>
                <th>{{ lanMap['show_detail'] }}</th>
            </thead>
            <tbody>
                <template v-for="item in data">
                    <tr>
                        <td>{{ portName(item.port_id) }}</td>
                        <td>{{ item.portstate === 1 ? lanMap['online'] : lanMap['offline'] }}</td>
                        <td>{{ item.mstate === 1 ? lanMap['detected'] : lanMap['undetected'] }}</td>
                        <td>{{ item.work_temprature }}</td>
                        <td>{{ item.work_voltage }}</td>
                        <td>{{ item.transmit_bias }}</td>
                        <td>{{ item.transmit_power }}</td>
                        <td>
                            <a
                                href="javascript: void(0);"
                                class="btn-text"
                                @click="showDetail(item.port_id)"
                            >{{ lanMap['show_detail'] }}</a>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
        <div class="modal-dialog" v-if="visible">
            <div class="cover"></div>
            <div class="om-dialog-content">
                <div
                    class="modal-header"
                >{{`${lanMap['port_id']}: ${ op_info.port_id ? portName(op_info.port_id) : ""}` }}</div>
                <div class="layout-row">
                    <div class="row-40">
                        <cus-table :data="mstateData" :title="lanMap['o_m_state']" :cus-layout="layoutMtype('mtype')"></cus-table>
                    </div>
                    <div class="row-60">
                        <cus-table :data="manuInfoData" :title="lanMap['o_m_maunu_info']"></cus-table>
                    </div>
                </div>
                <div class="layout-row">
                    <div class="row-40">
                        <cus-table :data="staticInfoData" :title="lanMap['o_m_static_info']"></cus-table>
                    </div>
                    <div class="row-60">
                        <cus-table
                            :data="opParamData"
                            :title="lanMap['o_m_threshold']"
                            custom-class="cell-width"
                        ></cus-table>
                    </div>
                </div>
                <div class="close" @click="closeDialog"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import cusTable from "./table";
export default {
    name: "optical-module",
    components: { cusTable },
    computed: {
        ...mapState(["lanMap", "port_name"]),
        mstateData() {
            return this.mStates.reduce((prev, item) => {
                if (!prev[item]) {
                    prev[item] = this.op_info[item];
                    if (item === "portstate") {
                        prev[item] = this.op_info[item]
                            ? this.lanMap["online"]
                            : this.lanMap["offline"];
                    }
                    if (item === "mstate") {
                        prev[item] = this.op_info[item]
                            ? this.lanMap["detected"]
                            : this.lanMap["undetected"];
                    }
                }
                return prev;
            }, {});
        },
        manuInfoData() {
            return this.manuInfos.reduce((prev, item) => {
                if (!prev[item]) {
                    prev[item] = this.op_info[item];
                    if (this.op_info[item] instanceof Array) {
                        prev[item] = this.op_info[item]
                            .map(i => i.toString(16))
                            .join(" ");
                    }
                }
                return prev;
            }, {});
        },
        staticInfoData() {
            return this.staticInfos.reduce((prev, item) => {
                if (!prev[item]) {
                    prev[item] = this.op_info[item];
                }
                return prev;
            }, {});
        },
        opParamData() {
            return Object.keys(this.opParams).reduce((prev, item) => {
                prev[item] = `[${this.op_info[this.opParams[item][0]].toFixed(
                    2
                )}, ${this.op_info[this.opParams[item][1]].toFixed(2)}]`;
                return prev;
            }, {});
        }
    },
    props: {
        data: {
            type: Array,
            default: _ => []
        }
    },
    data() {
        return {
            visible: false,
            mStates: [
                "portstate",
                "mstate",
                "mtype",
                "work_temprature",
                "work_voltage",
                "transmit_bias",
                "transmit_power"
            ],
            manuInfos: [
                "vendor_name",
                "vendor_oui",
                "vendor_rev",
                "vendor_pn",
                "vendor_sn",
                "date_code",
                "vendor_specific"
            ],
            staticInfos: [
                "module_type",
                "max_distance",
                "wave_length",
                "fiber_type",
                "identifier",
                "connector",
                "encoding",
                "cc_base"
            ],
            opParams: {
                temp_warn_threshold: ["temp_low_warning", "temp_high_warning"],
                temp_alarm_threshold: ["temp_low_alarm", "temp_high_alarm"],
                vol_warn_threshold: ["vol_low_warning", "vol_high_warning"],
                vol_alarm_threshold: ["vol_low_alarm", "vol_high_alarm"],
                tx_bias_warn_threshold: [
                    "bias_low_warning",
                    "bias_high_warning"
                ],
                tx_bias_alarm_threshold: ["bias_low_alarm", "bias_high_alarm"],
                tx_power_warn_threshold: [
                    "txpwr_low_warning",
                    "txpwr_high_warning"
                ],
                tx_power_alarm_threshold: [
                    "txpwr_low_alarm",
                    "txpwr_high_alarm"
                ],
                rx_power_warn_threshold: [
                    "rxpwr_low_warning",
                    "rxpwr_high_warning"
                ],
                rx_power_alarm_threshold: [
                    "rxpwr_low_alarm",
                    "rxpwr_high_alarm"
                ]
            },
            op_info: {
                // port_id: 1,
                // portstate: 1,
                // mstate: 1,
                // mtype: 0,
                // work_temprature: "21 C",
                // work_voltage: "3.29 V",
                // transmit_bias: "13 mA",
                // transmit_power: "1.8295 dBm",
                // vendor_name: "ODI",
                // vendor_oui: "unspecify",
                // vendor_rev: "1.0",
                // vendor_pn: "LTE4302M-BC+HW",
                // vendor_sn: "F9842018765",
                // date_code: "18-09-03",
                // vendor_specific: [0x01, 0x23, 0x56, 0x3a, 0x2f],
                // module_type: "EPON",
                // max_distance: 20,
                // wave_length: 1490,
                // fiber_type: "Single Mode",
                // identifier: "SFP or SFP Plus",
                // connector: "SC",
                // encoding: "8B10B",
                // temp_high_alarm: 123,
                // temp_low_alarm: 123,
                // temp_high_warning: 123,
                // temp_low_warning: 123,
                // vol_high_alarm: 123,
                // vol_low_alarm: 123,
                // vol_high_warning: 123,
                // vol_low_warning: 123,
                // bias_high_alarm: 123,
                // bias_low_alarm: 123,
                // bias_high_warning: 123,
                // bias_low_warning: 123,
                // txpwr_high_alarm: 123,
                // txpwr_low_alarm: 123,
                // txpwr_high_warning: 123,
                // txpwr_low_warning: 123,
                // rxpwr_high_alarm: 123,
                // rxpwr_low_alarm: 123,
                // rxpwr_high_warning: 123,
                // rxpwr_low_warning: 123
            }
        };
    },
    methods: {
        portName(portid) {
            return this.port_name.pon[portid]
                ? this.port_name.pon[portid].name
                : this.port_name.ge[portid]
                ? this.port_name.ge[portid].name
                : this.port_name.xge[portid].name;
        },
        showDetail(portid) {
            this.op_info = {};
            this.$http
                .get("/ponmgmt", {
                    params: { form: "optical_poninfo", port_id: portid }
                })
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.visible = true;
                            this.op_info = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        filterKeys(key) {
            let reg = /(_high_)|(_low_)/;
            return reg.test(key);
        },
        closeDialog() {
            this.op_info = {};
            this.visible = false;
        },
        layoutMtype(){
            const mtype_map = ['in_cali', 'ex_cali'], _this = this;
            return {
                mtype(val){
                    return _this.lanMap[mtype_map[val]]
                }
            }
        }
    }
};
</script>

<style lang="less" scoped>
table {
    width: calc(~"100% - 32px");
    margin: 20px 16px;
    border: 1px solid #ddd;
    th,
    td {
        text-align: center;
        border: 1px solid #ddd;
        padding: 6px 12px;
    }
    th{
        background: #2361a2;
        color: #fff;
    }
}
div.om-dialog-content {
    width: 900px;
    height: auto;
    padding: 0 20px 20px 20px;
    max-height: 700px;
    overflow-y: auto;
    .modal-header {
        border: none;
        margin: 0;
    }
    .layout-row {
        &::after {
            content: "";
            display: table;
            clear: both;
        }
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