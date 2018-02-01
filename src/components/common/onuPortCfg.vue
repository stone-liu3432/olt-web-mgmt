<template>
    <div>
        <div class="onu-port">
            <h2>{{ lanMap['onu_port_cfg'] }}</h2>
            <div class="lf" v-if="port_name.pon">
                <span>{{ lanMap['port_id'] }}</span>
                <select v-model="portid">
                    <option :value="item.id" v-for="(item,key) in port_name.pon" :key="key">{{ item.name }}</option>
                </select>
            </div>
            <div class="lf" v-if="onu_list.data">
                <span>{{ lanMap['onu_id'] }}</span>
                <select v-model="onuid">
                    <option :value="item" v-for="(item,index) in onu_list.data" :key="index">{{ 'ONU'+ onu_list.port_id + '/' + item }}</option>
                </select>
            </div>
            <div v-else class="no-data lf">{{ lanMap['no_onu_info'] }}</div>
        </div>
        <hr>
        <div class="onu-port-info" v-if="onu_port_info.data && port_name.pon">
            <div>
                <h3 class="lf">{{ 'ONU' + port_name.pon[portid].id + '/' + onuid + ' ' + lanMap['port_info'] }}</h3>
                <div class="lf">
                    <a href="javascript:;" @click="open_dialog_basicCfg">ONU端口基本配置</a>
                </div>
            </div>
            <div>
                <span v-for="(item,index) in onu_port_info.data[0]" :key="index">{{ index }}</span>
            </div>
            <div v-for="(item,key) in onu_port_info.data" :key="key">
                <span v-for="(_item,_key) in item" :key="_key">{{ _item }}</span>
            </div>
        </div>
        <div class="onu-vlan-info" v-if="onu_vlan_info.data && port_name.pon">
            <div>
                <h3 class="lf">{{ 'ONU' + port_name.pon[portid].id + '/' + onuid + ' ' + '端口VLAN' }}</h3>
                <div class="lf">
                    <a href="javascript:;" @click="open_dialog_vlanCfg">ONU端口VLAN模式配置</a>
                    <!-- <a href="javascript:;" @click="open_dialog_trunk">ONU端口trunk设置</a> -->
                </div>
            </div>
            <div>
                <span v-for="(item,key) in onu_vlan_info.data[0]" :key="key" v-if="key !== 'vlan_list'">{{ key }}</span>
                <span v-for="(item,index) in onu_vlan_info.data[0].vlan_list" :key="index" v-if="onu_vlan_info.data[0].vlan_list">{{ index }}</span>
            </div>
            <div v-for="(item,index) in onu_vlan_info.data" :key="index">
                <span v-for="(_item,_key) in item" :key="_key" v-if="_key !== 'vlan_list'">{{ _item }}</span>
                <span v-for="(_item,_key) in item.vlan_list" :key="_key" v-if="item.vlan_list">{{ _item }}</span>
            </div>
        </div>
        <div class="modal-dialog" v-if="onu_vlan_mode">
            <div class="cover"></div>
            <div class="dialog-content">
                <div>
                    <h3 class="lf">ONU端口VLAN模式配置</h3>
                    <div class="rt"></div>
                </div>
                <div>
                    <span>ONU端口号</span>
                    <select v-model="onu_vlan_item.op_id">
                        <option :value="item.op_id" v-for="(item,index) in onu_vlan_info.data" :key="index">{{ item.op_id }}</option>
                    </select>
                </div>
                <div>
                    <span>op_vlan_mode</span>
                    <select v-model.number="onu_vlan_item.op_vlan_mode">
                        <option value="0">transparent</option>
                        <option value="1">tag</option>
                        <option value="2">translate</option>
                        <option value="3">aggregation</option>
                        <option value="4">trunk</option>
                    </select>
                </div>
                <div>
                    <span>def_vlan_id</span>
                    <input type="text" v-model.number="onu_vlan_item.def_vlan_id" placeholder="1-4094">
                </div>
                <div>
                    <span>def_vlan_pri</span>
                    <input type="text" v-model.number="onu_vlan_item.def_vlan_pri" placeholder="0-7">
                </div>
                <div>
                    <a href="javascript:;" @click="hanlde_onu_vlanCfg(true)">{{ lanMap['apply'] }}</a>
                    <a href="javascript:;" @click="hanlde_onu_vlanCfg(false)">{{ lanMap['cancel'] }}</a>
                </div>
                <b class="close" @click="hanlde_onu_vlanCfg(false)"></b>
            </div>
        </div>
        <div class="modal-dialog" v-if="onu_port_cfg">
            <div class="cover"></div>
            <div class="dialog-body">
                <div>
                    <h3 class="lf">ONU端口基本配置</h3>
                    <!-- 提示信息，鼠标移入显示，离开隐藏 -->
                    <div class="rt tool-tips">
                        <i></i>
                        <div>
                            <p>rl_cir</p>
                            <p>{{ lanMap['range'] }}: 1-100000</p>
                            <hr>
                            <p>rl_pir</p>
                            <p>{{ lanMap['range'] }}: 1-100000</p>
                            <hr>
                            <p>bandwidth</p>
                            <p>{{ lanMap['range'] }}: 1-100000</p>
                        </div>
                    </div>
                </div>
                <div>
                    <span>ONU端口号</span>
                    <select v-model.number="onu_port_item.op_id">
                        <option :value="item.op_id" v-for="(item,index) in onu_port_info.data" :key="index">{{ item.op_id }}</option>
                    </select>
                </div>
                <div v-for="(item,key) in onu_port_item" :key="key" v-if="key !== 'op_id'">
                    <span>{{ key }}</span>
                    <select v-if="key !== 'rl_cir' && key !== 'rl_pir' && key !== 'bandwidth'" v-model.number="onu_port_item[key]">
                        <option value="0">Disable</option>
                        <option value="1">Enable</option>
                    </select>
                    <input type="text" v-if="key === 'rl_cir' || key === 'rl_pir' || key === 'bandwidth'" v-model.number="onu_port_item[key]">
                    <span v-if="key === 'rl_cir' || key === 'rl_pir' || key === 'bandwidth'">Kbps</span>
                </div>
                <div>
                    <a href="javascript:;" @click="handle_onu_basicCfg(true)">{{ lanMap['apply'] }}</a>
                    <a href="javascript:;" @click="handle_onu_basicCfg(false)">{{ lanMap['cancel'] }}</a>
                </div>
                <b class="close" @click="handle_onu_basicCfg(false)"></b>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
    export default {
        name: 'onuPortCfg',
        computed: mapState(['port_name','lanMap']),
        data(){
            return {
                portid: 0,
                onuid: 0,
                //  onu端口ID
                op_id: 0,
                //  当前PON口下ONU列表
                onu_list: {},
                //  模态框显示/隐藏 *3
                onu_port_cfg: false,
                onu_vlan_mode: false,
                onu_vlan_trunk: false,
                //  缓存数据，用于提交时比较变化
                cache_data: {},
                //  ONU下的所有端口列表
                onu_port_info: {
                    "code":1,	
                    "message":"success",
                    "data":[{
                        "op_id": 1,
                        "autoneg": 1,
                        "flowctrl": 1,
                        "loopdetect": 1,
                        "enable": 1,
                        "rlds_opt": 1,
                        "rl_cir": 1,
                        "rl_pir" :1,
                        "rlus_opt": 1,
                        "bandwidth": 1
                    }]
                },
                //  ONU下某个特定的端口的基本信息
                onu_port_item: {
                    "op_id": 1,
                    "autoneg": 1,
                    "flowctrl": 1,
                    "loopdetect": 1,
                    "enable": 1,
                    "rlds_opt": 1,
                    "rl_cir": 1,
                    "rl_pir" : 1,
                    "rlus_opt": 1,
                    "bandwidth": 1
                },
                //  ONU VLAN信息
                onu_vlan_info: {
                    "code":1,
                    "msg":"success",
                    "data":[{
                        "op_id": 1,
                        "op_vlan_mode": 2,
                        "def_vlan_id": 1,
                        "def_vlan_pri": 0,
                        "vlan_list": {
                            "old_vlan_id": 11,
                            "new_vlan_id": 22,
                            "new_vlan_pri": 1
                        }
                    }]
                },
                // ONU下某个特定的端口VLAN
                onu_vlan_item: {
                    "op_id": 1,
                    "op_vlan_mode": 2,
                    "def_vlan_id": 1,
                    "def_vlan_pri": 0,
                    "vlan_list": {
                        "old_vlan_id": 11,
                        "new_vlan_id": 22,
                        "new_vlan_pri": 1
                    }
                }
            }
        },
        created(){
            this.portid = this.port_name.pon['1'].id;
        },
        methods: {
            //  打开ONU基本配置模态框
            open_dialog_basicCfg(){
                this.onu_port_cfg = true;
                //  缓存数据，提交时比对数据有无变化，若有变化添加 flags
                this.onu_port_item.op_id = this.onu_port_info.data[0].op_id;
            },
            //  确认/关闭模态框时的操作
            handle_onu_basicCfg(bool){
                if(bool){
                    //  输入验证待添加
                    var flags = 0;
                    if(this.cache_data.autoneg !== this.onu_port_item.autoneg){
                        flags += 1;
                    }
                    if(this.cache_data.flowctrl !== this.onu_port_item.flowctrl){
                        flags += 2;
                    }
                    if(this.cache_data.loopdetect !== this.onu_port_item.loopdetect){
                        flags += 4;
                    }
                    if(this.cache_data.enable !== this.onu_port_item.enable){
                        flags += 8;
                    }
                    if(this.cache_data.rlds_opt !== this.onu_port_item.rlds_opt ||
                        this.cache_data.rl_cir !== this.onu_port_item.rl_cir ||
                        this.cache_data.rl_pir !== this.onu_port_item.rl_pir ||
                        this.cache_data.rlus_opt !== this.onu_port_item.rlus_opt ||
                        this.cache_data.bandwidth !== this.onu_port_item.bandwidth
                    ){
                        flags += 16;
                    }
                    if(flags === 0){
                        this.$message({
                            type: 'info',
                            text: this.lanMap['modify_tips']
                        })
                        return
                    }
                    var post_params = {
                        "method":"set",
                        "param":{
                            "port_id": this.portid,
                            "onu_id": this.onuid,
                            "op_id": this.onu_port_item.op_id,
                            "flags": flags,
                            "autoneg": this.onu_port_item.autoneg,
                            "flowctrl": this.onu_port_item.flowctrl,
                            "loopdetect": this.onu_port_item.loopdetect,
                            "enable": this.onu_port_item.enable,
                            "rlds_opt": this.onu_port_item.rlds_opt,
                            "rl_cir": this.onu_port_item.rl_cir,
                            "rl_pir": this.onu_port_item.rl_pir,
                            "rlus_opt": this.onu_port_item.rlus_opt,
                            "bandwidth": this.onu_port_item.bandwidth
                        }
                    }
                    this.$http.post('/onumgmt?form=port_cfg',post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['setting_ok']
                            })
                            this.getOnuInfo();
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
                this.onu_port_cfg = false;
                this.onu_port_item = {};
                this.cache_data = {};
            },
            //  打开ONU VLAN模式配置模态框
            open_dialog_vlanCfg(){
                this.onu_vlan_mode = true;
                //  缓存数据，提交时比对数据有无变化，若有变化添加 flags
                this.onu_vlan_item.op_id = this.onu_vlan_info.data[0].op_id;
            },
            hanlde_onu_vlanCfg(bool){
                if(bool){
                    if(this.onu_vlan_item.def_vlan_id < 1 || this.onu_vlan_item.def_vlan_id > 4094 || isNaN(this.onu_vlan_item.def_vlan_id)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['vlanid_range_hit']
                        })
                        return
                    }
                    if(this.onu_vlan_item.def_vlan_pri < 0 || this.onu_vlan_item.def_vlan_pri > 7 || isNaN(this.onu_vlan_item.def_vlan_pri)){
                        this.$message({
                            type: 'error',
                            text: 'VLAN优先级参数不正确'
                        })
                        return
                    }
                    if(this.cache_data.def_vlan_id === this.onu_vlan_item.def_vlan_id && 
                    this.cache_data.def_vlan_pri === this.onu_vlan_item.def_vlan_pri && 
                    this.cache_data.op_vlan_mode === this.onu_vlan_item.op_vlan_mode){
                        this.$message({
                            type: 'info',
                            text: this.lanMap['modify_tips']
                        })
                        return
                    }
                    var post_params = {
                        "method":"set",
                        "param":{
                            "port_id": this.portid,
                            "onu_id": this.onuid,
                            "op_id": this.onu_vlan_item.op_id,
                            "op_vlan_mode": this.onu_vlan_item.op_vlan_mode,
                            "def_vlan_id": this.onu_vlan_item.def_vlan_id,
                            "def_vlan_pri": this.onu_vlan_item.def_vlan_pri
                        }
                    }
                    this.$http.post('/onumgmt?form=port_vlan',post_params).then(res=>{
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
                this.onu_vlan_mode = false;
                this.onu_vlan_item = {};
                this.cache_data = {};
            },
            //  打开ONU trunk配置模态框
            open_dialog_trunk(){
                this.onu_vlan_trunk = true;
            },
            handle_onu_trunkCfg(bool){
                if(bool){
                    // to do
                }
                this.onu_vlan_trunk = false;
            },
            getOnuInfo(){
                this.$http.get('/onumgmt?form=port_cfg&port_id='+this.portid+'&onu_id=' + this.onuid).then(res=>{
                    if(res.data.code === 1){
                        this.onu_port_info = res.data;
                        this.op_id = this.onu_port_info.data[0].op_id;
                    }else{
                        this.onu_port_info = {};
                    }
                }).catch(err=>{
                    // to do
                })
            },
            getOnuVlan(){
                this.$http.get('/onumgmt?form=port_vlan&port_id='+ this.portid +'&onu_id=' + this.onuid).then(res=>{
                    if(res.data.code === 1){
                        this.onu_vlan_info = res.data;
                    }else{
                        this.onu_vlan_info = {}
                    }
                }).catch(err=>{
                    // to do
                })
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
                return result
            }
        },
        watch: {
            // portid(){
            //     var _onuid = this.onuid;
            //     this.$http.get('/onu_allow_list?form=resource&port_id='+this.portid).then(res=>{
            //         if(res.data.code === 1){
            //             var _onu_list = this.analysis(res.data.data.resource);
            //             if(!_onu_list){
            //                 this.onu_list = {};
            //                 return
            //             }
            //             this.onu_list = {
            //                 port_id: res.data.data.port_id,
            //                 data: _onu_list
            //             }
            //             this.onuid = this.onu_list.data[0];
            //             if(_onuid === this.onuid){
            //                 this.getOnuInfo();
            //                 this.getOnuVlan();
            //             }
            //         }else{
            //             this.onu_list = {};
            //         }
            //     }).catch(err=>{
            //         // to do
            //     })
            // },
            // onuid(){
            //     this.getOnuInfo();
            //     this.getOnuVlan();
            // },
            'onu_port_item.op_id'(){
                for(var key in this.onu_port_info.data){
                    if(this.onu_port_info.data[key].op_id === this.onu_port_item.op_id){
                        this.onu_port_item = this.onu_port_info.data[key];
                    }
                }
                //  缓存数据，提交时比对数据有无变化，若有变化添加 flags
                for(var key in this.onu_port_item){
                    this.cache_data[key] = this.onu_port_item[key];
                }
            },
            'onu_vlan_item.op_id'(){
                for(var key in this.onu_vlan_info.data){
                    if(this.onu_vlan_info.data[key].op_id === this.onu_vlan_item.op_id){
                        this.onu_vlan_item = this.onu_vlan_info.data[key];
                    }
                }
                for(var key in this.onu_vlan_item){
                    this.cache_data[key] = this.onu_vlan_item[key];
                }
            }
        }
    }
</script>

<style scoped lang="less">
div.no-data{
    color: red;
    margin-left: 50px;
    height: 30px;
    line-height: 30px;
}
a{
    display: inline-block;
    width: 180px;
    height: 28px;
    text-align: center;
    line-height: 30px;
    border-radius: 5px;
    background: #ddd;
    vertical-align: middle;
    color: #333;
    border: 1px solid transparent;
    margin-left: 20px;
    &:active{
        border: 1px solid #67aef7;
    }
}
div.onu-port{
    padding:20px 0 20px 30px;
    &:after{
        content: "";
        display: table;
        clear: both;
    }
    >h2{
        float: left;
        width: 200px;
        font-size: 20px;
        font-weight: 600;
        color: 	#67AEF7;
    }
    >div{
        >span{
            padding: 0 30px;
        }
        >select{
            width: 120px;
            height: 30px;
            text-indent: 5px;
            font-size: 16px;
            margin-left: 40px;
        }
    }
}
div.onu-port-info{
    >div{
        height: 36px;
        line-height: 36px;
        &:first-child{
            margin: 20px;
            >div{
                margin-left: 30px;
                vertical-align: middle;
            }
        }
        &:last-child>span{
            border-top: none;
        }
        >h3{
            font-size: 18px;
            color: #67aef7;
            font-weight: 500;
        }
        >span{
            display: inline-block;
            vertical-align: top;
            width: 9.8%;
            text-align: center;
            border: 1px solid #ccc;
            border-right: none;
            &:last-child{
                border-right: 1px solid #ccc;
            }
        }
    }
}
div.onu-vlan-info{
    >div{
        height: 36px;
        line-height: 36px;
        font-size: 0;
        &:first-child{
            margin: 20px;
            >div{
                margin-left: 30px;
                vertical-align: middle;
            }
        }
        a{
            font-size: 16px;
        }
        &:last-child>span{
            border-top: none;
        }
        >h3{
            font-size: 18px;
            color: #67aef7;
            font-weight: 500;
        }
        >span{
            display: inline-block;
            vertical-align: top;
            width: 14%;
            text-align: center;
            border: 1px solid #ccc;
            border-right: none;
            font-size: 16px;
            &:last-child{
                border-right: 1px solid #ccc;
            }
        }
    }
}
div.dialog-body{
    width: 500px;
    height: 500px;
    background: #fff;
    border-radius: 10px;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    >div{
        height: 36px;
        line-height: 36px;
        &:first-child{
            height: 60px;
            >h3{
                line-height: 60px;
                margin-left: 30px;
                font-size: 18px;
                font-weight: 500;
                color: #67aef7;
            }
        }
        >span:first-child{
            display: inline-block;
            width: 150px;
            height: 30px;
            text-align: right;
            padding-right: 20px;
        }
        >span:last-child{
            font-size: 14px;
            color: #333;
            margin-left: 10px;
        }
        select{
            width: 180px;
            height: 30px;
            font-size: 16px;
        }
        a{
            width: 120px;
            margin: 25px 0 0 85px;
            color: #000;
        }
    }
}
div.tool-tips{
    margin-right: 70px;
    line-height: 60px;
    vertical-align: middle;
    position: relative;
    &:hover>div{
        display: block;
    }
    i{
        display: inline-block;
        width: 32px;
        height: 32px;
        vertical-align: middle;
        cursor: pointer;
        background: url('../../assets/tips.png') no-repeat;
    }
    >div{
        display: none;
        width: 200px;
        height: 160px;
        padding: 8px;
        background: #ddd;
        border-radius: 10px;
        position: absolute;
        left: 28px;
        top: 38px;
        >p{
            height: 20px;
            line-height: 20px;
            font-size: 14px;
            color: #333;
            margin-left: 10px;
        }
    }
}
div.dialog-content{
    width: 500px;
    height: 290px;
    background: #fff;
    border-radius: 10px;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    >div:first-child{
        padding-left: 30px;
        height: 60px;
        line-height: 60px;
        >h3{
            line-height: 60px;
            font-size: 18px;
            font-weight: 500;
            color: #67aef7;
        }
    }
    >div{
        height: 36px;
        line-height: 36px;
        >span:first-child{
            display: inline-block;
            width: 150px;
            text-align: right;
            padding-right: 20px;
        }
        select{
            width: 150px;
            height: 30px;
            font-size: 16px;
            text-indent: 10px;
        }
        input[type="text"]{
            width: 150px;
        }
        a{
            width: 120px;
            margin: 25px 0 0 85px;
            color: #000;
        }
    }
}
</style>
