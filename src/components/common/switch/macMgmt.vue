<template>
    <div>
        <div>
            <h2>{{ lanMap["mac_mgmt"] }}</h2>
        </div>
        <hr />
        <div v-if="mac_age.data" class="mac-age">
            <span>{{ lanMap["age"] }} :</span>
            <span>{{ mac_age.data.age }}</span>
            <a href="javascript:;" @click="change_macage">{{
                lanMap["config"]
            }}</a>
        </div>
        <div class="mac-age" v-if="cfg_age">
            <span>{{ lanMap["age"] }} :</span>
            <input
                type="text"
                v-model.number="macage"
                placeholder="secends"
                v-focus
            />
            <span class="tips">0 - 65535</span>
            <a href="javascript:;" @click="macage_choose(true)">{{
                lanMap["apply"]
            }}</a>
            <a href="javascript:;" @click="macage_choose(false)">{{
                lanMap["cancel"]
            }}</a>
        </div>
        <hr />
        <!-- 
            此功能开启时，去除静态MAC地址相关功能（添加，清除，查看）
        -->
        <template v-if="custom.mac_auth">
            <div class="mac-auth">
                <span>{{ lanMap["mac_auth_portlist"] }}:</span>
                <span class="mac-auth-portlist">{{ authPortlist }}</span>
                <a href="javascript: void(0);" @click="openDialog">{{
                    lanMap["config"]
                }}</a>
            </div>
            <hr />
        </template>
        <div class="query-select">
            <p>{{ lanMap["detail"] }}</p>
            <div>
                <a href="javascript:;" @click="add_mac_dialog">{{
                    lanMap["add_mac"]
                }}</a>
                <a href="javascript:;" @click="flush_mac_dialog">{{
                    lanMap["flush_mac"]
                }}</a>
            </div>
            <mac-query :data="tab" @data-change="dataChange"></mac-query>
        </div>
        <nms-table :rows="macList" border @sort-change="sortChange">
            <!-- <nms-table-column
                type="index"
                :label="lanMap['mac_index']"
            ></nms-table-column> -->
            <nms-table-column
                :label="lanMap['macaddr']"
                prop="macaddr"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['vlan_id']"
                prop="vlan_id"
                sortable
                sort-by="vlan_id"
                :sort-orders="sortOrders"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['port_id']"
                sortable
                sort-by="port_id"
                :sort-orders="sortOrders"
            >
                <template slot-scope="row">{{
                    row.port_id | getPortName
                }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['mac_type']">
                <template slot-scope="row">{{
                    lanMap[MAC_TYPES_MAP[row.mac_type]]
                }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['config']" width="100px">
                <template slot-scope="row">
                    <nms-button
                        type="text"
                        style="margin: 0"
                        @click="delete_mac(row)"
                        >{{ lanMap["delete"] }}
                    </nms-button>
                </template>
            </nms-table-column>
        </nms-table>
        <nms-pagination
            :total="mac_table.length"
            :current-page="pagination.index"
            @current-change="changeIndex"
            style="float: right"
            hide-on-single-page
        ></nms-pagination>
        <div class="modal-dialog" v-if="add_dialog">
            <div class="cover"></div>
            <div class="content">
                <h3 class="modal-header">{{ lanMap["add_mac"] }}</h3>
                <div class="add-mac-item">
                    <span>{{ lanMap["mac_type"] }}</span>
                    <select v-model.number="add_param.mac_type">
                        <template v-if="custom.mac_auth">
                            <option :value="1">{{ lanMap["static"] }}</option>
                        </template>
                        <option :value="2">{{ lanMap["blackhole"] }}</option>
                    </select>
                </div>
                <div class="add-mac-item">
                    <span>{{ lanMap["macaddr"] }}</span>
                    <input
                        type="text"
                        v-model="add_param.macaddr"
                        :style="{
                            'border-color':
                                this.check_mac.test(this.add_param.macaddr) ||
                                !this.add_param.macaddr
                                    ? ''
                                    : 'red',
                        }"
                    />
                    <span>ex: 00:00:00:00:00:00</span>
                </div>
                <div class="add-mac-item place-holder">
                    <span>{{ lanMap["vlan_id"] }}</span>
                    <input
                        type="text"
                        v-model.number="add_param.vlan_id"
                        :style="{
                            'border-color': !isNaN(this.add_param.vlan_id)
                                ? ''
                                : 'red',
                        }"
                    />
                    <span>range: 1-4094</span>
                </div>
                <div class="add-mac-item">
                    <span>{{ lanMap["port_id"] }}</span>
                    <select v-model.number="add_param.port_id">
                        <option
                            :value="item.id"
                            v-for="(item, key) in port_name.pon"
                            :key="key"
                        >
                            {{ item.name }}
                        </option>
                        <option
                            :value="item.id"
                            v-for="(item, key) in port_name.ge"
                            :key="key"
                        >
                            {{ item.name }}
                        </option>
                        <option
                            v-if="port_name.xge"
                            :value="item.id"
                            v-for="(item, key) in port_name.xge"
                            :key="key"
                        >
                            {{ item.name }}
                        </option>
                    </select>
                </div>
                <div class="add-mac-item">
                    <a href="javascript:;" @click="add_mac_table">{{
                        lanMap["apply"]
                    }}</a>
                    <a href="javascript:;" @click="add_mac_close_dialog">{{
                        lanMap["cancel"]
                    }}</a>
                </div>
                <div class="close" @click="add_mac_close_dialog"></div>
            </div>
        </div>
        <div class="modal-dialog" v-if="flush_dialog">
            <div class="cover"></div>
            <div class="content self-align">
                <h3 class="modal-header">{{ lanMap["flush_mac"] }}</h3>
                <div class="add-mac-item">
                    <span>{{ lanMap["flush_way"] }}</span>
                    <select v-model.number="flush_param.flags">
                        <option :value="1">{{ lanMap["mac_type"] }}</option>
                        <option :value="2">{{ lanMap["port_id"] }}</option>
                        <option :value="4">{{ lanMap["vlan_id"] }}</option>
                    </select>
                </div>
                <div class="add-mac-item">
                    <span>{{ lanMap["mac_type"] }}</span>
                    <select v-model.number="flush_param.mac_type">
                        <option :value="0">{{ lanMap["dynamic"] }}</option>
                        <template v-if="custom.mac_auth">
                            <option :value="1">{{ lanMap["static"] }}</option>
                        </template>
                        <option :value="2" v-if="flush_param.flags !== 2">
                            {{ lanMap["blackhole"] }}
                        </option>
                        <option :value="3">all</option>
                    </select>
                </div>
                <div class="add-mac-item" v-if="flush_param.flags === 4">
                    <span>{{ lanMap["vlan_id"] }}</span>
                    <input
                        type="text"
                        v-model.number="flush_param.vlan_id"
                        placeholder="VLAN ID"
                        :style="{
                            'border-color':
                                flush_param.vlan_id &&
                                (isNaN(flush_param.vlan_id) ||
                                    flush_param.vlan_id < 1 ||
                                    flush_param.vlan_id > 4094)
                                    ? 'red'
                                    : '',
                        }"
                    />
                    <span>range: 1-4094</span>
                </div>
                <div
                    class="add-mac-item"
                    v-if="flush_param.flags !== 2 && flush_param.flags !== 4"
                ></div>
                <div
                    class="add-mac-item item-align"
                    v-if="flush_param.flags === 2"
                >
                    <span>
                        <span class="lf">{{ lanMap["port_id"] }}</span>
                        <div class="lf">
                            <label for="selectAll" class="select-all">
                                <input
                                    type="checkbox"
                                    id="selectAll"
                                    v-model="select_all"
                                    @click="select_all_port"
                                />
                                {{ select_all_text }}
                            </label>
                        </div>
                    </span>
                    <div>
                        <div
                            v-for="(item, key) in port_name.pon"
                            :key="key"
                            class="lf"
                        >
                            <input
                                type="checkbox"
                                :id="item.name"
                                v-model="flush_param.port_id"
                                :value="item.id"
                                name="port_list"
                            />
                            <label :for="item.name">{{ item.name }}</label>
                        </div>
                        <div
                            v-for="(item, key) in port_name.ge"
                            :key="key"
                            class="lf"
                        >
                            <input
                                type="checkbox"
                                :id="item.name"
                                v-model="flush_param.port_id"
                                :value="item.id"
                                name="port_list"
                            />
                            <label :for="item.name">{{ item.name }}</label>
                        </div>
                        <div
                            v-for="(item, key) in port_name.xge"
                            :key="key"
                            class="lf"
                            v-if="port_name.xge"
                        >
                            <input
                                type="checkbox"
                                :id="item.name"
                                v-model="flush_param.port_id"
                                :value="item.id"
                                name="port_list"
                            />
                            <label :for="item.name">{{ item.name }}</label>
                        </div>
                    </div>
                </div>
                <div class="add-mac-item">
                    <a href="javascript:;" @click="flush_mac_submit">{{
                        lanMap["apply"]
                    }}</a>
                    <a href="javascript:;" @click="flush_mac_close_dialog">{{
                        lanMap["cancel"]
                    }}</a>
                </div>
                <div class="close" @click="flush_mac_close_dialog"></div>
            </div>
        </div>
        <nms-dialog :visible.sync="dialogVisible" width="650px">
            <div slot="title">{{ lanMap["mac_auth_portlist"] }}</div>
            <div class="mac-auth-content">
                <div class="lf">
                    <span>{{ lanMap["port_list"] }}:</span>
                </div>
                <div class="lf">
                    <template v-for="item in port_info.data">
                        <label>
                            <input
                                type="checkbox"
                                :value="item.port_id"
                                v-model="modelAuthPortlist"
                            />
                            {{ item.port_id | getPortName }}
                        </label>
                    </template>
                </div>
            </div>
            <div slot="footer">
                <nms-button @click="submitMacAuth">{{
                    lanMap["apply"]
                }}</nms-button>
                <nms-button @click="dialogVisible = false">{{
                    lanMap["cancel"]
                }}</nms-button>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { parsePort, getPortName, isArray, isFunction } from "@/utils/common";
