<template>
    <div id="left-aside" class="lf">
        <ul class="menu" v-if="menu.data && lanMap">
            <!-- 主菜单/左侧导航栏 -->
            <li v-for="(item, index) in menu.data.menu" :key="index">
                <p
                    class="menu-item"
                    @click="select_first_menu(item)"
                    :class="[adv_f_menu === item.name ? 'active' : '']"
                >
                    {{ lanMap[item.name] || item.name }}
                    <i class="icon-arrows" v-if="item.children"></i>
                </p>
                <!-- 二级菜单 -->
                <transition name="bounce">
                    <ul
                        v-if="item.children"
                        :class="[
                            'sub-menu',
                            { hide: adv_f_menu === item.name },
                        ]"
                    >
                        <li
                            v-for="(_item, _index) in item.children"
                            :key="_index"
                        >
                            <p
                                :class="[
                                    'sub-item',
                                    {
                                        'submenu-actived':
                                            adv_menu === _item.name,
                                    },
                                ]"
                                @click="select_page(_item)"
                            >
                                {{ lanMap[_item.name] || _item.name }}
                            </p>
                        </li>
                    </ul>
                </transition>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
export default {
    name: "leftAside",
    data() {
        return {};
    },
    created() {},
    beforeDestroy() {
        this.changeFMenu("running_status");
    },
    methods: {
        ...mapMutations({
            addmenu: "updateMenu",
            changeAdvMenu: "updateAdvMenu",
            changeFMenu: "updateAdvFMenu",
        }),
        select_first_menu(node) {
            if (!node.children) {
                this.$router.replace(node.name);
            }
            if (this.adv_f_menu === node.name) {
                this.changeFMenu("");
                return;
            }
            this.changeFMenu(node.name);
        },
        //  点击切换页面
        select_page(node) {
            this.$router.replace(node.name);
        },
    },
    computed: mapState([
        "lanMap",
        "menu",
        "change_url",
        "adv_menu",
        "adv_f_menu",
    ]),
    watch: {
        //  页面刷新时的menu状态恢复
        menu() {
            var first_menu = sessionStorage.getItem("first_menu");
            var sec_menu = sessionStorage.getItem("sec_menu");
            this.changeFMenu(first_menu);
            this.changeAdvMenu(sec_menu);
        },
    },
};
</script>

<style scoped lang="less">
#left-aside {
    width: 220px;
    height: calc(~"100% - 70px");
    overflow: auto;
    position: absolute;
    left: 0;
    top: 70px;
    background: @asideBgColor;
    z-index: 99;
    user-select: none;
}
.menu > li > ul {
    transition: all 0.2s ease-out;
}
.active {
    border-left: 5px solid @activedAsideLeftBorderColor;
    color: @activedAsideColor;
    background: @activedAsideBgColor;
    i.icon-arrows {
        background-position: -48px -6px;
    }
}
.sub-menu > li > p.submenu-actived {
    background: @activedSubAsideBgColor;
    color: @activedSubAsideColor;
    font-weight: 500;
}
.menu > li > ul.hide {
    max-height: 380px;
    transition: max-height 0.3s ease-in;
}
.menu > li {
    overflow: hidden;
}
.menu-item {
    padding: 15px 0 15px 30px;
    cursor: pointer;
    transition: all 0.2s linear;
    height: 32px;
    line-height: 32px;
    position: relative;
    font-weight: 500;
}
.menu-item:hover {
    background: @hoverAsideBgColor;
}
.menu-footer {
    color: @asideFooterBgColor;
    font-size: 14px;
    text-align: center;
    margin: 60px auto 100px;
}
.sub-menu {
    max-height: 0;
    height: auto;
}
.sub-item {
    padding: 10px 0 10px 40px;
    cursor: pointer;
    background: @subAsideBgColor;
    transition: all 0.2s linear;
    border-left: 5px solid transparent;
}
.sub-item:hover {
    background: @hoverAsideBgColor;
}
.menu-footer {
    color: @asideFooterColor;
    div {
        margin: 20px 0;
    }
    h4 {
        text-align: left;
        padding-left: 10px;
        margin-bottom: 10px;
    }
    p {
        padding-left: 15px;
        word-wrap: break-word;
        word-break: break-all;
        text-align: left;
    }
}
i.icon-arrows {
    position: absolute;
    right: 10px;
    width: 32px;
    height: 32px;
    background: url("../../assets/arrows.png") -7px -48px no-repeat;
    vertical-align: middle;
}
</style>
