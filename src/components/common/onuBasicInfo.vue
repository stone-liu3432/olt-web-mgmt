<template>
    <div>
		<div class="onu-basic-info" v-if="port_name.pon">
			<h2>{{ lanMap['onu_basic_info'] }}</h2>
			<div>
				<span>{{ lanMap['port_id'] }}</span>
				<select v-model.number="portid">
					<option v-for="(item,index) in port_name.pon" :value="item.id">{{ item.name }}</option>
				</select>
			</div>
			<div v-if="onu_list.data">
				<span>{{ lanMap['onu_id'] }}</span>
				<select v-model.number="onuid">
					<option v-for="(item,index) in onu_list.data" :value="item">{{ 'ONU'+ onu_list.port_id + '/' + item }}</option>
				</select>
			</div>
            <div v-else class="error-msg">{{ lanMap['no_onu_info'] }}</div>
		</div>
		<hr>
        <div class="handle-btn" v-if="onu_basic_info.data">
            <h3 class="lf">{{ lanMap['onu_mgmt'] }}</h3>
            <div class="lf">
                <a href="javascript:;" @click="open_reboot_onu">{{ lanMap['reboot_onu'] }}</a>
                <a href="javascript:;" @click="open_un_auth_onu" v-if="onu_basic_info.data.auth_state.toUpperCase() == 'TRUE'">{{ lanMap['deregister_onu'] }}</a>
                <a href="javascript:;" @click="open_set_fec_mode">{{ lanMap['set_fec_mode'] }}</a>
            </div>
        </div>
        <div>
            <div class="lf onu-info">
                <div v-for="(item,key) in onu_basic_info.data" :key="key" v-if=" key != 'port_id' && onu_basic_info.data" class="onu-info-item">
                    <span>
                        {{ lanMap[key] }}
                    </span>
                    <span>
                        {{ item }}
                    </span>
                </div>
                <div class="onu-info-item" v-for="(item,key) in onu_fec_mode.data" :key="key" v-if="onu_fec_mode.data && onu_basic_info.data">
                    <span>{{ key.replace(/_/,'-') }}</span>
                    <span>{{ item ? 'Enable' : 'Disable' }}</span>
                </div>
            </div>
            <div class="lf onu-optical-diagnose">
                <div>
                    <div class="onu-optical-title">
                        <span>{{ lanMap['onu_optical_diagnose'] }}</span>
                        <a href="javascript:;" class="rt" @click="getOpticalData()">{{ lanMap['refresh'] }}</a>
                    </div>
                    <div class="onu-optical" v-for="(item,key) in optical_diagnose.data" :key="key" v-if="key != 'port_id' && key !== 'onu_id' && optical_diagnose.data">
                        <span>{{ lanMap[key] }}</span>
                        <span>{{ item }}</span>
                    </div>
                    <div v-else class="no-more-data">{{ lanMap['flush_page_retry'] }}</div>
                </div>
            </div>
        </div>
        
        <confirm :tool-tips="lanMap['confirm_reboot_onu'] + '?'" @choose="reboot_onu" v-if="reboot_onu_confirm"></confirm>
        <confirm :tool-tips="lanMap['confirm_deresgester'] + '?'" @choose="un_auth_onu" v-if="un_auth_confirm"></confirm>
        <confirm :tool-tips="lanMap['confirm_change_fecmode'] + '?'" @choose="set_fec_mode" v-if="set_fec_confirm"></confirm>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
