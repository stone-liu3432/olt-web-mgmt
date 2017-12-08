<template>
    <div>
        <ul v-if="this.data.data">
            <li v-for="(item,key) in this.data.data" :key="key"  v-if=" key !== 'port_id'">
                <span>{{ key.replace(/\_/g,' ') }}</span>
                <span>{{ item }}</span>
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: 'perfInfo',
        data(){
            return {
                data: {
                    code: 0,
                    msg: '',
                    data: {}
                }
            }
        },
        created(){
            //模拟数据，正式上线时需要传递 port_id ，默认显示pon-1端口   ex: 请求url: /switch_port?form=statistic & port_id=1
            this.$http.get('./perfInfo.json').then(res=>{
                this.data = res.data;
                //console.log(this.data.data);
            }).catch(err=>{
                // to do 
            })
        }
    }
</script>

<style scoped>
li{
    width: 1100px;
    border: 1px solid #666;
    border-bottom: none;
}
li:last-child{
    border-bottom: 1px solid #666;
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
    border-right: 1px solid #666;
}
</style>