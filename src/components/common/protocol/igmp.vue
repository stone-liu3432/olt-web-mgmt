<template>
    <div class="igmp">
        <h2>IGMP</h2>
        <div>
            <span></span>
            <span></span>
        </div>
        <!-- igmp配置信息  根据Mode不同时的不同显示项 -->
        <ul v-if="igmp_info.data">
            <li>
                <span>{{ lanMap['mode'] }}</span>
                <span>{{ mode[igmp_info.data.mode] }}</span>
            </li>
            <li v-for="(item,key) in igmp_info.data" :key="key" v-if="igmp_info.data.mode === 1 && (key === 'fast_leave' || key === 'protocol_policy' || key === 'group_aging_time')">
                <span>{{ lanMap[key] }}</span>
                <span v-if="key !== 'fast_leave' && key !== 'protocol_policy'">
                    {{ item }}
                    <span v-if=" key === 'group_aging_time' || key === 'gen_response_time' || key === 'gen_query_interval'">s</span>
                    <span v-if=" key === 'sp_response_time' || key === 'sp_query_interval'">ms</span>
                </span>
                <span v-if="key === 'fast_leave'">{{ item ? 'enable' : 'disable' }}</span>
                <span v-if="key === 'protocol_policy'">{{ item ? 'discard' : 'pass' }}</span>
            </li>
            <li v-for="(item,key) in igmp_info.data" :key="key" v-if="igmp_info.data.mode === 2 && key !== 'mode' && key !== 'group_aging_time'">
                <span>{{ lanMap[key] }}</span>
                <span v-if="key !== 'fast_leave' && key !== 'protocol_policy'">
                    {{ item }}
                    <span v-if=" key === 'group_aging_time' || key === 'gen_response_time' || key === 'gen_query_interval'">s</span>
                    <span v-if=" key === 'sp_response_time' || key === 'sp_query_interval'">ms</span>
                </span>
                <span v-if="key === 'fast_leave'">{{ item ? 'enable' : 'disable' }}</span>
                <span v-if="key === 'protocol_policy'">{{ item ? 'discard' : 'pass' }}</span>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'igmp',
    computed: mapState(['lanMap','change_url','port_name']),
    data(){
        return {
            mode: ['disable','snooping','proxy'],
            igmp_info: {}
        }
    },
    created(){
        this.get_igmp_info();
    },
    methods: {
        get_igmp_info(){
            this.$http.get(this.change_url.get_igmp).then(res=>{
                if(res.data.code === 1){
                    this.igmp_info = res.data;
                }else{
                    this.igmp_info = {};
                }
            }).catch(err=>{
                // to do
            })
        }
    }
}
</script>

<style lang="less" scoped>
h2{
    font-size: 24px;
    color: #67AEF7;
}
</style>
