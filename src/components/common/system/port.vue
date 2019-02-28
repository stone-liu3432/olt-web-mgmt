<template>
    <div class="port lf" v-if="portInfo" @click="jump(portInfo)">
        <div class="lf">
            <div :class="[ 'bg-img', portInfo.status ? 'pon-online' : 'pon-offline']" 
                v-if="portType === 'pon'">
            </div>
            <div :class="[ 'bg-img', portInfo.data.media === 'fiber' ? portInfo.data.admin_status ? portInfo.data.link_status ? 'ge-online' : 'ge-offline' : 'ge-disabled' :
                 portInfo.data.admin_status ? portInfo.data.link_status ? 'rj45-online' : 'rj45-offline' : 'rj45-disabled' ]" 
                v-if="portType === 'ge' || portType === 'xge'">
            </div>
            <!-- <div :class="[ 'bg-img', 'xge-online']" 
                v-if="portType === 'xge'">
            </div> -->
            <div v-if="portType === 'pon'">
                {{ portType.toUpperCase() + portInfo.port_id }} : 
                {{ portInfo.status ? 'online' : 'offline' }}
            </div>
            <div v-if="portInfo && portInfo.data && portType !== 'pon'">
                {{ portInfo.name }} : 
                {{ portInfo.data.link_status ? 'online' : 'offline' }}
            </div>
        </div>
        <div class="lf pon-dev-info" v-if="portType === 'pon'">
            <div>
                <span>{{ lanMap['registered_onu'] }}:</span>
                <span>{{ portInfo.online + portInfo.offline }}</span>
            </div>
            <div>
                <span>{{ lanMap['online'] }}: </span>
                <span>{{ portInfo.online }}</span>
            </div>
            <div>
                <span>{{ lanMap['offline'] }}: </span>
                <span>{{ portInfo.offline }}</span>
            </div>
        </div>
        <div class="lf ge-dev-info" v-if="portType === 'ge' || portType === 'xge'">
            <div>
                <span>{{ lanMap['admin_status'] }}: </span>
                <span>
                    {{ portInfo.data.admin_status ? lanMap['enable'] : lanMap['disable'] }}
                </span>
            </div>
            <div>
                <span>{{ lanMap['link_status'] }}: </span>
                <span>
                    {{ portInfo.data.link_status ? lanMap['enable'] : lanMap['disable'] }}
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState,mapMutations } from 'vuex'
export default {
    name: 'port',
    props: ['portInfo','portType'],
    data(){
        return {
            _portinfo: ''
        }
    },
    created(){},
    methods: {
        ...mapMutations({
            changeMenu: 'updateNavMenu',
            changeAdvMenu: 'updateAdvMenu',
            changeFMenu: 'updateAdvFMenu'
        }),
        jump(node){
            if(this.portType === 'pon'){
                this.$router.push('/onu_allow?port_id=' + this.portInfo.port_id);
                this.changeMenu('onu_allow');
            }
            if(this.portType === 'ge'){
                this.$router.push('/port_cfg?port_id=' + this.portInfo.id);
                this.changeMenu('advanced_setting');
                this.changeFMenu('swport_mgmt');
                this.changeAdvMenu('port_cfg');
                sessionStorage.setItem('f_menu', 'advanced_setting');
                sessionStorage.setItem('first_menu', 'swport_mgmt');
                sessionStorage.setItem('sec_menu', 'port_cfg');
            }
        }
    },
    computed: mapState(['lanMap'])
}
</script>

<style lang="less" scoped>
div.port{
    width: 300px;
    height: 130px;
    margin: 16px 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
    &::after{
        content: "";
        display: table;
        clear: both;
    }
    >div{
        padding: 8px;
        &:first-child{
            width: 130px;
            padding: 8px 0;
        }
    }
    div.pon-dev-info{
        height: 120px;
        line-height: 120px;
        padding: 0 16px;
        >div{
            height: 32px;
            line-height: 32px;
            &:first-child{
                margin: 12px 0 0 0;
            }
        }
    }
    div.ge-dev-info{
        height: 120px;
        line-height: 120px;
        //margin: 0 0 0 10px;
        padding: 8px 8px 8px 0;
        >div{
            height: 32px;
            line-height: 32px;
            &:first-child{
                margin: 20px 0 0 0;
            }
        }
    }
}
div.bg-img{
    width: 64px;
    height: 64px;
    margin: 8px auto;
    padding: 6px;
    &+div{
        text-align: center;
        margin: 8px 0;
    }
}
div.pon-online{
    border: 2px solid #67aef6;
    border-radius: 5px;
    background: url('../../../assets/pon_online.png') no-repeat 6px 6px;
}
div.pon-offline{
    border: 2px solid #666;
    border-radius: 5px;
    background: url('../../../assets/pon_offline.png') no-repeat 6px 6px;
}
div.ge-online{
    border: 2px solid #67aef6;
    border-radius: 5px;
    background: url('../../../assets/uplink-fiber-blue.png') no-repeat 6px 6px;
}
div.ge-offline{
    border: 2px solid red;
    border-radius: 5px;
    background: url('../../../assets/uplink-fiber-black.png') no-repeat 6px 6px;
}
div.ge-disabled{
    border: 2px solid #666;
    border-radius: 5px;
    background: url('../../../assets/uplink-fiber-black-disable.png') 6px 6px;
}
div.rj45-online{
    border: 2px solid #67aef6;
    border-radius: 5px;
    background: url('../../../assets/uplink-rj45-blue.png') no-repeat 5px 5px;
}
div.rj45-offline{
    border: 2px solid red;
    border-radius: 5px;
    background: url('../../../assets/uplink-rj45-black.png') no-repeat 5px 5px;
}
div.rj45-disabled{
    border: 2px solid #666;
    border-radius: 5px;
    background: url('../../../assets/uplink-rj45-disable.png') 5px 5px;
}
</style>
