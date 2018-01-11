<template>
    <div class="onu-deny" v-if="onu_deny_list.code === 1">
        <div>
            <select @change="changePon($event)">
                <option v-for="(item,key) in port_name.pon" :key="key" :value="item.id">
                    {{ item.name }}
                </option>
            </select>
            <span>
                <a href="javascript:;" @click="add">{{ lanMap['add'] }}</a>
            </span>
        </div>
        <div class="add-item" v-if="addItem.isShow">
            <span>{{ lanMap['macaddr'] }}</span>
            <input type="text" v-model="addItem.macaddr">
            <span>{{ lanMap['desc'] }}</span>
            <input type="text" v-model="addItem.desc">
            <span>
                <a href="javascript:;" @click="handle(true)">{{ lanMap['apply'] }}</a>
            </span>
            <span>
                <a href="javascript:;" @click="handle(false)">{{ lanMap['cancel'] }}</a>
            </span>
        </div>
        <ul v-if="onu_deny_list.code === 1">
            <li>
                <span v-for="(item,key) in onu_deny_list.data[0]" :key="key" v-if="key != 'port_id'">
                    {{ lanMap[key] }}
                </span>
                <span> {{ lanMap['config'] }} </span>
            </li>
            <li v-for="(item,key) in onu_deny_list.data" :key="key">
                <span> {{ 'ONU0'+item.port_id +'/'+ item.onu_id }} </span>    
                <span> {{ item.macaddr }} </span>
                <span> {{ item.retry }} </span>
                <span>
                    <a href="javascript:;" class="inline-btn" @click="deleteOnuDeny(item.port_id,item.onu_id,item.macaddr)">{{ lanMap['delete'] }}</a>
                </span>
            </li>
        </ul>
        <div v-else>没有更多的数据了...</div>
        <!-- tool-tips => 自定义的消息内容   confirm => 确认框组件 -->
        <confirm tool-tips="是否确定？" @choose="result" v-if="userChoose"></confirm>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import confirm from '@/components/common/confirm'
export default {
    name: 'ounDeny',
    components: { confirm },
    computed: mapState(['lanMap','port_name','change_url']),
    data(){
        return {
            onu_deny_list:{},
            _portid: 1,
            userChoose: false,
            addItem: {
                isShow: false,
                desc: '',
                macaddr: ''
            },
            post_param: {
                delete: {},
                add: {}
            }
        }
    },
    created(){
        // 请求 url: /onu_deny_list?port_id=1
        this._portid = this.port_name.pon['1'].id;
        var url;
        if(this.change_url.onu_allow[this.change_url.onu_allow.length - 1] != '='){
                url = this.change_url.onu_deny;
            }else{
                url = this.change_url.onu_deny + this._portid;
            }
        this.$http.get(url).then(res=>{
            this.onu_deny_list = res.data;
        }).catch(err=>{
            // to do
        })
    },
    methods: {
        // 切换pon口时，进行的操作
        changePon(event){
            this._portid = event.target.value;
            // 请求 url: /onu_deny_list?port_id=1
            this.$http.get('/onu_deny_list?port_id='+this._portid).then(res=>{
                this.onu_deny_list = res.data;
            }).catch(err=>{
                // to do
            })
        },
        //  点击 确认/取消 时进行的操作
        handle(bool){
            this.addItem.isShow = false;
            if(bool){
                this.post_param.add = {
                    "method":"add",
                    "param":{
                        "port_id":this._portid,
                        "macaddr": this.addItem.macaddr,
                        "onu_desc" : this.addItem.desc
                    }
                }
                this.$http.post('/onu_deny_list',this.post_param.add).then(res=>{
                    // to do
                }).catch(err=>{
                    // to do 
                })
                this.post_param = {};
            }else{
                this.post_param = {};
                return 
            }
        },
        //  点击添加按钮时，显示添加模板
        add(){
            this.addItem.isShow = true;
        },
        // 根据确认框返回结果，进行操作
        result(bool){
            this.userChoose = false;
            if(bool){
                // 确认框中用户点击确认时的操作
                this.$http.post('/onu_allow_list',this.post_param).then(res=>{
                    // to do
                }).catch(err=>{
                    // to do 
                })
                this.post_param = {};
            }else{
                // 确认框中用户点击取消时的操作
                this.post_param = {};
                return 
            }
        },
        // 用户点击删除按钮时，弹出确认框
        deleteOnuDeny(port_id,onu_id,macaddr){
            this.userChoose = true;
            this.post_param.delete = {
                "method":"delete",
                "param":{
                    "port_id": port_id,
                    "onu_id": onu_id,
                    "macaddr": macaddr
                }
            }
        }
    }
}
</script>

<style scoped>
.onu-deny{
    margin-top: 30px;
}
.add-item{
    height: 40px;
    min-width: 1060px;
    margin-top: 10px;
    border: 1px solid #ddd;
    line-height: 40px;
    vertical-align: middle;
}
.add-item>span{
    width: 15%;
    vertical-align: middle;
}
ul{
    border:1px solid #ddd;
    margin-top: 30px;
    width: 1020px;
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
ul+div{
    margin-left: 30px;
}
span{
    display: inline-block;
    width: 24%;
    text-align: center;
    font-size: 16px;
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
    height: 32px;
    line-height: 36px;
    border-radius: 5px;
    background: #ddd;
    text-align: center;
    margin-left: 10px;
}
.inline-btn{
    height: 26px;
    line-height: 26px;
}
</style>