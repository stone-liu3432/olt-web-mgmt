<template>
    <div class="top-banner">
      <div class="top-banner-logo lf">
        <a href="#">HSGQ</a>
      </div>
      <h1 class="lf">|</h1>
      <div class="product-type lf" v-if="system.data">{{ system.data.product_name }}</div>
      <div class="user-login rt">
        <div class="change-lang lf">
            <span>{{ lanMap['lang'] }}</span>
                <select v-model="lang">
                    <option value="zh">简体中文</option>
                    <option value="en">English</option>
                </select>
        </div>
        <div class="lf">
          <i></i>
          <p>{{ uName }}</p>
        </div>
        <div class="lf" @click="login_out">
          <i></i>
          <p>{{ lanMap['logout'] }}</p>
        </div>
      </div>
      <div class="modal-dialog" v-if="false">
          <div class="cover"></div>
          <div class="modal-body">
              <div class="close"></div>
          </div>
      </div>
      <confirm :tool-tips="lanMap['logout'] + '?'" @choose="result" v-if="login_out_modal"></confirm>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
import confirm from '@/components/common/confirm'
export default {
   name : 'topBanner',
   computed: mapState(['system','lanMap','language']),
   components: { confirm },
   data(){
       return {
           lang: '',
           uName: '',
           login_out_modal: false
       }
   },
   created(){
       this.lang = this.language;
       this.uName = sessionStorage.getItem('uname');
   },
   methods: {
        ...mapMutations({
            change_lang: 'updateLang'
        }),
        login_out(){
            this.login_out_modal = true;
        },
        result(bool){
            if(bool){
                var post_params = {
                    "method":"set",
                    "param":{
                        "name": this.uName
                    }
                }
                this.$http.post('/userlogin?form=logout',post_params).then(res=>{
                    // do sth
                }).catch(err=>{
                    // to do
                })
                sessionStorage.clear();
                this.$router.push('/login');
            }
            this.login_out_modal = false;
        }
   },
   watch: {
       lang(){
            if(this.lang === 'zh'){
                this.change_lang('zh');
            }
            if(this.lang === 'en'){
                this.change_lang('en');
            }
        }
   }
}
</script>

<style scoped lang="less">
  .top-banner{
    width:100%;
    min-width: 1280px;
    max-width: 1980px;
    height:70px;
    position:fixed;
    top:0;
    left:0;
    background: #252532;
    color:#fff;
    z-index: 999;
  }
  .top-banner::after{
    content : '';
    display: table;
    clear:both;
  }
  .top-banner h1{
    font-size:42px;
    line-height:70px;
  }
  .top-banner-logo{
    width:200px;
    height:70px;
    line-height:70px;
    text-align: center;
  }
  .top-banner-logo a{
    font-size:42px;
    font-weight:bold;
    color:#fff;
  }
  .product-type{
    width:200px;
    height:70px;
    font-size:20px;
    line-height:70px;
    text-align: center;
  }
  div.user-login div{
    width:120px;
    text-align: center;
    height:70px;
    line-height:70px;
    font-size:16px;
    cursor:pointer;
  }
  div.user-login>div.change-lang{
    width: 240px;
    margin-right: 20px;
    >span{
        margin-right: 10px;
        display: inline-block;
        width: 80px;
        color: #fff;
        text-align: right;
        padding-right: 10px;
    }
    >select{
        width: 120px;
        height: 30px;
        font-size: 16px;
        text-indent: 10px;
        border-radius: 5px;
    }
}
div.modal-body{
    width: 500px;
    height: 300px;
    background: #fff;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    border-radius: 10px;
}
</style>
