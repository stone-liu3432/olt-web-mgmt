<template>
    <div>
        <h3>acl mgmt</h3>
        <div v-for="(item,index) in acl_all.data" :key="index" class="acl-item" v-if="acl_all.data">
            <div></div>
            <ul>
                <li>acl id : {{ item.acl_id }}</li>
                <li>rule count : {{ item.rule.length }}</li>
                <li>
                    <span @click="showDetail(item.acl_id)">查看规则详情</span>
                    <span @click="aclMgmt('add')">增加</span>
                    <span>配置</span>
                    <span @click="aclMgmt('delete')">删除</span>
                </li>
            </ul>
            <div v-for="(_item,_index) in item.rule" :key="_index" 
                class="acl-detail">
                <!--  v-if="show_acl_id === item.acl_id" -->
                <div class="column-header">
                    <div>
                        <i class="arrow-up"></i>
                        <i class="arrow-down"></i>
                    </div>
                    <div>
                        {{ 'rule id' }}:{{ _item.rule_id }}
                    </div>
                    <div>
                        <i class="icon-config"></i>
                    </div>
                </div>
                <div class="acl-rule-detail" ref="acl_rule_detail">
                    <span v-for="(__item,__index) in _item" :key="__index"
                        v-if="__index !== 'rule_id' && __index !== 'flags' && !!__item">
                        {{ __index }}&nbsp;:&nbsp;{{ __item }}
                    </span>
                </div>
                <div class="acl-rule-config">
                    <i class="icon-delete" @click="openDeleteModal(item.acl_id, _item.rule_id)"></i>
                </div>
            </div>
        </div>
        <div class="modal-dialog" v-if="isAclMgmt">
            <div class="cover"></div>
            <div class="modal-centent acl-mgmt-modal">
                <h4 class="modal-header" v-if="isAdd">ACL ADD</h4>
                <h4 class="modal-header" v-else>AVL DELETE</h4>
                <div v-if="!isAdd">
                    <span>ACL ID</span>
                    <input type="text" v-focus v-model.number="acl_id"
                        :style="{ 'border-color': IDRangeError(acl_id) && !!acl_id ? 'red' : '' }">
                    -
                    <input type="text" v-model.number="acl_id_e"
                        :style="{ 'border-color': IDRangeError(acl_id_e) && !!acl_id_e ? 'red' : '' }">
                    <span class="acl-tips">Range:2000-5999</span>
                </div>
                <div v-else class="add-acl">
                    <span>ACL ID</span>
                    <input type="text" v-focus v-model.number="acl_id"
                        :style="{ 'border-color': IDRangeError(acl_id) && !!acl_id ? 'red' : '' }">
                    <span class="acl-tips">Range:2000-5999</span>
                </div>
                <div>
                    <a href="javascript:void(0);" v-if="isAdd" @click="addACL">
                        {{ lanMap['apply'] }}
                    </a>
                    <a href="javascript:void(0);" v-else @click="deleteACL">
                        {{ lanMap['apply'] }}
                    </a>
                    <a href="javascript:void(0);" @click="closeAclMgmt">
                        {{ lanMap['cancel'] }}
                    </a>
                </div>
                <div class="close" @click="closeAclMgmt"></div>
            </div>
        </div>
        <div class="modal-dialog">
            <div class="cover"></div>
            <div>
                <div class="acl-rule-config">
                    <h4 class="modal-header">配置</h4>
                    <div>
                        <span>ACL ID</span>
                        <span>{{ this.acl_id }}</span>
                    </div>
                    <div>
                        <span>Rule ID</span>
                        <span>{{ this.rule_id }}</span>
                    </div>
                    <div>
                        <span>规则</span>
                        <select v-model.number="acl_rule_type">
                            <option value="1">基本ACL规则</option>
                            <option value="2">高级ACL规则</option>
                            <option value="3">链路ACL规则</option>
                        </select>
                    </div>
                    <!--   basic
                        "acl_id":2000,
                        "rule_id":1,
                        "action":1,
                        "flags":1,
                        "src_ipaddr":"192.168.1.1"|"any",
                        "src_ipmask":"0.0.0.255",
                        "timerange":"daynight-12-13"
                     -->
                     <!--  advanced 
                        "acl_id":3000,
                        "rule_id":1,
                        "action":1,
                        "flags":1,
                        "protocol":"udp",
                        "src_ipaddr":"192.168.1.1"|"any",
                        "src_ipmask":"0.255.255.255",
                        "dst_ipaddr":"192.168.1.1"|"any",
                        "dst_ipmask":"0.255.255.255",
                        "src_port":"PORT-LIST",
                        "dst_port":"PORT-LIST",
                        "precedence":<0-7>,
                        "dscp":<0-63>,
                        "timerange":"daynight-12-13"
                      -->
                      <!--  link
                        "acl_id":5000,
                        "rule_id":1,
                        "action":1,
                        "flags":1,
                        "type":<0-0xffff>,
                        "cos":<0-7>,
                        "inner_cos":<0-7>,
                        "vlan_id":<1-4094>,
                        "inner_vlan_id":<1-4094>,
                        "src_mac":"AA:BB:CC:DD:EE:FF",
                        "src_mask":"ffff-ffff-ffff",
                        "dst_mac":"AA:BB:CC:DD:EE:FF",
                        "dst_mask":"ffff-ffff-ffff",
                        "timerange":"daynight-12-13"
                       -->
                    <div>
                        <span>action</span>
                        <select>
                            <option value="1">deny</option>
                            <option value="2">permit</option>
                        </select>
                    </div>
                    <div v-if="acl_rule_type === 1 || acl_rule_type === 2">
                        <span>src ipaddress</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 1 || acl_rule_type === 2">
                        <span>src ipmask</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>protocol</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>dst ipaddress</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>dst ipmask</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>src port</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>dst port</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>precedence</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>dscp</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>type</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>cos</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>inner cos</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>vlan id</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>inner vlan id</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>src mac</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>src mask</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>dst mac</span>
                        <span></span>
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>dst mask</span>
                        <span></span>
                    </div>
                    <div>
                        <span>timerange</span>
                        <span></span>
                    </div>
                    <div>
                        <a href="javascript:void(0);">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close"></div>
            </div>
        </div>
        <confirm v-if="isDelete" @choose="deleteModalResult"></confirm>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
