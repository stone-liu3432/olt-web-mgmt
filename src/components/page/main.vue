<template>
  <div id="main-content">
      <topBanner></topBanner>
      <leftAside></leftAside>
      <detail v-if="port_info && system"></detail>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import { mapState } from 'vuex'
import leftAside from '@/components/page/aside'
import detail from '@/components/page/detail'
import topBanner from '@/components/page/header'
    export default {
        name: 'mainContent',
        components: {
            leftAside,
            detail,
            topBanner
        },
        created(){
            this.$router.push('/main');
        },
        computed: mapState(['port_info','system'])
    }
</script>

<style>
#main-content{
    height:100%;
}
</style>
