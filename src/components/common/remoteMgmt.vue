<template>
    <div>
       <div class="remote-mgmt">
           <span>{{ lanMap['remote_mgmt'] }}</span>
           <a href="javascript:;" @click="openModal()">{{ lanMap['config'] }}</a>
       </div>
       <div class="remote-content" v-if="outbound.data">
           <p>
                <span>{{ lanMap['outbound'] }}</span>
                <a href="javascript:;" class="clear-btn" @click="clear_statistic(outbound.data)">{{ lanMap["flush"] }}{{ lanMap['statistic']}}</a>
           </p>
           <div>
               <span>{{ lanMap['ipaddr'] }}</span>
               <span class="colspace">{{ outbound.data.ipaddr }}</span>
               <span>{{ lanMap['ipmask'] }}</span>
               <span>{{ outbound.data.ipmask }}</span>
           </div>
           <div>
               <span>{{ lanMap['rcvpkt'] }}</span>
               <span class="colspace">{{ this.outbound.data.rcvpkt }}</span>
               <span>{{ lanMap['rcvbytes'] }}</span>
               <span>{{ outbound.data.rcvbytes }}</span>
           </div>
           <div>
               <span>{{ lanMap['transpkt'] }}</span>
               <span class="colspace">{{ this.outbound.data.transpkt }}</span>
               <span>{{ lanMap['transbytes'] }}</span>
               <span>{{ outbound.data.transbytes }}</span>
           </div>
       </div>
       <div v-else>
           <p>
               <span>{{ lanMap['outbound'] }}</span>
           </p>
           <p>
               <span>带外接口连接失败</span>
           </p>
       </div>
       <div class="remote-content" v-if="inbound.data" v-for="(item,index) in inbound.data" :key="index">
           <p>
                <span>{{ item.interface }}</span>
                <a href="javascript:;" class="clear-btn" @click="clear_statistic(item)">{{ lanMap["flush"] }}{{ lanMap['statistic']}}</a>
           </p>
           <div>
               <span>{{ lanMap['ipaddr'] }}</span>
               <span class="colspace">{{ item.ipaddr }}</span>
               <span>{{ lanMap['ipmask'] }}</span>
               <span class="colspace">{{ item.ipmask }}</span>
               <span>VLAN</span>
               <span>{{ item.vlan_id }}</span>
           </div>
           <div>
               <span>{{ lanMap['rcvpkt'] }}</span>
               <span class="colspace">{{ item.rcvpkt }}</span>
               <span>{{ lanMap['rcvbytes'] }}</span>
               <span>{{ item.rcvbytes }}</span>
           </div>
           <div>
               <span>{{ lanMap['transpkt'] }}</span>
               <span class="colspace">{{ item.transpkt }}</span>
               <span>{{ lanMap['transbytes'] }}</span>
               <span>{{ item.transbytes }}</span>
           </div>
       </div>
       <div class="remote-content" v-if="!inbound.data">
           <p>
               <span>{{ lanMap['inbound'] }}</span>
           </p>
           <p style="border-bottom:none;">
               <span>当前没有带内接口</span>
           </p>
       </div>
       <div class="modal-dialog" v-if="modalDialog && interface_data">
            <div class="cover"></div>
            <div class="modal-content">
                <div class="modal-item">
                    <h2> {{ lanMap['remote_mgmt'] }} </h2>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['interface'] }}</span>
                    <select @change="isSelected($event)">
                        <option v-for="(item,index) in interface_data" :key="index" :value="item.interface">
                            {{ lanMap[item.interface] ? lanMap[item.interface] : item.interface }}
                        </option>
                        <option value="add"> {{ lanMap['add'] }} </option>
                    </select>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['ipaddr'] }}</span>
                    <input type="text" placeholder="192.168.1.1" v-model="ipaddr">
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['ipmask'] }}</span>
                    <input type="text" placeholder="255.255.255.0" v-model="ipmask">
                </div>
                <div class="modal-item">
                    <span>VLAN</span>
                    <input type="text" id="vlanid" placeholder="0-4094" v-model="vlan" disabled>
                </div>
                <div class="modal-item flex-box">
                    <a href="javascript:;" @click="isAdd" :class="[ click_interface !== 'add' ? 'not-allowed' : '' ]"> 
                        {{ lanMap['add'] }} 
                    </a>
                    <a href="javascript:;" @click="isDelete" :class="[ (click_interface !== 'add' && click_interface !== 'outbound') ? '' : 'not-allowed' ]">
                        {{ lanMap['delete'] }}
                    </a>
                    <a href="javascript:;" @click="isApply" :class="[ click_interface !== 'add' ? '' : 'not-allowed' ]">
                        {{ lanMap['apply'] }}
                    </a>
                    <a href="javascript:;" @click="closeModal()">
                        {{ lanMap['cancel'] }}
                    </a>
                </div>
                <div class="close" @click="closeModal()"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
    export default {
        name: 'remoteMgmt',
        computed: mapState(['lanMap','change_url']),
        data(){
            return {
                outbound: {},
                inbound: {},
                interface_data: [],
                // 控制模态框隐藏显示
                modalDialog: false,
                // 模态框所需要的所有数据
                interface_map: {},
                // 模态框内按钮状态
                click_interface: '',
                ipaddr: '',
                ipmask: '',
                vlan: ' - '
            }
        },
        created(){
            this.$http.get(this.change_url.outbound).then(res=>{
                this.outbound = res.data;
                if(res.data.code == 1){
                        this.interface_data.push(res.data.data);
                        this.ipaddr = res.data.data.ipaddr;
                        this.ipmask = res.data.data.ipmask;
                    }
                this.$http.get(this.change_url.inbound).then(res=>{
                    if(res.data.code == 1){
                        this.inbound = res.data;
                        this.interface_data = this.interface_data.concat(res.data.data);
                    }
                    this.click_interface = this.interface_data[0].interface;
                }).catch(err=>{
                    // to do
                })
            }).catch(err=>{
                // to do
            })
        },
        methods:{
            closeModal(){
                this.modalDialog = false;
                // 关闭模态框时，释放内存
                this.interface_map = {};
            },
            openModal(){
                this.modalDialog = true;
                // 打开模态框时，映射每个 option 的 value 为键，每个option的所有数据为值，保存数据，触发change事件时动态改变页面的值
                for(var i=0;i<this.interface_data.length;i++){
                    this.interface_map[this.interface_data[i].interface] = this.interface_data[i];
                }
            },
            isAdd(){
                if(this.click_interface === 'add'){
                    var post_params = {
                        "method":"add",
                        "param":{
                            "ipaddr": this.ipaddr,
                            "ipmask": this.ipmask,
                            "vlan_id": this.vlan
                        }
                    }
                    // 请求url: /system?form=inbound
                    this.$http.post('/system?form=inbound',post_params).then(res=>{
                        // to do
                    }).catch(err=>{
                        // to do
                    })
                }
                return;
            },
            isDelete(){
                if(this.click_interface === 'outbound'){
                    return
                }else if(this.click_interface === 'add'){
                    return
                }else{
                    var post_params = {
                        "method":"delete",
                        "param":{
                            "vlan_id": this.vlan
                        }
                    }
                    // 请求url: /system?form=inbound
                    this.$http.post('/system?form=inbound',post_params).then(res=>{
                        // to do 
                    }).catch(err=>{
                        // to do 
                    })
                }
            },
            isApply(){
                if(this.click_interface === 'add'){
                    return
                }else if(this.click_interface === 'outbound'){
                    // to do
                    var post_params = {
                        "method":"set",
                        "param":{
                            "ipaddr": this.ipaddr,
                            "ipmask": this.ipmask,
                            "interface": this.click_interface
                        }
                    }
                    // 请求url: /system?form=outbound
                    this.$http.post('/system?form=outbound',post_params).then(res=>{
                        // to do 
                    }).catch(err=>{
                        // to do 
                    })
                }else{
                    var post_params = {
                        "method":"set",
                        "param":{
                            "ipaddr": this.ipaddr,
                            "ipmask": this.ipmask,
                            "interface": this.click_interface,
                            "vlan_id": this.vlan
                        }
                    }
                    // 请求url: /system?form=inbound
                    this.$http.post('/system?form=inbound',post_params).then(res=>{
                        // to do 
                    }).catch(err=>{
                        // to do 
                    })
                }
            },
            clear_statistic(data){
                if(data.interface === 'outbound'){
                    var post_data = {
                        "method": "set",
                        "param": {
                            "ipaddr": data.ipaddr,
                            "ipmask": data.ipmask,
                            "interface": data.interface
                        }
                    }
                    // 请求url: /system?form=outbound   POST
                    this.$http.post('/system?form=outbound',post_data).then(res=>{
                        //  to do
                    }).catch(err=>{
                        // to do
                    })    
                }else{
                    var post_data = {
                        "method": "set",
                        "param": {
                            "ipaddr": data.ipaddr,
                            "ipmask": data.ipmask,
                            "interface": data.interface,
                            "vlan_id": data.vlan_id
                        }
                    }
                    // 请求url: /system?form=outbound   POST
                    this.$http.post('/system?form=inbound',post_data).then(res=>{
                        //  to do
                    }).catch(err=>{
                        // to do
                    })   
                }
            },
            // 手动触发change事件时，更新当前组件的data值，触发页面自动更新
            isSelected(node){
                this.click_interface = node.target.value;
                if(node.target.value === 'add'){
                    this.ipaddr = '';
                    this.ipmask = '';
                    this.vlan = '';
                    var vlanid = document.getElementById('vlanid');
                    vlanid.disabled = false;
                    return
                }
                this.ipaddr = this.interface_map[node.target.value].ipaddr;
                this.ipmask = this.interface_map[node.target.value].ipmask;
                this.vlan = this.interface_map[node.target.value].vlan_id || ' - ';
                var vlanid = document.getElementById('vlanid');
                vlanid.disabled = true;
            }
        }
    }
