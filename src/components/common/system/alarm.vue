<template>
    <div>
        <div class="alarm-title">
            {{ lanMap['alarm_info'] }}
            <a href="javascript:void(0);" @click="getData">{{ lanMap['refresh'] }}</a>
            <a href="javascript:void(0);" @click="open_cfm">{{ lanMap['download'] }}</a>
        </div>
        <ul v-if="alarm_data.data && alarm_data.data.length > 0" v-for="(item,index) in alarm_data.data" :key="index">
            <li>{{ item }}</li>
        </ul>
        <div  v-if="!alarm_data.data" class="no-more-data">{{ lanMap['no_more_data'] }}</div>
        <scroll-top></scroll-top>
        <confirm v-if="isShow" @choose="view_result"></confirm>
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
            isShow: false
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
        },
        open_cfm(){
            this.isShow = true;
        },
        view_result(bool){
            if(bool){
                this.$http.get('/alarm?form=download').then(res=>{
                    if(res.data.code === 1){
                        try{
                            // var a = document.createElement('a');
                            // var str = window.location.href;
                            // var _url = str.substr(0,str.indexOf('/#/')+1);
                            // a.href = _url + res.data.data.filename;
                            // a.download = res.data.data.filename;
                            // a.click();
                            var a = document.createElement('a');
                            var str = window.location.href;
                            var _url = str.substr(0,str.indexOf('/#/')+1);
                            var evt = document.createEvent("HTMLEvents");
                            evt.initEvent("click", false, false);
                            a.href = _url + res.data.data.filename;
                            a.download = res.data.data.filename;
                            document.body.appendChild(a);
                            a.style.display = 'none';
                            a.dispatchEvent(evt);
                            document.body.removeChild(a);
                        }catch(e){
                            this.view_result(true);
                        }
                    }else if(res.data.code > 1){
                        this.$message({
                            type: res.data.type,
                            text: '(' + res.data.code + ') ' + res.data.message
                        })
                    }
                }).catch(err=>{
                    // to do
                })
            }
            this.isShow = false;
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
div.no-more-data{
    margin: 20px 10px;
    color: red;
}
</style>
