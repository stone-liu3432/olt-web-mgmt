<template>
    <div>
        ounbasicinfo
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { mapMutations } from 'vuex'
    export default {
        name: 'onuBasicInfo',
        computed: mapState(['lanMap','port_name','menu'])
    }
</script>

<style scoped>

</style>