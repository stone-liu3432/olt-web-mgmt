<template>
    <div id="content">
        <leftAside></leftAside>
        <detail></detail>
    </div>
</template>

<script>
import leftAside from '@/components/page/aside'
import detail from '@/components/page/detail'
export default {
    name: 'content-area',
    components: {
        leftAside,
        detail,
    },
    methods: {

    },
    created(){
        
    },
    beforeDestroy(){
        sessionStorage.removeItem('first_menu');
        sessionStorage.removeItem('sec_menu');
    },
}
</script>

<style lang="less" scoped>
#content{
    padding: 70px 0 30px 0;
    &::after{
        content: '';
        display: table;
        clear: both;
    }
}
</style>
