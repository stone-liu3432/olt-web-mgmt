<template>
    <div>
        <h2>
            {{ lanMap['upgrade'] }}
        </h2>
        <div class="upgrade">
            <h3>
                {{ lanMap['firmware'] }}
                <span>{{ lanMap['file_limit_img'] }}</span>
            </h3>
        </div>
        <form class="upload-form"> 
            <input type="file" class="hide" id="file1" @change="changeFile('file1','fileName1')" accept=".img"/>
            <span class="updateFile" id="fileName1">{{ lanMap['file_click'] }}</span>
            <a href="javascript:;" @click="firmware">{{ lanMap["apply"] }}</a>
        </form>
        <div class="upgrade">
            <h3>
                {{ lanMap['system'] }}
                <span>{{ lanMap['file_limit_img'] }}</span>
            </h3>
        </div>
        <form class="upload-form">
            <input type="file" class="hide" id="file2" @change="changeFile('file2','fileName2')" accept=".img"/>
            <span class="updateFile" id="fileName2">{{ lanMap['file_click'] }}</span>
            <a href="javascript:;" @click="system">{{ lanMap["apply"] }}</a>
        </form>
        <div class="upgrade">
            <h3>
                {{ lanMap['fullversion'] }}
                <span>{{ lanMap['file_limit_zip'] }}</span>
            </h3>
        </div>
        <form class="upload-form">
            <input type="file" class="hide" id="file3" @change="changeFile('file3','fileName3')" accept=".zip"/>
            <span class="updateFile" id="fileName3">{{ lanMap['file_click'] }}</span>
            <a href="javascript:;" @click="fullversion">{{ lanMap["apply"] }}</a>
        </form>
        <div class="modal-dialog" v-if="isLoading">
            <div class="cover"></div>
            <div class="load-body">
                <h3>loading...</h3>
                <div class="progress">
                    <div class="progress-content"></div>
                    <div class="progress-cover" :style="{ 'width': width + 'px' }"></div>
                    <div>{{ parseInt(width*100/400) + '%' }}</div>
                </div>
            </div>
        </div>
        <confirm :tool-tips="lanMap['upgrade_success'] + '?' " @choose="upgrade_result" v-if="reboot_confirm"></confirm>
        <confirm :tool-tips="lanMap['if_sure'] + lanMap['upgrade_firmware'] + '?' " @choose="result_firmware" v-if="firmware_confirm"></confirm>
        <confirm :tool-tips="lanMap['if_sure'] + lanMap['upgrade_system'] + '?' " @choose="result_system" v-if="system_confirm"></confirm>
        <confirm :tool-tips="lanMap['if_sure'] + lanMap['fullversion'] + '?' " @choose="result_fullversion" v-if="fullversion_confirm"></confirm>
        <loading v-if="isReboot"></loading>
        <loading v-if="load_file"></loading>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import loading from '@/components/common/loading'
    export default {
        name: 'upgrade',
        components: { loading },
        data(){
            return {
                isLoading: false,
                isReboot: false,
                reboot_confirm: false,
                firmware_confirm: false,
                system_confirm: false,
                fullversion_confirm: false,
                width: 0,
                timer: null,
                interval: null,
                reboot_timer: null,
                load_file: false
            }
        },
        computed: mapState(['lanMap']),
        methods: {
            reboot(){
                this.$http.get('/system_start',{timeout: 3000}).then(res=>{
                    if(res.data.code === 1){
                        this.isReboot = false;
                        sessionStorage.clear();
                        this.$router.push('/login');
                    }
                }).catch(err=>{
                    this.reboot();
                })
            },
            upgrade_result(bool){
                if(bool){
                    this.$http.get("/system_reboot").then(res=>{
                        // to do
                    }).catch(err=>{
                        // to do
                    })
                    this.isReboot = true;
                    this.reboot();
                }
                this.width = 0;
                this.reboot_confirm = false;
                clearTimeout(this.reboot_timer);
            },
            changeFile(fileid,fnameid){
                var file = document.getElementById(fileid);
                var fileName = document.getElementById(fnameid);
                var files = file.files[0];
                fileName.innerText = file.value.substring(file.value.lastIndexOf('\\')+1);
                if(!files) {
                    fileName.innerText = this.lanMap['file_click'];
                    return
                }
            },
            result_firmware(bool){
                if(bool){
                    var formData = new FormData();
                    var file = document.getElementById('file1');
                    var files = file.files[0];
                    var fileName = document.getElementById('fileName1');
                    var reg = /\.img$/;
                    if(!files){
                        fileName.innerText = this.lanMap['file_click'];
                        this.$message({
                            type: 'error',
                            text: this.lanMap['file_not_select']
                        })
                        return
                    }
                    if(!reg.test(fileName.innerText)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['restore_file_nr']
                        })
                        return 
                    }
                    this.load_file = true;
                    formData.append('file',files);
                    document.body.addEventListener('keydown',this.preventRefresh,false);
                    document.body.addEventListener('contextmenu',this.preventMouse,false);
                    this.$http.post('/upgrade?type=firmware', formData,{
                        headers: {'Content-Type': 'multipart/form-data'},
                        timeout: 0
                    }).then(res=>{
                        document.body.removeEventListener('keydown',this.preventRefresh);
                        document.body.removeEventListener('contextmenu',this.preventMouse);
                        this.load_file = false;
                        if(res.data.code === 1){
                            this.isLoading = true;
                            this.upgrade_callback(this.lanMap['fw_upgrade_succ'],this.lanMap['upgrade_buzy'],this.lanMap['file_header_error'],this.lanMap['fw_upgrade_fail']);
                        }else if(res.data.code > 1){
                            clearInterval(this.timer);
                            this.isLoading = false;
                            this.$message({
                                type: res.data.type,
                                text: '(' + res.data.code + ') ' + res.data.message
                            })
                        }
                        this.width = 0;
                    }).catch(error=>{
                        // to do
                        this.load_file = false;
                    });
                }
                this.firmware_confirm = false;
            },
            result_system(bool){
                if(bool){
                    var formData = new FormData();
                    var file = document.getElementById('file2');
                    var files = file.files[0];
                    var fileName = document.getElementById('fileName2');
                    var reg = /\.img$/;
                    if(!files) {
                        fileName.innerText = this.lanMap['file_click'];
                        this.$message({
                            type: 'error',
                            text: this.lanMap['file_not_select']
                        })
                        return
                    }
                    if(!reg.test(fileName.innerText)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['restore_file_nr']
                        })
                        return 
                    }
                    this.load_file = true;
                    formData.append('file',files);
                    document.body.addEventListener('keydown',this.preventRefresh,false);
                    document.body.addEventListener('contextmenu',this.preventMouse,false);
                    this.$http.post('/upgrade?type=system', formData,{
                        headers: {'Content-Type': 'multipart/form-data'},
                        timeout: 0
                    }).then(res=>{
                        document.body.removeEventListener('keydown',this.preventRefresh);
                        document.body.removeEventListener('contextmenu',this.preventMouse);
                        this.load_file = false;
                        if(res.data.code === 1){
                            this.isLoading = true;
                            this.upgrade_callback(this.lanMap['sys_upgrade_succ'],this.lanMap['upgrade_buzy'],this.lanMap['file_header_error'],this.lanMap['sys_upgrade_fail']);
                        }else if(res.data.code > 1){
                            clearInterval(this.timer);
                            this.isLoading = false;
                            this.$message({
                                type: res.data.type,
                                text: '(' + res.data.code + ') ' + res.data.message
                            })
                        }
                        this.width = 0;
                    }).catch(error=>{
                        // to do
                        this.load_file = false;
                    });
                }
                this.system_confirm = false;
            },
            firmware(){
                this.firmware_confirm = true;
            },
            system(){
                this.system_confirm = true;
            },
            fullversion(){
                this.fullversion_confirm = true;
            },
            result_fullversion(bool){
                if(bool){
                    var formData = new FormData();
                    var file = document.getElementById('file3');
                    var files = file.files[0];
                    var fileName = document.getElementById('fileName3');
                    var reg = /\.zip$/;
                    if(!files) {
                        fileName.innerText = this.lanMap['file_click'];
                        this.$message({
                            type: 'error',
                            text: this.lanMap['file_not_select']
                        })
                        return
                    }
                    if(!reg.test(fileName.innerText)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['restore_file_nr']
                        })
                        return 
                    }
                    this.load_file = true;
                    formData.append('file',files);
                    document.body.addEventListener('keydown',this.preventRefresh,false);
                    document.body.addEventListener('contextmenu',this.preventMouse,false);
                    this.$http.post('/upgrade?type=fullversion', formData,{
                        headers: {'Content-Type': 'multipart/form-data'},
                        timeout: 0
                    }).then(res=>{
                        document.body.removeEventListener('keydown',this.preventRefresh);
                        document.body.removeEventListener('contextmenu',this.preventMouse);
                        this.load_file = false;
                        if(res.data.code === 1){
                            this.isLoading = true;
                            this.upgrade_callback(this.lanMap['fv_upgrade_succ'],this.lanMap['upgrade_buzy'],this.lanMap['file_header_error'],this.lanMap['fv_upgrade_fail']);
                        }else if(res.data.code > 1){
                            clearInterval(this.timer);
                            this.isLoading = false;
                            this.$message({
                                type: res.data.type,
                                text: '(' + res.data.code + ') ' + res.data.message
                            })
                        }
                        this.width = 0;
                    }).catch(error=>{
                        // to do
                        this.load_file = false;
                    });
                }
                this.fullversion_confirm = false;
            },
            //  固件或系统升级期间，禁用F5刷新浏览器
            preventRefresh(e){
                var e = e || window.event;
                e.preventDefault();
                e.stopPropagation();
                if(e.keyCode === 116){
                    return false
                }
            },
            //  阻止鼠标右键刷新
            preventMouse(e){
                var e = e || window.event;
                e.returnValue = false
            },
            //  开始升级后的回调处理
            upgrade_callback(text1,text2,text3,text4){
                this.interval = setInterval(()=>{
                    this.$http.get('/upgrade_status').then(_res=>{
                        if(_res.data.code === 1){                //  触发升级成功
                            if(_res.data.data.status === 2){     //  升级成功
                                clearInterval(this.timer);
                                this.width = 400;
                                this.isLoading = false;
                                this.$message({
                                    type: 'success',
                                    text: text1
                                })
                                this.reboot_confirm = true;
                                this.reboot_timer = setTimeout(()=>{
                                    this.upgrade_result(true);
                                },15000);
                                clearInterval(this.interval);
                            }else if(_res.data.data.status === 3){   //  其他用户正在升级
                                clearInterval(this.timer);
                                this.isLoading = false;
                                this.$message({
                                    type: 'error',
                                    text: text2
                                })
                                clearInterval(this.interval);
                            }
                        }else if(_res.data.code === 2){          //  升级文件的文件头检测失败
                            clearInterval(this.timer);
                            this.isLoading = false;
                            this.$message({
                                type: 'error',
                                text: text3
                            })
                            clearInterval(this.interval);
                        }else{                                  //  其他原因
                            clearInterval(this.timer);
                            this.isLoading = false;
                            this.$message({
                                type: 'error',
                                text: text4
                            })
                            clearInterval(this.interval);
                        }
                    }).catch(_err=>{
                        // to do
                    })
                },15000)
            }
        },
        watch:{
            isLoading(){
                if(this.isLoading){
                    this.timer = setInterval(()=>{
                        this.width += parseInt(Math.random()*20);
                        (this.width > 380) && (this.width = 380);
                    },1000)
                }
            }
        },
        beforeDestroy(){
            clearInterval(this.interval);
            clearInterval(this.timer);
            clearTimeout(this.reboot_timer);
        }
    }
