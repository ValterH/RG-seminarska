export default class Scene {

    constructor() {
        this.nodes = [];
    }

    addNode(node) {
        this.nodes.push(node);
    }

    traverse(before, after) {
        this.nodes.forEach(node => node.traverse(before, after));
    }

    removeNode(node) {
        var nodes = [];
        for (var i in this.nodes) 
            if (this.nodes[i] != node) nodes.push(this.nodes[i]);
        this.nodes = nodes;
    }

}
