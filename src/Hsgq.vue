<template>
  <div id="hsgq">
    <router-view></router-view>
    <loading v-if="!port_info.data" class="load"></loading>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import loading from "@/components/common/loading";
export default {
  name: "hsgq",
  components: {
    loading
  },
  created() {
    this.$http
      .get("./lang-zh.json")
      .then(res => {
        this.lanMap(res.data);
      })
      .catch(err => {
        // to do
      });
    this.$router.push("/login");
    //  会话保存，在用户刷新页面后保存登陆状态
    sessionStorage.setItem("accessToken", 12312341545);
  },
  methods: {
    ...mapMutations({
      lanMap: "updateLanMap"
    })
  },
  computed: mapState(["port_info", "system"])
};
</script>

<style>
#hsgq {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  width: 100%;
  min-width: 1280px;
  max-width: 1980px;
}
/**************** RESET STYLE****************/
body,
div,
dl,
dt,
dd,
ul,
ol,
li,
h1,
h2,
h3,
h4,
h5,
h6,
pre,
form,
fieldset,
input,
textarea,
p,
blockquote,
th,
td {
  padding: 0;
  margin: 0;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}
fieldset,
img {
  border: 0;
}
address,
caption,
cite,
code,
dfn,
em,
strong,
th,
var {
  font-weight: normal;
  font-style: normal;
}
ol,
ul {
  list-style: none;
}
caption,
th {
  text-align: left;
}
h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: normal;
  font-size: 100%;
}
q:before,
q:after {
  content: "";
  /*content:none;*/
}
abbr,
acronym {
  border: 0;
}
a {
  text-decoration: none;
  color: #000;
}
body {
  user-select: none;
}
html,
body,
#app {
  height: 100%;
}
.lf {
  float: left;
}
.rt {
  float: right;
}
select {
  border: 1px solid #c8cccf;
}
.flex-box {
  display: flex;
}
input[type="text"] {
  text-indent: 10px;
  font-size: 16px;
  height: 30px;
  line-height: 30px;
  border: 1px solid #c8cccf;
  color: #000;
  appearance: none;
  outline: 0;
  text-decoration: none;
}
input[type="text"]:focus {
  border: 1px solid #1e90ff;
}
a {
  border: 1px solid transparent;
}
a:active {
  border: 1px solid #1e90ff;
}
/* 分用模态框类 */
.modal-dialog {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}
.cover {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: #666;
  opacity: 0.5;
}
.close {
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 60px;
  cursor: pointer;
  background: url("./assets/close_msg.png") no-repeat;
}
.close:hover {
  background: url("./assets/close_msg_hover.png") no-repeat;
}
#hsgq > .load {
  position: static;
}
</style>
