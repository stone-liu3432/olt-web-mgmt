<template>
    <div>
        <h2>{{ lanMap['link_aggregation'] }}</h2>
        <hr />
        <table border="1" v-if="member.length">
            <template v-for="item in member">
                <tr>
                    <td>
                        <span>trunk id:</span>
                        <span>{{ item.trunk_id }}</span>
                    </td>
                    <td>
                        <span>{{ lanMap['psc'] }}:</span>
                        <span>{{ pscEnum[item.psc] }}</span>
                    </td>
                    <td>
                        <span class="text-btn" @click="openDialog(item, 'add')">{{ lanMap['add'] }}</span>
                        <span
                            class="text-btn"
                            @click="openDialog(item, 'delete')"
                        >{{ lanMap['delete'] }}</span>
                        <span
                            class="text-btn"
                            @click="openDialog(item, 'config')"
                        >{{ lanMap['config'] }}</span>
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
        <div class="modal-dialog" v-if="dialogVisible">
            <div class="cover"></div>
            <div
                :style="{ 'height': dialogFlag === 'add' || dialogFlag === 'delete' ? '240px' : '210px' }"
            >
                <div class="modal-content">
                    <h3 class="modal-header">{{ lanMap[dialogFlag] }}</h3>
                    <div>
                        <span style="width: 160px;">trunk id:</span>
                        <span>{{ trunk_id }}</span>
                    </div>
                    <div v-if="dialogFlag === 'config'">
                        <span style="width: 160px;">{{ lanMap['psc'] }}:</span>
                        <select v-model.number="formData.psc">
                            <template v-for="(item, key) in pscEnum">
                                <option :value="Number(key)">{{ item }}</option>
                            </template>
                        </select>
                    </div>
                    <div v-if="dialogFlag === 'add' || dialogFlag === 'delete'">
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
import { mapState } from "vuex";
import { parsePortList } from "@/utils/common";
export default {
    name: "linkAggregation",
    computed: {
        ...mapState(["lanMap", "system", "port_name"])
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
                // {
                //     trunk_id: 1, // 1-8
                //     psc: 1, // 1-6
                //     member_portlist: "5-12" // up-link
                // }
            ],
            dialogVisible: false,
            dialogFlag: "",
            cacheMember: {},
            formData: {
                trunk_id: 1,
                psc: 1,
                member_portlist: []
            }
        };
    },
    created() {
        this.getMember();
    },
    methods: {
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
            this.cacheMember = data;
            this.trunk_id = data.trunk_id;
            if (flag === "config") {
                this.formData.psc = data.psc;
            }
            if (flag === "delete") {
                this.formData.member_portlist = this.analysis(
                    data.member_portlist
                );
            }
        },
        closeDialog() {
            this.dialogVisible = false;
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
            if (this.dialogFlag === "add") {
                url = "/switch_trunk?form=link_aggregation_member";
                data = {
                    method: "set",
                    param: {
                        trunk_id: this.trunk_id,
                        member_portlist: this.formData.member_portlist
                            .sort((a,b) => a-b)
                            .toString()
                    }
                };
            }
            if (this.dialogFlag === "delete") {
                url = "/switch_trunk?form=link_aggregation_member";
                data = {
                    method: "delete",
                    param: {
                        trunk_id: this.trunk_id,
                        member_portlist: this.formData.member_portlist
                            .sort((a,b) => a-b)
                            .toString()
                    }
                };
            }
            if (this.dialogFlag === "config") {
                (url = "/switch_trunk?form=link_aggregation_psc"),
                    (data = {
                        method: "set",
                        param: {
                            trunk_id: this.trunk_id,
                            psc: this.formData.psc
                        }
                    });
            }
            this.$http.post(url, data).then(res =>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['setting_ok']
                    })
                    this.getMember();
                }else{
                    this.$message({
                        type: res.data.type,
                        text: `(${res.data.code}) ${res.data.message}`
                    })
                }
                this.closeDialog();
            }).catch(err =>{})
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
}
table {
    width: 100%;
    border: 1px solid #ccc;
    margin: 20px 10px 0 10px;
    td {
        padding: 8px 0 8px 10px;
    }
    span + span {
        margin-left: 10px;
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
        margin: 6px 0 0 110px;
    }
}
</style>
