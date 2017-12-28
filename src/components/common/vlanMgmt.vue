<template>
    <div class="vlan-mgmt">
        <div>
            <h2>{{ lanMap['vlan_cfg'] }}</h2>
            <div>
                <a href="javascript:;" @click="createVlan">{{ lanMap['create'] }}VLAN</a>
                <!-- <a href="javascript:;" @click="addPort">添加端口</a>
                <a href="javascript:;" @click="removePort">移除端口</a> -->
            </div>
            <div class="add-vlan" v-if="create_vlan">
                <span>VLAN ID：</span>
                <span>
                    <input type="text" placeholder="VLAN ID 1-4094" v-model="new_vlan" :style="{ 'border-color' : (new_vlan != '' && (isNaN(new_vlan) || new_vlan > 4094 || new_vlan < 1)) ? 'red' : '' }">
                </span>
                <a href="javascript:;" @click="handle_create(true)">{{ lanMap['apply'] }}</a>
                <a href="javascript:;" @click="handle_create(false)">{{ lanMap['cancel'] }}</a>
            </div>
        </div>
        <div class="search">
            <p class="lf">{{  lanMap['vlan_list'] }}</p>
            <div class="lf">
                <input type="text" placeholder="input VLAN ID to search" v-model="search_id">
                <a href="javascript:;" @click="searchVlan">{{ lanMap['find'] }}</a>
            </div>
        </div>
        <div v-if="not_found_vlan">
            <p>没有找到指定的VLAN</p>
        </div>
        <ul v-if="vlan_tab[0]">
            <li>
                <!-- <input type="radio" name="checkedVlan" style="visibility:hidden"> -->
                <span v-for="(item,key) in vlan_tab[0]" :key="key">{{ key }}</span>
                <span class="vlan-cfg-title">{{ lanMap['config'] }}</span>
            </li>
            <li v-for="(item,index) in vlan_tab" :key="index">
                <!-- <input type="radio" v-model="vlanid" :value="item.vlan_id"> -->
                <span>{{ item.vlan_id }}</span>
                <span>{{ analysis(item.tagged_portlist) }}</span>
                <span>{{ analysis(item.untagged_portlist) }}</span>
                <a href="javascript:;"  @click="config_port(item.vlan_id)">{{ lanMap['config'] }}</a>
                <a href="javascript:;"  @click="deleteVlan(item.vlan_id)">{{ lanMap['delete'] }}</a>
            </li>
            <li v-if="vlan_list.data && vlan_list.data.length%200 == 0">
                <a href="javascript:;" @click="loadmore">{{ lanMap['loadmore'] }}</a>
            </li>
            <li v-if="pagination.page > 2" class="paginations">
                <ul class="pagination rt">
                    <li :class="pagination.index > 1 ? '' : 'disabled'" @click="changeIndex(1)" title="First">&lt;&lt;</li>
                    <li :class="pagination.index > 1 ? '' : 'disabled'" @click="changeIndex(pagination.index-1)" title="Prev">&lt;</li>
                    <li v-if="pagination.index>2" @click="changeIndex(pagination.index-2)">{{ pagination.index-2 }}</li>
                    <li v-if="pagination.index>1" @click="changeIndex(pagination.index-1)">{{ pagination.index-1 }}</li>
                    <li class="actived" @click="changeIndex(pagination.index)">{{ pagination.index }}</li>
                    <li v-if="pagination.page-1 >= pagination.index" @click="changeIndex(pagination.index+1)">{{ pagination.index+1 }}</li>
                    <li v-if="pagination.page-2 >= pagination.index" @click="changeIndex(pagination.index+2)">{{ pagination.index+2 }}</li>
                    <li :class="pagination.page-1 >= pagination.index ? '' : 'disabled'" @click="changeIndex(pagination.index+1)" title="Next">&gt;</li>
                    <li :class="pagination.page !== pagination.index ? '' : 'disabled'" @click="changeIndex(pagination.page)" title="End">&gt;&gt;</li>
                </ul>
            </li>
        </ul>
        <div class="modal-dialog" v-if="modalDialog">
            <div class="cover"></div>
            <div class="modal-content">
                <div class="modal-title">
                    <span>VLAN ID:</span>
                    <span>{{ vlanid }}</span>
                </div>
                <div class="modal-body">
                    <div class="vlan-mode">
                        <h3 class="lf">tagged:</h3>
                        <div class="vlan-port lf">
                            <div>
                                <span v-for="(item,key) in port_name.pon" :key="key" class="tagged">
                                    <!-- name属性用来绑定 tagged 和 untagged ,二者只能二选一 或者 不选 -->
                                    <input type="radio" :name="item.id" :id="'tagged'+item.id" @click="changeState($event)" value="0">
                                    <label :for="'tagged'+item.id">{{ item.name }}</label>
                                </span>
                            </div>
                            <div>
                                <span v-for="(item,key) in port_name.ge" :key="key" class="tagged">
                                    <input type="radio" :name="item.id" :id="'tagged'+item.id" @click="changeState($event)" value="0">
                                    <label :for="'tagged'+item.id">{{ item.name }}</label>
                                </span>
                            </div>
                        </div>
                    </div>
                    <hr/>
                    <div class="vlan-mode">
                        <h3 class="lf">untagged:</h3>
                        <div class="vlan-port lf">
                            <div>
                                <span v-for="(item,key) in port_name.pon" :key="key" class="untagged">
                                    <input type="radio" :name="item.id" :id="'untagged'+item.id" @click="changeState($event)" value="0">
                                    <label :for="'untagged'+item.id">{{ item.name }}</label>
                                </span>
                            </div>
                            <div>
                                <span v-for="(item,key) in port_name.ge" :key="key" class="untagged">
                                    <input type="radio" :name="item.id" :id="'untagged'+item.id" @click="changeState($event)" value="0">
                                    <label :for="'untagged'+item.id">{{ item.name }}</label>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="vlan-mode">
                        <a href="javascript:;" class="rt" @click="handle_cfg(false)">{{ lanMap['cancel'] }}</a>
                        <a href="javascript:;" class="rt" @click="handle_cfg(true)">{{ lanMap['apply'] }}</a>
                    </div>
                </div>
                <div class="close" @click="closeModal"></div>
            </div>
        </div>
        <confirm tool-tips="是否确认删除此VLAN?" @choose="result" v-if="userChoose"></confirm>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import confirm from '@/components/common/confirm'
    export default {
        name: 'vlanMgmt',
        components: { confirm },
        data(){
            return {
                // 已有的 VLAN列表
                vlan_list: {},
                // 分页的数据 --> 显示到页面的数据
                vlan_tab: {},
                // 删除VLAN确认框组件
                userChoose: false,
                // 创建VLAN模态框的显示隐藏参数
                create_vlan: false,
                vlanid: 0,
                // 查找的vlan id
                search_id: '',
                // 未查找到指定VLAN时的页面显示
                not_found_vlan: false,
                // 创建VLAN时，绑定的新创建的 VLAN ID
                new_vlan: '',
                // 分页数据(懒加载)
                count: 0,
                // vlan映射
                vlan_map: {},
                // 分页插件数据
                pagination: {
                    // 当前页面
                    index: 1,
                    // 总页数
                    page: 0,
                    // 每页显示的数据数量
                    display: 20
                },
                // 模态框隐藏显示
                modalDialog: false,
            }
        },
        created(){
            this.getData();
        },
        methods: {
            getData(){
                // 请求url: /switch_vlan?count=0
                var url;
                if(this.change_url.vlancfg.indexOf('+') === -1){
                    url = this.change_url.vlancfg;
                }else{
                    url = eval(this.change_url.vlancfg);
                }
                this.$http.get(url).then(res=>{
                    if(this.count == 0){
                        this.vlan_list = res.data;
                    }else{
                        this.vlan_list.data.concat(res.data.data);
                    }
                    if(this.vlan_list.data){
                        var vlan_map = {}
                        for(var key in this.vlan_list.data){
                            vlan_map[this.vlan_list.data[key].vlan_id] = this.vlan_list.data[key];
                        }
                        this.vlan_map = vlan_map;
                    }
                    this.pagination.page = Math.ceil(this.vlan_list.data.length/this.pagination.display);
                    this.getPage();
                }).catch(err=>{
                    // to do
                })
            },
            //  查找某一个vlan
            searchVlan(){
                var list = this.vlan_list.data;
                var tab = [];
                this.pagination.page = 0;
                for(var i=0,len=list.length;i<len;i++){
                    if(list[i].vlan_id == this.search_id){
                        tab.push(list[i]);
                        this.vlan_tab = tab;
                        this.not_found_vlan = false;
                        return
                    }
                }
                this.not_found_vlan = true;
                this.vlan_tab = {};
            },
            //  加载更多
            loadmore(){
                this.count += 1;
                this.getData();
            },
            //  单选框点击切换选中状态
            changeState(e){
                if(e.target.value == 1){
                    e.target.checked = false;
                    e.target.value = 0;
                }else{
                    var input = document.getElementsByName(e.target.name);
                    for(var i=0,len=input.length;i<len;i++){
                        input[i].value = 0;
                        input[i].checked = false;
                    }
                    e.target.checked = true;
                    e.target.value = 1;
                }
            },
            //  创建VLAN
            createVlan(){
                this.create_vlan = !this.create_vlan;
            },
            //  删除VLAN
            deleteVlan(vlanid){
                this.userChoose = true;
                this.vlanid = vlanid;
            },
            //  配置 VLAN 端口模态框
            config_port(id){
                this.modalDialog = true;
                this.vlanid = id;
                //  setTimeout延迟执行，会等到页面(DOM)加载完成后再执行此操作，否则取不到值
                setTimeout(()=>{
                    var tagged = document.querySelectorAll('span.tagged>input');
                    var untagged = document.querySelectorAll('span.untagged>input');
                    var tag_checked = this.analysis(this.vlan_map[this.vlanid].tagged_portlist).split(',');
                    var untag_checked = this.analysis(this.vlan_map[this.vlanid].untagged_portlist).split(',');
                    for(var i=0,len1=tagged.length;i<len1;i++){
                        for(var j=0,len2=tag_checked.length;j<len2;j++){
                            if(tagged[i].nextElementSibling.innerText.replace(/\s/g,'') === tag_checked[j].replace(/\s/g,'')){
                                tagged[i].checked = 'true';
                                tagged[i].value = 1;
                            }
                        }
                    }
                    for(var i=0,len1=untagged.length;i<len1;i++){
                        for(var j=0,len2=untag_checked.length;j<len2;j++){
                            if(untagged[i].nextElementSibling.innerText.replace(/\s/g,'') === untag_checked[j].replace(/\s/g,'')){
                                untagged[i].checked = 'true';
                                untagged[i].value = 1;
                            }
                        }
                    }
                },0)
            },
            closeModal(){
                this.modalDialog = false;
            },
            //  模态框控件 => 删除VLAN
            result(bool){
                if(bool){
                    // to do
                    var post_param = {
                        "method":"destroy",
                        "param":{
                            "vlan_id": this.vlanid
                        }
                    }
                    this.$http.post('/switch_vlan',post_param).then(res=>{
                        // do sth
                        this.getData();
                    }).catch(err=>{
                        // to do
                    })
                    this.userChoose = false;
                }else{
                    this.userChoose = false;
                    this.vlanid = 0;
                }
            },
            //  分页切换
            changeIndex(n){
                if(n < 1 || n > this.pagination.page){
                    return 
                }
                this.pagination.index = n;
                this.getPage();
            },
            //  计算分页中当前显示页面的数据
            getPage(){
                this.vlan_tab = this.vlan_list.data.slice(this.pagination.display*(this.pagination.index-1),this.pagination.index*this.pagination.display);
            },
            //  配置模态框的按钮动作，根据用户选择进行操作
            handle_cfg(bool){
                if(bool){
                    var tagged = document.querySelectorAll('span.tagged>input');
                    var untagged = document.querySelectorAll('span.untagged>input');
                    var tag_str = '',untag_str = ''
                    for(var i=0,len=tagged.length;i<len;i++){
                        if(tagged[i].checked){
                            tag_str += tagged[i].name;
                            tag_str += ',';
                        }
                    }
                    for(var i=0,len=untagged.length;i<len;i++){
                        if(untagged[i].checked){
                            untag_str += untagged[i].name;
                            untag_str += ',';
                        }
                    }
                    var post_param = {
                        "method":"set",
                        "param":{
                            "vlan_id": this.vlanid,
                            "tagged_portlist": tag_str.replace(/\,$/,''),
                            "untagged_portlist": untag_str.replace(/\,$/,'')
                        }
                    }
                    this.$http.post('/switch_vlan',post_param).then(res=>{
                        // do sth
                        if(res.data.code == 1){
                            this.getData();
                        }
                    }).catch(err=>{
                        // to do
                    })
                    return
                }
                this.modalDialog = false;
            },
            //  添加VLAN时的动作，根据用户选择进行操作
            handle_create(bool){
                if(bool){
                    var vid = Number(this.new_vlan);
                    if(isNaN(vid) || vid > 4094 || vid < 1) {
                        return
                    }
                    var post_param = {
                        "method":"create",
                        "param":{
                            "type":1,
                            "vlan_id": vid
                        }
                    }
                    this.$http.post('/switch_vlan',post_param).then(res=>{
                        // do sth
                        if(res.data.code == 1){
                            this.getData();
                        }
                    }).catch(err=>{
                        // to do
                    })
                }
                this.create_vlan = false;
                this.new_vlan = '';
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
                var n = this.system.data.ponports;
                for(var i=0,len=arr.length;i<len;i++){
                    var m = arr[i];
                    if(m <= n){
                        results += n < 10 ? 'PON0'+ m + ',' : 'PON' + m +',';
                    }else{
                        results += (m-n) < 10 ? 'GE0' + (m - n) + ',' : 'GE' + ( m - n ) + ',';
                    }
                }
                return results.replace(/\,$/,'');
            }
        },
        watch: {
            search_id(){
                if(this.search_id === ''){
                    this.not_found_vlan = false;
                    this.getData();
                }
            }
        },
        computed: mapState(['lanMap','port_name','system','change_url'])
    }
