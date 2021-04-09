<template>
  <div>
    <router-link to="home"> to home</router-link>

    <router-link to="page"> to page</router-link>
    <router-link to="map"> to map</router-link>

    <router-view> </router-view>
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
@import "./assets/common";
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
