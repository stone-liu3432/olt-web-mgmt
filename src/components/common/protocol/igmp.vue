<template>
    <div class="igmp">
        <h2>IGMP</h2>
        <hr>
        <tabBar :tab="['info','multicast_table','mvlan']" @togglePage="select_page"></tabBar>
        <div v-if="show_index === 'info'">
            <span>IGMP{{ lanMap['info'] }}</span>
            <span>
                <a href="javascript:void(0);" @click="open_multicast_st">{{ lanMap['config'] }}</a>
            </span>
        </div>
        <!-- 组播配置信息  根据Mode不同时的不同显示项 -->
        <ul v-if="igmp_info.data && show_index === 'info'">
            <li>
                <span>{{ lanMap['mode'] }}</span>
                <span>{{ mode[igmp_info.data.mode] }}</span>
            </li>
            <li v-for="(item,key) in igmp_info.data" :key="key" v-if="igmp_info.data.mode === 1 && (key === 'fast_leave' || key === 'protocol_policy' || key === 'group_aging_time')">
                <span>{{ lanMap[key] }}</span>
                <span v-if="key !== 'fast_leave' && key !== 'protocol_policy'">
                    {{ item }}
                    <span v-if=" key === 'group_aging_time' || key === 'gen_response_time' || key === 'gen_query_interval'">s</span>
                    <span v-if=" key === 'sp_response_time' || key === 'sp_query_interval'">ms</span>
                </span>
                <span v-if="key === 'fast_leave'">{{ item ? 'enable' : 'disable' }}</span>
                <span v-if="key === 'protocol_policy'">{{ item ? 'discard' : 'pass' }}</span>
            </li>
            <li v-for="(item,key) in igmp_info.data" :key="key" v-if="igmp_info.data.mode === 2 && key !== 'mode' && key !== 'group_aging_time'">
                <span>{{ lanMap[key] }}</span>
                <span v-if="key !== 'fast_leave' && key !== 'protocol_policy'">
                    {{ item }}
                    <span v-if=" key === 'group_aging_time' || key === 'gen_response_time' || key === 'gen_query_interval'">s</span>
                    <span v-if=" key === 'sp_response_time' || key === 'sp_query_interval'">ms</span>
                </span>
                <span v-if="key === 'fast_leave'">{{ item ? 'enable' : 'disable' }}</span>
                <span v-if="key === 'protocol_policy'">{{ item ? 'discard' : 'pass' }}</span>
            </li>
        </ul>
        <multicast v-if="show_index === 'multicast_table'"></multicast>
        <multi-vlan v-if="show_index === 'mvlan'"></multi-vlan>
        <div class="modal-dialog" v-if="show_multicast">
            <div class="cover"></div>
            <div class="igmp-group-modal">
                <h3 class="modal-header">IGMP {{ lanMap['config'] }}</h3>
                <div>
                    <div>
                        <span>{{ lanMap['mode'] }}</span>
                        <select v-model.number="igmp_param.mode">
                            <option value="0">disable</option>
                            <option value="1">snooping</option>
                            <option value="2">proxy</option>
                        </select>
                    </div>
                    <div>
                        <span>{{ lanMap['protocol_policy'] }}</span>
                        <select v-model.number="igmp_param.protocol_policy" :disabled="igmp_param.mode === 0">
                            <option value="0">pass</option>
                            <option value="1">discard</option>
                        </select>
                    </div>
                    <div>
                        <span>{{ lanMap['fast_leave'] }}</span>
                        <select v-model.number="igmp_param.fast_leave" :disabled="igmp_param.mode === 0">
                            <option value="0">disable</option>
                            <option value="1">enable</option>
                        </select>
                    </div>
                    <div>
                        <span>{{ lanMap['group_aging_time'] }}</span>
                        <input type="text" v-model.number="igmp_param.group_aging_time"  :disabled="igmp_param.mode === 0 || igmp_param.mode === 2" placeholder="1-3000s"
                         :style="{'border-color': igmp_param.mode === 1 && igmp_param.group_aging_time !== '' && (igmp_param.group_aging_time < 1 || igmp_param.group_aging_time > 3000 || isNaN(igmp_param.group_aging_time)) ? 'red' : ''}">
                        <span> s</span>
                    </div>
                    <div>
                        <span>{{ lanMap['robustness'] }}</span>
                        <input type="text" v-model.number="igmp_param.robustness"  :disabled="igmp_param.mode === 0 || igmp_param.mode === 1" placeholder="1-10"
                         :style="{'border-color': igmp_param.mode === 2 && igmp_param.robustness !== '' && (igmp_param.robustness < 1 || igmp_param.robustness > 10 || isNaN(igmp_param.robustness)) ? 'red' : ''}">
                    </div>
                    <div>
                        <span>{{ lanMap['gen_response_time'] }}</span>
                        <input type="text" v-model.number="igmp_param.gen_response_time"  :disabled="igmp_param.mode === 0 || igmp_param.mode === 1" placeholder="1-25s"
                         :style="{'border-color': igmp_param.mode === 2 && igmp_param.gen_response_time !== '' && (igmp_param.gen_response_time < 1 || igmp_param.gen_response_time > 25 || isNaN(igmp_param.gen_response_time)) ? 'red' : ''}">
                        <span> s</span>
                    </div>
                    <div>
                        <span>{{ lanMap['gen_query_interval'] }}</span>
                        <input type="text" v-model.number="igmp_param.gen_query_interval"  :disabled="igmp_param.mode === 0 || igmp_param.mode === 1" placeholder="2-3000s"
                         :style="{'border-color': igmp_param.mode === 2 && igmp_param.gen_query_interval !== '' && (igmp_param.gen_query_interval < 2 || igmp_param.gen_query_interval > 3000 || isNaN(igmp_param.gen_query_interval)) ? 'red' : ''}">
                        <span> s</span>
                    </div>
                    <div>
                        <span>{{ lanMap['query_src_ip'] }}</span>
                        <input type="text" v-model.trim="igmp_param.query_src_ip"  :disabled="igmp_param.mode === 0 || igmp_param.mode === 1" placeholder="127.0.0.1"
                         :style="{'border-color': igmp_param.mode === 2 && igmp_param.query_src_ip !== '' && !reg_ip.test(igmp_param.query_src_ip) ? 'red' : ''}">
                    </div>
                    <div>
                        <span>{{ lanMap['query_src_mac'] }}</span>
                        <input type="text" v-model.trim="igmp_param.query_src_mac"  :disabled="igmp_param.mode === 0 || igmp_param.mode === 1" placeholder="00:00:00:00:00:00"
                         :style="{'border-color': igmp_param.mode === 2 && igmp_param.query_src_mac !== '' && !reg_mac.test(igmp_param.query_src_mac) ? 'red' : ''}">
                    </div>
                    <div>
                        <span>{{ lanMap['sp_query_interval'] }}</span>
                        <input type="text" v-model.number="igmp_param.sp_query_interval"  :disabled="igmp_param.mode === 0 || igmp_param.mode === 1" placeholder="100-10000ms"
                         :style="{'border-color': igmp_param.mode === 2 && igmp_param.sp_query_interval !== '' && (igmp_param.sp_query_interval < 100 || igmp_param.sp_query_interval > 10000 || isNaN(igmp_param.sp_query_interval)) ? 'red' : ''}">
                        <span> ms</span>
                    </div>
                    <div>
                        <span>{{ lanMap['sp_response_time'] }}</span>
                        <input type="text" v-model.number="igmp_param.sp_response_time"  :disabled="igmp_param.mode === 0 || igmp_param.mode === 1" placeholder="100-10000ms"
                         :style="{'border-color': igmp_param.mode === 2 && igmp_param.sp_response_time !== '' && (igmp_param.sp_response_time < 100 || igmp_param.sp_response_time > 10000 || isNaN(igmp_param.sp_response_time)) ? 'red' : ''}">
                        <span> ms</span>
                    </div>
                    <div>
                        <span>{{ lanMap['sp_query_number'] }}</span>
                        <input type="text" v-model.number="igmp_param.sp_query_number"  :disabled="igmp_param.mode === 0 || igmp_param.mode === 1" placeholder="1-10"
                         :style="{'border-color': igmp_param.mode === 2 && igmp_param.sp_query_number !== '' && (igmp_param.sp_query_number < 1 || igmp_param.sp_query_number > 10 || isNaN(igmp_param.sp_query_number)) ? 'red' : ''}">
                    </div>
                    <div>
                        <a href="javascript:void(0);" @click="submit_multicast_st">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="close_multicast_st">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="close_multicast_st"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import multicast from './igmp/multicast'
