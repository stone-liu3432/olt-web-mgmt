<template>
    <div class="port-vlan-translate">
        <div class="pv-translate-item">
            <span>old vlan</span>
            <span>new vlan</span>
            <span>{{ lanMap['new_vlan_pri'] }}</span>
            <span>
                <a href="javascript:void(0);" @click="open_add_translate">{{ lanMap['add'] }}</a>
            </span>
        </div>
        <div class="pv-translate-item" v-for="(item,key) in pvData.data" :key="key" v-if="pvData.data && pvData.data.length > 0">
            <span>{{ item.old_vlan }}</span>
            <span>{{ item.new_vlan }}</span>
            <span>{{ item.new_vlan_pri }}</span>
            <span>
                <a href="javascript:void(0);" @click="open_cfg_translate(item)">{{ lanMap['modify'] }}</a>
                <a href="javascript:void(0);" @click="open_del_translate(item)">{{ lanMap['delete'] }}</a>
            </span>
        </div>
        <div class="modal-dialog" v-if="show_set_pvtrans">
            <div class="cover"></div>
            <div class="pv-translate-modal">
                <div class="translate-modal-item">
                    <h3 v-if="flags === 2">{{ lanMap['config'] }}</h3>
                    <h3 v-if="flags === 1">{{ lanMap['add'] }}</h3>
                </div>
                <div class="translate-modal-item">
                    <span>old vlan</span>
                    <span>
                        <input type="text" v-model.number="pv_old_vlan" :disabled="flags === 2" 
                        :style="{ 'border-color' : this.pv_old_vlan !== '' && (this.pv_old_vlan < 1 || this.pv_old_vlan > 4094 || isNaN(this.pv_old_vlan)) ? 'red' : '' }">
                    </span>
                </div>
                <div class="translate-modal-item">
                    <span>new vlan</span>
                    <span>
                        <input type="text" v-model.number="pv_new_vlan" 
                            :style="{ 'border-color' : this.pv_new_vlan !== '' && (this.pv_new_vlan < 1 || this.pv_new_vlan > 4094 || isNaN(this.pv_new_vlan)) ? 'red' : '' }">
                    </span>
                </div>
                <div class="translate-modal-item">
                    <span>{{ lanMap['new_vlan_pri'] }}</span>
                    <span>
                        <select v-model.number="pv_new_vlan_pri">
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
                <div class="translate-modal-item">
                    <a href="javascript:void(0);" @click="submit_pv_translate">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" @click="close_translate_modal">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="close_translate_modal"></div>
            </div>
        </div>
        <confirm @choose="del_pv_trans" v-if="show_del_pv_trans"></confirm>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'pvTranslate',
    computed: mapState(['lanMap']),
    props: ['pvData'],
    data(){
        return {
            flags: 0,       //  模态框内标题
            cache_d: {},
            show_set_pvtrans: false,
            pv_old_vlan: 0,
            pv_new_vlan: 0,
            pv_new_vlan_pri: 255,
            show_del_pv_trans: false
            // pvData: {
            //     "code":1,
            //     "msg":"success",
            //     "data":[{
            //         "port_id":1,
            //         "old_vlan":100,
            //         "new_vlan":200,
            //         "new_vlan_pri":1,
            //         "action":0
            //     }]
            // }
        }
    },
    created(){
        //  to do
    },
    methods: {
        //  打开配置 translate 模态框
        open_cfg_translate(item){
            this.flags = 2;
            this.show_set_pvtrans = true;
            this.pv_new_vlan = item.new_vlan;
            this.pv_old_vlan = item.old_vlan;
            this.pv_new_vlan_pri = item.new_vlan_pri;
            this.cache_d = Object.assign({},item);
        },
        //  关闭配置 translate 模态框
        close_translate_modal(){
            this.show_set_pvtrans = false;
            this.pv_new_vlan = '';
            this.pv_old_vlan = '';
            this.pv_new_vlan_pri = 255;
        },
        //  配置 translate 模态框内提交按钮
        submit_pv_translate(){
            if( this.pv_old_vlan === this.cache_d.old_vlan &&
                this.pv_new_vlan === this.cache_d.new_vlan && 
                this.pv_new_vlan_pri === this.cache_d.new_vlan_pri ){
                this.$message({
                    type: 'info',
                    text: this.lanMap['modify_tips']
                })
                return
            }
            if(this.pv_old_vlan < 1 || this.pv_old_vlan > 4094 || isNaN(this.pv_old_vlan)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + 'old vlan'
                })
                return
            }
            if(this.pv_new_vlan < 1 || this.pv_new_vlan > 4094 || isNaN(this.pv_new_vlan)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + 'new vlan'
                })
                return
            }
            var post_params = {
                "method":"set",
                "param":{
                    "port_id": this.$parent.$data.portid,
                    "old_vlan": this.pv_old_vlan,
                    "new_vlan": this.pv_new_vlan,
                    "new_vlan_pri": this.pv_new_vlan_pri,
                    "action":0
                }
            }
            this.$http.post('/vlan_action?form=translate',post_params).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['setting_ok']
                    })
                    this.$parent.get_pv_translate();
                }else{
                    this.$message({
                        type: 'error',
                        text: res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_translate_modal();
        },
        //  打开删除 translate 确认框
        open_del_translate(item){
            this.show_del_pv_trans = true;
            this.pv_old_vlan = item.old_vlan;
        },
        //  确认框内的操作按钮
        del_pv_trans(bool){
            if(bool){
                var post_params = {
                    "method":"delete",
                    "param":{
                        "port_id": this.$parent.$data.portid,
                        "old_vlan": this.pv_old_vlan,
                        "action": 0
                    }
                }
                this.$http.post('/vlan_action?form=translate',post_params).then(res=>{
                    if(res.data.code === 1){
                        this.$message({
                            type: 'success',
                            text: this.lanMap['delete'] + this.lanMap['se_success']
                        })
                        this.$parent.get_pv_translate();
                    }else{
                        this.$message({
                            type: 'error',
                            text: res.data.message
                        })
                    }
                }).catch(err=>{
                    //  to do
                })
            }
            this.show_del_pv_trans = false;
        },
        //  打开添加 translate 模态框
        open_add_translate(){
            this.flags = 1;
            this.show_set_pvtrans = true;
            this.pv_new_vlan = '';
            this.pv_old_vlan = '';
            this.pv_new_vlan_pri = 255;
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
div.pv-translate-item{
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
    a.large-btn{
        padding: 0 20px;
        width: auto;
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
    div.pv-translate-modal{
        width: 500px;
        height: 300px;
        background: #fff;
        div.translate-modal-item{
            margin: 20px 0 20px 60px;
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
                margin: 10px 0 0 45px;
            }
        }
    }
    
}
</style>
