<template>
    <div id="detail" class="lf">
        <keep-alive :include="['onuAllow','ponSetting','onuDeny','slaCfg','onuBasicInfo','onuPortCfg','perfInfo','portCfg']">
            <router-view v-if="isRouterAlive"></router-view>
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
                ponInfo: {}
            }
        },
        computed: mapState(['lanMap','change_url','system']),
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
                    var index = this.system.data.ponports;
                    var pon_count = res.data.data.slice(0,index);
                    var ge_count = res.data.data.slice(index);
                    var portName = {
                        pon: this.get_portName(pon_count,'PON'),
                        ge: this.get_portName(ge_count,'GE')
                    };
                    this.portName(portName);
                }).catch(err=>{
                    // to do
                })
            },
            // 根据port_id 分配端口名
            get_portName(arr,prefix){
                var obj = {};
                for(var i=0;i<arr.length;i++){
                    obj[arr[i].port_id] = {};
                    obj[arr[i].port_id].name = i < 10 ? prefix + '0' + arr[i].port_id : prefix + arr[i].port_id;
                    if(arr[i].port_id > this.system.data.ponports){
                        var n = arr[i].port_id - this.system.data.ponports;
                        obj[arr[i].port_id].name = i < 10 ? prefix + '0' + n : prefix + n;
                    }
                    obj[arr[i].port_id].id = arr[i].port_id;
                    obj[arr[i].port_id].data = arr[i]; 
                }
                return obj;
            }
        },
        beforeDestroy(){
            document.body.removeEventListener('keydown',this.preventRefresh);
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
