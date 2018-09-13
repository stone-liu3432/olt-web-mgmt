<template>
    <div class="multicast">
        <div>
            <span>{{ lanMap['multicast_table'] }}</span>
            <span>
                <a href="javascript:void(0);" @click="open_add_modal">{{ lanMap['add'] + lanMap['static_table'] }}</a>
                <a href="javascript:void(0);" @click="open_del_modal" v-if="static_multi.length > 0">{{ lanMap['delete'] + lanMap['static_table'] }}</a>
            </span>
            <i @click="getData"></i>
        </div>
        <ul v-if="multicast_info.data && multicast_info.data.length > 0">
            <li class="bg-title">
                <span class="multi-ip">{{ lanMap['multi_ip'] }}</span>
                <span class="vid">{{ lanMap['vid'] }}</span>
                <span class="action">{{ lanMap['action'] }}</span>
                <span class="port-list">{{ lanMap['host_portlist'] }}</span>
                <span class="port-list">{{ lanMap['router_portlist'] }}</span>
            </li>
            <li v-for="(item,key) in multicast_tab" :key="key" class="multi-item">
                <span class="multi-ip">{{ item.multi_ip }}</span>
                <span class="vid">{{ item.vid }}</span>
                <span class="action">{{ item.action ? lanMap['static'] : lanMap['dynamic'] }}</span>
                <span class="port-list">{{ analysis(item.host_portlist) }}</span>
                <span class="port-list">{{ analysis(item.router_portlist) }}</span>
            </li>
        </ul>
        <div class="tab-bar" v-if="page > 1">
            <div @click="jump_page(page - 1)" :style="{ 'cursor' : index === page - 1 ? 'not-allowed' : 'pointer' }">></div>
            <div v-if="index + 2 < page" @click="jump_page(index + 2)">{{ index + 3 }}</div>
            <div v-if="index + 1 < page" @click="jump_page(index + 1)">{{ index + 2 }}</div>
            <div @click="jump_page(index)" class="actived">{{ index + 1 }}</div>
            <div v-if="index - 1 >= 0" @click="jump_page(index - 1)">{{ index }}</div>
            <div v-if="index - 2 >= 0" @click="jump_page(index - 2)">{{ index - 1 }}</div>
            <div @click="jump_page(0)" :style="{ 'cursor': this.index === 0 ? 'not-allowed' : 'pointer'}">{{ "<" }}</div>
        </div>
        <div class="modal-dialog" v-if="show_add_modal">
            <div class="cover"></div>
            <div class="add-content">
                <div>
                    <h3 v-if="is_add">{{ lanMap['add'] + lanMap['static_table'] }}</h3>
                    <h3 v-else>{{ lanMap['delete'] + lanMap['static_table'] }}</h3>
                    <div v-if="is_add">
                        <span>{{ lanMap['multi_ip'] }}</span>
                        <input type="text" v-focus v-model.trim="multi_ip" placeholder="ex : 127.1.1.1"
                         :style="{ 'border-color': multi_ip !== '' && !reg_ip.test(multi_ip) ? 'red' : '' }">
                    </div>
                    <div v-else>
                        <span>{{ lanMap['multi_ip'] }}</span>
                        <select v-model="del_multi_ip">
                            <option :value="item.multi_ip" v-for="(item,index) in  static_multi" :key="index">{{ item.multi_ip }}</option>
                        </select>
                    </div>
                    <div v-if="is_add">
                        <span>{{ lanMap['vid'] }}</span>
                        <input type="text" v-model.number="vid" placeholder="1-4094"
                         :style="{ 'border-color' : vid !== '' && (vid < 1 || vid > 4094 || isNaN(vid)) ? 'red' : '' }">
                    </div>
                    <div v-else>
                        <span>{{ lanMap['vid'] }}</span>
                        <span>{{ vid }}</span>
                    </div>
                    <div v-if="is_add">
                        <span>{{ lanMap['port_id'] }}</span>
                        <select v-model.number="portid">
                            <option :value="key" v-for="(item,key) in port_name.pon" :key="key">{{ item.name }}</option>
                            <option :value="key" v-for="(item,key) in port_name.ge" :key="key">{{ item.name }}</option>
                            <option :value="key" v-for="(item,key) in port_name.xge" :key="key" v-if="port_name.xge">{{ item.name }}</option>
                        </select>
                    </div>
                    <div v-else>
                        <span>{{ lanMap['port_id'] }}</span>
                        <span>{{ port_name.pon[portid] ? port_name.pon[portid].name : port_name.ge[portid] ? port_name.ge[portid].name : port_name.xge[portid].name }}</span>
                    </div>
                    <div v-if="is_add">
                        <a href="javascript:void(0);" @click="submit_add_multi">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="close_add_modal">{{ lanMap['cancel'] }}</a>
                    </div>
                    <div v-else>
                        <a href="javascript:void(0);" @click="submit_del_multi">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="close_add_modal">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="close_add_modal"></div>
            </div>
        </div>
        <confirm v-if="show_del_modal" @choose="result_del_multi"></confirm>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'multicast',
    computed: mapState(['lanMap','change_url','port_name','system']),
    data(){
        return {
            multicast_info: {},
            //  分页显示的数据
            multicast_tab: [],
            //  分页数据 * 3
            index: 0,
            page: 0,
            display: 10,
            //  静态组播项参数 * 3
            portid: 1,
            vid: '',
            multi_ip: '',
            reg_ip: /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/,
            //  模态框
            show_add_modal: false,
            show_del_modal: false,
            is_add: true,
            //  所有静态组播表项
            static_multi: [],
            del_multi_ip: ''
        }
    },
    created(){
        this.getData();
    },
    activated(){
        this.getData();
    },
    methods: {
        getData(){
            this.$http.get(this.change_url.get_multicast).then(res=>{
                if(res.data.code === 1){
                    this.multicast_info = res.data;
                    if(this.multicast_info.data && this.multicast_info.data.length > 0){
                        this.page = Math.ceil(this.multicast_info.data.length/this.display);
                        this.multicast_tab = this.multicast_info.data.slice(0,this.display);
                        this.index = 0;
                        this.static_multi = this.multicast_info.data.filter(item=>{
                            return item.action === 1;
                        })
                    }else{
                        this.static_multi = [];
                    }
                }else{
                    this.multicast_info = {};
                    this.static_multi = [];
                }
            }).catch(err=>{
                // to do
            })
        },
        //  分页跳转
        jump_page(index){
            if(index === this.index || index < 0 || index >= this.page) return
            if(index*this.display - this.multicast_info.data.length > 10 || index === 0){
                this.multicast_tab = this.multicast_info.data.slice(index*this.display,this.display);
            }else{
                this.multicast_tab = this.multicast_info.data.slice(index*this.display);
            }
            this.index = index;
        },
        //  打开添加窗口
        open_add_modal(){
            this.show_add_modal = true;
            this.is_add = true;
        },
        //  关闭添加窗口
        close_add_modal(){
            this.show_add_modal = false;
            this.multi_ip = '';
            this.portid = 1;
            this.vid = '';
            this.del_multi_ip = '';
        },
        //  提交添加信息
        submit_add_multi(){
            if(!this.reg_ip.test(this.multi_ip)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['multi_ip']
                })
                return
            }
            if(this.vid < 1 || this.vid > 4094 || isNaN(this.vid)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['vid']
                })
                return
            }
            var post_param = {
                "method": "add",
                "param":{
                    "multi_ip": this.multi_ip,
                    "vid": this.vid, 
                    "port_id": this.portid
                }
            }
            this.$http.post('/switch_igmp?form=static_entry',post_param).then(res=>{
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
            this.close_add_modal();
        },
        //  打开删除confirm确认框
        open_del_modal(){
            this.show_add_modal = true;
            this.is_add = false;
            this.del_multi_ip = this.static_multi[0].multi_ip;
            this.vid = this.static_multi[0].vid;
            this.portid = Number(this.static_multi[0].host_portlist);
        },
        //  提交删除的信息
        submit_del_multi(){
            var post_param = {
                "method":"delete",
                "param":{
                    "multi_ip": this.del_multi_ip,
                    "vid": this.vid, 
                    "port_id": this.portid
                }
            }
            this.$http.post('/switch_igmp?form=static_entry',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['setting_ok']
                    })
                    this.getData();
                }else{
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_add_modal();
        },
        //  解析后台返回的字符串
        analysis(str){
            if(!str) return ''
            var result = [];
            var arr = str.split(',');
            for(var i=0,len=arr.length;i<len;i++){
                var substrs = arr[i];
                if(substrs.indexOf('-') !== -1){
                    var subArr = substrs.split('-');
                    var min = Number(subArr[0]),max = Number(subArr[subArr.length - 1]);
                    if(isNaN(min) || isNaN(max)) throw new TypeError;
                    result.push(min);
                    for(var j=1;j<max-min;j++){
                        result.push(min+j);
                    }
                    result.push(max);
                }else{
                    if(isNaN(Number(substrs))) throw new TypeError;
                    result.push(Number(substrs));
                }
            }
            return this.nomenclature(result)
        },
        //  根据返回数据，命名端口号
        nomenclature(arr){
            if(!arr) return ''
            var results = '';
            var pon_count = this.system.data.ponports,ge_count = this.system.data.geports;
            for(var i=0,len=arr.length;i<len;i++){
                var m = arr[i];
                if(m <= pon_count){
                    results += pon_count < 10 ? 'PON0'+ m + ',' : 'PON' + m +',';
                }else if(m > pon_count && m <= (pon_count + ge_count)){
                    results += (m - pon_count) < 10 ? 'GE0' + (m - pon_count) + ',' : 'GE' + (m - pon_count) + ',';
                }else{
                    results += (m - (pon_count + ge_count)) < 10 ? 'XGE0' + (m - (pon_count + ge_count)) + ',' : 'XGE' + (m - (pon_count + ge_count)) + ',';
                }
            }
            return results.replace(/\,$/,'');
        }
    },
    watch: {
        'del_multi_ip'(){
            this.static_multi.forEach(item=>{
                if(item.multi_ip === this.del_multi_ip){
                    this.vid = item.vid;
                    this.portid = Number(item.host_portlist) || 1;
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
select{
    width: 200px;
    height: 30px;
    text-indent: 6px;
    border-radius: 3px;
    font-size: 16px;
}
div.multicast{
    .bg-title{
        background: #67aef6;
    }
    >div:first-child{
        span:first-child{
            font-size: 18px;
            color: #67aef7;
            display: inline-block;
            width: 200px;
        }
        a+a{
            margin-left: 20px;
        }
        i{
            display: inline-block;
            width: 32px;
            height: 32px;
            background: url('../../../assets/refresh.png') no-repeat;
            vertical-align: middle;
            margin-left: 30px;
            cursor: pointer;
        }
    }
    div+ul{
        margin: 20px 0 0 0;
        width: 100%;
        box-sizing: border-box;
        li{
            padding: 2px 0;
            word-wrap: break-word;
            word-break: keep-all;
            font-size: 0;
            border: 1px solid #ccc;
            border-bottom: none;
            &:last-child{
                border-bottom: 1px solid #ccc;
            }
            span{
                box-sizing: border-box;
                vertical-align: middle;
                display: inline-block;
                font-size: 16px;
                padding: 5px;
                text-align: center;
            }
            .multi-ip{
                width: 14.6%;
            }
            .vid{
                width: 11.6%;
            }
            .action{
                width: 11.6%;
            }
            .port-list{
                width: 30.8%;
            }
            a{
                margin: 0;
                height: 26px;
                line-height: 26px;
                box-sizing: border-box;
            }
        }
    }
    div.tab-bar{
        margin-top: 8px;
        div{
            float: right;
            cursor: pointer;
            width: 30px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            border: 1px solid #ccc;
            border-left: none;
            font-weight: 500;
            &:last-child{
                border-radius: 5px 0 0 5px;
                border-left: 1px solid #ccc;
            }
            &:first-child{
                border-radius: 0 5px 5px 0;
            }
        }
        div.actived{
            color: #67aef7;
        }
        &:after{
            content: '';
            display: table;
            clear: both;
        }
    }
    div.add-content{
        width: 500px;
        height: 260px;
        h3{
            font-size: 22px;
            padding-left: 30px;
            color: #67aef6;
            height: 50px;
            line-height: 60px;
        }
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
}
</style>
