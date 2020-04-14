<template>
    <div>
        <template v-if="type === 'info'">
            <template v-for="(item, key) in info">
                <div class="cist-form-item">
                    <span>{{ lanMap[key] }}:</span>
                    <input type="text" v-model.number="info[key]" :style="validateStyle(key)" />
                    <span>{{ bridgeTips[key] }}</span>
                </div>
            </template>
        </template>
        <template v-if="type === 'port'">
            <div class="cist-form-item msti-form-port">
                <span>{{ lanMap['port_id'] }}:</span>
                <span>{{ port.port_id | getPortName }}</span>
            </div>
            <div class="cist-form-item msti-form-port">
                <span>{{ lanMap['cist'] }}:</span>
                <span>{{ port.mstid }}</span>
            </div>
            <div class="cist-form-item msti-form-port">
                <span>{{ lanMap['config'] }}</span>
                <select v-model.number="configFlag" style="width:200px;">
                    <option :value="0">{{ lanMap['admin_external_cost'] }}</option>
                    <option :value="1">{{ lanMap['port_priority'] }}</option>
                </select>
            </div>
            <div class="cist-form-item msti-form-port" v-if="configFlag === 0">
                <span>{{ lanMap['admin_external_cost'] }}:</span>
                <input
                    type="text"
                    v-model.number="port.admin_external_cost"
                    :style="validateStyle('admin_external_cost')"
                />
                <span>Range: 0-200000000(0: Auto)</span>
            </div>
            <div class="cist-form-item msti-form-port" v-if="configFlag === 1">
                <span>{{ lanMap['port_priority'] }}:</span>
                <select v-model.number="port.port_priority" style="width: 200px;">
                    <option :value="0">0</option>
                    <template v-for="i in 15">
                        <option :value="i">{{ i * 16 }}</option>
                    </template>
                </select>
            </div>
        </template>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "cistForm",
    computed: {
        ...mapState(["lanMap"]),
        validateAge() {
            const val = this.info.bridge_max_age;
            return val >= 6 && val <= 40;
        },
        validateTime() {
            const val = this.info.bridge_hello_time;
            return (val >= 1 && val <= 10) || val === 20;
        },
        validateHops() {
            const val = this.info.max_hops;
            return val >= 1 && val <= 40;
        },
        validateDelay() {
            const val = this.info.bridge_forward_delay;
            return val >= 4 && val <= 30;
        },
        validateCost() {
            const val = this.port.admin_external_cost;
            return val >= 0 && val <= 200000000;
        }
    },
    data() {
        return {
            cache: {},
            type: "",
            configFlag: 0,
            bridgeTips: {
                bridge_max_age: "Range: 6-40",
                bridge_hello_time: "Range: 1-10, 20",
                max_hops: "Range: 1-40",
                bridge_forward_delay: "Range: 4-30"
            },
            info: {
                bridge_max_age: "",
                bridge_hello_time: "",
                max_hops: "",
                bridge_forward_delay: ""
            },
            port: {
                port_id: 0,
                mstid: 0,
                admin_external_cost: "",
                port_priority: ""
            }
        };
    },
    methods: {
        init(type, data) {
            this.type = type;
            this.cache = JSON.parse(JSON.stringify(data));
            this.configFlag = 0;
            Object.keys(this[type]).forEach(key => {
                if (data[key] !== undefined) {
                    this[type][key] = data[key];
                }
            });
        },
        validateStyle(key) {
            const FLAGS = {
                bridge_max_age() {
                    return this.validateAge;
                },
                bridge_hello_time() {
                    return this.validateTime;
                },
                max_hops() {
                    return this.validateHops;
                },
                bridge_forward_delay() {
                    return this.validateDelay;
                },
                admin_external_cost() {
                    return this.validateCost;
                }
            };
            if (typeof FLAGS[key] === "function") {
                return FLAGS[key].call(this)
                    ? ""
                    : {
                          "border-color": "red"
                      };
            }
            return "";
        },
        validate(fn) {
            if (typeof fn === "function") {
                if (this.type === "info") {
                    if (
                        this.validateAge &&
                        this.validateTime &&
                        this.validateHops &&
                        this.validateDelay
                    ) {
                        const data = {
                            bridge_max_age: this.info.bridge_max_age >>> 0,
                            set_bridge_max_age:
                                this.cache.bridge_max_age ===
                                this.info.bridge_max_age >>> 0
                                    ? 0
                                    : 1,
                            bridge_hello_time:
                                this.info.bridge_hello_time >>> 0,
                            set_bridge_hello_time:
                                this.cache.bridge_hello_time ===
                                this.info.bridge_hello_time >>> 0
                                    ? 0
                                    : 1,
                            max_hops: this.info.max_hops >>> 0,
                            set_max_hops:
                                this.cache.max_hops === this.info.max_hops >>> 0
                                    ? 0
                                    : 1,
                            bridge_forward_delay:
                                this.info.bridge_forward_delay >>> 0,
                            set_bridge_forward_delay:
                                this.cache.bridge_forward_delay ===
                                this.info.bridge_forward_delay >>> 0
                                    ? 0
                                    : 1
                        };
                        fn.call(this, this.type, data);
                    }
                } else if (this.type === "port") {
                    if (this.configFlag === 1) {
                        const data = {
                            port_id: this.port.port_id,
                            mstid: 0,
                            admin_internal_cost: 0,
                            set_admin_internal_cost: 0,
                            port_priority: this.port.port_priority >>> 0,
                            set_port_priority:
                                this.cache.port_priority ===
                                this.port.port_priority >>> 0
                                    ? 0
                                    : 1
                        };
                        fn.call(this, this.type, data);
                    } else if (this.configFlag === 0 && this.validateCost) {
                        const data = {
                            port_id: this.port.port_id,
                            bpdu_guard_port: 0,
                            set_bpdu_guard_port: 0,
                            admin_p2p: 0,
                            set_admin_p2p: 0,
                            admin_external_cost:
                                this.port.admin_external_cost >>> 0,
                            set_admin_external_cost:
                                this.cache.admin_external_cost ===
                                this.port.admin_external_cost >>> 0
                                    ? 0
                                    : 1
                        };
                        fn.call(this, this.type, data);
                    }
                }
            }
        }
    }
};
</script>

<style lang="less" scoped>
.cist-form-item {
    margin: 10px 0;
    &.msti-form-port {
        > span:first-child {
            width: 120px;
        }
    }
    > span:first-child {
        display: inline-block;
        vertical-align: middle;
        width: 160px;
        text-align: center;
    }
    input + span {
        margin-left: 6px;
        color: @tipsColor;
        font-size: @tipsFontSize;
    }
}
</style>