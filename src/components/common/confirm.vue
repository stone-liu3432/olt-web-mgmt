<template>
    <div class="modal-dialog">
        <div class="cover"></div>
        <div>
            <div class="confirm-title">{{ lanMap['tips'] }}</div>
            <hr>
            <div class="tool-tips">
                {{ this.toolTips ? this.toolTips : lanMap['if_sure'] + '?' }}
            </div>
            <div>
                <a href="javascript:;" @click="choose(true)">{{ lanMap['apply'] }}</a>
                <a href="javascript:;" @click="choose(false)">{{ lanMap['cancel'] }}</a>
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

<style scoped lang="less">
div.cover+div{
    width:550px;
    height:160px;
    position: absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);	
    background: @modalContentBgColor;
    z-index: 1000;
    padding: 20px 30px;
    overflow: hidden;
    border-radius: 5px;
    box-shadow: 0 0 20px #111;
}
div.confirm-title{
    font-weight: blod;
    font-size: 22px;
    margin-left: 20px;
    color: @titleColor;
}
div.tool-tips{
    width: 490px;
    padding: 0 30px;
    margin-top: 20px;
    font-size: 16px;
    line-height: 20px;
    text-align: left;
    color: #000;
}
hr{
    color: @borderColor;
}
div.tool-tips+div{
    position: absolute;
    right: 40px;
    bottom: 30px;
}
a{
    padding: 0;
    width: 120px;
    margin-left: 10px;
}
a:hover{
    color: @hoverButtonColor;
}
a:active{
    border: 1px solid @activedButtonBorderColor;
}
</style>