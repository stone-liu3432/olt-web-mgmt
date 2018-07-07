<template>
    <div>
pv qinq
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'pvQinq',
    computed: mapState(['lanMap']),
    //props: ['pvData'],
    data(){
        return {
            cache_d: {},
            pvData: {
                "code":1,
                "msg":"success",
                "data":{
                    "port_id":1,
                    "cvlan":100,
                    "cvlan_s":0,
                    "cvlan_e":0,
                    "svlan":200,
                    "svlan_pri":1,
                    "action":1
                }
            }
        }
    },
    created(){
        this.cache_d = Object.assign({},this.pvData);
    },
    methods: {

    },
    watch: {
        'pvData'(){
            this.cache_d = Object.assign({},this.pvData);
        }
    }
}
</script>

<style lang="less" scoped>

</style>
