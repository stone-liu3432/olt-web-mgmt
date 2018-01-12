<template>
    <div class="onu-bandwidth">
        <div>
            <select v-model="portid">
                <option v-for="(item,key) in port_name.pon" :key="key" :value="item.id">
                    {{ item.name }}
                </option>
            </select>
        </div>
        <ul v-if="this.band_width.data">
            <li>
                <span v-for="(item,key) in this.band_width.data[0]" :key="key" v-if=" key != 'port_id'">
                    {{ lanMap[key] }}
                </span>
                <span>{{ lanMap['config'] }}</span>
            </li>
            <li v-for="(item,index) in this.band_width.data" :key="index">
                <span>{{ 'ONU0'+item.port_id +'/'+ item.onu_id }}</span>
                <span>{{ item.sla_type }}</span>
                <span>{{ item.fix }}</span>
                <span>{{ item.assure }}</span>
                <span>{{ item.max }}</span>
                <span>
                    <a href="javascript:;" @click="sla_config(item.onu_id)">{{ lanMap['config'] }}</a>
                </span>
            </li>
        </ul>
        <div v-else>当前端口下暂无ONU带宽信息</div>
        <div class="modal-dialog" v-if="isConfig">
            <div class="cover"></div>
            <div class="dialog" v-if="onu_detail.data">
                <h2>ONU配置</h2>
                <div class="dialog-item">
                    <span>{{ lanMap['onu_id'] }}</span>
                    <span>{{ 'ONU0'+onu_detail.data.port_id +'/'+onu_detail.data.onu_id }}</span>
                </div>
                <div class="dialog-item">
                    <span>{{ lanMap['sla_type'] }}</span>
                    <span>
                        <select class="sla-type" v-model="post_params.sla_type">
                            <option value="type1">type1</option>
                            <option value="type2">type2</option>
                            <option value="type3">type3</option>
                            <option value="type4">type4</option>
                            <option value="type5">type5</option>
                        </select> 
                    </span>
                </div>
                <div class="dialog-item">
                    <span>{{ lanMap['fix'] }}</span>
                    <span>
                        <input type="text" placeholder="0-1024 Mbps" class="sla-fix" v-model="post_params.fix">
                    </span>
                </div>
                <div class="dialog-item">
                    <span>{{ lanMap['assure'] }}</span>
                    <span>
                        <input type="text" placeholder="0-1024 Mbps" class="sla-assure" v-model="post_params.assure" disabled>
                    </span>
                </div>
                <div class="dialog-item">
                    <span>{{ lanMap['max'] }}</span>
                    <span>
                        <input type="text" placeholder="0-1024 Mbps" class="sla-max" v-model="post_params.max" disabled>
                    </span>
                </div>
                <div class="dialog-item">
                    <a href="javascript:;" @click="isChange(true)">{{ lanMap['apply'] }}</a>
                    <a href="javascript:;" @click="isChange(false)">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="closeModal"></div>
            </div>
            <div v-else class="failed">
                <p>获取数据失败，请刷新或稍后再试...</p>
                <div class="close" @click="closeModal"></div>
            </div>
        </div>
        <loading v-if="false"></loading>
    </div>
</template>

