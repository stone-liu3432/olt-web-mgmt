<template>
    <div id="detail" class="lf">
        <router-view v-if="isRouterAlive"></router-view>
    </div>
</template>

<script>
    export default {
        name: 'detail',
        data(){
            return {
                isRouterAlive: true
            }
        },
        created(){
            document.body.addEventListener('keydown',this.preventRefresh,false);
        },
        methods: {
            reload(){
                this.isRouterAlive = false;
                this.$nextTick(()=>{
                    this.isRouterAlive = true;
                })
            },
            //  接管f5刷新页面
            preventRefresh(e){
                var e = window.event || e;
                if(e.keyCode === 116 || (e.ctrlKey && e.keyCode==82)){
                    if(window.event){
                        try{e.keyCode = 0}catch(e){}
                        e.returnValue = false;
                    }
                    e.preventDefault();
                    this.reload();
                    return false
                }
            }
        },
        beforeDestroy(){
            document.body.removeEventListener('keydown',this.preventRefresh);
        }
    }
</script>

<style>
#detail{
    margin:70px 0 0 200px;
    padding:20px;
    width: 81%;
    min-width: 1020px;
    min-height:764px;
}
</style>
