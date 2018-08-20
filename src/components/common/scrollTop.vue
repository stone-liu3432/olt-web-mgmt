<template>
    <div v-if="isShow">
        <i></i>
    </div>
</template>

<script>
export default {
    name: 'scrollTop',
    data(){
        return {
            isShow: false,
            distance: 200
        }
    },
    mounted(){
        window.addEventListener('scroll',this.attachScroll,false);
    },
    methods: {
        scroll_to_top(){
            var top = document.body.scrollTop || document.documentElement.scrollTop;
            var timer = setInterval(()=>{
                if(top){
                    document.body.scrollTop -= this.distance;
                    document.documentElement.scrollTop -= this.distance;
                }else {
                    clearInterval(timer);
                }
            },Math.floor(this.distance/top))
        },
        attachScroll(){
            if (document.documentElement.scrollTop + document.body.scrollTop > 500) {
                this.isShow=true;
            }else {
                this.isShow=false;
            }
        }
    },
    beforeDestroy(){
        window.removeEventListener('scroll',this.attachScroll);
    }
}
</script>

<style lang="less" scoped>
i{
    position: fixed;
    right: 80px;
    bottom: 100px;
    width: 32px;
    height: 32px;
    background: url('../../assets/back-top.png') no-repeat;
    cursor: pointer;
}
</style>
