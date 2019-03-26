<template>
    <div class="login">
        <div class="login-banner">
            <div class="lf"></div>
            <h1 class="lf" style="fontSize:36px;"></h1>
            <div class="rt change-lang">
                <span>{{ lanMap['lang'] }}</span>
                <select v-model="lang">
                    <option value="zh">简体中文</option>
                    <option value="en">English</option>
                </select>
            </div>
        </div>
        <div class="login-body">
            <h2>{{ lanMap['login_user'] }}</h2>
            <h3>{{ lanMap['login_page_login_hit'] }}</h3>
            <form>
                <div>
                    <span>USER</span>
                    <input type="text" v-model="userName" :class="[ verify_uname ? 'input-error' : '' ]" v-focus>
                </div>
                <div class="user-pwd">
                    <span>password</span>
                    <input type="password" 
                    v-model="userPwd" id="userPwd" :class="[ verify_upwd ? 'input-error' : '' ]" 
                    autocomplete="off" @keyup.enter="userLogin">
                    <i :class="[ visible ? 'visible' : 'invisible']" @click="changeVisible"></i>
                </div>
                <div class="login-tips">
                    <h4 :style="{'opacity': verify_uname ? 1 : 0}">
                        {{ lanMap['username_length_fail'] }}
                    </h4>
                    <h4 :style="{'opacity': verify_upwd ? 1 : 0}">
                        {{ lanMap['password_length_fail'] }}
                    </h4>
                    <h4 :style="{'opacity': login_failed ? 1 : 0}">{{ lanMap['service_user_password_fail'] }}</h4>
                </div>
                <div>
                    <a href="javascript:;" @click="userLogin">{{ lanMap['login_user'] }}</a>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import md5 from 'md5'
import { mapState,mapMutations } from "vuex"
    export default {
        name: 'login',
        data(){
            return {
                userName: '',
                userPwd: '',
                //  验证用户名
                verify_uname: false,
                //  验证密码
                verify_upwd: false,
                //  用户名或密码服务器验证未通过
                login_failed: false,
                //  密码可见或不可见
                visible: false,
                //  语言选项
                lang: ''
            }
        },
        computed: mapState(['lanMap','language']),
        created(){
            this.lang = this.language;
            sessionStorage.clear();
        },
        methods: {
            ...mapMutations({
                set_language: 'updateLang'
            }),
            userLogin(){
                this.login_failed = false;
                if(this.verify_uname || this.verify_upwd || this.userName === '' || this.userPwd === ''){
                    return 
                }
                var self = this;
                this.$http({
                    url: '/userlogin?form=login',
                    method: 'POST',
                    data: {
                        "method":"set",
                        "param":{
                            "name": this.userName,
                            "key": md5(self.userName + ':' + self.userPwd)
                        }
                    },
                    timeout: 5000
                }).then(res=>{
                    this.userPwd = '';
                    if(res.data.code === 1){
                        sessionStorage.setItem('x-token',res.headers['x-token']);
                        sessionStorage.setItem('uname',this.userName);
                        this.$message({
                            type: 'success',
                            text: this.lanMap['login_success'] + ',' + this.userName
                        })
                        this.$router.push('/main');
                    }else if(res.data.code > 1){
                        this.$message({
                            type: 'error',
                            text: '(' + res.data.code + ') ' + res.data.message
                        })
                        this.login_failed = true;
                    }
                }).catch(err=>{
                    // 登录超时时的处理，默认为5秒无响应超时
                    this.$message({
                        type: 'error',
                        text: this.lanMap['http_login_timeout']
                    })
                })
            },
            changeVisible(){
                this.visible = !this.visible;
                var uPwd = document.getElementById('userPwd');
                if(this.visible){
                    uPwd.type = 'text';
                }else{
                    uPwd.type = 'password';
                }
            }
        },
        watch: {
            userName(){
                var reg = /^[a-zA-Z][a-zA-Z_\d]{3,15}$/;
                if(!reg.test(this.userName)){
                    this.verify_uname = true;
                }else{
                    this.verify_uname = false;
                }
                if(this.userName == ''){
                    this.verify_uname = false;
                }
                this.login_failed = false;
            },
            userPwd(){
                var reg = /^[^\s\?\\\/\'\"]{5,16}$/;
                if(!reg.test(this.userPwd)){
                    this.verify_upwd = true;
                }else{
                    this.verify_upwd = false;
                }
                if(this.userPwd == ''){
                    this.verify_upwd = false;
                }
                this.login_failed = false;
            },
            lang(){
                this.set_language(this.lang);
            },
            language(){
                this.lang = this.language;
            }
        }
    }
</script>

<style scoped lang="less">
div.login{
    width: 100%;
    min-width: 1280px;
    height: 100%;
    min-height: 974px;
    background: #6C6D69;
}
div.login-banner{
    height: 150px;
}
div.login-body{
    width: 700px;
    padding: 35px 15px;
    margin: 100px auto;
    background: #fff;
    border-radius: 8px;
    text-align: center;
}
div.login-body>h2{
    font-size: 28px;
    font-weight: 600;
    color: #666;
    height: 50px;
    line-height: 50px;
}
div.login-body>h3{
    font-size: 14px;
    height: 30px;
    line-height: 30px;
    color: #49a3ff;
}
div.login-tips{
    position: relative;
    text-align: center;
    width: auto;
}
div.login-tips>h4{
    font-size: 14px;
    width: 100%;
    height: 30px;
    line-height: 30px;
    color: red;
}
div.login-tips>h4:last-child{
    position: absolute;
    left: 0;
    top: 0;
}
div.login-body a{
    display: inline-block;
    position: relative;
    left: 25px;
    width: 300px;
    height: 42px;
    line-height: 42px;
    text-align: center;
    background: #49A3FF;
    color: #fff;
    font-size: 20px;
    border-radius: 5px;
    transition: all 0.3s linear;
}
div.login-body a:active{
    background: rgb(13, 113, 146);
}
form div{
    height: 50px;
    line-height: 50px;
    width: 450px;
    margin: 20px auto;
}
div.user-pwd{
    position: relative;
}
form span{
    display: inline-block;
    width: 100px;
    height: 30px;
}
form i{
    display: inline-block;
    width: 32px;
    height: 32px;
    position: absolute;
    top: 9px;
    right: 35px;
    cursor: pointer;
}
i.invisible{
    background: url('../../assets/invisible.png') no-repeat;
}
i.visible{
    background: url('../../assets/visible.png') no-repeat;
}
input{
    width: 300px;
    height: 40px;
    text-indent: 10px;
    border: 1px solid #ccc;
    font-size: 16px;
    border-radius: 3px;
    outline: none;
}
input.input-error{
    border-color: red;
}
input.input-error:focus{
    border-color: red;
}
input:focus{
    border: 1px solid #1E90FF;
}
div.change-lang{
    margin: 30px 50px 0 0;
    >span{
        margin-right: 10px;
        padding: 5px;
        color: #fff;
    }
    >select{
        width: 120px;
        height: 30px;
        font-size: 14px;
        text-indent: 15px;
        border-radius: 5px;
        &:focus{
            border-radius: 5px;
        }
    }
}
</style>
