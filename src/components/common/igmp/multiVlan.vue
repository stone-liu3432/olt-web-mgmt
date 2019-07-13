<template>
    <div class="multi-vlan">
        <div>
            <span>{{ lanMap['mvlan'] }}</span>
            <span>
                <a href="javascript:void(0);" @click="open_create_mvlan(1)">{{ lanMap['create'] }}</a>
            </span>
        </div>
        <div v-if="mv_info.data && mv_info.data.length > 0" class="multi-vlan-content">
            <div>
                <span>{{ lanMap['mvlan'] }}</span>
                <select v-model.number="mvlan">
                    <option :value="item.mvlan" v-for="(item,index) in mv_info.data" :key="index">{{ item.mvlan }}</option>
                </select>
                <span class="cfg-multi-vlan">
                    <a href="javascript: void(0);" @click="open_cfg_modal">{{ lanMap['config'] }}</a>
                    <a href="javascript:void(0);" @click="open_delmvlan">{{ lanMap['delete'] }}</a>
                </span>
            </div>
            <div>
                <span>{{ lanMap['mvlan_desc'] }}</span>
                <span>{{ router_plist.mvlan_desc }}</span>
                <span class="cfg-multi-vlan">
                    <a href="javascript:void(0);" @click="open_create_mvlan(0)">{{ lanMap['config'] }}</a>
                </span>
            </div>
            <div>
                <span>{{ lanMap['router_portlist'] }}</span>
                <span>{{ router_plist.router_portlist | analysis(system.data.ponports,system.data.geports) }}</span>
            </div>
            <div v-if="mc_unknown_info.data">
                <span>{{ lanMap['mc_unknown_policy'] }}</span>
                <span>{{ mc_unknown_info.data.mc_unknown_policy ? lanMap['discard'] : lanMap['transparent'] }}</span>
            </div>
            <div class="program">
                <span>{{ lanMap['program'] }}</span>
                <span>
                    <span>
                        <span>{{ lanMap['ipaddr'] }}</span>
                        <span>{{ lanMap['program_desc'] }}</span>
                        <span>{{ lanMap['config'] }}</span>
                    </span>
                    <span v-for="(item,index) in program.data" :key="index">
                        <span>
                            {{ item.program_s === item.program_e ? item.program_s : item.program_s  + ' - ' + item.program_e }}
                        </span>
                        <span :title="item.program_desc">{{ item.program_desc }}</span>
                        <span>
                            <a href="javascript:void(0);" @click="open_cfg_pro_desc(item)">{{ lanMap['config'] }}</a>
                            <a href="javascript:void(0);" @click="open_del_single_program(item)">{{ lanMap['delete'] }}</a>
                        </span>
                    </span>
                </span>
            </div>
        </div>
        <div class="modal-dialog" v-if="is_cfg_mv">
            <div class="cover"></div>
            <div class="multi-vlan-set" :style="{ 'height' : mark_type === 0 && mark_mode === 1 ? '420px' : '' }">
                <div>
                    <h3 class="modal-header">{{ lanMap['config'] }}</h3>
                    <div>
                        <span>{{ lanMap['vlan_id'] }}</span>
                        <span>{{ mvlan }}</span>
                    </div>
                    <div>
                        <span>{{ lanMap['mode'] }}</span>
                        <select v-model.number="mark_mode">
                            <option value="0">{{ lanMap['delete'] }}</option>
                            <option value="1">{{ lanMap['add'] }}</option>
                            <option value="2">{{ lanMap['config'] }}</option>
                        </select>
                    </div>
                    <div>
                        <span>{{ lanMap['type'] }}</span>
                        <select v-model.number="mark_type" :disabled="mark_mode === 2">
                            <option value="0">{{ lanMap['program'] }}</option>
                            <option value="1">{{ lanMap['router_portlist'] }}</option>
                            <option value="2" v-if="mark_mode === 2">{{ lanMap['mc_unknown_policy'] }}</option>
                        </select>
                    </div>
                    <div v-if="mark_mode === 1 && mark_type === 0" class="ip-range">
                        <span>{{ lanMap['program'] }}</span>
                        <input type="text" v-model="program_s" 
                         :style="{ 'border-color': program_s !== '' && !reg_ip.test(program_s) ? 'red' : ''}">
                         ~ 
                        <input type="text" v-model="program_e" 
                         :style="{ 'border-color': program_e !== '' && !reg_ip.test(program_e) ? 'red' : ''}">
                    </div>
                    <div v-if="mark_mode === 1 && mark_type === 1">
                        <span>{{ lanMap['router_portlist'] }}</span>
                        <input type="text" v-model="router_portlist" placeholder="ex: 1,3-5">
                    </div>
                    <div v-if="mark_mode === 2 && mark_type === 2">
                        <span>{{ lanMap['mc_unknown_policy'] }}</span>
                        <select v-model.number="mc_unknown_policy">
                            <option value="0">{{ lanMap['transparent'] }}</option>
                            <option value="1">{{ lanMap['discard'] }}</option>
                        </select>
                    </div>
                    <div v-if="mark_mode === 0 && mark_type === 1">
                        <span>{{ lanMap['router_portlist'] }}</span>
                        <input type="text" v-model="router_portlist" placeholder="ex: 1,3-5">
                    </div>
                    <div v-if="mark_mode === 0 && mark_type === 0" class="ip-range">
                        <span>{{ lanMap['program'] }}</span>
                        <input type="text" v-model="program_s" 
                         :style="{ 'border-color': program_s !== '' && !reg_ip.test(program_s) ? 'red' : ''}">
                         ~ 
                        <input type="text" v-model="program_e" 
                         :style="{ 'border-color': program_e !== '' && !reg_ip.test(program_e) ? 'red' : ''}">
                    </div>
                    <div v-if="mark_type === 0" class="multi-tips">
                        {{ lanMap['program_range_tips'] }}
                    </div>
                    <div v-else-if="mark_type === 1" class="multi-tips">
                        {{ lanMap['port_list_tips'] }}
                    </div>
                    <div v-else></div>
                    <div class="program-desc" v-if="mark_type === 0 && mark_mode === 1">
                        <span>{{ lanMap['program_desc'] }}</span>
                        <textarea spellcheck="false" v-model="program_desc" placeholder="0-64 characters"
                         :style="{ 'border-color': program_desc.length > 64 ? 'red' : '' }"></textarea>
                    </div>
                    <div>
                        <a href="javascript:void(0);" @click="submit_cfg">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="close_cfg_modal">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="close_cfg_modal"></div>
            </div>
        </div>
        <div class="modal-dialog" v-if="is_create_mvlan">
            <div class="cover"></div>
            <div class="create-mvlan-modal" :style="{ 'height': is_set_mvdesc ? '275px' : '165px' }">
                <div>
                    <h3 v-if="!is_set_mvdesc" class="modal-header">{{ lanMap['create'] + lanMap['mvlan']}}</h3>
                    <h3 v-else class="modal-header">{{ lanMap['config'] + lanMap['mvlan'] + lanMap['desc'] }}</h3>
                    <div>
                        <span>{{ lanMap['vlan_id'] }}</span>
                        <input type="text" v-model.number="create_mvlan" v-focus v-if="!is_set_mvdesc"
                         :style="{ 'border-color': create_mvlan !== '' && (create_mvlan > 4094 || create_mvlan < 1 || isNaN(create_mvlan)) ? 'red' : ''}">
                         <span v-else>{{ mvlan }}</span>
                    </div>
                    <div v-if="is_set_mvdesc">
                        <span>{{ lanMap['mvlan_desc'] }}</span>
                        <textarea spellcheck="false" v-model="mvlan_desc" placeholder="0-64 characters"
                         :style="{ 'border-color': mvlan_desc.length > 64 ? 'red' : '' }"></textarea>
                    </div>
                    <div v-if="!is_set_mvdesc">
                        <a href="javascript:void(0);" @click="submit_create_mvlan">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="close_create_mvlan">{{ lanMap['cancel'] }}</a>
                    </div>
                    <div v-else>
                        <a href="javascript:void(0);" @click="submit_set_mvdesc">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="close_create_mvlan">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="close_create_mvlan"></div>
            </div>
        </div>
        <div class="modal-dialog" v-if="is_set_program_desc">
            <div class="cover"></div>
            <div class="set-program-desc">
                <h3 class="modal-header">{{ lanMap['config'] + lanMap['program_desc'] }}</h3>
                <div>
                    <span>{{ lanMap['mvlan'] }}</span>
                    <span>{{ mvlan }}</span>
                </div>
                <div>
                    <span>{{ lanMap['program'] }}</span>
                    <span>{{ program_item.program_s === program_item.program_e ? program_item.program_s : program_item.program_s  + ' - ' + program_item.program_e }}</span>
                </div>
                <div>
                    <span class="desc-title-align">{{ lanMap['program_desc'] }}</span>
                </div>
                <div class="text-box">
                     <textarea spellcheck="false" v-model="program_desc" placeholder="0-64 characters"
                     :style="{ 'border-color': program_desc.length > 64 ? 'red' : '' }"></textarea>
                </div>
                <div>
                    <a href="javascript:void(0);" @click="submit_program_desc">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" @click="close_cfg_pro_desc">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="close_cfg_pro_desc"></div>
            </div>
        </div>
        <confirm v-if="is_del_mvlan" @choose="result_delmvlan"></confirm>
        <confirm v-if="is_del_program" @choose="del_single_program"></confirm>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'multicastVlan',
    computed: mapState(['lanMap','change_url','port_name','system']),
    data(){
        return {
            mv_info: {},
            router_plist: {},
            mvlan: 0,
            mvlan_desc: '',
            mc_unknown_info: {},
            program: {},
            mark_type: 0,       //  set which one
            mark_mode: 1,       //  add or delete or config
            program_s: '',
            program_e: '',
            program_desc: '',
            router_portlist: '',
            mc_unknown_policy: 0,
            is_cfg_mv: false,
            is_del_mvlan: false,
            is_create_mvlan: false,
            is_set_mvdesc: false,
            is_set_program_desc: false,
            is_del_program: false,
            program_item: {},
            create_mvlan: '',
            reg_ip:  /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)|\d))$/
        }
    },
    created(){
        this.get_multi_vlan();
    },
    activated(){
        this.get_multi_vlan();
    },
    methods: {
        //  获取组播VLAN列表
        get_multi_vlan(){
            var url = this.change_url.get_multi_vlan;
            this.$http.get(url).then(res=>{
                if(res.data.code === 1){
                    this.mv_info = res.data;
                    if(res.data.data && res.data.data.length > 0){
                        //  created  第一次创建组件时
                        if(!this.mvlan){
                            this.mvlan = res.data.data[0].mvlan;
                            this.router_plist = res.data.data[0];
                            return
                        }
                        for(var i=0,len=res.data.data.length;i<len;i++){
                            //  mvlan存在  且在列表中时
                            if(res.data.data[i].mvlan === this.mvlan){ 
                                this.get_mc_unknow();
                                this.get_program();
                                this.router_plist = res.data.data[i];
                                return
                            }
                        }
                        //  mvlan存在 并且不在返回列表中时
                        this.mvlan = 0;     //  触发 watcher
                        this.mvlan = res.data.data[0].mvlan;
                        this.router_plist = res.data.data[0];
                    }
                }else{
                    this.mv_info = {};
                }
            }).catch(err=>{
                // to do
            })
        },
        //  获取未知多播策略信息
        get_mc_unknow(){
            var url = this.change_url.get_mc_unknow;
            if(this.change_url.beta === 'beta'){
                url = this.change_url.get_mc_unknow + this.mvlan;
            }
            this.$http.get(url).then(res=>{
                if(res.data.code === 1){
                    this.mc_unknown_info = res.data;
                }else{
                    this.mc_unknown_info = {};
                }
            }).catch(err=>{
                // to do
            })
        },
        //  获取节目库信息
        get_program(){
            var url = this.change_url.get_program ;
            if(this.change_url.beta === 'beta'){
                url = this.change_url.get_program + this.mvlan;
            }
            this.$http.get(url).then(res=>{
                if(res.data.code === 1){
                    this.program = res.data;
                }else{
                    this.program = {};
                }
            }).catch(err=>{
                // to do
            })
        },
        //  打开配置模态框
        open_cfg_modal(){
            this.is_cfg_mv = true;
        },
        //  关闭配置模态框
        close_cfg_modal(){
            this.is_cfg_mv = false;
            this.program_s = '';
            this.program_e = '';
            this.program_desc = '';
        },
        //  提交修改
        submit_cfg(){
            if(this.mark_mode === 0){
                if(this.mark_type === 0){       //  删除节目库
                    if(!this.reg_ip.test(this.program_s)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error'] + ': ' + this.lanMap['program_s']
                        })
                        return
                    }
                    if(!this.reg_ip.test(this.program_e)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error'] + ': ' + this.lanMap['program_e']
                        })
                        return
                    }
                    this.del_program();
                }
                if(this.mark_type === 1){       //  删除路由端口
                    if(!this.router_portlist){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error'] + ': ' + this.lanMap['program']
                        })
                        return 
                    }
                    this.del_router_port();
                }
            }
            if(this.mark_mode === 1){
                if(this.mark_type === 0){       //  添加节目库
                    if(!this.reg_ip.test(this.program_s)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error'] + ': ' + this.lanMap['program_s']
                        })
                        return
                    }
                    if(!this.reg_ip.test(this.program_e)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error'] + ': ' + this.lanMap['program_e']
                        })
                        return
                    }
                    if(this.program_desc.length > 64){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error'] + ': ' + this.lanMap['program_desc']
                        })
                        return
                    }
                    this.add_program();
                }
                if(this.mark_type === 1){       //  添加路由端口
                    if(!this.router_portlist){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error'] + ': ' + this.lanMap['program']
                        })
                        return 
                    }
                    this.add_router_port();
                }
            }
            if(this.mark_mode === 2){
                if(this.mark_type === 2){       //  修改未知多播策略
                    if(this.mc_unknown_info.data.mc_unknown_policy === this.modify_unknow_policy){
                        this.$message({
                            type: 'info',
                            text: this.lanMap['mofidy_tips']
                        })
                        return
                    }
                    this.modify_unknow_policy();
                }
            }
            this.close_cfg_modal();
        },
        //  节目库增加节目
        add_program(){
            var post_param = {
                "method":"add",
                "param":{
                    "mvlan": this.mvlan,
                    "program_s": this.program_s,
                    "program_e": this.program_e,
                    "program_desc": this.program_desc
                }
            }
            this.$http.post('/switch_igmp?form=program',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['add'] + this.lanMap['st_success']
                    })
                    this.get_program();
                }else if(res.data.code > 1){
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
        },
        //  节目库删除节目
        del_program(){
            var post_param = {
                "method":"delete",
                "param":{
                    "mvlan": this.mvlan,
                    "program_s": this.program_s, 
                    "program_e": this.program_e,
                    "program_desc": ''
                }
            }
            this.$http.post('/switch_igmp?form=program',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['delete'] + this.lanMap['st_success']
                    })
                    this.get_program();
                }else if(res.data.code > 1){
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
        },
        //  添加路由端口
        add_router_port(){
            var post_param = {
                "method":"add",
                "param":{
                    "mvlan": this.mvlan,
                    "router_portlist": this.router_portlist.replace(/\d/g,n=>new String(Number(n) + this.system.data.ponports))
                }
            }
            this.$http.post('/switch_igmp?form=router_port',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['add'] + this.lanMap['st_success']
                    })
                    this.get_multi_vlan();
                }else if(res.data.code > 1){
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
        },
        //  删除路由端口
        del_router_port(){
            var post_param = {
                "method":"delete",
                "param":{
                    "mvlan": this.mvlan,
                    "router_portlist": this.router_portlist.replace(/\d/g,n=>new String(Number(n) + this.system.data.ponports))
                }
            }
            this.$http.post('/switch_igmp?form=router_port',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['add'] + this.lanMap['st_success']
                    })
                    this.get_multi_vlan();
                }else if(res.data.code > 1){
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
        },
        //  设置未知多播策略
        modify_unknow_policy(){
            var post_param = {
                "method":"set",
                "param":{
                    "mvlan": this.mvlan,
                    "mc_unknown_policy": this.mc_unknown_policy
                }
            }
            this.$http.post('/switch_igmp?form=mc_unknown',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['add'] + this.lanMap['st_success']
                    })
                    this.get_mc_unknow();
                }else if(res.data.code > 1){
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
        },
        //  删除MVLAN
        open_delmvlan(){
            this.is_del_mvlan = true;
        },
        //  删除MVLAN选择结果
        result_delmvlan(bool){
            if(bool){
                var post_param = {
                    "method":"destroy",
                    "param":{
                        "mvlan": this.mvlan,
                        "mvlan_desc": ""
                    }
                }
                this.$http.post('/switch_igmp?form=multicast_vlan',post_param).then(res=>{
                    if(res.data.code === 1){
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap['delete'] + this.lanMap['st_success']
                        })
                        this.get_multi_vlan();
                    }else if(res.data.code > 1){
                        this.$message({
                            type: res.data.type,
                            text: '(' + res.data.code + ') ' + res.data.message
                        })
                    }
                }).catch(err=>{
                    // to do
                })
            }
            this.is_del_mvlan = false;
        },
        //  创建 mvlan
        open_create_mvlan(flag){
            this.is_create_mvlan = true;
            if(!flag){
                this.is_set_mvdesc = true;
                this.mvlan_desc = this.router_plist.mvlan_desc;
            }
            this.create_mvlan = '';
        },
        //  关闭  mvlan 创建模态框
        close_create_mvlan(){
            this.is_create_mvlan = false;
            this.is_set_mvdesc = false;
            this.create_mvlan = '';
        },
        //  提交 mvlan 创建信息
        submit_create_mvlan(){
            if(this.create_mvlan < 1 || this.create_mvlan > 4094 || isNaN(this.create_mvlan)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['vlanid_range_hit']
                })
                return
            }
            if(this.mvlan_desc.length > 64){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['mvlan_desc']
                })
                return
            }
            var post_param = {
                "method":"create",
                "param":{
                    "mvlan": this.create_mvlan
                }
            }
            this.$http.post('/switch_igmp?form=multicast_vlan',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['create'] + this.lanMap['st_success']
                    })
                    this.get_multi_vlan();
                }else if(res.data.code > 1){
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_create_mvlan();
        },
        //  设置MVLAN描述信息
        submit_set_mvdesc(){
            if(!this.mvlan_desc || this.mvlan_desc.length > 64){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['desc']
                })
                return
            }
            var post_param = {
                    "method":"set",
                    "param":{
                        "mvlan": this.mvlan,
                        "mvlan_desc": this.mvlan_desc
                    }
                }
            this.$http.post('/switch_igmp?form=multicast_vlan_desc',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['st_success']
                    })
                    this.get_multi_vlan();
                }else{
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_create_mvlan();
        },
        //  配置节目库描述信息
        open_cfg_pro_desc(node){
            this.is_set_program_desc = true;
            this.program_item = node;
            this.program_desc = node.program_desc;
        },
        close_cfg_pro_desc(){
            this.is_set_program_desc = false;
            this.program_item = {};
            this.program_desc = '';
        },
        submit_program_desc(){
            if(this.program_desc.length > 64){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['program_desc']
                })
                return
            }
            var post_param = {
                "method":"add",
                "param":{
                    "mvlan": this.mvlan,
                    "program_s": this.program_item.program_s,
                    "program_e": this.program_item.program_e,
                    "program_desc": this.program_desc
                }
            }
            this.$http.post('/switch_igmp?form=program',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['add'] + this.lanMap['st_success']
                    })
                    this.get_program();
                }else if(res.data.code > 1){
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_cfg_pro_desc();
        },
        //  单个节目库删除处理函数
        open_del_single_program(node){
            this.is_del_program = true;
            this.program_item = node;
        },
        del_single_program(bool){
            if(bool){
                var post_param = {
                    "method":"delete",
                    "param":{
                        "mvlan": this.mvlan,
                        "program_s": this.program_item.program_s,
                        "program_e": this.program_item.program_e,
                        "program_desc": this.program_item.program_desc
                    }
                }
                this.$http.post('/switch_igmp?form=program',post_param).then(res=>{
                    if(res.data.code === 1){
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap['delete'] + this.lanMap['st_success']
                        })
                        this.get_program();
                    }else if(res.data.code > 1){
                        this.$message({
                            type: res.data.type,
                            text: '(' + res.data.code + ') ' + res.data.message
                        })
                    }
                }).catch(err=>{
                    // to do
                })
            }
            this.is_del_program = false;
            this.program_item = {};
        }
    },
    watch: {
        'mvlan'(){
            if(!this.mvlan) return
            this.mv_info.data.forEach(item=>{
                if(item.mvlan === this.mvlan){
                    this.router_plist = item;
                }
            })
            this.get_mc_unknow();
            this.get_program();
        },
        'mark_mode'(){
            if(this.mark_mode === 2){
                this.mark_type = 2;
            }else if(this.mark_mode === 0){
                if(this.mark_type === 1 && (!this.router_plist || !this.router_plist.router_portlist)){
                    this.mark_mode = 1;
                    return
                }
                this.router_portlist = this.router_plist.router_portlist.replace(/\d/g,n=>new String(Number(n) - this.system.data.ponports));
                if(this.mark_type === 0 &&(!this.mc_unknown_info.data)){
                    this.mark_mode = 1;
                    return
                }
                this.mc_unknown_policy = this.mc_unknown_info.data.mc_unknown_policy;
            }else{
                this.mark_type = 1;
            }
        },
        'mark_type'(){
            if(this.mark_type === 1 && (!this.router_plist || !this.router_plist.router_portlist)){
                this.mark_mode = 1;
                return
            }
            this.router_portlist = this.router_plist.router_portlist;
            if(this.mark_type === 0 &&(!this.mc_unknown_info.data)){
                this.mark_mode = 1;
                return
            }
            this.mc_unknown_policy = this.mc_unknown_info.data.mc_unknown_policy;
        }
    }
}
</script>

