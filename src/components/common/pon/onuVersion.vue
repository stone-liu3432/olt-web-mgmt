<template>
    <div>
        <div class="onu-version-title">
            <span>{{ lanMap["onu_version"] }}</span>
            <nms-button style="margin-left: 30px" @click="refreshData">
                {{ lanMap["refresh"] }}
            </nms-button>
        </div>
        <nms-table :rows="onuVers" border>
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
                :label="lanMap['onu_type']"
                prop="onu_type"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['dev_type']"
                prop="dev_type"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['upgrade_type']"
                prop="upgrade_type"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['vendor']"
                prop="vendor"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['sn_model']"
                prop="sn_model"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['software_ver']"
                prop="software_ver"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['onu_desc']"
                prop="onu_desc"
            ></nms-table-column>
        </nms-table>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { isArray, debounce } from "@/utils/common";
export default {
    name: "onuVersion",
    computed: {
        ...mapState(["lanMap"]),
    },
    props: {
        port_id: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            onuVers: [],
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.onuVers = [];
            const url =
                "/onumgmt?form=version-info&port_id=" +
                (this.port_id === 0x100 ? 0 : this.port_id);
            this.$http
                .get(url)
                .then((res) => {
                    if (res.data.code === 1) {
                        if (isArray(res.data.data)) {
                            this.onuVers = res.data.data;
                        }
                    }
                })
                .catch((err) => {});
        },
        refreshData() {
            debounce(this.getData, 1000, this);
        },
    },
    watch: {
        port_id() {
            this.getData();
        },
    },
};
</script>

<style lang="less" scoped>
.onu-version-title {
    margin: 0 0 20px 20px;
    span {
        color: @titleColor;
        font-size: 18px;
        font-weight: 500;
    }
}
</style>