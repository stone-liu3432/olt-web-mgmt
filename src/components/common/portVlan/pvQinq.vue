<template>
    <div class="pv-qinq">
        <div class="pv-qinq-item">
            <span>cvlan</span>
            <span>cvlan start</span>
            <span>cvlan end</span>
            <span>svlan</span>
            <span>{{ lanMap['svlan_pri'] }}</span>
            <span>
                <a href="javascript:void(0);" @click="open_add_qinq">{{ lanMap['add'] }}</a>
            </span>
        </div>
        <div class="pv-qinq-item" v-for="(item,key) in pvData.data" :key="key" v-if="pvData.data && pvData.data.length > 0">
            <span>{{ item.cvlan }}</span>
            <span>{{ item.cvlan_s }}</span>
            <span>{{ item.cvlan_e }}</span>
            <span>{{ item.svlan }}</span>
            <span>{{ item.svlan_pri }}</span>
            <span>
                <a href="javascript:void(0);" @click="open_qinq_modal(item)">{{ lanMap['modify'] }}</a>
                <a href="javascript:void(0);" @click="open_del_qinq_modal(item)">{{ lanMap['delete'] }}</a>
            </span>
        </div>
        <div class="modal-dialog" v-if="show_set_qinq">
            <div class="cover"></div>
            <div class="pv-qinq-modal" id="modal-dialog-qinq">
                <div class="pv-qinq-modal-item">
                    <h3 v-if="flags === 2">{{ lanMap['config'] }}</h3>
                    <h3 v-if="flags === 1">{{ lanMap['add'] }}</h3>
                </div>
                <div class="pv-qinq-modal-item">
                    <span>cvlan</span>
                    <span>
                        <input type="text" v-model.number="cvlan" v-focus :disabled="cvlan_s != 0 || cvlan_e != 0"
                          :style="{ 'border-color' : cvlan < 0 || cvlan > 4094 || isNaN(cvlan) ? 'red' : '' }">
                    </span>
                </div>
                <div class="pv-qinq-modal-item">
                    <span>cvlan start</span>
                    <span>
                        <input type="text" v-model.number="cvlan_s" :disabled="cvlan != 0"
                          :style="{ 'border-color' : cvlan_s < 0 ||  cvlan_s > 4094 || isNaN(cvlan_s)  ? 'red' : '' }">
                    </span>
                </div>
                <div class="pv-qinq-modal-item">
                    <span>vlan end</span>
                    <span>
                        <input type="text" v-model.number="cvlan_e" :disabled="cvlan != 0"
                          :style="{ 'border-color' : cvlan_e < 0 || cvlan_e > 4094 || isNaN(cvlan_e) ? 'red' : '' }">
                    </span>
                </div>
                <div class="pv-qinq-modal-item">
                    <span>svlan</span>
                    <span>
                        <input type="text" v-model.number="svlan"
                          :style="{ 'border-color' : svlan !== '' && (svlan < 1 || svlan > 4094 || isNaN(svlan)) ? 'red' : '' }">
                    </span>
                </div>
                <div class="pv-qinq-modal-item">
                    <span>{{ lanMap['svlan_pri'] }}</span>
                    <span>
                        <select v-model.number="svlan_pri">
                            <option value="255"> - </option>
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                        </select>
                    </span>
                </div>
                <div class="pv-qinq-modal-item">
                    <a href="javascript:void(0);" @click="submit_cfg_qinq">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" @click="close_set_qinq_modal">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="close_set_qinq_modal"></div>
            </div>
        </div>
        <confirm v-if="show_del_cfm" @choose="del_qinq_result"></confirm>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'pvQinq',
    computed: mapState(['lanMap']),
    props: ['pvData'],
    data(){
        return {
            flags: 0,       //  模态框内标题
            cache_d: {},
            show_set_qinq: false,
            show_del_cfm: false,
            cvlan: 0,
            cvlan_s: 0,
            cvlan_e: 0,
            svlan: 0,
            svlan_pri: 0,
            del_params: {}
            // pvData: {
            //     "code":1,
            //     "msg":"success",
            //     "data":[{
            //         "port_id":1,
            //         "cvlan":100,        //  cvlan有值时, cvlan_s,cvlan_e的值将都为0，反之亦然
            //         "cvlan_s":0,
            //         "cvlan_e":0,
            //         "svlan":200,
            //         "svlan_pri":1,
            //         "action":1
            //     }]
            // }
        }
    },
    created(){
        //  
    },
    methods: {
        //  添加 qinq 模态框
        open_add_qinq(){
            this.flags = 1;
            this.show_set_qinq = true;
            this.cvlan = '';
            this.cvlan_s = '';
            this.cvlan_e = '';
            this.svlan = '';
            this.svlan_pri = 255;
        },
        //  配置 qinq 按钮
        open_qinq_modal(item){
            this.flags = 2;
            this.show_set_qinq = true;
            this.cvlan = item.cvlan;
            this.cvlan_s = item.cvlan_s;
            this.cvlan_e = item.cvlan_e;
            this.svlan = item.svlan;
            this.svlan_pri = item.svlan_pri;
            this.cache_d = Object.assign({},item);
        },
        //  设置 qinq 模态框内取消/关闭按钮
        close_set_qinq_modal(){
            this.show_set_qinq = false;
        },
        //  设置 qinq 模态框内确认按钮
        submit_cfg_qinq(){
            if(this.cvlan === this.cache_d.cvlan &&
              this.cvlan_s === this.cache_d.cvlan_s &&
              this.cvlan_e === this.cache_d.cvlan_e &&
              this.svlan=== this.cache_d.svlan &&
              this.svlan_pri === this.cache_d.svlan_pri ){
                this.$message({
                    type: 'info',
                    text: this.lanMap['modify_tips']
                })
                return
            }
            if(this.cvlan_s == 0 && this.cvlan_e == 0 && (this.cvlan < 1 || this.cvlan > 4094 || isNaN(this.cvlan))) {
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': cvlan'
                })
                return
            }
            if(this.cvlan == 0 && (this.cvlan_s < 1 || this.cvlan_s > 4094 || isNaN(this.cvlan_s))){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': cvlan start'
                })
                return
            }
            if(this.cvlan == 0 && (this.cvlan_e < 1 || this.cvlan_e > 4094 || isNaN(this.cvlan_e))){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': cvlan end'
                })
                return
            }
            if(this.svlan < 1 || this.svlan > 4094 || isNaN(this.svlan)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': svlan'
                })
                return
            }
            var post_params = {
                "method":"set",
                "param":{
                    "port_id": this.$parent.$data.portid,
                    "cvlan": this.cvlan,
                    "cvlan_s": this.cvlan_s,
                    "cvlan_e": this.cvlan_e,
                    "svlan": this.svlan,
                    "svlan_pri": this.svlan_pri,
                    "action": 1
                }
            }
            this.$http.post('/vlan_action?form=qinq',post_params).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['setting_ok']
                    })
                    this.$parent.get_pv_qinq();
                }else{
                    this.$message({
                        type: 'error',
                        text: 'err:' + res.data.code + ' ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_set_qinq_modal();
        },
        //  删除 qinq 按钮
        open_del_qinq_modal(item){
            this.del_params = item;
            this.show_del_cfm = true;
        },
        //  删除 qinq 确认框内操作结果
        del_qinq_result(bool){
            if(bool){
                var post_params = {
                    "method":"delete",
                    "param":{
                        "port_id": this.$parent.$data.portid,
                        "cvlan": this.del_params.cvlan,
                        "cvlan_s": this.del_params.cvlan_s,
                        "cvlan_e": this.del_params.cvlan_e,
                        "action": 1
                    }
                }
                this.$http.post('/vlan_action?form=qinq',post_params).then(res=>{
                    if(res.data.code === 1){
                        this.$message({
                            type: 'success',
                            text: this.lanMap['delete'] + ': ' + this.lanMap['setting_ok']
                        })
                        this.$parent.get_pv_qinq();
                    }else{
                        this.$message({
                            type: 'error',
                            text: 'err:' + res.data.code + ' ' + res.data.message
                        })
                    }
                }).catch(err=>{
                    // to do
                })
            }
            this.show_del_cfm = false;
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
div.pv-qinq-item{
    margin: 10px 0 10px 10px;
    height: 30px;
    >span{
        display: inline-block;
        min-width: 120px;
        max-width: 800px;
        height: 30px;
        line-height: 30px;
        vertical-align: middle;
        &:last-child{
            width: 300px;
            text-align: center;
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
    div.pv-qinq-modal{
        width: 500px;
        height: 320px;
        background: #fff;
        div.pv-qinq-modal-item{
            margin: 10px 0 10px 60px;
            height: 30px;
        }
        &:first-child{
            margin-top: 24px;
        }
        span{
            display: inline-block;
            height: 30px;
            width: 150px;
            line-height: 30px;
            vertical-align: middle;
        }
        h3{
            font-size: 24px;
            font-weight: 600;
            color: #67aef7;
        }
        a{
            margin: 15px 0 0 45px;
        }
    }
}
</style>
