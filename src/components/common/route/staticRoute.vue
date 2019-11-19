<template>
    <div>
        <page-header type="none">
            <template slot="title">
                {{ lanMap['route_cfg'] }}
            </template>
        </page-header>
        <div v-if="default_route.data" style="margin: 20px 0;">
            <span>{{ lanMap['def_route'] }}:</span>
            <span>{{ defRoute }}</span>
            <a href="javascript:void(0);" @click="openSetDef" style="margin-left: 30px;">{{ lanMap['config'] }}</a>
            <a href="javascript:void(0);" @click="openDelCfm" v-if="default_route.data.gateway !== '0.0.0.0'" style="margin-left: 30px;">{{ lanMap['delete'] }}</a>
        </div>
        <hr>
        <div class="route-state">
            <span>{{ lanMap['route'] + lanMap['status'] }}</span>
            <div class="switch" @click="offRoute">
                <input type="checkbox" v-model="status">
                <span :class="{ 'checked' : status }"></span>
            </div>
        </div>
        <h3  v-if="status">
            {{ lanMap['static_route'] }}
            <a href="javascript:void(0);" @click="openSetModal('add')">{{ lanMap['add'] }}</a>
            <a href="javascript:void(0);" @click="getData">{{ lanMap['refresh'] }}</a>
        </h3>
        <div v-if="status">
            <nms-table :rows="static_router" border>
                <nms-table-column :label="`${lanMap['dst_ipaddr']}/${ lanMap['mask']}`">
                    <template slot-scope="rows">
                        {{ `${rows.ipaddress}/${rows.mask_num}` }}
                    </template>
                </nms-table-column>
                <nms-table-column prop="gateway" :label="lanMap['next_hop']"></nms-table-column>
                <nms-table-column :label="lanMap['interface']">
                    <template slot-scope="rows">
                        {{ rows.interface ? `Vlanif${rows.interface}` : ' * ' }}
                    </template>
                </nms-table-column>
                <nms-table-column prop="protocol" :label="lanMap['protocol']">
                    <template slot-scope="rows">
                        {{ protocols[rows.protocol] }}
                    </template>
                </nms-table-column>
                <nms-table-column prop="preference" :label="lanMap['preference']"></nms-table-column>
                <nms-table-column prop="status" :label="lanMap['status']">
                    <template slot-scope="rows">
                        {{ rows.status === 1 ? 'Reachale' : 'Unreachale' }}
                    </template>
                </nms-table-column>
                <nms-table-column :label="lanMap['config']">
                    <template slot-scope="rows">
                        <a href="javascript: void(0);" class="btn-text" @click="openDeleteModal(rows)" v-if="rows.protocol !== 1">{{ lanMap['delete'] }}</a>
                    </template>
                </nms-table-column>
            </nms-table>
        </div>
        <div class="modal-dialog" v-if="!!setModal">
            <div class="cover"></div>
            <div>
                <div class="set-route-item">
                    <h4 class="modal-header" v-if="setModal === 'add'">{{ lanMap['add'] }}</h4>
                    <h4 class="modal-header" v-if="setModal === 'set'">{{ lanMap['config'] }}</h4>
                    <div>
                        <span>{{ lanMap['dst_ipaddr'] }}</span>
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
                        <span>{{ lanMap['next_hop'] }}</span>
                        <input type="text" v-model="gateway"
                            :style="{ 'border-color': gateway !== '' && !ip_reg.test(gateway) ? 'red' : '' }">
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
        <div class="modal-dialog" v-if="setDefRoute">
            <div class="cover"></div>
            <div style="height: 160px;">
                <div class="set-route-item">
                    <h4 class="modal-header">{{ lanMap['config'] + lanMap['def_route'] }}</h4>
                    <div>
                        <span>{{ lanMap['def_route'] }}</span>
                        <input type="text" v-model="gateway"
                            :style="{ 'border-color': gateway !== '' && !ip_reg.test(gateway) ? 'red' : '' }">
                        <span>EX. 127.0.0.1</span>
                    </div>
                    <div>
                        <a href="javascript:void(0);" @click="setDef">
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
    </div>
</template>

