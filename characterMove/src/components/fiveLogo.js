import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class FiveLogo {
  constructor(scene, loader) {
    this.scene = scene; // Escena de Three.js donde se añadirá el modelo
    this.loader = loader || new GLTFLoader(); // GLTFLoader, usado para cargar modelos GLTF o GLB
    this.model = null; // Referencia al modelo cargado
    this.mixers = {}; // Objeto para manejar AnimationMixers por objeto
  }

  async loadModel(
    path,
    position = { x: 0, y: 0, z: 0 },
    scale = { x: 1, y: 1, z: 1 },
    rotation = { x: 0, y: 0, z: 0 }
  ) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          this.model = gltf.scene;

          // Configurar posición, escala y rotación del modelo
          this.model.position.set(position.x, position.y, position.z);
          this.model.scale.set(scale.x, scale.y, scale.z);
          this.model.rotation.set(rotation.x, rotation.y, rotation.z);

          // Añadir el modelo a la escena
          this.scene.add(this.model);

          // Configurar AnimationMixers específicos para cada objeto y animación
          const animationsMap = {
            'Vderecha': 'rotationDere',
            'Vizquierda': 'rotationIzq',
          };

          Object.keys(animationsMap).forEach((objectName) => {
            const clipName = animationsMap[objectName];
            const object = this.model.getObjectByName(objectName); // Buscar el objeto por nombre

            if (object) {
              const clip = gltf.animations.find((c) => c.name === clipName); // Buscar el clip por nombre
              if (clip) {
                const mixer = new THREE.AnimationMixer(object);
                this.mixers[objectName] = mixer;

                const action = mixer.clipAction(clip);
                action.loop = THREE.LoopRepeat; // Repetir la animación en bucle
                action.play(); // Iniciar la animación
              } else {
                console.warn(`No se encontró la animación "${clipName}" para el objeto "${objectName}"`);
              }
            } else {
              console.warn(`No se encontró el objeto "${objectName}" en el modelo`);
            }
          });

          resolve(this.model);
        },
        undefined,
        (error) => {
          console.error('Error al cargar el modelo:', error);
          reject(error);
        }
      );
    });
  }

  update(delta) {
    // Actualizar todos los mixers en cada frame
    Object.values(this.mixers).forEach((mixer) => {
      mixer.update(delta);
    });
  }

  setPosition(x, y, z) {
    if (this.model) {
      this.model.position.set(x, y, z);
    }
  }

  setScale(x, y, z) {
    if (this.model) {
      this.model.scale.set(x, y, z);
    }
  }

  setRotation(x, y, z) {
    if (this.model) {
      this.model.rotation.set(x, y, z);
    }
  }
}
