<template>
    <div>
        <div>
            <h2>{{ lanMap['port_cfg'] }}</h2>
        </div>
        <div class="vlan-config">
            <p class="item-align">
                <span>{{ lanMap['port_id'] + '：' }}</span>
                <select v-model="portid">
                    <option v-for="(item,index) in port_name.pon" :key="index" :value="item.id">{{ item.name }}</option>
                    <option v-for="(item,index) in port_name.ge" :key="index" :value="item.id">{{ item.name }}</option>
                </select>
            </p>  
            <p>
                <span>{{ lanMap['link_status'] + '：' }}</span>
                <span>{{ port_info.data[portid-1].link_status === 1 ? lanMap['link_up'] : lanMap['link_down'] }}</span>
            </p>
            <p>
                <span>{{ lanMap['admin_status'] + '：' }}</span>
                <span>{{ port_info.data[portid-1].admin_status === 1 ? lanMap['enable'] : lanMap['disable'] }}</span>
            </p>
        </div>
        <!-- <div class="config">
            <h3>{{ lanMap['vlan_cfg']}}</h3>
            <div>
                <div class="vlan-config">
                    <p>{{ lanMap['port_type'] }}</p>
                    <select>
                        <option value="1">access</option>
                        <option value="2">trunk</option>
                        <option value="3">hybird</option>
                    </select>
                </div>
                <div class="vlan-config">
                    <p>{{ lanMap['pvid'] }}</p>
                    <input type="text">
                </div>
                <div class="vlan-config">
                    <p>{{ lanMap['tagged'] }}</p>
                    <input type="text">
                </div>
                <div class="vlan-config">
                    <p>{{ lanMap['untagged'] }}</p>
                    <input type="text">
                </div>
                <div class="btn-submit"> 
                    <a href="javascript:void(0);" class="rt">{{ lanMap['apply'] }}</a>
                </div>
            </div>
        </div> -->
        <div class="contianer">
            <div class="config" v-if="swich_port_info.data">
                <h3>
                    {{ lanMap['sw_port_cfg'] }}
                    <div class="tips rt">
                        <i></i>
                        <div>
                            <p>{{ lanMap['mtu'] }}</p>
                            <p>{{ lanMap['range'] }} 128-2000</p>
                            <hr>
                            <p>{{ lanMap['erate'] }}</p>
                            <p>{{ lanMap['range'] }} 64-100000</p>
                            <hr>
                            <p>{{ lanMap['irate'] }}</p>
                            <p>{{ lanMap['range'] }} 64-100000</p>
                            <hr>
                            <p>{{ lanMap['pvid'] }}</p>
                            <p>{{ lanMap['range'] }} 1-4094</p>
                        </div>
                    </div>
                </h3>
                <div class="swich-basic-config">
                    <ul>
                        <li v-for="(item,key) in swich_port_info.data" :key="key" class="swich-item" v-if="key !== 'port_id'">
                            <span v-if="key !== 'port_id'">{{ lanMap[key] }}</span>
                            <!-- <span v-if="key === 'port_id'">{{ item }}</span> -->
                            <select v-if="key === 'admin_status' || key === 'auto_neg' || key === 'flow_ctrl'" v-model="port_data[key]">
                                <option value="0">{{ lanMap['disable'] }}</option>
                                <option value="1">{{ lanMap['enable'] }}</option>
                            </select>
                            <select v-if="key === 'link_status'" v-model="port_data.link_status">
                                <option value="0">{{ lanMap['link_down'] }}</option>
                                <option value="1">{{ lanMap['link_up'] }}</option>
                            </select>
                            <select v-if="key === 'duplex'" v-model="port_data.duplex">
                                <option value="0">{{ lanMap['half'] }}</option>
                                <option value="1">{{ lanMap['full'] }}</option>
                            </select>
                            <select v-if="key === 'speed'" v-model="port_data.speed">
                                <option value="10M">10M</option>
                                <option value="100M">100M</option>
                                <option value="1000M">1000M</option>
                                <option value="10/100/1000M">10/100/1000M</option>
                            </select>
                            <input type="text" v-if="key === 'mtu'" placeholder="128-2000" v-model.number="port_data.mtu"
                            :style="{ 'border-color' : port_data.mtu && (port_data.mtu < 128 || port_data.mtu > 2000 || isNaN(port_data.mtu)) ? 'red' : '' }">
                            <span v-if="key === 'media'">{{ lanMap[item] }}</span>
                            <input type="text" v-if="key === 'erate'" v-model.number="port_data.erate"
                            :style="{ 'border-color' : port_data.erate && (port_data.erate < 64 || port_data.erate > 100000 || isNaN(port_data.erate)) ? 'red' : '' }">
                            <span v-if="key === 'erate'" class="units">Kbps</span>
                            <input type="text" v-if="key === 'irate'" v-model.number="port_data.irate"
                            :style="{ 'border-color' : port_data.irate && (port_data.irate < 64 || port_data.irate > 100000 || isNaN(port_data.irate)) ? 'red' : '' }">
                            <span v-if="key === 'irate'" class="units">Kbps</span>
                            <input type="text" v-if="key === 'pvid'" v-model.number="port_data.pvid"
                            :style="{ 'border-color' : port_data.pvid && (port_data.pvid < 1 || port_data.pvid > 4094 || isNaN(port_data.pvid)) ? 'red' : '' }">
                        </li>
                    </ul>
                    <div class="btn-submit">
                        <a href="javascript:;" class="rt" @click="swich_port_cfg">{{ lanMap['apply'] }}</a>
                    </div>
                </div>
            </div>
            <div v-else class="warning">{{ lanMap['flush_page_retry'] }}</div>
            <div class="config" v-if="stormctrl_data.data">
                <h3>
                    {{ lanMap['stormctrl'] }}
                    <div class="tips rt">
                        <i></i>
                        <div>
                            <p>{{ lanMap['broadcast'] }}</p>
                            <p>{{ lanMap['range'] }} 1-1488100</p>
                            <hr>
                            <p>{{ lanMap['multicast'] }}</p>
                            <p>{{ lanMap['range'] }} 1-1488100</p>
                            <hr>
                            <p>{{ lanMap['unicast'] }}</p>
                            <p>{{ lanMap['range'] }} 1-1488100</p>
                        </div>
                    </div>
                </h3>
                <div class="storm-config">
                    <ul>
                        <li v-for="(item,key) in stormctrl_data.data" :key="key" v-if="key !== 'port_id'" class="swich-item">
                            <span>{{ lanMap[key] }}</span>
                            <input type="text" v-model.number="storm_data[key]" 
                            :style="{ 'border-color' : storm_data[key] && (storm_data[key] < 1 || storm_data[key] > 1488100 || isNaN(storm_data[key])) ? 'red' : '' }">
                            pps
                        </li>
                    </ul>
                    <div class="btn-submit">
                        <a href="javascript:void(0);" class="rt" @click="storm_cfg">{{ lanMap['apply']}}</a>
                    </div>
                </div>
            </div>
            <div v-else class="warning">{{ lanMap['flush_page_retry'] }}</div>
            <div class="config" v-if="mirror_data.data">
                <h3>{{ lanMap['mirror'] }}</h3>
                <div class="port-mirror">
                    <ul>
                        <li class="swich-item">
                            <span>{{ lanMap['dst_port'] }}</span>
                            <select v-model="mirror.dst_port">
                                <option value="0">{{ lanMap['choose'] }}</option>
                                <option v-for="(item,key) in port_name.ge" :key="key" :value="item.id">{{ item.name }}</option>
                            </select>
                        </li>
                        <li class="swich-item">
                            <span>{{ lanMap['type'] }}</span>
                            <select v-model="mirror.type">
                                <option value="1">ingress</option>
                                <option value="2">egress</option>
                                <option value="3">all</option>
                            </select>
                        </li>
                    </ul>
                </div>
                <div class="btn-submit">
                    <a href="javascript:void(0);" class="rt" @click="mirror_cfg">{{ lanMap['apply'] }}</a>
                </div>
            </div>
            <div v-else class="warning">{{ lanMap['flush_page_retry'] }}</div>
        </div>    
        <confirm :tool-tips="lanMap['if_sure']" @choose="result" v-if="userChoose"></confirm>
        <confirm :tool-tips="lanMap['if_sure']" @choose="storm_result" v-if="stormCfg"></confirm>
        <confirm :tool-tips="lanMap['if_sure']" @choose="mirror_result" v-if="mirrorCfg"></confirm>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import confirm from '@/components/common/confirm'
    export default {
        name: 'vlanCfg',
        components: { confirm },
        computed: mapState(['lanMap','port_info','port_name','change_url']),
        data(){
            return {
                vlan_data: {},
                swich_port_info: {},
                stormctrl_data: {},
                mirror_data: {},
                portid: 0,
                //  基本配置 confirm 弹出框
                userChoose: false,
                //  风暴控制 confirm 弹出框
                stormCfg: false,
                //  交换配置更改项统计
                flags: 0,
                //  交换配置数据
                port_data: {
                    auto_neg: 0,
                    admin_status: 0,
                    flow_ctrl: 0,
                    link_status: 0,
                    speed: '',
                    duplex: 0,
                    mtu: 0,
                    erate: 0,
                    irate: 0,
                    pvid: 0
                },
                //  风暴控制更改统计项
                storm_flags: 0,
                //  风暴控制数据
                storm_data: {
                    broadcast: 0,
                    multicast: 0,
                    unicast: 0
                },
                //  端口镜像 confirm 弹出框
                mirrorCfg: false,
                //  端口镜像数据
                mirror: {
                    "src_port": 0,
                    "dst_port": 0,
                    "type": 1
                }
            }
        },
        created(){
            this.portid = this.$route.query.port_id || this.port_info.data[0].port_id;
            if(this.change_url.beta == 'test'){
                this.$http.get('./swich_port_info.json').then(res=>{
                    if(res.data.code ===1){
                        this.swich_port_info = res.data;
                        for(var key in res.data.data){
                            this.port_data[key] = res.data.data[key];
                        }
                    }else{
                        this.swich_port_info = {}
                    }
                }).catch(err=>{
                    // to do
                })
                this.$http.get('./storm.json').then(res=>{
                    if(res.data.code ===1){
                        this.stormctrl_data = res.data;
                        for(var key in res.data.data){
                            this.storm_data[key] = res.data.data[key];
                        }
                    }else{
                        this.stormctrl_data = {}
                    }
                }).catch(err=>{
                    // to do
                })
                this.$http.get('./mirror.json').then(res=>{
                    if(res.data.code === 1){
                        this.mirror_data = res.data;
                        for(var key in res.data.data){
                            this.mirror[key] = res.data.data[key];
                        }
                    }else{
                        this.mirror_data = {}
                    }
                }).catch(err=>{
                    // to do
                })
            }
        },
        methods: {
            //  点击交换基本配置时弹出确认层，并收集数据
            swich_port_cfg(){
                this.flags = 0;
                var original = this.swich_port_info.data;
                if(original.admin_status != this.port_data.admin_status){
                    this.flags += 1;
                }
                if(original.auto_neg != this.port_data.auto_neg){
                    this.flags += 2;
                }
                if(original.speed != this.port_data.speed){
                    this.flags += 64;
                }
                if(original.duplex != this.port_data.duplex){
                    this.flags += 4;
                }
                if(original.flow_ctrl != this.port_data.flow_ctrl){
                    this.flags += 24;
                }
                if(original.mtu != this.port_data.mtu){
                    this.flags += 128;
                }
                if(original.erate != this.port_data.erate){
                    this.flags += 256;
                }
                if(original.irate != this.port_data.irate){
                    this.flags += 512;
                }
                if(original.pvid != this.port_data.pvid){
                    this.flags += 1024
                }
                this.userChoose = true;
            },
            //  根据用户点击按钮，执行不同动作  -->  风暴控制
            storm_result(bool){
                if(bool){
                    if(this.storm_flags === 0){
                        this.stormCfg = false;
                        this.$message({
                            type: 'info',
                            text: this.lanMap['modify_tips']
                        })
                        return
                    }
                    if(!this.storm_data.broadcast || this.storm_data.broadcast < 1 || this.storm_data.broadcast > 1488100 || isNaN(this.storm_data.broadcast) ){
                        this.stormCfg = false;
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error'] + ':' + this.lanMap['broadcast']
                        })
                        return
                    }
                    if(!this.storm_data.multicast || this.storm_data.multicast <1 || this.storm_data.multicast > 1488100 || isNaN(this.storm_data.multicast) ){
                        this.stormCfg = false;
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error'] + ':' + this.lanMap['multicast']
                        })
                        return
                    }
                    if(!this.storm_data.unicast || this.storm_data.unicast <1 || this.storm_data.unicast > 1488100 || isNaN(this.storm_data.unicast) ){
                        this.stormCfg = false;
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error'] + ':' + this.lanMap['unicast']
                        })
                        return
                    }
                    var post_params = {
                        "method":"set",
                        "param":{
                            "port_id": this.portid,
                            "flags": this.storm_flags,
                            "broadcast": Number(this.storm_data.broadcast),
                            "multicast": Number(this.storm_data.multicast),
                            "unicast": Number(this.storm_data.unicast)
                        }
                    }
                    this.$http.post('/switch_port?form=stormctrl',post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['setting_ok']
                            })
                            this.getStormData();
                        }else if(res.data.code >1){
                            this.$message({
                                type: 'error',
                                text: this.lanMap['setting_fail']
                            })
                        }
                    }).catch(err=>{
                        // to do
                    })
                }
                this.stormCfg = false;
            },
            //  点击风暴控制栏的确认按钮时弹出确认层，并收集数据
            storm_cfg(){
                this.storm_flags = 0;
                var storm_cfg_data = this.stormctrl_data.data;
                if(storm_cfg_data.broadcast != this.storm_data.broadcast){
                    this.storm_flags += 4;
                }
                if(storm_cfg_data.multicast != this.storm_data.multicast){
                    this.storm_flags += 2;
                }
                if(storm_cfg_data.unicast != this.storm_data.unicast){
                    this.storm_flags += 1;
                }
                this.stormCfg = true;
            },
            //  根据用户点击按钮，执行不同动作  -->  交换基本配置
            result(bool){
                if(bool){
                    if(this.flags === 0){
                        this.userChoose = false;
                        this.$message({
                            type: 'info',
                            text: this.lanMap['modify_tips']
                        })
                        return 
                    }
                    if(!this.port_data.mtu || this.port_data.mtu < 128 || this.port_data.mtu > 2000 || isNaN(this.port_data.mtu)){
                        this.userChoose = false;
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error'] + ':' + this.lanMap['mtu']
                        })
                        return
                    }
                    if(!this.port_data.erate || this.port_data.erate < 64 || this.port_data.erate > 100000 || isNaN(this.port_data.erate) ){
                        this.userChoose = false;
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error'] + ':' + this.lanMap['erate']
                        })
                        return
                    }
                    if(!this.port_data.irate || this.port_data.irate < 64 || this.port_data.irate > 100000 || isNaN(this.port_data.irate) ){
                        this.userChoose = false;
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error'] + ':' + this.lanMap['irate']
                        })
                        return
                    }
                    if(!this.port_data.pvid || this.port_data.pvid < 1 || this.port_data.pvid > 4094 || isNaN(this.port_data.pvid) ){
                        this.userChoose = false;
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error'] + ':' + this.lanMap['pvid']
                        })
                        return
                    }
                    var post_params = {
                        "method":"set",
                        "param":{
                            "port_id": this.portid,
                            "flags": this.flags,
                            "admin_status": this.port_data.admin_status,
                            "auto_neg": this.port_data.auto_neg,
                            "speed": this.port_data.speed,
                            "duplex": this.port_data.duplex,
                            "flow_ctrl": this.port_data.flow_ctrl,
                            "mtu": Number(this.port_data.mtu),
                            "erate": Number(this.port_data.erate),
                            "irate": Number(this.port_data.irate),
                            "pvid": Number(this.port_data.pvid)
                        }
                    }
                    this.$http.post('/switch_port?form=port_info',post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['setting_ok']
                            })
                            this.getPortData();
                        }else if(res.data.code >1){
                            this.$message({
                                type: 'error',
                                text: this.lanMap['setting_fail']
                            })
                        }
                    }).catch(err=>{
                        // to do
                    })
                }
                this.userChoose = false;
            },
            mirror_cfg(){
                this.mirrorCfg = true;
            },
            //  端口镜像框内确认/取消按钮
            mirror_result(bool){
                if(bool){
                    var data = this.mirror_data.data;
                    if(data.dst_port === this.mirror.dst_port){
                        this.mirrorCfg = false;
                        this.$message({
                            type: 'info',
                            text: this.lanMap['modify_tips']
                        })
                        return
                    }
                    var post_params = {
                        "method":"set",
                        "param":{
                            "src_port": this.portid,
                            "dst_port": this.mirror.dst_port,
                            "type": this.mirror.type
                        }
                    }
                    this.$http.post('/switch_port?form=mirror',post_params).then(res=>{
                        if(res.data.code ===1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['setting_ok']
                            })
                            this.getMirrorData();
                        }else if(res.data.code >1){
                            this.$message({
                                type: 'error',
                                text: this.lanMap['setting_fail']
                            })
                        }
                    }).catch(err=>{
                        // to do
                    })
                }
                this.mirrorCfg = false;
            },
            getPortData(){
                this.$http.get('/switch_port?form=port_info&port_id=' + this.portid).then(res=>{
                    if(res.data.code === 1){
                        this.swich_port_info = res.data;
                        for(var key in res.data.data){
                            this.port_data[key] = res.data.data[key];
                        }
                    }else if(res.data.code >1){
                        this.swich_port_info = {};
                    }
                    this.flags = 0;
                }).catch(err=>{
                    // to do
                })
            },
            getStormData(){
                this.$http.get('/switch_port?form=stormctrl&port_id=' + this.portid).then(res=>{
                    if(res.data.code === 1){
                        this.stormctrl_data = res.data;
                        for(var key in res.data.data){
                            this.storm_data[key] = res.data.data[key];
                        }
                    }else if(res.data.code >1){
                        this.stormctrl_data = {};
                    }
                    this.storm_flags = 0;
                }).catch(err=>{
                    // to do
                })
            },
            getMirrorData(){
                this.$http.get('/switch_port?form=mirror&port_id=' + this.portid).then(res=>{
                    if(res.data.code === 1){
                        this.mirror_data = res.data;
                        for(var key in res.data.data){
                            this.mirror_data[key] = res.data.data[key];
                        }
                    }else if(res.data.code >1){
                        this.mirror_data = {};
                    }
                }).catch(err=>{
                    // to do
                })
            }
        },
        watch: {
            portid(){
                this.getPortData();
                this.getStormData();
                this.getMirrorData();
            }
        }
    }
