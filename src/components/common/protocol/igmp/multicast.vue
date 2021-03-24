<template>
    <div class="multicast">
        <div>
            <span>{{ lanMap["multicast_table"] }}</span>
            <span>
                <nms-button size="mini" @click="open_add_modal">{{
                    lanMap["add"] + lanMap["static_table"]
                }}</nms-button>
                <nms-button
                    size="mini"
                    v-if="static_multi.length > 0"
                    @click="deleteAllStatic"
                    >{{
                        lanMap["delete_all"] + lanMap["static_table"]
                    }}</nms-button
                >
                <nms-button size="mini" @click="deleteAllDynamic">{{
                    lanMap["delete_all"] + lanMap["dynamic_table"]
                }}</nms-button>
            </span>
            <i @click="getData"></i>
        </div>
        <nms-table :rows="multicast_tab" border>
            <nms-table-column
                prop="multi_ip"
                :label="lanMap['multi_ip']"
            ></nms-table-column>
            <nms-table-column
                prop="user_num"
                :label="lanMap['user_num']"
            ></nms-table-column>
            <nms-table-column
                prop="vid"
                :label="lanMap['vid']"
            ></nms-table-column>
            <nms-table-column :label="lanMap['action']">
                <template slot-scope="rows">{{
                    rows.action ? lanMap["static"] : lanMap["dynamic"]
                }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['host_portlist']">
                <template slot-scope="rows">
                    <template v-if="rows.host_portlist">{{
                        rows.host_portlist | parsePortList
                    }}</template>
                    <template v-else>-</template>
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['router_portlist']">
                <template slot-scope="rows">
                    <template v-if="rows.router_portlist">{{
                        rows.router_portlist | parsePortList
                    }}</template>
                    <template v-else>-</template>
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['config']">
                <template slot-scope="row">
                    <nms-button type="text" @click="deleteMulticast(row)">{{
                        lanMap["delete"]
                    }}</nms-button>
                </template>
            </nms-table-column>
        </nms-table>
        <nms-pagination
            :total="multicast_info.length"
            :current-page="index"
            :page-size="display"
            @current-change="changeIndex"
            style="float: right"
        ></nms-pagination>
        <div class="modal-dialog" v-if="show_add_modal">
            <div class="cover"></div>
            <div class="add-content">
                <div>
                    <h3 class="modal-header">
                        {{ lanMap["add"] + lanMap["static_table"] }}
                    </h3>
                    <div>
                        <span>{{ lanMap["multi_ip"] }}</span>
                        <input
                            type="text"
                            v-focus
                            v-model.trim="multi_ip"
                            placeholder="ex : 127.1.1.1"
                            :style="{
                                'border-color':
                                    multi_ip !== '' && !reg_ip.test(multi_ip)
                                        ? 'red'
                                        : '',
                            }"
                        />
                    </div>
                    <div>
                        <span>{{ lanMap["vid"] }}</span>
                        <input
                            type="text"
                            v-model.number="vid"
                            placeholder="1-4094"
                            :style="{
                                'border-color':
                                    vid !== '' &&
                                    (vid < 1 || vid > 4094 || isNaN(vid))
                                        ? 'red'
                                        : '',
                            }"
                        />
                    </div>
                    <div>
                        <span>{{ lanMap["port_id"] }}</span>
                        <select v-model.number="portid">
                            <option
                                :value="key"
                                v-for="(item, key) in port_name.pon"
                                :key="key"
                            >
                                {{ item.name }}
                            </option>
                            <option
                                :value="key"
                                v-for="(item, key) in port_name.ge"
                                :key="key"
                            >
                                {{ item.name }}
                            </option>
                            <option
                                :value="key"
                                v-for="(item, key) in port_name.xge"
                                :key="key"
                                v-if="port_name.xge"
                            >
                                {{ item.name }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <a
                            href="javascript:void(0);"
                            @click="submit_add_multi"
                            >{{ lanMap["apply"] }}</a
                        >
                        <a
                            href="javascript:void(0);"
                            @click="close_add_modal"
                            >{{ lanMap["cancel"] }}</a
                        >
                    </div>
                </div>
                <div class="close" @click="close_add_modal"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "multicast",
    computed: {
        ...mapState(["lanMap", "change_url", "port_name", "system"]),
        multicast_tab() {
            const start = (this.index - 1) * this.display;
            const end = start + this.display;
            if (end >= this.multicast_info.length) {
                return this.multicast_info.slice(start);
            }
            return this.multicast_info.slice(start, end);
        },
    },
    data() {
        return {
            multicast_info: [],
            //  分页数据
            index: 1,
            display: 10,
            //  静态组播项参数 * 3
            portid: 1,
            vid: "",
            multi_ip: "",
            reg_ip: /^((2[0-4]\d|25[0-5]|1?\d?\d)(\.(?!$)|$)){4}/,
            //  模态框
            show_add_modal: false,
            //  所有静态组播表项
            static_multi: [],
        };
    },
    created() {
        this.getData();
    },
    activated() {
        this.getData();
    },
    methods: {
        getData() {
            this.multicast_info = [];
            this.static_multi = [];
            this.index = 1;
            this.$http
                .get("/switch_igmp?form=entry")
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$http
                            .get("/igmp_snooping_table")
                            .then((_res) => {
                                if (_res.data.code === 1) {
                                    if (
                                        _res.data.data &&
                                        _res.data.data.length
                                    ) {
                                        this.multicast_info = _res.data.data;
                                        this.static_multi = this.multicast_info.filter(
                                            (item) => item.action === 1
                                        );
                                    }
                                }
                            })
                            .catch((_err) => {});
                    }
                })
                .catch((err) => {});
        },
        //  分页跳转
        changeIndex(index) {
            this.index = index;
        },
        //  打开添加窗口
        open_add_modal() {
            this.show_add_modal = true;
        },
        //  关闭添加窗口
        close_add_modal() {
            this.show_add_modal = false;
            this.multi_ip = "";
            this.portid = 1;
            this.vid = "";
        },
        //  提交添加信息
        submit_add_multi() {
            if (!this.reg_ip.test(this.multi_ip)) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["multi_ip"],
                });
                return;
            }
            if (this.vid < 1 || this.vid > 4094 || isNaN(this.vid)) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] + ": " + this.lanMap["vid"],
                });
                return;
            }
            var post_param = {
                method: "add",
                param: {
                    multi_ip: this.multi_ip,
                    vid: this.vid,
                    port_id: this.portid,
                },
            };
            this.$http
                .post("/switch_igmp?form=static_entry", post_param)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"],
                        });
                        this.getData();
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message,
                        });
                    }
                })
                .catch((err) => {
                    // to do
                });
            this.close_add_modal();
        },
        deleteMulticast(data) {
            this.$confirm()
                .then(() => {
                    const url = this.static_multi.includes(data)
                        ? "/switch_igmp?form=static_entry"
                        : "/switch_igmp?form=dynamic_entry";
                    const post_params = {
                        method: "delete",
                        param: {
                            multi_ip: data.multi_ip,
                            vid: data.vid,
                        },
                    };
                    this.$http
                        .post(url, post_params)
                        .then((res) => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["delete"] +
                                        this.lanMap["st_success"]
                                );
                                this.getData();
                            } else {
                                this.$message.error(
                                    `(${res.data.code}) ${res.data.message}`
                                );
                            }
                        })
                        .catch((err) => {});
                })
                .catch(() => {});
        },
        deleteAllDynamic() {
            this.$confirm()
                .then(() => {
                    this.deleteAll("/switch_igmp?form=dynamic_entry_all", {
                        method: "delete",
                        param: {},
                    });
                })
                .catch(() => {});
        },
        deleteAllStatic() {
            this.$confirm()
                .then(() => {
                    this.deleteAll("/switch_igmp?form=static_entry_all", {
                        method: "delete",
                        param: {},
                    });
                })
                .catch(() => {});
        },
        deleteAll(url, data) {
            this.$http
                .post(url, data)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message.success(
                            this.lanMap["delete"] + this.lanMap["st_success"]
                        );
                        this.getData();
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                })
                .catch((err) => {});
        },
    },
};
</script>

<style lang="less" scoped>
select {
    width: 200px;
    height: 30px;
    text-indent: 6px;
    border-radius: 3px;
    font-size: 16px;
}
div.multicast {
    > div:first-child {
        span:first-child {
            font-size: 18px;
            color: @titleColor;
            display: inline-block;
            width: 200px;
        }
        a + a {
            margin-left: 20px;
        }
        i {
            display: inline-block;
            width: 32px;
            height: 32px;
            background: url("../../../../assets/refresh.png") no-repeat;
            vertical-align: middle;
            margin-left: 30px;
            cursor: pointer;
        }
    }
    div.add-content {
        width: 500px;
        height: 250px;
        > div {
            div {
                height: 30px;
                line-height: 30px;
                margin: 10px 0;
                span:first-child {
                    display: inline-block;
                    width: 220px;
                    text-align: center;
                }
            }
            a {
                margin-left: 105px;
                margin-top: 10px;
            }
        }
    }
}
</style>
