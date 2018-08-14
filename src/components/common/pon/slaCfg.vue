<template>
    <div class="onu-bandwidth">
        <h2>{{ lanMap['sla_cfg'] }}</h2>
        <div>
            <select v-model.number="portid">
                <option v-for="(item,key) in port_name.pon" :key="key" :value="item.id">
                    {{ item.name }}
                </option>
            </select>
        </div>
        <ul v-if="band_width.data && band_width.data.length > 0">
            <li>
                <span v-for="(item,key) in this.band_width.data[0]" :key="key" v-if=" key != 'port_id'">
                    {{ lanMap[key] }}
                </span>
                <span>{{ lanMap['config'] }}</span>
            </li>
            <li v-for="(item,index) in this.band_width.data" :key="index">
                <span>{{ 'ONU0'+item.port_id +'/'+ item.onu_id }}</span>
                <span>{{ item.sla_type }}</span>
                <span v-if="item.sla_type === 'type1' || item.sla_type === 'type5'">{{ item.fix }}</span>
                <span v-else> - </span>
                <span v-if="item.sla_type === 'type2' || item.sla_type === 'type3' || item.sla_type === 'type5'">{{ item.assure }}</span>
                <span v-else> - </span>
                <span v-if="item.sla_type === 'type3' || item.sla_type === 'type4' || item.sla_type === 'type5'">{{ item.max }}</span>
                <span v-else> - </span>
                <span>
                    <a href="javascript:;" @click="sla_config(item.onu_id)">{{ lanMap['config'] }}</a>
                </span>
            </li>
        </ul>
        <p v-else class="nodata-bandwidth">{{ lanMap['onu_bw_fail_info'] }}</p>
        <div class="modal-dialog" v-if="isConfig">
            <div class="cover"></div>
            <div class="dialog" v-if="onu_detail.data">
                <h2>{{ lanMap['onu_cfg'] }}</h2>
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
                    <!-- 提示框，鼠标移入弹出 -->
                    <span class="dialog-tips">
                        <i class="icon-tips"></i>
                        <div class="slc-type-tips">
                            <p>{{ lanMap['diff_type_cfg'] }}</p>
                            <div>
                                 <div>
                                    <span>type</span>
                                    <span>{{ this.lanMap['fix'] }}</span>
                                    <span>{{this.lanMap['assure'] }}</span>
                                    <span>{{ this.lanMap['max'] }}</span>
                                </div>
                                <div>
                                    <span>type1</span>
                                    <span>&radic;</span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div>
                                    <span>type2</span>
                                    <span></span>
                                    <span>&radic;</span>
                                    <span></span>
                                </div>
                                <div>
                                    <span>type3</span>
                                    <span></span>
                                    <span>&radic;</span>
                                    <span>&radic;</span>
                                </div>
                                <div>
                                    <span>type4</span>
                                    <span></span>
                                    <span></span>
                                    <span>&radic;</span>
                                </div>
                                <div>
                                    <span>type5</span>
                                    <span>&radic;</span>
                                    <span>&radic;</span>
                                    <span>&radic;</span>
                                </div>
                            </div>
                        </div>
                    </span>
                </div>
                <div class="dialog-item">
                    <span>{{ lanMap['fix'] }}</span>
                    <span>
                        <input type="text" placeholder="1-1000 Mbps" class="sla-fix" v-model.number="post_params.fix"
                        :style="{ 'border-color': post_params.fix !== '' && (post_params.sla_type === 'type1' || post_params.sla_type === 'type5')
                        && (post_params.fix <1 || post_params.fix > 1000000 || isNaN(post_params.fix)) ? 'red' : '' }">
                    </span>
                    <span class="tips">range: 1-1000000kbs</span>
                </div>
                <div class="dialog-item">
                    <span>{{ lanMap['assure'] }}</span>
                    <span>
                        <input type="text" placeholder="1-1000 Mbps" class="sla-assure" v-model.number="post_params.assure" disabled
                        :style="{ 'border-color': post_params.assure !== '' && (post_params.sla_type === 'type2' || post_params.sla_type === 'type3' || post_params.sla_type === 'type5')
                         && (post_params.assure <1 || post_params.assure > 1000000 || isNaN(post_params.assure)) ? 'red' : '' }">
                    </span>
                    <span class="tips">range: 1-1000000kbs</span>
                </div>
                <div class="dialog-item">
                    <span>{{ lanMap['max'] }}</span>
                    <span>
                        <input type="text" placeholder="1-1000 Mbps" class="sla-max" v-model.number="post_params.max" disabled
                        :style="{ 'border-color': post_params.max !== '' && (post_params.sla_type === 'type3' || post_params.sla_type === 'type4' || post_params.sla_type === 'type5')
                        && (post_params.max <1 || post_params.max > 1000000 || isNaN(post_params.max)) ? 'red' : '' }">
                    </span>
                    <span class="tips">range: 1-1000000kbs</span>
                </div>
                <div class="dialog-item">
                    <a href="javascript:;" @click="isChange(true)">{{ lanMap['apply'] }}</a>
                    <a href="javascript:;" @click="isChange(false)">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="closeModal"></div>
            </div>
            <div v-else class="failed">
                <p>{{ lanMap['get_data_fail'] }}</p>
                <div class="close" @click="closeModal"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
    export default {
        name: 'slaCfg',
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
            //  '/onu_bandwidth?port_id=' + (this.$route.query.port_id || 1)
            var pid = sessionStorage.getItem('pid');
            this.portid = this.$route.query.port_id || pid || 1;
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
        activated(){
            this.getData();
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
                        this.isConfig = true;
                        this.onu_detail = res.data;
                        for(var key in this.onu_detail.data){
                            this.post_params[key] = this.onu_detail.data[key];
                        }
                    }else if(res.data.code >1){
                        this.onu_detail = {};
                    }
                }).catch(err=>{
                    // to do
                })
            },
            getData(){
                 this.$http.get('/onu_bandwidth?port_id='+ this.portid).then(res=>{
                    if(res.data.code === 1){
                        this.band_width = res.data;
                    }else if(res.data.code >1){
                        this.band_width = {};
                    }
                }).catch(err=>{
                    // to do
                })
            },
            //  带宽配置  -->  确定按钮
            isChange(bool){
                if(bool){
                    if(this.onu_detail.data.fix === this.post_params.fix && this.onu_detail.data.assure === this.post_params.assure 
                    && this.onu_detail.data.max === this.post_params.max && this.onu_detail.data.sla_type === this.post_params.sla_type){
                        this.$message({
                            type: 'info',
                            text: this.lanMap['modify_tips']
                        })
                        return
                    }
                    if((this.post_params.sla_type === 'type1' || this.post_params.sla_type === 'type5') && 
                        (this.post_params.fix < 1 || this.post_params.fix > 1000000 || isNaN(this.post_params.fix))){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['fix_range_err']
                        })
                        return
                    }
                    if( (this.post_params.sla_type === 'type2' || this.post_params.sla_type === 'type3' || this.post_params.sla_type === 'type5') &&
                        (this.post_params.assure < 1 || this.post_params.assure > 1000000 || isNaN(this.post_params.assure))){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['assure_range_err'] 
                        })
                        return
                    }
                    if( (this.post_params.sla_type === 'type3' || this.post_params.sla_type === 'type4' || this.post_params.sla_type === 'type5') &&
                        (this.post_params.max < 1 || this.post_params.max > 1000000 || isNaN(this.post_params.max))){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['max_range_err']
                        })
                        return
                    }
                    if((this.post_params.sla_type === 'type3' || this.post_params.sla_type === 'type5') && 
                        (this.post_params.fix > this.post_params.assure || this.post_params.fix > this.post_params.max)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['fix_param_err']
                        })
                        return 
                    }
                    if(this.post_params.assure > this.post_params.max){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['assure_param_err']
                        })
                        return
                    }
                    // 点击确定时，收集数据，发送POST请求
                    var post_param = {
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
                    this.$http.post('/onu_bandwidth',post_param).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: 'success',
                                text: this.lanMap['setting_ok']
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
                this.post_params.sla_type = '';
                this.isConfig = false;
            }
        },
        computed: mapState(['lanMap','port_name','port_info','change_url']),
        watch: {
            portid(){
                sessionStorage.setItem('pid',this.portid);
                this.getData();
            },
            'post_params.sla_type'(){
                if(this.isConfig){
                    //  延时，等待DOM加载完成再进行操作
                    this.$nextTick(()=>{
                        for(var key in this.onu_detail.data){
                            if(key !== 'sla_type'){
                                this.post_params[key] = this.onu_detail.data[key];
                            }
                        }
                        var sla_fix = document.querySelector('.sla-fix');
                        var sla_assure = document.querySelector('.sla-assure');
                        var sla_max = document.querySelector('.sla-max');
                        if(this.post_params.sla_type === 'type1'){
                            sla_assure.disabled = true;
                            sla_max.disabled = true;
                            sla_fix.disabled = false;
                            this.post_params.assure = ' - ';
                            this.post_params.max = ' - ';
                        }else if(this.post_params.sla_type === 'type2'){
                            sla_fix.disabled = true;
                            sla_assure.disabled = false;
                            sla_max.disabled = true;
                            this.post_params.fix = ' - ';
                            this.post_params.max = ' - ';
                        }else if(this.post_params.sla_type === 'type3'){
                            sla_fix.disabled = true;
                            sla_assure.disabled = false;
                            sla_max.disabled = false;
                            this.post_params.fix = ' - ';
                        }else if(this.post_params.sla_type === 'type4'){
                            sla_fix.disabled = true;
                            sla_assure.disabled = true;
                            sla_max.disabled = false;
                            this.post_params.assure = ' - ';
                            this.post_params.fix = ' - ';
                        }else if(this.post_params.sla_type === 'type5'){
                            sla_fix.disabled = false;
                            sla_assure.disabled = false;
                            sla_max.disabled = false;
                        }
                    })
                }
            }
        }
    }
