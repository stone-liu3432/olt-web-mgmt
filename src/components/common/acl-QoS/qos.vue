<template>
    <div class="qos">
        <h3>QoS</h3>
        <div v-if="qos.data">
            <div v-if="qos.data.cmode">
                <span>{{ lanMap["mode"] }}:</span>
                <span>{{ qos.data.cmode }}</span>
            </div>
            <div class="qos-title">
                <h4>{{ lanMap["priority"] }}</h4>
                <a href="javascript:void(0);" @click="openModal('priority')">
                    {{ lanMap["config"] }}
                </a>
            </div>
            <div>
                <div
                    v-for="(item, index) in qos.data.cosq"
                    :key="index"
                    v-if="qos.data.cosq"
                >
                    <span>{{ lanMap["queue"] }}</span>
                    <span>
                        {{ index }}
                    </span>
                    <span>{{ lanMap["priority"] }}:</span>
                    <span>
                        {{ item }}
                    </span>
                </div>
            </div>
            <div class="qos-title">
                <h4>{{ lanMap["queue_scheduler"] }}</h4>
                <a href="javascript:void(0);" @click="openModal('queue')">
                    {{ lanMap["config"] }}
                </a>
            </div>
            <div>
                <div
                    v-for="(item, key) in qos.data.queue"
                    :key="key + 10"
                    v-if="qos.data.queue"
                >
                    <span>{{ lanMap["cos"] }}</span>
                    <span>
                        {{ item.cos }}
                    </span>
                    <span>{{ lanMap["mode"] }}</span>
                    <span>
                        {{ item.mode }}
                    </span>
                    <span>{{ lanMap["weight"] }}</span>
                    <span>
                        {{ item.weight }}
                    </span>
                </div>
            </div>
        </div>
        <div class="modal-dialog" v-if="!!showModal">
            <div class="cover"></div>
            <div
                class="priority-modal"
                :style="{
                    height:
                        showModal === 'queue'
                            ? flag === 1
                                ? '160px'
                                : '240px'
                            : '',
                }"
            >
                <div>
                    <h4 class="modal-header" v-if="showModal === 'priority'">
                        {{ lanMap["priority"] }}
                    </h4>
                    <h4 class="modal-header" v-if="showModal === 'queue'">
                        {{ lanMap["weight"] }}
                    </h4>
                    <div class="modal-col" v-if="showModal === 'queue'">
                        <span>{{ lanMap["mode"] }}</span>
                        <select v-model.number="flag">
                            <option value="1">strict-priority</option>
                            <option value="2">WRR</option>
                        </select>
                    </div>
                    <div
                        class="modal-col"
                        v-if="
                            (showModal === 'queue' && flag === 2) ||
                            showModal === 'priority'
                        "
                    >
                        <span v-if="showModal === 'priority'">
                            {{ lanMap["queue"] }}
                        </span>
                        <span v-if="showModal === 'queue'">
                            {{ lanMap["cos"] }}
                        </span>
                        <span>0</span>
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                        <span>6</span>
                        <span>7</span>
                    </div>
                    <div class="modal-col" v-if="showModal === 'priority'">
                        <span>{{ lanMap["priority"] }}</span>
                        <input
                            type="text"
                            v-focus
                            maxlength="1"
                            v-model.number="queue0"
                            :style="{
                                'border-color':
                                    queue0 !== '' &&
                                    (isNaN(queue0) || queue0 > 7)
                                        ? 'red'
                                        : '',
                            }"
                        />
                        <input
                            type="text"
                            maxlength="1"
                            v-model.number="queue1"
                            :style="{
                                'border-color':
                                    queue1 !== '' &&
                                    (isNaN(queue1) || queue1 > 7)
                                        ? 'red'
                                        : '',
                            }"
                        />
                        <input
                            type="text"
                            maxlength="1"
                            v-model.number="queue2"
                            :style="{
                                'border-color':
                                    queue2 !== '' &&
                                    (isNaN(queue2) || queue2 > 7)
                                        ? 'red'
                                        : '',
                            }"
                        />
                        <input
                            type="text"
                            maxlength="1"
                            v-model.number="queue3"
                            :style="{
                                'border-color':
                                    queue3 !== '' &&
                                    (isNaN(queue3) || queue3 > 7)
                                        ? 'red'
                                        : '',
                            }"
                        />
                        <input
                            type="text"
                            maxlength="1"
                            v-model.number="queue4"
                            :style="{
                                'border-color':
                                    queue4 !== '' &&
                                    (isNaN(queue4) || queue4 > 7)
                                        ? 'red'
                                        : '',
                            }"
                        />
                        <input
                            type="text"
                            maxlength="1"
                            v-model.number="queue5"
                            :style="{
                                'border-color':
                                    queue5 !== '' &&
                                    (isNaN(queue5) || queue5 > 7)
                                        ? 'red'
                                        : '',
                            }"
                        />
                        <input
                            type="text"
                            maxlength="1"
                            v-model.number="queue6"
                            :style="{
                                'border-color':
                                    queue6 !== '' &&
                                    (isNaN(queue6) || queue6 > 7)
                                        ? 'red'
                                        : '',
                            }"
                        />
                        <input
                            type="text"
                            maxlength="1"
                            v-model.number="queue7"
                            :style="{
                                'border-color':
                                    queue7 !== '' &&
                                    (isNaN(queue7) || queue7 > 7)
                                        ? 'red'
                                        : '',
                            }"
                        />
                        <span class="priority-tips">Range: 0 - 7 </span>
                    </div>
                    <div
                        class="modal-col"
                        v-if="showModal === 'queue' && flag === 2"
                    >
                        <span>{{ lanMap["weight"] }}</span>
                        <input
                            type="text"
                            maxlength="3"
                            v-model.number="wrr0"
                            :style="{
                                'border-color':
                                    wrr0 !== '' && (isNaN(wrr0) || wrr0 > 100)
                                        ? 'red'
                                        : '',
                            }"
                        />
                        <input
                            type="text"
                            maxlength="3"
                            v-model.number="wrr1"
                            :style="{
                                'border-color':
                                    wrr1 !== '' && (isNaN(wrr1) || wrr1 > 100)
                                        ? 'red'
                                        : '',
                            }"
                        />
                        <input
                            type="text"
                            maxlength="3"
                            v-model.number="wrr2"
                            :style="{
                                'border-color':
                                    wrr2 !== '' && (isNaN(wrr2) || wrr2 > 100)
                                        ? 'red'
                                        : '',
                            }"
                        />
                        <input
                            type="text"
                            maxlength="3"
                            v-model.number="wrr3"
                            :style="{
                                'border-color':
                                    wrr3 !== '' && (isNaN(wrr3) || wrr3 > 100)
                                        ? 'red'
                                        : '',
                            }"
                        />
                        <input
                            type="text"
                            maxlength="3"
                            v-model.number="wrr4"
                            :style="{
                                'border-color':
                                    wrr4 !== '' && (isNaN(wrr4) || wrr4 > 100)
                                        ? 'red'
                                        : '',
                            }"
                        />
                        <input
                            type="text"
                            maxlength="3"
                            v-model.number="wrr5"
                            :style="{
                                'border-color':
                                    wrr5 !== '' && (isNaN(wrr5) || wrr5 > 100)
                                        ? 'red'
                                        : '',
                            }"
                        />
                        <input
                            type="text"
                            maxlength="3"
                            v-model.number="wrr6"
                            :style="{
                                'border-color':
                                    wrr6 !== '' && (isNaN(wrr6) || wrr6 > 100)
                                        ? 'red'
                                        : '',
                            }"
                        />
                        <input
                            type="text"
                            maxlength="3"
                            v-model.number="wrr7"
                            :style="{
                                'border-color':
                                    wrr7 !== '' && (isNaN(wrr7) || wrr7 > 100)
                                        ? 'red'
                                        : '',
                            }"
                        />
                        <span class="priority-tips"></span>
                    </div>
                    <div>
                        <a
                            href="javascript:void(0);"
                            v-if="showModal === 'queue'"
                            @click="modifyQueue"
                        >
                            {{ lanMap["apply"] }}
                        </a>
                        <a
                            href="javascript:void(0);"
                            @click="modifyPriority"
                            v-if="showModal === 'priority'"
                        >
                            {{ lanMap["apply"] }}
                        </a>
                        <a href="javascript:void(0);" @click="closeModal">
                            {{ lanMap["cancel"] }}
                        </a>
                    </div>
                </div>
                <div class="close" @click="closeModal"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "qos",
    computed: mapState(["change_url", "lanMap"]),
    data() {
        return {
            qos: {},
            showModal: "",
            queue0: "",
            queue1: "",
            queue2: "",
            queue3: "",
            queue4: "",
            queue5: "",
            queue6: "",
            queue7: "",
            wrr0: "",
            wrr1: "",
            wrr2: "",
            wrr3: "",
            wrr4: "",
            wrr5: "",
            wrr6: "",
            wrr7: "",
            flag: 1,
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.$http
                .get(this.change_url.get_qos)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.qos = res.data;
                    } else {
                        this.qos = {};
                    }
                })
                .catch((err) => {});
        },
        openModal(str) {
            this.showModal = str;
            if (str === "priority") {
                var pri = this.qos.data.cosq || [];
                pri.forEach((item, index, arr) => {
                    this["queue" + index] = item;
                });
            }
        },
        closeModal() {
            this.queue0 = "";
            this.queue1 = "";
            this.queue2 = "";
            this.queue3 = "";
            this.queue4 = "";
            this.queue5 = "";
            this.queue6 = "";
            this.queue7 = "";
            this.wrr0 = "";
            this.wrr1 = "";
            this.wrr2 = "";
            this.wrr3 = "";
            this.wrr4 = "";
            this.wrr5 = "";
            this.wrr6 = "";
            this.wrr7 = "";
            this.flag = 1;
            this.showModal = "";
        },
        modifyPriority() {
            if (
                (!this.queue0 && this.queue0 !== 0) ||
                this.queue0 > 7 ||
                isNaN(this.queue0)
            ) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["queue"],
                });
                return;
            }
            if (
                (!this.queue1 && this.queue1 !== 0) ||
                this.queue1 > 7 ||
                isNaN(this.queue1)
            ) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["queue"],
                });
                return;
            }
            if (
                (!this.queue2 && this.queue2 !== 0) ||
                this.queue2 > 7 ||
                isNaN(this.queue2)
            ) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["queue"],
                });
                return;
            }
            if (
                (!this.queue3 && this.queue3 !== 0) ||
                this.queue3 > 7 ||
                isNaN(this.queue3)
            ) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["queue"],
                });
                return;
            }
            if (
                (!this.queue4 && this.queue4 !== 0) ||
                this.queue4 > 7 ||
                isNaN(this.queue4)
            ) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["queue"],
                });
                return;
            }
            if (
                (!this.queue5 && this.queue5 !== 0) ||
                this.queue5 > 7 ||
                isNaN(this.queue5)
            ) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["queue"],
                });
                return;
            }
            if (
                (!this.queue6 && this.queue6 !== 0) ||
                this.queue6 > 7 ||
                isNaN(this.queue6)
            ) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["queue"],
                });
                return;
            }
            if (
                (!this.queue7 && this.queue7 !== 0) ||
                this.queue7 > 7 ||
                isNaN(this.queue7)
            ) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["queue"],
                });
                return;
            }
            var post_data = {
                method: "set",
                param: {
                    priority: [
                        this.queue0,
                        this.queue1,
                        this.queue2,
                        this.queue3,
                        this.queue4,
                        this.queue5,
                        this.queue6,
                        this.queue7,
                    ],
                },
            };
            this.$http
                .post("/switch_qos?form=cosqmap", post_data)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"],
                        });
                        this.getData();
                    } else {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message,
                        });
                    }
                })
                .catch((err) => {});
            this.closeModal();
        },
        modifyQueue() {
            if (
                this.flag === 2 &&
                (isNaN(this.wrr0) ||
                    isNaN(this.wrr1) ||
                    isNaN(this.wrr2) ||
                    isNaN(this.wrr3) ||
                    isNaN(this.wrr4) ||
                    isNaN(this.wrr5) ||
                    isNaN(this.wrr6) ||
                    isNaN(this.wrr7))
            ) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["weight"],
                });
                return;
            }
            var post_data = {
                method: "set",
                param: {
                    flag: this.flag,
                    wrr: [
                        this.wrr0 || 0,
                        this.wrr1 || 0,
                        this.wrr2 || 0,
                        this.wrr3 || 0,
                        this.wrr4 || 0,
                        this.wrr5 || 0,
                        this.wrr6 || 0,
                        this.wrr7 || 0,
                    ],
                },
            };
            this.$http
                .post("switch_qos?form=queue-scheduler", post_data)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"],
                        });
                        this.getData();
                    } else {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message,
                        });
                    }
                })
                .catch((err) => {});
            this.closeModal();
        },
    },
    watch: {
        flag() {
            if (this.showModal === "queue" && this.flag === 2) {
                var queue = this.qos.data.queue || [];
                queue.forEach((item, index, arr) => {
                    this["wrr" + index] = item.weight;
                });
            }
        },
    },
};
</script>

