<template>
    <div class="loid-mgmt">
        <div>
            <h2>{{ lanMap['loid_mgmt'] }}</h2>
            <span>{{ lanMap['port_id'] }}</span>
            <select v-model="port_id">
                <option v-for="(item,key) in port_name.pon" :key="key" :value="item.id">{{ item.name }}</option>
            </select>
        </div>
        <hr>
        <div>
            <a href="javascript:void(0);" @click="openModal">{{ lanMap['add'] }}</a>
            <a href="javascript:void(0);" @click="refreshData">{{ lanMap['refresh'] }}</a>
        </div>
        <div class="loid-list">
            <div :class="[ loid.data ? '' : 'no-more-data' ]">
                <span>ID</span>
                <span>{{ lanMap['used'] }}</span>
                <span>LOID</span>
                <span>{{ lanMap['password'] }}</span>
                <span>{{ lanMap['config'] }}</span>
            </div>
            <div v-for="(item, index) in loid.data" :key="index" v-if="loid.data">
                <span>{{ index + 1 }}</span>
                <span>{{ item.used ? item.mac : 'False' }}</span>
                <span>{{ item.loid }}</span>
                <span>{{ item.password }}</span>
                <span class="small-btn" @click="deleteLoid(item)">{{ lanMap['delete'] }}</span>
            </div>
            <p v-if="!loid.data">{{ lanMap['no_more_data'] }}</p>
        </div>
        <confirm @choose="submitDel" v-if="delModal"></confirm>
        <div class="modal-dilog" v-if="addModal">
            <div class="cover"></div>
            <div>
                <div class="modal-header">{{ lanMap['add'] + ' LOID' }}</div>
                <div class="modal-item">
                    <span>port id</span>
                    <select v-model="add_port">
                        <option v-for="(item,key) in port_name.pon" :key="key" :value="item.id">{{ item.name }}</option>
                    </select>
                </div>
                <div class="modal-item">
                    <span>LOID</span>
                    <input type="text" v-model="add_loid"
                        :style="{ 'border-color': add_loid !== '' && !reg_loid.test(add_loid) ? 'red' : '' }">
                    <span>Range: 1-24 characters</span>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['password'] }}</span>
                    <input type="text" v-model="add_pass"
                        :style="{ 'border-color': add_pass !== '' && !reg_pass.test(add_pass) ? 'red' : '' }">
                    <span>Range: 0-12 characters</span>
                </div>
                <div>
                    <a href="javascript:void(0);" @click="submitAdd">{{ lanMap['apply'] }}</a>
                    <a href="javascript:void(0);" @click="closeModal">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="closeModal"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "loid",
    computed: mapState(["lanMap", "port_name"]),
    data() {
        return {
            loid: {},
            port_id: 1,
            post_data: {},
            delModal: false,
            addModal: false,
            add_port: 1,
            add_loid: '',
            add_pass: '',
            reg_loid: /^\w{1,24}$/,
            reg_pass: /^\w{1,12}$/
        }
    },
    created(){
        this.getData();
    },
    methods: {
        deleteLoid(item){
            this.delModal = true;
            this.post_data = {
                "method": "delete",
                "param": {
                    "port_id": this.port_id,
                    "loid": item.loid,
                    "password": item.password
                }
            }
        },
        getData(){
            this.$http.get('/ponmgmt?form=loidlist&port_id=' + this.port_id).then(res =>{
                if(res.data.code === 1){
                    this.loid = res.data;
                }else{
                    this.loid = {};
                }
            }).catch(err =>{

            })
        },
        submitDel(bool){
            if(bool){
                this.$http.post('/ponmgmt?form=loidlist', this.post_data).then(res =>{
                    if(res.data.code === 1){
                        this.$message({
                            type: 'success',
                            text: this.lanMap['delete'] + this.lanMap['st_success']
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
            }
            this.delModal = false;
            this.post_data = {};
        },
        openModal(){
            this.addModal = true;
        },
        closeModal(){
            this.addModal = false;
            this.add_port = 1;
            this.add_loid = '';
            this.add_pass = '';
        },
        submitAdd(){
            if(!this.reg_loid.test(this.add_loid)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': LOID'
                })
                return
            }
            if(this.add_pass !== '' && !this.reg_pass.test(this.add_pass)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['password']
                })
                return
            }
            var post_data = {
                "method": "add",
                "param": {
                    "port_id": this.add_port,
                    "loid": this.add_loid,
                    "password": this.add_pass
                }
            }
            this.$http.post('/ponmgmt?form=loidlist', post_data).then(res =>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['add'] + this.lanMap['st_success']
                    })
                    this.getData();
                }else{
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err =>{})
            this.closeModal();
        },
        refreshData(){
            this.$parent.reload();
        }
    },
    watch: {
        port_id(){
            this.getData();
        }
    }
};
</script>

<style lang="less" scoped>
div.loid-mgmt {
    margin: 20px 0 0 0;
    > div:first-child {
        height: 30px;
        line-height: 30px;
    }
    h2 {
        float: left;
        width: 300px;
        font-size: 24px;
        font-weight: 600;
        color: #67aef7;
    }
}
hr {
    margin: 20px 0;
}
select {
    width: 160px;
    height: 30px;
    font-size: 16px;
    border-radius: 3px;
    text-indent: 10px;
    margin-left: 6px;
}
div.loid-list{
    margin: 10px 0 0 0;
    >div{
        font-size: 0;
        text-align: center;
        >span{
            font-size: 16px;
            height: 28px;
            line-height: 28px;
            display: inline-block;
            width: 19.8%;
            border: 1px solid #ddd;
            border-right: none;
            border-bottom: none;
            vertical-align: middle;
            &:last-child{
                border-right: 1px solid #ddd;
            }
        }
        &:last-child{
            >span{
                border-bottom: 1px solid #ddd;
            }
        }
    }
    div.no-more-data{
        >span{
            border-bottom: 1px solid #ddd;
        }
        &+p{
            color: red;
            margin: 6px 0 0 10px;
        }
    }
}
.small-btn{
    user-select: none;
    color: #67aef6;
    transition: all .2s linear;
    cursor: pointer;
    &:hover{
        color: #007ACC;
    }
    &:active{
        color: #67aef6;
    }
}
div.cover+div{
    height: 250px;
    >div{
        >span{
            &:first-child{
                display: inline-block;
                width: 120px;
                text-align: center;
            }
        }
        a{
            margin: 8px 0 0 105px;
        }
        select{
            margin: 0;
            width: 197px;
        }
        input+span{
            color: #666;
            font-size: 14px;
            margin: 0 0 0 6px;
        }
    }
    .modal-item{
        height: 30px;
        line-height: 30px;
        margin: 10px 0;
    }
}
</style>
