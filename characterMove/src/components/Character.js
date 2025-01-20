import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Character {
  constructor(scene, loader, mixer) {
    this.scene = scene;
    this.loader = loader;
    this.mixer = mixer; // AnimationMixer para las animaciones
    this.character = null; // Referencia al modelo del personaje
    this.actions = {}; // Animaciones disponibles
  }

  async loadCharacter(path) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          this.character = gltf.scene;
          this.scene.add(this.character);

          // Configurar el AnimationMixer
          this.mixer = new THREE.AnimationMixer(this.character);

          // Cargar animaciones
          gltf.animations.forEach((clip) => {
            const action = this.mixer.clipAction(clip);
            this.actions[clip.name] = action;
          });

          resolve(this.character);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  playAnimation(name) {
    if (this.actions[name]) {
      this.actions[name].reset().play();
    }
  }

  stopAllAnimations() {
    Object.values(this.actions).forEach((action) => action.stop());
  }
}
