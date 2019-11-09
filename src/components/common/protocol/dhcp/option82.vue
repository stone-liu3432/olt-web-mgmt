<template>
    <div class="dhcp-option82">
        <div class="option82-item">
            <span>{{ lanMap['option82_admin'] }}:</span>
            <span>{{ admin === 1 ? lanMap['enable'] : lanMap['disable'] }}</span>
            <a
                href="javascript: void(0);"
                style="margin-left: 30px;"
                @click="openDialog('admin')"
            >{{ lanMap['config'] }}</a>
        </div>
        <div v-if="admin === 1">
            <div class="option82-item">
                <span>{{ lanMap['option82_policy'] }}:</span>
                <span>{{ lanMap[policies[policy]] }}</span>
                <a
                    href="javascript: void(0);"
                    style="margin-left: 30px;"
                    @click="openDialog('policy')"
                >{{ lanMap['config'] }}</a>
            </div>
            <div class="option82-item">
                <span>{{ lanMap['option82_circuit'] }}:</span>
                <span>{{ circuits[circuit] }}</span>
            </div>
            <div class="option82-item">
                <span>{{ lanMap['option82_remote'] }}:</span>
                <span>{{ remotes[remote] }}</span>
            </div>
        </div>
        <nms-dialog :visible.sync="visible" width="500px">
            <div slot="title">{{ lanMap['set'] }}</div>
            <div v-if="dialogType === 'admin'" class="modal-item">
                <span>{{ lanMap['option82_admin'] }}</span>
                <select v-model.number="option82_admin">
                    <option :value="0">{{ lanMap['disable'] }}</option>
                    <option :value="1">{{ lanMap['enable'] }}</option>
                </select>
            </div>
            <div v-if="dialogType === 'policy'" class="modal-item">
                <span>{{ lanMap['option82_policy'] }}</span>
                <select v-model.number="option82_policy">
                    <option :value="0">{{ lanMap['reserve'] }}</option>
                    <option :value="1">{{ lanMap['drop'] }}</option>
                    <option :value="2">{{ lanMap['replace'] }}</option>
                </select>
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
export default {
    name: "option82",
    computed: {
        ...mapState(["lanMap"]),
        admin() {
            return this.globalData.option82_admin;
        },
        policy() {
            return this.globalData.option82_policy;
        },
        circuit() {
            return this.globalData.option82_circuit;
        },
        remote() {
            return this.globalData.option82_remote;
        }
    },
    data() {
        return {
            policies: ["reserve", "drop", "replace"],
            circuits: ["", "VLAN+PORT"],
            remotes: ["", "OLT MAC"],
            visible: false,
            //  dialog的 type: admin / policy
            dialogType: "",
            option82_admin: 0,
            option82_policy: 0
        };
    },
    props: {
        globalData: {
            type: Object,
            required: true
        }
    },
    methods: {
        closeDialog() {
            this.visible = false;
        },
        openDialog(flag) {
            this.dialogType = flag;
            this.visible = true;
            this.option82_admin = this.admin || 0;
            this.option82_policy = this.policy;
        },
        submitForm() {
            const actions = {
                admin() {
                    if (this.option82_admin === this.admin) {
                        this.closeDialog();
                        return;
                    }
                    const data = {
                        method: "set",
                        param: {
                            option82_admin: this.option82_admin
                        }
                    };
                    this.postData("/switch_dhcp?form=option82_admin", data);
                },
                policy() {
                    if (this.option82_policy === this.policy) {
                        this.closeDialog();
                        return;
                    }
                    const data = {
                        method: "set",
                        param: {
                            option82_policy: this.option82_policy
                        }
                    };
                    this.postData("/switch_dhcp?form=option82_policy", data);
                }
            };
            if (typeof actions[this.dialogType] === "function") {
                actions[this.dialogType].call(this);
            }
        },
        updateData() {
            this.$emit("update-data");
        },
        postData(url, data) {
            this.$http
                .post(url, data)
                .then(res => {
                    if (res.data.code === 1) {
                        this.$message.success(
                            this.lanMap["set"] + this.lanMap["st_success"]
                        );
                        this.updateData();
                    } else {
                        this.$message.error(
                            `(${res.data.code}) ${res.data.message}`
                        );
                    }
                    this.closeDialog();
                })
                .catch(err => {});
        }
    }
};
</script>

<style lang="less" scoped>
.dhcp-option82 {
    div.option82-item {
        margin: 20px 10px;
        line-height: 30px;
        > span {
            display: inline-block;
            &:first-child {
                width: 220px;
            }
        }
    }
}
select {
    width: 200px;
}
.modal-item {
    span {
        &:first-child {
            display: inline-block;
            width: 150px;
        }
    }
}
</style>