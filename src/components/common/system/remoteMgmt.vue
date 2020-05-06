<template>
    <div>
        <div class="remote-mgmt">
            <span>{{ lanMap['remote_mgmt'] }}</span>
        </div>
        <div class="remote-mgmt">
            <h3>
                <span>{{ lanMap['def_route'] }}:</span>
                <span style="color: #333; font-weight: normal;">{{ def_route }}</span>
                <a href="javascript:void(0);" @click="openSetDialog">{{ lanMap['config'] }}</a>
                <a
                    href="javascript:void(0);"
                    v-if="default_route.gateway && default_route.gateway !== '0.0.0.0'"
                    style="margin-left: 30px;"
                    @click="delDefRoute"
                >{{ lanMap['delete'] }}</a>
            </h3>
        </div>
        <hr />
        <div class="dns-mgmt">
            <h3>DNS:</h3>
            <div>
                <div>
                    <span>{{ lanMap['primary'] }}:</span>
                    <span>{{ dnsData.primary || ' - ' }}</span>
                </div>
                <div>
                    <span>{{ lanMap['secondary'] }}:</span>
                    <span>{{ dnsData.secondary || ' - ' }}</span>
                </div>
            </div>
            <div>
                <a href="javascript:void(0);" @click="configDns">{{ lanMap['config'] }}</a>
            </div>
        </div>
        <hr />
        <div class="remote-content" v-if="outbound.data">
            <p>
                <span>{{ lanMap['outbound'] }}</span>
                <a
                    href="javascript:void(0);"
                    @click="openModal(outbound.data)"
                >{{ lanMap['config'] }}</a>
            </p>
            <div>
                <span>{{ lanMap['ipaddr'] }}</span>
                <span class="colspace">{{ outbound.data.ipaddr }}</span>
                <span>{{ lanMap['ipmask'] }}</span>
                <span>{{ outbound.data.ipmask }}</span>
            </div>
            <div>
                <span>{{ lanMap['rcvpkt'] }}</span>
                <span class="colspace">{{ outbound.data.rcvpkts }}</span>
                <span>{{ lanMap['rcvbytes'] }}</span>
                <span>{{ outbound.data.rcvbytes }}</span>
            </div>
            <div>
                <span>{{ lanMap['transpkt'] }}</span>
                <span class="colspace">{{ outbound.data.transpkts }}</span>
                <span>{{ lanMap['transbytes'] }}</span>
                <span>{{ outbound.data.transbytes }}</span>
            </div>
        </div>
        <div v-else>
            <p>
                <span>{{ lanMap['outbound'] }}</span>
            </p>
            <p>
                <span>{{ lanMap['oub_con_fail'] }}</span>
            </p>
        </div>
        <hr />
        <h2>
            {{ lanMap['inbound'] }}
            <a
                href="javascript:void(0);"
                @click="openAddModal"
            >{{ lanMap['add'] }}</a>
        </h2>
        <div
            class="remote-content"
            v-if="inbound.data"
            v-for="(item,index) in inbound.data"
            :key="index"
        >
            <p>
                <span>{{ item.interface }}</span>
                <a href="javascript:void(0);" @click="openModal(item)">{{ lanMap['config'] }}</a>
                <a
                    href="javascript:void(0);"
                    @click="deleteInbound(item.vlan_id)"
                >{{ lanMap['delete'] }}</a>
            </p>
            <div>
                <span>{{ lanMap['ipaddr'] }}</span>
                <span class="colspace">{{ item.ipaddr }}</span>
                <span>{{ lanMap['ipmask'] }}</span>
                <span class="colspace">{{ item.ipmask }}</span>
                <span>VLAN</span>
                <span>{{ item.vlan_id }}</span>
            </div>
            <div>
                <span>{{ lanMap['rcvpkt'] }}</span>
                <span class="colspace">{{ item.rcvpkts }}</span>
                <span>{{ lanMap['rcvbytes'] }}</span>
                <span>{{ item.rcvbytes }}</span>
            </div>
            <div>
                <span>{{ lanMap['transpkt'] }}</span>
                <span class="colspace">{{ item.transpkts }}</span>
                <span>{{ lanMap['transbytes'] }}</span>
                <span>{{ item.transbytes }}</span>
            </div>
        </div>
        <div class="remote-content" v-if="!inbound.data">
            <p>
                <span>{{ lanMap['inbound'] }}</span>
            </p>
            <p style="border-bottom:none;">
                <span>{{ lanMap['no_inb_info'] }}</span>
            </p>
        </div>
        <div class="modal-dialog" v-if="modalDialog && interface_data">
            <div class="cover"></div>
            <div class="modal-content">
                <div class="modal-item modal-header">
                    <h2 class="lf">{{ lanMap['remote_mgmt'] }}</h2>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['interface'] }}</span>
                    <span
                        class="outbound-title"
                    >{{ lanMap[click_interface] ? lanMap[click_interface] : click_interface }}</span>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['ipaddr'] }}</span>
                    <input
                        type="text"
                        placeholder="192.168.1.1"
                        v-model="ipaddr"
                        :style="{ 'border-color' : ipaddr === '' || reg_ip.test(ipaddr) ? '' : 'red' }"
                    />
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['ipmask'] }}</span>
                    <input
                        type="text"
                        placeholder="255.255.255.0"
                        v-model="ipmask"
                        :style="{ 'border-color' : ipmask === '' || reg_ipmask.test(ipmask) ? '' : 'red' }"
                    />
                </div>
                <div class="modal-item">
                    <span>VLAN</span>
                    <input
                        type="text"
                        id="vlanid"
                        placeholder="0-4094"
                        v-model.number="vlan"
                        :style="{'border-color': click_interface !== 'outbound' && vlan !== '' && (vlan < 1 || vlan > 4094 || isNaN(vlan)) ? 'red' : '' }"
                        :disabled="click_interface !== 'add'"
                    />
                </div>
                <div class="modal-item flex-box">
                    <a
                        href="javascript:;"
                        @click="isAdd"
                        v-if="click_interface === 'add'"
                    >{{ lanMap['apply'] }}</a>
                    <a href="javascript:;" @click="isApply" v-else>{{ lanMap['apply'] }}</a>
                    <a href="javascript:;" @click="closeModal()">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="closeModal()"></div>
            </div>
        </div>
        <nms-dialog :visible.sync="dialogVisible" width="500px">
            <template slot="title">{{ lanMap['config'] + lanMap['def_route'] }}</template>
            <div class="default-route-set">
                <span>{{ lanMap['def_route'] }}</span>
                <input
                    type="text"
                    v-model="gateway"
                    :style="{ 'border-color': validateIp(gateway) ? '' : 'red'}"
                />
                <span class="tips">ex: 127.0.0.1</span>
            </div>
            <div slot="footer">
                <a href="javascript:void(0);" @click="submitForm">{{ lanMap['apply'] }}</a>
                <a href="javascript:void(0);" @click="dialogVisible = false;">{{ lanMap['cancel'] }}</a>
            </div>
        </nms-dialog>
        <nms-dialog :visible.sync="dnsVisible" width="500px">
            <template slot="title">{{ lanMap['config'] }} DNS</template>
            <div class="default-route-set">
                <span>{{ lanMap['primary'] }}</span>
                <input
                    type="text"
                    v-model="primary"
                    :style="{ 'border-color': validateIp(primary) ? '' : 'red'}"
                />
                <span class="tips">ex: 127.0.0.1</span>
            </div>
            <div class="default-route-set" style="margin-top: 12px;">
                <span>{{ lanMap['secondary'] }}</span>
                <input
                    type="text"
                    v-model="secondary"
                    :style="{ 'border-color': validateIp(secondary) ? '' : 'red'}"
                />
                <span class="tips">ex: 127.0.0.1</span>
            </div>
            <div slot="footer">
                <a href="javascript:void(0);" @click="submitDns">{{ lanMap['apply'] }}</a>
                <a href="javascript:void(0);" @click="dnsVisible = false;">{{ lanMap['cancel'] }}</a>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";
