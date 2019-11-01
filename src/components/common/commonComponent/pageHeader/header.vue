<template>
    <div class="page-header">
        <div>
            <h2>
                <!-- 标题部分 -->
                <slot name="title"></slot>
            </h2>
            <div class="lf">
                <span>{{ lanMap['port_id'] }}</span>
                <select v-model="portid" style="margin-left: 6px;">
                    <template v-for="item in port_name.pon">
                        <option :value="item.id">{{ item.name }}</option>
                    </template>
                    <template v-if="type.toLowerCase() !== 'pon'">
                        <template v-for="item in port_name.ge">
                            <option :value="item.id">{{ item.name }}</option>
                        </template>
                        <template v-if="port_name.xge">
                            <template v-for="item in port_name.xge">
                                <option :value="item.id">{{ item.name }}</option>
                            </template>
                        </template>
                    </template>
                </select>
            </div>
            <div class="lf" v-if="hasOnu">
                <span>{{ lanMap['onu_id'] }}</span>
                <select v-model="onuid" style="margin-left: 6px; width: 120px;">
                    <template v-for="item in onu_list.data">
                        <option :value="item">{{ `ONU${portid}/${item}` }}</option>
                    </template>
                </select>
            </div>
            <div
                class="lf"
                style="line-height: 30px; color: red;"
                v-if="onu && !onu_list.data"
            >{{ lanMap['no_more_data'] }}</div>
            <!-- 功能部分(页头按钮) -->
            <div class="lf" style="margin-left: 30px;">
                <slot name="action"></slot>
            </div>
        </div>

        <hr />
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
export default {
    name: "pageHeader",
    computed: {
        ...mapState(["lanMap", "port_name", "onu_list"]),
        hasOnu() {
            return (
                this.onu &&
                this.type.toLowerCase() === "pon" &&
                this.onu_list.data
            );
        }
    },
    data() {
        return {
            portid: 0,
            onuid: 0
        };
    },
    created() {
        if (this.queryData) {
            if (this.queryData.portid) {
                this.portid = this.queryData.portid;
                if (this.queryData.onuid) {
                    this.onuid = this.queryData.onuid;
                }
                return;
            }
        }
        this.portid = Number(sessionStorage.getItem("pid")) || 1;
    },
    props: {
        //  type: pon / port
        type: {
            type: String,
            default: "pon"
        },
        //  是否需要获取onu，type = pon 时生效
        onu: {
            type: Boolean,
            default: false
        },
        queryData: {
            type: Object
        }
    },
    methods: {
        ...mapActions({
            updateResource: "updatePortUsedResource"
        })
    },
    watch: {
        portid() {
            sessionStorage.setItem("pid", this.portid);
            if (this.queryData) {
                if (this.queryData.onuid && this.onu) {
                    if (this.onuid !== this.queryData.onuid) {
                        return;
                    }
                }
            }
            if (this.onu && this.type.toLowerCase() === "pon") {
                this.updateResource(this.portid);
            }
            if (!this.onu) {
                this.$emit("change", this.portid);
            }
        },
        onuid() {
            sessionStorage.setItem("oid", this.onuid);
            this.$emit("change", this.portid, this.onuid);
        },
        onu_list() {
            if (this.hasOnu) {
                if (this.queryData.onuid) {
                    sessionStorage.setItem("oid", this.onuid);
                    return;
                }
                let oid = Number(sessionStorage.getItem("oid"));
                if (this.onu_list.data.includes(oid)) {
                    if (this.onuid === oid) {
                        this.$emit("change", this.portid, this.onuid);
                    } else {
                        this.onuid = oid;
                    }
                } else {
                    this.onuid = this.onu_list.data[0];
                }
            }
        }
    }
};
</script>

<style lang="less" scoped>
h2 {
    float: left;
    width: 300px;
    font-size: 24px;
    color: #67aef6;
    font-weight: 600;
}
.page-header {
    >div{
        &:after{
            content: "";
            display: table;
            clear: both;
        }
    }
    hr{
        margin: 20px 0 0 0;
    }
    margin: 20px 0;
    div + div {
        margin-left: 20px;
    }
    select {
        width: 150px;
    }
    a {
        height: 28px;
        line-height: 28px;
    }
    &:after {
        content: "";
        display: table;
        clear: both;
    }
}
</style>