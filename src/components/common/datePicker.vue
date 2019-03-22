<template>
    <div class="date-picker" ref="datepicker">
        <div @click="showSelect">
            <i class="icon-date"></i>
            <span>{{ dateString }}</span>
        </div>
        <div class="date-picker-detail" v-if="!!isShow"
            :style="{ 'height': isShow === 'year' ? '200px' : '' }">
            <div class="datepicker-weekday">
                <span @click="prevMonth"><</span>
                <span @click="selectMonthOrYear" v-if="isShow === 'day'">{{ year + '/' + month + '/' + day }}</span>
                <span @click="selectMonthOrYear" v-if="isShow === 'month'">{{ year + '/' + month }}</span>
                <span @click="selectMonthOrYear" v-if="isShow === 'year'">{{ year }}</span>
                <span @click="nextMonth">></span>
            </div>
            <div class="date-detail" v-if="isShow === 'day'">
                <div v-if="language">
                    <span v-for="(item,index) in week" :key="index">
                        {{ lang[language]['weekday'][item] }}
                    </span>
                </div>
                <div>
                    <span v-for="(item,index) in showDateData" :key="index"
                        :class="[{ 'active': item.date === day && item.month === month },{ 'not-current-month': item.month !== month }]"
                        @click="changeDate(item)">
                        {{ item.date }}
                    </span>
                </div>
            </div>
            <div class="month-detail" v-if="isShow === 'month'">
                <span v-for="(item,index) in showMonthData" :key="index"
                    :class="{ 'active': index + 1 === month }"
                    @click="gotoSelectDate(index)">
                    {{ item }}
                </span>
            </div>
            <div class="year-detail" v-if="isShow === 'year'" ref="yearpicker"
                @mousewheel="addYear" @DOMMouseScroll="addYear">
                <span v-for="(item,index) in showYearDate" :key="index"
                    :class="{ 'active': item === year }" :style="{ 'width': '32%'}"
                    @click="selectYear(item)">
                    {{ item }}
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex"
export default {
    name: 'date-picker',
    props: ['dateDate'],
    computed: {
        ...mapState(['language']),
        showMonthData(){
            return this.lang[this.language]['month'];
        },
        dateString(){
            return `${this.year}/${this.month}/${this.day}`
        }
    },
    data(){
        return {
            datetime: '',
            week: [ 1, 2, 3, 4, 5, 6, 0],
            showDateData: [],
            showYearDate: [],
            year: '',
            month: '',
            day: '',
            weekday: '',
            lang: {
                zh: {
                    month: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                    weekday: ['日', '一', '二', '三', '四', '五', '六']
                },
                en: {
                    month: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
                    weekday: ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thur.', 'Fri.', 'Sat.']
                }
            },
            isShow: '',
            flag: false
        }
    },
    created(){
        this.init();
        this.initYear();
        if(this.dataDate){
            this.init(this.dataDate.year, this.dataDate.month, this.dataDate.day);
        }
    },
    methods: {
        init(y, m, d){
            var now = new Date();
            if(y && (m || m === 0) && d){
                now = new Date(y, m - 1, d);
            }
            if(y && !m && !d){
                now = new Date(y);
            }
            var year = now.getFullYear(), month = now.getMonth() + 1;
            this.year = year;
            //  当月第一天
            var firstDay = new Date(year, month - 1, 1);
            //  当月最后一天
            var lastDay = new Date(year, month, 0);
            //  当月第一天对应周日期
            var firstDayWeek = firstDay.getDay() || 7;
            //  当月最后一天对应周日期
            var lastDayWeek = new Date(year, month, 0).getDay() || 7;
            //  当月最后一天日期
            var lastDate = lastDay.getDate();
            //  前一个月最后一天
            var prevMonthLastDay = new Date(year, month - 1, 0).getDate();
            var days = [];

            var prevMonth = month - 1,nextMonth = month + 1;
            if(prevMonth < 1){
                prevMonth = 12;
                year = year - 1;
            }
            for(var i = 1; i < firstDayWeek; i++){
                days.unshift({
                    year: year,
                    month: prevMonth, 
                    date: prevMonthLastDay--
                });
            }
            for(var i = 1; i <= lastDate; i++){
                days.push({
                    year: this.year,
                    month: month, 
                    date: i
                });
            }
            if(month > 12){
                nextMonth = 1;
                year = year + 1;
            }
            for(var i = 1; i < 14; i++){
                days.push({
                    year: this.year,
                    month: nextMonth, 
                    date: i
                });
                if(days.length >= 42){
                    break;
                }
            }
            this.showDateData = days;
            this.month = month;
            this.day = now.getDate();
            
            this.$emit('changedate', `${this.year}/${this.month}/${this.day}`);
        },
        prevMonth(){
            if(this.isShow === 'year'){
                if(this.showYearDate[0] === this.year){
                    for(var i = 1; i < 4; i++){
                        this.showYearDate.unshift(this.year - i);
                    }
                }
                this.year--;
                return
            }
            if(this.month > 1){
                this.month -= 1;
            }else{
                this.month = 12;
                this.year -= 1;
            }
            this.init(this.year, this.month, this.day);
        },
        nextMonth(){
            if(this.isShow === 'year'){
                if(this.showYearDate[this.showYearDate.length - 1] === this.year){
                    for(var i = 1; i < 4; i++){
                        this.showYearDate.push(this.year + i);
                    }
                    this.$nextTick(() =>{
                        this.$refs.yearpicker.scrollTop += parseInt(this.$refs.yearpicker.firstElementChild.offsetHeight);
                    })
                }
                this.year++;
                return
            }
            if(this.month < 12){
                this.month += 1;
            }else{
                this.year += 1;
                this.month = 1;
            }
            this.init(this.year, this.month, this.day);
        },
        changeDate(date){
            // if(this.year === date.year && date.month === this.month && this.day === date.date){
            //     return;
            // }
            this.init(date.year, date.month, date.date);
            this.isShow = '';
        },
        selectMonthOrYear(){
            if(this.isShow === 'year'){
                return;
            }else if(this.isShow === 'month'){
                this.isShow = 'year';
            }else if(this.isShow === 'day'){
                this.isShow = 'month';
            }
        },
        gotoSelectDate(index){
            this.month = index + 1;
            this.isShow = 'day';
            this.init(this.year, this.month, this.day);
        },
        selectYear(year){
            this.year = year;
            this.isShow = 'month';
            this.initYear();
            this.init(this.year, this.month, this.day);
        },
        showSelect(e){
            if(!this.isShow){
                this.isShow = 'day';
            }
            if(!this.$refs.datepicker.contains(e.target)){
                this.isShow = '';
            }
        },
        clickHandler(e){
            if(!this.$refs.datepicker.contains(e.target)){
                this.isShow = '';
                this.initYear();
            }
        },
        initYear(){
            this.showYearDate = [];
            for(var i = 1; i < 8; i++){
                this.showYearDate.unshift(this.year - i)
            }
            for(var i = 0; i < 8; i++){
                this.showYearDate.push(this.year + i);
            }
        },
        addYear(e){
            //  IE兼容
            var evt = e || window.event;
            //  firefox兼容
            var delta = evt.wheelDelta || -e.detail;
            if(!this.flag){
                this.flag = true;
                if(delta > 0){
                    var year = this.showYearDate[0];
                    for(var i = 1; i < 4; i++){
                        this.showYearDate.unshift(year - i);
                    }
                    this.$nextTick(() =>{
                        this.$refs.yearpicker.scrollTop -= parseInt(this.$refs.yearpicker.firstElementChild.offsetHeight);
                    })
                }else{
                    var year = this.showYearDate[this.showYearDate.length - 1];
                    for(var i = 1; i < 4; i++){
                        this.showYearDate.push(year + i);
                    }
                    this.$nextTick(() =>{
                        this.$refs.yearpicker.scrollTop += parseInt(this.$refs.yearpicker.firstElementChild.offsetHeight);
                    })
                }
                var timeout = setTimeout(()=>{
                    this.flag = false;
                },100);
            }
        }
    },
    mounted(){
        document.body.addEventListener('click',this.clickHandler,false);
    },
    beforeDestroy(){
        document.body.removeEventListener('click', this.clickHandler);
    },
    watch: {
        // 'isShow'(){
        //     if(this.isShow === 'year'){
        //         this.$nextTick(()=>{
        //             var node = this.$refs.yearpicker;
        //             node.addEventListener('mousewheel', this.addYear, false);
        //         })
        //     }
        // }
    }
}
</script>

