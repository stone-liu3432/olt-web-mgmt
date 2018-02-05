<template>
    <div class="onu-allow">
        <div>
            <select v-model="portid">
                <option v-for="(item,key) in port_name.pon" :key="key" :value="item.id">
                    {{ item.name }}
                </option>
            </select>
            <a href="javascript:;" @click="add_onu()">{{ lanMap['add'] }}</a>
            <a href="javascript:;" @click="onu_bandwieth()">{{ lanMap['sla_cfg'] }}</a>
            <div class="rt tool-tips">
                <i></i>
                <div>
                    <div>
                        <p>{{ lanMap['auth_state'] }}</p>
                        <p><i class="verified-actived"></i>{{ lanMap['tips_cfm_onu'] }}</p>
                        <p><i class="unverified"></i>{{ lanMap['tips_n_cfm_onu'] }}</p>
                    </div>
                    <div>
                        <p>{{ lanMap['config'] }}</p>
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
                <h3>{{ lanMap['manual_bind'] }}</h3>
                <div class="modal-item">
                    <span>{{ lanMap['onu_id'] }}</span>
                    <input type="text" v-model="add_onuid" placeholder="1-64">
                    <span class="tips">{{ lanMap['zero_auto_'] }}</span>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['macaddr'] }}</span>
                    <input type="text" v-model="add_macaddr" :style="{'borderColor' : add_macaddr && testMacaddr ? 'red' : '#ccc'}" placeholder="00:00:00:00:00:00">
                    <span class="tips">EX : 00:00:00:00:00:00</span>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['auth_state'] }}</span>
                    <select v-model="add_onustate">
                        <option value="1">true</option>
                        <option value="0">false</option>
                    </select>
                </div>
                <!-- <div class="modal-item">
                    <span>{{ lanMap['onu_type'] }}</span>
                    <input type="text">
                </div> -->
                <div class="modal-item">
                    <span>{{ lanMap['desc'] }}</span>
                    <input type="text" v-model="add_onudesc">
                    <span class="tips">{{ lanMap['input_desc'] }}</span>
                </div>
                <div class="modal-btn">
                    <a href="javascript:;" @click="add_onuitem(true)">{{ lanMap['apply'] }}</a>
                    <a href="javascript:;" @click="add_onuitem(false)">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="closeModal"></div>
            </div>
        </div>
        <div class="search-onu">
            <h3 class="lf">查找ONU</h3>
            <div class="lf">
                <input type="text" v-model="search_macaddr">
                <i></i>
            </div>
            <p class="lf">输入mac地址查找ONU,支持部分匹配查找</p>
        </div>
        <ul v-if="onu_allow_list.data && onu_allow_list.data.length>0">
            <li class="flex-box">
                <span v-for="(item,key) in onu_allow_list.data[0]" :key="key" v-if=" key != 'port_id' ">
                    {{ lanMap[key] }}
                </span>
                <span>{{ lanMap['config'] }}</span>
            </li>
            <li v-for="(item,index) in onu_allow_list.data" :key="index" class="flex-box">
                <span>{{ 'ONU0'+item.port_id +'/'+ item.onu_id }}</span>
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
        <p v-else>{{ lanMap['no_more_data'] }}</p>
        <confirm :tool-tips="lanMap['tips_del_onu']" @choose="result_delete" v-if="delete_confirm"></confirm>
        <confirm :tool-tips="lanMap['tips_add_deny_onu']" @choose="result_deny" v-if="deny_confirm"></confirm>
        <confirm :tool-tips="lanMap['confirm_reboot_onu']" @choose="result_reboot" v-if="reboot_confirm"></confirm>
        <confirm :tool-tips="lanMap['confirm_reboot_onu']" @choose="result_authstate" v-if="authstate_confirm"></confirm>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
