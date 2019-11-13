<!-- <template>
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
     
</template> -->

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
            cancelBtnText: "cancel",
            center: false
        };
    },
    methods: {
        confirm() {
            return new Promise((resolve, reject) => {
                this.promiseActions = { resolve, reject };
            });
        },
        confirmHandle(){
            this.visible = false;
            return this.promiseActions.resolve('confirm');
        },
        cancelHandle(){
            this.visible = false;
            return this.promiseActions.reject('cancel');
        }
    },
    render(h){
        if(!this.visible){
            return '';
        }
        return (
            <div class="modal-dialog">
                <div class="cover"></div>
                <div class={ this.center ? 'layout-center' : ''}>
                    <div class="confirm-title">{ this.title || 'Notice' }</div>
                    <hr />
                    <div class="tool-tips">{ this.content ? this.content : 'Please confirm' }</div>
                    <div class="msg-box-footer">
                        <a href="javascript: void(0);" onClick={ this.confirmHandle }>{ this.confirmBtnText }</a>
                        <a href="javascript: void(0);" onClick={ this.cancelHandle }>{ this.cancelBtnText }</a>
                    </div>
                </div>
            </div>
        )
    }
};
</script>

<style scoped lang="less">
div.cover + div {
    width: 550px;
    height: 160px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: @modalContentBgColor;
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
    color: @titleColor;
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
    color: @borderColor;
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
    color: @hoverButtonColor;
}
a:active {
    border: 1px solid @activedButtonBorderColor;
}
.layout-center{
    .msg-box-footer{
        position: initial;
        margin: 30px 0 0 0;
        width: 100%;
        display: flex;
        justify-content: space-evenly;
    }
}
</style>