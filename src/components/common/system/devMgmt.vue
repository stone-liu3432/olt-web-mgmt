<template>
    <div>
        <div class="dev-mgmt restore-cfg">
            <div>{{ lanMap["restore_config"] }}</div>
            <div>
                <div>
                    <form> 
                        <input type="file" name="file1" size="80" class="hide" id="file" @change="changeFile()"/>
                        <span class="updateFile" id="fileName">{{ lanMap['file_click'] }}</span>
                        <a href="javascript:;" @click="restore_cfg">{{ lanMap["restore_config"] }}</a>
                    </form>
                </div>
                <p>
                    {{ lanMap['res_cfg_info'] }}
                </p>
            </div>
        </div>
        <div class="dev-mgmt">
            <div>{{ lanMap["reboot"] }}</div>
            <div>
                <div>
                    <a href="javascript:;" @click="reboot()">{{ lanMap["reboot"] }}</a>
                </div>
                <p>
                    {{ lanMap['reboot_olt'] }}
                </p>
            </div>
        </div>
        <div class="dev-mgmt">
            <div>{{ lanMap["backup_config"] }}</div>
            <div>
                <div>
                    <a href="javascript:;" @click="backup_cfg">{{ lanMap["backup_config"] }}</a>
                </div>
                <p>
                    {{ lanMap['bkup_cfg_info'] }}
                </p>
            </div>
        </div>
        <div class="dev-mgmt">
            <div>{{ lanMap["default_config"] }}</div>
            <div>
                <div>
                    <a href="javascript:;" @click="default_cfg">{{ lanMap["default_config"] }}</a>
                </div>
                <p>
                    {{ lanMap['def_cfg_info'] }}
                </p>
            </div>
        </div>
        <div class="dev-mgmt">
            <div>{{ lanMap["save_config"] }}</div>
            <div>
                <div>
                    <a href="javascript:;" @click="save_cfg">{{ lanMap["save_config"] }}</a>
                </div>
                <p>
                    {{ lanMap['save_cfg_info'] }}
                </p>
            </div>
        </div>
        <div class="dev-mgmt">
            <div>{{ lanMap['view_cfg'] }}</div>
            <div>
                <div>
                    <a href="javascript:void(0);" @click="open_view_confirm">{{ lanMap['view_cfg'] }}</a>
                </div>
                <p>
                    {{ lanMap['view_cfg_tips'] }}
                </p>
            </div>
        </div>
        <confirm v-if="viewChoose" @choose="view_result"></confirm>
        <confirm :tool-tips="lanMap['def_cfg_hit']" @choose="result" v-if="userChoose"></confirm>
        <confirm :tool-tips="lanMap['reboot_olt_hit']" @choose="reboot_result" v-if="rebootChoose"></confirm>
        <confirm :tool-tips="lanMap['restore_succ_reboot'] + '?'" @choose="reboot_result" v-if="restoreChoose"></confirm>
        <confirm :tool-tips="lanMap['save_cfg_confirm']" @choose="saveCfg_result" v-if="saveChoose"></confirm>
        <loading class="load" v-if="isLoading"></loading>
        <div class="modal-dialog" v-if="isProgress">
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
    </div>
</template>

