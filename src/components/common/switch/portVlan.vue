<template>
    <div class="port-vlan" v-if="port_name.pon && port_name.ge">
        <div class="portvlan-title">
            <h2>
                {{ lanMap['port_vlan'] }}
            </h2>
            <span>{{ lanMap['port_id'] }}</span>
            <select v-model.number="portid">
                <option v-for="(item,index) in port_name.pon" :key="index" :value="item.id">{{ item.name }}</option>
                <option v-for="(item,index) in port_name.ge" :key="index" :value="item.id">{{ item.name }}</option>
                <option v-if="port_name.xge" v-for="(item,index) in port_name.xge" :key="index" :value="item.id">{{ item.name }}</option>
            </select>
            <a href="javascript:void(0);" @click="refresh_page">{{ lanMap['refresh'] }}</a>
        </div>
        <hr>
        <tabBar :tab="['vlan_cfg','VLAN Translate','VLAN QinQ']" @togglePage="select_page"></tabBar>
        <div>
            <pvSet :pv-data="pv_set_d" v-if="show_index === 'vlan_cfg' && pv_set_d.data"></pvSet>
            <pvTranslate :pv-data="pv_translate_d" v-if="show_index === 'VLAN Translate'"></pvTranslate>
            <pvQinq :pv-data="pv_qinq_d" v-if="show_index === 'VLAN QinQ'"></pvQinq>
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
            show_index: 'vlan_cfg',
            pv_set_d: {},
            pv_translate_d: {},
            pv_qinq_d: {}
        }
    },
    created(){
        var portid = sessionStorage.getItem('portid');
        this.portid = Number(portid) || 1;
    },
    activated(){
        switch(this.show_index){
            case 'vlan_cfg':
                this.get_pv_set();
                break;
            case 'VLAN Translate': 
                this.get_pv_translate();
                break;
            case 'VLAN QinQ': 
                this.get_pv_qinq();
                break;
        }
    },
    methods: {
        select_page(page){
            this.show_index = page;
            switch(page){
                case 'vlan_cfg':
                    this.get_pv_set();
                    break;
                case 'VLAN Translate': 
                    this.get_pv_translate();
                    break;
                case 'VLAN QinQ': 
                    this.get_pv_qinq();
                    break;
            }
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
        },
        refresh_page(){
            switch(this.show_index){
                case 'vlan_cfg':
                    this.get_pv_set();
                    break;
                case 'VLAN Translate': 
                    this.get_pv_translate();
                    break;
                case 'VLAN QinQ': 
                    this.get_pv_qinq();
                    break;
            }
        }
    },
    watch: {
        'portid'(){
            sessionStorage.setItem('portid',Number(this.portid));
            switch(this.show_index){
                case 'vlan_cfg':
                    this.get_pv_set();
                    break;
                case 'VLAN Translate': 
                    this.get_pv_translate();
                    break;
                case 'VLAN QinQ': 
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
    width: 120px;
    padding: 0;
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
    >div:first-child{
        margin: 20px 0;
    }
    >div{
        margin: 0 0 0 10px;
    }
}
div.portvlan-title{
    h2{
        font-size: 24px;
        font-weight: 600;
        color: #67aef6;
        float: left;
        width: 300px;
    }
    a{
        margin-left: 80px;
    }
    select{
        margin-left: 6px;
    }
}
div.portvlan-port{
    margin-top: 30px !important;
    span{
        display: inline-block;
        padding-right: 20px;
    }
    
}
div.portvlan-tab{
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
</style>
