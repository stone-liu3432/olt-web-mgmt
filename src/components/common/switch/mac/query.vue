<template>
    <div class="query">
        <span>{{ lanMap["query_method"] }}</span>
        <select v-model.number="flag" key="flag">
            <option :value="1">{{ lanMap["mac_type"] }}</option>
            <option :value="2">{{ lanMap["port_id"] }}</option>
            <option :value="4">{{ lanMap["vlan_id"] }}</option>
            <option :value="8">{{ lanMap["macaddr"] }}</option>
        </select>
        <template v-if="flag === 1">
            <select v-model.number="form.mac_type" key="mac-type">
                <template v-for="(item, index) in MAC_TYPES_MAP">
                    <option :value="index">{{ lanMap[item] }}</option>
                </template>
            </select>
        </template>
        <template v-if="flag === 2">
            <select v-model.number="form.port_id" key="port-id">
                <template v-for="item in port_name.pon">
                    <option :value="item.id">{{ item.name }}</option>
                </template>
                <template v-for="item in port_name.ge">
                    <option :value="item.id">{{ item.name }}</option>
                </template>
                <template v-for="item in port_name.xge || {}">
                    <option :value="item.id">{{ item.name }}</option>
                </template>
            </select>
        </template>
        <template v-if="flag === 4">
            <input type="text" v-model="form.vlan_id" key="vlan-id" />
        </template>
        <template v-if="flag === 8">
            <input type="text" v-model="form.macaddr" key="macaddr" />
        </template>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "macQuery",
    computed: {
        ...mapState(["lanMap", "port_name"]),
    },
    props: {
        data: {
            type: Array,
        },
    },
    data() {
        return {
            macTable: [],
            MAC_TYPES_MAP: ["dynamic", "static", "blackhole", "all"],
            flag: 1,
            form: {
                mac_type: 3,
                port_id: 1,
                vlan_id: "",
                macaddr: "",
            },
        };
    },
    methods: {
        resetFields() {
            this.form = {
                mac_type: 3,
                port_id: 1,
                vlan_id: "",
                macaddr: "",
            };
        },
        computedData() {
            switch (this.flag) {
                case 1:
                    this.$emit(
                        "data-change",
                        this.macTable.filter((item) =>
                            this.form.mac_type === 3
                                ? true
                                : item.mac_type === this.form.mac_type
                        )
                    );
                    break;
                case 2:
                    this.$emit(
                        "data-change",
                        this.macTable.filter(
                            (item) => item.port_id === this.form.port_id
                        )
                    );
                    break;
                case 4:
                    this.$emit(
                        "data-change",
                        this.macTable.filter(
                            (item) =>
                                String(item.vlan_id).indexOf(
                                    this.form.vlan_id
                                ) > -1
                        )
                    );
                    break;
                case 8:
                    this.$emit(
                        "data-change",
                        this.macTable.filter(
                            (item) =>
                                item.macaddr.indexOf(this.form.macaddr) > -1
                        )
                    );
                    break;
            }
        },
    },
    watch: {
        data() {
            this.macTable = this.data;
            this.computedData();
        },
        flag() {
            this.resetFields();
            this.computedData();
        },
        form: {
            handler() {
                this.computedData();
            },
            deep: true,
        },
    },
};
</script>

<style lang="less" scoped>
div.query {
    margin: 12px 0;
    height: 30px;
    > span {
        display: inline-block;
        width: 120px;
        text-align: center;
        vertical-align: middle;
    }
    select {
        width: 180px;
        & + select,
        & + input {
            margin-left: 20px;
        }
    }
}
</style>