<template>
    <div>
        <page-header type="pon" @change="portChange">
            <template slot="title">{{ lanMap["onu_upgrade_status"] }}</template>
            <template slot="action">
                <nms-button @click="refreshData">
                    {{ lanMap["refresh"] }}
                </nms-button>
            </template>
        </page-header>
        <nms-table :rows="onuStatusList" border>
            <nms-table-column :label="lanMap['onu_id']">
                <template slot-scope="row">
                    {{ `${row.port_id} / ${row.onu_id}` }}
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['onu_name']" prop="onu_name">
            </nms-table-column>
            <nms-table-column :label="lanMap['macaddr']" prop="macaddr">
            </nms-table-column>
            <nms-table-column :label="lanMap['status']" prop="status">
            </nms-table-column>
            <nms-table-column
                :label="lanMap['upgrade_progress']"
                :cellStyle="{ 'min-width': '270px' }"
            >
                <template slot-scope="row">
                    <div class="upgrade-progress">
                        <div class="progress">
                            <div
                                :style="{
                                    width:
                                        Math.floor(
                                            (row.sendlen / row.totallen) * 100
                                        ) + 'px',
                                }"
                            ></div>
                        </div>
                        <span>{{ `${row.sendlen} / ${row.totallen}` }}</span>
                    </div>
                </template>
            </nms-table-column>
            <nms-table-column
                :label="lanMap['upgrade_type']"
                prop="upgrade_type"
            >
            </nms-table-column>
        </nms-table>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { isArray, debounce } from "@/utils/common";
export default {
    name: "onuUpgradeStatus",
    computed: {
        ...mapState(["lanMap"]),
    },
    data() {
        return {
            port_id: 0,
            onuStatusList: [],
            timeout: null,
        };
    },
    created() {},
    methods: {
        portChange(port_id) {
            this.port_id = port_id;
            this.getData(port_id);
        },
        getData(port_id) {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.onuStatusList = [];
            this.$http
                .get(`/onumgmt?form=upgrade_status&port_id=${port_id}`)
                .then((res) => {
                    if (res.data.code === 1) {
                        if (isArray(res.data.data)) {
                            this.onuStatusList = res.data.data;
                        }
                    }
                })
                .catch((err) => {});
            this.timeout = setTimeout(this.getData, 15000, this.port_id);
        },
        refreshData() {
            debounce(this.getData, 1000, this, this.port_id);
        },
    },
    beforeDestroy() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    },
};
</script>

<style lang="less" scoped>
.upgrade-progress {
    line-height: 24px;
    text-align: left;
}
.progress {
    display: inline-block;
    width: 100px;
    height: 10px;
    position: relative;
    background: @borderColor;
    border-radius: 5px;
    overflow: hidden;
    & > div {
        border-radius: 5px;
        height: 10px;
        position: absolute;
        left: 0;
        top: 0;
        background: @titleColor;
    }
    & + span {
        margin-left: 12px;
    }
}
</style>