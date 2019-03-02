<template>
    <div class="onu-allow">
        <div>
            <h2>{{ lanMap['onu_allow'] }}</h2>
            <span>{{ lanMap['port_id'] }}</span>
            <select v-model.number="portid">
                <option v-for="(item,key) in port_name.pon" :key="key" :value="item.id">
                    {{ item.name }}
                </option>
            </select>
        </div>
        <hr>
        <div>
            <a href="javascript:void(0);" @click="reload">{{ lanMap['refresh'] }}</a>
            <a href="javascript:void(0);" @click="add_onu">{{ lanMap['add'] }}</a>
            <a href="javascript:void(0);" @click="onu_bandwieth">{{ lanMap['sla_cfg'] }}</a>
            <!-- <a href="javascript:void(0);" @click="switch_display_mode">{{ lanMap['switch_display'] }}</a> -->
            <a href="javascript:void(0);" @click="show_batchmgmt" v-if="!is_batch_mgmt">{{ lanMap['batch_mgmt_onu'] }}</a>
            <a href="javascript:void(0);" @click="show_batchmgmt" v-else>{{ lanMap['exit_batch_onu'] }}</a>
            <div class="rt tool-tips">
                <i class="icon-tips"></i>
                <div>
                    <div>
                        <p>{{ lanMap['auth_state'] }}</p>
                        <p><i class="verified-actived"></i>{{ lanMap['tips_cfm_onu'] }}</p>
                        <p><i class="unverified"></i>{{ lanMap['tips_n_cfm_onu'] }}</p>
                    </div>
                    <div>
                        <p>{{ lanMap['config'] }}</p>
                        <p>
                            {{ lanMap['click'] }}<i class="reload"></i>{{ lanMap['tips_page_refresh'] }}
                        </p>
                        <p>
                            {{ lanMap['click'] }}<i class="onu-detail"></i>{{ lanMap['tips_onu_btn_detail'] }}
                        </p>
                        <p>
                            {{ lanMap['click'] }}<i class="onu-delete"></i>{{ lanMap['tips_onu_btn_del'] }}
                        </p>
                        <p>
                            {{ lanMap['click'] }}<i class="onu-remove"></i>{{ lanMap['tips_onu_btn_rej'] }}
                        </p>
                        <p>
                            {{ lanMap['click'] }}<i class="reset-onu"></i>{{ lanMap['tips_onu_restart'] }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-dialog" v-if="add_dialog">
            <div class="cover"></div>
            <div class="modal-content">
                <h3 class="modal-header">{{ lanMap['manual_bind'] }}</h3>
                <div class="modal-item">
                    <span>{{ lanMap['onu_id'] }}</span>
                    <input type="text" v-model="add_onuid" placeholder="1-64" v-focus>
                    <span class="tips">{{ lanMap['zero_auto_'] }}</span>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['macaddr'] }}</span>
                    <input type="text" v-model="add_macaddr" :style="{'borderColor' : add_macaddr && testMacaddr ? 'red' : ''}" placeholder="00:00:00:00:00:00">
                    <span class="tips">EX : 00:00:00:00:00:00</span>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['auth_state'] }}</span>
                    <select v-model="add_onustate">
                        <option value="1">true</option>
                        <option value="0">false</option>
                    </select>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['desc'] }}</span>
                    <input type="text" v-model="add_onudesc">
                    <span class="tips">{{ lanMap['input_desc'] }}</span>
                </div>
                <div class="modal-btn">
                    <a href="javascript:void(0);" @click="add_onuitem(true)">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" @click="add_onuitem(false)">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="closeModal"></div>
            </div>
        </div>
        <div class="search-onu" v-if="!is_batch_mgmt">
            <h3 class="lf">{{ lanMap['find'] }} ONU</h3>
            <div class="lf">
                <input type="text" v-model="search_macaddr" @input="searchonu_by_macaddr">
                <i></i>
            </div>
            <p class="lf">{{ lanMap['search_by_macaddr'] }}</p>
        </div>
        <div v-else class="search-onu batch-onu">
            <h3 class="lf">{{ lanMap['batch_mgmt_onu'] }}</h3>
            <div class="lf">
                <div class="lf">
                    <label for="select-all-onu" onselectstart="return false;">
                        <input type="checkbox" id="select-all-onu" @click="change_select_status" v-model="selectall_state">
                        <span v-if="!select_all">{{ lanMap['select_all'] }}</span>
                        <span v-else>{{ lanMap['clear_all'] }}</span>
                    </label>
                </div>
                <a href="javascript:void(0);" @click="delete_onu()">{{ lanMap['delete'] }}</a>
                <a href="javascript:void(0);" @click="remove_onu()">{{ lanMap['add_to_deny'] }}</a>
                <!-- <a href="javascript:boid(0);" @click="authstate()">{{ lanMap['modify'] + lanMap['auth_state'] }}</a> -->
            </div>
        </div>
        <ul v-if="onu_allow_list.data && onu_allow_list.data.length>0 && onu_display_style === 1">
            <li class="onulist-item">
                <span></span>
                <span v-for="(item,key) in onu_allow_list.data[0]" :key="key" v-if=" key != 'port_id' && key !== 'onu_name'">
                    {{ lanMap[key] }}
                </span>
                <span>{{ lanMap['config'] }}</span>
            </li>
            <li v-for="(item,index) in onu_allow_list.data" :key="index" class="onulist-item" :style="{ 'color' : item.status.toLowerCase() !== 'online' ? 'red' : '' }">
                <span>
                    <label :for="'ONU0'+item.port_id +'/'+ item.onu_id" v-if="is_batch_mgmt">
                        <input type="checkbox" :value="item.onu_id" v-model="batch_onulist" :id="'ONU0'+item.port_id +'/'+ item.onu_id" name="onulist">
                    </label>
                </span>
                <span :title="item.onu_name" class="onu-name-ellipsis">
                    {{ item.onu_name || 'ONU0'+item.port_id +'/'+ item.onu_id }}
                </span>
                <span>{{ item.macaddr }}</span>
                <span>{{ item.status }}</span>
                <span>
                    <span>{{ item.auth_state ? 'true' : 'false' }}</span>
                    <i :class="[item.auth_state ? 'verified-actived' : 'unverified']" @click="authstate(item)"></i>
                </span>
                <span>{{ item.register_time }}</span>
                <span>
                    <i :title="lanMap['detail']" class="onu-detail" @click="onu_detail(item.port_id,item.onu_id)"></i>
                    <i :title="lanMap['del_onu']" class="onu-delete" @click="delete_onu(item)"></i>
                    <i :title="lanMap['add_to_deny']" class="onu-remove" @click="remove_onu(item)"></i>
                    <i :title="lanMap['reboot_onu']" class="reset-onu" @click="reboot(item)"></i>
                </span>
            </li>
        </ul>
        <!-- <onuCard v-if="onu_allow_list.data && onu_allow_list.data.length > 0 && onu_display_style === 2" :onu-allow-list="onu_allow_list" 
            :batch-onulist="batch_onulist" :is-batch-mgmt="is_batch_mgmt" @updateData="getData"></onuCard> -->
        <p v-if="!onu_allow_list.data || onu_allow_list.data.length <= 0">{{ lanMap['no_more_data'] }}</p>
        <confirm :tool-tips="lanMap['tips_del_onu']" @choose="result_delete" v-if="delete_confirm"></confirm>
        <confirm :tool-tips="lanMap['tips_add_deny_onu']" @choose="result_deny" v-if="deny_confirm"></confirm>
        <confirm :tool-tips="lanMap['confirm_reboot_onu']" @choose="result_reboot" v-if="reboot_confirm"></confirm>
        <confirm :tool-tips="tips_authstate" @choose="result_authstate" v-if="authstate_confirm"></confirm>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
