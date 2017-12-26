<template>
    <div  v-if="onu_basic_info.data && port_name.pon">
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
					<option v-for="(item,index) in onu_list.data" :value="item.onu_id">{{ 'ONU'+item.port_id + '/' + item.onu_id }}</option>
				</select>
			</div>
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
		computed: mapState(['lanMap','port_name','port_info']),
        data(){
            return {
				onu_basic_info: {},
				portid: 0,
				onuid: 0
            }
        },
        created(){
            this.$http.get('./onuallow.json').then(res=>{
                this.onu_list(res.data);
                this.portid = this.$route.query.port_id || this.port_info.data[0].port_id;
                this.onuid = this.$route.query.onu_id || this.onu_list.data[this.portid-1].onu_id;
                // // 请求url:  请求url: /onumgmt?form=base-info&port_id=1&onu_id=1
                // this.$http.get('./onu_basic_info.json').then(res=>{
                //     this.onu_basic_info = res.data;
                // }).catch(err=>{
                //     // to do
                // })
            }).catch(err=>{
                // to do 
            })
		},
		methods:{
            ...mapMutations({
                onu_list: 'updateOnuList'
            }),
		},
		watch: {
			portid(){
				// 请求url:  请求url: /onumgmt?form=base-info&port_id=1&onu_id=1
				this.$http.get('./onumgmt?form=base-info&port_id='+this.portid+'&onu_id='+this.onuid).then(res=>{
					this.onu_basic_info = res.data;
				}).catch(err=>{
					// to do
				})
			},
			onuid(){
				// 请求url:  请求url: /onumgmt?form=base-info&port_id=1&onu_id=1
				this.$http.get('./onumgmt?form=base-info&port_id='+this.portid+'&onu_id='+this.onuid).then(res=>{
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
	display: inline-block;
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
</style>