<template>
    <div class="pon-optical">
        <div class="pon-optical-title">
            <h2>{{ lanMap["pon_optical"] }}</h2>
            <div v-if="show_index !== 'optical_module'">
                <span>{{ lanMap["port_id"] }}</span>
                <select v-model.number="portid">
                    <option
                        v-for="(item, key) in port_name.pon"
                        :key="key"
                        :value="item.id"
                    >
                        {{ item.name }}
                    </option>
                </select>
            </div>
            <div
                v-if="
                    is_show_onu && onu_list.data && show_index === 'pon_optical'
                "
            >
                <span>{{ lanMap["onu_id"] }}</span>
                <select v-model.number="onuid">
                    <option
                        v-for="(item, index) in onu_list.data"
                        :key="index"
                        :value="item"
                    >
                        {{ "ONU" + portid + "/" + item }}
                    </option>
                </select>
            </div>
            <div v-if="is_show_onu && !onu_list.data" class="error-msg">
                {{ lanMap["no_onu_info"] }}
            </div>
            <div v-if="!is_show_onu">
                <a href="javascript:void(0);" @click="get_all_optical">{{
                    lanMap["refresh"]
                }}</a>
            </div>
        </div>
        <hr />
        <!--  v-if="onu_list.data && onu_list.data.length > 0" -->
        <tabBar
            :tab="['optical_module', 'pon_optical', 'onu_optical_diagnose']"
            @togglePage="select_page"
        ></tabBar>

        <div v-if="show_index === 'optical_module'">
            <optical-module :data="optical_module_info.data"></optical-module>
        </div>
        <!-- RSSI -->
        <div
            class="pon-optical-info"
            v-if="
                show_index === 'pon_optical' &&
                pon_optical.data &&
                onu_list.data &&
                onu_list.data.length > 0
            "
        >
            <div>{{ lanMap["pon_optical_tips"] }}</div>
            <div>
                <span>{{ lanMap["polarity"] }}:</span>
                <select v-model.number="polarity">
                    <option :value="0">{{ lanMap["high_polarity"] }}</option>
                    <option :value="1">{{ lanMap["low_polarity"] }}</option>
                </select>
                <nms-button @click="refreshData" style="margin-left: 30px">
                    {{ lanMap["refresh"] }}
                </nms-button>
            </div>
        </div>
        <ul
            class="rssi"
            v-if="
                show_index === 'pon_optical' &&
                pon_optical.data &&
                onu_list.data &&
                onu_list.data.length > 0
            "
        >
            <li v-for="(item, key) in pon_optical.data" :key="key">
                <span>{{ lanMap[key] }}</span>
                <span>{{ item }}</span>
            </li>
        </ul>
        <!-- 所有ONU的光模块诊断信息 -->
        <template v-if="show_index === 'onu_optical_diagnose'">
            <p>{{ lanMap["onu_optical_tips"] }}</p>
            <nms-table :rows="all_onu_optical" border>
                <nms-table-column :label="lanMap['onu_id']">
                    <template slot-scope="row">
                        {{ `${row.port_id} / ${row.onu_id}` }}
                    </template>
                </nms-table-column>
                <nms-table-column
                    :label="lanMap['onu_name']"
                    prop="onu_name"
                ></nms-table-column>
                <nms-table-column
                    :label="lanMap['macaddr']"
                    prop="macaddr"
                ></nms-table-column>
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
            </nms-table>
        </template>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { isArray, debounce } from "@/utils/common";
