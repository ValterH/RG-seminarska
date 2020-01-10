import Mesh from './Mesh.js';

import Node from './Node.js';
import Model from './Model.js';
import Camera from './Camera.js';

import Scene from './Scene.js';

export default class SceneBuilder {

    constructor(spec) {
        this.spec = spec;
    }

    createNode(spec) {
        switch (spec.type) {
            case 'camera': return new Camera(spec);
            case 'model': {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                return new Model(mesh, texture, spec);
            }
            default: return new Node(spec);
        }
    }

    build() {
        var i = 0;
        let scene = new Scene();
        this.spec.nodes.forEach(spec => {
            scene.addNode(this.createNode(spec))
            if (spec.pill) {
                scene.nodes[i].pill = true;
                scene.nodes[i].color = spec.texture;
            } else if(spec.movable) scene.nodes[i].movable = true;
            else scene.nodes[i].movable = false;
            i++;
        });
        return scene;
    }

}
