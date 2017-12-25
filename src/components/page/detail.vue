<template>
    <div id="detail" class="lf">
        <loading v-if="isLoading"></loading>
        <router-view></router-view>
    </div>
</template>

<script>
import loading from '@/components/common/loading'
import { mapMutations,mapState } from 'vuex'
    export default {
        name: 'detail',
        components: { loading },
        methosd: {
            ...mapMutations({
                isLoading: 'isLoading'
            }),
        },
        computed: mapState(['isLoading'])
    }    
</script>

<style>
#detail{
    margin:70px 0 0 220px;
    padding:20px;
    width:80%;
    min-width: 1060px;
    min-height:764px;
}
</style>
