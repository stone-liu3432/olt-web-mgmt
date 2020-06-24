<!-- <template>
    <th v-show="false">
        <template>
            <slot :col="prop"></slot>
        </template>
    </th>
</template>
-->
<script>
export default {
    name: "nmsTableColumn",
    data() {
        return {};
    },
    props: {
        prop: {
            type: String,
            default: ""
        },
        label: {
            type: String
        },
        formatter: {
            type: Function
        },
        cellStyle: {
            type: [Function, Object]
        },
        cellClass: {
            type: [Function, String]
        },
        type: {
            type: String,
            // "" 为兼容动态切换 type
            validator: val =>
                ["expand", "selection", "index"].includes(val) || val === ""
        },
        index: {
            type: [Number, Function],
            default: 1
        },
        sortable: {
            type: Boolean,
            default: false
        },
        sortMethod: {
            type: Function
        },
        sortBy: {
            type: String
        },
        sortOrders: {
            type: Array,
            default: _ => ["ascending", "descending", null]
        }
    },
    inject: ["commit"],
    mounted() {
        this.columnConfig = {
            label: this.label,
            prop: this.prop,
            formatters: this.formatter,
            scopedSlots: this.$scopedSlots.default,
            slots: this.$slots.default,
            attrs: this.$attrs,
            headerStyle: this.$attrs,
            cellStyle: this.cellStyle,
            cellClass: this.cellClass,
            header: this.$slots.header,
            type: this.type,
            index: this.index,
            expand: this.$slots.default || this.$scopedSlots.default,
            sortable: this.sortable,
            sortMethod: this.sortMethod,
            sortBy: this.sortBy,
            sortOrders: this.sortOrders,
            sortFlags: 0
        };
        Object.keys(this.columnConfig).forEach(key => {
            this.$watch(key, val => {
                this.columnConfig[key] = val;
            });
        });
        this.commit(this.columnConfig);
    },
    render(h) {
        return null;
    }
};
</script>

<style lang="less" scoped>
</style>