<template>
    <div class="onu-allow">
        <div>
            <select @change="changePon($event)">
                <option v-for="(item,key) in port_name.pon" :key="key" :value="item.id">
                    {{ item.name }}
                </option>
            </select>
            <a href="javascript:;" @click="add_onu()">增加</a>
            <a href="javascript:;" @click="delete_onu()">删除</a>
            <a href="javascript:;" @click="auth_state()">ONU认证</a>
            <a href="javascript:;" @click="onu_bandwieth()">带宽</a>
            <a href="javascript:;" @click="reboot()">重启OUN</a>
            <a href="javascript:;" @click="onu_detail()">查看详情</a>
        </div>
        <div>

        </div>
        <ul v-if="this.onu_allow_list.data">
            <li class="flex-box">
                <input type="radio" style="opacity:0">
                <span v-for="(item,key) in this.onu_allow_list.data[0]" :key="key" v-if=" key != 'port_id' ">
                    {{ lanMap[key] }}
                </span>
            </li>
            <li v-for="(item,index) in this.onu_allow_list.data" :key="index" class="flex-box">
                <input type="radio" name="onu" @click="checkedOnu(item)">
                <span>{{ 'ONU0'+item.port_id +'/'+ item.onu_id }}</span>
                <span>{{ item.macaddr }}</span>
                <span>{{ item.status }}</span>
                <span>{{ item.auth_state }}</span>
                <span>{{ item.register_time }}</span>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapState } from 'vuex'
    export default {
        name: 'onuAllow',
        data(){
            return {
                onu_allow_list: {},
                _portid: 1,
                _onuid: 0,
                _macaddr: ''
            }
        },
        created(){
            // 请求 url: /onu_allow_list?port_id=1
            this.$http.get('./onuallow.json').then(res=>{
                this.onu_allow_list = res.data;
            }).catch(err=>{
                // to do 
            })
        },
        methods:{
            // 修改 pon 口时调用，保存pon_id
            changePon(event){
                this._portid = event.target.value;
            },
            // 单选框，切换选中的onu
            checkedOnu(node){
                this._onuid = node.onu_id;
                this._macaddr = node.macaddr;
            },
            // 删除onu
            delete_onu(){
                var portId = this._portid || 1;
                var post_params = {
                    "method":"delete",
                    "param":{
                        "port_id": portId,
                        "onu_id": this._onuid,
                        "macaddr": this._macaddr
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
                console.log('clicked add');
                // 待添加功能 
            },
            //  onu 认证
            auth_state(){
            },
            //  跳转带宽管理
            onu_bandwieth(){
                // 请求url: /onu_bandwidth?port_id=1&onu_id=1
                this.$router.push('/onu_bandwidth?port_id=1&onu_id=1');
            },
            //  重启 onu
            reboot(){
                // 待添加
            },
            //  跳转到 onu 详情页
            onu_detail(){
                //请求url: /onumgmt?form=base-info&port_id=1&onu_id=1
                this.$router.push('/onu_basic_info?form=base-info&port_id=1&onu_id=1');
            }
        },
        computed: mapState(['lanMap','port_name'])
    }
</script>

<style scoped>
.onu-allow{
    margin: 30px 0 0 30px;
}
ul{
    border:1px solid #ddd;
    margin-top: 30px;
    width: 1160px;
}
ul>li{
    font-size: 0;
    height: 30px;
    line-height: 30px;
    border-bottom: 1px solid #ddd;
}
ul>li:last-child{
    border-bottom: none;
}
span{
    display: inline-block;
    width: 19%;
    text-align: center;
    font-size: 16px;
}
input{
    margin-left:20px;
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
</style>