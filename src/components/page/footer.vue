<template>
    <div id="footer">
        <div>
            <template v-if="!custom.fix_lang">
                <span>{{ lanMap['lang'] }}</span>
                <span>:</span>
                <span
                    @click="changeLang('zh')"
                    :style="{ 'color' : language === 'zh' ? '#67aef6' : '' }"
                >简体中文</span>
                <span
                    @click="changeLang('en')"
                    :style="{ 'color' : language === 'en' ? '#67aef6' : '' }"
                >English</span>
                <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            </template>
            <span>{{ lanMap['fw_ver'] }}</span>
            <span>:</span>
            <span v-if="system && system.data">{{ system.data.fw_ver }}</span>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <span>{{ lanMap['macaddr'] }}</span>
            <span>:</span>
            <span v-if="system && system.data">{{ system.data.macaddr }}</span>
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
export default {
    name: "bottomFooter",
    data() {
        return {
            lang: "",
        };
    },
    computed: mapState(["lanMap", "language", "system", "custom"]),
    methods: {
        ...mapMutations({
            change_lang: "updateLang",
        }),
        changeLang(lang) {
            this.change_lang(lang);
            const data = {
                method: "set",
                param: {
                    lang,
                },
            };
            this.$http
                .post("/system_lang", data)
                .then((res) => {
                    // to do
                })
                .catch((err) => {});
        },
    },
};
</script>

<style lang="less" scoped>
#footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    min-width: 1280px;
    max-height: 1980px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    background: @footerBgColor;
    color: @footerColor;
    span {
        font-size: 15px;
        cursor: pointer;
    }
}
</style>
