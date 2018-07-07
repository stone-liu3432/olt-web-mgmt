<template>
    <div class="port-vlan-set">
        <div class="pv-set-item">
            <span>{{ lanMap['port_type'] }}</span>
            <span>
                {{ port_type_map[pvData.data.port_type] }}
            </span>
            <span>
                <a href="javascript:void(0);" @click="set_port_type">{{ lanMap['config'] }}</a>
            </span>
        </div>
        <div class="pv-set-item">
            <span>{{ lanMap['pvid'] }}</span>
            <span>
                {{ pvData.data.pvid }}
            </span>
            <span>
                <a href="javascript:void(0);" @click="set_pv_def_vlan">{{ lanMap['config'] }}</a>
            </span>
        </div>
        <div class="pv-set-item">
            <span>{{ lanMap['tagged'] }}</span>
            <span>
                {{ pvData.data.tagged_vlan }}
            </span>
        </div>
        <div class="pv-set-item">
            <span>{{ lanMap['untagged'] }}</span>
            <span>
                {{ pvData.data.untagged_vlan }}
            </span>
        </div>
        <div class="pv-set-item">
            <a href="javascript:void(0);" @click="set_pv_vlist_add" class="large-btn">
                {{ lanMap['add_vlan_list'] }}
            </a>
            <a href="javascript:void(0);" @click="set_pv_vlist_del" class="large-btn">
                {{ lanMap['del_vlan_list'] }}
            </a>
        </div>
        <div class="modal-dialog" v-if="modal_show">
            <div class="cover"></div>
            <!-- port vlan basic config -->
            <div class="pv-type" v-if="port_type_show">
                <div class="pv-type-item">
                    <span>{{ lanMap['port_id'] }}</span>
                    <span>{{ pvData.data.port_id }}</span>
                </div>
                <div class="pv-type-item">
                    <span>{{ lanMap['port_type'] }}</span>
                    <span>
                        <select v-model="port_type">
                            <option value="1">Access</option>
                            <option value="2">Trunk</option>
                            <option value="3">Hybrid</option>
                        </select>
                    </span>
                </div>
                <div>
                    <a href="javascript:void(0);" @click="submit_set_port_type">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" @click="close_modal_porttype">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="close_modal_porttype"></div>
            </div>
            <!-- port vlan default vlan -->
            <div class="pv-def-vid" v-if="port_defvid_show">
                <div class="pv-defvlan-item">
                    <span>{{ lanMap['port_id'] }}</span>
                    <span>{{ pvData.data.port_id }}</span>
                </div>
                <div class="pv-defvlan-item">
                    <span>{{ lanMap['def_vlan_id'] }}</span>
                    <span>
                        <input type="text" v-focus v-model.number="pvid" :style="{ 'border-color' : pvid < 1 || pvid > 4094 ? 'red' : '' }">
                    </span>
                </div>
                <div>
                    <a href="javascript:void(0);" @click="submit_set_pv_def_vlan">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" @click="close_pv_def_vlan">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="close_pv_def_vlan"></div>
            </div>
            <!-- port vlan tag/untag vlan list -->
            <div class="pv-vlan-list" v-if="port_vlist_show">
                <div>
                    <h3 v-if="set_vlist_type === 1">{{ lanMap['add'] }}</h3>
                    <h3 v-if="set_vlist_type === 0">{{ lanMap['delete'] }}</h3>
                </div>
                <div class="pv-vlist-item">
                    <span>{{ lanMap['port_id'] }}</span>
                    <span>{{ pvData.data.port_id }}</span>
                </div>
                <div class="pv-vlist-item">
                    <span>{{ lanMap['port_type'] }}</span>
                    <span>{{ port_type_map[pvData.data.port_type] }}</span>
                </div>
                <div class="pv-vlist-item">
                    <span>{{ lanMap['vlan_list'] }}</span>
                    <span>
                        <input type="text" v-focus v-model="vlan_list" placeholder="ex: 100,200-300,400">
                    </span>
                </div>
                <div class="pv-vlist-item">
                    <span>{{ lanMap['vlan_mode'] }}</span>
                    <span>
                        <select v-model="vlan_mode" :disabled="pvData.data.port_mode !== 3">
                            <option value="1">{{ lanMap['tagged'] }}</option>
                            <option value="2">{{ lanMap['untagged'] }}</option>
                        </select>
                    </span>
                </div>
                 <div>
                    <a href="javascript:void(0);" v-if="this.set_vlist_type === 1" @click="submit_add_pv_vlist">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" v-if="this.set_vlist_type === 0" @click="submit_del_pv_vlist">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" @click="close_pv_vlist">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="pv-vlist-tips">
                    <i></i>
                    <div>
                        <p>{{ lanMap['pv_vlist_tips'] }}</p>
                        <p>ex: 100,200-300,400</p>
                        <p>{{ lanMap['pv_vmode_tips'] }}</p>
                    </div>
                </div>
                <div class="close" @click="close_pv_vlist"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'pvSet',
    //props: ['pvData'],
    computed: mapState(['lanMap']),
    data(){
        return {
            cache_d: {},
            modal_show: false,
            port_type_map: ['','Access','Trunk','Hybrid'],
            port_type: 0,
            pvid: 0,
            vlan_list: '',
            vlan_mode: 1,
            set_vlist_type: 0,        //  0 -> delete   1 -> add
            port_type_show: false,
            port_defvid_show: false,
            port_vlist_show: false,
            pvData: {
                "code":1,
                "msg":"success",
                "data":{
                    "port_id":1,
                    "port_type":2,
                    "pvid":1,
                    "tagged_vlan":" ",
                    "untagged_vlan":"1"
                }
            }
        }
    },
    created(){
        this.cache_d = Object.assign({},this.pvData);
    },
    methods: {
        set_port_type(){
            this.modal_show = true;
            this.port_type_show = true;
            this.port_type = this.pvData.data.port_type;
        },
        submit_set_port_type(){
            if(this.port_type === this.cache_d.data.port_type){
                this.$message({
                    type: 'info',
                    text: this.lanMap['modify_tips']
                })
                return
            }
            var post_params = {
                "method":"set",
                "param":{
                    "port_id": this.cache_d.data.port_id,
                    "port_type": this.port_type
                }
            }
            this.$http.post('/switch_port?form=vlan_type',post_params).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['setting_ok']
                    })
                    this.$parent.get_pv_set();
                }else{
                    this.$message({
                        type: 'error',
                        text: res.data.message
                    })
                }
                this.close_modal_porttype();
            }).catch(err=>{
                // to do
            })
        },
        close_modal_porttype(){
            this.modal_show = false;
            this.port_type_show = false;
        },
        set_pv_def_vlan(){
            this.modal_show = true;
            this.port_defvid_show = true;
            this.pvid = this.cache_d.data.pvid;
        },
        submit_set_pv_def_vlan(){
            if(this.pvid < 1 || this.pvid > 4094 || isNaN(this.pvid)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['pvid']
                })
                return
            }
            if(this.pvid === this.cache_d.data.pvid){
                this.$message({
                    type: 'info',
                    text: this.lanMap['modify_tips']
                })
                return
            }
            var post_params = {
                "method":"set",
                "param":{
                    "port_id": this.cache_d.data.port_id,
                    "pvid": this.pvid
                }
            }
            this.$http.post('/switch_port?form=defaultvlan',post_params).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['setting_ok']
                    })
                    this.$parent.get_pv_set();
                }else{
                    this.$message({
                        type: 'error',
                        text: res.data.message
                    })
                }
                this.close_pv_def_vlan();
            }).catch(err=>{
                // to do
            })
        },
        close_pv_def_vlan(){
            this.modal_show = false;
            this.port_defvid_show = false;
        },
        set_pv_vlist_add(){
            this.modal_show = true;
            this.port_vlist_show = true;
            this.set_vlist_type = 1;
        },
        set_pv_vlist_del(){
            this.modal_show = true;
            this.port_vlist_show = true;
            this.set_vlist_type = 0;
        },
        submit_add_pv_vlist(){
            if(this.vlan_list.replace(/\s+/g,'') === this.cache_d.data.vlan_list.replace(/\s+/g,'')){
                this.$message({
                    type: 'info',
                    text: this.lanMap['modify_tips']
                })
                return
            }
            var post_params = {
                "method":"set",
                "param":{
                    "port_id": this.cache_d.data.port_id,
                    "port_type": this.cache_d.data.port_type,
                    "vlan_list": this.vlan_list.replace(/\s+/g,''),
                    "vlan_mode": this.vlan_mode     // (hybrid)
                }
            }
            this.$http.post('/switch_port?form=vlan',post_params).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['setting_ok']
                    })
                    this.$parent.get_pv_set();
                }else{
                    this.$message({
                        type: 'error',
                        text: res.data.message
                    })
                }
                this.close_pv_vlist();
            }).catch(err=>{
                // to do
            })
        },
        submit_del_pv_vlist(){
             var post_params = {
                "method":"delete",
                "param":{
                    "port_id": this.cache_d.data.port_id,
                    "port_type": this.cache_d.data.port_type,
                    "vlan_list": this.vlan_list.replace(/\s+/g,''),
                    "vlan_mode": this.vlan_mode     // (hybrid)
                }
            }
            this.$http.post('/switch_port?form=vlan',post_params).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['setting_ok']
                    })
                    this.$parent.get_pv_set();
                }else{
                    this.$message({
                        type: 'error',
                        text: res.data.message
                    })
                }
                this.close_pv_vlist();
            }).catch(err=>{
                // to do
            })
        },
        close_pv_vlist(){
            this.modal_show = false;
            this.port_vlist_show = false;
        }
    },
    watch: {
        'pvData'(){
            this.cache_d = Object.assign({},this.pvData);
        }
    }
}
</script>

