<template>
    <div>
        <loading v-if="!mac_age.data && !cfg_age && !tab"></loading>
        <div>
            <h2>{{ lanMap['mac_mgmt'] }}</h2>
        </div>
        <div v-if="mac_age.data" class="mac-age">
            <span>{{ lanMap['age'] }} : </span>
            <span>{{ mac_age.data.age }}</span>
            <a href="javascript:;" @click="change_macage">{{ lanMap['config'] }}</a>
        </div>
        <div class="mac-age" v-if="cfg_age">
            <span>{{ lanMap['age'] }} : </span>
            <input type="text" v-model.number="macage" placeholder="secends">
            <a href="javascript:;" @click="macage_choose(true)">{{ lanMap['apply'] }}</a>
            <a href="javascript:;" @click="macage_choose(false)">{{ lanMap['cancel'] }}</a>
        </div>
        <div class="query-select">
            <p>{{ lanMap['detail'] }}</p>
            <div class="query-frame">
                <span>{{ lanMap['inquery_mode'] }}：</span>
                <select v-model="flag">
                    <option value="1">{{ lanMap['mac_type'] }}</option>
                    <option value="2">{{ lanMap['port_id'] }}</option>
                    <option value="4">{{ lanMap['vlan_id'] }}</option>
                    <option value="8">{{ lanMap['macaddr'] }}</option>
                </select>
            </div>
            <div v-if="choose_macaddr" class="query-frame">
                <span>{{ lanMap['macaddr'] }}</span>
                <input type="text" placeholder="mac addr" v-model="macaddr">
                <span>{{ lanMap['ipmask'] }}</span>
                <input type="text" placeholder="mac mask" v-model="macmask">
                <a href="javascript:;" @click="query_macaddr">{{ lanMap['apply'] }}</a>
            </div>
            <div v-if="choose_mactype" class="query-frame">
                <select v-model="mac_type">
                    <option value="0">{{ lanMap['dynamic'] }}</option>
                    <option value="1">{{ lanMap['static'] }}</option>
                    <option value="2">{{ lanMap['blackhole'] }}</option>
                    <option value="3">all</option>
                </select>
            </div>
            <div v-if="choose_port" class="query-frame">
                <input type="text" placeholder="port id" v-model.number="port_id">
                <a href="javascript:;" @click="query_portid">{{ lanMap['apply'] }}</a>
            </div>
            <div v-if="choose_vlan" class="query-frame">
                <input type="text" placeholder="VLAN ID" v-model.number="vlan_id">
                <!-- <input type="text" placeholder="max"> -->
                <a href="javascript:;" @click="query_vlanid">{{ lanMap['apply'] }}</a>
            </div>
        </div>
        <ul class="mac-table" v-if="this.mac_table[0]">
            <li>
                <span>{{ lanMap['CDkey'] }}</span>
                <span v-for="(item,key) in mac_table[0]" :key="key">{{ lanMap[key] }}</span>
                <span>{{ lanMap['delete'] }}</span>
            </li>
            <li v-for="(item,key) in mac_table" :key="key">
                <span>{{ (pagination.index-1)*pagination.display + key + 1 }}</span>
                <span>{{ item.macaddr }}</span>
                <span>{{ item.vlan_id }}</span>
                <span>{{ item.port_id ? getName(item.port_id) : 'CPU' }}</span>
                <span>
                    {{ item.mac_type === 0 ? lanMap['dynamic'] : item.mac_type === 1 ? lanMap['static'] : lanMap['blackhole'] }}
                </span>
                <span>
                    <a href="javascript:;" @click="delete_mac(item)">{{ lanMap['delete'] }}</a>
                </span>
            </li>
            <li v-if="mac_table.length%200 === 0">
                <a href="javascript:;" @click="loadmore">{{ lanMap['loadmore'] }}</a>
            </li>
            <li v-if="pagination.page > 2" class="paginations">
                <ul class="pagination rt">
                    <li :class="pagination.index > 1 ? '' : 'disabled'" @click="changeIndex(1)">&lt;&lt;</li>
                    <li :class="pagination.index > 1 ? '' : 'disabled'" @click="changeIndex(pagination.index-1)">&lt;</li>
                    <li v-if="pagination.index>2" @click="changeIndex(pagination.index-2)">{{ pagination.index-2 }}</li>
                    <li v-if="pagination.index>1" @click="changeIndex(pagination.index-1)">{{ pagination.index-1 }}</li>
                    <li class="actived" @click="changeIndex(pagination.index)">{{ pagination.index }}</li>
                    <li v-if="pagination.page-1 >= pagination.index" @click="changeIndex(pagination.index+1)">{{ pagination.index+1 }}</li>
                    <li v-if="pagination.page-2 >= pagination.index" @click="changeIndex(pagination.index+2)">{{ pagination.index+2 }}</li>
                    <li :class="pagination.page-1 >= pagination.index ? '' : 'disabled'" @click="changeIndex(pagination.index+1)">&gt;</li>
                    <li :class="pagination.page !== pagination.index ? '' : 'disabled'" @click="changeIndex(pagination.page)">&gt;&gt;</li>
                </ul>
            </li>
        </ul>
        <div v-else class="nomore-data">
            <p>没有更多的数据了...</p>
        </div>
        <confirm tool-tips="是否确认删除？" @choose="result" v-if="userChoose"></confirm> 
    </div>
