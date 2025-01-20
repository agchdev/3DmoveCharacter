import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ORDEN DE EJECUCIÓN
        // 1. Configurar la escena
        //     1.1. Configurar la cámara
        //     1.2. Configurar el renderizador
        //     1.3. Configurar la iluminación
        // 2. Cargar el modelo 3D
        // 3. Renderizar la escena
        // Aplicar el fondo generado

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, // Es el campo de visión
  window.innerWidth / window.innerHeight, // Relación de aspecto
  0.1, // Distancia mínima
  1000 // Distancia máxima
);
const renderer  = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000000, 0); // Color de fondo transparente
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Añadir iluminación
const ambientLight = new THREE.AmbientLight(0xffffff, .5); // Luz ambiente
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 10); // Luz puntual
//Agregar radio de la luz
pointLight.distance = 30; // Distancia de la luz
scene.add(pointLight); // Agregar la luz puntual a la escena

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Suaviza el movimiento

// Cargar modelos 3D
const loader = new GLTFLoader();
const AnimationMixer = new THREE.AnimationMixer(scene); // AnimationMixer para las animaciones

loader.load( '../models/me.glb', function (gltf) {
  character = gltf.scene;
  character.position.set(0, 0, 0);
  scene.add(character);
});

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

function animate() {
	renderer.render( scene, camera );
}
requestAnimationFrame( animate );
