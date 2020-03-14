<template>
    <div>
        <page-header type="none">
            <span slot="title">ARP</span>
            <div slot="action">
                <a href="javascript:void(0);" @click="refreshTable">{{ lanMap['refresh'] }}</a>
                <a
                    href="javascript:void(0);"
                    @click="openDelModal"
                    style="margin-left: 30px;"
                >{{ lanMap['delete_all'] }}</a>
            </div>
        </page-header>
        <nms-table :rows="show_arp" border>
            <nms-table-column prop="ipaddress" :label="lanMap['ipaddr']"></nms-table-column>
            <nms-table-column prop="macaddress" :label="lanMap['macaddr']"></nms-table-column>
            <nms-table-column prop="vlanid" :label="lanMap['vlan_id']"></nms-table-column>
            <nms-table-column :label="lanMap['port_id']">
                <template slot-scope="rows">{{ rows.portid | getPortName }}</template>
            </nms-table-column>
        </nms-table>
        <nms-pagination
            :total="arp.length"
            :current-page="index"
            :page-size="display"
            @current-change="changeIndex"
            style="float: right;"
        ></nms-pagination>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { debounce } from "@/utils/common";
export default {
    name: "arp",
    computed: {
        ...mapState(["change_url", "lanMap", "port_name"]),
        show_arp() {
            const start = (this.index - 1) * this.display,
                end = start + this.display;
            if (end >= this.arp.length) {
                return this.arp.slice(start);
            }
            return this.arp.slice(start, end);
        }
    },
    data() {
        return {
            arp: [],
            index: 1,
            display: 20,
            isShowPagination: false,
            pagesData: {}
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.arp = [];
            this.$http
                .get(this.change_url.get_arp)
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data && res.data.data.length) {
                            this.arp = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        changeIndex(index) {
            this.index = index;
        },
        openDelModal() {
            this.$confirm(this.lanMap["if_sure"])
                .then(_ => {
                    this.destroyARP();
                })
                .catch(_ => {});
        },
        destroyARP() {
            const post_data = {
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
                            text: "(" + res.data.code + ") " + res.data.message
                        });
                    }
                })
                .catch(err => {});
        },
        refreshTable() {
            debounce(this.getData, 500, this);
        }
    }
};
</script>

<style lang="less" scoped>
// h3 {
//     font-size: 24px;
//     font-weight: 600;
//     color: @titleColor;
//     margin: 10px 0 20px 0;
//     > a {
//         font-size: 16px;
//         margin-left: 30px;
//         font-weight: 400;
//     }
// }
</style>
