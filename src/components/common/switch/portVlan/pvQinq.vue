<template>
    <div class="pv-qinq">
        <h2>
            <span>VLAN QinQ</span>
            <nms-button @click="open_add_qinq">{{ lanMap["add"] }}</nms-button>
        </h2>
        <div class="query-form">
            <span>{{ lanMap["query_method"] }}</span>
            <select v-model.number="flag">
                <option :value="1">{{ lanMap["port_id"] }}</option>
                <option :value="2">CVLAN</option>
                <option :value="4">SVLAN</option>
            </select>
            <template v-if="flag === 1">
                <select v-model.number="queryForm.port_id">
                    <option :value="0">{{ lanMap["all"] }}</option>
                    <template v-for="item in port_info.data || []">
                        <option :value="item.port_id">
                            {{ item.port_id | getPortName }}
                        </option>
                    </template>
                </select>
            </template>
            <template v-if="flag === 2">
                <input
                    type="text"
                    v-model="queryForm.cvlan_s"
                    style="width: 80px"
                />
                -
                <input
                    type="text"
                    v-model="queryForm.cvlan_e"
                    style="width: 80px"
                />
            </template>
            <template v-if="flag === 4">
                <input type="text" v-model="queryForm.svlan" key="svlan" />
            </template>
        </div>
        <nms-table :rows="vlanList" border>
            <nms-table-column :label="lanMap['port_id']">
                <template slot-scope="row">{{
                    row.port_id | getPortName
                }}</template>
            </nms-table-column>
            <nms-table-column label="CVLAN">
                <template slot-scope="row">{{ row.cvlan || "-" }}</template>
            </nms-table-column>
            <nms-table-column label="CVLAN Start">
                <template slot-scope="row">{{ row.cvlan_s || "-" }}</template>
            </nms-table-column>
            <nms-table-column label="CVLAN End">
                <template slot-scope="row">{{ row.cvlan_e || "-" }}</template>
            </nms-table-column>
            <nms-table-column label="SVLAN" prop="svlan"></nms-table-column>
            <nms-table-column :label="lanMap['svlan_pri']">
                <template slot-scope="row">{{
                    row.svlan_pri === 255 ? "-" : row.svlan_pri
                }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['config']">
                <template slot-scope="row">
                    <nms-button type="text" @click="open_del_qinq_modal(row)">{{
                        lanMap["delete"]
                    }}</nms-button>
                </template>
            </nms-table-column>
        </nms-table>
        <div class="modal-dialog" v-if="show_set_qinq">
            <div class="cover"></div>
            <div class="pv-qinq-modal" id="modal-dialog-qinq">
                <div class="pv-qinq-modal-item">
                    <h3 v-if="flags === 2">{{ lanMap["config"] }}</h3>
                    <h3 v-if="flags === 1">{{ lanMap["add"] }}</h3>
                </div>
                <div class="pv-qinq-modal-item">
                    <span>{{ lanMap["port_id"] }}</span>
                    <span>
                        <select v-model.number="port_id" style="width: 197px">
                            <template v-for="item in port_info.data || []">
                                <option :value="item.port_id">
                                    {{ item.port_id | getPortName }}
                                </option>
                            </template>
                        </select>
                    </span>
                </div>
                <div class="pv-qinq-modal-item">
                    <span>CVLAN</span>
                    <span>
                        <input
                            type="text"
                            v-model.number="cvlan"
                            v-focus
                            :disabled="
                                cvlan_s != 0 || cvlan_e != 0 || flags === 2
                            "
                            :style="{
                                'border-color':
                                    cvlan < 0 || cvlan > 4094 || isNaN(cvlan)
                                        ? 'red'
                                        : '',
                            }"
                        />
                    </span>
                </div>
                <div class="pv-qinq-modal-item">
                    <span>CVLAN Start</span>
                    <span>
                        <input
                            type="text"
                            v-model.number="cvlan_s"
                            :disabled="cvlan != 0"
                            :style="{
                                'border-color':
                                    cvlan_s < 0 ||
                                    cvlan_s > 4094 ||
                                    isNaN(cvlan_s)
                                        ? 'red'
                                        : '',
                            }"
                        />
                    </span>
                </div>
                <div class="pv-qinq-modal-item">
                    <span>CVLAN End</span>
                    <span>
                        <input
                            type="text"
                            v-model.number="cvlan_e"
                            :disabled="cvlan != 0"
                            :style="{
                                'border-color':
                                    cvlan_e < 0 ||
                                    cvlan_e > 4094 ||
                                    isNaN(cvlan_e)
                                        ? 'red'
                                        : '',
                            }"
                        />
                    </span>
                </div>
                <div class="pv-qinq-modal-item">
                    <span>SVLAN</span>
                    <span>
                        <input
                            type="text"
                            v-model.number="svlan"
                            :style="{
                                'border-color':
                                    svlan !== '' &&
                                    (svlan < 1 || svlan > 4094 || isNaN(svlan))
                                        ? 'red'
                                        : '',
                            }"
                        />
                    </span>
                </div>
                <div class="pv-qinq-modal-item">
                    <span>{{ lanMap["svlan_pri"] }}</span>
                    <span>
                        <select v-model.number="svlan_pri">
                            <option value="255">-</option>
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                        </select>
                    </span>
                </div>
                <div class="pv-qinq-modal-item">
                    <a href="javascript:void(0);" @click="submit_cfg_qinq">{{
                        lanMap["apply"]
                    }}</a>
                    <a
                        href="javascript:void(0);"
                        @click="close_set_qinq_modal"
                        >{{ lanMap["cancel"] }}</a
                    >
                </div>
                <div class="close" @click="close_set_qinq_modal"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "pvQinq",
    computed: {
        ...mapState(["lanMap", "port_info"]),
        vlanList() {
            switch (this.flag) {
                case 1:
                    if (this.queryForm.port_id === 0) {
                        return this.pvData;
                    }
                    return this.pvData.filter(
                        (item) => item.port_id === this.queryForm.port_id
                    );
                    break;
                case 2:
                    return this.pvData.filter((item) => {
                        if (item.cvlan) {
                            return (
                                String(item.cvlan).indexOf(
                                    this.queryForm.cvlan_s
                                ) > -1
                            );
                        } else {
                            return this.queryForm.cvlan_s
                                ? this.queryForm.cvlan_e
                                    ? item.cvlan_s >= this.queryForm.cvlan_s &&
                                      item.cvlan_e <= this.queryForm.cvlan_e
                                    : item.cvlan_s >= this.queryForm.cvlan_s
                                : this.pvData;
                        }
                    });
                    break;
                case 4:
                    return this.pvData.filter(
                        (item) =>
                            String(item.svlan).indexOf(this.queryForm.svlan) >
                            -1
                    );
                    break;
            }
            return [];
        },
    },
    props: {
        pvData: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            flags: 0, //  模态框内标题
            cache_d: {},
            show_set_qinq: false,
            port_id: 1,
            cvlan: 0,
            cvlan_s: 0,
            cvlan_e: 0,
            svlan: 0,
            svlan_pri: 0,
            del_params: {},
            flag: 1,
            queryForm: {
                port_id: 0,
                cvlan_s: "",
                cvlan_e: "",
                svlan: "",
            },
            // pvData: [
            //     {
            //         port_id: 1,
            //         cvlan: 100,
            //         cvlan_s: 0,
            //         cvlan_e: 0,
            //         svlan: 200,
            //         svlan_pri: 1,
            //         action: 1,
            //     },
            // ],
        };
    },
    created() {
        //
    },
    methods: {
        //  添加 qinq 模态框
        open_add_qinq() {
            this.flags = 1;
            this.show_set_qinq = true;
            this.cvlan = "";
            this.cvlan_s = "";
            this.cvlan_e = "";
            this.svlan = "";
            this.svlan_pri = 255;
        },
        //  设置 qinq 模态框内取消/关闭按钮
        close_set_qinq_modal() {
            this.show_set_qinq = false;
        },
        //  设置 qinq 模态框内确认按钮
        submit_cfg_qinq() {
            if (
                !this.cvlan_s &&
                !this.cvlan_e &&
                (this.cvlan < 1 || this.cvlan > 4094 || isNaN(this.cvlan))
            ) {
                this.$message.error(this.lanMap["param_error"] + ": CVLAN");
                return;
            }
            if (
                !this.cvlan &&
                (this.cvlan_s < 1 || this.cvlan_s > 4094 || isNaN(this.cvlan_s))
            ) {
                this.$message.error(
                    this.lanMap["param_error"] + ": CVLAN Start"
                );
                return;
            }
            if (
                !this.cvlan &&
                (this.cvlan_e < 1 || this.cvlan_e > 4094 || isNaN(this.cvlan_e))
            ) {
                this.$message.error(this.lanMap["param_error"] + ": CVLAN End");
                return;
            }
            if (this.svlan < 1 || this.svlan > 4094 || isNaN(this.svlan)) {
                this.$message.error(this.lanMap["param_error"] + ": SVLAN");
                return;
            }
            var post_params = {
                method: "set",
                param: {
                    port_id: this.port_id,
                    cvlan: this.cvlan,
                    cvlan_s: this.cvlan_s,
                    cvlan_e: this.cvlan_e,
                    svlan: this.svlan,
                    svlan_pri: this.svlan_pri,
                    action: 1,
                },
            };
            this.$http
                .post("/vlan_action?form=qinq", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.$emit("refresh-data");
                    } else {
                        this.$message.error(
                            "(" + res.data.code + ") " + res.data.message
                        );
                    }
                })
                .catch((err) => {})
                .finally(() => {
                    this.close_set_qinq_modal();
                });
        },
        //  删除 qinq 按钮
        open_del_qinq_modal(item) {
            this.$confirm(this.lanMap["if_sure"] + this.lanMap["delete"] + " ?")
                .then(() => {
                    this.del_qinq_result(item);
                })
                .catch(() => {});
        },
        //  删除 qinq 确认框内操作结果
        del_qinq_result(data) {
            const post_params = {
                method: "delete",
                param: {
                    port_id: data.port_id,
                    cvlan: data.cvlan,
                    cvlan_s: data.cvlan_s,
                    cvlan_e: data.cvlan_e,
                    action: 1,
                },
            };
            this.$http
                .post("/vlan_action?form=qinq", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message.success(
                            this.lanMap["delete"] + this.lanMap["st_success"]
                        );
                        this.$emit("refresh-data");
                    } else {
                        this.$message.error(
                            "(" + res.data.code + ") " + res.data.message
                        );
                    }
                })
                .catch((err) => {});
        },
        resetQueryForm() {
            this.queryForm = {
                port_id: 0,
                cvlan_s: "",
                cvlan_e: "",
                svlan: "",
            };
        },
    },
    watch: {
        flag() {
            this.resetQueryForm();
        },
    },
};
</script>

