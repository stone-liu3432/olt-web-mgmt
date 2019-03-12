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
                    <span @click="openRuleCfgModal(item)" v-if="item.rule && item.rule.length > 0">配置</span>
                    <span @click="aclMgmt('delete')">删除</span>
                    <span @click="openRuleAddModal(item)">增加Rule</span>
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
            <div class="modal-centent acl-mgmt-modal" :style="{ 'height': isAddAcl ? '210px' : '' }">
                <h4 class="modal-header" v-if="isAddAcl">ACL ADD</h4>
                <h4 class="modal-header" v-else>AVL DELETE</h4>
                <div v-if="!isAddAcl">
                    <span>ACL ID</span>
                    <input type="text" v-focus v-model.number="acl_id"
                        :style="{ 'border-color': IDRangeError(acl_id) && !!acl_id ? 'red' : '' }">
                    -
                    <input type="text" v-model.number="acl_id_e"
                        :style="{ 'border-color': IDRangeError(acl_id_e) && !!acl_id_e ? 'red' : '' }">
                    <span class="acl-tips">Range:2000-5999</span>
                </div>
                <div v-if="isAddAcl" class="add-acl">
                    <span>ACL type</span>
                    <select v-model.number="acl_type">
                        <option value="1">Basic ACL</option>
                        <option value="2">Advanced ACL</option>
                        <option value="3">Link ACL</option>
                    </select>
                </div>
                <div  v-if="isAddAcl" class="add-acl">
                    <span>ACL ID</span>
                    <input type="text" v-focus v-model.number="acl_id"
                        :style="{ 'border-color': IDRangeError(acl_id) && !!acl_id ? 'red' : '' }">
                    <span class="acl-tips" v-if="acl_type === 1">Range:2000-2999</span>
                    <span class="acl-tips" v-if="acl_type === 2">Range:3000-4999</span>
                    <span class="acl-tips" v-if="acl_type === 3">Range:5000-5999</span>
                </div>
                <div>
                    <a href="javascript:void(0);" v-if="isAddAcl" @click="addACL">
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
        <div class="modal-dialog" v-if="isCfgRule || isAddRule">
            <div class="cover"></div>
            <div :style="{ 'height': acl_rule_type === 1 ? '390px' : '' }">
                <div class="acl-rule-config">
                    <h4 class="modal-header">配置</h4>
                    <div>
                        <span>ACL ID</span>
                        <span>{{ this.acl_id }}</span>
                    </div>
                    <div>
                        <span>Rule ID</span>
                        <select v-if="isCfgRule" v-model.number="rule_id">
                            <option :value="item.rule_id" v-for="(item,index) in cache_data.rule" :key="index">{{ item.rule_id }}</option>
                        </select>
                        <input type="text" v-if="isAddRule" v-model="rule_id" v-focus>
                        <span v-if="isAddRule">Range: 1-16</span>
                    </div>
                    <div>
                        <span>规则</span>
                        <select v-model.number="acl_rule_type" disabled>
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
                        "src_ipaddr":"192.168.1.1",
                        "src_ipmask":"0.0.0.255",
                        "timerange":"daynight-12-13"
                     -->
                     <!--  advanced 
                        "acl_id":3000,
                        "rule_id":1,
                        "action":1,
                        "flags":1,
                        "protocol":"udp",
                        "src_ipaddr":"192.168.1.1",
                        "src_ipmask":"0.255.255.255",
                        "dst_ipaddr":"192.168.1.1",
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
                        <select v-model.number="action">
                            <option value="1">deny</option>
                            <option value="2">permit</option>
                        </select>
                    </div>
                    <div v-if="acl_rule_type === 1 || acl_rule_type === 2">
                        <span>src ipaddress</span>
                        <input type="text" v-model="src_ipaddr">
                    </div>
                    <div v-if="acl_rule_type === 1 || acl_rule_type === 2">
                        <span>src ipmask</span>
                        <input type="text" v-model="src_ipmask">
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>protocol</span>
                        <input type="text" v-model.trim="protocol">
                        <span>Rang: 0-255</span>
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>dst ipaddress</span>
                        <input type="text" v-model="dst_ipaddr">
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>dst ipmask</span>
                        <input type="text" v-model="dst_ipmask">
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>src port</span>
                        <input type="text" v-model="src_port">
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>dst port</span>
                        <input type="text" v-model="dst_port">
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>precedence</span>
                        <input type="text" v-model="precedence">
                        <span>Range: 0-7</span>
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>dscp</span>
                        <input type="text" v-model="dscp">
                        <span>Range: 0-63</span>
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>type</span>
                        <input type="text" v-model="type">
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>cos</span>
                        <input type="text" v-model="cos">
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>inner cos</span>
                        <input type="text" v-model="inner_cos">
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>vlan id</span>
                        <input type="text" v-model="vlan_id">
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>inner vlan id</span>
                        <input type="text" v-model="inner_vlan_id">
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>src mac</span>
                        <input type="text" v-model="src_mac">
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>src mask</span>
                        <input type="text" v-model="src_mask">
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>dst mac</span>
                        <input type="text" v-model="dst_mac">
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>dst mask</span>
                        <input type="text" v-model="dst_mask">
                    </div>
                    <div>
                        <span>timerange</span>
                        <select v-model="timerange">
                            <option value=""></option>
                        </select>
                    </div>
                    <div>
                        <a href="javascript:void(0);" @click="submitModify">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="closeRuleModal">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="closeRuleModal"></div>
            </div>
        </div>
        <confirm v-if="isDeleteAcl" @choose="deleteModalResult"></confirm>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
