<template>
    <div>
        <div class="port-cfg-title">
            <h2 class="lf">{{ lanMap['port_cfg'] }}</h2>
            <a href="javascript:void(0);" @click="refresh_port">{{ lanMap['refresh'] }}</a>
        </div>
        <hr />
        <div class="vlan-config" v-if="port_name.pon && port_name.ge">
            <p class="item-align">
                <span>{{ lanMap['port_id'] + '：' }}</span>
                <select v-model.number="portid">
                    <option
                        v-for="(item,index) in port_name.pon"
                        :key="index"
                        :value="item.id"
                    >{{ item.name }}</option>
                    <option
                        v-for="(item,index) in port_name.ge"
                        :key="index"
                        :value="item.id"
                    >{{ item.name }}</option>
                    <option
                        v-if="port_name.xge"
                        v-for="(item,index) in port_name.xge"
                        :key="index"
                        :value="item.id"
                    >{{ item.name }}</option>
                </select>
            </p>
            <p>
                <span>{{ lanMap['link_status'] + '：' }}</span>
                <span>{{ link_status === 1 ? lanMap['link_up'] : lanMap['link_down'] }}</span>
            </p>
            <p>
                <span>{{ lanMap['admin_status'] + '：' }}</span>
                <span>{{ admin_status === 1 ? lanMap['enable'] : lanMap['disable'] }}</span>
            </p>
        </div>
        <div class="contianer">
            <div class="config" v-if="swich_port_info.data">
                <h3>
                    {{ lanMap['sw_port_cfg'] }}
                    <div class="tips rt">
                        <i></i>
                        <div>
                            <p>{{ lanMap['mtu'] }}</p>
                            <p>{{ lanMap['range'] }} 128-2000</p>
                            <hr />
                            <p>{{ lanMap['erate'] }}</p>
                            <p>{{ lanMap['range'] }} 64-1024000</p>
                            <hr />
                            <p>{{ lanMap['irate'] }}</p>
                            <p>{{ lanMap['range'] }} 64-1024000</p>
                            <hr />
                            <p>{{ lanMap['pvid'] }}</p>
                            <p>{{ lanMap['range'] }} 1-4094</p>
                        </div>
                    </div>
                </h3>
                <div class="swich-basic-config">
                    <ul>
                        <li v-for="key in PORT_INFO_MAP" :key="key" class="swich-item">
                            <span>{{ lanMap[key] }}</span>
                            <select
                                v-if="key === 'admin_status' || key === 'auto_neg' || key === 'flow_ctrl'"
                                v-model.number="port_data[key]"
                                :disabled="((key === 'admin_status' || key === 'auto_neg') && swich_port_info.data.port_id <= system.data.ponports)"
                            >
                                <option value="0">{{ lanMap['disable'] }}</option>
                                <option value="1">{{ lanMap['enable'] }}</option>
                            </select>
                            <select
                                v-if="key === 'link_status'"
                                v-model.number="port_data.link_status"
                                disabled
                            >
                                <option value="0">{{ lanMap['link_down'] }}</option>
                                <option value="1">{{ lanMap['link_up'] }}</option>
                            </select>
                            <select
                                v-if="key === 'duplex'"
                                v-model.number="port_data.duplex"
                                :disabled="swich_port_info.data.port_id <= system.data.ponports"
                            >
                                <option value="0">{{ lanMap['half'] }}</option>
                                <option value="1">{{ lanMap['full'] }}</option>
                            </select>
                            <select
                                v-if="key === 'speed'"
                                v-model="port_data.speed"
                                :disabled="swich_port_info.data.port_id <= system.data.ponports"
                            >
                                <option value="0M" disabled>Auto</option>
                                <option
                                    v-if="swich_port_info.data.port_id <= (system.data.ponports + system.data.geports)"
                                    value="10M"
                                >10M</option>
                                <option
                                    v-if="swich_port_info.data.port_id <= (system.data.ponports + system.data.geports)"
                                    value="100M"
                                >100M</option>
                                <option value="1000M">1000M</option>
                                <option
                                    v-if="swich_port_info.data.port_id > (system.data.ponports + system.data.geports)"
                                    value="10000M"
                                >10000M</option>
                                <option value="auto">Auto</option>
                            </select>
                            <input
                                type="text"
                                v-if="key === 'mtu'"
                                placeholder="128-2000"
                                v-model.number="port_data.mtu"
                                :style="{ 'border-color' : port_data.mtu && (port_data.mtu < 128 || port_data.mtu > 2000 || isNaN(port_data.mtu)) ? 'red' : '' }"
                            />
                            <span v-if="key === 'media'">{{ lanMap[swich_port_info.data[key]] }}</span>
                            <input
                                type="text"
                                v-if="key === 'erate'"
                                v-model.number="port_data.erate"
                                :style="{ 'border-color' : port_data.erate && (port_data.erate < 64 || port_data.erate > 1024000 || isNaN(port_data.erate)) ? 'red' : '' }"
                            />
                            <span v-if="key === 'erate'" class="units">Kbps</span>
                            <input
                                type="text"
                                v-if="key === 'irate'"
                                v-model.number="port_data.irate"
                                :style="{ 'border-color' : port_data.irate && (port_data.irate < 64 || port_data.irate > 1024000 || isNaN(port_data.irate)) ? 'red' : '' }"
                            />
                            <span v-if="key === 'irate'" class="units">Kbps</span>
                            <input
                                type="text"
                                v-if="key === 'pvid'"
                                v-model.number="port_data.pvid"
                                :style="{ 'border-color' : port_data.pvid && (port_data.pvid < 1 || port_data.pvid > 4094 || isNaN(port_data.pvid)) ? 'red' : '' }"
                            />
                            <textarea
                                v-if="key === 'port_desc'"
                                rows="5"
                                spellcheck="false"
                                v-model="port_data.port_desc"
                                :style="{ 'border-color': port_data.port_desc && port_data.port_desc.length > 64 ? 'red' : '' }"
                            ></textarea>
                        </li>
                    </ul>
                    <div class="btn-submit">
                        <a
                            href="javascript:;"
                            class="rt"
                            @click="swich_port_cfg"
                        >{{ lanMap['apply'] }}</a>
                    </div>
                </div>
            </div>
            <div v-else class="warning">{{ lanMap['flush_page_retry'] }}</div>
            <div class="config" v-if="stormctrl_data.data">
                <h3>
                    {{ lanMap['stormctrl'] }}
                    <div class="tips rt">
                        <i></i>
                        <div>
                            <p>{{ lanMap['broadcast'] }}</p>
                            <p>{{ lanMap['range'] }} 1-1488100</p>
                            <hr />
                            <p>{{ lanMap['multicast'] }}</p>
                            <p>{{ lanMap['range'] }} 1-1488100</p>
                            <hr />
                            <p>{{ lanMap['unicast'] }}</p>
                            <p>{{ lanMap['range'] }} 1-1488100</p>
                            <hr />
                            <p>{{ lanMap['stormctrl_tips'] }}</p>
                        </div>
                    </div>
                </h3>
                <div class="storm-config">
                    <ul>
                        <li
                            v-for="(item,key) in stormctrl_data.data"
                            :key="key"
                            v-if="key !== 'port_id' && key !== 'link_aggregation'"
                            class="swich-item"
                        >
                            <span>{{ lanMap[key] }}</span>
                            <input
                                type="text"
                                v-model.number="storm_data[key]"
                                :style="{ 'border-color': storm_data[key] && (storm_data[key] < 1 || storm_data[key] > 1488100 || isNaN(storm_data[key])) ? 'red' : '' }"
                            />
                            pps
                        </li>
                    </ul>
                    <div class="btn-submit">
                        <a
                            href="javascript:void(0);"
                            class="rt"
                            @click="storm_cfg"
                        >{{ lanMap['apply']}}</a>
                    </div>
                </div>
            </div>
            <div v-else class="warning">{{ lanMap['flush_page_retry'] }}</div>
            <div class="config" v-if="mirror_data.data">
                <h3>
                    {{ lanMap['mirror'] }}
                    <!-- <a href="javascript:;" class="delete-mirror rt">{{ lanMap['flush'] }}</a> -->
                </h3>
                <div class="port-mirror">
                    <ul>
                        <li class="swich-item">
                            <span>{{ lanMap['dst_port'] }}</span>
                            <select v-model.number="mirror.dst_port">
                                <option value="0">{{ lanMap['choose'] }}</option>
                                <option
                                    v-for="(item,key) in port_name.ge"
                                    :key="key"
                                    :value="item.id"
                                >{{ item.name }}</option>
                                <option
                                    v-for="(item,key) in port_name.xge"
                                    v-if="port_name.xge"
                                    :key="key"
                                    :value="item.id"
                                >{{ item.name }}</option>
                            </select>
                        </li>
                        <li class="swich-item">
                            <span>{{ lanMap['type'] }}</span>
                            <select v-model.number="mirror.type">
                                <option value="0">{{ lanMap['choose'] }}</option>
                                <option value="1">ingress</option>
                                <option value="2">egress</option>
                                <option value="3">all</option>
                            </select>
                        </li>
                    </ul>
                </div>
                <div class="btn-submit">
                    <a
                        href="javascript:void(0);"
                        class="rt"
                        @click="mirror_cfg"
                    >{{ lanMap['apply'] }}</a>
                    <a
                        href="javascript:;"
                        class="delete-mirror rt"
                        @click="flush_mirror_cfg"
                    >{{ lanMap['flush'] }}</a>
                </div>
            </div>
            <div v-else class="warning">{{ lanMap['flush_page_retry'] }}</div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "vlanCfg",
    computed: {
        ...mapState([
            "lanMap",
            "port_info",
            "port_name",
            "change_url",
            "system",
        ]),
        PORT_INFO_MAP() {
            return [
                "admin_status",
                "link_status",
                "auto_neg",
                "speed",
                "duplex",
                "flow_ctrl",
                "mtu",
                "media",
                "erate",
                "irate",
                "pvid",
                "port_desc",
            ].filter((item) =>
                this.swich_port_info.data.port_id <= this.system.data.ponports
                    ? item !== "irate" &&
                      item !== "erate" &&
                      item !== "flow_ctrl"
                    : true
            );
        },
    },
    data() {
        return {
            vlan_data: {},
            swich_port_info: {},
            stormctrl_data: {},
            mirror_data: {},
            portid: 0,
            link_status: 0,
            admin_status: 0,
            //  交换配置更改项统计
            flags: 0,
            //  交换配置数据
            port_data: {
                auto_neg: 0,
                admin_status: 0,
                flow_ctrl: 0,
                link_status: 0,
                speed: "",
                duplex: 0,
                mtu: 0,
                erate: 0,
                irate: 0,
                pvid: 0,
                port_desc: "",
            },
            //  风暴控制更改统计项
            storm_flags: 0,
            //  风暴控制数据
            storm_data: {
                broadcast: 0,
                multicast: 0,
                unicast: 0,
            },
            //  端口镜像数据
            mirror: {
                src_port: 0,
                dst_port: 0,
                type: 1,
            },
            modal_tips: "",
        };
    },
    created() {
        var pid = sessionStorage.getItem("portid");
        this.portid = Number(this.$route.query.port_id) || pid || 1;
        if (this.$route.query.port_id) {
            this.$router.push("/port_cfg");
        }
        if (this.change_url.beta == "test") {
            this.$http
                .get("./simulation_data/swich_port_info.json")
                .then((res) => {
                    if (res.data.code === 1) {
                        this.swich_port_info = res.data;
                        for (var key in res.data.data) {
                            this.port_data[key] = res.data.data[key];
                        }
                    } else {
                        this.swich_port_info = {};
                    }
                })
                .catch((err) => {
                    // to do
                });
            this.$http
                .get("./simulation_data/storm.json")
                .then((res) => {
                    if (res.data.code === 1) {
                        this.stormctrl_data = res.data;
                        for (var key in res.data.data) {
                            this.storm_data[key] = res.data.data[key];
                        }
                    } else {
                        this.stormctrl_data = {};
                    }
                })
                .catch((err) => {
                    // to do
                });
            this.$http
                .get("./simulation_data/mirror.json")
                .then((res) => {
                    if (res.data.code === 1) {
                        this.mirror_data = res.data;
                        for (var key in res.data.data) {
                            this.mirror[key] = res.data.data[key];
                        }
                    } else {
                        this.mirror_data = {};
                    }
                })
                .catch((err) => {
                    // to do
                });
        }
    },
    activated() {
        this.refresh_port();
    },
    methods: {
        //  点击交换基本配置时弹出确认层，并收集数据
        swich_port_cfg() {
            this.flags = 0;
            var original = this.swich_port_info.data;
            if (
                original.auto_neg === this.port_data.auto_neg &&
                original.auto_neg === 1 &&
                original.speed != this.port_data.speed
            ) {
                this.$message({
                    type: "error",
                    text: this.lanMap["auto_neg_tips"],
                });
                return;
            }
            if (original.admin_status != this.port_data.admin_status) {
                this.flags += 1;
            }
            if (original.auto_neg != this.port_data.auto_neg) {
                this.flags += 64;
                if (this.port_data.auto_neg === 1) {
                    this.port_data.speed = "auto";
                }
            } else {
                if (original.speed != this.port_data.speed) {
                    this.flags += 64;
                }
            }
            if (original.duplex != this.port_data.duplex) {
                this.flags += 4;
            }
            if (original.flow_ctrl != this.port_data.flow_ctrl) {
                this.flags += 24;
            }
            if (original.mtu != this.port_data.mtu) {
                this.flags += 128;
            }
            if (
                original.erate != this.port_data.erate &&
                this.portid > this.system.data.ponports
            ) {
                this.flags += 256;
            }
            if (
                original.irate != this.port_data.irate &&
                this.portid > this.system.data.ponports
            ) {
                this.flags += 512;
            }
            if (original.pvid != this.port_data.pvid) {
                this.flags += 1024;
            }
            if (original.port_desc !== this.port_data.port_desc) {
                this.flags += 2048;
            }
            const modal_tips = original.link_aggregation
                ? this.lanMap["link_aggregation_tips"]
                : this.lanMap["if_sure"];
            this.$confirm(modal_tips)
                .then((_) => {
                    this.result();
                })
                .catch((_) => {});
        },
        //  根据用户点击按钮，执行不同动作  -->  风暴控制
        storm_result() {
            var storm_cfg_data = this.stormctrl_data.data;
            if (this.storm_flags === 0) {
                this.$message({
                    type: "info",
                    text: this.lanMap["modify_tips"],
                });
                return;
            }
            if (
                storm_cfg_data.broadcast != this.storm_data.broadcast &&
                (this.storm_data.broadcast === "" ||
                    this.storm_data.broadcast < 0 ||
                    this.storm_data.broadcast > 1488100 ||
                    isNaN(this.storm_data.broadcast))
            ) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ":" +
                        this.lanMap["broadcast"],
                });
                return;
            }
            if (
                storm_cfg_data.multicast != this.storm_data.multicast &&
                (this.storm_data.multicast === "" ||
                    this.storm_data.multicast < 0 ||
                    this.storm_data.multicast > 1488100 ||
                    isNaN(this.storm_data.multicast))
            ) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ":" +
                        this.lanMap["multicast"],
                });
                return;
            }
            if (
                storm_cfg_data.unicast != this.storm_data.unicast &&
                (this.storm_data.unicast === "" ||
                    this.storm_data.unicast < 0 ||
                    this.storm_data.unicast > 1488100 ||
                    isNaN(this.storm_data.unicast))
            ) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ":" +
                        this.lanMap["unicast"],
                });
                return;
            }
            var post_params = {
                method: "set",
                param: {
                    port_id: Number(this.portid),
                    flags: this.storm_flags,
                    broadcast: Number(this.storm_data.broadcast),
                    multicast: Number(this.storm_data.multicast),
                    unicast: Number(this.storm_data.unicast),
                },
            };
            this.$http
                .post("/switch_port?form=stormctrl", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"],
                        });
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message,
                        });
                    }
                    this.getStormData();
                })
                .catch((err) => {});
        },
        //  点击风暴控制栏的确认按钮时弹出确认层，并收集数据
        storm_cfg() {
            this.storm_flags = 0;
            var storm_cfg_data = this.stormctrl_data.data;
            if (storm_cfg_data.broadcast != this.storm_data.broadcast) {
                this.storm_flags += 4;
            }
            if (storm_cfg_data.multicast != this.storm_data.multicast) {
                this.storm_flags += 2;
            }
            if (storm_cfg_data.unicast != this.storm_data.unicast) {
                this.storm_flags += 1;
            }
            const modal_tips = storm_cfg_data.link_aggregation
                ? this.lanMap["link_aggregation_tips"]
                : this.lanMap["if_sure"];
            this.$confirm(modal_tips)
                .then((_) => {
                    this.storm_result();
                })
                .catch((_) => {});
        },
        //  根据用户点击按钮，执行不同动作  -->  交换基本配置
        result() {
            var original = this.swich_port_info.data;
            if (this.flags === 0) {
                this.$message({
                    type: "info",
                    text: this.lanMap["modify_tips"],
                });
                return;
            }
            if (
                original.mtu !== this.port_data.mtu &&
                (!this.port_data.mtu ||
                    this.port_data.mtu < 128 ||
                    this.port_data.mtu > 2000 ||
                    isNaN(this.port_data.mtu))
            ) {
                this.$message({
                    type: "error",
                    text: this.lanMap["param_error"] + ":" + this.lanMap["mtu"],
                });
                return;
            }
            if (
                original.erate !== this.port_data.erate &&
                this.portid > this.system.data.ponports &&
                (this.port_data.erate === "" ||
                    (this.port_data.erate !== 0 &&
                        (this.port_data.erate < 64 ||
                            this.port_data.erate > 1024000)) ||
                    isNaN(this.port_data.erate))
            ) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] + ":" + this.lanMap["erate"],
                });
                return;
            }
            if (
                original.irate !== this.port_data.irate &&
                this.portid > this.system.data.ponports &&
                (this.port_data.irate === "" ||
                    (this.port_data.irate !== 0 &&
                        (this.port_data.irate < 64 ||
                            this.port_data.irate > 1024000)) ||
                    isNaN(this.port_data.irate))
            ) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] + ":" + this.lanMap["irate"],
                });
                return;
            }
            if (
                original.pvid !== this.port_data.pvid &&
                (!this.port_data.pvid ||
                    this.port_data.pvid < 1 ||
                    this.port_data.pvid > 4094 ||
                    isNaN(this.port_data.pvid))
            ) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] + ":" + this.lanMap["pvid"],
                });
                return;
            }
            if (this.port_data.port_desc.length > 64) {
                this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["port_desc"]}`
                );
                return;
            }
            var post_params = {
                method: "set",
                param: {
                    port_id: Number(this.portid),
                    flags: this.flags,
                    admin_status: this.port_data.admin_status,
                    auto_neg: this.port_data.auto_neg,
                    speed: this.port_data.speed,
                    duplex: this.port_data.duplex,
                    flow_ctrl: this.port_data.flow_ctrl,
                    mtu: Number(this.port_data.mtu),
                    erate: Number(this.port_data.erate),
                    irate: Number(this.port_data.irate),
                    pvid: Number(this.port_data.pvid),
                    port_desc: this.port_data.port_desc,
                },
            };
            this.$http
                .post("/switch_port?form=port_info", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"],
                        });
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message,
                        });
                    }
                    this.getPortData();
                })
                .catch((err) => {});
        },
        //  端口镜像  确认框
        mirror_cfg() {
            this.$confirm()
                .then((_) => {
                    this.mirror_result();
                })
                .catch((_) => {});
        },
        //  端口镜像  清除按钮
        flush_mirror_cfg() {
            this.$confirm()
                .then((_) => {
                    this.flush_mirror_result();
                })
                .catch((_) => {});
        },
        flush_mirror_result() {
            var post_param = {
                method: "clear",
                param: {
                    src_port: Number(this.portid),
                },
            };
            this.$http
                .post("/switch_port?form=mirror", post_param)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"],
                        });
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message,
                        });
                    }
                    this.getMirrorData();
                })
                .catch((err) => {});
        },
        //  端口镜像框内确认/取消按钮
        mirror_result() {
            var data = this.mirror_data.data;
            if (
                data.dst_port === this.mirror.dst_port &&
                data.type === this.mirror.type
            ) {
                this.$message({
                    type: "info",
                    text: this.lanMap["modify_tips"],
                });
                return;
            }
            if (this.mirror.dst_port === 0 && this.mirror.type !== 0) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ":" +
                        this.lanMap["dst_port"],
                });
                return;
            }
            if (this.mirror.dst_port !== 0 && this.mirror.type === 0) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] + ":" + this.lanMap["type"],
                });
                return;
            }
            var post_params = {
                method: "set",
                param: {
                    src_port: Number(this.portid),
                    dst_port: this.mirror.dst_port,
                    type: this.mirror.type,
                },
            };
            this.$http
                .post("/switch_port?form=mirror", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"],
                        });
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message,
                        });
                    }
                    this.getMirrorData();
                })
                .catch((err) => {});
        },
        getPortData() {
            this.$http
                .get("/switch_port?form=port_info&port_id=" + this.portid)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.swich_port_info = res.data;
                        this.port_data = Object.assign({}, res.data.data);
                        this.link_status = this.port_data.link_status;
                        this.admin_status = this.port_data.admin_status;
                    } else if (res.data.code > 1) {
                        this.swich_port_info = {};
                    }
                    this.flags = 0;
                })
                .catch((err) => {
                    // to do
                });
        },
        getStormData() {
            this.$http
                .get("/switch_port?form=stormctrl&port_id=" + this.portid)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.stormctrl_data = res.data;
                        this.storm_data = Object.assign({}, res.data.data);
                    } else if (res.data.code > 1) {
                        this.stormctrl_data = {};
                    }
                    this.storm_flags = 0;
                })
                .catch((err) => {
                    // to do
                });
        },
        getMirrorData() {
            this.$http
                .get("/switch_port?form=mirror&port_id=" + this.portid)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.mirror_data = res.data;
                        this.mirror = Object.assign({}, res.data.data);
                    } else if (res.data.code > 1) {
                        this.mirror_data = {};
                    }
                })
                .catch((err) => {
                    // to do
                });
        },
        refresh_port() {
            this.getPortData();
            this.getStormData();
            this.getMirrorData();
        },
    },
    watch: {
        portid() {
            sessionStorage.setItem("portid", Number(this.portid));
            this.getPortData();
            this.getStormData();
            this.getMirrorData();
        },
    },
};
</script>

<style scoped lang="less">
div.contianer {
    width: 100%;
    /* border: 1px solid #ddd; */
}
div.contianer:after {
    content: "";
    display: table;
    clear: both;
}
div.config {
    margin: 10px;
    width: 31%;
    float: left;
    border: 1px solid #ddd;
    box-shadow: 3px 3px 3px #ddd;
}
div.config > h3 {
    height: 40px;
    line-height: 40px;
    padding: 0 15px;
}
div.config > div {
    border-top: 1px solid #ddd;
    padding: 10px 0;
}
.vlan-config {
    width: 800px;
    margin: 20px 0 20px 20px;
}
input {
    width: 120px;
    border-radius: 3px;
}
h2 {
    width: 300px;
    font-size: 24px;
    font-weight: 600;
    color: #67aef7;
    margin: 10px 0;
}
h3 {
    color: #67aef7;
    font-size: 18px;
    font-weight: 500;
}
a.delete-mirror {
    width: 100px;
    margin: 4px 15px 0 0;
}
.item-align > select {
    width: 150px;
    height: 30px;
    font-size: 16px;
    text-indent: 10px;
}
.item-align > span {
    margin-left: 10px;
}
.vlan-config > p {
    float: left;
    width: 30%;
    height: 30px;
    line-height: 30px;
    padding-right: 20px;
}
.vlan-config > input {
    height: 30px;
    line-height: 30px;
    outline: none;
    box-sizing: border-box;
}
.vlan-config > select {
    height: 30px;
    font-size: 16px;
}
.vlan-config > p:first-child {
    text-align: right;
}
.vlan-config:after {
    content: "";
    display: table;
    clear: both;
}
.vlan-config > p.item-align {
    text-align: left;
}
.btn-submit > a {
    width: 100px;
    padding: 0;
    margin-top: 10px;
    margin-right: 30px;
}
.btn-submit:after {
    content: "";
    display: table;
    clear: both;
}
.vlan-config > div.storm-config {
    width: 600px;
    border: 1px solid #ddd;
}
.port-mirror > span {
    width: 30%;
    display: inline-block;
    height: 30px;
    line-height: 30px;
    margin-left: 20px;
}
.port-mirror > select {
    width: 72px;
}
li.swich-item {
    // height: 32px;
    line-height: 32px;
    vertical-align: middle;
    textarea {
        width: 160px;
        border-radius: 3px;
        resize: none;
        padding: 3px 6px;
        box-sizing: border-box;
        height: 100px;
        margin-top: 3px;
        border-color: @borderColor;
        outline: none;
        &:focus {
            border-color: @activedFormBorderColor;
        }
    }
}
li.swich-item select {
    width: 140px;
    height: 26px;
    font-size: 16px;
}
li.swich-item input {
    height: 26px;
    width: 100px;
}
li.swich-item > span:first-child {
    display: inline-block;
    vertical-align: top;
    width: 120px;
    height: 30px;
    line-height: 30px;
    padding-left: 20px;
}
.warning {
    color: red;
    margin-left: 20px;
}
span.units {
    display: inline-block;
    vertical-align: top;
    font-size: 14px;
    color: #333;
}
div.tips {
    height: 40px;
    line-height: 40px;
    vertical-align: middle;
    position: relative;
    &:hover {
        div {
            display: block;
        }
    }
    i {
        display: inline-block;
        vertical-align: middle;
        cursor: pointer;
        width: 32px;
        height: 32px;
        background: url("../../../assets/tips.png") no-repeat;
    }
    > div {
        display: none;
        position: absolute;
        top: 32px;
        left: 32px;
        width: 200px;
        background: #67aef7;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 10px;
        > p {
            font-size: 16px;
            color: #333;
            line-height: 20px;
        }
        > hr {
            border: none;
            border-top: 1px solid #333;
        }
    }
}
div.port-cfg-title {
    overflow: hidden;
    > a {
        width: 120px;
        margin: 10px 0 10px 10px;
        padding: 0;
    }
}
</style>