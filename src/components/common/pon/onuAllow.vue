<template>
    <div class="onu-allow">
        <div>
            <h2>{{ lanMap['onu_allow'] }}</h2>
            <span>{{ lanMap['port_id'] }}</span>
            <select v-model.number="portid">
                <option
                    v-for="(item,key) in port_name.pon"
                    :key="key"
                    :value="item.id"
                >{{ item.name }}</option>
            </select>
        </div>
        <hr />
        <div>
            <a href="javascript:void(0);" @click="reload">{{ lanMap['refresh'] }}</a>
            <a href="javascript:void(0);" @click="add_onu" v-if="custom.addonu">{{ lanMap['add'] }}</a>
            <a href="javascript:void(0);" @click="onu_bandwieth">{{ lanMap['sla_cfg'] }}</a>
            <a href="javascript:void(0);" @click="onu_deny">{{ lanMap['onu_deny'] }}</a>
            <a
                href="javascript:void(0);"
                @click="show_batchmgmt"
                v-if="!is_batch_mgmt"
            >{{ lanMap['batch_mgmt_onu'] }}</a>
            <a
                href="javascript:void(0);"
                @click="show_batchmgmt"
                v-else
            >{{ lanMap['exit_batch_onu'] }}</a>
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
        <div class="search-onu" v-if="!is_batch_mgmt">
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
                <div class="lf">
                    <label for="select-all-onu" onselectstart="return false;">
                        <input
                            type="checkbox"
                            id="select-all-onu"
                            @click="change_select_status"
                            v-model="selectall_state"
                        />
                        <span v-if="!select_all">{{ lanMap['select_all'] }}</span>
                        <span v-else>{{ lanMap['clear_all'] }}</span>
                    </label>
                </div>
                <a href="javascript:void(0);" @click="delete_onu()">{{ lanMap['delete'] }}</a>
                <a href="javascript:void(0);" @click="remove_onu()">{{ lanMap['add_to_deny'] }}</a>
            </div>
        </div>
        <!-- table -->
        <table v-if="onulist.length>0 && onu_display_style === 1" border="1">
            <thead>
                <tr>
                    <td v-if="is_batch_mgmt"></td>
                    <td>{{ lanMap['onu_id'] }}</td>
                    <td>{{ lanMap['macaddr'] }}</td>
                    <td style="width: 80px;">{{ lanMap['status'] }}</td>
                    <td style="width: 100px;">{{ lanMap['auth_state'] }}</td>
                    <td>{{ lanMap['register_time'] }}</td>
                    <td>{{ lanMap['last_down_time'] }}</td>
                    <td>{{ lanMap['last_down_reason'] }}</td>
                    <td style="width: 160px;">{{ lanMap['config'] }}</td>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(item,index) in onulist"
                    :key="index"
                    :style="{ 'color' : item.status.toLowerCase() !== 'online' ? 'red' : '' }"
                >
                    <td v-if="is_batch_mgmt">
                        <label :for="'ONU0'+item.port_id +'/'+ item.onu_id">
                            <input
                                type="checkbox"
                                :value="item.onu_id"
                                v-model="batch_onulist"
                                :id="'ONU0'+item.port_id +'/'+ item.onu_id"
                            />
                        </label>
                    </td>
                    <td>{{ item.onu_name || 'ONU0'+item.port_id +'/'+ item.onu_id }}</td>
                    <td>{{ item.macaddr }}</td>
                    <td>{{ item.status }}</td>
                    <td>
                        <span>{{ item.auth_state ? 'true' : 'false' }}</span>
                        <i
                            :class="[item.auth_state ? 'verified-actived' : 'unverified']"
                            @click="authstate(item)"
                        ></i>
                    </td>
                    <td>{{ item.register_time }}</td>
                    <td>{{ item.last_down_time }}</td>
                    <td>{{ item.last_down_reason }}</td>
                    <td>
                        <div
                            class="onu-table-dropdown-menu"
                            @mouseover="mouseoverCb"
                            @mouseout="mouseoutCb"
                        >
                            <span>{{ lanMap['config'] }}</span>
                            <svg
                                t="1570759962108"
                                style="vertical-align: middle;"
                                viewBox="0 0 1024 1024"
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                                p-id="6745"
                                width="16"
                                height="16"
                            >
                                <path
                                    d="M824.001 335.037c-9.083-9.083-24.049-9.083-33.132 0l-278.991 279.094-279.094-279.09399999c-9.083-9.083-24.049-9.083-33.132-1e-8-9.083 9.083-9.083 24.049 0 33.13200001l292.92499999 292.92499999c0.723 1.032 1.548 2.064 2.47700002 2.993 4.645 4.645 10.734 6.915 16.82399999 6.812 6.09 0.103 12.179-2.168 16.824-6.812 0.929-0.929 1.755-1.961 2.477-2.993l292.822-292.925c9.083-9.083 9.083-24.049 0-33.132z"
                                    p-id="6746"
                                    fill="#2c2c2c"
                                />
                            </svg>
                            <div :style="dropdownPosition">
                                <div
                                    @click="onu_detail(item.port_id,item.onu_id)"
                                >{{ lanMap['detail'] }}</div>
                                <div
                                    @click="onu_port_config(item.port_id, item.onu_id)"
                                >{{ lanMap['onu_port_cfg'] }}</div>
                                <div @click="delete_onu(item)">{{ lanMap['del_onu'] }}</div>
                                <div @click="remove_onu(item)">{{ lanMap['add_to_deny'] }}</div>
                                <div @click="reboot(item)">{{ lanMap['reboot_onu'] }}</div>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <p v-if=" onulist.length === 0">{{ lanMap['no_more_data'] }}</p>
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
            onu_display_style: 1,
            is_batch_mgmt: false,
            batch_onulist: [],
            select_all: false,
            selectall_state: false,
            post_url: "",
            dropdownPosition: {}
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
            let onulist = this.onu_allow_list;
            if (!!this.search_str) {
                const list = onulist.filter(item => {
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
                onulist = list;
            }
            onulist.sort((a, b) => {
                if (
                    a.status.toLowerCase() === "online" &&
                    b.status.toLowerCase() === "online"
                ) {
                    return a.onu_id - b.onu_id;
                }
                return (
                    a.status.toLowerCase() === "online" &&
                    b.status.toLowerCase() !== "online"
                );
            });
            return onulist;
        }
    },
    activated() {
        var pid = sessionStorage.getItem("pid");
        this.portid = this.$route.query.port_id || pid;
        this.getData();
    },
    created() {
        var pid = sessionStorage.getItem("pid");
        this.portid = this.$route.query.port_id || pid || 1;
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
                .catch(err => {
                    // to do
                });
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
            this.$http
                .get("/onu_allow_list?port_id=" + this.portid)
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
            this.post_url = "/onu_allow_list";
            if (!node) {
                olist = this.batch_onulist;
                this.post_url = "/onu_allow_list?form=batch";
                olist = olist
                    .map(item => {
                        return Number(item);
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
                    port_id: Number(this.portid),
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
                    .post("/onu_allow_list", post_params)
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
                .post("/onu_allow_list", data)
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
                    port_id: Number(this.portid),
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
            this.post_url = "/onu_allow_list";
            if (!node) {
                olist = this.batch_onulist;
                this.post_url = "/onu_allow_list?form=batch";
                olist = olist
                    .map(item => {
                        return Number(item);
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
                    port_id: Number(this.portid),
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
                    port_id: Number(this.portid),
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
            if (this.is_batch_mgmt) {
                this.batch_onulist = [];
            }
            this.is_batch_mgmt = !this.is_batch_mgmt;
            this.search_str = "";
        },
        //  全选/反选 按钮
        change_select_status() {
            this.select_all = !this.select_all;
            this.batch_onulist = [];
            const onulist = this.onulist.map(item => item.onu_id);
            if (this.select_all) {
                this.batch_onulist = onulist;
            }
        },
        mouseoverCb(e) {
            const el = e.currentTarget;
            const { bottom } = el.getBoundingClientRect();
            const clientHeight = document.documentElement.clientHeight;
            //  162 为下拉菜单的高度，30为补足footer栏高度
            if (bottom + 162 + 30 > clientHeight) {
                this.dropdownPosition = { top: "-162px" };
            } else {
                this.dropdownPosition = {};
            }
        },
        mouseoutCb() {
            this.dropdownPosition = {};
        }
    },
    watch: {
        portid() {
            sessionStorage.setItem("pid", Number(this.portid));
            this.getData();
            this.batch_onulist = [];
        },
        batch_onulist() {
            this.$nextTick(() => {
                if (this.batch_onulist.length === this.onulist.length) {
                    this.select_all = true;
                    this.selectall_state = true;
                } else {
                    this.select_all = false;
                    this.selectall_state = false;
                }
                if (!this.onulist.length) {
                    this.select_all = false;
                    this.selectall_state = false;
                }
            });
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
    padding-top: 70px;
    padding-bottom: 30px;
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
span {
    display: inline-block;
    width: 16%;
    text-align: center;
    font-size: 16px;
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
select + a {
    margin-left: 60px;
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
}
div.modal-content input {
    margin: 0 0 0 20px;
}
div.modal-item select {
    margin: 0 0 0 20px;
}
span.tips {
    font-size: 14px;
    margin-left: 10px;
    width: auto;
    color: @tipsColor;
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
i.reload {
    background: url("../../../assets/refresh.png") no-repeat;
    margin: 0 20px 0;
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
                > i.reload {
                    margin: 0;
                    background-position: 0 -2px;
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
table {
    width: calc(~"100% - 20px");
    border: 1px solid @borderColor;
    margin: 16px 10px 0 10px;
    td {
        padding: 6px;
        box-sizing: border-box;
        text-align: center;
        word-break: break-all;
        border-color: @borderColor;
    }
    thead {
        background: @tableHeaderBgColor;
        color: @tableHeaderColor;
    }
    tbody {
        tr {
            &:hover {
                background: #dfdfdf;
            }
        }
        span {
            width: auto;
        }
    }
}
.onu-table-dropdown-menu {
    position: relative;
    cursor: pointer;
    padding: 3px 0;
    line-height: 18px;
    &:hover {
        > div {
            max-height: 210px;
        }
    }
    > div {
        background: #fff;
        transition: all 0.2s linear;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        max-height: 0;
        width: 160px;
        z-index: 1;
        overflow: hidden;
        position: absolute;
        left: -7px;
        top: 24px;
        border-radius: 5px;
        color: #444;
        > div {
            line-height: 30px;
            &:hover {
                color: #67aef6;
            }
            &:first-child {
                margin-top: 6px;
            }
            &:last-child {
                margin-bottom: 6px;
            }
        }
    }
}
</style>