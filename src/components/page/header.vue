<template>
    <div class="top-banner">
        <div class="top-banner-logo lf" v-if="system.data">
            <img v-if="has_logo" id="logo">
            <a href="#" v-else>{{ system.data.vendor ? system.data.vendor.length > 16 ? system.data.vendor.substring(0,16) : system.data.vendor : "HSGQ"  }}</a>
        </div>
        <div class="header-content">
            <div>
                <div class="rt log-out" @click="login_out">
                    <a>{{ lanMap['logout'] }}</a>
                </div>
                <div class="rt show-user">
                    <i></i>
                    <span>{{ uName }}asdfsadfsdf</span>
                </div>
                <div class="rt language-set">
                    <span>{{ lanMap['lang'] }}</span>
                    <select v-model="lang">
                        <option value="zh">简体中文</option>
                        <option value="en">English</option>
                    </select> 
                </div>
                <div v-if="system.data" class="lf product-name">{{ system.data.product_name }}</div>
            </div>
            <div class="padding-content"></div>
          <ul v-if="menu.data && menu.data.menu.length">
                <li v-for="(item,index) in menu.data.menu" :key="index" @click="first_menu(item)" :class="[ active_menu === item.name ? 'actived' : '' ]">
                    {{ lanMap[item.name] }}
                </li>
          </ul>
          <ul class="sub-menu">
              <li v-for="(item, index) in sub_menu" :key="index" @click="select_page(item)" :class="[ item.name === active_sub_menu ? 'sub-actived' : '']">
                  <span>{{ lanMap[item.name] }}</span>
                  <b>|</b>
              </li>
          </ul>
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
export default {
   name: 'topBanner',
   computed: mapState(['system','lanMap','language','menu']),
   data(){
       return {
           lang: '',
           uName: '',
           login_out_modal: false,
           has_logo: false,
           sub_menu: [{ name: 'running_status' }],
           active_menu: '',
           active_sub_menu: ''
       }
   },
   created(){
       this.uName = sessionStorage.getItem('uname');
       this.lang = this.language;
       this.active_menu = sessionStorage.getItem('first_menu') || 'running_status';
       var sec_menu = sessionStorage.getItem('sec_menu');
       if(sec_menu){
           this.active_sub_menu = sec_menu;
           this.$router.replace(sec_menu);
       }else{
           this.active_sub_menu = 'running_status';
       }
   },
   methods: {
        ...mapMutations({
            change_lang: 'updateLang'
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
        first_menu(menu){
            this.active_menu = menu.name;
            sessionStorage.setItem('first_menu', menu.name);
            this.sub_menu = menu.children ? menu.children : [{name: 'running_status'}];
        },
        select_page(menu){
            sessionStorage.setItem('sec_menu',menu.name);
            this.active_sub_menu = menu.name;
            this.$router.replace(menu.name);
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
        },
        menu(){
            this.menu.data.menu.forEach(item=>{
                if(item.name === this.active_menu){
                    if(item.children){
                        this.sub_menu = item.children;
                    }else{
                        this.sub_menu = [{ name: 'running_status' }];
                    }
                }
            })
        }
   }
}
</script>

<style scoped lang="less">
  .top-banner{
    width:100%;
    min-width: 1280px;
    max-width: 1980px;
    height:100px;
    position: fixed;
    top:0;
    left:0;
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
      width: 220px;
    height:100px;
    line-height:100px;
    text-align: center;
  }
  .top-banner-logo a{
    font-size:42px;
    font-weight:bold;
    color: #333;
    background: transparent;
    &:active{
        border: none;
    }
  }
  .product-type{
    width:200px;
    height:70px;
    font-size:20px;
    line-height:70px;
    text-align: center;
  }
  div.user-login div{
    width:150px;
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
        vertical-align: middle;
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
div.log-out{
    cursor: pointer;
    margin-right: 20px;
    a{
        font-size: 14px;
    }
}
div.show-user{
    vertical-align: middle;
    height: 32px;
    margin: 0 20px;
    >i{
        display: inline-block;
        vertical-align: middle;
        width: 32px;
        height: 32px;
        background: url('../../assets/user.png') 3px 3px no-repeat;
    }
}
div.header-content{
    background: #427495;
    color: #fff;
    height: 70px;
    margin: 0 15px 0 220px;
    box-sizing: border-box;
    >div{
        width: 100%;
        &:first-child{
            height: 32px;
            line-height: 32px;
            a{
                height: 24px;
                line-height: 24px;
                vertical-align: baseline;
                background-color: #fff;
                color: #000;
                padding: 0 20px;
                &:active{
                    border: 1px solid #427495;
                }
            }
        }
        select{
            width: 120px;
            height: 24px;
        }
        div.language-set{
            margin: 0 30px;
        }
        div.product-name{
            margin-left: 30px;
        }
    }
    >ul{
        background: #EF8318;
        height: 30px;
        &::after{
            content: '';
            display: table;
            clear: both;
        }
        >li{
            float: left;
            width: 14%;
            color: #000;
            text-align: center;
            height : 30px;
            line-height: 30px;
            cursor: pointer;
        }
        .actived{
            background: #427495;
        }
        .sub-actived{
            color: #fff;
        }
    }
    >ul.sub-menu{
        background: #427495;
        padding-left: 20px;
        li{
            height: 30px;
            line-height: 30px;
            width: auto;
        }
        span{
            width: auto;
            padding: 0 15px;
            height: 30px;
            line-height: 30px;
            font-size: 14px;
        }
        b{
            color: #eee;
        }
    }
    div.padding-content{
        height: 8px;
        width: 100%;
        background: linear-gradient(#fff, #FFB148);
    }
}
</style>
