<template>
    <div class="rstp">
        <page-header type="none">
            <div slot="title">RSTP</div>
        </page-header>
        <div>
            <span>{{ lanMap["rstp_b_info"] }}</span>
            <nms-button @click="open_modal" v-if="rstp.data">
                {{ lanMap["config"] }}
            </nms-button>
        </div>
        <ul v-if="rstp.data">
            <li v-for="(item, key) in rstp.data" :key="key">
                <span>{{ lanMap[key] }}</span>
                <span v-if="key !== 'status' && key !== 'rstp_mode'">{{
                    item
                }}</span>
                <span v-if="key === 'status'">{{
                    item === 1 ? lanMap["enable"] : lanMap["disable"]
                }}</span>
                <span v-if="key === 'rstp_mode'">{{
                    item === 0 ? "stp" : "rstp"
                }}</span>
            </li>
        </ul>
        <div>
            <span>{{ lanMap["rstp_p_info"] }}</span>
            <nms-button v-if="rstp_port.length" @click="open_priority">
                {{ lanMap["rstp_p_pri_b"] }}
            </nms-button>
            <nms-button style="margin-left: 30px" @click="refreshPort">
                {{ lanMap["refresh"] }}
            </nms-button>
        </div>
        <nms-table :rows="rstp_port" border>
            <nms-table-column :label="lanMap['port_id']">
                <template slot-scope="rows">{{
                    port_name.ge[rows.port_id]
                        ? port_name.ge[rows.port_id].name
                        : port_name.xge[rows.port_id]
                        ? port_name.xge[rows.port_id].name
                        : ""
                }}</template>
            </nms-table-column>
            <nms-table-column
                prop="port_priority"
                :label="lanMap['port_priority']"
            ></nms-table-column>
            <nms-table-column
                prop="port_path_cost"
                :label="lanMap['port_path_cost']"
            ></nms-table-column>
            <nms-table-column :label="lanMap['edge_status']">
                <template slot-scope="rows">{{
                    rows.edge_status === 1 ? "Edge" : "NEdge"
                }}</template>
            </nms-table-column>
            <nms-table-column
                prop="admin_link_type"
                :label="lanMap['admin_link_type']"
            ></nms-table-column>
            <nms-table-column
                prop="oper_link_type"
                :label="lanMap['oper_link_type']"
            ></nms-table-column>
            <nms-table-column
                prop="port_role"
                :label="lanMap['port_role']"
            ></nms-table-column>
            <nms-table-column
                prop="port_state"
                :label="lanMap['port_state']"
            ></nms-table-column>
        </nms-table>
        <!-- 设置rstp全局信息模态框 -->
        <div class="modal-dialog" v-if="modal" key="modal-rstp-basic-info">
            <div class="cover"></div>
            <div class="modal-body">
                <h2 class="modal-header">{{ lanMap["rstp_global_info"] }}</h2>
                <div>
                    <span>{{ lanMap["status"] }}</span>
                    <select v-model.number="bridge_info.status">
                        <option value="0">{{ lanMap["disable"] }}</option>
                        <option value="1">{{ lanMap["enable"] }}</option>
                    </select>
                </div>
                <div>
                    <span>{{ lanMap["rstp_mode"] }}</span>
                    <select v-model.number="bridge_info.rstp_mode">
                        <option value="0">stp</option>
                        <option value="2">rstp</option>
                        <!-- 暂未实现 -->
                        <!-- <option value="3">mstp</option> -->
                    </select>
                </div>
                <div>
                    <span>{{ lanMap["rb_priority"] }}</span>
                    <select v-model.number="bridge_info.rb_priority">
                        <option value="0">0</option>
                        <option value="4096">4096</option>
                        <option value="8192">8192</option>
                        <option value="12288">12288</option>
                        <option value="16384">16384</option>
                        <option value="20480">20480</option>
                        <option value="24576">24576</option>
                        <option value="28672">28672</option>
                        <option value="32768">32768</option>
                        <option value="36864">36864</option>
                        <option value="40960">40960</option>
                        <option value="45056">45056</option>
                        <option value="49152">49152</option>
                        <option value="53248">53248</option>
                        <option value="57344">57344</option>
                        <option value="61440">61440</option>
                    </select>
                </div>
                <div>
                    <span>{{ lanMap["max_age"] }}</span>
                    <input
                        type="text"
                        v-model.number="bridge_info.max_age"
                        :style="{
                            borderColor: verify_input.max_age ? 'red' : '#ccc',
                        }"
                    />
                    <span>range: 6-40</span>
                </div>
                <div>
                    <span>{{ lanMap["hello_time"] }}</span>
                    <input
                        type="text"
                        v-model.number="bridge_info.hello_time"
                        :style="{
                            borderColor: verify_input.hello_time
                                ? 'red'
                                : '#ccc',
                        }"
                    />
                    <span>range: 1-10</span>
                </div>
                <div>
                    <span>{{ lanMap["forward_delay"] }}</span>
                    <input
                        type="text"
                        v-model.number="bridge_info.forward_delay"
                        :style="{
                            borderColor: verify_input.forward_delay
                                ? 'red'
                                : '#ccc',
                        }"
                    />
                    <span>range: 4-30</span>
                </div>
                <div>
                    <span>{{ lanMap["transmit_hold_count"] }}</span>
                    <input
                        type="text"
                        v-model.number="bridge_info.transmit_hold_count"
                        :style="{
                            borderColor: verify_input.transmit_hold_count
                                ? 'red'
                                : '#ccc',
                        }"
                    />
                    <span>range: 1-255</span>
                </div>
                <div>
                    <a href="javascript:;" @click="set_bridge">{{
                        lanMap["apply"]
                    }}</a>
                    <a href="javascript:;" @click="close_modal">{{
                        lanMap["cancel"]
                    }}</a>
                </div>
                <div class="close" @click="close_modal"></div>
            </div>
        </div>
        <!-- 设置rstp端口优先级模态框 -->
        <div
            class="modal-dialog"
            v-if="modal_priority"
            key="modal-rstp-priority"
        >
            <div class="cover"></div>
            <div class="modal-content">
                <h2 class="modal-header">{{ lanMap["rstp_port_pri"] }}</h2>
                <div>
                    <span>{{ lanMap["port_id"] }}</span>
                    <select v-model.number="priority_info.port_id">
                        <option
                            v-for="(item, key) in port_name.ge"
                            :value="item.id"
                        >
                            {{ item.name }}
                        </option>
                        <option
                            v-for="(item, key) in port_name.xge"
                            :value="item.id"
                        >
                            {{ item.name }}
                        </option>
                    </select>
                </div>
                <div>
                    <span>{{ lanMap["port_priority"] }}</span>
                    <select v-model.number="priority_info.port_priority">
                        <option value="0">0</option>
                        <option value="16">16</option>
                        <option value="32">32</option>
                        <option value="48">48</option>
                        <option value="64">64</option>
                        <option value="80">80</option>
                        <option value="96">96</option>
                        <option value="112">112</option>
                        <option value="128">128</option>
                        <option value="144">144</option>
                        <option value="160">160</option>
                        <option value="176">176</option>
                        <option value="192">192</option>
                        <option value="208">208</option>
                        <option value="224">224</option>
                        <option value="240">240</option>
                    </select>
                </div>
                <div>
                    <span>{{ lanMap["port_path_cost"] }}</span>
                    <input
                        type="text"
                        v-model.number="priority_info.port_path_cost"
                        :style="{
                            borderColor: verify_input.port_path_cost
                                ? 'red'
                                : '#ccc',
                        }"
                    />
                    <span>range: 0-200000000</span>
                </div>
                <div>
                    <span>{{ lanMap["edge_status"] }}</span>
                    <select v-model.number="priority_info.edge_status">
                        <option value="0">NEdge</option>
                        <option value="1">Edge</option>
                    </select>
                </div>
                <div>
                    <span>{{ lanMap["admin_link_type"] }}</span>
                    <select v-model="priority_info.admin_link_type">
                        <option value="Auto">Auto</option>
                        <option value="P2P">P2P</option>
                        <option value="Shared">Shared</option>
                    </select>
                </div>
                <div style="font-size: 14px; color: #67aef6">
                    <template v-if="priority_info.link_aggregation">{{
                        lanMap["link_aggregation_tips"]
                    }}</template>
                </div>
                <div>
                    <a href="javascript:;" @click="set_priority">{{
                        lanMap["apply"]
                    }}</a>
                    <a href="javascript:;" @click="close_priority">{{
                        lanMap["cancel"]
                    }}</a>
                </div>
                <div class="close" @click="close_priority"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { debounce } from "@/utils/common";
