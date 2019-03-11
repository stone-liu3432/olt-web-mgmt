<template>
    <div class="vlan-mgmt">
        <div>
            <h2>{{ lanMap['vlan_cfg'] }}</h2>
        </div>
        <div class="btn-group-vlan">
            <a href="javascript:void(0);" @click="createVlan()">{{ lanMap['create'] }}VLAN</a>
            <!-- <span>{{ lanMap['tips_create_vlan'] }}</span> -->
            <a href="javascript:void(0);" @click="open_batch_del">{{ lanMap['delete'] }} VLAN</a>
            <a href="javascript:void(0);" @click="createVlan(1)">{{ lanMap['batch_cfg_vlan'] }}</a>
        </div>
        <div class="search">
            <p class="lf">{{  lanMap['vlan_list'] }}</p>
            <div class="lf">
                <input type="text" placeholder="VLAN ID" v-model.number="search_id">
                <!-- <i class="icon-search" @click="searchVlan"></i> -->
                <i class="icon-search"></i>
            </div>
        </div>
        <div v-if="not_found_vlan">
            <p>{{ lanMap['not_find_vlan'] }}</p>
        </div>
        <ul v-if="vlan_tab[0]">
            <li>
                <!-- <input type="radio" name="checkedVlan" style="visibility:hidden"> -->
                <span v-for="(item,key) in vlan_tab[0]" :key="key">{{ lanMap[key] }}</span>
                <span class="vlan-cfg-title">{{ lanMap['config'] }}</span>
            </li>
            <li v-for="(item,index) in vlan_tab" :key="index">
                <!-- <input type="radio" v-model="vlanid" :value="item.vlan_id"> -->
                <span>{{ item.vlan_id }}</span>
                <span>{{ item.tagged_portlist | analysis(system.data.ponports,system.data.geports) || '—' }}</span>
                <span>{{ item.untagged_portlist | analysis(system.data.ponports,system.data.geports) || '—' }}</span>
                <span>{{ item.default_vlan_portlist | analysis(system.data.ponports,system.data.geports) || '—' }}</span>
                <a href="javascript:;"  @click="config_port(item.vlan_id)">{{ lanMap['config'] }}</a>
                <a href="javascript:;"  @click="deleteVlan(item.vlan_id)" v-if="item.vlan_id !== 1">{{ lanMap['delete'] }}</a>
            </li>
            <li v-if="vlan_list.data  && is_loadmore">
                <a href="javascript:;" @click="loadmore">{{ lanMap['loadmore'] }}</a>
            </li>
            <li v-if="pagination.page > 1" class="paginations">
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
            <div class="modal-content" :style="{ 'height': create_vlan ? '320px' : '285px' }">
                <h3 v-if="create_vlan && !batch_set_vlan">
                    {{ lanMap['create'] }}
                </h3>
                <h3 v-if="create_vlan && batch_set_vlan">
                    {{ lanMap['config'] }}
                </h3>
                <div class="modal-title">
                    <div v-if="!create_vlan" class="set-vlan">
                        <span>VLAN ID:</span>
                        <span>{{ vlanid }}</span>
                        <span class="def-vlan-tips">{{ lanMap['def_vlan_tips'] }}</span>
                    </div>
                    <div class="add-vlan" v-if="create_vlan">
                        <span>VLAN ID：</span>
                        <span>
                            <input v-focus type="text" placeholder="1-4094" 
                                v-model.number="vlanid_s" :style="{ 'border-color' : (vlanid_s != '' && (isNaN(vlanid_s) || vlanid_s > 4094 || vlanid_s < 1)) ? 'red' : '' }">
                             ~ 
                            <input type="text" placeholder="1-4094" 
                                v-model.number="vlanid_e" :style="{ 'border-color' : (vlanid_e != '' && (isNaN(vlanid_e) || vlanid_e > 4094 || vlanid_e < 1)) ? 'red' : '' }">
                            <span class="tips">
                                {{ lanMap['vlanid_range_hit'] }}
                            </span>
                        </span>
                    </div>
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
                                <span v-for="(item,key) in port_name.xge" :key="key" class="tagged" v-if="port_name.xge">
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
                                <span v-for="(item,key) in port_name.xge" :key="key" class="untagged" v-if="port_name.xge">
                                    <input type="radio" :name="item.id" :id="'untagged'+item.id" @click="changeState($event)" value="0">
                                    <label :for="'untagged'+item.id">{{ item.name }}</label>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="vlan-mode" v-if="!create_vlan">
                        <a href="javascript:void(0);" class="rt" @click="handle_cfg(false)">{{ lanMap['cancel'] }}</a>
                        <a href="javascript:void(0);" class="rt" @click="handle_cfg(true)">{{ lanMap['apply'] }}</a>
                    </div>
                    <div class="vlan-mode" v-if="create_vlan">
                        <a href="javascript:void(0);" class="rt" @click="handle_create(false)">{{ lanMap['cancel'] }}</a>
                        <a href="javascript:void(0);" class="rt" @click="handle_create(true)" v-if="!batch_set_vlan">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" class="rt" @click="set_vlan(0,vlanid_s,vlanid_e,false)" v-if="batch_set_vlan">{{ lanMap['apply'] }}</a>
                    </div>
                </div>
                <div class="close" @click="closeModal"></div>
            </div>
        </div>
        <div class="modal-dialog" v-if="batch_del_vlan">
            <div class="cover"></div>
            <div class="batch-delete">
                <div>
                    <h3>{{ lanMap['delete'] }} VLAN</h3>
                    <div>
                        <span>VLAN ID</span>
                        <input type="text" v-focus v-model.number="vlanid_s" placeholder="1-4094"
                          :style="{ 'border-color' : (vlanid_s != '' && (isNaN(vlanid_s) || vlanid_s > 4094 || vlanid_s < 1)) ? 'red' : '' }">
                         ~ 
                        <input type="text" v-model.number="vlanid_e" placeholder="1-4094"
                         :style="{ 'border-color' : (vlanid_e != '' && (isNaN(vlanid_e) || vlanid_e > 4094 || vlanid_e < 1)) ? 'red' : '' }">
                    </div>
                    <p>{{ lanMap['vlanid_range_hit'] }}</p>
                    <div>
                        <a href="javascript:void(0);" @click="submit_batch_del">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="close_batch_del">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="close_batch_del"></div>
            </div>
        </div>
        <confirm :tool-tips="lanMap['delete_vlan_hit']" @choose="result" v-if="userChoose"></confirm>
    </div>
