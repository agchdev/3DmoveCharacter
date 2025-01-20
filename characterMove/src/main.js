import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Character from './components/Character.js';

// ORDEN DE EJECUCIÓN
        // 1. Configurar la escena
        //     1.1. Configurar la cámara
        //     1.2. Configurar el renderizador
        //     1.3. Configurar la iluminación
        // 2. Cargar el modelo 3D
        // 3. Renderizar la escena
        // Aplicar el fondo generado

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x202020); // Fondo gris oscuro

const camera = new THREE.PerspectiveCamera(
  75, // Es el campo de visión
  window.innerWidth / window.innerHeight, // Relación de aspecto
  0.1, // Distancia mínima
  1000 // Distancia máxima
);
camera.position.set(3, 3, 3); // Ajusta según tu necesidad

const renderer  = new THREE.WebGLRenderer({ antialias: true }); // Habilitar antialiasing
renderer.setSize(window.innerWidth, window.innerHeight); // Tamaño de la ventana
document.body.appendChild(renderer.domElement); // Agregar el canvas al documento


// Añadir iluminación
const ambientLight = new THREE.AmbientLight(0xffffff, .5); // Luz ambiente
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 10); // Luz puntual
pointLight.position.set(10, 10, 10); // Posicionar la luz puntual
scene.add(pointLight); // Agregar la luz puntual a la escena

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Suaviza el movimiento
controls.dampingFactor = 0.05;

// Cargar modelos 3D
const loader = new GLTFLoader();
const character = new Character(scene, loader);
let scena; // Referencia al personaje
let mixer; // mixer para las animaciones

loader.load( '/models/scene.glb', function (gltf) {
    scena = gltf.scene;
    scena.position.set(0, 0, 0);
    // scena.scale.set(1, 1, 1); // Ajustar escala del modelo si es necesario
    scene.add(scena);

  },
  undefined,
  (error) => {
    console.error('Error al cargar el modelo:', error);
  }
);

(async () => {
  // Cargar el personaje
  try {
    await character.loadCharacter('/models/me.glb');
    console.log('Animaciones disponibles:', Object.keys(character.actions));

    // Reproducir una animación inicial
    character.playAnimation('idle'); // Asegúrate de que esta animación exista

    // Apuntar la cámara al personaje
    camera.lookAt(character.character.position);
  } catch (error) {
    console.error('Error al cargar el personaje:', error);
  }
})();

// Logica para mover el personaje
let keys = {};

window.addEventListener('keydown', (event) => {
  keys[event.key] = true;

  // Cambiar animaciones según la tecla presionada
  if (event.key === 'w') {
    character.playAnimation('running');
  } else if (event.key === 's') {
    character.character.rotation.y = Math.PI; // Cambia por el nombre de tu animación
  }
});

window.addEventListener('keyup', (event) => {
  keys[event.key] = false;

  // Volver a la animación Idle si no hay movimiento
  if (!keys['w'] && !keys['s'] && !keys['a'] && !keys['d']) {
    character.playAnimation('idle');
  }
});

// Movimiento continuo
function moveCharacter(delta) {
  if (!character.character) return; // Asegúrate de que el personaje esté cargado

  const speed = 5 * delta; // Velocidad de movimiento (ajusta según lo necesites)
  const rotationSpeed = 5 * delta; // Velocidad de rotación

  // Mover hacia adelante
  if (keys['w']) {
    character.character.translateZ(speed); // Mueve hacia adelante en el eje Z
  }

  // Mover hacia atrás
  if (keys['s']) {
    character.character.translateZ(-speed); // Mueve hacia atrás en el eje Z
  }

  // Girar hacia la izquierda
  if (keys['a']) {
    character.character.rotation.y += rotationSpeed; // Gira a la izquierda
  }

  // Girar hacia la derecha
  if (keys['d']) {
    character.character.rotation.y -= rotationSpeed; // Gira a la derecha
  }
}

// Manejar redimensionamiento de ventana
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Animación
const clock = new THREE.Clock(); // Reloj esto sirve para controlar la velocidad de la animación
function animate() {
  const delta = clock.getDelta(); // Obtener el delta de tiempo

  // Actualizar movimiento del personaje
  moveCharacter(delta);

  // Actualizar animaciones del personaje
  character.update(delta);

  controls.update();
	renderer.render( scene, camera ); // Renderiza la escena
  requestAnimationFrame( animate ); // Siguiente frame
}

animate();