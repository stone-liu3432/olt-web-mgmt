<template>
    <div>
        <h3>{{ lanMap['timerange'] }}</h3>
        <div>
            <a href="javascript:void(0);" @click="openModal('add')">{{ lanMap['add'] }}</a>
            <a href="javascript:void(0);" @click="openModal('delete_all')">{{ lanMap['delete_all'] }}</a>
        </div>
        <div v-for="(item,index) in timeRange.data" :key="index" class="time-range-item"
            v-if="timeRange.data">
            <!-- <div></div> -->
            <ul>
                <li>{{ lanMap['name'] }}: {{ item.name }}</li>
                <li>{{ lanMap['state'] }}: {{ item.state }}</li>
                <li>
                    <a href="javascript:void(0);" @click="showTimeRangeDetail(item)">{{ lanMap['show_detail'] }}</a>
                    <a href="javascript:void(0);" @click="openModal('delete')">{{ lanMap['delete'] }}</a>
                </li>
            </ul>
            <div v-if="showTimeRange === item.name">
                <div v-for="(_item,_index) in item.absolute" :key="_index + _item.stime"
                    v-if="item.absolute" class="absolute-item">
                    <span v-if="_index === 0">{{ lanMap['absolute'] }}</span>
                    <span v-else></span>
                    <span class="start-time">{{ lanMap['stime'] }}</span>
                    <span>{{ _item.sday + ' ' + _item.stime }}</span>
                    <span class="end-time">{{ lanMap['etime'] }}</span>
                    <span>{{ _item.eday + ' ' + _item.etime }}</span>
                </div>
                <div v-for="(_item,_index) in item.relative" :key="_index + _item.sday"
                    v-if="item.relative" class="relative-item">
                    <span v-if="_index === 0">{{ lanMap['relative'] }}</span>
                    <span v-else></span>
                    <span class="start-time">{{ lanMap['stime'] }}</span>
                    <span>{{ _item.stime }}</span>
                    <span class="end-time">{{ lanMap['etime'] }}</span>
                    <span>{{ _item.etime }}</span>
                    <span class="end-time">{{ lanMap['day'] }}</span>
                    <span>{{ _item.day }}</span>
                </div>
            </div>
        </div>
        <div class="modal-dialog" v-if="!!modalFlag">
            <div class="cover"></div>
            <div :style="{ 'height': modalFlag === 'delete' ? '275px' : type === 2 ? '355px' : '315px' }">
                <div class="modal-timerange">
                    <h4 class="modal-header" v-if="modalFlag === 'add'">{{ lanMap['add'] }}</h4>
                    <h4 class="modal-header" v-if="modalFlag === 'delete'">{{ lanMap['delete'] }}</h4>
                    <div>
                        <span>{{ lanMap['name'] }}</span>
                        <input type="text" v-model="name" v-focus
                            :style="{ 'border-color': name !== '' && name.length > 16 ? 'red' : '' }">
                        <span class="timerange-tips">4 - 16 characters</span>
                    </div>
                    <div>
                        <span>{{ lanMap['type'] }}</span>
                        <select v-model.number="type">
                            <option value="1">{{ lanMap['relative'] }}</option>
                            <option value="2">{{ lanMap['absolute'] }}</option>
                        </select>
                    </div>
                    <div v-if="type === 2 && modalFlag ==='add'">
                        <span>{{ lanMap['sday'] }}</span>
                        <datePicker @changedate="updateSdate"></datePicker>
                    </div>
                    <div v-if="modalFlag ==='add'">
                        <span>{{ lanMap['stime'] }}</span>
                        <input type="text" v-model="stime"
                            :style="{ 'border-color': !regTime.test(stime) && stime !== '' ? 'red' : '' }">
                        <span class="timerange-tips">Range: 00:00 - 23:59</span>
                    </div>
                    <div v-if="type === 2 && modalFlag ==='add'">
                        <span>{{ lanMap['eday'] }}</span>
                        <datePicker @changedate="updateEdate"></datePicker>
                    </div>
                    <div v-if="modalFlag ==='add'">
                        <span>{{ lanMap['etime'] }}</span>
                        <input type="text" v-model="etime"
                            :style="{ 'border-color': !regTime.test(etime) && etime !== '' ? 'red' : '' }">
                        <span class="timerange-tips">Range: 00:00 - 23:59</span>
                    </div>
                    <div v-if="type === 1 && modalFlag ==='add'">
                        <span>{{ lanMap['day'] }}</span>
                        <select v-model="day">
                            <option :value="item" v-for="(item,index) in days" :key="index">{{ item }}</option>
                        </select>
                    </div>
                    <div v-if="modalFlag === 'delete'">
                        <span>{{ lanMap['period'] }}</span>
                        <input type="text" v-model="period"
                            :style="{ 'border-color': !regTime.test(period) && period !== '' ? 'red' : '' }">
                        <span class="timerange-tips">Ex. hh:mm</span>
                    </div>
                    <div v-if="modalFlag === 'delete'">
                        <span>{{ lanMap['day'] }}</span>
                        <input type="text" v-model="day" :disabled="type === 1"
                            :style="{ 'border-color': type === 2 && !regDate.test(day) && day !== '' ? 'red' : '' }">
                        <span class="timerange-tips">Ex. yyyy/mm/dd</span>
                    </div>
                    <div>
                        <a href="javascript:void(0);" @click="submitAdd"
                            v-if="modalFlag === 'add'">
                            {{ lanMap['apply'] }}
                        </a>
                        <a href="javascript:void(0);" v-if="modalFlag === 'delete'"
                            @click="submitDel">
                            {{ lanMap['apply'] }}
                        </a>
                        <a href="javascript:void(0);" @click="closeModal">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="closeModal"></div>
            </div>
        </div>
        <confirm v-if="isDelAll" @choose="deleteAll"></confirm>
        <customPagination v-if="isShowPagination" :pages-data="pagesData"
            @updatePage="changePage">
        </customPagination>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex"
