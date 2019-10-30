<template>
    <div class="port-info">
        <div>
            <h2>{{ lanMap['port_info'] }}</h2>
        </div>
        <hr>
        <nms-table :rows="port_info.data" border>
            <nms-table-column prop="port_id" :label="lanMap['port_id']" min-width="80px">
                <template slot-scope="row">
                    {{ row.port_id | getPortName }}
                </template>
            </nms-table-column>
            <nms-table-column prop="admin_status" :label="lanMap['admin_status']">
                <template slot-scope="row">
                    {{ row.admin_status >= 1 ? "Enable" : "Disable" }}
                </template>
            </nms-table-column>
            <nms-table-column prop="link_status" :label="lanMap['link_status']" :cell-style="statusStyle">
                <template slot-scope="row">
                    {{ row.link_status >=1 ? lanMap['link_up'] : lanMap['link_down'] }}
                </template>
            </nms-table-column>
            <nms-table-column prop="auto_neg" :label="lanMap['auto_neg']">
                <template slot-scope="row">
                    {{ row.auto_neg >=1 ? "Enable" : "Disable" }}
                </template>
            </nms-table-column>
            <nms-table-column prop="speed" :label="lanMap['speed']">
                <template slot-scope="row">
                    {{ row.speed === "10/100/1000M" ? "Auto" : row.speed }}
                </template>
            </nms-table-column>
            <nms-table-column prop="duplex" :label="lanMap['duplex']">
                <template slot-scope="row">
                    {{ row.duplex >= 1 ? "full" : "half" }}
                </template>
            </nms-table-column>
            <nms-table-column prop="flow_ctrl" :label="lanMap['flow_ctrl']">
                <template slot-scope="row">
                    {{ row.flow_ctrl >= 1 ? "Enable" : "Disable" }}
                </template>
            </nms-table-column>
            <nms-table-column prop="mtu" :label="lanMap['mtu']"></nms-table-column>
            <nms-table-column prop="media" :label="lanMap['media']">
                <template slot-scope="row">
                    {{ lanMap[row.media] }}
                </template>
            </nms-table-column>
            <nms-table-column prop="pvid" :label="lanMap['pvid']"></nms-table-column>
            <nms-table-column :label="lanMap['config']" width="90px">
                <template slot-scope="row">
                    <a href="javascript: void(0);" class="btn-text" @click="jump(row.port_id)">{{ lanMap['config'] }}</a>
                </template>
            </nms-table-column>
        </nms-table>
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
        activated(){
            this.getData();
        },
        created(){
            this.getData();
        },
        methods:{
            getData(){
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
            jump(id){
                this.$router.push('/port_cfg?port_id='+id);
            },
            statusStyle(row){
                if(row.link_status){
                    return {
                        color: '#3990E5'
                    }
                }
                return { color: 'red' }
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
    width: 300px;
	font-size: 24px;
	font-weight: 600;
	color: 	#67AEF7;
    margin: 10px 0 20px 0;
}
ul{
    margin: 0 0 0 10px;
}
hr+ul{
    margin-top: 20px;
}
li.bg-title>span{
    background: #2361a2;
    color: #fff
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
table{
    border: 1px solid #ccc;
    text-align: center;
}
th, td{
    text-align: center;
    padding: 8px 0;
}
td .btn-text{
    padding: 0 6px;
}
</style>