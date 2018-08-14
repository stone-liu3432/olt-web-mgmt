<template>
    <div>
        <div class="service-title">{{ lanMap['service'] }}</div>
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
        <hr>
        <div class="ssh-info">
            <div>
                <h3>SSH-Key</h3>
                <a href="javascript:void(0);" @click="open_add_ssh">{{ lanMap['add'] }} SSH</a>
            </div>
            <div class="add-ssh" v-if="is_add_ssh">
                <h4>{{ lanMap['add'] + lanMap['key'] }}</h4>
                <h4>{{ lanMap['title'] }}</h4>
                <input type="text" v-model="ssh_name" placeholder="Enter a name to ensure clear use"
                    :style="{'border-color': ssh_name !== '' && !reg_name.test(ssh_name) ? 'red' : ''}">
                <h4>{{ lanMap['key'] }}</h4>
                <textarea rows="6" v-model="ssh_key" spellcheck="false" placeholder="Begins with 'ssh-rsa', 'ssh-dss', 'ssh-ed25519', 'ecdsa-sha2-nistp256', 'ecdsa-sha2-nistp384', or 'ecdsa-sha2-nistp521'"></textarea>
                <a href="javascript:void(0);" @click="submit_add_ssh">{{ lanMap['apply'] }}</a>
                <a href="javascript:void(0);" class="cancel" @click="close_add_ssh">{{ lanMap['cancel'] }}</a>
            </div>
            <div class="ssh-item" v-for="(item,index) in ssh_info.data" :key="index" v-if="ssh_info.data && ssh_info.data.length > 0">
                <div>
                    <h4>{{ lanMap['title'] + ' ' + item.keyname }}</h4>
                    <hr> 
                    <p>{{ item.publickey }}</p>
                </div>
                <div>
                    <a href="javascript:void(0);" @click="open_del_sshkey(item)">{{ lanMap['delete'] }}</a>
                </div>
            </div>
        </div>
        <confirm v-if="is_del_ssh" @choose="del_sshkey"></confirm>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'service',
    computed: mapState(['lanMap']),
    data(){
        return {
            is_add_ssh: false,
            is_del_ssh: false,
            ssh_info: {},
            del_ssh_info: {},
            ssh_name: '',
            ssh_key: '',
            serverip: '',
            trap_port: '',
            trap_community: '',
            //  限制点击频率
            limit: false,
            read_community: '',
            write_community: '',
            flag_read: false,
            flag_write: false,
            reg_name: /^[^\\\/\'\"\?\s]{4,32}$/
        }
    },
    created(){
        this.get_trap();
        this.get_ssh();
        this.get_community();
    },
    methods: {
        get_ssh(){
            this.$http.get('/system_service?form=sshd').then(res=>{
                if(res.data.code === 1){
                    this.ssh_info = res.data;
                }else{
                    this.ssh_info = {};
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
        open_del_sshkey(node){
            this.is_del_ssh = true;
            this.del_ssh_info = node;
        },
        del_sshkey(bool){
            if(bool){
                var post_param = {
                    "method":"delete",
                    "param":{
                        "keyname": this.del_ssh_info.keyname
                    }
                }
                this.$http.post('/system_service?form=sshd',post_param).then(res=>{
                    if(res.data.code === 1){
                        this.$message({
                            type: 'success',
                            text: this.lanMap['delete'] + ': ' + this.lanMap['st_success']
                        })
                        this.get_ssh();
                    }else if(res.data.code > 1){
                        this.$message({
                            type: 'error',
                            text: '(' + res.data.code + ') ' + res.data.message
                        })
                    }
                }).catch(err=>{
                    // to do
                })
            }
            this.is_del_ssh = false;
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
                }else if(res.data.code > 1){
                    this.$message({
                        type: 'error',
                        text: '(' + res.data.code + ') ' + res.data.message
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
                }else if(res.data.code > 1){
                    this.$message({
                        type: 'error',
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
        },
        //  添加ssh密钥
        open_add_ssh(){
            this.is_add_ssh = !this.is_add_ssh;
        },
        close_add_ssh(){
            this.is_add_ssh = false;
            this.ssh_name = '';
            this.ssh_key = '';
        },
        submit_add_ssh(){
            if(!this.ssh_name || !this.reg_name.test(this.ssh_name)){
                this.$message({
                    type: 'error',
                    text: this.lamMap['param_error'] + ': ' + this.lanMap['title']
                })
                return
            }
            if(!this.ssh_key){
                this.$message({
                    type: 'error',
                    text: this.lamMap['param_error'] + ': ' + this.lanMap['key']
                })
                return
            }
            var post_param = {
                "method": "add",
                "param":{
                    "keyname": this.ssh_name,
                    "publickey": this.ssh_key.replace(/(^\s+)|(\s+$)/,'')
                }
            }
            this.$http.post('/system_service?form=sshd',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['add'] + this.lanMap['st_success']
                    })
                    this.get_ssh();
                }else if(res.data.code > 1){
                    this.$message({
                        type: 'error',
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_add_ssh();
        }
    }
}
</script>

<style lang="less" scoped>
a{
    width: 120px;
    padding: 0;
}
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
        font-size: 20px;
        font-weight: 500;
        color: #67aef6;
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
                padding: 0;
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
div.ssh-info{
    margin-top: 30px;
    >div{
        border-radius: 3px;
        h3{
            float: left;
            color: #67aef6;
            font-size: 20px;
            font-weight: 500;
        }
        a{
            float: right;
        }
        &:after{
            content: '';
            display: table;
            clear: both;
        }
        &:first-child{
            line-height: 32px;
            margin: 20px 0;
            h3{
                margin-left: 20px;
            }
        }
    }
}
div.ssh-item{
    border: 1px solid #ccc;
    margin-top: 10px;
    height: 86px;
    padding: 5px;
    >div:first-child{
        width: 80%;
    }
    div{
        height: 86px;
        float: left;
        width: 20%;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        box-sizing: border-box;
        a{
            float: none;
            display: inline-block;
        }
        h4{
            margin: 5px 15px;
            text-align: left;
            font-weight: 600;
            color: #000;
        }
        p{
            margin: 5px;
            word-break: break-all;
            word-wrap: break-word;
            height: 36px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        &:last-child{
            line-height: 86px;
        }
    }
}
div.add-ssh{
    border: 1px solid #aaa;
    margin: 10px 0;
    padding: 20px;
    input{
        width: 100%;
        border-radius: 3px;
    }
    textarea{
        width: 100%;
        box-sizing: border-box;
        resize: none;
        border-radius: 3px;
        border-color: #ccc;
        line-height: 18px;
        font-size: 16px;
        padding: 5px;
    }
    h4{
        height: 24px;
        line-height: 24px;
        &:first-child{
            font-size: 18px;
            color: #67aef7;
            font-weight: 500;
        }
    }
    h4+h4,input+h4{
        margin: 10px 0 0 10px;
    }
    a{
        float: none !important;
        display: inline-block;
        margin-top: 15px;
        background: #20BB44;
        color: #fff;
    }
    .cancel{
        background: #666;
        margin-left: 20px;
    }
}
</style>