//import onuCard from '@/components/common/pon/onuCard'
    export default {
        name: 'onuAllow',
        //components: { onuCard },
        data(){
            return {
                onu_arrow: {},
                onu_allow_list: {},
                portid: 0,
                add_dialog: false,
                testMacaddr: false,
                add_onuid: '',
                add_macaddr: '',
                add_onustate: 0,
                add_onudesc: '',
                delete_confirm: false,
                deny_confirm: false,
                reboot_confirm: false,
                authstate_confirm: false,
                post_params: {},
                search_macaddr: '',
                tips_authstate: '',
                onu_display_style: 1,
                is_batch_mgmt: false,
                batch_onulist: [],
                select_all: false,
                selectall_state: false,
                post_url: ''
            }
        },
        computed: mapState(['lanMap','port_name','menu','change_url']),
        activated(){
            var pid = sessionStorage.getItem('pid');
            this.portid = this.$route.query.port_id || pid;
            this.getData();
        },
        created(){
            var pid = sessionStorage.getItem('pid');
            this.portid = this.$route.query.port_id || pid || 1;
            if(this.change_url.beta === 'test'){
                var url;
                if(this.change_url.onu_allow[this.change_url.onu_allow.length - 1] != '='){
                    url = this.change_url.onu_allow;
                }else{
                    url = this.change_url.onu_allow + this.portid;
                }
                this.$http.get(url).then(res=>{
                    if(res.data.code === 1){
                        this.onu_arrow = res.data;
                    }else{
                        this.onu_arrow = {};
                    }
                    this.onu_allow_list = Object.assign({},this.onu_arrow);
                    this.onu_allow_list.data.sort((a,b)=>{
                        return a.status.toLowerCase() === 'online' && b.status.toLowerCase() !== 'online';
                    })
                }).catch(err=>{
                    // to do 
                })
            }
        },
        methods:{
            ...mapMutations({
                changeMenu: 'updateNavMenu',
                changeAdvMenu: 'updateAdvMenu',
                changeFMenu: 'updateAdvFMenu'
            }),
            //  手动刷新
            reload(){
                this.$parent.reload();
            },
            //  切换Oun列表显示模式
            // switch_display_mode(){
            //     if(this.onu_display_style === 1){
            //         this.onu_display_style = 2;
            //     }else{
            //         this.onu_display_style = 1;
            //     }
            // },
            getData(){
                this.search_macaddr = '';
                this.$http.get('/onu_allow_list?port_id='+ this.portid).then(res=>{
                    if(res.data.code === 1){
                        this.onu_arrow = res.data;
                    }else{
                        this.onu_arrow = {};
                    }
                    this.onu_allow_list = Object.assign({},this.onu_arrow);
                    this.onu_allow_list.data.sort((a,b)=>{
                        return a.status.toLowerCase() === 'online' && b.status.toLowerCase() !== 'online'
                    })
                }).catch(err=>{
                    // to do 
                })
            },
            closeModal(){
                this.add_dialog = false;
            },
            // 删除onu
            delete_onu(node){
                var olist;
                this.post_url = '/onu_allow_list';
                if(!node){
                    olist = this.batch_onulist;
                    this.post_url = '/onu_allow_list?form=batch';
                    olist = olist.map(item=>{
                        return Number(item);
                    }).sort((a,b)=>a-b);
                }else{
                    olist = node.onu_id;
                }
                if(olist.length <= 0){
                    this.$message({
                        type: 'info',
                        text: this.lanMap['no_select_onu']
                    })
                    return
                }
                this.post_params = {
                    "method":"delete",
                    "param":{
                        "port_id": Number(this.portid),
                        "onu_id": olist,
                        "macaddr": node ? node.macaddr : ''
                    }
                }
                this.delete_confirm = true;
            },
            //  手动添加 onu
            add_onu(){
                this.add_macaddr = '';
                this.add_onuid = '';
                this.add_onudesc = '';
                this.add_dialog = true;
            },
            //  添加onu 弹出层
            add_onuitem(bool){
                if(bool){
                    if(this.add_onuid === ''){
                        this.add_onuid = 0;
                    }
                    if(this.testMacaddr || this.add_macaddr === '' || this.add_macaddr.toLowerCase() === 'ff:ff:ff:ff:ff:ff' || 
                    this.add_macaddr === '00:00:00:00:00:00' || this.add_macaddr.toLowerCase() === '01:00:5e:00:00:00') {
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_mac']
                        })
                        return
                    }
                    if( isNaN(Number(this.add_onuid)) || Number(this.add_onuid) > 64 || Number(this.add_onuid) < 0 ){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_onuid']
                        })
                        return
                    }
                    var post_params = {
                        "method":"add",
                        "param":{
                            "port_id": Number(this.portid),
                            "onu_id": Number(this.add_onuid),
                            "macaddr": this.add_macaddr,
                            "auth_state": this.add_onustate,
                            "onu_type": '',
                            "onu_desc": this.add_onudesc
                        }
                    }
                    this.$http.post('/onu_allow_list',post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: res.data.type,
                                text: this.lanMap['setting_ok']
                            })
                            this.getData();
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
                this.add_dialog = false;
            },
            //  onu认证/取消认证确认框
            result_authstate(bool){
                if(bool){
                    this.$http.post('/onu_allow_list',this.post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: res.data.type,
                                text: this.lanMap['setting_ok']
                            })
                            this.getData();
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
                this.post_params = {};
                this.authstate_confirm = false;
            },
            //  onu认证 / 取消认证
            authstate(node){
                //  2018-7-30-14-05 认证/取消谁时，去除onu状态校验
                // if(node.status.toLowerCase() !== 'online' || node.status.toLowerCase() !== ''){
                //     this.$message({
                //         type: 'error',
                //         text: this.lanMap['tips_authstate_error']
                //     })
                //     return
                // }
                // var olist;
                // if(!node){
                //     olist = this.batch_onulist;
                // }else{
                //     olist = [node.onu_id];
                // }
                // olist = olist.map(item=>{
                //     return Number(item);
                // }).sort((a,b)=>a-b);
                this.post_params = {
                    "method": "set",
                    "param":{
                        "port_id": Number(this.portid),
                        "onu_id": node.onu_id,
                        "macaddr": node ? node.macaddr : '',
                        "auth_state": node.auth_state ? 0 : 1,
                        "onu_type": '',
                        "onu_desc": ''
                    }
                }
                this.authstate_confirm = true;
                this.tips_authstate = node.auth_state ? this.lanMap['tips_unauth_state'] : this.lanMap['tips_auth_state']
            },
            //  移动ONU到阻止列表
            remove_onu(node){
                var olist;
                this.post_url = '/onu_allow_list';
                if(!node){
                    olist = this.batch_onulist;
                    this.post_url = '/onu_allow_list?form=batch'
                    olist = olist.map(item=>{
                        return Number(item);
                    }).sort((a,b)=>a-b);
                }else{
                    olist = node.onu_id;
                }
                if(olist.length <= 0){
                    this.$message({
                        type: 'info',
                        text: this.lanMap['no_select_onu']
                    })
                    return
                }
                this.post_params = {
                    "method":"reject",
                    "param":{
                        "port_id": Number(this.portid),
                        "onu_id": olist,
                        "macaddr": node ? node.macaddr : ''
                    }
                };
                this.deny_confirm = true;
            },
            //  跳转带宽管理
            onu_bandwieth(){
                this.$router.push('/sla_cfg?port_id='+this.portid);
                this.changeMenu('advanced_setting');
                this.changeFMenu('pon_mgmt');
                this.changeAdvMenu('sla_cfg');
                sessionStorage.setItem('f_menu', 'advanced_setting');
                sessionStorage.setItem('first_menu', 'pon_mgmt');
                sessionStorage.setItem('sec_menu', 'sla_cfg');
            },
            //  重启模态框
            result_reboot(bool){
                if(bool){
                    this.$http.post('/onumgmt?form=config',this.post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: res.data.type,
                                text: this.lanMap['reboot_onu'] + this.lanMap['st_success']
                            })
                            this.getData();
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
                this.post_params = {};
                this.reboot_confirm = false;
            },
            //  重启 onu
            reboot(item){
                if(item.status.toLowerCase() !== 'online'){
                    this.$message({
                        type: 'info',
                        text: this.lanMap['onu_offline_tips']
                    })
                    return
                }
                this.reboot_confirm = true;
                this.post_params = {
                    "method":"set",
                    "param":{
                        "port_id": Number(this.portid),
                        "onu_id": item.onu_id,
                        "flags": 1,
                        "fec_mode": 1
                    }
                }
            },
            //  跳转到 onu 详情页
            onu_detail(portid,onuid){
                this.$router.push('/onu_basic_info?form=base-info&port_id='+ portid + '&onu_id=' + onuid);
                this.changeMenu('advanced_setting');
                this.changeFMenu('onu_mgmt');
                this.changeAdvMenu('onu_basic_info');
                sessionStorage.setItem('f_menu', 'advanced_setting');
                sessionStorage.setItem('first_menu', 'onu_mgmt');
                sessionStorage.setItem('sec_menu', 'onu_basic_info');
            },
            //  删除确认框
            result_delete(bool){
                if(bool){
                    this.$http.post(this.post_url,this.post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: res.data.type,
                                text: this.lanMap['setting_ok']
                            })
                            this.getData();
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
                this.post_params = {};
                this.delete_confirm = false;
            },
            //  加入黑名单确认框
            result_deny(bool){
                if(bool){
                    this.$http.post(this.post_url,this.post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: res.data.type,
                                text: this.lanMap['setting_ok']
                            })
                            this.getData();
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
                this.post_params = {};
                this.deny_confirm = false;
            },
            //  开启/关闭 批量管理状态
            show_batchmgmt(){
                this.is_batch_mgmt = !this.is_batch_mgmt;
            },
            //  全选/反选 按钮
            change_select_status(){
                this.select_all = !this.select_all;
                this.batch_onulist = [];
                var onulist = document.getElementsByName('onulist');
                if(this.select_all){
                    onulist.forEach(item=>{
                        this.batch_onulist.push(item.value);
                    })
                }
            },
            searchonu_by_macaddr(){
                if(!this.search_macaddr){
                    this.onu_allow_list = Object.assign({},this.onu_arrow);
                }else{
                    var list = Object.assign({},this.onu_arrow).data,arr = [];
                    for(var key in list){
                        if(list[key].macaddr.includes(this.search_macaddr)){
                            arr.push(list[key]);
                        }
                    }
                    this.onu_allow_list.data = arr;
                }
            }
        },
        watch: {
            portid(){
                sessionStorage.setItem('pid',Number(this.portid));
                this.getData();
                this.batch_onulist = [];
            },
            add_macaddr(){
                var reg = /^([0-9abcdefABCDEF]{2}\:){5}[0-9abcdefABCDEF]{2}$/;
                if(!reg.test(this.add_macaddr)){
                    this.testMacaddr = true;
                }else{
                    this.testMacaddr = false;
                }
            },
            search_macaddr(){
                // if(!this.search_macaddr){
                //     this.onu_allow_list = Object.assign({},this.onu_arrow);
                // }else{
                //     var list = Object.assign({},this.onu_arrow).data,arr = [];
                //     for(var key in list){
                //         if(list[key].macaddr.includes(this.search_macaddr)){
                //             arr.push(list[key]);
                //         }
                //     }
                //     this.onu_allow_list.data = arr;
                // }
            },
            batch_onulist(){
                this.$nextTick(()=>{
                    var onulist = document.getElementsByName('onulist');
                    if(this.batch_onulist.length === onulist.length){
                        this.select_all = true;
                        this.selectall_state = true;
                    }else{
                        this.select_all = false;
                        this.selectall_state = false;
                    }
                    if(!onulist.length){
                        this.select_all = false;
                        this.selectall_state = false;
                    }
                })
            }
        }
    }
