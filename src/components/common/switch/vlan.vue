<template>
    <div class="vlan-page">
        <page-header type="none">
            <h2 slot="title">{{ lanMap["vlan_mgmt"] }}</h2>
            <template slot="action">
                <nms-button
                    class="page-header-btn"
                    @click="openDialog('create')"
                >
                    {{ lanMap["create"] }} VLAN
                </nms-button>
                <nms-button
                    class="page-header-btn"
                    @click="openDialog('destroy')"
                >
                    {{ lanMap["delete"] }} VLAN
                </nms-button>
                <nms-button class="page-header-btn" @click="openDialog('set')">
                    {{ lanMap["batch_cfg_vlan"] }}
                </nms-button>
            </template>
        </page-header>
        <tab-bar :tab="tabs" @togglePage="pageChange"></tab-bar>
        <template v-if="activeName === 'vlan_list'">
            <vlan-mgmt ref="vlan-mgmt"></vlan-mgmt>
        </template>
        <template v-if="activeName === 'port_vlan'">
            <pvSet
                :pv-data="pvSetData"
                @refresh-data="getData(activeName)"
            ></pvSet>
        </template>
        <template v-if="activeName === 'VLAN Translate'">
            <pvTranslate
                :pv-data="pvTranslateData"
                @refresh-data="getData(activeName)"
            ></pvTranslate>
        </template>
        <template v-if="activeName === 'VLAN QinQ'">
            <pvQinq
                :pv-data="pvQinqData"
                @refresh-data="getData(activeName)"
            ></pvQinq>
        </template>
        <!--  页头创建/删除/配置VLAN端口的dialog -->
        <nms-dialog :visible.sync="dialogVisible" width="850px">
            <div slot="title">{{ lanMap[this.dialogType] }}</div>
            <div class="form-item">
                <span>{{ lanMap["vlan_id"] }}:</span>
                <input
                    type="text"
                    v-model.number="form.vlanid_s"
                    v-validator="{ min: 1, max: 4094 }"
                />
                -
                <input
                    type="text"
                    v-model.number="form.vlanid_e"
                    v-validator="{ min: 0, max: 4094 }"
                />
                <span class="tips">{{ lanMap["vlanid_range_hit"] }}</span>
            </div>
            <template v-if="dialogType !== 'delete'">
                <div class="form-item">
                    <span>tagged:</span>
                    <span>
                        <port-checkbox v-model="form.tagged"></port-checkbox>
                    </span>
                </div>
                <div class="form-item">
                    <span>untagged:</span>
                    <span>
                        <port-checkbox v-model="form.untagged"></port-checkbox>
                    </span>
                </div>
            </template>

            <div slot="footer">
                <nms-button @click="submitForm">{{
                    lanMap["apply"]
                }}</nms-button>
                <nms-button @click="dialogVisible = false">{{
                    lanMap["cancel"]
                }}</nms-button>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { isArray, isDef, isFunction } from "@/utils/common";
