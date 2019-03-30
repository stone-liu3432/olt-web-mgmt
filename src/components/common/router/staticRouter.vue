<template>
    <div>
        <h3>{{ lanMap['route'] }}</h3>
        <div class="route-state">
            <span>{{ lanMap['route'] + lanMap['status'] }}</span>
            <div class="switch" @click="changeRouteState">
                <input type="checkbox" v-model="status">
                <span :class="{ 'checked' : status }"></span>
            </div>
        </div>
        <h3 v-if="!!status">
            {{ lanMap['static_route'] }}
            <a href="javascript:void(0)" @click="openSetModal('add')">{{ lanMap['add'] }}</a>
        </h3>
        <div v-if="!!status && static_router.data">
            <ul class="static-route-item">
                <li>{{ lanMap['ipaddr'] }}</li>
                <li>{{ lanMap['ipmask'] }}</li>
                <li>{{ lanMap['nexthop'] }}</li>
                <li>{{ lanMap['interface'] }}</li>
                <li>{{ lanMap['protocol'] }}</li>
                <li>{{ lanMap['preference'] }}</li>
                <li>{{ lanMap['status'] }}</li>
                <li>{{ lanMap['config'] }}</li>
            </ul>
            <!-- protocol目前只有static(0)和direct(1)两种协议 -->
            <!-- status有reachable(1)和unreachable(2)两种状态 -->
            <!-- interface 100代表VlanIf100 -->
            <div class="static-route">
                <ul v-for="(item,key) in static_router.data" :key="key" class="static-route-item">
                    <li>{{ item.ipaddress }}</li>
                    <li>{{ item.mask }}</li>
                    <li>{{ item.nexthop }}</li>
                    <li>{{ item.interface }}</li>
                    <!-- dynamic 预留 -->
                    <li>{{ item.protocol === 'to do' ?  'to do' : item.protocol === 1 ? 'direct' : 'static' }}</li>
                    <li>{{ item.preference }}</li>
                    <li>{{ item.status ? 'reachale' : 'unreachale' }}</li>
                    <li>
                        <i class="icon-config" @click="openSetModal('set', item)"></i>
                        <i class="icon-delete" @click="openDeleteModal(item)"></i>
                    </li>
                </ul>
            </div>
        </div>
        <div class="modal-dialog" v-if="!!setModal">
            <div class="cover"></div>
            <div>
                <div class="set-route-item">
                    <h4 class="modal-header" v-if="setModal === 'add'">{{ lanMap['add'] }}</h4>
                    <h4 class="modal-header" v-if="setModal === 'set'">{{ lanMap['config'] }}</h4>
                    <div>
                        <span>{{ lanMap['ipaddr'] }}</span>
                        <input type="text" v-model="ipaddr"
                            :style="{ 'border-color': ipaddr !== '' && !ip_reg.test(ipaddr) ? 'red' : '' }">
                        <span>EX. 127.0.0.1</span>
                    </div>
                    <div>
                        <span>{{ lanMap['ipmask'] }}</span>
                        <input type="text" v-model="ipmask"
                            :style="{ 'border-color': ipmask !== '' && !ip_reg.test(ipmask) ? 'red' : '' }">
                        <span>EX. 255.255.255.0</span>
                    </div>
                    <div>
                        <span>{{ lanMap['nexthop'] }}</span>
                        <input type="text" v-model="nexthop"
                            :style="{ 'border-color': nexthop !== '' && !ip_reg.test(nexthop) ? 'red' : '' }">
                        <span>EX. 127.0.0.1</span>
                    </div>
                    <div>
                        <a href="javascript:void(0);" @click="setStitacRouter">
                            {{ lanMap['apply'] }}
                        </a>
                        <a href="javascript:void(0);" @click="closeModal">
                            {{ lanMap['cancel'] }}
                        </a>
                    </div>
                </div>
                <div class="close" @click="closeModal"></div>
            </div>
        </div>
        <confirm v-if="delModal" @choose="deleteStaticRouter"></confirm>
    </div>
</template>

