var Node = require("../lib/tree").Node;
var EndNode = require("../lib/tree").EndNode;

var util = require("util");
var treeSize = 10000;

function SnakeMapNode () {
    Node.call(this);
}
util.inherits(SnakeMapNode, Node);
SnakeMapNode.prototype.findEmptySlot = function findEmptySlot() {
    var leftEmpty = this.left ? this.left.counts.all - this.left.counts.used : 0;
    var rightEmpty = this.right ? this.right.counts.all - this.right.counts.used : 0;
    
    if (leftEmpty === 0 && rightEmpty === 0) {
        return null;
    }
    
    if (Math.random() < rightEmpty / (leftEmpty + rightEmpty)) {
        // right
        if (this.right instanceof EndNode) {
            return this.right;
        } else {
            return this.right.findEmptySlot();
        }
    } else {
        // left
        if (this.left instanceof EndNode) {
            return this.left;
        } else {
            return this.left.findEmptySlot();
        }
    }
}

var selected = Math.floor(Math.random() * treeSize);
console.log('id of empty node ' + selected);

var nodes = [];

var tree = new SnakeMapNode();
var temp;

var time = Date.now();
var i = 0;
for (i = 0; i < treeSize; i++) {
    temp = new EndNode();
    nodes.push(temp);
    
    temp.id = i;
    if (i === selected) {
        temp.counts.used = 0
    } else {
        temp.counts.used = 1
    }
    // console.log(temp.counts.used, temp.id);
    
    tree.addNode(temp, false)
}
console.log('build a ' + treeSize + ' element tree used ' + (Date.now() - time) + ' ms');

var time = Date.now();
tree.updateCount(true);
console.log('update tree value used ' + (Date.now() - time) + ' ms');


var time = Date.now();
for (var i = 0; i < 1000000; i++) {
    var result = tree.findEmptySlot();
}
console.log('find a empty element used ' + ((Date.now() - time) / 1000000) + ' ms. result is:');
console.log(result)

var temp = nodes[Math.floor(Math.random() * nodes.length)];

console.log('orginal tree')
console.log(tree);

var time = Date.now();
temp.counts.used = 0;
for (var i = 0; i < 1000; i++) {
    temp.updateTree();
}
console.log('update tree used ' + ((Date.now() - time) / 1000)+ ' ms. result is:');

console.log(tree);