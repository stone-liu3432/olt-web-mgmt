<template>
    <div>
        <h2>
            {{ lanMap['link_aggregation'] }}
            <a
                href="javascript:void(0);"
                @click="openDialog(null, 'create')"
            >{{ lanMap['create'] }}</a>
        </h2>
        <hr />
        <table border="1" v-if="member.length">
            <template v-for="item in member">
                <tr>
                    <td>
                        <span>{{ lanMap['trunk_id'] }}:</span>
                        <span>{{ item.trunk_id }}</span>
                    </td>
                    <td>
                        <span>{{ lanMap['psc'] }}:</span>
                        <span>{{ pscEnum[item.psc] }}</span>
                        <span
                            class="text-btn"
                            @click="openDialog(item, 'config')"
                        >{{ lanMap['config'] }}</span>
                    </td>
                    <td>
                        <span
                            class="text-btn"
                            @click="openDialog(item, 'set')"
                        >{{ lanMap['add'] + lanMap['member_portlist'] }}</span>
                        <span
                            class="text-btn"
                            @click="openDialog(item, 'delete')"
                        >{{ lanMap['delete'] + lanMap['member_portlist'] }}</span>
                    </td>
                </tr>
                <tr>
                    <td colspan="3">
                        <span>{{ lanMap['member_portlist'] }}:</span>
                        <!-- <span>{{ parsePortList(item.member_portlist) }}</span> -->
                        <span>{{ item.member_portlist | analysis(system.data.ponports, system.data.geports) }}</span>
                    </td>
                </tr>
            </template>
        </table>
        <div class="modal-dialog" v-if="dialogVisible" key="modal-link-aggregation">
            <div class="cover"></div>
            <div
                :style="{ 'height': dialogFlag === 'create' ? '250px' : dialogFlag === 'set' || dialogFlag === 'delete' ? '240px' : '220px' }"
            >
                <div class="modal-content">
                    <h3 class="modal-header">{{ lanMap[dialogFlag] }}</h3>
                    <div>
                        <span style="width: 160px;">{{ lanMap['trunk_id'] }}:</span>
                        <input
                            type="text"
                            v-model.number="formData.trunk_id"
                            v-if="dialogFlag === 'create'"
                            :style="{ 'border-color': formData.trunk_id < 1 || formData.trunk_id > 8 || isNaN(formData.trunk_id) ? 'red' : '' }"
                        />
                        <span v-else>{{ formData.trunk_id }}</span>
                        <span class="tips" v-if="dialogFlag === 'create'">Range: 1-8</span>
                    </div>
                    <div v-if="dialogFlag === 'config'">
                        <span style="width: 160px; vertical-align: middle;">{{ lanMap['psc'] }}:</span>
                        <select v-model.number="formData.psc">
                            <template v-for="(item, key) in pscEnum">
                                <option :value="Number(key)">{{ item }}</option>
                            </template>
                        </select>
                    </div>
                    <div
                        v-if="dialogFlag === 'set' || dialogFlag === 'delete' || dialogFlag === 'create'"
                    >
                        <div class="align-item lf">{{ lanMap['member_portlist'] }}</div>
                        <div>
                            <div v-for="(item,key) in port_name.ge" :key="key" class="lf">
                                <input
                                    type="checkbox"
                                    :id="item.name"
                                    :value="item.id"
                                    name="port_list"
                                    v-model="formData.member_portlist"
                                />
                                <label
                                    :for="item.name"
                                >{{ `GE${ (item.id - system.data.ponports) < 10 ? '0' + (item.id - system.data.ponports) : item.id - system.data.ponports }` }}</label>
                            </div>
                            <div
                                v-for="(item,key) in port_name.xge"
                                :key="key"
                                class="lf"
                                v-if="port_name.xge"
                            >
                                <input
                                    type="checkbox"
                                    :id="item.name"
                                    :value="item.id"
                                    name="port_list"
                                    v-model="formData.member_portlist"
                                />
                                <label :for="item.name">
                                    {{
                                    `XGE${ (item.id - system.data.ponports - system.data.geports) < 10 ?
                                    '0' + (item.id - system.data.ponports - system.data.geports) :
                                    item.id - system.data.ponports - system.data.geports }`
                                    }}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div>
                        <a href="javascript: void(0);" @click="submitForm">{{ lanMap['apply'] }}</a>
                        <a href="javascript: void(0);" @click="closeDialog">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="closeDialog"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { parsePortList } from "@/utils/common";
