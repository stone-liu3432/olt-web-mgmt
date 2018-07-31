<template>
    <div class="multicast">
        <div>
            <span>{{ lanMap['multicast'] }}</span>
            <span>
                <a href="javascript:void(0);">{{ lanMap['config'] }}</a>
            </span>
        </div>
        <ul v-if="multicast_info.data && multicast_info.data.length > 0">
            <li>
                <span>{{ lanMap['multi_ip'] }}</span>
                <span>{{ lanMap['vid'] }}</span>
                <span>{{ lanMap['action'] }}</span>
                <span>{{ lanMap['host_portlist'] }}</span>
                <span>{{ lanMap['config'] }}</span>
            </li>
            <li v-for="(item,key) in multicast_info.data" :key="key" class="multi-item">
                <span>{{ item.multi_ip }}</span>
                <span>{{ item.vid }}</span>
                <span>{{ item.action }}</span>
                <span>{{ item.host_portlist }}</span>
                <span>
                    <a href="javascript:void(0);">{{ lanMap['delete'] }}</a>
                </span>
            </li>
        </ul>
        <div class="tab-bar">
            <div>></div>
            <div>5</div>
            <div>4</div>
            <div>3</div>
            <div>2</div>
            <div>1</div>
            <div><</div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'multicast',
    computed: mapState(['lanMap','change_url']),
    data(){
        return {
            multicast_info: {}
        }
    },
    created(){
        this.getData();
    },
    methods: {
        getData(){
            this.$http.get(this.change_url.get_multicast).then(res=>{
                if(res.data.code === 1){
                    this.multicast_info = res.data;
                }else{
                    this.multicast_info = {};
                }
            }).catch(err=>{
                // to do
            })
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
div.multicast{
    >div:first-child{
        span{
            font-size: 18px;
            color: #67aef7;
        }
    }
    div+ul{
        margin: 20px 0 0 0;
        display: table;
        width: 100%;
        box-sizing: border-box;
        li{
            height: 32px;
            line-height: 30px;
            display: table-row;
            span{
                box-sizing: border-box;
                display: table-cell;
                width: 19%;
                text-align: center;
                border: 1px solid #ccc;
                border-right: none;
                border-bottom: none;
                &:last-child{
                    border-right: 1px solid #ccc;
                }
            }
            a{
                margin: 0;
                height: 26px;
                line-height: 26px;
                box-sizing: border-box;
            }
            &:last-child{
                span{
                    border-bottom: 1px solid #ccc;
                }
            }
        }
    }
    div.tab-bar{
        margin-top: 8px;
        div{
            float: right;
            width: 30px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            border: 1px solid #ccc;
            border-left: none;
            font-weight: 500;
            &:last-child{
                border-radius: 5px 0 0 5px;
                border-left: 1px solid #ccc;
            }
            &:first-child{
                border-radius: 0 5px 5px 0;
            }
        }
    }
}
</style>
