<template>
  <div id="main-content">
      <topBanner></topBanner>
      <leftAside :sub-menu="sub_menu"></leftAside>
      <detail v-if="port_info && system"></detail>
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
                count: 0,
                max_time: 300,
                time: 0,
                interval: null,
                uName: '',
                sub_menu: [],
                active_menu: ''
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
                    var first_menu = sessionStorage.getItem('first_menu') || 'running_status';
                    res.data.data.menu.forEach(item=>{
                        if(first_menu === item.name){
                            if(item.children){
                                this.sub_menu = item.children;
                            }
                        }
                    })
                }
            }).catch(err=>{
                // to do
            })
            // this.$router.push('/main');
            this.uName = sessionStorage.getItem('uname');
            this.active_menu = sessionStorage.getItem('first_menu') || 'running_status';
        },
        mounted(){
            this.time = this.max_time;
            this.interval = setInterval(()=>{
                this.time--;
                if(this.time <= 0){
                    var post_params = {
                        "method": "set",
                        "param": {
                            "name": this.uName
                        }
                    }
                    this.$http.post('/userlogin?form=logout',post_params).then(res=>{
                        this.$message({
                            type: 'success',
                            text: this.lanMap['login_out']
                        })
                        sessionStorage.removeItem('x-token');
                        this.$router.replace('/login');
                    }).catch(err=>{
                        // to do
                    })
                }
            },1000)
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
                addmenu: 'updateMenu'
            }),
            user_timeout(e){
                this.time = this.max_time;
            },
            menu_click(menu){
                this.active_menu = menu.name;
                sessionStorage.setItem('first_menu', menu.name);
                this.sub_menu = menu.children ? menu.children : [{name: 'running_status'}];
            }
        },
        computed: mapState(['port_info','system','change_url','lanMap','menu'])
    }
</script>

<style lang="less">
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
ul.first-menu{
    margin: 100px 0 0 0;
    border-bottom: 1px solid #666;
    height: 50px;
    box-sizing: border-box;
    background: #eee;
    li{
        float: left;
        padding: 0 30px;
        text-align: center;
        line-height: 50px;
        border-bottom: 2px solid transparent;
        height: 48px;
        font-size: 18px;
        user-select: none;
        &:hover{
            cursor: pointer;
        }
    }
    li.active{
        border-color: #67aef6;
        color: #67aef6;
        font-weight: 500;
    }
    &:after{
        content: '';
        display: table;
        clear: both;
    }
}
</style>
