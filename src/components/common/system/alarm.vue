<template>
    <div>
        <div class="alarm-title">
            {{ lanMap['alarm_info'] }}
            <a href="javascript:void(0);" @click="getData()">{{ lanMap['refresh'] }}</a>
        </div>
        <ul v-if="alarm_data.data && alarm_data.data.length > 0" v-for="(item,index) in alarm_data.data" :key="index">
            <li>{{ item }}</li>
        </ul>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'alarm',
    computed: mapState(['lanMap']),
    data(){
        return {
            alarm_data: {}
        }
    },
    created(){
        this.getData();
    },
    methods: {
        getData(){
            this.$http.get('/alarm?form=info').then(res=>{
                if(res.data.code === 1){
                    this.alarm_data = res.data;
                }else{
                    this.alarm_data = {}
                }
            }).catch(err=>{
                // to do
            })
        }
    }
}
</script>

<style lang="less" scoped>
div.alarm-title{
    font-size: 24px;
    margin: 20px 10px;
    font-weight: bold;
    color: #67AEF7;
    a{
        font-size: 16px;
        font-weight: normal;
        width: 120px;
        margin-left: 80px;
        padding: 0;
    }
}
ul{
    margin-left: 20px;
    li{
        margin: 10px 0;
    }
}
</style>
