<template>
    <div>
        <div class="alarm-title">
            {{ lanMap['alarm_info'] }}
            <a href="javascript:void(0);" @click="getData">{{ lanMap['refresh'] }}</a>
            <a href="javascript:void(0);" v-if="count < 4" @click="getData">{{ lanMap['loadmore'] }}</a>
        </div>
        <ul v-if="alarm_data.data && alarm_data.data.length > 0" v-for="(item,index) in alarm_data.data" :key="index">
            <li>{{ item }}</li>
        </ul>
        <scroll-top></scroll-top>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import scrollTop from '@/components/common/scrollTop'
export default {
    name: 'alarm',
    computed: mapState(['lanMap']),
    components: { scrollTop },
    data(){
        return {
            alarm_data: {},
            count: 0
        }
    },
    created(){
        this.getData();
    },
    methods: {
        getData(){
            if(this.count > 3) return
            this.$http.get('/alarm?form=info',{ params: { count: this.count } }).then(res=>{
                if(res.data.code === 1){
                    if(this.count === 0){
                        this.alarm_data = res.data;
                        if(res.data.data.length === 256){
                            this.count++;
                            return
                        }else{
                            this.count = 9;
                        }
                    }else{
                        if(res.data.data){
                            this.alarm_data.data = this.alarm_data.data.concat(res.data.data);
                            this.count++;
                        }
                        if(!res.data.data || res.data.data.length < 256){
                            this.count = 9;
                        }
                    }
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
