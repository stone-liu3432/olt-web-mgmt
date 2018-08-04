<template>
    <div class="multi-vlan">
        <div>
            <span>{{ lanMap['mvlan'] }}</span>
            <span>
                <a href="javascript:void(0);">{{ lanMap['add'] }}</a>
            </span>
        </div>
        <div v-if="mv_info.data && mv_info.data.length > 0">
            <span>{{ lanMap['mvlan'] }}</span>
            <select>
                <option :value="item.mvlan" v-for="(item,index) in mv_info.data" :key="index">{{ item.mvlan }}</option>
            </select>
        </div>
        <div>
            <span>{{ lanMap['router_portlist'] }}</span>
            <span></span>
        </div>
        <div>
            <span>{{ lanMap['mc_unknown_policy'] }}</span>
            <span></span>
        </div>
        <div>
            <span>{{ lanMap['program'] }}</span>
            <span></span>
            <span></span>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'multicastVlan',
    computed: mapState(['lanMap','change_url']),
    data(){
        return {
            mv_info: {},
            router_plist: {},
            mvlan: 0,
            mc_unknow_info: {},
            program: {}
        }
    },
    created(){
        this.get_multi_vlan();
    },
    methods: {
        //  获取组播VLAN列表
        get_multi_vlan(){
            var url = this.change_url.get_multi_vlan;
            if(this.change_url.beta === 'beta'){
                url = this.change_url.get_multi_vlan + this.mvlan;
            }
            this.$http.get(url).then(res=>{
                if(res.data.code === 1){
                    this.mv_info = res.data;
                    if(res.data.data && res.data.data.length > 0){
                        if(!this.mvlan){
                            this.mvlan = res.data.data[0].mvlan;
                            this.router_plist = res.data.data[0];
                        }
                    }
                }else{
                    this.mv_info = {};
                }
            }).catch(err=>{
                // to do
            })
        },
        //  获取未知多播策略信息
        get_mc_unknow(){
            var url = this.change_url.get_mc_unknow;
            if(this.change_url.beta === 'beta'){
                url = this.change_url.get_mc_unknow + this.mvlan;
            }
            this.$http.get(url).then(res=>{
                if(res.data.code === 1){
                    this.mc_unknow_info = res.data;
                }else{
                    this.mc_unknow_info = {};
                }
            }).catch(err=>{
                // to do
            })
        },
        //  获取节目库信息
        get_program(){
            var url = this.change_url.get_program ;
            if(this.change_url.beta === 'beta'){
                url = this.change_url.get_multi_vlan + this.mvlan;
            }
            this.$http.get(url).then(res=>{
                if(res.data.code === 1){
                    this.program = res.data;
                }else{
                    this.program = {};
                }
            }).catch(err=>{
                // to do
            })
        }
    },
    watch: {
        mvlan(){
            if(!this.mvlan) return
            this.get_mc_unknow();
            this.get_program();
        }
    }
}
</script>

<style lang="less" scoped>
a{
    font-size: 16px;
    display: inline-block;
    padding: 0 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    background: #666;
    border-radius: 3px;
    color: #fff;
    margin-left: 100px;
    vertical-align: middle;
}
select{
    width: 200px;
    height: 30px;
    text-indent: 6px;
    border-radius: 3px;
    font-size: 16px;
}
div.multi-vlan{
    >div:first-child{
        span{
            font-size: 18px;
            color: #67aef7;
        }
        a:last-child{
            margin-left: 30px;
        }
    }
}
</style>
