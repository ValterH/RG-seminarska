import Application from '../common/Application.js';

import Renderer from './Renderer.js';
import Physics from './Physics.js';
import Camera from './Camera.js';
import SceneLoader from './SceneLoader.js';
import SceneBuilder from './SceneBuilder.js';

var SCENE = './scenes/scene.json';
class App extends Application {

    start() {
        const gl = this.gl;

        this.renderer = new Renderer(gl);
        this.time = Date.now();
        this.startTime = this.time;
        this.aspect = 1;
        this.pill = -1;

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);

        this.load(SCENE);
        this.resize();
    }

    async load(uri) {
        const scene = await new SceneLoader().loadScene(SCENE);
        const builder = new SceneBuilder(scene);
        this.scene = builder.build();
        this.physics = new Physics(this.scene);
        this.builder = builder;

        // Find first camera.
        this.camera = null;
        this.scene.traverse(node => {
            if (node instanceof Camera) {
                this.camera = node;
            }
        });

        this.camera.aspect = this.aspect;
        this.camera.updateProjection();
        this.renderer.prepare(this.scene);
    }

    enableCamera() {
        this.canvas.requestPointerLock();
    }

    pointerlockchangeHandler() {
        if (!this.camera) {
            return;
        }

        if (document.pointerLockElement === this.canvas) {
            this.camera.enable();
        } else {
            this.camera.disable();
        }
    }

    update() {
        const t = this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;
        var interacting = false;

        if (this.camera) {
            interacting = this.camera.update(dt, this.scene, this.pill, this.gl);
        }


        if (this.physics) {
            var p = this.physics.update(dt, this.pill, interacting);
            if(p > -1) this.pill = p;
        }
        
        if(this.pill == 1) {
            bluepill(this.pill);
            this.start();
        }
    }

    render() {
        if (this.scene) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.aspect = w / h;
        if (this.camera) {
            this.camera.aspect = this.aspect;
            this.camera.updateProjection();
        }
    }

}


document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    new App(canvas);
});

document.addEventListener("keydown", pause);

function pause(e) {

    if(e.key === "p"){
        var item = document.getElementById("pause");
        if(item.style.display === "block") {
            var canvas = document.getElementById("canvas");
            canvas.requestPointerLock();
            item.style.display = "none";
        } else {
            item.style.display = "block";
            document.exitPointerLock();
        }
    } else if(e.key === "Enter") {
        if (document.getElementById("start").style.display === "none") return;
        var canvas = document.getElementById("canvas");
        canvas.requestPointerLock();
        document.getElementById("start").style.display = "none";
    }
}

function bluepill(pill) {
    SCENE = './scenes/bluepill.json';
    prompt = document.getElementById("start");
    prompt.innerHTML = '<a href="javascript:start()"><div class="menu-item"><h2>YOU CHOSE THE BLUE PILL</h2><h2>PRESS ENTER TO CONTINUE</h2></div></a>';
    prompt.style.display = "block";
}






