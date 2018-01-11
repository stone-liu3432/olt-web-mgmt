<template>
    <div class="modal-dialog" id="cfg-success">
        <div class="content">
            {{ msg }}
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'alert',
    props: ['msg'],
    methods: {

    },
    mounted(){
        var sec = 1;
        var tips = document.getElementById('cfg-success');
        var timer = setInterval(()=>{
            tips.style.opacity = sec;
            sec -= 0.1;
            if(sec <= 0){
                clearInterval(timer);
                tips.style.display = 'none';
            }
        },100)
    }
}
</script>

<style scoped>
div.modal-dialog{
    /* display: none; */
}
div.content{
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
    background: #666;
    border-radius: 5px;
    text-align: center;
}
</style>

