<template>
    <div>
        <div class="upgrade">
            <h2>{{ lanMap['upgrade'] }}</h2>
        </div>
        <form class="upload-form"> 
            <input type="file" name="file1" size="80" class="hide" id="file1" @change="changeFile()"/>
            <span class="updateFile" id="fileName1">点击选择文件</span>
            <a href="javascript:;" @click="upgrade">{{ lanMap["restore_config"] }}</a>
        </form>
    </div>
</template>

<script>
import { mapState } from 'vuex'
    export default {
        name: 'upgrade',
        computed: mapState(['lanMap']),
        methods: {
            changeFile(){
                var file = document.getElementById('file1');
                var fileName = document.getElementById('fileName1');
                fileName.innerText = file.value.substring(file.value.lastIndexOf('\\')+1);
            },
            upgrade(){
                var formData = new FormData();
                var file = document.getElementById('file1');
                var files = file.files[0];
                if(!files) {
                    var fileName = document.getElementById('fileName1');
                    fileName.innerText = '点击选择文件';
                    return
                }
                formData.append('file',files);
                this.$http.post('/upgrade', formData,{headers: {'Content-Type': 'multipart/form-data'}}).then( (res) => {
                    // alert(res);
                }).catch((error) =>{
                    // to do
                });
            }
        }
    }
</script>

<style scoped>
div.upgrade{
    margin: 10px 50px 20px 10px;
}
div.upgrade>h2{
    font-size: 24px;
    font-weight: 600;
    color: #67AEF7;
    margin-right: 50px;
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
</style>