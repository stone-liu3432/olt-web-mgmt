<template>
    <div>
        <div class="service-title">{{ lanMap['service'] }}</div>
        <hr />
        <div class="system-port">
            <span>{{ lanMap['sys_port'] }}</span>
            <a href="javascript: void(0);" @click="openSysPortDialog">{{ lanMap['config'] }}</a>
            <div>
                <span style="margin: 0 8px 0 50px;">http:</span>
                <span>{{ sysPortInfo.http }}</span>
                <span style="margin: 0 8px 0 50px;">https:</span>
                <span>{{ sysPortInfo.https }}</span>
                <span style="margin: 0 8px 0 50px;">telnet:</span>
                <span>{{ sysPortInfo.telnet }}</span>
            </div>
        </div>
        <hr />
        <div class="spec-support">
            <span>
                <span>5620{{ lanMap['support'] }}:</span>
                <span>{{ spec1 ? lanMap['support'] : lanMap['not_support'] }}</span>
            </span>
            <a href="javascript: void(0);" @click="setSpec">{{ lanMap['config'] }}</a>
        </div>
        <div class="frpc" v-if="showFRPC">
            <hr />
            <h4>
                <span>FRPC</span>
                <a href="javascript: void(0);" @click="openDialog">{{ lanMap['config'] }}</a>
            </h4>
            <template v-if="Object.keys(frpc).length">
                <div v-for="(item, key) in frpc">
                    <span>{{ key !== 'local_ip' ? key.replace(/_/, ' ') : "Local IP" }}:</span>
                    <span
                        style="text-transform: none;"
                    >{{ (key === 'type' ? item ? 'https' : 'http' : item) || '' }}</span>
                </div>
            </template>
        </div>
        <hr />
        <div class="service-item">
            <div class="snmp-item">
                <h5>SNMP trapserver</h5>
                <div>
                    <div>
                        <span>server ip</span>
                        <input type="text" v-model="serverip" />
                    </div>
                    <div>
                        <span>trap port</span>
                        <span>{{ trap_port }}</span>
                    </div>
                    <div>
                        <span>trap community</span>
                        <input
                            id="trap_community"
                            type="text"
                            v-model="trap_community"
                            :style="{ 'border-color': trap_community.length > 16 ? 'red' : ''}"
                            placeholder="0-16 characters"
                        />
                    </div>
                    <div onselectstart="return false;">
                        <a href="javascript:void(0);" @click="set_trapserver">{{ lanMap['apply'] }}</a>
                    </div>
                </div>
            </div>
            <div class="snmp-item">
                <h5>SNMP community</h5>
                <div>
                    <div onselectstart="return false;" style="padding-left: 20px;">
                        <input type="checkbox" id="read_community" v-model="flag_read" />
                        <label for="read_community">Read community</label>
                        <input type="checkbox" id="write_community" v-model="flag_write" />
                        <label for="write_community">Write community</label>
                    </div>
                    <div>
                        <span>Read community</span>
                        <input
                            id="read_community_input"
                            type="text"
                            v-model="read_community"
                            :style="{ 'border-color': read_community.length > 16 ? 'red' : ''}"
                            placeholder="0-16 characters"
                        />
                    </div>
                    <div>
                        <span>Write community</span>
                        <input
                            id="write_community_input"
                            type="text"
                            v-model="write_community"
                            :style="{ 'border-color': write_community.length > 16 ? 'red' : ''}"
                            placeholder="0-16 characters"
                        />
                    </div>
                    <div onselectstart="return false;">
                        <a href="javascript:void(0);" @click="set_community">{{ lanMap['apply'] }}</a>
                    </div>
                </div>
            </div>
        </div>
        <hr />
        <div class="ssh-info">
            <div>
                <h3>SSH-Key</h3>
                <a href="javascript:void(0);" @click="open_add_ssh">{{ lanMap['add'] }} SSH</a>
            </div>
            <div class="add-ssh" v-if="is_add_ssh">
                <h4>{{ lanMap['add'] + lanMap['key'] }}</h4>
                <h4>{{ lanMap['title'] }}</h4>
                <input
                    type="text"
                    v-model="ssh_name"
                    placeholder="Enter a name to ensure clear use"
                    :style="{'border-color': ssh_name !== '' && !reg_name.test(ssh_name) ? 'red' : ''}"
                />
                <h4>{{ lanMap['key'] }}</h4>
                <textarea
                    rows="6"
                    v-model="ssh_key"
                    spellcheck="false"
                    placeholder="Begins with 'ssh-rsa', 'ssh-dss', 'ssh-ed25519', 'ecdsa-sha2-nistp256', 'ecdsa-sha2-nistp384', or 'ecdsa-sha2-nistp521'"
                ></textarea>
                <a href="javascript:void(0);" @click="submit_add_ssh">{{ lanMap['apply'] }}</a>
                <a
                    href="javascript:void(0);"
                    class="cancel"
                    @click="close_add_ssh"
                >{{ lanMap['cancel'] }}</a>
            </div>
            <div
                class="ssh-item"
                v-for="(item,index) in ssh_info.data"
                :key="index"
                v-if="ssh_info.data && ssh_info.data.length > 0"
            >
                <div>
                    <h4>{{ lanMap['title'] + ' ' + item.keyname }}</h4>
                    <hr />
                    <p>{{ item.publickey }}</p>
                </div>
                <div>
                    <a
                        href="javascript:void(0);"
                        @click="open_del_sshkey(item)"
                    >{{ lanMap['delete'] }}</a>
                </div>
            </div>
        </div>
        <nms-dialog
            :title="lanMap['config']"
            :visible.sync="visible"
            width="500px"
            :before-close="beforeClose"
        >
            <div class="frpc-form-item">
                <span>Server Addr</span>
                <input
                    type="text"
                    v-model="frpcForm.server_addr"
                    :style="{ 'border-color': (frpcForm.server_addr.length < 129) ? '' : 'red' }"
                />
                <span>IP/ Domain name</span>
            </div>
            <div class="frpc-form-item">
                <span>Server Port</span>
                <input
                    type="text"
                    v-model.number="frpcForm.server_port"
                    :style="{ 'border-color': (frpcForm.server_port === '' || validPort('server_port')) ? '' : 'red' }"
                />
                <span>Range: 1 - 65535</span>
            </div>
            <div class="frpc-form-item">
                <span>Token</span>
                <textarea
                    type="text"
                    v-model.trim="frpcForm.token"
                    spellcheck="false"
                    rows="5"
                    :style="{ 'border-color': (frpcForm.token !== undefined && frpcForm.token !== null) && frpcForm.token.length <= 128 ? '' : 'red' }"
                />
                <span>{{ lanMap.composeRange(0, 128) }}</span>
            </div>
            <div class="frpc-form-item">
                <span>Appname</span>
                <input
                    type="text"
                    v-model="frpcForm.appname"
                    :style="{ 'border-color': (frpcForm.appname === '' || validAppname ) ? '' : 'red' }"
                />
                <span>{{ lanMap.composeRange(1, 32) }}</span>
            </div>
            <div class="frpc-form-item">
                <span>Type</span>
                <select v-model.number="frpcForm.type">
                    <option value="0">http</option>
                    <!-- <option value="1">https</option> -->
                </select>
            </div>
            <div class="frpc-form-item">
                <span>Local IP</span>
                <input
                    disabled
                    type="text"
                    v-model="frpcForm.local_ip"
                    :style="{ 'border-color': (frpcForm.local_ip === '' || validIp('local_ip')) ? '' : 'red' }"
                />
            </div>
            <div class="frpc-form-item">
                <span>Local Port</span>
                <input
                    disabled
                    type="text"
                    v-model.number="frpcForm.local_port"
                    :style="{ 'border-color': (frpcForm.local_port === '' || validPort('local_port')) ? '' : 'red' }"
                />
            </div>
            <div class="frpc-form-item">
                <span>Remote Port</span>
                <input
                    type="text"
                    v-model.number="frpcForm.remote_port"
                    :style="{ 'border-color': (frpcForm.remote_port === '' || frpcForm.remote_port === 0 || validPort('remote_port')) ? '' : 'red' }"
                />
                <span>Range: 0 - 65535</span>
            </div>
            <div class="frpc-form-item">
                <span>Custom Domains</span>
                <input
                    type="text"
                    v-model="frpcForm.custom_domains"
                    :style="{ 'border-color': (frpcForm.custom_domains === '' || validDomains) ? '' : 'red' }"
                />
                <span>ex. www.test.com</span>
            </div>
            <div class="frpc-form-item">
                <span>Sub Domains</span>
                <input
                    type="text"
                    v-model.trim="frpcForm.subdomain"
                    :style="{ 'border-color': (frpcForm.subdomain !== undefined && frpcForm.subdomain !== null) && frpcForm.subdomain.length <= 64   ? '' : 'red' }"
                />
                <span>{{ lanMap.composeRange(0, 64) }}</span>
            </div>
            <div slot="footer">
                <a href="javascript: void(0);" @click="submitForm">{{ lanMap['apply'] }}</a>
                <a href="javascript: void(0);" @click="closeModal">{{ lanMap['cancel'] }}</a>
            </div>
        </nms-dialog>
        <nms-dialog :visible.sync="portVisible" width="500px" :title="lanMap['config']">
            <div class="sys-port-item">
                <span>http</span>
                <input
                    type="text"
                    v-model.number="sysForm.http"
                    :style="{ 'border-color': validatePort(sysForm.http, 'http') ? '' : 'red' }"
                />
                <span class="tips">80 - 50000</span>
            </div>
            <div class="sys-port-item">
                <span>https</span>
                <input
                    type="text"
                    v-model.number="sysForm.https"
                    :style="{ 'border-color': validatePort(sysForm.https, 'https') ? '' : 'red' }"
                />
                <span class="tips">443 - 50000</span>
            </div>
            <div class="sys-port-item">
                <span>telnet</span>
                <input
                    type="text"
                    v-model.number="sysForm.telnet"
                    :style="{ 'border-color': validatePort(sysForm.telnet, 'telnet') ? '' : 'red' }"
                />
                <span class="tips">23, 1000 - 50000</span>
            </div>
            <div slot="footer">
                <nms-button @click="submitSysPort">{{ lanMap['apply'] }}</nms-button>
                <nms-button @click="portVisible = false;">{{ lanMap['cancel'] }}</nms-button>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { replaceDBCS, testIPAddr } from "@/utils/common";
