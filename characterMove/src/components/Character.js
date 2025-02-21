import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class Character {
  constructor(scene, loader, camera, renderer) {
    this.scene = scene; // Escena de Three.js donde se añadirá el modelo del personaje
    this.loader = loader; // GLTFLoader, usado para cargar modelos GLTF o GLB
    this.camera = camera; // Cámara que seguirá al personaje
    this.character = null; // Referencia al modelo del personaje, se inicializará después de cargarlo
    this.mixer = null; // AnimationMixer para manejar las animaciones del personaje
    this.actions = {}; // Objeto donde se almacenan las animaciones disponibles, identificadas por nombre
    this.keys = {}; // Estado de las teclas presionadas
    this.speed = 5; // Velocidad de movimiento
    this.rotationSpeed = 5 // Velocidad de rotacion

    // Flag para controlar si el usuario está interactuando con la cámara
    this.isCameraInteracting = false;

    // Configurar OrbitControls
    this.controls = new OrbitControls(camera, renderer.domElement);
    this.controls.enableDamping = true; // Suaviza el movimiento
    this.controls.dampingFactor = 0.1;
    this.controls.enablePan = false; // Desactiva el movimiento lateral
    this.controls.minDistance = 2; // Distancia mínima de la cámara
    this.controls.maxDistance = 10; // Distancia máxima de la cámara

    // Detectar interacción con los controles
    this.controls.addEventListener('start', () => {
      this.isCameraInteracting = true;
    });
    this.controls.addEventListener('end', () => {
      this.isCameraInteracting = false;
    });

    // Configurar eventos de teclado
    this.setupKeyboardListeners();
  }

  setupKeyboardListeners() {
    // Manejar teclas presionadas
    window.addEventListener('keydown', (event) => {
      this.keys[event.key] = true;

      if (event.key == 'w') {
        this.playAnimation('running') // Cambiar a la animacion de correr
      } else if (event.key == 's') {
        this.playAnimation('backward') // Aqui irá la animacion de ir hacia atras
      } 
    })

    window.addEventListener('mousedown', (event) => {
      this.keys[event.key] = true;
      if (event.key == 'g') {
        this.playAnimation('dance') // Aqui irá la animacion de ir hacia atras
      }
    })

    // Manejar teclas soltadas
    window.addEventListener('keyup', (event) => {
      this.keys[event.key] = false;

      // Si no hay teclas activas, vuelve a la animación Idle
      if (!this.keys['w'] && !this.keys['s'] && !this.keys['a'] && !this.keys['d']) {
        this.playAnimation('idle'); // Cambiar a animación de reposo
      }
    })
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
      this.stopAllAnimations();
      this.actions[name].reset().play();
    } else {
      console.warn(`La animación "${name}" no está disponible.`);
    }
  }

  stopAllAnimations() {
    Object.values(this.actions).forEach((action) => action.stop());
  }

  handleMovement(delta) {
    if (!this.character) return; // No hacer nada si el modelo no está cargado

    const movementSpeed = this.speed * delta; // Calcular la velocidad de movimiento
    const rotationSpeed = this.rotationSpeed * delta; // Calcular la velocidad de rotación

    // Movimiento hacia adelante
    if (this.keys['w']) {
      this.character.translateZ(movementSpeed); // Mueve hacia adelante en el eje Z
    }

    // Movimiento hacia atrás
    if (this.keys['s']) {
      this.character.translateZ(-movementSpeed); // Mueve hacia atrás en el eje Z
    }

    // Rotación hacia la izquierda
    if (this.keys['a']) {
      this.character.rotation.y += rotationSpeed; // Gira a la izquierda
    }

    // Rotación hacia la derecha
    if (this.keys['d']) {
      this.character.rotation.y -= rotationSpeed; // Gira a la derecha
    }
  }

  updateCamera() {
    if (!this.character) return;

    if (!this.isCameraInteracting) {
      // Configurar el offset de la cámara con respecto al personaje
      const offset = new THREE.Vector3(0, 2, -5);
      const worldOffset = offset.clone().applyQuaternion(this.character.quaternion);
      const cameraPosition = this.character.position.clone().add(worldOffset);

      // Suavizar el movimiento de la cámara hacia la nueva posición
      this.camera.position.lerp(cameraPosition, 0.1);

      // Actualizar el target de OrbitControls al personaje
      this.controls.target.copy(this.character.position);
    }

    // Actualizar los controles
    this.controls.update();
  }

  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta); // Actualizar las animaciones en cada frame
    }

    // Manejar movimiento según las teclas presionadas
    this.handleMovement(delta);
    this.updateCamera(); // Actualizar la cámara en cada frame
  }

}