<script>
import { mapState } from 'vuex'
import loading from '@/components/common/loading'
export default {
    name: 'devMgmt',
    computed: mapState(['lanMap']),
    components: { loading },
    data(){
        return {
            userChoose: false,
            rebootChoose: false,
            restoreChoose: false,
            saveChoose: false,
            isLoading: false,
            isProgress: false,
            viewChoose: false,
            width: 0,
            timer1: null,
            timer2: null,
            timeout: null,
        }
    },
    methods:{
        //  选择上传文件
        changeFile(){
            var file = document.getElementById('file');
            var fileName = document.getElementById('fileName');
            var files = file.files[0];
            if(!files) {
                fileName.innerText = this.lanMap['file_click'];
                return
            }
            fileName.innerText = file.value.substring(file.value.lastIndexOf('\\')+1);
        },
        //  重启OLT
        reboot(){
            this.rebootChoose = true;
        },
        reboot_req(){
            this.$http.get('/system_start',{timeout: 3000}).then(res=>{
                if(res.data.code === 1){
                    this.isLoading = false;
                    sessionStorage.clear();
                    this.$router.push('/login');
                }
            }).catch(err=>{
                this.reboot_req();
            })
        },
        reboot_result(bool){
            if(bool){
                this.$http.get('/system_reboot').then(res=>{
                    // to do
                }).catch(err=>{
                    // to do
                })
                this.isLoading = true;
                this.reboot_req();
            }
            this.rebootChoose = false;
            this.restoreChoose = false;
            if(this.timeout) clearTimeout(this.timeout);
        },
        //  恢复出厂设置模态框
        result(bool){
            if(bool){
                this.$http.get('/system_def_config').then(res=>{
                    //  成功恢复出厂设置时重启设备
                    if(res.data.code === 1){
                        this.$message({
                            type: 'success',
                            text: this.lanMap['def_cfg_succ']
                        })
                        this.rebootChoose = true;
                        this.timeout = setTimeout(()=>{
                            this.reboot_result(true);
                        },10000)
                    }else{
                        this.$message({
                            type: 'error',
                            text: this.lanMap['default_config_fail']
                        })
                    }
                }).catch(err=>{
                    // to do
                })
            }
            this.userChoose = false;
        },
        //  恢复出厂设置
        default_cfg(){
            this.userChoose = true;
        },
        //  备份配置
        backup_cfg(){
            this.$http.get('/system_backup').then(res=>{
                if(res.data.code === 1){
                    try{
                        var a = document.createElement('a');  
                        var str = window.location.href;
                        var _url = str.substr(0,str.indexOf('/#/')+1);
                        a.href = _url + res.data.data.filename;
                        a.download = res.data.data.filename;
                        a.click();
                    }catch(e){
                        this.backup_cfg();
                    }
                }else if(res.data.code >1){
                    this.$message({
                        type: 'error',
                        text: this.lanMap['st_fail']
                    })
                }
            }).catch(err=>{
                // to do
            })
        },
        //  导入配置        --> 暂未支持，后续添加
        restore_cfg(){
            // this.$message({
            //     type: 'info',
            //     text: this.lanMap['no_support']
            // })
            // return
            var formData = new FormData();
            var file = document.getElementById('file');
            var files = file.files[0];
            var fileName = document.getElementById('fileName');
            //var reg = /\.txt$/;
            if(!files) {
                fileName.innerText = this.lanMap['file_click'];
                this.$message({
                    type: 'error',
                    text: this.lanMap['file_not_select']
                })
                return
            }
            // if(!reg.test(fileName.innerText)){
            //     this.$message({
            //         type: 'error',
            //         text: this.lanMap['restore_file_nr']
            //     })
            //     return
            // }
            formData.append('file',files);
            this.isProgress = true;
            document.body.addEventListener('keydown',this.preventRefresh,false);
            document.body.addEventListener('contextmenu',this.preventMouse,false);
            this.$http.post('/system_restore', formData,{
                headers: {'Content-Type': 'multipart/form-data'},
                timeout: 0
            }).then(res=>{
                document.body.removeEventListener('keydown',this.preventRefresh);
                document.body.removeEventListener('contextmenu',this.preventMouse);
                    if(res.data.code === 1){
                    this.width = 400;
                    clearInterval(this.timer2);
                    this.isProgress = false;
                    this.$message({
                        type: 'success',
                        text: this.lanMap['restore_config_succ']
                    })
                    this.restoreChoose = true;
                    this.width = 0;
                }else if(res.data.code >1){
                    this.$message({
                        type: 'error',
                        text: this.lanMap['restore_config_fail']
                    })
                    clearInterval(this.timer2);
                    this.isProgress = false;
                    this.width = 0;
                }
            }).catch(err=>{
                // to do
            });
        },
        //  固件或系统升级期间，禁用F5刷新浏览器
        preventRefresh(e){
            e.preventDefault();
            e.stopPropagation();
            if(e.keyCode === 116){
                return false
            }
        },
        //  阻止鼠标右键刷新
        preventMouse(e){
            e.returnValue = false
        },
        save_cfg(){
            this.saveChoose = true;
        },
        //  配置保存
        saveCfg_result(bool){
            if(bool){
                this.$http.get('/system_save').then(res=>{
                    if(res.data.code === 1){
                        this.$message({
                            type: 'success',
                            text: this.lanMap['save_succ']
                        })
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
            this.saveChoose = false;
        },
        open_view_confirm(){
            this.viewChoose = true;
        },
        view_result(bool){
            if(bool){
                this.$http.get('/system_running_config').then(res=>{
                    if(res.data.code === 1){
                        try{
                            var a = document.createElement('a');  
                            var str = window.location.href;
                            var _url = str.substr(0,str.indexOf('/#/')+1);
                            a.href = _url + 'oltconfigtmp.txt';
                            a.download = 'oltconfigtmp.txt';
                            a.click();
                        }catch(e){
                            this.view_result(true);
                        }
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
            this.viewChoose = false;
        }
    },
    watch: {
        isProgress(){
            if(this.isProgress){
                this.timer2 = setInterval(()=>{
                    this.width += parseInt(Math.random()*10);
                    (this.width > 380) && (this.width = 380);
                },1000)
            }
        }
    },
    beforeDestroy(){
        if(this.timer1) clearInterval(this.timer1);
        if(this.timer2) clearInterval(this.timer2);
    }
}
</script>

<style scoped lang="less">
.dev-mgmt{
    float: left;
    width: 49%;
    border: 1px solid #aaa;
    margin-top: 20px;
    box-shadow: 3px 3px 3px #ddd;
    margin-left: 0.8%;
    height: 160px;
}
div.restore-cfg{
    width: 99%;
    a{
        margin-left: 330px;
    }
    >div{
        >div{
            text-align: left;
        }
    }
}
.dev-mgmt>div{
    padding: 10px 20px;
    >div{
        text-align: center;
    }
}
.dev-mgmt>div:first-child{
    font-size: 18px;
    font-weight: 600;
    color: #666;
}
form{
    position: relative;
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
    width: 200px;
    height: 36px;
    line-height: 36px;
    padding: 0;
}
input{
    font-size: 16px;
}
p{
    color: #666;
    margin-top: 10px;
}
div.load{
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1000;
    background: #000;
    opacity: 0.9;
}
div.load-body{
    width: 500px;
    height: 300px;
    background: #666;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
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