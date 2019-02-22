<template>
    <!-- <div class="top-banner">
      <div class="top-banner-logo lf" v-if="system.data">
            <img v-if="has_logo" id="logo">
            <a href="#" v-else>{{ system.data.vendor ? system.data.vendor.length > 16 ? system.data.vendor.substring(0,16) : system.data.vendor : "HSGQ"  }}</a>
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
        <div class="lf show-user">
          <i></i>
          <span>{{ uName }}</span>
        </div>
        <div class="lf log-out" @click="login_out">
          <i></i>
          <span>{{ lanMap['logout'] }}</span>
        </div>
      </div>
      <div class="modal-dialog" v-if="false">
          <div class="cover"></div>
          <div class="modal-body">
              <div class="close"></div>
          </div>
      </div>
      <confirm :tool-tips="lanMap['logout'] + '?'" @choose="result" v-if="login_out_modal"></confirm>
    </div> -->
    <div class="top-banner">
        <div class="top-banner-logo lf">HSGQ</div>
        <div class="top-banner-nav lf">
            <ul>
                <li v-for="(item,index) in f_menu" :key="index" @click="nav_click(item)">{{ item }}</li>
            </ul>
        </div>
        <div class="top-banner-user lf">
            <ul>
                <li>logout</li>
                <li>reboot</li>
                <li>user</li>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
const f_menu = ['status','onu_allow','vlan_mgmt','advanced_setting']
export default {
   name: 'topBanner',
   computed: mapState(['system','lanMap','language','menu','change_url']),
   data(){
       return {
           lang: '',
           uName: '',
           login_out_modal: false,
           has_logo: false,
           f_menu: f_menu
       }
   },
   created(){
       this.uName = sessionStorage.getItem('uname');
       this.lang = this.language;
   },
   methods: {
        ...mapMutations({
            change_lang: 'updateLang',
            addmenu: 'updateMenu'
        }),
        login_out(){
            this.login_out_modal = true;
        },
        update_img(){
            this.$http.get('../../logo.png').then(res=>{
                this.has_logo = true;
                this.$nextTick(()=>{
                    document.getElementById('logo').src = '../../logo.png';
                })
            }).catch(err=>{
                this.has_logo = false;
            })
        },
        //  退出登录
        result(bool){
            if(bool){
                var post_params = {
                    "method":"set",
                    "param":{
                        "name": this.uName
                    }
                }
                this.$http.post('/userlogin?form=logout',post_params).then(res=>{
                    this.$message({
                        type: 'success',
                        text: this.lanMap['login_out']
                    })
                    sessionStorage.removeItem('x-token');
                    this.$router.push('/login');
                }).catch(err=>{
                    // to do
                })
            }
            this.login_out_modal = false;
        },
        nav_click(node){
            this.$router.push(node);
            if(node === 'advanced_setting'){
                this.$http.get(this.change_url.menu).then(res=>{
                    if(res.data.code === 1){
                        this.addmenu(res.data);
                    }
                }).catch(err=>{
                    // to do
                })
            }
        }
   },
   watch: {
        language(){
            this.lang = this.language;
        },
        lang(){
            this.change_lang(this.lang);
        },
        system(){
            if(this.system.data){
                this.update_img();
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
        z-index: 999;
        background: #ddd;
        >div{
            height: 70px;
            line-height: 70px;
            text-align: center;
        }
        ul{
            li{
                float: left;
                cursor: pointer;
                user-select: none;
            }
            &::after{
                content: "";
                display: table;
                clear: both;
            }
        }
    }
    .top-banner::after{
        content : '';
        display: table;
        clear:both;
    }
    div.top-banner-logo{
        width: 25%;
    }
    div.top-banner-nav{
        width: 60%;
        li{
            width: 20%;
        }
    }
    div.top-banner-user{
        width: 15%;
        li{
            width: 33%;
        }
    }

  
//   .top-banner h1{
//     font-size:42px;
//     line-height:70px;
//   }
//   .top-banner-logo{
//     min-width:200px;
//     max-width: 400px;
//     height:70px;
//     line-height:70px;
//     text-align: center;
//     padding: 0 20px;
//   }
//   .top-banner-logo a{
//     font-size:42px;
//     font-weight:bold;
//     color:#fff;
//     background: transparent;
//     &:active{
//         border: none;
//     }
//   }
//   .product-type{
//     width:200px;
//     height:70px;
//     font-size:20px;
//     line-height:70px;
//     text-align: center;
//   }
//   div.user-login div{
//     width:150px;
//     text-align: center;
//     height:70px;
//     line-height:70px;
//     font-size:16px;
//     cursor:pointer;
//   }
//   div.user-login>div.change-lang{
//     width: 240px;
//     margin-right: 20px;
//     >span{
//         margin-right: 10px;
//         display: inline-block;
//         width: 80px;
//         color: #fff;
//         text-align: right;
//         padding-right: 10px;
//     }
//     >select{
//         vertical-align: middle;
//         width: 120px;
//         height: 30px;
//         font-size: 16px;
//         text-indent: 10px;
//         border-radius: 5px;
//     }
// }
// div.modal-body{
//     width: 500px;
//     height: 300px;
//     background: #fff;
//     position: absolute;
//     top: 0;
//     left: 0;
//     right: 0;
//     bottom: 0;
//     margin: auto;
//     border-radius: 10px;
// }
// div.log-out{
//     vertical-align: middle;
//     >i{
//         display: inline-block;
//         vertical-align: middle;
//         width: 32px;
//         height: 32px;
//         background: url('../../assets/logout.png') no-repeat;
//     }
// }
// div.show-user{
//     vertical-align: middle;
//     >i{
//         display: inline-block;
//         vertical-align: middle;
//         width: 32px;
//         height: 32px;
//         background: url('../../assets/user.png') no-repeat;
//     }
// }
</style>
