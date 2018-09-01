<template>
    <div class="multi-vlan">
        <div>
            <span>{{ lanMap['mvlan'] }}</span>
            <span>
                <a href="javascript:void(0);" @click="open_create_mvlan">{{ lanMap['create'] }}</a>
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
            </div>
            <div>
                <span>{{ lanMap['router_portlist'] }}</span>
                <span>{{ analysis(router_plist.router_portlist) }}</span>
            </div>
            <div>
                <span>{{ lanMap['mc_unknown_policy'] }}</span>
                <span>{{ mc_unknow_info.mc_unknown_policy ? lanMap['discard'] : lanMap['transparent'] }}</span>
            </div>
            <div class="program">
                <span>{{ lanMap['program'] }}</span>
                <span>
                    <span v-for="(item,index) in program.data" :key="index">
                        <span>
                            {{ item.program_s === item.program_e ? item.program_s : item.program_s  + ' - ' + item.program_e}}
                        </span>
                        <span>{{ item.program_desc }}</span>
                    </span>
                </span>
            </div>
        </div>
        <div class="modal-dialog" v-if="is_cfg_mv">
            <div class="cover"></div>
            <div class="multi-vlan-set" :style="{ 'height' : mark_type === 0 && mark_mode === 1 ? '400px' : '' }">
                <div>
                    <h3>{{ lanMap['config'] }}</h3>
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
            <div class="create-mvlan-modal">
                <div>
                    <h3>{{ lanMap['create'] + ' ' + lanMap['mvlan']}}</h3>
                    <div>
                        <span>{{ lanMap['vlan_id'] }}</span>
                        <input type="text" v-model.number="create_mvlan" v-focus 
                         :style="{ 'border-color': create_mvlan !== '' && (create_mvlan > 4094 || create_mvlan < 1 || isNaN(create_mvlan)) ? 'red' : ''}">
                    </div>
                    <div>
                        <span>{{ lanMap['mvlan_desc'] }}</span>
                        <textarea spellcheck="false" v-model="mvlan_desc" placeholder="0-64 characters"
                         :style="{ 'border-color': mvlan_desc.length > 64 ? 'red' : '' }"></textarea>
                    </div>
                    <div>
                        <a href="javascript:void(0);" @click="submit_create_mvlan">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="close_create_mvlan">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="close_create_mvlan"></div>
            </div>
        </div>
        <confirm v-if="is_del_mvlan" @choose="result_delmvlan"></confirm>
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
            mc_unknow_info: {},
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
            create_mvlan: '',
            reg_ip: /^(([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){1}((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4]){1}$/
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
                    this.mc_unknow_info = res.data;
                }else{
                    this.mc_unknow_info = {};
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
                    if(this.mc_unknow_info.data.mc_unknown_policy === this.modify_unknow_policy){
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
                        type: 'success',
                        text: this.lanMap['add'] + this.lanMap['st_success']
                    })
                    this.get_program();
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
                        type: 'success',
                        text: this.lanMap['delete'] + this.lanMap['st_success']
                    })
                    this.get_program();
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
                        type: 'success',
                        text: this.lanMap['add'] + this.lanMap['st_success']
                    })
                    this.get_multi_vlan();
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
                        type: 'success',
                        text: this.lanMap['add'] + this.lanMap['st_success']
                    })
                    this.get_multi_vlan();
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
                        type: 'success',
                        text: this.lanMap['add'] + this.lanMap['st_success']
                    })
                    this.get_mc_unknow();
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
                            type: 'success',
                            text: this.lanMap['delete'] + this.lanMap['st_success']
                        })
                        this.get_multi_vlan();
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
            this.is_del_mvlan = false;
        },
        //  创建 mvlan
        open_create_mvlan(){
            this.is_create_mvlan = true;
            this.create_mvlan = '';
        },
        //  关闭  mvlan 创建模态框
        close_create_mvlan(){
            this.is_create_mvlan = false;
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
                    "mvlan": this.create_mvlan,
                    "mvlan_desc": this.mvlan_desc
                }
            }
            this.$http.post('/switch_igmp?form=multicast_vlan',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['create'] + this.lanMap['st_success']
                    })
                    this.get_multi_vlan();
                }else if(res.data.code > 1){
                    this.$message({
                        type: 'error',
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_create_mvlan();
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
            return this.nomenclature(result)
        },
        //  根据返回数据，命名端口号
        nomenclature(arr){
            if(!arr) return ''
            var results = '';
            var pon_count = this.system.data.ponports,ge_count = this.system.data.geports;
            for(var i=0,len=arr.length;i<len;i++){
                var m = arr[i];
                if(m <= pon_count){
                    results += pon_count < 10 ? 'PON0'+ m + ',' : 'PON' + m +',';
                }else if(m > pon_count && m <= (pon_count + ge_count)){
                    results += (m - pon_count) < 10 ? 'GE0' + (m - pon_count) + ',' : 'GE' + (m - pon_count) + ',';
                }else{
                    results += (m - (pon_count + ge_count)) < 10 ? 'XGE0' + (m - (pon_count + ge_count)) + ',' : 'XGE' + (m - (pon_count + ge_count)) + ',';
                }
            }
            return results.replace(/\,$/,'');
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
                if(this.mark_type === 0 &&(!this.mc_unknow_info.data)){
                    this.mark_mode = 1;
                    return
                }
                this.mc_unknown_policy = this.mc_unknow_info.data.mc_unknown_policy;
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
            if(this.mark_type === 0 &&(!this.mc_unknow_info.data)){
                this.mark_mode = 1;
                return
            }
            this.mc_unknown_policy = this.mc_unknow_info.data.mc_unknown_policy;
        }
    }
}
</script>

<style lang="less" scoped>
a{
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
        }
        >span:last-child{
            >span{
                display: block;
                line-height: 28px;
                height: 28px;
                overflow: hidden;
                >span{
                    display: inline-block;
                    &:last-child{
                        margin-left: 30px;
                    }
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
        }
    }
}
div.multi-vlan-set{
    width: 500px;
    height: 300px;
    h3{
        height: 50px;
        line-height: 50px;
        color: #67aef7;
        font-size: 22px;
        font-weight: 500;
        padding-left: 20px;
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
    h3{
        height: 50px;
        line-height: 50px;
        color: #67aef7;
        font-size: 22px;
        font-weight: 500;
        padding-left: 20px;
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
</style>