<style lang="less" scoped>
h2 {
    padding: 0 0 0 10px;
    font-size: 18px;
    font-weight: 600;
    color: @titleColor;
    a {
        margin-left: 30px;
    }
}
// a {
//     font-size: 16px;
//     font-weight: normal;
//     width: 120px;
//     padding: 0;
// }
select {
    width: 120px;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
    text-indent: 6px;
    border-radius: 3px;
    &:focus {
        border-radius: 3px;
    }
}
div.pv-qinq-item {
    margin: 10px 0 10px 10px;
    height: 30px;
    > span {
        display: inline-block;
        min-width: 120px;
        max-width: 800px;
        height: 30px;
        line-height: 30px;
        vertical-align: middle;
        &:last-child {
            width: 300px;
            text-align: center;
        }
    }
}
div.modal-dialog {
    div.pv-qinq-modal {
        width: 500px;
        height: 370px;
        background: #fff;
        div.pv-qinq-modal-item {
            margin: 10px 0 10px 60px;
            height: 30px;
            &:first-child {
                margin: 0;
                height: 60px;
                line-height: 60px;
                padding: 0 0 0 20px;
                text-indent: 10px;
                border-bottom: 2px solid #ddd;
            }
        }
        &:first-child {
            margin-top: 24px;
        }
        span {
            display: inline-block;
            height: 30px;
            width: 150px;
            line-height: 30px;
            vertical-align: middle;
        }
        h3 {
            font-size: 18px;
            font-weight: 600;
            color: #67aef7;
        }
        a {
            margin: 15px 0 0 45px;
        }
    }
}
div.query-form {
    margin: 20px 0 0 10px;
    > span {
        margin-right: 12px;
    }
    > select {
        width: 150px;
        & + select {
            margin-left: 20px;
        }
    }
    > input {
        height: 30px;
        box-sizing: border-box;
        margin-left: 20px;
        vertical-align: middle;
        & + input {
            margin-left: 0;
        }
    }
}
</style>
