<template>
    <div class="port-info" v-if="this.data.pon_port[0]">
        <ul v-if="this.data.pon_port" class="port-info-title"  onselectstart="return false;">
            <li>端口名称</li>
            <li  v-for="(item,key) of this.data.pon_port[0]" :key="key" v-if="key !== 'port_id'">{{ lanMap[key] }}</li>
            <li>管理此端口</li>
        </ul>
        <ul class="port-info-title" v-for="(item,index) in this.data.pon_port" :key="index" onselectstart="return false;">
            <li>{{ "PON0" + item.port_id }}</li>
            <li>{{ item.admin_status >= 1 ? "Enable" : "Disable" }}</li>
            <li>{{ item.link_status >=1 ? "Link-up" : "Link-down" }}</li>
            <li>{{ item.auto_neg >=1 ? "Enable" : "Disable" }}</li>
            <li>{{ item.speed }}</li>
            <li>{{ item.duplex >= 1 ? "full" : "half" }}</li>
            <li>{{ item.flow_ctrl >= 1 ? "Enable" : "Disable" }}</li>
            <li>{{ item.pvid }}</li>
            <li>{{ item.media }}</li>
            <li class="cfg-btn"  onselectstart="return false;">配置此端口</li>
        </ul>
        <ul class="port-info-title" v-for="(item,index) in this.data.ge_port" :key="index" onselectstart="return false;">
            <li>{{ "GE0" + (index + 1) }}</li>
            <li>{{ item.admin_status >= 1 ? "Enable" : "Disable" }}</li>
            <li>{{ item.link_status >=1 ? "Link-up" : "Link-down" }}</li>
            <li>{{ item.auto_neg >=1 ? "Enable" : "Disable" }}</li>
            <li>{{ item.speed }}</li>
            <li>{{ item.duplex >= 1 ? "full" : "half" }}</li>
            <li>{{ item.flow_ctrl >= 1 ? "Enable" : "Disable" }}</li>
            <li>{{ item.pvid }}</li>
            <li>{{ item.media }}</li>
            <li class="cfg-btn"  onselectstart="return false;">配置此端口</li>   
        </ul>  
    </div>
</template>

<script>
import { mapState } from 'vuex'
    export default {
        name: 'portInfo',
        data(){
            return {
                data: {
                    code: 0,
                    msg: '',
                    data:{},
                    pon_port:[],
                    ge_port:[],
                    sys: {}
                }
            }
        },
        created(){
            //   url: '/board?info=system'
            this.$http.get('./systemInfo.json').then(res=>{
                this.data.sys = res.data;
                // 请求url: '/switch_port?form=info'
                this.$http.get('./portInfo.json').then(res=>{
                    this.data.data = res.data;
                    this.data.pon_port = res.data.data.slice(0,this.data.sys.data.ponports);
                    this.data.ge_port = res.data.data.slice(this.data.sys.data.ponports,this.data.data.data.length);
                }).catch(err=>{
                    // to do
                })
            }).catch(err=>{
                // to do
            })
        },
        methods:{
            returnLan(key){
                return lanMap_zh[key];
            }
        },
        computed: mapState(['lanMap'])
    }
</script>

<style scoped>
.port-info{
    width: 100%;
}
.port-info-title{
    display: flex;
    width:100%;
    max-width:1200px;
    justify-content: space-around;
}
ul>li{
    width:12%;
    border:1px solid #666;
    text-align: center;
    border-bottom: none;
    border-right: none;
    height: 40px;
    line-height: 40px;
}
ul>li:last-child{
    border-right:1px solid #666;
}
ul:last-child{
    border-bottom: 1px solid #666;
}
.cfg-btn{
    color: #24689B;
    cursor: pointer;
}
</style>