<template>
    <div>
        <loading v-if="!mac_age.data && !cfg_age && !tab"></loading>
        <div>
            <h2>{{ lanMap['mac_mgmt'] }}</h2>
        </div>
        <div v-if="mac_age.data" class="mac-age">
            <span>{{ lanMap['age'] }} : </span>
            <span>{{ mac_age.data.age }}</span>
            <a href="javascript:;" @click="change_macage">{{ lanMap['config'] }}</a>
        </div>
        <div class="mac-age" v-if="cfg_age">
            <span>{{ lanMap['age'] }} : </span>
            <input type="text" v-model.number="macage" placeholder="secends" v-focus>
            <span class="tips">range: 0 , 10-1000000</span>
            <a href="javascript:;" @click="macage_choose(true)">{{ lanMap['apply'] }}</a>
            <a href="javascript:;" @click="macage_choose(false)">{{ lanMap['cancel'] }}</a>
        </div>
        <hr>
        <div class="query-select">
            <p>{{ lanMap['detail'] }}</p>
            <div>
                <a href="javascript:;" @click="add_mac_dialog">{{ lanMap['add_mac'] }}</a>
                <a href="javascript:;" @click="flush_mac_dialog">{{ lanMap['flush_mac'] }}</a>
            </div>
            <div class="query-frame">
                <span>{{ lanMap['query_method'] }}：</span>
                <select v-model.number="flag">
                    <option value="1">{{ lanMap['mac_type'] }}</option>
                    <option value="2">{{ lanMap['port_id'] }}</option>
                    <option value="4">{{ lanMap['vlan_id'] }}</option>
                    <option value="8">{{ lanMap['macaddr'] }}</option>
                </select>
            </div>
            <div v-if="choose_macaddr" class="query-frame">
                <span>{{ lanMap['macaddr'] }}</span>
                <input type="text" placeholder="ex: 00:00:00:00:00:00" v-model="macaddr" :style="{ 'border-color' : check_mac.test(macaddr) || macaddr === '' ? '' : 'red' }">
                <span>{{ lanMap['macmask'] }}</span>
                <input type="text" placeholder="ex: 00:00:00:00:00:00" v-model="macmask" :style="{ 'border-color' : check_mac.test(macmask) || macmask === '' ? '' : 'red' }">
                <a href="javascript:;" @click="query_macaddr">{{ lanMap['apply'] }}</a>
            </div>
            <div v-if="choose_mactype" class="query-frame">
                <select v-model.number="mac_type">
                    <option value="0">{{ lanMap['dynamic'] }}</option>
                    <option value="1">{{ lanMap['static'] }}</option>
                    <option value="2">{{ lanMap['blackhole'] }}</option>
                    <option value="3">all</option>
                </select>
            </div>
            <div v-if="choose_port" class="query-frame">
                <select v-model.number="port_id">
                    <option :value="item.id" v-for="(item,key) in port_name.pon" :key="key">{{ item.name }}</option>
                    <option :value="item.id" v-for="(item,key) in port_name.ge" :key="key">{{ item.name }}</option>
                    <option v-if="port_name.xge" :value="item.id" v-for="(item,key) in port_name.xge" :key="key">{{ item.name }}</option>
                </select>
            </div>
            <div v-if="choose_vlan" class="query-frame">
                <input type="text" placeholder="range: 1 - 4094" v-model.number="vlan_id" :style="{'border-color' : vlan_id != '' && (vlan_id < 1 || vlan_id > 4094 || isNaN(vlan_id)) ? 'red' : '' }">
                <!-- <input type="text" placeholder="max"> -->
                <a href="javascript:;" @click="query_vlanid">{{ lanMap['apply'] }}</a>
            </div>
        </div>
        <ul class="mac-table" v-if="this.mac_table[0]">
            <li>
                <span>{{ lanMap['mac_index'] }}</span>
                <span v-for="(item,key) in mac_table[0]" :key="key">
                    {{ lanMap[key] }}
                    <i class="arrow-sort-up" v-if="key === 'vlan_id'" @click="sort_by_vlan"></i>
                    <i class="arrow-sort-up" v-if="key === 'port_id'" @click="sort_by_port"></i>
                </span>
                <span>{{ lanMap['delete'] }}</span>
            </li>
            <li v-for="(item,key) in mac_table" :key="key">
                <span>{{ (pagination.index-1)*pagination.display + key + 1 }}</span>
                <span>{{ item.macaddr }}</span>
                <span>{{ item.vlan_id }}</span>
                <span>{{ item.port_id ? getName(item.port_id) : 'CPU' }}</span>
                <span>
                    {{ item.mac_type === 0 ? lanMap['dynamic'] : item.mac_type === 1 ? lanMap['static'] : lanMap['blackhole'] }}
                </span>
                <span>
                    <!-- <a href="javascript:;" @click="delete_mac(item)">{{ lanMap['delete'] }}</a> -->
                    <i class="delete" @click="delete_mac(item)"></i>
                </span>
            </li>
            <li v-if="is_loadmore">
                <a href="javascript:;" @click="loadmore">{{ lanMap['loadmore'] }}</a>
            </li>
            <li v-if="pagination.page > 1" class="paginations">
                <ul class="pagination rt">
                    <li :class="pagination.index > 1 ? '' : 'disabled'" @click="changeIndex(1)">&lt;&lt;</li>
                    <li :class="pagination.index > 1 ? '' : 'disabled'" @click="changeIndex(pagination.index-1)">&lt;</li>
                    <li v-if="pagination.index>2" @click="changeIndex(pagination.index-2)">{{ pagination.index-2 }}</li>
                    <li v-if="pagination.index>1" @click="changeIndex(pagination.index-1)">{{ pagination.index-1 }}</li>
                    <li class="actived" @click="changeIndex(pagination.index)">{{ pagination.index }}</li>
                    <li v-if="pagination.page-1 >= pagination.index" @click="changeIndex(pagination.index+1)">{{ pagination.index+1 }}</li>
                    <li v-if="pagination.page-2 >= pagination.index" @click="changeIndex(pagination.index+2)">{{ pagination.index+2 }}</li>
                    <li :class="pagination.page-1 >= pagination.index ? '' : 'disabled'" @click="changeIndex(pagination.index+1)">&gt;</li>
                    <li :class="pagination.page !== pagination.index ? '' : 'disabled'" @click="changeIndex(pagination.page)">&gt;&gt;</li>
                </ul>
            </li>
        </ul>
        <div v-else class="nomore-data">
            <p>{{ lanMap['no_more_data'] }}</p>
        </div>
        <div class="modal-dialog" v-if="add_dialog">
            <div class="cover"></div>
            <div class="content">
                <h3>{{ lanMap['add_mac'] }}</h3>
                <div class="add-mac-item">
                    <span>{{ lanMap['mac_type'] }}</span>
                    <select v-model.number="add_param.mac_type">
                        <option value="1">{{ lanMap['static'] }}</option>
                        <option value="2">{{ lanMap['blackhole'] }}</option>
                    </select>
                </div>
                <div class="add-mac-item">
                    <span>{{ lanMap['macaddr'] }}</span>
                    <input type="text" v-model="add_param.macaddr" :style="{ 'border-color' : this.check_mac.test(this.add_param.macaddr) || !this.add_param.macaddr ? '' : 'red' }">
                    <span>ex: 00:00:00:00:00:00</span>
                </div>
                <div class="add-mac-item place-holder">
                    <span>{{ lanMap['vlan_id'] }}</span>
                    <input type="text" v-model.number="add_param.vlan_id" :style="{ 'border-color' : !isNaN(this.add_param.vlan_id) ? '' : 'red' }">
                    <span>range: 1-4094</span>
                </div>
                <div class="add-mac-item">
                    <span>{{ lanMap['port_id'] }}</span>
                    <select v-model.number="add_param.port_id">
                        <option :value="item.id" v-for="(item,key) in port_name.pon" :key="key">{{ item.name }}</option>
                        <option :value="item.id" v-for="(item,key) in port_name.ge" :key="key">{{ item.name }}</option>
                        <option v-if="port_name.xge" :value="item.id" v-for="(item,key) in port_name.xge" :key="key">{{ item.name }}</option>
                    </select>
                </div>
                <div class="add-mac-item">
                    <a href="javascript:;" @click="add_mac_table">{{ lanMap['apply'] }}</a>
                    <a href="javascript:;" @click="add_mac_close_dialog">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="add_mac_close_dialog"></div>
            </div>
        </div>
        <div class="modal-dialog" v-if="flush_dialog">
            <div class="cover"></div>
            <div class="content self-align">
                <h3>{{ lanMap['flush_mac'] }}</h3>
                <div class="add-mac-item">
                    <span>{{ lanMap['flush_way'] }}</span>
                    <select v-model.number="flush_param.flags">
                        <option value="1">{{ lanMap['mac_type'] }}</option>
                        <option value="2">{{ lanMap['port_id'] }}</option>
                        <option value="4">{{ lanMap['vlan_id'] }}</option>
                    </select>
                </div>
                <div class="add-mac-item">
                    <span>{{ lanMap['mac_type'] }}</span>
                    <select v-model.number="flush_param.mac_type">
                        <option value="0">{{ lanMap['dynamic'] }}</option>
                        <option value="1">{{ lanMap['static'] }}</option>
                        <option value="2" v-if="flush_param.flags !== 2">{{ lanMap['blackhole'] }}</option>
                        <option value="3">all</option>
                    </select>
                </div>
                <div class="add-mac-item" v-if = "flush_param.flags === 4">
                    <span>{{ lanMap['vlan_id'] }}</span>
                    <input type="text" v-model.number="flush_param.vlan_id" placeholder="VLAN ID" 
                    :style="{ 'border-color' : flush_param.vlan_id && ( isNaN(flush_param.vlan_id) || flush_param.vlan_id < 1 || flush_param.vlan_id > 4094) ? 'red' : '' }">
                    <span>range: 1-4094</span>
                </div>
                <div class="add-mac-item" v-if="flush_param.flags !== 2 && flush_param.flags !== 4"></div>
                <div class="add-mac-item item-align" v-if=" flush_param.flags === 2 ">
                    <span>
                        <span class="lf">{{ lanMap['port_id'] }}</span>
                        <div class="lf">
                            <input type="checkbox" id="selectAll" v-model="select_all" @click="select_all_port">
                            <label for="selectAll">{{ select_all_text }}</label>
                        </div>
                    </span>
                    <div>
                        <div v-for="(item,key) in port_name.pon" :key="key" class="lf">
                            <input type="checkbox" :id="item.name" v-model="flush_param.port_id" :value="item.id" name="port_list">
                            <label :for="item.name">{{ item.name }}</label>
                        </div>
                        <div v-for="(item,key) in port_name.ge" :key="key" class="lf">
                            <input type="checkbox" :id="item.name" v-model="flush_param.port_id" :value="item.id" name="port_list">
                            <label :for="item.name">{{ item.name }}</label>
                        </div>
                        <div v-for="(item,key) in port_name.xge" :key="key" class="lf" v-if="port_name.xge">
                            <input type="checkbox" :id="item.name" v-model="flush_param.port_id" :value="item.id" name="port_list">
                            <label :for="item.name">{{ item.name }}</label>
                        </div>
                    </div>
                </div>
                <div class="add-mac-item">
                    <a href="javascript:;" @click="flush_mac_submit">{{ lanMap['apply'] }}</a>
                    <a href="javascript:;" @click="flush_mac_close_dialog">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="flush_mac_close_dialog"></div>
            </div>
        </div>
        <confirm :tool-tips="lanMap['tips_del_mac']" @choose="result" v-if="userChoose"></confirm>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import loading from '@/components/common/loading'
    export default {
        name: 'macMgmt',
        components: { loading },
        computed: {
            ...mapState(['lanMap','change_url','port_name','port_info']),
            select_all_text(){
                if(!this.select_all){
                    return this.lanMap['select_all']
                }else{
                    return this.lanMap['clear_all']
                }
            }    
        },
        data(){
            return {
                //  mac地址老化时间 
                mac_age: {},
                //  mac表
                tab: [],
                //  分页mac表
                mac_table: [],
                // 绑定老化时间输入框
                macage: '',
                // 控制老化时间模态框显示隐藏
                cfg_age: false,
                // 加载方式(查询条件)
                flag: 1,
                // 分页加载
                count: 0,
                // 分页插件数据
                pagination: {
                    // 当前页面
                    index: 1,
                    // 总页数
                    page: 0,
                    // 每页显示的数据数量
                    display: 20
                },
                //  添加mac地址的数据
                add_param: {
                    mac_type: 1,
                    macaddr: '',
                    vlan_id: '',
                    port_id: 1
                },
                //  清除mac地址表的数据
                flush_param: {
                    flags: 1,
                    mac_type: 3,
                    port_id: [],
                    vlan_id: ''
                },
                //  添加mac地址模态框打开或关闭
                add_dialog: false,
                //  清除mac地址模态框打开或关闭
                flush_dialog: false,
                //  查询条件*4
                choose_macaddr: false,
                choose_mactype: true,
                choose_port: false,
                choose_vlan: false,
                //  初始化参数 --> 首次进入页面时的初始数据
                flag: 1,
                mac_type: 3,
                port_id: 1,
                vlan_id: 0,
                vlan_id_e: 0,
                macaddr: '',
                macmask: '',
                //  用户确认框
                userChoose: false,
                //  将要删除的mac地址数据
                delete_mac_data: {},
                //  用户输入的mac地址和mac掩码格式检查
                check_mac: /^([0-9abcdefABCDEF]{2}\:){5}[0-9abcdefABCDEF]{2}$/,
                select_all: false,
                select_text: '',
                //  是否显示加载更多
                is_loadmore: false
            }
        },
        created(){
            this.$http.get(this.change_url.macage).then(res=>{
                this.mac_age = res.data;
            }).catch(err=>{
                // to do 
            })
            if(this.change_url.beta === 'test'){
                this.$http.get(this.change_url.mactab).then(res=>{
                    this.tab = res.data.data;
                    this.pagination.page = Math.ceil(this.tab.length/this.pagination.display);
                    this.getPage();
                })
            }else{
                this.getData();
            }
        },
        methods: {
            getName(id){
                if(id < 1) return '';
                return this.port_name.pon[id] ? this.port_name.pon[id].name : this.port_name.ge[id] ? this.port_name.ge[id].name : this.port_name.xge[id].name;
            },
            getData(){
                var post_param = {
                    "method":"get",
                    "param":{
                        "flags": this.flag,
                        "count": this.count,
                        "mac_type": this.mac_type,
                        "port_id": this.port_id,
                        "vlan_id": this.vlan_id,
                        "vlan_id_e": this.vlan_id_e,
                        "macaddr": this.macaddr,
                        "macmask": this.macmask
                    }
                }
                this.$http.post('/switch_mac?form=table',post_param).then(res=>{
                    if(res.data.code === 1){
                        if(res.data.data && res.data.data.length === 200){
                            this.is_loadmore = true;
                        }
                        if(res.data.data && res.data.data.length !== 200){
                            this.is_loadmore = false;
                        }
                        if(this.count === 0 && res.data.data){
                            this.tab = res.data.data;
                        }else if(res.data.data){
                            var data = Object.assign([],this.tab.concat(res.data.data));
                            this.tab = data;
                        }
                        if(!res.data.data){
                            this.is_loadmore = false;
                            return
                        }
                        this.pagination.page = Math.ceil(this.tab.length/this.pagination.display);
                        this.getPage();
                    }else{
                        this.tab = [];
                        this.mac_table = [];
                        this.count = 0;
                    }
                }).catch(err=>{
                    // to do
                })
            },
            loadmore(){
                this.count += 1;
                this.getData();
            },
            //  删除mac地址处理函数
            delete_mac(data){
                //  打开模态框
                this.userChoose = true;
                //  将要删除的节点的数据缓存
                this.delete_mac_data = data;
            },
            //  删除mac地址表
            result(bool){
                if(bool){
                    var post_params = {
                        "method":"delete",
                        "param":{
                            "mac_type": this.delete_mac_data.mac_type,
                            "macaddr": this.delete_mac_data.macaddr,
                            "vlan_id": this.delete_mac_data.vlan_id,
                            "port_id": this.delete_mac_data.port_id
                        }
                    }
                    this.$http.post('/switch_mac?form=table',post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['delete'] + this.lanMap['st_success']
                            })
                            this.count = 0;
                            this.pagination.index = 1;
                            this.getData();
                        }else if(res.data.code > 1){
                            this.$message({
                                type: 'error',
                                text: '(' + res.data.code + ') ' + res.data.message
                            })
                        }
                    }).catch(err=>{
                        // to do
                    })
                }
                this.userChoose = false;
            },
            //  老化时间  编辑框  打开隐藏
            change_macage(){
                this.cfg_age = !this.cfg_age;
            },
            //  分页切换
            changeIndex(n){
                if(n < 1 || n > this.pagination.page){
                    return 
                }
                this.pagination.index = n;
                this.getPage();
            },
            //  老化时间编辑框内  提交按钮
            macage_choose(bool){
                if(bool){
                    if(this.macage !== 0 && (isNaN(this.macage) || this.macage < 10 || this.macage > 1000000)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error']
                        })
                        return
                    }
                    this.$http.get('/switch_mac?form=age&value=' + this.macage).then(res=>{
                        if(res.data.code == 1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['setting_ok']
                            })
                            this.$http.get(this.change_url.macage).then(res=>{
                                this.mac_age = res.data;
                            })
                        }else if(res.data.code > 1){
                            this.$message({
                                type: 'error',
                                text: '(' + res.data.code + ') ' + res.data.message
                            })
                        }
                    }).catch(err=>{
                        // to do
                    })
                }
                this.macage = '';
                this.cfg_age = false;
            },
            //  计算分页中当前显示页面的数据
            getPage(){
                this.mac_table = this.tab.slice(this.pagination.display*(this.pagination.index-1),this.pagination.index*this.pagination.display);
            },
            //  隐藏选择框
            hide_query_select(){
                this.choose_vlan = false;
                this.choose_port = false;
                this.choose_mactype = false;
                this.choose_macaddr = false;
            },
            query_macaddr(){
                if(!this.check_mac.test(this.macaddr)){
                    this.$message({
                        type: 'error',
                        text: this.lanMap['param_mac']
                    })
                    return 
                }
                if( this.macaddr === 'ff:ff:ff:ff:ff:ff' || this.macaddr === '00:00:00:00:00:00' || this.macaddr === '01:00:5e:00:00:00'){
                    this.$message({
                        type: 'error',
                        text: this.lanMap['param_error']
                    })
                    return 
                }
                this.tab = [];
                this.count = 0;
                this.mac_type = 3;
                this.port_id = 1;
                this.vlan_id = 0;
                this.vlan_id_e = 0;
                this.pagination.index = 1;
                this.getData();
            },
            query_portid(){
                this.tab = [];
                this.count = 0;
                this.mac_type = 3;
                this.vlan_id = 0;
                this.vlan_id_e = 0;
                this.macaddr = '';
                this.macmask = '';
                this.pagination.index = 1;
                this.getData();
            },
            query_vlanid(){
                if(this.vlan_id === '' || this.vlan_id < 1 || this.vlan_id > 4094 || isNaN(this.vlan_id)){
                    this.$message({
                        type: 'error',
                        text: this.lanMap['param_error']
                    })
                    return 
                }
                this.tab = [];
                this.count = 0;
                this.mac_type = 3;
                this.port_id = 1;
                this.macaddr = '';
                this.macmask = '';
                this.pagination.index = 1;
                this.getData();
            },
            //  点击添加mac地址模态框内 确定 按钮时的动作
            add_mac_table(){
                //  mac地址格式检验
                if(!this.check_mac.test(this.add_param.macaddr)){
                    this.$message({
                        type: 'error',
                        text: this.lanMap['param_mac']
                    })
                    return
                }
                //  vlanid 范围检验
                if(!this.add_param.vlan_id || isNaN(this.add_param.vlan_id) || this.add_param.vlan_id < 1 || this.add_param.vlan_id > 4094){
                    this.$message({
                        type: 'error',
                        text: this.lanMap['vlanid_range_hit']
                    })
                    return 
                }
                var post_params = {
                    "method":"add",
                    "param":{
                        "mac_type": this.add_param.mac_type,
                        "macaddr": this.add_param.macaddr,
                        "vlan_id": this.add_param.vlan_id,
                        "port_id": this.add_param.port_id
                    }
                }
                this.$http.post('/switch_mac?form=table',post_params).then(res=>{
                    if(res.data.code === 1){
                        this.$message({
                            type: 'success',
                            text: this.lanMap['setting_ok']
                        })
                        this.count = 0;
                        this.pagination.index = 1;
                        this.getData();
                        this.add_mac_close_dialog();
                    }else if(res.data.code > 1){
                        this.$message({
                            type: 'error',
                            text: '(' + res.data.code + ') ' + res.data.message
                        })
                    }
                }).catch(err=>{
                    // to do
                })
            },
            //  点击添加mac地址时的动作
            add_mac_dialog(){
                this.add_param.mac_type = 1;
                this.add_param.macaddr = '';
                this.add_param.vlan_id = '';
                this.add_param.port_id = 1;
                this.add_dialog = true;
            },
            //  点击添加mac地址模态框内 取消 或 关闭 按钮时的动作
            add_mac_close_dialog(){
                this.add_param.mac_type = 1;
                this.add_param.macaddr = '';
                this.add_param.vlan_id = '';
                this.add_param.port_id = 1;
                this.add_dialog = false;
            },
            //  点击清除mac地址按钮时的动作
            flush_mac_dialog(){
                this.flush_param.flags = 1;
                this.flush_param.mac_type = 3;
                this.flush_param.port_id = [];
                this.flush_param.vlan_id = '';
                this.flush_dialog = true;
            },
            //  点击清除mac地址模态框内 取消 或 关闭 按钮时的动作
            flush_mac_close_dialog(){
                this.flush_param.flags = 1;
                this.flush_param.mac_type = 3;
                this.flush_param.port_id = [];
                this.flush_param.vlan_id = '';
                this.flush_dialog = false;
            },
            // 清除mac地址模态框内，点击确定按钮时的动作
            flush_mac_submit(){
                //  vlanid 范围检验
                if(this.flush_param.flags === 4 && (!this.flush_param.vlan_id || isNaN(this.flush_param.vlan_id) || this.flush_param.vlan_id < 1 || this.flush_param.vlan_id > 4094)){
                    this.$message({
                        type: 'error',
                        text: this.lanMap['vlanid_range_hit']
                    })
                    return 
                }
                //  port_id 检验
                var port_list = this.flush_param.port_id.sort((a,b)=>a-b).join(',').replace(/,$/,'');
                if(this.flush_param.flags === 2 && port_list === ''){
                    this.$message({
                        type: 'info',
                        text: this.lanMap['modify_tips']
                    })
                    this.flush_mac_close_dialog();
                    return
                }
                var post_params = {
                    "method":"clear",
                    "param":{
                        "flags": this.flush_param.flags,
                        "mac_type": this.flush_param.mac_type,
                        "vlan_id": this.flush_param.vlan_id,
                        "port_list": port_list
                    }
                }
                this.$http.post('/switch_mac?form=table',post_params).then(res=>{
                    if(res.data.code === 1){
                        this.$message({
                            type: 'success',
                            text: this.lanMap['flush'] + this.lanMap['st_success']
                        })
                        this.count = 0;
                        this.pagination.index = 1;
                        this.getData();
                        this.flush_mac_close_dialog();
                    }else if(res.data.code > 1){
                        this.$message({
                            type: 'error',
                            text: '(' + res.data.code + ') ' + res.data.message
                        })
                    }
                }).catch(err=>{
                    // to do
                })
            },
            //  全选按钮
            select_all_port(){
                this.select_all = !this.select_all;
                if(this.select_all){
                    this.flush_param.port_id = [];
                    for(var key in this.port_name.pon){
                        this.flush_param.port_id.push(this.port_name.pon[key].id);
                    }
                    for(var key in this.port_name.ge){
                        this.flush_param.port_id.push(this.port_name.ge[key].id);
                    }
                    for(var key in this.port_name.xge){
                        this.flush_param.port_id.push(this.port_name.xge[key].id);
                    }
                }else{
                    this.flush_param.port_id = [];
                }
            },
            sort_by_vlan(e){
                if(e.target.className === 'arrow-sort-up'){
                    e.target.className = 'arrow-sort-down';
                    this.tab.sort((a,b)=>b.vlan_id - a.vlan_id);
                }else{
                    e.target.className = 'arrow-sort-up';
                    this.tab.sort((a,b)=>a.vlan_id - b.vlan_id);
                }
                this.pagination.page = Math.ceil(this.tab.length/this.pagination.display);
                this.getPage();
            },
            sort_by_port(e){
                if(e.target.className === 'arrow-sort-up'){
                    e.target.className = 'arrow-sort-down';
                    this.tab.sort((a,b)=>b.port_id - a.port_id);
                }else{
                    e.target.className = 'arrow-sort-up';
                    this.tab.sort((a,b)=>a.port_id - b.port_id);
                }
                this.pagination.page = Math.ceil(this.tab.length/this.pagination.display);
                this.getPage();
            }
        },
        watch: {
            flag(){
                if(this.flag == 8){
                    this.hide_query_select();
                    this.choose_macaddr = true;
                }
                if(this.flag == 1){
                    this.hide_query_select();
                    this.choose_mactype = true;
                    this.getData();
                }
                if(this.flag == 2){
                    this.hide_query_select();
                    this.choose_port = true;
                    this.getData();
                }
                if(this.flag == 4){
                    this.hide_query_select();
                    this.choose_vlan = true;
                    this.vlan_id = '';
                }
            },
            mac_type(){
                this.tab = [];
                this.count = 0;
                this.port_id = 1;
                this.vlan_id = 0;
                this.vlan_id_e = 0;
                this.macaddr = '';
                this.macmask = '';
                this.pagination.index = 1;
                this.getData();
            },
            port_id(){
                this.query_portid();
            },
            'flush_param.port_id'(){
                if(this.flush_param.port_id.length === this.port_info.data.length){
                    this.select_all = true;
                }else{
                    this.select_all = false;
                }
            }
        }
    }
