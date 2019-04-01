<template>
    <div>
        <div class="tab-bar">
            <div :class="{actived: show_index === index}" @click="select_tab(item,index)" v-for="(item,index) in tab" :key="index">{{ lanMap[item] ? lanMap[item] : item }}</div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'tabBar',
    props: ['tab'],
    computed: mapState(['lanMap']),
    data(){
        return {
            show_index: 0
        }
    },
    methods: {
        select_tab(item,index){
            this.show_index = index;
            this.$emit('togglePage',item);
        }
    }
}
</script>

<style lang="less" scoped>
div.tab-bar{
    margin: 30px 0 20px 0;
    border-bottom: 3px solid #2361A2;
    padding-left: 10px;
    &::after{
        content: '';
        display: table;
        clear: both;
    }
    >div{
        float: left;
        margin-left: 5px;
        border: 1px solid #2361A2;
        margin-bottom: -1px;
        border-radius: 3px 3px 0 0;
        cursor: pointer;
        padding: 0 30px;
        text-align: center;
        height: 30px;
        line-height: 30px;
    }
    .actived{
        border: 1px solid #2361A2;
        border-radius: 3px 3px 0 0;
        color: #fff;
        background: #2361A2;
        font-weight: 500;
    }
}
</style>