import multiVlan from './igmp/multiVlan'
export default {
    name: 'igmp',
    computed: mapState(['lanMap','change_url']),
    components: { multicast,multiVlan },
    data(){
        return {
            mode: ['disable','snooping','proxy'],
            //  igmp info
            igmp_info: {},
            //  组播模态框打开/关闭
            show_multicast: false,
            show_index: 'info',
            //  数据绑定
            igmp_param: {
                "mode": 0,
                "fast_leave": 0,
                "protocol_policy": 0,
                "group_aging_time": 0,
                "robustness": 0,
                "query_src_ip": "",
                "query_src_mac": "",
                "gen_response_time": 0,
                "gen_query_interval": 0,
                "sp_response_time": 0,
                "sp_query_interval": 0,
                "sp_query_number": 0
            },
            reg_ip: /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)|\d))$/,
            reg_mac: /^[0-9abcdefABCDEF]{2}(\:[0-9abcdefABCDEFF]{2}){5}$/
        }
    },
    created(){
        this.get_igmp_info();
    },
    activated(){
        this.get_igmp_info();
    },
    methods: {
        select_page(page){
            this.show_index = page;
            if(this.show_index === 'info'){
                this.get_igmp_info();
            }
        },
        get_igmp_info(){
            this.$http.get(this.change_url.get_igmp).then(res=>{
                if(res.data.code === 1){
                    this.igmp_info = res.data;
                }else{
                    this.igmp_info = {};
                }
            }).catch(err=>{
                // to do
            })
        },
        //  打开组播设置模态框
        open_multicast_st(){
            this.show_multicast = true;
            if(this.igmp_info.data){
                for(var key in this.igmp_param){
                    this.igmp_param[key] = this.igmp_info.data[key];
                }
            }
        },
        //  关闭组播设置模态框
        close_multicast_st(){
            this.show_multicast = false;
            for(var key in this.igmp_param){
                this.igmp_param[key] = '';
            }
        },
        //  组播设置模态框内提交按钮
        submit_multicast_st(){
            var flags = 0;
            if(this.igmp_param.protocol_policy !== this.igmp_info.data.protocol_policy){
                flags += 0x02;
            }
            if(this.igmp_param.fast_leave !== this.igmp_info.data.fast_leave){
                flags += 0x04;
            }
            if(this.igmp_param.group_aging_time !== this.igmp_info.data.group_aging_time){
                flags += 0x08;
            }
            if(this.igmp_param.robustness !== this.igmp_info.data.robustness){
                flags += 0x10;
            }
            if(this.igmp_param.gen_response_time !== this.igmp_info.data.gen_response_time){
                flags += 0x20;
            }
            if(this.igmp_param.gen_query_interval !== this.igmp_info.data.gen_query_interval){
                flags += 0x40;
            }
            if(this.igmp_param.query_src_ip !== this.igmp_info.data.query_src_ip){
                flags += 0x80;
            }
            if(this.igmp_param.query_src_mac !== this.igmp_info.data.query_src_mac){
                flags += 0x100;
            }
            if(this.igmp_param.sp_query_interval !== this.igmp_info.data.sp_query_interval){
                flags += 0x200;
            }
            if(this.igmp_param.sp_response_time !== this.igmp_info.data.sp_response_time){
                flags += 0x400;
            }
            if(this.igmp_param.sp_query_number !== this.igmp_info.data.sp_query_number){
                flags += 0x800;
            }
            if(!flags && this.igmp_param.mode === this.igmp_info.data.mode){
                this.$message({
                    type: 'info',
                    text: this.lanMap['modify_tips']
                })
                return
            }
            if(this.igmp_param.mode === 1 &&( this.igmp_param.group_aging_time < 1 || this.igmp_param.group_aging_time > 3000 || isNaN(this.igmp_param.group_aging_time))){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['group_aging_time']
                })
                return
            }
            if(this.igmp_param.mode === 2 &&(this.igmp_param.robustness < 1 || this.igmp_param.robustness > 10 || isNaN(this.igmp_param.robustness))){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['robustness']
                })
                return
            }
            if(this.igmp_param.mode === 2 &&(this.igmp_param.gen_response_time < 1 || this.igmp_param.gen_response_time > 25 || isNaN(this.igmp_param.gen_response_time))){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['gen_response_time']
                })
                return
            }
            if(this.igmp_param.mode === 2 &&(this.igmp_param.gen_query_interval < 2 || this.igmp_param.gen_query_interval > 3000 || isNaN(this.igmp_param.gen_query_interval))){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['gen_query_interval']
                })
                return
            }
            if(this.igmp_param.mode === 2 &&(this.igmp_param.sp_response_time < 100 || this.igmp_param.sp_response_time > 10000 || isNaN(this.igmp_param.sp_response_time))){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['sp_response_time']
                })
                return
            }
            if(this.igmp_param.mode === 2 &&(this.igmp_param.sp_query_interval < 100 || this.igmp_param.sp_query_interval > 10000 || isNaN(this.igmp_param.sp_query_interval))){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['sp_query_interval']
                })
                return
            }
            if(this.igmp_param.mode === 2 &&(this.igmp_param.sp_query_number < 1 || this.igmp_param.sp_query_number > 10 || isNaN(this.igmp_param.sp_query_number))){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['sp_query_number']
                })
                return
            }
            if(this.igmp_param.mode === 2 && !this.reg_ip.test(this.igmp_param.query_src_ip)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['query_src_ip']
                })
                return
            }
            if(this.igmp_param.mode === 2 && !this.reg_mac.test(this.igmp_param.query_src_mac)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['query_src_mac']
                })
                return
            }
            if(this.igmp_info.data.mode === this.igmp_param.mode){
                this.cfg_multicast(flags);
                return
            }
            var param_mode = {
                "method":"set",
                "param":{
                    "mode": this.igmp_param.mode
                }
            }
            this.$http.post('/switch_igmp?form=mode',param_mode).then(res=>{
                if(res.data.code === 1){
                    this.cfg_multicast(flags);
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
        //  设置mode成功后的回调
        cfg_multicast(flag){
            var param_multicast = {
                "method":"set",
                "param":{
                    "flags": flag,
                    "protocol_policy": this.igmp_param.protocol_policy,
                    "fast_leave": this.igmp_param.fast_leave,
                    "group_aging_time": this.igmp_param.group_aging_time,
                    "robustness": this.igmp_param.robustness,
                    "gen_response_time": this.igmp_param.gen_response_time,
                    "gen_query_interval": this.igmp_param.gen_query_interval,
                    "query_src_ip": this.igmp_param.query_src_ip,
                    "query_src_mac": this.igmp_param.query_src_mac,
                    "sp_query_interval": this.igmp_param.sp_query_interval,
                    "sp_response_time": this.igmp_param.sp_response_time,
                    "sp_query_number": this.igmp_param.sp_query_number
                }
            }
            this.$http.post('/switch_igmp?form=config',param_multicast).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['setting_ok']
                    })
                    this.get_igmp_info();
                }else if(res.data.code > 1){
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_multicast_st();
        }
    }
}
</script>

