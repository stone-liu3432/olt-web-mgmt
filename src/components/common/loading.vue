<template>
    <div class="cover-load">
        <div class="loading"></div>
    </div>
</template>

<script>
    export default {
        name: 'loading'
    }
</script>

<style scoped>
.cover-load{
    width:100%;
    height:100%;
    position: absolute;
    top:200px;
    left: 50%;
}
.loading{
    width: 120px;
    height: 120px; 
    background: url("../../assets/loading.gif") no-repeat;
}
</style>