import * as THREE from 'three';

export default class Character {
  constructor(scene, loader) {
    this.scene = scene; // Escena de Three.js donde se añadirá el modelo del personaje
    this.loader = loader; // GLTFLoader, usado para cargar modelos GLTF o GLB
    this.character = null; // Referencia al modelo del personaje, se inicializará después de cargarlo
    this.mixer = null; // AnimationMixer para manejar las animaciones del personaje
    this.actions = {}; // Objeto donde se almacenan las animaciones disponibles, identificadas por nombre
  }

  async loadCharacter(path) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          this.character = gltf.scene; // Se guarda el modelo cargado en `character`
          this.character.position.set(0, 0, 0); // Posición inicial del modelo en la escena
          this.character.scale.set(1, 1, 1); // Escala inicial del modelo
          this.scene.add(this.character); // Añadir el modelo a la escena

          // Configurar AnimationMixer para manejar las animaciones del modelo
          this.mixer = new THREE.AnimationMixer(this.character);

          // Recorrer las animaciones disponibles y almacenarlas en `actions`
          gltf.animations.forEach((clip) => {
            this.actions[clip.name] = this.mixer.clipAction(clip);
          });

          resolve(this.character); // Resolver la promesa cuando el modelo está completamente cargado
        },
        undefined,
        (error) => reject(error) // Rechazar la promesa si ocurre un error al cargar el modelo
      );
    });
  }

  playAnimation(name) {
    if (this.actions[name]) {
      this.actions[name].reset().play();
    } else {
      console.warn(`La animación "${name}" no está disponible.`);
    }
  }

  stopAllAnimations() {
    Object.values(this.actions).forEach((action) => action.stop());
  }

  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta); // Actualizar las animaciones en cada frame
    }
  }
}
