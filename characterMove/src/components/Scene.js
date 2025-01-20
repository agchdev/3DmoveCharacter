import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Character from './components/Character.js'; // Importar la clase Character

export default class Scene {
  constructor(scene, loader) {
    this.scene = scene;
    this.loader = loader;
  }

  loadModel(path) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          this.scene.add(model);
          resolve(model);
        },
        undefined,
        (error) => reject(error)
      );
    });
}

async loadEnvironment(path) {
  try {
    const model = await this.loadModel(path);
    model.position.set(0, 0, 0); // Ajusta la posición del escenario
    return model;
  } catch (error) {
    console.error("Error cargando el escenario:", error);
  }
}
}

