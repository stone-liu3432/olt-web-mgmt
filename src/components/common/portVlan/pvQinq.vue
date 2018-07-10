<template>
    <div class="pv-qinq">
        <div class="pv-qinq-item">
            <span>cvlan</span>
            <span>{{ pvData.data.cvlan }}</span>
        </div>
        <div class="pv-qinq-item">
            <span>cvlan start</span>
            <span>{{ pvData.data.cvlan_s }}</span>
        </div>
        <div class="pv-qinq-item">
            <span>cvlan end</span>
            <span>{{ pvData.data.cvlan_e }}</span>
        </div>
        <div class="pv-qinq-item">
            <span>svlan</span>
            <span>{{ pvData.data.svlan }}</span>
        </div>
        <div class="pv-qinq-item">
            <span>{{ lanMap['svlan_pri'] }}</span>
            <span>{{ pvData.data.svlan_pri }}</span>
        </div>
        <div class="pv-qinq-item">
            <a href="javascript:void(0);" @click="open_qinq_modal(1)">{{ lanMap['config'] }}</a>
            <a href="javascript:void(0);" @click="open_qinq_modal(0)">{{ lanMap['delete'] }}</a>
        </div>
        <div class="modal-dialog" v-if="show_set_qinq">
            <div class="cover"></div>
            <div class="pv-qinq-modal" id="modal-dialog-qinq">
                <div class="pv-qinq-modal-item">
                    <h3 v-if="set_qinq_type">{{ lanMap['config'] }}</h3>
                    <h3 v-else>{{ lanMap['delete'] }}</h3>
                </div>
                <div class="pv-qinq-modal-item">
                    <span>cvlan</span>
                    <span>
                        <input type="text" v-model.number="cvlan" v-focus
                          :style="{ 'border-color' : cvlan !== '' && ( cvlan < 1 || cvlan > 4094 || isNaN(cvlan) ) ? 'red' : '' }">
                    </span>
                </div>
                <div class="pv-qinq-modal-item">
                    <span>cvlan_s</span>
                    <span>
                        <input type="text" v-model.number="cvlan_s"
                          :style="{ 'border-color' : cvlan_s !== '' && ( cvlan_s < 1 || cvlan_s > 4094 || isNaN(cvlan_s) ) ? 'red' : '' }">
                    </span>
                </div>
                <div class="pv-qinq-modal-item">
                    <span>vlan_e</span>
                    <span>
                        <input type="text" v-model.number="cvlan_e"
                          :style="{ 'border-color' : cvlan_e !== '' && ( cvlan_e < 1 || cvlan_e > 4094 || isNaN(cvlan_e) ) ? 'red' : '' }">
                    </span>
                </div>
                <div class="pv-qinq-modal-item" v-if="set_qinq_type">
                    <span>svlan</span>
                    <span>
                        <input type="text" v-model.number="svlan"
                          :style="{ 'border-color' : svlan !== '' && ( svlan < 1 || svlan > 4094 || isNaN(svlan) ) ? 'red' : '' }">
                    </span>
                </div>
                <div class="pv-qinq-modal-item" v-if="set_qinq_type">
                    <span>svlan_pri</span>
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
                    <a href="javascript:void(0);" v-if="set_qinq_type" @click="submit_cfg_qinq">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" v-else @click="submit_del_qinq">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" v-if="set_qinq_type" @click="close_set_qinq_modal">{{ lanMap['cancel'] }}</a>
                    <a href="javascript:void(0);" v-else @click="close_del_qinq">{{ lanMap['cancel'] }}</a>
                </div>
                <div v-if="set_qinq_type" class="close" @click="close_set_qinq_modal"></div>
                <div v-else class="close" @click="close_del_qinq"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'pvQinq',
    computed: mapState(['lanMap']),
    //props: ['pvData'],
    data(){
        return {
            show_set_qinq: false,
            cvlan: 0,
            cvlan_s: 0,
            cvlan_e: 0,
            svlan: 0,
            svlan_pri: 0,
            set_qinq_type: 0       //  0 -> delete   1 -> add
            // pvData: {
            //     "code":1,
            //     "msg":"success",
            //     "data":{
            //         "port_id":1,
            //         "cvlan":100,
            //         "cvlan_s":0,
            //         "cvlan_e":0,
            //         "svlan":200,
            //         "svlan_pri":1,
            //         "action":1
            //     }
            // }
        }
    },
    created(){
        //  
    },
    methods: {
        open_qinq_modal(n){
            this.show_set_qinq = true;
            this.set_qinq_type = n;
            this.cvlan = this.pvData.data.cvlan;
            this.cvlan_s = this.pvData.data.cvlan_s;
            this.cvlan_e = this.pvData.data.cvlan_e;
            this.svlan = this.pvData.data.svlan;
            this.svlan_pri = this.pvData.data.svlan_pri;
            if(!this.set_qinq_type){
                this.$nextTick(()=>{
                    document.getElementById('modal-dialog-qinq').style.height = '240px';
                })
            }
        },
        close_set_qinq_modal(){
            this.show_set_qinq = false;
        },
        submit_cfg_qinq(){
            if(this.cvlan === this.pvData.data.cvlan &&
              this.cvlan_s === this.pvData.data.cvlan_s &&
              this.cvlan_e === this.pvData.data.cvlan_e &&
              this.svlan=== this.pvData.data.svlan &&
              this.svlan_pri === this.pvData.data.svlan_pri ){
                this.$message({
                    type: 'info',
                    text: this.lanMap['modify_tips']
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
            if(this.cvlan < 1 || this.cvlan_s > 4094 || isNaN(this.cvlan_s)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': cvlan_s'
                })
                return
            }
            if(this.cvlan_e < 1 || this.cvlan_e > 4094 || isNaN(this.cvlan_e)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': cvlan_e'
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
                    "port_id": this.pvData.data.port_id,
                    "cvlan": this.cvlan,
                    "cvlan_s": this.cvlan_s,
                    "cvlan_e": this.cvlan_e,
                    "svlan": this.svlan,
                    "svlan_pri": this.svlan_pri,
                    "action": 1
                }
            }
            this.$http.post('',post_params).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['setting_ok']
                    })
                    this.$parent.get_pv_qinq();
                }else{
                    this.$message({
                        type: 'error',
                        text: res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_set_qinq_modal();
        },
        close_del_qinq(){
            this.show_set_qinq = false;
        },
        submit_del_qinq(){
            if(this.cvlan < 1 || this.cvlan > 4094 || isNaN(this.cvlan)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': '
                })
                return
            }
            if(this.cvlan_s < 1 || this.cvlan_s > 4094 || isNaN(this.cvlan_s)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': '
                })
                return
            }
            if(this.cvlan_e < 1 || this.cvlan_e > 4094 || isNaN(this.cvlan_e)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': '
                })
                return
            }
            var post_params = {
                "method":"delete",
                "param":{
                    "port_id": this.pvData.data.port_id,
                    "cvlan": this.cvlan,
                    "cvlan_s": this.cvlan_s,
                    "cvlan_e": this.cvlan_e,
                    "action": 1
                }
            }
            this.$http.post('',post_params).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['delete'] + ': ' + this.lanMap['setting_ok']
                    })
                    this.$parent.get_pv_qinq();
                }else{
                    this.$message({
                        type: 'error',
                        text: res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_del_qinq();
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
