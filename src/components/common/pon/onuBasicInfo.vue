<template>
    <div>
        <div class="onu-basic-info" v-if="port_name.pon">
            <h2>{{ lanMap["onu_basic_info"] }}</h2>
            <div>
                <span>{{ lanMap["port_id"] }}</span>
                <select v-model.number="portid">
                    <option
                        v-for="(item, index) in port_name.pon"
                        :key="index"
                        :value="item.id"
                    >
                        {{ item.name }}
                    </option>
                </select>
            </div>
            <div v-if="onu_list.data">
                <span>{{ lanMap["onu_id"] }}</span>
                <select v-model.number="onuid">
                    <option
                        v-for="(item, index) in onu_list.data"
                        :key="index"
                        :value="item"
                    >
                        {{ "ONU" + onu_list.port_id + "/" + item }}
                    </option>
                </select>
            </div>
            <div v-else class="error-msg">{{ lanMap["no_onu_info"] }}</div>
        </div>
        <hr />
        <tabBar
            :tab="tabs"
            @togglePage="select_page"
            v-model="show_page"
            v-if="onu_list.data"
        ></tabBar>
        <div v-if="show_page === 'onu_info'">
            <div class="handle-btn" v-if="onu_basic_info.data">
                <h3 class="lf">{{ lanMap["onu_mgmt"] }}</h3>
                <div class="lf">
                    <nms-button @click="open_onu_desc">
                        {{ lanMap["config"] + lanMap["onu_info"] }}
                    </nms-button>
                    <nms-button @click="open_reboot_onu">
                        {{ lanMap["reboot_onu"] }}
                    </nms-button>
                    <nms-button @click="open_un_auth_onu">
                        {{ lanMap["deregister_onu"] }}
                    </nms-button>
                    <nms-button @click="open_set_fec_mode">
                        {{ lanMap["set_fec_mode"] }}
                    </nms-button>
                    <nms-button @click="closeOptTsm">
                        {{ lanMap["turnoff_opt_transmitter"] }}
                    </nms-button>
                </div>
            </div>
            <div>
                <div class="lf onu-info">
                    <table border="1">
                        <tr
                            v-for="(item, key) in onu_basic_info.data"
                            :key="key"
                            v-if="key != 'port_id' && onu_basic_info.data"
                        >
                            <td style="text-transform: capitalize">
                                {{ lanMap[key] || key.replace(/_/, " ") }}
                            </td>
                            <td>{{ item }}</td>
                        </tr>
                        <tr v-if="onu_fec_mode.data && onu_basic_info.data">
                            <td style="text-transform: capitalize">fec mode</td>
                            <td>
                                {{
                                    onu_fec_mode.data.fec_mode
                                        ? lanMap["enable"]
                                        : lanMap["disable"]
                                }}
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="lf onu-optical-diagnose" v-if="onuid">
                    <div>
                        <div class="onu-optical-title">
                            <span>{{ lanMap["onu_optical_diagnose"] }}</span>
                            <nms-button class="rt" @click="getOpticalData()">
                                {{ lanMap["refresh"] }}
                            </nms-button>
                        </div>
                        <div
                            class="onu-optical"
                            v-for="(item, key) in optical_diagnose.data"
                            :key="key"
                            v-if="
                                key != 'port_id' &&
                                key !== 'onu_id' &&
                                optical_diagnose.data
                            "
                        >
                            <span>{{ lanMap[key] }}</span>
                            <span>{{ item }}</span>
                        </div>
                        <div v-if="!optical_diagnose.data" class="no-more-data">
                            {{ lanMap["flush_page_retry"] }}
                        </div>
                    </div>
                    <div class="onu-upgrade">
                        <div class="onu-optical-title">
                            <span>ONU {{ lanMap["upgrade"] }}</span>
                            <span></span>
                        </div>
                        <div class="upgrade-item">
                            <form class="upload-form">
                                <input
                                    type="file"
                                    id="onu-upgrade-file1"
                                    class="hide"
                                    @change="
                                        changeFile(
                                            'onu-upgrade-file1',
                                            'onu-upgrade-filename1'
                                        )
                                    "
                                />
                                <span
                                    class="updateFile"
                                    id="onu-upgrade-filename1"
                                    >{{ lanMap["file_click"] }}</span
                                >
                            </form>
                        </div>
                        <div class="upgrade-item">
                            <nms-button @click="upload_file">
                                {{ lanMap["apply"] }}
                            </nms-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <onuAlarm
            v-if="show_page === 'onu_alarm'"
            :port-data="{ portid, onuid }"
            ref="onuAlarm"
        ></onuAlarm>
        <onu-wan-config
            v-if="show_page === 'wan_connect'"
            :port-data="onuWanInfo"
            ref="onuWan"
        ></onu-wan-config>
        <onu-wlan
            v-if="show_page === 'onu_wlan'"
            :port-data="{ portid, onuid }"
            ref="onuWlan"
        ></onu-wlan>
        <div class="modal-dialog" v-if="onu_cfg_name">
            <div class="cover"></div>
            <div class="onu-desc">
                <h3 class="modal-header">
                    {{ lanMap["config"] + lanMap["onu_info"] }}
                </h3>
                <div>
                    <span>{{ lanMap["onu_id"] }}</span>
                    <span>{{ "ONU" + portid + "/" + onuid }}</span>
                </div>
                <div>
                    <span>{{ lanMap["onu_name"] }}</span>
                    <input
                        type="text"
                        v-model="onu_name"
                        :style="{
                            'border-color': onu_name.length > 16 ? 'red' : '',
                        }"
                    />
                </div>
                <div>
                    <span>{{ lanMap["onu_desc"] }}</span>
                    <textarea
                        cols="30"
                        rows="5"
                        v-model="onu_desc"
                        :style="{
                            'border-color': onu_desc.length > 64 ? 'red' : '',
                        }"
                    ></textarea>
                </div>
                <div>
                    <a href="javascript:;" @click="onu_cfg_info(true)">{{
                        lanMap["apply"]
                    }}</a>
                    <a href="javascript:;" @click="onu_cfg_info(false)">{{
                        lanMap["cancel"]
                    }}</a>
                </div>
                <div class="close" @click="onu_cfg_info(false)"></div>
            </div>
        </div>
        <nms-dialog :visible.sync="dialogVisible" width="550px">
            <template slot="title">
                {{ lanMap["turnoff_opt_transmitter"] }}
            </template>
            <div class="dialog-content-txsupply-time">
                <span>{{ lanMap["txsupply_time"] }}</span>
                <input
                    type="text"
                    v-model="txsupply_time"
                    v-validator:number="{ mix: 0, max: 65535 }"
                />
                <span class="tips">0 - 65535</span>
            </div>
            <div slot="footer">
                <nms-button @click="submitOptTsm">{{
                    lanMap["apply"]
                }}</nms-button>
                <nms-button @click="dialogVisible = false">
                    {{ lanMap["cancel"] }}
                </nms-button>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import onuAlarm from "./onuAlarm";