<script>
import { mapState } from "vuex"
export default {
    name: 'staticRouter',
    computed: mapState(["change_url", 'lanMap']),
    data(){
        return {
            status: false,
            interval: false,
            static_router: {},
            cache_router: {},
            setModal: '',
            delModal: false,
            ipaddr: '',
            ipmask: '',
            nexthop: '',
            ip_reg: /^(((25[0-5])|(2[0-4]\d)|(1\d\d)|(\d?\d))\.){3}(((25[0-5])|2[0-4]\d)|(1\d\d)|(\d?\d))$/
        }
    },
    created(){
        this.getState();
        this.getData();
    },
    methods: {
        getState(){
            this.$http.get('/switch_route?form=admin_status').then(res =>{
                if(res.data.code === 1){
                    if(res.data.data){
                        this.status = !!res.data.data.status;
                    }else{
                        this.status = false;
                    }
                }else{
                    this.status = false;
                }
            }).catch(err =>{

            })
        },
        changeRouteState(){
            if(!this.interval){
                this.interval = true;
                //this.status = !this.status;
                var post_data = {
                    "method": "set",
                    "param": {
                        "status": this.status ? 0 : 1
                    }
                }
                this.$http.post('/switch_route?form=admin', post_data).then(res =>{
                    if(res.data.code === 1){
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap['setting_ok']
                        })
                        this.getState();
                    }else{
                        this.$message({
                            type: res.data.type,
                            text: '(' + res.data.code + ') ' + res.data.message
                        })
                    }
                }).catch(err =>{

                })
                setTimeout(() =>{
                    this.interval = false;
                },1000)
            }
        },
        getData(){
            this.$http.get(this.change_url.get_static_router).then(res =>{
                if(res.data.code === 1){
                    this.static_router = res.data;
                }else{
                    this.static_router = {};
                }
            }).catch(err =>{

            })
        },
        openSetModal(str, node){
            this.setModal = str;
            if(node){
                this.ipaddr = node.ipaddress;
                this.ipmask = node.mask;
                this.nexthop = node.nexthop;
                this.cache_router = node;
            }
        },
        setStitacRouter(){
            if(!this.ip_reg.test(this.ipaddr)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['ipaddr']
                })
                return
            }
            if(!this.ip_reg.test(this.mask)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['ipmask']
                })
                return
            }
            if(!this.ip_reg.test(this.nexthop)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['nexthop']
                })
                return
            }
            var post_data = {
                "method": "set",
                "param": {
                    "ipaddress": this.ipaddr,
                    "mask": this.ipmask,
                    "nexthop": this.nexthop
                }
            }
            this.$http.post('/switch_route?form=static_route', post_data).then(res =>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['add'] + this.lanMap['st_success']
                    })
                    this.getData();
                }else{
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err =>{

            })
            this.closeModal();
        },
        openDeleteModal(node){
            this.ipaddr = node.ipaddress;
            this.ipmask = node.mask;
            this.nexthop = node.nexthop;
            this.delModal = true;
        },
        deleteStaticRouter(bool){
            if(bool){
                var post_data = {
                    "method": "delete",
                    "param": {
                        "ipaddress": this.ipaddr,
                        "mask": this.ipmask,
                        "nexthop": this.nexthop
                    }
                }
                this.$http.post('/switch_route?form=static_route', post_data).then(res =>{
                    if(res.data.code === 1){
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap['delete'] + this.lanMap['st_success']
                        })
                        this.getData();
                    }else{
                        this.$message({
                            type: res.data.type,
                            text: '(' + res.data.code + ') ' + res.data.message
                        })
                    }
                }).catch(err =>{

                })
            }
            this.closeModal();
        },
        closeModal(){
            this.delModal = false;
            this.setModal = '';
            this.cache_router = {};
            this.ipaddr = '';
            this.ipmask = '';
            this.nexthop = '';
        }
    }
}
</script>

<style lang="less" scoped>
h3{
    font-size: 24px;
    font-weight: 600;
    color: #67AEF7;
    margin: 10px 0 20px 0;
    >a{
        font-size: 16px;
        margin-left: 30px;
        font-weight: 400;
    }
}
div.route-state{
    >span{
        &:first-child{
            font-size: 18px;
            //color: #67aef6;
            font-weight: 500;
        }
    }
}
.route-state{
    font-size: 24px;
}
div.switch{
    display: inline-block;
    margin: 20px 20px 20px 20px;
    vertical-align: sub;
    cursor: pointer;
    input{
        position: absolute;
        width: 0;
        height: 0;
        margin: 0;
        opacity: 0;
    }
    span{
        display: inline-block;
        position: relative;
        width: 40px;
        height: 20px;
        background: #666;
        border-radius: 10px;
        transition: all .3s linear;
        &::after{
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            background: #FFF;
            border-radius: 100%;
            width: 16px;
            height: 16px;
            transition: all .2s linear;
        }
    }
    span.checked{
        background: #13CE66;
        &::after{
            left: 22px;
        }
    }
}
ul.static-route-item{
    &::after{
        content: '';
        display: table;
        clear: both;
    }
    >li{
        float: left;
        height: 30px;
        line-height: 30px;
        width: 12.3%;
        text-align: center;
        border: 1px solid #ddd;
        border-bottom: none;
        border-right: none;
        &:last-child{
            border-right: 1px solid #ddd;
        }
    }
    &:last-child{
        >li{
            border-bottom: 1px solid #ddd;
        }
    }
    &:nth-of-type(even){
        >li{
            background: #CAECDA;
        }
    }
    i{
        display: inline-block;
        width: 24px;
        height: 24px;
        vertical-align: middle;
        line-height: 24px;
        cursor: pointer;
    }
    i.icon-config{
        background-image: url('../../../assets/config.png');
        background-position: 0px 0px;
        background-repeat: no-repeat;
        &:hover{
            background-image: url('../../../assets/config-hover.png');
        }
    }
    i.icon-delete{
        margin-left: 6px;
        background-image: url('../../../assets/delete.png');
        background-position: -4px -4px;
        background-repeat: no-repeat;
        &:hover{
            background-image: url('../../../assets/delete-hover.png');
        }
    }
}
.cover+div{
    height: 235px;
}
div.set-route-item{
    >div{
        margin: 8px 0;
        &:last-child{
            margin-top: 12px;
        }
        span{
            display: inline-block;
            &:first-child{
                width: 120px;
                text-align: center;
            }
        }
        a{
            margin: 0 0 0 110px;
        }
        input+span{
            font-size: 14px;
            color: #333;
            margin-left: 8px;
        }
    }
}
</style>
