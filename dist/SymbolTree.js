"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SymbolTree = /** @class */ (function () {
    function SymbolTree(n) {
        this.root = n;
        this.current = this.root;
    }
    SymbolTree.prototype.addBranchNode = function (n) {
        //Maybe refactor to construct a node here
        //Set the parent of new Node
        n.parent = this.current;
        //Add new node to current child list
        this.current.addChild(n);
        //Update current to new node
        this.current = n;
    };
    SymbolTree.prototype.addLeafNode = function (n) {
        n.parent = this.current;
        this.current.addChild(n);
    };
    SymbolTree.prototype.moveCurrentUp = function () {
        //If it has a parent move it up
        if (this.current.parent) {
            this.current = this.current.parent;
        }
    };
    SymbolTree.prototype.toString = function () {
        var result = "";
        function expand(node, depth) {
            for (var id in node.stash) {
                //Indent in
                for (var i = 0; i < depth; i++) {
                    result += "-";
                }
                var v = node.stash[id];
                result += id + " type: " + v.type + " line: " + v.line + "\n";
            }
            if (node.children.length === 0) {
                result += "\n";
            }
            else {
                for (var i = 0; i < node.children.length; i++) {
                    expand(node.children[i], depth + 1);
                }
            }
        }
        expand(this.root, 0);
        return result;
    };
    return SymbolTree;
}());
exports.SymbolTree = SymbolTree;
var SymbolNode = /** @class */ (function () {
    function SymbolNode() {
        this.init = false;
        this.used = false;
        this.stash = {};
        this.children = [];
        this.parent = null;
    }
    SymbolNode.prototype.addChild = function (n) {
        this.children.push(n);
    };
    return SymbolNode;
}());
exports.SymbolNode = SymbolNode;