</script>

<style scoped lang="less">
div.contianer{
    width: 100%;
    /* border: 1px solid #ddd; */
}
div.contianer:after{
    content: "";
    display: table;
    clear: both;
}
div.config{
    margin:10px;
    width: 31%;
    float: left;
    border: 1px solid #ddd;
    box-shadow: 3px 3px 3px #ddd;
}
div.config>h3{
    height: 40px;
    line-height: 40px;
    padding: 0 15px;
}
div.config>div{
    border-top: 1px solid #ddd;
    padding: 10px 0;
}
.vlan-config{
    width: 800px;
    margin: 20px 0 20px 20px;
}
input{
    width: 120px;
    border-radius: 3px;
}
h2{
    width: 200px;
	font-size: 20px;
	font-weight: 600;
	color: 	#67AEF7;
    margin: 10px 0 20px 10px;
}
h3{
    color: #67aef7;
    font-size: 18px;
    font-weight: 500;
}
.item-align>select{
    width: 100px;
    height: 30px;
    font-size: 16px;
    text-indent: 10px;
    margin-left: 10px;
}
.item-align>span{
    margin-left: 10px;
}
.vlan-config>p{
    float: left;
    width:30%;
    height: 30px;
    line-height: 30px;
    padding-right: 20px;
}
.vlan-config>input{
    height: 30px;
    line-height: 30px;
    outline: none;
    box-sizing: border-box;
}
.vlan-config>select{
    height: 30px;
    font-size: 16px;
}
.vlan-config>p:first-child{
    text-align: right;
}
.vlan-config:after{
    content: '';
    display: table;
    clear: both;
}
.vlan-config>p.item-align{
    text-align: left;
}
.btn-submit>a{
    width: 100px;
    height: 30px;
    display: inline-block;
    border: 1px solid transparent;
    border-radius: 5px;
    background: #ddd;
    line-height: 30px;
    text-align: center;
    margin-top: 10px;
    margin-right: 30px;
}
a:active{
    border:1px solid #1E90FF;
}
.btn-submit:after{
    content: "";
    display: table;
    clear: both;
}
.vlan-config>div.storm-config{
    width: 600px;
    border: 1px solid #ddd;
}
.port-mirror>span{
    width: 30%;
    display: inline-block;
    height: 30px;
    line-height: 30px;
    margin-left:20px;
}
.port-mirror>select{
    width: 72px;
}
li.swich-item{
    height: 32px;
    line-height: 32px;
    vertical-align: middle;
}
li.swich-item select{
    width: 140px;
    height: 26px;
    font-size: 16px;
}
li.swich-item input{
    height: 26px;
    width: 100px;
}
li.swich-item>span:first-child{
    display: inline-block;
    vertical-align: top;
    width: 120px;
    height: 30px;
    line-height: 30px;
    padding-left: 20px;
}
.warning{
    color: red;
    margin-left: 20px;
}
span.units{
    display: inline-block;
    vertical-align: top;
    font-size: 14px;
    color: #333;
}
div.tips{
    height: 40px;
    line-height: 40px;
    vertical-align: middle;
    position: relative;
    &:hover{
        div{
            display: block;
        }
    }
    i{
        display: inline-block;
        vertical-align: middle;
        cursor: pointer;
        width: 32px;
        height: 32px;
        background: url('../../assets/tips.png') no-repeat;
    }
    >div{
        display: none;
        position: absolute;
        top: 32px;
        left: 32px;
        width: 200px;
        background: #67AEF7;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 10px;
        >P{
            font-size: 16px;
            color: #333;
            height: 20px;
            line-height: 20px;
        }
        >hr{
            border: none;
            border-top: 1px solid #333;
        }
    }
}
</style>