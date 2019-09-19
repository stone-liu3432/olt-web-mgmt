<template>
    <div v-if="visible" class="modal-dialog">
        <div class="cover"></div>
        <div>
            <div class="confirm-title">{{ title || 'Notice' }}</div>
            <hr />
            <div class="tool-tips">{{ content ? content : 'Please confirm' }}</div>
            <div>
                <a href="javascript:;" @click="handleAction('confirm')">{{ 'apply' }}</a>
                <a href="javascript:;" @click="handleAction('cancel')">{{ 'cancel' }}</a>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "serviceConfirm",
    data() {
        return {
            visible: false,
            promiseActions: {},
            content: "",
            title: "",
            confirmBtnText: "ok",
            cancelBtnText: "cancel"
        };
    },
    methods: {
        confirm() {
            this.visible = true;
            return new Promise((resolve, reject) => {
                this.promiseActions = { resolve, reject };
            });
        },
        handleAction(action) {
            this.visible = false;
            action === "confirm" && this.promiseActions.resolve();
            action === "cancel" && this.promiseActions.reject();
        }
    }
};
</script>

<style scoped>
div.cover + div {
    width: 550px;
    height: 160px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    z-index: 1000;
    padding: 20px 30px;
    overflow: hidden;
    border-radius: 5px;
    box-shadow: 0 0 20px #111;
}
div.confirm-title {
    font-weight: blod;
    font-size: 22px;
    margin-left: 20px;
    color: #67aef7;
}
div.tool-tips {
    width: 490px;
    padding: 0 30px;
    margin-top: 20px;
    font-size: 16px;
    line-height: 20px;
    text-align: left;
    color: #000;
}
hr {
    color: #ddd;
}
div.tool-tips + div {
    position: absolute;
    right: 40px;
    bottom: 30px;
}
a {
    padding: 0;
    width: 120px;
    margin-left: 10px;
}
a:hover {
    color: #67aef7;
}
a:active {
    border: 1px solid #67aef7;
}
</style>