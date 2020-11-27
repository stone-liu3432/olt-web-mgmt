<template>
    <div class="running-status">
        <h1>{{ lanMap["running_status"] }}</h1>
        <div>
            <div class="system-info" v-if="system.data && system.data">
                <h2>
                    {{ lanMap["sys_info"] }}
                    <nms-button
                        style="float: right; margin-right: 20px"
                        @click="setDevName"
                    >
                        {{ lanMap["set_dev_name"] }}
                    </nms-button>
                </h2>
                <div class="system-info-detail">
                    <span>{{ lanMap["dev_name"] }}</span>
                    <span>{{ hostname }}</span>
                </div>
                <div
                    v-for="(item, key) of system.data"
                    :key="key"
                    class="system-info-detail"
                    v-if="key !== 'bl_ver' && key !== 'vendor'"
                >
                    <span>{{ lanMap[key] }}</span>
                    <span
                        v-if="key !== 'lic_total'"
                        :style="{
                            color:
                                key === 'lic_available' && item <= 5
                                    ? 'red'
                                    : '',
                        }"
                    >
                        {{ item }}
                    </span>
                    <template v-else>
                        <span :style="{ width: item !== 0 ? 'auto' : '' }">
                            {{ item === 0 ? lanMap["forever"] : item }}
                        </span>
                        <template v-if="item !== 0">
                            <nms-button
                                style="margin-left: 30px"
                                @click="openDialog"
                            >
                                {{ lanMap["add"] + lanMap["lic_total"] }}
                            </nms-button>
                        </template>
                    </template>
                </div>
            </div>
            <div class="cpu-info" v-if="cpuInfo.data">
                <h2>{{ lanMap["hw_status"] }}</h2>
                <div>
                    <div>
                        <p>{{ lanMap["cpu_usage"] }}</p>
                        <canvas
                            width="200"
                            height="200"
                            id="cpu-detail"
                        ></canvas>
                    </div>
                    <div>
                        <P>{{ lanMap["memory_usage"] }}</P>
                        <canvas
                            width="200"
                            height="200"
                            id="memory-detail"
                        ></canvas>
                    </div>
                </div>
                <div class="container" v-if="this.timer.data">
                    <h2>{{ lanMap["sys_run_time"] }}</h2>
                    <div class="time-info">
                        <span>{{ lanMap["current_time"] + " :" }}</span>
                        <span>
                            {{
                                now_time.year +
                                "-" +
                                now_time.month +
                                "-" +
                                now_time.day +
                                " " +
                                now_time.hour +
                                ":" +
                                (now_time.min < 10
                                    ? "0" + now_time.min
                                    : now_time.min) +
                                ":" +
                                (now_time.sec < 10
                                    ? "0" + now_time.sec
                                    : now_time.sec)
                            }}
                        </span>
                    </div>
                    <div class="time-info">
                        <span>{{ lanMap["run_time"] + " :" }}</span>
                        <span>
                            {{ run_time.day + " " + lanMap["days"] }}
                            {{ run_time.hour + " " + lanMap["hours"] }}
                            {{
                                (run_time.min < 10
                                    ? "0" + run_time.min
                                    : run_time.min) +
                                " " +
                                lanMap["mins"]
                            }}
                            {{
                                (run_time.sec < 10
                                    ? "0" + run_time.sec
                                    : run_time.sec) +
                                " " +
                                lanMap["secs"]
                            }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="company-info" v-if="showCompanyInfo">
            <h2>{{ lanMap["company_info"] }}</h2>
            <div v-if="company_name">
                <span>{{ lanMap["company_name"] }}</span>
                <span>{{ company_name }}</span>
            </div>
            <div v-if="company_addr">
                <span>{{ lanMap["company_addr"] }}</span>
                <span>{{ company_addr }}</span>
            </div>
            <div v-if="company_email">
                <span>{{ lanMap["company_email"] }}</span>
                <span>{{ company_email }}</span>
            </div>
            <div v-if="company_phone">
                <span>{{ lanMap["company_phone"] }}</span>
                <span>{{ company_phone }}</span>
            </div>
            <div v-if="supplier_info">
                <span>{{ lanMap["supplier_info"] }}</span>
                <span>{{ supplier_info }}</span>
            </div>
        </div>
        <nms-dialog :visible.sync="dialogVisible" width="600px">
            <div slot="title">{{ lanMap["add"] + lanMap["lic_total"] }}</div>
            <div class="dialog-content">
                <span>license:</span>
                <input
                    type="text"
                    v-model="trylic"
                    style="width: 350px"
                    v-validator="{ regexp: /^[a-z0-9]{32}$/i }"
                />
                <span class="tips">{{ lanMap.composeRange(32) }}</span>
            </div>
            <div slot="footer">
                <nms-button @click="submitTryLic">{{
                    lanMap["apply"]
                }}</nms-button>
                <nms-button @click="dialogVisible = false">{{
                    lanMap["cancel"]
                }}</nms-button>
            </div>
        </nms-dialog>
        <nms-dialog :visible.sync="devNameVisible" border width="600px">
            <div slot="title">{{ lanMap["set_dev_name"] }}</div>
            <div class="dialog-content">
                <span style="width: 130px">{{ lanMap["dev_name"] }}</span>
                <input
                    type="text"
                    v-model="devName"
                    style="width: 300px"
                    v-validator="{ regexp: regDevName }"
                />
                <span class="tips">{{ lanMap.composeRange(1, 64) }}</span>
            </div>
            <div slot="footer">
                <nms-button @click="submitDevName">{{
                    lanMap["apply"]
                }}</nms-button>
                <nms-button @click="devNameVisible = false">
                    {{ lanMap["cancel"] }}
                </nms-button>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
export default {
    name: "runStatus",
    data() {
        return {
            cpuInfo: {},
            ponInfo: {},
            geInfo: {},
            timer: {},
            interval: null,
            time_interval: null,
            now_time: {
                year: 0,
                month: 0,
                day: 0,
                hour: 0,
                min: 0,
                sec: 0,
            },
            run_time: {
                day: 0,
                hour: 0,
                min: 0,
                sec: 0,
            },
            company_name: "",
            company_addr: "",
            company_email: "",
            company_phone: "",
            supplier_info: "",
            dialogVisible: false,
            trylic: "",
            hostname: "",
            devNameVisible: false,
            devName: "",
            regDevName: /^[a-z][\w-]{0,63}$/i,
        };
    },
    computed: {
        ...mapState([
            "lanMap",
            "port_info",
            "system",
            "change_url",
            "menu",
            "port_name",
        ]),
        showCompanyInfo() {
            return (
                !!this.company_name ||
                !!this.company_addr ||
                !!this.company_email ||
                !!this.company_phone ||
                !!this.supplier_info
            );
        },
    },
    created() {
        this.$http
            .get(this.change_url.cpu)
            .then((res) => {
                if (res.data.code === 1) {
                    this.cpuInfo = res.data;
                    this.$nextTick(() => {
                        this.drawing(
                            this.cpuInfo.data.cpu_usage,
                            this.cpuInfo.data.memory_usage
                        );
                    });
                }
            })
            .catch((err) => {});
        this.$http
            .get(this.change_url.time)
            .then((res) => {
                if (res.data.code === 1) {
                    this.timer = res.data;
                    var arr = this.timer.data.time_now;
                    this.now_time.year = arr[0];
                    this.now_time.month = arr[1];
                    this.now_time.day = arr[2];
                    this.now_time.hour = arr[3];
                    this.now_time.min = arr[4];
                    this.now_time.sec = arr[5];
                    this.run_time.day = this.timer.data.uptime[0];
                    this.run_time.hour = this.timer.data.uptime[1];
                    this.run_time.min = this.timer.data.uptime[2];
                    this.run_time.sec = this.timer.data.uptime[3];
                    if (this.timer.data) {
                        this.time_interval = setInterval(() => {
                            if (this.now_time.sec < 59) {
                                this.now_time.sec += 1;
                            } else {
                                this.now_time.sec = 0;
                                this.now_time.min += 1;
                                if (this.now_time.min > 59) {
                                    this.now_time.sec = 0;
                                    this.now_time.min = 0;
                                    this.now_time.hour += 1;
                                    if (this.now_time.hour > 23) {
                                        this.now_time.sec = 0;
                                        this.now_time.min = 0;
                                        this.now_time.hour = 0;
                                        this.now_time.day += 1;
                                    }
                                }
                            }
                            if (this.run_time.sec < 59) {
                                this.run_time.sec += 1;
                            } else {
                                this.run_time.sec = 0;
                                this.run_time.min += 1;
                                if (this.run_time.min > 59) {
                                    this.run_time.sec = 0;
                                    this.run_time.min = 0;
                                    this.run_time.hour += 1;
                                    if (this.run_time.hour > 23) {
                                        this.run_time.sec = 0;
                                        this.run_time.min = 0;
                                        this.run_time.hour = 0;
                                        this.run_time.day += 1;
                                    }
                                }
                            }
                        }, 1000);
                    }
                }
            })
            .catch((err) => {});
        this.interval = setInterval(() => {
            this.getUsageRate();
        }, 5000);
        this.getCompanyInfo();
        this.getDevName();
        sessionStorage.setItem("first_menu", "running_status");
        sessionStorage.removeItem("sec_menu");
    },
    beforeDestroy() {
        clearInterval(this.interval);
        clearInterval(this.time_interval);
    },
    methods: {
        ...mapMutations({
            systemInfo: "updateSysData",
        }),
        ...mapActions({
            getSystem: "updateSystem",
        }),
        getUsageRate() {
            this.$http
                .get(this.change_url.cpu)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.cpuInfo = res.data;
                    }
                })
                .catch((err) => {
                    // to do
                });
        },
        drawing(cpuNum, memoryNum) {
            var cpu = document.getElementById("cpu-detail");
            if (!cpu) return;
            var cpuCtx = cpu.getContext("2d");
            var memory = document.getElementById("memory-detail");
            if (!memory) return;
            var memoryCtx = memory.getContext("2d");
            //起始一条路径   cpu
            cpuCtx.beginPath();
            //设置当前线条的宽度
            cpuCtx.lineWidth = 15; //10px
            //设置笔触的颜色
            cpuCtx.strokeStyle = "#ccc";
            //arc() 方法创建弧/曲线（用于创建圆或部分圆）
            cpuCtx.arc(100, 100, 90, 0, 2 * Math.PI);
            //绘制已定义的路径
            cpuCtx.stroke();
            cpuCtx.beginPath();
            cpuCtx.lineWidth = 15;
            cpuCtx.strokeStyle = "#65B2FB";
            if (cpuNum >= 70) {
                cpuCtx.strokeStyle = "red";
            }
            //设置开始处为0点钟方向(-90 * Math.PI / 180)
            //num为百分比值(0-100) //cpuNum
            //var x = this.data.cpuInfo.data.cpu_usage;
            cpuCtx.arc(
                100,
                100,
                90,
                (-90 * Math.PI) / 180,
                ((cpuNum * 3.6 - 90) * Math.PI) / 180
            );
            cpuCtx.stroke();
            //绘制文字
            cpuCtx.font = "40px Arial";
            cpuCtx.fillStyle = "#65B2FB";
            cpuCtx.textBaseline = "middle";
            cpuCtx.textAlign = "center";
            cpuCtx.fillText(cpuNum + "%", 100, 100);

            //起始一条路径    memory
            memoryCtx.beginPath();
            //设置当前线条的宽度
            memoryCtx.lineWidth = 15; //10px
            //设置笔触的颜色
            memoryCtx.strokeStyle = "#ccc";
            //arc() 方法创建弧/曲线（用于创建圆或部分圆）
            memoryCtx.arc(100, 100, 90, 0, 2 * Math.PI);
            //绘制已定义的路径
            memoryCtx.stroke();
            memoryCtx.beginPath();
            memoryCtx.lineWidth = 15;
            memoryCtx.strokeStyle = "#65B2FB";
            if (memoryNum >= 70) {
                memoryCtx.strokeStyle = "red";
            }
            //设置开始处为0点钟方向(-90 * Math.PI / 180)
            //num为百分比值(0-100)  //memoryNum
            //var x = this.data.cpuInfo.data.cpu_usage;
            memoryCtx.arc(
                100,
                100,
                90,
                (-90 * Math.PI) / 180,
                ((memoryNum * 3.6 - 90) * Math.PI) / 180
            );
            memoryCtx.stroke();
            //绘制文字
            memoryCtx.font = "40px Arial";
            memoryCtx.fillStyle = "#65B2FB";
            memoryCtx.textBaseline = "middle";
            memoryCtx.textAlign = "center";
            memoryCtx.fillText(memoryNum + "%", 100, 100);
        },
        getCompanyInfo() {
            this.company_name = "";
            this.company_addr = "";
            this.company_email = "";
            this.company_phone = "";
            this.supplier_info = "";
            this.$http
                .get("/board?info=setting_board")
                .then((res) => {
                    if (res.data.code === 1) {
                        var data = res.data.data;
                        this.company_name = data.name || "";
                        this.company_addr = data.addr || "";
                        this.company_email = data.email || "";
                        this.company_phone = data.phone || "";
                        this.supplier_info = data.supplier_info || "";
                    }
                })
                .catch((err) => {
                    // to do
                });
        },
        openDialog() {
            this.dialogVisible = true;
        },
        submitTryLic() {
            if (!/^[a-zA-Z0-9]{32}$/.test(this.trylic)) {
                this.$message.error(`${this.lanMap["param_error"]}: license`);
            }
            this.$http
                .post("/board?info=trylic", {
                    method: "set",
                    param: {
                        trylic: this.trylic,
                    },
                })
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.getSystem();
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                    this.dialogVisible = false;
                })
                .catch((err) => {});
        },
        getDevName() {
            this.hostname = "";
            this.$http
                .get("/system?form=hostname")
                .then((res) => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.hostname = res.data.data.hostname || "";
                        }
                    }
                })
                .catch((err) => {});
        },
        setDevName() {
            this.devName = this.hostname;
            this.devNameVisible = true;
        },
        submitDevName() {
            if (this.devName === this.hostname) {
                return this.$message.info(this.lanMap["modify_tips"]);
            }
            if (!this.regDevName.test(this.devName)) {
                return this.$message.error(
                    `${this.lanMap["param_error"]}: ${this.lanMap["dev_name"]}`
                );
            }
            const url = "/system?form=hostname",
                post_params = {
                    method: "set",
                    param: {
                        hostname: this.devName,
                    },
                };
            this.$http
                .post(url, post_params)
                .then((res) => {
                    if (res.data.code === 1) {
                        this.$message.success(this.lanMap["setting_ok"]);
                        this.getDevName();
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                })
                .catch((err) => {})
                .finally(() => {
                    this.devNameVisible = false;
                });
        },
    },
    watch: {
        usageRates() {
            if (this.usageRates.length > 1) {
                this.$nextTick(() => {
                    drawChart(
                        this.usageRates,
                        document.getElementById("usage-rates")
                    );
                });
            }
        },
    },
};
</script>

