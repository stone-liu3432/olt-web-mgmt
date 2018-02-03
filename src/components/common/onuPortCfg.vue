<template>
    <div>
        <div class="onu-port">
            <h2>{{ lanMap['onu_port_cfg'] }}</h2>
            <div class="lf" v-if="port_name.pon">
                <span>{{ lanMap['port_id'] }}</span>
                <select v-model="portid">
                    <option :value="item.id" v-for="(item,key) in port_name.pon" :key="key">{{ item.name }}</option>
                </select>
            </div>
            <div class="lf" v-if="onu_list.data">
                <span>{{ lanMap['onu_id'] }}</span>
                <select v-model="onuid">
                    <option :value="item" v-for="(item,index) in onu_list.data" :key="index">{{ 'ONU'+ onu_list.port_id + '/' + item }}</option>
                </select>
            </div>
            <div v-else class="no-data lf">{{ lanMap['no_onu_info'] }}</div>
        </div>
        <hr>
        <div class="onu-port-info" v-if="onu_port_info.data && port_name.pon">
            <div>
                <h3 class="lf">{{ 'ONU' + port_name.pon[portid].id + '/' + onuid + ' ' + lanMap['port_info'] }}</h3>
                <div class="lf">
                    <a href="javascript:;" @click="open_dialog_basicCfg">ONU端口基本配置</a>
                </div>
            </div>
            <div>
                <span v-for="(item,index) in onu_port_info.data[0]" :key="index">{{ index }}</span>
            </div>
            <div v-for="(item,key) in onu_port_info.data" :key="key">
                <span v-for="(_item,_key) in item" :key="_key">{{ _item }}</span>
            </div>
        </div>
        <div class="onu-vlan-info" v-if="onu_vlan_info.data && port_name.pon">
            <div>
                <h3 class="lf">{{ 'ONU' + port_name.pon[portid].id + '/' + onuid + ' ' + '端口VLAN' }}</h3>
                <div class="lf">
                    <a href="javascript:;" @click="open_dialog_vlanCfg">ONU端口VLAN模式配置</a>
                </div>
            </div>
            <div v-for="(item,index) in onu_vlan_info.data" :key="index" class="port-item-vlan">
                <div>
                    <span v-for="(item,key) in onu_vlan_info.data[0]" :key="key" v-if="key !== 'vlan_list'">{{ key }}</span>
                    <span>{{ lanMap['config'] }}</span>
                </div>
                <div>
                    <span v-for="(_item,_key) in item" :key="_key" v-if="_key !== 'vlan_list'">{{ _key !== 'op_vlan_mode' ? _item : vlan_mode_map[item.op_vlan_mode] }}</span>
                    <span v-if="item.op_vlan_mode === 2">
                        <a href="javascript:;" @click="add_translate(item)">{{ lanMap['add'] }}</a>
                        <a href="javascript:;" @click="delete_translate(item)">{{ lanMap['delete'] }}</a>
                    </span>
                    <span v-if="item.op_vlan_mode === 4">
                        <a href="javascript:;" @click="add_trunk(item)">{{ lanMap['add'] }}</a>
                        <a href="javascript:;" @click="delete_trunk(item)">{{ lanMap['delete'] }}</a>
                    </span>
                </div>
                <div v-if="item.vlan_list && item.op_vlan_mode === 2" class="vlan-list">
                    <span>vlan_list</span>
                    <span>
                        <span :style="{'font-size': item.vlan_list.length > 10 ? '14px' : '16px'}">{{ translate_str_map(item.vlan_list,' &rarr; ') }}</span>
                    </span>
                </div>
                <div v-if="item.vlan_list && item.op_vlan_mode === 4" class="vlan-list">
                    <span>vlan_list</span>
                    <span>
                        <span>{{ translate_str_map(item.vlan_list,' - ') }}</span>
                    </span>
                </div>
            </div>
        </div>
        <!-- ONU端口VLAN模式配置 -->
        <div class="modal-dialog" v-if="onu_vlan_mode">
            <div class="cover"></div>
            <div class="dialog-content">
                <div>
                    <h3 class="lf">ONU端口VLAN模式配置</h3>
                    <div class="rt"></div>
                </div>
                <div>
                    <span>ONU端口号</span>
                    <select v-model="onu_vlan_item.op_id">
                        <option :value="item.op_id" v-for="(item,index) in onu_vlan_info.data" :key="index">{{ item.op_id }}</option>
                    </select>
                </div>
                <div>
                    <span>op_vlan_mode</span>
                    <select v-model.number="onu_vlan_item.op_vlan_mode">
                        <option value="0">transparent</option>
                        <option value="1">tag</option>
                        <option value="2">translate</option>
                        <option value="3">aggregation</option>
                        <option value="4">trunk</option>
                    </select>
                </div>
                <div>
                    <span>def_vlan_id</span>
                    <input type="text" v-model.number="onu_vlan_item.def_vlan_id" placeholder="1-4094"
                    :style="{'border-color': onu_vlan_item.def_vlan_id !== '' && (onu_vlan_item.def_vlan_id < 1 || onu_vlan_item.def_vlan_id > 4094 || isNaN(onu_vlan_item.def_vlan_id)) ? 'red' : ''}">
                    <span class="tips">{{ lanMap['range'] + ' : 1-4094' }}</span>
                </div>
                <div>
                    <span>def_vlan_pri</span>
                    <input type="text" v-model.number="onu_vlan_item.def_vlan_pri" placeholder="0-7"
                    :style="{'border-color': onu_vlan_item.def_vlan_pri !== '' && (onu_vlan_item.def_vlan_pri < 0 || onu_vlan_item.def_vlan_pri > 7 || isNaN(onu_vlan_item.def_vlan_pri)) ? 'red' : ''}">
                    <span class="tips">{{ lanMap['range'] + ' : 0-7' }}</span>
                </div>
                <div>
                    <a href="javascript:;" @click="hanlde_onu_vlanCfg(true)">{{ lanMap['apply'] }}</a>
                    <a href="javascript:;" @click="hanlde_onu_vlanCfg(false)">{{ lanMap['cancel'] }}</a>
                </div>
                <b class="close" @click="hanlde_onu_vlanCfg(false)"></b>
            </div>
        </div>
        <!-- onu端口基本配置 -->
        <div class="modal-dialog" v-if="onu_port_cfg">
            <div class="cover"></div>
            <div class="dialog-body">
                <div>
                    <h3 class="lf">ONU端口基本配置</h3>
                    <!-- 提示信息，鼠标移入显示，离开隐藏 -->
                    <div class="rt tool-tips">
                        <i></i>
                        <div>
                            <p>rl_cir</p>
                            <p>{{ lanMap['range'] }}: 1-100000</p>
                            <hr>
                            <p>rl_pir</p>
                            <p>{{ lanMap['range'] }}: 1-100000</p>
                            <hr>
                            <p>bandwidth</p>
                            <p>{{ lanMap['range'] }}: 1-100000</p>
                        </div>
                    </div>
                </div>
                <div>
                    <span>ONU端口号</span>
                    <select v-model.number="onu_port_item.op_id">
                        <option :value="item.op_id" v-for="(item,index) in onu_port_info.data" :key="index">{{ item.op_id }}</option>
                    </select>
                </div>
                <div v-for="(item,key) in onu_port_item" :key="key" v-if="key !== 'op_id'">
                    <span>{{ key }}</span>
                    <select v-if="key !== 'rl_cir' && key !== 'rl_pir' && key !== 'bandwidth'" v-model.number="onu_port_item[key]">
                        <option value="0">Disable</option>
                        <option value="1">Enable</option>
                    </select>
                    <input type="text" v-if="key === 'rl_cir' || key === 'rl_pir' || key === 'bandwidth'" v-model.number="onu_port_item[key]">
                    <span v-if="key === 'rl_cir' || key === 'rl_pir' || key === 'bandwidth'">Kbps</span>
                </div>
                <div>
                    <a href="javascript:;" @click="handle_onu_basicCfg(true)">{{ lanMap['apply'] }}</a>
                    <a href="javascript:;" @click="handle_onu_basicCfg(false)">{{ lanMap['cancel'] }}</a>
                </div>
                <b class="close" @click="handle_onu_basicCfg(false)"></b>
            </div>
        </div>
        <!-- translate模式下的添加/删除vlan按钮 -->
        <div class="modal-dialog" v-if="is_add_translate || is_delete_translate">
            <div class="cover"></div>
            <div class="dialog-content add-vlan-translate" :style="{'height': is_delete_translate ? '260px' : '' }">
                <div>
                    <h3 v-if="is_add_translate">ONU下添加转发VLAN</h3>
                    <h3 v-if="is_delete_translate">ONU下删除转发VLAN</h3>
                </div>
                <div>
                    <span>{{ lanMap['onu_id'] }}</span>
                    <span>{{ 'ONU' + port_name.pon[portid].id + '/' + onuid }}</span>
                </div>
                <div>
                    <span>op_id</span>
                    <span>{{ cache_port_vlan.op_id }}</span>
                </div>
                <div v-if="is_add_translate">
                    <span>old_vlan_id</span>
                    <input type="text" v-model.number="translate_post_param.old_vlan_id"
                    :style="{ 'border-color': translate_post_param.old_vlan_id !== '' && (translate_post_param.old_vlan_id < 1 || translate_post_param.old_vlan_id > 4094 || isNaN(translate_post_param.old_vlan_id)) ? 'red' : '' }">
                    <span class="tips">{{ lanMap['range'] + ' : 1-4094' }}</span>
                </div>
                <div v-if="is_add_translate">
                    <span>new_vlan_id</span>
                    <input type="text" v-model.number="translate_post_param.new_vlan_id"
                    :style="{ 'border-color': translate_post_param.new_vlan_id !== '' && (translate_post_param.new_vlan_id < 1 || translate_post_param.new_vlan_id > 4094 || isNaN(translate_post_param.new_vlan_id)) ? 'red' : '' }">
                    <span class="tips">{{ lanMap['range'] + ' : 1-4094' }}</span>
                </div>
                <div v-if="is_delete_translate">
                    <span>vlan_id</span>
                    <select v-model="translate_post_param.vlan_list">
                        <option :value="index" v-for="(item,index) in cache_port_vlan.vlan_list" :key="index">
                            {{ item.old_vlan_id }} &rarr; {{ item.new_vlan_id }}
                        </option>
                    </select>
                </div>
                <div v-if="is_add_translate">
                    <span>new_vlan_pri</span>
                    <select v-model.number="translate_post_param.new_vlan_pri">
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                    </select>
                </div>
                <div v-if="is_add_translate">
                    <a href="javascript:;" @click="confirm_add_translate(true)">{{ lanMap['apply'] }}</a>
                    <a href="javascript:;" @click="confirm_add_translate(false)">{{ lanMap['cancel'] }}</a>
                </div>
                <div v-if="is_delete_translate">
                    <a href="javascript:;" @click="confirm_delete_translate(true)">{{ lanMap['apply'] }}</a>
                    <a href="javascript:;" @click="confirm_delete_translate(false)">{{ lanMap['cancel'] }}</a>
                </div>
                <b class="close" @click="confirm_close"></b>
            </div>
        </div>
        <!-- trunk 模式下 添加/删除按钮 -->
        <div class="modal-dialog" v-if="is_add_trunk || is_delete_trunk">
            <div class="cover"></div>
            <div class="dialog-content add-vlan-translate" :style="{'height' : is_delete_trunk ? '260px' : ''}">
                <div>
                    <h3 v-if="is_add_trunk">ONU下添加转发VLAN</h3>
                    <h3 v-if="is_delete_trunk">ONU下删除转发VLAN</h3>
                </div>
                <div>
                    <span>{{ lanMap['onu_id'] }}</span>
                    <span>{{ 'ONU' + port_name.pon[portid].id + '/' + onuid }}</span>
                </div>
                <div>
                    <span>op_id</span>
                    <span>{{ cache_port_vlan.op_id }}</span>
                </div>
                <div v-if="is_add_trunk">
                    <span>start_vlan_id</span>
                    <input type="text" v-model.number="trunk_post_param.start_vlan_id"
                    :style="{'border-color' : trunk_post_param.start_vlan_id !== '' && ( trunk_post_param.start_vlan_id < 1 || trunk_post_param.start_vlan_id > 4094 || isNaN(trunk_post_param.start_vlan_id) ) ? 'red' : '' }">
                    <span class="tips">{{ lanMap['range'] + ' : 1-4094' }}</span>
                </div>
                <div v-if="is_add_trunk">
                    <span>end_vlan_id</span>
                    <input type="text" v-model.number="trunk_post_param.end_vlan_id"
                    :style="{'border-color' : trunk_post_param.end_vlan_id !== '' && ( trunk_post_param.end_vlan_id < 1 || trunk_post_param.end_vlan_id > 4094 || isNaN(trunk_post_param.end_vlan_id) ) ? 'red' : '' }">
                    <span class="tips">{{ lanMap['range'] + ' : 1-4094' }}</span>
                </div>
                <div v-if="is_delete_trunk">
                    <span>vlan_id</span>
                    <select v-model="trunk_post_param.vlan_list">
                        <option :value="index" v-for="(item,index) in cache_port_vlan.vlan_list" :key="index">
                            {{ item.start_vlan_id }} - {{ item.end_vlan_id }}
                        </option>
                    </select>
                </div>
                <div v-if="is_add_trunk">
                    <span>new_vlan_pri</span>
                    <select v-model.number="trunk_post_param.vlan_pri">
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                    </select>
                </div>
                <div v-if="is_add_trunk">
                    <a href="javascript:;" @click="confirm_add_trunk(true)">{{ lanMap['apply'] }}</a>
                    <a href="javascript:;" @click="confirm_add_trunk(false)">{{ lanMap['cancel'] }}</a>
                </div>
                <div v-if="is_delete_trunk">
                    <a href="javascript:;" @click="confirm_delete_trunk(true)">{{ lanMap['apply'] }}</a>
                    <a href="javascript:;" @click="confirm_delete_trunk(false)">{{ lanMap['cancel'] }}</a>
                </div>
                <b class="close" @click="confirm_close"></b>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
    export default {
        name: 'onuPortCfg',
        computed: {
            ...mapState(['port_name','lanMap'])
        },
        data(){
            return {
                portid: 0,
                onuid: 0,
                //  当前PON口下ONU列表
                onu_list: {},
                //  模态框显示/隐藏
                onu_port_cfg: false,
                onu_vlan_mode: false,
                is_add_translate: false,
                is_delete_translate: false,
                is_add_trunk: false,
                is_delete_trunk: false,
                //  打开模态框时缓存当前端口的所有数据
                cache_port_vlan: {},
                //  缓存当前端口的vlan_list
                cache_vlan_list: [],
                //  缓存数据，用于提交时比较变化 --> 端口VLAN模式配置
                cache_data: {},
                vlan_mode_map: ['transparent','tag','translate','aggregation','trunk'],
                //  ONU下的所有端口列表
                onu_port_info: {
                    "code":1,	
                    "message":"success",
                    "data":[{
                        "op_id": 1,
                        "autoneg": 1,
                        "flowctrl": 1,
                        "loopdetect": 1,
                        "enable": 1,
                        "rlds_opt": 1,
                        "rl_cir": 1,
                        "rl_pir" :1,
                        "rlus_opt": 1,
                        "bandwidth": 1
                    }]
                },
                //  ONU下某个特定的端口的基本信息  --> 配置ONU端口基本信息时使用
                onu_port_item: {
                    "op_id": 1,
                    "autoneg": 1,
                    "flowctrl": 1,
                    "loopdetect": 1,
                    "enable": 1,
                    "rlds_opt": 1,
                    "rl_cir": 1,
                    "rl_pir" : 1,
                    "rlus_opt": 1,
                    "bandwidth": 1
                },
                //  ONU VLAN信息  -->当前ONU下所有的端口信息
                onu_vlan_info: {
                    "code":1,
                    "msg":"success",
                    "data":[{
                        "op_id": 1,
                        "op_vlan_mode": 2,
                        "def_vlan_id": 1,
                        "def_vlan_pri": 0,
                        "vlan_list": [{
                            "old_vlan_id": 11,
                            "new_vlan_id": 22,
                            "new_vlan_pri": 1
                        },{
                            "old_vlan_id": 23,
                            "new_vlan_id": 33,
                            "new_vlan_pri": 2
                        },{
                            "old_vlan_id": 33,
                            "new_vlan_id": 22,
                            "new_vlan_pri": 3
                        }]
                    },{ 
                        "op_id":2,
                        "op_vlan_mode": 4,
                        "def_vlan_id": 1,
                        "def_vlan_pri": 0,
                        "vlan_list": [{
                            "start_vlan_id": 11,
                            "end_vlan_id": 22,
                            "vlan_pri":1
                        }]
                    }
                ]},
                // ONU下某个特定的端口VLAN  -->  配置 ONU下任一端口的 vlan_mode时使用
                onu_vlan_item: {
                    "op_id": 1,
                    "op_vlan_mode": 2,
                    "def_vlan_id": 1,
                    "def_vlan_pri": 0,
                    "vlan_list": [{
                            "old_vlan_id": 11,
                            "new_vlan_id": 22,
                            "new_vlan_pri": 1
                        },{
                            "old_vlan_id": 55,
                            "new_vlan_id": 66,
                            "new_vlan_pri": 1
                        },{
                            "old_vlan_id": 77,
                            "new_vlan_id": 88,
                            "new_vlan_pri": 1
                        }]
                },
                //  translate添加或删除时，缓存的数据
                translate_post_param: {
                    "vlan_list": 0,
                    "old_vlan_id": '',
                    "new_vlan_id": '',
                    "new_vlan_pri": 0
                },
                //  trunk添加或删除时，缓存的数据
                trunk_post_param: {
                    "vlan_list": 0,
                    "start_vlan_id": '',
                    "end_vlan_id": '',
                    "vlan_pri": 0
                }
            }
        },
        created(){
            this.portid = this.port_name.pon['1'].id;
        },
        methods: {
            //  打开ONU基本配置模态框
            open_dialog_basicCfg(){
                this.onu_port_cfg = true;
                //  缓存数据，提交时比对数据有无变化，若有变化添加 flags
                this.onu_port_item.op_id = this.onu_port_info.data[0].op_id;
            },
            //  确认/关闭模态框时的操作
            handle_onu_basicCfg(bool){
                if(bool){
                    //  输入验证待添加
                    var flags = 0;
                    if(this.cache_data.autoneg !== this.onu_port_item.autoneg){
                        flags += 1;
                    }
                    if(this.cache_data.flowctrl !== this.onu_port_item.flowctrl){
                        flags += 2;
                    }
                    if(this.cache_data.loopdetect !== this.onu_port_item.loopdetect){
                        flags += 4;
                    }
                    if(this.cache_data.enable !== this.onu_port_item.enable){
                        flags += 8;
                    }
                    if(this.cache_data.rlds_opt !== this.onu_port_item.rlds_opt ||
                        this.cache_data.rl_cir !== this.onu_port_item.rl_cir ||
                        this.cache_data.rl_pir !== this.onu_port_item.rl_pir ||
                        this.cache_data.rlus_opt !== this.onu_port_item.rlus_opt ||
                        this.cache_data.bandwidth !== this.onu_port_item.bandwidth
                    ){
                        flags += 16;
                    }
                    if(flags === 0){
                        this.$message({
                            type: 'info',
                            text: this.lanMap['modify_tips']
                        })
                        return
                    }
                    var post_params = {
                        "method":"set",
                        "param":{
                            "port_id": this.portid,
                            "onu_id": this.onuid,
                            "op_id": this.onu_port_item.op_id,
                            "flags": flags,
                            "autoneg": this.onu_port_item.autoneg,
                            "flowctrl": this.onu_port_item.flowctrl,
                            "loopdetect": this.onu_port_item.loopdetect,
                            "enable": this.onu_port_item.enable,
                            "rlds_opt": this.onu_port_item.rlds_opt,
                            "rl_cir": this.onu_port_item.rl_cir,
                            "rl_pir": this.onu_port_item.rl_pir,
                            "rlus_opt": this.onu_port_item.rlus_opt,
                            "bandwidth": this.onu_port_item.bandwidth
                        }
                    }
                    this.$http.post('/onumgmt?form=port_cfg',post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['setting_ok']
                            })
                            this.getOnuInfo();
                        }else{
                            this.$message({
                                type: 'error',
                                text: this.lanMap['setting_fail']
                            })
                        }
                    }).catch(err=>{
                        // to do
                    })
                }
                this.onu_port_cfg = false;
                this.onu_port_item = {
                    "op_id": 0,
                    "autoneg": 0,
                    "flowctrl": 0,
                    "loopdetect": 0,
                    "enable": 0,
                    "rlds_opt": 0,
                    "rl_cir": 0,
                    "rl_pir" : 0,
                    "rlus_opt": 0,
                    "bandwidth": 0
                };
                this.cache_data = {};
            },
            //  打开ONU VLAN模式配置模态框
            open_dialog_vlanCfg(){
                this.onu_vlan_mode = true;
                //  缓存数据，提交时比对数据有无变化，若有变化添加 flags
                this.onu_vlan_item.op_id = this.onu_vlan_info.data[0].op_id;
            },
            hanlde_onu_vlanCfg(bool){
                if(bool){
                    if(this.onu_vlan_item.def_vlan_id < 1 || this.onu_vlan_item.def_vlan_id > 4094 || isNaN(this.onu_vlan_item.def_vlan_id)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['vlanid_range_hit']
                        })
                        return
                    }
                    if(this.onu_vlan_item.def_vlan_pri === '' || this.onu_vlan_item.def_vlan_pri < 0 || this.onu_vlan_item.def_vlan_pri > 7 || isNaN(this.onu_vlan_item.def_vlan_pri)){
                        this.$message({
                            type: 'error',
                            text: 'VLAN优先级参数不正确'
                        })
                        return
                    }
                    if(this.cache_data.def_vlan_id === this.onu_vlan_item.def_vlan_id && 
                    this.cache_data.def_vlan_pri === this.onu_vlan_item.def_vlan_pri && 
                    this.cache_data.op_vlan_mode === this.onu_vlan_item.op_vlan_mode){
                        this.$message({
                            type: 'info',
                            text: this.lanMap['modify_tips']
                        })
                        return
                    }
                    var post_params = {
                        "method":"set",
                        "param":{
                            "port_id": this.portid,
                            "onu_id": this.onuid,
                            "op_id": this.onu_vlan_item.op_id,
                            "op_vlan_mode": this.onu_vlan_item.op_vlan_mode,
                            "def_vlan_id": this.onu_vlan_item.def_vlan_id,
                            "def_vlan_pri": this.onu_vlan_item.def_vlan_pri
                        }
                    }
                    this.$http.post('/onumgmt?form=port_vlan',post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['setting_ok']
                            })
                        }else{
                            this.$message({
                                type: 'error',
                                text: this.lanMap['setting_fail']
                            })
                        }
                    }).catch(err=>{
                        // to do
                    })
                }
                this.onu_vlan_mode = false;
                this.onu_vlan_item = {
                    "op_id": 0,
                    "op_vlan_mode": 0,
                    "def_vlan_id": 0,
                    "def_vlan_pri": 0,
                    "vlan_list": {}
                };
                this.cache_data = {};
            },
            add_translate(node){
                this.is_add_translate = true;
                this.cache_port_vlan = node;
            },
            //  添加translate确认框
            confirm_add_translate(bool){
                if(bool){
                    //  已存在的转发
                    for(var key in this.cache_port_vlan.vlan_list){
                        var data = this.cache_port_vlan.vlan_list[key];
                        if(key.old_vlan_id === this.translate_post_param.old_vlan_id && 
                        data.new_vlan_id === this.translate_post_param.new_vlan_id &&
                        data.new_vlan_pri === this.translate_post_param.new_vlan_pri){
                            this.$message({
                                type: 'info',
                                text: ''
                            })
                            return 
                        }
                    }
                    //  参数相等   非法设置
                    if(this.translate_post_param.old_vlan_id === this.translate_post_param.new_vlan_id){
                        this.$message({
                            type: 'error',
                            text: ''
                        })
                        return
                    }
                    //  vlan ID 范围检查
                    if(this.translate_post_param.old_vlan_id === '' || this.translate_post_param.old_vlan_id < 1 || this.translate_post_param.old_vlan_id > 4094 || isNaN(this.translate_post_param.old_vlan_id)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['vlanid_range_hit']
                        })
                        return
                    }
                    if(this.translate_post_param.new_vlan_id === '' || this.translate_post_param.new_vlan_id < 1 || this.translate_post_param.new_vlan_id > 4094 || isNaN(this.translate_post_param.new_vlan_id)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['vlanid_range_hit']
                        })
                        return
                    }
                    var post_params = {
                        "method":"add",
                        "param":{
                            "port_id": this.portid,
                            "onu_id": this.onuid,
                            "op_id": this.cache_port_vlan.op_id,
                            "op_vlan_mode": this.cache_port_vlan.op_vlan_mode,
                            "old_vlan_id": this.translate_post_param.old_vlan_id,
                            "new_vlan_id": this.translate_post_param.new_vlan_id,
                            "new_vlan_pri": this.translate_post_param.new_vlan_pri
                        }
                    }
                    this.$http.post('/onumgmt?form=port_vlanlist',post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['add'] + ' ' + this.lanMap['st_success']
                            })
                            this.getOnuVlan();
                        }else{
                            this.$message({
                                type: 'error',
                                text: this.lanMap['add'] + ' ' + this.lanMap['st_fail']
                            })
                        }
                    }).catch(err=>{
                        // to do
                    })
                }
                this.is_add_translate = false;
                this.cache_port_vlan = {};
                this.translate_post_param.vlan_list = 0;
                this.translate_post_param.old_vlan_id = '';
                this.translate_post_param.new_vlan_id = '';
                this.translate_post_param.new_vlan_pri = 0;
            },
            delete_translate(node){
                this.is_delete_translate = true;
                this.cache_port_vlan = node;
                this.cache_vlan_list = node.vlan_list;
            },
            //  删除translate确认框
            confirm_delete_translate(bool){
                if(bool){
                    var post_params = {
                        "method": "delete",
                        "param":{
                            "port_id": this.portid,
                            "onu_id": this.onuid,
                            "op_id": this.cache_port_vlan.op_id,
                            "op_vlan_mode": this.cache_port_vlan.op_vlan_mode,
                            "old_vlan_id": this.cache_vlan_list[this.translate_post_param.vlan_list].old_vlan_id,
                            "new_vlan_id": this.cache_vlan_list[this.translate_post_param.vlan_list].new_vlan_id,
                            "new_vlan_pri": this.cache_vlan_list[this.translate_post_param.vlan_list].new_vlan_pri
                        }
                    }
                    this.$http.post('/onumgmt?form=port_vlanlist',post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['delete'] + ' ' + this.lanMap['st_success']
                            })
                            this.getOnuVlan();
                        }else{
                            this.$message({
                                type: 'error',
                                text: this.lanMap['delete'] + ' ' + this.lanMap['st_fail']
                            })
                        }
                    }).catch(err=>{
                        // to do
                    })
                }
                this.is_delete_translate = false;
                this.cache_port_vlan = {};
                this.translate_post_param.vlan_list = 0;
                this.translate_post_param.old_vlan_id = '';
                this.translate_post_param.new_vlan_id = '';
                this.translate_post_param.new_vlan_pri = 0;
            },
            add_trunk(node){
                this.is_add_trunk = true;
                this.cache_port_vlan = node;
            },
            //  添加trunk确认框
            confirm_add_trunk(bool){
                if(bool){
                    //  vlan ID 范围  -->  起始和结束范围不能超过15
                    if(this.trunk_post_param.start_vlan_id > this.trunk_post_param.end_vlan_id || this.trunk_post_param.end_vlan_id - this.trunk_post_param.start_vlan_id > 15){
                        this.$message({
                            type: 'error',
                            text: ''
                        })
                        return
                    }
                    //  vlan ID 范围  -->  单个VLAN ID是否合法
                    if(this.trunk_post_param.start_vlan_id === '' || this.trunk_post_param.start_vlan_id < 1 || this.trunk_post_param.start_vlan_id > 4094 || isNaN(this.trunk_post_param.start_vlan_id)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['vlanid_range_hit']
                        })
                        return
                    }
                    if(this.trunk_post_param.end_vlan_id === '' || this.translaunk_param.end_vlan_id < 1 || this.trunk_post_param.end_vlan_id > 4094 || isNaN(this.trunk_post_param.end_vlan_id)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['vlanid_range_hit']
                        })
                        return
                    }
                    var post_params = {
                        "method":"add",
                        "param":{
                            "port_id": this.portid,
                            "onu_id": this.onuid,
                            "op_id": this.cache_port_vlan.op_id,
                            "op_vlan_mode": this.cache_port_vlan.op_vlan_mode,
                            "start_vlan_id": this.trunk_post_param.start_vlan_id,
                            "end_vlan_id": this.trunk_post_param.end_vlan_id,
                            "vlan_pri": this.trunk_post_param.vlan_pri
                        }
                    }
                    this.$http.post('/onumgmt?form=port_vlanlist',post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['add'] + ' ' + this.lanMap['st_success']
                            })
                        }else{
                            this.$message({
                                type: 'error',
                                text: this.lanMap['add'] + ' ' + this.lanMap['st_fail']
                            })
                        }
                    }).catch(err=>{
                        // to do
                    })
                }
                this.is_add_trunk = false;
                this.cache_port_vlan = {};
                this.trunk_post_param.vlan_list = 0;
                this.trunk_post_param.start_vlan_id = '';
                this.trunk_post_param.end_vlan_id = '';
                this.trunk_post_param.vlan_pri = 0;
            },
            delete_trunk(node){
                this.is_delete_trunk = true;
                this.cache_port_vlan = node;
                this.cache_vlan_list = node.vlan_list;
            },
            //  删除trunk确认框
            confirm_delete_trunk(bool){
                if(bool){
                    var post_params = {
                        "method": "delete",
                        "param":{
                            "port_id": this.portid,
                            "onu_id": this.onuid,
                            "op_id": this.cache_port_vlan.op_id,
                            "op_vlan_mode": this.cache_port_vlan.op_vlan_mode,
                            "start_vlan_id": this.cache_vlan_list[this.trunk_post_param.vlan_list].start_vlan_id,
                            "end_vlan_id": this.cache_vlan_list[this.trunk_post_param.vlan_list].end_vlan_id,
                            "vlan_pri": this.cache_vlan_list[this.trunk_post_param.vlan_list].vlan_pri
                        }
                    }
                    this.$http.post('/onumgmt?form=port_vlanlist',post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['delete'] + ' ' + this.lanMap['st_success']
                            })
                        }else{
                            this.$message({
                                type: 'error',
                                text: this.lanMap['delete'] + ' ' + this.lanMap['st_fail']
                            })
                        }
                    }).catch(err=>{
                        // to do
                    })
                }
                this.is_delete_trunk = false;
                this.cache_port_vlan = {};
                this.trunk_post_param.vlan_list = 0;
                this.trunk_post_param.start_vlan_id = '';
                this.trunk_post_param.end_vlan_id = '';
                this.trunk_post_param.vlan_pri = 0;
            },
            getOnuInfo(){
                this.$http.get('/onumgmt?form=port_cfg&port_id='+this.portid+'&onu_id=' + this.onuid).then(res=>{
                    if(res.data.code === 1){
                        this.onu_port_info = res.data;
                        this.op_id = this.onu_port_info.data[0].op_id;
                    }else{
                        this.onu_port_info = {};
                    }
                }).catch(err=>{
                    // to do
                })
            },
            getOnuVlan(){
                this.$http.get('/onumgmt?form=port_vlan&port_id='+ this.portid +'&onu_id=' + this.onuid).then(res=>{
                    if(res.data.code === 1){
                        this.onu_vlan_info = res.data;
                    }else{
                        this.onu_vlan_info = {}
                    }
                }).catch(err=>{
                    // to do
                })
            },
            //  解析后台返回的字符串
            analysis(str){
                if(!str) return ''
                var result = [];
                var arr = str.split(',');
                for(var i=0,len=arr.length;i<len;i++){
                    var substrs = arr[i];
                    if(substrs.indexOf('-') !== -1){
                        var subArr = substrs.split('-');
                        var min = Number(subArr[0]),max = Number(subArr[subArr.length - 1]);
                        if(isNaN(min) || isNaN(max)) throw new TypeError;
                        result.push(min);
                        for(var j=1;j<max-min;j++){
                            result.push(min+j);
                        }
                        result.push(max);
                    }else{
                        if(isNaN(Number(substrs))) throw new TypeError;
                        result.push(Number(substrs));
                    }
                }
                return result
            },
            translate_str_map(arr,pre){
                if(!arr) return ''
                var str = '';
                for(var key in arr){
                    if(arr[key].old_vlan_id){
                        str += arr[key].old_vlan_id + pre + arr[key].new_vlan_id + ',';
                    }else{
                        str += arr[key].start_vlan_id + pre + arr[key].end_vlan_id + ',';
                    }
                }
                var e = document.createElement('div');
                e.innerHTML = str.replace(/,$/,'');
                return e.childNodes[0].nodeValue;
            },
            confirm_close(){
                if(this.is_add_translate || this.is_delete_translate){
                    this.translate_post_param.vlan_list = 0;
                    this.translate_post_param.old_vlan_id = '';
                    this.translate_post_param.new_vlan_id = '';
                    this.translate_post_param.new_vlan_pri = 0;
                }
                if(this.is_add_trunk || this.is_delete_trunk){
                    this.trunk_post_param.vlan_list = 0;
                    this.trunk_post_param.start_vlan_id = '';
                    this.trunk_post_param.end_vlan_id = '';
                    this.trunk_post_param.vlan_pri = 0;
                }
                this.is_add_translate = false;
                this.is_delete_translate = false;
                this.is_add_trunk = false;
                this.is_delete_trunk = false;
                //  关闭模态框时，释放内存
                this.cache_port_vlan = {};
            }
        },
        watch: {
            // portid(){
            //     var _onuid = this.onuid;
            //     this.$http.get('/onu_allow_list?form=resource&port_id='+this.portid).then(res=>{
            //         if(res.data.code === 1){
            //             var _onu_list = this.analysis(res.data.data.resource);
            //             if(!_onu_list){
            //                 this.onu_list = {};
            //                 return
            //             }
            //             this.onu_list = {
            //                 port_id: res.data.data.port_id,
            //                 data: _onu_list
            //             }
            //             this.onuid = this.onu_list.data[0];
            //             if(_onuid === this.onuid){
            //                 this.getOnuInfo();
            //                 this.getOnuVlan();
            //             }
            //         }else{
            //             this.onu_list = {};
            //         }
            //     }).catch(err=>{
            //         // to do
            //     })
            // },
            // onuid(){
            //     this.getOnuInfo();
            //     this.getOnuVlan();
            // },
            'onu_port_item.op_id'(){
                for(var key in this.onu_port_info.data){
                    if(this.onu_port_info.data[key].op_id === this.onu_port_item.op_id){
                        this.onu_port_item = this.onu_port_info.data[key];
                    }
                }
                //  缓存数据，提交时比对数据有无变化，若有变化添加 flags
                for(var key in this.onu_port_item){
                    this.cache_data[key] = this.onu_port_item[key];
                }
            },
            'onu_vlan_item.op_id'(){
                for(var key in this.onu_vlan_info.data){
                    if(this.onu_vlan_info.data[key].op_id === this.onu_vlan_item.op_id){
                        this.onu_vlan_item = this.onu_vlan_info.data[key];
                    }
                }
                // 缓存数据，用于提交时对比变化
                for(var key in this.onu_vlan_item){
                    this.cache_data[key] = this.onu_vlan_item[key];
                }
            }
        }
    }
