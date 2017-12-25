<template>
  <div id="main-content">
      <topBanner></topBanner>
      <leftAside></leftAside>
      <detail></detail>
  </div>
</template>

<script>
import leftAside from '@/components/page/aside'
import detail from '@/components/page/detail'
import topBanner from '@/components/page/header'
    export default {
        name: 'mainContent',
        components: {
            leftAside,
            detail,
            topBanner
        }
    }
</script>

<style>
#main-content{
    height:100%;
}
</style>
