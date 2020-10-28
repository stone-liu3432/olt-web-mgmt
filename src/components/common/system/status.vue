<template>
    <div id="home">
        <div class="port-container">
            <div class="port-info">
                <h3>
                    <span>{{ lanMap["pon_info"] }}</span>
                    <span class="onu-count" style="margin-left: 100px"
                        >{{ lanMap["registered_onu"] }}:</span
                    >
                    <span>{{ online + offline }}</span>
                    <span class="onu-count">{{ lanMap["online"] }}:</span>
                    <span>{{ online }}</span>
                    <span class="onu-count onu-offline"
                        >{{ lanMap["offline"] }}:</span
                    >
                    <span>{{ offline }}</span>
                </h3>
                <div v-if="ponInfo.data && ponInfo.data.length">
                    <port
                        v-for="(item, index) in ponInfo.data"
                        :key="index"
                        :port-info="item"
                        port-type="pon"
                        v-if="ponInfo.data && ponInfo.data.length"
                    ></port>
                </div>
            </div>
            <div class="port-info">
                <h3>{{ lanMap["ge_port_info"] }}</h3>
                <div>
                    <port
                        v-for="(item, index) in port_name.ge"
                        :key="index"
                        :port-info="item"
                        port-type="ge"
                        v-if="port_name && port_name.ge"
                    ></port>
                    <port
                        v-for="(item, index) in port_name.xge"
                        :key="index"
                        :port-info="item"
                        port-type="xge"
                        v-if="port_name && port_name.xge"
                    ></port>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import port from "./port.vue";
export default {
    name: "status",
    components: { port },
    data() {
        return {
            ponInfo: [],
            interval: null,
        };
    },
    computed: {
        ...mapState(["port_name", "lanMap", "change_url", "system"]),
        online() {
            if (!Array.isArray(this.ponInfo.data)) {
                return 0;
            }
            return this.ponInfo.data.reduce(
                (pre, item) => pre + item.online,
                0
            );
        },
        offline() {
            if (!Array.isArray(this.ponInfo.data)) {
                return 0;
            }
            return this.ponInfo.data.reduce(
                (pre, item) => pre + item.offline,
                0
            );
        },
    },
    created() {
        this.getPon();
        if (!this.port_name.ge) {
            this.getGe();
        }
    },
    methods: {
        ...mapMutations({
            portInfo: "updatePortData",
            portName: "updatePortName",
        }),
        getPon() {
            this.$http
                .get(this.change_url.pon)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.ponInfo = res.data;
                    }
                })
                .catch((err) => {
                    // to do
                });
        },
        getGe() {
            this.$http
                .get(this.change_url.port)
                .then((res) => {
                    this.portInfo(res.data);
                    var pon = this.system.data.ponports;
                    var ge = this.system.data.geports;
                    var xge = this.system.data.xgeports;
                    var pon_count, ge_count, xge_count, portName;
                    pon_count = res.data.data.slice(0, pon);
                    if (!xge) {
                        ge_count = res.data.data.slice(pon);
                        portName = {
                            pon: this.get_portName(pon_count, "PON"),
                            ge: this.get_portName(ge_count, "GE"),
                        };
                    } else {
                        ge_count = res.data.data.slice(pon, pon + ge);
                        xge_count = res.data.data.slice(pon + ge);
                        portName = {
                            pon: this.get_portName(pon_count, "PON"),
                            ge: this.get_portName(ge_count, "GE"),
                            xge: this.get_portName(xge_count, "XGE"),
                        };
                    }
                    this.portName(portName);
                })
                .catch((err) => {
                    // to do
                });
        },
        //根据port_id 分配端口名
        get_portName(arr, prefix) {
            var obj = {};
            for (var i = 0; i < arr.length; i++) {
                obj[arr[i].port_id] = {};
                obj[arr[i].port_id].name =
                    (i < 10 ? prefix + "0" + (i + 1) : prefix + (i + 1)) +
                    (arr[i].link_aggregation
                        ? "(LAG" + arr[i].link_aggregation + ")"
                        : "");
                obj[arr[i].port_id].id = arr[i].port_id;
                obj[arr[i].port_id].lag = arr[i].link_aggregation || 0;
                obj[arr[i].port_id].data = arr[i];
            }
            return obj;
        },
    },
    mounted() {
        this.interval = setInterval(() => {
            this.getPon();
            this.getGe();
        }, 5000);
    },
    beforeDestroy() {
        if (this.interval) clearInterval(this.interval);
    },
};
</script>

<style lang="less" scoped>
#home {
    height: calc(~"100% - 100px");
    overflow-y: auto;
    &::before {
        content: "";
        display: table;
    }
    > div.port-container {
        width: 1280px;
        margin: 0 auto;
    }
}
div.port-info {
    h3 {
        font-size: 20px;
        margin: 16px 0 16px 20px;
        font-weight: 500;
        color: #29bdfa;
        line-height: 24px;
        > span {
            display: inline-block;
            vertical-align: middle;
        }
    }
    > div {
        padding: 0 0 0 20px;
        overflow: hidden;
    }
    &:after {
        content: "";
        display: table;
        clear: both;
    }
    .port {
        cursor: pointer;
    }
}
span.onu-count,
span.onu-count + span {
    margin-left: 20px;
    font-size: 16px;
    color: #1478de;
}
span.onu-count + span {
    margin-left: 6px;
    color: #1478de;
}
span.onu-offline,
span.onu-offline + span {
    color: #f56c6c;
}
</style>
