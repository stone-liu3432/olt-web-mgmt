<template>
    <div class="onu-port-vlan">
        <h4>{{ lanMap['op_multicast'] }}</h4>
        <div class="opv-item">
            <span>port id</span>
            <select v-model.number="opid">
                <option
                    :value="item.op_id"
                    v-for="(item,index) in mc_eth_config.data"
                >{{ item.op_id }}</option>
            </select>
        </div>
        <div class="opv-item">
            <span>{{ lanMap['group_num_max'] }}</span>
            <span>{{ mc_eth_cfg_port.group_num_max }}</span>
            <a href="javascript:void(0);" @click="open_modal(1)">{{ lanMap['config'] }}</a>
        </div>
        <div class="opv-item">
            <span>{{ lanMap['tag_mode'] }}</span>
            <span>{{ mc_eth_cfg_port.tag_mode ? mc_eth_cfg_port.tag_mode === 1 ? 'untag' : 'translate' : 'tag' }}</span>
            <a href="javascript:void(0);" @click="open_modal(2)">{{ lanMap['config'] }}</a>
        </div>
        <div class="opv-item">
            <span>{{ lanMap['mvlan'] }}</span>
            <span>{{ mv_list }}</span>
            <a href="javascript:void(0);" @click="open_modal(4)">{{ lanMap['add'] }}</a>
            <a
                href="javascript:void(0);"
                @click="open_modal(5)"
                v-if="mvlan_list.length"
            >{{ lanMap['delete'] }}</a>
            <a
                href="javascript:void(0);"
                @click="clearMvlan"
                v-if="mvlan_list.length"
            >{{ lanMap['clear'] }}</a>
        </div>
        <hr />
        <div class="opv-translate" v-if="mc_eth_cfg_port.tag_mode === 2">
            <h4>{{ lanMap['mv_conversion_table'] }}</h4>
            <div>
                <div>
                    <span>svlan</span>
                    <span>cvlan</span>
                    <span>{{ lanMap['config'] }}</span>
                </div>
                <div v-for="(item,index) in mv_translate.data" :key="index">
                    <span>{{ item.svlan }}</span>
                    <span>{{ item.cvlan }}</span>
                    <a
                        href="javascript:void(0);"
                        @click="open_cfm_del_vlan(item)"
                    >{{ lanMap['delete'] }}</a>
                </div>
            </div>
            <div>
                <a href="javascript:void(0);" @click="open_modal(3)">{{ lanMap['add'] }}</a>
            </div>
        </div>
        <div class="modal-dialog" v-if="flag">
            <div class="cover"></div>
            <div :class="{ 'simple-modal' : flag !== 2 && flag !== 3 }">
                <div class="opv-modal">
                    <h3
                        v-if="flag === 1"
                        class="modal-header"
                    >{{ lanMap['group_num_max'] + ' ' + lanMap['config'] }}</h3>
                    <h3
                        v-if="flag === 2"
                        class="modal-header"
                    >{{ lanMap['tag_mode'] + '' + lanMap['config'] }}</h3>
                    <h3 v-if="flag === 3" class="modal-header">{{ lanMap['add'] }}</h3>
                    <h3
                        v-if="flag === 4"
                        class="modal-header"
                    >{{ lanMap['add'] + ' ' + lanMap['mvlan'] }}</h3>
                    <h3
                        v-if="flag === 5"
                        class="modal-header"
                    >{{ lanMap['delete'] + ' ' + lanMap['mvlan'] }}</h3>
                    <div v-if="flag === 1">
                        <span>{{ lanMap['group_num_max'] }}</span>
                        <input
                            type="text"
                            v-model.number="group_num_max"
                            v-focus
                            :style="{ 'border-color': group_num_max < 0 || group_num_max > 255 || isNaN(group_num_max) ? 'red' : '' }"
                        />
                    </div>
                    <div v-if="flag === 2 || flag === 3">
                        <span>{{ lanMap['tag_mode'] }}</span>
                        <select v-model.number="tag_mode" :disabled="flag === 3">
                            <option value="0">tag</option>
                            <option value="1">untag</option>
                            <option value="2">translate</option>
                        </select>
                    </div>
                    <div v-if="(flag === 2 || flag === 3) && tag_mode === 2">
                        <span>svlan</span>
                        <input
                            type="text"
                            v-model.number="svlan"
                            v-focus
                            :style="{ 'border-color': svlan !== '' && (svlan < 1 || svlan > 4094 || isNaN(svlan)) ? 'red' : '' }"
                        />
                    </div>
                    <div v-if="flag === 2 && tag_mode !== 2"></div>
                    <div v-if="(flag === 2 || flag === 3) && tag_mode === 2">
                        <span>cvlan</span>
                        <input
                            type="text"
                            v-model.number="cvlan"
                            :style="{ 'border-color': cvlan !== '' && (cvlan < 1 || cvlan > 4094 || isNaN(cvlan)) ? 'red' : '' }"
                        />
                    </div>
                    <div v-if="flag === 2 && tag_mode !== 2"></div>
                    <div v-if="flag === 4 || flag === 5">
                        <span>{{ lanMap['mvlan'] }}</span>
                        <input
                            type="text"
                            v-model.number="mvlan"
                            v-focus
                            :style="{ 'border-color': mvlan !== '' && (mvlan < 1 || mvlan > 4094 || isNaN(mvlan)) ? 'red' : '' }"
                        />
                    </div>
                    <div>
                        <a
                            href="javascript:void(0);"
                            v-if="flag === 1"
                            @click="submit_set_group"
                        >{{ lanMap['apply'] }}</a>
                        <a
                            href="javascript:void(0);"
                            v-if="flag === 2 || flag === 3"
                            @click="submit_set_tagmode"
                        >{{ lanMap['apply'] }}</a>
                        <a
                            href="javascript:void(0);"
                            v-if="flag === 4"
                            @click="submit_add_mvlan"
                        >{{ lanMap['apply'] }}</a>
                        <a
                            href="javascript:void(0);"
                            v-if="flag === 5"
                            @click="submit_del_mvlan"
                        >{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="close_modal">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="close_modal"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "onuPortVlan",
    computed: {
        ...mapState(["lanMap", "port_name", "change_url"]),
        mv_list() {
            if (!this.mvlan_list.length) return "";
            return this.mvlan_list.toString();
        }
    },
    props: ["portid", "onuid"],
    data() {
        return {
            //  onu 端口组播配置
            mc_eth_config: {},
            //  onu 单个端口组播配置
            mc_eth_cfg_port: {},
            //  onu 端口组播vlan表
            mvlan_list: [],
            //  onu 端口组播vlan转换表
            mv_translate: {},
            opid: 0,
            //  1->set group_num_max  2->set tag mode 4->add mvlan 5->del mvlan
            flag: 0,
            group_num_max: "",
            mvlan: "",
            tag_mode: 0,
            svlan: "",
            cvlan: ""
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.$http
                .get(this.change_url.get_mc_eth_config, {
                    params: { port_id: this.portid, onu_id: this.onuid }
                })
                .then(res => {
                    if (res.data.code === 1) {
                        this.mc_eth_config = res.data;
                        if (res.data.data && res.data.data.length > 0) {
                            if (
                                !this.opid ||
                                this.opid > res.data.data.length
                            ) {
                                this.opid = res.data.data[0].op_id;
                            } else {
                                res.data.data.forEach(item => {
                                    if (item.op_id === this.opid) {
                                        this.mc_eth_cfg_port = item;
                                        this.getMvlan();
                                        if (
                                            this.mc_eth_cfg_port.tag_mode === 2
                                        ) {
                                            this.get_mv_translate();
                                        }
                                    }
                                });
                            }
                        }
                    } else {
                        this.mc_eth_config = {};
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        getMvlan() {
            this.$http
                .get("/onumgmt?form=mc_vlan", {
                    params: { port_id: this.portid, onu_id: this.onuid }
                })
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data && res.data.data.length > 0) {
                            var result = [];
                            res.data.data.forEach(item => {
                                if (item.op_id === this.opid) {
                                    result.push(item.mvlan);
                                }
                            });
                            this.mvlan_list = result;
                        } else {
                            this.mvlan_list = [];
                        }
                    } else {
                        this.mvlan_list = [];
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        get_mv_translate() {
            this.$http
                .get("/onumgmt?form=mc_translate", {
                    params: {
                        port_id: this.portid,
                        onu_id: this.onuid,
                        op_id: this.opid
                    }
                })
                .then(res => {
                    if (res.data.code === 1) {
                        this.mv_translate = res.data;
                    } else {
                        this.mv_translate = {};
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        open_cfm_del_vlan(node) {
            this.svlan = node.svlan;
            this.cvlan = node.cvlan;
            this.$confirm()
                .then(_ => {
                    this.submit_del_tagmode(svlan, cvlan);
                })
                .catch(_ => {})
                .finally(_ => {
                    this.flag = 0;
                });
        },
        open_modal(flag) {
            this.flag = flag;
            if (flag === 1 || flag === 2 || flag === 3) {
                this.mc_eth_config.data.forEach(item => {
                    if (item.op_id === this.opid) {
                        this.group_num_max = item.group_num_max;
                        this.tag_mode = item.tag_mode;
                    }
                });
            }
        },
        close_modal() {
            this.flag = 0;
            this.group_num_max = "";
            this.mvlan = "";
            this.tag_mode = 0;
            this.svlan = "";
            this.cvlan = "";
        },
        submit_set_group() {
            if (
                this.group_num_max === "" ||
                this.group_num_max < 0 ||
                this.group_num_max > 255 ||
                isNaN(this.group_num_max)
            ) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["group_num_max"]
                });
                return;
            }
            var post_param = {
                method: "set",
                param: {
                    port_id: Number(this.portid),
                    onu_id: Number(this.onuid),
                    op_id: Number(this.opid),
                    group_num_max: this.group_num_max
                }
            };
            this.$http
                .post("/onumgmt?form=mc_group_max", post_param)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["st_success"]
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
            this.close_modal();
        },
        submit_set_tagmode() {
            if (this.tag_mode === 2) {
                if (this.svlan < 1 || this.svlan > 4094 || isNaN(this.svlan)) {
                    this.$message({
                        type: "error",
                        text: this.lanMap["param_error"] + ": svlan"
                    });
                    return;
                }
                if (this.cvlan < 1 || this.cvlan > 4094 || isNaN(this.cvlan)) {
                    this.$message({
                        type: "error",
                        text: this.lanMap["param_error"] + ": cvlan"
                    });
                    return;
                }
            }
            var post_param = {
                method: "set",
                param: {
                    port_id: Number(this.portid),
                    onu_id: Number(this.onuid),
                    op_id: Number(this.opid),
                    tag_mode: this.tag_mode,
                    svlan: this.svlan,
                    cvlan: this.cvlan
                }
            };
            this.$http
                .post("/onumgmt?form=mc_tag_mode", post_param)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["st_success"]
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
            this.close_modal();
        },
        submit_del_tagmode(svlan, cvlan) {
            var post_param = {
                method: "delete",
                param: {
                    port_id: Number(this.portid),
                    onu_id: Number(this.onuid),
                    op_id: Number(this.opid),
                    tag_mode: 2,
                    svlan,
                    cvlan
                }
            };
            this.$http
                .post("/onumgmt?form=mc_tag_mode", post_param)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["st_success"]
                        });
                        this.getData();
                    } else if (res.data.code > 1) {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message
                        });
                    }
                })
                .catch(err => {});
        },
        submit_add_mvlan() {
            if (this.mvlan < 1 || this.mvlan > 4094 || isNaN(this.mvlan)) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] + ": " + this.lanMap["mvlan"]
                });
                return;
            }
            var post_param = {
                method: "add",
                param: {
                    port_id: Number(this.portid),
                    onu_id: Number(this.onuid),
                    op_id: Number(this.opid),
                    mvlan: this.mvlan //1-4094
                }
            };
            this.$http
                .post("/onumgmt?form=mc_vlan", post_param)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["st_success"]
                        });
                        this.getMvlan();
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
            this.close_modal();
        },
        submit_del_mvlan() {
            var post_param = {
                method: "delete",
                param: {
                    port_id: Number(this.portid),
                    onu_id: Number(this.onuid),
                    op_id: Number(this.opid),
                    mvlan: this.mvlan //  1-4094
                }
            };
            this.$http
                .post("/onumgmt?form=mc_vlan", post_param)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["st_success"]
                        });
                        this.getMvlan();
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
            this.close_modal();
        },
        clearMvlan() {
            this.$confirm(
                this.lanMap["if_sure"] +
                    this.lanMap["clear"] +
                    this.lanMap["mvlan"] +
                    " ?"
            )
                .then(_ => {
                    const url = "/onumgmt?form=mc_vlan",
                        post_param = {
                            method: "clear",
                            param: {
                                port_id: this.portid,
                                onu_id: this.onuid,
                                op_id: this.opid
                            }
                        };
                    this.$http
                        .post(url, post_param)
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["clear"] +
                                        this.lanMap["st_success"]
                                );
                                this.getMvlan();
                            } else {
                                this.$message.error(
                                    `(${res.data.code}) ${res.data.message}`
                                );
                            }
                        })
                        .catch(err => {});
                })
                .catch(_ => {});
        }
    },
    watch: {
        onuid() {
            if (!this.onuid) return;
            this.getData();
            this.getMvlan();
        },
        opid() {
            if (!this.opid) return;
            this.mc_eth_config.data.forEach(item => {
                if (item.op_id === this.opid) {
                    this.mc_eth_cfg_port = item;
                }
            });
            this.getMvlan();
            if (this.mc_eth_cfg_port.tag_mode === 2) {
                this.get_mv_translate();
            }
        }
    }
};
</script>

