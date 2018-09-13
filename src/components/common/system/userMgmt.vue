<template>
    <div class="user-mgmt">
        <h2>{{ lanMap['user_mgmt'] }}</h2>
        <div>
            <div>
                <h3>{{ lanMap['current_user_list'] }}</h3>
                <a href="javascript:void(0);" @click="open_add_user">{{ lanMap['add'] + lanMap['user'] }}</a>
                <a href="javascript:void(0);" @click="open_del_user" v-if="user_info.data && user_info.data.length > 0">{{ lanMap['delete'] + lanMap['user'] }}</a>
                <a href="javascript:void(0);" @click="open_modify_user">{{ lanMap['modify_user_pwd'] }}</a>
            </div>
            <div class="user-item bg-title">
                <span>{{ lanMap['user'] }}</span>
                <span>{{ lanMap['status'] }}</span>
                <span>{{ lanMap['user_level'] }}</span>
                <span>{{ lanMap['user_reenter'] }}</span>
                <span>{{ lanMap['desc'] }}</span>
            </div>
            <div v-for="(item,index) in user_info.data" class="user-item">
                <span>{{ item.name }}</span>
                <span>{{ item.status && item.logins ? '' + item.logins + '/' + item.reenter : 'offline' }}</span>
                <span>{{ u_level[item.level] }}</span>
                <span>{{ item.reenter }}</span>
                <span>{{ item.info }}</span>
            </div>
        </div>
        <div class="modal-dialog" v-if="show_add_modal">
            <div class="cover"></div>
            <div class="user-content">
                <div>
                    <h3>{{ lanMap['add'] + lanMap['user'] }}</h3>
                    <div>
                        <span>{{ lanMap['user'] }}</span>
                        <input type="text" v-model="user_name" v-focus placeholder="4-16 characters"
                         :style="{ 'border-color': user_name !== '' && !reg_uname.test(user_name) ? 'red' : ''}">
                    </div>
                    <div>
                        <span>{{ lanMap['new_pwd'] }}</span>
                        <input type="password" v-model="user_pwd1" placeholder="5-16 characters"
                         :style="{ 'border-color': user_pwd1 !== '' && !reg_pwd.test(user_pwd1) ? 'red' : ''}">
                    </div>
                    <div>
                        <span>{{ lanMap['cfm_pwd'] }}</span>
                        <input type="password" v-model="user_pwd2" placeholder="5-16 characters"
                         :style="{ 'border-color': user_pwd2 !== '' && !reg_pwd.test(user_pwd2) ? 'red' : ''}">
                    </div>
                    <div>
                        <span>{{ lanMap['user_level'] }}</span>
                        <select v-model.number="user_level">
                            <option value=""> - </option>
                            <option :value="index" v-for="(item,index) in u_level" :key="index" v-if="index > 2">{{ item }}</option>
                        </select>
                    </div>
                    <div>
                        <span>{{ lanMap['user_reenter'] }}</span>
                        <input type="text" v-model.number="user_reenter"  placeholder="1-4 times"
                         :style="{ 'border-color': isNaN(user_reenter) ? 'red' : ''}">
                    </div>
                    <div>
                        <span>{{ lanMap['desc'] }}</span>
                        <input type="text" v-model="user_desc" placeholder="description">
                    </div>
                    <div>
                        <a href="javascript:void(0);" @click="submit_add_user">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="close_add_user">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="close_add_user"></div>
            </div>
        </div>
        <div class="modal-dialog" v-if="show_del_modal">
            <div class="cover"></div>
            <div class="user-content del-content">
                <div>
                    <h3>{{ lanMap['delete'] + lanMap['user'] }}</h3>
                    <div>
                        <span>{{ lanMap['user'] }}</span>
                        <select v-model="user_name">
                            <option :value="item.name" v-for="(item,index) in user_info.data" :key="index">{{ item.name }}</option>
                        </select>
                    </div>
                    <div>
                        <a href="javascript:void(0);" @click="submit_del_user">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="close_del_user">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="close_del_user"></div>
            </div>
        </div>
        <div class="modal-dialog" v-if="show_current_user">
            <div class="cover"></div>
            <div class="user-content modify-user">
                <div>
                    <h3>{{ lanMap['modify_user_pwd'] }}</h3>
                    <div>
                        <span>{{ lanMap['user'] }}</span>
                        <span>{{ user_name }}</span>
                    </div>
                    <div>
                        <span>{{ lanMap['current_pwd'] }}</span>
                        <input type="password" v-model="user_pwd" 
                         :style="{ 'border-color': user_pwd !== '' && !reg_pwd.test(user_pwd) ? 'red' : ''}">
                    </div>
                    <div>
                        <span>{{ lanMap['new_pwd'] }}</span>
                        <input type="password" v-model="user_pwd1" 
                         :style="{ 'border-color': user_pwd1 !== '' && !reg_pwd.test(user_pwd1) ? 'red' : ''}">
                    </div>
                    <div>
                        <span>{{ lanMap['cfm_pwd'] }}</span>
                        <input type="password" v-model="user_pwd2" 
                         :style="{ 'border-color': user_pwd2 !== '' && !reg_pwd.test(user_pwd2) ? 'red' : ''}">
                    </div>
                    <div>
                        <a href="javascript:void(0);" @click="submit_modify_user">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="close_modify_user">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="close_modify_user"></div>
            </div>
        </div>
    </div>