</script>

<style scoped>
div.vlan-mgmt{
    margin: 10px 50px 20px 10px;
}
div>h2{
    float: left;
    font-size: 24px;
    font-weight: 600;
    color: #67AEF7;
    margin-right: 50px;
}
div.search{
    margin: 20px 10px;
    line-height: 40px;
}
div.search>div{
    margin-left: 50px;
}
div.search:after{
    content: "";
    display: table;
    clear: both;
}
input[type="text"]{
    border-radius: 3px;
    position: relative;
    top: 1px;
}
h2+div{
    margin:20px 0;
}
h2+div:after{
    content: "";
    display: table;
    clear: both;
}
div.add-vlan{
    margin-left: 50px;
}
p{
    font-size: 20px;
    font-weight: 600;
    color:#67AEF7;
}
li{
    word-wrap: break-word;
    border: 1px solid #ddd;
    border-top: none;
    font-size: 0;
}
li:first-child{
    border-top: 1px solid #ddd;
}
li>input{
    width: 30px;
}
li>span{
    display: inline-block;
    text-align: center;
    height: inherit;
    padding: 5px;
    vertical-align: middle;
    font-size: 16px;
}
li>a{
    margin: 5px;
}
/* li>span:nth-child(2){
    width: 9%;
}
li>span:nth-child(3),li>span:nth-child(4){
    width: 37%;
} */
li>span:first-child{
    width: 9%;
}
li>span:nth-child(2),li>span:nth-child(3){
    width: 32%;
}
a{
    display: inline-block;
    width: 100px;
    height: 30px;
    font-size: 16px;
    line-height: 30px;
    text-align: center;
    border-radius: 5px;
    background: #ddd;
    transition: all .1s linear;
    vertical-align: middle;
    margin: 0 5px;
}
a:active{
    border: 1px solid #67AEF7;
    background: #ccc;
}
span.vlan-cfg-title{
    width: 200px;
}
div.cover+div{
    width:850px;
    height:360px;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    background: #fff;
    z-index: 999;
    overflow: hidden;
}
div.modal-content{
    padding: 20px;
}
div.modal-title{
    margin: 20px 20px;
    font-size: 20px;
    color: #67aef7;
}
div.modal-body{
    margin: 0 20px;
}
div.modal-body>div>span:first-child{
    display: inline-block;
    width: 100px;
}
div.vlan-mode>h3{
    width: 100px;
    height: 30px;
    line-height: 30px;
    padding-left: 5px;
}
div.vlan-port>div{
    height: 30px;
    line-height: 30px;
}
div.vlan-mode:after{
    content: "";
    display: table;
    clear: both;
}
label{
    margin-right: 20px;
}
div.vlan-mode{
    margin: 20px 0;
}
div.vlan-mode>a{
    margin-left: 50px;
}
ul.pagination>li.disabled{
    /* pointer-events: none; */
    cursor: not-allowed;
    box-shadow: none;
    opacity: .65;
}
ul.pagination:after{
    content: "";
    display: table;
    clear: both;
}
ul.pagination{
    margin: 10px;
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
ul>li.actived{
    color: #67aef7;
    border-color: #67aef7;
}
li.paginations:after{
    content: "";
    display: table;
    clear: both;
}
</style>