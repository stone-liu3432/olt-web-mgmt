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
            <h3>{{ 'ONU' + port_name.pon[portid].id + '/' + onuid + ' ' + lanMap['port_info'] }}</h3>
            <div>
                <span v-for="(item,index) in onu_port_info.data[0]" :key="index">{{ index }}</span>
            </div>
            <div v-for="(item,key) in onu_port_info.data" :key="key">
                <span v-for="(_item,_key) in item" :key="_key">{{ _item }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
    export default {
        name: 'onuPortCfg',
        computed: mapState(['port_name','lanMap']),
        data(){
            return {
                portid: 0,
                onuid: 0,
                onu_list: {},
                onu_port_info: {
                    "code":1,	
                    "message":"success",
                    "data":[{
                        "op_id":1,
                        "autoneg":1,
                        "flowctrl":1,
                        "loopdetect":1,
                        "enable":1,
                        "rlds_opt":1,
                        "rl_cir":1,
                        "rl_pir":1,
                        "rlus_opt":1,
                        "bandwidth":1
                    }]
                }
            }
        },
        created(){
            this.portid = this.port_name.pon['1'].id;
        },
        methods: {
            getData(){
                this.$http.get('/onumgmt?form=port_cfg&port_id='+this.portid+'&onu_id=' + this.onuid).then(res=>{
                    if(res.data.code === 1){
                        this.onu_port_info = res.data;
                    }else{
                        this.onu_list_info = {};
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
            //             var obj = {
            //                 port_id: res.data.data.port_id,
            //                 data: _onu_list
            //             }
            //             this.onuid = this.onu_list.data[0];
            //             if(_onuid === this.onuid){
            //                 this.getData();
            //             }
            //         }else{
            //             this.onu_list = {};
            //         }
            //     }).catch(err=>{
            //         // to do
            //     })
            // },
            // onuid(){
            //     this.getData();
            // }
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
    >h3{
        margin: 20px;
        font-size: 18px;
        color: #67aef7;
        font-weight: 500;
    }
    >div{
        height: 36px;
        line-height: 36px;
        &:last-child>span{
            border-top: none;
        }
        >span{
            display: inline-block;
            vertical-align: top;
            width: 9.5%;
            text-align: center;
            border: 1px solid #ccc;
        }
    }
}
</style>