import onuWanConfig from "./onuBatchConfig/onuWanConfig";
import onuWlan from "./onuWlan";
export default {
    name: "onuBasicInfo",
    computed: {
        ...mapState([
            "lanMap",
            "port_name",
            "port_info",
            "change_url",
            "onu_list",
        ]),
        tabs() {
            // return ["onu_info", "onu_alarm", "wan_connect", "onu_wlan"];
            let list = ["onu_info", "onu_alarm"];
            if (this.onu_basic_info.data && this.onu_basic_info.data.fw_ver) {
                let fw_ver = this.onu_basic_info.data.fw_ver,
                    dev_type = this.onu_basic_info.data.dev_type,
                    reg_fw = /^4853/,
                    reg_type = /sfu/gi;
                //  && !reg_type.test(dev_type)  2020.11.11 去除 sfu限制
                if (reg_fw.test(fw_ver)) {
                    list.push("wan_connect");
                    if (
                        this.onu_basic_info.data.wlan &&
                        !reg_type.test(dev_type)
                    ) {
                        list.push("onu_wlan");
                    }
                }
            }
            return list;
        },
        onuWanInfo() {
            if (this.wanList.length) {
                const row = this.wanList.filter(
                    (item) => item.onu_id === this.onuid
                )[0];
                if (row) {
                    return {
                        portid: row.port_id,
                        onuid: row.onu_id,
                        geports: row.lanports,
                        wlan: row.wlan,
                        voip: row.voip,
                    };
                }
            }
            return {};
        },
    },
    components: { onuAlarm, onuWanConfig, onuWlan },
    data() {
        return {
            onu_basic_info: {},
            onu_fec_mode: {},
            portid: 0,
            onuid: 0,
            optical_diagnose: {},
            //  ONU配置name和description
            onu_cfg_name: false,
            onu_name: "",
            onu_desc: "",
            show_page: "onu_info",
            isCreated: false,
            wlan: 0,
            wanList: [],
            dialogVisible: false,
            txsupply_time: "",
        };
    },
    created() {
        var pid = Number(sessionStorage.getItem("pid"));
        const { port_id, onu_id } = this.$route.query;
        this.portid = Number(this.$route.query.port_id) || pid || 1;
        //  防止同时触发 created 和 activated
        this.isCreated = true;
        if (this.change_url.beta === "test") {
            this.$http
                .get("./simulation_data/onu_resource.json")
                .then((res) => {
                    if (res.data.code === 1) {
                        var _onu_list = this.analysis(res.data.data.resource);
                        if (!_onu_list) return;
                        var obj = {
                            port_id: res.data.data.port_id,
                            data: _onu_list,
                        };
                        this.addonu_list(obj);
                        this.onuid =
                            this.$route.query.onu_id || this.onu_list.data[0];
                        this.$http
                            .get("./simulation_data/onu_basic_info.json")
                            .then((res) => {
                                this.onu_basic_info = res.data;
                                this.$http
                                    .get("./simulation_data/onu_fec_mode.json")
                                    .then((res) => {
                                        this.onu_fec_mode = res.data;
                                    })
                                    .catch((err) => {});
                            })
                            .catch((err) => {});
                    } else {
                        this.addonu_list({});
                    }
                })
                .catch((err) => {});
        }
    },
    activated() {
        //  created 时不触发
        if (this.isCreated) {
            this.isCreated = false;
            return;
        }
        const { port_id, onu_id } = this.$route.query;
        var pid = Number(sessionStorage.getItem("pid"));
        this.portid = Number(this.$route.query.port_id) || pid || 1;
        if (pid === this.portid) {
            this.get_resource();
        }
    },
    methods: {
        ...mapMutations({
            addonu_list: "updateOnuList",
        }),
        getWanInfo(port_id) {
            this.wanList = [];
            this.$http
                .get("/onumgmt", { params: { form: "wantab", port_id } })
                .then((res) => {
                    if (res.data.code === 1) {
                        if (res.data.data && res.data.data.length) {
                            this.wanList = res.data.data;
                        }
                    }
                })
                .catch((err) => {});
        },
        //  打开onu描述信息模态框
        open_onu_desc() {
            this.onu_name =
                this.onu_basic_info.data.onu_name ||
                "ONU" + this.portid + "/" + this.onuid;
            this.onu_desc = this.onu_basic_info.data.onu_desc || "";
            this.onu_cfg_name = true;
        },
        select_page(page) {
            this.show_page = page;
            if (page === "onu_info") {
                this.getData();
                this.getOpticalData();
            }
        },
        //  onu描述信息模态框内按钮绑定的事件
        onu_cfg_info(bool) {
            if (bool) {
                if (!this.onu_name && !this.onu_desc) {
                    this.onu_name = "";
                    this.onu_desc = "";
                    this.onu_cfg_name = false;
                    return;
                }
                if (this.onu_name.length > 16) {
                    this.$message({
                        type: "error",
                        text:
                            this.lanMap["param_error"] +
                            ": " +
                            this.lanMap["onu_name"],
                    });
                    return;
                }
                if (this.onu_desc.length > 64) {
                    this.$message({
                        type: "error",
                        text:
                            this.lanMap["param_error"] +
                            ": " +
                            this.lanMap["onu_desc"],
                    });
                    return;
                }
                var post_param = {
                    method: "set",
                    param: {
                        port_id: this.portid,
                        onu_id: this.onuid,
                        flags: 8,
                        fec_mode: this.onu_fec_mode.data.fec_mode ? 0 : 1,
                        onu_name: this.onu_name.replace(/\s*/g, ""),
                        onu_desc: this.onu_desc,
                    },
                };
                this.post_data(post_param);
            }
            this.onu_name = "";
            this.onu_desc = "";
            this.onu_cfg_name = false;
        },
        //  解析后台返回的字符串
        analysis(str) {
            if (!str) return "";
            var result = [];
            var arr = str.split(",");
            for (var i = 0, len = arr.length; i < len; i++) {
                var substrs = arr[i];
                if (substrs.indexOf("-") !== -1) {
                    var subArr = substrs.split("-");
                    var min = Number(subArr[0]),
                        max = Number(subArr[subArr.length - 1]);
                    if (isNaN(min) || isNaN(max)) throw new TypeError();
                    result.push(min);
                    for (var j = 1; j < max - min; j++) {
                        result.push(min + j);
                    }
                    result.push(max);
                } else {
                    if (isNaN(Number(substrs))) throw new TypeError();
                    result.push(Number(substrs));
                }
            }
            return result.filter((item) => !!item);
        },
        open_reboot_onu() {
            this.$confirm(this.lanMap["confirm_reboot_onu"] + "?")
                .then((_) => {
                    this.reboot_onu();
                })
                .catch((_) => {});
        },
        //  重启ONU
        reboot_onu() {
            var post_param = {
                method: "set",
                param: {
                    port_id: this.portid,
                    onu_id: this.onuid,
                    flags: 1,
                    fec_mode: this.onu_fec_mode.data.fec_mode ? 0 : 1,
                    onu_name: "",
                    onu_desc: "",
                },
            };
            this.post_data(post_param);
        },
        open_un_auth_onu() {
            this.$confirm(this.lanMap["confirm_deresgester"] + "?")
                .then((_) => {
                    this.un_auth_onu();
                })
                .catch((_) => {});
        },
        //  解注册 ONU
        un_auth_onu() {
            var post_param = {
                method: "set",
                param: {
                    port_id: this.portid,
                    onu_id: this.onuid,
                    flags: 2,
                    fec_mode: this.onu_fec_mode.data.fec_mode ? 0 : 1,
                    onu_name: "",
                    onu_desc: "",
                },
            };
            this.post_data(post_param);
        },
        open_set_fec_mode() {
            this.$confirm(this.lanMap["confirm_change_fecmode"] + "?")
                .then((_) => {
                    this.set_fec_mode();
                })
                .catch((_) => {});
        },
        //  fec_mode
        set_fec_mode() {
            var post_param = {
                method: "set",
                param: {
                    port_id: this.portid,
                    onu_id: this.onuid,
                    flags: 4,
                    fec_mode: this.onu_fec_mode.data.fec_mode ? 0 : 1,
                    onu_name: "",
                    onu_desc: "",
                },
            };
            this.post_data(post_param);
        },
        post_data(data) {
            this.$http
                .post("/onumgmt?form=config", data)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"],
                        });
                        this.getData();
                        this.getOpticalData();
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
        getData() {
            this.$http
                .get(
                    "/onumgmt?form=base-info&port_id=" +
                        this.portid +
                        "&onu_id=" +
                        this.onuid
                )
                .then((res) => {
                    if (res.data.code === 1) {
                        this.onu_basic_info = res.data;
                    } else {
                        this.onu_basic_info = {};
                    }
                })
                .catch((err) => {});
            this.$http
                .get(
                    "/onumgmt?form=config&port_id=" +
                        this.portid +
                        "&onu_id=" +
                        this.onuid
                )
                .then((res) => {
                    if (res.data.code === 1) {
                        this.onu_fec_mode = res.data;
                    } else {
                        this.onu_fec_mode = {};
                    }
                })
                .catch((err) => {});
        },
        getOpticalData() {
            this.$http
                .get(
                    "/onumgmt?form=optical-diagnose&port_id=" +
                        this.portid +
                        "&onu_id=" +
                        this.onuid
                )
                .then((res) => {
                    if (res.data.code === 1) {
                        this.optical_diagnose = res.data;
                    } else {
                        this.optical_diagnose = {};
                    }
                })
                .catch((err) => {
                    // to do
                });
        },
        //  文件选择框
        changeFile(fileid, fnameid) {
            var file = document.getElementById(fileid);
            var fileName = document.getElementById(fnameid);
            var files = file.files[0];
            fileName.innerText = file.value.substring(
                file.value.lastIndexOf("\\") + 1
            );
            this.upgrade_file = fileName.innerText;
            if (!files) {
                fileName.innerText = this.lanMap["file_click"];
            }
        },
        //  升级按钮
        upload_file() {
            if (!this.upgrade_file) {
                this.$message({
                    type: "error",
                    text: this.lanMap["file_not_select"],
                });
                return;
            }
            // if(!this.onu_basic_info.data.upgrade_type){
            //     this.$message({
            //         type: 'error',
            //         text: this.lanMap['no_upgrade_type']
            //     })
            //     return
            // }
            this.$confirm(this.lanMap["if_sure"])
                .then((_) => {
                    this.upgrade_result();
                })
                .catch((_) => {});
        },
        upgrade_result() {
            var formData = new FormData();
            var file = document.getElementById("onu-upgrade-file1");
            var files = file.files[0];
            formData.append("file", files);
            this.$http
                .post("/onu_upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    timeout: 0,
                })
                .then((res) => {
                    if (res.data.code === 1) {
                        this.start_upgrade_onu();
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message,
                        });
                    }
                })
                .catch((error) => {
                    // to do
                });
        },
        //  文件上传成功，开始进行升级
        start_upgrade_onu() {
            var post_params = {
                method: "set",
                param: {
                    port_id: this.portid,
                    onu_id: this.onuid,
                    upgrade_type: this.onu_basic_info.data.upgrade_type || "",
                },
            };
            this.$http
                .post("/onu_upgrade?form=upgrade", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["onu_upgrade_start"],
                        });
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
        get_resource() {
            this.getWanInfo(this.portid);
            this.$http
                .get("/onu_allow_list?form=resource&port_id=" + this.portid)
                .then((res) => {
                    if (res.data.code === 1) {
                        var _onu_list = this.analysis(res.data.data.resource);
                        if (!_onu_list) {
                            this.addonu_list({});
                            this.onu_basic_info = {};
                            this.onuid = 0;
                            return;
                        }
                        var obj = {
                            port_id: res.data.data.port_id,
                            data: _onu_list,
                        };
                        this.addonu_list(obj);
                        var oid = Number(sessionStorage.getItem("oid"));
                        this.onuid = Number(this.$route.query.onu_id) || oid;
                        if (
                            !this.$route.query.onu_id &&
                            (!oid || _onu_list.indexOf(Number(oid)) === -1)
                        ) {
                            this.onuid = _onu_list[0];
                            return;
                        }
                        this.show_page = "onu_info";
                        this.getData();
                        if (this.show_page === "onu_info") {
                            this.getOpticalData();
                        } else if (this.show_page === "onu_alarm") {
                            this.$nextTick(() => {
                                this.$refs.onuAlarm.getData();
                            });
                        }
                    } else {
                        this.addonu_list({});
                        this.onu_basic_info = {};
                        this.onuid = 0;
                    }
                })
                .catch((err) => {});
        },
        clearFile() {
            if (document) {
                var file = document.getElementById("onu-upgrade-file1"),
                    filename = document.getElementById("onu-upgrade-filename1");
                if (file) {
                    file.value = "";
                }
                if (filename) {
                    filename.innerText = this.lanMap["file_click"];
                }
            }
        },
        closeOptTsm() {
            this.txsupply_time = "";
            this.dialogVisible = true;
        },
        submitOptTsm() {
            if (
                this.txsupply_time < 0 ||
                this.txsupply_time > 65535 ||
                isNaN(this.txsupply_time)
            ) {
                return this.$message.error(
                    this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["txsupply_time"]
                );
            }
            this.$http
                .post("/onumgmt?form=config", {
                    method: "set",
                    param: {
                        port_id: this.portid,
                        onu_id: this.onuid,
                        flags: 1 << 9,
                        fec_mode: 0,
                        txsupply_time: Number(this.txsupply_time),
                        onu_name: "",
                        onu_desc: "",
                    },
                })
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.getData();
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                })
                .catch((err) => {})
                .finally(() => {
                    this.dialogVisible = false;
                });
        },
    },
    watch: {
        portid() {
            if (!this.portid) return;
            sessionStorage.setItem("pid", Number(this.portid));
            this.get_resource();
            this.clearFile();
        },
        onuid() {
            if (this.onuid == 0) return;
            sessionStorage.setItem("oid", Number(this.onuid));
            this.show_page = "onu_info";
            this.getData();
            if (this.show_page === "onu_info") {
                this.getOpticalData();
            } else if (this.show_page === "onu_alarm") {
                this.$nextTick(() => {
                    this.$refs.onuAlarm.getData();
                });
            } else if (this.show_page === "wan_connect") {
                this.$nextTick((_) => {
                    this.$refs.onuWan.getData();
                });
            } else if (this.show_page === "onu_wlan") {
                this.$nextTick((_) => {
                    this.$refs.onuWlan.getData();
                });
            }
            this.clearFile();
        },
    },
};
</script>

