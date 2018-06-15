var assert = require('chai').assert;
var MapTree = require('../lib/snake-map-tree');

var size = 64 * 64;

describe('Node', function() {
    var tree;
    var child;
    describe('#spawn', function () {
        it('should spawn a object', function () {
            var tree = new MapTree.Node();
            assert.typeOf(tree, 'object');
        });
    });
    describe('#addNode', function () {
        it('should able to add a node', function () {
            var tree = new MapTree.Node();
            var child = new MapTree.EndNode;
            tree.addNode(child);
            assert.equal(tree.counts.all, 1)
        });
    });
    describe('#replaceNode', function () {
        it('should able to replace a node', function () {
            var tree = new MapTree.Node();
            var childTobeRemoved, child;
            
            childTobeRemoved = new MapTree.EndNode;
            childTobeRemoved.setBoolean('flag', true);
            tree.addNode(childTobeRemoved);
            
            assert.equal(tree.counts.flag, 1)
            
            child = new MapTree.EndNode;
            childTobeRemoved.replaceNode(child)
            
            assert.equal(tree.counts.flag, undefined)
        });
    });
    describe('#cauculate', function () {
        it('should cauculate the counts according to its child', function () {
            var tree = new MapTree.Node();
            var child = new MapTree.EndNode;
            child.setBoolean('flag', true);
            tree.addNode(child);
            assert.equal(tree.counts.flag, 1)
        });
    });
});


describe('SnakeMapNode', function() {
    var child;
    describe('#spawn', function () {
        it('should spawn a object', function () {
            var tree = new MapTree.SnakeMapNode();
            assert.typeOf(tree, 'object');
        });
    });
    describe('#addNode', function () {
        it('should able to add a slot', function () {
            var tree = new MapTree.SnakeMapNode();
            child = new MapTree.SnakeMapEndNode;
            child.setUsed();
            child.id = 0;
            tree.addNode(child);
        });
    });
    describe('#cauculate', function () {
        it('should cauculate the used counts according to its child', function () {
            var tree = new MapTree.SnakeMapNode();
            child = new MapTree.SnakeMapEndNode;
            child.setUsed();
            child.id = 0;
            tree.addNode(child);
            assert.equal(tree.counts.used, 1)
        });
    });
    describe('#add-more', function () {
        it('should add ' + (size - 1) + ' used slot and 1 unused slot, and find empty slot', function () {
            var tree = new MapTree.SnakeMapNode();
            
            for (var i = 0; i < size - 1; i++) {
                child = new MapTree.SnakeMapEndNode;
                child.setUsed();
                child.id = i;
                tree.addNode(child, false);
            }
            
            child = new MapTree.SnakeMapEndNode;
            child.setUsed(false);
            child.id = 'target';
            tree.addNode(child, false);
            
            tree.updateCount(true)
            assert.equal(tree.counts.all, size)
            assert.equal(tree.counts.used, size - 1)
            
            var child = tree.findEmptySlot();
            assert.typeOf(child, 'object');
            assert.equal(child.id, 'target');
            
        });
    });
    describe('#change-slot', function () {
        it('should able to change a slot to full slot', function () {
            var tree = new MapTree.SnakeMapNode();
            
            for (var i = 0; i < size - 1; i++) {
                child = new MapTree.SnakeMapEndNode;
                child.setUsed();
                child.id = i;
                tree.addNode(child, false);
            }
            
            child = new MapTree.SnakeMapEndNode;
            child.setUsed(false);
            child.id = 'target';
            tree.addNode(child, false);
            
            tree.updateCount(true)
            
            var child = tree.findEmptySlot();
            child.counts.used = 1;
            child.updateTree()
            
            assert.equal(tree.counts.all, size)
            assert.equal(tree.counts.used, size)
        });
    });
    describe('#change-slot', function () {
        it('should able to change a slot to empty slot', function () {
            var tree = new MapTree.SnakeMapNode();
            
            for (var i = 0; i < size; i++) {
                child = new MapTree.SnakeMapEndNode;
                child.setUsed();
                child.id = i;
                tree.addNode(child, false);
            }
            
            tree.updateCount(true)
            
            child.setUsed(false);
            assert.equal(tree.counts.all, size)
            assert.equal(tree.counts.used, size - 1)
        });
    });
    describe('#find-all-slot', function () {
        it('should able to find all slot with given flag', function () {
            var tree = new MapTree.SnakeMapNode();
            
            for (var i = 0; i < size - 1; i++) {
                child = new MapTree.SnakeMapEndNode;
                child.setUsed();
                child.id = i;
                tree.addNode(child, false);
            }
            
            child = new MapTree.SnakeMapEndNode;
            child.setUsed(false);
            child.id = 'target';
            tree.addNode(child, false);
            
            tree.updateCount(true)
            
            var results = tree.findAllNode('used');
            assert.equal(results.length, size - 1)
        });
    });
    describe('#find-all-slot', function () {
        it('should able to find all slot with given flag, again', function () {
            var tree = new MapTree.SnakeMapNode();
            
            for (var i = 0; i < size - 1; i++) {
                child = new MapTree.SnakeMapEndNode;
                child.setUsed();
                child.id = i;
                tree.addNode(child, false);
            }
            
            child = new MapTree.SnakeMapEndNode;
            child.setUsed(false);
            child.id = 'target';
            tree.addNode(child, false);
            
            tree.updateCount(true)
            tree.findEmptySlot().setUsed();
        
            var results = tree.findAllNode('used');
            assert.equal(results.length, size)
        });
    });
    
    
});