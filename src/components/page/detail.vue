<template>
    <div id="detail" class="lf" v-if="port_name.pon && port_name.ge">
        <keep-alive :include="['onuAllow','ponSetting','onuDeny','onuBasicInfo','slaCfg','onuPortCfg','perfInfo','portCfg','portVlan']">
            <router-view v-if="isRouterAlive" :key="isRouterRefresh"></router-view>
        </keep-alive>
    </div>
</template>

<script>
    import { mapState,mapMutations } from 'vuex'
    export default {
        name: 'detail',
        data(){
            return {
                isRouterAlive: true,
                isRouterRefresh: 0
            }
        },
        computed: mapState(['lanMap','change_url','system','port_name']),
        created(){
            document.body.addEventListener('keydown',this.preventRefresh,false);
            this.getData();
        },
        methods: {
            ...mapMutations({
                portInfo: 'updatePortData',
                portName: 'updatePortName'
            }),
            //  控制router子组件，销毁再加载，实现子组件更新
            reload(){
                this.isRouterAlive = false;
                this.$nextTick(()=>{
                    this.isRouterAlive = true;
                })
            },
            //  接管f5刷新页面
            preventRefresh(e){
                var e = window.event || e;
                if(e.keyCode === 116 || (e.ctrlKey && e.keyCode==82)){
                    if(window.event){
                        try{e.keyCode = 0}catch(e){}
                        e.returnValue = false;
                    }
                    e.preventDefault();
                    this.reload();
                    return false
                }
            },
            getData(){
                this.$http.get(this.change_url.port).then(res=>{
                    this.portInfo(res.data);
                    var pon = this.system.data.ponports;
                    var ge = this.system.data.geports;
                    var xge = this.system.data.xgeports;
                    var pon_count,ge_count,xge_count,portName;
                    pon_count = res.data.data.slice(0,pon);
                    if(!xge){
                        ge_count = res.data.data.slice(pon);
                        portName = {
                            pon: this.get_portName(pon_count,'PON'),
                            ge: this.get_portName(ge_count,'GE')
                        };
                    }else{
                        ge_count = res.data.data.slice(pon,pon+ge);
                        xge_count = res.data.data.slice(pon+ge);
                        portName = {
                            pon: this.get_portName(pon_count,'PON'),
                            ge: this.get_portName(ge_count,'GE'),
                            xge: this.get_portName(xge_count,'XGE')
                        }
                    }
                    this.portName(portName);
                    this.isRouterRefresh = new Date().getTime();
                }).catch(err=>{
                    // to do
                })
            },
            // 根据port_id 分配端口名
            get_portName(arr,prefix){
                var obj = {};
                for(var i=0;i<arr.length;i++){
                    obj[arr[i].port_id] = {};
                    obj[arr[i].port_id].name = i < 10 ? prefix + '0' + (i + 1) : prefix + (i + 1);
                    obj[arr[i].port_id].id = arr[i].port_id;
                    obj[arr[i].port_id].data = arr[i]; 
                }
                return obj;
            }
        },
        beforeDestroy(){
            document.body.removeEventListener('keydown',this.preventRefresh);
        },
        watch: {
            '$route'(){
                this.isRouterRefresh = new Date().getTime() + Math.random();
            }
        }
    }
</script>

<style>
#detail{
    margin:70px 0 0 200px;
    padding:20px;
    width: 81%;
    min-width: 1020px;
    min-height:800px;
}
</style>