</script>

<style scoped lang="less">
div.no-data{
    color: red;
    margin-left: 50px;
    height: 30px;
    line-height: 30px;
}
a{
    display: inline-block;
    width: 180px;
    height: 28px;
    text-align: center;
    line-height: 30px;
    border-radius: 5px;
    background: #ddd;
    vertical-align: middle;
    color: #333;
    border: 1px solid transparent;
    margin-left: 20px;
    &:active{
        border: 1px solid #67aef7;
    }
}
div.onu-port{
    padding:20px 0 20px 30px;
    &:after{
        content: "";
        display: table;
        clear: both;
    }
    >h2{
        float: left;
        width: 200px;
        font-size: 20px;
        font-weight: 600;
        color: 	#67AEF7;
    }
    >div{
        >span{
            padding: 0 30px;
        }
        >select{
            width: 120px;
            height: 30px;
            text-indent: 5px;
            font-size: 16px;
            margin-left: 40px;
        }
    }
}
div.onu-port-info{
    >div{
        height: 36px;
        line-height: 36px;
        &:first-child{
            margin: 20px;
            >div{
                margin-left: 30px;
                vertical-align: middle;
            }
        }
        &:last-child>span{
            border-top: none;
        }
        >h3{
            font-size: 18px;
            color: #67aef7;
            font-weight: 500;
        }
        >span{
            display: inline-block;
            vertical-align: top;
            width: 9.89%;
            text-align: center;
            border: 1px solid #ccc;
            border-right: none;
            &:last-child{
                border-right: 1px solid #ccc;
            }
        }
    }
}
div.onu-vlan-info{
    >div{
        height: 36px;
        line-height: 36px;
        font-size: 0;
        &:first-child{
            margin: 20px;
            >div{
                margin-left: 30px;
                vertical-align: middle;
            }
        }
        a{
            font-size: 16px;
        }
        &:last-child>span{
            border-top: none;
        }
        >h3{
            font-size: 18px;
            color: #67aef7;
            font-weight: 500;
        }
        >span{
            display: inline-block;
            vertical-align: top;
            box-sizing: border-box;
            width: 20%;
            text-align: center;
            border: 1px solid #ccc;
            border-right: none;
            font-size: 16px;
            &:last-child{
                border-right: 1px solid #ccc;
            }
        }
    }
}
div.onu-vlan-info>div.port-item-vlan{
    height: auto;
    border-top: 1px solid #ccc;
    margin-top: 20px;
    >div{
        >span{
            box-sizing: border-box;
            display: inline-block;
            vertical-align: top;
            width: 20%;
            text-align: center;
            border-left: 1px solid #ccc;
            border-bottom: 1px solid #ccc;
            font-size: 16px;
            &:last-child{
                border-right: 1px solid #ccc;
            }
            >a{
                width: 80px;
                height: 25px;
                line-height: 25px;
                margin: 0;
            } 
        }
    }
    >div.vlan-list{
        border: 1px solid #ccc;
        border-top: none;
        height: 36px;
        line-height: 36px;
        >span{
            font-size: 16px;
            display: inline-block;
            overflow: hidden;
            &:first-child{
                width: 12%;
                text-align: center;
                border-left: none;
                border-right: 1px solid #ccc;
            }
            &:last-child{
                width: auto;
                text-indent: 10px;
                text-overflow: ellipsis;
                border: none;
            }
        }
    }
}
div.dialog-body{
    width: 500px;
    height: 500px;
    background: #fff;
    border-radius: 10px;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    >div{
        height: 36px;
        line-height: 36px;
        &:first-child{
            height: 60px;
            >h3{
                line-height: 60px;
                margin-left: 30px;
                font-size: 18px;
                font-weight: 500;
                color: #67aef7;
            }
        }
        >span:first-child{
            display: inline-block;
            width: 150px;
            height: 30px;
            text-align: right;
            padding-right: 20px;
        }
        >span:last-child{
            font-size: 14px;
            color: #333;
            margin-left: 10px;
        }
        select{
            width: 180px;
            height: 30px;
            font-size: 16px;
        }
        a{
            width: 120px;
            margin: 25px 0 0 85px;
            color: #000;
        }
    }
}
div.tool-tips{
    margin-right: 70px;
    line-height: 60px;
    vertical-align: middle;
    position: relative;
    &:hover>div{
        display: block;
    }
    i{
        display: inline-block;
        width: 32px;
        height: 32px;
        vertical-align: middle;
        cursor: pointer;
        background: url('../../assets/tips.png') no-repeat;
    }
    >div{
        display: none;
        width: 200px;
        height: 160px;
        padding: 8px;
        background: #ddd;
        border-radius: 10px;
        position: absolute;
        left: 28px;
        top: 38px;
        >p{
            height: 20px;
            line-height: 20px;
            font-size: 14px;
            color: #333;
            margin-left: 10px;
        }
    }
}
div.dialog-content{
    width: 500px;
    height: 290px;
    background: #fff;
    border-radius: 10px;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    >div:first-child{
        padding-left: 30px;
        height: 60px;
        line-height: 60px;
        >h3{
            line-height: 60px;
            font-size: 18px;
            font-weight: 500;
            color: #67aef7;
        }
    }
    >div{
        height: 36px;
        line-height: 36px;
        >span:first-child{
            display: inline-block;
            width: 150px;
            text-align: right;
            padding-right: 20px;
        }
        select{
            width: 150px;
            height: 30px;
            font-size: 16px;
            text-indent: 10px;
        }
        input[type="text"]{
            width: 150px;
        }
        a{
            width: 120px;
            margin: 25px 0 0 85px;
            color: #000;
        }
    }
}
div.add-vlan-translate{
    height: 330px;
}
span.tips{
    font-size: 14px;
    color: #333;
    margin-left: 10px;
}
</style>