<script>
import loading from '@/components/common/loading'
import { mapState } from 'vuex'
    export default {
        name: 'slaCfg',
        components: { loading },
        data(){
            return {
                band_width: {},
                portid: 0,
                isConfig: false,
                post_params: {
                    "onu_id": 1,
                    "sla_type": '',
                    "fix": 0,
                    "assure": 0,
                    "max": 0
                },
                onu_detail: {}
            }
        },
        created(){
            // 请求 url: /onu_bandwidth?port_id=1  //  port_id =  this.$route.query.port_id
            //  '/onu_bandwidth?port_id=' + (this.$route.query.port_id || 1)  
            this.portid = this.$route.query.port_id || this.port_info.data[0].port_id;
            if(this.change_url.beta === 'test'){
                var url;
                if(this.change_url.onu_allow[this.change_url.onu_allow.length - 1] != '='){
                    url = this.change_url.bandwidth;
                }else{
                    url = this.change_url.bandwidth + this.portid;
                }
                this.$http.get(url).then(res=>{
                    this.band_width = res.data;
                }).catch(err=>{
                    // to do 
                })
            }
        },
        methods: {
            closeModal(){
                this.post_params.sla_type = '';
                this.isConfig = false;
            },
            // 点击设置按钮时执行的动作
            sla_config(uid){
                var url;
                if(this.change_url.beta === 'test'){
                    url = './onu-band-width.json';
                }else{
                    url = '/onu_bandwidth?port_id='+ this.portid +'&onu_id='+ uid;
                }
                this.$http.get(url).then(res=>{
                    if(res.data.code === 1){
                        this.onu_detail = res.data;
                        for(var key in this.onu_detail.data){
                            this.post_params[key] = this.onu_detail.data[key];
                        }
                    }else{
                        this.onu_detail = {};
                    }
                }).catch(err=>{
                    // to do
                })
                this.isConfig = true;
            },
            getData(){
                 this.$http.get('/onu_bandwidth?port_id='+ this.portid).then(res=>{
                    if(res.data.code === 1){
                        this.band_width = res.data;
                    }else{
                        this.band_width = {};
                    }
                }).catch(err=>{
                    // to do
                })
            },
            isChange(bool){
                if(bool){
                    // 点击确定时，收集数据，发送POST请求
                    var postData = {
                        "method":"set",
                        "param":{
                            "port_id": this.portid,
                            "onu_id": this.post_params.onu_id,
                            "sla_type": this.post_params.sla_type,
                            "fix":  this.post_params.fix,
                            "assure": this.post_params.assure,
                            "max": this.post_params.max
                        }
                    }
                    this.$http.post('/onu_bandwidth',postData).then(res=>{
                        if(res.data.code === 1){
                           this.getData();
                        }
                    }).catch(err=>{
                        // to do
                    })
                }
                this.post_params.sla_type = '';
                this.isConfig = false;
            }
        },
        computed: mapState(['lanMap','port_name','port_info','change_url']),
        watch: {
            portid(){
                this.getData();
            },
            'post_params.sla_type'(){
                setTimeout(()=>{
                    // sla_type类型不同时，不同的可设置选项
                    var sla_fix = document.querySelector('.sla-fix');
                    var sla_assure = document.querySelector('.sla-assure');
                    var sla_max = document.querySelector('.sla-max');
                    if(this.post_params.sla_type === 'type1'){
                        sla_assure.disabled = true;
                        sla_max.disabled = true;
                        sla_fix.disabled = false;
                    }else if(this.post_params.sla_type === 'type2'){
                        sla_fix.disabled = true;
                        sla_assure.disabled = false;
                        sla_max.disabled = true;
                    }else if(this.post_params.sla_type === 'type3'){
                        sla_fix.disabled = true;
                        sla_assure.disabled = false;
                        sla_max.disabled = false;
                    }else if(this.post_params.sla_type === 'type4'){
                        sla_fix.disabled = true;
                        sla_assure.disabled = true;
                        sla_max.disabled = false;
                    }else if(this.post_params.sla_type === 'type5'){
                        sla_fix.disabled = false;
                        sla_assure.disabled = false;
                        sla_max.disabled = false;
                    }
                },0)
            }
        }
    }
</script>

<style scoped>
.onu-bandwidth{
    margin-top: 30px;
}
ul{
    border:1px solid #ddd;
    margin-top: 30px;
    min-width: 1020px;
}
ul>li{
    font-size: 0;
    border-bottom: 1px solid #ddd;
}
ul>li:last-child{
    border-bottom: none;
}
li>div{
    border-top: 1px solid #ddd;
    height: 36px;
    line-height: 36px;
}
span{
    display: inline-block;
    width: 16%;
    text-align: center;
    font-size: 16px;
    line-height: 36px;
}
select{
    width: 140px;
    height: 32px;
    font-size: 16px;
    border-radius: 5px;
    text-indent: 10px;
}
a{
    display: inline-block;
    width: 120px;
    height: 26px;
    line-height: 26px;
    border-radius: 5px;
    background: #ddd;
    text-align: center;
    margin-left: 10px;
}
div.dialog{
    position: absolute;
    top: 0;
    right: 0;
    bottom : 0;
    left: 0;
    margin: auto;
    width: 500px;
    height: 370px;
    background: #fff;
    border-radius: 5px;
}
div.dialog>h2{
    margin: 20px 0;
    text-align: center;
    font-size: 22px;
    color: #67aef7;
}
div.dialog-item{
    margin: 10px;
}
div.dialog-item input{
    width: 140px;
}
div.dialog-item>span{
    display: inline-block;
    width: 40%;
}
div.dialog-item>a{
    margin-left: 75px;
    margin-top: 15px;
}
div.failed{
    position: absolute;
    top: 0;
    right: 0;
    bottom : 0;
    left: 0;
    margin: auto;
    width: 500px;
    height: 370px;
    background: #fff;
    border-radius: 5px;
}
div.failed>p{
    color: red;
    padding: 20px 0 0 20px;
}
input[disabled]{
    cursor: not-allowed;
}
</style>