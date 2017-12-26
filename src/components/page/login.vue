<template>
    <div class="login">
        <div class="login-banner">
            <div class="lf"></div>
            <h1 class="lf"></h1> 
        </div>
        <div class="login-body">
            <h2>登录</h2>
            <h3>登录以管理此设备</h3>
            <form>
                <div>
                    <span>USER</span>
                    <input type="text" v-model="userName">
                </div>
                <div class="user-pwd">
                    <span>password</span>
                    <input type="password" v-model="userPwd" id="userPwd">
                    <i :class="[ visible ? 'visible' : 'invisible']" @click="changeVisible"></i>
                </div>
                <h3 :style="{'opacity': verify_uname ? 1 : 0}">
                    请输入符合规范的4-20位用户名，不能输入中文、空格和特殊字符
                </h3>
                <h3 :style="{'opacity': verify_upwd ? 1 : 0}">
                    密码限定长度为6-20位,且不能使用空格
                </h3>
                <div>
                    <a href="javascript:;" @click="userLogin">登录</a>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'login',
        data(){
            return {
                userName: '',
                userPwd: '',
                verify_uname: false,
                verify_upwd: false,
                visible: false
            }
        },
        methods: {
            userLogin(){

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
                var reg = /^\w{4,20}$/;
                if(!reg.test(this.userName)){
                    this.verify_uname = true;
                }else{
                    this.verify_uname = false;
                }
                if(this.userName == ''){
                    this.verify_uname = false;
                }
            },
            userPwd(){
                var reg = /^\S{6,20}$/;
                if(!reg.test(this.userPwd)){
                    this.verify_upwd = true;
                }else{
                    this.verify_upwd = false;
                }
                if(this.userPwd == ''){
                    this.verify_upwd = false;
                }
            }
        }
    }
</script>

<style scoped>
div.login{
    width: 100%;
    min-width: 1280px;
    height: 100%;
    background: #62628B;
}
div.login-banner{
    height: 150px;
    background: rgb(73, 44, 44);
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
form>h3{
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    color: red;
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
input:focus{
    border: 1px solid #1E90FF;
}
</style>
