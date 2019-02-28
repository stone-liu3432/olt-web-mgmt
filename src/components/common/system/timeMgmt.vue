<template>
    <div class="time-cfg">
        <h2>{{ lanMap['time_set'] + lanMap['config'] }}</h2>
        <div>
            <div v-if="timer.data" class="time-item">
                <span>{{ lanMap['current_time'] }}</span>
                <span>
                    {{ 
                        now_time.year + '-' + now_time.month + '-' + now_time.day + '  ' +
                        now_time.hour + ':' + (now_time.min < 10 ? '0' + now_time.min : now_time.min ) + ':' + 
                        (now_time.sec < 10 ? '0' + now_time.sec : now_time.sec)
                    }}
                </span>
            </div>
            <div class="time-item">
                <span class="time-set">{{ lanMap['config'] + lanMap['time_set'] }}</span>
                <div class="time-set">
                    <label for="time_set_ntp">
                        <input type="radio" name="time_set_type" id="time_set_ntp" value="0" v-model.number="set_time_type">
                        <i class="icon"></i>
                        <span class="text">{{ lanMap['ntp_gettime'] }}</span>
                    </label>
                </div>
                <div class="time-set">
                    <label for="time_set_manual">
                        <input type="radio" name="time_set_type" id="time_set_manual" value="1" v-model.number="set_time_type">
                        <i class="icon"></i>
                        <span class="text">{{ lanMap['manual_s'] + lanMap['config'] + lanMap['time_set'] }}</span>
                    </label>
                </div>
            </div>
            <div v-if="set_time_type">
                <div class="time-item">
                    <span>{{ lanMap['select_timezone'] }}</span>
                    <span>
                        <select style="width: 350px" v-model="timezone">
                            <option v-for="(item,index) in timezones" :key="index" :value="index">{{ item.tag }}</option>
                        </select>
                    </span>
                </div>
                <div class="time-item">
                    <span>{{ lanMap['time_days'] }}</span>
                    <span>
                        <select v-model.number="set_time.year">
                            <option :value="item" v-for="(item,key) in years" :key="key">{{ item }}</option>
                        </select>
                        <span>{{ lanMap['time_year'] }}</span>
                        <select v-model.number="set_time.month">
                            <option :value="item" v-for="(item,key) in months" :key="key">{{ item }}</option>
                        </select>
                        <span>{{ lanMap['time_month'] }}</span>
                        <select v-model.number="set_time.day">
                            <option :value="item" v-for="(item,key) in days" :key="key">{{ item }}</option>
                        </select>
                        <span>{{ lanMap['time_day'] }}</span>
                    </span>
                </div>
                <div class="time-item">
                    <span>{{ lanMap['time_set'] }}</span>
                    <span>
                        <select v-model.number="set_time.hour">
                            <option :value="item" v-for="(item,key) in hours" :key="key">{{ item < 10 ? '0' + item : item }}</option>
                        </select>
                        <span>{{ lanMap['time_hour'] }}</span>
                        <select v-model.number="set_time.min">
                            <option :value="item" v-for="(item,key) in mins" :key="key">{{ item < 10 ? '0' + item : item }}</option>
                        </select>
                        <span>{{ lanMap['time_min'] }}</span>
                        <select v-model.number="set_time.sec">
                            <option :value="item" v-for="(item,key) in secs" :key="key">{{ item < 10 ? '0' + item : item }}</option>
                        </select>
                        <span>{{ lanMap['time_sec'] }}</span>
                    </span>
                </div>
            </div>
            <div v-if="!set_time_type">
                <div class="time-item">
                    <span>{{ lanMap['ntp_ipaddr1'] }}</span>
                    <span>
                        <input type="text" v-model="preferred_ipaddr" placeholder="ex: 127.0.0.1" 
                         :style="{ 'border-color' : preferred_ipaddr !== '' && !reg_ip.test(preferred_ipaddr) ? 'red' : '' }">
                    </span>
                </div>
                <div class="time-item">
                    <span>{{ lanMap['ntp_ipaddr2'] }}</span>
                    <span>
                        <input type="text" v-model="alternate_ipaddr" placeholder="ex: 127.0.0.1">
                    </span>
                </div>
                <div class="time-item">
                    <span>{{ lanMap['update_frequency'] }}</span>
                    <span>
                        <input type="text" v-model.number="poll_interval_time" placeholder="ex: 7" 
                          :style="{ 'border-color': this.poll_interval_time >= (Math.pow(2,31)/60/60/24) ? 'red' : '' }">
                        <span>{{ lanMap['days'] }}</span>
                    </span>
                </div>
            </div>
            <div>
                <a href="javascript:;" @click="get_time_byser">{{ lanMap['time_get_serv'] }}</a>
                <span>{{ lanMap['notice_time_sync'] }}</span>
            </div>
            <div class="btn-item">
                <a href="javascript:void(0);" @click="handle_set_time" v-if="set_time_type">{{ lanMap['apply'] }}</a>
                <a href="javascript:void(0);" @click="set_ntp_submit" v-if="!set_time_type">{{ lanMap['apply'] }}</a>
            </div>
        </div>
        <confirm :tool-tips="lanMap['if_sure'] + '?'" v-if="confirm_ntp" @choose="ntp_result"></confirm>
    </div>