const MAX_ACL_ID = 5999,MIN_ACL_ID = 2000;
export default {
    name: 'aclMgmt',
    computed: mapState(['lanMap']),
    data(){
        return {
            show_acl_id: 0,
            acl_id: '',
            acl_id_e: '',
            rule_id: 0,
            acl_rule_type: 1,           // 1 -> basic  2 -> advanced  3 -> link
            //  打开模态框时，缓存的数据
            cache_data: {},
            isAclMgmt: false,
            isDelete: false,
            isAdd: false,
            acl_all: {
                "code":1,
                "message":"success",
                "data":[{
                    "acl_id":2000,
                    "rule":[{
                        "rule_id":1,
                        "action":1,
                        "src_ipaddr":"any",
                        "src_ipmask":"any",
                        "timerange":"name"
                    },{
                        "rule_id":2,
                        "action":2,
                        "src_ipaddr":"any",
                        "src_ipmask":"any",
                        "timerange":"name"
                    },{
                        "rule_id":3,
                        "action":1,
                        "protocol":1,
                        "flags":1,
                        "src_ipaddr":"any",
                        "src_ipmask":"any",
                        "dst_ipaddr":"any",
                        "dst_ipmask":"any",
                        "src_port":1,
                        "dst_port":1,
                        "precedence":1,
                        "dscp":1,
                        "timerange":"name"
                    }]
                },{
                    "acl_id":3000,
                    "rule":[{
                        "rule_id":1,
                        "action":1,
                        "protocol":1,
                        "flags":1,
                        "src_ipaddr":"any",
                        "src_ipmask":"any",
                        "dst_ipaddr":"any",
                        "dst_ipmask":"any",
                        "src_port":1,
                        "dst_port":1,
                        "precedence":1,
                        "dscp":1,
                        "timerange":"name"
                    }]
                },{
                    "acl_id":5000,
                    "rule":[{
                        "rule_id":1,
                        "action":1,
                        "flags":1,
                        "type":0x0806,
                        "cos": 1,
                        "inner_cos": 1,
                        "vlan_id": 1,
                        "inner_vlan_id":2048,
                        "src_mac":"AA:BB:CC:DD:EE:FF",
                        "src_mask":"ffff-ffff-ffff",
                        "dst_mac":"AA:BB:CC:DD:EE:FF",
                        "dst_mask":"ffff-ffff-ffff",
                        "timerange":"name"
                    }]
                }]
            }
        }
    },
    created(){},
    methods: {
        ...mapMutations({
            systemInfo: 'updateSysData'
        }),
        getData(sid, eid, bool){
            if(bool){
                sid = MIN_ACL_ID;
                eid = MAX_ACL_ID;
            }
            this.$http.get('/switch_acl?form=acl',{ params: {
                sacl_id: sid,
                eacl_id: eid
            }}).then(res=>{
                if(res.data.code === 1){
                    this.acl_all = res.data;
                }else{
                    this.acl_all = {};
                }
            }).catch(err=>{

            })
        },
        showDetail(id){
            this.show_acl_id = id;
        },
        openDeleteModal(acl_id,rule_id){
            this.acl_id = acl_id;
            this.rule_id = rule_id;
            this.isDelete = true;
        },
        deleteModalResult(bool){
            if(bool){
                var post_data = {
                    "method": "delete",
                    "param":{
                        "acl_id": this.acl_id,
                        "rule_id": this.rule_id
                    }
                }
                this.$http.post('/switch_acl?form=rule', post_data).then(res=>{
                    if(res.data.code === 1){
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap['delete_ok']
                        })
                        this.acl_all.data.forEach((item, index, arr)=>{
                            if(item.acl_id === this.acl_id){
                                item.rule.forEach((_item, _index, _arr)=>{
                                    if(_item.rule_id === this.rule_id){
                                        item.rule.splice(_index, 1);
                                    }
                                })
                            }
                        })
                    }else if(res.data.code > 1){
                        this.$message({
                            type: res.data.type,
                            text: '(' + res.data.code + ') ' + res.data.message
                        })
                    }
                }).catch(err=>{
                    
                })
            }
            this.isDelete = false;
        },
        aclMgmt(str){
            this.isAclMgmt = true;
            if(str === 'add'){
                this.isAdd = true;
            }else{
                this.isAdd = false;
            }
        },
        closeAclMgmt(){
            this.isAclMgmt = false;
            this.acl_id = '';
            this.acl_id_e = '';
        },
        addACL(){
            if(this.IDRangeError(this.acl_id)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['acl_id_range_error']
                })
                return
            }
            var post_data = {
                "method": "create",
                "param": {
                    "acl_id": this.acl_id
                }
            }
            this.$http.post('/switch_acl?form=acl', post_data).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: ''
                    })
                }else{
                    this.$message({
                        type: 'error',
                        text: ''
                    })
                }
            }).catch(err=>{

            })
            this.closeAclMgmt();
        },
        deleteACL(){
            if(this.IDRangeError(this.acl_id) || this.IDRangeError(THIS.acl_id_e)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['acl_id_range_error']
                })
                return
            }
            var post_data = {
                "method": "delete",
                "param": {
                    "acl_id": this.acl_id > this.acl_id_e ? this.acl_id_e : this.acl_id,
                    "acl_id_e": this.acl_id < this.acl_id_e ? this.acl_id_e : this.acl_id
                }
            }
            this.$http.post('/switch_acl?form=acl', post_data).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: lanMap['delete_ok']
                    })
                }else{
                    this.$message({
                        type: 'error',
                        text: lanMap['delete_fail']
                    })
                }
            }).catch(err=>{

            })
            this.closeAclMgmt();
        },
        IDRangeError(id){
            return id < MIN_ACL_ID || id > MAX_ACL_ID;
        }
    }
}
</script>

