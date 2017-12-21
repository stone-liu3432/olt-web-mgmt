<template>
    <div>
        <form name="uploadForm" method="POST" enctype="multipart/form-data" action="/ProcessServer/FileOperate/fileUpServlet"> 
            <input type="file" name="file1" size="80" class="hide" id="file" @change="changeFile()"/>
            <span class="updateFile" id="fileName">点击选择文件</span>
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
                var file = document.getElementById('file');
                var fileName = document.getElementById('fileName');
                fileName.innerText = file.value.substring(file.value.lastIndexOf('\\')+1);
            },
            upgrade(){
                var formData = new FormData();
                var file = document.getElementById('file');
                var files = file.files[0];
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
form{
    position: relative;
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