var SnakeMapTree = require("./snake-map-tree");

var SnakeMapNode = SnakeMapTree.SnakeMapNode;
var SnakeMapEndNode = SnakeMapTree.SnakeMapEndNode;
var EventEmitter = require("events").EventEmitter;
var util = require("util");

var assert = require('chai').assert;

function Chunk(width, height, init) {
    assert.typeOf(width, "number");
    assert.typeOf(height, "number");
    if (arguments.length < 3) init = true;
    
    this.width = width;
    this.height = height;
    
    this.tree = new SnakeMapNode;
    this.table = [];
    
    this._ready = false;
    
    if (init) {
        this.init();
    }
}
util.inherits(Chunk, EventEmitter);

Chunk.prototype.addSlot = function (x, y, slot, updateCount) {
    if (arguments.length < 4) updateCount = true;
    
    this.table[x] = this.table[x] || [];
    this.table[x][y] = slot;
    this.tree.addNode(slot, updateCount)
}
Chunk.prototype.init = function () {
    var i, j, node;
    for (i = 0; i < this.width; i++) {
        for (j = 0; j < this.height; j++) {
            node = new SnakeMapEndNode;
            node.x = i;
            node.y = j;
            this.addSlot(i, j, node, false);
        }
    }
    this.tree.updateCount(true);
    this._ready = true;
    this.emit('ready');
}
Chunk.prototype.isReady = function isReady() {
    return this._ready;
}
Chunk.prototype.getSlot = function (x, y) {
    return this.table[x][y];
}
Chunk.prototype.isUsed = function (x, y) {
    return !!this.table[x][y].counts.used;
}
Chunk.prototype.setUsed = function (x, y, status) {
    if (this.table[x][y].isUsed() !== status) {
        this.table[x][y].setUsed(status);
    }
}
Chunk.prototype.findEmptySlot = function (isEmpty) {
    if (arguments.length === 0) isEmpty = true;
    return this.tree.findEmptySlot(isEmpty);
}
Chunk.prototype.findAirSlot = function (isAir) {
    if (arguments.length === 0) isAir = true;
    return this.tree.findAirSlot(isAir);
}
Chunk.prototype.findAllEmptySlot = function (isEmpty) {
    if (arguments.length === 0) isEmpty = true;
    return this.tree.findAllEmptySlot(isEmpty);
}
Chunk.prototype.findAllAirSlot = function (isAir) {
    if (arguments.length === 0) isAir = true;
    return this.tree.findAllAirSlot(isAir);
}
Chunk.prototype.toJSON = function () {
    var result = {};
    result.nodes = this.tree.findAllNode('used', true);
    result.width = this.width;
    result.height = this.height;
    result.x = this.x;
    result.y = this.y;
    return result;
}
Chunk.prototype.freshTree = function () {
    this.tree.updateCount(true);
}
Chunk.fromJSON = function (obj) {
    if ('string' === typeof obj) {
        obj = JSON.parse(obj);
    }
    var chunk = new Chunk(obj.width, obj.height, false);
    chunk.x = obj.x;
    chunk.y = obj.y;
    
    var index = {};
    
    obj.nodes.forEach(function (node) {
        node = SnakeMapEndNode.fromJSON(node);
        index[node.x + ',' + node.y] = node;
    })
    
    var i, j, node;
    for (i = 0; i < chunk.width; i++) {
        for (j = 0; j < chunk.height; j++) {
            node = index[i + ',' + j] || new SnakeMapEndNode;
            node.x = i;
            node.y = j;
            chunk.addSlot(i, j, node, false);
        }
    }
    chunk.tree.updateCount(true);
    chunk._ready = true;
    chunk.emit('ready');
    
    return chunk;
}


function Map (chunkWidth, chunkHeight) {
    this.chunkWidth = chunkWidth;
    this.chunkHeight = chunkHeight;
    this.chunks = {};
}

Map.prototype.getChunk = function(x, y) {
    var chunk = 
        this.chunks[x + ':' + y] || 
        new Chunk(this.chunkWidth, this.chunkHeight);
    chunk.x = x;
    chunk.y = y
    this.chunks[x + ':' + y] = chunk;
    return this.chunks[x + ':' + y];
}
Map.prototype.getChunkIndex = function getChunkIndex(x, y) {
    return {
        x: Math.floor(x / this.chunkWidth),
        y: Math.floor(y / this.chunkHeight)
    }
}
Map.prototype.getChunkSize = function getChunkSize() {
    return {
        width: this.chunkWidth,
        height: this.chunkHeight
    }
}

module.exports.Chunk = Chunk;
module.exports.Map = Map;