</script>

<style scoped lang="less">
h2{
	font-size: 24px;
	font-weight: 600;
    color: 	#67AEF7;
    margin: 0 0 0 20px;
}
.onu-allow{
    margin-top: 20px;
    padding-top: 70px;
    >div:first-child{
        height: 36px;
        line-height: 36px;
        margin-bottom: 20px;
        h2{
            float: left;
            width: 300px;
            vertical-align: middle;
        }
        h2+span{
            display: inline;
        }
    }
}
hr+div{
    margin: 30px 0 0 10px;
}
ul{
    border:1px solid #ddd;
    margin: 20px 0 0 20px;
    min-width: 1020px;
    overflow: hidden;
    >li:first-child{
        background: #2361a2;
        color: #fff;
    }
}
ul>li{
    font-size: 0;
    height: 36px;
    line-height: 36px;
    border-bottom: 1px solid #ddd;
    vertical-align: middle;
}
ul>li:last-child{
    border-bottom: none;
}
span{
    display: inline-block;
    width: 16%;
    text-align: center;
    font-size: 16px;
}
li.onulist-item>span.onu-name-ellipsis{
    padding: 0 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    box-sizing: border-box;
}
li.onulist-item>span{
    display: inline-block;
    width: 16%;
    overflow: hidden;
    text-overflow: ellipsis;
    &:first-child{
        width: 3%;
    }
    >label{
        display: inline-block;
        width: 100%;
        height: 100%;
        cursor: pointer;
    }
}
input{
    margin-left:20px;
    margin-top: 9px;
}
input[type='checkbox']{
    margin: 0;
    cursor: pointer;
}
select{
    width: 160px;
    height: 30px;
    font-size: 16px;
    border-radius: 3px;
    text-indent: 10px;
    margin-left: 6px;
}
select+a{
    margin-left: 60px;
}
a{
    padding: 0 20px;
    margin-left: 10px;
}
.onu-allow-btn{
    height: 26px;
    line-height: 26px;
}
p{
    margin: 20px 0 20px 20px;
    font-size: 16px;
    color: red;
}
i{
    display: inline-block;
    cursor: pointer;
    width: 32px;
    height: 32px;
    vertical-align: middle;
}
i.onu-detail{
    background: url('../../../assets/detail-normals.png') no-repeat 1px 1px;
}
i.onu-detail:hover{
    background: url('../../../assets/detail-hovers.png') no-repeat 1px 1px;
}
i.onu-delete{
    background: url('../../../assets/delete-normal.png') no-repeat;
}
i.onu-delete:hover{
    background: url('../../../assets/delete-hover.png') no-repeat;
}
i.onu-remove{
    background: url('../../../assets/remove-normal.png') no-repeat;
}
i.onu-remove:hover{
    background: url('../../../assets/remove-hover.png') no-repeat;
}
i.reset-onu{
    background: url('../../../assets/reset-normal.png') no-repeat 2px 2px;
}
i.reset-onu:hover{
    background: url('../../../assets/reset-hover.png') no-repeat 2px 2px;
}
div.modal-content{
    width: 600px;
    height: 300px;
    background: #fff;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    border-radius: 10px;
}
div.modal-content{
    h3+div{
        margin-top: 10px;
    }
}
div.modal-item input{
    width: 180px;
}
div.modal-item{
    height: 40px;
    line-height: 40px;
    vertical-align: middle;
    padding-left: 30px;
}
div.modal-content input{
    margin: 0 0 0 20px;
}
div.modal-item select{
    margin: 0 0 0 20px;
}
span.tips{
    font-size: 14px;
    margin-left:10px;
    width: auto;
    color: #aaa;
}
div.modal-btn{
    margin: 15px;
}
div.modal-btn>a{
    margin-left: 125px;
    padding: 0 30px;
}
i.verified-actived{
    background: url('../../../assets/authstatus-hover.png') no-repeat;
}
i.unverified{
    background: url('../../../assets/unauthstatus-normal.png') no-repeat;
}
i.reload{
    background: url('../../../assets/refresh.png') no-repeat;
    margin: 0 20px 0;
}
span>span{
    width: 40px;
}
div.tool-tips{
    margin-right: 20px;
    height: 38px;
    vertical-align: middle;
    line-height: 38px;
    position: relative;
    top: -2px;
    &:hover>div{
        display: block;
    }
    >i.icon-tips{
        background: url('../../../assets/tips.png') no-repeat;
        
    }
    >div{
        display: none;
        width: 300px;
        height: 330px;
        background: #ddd;
        border-radius: 10px;
        padding: 10px;
        position: absolute;
        top: 26px;
        right: 26px;
        z-index: 99;
        >div{
            padding: 5px 0;
            &:first-child{
                border-bottom: 1px solid #333;
                margin-top: 5px;
                margin-bottom: 5px;
            }
            >p{
                color: #333;
                font-size: 14px;
                line-height: 20px;
                margin: 0;
                &:first-child{
                    color: #3990E5;
                }
                >i.reload{
                    margin: 0;
                    background-position: 0 -2px;
                }
            }
        }
    }
}
div.search-onu{
    margin: 20px 0 0 20px;
    height: 36px;
    line-height: 36px;
    &:after{
        content: "";
        display: table;
        clear: both;
    }
    >div{
        position: relative;
        >input{
            margin: 0 0 0 20px;
            width: 280px;
        }
        >i{
            background: url('../../../assets/search.png') no-repeat;
            position: absolute;
            top: 2px;
            right: 2px;
        }
    }
    >p{
        margin: 0 0 0 20px;
        color: #666;
        font-size: 14px;
    }
}
h3{
    font-weight: 600;
    color: #67aef7;
}
div.batch-onu{
    h3+div{
        >div{
            margin: 0 20px;
            span{
                display: inline;
            }
        }
    }
}
</style>