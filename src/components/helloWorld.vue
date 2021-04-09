<template>
  <div>
    <h1>
      hello movi
      <p>我是副标题</p>
    </h1>
    <div class="movi">我是背景图</div>
    <img :src="require('@/assets/img/avagtor.jpg')" alt="" />
    <!-- <el-button type="danger">button</el-button> -->
  </div>
</template>
<script src="./helloWorld.js"></script>
<style lang='less'>
h1 {
  background: red;
  color: #fff;
  p {
    color: blue;
  }
}
.movi {
  width: 80px;
  height: 80px;
  background: url(@/assets/img/avagtor.jpg) no-repeat center;
}
</style>