<template>
    <div class="port-checkbox">
        <template v-if="type === 'pon' || type === 'port'">
            <template v-for="item in port_name.pon || {}">
                <label class="pon-item">
                    <input
                        type="checkbox"
                        v-model="ports"
                        :value="item.id"
                        :disabled="disabledItem(item.id)"
                    />
                    <span>{{ item.name }}</span>
                </label>
            </template>
        </template>
        <template v-if="type === 'uplink' || type === 'port'">
            <template v-for="item in port_name.ge || {}">
                <label class="uplink-item">
                    <input
                        type="checkbox"
                        v-model="ports"
                        :value="item.id"
                        :disabled="disabledItem(item.id)"
                    />
                    <span>{{ item.name }}</span>
                </label>
            </template>
            <template v-for="item in port_name.xge || {}">
                <label class="uplink-item">
                    <input
                        type="checkbox"
                        v-model="ports"
                        :value="item.id"
                        :disabled="disabledItem(item.id)"
                    />
                    <span>{{ item.name }}</span>
                </label>
            </template>
        </template>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { isFunction, removeItem, isDef, isArray } from "@/utils/common";
export default {
    name: "portCheckbox",
    computed: {
        ...mapState(["port_name", "port_info"]),
        // lag 组里的端口
        lagMap() {
            const res = this.port_info.data.reduce((pre, item) => {
                if (item.link_aggregation) {
                    if (!pre[item.link_aggregation]) {
                        pre[item.link_aggregation] = [];
                    }
                    pre[item.link_aggregation].push(item.port_id);
                }
                return pre;
            }, {});
            return res;
        },
        // 端口的 lag组
        portLagMap() {
            const res = this.port_info.data.reduce((pre, item) => {
                if (item.link_aggregation) {
                    pre[item.port_id] = item.link_aggregation;
                }
                return pre;
            }, {});
            return res;
        },
    },
    model: {
        prop: "checkeds",
        event: "change",
    },
    props: {
        type: {
            type: String,
            default: "port",
            validator: (val) => ["pon", "uplink", "port"].includes(val),
        },
        checkeds: {
            type: Array,
            default: () => [],
        },
        disabled: {
            type: Function,
        },
    },
    data() {
        return {
            ports: [],
        };
    },
    created() {
        this.ports = this.checkeds;
    },
    methods: {
        disabledItem(port_id) {
            return isFunction(this.disabled) ? !!this.disabled(port_id) : false;
        },
    },
    watch: {
        checkeds() {
            if (this.ports !== this.checkeds) {
                this.ports = this.checkeds;
            }
        },
        ports(nv, ov) {
            const diff = nv.reduce(
                (pre, item) => {
                    if (!ov.includes(item)) {
                        pre.push(item);
                    }
                    return pre;
                },
                ov.reduce((pre, item) => {
                    if (!nv.includes(item)) {
                        pre.push(item);
                    }
                    return pre;
                }, [])
            );
            if (!diff.length) {
                return;
            }
            diff.forEach((item) => {
                if (this.portLagMap[item]) {
                    const lags = this.lagMap[this.portLagMap[item]];
                    if (isArray(lags)) {
                        lags.forEach((val) => {
                            if (nv.length > ov.length) {
                                if (val !== item) {
                                    !this.ports.includes(val) &&
                                        this.ports.push(val);
                                }
                            } else {
                                removeItem(this.ports, val);
                            }
                        });
                    }
                }
            });
            this.ports.sort((a, b) => a - b);
            this.$emit("change", this.ports);
        },
    },
};
</script>

<style lang="less" scoped>
.port-checkbox {
    width: auto;
    > label {
        margin: 4px 0;
        user-select: none;
    }
}
.pon-item {
    display: inline-block;
    width: 12%;
    vertical-align: middle;
}
.uplink-item {
    display: inline-block;
    width: 24%;
    vertical-align: middle;
}
</style>