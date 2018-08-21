<template>
    <div>
        <ul>
            <li v-for="(item,index) in onu_alarm_list.data" :key="index">{{ item }}</li>
        </ul>
         <div  v-if="!onu_alarm_list.data || onu_alarm_list.data.length < 1" class="no-more-data">{{ lanMap['no_more_data'] }}</div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'onuAlarm',
    computed: mapState(['lanMap']),
    data(){
        return {
            onu_alarm_list: {}
        }
    },
    created(){
        this.$http.get('/onumgmt?form=alarm-info',{ params: { port_id : 0, onu_id: 0} }).then(res=>{
            if(res.data.code === 1){
                this.onu_alarm_list = res.data;
            }else{
                this.onu_alarm_list = {}
            }
        }).catch(err=>{
            // to do
        })
    },
    methods: {

    }
}
</script>

<style lang="less" scoped>
li{
    margin: 6px 0 6px 20px;
}
div.no-more-data{
    margin: 20px 10px;
    color: red;
}
</style>
