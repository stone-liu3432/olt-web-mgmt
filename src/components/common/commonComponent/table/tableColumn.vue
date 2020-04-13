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
            validator: val => ["expand", "selection", "index"].includes(val)
        },
        index: {
            type: [Number, Function],
            default: 1
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
            expand: this.$slots.default || this.$scopedSlots.default
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