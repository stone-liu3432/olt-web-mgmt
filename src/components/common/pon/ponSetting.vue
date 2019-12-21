<template>
    <div class="pon-setting">
        <h2>{{ lanMap['pon_setting'] }}</h2>
        <hr />
        <div v-if="pon_authorize.data && pon_authorize.data.length > 0">
            <h3>{{ lanMap['pon_auth'] }}</h3>
            <ul>
                <li>{{ lanMap['port_id'] }}</li>
                <li
                    v-for="(item,key) in pon_authorize.data[0]"
                    :key="key"
                    v-if="key !== 'port_id'"
                >{{ lanMap[key] }}</li>
                <li>{{ lanMap['config'] }}</li>
            </ul>
            <ul v-for="(item,key) in pon_authorize.data" :key="key">
                <li>{{ port_name.pon[item.port_id].name }}</li>
                <li>{{ def_auth_type[item.auth_type] }}</li>
                <li>{{ def_auth_mode[item.auth_mode] }}</li>
                <li>
                    <a
                        href="javascript:void(0);"
                        @click="auth_confirm(item.port_id)"
                    >{{ lanMap['config'] }}</a>
                </li>
            </ul>
        </div>
        <div v-else class="no-more-data">{{ lanMap['no_more_data'] }}</div>
        <div v-if="p2p && p2p.length">
            <h3>P2P</h3>
            <ul>
                <li>{{ lanMap['port_id'] }}</li>
                <li>{{ lanMap['status'] }}</li>
                <li>{{ lanMap['config'] }}</li>
            </ul>
            <ul v-for="(item,index) in p2p" :key="index">
                <li>{{ port_name.pon[item.port_id].name }}</li>
                <li>{{ item.flag === 1 ? lanMap['enable'] : lanMap['disable'] }}</li>
                <li v-if="item.flag === 1">
                    <a href="javascript:void(0);" @click="openP2PCfm(item)">{{ lanMap['off'] }}</a>
                </li>
                <li v-else>
                    <a href="javascript:void(0);" @click="openP2PCfm(item)">{{ lanMap['on'] }}</a>
                </li>
            </ul>
        </div>
        <!-- <span>
            {{ lanMap['port_isolation'] }}
            <div class="switch" @click="setPortIsolate">
                <input type="checkbox" v-model="port_isolate">
                <span :class="{ 'checked' : port_isolate }"></span>
            </div>
            <span class="tips">( {{ lanMap['pon_isolation_tips'] }} )</span>
        </span>-->
        <div class="modal-dialog" v-if="isSetAuth">
            <div class="cover"></div>
            <div class="ponmgmt-cfg">
                <div class="modal-header">{{ lanMap['pon_auth'] }}</div>
                <div>
                    <div>{{ lanMap['port_id'] }}</div>
                    <span>{{ port_id }}</span>
                </div>
                <div>
                    <div>{{ lanMap['auth_type'] }}</div>
                    <select v-model.number="auth_type">
                        <option value="0">Auto</option>
                        <option value="1">Manual</option>
                    </select>
                </div>
                <div>
                    <div>{{ lanMap['auth_mode'] }}</div>
                    <select v-model.number="auth_mode">
                        <option value="0">MAC</option>
                        <option value="1">LOID</option>
                        <option value="2">LOID+password</option>
                        <option value="3">Hybrid</option>
                    </select>
                </div>
                <div>
                    <a href="javascript:void(0);" @click="set_auth">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" @click="cancel_confirm">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="cancel_confirm"></div>
            </div>
        </div>
        <confirm :tool-tips="p2pMsg" @choose="setP2PStatus" v-if="isSetP2P"></confirm>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "ponSetting",
    computed: mapState(["lanMap", "port_name"]),
    data() {
        return {
            port_id: 0,
            auth_type: 0,
            auth_mode: 0,
            def_auth_type: ["Auto", "Manual"],
            def_auth_mode: ["mac", "LOID", "Loid+password", "hybrid"],
            pon_authorize: {},
            isSetAuth: false,
            isSetP2P: false,
            p2pCache: {},
            p2pMsg: "",
            p2p: [
                // {
                //     "port_id": 1,
                //     "flag": 1
                // },{
                //     "port_id": 2,
                //     "flag": 1
                // },{
                //     "port_id": 3,
                //     "flag": 1
                // },{
                //     "port_id": 4,
                //     "flag": 0
                // }
            ],
            port_isolate: 0,
            _timer: false
        };
    },
    created() {
        //this.getData();
    },
    activated() {
        this.getData();
        this.getP2PData();
        this.getPortIsolation();
    },
    methods: {
        getData() {
            this.$http
                .get("/ponmgmt?form=authorize")
                .then(res => {
                    if (res.data.code === 1) {
                        this.pon_authorize = res.data;
                    } else {
                        this.pon_authorize = {};
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        getP2PData() {
            this.$http
                .get("/ponmgmt?form=p2p")
                .then(res => {
                    if (res.data.code === 1) {
                        this.p2p = res.data.data;
                    } else {
                        this.p2p = [];
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        auth_confirm(port_id) {
            this.isSetAuth = true;
            this.port_id = port_id;
            this.pon_authorize.data.forEach(item => {
                if (item.port_id === port_id) {
                    this.auth_type = item.auth_type;
                    this.auth_mode = item.auth_mode;
                }
            });
        },
        set_auth() {
            var params = {
                method: "set",
                param: {
                    port_id: this.port_id,
                    auth_type: this.auth_type,
                    auth_mode: this.auth_mode
                }
            };
            this.$http
                .post("/ponmgmt?form=authorize", params)
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
            this.isSetAuth = false;
            this.port_id = 0;
        },
        cancel_confirm() {
            this.isSetAuth = false;
            this.port_id = 0;
            this.auth_type = 0;
            this.auth_mode = 0;
        },
        setP2PStatus(bool) {
            if (bool) {
                var post_data = {
                    method: "set",
                    param: {
                        port_id: this.p2pCache.port_id,
                        flag: this.p2pCache.flag ? 0 : 1
                    }
                };
                this.$http
                    .post("/ponmgmt?form=p2p", post_data)
                    .then(res => {
                        if (res.data.code === 1) {
                            this.$message({
                                type: res.data.type,
                                text: this.lanMap["setting_ok"]
                            });
                            this.getP2PData();
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
                        this.p2pCache = {};
                    })
                    .catch(err => {
                        // to do
                    });
            } else {
                this.p2pCache = {};
            }
            this.isSetP2P = false;
        },
        openP2PCfm(node) {
            this.p2pMsg =
                this.lanMap["if_sure"] +
                (node.flag ? this.lanMap["off"] : this.lanMap["on"]) +
                " " +
                this.port_name.pon[node.port_id].name +
                " P2P ?";
            this.isSetP2P = true;
            this.p2pCache = node;
        },
        getPortIsolation() {
            this.$http
                .get("/switch_isolate?form=isolate")
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.port_isolate = !!res.data.data.isolate_status;
                        }
                    }
                })
                .catch(err => {});
        },
        setPortIsolate() {
            if (this._timer) {
                this.$message({
                    type: "warning",
                    text: this.lanMap["click_often"]
                });
                return;
            }
            this._timer = true;
            this.$http
                .post("/switch_isolate?form=isolate", {
                    method: "set",
                    param: {
                        isolate_status: Number(!this.port_isolate)
                    }
                })
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: "success",
                            text: this.lanMap["st_success"]
                        });
                        this.getPortIsolation();
                    } else {
                        this.$message({
                            type: res.data.type,
                            text: `(${res.data.code}) ${res.data.message}`
                        });
                    }
                })
                .catch(err => {});
            setTimeout(_ => {
                this._timer = false;
            }, 1000);
        }
    }
};
</script>

