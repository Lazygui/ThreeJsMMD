import Ammo from "ammo.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader";
import { MMDAnimationHelper } from "three/examples/jsm/animation/MMDAnimationHelper";
import { Scene, AmbientLight, PerspectiveCamera, Object3D } from "three";

type ModelType = "pmx" | "pmd" | "glb";
type LoadProgressCallback = (progress: number) => void;

interface ModelLoaderOptions {
       enablePhysics?: boolean;
       position?: { x: number; y: number; z: number };
}

interface AnimationConfig {
       animationUrl?: string;
       physics?: boolean;
}

const MODEL_TYPES = {
       MMD: ["pmx", "pmd"] as const,
       GLTF: ["glb"] as const
};

class PhysicsInitializer {
       static async initialize() {
              (window as any).Ammo = await Ammo();
       }
}

class MmdModelLoader {
       private readonly mmdLoader = new MMDLoader();
       private readonly mmdHelper = new MMDAnimationHelper();

       constructor(private readonly scene: Scene, private readonly defaultPosition = { x: 0, y: -10, z: 0 }) {}

       async load(modelUrl: string, animationConfig?: AnimationConfig, onProgress?: LoadProgressCallback): Promise<Object3D> {
              try {
                     if (animationConfig?.animationUrl) {
                            return await this.loadAnimatedModel(modelUrl, animationConfig, onProgress);
                     }
                     return await this.loadStaticModel(modelUrl, onProgress);
              } catch (error) {
                     throw new Error(`MMD model loading failed: ${error.message}`);
              }
       }

       private async loadAnimatedModel(
              modelUrl: string,
              { animationUrl, physics = true }: AnimationConfig,
              onProgress?: LoadProgressCallback
       ): Promise<Object3D> {
              return new Promise((resolve, reject) => {
                     this.mmdLoader.loadWithAnimation(
                            modelUrl,
                            animationUrl,
                            (mmd) => {
                                   const { mesh } = mmd;
                                   this.configureModel(mesh);
                                   this.mmdHelper.add(mesh, {
                                          animation: mmd.animation,
                                          physics
                                   });
                                   this.scene.add(mesh);
                                   resolve(mesh);
                            },
                            (xhr) => onProgress?.(xhr.loaded / xhr.total),
                            (error) => reject(error)
                     );
              });
       }

       private async loadStaticModel(modelUrl: string, onProgress?: LoadProgressCallback): Promise<Object3D> {
              return new Promise((resolve, reject) => {
                     this.mmdLoader.load(
                            modelUrl,
                            (model) => {
                                   this.configureModel(model);
                                   this.scene.add(model);
                                   resolve(model);
                            },
                            (xhr) => onProgress?.(xhr.loaded / xhr.total),
                            (error) => reject(error)
                     );
              });
       }

       private configureModel(model: Object3D) {
              model.position.set(this.defaultPosition.x, this.defaultPosition.y, this.defaultPosition.z);
       }
}

class GltfModelLoader {
       private readonly gltfLoader = new GLTFLoader();

       constructor(private readonly scene: Scene, private readonly defaultPosition = { x: 0, y: 0, z: 0 }) {}

       async load(modelUrl: string, onProgress?: LoadProgressCallback): Promise<Object3D> {
              return new Promise((resolve, reject) => {
                     this.gltfLoader.load(
                            modelUrl,
                            (gltf) => {
                                   const model = gltf.scene;
                                   model.position.set(this.defaultPosition.x, this.defaultPosition.y, this.defaultPosition.z);
                                   this.scene.add(model);
                                   resolve(model);
                            },
                            (xhr) => onProgress?.(xhr.loaded / xhr.total),
                            (error) => reject(error)
                     );
              });
       }
}

export class ModelLoader {
       private readonly mmdLoader: MmdModelLoader;
       private readonly gltfLoader: GltfModelLoader;

       constructor(private readonly scene: Scene, private readonly camera: PerspectiveCamera) {
              this.mmdLoader = new MmdModelLoader(scene);
              this.gltfLoader = new GltfModelLoader(scene);
              this.initializeSceneLighting();
       }

       static async create(scene: Scene, camera: PerspectiveCamera): Promise<ModelLoader> {
              await PhysicsInitializer.initialize();
              return new ModelLoader(scene, camera);
       }

       private initializeSceneLighting() {
              const ambientLight = new AmbientLight(0xffffff, 1.5);
              this.scene.add(ambientLight);
       }

       async loadModel(modelUrl: string, options: ModelLoaderOptions = {}, animationConfig?: AnimationConfig): Promise<Object3D> {
              const fileExtension = this.getFileExtension(modelUrl);
              this.validateFileExtension(fileExtension);

              try {
                     let model: Object3D;

                     if (this.isMmdModel(fileExtension)) {
                            model = await this.mmdLoader.load(modelUrl, animationConfig);
                     } else if (this.isGltfModel(fileExtension)) {
                            model = await this.gltfLoader.load(modelUrl);
                     } else {
                            throw new Error(`Unsupported model type: ${fileExtension}`);
                     }

                     this.applyModelOptions(model, options);
                     return model;
              } catch (error) {
                     throw new Error(`Failed to load model: ${error.message}`);
              }
       }

       private getFileExtension(url: string): string {
              return url.split(".").pop()?.toLowerCase() || "";
       }

       private validateFileExtension(extension: string) {
              if (![...MODEL_TYPES.MMD, ...MODEL_TYPES.GLTF].includes(extension as ModelType)) {
                     throw new Error(`Unsupported file format: ${extension}`);
              }
       }

       private isMmdModel(extension: string): boolean {
              return MODEL_TYPES.MMD.includes(extension as any);
       }

       private isGltfModel(extension: string): boolean {
              return MODEL_TYPES.GLTF.includes(extension as any);
       }

       private applyModelOptions(model: Object3D, options: ModelLoaderOptions) {
              if (options.position) {
                     model.position.set(options.position.x, options.position.y, options.position.z);
              }
       }
}