</template>

<script>
import { mapState } from "vuex"
import timezone from '@/config/timezone'
    export default {
        name : 'timeMgmt',
        data(){
            return {
                timer: {},
                interval: null,
                years: [1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026,2027,2028,2029,2030,2031,2032,2033,2034,2035],
                months: [1,2,3,4,5,6,7,8,9,10,11,12],
                days: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
                hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
                mins: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59],
                secs: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59],
                set_time: {
                    year: 0,
                    month: 0,
                    day: 0,
                    hour: 0,
                    min: 0,
                    sec: 0
                },
                timezones: [],
                timezone: null,
                now_time: {
                    year: 0,
                    month: 0,
                    day: 0,
                    hour: 0,
                    min: 0,
                    sec: 0
                },
                //  设置时间方式   -->  0->自动，1->手动
                set_time_type: 1,
                preferred_ipaddr: '',
                alternate_ipaddr: '',
                confirm_ntp: false,
                reg_ip: /^(([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){1}((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4]){1}$/,
                poll_interval_time : ''
            }
        },
        created(){
            this.get_time();
            this.timezones = timezone;
        },
        methods: {
            get_time(){
                this.$http.get(this.change_url.time).then(res=>{
                    if(res.data.code === 1){
                        this.timer = res.data;
                        var arr = this.timer.data.time_now;
                        this.set_time.year = this.now_time.year = arr[0];
                        this.set_time.month = this.now_time.month = arr[1];
                        this.set_time.day =  this.now_time.day = arr[2];
                        this.set_time.hour = this.now_time.hour = arr[3];
                        this.set_time.min = this.now_time.min = arr[4];
                        this.set_time.sec = this.now_time.sec = arr[5];
                        this.timezone = this.timer.data.timezone;
                        this.auto_update_time();
                    }
                }).catch(err=>{
                    // to do
                })
            },
            get_ntp(){
                this.$http.get('/time?form=ntp').then(res=>{
                    if(res.data.code === 1){
                        if(res.data.data.status){
                            this.set_time_type = 0;
                            var ipaddr_list = res.data.data.ntp_srv_ip;
                            this.preferred_ipaddr = ipaddr_list[0] || '';
                            this.alternate_ipaddr = ipaddr_list[1] || '';
                            this.poll_interval_time = res.data.data.poll_interval_time/(60*60*24);
                        }else{
                            this.set_time_type = 1;
                        }
                    }else{
                        this.set_time_type = 1;
                    }
                }).catch(err=>{
                    // to do
                })
            },
            set_ntp_submit(){
                this.confirm_ntp = true;
            },
            //  ntp设置
            ntp_result(bool){
                if(bool){
                    if(!this.reg_ip.test(this.preferred_ipaddr)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error'] + ': ' + this.lanMap['ntp_ipaddr1']
                        })
                        return
                    }
                    if(isNaN(this.poll_interval_time) || this.poll_interval_time >= (Math.pow(2,31)/60/60/24)){
                        this.$message({
                            type: 'error',
                            text: this.lanMap['param_error'] + ': ' + this.lanMap['update_frequency']
                        })
                        return
                    }
                    if(this.poll_interval_time <= 0) this.poll_interval_time = 1; 
                    var post_params = {
                        "method":"set",
                        "param":{
                            "status": this.set_time_type,
                            "ntp_srv_ip": [this.preferred_ipaddr,this.alternate_ipaddr],
                            "poll_interval_time": this.poll_interval_time*60*60*24
                        }
                    }
                    this.$http.post('/time?form=ntp',post_params).then(res=>{
                        if(res.data.code === 1){
                            this.$message({
                                type: res.data.type,
                                text: this.lanMap['setting_ok']
                            })
                            this.get_ntp();
                        }else if(res.data.code > 1){
                            this.$message({
                                type: res.data.type,
                                text: '(' + res.data.code + ') ' + res.data.message
                            })
                        }
                    }).catch(err=>{
                        //  to do
                    })
                }
                this.confirm_ntp = false;
            },
            //  设置定时器，自动更新页面时间
            auto_update_time(){
                if(this.timer.data){
                    this.interval = setInterval(()=>{
                        if(this.now_time.sec < 59){
                            this.now_time.sec += 1;
                        }else{
                            this.now_time.sec = 0;
                            this.now_time.min += 1;
                            if(this.now_time.min > 59){
                                this.now_time.sec = 0;
                                this.now_time.min = 0;
                                this.now_time.hour += 1;
                                if(this.now_time.hour > 23){
                                    this.now_time.sec = 0;
                                    this.now_time.min = 0;
                                    this.now_time.hour = 0;
                                    this.now_time.day += 1;
                                }
                            }
                        }
                    },1000)
                }
            },
            //  计算平年，闰年，设置二月天数
            february(){
                if(this.set_time.year % 4 == 0 && (this.set_time.year % 100) != 0 || this.set_time.year % 400 == 0){
                    if(this.set_time.month == 2){
                        this.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29];
                        return 
                    }
                }else{
                    if(this.set_time.month == 2){
                        this.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
                        return
                    }
                }
                if(this.set_time.month == 4 || this.set_time.month == 6 || this.set_time.month == 9 || this.set_time.month == 11){
                    this.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
                }else{
                    this.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
                }
            },
            //  点击按钮手动更新页面时间
            handle_update_time(){
                var post_params = {
                    "method":"set",
                    "param":{
                        "status": this.set_time_type,
                        "ntp_srv_ip": [this.preferred_ipaddr,this.alternate_ipaddr],
                        "poll_interval_time": this.poll_interval_time
                    }
                }
                this.$http.post('/time?form=ntp',post_params).then(res=>{
                    if(res.data.code === 1){
                        this.get_time();
                    }else if(res.data.code > 1){
                        this.$message({
                            type: res.data.type,
                            text: '(' + res.data.code + ') ' + res.data.message
                        })
                    }
                }).catch(err=>{
                    // to do
                })
            },
            //  从服务器更新本地时间
            get_time_byser(){
                this.$http.get('/time?form=info').then(res=>{
                    if(res.data.code === 1){
                        this.timer = res.data;
                        var arr = this.timer.data.time_now;
                        this.set_time.year = this.now_time.year = arr[0];
                        this.set_time.month = this.now_time.month = arr[1];
                        this.set_time.day =  this.now_time.day = arr[2];
                        this.set_time.hour = this.now_time.hour = arr[3];
                        this.set_time.min = this.now_time.min = arr[4];
                        this.set_time.sec = this.now_time.sec = arr[5];
                        this.timezone = this.timer.data.timezone;
                        this.$message({
                            type: res.data.type,
                            text: this.lanMap['update_time'] + this.lanMap['st_success']
                        })
                    }else if(res.data.code > 1){
                        this.$message({
                            type: res.data.type,
                            text: '(' + res.data.code + ') ' + res.data.message
                        })
                    }
                }).catch(err=>{
                    // to do
                })
            },
            //  手动设置时间
            handle_set_time(){
                var post_params = {
                    "method":"set",
                    "param":{
                        "time": [this.set_time.year,this.set_time.month,this.set_time.day,this.set_time.hour,this.set_time.min,this.set_time.sec],
                        "time_zone": this.timezone
                    }
                }
                this.$http.post('/time?form=info',post_params).then(res=>{
                    if(res.data.code === 1){
                        this.handle_update_time();
                    }else if(res.data.code > 1){
                        this.$message({
                            type: res.data.type,
                            text: '(' + res.data.code + ') ' + res.data.message
                        })
                    }
                }).catch(err=>{
                    // to do
                })
            }
        },
        watch: {
            'set_time.month'(){
                this.february();
            },
            'set_time.year'(){
                this.february();
            }
        },
        beforeDestroy(){
            clearInterval(this.interval);
        },
        computed: mapState(['lanMap','change_url'])
    }