</template>

<script>
import md5 from 'md5'
import { mapState } from 'vuex'
export default {
    name: 'userMgmt',
    computed: mapState(['lanMap','change_url']),
    data(){
        return {
            user_info: {},
            u_level: ['manu','diag','super','admin','operator','common'],
            user_name: '',
            //  新添加的密码&确认密码
            user_pwd1: '',
            user_pwd2: '',
            user_level: '',
            user_reenter: '',
            user_desc: '',
            show_add_modal: false,
            reg_uname: /^[a-zA-Z][a-zA-Z_\d]{3,15}$/,
            reg_pwd: /^[^\s\?\\\/\'\"]{5,16}$/,
            show_del_modal: false,
            show_current_user: false,
            //  现密码
            user_pwd: ''
        }
    },
    created(){
        this.getData();
    },
    methods: {
        getData(){
            this.$http.get(this.change_url.get_user_info).then(res=>{
                if(res.data.code === 1){
                    this.user_info = res.data;
                }else{
                    this.user_info = {};
                }
            }).catch(err=>{
                //  to do
            })
        },
        //  打开添加用户模态框
        open_add_user(){
            this.show_add_modal = true;
        },
        //  关闭添加用户模态框
        close_add_user(){
            this.show_add_modal = false;
            this.user_name ='';
            this.user_pwd1 ='';
            this.user_pwd2 ='';
            this.user_level = '';
            this.user_reenter = '';
            this.user_desc ='';
        },
        //  提交添加用户的信息
        submit_add_user(){
            if(!this.reg_uname.test(this.user_name)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['username_length_fail']
                })
                return
            }
            if(this.user_pwd1 !== this.user_pwd2){
                this.$message({
                    type: 'error',
                    text: this.lanMap['pwd_not_match']
                })
                return
            }
            if(!this.reg_pwd.test(this.user_pwd1)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['password_length_fail']
                })
                return
            }
            if(!this.user_level){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['user_level']
                })
                return
            }
            if(!this.user_reenter){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['reenter']
                })
                return 
            }
            var post_param = {
                "method":"add",
                "param":{
                    "name": this.user_name,
                    "key": md5(this.user_name + ':' + this.user_pwd1),
                    "level": this.user_level,
                    "reenter": this.user_reenter,
                    "info": this.user_desc
                }
            }
            this.$http.post('/usermgmt?form=userlist',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['setting_ok']
                    })
                    this.getData();
                }else if(res.data.code > 1){
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_add_user();
        },
        //  打开删除用户模态框
        open_del_user(){
            this.show_del_modal = true;
            this.user_name = this.user_info.data[0].name;
        },
        //  关闭删除用户模态框
        close_del_user(){
            this.show_del_modal = false;
            this.user_name = '';
        },
        //  提交将要删除的用户信息
        submit_del_user(){
            var post_param = {
                "method":"delete",
                "param":{
                    "name": this.user_name
                }
            }
            this.$http.post('/usermgmt?form=userlist',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['delete'] + this.lanMap['st_success']
                    })
                    this.getData();
                }else if(res.data.code > 1){
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_del_user();
        },
        open_modify_user(){
            this.show_current_user = true;
            this.user_name = sessionStorage.getItem('uname');
        },
        close_modify_user(){
            this.show_current_user = false;
            this.user_pwd = '';
            this.user_name ='';
            this.user_pwd1 ='';
            this.user_pwd2 ='';
        },
        submit_modify_user(){
            if(!this.reg_pwd.test(this.user_pwd)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['password_length_fail']
                })
                return
            }
            if(this.user_pwd1 !== this.user_pwd2){
                this.$message({
                    type: 'error',
                    text: this.lanMap['pwd_not_match']
                })
                return
            }
            if(!this.reg_pwd.test(this.user_pwd1)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['password_length_fail']
                })
                return
            }
            var post_param = {
                "method":"set",
                "param":{
                    "name": this.user_name,
                    "key": md5(this.user_name + ':' + this.user_pwd),
                    "key1": md5(this.user_name + ':' + this.user_pwd1)
                }
            }
            this.$http.post('/usermgmt?form=modifyps',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['modify_success']
                    })
                    this.logout();
                }else if(res.data.code > 1){
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_modify_user();
        },
        logout(){
            var post_params = {
                "method":"set",
                "param":{
                    "name": this.uName
                }
            }
            this.$http.post('/userlogin?form=logout',post_params).then(res=>{
                sessionStorage.removeItem('x-token');
                this.$router.push('/login');
            }).catch(err=>{
                // to do
            })
        }
    }
}
</script>

