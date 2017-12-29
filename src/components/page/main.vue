<template>
  <div id="main-content">
      <topBanner></topBanner>
      <leftAside></leftAside>
      <detail v-if="port_info && system"></detail>
  </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
import leftAside from '@/components/page/aside'
import detail from '@/components/page/detail'
import topBanner from '@/components/page/header'
    export default {
        name: 'mainContent',
        components: {
            leftAside,
            detail,
            topBanner
        },
        created(){
            //根组件创建之前，初始化vuex部分数据
            this.$http.get(this.change_url.system).then(res=>{
                this.systemInfo(res.data);
            }).catch(err=>{
            // to do 
            })
            this.$http.get(this.change_url.menu).then(res=>{
                this.addmenu(res.data);
            }).catch(err=>{
                // to do
            })
            this.$router.push('/main');
        },
        methods: {
            ...mapMutations({
                systemInfo: 'updateSysData',
                portInfo: 'updatePortData',
                lanMap: 'updateLanMap',
                portName: 'updatePortName',
                addmenu: 'updateMenu'
            }),
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
        computed: mapState(['port_info','system','change_url'])
    }
</script>

<style>
#main-content{
    height:100%;
}
</style>