<style lang="less" scoped>
a{
    width: 100px;
    padding: 0;
    margin-left: 100px;
}
select{
    width: 200px;
    height: 30px;
    text-indent: 6px;
    border-radius: 3px;
    font-size: 16px;
}
div.multi-vlan{
    >div:first-child{
        span:first-child{
            font-size: 18px;
            color: #67aef7;
            display: inline-block;
            width: 200px;
        }
        a{
            margin: 0;
        }
    }
}
div.multi-vlan-content{
    div{
        height: 36px;
        line-height: 36px;
        border: 1px solid #ccc;
        border-bottom: none;
        overflow: hidden;
        &:first-child{
            margin-top: 15px;
        }
        select{
            width: 120px;
            height: 28px;
        }
        >span:first-child{
            display: inline-block;
            width: 220px;
            margin-left: 20px;
        }
        span.cfg-multi-vlan{
            float: right;
            margin-right: 50px;
            a{
                margin-left: 30px;
            }
        }
    }
    div.program{
        height: auto;
        border-bottom: 1px solid #ccc;
        &:after{
            content: '';
            display: table;
            clear: both;
        }
        >span{
            display: block;
            float: left;
            width: 15%;
            margin-left: 0;
            box-sizing: border-box;
            padding-left: 20px;
        }
        >span:last-child{
            width: 85%;
            >span{
                display: block;
                line-height: 28px;
                height: 28px;
                overflow: hidden;
                width: 100%;
                border-bottom: 1px solid #ddd;
                &:last-child{
                    border: none;
                }
                >span{
                    display: inline-block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    vertical-align: middle;
                    box-sizing: border-box;
                    width: 43%;
                    &:first-child{
                        width: 32%;
                        border-left: 1px solid #ddd;
                        text-indent: 6px;
                    }
                }
                >span:last-child{
                    width: 24%;
                    padding: 0;
                    margin-left: 0;
                    text-align: center;
                    float: right;
                    height: 28px;
                    line-height: 28px;
                }
                a{
                    width: 80px;
                    height: 24px;
                    line-height: 24px;
                    margin-left: 0;
                    vertical-align: middle;
                }
            }
        }
    }
}
div.multi-vlan-set{
    width: 500px;
    height: 310px;
    h3+div{
        margin-top: 10px;
    }
    div:first-child{
        height: 36px;
        line-height: 36px;
        span{
            display: inline-block;
            width: 180px;
            text-align: center;
            &+span{
                text-align: left;
                text-indent: 10px;
            }
        }
        div:last-child{
            margin-top: 12px;
        }
        div.ip-range{
            input{
                width: 135px;
            }
        }
    }
    textarea{
        width: 280px;
        height: 100px;
        border-color: #ccc;
        line-height: 24px;
        padding: 0 6px;
        font-size: 16px;
        resize: none;
        vertical-align: top;
        margin: 10px 0 0 0;
    }
    div.program-desc{
        height: 110px;
    }
    div{
        height: 36px;
        line-height: 36px;
    }
    div.multi-tips{
        font-size: 14px;
        color: #333;
        text-align: center;
    }
}
div.create-mvlan-modal{
    width: 500px;
    height: 260px;
    h3+div{
        margin-top: 10px;
    }
    textarea{
        width: 240px;
        height: 100px;
        border-color: #ccc;
        line-height: 24px;
        padding: 0 6px;
        font-size: 16px;
        resize: none;
        vertical-align: top;
        margin: 10px 0 0 0;
    }
    input{
        width: 252px;
    }
    div:first-child{
        height: 36px;
        line-height: 36px;
        span{
            display: inline-block;
            width: 180px;
            text-align: center;
            &:last-child{
                text-align: left;
            }
        }
        div:last-child{
            margin-top: 10px;
        }
        div.ip-range{
            input{
                width: 135px;
            }
        }
    }
}
div.set-program-desc{
    width: 455px;
    height: 370px;
    div.close{
        height: 60px;
        line-height: 60px;
        margin: 0;
    }
    .text-box{
        height: 120px;
        margin: 0;
    }
    >div{
        height: 30px;
        margin: 10px 0;
        line-height: 30px;
        >span:first-child{
            display: inline-block;
            width: 150px;
            margin-left: 30px;
        }
        span.desc-title-align{
            width: 80%;
        }
        textarea{
            width: 378px;
            height: 100px;
            border-color: #ccc;
            border-radius: 5px;
            line-height: 24px;
            padding: 0 6px;
            font-size: 16px;
            resize: none;
            vertical-align: top;
            margin: 10px 0 0 0;
            margin-left: 30px;
        }
        a{
            margin: 0 0 0 85px;
            width: 100px;
            padding: 0;
        }
    }
}
</style>