export default {
    name: "linkAggregation",
    computed: {
        ...mapState(["lanMap", "system", "port_name", "change_url"])
    },
    data() {
        return {
            pscEnum: {
                "1": "src-mac",
                "2": "dest-mac",
                "3": "src-dest-mac",
                "4": "src-ip",
                "5": "dest-ip",
                "6": "src-dest-ip"
            },
            member: [
                {
                    trunk_id: 1, // 1-8
                    psc: 1, // 1-6
                    member_portlist: "5-12" // up-link
                }
            ],
            dialogVisible: false,
            dialogFlag: "",
            cacheMember: {},
            formData: {
                trunk_id: "",
                psc: 1,
                member_portlist: []
            }
        };
    },
    created() {
        this.getMember();
    },
    methods: {
        ...mapMutations({
            portInfo: "updatePortData",
            portName: "updatePortName"
        }),
        getMember() {
            this.$http
                .get("/switch_trunk?form=link_aggregation")
                .then(res => {
                    this.member = [];
                    if (res.data.code === 1) {
                        if (res.data.data && res.data.data.length) {
                            this.member = res.data.data;
                        }
                    }
                })
                .catch(err => {});
        },
        parsePortList(str) {
            return parsePortList(str);
        },
        openDialog(data, flag) {
            this.dialogFlag = flag;
            this.dialogVisible = true;
            if (data) {
                this.cacheMember = data;
                this.formData.trunk_id = data.trunk_id;
                if (flag === "config") {
                    this.formData.psc = data.psc;
                }
                if (flag === "delete" || flag === "set") {
                    this.formData.member_portlist = this.analysis(
                        data.member_portlist
                    );
                }
            }
        },
        closeDialog() {
            this.dialogVisible = false;
            this.formData.trunk_id = "";
            this.formData.psc = 1;
            this.formData.member_portlist = [];
        },
        analysis(str) {
            if (!str) return "";
            var result = [];
            var arr = str.split(",");
            for (var i = 0, len = arr.length; i < len; i++) {
                var substrs = arr[i];
                if (substrs.indexOf("-") !== -1) {
                    var subArr = substrs.split("-");
                    var min = Number(subArr[0]),
                        max = Number(subArr[subArr.length - 1]);
                    if (isNaN(min) || isNaN(max)) throw new TypeError();
                    result.push(min);
                    for (var j = 1; j < max - min; j++) {
                        result.push(min + j);
                    }
                    result.push(max);
                } else {
                    if (isNaN(Number(substrs))) throw new TypeError();
                    result.push(Number(substrs));
                }
            }
            return result;
        },
        submitForm() {
            let url,
                data = {};
            if (this.dialogFlag === "create" || this.dialogFlag === "set") {
                if (
                    this.formData.trunk_id < 1 ||
                    this.formData.trunk_id > 8 ||
                    isNaN(this.formData.trunk_id)
                ) {
                    this.$message({
                        type: "error",
                        text: `${this.lanMap["param_error"]}: trunk id `
                    });
                    return;
                }
                url = "/switch_trunk?form=link_aggregation_member";
                data = {
                    method: "set",
                    param: {
                        trunk_id: this.formData.trunk_id,
                        member_portlist: this.formData.member_portlist
                            .sort((a, b) => a - b)
                            .toString()
                    }
                };
            }
            if (this.dialogFlag === "delete") {
                url = "/switch_trunk?form=link_aggregation_member";
                data = {
                    method: "delete",
                    param: {
                        trunk_id: this.formData.trunk_id,
                        member_portlist: this.formData.member_portlist
                            .sort((a, b) => a - b)
                            .toString()
                    }
                };
            }
            if (this.dialogFlag === "config") {
                url = "/switch_trunk?form=link_aggregation_psc";
                data = {
                    method: "set",
                    param: {
                        trunk_id: this.formData.trunk_id,
                        psc: this.formData.psc
                    }
                };
            }
            this.$http
                .post(url, data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap["setting_ok"]
                        });
                        this.getMember();
                        //  设置完成后，更新端口信息
                        this.updatePortInfo();
                    } else {
                        this.$message({
                            type: res.data.type,
                            text: `(${res.data.code}) ${res.data.message}`
                        });
                    }
                    this.closeDialog();
                })
                .catch(err => {});
        },
        updatePortInfo() {
            this.$http
                .get(this.change_url.port)
                .then(res => {
                    this.portInfo(res.data);
                    var pon = this.system.data.ponports;
                    var ge = this.system.data.geports;
                    var xge = this.system.data.xgeports;
                    var pon_count, ge_count, xge_count, portName;
                    pon_count = res.data.data.slice(0, pon);
                    if (!xge) {
                        ge_count = res.data.data.slice(pon);
                        portName = {
                            pon: this.get_portName(pon_count, "PON"),
                            ge: this.get_portName(ge_count, "GE")
                        };
                    } else {
                        ge_count = res.data.data.slice(pon, pon + ge);
                        xge_count = res.data.data.slice(pon + ge);
                        portName = {
                            pon: this.get_portName(pon_count, "PON"),
                            ge: this.get_portName(ge_count, "GE"),
                            xge: this.get_portName(xge_count, "XGE")
                        };
                    }
                    this.portName(portName);
                })
                .catch(err => {
                    // to do
                });
        },
        //根据port_id 分配端口名
        get_portName(arr, prefix) {
            var obj = {};
            for (var i = 0; i < arr.length; i++) {
                obj[arr[i].port_id] = {};
                obj[arr[i].port_id].name =
                    (i < 10 ? prefix + "0" + (i + 1) : prefix + (i + 1)) +
                    (arr[i].link_aggregation
                        ? "(LAG" + arr[i].link_aggregation + ")"
                        : "");
                obj[arr[i].port_id].id = arr[i].port_id;
                obj[arr[i].port_id].lag = arr[i].link_aggregation || 0;
                obj[arr[i].port_id].data = arr[i];
            }
            return obj;
        }
    }
};
</script>

