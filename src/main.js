import "./style.css";

import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";


// ======================================================
// SCENE
// ======================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x090909);


// ======================================================
// CAMERA
// ======================================================

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 1.2, 6);


// ======================================================
// RENDERER
// ======================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.2;


// ======================================================
// ADD CANVAS
// ======================================================

document.getElementById("app").appendChild(
    renderer.domElement
);


// ======================================================
// ORBIT CONTROLS
// ======================================================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;

controls.dampingFactor = 0.05;

controls.enablePan = false;

controls.minDistance = 3.5;

controls.maxDistance = 8;

controls.minPolarAngle = Math.PI * 0.25;

controls.maxPolarAngle = Math.PI * 0.75;

controls.target.set(0, 0, 0);


// ======================================================
// LIGHTING
// ======================================================

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1.0
);

scene.add(ambientLight);


// Red key light

const keyLight = new THREE.DirectionalLight(
    0xff3333,
    4
);

keyLight.position.set(
    5,
    5,
    5
);

scene.add(keyLight);


// Blue fill light

const fillLight = new THREE.DirectionalLight(
    0x3355ff,
    1.5
);

fillLight.position.set(
    -5,
    2,
    -5
);

scene.add(fillLight);


// Red atmospheric light

const rimLight = new THREE.PointLight(
    0xff0000,
    40,
    20
);

rimLight.position.set(
    0,
    4,
    -4
);

scene.add(rimLight);


// ======================================================
// WIRE CAGE
// ======================================================

const cageGeometry = new THREE.BoxGeometry(
    3,
    4,
    3
);

const cageEdges = new THREE.EdgesGeometry(
    cageGeometry
);

const cageMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff
});

const cage = new THREE.LineSegments(
    cageEdges,
    cageMaterial
);

scene.add(cage);


// ======================================================
// DRAGON
// ======================================================

let dragon = null;
let mixer = null;
let flyAnimation = null;

const loader = new GLTFLoader();

loader.load(
    "/dragon.glb",

    (gltf) => {

        console.log("================================");
        console.log("✅ DRAGON MODEL LOADED");
        console.log("================================");

        dragon = gltf.scene;

        scene.add(dragon);

// --------------------------------------------------
// Animation mixer
// --------------------------------------------------

mixer = new THREE.AnimationMixer(dragon);


        // --------------------------------------------------
        // Find original dimensions
        // --------------------------------------------------

        const originalBox =
            new THREE.Box3().setFromObject(dragon);

        const originalSize =
            new THREE.Vector3();

        originalBox.getSize(originalSize);

        console.log(
            "Original Size:",
            originalSize
        );


        // --------------------------------------------------
        // Calculate scale
        // --------------------------------------------------

        const maxDimension = Math.max(
            originalSize.x,
            originalSize.y,
            originalSize.z
        );

        // Desired dragon size
        const desiredSize = 2.4;

        const scale =
            desiredSize / maxDimension;

        dragon.scale.setScalar(scale);


        // --------------------------------------------------
        // Recalculate bounding box AFTER scaling
        // --------------------------------------------------

        const scaledBox =
            new THREE.Box3().setFromObject(dragon);

        const scaledCenter =
            new THREE.Vector3();

        scaledBox.getCenter(scaledCenter);


        // --------------------------------------------------
        // Center dragon
        // --------------------------------------------------

        dragon.position.sub(
            scaledCenter
        );


        // --------------------------------------------------
        // Position dragon
        // --------------------------------------------------

        dragon.position.y -= 0.3;


        // --------------------------------------------------
        // Rotate dragon
        // --------------------------------------------------

        dragon.rotation.y = Math.PI;


        // --------------------------------------------------
        // Shadows
        // --------------------------------------------------

dragon.traverse((object) => {

    if (object.isMesh) {

        console.log(
            "🟢 MESH:",
            object.name,
            "| Type:",
            object.type,
            "| Parent:",
            object.parent?.name
        );

        object.castShadow = true;
        object.receiveShadow = true;

    }

    if (object.isBone) {

        console.log(
            "🦴 BONE:",
            object.name,
            "| Parent:",
            object.parent?.name
        );

    }

});

        console.log(
            "Applied Scale:",
            scale
        );

console.log(
    "Animations:",
    gltf.animations.length
);

flyAnimation = gltf.animations.find(
    (clip) => clip.name === "Qishilong_fly2"
);

if (flyAnimation) {

    const flyAction =
        mixer.clipAction(flyAnimation);

    flyAction.reset();
    flyAction.play();

    console.log(
        "🪽 Qishilong_fly2 PLAYING"
    );

} else {

    console.warn(
        "⚠️ Qishilong_fly2 not found"
    );

}

gltf.animations.forEach((clip, index) => {

    console.log(
        `🎬 ANIMATION ${index}:`,
        clip.name,
        "| Duration:",
        clip.duration.toFixed(2)
    );

});


// --------------------------------------------------
// Inspect the flying animation
// --------------------------------------------------

// --------------------------------------------------
// Play flying animation
// --------------------------------------------------

    },

    // Loading progress

    (progress) => {

        if (progress.total > 0) {

            const percent =
                (progress.loaded /
                progress.total) *
                100;

            console.log(
                `Dragon loading: ${percent.toFixed(0)}%`
            );

        }

    },

    // Loading error

    (error) => {

        console.error(
            "❌ DRAGON FAILED TO LOAD"
        );

        console.error(error);

    }
);


// ======================================================
// ANIMATION TIMER
// ======================================================

const clock = new THREE.Timer();


// ======================================================
// ANIMATION LOOP
// ======================================================

function animate() {

    requestAnimationFrame(
        animate
    );


    // Update timer

    clock.update();


    const elapsed =
        clock.getElapsed();
    const delta = 
        clock.getDelta();

if (mixer) {

    mixer.update(delta);

}

    // --------------------------------------------------
    // Dragon animation
    // --------------------------------------------------

    if (dragon) {

        // Floating movement

        dragon.position.y =
            -0.3 +
            Math.sin(
                elapsed * 1.2
            ) * 0.08;


        // Slow rotation

        dragon.rotation.y += 0.002;

    }


    // --------------------------------------------------
    // Cage rotation
    // --------------------------------------------------

    cage.rotation.y += 0.002;

    cage.rotation.x += 0.0005;


    // --------------------------------------------------
    // Pulsing red light
    // --------------------------------------------------

    rimLight.intensity =
        40 +
        Math.sin(
            elapsed * 2
        ) * 8;


    // --------------------------------------------------
    // Controls
    // --------------------------------------------------

    controls.update();


    // --------------------------------------------------
    // Render
    // --------------------------------------------------

    renderer.render(
        scene,
        camera
    );

}

animate();


// ======================================================
// RESPONSIVE RESIZE
// ======================================================

function resize() {

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;


    camera.aspect =
        width / height;

    camera.updateProjectionMatrix();


    renderer.setSize(
        width,
        height
    );


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );

}


window.addEventListener(
    "resize",
    resize
);


// Initial resize

resize();