import { testIPAddr,testMACAddr } from '../../../utils/common'
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
            acl_type: 1,
            acl_rule_type: 1,           // 1 -> basic  2 -> advanced  3 -> link
            //  打开模态框时，缓存的数据
            cache_data: {},
            //  模态框打开或关闭
            isAclMgmt: false,
            isDeleteAcl: false,
            isAddAcl: false,
            isCfgRule: false,
            isAddRule: false,
            //  增加或配置rlue规则时的数据
            action: 1,
            src_ipaddr: '',
            src_ipmask: '',
            dst_ipaddr: '',
            dst_ipmask: '',
            src_port: '',
            dst_port: '',
            precedence: '',
            protocol: '',
            dscp: '',
            type: '',
            cos: '',
            inner_cos: '',
            vlan_id: '',
            inner_vlan_id: '',
            src_mac: '',
            dst_mac: '',
            src_mask: '',
            dst_mask: '',
            timerange: '',
            //  timerange缓存，用于flags变更
            timerange_cache: '',
            rule_cache: {},
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
                        "timerange":"basic"
                    },{
                        "rule_id":2,
                        "action":2,
                        "src_ipaddr":"any",
                        "src_ipmask":"any",
                        "timerange":"advanced"
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
                        "timerange":"link"
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
        openDeleteModal(acl_id, rule_id){
            this.acl_id = acl_id;
            this.rule_id = rule_id;
            this.isDeleteAcl = true;
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
            this.isDeleteAcl = false;
        },
        aclMgmt(str){
            this.isAclMgmt = true;
            if(str === 'add'){
                this.isAddAcl = true;
                this.acl_id = '';
            }else{
                this.isAddAcl = false;
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
            if(this.IDRangeError(this.acl_id) || this.IDRangeError(this.acl_id_e)){
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
            if(this.acl_type === 1){
                return id < 2000 || id > 2999;
            }
            if(this.acl_type === 2){
                return id < 3000 || id > 4999;
            }
            if(this.acl_type === 3){
                return id < 5000 || id > 5999;
            }
        },
        testIP(str){
            return testIPAddr(str);
        },
        testMac(str){
            return testMACAddr(str);
        },
        openRuleCfgModal(node){
            if(!node) return
            this.isCfgRule = true;
            this.cache_data = node;
            this.acl_id = node.acl_id;
            if(node.rule && node.rule.length > 0){
                this.rule_id = node.rule[0].rule_id;
            }
            this.ruleType();
        },
        openRuleAddModal(node){
            this.isAddRule = true;
            this.acl_id = node.acl_id;
            this.rule_id = '';
            this.ruleType();
        },
        ruleType(){
            if(this.acl_id < 3000){
                this.acl_rule_type = 1;
            }
            if(this.acl_id >= 3000 && this.acl_id < 5000){
                this.acl_rule_type = 2;
            }
            if(this.acl_id >= 5000){
                this.acl_rule_type = 3;
            }
        },
        closeRuleModal(){
            this.isCfgRule = false;
            this.isAddRule = false;
            this.acl_id = '';
            this.rule_id = '';
            this.action = 1;
            this.src_ipaddr = '';
            this.src_ipmask = '';
            this.dst_ipaddr = '';
            this.dst_ipmask = '';
            this.src_port = '';
            this.dst_port = '';
            this.precedence = '';
            this.protocol = '';
            this.dscp = '';
            this.type = '';
            this.cos = '';
            this.inner_cos = '';
            this.vlan_id = '';
            this.inner_vlan_id = '';
            this.src_mac = '';
            this.dst_mac = '';
            this.src_mask = '';
            this.dst_mask = '';
            this.timerange = '';
        },
        submitModify(){
            if(this.acl_rule_type === 1){
                this.cfgBasicRule();
            }
            if(this.acl_rule_type === 2){
                this.cfgAdvancedRule();
            }
            if(this.acl_rule_type === 3){
                this.cfgLinkRule();
            }
        },
        cfgBasicRule(){
            var flags = 0;
            // flags:
            // 0x01 – src ip
            // 0x02—timerange
            if(!this.testIP(this.src_ipaddr) && this.src_ipaddr !== '0.0.0.0'){
                this.$message({
                    type: 'error',
                    text: 'ipaddress error'
                })
                return
            }
            flags += 1;
            if(!this.testIP(this.src_ipmask) && this.src_ipaddr !== '0.0.0.0'){
                this.$message({
                    type: 'error',
                    text: 'ip mask error'
                })
                return;
            }
            if(this.timerange_cache !== this.timerange){
                flags += 2;
            }
            var post_data = {
                "method": "set",
                "param":{
                    "acl_id": this.acl_id,
                    "rule_id": this.rule_id,
                    "action": this.action,
                    "flags": flags,
                    "src_ipaddr": this.src_ipaddr,
                    "src_ipmask": this.src_ipmask,
                    "timerange": "daynight-12-13"
                }
            }
            this.$http.post('/switch_acl?form=basic-rule', post_data).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: ''
                    })
                }else{
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ')' + res.data.message
                    })
                }
            }).catch(err=>{

            })
        },
        cfgAdvancedRule(){
            // Flags:
            // 0x0—不关注protocol之后的参数
            // icmp|udp|tcp|ip|ipinip|<0-255>
            // 当协议为ICMP时： 不关注src-port，dst-port这两个参数
            // PROTOCOL参数 必选，
            // precedence和dscp二选一
            // 0x01—src ip
            // 0x02—dst ip
            // 0x04—src port
            // 0x08—dst port
            // 0x10—precedence
            // 0x20—dscp 
            // 0x40—timerage 
            var flags = 0;
            if((this.protocol < 0 || this.protocol > 255 || isNaN(this.protocol)) &&
                (this.protocol.toLowerCase !== 'icmp' && this.protocol.toLowerCase() !== 'udp' 
                && this.protocol.toLowerCase() !== 'tcp' && this.protocol.toLowerCase() !== 'ip' 
                && this.protocol.toLowerCase() !== 'ipinip' )){
                this.$message({
                    type: 'error',
                    text: ''
                })
                return
            }
            if(this.protocol.toLowerCase() === 'icmp'){
                this.src_port = '';
                this.dst_port = '';
            }
            if(this.src_ipaddr !== '' && !this.testIP(this.src_ipaddr)){
                this.$message({
                    type: 'error',
                    text: ''
                })
                return
            }
            if(this.src_ipaddr !== '' && this.src_ipmask !== '' && !this.testIP(this.src_ipmask)){
                this.$message({
                    type: 'error',
                    text: ''
                })
                return
            }
            if(this.dst_ipaddr !== '' && !this.testIP(this.dst_ipaddr)){
                this.$message({
                    type: 'error',
                    text: ''
                })
                return
            }
            if(this.dst_ipaddr !== '' && this.dst_ipmask !== '' && this.testIP(this.dst_ipmask)){
                this.$message({
                    type: 'error',
                    text: ''
                })
                return
            }
            var reg = /^[\d\-,]+$/;
            if(this.src_port !== '' && !reg.test(this.src_port)){
                this.$message({
                    type: 'error',
                    text: ''
                })
                return
            }
            if(this.dst_port !== '' && !reg.test(this.dst_port)){
                this.$message({
                    type: 'error',
                    text: ''
                })
                return
            }
            if(this.precedence) this.dscp = '';
            if(this.dscp) this.precedence = '';
            if(this.precedence < 0 || this.precedence > 7 || isNaN(this.precedence)){
                this.$message({
                    type: 'error',
                    text: ''
                })
                return
            }
            if(this.dscp < 0 || this.dscp > 255 || isNaN(this.dscp)){
                this.$message({
                    type: 'error',
                    text: ''
                })
                return
            }
            var post_data = {
                "method": "set",
                "param": {
                    "acl_id": this.acl_id,
                    "rule_id": this.rule_id,
                    "action": this.action,
                    "flags": flags,
                    "protocol": this.protocol,
                    "src_ipaddr": this.src_ipaddr,
                    "src_ipmask": this.src_ipmask,
                    "dst_ipaddr": this.dst_ipaddr,
                    "dst_ipmask": this.dst_ipmask,
                    "src_port": this.src_port,
                    "dst_port": this.dst_port,
                    "precedence": this.precedence,
                    "dscp": this.dscp,
                    "timerange": this.timerange
                }
            }
            this.$http.post('/switch_acl?form=adv-rule', post_data).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: ''
                    })
                }else{
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ')' + res.data.message
                    })
                }
            }).catch(err=>{

            })
        },
        cfgLinkRule(){
            // Flags:
            // 0x01—type
            // 0x02—cos
            // 0x04—inner-cos
            // 0x08—vlan
            // 0x10—inner-vlan
            // 0x20—src-mac
            // 0x40—dst-mac
            // 0x80--timerange
            var flags = 0;
            var post_data = {
                "method": "set",
                "param":{
                    "acl_id": 5000,
                    "rule_id": 1,
                    "action": 1,
                    "flags": 1,
                    "type": '<0-0xffff>',
                    "cos": '<0-7>',
                    "inner_cos": '<0-7>',
                    "vlan_id": '<1-4094>',
                    "inner_vlan_id": '<1-4094>',
                    "src_mac": "AA:BB:CC:DD:EE:FF",
                    "src_mask": "ffff-ffff-ffff",
                    "dst_mac": "AA:BB:CC:DD:EE:FF",
                    "dst_mask": "ffff-ffff-ffff",
                    "timerange": "daynight-12-13"
                }
            }
            this.$http.post('/switch_acl?form=link-rule', post_data).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: ''
                    })
                }else{
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ')' + res.data.message
                    })
                }
            }).catch(err=>{

            })
        }
    },
    watch: {
        'rule_id'(){
            if(this.isCfgRule && this.cache_data.rule){
                this.cache_data.rule.forEach(item=>{
                    if(item.rule_id === this.rule_id){
                        this.timerange_cache = item.timerange;
                        Object.keys(item).forEach(key=>{
                            this[key] = item[key];
                            this.rule_cache[key] = item[key];
                        })
                    }
                })
            }
        }
    }
}
</script>

<style lang="less" scoped>
select{
    width: 180px;
}
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
div.cover+div.acl-mgmt-modal{
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
        span:first-child{
            width: 150px;
        }
        input{
            width: 180px;
        }
        .acl-tips{
            font-size: 14px;
            color: #666;
        }
    }
    a{
        margin: 10px 0 0 105px;
    }
}
div.cover+div{
    height: 650px;
}
div.acl-rule-config{
    >div{
        height: 32px;
        margin: 6px 0;
        >span:first-child{
            display: inline-block;
            width: 120px;
            height: 32px;
            line-height: 32px;
            margin: 0 20px 0 30px;
        }
        a{
            margin: 10px 0 0 100px;
        }
    }
    input+span{
        display: inline-block;
        font-size: 14px;
        color: #333;
        margin-left: 10px;
    }
}
</style>
