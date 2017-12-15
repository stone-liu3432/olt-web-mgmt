<template>
    <div>
        <div class="vlan-config">
            <select class="item-align" v-model="selected">
                <option v-for="(item,index) in port_name.pon" :key="index" :value="item.id">{{ item.name }}</option>
                <option v-for="(item,index) in port_name.ge" :key="index" :value="item.id">{{ item.name }}</option>
            </select>
            <p>
                <span>{{ lanMap['link_status'] + '：' }}</span>
                <span>{{ port_info.data[_portid-1].link_status === 1 ? lanMap['link_up'] : lanMap['link_down'] }}</span>
            </p>
            <p>
                <span>{{ lanMap['admin_status'] + '：' }}</span>
                <span>{{ port_info.data[_portid-1].admin_status === 1 ? lanMap['enable'] : lanMap['disable'] }}</span>
            </p>
        </div>
        <div class="config">
            <h2>{{ lanMap['vlan_cfg']}}</h2>
            <div>
                <div class="vlan-config">
                    <p>{{ lanMap['port_type'] }}</p>
                    <select>
                        <option value="1">access</option>
                        <option value="2">trunk</option>
                        <option value="3">hybird</option>
                    </select>
                </div>
                <div class="vlan-config">
                    <p>{{ lanMap['vlan_mode'] }}</p>
                    <input type="number" max="4094" min="0">
                </div>
                <div class="vlan-config">
                    <p>{{ lanMap['tagged'] }}</p>
                    <input type="text">
                </div>
                <div class="vlan-config">
                    <p>{{ lanMap['untagged'] }}</p>
                    <input type="text">
                </div>
                <div class="btn-submit"> 
                    <a href="javascript:void(0);" class="rt">{{ lanMap['apply'] }}</a>
                </div>
            </div>
        </div>
        <div class="config">
            <h2>{{ lanMap['stormctrl'] }}</h2>
            <div class="storm-config">
                <div>
                    <span>{{ lanMap['broadcast'] }}</span>
                    <span>1</span>
                </div>
                <div>
                    <span>{{ lanMap['multicast'] }}</span>
                    <span>1</span>
                </div>
                <div>
                    <span>{{ lanMap['unicast'] }}</span>
                    <span>1</span>
                </div>
                <div class="btn-submit">
                    <a href="javascript:void(0);" class="rt">{{ lanMap['apply']}}</a>
                </div>
            </div>
        </div>
        <div class="config">
            <h2>{{ lanMap['mirror'] }}</h2>
            <div class="port-mirror">
                <span>{{ lanMap['src_port'] }}</span>
                <span>{{ lanMap['dst_port'] }}
                    <select>
                        <option value="">2</option>
                        <option value="">2</option>
                    </select>
                </span>
                <span>{{ lanMap['type'] }}</span>
                <div class="btn-submit">
                    <a href="javascript:void(0);" class="rt">{{ lanMap['apply'] }}</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
    export default {
        name: 'vlanCfg',
        computed: mapState(['lanMap','port_info','port_name']),
        data(){
            return {
                vlan_data: {},
                stormctrl_data: {},
                mirror_data: {},
                _portid: 0,
                selected: ''
            }
        },
        created(){
            this._portid = this.$route.query.port_id || this.port_info.data[0].port_id;
            this.selected = this._portid;
            // 请求url: /switch_port?form=vlan&port_id=1    默认为 1 端口
            this.$http.get('./VLANInfo.json').then(res=>{
                this.vlan_data = res.data;
            }).catch(err=>{
                // to do 
            })
        },
        methods: {
            
        },
        watch: {
            selected(){
                this._portid = this.selected;
            }
        }
    }
</script>

<style scoped>
.config{
    padding:10px;
    margin:10px;
}
.config>h2{
    padding: 10px 0;
}
.config>div{
    border: 1px solid #ddd;
    padding: 10px 0;
}
.vlan-config{
    width: 800px;
    margin: 20px 0 20px 20px;
}
.item-align{
    float: left;
    width: 200px;
    font-size: 18px;
    font-weight: 600;
    margin-right: 50px;
    text-indent: 10px;
}
.vlan-config>p{
    float: left;
    width:30%;
    height: 30px;
    line-height: 30px;
    padding-right: 20px;
}
.vlan-config>input{
    height: 30px;
    line-height: 30px;
    outline: none;
    box-sizing: border-box;
}
.vlan-config>select{
    height: 30px;
    font-size: 16px;
}
.vlan-config>p:first-child{
    text-align: right;
}
.vlan-config:after{
    content: '';
    display: table;
    clear: both;
}
.vlan-config>p.item-align{
    text-align: left;
}
.btn-submit>a{
    width: 100px;
    height: 30px;
    display: inline-block;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: #ddd;
    line-height: 30px;
    text-align: center;
    margin-top: 10px;
    margin-right: 30px;
}
.btn-submit:after{
    content: "";
    display: table;
    clear: both;
}
.vlan-config>div.storm-config{
    width: 600px;
    border: 1px solid #ddd;
}
.storm-config>div>span{
    display: inline-block;
    width:30%;
    height: 30px;
    line-height: 30px;
}
.storm-config>div{
    margin: 5px 0;
}
.storm-config>div>span:first-child{
    text-align: right;
    padding-right: 20px;
}
.port-mirror>span{
    width: 30%;
    display: inline-block;
    height: 30px;
    line-height: 30px;
    margin-left:20px;
}
.port-mirror>select{
    width: 72px;
}
</style>