<template>
    <div class="time-cfg">
        <h2>{{ lanMap['time_set'] + lanMap['config'] }}</h2>
        <div>
            <div v-if="timer.data" class="time-item">
                <span>{{ lanMap['current_time'] }}</span>
                <span>{{ new Date(timer.data.time_sec*1000).toLocaleString({hour12:false}).replace(/\//g,'-') }}</span>
            </div>
            <div class="time-item">
                <span>{{ lanMap['config'] + lanMap['time_set'] }}</span>
                <!-- 选择设置时间方式，暂未实现 -->
                <span>{{ lanMap['manual_s'] + lanMap['config'] + lanMap['time_set'] }}</span>
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
            <div>
                <a href="javascript:;" @click="handle_update_time">{{ lanMap['time_get_serv'] }}</a>
                <span>{{ lanMap['notice_time_sync'] }}</span>
            </div>
            <div class="btn-item">
                <a href="javascript:;" @click="handle_set_time">{{ lanMap['apply'] }}</a>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex"
    export default {
        name : 'time',
        data(){
            return {
                timer: {},
                interval: null,
                years: [2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026,2027,2028,2029,2030,2031,2032,2033,2034,2035],
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
                }
            }
        },
        created(){
            this.get_time();
        },
        methods: {
            //  获取服务器时间 
            get_time(){
                this.$http.get(this.change_url.time).then(res=>{
                    if(res.data.code === 1){
                        this.timer = res.data;
                        var date = new Date(this.timer.data.time_sec*1000);
                        this.set_time.year = date.getFullYear();
                        this.set_time.month = date.getMonth() + 1;
                        this.set_time.day = date.getDate();
                        this.set_time.hour = date.getHours();
                        this.set_time.min = date.getMinutes();
                        this.set_time.sec = date.getSeconds();
                        this.auto_update_time();
                    }
                }).catch(err=>{
                    // to do
                })
            },
            //  设置定时器，自动更新页面时间
            auto_update_time(){
                if(this.timer.data){
                    this.interval = setInterval(()=>{
                        if(this.timer.data.secs < 60){
                            this.timer.data.secs += 1;
                            if(this.timer.data.secs > 59){
                                this.timer.data.secs = 0;
                                this.timer.data.mins += 1;
                                if(this.timer.data.mins > 59){
                                    this.timer.data.secs = 0;
                                    this.timer.data.mins = 0;
                                    this.timer.data.hours += 1;
                                    if(this.timer.data.nours > 23){
                                        this.timer.data.secs = 0;
                                        this.timer.data.mins = 0;
                                        this.timer.data.hours = 0;
                                        this.timer.data.days += 1;
                                    }
                                }
                            }
                        }
                        this.timer.data.time_sec += 1000;
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
                this.$http.get('/time?form=info').then(res=>{
                    if(res.data.code ===1){
                        this.timer = res.data;
                        this.$message({
                            type: 'success',
                            text: this.lanMap['update_time'] + this.lanMap['st_success']
                        })
                    }else{
                        this.$message({
                            type: 'error',
                            text: this.lanMap['update_time'] + this.lanMap['st_fail']
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
                        "year": this.set_time.year,
                        "mon": this.set_time.month,
                        "day": this.set_time.day,
                        "hour": this.set_time.hour,
                        "min": this.set_time.min,
                        "sec": this.set_time.sec
                    }
                }
                this.$http.post('/time?form=info',post_params).then(res=>{
                    if(res.data.code === 1){
                        this.handle_update_time();
                    }else{
                        this.$message({
                            type: 'error',
                            text: this.lanMap['time_set_local'] + this.lanMap['st_fail']
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
        color: #3390e6;
        margin: 20px 0 0 20px;
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
    >span:first-child{
        display: inline-block;
        width: 150px;
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
    border: 1px solid #49A3FF;
    background: #49A3FF;
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
</style>