<template>
    <div id="left-aside" class="lf">
        <ul class="menu" v-if="menu.data && lanMap">
            <!-- 主菜单/左侧导航栏 -->
            <li v-for="(item,index) in menu.data.menu" :key="index">
                <p class="menu-item" @click="select_first_menu(item)" :class="[ item.isHidden ? 'active' : '' ]"> 
                    {{ lanMap[item.name] }}
                </p>
                <!-- 二级菜单 -->
                <transition name="bounce">
                    <ul class="sub-menu" v-if="item.children" :class="{ hide: item.isHidden }">
                        <li v-for="(_item,_index) in item.children" :key="_index" @click="select_second_menu($event,_item.name)">
                            <p class="sub-item" @click="select_page(_item)">
                                {{ lanMap[_item.name] }}
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
        this.getData();
    },
    methods:{
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
            // 检查 菜单项下面是否有子菜单
            if(!node.children){
                for(var key in this.menu.data.menu){
                    this.menu.data.menu[key].isHidden = false;
                }
                node.isHidden = true;
                this.$router.replace(node.name);
                var sub_item = document.querySelectorAll('p.sub-item');
                for(var i=0;i<sub_item.length;i++){
                    sub_item[i].className = 'sub-item';
                }
            }else{
            // 如有，加上打开折叠效果
                if(node.isHidden){
                    for(var key in this.menu.data.menu){
                        this.menu.data.menu[key].isHidden = false;
                    }
                }else{
                    for(var key in this.menu.data.menu){
                        this.menu.data.menu[key].isHidden = false;
                    }
                    node.isHidden = true;
                }
            }
            sessionStorage.setItem('first_menu',node.name);
        },
        //  子菜单被选中时样式
        select_second_menu(e,str){
            var sub_item = document.querySelectorAll('p.sub-item');
            for(var i=0;i<sub_item.length;i++){
                sub_item[i].className = 'sub-item';
            }
            e.target.className += ' actived';
            sessionStorage.setItem('sec_menu',str);
        },
        //  点击切换页面
        select_page(node){
            this.$router.replace(node.name);
        }
    },
    computed: mapState(['lanMap','menu']),
    watch: {
        //  页面刷新时的menu状态恢复
        'menu'(){
            var first_menu = sessionStorage.getItem('first_menu');
            var sec_menu = sessionStorage.getItem('sec_menu');
            if(first_menu){
                this.menu.data.menu.forEach(item=>{
                    if(item.name === first_menu){
                        item.isHidden = true;
                    }
                })
                if(sec_menu){
                    this.$nextTick(()=>{
                        var sub_item = document.querySelectorAll('p.sub-item');
                        for(var i=0;i<sub_item.length;i++){
                            if(sub_item[i].innerHTML.replace(/^\s*|\s*$/g,'') === this.lanMap[sec_menu].replace(/^\s*|\s*$/g,'')){
                                sub_item[i].className += ' actived';
                            }
                        }
                    })
                }
            }
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
    background: #2F2F39;
    box-shadow: 5px 0 3px #666;
    z-index: 999;
    user-select: none;
}
.menu>li>ul{
    transition: all 0.3s ease-out;
}
.active{
    color:#3990e5;
}
.sub-menu>li>p.actived{
    border-left: 5px solid #3990e5;
    background: #666;
    color: #fff;
}
.menu>li>ul.hide{
    max-height: 330px;
    transition: max-height 0.3s ease-in;
}
.menu{
    color:#9AAABA;
    background: #393946;
}
.menu>li{
    overflow: hidden;
}
.menu-item{
    padding:15px 0 15px 30px;
    cursor: pointer;
    transition:all 0.3s linear;
}
.menu-item:hover{
    color:#fff;
    background: #666666;
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
    background: #2F2F39;
    transition: all 0.3s linear;
    border-left: 5px solid transparent;
}
.sub-item:hover{
    color:#fff;
    background: #666666;
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
</style>
