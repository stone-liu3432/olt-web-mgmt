<template>
    <div class="vlan-mgmt">
        <div>
            <h2>{{ lanMap['vlan_cfg'] }}</h2>
        </div>
        <div class="btn-group-vlan">
            <a href="javascript:void(0);" @click="createVlan()">{{ lanMap['create'] }} VLAN</a>
            <a href="javascript:void(0);" @click="open_batch_del">{{ lanMap['delete'] }} VLAN</a>
            <a href="javascript:void(0);" @click="createVlan(1)">{{ lanMap['batch_cfg_vlan'] }}</a>
        </div>
        <div class="search">
            <p class="lf">{{ lanMap['vlan_list'] }}</p>
            <div class="lf">
                <input type="text" placeholder="VLAN ID" v-model.number="search_id" />
                <i class="icon-search"></i>
            </div>
        </div>
        <nms-table :rows="vlan_tab" border>
            <nms-table-column prop="vlan_id" :label="lanMap['vlan_id']"></nms-table-column>
            <nms-table-column prop="tagged_portlist" :label="lanMap['tagged_portlist']">
                <template slot-scope="rows">{{ parsePortList(rows.tagged_portlist) || ' - ' }}</template>
            </nms-table-column>
            <nms-table-column prop="untagged_portlist" :label="lanMap['untagged_portlist']">
                <template slot-scope="rows">{{ parsePortList(rows.untagged_portlist) || ' - ' }}</template>
            </nms-table-column>
            <nms-table-column prop="default_vlan_portlist" :label="lanMap['default_vlan_portlist']">
                <template slot-scope="rows">{{ parsePortList(rows.default_vlan_portlist) || ' - ' }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['config']" width="160px">
                <template slot-scope="rows">
                    <nms-dropdown @command="command">
                        <span>{{ lanMap['config'] }}</span>
                        <div slot="dropdown">
                            <nms-dropdown-item
                                :command="{ action: 'config', data: rows }"
                            >{{ lanMap['config'] }}</nms-dropdown-item>
                            <nms-dropdown-item
                                v-if="rows.vlan_id !== 1"
                                :command="{ action: 'delete', data: rows }"
                            >{{ lanMap['delete'] }}</nms-dropdown-item>
                            <nms-dropdown-item
                                :command="{ action: 'default_vlan', data: rows }"
                            >{{ lanMap['port_default_vlan'] }}</nms-dropdown-item>
                        </div>
                    </nms-dropdown>
                </template>
            </nms-table-column>
        </nms-table>
        <nms-pagination
            :total="vlan_list.length"
            :current-page="pagination.index"
            @current-change="changeIndex"
            style="float: right;"
        ></nms-pagination>
        <div class="modal-dialog" v-if="modalDialog">
            <div class="cover"></div>
            <div class="modal-content" :style="{ 'height': create_vlan ? '430px' : '370px' }">
                <h3
                    v-if="create_vlan && !batch_set_vlan"
                    class="modal-header"
                >{{ lanMap['create'] }}</h3>
                <h3 v-if="create_vlan && batch_set_vlan" class="modal-header">{{ lanMap['config'] }}</h3>
                <div class="modal-title">
                    <div v-if="!create_vlan" class="modal-header">
                        <span>VLAN ID:</span>
                        <span>{{ vlanid }}</span>
                        <span class="def-vlan-tips">{{ lanMap['def_vlan_tips'] }}</span>
                    </div>
                    <div class="add-vlan" v-if="create_vlan">
                        <span>VLAN ID：</span>
                        <span>
                            <input
                                v-focus
                                type="text"
                                placeholder="1-4094"
                                v-model.number="vlanid_s"
                                :style="{ 'border-color' : (vlanid_s != '' && (isNaN(vlanid_s) || vlanid_s > 4094 || vlanid_s < 1)) ? 'red' : '' }"
                            />
                            ~
                            <input
                                type="text"
                                placeholder="1-4094"
                                v-model.number="vlanid_e"
                                :style="{ 'border-color' : (vlanid_e != '' && (isNaN(vlanid_e) || vlanid_e > 4094 || vlanid_e < 1)) ? 'red' : '' }"
                            />
                            <span class="tips">{{ lanMap['vlanid_range_hit'] }}</span>
                        </span>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="vlan-mode">
                        <h3 class="lf">tagged:</h3>
                        <div class="vlan-port">
                            <div>
                                <span
                                    v-for="(item,key) in port_name.pon"
                                    :key="key"
                                    style="width: 12%;"
                                    class="tagged"
                                >
                                    <label :class="{ disabled: def_list.includes(item.id) }">
                                        <input
                                            type="checkbox"
                                            :value="item.id"
                                            v-model="tagged_list"
                                            :id="'tagged'+item.id"
                                            :disabled="def_list.includes(item.id)"
                                        />
                                        {{ item.name }}
                                    </label>
                                </span>
                            </div>
                            <div>
                                <span v-for="(item,key) in port_name.ge" :key="key" class="tagged">
                                    <label :class="{ disabled: def_list.includes(item.id) }">
                                        <input
                                            type="checkbox"
                                            :value="item.id"
                                            v-model="tagged_list"
                                            :id="'tagged'+item.id"
                                            :disabled="def_list.includes(item.id)"
                                        />
                                        {{ item.name }}
                                    </label>
                                </span>
                            </div>
                            <div>
                                <span
                                    v-for="(item,key) in port_name.xge"
                                    :key="key"
                                    v-if="port_name.xge"
                                    class="tagged"
                                >
                                    <label :class="{ disabled: def_list.includes(item.id) }">
                                        <input
                                            type="checkbox"
                                            :value="item.id"
                                            v-model="tagged_list"
                                            :id="'tagged'+item.id"
                                            :disabled="def_list.includes(item.id)"
                                        />
                                        {{ item.name }}
                                    </label>
                                </span>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div class="vlan-mode">
                        <h3 class="lf">untagged:</h3>
                        <div class="vlan-port">
                            <div>
                                <span
                                    v-for="(item,key) in port_name.pon"
                                    :key="key"
                                    style="width: 12%;"
                                    class="untagged"
                                >
                                    <label :class="{ disabled: def_list.includes(item.id) }">
                                        <input
                                            type="checkbox"
                                            :id="'untagged'+item.id"
                                            :value="item.id"
                                            v-model="untagged_list"
                                            :disabled="def_list.includes(item.id)"
                                        />
                                        {{ item.name }}
                                    </label>
                                </span>
                            </div>
                            <div>
                                <span
                                    v-for="(item,key) in port_name.ge"
                                    :key="key"
                                    class="untagged"
                                >
                                    <label :class="{ disabled: def_list.includes(item.id) }">
                                        <input
                                            type="checkbox"
                                            :id="'untagged'+item.id"
                                            :value="item.id"
                                            v-model="untagged_list"
                                            :disabled="def_list.includes(item.id)"
                                        />
                                        {{ item.name }}
                                    </label>
                                </span>
                            </div>
                            <div>
                                <span
                                    v-for="(item,key) in port_name.xge"
                                    :key="key"
                                    v-if="port_name.xge"
                                    class="untagged"
                                >
                                    <label :class="{ disabled: def_list.includes(item.id) }">
                                        <input
                                            type="checkbox"
                                            :id="'untagged'+item.id"
                                            :value="item.id"
                                            v-model="untagged_list"
                                            :disabled="def_list.includes(item.id)"
                                        />
                                        {{ item.name }}
                                    </label>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="vlan-mode" v-if="!create_vlan">
                        <a
                            href="javascript:void(0);"
                            class="rt"
                            @click="handle_cfg(false)"
                        >{{ lanMap['cancel'] }}</a>
                        <a
                            href="javascript:void(0);"
                            class="rt"
                            @click="handle_cfg(true)"
                        >{{ lanMap['apply'] }}</a>
                    </div>
                    <div class="vlan-mode" v-if="create_vlan">
                        <a
                            href="javascript:void(0);"
                            class="rt"
                            @click="handle_create(false)"
                        >{{ lanMap['cancel'] }}</a>
                        <a
                            href="javascript:void(0);"
                            class="rt"
                            @click="handle_create(true)"
                            v-if="!batch_set_vlan"
                        >{{ lanMap['apply'] }}</a>
                        <a
                            href="javascript:void(0);"
                            class="rt"
                            @click="set_vlan(0,vlanid_s,vlanid_e,false)"
                            v-if="batch_set_vlan"
                        >{{ lanMap['apply'] }}</a>
                    </div>
                </div>
                <div class="close" @click="closeModal"></div>
            </div>
        </div>
        <div class="modal-dialog" v-if="batch_del_vlan">
            <div class="cover"></div>
            <div class="batch-delete">
                <div>
                    <h3 class="modal-header">{{ lanMap['delete'] }} VLAN</h3>
                    <div>
                        <span>VLAN ID</span>
                        <input
                            type="text"
                            v-focus
                            v-model.number="vlanid_s"
                            placeholder="1-4094"
                            :style="{ 'border-color' : (vlanid_s != '' && (isNaN(vlanid_s) || vlanid_s > 4094 || vlanid_s < 1)) ? 'red' : '' }"
                        />
                        ~
                        <input
                            type="text"
                            v-model.number="vlanid_e"
                            placeholder="1-4094"
                            :style="{ 'border-color' : (vlanid_e != '' && (isNaN(vlanid_e) || vlanid_e > 4094 || vlanid_e < 1)) ? 'red' : '' }"
                        />
                    </div>
                    <p>{{ lanMap['vlanid_range_hit'] }}</p>
                    <div>
                        <a
                            href="javascript:void(0);"
                            @click="submit_batch_del"
                        >{{ lanMap['apply'] }}</a>
                        <a
                            href="javascript:void(0);"
                            @click="close_batch_del"
                        >{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="close_batch_del"></div>
            </div>
        </div>
        <nms-dialog :visible.sync="dialogVisible" width="800px">
            <div slot="title">{{ lanMap['config'] }}</div>
            <div class="port-default-vlan-item">
                <span>{{ lanMap['vlan_id'] }}:</span>
                <span>{{ vlanid }}</span>
            </div>
            <div class="port-default-vlan-item">
                <span>{{ lanMap['default_vlan_portlist'] }}:</span>
                <span>
                    <template v-for="item in port_info.data || []">
                        <label>
                            <input type="checkbox" v-model="defVlanPortList" :value="item.port_id" />
                            {{ item.port_id | getPortName }}
                        </label>
                    </template>
                </span>
            </div>
            <div slot="footer">
                <nms-button @click="submitDefVlan">{{ lanMap['apply'] }}</nms-button>
                <nms-button @click="dialogVisible = false;">{{ lanMap['cancel'] }}</nms-button>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { parsePortList, parsePort } from "@/utils/common";
export default {
    name: "vlanMgmt",
    computed: {
        ...mapState([
            "lanMap",
            "port_name",
            "system",
            "change_url",
            "port_info",
        ]),
        // 分页的数据 --> 显示到页面的数据
        vlan_tab() {
            if (!this.search_id) {
                this.pagination.page = Math.ceil(
                    this.vlan_list.length / this.pagination.display
                );
                return this.vlan_list.slice(
                    this.pagination.display * (this.pagination.index - 1),
                    this.pagination.index * this.pagination.display
                );
            }
            const tab = [];
            this.vlan_list.forEach((item) => {
                if (
                    String(item.vlan_id).indexOf(String(this.search_id)) !== -1
                ) {
                    tab.push(item);
                }
            });
            this.pagination.page =
                Math.ceil(tab.length / this.pagination.display) || 1;
            // 溢出处理
            if (this.pagination.index > this.pagination.page) {
                this.pagination.index = this.pagination.page;
            }
            return tab.slice(
                this.pagination.display * (this.pagination.index - 1),
                this.pagination.index * this.pagination.display
            );
        },
    },
    data() {
        return {
            // 已有的 VLAN列表
            vlan_list: [],
            // 创建VLAN模态框的显示隐藏参数
            create_vlan: false,
            vlanid: 0,
            // 查找的vlan id
            search_id: "",
            // 创建VLAN时，绑定的新创建的 VLAN ID
            vlanid_s: "",
            vlanid_e: "",
            //  是否提示创建VLAN成功的tips
            batch_set_vlan: false,
            // 分页插件数据
            pagination: {
                // 当前页面
                index: 1,
                // 总页数
                page: 0,
                // 每页显示的数据数量
                display: 20,
            },
            // 添加/修改VLAN模态框隐藏显示
            modalDialog: false,
            batch_del_vlan: false,
            tagged_list: [],
            untagged_list: [],
            //  以当前vlan作为端口默认vlan的端口列表
            def_list: [],
            lags: {},
            dialogVisible: false,
            defVlanPortList: [],
            // default vlan  数据缓存
            originalVlanlist: [],
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            //   /switch_vlan
            // 请求url: /vlantable
            this.vlan_list = [];
            this.$http
                .get(this.change_url.getvlan)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$http
                            .get(this.change_url.vlancfg)
                            .then((res) => {
                                if (res.data.code === 1) {
                                    if (res.data.data && res.data.data.length) {
                                        this.vlan_list = res.data.data;
                                    }
                                }
                            })
                            .catch((err) => {});
                    }
                })
                .catch((err) => {});
        },
        //  创建VLAN
        createVlan(flag) {
            this.modalDialog = true;
            this.create_vlan = true;
            this.vlanid = 0;
            this.def_list = [];
            if (flag) {
                this.batch_set_vlan = true;
            } else {
                this.batch_set_vlan = false;
            }
        },
        //  删除VLAN
        deleteVlan(vlanid) {
            this.$confirm(this.lanMap["delete_vlan_hit"])
                .then((_) => {
                    const post_param = {
                        method: "destroy",
                        param: {
                            vlan_id: vlanid,
                        },
                    };
                    this.$http
                        .post("/switch_vlan", post_param)
                        .then((res) => {
                            if (res.data.code === 1) {
                                this.$message({
                                    type: res.data.type,
                                    text:
                                        this.lanMap["delete"] +
                                        this.lanMap["st_success"],
                                });
                                this.vlan_list.forEach((item, index, arr) => {
                                    if (item.vlan_id === vlanid) {
                                        this.vlan_list.splice(index, 1);
                                    }
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
                        .catch((err) => {
                            // to do
                        });
                })
                .catch((_) => {});
        },
        //  配置 VLAN 端口模态框
        config_port(data) {
            this.modalDialog = true;
            this.vlanid = data.vlan_id;
            this.tagged_list = parsePort(data.tagged_portlist);
            this.untagged_list = parsePort(data.untagged_portlist);
            this.def_list = parsePort(data.default_vlan_portlist);
            this.composeLags(data);
        },
        //  关闭创建/配置 VLAN 模态框
        closeModal() {
            this.create_vlan = false;
            this.modalDialog = false;
            this.batch_set_vlan = false;
            this.tagged_list = [];
            this.untagged_list = [];
        },
        //  分页切换
        changeIndex(n) {
            this.pagination.index = n;
        },
        //  配置模态框的按钮动作，根据用户选择进行操作
        handle_cfg(bool) {
            if (bool) {
                this.set_vlan(this.vlanid);
            }
            this.closeModal();
        },
        //  配置VLAN ID 的端口
        set_vlan(vid, vid_s, vid_e, create_flag) {
            var tag_str = "",
                untag_str = "",
                post_param,
                url;
            if (vid || (!!vid_s && vid_s === vid_e)) {
                post_param = {
                    method: "set",
                    param: {
                        vlan_id: vid || vid_s,
                        tagged_portlist: this.tagged_list
                            .sort((a, b) => a - b)
                            .toString(),
                        untagged_portlist: this.untagged_list
                            .sort((a, b) => a - b)
                            .toString(),
                    },
                };
                url = "/switch_vlan";
            } else {
                post_param = {
                    method: "set",
                    param: {
                        vlanid_s: vid_e
                            ? vid_s > vid_e
                                ? vid_e
                                : vid_s
                            : vid_s,
                        vlanid_e: vid_e
                            ? vid_s > vid_e
                                ? vid_s
                                : vid_e
                            : vid_s,
                        tagged_portlist: this.tagged_list
                            .sort((a, b) => a - b)
                            .toString(),
                        untagged_portlist: this.untagged_list
                            .sort((a, b) => a - b)
                            .toString(),
                    },
                };
                url = "/switch_vlanlist";
            }
            this.$http
                .post(url, post_param)
                .then((res) => {
                    if (res.data.code === 1) {
                        if (!this.tip_flag && !create_flag) {
                            this.$message({
                                type: res.data.type,
                                text: this.lanMap["setting_ok"],
                            });
                        }
                        if (create_flag) {
                            this.$message({
                                type: res.data.type,
                                text: this.lanMap["create_vlan_info"],
                            });
                        }
                        this.pagination.index = 1;
                        this.getData();
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message,
                        });
                        if (res.data.type === "warning") {
                            this.pagination.index = 1;
                            this.getData();
                        }
                    }
                    this.vlanid_s = "";
                    this.vlanid_e = "";
                    this.tip_flag = false;
                    this.closeModal();
                })
                .catch((err) => {
                    // to do
                });
        },
        //  添加VLAN时的动作，根据用户选择进行操作
        handle_create(bool) {
            if (bool) {
                var vid_s = Number(this.vlanid_s);
                var vid_e = Number(this.vlanid_e);
                var tag_str = "",
                    untag_str = "";
                tag_str = this.tagged_list.sort((a, b) => a - b).toString();
                untag_str = this.untagged_list.sort((a, b) => a - b).toString();
                if (
                    isNaN(vid_s) ||
                    vid_s > 4094 ||
                    vid_s < 1 ||
                    isNaN(vid_e) ||
                    vid_e > 4094 ||
                    vid_e < 0
                ) {
                    this.$message({
                        type: "error",
                        text: this.lanMap["vlanid_range_hit"],
                    });
                    return;
                }
                var post_param = {
                    method: "create",
                    param: {
                        type: 1,
                        vlanid_s: vid_e
                            ? vid_s > vid_e
                                ? vid_e
                                : vid_s
                            : vid_s,
                        vlanid_e: vid_e
                            ? vid_s > vid_e
                                ? vid_s
                                : vid_e
                            : vid_s,
                    },
                };
                this.$http
                    .post("/switch_vlanlist", post_param)
                    .then((res) => {
                        if (res.data.code === 1) {
                            if (tag_str || untag_str) {
                                this.set_vlan(0, vid_s, vid_e, true);
                            } else {
                                this.$message({
                                    type: res.data.type,
                                    text: this.lanMap["create_vlan_info"],
                                });
                                this.pagination.index = 1;
                                this.getData();
                                this.vlanid_s = "";
                                this.vlanid_e = "";
                                this.tip_flag = false;
                                this.closeModal();
                            }
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
                    .catch((err) => {
                        // to do
                    });
            } else {
                this.create_vlan = false;
                this.modalDialog = false;
                this.vlanid_s = "";
                this.vlanid_e = "";
                this.tip_flag = false;
            }
        },
        //  打开范围删除vlan模态框
        open_batch_del() {
            this.batch_del_vlan = true;
            this.vlanid_s = "";
            this.vlanid_e = "";
        },
        //  关闭范围删除模态框
        close_batch_del() {
            this.batch_del_vlan = false;
            this.vlanid_s = "";
            this.vlanid_e = "";
        },
        //  范围删除提交按钮
        submit_batch_del() {
            var vid_s = Number(this.vlanid_s),
                vid_e = Number(this.vlanid_e);
            if (
                vid_s < 1 ||
                vid_s > 4094 ||
                isNaN(vid_s) ||
                vid_e < 0 ||
                vid_e > 4094 ||
                isNaN(vid_e)
            ) {
                this.$message({
                    type: "error",
                    text: this.lanMap["vlanid_range_hit"],
                });
                return;
            }
            var post_param = {
                method: "destroy",
                param: {
                    vlanid_s: vid_e ? (vid_s > vid_e ? vid_e : vid_s) : vid_s,
                    vlanid_e: vid_e ? (vid_s > vid_e ? vid_s : vid_e) : vid_s,
                },
            };
            this.$http
                .post("/switch_vlanlist", post_param)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"],
                        });
                        this.pagination.index = 1;
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
            this.close_batch_del();
        },
        parsePortList(str) {
            return parsePortList(str);
        },
        composeLags(data) {
            var reg = /^\s*lag(\d)_portlist\s*$/;
            Object.keys(data).forEach((item) => {
                if (reg.test(item)) {
                    var key = item.replace(reg, "$1");
                    this.lags[key] = parsePort(data[item]);
                }
            });
        },
        difference(arr1, arr2) {
            var n = 0;
            arr1.forEach((item) => {
                n = n ^ item;
            });
            arr2.forEach((item) => {
                n = n ^ item;
            });
            return n;
        },
        command({ action, data }) {
            const ACTIONS = {
                config(row) {
                    this.config_port(row);
                },
                delete(row) {
                    this.deleteVlan(row.vlan_id);
                },
                default_vlan(row) {
                    this.openDialog(row);
                },
            };
            if (typeof ACTIONS[action] === "function") {
                ACTIONS[action].call(this, data);
            }
        },
        openDialog(row) {
            this.dialogVisible = true;
            this.vlanid = row.vlan_id;
            this.defVlanPortList = parsePort(row.default_vlan_portlist);
            this.originalVlanlist = this.defVlanPortList.slice(0);
        },
        submitDefVlan() {
            const additive = this.defVlanPortList.reduce((pre, item) => {
                    !this.originalVlanlist.includes(item) && pre.push(item);
                    return pre;
                }, []),
                deleted = this.originalVlanlist.reduce((pre, item) => {
                    !this.defVlanPortList.includes(item) && pre.push(item);
                    return pre;
                }, []);
            if (!additive.length && !deleted.length) {
                return this.$message.info(this.lanMap["modify_tips"]);
            }
            if (deleted.length && this.vlanid === 1) {
                return this.$message.error(this.lanMap["port_def_vlan_tips"]);
            }
            additive.sort((a, b) => a - b);
            deleted.sort((a, b) => a - b);
            if (deleted.length) {
                this.setPortDefVlan(1, deleted.join(","))
                    .then((res) => {
                        this.responseHandle(res, additive.length ? false : true)
                            .then((res) => {
                                if (additive.length) {
                                    this.setPortDefVlan(
                                        this.vlanid,
                                        additive.join(",")
                                    )
                                        .then((_res) => {
                                            this.responseHandle(_res)
                                                .then((_) => {
                                                    this.getData();
                                                })
                                                .catch((_) => {});
                                        })
                                        .catch((_err) => {});
                                } else {
                                    this.getData();
                                }
                            })
                            .catch((err) => {});
                    })
                    .catch((err) => {});
            } else {
                this.setPortDefVlan(this.vlanid, additive.join(","))
                    .then((res) => {
                        this.responseHandle(res)
                            .then((res) => {
                                this.getData();
                            })
                            .catch((err) => {});
                    })
                    .catch((err) => {});
            }
            this.dialogVisible = false;
        },
        setPortDefVlan(vlan_id, default_vlan_portlist) {
            return this.$http.post("/switch_vlan_pvid", {
                method: "set",
                param: {
                    vlan_id,
                    default_vlan_portlist,
                },
            });
        },
        responseHandle(res, tips = true) {
            if (res.data.code === 1) {
                tips && this.$message.success(this.lanMap["setting_ok"]);
                return Promise.resolve(res);
            } else {
                tips &&
                    this.$message.error(
                        `(${res.data.code}) ${res.data.message}`
                    );
                if (res.data.type === "warning") {
                    return Promise.resolve(res);
                }
                return Promise.reject(res);
            }
        },
    },
    watch: {
        search_id(newVal, oldVal) {
            this.pagination.index = 1;
        },
        //  tagged_list & untagged_list   LAG相同的，关联为同一端口(多个端口视为同一个端口), tag & untag时也必须同步
        tagged_list(newVal, oldVal) {
            var val;
            if (newVal.length > oldVal.length) {
                val = newVal[newVal.length - 1];
                if (
                    this.port_name.ge &&
                    this.port_name.ge[val] &&
                    this.port_name.ge[val].lag
                ) {
                    if (this.lags[this.port_name.ge[val].lag]) {
                        this.lags[this.port_name.ge[val].lag].forEach(
                            (_item) => {
                                if (
                                    _item !== val &&
                                    !this.tagged_list.includes(_item)
                                ) {
                                    this.tagged_list.push(_item);
                                }
                            }
                        );
                    }
                }
                if (
                    this.port_name.xge &&
                    this.port_name.xge[val] &&
                    this.port_name.xge[val].lag
                ) {
                    if (this.lags[this.port_name.xge[val].lag]) {
                        this.lags[this.port_name.xge[val].lag].forEach(
                            (_item) => {
                                if (
                                    _item !== val &&
                                    !this.tagged_list.includes(_item)
                                ) {
                                    this.tagged_list.push(_item);
                                }
                            }
                        );
                    }
                }
                var idx = this.untagged_list.indexOf(val);
                if (idx > -1) {
                    var arr = Object.assign([], this.untagged_list);
                    arr.splice(idx, 1);
                    this.untagged_list = arr;
                }
            }
            if (newVal.length < oldVal.length) {
                val = this.difference(newVal, oldVal);
                if (
                    this.port_name.ge &&
                    this.port_name.ge[val] &&
                    this.port_name.ge[val].lag
                ) {
                    if (this.lags[this.port_name.ge[val].lag]) {
                        this.lags[this.port_name.ge[val].lag].forEach(
                            (_item) => {
                                if (this.tagged_list.indexOf(_item) > -1) {
                                    this.tagged_list.splice(
                                        this.tagged_list.indexOf(_item),
                                        1
                                    );
                                }
                            }
                        );
                    }
                }
                if (
                    this.port_name.xge &&
                    this.port_name.xge[val] &&
                    this.port_name.xge[val].lag
                ) {
                    if (this.lags[this.port_name.xge[val].lag]) {
                        this.lags[this.port_name.xge[val].lag].forEach(
                            (_item) => {
                                if (this.tagged_list.indexOf(_item) > -1) {
                                    this.tagged_list.splice(
                                        this.tagged_list.indexOf(_item),
                                        1
                                    );
                                }
                            }
                        );
                    }
                }
            }
        },
        untagged_list(newVal, oldVal) {
            var val;
            if (newVal.length > oldVal.length) {
                val = newVal[newVal.length - 1];
                if (
                    this.port_name.ge &&
                    this.port_name.ge[val] &&
                    this.port_name.ge[val].lag
                ) {
                    if (this.lags[this.port_name.ge[val].lag]) {
                        this.lags[this.port_name.ge[val].lag].forEach(
                            (_item) => {
                                if (
                                    _item !== val &&
                                    !this.untagged_list.includes(_item)
                                ) {
                                    this.untagged_list.push(_item);
                                }
                            }
                        );
                    }
                }
                if (
                    this.port_name.xge &&
                    this.port_name.xge[val] &&
                    this.port_name.xge[val].lag
                ) {
                    if (this.lags[this.port_name.xge[val].lag]) {
                        this.lags[this.port_name.xge[val].lag].forEach(
                            (_item) => {
                                if (
                                    _item !== val &&
                                    !this.untagged_list.includes(_item)
                                ) {
                                    this.untagged_list.push(_item);
                                }
                            }
                        );
                    }
                }
                var idx = this.tagged_list.indexOf(val);
                if (idx > -1) {
                    var arr = Object.assign([], this.tagged_list);
                    arr.splice(idx, 1);
                    this.tagged_list = arr;
                }
            } else {
                val = this.difference(newVal, oldVal);
                if (
                    this.port_name.ge &&
                    this.port_name.ge[val] &&
                    this.port_name.ge[val].lag
                ) {
                    if (this.lags[this.port_name.ge[val].lag]) {
                        this.lags[this.port_name.ge[val].lag].forEach(
                            (_item) => {
                                if (this.untagged_list.indexOf(_item) > -1) {
                                    this.untagged_list.splice(
                                        this.untagged_list.indexOf(_item),
                                        1
                                    );
                                }
                            }
                        );
                    }
                }
                if (
                    this.port_name.xge &&
                    this.port_name.xge[val] &&
                    this.port_name.xge[val].lag
                ) {
                    if (this.lags[this.port_name.xge[val].lag]) {
                        this.lags[this.port_name.xge[val].lag].forEach(
                            (_item) => {
                                if (this.untagged_list.indexOf(_item) > -1) {
                                    this.untagged_list.splice(
                                        this.untagged_list.indexOf(_item),
                                        1
                                    );
                                }
                            }
                        );
                    }
                }
            }
        },
    },
};
</script>

<style scoped lang="less">
div.vlan-mgmt {
    height: calc(~"100% - 100px");
    overflow-y: auto;
    &:after {
        content: "";
        display: table;
        clear: both;
    }
}
div.vlan-mgmt > div:nth-child(2) {
    margin: 0 0 0 30px;
}
div + ul {
    > li:first-child {
        background: #2361a2;
        color: #fff;
    }
}
a + span {
    font-size: 14px;
    margin-left: 10px;
    color: #666;
}
div.btn-group-vlan {
    a {
        width: auto;
        padding: 0 10px;
    }
}
div > h2 {
    font-size: 24px;
    font-weight: 600;
    color: @titleColor;
    margin: 20px 0 20px 20px;
}
div.search {
    margin: 20px 0 20px 20px;
    line-height: 40px;
}
div.search > div {
    margin-left: 50px;
    position: relative;
}
i.icon-search {
    display: inline-block;
    width: 32px;
    height: 32px;
    background: url("../../../assets/search.png");
    cursor: pointer;
    position: absolute;
    top: 6px;
    right: 3px;
}
div.search:after {
    content: "";
    display: table;
    clear: both;
}
input[type="text"] {
    border-radius: 3px;
    position: relative;
    top: 1px;
}
h2 + div {
    margin: 20px 0;
}
h2 + div:after {
    content: "";
    display: table;
    clear: both;
}
p {
    font-size: 24px;
    font-weight: 600;
    color: @titleColor;
}
div + ul {
    margin: 0 0 0 30px;
}
li {
    word-wrap: break-word;
    word-break: break-all;
    border: 1px solid #ddd;
    border-top: none;
    font-size: 0;
}
li:first-child {
    border-top: 1px solid #ddd;
}
li > input {
    width: 30px;
}
li > span {
    display: inline-block;
    text-align: center;
    padding: 5px;
    vertical-align: middle;
    font-size: 16px;
}
li > a {
    margin: 5px;
}
li > span:first-child {
    width: 9%;
}
li > span:nth-child(2),
li > span:nth-child(3),
li > span:nth-child(4) {
    width: 21%;
}
a {
    width: 100px;
    margin: 0 5px;
    padding: 0;
}
span.vlan-cfg-title {
    width: 200px;
}
span.def-vlan-tips {
    margin-left: 20px;
    font-size: 14px;
    color: #67aef6;
    font-weight: normal;
}
div.cover + div {
    width: 850px;
    height: 300px;
}
div.modal-content {
    border-radius: 3px;
}
div.modal-title {
    // margin: 12px 20px;
    > div.set-vlan {
        font-size: 20px;
        color: #67aef6;
        font-weight: 600;
    }
}
div.modal-body {
    margin: 0 20px;
}
div.modal-body > div > span:first-child {
    display: inline-block;
    width: 100px;
}
div.vlan-mode > h3 {
    width: 135px;
    height: 30px;
    line-height: 30px;
    padding-left: 5px;
}
div.vlan-port {
    margin-left: 140px;
    > div {
        height: 30px;
        line-height: 30px;
        > span {
            display: inline-block;
            width: 24%;
        }
    }
}
div.vlan-mode:after {
    content: "";
    display: table;
    clear: both;
}
span.tagged,
span.untagged {
    user-select: none;
}
label {
    // margin-right: 18px;
    user-select: none;
}
div.vlan-mode {
    margin: 20px 0;
}
div.vlan-mode > a {
    margin-left: 50px;
}
ul.pagination > li.disabled {
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.65;
}
ul.pagination:after {
    content: "";
    display: table;
    clear: both;
}
ul.pagination {
    margin: 10px;
}
ul.pagination > li {
    float: left;
    font-size: 16px;
    color: #666;
    margin-left: 10px;
    border-radius: 3px;
    padding: 3px 8px;
    border: 1px solid #333;
    cursor: pointer;
}
ul > li.actived {
    color: #67aef7;
    border-color: #67aef7;
}
li.paginations:after {
    content: "";
    display: table;
    clear: both;
}
span.tips {
    font-size: 14px;
    color: #67aef7;
    margin-left: 20px;
}
div.add-vlan {
    margin: 16px 0 0 20px;
    input {
        width: 100px;
    }
}
div.cover + div.batch-delete {
    border-radius: 5px;
    height: 225px;
    width: 500px;
    h3 + div {
        margin-top: 10px;
    }
    > div {
        > div {
            span {
                display: inline-block;
                width: 120px;
                text-align: center;
            }
            input {
                width: 120px;
            }
        }
    }
    div + p {
        font-size: 15px;
        color: #67aef6;
        text-align: center;
        font-weight: normal;
        height: 30px;
        line-height: 30px;
        margin-top: 10px;
    }
    a {
        margin: 15px 0 0 100px;
    }
}
.table-btn-text {
    width: auto;
    margin: 0;
}
.disabled {
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.65;
}
div.port-default-vlan-item {
    margin: 12px 0;
    span {
        display: inline-block;
        vertical-align: middle;
        width: 180px;
        text-align: right;
        padding: 0 10px 0 0;
        box-sizing: border-box;
    }
    span + span {
        width: calc(~"100% - 200px");
        text-align: left;
        label {
            display: inline-block;
            vertical-align: middle;
            line-height: 24px;
            width: 24%;
        }
    }
}
</style>