</template>

<script>
import { mapState } from 'vuex'
import confirm from '@/components/common/confirm'
import loading from '@/components/common/loading'
    export default {
        name: 'macMgmt',
        components: { confirm,loading },
        computed: mapState(['lanMap','change_url','port_name']),
        data(){
            return {
                //  mac地址老化时间 
                mac_age: {},
                //  mac表
                tab: [],
                //  分页mac表
                mac_table: [],
                // 绑定老化时间输入框
                macage: '',
                // 控制老化时间模态框显示隐藏
                cfg_age: false,
                // 加载方式(查询条件)
                flag: 1,
                // 懒加载
                count: 0,
                // 分页插件数据
                pagination: {
                    // 当前页面
                    index: 1,
                    // 总页数
                    page: 0,
                    // 每页显示的数据数量
                    display: 20
                },
                //  查询条件*4
                choose_macaddr: false,
                choose_mactype: true,
                choose_port: false,
                choose_vlan: false,
                //  初始化参数
                flag: 1,
                mac_type: 3,
                port_id: 0,
                vlan_id: 0,
                vlan_id_e: 0,
                macaddr: '00:00:00:00:00:00',
                macmask: '00:00:00:00:00:00',
                //  用户确认框
                userChoose: false,
                //  将要删除的mac地址数据
                delete_mac_data: {}
            }
        },
        created(){
            this.$http.get(this.change_url.macage).then(res=>{
                this.mac_age = res.data;
            }).catch(err=>{
                // to do 
            })
            var post_param = {
                    "method":"get",
                    "param":{
                        "flags": 1,
                        "count": 0,
                        "mac_type": 3,
                        "port_id": 1,
                        "vlan_id": 0,
                        "vlan_id_e": 0,
                        "macaddr": "00:00:00:00:00:11",
                        "macmask": "00:00:00:00:00:ff"
                    }
            }
            if(this.change_url.beta === 'test'){
                this.$http.get(this.change_url.mactab).then(res=>{
                    this.tab = res.data.data;
                    this.pagination.page = Math.ceil(this.tab.length/this.pagination.display);
                    this.getPage();
                })
            }else{
                this.$http.post(this.change_url.mactab,post_param).then(res=>{
                    this.tab = res.data.data;
                    this.pagination.page = Math.ceil(this.tab.length/this.pagination.display);
                    this.getPage();
                }).catch(err=>{
                    // to do
                })
            }
        },
        methods: {
            getName(id){
                if(id < 1) return false
                return this.port_name.pon[id] ? this.port_name.pon[id].name : this.port_name.ge[id].name;
            },
            getData(){
                var post_param = {
                    "method":"get",
                    "param":{
                        "flags": this.flag,
                        "count": this.count,
                        "mac_type": this.mac_type,
                        "port_id": this.port_id,
                        "vlan_id": this.vlan_id,
                        "vlan_id_e": this.vlan_id_e,
                        "macaddr": this.macaddr,
                        "macmask": this.macmask
                    }
                }
                this.$http.post('/switch_mac?form=table',post_param).then(res=>{
                    if(res.data.code === 1){
                        if(this.tab.length%200 === 0 && this.count !== 0){
                            this.tab.concat(res.data.data);
                        }else if(this.count === 0){
                            this.tab = res.data.data;
                        }
                        this.pagination.page = Math.ceil(this.tab.length/this.pagination.display);
                        this.getPage();
                    }else{
                        this.mac_table = [];
                    }
                }).catch(err=>{
                    // to do
                })
            },
            loadmore(){
                this.count += 1;
                this.getData();
            },
            //  删除mac地址处理函数
            delete_mac(data){
                //  打开模态框
                this.userChoose = true;
                //  将要删除的节点的数据缓存
                this.delete_mac_data = data;
            },
            result(bool){
                if(bool){
                    var post_params = {
                        "method":"delete",
                        "param":{
                            "mac_type": this.delete_mac_data.mac_type,
                            "macaddr": this.delete_mac_data.macaddr,
                            "vlan_id": this.delete_mac_data.vlan_id
                        }
                    }
                    this.$http.post('/switch_mac?form=table',post_params).then(res=>{
                        // do sth
                        this.getData();
                    }).catch(err=>{
                        // to do
                    })
                }
                this.userChoose = false;
            },
            //  老化时间  编辑框  打开隐藏
            change_macage(){
                this.cfg_age = !this.cfg_age;
            },
            //  分页切换
            changeIndex(n){
                if(n < 1 || n > this.pagination.page){
                    return 
                }
                this.pagination.index = n;
                this.getPage();
            },
            //  老化时间编辑框内  提交按钮
            macage_choose(bool){
                if(bool && this.macage){
                    this.$http.get('/switch_mac?form=age&value=' + this.macage).then(res=>{
                        //  do sth
                        if(res.data.code == 1){
                            this.$http.get(this.change_url.macage).then(res=>{
                                this.mac_age = res.data;
                            })
                        }
                    })
                }
                this.cfg_age = false;
            },
            //  计算分页中当前显示页面的数据
            getPage(){
                this.mac_table = this.tab.slice(this.pagination.display*(this.pagination.index-1),this.pagination.index*this.pagination.display);
            },
            //  隐藏选择框
            hide_query_select(){
                this.choose_vlan = false;
                this.choose_port = false;
                this.choose_mactype = false;
                this.choose_macaddr = false;
            },
            query_macaddr(){
                this.tab = [];
                this.count = 0;
                this.mac_type = 3;
                this.port_id = 0;
                this.vlan_id = 0;
                this.vlan_id_e = 0;
                this.getData();
            },
            query_portid(){
                this.tab = [];
                this.count = 0;
                this.mac_type = 3;
                this.vlan_id = 0;
                this.vlan_id_e = 0;
                this.macaddr = '00:00:00:00:00:00';
                this.macmask = '00:00:00:00:00:00';
                this.getData();
            },
            query_vlanid(){
                this.tab = [];
                this.count = 0;
                this.mac_type = 3;
                this.port_id = 0;
                this.macaddr = '00:00:00:00:00:00';
                this.macmask = '00:00:00:00:00:00';
                this.getData();
            }
        },
        watch: {
            flag(){
                if(this.flag==8){
                    this.hide_query_select();
                    this.choose_macaddr = true;
                }
                if(this.flag==1){
                    this.hide_query_select();
                    this.choose_mactype = true;
                    this.getData();
                }
                if(this.flag==2){
                    this.hide_query_select();
                    this.choose_port = true;
                }
                if(this.flag==4){
                    this.hide_query_select();
                    this.choose_vlan = true;
                }
            },
            mac_type(){
                this.tab = [];
                this.count = 0;
                this.port_id = 0;
                this.vlan_id = 0;
                this.vlan_id_e = 0;
                this.macaddr = '00:00:00:00:00:00';
                this.macmask = '00:00:00:00:00:00';
                this.getData();
            }
        }
    }
