<template>
    <div>
        <page-header type="none">
            <div slot="title">{{ lanMap['port_isolation'] }}</div>
        </page-header>
        <!-- 
            pon_isolate_portlist: PON隔离端口成员(PON Isolate Port Member)
            uplink_isolate_portlist: 上联隔离端口成员(Uplink Isolate Port Member)
        -->
        <div class="isolate">
            <span class="title">PON{{ lanMap['port_isolation'] }}</span>
            <a
                href="javascript: void(0);"
                @click="openDialog('add', 'pon')"
            >{{ `${lanMap['add']}${lanMap['port']}` }}</a>
            <a
                href="javascript: void(0);"
                @click="openDialog('delete', 'pon')"
            >{{ `${lanMap["delete"]}${lanMap['port']}` }}</a>
        </div>
        <div class="isolate isolate-portlist">
            <span style="width: 240px;">{{ `${lanMap['pon_isolate_portlist']}` }}:</span>
            <span v-if="!!isolate_pon">{{ isolate_pon | parsePortList }}</span>
            <span v-else>-</span>
        </div>
        <br />
        <div class="isolate">
            <span class="title">{{ `${lanMap['uplink']}${lanMap['port_isolation']}` }}</span>
            <a
                href="javascript: void(0);"
                @click="openDialog('add', 'ge')"
            >{{ `${lanMap['add']}${lanMap['port']}` }}</a>
            <a
                href="javascript: void(0);"
                @click="openDialog('delete', 'ge')"
            >{{ `${lanMap["delete"]}${lanMap['port']}` }}</a>
        </div>
        <div class="isolate isolate-portlist">
            <span style="width: 240px;">{{ `${lanMap['uplink_isolate_portlist']}` }}:</span>
            <span v-if="!!isolate_ge">{{ isolate_ge | parsePortList }}</span>
            <span v-else>-</span>
        </div>
        <nms-dialog :visible.sync="visible" width="750px">
            <div slot="title">{{ `${lanMap[dialogType] || ''}${lanMap['port'] || ''}` }}</div>
            <div class="isolate" style="margin: 0;">
                <span style="width: 150px;">{{ lanMap['port_id'] }}</span>
                <span>
                    <template v-for="item in port_name.pon" v-if="portType === 'pon'">
                        <label :class="{ 'disabled': disabledItem(item.id) }">
                            <input
                                type="checkbox"
                                v-model="portlist"
                                :value="item.id"
                                :disabled="disabledItem(item.id)"
                            />
                            {{ item.name }}
                        </label>
                    </template>
                    <template v-for="item in port_name.ge" v-if="portType !== 'pon'">
                        <label :class="{ 'disabled': disabledItem(item.id) }">
                            <input
                                type="checkbox"
                                v-model="portlist"
                                :value="item.id"
                                :disabled="disabledItem(item.id)"
                            />
                            {{ item.name }}
                        </label>
                    </template>
                    <template v-if="port_name.xge && portType !== 'pon'">
                        <template v-for="item in port_name.xge">
                            <label :class="{ 'disabled': disabledItem(item.id) }">
                                <input
                                    type="checkbox"
                                    v-model="portlist"
                                    :value="item.id"
                                    :disabled="disabledItem(item.id)"
                                />
                                {{ item.name }}
                            </label>
                        </template>
                    </template>
                </span>
            </div>
            <div slot="footer">
                <a href="javascript: void(0);" @click="submitForm">{{ lanMap['apply'] }}</a>
                <a href="javascript: void(0);" @click="closeDialog">{{ lanMap['cancel'] }}</a>
            </div>
        </nms-dialog>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { parsePort } from "@/utils/common";
export default {
    name: "portIsolation",
    computed: {
        ...mapState(["lanMap", "port_name"]),
        isolatePonList() {
            return parsePort(this.isolate_pon);
        },
        isolateGeList() {
            return parsePort(this.isolate_ge);
        }
    },
    data() {
        return {
            isolate_pon: "",
            isolate_ge: "",
            visible: false,
            dialogType: "",
            portType: "",
            portlist: []
        };
    },
    created() {
        this.getData();
    },
    // mounted() {
    //     this.isolate_pon = "1-3";
    //     this.isolate_ge = "4-7,11";
    // },
    methods: {
        getData() {
            this.isolate_pon = "";
            this.isolate_ge = "";
            this.$http
                .get("/switch_isolate?form=isolate")
                .then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data) {
                            this.isolate_pon =
                                res.data.data.pon_isolate_portlist;
                            this.isolate_ge =
                                res.data.data.uplink_isolate_portlist;
                        }
                    }
                })
                .catch(err => {});
        },
        openDialog(action, portType) {
            this.visible = true;
            this.dialogType = action;
            this.portType = portType;
            this.portlist =
                portType === "pon" ? this.isolatePonList : this.isolateGeList;
        },
        closeDialog() {
            this.visible = false;
        },
        disabledItem(port_id) {
            // string转number & 取整
            port_id = port_id >>> 0;
            if (this.portType === "pon") {
                if (this.dialogType === "add") {
                    return this.isolatePonList.includes(port_id);
                }
                if (this.dialogType === "delete") {
                    return !this.isolatePonList.includes(port_id);
                }
            } else {
                if (this.dialogType === "add") {
                    return this.isolateGeList.includes(port_id);
                }
                if (this.dialogType === "delete") {
                    return !this.isolateGeList.includes(port_id);
                }
            }
        },
        submitForm() {
            let isolatePortlist =
                this.portType === "pon"
                    ? this.isolatePonList
                    : this.isolateGeList;
            if (
                !this.portlist.length ||
                (this.dialogType === "add" &&
                    this.portlist.length === isolatePortlist.length)
            ) {
                return this.$message.error(this.lanMap["modify_tips"]);
            }
            const list = (this.dialogType === "add"
                ? this.portlist.filter(item => !isolatePortlist.includes(item))
                : this.portlist
            )
                .sort((a, b) => a - b)
                .toString();
            let post_param = {
                method: this.dialogType,
                param: {
                    pon_isolate_portlist:
                        this.portType === "pon" ? list : undefined,
                    uplink_isolate_portlist:
                        this.portType !== "pon" ? list : undefined
                }
            };
            this.postData(post_param);
            this.closeDialog();
        },
        postData(data) {
            let url =
                this.portType === "pon"
                    ? "/switch_isolate?form=isolate_pon"
                    : "/switch_isolate?form=isolate_uplink";
            this.$http
                .post(url, data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message.success(
                            `${this.lanMap[this.dialogType]}${
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
        }
    }
};
</script>

<style lang="less" scoped>
div.isolate {
    margin: 20px 0;
    &:after {
        content: "";
        display: table;
        clear: both;
    }
    > span {
        float: left;
        width: 180px;
        line-height: 24px;
        & + span {
            width: calc(~"100% - 180px");
            word-break: break-all;
            word-wrap: break-word;
        }
        label {
            user-select: none;
            display: inline-block;
            width: 24%;
            line-height: 30px;
        }
        label.disabled {
            cursor: not-allowed;
            color: #aaa;
        }
    }
    a {
        margin-left: 30px;
    }
    .title {
        font-size: 20px;
        color: @titleColor;
        line-height: 32px;
        width: 200px;
    }
}
div.isolate-portlist {
    > span + span {
        width: calc(~"100% - 240px");
    }
}
</style>