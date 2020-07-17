<template>
    <div class="onu-deny">
        <div>
            <h2>{{ lanMap['onu_deny'] }}</h2>
            <span>{{ lanMap['port_id'] }}</span>
            <select v-model.number="portid">
                <option
                    v-for="(item,key) in port_name.pon"
                    :key="key"
                    :value="item.id"
                >{{ item.name }}</option>
            </select>
        </div>
        <hr />
        <div class="add-deny">
            <div class="tool-tips">
                <i></i>
                <div>
                    <div>
                        <p>{{ lanMap['add'] }}</p>
                        <p>{{ lanMap['onudeny_add_tips'] }}</p>
                    </div>
                    <div>
                        <p>{{ lanMap['delete'] }}</p>
                        <p>
                            {{ lanMap['click'] }}
                            <i class="icon-delete"></i>
                            {{ lanMap['onudeny_del_tips'] }}
                        </p>
                    </div>
                </div>
            </div>
            <div>
                <a href="javascript: void(0);" @click="deleChecked">{{ lanMap['del_checked'] }}</a>
                <a href="javascript:;" @click="add">{{ lanMap['add'] }}</a>
            </div>
        </div>
        <div class="add-item" v-if="addItem.isShow">
            <span>{{ lanMap['macaddr'] }}</span>
            <input
                type="text"
                v-model="addItem.macaddr"
                :style="{ 'border-color': test_macaddr ? 'red' : '' }"
                v-focus
            />
            <span>{{ lanMap['desc'] }}</span>
            <input type="text" v-model="addItem.desc" />
            <span>
                <a href="javascript:;" @click="handle(true)">{{ lanMap['apply'] }}</a>
            </span>
            <span>
                <a href="javascript:;" @click="handle(false)">{{ lanMap['cancel'] }}</a>
            </span>
        </div>
        <nms-table :rows="onu_deny_list" border @selection-change="selectionChange">
            <nms-table-column type="selection"></nms-table-column>
            <nms-table-column :label="lanMap['onu_id']">
                <template slot-scope="rows">{{ 'ONU0'+rows.port_id +'/'+ rows.onu_id }}</template>
            </nms-table-column>
            <nms-table-column prop="onu_name" :label="lanMap['onu_name']"></nms-table-column>
            <nms-table-column prop="macaddr" :label="lanMap['macaddr']"></nms-table-column>
            <nms-table-column prop="retry" :label="lanMap['retry']"></nms-table-column>
            <nms-table-column prop="reason" :label="lanMap['reason']"></nms-table-column>
            <nms-table-column :label="lanMap['config']" width="100px">
                <template slot-scope="rows">
                    <a
                        href="javascript: void(0);"
                        class="btn-text"
                        style="width: auto; margin-left: 0; height: auto; line-height: initial;"
                        @click="deleteOnuDeny(rows.port_id, rows.onu_id, rows.macaddr)"
                    >{{ lanMap['delete'] }}</a>
                </template>
            </nms-table-column>
        </nms-table>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "onuDeny",
    computed: mapState(["lanMap", "port_name", "change_url"]),
    data() {
        return {
            onu_deny_list: [],
            portid: 0,
            test_macaddr: false,
            addItem: {
                isShow: false,
                desc: "",
                macaddr: ""
            },
            selections: []
        };
    },
    activated() {
        this.getData();
    },
    created() {
        var pid = sessionStorage.getItem("pid");
        this.portid = Number(pid) || 1;
        if (this.change_url.beta === "test") {
            this.$http
                .get("./simulation_data/onu_deny_list.json")
                .then(res => {
                    this.onu_deny_list = res.data.data;
                })
                .catch(err => {
                    // to do
                });
        }
    },
    methods: {
        getData() {
            this.onu_deny_list = [];
            this.$http
                .get("/onu_deny_list?port_id=" + this.portid)
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data && res.data.data.length) {
                            this.onu_deny_list = res.data.data;
                        }
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        //  点击 确认/取消 时进行的操作   -->  增加按钮
        handle(bool) {
            if (bool) {
                if (this.test_macaddr || this.addItem.macaddr === "") {
                    this.$message({
                        type: "error",
                        text: this.lanMap["param_mac"]
                    });
                    return;
                }
                const post_param = {
                    method: "add",
                    param: {
                        port_id: Number(this.portid),
                        macaddr: this.addItem.macaddr,
                        reason: this.addItem.desc
                    }
                };
                this.$http
                    .post("/onu_deny_list?form=onucfg", post_param)
                    .then(res => {
                        if (res.data.code === 1) {
                            this.$message({
                                type: res.data.type,
                                text:
                                    this.lanMap["add"] +
                                    this.lanMap["st_success"]
                            });
                            this.getData();
                        } else if (res.data.code > 1) {
                            this.$message({
                                type: res.data.type,
                                text:
                                    "(" +
                                    res.data.code +
                                    ") " +
                                    res.data.message
                            });
                        }
                    })
                    .catch(err => {
                        // to do
                    });
            }
            this.addItem.isShow = false;
        },
        //  点击添加按钮时，显示添加模板
        add() {
            this.addItem.isShow = !this.addItem.isShow;
            this.addItem.macaddr = "";
            this.addItem.desc = "";
        },
        // 根据确认框返回结果，进行操作  -->  删除按钮
        result(data) {
            // 确认框中用户点击确认时的操作
            this.$http
                .post("/onu_deny_list?form=onucfg", data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text:
                                this.lanMap["delete"] +
                                this.lanMap["st_success"]
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
        },
        // 用户点击删除按钮时，弹出确认框
        deleteOnuDeny(port_id, onu_id, macaddr) {
            const post_param = {
                method: "delete",
                param: {
                    port_id,
                    onu_id,
                    macaddr
                }
            };
            this.$confirm(this.lanMap["confirm_del_deny"])
                .then(_ => {
                    this.result(post_param);
                })
                .catch(_ => {});
        },
        selectionChange(selections) {
            this.selections = selections;
        },
        deleChecked() {
            if (!this.selections.length) {
                return this.$message.info(this.lanMap["modify_tips"]);
            }
            this.$confirm(
                this.lanMap["if_sure"] + this.lanMap["del_checked"] + " ONU"
            )
                .then(_ => {
                    const onu_id = this.selections.map(item => item.onu_id);
                    onu_id.sort((a, b) => a - b);
                    this.$http
                        .post("/onu_deny_list?form=batch", {
                            method: "delete",
                            param: {
                                port_id: this.portid,
                                onu_id
                            }
                        })
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["delete"] +
                                        this.lanMap["st_success"]
                                );
                                this.getData();
                                this.selections = [];
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
        "addItem.macaddr"() {
            var reg = /^([0-9abcdefABCDEF]{2}\:){5}[0-9abcdefABCDEF]{2}$/;
            if (this.addItem.macaddr === "") {
                this.test_macaddr = false;
                return;
            }
            if (!reg.test(this.addItem.macaddr)) {
                this.test_macaddr = true;
            } else {
                this.test_macaddr = false;
            }
        },
        //  切换端口的操作
        portid() {
            sessionStorage.setItem("pid", Number(this.portid));
            this.getData();
        }
    }
};
</script>

<style scoped lang="less">
h2 {
    font-size: 24px;
    font-weight: 600;
    color: #67aef7;
}
hr {
    margin: 20px 0;
}
.onu-deny {
    margin-top: 20px;
    > div:first-child {
        height: 30px;
        line-height: 30px;
        h2 {
            float: left;
            width: 300px;
        }
    }
}
div.add-deny {
    height: 36px;
    line-height: 36px;
    > div {
        float: right;
    }
    &:after {
        content: "";
        display: table;
        clear: both;
    }
}
.add-item {
    height: 40px;
    min-width: 1060px;
    margin-top: 10px;
    border: 1px solid #ddd;
    line-height: 40px;
    vertical-align: middle;
    line-height: 40px;
    input {
        width: 23%;
    }
}
.bg-title {
    background: #2361a2;
    color: #fff;
}
.add-item > span {
    width: 12%;
    line-height: 32px;
    display: inline-block;
    height: 32px;
    text-align: center;
    font-size: 16px;
}
ul {
    border: 1px solid #ddd;
    margin: 20px 0 0 10px;
    min-width: 1020px;
}
ul > li {
    font-size: 0;
    padding: 8px 0;
    border-bottom: 1px solid #ddd;
    vertical-align: middle;
}
ul > li:last-child {
    border-bottom: none;
}
ul + div {
    margin-left: 30px;
}
ul span {
    word-break: break-all;
    white-space: normal;
    display: inline-block;
    vertical-align: middle;
    width: 20%;
    text-align: center;
    font-size: 16px;
}
select {
    width: 160px;
    height: 30px;
    font-size: 16px;
    border-radius: 3px;
    text-indent: 10px;
    margin-left: 6px;
}
select + a {
    margin-left: 60px;
}
a {
    width: 120px;
    height: 30px;
    line-height: 30px;
    padding: 0;
    margin-left: 10px;
}
.inline-btn {
    height: 26px;
    line-height: 26px;
}
i.icon-delete {
    display: inline-block;
    cursor: pointer;
    width: 32px;
    height: 32px;
    vertical-align: middle;
    background: url("../../../assets/delete-normal.png") no-repeat;
}
div.data-failed {
    margin: 20px 10px;
    color: red;
}
div.tool-tips {
    margin: 0 0 0 20px;
    display: inline-block;
    position: relative;
    height: 36px;
    line-height: 36px;
    &:hover > div {
        display: block;
    }
    > i {
        display: inline-block;
        width: 32px;
        height: 32px;
        cursor: pointer;
        vertical-align: middle;
        background: url("../../../assets/tips.png") no-repeat;
    }
    > div {
        display: none;
        width: 300px;
        height: 200px;
        position: absolute;
        right: 26px;
        top: 26px;
        border-radius: 10px;
        padding: 8px;
        background: #ddd;
        > div {
            padding: 5px 0;
            &:first-child {
                border-bottom: 1px solid #333;
            }
            > p {
                color: #333;
                line-height: 20px;
                font-size: 14px;
                &:first-child {
                    color: #67aef7;
                    padding: 5px;
                }
            }
        }
    }
}
</style>