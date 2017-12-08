<template>
    <div>
        <div class="vlan-config">
            <p class="item-align">PON01</p>
            <p>linkup</p>
            <p>Enable</p>
        </div>
        <div class="config">
            <h2>VLAN配置</h2>
            <div>
                <div class="vlan-config">
                    <p>port-type</p>
                    <select>
                        <option value="">access</option>
                        <option value="">trunk</option>
                        <option value="">hybird</option>
                    </select>
                </div>
                <div class="vlan-config">
                    <p>port-defaultVLAN</p>
                    <input type="number" max="4094" min="0">
                </div>
                <div class="vlan-config">
                    <p>tagged_vlan</p>
                    <input type="text">
                </div>
                <div class="vlan-config">
                    <p>untagged_vlan</p>
                    <input type="text">
                </div>
                <div class="btn-submit"> 
                    <a href="javascript:void(0);" class="rt">提交修改</a>
                </div>
            </div>
        </div>
        <div class="config">
            <h2>风暴控制</h2>
            <div class="storm-config">
                <div>
                    <span>broadcast</span>
                    <span>1</span>
                </div>
                <div>
                    <span>multicast</span>
                    <span>1</span>
                </div>
                <div>
                    <span>unicast</span>
                    <span>1</span>
                </div>
                <div class="btn-submit">
                    <a href="javascript:void(0);" class="rt">提交修改</a>
                </div>
            </div>
        </div>
        <div class="config">
            <h2>端口镜像</h2>
            <div class="port-mirror">
                <span>源端口：1</span>
                <span>目标端口：
                    <select>
                        <option value="">2</option>
                        <option value="">2</option>
                    </select>
                </span>
                <span>类型：0</span>
                <div class="btn-submit">
                    <a href="javascript:void(0);" class="rt">提交修改</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
    export default {
        name: 'vlanCfg',
        data(){
            return {
                vlan_data: {},
                stormctrl_data: {},
                mirror_data: {}
            }
        },
        created(){
            // 请求url: /switch_port?form=vlan&port_id=1    默认为 1 端口
            this.$http.get('./VLANInfo.json').then(res=>{
                this.vlan_data = res.data;
            }).catch(err=>{
                // to do 
            })
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
    width:600px;
    margin: 5px 0;
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