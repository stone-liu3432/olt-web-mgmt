<template>
    <div id="left-aside" class="lf">
        <div class="menu-footer">
            <div v-if="company_name">
                <h4>{{ lanMap['company_name'] }}</h4>
                <p>{{ company_name }}</p>
            </div>
            <div v-if="company_addr">
                <h4>{{ lanMap['company_addr'] }}</h4>
                <p>{{ company_addr }}</p>
            </div>
            <div v-if="company_email">
                <h4>{{ lanMap['company_email'] }}</h4>
                <p>{{ company_email }}</p>
            </div>
            <div v-if="company_phone">
                <h4>{{ lanMap['company_phone'] }}</h4>
                <p>{{ company_phone }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
export default {
    name: 'leftAside',
    data(){
        return {
            company_name: '',
            company_addr: '',
            company_email: '',
            company_phone: ''
        }
    },
    props: ['subMenu'],
    created(){
        this.getData();
    },
    methods:{
        getData(){
            this.$http.get('/board?info=setting_board').then(res=>{
                if(res.data.code === 1){
                    var data = res.data.data;
                    this.company_name = data.name || '';
                    this.company_addr = data.addr || '';
                    this.company_email = data.email || '';
                    this.company_phone = data.phone || '';
                }else{
                    this.company_name = '';
                    this.company_addr = '';
                    this.company_email = '';
                    this.company_phone = '';
                }
            }).catch(err=>{
                // to do
            })
        }
    },
    computed: mapState(['lanMap','menu'])
}
</script>

<style scoped lang="less">
#left-aside{
    width: 220px;;
    height: 100%;
    overflow: auto;
    position: fixed;
    left: 0;
    top: 100px;
    border-right: 1px solid #eee; 
    z-index: 999;
    user-select: none;
    background: #eee;
}
ul{
    li{
        height: 40px;
        line-height: 40px;
        padding-left: 30px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        user-select: none;
    }
    li.actived{
        color: #67aef6;
        background: #eee;
    }
}
.menu-footer{
    font-size: 14px;
    text-align:center;
    margin: 60px auto 100px;
    div{
        margin: 20px 0;
    }
    h4{
        text-align: left;
        padding-left: 10px;
        margin-bottom: 10px;
    }
    p{
        padding-left: 15px;
        word-wrap: break-word;
        word-break: break-all;
        text-align: left;
    }
}
</style>
