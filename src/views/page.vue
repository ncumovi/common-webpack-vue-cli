
<template>
  <div>
    <img alt="Vue logo" src="../assets/img/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
    <van-button type="danger">按钮</van-button>
  </div>
</template>
<script>
import HelloWorld from "../components/helloWorld.vue";

export default {
  name: "page",
  components: {
    HelloWorld,
  },
};
</script>