</script>

<style scoped lang="less">
.onu-bandwidth{
    margin-top: 20px;
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
div.onu-bandwidth>p.nodata-bandwidth{
    margin: 20px;
    color: red;
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
    width: 120px;
    padding: 0;
    margin-left: 10px;
}
div.dialog{
    width: 600px;
    height: 380px;
}
div.dialog>h2{
    margin: 20px 0;
    text-align: center;
    font-size: 22px;
    color: #67aef7;
}
div.dialog-item{
    margin: 10px;
    height: 36px;
    line-height: 36px;
}
div.dialog-item input{
    width: 140px;
}
div.dialog-item>span{
    display: inline-block;
    width: 30%;
}
div.dialog-item>span.tips{
    text-align: left;
    font-size: 14px;
    color: #666;
}
div.dialog-item>a{
    margin-left: 115px;
    margin-top: 20px;
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
div.dialog-item>span.dialog-tips{
    position: relative;
    vertical-align: middle;
    height: 36px;
    text-align: left;
    width: 32px;
}
i.icon-tips{
    display: inline-block;
    width: 32px;
    height: 32px;
    background: url('../../../assets/tips.png') no-repeat;
}
span.dialog-tips:hover div.slc-type-tips{
    display: block;
}
div.slc-type-tips{
    display: none;
    position: absolute;
    left: 40px;
    top: 10px;
    width: 300px;
    background: #eee;
    border: 1px solid #67aef7;
    color: #555;
    border-radius: 3px;
    >p{
        text-align: center;
        color: #67aef7;
    }
    >div{
        margin: 5px;
        border: 1px solid #aaa;
        >div{
            font-size: 0;
            height: 24px;
            border-bottom: 1px solid #aaa;
            vertical-align: middle;
            &:last-child{
                border-bottom: 0;
            }
            >span{
                width: 24%;
                font-size: 16px;
                display: inline-block;
                height: 24px;
                line-height: 24px;
                vertical-align: top;
                border-right: 1px solid #aaa;
                &:last-child{
                    border-right: 0;
                }
            }
        }
    }
}
div.onu-bandwidth>h2{
	font-size: 20px;
	font-weight: 600;
	color: 	#67AEF7;
    margin: 10px 0 20px 10px;
}
</style>