<style scoped lang="less">
h1 {
    font-size: 24px;
    margin: 20px 10px;
    font-weight: 600;
    color: #67aef7;
}
.container {
    padding: 5px;
}
.container:after {
    content: "";
    display: table;
    clear: both;
}
.time-info {
    margin: 20px 0 0 20px;
}
.time-info > span:first-child {
    display: inline-block;
    width: 110px;
    text-align: right;
    margin-right: 20px;
}
div.pon-modal > span {
    font-size: 14px;
    color: #3390e6;
    display: inline-block;
    padding: 0 5px;
}
.container > h2 {
    height: 30px;
    line-height: 30px;
    border-bottom: 1px solid #ddd;
    padding: 12px 0;
}
p.tips {
    margin-bottom: 10px;
}
h2 {
    color: #67aef7;
    font-weight: 500;
    font-size: 18px;
}
.pon-detail > div {
    width: 64px;
    height: 64px;
    padding: 5px;
    margin: 10px auto;
    border-radius: 5px;
}
.bg-online {
    border: 2px solid #29bdfa;
}
.bg-offline {
    border: 2px solid #a4a9a9;
}
.bg-disabled {
    border: 2px solid #a4a9a9;
}
.system-info {
    width: 500px;
    padding-bottom: 10px;
    margin: 10px 0 0 10px;
    float: left;
    &:after {
        content: "";
        display: table;
        clear: both;
    }
}
.system-info > div.system-info-detail:last-child {
    border-bottom: none;
}
.system-info > h2 {
    height: 30px;
    line-height: 30px;
    margin: 12px 0;
    & + .system-info-detail {
        border-top: 1px solid #ddd;
    }
}
.system-info-detail {
    > span {
        display: inline-block;
        vertical-align: middle;
    }
    > span:first-child {
        width: 180px;
        padding: 10px 30px 10px 0;
        text-align: right;
        box-sizing: border-box;
    }
    > span + span {
        width: calc(~"100% - 190px");
        padding: 6px 0;
        word-break: break-all;
        word-wrap: break-word;
    }
}
.system-info-detail {
    border-bottom: 1px solid #ddd;
}
.cpu-info {
    float: left;
    width: 500px;
    margin: 10px 0 0 10px;
    padding-bottom: 20px;
    &:after {
        content: "";
        display: table;
        clear: both;
    }
}
div.cpu-info > div.container {
    width: 480px;
    margin: 10px 0 0 0;
}
.cpu-info > h2 {
    height: 30px;
    padding-left: 10px;
    margin-right: 15px;
    line-height: 30px;
    margin: 12px 0;
}
.cpu-info > div {
    float: left;
    padding-left: 30px;
    border-top: 1px solid #ddd;
}
.cpu-info > div > div {
    float: left;
    margin: 15px 0 0 10px;
}
.cpu-info > div > p {
    padding: 10px;
    color: #555;
}
.running-status {
    > div {
        &:after {
            content: "";
            display: table;
            clear: both;
        }
    }
    &:after {
        content: "";
        display: table;
        clear: both;
    }
}
.company-info {
    margin: 20px 0 0 10px;
    width: calc(~"100% - 30px");
    div {
        border: 1px solid @borderColor;
        border-bottom: none;
        &:last-child {
            border-bottom: 1px solid @borderColor;
        }
    }
    span {
        display: inline-block;
        padding: 10px 0 10px 10px;
        font-size: 14px;
        color: #333;
        &:first-child {
            width: 150px;
            border-right: 1px solid @borderColor;
        }
    }
    h2 {
        margin: 10px 0;
    }
}
.dialog-content {
    > span {
        display: inline-block;
        width: 100px;
        text-align: right;
        padding-right: 20px;
        box-sizing: border-box;
        vertical-align: middle;
    }
    span.tips {
        width: auto;
        font-size: @tipsFontSize;
        color: @tipsColor;
        padding: 0;
        margin-left: 12px;
    }
}
</style>