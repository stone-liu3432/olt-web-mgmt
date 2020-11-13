<template>
    <div class="port-vlan-translate">
        <h2>
            <span>VLAN Translate</span>
            <nms-button @click="open_add_translate">{{
                lanMap["add"]
            }}</nms-button>
        </h2>
        <div class="query-form">
            <span>{{ lanMap["query_method"] }}:</span>
            <select v-model.number="flag">
                <option :value="1">{{ lanMap["port_id"] }}</option>
                <option :value="2">Old VLAN</option>
                <option :value="4">New VLAN</option>
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
            <template v-if="flag === 2 || flag === 4">
                <input type="text" v-model="queryForm.vlan_id" />
            </template>
        </div>
        <nms-table :rows="vlanList" border>
            <nms-table-column :label="lanMap['port_id']">
                <template slot-scope="row">{{
                    row.port_id | getPortName
                }}</template>
            </nms-table-column>
            <nms-table-column
                label="Old VLAN"
                prop="old_vlan"
            ></nms-table-column>
            <nms-table-column
                label="New VLAN"
                prop="new_vlan"
            ></nms-table-column>
            <nms-table-column :label="lanMap['new_vlan_pri']">
                <template slot-scope="row">{{
                    row.new_vlan_pri === 255 ? "-" : row.new_vlan_pri
                }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['config']">
                <template slot-scope="row">
                    <nms-button type="text" @click="open_del_translate(row)">{{
                        lanMap["delete"]
                    }}</nms-button>
                </template>
            </nms-table-column>
        </nms-table>
        <div class="modal-dialog" v-if="show_set_pvtrans">
            <div class="cover"></div>
            <div class="pv-translate-modal">
                <div class="translate-modal-item">
                    <h3 v-if="flags === 2">{{ lanMap["config"] }}</h3>
                    <h3 v-if="flags === 1">{{ lanMap["add"] }}</h3>
                </div>
                <div class="translate-modal-item">
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
                <div class="translate-modal-item">
                    <span>Old VLAN</span>
                    <span>
                        <input
                            type="text"
                            v-model.number="pv_old_vlan"
                            :disabled="flags === 2"
                            :style="{
                                'border-color':
                                    this.pv_old_vlan !== '' &&
                                    (this.pv_old_vlan < 1 ||
                                        this.pv_old_vlan > 4094 ||
                                        isNaN(this.pv_old_vlan))
                                        ? 'red'
                                        : '',
                            }"
                        />
                    </span>
                </div>
                <div class="translate-modal-item">
                    <span>New VLAN</span>
                    <span>
                        <input
                            type="text"
                            v-model.number="pv_new_vlan"
                            :style="{
                                'border-color':
                                    this.pv_new_vlan !== '' &&
                                    (this.pv_new_vlan < 1 ||
                                        this.pv_new_vlan > 4094 ||
                                        isNaN(this.pv_new_vlan))
                                        ? 'red'
                                        : '',
                            }"
                        />
                    </span>
                </div>
                <div class="translate-modal-item">
                    <span>{{ lanMap["new_vlan_pri"] }}</span>
                    <span>
                        <select v-model.number="pv_new_vlan_pri">
                            <option :value="255">-</option>
                            <option :value="0">0</option>
                            <template v-for="i in 7">
                                <option :value="i">{{ i }}</option>
                            </template>
                        </select>
                    </span>
                </div>
                <div class="translate-modal-item">
                    <a
                        href="javascript:void(0);"
                        @click="submit_pv_translate"
                        >{{ lanMap["apply"] }}</a
                    >
                    <a
                        href="javascript:void(0);"
                        @click="close_translate_modal"
                        >{{ lanMap["cancel"] }}</a
                    >
                </div>
                <div class="close" @click="close_translate_modal"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "pvTranslate",
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
                    return this.pvData.filter(
                        (item) =>
                            String(item.old_vlan).indexOf(
                                this.queryForm.vlan_id
                            ) > -1
                    );
                    break;
                case 4:
                    return this.pvData.filter(
                        (item) =>
                            String(item.new_vlan).indexOf(
                                this.queryForm.vlan_id
                            ) > -1
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
            show_set_pvtrans: false,
            port_id: 1,
            pv_old_vlan: 0,
            pv_new_vlan: 0,
            pv_new_vlan_pri: 255,
            flag: 1,
            queryForm: {
                port_id: 0,
                vlan_id: "",
            },
            // pvData: [
            //     {
            //         port_id: 1,
            //         old_vlan: 100,
            //         new_vlan: 200,
            //         new_vlan_pri: 1,
            //         action: 0,
            //     },
            // ],
        };
    },
    methods: {
        //  打开配置 translate 模态框
        open_cfg_translate(item) {
            this.flags = 2;
            this.show_set_pvtrans = true;
            this.pv_new_vlan = item.new_vlan;
            this.pv_old_vlan = item.old_vlan;
            this.pv_new_vlan_pri = item.new_vlan_pri;
        },
        //  关闭配置 translate 模态框
        close_translate_modal() {
            this.show_set_pvtrans = false;
            this.pv_new_vlan = "";
            this.pv_old_vlan = "";
            this.pv_new_vlan_pri = 255;
        },
        //  配置 translate 模态框内提交按钮
        submit_pv_translate() {
            if (
                this.pv_old_vlan < 1 ||
                this.pv_old_vlan > 4094 ||
                isNaN(this.pv_old_vlan)
            ) {
                this.$message.error(
                    this.lanMap["param_error"] + ": " + "old vlan"
                );
                return;
            }
            if (
                this.pv_new_vlan < 1 ||
                this.pv_new_vlan > 4094 ||
                isNaN(this.pv_new_vlan)
            ) {
                this.$message.error(
                    this.lanMap["param_error"] + ": " + "new vlan"
                );
                return;
            }
            if (
                this.pvData.some(
                    (item) =>
                        item.port_id === this.port_id &&
                        item.old_vlan === this.pv_old_vlan &&
                        item.new_vlan === this.pv_new_vlan &&
                        item.new_vlan_pri === this.pv_new_vlan_pri
                )
            ) {
                return this.$message.info(this.lanMap["translate_exits"]);
            }
            var post_params = {
                method: "set",
                param: {
                    port_id: this.port_id,
                    old_vlan: this.pv_old_vlan,
                    new_vlan: this.pv_new_vlan,
                    new_vlan_pri: this.pv_new_vlan_pri,
                    action: 0,
                },
            };
            this.$http
                .post("/vlan_action?form=translate", post_params)
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
                .catch((err) => {});
            this.close_translate_modal();
        },
        //  打开删除 translate 确认框
        open_del_translate(row) {
            this.$confirm(this.lanMap["if_sure"] + this.lanMap["delete"] + " ?")
                .then((_) => {
                    this.del_pv_trans(row);
                })
                .catch((_) => {});
        },
        //  确认框内的操作按钮
        del_pv_trans(row) {
            const post_params = {
                method: "delete",
                param: {
                    port_id: row.port_id,
                    old_vlan: row.old_vlan,
                    action: 0,
                },
            };
            this.$http
                .post("/vlan_action?form=translate", post_params)
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
        //  打开添加 translate 模态框
        open_add_translate() {
            this.flags = 1;
            this.show_set_pvtrans = true;
            this.pv_new_vlan = "";
            this.pv_old_vlan = "";
            this.pv_new_vlan_pri = 255;
        },
        resetQueryForm() {
            this.queryForm = {
                port_id: 0,
                vlan_id: "",
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
// a {
//     font-size: 16px;
//     font-weight: normal;
//     width: 120px;
//     padding: 0;
// }
h2 {
    padding: 0 0 0 10px;
    font-size: 18px;
    font-weight: 600;
    color: @titleColor;
    a {
        margin-left: 30px;
    }
}
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
div.pv-translate-item {
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
    a.large-btn {
        padding: 0 20px;
        width: auto;
    }
}
div.modal-dialog {
    div.pv-translate-modal {
        width: 500px;
        height: 340px;
        background: #fff;
        div.translate-modal-item {
            margin: 20px 0 20px 60px;
            &:first-child {
                margin: 0;
                h3 {
                    height: 60px;
                    line-height: 60px;
                    padding: 0 0 0 60px;
                    text-indent: 10px;
                    font-size: 18px;
                    font-weight: 600;
                    color: #67aef7;
                    border-bottom: 2px solid #ddd;
                }
            }
            span {
                display: inline-block;
                height: 30px;
                width: 150px;
                line-height: 30px;
                vertical-align: middle;
            }
            a {
                margin: 10px 0 0 45px;
            }
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
    }
}
</style>
