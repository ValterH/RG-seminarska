import Utils from './Utils.js';
import Node from './Node.js';
import * as WebGL from './WebGL.js';

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

export default class Camera extends Node {

    constructor(options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);

        this.projection = mat4.create();
        this.updateProjection();

        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};
        this.view = 0;
        this.textures = [];
    }

    updateProjection() {
        mat4.perspective(this.projection, this.fov, this.aspect, this.near, this.far);
    }

    update(dt, scene, pill, gl) {
        var interacting = false;
        const c = this;

        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));
        const fly = vec3.set(vec3.create(),
            0, 3, 0);

        // 1: add movement acceleration
        let acc = vec3.create();

        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }
        var red = pill > -1;
        if(red) {
            // flying
            if (this.keys['Space']) {
                vec3.add(acc, acc, fly);
            }
            if (this.keys['ShiftLeft']) {
                vec3.sub(acc, acc, fly);
            }
            // matrix view
            if(this.keys['KeyM']) {
                this.view = 1;
            } else if (this.view == 1) {
                this.toggleTexture(scene, gl);
                this.view = 0;
            }
            //pick up objects
            if(this.keys['KeyE'])
                this.interacting = true;
            else if(this.interacting) { 
                if(this.children.length == 0)
                    interacting = true;
                else{
                    var child = this.children[0];
                    scene.nodes.push(child);
                    this.removeChild(child);
                    child.scale = child.Oscale;
                    child.transform = child.lastTransform;
                    child.update(child.transform, child.scale);
                }
                this.interacting = false;
            }
        }
        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);
        // 3: if no movement, apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'])
        {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }

        // 4: limit speed
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }
        
        return interacting;
    }

    toggleTexture(scene, gl) {
        if(this.textures.length == 0) {
            var textures = [];
            scene.traverse(node => {
                if(!(node instanceof Camera)) {
                    const image = this.loadImage("../common/images/matrix.jpg");
                    image.then(function(result) {
                        var texture = WebGL.createTexture(gl, {
                                                                image :result,
                                                                min   : gl.NEAREST,
                                                                mag   : gl.NEAREST
                                                            });
                        textures.push({"node": node, "texture":node.gl.texture});
                        node.gl.texture = texture;
                    });
                }
            });
            this.textures = textures;
        } else {
            while(this.textures.length > 0) {
                var item = this.textures.pop();
                item.node.gl.texture = item.texture;
            }
        }
    }

    loadImage(uri) {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', reject);
            image.src = uri;
        });
    }

    enable() {
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable() {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    mousemoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;
        const c = this;

        c.rotation[0] -= dy * c.mouseSensitivity;
        c.rotation[1] -= dx * c.mouseSensitivity;

        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;

        if (c.rotation[0] > halfpi) {
            c.rotation[0] = halfpi;
        }
        if (c.rotation[0] < -halfpi) {
            c.rotation[0] = -halfpi;
        }

        c.rotation[1] = ((c.rotation[1] % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

}

Camera.defaults = {
    aspect           : 1,
    fov              : 1.5,
    near             : 0.01,
    far              : 100,
    velocity         : [0, 0, 0],
    mouseSensitivity : 0.002,
    maxSpeed         : 3,
    friction         : 0.2,
    acceleration     : 20
};
