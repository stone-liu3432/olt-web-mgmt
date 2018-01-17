<template>
    <div>
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
        <confirm :tool-tips="lanMap['def_cfg_hit']" @choose="result" v-if="userChoose"></confirm>
        <confirm :tool-tips="lanMap['reboot_olt_hit']" @choose="reboot_result" v-if="rebootChoose"></confirm>
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
    import confirm from '@/components/common/confirm'
    import loading from '@/components/common/loading'
    export default {
        name: 'devMgmt',
        computed: mapState(['lanMap']),
        data(){
            return {
                userChoose: false,
                rebootChoose: false,
                isLoading: false,
                isProgress: false,
                width: 0,
                timer1: null,
                timer2: null
            }
        },
        components: { confirm,loading },
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
            reboot_result(bool){
                if(bool){
                    var self = this;
                    this.$http.get('/system_reboot').then(res=>{
                        if(res.data.code === 1){
                            this.isLoading = true;
                            this.timer1 = setInterval(()=>{
                                this.$http.get('/board?info=menu').then(res=>{
                                    if(res.data.code === 1){
                                        clearInterval(this.timer1);
                                        this.isLoading = false;
                                        sessionStorage.clear();
                                        this.$router.push('/login');
                                    }
                                })
                            },5000)
                        }
                    }).catch(err=>{
                        // to do
                    })
                }
                this.rebootChoose = false;
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
                            this.reboot_result(true);
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
                        var a = document.createElement('a');  
                        a.href = "./";
                        a.download = res.data.data.filename;
                        a.click();
                    }
                }).catch(err=>{
                    // to do
                })
            },
            //  导入配置
            restore_cfg(){
                var formData = new FormData();
                var file = document.getElementById('file');
                var files = file.files[0];
                var fileName = document.getElementById('fileName');
                var reg = /\.txt$/;
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
                        this.$message({
                            type: 'success',
                            text: this.lanMap['restore_config_succ']
                        })
                    }else{
                        this.$message({
                            type: 'error',
                            text: this.lanMap['restore_config_fail']
                        })
                    }
                    clearInterval(this.timer2);
                    this.isProgress = false;
                    this.width = 0;
                }).catch(err=>{
                    // to do
                });
            }
        },
        watch: {
            isProgress(){
                if(this.isProgress){
                    this.timer2 = setInterval(()=>{
                        this.width += parseInt(Math.random()*20);
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
    width: 100%;
    border: 1px solid #aaa;
    margin-top: 20px;
    box-shadow: 3px 3px 3px #ddd;
}
.dev-mgmt>div{
    padding: 10px 20px;
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