<template>
    <div>
        <div class="perf-info">
            <h2>{{ lanMap['perf_info'] }}</h2>
            <div>
                <span>{{ lanMap['port_id'] }}</span>
                <select v-model="portid">
                    <option v-for="(item,index) in port_name.pon" :value="item.id">{{ item.name }}</option>
                </select>
            </div>
        </div>
        <ul v-if="this.data.data">
            <li v-for="(item,key) in this.data.data" :key="key"  v-if=" key !== 'port_id'">
                <span>{{ key.replace(/\_/g,' ') }}</span>
                <span>{{ item }}</span>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapState } from 'vuex'
    export default {
        name: 'perfInfo',
        computed: mapState(['lanMap','port_name','port_info']),
        data(){
            return {
                data: {},
                portid: 0
            }
        },
        created(){
            this.portid = this.port_info.data[0].port_id;
            //请求url: /switch_port?form=statistic&port_id=1   //  打包时删除
            this.$http.get('./perfInfo.json').then(res=>{
                this.data = res.data;
                //console.log(this.data.data);
            }).catch(err=>{
                // to do 
            })
        },
        watch:{
            portid(){
                //请求url: /switch_port?form=statistic&port_id=1
                // this.$http.get('/switch_port?form=statistic&port_id='+this.portid).then(res=>{
                //     this.data = res.data;
                // }).catch(err=>{
                //     // to do 
                // })
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
li{
    width: 1100px;
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
    width: 300px;
    padding: 5px 20px;
}
span:first-child{
    text-align: right;
    border-right: 1px solid #ccc;
}
</style>