<template>
    <div>
        <div class="onu-perf-info" v-if="port_name.pon">
			<h2>{{ lanMap['onu_perf_info'] }}</h2>
			<div>
				<span>{{ lanMap['port_id'] }}</span>
				<select v-model.number="portid">
					<option v-for="(item,index) in port_name.pon" :key="index" :value="item.id">{{ item.name }}</option>
				</select>
			</div>
			<div v-if="onu_list.data">
				<span>{{ lanMap['onu_id'] }}</span>
				<select v-model.number="onuid">
					<option v-for="(item,index) in onu_list.data" :key="index" :value="item">{{ 'ONU'+ onu_list.port_id + '/' + item }}</option>
				</select>
			</div>
            <div v-else class="error-msg">{{ lanMap['no_onu_info'] }}</div>
		</div>
		<hr>
        <div v-if="onuPort.length && onu_list.data">
            <div>
                <span>ONU{{ lanMap['port_id'] }}</span>
                <select v-model.number="opid">
                    <option :value="item" v-for="(item, index) in onuPort" :key="index">{{ item === 0 ? 'PON' : item }}</option>
                </select>
                <a href="javascript: void(0);" class="op-perf-refresh" @click="refreshData">{{ lanMap['refresh'] }}</a>
                <a href="javascript: void(0);" class="op-perf-refresh" @click="openCfm">{{ lanMap['clear_perf'] }}</a>
                <a href="javascript: void(0);" class="op-perf-refresh" @click="change_data('history')" v-if="showFlag === 'history'">{{ lanMap['curr_perf'] }}</a>
                <a href="javascript: void(0);" class="op-perf-refresh" @click="change_data('current')" v-if="showFlag === 'current'">{{ lanMap['history_perf'] }}</a>
            </div>
            <div class="op-perf-info" v-if="opInfo.hasOwnProperty('status')">
                <span class="op-perf-status">{{ lanMap['onu_perf_status'] }}</span>:
                <span>{{ opInfo.status === 2 ? lanMap['enable'] : lanMap['disable'] }}</span>
                <span class="op-perf-period">{{ lanMap['onu_perf_period'] }}</span>:
                <span>{{ opInfo.period }}</span>
                <a href="javascript: void(0);" @click="openModal">{{ lanMap['config'] }}</a>
            </div>
            <div class="onu-perf-detail" v-if="Object.keys(onuPerf).length > 0">
                <div v-for="(item, key) in onuPerf" :key="key">
                    <span>{{ lanMap[key] }}</span>
                    <span>{{ item }}</span>
                </div>
            </div>
        </div>
        <div class="modal-dialog" v-if="isShowDialog">
            <div class="cover"></div>
            <div style="height: 260px;">
                <h3 class="modal-header">{{ lanMap['config'] + lanMap['onu_perf_status'] }}</h3>
                <div class="modal-item">
                    <span>ONU{{ lanMap['port_id'] }}</span>
                    <select v-model.number="opid_set">
                        <option :value="item" v-for="(item, index) in onuPort" :key="index">{{ item === 0 ? 'PON' : item }}</option>
                    </select>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['onu_perf_status'] }}</span>
                    <select v-model.number="status">
                        <option value="1">{{ lanMap['disable'] }}</option>
                        <option value="2">{{ lanMap['enable'] }}</option>
                    </select>
                </div>
                <div class="modal-item">
                    <span>{{ lanMap['onu_perf_period'] }}</span>
                    <input type="text" v-model.number="period">
                    s
                </div>
                <div class="modal-item">
                    <a href="javascript: void(0);" @click="submitCfg">{{ lanMap['apply'] }}</a>
                    <a href="javascript: void(0);" @click="closeModal">{{ lanMap['cancel'] }}</a>
                </div>
                <div class="close" @click="closeModal"></div>
            </div>
        </div>
        <confirm v-if="isCfm" @choose="clearData"></confirm>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
