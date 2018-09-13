<template>
    <div>
        <div class="onu-multicast">
            <h2>{{ lanMap['onu_multicast'] }}</h2>
            <div class="lf" v-if="port_name.pon">
                <span>{{ lanMap['port_id'] }}</span>
                <select v-model.number="portid">
                    <option :value="item.id" v-for="(item,key) in port_name.pon" :key="key">{{ item.name }}</option>
                </select>
            </div>
            <div class="lf" v-if="onu_list.data">
                <span>{{ lanMap['onu_id'] }}</span>
                <select v-model.number="onuid">
                    <option :value="item" v-for="(item,index) in onu_list.data" :key="index">{{ 'ONU'+ onu_list.port_id + '/' + item }}</option>
                </select>
            </div>
            <div v-else class="no-data lf">{{ lanMap['no_onu_info'] }}</div>
        </div>
        <hr>
        <tabBar :tab="['onu_multicast','mvlan']" @togglePage="select_tab" v-if="onu_list.data"></tabBar>
        <div class="multicast-detail" v-if="show_page === 'onu_multicast' && onu_list.data">
            <h3>{{ lanMap['onu_multicast'] + lanMap['info'] }}</h3>
            <div v-if="mc_cfg.data">
                <span>{{ lanMap['mc_mode'] }}</span>
                <span>{{ mc_cfg.data.mc_mode ? 'ctc' : 'igmp-snooping' }}</span>
                <a href="javascript:void(0);" @click="open_mc_mode">{{ lanMap['config'] }}</a>
            </div>
            <div v-if="mc_cfg.data">
                <span>{{ lanMap['fast_leave'] }}</span>
                <span>{{ mc_cfg.data.fast_leave === 2 ? lanMap['enable'] : lanMap['disable'] }}</span>
                <a href="javascript:void(0);" @click="open_fast_leave">{{ lanMap['config'] }}</a>
            </div>
            <!-- <div class="op-multicast">
                <h3>ONU {{ lanMap['multicast'] }}</h3>
                <div>
                    <span>{{ lanMap['op_id'] }}</span>
                    <span>{{ lanMap['mc_mac'] }}</span>
                    <span>{{ lanMap['mvlan'] }}</span>
                </div>
                <div v-for="(item,index) in mc_table.data" :key="index" v-if="mc_table.data && mc_table.data.length > 0">
                    <span>{{ item.op_id }}</span>
                    <span>{{ item.mc_mac }}</span>
                    <span>{{ item.mvlan }}</span>
                </div>
            </div> -->
        </div>
        <onuPortVlan v-if="show_page === 'mvlan'" :portid="portid" :onuid="onuid" ref="opvlan"></onuPortVlan>
        <div class="modal-dialog" v-if="modal_index === 1 || modal_index === 2">
            <div class="cover"></div>
            <div class="onu-multi-cfg">
                <h4 v-if="modal_index === 1">{{ lanMap['onu_multicast'] + ' ' + lanMap['config'] }}</h4>
                <h4 v-if="modal_index === 2">{{ lanMap['fast_leave'] + ' ' + lanMap['config'] }}</h4>
                <div v-if="modal_index === 1">
                    <span>{{ lanMap['mc_mode'] }}</span>
                    <select v-model.number="mc_mode">
                        <option value="0">igmp-snooping</option>
                        <option value="1">ctc</option>
                    </select>
                </div>
                <div v-if="modal_index === 2">
                    <span>{{ lanMap['fast_leave'] }}</span>
                    <select v-model.number="fast_leave">
                        <option value="2">{{ lanMap['enable'] }}</option>
                        <option value="1">{{ lanMap['disable'] }}</option>
                    </select>
                </div>
                <div>
                    <a href="javascript:void(0);" v-if="modal_index === 1" @click="submit_mc_mode">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" v-if="modal_index === 2" @click="submit_fast_leave">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" @click="close_set_modal">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="close_set_modal"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import onuPortVlan from '@/components/common/pon/onuPortVlan'
