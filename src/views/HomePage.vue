<template>
       <div id="my-three"></div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { AddModuel, mmdHelper } from "../util/myThree";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

//创建一个透视相机，窗口宽度，窗口高度
const width = window.innerWidth;
const height = window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
//创建一个三维场景
const scene = new THREE.Scene();
//加载外部mmd模型实例
const addModuel = new AddModuel(scene, camera);
//加载外部mmd模型方法
// /public/move/ayaka-dance.vmd
addModuel.loader("/public/ganyu/甘雨.pmx", "/public/move/ayaka-dance.vmd");
//设置相机位置
camera.position.set(0, 0, 30);
//设置相机方向
camera.lookAt(0, 0, 0);
//创建辅助坐标轴
// const axesHelper = new THREE.AxesHelper(200); //参数200标示坐标系大小，可以根据场景大小去设置
// scene.add(axesHelper);
//创建一个WebGL渲染器
const renderer = new THREE.WebGLRenderer();
//场景背景色
renderer.setClearColor(0xffffff, 1.0);
//设置渲染区尺寸
renderer.setSize(width, height, false);
//创建控件对象
const controls = new OrbitControls(camera, renderer.domElement);

// 创建动画循环
function animate() {
       requestAnimationFrame(animate);
       // 更新MMD动画
       mmdHelper.update(1 / 60);
       // 更新控制器
       controls.update();
       // 渲染场景
       renderer.render(scene, camera);
}

controls.addEventListener("change", () => {
       //监听鼠标，键盘事件重新渲染场景
       renderer.render(scene, camera);
});

onMounted(() => {
       document.getElementById("my-three")?.appendChild(renderer.domElement);
       // 启动动画循环
       animate();
});
</script>

<style scoped>
body {
       margin: 0;
       padding: 0;
}

#my-three {
       background-color: #eeeeee;
}
</style>
