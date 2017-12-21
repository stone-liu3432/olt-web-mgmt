<template>
    <div class="modal-dialog">
        <div class="cover"></div>
        <div>
            <div class="tool-tips">
                {{ this.toolTips ? this.toolTips : '是否确认？' }}
            </div>
            <div>
                <a href="javascript:;" @click="choose(true)">确定</a>
                <a href="javascript:;" @click="choose(false)">取消</a>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
    export default {
        name: 'confirm',
        props: ['toolTips'],
        computed: mapState(['lanMap']),
        data(){
            return {}
        },
        methods: {
            choose(bool){
                this.$emit('choose',bool);
            }
        }
    }
</script>

<style scoped>
div.cover+div{
    width:550px;
    height:180px;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    background: #fff;
    z-index: 600;
    padding: 20px 30px;
    overflow: hidden;
    border-radius: 5px;
}
.tool-tips{
    width: 550px;
    margin-top: 20px;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
}
.tool-tips+div{
    display: flex;
    justify-content: space-around;
    margin-top: 50px;
}
a{
    display: inline-block;
    width: 120px;
    height: 36px;
    line-height: 36px;
    border-radius: 5px;
    background: #ddd;
    text-align: center;
    margin-left: 10px;
}
</style>