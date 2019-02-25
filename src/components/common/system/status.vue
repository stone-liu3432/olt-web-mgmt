<template>
    <div id="home">
        <div class="port-info">
            <h3>{{ lanMap['pon_info'] }}</h3>
            <div>
                <port v-for="(item,index) in ponInfo.data" :key="index"
                    :port-info="item" 
                    port-type="pon" 
                    v-if="ponInfo.data && ponInfo.data.length ">
                </port>
            </div>
        </div>
        <div class="port-info">
            <h3>{{ lanMap['ge_port_info'] }}</h3>
            <div>
                <port v-for="(item,index) in port_name.ge" :key="index"
                    :port-info="item"
                    port-type="ge"
                    v-if="port_name && port_name.ge">
                </port>
                <port v-for="(item,index) in port_name.xge" :key="index"
                    :port-info="item"
                    port-type="ge"
                    v-if="port_name && port_name.xge">
                </port>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import port from './port.vue'
export default {
    name: 'status',
    components: { port },
    data(){
        return {
            ponInfo: [],
            geInfo: {}
        }
    },
    created(){
        this.getPon();
    },
    methods: {
        getPon(){
            this.$http.get(this.change_url.pon).then(res=>{
                if(res.data.code === 1){
                    this.ponInfo = res.data;
                }
            }).catch(err=>{
                // to do
            })
        }
    },
    computed: mapState(['port_name','lanMap','change_url'])
}
</script>

<style lang="less" scoped>
#home{
    padding-top: 70px;
    width: 1280px;
    margin: 0 auto;
}
div.port-info{
    cursor: pointer;
    h3{
        font-size: 20px;
        margin: 16px 0 16px 20px;
        font-weight: 500;
        color: #29BDFA;
    }
    >div{
        padding: 0 0 0 20px;
    }
    &:after{
        content: '';
        display: table;
        clear: both;
    }
}
</style>
