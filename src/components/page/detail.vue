<template>
    <div id="detail" class="lf">
        <div v-if="port_name.pon && port_name.ge">
            <keep-alive
                :include="['onuAllow','ponSetting','onuDeny','onuBasicInfo','slaCfg','onuPortCfg','perfInfo','portCfg','portVlan','igmp','multicast','multiVlan']"
            >
                <router-view v-if="isRouterAlive"></router-view>
            </keep-alive>
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
export default {
    name: "detail",
    data() {
        return {
            isRouterAlive: true
        };
    },
    computed: mapState(["lanMap", "change_url", "system", "port_name"]),
    created() {
        document.body.addEventListener("keydown", this.preventRefresh, false);
    },
    methods: {
        ...mapMutations({
            portInfo: "updatePortData",
            portName: "updatePortName"
        }),
        //  控制router子组件，销毁再加载，实现子组件更新
        reload() {
            this.isRouterAlive = false;
            this.$nextTick(() => {
                this.isRouterAlive = true;
            });
        },
        //  接管f5刷新页面
        preventRefresh(e) {
            var e = window.event || e;
            if (e.keyCode === 116 || (e.ctrlKey && e.keyCode == 82)) {
                if (window.event) {
                    try {
                        e.keyCode = 0;
                    } catch (e) {}
                    e.returnValue = false;
                }
                e.preventDefault();
                this.reload();
                return false;
            }
        }
    },
    beforeDestroy() {
        document.body.removeEventListener("keydown", this.preventRefresh);
    }
};
</script>

<style>
#detail {
    margin: 0 0 0 220px;
    padding: 20px;
    width: 79%;
    min-width: 1020px;
    min-height: 800px;
}
</style>
