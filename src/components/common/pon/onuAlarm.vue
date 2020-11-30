<template>
    <div>
        <div>
            <nms-button @click="refreshData">
                {{ lanMap["refresh"] }}
            </nms-button>
            <nms-button @click="clearAlarm">{{
                lanMap["clear"] + lanMap["alarm"]
            }}</nms-button>
        </div>
        <ul>
            <li v-for="(item, index) in onu_alarm_list" :key="index">
                {{ item }}
            </li>
        </ul>
        <div v-if="!onu_alarm_list.length" class="no-more-data">
            {{ lanMap["no_more_data"] }}
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { debounce, isArray } from "@/utils/common";
export default {
    name: "onuAlarm",
    computed: mapState(["lanMap"]),
    props: ["portData"],
    data() {
        return {
            onu_alarm_list: [],
        };
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.onu_alarm_list = [];
            this.$http
                .get("/onumgmt?form=alarm-info", {
                    params: {
                        port_id: this.portData.portid,
                        onu_id: this.portData.onuid,
                    },
                })
                .then((res) => {
                    if (res.data.code === 1) {
                        if (isArray(res.data.data)) {
                            this.onu_alarm_list = res.data.data;
                        }
                    }
                })
                .catch((err) => {});
        },
        refreshData() {
            debounce(this.getData, 1000, this);
        },
        clearAlarm() {
            this.$confirm(
                this.lanMap["if_sure"] +
                    this.lanMap["clear"] +
                    this.lanMap["alarm"] +
                    " ?"
            )
                .then(() => {
                    const url = "/onumgmt?form=alarm",
                        post_params = {
                            method: "clear",
                            param: {
                                port_id: this.portData.portid,
                                onu_id: this.portData.onuid,
                            },
                        };
                    this.$http
                        .post(url, post_params)
                        .then((res) => {
                            if (res.data.code === 1) {
                                this.$message.success(
                                    this.lanMap["clear"] +
                                        this.lanMap["st_success"]
                                );
                                this.getData();
                            } else {
                                this.$message.error(
                                    `(${res.data.code}) ${res.data.message}`
                                );
                            }
                        })
                        .catch((err) => {});
                })
                .catch(() => {});
        },
    },
};
</script>

<style lang="less" scoped>
li {
    margin: 6px 0 6px 20px;
}
div.no-more-data {
    margin: 20px 10px;
    color: red;
}
a {
    margin-left: 30px;
}
</style>
