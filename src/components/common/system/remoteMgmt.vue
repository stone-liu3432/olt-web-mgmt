<template>
    <div>
        <div class="remote-mgmt">
            <span>{{ lanMap["remote_mgmt"] }}</span>
        </div>
        <div class="remote-mgmt">
            <h3>
                <span>{{ lanMap["def_route"] }}:</span>
                <span style="color: #333; font-weight: normal">{{
                    def_route
                }}</span>
                <a href="javascript:void(0);" @click="openSetDialog">{{
                    lanMap["config"]
                }}</a>
                <a
                    href="javascript:void(0);"
                    v-if="
                        default_route.gateway &&
                        default_route.gateway !== '0.0.0.0'
                    "
                    style="margin-left: 30px"
                    @click="delDefRoute"
                    >{{ lanMap["delete"] }}</a
                >
            </h3>
        </div>
        <hr />
        <div class="dns-mgmt">
            <h3>DNS:</h3>
            <div>
                <div>
                    <span>{{ lanMap["primary"] }}:</span>
                    <span>{{ dnsData.primary || " - " }}</span>
                </div>
                <div>
                    <span>{{ lanMap["secondary"] }}:</span>
                    <span>{{ dnsData.secondary || " - " }}</span>
                </div>
            </div>
            <div>
                <a href="javascript:void(0);" @click="configDns">{{
                    lanMap["config"]
                }}</a>
            </div>
        </div>
        <hr />
        <div class="remote-mgmt">
            <h3>
                <span>{{ lanMap["interface"] }}</span>
                <nms-button style="margin-left: 30px" @click="openAddModal">
                    {{ lanMap["add"] + lanMap["inbound"] }}
                </nms-button>
                <nms-button style="margin-left: 30px" @click="setOtbState">
                    {{ outboundBtnText }}
                </nms-button>
            </h3>
        </div>
        <nms-table :rows="interfaces" border>
            <nms-table-column type="expand">
                <template slot-scope="row">
                    <div class="interface-expand-item">
                        <span>{{ lanMap["rcvpkt"] }}:</span>
                        <span>{{ row.rcvpkt || 0 }}</span>
                    </div>
                    <div class="interface-expand-item">
                        <span>{{ lanMap["rcvbytes"] }}:</span>
                        <span>{{ row.rcvbytes || 0 }}</span>
                    </div>
                    <div class="interface-expand-item">
                        <span>{{ lanMap["transpkt"] }}:</span>
                        <span>{{ row.transpkt || 0 }}</span>
                    </div>
                    <div class="interface-expand-item">
                        <span>{{ lanMap["transbytes"] }}:</span>
                        <span>{{ row.transbytes || 0 }}</span>
                    </div>
                </template>
            </nms-table-column>
            <nms-table-column
                :label="lanMap['interface']"
                prop="interface"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['ipaddr']"
                prop="ipaddr"
            ></nms-table-column>
            <nms-table-column
                :label="lanMap['ipmask']"
                prop="ipmask"
            ></nms-table-column>
            <nms-table-column :label="lanMap['ipv6']" prop="ipv6">
                <template slot-scope="row">
                    {{ row.ipv6 || "-" }}
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['vlan_id']">
                <template slot-scope="row">
                    {{ row.vlan_id || "-" }}
                </template>
            </nms-table-column>
            <nms-table-column
                :label="lanMap['macaddr']"
                prop="macaddr"
            ></nms-table-column>
            <nms-table-column :label="lanMap['telnet_status']">
                <template slot-scope="row">
                    {{
                        row.telnet_status === 1
                            ? lanMap["enable"]
                            : lanMap["disable"]
                    }}
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['config']" width="150px">
                <template slot-scope="row">
                    <nms-dropdown @command="dropdownClick">
                        <span>{{ lanMap["config"] }}</span>
                        <template slot="dropdown">
                            <nms-dropdown-item
                                :command="{ action: 'config', row }"
                            >
                                {{ lanMap["config"] }}
                            </nms-dropdown-item>
                            <template v-if="row.interface !== 'outbound'">
                                <nms-dropdown-item
                                    :command="{ action: 'delete', row }"
                                >
                                    {{ lanMap["delete"] }}
                                </nms-dropdown-item>
                            </template>
                            <nms-dropdown-item
                                :command="{ action: 'telnet', row }"
                            >
                                {{
                                    (row.telnet_status === 1
                                        ? lanMap["off"]
                                        : lanMap["on"]) + lanMap["telnet"]
                                }}
                            </nms-dropdown-item>
                        </template>
                    </nms-dropdown>
                </template>
            </nms-table-column>
        </nms-table>
        <nms-dialog :visible.sync="modalDialog" width="550px">
            <template slot="title">{{ lanMap["remote_mgmt"] }}</template>
            <div class="modal-item">
                <span>{{ lanMap["interface"] }}:</span>
                <span class="outbound-title">
                    {{
                        lanMap[click_interface]
                            ? lanMap[click_interface]
                            : click_interface
                    }}
                </span>
            </div>
            <div class="modal-item">
                <span>{{ lanMap["type"] }}:</span>
                <select v-model.number="type">
                    <option :value="1">{{ lanMap["ipv4"] }}</option>
                    <option :value="2">{{ lanMap["ipv6"] }}</option>
                </select>
            </div>
            <template v-if="type === 1">
                <div class="modal-item">
                    <span>{{ lanMap["ipaddr"] }}:</span>
                    <input
                        type="text"
                        placeholder="192.168.1.1"
                        v-model="ipaddr"
                        v-validator="{ regexp: reg_ip, nullable: true }"
                    />
                </div>
                <div class="modal-item">
                    <span>{{ lanMap["ipmask"] }}:</span>
                    <input
                        type="text"
                        placeholder="255.255.255.0"
                        v-model="ipmask"
                        v-validator="{ regexp: reg_ipmask, nullable: true }"
                    />
                </div>
            </template>
            <template v-else>
                <div class="modal-item">
                    <span>{{ lanMap["ipv6"] }}:</span>
                    <input
                        type="text"
                        v-model="ipv6"
                        style="width: 300px"
                        v-validator="{ validator: isIPv6 }"
                    />
                </div>
            </template>
            <template v-if="click_interface === 'add'">
                <div class="modal-item">
                    <span>VLAN:</span>
                    <input
                        type="text"
                        id="vlanid"
                        placeholder="0-4094"
                        v-model.number="vlan"
                        :style="{
                            'border-color':
                                click_interface !== 'outbound' &&
                                vlan !== '' &&
                                (vlan < 1 || vlan > 4094 || isNaN(vlan))
                                    ? 'red'
                                    : '',
                        }"
                        :disabled="click_interface !== 'add'"
                    />
                </div>
            </template>
            <div slot="footer">
                <template v-if="click_interface === 'add'">
                    <nms-button @click="isAdd">
                        {{ lanMap["apply"] }}
                    </nms-button>
                </template>
                <template v-else>
                    <nms-button @click="isApply">
                        {{ lanMap["apply"] }}
                    </nms-button>
                </template>
                <nms-button @click="modalDialog = false">
                    {{ lanMap["cancel"] }}
                </nms-button>
            </div>
        </nms-dialog>
        <nms-dialog :visible.sync="dialogVisible" width="500px">
            <template slot="title">{{
                lanMap["config"] + lanMap["def_route"]
            }}</template>
            <div class="default-route-set">
                <span>{{ lanMap["def_route"] }}</span>
                <input
                    type="text"
                    v-model="gateway"
                    :style="{
                        'border-color': validateIp(gateway) ? '' : 'red',
                    }"
                />
                <span class="tips">ex: 127.0.0.1</span>
            </div>
            <div slot="footer">
                <a href="javascript:void(0);" @click="submitForm">{{
                    lanMap["apply"]
                }}</a>
                <a href="javascript:void(0);" @click="dialogVisible = false">{{
                    lanMap["cancel"]
                }}</a>
            </div>
        </nms-dialog>
        <nms-dialog :visible.sync="dnsVisible" width="500px">
            <template slot="title">{{ lanMap["config"] }} DNS</template>
            <div class="default-route-set">
                <span>{{ lanMap["primary"] }}</span>
                <input
                    type="text"
                    v-model.trim="primary"
                    :style="{
                        'border-color':
                            primary === '' || validateIp(primary) ? '' : 'red',
                    }"
                />
                <span class="tips">ex: 127.0.0.1</span>
            </div>
            <div class="default-route-set" style="margin-top: 12px">
                <span>{{ lanMap["secondary"] }}</span>
                <input
                    type="text"
                    v-model.trim="secondary"
                    :style="{
                        'border-color':
                            secondary === '' || validateIp(secondary)
                                ? ''
                                : 'red',
                    }"
                />
                <span class="tips">ex: 127.0.0.1</span>
            </div>
            <div slot="footer">
                <a href="javascript:void(0);" @click="submitDns">{{
                    lanMap["apply"]
                }}</a>
                <a href="javascript:void(0);" @click="dnsVisible = false">{{
                    lanMap["cancel"]
                }}</a>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { isArray, isIPv6 } from "@/utils/common";