<script>
import { mapState } from "vuex"
export default {
    name: 'staticRoute',
    computed: {
        ...mapState(["change_url", 'lanMap']),
        defRoute(){
            if(this.default_route.data){
                return this.default_route.data.gateway === '0.0.0.0' ? ' -- ' : this.default_route.data.gateway;
            }
            return '';
        }
    },
    data(){
        return {
            status: false,
            protocols: ['Static', 'Direct'],
            interval: false,
            static_router: [],
            setModal: '',
            ipaddr: '',
            ipmask: '',
            gateway: '',
            ip_reg: /^(((25[0-5])|(2[0-4]\d)|(1\d\d)|(\d?\d))\.){3}(((25[0-5])|2[0-4]\d)|(1\d\d)|(\d?\d))$/,
            default_route: {
                "code": 1,
                "message": "success",
                "data":{
                    "gateway":"192.168.100.1"
                }
            },
            setDefRoute: false
        }
    },
    created(){
        this.getDefRoute();
        this.getState();
        this.getData();
    },
    methods: {
        getState(){
            this.status = false;
            this.$http.get('/switch_route?form=admin_status').then(res =>{
                if(res.data.code === 1){
                    if(res.data.data){
                        this.status = !!res.data.data.status;
                    }
                    if(this.status){
                        this.getData();
                    }
                }
            }).catch(err =>{

            })
        },
        getDefRoute(){
            this.$http.get('/switch_route?form=route_default').then(res =>{
                if(res.data.code === 1){
                    this.default_route = res.data;
                }else{
                    this.default_route = {};
                }
            }).catch(err =>{})
        },
        offRoute(){
            if(this.status){
                this.$confirm(this.lanMap['static_route_tips']).then(_ => {
                    this.changeRouteState();
                }).catch(_ => {})
            }else{
                this.changeRouteState();
            }
        },
        changeRouteState(){
            if(!this.interval){
                this.interval = true;
                setTimeout(() =>{
                    this.interval = false;
                }, 1000)
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
                        if(res.data.message.indexOf('please disable dhcp relay first') > -1){
                            this.$confirm(this.lanMap['route_close_tips']).then(_ => {
                                this.disableDhcpRelay(`(${res.data.code}) ${res.data.message}`);
                            }).catch(_ => {})
                            return;
                        }
                        this.$message({
                            type: res.data.type,
                            text: '(' + res.data.code + ') ' + res.data.message
                        })
                    }
                }).catch(err =>{

                })
            }
        },
        getData(){
            this.static_router = [];
            this.$http.get(this.change_url.get_static_router).then(res =>{
                if(res.data.code === 1){
                    if(res.data.data && res.data.data.length){
                        this.static_router = res.data.data;
                    }
                }
            }).catch(err =>{})
        },
        openSetModal(str, node){
            this.setModal = str;
            if(node){
                this.ipaddr = node.ipaddress;
                this.ipmask = node.mask;
                this.gateway = node.gateway;
            }
        },
        setStitacRouter(){
            if(!this.ip_reg.test(this.ipaddr)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['dst_ipaddr']
                })
                return
            }
            if(!this.ip_reg.test(this.ipmask)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['ipmask']
                })
                return
            }
            if(!this.ip_reg.test(this.gateway)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['gateway']
                })
                return
            }
            var post_data = {
                "method": "set",
                "param": {
                    "ipaddress": this.ipaddr,
                    "mask": this.ipmask,
                    "gateway": this.gateway
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
            this.$confirm().then(_ => {
                this.deleteStaticRouter(node);
            }).catch(_ => {})
        },
        deleteStaticRouter(data){
            const post_data = {
                "method": "delete",
                "param": {
                    "ipaddress": data.ipaddr,
                    "mask": data.ipmask,
                    "gateway": data.gateway
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
            }).catch(err =>{})
        },
        closeModal(){
            this.setModal = '';
            this.ipaddr = '';
            this.ipmask = '';
            this.gateway = '';
            this.setDefRoute = false;
        },
        openDelCfm(){
            this.$confirm().then(_ => {
                this.delDef();
            }).catch(_ => {})
        },
        delDef(){
            var post_data = {
                "method": "delete",
                "param": {
                    "gateway": '0.0.0.0'
                }
            }
            this.$http.post('/switch_route?form=route_default', post_data).then(res =>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['setting_ok']
                    })
                    this.getDefRoute();
                }else{
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err =>{})
        },
        setDef(){
            if(!this.ip_reg.test(this.gateway)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['def_route']
                })
                return
            }
            var post_data = {
                "method": "set",
                "param": {
                    "gateway": this.gateway
                }
            }
            this.$http.post('/switch_route?form=route_default', post_data).then(res =>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['setting_ok']
                    })
                    this.getDefRoute();
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
        openSetDef(){
            this.setDefRoute = true;
            this.gateway = this.default_route.data.gateway;
        },
        disableDhcpRelay(msg){
            const data = {
                "method":"set",
                "param":{
                    relay_admin: 0
                }
            }
            this.$http.post('/switch_dhcp?form=relay_admin', data).then(res => {
                if(res.data.code === 1){
                    this.interval = false;
                    this.changeRouteState(true);
                }else{
                    this.$message.error(msg);
                }
            }).catch(err => {})
        }
    }
}
</script>

<style lang="less" scoped>
h3{
    font-size: 24px;
    font-weight: 600;
    color: @titleColor;
    margin: 10px 0 20px 0;
    >a{
        font-size: 16px;
        margin-left: 30px;
        font-weight: 400;
    }
    &+div{
        margin: 20px 0;
        span{
            display: inline-block;
        }
        span+span{
            width: 150px;
            margin: 0 0 0 20px;
        }
        span+a{
            margin: 0 20px 0 20px;
        }
    }
}
.route-state{
    font-size: 18px;
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
    &+span{
        font-size: 15px;
        color: #333;
        margin-left: 30px;
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