<style lang="less" scoped>
div.pon-setting {
    margin-top: 20px;
    h2 {
        font-size: 24px;
        font-weight: 600;
        color: #67aef7;
        margin: 10px 0 20px 10px;
    }
    h3 {
        margin: 20px 0 20px 15px;
        font-size: 18px;
        font-weight: 500;
        color: #67aef7;
    }
    h3 + ul {
        margin: 0 0 0 10px;
        li {
            background: #2361a2;
            color: #fff;
        }
    }
    ul {
        margin: 0 0 0 10px;
    }
}
div.ponmgmt-cfg {
    width: 500px;
    height: 300px;
    border-radius: 10px;
    > div {
        margin: 20px;
        height: 30px;
        line-height: 30px;
        &:after {
            content: "";
            display: table;
            clear: both;
        }
        &:first-child {
            color: #67aef7;
            margin: 0;
            height: 60px;
            line-height: 60px;
        }
        > div {
            float: left;
            width: 200px;
            text-align: right;
            padding-right: 20px;
        }
        select {
            width: 150px;
            text-indent: 6px;
            border-radius: 5px;
            height: 30px;
            font-size: 15px;
            line-height: 30px;
        }
    }
    div.close {
        margin: 0;
        height: 60px;
    }
}
a {
    width: 120px;
    padding: 0;
    margin-left: 70px;
    margin-top: 20px;
}
ul {
    &:after {
        content: "";
        display: table;
        clear: both;
    }
    margin-left: 20px;
    &:last-child {
        > li {
            border-bottom: 1px solid #ccc;
        }
    }
    > li {
        float: left;
        width: 20%;
        text-align: center;
        height: 30px;
        line-height: 30px;
        border: 1px solid #ccc;
        border-right: none;
        border-bottom: none;
        &:last-child {
            border-right: 1px solid #ccc;
        }
        > a {
            margin: 0;
        }
    }
    a {
        height: 26px;
        line-height: 26px;
    }
}
div.no-more-data {
    color: red;
    margin: 20px;
}
div.switch {
    display: inline-block;
    margin: 20px 20px 20px 20px;
    vertical-align: sub;
    cursor: pointer;
    input {
        position: absolute;
        width: 0;
        height: 0;
        margin: 0;
        opacity: 0;
    }
    span {
        display: inline-block;
        position: relative;
        width: 40px;
        height: 20px;
        background: #666;
        border-radius: 10px;
        transition: all 0.3s linear;
        &::after {
            content: "";
            position: absolute;
            top: 2px;
            left: 2px;
            background: #fff;
            border-radius: 100%;
            width: 16px;
            height: 16px;
            transition: all 0.2s linear;
        }
    }
    span.checked {
        background: #13ce66;
        &::after {
            left: 22px;
        }
    }
    & + span {
        font-size: 15px;
        color: #333;
        margin-left: 30px;
    }
    & + span.tips {
        font-size: 14px;
        color: #666;
    }
}
</style>