export default {
    name: "remoteMgmt",
    computed: {
        ...mapState(["lanMap", "change_url"]),
        def_route() {
            return this.default_route.gateway === "0.0.0.0"
                ? " -- "
                : this.default_route.gateway;
        },
        outboundBtnText() {
            const state =
                this.outboundAdmin === 1
                    ? this.lanMap["off"]
                    : this.lanMap["on"];
            return state + this.lanMap["outbound"];
        },
    },
    data() {
        return {
            outbound: {},
            inbound: {},
            outboundAdmin: 1,
            interfaces: [],
            // 控制模态框隐藏显示
            modalDialog: false,
            // 模态框所需要的所有数据
            interface_map: {},
            // 模态框内下拉框绑定
            click_interface: "",
            // 1: ipv4 / 2: ipv6
            type: 1,
            ipv6: "",
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
            secondary: "",
        };
    },
    created() {
        this.getData();
        this.getDefRoute();
        this.getDns();
    },
    methods: {
        getData() {
            this.interfaces = [];
            this.$http
                .get(this.change_url.outbound)
                .then((res) => {
                    if (res.data.code == 1) {
                        if (res.data.data) {
                            this.interfaces.push(res.data.data);
                            this.outboundAdmin = res.data.data.admin;
                        }
                    }
                    this.$http
                        .get(this.change_url.inbound)
                        .then((res) => {
                            if (res.data.code == 1) {
                                if (isArray(res.data.data)) {
                                    this.interfaces = this.interfaces.concat(
                                        res.data.data
                                    );
                                }
                            }
                        })
                        .catch((err) => {});
                })
                .catch((err) => {});
        },
        closeModal() {
            this.modalDialog = false;
        },
        openModal(node) {
            this.modalDialog = true;
            this.type = 1;
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
            if (this.type === 1) {
                if (!this.reg_ip.test(this.ipaddr)) {
                    this.$message.error(this.lanMap["ipaddr_error"]);
                    return;
                }
                if (!this.reg_ipmask.test(this.ipmask)) {
                    this.$message.error(this.lanMap["ipmask_error"]);
                    return;
                }
            } else {
                if (!isIPv6(this.ipv6)) {
                    this.$message.error(
                        this.lanMap["param_error"] + ": " + this.lanMap["ipv6"]
                    );
                    return;
                }
            }
            if (this.vlan < 1 || this.vlan > 4094 || isNaN(this.vlan)) {
                this.$message.error(this.lanMap["vlanid_range_hit"]);
                return;
            }
            var post_params = {
                method: "add",
                param: {
                    ipaddr: this.ipaddr,
                    ipmask: this.ipmask,
                    ipv6: this.type === 1 ? undefined : this.ipv6,
                    vlan_id: this.vlan,
                },
            };
            // 请求url: /system?form=inbound
            this.$http
                .post("/system?form=inbound", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message.success(
                            this.lanMap["add"] + this.lanMap["st_success"]
                        );
                        this.getData();
                    } else {
                        this.$message.error(
                            "(" + res.data.code + ") " + res.data.message
                        );
                    }
                })
                .catch((err) => {});
            this.modalDialog = false;
        },
        deleteInbound(row) {
            this.$confirm(this.lanMap["if_sure"] + this.lanMap["delete"] + " ?")
                .then(() => {
                    var post_params = {
                        method: "delete",
                        param: {
                            vlan_id: row.vlan_id,
                        },
                    };
                    // 请求url: /system?form=inbound
                    this.$http
                        .post("/system?form=inbound", post_params)
                        .then((res) => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["delete"] +
                                        this.lanMap["st_success"]
                                );
                                this.getData();
                            } else {
                                this.$message.error(
                                    "(" +
                                        res.data.code +
                                        ") " +
                                        res.data.message
                                );
                            }
                        })
                        .catch((err) => {});
                })
                .catch(() => {});
        },
        //  确认按钮
        isApply() {
            if (this.click_interface === "outbound") {
                var data = this.interface_map;
                if (this.type === 1) {
                    if (
                        data.ipaddr === this.ipaddr &&
                        data.ipmask === this.ipmask
                    ) {
                        return this.$message.info(this.lanMap["modify_tips"]);
                    }
                    if (!this.reg_ip.test(this.ipaddr)) {
                        return this.$message.error(this.lanMap["ipaddr_error"]);
                    }
                    if (!this.reg_ipmask.test(this.ipmask)) {
                        return this.$message.error(this.lanMap["ipmask_error"]);
                    }
                } else {
                    if (data.ipv6 === this.ipv6) {
                        return this.$message.info(this.lanMap["modify_tips"]);
                    }
                    if (!isIPv6(this.ipv6)) {
                        return this.$message.error(
                            `${this.lanMap["param_error"]}: ${this.lanMap["ipv6"]}`
                        );
                    }
                }
                var post_params = {
                    method: "set",
                    param: {
                        ipaddr: this.ipaddr,
                        ipmask: this.ipmask,
                        ipv6: this.type === 1 ? undefined : this.ipv6,
                        interface: this.click_interface,
                    },
                };
                // 请求url: /system?form=outbound   -->  str.substring(str.indexOf("//") + 2,str.indexOf("/#/"));
                this.$http
                    .post("/system?form=outbound", post_params, {
                        timeout: 5000,
                    })
                    .then((res) => {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.getData();
                    })
                    .catch((err) => {
                        this.$http
                            .get("http://" + this.ipaddr + "/system_start")
                            .then((res) => {
                                window.location.href = "http://" + this.ipaddr;
                            })
                            .catch((err) => {
                                window.location.href = "http://" + this.ipaddr;
                            });
                    });
            } else {
                var data = this.interface_map;
                if (this.type === 1) {
                    if (
                        data.ipaddr === this.ipaddr &&
                        data.ipmask === this.ipmask
                    ) {
                        return this.$message.info(this.lanMap["modify_tips"]);
                    }
                    if (!this.reg_ip.test(this.ipaddr)) {
                        return this.$message.error(this.lanMap["ipaddr_error"]);
                    }
                    if (!this.reg_ipmask.test(this.ipmask)) {
                        return this.$message.error(this.lanMap["ipmask_error"]);
                    }
                } else {
                    if (data.ipv6 === this.ipv6) {
                        return this.$message.info(this.lanMap["modify_tips"]);
                    }
                    if (!isIPv6(this.ipv6)) {
                        return this.$message.error(
                            `${this.lanMap["param_error"]}: ${this.lanMap["ipv6"]}`
                        );
                    }
                }
                var post_params = {
                    method: "set",
                    param: {
                        ipaddr: this.ipaddr,
                        ipmask: this.ipmask,
                        ipv6: this.type === 1 ? undefined : this.ipv6,
                        interface: this.click_interface,
                        vlan_id: this.vlan,
                    },
                };
                // 请求url: /system?form=inbound
                this.$http
                    .post("/system?form=inbound", post_params, {
                        timeout: 5000,
                    })
                    .then((res) => {
                        if (res.data.code === 1) {
                            this.$message.success(this.lanMap["setting_ok"]);
                            this.getData();
                        } else {
                            this.$message.error(
                                "(" + res.data.code + ") " + res.data.message
                            );
                        }
                    })
                    .catch((err) => {});
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
                        interface: data.interface,
                    },
                };
                // 请求url: /system?form=outbound   POST
                this.$http
                    .post("/system?form=outbound", post_data)
                    .then((res) => {})
                    .catch((err) => {});
            } else {
                var post_data = {
                    method: "set",
                    param: {
                        ipaddr: data.ipaddr,
                        ipmask: data.ipmask,
                        interface: data.interface,
                        vlan_id: data.vlan_id,
                    },
                };
                // 请求url: /system?form=outbound   POST
                this.$http
                    .post("/system?form=inbound", post_data)
                    .then((res) => {})
                    .catch((err) => {});
            }
        },
        getDefRoute() {
            this.$http
                .get("/switch_route?form=route_default")
                .then((res) => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.default_route = res.data.data;
                        }
                    } else {
                        this.default_route = {};
                    }
                })
                .catch((err) => {});
        },
        delDefRoute() {
            this.$confirm(this.lanMap["if_sure"])
                .then((_) => {
                    const post_data = {
                        method: "delete",
                        param: {
                            gateway: "0.0.0.0",
                        },
                    };
                    this.$http
                        .post("/switch_route?form=route_default", post_data)
                        .then((res) => {
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
                        .catch((err) => {});
                })
                .catch((_) => {});
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
                    gateway: this.gateway,
                },
            };
            this.$http
                .post("/switch_route?form=route_default", post_data)
                .then((res) => {
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
                .catch((err) => {});
        },
        getDns() {
            this.dnsData = {};
            this.$http
                .get("/system?form=dns")
                .then((res) => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.dnsData = res.data.data;
                        }
                    }
                })
                .catch((err) => {});
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
                    secondary: this.secondary,
                },
            };
            this.$http
                .post("/system?form=dns", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.getDns();
                        this.dnsVisible = false;
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.code}`
                        );
                    }
                })
                .catch((err) => {});
        },
        isIPv6(val) {
            return isIPv6(val);
        },
        dropdownClick({ action, row }) {
            switch (action) {
                case "config":
                    this.openModal(row);
                    break;
                case "delete":
                    this.deleteInbound(row);
                    break;
                case "telnet":
                    this.setTelnetStatus(row);
                    break;
            }
        },
        setTelnetStatus(row) {
            this.$confirm(
                this.lanMap["if_sure"] +
                    (row.telnet_status === 1
                        ? this.lanMap["off"]
                        : this.lanMap["on"]) +
                    this.lanMap["telnet"] +
                    " ?"
            )
                .then(() => {
                    const url = "/system?form=telnet_status",
                        post_params = {
                            method: "set",
                            param: {
                                telnet_status: row.telnet_status === 1 ? 2 : 1,
                                vlan_id: row.vlan_id || 0,
                            },
                        };
                    this.$http
                        .post(url, post_params)
                        .then((res) => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["setting_ok"]
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
        setOtbState() {
            this.$confirm(this.lanMap["if_sure"] + this.outboundBtnText + " ?")
                .then(() => {
                    const url = "/system?form=admin",
                        post_params = {
                            method: "set",
                            param: {
                                admin: this.outboundAdmin === 1 ? 2 : 1,
                            },
                        };
                    this.$http
                        .post(url, post_params)
                        .then((res) => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["setting_ok"]
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
    },
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
    width: 120px;
    line-height: 40px;
    text-align: right;
    padding-right: 20px;
    box-sizing: border-box;
    &.outbound-title {
        border: none;
        padding: 0 0 0 10px;
        text-align: left;
        width: auto;
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
.interface-expand-item {
    text-align: left;
    margin: 12px 0;
    width: 23%;
    float: left;
    > span:first-child {
        padding-right: 12px;
    }
}
</style>