<template>
  <div id="main-content">
      <leftAside></leftAside>
      <detail></detail>
  </div>
</template>

<script>
import leftAside from '@/components/page/aside'
import detail from '@/components/page/detail'
    export default {
        name: 'mainContent',
        components: {
            leftAside,
            detail
        }
    }
</script>

<style>
#main-content{
    height:100%;
}
</style>
