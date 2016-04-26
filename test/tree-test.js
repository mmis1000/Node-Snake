var assert = require('chai').assert;
var MapTree = require('../lib/snake-map-tree');

var size = 64 * 64;

describe('Node', function() {
    var tree;
    var child;
    describe('#spawn', function () {
        it('should spawn a object', function () {
            tree = new MapTree.Node();
            assert.typeOf(tree, 'object');
        });
    });
    describe('#addNode', function () {
        it('should able to add a node', function () {
            child = new MapTree.EndNode;
            tree.addNode(child);
            assert.equal(tree.counts.all, 1)
        });
    });
    describe('#cauculate', function () {
        it('should cauculate the counts according to its child', function () {
            child = new MapTree.EndNode;
            child.setBoolean('flag', true);
            tree.addNode(child);
            assert.equal(tree.counts.flag, 1)
        });
    });
});


describe('SnakeMapNode', function() {
    var tree;
    var child;
    describe('#spawn', function () {
        it('should spawn a object', function () {
            tree = new MapTree.SnakeMapNode();
            assert.typeOf(tree, 'object');
        });
    });
    describe('#addNode', function () {
        it('should able to add a slot', function () {
            child = new MapTree.SnakeMapEndNode;
            child.setUsed();
            child.id = 0;
            tree.addNode(child);
        });
    });
    describe('#cauculate', function () {
        it('should cauculate the used counts according to its child', function () {
            assert.equal(tree.counts.used, 1)
        });
    });
    describe('#add-more', function () {
        it('should add another ' + (size - 2) + ' used slot and 1 unused slot', function () {
            for (var i = 0; i < size - 3; i++) {
                child = new MapTree.SnakeMapEndNode;
                child.setUsed();
                child.id = i + 1;
                tree.addNode(child, false);
            }
            
            child = new MapTree.SnakeMapEndNode;
            child.setUsed(false);
            child.id = 'target';
            tree.addNode(child, false);
            
            child = new MapTree.SnakeMapEndNode;
            child.setUsed();
            tree.addNode(child, false);
            
            tree.updateCount(true)
            assert.equal(tree.counts.all, size)
            assert.equal(tree.counts.used, size - 1)
        });
    });
    describe('#find-empty', function () {
        it('should find the empty slot', function () {
            child = tree.findEmptySlot();
            assert.typeOf(child, 'object');
            assert.equal(child.id, 'target');
        });
    });
    describe('#change-slot', function () {
        it('should able to change a slot to full slot', function () {
            child.counts.used = 1;
            child.updateTree()
            assert.equal(tree.counts.all, size)
            assert.equal(tree.counts.used, size)
        });
    });
    describe('#change-slot', function () {
        it('should able to change a slot to empty slot', function () {
            child.setUsed(false);
            child.updateTree()
            assert.equal(tree.counts.all, size)
            assert.equal(tree.counts.used, size - 1)
        });
    });
    describe('#find-all-slot', function () {
        it('should able to find all slot with given flag', function () {
            var results = tree.findAllNode('used');
            assert.equal(results.length, size - 1)
        });
    });
    describe('#find-all-slot', function () {
        it('should able to find all slot with given flag, again', function () {
            tree.findEmptySlot().setUsed();
            var results = tree.findAllNode('used');
            assert.equal(results.length, size)
        });
    });
    
    
});