export default {
    name: "remoteMgmt",
    computed: {
        ...mapState(["lanMap", "change_url"]),
        def_route() {
            return this.default_route.gateway === "0.0.0.0"
                ? " -- "
                : this.default_route.gateway;
        }
    },
    data() {
        return {
            outbound: {},
            inbound: {},
            interface_data: [],
            // 控制模态框隐藏显示
            modalDialog: false,
            // 模态框所需要的所有数据
            interface_map: {},
            // 模态框内下拉框绑定
            click_interface: "",
            //  IP地址
            ipaddr: "",
            test_ipaddr: false,
            //  IP掩码
            ipmask: "",
            test_ipmask: false,
            //  IP验证正则
            reg_ip: /^((25[0-5]|2[0-4]\d|1?\d?\d)(\.(?!$)|$)){4}/,
            //  IP掩码验证正则
            reg_ipmask: /^((25[0-5]|2[0-4]\d|1?\d?\d)(\.(?!$)|$)){4}/,
            vlan: " - ",
            default_route: {},
            dialogVisible: false,
            gateway: "",
            dnsData: {},
            dnsVisible: false,
            primary: "",
            secondary: ""
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.$http
                .get(this.change_url.outbound)
                .then(res => {
                    this.outbound = res.data || {};
                    this.interface_data = [];
                    if (res.data.code == 1) {
                        this.interface_data.push(res.data.data);
                        this.ipaddr = res.data.data.ipaddr;
                        this.ipmask = res.data.data.ipmask;
                    }
                    this.$http
                        .get(this.change_url.inbound)
                        .then(res => {
                            if (res.data.code == 1) {
                                this.inbound = res.data;
                                if (res.data.data) {
                                    this.interface_data = this.interface_data.concat(
                                        res.data.data
                                    );
                                }
                            } else {
                                this.inbound = {};
                            }
                        })
                        .catch(err => {});
                })
                .catch(err => {});
            this.getDefRoute();
            this.getDns();
        },
        closeModal() {
            this.modalDialog = false;
        },
        openModal(node) {
            this.modalDialog = true;
            this.click_interface = node.interface;
            this.ipaddr = node.ipaddr;
            this.ipmask = node.ipmask;
            this.vlan = node.vlan_id || " - ";
            this.interface_map = node;
        },
        openAddModal() {
            this.modalDialog = true;
            this.click_interface = "add";
            this.ipaddr = "";
            this.ipmask = "";
            this.interface_map = {};
            this.vlan = "";
        },
        //  增加按钮
        isAdd() {
            if (this.click_interface === "add") {
                if (!this.reg_ip.test(this.ipaddr)) {
                    this.$message({
                        type: "error",
                        text: this.lanMap["ipaddr_error"]
                    });
                    return;
                }
                if (!this.reg_ipmask.test(this.ipmask)) {
                    this.$message({
                        type: "error",
                        text: this.lanMap["ipmask_error"]
                    });
                    return;
                }
                if (this.vlan < 1 || this.vlan > 4094 || isNaN(this.vlan)) {
                    this.$message({
                        type: "error",
                        text: this.lanMap["vlanid_range_hit"]
                    });
                    return;
                }
                var post_params = {
                    method: "add",
                    param: {
                        ipaddr: this.ipaddr,
                        ipmask: this.ipmask,
                        vlan_id: this.vlan
                    }
                };
                // 请求url: /system?form=inbound
                this.$http
                    .post("/system?form=inbound", post_params)
                    .then(res => {
                        if (res.data.code === 1) {
                            this.$message({
                                type: res.data.type,
                                text:
                                    this.lanMap["add"] +
                                    this.lanMap["st_success"]
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
                    .catch(err => {});
                this.modalDialog = false;
            }
        },
        deleteInbound(vlan_id) {
            this.$confirm(this.lanMap["if_sure"] + this.lanMap["delete"] + " ?")
                .then(_ => {
                    var post_params = {
                        method: "delete",
                        param: {
                            vlan_id
                        }
                    };
                    // 请求url: /system?form=inbound
                    this.$http
                        .post("/system?form=inbound", post_params)
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message({
                                    type: res.data.type,
                                    text:
                                        this.lanMap["delete"] +
                                        this.lanMap["st_success"]
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
                        .catch(err => {});
                })
                .catch(_ => {});
        },
        //  确认按钮
        isApply() {
            if (this.click_interface === "add") {
                return;
            } else if (this.click_interface === "outbound") {
                var data = this.interface_map;
                if (
                    data.ipaddr === this.ipaddr &&
                    data.ipmask === this.ipmask
                ) {
                    this.$message({
                        type: "info",
                        text: this.lanMap["modify_tips"]
                    });
                    return;
                }
                if (!this.reg_ip.test(this.ipaddr)) {
                    this.$message({
                        type: "error",
                        text: this.lanMap["ipaddr_error"]
                    });
                    return;
                }
                if (!this.reg_ipmask.test(this.ipmask)) {
                    this.$message({
                        type: "error",
                        text: this.lanMap["ipmask_error"]
                    });
                    return;
                }
                var post_params = {
                    method: "set",
                    param: {
                        ipaddr: this.ipaddr,
                        ipmask: this.ipmask,
                        interface: this.click_interface
                    }
                };
                // 请求url: /system?form=outbound   -->  str.substring(str.indexOf("//") + 2,str.indexOf("/#/"));
                this.$http
                    .post("/system?form=outbound", post_params, {
                        timeout: 5000
                    })
                    .then(res => {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"]
                        });
                        this.getData();
                    })
                    .catch(err => {
                        this.$http
                            .get("http://" + this.ipaddr + "/system_start")
                            .then(res => {
                                window.location.href = "http://" + this.ipaddr;
                            })
                            .catch(err => {
                                window.location.href = "http://" + this.ipaddr;
                            });
                    });
            } else {
                var data = this.interface_map;
                if (
                    data.ipaddr === this.ipaddr &&
                    data.ipmask === this.ipmask
                ) {
                    this.$message({
                        type: "info",
                        text: this.lanMap["modify_tips"]
                    });
                    return;
                }
                if (!this.reg_ip.test(this.ipaddr)) {
                    this.$message({
                        type: "error",
                        text: this.lanMap["ipaddr_error"]
                    });
                    return;
                }
                if (!this.reg_ipmask.test(this.ipmask)) {
                    this.$message({
                        type: "error",
                        text: this.lanMap["ipmask_error"]
                    });
                    return;
                }
                var post_params = {
                    method: "set",
                    param: {
                        ipaddr: this.ipaddr,
                        ipmask: this.ipmask,
                        interface: this.click_interface,
                        vlan_id: this.vlan
                    }
                };
                // 请求url: /system?form=inbound
                this.$http
                    .post("/system?form=inbound", post_params, {
                        timeout: 5000
                    })
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
                        // axios.get('http://' + this.ipaddr + '/system_start').then(res=>{
                        //     window.location.href = 'http://' + this.ipaddr;
                        // }).catch(err=>{
                        //     window.location.href = 'http://' + this.ipaddr;
                        // })
                    });
            }
            this.modalDialog = false;
        },
        //  清除统计按钮  -->  暂未使用
        clear_statistic(data) {
            return;
            if (data.interface === "outbound") {
                var post_data = {
                    method: "set",
                    param: {
                        ipaddr: data.ipaddr,
                        ipmask: data.ipmask,
                        interface: data.interface
                    }
                };
                // 请求url: /system?form=outbound   POST
                this.$http
                    .post("/system?form=outbound", post_data)
                    .then(res => {
                        //  to do
                    })
                    .catch(err => {
                        // to do
                    });
            } else {
                var post_data = {
                    method: "set",
                    param: {
                        ipaddr: data.ipaddr,
                        ipmask: data.ipmask,
                        interface: data.interface,
                        vlan_id: data.vlan_id
                    }
                };
                // 请求url: /system?form=outbound   POST
                this.$http
                    .post("/system?form=inbound", post_data)
                    .then(res => {
                        //  to do
                    })
                    .catch(err => {
                        // to do
                    });
            }
        },
        getDefRoute() {
            this.$http
                .get("/switch_route?form=route_default")
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.default_route = res.data.data;
                        }
                    } else {
                        this.default_route = {};
                    }
                })
                .catch(err => {});
        },
        delDefRoute() {
            this.$confirm(this.lanMap["if_sure"])
                .then(_ => {
                    const post_data = {
                        method: "delete",
                        param: {
                            gateway: "0.0.0.0"
                        }
                    };
                    this.$http
                        .post("/switch_route?form=route_default", post_data)
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["setting_ok"]
                                );
                                this.getDefRoute();
                            } else {
                                this.$message.error(
                                    `(${res.data.code}) ${res.data.message}`
                                );
                            }
                        })
                        .catch(err => {});
                })
                .catch(_ => {});
        },
        openSetDialog() {
            this.dialogVisible = true;
            this.gateway = this.default_route.gateway;
        },
        validateIp(val) {
            const reg = /^((25[0-5]|2[0-4]\d|1?\d?\d)(\.(?!$)|$)){4}/;
            return reg.test(val);
        },
        submitForm() {
            if (!this.validateIp(this.gateway)) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["def_route"]}`
                );
            }
            if (this.gateway === this.def_route) {
                this.$message.info(this.lanMap["modify_tips"]);
                this.dialogVisible = false;
                return;
            }
            const post_data = {
                method: "set",
                param: {
                    gateway: this.gateway
                }
            };
            this.$http
                .post("/switch_route?form=route_default", post_data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.getDefRoute();
                    } else {
                        this.$message.error(
                            "(" + res.data.code + ") " + res.data.message
                        );
                    }
                    this.dialogVisible = false;
                })
                .catch(err => {});
        },
        getDns() {
            this.dnsData = {};
            this.$http
                .get("/system?form=dns")
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.dnsData = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        configDns() {
            this.dnsVisible = true;
            this.primary = this.dnsData.primary || "";
            this.secondary = this.dnsData.secondary || "";
        },
        submitDns() {
            if (
                (!this.primary &&
                    !this.dnsData.primary &&
                    !this.secondary &&
                    !this.dnsData.secondary) ||
                (this.primary === this.dnsData.primary &&
                    this.secondary === this.dnsData.secondary)
            ) {
                this.$message.info(this.lanMap["modify_tips"]);
                return;
            }
            if (this.primary !== "" && !this.validateIp(this.primary)) {
                this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["primary"]}`
                );
                return;
            }
            if (this.secondary !== "" && !this.validateIp(this.secondary)) {
                this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["secondary"]}`
                );
                return;
            }
            const post_params = {
                method: "set",
                param: {
                    primary: this.primary,
                    secondary: this.secondary
                }
            };
            this.$http
                .post("/system?form=dns", post_params)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.getDns();
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.code}`
                        );
                    }
                })
                .catch(err => {});
        }
    }
};
</script>

