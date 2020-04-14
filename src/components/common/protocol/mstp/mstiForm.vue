<template>
    <div>
        <template v-if="type === 'add' || type === 'delete'">
            <div class="msti-form-item">
                <span>{{ lanMap['vlan_list'] }}</span>
                <input type="text" v-model="vlan_list" :style="invalidStyle('vlan_list')" />
                <span>e.x. 1, 3-5</span>
            </div>
        </template>
        <template v-if="type === 'msti'">
            <div class="msti-form-item">
                <span>{{ lanMap['instance'] }}</span>
                <select v-model.number="mstid" style="width: 200px;">
                    <template v-for="i in 15">
                        <option :value="i">{{ i }}</option>
                    </template>
                </select>
            </div>
            <div class="msti-form-item">
                <span>{{ lanMap['vlan_list'] }}</span>
                <input type="text" v-model="vlan_list" :style="invalidStyle('vlan_list')" />
                <span>e.x. 1, 3-5</span>
            </div>
        </template>
        <template v-if="type === 'pri'">
            <div class="msti-form-item">
                <span>{{ lanMap['bridge_prio'] }}</span>
                <select v-model="bridge_prio" style="width: 200px;">
                    <option :value="0">0</option>
                    <template v-for="i in 15">
                        <option :value="i">{{ i * 4096 }}</option>
                    </template>
                </select>
                <span>default: 32768</span>
            </div>
        </template>
        <template v-if="type === 'port'">
            <div class="msti-form-item">
                <span>{{ lanMap['port_id'] }}</span>
                <span>{{ port.port_id | getPortName }}</span>
            </div>
            <div class="msti-form-item">
                <span>{{ lanMap['instance'] }} ID</span>
                <span>{{ mstid }}</span>
            </div>
            <div class="msti-form-item">
                <span>{{ lanMap['admin_internal_cost'] }}</span>
                <input
                    type="text"
                    v-model.number="port.admin_internal_cost"
                    :style="invalidStyle('admin_internal_cost')"
                />
                <span>Rnage: 0-200000000(0: Auto)</span>
            </div>
            <div class="msti-form-item">
                <span>{{ lanMap['port_priority'] }}</span>
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
    name: "mstiForm",
    computed: {
        ...mapState(["lanMap"]),
        validateVlan() {
            const val = this.vlan_list;
            return /^[\d,\-\s]+$/.test(val.replace(/(^\s*|\s*$)/g, ""));
        },
        validateBridgePri() {
            const val = this.bridge_prio >>> 0;
            return val >= 0 && val <= 15;
        },
        validateCost() {
            const val = this.port.admin_internal_cost >>> 0;
            return val >= 0 && val <= 200000000;
        }
    },
    data() {
        return {
            type: "",
            vlan_list: "",
            bridge_prio: 0, // 0-15
            port: {
                port_id: 5,
                admin_internal_cost: 0, // 0-200000000
                port_priority: 0 // 0-240
            },
            mstid: 1,
            cache: {}
        };
    },
    methods: {
        init(type, row, portInfo) {
            this.type = type;
            if (type === "msti") {
                this.mstid = 1;
                this.vlan_list = "";
                return;
            }
            this.mstid = row.mstid || 0;
            type === "add" && (this.vlan_list = row.msti_vlanlist);
            type === "delete" && (this.vlan_list = "");
            type === "pri" &&
                (this.bridge_prio = Math.floor(row.bridge_prio / 4096));
            if (type === "port") {
                this.cache = JSON.parse(JSON.stringify(portInfo));
                Object.keys(this.port).forEach(key => {
                    if (portInfo[key] !== undefined) {
                        this.port[key] = portInfo[key];
                        if (key === "port_priority") {
                            this.port[key] = portInfo[key] / 16 || 0;
                        }
                    }
                });
            }
        },
        invalidStyle(key) {
            const invalid = () => ({ "border-color": "red" });
            const FLAGS = {
                vlan_list() {
                    return this.validateVlan ? "" : invalid();
                },
                bridge_prio() {
                    return this.validateBridgePri ? "" : invalid();
                },
                admin_internal_cost() {
                    return this.validateCost ? "" : invalid();
                }
            };
            if (typeof FLAGS[key] === "function") {
                return FLAGS[key].call(this);
            }
            return "";
        },
        validate(fn) {
            if (typeof fn === "function") {
                if (this.type === "add" || this.type === "delete") {
                    const actions = {
                        add: 0,
                        delete: 1
                    };
                    this.validateVlan &&
                        fn.call(this, this.type, {
                            mstid: this.mstid,
                            map_action: actions[this.type],
                            vlan_list: this.vlan_list
                        });
                }
                if (this.type === "pri") {
                    this.validateBridgePri &&
                        fn.call(this, this.type, {
                            mstid: this.mstid,
                            bridge_prio: this.bridge_prio
                        });
                }
                if (this.type === "port") {
                    this.validateCost &&
                        fn.call(this, this.type, {
                            port_id: this.port.port_id,
                            mstid: this.mstid,
                            admin_internal_cost:
                                this.port.admin_internal_cost >>> 0,
                            set_admin_internal_cost:
                                this.cache.admin_internal_cost ===
                                this.port.admin_internal_cost >>> 0
                                    ? 0
                                    : 1,
                            port_priority: this.port.port_priority >>> 0,
                            set_port_priority:
                                this.cache.port_priority ===
                                this.port.port_priority >>> 0
                                    ? 0
                                    : 1
                        });
                }
                if (this.type === "msti") {
                    this.validateVlan &&
                        fn.call(this, this.type, {
                            mstid: this.mstid,
                            map_action: 0,
                            vlan_list: this.vlan_list
                        });
                }
            }
        }
    }
};
</script>

<style lang="less" scoped>
.msti-form-item {
    margin: 10px 0;
    > span:first-child {
        display: inline-block;
        vertical-align: middle;
        width: 120px;
        text-align: center;
        & + span {
            display: inline-block;
            vertical-align: bottom;
        }
    }
    select + span,
    input + span {
        margin-left: 6px;
        color: @tipsColor;
        font-size: @tipsFontSize;
    }
}
</style>