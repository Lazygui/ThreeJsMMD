<template>
       <div id="canvas-three"></div>
</template>

<script lang="ts" setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

//创建一个三维场景
const scene = new THREE.Scene();
</script>

<style scoped>
#canvas-three {
       background-color: #eeeeee;
}
</style>
