<template>
    <div id="sys-set">
        <div class="change-lang rt">
            <a href="javascript:void(0);" @click="backto_devmgmt">{{ lanMap['goback_devmgmt'] }}</a>
            <span>{{ lanMap['lang'] }}</span>
            <select v-model="lang">
                <option value="zh">简体中文</option>
                <option value="en">English</option>
            </select>
        </div>
        <h1 class="sys-set-title">{{ lanMap['sysinfo_set'] }}</h1>
        <div class="sys-set-item">
            <h1>logo</h1>
            <p class="tips">{{ lanMap['logosize_tips'] }}</p>
            <form> 
                <input type="file" name="sys-file" class="hide" id="sys-file" @change="changeFile()" accept="image/png"/>
                <span class="updateFile" id="sys-fileName">{{ lanMap['file_click'] }}</span>
                <a href="javascript:void(0);" @click="commit_logo">{{ lanMap['commit'] }}</a>
            </form>
        </div>
        <div class="sys-set-item">
            <!-- <h3>{{ lanMap['product_name'] }}</h3>
            <input type="text" maxlength="16" v-model="product_name" placeholder="max length: 16 character"> -->
            <h1>{{ lanMap['company_info'] }}</h1>
            <h3>{{ lanMap['company_name'] }}</h3>
            <input type="text" v-model="company_name" maxlength="128">
            <br>
            <h3>{{ lanMap['company_addr'] }}</h3>
            <input type="text" v-model="company_addr" maxlength="256">
            <h3>{{ lanMap['company_email'] }}</h3>
            <input type="text" v-model="company_email" maxlength="32">
            <h3>{{ lanMap['company_phone'] }}</h3>
            <input type="text" v-model="company_phone" maxlength="32">
        </div>
        <div class="sys-set-item">
            <a href="javascript:void(0);" @click="commit_info">{{ lanMap['commit'] }}</a>
        </div>
        <loading v-if="isloading"></loading>
    </div>
</template>

<script>
import { mapState,mapMutations } from "vuex"
import loading from '@/components/common/loading'
export default {
    name: 'sys_setting',
    components: { loading },
    computed: mapState(['lanMap','language']),
    data(){
        return {
            lang: 'zh',
            isloading: false,
            product_name: '',
            company_name: '',
            company_addr: '',
            company_email: '',
            company_phone: ''
        }
    },
    created(){
        this.lang = sessionStorage.getItem('def_lang') || 'en';
        if(sessionStorage.getItem('uname') !== 'devol'){
            this.$router.back();
        }
    },
    methods: {
        ...mapMutations({
            set_language: 'updateLang'
        }),
        backto_devmgmt(){
            this.$router.replace('/main');
        },
        //  选择上传文件
        changeFile(){
            var file = document.getElementById('sys-file');
            var fileName = document.getElementById('sys-fileName');
            var files = file.files[0];
            if(!files) {
                fileName.innerText = this.lanMap['file_click'];
                return
            }
            var _this = this;
            var myImg = URL.createObjectURL(files);
            var img = new Image();
            img.src = myImg;
            img.onload = function(){
                if(img.width !== 220 || img.height !== 100){
                    file.value = '';
                    fileName.innerText = _this.lanMap['file_click'];
                }
            }
            fileName.innerText = file.value.substring(file.value.lastIndexOf('\\')+1);
        },
        commit_logo(){
            var formData = new FormData();
            var file = document.getElementById('sys-file');
            var files = file.files[0];
            var fileName = document.getElementById('sys-fileName');
            if(!files) {
                fileName.innerText = this.lanMap['file_click'];
                this.$message({
                    type: 'warning',
                    text: this.lanMap['file_not_select']
                })
                return
            }
            if(files.size/1024 > 200){
                this.$message({
                    type: 'warning',
                    text: this.lanMap['imagesize_tips']
                })
                return
            }
            formData.append('file',files);
            this.isloading = true;
            this.$http.post('/upgrade?type=logo', formData,{
                headers: {'Content-Type': 'multipart/form-data'},
                timeout: 0
            }).then(res=>{
                this.isloading = false;
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['setting_ok']
                    })
                }else if(res.data.code > 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['setting_fail']
                    })
                }
            }).catch(err=>{
                // to do
            });
        },
        commit_info(){
            if(!this.company_name && !this.company_addr && !this.company_email && !this.company_phone){
                this.$message({
                    type: 'warning',
                    text: this.lanMap['modify_tips']
                })
                return
            }
            var post_data = {
                param: {
                    name: this.company_name,
                    addr: this.company_addr,
                    email: this.company_email,
                    phone: this.company_phone
                }
            }
            this.$http.post('/board?info=setting_board',post_data).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['setting_ok']
                    })
                }else if(res.data.code > 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['setting_fail']
                    })
                }
            }).catch(err=>{
                // to do
            })
        }
    },
    watch: {
        lang(){
            this.set_language(this.lang);
        },
        language(){
            this.lang = this.language;
        }
    }
}
</script>

<style lang="less" scoped>
#sys-set{
    padding-top: 10px;
}
.sys-set-item{
    padding-left: 30px;
    h2,h3,input,form,p,>a{
        margin-left: 20px;
    }
}
form{
    position: relative;
    margin: 10px 0;
    height: 40px;
    input[type="file"]{
        width: 300px;
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
        background: #ddd;
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
    span+a{
        width: 300px;
        height: 38px;
        line-height: 40px;
        padding: 0;
        margin: 0 0 0 330px;
    }
}
input[type="text"]{
    width: 60%;
}
.sys-set-title{
    height: 60px;
    line-height: 80px;
    padding-left: 20px;
    color: #018DFF;
}
h2{
    color: #67aef6;
    font-size: 20px;
    margin: 10px 0;
}
h3{
    font-size: 18px;
    color: #333;
    margin: 10px 0;
}
p.tips{
    font-size: 15px;
    color: #666;
}
a{
    width: 200px;
    margin: 10px 0;
}
h1{
    color: #67aef6;
    font-size: 32px;
    height: 60px;
    line-height: 60px;
}
.change-lang{
    margin: 20px 30px 0 0;
    span{
        margin-right: 10px;
        font-weight: 600;
        color: #555;
    }
    select{
        width: 120px;
    }
    a{
        margin-right: 30px;
        width: auto;
        padding: 0 20px;
        background: #20BB44;
    }
}
</style>
