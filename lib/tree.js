const util = require("util");

function Node() {
    this.counts = {
        all: 0
    }
    this.left = null;
    this.right = null;
    this.parent = null;
}

Node.prototype.addNode = function (node, updateCount) {
    if (arguments.length === 1) updateCount = true;
    
    var right = this.right;
    var left = this.left;
    
    if (!left) {
        node.parent = this;
        left = this.left = node;
    } else if (!right) {
        node.parent = this;
        right = this.right = node;
    } else if (left.counts.all > right.counts.all) {
        right.addNode(node, updateCount);
    } else if (right.counts.all <= left.counts.all) {
        left.addNode(node, updateCount);
    }/* else if (this.left.counts.all === this.left.counts.all) {
        if (Math.random() > 0.5) {
            this.right.addNode(node, updateCount);
        } else {
            this.left.addNode(node, updateCount);
        }
    }*/
    if (updateCount) {
        this.updateCount();
    } else {
        if (right) {
            this.counts = {
                all: left.counts.all + right.counts.all
            };
        } else {
            this.counts = {
                all: left.counts.all
            }
        }
    }
}
Node.prototype.updateCount = function (recursive) {
    if (this.left && this.right){
        if (recursive) {
            this.left.updateCount(recursive)
            this.right.updateCount(recursive);
        }
        this.counts = this.sumCount(this.left.counts, this.right.counts);
    } else if (this.right) {
        if (recursive) {
            this.right.updateCount(recursive);
        }
        // this.counts = this.sumCount(this.right.counts);
        this.counts = this.right.counts;
    } else if (this.left) {
        if (recursive) {
            this.left.updateCount(recursive)
        }
        // this.counts = this.sumCount(this.left.counts);
        this.counts = this.left.counts;
    } else if (!this.left && !this.right && !(this instanceof EndNode)) {
        // who call this?
        console.error("doesn't make sense to count without child");
    }
}
Node.prototype.sumCount = function () {
    var newCount = {};
    var counts = Array.prototype.slice.call(arguments, 0);
    var type, value;
    counts.forEach(function (count) {
        for (type in count) {
            if (count.hasOwnProperty(type)) {
                value = Number(count[type]);
                if (isNaN(value)) {
                    console.error('cannot cast type ' + type + ' with value ' + count[type] + ' to number');
                    continue;
                }
                newCount[type] = newCount[type] || 0;
                newCount[type] += value;
            }
        }
    })
    return newCount;
}
Node.prototype.toString = function () {
    return "[Node]";
}
Node.prototype.findOneNode = function (name, isTrue) {
    if (arguments.length < 2) {
        isTrue = true
    };
    
    var leftEmpty, leftAll, leftUsed,
        rightEmpty, rightAll, rightUsed;
    var parent = this;
    
    if (isTrue) {
        while (parent && !(parent instanceof EndNode)) {
            leftUsed = parent.left ? parent.left.counts[name] || 0 : 0;
            rightUsed = parent.right ? parent.right.counts[name] || 0 : 0;
            
            if (leftUsed + rightUsed === 0) {
                parent = null;
                break;
            }
            
            if (Math.random() > leftUsed / (leftUsed + rightUsed)) {
                // right side
                parent = parent.right
                continue;
            } else {
                // left side
                parent = parent.left
                continue;
            }
        }
        return parent;
    } else {
        while (parent && !(parent instanceof EndNode)) {
            leftEmpty = parent.left ? parent.left.counts.all - (parent.left.counts[name] || 0) : 0;
            rightEmpty = parent.right ?parent.right.counts.all - (parent.right.counts[name] || 0) : 0;
            
            if (leftEmpty + rightEmpty === 0) {
                parent = null;
                break;
            }
            
            if (Math.random() > leftEmpty / (leftEmpty + rightEmpty)) {
                // right side
                parent = parent.right
                continue;
            } else {
                // left side
                parent = parent.left
                continue;
            }
        }
        return parent;
    }
}

Node.prototype.findAllNode = function (name, isTrue) {
    if (arguments.length < 2) {
        isTrue = true
    };
    var parents = [this];
    var newParents = null;
    
    var founds = [];
    
    var all, count;
    
    while (parents.length > 0) {
        newParents = [];
        parents.forEach(function (parent) {
            var left = parent.left;
            var right = parent.right;
            
            if (isTrue) {
                if (left && left.counts[name] > 0) {
                    if (left instanceof EndNode) {
                        founds.push(left);
                    } else {
                        newParents.push(left)
                    }
                }
                if (right && right.counts[name] > 0) {
                    if (right instanceof EndNode) {
                        founds.push(right);
                    } else {
                        newParents.push(right)
                    }
                }
            } else {
                if (left) {
                    all = left.counts.all;
                    count = left.counts[name] || 0;
                }
                if (left && all - count > 0) {
                    if (left instanceof EndNode) {
                        founds.push(left);
                    } else {
                        newParents.push(left)
                    }
                }
                if (right) {
                    all = right.counts.all;
                    count = right.counts[name] || 0;
                }
                if (right && all - count > 0) {
                    if (right instanceof EndNode) {
                        founds.push(right);
                    } else {
                        newParents.push(right)
                    }
                }
            }
        })
        parents = newParents;
    }
    return founds;
}
function EndNode() {
    Node.call(this);
    this.counts.all = 1;
}
util.inherits(EndNode, Node);

EndNode.prototype.updateTree = function () {
    var parent = this.parent;
    var updated = false;
    while (parent) {
        updated = true;

        parent.updateCount();
        parent = parent.parent;
    }
    return updated;
}

EndNode.prototype.addNode = function (node, updateCount) {
    if (arguments.length === 1) updateCount = true;
    
    var originalParent = this.parent;
    var newInterNode = new originalParent.constructor;
    newInterNode.parent = originalParent;
    newInterNode.addNode(this, updateCount);
    newInterNode.addNode(node, updateCount);
    this.parent = newInterNode;
    if (originalParent.left === this) {
        originalParent.left = newInterNode;
    } else if (originalParent.right === this) {
        originalParent.right = newInterNode;
    } else {
        throw new Error('something went wrong, it am not child of any one?')
    }
}

EndNode.prototype.setBoolean = function (name, value, willUpdateCount) {
    if (arguments.length < 2) throw new Error('missing field');
    if (null == value) throw new Error('a null ot undefined value');
    if (arguments.length < 3) willUpdateCount = true;
    if (value) {
        this.counts[name] = 1;
    } else {
        delete this.counts[name];
    }
    // this.counts[name] = value ? 1 : 0;
    if (willUpdateCount && this.parent) {
        this.updateTree();
    }
    
}
EndNode.prototype.getBoolean = function (name) {
    return !!this.counts[name]
}

EndNode.prototype.toString = function () {
    return "[EndNode]";
}
EndNode.prototype.updateCount = function () {
    // nooz
}

module.exports.Node = Node;
module.exports.EndNode = EndNode;