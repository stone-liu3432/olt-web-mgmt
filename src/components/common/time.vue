<template>
    <div class="time-cfg">
        <h2>时间设置</h2>
        <div>
            <div v-if="timer.data">
                <span>当前时间</span>
                <span>{{ new Date(timer.data.time_sec).toLocaleString().replace(/\//g,'-') }}</span>
            </div>
            <div>
                <span>设置时间:</span>
                <span>手动设置当前时间</span>
            </div>
                <span>日期:</span>
                <span>
                    <select v-model="set_time.year">
                        <option :value="item" v-for="(item,key) in years" :key="key">{{ item }}</option>
                    </select>
                    <span>年</span>
                    <select v-model="set_time.mouth">
                        <option :value="item" v-for="(item,key) in mouths" :key="key">{{ item }}</option>
                    </select>
                    <span>月</span>
                    <select v-model="set_time.day">
                        <option :value="item" v-for="(item,key) in days" :key="key">{{ item }}</option>
                    </select>
                    <span>日</span>
                </span>
            </div>
            <div>
                <span>时间:</span>
                <span>
                    <select v-model="set_time.hour">
                        <option :value="item" v-for="(item,key) in hours" :key="key">{{ item < 10 ? '0' + item : item }}</option>
                    </select>
                    <span>时</span>
                    <select v-model="set_time.min">
                        <option :value="item" v-for="(item,key) in mins" :key="key">{{ item < 10 ? '0' + item : item }}</option>
                    </select>
                    <span>分</span>
                    <select v-model="set_time.sec">
                        <option :value="item" v-for="(item,key) in secs" :key="key">{{ item < 10 ? '0' + item : item }}</option>
                    </select>
                    <span>秒</span>
                </span>
            </div>
            <div>
                <a href="javascript:;">从服务更新时间</a>
                <span>请注意，页面时间可能与服务器时间存在差异，可以点击按钮将本地时间与服务器时间同步</span>
            </div>
            <div>
                <a href="javascript:;">保存</a>
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
                mouths: [1,2,3,4,5,6,7,8,9,10,11,12],
                days: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
                hours: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
                mins: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59],
                secs: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59],
                set_time: {
                    year: 0,
                    mouth: 0,
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
                        var date = new Date(this.timer.data.time_sec);
                        this.set_time.year = date.getFullYear();
                        this.set_time.mouth = date.getMonth() + 1;
                        this.set_time.day = date.getDate();
                        this.set_time.hour = date.getHours();
                        this.set_time.min = date.getMinutes();
                        this.set_time.sec = date.getSeconds();
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
                    }
                }).catch(err=>{
                    // to do
                })
            },
            //  计算平年，闰年，设置二月天数
            february(){
                if(this.set_time.year % 4 == 0 && (this.set_time.year % 100) != 0 || this.set_time.year % 400 == 0){
                    if(this.set_time.mouth == 2){
                        this.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29];
                        return 
                    }
                }else{
                    if(this.set_time.mouth == 2){
                        this.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
                        return
                    }
                }
                if(this.set_time.mouth == 4 || this.set_time.mouth == 6 || this.set_time.mouth == 9 || this.set_time.mouth == 11){
                    this.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
                }else{
                    this.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
                }
            }
        },
        watch: {
            'set_time.mouth'(){
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

</style>