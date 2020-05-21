<template>
    <div>
        <div class="alarm-title">
            {{ lanMap['alarm_info'] }}
            <a
                href="javascript:void(0);"
                @click="getData"
            >{{ lanMap['refresh'] }}</a>
            <a
                href="javascript:void(0);"
                @click="downloadAlarm"
            >{{ lanMap['download'] + lanMap['alarm'] }}</a>
            <a
                href="javascript:void(0);"
                @click="openLogger"
            >{{ (logger ? lanMap['off'] : lanMap['on'] )+ lanMap['log'] }}</a>
            <a
                href="javascript:void(0);"
                @click="downloadLogger"
            >{{ lanMap['download'] + lanMap['log'] }}</a>
        </div>
        <ul
            v-if="alarm_data.data && alarm_data.data.length > 0"
            v-for="(item,index) in alarm_data.data"
            :key="index"
        >
            <li>{{ item }}</li>
        </ul>
        <div v-if="!alarm_data.data" class="no-more-data">{{ lanMap['no_more_data'] }}</div>
        <scroll-top></scroll-top>
    </div>
</template>

<script>
import { mapState } from "vuex";
import scrollTop from "@/components/common/scrollTop";
export default {
    name: "alarm",
    computed: mapState(["lanMap"]),
    components: { scrollTop },
    data() {
        return {
            alarm_data: {},
            logger: 0
        };
    },
    created() {
        this.getData();
        this.getLogStatus();
    },
    methods: {
        getData() {
            this.$http
                .get("/alarm?form=info")
                .then(res => {
                    if (res.data.code === 1) {
                        this.alarm_data = res.data;
                    } else {
                        this.alarm_data = {};
                    }
                })
                .catch(err => {
                    // to do
                });
        },
        downloadAlarm() {
            this.$confirm(this.lanMap["if_sure"])
                .then(_ => {
                    this.$http
                        .get("/alarm?form=download")
                        .then(res => {
                            if (res.data.code === 1) {
                                try {
                                    var a = document.createElement("a");
                                    a.href = "/" + res.data.data.filename;
                                    //a.download = res.data.data.filename;
                                    a.setAttribute(
                                        "download",
                                        res.data.data.filename
                                    );
                                    a.style.display = "none";
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                } catch (e) {
                                    //this.view_result(true);
                                }
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
                })
                .catch(_ => {});
        },
        getLogStatus() {
            this.$http
                .get("/alarm?form=logger")
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.logger = res.data.data.pondev >>> 0;
                        }
                    }
                })
                .catch(err => {});
        },
        openLogger() {
            let msg;
            if (this.logger) {
                msg =
                    this.lanMap["if_sure"] +
                    this.lanMap["off"] +
                    this.lanMap["log"] +
                    " ?";
            } else {
                msg =
                    this.lanMap["if_sure"] +
                    this.lanMap["on"] +
                    this.lanMap["log"] +
                    " ?";
            }
            this.$confirm(msg)
                .then(_ => {
                    this.$http
                        .post("/alarm?form=logger", {
                            method: "set",
                            param: {
                                pondev: Number(!this.logger)
                            }
                        })
                        .then(res => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["setting_ok"]
                                );
                                this.getLogStatus();
                            } else {
                                this.$message.error(
                                    `(${res.data.code}) ${res.data.message}`
                                );
                            }
                        })
                        .catch(err => {});
                })
                .catch(_ => {});
        },
        downloadLogger() {
            this.$confirm(
                this.lanMap["if_sure"] +
                    this.lanMap["download"] +
                    this.lanMap["log"] +
                    " ?"
            )
                .then(_ => {
                    this.$http
                        .get("/alarm?form=logger_dw")
                        .then(res => {
                            if (res.data.code === 1) {
                                try {
                                    var a = document.createElement("a");
                                    a.href = "/" + res.data.data.filename;
                                    a.setAttribute(
                                        "download",
                                        res.data.data.filename
                                    );
                                    a.style.display = "none";
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                } catch (e) {}
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
    }
};
</script>

<style lang="less" scoped>
div.alarm-title {
    font-size: 24px;
    margin: 20px 10px;
    font-weight: bold;
    color: #67aef7;
    a {
        font-size: 16px;
        font-weight: normal;
        min-width: 120px;
        padding: 0 12px;
        margin-left: 80px;
    }
    a + a {
        margin-left: 30px;
    }
}
ul {
    margin-left: 20px;
    li {
        margin: 10px 0;
    }
}
div.no-more-data {
    margin: 20px 10px;
    color: red;
}
</style>
