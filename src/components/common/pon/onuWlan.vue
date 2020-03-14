<template>
    <div>
        <h2>
            WLAN
            <a
                href="javascript: void(0);"
                style="margin: 0 0 0 50px;"
                @click="clearWlan"
            >{{ lanMap['clear'] }}</a>
            <span class="tips">{{ lanMap['clear_wlan_tips'] }}</span>
        </h2>
        <div>
            <div class="wlan-row">
                <span>WLAN {{ lanMap['mode'] }}</span>
                <span>
                    <label>
                        <input type="radio" v-model.number="wlan_mode" value="1" />
                        2.4G
                    </label>
                    <label v-if="wlanInfo.wlan === 2" style="margin-left: 12px;">
                        <input type="radio" v-model.number="wlan_mode" value="2" />
                        5G
                    </label>
                </span>
            </div>
            <div class="wlan-row">
                <span>{{ lanMap['encrypt'] }}</span>
                <select v-model.number="wlan_encrypt">
                    <option :value="0">None</option>
                    <!-- <option value="1">WEP</option> -->
                    <option :value="4">WPA2</option>
                    <option :value="6">WPA2Mixed</option>
                </select>
            </div>
            <div class="wlan-row">
                <span>SSID:</span>
                <input
                    type="text"
                    v-model="ssid"
                    :style="{ 'border-color': ssid !== '' && !valid_ssid ? 'red' : '' }"
                />
                <span class="tips">{{ lanMap.composeRange(4, 32) }}</span>
            </div>
            <div class="wlan-row">
                <span>{{ lanMap['password'] }}</span>
                <input
                    type="text"
                    v-model="password"
                    :style="{ 'border-color': password !== '' && !valid_password ? 'red' : '' }"
                    :disabled="wlan_encrypt === 0"
                />
                <span class="tips">{{ lanMap.composeRange(8, 32) }}</span>
            </div>
            <div>
                <a href="javascript: void(0);" @click="submitWlan">{{ lanMap['apply'] }}</a>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
const WLAN_KEY = {
    1: { encrypt: "encrypt", ssid: "ssid", password: "password" },
    2: { encrypt: "encrypt_5g", ssid: "ssid_5g", password: "password_5g" }
};
export default {
    name: "onuWan",
    data() {
        // ssid最大32个字符，password最大32个字符，encrypt为WEP时，最小5个字符，其他最小8个字符
        return {
            wlanInfo: {
                port_id: 1,
                onu_id: 2,
                wlan: 2,
                // mode: 1,
                encrypt: 0,
                ssid: "1234",
                password: "12345678",
                // mode_5g: 1,
                encrypt_5g: 6,
                ssid_5g: "1",
                password_5g: "12345678"
            },
            // mode: 1-2.4G  2-5G
            wlan_mode: 1,
            wlan_encrypt: 0,
            ssid: "",
            password: ""
        };
    },
    computed: {
        ...mapState(["lanMap"]),
        portid() {
            return this.portData.portid;
        },
        onuid() {
            return this.portData.onuid;
        },
        valid_ssid() {
            const reg = /^\w{4,32}|[\u4e00-\u9fa5\w\-]{2,16}$/;
            return reg.test(this.ssid);
        },
        valid_password() {
            if (this.wlan_encrypt === 0) {
                return true;
            }
            const reg = /^.{8,32}$/;
            return reg.test(this.password);
        }
    },
    props: {
        portData: {
            type: Object,
            required: true
        }
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.wlanInfo = {};
            this.$http
                .get("/onumgmt", {
                    params: {
                        form: "wlan",
                        port_id: this.portid,
                        onu_id: this.onuid
                    }
                })
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.wlanInfo = res.data.data;
                            this.showVal();
                        }
                    }
                })
                .catch(err => {});
        },
        submitWlan() {
            if (this.validData()) {
                this.$confirm(this.lanMap["if_sure"])
                    .then(_ => {
                        const data = this.composeData();
                        this.postData(data);
                    })
                    .catch(_ => {});
            }
        },
        showVal() {
            if (Object.keys(this.wlanInfo).length) {
                this.wlan_encrypt = this.wlanInfo[
                    WLAN_KEY[this.wlan_mode]["encrypt"]
                ];
                this.ssid = this.wlanInfo[WLAN_KEY[this.wlan_mode]["ssid"]];
                this.password = this.wlanInfo[
                    WLAN_KEY[this.wlan_mode]["password"]
                ];
            }
        },
        validData() {
            const { encrypt, ssid, password } = WLAN_KEY[this.wlan_mode];
            if (
                this.wlan_encrypt === this.wlanInfo[encrypt] &&
                this.ssid === this.wlanInfo[ssid] &&
                this.password === this.wlanInfo[password]
            ) {
                this.$message.info(this.lanMap["modify_tips"]);
                return false;
            }
            if (!this.valid_ssid) {
                this.$message.error(`${this.lanMap["param_error"]}: SSID`);
                return false;
            }
            if (!this.valid_password) {
                this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["password"]}`
                );
                return false;
            }
            return true;
        },
        composeData() {
            return {
                method: "set",
                param: {
                    port_id: this.portid,
                    onu_id: this.onuid,
                    mode: this.wlan_mode,
                    encrypt: this.wlan_encrypt,
                    ssid: this.ssid,
                    password: this.password
                }
            };
        },
        postData(data) {
            this.$http
                .post("/onumgmt?form=wlan", data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message.success(
                            `${this.lanMap[data.method]}${
                                this.lanMap["st_success"]
                            }`
                        );
                        this.getData();
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                })
                .catch(err => {});
        },
        clearWlan() {
            this.$confirm(this.lanMap["if_sure"])
                .then(_ => {
                    const data = {
                        method: "clear",
                        param: {
                            port_id: this.portid,
                            onu_id: this.onuid,
                            mode: this.wlan_mode,
                            ssid: "",
                            password: ""
                        }
                    };
                    this.postData(data);
                })
                .catch(_ => {});
        }
    },
    watch: {
        wlan_mode() {
            this.showVal();
        }
    }
};
</script>

<style lang="less" scoped>
h2 {
    font-size: 18px;
    height: 30px;
    font-weight: 500;
    line-height: 30px;
    color: #67aef7;
    padding-left: 10px;
    margin: 20px 0;
}
select {
    width: 197px;
}
div.wlan-row {
    line-height: 36px;
    margin: 0 0 0 10px;
    > span {
        display: inline-block;
        vertical-align: middle;
        &:first-child {
            width: 120px;
        }
    }
}
a {
    margin: 20px 0 0 10px;
}
span.tips {
    padding: 0 0 0 6px;
    color: #666;
    font-size: 14px;
}
</style>