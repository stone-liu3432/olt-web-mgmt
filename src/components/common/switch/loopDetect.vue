<template>
    <div>
        <h2>{{ lanMap['loop_detect'] }}</h2>
        <tabBar :tab="['pon_loop_detect', 'ge_loop_detect']" @togglePage="select_page"></tabBar>
        <div class="loop-detect" v-if="Object.keys(ld_state).length">
            <div>
                <span>{{ lanMap['ld_status'] }}</span>
                <span>
                    <span v-if="!editStatus">{{ ld_state.ld_status ? lanMap['enable'] : lanMap['diable'] }}</span>
                    <select v-model.number="ld_state.ld_status" v-else>
                        <option value="0">{{ lanMap['disable'] }}</option>
                        <option value="1">{{ lanMap['enable'] }}</option>
                    </select>
                </span>
                <a href="javascript: void(0);" v-if="editStatus" @click="submitStatus">{{ lanMap['apply'] }}</a>
                <a href="javascript: void(0);" v-if="editStatus" @click="editStatus = false;">{{ lanMap['cancel'] }}</a>
                <a href="javascript: void(0);" v-else @click="handleEditStatus">{{ lanMap['modify'] }}</a>
            </div>
            <div v-if="ld_state.ld_status">
                <div class="loop-detect-item">
                    <span>{{ lanMap['detect_interval'] }}</span>
                    <span>
                        <span v-if="!editInterval">{{ ld_state.detect_interval }} s</span>
                        <input type="text" v-else v-model.number="ld_state.detect_interval"
                        :style="{ 'border-color': ld_state.detect_interval !== '' && (ld_state.detect_interval < 1 || ld_state.detect_interval > 3600 || isNaN(ld_state.detect_interval)) ? 'red' : '' }">
                    </span>
                    <a href="javascript: void(0);" v-if="editInterval" @click="submitInterval">{{ lanMap['apply'] }}</a>
                <a href="javascript: void(0);" v-if="editInterval" @click="editInterval = false;">{{ lanMap['cancel'] }}</a>
                    <a href="javascript: void(0);" v-else @click="handleEditInterval">{{ lanMap['modify'] }}</a>
                </div>
                 <div class="loop-detect-item">
                    <span>{{ lanMap['recover_mode'] }}</span>
                    <span>
                        <span v-if="!editMode">{{ ld_state.recover_mode ? 'Manual' : 'Auto' }}</span>
                        <select v-else v-model.number="ld_state.recover_mode">
                            <option :value="0">Auto</option>
                            <option :value="1">Manual</option>
                        </select>
                    </span>
                    <a href="javascript: void(0);" v-if="editMode" @click="submitMode">{{ lanMap['apply'] }}</a>
                <a href="javascript: void(0);" v-if="editMode" @click="editMode = false;">{{ lanMap['cancel'] }}</a>
                    <a href="javascript: void(0);" v-else @click="handleEditMode">{{ lanMap['modify'] }}</a>
                </div>
                <div class="loop-detect-item" v-if="ld_state.recover_mode === 1">
                    <span>{{ lanMap['recover_manual'] }}</span>
                    <span></span>
                    <a href="javascript: void(0);" @click="submitManual">{{ lanMap['apply'] }}</a>
                </div>
                <div class="loop-detect-item" style="margin-bottom: 30px;">
                    <span>{{ lanMap['recover_time'] }}</span>
                    <span>
                        <span v-if="!editTime">{{ ld_state.recover_time }} s</span>
                        <input type="text" v-else v-model="ld_state.recover_time"
                            :style="{ 'border-color': ld_state.recover_time !== '' && (ld_state.recover_time < 1 || ld_state.recover_time > 3600 || isNaN(ld_state.recover_time)) ? 'red' : '' }">
                    </span>
                    <a href="javascript: void(0);" v-if="editTime" @click="submitTime">{{ lanMap['apply'] }}</a>
                <a href="javascript: void(0);" v-if="editTime" @click="editTime = false;">{{ lanMap['cancel'] }}</a>
                    <a href="javascript: void(0);" v-else @click="handleEditTime">{{ lanMap['modify'] }}</a>
                </div>
                <h3>
                    {{ lanMap['ld_info'] }}
                    <a href="javascript: void(0);" @click="refreshInfo">{{ lanMap['refresh'] }}</a>
                </h3>
                <div class="loop-detect-table" v-if="ld_info.length">
                    <div>
                        <span v-if="show_index === 'pon_loop_detect'">{{ `PON ID /${lanMap['onu_id']}` }}</span>
                        <span v-if="show_index === 'ge_loop_detect'">{{ lanMap['port_id'] }}</span>
                        <span>{{ lanMap['status'] }}</span>
                        <span v-if="show_index === 'pon_loop_detect'">{{ lanMap['onu_status'] }}</span>
                        <span v-if="show_index === 'pon_loop_detect'">{{ `${lanMap['loopback']} PON ID /${lanMap['onu_id']}` }}</span>
                        <span v-if="show_index === 'ge_loop_detect'">{{ lanMap['port_status'] }}</span>
                        <span v-if="show_index === 'ge_loop_detect'">{{ lanMap['ld_port_id'] }}</span>
                    </div>
                    <div v-for="(item,index) in ld_info" :key="index">
                        <span v-if="show_index === 'pon_loop_detect'">{{ `${item.port_id}/ ${item.onu_id}` }}</span>
                        <span v-if="show_index === 'ge_loop_detect'">{{ formatPonName(item.port_id) }}</span>
                        <span>{{ item.status ? 'Loop-Detect' : ' - ' }}</span>
                        <span v-if="show_index === 'pon_loop_detect'">{{ item.onu_status ? 'Add Black List' : ' - ' }}</span>
                        <span v-if="show_index === 'pon_loop_detect'">{{ `${item.ld_port_id}/${item.ld_onu_id}` }}</span>
                        <span v-if="show_index === 'ge_loop_detect'">{{ item.port_stauts ? 'Blocked' : ' - ' }}</span>
                        <span  v-if="show_index === 'ge_loop_detect'">
                            {{ formatPonName(item.ld_port_id) }}
                        </span>
                    </div>
                </div>
                <p v-else>{{ lanMap['no_more_data'] }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
export default {
    name: "loopDetect",
    computed: mapState(["lanMap", 'port_name']),
    data() {
        return {
            editStatus: false,
            editMode: false,
            editTime: false,
            editInterval: false,
            ld_state: {
                // ld_status: 1,
                // recover_mode: 1,
                // recover_time: 1,
                // detect_interval: 1
            },
            show_index: "pon_loop_detect",
            ld_info: [
                {
                    // status: 1,
                    // onu_status: 1,
                    // port_id: 1,
                    // onu_id: 1,
                    // ld_port_id: 1,
                    // ld_onu_id: 1
                }
            ],
            _timer: false,
        };
    },
    created() {
        switch (this.show_index) {
        case "pon_loop_detect":
            this.getPonStatus();
            break;
        case "ge_loop_detect":
            this.getGeStatus();
            break;
        }
    },
    methods: {
        getPonInfo() {
            this.$http.get('/pon_loop_detect?form=loop_detect_info').then(res => {
                this.ld_info = {};
                if (res.data.code === 1) {
                    if (res.data.data) {
                        this.ld_info = res.data.data;
                    }
                }
            })
            .catch(err => {});
        },
        getGeInfo() {
            this.$http.get('/switch_loop_detect?form=loop_detect_info').then(res => {
            this.ld_info = {};
            if (res.data.code === 1) {
                if (res.data.data) {
                    this.ld_info = res.data.data;
                    }
                }
            })
            .catch(err => {});
        },
        getPonStatus(){
            this.$http.get("/pon_loop_detect?form=loop_detect_config").then(res =>{
                this.ld_state = {};
                if(res.data.code === 1){
                    if(res.data.data){
                        this.ld_state = res.data.data;
                        this.getPonInfo();
                    }
                }
            }).catch(err =>{})
        },
        getGeStatus(){
            this.$http.get("/switch_loop_detect?form=loop_detect_config").then(res =>{
                this.ld_state = {};
                if(res.data.code === 1){
                    if(res.data.data){
                        this.ld_state = res.data.data;
                        this.getGeInfo();
                    }
                }
            }).catch(err =>{})
        },
        refreshInfo(){
            this.show_index === 'pon_loop_detect' && this.getPonStatus();
            this.show_index === 'ge_loop_detect' && this.getGeStatus();
        },
        select_page(page) {
            this.show_index = page;
            switch (page) {
                case "pon_loop_detect":
                this.getPonStatus();
                break;
                case "ge_loop_detect":
                this.getGeStatus();
                break;
            }
        },
        handleEditStatus(){
            this.editStatus = true;
        },
        handleEditInterval(){
            this.editInterval = true;
        },
        handleEditMode(){
            this.editMode = true;
        },
        handleEditTime(){
            this.editTime = true;
        },
        submitStatus(){
            var data = {
                "method": "set",
                "param":{
                    "ld_status": this.ld_state.ld_status
                }
            }
            var url;
            if(this.show_index === 'pon_loop_detect'){
                url = '/pon_loop_detect?form=admin'
            }else{
                url = '/switch_loop_detect?form=admin'
            }
            this.$http.post(url, data).then(res =>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['st_success']
                    })
                    this.editStatus = false;
                    this.show_index === 'pon_loop_detect' && this.getPonStatus();
                    this.show_index === 'ge_loop_detect' && this.getGeStatus();
                }else{
                    this.$message({
                        type: res.data.type,
                        text: `(${res.data.code}) ${res.data.message}`
                    })
                }
            }).catch(err =>{})
        },
        submitInterval(){
            if(this.ld_state.detect_interval < 1 || this.ld_state.detect_interval > 3600 || isNaN(this.ld_state.detect_interval)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['detect_interval']
                })
                return
            }
            var data = {
                "method": "set",
                "param": {
                    "detect_interval": this.ld_state.detect_interval
                }
            }
            var url;
            if(this.show_index === 'pon_loop_detect'){
                url = '/pon_loop_detect?form=detect_interval'
            }else{
                url = '/switch_loop_detect?form=detect_interval'
            }
            this.$http.post(url, data).then(res =>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['st_success']
                    })
                    this.editInterval = false;
                    this.show_index === 'pon_loop_detect' && this.getPonStatus();
                    this.show_index === 'ge_loop_detect' && this.getGeStatus();
                }else{
                    this.$message({
                        type: res.data.type,
                        text: `(${res.data.code}) ${res.data.message}`
                    })
                }
            }).catch(err =>{})
        },
        submitMode(){
            var data = {
                "method": "set",
                "param":{
                    "recover_mode": this.ld_state.recover_mode
                }
            }
            var url;
            if(this.show_index === 'pon_loop_detect'){
                url = '/pon_loop_detect?form=recover_mode'
            }else{
                url = '/switch_loop_detect?form=recover_mode'
            }
            this.$http.post(url, data).then(res =>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['st_success']
                    })
                    this.editMode = false;
                    this.show_index === 'pon_loop_detect' && this.getPonStatus();
                    this.show_index === 'ge_loop_detect' && this.getGeStatus();
                }else{
                    this.$message({
                        type: res.data.type,
                        text: `(${res.data.code}) ${res.data.message}`
                    })
                }
            }).catch(err =>{})
        },
        submitTime(){
            if(this.ld_state.recover_time < 1 || this.ld_state.recover_time > 3600 || isNaN(this.ld_state.recover_time)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['recover_time']
                })
                return
            }
            var data = {
                "method": "set",
                "param": {
                    "recover_time": this.ld_state.recover_time
                }
            }
            var url;
            if(this.show_index === 'pon_loop_detect'){
                url = '/pon_loop_detect?form=recover_time'
            }else{
                url = '/switch_loop_detect?form=recover_time'
            }
            this.$http.post(url, data).then(res =>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['st_success']
                    })
                    this.editTime = false;
                    this.show_index === 'pon_loop_detect' && this.getPonStatus();
                    this.show_index === 'ge_loop_detect' && this.getGeStatus();
                }else{
                    this.$message({
                        type: res.data.type,
                        text: `(${res.data.code}) ${res.data.message}`
                    })
                }
            }).catch(err =>{})
        },
        submitManual(){
            if(this._timer){
                this.$message({
                    type: 'warning',
                    text: this.lanMap['click_often']
                })
                return
            }
            this._timer = true;
            var data = {
                "method": "set",
                "param": {
                    "manual": 0
                }
            }
            var url;
            if(this.show_index === 'pon_loop_detect'){
                url = '/pon_loop_detect?form=recover_manual'
            }else{
                url = '/switch_loop_detect?form=recover_manual'
            }
            this.$http.post(url, data).then(res =>{
                if(res.data.code === 1){
                    this.$message({
                        type: 'success',
                        text: this.lanMap['st_success']
                    })
                    this.show_index === 'pon_loop_detect' && this.getPonStatus();
                    this.show_index === 'ge_loop_detect' && this.getGeStatus();
                }else{
                    this.$message({
                        type: res.data.type,
                        text: `(${res.data.code}) ${res.data.message}`
                    })
                }
            }).catch(err =>{})
            setTimeout(_ =>{
                this._timer = false;
            }, 1000)
        },
        formatPonName(id){
            return this.port_name.pon[id] ? this.port_name.pon[id].name : 
                                this.port_name.ge[id] ? this.port_name.ge[id].name : 
                                this.port_name.xge[id].name;
        }
    }
};
</script>

