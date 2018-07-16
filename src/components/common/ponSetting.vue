<template>
    <div class="pon-setting">
        <h2>{{ lanMap['pon_setting'] }}</h2>
        <div v-if="pon_authorize.data && pon_authorize.data.length > 0">
            <h3>{{ lanMap['pon_auth'] }}</h3>
            <ul>
                <li>{{ lanMap['port_id'] }}</li>
                <li v-for="(item,key) in pon_authorize.data[0]" :key="key" v-if="key !== 'port_id'">{{ lanMap[key] }}</li>
                <li>{{ lanMap['config'] }}</li>
            </ul>
            <ul v-for="(item,key) in pon_authorize.data" :key="key">
                <li>
                    {{ port_name.pon[item.port_id].name }}
                </li>
                <li>
                    {{ def_auth_type[item.auth_type] }}
                </li>
                <li>
                    {{ def_auth_mode[item.auth_mode] }}
                </li>
                <li>
                    <a href="javascript:void(0);" @click="auth_confirm(item.port_id)">{{ lanMap['config'] }}</a>
                </li>
            </ul>
        </div>
        <div v-else class="no-more-data">{{ lanMap['no_more_data'] }}</div>
        <div class="modal-dialog" v-if="isSetAuth">
            <div class="cover"></div>
            <div class="ponmgmt-cfg">
                <div>
                    {{ lanMap['pon_auth'] }}
                </div>
                <div>
                    <div>{{ lanMap['port_id'] }}</div>
                    <span>{{ port_id }}</span>
                </div>
                <div>
                    <div>{{ lanMap['auth_type'] }}</div>
                    <select v-model.number="auth_type">
                        <option value="0">Auto</option>
                        <option value="1">Manual</option>
                    </select>
                </div>
                <div>
                    <div>{{ lanMap['auth_mode'] }}</div>
                    <select v-model.number="auth_mode">
                        <option value="0">MAC</option>
                        <option value="1">LOID</option>
                        <option value="2">LOID+password</option>
                        <option value="3">Hybrid</option>
                    </select>
                </div>
                <div>
                    <a href="javascript:void(0);" @click="set_auth">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" @click="cancel_confirm">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="cancel_confirm"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'ponSetting',
    computed: mapState(['lanMap','port_name']),
    data(){
        return {
            port_id: 0,
            auth_type: 0,
            auth_mode: 0,
            def_auth_type: ['Auto', 'Manual'],
            def_auth_mode: ['mac','LOID','Loid+password','hybrid'],
            pon_authorize: {},
            isSetAuth: false
        }
    },
    created(){
        this.getData();
    },
    activated(){
        this.getData();
    },
    methods: {
        getData(){
            this.$http.get('/ponmgmt?form=authorize').then(res=>{
                if(res.data.code === 1){
                    this.pon_authorize = res.data;
                }else{
                    this.pon_authorize = {};
                }
            }).catch(err=>{
                // to do
            })
        },
        auth_confirm(port_id){
            this.isSetAuth = true;
            this.port_id = port_id;
        },
        set_auth(){
            var params = {
                "method":"set",
                "param":{
                    "port_id": this.port_id,
                    "auth_type": this.auth_type,
                    "auth_mode": this.auth_mode
                }
            }
            this.$http.post('/ponmgmt?form=authorize',params).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['st_success']
                    })
                    this.getData();
                }else{
                    this.$message({
                        type: 'error',
                        text: res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.isSetAuth = false;
            this.port_id = 0;
        },
        cancel_confirm(){
            this.isSetAuth = false;
            this.port_id = 0;
        }
    }
}
</script>

<style lang="less" scoped>
div.pon-setting{
    margin-top: 20px;
    h2{
        font-size: 20px;
        font-weight: 600;
        color: #67AEF7;
        margin: 10px 0 20px 10px;
    }
    h3{
        margin: 20px 0 20px 15px;
        font-size: 18px;
        font-weight: 500;
        color: #67aef7;
    }
}
div.ponmgmt-cfg{
    width: 500px;
    height: 300px;
    background: #fff;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    border-radius: 10px;
    >div{
        margin: 20px;
        height: 30px;
        line-height: 30px;
        &:after{
            content: '';
            display: table;
            clear: both;
        }
        &:first-child{
            text-align: center;
            color: #67aef7;
        }
        >div{
            float: left;
            width: 200px;
            text-align: right;
            padding-right: 20px;
        }
        select{
            width: 150px;
            text-indent: 6px;
            border-radius: 5px;
            height: 30px;
            font-size: 15px;
            line-height: 30px;
        }
    }
    div.close{
        margin: 0;
        height: 60px;
    }
}
a{
    font-size: 16px;
    display: inline-block;
    width: 120px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    background: #666;
    border-radius: 5px;
    color: #fff;
    margin-left: 70px;
    margin-top: 20px;
}
ul{
    &:after{
        content: '';
        display: table;
        clear: both;
    }
    margin-left: 20px;
    &:last-child{
        >li{
            border-bottom: 1px solid #ccc;
        }
    }
    >li{
        float: left;
        width: 20%;
        text-align: center;
        height: 30px;
        line-height: 30px;
        border: 1px solid #ccc;
        border-right: none;
        border-bottom: none;
        &:last-child{
            border-right: 1px solid #ccc;
        }
        >a{
            margin: 0;
        }
    }
    a{
        height: 26px;
        line-height: 26px;
    }
}
div.no-more-data{
    color: red;
    margin: 20px; 
}
</style>
