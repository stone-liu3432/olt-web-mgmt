<template>
    <div>
		<div class="onu-basic-info" v-if="port_name.pon">
			<h2>{{ lanMap['onu_basic_info'] }}</h2>
			<div>
				<span>{{ lanMap['port_id'] }}</span>
				<select v-model="portid">
					<option v-for="(item,index) in port_name.pon" :value="item.id">{{ item.name }}</option>
				</select>
			</div>
			<div v-if="onu_list.data">
				<span>{{ lanMap['onu_id'] }}</span>
				<select v-model="onuid">
					<option v-for="(item,index) in onu_list.data" :value="item">{{ 'ONU'+ onu_list.port_id + '/' + item }}</option>
				</select>
			</div>
            <div v-else class="error-msg">当前PON口下暂无ONU信息...</div>
		</div>
		<hr>
        <div v-for="(item,key) in onu_basic_info.data" :key="key" v-if=" key != 'port_id' && (onu_basic_info.data.length !== 0)" class="onu-info-item">
            <span>
                {{ lanMap[key] }}
            </span>
            <span>
                {{ item }}
            </span>
        </div>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
    export default {
        name: 'onuBasicInfo',
		computed: mapState(['lanMap','port_name','port_info','change_url','onu_list']),
        data(){
            return {
				onu_basic_info: {},
				portid: 1,
				onuid: 1
            }
        },
        created(){
            this.portid = this.$route.query.port_id || this.port_info.data[0].port_id;
            var _url;
            if(this.change_url.onu_allow[this.change_url.onu_allow.length - 1] != '='){
                _url = this.change_url.onu_list;
            }else{
                _url = this.change_url.onu_list + this.portid;
            }
            this.$http.get(_url).then(res=>{
                if(res.data.code === 1){
                    var _onu_list = this.analysis(res.data.data.resource);
                    if(!_onu_list) return
                    var obj = {
                        port_id: res.data.data.port_id,
                        data: _onu_list
                    }
                    this.addonu_list(obj);
                    this.onuid = this.onu_list.data[0];
                    this.$http.get('/onumgmt?form=base-info&port_id=' + this.portid + '&onu_id=' + this.onuid).then(res=>{
					    this.onu_basic_info = res.data;
                    }).catch(err=>{
                        // to do
                    })
                }else{
                    this.addonu_list({});
                }
            }).catch(err=>{
                // to do
            })
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
            }
		},
		watch: {
			portid(){
				// 请求url:  请求url: /onumgmt?form=base-info&port_id=1&onu_id=1
				this.$http.get('/onu_allow_list?form=resource&port_id='+this.portid).then(res=>{
					this.onu_basic_info = res.data;
				}).catch(err=>{
					// to do
				})
			},
			onuid(){
                console.log('onuid is changed');
				// 请求url:  请求url: /onumgmt?form=base-info&port_id=1&onu_id=1
				this.$http.get('/onumgmt?form=base-info&port_id='+this.portid+'&onu_id='+this.onuid).then(res=>{
					this.onu_basic_info = res.data;
				}).catch(err=>{
					// to do
				})
			}
		},
    }
</script>

<style scoped>
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
.onu-info-item{
	border-bottom: 1px solid #ccc;
}
div.onu-info-item>span{
	display: inline-block;
	vertical-align: middle;
	height: 30px;
	line-height: 30px;
	width: 30%;
	padding-left: 20px;
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
</style>