import vlanMgmt from "./vlanMgmt";
import pvSet from "./portVlan/pvSet";
import pvTranslate from "./portVlan/pvTranslate";
import pvQinq from "./portVlan/pvQinq";
import { removeItem } from "../../../utils/common";
export default {
    name: "vlanFunc",
    components: { vlanMgmt, pvSet, pvTranslate, pvQinq },
    computed: {
        ...mapState(["lanMap"]),
    },
    data() {
        return {
            tabs: ["vlan_list", "port_vlan", "VLAN Translate", "VLAN QinQ"],
            activeName: "vlan_list",
            port_id: 0,
            pvSetData: [],
            pvTranslateData: [],
            pvQinqData: [],
            dialogVisible: false,
            dialogType: "",
            form: {
                vlanid_s: "",
                vlanid_e: "",
                tagged: [],
                untagged: [],
            },
        };
    },
    created() {
        this.getData(this.activeName);
    },
    methods: {
        pageChange(activeName) {
            this.activeName = activeName;
            this.getData(activeName);
        },
        getPvSet() {
            this.pvSetData = [];
            this.$http
                .get("/switch_port?form=vlanall")
                .then((res) => {
                    if (res.data.code === 1) {
                        if (isArray(res.data.data)) {
                            this.pvSetData = res.data.data;
                        }
                    }
                })
                .catch((err) => {});
        },
        getPvTranslate() {
            this.pvTranslateData = [];
            this.$http
                .get("/vlan_action?form=translate_all")
                .then((res) => {
                    if (res.data.code === 1) {
                        if (isArray(res.data.data)) {
                            this.pvTranslateData = res.data.data;
                        }
                    }
                })
                .catch((err) => {});
        },
        getPvQinq() {
            this.pvQinqData = [];
            this.$http
                .get("/vlan_action?form=qinq_all")
                .then((res) => {
                    if (res.data.code === 1) {
                        if (isArray(res.data.data)) {
                            this.pvQinqData = res.data.data;
                        }
                    }
                })
                .catch((err) => {});
        },
        getData(showIndex) {
            switch (showIndex) {
                case "vlan_list":
                    // 主要用于添加/删除/修改VLAN端口或切换tab页后刷新数据用，无需 $nextTick
                    // 首次进入时，规避重复获取vlan_list数据
                    if (this.$refs["vlan-mgmt"]) {
                        this.$refs["vlan-mgmt"].getData();
                    }
                    break;
                case "port_vlan":
                    this.getPvSet();
                    break;
                case "VLAN Translate":
                    this.getPvTranslate();
                    break;
                case "VLAN QinQ":
                    this.getPvQinq();
                    break;
            }
        },
        openDialog(action) {
            this.resetForm();
            this.dialogVisible = true;
            this.dialogType = action;
        },
        resetForm() {
            this.form = {
                vlanid_s: "",
                vlanid_e: "",
                tagged: [],
                untagged: [],
            };
        },
        submitForm() {
            const vs = this.form.vlanid_s,
                ve = this.form.vlanid_e || this.form.vlanid_s;
            if (
                vs < 1 ||
                vs > 4094 ||
                isNaN(vs) ||
                (ve && (ve < 1 || ve > 4094 || isNaN(ve)))
            ) {
                return this.$message.error(this.lanMap["vlanid_range_hit"]);
            }
            const url = "/switch_vlanlist";
            const vlanid_s = vs < ve ? vs : ve,
                vlanid_e = vs < ve ? ve : vs;
            const ACTIONS = {
                create(form) {
                    return {
                        url,
                        data: {
                            method: "create",
                            param: {
                                type: 1,
                                vlanid_s,
                                vlanid_e,
                            },
                        },
                    };
                },
                destroy(form) {
                    return {
                        url,
                        data: {
                            method: "destroy",
                            param: {
                                vlanid_s,
                                vlanid_e,
                            },
                        },
                    };
                },
                set(form) {
                    return {
                        url,
                        data: {
                            method: "set",
                            param: {
                                vlanid_s,
                                vlanid_e,
                                tagged_portlist: form.tagged.join(","),
                                untagged_portlist: form.untagged.join(","),
                            },
                        },
                    };
                },
            };
            if (isFunction(ACTIONS[this.dialogType])) {
                const res = ACTIONS[this.dialogType].call(this, this.form);
                if (isDef(res)) {
                    const { url, data } = res;
                    this.postData(url, data)
                        .then((res) => {
                            if (res.data.code === 1) {
                                if (
                                    this.dialogType === "create" &&
                                    (this.form.tagged.join(",") ||
                                        this.form.untagged.join(","))
                                ) {
                                    this.$message.success(
                                        this.lanMap["create_vlan_info"]
                                    );
                                    this.postData(url, {
                                        method: "set",
                                        param: {
                                            vlanid_s,
                                            vlanid_e,
                                            tagged_portlist: this.form.tagged.join(
                                                ","
                                            ),
                                            untagged_portlist: this.form.untagged.join(
                                                ","
                                            ),
                                        },
                                    })
                                        .then((_res) => {
                                            if (_res.data.code === 1) {
                                                this.$message.success(
                                                    this.lanMap["setting_ok"]
                                                );
                                            } else {
                                                this.$message.error(
                                                    `(${_res.data.code}) ${_res.data.message}`
                                                );
                                                if (
                                                    _res.data.type === "warning"
                                                ) {
                                                    this.getData(
                                                        this.activeName
                                                    );
                                                }
                                            }
                                        })
                                        .catch((err) => {});
                                    return;
                                }
                                this.$message.success(
                                    this.lanMap["setting_ok"]
                                );
                                this.getData(this.activeName);
                            } else {
                                this.$message.error(
                                    `(${res.data.code}) ${res.data.message}`
                                );
                                if (res.data.type === "warning") {
                                    this.getData(this.activeName);
                                }
                            }
                        })
                        .catch((err) => {})
                        .finally(() => {
                            this.dialogVisible = false;
                        });
                }
            }
        },
        postData(url, param) {
            return this.$http.post(url, param);
        },
        intersection(target, source) {
            return target.filter((item) => source.includes(item));
        },
    },
    directives: {
        validator: {
            update(el, { value }) {
                const val = Number(el.value),
                    { min, max } = value;
                if (val < min || val > max || isNaN(val)) {
                    el.style.borderColor = "red";
                } else {
                    el.style.borderColor = "";
                }
            },
        },
    },
    watch: {
        "form.tagged"(nv, ov) {
            if (ov.length > nv.length) {
                return;
            }
            const list = this.intersection(
                this.form.tagged,
                this.form.untagged
            );
            list.forEach((item) => {
                removeItem(this.form.untagged, item);
            });
        },
        "form.untagged"(nv, ov) {
            if (ov.length > nv.length) {
                return;
            }
            const list = this.intersection(
                this.form.untagged,
                this.form.tagged
            );
            list.forEach((item) => {
                removeItem(this.form.tagged, item);
            });
        },
    },
};
</script>

<style lang="less" scoped>
div.vlan-page {
    height: calc(~"100% - 100px");
    overflow-y: auto;
}
h2 {
    margin-left: 20px;
}
.page-header-btn {
    padding: 7px 12px !important;
    height: auto !important;
    line-height: inherit !important;
    margin-left: 30px;
}
div.form-item {
    margin: 12px 0;
    > span {
        display: inline-block;
        vertical-align: middle;
        width: 100px;
        text-align: right;
        padding-right: 12px;
        box-sizing: border-box;
        & + span {
            width: calc(~"100% - 110px");
            padding: 0;
            text-align: left;
        }
    }
    > input[type="text"] {
        width: 100px;
    }
    span.tips {
        width: auto;
        margin-left: 12px;
        font-size: @tipsFontSize;
        color: @tipsColor;
    }
}
</style>