<style lang="less" scoped>
a{
    padding: 0 20px;
    margin-left: 30px;
}
input[type="password"] {
    text-indent: 10px;
    font-size: 16px;
    height: 30px;
    line-height: 30px;
    border: 1px solid #c8cccf;
    border-radius: 3px;
    color: #000;
    outline: 0;
    text-decoration: none;
}
input[type="password"]:focus {
  border: 1px solid #1e90ff;
  border-radius: 3px;
}
select{
    width: 195px;
    font-size: 16px;
    text-indent: 6px;
    border-radius: 3px;
    height: 30px;
    line-height: 30px;
}
div.user-mgmt{
    margin: 20px 0 30px 10px;
    >div{
        margin: 0 0 0 10px;
        h3{
            font-size: 20px;
            color: #67aef7;
            font-weight: 500;
            margin: 0 0 10px 0;
            float: left;
        }
        div:first-child{
            font-size: 16px;
            margin: 0 0 15px 0;
            &:after{
                content: '';
                display: table;
                clear: both;
            }
        }
        div.user-item{
            font-size: 0;
            span{
                font-size: 16px;
                display: inline-block;
                border: 1px solid #ccc;
                vertical-align: middle;
                border-right: none;
                border-bottom: none;
                text-align: center;
                height: 30px;
                line-height: 30px;
                width: 15%;
                &:last-child{
                    width: 39%;
                    border-right: 1px solid #ccc;
                }
            }
            &:last-child>span{
                border-bottom: 1px solid #ccc;
            }
        }
        .bg-title>span{
            background: #67aef6;
        }
    }
}
h2{
    font-size: 24px;
    font-weight: 600;
    color: #67AEF7;
    margin-right: 50px;
    margin-bottom: 30px;
}
div.user-content{
    width: 500px;
    height: 360px;
    >div{
        h3{
            float: none;
            height: 45px;
            line-height: 60px;
            padding-left: 30px;
        }
        div{
            height: 30px;
            line-height: 30px;
            margin: 10px 0;
            span:first-child{
                display: inline-block;
                width: 150px;
                text-align: right;
                padding-right: 20px;
            }
            a{
                width: 100px;
                margin: 12px 0 0 72px;
            }
        }
    }
}
div.del-content{
    height: 180px;
    >div{
        h3{
            height: 50px;
        }
        div{
            a{
                margin-top: 20px;
            }
        }
    }
}
div.modify-user{
    height: 290px;
    >div{
        h3{
            height: 50px;
        }
        div{
            span:first-child{
                width: 180px;
            }
            a{
                margin-top: 15px;
            }
        }
    }
}
</style>