<style scoped lang="less">
select {
    width: 195px;
    height: 30px;
    font-size: 16px;
}
hr {
    margin: 20px 0;
    & + h2 {
        font-size: 20px;
        margin: 20px 10px;
        font-weight: bold;
        color: #67aef7;
        a {
            font-weight: normal;
            margin-left: 100px;
        }
    }
}
.remote-content {
    border: 1px solid #ddd;
    margin: 20px 10px 0 10px;
}
.remote-content > div,
p {
    border-bottom: 1px solid #ddd;
    line-height: 40px;
    padding-left: 10px;
}
p {
    height: 50px;
    line-height: 50px;
    > a {
        float: right;
        margin: 10px 30px 0 0;
    }
}
p > span {
    color: #67aef7;
    font-size: 18px;
    font-weight: 600;
}
.remote-content > div:last-child {
    border: none;
    padding-left: 10px;
}
.remote-content > div > span {
    display: inline-block;
    vertical-align: top;
    width: 15%;
    height: 40px;
    line-height: 40px;
    padding-left: 10px;
}
.colspace {
    border-right: 1px solid #ccc;
}
.remote-mgmt {
    font-size: 24px;
    margin: 20px 10px;
    font-weight: bold;
    color: #67aef7;
}
.remote-mgmt > span {
    font-size: 24px;
    font-weight: 600;
    color: #67aef7;
}
.remote-mgmt > a {
    display: inline-block;
    width: 150px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: 3px;
    margin-left: 100px;
    border: 1px solid transparent;
}
.clear-btn {
    width: 150px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: #ddd;
    float: right;
    margin-top: 5px;
    border: 1px solid transparent;
    transition: all 0.1s linear;
}
.clear-btn:active,
.remote-mgmt > a:active,
.modal-item > a:active {
    border: 1px solid #67aef7;
    background: #444;
}
.modal-item > a.not-allowed:hover,
.modal-item > a.not-allowed:active {
    cursor: not-allowed;
    border: 1px solid transparent;
    background: #666;
}
.modal-content {
    width: 550px;
    height: 290px;
}
.modal-item {
    padding: 0 20px;
    height: 40px;
}
.modal-item > span {
    display: inline-block;
    width: 180px;
    line-height: 40px;
    text-align: right;
    padding-right: 50px;
    &.outbound-title {
        border: none;
        padding: 0 0 0 10px;
        text-align: left;
    }
}
.modal-item > a {
    display: inline-block;
    width: 100px;
    height: 30px;
    line-height: 30px;
    padding: 0;
    text-align: center;
    border-radius: 5px;
    margin-top: 15px;
    border: 1px solid transparent;
}
.flex-box {
    display: flex;
    justify-content: space-around;
}
div.tool-tips {
    margin: 15px 20px 0 0;
    position: relative;
    > i {
        display: inline-block;
        width: 32px;
        height: 32px;
        vertical-align: middle;
        cursor: pointer;
        background: url("../../../assets/tips.png") no-repeat;
        &:hover {
            & + div {
                display: block;
            }
        }
    }
    > div {
        display: none;
        background: #67aef7;
        border-radius: 5px;
        width: 300px;
        height: 200px;
        position: absolute;
        left: 28px;
        top: 28px;
        padding: 10px;
        z-index: inherit;
        > p {
            border: none;
            height: auto;
            line-height: 28px;
            padding: 0;
        }
        > hr {
            margin: 3px 0;
            border: none;
            border-bottom: 1px solid #000;
        }
    }
}
h3 {
    color: #67aef7;
    font-size: 18px;
    font-weight: 600;
    span + span {
        margin: 0 30px 0 20px;
    }
    > a {
        font-weight: normal;
    }
}
div.default-route-set {
    span.tips {
        font-size: @tipsFontSize;
        color: @tipsColor;
        margin-left: 12px;
    }
    span:first-child {
        display: inline-block;
        width: 120px;
    }
}
div.dns-mgmt {
    margin: 20px 10px;
    h3,
    > div {
        float: left;
        line-height: 72px;
    }
    > h3 + div {
        margin: 0 30px 0 20px;
        line-height: 24px;
        > div {
            margin: 12px 0;
        }
    }
    &:after {
        content: "";
        display: table;
        clear: both;
    }
}
</style>