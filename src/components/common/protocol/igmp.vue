<template>
    <div>
        igmp
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'igmp',
    computed: mapState(['lanMap','change_url','port_name']),
    data(){
        return {

        }
    }
}
</script>

<style lang="less" scoped>

</style>
