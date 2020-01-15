<template>
    <div class="diagonose">
        <h2>{{ lanMap['diagonose'] }}</h2>
        <div class="diagonose-item">
            <span>{{ lanMap['diag_tools_type'] }}</span>
            <span>{{ lanMap['diag_type'] }}</span>
        </div>
        <div class="diagonose-item">
            <span>{{ lanMap['dest_ping_ip'] }}</span>
            <span>
                <input
                    type="text"
                    v-model="ipaddr"
                    :style="{ 'border-color': ipaddr !== '' && !reg_ip.test(ipaddr) ? 'red' : '' }"
                />
                <span>ex: 127.0.0.1</span>
            </span>
        </div>
        <div class="diagonose-item">
            <span>{{ lanMap['diag_ping_intf'] }}</span>
            <span>
                <select v-model="interfaces">
                    <option
                        v-for="(item,index) in interface_data"
                        :key="index"
                        :value="item.interface"
                        :selected="item.interface === 'outbound'"
                    >{{ lanMap[item.interface] ? lanMap[item.interface] : item.interface }}</option>
                </select>
            </span>
        </div>
        <div class="diagonose-item">
            <span>{{ lanMap['diag_ping_count'] }}</span>
            <span>
                <input
                    type="text"
                    v-model="count"
                    :style="{ 'border-color': count > 50 || count < 1 ? 'red' : '' }"
                />
                <span>(1-50)</span>
            </span>
        </div>
        <div class="diagonose-item">
            <span>{{ lanMap['diag_ping_pktsize'] }}</span>
            <span>
                <input
                    type="text"
                    v-model="pktsize"
                    :style="{ 'border-color': pktsize > 1472 || pktsize < 4 ? 'red' : '' }"
                />
                <span>(4-1472 Bytes)</span>
            </span>
        </div>
        <div class="diagonose-item">
            <a
                href="javascript:void(0);"
                :class="{ 'disabled': disabled }"
                @click="ping_start"
            >{{ lanMap['start'] }}</a>
            <a
                href="javascript: void(0);"
                v-if="disabled"
                style="margin-left: 30px;"
                @click="disabled = false;"
            >{{ lanMap['cancel'] }}</a>
        </div>
        <div class="diagonose-item">
            <textarea cols="100" rows="20" readonly v-model="result"></textarea>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "diagonose",
    computed: { ...mapState(["lanMap", "change_url"]) },
    data() {
        return {
            ipaddr: "",
            interfaces: "",
            count: 4,
            pktsize: 64,
            interval: null,
            result: "The device is ready!",
            interface_data: [],
            // IP验证正则
            reg_ip: /^(([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){1}((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4]){1}$/,
            disabled: false
        };
    },
    created() {
        this.$http
            .get(this.change_url.outbound)
            .then(res => {
                this.outbound = res.data;
                if (res.data.code == 1) {
                    this.interface_data.push(res.data.data);
                }
                this.$http
                    .get(this.change_url.inbound)
                    .then(res => {
                        if (res.data.code == 1) {
                            this.inbound = res.data;
                            if (res.data.data) {
                                this.interface_data = this.interface_data.concat(
                                    res.data.data
                                );
                            }
                            this.interfaces = this.interface_data[0].interface;
                        } else {
                            this.inbound = {};
                        }
                    })
                    .catch(err => {
                        // to do
                    });
            })
            .catch(err => {
                // to do
            });
    },
    methods: {
        ping_start() {
            if (!this.reg_ip.test(this.ipaddr)) {
                this.$message({
                    type: "error",
                    text: this.lanMap["ipaddr_error"]
                });
                return;
            }
            if (this.count < 1 || this.count > 50) {
                this.$message({
                    type: "error",
                    text: this.lanMap["param_error"]
                });
                return;
            }
            if (this.pktsize < 4 || this.pktsize > 1472) {
                this.$message({
                    type: "error",
                    text: this.lanMap["param_error"]
                });
                return;
            }
            this.disabled = true;
            this.result = "Starting ping...";
            const interval = setInterval(() => {
                this.result += ".";
            }, 1000);
            var post_params = {
                method: "start",
                param: {
                    ipaddr: this.ipaddr,
                    interface: this.interfaces,
                    count: this.count,
                    pktsize: this.pktsize
                }
            };
            this.$http
                .post("/diagnose?form=ping", post_params)
                .then(res => {
                    if (res.data.code === 1) {
                        this.result = "";
                        this.ping_result();
                    } else {
                        this.$message({
                            type: res.data.type,
                            text: "(" + res.data.code + ") " + res.data.message
                        });
                        this.disabled = false;
                        this.result = "The device is ready!";
                    }
                    clearInterval(interval);
                })
                .catch(err => {
                    clearInterval(interval);
                    this.disabled = false;
                    this.result = "Network connection error!";
                });
        },
        ping_result() {
            if (this.disabled) {
                this.$http
                    .get("/diagnose?form=ping")
                    .then(res => {
                        if (res.data.code === 1) {
                            this.result = res.data.data.result;
                            if (res.data.data.finish === 0) {
                                setTimeout(() => {
                                    this.ping_result();
                                }, 1000);
                            } else {
                                this.result += "\r\n Finished!";
                                this.disabled = false;
                            }
                        } else {
                            this.$message({
                                type: res.data.type,
                                text: `(${res.data.code}) ${res.data.message}`
                            });
                            this.result = "The device is ready!";
                            this.disabled = false;
                        }
                    })
                    .catch(err => {
                        this.disabled = false;
                    });
            }
        }
    }
};
</script>

<style scoped lang="less">
h2 {
    font-size: 24px;
    margin: 20px 10px;
    font-weight: bold;
    color: #67aef7;
}
div.diagonose-item {
    margin: 20px;
    > span {
        display: inline-block;
        &:first-child {
            width: 200px;
        }
        > span {
            font-size: 14px;
            color: #666;
            margin-left: 10px;
        }
    }
    textarea {
        resize: vertical;
        border-color: #ccc;
        line-height: 24px;
        text-indent: 10px;
        font-size: 16px;
        height: 300px;
        &:focus {
            border-color: #ccc;
            outline: none;
        }
    }
    select {
        width: 195px;
        height: 30px;
        text-indent: 10px;
        font-size: 15px;
    }
    a {
        display: inline-block;
        width: 120px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        border-radius: 5px;
        // background: #3990E5;
        color: #fff;
        &:active {
            background: #aaa;
        }
    }
}
</style>