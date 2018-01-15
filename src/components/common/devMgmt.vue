<template>
    <div>
        <div class="dev-mgmt">
            <div>{{ lanMap["reboot"] }}</div>
            <div>
                <div>
                    <a href="javascript:;" @click="reboot()">{{ lanMap["reboot"] }}</a>
                </div>
                <p>
                    设备的部分配置修改需要重启设备才能生效，您可以通过点击&lt;{{ lanMap["reboot"] }}&gt;按钮来重启设备。重启过程中请不要断电。
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
                    我们建议您在升级软件或进行修改配置之前保存原有配置，点击&lt;备份&gt;按钮可以对当前配置进行备份
                </p>
            </div>
        </div>
        <div class="dev-mgmt">
            <div>{{ lanMap["restore_config"] }}</div>
            <div>
                <div>
                    <form> 
                        <input type="file" name="file1" size="80" class="hide" id="file" @change="changeFile()"/>
                        <span class="updateFile" id="fileName">点击选择文件</span>
                        <a href="javascript:;" @click="restore_cfg">{{ lanMap["restore_config"] }}</a>
                    </form>
                </div>
                <p>
                    您可以通过导入配置文件来恢复您备份的配置。
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
                    请注意，恢复出厂设置后，设备将恢复至出厂时的状态，所有自定义的设置将会丢失，如您需要保存现有配置，请备份当前配置。
                </p>
            </div>
        </div>
        <confirm tool-tips="是否确认恢复出厂设置?" @choose="result" v-if="userChoose"></confirm>
        <confirm tool-tips="是否确认重启设备?" @choose="reboot_result" v-if="rebootChoose"></confirm>
        <loading class="load" v-if="isLoading"></loading>
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
                isLoading: false
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
                    fileName.innerText = '点击选择文件';
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
                            var timer = setInterval(()=>{
                                this.$http.get('/board?info=menu').then(res=>{
                                    if(res.data.code === 1){
                                        clearInterval(timer);
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
                        // do sth
                        if(res.data.code === 1){
                            this.$http.get('/system_reboot').then(res=>{
                                
                            }).catch(err=>{
                                // to do
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
                    // do sth
                }).catch(err=>{
                    // to do
                })
            },
            //  导入配置
            restore_cfg(){
                var formData = new FormData();
                var file = document.getElementById('file');
                var files = file.files[0];
                if(!files) {
                    var fileName = document.getElementById('fileName');
                    fileName.innerText = '点击选择文件';
                    return
                }
                formData.append('file',files);
                this.$http.post('/system_restore', formData,{headers: {'Content-Type': 'multipart/form-data'}}).then(res =>{
                    // alert(res);
                }).catch(error=>{
                    // to do
                });
            }
        }
    }
</script>

<style scoped>
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
</style>