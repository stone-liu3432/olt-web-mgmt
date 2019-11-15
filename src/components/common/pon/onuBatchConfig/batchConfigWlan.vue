<template>
    <div>
        <nms-table border :rows="wlanList">
            <nms-table-column prop="port_id" :label="lanMap['onu_id']">
                <template slot-scope="rows">{{ `ONU${rows.port_id}/${rows.onu_id}` }}</template>
            </nms-table-column>
            <nms-table-column prop="wlan" :label="lanMap['mode']">
                <template slot-scope="rows">{{ rows.wlan === 1 ? '2.4G' : '2.4G + 5G' }}</template>
            </nms-table-column>
            <nms-table-column prop="encrypt" :label="`2.4G ${lanMap['encrypt']}`">
                <template slot-scope="rows">{{ encrypts[rows.encrypt] }}</template>
            </nms-table-column>
            <nms-table-column prop="ssid" label="2.4G SSID"></nms-table-column>
            <nms-table-column prop="password" :label="`2.4G ${lanMap['password']}`"></nms-table-column>
            <nms-table-column prop="encrypt_5g" :label="`5G ${lanMap['encrypt']}`">
                <template slot-scope="rows">{{ rows.wlan === 2 ? encrypts[rows.encrypt] : ' - ' }}</template>
            </nms-table-column>
            <nms-table-column prop="ssid_5g" label="5G SSID">
                <template slot-scope="rows">{{ rows.ssid_5g || ' - ' }}</template>
            </nms-table-column>
            <nms-table-column prop="password_5g" :label="`5G ${lanMap['password']}`">
                <template slot-scope="rows">{{ rows.password_5g || ' - ' }}</template>
            </nms-table-column>
            <nms-table-column :label="lanMap['config']">
                <template slot-scope="rows">
                    <a
                        href="javascript: void(0);"
                        class="btn-text"
                        @click="openDialog(rows)"
                    >{{ lanMap['config'] }}</a>
                    <a
                        href="javascript: void(0);"
                        class="btn-text"
                        @click="clearWlan(rows)"
                    >{{ lanMap['clear'] }}</a>
                </template>
            </nms-table-column>
        </nms-table>
        <nms-dialog
            :visible.sync="visible"
            :title="`${lanMap['config']} WLAN`"
            width="500px"
            :before-close="beforeClose"
        >
            <div class="dialog-wlan-item">
                <span>{{ lanMap['onu_id'] }}:</span>
                <span>{{ `ONU${wlanInfo.port_id}/${wlanInfo.onu_id}` }}</span>
            </div>
            <div class="dialog-wlan-item">
                <span>WLAN {{ lanMap['mode'] }}:</span>
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
            <div class="dialog-wlan-item">
                <span>{{ lanMap['encrypt'] }}:</span>
                <select v-model.number="wlan_encrypt">
                    <option :value="0">None</option>
                    <option :value="4">WPA2</option>
                    <option :value="6">WPA2Mixed</option>
                </select>
            </div>
            <div class="dialog-wlan-item">
                <span>SSID:</span>
                <input
                    type="text"
                    v-model="ssid"
                    :style="{ 'border-color': ssid !== '' && !valid_ssid ? 'red' : '' }"
                />
                <span class="tips">{{ lanMap.composeRange(4, 32) }}</span>
            </div>
            <div class="dialog-wlan-item">
                <span>{{ lanMap['password'] }}</span>
                <input
                    type="text"
                    v-model="password"
                    :style="{ 'border-color': password !== '' && !valid_password ? 'red' : '' }"
                    :disabled="wlan_encrypt === 0"
                />
                <span class="tips">{{ lanMap.composeRange(8, 32) }}</span>
            </div>
            <div slot="footer">
                <a href="javascript: void(0);" @click="submitWlan">{{ lanMap['apply'] }}</a>
                <a href="javascript: void(0);" @click="closeDialog">{{ lanMap['cancel'] }}</a>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
const WLAN_KEY = {
    1: { encrypt: "encrypt", ssid: "ssid", password: "password" },
    2: { encrypt: "encrypt_5g", ssid: "ssid_5g", password: "password_5g" }
};
export default {
    name: "batchWlan",
    computed: {
        ...mapState(["lanMap"]),
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
        portid: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            wlanList: [],
            encrypts: { 0: "None", 4: "WPA2", 6: "WPA2Mixed" },
            visible: false,
            wlanInfo: {},
            // mode: 1-2.4G  2-5G
            wlan_mode: 1,
            wlan_encrypt: 0,
            ssid: "",
            password: ""
        };
    },
    created() {
        if (this.portid) {
            this.getData(this.portid);
        }
    },
    // mounted() {
    //     this.wlanList = [
    //         {
    //             port_id: 1,
    //             onu_id: 2,
    //             wlan: 1,
    //             mode: 1,
    //             encrypt: 0,
    //             ssid: "1234",
    //             password: "12345678"
    //         },
    //         {
    //             port_id: 1,
    //             onu_id: 4,
    //             wlan: 2,
    //             mode: 1,
    //             encrypt: 4,
    //             ssid: "asdf",
    //             password: "dafdsfasdf",
    //             mode_5g: 1,
    //             encrypt_5g: 6,
    //             ssid_5g: "khjkjh",
    //             password_5g: "sdvgasfsd"
    //         }
    //     ];
    // },
    methods: {
        getData(port_id) {
            this.wlanList = [];
            this.$http
                .get("/onumgmt", { params: { form: "wlantab", port_id } })
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data && res.data.data.length) {
                            this.wlanList = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        composeData() {
            return {
                method: "set",
                param: {
                    port_id: this.wlanInfo.port_id,
                    onu_id: this.wlanInfo.onu_id,
                    mode: this.wlan_mode,
                    encrypt: this.wlan_encrypt,
                    ssid: this.ssid,
                    password: this.password
                }
            };
        },
        clearWlan(node) {
            this.$confirm()
                .then(_ => {
                    const data = {
                        method: "clear",
                        param: {
                            port_id: node.portid,
                            onu_id: node.onuid,
                            mode: node.wlan_mode,
                            ssid: "",
                            password: ""
                        }
                    };
                    this.postData(data);
                })
                .catch(_ => {});
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
                        this.closeDialog();
                        this.getData(this.portid);
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                })
                .catch(err => {});
        },
        submitWlan() {
            if (this.validData()) {
                const data = this.composeData();
                this.postData(data);
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
        openDialog(node) {
            this.wlanInfo = node;
            this.visible = true;
            this.showVal();
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
        beforeClose(done) {
            this.wlan_mode = 1;
            typeof done === "function" && done();
        },
        closeDialog() {
            this.beforeClose(_ => {
                this.visible = false;
            });
        }
    },
    watch: {
        portid() {
            if (this.portid) {
                this.getData(this.portid);
            }
        },
        wlan_mode() {
            this.showVal();
        }
    }
};
</script>

<style lang="less" scoped>
.dialog-wlan-item {
    margin: 6px 0;
    line-height: 30px;
    input + .tips {
        font-size: 14px;
        color: #666;
    }
    > span {
        display: inline-block;
        width: 120px;
        vertical-align: middle;
    }
    select {
        width: 197px;
    }
}
</style>