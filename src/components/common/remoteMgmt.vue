<template>
    <div v-if="outbound && inbound">
       <div class="remote-mgmt">
           <span>{{ lanMap['remote_mgmt'] }}</span>
           <a href="javascript:;" @click="openModal()">{{ lanMap['config'] }}</a>
       </div>
       <div class="remote-content" v-if="outbound.data">
           <p>
                <span>{{ lanMap['outbound'] }}</span>
                <a href="javascript:;" class="clear-btn">{{ lanMap["flush"] }}{{ lanMap['statistic']}}</a>
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
       <div class="remote-content" v-for="(item,index) in inbound.data" :key="index">
           <p>
                <!-- <span>{{ lanMap['inbound'] }}</span> -->
                <span>{{ item.interface }}</span>
                <a href="javascript:;" class="clear-btn">{{ lanMap["flush"] }}{{ lanMap['statistic']}}</a>
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
                <div class="modal-item" v-if="vlan">
                    <span>VLAN</span>
                    <input type="text" placeholder="0-4094" v-model="vlan">
                </div>
                <div class="modal-item">
                    <a href="javascript:;"> {{ lanMap['add'] }} </a>
                    <a href="javascript:;"> {{ lanMap['delete'] }} </a>
                    <a href="javascript:;"> {{ lanMap['apply'] }} </a>
                    <a href="javascript:;"> {{ lanMap['cancel'] }} </a>
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
        computed: mapState(['lanMap']),
        data(){
            return {
                outbound: {},
                inbound: {},
                interface_data: [],
                modalDialog: false,
                interface_map: {},
                ipaddr: '',
                ipmask: '',
                vlan: ''
            }
        },
        created(){
            this.$http.get('./outbound.json').then(res=>{
                this.outbound = res.data;
                this.interface_data.push(res.data.data);
                this.$http.get('./inbound.json').then(res=>{
                    this.inbound = res.data;
                    this.interface_data = this.interface_data.concat(res.data.data);
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
            // 手动触发change事件时，更新当前组件的data值，触发页面自动更新
            isSelected(node){
                this.ipaddr = this.interface_map[node.target.value].ipaddr;
                this.ipmask = this.interface_map[node.target.value].ipmask;
                this.vlan = this.interface_map[node.target.value].vlan_id || '';
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
}
.clear-btn:active{
    border: 1px solid red;
}
.modal-dialog{
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 500;
}
.cover{
    width:100%;
    height:100%;
    position: fixed;
    top: 0;
    left: 0;
    background: #666;
    opacity: 0.5;
}
.modal-content{
    width:550px;
    height:350px;
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
    margin-left: 20px;
}
.close{
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 60px;
    cursor: pointer;
    background: url('../../assets/close_msg.png') no-repeat;
}
.close:hover{
    background: url('../../assets/close_msg_hover.png') no-repeat;
}
</style>