<template>
    <div id="left-aside" class="lf" v-if="this.data.code && lanMap">
        <ul class="menu">
            <!-- 主菜单/左侧导航栏 -->
            <li v-for="(item,index) in this.data.data.menu" :key="index">
                <!-- 添加点击事件  onselectstart =>禁止双击选取文本 -->
                <p class="menu-item" @click="handleClick(item,$event)" onselectstart="return false;" :class="[ item.isHidden ? 'active' : '' ]"> 
                    {{ lanMap[item.name] }}
                </p>
                <!-- 二级菜单 -->
                <transition name="bounce">
                    <ul class="sub-menu" v-if="item.children" :class="{ hide: item.isHidden }">
                        <li v-for="(_item,_index) in item.children" :key="_index" @click="selectEvent($event)">
                            <!-- 添加点击事件  onselectstart =>禁止双击选取文本 -->
                            <p class="sub-item" @click="selectItem(_item)" onselectstart="return false;">
                                {{ lanMap[_item.name] }}
                            </p>
                        </li>
                    </ul>
                </transition>
            </li>
        </ul>
        <div class="expressConfig">
            快速配置
        </div>
        <div class="menu-footer">公司信息<br>版权信息等</div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'leftAside',
    data(){
        return {
            data: {}
        }
    },
    created(){
        // 请求url: '/board?info=menu'
        this.$http.get('./menu.json').then(res=>{
            this.data = res.data;
            this.data.data.menu[0].isHidden = true;
        }).catch(err=>{
            // to do
        })
    },
    methods:{
        handleClick(node,e){
            // 检查 菜单项下面是否有子菜单
            if(!node.children){
                for(var key in this.data.data.menu){
                    this.data.data.menu[key].isHidden = false;
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
                    for(var key in this.data.data.menu){
                        this.data.data.menu[key].isHidden = false;
                    }
                }else{
                    for(var key in this.data.data.menu){
                        this.data.data.menu[key].isHidden = false;
                    }
                    node.isHidden = true;
                }
            }
            return 
        },
        //  子菜单被选中时样式
        selectEvent(e){
            var sub_item = document.querySelectorAll('p.sub-item');
            for(var i=0;i<sub_item.length;i++){
                sub_item[i].className = 'sub-item';
            }
            e.target.className += ' actived';
        },
        //  点击切换页面
        selectItem(node){
            console.log(node.name);
            this.$router.replace(node.name);
        },
        // 兼容firefox浏览器
        del_ff(elem){
            var elem_child = elem.childNodes;
            for(var i=0; i<elem_child.length;i++){
                if(elem_child[i].nodeName == "#text" && !/\s/.test(elem_child.nodeValue))
                    {elem.removeChild(elem_child)
                }
            }
        }
    },
    computed: mapState(['lanMap'])
}
</script>

<style scoped>
#left-aside{
    width:220px;
    height: 100%;
    overflow: auto;
    position: fixed;
    left: 0;
    top: 70px;
    background: #2F2F39;
    box-shadow: 5px 0 3px #666;
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
    max-height: 300px;
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
    padding:10px 0 10px 50px;
    cursor: pointer;
    background: #2F2F39;
    transition: all 0.3s linear;
    border-left: 5px solid transparent;
}
.sub-item:hover{
    color:#fff;
    background: #666666;
}
</style>