export default {
    name: 'onuMulticast',
    computed: mapState(['lanMap','port_name','change_url']),
    components: { onuPortVlan },
    data(){
        return {
            portid: 0,
            onuid: 0,
            onu_list: {},
            mc_cfg: {},
            mc_table: {},
            show_page: 'onu_multicast',
            modal_index: 0,                 //  1 -> mc_mode   2 -> fast leave
            mc_mode: 0,
            fast_leave: 0
        }
    },
    created(){
        var pid = sessionStorage.getItem('pid');
        this.portid = pid || 1;
    },
    methods: {
        select_tab(page){
            this.show_page = page;
        },
        get_mc_config(){
            this.$http.get('/onumgmt?form=mc_config',{ params: { port_id: this.portid,onu_id: this.onuid } }).then(res=>{
                if(res.data.code === 1){
                    this.mc_cfg = res.data;
                }else{
                    this.mc_cfg = {};
                }
            }).catch(err=>{
                // to do
            })
        },
        get_mc_table(){
            this.$http.get('/onumgmt?form=mc_table',{ params: { port_id: this.portid,onu_id: this.onuid } }).then(res=>{
                if(res.data.code === 1){
                    this.mc_table = res.data;
                }else{
                    this.mc_table = {};
                }
            }).catch(err=>{
                // to do
            })
        },
        open_mc_mode(){
            this.modal_index = 1;
            this.mc_mode = this.mc_cfg.data.mc_mode;
        },
        submit_mc_mode(){
            if(this.mc_mode === this.mc_cfg.data.mc_mode){
                this.$message({
                    type: 'info',
                    text: this.lanMap['modify_tips']
                })
                return
            }
            var post_param = {
                "method":"set",
                "param":{
                    "port_id": Number(this.portid),
                    "onu_id": Number(this.onuid),
                    "mc_mode": this.mc_mode
                }
            }
            this.$http.post('/onumgmt?form=mc_mode',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['st_success']
                    })
                    this.get_mc_config();
                }else if(res.data.code > 1){
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_set_modal();
        },
        open_fast_leave(){
            this.modal_index = 2;
            this.fast_leave = this.mc_cfg.data.fast_leave;
        },
        submit_fast_leave(){
            if(this.fast_leave === this.mc_cfg.data.fast_leave){
                this.$message({
                    type: 'info',
                    text: this.lanMap['modify_tips']
                })
                return
            }
            var post_param = {
                "method":"set",
                "param":{
                    "port_id": Number(this.portid),
                    "onu_id": Number(this.onuid),
                    "fast_leave": this.fast_leave
                }
            }
            this.$http.post('/onumgmt?form=mc_fast_leave',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['st_success']
                    })
                    this.get_mc_config();
                }else if(res.data.code > 1){
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_set_modal();
        },
        close_set_modal(){
            this.modal_index = 0;
        },
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
        portid(){
            sessionStorage.setItem('pid',Number(this.portid));
            this.$http.get('/onu_allow_list?form=resource&port_id='+this.portid).then(res=>{
                if(res.data.code === 1){
                    var _onu_list = this.analysis(res.data.data.resource);
                    if(!_onu_list){
                        this.onu_list = {};
                        return
                    }
                    this.onu_list = {
                        port_id: res.data.data.port_id,
                        data: _onu_list
                    }
                    var oid = sessionStorage.getItem('oid');
                    this.onuid = Number(oid);
                    if(!oid || _onu_list.indexOf(Number(oid)) === -1) {
                        this.onuid = Number(this.onu_list.data[0]);
                        //  onuid 变化时，会触发watcher，避免重复调用
                        return
                    };
                    this.get_mc_config();
                    //this.get_mc_table();
                    //  portid 变化， onuid 无变化时调用
                    if(this.show_page === 'mvlan'){
                        this.$refs.opvlan.getData();
                    }
                }else{
                    this.onu_list = {};
                }
            }).catch(err=>{
                // to do
            })
        },
        onuid(){
            if(!this.onuid) return
            sessionStorage.setItem('oid',Number(this.onuid));
            this.get_mc_config();
            //this.get_mc_table();
        }
    }
}
</script>

<style lang="less" scoped>
div.no-data{
    color: red;
    margin-left: 50px;
    height: 30px;
    line-height: 30px;
}
div.onu-multicast{
    padding:20px 0 20px 0;
    &:after{
        content: "";
        display: table;
        clear: both;
    }
    >h2{
        float: left;
        width: 200px;
        font-size: 24px;
        font-weight: 600;
        color: 	#67AEF7;
    }
    >div{
        >span{
            padding: 0 30px;
            border-right: 1px solid #ccc;
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
div.onu-multivlan-tab{
    margin-top: 30px !important;
    border-bottom: 3px solid #67aef7;
    padding-left: 10px;
    &::after{
        content: '';
        display: table;
        clear: both;
    }
    >div{
        float: left;
        margin-left: 5px;
        border: 1px solid #67aef7;
        margin-bottom: -1px;
        border-radius: 3px 3px 0 0;
        cursor: pointer;
        padding: 0 30px;
        text-align: center;
        height: 30px;
        line-height: 30px;
    }
    .actived{
        border: 1px solid #67aef7;
        border-radius: 3px 3px 0 0;
        color: #fff;
        background: #67aef7;
        font-weight: 500;
    }
}
div.multicast-detail{
    margin: 0 0 0 20px;
    >div{
        height: 30px;
        line-height: 30px;
        >span:first-child{
            width: 200px;
        }
        span{
            display: inline-block;
            width: 150px;
            vertical-align: middle;
        }
        a{
            height: 26px;
            line-height: 26px;
        }
    }
    h3{
        font-size: 18px;
        font-weight: 600;
        color: #67aef7;
    }
    div.op-multicast{
        margin-top: 30px;
        height: auto;
        div{
            height: 30px;
            line-height: 30px;
            span{
                display: inline-block;
                width: 20%;
                vertical-align: middle;
            }
        }
    }
}
div.onu-multi-cfg{
    height: 170px;
    h4{
        height: 50px;
        line-height: 50px;
        font-size: 20px;
        color: #67aef6;
        margin: 0 0 0 30px;
    }
    div{
        height: 30px;
        margin: 5px 0;
        span:first-child{
            display: inline-block;
            width: 200px;
            text-align: right;
            margin-right: 20px;
        }
    }
    select{
        width: 150px;
    }
    a{
        margin: 20px 0 0 96px;
    }
    div.close{
        height: 60px;
        margin: 0;
    }
}
</style>