<style lang="less" scoped>
h2 {
    font-size: 24px;
    font-weight: 600;
    color: #67aef7;
    margin: 10px 0 20px 0;
    a {
        margin-left: 30px;
    }
}
table {
    width: 100%;
    border: 1px solid #ccc;
    margin: 20px 10px 0 10px;
    td {
        padding: 8px 0 8px 10px;
    }
    span + span {
        margin-left: 16px;
    }
}
.text-btn {
    color: #67aef7;
    cursor: pointer;
}
.modal-content {
    user-select: none;
    > div:not(.close) {
        margin: 16px 0;
    }
    span {
        display: inline-block;
        width: 140px;
        text-align: center;
    }
    span + span {
        margin-left: 10px;
        text-align: left;
    }
    input + span.tips {
        width: auto;
        margin-left: 10px;
        font-size: 14px;
        color: #666;
    }
    select {
        margin-left: 10px;
    }
    .align-item {
        width: 140px;
        padding: 6px 16px;
        box-sizing: border-box;
        text-align: center;
        & + div {
            margin-left: 140px;
            &:after {
                content: "";
                display: table;
                clear: both;
            }
            > div {
                width: 24%;
                padding: 6px 0;
            }
        }
    }
    a {
        margin: 6px 0 0 100px;
    }
}
</style>
