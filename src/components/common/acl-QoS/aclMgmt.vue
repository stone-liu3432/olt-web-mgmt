<template>
    <div>
        <h3>{{ lanMap['acl_mgmt'] }}</h3>
        <div class="acl-first-item">
            <a href="javascript:void(0);" @click="aclMgmt('add')">{{ lanMap['add'] }} ACL</a>
            <a href="javascript:void(0);" @click="aclMgmt('delete')">{{ lanMap['delete'] }} ACL</a>
        </div>
        <div v-for="(item,index) in acl_show" :key="index" class="acl-item" v-if="acl_show.length">
            <div></div>
            <ul>
                <li>ACL ID : {{ item.acl_id }}</li>
                <li v-if="item.rule && item.rule.length">{{ lanMap['rule_count'] }} : {{ item.rule.length }}</li>
                <li v-else></li>
                <li>
                    <a href="javascript:void(0);" @click="showDetail(item.acl_id)">{{ lanMap['show_rule'] }}</a>
                    <a href="javascript:void(0);" @click="openRuleCfgModal(item)" v-if="item.rule && item.rule.length > 0">{{ lanMap['config'] }}</a>
                    <a href="javascript:void(0);" @click="openRuleAddModal(item)">{{ lanMap['add'] }} Rule</a>
                    <a href="javascript:void(0);" @click="ARPLRule(item)" v-if="show_acl_id === item.acl_id && item.rule && item.rule.length">
                        <span v-if="isARPL">{{ lanMap['save'] }}</span>
                        <span v-else>{{ lanMap['rule_priority'] }}</span>
                    </a>
                </li>
            </ul>
            <div v-for="(_item,_index) in item.rule" :key="_index" 
                class="acl-detail" v-if="show_acl_id === item.acl_id && item.rule && item.rule.length">
                <div class="column-header">
                    <div v-if="isARPL">
                        <i class="arrow-up" @click="swapRulePriority(item, _index, -1)"></i>
                        <i class="arrow-down" @click="swapRulePriority(item, _index, 1)"></i>
                    </div>
                    <div v-else></div>
                    <div>
                        {{ 'RULE ID' }}:{{ _item.rule_id }}
                    </div>
                </div>
                <div class="acl-rule-detail" ref="acl_rule_detail">
                    <span v-if="_item.action">
                        {{ lanMap['action'] }}&nbsp;:&nbsp;{{ _item.action === 1 ? 'deny' : 'permit' }}
                    </span>
                    <span v-for="(__item,__index) in _item" :key="__index"
                        v-if="__index !== 'rule_id' && __index !== 'flags' && __index !== 'action' && !!__item">
                        {{ lanMap[__index] ? lanMap[__index] : __index }}&nbsp;:&nbsp;{{ __item }}
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
                <h4 class="modal-header" v-if="isAddAcl">{{ lanMap['add'] + ' ACL' }}</h4>
                <h4 class="modal-header" v-else>{{ lanMap['delete'] + ' ACL' }}</h4>
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
                    <span>{{ 'ACL ' + lanMap['type'] }}</span>
                    <select v-model.number="acl_type">
                        <option value="1">{{ lanMap['basic'] + 'ACL' }}</option>
                        <option value="2">{{ lanMap['advanced'] + 'ACL' }}</option>
                        <option value="3">{{ lanMap['link'] + 'ACL' }}</option>
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
                    <h4 class="modal-header" v-if="isCfgRule">{{ lanMap['config'] + lanMap['rule'] }}</h4>
                    <h4 class="modal-header" v-if="isAddRule">{{ lanMap['add'] + lanMap['rule'] }}</h4>
                    <div>
                        <span>ACL ID</span>
                        <span>{{ this.acl_id }}</span>
                    </div>
                    <div>
                        <span>Rule ID</span>
                        <select v-if="isCfgRule" v-model.number="rule_id">
                            <option :value="item.rule_id" v-for="(item,index) in cache_data.rule" :key="index">{{ item.rule_id }}</option>
                        </select>
                        <input type="text" v-if="isAddRule" v-model.number="rule_id" v-focus
                            :style="{ 'border-color': rule_id !== '' && (rule_id < 1 || rule_id > 16 || isNaN(rule_id)) ? 'red' : '' }">
                        <span v-if="isAddRule">Range: 1-16</span>
                    </div>
                    <div>
                        <span>{{ 'ACL ' + lanMap['type'] }}</span>
                        <select v-model.number="acl_rule_type" disabled>
                            <option value="1">{{ lanMap['basic'] + 'ACL' + lanMap['rule'] }}</option>
                            <option value="2">{{ lanMap['advanced'] + 'ACL' + lanMap['rule'] }}</option>
                            <option value="3">{{ lanMap['link'] + 'ACL' + lanMap['rule'] }}</option>
                        </select>
                    </div>
                    <div>
                        <span>{{ lanMap['action'] }}</span>
                        <select v-model.number="action">
                            <option value="1">deny</option>
                            <option value="2">permit</option>
                        </select>
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>{{ lanMap['protocol'] }}</span>
                        <input type="text" v-model.trim="protocol" placeholder="icmp/udp/tcp/ip/ipinip"
                            :style="{ 'border-color':  (protocol.toString().toLowerCase() !== 'icmp' && protocol.toString().toLowerCase() !== 'udp' 
                            && protocol.toString().toLowerCase() !== 'tcp' && protocol.toString().toLowerCase() !== 'ip' 
                            && protocol.toString().toLowerCase() !== 'ipinip' ) 
                            && (protocol < 0 || protocol > 255 || isNaN(protocol)) ? 'red' : '' }">
                        <span>0-255({{ lanMap['required'] }})</span>
                    </div>
                    <div v-if="acl_rule_type === 1 || acl_rule_type === 2">
                        <span>{{ lanMap['src_ipaddr'] }}</span>
                        <input type="text" v-model="src_ipaddr" placeholder="127.0.0.1"
                            :style="{ 'border-color': src_ipaddr && (!testIP(src_ipaddr) && src_ipaddr !== '0.0.0.0') ? 'red' : '' }">
                    </div>
                    <div v-if="acl_rule_type === 1 || acl_rule_type === 2">
                        <span>{{ lanMap['ipmask'] }}</span>
                        <input type="text" v-model="src_ipmask" :disabled="src_ipaddr === ''" placeholder="0.0.0.255"
                            :style="{ 'border-color': src_ipmask && (!testIP(src_ipmask) && src_ipaddr !== '0.0.0.0') ? 'red' : '' }">
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>{{ lanMap['dst_ipaddr'] }}</span>
                        <input type="text" v-model="dst_ipaddr" placeholder="127.0.0.1"
                            :style="{ 'border-color':  dst_ipaddr && !testIP(dst_ipaddr) ? 'red' : ''}">
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>{{ lanMap['ipmask'] }}</span>
                        <input type="text" v-model="dst_ipmask" :disabled="dst_ipaddr === ''" placeholder="0.0.0.255"
                            :style="{ 'border-color': dst_ipaddr !== '' && dst_ipmask !== '' && !testIP(dst_ipmask) ? 'red' : '' }">
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>{{ lanMap['src_port'] }}</span>
                        <input type="text" v-model="src_port" :disabled="protocol.toString().toLowerCase() === 'icmp'"
                            :style="{ 'border-color': src_port !== '' && !reg.test(src_port) ? 'red' : '' }">
                        <span>Range: 0-65535</span>
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>{{ lanMap['dst_port'] }}</span>
                        <input type="text" v-model="dst_port" :disabled="protocol.toString().toLowerCase() === 'icmp'"
                            :style="{ 'border-color': dst_port !== '' && !reg.test(dst_port) ? 'red' : '' }">
                        <span>Range: 0-65535</span>
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>{{ lanMap['precedence'] }}</span>
                        <input type="text" v-model.number="precedence" :disabled="!!dscp"
                            :style="{ 'border-color': precedence < 0 || precedence > 7 || isNaN(precedence) ? 'red' : '' }">
                        <span>Range: 0-7</span>
                    </div>
                    <div v-if="acl_rule_type === 2">
                        <span>{{ lanMap['dscp'] }}</span>
                        <input type="text" v-model.number="dscp" :disabled="!!precedence"
                            :style="{ 'border-color': dscp < 0 || dscp > 255 || isNaN(dscp) ? 'red' : '' }">
                        <span>Range: 0-63</span>
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>{{ lanMap['eth_type'] }}</span>
                        <input type="text" v-model="eth_type"
                            :style="{ 'border-color': eth_type < 0 || eth_type > 0xffff || isNaN(eth_type) ? 'red' : '' }">
                        <span>Range: 0x0-0xffff</span>
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>{{ lanMap['cos'] }}</span>
                        <input type="text" v-model.number="cos"
                            :style="{ 'border-color': cos < 0 || cos > 7 || isNaN(cos) ? 'red' : '' }">
                        <span>Range: 0-7</span>
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>{{ lanMap['inner_cos'] }}</span>
                        <input type="text" v-model.number="inner_cos"
                            :style="{ 'border-color': inner_cos < 0 || inner_cos > 7 || isNaN(inner_cos) ? 'red' : '' }">
                        <span>Range: 0-7</span>
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>{{ lanMap['vlan_id'] }}</span>
                        <input type="text" v-model.number="vlan_id"
                            :style="{ 'border-color': vlan_id !== '' && (vlan_id < 1 || vlan_id > 4094 || isNaN(vlan_id)) ? 'red' : '' }">
                        <span>Range: 1-4094</span>
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>{{ lanMap['inner_vlan_id'] }}</span>
                        <input type="text" v-model.number="inner_vlan_id"
                            :style="{ 'border-color': inner_vlan_id !== '' && (inner_vlan_id < 1 || inner_vlan_id > 4094 || isNaN(inner_vlan_id)) ? 'red' : '' }">
                        <span>Range: 1-4094</span>
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>{{ lanMap['src_mac'] }}</span>
                        <input type="text" v-model="src_mac" placeholder="0000-0000-0000"
                            :style="{ 'border-color': src_mac !== '' &&  !testMac(src_mac) ? 'red' : ''}">
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>{{ lanMap['src_mask'] }}</span>
                        <input type="text" v-model="src_mask" :disabled="src_mac === ''" placeholder="0000-0000-ffff"
                            :style="{ 'border-color': src_mask !== '' && !testMacMask(src_mask) ? 'red' : '' }">
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>{{ lanMap['dst_mac'] }}</span>
                        <input type="text" v-model="dst_mac" placeholder="0000-0000-0000"
                            :style="{ 'border-color': dst_mac !== '' && !testMac(dst_mac) ? 'red' : '' }">
                    </div>
                    <div v-if="acl_rule_type === 3">
                        <span>{{ lanMap['dst_mask'] }}</span>
                        <input type="text" v-model="dst_mask" :disabled="dst_mac === ''" placeholder="0000-0000-ffff"
                            :style="{ 'border-color': dst_mask !== '' && !testMacMask(dst_mask) ? 'red' : '' }">
                    </div>
                    <div>
                        <span>{{ lanMap['timerange'] }}</span>
                        <select v-model="timerange">
                            <option value=""> - </option>
                            <option :value="item.name" v-for="(item, index) in time_range.data" :key="index">{{ item.name }}</option>
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
        <customPagination v-if="isShowPagination" :pages-data="pagesData"
            @updatePage="changePage">
        </customPagination>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