</script>

<style scoped lang="less">
div.upgrade{
    margin: 30px 50px 30px 10px;
}
h2{
    font-size: 24px;
    margin: 20px 10px;
    font-weight: bold;
    color: #67AEF7;
}
div.upgrade>h3{
    font-size: 20PX;
    font-weight: 600;
    color: rgb(52, 135, 218);
    margin-left: 20px;
}
h3>span{
    font-size: 14px;
    color: #666;
    font-weight: 400;
    margin-left: 30px;
}
form.upload-form{
    position: relative;
    left: 30px;
}
.updateFile{
    position: absolute;
    left: 0;
    top: 0;
    width: 300px;
    height: 38px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    border: 1px solid #ddd;
    text-align: center;
    line-height: 38px;
    z-index: 9;
    border-radius: 5px;
    background: #eee;
}
.hide{
    height: 40px;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 99;
    opacity: 0;
    cursor: pointer;
}
a{
    font-size: 16px;
    display: inline-block;
    width: 200px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    background: #666;
    border-radius: 5px;
    color: #fff;
    margin-left: 320px;
}
input{
    font-size: 16px;
}
input[type='file']{
    width: 300px;
}
.modal-dialog div.load-body{
    width: 500px;
    height: 300px;
    background: #666;
    border-radius: 10px;
    >h3{
        font-size: 18px;
        text-align: center;
        color: #fff;
        font-weight: 600;
        margin-top: 30px;
    }
    >div.progress{
        width: 404px;
        height: 22px;
        margin: 30px auto;
        background: #ddd;
        position: relative;
        border-radius: 15px;
        padding: 4px;
    }
}
div.progress{
    >div.progress-content{
        width: 404px;
        height: 22px;
        background: #666;
        border-radius: 11px;
    }
    >div.progress-cover{
        position: absolute;
        left: 6px;
        top: 6px;
        height: 18px;
        border-radius: 11px;
        background: #ddd;
        &+div{
            margin: 15px;
            text-align: center;
            color: #fff;
        }
    }
}
</style>