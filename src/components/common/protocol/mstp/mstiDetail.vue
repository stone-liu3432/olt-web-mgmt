<template>
    <div>
        <h3>
            <span>{{ lanMap['msti'] + lanMap['info'] }}</span>
            <nms-button
                size="mini"
                style="margin-left: 30px;"
                @click="setMstiInfo('add')"
            >{{ lanMap['add'] + lanMap['vlan_list'] }}</nms-button>
            <nms-button
                size="mini"
                style="margin-left: 30px;"
                @click="setMstiInfo('delete')"
            >{{ lanMap['delete'] + lanMap['vlan_list'] }}</nms-button>
            <nms-button
                size="mini"
                style="margin-left: 30px;"
                @click="setMstiInfo('pri')"
            >{{ lanMap['config'] + lanMap['priority'] }}</nms-button>
        </h3>
        <div class="msti-base-info">
            <template v-for="item in infoEnum">
                <div class="msti-info-row">
                    <template v-for="key in item">
                        <div
                            class="msti-info-item"
                            :style="{ 'width': item.length === 1 ? '100%' : '' }"
                        >
                            <span>{{ key === 'mstid' ? lanMap['instance'] : lanMap[key] }}:</span>
                            <span>{{ getPortName(key) }}</span>
                        </div>
                    </template>
                </div>
            </template>
        </div>
        <h3>{{ lanMap['port_list'] }}</h3>
        <nms-table :rows="info.msti_port || []" border>
            <nms-table-column :label="lanMap['port_id']">
                <template slot-scope="row">{{ row.port_id | getPortName }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['port_role']">
                <template slot-scope="row">{{ PORT_ROLE_MAP[row.port_role] || '' }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['port_priority']" prop="port_priority"></nms-table-column>
            <nms-table-column :label="lanMap['port_state']">
                <template slot-scope="row">{{ PORT_STATE_MAP[row.port_state] || '' }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['admin_internal_cost']" prop="admin_internal_cost">
                <template slot-scope="row">{{ row.admin_internal_cost ? 'Manual' : 'Auto' }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['internal_cost']" prop="internal_cost"></nms-table-column>
            <nms-table-column :label="lanMap['config']">
                <template slot-scope="row">
                    <nms-button type="text" @click="configPort(row)">{{ lanMap['config'] }}</nms-button>
                </template>
            </nms-table-column>
        </nms-table>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { getPortName } from "@/utils/common";
export default {
    name: "mstiDetail",
    computed: {
        ...mapState(["lanMap"])
    },
    data() {
        return {
            PORT_ROLE_MAP: [
                "Disable",
                "Root",
                "Designated",
                "Alternate",
                "Backup",
                "Master"
            ],
            PORT_STATE_MAP: [
                "Discarding",
                "Discarding",
                "Learning",
                "Forwarding",
                "Discarding"
            ],
            info: {},
            infoEnum: [
                ["mstid"],
                ["msti_vlanlist"],
                ["bridge_prio", "bridge_addr"],
                ["designate_prio", "designate_addr"],
                ["root_port_name"],
                ["internal_path_cost"]
            ]
        };
    },
    methods: {
        init(row) {
            this.info = row;
        },
        configPort(row) {
            this.$emit("config-port", this.info, row);
        },
        setMstiInfo(type) {
            this.$emit("set-msti-info", type, this.info);
        },
        getPortName(key) {
            return key === "root_port_name"
                ? getPortName(this.info[key]) || "None"
                : this.info[key];
        }
    }
};
</script>

<style lang="less" scoped>
.msti-base-info {
    > .msti-info-row {
        margin: 12px 0;
        > .msti-info-item {
            float: left;
            width: 350px;
            > span {
                display: inline-block;
                vertical-align: middle;
                width: 160px;
                padding-right: 12px;
                text-align: right;
            }
            > span + span {
                text-align: left;
                max-width: 580px;
                word-wrap: break-word;
                word-break: break-all;
            }
        }
        &:after {
            content: "";
            display: table;
            clear: both;
        }
    }
}
h3 {
    font-size: 18px;
    font-weight: 500;
    color: @titleColor;
}
</style>