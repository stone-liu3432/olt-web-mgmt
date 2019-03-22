<template>
    <div class="packet-filter">
        <h3>packet filter</h3>
        <div>
            <a href="javascript:void(0);" @click="openModal('add')">{{ lanMap['add'] }}</a>
            <a href="javascript:void(0);" @click="openModal('delete')">{{ lanMap['delete'] }}</a>
        </div>
        <div v-for="(item,key) in packetFilterShow" :key="key"
            class="packet-filter-item" v-if="packetFilterShow.length">
            <div>
                <span>ACL ID: </span>
                <span>{{ item.acl_id }}</span>
            </div>
            <div>
                <span>Rule ID: </span>
                <span>{{ item.rule_id }}</span>
            </div>
            <div>
                <span>{{ lanMap['state'] }}: </span>
                <span>{{ item.state ? ' Running' : ' Not running' }}</span>
            </div>
            <div class="packet-filter-portlist">
                <span>{{ lanMap['port_list'] }}: </span>
                <span>{{ item.port_list | analysis(system.data.ponports, system.data.geports) || '—'  }}</span>
            </div>
        </div>
        <div class="modal-dialog" v-if="!!showModal">
            <div class="cover"></div>
            <div>
                <div class="packet-filter-modal">
                    <h4 class="modal-header" v-if="showModal === 'add'">{{ lanMap['add'] }}</h4>
                    <h4 class="modal-header" v-if="showModal === 'delete'">{{ lanMap['delete'] }}</h4>
                    <div>
                        <span>ACL ID</span>
                        <input type="text" v-model.number="acl_id" v-focus>
                        <span class="packet-filter-tips">Range: 2000 - 5999</span>
                    </div>
                    <div>
                        <span>Rule ID</span>
                        <input type="text" v-model.number="rule_id">
                        <span class="packet-filter-tips">Range: 0 - 16</span>
                    </div>
                    <div>
                        <span>{{ lanMap['port_list'] }}</span>
                        <input type="text" v-model="port_list">
                        <span class="packet-filter-tips">EX. 1,5-9,12</span>
                    </div>
                    <div>
                        <a href="javascript:void(0);" @click="submitForm">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="closeModal">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="closeModal"></div>
            </div>
        </div>
        <customPagination v-if="isShowPagination" :pages-data="pagesData"
            @updatePage="changePage">
        </customPagination>
    </div>
</template>

<script>
import { mapState } from "vuex"
import customPagination from '../pagination'
var limit = 20;
export default {
    name: 'packetFilter',
    computed: mapState(["change_url", 'lanMap', 'system']),
    components: { customPagination },
    data(){
        return {
            packetFilter: {},
            pagesData: {},
            isShowPagination: false,
            packetFilterShow: [],
            acl_id: '',
            rule_id: '',
            port_list: '',
            showModal: ''
        }
    },
    created(){
        this.getData();
    },
    methods: {
        getData(){
            this.$http.get(this.change_url.get_packetfilter).then(res =>{
                if(res.data.code === 1){
                    this.packetFilter = res.data;
                    var count = res.data.data.length;
                    this.pagesData = {
                        count,
                        limit
                    }
                    if(count > limit){
                        this.isShowPagination = true;
                        this.packetFilterShow = res.data.data.slice(0, limit);
                    }else{
                        this.packetFilterShow = res.data.data;
                    }
                }else{
                    this.packetFilter = {};
                }
            }).catch(err =>{

            })
        },
        changePage(index){
            var start = limit * (index - 1),end = limit * index;
            (end > this.packetFilter.data.length) && (end = this.packetFilter.data.length);
            this.packetFilterShow = this.packetFilter.data.slice(limit * (index - 1), limit * index);
        },
        openModal(str){
            this.showModal = str;
        },
        closeModal(){
            this.showModal = '';
        },
        submitForm(){
            if(this.acl_id < 2000 || this.acl_id > 5999){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ACL ID' 
                })
                return
            }
            if(this.rule_id < 0 || this.rule_id > 16){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': Rule ID' 
                })
                return
            }
            var reg = /^[\d,-]+$/g;
            if(!reg.test(this.port_list)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['port_list']
                })
                return
            }
            if(this.showModal === 'add'){
                this.submitAdd();
            }
            if(this.showModal === 'delete'){
                this.submitDel();
            }
            this.closeModal();
        },
        submitAdd(){
            var post_data = {
                "method": "set",
                "param": {
                    "acl_id": this.acl_id,
                    "rule_id": this.rule_id,
                    "port_list": this.port_list
                }
            }
            this.$http.post('/switch_pkfilter?form=inbound', post_data).then(res =>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['add'] + this.lanMap['st_success']
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
        },
        submitDel(){
            var post_data = {
                "method": "delete",
                "param": {
                    "acl_id": this.acl_id,
                    "rule_id": this.rule_id,
                    "port_list": this.port_list
                }
            }
            this.$http.post('/switch_pkfilter?form=inbound', post_data).then(res =>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
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
    }
}
</script>

<style lang="less" scoped>
h3{
    font-size: 24px;
    font-weight: 600;
    color: #67AEF7;
    margin: 10px 0 20px 0;
}
h3+div{
    margin: 10px 0 10px 10px;
}
div.packet-filter-item{
    padding: 8px 0 8px 16px;
    vertical-align: top;
    margin: 0 0 8px 10px;
    border: 1px solid #ddd;
    >div{
        float: left;
        width: 16%;
        height: 26px;
        line-height: 26px;
        &:nth-child(3){
            width: 60%;
        }
    }
    div.packet-filter-portlist{
        width: 100%;
        height: auto;
        >span{
            width: 880px;
            word-break: break-all;
            float: left;
            &:first-child{
                width: 100px;
            }
        }
    }
    &::after{
        content: '';
        display: table;
        clear: both;
    }
}
div.cover+div{
    height: 245px;
}
div.packet-filter-modal{
    >div{
        height: 30px;
        line-height: 30px;
        margin: 10px 0;
        a{
            margin: 10px 0 0 110px;
        }
        >span{
            display: inline-block;
            text-align: center;
            text-indent: 20px;
            width: 120px;
        }
        .packet-filter-tips{
            font-size: 14px;
            color: #333;
            width: auto;
        }
    }
}
</style>
