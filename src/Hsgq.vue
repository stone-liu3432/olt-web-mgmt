<template>
  <div id="hsgq">
    <router-view></router-view>
    <loading v-if="isLoading"></loading>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import loading from "@/components/common/loading";
export default {
  name: "hsgq",
  components: { loading },
  created() {
    this.$http
      .get("./lang-zh.json")
      .then(res => {
        this.lanMap(res.data);
      })
      .catch(err => {
        // to do
      });
    if (sessionStorage.getItem("x-token") !== null) {
      this.$router.push("/main");
    } else {
      //this.$router.push("/login");
      this.$router.push("/main");
    }
  },
  methods: {
    ...mapMutations({
      lanMap: "updateLanMap",
      loading: "updateLoading"
    })
  },
  computed: mapState(["port_info", "system", "isLoading"])
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
.global-load {
  display: none;
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
  user-select: none;
}
a:active {
  border: 1px solid #1e90ff;
}
/* 复用模态框类 */
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
</style>
