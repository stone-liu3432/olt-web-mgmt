<template>
    <div>
        
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'onuPortVlan',
    computed: mapState(['lanMap','port_name']),
    props: ['portid','onuid'],
    data(){
        return {
            mc_eth_config: {}
        }
    },
    created(){
        this.getData();
    },
    methods: {
        getData(){
            this.$http.get('/onumgmt?form=mc_eth_config&port_id=1&onu_id=1',{ params: { port_id: this.portid,onu_id: this.onuid }}).then(res=>{
                if(res.data.code === 1){
                    this.mc_eth_config = res.data;
                }else{
                    this.mc_eth_config = {}
                }
            }).catch(err=>{
                // to do
            })
        }
    },
    watch: {
        'portid'(){
            console.log(this.portid);
        }
    }
}
</script>

<style lang="less" scoped>

</style>
