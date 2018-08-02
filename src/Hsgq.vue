<template>
    <div id="hsgq" v-if="lanMap">
        <router-view></router-view>
        <loading v-if="isLoading"></loading>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import loading from "@/components/common/loading";
import zh from '@/config/lang_zh';
import en from '@/config/lang_en';
export default {
    name: "hsgq",
    components: { loading },
    data(){
        return {
            lang: {
                zh: {},
                en: {}
            }
        }
    },
    created() {
        this.lang = {
            zh,
            en
        }
        var def_lang = sessionStorage.getItem('def_lang');
        if(def_lang){
            this.set_language(def_lang);
            this.add_lanMap(this.lang[def_lang]);
        }else{
            this.$http.get(this.change_url.get_lang).then(res => {
                if (res.data.code === 1) {
                    this.set_language(res.data.data.lang);
                    //  缓存用户选择的语言类型，防止用户手动刷新数据消失
                    sessionStorage.setItem('def_lang',res.data.data.lang);
                }else{
                    this.set_language('en');
                    sessionStorage.setItem('def_lang','en');
                }
            }).catch(err => {
                // to do
            });
        }
        this.http_interceptors();
    },
     methods: {
        ...mapMutations({
            add_lanMap: "updateLanMap",
            loading: "updateLoading",
            set_language: "updateLang"
        }),
        //  http响应拦截器，如返回登录超时或登录信息异常时进行强制跳转
        http_interceptors(){    
            this.$http.interceptors.response.use(response=>{
                //  返回 0 ，非法登录信息
                if(response.data.code === 0){
                    this.$message({
                        type: 'error',
                        text: this.lanMap['illegal_login_info']
                    })
                    sessionStorage.removeItem('x-token');
                    this.$router.push('/login');
                }
                //  返回 -1，登录超时
                if(response.data.code === -1){
                    this.$message({
                        type: 'error',
                        text: this.lanMap['login_timeout']
                    })
                    sessionStorage.removeItem('x-token');
                    this.$router.push('/login');
                }
                return response;
            },err=>{
                return Promise.reject(err);
            });
        }
    },
    computed: mapState(["port_info","system","isLoading","language","change_url",'lanMap']),
    watch: {
        language(){
            this.add_lanMap(this.lang[this.language]);
            sessionStorage.setItem('def_lang',this.language);
        }
    }
};
</script>

<style>
#hsgq {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  width: 100%;
  min-width: 1280px;
  max-width: 1980px;
  font-size: 16px;
}
.global-load {
  display: none;
}
html,body{
    height: 100%;
}
/**************** RESET STYLE****************/
body,div,dl,dt,dd,ul,ol,li,h1,h2,h3,h4,h5,h6,pre,form,fieldset,input,textarea,p,blockquote,th,td{
  padding: 0;
  margin: 0;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}
fieldset,
img {
  border: 0;
}
address,caption,cite,code,dfn,em,strong,th,var{
  font-weight: normal;
  font-style: normal;
}
ol,ul{
  list-style: none;
}
caption,th {
  text-align: left;
}
h1,h2,h3,h4,h5,h6 {
  font-weight: normal;
  font-size: 100%;
}
q:before,q:after {
  content: "";
  /*content:none;*/
}
abbr,acronym {
  border: 0;
}
a {
  text-decoration: none;
  color: #000;
}
.lf {
  float: left;
}
.rt {
  float: right;
}
select {
  border: 1px solid #ccc;
  padding-left: 10px\9\0;
}
.flex-box {
  display: flex;
}
input[type="text"] {
  text-indent: 10px;
  font-size: 16px;
  height: 30px;
  line-height: 30px;
  border: 1px solid #c8cccf;
  border-radius: 5px;
  color: #000;
  outline: 0;
  text-decoration: none;
}
input[type="text"]:focus {
  border: 1px solid #1e90ff;
  border-radius: 5px;
}
a {
  border: 1px solid transparent;
  user-select: none;
}
a:active {
  border: 1px solid #1e90ff;
}
/* 复用模态框类 */
.modal-dialog {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}
.cover {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: #666;
  opacity: 0.5;
}
.close {
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 60px;
  cursor: pointer;
  background: url("./assets/close_msg.png") no-repeat;
}
.close:hover {
  background: url("./assets/close_msg_hover.png") no-repeat;
}
div.cover+div{
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    width: 500px;
    height: 400px;
    background: #fff;
    border-radius: 5px;
}
</style>