<style lang="less" scoped>
h2 {
    margin: 20px 0;
    font-size: 24px;
    font-weight: 600;
    color: #67aef6;
    width: 300px;
}
h3{
    margin: 20px 0;
    font-size: 20px;
    font-weight: 600;
    color: #67aef6;
    >a{
        margin-left: 30px;
    }
}
select{
    width: 120px;
}
div.loop-detect{
    >div{
        &:first-child{
            height: 36px;
            line-height: 36px;
        }
        >span{
            display: inline-block;
            width: 200px;
        }
        div.loop-detect-item{
            height: 36px;
            line-height: 36px;
            >span{
                display: inline-block;
                width: 200px;
            }
        }
        p{
            color: red;
            text-align: center;
        }
        div.loop-detect-table{
            >div{
                height: 30px;
                line-height: 30px;
                border: 1px solid #ddd;
                border-bottom: none;
                &:last-child{
                    border-bottom: 1px solid #ddd;
                }
                >span{
                    border-right: 1px solid #ddd;
                    padding-left: 6px;
                    display: inline-block;
                    vertical-align: middle;
                    height: 30px;
                    line-height: 30px;
                    width: 24%;
                    text-align: center;
                    &:last-child{
                        border-right: none;
                    }
                }
            }
        }
    }
}
</style>