</template>

<script>
import { mapState } from 'vuex'
    export default {
        name: 'vlanMgmt',
        data(){
            return {
                // 已有的 VLAN列表
                vlan_list: {},
                // 分页的数据 --> 显示到页面的数据
                vlan_tab: [],
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
                vlanid_s: '',
                vlanid_e: '',
                // 分页数据(懒加载)
                count: 0,
                //  是否提示创建VLAN成功的tips
                batch_set_vlan: false,
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
                // 添加/修改VLAN模态框隐藏显示
                modalDialog: false,
                batch_del_vlan: false,
                is_loadmore: false
            }
        },
        created(){
            this.getData();
        },
        methods: {
            getData(){
                // 请求url: /switch_vlan?count=0
                var url;
                if(this.change_url.beta === 'test'){
                    url = this.change_url.vlancfg;
                }else{
                    url = this.change_url.vlancfg + this.count;
                }
                this.$http.get(url).then(res=>{
                    if(res.data.code === 1){
                        if(!res.data.data) {
                            this.is_loadmore = false;
                            if(this.count === 0){
                                this.vlan_list = {};
                                this.vlan_tab = [];
                            }
                            return
                        }
                        if(res.data.data && res.data.data.length === 200){
                            this.is_loadmore = true;
                        }
                        if(res.data.data && res.data.data.length !== 200){
                            this.is_loadmore = false;
                        }
                        if(this.count === 0 && res.data.data){
                            this.vlan_list = res.data;
                        }else if(res.data.data){
                            var data = Object.assign([],this.vlan_list.data);
                            data = data.concat(res.data.data);
                            this.vlan_list = {
                                code: 1,
                                data: data
                            }
                        }
                        if(this.vlan_list.data){
                            var vlan_map = {};
                            for(var key in this.vlan_list.data){
                                vlan_map[this.vlan_list.data[key].vlan_id] = this.vlan_list.data[key];
                            }
                            this.vlan_map = vlan_map;
                        }
                        this.pagination.page = Math.ceil(this.vlan_list.data.length/this.pagination.display);
                        this.getPage();
                    }else{
                        this.vlan_list = {};
                        this.vlan_tab = [];
                    }
                }).catch(err=>{
                    // to do
                })
            },
            //  查找某一个vlan
            searchVlan(){
                if(!this.search_id){
                    this.$message({
                        type: 'error',
                        text: this.lanMap['vlanid_range_hit']
                    })
                    return
                }
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
                this.vlan_tab = [];
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
            createVlan(flag){
                this.modalDialog = true;
                this.create_vlan = true;
                this.vlanid = 0;
                if(flag){
                    this.batch_set_vlan = true;
                }else{
                    this.batch_set_vlan = false;
                }
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
                    var def_vlan = this.analysis(this.vlan_map[this.vlanid].default_vlan_portlist).split(',');
                    var port_all = document.querySelectorAll('div.vlan-port span input');
                    for(var n = 0,len = port_all.length; n < len; n++){
                        for(var m = 0, len1 = def_vlan.length;m < len1; m++){
                            if(port_all[n].nextElementSibling.innerText.replace(/\s/g,'') === def_vlan[m].replace(/\s/g,'')){
                                port_all[n].disabled = 'disabled';
                                port_all[n].style = 'cursor: not-allowed;';
                                port_all[n].nextElementSibling.style = 'cursor: not-allowed;';
                                port_all[n].style = 'cursor: not-allowed;';
                            }
                        }
                    }
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
            //  关闭创建/配置 VLAN 模态框
            closeModal(){
                this.create_vlan = false;
                this.modalDialog = false;
                this.batch_set_vlan = false;
            },
            //  模态框控件 => 删除VLAN
            result(bool){
                if(bool){
                    var post_param = {
                        "method":"destroy",
                        "param":{
                            "vlan_id": this.vlanid
                        }
                    }
                    this.$http.post('/switch_vlan',post_param).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: res.data.type,
                                text: this.lanMap['delete'] + this.lanMap['st_success']
                            })
                            this.vlan_list.data.forEach((item,index,arr)=>{
                                if(item.vlan_id === this.vlanid){
                                    arr.splice(index,1);
                                    if(this.search_id === ''){
                                        this.getPage();
                                        if(this.vlan_list.data && this.vlan_list.data.length > 0)
                                            this.pagination.page = Math.ceil(this.vlan_list.data.length/this.pagination.display);
                                        if(this.vlan_tab.length === 0 && this.vlan_list.data.length > 0){
                                            this.pagination.index--;
                                            this.getPage();
                                        }
                                    }else{
                                        this.vlan_tab.forEach((item,index,arr)=>{
                                            if(item.vlan_id === this.vlanid){
                                                arr.splice(index,1);
                                            }
                                        })
                                    }
                                }
                            })
                            this.vlanid = 0;
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
                    this.set_vlan(this.vlanid);
                }
                this.modalDialog = false;
            },
            //  配置VLAN ID 的端口
            set_vlan(vid,vid_s,vid_e,create_flag){
                var tagged = document.querySelectorAll('span.tagged>input');
                var untagged = document.querySelectorAll('span.untagged>input');
                var tag_str = '',untag_str = '',post_param,url;
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
                if(vid || (!!vid_s && vid_s === vid_e)){
                    post_param = {
                        "method":"set",
                        "param":{
                            "vlan_id": vid || vid_s,
                            "tagged_portlist": tag_str.replace(/\,$/,''),
                            "untagged_portlist": untag_str.replace(/\,$/,'')
                        }
                    }
                    url = '/switch_vlan';
                }else{
                    post_param = {
                        "method":"set",
                        "param":{
                         	"vlanid_s": vid_s > vid_e ? vid_e : vid_s,
                            "vlanid_e": vid_s > vid_e ? vid_s : vid_e,
                            "tagged_portlist": tag_str.replace(/\,$/,''),
                            "untagged_portlist": untag_str.replace(/\,$/,'')
                        }
                    }
                    url = '/switch_vlanlist';
                }
                this.$http.post(url,post_param).then(res=>{
                    if(res.data.code === 1){
                        if(!this.tip_flag && !create_flag){
                            this.$message({
                                type: res.data.type,
                                text: this.lanMap['setting_ok']
                            })
                        }
                        if(create_flag){
                            this.$message({
                                type: res.data.type,
                                text: this.lanMap['create_vlan_info']
                            })
                        }
                        this.count = 0;
                        this.pagination.index = 1;
                        this.getData();
                    }else if(res.data.code > 1){
                        this.$message({
                            type: res.data.type,
                            text: '(' + res.data.code + ') ' + res.data.message
                        })
                        if(res.data.type === 'warning'){
                            this.count = 0;
                            this.pagination.index = 1;
                            this.getData();
                        }
                    }
                    this.vlanid_s = '';
                    this.vlanid_e = '';
                    this.tip_flag = false;
                    this.closeModal();
                }).catch(err=>{
                    // to do
                })
            },
            //  添加VLAN时的动作，根据用户选择进行操作
            handle_create(bool){
                if(bool){
                    var vid_s = Number(this.vlanid_s);
                    var vid_e = Number(this.vlanid_e);
                    var tagged = document.querySelectorAll('span.tagged>input');
                    var untagged = document.querySelectorAll('span.untagged>input');
                    var tag_str = '',untag_str = '';
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
                    if(isNaN(vid_s) || vid_s > 4094 || vid_s < 1 || isNaN(vid_e) || vid_e > 4094 || vid_e < 1) {
                        this.$message({
                            type: 'error',
                            text: this.lanMap['vlanid_range_hit']
                        })
                        return
                    }
                    var post_param = {
                        "method":"create",
                        "param":{
                            "type": 1,
                         	"vlanid_s": vid_s > vid_e ? vid_e : vid_s,
                            "vlanid_e": vid_s > vid_e ? vid_s : vid_e
                        }
                    }
                    this.$http.post('/switch_vlanlist',post_param).then(res=>{
                        if(res.data.code === 1){
                            if(tag_str || untag_str){
                                this.set_vlan(0,vid_s,vid_e,true);
                            }else{
                                this.$message({
                                    type: res.data.type,
                                    text: this.lanMap['create_vlan_info']
                                })
                                this.count = 0;
                                this.pagination.index = 1;
                                this.getData();
                                this.vlanid_s = '';
                                this.vlanid_e = '';
                                this.tip_flag = false;
                                this.closeModal();
                            }
                        }else if(res.data.code > 1){
                            this.$message({
                                type: res.data.type,
                                text: '(' + res.data.code + ') ' + res.data.message
                            })
                        }
                    }).catch(err=>{
                        // to do
                    })
                }else{
                    this.create_vlan = false;
                    this.modalDialog = false;
                    this.vlanid_s = '';
                    this.vlanid_e = '';
                    this.tip_flag = false;
                }
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
            },
            //  打开范围删除vlan模态框
            open_batch_del(){
                this.batch_del_vlan = true;
                this.vlanid_s = '';
                this.vlanid_e = '';
            },
            //  关闭范围删除模态框
            close_batch_del(){
                this.batch_del_vlan = false;
                this.vlanid_s = '';
                this.vlanid_e = '';
            },
            //  范围删除提交按钮
            submit_batch_del(){
                var vid_s = Number(this.vlanid_s),vid_e = Number(this.vlanid_e);
                if(vid_s < 1 || vid_s > 4094 || isNaN(vid_s) || vid_e < 1 || vid_e > 4094 || isNaN(vid_e)){
                    this.$message({
                        type: 'error',
                        text: this.lanMap['vlanid_range_hit']
                    })
                    return
                }
                var post_param = {
                    "method":"destroy",
                    "param":{
                        "vlanid_s": vid_s > vid_e ? vid_e : vid_s,
                        "vlanid_e": vid_s > vid_e ? vid_s : vid_e,
                    }
                }
                this.$http.post('/switch_vlanlist',post_param).then(res=>{
                    if(res.data.code === 1){
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap['setting_ok']
                        })
                        this.count = 0;
                        this.pagination.index = 1;
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
                this.close_batch_del();
            }
        },
        watch: {
            search_id(){
                if(this.search_id === ''){
                    this.not_found_vlan = false;
                    this.count = 0;
                    this.pagination.index = 1;
                    this.getData();
                }else{
                    this.is_loadmore = false;
                    var list = this.vlan_list.data;
                    var tab = [];
                    this.pagination.page = 0;
                    list.forEach((item,index,arr)=>{
                        if(('' + item.vlan_id).indexOf('' + this.search_id) !== -1){
                            tab.push(item);
                        }
                    })
                    if(tab.length > 0){
                        this.not_found_vlan = false;
                        this.vlan_tab = tab;
                    }else{
                        this.not_found_vlan = true;
                        this.vlan_tab = [];
                    }
                }
            },
            vlan_tab(){
                if(this.search_id !== '' && this.vlan_tab.length === 0){
                    this.not_found_vlan = true;
                    return
                }
                if(!this.not_found_vlan && this.vlan_tab.length === 0 && this.vlan_list.data.length > 0){
                    this.pagination.index--;
                    this.pagination.page = Math.ceil(this.vlan_list.data.length/this.pagination.display);
                    this.getPage();
                }
            }
        },
        computed: mapState(['lanMap','port_name','system','change_url'])
    }
</script>

<style scoped lang="less">
div.vlan-mgmt{
    min-width: 1020px;
}
div.vlan-mgmt>div:nth-child(2){
    margin: 0 0 0 30px;
}
div+ul{
    >li:first-child{
        background: #67aef6;
    }
}
a+span{
    font-size: 14px;
    margin-left: 10px;
    color: #666;
}
div.btn-group-vlan{
    a{
        width: auto;
        padding: 0 10px;
    }
}
div>h2{
    font-size: 24px;
    font-weight: 600;
    color: #67AEF7;
    margin: 10px 0 20px 0;
}
div.search{
    margin: 20px 0;
    line-height: 40px;
}
div.search>div{
    margin-left: 50px;
    position: relative;
}
i.icon-search{
    display: inline-block;
    width: 32px;
    height: 32px;
    background: url('../../../assets/search.png');
    cursor: pointer;
    position: absolute;
    top: 6px;
    right: 3px;
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
p{
    font-size: 24px;
    font-weight: 600;
    color:#67AEF7;
}
div+ul{
    margin: 0 0 0 10px;
}
li{
    word-wrap: break-word;
    word-break: keep-all;
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
    padding: 5px;
    vertical-align: middle;
    font-size: 16px;
}
li>a{
    margin: 5px;
}
li>span:first-child{
    width: 9%;
}
li>span:nth-child(2),li>span:nth-child(3),li>span:nth-child(4){
    width: 21%;
}
a{
    width: 100px;
    margin: 0 5px;
    padding: 0;
}
span.vlan-cfg-title{
    width: 200px;
}
span.def-vlan-tips{
    margin-left: 20px;
    font-size: 15px;
    color: #67aef6;
}
div.cover+div{
    width:850px;
    height:300px;
    position: absolute;
    left:50%;
    top:50%;
    transform: translate(-50%,-50%); 
    margin: 0;
}
div.modal-content{
    padding: 20px;
    border-radius: 10px;
    >h3{
        font-size: 20px;
        color: #67aef6;
        font-weight: 600;
        margin-left: 10px;
    }
}
div.modal-title{
    margin: 10px 20px;
    >div.set-vlan{
        font-size: 20px;
        color: #67aef6;
        font-weight: 600;
    }
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
    &:last-child{
        width: 650px;
        height: 60px;
    }
}
div.vlan-mode:after{
    content: "";
    display: table;
    clear: both;
}
span.tagged,span.untagged{
    user-select: none;
    display: inline-block;
    width: 12%;
}
label{
    //margin-right: 18px;
    user-select: none;
}
div.vlan-mode{
    margin: 10px 0;
}
div.vlan-mode>a{
    margin-left: 50px;
}
ul.pagination>li.disabled{
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
span.tips{
    font-size: 14px;
    color: #67AEF7;
    margin-left: 20px;
}
div.add-vlan{
    input{
        width: 100px;
    }
}
div.cover+div.batch-delete{
    border-radius: 5px;
    height: 205px;
    width: 500px;
    h3{
        height: 60px;
        line-height: 50px;
        font-size: 20px;
        padding-left: 30px;
    }
    >div{
        >div{
            span{
                display: inline-block;
                width: 120px;
                text-align: center;
            }
            input{
                width: 120px;
            }
        }
    }
    div+p{
        font-size: 15px;
        color: #67aef6;
        text-align: center;
        font-weight: normal;
        height: 30px;
        line-height: 30px;
        margin-top: 10px;
    }
    a{
        margin: 15px 0 0 100px;
    }
}
</style>