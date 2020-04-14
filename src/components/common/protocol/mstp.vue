<template>
    <div>
        <page-header type="none">
            <div slot="title">{{ lanMap['mstp'] }}</div>
        </page-header>
        <div class="mst-regional">
            <span>{{ lanMap['mstp_status'] }}:</span>
            <span>{{ mstpStatus ? lanMap['enable'] : lanMap['disable'] }}</span>
            <nms-button
                style="margin-left: 30px;"
                size="mini"
                @click="openDialog('status')"
            >{{ lanMap['config'] }}</nms-button>
        </div>
        <template v-if="!!mstpStatus">
            <tab-bar :tab="tabs" v-model="tab"></tab-bar>
            <template v-if="tab === 'mstp_region'">
                <div class="mst-regional">
                    <span>{{ lanMap['format_selector'] }}:</span>
                    <span>{{ mstRegional.format_selector }}</span>
                </div>
                <div class="mst-regional">
                    <span>{{ lanMap['regional_name'] }}:</span>
                    <span>{{ mstRegional.regional_name }}</span>
                    <nms-button
                        style="margin-left: 30px;"
                        size="mini"
                        @click="openDialog('regional_name')"
                    >{{ lanMap['config'] }}</nms-button>
                    <nms-button
                        style="margin-left: 30px;"
                        size="mini"
                        @click="resetRegionName"
                    >{{ lanMap['reset'] }}</nms-button>
                </div>
                <div class="mst-regional">
                    <span>{{ lanMap['revision_level'] }}:</span>
                    <span>{{ mstRegional.revision_level }}</span>
                    <nms-button
                        style="margin-left: 30px;"
                        size="mini"
                        @click="openDialog('revision_level')"
                    >{{ lanMap['config'] }}</nms-button>
                </div>
                <div class="mst-regional">
                    <span>{{ lanMap['conf_digest'] }}:</span>
                    <span>0x{{ mstRegional.conf_digest }}</span>
                </div>
            </template>
            <cist-info v-if="tab === 'cist'"></cist-info>
            <msti-info v-if="tab === 'msti'"></msti-info>
            <mst-port v-if="tab === 'port_cfg'"></mst-port>
        </template>
        <nms-dialog :visible.sync="dialogVisible" width="500px">
            <template slot="title">{{ lanMap['config'] }}</template>
            <mstp-form ref="mstp-form"></mstp-form>
            <div slot="footer">
                <nms-button @click="submitForm('mstp-form')">{{ lanMap['apply'] }}</nms-button>
                <nms-button @click="dialogVisible = false;">{{ lanMap['cancel'] }}</nms-button>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import cistInfo from "./mstp/cist";
import mstiInfo from "./mstp/msti";
import mstPort from "./mstp/mstPort";
import mstpForm from "./mstp/mstpForm";
export default {
    name: "mstp",
    components: { cistInfo, mstiInfo, mstPort, mstpForm },
    computed: {
        ...mapState(["lanMap"]),
        tabs() {
            return ["mstp_region", "cist", "msti", "port_cfg"];
        }
    },
    data() {
        return {
            tab: "mstp_region",
            cistInfo: [
                "bridge_max_age",
                "bridge_hello_time",
                "max_hops",
                "bridge_forward_delay"
            ],
            mstpStatus: 0,
            mstRegional: {
                // format_selector: 0,
                // regional_name: "38:3a:21:f0:01:b0",
                // revision_level: 223,
                // conf_digest: "49ba59abbe56e057"
            },
            dialogVisible: false
        };
    },
    created() {
        this.getStatus();
    },
    methods: {
        getStatus() {
            this.$http
                .get("/switch_mstp?form=mstp_status")
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.mstpStatus = res.data.data.mstp_status >>> 0;
                            if (this.mstpStatus) {
                                this.getRegional();
                            }
                        }
                    }
                })
                .catch(err => {});
        },
        getRegional() {
            this.mstRegional = {};
            this.$http
                .get("/switch_mstp?form=mst_regional_get")
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.mstRegional = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        openDialog(type) {
            this.dialogVisible = true;
            this.$nextTick(_ => {
                const ref = this.$refs["mstp-form"];
                if (type === "status") {
                    ref.init(type, this.mstpStatus);
                } else {
                    ref.init(type, this.mstRegional);
                }
            });
        },
        submitForm(formName) {
            this.$refs[formName].validate((type, val) => {
                const ACTIONS = {
                    status(val) {
                        if (val === this.mstpStatus) {
                            this.$message.info(this.lanMap["modify_tips"]);
                            return;
                        }
                        return {
                            url: "/switch_mstp?form=mstp_status",
                            data: {
                                method: "set",
                                param: {
                                    mstp_status: val
                                }
                            }
                        };
                    },
                    regional_name(val) {
                        if (val === this.mstRegional.regional_name) {
                            this.$message.info(this.lanMap["modify_tips"]);
                            return;
                        }
                        return {
                            url: "/switch_mstp?form=regional_name_set",
                            data: {
                                method: "set",
                                param: {
                                    regional_name: val
                                }
                            }
                        };
                    },
                    revision_level(val) {
                        if (val === this.mstRegional.revision_level) {
                            this.$message.info(this.lanMap["modify_tips"]);
                            return;
                        }
                        return {
                            url: "/switch_mstp?form=revision_level_set",
                            data: {
                                method: "set",
                                param: {
                                    revision_level: val >>> 0
                                }
                            }
                        };
                    }
                };
                if (typeof ACTIONS[type] === "function") {
                    const res = ACTIONS[type].call(this, val);
                    if (res) {
                        const { url, data } = res;
                        url &&
                            data &&
                            this.$http
                                .post(url, data)
                                .then(res => {
                                    if (res.data.code === 1) {
                                        this.$message.success(
                                            this.lanMap["setting_ok"]
                                        );
                                        type === "status" && this.getStatus();
                                        (type === "regional_name" ||
                                            type === "revision_level") &&
                                            this.getRegional();
                                    } else {
                                        this.$message.error(
                                            `(${res.data.code}) ${res.data.message}`
                                        );
                                    }
                                    this.dialogVisible = false;
                                })
                                .catch(err => {});
                    }
                }
            });
        },
        resetRegionName() {
            this.$confirm()
                .then(_ => {
                    this.$http
                        .post("/switch_mstp?form=regional_name_set", {
                            method: "set",
                            param: {
                                regional_name: ""
                            }
                        })
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["setting_ok"]
                                );
                                this.getRegional();
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
        tab() {
            if (this.tab === "mstp_region") {
                this.getRegional();
            }
        }
    }
};
</script>

<style lang="less" scoped>
.mst-regional {
    margin: 6px 0;
    padding: 6px;
    > span {
        display: inline-block;
        vertical-align: middle;
        width: 160px;
        margin-right: 12px;
    }
    span + span {
        width: 360px;
        overflow: hidden;
        word-wrap: break-word;
        word-break: break-all;
    }
}
</style>