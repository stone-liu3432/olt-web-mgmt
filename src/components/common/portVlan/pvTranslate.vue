<template>
    <div>
pv translate
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'pvTranslate',
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
                    "old_vlan":100,
                    "new_vlan":200,
                    "new_vlan_pri":1,
                    "action":0
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
