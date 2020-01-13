<template>
    <div>
        <h3>
            ARP
            <a href="javascript:void(0);" @click="refreshTable">{{ lanMap['refresh'] }}</a>
            <a href="javascript:void(0);" @click="openDelModal">{{ lanMap['delete_all'] }}</a>
        </h3>
        <div class="arp-item arp-item-title">
            <span>{{ lanMap['ipaddr'] }}</span>
            <span>{{ lanMap['macaddr'] }}</span>
            <span>{{ lanMap['vlan_id'] }}</span>
            <span>{{ lanMap['port_id'] }}</span>
        </div>
        <div class="arp-item" v-if="arp.data && arp.data.length">
            <div v-for="(item, key) in show_arp" :key="key">
                <span>{{ item.ipaddress }}</span>
                <span>{{ item.macaddress }}</span>
                <span>{{ item.vlanid }}</span>
                <span>{{ portName(item.portid) }}</span>
            </div>
        </div>
        <customPagination v-if="isShowPagination" :pages-data="pagesData" @updatePage="changePage"></customPagination>
        <confirm v-if="isDel" @choose="destroyARP"></confirm>
    </div>
</template>

<script>
import { mapState } from "vuex";
import customPagination from "../pagination";
var limit = 20;
export default {
    name: "arp",
    computed: {
        ...mapState(["change_url", "lanMap", "port_name"])
    },
    components: { customPagination },
    data() {
        return {
            arp: {},
            show_arp: {},
            isShowPagination: false,
            pagesData: {},
            isDel: false,
            //  限制点击频率
            limit: true
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.$http
                .get(this.change_url.get_arp)
                .then(res => {
                    if (res.data.code === 1) {
                        this.arp = res.data;
                        var count = res.data.data.length;
                        this.pagesData = {
                            count,
                            limit
                        };
                        if (count > limit) {
                            this.isShowPagination = true;
                            this.show_arp = res.data.data.slice(0, limit);
                        } else {
                            this.show_arp = res.data.data;
                        }
                    } else {
                        this.arp = {};
                    }
                })
                .catch(err => {});
        },
        changePage(index) {
            var start = limit * (index - 1),
                end = limit * index;
            end > this.arp.data.length && (end = this.arp.data.length);
            this.show_arp = this.arp.data.slice(start, end);
        },
        portName(id) {
            return this.port_name.pon[id]
                ? this.port_name.pon[id].name
                : this.port_name.ge[id]
                ? this.port_name.ge[id].name
                : this.port_name.xge[id].name;
        },
        openDelModal() {
            this.isDel = true;
        },
        destroyARP(bool) {
            if (bool) {
                var post_data = {
                    method: "destroy",
                    param: {}
                };
                this.$http
                    .post("/switch_route?form=arp_flush", post_data)
                    .then(res => {
                        if (res.data.code === 1) {
                            this.$message({
                                type: res.data.type,
                                text:
                                    this.lanMap["delete"] +
                                    this.lanMap["st_success"]
                            });
                            this.getData();
                        } else {
                            this.$message({
                                type: res.data.type,
                                text:
                                    "(" +
                                    res.data.code +
                                    ") " +
                                    res.data.message
                            });
                        }
                    })
                    .catch(err => {});
            }
            this.isDel = false;
        },
        refreshTable() {
            if (this.limit) {
                this.limit = false;
                this.getData();
                setTimeout(() => {
                    this.limit = true;
                }, 500);
            }
        }
    }
};
</script>

<style lang="less" scoped>
h3 {
    font-size: 24px;
    font-weight: 600;
    color: #67aef7;
    margin: 10px 0 20px 0;
    > a {
        font-size: 16px;
        margin-left: 30px;
        font-weight: 400;
    }
}
div.arp-item-title {
    border: 1px solid #ddd;
    border-bottom: none;
    background: #2361a2;
    color: #fff;
}
div.arp-item {
    > div {
        border: 1px solid #ddd;
        border-top: none;
        &:first-child {
            border-top: 1px solid #ddd;
        }
        &:nth-of-type(odd) {
            background: #caecda;
        }
    }
    span {
        padding: 8px 0;
        display: inline-block;
        width: 24%;
        border-right: 1px solid #ddd;
        text-align: center;
        &:last-child {
            border-right: none;
        }
    }
}
</style>
