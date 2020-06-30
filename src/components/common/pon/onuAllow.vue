<template>
    <div class="onu-allow">
        <div>
            <h2>{{ lanMap['onu_allow'] }}</h2>
            <span>{{ lanMap['port_id'] }}</span>
            <select v-model.number="portid">
                <option :value="0x100">{{ lanMap['all'] }}</option>
                <option
                    v-for="(item,key) in port_name.pon"
                    :key="key"
                    :value="item.id"
                >{{ item.name }}</option>
            </select>
            <template v-if="onu_allow_list.length">
                <span class="onu-count onu-total">{{ lanMap['registered_onu'] }}:</span>
                <span>{{ onu_allow_list.length }}</span>
                <span class="onu-count onu-online">{{ lanMap['online'] }}:</span>
                <span>{{ onlineCount }}</span>
                <span class="onu-count onu-offline">{{ lanMap['offline'] }}:</span>
                <span>{{ onu_allow_list.length - onlineCount }}</span>
            </template>
        </div>
        <hr />
        <div>
            <a href="javascript:void(0);" @click="reload">{{ lanMap['refresh'] }}</a>
            <template v-if="isAll">
                <a
                    href="javascript:void(0);"
                    @click="add_onu"
                    v-if="custom.addonu"
                >{{ lanMap['add'] }}</a>
                <a href="javascript:void(0);" @click="onu_bandwieth">{{ lanMap['sla_cfg'] }}</a>
                <a href="javascript:void(0);" @click="onu_deny">{{ lanMap['onu_deny'] }}</a>
                <a
                    href="javascript:void(0);"
                    @click="show_batchmgmt"
                    v-if="!isBatchMgmt"
                >{{ lanMap['batch_mgmt_onu'] }}</a>
                <a
                    href="javascript:void(0);"
                    @click="show_batchmgmt"
                    v-else
                >{{ lanMap['exit_batch_onu'] }}</a>
            </template>
            <a href="javascript: void(0);" v-if="isDraggable" @click="saveDrag">{{ lanMap['save'] }}</a>
            <div class="rt tool-tips">
                <i class="icon-tips"></i>
                <div>
                    <div>
                        <p>{{ lanMap['auth_state'] }}</p>
                        <p>
                            <i class="verified-actived"></i>
                            {{ lanMap['tips_cfm_onu'] }}
                        </p>
                        <p>
                            <i class="unverified"></i>
                            {{ lanMap['tips_n_cfm_onu'] }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-dialog" v-if="add_dialog">
            <div class="cover"></div>
            <div class="modal-content">
                <h3 class="modal-header">{{ lanMap['manual_bind'] }}</h3>
                <div class="modal-item">
                    <span>{{ lanMap['onu_id'] }}</span>
                    <input type="text" v-model="add_onuid" placeholder="1-64" v-focus />
                    <span class="tips">{{ lanMap['zero_auto_'] }}</span>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['macaddr'] }}</span>
                    <input
                        type="text"
                        v-model="add_macaddr"
                        :style="{'borderColor' : add_macaddr && testMacaddr ? 'red' : ''}"
                        placeholder="00:00:00:00:00:00"
                    />
                    <span class="tips">EX : 00:00:00:00:00:00</span>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['auth_state'] }}</span>
                    <select v-model="add_onustate">
                        <option value="1">true</option>
                        <option value="0">false</option>
                    </select>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['desc'] }}</span>
                    <input type="text" v-model="add_onudesc" />
                    <span class="tips">{{ lanMap['input_desc'] }}</span>
                </div>
                <div class="modal-btn">
                    <a href="javascript:void(0);" @click="add_onuitem(true)">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" @click="add_onuitem(false)">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="closeModal"></div>
            </div>
        </div>
        <div class="search-onu" v-if="!isBatchMgmt">
            <h3 class="lf">{{ lanMap['find'] }} ONU</h3>
            <div class="lf">
                <input type="text" v-model="search_str" />
                <i></i>
            </div>
            <p class="lf">{{ lanMap['search_by_macaddr'] }}</p>
        </div>
        <div v-else class="search-onu batch-onu">
            <h3 class="lf">{{ lanMap['batch_mgmt_onu'] }}</h3>
            <div class="lf">
                <a
                    href="javascript:void(0);"
                    style="margin-left: 30px;"
                    @click="delete_onu()"
                >{{ lanMap['delete'] }}</a>
                <a
                    href="javascript:void(0);"
                    style="margin-left: 30px;"
                    @click="remove_onu()"
                >{{ lanMap['add_to_deny'] }}</a>
            </div>
        </div>
        <nms-table
            :rows="onulist"
            border
            :draggable="isAll"
            ref="ont-allow-table"
            :rowStyle="setRowStyle"
            @selection-change="selecttionChange"
            @draggable="draggable"
            @sort-change="sortChange"
        >
            <nms-table-column :type="isBatchMgmt"></nms-table-column>
            <nms-table-column :label="lanMap['onu_id']" prop="onu_id">
                <template
                    slot-scope="row"
                >{{ row.onu_name || 'ONU0'+ row.port_id +'/'+ row.onu_id }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['macaddr']" prop="macaddr"></nms-table-column>
            <nms-table-column
                :label="lanMap['status']"
                prop="status"
                width="100px"
                sortable
                :sort-method="sortMethod"
            ></nms-table-column>
            <nms-table-column :label="lanMap['auth_state']" prop="auth_state" width="100px">
                <template slot-scope="row">
                    <span>{{ row.auth_state ? 'true' : 'false' }}</span>
                    <i
                        :class="[row.auth_state ? 'verified-actived' : 'unverified']"
                        @click="authstate(row)"
                    ></i>
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['register_time']" prop="register_time"></nms-table-column>
            <nms-table-column :label="lanMap['last_down_time']" prop="last_down_time"></nms-table-column>
            <nms-table-column :label="lanMap['last_down_reason']" prop="last_down_reason"></nms-table-column>
            <nms-table-column :label="lanMap['config']" width="160px">
                <template slot-scope="row">
                    <nms-dropdown @command="command">
                        <span>{{ lanMap['config'] }}</span>
                        <div slot="dropdown">
                            <nms-dropdown-item
                                :command="{ action: 'detail', data: row }"
                            >{{ lanMap['show_detail'] }}</nms-dropdown-item>
                            <nms-dropdown-item
                                :command="{ action: 'port_config', data: row }"
                            >{{ lanMap['onu_port_cfg'] }}</nms-dropdown-item>
                            <nms-dropdown-item
                                :command="{ action: 'delete', data: row }"
                            >{{ lanMap['del_onu'] }}</nms-dropdown-item>
                            <nms-dropdown-item
                                :command="{ action: 'remove', data: row }"
                            >{{ lanMap['add_to_deny'] }}</nms-dropdown-item>
                            <nms-dropdown-item
                                :command="{ action: 'reboot', data: row }"
                            >{{ lanMap['reboot_onu'] }}</nms-dropdown-item>
                        </div>
                    </nms-dropdown>
                </template>
            </nms-table-column>
        </nms-table>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
export default {
    name: "onuAllow",
    data() {
        return {
            onu_allow_list: [],
            portid: 0,
            add_dialog: false,
            add_onuid: "",
            add_macaddr: "",
            add_onustate: 0,
            add_onudesc: "",
            search_str: "",
            tips_authstate: "",
            isBatchMgmt: "",
            batch_onulist: [],
            post_url: "",
            // 标识是否有拖动并且未保存的数据
            isDraggable: false,
            // 排序标识， 正序/倒序
            sortState: false
        };
    },
    computed: {
        ...mapState(["lanMap", "port_name", "menu", "change_url", "custom"]),
        testMacaddr() {
            var reg = /^([0-9abcdefABCDEF]{2}\:){5}[0-9abcdefABCDEF]{2}$/;
            if (!reg.test(this.add_macaddr)) {
                return true;
            }
            return false;
        },
        onulist() {
            let onulist = this.onu_allow_list.slice(0);
            if (!!this.search_str) {
                onulist = onulist.filter(item => {
                    let flag = false;
                    if (
                        item.macaddr.indexOf(this.search_str) !== -1 ||
                        item.onu_name.indexOf(this.search_str) !== -1
                    ) {
                        flag = true;
                    }
                    try {
                        const reg = new RegExp(this.search_str, "ig");
                        if (reg.test(item.macaddr) || reg.test(item.onu_name)) {
                            flag = true;
                        }
                    } catch (error) {}
                    return flag;
                });
            }
            // onulist.sort((a, b) => {
            //     if (
            //         a.status.toLowerCase() === "online" &&
            //         b.status.toLowerCase() === "online"
            //     ) {
            //         return a.onu_id - b.onu_id;
            //     }
            //     return (
            //         a.status.toLowerCase() === "online" &&
            //         b.status.toLowerCase() !== "online"
            //     );
            // });
            return onulist;
        },
        onlineCount() {
            return this.onu_allow_list.filter(
                item => item.status.toLowerCase() === "online"
            ).length;
        },
        isAll() {
            return this.portid !== 0x100;
        }
    },
    activated() {
        var pid = sessionStorage.getItem("pid");
        this.portid = this.$route.query.port_id || pid;
        this.getData();
    },
    created() {
        var pid = Number(sessionStorage.getItem("pid"));
        this.portid = this.$route.query.port_id || pid || 0x100;
        if (this.$route.query.port_id) {
            this.$router.push("/onu_allow");
        }
        if (this.change_url.beta === "test") {
            var url = this.change_url.onu_allow;
            this.$http
                .get(url)
                .then(res => {
                    if (res.data.code === 1) {
                        if (Array.isArray(res.data.data)) {
                            this.onu_allow_list = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        }
    },
    methods: {
        ...mapMutations({
            changeMenu: "updateNavMenu",
            changeAdvMenu: "updateAdvMenu",
            changeFMenu: "updateAdvFMenu"
        }),
        //  手动刷新
        reload() {
            this.$parent.reload();
        },
        getData() {
            this.search_str = "";
            this.onu_allow_list = [];
            const url =
                this.portid === 0x100
                    ? this.change_url.onu_allow_all
                    : "/onu_allow_list?port_id=" + this.portid;
            this.$http
                .get(url)
                .then(res => {
                    if (res.data.code === 1) {
                        if (Array.isArray(res.data.data)) {
                            this.onu_allow_list = res.data.data;
                        }
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        closeModal() {
            this.add_dialog = false;
        },
        // 删除onu
        delete_onu(node) {
            var olist;
            this.post_url = "/onu_allow_list?form=onucfg";
            if (!node) {
                olist = this.batch_onulist;
                this.post_url = "/onu_allow_list?form=batch";
                olist = olist
                    .map(item => {
                        return item.onu_id;
                    })
                    .sort((a, b) => a - b);
            } else {
                olist = node.onu_id;
            }
            if (olist.length <= 0) {
                this.$message({
                    type: "info",
                    text: this.lanMap["no_select_onu"]
                });
                return;
            }
            const post_params = {
                method: "delete",
                param: {
                    port_id: node ? node.port_id : this.portid,
                    onu_id: olist,
                    macaddr: node ? node.macaddr : ""
                }
            };
            this.$confirm(this.lanMap["tips_del_onu"])
                .then(_ => {
                    this.result_delete(post_params);
                })
                .catch(_ => {});
        },
        //  手动添加 onu
        add_onu() {
            this.add_macaddr = "";
            this.add_onuid = "";
            this.add_onudesc = "";
            this.add_dialog = true;
        },
        //  添加onu 弹出层
        add_onuitem(bool) {
            if (bool) {
                if (this.add_onuid === "") {
                    this.add_onuid = 0;
                }
                if (
                    this.testMacaddr ||
                    this.add_macaddr === "" ||
                    this.add_macaddr.toLowerCase() === "ff:ff:ff:ff:ff:ff" ||
                    this.add_macaddr === "00:00:00:00:00:00" ||
                    this.add_macaddr.toLowerCase() === "01:00:5e:00:00:00"
                ) {
                    this.$message({
                        type: "error",
                        text: this.lanMap["param_mac"]
                    });
                    return;
                }
                if (
                    isNaN(Number(this.add_onuid)) ||
                    Number(this.add_onuid) > 64 ||
                    Number(this.add_onuid) < 0
                ) {
                    this.$message({
                        type: "error",
                        text: this.lanMap["param_onuid"]
                    });
                    return;
                }
                const post_params = {
                    method: "add",
                    param: {
                        port_id: Number(this.portid),
                        onu_id: Number(this.add_onuid),
                        macaddr: this.add_macaddr,
                        auth_state: this.add_onustate,
                        onu_type: "",
                        onu_desc: this.add_onudesc
                    }
                };
                this.$http
                    .post("/onu_allow_list?form=onucfg", post_params)
                    .then(res => {
                        if (res.data.code === 1) {
                            this.$message({
                                type: res.data.type,
                                text: this.lanMap["setting_ok"]
                            });
                            this.getData();
                        } else if (res.data.code > 1) {
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
                    .catch(err => {
                        // to do
                    });
            }
            this.add_dialog = false;
        },
        //  onu认证/取消认证确认框
        result_authstate(data) {
            this.$http
                .post("/onu_allow_list?form=onucfg", data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"]
                        });
                        this.getData();
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message
                        });
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        //  onu认证 / 取消认证
        authstate(node) {
            const post_params = {
                method: "set",
                param: {
                    port_id: node.port_id,
                    onu_id: node.onu_id,
                    macaddr: node ? node.macaddr : "",
                    auth_state: node.auth_state ? 0 : 1,
                    onu_type: "",
                    onu_desc: ""
                }
            };
            const tips_authstate = node.auth_state
                ? this.lanMap["tips_unauth_state"]
                : this.lanMap["tips_auth_state"];
            this.$confirm(tips_authstate)
                .then(_ => {
                    this.result_authstate(post_params);
                })
                .catch(_ => {});
        },
        //  移动ONU到阻止列表
        remove_onu(node) {
            var olist;
            this.post_url = "/onu_allow_list?form=onucfg";
            if (!node) {
                olist = this.batch_onulist;
                this.post_url = "/onu_allow_list?form=batch";
                olist = olist
                    .map(item => {
                        return item.onu_id;
                    })
                    .sort((a, b) => a - b);
            } else {
                olist = node.onu_id;
            }
            if (olist.length <= 0) {
                this.$message({
                    type: "info",
                    text: this.lanMap["no_select_onu"]
                });
                return;
            }
            const post_params = {
                method: "reject",
                param: {
                    port_id: node ? node.port_id : this.portid,
                    onu_id: olist,
                    macaddr: node ? node.macaddr : ""
                }
            };
            this.$confirm(this.lanMap["tips_add_deny_onu"])
                .then(_ => {
                    this.result_deny(post_params);
                })
                .catch(_ => {});
        },
        //  跳转带宽管理
        onu_bandwieth() {
            this.$router.push("/sla_cfg?port_id=" + this.portid);
        },
        //  重启模态框
        result_reboot(data) {
            this.$http
                .post("/onumgmt?form=config", data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text:
                                this.lanMap["reboot_onu"] +
                                this.lanMap["st_success"]
                        });
                        this.getData();
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message
                        });
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        //  重启 onu
        reboot(item) {
            if (item.status.toLowerCase() !== "online") {
                this.$message({
                    type: "info",
                    text: this.lanMap["onu_offline_tips"]
                });
                return;
            }
            const post_params = {
                method: "set",
                param: {
                    port_id: item.port_id,
                    onu_id: item.onu_id,
                    flags: 1,
                    fec_mode: 1
                }
            };
            this.$confirm(this.lanMap["confirm_reboot_onu"])
                .then(_ => {
                    this.result_reboot(post_params);
                })
                .catch(_ => {});
        },
        //  跳转到 onu 详情页
        onu_detail(portid, onuid) {
            this.$router.push(
                "/onu_basic_info?form=base-info&port_id=" +
                    portid +
                    "&onu_id=" +
                    onuid
            );
            this.changeMenu("advanced_setting");
            this.changeFMenu("onu_mgmt");
            this.changeAdvMenu("onu_basic_info");
            sessionStorage.setItem("f_menu", "advanced_setting");
            sessionStorage.setItem("first_menu", "onu_mgmt");
            sessionStorage.setItem("sec_menu", "onu_basic_info");
        },
        //  跳转 onu端口管理
        onu_port_config(portid, onuid) {
            sessionStorage.setItem("pid", portid);
            sessionStorage.setItem("oid", onuid);
            this.$router.push(`/onu_port_cfg`);
            this.changeMenu("advanced_setting");
            this.changeFMenu("onu_mgmt");
            this.changeAdvMenu("onu_port_cfg");
            sessionStorage.setItem("f_menu", "advanced_setting");
            sessionStorage.setItem("first_menu", "onu_mgmt");
            sessionStorage.setItem("sec_menu", "onu_port_cfg");
        },
        //  跳转到 onu阻止列表
        onu_deny(portid) {
            sessionStorage.setItem("pid", this.portid);
            this.$router.push("/onu_deny");
            this.changeMenu("advanced_setting");
            this.changeFMenu("pon_mgmt");
            this.changeAdvMenu("onu_deny");
            sessionStorage.setItem("f_menu", "advanced_setting");
            sessionStorage.setItem("first_menu", "pon_mgmt");
            sessionStorage.setItem("sec_menu", "onu_deny");
        },
        //  删除确认框
        result_delete(data) {
            this.$http
                .post(this.post_url, data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"]
                        });
                        this.getData();
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message
                        });
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        //  加入黑名单确认框
        result_deny(data) {
            this.$http
                .post(this.post_url, data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"]
                        });
                        this.getData();
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message
                        });
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        //  开启/关闭 批量管理状态
        show_batchmgmt() {
            if (this.isBatchMgmt) {
                this.batch_onulist = [];
            }
            if (this.isBatchMgmt !== "") {
                this.isBatchMgmt = "";
            } else {
                this.isBatchMgmt = "selection";
                this.$refs["ont-allow-table"].clearSelection();
            }
            this.search_str = "";
        },
        selecttionChange(selections) {
            this.batch_onulist = selections;
        },
        command({ action, data }) {
            const ACTIONS = {
                detail(row) {
                    this.onu_detail(row.port_id, row.onu_id);
                },
                port_config(row) {
                    this.onu_port_config(row.port_id, row.onu_id);
                },
                delete(row) {
                    this.delete_onu(row);
                },
                remove(row) {
                    this.remove_onu(row);
                },
                reboot(row) {
                    this.reboot(row);
                }
            };
            if (typeof ACTIONS[action] === "function") {
                ACTIONS[action].call(this, data);
            }
        },
        setRowStyle(row) {
            return row.status.toLowerCase() === "online"
                ? ""
                : { color: "red" };
        },
        draggable(dragIndex, targetIndex) {
            const list = this.onu_allow_list.slice(0);
            list.splice(targetIndex, 0, list.splice(dragIndex, 1)[0]);
            this.onu_allow_list = list;
            this.isDraggable = true;
        },
        sortMethod(a, b) {
            if (
                (a.status.toLowerCase() !== "online" &&
                    b.status.toLowerCase() !== "online") ||
                (a.status.toLowerCase() === "online" &&
                    b.status.toLowerCase() === "online")
            ) {
                return a.onu_id - b.onu_id;
            }
            if (!this.sortState) {
                return (
                    a.status.toLowerCase() === "online" &&
                    b.status.toLowerCase() !== "online"
                );
            } else {
                return (
                    a.status.toLowerCase() !== "online" &&
                    b.status.toLowerCase() === "online"
                );
            }
        },
        sortChange(list) {
            this.onu_allow_list = list;
            this.isDraggable = false;
            this.sortState = !this.sortState;
        },
        saveDrag() {
            return this.$confirm(this.lanMap["unSaveInfo"])
                .then(_ => {
                    return this.$http
                        .post("/onu_allow_list?form=sort", {
                            method: "set",
                            param: {
                                port_id: Number(this.portid),
                                onulist: this.onu_allow_list.map(
                                    item => item.onu_id
                                )
                            }
                        })
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["save"] +
                                        this.lanMap["st_success"]
                                );
                                this.getData();
                                this.isDraggable = false;
                                return Promise.resolve();
                            } else {
                                this.$message.error(
                                    `(${res.data.code}) ${res.data.message}`
                                );
                                return Promise.reject();
                            }
                        })
                        .catch(_ => {});
                })
                .catch(_ => {});
        }
    },
    beforeRouteLeave(to, from, next) {
        if (this.isDraggable) {
            this.saveDrag()
                .then(_ => {
                    next();
                })
                .catch(_ => {
                    next();
                })
                .finally(_ => {
                    if (this.portid === 0x100) {
                        sessionStorage.setItem("pid", 1);
                    }
                });
        } else {
            // 放在beforeDestroy里，刷新时会有问题
            if (this.portid === 0x100) {
                sessionStorage.setItem("pid", 1);
            }
            next();
        }
    },
    watch: {
        portid() {
            if (this.portid === 0x100) {
                this.isBatchMgmt = "";
            }
            this.isDraggable = false;
            sessionStorage.setItem("pid", this.portid);
            this.getData();
            this.batch_onulist = [];
        }
    }
};
</script>