import { analysis } from '@/utils/common'
export default {
    name: 'onuPerf',
    computed: mapState(['lanMap', 'port_name', 'onu_list', 'system']),
    data(){
        return {
            portid: '',
            onuid: '',
            opid: 0,
            //  onu 端口列表
            onuPort: [],
            //  onu 端口统计状态
            opInfo: {},
            //  onu 端口统计信息/数据
            onuPerf: {},
            onuPerf_h: {},
            opid_set: 1,
            status: 1,
            period: '',
            isShowDialog: false,
            isCfm: false,
            showFlag: 'current',
            debounce: false
        }
    },
    created(){
        this.portid = sessionStorage.getItem('pid') || 1;
    },
    methods: {
        ...mapMutations({
            addonu_list: 'updateOnuList'
        }),
        getOnuPort(){
            this.$http.get('/onumgmt?form=port_cfg', { params: { port_id: this.portid, onu_id: this.onuid }}).then(res =>{
                this.onuPort = [];
                if(res.data.code === 1){
                    if(res.data.data && res.data.data.length){
                        this.onuPort.push(0);   //  onu  pon口
                        res.data.data.forEach(item =>{
                            this.onuPort.push(item.op_id);
                        })
                        var op = Number(sessionStorage.getItem('opid'));
                        if(this.opid === op){
                            this.getPerfStatus();
                            this.getPerfInfo();
                            return
                        }
                        this.opid = op || res.data.data[0];
                    }else{
                        this.opid = '';
                    }
                }else{
                    this.opid = '';
                }
            }).catch(err =>{})
        },
        getPerfStatus(){
            this.$http.get('/onumgmt?form=perf_status', { params: { port_id: this.portid, onu_id: this.onuid, op_id: this.opid } }).then(res =>{
                if(res.data.code === 1){
                    if(res.data.data){
                        this.opInfo = res.data.data;
                    }else{
                        this.opInfo = {};
                    }
                }else{
                    this.opInfo = {};
                }
            }).catch(err =>{})
        },
        getPerfInfo(){
            this.$http.get('onumgmt?form=perf_current', { params: { port_id: this.portid, onu_id: this.onuid, op_id: this.opid } }).then(res =>{
                if(res.data.code === 1){
                    if(res.data.data){
                        this.onuPerf = res.data.data;
                    }else{
                        this.onuPerf = {};
                    }
                }else{
                    this.onuPerf = {};
                }
            }).catch(err =>{})
        },
        getHistory(){
            this.$http.get('onumgmt?form=perf_history', { params: { port_id: this.portid, onu_id: this.onuid, op_id: this.opid } }).then(res =>{
                if(res.data.code === 1){
                    if(res.data.data){
                        this.onuPerf = res.data.data;
                    }else{
                        this.onuPerf = {};
                    }
                }else{
                    this.onuPerf = {};
                }
            }).catch(err =>{})
        },
        getResource(){
            this.$http.get('/onu_allow_list?form=resource', { params: { port_id: this.portid } }).then(res=>{
                if(res.data.code === 1){
                    var _onu_list = this.analysis(res.data.data.resource);
                    if(!_onu_list){
                        this.addonu_list({});
                        this.onuid = 0;
                        return
                    }
                    var obj = {
                        port_id: res.data.data.port_id,
                        data: _onu_list
                    }
                    this.addonu_list(obj);
                    var oid = Number(sessionStorage.getItem('oid'));
                    if(!oid){
                        if(!this.onuid){
                            this.onuid = _onu_list[0];
                        }else{
                            if(_onu_list.indexOf(this.onuid) === -1){
                                this.onuid = _onu_list[0];
                            }else{
                                this.getOnuPort();
                            }
                        }
                    }else{
                        if(!this.onuid){
                            this.onuid = oid;
                        }else{
                            if(_onu_list.indexOf(oid) === -1){
                                if(_onu_list.indexOf(this.onuid) === -1){
                                    this.onuid = _onu_list[0];
                                }else{
                                    this.getOnuPort();
                                }
                            }else{
                                if(this.onuid === oid){
                                    this.getOnuPort();
                                }else{
                                    this.onuid = oid;
                                }
                            }
                        }
                    }
                    sessionStorage.setItem('oid', this.onuid);
                }else{
                    this.addonu_list({});
                    this.onuid = 0;
                }
            }).catch(err=>{
                // to do
            })
        },
        openModal(){
            this.isShowDialog = true;
            this.opid_set = this.opid;
            this.status = this.opInfo.status;
        },
        submitCfg(){
            if(this.period === '') this.period = 0;
            if(this.status === this.opInfo.status 
                && this.period === this.opInfo.period && this.opid === this.opid_set){
                    this.$message({
                        type: 'info',
                        text: this.lanMap['modify_tips']
                    })
                this.closeModal();
                return
            }
            var post_data = {
                "method":"set",
                "param":{
                    "port_id": this.portid,
                    "onu_id": this.onuid,
                    "op_id": this.opid_set,
                    "status": this.status,
                    "period": this.period
                }
            }
            this.$http.post('/onumgmt?form=performance', post_data).then(res =>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['st_success']
                    })
                    if(this.opid === this.opid_set){
                        this.getPerfStatus();
                    }
                }else{
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ')' + res.data.message
                    })
                }
            }).catch(err =>{})
            this.closeModal();
        },
        closeModal(){
            this.isShowDialog = false;
            this.status = 1;
            this.period = '';
        },
        refreshData(){
            this.$parent.reload();
        },
        analysis(str){
            if(!str) return ''
            var result = [];
            var arr = str.split(',');
            for(var i=0,len=arr.length;i<len;i++){
                var substrs = arr[i];
                if(substrs.indexOf('-') !== -1){
                    var subArr = substrs.split('-');
                    var min = Number(subArr[0]),max = Number(subArr[subArr.length - 1]);
                    if(isNaN(min) || isNaN(max)) throw new TypeError;
                    result.push(min);
                    for(var j=1;j<max-min;j++){
                        result.push(min+j);
                    }
                    result.push(max);
                }else{
                    if(isNaN(Number(substrs))) throw new TypeError;
                    result.push(Number(substrs));
                }
            }
            return result.filter(item => !!item)
        },
        openCfm(){
            this.isCfm = true;
        },
        clearData(bool){
            if(bool){
                var post_data = {
                    "method": "clear",
                    "param": {
                        "port_id": this.portid,
                        "onu_id": this.onuid,
                        "op_id": this.opid
                    }
                }
                this.$http.post('/onumgmt?form=performance', post_data).then(res =>{
                    if(res.data.code === 1){
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap['clear_perf'] + this.lanMap['setting_ok']
                        })
                        this.getPerfInfo();
                    }else{
                        this.$message({
                            type: res.data.type,
                            text: '(' + res.data.code + ')' + res.data.message
                        })
                    }
                }).catch(err =>{})
            }
            this.isCfm = false;
        },
        change_data(flag){
            if(this.debounce){
                return this.$message({
                    type: 'warning',
                    text: this.lanMap['click_often']
                })
            }
            this.debounce = true;
            if(flag === 'current'){
                this.showFlag = 'history';
                this.getHistory();
            }
            if(flag === 'history'){
                this.showFlag = 'current';
                this.getPerfInfo();
            }
            setTimeout(_ =>{
                this.debounce = false;
            },1000)
        }
    },
    watch: {
        portid(){
            this.getResource();
            sessionStorage.setItem('pid', this.portid);
        },
        onuid(){
            if(this.onuid){
                this.getOnuPort();
                sessionStorage.setItem('oid', this.onuid);
            }
        },
        opid(){
            this.getPerfStatus();
            this.getPerfInfo();
            sessionStorage.setItem('opid', this.opid);
        }
    }
}
</script>