import confirm from '@/components/common/confirm'
    export default {
        name: 'onuBasicInfo',
        components: { confirm },
		computed: mapState(['lanMap','port_name','port_info','change_url','onu_list']),
        data(){
            return {
                onu_basic_info: {},
                onu_fec_mode: {},
				portid: 0,
                onuid: 0,
                //  确认模态框 *3
                reboot_onu_confirm: false,
                un_auth_confirm: false,
                set_fec_confirm: false,
                optical_diagnose: {}
            }
        },
        created(){
            this.portid = this.$route.query.port_id || this.port_info.data[0].port_id;
            if(this.change_url.beta === 'test'){
                this.$http.get('./onu_resource.json').then(res=>{
                    if(res.data.code === 1){
                        var _onu_list = this.analysis(res.data.data.resource);
                        if(!_onu_list) return
                        var obj = {
                            port_id: res.data.data.port_id,
                            data: _onu_list
                        }
                        this.addonu_list(obj);
                        this.onuid = this.$route.query.onu_id || this.onu_list.data[0];
                        this.$http.get('./onu_basic_info.json').then(res=>{
                            this.onu_basic_info = res.data;
                            this.$http.get('./onu_fec_mode.json').then(res=>{
                                this.onu_fec_mode = res.data;
                            }).catch(err=>{
                                // to do
                            })
                        }).catch(err=>{
                            // to do
                        })
                    }else{
                        this.addonu_list({});
                    }
                }).catch(err=>{
                    // to do
                })
            }
		},
		methods:{
            ...mapMutations({
                addonu_list: 'updateOnuList'
            }),
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
            },
            open_reboot_onu(){
                this.reboot_onu_confirm = true;
            },
            //  重启ONU
            reboot_onu(bool){
                if(bool){
                    var post_param = {
                        "method":"set",
                        "param":{
                            "port_id": this.portid,
                            "onu_id": this.onuid,
                            "flags": 1,
                            "fec_mode": this.onu_fec_mode.data.fec_mode ? 0 : 1
                        }
                    }
                    this.post_data(post_param);
                }
                this.reboot_onu_confirm = false;
            },
            open_un_auth_onu(){
                this.un_auth_confirm = true;
            },
            //  解注册 ONU
            un_auth_onu(bool){
                if(bool){
                    var post_param = {
                        "method":"set",
                        "param":{
                            "port_id": this.portid,
                            "onu_id": this.onuid,
                            "flags": 2,
                            "fec_mode": this.onu_fec_mode.data.fec_mode ? 0 : 1
                        }
                    }
                    this.post_data(post_param);
                }
                this.un_auth_confirm = false;
            },
            open_set_fec_mode(){
                this.set_fec_confirm = true;
            },
            //  fec_mode
            set_fec_mode(bool){
                if(bool){
                    var post_param = {
                        "method":"set",
                        "param":{
                            "port_id": this.portid,
                            "onu_id": this.onuid,
                            "flags": 4,
                            "fec_mode": this.onu_fec_mode.data.fec_mode ? 0 : 1
                        }
                    }
                    this.post_data(post_param);
                }
                this.set_fec_confirm = false;
            },
            post_data(data){
                this.$http.post('/onumgmt?form=config',data).then(res=>{
                    if(res.data.code === 1){
                        this.$message({
                            type: 'success',
                            text: this.lanMap['setting_ok']
                        })
                        this.getData();
                    }else if(res.data.code >1){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['setting_fail']
                        })
                    }
                }).catch(err=>{
                    // to do
                })
            },
            getData(){
                this.$http.get('/onumgmt?form=base-info&port_id='+this.portid+'&onu_id='+this.onuid).then(res=>{
                    if(res.data.code === 1){
                        this.onu_basic_info = res.data;
                    }else{
                        this.onu_basic_info = {};
                    }
				}).catch(err=>{
					// to do
                })
                this.$http.get('/onumgmt?form=config&port_id='+this.portid+'&onu_id='+this.onuid).then(res=>{
                    if(res.data.code === 1){
                        this.onu_fec_mode = res.data;
                    }else{
                        this.onu_fec_mode = {};
                    }
                }).catch(err=>{
                    // to do
                })
            },
            getOpticalData(){
                this.$http.get("/onumgmt?form=optical-diagnose&port_id="+this.portid+"&onu_id="+this.onuid).then(res=>{
                    if(res.data.code === 1){
                        this.optical_diagnose = res.data;
                    }else{
                        this.optical_diagnose = {};
                    }
                }).catch(err=>{
                    // to do
                })
            }
		},
		watch: {
			portid(){
            	// 请求url:  请求url: /onumgmt?form=base-info&port_id=1&onu_id=1
             var _onuid = this.onuid;
				this.$http.get('/onu_allow_list?form=resource&port_id='+this.portid).then(res=>{
					if(res.data.code === 1){
                        var _onu_list = this.analysis(res.data.data.resource);
                        if(!_onu_list){
                             this.addonu_list({});
                             this.onu_basic_info = {};
                             this.onuid = 0;
                             return
                        }
                        var obj = {
                            port_id: res.data.data.port_id,
                            data: _onu_list
                        }
                        this.addonu_list(obj);
                        this.onuid = this.$route.query.onu_id || this.onu_list.data[0];
                        if(this.$route.query.onu_id){
                            this.$route.query.onu_id = null;
                        }
                        if(_onuid === this.onuid){
                            this.getData();
                        }
                    }else{
                        this.addonu_list({});
                        this.onu_basic_info = {}; 
                        this.onuid = 0;
                    }
				}).catch(err=>{
					// to do
				})
			},
			onuid(){
            	// 请求url:  请求url: /onumgmt?form=base-info&port_id=1&onu_id=1
              if(this.onuid === 0) return   
				 this.getData();
              this.getOpticalData();
			}
		}
    }
