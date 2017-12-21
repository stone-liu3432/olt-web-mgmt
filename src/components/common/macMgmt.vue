<template>
    <div>
        <div>
            <h2>{{ lanMap['mac_mgmt'] }}</h2>
        </div>
        <div v-if="mac_age.data" class="mac-age">
            <span>{{ lanMap['age'] }} : </span>
            <span>{{ mac_age.data.age }}</span>
            <a href="javascript:;" @click="change_macage">{{ lanMap['config'] }}</a>
        </div>
        <div class="mac-age" v-if="cfg_age">
            <span>{{ lanMap['age'] }} : </span>
            <input type="text" v-model="macage" placeholder="secends">
            <a href="javascript:;" @click="macage_choose(true)">{{ lanMap['apply'] }}</a>
            <a href="javascript:;" @click="macage_choose(false)">{{ lanMap['cancel'] }}</a>
        </div>
        <ul class="mac-table" v-if="this.mac_table.data">
            <li>
                <span></span>
                <span v-for="(item,key) in mac_table.data[0].table[0]" :key="key">{{ lanMap[key] || key.replace(/_/g,' ').toUpperCase() }}</span>
            </li>
            <li></li>
        </ul>
    </div>
</template>

<script>
import { mapState } from 'vuex'
    export default {
        name: 'macMgmt',
        computed: mapState(['lanMap']),
        data(){
            return {
                mac_age: {},
                mac_table: {},
                // 绑定老化时间输入框
                macage: '',
                // 控制老化时间模态框显示隐藏
                cfg_age: false
            }
        },
        created(){
            this.$http.get('./mac_age.json').then(res=>{
                this.mac_age = res.data;
            }).catch(err=>{
                // to do 
            })
            this.$http.get('./mac_table.json').then(res=>{
                this.mac_table = res.data;
            }).catch(err=>{
                // to do 
            })
        },
        methods: {
            change_macage(){
                this.cfg_age = !this.cfg_age;
            },
            macage_choose(bool){
                if(bool && this.macage){
                    this.$http.get('/switch_mac?form=age&value=' + this.macage).then(res=>{
                        this.macage = '';
                    }).catch(err=>{
                        // to do 
                    })
                }
                this.cfg_age = false;
            }
        }
    }
</script>

<style scoped>
div>h2{
    font-size: 20px;
    font-weight: 600;
    color: #67AEF7;
    margin: 10px 0 20px 10px;
}
div.mac-age{
    margin-top: 20px;
    vertical-align: middle;
    line-height: 42px;
}
div.mac-age>span{
    display: inline-block;
    width: 100px;
    vertical-align: middle;
}
div.mac-age>input{
    vertical-align: middle;
}
div.mac-age>span:first-child{
    margin-left: 30px;
    font-size: 18px;
    font-weight: 600;
    color: #666;
}
a{
    display: inline-block;
    width: 120px;
    height: 30px;
    font-size: 16px;
    line-height: 30px;
    text-align: center;
    border-radius: 5px;
    background: #ddd;
    transition: all .1s linear;
    vertical-align: middle;
    margin: 5px;
}
a:active{
    border: 1px solid #67AEF7;
    background: #ccc;
}
.mac-table{
    margin: 20px 0 20px 10px;
}
</style>