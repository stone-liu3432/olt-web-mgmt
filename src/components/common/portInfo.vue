<template>
    <div class="port-info">
        <ul class="port-info-title"  onselectstart="return false;">
            <li>
                <span>{{ lanMap['port_id']}}</span>
            </li>
            <li  v-for="(item,key) of this.port_info.data[0]" :key="key" v-if="key !== 'port_id'">
                <span>{{ lanMap[key] }}</span>
            </li>
            <li>
                <span>{{ lanMap['config']}}</span>
            </li>
        </ul>
        <ul class="port-info-title" v-for="(item,index) in this.port_info.data" :key="index" onselectstart="return false;">
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
                <span>{{ item.speed }}</span>
            </li>
            <li>
                <span>{{ item.duplex >= 1 ? "full" : "half" }}</span>
            </li>
            <li>
                <span>{{ item.flow_ctrl >= 1 ? "Enable" : "Disable" }}</span>
            </li>
            <li>
                <span>{{ item.pvid }}</span>
            </li>
            <li>
                <span>{{ item.media }}</span>
            </li>
            <li class="cfg-btn"  onselectstart="return false;">
                <span @click="jump(item.port_id)">{{ lanMap['config'] }}</span>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapState } from 'vuex'
    export default {
        name: 'portInfo',
        data(){
            return {}
        },
        methods:{
            jump(id){
                this.$router.push('/port_cfg?port_id='+id);
                var sub_item = document.querySelectorAll('p.sub-item');
                for(var i=0;i<sub_item.length;i++){
                    sub_item[i].className = 'sub-item';
                    if(sub_item[i].innerText == this.lanMap['port_cfg']){
                        sub_item[i].className += ' actived';
                    }
                }
            }
        },
        computed: mapState(['lanMap','port_info','port_name'])
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
    font-size: 32px;
    display: table-cell;
    vertical-align: middle;
    overflow: hidden;
}
ul>li>span{
    display: inline-block;
    font-size: 16px;
    vertical-align: middle;
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