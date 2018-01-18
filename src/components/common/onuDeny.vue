<template>
    <div class="onu-deny">
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
            <input type="text" v-model="addItem.macaddr" :style="{ 'border-color': test_macaddr ? 'red' : '#ddd' }">
            <span>{{ lanMap['desc'] }}</span>
            <input type="text" v-model="addItem.desc">
            <span>
                <a href="javascript:;" @click="handle(true)">{{ lanMap['apply'] }}</a>
            </span>
            <span>
                <a href="javascript:;" @click="handle(false)">{{ lanMap['cancel'] }}</a>
            </span>
        </div>
        <ul v-if="onu_deny_list.data">
            <li>
                <span v-for="(item,key) in onu_deny_list.data[0]" :key="key" v-if="key != 'port_id'">
                    {{ lanMap[key] }}
                </span>
                <span> {{ lanMap['delete'] }} </span>
            </li>
            <li v-for="(item,key) in onu_deny_list.data" :key="key">
                <span> {{ 'ONU0'+item.port_id +'/'+ item.onu_id }} </span>    
                <span> {{ item.macaddr }} </span>
                <span> {{ item.retry }} </span>
                <span>
                    <i class="icon-delete" @click="deleteOnuDeny(item.port_id,item.onu_id,item.macaddr)"></i>
                </span>
            </li>
        </ul>
        <div v-else class="data-failed">{{ lanMap['no_more_data'] }}</div>
        <!-- tool-tips => 自定义的消息内容   confirm => 确认框组件 -->
        <confirm :tool-tips="lanMap['if_sure']" @choose="result" v-if="userChoose"></confirm>
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
            test_macaddr: false,
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
        if(this.change_url.beta === 'test'){
            var url;
            if(this.change_url.onu_allow[this.change_url.onu_allow.length - 1] != '='){
                    url = this.change_url.onu_deny;
                }else{
                    url = this.change_url.onu_deny + this._portid;
                }
            this.$http.get(url).then(res=>{
                if(res.data.code ===1){
                    this.onu_deny_list = res.data;
                }
            }).catch(err=>{
                // to do
            })
        }
    },
    methods: {
        // 切换pon口时，进行的操作
        changePon(event){
            this._portid = event.target.value;
            // 请求 url: /onu_deny_list?port_id=1
            this.$http.get('/onu_deny_list?port_id='+this._portid).then(res=>{
                if(res.data.code === 1){
                    this.onu_deny_list = res.data;
                }else{
                    this.onu_deny_list = {}
                }
            }).catch(err=>{
                // to do
            })
        },
        //  点击 确认/取消 时进行的操作
        handle(bool){
            if(bool){
                if(this.test_macaddr || this.addItem.macaddr === ''){
                    this.$message({
                        type: 'error',
                        text: this.lanMap['param_mac']
                    })
                    return
                }
                this.post_param.add = {
                    "method":"add",
                    "param":{
                        "port_id":this._portid,
                        "macaddr": this.addItem.macaddr,
                        "onu_desc" : this.addItem.desc
                    }
                }
                this.$http.post('/onu_deny_list',this.post_param.add).then(res=>{
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
            this.addItem.isShow = false;
            this.post_param.add = {};
        },
        //  点击添加按钮时，显示添加模板
        add(){
            this.addItem.isShow = !this.addItem.isShow;
            this.addItem.macaddr = '';
            this.addItem.desc = '';
        },
        // 根据确认框返回结果，进行操作
        result(bool){
            if(bool){
                // 确认框中用户点击确认时的操作
                this.$http.post('/onu_allow_list',this.post_param.delete).then(res=>{
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
            this.userChoose = false;
            this.post_param.delete = {};
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
    },
    watch: {
        'addItem.macaddr'(){
            var reg = /^[0-9a-zA-Z]{2}\:[0-9a-zA-Z]{2}\:[0-9a-zA-Z]{2}\:[0-9a-zA-Z]{2}\:[0-9a-zA-Z]{2}\:[0-9a-zA-Z]{2}$/;
            if(this.addItem.macaddr === ''){
                this.test_macaddr = false;
                return
            }
            if(!reg.test(this.addItem.macaddr)){
                this.test_macaddr = true;
            }else{
                this.test_macaddr = false;
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
    line-height: 40px;
}
.add-item>span{
    width: 15%;
    line-height: 32px;
    display: inline-block;
    height: 32px;
    text-align: center;
    font-size: 16px;
}
ul{
    border:1px solid #ddd;
    margin-top: 30px;
    width: 1020px;
}
ul>li{
    font-size: 0;
    height: 32px;
    line-height: 32px;
    border-bottom: 1px solid #ddd;
    vertical-align: middle;
}
ul>li:last-child{
    border-bottom: none;
}
ul+div{
    margin-left: 30px;
}
ul span{
    display: inline-block;
    vertical-align: middle;
    height: 32px;
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
    line-height: 32px;
    border-radius: 5px;
    background: #ddd;
    text-align: center;
    margin-left: 10px;
}
.inline-btn{
    height: 26px;
    line-height: 26px;
}
i.icon-delete{
    display: inline-block;
    width: 32px;
    height: 32px;
    background: url('../../assets/delete-normal.png') no-repeat;
}
div.data-failed{
    margin: 20px 10px;
    color: red;
}
</style>