<style lang="less" scoped>
h3 {
    font-size: 24px;
    font-weight: 600;
    color: #67aef7;
    margin: 10px 0 20px 0;
}
h3 + div {
    > div {
        margin: 10px 0 10px 10px;
        border: 1px solid #ddd;
        &:first-child {
            height: 30px;
            line-height: 30px;
            border: none;
        }
        > div {
            height: 30px;
            line-height: 30px;
            border-bottom: 1px solid #ddd;
            padding-left: 10px;
            &:last-child {
                border-bottom: none;
            }
            > span {
                display: inline-block;
                width: 10%;
            }
        }
        h4 {
            float: left;
        }
    }
    .qos-title {
        height: 30px;
        line-height: 30px;
        border: none;
        a {
            margin-left: 30px;
        }
    }
}
div.priority-modal {
    height: 200px;
    > div {
        div.modal-col {
            height: 30px;
            line-height: 30px;
            margin: 8px 0 0 0;
            > span {
                display: inline-block;
                width: 32px;
                text-align: center;
                &:first-child {
                    width: 110px;
                }
            }
            > input {
                width: 30px;
                text-indent: 0;
                text-align: center;
            }
            select {
                width: 160px;
            }
            span.priority-tips {
                width: auto;
                margin: 0 0 0 6px;
                font-size: 14px;
                color: #333;
            }
        }
        a {
            margin: 16px 0 0 100px;
        }
    }
}
</style>
