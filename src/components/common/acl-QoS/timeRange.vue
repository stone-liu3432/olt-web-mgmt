<template>
    <div>
        <h3>time ramge</h3>
        <ul>
            <li v-for="(item,index) in time_range.data" :key="index">
                <span>{{ item.name }}</span>
                <span>{{ item.state }}</span>
            </li>
        </ul>
        <code>
            {{ time_range }}
        </code>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
export default {
    name: 'timeRange',
    data(){
        return {
            time_range: {}
        }
    },
    computed: mapState(["change_url", 'lanMap']),
    created(){
        this.getDate();
    },
    methods: {
        getDate(){
            this.$http.get(this.change_url.get_timerange).then(res=>{
                if(res.data.code === 1){
                    this.time_range = res.data;
                }
            }).catch(err=>{
                // to do
            })
        }
    }
}
</script>

<style lang="less" scoped>
h3{
    font-size: 24px;
    font-weight: 600;
    color: #67AEF7;
    margin: 10px 0 20px 0;
}
</style>