export default {
    name: "service",
    computed: {
        ...mapState(["lanMap", "system", "custom"]),
        validAppname() {
            const reg = /^\w{4,32}$/;
            return reg.test(this.frpcForm.appname);
        },
        validDomains() {
            const reg = /^.{0,64}$/;
            return reg.test(this.frpcForm.custom_domains);
        },
        showFRPC() {
            const res =
                this.system.data &&
                this.system.data.size > 16 &&
                this.custom.frpc;
            res && this.getFrpc();
            return res;
        }
    },
    data() {
        return {
            is_add_ssh: false,
            ssh_info: {},
            del_ssh_info: {},
            ssh_name: "",
            ssh_key: "",
            serverip: "",
            trap_port: "",
            trap_community: "",
            //  限制点击频率
            limit: false,
            read_community: "",
            write_community: "",
            flag_read: false,
            flag_write: false,
            reg_name: /^[^\\\/\'\"\?\s]{4,32}$/,
            frpc: {
                // server_addr: "1.1.1.1",
                // server_port: 7000,
                // token: "sagsahfgjfgdjghjghddghd",
                // appname: "web",
                // type: 0,
                // local_ip: "127.0.0.1",
                // local_port: 80,
                // remote_port: 8080,
                // custom_domains: "www.test.com",
                // subdomain: "asdfasdf"
            },
            frpcForm: {
                server_addr: "",
                server_port: "",
                token: "",
                appname: "",
                type: 0,
                local_ip: "",
                local_port: "",
                remote_port: "",
                custom_domains: "",
                subdomain: ""
            },
            visible: false,
            supportFrpc: false,
            sysPortInfo: {},
            portVisible: false,
            sysForm: {
                http: "", // 80 - 50000
                https: "", // 443 - 50000
                telnet: "" // 23 1000 - 50000
            },
            spec1: 0,
            spec_model: 0
        };
    },
    created() {
        this.get_trap();
        this.get_ssh();
        this.get_community();
        this.getSysPort();
        this.getSpec();
    },
    methods: {
        get_ssh() {
            this.$http
                .get("/system_service?form=sshd")
                .then(res => {
                    if (res.data.code === 1) {
                        this.ssh_info = res.data;
                    } else {
                        this.ssh_info = {};
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        get_trap() {
            this.$http
                .get("/snmp_cfg?form=trap")
                .then(res => {
                    if (res.data.code === 1) {
                        this.serverip = res.data.data.serverip;
                        this.trap_port = res.data.data.trap_port;
                        this.trap_community = res.data.data.trap_community;
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        get_community() {
            this.$http
                .get("/snmp_cfg?form=community")
                .then(res => {
                    if (res.data.code === 1) {
                        this.read_community = res.data.data.read_community;
                        this.write_community = res.data.data.write_community;
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        getSysPort() {
            this.sysPortInfo = {};
            this.$http
                .get("/system_service?form=port")
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.sysPortInfo = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        getSpec() {
            this.spec1 = 0;
            this.$http
                .get("/system_service?form=spec1")
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.spec1 = res.data.data.spec1;
                        }
                    }
                })
                .catch(err => {});
        },
        open_del_sshkey(node) {
            this.$confirm(this.lanMap["if_sure"])
                .then(_ => {
                    var post_param = {
                        method: "delete",
                        param: {
                            keyname: node.keyname
                        }
                    };
                    this.$http
                        .post("/system_service?form=sshd", post_param)
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message({
                                    type: res.data.type,
                                    text:
                                        this.lanMap["delete"] +
                                        ": " +
                                        this.lanMap["st_success"]
                                });
                                this.get_ssh();
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
                })
                .catch(_ => {});
        },
        set_trapserver() {
            if (this.limit) {
                var e = e || window.event;
                var node = e.target || e.srcElement;
                this.$message({
                    type: "error",
                    text: this.lanMap["click_often"],
                    duration: 1000
                });
                return;
            }
            this.limit = true;
            setTimeout(() => {
                this.limit = false;
            }, 1000);
            var reg_ip = /^(([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){1}((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4]){1}$/g;
            if (!reg_ip.test(this.serverip)) {
                this.$message({
                    type: "error",
                    text: this.lanMap["ipaddr_error"]
                });
                return;
            }
            this.trap_community = replaceDBCS(
                this.trap_community.replace(/\s*/g, "")
            );
            if (!this.trap_community || this.trap_community.length > 16) {
                document.getElementById("trap_community").focus();
                return;
            }
            // if(!~~this.trap_port){
            //     this.$message({
            //         type: 'error',
            //         text: ''
            //     })
            //     return
            // }
            var params = {
                method: "set",
                param: {
                    serverip: this.serverip,
                    trap_port: this.trap_port,
                    trap_community: this.trap_community
                }
            };
            this.$http
                .post("/snmp_cfg?form=trap", params)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"]
                        });
                        this.get_trap();
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
        set_community() {
            if (this.limit) {
                this.$message({
                    type: "error",
                    text: this.lanMap["click_often"],
                    duration: 1000
                });
                return;
            }
            this.limit = true;
            setTimeout(() => {
                this.limit = false;
            }, 1000);
            var flags = 0;
            if (this.flag_read) flags += 1;
            if (this.flag_write) flags += 2;
            if (!flags) {
                this.$message({
                    type: "info",
                    text: this.lanMap["modify_tips"]
                });
                return;
            }
            this.read_community = replaceDBCS(
                this.read_community.replace(/\s*/g, "")
            );
            this.write_community = replaceDBCS(
                this.write_community.replace(/\s*/g, "")
            );
            if (
                this.flag_read &&
                (!this.read_community || this.read_community.length > 16)
            ) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: read community`
                );
            }
            if (
                this.flag_write &&
                (!this.write_community || this.write_community.length > 16)
            ) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: write community`
                );
            }
            var params = {
                method: "set",
                param: {
                    flags: flags,
                    read_community: this.read_community,
                    write_community: this.write_community
                }
            };
            this.$http
                .post("/snmp_cfg?form=community", params)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"]
                        });
                        this.get_community();
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message
                        });
                    }
                })
                .catch(err => {});
        },
        //  添加ssh密钥
        open_add_ssh() {
            this.is_add_ssh = !this.is_add_ssh;
        },
        close_add_ssh() {
            this.is_add_ssh = false;
            this.ssh_name = "";
            this.ssh_key = "";
        },
        submit_add_ssh() {
            if (!this.ssh_name || !this.reg_name.test(this.ssh_name)) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] + ": " + this.lanMap["title"]
                });
                return;
            }
            if (!this.ssh_key) {
                this.$message({
                    type: "error",
                    text: this.lanMap["param_error"] + ": " + this.lanMap["key"]
                });
                return;
            }
            var post_param = {
                method: "add",
                param: {
                    keyname: this.ssh_name,
                    publickey: this.ssh_key.replace(/(^\s+)|(\s+$)/, "")
                }
            };
            this.$http
                .post("/system_service?form=sshd", post_param)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["add"] + this.lanMap["st_success"]
                        });
                        this.get_ssh();
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
            this.close_add_ssh();
        },
        getFrpc() {
            this.frpc = {};
            this.$http
                .get("/system_service?form=frpc")
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.frpc = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        openDialog() {
            this.visible = true;
            if (Object.keys(this.frpc).length) {
                for (var key in this.frpc) {
                    this.frpcForm[key] = this.frpc[key];
                }
            }
        },
        validIp(key) {
            return testIPAddr(this.frpcForm[key]);
        },
        validPort(key) {
            const val = this.frpcForm[key];
            return val >= 1 && val <= 65535;
        },
        submitForm() {
            if (this.frpcForm.server_addr.length > 128) {
                this.$message.error(
                    `${this.lanMap["param_error"]}: Server Addr`
                );
                return;
            }
            if (!this.validPort("server_port")) {
                this.$message.error(
                    `${this.lanMap["param_error"]}: Server Port`
                );
                return;
            }
            if (this.frpcForm.token.length > 128) {
                this.$message.error(`${this.lanMap["param_error"]}: Token`);
                return;
            }
            if (!this.validAppname) {
                this.$message.error(`${this.lanMap["param_error"]}: Appname`);
                return;
            }
            if (!this.validPort("remote_port") && this.frpcForm.remote_port) {
                this.$message.error(
                    `${this.lanMap["param_error"]}: Remote Port`
                );
                return;
            }
            if (!this.validDomains) {
                this.$message.error(
                    `${this.lanMap["param_error"]}: Custom Domains`
                );
                return;
            }
            if (this.frpcForm.subdomain.length > 64) {
                this.$message.error(
                    `${this.lanMap["param_error"]}: Sub Domains`
                );
            }
            const post_param = {
                method: "set",
                param: {
                    server_addr: this.frpcForm.server_addr,
                    server_port: this.frpcForm.server_port,
                    token: this.frpcForm.token,
                    appname: this.frpcForm.appname,
                    type: this.frpcForm.type,
                    remote_port: this.frpcForm.remote_port || 0,
                    custom_domains: this.frpcForm.custom_domains,
                    subdomain: this.frpcForm.subdomain
                }
            };
            const loading = this.$loading();
            this.$http
                .post("/system_service?form=frpc", post_param)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                    this.getFrpc();
                    this.closeModal();
                    loading.close();
                })
                .catch(err => {
                    loading.close();
                });
        },
        closeModal() {
            this.beforeClose(_ => {
                this.visible = false;
            });
        },
        beforeClose(done) {
            const form = {
                server_addr: "",
                server_port: "",
                appname: "",
                type: 0,
                local_ip: "",
                local_port: "",
                remote_port: "",
                custom_domains: ""
            };
            for (var key in this.frpcForm) {
                this.frpcForm[key] = form[key];
            }
            if (typeof done === "function") {
                done();
            }
        },
        openSysPortDialog() {
            this.portVisible = true;
            Object.keys(this.sysForm).forEach(key => {
                this.sysForm[key] = this.sysPortInfo[key];
            });
        },
        submitSysPort() {
            if (!this.validatePort(this.sysForm.http, "http")) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: http`
                );
            }
            if (!this.validatePort(this.sysForm.https, "https")) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: https`
                );
            }
            if (!this.validatePort(this.sysForm.telnet, "telnet")) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: telnet`
                );
            }
            this.$http
                .post("/system_service?form=port", {
                    method: "set",
                    param: {
                        http: Number(this.sysForm.http),
                        https: Number(this.sysForm.https),
                        telnet: Number(this.sysForm.telnet)
                    }
                })
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.getSysPort();
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                })
                .catch(err => {});
            this.portVisible = false;
        },
        validatePort(port, type) {
            const TYPES = {
                http(val) {
                    return val >= 80 && val <= 50000;
                },
                https(val) {
                    return val >= 443 && val <= 50000;
                },
                telnet(val) {
                    return val === 23 || (val >= 1000 && val <= 50000);
                }
            };
            if (typeof TYPES[type] === "function") {
                return TYPES[type].call(this, Number(port));
            }
        },
        setSpec() {
            this.spec_model = this.spec1;
            this.$confirm(
                <div class="spec-item">
                    <span>5620{this.lanMap["support"]}:</span>
                    <select
                        value={this.spec_model}
                        onChange={e => (this.spec_model = e.target.value)}
                    >
                        <option value={0}>{this.lanMap["not_support"]}</option>
                        <option value={1}>{this.lanMap["support"]}</option>
                    </select>
                </div>,
                this.lanMap["config"]
            )
                .then(_ => {
                    this.submitSpec(this.spec_model);
                })
                .catch(_ => {});
        },
        submitSpec(spec) {
            if (Number(this.spec_model) === this.spec1) {
                return this.$message.info(this.lanMap["modify_tips"]);
            }
            this.$http
                .post("/system_service?form=spec1", {
                    method: "set",
                    param: {
                        spec1: this.spec_model
                    }
                })
                .then(res => {
                    if (res.data.code === 1) {
                        this.$confirm(this.lanMap["cfg_succ_reboot_tips"])
                            .then(_ => {
                                this.$http
                                    .get("/system_reboot")
                                    .then(res => {
                                        const lang = sessionStorage.getItem(
                                            "lang"
                                        );
                                        sessionStorage.clear();
                                        sessionStorage.setItem("lang", lang);
                                        this.$router.push("/login");
                                    })
                                    .catch(err => {});
                            })
                            .catch(_ => {});
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                })
                .catch(_ => {});
        }
    }
};
</script>

<style lang="less" scoped>
a {
    width: 120px;
    padding: 0;
}
div.service-title {
    font-size: 24px;
    margin: 20px 10px;
    font-weight: bold;
    color: @titleColor;
}
div.service-item {
    margin: 20px;
    overflow: hidden;
}
div.snmp-item {
    width: 450px;
    box-sizing: border-box;
    line-height: 36px;
    overflow: hidden;
    float: left;
    h5 {
        color: @titleColor;
        font-size: 18px;
        font-weight: 500;
    }
    > div {
        > div {
            margin: 6px 0;
            > span {
                display: inline-block;
                text-align: right;
                padding-right: 12px;
                width: 140px;
            }
            > a {
                width: 120px;
                padding: 0;
                margin: 8px 0 0 230px;
            }
        }
    }
    > div:first-child {
        width: 120px;
    }
    input[type="checkbox"] {
        margin: 0 5px 0 20px;
        &:first-child {
            margin-left: 0;
        }
    }
}
div.ssh-info {
    margin: 20px;
    > div {
        border-radius: 3px;
        h3 {
            float: left;
            color: @titleColor;
            font-size: 20px;
            font-weight: 500;
            width: 230px;
        }
        &:after {
            content: "";
            display: table;
            clear: both;
        }
        &:first-child {
            line-height: 32px;
            margin: 20px 0;
        }
    }
}
div.ssh-item {
    border: 1px solid #ccc;
    margin-top: 10px;
    height: 86px;
    padding: 5px;
    > div:first-child {
        width: 80%;
    }
    div {
        height: 86px;
        float: left;
        width: 20%;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        box-sizing: border-box;
        a {
            float: none;
            display: inline-block;
        }
        h4 {
            margin: 5px 15px;
            text-align: left;
            font-weight: 600;
            color: #000;
        }
        p {
            margin: 5px;
            word-break: break-all;
            word-wrap: break-word;
            height: 36px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        &:last-child {
            line-height: 86px;
        }
    }
}
div.add-ssh {
    border: 1px solid #aaa;
    margin: 10px 0;
    padding: 20px;
    input {
        width: 100%;
        border-radius: 3px;
    }
    textarea {
        width: 100%;
        box-sizing: border-box;
        resize: none;
        border-radius: 3px;
        border-color: #ccc;
        line-height: 18px;
        font-size: 16px;
        padding: 5px;
    }
    h4 {
        height: 24px;
        line-height: 24px;
        &:first-child {
            font-size: 18px;
            color: @titleColor;
            font-weight: 500;
        }
    }
    h4 + h4,
    input + h4 {
        margin: 10px 0 0 10px;
    }
    a {
        float: none !important;
        display: inline-block;
        margin-top: 15px;
        //background: #20BB44;
        color: #fff;
    }
    .cancel {
        background: #666;
        margin-left: 20px;
    }
}
.frpc {
    h4 {
        > span {
            color: @titleColor;
            font-size: 20px;
            font-weight: 500;
            display: inline-block;
            vertical-align: middle;
            width: 230px;
        }
        margin: 20px 0 20px 20px;
        & + div {
            margin-top: 10px;
        }
        &:after {
            content: "";
            display: table;
            clear: both;
        }
    }
    div {
        line-height: 30px;
        margin: 0 20px;
        border: 1px solid @borderColor;
        span {
            display: inline-block;
            vertical-align: middle;
            text-transform: capitalize;
            padding-left: 12px;
            &:first-child {
                width: 150px;
                border-right: 1px solid @borderColor;
            }
        }
        & + div {
            border-top: none;
        }
    }
}
.frpc-form-item {
    margin: 6px 0 6px 10px;
    span {
        display: inline-block;
        vertical-align: middle;
        width: 130px;
    }
    select {
        width: 197px;
    }
    textarea {
        width: 197px;
        border: 1px solid @borderColor;
        outline: none;
        resize: none;
        padding: 3px 10px;
        box-sizing: border-box;
        vertical-align: top;
        font-size: 16px;
        border-radius: 3px;
        &:focus {
            border-color: @activedFormBorderColor;
        }
    }
    input + span,
    textarea + span {
        font-size: 14px;
        color: #666;
        width: auto;
        margin-left: 5px;
    }
}
div.system-port {
    > div {
        margin: 20px 0;
    }
    margin: 20px 0 20px 20px;
    > span:first-child {
        display: inline-block;
        vertical-align: middle;
        width: 230px;
        color: @titleColor;
        font-size: 20px;
        font-weight: 500;
    }
}
div.sys-port-item {
    margin: 10px 0;
    span {
        display: inline-block;
        vertical-align: middle;
        width: 120px;
        text-align: right;
        padding-right: 12px;
        box-sizing: border-box;
    }
    span.tips {
        width: auto;
        text-align-last: left;
        padding: 0 0 0 6px;
        font-size: @tipsFontSize;
        color: @tipsColor;
    }
}
div.spec-support {
    margin: 20px;
    > span {
        display: inline-block;
        vertical-align: middle;
        width: 230px;
        > span {
            line-height: 32px;
            display: inline-block;
            vertical-align: middle;
            &:first-child {
                color: @titleColor;
                font-size: 20px;
                font-weight: 500;
            }
        }
    }
}
div.spec-item {
    > span {
        display: inline-block;
        width: 120px;
        text-align: right;
        padding-right: 12px;
    }
    > select {
        width: 200px;
    }
}
</style>
