<template>
    <div id="footer">
        <div>
            <span>{{ lanMap['lang'] }}</span>
            <span> : </span>
            <span @click="changeLang('zh')"
                :style="{ 'color' : language === 'zh' ? '#67aef6' : '' }">
                简体中文
            </span>
            <span @click="changeLang('en')"
                :style="{ 'color' : language === 'en' ? '#67aef6' : '' }">
                English
            </span>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <span>{{ lanMap['fw_ver'] }}</span>
            <span> : </span>
            <span v-if="system && system.data">
                {{ system.data.fw_ver }}
            </span>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <span>{{ lanMap['macaddr'] }}</span>
            <span> : </span>
            <span v-if="system && system.data">{{ system.data.macaddr }}</span>
        </div>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
export default {
    name: 'bottomFooter',
    data(){
        return {
            lang: '',
        }
    },
    computed: mapState(['lanMap', 'language', 'system']),
    methods: {
        ...mapMutations({
            change_lang: 'updateLang'
        }),
        changeLang(lang){
            this.change_lang(lang);
        }
    }
}
</script>

<style lang="less" scoped>
#footer{
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30px;
    line-height: 30px;
    text-align: center;
    background: #fff;
    span{
        font-size: 15px;
        cursor: pointer;
    }
}
</style>