import opticalModule from "./opticalModule";
export default {
    name: "ponOptical",
    computed: {
        ...mapState(["lanMap", "port_name", "change_url", "onu_list"]),
    },
    components: { opticalModule },
    data() {
        return {
            portid: 0,
            onuid: 0,
            // onu_list: {
            //     data: [1, 2, 3],
            // },
            polarity: 0,
            pon_optical: {
                // code: 1,
                // message: "success",
                // data: {
                //     work_temprature: "21 C",
                //     work_voltage: "3.29 V",
                //     transmit_bias: "13 mA",
                //     transmit_power: "1.8295 dBm",
                //     receive_power: "-3.3003 dBm",
                // },
            },
            all_onu_optical: [
                // {
                //     port_id: 1,
                //     onu_id: 1,
                //     onu_name:
                //         "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                //     macaddr: "00:00:00:00:00:00",
                //     work_temprature: "21 C",
                //     work_voltage: "3.29 V",
                //     transmit_bias: "13 mA",
                //     transmit_power: "1.8295 dBm",
                //     receive_power: "-3.3003 dBm",
                // },
            ],
            optical_module_info: {
                // "code": 1,
                // "message":"success",
                // "data":[{
                //     "port_id":1,
                //     "portstate":1,
                //     "mstate":1,
                //     "work_temprature":"21 C",
                //     "work_voltage":"3.29 V",
                //     "transmit_bias":"13 mA",
                //     "transmit_power":"1.8295 dBm"
                // }]
            },
            show_index: "optical_module",
            is_show_onu: false,
        };
    },
    created() {
        var pid = Number(sessionStorage.getItem("pid"));
        this.portid = pid || 1;
        this.get_optical_info();
    },
    methods: {
        ...mapMutations({
            addonu_list: "updateOnuList",
        }),
        //  RSSI
        getData() {
            this.$http
                .get("/ponmgmt?form=optical_pon", {
                    params: {
                        polarity: this.polarity,
                        port_id: this.portid,
                        onu_id: this.onuid,
                    },
                })
                .then((res) => {
                    if (res.data.code === 1) {
                        this.pon_optical = res.data;
                    } else {
                        this.pon_optical = {};
                    }
                })
                .catch((err) => {});
        },
        //  获取所有ONU的光模块诊断信息
        get_all_optical() {
            this.all_onu_optical = [];
            const loading = this.$loading();
            this.$http
                .get("/ponmgmt?form=optical_onu", {
                    params: { port_id: this.portid },
                })
                .then((res) => {
                    if (res.data.code === 1) {
                        if (isArray(res.data.data)) {
                            this.all_onu_optical = res.data.data;
                        }
                    }
                })
                .catch((err) => {
                    this.$message.warning(this.lanMap["get_data_fail"]);
                })
                .finally(() => {
                    loading && loading.close();
                });
        },
        //  分页切换
        select_page(page) {
            this.show_index = page;
            this.is_show_onu = true;
            if (page === "onu_optical_diagnose") {
                this.is_show_onu = false;
            } else if (page === "pon_optical") {
                this.get_resource();
            } else if (page === "optical_module") {
                this.is_show_onu = false;
                this.get_optical_info();
            }
        },
        //  手动刷新
        refreshData() {
            debounce(this.getData, 1000, this);
        },
        //  解析后台返回的字符串
        analysis(str) {
            if (!str) return "";
            var result = [];
            var arr = str.split(",");
            for (var i = 0, len = arr.length; i < len; i++) {
                var substrs = arr[i];
                if (substrs.indexOf("-") !== -1) {
                    var subArr = substrs.split("-");
                    var min = Number(subArr[0]),
                        max = Number(subArr[subArr.length - 1]);
                    if (isNaN(min) || isNaN(max)) throw new TypeError();
                    result.push(min);
                    for (var j = 1; j < max - min; j++) {
                        result.push(min + j);
                    }
                    result.push(max);
                } else {
                    if (isNaN(Number(substrs))) throw new TypeError();
                    result.push(Number(substrs));
                }
            }
            return result.filter((item) => !!item);
        },
        //  获取PON口下的ONU列表
        get_resource() {
            this.$http
                .get("/onu_allow_list?form=resource&port_id=" + this.portid)
                .then((res) => {
                    if (res.data.code === 1) {
                        var _onu_list = this.analysis(res.data.data.resource);
                        if (!_onu_list) {
                            this.addonu_list({});
                            this.pon_optical = {};
                            this.onuid = 0;
                            return;
                        }
                        var obj = {
                            port_id: this.portid,
                            data: _onu_list,
                        };
                        this.addonu_list(obj);
                        var oid = Number(sessionStorage.getItem("oid"));
                        this.onuid = oid;
                        if (!oid || _onu_list.indexOf(Number(oid)) === -1) {
                            this.onuid = _onu_list[0];
                            return;
                        }
                        if (this.show_index === "pon_optical") {
                            this.getData();
                        }
                    } else {
                        this.addonu_list({});
                        this.pon_optical = {};
                        this.onuid = 0;
                    }
                })
                .catch((err) => {});
        },
        get_optical_info() {
            this.optical_module_info = {};
            this.$http
                .get("/ponmgmt?form=optical_poninfo")
                .then((res) => {
                    if (res.data.code === 1) {
                        this.optical_module_info = res.data;
                    }
                })
                .catch((err) => {});
        },
    },
    watch: {
        portid() {
            if (!this.portid) return;
            sessionStorage.setItem("pid", Number(this.portid));
            if (this.show_index === "pon_optical") {
                this.get_resource();
            } else if (this.show_index === "onu_optical_diagnose") {
                this.get_all_optical();
            }
        },
        onuid() {
            if (!this.onuid) return;
            sessionStorage.setItem("oid", Number(this.onuid));
            this.getData();
        },
    },
};
</script>

<style lang="less" scoped>
div.pon-optical-title {
    margin: 20px 0;
    h2 {
        float: left;
        width: 300px;
        font-size: 24px;
        color: #67aef6;
        font-weight: 600;
    }
    div {
        float: left;
        width: 240px;
    }
    &:after {
        content: "";
        display: table;
        clear: both;
    }
    select {
        margin-left: 6px;
        width: 120px;
    }
}
hr + div {
    margin: 0 0 0 10px;
}
ul {
    margin: 0 0 0 10px;
}
ul.rssi {
    li {
        height: 30px;
        line-height: 30px;
        font-size: 0;
        &:last-child {
            span {
                border-bottom: 1px solid #ccc;
            }
        }
    }
    span {
        display: inline-block;
        border: 1px solid #ccc;
        width: 150px;
        font-size: 16px;
        border-bottom: none;
        padding: 0 0 0 6px;
    }
}
p {
    height: 30px;
    line-height: 30px;
    margin: 0 0 20px 10px;
}
ul.onu-optical {
    li {
        height: 30px;
        line-height: 30px;
        font-size: 0;
        &:last-child {
            span {
                border-bottom: 1px solid #ccc;
            }
        }
    }
    .bg-title > span {
        background: #67aef6;
    }
    span {
        display: inline-block;
        box-sizing: border-box;
        padding: 0 6px;
        width: 16%;
        font-size: 16.9px;
        height: 30px;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
        border: 1px solid #ccc;
        border-bottom: none;
        border-right: none;
        &:last-child {
            border-right: 1px solid #ccc;
        }
    }
}
div.error-msg {
    margin-left: 30px;
    height: 30px;
    line-height: 30px;
    color: red;
}
div.error-tips {
    color: red;
    margin: 20px;
    height: 30px;
    line-height: 30px;
}
.pon-optical-info {
    margin-left: 10px;
    > div {
        margin: 20px 0;
        select {
            width: 200px;
        }
    }
}
</style>
