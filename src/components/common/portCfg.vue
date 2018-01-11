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
                <h3>交换端口基本配置</h3>
                <div class="swich-basic-config">
                    <ul>
                        <li v-for="(item,key) in swich_port_info.data" :key="key" class="swich-item">
                            <span v-if="key !== 'port_id'">{{ lanMap[key] }}</span>
                            <!-- <span v-if="key === 'port_id'">{{ item }}</span> -->
                            <select v-if="key === 'admin_status' || key === 'auto_neg' || key === 'flow_ctrl'" v-model="port_data[key]">
                                <option value="0">{{ lanMap['disable'] }}</option>
                                <option value="1">{{ lanMap['enable'] }}</option>
                            </select>
                            <select v-if="key === 'link_status'" v-model="port_data[key]">
                                <option value="0">{{ lanMap['link_down'] }}</option>
                                <option value="1">{{ lanMap['link_up'] }}</option>
                            </select>
                            <select v-if="key === 'duplex'" v-model="port_data[key]">
                                <option value="0">{{ lanMap['half'] }}</option>
                                <option value="1">{{ lanMap['full'] }}</option>
                            </select>
                            <select v-if="key === 'speed'" v-model="port_data[key]">
                                <option value="10M">10M</option>
                                <option value="100M">100M</option>
                                <option value="1000M">1000M</option>
                            </select>
                            <input type="text" v-if="key === 'mtu'" placeholder="72-2000" v-model="port_data[key]">
                            <span v-if="key === 'media'">{{ lanMap[item] }}</span>
                            <input type="text" v-if="key === 'erate'" v-model="port_data[key]">
                            <span v-if="key === 'erate'">Kbps</span>
                            <input type="text" v-if="key === 'irate'" v-model="port_data[key]">
                            <span v-if="key === 'irate'">Kbps</span>
                        </li>
                    </ul>
                    <div class="btn-submit">
                        <a href="javascript:;" class="rt" @click="swich_port_cfg">{{ lanMap['apply'] }}</a>
                    </div>
                </div>
            </div>
            <div v-else class="warning">获取基本交换信息失败，请刷新页面或稍后再试...</div>
            <div class="config" v-if="stormctrl_data.data">
                <h3>{{ lanMap['stormctrl'] }}</h3>
                <div class="storm-config">
                    <ul>
                        <li v-for="(item,key) in stormctrl_data.data" :key="key" v-if="key !== 'port_id'" class="swich-item">
                            <span>{{ lanMap[key] }}</span>
                            <input type="text" v-model="storm_data[key]">
                            pps
                        </li>
                    </ul>
                    <div class="btn-submit">
                        <a href="javascript:void(0);" class="rt" @click="storm_cfg">{{ lanMap['apply']}}</a>
                    </div>
                </div>
            </div>
            <div v-else class="warning">获取风暴控制信息失败，请刷新页面或稍后再试...</div>
            <div class="config" v-if="mirror_data.data">
                <h3>{{ lanMap['mirror'] }}</h3>
                <div class="port-mirror">
                    <ul>
                        <li class="swich-item">
                            <span>{{ lanMap['dst_port'] }}</span>
                            <select v-model="mirror.dst_port">
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
            <div v-else class="warning">获取端口镜像信息失败，请刷新页面或稍后再试...</div>
        </div>    
        <confirm tool-tips="是否确认?" @choose="result" v-if="userChoose"></confirm>
        <confirm tool-tips="是否确认?" @choose="storm_result" v-if="stormCfg"></confirm>
        <confirm tool-tips="是否确认?" @choose="mirror_result" v-if="mirrorCfg"></confirm>
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
                userChoose: false,
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
                    irate: 0
                },
                //  风暴控制更改统计项
                storm_flags: 0,
                //  风暴控制数据
                storm_data: {
                    broadcast: 0,
                    multicast: 0,
                    unicast: 0
                },
                //  端口镜像更改统计项
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
                this.userChoose = true;
            },
            //  根据用户点击按钮，执行不同动作
            storm_result(bool){
                if(bool){
                    if(this.storm_flags === 0){
                        this.stormCfg = false;
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
                            this.getStormData();
                        }
                    }).catch(err=>{
                        // to do
                    })
                }
                this.stormCfg = false;
            },
            //  点击风暴控制栏的确认按钮时弹出确认层，并收集数据
            storm_cfg(){
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
            //  根据用户点击按钮，执行不同动作
            result(bool){
                if(bool){
                    if(this.flags === 0){
                        this.userChoose = false;
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
                            "irate": Number(this.port_data.irate)
                        }
                    }
                    this.$http.post('/switch_port?form=port_info',post_params).then(res=>{
                        if(res.data.code === 1){
                            this.getPortData();
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
            mirror_result(bool){
                if(bool){
                    var data = this.mirror_data.data;
                    if(data.dst_port === this.mirror.dst_port){
                        this.mirrorCfg = false;
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
                            this.getMirrorData();
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
                    }else{
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
                    }else{
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
                    }else{
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
            },
            'port_data.mtu'(val,oldVal){
                if(typeof val === 'string'){
                    this.port_data.mtu = val.replace(/[^\d]/g,'');
                }
            }
        }
    }
</script>

<style scoped>
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
    padding: 10px 0 10px 10px;
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
    height: 30px;
    line-height: 30px;
}
li.swich-item select{
    width: 100px;
    height: 26px;
    font-size: 16px;
}
li.swich-item input{
    height: 26px;
    width: 100px;
}
li.swich-item>span:first-child{
    display: inline-block;
    width: 120px;
    height: 30px;
    line-height: 30px;
    padding-left: 20px;
}
.warning{
    color: red;
    margin-left: 20px;
}
</style>