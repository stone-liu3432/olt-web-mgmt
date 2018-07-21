<template>
    <div class="port-vlan" v-if="port_name.pon && port_name.ge">
        <div class="portvlan-title">
            {{ lanMap['port_vlan'] }}
            <a href="javascript:void(0);">{{ lanMap['refresh'] }}</a>
        </div>
        <div class="portvlan-port">
            <span>{{ lanMap['port_id'] + ': ' }}</span>
            <select v-model.number="portid">
                <option v-for="(item,index) in port_name.pon" :key="index" :value="item.id">{{ item.name }}</option>
                <option v-for="(item,index) in port_name.ge" :key="index" :value="item.id">{{ item.name }}</option>
                <option v-if="port_name.xge" v-for="(item,index) in port_name.xge" :key="index" :value="item.id">{{ item.name }}</option>
            </select>
        </div>
        <div class="portvlan-tab">
            <div :class="{actived: show_index === 1}" @click="pv_set">{{ lanMap['vlan_cfg'] }}</div>
            <div :class="{actived: show_index === 2}" @click="pv_translate">VLAN Translate</div>
            <div :class="{actived: show_index === 3}" @click="pv_qinq">VLAN qinq</div>
        </div>
        <div>
            <pvSet :pv-data="pv_set_d" v-if="show_index === 1 && pv_set_d.data"></pvSet>
            <pvTranslate :pv-data="pv_translate_d" v-if="show_index === 2"></pvTranslate>
            <pvQinq :pv-data="pv_qinq_d" v-if="show_index === 3"></pvQinq>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import pvSet from '@/components/common/portVlan/pvSet'
import pvTranslate from '@/components/common/portVlan/pvTranslate'
import pvQinq from '@/components/common/portVlan/pvQinq'
export default {
    name: 'portVlan',
    computed: mapState(['lanMap','port_name']),
    components: { pvSet,pvTranslate,pvQinq },
    data(){
        return {
            portid: 0,
            show_index: 1,
            pv_set_d: {},
            pv_translate_d: {},
            pv_qinq_d: {}
        }
    },
    created(){
        var portid = sessionStorage.getItem('portid');
        this.portid = portid || 1;
    },
    activated(){
        switch(this.show_index){
            case 1:
                this.get_pv_set();
                break;
            case 2: 
                this.get_pv_translate();
                break;
            case 3: 
                this.get_pv_qinq();
                break;
        }
    },
    methods: {
        pv_set(){
            this.show_index = 1;
            this.get_pv_set();
        },
        pv_translate(){
            this.show_index = 2;
            this.get_pv_translate();
        },
        pv_qinq(){
            this.show_index = 3;
            this.get_pv_qinq();
        },
        get_pv_set(){
            this.$http.get('/switch_port?form=vlan&port_id=' + this.portid).then(res=>{
                if(res.data.code === 1){
                    this.pv_set_d = res.data;
                }else{
                    this.pv_set_d = {};
                }
            }).catch(err=>{
                // to do
            })
        },
        get_pv_translate(){
            this.$http.get('/vlan_action?form=translate&port_id=' + this.portid).then(res=>{
                if(res.data.code === 1){
                    this.pv_translate_d = res.data;
                }else{
                    this.pv_translate_d = {};
                }
            }).catch(err=>{
                // to do
            })
        },
        get_pv_qinq(){
            this.$http.get('/vlan_action?form=qinq&port_id=' + this.portid).then(res=>{
                if(res.data.code === 1){
                    this.pv_qinq_d = res.data;
                }else{
                    this.pv_qinq_d = {};
                }
            }).catch(err=>{
                // to do
            })
        }
    },
    watch: {
        'portid'(){
            sessionStorage.setItem('portid',this.portid);
            switch(this.show_index){
                case 1:
                    this.get_pv_set();
                    break;
                case 2: 
                    this.get_pv_translate();
                    break;
                case 3: 
                    this.get_pv_qinq();
                    break;
            }
        }
    }
}
</script>

<style lang="less" scoped>
/**************  通用样式开始  ****************/
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
/****************  通用样式结束 ****************/
div.port-vlan{
    >div{
        margin: 20px 10px;
    }
}
div.portvlan-title{
    font-size: 24px;
    font-weight: bold;
    color: #67AEF7;
    a{
        margin-left: 80px;
    }
}
div.portvlan-port{
    margin-top: 30px !important;
    span{
        display: inline-block;
        padding-right: 20px;
        margin-left: 10px;
    }
    
}
div.portvlan-tab{
    margin-top: 30px !important;
    border-bottom: 2px solid #67aef7;
    padding-left: 10px;
    &::after{
        content: '';
        display: table;
        clear: both;
    }
    >div{
        float: left;
        margin-bottom: -2px;
        cursor: pointer;
        padding: 0 30px;
        text-align: center;
        height: 30px;
        line-height: 30px;
        border-bottom: 2px solid transparent;
    }
    .actived{
        border: 1px solid #67aef7;
        border-radius: 3px 3px 0 0;
        border-bottom: 2px solid #fff;
        color: #67aef7;
        font-weight: 600;
    }
}
</style>
