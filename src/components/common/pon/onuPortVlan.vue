<template>
    <div class="onu-port-vlan">
        <h4>ONU端口组播</h4>
        <div class="opv-item">
            <span>port id</span>
            <select v-model.number="opid">
                <option :value="item.op_id" v-for="(item,index) in mc_eth_config.data">{{ item.op_id }}</option>
            </select>
        </div>
        <div class="opv-item">
            <span>{{ lanMap['group_num_max'] }}</span>
            <span>{{ mc_eth_cfg_port.group_num_max }}</span>
            <a href="javascript:void(0);" @click="open_modal(1)">{{ lanMap['config'] }}</a>
        </div>
        <div class="opv-item">
            <span>{{ lanMap['tag_mode'] }}</span>
            <span>{{ mc_eth_cfg_port.tag_mode }}</span>
            <a href="javascript:void(0);" @click="open_modal(2)">{{ lanMap['config'] }}</a>
        </div>
        <div class="opv-item">
            <span>{{ lanMap['mvlan'] }}</span>
            <span>{{ mv_list }}</span>
            <a href="javascript:void(0);" @click="open_modal(4)">{{ lanMap['add'] }}</a>
            <a href="javascript:void(0);" @click="open_modal(5)">{{ lanMap['delete'] }}</a>
        </div>
        <hr>
        <div class="opv-translate" v-if="mc_eth_cfg_port.tag_mode === 2">
            <h4>组播VLAN转换表</h4>
            <div>
                <div>
                    <span>svlan</span>
                    <span>cvlan</span>
                </div>
                <div v-for="(item,index) in mv_translate.data" :key="index">
                    <span>{{ item.svlan }}</span>
                    <span>{{ item.cvlan }}</span>
                    <a href="javascript:void(0);" @click="open_cfm_del_vlan(item)">{{ lanMap['delete'] }}</a>
                </div>
            </div>
            <div>
                <a href="javascript:void(0);" @click="open_modal(3)">{{ lanMap['add'] }}</a>
            </div>
        </div>
        <div class="modal-dialog" v-if="flag">
            <div class="cover"></div>
            <div :class="{ 'simple-modal' : mc_eth_cfg_port.tag_mode !== 2 }">
                <div class="opv-modal">
                    <h3 v-if="flag === 1">{{ lanMap['group_num_max'] + ' ' + lanMap['config'] }}</h3>
                    <h3 v-if="flag === 2">{{ lanMap['tag_mode'] + '' + lanMap['config'] }}</h3>
                    <h3 v-if="flag === 3">{{ lanMap['add'] }}</h3>
                    <h3 v-if="flag === 4">{{ lanMap['add'] + ' ' + lanMap['mvlan'] }}</h3>
                    <h3 v-if="flag === 5">{{ lanMap['delete'] + ' ' + lanMap['mvlan'] }}</h3>
                    <div v-if="flag === 1">
                        <span>{{ lanMap['group_num_max'] }}</span>
                        <input type="text" v-model.number="group_num_max">
                    </div>
                    <div v-if="flag === 2 || flag === 3">
                        <span>{{ lanMap['tag_mode'] }}</span>
                        <select v-model.number="tag_mode" :disabled="flag === 3">
                            <option value="0">tag</option>
                            <option value="1">untag</option>
                            <option value="2">translate</option>
                        </select>
                    </div>
                    <div v-if="(flag === 2 || flag === 3) && mc_eth_cfg_port.tag_mode === 2">
                        <span>svlan</span>
                        <input type="text" v-model.number="svlan">
                    </div>
                    <div v-if="(flag === 2 || flag === 3) && mc_eth_cfg_port.tag_mode === 2">
                        <span>cvlan</span>
                        <input type="text" v-model.number="cvlan">
                    </div>
                    <div v-if="flag === 4 || flag === 5">
                        <span>{{ lanMap['mvlan'] }}</span>
                        <input type="text" v-model.number="mvlan">
                    </div>
                    <div>
                        <a href="javascript:void(0);" v-if="flag === 1" @click="submit_set_group">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" v-if="flag === 2 || flag === 3" @click="submit_set_tagmode">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" v-if="flag === 4" @click="submit_add_mvlan">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" v-if="flag === 5" @click="submit_del_mvlan">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="close_modal">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="close_modal"></div>
            </div>
        </div>
        <confirm v-if="cfm_del_vlan" @choose="submit_del_tagmode"></confirm>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'onuPortVlan',
    computed: {
        ...mapState(['lanMap','port_name','change_url']),
        mv_list(){
            if(!this.mvlan_list.data || this.mvlan_list.data.length < 1) return ''
            var result = [];
            this.mvlan_list.data.forEach(item=>{
                result.push(item.mvlan);
            })
            return result.toString();
        }
    },
    props: ['portid','onuid'],
    data(){
        return {
            //  onu 端口组播配置
            mc_eth_config: {},
            //  onu 单个端口组播配置
            mc_eth_cfg_port: {},
            //  onu 端口组播vlan表
            mvlan_list: {},
            //  onu 端口组播vlan转换表
            mv_translate: {},
            opid: 0,
            //  1->set group_num_max  2->set tag mode 4->add mvlan 5->del mvlan
            flag: 0,
            group_num_max: '',
            mvlan: '',
            tag_mode: 0,
            svlan: '',
            cvlan: '',
            cfm_del_vlan: false
        }
    },
    created(){
        this.getData();
    },
    methods: {
        getData(){
            this.$http.get(this.change_url.get_mc_eth_config,{ params: { port_id: this.portid,onu_id: this.onuid }}).then(res=>{
                if(res.data.code === 1){
                    this.mc_eth_config = res.data;
                    if(res.data.data && res.data.data.length > 0){
                        if(!this.opid || this.opid > res.data.data.length){
                            this.opid = res.data.data[0].op_id;
                        }else{
                            res.data.data.forEach(item=>{
                                if(item.op_id === this.opid){
                                    this.mc_eth_cfg_port = item;
                                    this.getMvlan();
                                }
                            })
                        }
                    }
                }else{
                    this.mc_eth_config = {}
                }
            }).catch(err=>{
                // to do
            })
        },
        getMvlan(){
            this.$http.get('/onumgmt?form=mc_vlan',{ params: { port_id: this.portid,onu_id: this.onuid }}).then(res=>{
                if(res.data.code === 1){
                    this.mvlan_list = res.data;
                }else{
                    this.mvlan_list = {}
                }
            }).catch(err=>{
                // to do
            })
        },
        get_mv_translate(){
            this.$http.get('/onumgmt?form=mc_translate',{ params: { port_id: this.portid,onu_id: this.onuid,op_id: this.opid }}).then(res=>{
                if(res.data.code === 1){
                    this.mv_translate = res.data;
                }else{
                    this.mv_translate = {}
                }
            }).catch(err=>{
                // to do
            })
        },
        open_cfm_del_vlan(node){
            this.cfm_del_vlan = true;
            this.svlan = node.svlan;
            this.cvlan = node.cvlan;
        },
        open_modal(flag){
            this.flag = flag;
            if(flag === 1 || flag === 2 || flag === 3){
                this.mc_eth_config.data.forEach(item=>{
                    if(item.op_id === this.opid){
                        this.group_num_max = item.group_num_max;
                        this.tag_mode === item.tag_mode;
                    }
                })
            }
        },
        close_modal(){
            this.flag = 0;
            this.group_num_max = '';
            this.mvlan = '';
            this.tag_mode = 0;
            this.svlan = '';
            this.cvlan = '';
        },
        submit_set_group(){
            if(this.group_num_max < 0 || this.group_num_max > 255 || isNaN(this.group_num_max)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['group_num_max']
                })
                return
            }
            var post_param = {
                "method":"set",
                "param":{
                    "port_id": this.portid,
                    "onu_id": this.onuid,
                    "op_id": this.opid,
                    "group_num_max": this.group_num_max
                }
            }
            this.$http.post('/onumgmt?form=mc_group_max',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['st_success']
                    })
                    this.getData();
                }else if(res.data.code > 1){
                    this.$message({
                        type: 'error',
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_modal();
        },
        submit_set_tagmode(){
            if(this.tag_mode === 2){
                if(this.svlan < 1 || this.svlan > 4094 || isNaN(this.svlan)){
                    this.$message({
                        type: 'error',
                        text: this.lanMap['param_error'] + ': svlan'
                    })
                    return
                }
                if(this.cvlan < 1 || this.cvlan > 4094 || isNaN(this.cvlan)){
                    this.$message({
                        type: 'error',
                        text: this.lanMap['param_error'] + ': cvlan'
                    })
                    return
                }
            }
            var post_param = {
                "method":"set",
                "param":{
                    "port_id": this.portid,
                    "onu_id": this.onuid,
                    "op_id": this.opid,
                    "tag_mode": this.tag_mode,
                    "svlan": this.svlan,
                    "cvlan": this.cvlan
                }
            }
            this.$http.post('/onumgmt?form=mc_tag_mode',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['st_success']
                    })
                    this.getData();
                }else if(res.data.code > 1){
                    this.$message({
                        type: 'error',
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_modal();
        },
        submit_del_tagmode(bool){
            if(bool){
                var post_param = {
                    "method":"delete",
                    "param":{
                        "port_id": this.portid,
                        "onu_id": this.onuid,
                        "op_id": this.opid,
                        "tag_mode": this.tag_mode,
                        "svlan": this.svlan,
                        "cvlan": this.cvlan
                    }
                }
                this.$http.post('/onumgmt?form=mc_tag_mode',post_param).then(res=>{
                    if(res.data.code === 1){
                        this.$message({
                            type: 'success',
                            text: this.lanMap['st_success']
                        })
                        this.getData();
                    }else if(res.data.code > 1){
                        this.$message({
                            type: 'error',
                            text: '(' + res.data.code + ') ' + res.data.message
                        })
                    }
                }).catch(err=>{
                    // to do
                })
            }
            this.cfm_del_vlan = false;
        },
        submit_add_mvlan(){
            if(this.mvlan < 1 || this.mvlan > 4094 || isNaN(this.mvlan)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['mvlan']
                })
                return
            }
            var post_param = {
                "method":"add",
                "param":{
                    "port_id": this.portid,
                    "onu_id": this.onuid,
                    "op_id": this.opid,
                    "mvlan": this.mvlan       //1-4094
                }
            }
            this.$http.post('/onumgmt?form=mc_vlan',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['st_success']
                    })
                    this.getMvlan();
                }else if(res.data.code > 1){
                    this.$message({
                        type: 'error',
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_modal();
        },
        submit_del_mvlan(){
            var post_param = {
                "method":"delete",
                "param":{
                    "port_id": this.portid,
                    "onu_id": this.onuid,
                    "op_id": this.opid,
                    "mvlan": this.mvlan       //  1-4094
                }
            }
            this.$http.post('/onumgmt?form=mc_vlan',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['st_success']
                    })
                    this.getMvlan();
                }else if(res.data.code > 1){
                    this.$message({
                        type: 'error',
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_modal();
        }
    },
    watch: {
        'onuid'(){
            if(!this.onuid) return
            this.getData();
            this.getMvlan();
        },
        'opid'(){
            if(!this.opid) return
            this.mc_eth_config.data.forEach(item=>{
                if(item.op_id === this.opid){
                    this.mc_eth_cfg_port = item;
                }
            })
            if(this.mc_eth_cfg_port.tag_mode === 2){
                this.get_mv_translate();
            }
        }
    }
}
</script>

<style lang="less" scoped>
div.onu-port-vlan{
    h4{
        font-size: 18px;
        color: #67aef6;
        font-weight: 500;
    }
    >div.opv-item{
        height: 30px;
        line-height: 30px;
        select{
            width: 120px;
            height: 28px;
            line-height: 28px;
        }
        >span{
            display: inline-block;
            vertical-align: middle;
            width: 400px;
            &:first-child{
                width: 200px;
            }
        }
        a{
            height: 24px;
            line-height: 24px;
        }
    }
}
div.opv-translate{
    height: 30px;
    line-height: 30px;
    h4{
        float: left;
        width: 200px;
    }
    >div{
        width: 400px;
        float: left;
        span{
            display: inline-block;
            width: 120px;
        }
        &:last-child{
            margin-left: 9px;
        }
    }
    a{
        height: 26px;
        line-height: 26px;
    }
    &::after{
        display: table;
        content: "";
        clear: both;
    }
}
div.cover+div{
    height: 235px;
}
div.cover+div.simple-modal{
    height: 165px;
}
div.opv-modal{
    h3{
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
        a{
            margin: 20px 0 0 100px;
        }
        select{
            width: 195px;
        }
    }
}
</style>