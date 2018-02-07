<template>
    <div class="running-status">
        <div class="container"  v-if="ponInfo.data">
            <h2>
                {{ lanMap['pon_info'] }}
            </h2>
            <div class="pon-detail" v-for="(item,index) in this.ponInfo.data" :key="index" @click="jump_onu_allow(item.port_id)">
                <!-- <p>{{ item.port_id < 10 ? 'PON0' + item.port_id : 'PON' + item.port_id }}</p> -->
                <div :class="[ item.status >= 1 ? 'bg-online' : 'bg-offline' ]">
                    <img src="../../assets/pon_online.png" v-if="item.status >=1">
                    <img src="../../assets/pon_offline.png" v-if="item.status <1">
                </div>
                <p :style="{'color' : item.status >=1 ? '#29BDFA' : '#8D8F92'}">
                    {{ item.port_id < 10 ? 'PON0' + item.port_id : 'PON' + item.port_id }} : {{ item.status >= 1 ? lanMap['online'] : lanMap['offline'] }}
                </p>
                <div class="pon-modal">
                    <p>{{ lanMap['registered_onu'] }}:{{ item.online + item.offline }}</p>
                    <p>{{ lanMap['online'] }}：{{ item.online }}</p>
                    <p class="tips">{{ lanMap['offline'] }}：{{ item.offline }}</p>
                    <span>{{ lanMap['clk_onu_allow'] }}</span>
                </div>
            </div>
        </div>
        <div class="container"  v-if="this.geInfo[0]">
            <h2>{{ lanMap['ge_port_info'] }}</h2>
            <div class="pon-detail" v-for="(item,index) in this.geInfo" :key="index" @click="jump_port_cfg(item.port_id)">
                <div :class="[ item.admin_status >= 1 ? item.link_status >= 1 ? 'bg-online' : 'bg-offline' :'bg-disabled' ]">
                    <img src="../../assets/uplink-fiber-blue.png" v-if="item.media == 'fiber' &&item.admin_status >=1 && item.link_status >=1 ">
                    <img src="../../assets/uplink-fiber-black.png" v-if="item.media == 'fiber' && item.admin_status >=1 && item.link_status < 1">
                    <img src="../../assets/uplink-fiber-black-disable.png" v-if="item.media == 'fiber' && item.admin_status < 1">
                    <img src="../../assets/uplink-rj45-blue.png" v-if="item.media == 'copper' &&item.admin_status >=1 && item.link_status >=1 ">
                    <img src="../../assets/uplink-rj45-black.png" v-if="item.media == 'copper' && item.admin_status >=1 && item.link_status < 1">
                    <img src="../../assets/uplink-rj45-disable.png" v-if="item.media == 'copper' && item.admin_status < 1">
                </div>
                <p :style="{'color' : item.admin_status >=1 ? item.link_status >=1 ? '#29BDFA' : '#aaa' : 'red'}">
                    {{ index < 10 ? "GE0"+(index+1) : 'GE'+(index+1) }}：{{ item.admin_status >= 1 ? item.link_status >=1 ? lanMap['link_up'] : lanMap['link_down'] : lanMap['forbidden'] }}
                </p>
                <div class="pon-modal">
                    <p :style="{'color' : item.admin_status >=1 ? item.link_status >=1 ? '#29BDFA' : '#aaa' : 'red'}" class="tips">
                        {{ lanMap['admin_status'] }}：{{ item.admin_status >= 1 ? item.link_status >= 1 ? lanMap['enable'] : lanMap['disable'] : lanMap['disable'] }}
                    </p>
                    <span>{{ lanMap['clk_port_cfg'] }}</span>
                </div>
            </div>
        </div>
        <div class="system-info" v-if="this.system.data">
            <h2>{{ lanMap['sys_info'] }}</h2>
            <div v-for="(item,key) of this.system.data" :key="key" class="system-info-detail"  v-if="key !== 'bl_ver'">
                <!-- 根据key值，取出映射的lanMap字符 -->
                <span>{{ lanMap[key] }}</span>
                <span>{{ item }}</span>
            </div>
        </div>
        <div class="cpu-info" v-if="this.cpuInfo.data">
            <h2>{{ lanMap['hw_status'] }}</h2>
            <div>
                <p>{{ lanMap['cpu_usage'] }}</p>
                <canvas width="200" height="200" id="cpu-detail"></canvas>
            </div>
            <div>
                <P>{{ lanMap['memory_usage'] }}</P>
                <canvas width="200" height="200" id="memory-detail"></canvas>
            </div>
            <div class="container" v-if="this.timer.data">
                <h2>{{ lanMap['sys_run_time'] }}</h2>
                <div class="time-info">
                    <span>{{ lanMap['current_time'] + ' :' }}</span>
                    <span>{{ new Date(timer.data.time_sec*1000).toLocaleString().replace(/\//g,'-') }}</span>
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
                timer: {},
                interval: null,
                time_interval: null
            }
        },
        created(){
            this.get_ge();
            //获取 PON 口信息
            this.$http.get(this.change_url.pon).then(res=>{
                if(res.data.code === 1){
                    this.ponInfo = res.data;
                }
            }).catch(err=>{
                // to do
            })
            // 请求url: '/board?info=cpu'
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
                    this.sys_time(res.data);
                    if(this.timer.data){
                        this.time_interval = setInterval(()=>{
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
                            this.timer.data.time_sec += 1;
                        },1000)
                    }
                }
            }).catch(err=>{
                // to do
            })
            this.interval = setInterval(()=>{
                this.get_pon();
                this.get_ge();
            },5000)
        },
        beforeDestroy(){
            clearInterval(this.interval);
            clearInterval(this.time_interval);
        },
        methods: {
            ...mapMutations({
                systemInfo: 'updateSysData',
                portInfo: 'updatePortData',
                portName: 'updatePortName',
                update_menu: 'updateMenu',
                sys_time: 'updateTime'
            }),
            //  点击跳转到 onu允许列表
            jump_onu_allow(portid){
                this.$router.push('/onu_allow?port_id='+portid);
                // 清除当前子菜单的选中效果，给被跳转的子菜单加上选中效果
                var sub_item = document.querySelectorAll('p.sub-item');
                for(var i=0;i<sub_item.length;i++){
                    sub_item[i].className = 'sub-item';
                    var str = sub_item[i].innerText.replace(/\s/g,'');
                    if(sub_item[i].innerText == this.lanMap['onu_allow']){
                        sub_item[i].className += ' actived';
                    }
                }
                // 清除一级菜单的选中效果
                var menu_item = document.querySelectorAll('p.menu-item');
                for(var i=0;i<menu_item.length;i++){
                    menu_item[i].className = 'menu-item';
                }
                // 清除跳转的菜单的选中效果，并给被跳转的菜单添加选中效果
                var sub_menu = document.querySelectorAll('ul.sub-menu');
                for(var i=0;i<sub_menu.length;i++){
                    sub_menu[i].className = 'sub-menu';
                    var text = sub_menu[i].firstElementChild.innerText;
                    text = text.replace(/(^\s*)|(\s*$)/g, "");
                    if(text === this.lanMap['onu_allow']){
                        sub_menu[i].className += ' hide';
                        sub_menu[i].previousElementSibling.className += ' active';
                    }
                }
                //  更新菜单状态
                var _menu = this.menu;
                for(var key in _menu.data.menu){
                    if(_menu.data.menu[key].name === 'running_status'){
                        _menu.data.menu[key].isHidden = false;
                    }
                    if(_menu.data.menu[key].name === 'pon_mgmt'){
                        _menu.data.menu[key].isHidden = true;
                    }
                }
                // 调用 vuex Mutations方法，更新 store 状态
                this.update_menu(_menu);
            },
            //  点击跳转到 端口配置
            jump_port_cfg(portid){
                this.$router.push('/port_cfg?port_id='+portid);
                // 清除当前子菜单的选中效果，给被跳转的子菜单加上选中效果
                var sub_item = document.querySelectorAll('p.sub-item');
                for(var i=0;i<sub_item.length;i++){
                    sub_item[i].className = 'sub-item';
                    if(sub_item[i].innerText == this.lanMap['port_cfg']){
                        sub_item[i].className += ' actived';
                    }
                }
                // 清除一级菜单的选中效果
                var menu_item = document.querySelectorAll('p.menu-item');
                for(var i=0;i<menu_item.length;i++){
                    menu_item[i].className = 'menu-item';
                }
                // 清除跳转的菜单的选中效果，并给被跳转的菜单添加选中效果
                var sub_menu = document.querySelectorAll('ul.sub-menu');
                for(var i=0;i<sub_menu.length;i++){
                    sub_menu[i].className = 'sub-menu';
                    var text = sub_menu[i].firstElementChild.innerText;
                    text = text.replace(/(^\s*)|(\s*$)/g, "");
                    if(text === this.lanMap['port_cfg']){
                        sub_menu[i].className += ' hide';
                        sub_menu[i].previousElementSibling.className += ' active';
                    }
                }
                //  更新菜单状态
                var _menu = this.menu;
                for(var key in _menu.data.menu){
                    if(_menu.data.menu[key].name === 'running_status'){
                        _menu.data.menu[key].isHidden = false;
                    }
                    if(_menu.data.menu[key].name === 'swport_mgmt'){
                        _menu.data.menu[key].isHidden = true;
                    }
                }
                // 调用 vuex Mutations方法，更新 store 状态
                this.update_menu(_menu);
            },
            get_pon(){
                this.$http.get(this.change_url.pon).then(res=>{
                    this.ponInfo = res.data;
                }).catch(err=>{
                    // to do
                })
            },
            get_ge(){
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
            },
            // 根据port_id 分配端口名
            get_portName(arr,prefix){
                var obj = {};
                for(var i=0;i<arr.length;i++){
                    obj[arr[i].port_id] = {};
                    obj[arr[i].port_id].name = i < 10 ? prefix + '0' + arr[i].port_id : prefix + arr[i].port_id;
                    if(arr[i].port_id > this.system.data.ponports){
                        var n = arr[i].port_id - this.system.data.ponports;
                        obj[arr[i].port_id].name = i < 10 ? prefix + '0' + n : prefix + n;
                    }
                    obj[arr[i].port_id].id = arr[i].port_id;
                    obj[arr[i].port_id].data = arr[i]; 
                }
                return obj;
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
        computed: mapState(['lanMap','port_info','system','change_url','menu'])
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
    padding-left:10px;
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
    /* border:1px solid #666; */
    padding-bottom:10px;
    margin-top: 10px;
    float: left;
}
.system-info>div.system-info-detail:last-child{
    border-bottom: none;
}
.system-info>h2{
    height:30px;
    padding-left:10px;
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
    margin:10px 0 0 20px;
    padding-bottom: 20px;
    /* border:1px solid #666; */
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
.cpu-info>div>p{
    padding:10px;
    color:#555;
}
</style>