</script>

<style scoped lang="less">
.onu-basic-info{
	padding:20px 0 20px 30px; 
}
.onu-basic-info>h2{
	float: left;
	width: 200px;
	font-size: 20px;
	font-weight: 600;
	color: 	#67AEF7;
}
.onu-basic-info>div{
	float: left;
}
div.onu-basic-info>div>span{
	padding: 0 30px;
}
.onu-basic-info:after{
	display: table;
	content: "";
	clear: both;
}
select{
	width: 120px;
	height: 30px;
	text-indent: 5px;
	font-size: 16px;
	margin-left: 40px;
}
hr{
	margin-bottom: 30px;
}
div.onu-info{
    width: 60%;
}
div.onu-info-item{
    border: 1px solid #ccc;
    border-bottom: none;
}
div.onu-info-item>span{
	display: inline-block;
	vertical-align: middle;
	height: 30px;
	line-height: 30px;
	width: 30%;
	padding-left: 20px;
}
div.onu-optical-diagnose{
    overflow: hidden;
    width: 40%;
    >div{
        margin-left: 20px;
        border: 1px solid #ccc;
    }
}
div.onu-optical-title{
    height: 30px;
    line-height: 30px;
    padding: 20px 0;
    vertical-align: middle;
    border-bottom: 1px solid #ccc;
    >span:first-child{
        margin-left: 40px;
        font-weight: 600;
        color: #67AEF7;
        border: none;
    }
    >a{
        width: 120px;
        height: 30px;
        display: inline-block;
        text-align: center;
        border-radius: 5px;
        background: #ddd;
        margin-right: 20px;
    }
}
div.onu-optical{
    height: 30px;
    line-height: 30px;
    border-bottom: 1px solid #ccc;
    &:last-child{
        border: none;
    }
    >span{
        display: inline-block;
        width: 40%;
        &:first-child{
            margin: 0;
            border: none;
            border-right: 1px solid #ccc;
        }
        &:last-child{
            padding-left: 10px;
        }
    }
}
div.no-more-data{
    margin: 20px;
    color: red;
}
div>span:first-child{
	text-align: right;
	padding-right: 50px;
	padding-left: 0;
	border-right: 1px solid #ccc;
}
div.error-msg{
    margin-left: 30px;
    height: 30px;
    line-height: 30px;
    color: red;
}
div#detail div.onu-info-item:last-child{
    border: 1px solid #ccc;
}
div.handle-btn{
    margin: 20px;
    &:after{
        content: "";
        display: table;
        clear: both;
    }
    &+div{
        overflow: hidden;
    }
    h3{
        font-size: 18px;
        height: 30px;
        font-weight: 500;
        line-height: 30px;
        color: #67AEF7;
    }
    >div{
        margin-left: 30px;
        >a{
            margin-left: 50px;
            display: inline-block;
            width: 150px;
            text-align: center;
            height: 30px;
            line-height: 30px;
            border: 1px solid transparent;
            border-radius: 5px;
            background: #ddd;
            &:active{
                border-color: #67aef7;
            }
        }
    }
}
</style>