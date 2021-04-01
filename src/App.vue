<template>
  <div>
    <img alt="Vue logo" src="./assets/img/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
    <van-button type="primary">Ö÷Òª°´Å¥</van-button>
  </div>
</template>

<script>
import HelloWorld from "./components/helloWorld.vue";

export default {
  name: "App",
  components: {
    HelloWorld,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
