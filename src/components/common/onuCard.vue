<template>
    <div class="onu-list">
        <div class="onu-card"  v-for="(item,key) in onuAllowList.data" :key="key">
            <div class="card-cover">
                <div :style="{ 'color' : item.status.toLowerCase() !== 'online' ? 'red' : 'blue' }" :title="item.onu_name">
                    {{ item.onu_name || 'ONU0'+item.port_id +'/'+ item.onu_id }}
                </div>
                <div>
                    <span>{{ lanMap['status'] + ':' }}</span>
                    <span :style="{ 'color' : item.status.toLowerCase() !== 'online' ? 'red' : 'blue' }">{{ item.status }}</span>
                </div>
                <div>
                    <div>{{ lanMap['macaddr'] + ':' }}</div>
                    <div>{{ item.macaddr }}</div>
                </div>
                <div>
                    <div>{{ lanMap['register_time'] }}</div>
                    <div>{{ item.register_time }}</div>
                </div>
                <div>
                    {{ lanMap['auth_state'] + ':' }}
                    <span>{{ item.auth_state ? 'true' : 'false' }}</span>
                    <i :class="[item.auth_state ? 'verified-actived' : 'unverified']"  @click="authstate(item)" 
                        :title="[ item.auth_state ? lanMap['tips_cfm_onu'] : lanMap['tips_n_cfm_onu'] ]"></i>
                </div>
                <div>
                    <i :title="lanMap['detail']" class="onu-detail" @click="onu_detail(item.port_id,item.onu_id)"></i>
                    <i :title="lanMap['del_onu']" class="onu-delete" @click="delete_onu(item)"></i>
                    <i :title="lanMap['add_to_deny']" class="onu-remove" @click="remove_onu(item)"></i>
                    <i :title="lanMap['reboot_onu']" class="reset-onu" @click="reboot(item)"></i> 
                </div>
            </div>
        </div>
        <confirm :tool-tips="lanMap['tips_del_onu']" @choose="result_delete" v-if="delete_confirm"></confirm>
        <confirm :tool-tips="lanMap['tips_add_deny_onu']" @choose="result_deny" v-if="deny_confirm"></confirm>
        <confirm :tool-tips="lanMap['confirm_reboot_onu']" @choose="result_reboot" v-if="reboot_confirm"></confirm>
        <confirm :tool-tips="tips_authstate" @choose="result_authstate" v-if="authstate_confirm"></confirm>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
import confirm from '@/components/common/confirm'
export default {
    name: 'onuCard',
    props: ['onuAllowList'],
    computed: mapState(['lanMap','menu']),
    components: { confirm },
    data(){
        return {
            delete_confirm: false,
            deny_confirm: false,
            reboot_confirm: false,
            authstate_confirm: false,
            post_params: {}
        }
    },
    methods: {
        ...mapMutations({
            update_menu: 'updateMenu'
        }),
        getData(){
            this.$emit('updateData');
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
        //  onu认证模态框
         result_authstate(bool){
            if(bool){
                this.$http.post('/onu_allow_list',this.post_params).then(res=>{
                    if(res.data.code === 1){
                        this.$message({
                            type: 'success',
                            text: this.lanMap['setting_ok']
                        })
                        this.getData();
                    }else if(res.data.code >1){
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
            if(node.status.toLowerCase() !== 'online'){
                this.$message({
                    type: 'error',
                    text: this.lanMap['tips_authstate_error']
                })
                return
            }
            this.post_params = {
                "method": "set",
                "param":{
                    "port_id": node.port_id,
                    "onu_id": node.onu_id,
                    "macaddr": node.macaddr,
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
                    }else if(res.data.code >1){
                        this.$message({
                            type: 'error',
                            text: res.data.message
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
            if(item.status.toLowerCase() === 'offline'){
                this.$message({
                    type: 'error',
                    text: this.lanMap['onu_offline_tips']
                })
                return
            }
            this.reboot_confirm = true;
            this.post_params = {
                "method":"set",
                "param":{
                    "port_id": item.port_id,
                    "onu_id": item.onu_id,
                    "flags": 1,
                    "fec_mode": 1
                }
            }
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
                    }else if(res.data.code >1){
                        this.$message({
                            type: 'error',
                            text: res.data.message
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
                    }else if(res.data.code >1){
                        this.$message({
                            type: 'error',
                            text: res.data.message
                        })
                    }
                }).catch(err=>{
                    // to do
                })
            }
            this.post_params = {};
            this.deny_confirm = false;
        },
        //  跳转到 onu 详情页
        onu_detail(portid,onuid){
            //请求url:  /onu_basic_info?form=base-info&port_id=1&onu_id=1
            this.$router.push('/onu_basic_info?form=base-info&port_id='+ portid + '&onu_id=' + onuid);
            // 清除当前子菜单的选中效果，给被跳转的子菜单加上选中效果
            var sub_item = document.querySelectorAll('p.sub-item');
            for(var i=0;i<sub_item.length;i++){
                sub_item[i].className = 'sub-item';
                if(sub_item[i].innerText.replace(/(^\s*)|(\s*$)/g, "") == this.lanMap['onu_basic_info']){
                    sub_item[i].className += ' actived';
                }
            }
            // 清除一级菜单的选中效果
            var menu_item = document.querySelectorAll('p.menu-item');
            for(var i=0;i<menu_item.length;i++){
                menu_item[i].className = 'menu-item';
            }
            // 清除跳转的一级菜单的选中效果，并给被跳转的一级菜单添加选中效果
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
        }
    }
}
</script>

<style lang="less" scoped>
i{
    display: inline-block;
    cursor: pointer;
    width: 32px;
    height: 32px;
    vertical-align: middle;
}
i.onu-detail{
    background: url('../../assets/detail-normals.png') no-repeat 1px 1px;
}
i.onu-detail:hover{
    background: url('../../assets/detail-hovers.png') no-repeat 1px 1px;
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
i.reset-onu{
    background: url('../../assets/reset-normal.png') no-repeat 2px 2px;
}
i.reset-onu:hover{
    background: url('../../assets/reset-hover.png') no-repeat 2px 2px;
}
i.verified-actived{
    background: url('../../assets/authstatus-hover.png') no-repeat;
}
i.unverified{
    background: url('../../assets/unauthstatus-normal.png') no-repeat;
}
div.onu-list{
    overflow: hidden;
    margin-top: 20px;
}
div.onu-card{
    float: left;
    width: 185px;
    height: 200px;
    margin: 5px;
    padding: 5px;
    background: url('../../assets/onu.png') no-repeat -2px -10px;
    border: 1px solid #ccc;
    border-radius: 3px;
    position: relative;
    overflow: hidden;
    //cursor: pointer;
    &:hover{
        div.card-cover{
            top: 0;
        }
    }
    div.card-cover{
        width: 185px;
        height: 200px;
        padding: 5px;
        position: absolute;
        left: 0;
        top: 182px; // 182px;
        background: #ddd;
        transition: all .3s linear;
        opacity: .9;
        div:first-child{
            overflow: hidden;
            text-overflow: ellipsis;
        }
        >div{
            text-align: center;
            padding: 2px 0;
        }
    }
}
</style>
