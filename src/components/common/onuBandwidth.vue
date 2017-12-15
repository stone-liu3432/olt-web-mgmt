<template>
    <div class="onu-bandwidth">
        <div>
            <select @change="changePon($event)" v-model="_portid">
                <option v-for="(item,key) in port_name.pon" :key="key" :value="item.id">
                    {{ item.name }}
                </option>
            </select>
        </div>
        <ul v-if="this.bound_width.data">
            <li>
                <span v-for="(item,key) in this.bound_width.data[0]" :key="key" v-if=" key != 'onu_id'">
                    {{ lanMap[key] }}
                </span>
                <span>{{ lanMap['config'] }}</span>
            </li>
            <li v-for="(item,index) in this.bound_width.data" :key="index">
                <span>{{ 'ONU0'+item.port_id +'/'+ item.onu_id }}</span>
                <span>{{ item.sla_type }}</span>
                <span>{{ item.fix }}</span>
                <span>{{ item.assure }}</span>
                <span>{{ item.max }}</span>
                <span>
                    <a href="javascript:;" @click="sla_config(item)">{{ lanMap['config'] }}</a>
                </span>
                <!-- params:[ onu_id type fix assure max ] -->
                <div v-if="isConfig.port_id === item.port_id && isConfig.onu_id === item.onu_id">
                    <span>{{ 'ONU0'+item.port_id +'/'+ item.onu_id }}</span>
                    <span>
                        <select @change="handle($event)" class="sla-type">
                            <option value="type1">type1</option>
                            <option value="type2">type2</option>
                            <option value="type3">type3</option>
                            <option value="type4">type4</option>
                            <option value="type5">type5</option>
                        </select> 
                    </span>
                    <span>
                        <input type="text" placeholder="0-1024 Mbps" class="sla-fix" v-model="post_params.fix">
                    </span>
                    <span>
                        <input type="text" placeholder="0-1024 Mbps" class="sla-assure" v-model="post_params.assure" disabled>
                    </span>
                    <span>
                        <input type="text" placeholder="0-1024 Mbps" class="sla-max" v-model="post_params.max" disabled>
                    </span>
                    <span>
                        <a href="javascript:;" @click="isChange(item,true)">{{ lanMap['apply'] }}</a>
                        <a href="javascript:;" @click="isChange(item,false)">{{ lanMap['cancel'] }}</a>
                    </span>
                </div>
            </li>
        </ul>
        <loading v-if="false"></loading>
    </div>
</template>

<script>
import loading from '@/components/common/loading'
import { mapState } from 'vuex'
    export default {
        name: 'onuBandwidth',
        components: { loading },
        data(){
            return {
                bound_width: {},
                _portid: 1,
                isConfig: {
                    port_id: 0,
                    onu_id: 0
                },
                post_params: {
                    "sla_type": '',
                    "fix": 0,
                    "assure": 0,
                    "max": 0
                }
            }
        },
        created(){
            // 请求 url: /onu_bandwidth?port_id=1  //  port_id =  this.$route.query.port_id
            //  '/onu_bandwidth?port_id=' + (this.$route.query.port_id || 1)  
            this._portid = this.$route.query.port_id || this.port_info.data[0].port_id;
            this.$http.get('./onuBandwidth.json').then(res=>{
                this.bound_width = res.data;
            }).catch(err=>{
                // to do 
            })
        },
        methods: {
            changePon(e){
                this._portid = e.target.value;
                // 选择不同的pon口时，获取数据
                this.getData();
            },
            // 点击设置按钮时执行的动作
            sla_config(node){
                // 收集数据，动态绑定
                this.post_params.sla_type = node.sla_type;
                this.post_params.fix = node.fix;
                this.post_params.max = node.max;
                this.post_params.assure = node.assure;
                // 点击隐藏打开效果
                if(!this.isConfig.port_id && !this.isConfig.onu_id){
                    this.isConfig.port_id = node.port_id;
                    this.isConfig.onu_id = node.onu_id;
                }else{
                    this.isConfig.port_id = 0;
                    this.isConfig.onu_id = 0; 
                }
            },
            isChange(node,bool){
                if(bool){
                    // 点击确定时，收集数据，发送POST请求
                    var postData = {
                        "method":"set",
                        "param":{
                            "port_id": node.port_id,
                            "onu_id": node.onu_id,
                            "sla_type": this.post_params.sla_type,
                            "fix":  this.post_params.fix,
                            "assure": this.post_params.assure,
                            "max": this.post_params.max
                        }
                    }
                    // console.dir(postData);
                    this.$http.post('/onu_bandwidth',postData).then(res=>{
                        // to do
                    }).catch(err=>{
                        // to do 
                    })
                }
                this.isConfig.port_id = 0;
                this.isConfig.onu_id = 0;
            },
            getData(){
                this.$http.get('/onu_bandwidth?port_id=' + this._portid).then(res=>{
                    // this.bound_width = res.data;
                }).catch(err=>{
                    // to do
                })
            },
            // 下拉切换sla_type类型时的动作
            handle(e){
                // 切换sla_type时，动态绑定到 data
                this.post_params.sla_type = e.target.value;
                // sla_type类型不同时，不同的可设置选项
                var sla_fix = document.querySelector('.sla-fix');
                var sla_assure = document.querySelector('.sla-assure');
                var sla_max = document.querySelector('.sla-max');
                if(e.target.value === 'type1'){
                    sla_assure.disabled = true;
                    sla_max.disabled = true;
                    sla_fix.disabled = false;
                }else if(e.target.value === 'type2'){
                    sla_fix.disabled = true;
                    sla_assure.disabled = false;
                    sla_max.disabled = true;
                }else if(e.target.value === 'type3'){
                    sla_fix.disabled = true;
                    sla_assure.disabled = false;
                    sla_max.disabled = false;
                }else if(e.target.value === 'type4'){
                    sla_fix.disabled = true;
                    sla_assure.disabled = true;
                    sla_max.disabled = false;
                }else if(e.target.value === 'type5'){
                    sla_fix.disabled = false;
                    sla_assure.disabled = false;
                    sla_max.disabled = false;
                }
            }
        },
        computed: mapState(['lanMap','port_name','port_info'])
    }
</script>

<style scoped>
.onu-bandwidth{
    margin: 30px 0 0 30px;
}
ul{
    border:1px solid #ddd;
    margin-top: 30px;
    width: 1160px;
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
div>span{
    width: 16%;
}
div>span>input{
    margin-left: 15%;
    width: 80%;
}
div>span>a{
    width: 40%;
}
span{
    display: inline-block;
    width: 16%;
    text-align: center;
    font-size: 16px;
    line-height: 36px;
}
input{
    margin-left:20px;
}
select{
    width: 160px;
    height: 36px;
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
</style>