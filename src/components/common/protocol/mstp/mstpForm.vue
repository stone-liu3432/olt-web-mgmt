<template>
    <div>
        <div class="mstp-form-item">
            <span>{{ lanMap[type] }}</span>
            <template v-if="type === 'status'">
                <select v-model.number="form[type]">
                    <option :value="0">{{ lanMap['disable'] }}</option>
                    <option :value="1">{{ lanMap['enable'] }}</option>
                </select>
            </template>
            <template v-else>
                <input type="text" v-model="form[type]" :style="inputStyle" />
                <span>{{ TIPS_MAP[type] }}</span>
            </template>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "mstpForm",
    computed: {
        ...mapState(["lanMap"]),
        validateName() {
            return /^.{0,32}$/.test(this.form.regional_name);
        },
        validateLevel() {
            const val = this.form.revision_level >>> 0;
            return val >= 0 && val <= 65535;
        },
        inputStyle() {
            if (this.type === "regional_name") {
                return this.validateName ? "" : { "border-color": "red" };
            } else if (this.type === "revision_level") {
                return this.validateLevel ? "" : { "border-color": "red" };
            }
        }
    },
    data() {
        return {
            form: {
                status: 0,
                regional_name: "",
                revision_level: ""
            },
            type: "",
            TIPS_MAP: {
                regional_name: "Length: 0-32 character",
                revision_level: "Range: 0-65535"
            }
        };
    },
    methods: {
        init(type, data) {
            this.type = type;
            this.form[type] = type === "status" ? data : data[type];
        },
        validate(fn) {
            if (typeof fn === "function") {
                if (this.type === "status") {
                    fn.call(this, this.type, this.form.status);
                } else if (this.type === "regional_name") {
                    this.validateName &&
                        fn.call(this, this.type, this.form.regional_name);
                } else if (this.type === "revision_level") {
                    this.validateLevel &&
                        fn.call(this, this.type, this.form.revision_level);
                }
            }
        }
    }
};
</script>

<style lang="less" scoped>
.mstp-form-item {
    > span:first-child {
        display: inline-block;
        width: 120px;
        vertical-align: middle;
        text-align: center;
    }
    > select {
        width: 200px;
    }
    input + span {
        margin-left: 6px;
        color: @tipsColor;
        font-size: @tipsFontSize;
    }
}
</style>