</script>

<style scoped lang="less">
ul.mac-table{
    border: 1px solid #ddd;
}
div.nomore-data{
    margin: 0 50px;
    font-size: 18px;
    color: red;
}
div>h2{
    font-size: 20px;
    font-weight: 600;
    color: #67AEF7;
    margin: 10px 0 20px 10px;
}
div.mac-age{
    margin: 20px 0;
    vertical-align: middle;
    line-height: 42px;
}
div.mac-age>span{
    display: inline-block;
    width: 100px;
    vertical-align: middle;
}
div.mac-age>input{
    vertical-align: middle;
}
div.mac-age>span:first-child{
    margin-left: 30px;
    font-size: 18px;
    font-weight: 600;
    color: #666;
}
a{
    display: inline-block;
    width: 120px;
    height: 30px;
    font-size: 16px;
    line-height: 30px;
    text-align: center;
    border-radius: 5px;
    background: #ddd;
    transition: all .1s linear;
    margin: 5px;
}
a:active{
    border: 1px solid #67AEF7;
    background: #ccc;
}
ul.mac-table{
    margin: 20px 0 20px 10px;
}
ul.mac-table>li{
    font-size: 0;
    border-bottom: 1px solid #ccc;
}
ul.mac-table>li>span{
    display: inline-block;
    width: 16%;
    font-size: 16px;
    text-align: center;
    padding: 5px 0;
    word-wrap: break-word;
}
ul.mac-table>li.paginations{
    border-bottom: 0;
}
ul.pagination{
    margin: 10px;
    margin-right: 60px;
}
ul.pagination>li{
    float: left;
    font-size: 16px;
    color: #666;
    margin-left: 10px;
    border-radius: 3px;
    padding: 3px 8px;
    border: 1px solid #333;
    cursor: pointer;
}
ul>li:after{
    content: "";
    display: table;
    clear: both;
}
ul.pagination:after{
    content: "";
    display: table;
    clear: both;
}
ul>li.actived{
    color: #67aef7;
    border-color: #67aef7;
}
li>span>a{
    margin: 0;
}
ul.pagination>li.disabled{
    cursor: not-allowed;
    box-shadow: none;
    opacity: .65;
}
div.query-select{
    margin: 20px 0 10px 30px;
    vertical-align: middle;
}
div.query-select>p{
    font-size: 18px;
    font-weight: 600;
    color: #666;
}
div.query-select:after{
    content: "";
    display: table;
    clear: both;
}
div.query-frame{
    float: left;
    margin: 20px 10px 10px 10px;
    height: 40px;
    line-height: 40px;
    vertical-align: middle;
    >span:nth-child(3){
        margin-left: 10px;
    }
}
div.query-select select{
    width: 180px;
    height: 30px;
    font-size: 15px;
    text-indent: 10px;
    vertical-align: middle;
}
div.mac-age>span.tips{
    width: 180px;
    font-size: 14px;
    color: #666;
}
p+div{
    margin-top: 20px;
}
i{
    display: inline-block;
    cursor: pointer;
    width: 32px;
    height: 32px;
    vertical-align: middle;
}
i.delete{
    background: url('../../../assets/delete-normal.png') no-repeat;
}
i.delete:hover{
    background: url('../../../assets/delete-hover.png') no-repeat;
}
i.arrow-sort-down{
    background: url('../../../assets/arrow-sort-down.png') no-repeat;
}
i.arrow-sort-up{
    background: url('../../../assets/arrow-sort-up.png') no-repeat;
}
div.cover+div.self-align{
    height: 340px;
}
input[type="checkbox"]{
    vertical-align: middle;
}
input[type="checkbox"]+label{
    vertical-align: middle;
    cursor: pointer;
    user-select: none;
}
div.content{
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    width: 580px;
    height: 350px;
    background: #ddd;
    border-radius: 10px;
    background: #fff;
    padding: 10px;
    >h3{
        height: 30px;
        font-size: 20px;
        color: #67AEF7;
        margin: 30px 0 30px 20px;
    }
    div.add-mac-item{
        height: 32px;
        margin: 10px 0 0 30px;
        &:nth-child(4){
            height: 90px;
            margin-top: 20px;
        }
        >span:first-child{
            display: inline-block;
            width: 160px;
            font-size: 16px;
            color: #000;
            >div{
                margin-left: 10px;
            }
        }
        >input{
            border-radius: 3px;
        }
        >select{
            width: 200px;
            height: 30px;
            font-size: 16px;
            text-indent: 10px;
        }
        >span{
            font-size: 14px;
            color: #aaa;
            margin-left: 10px;
        }
        >div{
            display: inline-block;
        }
        >a{
            margin-left: 85px;
        }
    }
    >div.place-holder{
        &:nth-child(4){
            height: 32px;
        }
    }
}
div.add-mac-item+div.item-align{
        height: 72px;
        vertical-align: middle;
        >div{
            width: 360px;
            vertical-align: middle;
            >div{
                width: 25%;
                height: 24px;
            }
        }
    }
</style>