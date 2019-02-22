<template>
  <div id="main-content">
      <topBanner></topBanner>
      <router-view></router-view>
  </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
import topBanner from '@/components/page/header'
import contentArea from '@/components/page/content'
    export default {
        name: 'mainContent',
        components: {
            topBanner,
            contentArea
        },
        data(){
            return {
                modal: false,
                count: 0,
                max_time: 300,
                time: 0,
                interval: null,
                uName: ''
            }
        },
        created(){
            //根组件创建之前，初始化vuex部分数据
            this.$http.get(this.change_url.system).then(res=>{
                if(res.data.code === 1){
                    this.systemInfo(res.data);
                }
            }).catch(err=>{
            // to do 
            })
            this.$http.get(this.change_url.menu).then(res=>{
                if(res.data.code === 1){
                    this.addmenu(res.data);
                }
            }).catch(err=>{
                // to do
            })
            this.uName = sessionStorage.getItem('uname');
            this.getData();
        },
        mounted(){
            this.time = this.max_time;
            // this.interval = setInterval(()=>{
            //     this.time--;
            //     if(this.time <= 0){
            //         var post_params = {
            //             "method": "set",
            //             "param": {
            //                 "name": this.uName
            //             }
            //         }
            //         this.$http.post('/userlogin?form=logout',post_params).then(res=>{
            //             this.$message({
            //                 type: 'success',
            //                 text: this.lanMap['login_out']
            //             })
            //             sessionStorage.removeItem('x-token');
            //             this.$router.replace('/login');
            //         }).catch(err=>{
            //             // to do
            //         })
            //     }
            // },1000)
            document.body.addEventListener('mousemove',this.user_timeout);
            document.body.addEventListener('keydown',this.user_timeout);
            document.body.addEventListener('mousedown',this.user_timeout);
        },
        beforeDestroy(){
            sessionStorage.removeItem('pid');
            sessionStorage.removeItem('oid');
            sessionStorage.removeItem('first_menu');
            sessionStorage.removeItem('sec_menu');
            clearInterval(this.interval);
            document.body.removeEventListener('mousemove',this.user_timeout);
            document.body.removeEventListener('mousedown',this.user_timeout);
            document.body.removeEventListener('keydown',this.user_timeout);
        },
        methods: {
            ...mapMutations({
                systemInfo: 'updateSysData',
                addmenu: 'updateMenu',
                portInfo: 'updatePortData',
                portName: 'updatePortName'
            }),
            user_timeout(e){
                this.time = this.max_time;
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
                    this.reload();
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
        computed: mapState(['port_info','system','change_url','lanMap'])
    }
</script>

<style>
#main-content{
    height:100%;
}
div.tips-body{
    width: 500px;
    height: 300px;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    background: #fff;
    border-radius: 10px;
}
div.tips-body>div{
    font-size: 20px;
    font-weight: 600;
    color: red;
    text-align: center;
    margin-top: 130px;
}
</style>
