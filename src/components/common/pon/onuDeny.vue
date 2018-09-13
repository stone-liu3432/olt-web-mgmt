<template>
    <div class="onu-deny">
        <div>
            <h2>{{ lanMap['onu_deny'] }}</h2>
            <span>{{ lanMap['port_id'] }}</span>
            <select v-model.number="portid">
                <option v-for="(item,key) in port_name.pon" :key="key" :value="item.id">
                    {{ item.name }}
                </option>
            </select>
        </div>
        <hr>
        <div class="add-deny">
            <div class="tool-tips">
                <i></i>
                <div>
                    <div>
                        <p>{{ lanMap['add'] }}</p>
                        <p>{{ lanMap['onudeny_add_tips'] }}</p>
                    </div>
                    <div>
                        <p>{{ lanMap['delete'] }}</p>
                        <p>{{ lanMap['click'] }}<i class="icon-delete"></i>{{ lanMap['onudeny_del_tips'] }}</p>
                    </div>
                </div>
            </div>
            <div>
                <a href="javascript:;" @click="add">{{ lanMap['add'] }}</a>
            </div>
        </div>
        <div class="add-item" v-if="addItem.isShow">
            <span>{{ lanMap['macaddr'] }}</span>
            <input type="text" v-model="addItem.macaddr" :style="{ 'border-color': test_macaddr ? 'red' : '' }" v-focus>
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
            <li class="bg-title">
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
        <confirm :tool-tips="lanMap['confirm_del_deny']" @choose="result" v-if="userChoose"></confirm>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'onuDeny',
    computed: mapState(['lanMap','port_name','change_url']),
    data(){
        return {
            onu_deny_list:{},
            portid: 0,
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
    activated(){
        this.getData();
    },
    created(){
        // 请求 url: /onu_deny_list?port_id=1
        var pid = sessionStorage.getItem('pid');
        this.portid = Number(pid) || 1;
        if(this.change_url.beta === 'test'){
            var url;
            if(this.change_url.onu_allow[this.change_url.onu_allow.length - 1] != '='){
                    url = this.change_url.onu_deny;
                }else{
                    url = this.change_url.onu_deny + this.portid;
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
        getData(){
            this.$http.get('/onu_deny_list?port_id='+this.portid).then(res=>{
                if(res.data.code === 1){
                    this.onu_deny_list = res.data;
                }else{
                    this.onu_deny_list = {}
                }
            }).catch(err=>{
                // to do
            })
        },
        //  点击 确认/取消 时进行的操作   -->  增加按钮
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
                        "port_id": Number(this.portid),
                        "macaddr": this.addItem.macaddr,
                        "onu_desc" : this.addItem.desc
                    }
                }
                this.$http.post('/onu_deny_list',this.post_param.add).then(res=>{
                    if(res.data.code === 1){
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap['add'] + this.lanMap['st_success']
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
            this.addItem.isShow = false;
            this.post_param.add = {};
        },
        //  点击添加按钮时，显示添加模板
        add(){
            this.addItem.isShow = !this.addItem.isShow;
            this.addItem.macaddr = '';
            this.addItem.desc = '';
        },
        // 根据确认框返回结果，进行操作  -->  删除按钮
        result(bool){
            if(bool){
                // 确认框中用户点击确认时的操作
                this.$http.post('/onu_deny_list',this.post_param.delete).then(res=>{
                    if(res.data.code === 1){
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap['delete'] + this.lanMap['st_success']
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
            var reg = /^([0-9abcdefABCDEF]{2}\:){5}[0-9abcdefABCDEF]{2}$/;
            if(this.addItem.macaddr === ''){
                this.test_macaddr = false;
                return
            }
            if(!reg.test(this.addItem.macaddr)){
                this.test_macaddr = true;
            }else{
                this.test_macaddr = false;
            }
        },
        //  切换端口的操作
        portid(){
            sessionStorage.setItem('pid',Number(this.portid));
            this.getData();
        }
    }
}
</script>

<style scoped lang="less">
h2{
	font-size: 24px;
	font-weight: 600;
	color: 	#67AEF7;
}
hr{
    margin: 20px 0;
}
.onu-deny{
    margin-top: 20px;
    >div:first-child{
        height: 30px;
        line-height: 30px;
        h2{
            float: left;
            width: 300px;
        }
    }
}
div.add-deny{
    height: 36px;
    line-height: 36px;
    >div{
        float: right;
    }
    &:after{
        content: "";
        display: table;
        clear: both;
    }
}
.add-item{
    height: 40px;
    min-width: 1060px;
    margin-top: 10px;
    border: 1px solid #ddd;
    line-height: 40px;
    vertical-align: middle;
    line-height: 40px;
    input{
        width: 23%;
    }
}
.bg-title{
    background: #67aef6;
}
.add-item>span{
    width: 12%;
    line-height: 32px;
    display: inline-block;
    height: 32px;
    text-align: center;
    font-size: 16px;
}
ul{
    border:1px solid #ddd;
    margin: 20px 0 0 10px;
    min-width: 1020px;
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
    width: 23%;
    text-align: center;
    font-size: 16px;
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
    width: 120px;
    height: 30px;
    line-height: 30px;
    padding: 0;
    margin-left: 10px;
}
.inline-btn{
    height: 26px;
    line-height: 26px;
}
i.icon-delete{
    display: inline-block;
    cursor: pointer;
    width: 32px;
    height: 32px;
    vertical-align: middle;
    background: url('../../../assets/delete-normal.png') no-repeat;
}
div.data-failed{
    margin: 20px 10px;
    color: red;
}
div.tool-tips{
    margin: 0 0 0 20px;
    display: inline-block;
    position: relative;
    height: 36px;
    line-height: 36px;
    &:hover>div{
        display: block;
    }
    >i{
        display: inline-block;
        width: 32px;
        height: 32px;
        cursor: pointer;
        vertical-align: middle;
        background: url('../../../assets/tips.png') no-repeat;
    }
    >div{
        display: none;
        width: 300px;
        height: 200px;
        position: absolute;
        right: 26px;
        top: 26px;
        border-radius: 10px;
        padding: 8px;
        background: #ddd;
        >div{
            padding: 5px 0;
            &:first-child{
                border-bottom: 1px solid #333;
            }
            >p{
                color: #333;
                line-height: 20px;
                font-size: 14px;
                &:first-child{
                    color: #67AEF7;
                    padding: 5px;
                }
            }
        }
    }
}
</style>