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
                    <input type="text">
                </div>
                <div>
                    <span>password</span>
                    <input type="password">
                </div>
                <h3>请输入符合规范的用户名，不能输入中文、空格和特殊字符</h3>
                <div>
                    <a href="javascript:;">登录</a>
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
                userPwd: ''
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
    height: 200px;
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
div.login-body a:hover{
    background: #0099CC;
}
form div{
    height: 50px;
    line-height: 50px;
    width: 350px;
    margin: 20px auto;
    border: 1px solid #ddd;
}
form>h3{
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    color: red;
}
input{
    width: 200px;
    height: 30px;
    text-indent: 15px;
    border: 1px solid #ddd;
    outline: none;
}
input:focus{
    border: 1px solid #1E90FF;
}
</style>
