<template>
    <div class="onu-allow">
        <div>
            <select v-model="portid">
                <option v-for="(item,key) in port_name.pon" :key="key" :value="item.id">
                    {{ item.name }}
                </option>
            </select>
            <a href="javascript:;" @click="add_onu()">增加</a>
            <a href="javascript:;" @click="auth_state()">ONU认证</a>
            <a href="javascript:;" @click="onu_bandwieth()">带宽</a>
            <a href="javascript:;" @click="reboot()">重启OUN</a>
        </div>
        <div></div>
        <ul v-if="this.onu_allow_list.data">
            <li class="flex-box">
                <!-- <input type="radio" style="opacity:0"> -->
                <span v-for="(item,key) in this.onu_allow_list.data[0]" :key="key" v-if=" key != 'port_id' ">
                    {{ lanMap[key] }}
                </span>
                <span>{{ lanMap['config'] }}</span>
            </li>
            <li v-for="(item,index) in this.onu_allow_list.data" :key="index" class="flex-box">
                <span>{{ 'ONU0'+item.port_id +'/'+ item.onu_id }}</span>
                <span>{{ item.macaddr }}</span>
                <span>{{ item.status }}</span>
                <span>{{ item.auth_state ? 'true' : 'false' }}</span>
                <span>{{ item.register_time }}</span>
                <span>
                    <i title="查看详情" class="onu-detail" @click="onu_detail(item.port_id,item.onu_id)"></i>
                    <i title="删除ONU" class="onu-delete" @click="delete_onu(item)"></i>
                    <i title="添加到阻止列表" class="onu-remove" @click="remove_onu(item)"></i>
                </span>
            </li>
        </ul>
        <p v-else>没有更多的数据了...</p>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
    export default {
        name: 'onuAllow',
        data(){
            return {
                onu_allow_list: {},
                portid: 0
            }
        },
        computed: mapState(['lanMap','port_name','menu','change_url']),
        created(){
            // 请求 url: /onu_allow_list?port_id=1
            // '/onu_allow_list?port_id=' + ( this.$route.query.port_id || 1 )
            this.portid = this.$route.query.port_id || 1;
            if(this.change_url.beta === 'test'){
                var url;
                if(this.change_url.onu_allow[this.change_url.onu_allow.length - 1] != '='){
                    url = this.change_url.onu_allow;
                }else{
                    url = this.change_url.onu_allow + this.portid;
                }
                this.$http.get(url).then(res=>{
                    if(res.data.code === 1){
                        this.onu_allow_list = res.data;
                    }else{
                        this.onu_allow_list = {};
                    }
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
                this.$http.get('/onu_allow_list?port_id='+ this.portid).then(res=>{
                    if(res.data.code === 1){
                        this.onu_allow_list = res.data;
                    }else{
                        this.onu_allow_list = {};
                    }
                }).catch(err=>{
                    // to do 
                })
            },
            // 删除onu
            delete_onu(node){
                var post_params = {
                    "method":"delete",
                    "param":{
                        "port_id": node.port_id,
                        "onu_id": node.onu_id,
                        "macaddr": node.macaddr
                    }
                }
                this.$http.post('/onu_allow_list',post_params).then(res=>{
                    // to do 
                }).catch(err=>{
                    // to do
                })
            },
            //  手动添加 onu
            add_onu(){
                // 待添加功能
                var post_params = {
                    "method":"add",
                    "param":{
                        "port_id":1,
                        "onu_id":0,
                        "macaddr":"38:3a:21:20:22:66",
                        "auth_state":1,
                        "onu_type":" ",
                        "onu_desc":" "
                    }
                }
            },
            //  onu 认证
            auth_state(){
                // 待添加
            },
            //  移动ONU到阻止列表
            remove_onu(node){
                var post_params = {
                    "method":"reject",
                    "param":{
                        "port_id": node.port_id,
                        "onu_id": node.onu_id,
                        "macaddr": node.macaddr
                    }
                }
                this.$http.post('/onu_allow_list',post_params).then(res=>{
                    if(re.data.code === 1){
                        this.getData();
                    }
                }).catch(err=>{
                    // to do
                })
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
            //  重启 onu
            reboot(){
                // 待添加
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
            }
        },
        watch: {
            portid(){
                this.getData();
            }
        }
    }
</script>

<style scoped>
.onu-allow{
    margin-top: 30px;
}
ul{
    border:1px solid #ddd;
    margin-top: 30px;
    min-width: 1040px;
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
    background: url('../../assets/detail-normal.png') no-repeat;
}
i.onu-detail:hover{
    background: url('../../assets/detail-hover.png') no-repeat;
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
</style>