<template>
    <div>
        <div class="service-title">{{ lanMap['service'] }}</div>
        <hr>
        <div class="service-item">
            <div>SSH</div>
            <div class="toggle-button-wrapper">
                <input type="checkbox" id="ssh-switch" class="toggle-button" name="switch" @click="ssh_switch" v-model="ssh">
                <label for="ssh-switch" class="button-label" onselectstart="return false;">
                    <span class="circle"></span>
                    <span class="text on">ON</span>
                    <span class="text off">OFF</span>
                </label>
            </div>
        </div>
        <hr>
        <div class="service-item">
            <div>SNMP</div>
            <div>
                <div class="snmp-item">
                    <div>trapserver</div>
                    <div>
                        <div>
                            <span>server ip</span>
                            <input type="text" v-model="serverip">
                        </div>
                        <div>
                            <span>trap port</span>
                            <!-- <input type="text" v-model="trap_port" disabled> -->
                            <span>{{ trap_port }}</span>
                        </div>
                        <div>
                            <span>trap community</span>
                            <input id="trap_community" type="text" v-model="trap_community" :style="{ 'border-color': trap_community.length > 16 ? 'red' : ''}" placeholder="0-16 characters">
                        </div>
                        <div onselectstart="return false;">
                            <a href="javascript:void(0);" @click="set_trapserver">{{ lanMap['apply'] }}</a>
                        </div>
                    </div>
                </div>
                <div class="snmp-item">
                    <div>community</div>
                    <div>
                        <div onselectstart="return false;">
                            <input type="checkbox" id="read_community" v-model="flag_read">
                            <label for="read_community">Read community</label>
                            <input type="checkbox" id="write_community" v-model="flag_write">
                            <label for="write_community">Write community</label>
                        </div>
                        <div>
                            <span>Read community</span>
                            <input id="read_community_input" type="text" v-model="read_community" :style="{ 'border-color': read_community.length > 16 ? 'red' : ''}" placeholder="0-16 characters">
                        </div>
                        <div>
                            <span>Write community</span>
                            <input id="write_community_input" type="text" v-model="write_community" :style="{ 'border-color': write_community.length > 16 ? 'red' : ''}" placeholder="0-16 characters">
                        </div>
                        <div onselectstart="return false;">
                            <a href="javascript:void(0);" @click="set_community">{{ lanMap['apply'] }}</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <confirm :tool-tips="''" v-if="false"></confirm>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'service',
    computed: mapState(['lanMap']),
    data(){
        return {
            ssh: false,
            serverip: '',
            trap_port: '',
            trap_community: '',
            //  限制点击频率
            limit: false,
            read_community: '',
            write_community: '',
            flag_read: false,
            flag_write: false
        }
    },
    created(){
        this.get_trap();
        this.get_ssh();
        this.get_community();
    },
    methods: {
        get_ssh(){
            this.$http.get('/system_service?form=sshd_status').then(res=>{
                if(res.data.code === 1){
                    this.ssh = !!res.data.data.status;
                }
            }).catch(err=>{
                // to do
            })
        },
        get_trap(){
            this.$http.get('/snmp_cfg?form=trap').then(res=>{
                if(res.data.code === 1){
                    this.serverip = res.data.data.serverip;
                    this.trap_port = res.data.data.trap_port;
                    this.trap_community = res.data.data.trap_community;
                }
            }).catch(err=>{
                // to do
            })
        },
        get_community(){
            this.$http.get('/snmp_cfg?form=community').then(res=>{
                if(res.data.code === 1){
                    this.read_community = res.data.data.read_community;
                    this.write_community = res.data.data.write_community;
                }
            }).catch(err=>{
                // to do
            })
        },
        ssh_switch(e){
            if(this.limit){
                var e = e || window.event;
                var node = e.target || e.srcElement;
                this.$message({
                    type: 'error',
                    text: this.lanMap["click_often"],
                    duration: 1000
                })
                node.checked = !node.checked;
                this.ssh = node.checked;
                return
            }
            this.limit = true;
            setTimeout(()=>{
                this.limit = false;
            },1000);
            this.$http.get('/system_service?form=sshd_oper&operation=' + Number(!this.ssh)).then(res=>{
                if(res.data.code === 1) {
                    this.$message({
                        type: 'success',
                        text: this.lanMap['setting_ok']
                    })
                    this.get_ssh();
                }else{
                    this.$message({
                        type: 'error',
                        text: res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
        },
        set_trapserver(){
            if(this.limit){
                var e = e || window.event;
                var node = e.target || e.srcElement;
                this.$message({
                    type: 'error',
                    text: this.lanMap["click_often"],
                    duration: 1000
                })
                return
            }
            this.limit = true;
            setTimeout(()=>{
                this.limit = false;
            },1000);
            var reg_ip = /^(([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){1}((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4]){1}$/g;
            if(!reg_ip.test(this.serverip)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['ipaddr_error']
                })
                return
            }
            if(this.trap_community.length > 16){ 
                document.getElementById('trap_community').focus();
                return
            }
            // if(!~~this.trap_port){
            //     this.$message({
            //         type: 'error',
            //         text: ''
            //     })
            //     return
            // }
            var params = {
                "method":"set",
                "param":{
                    "serverip": this.serverip,
                    "trap_port": this.trap_port,
                    "trap_community": this.trap_community.replace(/\s*/g,'')
                }
            }
            this.$http.post('/snmp_cfg?form=trap',params).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['setting_ok']
                    })
                    this.get_trap();
                }else{
                    this.$message({
                        type: 'error',
                        text: res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
        },
        set_community(){
            if(this.limit){
                var e = e || window.event;
                var node = e.target || e.srcElement;
                this.$message({
                    type: 'error',
                    text: this.lanMap["click_often"],
                    duration: 1000
                })
                return
            }
            this.limit = true;
            setTimeout(()=>{
                this.limit = false;
            },1000);
            if(this.read_community.length > 16 || this.write_community.length > 16){
                if(this.read_community.length > 16) document.getElementById('read_community_input').focus();
                if(this.write_community.length > 16) document.getElementById('write_community_input').focus();
                return
            }
            var flags = 0;
            if(this.flag_read) flags += 1;
            if(this.flag_write) flags += 2;
            if(!flags) {
                this.$message({
                    type: 'info',
                    text: this.lanMap['modify_tips']
                })
                return
            }
            var params = {
                "method":"set",
                "param":{
                    "flags": flags,
                    "read_community": this.read_community.replace(/\s*/g,''),
                    "write_community": this.write_community.replace(/\s*/g,'')
                }
            }
            this.$http.post('/snmp_cfg?form=community',params).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['setting_ok']
                    })
                    this.get_community();
                }else{
                    this.$message({
                        type: 'error',
                        text: res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
        }
    }
}
</script>

<style lang="less" scoped>
div.service-title{
    font-size: 24px;
    margin: 20px 10px;
    font-weight: bold;
    color: #67AEF7;
}
div.service-item{
    margin: 20px;
    overflow: hidden;
    >div:first-child{
        width: 200px;
        line-height: 30px;
    }
    >div{
        float: left;
    }
}
div.snmp-item{
    line-height: 36px;
    overflow: hidden;
    margin-top: 20px;
    >div{
        float: left;
        >div{
            >span{
                display: inline-block;
                width: 150px;
            }
            >a{
                float: right;
                width: 120px;
                height: 30px;
                line-height: 30px;
                background: #ccc;
                text-align: center;
                border-radius: 5px;
                margin: 10px 20px 0 0;
            }
        }
    }
    >div:first-child{
        width: 150px;
    }
    input[type='checkbox']{
        margin: 0 5px 0 20px;
        &:first-child{
            margin-left: 0;
        }
    }
}
//  自定义按钮开关样式
div.toggle-button-wrapper {
    margin-top: 5px;
    height: 32px;
    input.toggle-button {
        display: none;
    }
    .button-label {
        position: relative;
        display: inline-block;
        width: 56px;
        height: 20px;
        background-color: #ccc;
        box-shadow: #ccc 0px 0px 0px 2px;
        border-radius: 20px;
        overflow: hidden;
    }
    .circle {
        position: absolute;
        top: 0;
        left: 0;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #fff;
    }
    .button-label .text {
        line-height: 20px;
        font-size: 14px;
        text-shadow: 0 0 2px #ddd;
    }
    .on {
        color: #fff;
        display: none;
        text-indent: 6px;
    }
    .off {
        color: #fff;
        display: inline-block;
        text-indent: 24px;
    }
    .button-label .circle {
        left: 0;
        transition: all 0.3s;
    }
    .toggle-button:checked + label.button-label .circle {
        left: 36px;
    }
    .toggle-button:checked + label.button-label .on {
        display: inline-block;
    }
    .toggle-button:checked + label.button-label .off {
        display: none;
    }
    .toggle-button:checked + label.button-label {
        background-color: #51ccee;
    }
}
</style>
