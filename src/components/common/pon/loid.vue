<template>
    <div class="loid-mgmt">
        <div>
            <h2>{{ lanMap["loid_mgmt"] }}</h2>
            <span>{{ lanMap["port_id"] }}</span>
            <select v-model="port_id">
                <option
                    v-for="(item, key) in port_name.pon"
                    :key="key"
                    :value="item.id"
                >
                    {{ item.name }}
                </option>
            </select>
        </div>
        <hr />
        <div>
            <a
                href="javascript:void(0);"
                style="margin-left: 10px"
                @click="openModal"
                >{{ lanMap["add"] }}</a
            >
            <a href="javascript:void(0);" @click="refreshData">{{
                lanMap["refresh"]
            }}</a>
            <template v-if="loid.length">
                <a href="javascript: void(0);" @click="submitBatchDelete">{{
                    lanMap["del_checked"]
                }}</a>
            </template>
        </div>
        <nms-table
            :rows="loid"
            border
            ref="loid-list"
            @selection-change="selecttionChange"
        >
            <nms-table-column type="selection"></nms-table-column>
            <nms-table-column
                label="ID"
                :formatter="formatterId"
            ></nms-table-column>
            <nms-table-column prop="used" :label="lanMap['used']">
                <template slot-scope="rows">{{
                    rows.used ? rows.mac : "False"
                }}</template>
            </nms-table-column>
            <nms-table-column prop="loid" label="LOID"></nms-table-column>
            <nms-table-column
                prop="password"
                :label="lanMap['password']"
            ></nms-table-column>
            <nms-table-column :label="lanMap['config']">
                <template slot-scope="rows">
                    <a
                        href="javascript: void(0);"
                        @click="deleteLoid(rows)"
                        class="btn-text"
                        >{{ lanMap["delete"] }}</a
                    >
                </template>
            </nms-table-column>
        </nms-table>
        <div class="modal-dilog" v-if="addModal">
            <div class="cover"></div>
            <div>
                <div class="modal-header">{{ lanMap["add"] + " LOID" }}</div>
                <div class="modal-item">
                    <span>{{ lanMap["port_id"] }}</span>
                    <select v-model="add_port">
                        <option
                            v-for="(item, key) in port_name.pon"
                            :key="key"
                            :value="item.id"
                        >
                            {{ item.name }}
                        </option>
                    </select>
                </div>
                <div class="modal-item">
                    <span>LOID</span>
                    <input
                        type="text"
                        v-model="add_loid"
                        :style="{
                            'border-color':
                                add_loid !== '' && !reg_loid.test(add_loid)
                                    ? 'red'
                                    : '',
                        }"
                    />
                    <span>{{ lanMap.composeRange(1, 22) }}</span>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap["count"] }}</span>
                    <input
                        type="text"
                        v-model.number="count"
                        :style="{
                            'border-color':
                                count >= 0 && count <= 64 ? '' : 'red',
                        }"
                    />
                    <span class="loid-tips">
                        <i class="icon-tips"></i>
                        <div class="modal-tips">
                            <p>{{ lanMap["loid_tips1"] }}</p>
                            <p>{{ lanMap["loid_tips2"] }}</p>
                            <p>{{ lanMap["loid_tips3"] }}</p>
                            <p>{{ lanMap["loid_tips4"] }}</p>
                        </div>
                    </span>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap["password"] }}</span>
                    <input
                        type="text"
                        v-model="add_pass"
                        :style="{
                            'border-color':
                                add_pass !== '' && !reg_pass.test(add_pass)
                                    ? 'red'
                                    : '',
                        }"
                    />
                    <span>{{ lanMap.composeRange(0, 12) }}</span>
                </div>
                <div>
                    <a href="javascript:void(0);" @click="submitAdd">{{
                        lanMap["apply"]
                    }}</a>
                    <a href="javascript:void(0);" @click="closeModal">{{
                        lanMap["cancel"]
                    }}</a>
                </div>
                <div class="close" @click="closeModal"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { debounce } from "@/utils/common";