export default {
    name: "rstp",
    computed: mapState(["lanMap", "change_url", "port_name"]),
    data() {
        return {
            rstp: {},
            rstp_port: [],
            //  控制rstp全局信息模态框打开关闭
            modal: false,
            //  控制rstp端口优先级设置模态框撕开关闭
            modal_priority: false,
            //  有变更的设置项统计,post数据时使用
            flags: 0,
            //  表单绑定 -->  rstp桥设置页
            bridge_info: {
                status: 0,
                rstp_mode: 0,
                rb_priority: "",
                max_age: "",
                hello_time: "",
                forward_delay: "",
                transmit_hold_count: "",
            },
            //  验证输入是否在指定的范围内
            verify_input: {
                max_age: false,
                hello_time: false,
                forward_delay: false,
                transmit_hold_count: false,
                port_path_cost: false,
            },
            //  表单绑定  -->  rstp端口优先级设置页
            priority_info: {
                port_id: 0,
                port_priority: 0,
                port_path_cost: 0,
                edge_status: 0,
                admin_link_type: "",
            },
        };
    },
    created() {
        this.getData();
        this.getPortData();
    },
    methods: {
        getData() {
            this.rstp = {};
            this.$http
                .get(this.change_url.rstp)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.rstp = res.data;
                    }
                })
                .catch((err) => {});
        },
        getPortData() {
            this.rstp_port = [];
            this.$http
                .get(this.change_url.rstp_port)
                .then((res) => {
                    if (res.data.code === 1) {
                        if (res.data.data && res.data.data.length) {
                            this.rstp_port = res.data.data;
                        }
                    }
                })
                .catch((err) => {});
        },
        //  设置全局rstp信息内的提交动作
        set_bridge() {
            if (
                this.verify_input.max_age ||
                this.verify_input.hello_time ||
                this.verify_input.forward_delay ||
                this.verify_input.transmit_hold_count
            ) {
                this.$message({
                    type: "error",
                    text: this.lanMap["param_error"],
                });
                return;
            }
            if (this.bridge_info.status !== this.rstp.data.status) {
                this.flags += 1;
            }
            if (this.bridge_info.rstp_mode !== this.rstp.data.rstp_mode) {
                this.flags += 32;
            }
            if (this.bridge_info.rb_priority !== this.rstp.data.rb_priority) {
                this.flags += 2;
            }
            if (this.bridge_info.max_age !== this.rstp.data.max_age) {
                this.flags += 4;
            }
            if (this.bridge_info.hello_time !== this.rstp.data.hello_time) {
                this.flags += 8;
            }
            if (
                this.bridge_info.forward_delay !== this.rstp.data.forward_delay
            ) {
                this.flags += 16;
            }
            if (
                this.bridge_info.transmit_hold_count !==
                this.rstp.data.transmit_hold_count
            ) {
                this.flags += 256;
            }
            if (this.flags === 0) {
                this.modal = false;
                this.$message({
                    type: "info",
                    text: this.lanMap["modify_tips"],
                });
                return;
            }
            var post_params = {
                method: "set",
                param: {
                    flags: this.flags,
                    status: this.bridge_info.status,
                    rstp_mode: this.bridge_info.rstp_mode,
                    rb_priority: this.bridge_info.rb_priority,
                    max_age: this.bridge_info.max_age,
                    hello_time: this.bridge_info.hello_time,
                    forward_delay: this.bridge_info.forward_delay,
                    transmit_hold_count: this.bridge_info.transmit_hold_count,
                },
            };
            this.$http
                .post("/switch_rstp?form=bridge", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.getData();
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"],
                        });
                        this.getPortData();
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
            this.modal = false;
        },
        //  打开rstp桥配置模态框
        open_modal() {
            for (var key in this.rstp.data) {
                this.bridge_info[key] = this.rstp.data[key];
            }
            this.flags = 0;
            this.modal = true;
        },
        //  关闭rstp桥配置模态框
        close_modal() {
            this.modal = false;
        },
        //  打开设置端口优先级模态框
        open_priority() {
            //  如果全局RSTP桥未使能，则无法应用此设置
            if (!this.rstp.data.status) {
                this.$message({
                    type: "error",
                    text: this.lanMap["rstp_tips_disable"],
                });
                return;
            }
            for (var key in this.rstp_port[0]) {
                this.priority_info[key] = this.rstp_port[0][key];
            }
            this.flags = 0;
            this.modal_priority = true;
        },
        //  关闭端口优先级设置模态框
        close_priority() {
            this.modal_priority = false;
        },
        //  设置端口优先级内的提交按钮
        set_priority() {
            const data = this.rstp_port.filter(
                (item) => item.port_id === this.priority_info.port_id
            )[0];
            if (!data) return;
            if (this.verify_input.port_path_cost) {
                this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["port_path_cost"]}`
                );
                return;
            }
            if (this.priority_info.port_priority !== data.port_priority) {
                this.flags += 4;
            }
            if (this.priority_info.port_path_cost !== data.port_path_cost) {
                this.flags += 2;
            }
            if (this.priority_info.edge_status !== data.edge_status) {
                this.flags += 16;
            }
            if (this.priority_info.admin_link_type !== data.admin_link_type) {
                this.flags += 8;
            }
            if (this.flags === 0) {
                this.modal_priority = false;
                this.$message({
                    type: "info",
                    text: this.lanMap["modify_tips"],
                });
                return;
            }
            if (this.priority_info.port_path_cost === "") {
                this.priority_info.port_path_cost = 0;
            }
            var type_map = {
                P2P: "force_true",
                Auto: "auto",
                Shared: "force_false",
            };
            var post_params = {
                method: "set",
                param: {
                    flags: this.flags,
                    port_id: this.priority_info.port_id,
                    port_priority: this.priority_info.port_priority,
                    port_path_cost: this.priority_info.port_path_cost,
                    edge_status: this.priority_info.edge_status,
                    admin_link_type:
                        type_map[this.priority_info.admin_link_type],
                },
            };
            this.$http
                .post("/switch_rstp?form=port", post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.modal_priority = false;
                        this.getPortData();
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
                })
                .catch((err) => {});
        },
        refreshPort() {
            debounce(this.getPortData, 1000, this);
        },
    },
    watch: {
        "bridge_info.max_age"() {
            if (
                this.bridge_info.max_age < 6 ||
                this.bridge_info.max_age > 40 ||
                isNaN(this.bridge_info.max_age)
            ) {
                this.verify_input.max_age = true;
            } else {
                this.verify_input.max_age = false;
            }
        },
        "bridge_info.hello_time"() {
            if (
                this.bridge_info.hello_time < 1 ||
                this.bridge_info.hello_time > 10 ||
                isNaN(this.bridge_info.hello_time)
            ) {
                this.verify_input.hello_time = true;
            } else {
                this.verify_input.hello_time = false;
            }
        },
        "bridge_info.forward_delay"() {
            if (
                this.bridge_info.forward_delay < 4 ||
                this.bridge_info.forward_delay > 30 ||
                isNaN(this.bridge_info.forward_delay)
            ) {
                this.verify_input.forward_delay = true;
            } else {
                this.verify_input.forward_delay = false;
            }
        },
        "bridge_info.transmit_hold_count"() {
            if (
                this.bridge_info.transmit_hold_count < 1 ||
                this.bridge_info.transmit_hold_count > 255 ||
                isNaN(this.bridge_info.transmit_hold_count)
            ) {
                this.verify_input.transmit_hold_count = true;
            } else {
                this.verify_input.transmit_hold_count = false;
            }
        },
        "priority_info.port_path_cost"() {
            if (
                this.priority_info.port_path_cost < 0 ||
                this.priority_info.port_path_cost > 200000000 ||
                isNaN(this.priority_info.port_path_cost)
            ) {
                this.verify_input.port_path_cost = true;
            } else {
                this.verify_input.port_path_cost = false;
            }
        },
        //  设置端口模态框内，检测到port_id变化时，实时更新页面数据
        "priority_info.port_id"() {
            const data = this.rstp_port.filter(
                (item) => item.port_id === this.priority_info.port_id
            )[0];
            if (data) {
                Object.keys(this.priority_info).forEach((key) => {
                    this.priority_info[key] = data[key];
                });
            }
        },
    },
};
</script>

<style lang="less" scoped>
div.rstp {
    > div {
        > span {
            display: inline-block;
            width: 150px;
            font-size: 18px;
            color: @titleColor;
        }
    }
    > ul {
        margin: 20px 0 20px 10px;
        li {
            height: 30px;
            line-height: 30px;
            border: 1px solid @borderColor;
            border-bottom: none;
            &:last-child {
                border-bottom: 1px solid @borderColor;
            }
            span {
                display: inline-block;
                width: 30%;
                text-indent: 20px;
                &:first-child {
                    border-right: 1px solid @borderColor;
                }
            }
        }
    }
    div.modal-dialog {
        margin: 0;
    }
    div.modal-body {
        width: 500px;
        height: 390px;
        background: @modalContentBgColor;
        h2 + div {
            margin-top: 10px;
        }
        > div.close {
            height: 60px;
            padding: 0;
        }
        > div {
            height: 36px;
            line-height: 36px;
            padding-left: 40px;
            &:first-child {
                margin-top: 30px;
            }
            > span {
                display: inline-block;
                width: 150px;
                &:last-child {
                    font-size: 14px;
                    color: @tipsColor;
                    width: 120px;
                }
            }
            select {
                width: 150px;
                height: 30px;
                font-size: 16px;
            }
            input {
                width: 150px;
                border-radius: 3px;
            }
            a {
                width: 120px;
                padding: 0;
                margin: 20px 0 0 60px;
            }
        }
    }
    div.modal-content {
        width: 520px;
        height: 350px;
        background: @modalContentBgColor;
        h2 + div {
            margin-top: 10px;
        }
        > div.close {
            height: 60px;
            padding: 0;
        }
        > div {
            height: 36px;
            line-height: 36px;
            padding-left: 40px;
            &:first-child {
                margin-top: 30px;
            }
            > span {
                display: inline-block;
                width: 150px;
                &:last-child {
                    font-size: 14px;
                    color: @tipsColor;
                    width: 140px;
                }
            }
            select {
                width: 150px;
                height: 30px;
                font-size: 16px;
            }
            input {
                width: 150px;
                border-radius: 3px;
            }
            a {
                padding: 0;
                width: 120px;
                margin: 20px 0 0 60px;
            }
        }
    }
}
</style>