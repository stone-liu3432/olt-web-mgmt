<template>
    <div class="multicast">
        <div>
            <span>{{ lanMap['multicast_table'] }}</span>
            <span>
                <a href="javascript:void(0);" @click="open_add_modal">{{ lanMap['add'] + lanMap['static_table'] }}</a>
                <a href="javascript:void(0);" @click="open_del_modal" v-if="static_multi.length > 0">{{ lanMap['delete'] + lanMap['static_table'] }}</a>
            </span>
            <i @click="getData"></i>
        </div>
        <nms-table :rows="multicast_tab" border>
            <nms-table-column prop="multi_ip" :label="lanMap['multi_ip']"></nms-table-column>
            <nms-table-column prop="vid" :label="lanMap['vid']"></nms-table-column>
            <nms-table-column :label="lanMap['action']">
                <template slot-scope="rows">
                    {{ rows.action ? lanMap['static'] : lanMap['dynamic'] }}
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['host_portlist']">
                <template slot-scope="rows">
                    <template v-if="rows.host_portlist">
                        {{ rows.host_portlist | parsePortList }}
                    </template>
                    <template v-else>
                        -
                    </template>
                </template>
            </nms-table-column>
            <nms-table-column :label="lanMap['router_portlist']">
                <template slot-scope="rows">
                    <template v-if="rows.router_portlist">
                        {{ rows.router_portlist | parsePortList }}
                    </template>
                    <template v-else>
                        -
                    </template>
                </template>
            </nms-table-column>
        </nms-table>
        <nms-pagination :total="multicast_info.length" :current-page="index" :page-size="display" @current-change="changeIndex" style="float: right;"></nms-pagination>
        <div class="modal-dialog" v-if="show_add_modal">
            <div class="cover"></div>
            <div class="add-content">
                <div>
                    <h3 v-if="is_add" class="modal-header">{{ lanMap['add'] + lanMap['static_table'] }}</h3>
                    <h3 v-else class="modal-header">{{ lanMap['delete'] + lanMap['static_table'] }}</h3>
                    <div v-if="is_add">
                        <span>{{ lanMap['multi_ip'] }}</span>
                        <input type="text" v-focus v-model.trim="multi_ip" placeholder="ex : 127.1.1.1"
                         :style="{ 'border-color': multi_ip !== '' && !reg_ip.test(multi_ip) ? 'red' : '' }">
                    </div>
                    <div v-else>
                        <span>{{ lanMap['multi_ip'] }}</span>
                        <select v-model="del_multi_ip">
                            <option :value="item.multi_ip" v-for="(item,index) in static_multi" :key="index">{{ item.multi_ip }}</option>
                        </select>
                    </div>
                    <div v-if="is_add">
                        <span>{{ lanMap['vid'] }}</span>
                        <input type="text" v-model.number="vid" placeholder="1-4094"
                         :style="{ 'border-color' : vid !== '' && (vid < 1 || vid > 4094 || isNaN(vid)) ? 'red' : '' }">
                    </div>
                    <div v-else>
                        <span>{{ lanMap['vid'] }}</span>
                        <span>{{ vid }}</span>
                    </div>
                    <div v-if="is_add">
                        <span>{{ lanMap['port_id'] }}</span>
                        <select v-model.number="portid">
                            <option :value="key" v-for="(item,key) in port_name.pon" :key="key">{{ item.name }}</option>
                            <option :value="key" v-for="(item,key) in port_name.ge" :key="key">{{ item.name }}</option>
                            <option :value="key" v-for="(item,key) in port_name.xge" :key="key" v-if="port_name.xge">{{ item.name }}</option>
                        </select>
                    </div>
                    <div v-else>
                        <span>{{ lanMap['port_id'] }}</span>
                        <span>{{ port_name.pon[portid] ? port_name.pon[portid].name : port_name.ge[portid] ? port_name.ge[portid].name : port_name.xge[portid].name }}</span>
                    </div>
                    <div v-if="is_add">
                        <a href="javascript:void(0);" @click="submit_add_multi">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="close_add_modal">{{ lanMap['cancel'] }}</a>
                    </div>
                    <div v-else>
                        <a href="javascript:void(0);" @click="submit_del_multi">{{ lanMap['apply'] }}</a>
                        <a href="javascript:void(0);" @click="close_add_modal">{{ lanMap['cancel'] }}</a>
                    </div>
                </div>
                <div class="close" @click="close_add_modal"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'multicast',
    computed: {
        ...mapState(['lanMap','change_url','port_name','system']),
        multicast_tab(){
            const start = (this.index - 1) * this.display;
            const end = start + this.display;
            if(end >= this.multicast_info.length){
                return this.multicast_info.slice(start);
            }
            return this.multicast_info.slice(start, end);
        }
    },
    data(){
        return {
            multicast_info: [],
            //  分页数据 
            index: 1,
            display: 10,
            //  静态组播项参数 * 3
            portid: 1,
            vid: '',
            multi_ip: '',
            reg_ip: /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)|\d))$/,
            //  模态框
            show_add_modal: false,
            show_del_modal: false,
            is_add: true,
            //  所有静态组播表项
            static_multi: [],
            del_multi_ip: ''
        }
    },
    created(){
        this.getData();
    },
    activated(){
        this.getData();
    },
    methods: {
        getData(){
            this.multicast_info = [];
            this.static_multi = [];
            this.index = 1;
            this.$http.get(this.change_url.get_multicast).then(res=>{
                if(res.data.code === 1){
                    if(res.data.data && res.data.data.length ){
                        this.multicast_info = res.data.data;
                        this.static_multi = this.multicast_info.filter(item => item.action === 1)
                    }
                }
            }).catch(err=>{
                // to do
            })
        },
        //  分页跳转
        changeIndex(index){
            this.index = index;
        },
        //  打开添加窗口
        open_add_modal(){
            this.show_add_modal = true;
            this.is_add = true;
        },
        //  关闭添加窗口
        close_add_modal(){
            this.show_add_modal = false;
            this.multi_ip = '';
            this.portid = 1;
            this.vid = '';
            this.del_multi_ip = '';
        },
        //  提交添加信息
        submit_add_multi(){
            if(!this.reg_ip.test(this.multi_ip)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['multi_ip']
                })
                return
            }
            if(this.vid < 1 || this.vid > 4094 || isNaN(this.vid)){
                this.$message({
                    type: 'error',
                    text: this.lanMap['param_error'] + ': ' + this.lanMap['vid']
                })
                return
            }
            var post_param = {
                "method": "add",
                "param":{
                    "multi_ip": this.multi_ip,
                    "vid": this.vid, 
                    "port_id": this.portid
                }
            }
            this.$http.post('/switch_igmp?form=static_entry',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['setting_ok']
                    })
                    this.getData();
                }else if(res.data.code > 1){
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_add_modal();
        },
        //  打开删除confirm确认框
        open_del_modal(){
            this.show_add_modal = true;
            this.is_add = false;
            this.del_multi_ip = this.static_multi[0].multi_ip;
            this.vid = this.static_multi[0].vid;
            this.portid = Number(this.static_multi[0].host_portlist);
        },
        //  提交删除的信息
        submit_del_multi(){
            var post_param = {
                "method":"delete",
                "param":{
                    "multi_ip": this.del_multi_ip,
                    "vid": this.vid, 
                    "port_id": this.portid
                }
            }
            this.$http.post('/switch_igmp?form=static_entry',post_param).then(res=>{
                if(res.data.code === 1){
                    this.$message({
                        type: res.data.type,
                        text: this.lanMap['setting_ok']
                    })
                    this.getData();
                }else{
                    this.$message({
                        type: res.data.type,
                        text: '(' + res.data.code + ') ' + res.data.message
                    })
                }
            }).catch(err=>{
                // to do
            })
            this.close_add_modal();
        }
    },
    watch: {
        'del_multi_ip'(){
            this.static_multi.forEach(item=>{
                if(item.multi_ip === this.del_multi_ip){
                    this.vid = item.vid;
                    this.portid = Number(item.host_portlist) || 1;
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
select{
    width: 200px;
    height: 30px;
    text-indent: 6px;
    border-radius: 3px;
    font-size: 16px;
}
div.multicast{
    >div:first-child{
        span:first-child{
            font-size: 18px;
            color: @titleColor;
            display: inline-block;
            width: 200px;
        }
        a+a{
            margin-left: 20px;
        }
        i{
            display: inline-block;
            width: 32px;
            height: 32px;
            background: url('../../../../assets/refresh.png') no-repeat;
            vertical-align: middle;
            margin-left: 30px;
            cursor: pointer;
        }
    }
    div.add-content{
        width: 500px;
        height: 250px;
        >div{
            div{
                height: 30px;
                line-height: 30px;
                margin: 10px 0;
                span:first-child{
                    display: inline-block;
                    width: 220px;
                    text-align: center;
                }
            }
            a{
                margin-left: 105px;
                margin-top: 10px;
            }
        }
    }
}
</style>
