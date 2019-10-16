<template>
    <div :class="['cus-table', customClass]">
        <div class="cus-table-title">{{ title }}</div>
        <table border="1">
            <tbody>
                <template v-for="(item, key) in data">
                    <tr>
                        <td>{{ lanMap[key] }}</td>
                        <td>{{ item }}</td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "cusTable",
    data() {
        return {};
    },
    computed: {
        ...mapState(["lanMap", "port_name"])
    },
    props: {
        data: {
            type: Object,
            default: _ => ({})
        },
        title: {
            type: String,
            default: ""
        },
        customClass: {
            type: String,
            drfault: ''
        }
    },
    methods: {}
};
</script>

<style lang="less" scoped>
.cus-table {
    margin: 20px 20px 20px 20px;
    .cus-table-title {
        font-weight: 600;
        line-height: 30px;
        color: #333;
    }
}
table {
    width: 100%;
    table-layout: fixed;
}
td {
    border: 1px solid #ddd;
    padding: 3px 12px;
    word-wrap: break-word;
    word-break: break-all;
}
.cell-width{
    td:first-child{
        width: 70%;
    }
}
</style>