<style lang="less" scoped>
a{
    margin-left: 100px;
}
h2{
    font-size: 24px;
    color: #67AEF7;
    font-weight: 600;
    margin: 10px 0;
}
select{
    width: 200px;
    height: 30px;
    text-indent: 6px;
    border-radius: 3px;
    font-size: 16px;
}
input:disabled,select:disabled{
    cursor: not-allowed;
}
div.igmp{
    >div{
        margin: 30px 0 20px 10px;
        >span{
            font-size: 18px;
            color: #67aef7;
            display: inline-block;
            width: 200px;
            a{
                margin: 0;
            }
        }
    }
}
div+ul{
    margin: 20px 0 20px 10px;
    li{
        height: 30px;
        line-height: 30px;
        border: 1px solid #ccc;
        border-top: none;
        &:first-child{
            border-top: 1px solid #ccc;
        }
        >span{
            padding-left: 20px;
        }
        >span:first-child{
            display: inline-block;
            width: 220px;
            border-right: 1px solid #ccc;
        }
    }
}
div.igmp-group-modal{
    width: 500px;
    height: 620px;
    >div{
        div{
            height: 30px;
            line-height: 30px;
            margin: 10px 0;
            span:first-child{
                display: inline-block;
                width: 220px;
                text-align: center;
            }
        }
        a{
            margin-left: 100px;
            margin-top: 20px;
        }
    }
}
div.portvlan-tab{
    margin-top: 30px !important;
    border-bottom: 3px solid #67aef7;
    padding-left: 10px;
    &::after{
        content: '';
        display: table;
        clear: both;
    }
    >div{
        float: left;
        margin-left: 5px;
        border: 1px solid #67aef7;
        margin-bottom: -1px;
        border-radius: 3px 3px 0 0;
        cursor: pointer;
        padding: 0 30px;
        text-align: center;
        height: 30px;
        line-height: 30px;
    }
    .actived{
        border: 1px solid #67aef7;
        border-radius: 3px 3px 0 0;
        color: #fff;
        background: #67aef7;
        font-weight: 500;
    }
}
</style>
