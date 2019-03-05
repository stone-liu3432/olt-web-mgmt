<template>
    <div>
        time range
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
export default {
    name: 'timeRange',
    data(){
        return {
            time_range: {
                "code":1,
                "message":"success",
                "data":[{
                    "name":"gao",
                    "state":"Active",
                    "absolute":[{
                        "stime":"5:30",
                        "sday":"2018/03/12",
                        "etime":"6:30",
                        "sday":"2018/03/13"
                    }],
                    "relative":[{
                        "stime":"5:30",
                        "etime":"6:30",
                        "day":"weekend"
                    }]
                }]
            }
        }
    },
    computed: mapState(["change_url", 'lanMap']),
    created(){},
    methods: {
        getDate(){
            this.$http.get('/switch_acl?form=time_range&name=all').then(res=>{
                if(res.data.code === 1){
                    htis.time_range = res.data;
                }
            }).catch(err=>{
                // to do
            })
        }
    }
}
</script>

<style lang="less" scoped>

</style>