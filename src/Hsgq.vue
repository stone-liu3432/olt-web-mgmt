<template>
  <div id="hsgq">
    <topBanner></topBanner>
    <mainContent></mainContent>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import { mapState } from 'vuex'
import topBanner from '@/components/page/header'
import mainContent from '@/components/page/main'
export default {
  name: 'hsgq',
  components: {
     topBanner,
     mainContent
  },
  created(){
	// 根组件创建之前，初始化vuex部分数据
    this.$http.get('./systemInfo.json').then(res=>{
	      this.systemInfo(res.data);
            this.$http.get('./portInfo.json').then(res=>{
				this.portInfo(res.data);
				var pon_count = this.port_info.data.slice(0,this.system.data.ponports);
				var ge_count = this.port_info.data.slice(this.system.data.ponports,this.port_info.data.length);
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
    this.$http.get('./lang-zh.json').then(res=>{
		this.lanMap(res.data);
    }).catch(err=>{
      	// to do 
    })
    this.$router.push('/');
  },
  methods:{
	...mapMutations({
		systemInfo: 'updateSysData',
		portInfo: 'updatePortData',
    	lanMap: 'updateLanMap',
    	portName: 'updatePortName'
	}),
	// 根据port_id 分配端口名
	get_portName(arr,prefix){
		var obj = {};
		for(var i=0;i<arr.length;i++){
     	 	obj[arr[i].port_id] = {};
			obj[arr[i].port_id].name = i < 10 ? prefix + '0' + (i+1) : prefix + (i+1);
			obj[arr[i].port_id].id = arr[i].port_id;
		}
		return obj;
	}
  },
  computed: mapState(['port_info','system'])
}
</script>

<style>
#hsgq{
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height:100%;
  width:100%;
  min-width: 1280px;
  max-width: 1980px;
}
/**************** RESET STYLE****************/
body,div,dl,dt,dd,ul,ol,li,h1,h2,h3,h4,h5,h6,pre,
form,fieldset,input,textarea,p,blockquote,th,td {
  padding: 0;
  margin: 0;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}
fieldset,img {
  border: 0;
}
address,caption,cite,code,dfn,em,strong,th,var {
  font-weight: normal;
  font-style: normal;
}
ol,ul {
  list-style: none;
}
caption,th {
  text-align: left;
}
h1,h2,h3,h4,h5,h6 {
  font-weight: normal;
  font-size: 100%;
}
q:before,q:after {
  content:'';
  /*content:none;*/
}
abbr,acronym {
  border: 0;
}
a{
  text-decoration:none;
  color:#000;
}
body{
  user-select: none;
}
html,body,#app{
  height:100%;
}
.lf{
  float:left;
}
.rt{
  float:right;
}
select{
    border: 1px solid #C8CCCF;
}
input[type="text"]{
    text-indent: 10px;
    font-size: 16px;
    height: 30px;
    line-height: 30px;
    border:1px solid #c8cccf;
    /* color:#6a6f77; */
    color: #000;
    -web-kit-appearance:none;
    -moz-appearance: none;
    outline:0;
    text-decoration:none;
}
input[type="text"]:focus{
  border:1px solid #1E90FF;
}
</style>
