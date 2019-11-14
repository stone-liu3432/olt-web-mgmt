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
        }
    },
    inject: ['commit'],
    mounted() {
        //  标志位，防止slot中有同名("label")的props
        this.__IS_HEAD__ = true;
        this.commit('formatter', this.formatter)
        //  作用域插槽
        this.commit('scopedSlots', this.$scopedSlots.default)
        //  普通插槽
        this.commit('slots', this.$slots.default)

        this.commit('attrs', this.$attrs);
        this.commit('headerStyle', this.$attrs);
        //  列的样式 or 类名
        this.commit('cellStyle', this.cellStyle);
        this.commit('cellClass', this.cellClass);
    },
    render(h){
        return null;
    }
};
</script>

<style lang="less" scoped>
</style>