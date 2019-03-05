<template>
    <div id="left-aside" class="lf">
        <ul class="menu" v-if="menu.data && lanMap">
            <!-- 主菜单/左侧导航栏 -->
            <li v-for="(item,index) in menu.data.menu" :key="index">
                <p class="menu-item" @click="select_first_menu(item)" :class="[ adv_f_menu === item.name ? 'active' : '' ]"> 
                    {{ lanMap[item.name] || item.name }}
                    <i class="icon-arrows" v-if="item.children"></i>
                </p>
                <!-- 二级菜单 -->
                <transition name="bounce">
                    <ul class="sub-menu" v-if="item.children" :class="{ hide: adv_f_menu === item.name }">
                        <li v-for="(_item,_index) in item.children" :key="_index">
                            <p :class="['sub-item' , adv_menu === _item.name ? 'actived' : '']" @click="select_page(_item)">
                                {{ lanMap[_item.name] || _item.name }}
                            </p>
                        </li>
                    </ul>
                </transition>
            </li>
        </ul>
        <div class="menu-footer">
            <div v-if="company_name">
                <h4>{{ lanMap['company_name'] }}</h4>
                <p>{{ company_name }}</p>
            </div>
            <div v-if="company_addr">
                <h4>{{ lanMap['company_addr'] }}</h4>
                <p>{{ company_addr }}</p>
            </div>
            <div v-if="company_email">
                <h4>{{ lanMap['company_email'] }}</h4>
                <p>{{ company_email }}</p>
            </div>
            <div v-if="company_phone">
                <h4>{{ lanMap['company_phone'] }}</h4>
                <p>{{ company_phone }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
export default {
    name: 'leftAside',
    data(){
        return {
            company_name: '',
            company_addr: '',
            company_email: '',
            company_phone: ''
        }
    },
    created(){
        
    },
    beforeDestroy(){
        this.changeFMenu('running_status');
    },
    methods:{
        ...mapMutations({
            addmenu: 'updateMenu',
            changeAdvMenu: 'updateAdvMenu',
            changeFMenu: 'updateAdvFMenu'
        }),
        getData(){
            this.$http.get('/board?info=setting_board').then(res=>{
                if(res.data.code === 1){
                    var data = res.data.data;
                    this.company_name = data.name || '';
                    this.company_addr = data.addr || '';
                    this.company_email = data.email || '';
                    this.company_phone = data.phone || '';
                }else{
                    this.company_name = '';
                    this.company_addr = '';
                    this.company_email = '';
                    this.company_phone = '';
                }
            }).catch(err=>{
                // to do
            })
        },
        select_first_menu(node){
            this.changeFMenu(node.name);
            if(!node.children){
                this.$router.replace(node.name);
            }
        },
        //  点击切换页面
        select_page(node){
            this.$router.replace(node.name);
        }
    },
    computed: mapState(['lanMap', 'menu', 'change_url', 'adv_menu', 'adv_f_menu']),
    watch: {
        //  页面刷新时的menu状态恢复
        'menu'(){
            var first_menu = sessionStorage.getItem('first_menu');
            var sec_menu = sessionStorage.getItem('sec_menu');
            this.changeFMenu(first_menu);
            this.changeAdvMenu(sec_menu);
        }
    }
}
</script>

<style scoped lang="less">
#left-aside{
    width: 220px;;
    height: 100%;
    overflow: auto;
    position: fixed;
    left: 0;
    top: 70px;
    background: #eee;
    //box-shadow: 5px 0 3px #eee;
    //z-index: 999;
    user-select: none;
}
.menu>li>ul{
    transition: all 0.2s ease-out;
}
.active{
    border-left: 5px solid #3990e5;
    color:#3990e5;
    background: #dcd6d6;
    i.icon-arrows{
        background-position: -48px -6px;
    }
}
.sub-menu>li>p.actived{
    background: #E0EFE7;
    color: #3990e5;
    font-weight: 500;
}
.menu>li>ul.hide{
    max-height: 330px;
    transition: max-height 0.3s ease-in;
}
.menu>li{
    overflow: hidden;
}
.menu-item{
    padding:15px 0 15px 30px;
    cursor: pointer;
    transition:all 0.2s linear;
    height: 32px;
    line-height: 32px;
    position: relative;
    font-weight: 500;
}
.menu-item:hover{
    //color:#666;
    background: #F0E5D8;
} 
.expressConfig{
    width: 168px;
    height: 32px;
    line-height: 32px;
    font-size: 14px;
    color: #D6CDC8;
    background: #5B677A;
    text-align: center;
    border-radius: 5px;
    margin: 50px auto;
    cursor: pointer;
    font-weight: bold;
}
.menu-footer{
    color:#8f8f8f;
    font-size: 14px;
    text-align:center;
    margin: 60px auto 100px;
}
.sub-menu{
    max-height: 0;
    height: auto;
}
.sub-item{
    padding:10px 0 10px 40px;
    cursor: pointer;
    background: #E8E8E8;
    transition: all 0.2s linear;
    border-left: 5px solid transparent;
}
.sub-item:hover{
    //color:#666;
    background: #F0E5D8;
}
.menu-footer{
    color: #afafaf;
    div{
        margin: 20px 0;
    }
    h4{
        text-align: left;
        padding-left: 10px;
        margin-bottom: 10px;
    }
    p{
        padding-left: 15px;
        word-wrap: break-word;
        word-break: break-all;
        text-align: left;
    }
}
i.icon-arrows{
    position: absolute;
    right: 10px;
    width: 32px;
    height: 32px;
    background: url('../../assets/arrows.png') -7px -48px no-repeat;
    vertical-align: middle;
}
</style>