</script>

<style scoped>
ul.mac-table{
    border: 1px solid #ddd;
}
div.nomore-data{
    margin: 0 50px;
    font-size: 18px;
    color: red;
}
div>h2{
    font-size: 20px;
    font-weight: 600;
    color: #67AEF7;
    margin: 10px 0 20px 10px;
}
div.mac-age{
    margin-top: 20px;
    vertical-align: middle;
    line-height: 42px;
}
div.mac-age>span{
    display: inline-block;
    width: 100px;
    vertical-align: middle;
}
div.mac-age>input{
    vertical-align: middle;
}
div.mac-age>span:first-child{
    margin-left: 30px;
    font-size: 18px;
    font-weight: 600;
    color: #666;
}
a{
    display: inline-block;
    width: 120px;
    height: 30px;
    font-size: 16px;
    line-height: 30px;
    text-align: center;
    border-radius: 5px;
    background: #ddd;
    transition: all .1s linear;
    vertical-align: middle;
    margin: 5px;
}
a:active{
    border: 1px solid #67AEF7;
    background: #ccc;
}
ul.mac-table{
    margin: 20px 0 20px 10px;
}
ul.mac-table>li{
    font-size: 0;
    border-bottom: 1px solid #ccc;
}
ul.mac-table>li>span{
    display: inline-block;
    width: 15%;
    font-size: 16px;
    text-align: center;
    padding: 5px 0;
    word-wrap: break-word;
}
ul.mac-table>li.paginations{
    border-bottom: 0;
}
ul.pagination{
    margin: 10px;
    margin-right: 60px;
}
ul.pagination>li{
    float: left;
    font-size: 16px;
    color: #666;
    margin-left: 10px;
    border-radius: 3px;
    padding: 3px 8px;
    border: 1px solid #333;
    cursor: pointer;
}
ul>li:after{
    content: "";
    display: table;
    clear: both;
}
ul.pagination:after{
    content: "";
    display: table;
    clear: both;
}
ul>li.actived{
    color: #67aef7;
    border-color: #67aef7;
}
li>span>a{
    margin: 0;
}
ul.pagination>li.disabled{
    /* pointer-events: none; */
    cursor: not-allowed;
    box-shadow: none;
    opacity: .65;
}
div.query-select{
    margin: 20px 0 20px 30px;
    vertical-align: middle;
}
div.query-select>p{
    font-size: 18px;
    font-weight: 600;
    color: #666;
}
div.query-select:after{
    content: "";
    display: table;
    clear: both;
}
div.query-frame{
    float: left;
    margin: 10px;
    height: 40px;
    line-height: 40px;
}
div.query-select select{
    width: 150px;
    height: 30px;
    font-size: 15px;
    text-indent: 10px;
}
</style>