<style lang="less" scoped>
a{
    font-size: 16px;
    font-weight: normal;
    display: inline-block;
    width: 120px;
    height: 30px;
    line-height: 30px;
    vertical-align: middle;
    text-align: center;
    background: #ccc;
    border-radius: 3px;
}
select{
    width: 120px;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
    text-indent: 6px;
    border-radius: 3px;
    &:focus{
        border-radius: 3px;
    }
}
div.port-vlan-set{
    >div.pv-set-item{
        margin: 10px 0 10px 10px;
        height: 30px;
        >span{
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 120px;
            max-width: 800px;
            height: 30px;
            line-height: 30px;
            vertical-align: middle;
            &:first-child{
                width: 130px;
            }
        }
        a.large-btn{
            padding: 0 20px;
            width: auto;
        }
    }
}
div.modal-dialog{
    div.cover+div{
        background: #fff;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        border-radius: 6px;
    }
    div.pv-type{
        width: 500px;
        height: 220px;
        background: #fff;
        >div.pv-type-item{
            margin: 20px 0;
        }
        >div:first-child{
            margin-top: 60px;
        }
        span{
            display: inline-block;
            &:first-child{
                width: 150px;
                margin-left: 50px;
            }
        }
        a{
            width: 120px;
            margin-left: 83px;
            margin-top: 5px;
        }
    }
    div.pv-def-vid{
        width: 500px;
        height: 220px;
        background: #fff;
        >div.pv-defvlan-item{
            margin: 20px 0;
        }
        >div:first-child{
            margin-top: 60px;
        }
        span{
            display: inline-block;
            &:first-child{
                width: 150px;
                margin-left: 50px;
            }
        }
        input{
            width: 120px;
        }
        a{
            width: 120px;
            margin-left: 83px;
            margin-top: 5px;
        }
    }
    div.pv-vlan-list{
        width: 500px;
        height: 315px;
        background: #fff;
        >div.pv-vlist-item{
            margin: 20px 0;
        }
        >div:first-child{
            margin-top: 24px;
            h3{
                font-size: 24px;
                margin-left: 40px;
                font-weight: 600;
                color: #67aef7;
            }
        }
        span{
            display: inline-block;
            &:first-child{
                width: 150px;
                margin-left: 50px;
            }
        }
        input{
            width: 240px;
        }
        a{
            width: 120px;
            margin-left: 83px;
            margin-top: 5px;
        }
        div.pv-vlist-tips{
            position: absolute;
            top: 16px;
            right: 60px;
            i{
                display: inline-block;
                width: 32px;
                height: 32px;
                background: url('../../../assets/tips.png') no-repeat;
                cursor: pointer;
                &:hover{
                    &+div{
                        display: block;
                    }
                }
            }
            i+div{
                display: none;
                width: 300px;
                background: #67aef7;
                position: absolute;
                top: 23px;
                right: 27px;
                border-radius: 6px;
                p{
                    margin: 15px;
                    color: #fff;
                }
            }
        }
    }
}
</style>