<style lang="less" scoped>
a {
    width: 100px;
    padding: 0;
}
div.onu-port-vlan {
    h4 {
        font-size: 18px;
        color: #67aef6;
        font-weight: 500;
    }
    > div.opv-item {
        height: 30px;
        line-height: 30px;
        select {
            width: 120px;
            height: 28px;
            line-height: 28px;
        }
        > span {
            display: inline-block;
            vertical-align: middle;
            width: 400px;
            &:first-child {
                width: 200px;
            }
        }
        a {
            height: 24px;
            line-height: 24px;
        }
    }
}
div.opv-translate {
    height: 30px;
    line-height: 30px;
    h4 {
        float: left;
        width: 300px;
    }
    > div {
        width: 300px;
        float: left;
        span {
            display: inline-block;
            width: 97px;
            & + a {
                width: 95px;
            }
        }
        &:last-child {
            margin-left: 9px;
        }
    }
    a {
        height: 26px;
        line-height: 26px;
    }
    &::after {
        display: table;
        content: "";
        clear: both;
    }
}
div.cover + div {
    height: 235px;
}
div.cover + div.simple-modal {
    height: 165px;
}
div.opv-modal {
    h3 + div {
        margin-top: 10px;
    }
    div {
        height: 30px;
        margin: 5px 0;
        span:first-child {
            display: inline-block;
            width: 200px;
            text-align: right;
            margin-right: 20px;
        }
        a {
            margin: 20px 0 0 100px;
        }
        select {
            width: 195px;
        }
    }
}
</style>