<style lang="less" scoped>
.date-picker{
    display: inline-block;
    user-select: none;
    position: relative;
    width: 140px;
    >div:first-child{
        width: 130px;
        height: 30px;
        line-height: 30px;
        background: #FFF;
        border: 1px solid #ddd;
        border-radius: 3px;
        cursor: pointer;
    }
    div.date-picker-detail{
        background: #fff;
        width: 300px;
        border: 1px solid #ddd;
        position: absolute;
        top: 30px;
        left: 0;
        overflow: hidden;
        z-index: 9;
        .active{
            color: #fff;
            background: #007ACC;
        }
        >div.date-detail{
            div{
                &:first-child,&:last-child{
                    >span{
                        cursor: pointer;
                    }
                }
                >span{
                    display: inline-block;
                    width: 14.28%;
                    height: 30px;
                    line-height: 30px;
                    text-align: center;
                    border: 1px solid #ddd;
                    box-sizing: border-box;
                    border-right: none;
                    border-bottom: none;
                }
                .not-current-month{
                    background: #eee;
                    color: #333;
                }
            }
        }
        >div.month-detail,>div.year-detail{
            padding: 10px 0 10px 0;
            span{
                display: inline-block;
                width: 32.66%;
                height: 30px;
                line-height: 30px;
                text-align: center;
                cursor: pointer;
                border: 1px solid transparent;
                &:hover{
                    border-color: #8F928C;
                }
            }
        }
        >div.year-detail{
            overflow-y: scroll;
            height: 160px;
        }
    }
    div.datepicker-weekday{
        >span{
            display: inline-block;
            text-align: center;
            height: 30px;
            line-height: 30px;
            width: 67%;
            border: none;
            cursor: pointer;
            &:first-child,&:last-child{
                width: 15%;
            }
        }
    }
}
i.icon-date{
    display: inline-block;
    width: 32px;
    height: 32px;
    vertical-align: middle;
    background: url('../../assets/date.png') 3px 2px no-repeat;
}
</style>
