"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SyntaxTree = /** @class */ (function () {
    function SyntaxTree(n) {
        this.root = n;
        this.current = this.root;
    }
    SyntaxTree.prototype.addBranchNode = function (n) {
        //Maybe refactor to construct a node here
        //Set the parent of new Node
        n.parent = this.current;
        //Add new node to current child list
        this.current.addChild(n);
        //Update current to new node
        this.current = n;
    };
    SyntaxTree.prototype.addLeafNode = function (n) {
        n.parent = this.current;
        this.current.addChild(n);
    };
    SyntaxTree.prototype.moveCurrentUp = function () {
        //If it has a parent move it up
        if (this.current.parent) {
            this.current = this.current.parent;
        }
    };
    SyntaxTree.prototype.toString = function () {
        var result = "";
        function expand(node, depth) {
            //Add indentation
            for (var i = 0; i < depth; i++) {
                result += "-";
            }
            if (node.children.length === 0) {
                result += "[" + node.name + "]";
                result += "\n";
            }
            else {
                result += "<" + node.name + ">\n";
                for (var i = 0; i < node.children.length; i++) {
                    expand(node.children[i], depth + 1);
                }
            }
        }
        expand(this.root, 0);
        return result;
    };
    SyntaxTree.prototype.clean = function () {
        this.root = this.root.children[0];
    };
    return SyntaxTree;
}());
exports.SyntaxTree = SyntaxTree;
var Node = /** @class */ (function () {
    function Node(n, line, isString) {
        this.name = n;
        this.parent = null;
        this.children = [];
        (line ? this.lineNum = line : undefined);
        (isString ? this.isString = isString : undefined);
    }
    Node.prototype.addChild = function (n) {
        this.children.push(n);
    };
    return Node;
}());
exports.Node = Node;
