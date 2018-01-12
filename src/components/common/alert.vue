<template>
  <transition name="message-fade">
    <div class="message" v-show="show">
    <span class="icon"><icon name="info"></icon></span>
      <p>{{message}}</p>
    </div>
  </transition>
</template>
 
<script>
export default {
    name: 'alert',
    data(){
        return {
            timer: null,
            msg: '',
            isShow: false
        }
    },
    methods: {
        showMsgBox(){
            this.isShow = true;
        }
    },
    mounted(){
        var sec = 1;
        var tips = document.getElementById('cfg-success');
        if(this.timer){
            clearInterval(timer);
        }
        this.timer = setInterval(()=>{
            tips.style.opacity = sec;
            sec -= 0.1;
            if(sec <= 0){
                clearInterval(this.timer);
                this.isShow = false;
            }
        },100)
    }
}
</script>

<style scoped>
div.modal-dialog>div{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    width: 200px;
    height: 50px;
    color: #fff;
    line-height: 50px;
    background: #409eff;
    border-radius: 5px;
    text-align: center;
}
div.success{
    background: #67c23a;
}
div.warming{
    background: #e6a23c;
}
div.danger{
    background: #f56c6c;
}
div.info{
    background: #909399;
}
</style>

