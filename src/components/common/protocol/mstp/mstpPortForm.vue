<template>
    <div>
        <template v-if="type === 'bpdu'">
            <div class="mstp-port-form-item">
                <span>{{ lanMap['bpdu_guard_port'] }}</span>
                <select v-model.number="bpdu_guard_port">
                    <option :value="0">{{ lanMap['disable'] }}</option>
                    <option :value="1">{{ lanMap['enable'] }}</option>
                </select>
            </div>
        </template>
        <template v-if="type === 'p2p'">
            <div class="mstp-port-form-item">
                <span>{{ lanMap['admin_p2p'] }}</span>
                <select v-model.number="admin_p2p">
                    <option :value="0">Auto</option>
                    <option :value="1">True</option>
                    <option :value="2">False</option>
                </select>
            </div>
        </template>
        <template v-if="type === 'loop'">
            <div class="mstp-port-form-item">
                <span>{{ lanMap['loop_detect_guard'] }}</span>
                <select v-model.number="loop_detect_guard">
                    <option :value="0">{{ lanMap['disable'] }}</option>
                    <option :value="1">{{ lanMap['enable'] }}</option>
                </select>
            </div>
        </template>
        <template v-if="type === 'edge'">
            <div class="mstp-port-form-item">
                <span>{{ lanMap['admin_edge_port'] }}</span>
                <select v-model.number="admin_edge_port">
                    <option :value="0">Auto</option>
                    <option :value="1">True</option>
                    <option :value="2">False</option>
                </select>
            </div>
        </template>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "mstpPortForm",
    computed: {
        ...mapState(["lanMap"])
    },
    data() {
        return {
            bpdu_guard_port: 0, // 0, 1
            admin_p2p: 0, // 0,1,2
            loop_detect_guard: 0, // 0,1
            admin_edge_port: 0, // 0,1,2
            port_id: 0,
            type: "",
            cache: {},
            TYPES: {
                bpdu: "bpdu_guard_port",
                loop: "loop_detect_guard",
                edge: "admin_edge_port",
                p2p: "admin_p2p"
            }
        };
    },
    methods: {
        init(type, data) {
            const key = this.TYPES[type];
            this.type = type;
            this.port_id = data.port_id;
            this.cache = JSON.parse(JSON.stringify(data));
            if (data[key] !== undefined) {
                this[key] = data[key];
            }
            if (type === "edge") {
                this.admin_edge_port = data.auto_edge_port
                    ? 0
                    : data.admin_edge_port
                    ? 1
                    : 2;
            }
        },
        validate(fn) {
            if (typeof fn === "function") {
                const ACTIONS = {
                    bpdu() {
                        return {
                            port_id: this.port_id,
                            bpdu_guard_port: this.bpdu_guard_port,
                            set_bpdu_guard_port:
                                this.cache.bpdu_guard_port ===
                                this.bpdu_guard_port >>> 0
                                    ? 0
                                    : 1,
                            admin_p2p: 0,
                            set_admin_p2p: 0,
                            admin_external_cost: 0,
                            set_admin_external_cost: 0
                        };
                    },
                    loop() {
                        return {
                            port_id: this.port_id,
                            loop_detect_guard: this.loop_detect_guard
                        };
                    },
                    edge() {
                        return {
                            port_id: this.port_id,
                            admin_edge_port: this.admin_edge_port
                        };
                    },
                    p2p() {
                        return {
                            port_id: this.port_id,
                            bpdu_guard_port: 0,
                            set_bpdu_guard_port: 0,
                            admin_p2p: this.admin_p2p,
                            set_admin_p2p:
                                this.cache.admin_p2p === this.admin_p2p >>> 0
                                    ? 0
                                    : 1,
                            admin_external_cost: 0,
                            set_admin_external_cost: 0
                        };
                    }
                };
                if (typeof ACTIONS[this.type] === "function") {
                    fn.call(this, this.type, ACTIONS[this.type].call(this));
                }
            }
        }
    }
};
</script>

<style lang="less" scoped>
.mstp-port-form-item {
    > span:first-child {
        display: inline-block;
        vertical-align: middle;
        width: 150px;
        text-align: center;
    }
    select {
        width: 200px;
    }
}
</style>