import customPagination from '../pagination'
import datePicker from '../datePicker'
let limit = 20;
//  mon|tue|wed|thu|fri|sat|sun|daily|weekend|working-day
export default {
    name: 'timeRange',
    components: { datePicker, customPagination },
    data(){
        return {
            timeRange: {},
            showTimeRange: '',
            days: ['Mon.', 'Tue.', 'Wed.', 'Thur.', 'Fri.', 'Sat.', 'Sun.', 'daily', 'weekend', 'working-day'],
            type: 1,
            name: '',
            stime: '',
            sday: '',
            etime: '',
            eday: '',
            period: '',
            day: '',
            modalFlag: '',
            regTime: /^(([01]?\d)|2[0-4]):[0-5]?\d$/,
            regDate: /^\d{4}\/(0?\d|(1[0-2]))\/(([1-2]?\d)|3[01])$/,
            isDelAll: false,
            pagesData: {},
            isShowPagination: false,
            timeRangeShow: []
        }
    },
    computed: mapState(["change_url", 'lanMap']),
    created(){
        this.getData();
    },
    methods: {
        ...mapMutations({
            updateTimeRange: 'updateTimeRange'
        }),
        getData(){
            this.$http.get(this.change_url.get_timerange).then(res=>{
                if(res.data.code === 1){
                    this.timeRange = res.data;
                    this.updateTimeRange(res.data);
                    var count = res.data.data.length;
                    this.pagesData = {
                        count,
                        limit
                    }
                    if(count > limit){
                        this.isShowPagination = true;
                        this.timeRangeShow = res.data.data.slice(0, limit);
                    }
                }
            }).catch(err=>{
                // to do
            })
        },
        showTimeRangeDetail(data){
            if(this.showTimeRange === data.name){
                this.showTimeRange = '';
                return
            }
            this.showTimeRange = data.name;
        },
        updateSdate(date){
            this.sday = date;
        },
        updateEdate(date){
            this.eday = date;
        },
        submitAdd(){
            if(!this.name || this.name.length > 16){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['name']
                })
                return
            }
            if(!this.regTime.test(this.stime)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['stime']
                })
                return
            }
            if(!this.regTime.test(this.etime)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['etime']
                })
                return
            }
            var post_data,url;
            if(this.type === 1){
                post_data = {
                    "method": "create",
                    "param":{
                        "name": this.name,
                        "stime": this.stime,
                        "etime": this.etime,
                        "day": this.day
                    }
                }
                url = '/switch_acl?form=time_range&type=relative'
            }
            if(this.type === 2){
                post_data = {
                    "method": "create",
                    "param":{
                        "name": this.name,
                        "stime": this.stime,
                        "sday": this.sday,
                        "etime": this.etime,
                        "eday": this.eday
                    }
                }
                url = '/switch_acl?form=time_range&type=absolute'
            }
            this.$http.post(url, post_data).then(res =>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['setting_ok']
                    })
                    this.getData();
                }else{
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ')' + res.data.message
                    })
                }
            }).catch(err =>{

            })
            this.closeModal();
        },
        openModal(str){
            this.modalFlag = str;
            if(str === 'delete_all'){
                this.modalFlag = '';
                this.isDelAll = true;
            }
        },
        closeModal(){
            this.modalFlag = '';
            this.isDelAll = false;
        },
        deleteAll(bool){
            if(bool){
                this.deleteCallback('all', '', '');
            }
            this.closeModal();
        },
        deleteCallback(name, time, day){
            var post_param = {
                "method": "delete",
                "param":{
                    "name": name,
                    "time": time,
                    "day": day
                }
            }
            this.$http.post('/switch_acl?form=time_range', post_param).then(res =>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['delete_ok']
                    })
                    this.getData();
                }else{
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ')' + res.data.message
                    })
                }
            }).catch(err =>{

            })
        },
        submitDel(){
            if(!this.name || this.name.length > 16){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['name']
                })
                return
            }
            if(!this.regTime.test(this.period)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['period']
                })
                return
            }
            if(this.type === 2 && (!this.regDate.test(this.day))){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['day']
                })
                return
            }
            this.deleteCallback(this.name, this.period, this.day);
            this.closeModal();
        },
        changePage(index){
            var start = limit * (index - 1),end = limit * index;
            (end > this.timeRange.data.length) && (end = this.timeRange.data.length);
            this.timeRangeShow = this.timeRange.data.slice(limit * (index - 1), limit * index);
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
    margin: 10px 0 10px 20px;
}
div.time-range-item{
    >ul{
        padding: 0 0 0 10px;
        height: 30px;
        line-height: 30px;
        a{
            height: 26px;
            line-height: 26px;
        }
        &::after{
            content: '';
            display: table;
            clear: both;
        }
        >li{
            float: left;
            width: 20%;
            height: 30px;
            line-height: 30px;
            &:last-child{
                width: auto;
            }
        }
    }
    >div{
        margin: 6px 0 0 0;
        >div{
            background: #CAECDA;
            height: 30px;
            line-height: 30px;
            border-top: 1px solid #ddd;
            >span:first-child{
                width: 110px;
                padding: 0 0 0 10px;
            }
            >span{
                display: inline-block;
            }
            span.start-time,span.end-time{
                width: 80px;
                padding: 0 0 0 10px;
                &+span{
                    width: 200px;
                }
            }
        }
    }
    div.relative-item{
        &:last-child{
            border-bottom: 1px solid #ddd;
        }
    }
}
div.cover+div{
    height: 315px;
}
div.modal-timerange{
    >div{
        height: 30px;
        margin: 8px 0;
        >span{
            display: inline-block;
            width: 130px;
            text-align: center;
        }
        >a{
            margin: 10px 0 0 110px;
        }
    }
    select{
        width: 200px;
    }
    .timerange-tips{
        font-size: 14px;
        width: auto;
        color: #333;
        margin-left: 8px;
    }
}
</style>