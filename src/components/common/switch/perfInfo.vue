<template>
    <div>
        <div class="perf-info">
            <h2>{{ lanMap['perf_info'] }}</h2>
            <div>
                <span>{{ lanMap['port_id'] }}</span>
                <select v-model.number="portid">
                    <option v-for="(item,index) in port_name.pon" :key="index" :value="item.id">{{ item.name }}</option>
                    <option v-for="(item,index) in port_name.ge" :key="index" :value="item.id">{{ item.name }}</option>
                    <option v-if="port_name.xge" v-for="(item,index) in port_name.xge" :key="index" :value="item.id">{{ item.name }}</option>
                </select>
            </div>
        </div>
        <div v-if="data.data">
            <ul class="lf">
                <li v-for="(item,key) in this.data.data" :key="key"  v-if=" key !== 'port_id' && key.substring(0,2).indexOf('rx') !== -1">
                    <span>{{ key.replace(/_/g,' ') }}</span>
                    <span>{{ item }}</span>
                </li>
            </ul>
            <ul class="lf">
                <li v-for="(item,key) in this.data.data" :key="key"  v-if=" key !== 'port_id' && key.substring(0,2).indexOf('tx') !== -1">
                    <span>{{ key.replace(/_/g,' ') }}</span>
                    <span>{{ item }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
    export default {
        name: 'perfInfo',
        computed: mapState(['lanMap','port_name','port_info','change_url']),
        data(){
            return {
                data: {},
                portid: 0
            }
        },
        activated(){
            this.getData();
        },
        created(){
            var pid = sessionStorage.getItem('portid');
            this.portid = Number(pid) || 1;
            //请求url: /switch_port?form=statistic&port_id=1   //  打包时删除
            if(this.change_url.beta === 'test'){
                var url;
                if(this.change_url.perf[this.change_url.perf.length - 1] != '='){
                    url = this.change_url.perf;
                }else{
                    url = this.change_url.perf + this.portid;
                }
                this.$http.get(url).then(res=>{
                    this.data = res.data;
                }).catch(err=>{
                    // to do 
                })
            }
        },
        methods: {
            getData(){
                this.$http.get('/switch_port?form=statistic&port_id='+this.portid).then(res=>{
                    if(res.data.code === 1){
                        this.data = res.data;
                    }else if(res.data.code >1){
                        this.data = {}
                    }
                }).catch(err=>{
                    // to do 
                })
            }
        },
        watch:{
            portid(){
                sessionStorage.setItem('portid',Number(this.portid));
                this.getData();
            }
        }
    }
</script>

<style scoped>
.perf-info{
    margin: 10px 0 20px 10px;
}
.perf-info>h2,.perf-info>select{
    float: left;
}.perf-info>div>span{
    width: 120px;
    padding: 0;
    border: none;
    text-align: center;
    font-size: 16px;
    font-weight: 500;
}
.perf-info:after{
    content: "";
    display: table;
    clear: both;
}
div.perf-info+div{
    overflow: hidden;
}
select{
    width: 120px;
    height: 30px;
    font-size: 16px;
    text-indent: 10px;
}
h2{
    display: inline-block;
	width: 200px;
	font-size: 20px;
	font-weight: 600;
	color: 	#67AEF7;
}
ul{
    width: 50%;
}
li{
    border: 1px solid #ccc;
    border-bottom: none;
}
li:last-child{
    border-bottom: 1px solid #ccc;
}
span{
    display: inline-block;
    border-top: none;
    font-size:16px;
    width: 30%;
    padding: 5px 20px;
}
span:first-child{
    text-align: right;
    width: 50%;
    border-right: 1px solid #ccc;
}
</style>