import macQuery from "./mac/query";
export default {
    name: "macMgmt",
    components: { macQuery },
    computed: {
        ...mapState([
            "lanMap",
            "change_url",
            "port_name",
            "port_info",
            "custom",
        ]),
        select_all_text() {
            if (!this.select_all) {
                return this.lanMap["select_all"];
            } else {
                return this.lanMap["clear_all"];
            }
        },
        authPortlist() {
            return this.macAuthPortlist
                .map((item) => getPortName(item))
                .join(",");
        },
        macList() {
            const start = this.pagination.display * (this.pagination.index - 1);
            return this.mac_table.slice(start, start + this.pagination.display);
        },
    },
    data() {
        return {
            MAC_TYPES_MAP: ["dynamic", "static", "blackhole", "all"],
            //  mac地址老化时间
            mac_age: {},
            //  mac表
            tab: [],
            //  分页mac表
            mac_table: [],
            // 绑定老化时间输入框
            macage: "",
            // 控制老化时间模态框显示隐藏
            cfg_age: false,
            // 加载方式(查询条件)
            flag: 1,
            // 分页插件数据
            pagination: {
                // 当前页面
                index: 1,
                // 总页数
                page: 0,
                // 每页显示的数据数量
                display: 20,
            },
            //  添加mac地址的数据
            add_param: {
                mac_type: 1,
                macaddr: "",
                vlan_id: "",
                port_id: 1,
            },
            //  清除mac地址表的数据
            flush_param: {
                flags: 1,
                mac_type: 3,
                port_id: [],
                vlan_id: "",
            },
            //  添加mac地址模态框打开或关闭
            add_dialog: false,
            //  清除mac地址模态框打开或关闭
            flush_dialog: false,
            //  查询条件*4
            choose_macaddr: false,
            choose_mactype: true,
            choose_port: false,
            choose_vlan: false,
            //  初始化参数 --> 首次进入页面时的初始数据
            mac_type: 3,
            port_id: 1,
            vlan_id: 0,
            vlan_id_e: 0,
            macaddr: "",
            macmask: "",
            //  用户输入的mac地址和mac掩码格式检查
            check_mac: /^([0-9abcdefABCDEF]{2}\:){5}[0-9abcdefABCDEF]{2}$/,
            select_all: false,
            select_text: "",
            macAuthPortlist: [],
            dialogVisible: false,
            modelAuthPortlist: [],
            vlanSortableFlag: false,
            portSortableFlag: false,
            sortOrders: ["ascending", "descending"],
        };
    },
    created() {
        this.$http
            .get(this.change_url.macage)
            .then((res) => {
                this.mac_age = res.data;
            })
            .catch((err) => {});
        this.updateCustom();
        this.getData();
    },
    methods: {
        ...mapActions(["updateCustom"]),
        getName(id) {
            if (id < 1) return "";
            return this.port_name.pon[id]
                ? this.port_name.pon[id].name
                : this.port_name.ge[id]
                ? this.port_name.ge[id].name
                : this.port_name.xge[id].name;
        },
        getData() {
            this.tab = [];
            this.$http
                .get(this.change_url.mac_list)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$http
                            .get(this.change_url.mactab)
                            .then((_res) => {
                                if (_res.data.code === 1) {
                                    if (isArray(_res.data.data)) {
                                        this.tab = _res.data.data;
                                    }
                                }
                            })
                            .catch((err) => {});
                    }
                })
                .catch((err) => {});
        },
        dataChange(tabs) {
            this.mac_table = tabs;
        },
        getMacAuth() {
            this.macAuthPortlist = [];
            this.$http
                .get("/switch_mac?form=auth")
                .then((res) => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.macAuthPortlist = parsePort(
                                res.data.data.mac_auth_portlist
                            );
                        }
                    }
                })
                .catch((err) => {});
        },
        //  删除mac地址处理函数
        delete_mac(data) {
            this.$confirm(this.lanMap["tips_del_mac"])
                .then((_) => {
                    this.result(data);
                })
                .catch((_) => {});
        },
        //  删除mac地址表
        result(data) {
            const post_params = {
                method: "delete",
                param: {
                    mac_type: data.mac_type,
                    macaddr: data.macaddr,
                    vlan_id: data.vlan_id,
                    port_id: data.port_id,
                },
            };
            this.$http
                .post("/switch_mac?form=table", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text:
                                this.lanMap["delete"] +
                                this.lanMap["st_success"],
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
        },
        //  老化时间  编辑框  打开隐藏
        change_macage() {
            this.cfg_age = !this.cfg_age;
        },
        //  老化时间编辑框内  提交按钮
        macage_choose(bool) {
            if (bool) {
                if (
                    isNaN(this.macage) ||
                    this.macage < 0 ||
                    this.macage > 65535
                ) {
                    this.$message({
                        type: "error",
                        text: `${this.lanMap["param_error"]}: ${this.lanMap["age"]}`,
                    });
                    return;
                }
                this.$http
                    .get("/switch_mac?form=age&value=" + this.macage)
                    .then((res) => {
                        if (res.data.code == 1) {
                            this.$message({
                                type: res.data.type,
                                text: this.lanMap["setting_ok"],
                            });
                            this.$http
                                .get(this.change_url.macage)
                                .then((res) => {
                                    this.mac_age = res.data;
                                });
                        } else if (res.data.code > 1) {
                            this.$message({
                                type: res.data.type,
                                text:
                                    "(" +
                                    res.data.code +
                                    ") " +
                                    res.data.message,
                            });
                        }
                    })
                    .catch((err) => {});
            }
            this.macage = "";
            this.cfg_age = false;
        },
        changeIndex(n) {
            this.pagination.index = n;
        },
        // 全局数据排序
        sortChange(rows, field, sortOrder) {
            const ACTIONS = {
                ascending(field) {
                    return (a, b) => a[field] - b[field];
                },
                descending(field) {
                    return (a, b) => b[field] - a[field];
                },
            };
            if (isFunction(ACTIONS[sortOrder])) {
                this.mac_table.sort(ACTIONS[sortOrder].call(this, field));
            }
        },
        //  点击添加mac地址模态框内 确定 按钮时的动作
        add_mac_table() {
            //  mac地址格式检验
            if (!this.check_mac.test(this.add_param.macaddr)) {
                this.$message({
                    type: "error",
                    text: this.lanMap["param_mac"],
                });
                return;
            }
            //  vlanid 范围检验
            if (
                !this.add_param.vlan_id ||
                isNaN(this.add_param.vlan_id) ||
                this.add_param.vlan_id < 1 ||
                this.add_param.vlan_id > 4094
            ) {
                this.$message({
                    type: "error",
                    text: this.lanMap["vlanid_range_hit"],
                });
                return;
            }
            var post_params = {
                method: "add",
                param: {
                    mac_type: this.add_param.mac_type,
                    macaddr: this.add_param.macaddr,
                    vlan_id: this.add_param.vlan_id,
                    port_id: this.add_param.port_id,
                },
            };
            this.$http
                .post("/switch_mac?form=table", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"],
                        });
                        this.getData();
                        this.add_mac_close_dialog();
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
        },
        //  点击添加mac地址时的动作
        add_mac_dialog() {
            this.add_param.mac_type = this.custom.mac_auth ? 1 : 2;
            this.add_param.macaddr = "";
            this.add_param.vlan_id = "";
            this.add_param.port_id = 1;
            this.add_dialog = true;
        },
        //  点击添加mac地址模态框内 取消 或 关闭 按钮时的动作
        add_mac_close_dialog() {
            this.add_param.mac_type = 1;
            this.add_param.macaddr = "";
            this.add_param.vlan_id = "";
            this.add_param.port_id = 1;
            this.add_dialog = false;
        },
        //  点击清除mac地址按钮时的动作
        flush_mac_dialog() {
            this.flush_param.flags = 1;
            this.flush_param.mac_type = 3;
            this.flush_param.port_id = [];
            this.flush_param.vlan_id = "";
            this.flush_dialog = true;
        },
        //  点击清除mac地址模态框内 取消 或 关闭 按钮时的动作
        flush_mac_close_dialog() {
            this.flush_param.flags = 1;
            this.flush_param.mac_type = 3;
            this.flush_param.port_id = [];
            this.flush_param.vlan_id = "";
            this.flush_dialog = false;
        },
        // 清除mac地址模态框内，点击确定按钮时的动作
        flush_mac_submit() {
            //  vlanid 范围检验
            if (
                this.flush_param.flags === 4 &&
                (!this.flush_param.vlan_id ||
                    isNaN(this.flush_param.vlan_id) ||
                    this.flush_param.vlan_id < 1 ||
                    this.flush_param.vlan_id > 4094)
            ) {
                this.$message({
                    type: "error",
                    text: this.lanMap["vlanid_range_hit"],
                });
                return;
            }
            //  port_id 检验
            var port_list = this.flush_param.port_id
                .sort((a, b) => a - b)
                .join(",")
                .replace(/,$/, "");
            if (this.flush_param.flags === 2 && port_list === "") {
                this.$message({
                    type: "info",
                    text: this.lanMap["modify_tips"],
                });
                this.flush_mac_close_dialog();
                return;
            }
            var post_params = {
                method: "clear",
                param: {
                    flags: this.flush_param.flags,
                    mac_type: this.flush_param.mac_type,
                    vlan_id: this.flush_param.vlan_id,
                    port_list: port_list,
                },
            };
            this.$http
                .post("/switch_mac?form=table", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text:
                                this.lanMap["flush"] +
                                this.lanMap["st_success"],
                        });
                        this.getData();
                        this.flush_mac_close_dialog();
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
        },
        //  全选按钮
        select_all_port() {
            this.select_all = !this.select_all;
            if (this.select_all) {
                this.flush_param.port_id = [];
                for (var key in this.port_name.pon) {
                    this.flush_param.port_id.push(this.port_name.pon[key].id);
                }
                for (var key in this.port_name.ge) {
                    this.flush_param.port_id.push(this.port_name.ge[key].id);
                }
                for (var key in this.port_name.xge) {
                    this.flush_param.port_id.push(this.port_name.xge[key].id);
                }
            } else {
                this.flush_param.port_id = [];
            }
        },
        openDialog() {
            this.dialogVisible = true;
            this.modelAuthPortlist = this.macAuthPortlist.slice();
        },
        submitMacAuth() {
            const additive = this.modelAuthPortlist.reduce((pre, val) => {
                    if (!this.macAuthPortlist.includes(val)) {
                        pre.push(val);
                    }
                    return pre;
                }, []),
                deleted = this.macAuthPortlist.reduce((pre, val) => {
                    if (!this.modelAuthPortlist.includes(val)) {
                        pre.push(val);
                    }
                    return pre;
                }, []);
            if (!additive.length && !deleted.length) {
                this.$message.info(this.lanMap["modify_tips"]);
                this.dialogVisible = false;
                return;
            }
            additive.sort((a, b) => a - b);
            deleted.sort((a, b) => a - b);
            // 先添加再删除
            if (additive.length) {
                this.$http
                    .post("/switch_mac?form=auth", {
                        method: "add",
                        param: {
                            mac_auth_portlist: additive.join(","),
                        },
                    })
                    .then((res) => {
                        if (res.data.code === 1) {
                            if (deleted.length) {
                                this.$http
                                    .post("/switch_mac?form=auth", {
                                        method: "delete",
                                        param: {
                                            mac_auth_portlist: deleted.join(
                                                ","
                                            ),
                                        },
                                    })
                                    .then((res) => {
                                        if (res.data.code === 1) {
                                            this.$message.success(
                                                this.lanMap["setting_ok"]
                                            );
                                            this.getMacAuth();
                                        } else {
                                            this.$message.error(
                                                `(${res.data.code}) ${res.data.message}`
                                            );
                                        }
                                    })
                                    .catch((err) => {});
                            } else {
                                this.$message.success(
                                    this.lanMap["setting_ok"]
                                );
                                this.getMacAuth();
                            }
                        } else {
                            this.$message.error(
                                `(${res.data.code}) ${res.data.message}`
                            );
                        }
                    })
                    .catch((err) => {});
            } else {
                this.$http
                    .post("/switch_mac?form=auth", {
                        method: "delete",
                        param: {
                            mac_auth_portlist: deleted.join(","),
                        },
                    })
                    .then((res) => {
                        if (res.data.code === 1) {
                            this.$message.success(this.lanMap["setting_ok"]);
                            this.getMacAuth();
                        } else {
                            this.$message.error(
                                `(${res.data.code}) ${res.data.message}`
                            );
                        }
                    })
                    .catch((err) => {});
            }
            this.dialogVisible = false;
        },
    },
    watch: {
        "flush_param.port_id"() {
            if (
                this.flush_param.port_id.length === this.port_info.data.length
            ) {
                this.select_all = true;
            } else {
                this.select_all = false;
            }
        },
        custom() {
            if (this.custom.mac_auth) {
                this.getMacAuth();
            }
        },
    },
};
</script>

