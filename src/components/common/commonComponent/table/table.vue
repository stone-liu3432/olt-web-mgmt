<template>
    <table :class="[{ 'has-border': border }, { 'has-stripe': stripe }]">
        <thead>
            <template v-for="(title, index) in theads">
                <th :style="headerStyle[index]">{{ title === undefined ? '' : title }}</th>
            </template>
            <slot></slot>
        </thead>
        <tbody>
            <template v-for="(row, index) in rows">
                <tr :style="setRowStyle(row, index)" :class="setRowClass(row, index)">
                    <template v-for="(col, colIndex) in columns">
                        <td
                            :style="setCellStyle(row, colIndex)"
                            v-if="!slots[colIndex] && !scopedSlots[colIndex]"
                        >{{ formatters[colIndex] ? formatters[colIndex](row, colIndex, row[colIndex], index) : row[col] }}</td>
                        <table-column-slot
                            v-else
                            :slots="slots[colIndex] || scopedSlots[colIndex]"
                            :row="row"
                            :style="setCellStyle(row, colIndex)"
                        ></table-column-slot>
                    </template>
                </tr>
            </template>
            <template v-if="!rows.length">
                <tr>
                    <td
                        :colspan="theads.length"
                        style="padding: 12px; color: #666; font-weight: 600;"
                    >
                        <slot name="empty">{{ emptyText }}</slot>
                    </td>
                </tr>
            </template>
        </tbody>
    </table>
</template>

<script>
import tableColumnSlot from "./tableSlots";
export default {
    name: "nmsTable",
    components: { tableColumnSlot },
    props: {
        border: {
            type: Boolean,
            default: false
        },
        stripe: {
            type: Boolean,
            default: false
        },
        rows: {
            type: Array,
            default: _ => []
        },
        emptyText: {
            type: String,
            default: "No data"
        },
        rowStyle: {
            type: [Function, Object],
            default: _ => ({})
        },
        rowClass: {
            type: [Function, String],
            default: ''
        }
    },
    computed: {
        columns() {
            const cols = [];
            if (this.rows) {
                this.$children.forEach(item => {
                    item.prop === undefined ? cols.push('') : cols.push(item.prop);
                });
            }
            return cols;
        },
        theads() {
            const ths = [];
            this.headNodes_ && this.headNodes_.forEach(item => {
                item.child && item.child.__IS_HEAD__ && 
                    (item.child.label !== undefined
                        ? ths.push(item.child.label)
                        : ths.push(""));
            });
            return ths;
        }
    },
    data() {
        return {
            //  私有变量，生成表头用
            headNodes_: [],
            formatters: [],
            slots: [],
            scopedSlots: [],
            attrs: [],
            headerStyle: [],
            cellStyle: [],
            cellClass: []
        };
    },
    provide() {
        return {
            commit: this.commitData
        };
    },
    mounted() {
        this.headNodes_ = this.$slots.default;
    },
    methods: {
        commitData(action, data) {
            if (this[action] instanceof Array) {
                if (this[action].length < this.$children.length) {
                    this[action].push(data);
                }
            }
        },
        setRowStyle(row, rowIndex) {
            const rowStyle = this.rowStyle;
            if (typeof rowStyle === "function") {
                return rowStyle(row, rowIndex);
            }
            return rowStyle;
        },
        setRowClass(row, rowIndex) {
            const rowClass = this.rowClass;
            if (typeof rowClass === "function") {
                return rowClass(row, rowIndex);
            }
            return rowClass;
        },
        setCellStyle(row, cell){
            const cellStyle = this.cellStyle[cell];
            if(typeof cellStyle === 'function'){
                return cellStyle(row, cell)
            }
            return cellStyle
        },
        setCellClass(row, cell){
            const cellClass = this.cellClass[cell];
            if(typeof cellClass === 'function'){
                return cellClass(row, cell);
            }
            return cellClass
        }
    }
};
</script>

<style lang="less" scoped>
table {
    margin: 20px 10px;
    width: calc(~"100% - 20px");
    text-align: center;
}
.has-border {
    border: 1px solid #ccc;
    td,
    th {
        border: 1px solid #ccc;
    }
}
.has-stripe {
    tr:nth-child(even) {
        background: #fff;
    }
}
td {
    padding: 6px 12px;
    word-break: break-word;
    box-sizing: border-box;
}
th {
    text-align: center;
    padding: 6px 12px;
    background: #2361a2;
    color: #fff;
    box-sizing: border-box;
}
tr:hover{
    background: #F5F7FA;
}
</style>