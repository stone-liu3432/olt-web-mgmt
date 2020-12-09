<template>
    <div id="content">
        <leftAside></leftAside>
        <detail></detail>
    </div>
</template>

<script>
import leftAside from "@/components/page/aside";
import detail from "@/components/page/detail";
export default {
    name: "content-area",
    components: {
        leftAside,
        detail,
    },
    provide() {
        return {
            scrollRef: this.scrollRef,
        };
    },
    methods: {
        scrollRef(top) {
            this.$el.scrollTop = top;
        },
    },
    beforeDestroy() {
        sessionStorage.removeItem("first_menu");
        sessionStorage.removeItem("sec_menu");
    },
};
</script>

<style lang="less" scoped>
#content {
    height: calc(~"100% - 100px");
    overflow-y: auto;
    &::after {
        content: "";
        display: table;
        clear: both;
    }
}
</style>