<style lang="less" scoped>
.onu-perf-info{
    padding:20px 0 20px 0;
    >h2{
        float: left;
        width: 200px;
        font-size: 24px;
        font-weight: 600;
        color: 	#67AEF7;
    }
    >div{
        float: left;
        >span{
            padding: 0 30px;
        }
    }
    &:after{
        display: table;
        content: "";
        clear: both;
    }
}
select{
	width: 120px;
	height: 30px;
	text-indent: 5px;
	font-size: 16px;
	margin-left: 30px;
}
hr{
	margin-bottom: 30px;
}
.op-perf-status, .op-perf-period{
    margin: 0 8px 0 30px;
}
span.op-perf-status{
    margin-left: 0;
}
.op-perf-info{
    margin: 20px 0;
}
span+a{
    margin-left: 30px;
}
.op-perf-refresh{
    margin: 0 0 0 30px;
}
div.error-msg{
    margin-left: 30px;
    height: 30px;
    line-height: 30px;
    color: red;
}
.onu-perf-detail{
    margin: 20px 0 0 0;
    >div{
        @diff: 2px;
        width: calc(~"50% - @{diff}");
        display: inline-block;
        height: 30px;
        line-height: 30px;
        border: 1px solid #ddd;
        border-top: none;
        border-right: none;
        &:first-child, &:nth-child(2){
            border-top: 1px solid #ddd;
        }
        &:nth-child(even), &:last-child{
            border-right: 1px solid #ddd;
        }
        >span{
            display: inline-block;
            text-indent: 8px;
            &:first-child{
                width: 320px;
            }
        }
    }
}
.modal-item{
    margin: 12px 0;
    span{
        display: inline-block;
        width: 210px;
        text-align: center;
    }
    select{
        margin: 0;
    }
    a{
        margin: 12px 0 0 100px; 
    }
}
</style>