<style scoped lang="less">
div > h2 {
    font-size: 24px;
    font-weight: 600;
    color: #67aef7;
    margin: 10px 0 20px 0;
}
div.mac-age {
    margin: 10px 0;
    vertical-align: middle;
    line-height: 42px;
    > span {
        display: inline-block;
        width: 100px;
        vertical-align: middle;
    }
    > input {
        vertical-align: middle;
    }
    > span:first-child {
        margin-left: 10px;
        font-size: 18px;
        font-weight: 600;
        color: @titleColor;
    }
}
div.mac-auth {
    margin: 10px 0;
    > span {
        display: inline-block;
        vertical-align: middle;
        line-height: 42px;
        &:first-child {
            margin-left: 10px;
            font-size: 18px;
            font-weight: 600;
            color: @titleColor;
        }
    }
    span + span {
        margin-left: 12px;
        max-width: 650px;
        word-wrap: break-word;
        word-break: break-all;
        line-height: auto;
        line-height: inherit;
    }
    a {
        margin-left: 30px;
    }
}
div.mac-auth-content {
    > div:first-child {
        width: 100px;
    }
    > div + div {
        width: calc(~"100% - 100px");
        label {
            display: inline-block;
            vertical-align: middle;
            line-height: 28px;
            width: 25%;
        }
    }
    &:after {
        content: "";
        display: table;
        clear: both;
    }
}
a {
    width: 120px;
    margin: 5px;
    padding: 0;
}
div.query-select {
    margin: 20px 0 10px 10px;
    vertical-align: middle;
}
div.query-select > p {
    font-size: 18px;
    font-weight: 600;
    color: #67aef6;
}
div.query-select:after {
    content: "";
    display: table;
    clear: both;
}
div.query-select select {
    width: 180px;
    height: 30px;
    font-size: 15px;
    text-indent: 10px;
    vertical-align: middle;
}
div.mac-age > span.tips {
    width: 180px;
    font-size: 14px;
    color: #666;
}
p + div {
    margin-top: 20px;
}
div.cover + div.self-align {
    height: 340px;
}
input[type="checkbox"] + label {
    vertical-align: middle;
    cursor: pointer;
    user-select: none;
}
div.content {
    width: 600px;
    height: 350px;
    background: #fff;
    div.add-mac-item {
        height: 32px;
        margin: 16px 0 0 30px;
        &:nth-child(4) {
            height: 90px;
            margin-top: 20px;
        }
        > span:first-child {
            display: inline-block;
            width: 160px;
            font-size: 16px;
            color: #000;
            > div {
                margin-left: 10px;
            }
        }
        > input {
            border-radius: 3px;
        }
        > select {
            width: 200px;
            height: 30px;
            font-size: 16px;
            text-indent: 10px;
        }
        > span {
            font-size: 14px;
            color: #aaa;
            margin-left: 10px;
        }
        > div {
            display: inline-block;
        }
        > a {
            margin-left: 90px;
        }
    }
    > div.place-holder {
        &:nth-child(4) {
            height: 32px;
        }
    }
}
div.add-mac-item + div.item-align {
    height: 72px;
    vertical-align: middle;
    > div {
        width: 380px;
        vertical-align: middle;
        > div {
            width: 33%;
            height: 24px;
        }
    }
}
.select-all {
    vertical-align: middle;
}
</style>