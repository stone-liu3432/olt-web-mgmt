<template>
    <div :class="['modal-dialog', customClass]" v-if="visible">
        <div class="cover"></div>
        <div :style="{ width }">
            <div class="modal-header">
                <slot name="title">
                    {{ title }}
                </slot>
            </div>
            <div class="nms-dialog-content">
                <slot></slot>
            </div>
            <div class="nms-dialog-footer">
                <slot name="footer"></slot>
            </div>
            <div class="close" v-if="showClose" @click="closeDialog()"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'nmsDialog',
    data(){
        return {}
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        title: {
            type: String
        },
        showClose: {
            type: Boolean,
            default: true
        },
        beforeClose: {
            type: Function
        },
        customClass: {
            type: String
        },
        width: {
            type: String,
            default: '70%'
        }
    },
    methods: {
        //  在设置了beforeClose回调时，回调的第一个参数为关闭dialog的回调，需手动调用
        closeDialog(){
            if(typeof this.beforeClose === 'function'){
                this.beforeClose(this.close);
                return
            }
            this.close();
        },
        close(){
            this.$emit('update:visible', false);
        }
    }
}
</script>

<style lang="less" scoped>
div.modal-dialog{
    >div.cover+div{
        height: auto;
    }
}
.nms-dialog-content{
    margin: 20px;
    overflow-y: auto;
    max-height: 600px;
}
.nms-dialog-footer{
    margin: 20px 0;
    div{
        display: flex;
        justify-content: space-evenly;
    }
}
</style>