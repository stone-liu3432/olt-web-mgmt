<template>
    <div class="port-info">
        <div>
            <h2>{{ lanMap['port_info'] }}</h2>
        </div>
        <ul class="port-info-title"  onselectstart="return false;" v-if="port_info.data">
            <li>
                <span>{{ lanMap['port_id']}}</span>
            </li>
            <li  v-for="(item,key) of port_info.data[0]" :key="key" 
                v-if="port_info.data && key !== 'port_id' && key !== 'ingress_rate' && key !== 'int_media' && key !== 'int_speed' && key !== 'egress_rate'">
                <span>{{ lanMap[key] }}</span>
            </li>
            <li>
                <span>{{ lanMap['config']}}</span>
            </li>
        </ul>
        <ul class="port-info-title" v-if="port_info.data && port_name.pon" v-for="(item,index) in port_info.data" :key="index" onselectstart="return false;">
            <li>
                <span>{{ port_name.pon[item.port_id] ? port_name.pon[item.port_id].name : port_name.ge[item.port_id].name }}</span>
            </li>
            <li>
                <span>{{ item.admin_status >= 1 ? "Enable" : "Disable" }}</span>
            </li>
            <li>
                <span>{{ item.link_status >=1 ? "Link-up" : "Link-down" }}</span>
            </li>
            <li>
                <span>{{ item.auto_neg >=1 ? "Enable" : "Disable" }}</span>
            </li>
            <li>
                <span>{{ item.speed === "10/100/1000M" ? "Auto" : item.speed }}</span>
            </li>
            <li>
                <span>{{ item.duplex >= 1 ? "full" : "half" }}</span>
            </li>
            <li>
                <span>{{ item.flow_ctrl >= 1 ? "Enable" : "Disable" }}</span>
            </li>
            <li>
                <span>{{ item.mtu }}</span>
            </li>
            <li>
                <span>{{ lanMap[item.media] }}</span>
            </li>
            <li>
                <span>{{ item.pvid }}</span>
            </li>
            <li class="cfg-btn"  onselectstart="return false;" @click="jump(item.port_id)">
                <span>{{ lanMap['config'] }}</span>
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
    display: flex;
    width:100%;
    max-width:1200px;
    justify-content: space-around;
}
h2{
    width: 200px;
	font-size: 20px;
	font-weight: 600;
	color: 	#67AEF7;
    margin: 10px 0 20px 10px;
}
ul>li{
    width:12%;
    border:1px solid #ccc;
    text-align: center;
    border-bottom: none;
    border-right: none;
    height: 40px;
    font-size: 32px;
    vertical-align: middle;
    overflow: hidden;
}
ul>li>span{
    display: inline-block;
    font-size: 16px;
    vertical-align: middle;
}
ul>li:last-child{
    border-right:1px solid #ccc;
}
ul:last-child{
    border-bottom: 1px solid #ccc;
}
.cfg-btn{
    color: #24689B;
    cursor: pointer;
}
</style>