import confirm from '@/components/common/confirm'
    export default {
        name: 'onuAllow',
        components: { confirm },
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
                search_macaddr: ''
            }
        },
        computed: mapState(['lanMap','port_name','menu','change_url']),
        created(){
            // 请求 url: /onu_allow_list?port_id=1
            // '/onu_allow_list?port_id=' + ( this.$route.query.port_id || 1 )
            this.portid = this.$route.query.port_id || this.port_name.pon['1'].id;
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
                }).catch(err=>{
                    // to do 
                })
            }
        },
        methods:{
            ...mapMutations({
                update_menu: 'updateMenu'
            }),
            getData(){
                this.search_macaddr = '';
                this.$http.get('/onu_allow_list?port_id='+ this.portid).then(res=>{
                    if(res.data.code === 1){
                        this.onu_arrow = res.data;
                    }else{
                        this.onu_arrow = {};
                    }
                    this.onu_allow_list = Object.assign({},this.onu_arrow);
                }).catch(err=>{
                    // to do 
                })
            },
            closeModal(){
                this.add_dialog = false;
            },
            // 删除onu
            delete_onu(node){
                this.post_params = {
                    "method":"delete",
                    "param":{
                        "port_id": node.port_id,
                        "onu_id": node.onu_id,
                        "macaddr": node.macaddr
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
                    if(this.testMacaddr || this.add_macaddr === '') {
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
                            "port_id": this.portid,
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
                                type: 'success',
                                text: this.lanMap['setting_ok']
                            })
                            this.getData();
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
                this.add_dialog = false;
            },
            result_authstate(bool){
                if(bool){
                    this.$http.post('/onu_allow_list',this.post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['setting_ok']
                            })
                            this.getData();
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
                this.post_params = {};
                this.authstate_confirm = false;
            },
            //  onu认证 / 取消认证
            authstate(node){
                this.post_params = {
                    "method": "set",
                    "param":{
                        "port_id": this.portid,
                        "onu_id": node.onu_id,
                        "macaddr": node.macaddr,
                        "auth_state": node.auth_state ? 0 : 1,
                        "onu_type": '',
                        "onu_desc": ''
                    }
                }
                this.authstate_confirm = true;
            },
            //  移动ONU到阻止列表
            remove_onu(node){
                this.post_params = {
                    "method":"reject",
                    "param":{
                        "port_id": node.port_id,
                        "onu_id": node.onu_id,
                        "macaddr": node.macaddr
                    }
                };
                this.deny_confirm = true;
            },
            //  跳转带宽管理
            onu_bandwieth(){
                // 请求url: /onu_bandwidth?port_id=1
                this.$router.push('/sla_cfg?port_id='+this.portid);
                var sub_item = document.querySelectorAll('p.sub-item');
                for(var i=0;i<sub_item.length;i++){
                    sub_item[i].className = 'sub-item';
                    if(sub_item[i].innerText.replace(/\s/g,'') == this.lanMap['sla_cfg']){
                        sub_item[i].className += ' actived';
                    }
                }
            },
            //  重启模态框
            result_reboot(bool){
                if(bool){
                    this.$http.post('/onumgmt?form=config',this.post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['reboot_onu'] + this.lanMap['st_success']
                            })
                            this.getData();
                        }else{
                            this.$message({
                                type: 'error',
                                text: this.lanMap['reboot_onu'] + this.lanMap['st_fail']
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
                this.reboot_confirm = true;
                this.post_params = {
                    "method":"set",
                    "param":{
                        "port_id": this.portid,
                        "onu_id": item.onu_id,
                        "flags": 1,
                        "fec_mode": 1
                    }
                }
            },
            //  跳转到 onu 详情页
            onu_detail(portid,onuid){
                //请求url:  /onu_basic_info?form=base-info&port_id=1&onu_id=1
                this.$router.push('/onu_basic_info?form=base-info&port_id='+ portid + '&onu_id=' + onuid);
                // 清除当前子菜单的选中效果，给被跳转的子菜单加上选中效果
                var sub_item = document.querySelectorAll('p.sub-item');
                for(var i=0;i<sub_item.length;i++){
                    sub_item[i].className = 'sub-item';
                    if(sub_item[i].innerText.replace(/\s/g,'') == this.lanMap['onu_basic_info']){
                        sub_item[i].className += ' actived';
                    }
                }
                // 清除一级菜单的选中效果
                var menu_item = document.querySelectorAll('p.menu-item');
                for(var i=0;i<menu_item.length;i++){
                    menu_item[i].className = 'menu-item';
                }
                // 清除跳转的菜单的选中效果，并给被跳转的菜单添加选中效果
                var sub_menu = document.querySelectorAll('ul.sub-menu');
                for(var i=0;i<sub_menu.length;i++){
                    sub_menu[i].className = 'sub-menu';
                    var text = sub_menu[i].firstElementChild.innerText;
                    text = text.replace(/(^\s*)|(\s*$)/g, "");
                    if(text === this.lanMap['onu_basic_info']){
                        sub_menu[i].className += ' hide';
                        sub_menu[i].previousElementSibling.className += ' active';
                    }
                }
                //  更新菜单状态
                var _menu = this.menu;
                for(var key in _menu.data.menu){
                    if(_menu.data.menu[key].name === 'pon_mgmt'){
                        _menu.data.menu[key].isHidden = false;
                    }
                    if(_menu.data.menu[key].name === 'onu_mgmt'){
                        _menu.data.menu[key].isHidden = true;
                    }
                }
                // 调用 vuex Mutations方法，更新 store 状态
                this.update_menu(_menu);
            },
            //  删除确认框
            result_delete(bool){
                if(bool){
                    this.$http.post('/onu_allow_list',this.post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['setting_ok']
                            })
                            this.getData();
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
                this.post_params = {};
                this.delete_confirm = false;
            },
            //  加入黑名单确认框
            result_deny(bool){
                if(bool){
                    this.$http.post('/onu_allow_list',this.post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['setting_ok']
                            })
                            this.getData();
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
                this.post_params = {};
                this.deny_confirm = false;
            }
        },
        watch: {
            portid(){
                this.getData();
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
        }
    }
</script>

<style scoped lang="less">
.onu-allow{
    margin-top: 30px;
}
ul{
    border:1px solid #ddd;
    margin-top: 20px;
    min-width: 1020px;
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
    width: 20%;
    text-align: center;
    font-size: 16px;
}
input{
    margin-left:20px;
    margin-top: 9px;
}
select{
    width: 160px;
    height: 36px;
    font-size: 16px;
    border-radius: 5px;
    text-indent: 10px;
}
select+a{
    margin-left: 60px;
}
a{
    display: inline-block;
    width: 120px;
    height: 36px;
    line-height: 36px;
    border-radius: 5px;
    background: #ddd;
    text-align: center;
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
    background: url('../../assets/detail-normal.png') no-repeat 1px 1px;
}
i.onu-detail:hover{
    background: url('../../assets/detail-hover.png') no-repeat 1px 1px;
}
i.onu-delete{
    background: url('../../assets/delete-normal.png') no-repeat;
}
i.onu-delete:hover{
    background: url('../../assets/delete-hover.png') no-repeat;
}
i.onu-remove{
    background: url('../../assets/remove-normal.png') no-repeat;
}
i.onu-remove:hover{
    background: url('../../assets/remove-hover.png') no-repeat;
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
div.modal-content>h3{
    margin-top: 20px;
    margin-bottom: 20px;
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    color: #67aef7;
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
    margin-left: 120px;
}
i.verified-actived{
    background: url('../../assets/authstatus-hover.png') no-repeat;
}
i.unverified{
    background: url('../../assets/unauthstatus-normal.png') no-repeat;
}
i.reset-onu{
    background: url('../../assets/reset-normal.png') no-repeat 2px 2px;
}
i.reset-onu:hover{
    background: url('../../assets/reset-hover.png') no-repeat 2px 2px;
}
span>span{
    width: 40px;
}
div.tool-tips{
    margin-right: 30px;
    height: 38px;
    vertical-align: middle;
    line-height: 38px;
    position: relative;
    &:hover>div{
        display: block;
    }
    >i{
        background: url('../../assets/tips.png') no-repeat;
    }
    >div{
        display: none;
        width: 300px;
        height: 300px;
        background: #ddd;
        border-radius: 10px;
        padding: 10px;
        position: absolute;
        top: 26px;
        right: 26px;
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
            }
        }
    }
}
div.search-onu{
    margin: 20px 0 0 10px;
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
            background: url('../../assets/search.png') no-repeat;
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
</style>