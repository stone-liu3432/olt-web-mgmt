<template>
    <div>
        <div class="tab-bar">
            <div
                :class="{ actived: show === item }"
                @click="select_tab(item)"
                v-for="(item,index) in tab"
                :key="index"
            >{{ lanMap[item] ? lanMap[item] : item }}</div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "tabBar",
    model: {
        prop: 'show_index',
        event: 'togglePage'
    },
    props: {
        tab: {
            type: Array,
            required: true
        },
        show_index: {
            type: String
        }
    },
    computed: {
        ...mapState(["lanMap"])
    },
    data() {
        return {
            show: this.show_index || this.tab[0]
        };
    },
    methods: {
        select_tab(item) {
            if(this.show === item) return
            this.show = item;
            this.$emit("togglePage", item);
        }
    },
    watch: {
        show_index(){
            if(this.show === this.show_index) return
            this.show = this.show_index;
            this.$emit("togglePage", this.show_index);
        }
    }
};
</script>

<style lang="less" scoped>
div.tab-bar {
    color: @tabbarColor;
    margin: 30px 0 20px 0;
    border-bottom: 3px solid @tabbarBorderColor;
    padding-left: 10px;
    &::after {
        content: "";
        display: table;
        clear: both;
    }
    > div {
        float: left;
        margin-left: 5px;
        border: 1px solid @tabbarBorderColor;
        margin-bottom: -1px;
        border-radius: 3px 3px 0 0;
        cursor: pointer;
        padding: 0 30px;
        text-align: center;
        height: 30px;
        line-height: 30px;
    }
    .actived {
        border: 1px solid @tabbarBorderColor;
        border-radius: 3px 3px 0 0;
        color: @activedTabbarColor;
        background: @activedTabbarBgColor;
        font-weight: 500;
    }
}
</style>
