<template>
    <div>
        <div>
            <nms-button @click="refreshData" style="width: 120px">{{
                lanMap["refresh"]
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
</style>