</script>

<style scoped>
select{
    height: 30px;
    font-size: 16px;
}
.remote-content{
    border: 1px solid #ddd;
    padding: 10px;
    margin-top: 20px;
}
.remote-content>div,p{
    border-bottom: 1px solid #ddd;
    height: 50px;
    line-height: 50px;
    padding-left: 10px;
}
p>span{
    color: #67AEF7;
    font-size: 18px;
    font-weight: 600;
}
.remote-content>div:last-child{
    border: none;
    padding-left: 10px;
}
.remote-content>div>span{
    display: inline-block;
    width: 15%;
    height: 50px;
    line-height: 50px;
    padding-left: 10px;
}
.colspace{
    border-right:1px solid #ccc;
}
.remote-mgmt{
    margin:20px 10px;
}
.remote-mgmt>span{
    font-size: 20px;
    font-weight: 600;
}
.remote-mgmt>a{
    display: inline-block;
    width: 150px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: #ddd;
    margin-left: 100px;
    border: 1px solid transparent;
}
.clear-btn{
    display: inline-block;
    width: 150px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: #ddd;
    float: right;
    margin-top: 5px;
    border: 1px solid transparent;
    transition: all .1s linear;
}
.clear-btn:active,.remote-mgmt>a:active,.modal-item>a:active{
    border: 1px solid #67AEF7;
    background: #ccc;
}
.modal-item>a.not-allowed:hover,.modal-item>a.not-allowed:active{
    cursor: not-allowed;
    border: 1px solid transparent;
    background: #ddd;
}
.modal-content{
    width:550px;
    height:360px;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    background: #fff;
    z-index: 600;
    padding: 0 30px 20px;
    overflow: hidden;
}
.modal-item{
    padding: 0 20px;
    height: 60px;
    border-top: 1px solid #ddd;
}
.modal-item>h2{
    font-size: 18px;
    font-weight: 600;
    margin-top: 20px;
    color: #67AEF7;
}
.modal-item>span{
    display: inline-block;
    width: 200px;
    line-height: 60px;
    text-align: right;
    padding-right: 50px;
    border-right: 1px solid #ccc;
}
.modal-item>a{
    display: inline-block;
    width: 100px;
    height: 30px;
    line-height: 30px;
    background: #ddd;
    text-align: center;
    border-radius: 5px;
    margin-top: 15px;
    border: 1px solid transparent;
}
.flex-box{
    display: flex;
    justify-content: space-around;
}
</style>