<style lang="less" scoped>
h3{
    font-size: 24px;
    font-weight: 600;
    color: #67AEF7;
    margin: 10px 0 20px 0;
}
h3+div.acl-item{
    >ul{
        border-top: 1px solid #ddd;
    }
}
div.acl-item{
    ul{
        height: 36px;
        line-height: 36px;
        border: 1px solid #ddd;
        border-top: none;
        li{
            float: left;
            width: 20%;
            padding-left: 30px;
            border-right: 1px solid #ddd;
            height: inherit;
            line-height: inherit;
            &:last-child{
                border-right: none;
                width: auto;
            }
        }
        &::after{
            content: '';
            display: table;
            clear: both;
        }
    }
    .acl-detail{
        border: 1px solid #ddd;
        border-top: none;
        padding: 10px 0;
        background: #caecda;
        position: relative;
    }
    >ul+div,>div+div{
        >div{
            float: left;
        }
        &::after{
            content: '';
            display: table;
            clear: both;
        }
    }
    i{
        margin: 0 auto;
        display: block;
        width: 18px;
        height: 14px;
        cursor: pointer;
    }
    .column-header{
        position: absolute;
        top: 50%;
        transform: translate(0, -50%);
        width: 150px;
        >div{
            float: left;
            text-align: center;
            height: 28px;
            line-height: 28px;
            &::after{
                content: '';
                display: table;
                clear: both;
            }
            &:first-child{
                width: 36px;
            }
            &:last-child{
                float: right;
                margin-right: 10px;
            }
        }
        i.arrow-up{
            background-position: 24px -4px;
            background-image: url('../../../assets/arrow-sort-up.png');
        }
        i.arrow-down{
            background-position: 24px -10px;
            background-image: url('../../../assets/arrow-sort-down.png'); 
        }
        i.icon-config{
            width: 28px;
            height: 28px;
            background-position: 2px 2px;
            background-image: url('../../../assets/config.png');
            background-repeat: no-repeat;
            &:hover{
                background-image: url('../../../assets/config-hover.png');
            }
        }
    }
    .acl-rule-detail{
        width: 80%;
        margin-left: 160px;
        box-sizing: border-box;
        border-left: 1px solid #ddd;
        >span{
            display: inline-block;
            width: 30%;
            height: 28px;
            line-height: 28px;
            //padding: 0 10px;
        }
    }
    .acl-rule-config{
        width: 32px;
        height: 32px;
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translate(0, -50%);
        i.icon-delete{
            width: 32px;
            height: 32px;
            background-position: 0px 0px;
            background-image: url('../../../assets/delete.png');
            background-repeat: no-repeat;
            &:hover{
                background-image: url('../../../assets/delete-hover.png');
            }
        }
    }
}
div.acl-mgmt-modal{
    height: 175px;
    h4+div{
        margin: 10px 0;
        span{
            display: inline-block;
            width: 140px;
            text-align: center;
            &:first-child{
                width: 100px;
            }
            &:last-child{
                width: 120px;
            }
        }
        input{
            width: 100px;
            margin: 0 10px;
        }
        .acl-tips{
            font-size: 14px;
            color: #666;
        }
    }
    div.add-acl{
        span:first-child{
            width: 150px;
        }
        input{
            width: 180px;
        }
    }
    a{
        margin: 10px 0 0 100px;
    }
}
div.cover+div{
    height: 620px;
}
div.acl-rule-config{
    >div{
        height: 32px;
        margin: 6px 0;
        >span:first-child{
            display: inline-block;
            width: 120px;
            background: #ddd;
            height: 32px;
            line-height: 32px;
            margin: 0 20px 0 30px;
        }
    }
}
</style>