import { testIPAddr,testMACAddr,testMACMask } from '../../../utils/common'
import customPagination from '../pagination'
const MAX_ACL_ID = 5999, MIN_ACL_ID = 2000;
let limit = 20;
export default {
    name: 'aclMgmt',
    computed: mapState(['lanMap', 'change_url', 'time_range']),
    components: { customPagination },
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
            isARPL: false,
            reg: /^[\d\-,]+$/,
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
            eth_type: '',
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
            //  分页组件数据
            pagesData: {},
            //  当前展示的数据
            acl_show: [],
            isShowPagination: false,
            acl_all: {},
        }
    },
    created(){
        this.getData(MIN_ACL_ID, MAX_ACL_ID, true);
        this.getTimeRange();
    },
    methods: {
        ...mapMutations({
            updateTimeRange: 'updateTimeRange'
        }),
        getData(sid, eid, bool){
            if(bool){
                sid = MIN_ACL_ID;
                eid = MAX_ACL_ID;
            }
            this.$http.get(this.change_url.get_acl,{ params: {
                sacl_id: sid,
                eacl_id: eid
            }}).then(res=>{
                if(res.data.code === 1){
                    this.acl_all = res.data;
                    let count = res.data.data.length;
                    this.pagesData = {
                        count: count,
                        limit: limit
                    }
                    if(count > limit){
                        this.isShowPagination = true;
                        this.acl_show = res.data.data.slice(0, limit);
                    }else{
                        this.acl_show = res.data.data;
                    }
                }else{
                    this.acl_all = {};
                }
            }).catch(err=>{

            })
        },
        getTimeRange(){
            this.$http.get(this.change_url.get_timerange).then(res=>{
                if(res.data.code === 1){
                    this.updateTimeRange(res.data);
                    if(res.data.data && res.data.data.length >= 0){
                        this.timerange = res.data.data[0].name;
                    }
                }
            }).catch(err=>{
                // to do
            })
        },
        showDetail(id){
            //  如果已经打开，则关闭
            this.isARPL = false;
            if(this.show_acl_id === id){
                this.show_acl_id = 0;
                return
            }
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
                        this.getData(0, 0, true);
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
                        text: this.lanMap['add'] + this.lanMap['st_success']
                    })
                    this.getData(0, 0, true);
                }else{
                    this.$message({
                        type: 'error',
                        text: '(' + res.data.code + ')' + res.data.message
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
                    this.getData(MIN_ACL_ID, MAX_ACL_ID, true);
                }else{
                    this.$message({
                        type: 'error',
                        text: '(' + res.data.code + ')' + res.data.message
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
        testMacMask(str){
            return testMACMask(str);
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
            this.timerange = '';
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
            if(this.time_range.data && this.time_range.data.length >= 0){
                this.timerange = this.time_range.data[0].name;
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
            this.eth_type = '';
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
            if(this.rule_id < 1 || this.rule_id > 16 || isNaN(this.rule_id)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + 'Rule ID'
                })
                return
            }
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
        //  基础ACL配置Rule
        cfgBasicRule(){
            var flags = 0x0, n = 0;
            if(!this.testIP(this.src_ipaddr)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['src_ipaddr']
                })
                return
            }
            if(this.src_ipaddr !== ''){
                flags |= 1 << n;
            }
            n++;
            if(!this.testIP(this.src_ipmask) && this.src_ipaddr !== '0.0.0.0'){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['src_ipmask']
                })
                return;
            }
            if(this.timerange !== ''){
                flags |= 1 << n;
            }
            if(!flags){
                this.$message({
                    type: 'info',
                    text: this.lanMap['modify_tips']
                })
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
                    "timerange": this.timerange
                }
            }
            this.$http.post('/switch_acl?form=rule', post_data).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['setting_ok']
                    })
                    this.getData(MIN_ACL_ID, MAX_ACL_ID, true);
                }else{
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ')' + res.data.message
                    })
                }
            }).catch(err=>{

            })
            this.closeRuleModal();
        },
        //  高级ACL配置Rule
        cfgAdvancedRule(){
            var flags = 0x1, n = 0;
            if(((this.protocol.toString().toLowerCase() !== 'icmp' && this.protocol.toString().toLowerCase() !== 'udp' 
                && this.protocol.toString().toLowerCase() !== 'tcp' && this.protocol.toString().toLowerCase() !== 'ip' 
                && this.protocol.toString().toLowerCase() !== 'ipinip' ) && 
                (this.protocol < 0 || this.protocol > 255 || isNaN(this.protocol))) || this.protocol === ''){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['protocol']
                })
                return
            }
            flags |= 1 << n;
            n++;
            if(this.protocol.toString().toLowerCase() === 'icmp'){
                this.src_port = '';
                this.dst_port = '';
            }
            if(this.src_ipaddr !== '' && !this.testIP(this.src_ipaddr)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['src_ipaddr']
                })
                return
            }
            if(this.src_ipaddr !== ''){
                flags |= 1 << n;
            }
            n++;
            if(this.src_ipaddr !== '' && this.src_ipmask !== '' && !this.testIP(this.src_ipmask)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['src_ipmask']
                })
                return
            }
            if(this.dst_ipaddr !== '' && !this.testIP(this.dst_ipaddr)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['dst_ipaddr']
                })
                return
            }
            if(this.dst_ipaddr !== ''){
                flags |= 1 << n;
            }
            n++;
            if(this.dst_ipaddr !== '' && this.dst_ipmask !== '' && !this.testIP(this.dst_ipmask)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['dst_ipmask']
                })
                return
            }
            var reg = /^[\d\-,]+$/;
            if(this.src_port !== '' && !reg.test(this.src_port)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['src_port']
                })
                return
            }
            if(this.src_port !== ''){
                flags |= 1 << n;
            }
            n++;
            if(this.dst_port !== '' && !reg.test(this.dst_port)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['dst_port']
                })
                return
            }
            if(this.dst_port !== ''){
                flags |= 1 << n;
            }
            n++;
            if(this.precedence) this.dscp = '';
            if(this.dscp) this.precedence = '';
            if(this.precedence < 0 || this.precedence > 7 || isNaN(this.precedence)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['precedence']
                })
                return
            }
            if(this.precedence !== ''){
                flags |= 1 << n;
            }
            n++;
            if(this.dscp < 0 || this.dscp > 255 || isNaN(this.dscp)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['dscp']
                })
                return
            }
            if(this.dscp !== ''){
                flags |= 1 << n;
            }
            n++;
            if(this.timerange !== ''){
                flags |= 1 << n;
            }
            if(!flags){
                this.$message({
                    type: 'info',
                    text: this.lanMap['modify_tips']
                })
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
            this.$http.post('/switch_acl?form=rule', post_data).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['setting_ok']
                    })
                    this.getData(MIN_ACL_ID, MAX_ACL_ID, true);
                }else{
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ')' + res.data.message
                    })
                }
            }).catch(err=>{

            })
            this.closeRuleModal();
        },
        //  链路ACL配置Rule
        cfgLinkRule(){
            var flags = 0x0,n = 0;
            if(this.eth_type < 0 || this.eth_type > 0xffff || isNaN(this.eth_type)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['eth_type']
                })
                return
            }
            if(this.eth_type !== ''){
                flags |= 1 << n;
            }
            n++;
            if(this.cos < 0 || this.cos > 7 || isNaN(this.cos)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': cos'
                })
                return
            }
            if(this.cos !== ''){
                flags |= 1 << n;
            }
            n++;
            if(this.inner_cos !== '' && (this.inner_cos < 0 || this.inner_cos > 7 || isNaN(this.inner_cos))){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['inner_cos']
                })
                return
            }
            if(this.inner_cos !== ''){
                flags |= 1 << n;
            }
            n++;
            if(this.vlan_id !== '' && (this.vlan_id < 1 || this.vlan_id > 4094 || isNaN(this.vlan_id))){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['vlan_id']
                })
                return
            }
            if(this.vlan_id !== ''){
                flags |= 1 << n;
            }
            n++;
            if(this.inner_vlan_id !== '' && (this.inner_vlan_id < 1 || this.inner_vlan_id > 4094 || isNaN(this.inner_vlan_id))){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['inner_vlan_id']
                })
                return
            }
            if(this.inner_vlan_id !== ''){
                flags |= 1 << n;
            }
            n++;
            if(!testMACAddr(this.src_mac)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['src_mac']
                })
                return
            }
            if(this.src_mac !== ''){
                flags |= 1 << n;
            }
            n++;
            if(!testMACMask(this.src_mask)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['src_mask']
                })
                return
            }
            if(!testMACAddr(this.dst_mac)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['dst_mac']
                })
                return
            }
            if(this.dst_mac !== ''){
                flags |= 1 << n;
            }
            n++;
            if(!testMACMask(this.dst_mask)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['dst_mask']
                })
                return
            }
            if(this.timerange !== ''){
                flags |= 1 << n;
            }
            if(!flags){
                this.$message({
                    type: 'info',
                    text: this.lanMap['modify_tips']
                })
                return
            }
            var post_data = {
                "method": "set",
                "param":{
                    "acl_id": this.acl_id,
                    "rule_id": this.rule_id,
                    "action": this.action,
                    "flags": flags,
                    "eth_type": Number(this.eth_type),
                    "cos": this.cos,
                    "inner_cos": this.inner_cos,
                    "vlan_id": this.vlan_id,
                    "inner_vlan_id": this.inner_vlan_id,
                    "src_mac": this.src_mac,
                    "src_mask": this.src_mask,
                    "dst_mac": this.dst_mac,
                    "dst_mask": this.dst_mask,
                    "timerange": this.timerange
                }
            }
            this.$http.post('/switch_acl?form=rule', post_data).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['setting_ok']
                    })
                    this.getData(MIN_ACL_ID, MAX_ACL_ID, true);
                }else{
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ')' + res.data.message
                    })
                }
            }).catch(err=>{

            })
            this.closeRuleModal();
        },
        //  交换rule list顺序   flag:  -1 - previous  1 - next
        swapRulePriority(node, index, flag){
            if(index === 0 && flag === -1){
                return
            }
            if(index === node.rule.length - 1 && flag === 1){
                return
            }
            if(flag === 1){
                var _node = node.rule[index], next = node.rule[index + 1];
                this.$set(node.rule, index, next);
                this.$set(node.rule, index + 1, _node);
            }
            if(flag === -1){
                var _node = node.rule[index], prev = node.rule[index - 1];
                this.$set(node.rule, index, prev);
                this.$set(node.rule, index - 1, _node);
            }
        },
        changePage(index){
            let start = limit * (index - 1), end = limit * index;
            (end > this.acl_all.data.length) && (end = this.acl_all.data.length);
            this.acl_show = this.acl_all.data.slice(start, end);
        },
        ARPLRule(node){
            if(this.isARPL){
                var rules = [];
                node.rule.forEach((item, index)=>{
                    rules.push(item.rule_id);
                })
                var post_data = {
                    "method": "modify",
                    "param":{
                        "acl_id": node.acl_id,
                        "new_rule_id": rules
                    }
                }
                this.$http.post('/switch_acl?form=rulepri', post_data).then(res=>{
                    if(res.data.code === 1){
                        this.$message({
                            type: 'success',
                            text: this.lanMap['setting_ok']
                        })
                        this.getData(MIN_ACL_ID, MAX_ACL_ID, true);
                    }else{
                        this.$message({
                            type: res.data.type,
                            text: '(' + res.data.code + ')' + res.data.msg
                        })
                    }
                }).catch(err=>{

                })
            }
            this.isARPL = !this.isARPL;
        }
    },
    watch: {
        'rule_id'(){
            if(this.isCfgRule && this.cache_data.rule){
                this.cache_data.rule.forEach(item =>{
                    if(item.rule_id === this.rule_id){
                        this.timerange_cache = item.timerange;
                        Object.keys(item).forEach(key =>{
                            this[key] = item[key];
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
div.acl-first-item{
    margin: 8px 0 8px 10px;
    >a+a{
        margin: 0 0 0 20px;
    }
}
div.acl-first-item + div{
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
            width: 15%;
            padding-left: 30px;
            border-right: 1px solid #ddd;
            height: inherit;
            line-height: inherit;
            &:last-child{
                border-right: none;
                width: auto;
            }
            a{
                padding: 0 15px;
                vertical-align: baseline;
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
        position: relative;
    }
    .acl-detail:nth-of-type(even){
        background: #caecda;
        .acl-rule-detail{
            border-color: #ccc;
        }
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
        }
        i.arrow-up{
            background-position: 24px -6px;
            background-image: url('../../../assets/arrow-sort-up.png');
        }
        i.arrow-down{
            background-position: 24px -11px;
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
        border-left: 1px solid #d0d0d0;
        padding: 0 0 0 6px;
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
            width: 125px;
            height: 32px;
            line-height: 32px;
            margin: 0 15px 0 30px;
        }
        a{
            margin: 10px 0 0 100px;
        }
    }
    input+span{
        display: inline-block;
        font-size: 14px;
        color: #333;
        margin-left: 4px;
    }
}
</style>