<style scoped lang="less">
.onu-basic-info {
    padding: 20px 0 20px 0;
}
.onu-basic-info > h2 {
    float: left;
    width: 200px;
    font-size: 24px;
    font-weight: 600;
    color: #67aef7;
}
.onu-basic-info > div {
    float: left;
}
div.onu-basic-info > div > span {
    padding: 0 30px;
}
.onu-basic-info:after {
    display: table;
    content: "";
    clear: both;
}
select {
    width: 120px;
    height: 30px;
    text-indent: 5px;
    font-size: 16px;
    margin-left: 40px;
}
hr {
    margin-bottom: 30px;
}
div.onu-info {
    width: 60%;
}
div.onu-info-item {
    border: 1px solid #ccc;
    border-bottom: none;
    overflow: hidden;
}
div.onu-info-item > span {
    display: inline-block;
    vertical-align: middle;
    // height: 30px;
    // line-height: 30px;
    width: 30%;
    padding: 6px 0 6px 20px;
    &:last-child {
        width: 55%;
        // overflow: hidden;
        // text-overflow: ellipsis;
        word-break: break-all;
        white-space: normal;
    }
}
div.onu-optical-diagnose {
    overflow: hidden;
    width: 40%;
    > div {
        margin-left: 20px;
        border: 1px solid #ccc;
    }
}
div.onu-optical-title {
    height: 34px;
    line-height: 34px;
    padding: 20px 0;
    vertical-align: middle;
    border-bottom: 1px solid #ccc;
    > span:first-child {
        margin-left: 20px;
        font-weight: 600;
        color: #67aef7;
        border: none;
    }
    > a {
        margin-right: 20px;
    }
}
div.onu-optical {
    height: 30px;
    line-height: 30px;
    border-bottom: 1px solid #ccc;
    &:last-child {
        border: none;
    }
    > span {
        display: inline-block;
        width: 40%;
        &:first-child {
            margin: 0;
            border: none;
            border-right: 1px solid #ccc;
        }
        &:last-child {
            padding-left: 10px;
        }
    }
}
div.no-more-data {
    margin: 20px;
    color: red;
}
div > span:first-child {
    height: 100%;
    text-align: right;
    padding-right: 50px;
    padding-left: 0;
    border-right: 1px solid #ccc;
}
div.error-msg {
    margin-left: 30px;
    height: 30px;
    line-height: 30px;
    color: red;
}
div#detail div.onu-info-item:last-child {
    border: 1px solid #ccc;
}
hr + div {
    margin: 0 0 0 10px;
    & + div {
        margin: 0 0 0 10px;
    }
}
div.handle-btn {
    margin: 20px 0;
    &:after {
        content: "";
        display: table;
        clear: both;
    }
    & + div {
        overflow: hidden;
    }
    h3 {
        font-size: 18px;
        height: 30px;
        font-weight: 500;
        line-height: 30px;
        color: #67aef7;
    }
    > div {
        margin-left: 30px;
        a + a {
            margin-left: 30px;
        }
    }
}
div.onu-desc {
    width: 500px;
    height: 310px;
    > div {
        line-height: 30px;
        margin: 10px 0;
        > span {
            display: inline-block;
            width: 150px;
            height: 30px;
            padding-right: 20px;
            border-right: none;
            &:last-child {
                font-weight: bold;
                color: #67aef7;
            }
        }
        > textarea {
            vertical-align: top;
            font-size: 14px;
            line-height: 20px;
            border: 1px solid #aaa;
            resize: none;
            &:focus {
                border-color: #67aef7;
                outline: none;
            }
        }
        > input[type="text"] {
            width: 230px;
            border-color: #aaa;
            &:focus {
                border-color: #67aef7;
            }
        }
        > a {
            padding: 0;
            width: 120px;
            margin-left: 90px;
        }
        &:last-child {
            margin: 0;
        }
    }
}
form.upload-form {
    position: relative;
    width: 300px;
    height: 40px;
    display: inline-block;
    vertical-align: middle;
    input {
        width: 300px;
    }
    .updateFile {
        position: absolute;
        left: 0;
        top: 0;
        width: 300px;
        height: 38px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        border: 1px solid #ddd;
        text-align: center;
        line-height: 38px;
        z-index: 9;
        border-radius: 5px;
        background: #eee;
    }
    .hide {
        height: 40px;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 99;
        opacity: 0;
        cursor: pointer;
    }
}
div.onu-upgrade {
    margin-top: 30px;
    div.upgrade-item {
        margin: 20px 0;
        text-align: center;
    }
}
table {
    border: 1px solid #ccc;
    width: 100%;
    tr {
        td {
            height: 30px;
            padding: 3px 12px 3px 12px;
            word-break: break-all;
            white-space: normal;
            &:first-child {
                width: 140px;
                text-align: right;
                padding-right: 20px;
            }
        }
    }
}
.dialog-content-txsupply-time {
    > span {
        border-right: none !important;
    }
    > span.tips {
        margin-left: 12px;
        color: @tipsColor;
        font-size: @tipsFontSize;
    }
}
</style>