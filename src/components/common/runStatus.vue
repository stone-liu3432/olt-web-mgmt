<template>
    <div class="running-status">
        <div class="container"  v-if="ponInfo.data">
            <h2>PON口信息</h2>
            <div class="pon-detail" v-for="(item,index) in this.ponInfo.data" :key="index">
                <p>{{ item.port_name }}</p>
                <div :class="[ item.status >= 1 ? 'bg-online' : 'bg-offline' ]">
                    <img src="../../assets/pon_online.png" v-if="item.status >=1">
                    <img src="../../assets/pon_offline.png" v-if="item.status <1">
                </div>
                <p :style="{'color' : item.status >=1 ? '#29BDFA' : '#8D8F92'}">{{ lanMap['link_status'] + ' : ' }}{{ item.status >= 1 ? lanMap['online'] : lanMap['offline'] }}</p>
                <p>已注册设备数:{{ item.online + item.offline }}</p>
                <p>{{ lanMap['online'] }}：{{ item.online }}</p>
                <p>{{ lanMap['offline'] }}：{{ item.offline }}</p>
            </div>
        </div>
        <div class="container"  v-if="this.geInfo[0]">
            <h2>GE信息</h2>
            <div class="pon-detail" v-for="(item,index) in this.geInfo" :key="index">
                <p>{{ "GE0"+(index+1) }}</p>
                <div :class="[ item.admin_status >= 1 ? item.link_status >= 1 ? 'bg-online' : 'bg-offline' :'bg-disabled' ]">
                    <img src="../../assets/uplink-fiber-blue.png" v-if="item.media == 'fiber' &&item.admin_status >=1 && item.link_status >=1 ">
                    <img src="../../assets/uplink-fiber-black.png" v-if="item.media == 'fiber' && item.admin_status >=1 && item.link_status < 1">
                    <img src="../../assets/uplink-fiber-black-disable.png" v-if="item.media == 'fiber' && item.admin_status < 1">
                    <img src="../../assets/uplink-rj45-blue.png" v-if="item.media == 'copper' &&item.admin_status >=1 && item.link_status >=1 ">
                    <img src="../../assets/uplink-rj45-black.png" v-if="item.media == 'copper' && item.admin_status >=1 && item.link_status < 1">
                    <img src="../../assets/uplink-rj45-disable.png" v-if="item.media == 'copper' && item.admin_status < 1">
                </div>
                <p :style="{'color' : item.admin_status >=1 ? item.link_status >=1 ? '#29BDFA' : '#aaa' : 'red'}">
                    {{ lanMap['admin_status'] }}：{{ item.admin_status >= 1 ? item.link_status >= 1 ? lanMap['online'] : lanMap['offline'] : lanMap['forbidden'] }}
                </p>
                <p :style="{'color' : item.admin_status >=1 ? item.link_status >=1 ? '#29BDFA' : '#aaa' : 'red'}">
                    {{ lanMap['link_status']}}：{{ item.link_status >=1 ? lanMap['link_up'] : lanMap['link_down'] }}
                </p>
            </div>
        </div>
        <div class="systemInfo" v-if="this.system.data">
            <h2>系统信息</h2>
            <div v-for="(item,key) of this.system.data" :key="key" class="systemInfo-detail"  v-if="key !== 'bl_ver'">
                <!-- 根据key值，取出映射的lanMap字符 -->
                <span>{{ lanMap[key] }}</span>
                <span>{{ item }}</span>
            </div>
        </div>
        <div class="cpuInfo" v-if="this.cpuInfo.data">
            <h2>硬件状态</h2>
            <div>
                <p>CPU</p>
                <canvas width="200" height="200" id="cpu-detail"></canvas>
            </div>
            <div>
                <P>内存</P>
                <canvas width="200" height="200" id="memory-detail"></canvas>
            </div>
            <div class="container" v-if="this.timer.data">
                <h2>系统运行时间</h2>
                <div class="time-info">
                    <span>{{ lanMap['current_time'] + ' :' }}</span>
                    <span>{{ new Date(this.timer.data.time_sec).toLocaleString().replace(/\//g,'-') }}</span>
                </div>
                <div class="time-info">
                    <span>{{ lanMap['run_time']+' :' }}</span>
                    <span>
                        {{ this.timer.data.days + " " + lanMap['days'] }}
                        {{ this.timer.data.hours + " " + lanMap['hours'] }}
                        {{ this.timer.data.mins < 10 ? '0' + this.timer.data.mins + " " + lanMap['mins'] : this.timer.data.mins + " " + lanMap['mins'] }}
                        {{ this.timer.data.secs < 10 ? '0' + this.timer.data.secs + " " + lanMap['secs'] : this.timer.data.secs + " " + lanMap['secs'] }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState,mapMutations } from 'vuex'
    export default {
        name: 'runStatus',
        data(){
            return {
                cpuInfo: {},
                ponInfo: {},
                geInfo: {},
                timer: {}
            }
        },
        created(){
            // 组件创建之前，初始化vuex部分数据
            this.$http.get(this.change_url.system).then(res=>{
                this.systemInfo(res.data);
                    this.$http.get(this.change_url.port).then(res=>{
                        this.portInfo(res.data);
                         // 获取pon口数量，从端口中去除pon口，将剩下的端口（ge口）展示到页面上
                        var ge_port = this.port_info.data.slice(this.system.data.ponports,this.port_info.data.length);
                        this.geInfo = ge_port;
                        var index;
                        for(var i=0,len=this.port_info.data.length;i<len;i++){
                            if(this.port_info.data[i].port_id === this.system.data.ponports){
                                index = i + 1;
                            }
                        }
                        var pon_count = this.port_info.data.slice(0,index);
                        var ge_count = this.port_info.data.slice(index,this.port_info.data.length);
                        var portName = {
                            pon: this.get_portName(pon_count,'PON'),
                            ge: this.get_portName(ge_count,'GE')
                        };
                        this.portName(portName);
                    }).catch(err=>{
                        // to do 
                    })
                }).catch(err=>{
                // to do 
            })
            // 请求url: '/board?info=cpu'
            this.$http.get(this.change_url.pon).then(res=>{
                this.ponInfo = res.data;
            }).catch(err=>{
                // to do
            })
            this.$http.get(this.change_url.cpu).then(res=>{
                this.cpuInfo = res.data;
                setTimeout(()=>{
                    this.drawing(this.cpuInfo.data.cpu_usage,this.cpuInfo.data.memory_usage);
                },0)
            }).catch(err=>{
                // to do
            })
            //  请求url: /time?form=info
            this.$http.get(this.change_url.time).then(res=>{
                this.timer = res.data;
                if(this.timer.data){
                    setInterval(()=>{
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
            }).catch(err=>{
                // to do
            })
        },
        methods:{
            ...mapMutations({
                systemInfo: 'updateSysData',
                portInfo: 'updatePortData',
                portName: 'updatePortName'
            }),
            drawing(cpuNum,memoryNum){
                var cpu = document.getElementById('cpu-detail');
                var cpuCtx = cpu.getContext('2d');
                var memory = document.getElementById('memory-detail');
                var memoryCtx = memory.getContext('2d');
                //起始一条路径   cpu
                cpuCtx.beginPath();
                //设置当前线条的宽度
                cpuCtx.lineWidth = 15; //10px
                //设置笔触的颜色
                cpuCtx.strokeStyle = '#ccc';
                //arc() 方法创建弧/曲线（用于创建圆或部分圆） 
                cpuCtx.arc(100, 100, 90, 0, 2 * Math.PI);
                //绘制已定义的路径
                cpuCtx.stroke();
                cpuCtx.beginPath();
                cpuCtx.lineWidth = 15;
                cpuCtx.strokeStyle = '#65B2FB';
                if(cpuNum >= 70){
                    cpuCtx.strokeStyle = 'red';
                }
                //设置开始处为0点钟方向(-90 * Math.PI / 180)
                //num为百分比值(0-100) //cpuNum
                //var x = this.data.cpuInfo.data.cpu_usage;
                cpuCtx.arc(100, 100, 90, -90 * Math.PI / 180, (cpuNum * 3.6 - 90) * Math.PI / 180);  
                cpuCtx.stroke();
                //绘制文字
                cpuCtx.font = '40px Arial';
                cpuCtx.fillStyle = '#65B2FB';
                cpuCtx.textBaseline = 'middle';
                cpuCtx.textAlign = 'center';
                cpuCtx.fillText(cpuNum+'%', 100, 100);

                //起始一条路径    memory
                memoryCtx.beginPath();
                //设置当前线条的宽度
                memoryCtx.lineWidth = 15; //10px
                //设置笔触的颜色
                memoryCtx.strokeStyle = '#ccc';
                //arc() 方法创建弧/曲线（用于创建圆或部分圆） 
                memoryCtx.arc(100, 100, 90, 0, 2 * Math.PI);
                //绘制已定义的路径
                memoryCtx.stroke();
                memoryCtx.beginPath();
                memoryCtx.lineWidth = 15;
                memoryCtx.strokeStyle = '#65B2FB';
                if(memoryNum >= 70){
                    cpuCtx.strokeStyle = 'red';
                }
                //设置开始处为0点钟方向(-90 * Math.PI / 180)
                //num为百分比值(0-100)  //memoryNum
                //var x = this.data.cpuInfo.data.cpu_usage;
                memoryCtx.arc(100, 100, 90, -90 * Math.PI / 180, (memoryNum * 3.6 - 90) * Math.PI / 180);  
                memoryCtx.stroke();
                //绘制文字
                memoryCtx.font = '40px Arial';
                memoryCtx.fillStyle = '#65B2FB';
                memoryCtx.textBaseline = 'middle';
                memoryCtx.textAlign = 'center';
                memoryCtx.fillText(memoryNum+'%', 100, 100);
            }
        },
        computed: mapState(['lanMap','port_info','system','change_url'])
    }
</script>

<style scoped>
.container{
    padding:5px;
}
.container:after{
    content: '';
    display: table;
    clear: both;
}
.time-info{
    margin:20px 0 0 20px;
}
.time-info>span:first-child{
    display: inline-block;
    width:100px;
    text-align: right;
    margin-right: 20px;
}
.pon-detail{
    width:12%;
    min-width: 125px;
    text-align: center;
    padding: 20px 0;
    float: left;
}
.container>h2{
    height:50px;
    padding-left:10px;
    line-height:50px;
    border-bottom:1px solid #ddd;
}
.pon-detail>p{
    padding:5px 0;
}
h2{
    color:#67AEF7;
    font-weight: 500;
}
.pon-detail>div{
    width:64px;
    height:64px;
    padding:5px;
    margin:10px auto;
    border-radius: 5px;
}
.bg-online{
    border:2px solid #29BDFA;
} 
.bg-offline{
    border:2px solid #A4A9A9;
}
.bg-disabled{
    border: 2px solid #A4A9A9;
}
.systemInfo{
    width:500px;
    /* border:1px solid #666; */
    padding-bottom:10px;
    margin-top: 10px;
    float: left;
}
.systemInfo>div.systemInfo-detail:last-child{
    border-bottom: none;
}
.systemInfo>h2{
    height:50px;
    padding-left:10px;
    line-height:50px;
    border-bottom:1px solid #ddd;
}
.systemInfo-detail>span:first-child{
    display:inline-block;
    width:150px;
    padding:10px 30px 10px 0;
    text-align:right;
}
.systemInfo-detail{
    border-bottom:1px solid #ddd;
}
.cpuInfo{
    float:left;
    width:500px;
    margin:10px 0 0 20px;
    padding-bottom: 20px;
    /* border:1px solid #666; */
}
.cpuInfo>h2{
    height:50px;
    padding-left:10px;
    line-height:50px;
    border-bottom:1px solid #ddd;
}
.cpuInfo>div{
    float: left;
    margin-left:30px;
}
.cpuInfo>div>p{
    padding:10px;
    color:#555;
}
</style>