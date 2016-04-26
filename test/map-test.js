var assert = require('chai').assert;
var Chunk = require("../lib/map").Chunk;
var Map = require("../lib/map").Map;

var chunkWidth = 64;
var chunkHeight = 64;

describe('Chunk', function() {
    var chunk;
    var slot;
    var json;
    describe('#spawn', function () {
        it('should spawn a object', function () {
            chunk = new Chunk(chunkWidth, chunkHeight);
            assert.typeOf(chunk, 'object');
        });
    });
    describe('#modify', function () {
        it('should set a slot to full', function () {
            chunk.setUsed(0, 0, true);
            assert.equal(chunk.isUsed(0, 0), true)
        });
        it('should set a slot to empty', function () {
            chunk.setUsed(0, 0, false);
            assert.equal(chunk.isUsed(0, 0), false)
        });
    });
    describe('#search', function () {
        it('should find a empty slot', function () {
            slot = chunk.findEmptySlot();
            assert.isNotNull(slot)
            assert.equal(slot.isUsed(), false);
        });
    });
    describe('#modify', function () {
        it('should set all slot to full one by one', function () {
            for (var i = 0; i < chunkWidth * chunkHeight; i++) {
                slot = chunk.findEmptySlot();
                slot.setUsed(true);
            }
            slot = chunk.findEmptySlot();
            assert.isNull(slot)
        });
        it('should set all slot to empty at once', function () {
            var fullSlots = chunk.findAllEmptySlot(false);
            console.log(fullSlots.length);
            fullSlots.forEach(function (slot) {
                // set value without update parent nodes
                slot.setUsed(false, false);
            })
            
            // update tree state
            chunk.freshTree();
            
            slot = chunk.findEmptySlot(false);
            assert.isNull(slot)
        });
        it('should set all slot to full at once', function () {
            var fullSlots = chunk.findAllEmptySlot();
            
            fullSlots.forEach(function (slot) {
                // set value without update parent nodes
                slot.setUsed(true, false);
            })
            
            // update tree state
            chunk.freshTree();
            
            slot = chunk.findEmptySlot();
            assert.isNull(slot)
        });
    });
    describe('#stringfy', function () {
        it('should be able to JSON stringfy the chunk', function () {
            json = JSON.stringify(chunk);
            assert.isNotNull(json)
            var obj = JSON.parse(json);
            assert.typeOf(obj, 'object');
            assert.equal(obj.nodes.length, chunkWidth * chunkHeight);
            assert.equal(obj.width, chunkWidth);
            assert.equal(obj.height, chunkHeight);
        });
    });
    describe('#parse', function () {
        it('should be able to parse the json into original chunk', function () {
            var result = Chunk.fromJSON(json);
            // console.log(result);
            assert.deepEqual(chunk.tree.findAllNode('used').length, result.tree.findAllNode('used').length);
        });
    })
})

describe('Chunk', function() {
    var map;
    var chunk;
    describe('#spawn', function () {
        it('should spawn a object', function () {
            map = new Map(chunkWidth, chunkHeight);
            assert.typeOf(map, 'object');
        });
    })
    describe('#get', function () {
        it('should create a chunk when trying to access', function () {
            chunk = map.getChunk(0, 0);
            assert.typeOf(chunk, 'object');
        });
        it('should return the same chunk when access the same index', function () {
            assert.equal(chunk, map.getChunk(0, 0));
        });
        it('should create anoter chunk when trying to access different index', function () {
            assert.notEqual(chunk, map.getChunk(0, 1));
        });
    })
})