<template>
    <div class="running-status">
        <!-- <div class="container"  v-if="ponInfo.data">
            <h2>
                {{ lanMap['pon_info'] }}
            </h2>
            <div class="pon-detail" v-for="(item,index) in this.ponInfo.data" :key="index" @click="jump_onu_allow(item.port_id)">
                <div :class="[ item.status >= 1 ? 'bg-online' : 'bg-offline' ]">
                    <img src="../../../assets/pon_online.png" v-if="item.status >= 1">
                    <img src="../../../assets/pon_offline.png" v-if="item.status < 1">
                </div>
                <p :style="{'color' : item.status >=1 ? '#29BDFA' : '#8D8F92'}">
                    {{ item.port_id < 10 ? 'PON0' + item.port_id : 'PON' + item.port_id }} : {{ item.status >= 1 ? lanMap['online'] : lanMap['offline'] }}
                </p>
                <div class="pon-modal">
                    <p>{{ lanMap['registered_onu'] }}: {{ item.online + item.offline }}</p>
                    <p>{{ lanMap['online'] }}: {{ item.online }}</p>
                    <p class="tips">{{ lanMap['offline'] }}: {{ item.offline }}</p>
                    <span>{{ lanMap['clk_onu_allow'] }}</span>
                </div>
            </div>
        </div>
        <div class="container"  v-if="port_info.data && port_info.data.length > 0">
            <h2>{{ lanMap['ge_port_info'] }}</h2>
            <div class="pon-detail" v-for="(item,index) in port_info.data.slice(system.data.ponports,system.data.ponports + system.data.geports)" :key="item.portid"
             @click="jump_port_cfg(item.port_id)">
                <div :class="[ item.admin_status >= 1 ? item.link_status >= 1 ? 'bg-online' : 'bg-offline' :'bg-disabled' ]">
                    <img src="../../../assets/uplink-fiber-blue.png" v-if="item.media == 'fiber' && item.admin_status >= 1 && item.link_status >=1 ">
                    <img src="../../../assets/uplink-fiber-black.png" v-if="item.media == 'fiber' && item.admin_status >= 1 && item.link_status < 1">
                    <img src="../../../assets/uplink-fiber-black-disable.png" v-if="item.media == 'fiber' && item.admin_status < 1">
                    <img src="../../../assets/uplink-rj45-blue.png" v-if="item.media == 'copper' && item.admin_status >= 1 && item.link_status >=1 ">
                    <img src="../../../assets/uplink-rj45-black.png" v-if="item.media == 'copper' && item.admin_status >= 1 && item.link_status < 1">
                    <img src="../../../assets/uplink-rj45-disable.png" v-if="item.media == 'copper' && item.admin_status < 1">
                </div>
                <p :style="{'color' : item.admin_status >=1 ? item.link_status >=1 ? '#29BDFA' : '#aaa' : 'red'}">
                    {{ index < 10 ? "GE0"+(index+1) : 'GE'+(index+1) }}: {{ item.admin_status >= 1 ? item.link_status >=1 ? lanMap['link_up'] : lanMap['link_down'] : lanMap['forbidden'] }}
                </p>
                <div class="pon-modal">
                    <p :style="{'color' : item.admin_status >=1 ? item.link_status >=1 ? '#29BDFA' : '#aaa' : 'red'}" class="tips">
                        {{ lanMap['admin_status'] }}: {{ item.admin_status >= 1 ? item.link_status >= 1 ? lanMap['enable'] : lanMap['disable'] : lanMap['disable'] }}
                    </p>
                    <span>{{ lanMap['clk_port_cfg'] }}</span>
                </div>
            </div>
            <div class="pon-detail" v-for="(item,key) in port_info.data.slice(system.data.ponports + system.data.geports)" :key="item.portid"
             @click="jump_port_cfg(item.port_id)" v-if="system.data.xgeports">
                <div :class="[ item.admin_status >= 1 ? item.link_status >= 1 ? 'bg-online' : 'bg-offline' :'bg-disabled' ]">
                    <img src="../../../assets/uplink-fiber-blue.png" v-if="item.media == 'fiber' && item.admin_status >=1 && item.link_status >= 1 ">
                    <img src="../../../assets/uplink-fiber-black.png" v-if="item.media == 'fiber' && item.admin_status >=1 && item.link_status < 1">
                    <img src="../../../assets/uplink-fiber-black-disable.png" v-if="item.media == 'fiber' && item.admin_status < 1">
                    <img src="../../../assets/uplink-rj45-blue.png" v-if="item.media == 'copper' && item.admin_status >= 1 && item.link_status >= 1 ">
                    <img src="../../../assets/uplink-rj45-black.png" v-if="item.media == 'copper' && item.admin_status >= 1 && item.link_status < 1">
                    <img src="../../../assets/uplink-rj45-disable.png" v-if="item.media == 'copper' && item.admin_status < 1">
                </div>
                <p :style="{'color' : item.admin_status >=1 ? item.link_status >=1 ? '#29BDFA' : '#aaa' : 'red'}">
                    {{ key < 10 ? "XGE0"+(key+1) : 'XGE'+(key+1) }}: {{ item.admin_status >= 1 ? item.link_status >=1 ? lanMap['link_up'] : lanMap['link_down'] : lanMap['forbidden'] }}
                </p>
                <div class="pon-modal">
                    <p :style="{'color' : item.admin_status >=1 ? item.link_status >=1 ? '#29BDFA' : '#aaa' : 'red'}" class="tips">
                        {{ lanMap['admin_status'] }}: {{ item.admin_status >= 1 ? item.link_status >= 1 ? lanMap['enable'] : lanMap['disable'] : lanMap['disable'] }}
                    </p>
                    <span>{{ lanMap['clk_port_cfg'] }}</span>
                </div>
            </div>
        </div> -->
        <h1>{{ lanMap['running_status'] }}</h1>
        <div class="system-info" v-if="this.system.data">
            <h2>{{ lanMap['sys_info'] }}</h2>
            <div v-for="(item,key) of this.system.data" :key="key" class="system-info-detail"  v-if="key !== 'bl_ver' && key !== 'vendor'">
                <span>{{ lanMap[key] }}</span>
                <span>{{ item }}</span>
            </div>
        </div>
        <div class="cpu-info" v-if="this.cpuInfo.data">
            <h2>{{ lanMap['hw_status'] }}</h2>
            <div>
                <div>
                    <p>{{ lanMap['cpu_usage'] }}</p>
                    <canvas width="200" height="200" id="cpu-detail"></canvas>
                </div>
                <div>
                    <P>{{ lanMap['memory_usage'] }}</P>
                    <canvas width="200" height="200" id="memory-detail"></canvas>
                </div>
            </div>
            <div class="container" v-if="this.timer.data">
                <h2>{{ lanMap['sys_run_time'] }}</h2>
                <div class="time-info">
                    <span>{{ lanMap['current_time'] + ' :' }}</span>
                    <span>
                        {{ 
                            now_time.year + '-' + now_time.month + '-' + now_time.day + '  ' +
                            now_time.hour + ':' + (now_time.min < 10 ? '0' + now_time.min : now_time.min ) + ':' + 
                            (now_time.sec < 10 ? '0' + now_time.sec : now_time.sec)
                        }}
                    </span>
                </div>
                <div class="time-info">
                    <span>{{ lanMap['run_time']+' :' }}</span>
                    <span>
                        {{ run_time.day + " " + lanMap['days'] }}
                        {{ run_time.hour + " " + lanMap['hours'] }}
                        {{ (run_time.min < 10 ? '0' + run_time.min : run_time.min) + " " + lanMap['mins'] }}
                        {{ (run_time.sec < 10 ? '0' + run_time.sec : run_time.sec) + " " + lanMap['secs'] }}
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
                timer: {},
                interval: null,
                time_interval: null,
                now_time: {
                    year: 0,
                    month: 0,
                    day: 0,
                    hour: 0,
                    min: 0,
                    sec: 0
                },
                run_time: {
                    day: 0,
                    hour: 0,
                    min: 0,
                    sec: 0
                }
            }
        },
        computed: mapState(['lanMap', 'port_info', 'system', 'change_url', 'menu', 'port_name']),
        created(){
            //获取 PON 口信息
            // this.$http.get(this.change_url.pon).then(res=>{
            //     if(res.data.code === 1){
            //         this.ponInfo = res.data;
            //     }
            // }).catch(err=>{
            //     // to do
            // })
            this.$http.get(this.change_url.cpu).then(res=>{
                if(res.data.code === 1){
                    this.cpuInfo = res.data;
                    this.$nextTick(()=>{
                        this.drawing(this.cpuInfo.data.cpu_usage,this.cpuInfo.data.memory_usage)
                    });
                }
            }).catch(err=>{
                // to do
            })
            //  请求url: /time?form=info
            this.$http.get(this.change_url.time).then(res=>{
                if(res.data.code === 1){
                    this.timer = res.data;
                    var arr = this.timer.data.time_now;
                    this.now_time.year = arr[0];
                    this.now_time.month = arr[1];
                    this.now_time.day = arr[2];
                    this.now_time.hour = arr[3];
                    this.now_time.min = arr[4];
                    this.now_time.sec = arr[5];
                    this.run_time.day = this.timer.data.uptime[0];
                    this.run_time.hour = this.timer.data.uptime[1];
                    this.run_time.min = this.timer.data.uptime[2];
                    this.run_time.sec = this.timer.data.uptime[3];
                    if(this.timer.data){
                        this.time_interval = setInterval(()=>{
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
                            if(this.run_time.sec < 59){
                                this.run_time.sec += 1;
                            }else{
                                this.run_time.sec = 0;
                                this.run_time.min += 1;
                                if(this.run_time.min > 59){
                                    this.run_time.sec = 0;
                                    this.run_time.min = 0;
                                    this.run_time.hour += 1;
                                    if(this.run_time.hour > 23){
                                        this.run_time.sec = 0;
                                        this.run_time.min = 0;
                                        this.run_time.hour = 0;
                                        this.run_time.day += 1;
                                    }
                                }
                            }
                        },1000)
                    }
                }
            }).catch(err=>{
                // to do
            })
            this.interval = setInterval(()=>{
                // this.get_pon();
                // this.get_ge();
                this.getUsageRate();
            },5000)
            sessionStorage.setItem('first_menu','running_status');
            sessionStorage.removeItem('sec_menu');
        },
        beforeDestroy(){
            clearInterval(this.interval);
            clearInterval(this.time_interval);
        },
        methods: {
            ...mapMutations({ 
                systemInfo: 'updateSysData',
                // portInfo: 'updatePortData',
                // portName: 'updatePortName',
                update_menu: 'updateMenu',
                sys_time: 'updateTime'
            }),
            //  点击跳转到 onu允许列表
            // jump_onu_allow(portid){
            //     this.$router.push('/onu_allow?port_id='+portid);
            //     // 清除当前子菜单的选中效果，给被跳转的子菜单加上选中效果
            //     var sub_item = document.querySelectorAll('p.sub-item');
            //     for(var i=0;i<sub_item.length;i++){
            //         sub_item[i].className = 'sub-item';
            //         if(sub_item[i].innerText.replace(/(^\s*)|(\s*$)/g, "") == this.lanMap['onu_allow'].replace(/(^\s*)|(\s*$)/g, "")){
            //             sub_item[i].className += ' actived';
            //         }
            //     }
            //     // 清除一级菜单的选中效果
            //     var menu_item = document.querySelectorAll('p.menu-item');
            //     for(var i=0;i<menu_item.length;i++){
            //         menu_item[i].className = 'menu-item';
            //     }
            //     // 清除跳转的菜单的选中效果，并给被跳转的菜单添加选中效果
            //     var sub_menu = document.querySelectorAll('ul.sub-menu');
            //     for(var i=0;i<sub_menu.length;i++){
            //         sub_menu[i].className = 'sub-menu';
            //         var text = sub_menu[i].firstElementChild.innerText;
            //         text = text.replace(/(^\s*)|(\s*$)/g, "");
            //         if(text === this.lanMap['onu_allow'].replace(/(^\s*)|(\s*$)/g, "")){
            //             sub_menu[i].className += ' hide';
            //             sub_menu[i].previousElementSibling.className += ' active';
            //         }
            //     }
            //     //  更新菜单状态
            //     var _menu = this.menu;
            //     for(var key in _menu.data.menu){
            //         if(_menu.data.menu[key].name === 'running_status'){
            //             _menu.data.menu[key].isHidden = false;
            //         }
            //         if(_menu.data.menu[key].name === 'pon_mgmt'){
            //             _menu.data.menu[key].isHidden = true;
            //         }
            //     }
            //     // 调用 vuex Mutations方法，更新 store 状态
            //     this.update_menu(_menu);
            //     sessionStorage.setItem('first_menu','pon_mgmt');
            //     sessionStorage.setItem('sec_menu','onu_allow');
            // },
            // //  点击跳转到 端口配置
            // jump_port_cfg(portid){
            //     this.$router.push('/port_cfg?port_id='+portid);
            //     // 清除当前子菜单的选中效果，给被跳转的子菜单加上选中效果
            //     var sub_item = document.querySelectorAll('p.sub-item');
            //     for(var i=0;i<sub_item.length;i++){
            //         sub_item[i].className = 'sub-item';
            //         if(sub_item[i].innerText.replace(/(^\s*)|(\s*$)/g, "") == this.lanMap['port_cfg'].replace(/(^\s*)|(\s*$)/g, "")){
            //             sub_item[i].className += ' actived';
            //         }
            //     }
            //     // 清除一级菜单的选中效果
            //     var menu_item = document.querySelectorAll('p.menu-item');
            //     for(var i=0;i<menu_item.length;i++){
            //         menu_item[i].className = 'menu-item';
            //     }
            //     // 清除跳转的菜单的选中效果，并给被跳转的菜单添加选中效果
            //     var sub_menu = document.querySelectorAll('ul.sub-menu');
            //     for(var i=0;i<sub_menu.length;i++){
            //         sub_menu[i].className = 'sub-menu';
            //         var text = sub_menu[i].firstElementChild.innerText;
            //         text = text.replace(/(^\s*)|(\s*$)/g, "");
            //         if(text === this.lanMap['port_cfg'].replace(/(^\s*)|(\s*$)/g, "")){
            //             sub_menu[i].className += ' hide';
            //             sub_menu[i].previousElementSibling.className += ' active';
            //         }
            //     }
            //     //  更新菜单状态
            //     var _menu = this.menu;
            //     for(var key in _menu.data.menu){
            //         if(_menu.data.menu[key].name === 'running_status'){
            //             _menu.data.menu[key].isHidden = false;
            //         }
            //         if(_menu.data.menu[key].name === 'swport_mgmt'){
            //             _menu.data.menu[key].isHidden = true;
            //         }
            //     }
            //     // 调用 vuex Mutations方法，更新 store 状态
            //     this.update_menu(_menu);
            //     sessionStorage.setItem('first_menu','swport_mgmt');
            //     sessionStorage.setItem('sec_menu','port_cfg');
            // },
            // get_pon(){
            //     this.$http.get(this.change_url.pon).then(res=>{
            //         this.ponInfo = res.data;
            //     }).catch(err=>{
            //         // to do
            //     })
            // },
            // get_ge(){
            //     this.$http.get(this.change_url.port).then(res=>{
            //         this.portInfo(res.data);
            //         var pon = this.system.data.ponports;
            //         var ge = this.system.data.geports;
            //         var xge = this.system.data.xgeports;
            //         var pon_count,ge_count,xge_count,portName;
            //         pon_count = res.data.data.slice(0,pon);
            //         //ge_count = res.data.data.slice(pon);
            //         if(!xge){
            //             ge_count = res.data.data.slice(pon);
            //             portName = {
            //                 pon: this.get_portName(pon_count,'PON'),
            //                 ge: this.get_portName(ge_count,'GE')
            //             };
            //         }else{
            //             ge_count = res.data.data.slice(pon,pon+ge);
            //             xge_count = res.data.data.slice(pon+ge);
            //             portName = {
            //                 pon: this.get_portName(pon_count,'PON'),
            //                 ge: this.get_portName(ge_count,'GE'),
            //                 xge: this.get_portName(xge_count,'XGE')
            //             }
            //         }
            //         this.portName(portName);
            //     }).catch(err=>{
            //         // to do
            //     })
            // },
            // 根据port_id 分配端口名
            // get_portName(arr,prefix){
            //     var obj = {};
            //     for(var i=0;i<arr.length;i++){
            //         obj[arr[i].port_id] = {};
            //         obj[arr[i].port_id].name = i < 10 ? prefix + '0' + (i + 1) : prefix + (i + 1);
            //         obj[arr[i].port_id].id = arr[i].port_id;
            //         obj[arr[i].port_id].data = arr[i]; 
            //     }
            //     return obj;
            // },
            getUsageRate(){
                this.$http.get(this.change_url.cpu).then(res=>{
                    if(res.data.code === 1){
                        this.cpuInfo = res.data;
                    }
                }).catch(err=>{
                    // to do
                })
            },
            drawing(cpuNum,memoryNum){
                var cpu = document.getElementById('cpu-detail');
                if(!cpu) return
                var cpuCtx = cpu.getContext('2d');
                var memory = document.getElementById('memory-detail');
                if(!memory) return
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
        watch: {
            'usageRates'(){
                if(this.usageRates.length > 1){
                    this.$nextTick(()=>{
                        drawChart(this.usageRates,document.getElementById('usage-rates'));
                    })
                }
            }
        }
    }
</script>

<style scoped>
h1{
    font-size: 24px;
    margin: 20px 10px;
    font-weight: 600;
    color: #67AEF7;
}
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
    width:110px;
    text-align: right;
    margin-right: 20px;
}
.pon-detail{
    width:12%;
    min-width: 125px;
    text-align: center;
    padding: 20px 0;
    float: left;
    position: relative;
    cursor: pointer;
}
div.pon-detail>div.pon-modal{
    display: none;
    width: 100%;
    height: auto;
    padding: 10px 0;
    position: absolute;
    z-index: 9;
    left: 0;
    background: #eee;
    border: 1px solid #ccc;
}
div.pon-detail:hover div.pon-modal{
    display: block;
}
div.pon-modal>span{
    font-size: 14px;
    color: #3390e6;
    display: inline-block;
    padding: 0 5px;
}
.container>h2{
    height:30px;
    line-height:30px;
    border-bottom:1px solid #ddd;
}
.pon-detail>p{
    padding:5px 0;
}
p.tips{
    margin-bottom: 10px;
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
.system-info{
    width:500px;
    padding-bottom:10px;
    margin: 10px 0 0 10px;
    float: left;
}
.system-info>div.system-info-detail:last-child{
    border-bottom: none;
}
.system-info>h2{
    height:30px;
    line-height:30px;
    border-bottom:1px solid #ddd;
}
.system-info-detail>span:first-child{
    display:inline-block;
    width:150px;
    padding:10px 30px 10px 0;
    text-align:right;
}
.system-info-detail{
    border-bottom:1px solid #ddd;
}
.cpu-info{
    float:left;
    width:500px;
    margin:10px 0 0 10px;
    padding-bottom: 20px;
}
div.cpu-info>div.container{
    width: 500px;
    margin: 10px 0 0 0;
}
.cpu-info>h2{
    height:30px;
    padding-left:10px;
    line-height:30px;
    border-bottom:1px solid #ddd;
}
.cpu-info>div{
    float: left;
    margin-left:30px;
}
.cpu-info>div>div{
    float: left;
    margin: 15px 0 0 10px;
}
.cpu-info>div>p{
    padding:10px;
    color:#555;
}
</style>