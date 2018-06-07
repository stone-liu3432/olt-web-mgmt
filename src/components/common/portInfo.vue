<template>
    <div class="port-info">
        <div>
            <h2>{{ lanMap['port_info'] }}</h2>
        </div>
        <ul class="port-info-title"  onselectstart="return false;" v-if="port_info.data">
            <li>
                <span>{{ lanMap['port_id']}}</span>
                <span v-for="(item,key) of port_info.data[0]" :key="key" 
                v-if="port_info.data && key !== 'port_id' && key !== 'ingress_rate' && key !== 'int_media' && key !== 'int_speed' && key !== 'egress_rate'"
                :title="lanMap[key]" >
                    {{ lanMap[key] }}
                </span>
                <span>{{ lanMap['config']}}</span>
            </li>
        </ul>
        <ul class="port-info-title" v-if="port_info.data && port_name.pon" onselectstart="return false;">
            <li v-for="(item,index) in port_info.data" :key="index">
                <span>{{ port_name.pon[item.port_id] ? port_name.pon[item.port_id].name : port_name.ge[item.port_id].name }}</span>
                <span>{{ item.admin_status >= 1 ? "Enable" : "Disable" }}</span>
                <span>{{ item.link_status >=1 ? "Link-up" : "Link-down" }}</span>
                <span>{{ item.auto_neg >=1 ? "Enable" : "Disable" }}</span>
                <span>{{ item.speed === "10/100/1000M" ? "Auto" : item.speed }}</span>
                <span>{{ item.duplex >= 1 ? "full" : "half" }}</span>
                <span>{{ item.flow_ctrl >= 1 ? "Enable" : "Disable" }}</span>
                <span>{{ item.mtu }}</span>
                <span>{{ lanMap[item.media] }}</span>
                <span>{{ item.pvid }}</span>
                <span class="cfg-btn"  onselectstart="return false;" @click="jump(item.port_id)">{{ lanMap['config'] }}</span>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapState } from 'vuex'
    export default {
        name: 'portInfo',
        data(){
            return {
                port_info: {}
            }
        },
        created(){
             this.$http.get(this.change_url.port).then(res=>{
                    if(res.data.code === 1){
                        this.port_info = res.data;
                    }else{
                        this.port_info = {};
                    }
                }).catch(err=>{
                    // to do
                })
        },
        methods:{
            jump(id){
                this.$router.push('/port_cfg?port_id='+id);
                var sub_item = document.querySelectorAll('p.sub-item');
                for(var i=0;i<sub_item.length;i++){
                    sub_item[i].className = 'sub-item';
                    if(sub_item[i].innerText.replace(/(^\s*)|(\s*$)/g, "") == this.lanMap['port_cfg']){
                        sub_item[i].className += ' actived';
                    }
                }
            }
        },
        computed: mapState(['lanMap','port_name','change_url'])
    }
</script>

<style scoped>
.port-info{
    min-width: 1020px;
}
.port-info-title{
    width:100%;
    max-width:1200px;
}
h2{
    width: 200px;
	font-size: 20px;
	font-weight: 600;
	color: 	#67AEF7;
    margin: 10px 0 20px 10px;
}
li{
    height: 32px;
    line-height: 32px;
    overflow: hidden;
}
ul>li>span{
    float: left;
    width: 9.08%;
    border: 1px solid #ccc;
    text-align: center;
    border-bottom: none;
    border-right: none;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
}
ul>li>span:last-child{
    border-right: 1px solid #ccc;
}
ul+ul>li:last-child{
    border-bottom: 1px solid #ccc;
}
.cfg-btn{
    color: #24689B;
    cursor: pointer;
}
</style>