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
        methods: {
            reload(){
                this.isRouterAlive = false;
                this.$nextTick(()=>{
                    this.isRouterAlive = true;
                })
            }
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
