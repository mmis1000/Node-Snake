var Node = require("./tree").Node;
var EndNode = require("./tree").EndNode;

var util = require("util");

function SnakeMapNode () {
    Node.call(this);
}
util.inherits(SnakeMapNode, Node);
SnakeMapNode.prototype.findEmptySlot = function findEmptySlot(bool) {
    if (bool == null) bool = true;
    return this.findOneNode('used', !bool);
}
SnakeMapNode.prototype.findAirSlot = function findAirSlot(bool) {
    if (bool == null) bool = true;
    return this.findOneNode('solid', !bool);
}
SnakeMapNode.prototype.findAllEmptySlot = function (isEmpty) {
    if (isEmpty == null) isEmpty = true;
    return this.findAllNode('used', !isEmpty)
}
SnakeMapNode.prototype.findAllAirSlot = function (isAir) {
    if (isAir == null) isAir = true;
    return this.findAllNode('solid', !isAir)
}

SnakeMapNode.prototype.toString = function () {
    return "[SnakeMapNode]";
}
function SnakeMapEndNode() {
    EndNode.call(this);
    this.counts.used = 0;
}
util.inherits(SnakeMapEndNode, EndNode);

SnakeMapEndNode.prototype.setUsed = function (bool, willUpdateCount) {
    if (arguments.length < 2) {
        willUpdateCount = true;
    }
    if (arguments.length === 0) {
        bool = true
    } else {
        bool = !!bool;
    }
    return this.setBoolean('used', bool, willUpdateCount);
}

SnakeMapEndNode.prototype.isUsed = function () {
    return this.getBoolean('used');
}
SnakeMapEndNode.prototype.setSolid = function (bool) {
    if (arguments.length === 0) {
        bool = true
    } else {
        bool = !!bool;
    }
    return this.setBoolean('solid', bool);
}

SnakeMapEndNode.prototype.isSolid = function () {
    return this.getBoolean('solid');
}
SnakeMapEndNode.prototype.toJSON = function () {
    var temp = {};
    for (var i in this) {
        temp[i] = this[i];
    }
    delete temp.parent;
    return temp;
}
SnakeMapEndNode.fromJSON = function (obj) {
    if ('string' === typeof obj) {
        obj = JSON.parse(obj);
    }
    var node = new SnakeMapEndNode;
    for (var i in obj) {
        node[i] = obj[i];
    }
    return node;
}
module.exports.SnakeMapNode = SnakeMapNode;
module.exports.SnakeMapEndNode = SnakeMapEndNode;

module.exports.Node = Node;
module.exports.EndNode = EndNode;