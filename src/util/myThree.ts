import Ammo from "ammo.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader";
import { MMDAnimationHelper } from "three/examples/jsm/animation/MMDAnimationHelper";
import { Scene, AmbientLight, AudioLoader, AudioListener, PerspectiveCamera } from "three";
const mmdTypeList: string[] = ["pmx", "pmd"];
const gltfTypeList: string[] = ["glb"];
export const mmdHelper = new MMDAnimationHelper();
const mmdLoad = new MMDLoader();

//@ts-ignore
window.Ammo = Ammo;
// Ammo().then((AmmoLib) => {
// });
export class AddModuel {
       private Scene: Scene;
       private Camera: PerspectiveCamera;
       public text: string;
       constructor(scene: Scene, camera: PerspectiveCamera) {
              //场景
              this.Scene = scene;
              //摄像头
              this.Camera = camera;
       }

       /**
        * @description 加载模型如果存在动画则绑定动画
        * @param modelUrl 模型路径 {string}
        * @param animationurl 动作动画路径 {string}
        */
       public loader(modelUrl: string, animationurl?: string) {
              if (modelUrl && modelUrl.length === 0) {
                     return;
              }
              //模型文件后缀名
              const fileLastName = modelUrl.split(".")[1];
              //mmd模型
              if (mmdTypeList.indexOf(fileLastName) > -1) {
                     this.loaderMMD(modelUrl, animationurl);
              }
              //glb模型
              //  else if (gltfTypeList.indexOf(fileLastName) > -1) {
              //      this.loaderGLTF(modelUrl)
              //  }
              //添加光源
              this.Scene.add(new AmbientLight(0xffffff, 1.5));
       }

       /**
        * @description mmd模型加载场景方法
        * @param modelUrl 模型路径 string
        * @param animationurl 动画路径 string
        */
       private async loaderMMD(modelUrl: string, animationurl?: string) {
              if (animationurl && animationurl.length > 0) {
                     //模型动作动画
                     const self = this;
                     mmdLoad.loadWithAnimation(
                            modelUrl,
                            animationurl,
                            function onLoad(mmd) {
                                   const { mesh } = mmd;
                                   mesh.position.set(0, -10, 0);
                                   //将动画绑定模型
                                   mmdHelper.add(mesh, {
                                          animation: mmd.animation,
                                          physics: true
                                   });
                                   //将模型添加进场景
                                   self.Scene.add(mesh);
                            },
                            //当加载正在进行时被调用的函数
                            function onProgress(mmd) {},
                            //如果加载过程中发生错误时被调用的函数
                            function onError(mmd) {
                                   console.log(mmd);
                            }
                     );
              } else {
                     //展示静态模型
                     mmdLoad.load(
                            modelUrl,
                            //模型加载成功调用
                            (mmd) => {
                                   //设置模型位置
                                   mmd.position.set(0, -10, 0);
                                   //将模型添加进场景
                                   this.Scene.add(mmd);
                            },
                            function (xhr) {
                                   //   console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                            },
                            //模型加载失败调用
                            function (error) {
                                   //       console.log('🚀 ~ file: HomePage.vue:18 ~ error:', error)
                            }
                     );
              }
       }
       //     private loaderGLTF(modelUrl: string) {
       //         new GLTFLoader().load(
       //             modelUrl,
       //             glft => {
       //                 //   console.log('🚀 ~ file: myThree.ts:50 ~ AddModuel ~ loaderGLTF ~ glft:', glft)
       //                 glft.scene.position.set(0, 0, 0)
       //                 this.Scene.add(glft.scene)
       //             },
       //             function (xhr) {
       //                 //   console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
       //             },
       //             function (error) {
       //                 console.log('🚀 ~ file: HomePage.vue:18 ~ error:', error)
       //             }
       //         )
       //     }
}