export default {
    name: "loid",
    computed: { ...mapState(["lanMap", "port_name"]) },
    data() {
        return {
            loid: [],
            port_id: 1,
            post_data: {},
            addModal: false,
            add_port: 1,
            add_loid: "",
            add_pass: "",
            count: 1,
            reg_loid: /^\w{1,22}$/,
            reg_pass: /^\w{1,12}$/,
            batch_onulist: [],
        };
    },
    created() {
        this.port_id = sessionStorage.getItem("pid") || 1;
        this.getData();
    },
    methods: {
        deleteLoid(item) {
            const post_data = {
                method: "delete",
                param: {
                    port_id: this.port_id,
                    loid: [item.loid],
                },
            };
            this.$confirm(this.lanMap["if_sure"])
                .then((_) => {
                    this.submitDel(post_data);
                })
                .catch((_) => {});
        },
        getData() {
            this.loid = [];
            this.$http
                .get("/ponmgmt?form=loidlist&port_id=" + this.port_id)
                .then((res) => {
                    if (res.data.code === 1) {
                        if (res.data.data && res.data.data.length) {
                            this.loid = res.data.data;
                        }
                    }
                })
                .catch((err) => {});
        },
        submitDel(data, flag) {
            this.$http
                .post("/ponmgmt?form=loidlist", data)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: "success",
                            text:
                                this.lanMap["delete"] +
                                this.lanMap["st_success"],
                        });
                        this.getData();
                    } else {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message,
                        });
                    }
                    if (flag === "batch") {
                        this.$refs["loid-list"].clearSelection();
                    }
                })
                .catch((err) => {});
        },
        openModal() {
            this.addModal = true;
        },
        closeModal() {
            this.addModal = false;
            this.add_port = 1;
            this.add_loid = "";
            this.add_pass = "";
            this.count = 1;
        },
        submitAdd() {
            if (!this.reg_loid.test(this.add_loid)) {
                this.$message({
                    type: "error",
                    text: this.lanMap["param_error"] + ": LOID",
                });
                return;
            }
            if (this.add_pass !== "" && !this.reg_pass.test(this.add_pass)) {
                this.$message({
                    type: "error",
                    text:
                        this.lanMap["param_error"] +
                        ": " +
                        this.lanMap["password"],
                });
                return;
            }
            if (this.count < 0 || this.count > 64 || isNaN(this.count)) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["count"]}`
                );
            }
            var post_data = {
                method: "add",
                param: {
                    port_id: this.add_port,
                    loid: this.add_loid,
                    password: this.add_pass,
                    count: Number(this.count) || 1,
                },
            };
            this.$http
                .post("/ponmgmt?form=loidlist", post_data)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: "success",
                            text:
                                this.lanMap["add"] + this.lanMap["st_success"],
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
        refreshData() {
            debounce(this.getData, 1000, this);
        },
        formatterId(row, colIndex, col, rowIndex) {
            return ++rowIndex;
        },
        selecttionChange(selections) {
            this.batch_onulist = selections;
        },
        submitBatchDelete() {
            if (!this.batch_onulist.length) {
                return this.$message.error(this.lanMap["modify_tips"]);
            }
            this.$confirm(this.lanMap["if_sure"] + this.lanMap["delete"] + " ?")
                .then(() => {
                    const post_params = {
                        method: "delete",
                        param: {
                            port_id: this.port_id,
                            loid: this.batch_onulist.map((item) => item.loid),
                        },
                    };
                    this.submitDel(post_params, "batch");
                })
                .catch(() => {});
        },
    },
    watch: {
        port_id() {
            sessionStorage.setItem("pid", this.port_id);
            this.getData();
        },
    },
};
</script>

<style lang="less" scoped>
div.loid-mgmt {
    margin: 20px 0 0 0;
    > div:first-child {
        height: 30px;
        line-height: 30px;
    }
    h2 {
        float: left;
        width: 300px;
        font-size: 24px;
        font-weight: 600;
        color: #67aef7;
    }
}
hr {
    margin: 20px 0;
}
a + a {
    margin-left: 30px;
}
select {
    width: 160px;
    height: 30px;
    font-size: 16px;
    border-radius: 3px;
    text-indent: 10px;
    margin-left: 6px;
}
.small-btn {
    user-select: none;
    color: #67aef6;
    transition: all 0.2s linear;
    cursor: pointer;
    &:hover {
        color: #007acc;
    }
    &:active {
        color: #67aef6;
    }
}
div.cover + div {
    height: 280px;
    > div {
        > span {
            &:first-child {
                display: inline-block;
                width: 120px;
                text-align: center;
            }
        }
        a {
            margin: 8px 0 0 105px;
        }
        select {
            margin: 0;
            width: 197px;
        }
        input + span {
            color: #666;
            font-size: 14px;
            margin: 0 0 0 6px;
            position: relative;
        }
    }
    .modal-item {
        height: 30px;
        line-height: 30px;
        margin: 10px 0;
    }
}
span.loid-tips {
    display: inline-block;
    width: 32px;
    height: 32px;
    vertical-align: middle;
    &:hover {
        & > div.modal-tips {
            display: block;
        }
    }
}
i.icon-tips {
    display: inline-block;
    width: 32px;
    height: 32px;
    vertical-align: middle;
    background: url("../../../assets/tips.png");
}
div.modal-tips {
    display: none;
    position: absolute;
    left: 30px;
    top: 28px;
    width: 300px;
    padding: 6px 12px;
    background: @modalContentBgColor;
    border-radius: 5px;
    z-index: 1002;
    box-shadow: 0px 0px 5px @borderColor;
    border: 1px solid @borderColor;
    p {
        line-height: 20px;
        margin: 12px 0;
    }
}
</style>