<style scoped lang="less">
h2 {
    font-size: 24px;
    font-weight: 600;
    color: @titleColor;
    margin: 0 0 0 20px;
}
.onu-allow {
    height: calc(~"100% - 100px");
    overflow-y: auto;
    > div:first-child {
        height: 36px;
        line-height: 36px;
        margin: 20px 0;
        h2 {
            float: left;
            width: 300px;
            vertical-align: middle;
        }
        h2 + span {
            display: inline;
        }
    }
}
hr + div {
    margin: 30px 0 0 10px;
}
input {
    margin-left: 20px;
    margin-top: 9px;
}
input[type="checkbox"] {
    margin: 0;
    cursor: pointer;
}
select {
    width: 160px;
    height: 30px;
    font-size: 16px;
    border-radius: 3px;
    text-indent: 10px;
    margin-left: 6px;
}
a {
    padding: 0 20px;
    margin-left: 10px;
}
.onu-allow-btn {
    height: 26px;
    line-height: 26px;
}
p {
    margin: 20px 0 20px 20px;
    font-size: 16px;
    color: red;
}
i {
    display: inline-block;
    cursor: pointer;
    width: 32px;
    height: 32px;
    vertical-align: middle;
}
div.modal-content {
    width: 600px;
    height: 300px;
}
div.modal-content {
    h3 + div {
        margin-top: 10px;
    }
}
div.modal-item input {
    width: 180px;
}
div.modal-item {
    height: 40px;
    line-height: 40px;
    vertical-align: middle;
    padding-left: 30px;
    span {
        display: inline-block;
        width: 16%;
        text-align: center;
        font-size: 16px;
    }
    span.tips {
        font-size: 14px;
        margin-left: 10px;
        width: auto;
        color: @tipsColor;
    }
}
div.modal-content input {
    margin: 0 0 0 20px;
}
div.modal-item select {
    margin: 0 0 0 20px;
}
div.modal-btn {
    margin: 15px;
}
div.modal-btn > a {
    margin-left: 125px;
    padding: 0 30px;
}
i.verified-actived {
    background: url("../../../assets/authstatus-hover.png") no-repeat;
}
i.unverified {
    background: url("../../../assets/unauthstatus-normal.png") no-repeat;
}
span > span {
    width: 40px;
}
div.tool-tips {
    margin-right: 20px;
    height: 38px;
    vertical-align: middle;
    line-height: 38px;
    position: relative;
    top: -2px;
    &:hover > div {
        display: block;
    }
    > i.icon-tips {
        background: url("../../../assets/tips.png") no-repeat;
        vertical-align: top;
    }
    > div {
        display: none;
        width: 300px;
        //height: 300px;
        background: #ddd;
        border-radius: 10px;
        padding: 10px;
        position: absolute;
        top: 26px;
        right: 26px;
        z-index: 99;
        > div {
            padding: 5px 0;
            &:first-child {
                //border-bottom: 1px solid #333;
                margin-top: 5px;
                margin-bottom: 5px;
            }
            > p {
                color: #333;
                font-size: 14px;
                line-height: 20px;
                margin: 0;
                &:first-child {
                    color: #3990e5;
                }
            }
        }
    }
}
div.search-onu {
    margin: 20px 0 0 20px;
    height: 36px;
    line-height: 36px;
    &:after {
        content: "";
        display: table;
        clear: both;
    }
    > div {
        position: relative;
        > input {
            margin: 0 0 0 20px;
            width: 280px;
        }
        > i {
            background: url("../../../assets/search.png") no-repeat;
            position: absolute;
            top: 2px;
            right: 2px;
        }
    }
    > p {
        margin: 0 0 0 20px;
        color: #666;
        font-size: 14px;
    }
}
h3 {
    font-weight: 600;
    color: @titleColor;
}
div.batch-onu {
    h3 + div {
        > div {
            margin: 0 20px;
            span {
                display: inline;
            }
        }
    }
}
span.onu-count {
    display: inline-block;
    vertical-align: middle;
    margin-left: 30px;
    font-weight: 600;
    & + span {
        display: inline-block;
        vertical-align: middle;
        margin-left: 6px;
        font-weight: 600;
    }
    &.onu-total,
    &.onu-total + span,
    &.onu-online,
    &.onu-online + span {
        color: #1478de;
    }
    &.onu-offline,
    &.onu-offline + span {
        color: #f56c6c;
    }
}
</style>