</script>

<style scoped lang="less">
div.time-cfg{
    >h2{
        font-size: 24px;
        color: #67AEF7;
        margin: 20px 0 0 20px;
        font-weight: bold;
    }
    >div{
        margin: 30px 0 0 30px;
        >div{
            margin-top: 30px;
        }
    }
}
div.time-item{
    font-size: 16px;
    margin-top: 24px;
    height: 30px;
    line-height: 30px;
    &:after{
        content: "";
        display: table;
        clear: both;
    }
    >span:first-child{
        display: inline-block;
        width: 180px;
    }
    >span{
        select{
            width: 80px;
            height: 30px;
            font-size: 16px;
            text-indent: 5px;
        }
    }
}
a{
    display: inline-block;
    width: 150px;
    height: 30px;
    // border: 1px solid #49A3FF;
    // background: #49A3FF;
    border-radius: 5px;
    text-align: center;
    line-height: 30px;
    color: #fff;
    &:active{
        border-color: #ccc;
    }
}

a+span{
    margin-left: 20px;
    font-size: 14px;
    color: #333;
}
div.btn-item>a{
    width: 100px;
}
div.time-set,span.time-set{
    float: left;
    &:nth-child(3){
        margin-left: 20px;
    }
    label{
        cursor: pointer;
    }
    i.icon{
        display: inline-block;
        width: 32px;
        height: 32px;
        vertical-align: middle;
        background: url('../../../assets/radio_button.png') no-repeat 3px 3px;
    }
    input:checked+i.icon{
        background: url('../../../assets/radio_button_selected.png') no-repeat 3px 3px;
    }
    input[type='radio']{
        display: none;
    }
}
</style>