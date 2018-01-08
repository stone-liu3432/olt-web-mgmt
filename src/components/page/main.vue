<template>
  <div id="main-content">
      <topBanner></topBanner>
      <leftAside></leftAside>
      <detail v-if="port_info && system"></detail>
      <div class="modal-dialog" v-if="modal">
          <div class="cover"></div>
          <div class="tips-body">
              <div>登录超时，将于 {{ count }} 秒后跳转到登录页面</div>
          </div>
      </div>
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
        data(){
            return {
                modal: false,
                count: 0
            }
        },
        created(){
            this.$http.interceptors.response.use(function(response){
                if(response.data.code === 0){
                    sessionStorage.clear();
                    this.$route.push('/login');
                }
                if(response.data.code === -1){
                    this.modal = true;
                    var n = 5;
                    setInterval(()=>{
                        this.count = n;
                        n--;
                        if(n <= 0){
                            this.modal = false;
                            sessionStorage.clear();
                            this.$route.push('/login')
                        }
                    },1000)
                }
                return response;
            },function(error){
                return Promise.reject(error);
            });

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
                addmenu: 'updateMenu',
                isAccessToken: 'updateLogin'
            })
        },
        computed: mapState(['port_info','system','change_url'])
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
