<template>
    <div class="top-banner">
      <div class="top-banner-logo lf">
        <a href="#">HSGQ</a>
      </div>
      <h1 class="lf">|</h1>
      <div class="product-type lf" v-if="system.data">{{ system.data.product_name }}</div>
      <div class="user-login rt">
        <div class="lf">
          <i></i>
          <p>用户</p>
        </div>
        <div class="lf">
          <i></i>
          <p>登出</p>
        </div>
      </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
   name : 'topBanner',
   computed: mapState(['system'])
}
</script>

<style scoped>
  .top-banner{
    width:100%;
    min-width: 1280px;
    max-width: 1980px;
    height:70px;
    position:fixed;
    top:0;
    left:0;
    background: #252532;
    color:#fff;
  }
  .top-banner::after{
    content : '';
    display: table;
    clear:both;
  }
  .top-banner h1{
    font-size:42px;
    line-height:70px;
  }
  .top-banner-logo{
    width:200px;
    height:70px;
    line-height:70px;
    text-align: center;
  }
  .top-banner-logo a{
    font-size:42px;
    font-weight:bold;
    color:#fff;
  }
  .product-type{
    width:200px;
    height:70px;
    font-size:20px;
    line-height:70px;
    text-align: center;
  }
  .user-login div{
    width:100px;
    height:70px;
    line-height:70px;
    font-size:16px;
    cursor:pointer;
  }
</style>
