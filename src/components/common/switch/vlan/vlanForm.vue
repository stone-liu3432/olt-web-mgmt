<template>
    <div>
        <div>
            <span>{{ lanMap["vlan_id"] }}:</span>
            <span>{{ row.vlan_id }}</span>
        </div>
        <div v-if="type === 'name'" key="vlan-name">
            <span>{{ lanMap["name"] }}:</span>
            <input
                type="text"
                v-model="form.vlan_name"
                :style="{
                    'border-color': form.vlan_name.length > 16 ? 'red' : '',
                }"
            />
            <span class="tips">{{ lanMap.composeRange(0, 16) }}</span>
        </div>
        <div v-if="type === 'desc'" key="vlan-desc">
            <span>{{ lanMap["desc"] }}:</span>
            <textarea
                spellcheck="false"
                v-model="form.vlan_desc"
                :style="{
                    'border-color': form.vlan_desc.length > 64 ? 'red' : '',
                }"
            ></textarea>
            <span class="tips">{{ lanMap.composeRange(0, 64) }}</span>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "vlanForm",
    computed: {
        ...mapState(["lanMap"]),
    },
    data() {
        return {
            type: "",
            row: {},
            form: {
                vlan_id: "",
                vlan_name: "",
                vlan_desc: "",
            },
        };
    },
    methods: {
        init(type, row) {
            this.type = type;
            this.row = row;
            this.form.vlan_id = row.vlan_id;
            this.form.vlan_name = row.vlan_name;
            this.form.vlan_desc = row.vlan_desc;
        },
        validate(fn) {
            if (this.type === "name") {
                if (this.form.vlan_name.length > 16) {
                    return this.$message.error(
                        `${this.lanMap["param_error"]}: ${this.lanMap["name"]}`
                    );
                }
                if (this.form.vlan_name === this.row.vlan_name) {
                    return this.$message.info(this.lanMap["modify_tips"]);
                }
            }
            if (this.type === "desc") {
                if (this.form.vlan_desc.length > 64) {
                    return $message.error(
                        `${this.lanMap["param_error"]}: ${this.lanMap["desc"]}`
                    );
                }
                if (this.form.vlan_desc === this.row.vlan_desc) {
                    return this.$message.info(this.lanMap["modify_tips"]);
                }
            }
            fn.call(this, this.type, this.form);
        },
    },
};
</script>

<style lang="less" scoped>
div {
    margin: 20px 0;
    > span {
        display: inline-block;
        vertical-align: middle;
        &:first-child {
            width: 120px;
            text-align: right;
            padding-right: 12px;
        }
    }
    textarea {
        width: 340px;
        height: 72px;
        vertical-align: top;
        border-radius: 3px;
        resize: none;
        padding: 6px;
        word-wrap: break-word;
        word-break: break-all;
        font-size: 16px;
        &:focus {
            outline: none;
            border-color: @activedFormBorderColor;
        }
    }
    input + span,
    textarea + span {
        color: @tipsColor;
        font-size: @tipsFontSize;
        margin-left: 12px;
    }
}
</style>