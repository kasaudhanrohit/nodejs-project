(function (w) {
    //There was some issue in JCP posf. They were not handling window message event handler properly. 
    if (w.parent !== w && document.getElementById('boomr-if-as') && document.getElementById('boomr-if-as').nodeName.toLowerCase() === 'script') {
        w = w.parent;
    }

    //Check if CAVNV already defined then return.
    if (w.CAVNV != undefined) return;

    //IE does not support origin. set if does not exit.
    if (!w.location.origin)
        w.location.origin = w.location.protocol + "//" + w.location.host;

    //Increase resource timing buffer.
    if (w.performance) {
        if (typeof w.performance.setResourceTimingBufferSize === "function")
            w.performance.setResourceTimingBufferSize(300);
        else if (typeof w.performance.webkitSetResourceTimingBufferSize === "function")
            w.performance.webkitSetResourceTimingBufferSize(300)
    }

    /*******Since these methods are not available in IE 8 ***************/
    Array.prototype.forEach = Array.prototype.forEach || function (fn, thisArg) {
        for (var z = 0; z < this.length; z++)
            fn.call(thisArg || this, this[z]);
    }
    //some.
    Array.prototype.some = Array.prototype.some || function (fn, thisArg) {
        for (var z = 0; z < this.length; z++)
            if (!!fn.call(thisArg || this, this[z])) return true;
        return false;
    }
    String.prototype.trim = String.prototype.trim || function () {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }

    Function.prototype.bind = Function.prototype.bind || function (oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () { },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP
                    ? this
                    : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        if (this.prototype) {
            // native functions don't have a prototype
            fNOP.prototype = this.prototype;
        }
        fBound.prototype = new fNOP();

        return fBound;
    }

    Object.keys = Object.keys || function () {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function (obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj == null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }

    /*************************Section To Include Libraries*************/

    /**************************Cryptico Library Ends Here**************/

    /**********************StyleRuleObserver************/
    const StyleRuleObserver = (function () {

        var domObserver = null;
        var CSSStyleSheetOrigFn = {
            insertRule: null,
            deleteRule: null,
            replace: null,
            replaceSync: null
        };


        var CSSStyleSheetOrigWrapperFn = {
            insertRule: function (rule, index) {
                if (domObserver) {
                    try {
                        domObserver.addStyleRuleChange(this.ownerNode, NVDOMObserver.STYLE_RULE_ADDED, rule, index);
                    } catch (e) { }

                    CSSStyleSheetOrigFn.insertRule.apply(this, Array.from(arguments));
                }
            },
            deleteRule: function (index) {
                if (domObserver) {
                    try {
                        domObserver.addStyleRuleChange(this.ownerNode, NVDOMObserver.STYLE_RULE_REMOVED, null, index);
                    } catch (e) { }

                    CSSStyleSheetOrigFn.deleteRule.apply(this, Array.from(arguments));
                }
            }
        }

        function hook(name, origObj, wrapperObj, backupObj) {
            backupObj[name] = origObj[name];
            origObj[name] = wrapperObj[name];
        }

        function unhook(name, origObj, backupObj) {
            origObj[name] = backupObj[name];
        }

        return {
            start: function (domOb) {
                domObserver = domOb;

                // Check if alraedy hooked.
                if (CSSStyleSheetOrigFn.insertRule && CSSStyleSheetOrigFn.insertRule == CSSStyleSheetOrigWrapperFn.insertRule) return;

                //update orig fucntion.
                hook('insertRule', CAVNV.window.CSSStyleSheet.prototype, CSSStyleSheetOrigWrapperFn, CSSStyleSheetOrigFn);
                hook('deleteRule', CAVNV.window.CSSStyleSheet.prototype, CSSStyleSheetOrigWrapperFn, CSSStyleSheetOrigFn);
            },
            stop: function () {
                if (CSSStyleSheetOrigFn['insertRule'] == null) return;

                unhook('insertRule', CAVNV.window.CSSStyleSheet.prototype, CSSStyleSheetOrigWrapperFn);
                unhook('deleteRule', CAVNV.window.CSSStyleSheet.prototype, CSSStyleSheetOrigWrapperFn);
            }
        }

    })();


    /****DOMWTCHER2***/
    window.NVDOMObserver = (function () {
        var NodeMap = function () {
            /**
             * @return {undefined}
             */
            function that() {
                /** @type {Array} */
                this.nodes = [];
                /** @type {Array} */
                this.values = [];
            }
            return that.prototype.isIndex = function (str) {
                return +str === str >>> 0;
            }, that.prototype.nodeId = function (object) {
                var next = object[that.ID_PROP];
                return next || (next = object[that.ID_PROP] = that.nextId_++), next;
            }, that.prototype.set = function (elems, dataAndEvents) {
                var i = this.nodeId(elems);
                /** @type {Object} */
                this.nodes[i] = elems;
                /** @type {Object} */
                this.values[i] = dataAndEvents;
            }, that.prototype.get = function (elems) {
                var dom = this.nodeId(elems);
                return this.values[dom];
            }, that.prototype.getNode = function (id) {
                return this.nodes[id];
            }, that.prototype.has = function (elems) {
                return this.nodeId(elems) in this.nodes;
            }, that.prototype.deletera = function (elems) {
                var i = this.nodeId(elems);
                delete this.nodes[i];
                this.values[i] = void 0;
            }, that.prototype.keys = function () {
                /** @type {Array} */
                var nodes = [];
                var nodeId;
                for (nodeId in this.nodes) {
                    if (this.isIndex(nodeId)) {
                        nodes.push(this.nodes[nodeId]);
                    }
                }
                return nodes;
            }, that.ID_PROP = "__ana__", that.nextId_ = 1, that;
        }();

        //expose this globaly.
        window.NodeMap = NodeMap;

        //It is a wrapper over node.
        var NVNode = function () {
            /**
             * @param {Element} node
             * @param {boolean} e
             * @param {boolean} attributes
             * @param {boolean} tag
             * @param {(Function|string)} opt_parent
             * @param {(Function|string)} $0
             * @param {(Function|string)} is_root
             * @param {boolean} more
             * @return {undefined}
             */
            // used to create a new node object taking element as argument
            function Node(node, childlist, attributes, characterdata, oldParentNode, addedNode, attributeOldValue, characterDataOldValue) {
                if ("undefined" == typeof childlist) {
                    /** @type {boolean} */
                    childlist = false;
                }
                if ("undefined" == typeof attributes) {
                    /** @type {boolean} */
                    attributes = false;
                }
                if ("undefined" == typeof characterdata) {
                    /** @type {boolean} */
                    characterdata = false;
                }
                if ("undefined" == typeof oldParentNode) {
                    /** @type {null} */
                    oldParentNode = null;
                }
                if ("undefined" == typeof addedNode) {
                    /** @type {boolean} */
                    addedNode = false;
                }
                if ("undefined" == typeof attributeOldValue) {
                    /** @type {null} */
                    attributeOldValue = null;
                }
                if ("undefined" == typeof characterDataOldValue) {
                    /** @type {null} */
                    characterDataOldValue = null;
                }
                /** @type {Element} */
                this.node = node;
                /** @type {boolean} */
                this.childList = childlist;
                /** @type {boolean} */
                this.attributes = attributes;
                /** @type {boolean} */
                this.characterData = characterdata;
                /** @type {(Function|string)} */
                this.oldParentNode = oldParentNode;
                /** @type {(Function|string)} */
                this.added = addedNode;
                /** @type {(Function|string)} */
                this.attributeOldValues = attributeOldValue;
                /** @type {boolean} */
                this.characterDataOldValue = characterDataOldValue;
                /** @type {boolean} */
                /*this.isCaseInsensitive = this.node.nodeType === Node.ELEMENT_NODE && (this.node instanceof HTMLElement && this.node.ownerDocument instanceof HTMLDocument);*/
                if (this.node.nodeType === Node.ELEMENT_NODE && (this.node instanceof HTMLElement && this.node.ownerDocument instanceof HTMLDocument))
                    this.isCaseInsensitive = true;
                else
                    this.isCaseInsensitive = false;
            }
            //get old value of attribute.
            return Node.prototype.getAttributeOldValue = function (attrName) {
                if (this.attributeOldValues) {
                    if (this.isCaseInsensitive)
                        attrName = attrName.toLowerCase();
                    return this.attributeOldValues[attrName];
                }
                return void 0;
            },
                //Get list of attribute names mutated.
                Node.prototype.getAttributeNamesMutated = function () {
                    /** @type {Array} */
                    var attrs = [];
                    if (!this.attributeOldValues) {
                        return attrs;
                    }
                    var attr;
                    for (attr in this.attributeOldValues) {
                        attrs.push(attr);
                    }
                    return attrs;
                },
                //set old value of mutated attribute. 
                Node.prototype.attributeMutated = function (attrName, attrValue) {
                    /** @type {boolean} */
                    this.attributes = true;
                    this.attributeOldValues = this.attributeOldValues || {};
                    if (!(attrName in this.attributeOldValues)) {
                        this.attributeOldValues[attrName] = attrValue;
                    }
                },
                //set old value of mutated character data.
                Node.prototype.characterDataMutated = function (value) {
                    if (!this.characterData) {
                        /** @type {boolean} */
                        this.characterData = true;
                        /** @type {boolean} */
                        this.characterDataOldValue = value;
                    }
                },
                //removed then update it's oldParentNode.
                Node.prototype.removedFromParent = function (parentNode) {
                    /** @type {boolean} */
                    this.childList = true;
                    //If this node was added then we can not keep track of it's oldParentNode.
                    if (this.added || this.oldParentNode) {
                        /** @type {boolean} */
                        this.added = false;
                    } else {
                        this.oldParentNode = parentNode;
                    }
                },

                Node.prototype.insertedIntoParent = function () {
                    /** @type {boolean} */
                    this.childList = true;
                    /** @type {boolean} */
                    this.added = true;
                },
                Node.prototype.getOldParent = function () {
                    //If childList mutation happened then only parentNode will change else it will be same as previous.
                    if (this.childList) {
                        if (this.oldParentNode) {
                            return this.oldParentNode;
                        }
                        if (this.added) {
                            return null;
                        }
                        //TODO: check in case if node was added and deleted then what will be it's oldParentNode.
                    }
                    return this.node.parentNode;
                },
                Node;
        }();

        //Method to extend an object.
        var __extends = this.__extends || function (d, b) {
            /**
             * @return {undefined}
             */
            function cons() {
                /** @type {Object} */
                this.constructor = d;
            }
            var p;
            for (p in b) {
                if (b.hasOwnProperty(p)) {
                    d[p] = b[p];
                }
            }
            cons.prototype = b.prototype;
            d.prototype = new cons;
        };

        //Tree Change- to record all dom changes.
        var MutationChanges = function (nodeMap) {
            /**
             * @param {Object} token - DOCUMENT
             * @param {Array} mutationRecord - ARRAY OF MUTATION RECORD
             * @return {undefined}
             */
            // MUTATION OBSERVER 
            function mchanges(rootNode, mutationRecord) {
                //This will inherit NodeMap.
                nodeMap.call(this);
                /** @type {Object} */
                this.rootNode = rootNode;
                //nodemap to check if node is currently reachable.
                this.reachableCache = void 0;
                //nodemap to check if node was previously reachable.
                this.wasReachableCache = void 0;
                /** @type {boolean} */
                //will be set if any childlist mutation happened.
                this.anyParentsChanged = false;
                /** @type {boolean} */
                this.anyAttributesChanged = false;
                /** @type {boolean} */
                this.anyCharacterDataChanged = false;
                /** @type {number} */
                var i = 0;
                for (; i < mutationRecord.length; i++) {
                    var mutation = mutationRecord[i];
                    switch (mutation.type) {
                        case "childList":
                            /** @type {boolean} */
                            this.anyParentsChanged = true;
                            /** @type {number} */
                            var j = 0;
                            for (; j < mutation.removedNodes.length; j++) {
                                var node = mutation.removedNodes[j];
                                this.getChange(node).removedFromParent(mutation.target); //
                            }
                            /** @type {number} */
                            j = 0;
                            for (; j < mutation.addedNodes.length; j++) {
                                node = mutation.addedNodes[j];
                                this.getChange(node).insertedIntoParent(); // 
                            }
                            break;
                        case "attributes":
                            /** @type {boolean} */
                            this.anyAttributesChanged = true;
                            var change = this.getChange(mutation.target);
                            change.attributeMutated(mutation.attributeName, mutation.oldValue);
                            break;
                        case "characterData":
                            /** @type {boolean} */
                            this.anyCharacterDataChanged = true;
                            change = this.getChange(mutation.target);
                            change.characterDataMutated(mutation.oldValue);
                    }
                }
            }
            //extend with nodeMap.
            __extends(mchanges, nodeMap);
            mchanges.prototype.getChange = function (elem) {
                var dataAndEvents = this.get(elem);  // this returns node object
                if (!dataAndEvents) {
                    dataAndEvents = new NVNode(elem);
                    this.set(elem, dataAndEvents);
                }

                return dataAndEvents;
            }
            mchanges.prototype.getOldParent = function (node) {
                var change = this.get(node);
                if (change)
                    return change.getOldParent();
                return node.parentNode;
            }
            mchanges.prototype.getIsReachable = function (elem) {
                //root node or document node is alwasys reachable. 

                if (elem === this.rootNode || (elem && elem.nodeType == elem.DOCUMENT_NODE)) {
                    return true;
                }
                if (!elem) {
                    return false;
                }
                this.reachableCache = this.reachableCache || new NodeMap;
                var reachable = this.reachableCache.get(elem);
                if (reachable == void 0) {
                    reachable = this.getIsReachable(elem.parentNode);
                    this.reachableCache.set(elem, reachable);
                }
                return reachable;
            }
            mchanges.prototype.getWasReachable = function (elem) {
                if (elem === this.rootNode || (elem && elem.nodeType == elem.DOCUMENT_NODE)) {
                    return true;
                }
                if (!elem) {
                    return false;
                }
                this.wasReachableCache = this.wasReachableCache || new NodeMap;
                var wasReachable = this.wasReachableCache.get(elem);
                if (void 0 === wasReachable) {
                    wasReachable = this.getWasReachable(this.getOldParent(elem));
                    this.wasReachableCache.set(elem, wasReachable);
                }
                return wasReachable;
            }
            mchanges.prototype.reachabilityChange = function (owner) {
                if (this.getIsReachable(owner)) {
                    if (this.getWasReachable(owner))
                        return 2;
                    else
                        return 1;
                }
                else {
                    if (this.getWasReachable(owner))
                        return 5;
                    else
                        return 0;
                }

            }
            return mchanges;
        }(NodeMap);

        var ChildListChange = function () {
            /**
             * @return {undefined}
             */
            function childListChange() {
                this.added = new NodeMap;
                this.removed = new NodeMap;
                this.maybeMoved = new NodeMap;
                this.oldPrevious = new NodeMap;
                this.moved = void 0;
            }
            return childListChange;
        }();

        var MutationProjection = function () {
            /**
             * @param {?} rootNode
             * @param {?} mutations
             * @param {string} selectors
             * @param {?} calcReordered
             * @param {?} calcOldPreviousSibling
             * @return {undefined}
             */
            function mProjection(rootNode, mutations, selectors, calcReordered, calcOldPreviousSibling) {
                this.rootNode = rootNode;
                this.mutations = mutations;
                /** @type {string} */
                //filter element.
                this.selectors = selectors;
                this.calcReordered = calcReordered;
                this.calcOldPreviousSibling = calcOldPreviousSibling;
                this.MutationChanges = new MutationChanges(rootNode, mutations);
                /** @type {Array} */
                this.entered = [];
                /** @type {Array} */
                this.exited = [];
                this.stayedIn = new NodeMap;
                this.visited = new NodeMap;
                this.childListChangeMap = void 0;
                this.characterDataOnly = void 0;
                this.matchCache = void 0;
                this.processMutations();
            }

            mProjection.prototype.processMutations = function () {
                if (this.MutationChanges.anyParentsChanged || this.MutationChanges.anyAttributesChanged) {
                    var nodes = this.MutationChanges.keys();
                    /** @type {number} */
                    var i = 0;
                    for (; i < nodes.length; i++) {
                        this.visitNode(nodes[i], void 0);
                    }
                }
            }
            mProjection.prototype.visitNode = function (node, flag) {
                if (!this.visited.has(node)) {
                    this.visited.set(node, true);
                    var change = this.MutationChanges.get(node); // this agian gives the node object with all detail of that element
                    /** @type {number} */
                    var root = flag;
                    if (change && change.childList || void 0 == root)
                        root = this.MutationChanges.reachabilityChange(node);

                    //If 
                    if (0 !== root) {
                        if (1 === root) {
                            this.entered.push(node);
                        } else {
                            if (5 === root) {
                                this.exited.push(node);
                                this.ensureHasOldPreviousSiblingIfNeeded(node);
                            } else {
                                if (2 === root) {
                                    /** @type {number} */
                                    var dataAndEvents = 2;
                                    if (change) {
                                        if (change.childList) {
                                            if (change.oldParentNode !== node.parentNode) {
                                                /** @type {number} */
                                                dataAndEvents = 3;
                                                this.ensureHasOldPreviousSiblingIfNeeded(node);
                                            } else {
                                                //This will be enabled in our case. because we are applying mutation on all elements.
                                                if (this.calcReordered) {
                                                    if (this.wasReordered(node)) {
                                                        /** @type {number} */
                                                        dataAndEvents = 4;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    this.stayedIn.set(node, dataAndEvents);
                                }
                            }
                        }
                        if (2 !== root) {
                            var curNode = node.firstChild;
                            for (; curNode; curNode = curNode.nextSibling) {
                                this.visitNode(curNode, root);
                            }
                        }
                    }
                }
            }
            mProjection.prototype.ensureHasOldPreviousSiblingIfNeeded = function (elem) {
                if (this.calcOldPreviousSibling) {
                    this.processChildlistChanges();
                    var ret = elem.parentNode;
                    var element = this.MutationChanges.get(elem);
                    if (element) {
                        if (element.oldParentNode) {
                            ret = element.oldParentNode;
                        }
                    }
                    var dataAndEvents = this.childListChangeMap.get(ret);
                    if (!dataAndEvents) {
                        dataAndEvents = new ChildListChange;
                        this.childListChangeMap.set(ret, dataAndEvents);
                    }
                    if (!dataAndEvents.oldPrevious.has(elem)) {
                        dataAndEvents.oldPrevious.set(elem, elem.previousSibling);
                    }
                }
            }, mProjection.prototype.getChanged = function (summary, selectors, dataAndEvents) {
                /** @type {string} */
                this.selectors = selectors;
                /** @type {Function} */
                this.characterDataOnly = dataAndEvents;
                /** @type {number} */
                var i = 0;
                for (; i < this.entered.length; i++) {
                    var elem = this.entered[i];
                    summary.added.push(elem);
                }
                var codeSegments = this.stayedIn.keys();
                /** @type {number} */
                i = 0;
                for (; i < codeSegments.length; i++) {
                    elem = codeSegments[i];
                    if (summary.reparented || summary.reordered) {
                        var hasBody = this.stayedIn.get(elem);
                        if (summary.reparented && 3 === hasBody) {
                            summary.reparented.push(elem);
                        } else {
                            if (summary.reordered) {
                                if (4 === hasBody) {
                                    summary.reordered.push(elem);
                                }
                            }
                        }
                    }
                }
                /** @type {number} */
                i = 0;
                for (; i < this.exited.length; i++) {
                    elem = this.exited[i];
                    summary.removed.push(elem);
                }
            }, mProjection.prototype.getOldParentNode = function (elem) {
                var change = this.MutationChanges.get(elem);
                if (change && change.childList) {
                    return change.oldParentNode ? change.oldParentNode : null;
                }
                var mode = this.MutationChanges.reachabilityChange(elem);
                if (0 === mode || 1 === mode) {
                    throw Error("Invalid Reachability Change");
                }
                return elem.parentNode;
            }, mProjection.prototype.getOldPreviousSibling = function (elem) {
                var tmp = elem.parentNode;
                var change = this.MutationChanges.get(elem);
                if (change) {
                    if (change.oldParentNode) {
                        tmp = change.oldParentNode;
                    }
                }
                var clmap = this.childListChangeMap.get(tmp);
                if (!clmap) {
                    throw Error("childList change map");
                }
                return tasks.oldPrevious.get(elem);
            }, mProjection.prototype.getOldAttribute = function (node, err) {
                var def = this.MutationChanges.get(node);
                if (!def || !def.attributes) {
                    throw Error("Invalid attribute");
                }
                var shouldFail = def.getAttributeOldValue(err);
                if (void 0 === shouldFail) {
                    throw Error("Invalid Attribute");
                }
                return shouldFail;
            }, mProjection.prototype.attributeChangedNodes = function (data) {
                if (!this.MutationChanges.anyAttributesChanged) {
                    return {};
                }
                var extended;
                var methods;
                if (data) {
                    extended = {};
                    methods = {};
                    /** @type {number} */
                    var i = 0;
                    for (; i < data.length; i++) {
                        var method = data[i];
                        /** @type {boolean} */
                        extended[method] = true;
                        methods[method.toLowerCase()] = method;
                    }
                }
                var collection = {};
                var codeSegments = this.MutationChanges.keys();
                /** @type {number} */
                i = 0;
                for (; i < codeSegments.length; i++) {
                    var node = codeSegments[i];
                    var elem = this.MutationChanges.get(node);
                    if (elem.attributes && 2 === this.MutationChanges.reachabilityChange(node)) {
                        var el = node;
                        var events = elem.getAttributeNamesMutated();
                        /** @type {number} */
                        var e = 0;
                        for (; e < events.length; e++) {
                            method = events[e];
                            if (!extended || (extended[method] || elem.isCaseInsensitive && methods[method])) {
                                var expectation = elem.getAttributeOldValue(method);
                                if (expectation !== el.getAttribute(method)) {
                                    if (methods) {
                                        if (elem.isCaseInsensitive) {
                                            method = methods[method];
                                        }
                                    }
                                    collection[method] = collection[method] || [];
                                    collection[method].push(el);
                                }
                            }
                        }
                    }
                }
                return collection;
            }, mProjection.prototype.getOldCharacterData = function (elem) {
                var change = this.MutationChanges.get(elem);
                if (!change || !change.characterData) {
                    throw Error("CharacterData change not occured");
                }
                return options.characterDataOldValue;
            }, mProjection.prototype.getCharacterDataChanged = function () {
                if (!this.MutationChanges.anyCharacterDataChanged) {
                    return [];
                }
                var codeSegments = this.MutationChanges.keys();
                /** @type {Array} */
                var acc = [];
                /** @type {number} */
                var i = 0;
                for (; i < codeSegments.length; i++) {
                    var node = codeSegments[i];
                    if (2 === this.MutationChanges.reachabilityChange(node)) {
                        var options = this.MutationChanges.get(node);
                        if (options.characterData) {
                            if (node.textContent != options.characterDataOldValue) {
                                acc.push(node);
                            }
                        }
                    }
                }
                return acc;
            },

                mProjection.prototype.getChildlistChange = function (elem) {
                    var clchange = this.childListChangeMap.get(elem);
                    if (!clchange) {
                        clchange = new ChildListChange;
                        this.childListChangeMap.set(elem, clchange);
                    }
                    return clchange;
                }, mProjection.prototype.processChildlistChanges = function () {
                    /**
                     * @param {Object} elem
                     * @param {Object} node
                     * @return {undefined}
                     */
                    function recordOldPrevious(elem, node) {
                        if (!!elem) {
                            if (!change.oldPrevious.has(elem)) {
                                if (!change.added.has(elem)) {
                                    if (!change.maybeMoved.has(elem)) {
                                        if (!(node && (change.added.has(node) || change.maybeMoved.has(node)))) {
                                            change.oldPrevious.set(elem, node);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!this.childListChangeMap) {
                        this.childListChangeMap = new NodeMap;
                        /** @type {number} */
                        var i = 0;
                        for (; i < this.mutations.length; i++) {
                            var mutation = this.mutations[i];
                            if ("childList" == mutation.type && (2 === this.MutationChanges.reachabilityChange(mutation.target) || this.calcOldPreviousSibling)) {
                                var change = this.getChildlistChange(mutation.target);
                                var oldPrevious = mutation.previousSibling;
                                /** @type {number} */
                                var j = 0;
                                for (; j < mutation.removedNodes.length; j++) {
                                    var elem = mutation.removedNodes[j];
                                    recordOldPrevious(elem, oldPrevious);
                                    if (change.added.has(elem)) {
                                        change.added.deletera(elem);
                                    } else {
                                        change.removed.set(elem, true);
                                        change.maybeMoved.deletera(elem);
                                    }
                                    oldPrevious = elem;
                                }
                                recordOldPrevious(mutation.nextSibling, oldPrevious);
                                /** @type {number} */
                                j = 0;
                                for (; j < mutation.addedNodes.length; j++) {
                                    var ele = mutation.addedNodes[j];
                                    if (change.removed.has(ele)) {
                                        change.removed.deletera(ele);
                                        change.maybeMoved.set(ele, true);
                                    } else {
                                        change.added.set(ele, true);
                                    }
                                }
                            }
                        }
                    }
                }, mProjection.prototype.wasReordered = function (elem) {
                    /**
                     * @param {Object} node
                     * @return {?}
                     */
                    function isMoved(node) {
                        if (!node) {
                            return false;
                        }
                        if (!change.maybeMoved.has(node)) {
                            return false;
                        }
                        var dataAndEvents = change.moved.get(node);
                        if (void 0 !== dataAndEvents)
                            return dataAndEvents;

                        if (visited.has(node))
                            dataAndEvents = true;
                        else {
                            visited.set(node, true);
                            dataAndEvents = getPrevious(node) !== getOldPrevious(node);
                        }

                        if (visited.has(node)) {
                            visited.deletera(node);
                            change.moved.set(node, dataAndEvents);
                        }
                        else
                            dataAndEvents = change.moved.get(node);

                        return dataAndEvents;
                    }
                    /**
                     * @param {Object} elem
                     * @return {?}
                     */
                    function getOldPrevious(elem) {
                        var node = data_user.get(elem);
                        if (void 0 !== node) {
                            return node;
                        }
                        node = change.oldPrevious.get(elem);
                        for (; node && (change.removed.has(node) || isMoved(node));) {
                            node = getOldPrevious(node);
                        }
                        if (node === void 0)
                            node = elem.previousSibling;
                        data_user.set(elem, node);
                        return node;
                    }
                    /**
                     * @param {Object} elem
                     * @return {?}
                     */
                    function getPrevious(elem) {
                        if (api.has(elem)) {
                            return api.get(elem);
                        }
                        var node = elem.previousSibling;
                        for (; node && (change.added.has(node) || isMoved(node));) {
                            node = node.previousSibling;
                        }
                        api.set(elem, node);
                        return node;
                    }
                    if (!this.MutationChanges.anyParentsChanged) {
                        return false;
                    }
                    this.processChildlistChanges();
                    var tmp = elem.parentNode;
                    var hasBody = this.MutationChanges.get(elem);
                    if (hasBody) {
                        if (hasBody.oldParentNode) {
                            tmp = hasBody.oldParentNode;
                        }
                    }
                    var change = this.childListChangeMap.get(tmp);
                    if (!change) {
                        return false;
                    }
                    if (change.moved) {
                        return change.moved.get(elem);
                    }
                    change.moved = new NodeMap;
                    var visited = new NodeMap;
                    var data_user = new NodeMap;
                    var api = new NodeMap;
                    return change.maybeMoved.keys().forEach(isMoved), change.moved.get(elem);
                }
            return mProjection;
        }();

        var MutationResult = function () {
            /**
             * @param {string} projection
             * @param {Object} query
             * @return {undefined}
             */
            function mutationResult(projection, query) {
                var summary = this;
                this.projection = projection;
                this.added = [];
                this.removed = [];
                this.reparented = query.all || query.element ? [] : void 0;
                this.reordered = query.all ? [] : void 0;
                projection.getChanged(this, query.elementFilter, query.characterData);
                if (query.all || (query.attribute || query.attributeList)) {
                    var pdataCur = query.attribute ? [query.attribute] : query.attributeList;
                    var attributeChanged = projection.attributeChangedNodes(pdataCur);
                    if (query.attribute) {
                        this.valueChanged = attributeChanged[query.attribute] || [];
                    } else {
                        this.attributeChanged = attributeChanged;
                        if (query.attributeList) {
                            query.attributeList.forEach(function (attrName) {
                                if (!summary.attributeChanged.hasOwnProperty(attrName)) {
                                    /** @type {Array} */
                                    summary.attributeChanged[attrName] = [];
                                }
                            });
                        }
                    }
                }
                if (query.all || query.characterData) {
                    var valueChanged = projection.getCharacterDataChanged();
                    if (query.characterData) {
                        this.valueChanged = valueChanged;
                    } else {
                        this.characterDataChanged = valueChanged;
                    }
                }
                if (this.reordered) {
                    this.getOldPreviousSibling = projection.getOldPreviousSibling.bind(projection);
                }
            }
            return mutationResult.prototype.getOldParentNode = function (owner) {
                return this.projection.getOldParentNode(owner);
            }, mutationResult.prototype.getOldAttribute = function (node, deepDataAndEvents) {
                return this.projection.getOldAttribute(node, deepDataAndEvents);
            }, mutationResult.prototype.getOldCharacterData = function (owner) {
                return this.projection.getOldCharacterData(owner);
            }, mutationResult.prototype.getOldPreviousSibling = function (owner) {
                return this.projection.getOldPreviousSibling(owner);
            }, mutationResult;
        }();

        //Mutation Observer.
        var MutationSummary = function () {
            /**
             * @param {?} options
             * @return {undefined}
             */
            function MutationSummary(options) {
                var suite = this;
                /** @type {boolean} */
                this.connected = false;
                this.iframes = new MutationSummary.NodeMap;
                var pendingIframes = options.iframes;
                delete options.iframes;

                this.options = MutationSummary.validateOptions(options);
                this.observerOptions = MutationSummary.createObserverOptions(this.options.queries);
                this.root = this.options.rootNode;
                this.callback = this.options.callback;
                this.handler = options.handler || null;
                this.flag = 0;
                /** @type {Array} */
                this.elementFilter = Array.prototype.concat.apply([], this.options.queries.map(function (query) {
                    return query.elementFilter ? query.elementFilter : [];
                }));
                if (!this.elementFilter.length) {
                    this.elementFilter = void 0;
                }
                this.calcReordered = this.options.queries.some(function ($q) {
                    return $q.all;
                });
                /** @type {Array} */
                this.queryValidators = [];
                if (MutationSummary.createQueryValidator) {
                    this.queryValidators = this.options.queries.map(function (query) {
                        return MutationSummary.createQueryValidator(suite.root, query);
                    });
                }
                this.observer = new MutationObserver(function (deepDataAndEvents) {
                    suite.observerCallback(deepDataAndEvents);
                });

                //Add pending iframes. 
                var keys = pendingIframes.keys();
                for (var z = 0; z < keys.length; z++)
                    this.addIframe(keys[z], false);

                this.reconnect();
            }

            MutationSummary.PAUSE_MUTATION = 0x01;
            MutationSummary.PAUSE_TIMEOUT = 300;
            MutationSummary.MAX_ADDED_NODES = 10000;
            MutationSummary.MAX_ADDED_NODES_PAUSE = 100;

            MutationSummary.prototype.addIframe = function (iframe, observe) {
                var iframeDoc = {};
                if (iframe.contentWindow)
                    iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                else
                    iframeDoc = iframe;

                if (observe == undefined)
                    observe = true;
                //Note: we are not checking if already exist just because iframe document have same id as of iframe.
                //And iframe can trigger load event multiple time.
                this.iframes.set(iframeDoc, true);
                //Initialize mutation observer.
                if (observe)
                    this.observer.observe(iframeDoc, this.observerOptions);
                //TODO: check if it is fine to add evnet listener here. 
                CAVUA.updateDOM(iframeDoc);

                if (iframe.contentWindow) {
                    CAVNV.plugins.AjaxMonitor.addIframe(iframe.contentWindow);
                    CAVNV.plugins.ErrorTracing.addIframe(iframe.contentWindow);
                }
            }
            MutationSummary.prototype.removeIframe = function (iframe) {
                this.iframes.deletera(iframe);
            }

            return MutationSummary.createObserverOptions = function (queries) {
                /**
                 * @param {Array} attributes
                 * @return {?}
                 */
                function observeAttributes(attributes) {
                    if (!observerOptions.attributes || variables) {
                        if (observerOptions.attributes = true, observerOptions.attributeOldValue = true, !attributes) {
                            return variables = void 0, void 0;
                        }
                        variables = variables || {};
                        attributes.forEach(function (key) {
                            /** @type {boolean} */
                            variables[key] = true;
                            /** @type {boolean} */
                            variables[key.toLowerCase()] = true;
                        });
                    }
                }
                var variables;
                var observerOptions = {
                    childList: true,
                    subtree: true
                };
                queries.forEach(function (request) {
                    if (request.characterData) {
                        return observerOptions.characterData = true, observerOptions.characterDataOldValue = true, void 0;
                    }
                    if (request.all) {
                        return observeAttributes(), observerOptions.characterData = true, observerOptions.characterDataOldValue = true, void 0;
                    }
                    if (request.attribute) {
                        return observeAttributes([request.attribute.trim()]), void 0;
                    }
                    var attributes = elementFilterAttributes(request.elementFilter).concat(request.attributeList || []);
                    if (attributes.length) {
                        observeAttributes(attributes);
                    }
                });
                if (variables) {
                    observerOptions.attributeFilter = Object.keys(variables);
                }
                return observerOptions;
            }, MutationSummary.validateOptions = function (options) {
                var option;
                for (option in options) {
                    if (!(option in MutationSummary.optionKeys)) {
                        throw Error("Invalid Mutation Observer Option - " + option);
                    }
                }
                if ("function" != typeof options.callback) {
                    throw Error("Callback missing for mutation observer");
                }
                if (!options.queries || !options.queries.length) {
                    throw Error("Mutation query is empty");
                }
                var obj = {
                    /** @type {Function} */
                    callback: options.callback,
                    rootNode: options.rootNode || document,
                    observeOwnChanges: !!options.observeOwnChanges,
                    oldPreviousSibling: !!options.oldPreviousSibling,
                    queries: []
                };
                /** @type {number} */
                var i = 0;
                for (; i < options.queries.length; i++) {
                    var request = options.queries[i];
                    if (request.all) {
                        //Don't consider other values.
                        obj.queries.push({
                            all: true
                        });
                    } else {
                        if ("attribute" in request) {
                            var query = {
                                attribute: validateAttribute(request.attribute)
                            };
                            obj.queries.push(query);
                        } else {
                            //FIXME: currently we are not supporting Element Filter.
                            obj.queries.push({
                                characterData: true
                            });
                            /*
                                            if ("element" in request) {
                                              var cnl = Object.keys(request).length;
                                              query = {
                                                element : request.element,
                                                elementFilter : utils.parseSelectors(request.element)
                                              };
                                              if (request.hasOwnProperty("elementAttributes") && (query.attributeList = validateElementAttributes(request.elementAttributes), cnl--), cnl > 1) {
                                                throw Error("3948327948");
                                              }
                                              obj.queries.push(query);
                                            } else {
                                              if (!request.characterData) {
                                                throw Error("3948327333838939");
                                              }
                                              if (Object.keys(request).length > 1) {
                                                throw Error("394832799487");
                                              }
                                              obj.queries.push({
                                                characterData : true
                                              });
                                            }
                            */
                        }
                    }
                }
                return obj;
            },
                MutationSummary.prototype.createSummaries = function (data) {
                    if (!data || !data.length) {
                        return [];
                    }
                    var mproj = new MutationProjection(this.root, data, this.elementFilter, this.calcReordered, this.options.oldPreviousSibling);
                    /** @type {Array} */
                    var geometries = [];
                    /** @type {number} */
                    var i = 0;
                    for (; i < this.options.queries.length; i++) {
                        geometries.push(new MutationResult(mproj, this.options.queries[i]));
                    }
                    return geometries;
                }, MutationSummary.prototype.checkpointQueryValidators = function () {
                    this.queryValidators.forEach(function (data) {
                        if (dataAndEvents) {
                            dataAndEvents.recordPreviousState();
                        }
                    });
                },
                MutationSummary.prototype.runQueryValidators = function (collection) {
                    this.queryValidators.forEach(function (validator, index) {
                        if (validator) {
                            validator.validate(collection[index]);
                        }
                    });
                },
                MutationSummary.prototype.changesToReport = function (obj) {
                    return obj.some(function (summary) {
                        /** @type {Array} */
                        var summaryProps = ["added", "removed", "reordered", "reparented", "valueChanged", "characterDataChanged"];
                        if (summaryProps.some(function (prop) {
                            return summary[prop] && summary[prop].length;
                        })) {
                            return true;
                        }
                        if (summary.attributeChanged) {
                            /** @type {Array.<string>} */
                            var array = Object.keys(summary.attributeChanged);
                            /** @type {boolean} */
                            var i = array.some(function (attrName) {
                                return !!summary.attributeChanged[attrName].length;
                            });
                            if (i) {
                                return true;
                            }
                        }
                        return false;
                    });
                },
                MutationSummary.getChangeNodesCount = function (mutationRecord) {
                    var nMap = new this.NodeMap;
                    function count(e) {
                        var c = 0;
                        for (var z = 0; z < e.childNodes.length; z++) {
                            //TODO: optimize it further
                            var isCounted = nMap.get(e.childNodes[z]);
                            if (!isCounted) {
                                nMap.set(e.childNodes[z], true);
                                c++;
                                if (e.childNodes[z].childNodes.length)
                                    c += count(e.childNodes[z]);
                            }
                        }
                        return c;
                    }

                    //Note: this will check for addedNode only.
                    var total = 0;
                    for (var z = 0; z < mutationRecord.length; z++) {
                        if (mutationRecord[z].type == 'childList') {
                            for (var y = 0; y < mutationRecord[z].addedNodes.length; y++) {
                                //Sum All the child nodes recursivly. 
                                total += 1;
                                if (mutationRecord[z].addedNodes[y].childNodes.length) {
                                    total += count(mutationRecord[z].addedNodes[y]);
                                }

                            }
                        }
                    }
                    return total;
                },

                //This can be called multiple time.
                MutationSummary.prototype.pauseObserver = function () {
                    this.flag |= MutationSummary.PAUSE_MUTATION;
                    //set a timeout to take the pagedump.
                    var me = this;
                    //if already a timer is running then stop that. 
                    if (this.timer != undefined) {
                        clearTimeout(this.timer);
                        this.timer = undefined;
                    }

                    this.timer = setTimeout(function () {
                        me.resumeObserver();
                    }, MutationSummary.PAUSE_TIMEOUT);
                },

                MutationSummary.prototype.resumeObserver = function () {
                    CAVNV.snapshotInstance++;
                    if (!CAVNV.sid) {
                        CAVNV.pendingSnapshot[CAVNV.snapshotInstance] = CAVNV.plugins.DOMWATCHER2.getDOM(true, true);
                    }
                    else {
                        //unset the flag and send pagedump.
                        CAVNV.send_dom(true, CAVNV.snapshotInstance);
                    }
                    // if android bridge exist then update at native app side.
                    if (!!CAVNV.window.NBridge)
                        CAVNV.window.NBridge.getAppParam(JSON.stringify({ 'snapshotInstance': CAVNV.snapshotInstance.toString() }));
                    if (!!CAVNV.window.webkit && !!CAVNV.window.webkit.messageHandlers.appNativeSync)
                        CAVNV.window.webkit.messageHandlers.appNativeSync.postMessage(JSON.stringify({ 'snapshotInstance': CAVNV.snapshotInstance.toString() }));
                    var mstate = {
                        type: NVDOMObserver.USERACTION_MUTATION,
                        state: NVDOMObserver.EXPECTED_MUTATION
                    }
                    this.handler.queue.push({ m: mstate, t: new Date().getTime(), s: CAVNV.snapshotInstance, d: [[], [], [], []] });
                    //send this record.
                    this.handler.send();
                    //reset the pause flag.
                    this.flag &= ~MutationSummary.PAUSE_MUTATION;
                },

                MutationSummary.prototype.observerCallback = function (mutationRecord) {
                    //TODO: check why we disconnecting, before processing.
                    this.observer.disconnect();

                    //Check for number of changed nodes. 
                    var addedNodes = MutationSummary.getChangeNodesCount(mutationRecord);

                    // If system is paused then compare with MAX_ADDED_NODES_PAUSE else with MAX_ADDED_NODES 
                    if (((this.flag & MutationSummary.PAUSE_MUTATION) != 0 && addedNodes > MutationSummary.MAX_ADDED_NODES_PAUSE)
                        ||
                        (addedNodes > MutationSummary.MAX_ADDED_NODES)) {
                        //Pause the observer and wait for change to be complete and send the snapshot. 
                        this.pauseObserver();
                    }

                    if ((this.flag & MutationSummary.PAUSE_MUTATION) == 0) {
                        var result = this.createSummaries(mutationRecord);
                        //TODO: validate result.
                        if (this.changesToReport(result)) {
                            this.callback(result);
                        }
                    }

                    if (this.connected) {
                        this.observer.observe(this.root, this.observerOptions);
                        //Also add for iframes. 
                        var iframes = this.iframes ? this.iframes.keys() : [];
                        for (var z = 0; z < iframes.length; z++) {
                            this.observer.observe(iframes[z], this.observerOptions);

                        }
                    }
                }, MutationSummary.prototype.reconnect = function () {
                    if (this.connected) {
                        throw Error("Already Connected");
                    }
                    this.observer.observe(this.root, this.observerOptions);
                    //Also add for iframes. 
                    var iframes = this.iframes ? this.iframes.keys() : [];
                    for (var z = 0; z < iframes.length; z++) {
                        this.observer.observe(iframes[z], this.observerOptions);

                    }
                    /** @type {boolean} */
                    this.connected = true;
                }, MutationSummary.prototype.takeSummaries = function () {
                    if (!this.connected) {
                        throw Error("Mutation Observer not connected");
                    }
                    var suiteView = this.createSummaries(this.observer.takeRecords());
                    return this.changesToReport(suiteView) ? suiteView : void 0;
                }, MutationSummary.prototype.disconnect = function () {
                    var takeSummaries = this.takeSummaries();
                    return this.observer.disconnect(), this.connected = false, takeSummaries;
                }, MutationSummary.NodeMap = NodeMap, MutationSummary.optionKeys = {
                    callback: true,
                    queries: true,
                    rootNode: true,
                    oldPreviousSibling: true,
                    observeOwnChanges: true,
                    handler: true
                }, MutationSummary;
        }();




        var NVDOMObserver = function () {
            //TODO: currently some browsers does not support matchesSelector. Provide some polymer.
            function getMatchesSelector() {
                var proto = document.createElement("div");
                return "function" == typeof proto.webkitMatchesSelector ? "webkitMatchesSelector" : "function" == typeof proto.mozMatchesSelector ? "mozMatchesSelector" : "function" == typeof proto.msMatchesSelector ? "msMatchesSelector" : null;
            }

            //This will fill entries in KnowNodes map
            //queries - Observer will be applied on complete dom, But user can specify their query.
            function f(rootNode, filter, queries, sendDom, threshold) {
                var nvdo = this;

                //Some constants.
                this.ENCRYPTED = CAVNV.ENCRYPTED = 1;
                this.ENCODED = CAVNV.ENCODED = 2;
                this.NONE = CAVNV.NONE = 0;
                this.FILTER = 1;
                this.FILTER_ATTR = 2;

                /** @type {Object} */
                this.target = rootNode;
                this.iframes = new MutationSummary.NodeMap;
                /** @type {number} */
                //Note: Nodemap internal id and data(id) is same. 
                //TODO: check if any error.
                this.nextId = 1;
                this.knownNodes = new MutationSummary.NodeMap;
                //Note: this we creating so that we need not to check again and again. 
                //Note: this will keep encrypted Mode values. 0 - none, 1 - encrypted 2 - encoded.
                //this.encryptedNodes = new MutationSummary.NodeMap;
                //TODO: validate this filter.
                this.filter = filter;
                this.matchesSelectorFn = getMatchesSelector();
                this.failedCSS = 0;
                this.domTree = this.getDOM(false, false);
                this.queue = [];
                this.threshold = threshold || 30;

                //Initialiez the mutation observer.
                /** @type {Array} */
                var MOQuery = [{
                    all: true
                }];
                if (queries) {
                    /** @type {Array} */
                    //TODO: prepare queries from config.
                    MOQuery = MOQuery.concat(queries);
                }
                this.mutationSummary = new MutationSummary({
                    rootNode: rootNode,
                    callback: function (value) {
                        nvdo.formatMutationData(value);
                    },
                    queries: MOQuery,
                    iframes: this.iframes,
                    handler: this
                });
                //remove the refrence 
                this.iframes = null;

                // initialize StyleRuleObserver.
                StyleRuleObserver.start(this);

                var me = this;
                this.flushStyleChangeTimer = setInterval(function () {
                    me.flushStyleRuleChange();
                }, 100); //TODO: check if this timer need to be configurable. 
            }
            //It will return true if document is complete else false.
            f.prototype.addIframe = function (iframe) {
                //If mutation summary is not initialized. then remove fromt the local.
                //FIXME: Optimize this.
                var me = this;
                var cb = function (iframe) {
                    if (!me.mutationSummary) {
                        var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        me.iframes.set(iframeDoc, true);
                    }
                    else
                        me.mutationSummary.addIframe(iframe);
                }
                //check if document loaded. 
                var doc = iframe.contentDocument || iframe.contentWindow.document;
                var complete = false;
                if (doc.readyState == 'complete') {
                    complete = true;
                    doc.__ana__ = iframe.__ana__;
                    cb(iframe);
                }


                //FIXME: Currently we have no filter over unexpecte src attribute change on Iframe. That need to take care. 
                function cb2(e) {
                    //Note: there are chances that src can be changed to different origin. 
                    //Note: we should check for origin.
                    var doc = null;
                    //Note: Currently javascript: iframe will be discarded. 
                    if (e.target.src && (e.target.src.indexOf('javascript:') == 0))
                        return;
                    try {
                        doc = e.target.contentDocument || e.target.contentWindow.document;
                    } catch (e) {
                        return;
                    }
                    if (!doc) return;
                    doc.__ana__ = e.target.__ana__;
                    //send the content of document as mutation (dom Change.)
                    var child = doc.firstChild, childNode;
                    var elements = [];
                    for (; child; child = child.nextSibling) {
                        childNode = me.getNVNode(child, true, false);
                        if (childNode) {
                            //add parentNode in each childNode.
                            childNode.parentNode = { id: doc.__ana__ };
                            elements.push(childNode);
                        }
                    }
                    // send this as expected
                    // FIXME: Handle for unexpected case.
                    //var mstate = CAVNV.plugins.DOMWATCHER2.getMutationState();
                    //TODO: check if we should sent stat as expected for initial dom of iframe.
                    me.queue.push({ m: { type: 0, state: 1 }, t: new Date().getTime(), d: [[], elements, [], []] });
                    //send this record.
                    me.send();
                    //We are passing iframe, later we will retrieve its document when needed. 
                    cb(e.target);

                }

                //TODO: handle for IE.
                //Set the event listener for future.
                {
                    //CAVUA.utils.addEventListener(doc, "load", cb2);
                    iframe.addEventListener("load", cb2);
                }

                if (CAVUA.utils.isLegacyIE()) {
                    var IWin = CAVUA.utils.getCurrentIFrameWindow(pr_module);
                    if (IWin) {
                        if (IWin.document) {
                            CAVUA.utils.addEventListener(IWin.document, "readystatechange", cb2);
                        }
                    }
                }
                return complete;
            }
            f.prototype.removeIframe = function (iframe) {
                if (!this.mutationSummary)
                    this.iframes.deletera(iframe);
                else
                    this.mutationSummary.removeIframe(iframe);


            }
            f.prototype.send = function (force) {
                if (CAVNV.__uaEnabled == false) {
                    CAVNV.plugins.DOMWATCHER2.stop();
                    return;
                }

                if (this.queue.length == 0) return;
                force = force || false;
                //Check if sid defined or not.
                if (CAVNV.sid && (force || this.queue.length >= this.threshold)) {

                    //adjust the timestamp.
                    for (var z = 0; z < this.queue.length; z++) {
                        this.queue[z].t = parseInt(CAVNV.utils.nv_time(this.queue[z].t));
                        //In IE9, getting CAVNV.nav_start_time = -1 in some cases.
                        /*if(CAVNV.nav_start_time > this.queue[z].t) 
                          this.queue[z].t = CAVNV.cav_epoch_nav_start_time * 1000;
                        else 
                          this.queue[z].t = (parseInt((this.queue[z].t - CAVNV.nav_start_time)) + (CAVNV.cav_epoch_nav_start_time * 1000));*/
                        // some change are coming , even before the CAVNV.frameid is not set 
                        // changes are set to queue , but in this case , f is undefined
                        if (this.queue[z].f == undefined && CAVNV.insideFrame == true) {
                            // setting frame id here
                            this.queue[z].f = CAVNV.frameId;
                        }
                    }

                    var data = "";
                    if (!CAVNV.messageVersion) {
                        for (var i = 0; i < this.queue.length; i++) {
                            data += JSON.stringify(this.queue[i]) + '\n';
                        }
                    }
                    else {
                        data = JSON.stringify(this.queue) + "\n";
                    }

                    this.queue = [];

                    var url = CAVNV.beacon_url + "?s=" + CAVNV.sid + "&p=" + CAVNV.protocolVersion + "&m=" + CAVNV.messageVersion + "&op=domwatcher&pi=" + CAVNV.pageInstance + "&CavStore=" + CAVNV.store + "&pid=" + CAVNV.pageIndex + "&d=" + CAVNV.pageIndex + "|0|";
                    //Check if worker is enabled then try to send using worker. 
                    //If data is large then 1 kb then only try with compression.
                    if (CAVNV.plugins.DOMWATCHER2.getConfig().compressDomchanges == true &&
                        data.length >= 1024 && CAVNV.config.enableWorker == true && typeof Worker != "undefined") {

                        //body type - compress(2)
                        var url2 = url + "2" + "&lts=" + CAVNV.lts;

                        //In case worker failed to initialized then we have to compress with main thread. 
                        var options = { ocxFilter: CAVNV.ocxFilter };
                        if (CAVNV.messageVersion == 1)
                            options.contentType = 'applicable/json';

                        if (CAVNV.send_dom_using_worker(data, url2, 'domwatcher', options) == true)
                            return true;
                        //Note: in error case it will fallback to normal form i.e. 1.
                    }

                    //body type - 1(normal) 
                    url += "1" + "&lts=" + CAVNV.lts;

                    if (CAVNV.config.ocxFilter.enabled == true && CAVNV.ocxFilter == 0) IDB.post(CAVNV.sid, CAVNV.pageInstance, { url: url, data: data, module: 'domwatcher' });
                    else
                        CAVNV.utils.sendData(url, data, "domwatcher");
                }
            }
            f.prototype.clearQ = function () {
                this.queue = [];
            }

            f.mTable = {
                "id": "i",
                "nodeType": "t",
                "tagName": "n",
                "attributes": "a",
                "childNodes": "c",
                "textContent": "T",
                "parentNode": "p",
                "previousSibling": "s"
            }

            f.minify = function (input) {
                var mapping = f.mTable;
                //Array 
                if (input == undefined || input == null) return input;
                if (typeof input == "object") {
                    if (typeof input.length != "undefined") {
                        var out = new Array(input.length);
                        for (var i = 0; i < input.length; i++) {
                            out[i] = f.minify(input[i]);
                        }
                        return out;
                    }
                    else {
                        var out = {};
                        for (var key in input) {
                            if (mapping[key]) {
                                if (key != "attributes")
                                    out[mapping[key]] = f.minify(input[key]);
                                else
                                    out[mapping[key]] = input[key];
                            }
                            else
                                out[key] = f.minify(input[key]);
                        }
                        return out;
                    }
                }
                else {
                    return input;
                }
            }
            /***********Changes related to style mutatio*****************/
            f.prototype.styleRuleMutations = {
                added: [],
                removed: [],
                modified: []
            };

            f.STYLE_RULE_ADDED = 0;
            f.STYLE_RULE_REMOVED = 1;
            f.STYLE_RULE_MODIFIED = 2;


            f.prototype.getStyleRuleNode = function (node, rule) {
                var obj = this.rememberNode(rule);
                if (!obj) return obj;

                if (rule.cssText)
                    obj.textContent = rule.cssText;
                else
                    obj.textContent = rule;
                obj.nodeType = Element.TEXT_NODE;
                return obj;
            }

            f.prototype.resetStyleRuleChange = function () {
                this.styleRuleMutations = { added: [], removed: [], modified: [] };
            }
            f.prototype.flushStyleRuleChange = function () {
                if (this.styleRuleMutations.added.length + this.styleRuleMutations.removed.length + this.styleRuleMutations.modified.length) {
                    this.queue.push({
                        m: { type: f.USERACTION_MUTATION, state: f.EXPECTED_MUTATION }, f: CAVNV.frameId, t: new Date().getTime(),
                        d: [
                            f.minify(this.styleRuleMutations.removed),
                            f.minify(this.styleRuleMutations.added),
                            [],
                            f.minify(this.styleRuleMutations.modified)]
                    });
                    //send this record.
                    this.resetStyleRuleChange();
                    this.send()
                }
            }

            f.prototype.addStyleRuleChange = function (node, change, rule, index) {
                // get parent element detail. 
                var pobj = this.knownNodes.get(node);
                // If node is not added in shadowDom yet then return.
                if (pobj == null) return;

                var changeObj;

                if (change == f.STYLE_RULE_ADDED) {
                    changeObj = this.getStyleRuleNode(node, rule);
                    // TODO: check if previousSibling is required. 
                    if (index > 0) {
                        var prevSiblingRule = node.sheet.cssRules[index - 1];
                        if (prevSiblingRule) {
                            obj = this.knownNodes.get(prevSiblingRule);
                            if (obj) {
                                changeObj.previousSibling = { id: obj.id };
                            }
                        }
                    }

                    this.styleRuleMutations.added.push(changeObj);
                } else if (change == f.STYLE_RULE_REMOVED) {
                    // Check if already exist.
                    var obj = this.knownNodes.get(rule);
                    if (!obj) return;

                    changeObj = { id: obj.id };
                    this.styleRuleMutations.removed.push(changeObj);
                } else if (change == f.STYLE_RULE_MODIFIED) {
                    // Check if already exist.
                    var obj = this.knownNodes.get(rule);
                    if (!obj) return;

                    changeObj = { id: obj.id, textContent: rule.cssText };
                    this.styleRuleMutations.modified.push(changeObj);
                }
                changeObj.parentNode = { id: pobj.id };
                this.lastCSSRuleChange = performance.now();
            }

            //Format of mutation change: [removedNode, addedNodes, attributeChangedNodes, characterDataChangedNodes]
            f.prototype.formatMutationData = function (data) {
                //TODO: check if in case of UNEXPECTED_MUTATION, we should proces the data or not
                if (CAVNV.plugins.DOMWATCHER2.getConfig().filterUnexpected == true &&
                    CAVNV.plugins.DOMWATCHER2.getMutationState().state == f.UNEXPECTED_MUTATION)
                    return;

                var st = new Date().getTime();
                var nvdo = this;
                var summary = data[0];
                var tnode;
                var removedNodes = summary.removed.map(function (node) {
                    // remove from inputNodes. done for autofill.
                    if (CAVNV.inputNodes && node.tagName && (node.tagName == 'INPUT' || node.tagName == 'SELECT')) {
                        //Note: we are not setting check for reset, submit and hidden, this will be handled inside.
                        CAVNV.inputNodes.deletera(node);
                    }
                    //remove iframe node.
                    //FIXME: Check for exception.
                    if (node.tagName && node.tagName == "IFRAME")
                        nvdo.removeIframe(node);

                    tnode = nvdo.getNVNode2(node, true);

                    //If not present in knowNodes (i.e. filter) then return null. 
                    if (!tnode)
                        return null;

                    //forget this node.
                    nvdo.forgetNode(node);

                    //Check if parent node does not exist then do not send child node informat. 
                    if (tnode && tnode.parentNode && !nvdo.knownNodes.getNode(tnode.parentNode)) {
                        return null;
                    }
                    return tnode;
                });

                //Filter for null elements.
                removedNodes = removedNodes.filter(function (e) { return e; });

                //Update inputNodes nodemap.
                if (CAVNV.inputNodes) {
                    summary.added.forEach(function (node) {
                        //Check if type if input.
                        if (node.tagName && ((node.tagName == 'INPUT' && !(node.type == "hidden" || node.type == "reset" || node.type == "submit")) || node.tagName == 'SELECT')) {
                            var d = {
                                time: new Date().getTime(),
                                value: node.value
                            };
                            if (node.tagName == 'SELECT') {
                                d.value = "";
                                if (node.selectedIndex < node.options.length && node.selectedIndex >= 0)
                                    d.value = node.options[node.selectedIndex].text;
                            }
                            CAVNV.inputNodes.set(node, d);
                        }
                    });
                }

                var addedNodes = this.combineAddedNodes(summary.added, summary.reparented, summary.reordered);

                var attributeChangedNodes = this.combineAttributes(summary.attributeChanged);
                //Log the hover data if some mutation occurred. 
                if (addedNodes.length > 0 || attributeChangedNodes.length > 0)
                    CAVUA.logMM();
                var cdChangedNodes = summary.characterDataChanged.map(function (node) {
                    var elem = nvdo.getNVNode2(node, false);
                    //Note: If element is not added in our knowNode (i.e. marked filter) then don't send characterData change..
                    if (!elem) return null;
                    var eeflag = nvdo.getEEFlag(node);
                    var valObj = nvdo.getEEValue(node.textContent, eeflag);
                    elem.textContent = valObj.v;
                    if (valObj.ev)
                        elem.encTextContent = valObj.ev;
                    return elem;
                });

                //FIXME: review it's performance.
                nvdo.applyCheckpoint(addedNodes, attributeChangedNodes, cdChangedNodes);

                // merge style chagne records too.
                removedNodes = removedNodes.concat(this.styleRuleMutations.removed);
                addedNodes = addedNodes.concat(this.styleRuleMutations.added);
                cdChangedNodes = cdChangedNodes.concat(this.styleRuleMutations.modified);

                this.resetStyleRuleChange();

                //Check if we have some record left.
                if (removedNodes.length || addedNodes.length || attributeChangedNodes.length || cdChangedNodes.length) {
                    //get mutation state:
                    var mstate = CAVNV.plugins.DOMWATCHER2.getMutationState();
                    this.queue.push({ m: { type: mstate.type, state: mstate.state }, f: CAVNV.frameId, t: new Date().getTime(), d: [f.minify(removedNodes), f.minify(addedNodes), f.minify(attributeChangedNodes), f.minify(cdChangedNodes)] });
                    //send this record.
                    this.send()
                }
                CAVNV.log('CAVNV Timing: formatMutationData - ' + (new Date().getTime() - st) + ' added ' + addedNodes.length +
                    ',removed - ' + removedNodes.length + ',attribute - ' + attributeChangedNodes.length +
                    ',textdata - ' + cdChangedNodes.length);
            }

            f.prototype.applyCheckpoint = function (addedNodes, attributeChangedNodes, cdChangedNodes) {
                //add all these nodes into a single array . And uniqe them and apply them.
                var changeNodes = [];
                var elem, parentElement;
                var me = this;
                var checkpoints = CAVNV.plugins.CHECKPOINT.getCheckpoint();
                function combine(node) {
                    if (!node) return;
                    var elem = me.knownNodes.getNode(node.id);
                    //check for it's type.
                    if (elem.nodeType == elem.TEXT_NODE) {
                        //get id of it's parent element and add that.
                        //Check if parent Element is not give then do not add.
                        if (elem.parentElement) {
                            var pNode = me.getNVNode(elem.parentElement);
                            if (pNode)
                                changeNodes.push(me.getNVNode(elem.parentElement).id);
                        }
                    }
                    else {
                        changeNodes.push(node.id);
                    }
                }
                addedNodes.forEach(combine);
                attributeChangedNodes.forEach(combine);
                cdChangedNodes.forEach(combine);
                //sort this array. 
                changeNodes = changeNodes.sort();
                //This cache will have top most parent element matching the chekpoint selector.
                var checkCache;
                var cpelementCache;
                var pflag;
                var cpStateHash = {};

                function getCheckpointElement(node, selector) {
                    if (node == null || node == me.target) return null;
                    var cnode;
                    cnode = checkCache.get(node);
                    if (cnode == undefined) {
                        cnode = getCheckpointElement(node.parentNode, selector) || ((me.matchesSelector(node, selector) == true) ? node : null);
                    }
                    //set this cnode in cache.
                    checkCache.set(node, cnode);
                    return cnode;
                }

                var prevId = -1;
                var cpelem;
                var cpState;
                for (var a = 0; a < checkpoints.length; a++) {
                    if (checkpoints[a].scope != 1/*CP_SCOPE_MUTATION*/ && checkpoints[a].scope != 99 /*CP_SCOPE_ALL*/) continue;
                    //reinitialize the checkCache.
                    checkCache = new MutationSummary.NodeMap;
                    cpelementCache = new MutationSummary.NodeMap;
                    prevId = -1;
                    cpStateHash[checkpoints[a].idx] = false;
                    for (var z = 0; z < changeNodes.length; z++) {
                        if (prevId != changeNodes[z]) {
                            prevId = changeNodes[z];
                            elem = me.knownNodes.getNode(prevId);
                            cpelem = getCheckpointElement(elem, checkpoints[a].selector);
                            if (cpelem) {
                                pflag = cpelementCache.get(cpelem)
                                if (pflag != true) {
                                    cpState = CAVNV.plugins.CHECKPOINT.applyCheckpoint2(cpelem, 1/*CP_SCOPE_MUTATION*/, checkpoints[a]);
                                    cpelementCache.set(cpelem, true);
                                    cpStateHash[checkpoints[a].idx] = cpState;
                                    //Note: we alreay found a success so there is no need to process for others.
                                    if (cpState == true) break;
                                }
                            }
                        }
                    }
                    //reset the cache.
                    checkCache = null;
                    cpelementCache = null;
                }
                //reset prevState of checkpoints.
                CAVNV.plugins.CHECKPOINT.resetPrevState(cpStateHash, checkpoints);
            }

            //TODO: make it supportable for all browser.
            f.prototype.matchesSelector = function (node, selector) {
                if (!this.matchesSelectorFn || node.nodeType != node.ELEMENT_NODE) return false;
                var m = false;
                try {
                    m = node[this.matchesSelectorFn](selector);
                } catch (e) {

                }
                return m;
            }

            f.prototype.addEncryptedElement = function (d) {
                var enc = CAVNV.encryptedElement;
                for (var z = 0; z < enc.length; z++) {
                    this.encryptElement(d, enc[z]);
                }
            }

            // this function is responsible for recursively encrypting and filtering document and its iframes on basis of rules. 
            f.prototype.encryptElement = function (doc, rule) {
                var e = [];
                try {
                    e = doc.querySelectorAll(rule.id);
                }
                catch (e) { return; }
                for (var y = 0; y < e.length; y++) {
                    //set the flag. 
                    e[y].__nvenc = rule.mode;
                    //set attribute for debugging. 
                    e[y].setAttribute(rule.mode == 1 ? "nvencrypted" : "nvsensitive", '');
                }
                if (!CAVNV.monitorIframe) return;    // if monitorIframe is not enabled then we need not worry about encryting or filtering the iframes.
                if (rule.Iframe) {
                    var iframe = doc.getElementsByTagName('iframe');
                    for (var z = 0; z < iframe.length; z++) {
                        try { this.encryptElement(iframe[z].contentDocument, rule); }
                        catch (e) { continue; }
                    }
                }
            }
            //Note: we are not keeping any nodeMap for filter element. It will be set on element itself.
            f.prototype.markFilterElement = function (d) {
                //check the element and mark.      
                var e;
                for (var z = 0; z < this.filter.length; z++) {
                    //Search and mark the element. 
                    this.filterElement(d, this.filter[z]);
                }
            }

            f.prototype.filterElement = function (doc, filter) {
                var e = [];
                try {
                    e = doc.querySelectorAll(filter.element);
                } catch (e) { return; }
                for (var y = 0; y < e.length; y++) {
                    if (filter.aChange)
                        e[y].__nvf = this.FILTER_ATTR;
                    else
                        e[y].__nvf = this.FILTER;
                }
                if (!CAVNV.monitorIframe) return;
                if (filter.Iframe) {
                    var iframe = doc.getElementsByTagName('iframe');
                    for (var z = 0; z < iframe.length; z++) {
                        try { this.filterElement(iframe[z].contentDocument, filter); }
                        catch (e) { continue; }
                    }
                }
            }

            //TODO: check if we need to refresh knowNodes at any time.
            f.prototype.getDOM = function (update, diff) {
                //update the know Nodes. and return them.
                var elements = [];
                update = update || false;


                var tt = new Date().getTime();
                if (!this.domTree || update) {
                    //Note: Currently we assuming that if one element is marked as sensitive/encrypted for one page, then for next soft navigation also, it will be sensitive/encrpted.
                    //So not clearing encryptedNodes.
                    //check for encrypted and encoded elements.
                    this.addEncryptedElement(CAVNV.window.document);

                    this.markFilterElement(CAVNV.window.document);

                    /*var child = this.target.firstChild,c=0;*/
                    var child = this.target.firstChild, childNode;
                    for (; child; child = child.nextSibling) {
                        childNode = this.getNVNode(child, true, false, false, diff/*oldNode*/);
                        if (childNode)
                            elements.push(childNode);
                    }
                    /*for (;child; c++) {
                      elements.push(this.getNVNode(child, true));
                      child = child.childNodes[c];
                    }*/


                    elements = f.minify(elements);
                    CAVNV.log('CAVNV Timing: getDOM - ' + (new Date().getTime() - tt));
                }
                else
                    elements = this.domTree;
                return elements;
            }

            f.prototype.disconnect = function () {
                if (this.mutationSummary) {
                    this.mutationSummary.disconnect();
                    this.mutationSummary = void 0;
                }

                StyleRuleObserver.stop();
                clearInterval(this.flushStyleChangeTimer);

            }, f.prototype.rememberNode = function (elem) {
                //this will set parent Node along with current node.
                //get the id from NodeMap.
                var data = { id: this.knownNodes.nodeId(elem) };
                if (elem.parentNode) {
                    //Check of parent node is in list of know nodes then only set it.
                    //var p = this.getNVNode(elem.parentNode);
                    var p = this.knownNodes.get(elem.parentNode);
                    if (p) data.parentNode = p.id;
                }
                return this.knownNodes.set(elem, data), data;
            }, f.prototype.forgetNode = function (node) {
                this.knownNodes.deletera(node);
            },

                f.prototype.getID = function (node) {
                    return this.knownNodes.nodeId(node);
                },

                f.prototype.getNode = function (id) {
                    return this.knownNodes.getNode(id);
                },


                //Note: this method will return object.
                //{v: <value to be set>, ev: <encrypted value> }
                f.prototype.getEEValue = function (value, eeflag) {
                    if (eeflag == this.ENCODED) {
                        return { v: value.replace(/[^\s]/g, "*") };
                    }
                    else if (eeflag == this.ENCRYPTED) {
                        if (CAVNV.rsaEncryption)
                            return { v: value.replace(/[^\s]/g, "*"), ev: CAVNV.plugins.EQueue.add(value) };
                        else
                            return { v: value.replace(/[^\s]/g, "*"), ev: CAVNV.utils.encodeText(value, CAVNV.utils.encode) };
                    }
                    return { v: value };
                }

            f.prototype.getEEFlag = function (node) {
                //Check if enc flag is set then just return that. 
                //Note: assuming that once an element mark as encrypted will be encrypted.
                //Note: First check for current element and then check in parent element.
                return node.__nvenc || (node.parentElement ? node.parentElement.__nvenc : 0);
            }

            f.prototype.getFilterFlag = function (node) {
                return node.__nvf || (node.parentElement ? node.parentElement.__nvf : 0);
            }

            f.prototype.getNVNode2 = function (node, pflag) {
                var data = this.knownNodes.get(node);
                if (!data) return null;

                if (pflag) return data;
                return { id: data.id };
            }

            //This method will wrap the DOM node into nv node.
            f.prototype.getNVNode = function (node, followChild, eeflag, pflag, forceFollowChild) {
                if (null === node) {
                    return null;
                }

                var oldNode = false;
                var elem;
                //If already exist then return the same id.
                var data = this.knownNodes.get(node);
                if (data === null) return null;

                if (void 0 !== data) {
                    //Note: if pflag is given then we will return parentNode and id both.
                    if (!forceFollowChild) {
                        if (pflag) return data;
                        return { id: data.id };
                    }
                    /*else
                    oldNode = true; 
                    element = node;*/
                    elem = {
                        nodeType: node.nodeType,
                        id: data.id
                    }
                }

                if (oldNode == false) {
                    //Check for filter.
                    var flag = this.getFilterFlag(node);
                    //TODO: Check if this is needed. because we are using getFilterFlag here only and other we can determine just by checking if node present in knownNodes.
                    node.__nvf = flag;
                    if (flag == this.FILTER) {
                        //set null in knowNodes and return. 
                        this.knownNodes.set(node, null);

                        //Check if it is top filter element then return a token to take care xpath of other elements.
                        if (node.nodeType == Node.ELEMENT_NODE && (!node.parentElement || this.getFilterFlag(node.parentElement) != this.FILTER)) {
                            //If id present then that should also go.
                            var e = {
                                id: this.knownNodes.nodeId(node),
                                nodeType: node.nodeType,
                                tagName: "http://www.w3.org/2000/svg" == node.namespaceURI ? "svg:" + node.tagName : node.tagName
                            }
                            //Note: we are sending id  because sometime xpath can be relative to id.
                            if (node.id)
                                e.attributes = { id: node.id };
                            return e;
                        }
                        return null;
                    }

                    //set eeflag if inhereited from parent.
                    eeflag = eeflag || this.getEEFlag(node);

                    //set in element
                    node.__nvenc = eeflag;

                    var valObj;
                    if (!elem) {
                        elem = {
                            nodeType: node.nodeType,
                            id: this.rememberNode(node).id
                        };
                    }
                    switch (elem.nodeType) {
                        case Node.DOCUMENT_TYPE_NODE:  //10
                            /** @type {Object} */
                            var data = node;
                            elem.name = data.name;
                            elem.publicId = data.publicId;
                            elem.systemId = data.systemId;
                            break;
                        case Node.COMMENT_NODE:  //8
                            /*Comment will not go*/
                            this.knownNodes.set(node, null);
                            return null;
                        //return elem;

                        case Node.TEXT_NODE: //3
                            valObj = this.getEEValue(node.textContent, eeflag);
                            elem.textContent = valObj.v;
                            if (valObj.ev)
                                elem.encTextContent = valObj.ev;
                            break;
                        case Node.ELEMENT_NODE: //1
                            /** @type {Object} */
                            var element = node;
                            elem.tagName = "http://www.w3.org/2000/svg" == element.namespaceURI ? "svg:" + element.tagName : element.tagName;
                            elem.attributes = {};
                            /** @type {number} */
                            var i = 0;
                            for (; i < element.attributes.length; i++) {
                                var attr = element.attributes[i];
                                //Note: if monitorIframe is disable then we will send the src attribute.
                                if (CAVNV.monitorIframe && elem.tagName.toLowerCase() == "iframe" && attr.name.toLowerCase() == "src") {
                                    try {
                                        //Note: this check is just to check for different origin.
                                        if ((attr.value.indexOf("javascript:") == -1) && (element.contentDocument || (element.contentWindow && element.contentWindow.document)))
                                            continue;
                                        else
                                            elem.attributes[attr.name] = attr.value;
                                    } catch (e) {
                                        elem.attributes[attr.name] = attr.value;
                                    }
                                }
                                else
                                    elem.attributes[attr.name] = attr.value;
                            }
                            //log selectedIndex for SELECT. 
                            if (elem.tagName == 'SELECT')
                                elem.attributes['index'] = element.selectedIndex;

                            if ("SCRIPT" == elem.tagName || "NOSCRIPT" == elem.tagName) {
                                //add the entry as null and return. 
                                this.knownNodes.set(node, null);
                                return null;
                            }
                            else if (elem.tagName == 'STYLE' && element.textContent == '') {
                                // If style doesn't have inline css, iterate all the rules using sheet and send them as text node.  
                                var crs = element.sheet.cssRules;
                                elem.childNodes = elem.childNodes || [];
                                for (var i = 0; i < crs.length; i++) {
                                    elem.childNodes.push(this.getStyleRuleNode(element, crs[i]));
                                }
                                return elem;
                            }
                            if ("INPUT" == elem.tagName || "TEXTAREA" == elem.tagName) {
                                if ("INPUT" == elem.tagName) {
                                    //Check if type is hidden then do not add and mark as hidden.
                                    if (element.type && element.type == "hidden") {
                                        this.knownNodes.set(node, null);
                                        return null;
                                    }
                                    var text = element.getAttribute("value")
                                } else {
                                    if ("TEXTAREA" == elem.tagName) {
                                        if (element.childNodes.length > 0) {
                                            text = element.childNodes[0].nodeValue;
                                        } else {
                                            /** @type {string} */
                                            text = "";
                                        }
                                    }
                                }
                                if (null != element.value) {
                                    if ("" != element.value) {
                                        if (element.value != text) {
                                            elem.attributes.nvvalue = element.value;
                                        }
                                    }
                                }
                            }
                            //Ignore sensitive element.
                            if ("INPUT" == elem.tagName) {
                                //if element marked as encrypted or sensitive modify values.
                                if (eeflag) {
                                    if (elem.attributes.value) {
                                        valObj = this.getEEValue(elem.attributes.value, eeflag);
                                        elem.attributes.value = valObj.v;
                                        if (valObj.ev) elem.attributes.encValue = valObj.ev;
                                    }
                                    if (elem.attributes.placeholder) {
                                        valObj = this.getEEValue(elem.attributes.placeholder, eeflag);
                                        elem.attributes.placeholder = valObj.v;
                                        if (valObj.ev) elem.attributes.encPlaceholder = valObj.ev;
                                    }
                                    if (elem.attributes.nvvalue) {
                                        valObj = this.getEEValue(elem.attributes.nvvalue, eeflag);
                                        elem.attributes.nvvalue = valObj.v;
                                        if (valObj.ev) elem.attributes.encNvalue = valObj.ev;
                                    }
                                    if (elem.attributes.defaultValue) {
                                        valObj = this.getEEValue(elem.attributes.defaultValue, eeflag);
                                        elem.attributes.defaultValue = valObj.v;
                                        if (valObj.ev) elem.attributes.encDefaultValue = valObj.ev;
                                    }
                                }
                            }

                            //set failure flag. 
                            //Note: currently this will be handled for IMG and LINK only.
                            //Note: in some cases src attribute as coming "" so such images will not be considered.
                            if (element.tagName == "IMG" && elem.attributes.src != "") {
                                if (element.complete && element.naturalWidth == 0) {
                                    elem.attributes.failed = true;
                                    /*
                                    if(CAVNV.wpdEvent && !CAVNV._wpdEventRaised)
                                    {
                                      w.cav_nv_log_event('PageDistorted', {tag: 'IMG', src: element.src});
                                      CAVNV._wpdEventRaised = true;
                                    }
                                    */
                                }
                            }
                        /*else if(element.tagName == "LINK" && element.rel == "stylesheet" && element.href)
                        {
                          //Note: we have to look into all the css in document, if it prasent and does not contain rules then we have to mark that failed. 
                          var ss = CAVNV.window.document.styleSheets;
                          for(var z = 0; z < ss.length; z++)
                          {
                            if(element.href == ss[z].href)
                            {
                              if(ss[z].cssRules &&  ss[z].cssRules.length == 0)
                              {
                                elem.attributes.failed = true;
                                this.failedCSS ++;
                                if(CAVNV.wpdEvent && !CAVNV._wpdEventRaised)
                                {
                                  w.cav_nv_log_event('PageDistorted', {tag: 'CSS', src: element.href});
                                  CAVNV._wpdEventRaised = true;
                                }
                              }
                              break;
                            }
                          }
                        }*/

                        /*oldNode*/
                        //If monitorIframe is enable then add the iframe in mutation and send it's source.
                        //Optimization for UL and LI. 
                        //In some of the application There was a big number for LI under one UL. eg. kohls.com Brand section. 
                        // By defalt we will send 50 entires maximum. But that is tunable through config.

                    }
                }
                if (CAVNV.monitorIframe && element && element.nodeType == Node.ELEMENT_NODE && element.tagName.toLowerCase() == "iframe") {
                    if (typeof element.src == "string" && element.src.indexOf("javascript:") > -1)
                        return elem;
                    try {
                        //TODO : provide specific if for nv_bootstrap iframe
                        // For now, dont consider iframes with src "javascript:false"
                        if (element.contentDocument) {
                            var iframe = element;
                            element = element.contentDocument || element.contentWindow.document;
                            if (oldNode == false) {
                                //false indicating that iframe is not loaded yet. 
                                if (this.addIframe(iframe) == false)
                                    return elem;
                            }
                        }
                    } catch (e) {
                        CAVNV.log("Error while getting content document");
                        return elem;
                    }
                }
                var maxLI = 50;

                if (followChild && element && element.childNodes.length) {
                    elem.childNodes = [];
                    var isUL = (element.tagName == "UL"), isLI = false;
                    var numLI = 0;
                    var child = element.firstChild;
                    var childNode;
                    for (; child; child = child.nextSibling) {
                        isLI = (child.tagName == "LI");
                        if (isUL && isLI && numLI > maxLI)
                            continue;

                        childNode = this.getNVNode(child, true, eeflag, pflag, forceFollowChild);
                        if (childNode) {
                            elem.childNodes.push(childNode);
                            if (isLI)
                                numLI++;
                        }
                    }
                }

                return elem;
            }, f.prototype.combineAddedNodes = function (added, reparented, reordered) {
                var nvmo = this;

                var records = added.concat(reparented).concat(reordered);
                //If empty then just return. 
                if (records.length == 0) return [];

                //FIXME: in case of attribute change also, we should call addEncryptedElement and markFilterElement again. Just because 
                //  filter selector can be found after attribute change in an existing element. 
                //  But attribute change can happen very frequently so all time we can not call this because of performance issues.
                //Note: check for sensitive and encrypted nodes.
                this.addEncryptedElement(CAVNV.window.document);

                //Also update the filterNode. 
                this.markFilterElement(CAVNV.window.document);

                //*/
                var nodemap = new MutationSummary.NodeMap;
                records.forEach(function (node) {
                    var elem = node.parentNode;
                    //data again a nodemap.
                    var data = nodemap.get(elem);
                    if (!data) {
                        data = new MutationSummary.NodeMap;
                        nodemap.set(elem, data);
                    }
                    data.set(node, true);
                });

                /** @type {Array} */
                var allnodes = [];
                nodemap.keys().forEach(function (elem) {
                    //Filter Node Check: 1. Check if parent element is added in knowNodes if not then we can discard all the children. 
                    var pnode = nvmo.getNVNode2(elem, false);
                    if (!pnode) return;

                    var datamap = nodemap.get(elem);

                    //Handling for all children.
                    var nodes = datamap.keys();
                    for (; nodes.length;) {
                        var node = nodes[0];
                        //find the most previous sibling.
                        for (; node.previousSibling && datamap.has(node.previousSibling);) {
                            node = node.previousSibling;
                        }
                        for (; node && datamap.has(node);) {
                            var child = nvmo.getNVNode(node, true);
                            if (child) {
                                //Note: In case if just immediate previousSibling is filtered then we have to check for it's prev till we are not getting the valid one. 
                                var p = null;
                                for (var ps = node.previousSibling; !p && ps; ps = ps.previousSibling) {
                                    p = nvmo.getNVNode(ps);
                                }
                                child.previousSibling = p;
                                child.parentNode = nvmo.getNVNode(node.parentNode);
                                allnodes.push(child);
                            }
                            datamap.deletera(node);
                            node = node.nextSibling;
                        }
                        nodes = datamap.keys();
                    }
                })
                return allnodes;
            },
                f.prototype.combineAttributes = function (attrList) {
                    var nvmo = this;
                    var nodemap = new MutationSummary.NodeMap;
                    Object.keys(attrList).forEach(function (attr) {
                        attrList[attr].forEach(function (elem) {
                            if (elem.tagName) {
                                if (elem.tagName == "IFRAME" && attr == "src" && CAVNV.monitorIframe) {
                                    try {
                                        //In case if attr value is null then no need to check further condition. It will throw the exception and will continue. 
                                        if ((elem.getAttribute(attr).indexOf("javascript:") == -1) && ((elem.contentWindow && elem.contentWindow.document) || elem.contentDocument))
                                            return;
                                    } catch (e) { }
                                }
                                else if ((attr == 'value' || attr == 'placeholder') && ((elem.tagName == 'INPUT' && elem.type == 'password') || nvmo.getEEFlag(elem))) return;
                                //Check if element is marked as encrypted or sensitive then don't capture attribute change for value and placeholder as it will be visible during replay. 
                                //else if(attr == 'value' && elem.tagName == 'INPUT' && elem.type == 'password' ) return;
                            }


                            var dataAndEvents = nodemap.get(elem);

                            //If not added then add first.
                            if (!dataAndEvents) {
                                dataAndEvents = nvmo.getNVNode2(elem, false);
                                //Check if element is not added or if added then mark for no mutation on attribute change.
                                if (dataAndEvents === null || nvmo.getFilterFlag(elem) == nvmo.FILTER_ATTR) {
                                    return;
                                }
                                dataAndEvents.attributes = {};
                                nodemap.set(elem, dataAndEvents);
                            }
                            dataAndEvents.attributes[attr] = elem.getAttribute(attr);
                        });
                    })
                    return nodemap.keys().map(function (elem) {
                        return nodemap.get(elem);
                    });
                }
            //some constants.
            f.UNEXPECTED_MUTATION = 0,
                f.EXPECTED_MUTATION = 1,
                f.XHR_MUTATION = 0,
                f.USERACTION_MUTATION = 2
            f.NA = -1;
            return f;
        }();

        return NVDOMObserver;
    })();
    /*** END OF DOMWATCHER 2 ***********/

    /****Performance API Support ******/
    /*
    (function(window) {
      //Apis already there
      if(window.performance && window.performance.mark) return;
    
      if(!window.performance)
         window.performance = {};
    
      performance = window.performance;
    
      var now = window.performance.now || function () {
        //return time in msec. 
        return new Date().getTime() - CAVNV.nav_start_time;
      }
    
      function pentry (startTime, name, entryType, duration) {
        this.duration  = duration;
        this.entryType = entryType;
        this.name  = name;
        this.startTime = startTime;
      }
    
      function PerformanceMark(name, startTime) {
         return  new pentry(startTime || now(), name , 'mark', 0);
      }
      function PerformanceMeasure(name, duration) {
        return new pentry(0, name, 'measure', duration||0);
      }
    
      //list of marks, will keep start time.
      var marks = [];
      var  measures = [];
      function mark(name) 
      {
         //make a  new entry in marks
         marks.push(new PerformanceMark(name));
      }
    
      var standardMarks = [];
      if(performance && performance.timings)
         standardMarks = Object.keys(performance.timing.toJSON());
      function measure(name, startMark, endMark) {
        //find start and end mark in already given list. 
        var startTime = -1, endTime = -1;
        for(var z = 0; z < marks.length; z++) {
          if(marks[z].name == startMark)
             startTime = marks[z].startTime;
          if(marks[z].name == endMark)
            endTime = marks[z].startTime;
        }
        //search in standard web timings. 
        if(startTime == -1 || endTime == -1)
        for(m in standardMarks )
        {
          if(m == startMark)
             startTime = performance.timing[m] - performance.timing.navigationStart;
          if(m == endMark)
            endTime = performance.timing[m] - performance.timing.navigationStart 
        }
        if(startTime != -1 && endTime != -1)
        {
          var duration = endTime - startTime;
          //Add in list
          measures.push(new PerformanceMeasure(name, duration));
        }
      }
    
      function clearMarks() {
        marks  = []; 
      }
      function clearMeasures() {
         measures = [];
      }
    
    
    var getEntriesByTypeL = window.performance.getEntriesByType;
    function  getEntriesByType(type)
    {
       if(type == 'mark')
         return marks;
       if(type == 'measure')
         return measures;
       if(getEntriesByTypeL)
         return getEntriesByTypeL(type);
       return [];
    }
    
      //Set all the above methods into windows.
      window.performance.now = now;
      window.performance.mark = mark;
      window.performance.measure  = measure;
      window.performance.clearMarks = clearMarks;
      window.performance.clearMeasures = clearMeasures;
      window.performance.getEntriesByType = getEntriesByType;
    }(w));
    */

    (function (window) {
        if (!window.performance || !window.performance.mark) return;
        var markIdx = 0, measureIdx = 0;
        var clearMarks = window.performance.clearMarks;
        window.performance.clearMarks = function () {
            markIdx = 0;
            clearMarks.call(window.performance);
        }

        var clearMeasures = window.performance.clearMeasures;
        window.performance.clearMeasures = function () {
            measureIdx = 0;
            clearMeasures.call(window.performance);
        }

        window.performance.getEntriesByTypeNV = function (type) {
            var inn = window.performance.getEntriesByType(type);
            var out;
            if (type == "mark") {
                out = inn.slice(markIdx);
                markIdx = inn.length;
                return out;
            }
            if (type == "measure") {
                out = inn.slice(measureIdx);
                measureIdx = inn.length;
                return out;
            }
            return inn;
        }
    })(w);

    /***************Ajax Call Profiler*******/
    window.XMLProfiler = (function () {
        //filter format: 
        /*
        {
          domain: <domain name>(optional) 
          domain_regex: 
          path: <path> 
          path_regex: <path in regex>
        } */
        //helping methods.
        //true - in filter . false - not in filter.
        //From AgentSetting UI, regex are coming in quotes/string , so need to convert them in regex format
        function applyFilter(url, f) {
            function compPath(url, f) {
                //If path filter not given then return true.
                if (f.path === undefined && f.path_regex === undefined) return true;
                else if (f.path && url.pathname.indexOf(f.path) == 0) return true;
                else if (f.path_regex) {
                    try {
                        if (typeof f.path_regex == 'string') {
                            f.path_regex = new RegExp(f.path_regex);
                        }
                        if (f.path_regex.test(url.pathname) == true) return true;
                    } catch (e) { };
                }
                return false;
            }

            //first check domain and then check path if given.
            if (f.domain) {
                if (f.domain == url.host) {
                    if (compPath(url, f) == true) return true;
                }
            }
            else if (f.domain_regex) {
                //compare domain.
                try {
                    if (typeof f.domain_regex == 'string') {
                        f.domain_regex = new RegExp(f.domain_regex);
                    }
                    if (!f.domain_regex.test(url.host)) return false;
                } catch (e) { return false; }
                //compare path
                if (compPath(url, f) == true) return true;
            }
            //Just compare path.
            else {
                if (compPath(url, f) == true) return true;
            }
            return false;
        }

        function isFiltered(URL, filters) {
            /*
             * 1. we will check for whitelist
             * 2. conditionally, we will check in blacklist,
             * 2a,when whitelist is empty
             * 2b,when we got some element after whitelist, thenn we will further check for blacklist filter for that element.
             */
            //Check if URL string then change to Anchor tag. 
            if (typeof URL == "string")
                URL = getURL(URL);
            var whitelistEntry = [], blacklistEntry = [];
            //To support old format.
            if (typeof filters.mode == "string") {
                if (filters.mode == "blacklist")
                    blacklistEntry = filters.entry || [];
                else
                    whitelistEntry = filters.entry || [];
            }
            else {
                whitelistEntry = filters.whitelist || [];
                blacklistEntry = filters.blacklist || [];
            }
            var matched = false;
            var f, ff;
            // check for whitelist filter enteries first
            for (var z = 0; z < whitelistEntry.length; z++) {
                f = whitelistEntry[z];
                if (applyFilter(URL, f)) {
                    matched = true;
                    break;
                }
            }
            // if we couldn't fint that request in whitelist, obviously it is filtered.             
            if (whitelistEntry.length != 0 && matched == false)
                return true;

            // check for blacklist filter enteries first
            for (var zz = 0; zz < blacklistEntry.length; zz++) {
                ff = blacklistEntry[zz];
                if (applyFilter(URL, ff))
                    return true;
            }
            return false;
        }

        function isFailedStatus(status) {
            var l = parseInt(status / 100);
            if (l == 0 || l == 1 || l == 2 || l == 3)
                return false;
            return true;
        }

        //TODO: check it's performance.
        function getURL(url) {
            var a = document.createElement('a');
            a.href = url;
            //make a copy.
            var aa = {
                hash: a.hash,
                host: a.host,
                hostname: a.hostname,
                href: a.href,
                origin: a.origin,
                pathname: a.pathname,
                port: a.port,
                protocol: a.protocol,
                search: a.search
            }
            if (aa.pathname[0] != '/')
                aa.pathname = '/' + aa.pathname;
            //remove default port. 
            var d = aa.host.split(':');
            if (aa.protocol == 'http:' && d[1] && d[1] == 80)
                aa.host = d[0];
            else if (aa.protocol == 'https:' && d[1] && d[1] == 443)
                aa.host = d[0];
            else if (aa.protocol == '')
                aa.protocol = document.location.protocol;
            //set origin also. 
            aa.origin = aa.protocol + "//" + aa.host;
            return aa;
        }

        //xhr ready stats hash.
        var xhrReadyStats =
        {
            0: "unset",
            1: "opened",
            2: "header_received",
            3: "loading",
            4: "done"
        };
        var REQUEST_STARTED = 0;
        var REQUEST_COMPLETED = 1;
        var REQUEST_FAILED = 2;

        //This wrapper will be used if profiler is running.
        function XMLHttpRequestWrapper(w, _nativeXHR) {
            var nativeXHR = _nativeXHR || w.XMLHttpRequest;

            //IE does not have origin properlty. 
            if (!w.location.origin)
                w.location.origin = w.location.protocol + "//" + w.location.host;

            var wrapper = function () {
                //error codes.
                //TODO: these codes need to be handle while sending to db.
                var xhrtimeout = -101;
                var xhrerror = -102;
                var xhrabort = -103;
                var xhrinternalerror = -104;

                var xhr = new nativeXHR();

                var nativeOpen = xhr.open;
                var nativeSend = xhr.send;
                var nativeSetRHeader = xhr.setRequestHeader;

                var clients;

                xhr.open = function (method, url, async) {

                    //check for valid clients.
                    //modify url.
                    var lurl = url;
                    if (lurl[0] == '/' && lurl[1] != '/') {
                        //var l = w.location;
                        lurl = w.location.origin + lurl;
                    }
                    else if (!/^(http|https|\/\/)/.test(lurl)) {
                        var p = w.location.pathname;
                        p = p.substr(0, p.lastIndexOf('/') + 1);
                        lurl = w.location.origin + p + lurl;
                    }

                    var URL = getURL(lurl);
                    try {
                        clients = xmlp.getClient(URL);
                    } catch (e) {
                        clients = [];
                    }
                    if (clients.length == 0) {
                        return nativeOpen.apply(xhr, arguments);
                    }

                    //extra data will be kept in __nv.
                    xhr.__nv = { timing: {} };
                    //add other information in record. 
                    //FIXME: in ie there was no origin.
                    xhr.__nv.url = URL.protocol + "//" + URL.host + URL.pathname;
                    xhr.__nv.nco = (w.location.origin == URL.origin);
                    xhr.__nv.query = URL.search;
                    xhr.__nv.method = method;
                    xhr.__nv.initiator = "xhr";
                    if (async === false)
                        xhr.__nv.synchronous = true;

                    function markDone() {
                        //If loadEventEnd set then no need to process again.
                        if (xhr.__nv.timing.loadEventEnd)
                            return;
                        //set requestEnd time. 
                        xhr.__nv.timing.loadEventEnd = CAVNV.now();

                        //update request stats.
                        xmlp.updateRequestStats(REQUEST_COMPLETED, clients, xhr);
                    }

                    function setEvent(event, status) {
                        xhr.addEventListener(event, function () {
                            if (event === "readystatechange") {
                                //TODO: replace this time by cav epoch time.
                                xhr.__nv.timing[xhrReadyStats[xhr.readyState]] = CAVNV.now();
                                if (xhr.readyState === 4) {
                                    //Bug 138845 - Byte Transferred data is not getting capture in Http request window.
                                    //Refrence for the same -https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getResponseHeader
                                    xhr.__nv.clength = xhr.getResponseHeader('Content-Length');
                                    xhr.__nv.status = xhr.status;
                                    markDone();
                                }
                            }
                            else {
                                xhr.__nv.status = (status === undefined ? xhr.status : status);
                                markDone();
                            }
                        });
                    }
                    //set events.
                    //for asynchronous calls add event for readystatechange.
                    //check if readySateChange timing is enabled
                    if (xmlp.options.captureRSCtiming == true && async !== false)
                        setEvent("readystatechange");

                    setEvent("load");
                    setEvent("timeout", xhrtimeout);
                    setEvent("error", xhrerror);
                    setEvent("abort", xhrabort);

                    //call native open.
                    try {
                        return nativeOpen.apply(xhr, arguments);
                    } catch (z) {
                        xhr.__nv.status = xhrinternalerror;
                        markDone();
                    }
                }

                xhr.send = function () {
                    //check if instrumented then just call native send and return.
                    if (xhr.__nv == undefined)
                        return nativeSend.apply(xhr, arguments);

                    xhr.__nv.timing.requestStart = new Date().getTime();
                    if (CAVNV.setNDTraceHeader) {
                        xhr.setRequestHeader('ndHeader', CAVNV.setNDTraceHeader);
                    }
                    //check if postData need to be collected.
                    if (xmlp.options.capturePostData) {
                        //check for first argument if string then only save that
                        //TODO: filter only for urlecoded, xhr and json data.
                        if (arguments && typeof arguments[0] == "string" && arguments[0].length < 1024)
                            xhr.__nv.postData = arguments[0];
                    }

                    xmlp.updateRequestStats(REQUEST_STARTED, clients, xhr);

                    if (xhr.__nv.status === undefined || xhr.__nv.status != xhrinternalerror) {
                        return nativeSend.apply(xhr, arguments);
                    }
                }

                xhr.setRequestHeader = function () {
                    //Check if headername is Content-Type then set in nv. 
                    if (xhr.__nv && arguments[0] == "Content-Type")
                        xhr.__nv.rct = arguments[1];

                    nativeSetRHeader.apply(xhr, arguments);
                }

                return xhr;
            }
            return wrapper;
        }

        function fetchRequestWrapper(w) {

            if (
                // we don't check that fetch is a native function in case it was already wrapped
                // by another vendor
                typeof w.fetch !== "function" ||
                // native fetch support will define these, some polyfills like `unfetch` will not
                typeof w.Request !== "function" ||
                typeof w.Response !== "function" ||
                // native fetch needs Promise support
                typeof w.Promise !== "function" ||
                // if our window doesn't have fetch then it was probably polyfilled in the top window
                typeof window.fetch !== "function" ||
                // Github's `whatwg-fetch` polyfill sets this flag
                w.fetch.polyfill) {
                return;
            }

            if (typeof w.fetch_wrapper === 'undefined')
                w.fetch_wrapper = undefined;

            if (w.fetch_wrapper && w.fetch_wrapper === w.fetch) {
                return;
            }

            if (w.fetch_wrapper && w.orig_fetch && w.orig_fetch === w.fetch) {
                w.fetch = w.fetch_wrapper;
                return;
            }

            w.orig_fetch = w.fetch;
            w.fetch_wrapper = function (input, init) {
                const FETCH_TIMEOUT = -101;
                const FETCH_ABORT = -103;
                const FETCH_ERROR = -102;
                const FETCH_EXCEPTION = -104;
                var clients;
                var url, method, payload, resource = { __nv: { timing: {}, initiator: "fetch" } };
                if (typeof input === "object" || input instanceof w.Request) {
                    url = input.url;
                    method = (init && init.method) || input.method || "GET";
                    if (xmlp.options.capturePostData) {
                        payload = (init && init.body) || input.body || undefined;
                    }
                }
                else {
                    url = input;
                    method = (init && init.method) || "GET";
                    if (xmlp.options.capturePostData) {
                        payload = (init && init.body) || undefined;
                    }
                }

                // Apply filter
                var URL = getURL(url);
                try {
                    clients = xmlp.getClient(URL);
                } catch (e) {
                    clients = [];
                }
                if (clients.length === 0) {
                    return w.orig_fetch.apply(this, arguments);
                }

                try {
                    resource.__nv.timing.requestStart = CAVNV.now();
                    resource.__nv.url = URL.protocol + "//" + URL.host + URL.pathname;
                    resource.__nv.nco = (w.location.origin == URL.origin);
                    resource.__nv.query = URL.query;
                    resource.__nv.method = method;
                    if (payload)
                        resource.__nv.postData = payload;

                    xmlp.updateRequestStats(REQUEST_STARTED, clients, resource);

                    var argArray = Array.from(arguments);
                    if (CAVNV.setNDTraceHeader) {
                        if (argArray[1]) {
                            if (argArray[1].headers) {
                                argArray[1].headers['ndHeader'] = CAVNV.setNDTraceHeader;
                            } else {
                                argArray[1].headers = { 'ndHeader': CAVNV.setNDTraceHeader };
                            }
                        } else {
                            argArray.push({ 'headers': { 'ndHeader': CAVNV.setNDTraceHeader } });
                        }
                    }

                    var promise = w.orig_fetch.apply(this, argArray);

                    return promise.then(function (response) {
                        try {
                            resource.__nv.status = response.status;
                            resource.statsText = response.statusText;

                            if (resource.__nv.timing.loadEventEnd) {
                                return;
                            }
                            resource.__nv.timing.loadEventEnd = CAVNV.now();

                            // set header. 
                            var headers = {};
                            response.headers.forEach(function (value, name) {
                                headers[name] = value;
                            });

                            resource.headers = headers;

                            // update request stats.
                            xmlp.updateRequestStats(REQUEST_COMPLETED, clients, resource);
                        }
                        catch (e) { }
                        return response;
                    }, function (reason) {
                        try {
                            //if fetch requst gets failed 
                            if (reason && (reason.name === "AbortError" || reason.code === 20)) {
                                resource.__nv.status = FETCH_ABORT;
                            }
                            else {
                                resource.__nv.status = FETCH_ERROR;
                            }
                            xmlp.updateRequestStats(REQUEST_COMPLETED, clients, resource);
                        }
                        catch (e) { }
                        throw reason;
                    })
                }
                catch (e) {
                    resource.__nv.status = FETCH_EXCEPTION;
                    xmlp.updateRequestStats(REQUEST_COMPLETED, clients, resource);
                    throw e;
                }
            };
            w.fetch = w.fetch_wrapper;
            return w.fetch_wrapper;
        }

        var nativeXHR = null;
        //Note: this will be initialized only once. 
        var xmlp = null;

        //This is the main object which will control other clients.
        function XMLServer(w, d) {
            //check if not initialized then initlaize it.
            w = w || window;
            d = d || document;
            if (!w.XMLHttpRequest || !(new w.XMLHttpRequest).addEventListener) return null;
            if (xmlp == null) {
                xmlp = this;
                xmlp.window = w;
                xmlp.document = d;

                xmlp.beaconURL = null;

                if (CAVNV.beacon_url)
                    xmlp.beaconURL = getURL(CAVNV.beacon_url);

                nativeXHR = xmlp.window.XMLHttpRequest;

                //there can be multiple clients.
                xmlp.client = {};
                xmlp.totalClient = 0;

                //request counters.
                xmlp.stats = {
                    requestStarted: 0,
                    requestCompleted: 0,
                    //Note: currently all abort, timeout, internal error and otheres will come in this category.
                    requestFailed: 0
                };

                //set current domain.
                xmlp.domain = this.window.location.host;

                xmlp.options = {
                    captureRSCtiming: false,
                    captureCrossDomain: false,
                    capturePostData: false
                    //TODO: 
                    //Note: filter will be global level.
                }
            }
        }

        XMLServer.prototype.updateRequestStats = function (mode, clients, xhr) {
            var c, s;
            for (var z = 0; z < clients.length; z++) {
                c = xmlp.client[clients[z]];
                s = c.stats;
                switch (mode) {
                    case REQUEST_STARTED:
                        //increase global stats.
                        if (z == 0)
                            xmlp.stats.requestStarted++;

                        if (s.requestStarted == s.requestCompleted)
                            c.trigger('ajaxStart');
                        c.trigger('ajaxSend', [xhr]);
                        break;
                    case REQUEST_COMPLETED:
                        if (z == 0) {
                            xmlp.stats.requestCompleted++;
                            if (isFailedStatus(xhr.__nv.status))
                                xmlp.stats.requestFailed++;
                        }
                        s.requestCompleted++;
                        c.trigger('ajaxComplete', [xhr]);
                        if (!isFailedStatus(xhr.__nv.status))
                            c.trigger('ajaxSuccess', [xhr]);
                        else
                            c.trigger('ajaxError', [xhr]);
                        if (s.requestStarted == s.requestCompleted)
                            c.trigger('ajaxStop', [xhr]);
                }
            }
        }
        //This method will apply filters and other settings. will return valid clients.
        XMLServer.prototype.getClient = function (URL) {
            var clients = [];

            //first filter for beacon url. Because we just don't want to caputre our request.
            if (this.beaconURL) {
                if (URL.host == this.beaconURL.host && URL.pathname == this.beaconURL.pathname) return [];
            }

            //first apply for global settings.
            if (xmlp.options.captureCrossDomain == false) {
                if (URL.host != xmlp.domain) return [];
            }
            //var mode, f, c, C, entry;
            var c, C;
            //check for all clients.
            for (C in xmlp.client) {
                c = xmlp.client[C];
                //check for crossOrigin.
                if (c.options.captureCrossDomain == false) {
                    if (URL.host != xmlp.domain) continue;
                }
                //Check for filters. 
                if (!isFiltered(URL, c.options.filters))
                    clients.push(C);
            }
            return clients;
        }

        XMLServer.prototype.addClient = function (client) {
            //set client id.
            client.clientid = this.totalClient;
            this.client[this.totalClient++] = client;
            //check if we have any client then enable it.
            this.enable();
        }

        XMLServer.prototype.removeClient = function (client) {
            if (client.clientid) {
                delete this.client[client.clientid];
                //If there is no active client then disable it.
                if (Object.keys(this.client).length == 0) {
                    this.disable();
                }
            }
        }

        XMLServer.prototype.enable = function (w, itrIframe) {
            if (itrIframe == undefined)
                itrIframe = true;

            var xmlWindow = w || this.window;
            if (xmlWindow.__nativeXHR == undefined || xmlWindow.XMLHttpRequest == xmlWindow.__nativeXHR) {
                // Check if boomer is present. 
                if (!(xmlWindow.BOOMR && xmlWindow.BOOMR.proxy_XMLHttpRequest)) {
                    xmlWindow.__nativeXHR = xmlWindow.XMLHttpRequest;
                    xmlWindow.XMLHttpRequest = XMLHttpRequestWrapper(xmlWindow);
                } else {
                    var XHRnv = XMLHttpRequestWrapper(xmlWindow, xmlWindow.BOOMR.orig_XMLHttpRequest);
                    xmlWindow.__nativeXHR = xmlWindow.BOOMR.orig_XMLHttpRequest;
                    xmlWindow.BOOMR.orig_XMLHttpRequest = XHRnv;

                    xmlWindow.XMLHttpRequest = XHRnv;
                }
            }

            // enable fetch for all frames
            fetchRequestWrapper(xmlWindow);
            if (itrIframe && CAVNV.monitorIframe == true) {
                var f = xmlWindow.document.getElementsByTagName('iframe');
                for (var z = 0; z < f.length; z++) {
                    try {
                        var iframeWindow = f[z].contentWindow;
                        this.enable(iframeWindow, itrIframe);
                    }
                    catch (e) {
                        continue;
                    }
                }
            }
        }

        XMLServer.prototype.disable = function (w) {
            var xmlWindow = w || this.window;

            //Check if it is not enabled.  
            if (xmlWindow.__nativeXHR == undefined)
                return;
            //On each window compare it with it's with nativeXHR. if that is set then only we will change. 
            if (xmlWindow.XMLHttpRequest != xmlWindow.__nativeXHR)
                xmlWindow.XMLHttpRequest = xmlWindow.__nativeXHR;

            if (xmlWindow === this.window && w.orig_fetch && xmlWindow.fetch !== w.orig_fetch) {
                xmlWindow.fetch = w.orig_fetch;
            }

            if (CAVNV.monitorIframe == true) {
                var f = xmlWindow.document.getElementsByTagName('iframe');
                for (var z = 0; z < f.length; z++) {
                    try {
                        var iframeWindow = f[z].contentWindow;
                        this.disable(iframeWindow);
                    }
                    catch (e) {
                        continue;
                    }
                }
            }
        }

        function xmlClient(options, w, d) {
            //If no running server then start it.
            if (!xmlp) {
                new XMLServer(w, d);
                if (!xmlp) return;
            }
            this.xmlp = xmlp;

            this.callback = {
                'ajaxComplete': [], //Note: each callback will be array of size 3. 1. callback, 2. args, 3. scope.
                'ajaxError': [],
                'ajaxSend': [],
                'ajaxStart': [],
                'ajaxStop': [],
                'ajaxSuccess': []
            }
            this.setOptions(options);

            //this are local counters.
            //request counters.
            this.stats = {
                requestStarted: 0,
                requestCompleted: 0,
                //Note: currently all abort, timeout, internal error and otheres will come in this category.
                requestFailed: 0
            };

            //add this client into server.
            xmlp.addClient(this);
        }

        xmlClient.prototype.setOptions = function (options) {
            this.options = {
                captureRSCtiming: false,
                captureCrossDomain: false,
                capturePostData: false,
                filters: {
                    mode: "whitelist",
                    entry: []
                }
            };
            for (k in this.options) {
                if (options[k] != undefined) {
                    if (k == "captureCrossDomain" && CAVNV.config.AjaxMonitor.captureCrossDomain)
                        options[k] = true;
                    this.options[k] = options[k];
                }
            }

            //update global setting
            for (k in this.xmlp.options) {
                //Note: if any configuraion was disabled then enable it. 
                if (this.xmlp.options[k] == false)
                    this.xmlp.options[k] = this.options[k];
            }
        }

        //Following events are possible.
        //ajaxComplete, ajaxError, ajaxSend, ajaxStart, ajaxStop and ajaxSuccess.
        xmlClient.prototype.addEventListener = function (event, cb, cb_scope) {
            //Invalid event.
            if (!this.callback[event]) return;

            //Compare with already existing callbacks.
            var cbs = this.callback[event];
            for (var z = 0; z < cbs.length; z++) {
                //Currently we are not handling for extra arguments.
                if (cbs[z][0] == cb && cbs[z][1] == cb_scope)
                    return;
            }
            //add in array.
            this.callback[event].push([cb, cb_scope || this.xmlp.window]);
        }

        //TODO: handle the case when we have multiple args
        xmlClient.prototype.trigger = function (event, args) {
            if (!this.callback[event]) return;
            //call callback.
            var cbs = this.callback[event];
            // combine both the args.
            args = args || [];
            for (var z = 0; z < cbs.length; z++) {
                try {
                    cbs[z][0].apply(cbs[z][1], args);
                } catch (e) { }
            }
        }

        xmlClient.prototype.distroy = function () {
            this.xmlp.removeClient(this);
        }

        xmlClient.prototype.getRequestCount = function () {
            return this.stats;
        }

        //set this method to xmlClient.
        xmlClient.isFiltered = isFiltered;

        xmlClient.isFailedStatus = isFailedStatus;

        xmlClient.getURL = getURL;

        return xmlClient;
    })();
    w.XMLProfiler = XMLProfiler;

    /****JSON*******/

    // Create a JSON object only if one does not already exist. We create the
    // methods in a closure to avoid creating global variables.
    JSON = w.JSON || (function () {
        'use strict';

        JSON = {};
        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        if (typeof Date.prototype.toJSON !== 'function') {

            Date.prototype.toJSON = function () {

                return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z' : null;
            };

            String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
        }

        var cx, escapable, gap, indent, meta, rep;

        function quote(string) {
            // If the string contains no control characters, no quote characters, and no
            // backslash characters, then we can safely slap some quotes around it.
            // Otherwise we must also replace the offending characters with safe escape
            // sequences.
            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }

        function str(key, holder) {
            var i, // The loop counter.
                k, // The member key.
                v, // The member value.
                length, mind = gap,
                partial, value = holder[key];

            // If the value has a toJSON method, call it to obtain a replacement value.
            if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }

            // If we were called with a replacer function, then call the replacer to
            // obtain a replacement value.
            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }

            // What happens next depends on the value's type.
            switch (typeof value) {
                case 'string':
                    return quote(value);
                case 'number':
                    // JSON numbers must be finite. Encode non-finite numbers as null.
                    return isFinite(value) ? String(value) : 'null';
                case 'boolean':
                case 'null':
                    // If the value is a boolean or null, convert it to a string. Note:
                    // typeof null does not produce 'null'. The case is included here in
                    // the remote chance that this gets fixed someday.
                    return String(value);
                // If the type is 'object', we might be dealing with an object or an array or
                // null.
                case 'object':
                    // Due to a specification blunder in ECMAScript, typeof null is 'object',
                    // so watch out for that case.
                    if (!value) {
                        return 'null';
                    }
                    // Make an array to hold the partial results of stringifying this object value.
                    gap += indent;
                    partial = [];
                    // Is the value an array?
                    if (Object.prototype.toString.apply(value) === '[object Array]') {
                        // The value is an array. Stringify every element. Use null as a placeholder
                        // for non-JSON values.
                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || 'null';
                        }
                        // Join all of the elements together, separated with commas, and wrap them in
                        // brackets.
                        v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
                        gap = mind;
                        return v;
                    }
                    // If the replacer is an array, use it to select the members to be stringified.
                    if (rep && typeof rep === 'object') {
                        length = rep.length;
                        for (i = 0; i < length; i += 1) {
                            if (typeof rep[i] === 'string') {
                                k = rep[i];
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    } else {
                        // Otherwise, iterate through all of the keys in the object.
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    }
                    // Join all of the member texts together, separated with commas,
                    // and wrap them in braces.
                    v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
                    gap = mind;
                    return v;
            }
        }

        // If the JSON object does not yet have a stringify method, give it one.
        if (typeof JSON.stringify !== 'function') {
            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
            meta = { // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            };

            JSON.stringify = function (value, replacer, space) {
                // The stringify method takes a value and an optional replacer, and an optional
                // space parameter, and returns a JSON text. The replacer can be a function
                // that can replace values, or an array of strings that will select the keys.
                // A default replacer method can be provided. Use of the space parameter can
                // produce text that is more easily readable.
                var i;
                gap = '';
                indent = '';
                // If the space parameter is a number, make an indent string containing that
                // many spaces.
                if (typeof space === 'number') {
                    for (i = 0; i < space; i += 1) {
                        indent += ' ';
                    }
                    // If the space parameter is a string, it will be used as the indent string.
                } else if (typeof space === 'string') {
                    indent = space;
                }
                // If there is a replacer, it must be a function or an array.
                // Otherwise, throw an error.
                rep = replacer;
                if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
                    throw new Error('JSON.stringify');
                }
                // Make a fake root object containing our value under the key of ''.
                // Return the result of stringifying the value.
                return str('', {
                    '': value
                });
            };
        }
        // If the JSON object does not yet have a parse method, give it one .
        if (typeof JSON.parse !== 'function') {
            cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
            JSON.parse = function (text, reviver) {
                // The parse method takes a text and an optional reviver function, and returns
                // a JavaScript value if the text is a valid JSON text.
                var j;
                function walk(holder, key) {
                    // The walk method is used to recursively walk the resulting structure so
                    // that modifications can be made.
                    var k, v, value = holder[key];
                    if (value && typeof value === 'object') {
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }

                // Parsing happens in four stages. In the first stage, we replace certain
                // Unicode characters with escape sequences. JavaScript handles many characters
                // incorrectly, either silently deleting them, or treating them as line endings.
                text = String(text);
                cx.lastIndex = 0;
                if (cx.test(text)) {
                    text = text.replace(cx, function (a) {
                        return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                    });
                }

                // In the second stage, we run the text against regular expressions that look
                // for non-JSON patterns. We are especially concerned with '()' and 'new'
                // because they can cause invocation, and '=' because it can cause mutation.
                // But just to be safe, we want to reject all unexpected forms.
                // We split the second stage into 4 regexp operations in order to work around
                // crippling inefficiencies in IE's and Safari's regexp engines. First we
                // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
                // replace all simple value tokens with ']' characters. Third, we delete all
                // open brackets that follow a colon or comma or that begin the text. Finally,
                // we look to see that the remaining characters are only whitespace or ']' or
                // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
                if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                    // In the third stage we use the eval function to compile the text into a
                    // JavaScript structure. The '{' operator is subject to a syntactic ambiguity }
                    // in JavaScript: it can begin a block or an object literal. We wrap the text
                    // in parens to eliminate the ambiguity.
                    j = eval('(' + text + ')');
                    // In the optional fourth stage, we recursively walk the new structure, passing
                    // each name/value pair to a reviver function for possible transformation.
                    return typeof reviver === 'function' ? walk({
                        '': j
                    },
                        '') : j;
                }
                // If the text is not JSON parseable, then a SyntaxError is thrown.
                throw new SyntaxError('JSON.parse');
            };
        }
        //It's good to set this on window.
        w.JSON = JSON;
        return JSON;
    }());

    /*********Array.map*************/
    if (!Array.prototype.map) {
        Array.prototype.map = function (callback, thisArg) {
            var T, A, k;
            if (this == null) {
                throw new TypeError(" this is null or not defined");
            }
            // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
            var O = Object(this);
            // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;
            // 4. If IsCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if (typeof callback !== "function") {
                throw new TypeError(callback + " is not a function");
            }
            // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (arguments.length > 1) {
                T = thisArg;
            }
            // 6. Let A be a new array created as if by the expression new Array( len) where Array is
            // the standard built-in constructor with that name and len is the value of len.
            A = new Array(len);
            // 7. Let k be 0
            k = 0;
            // 8. Repeat, while k < len
            while (k < len) {
                var kValue, mappedValue;
                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                if (k in O) {
                    // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                    kValue = O[k];
                    // ii. Let mappedValue be the result of calling the Call internal method of callback
                    // with T as the this value and argument list containing kValue, k, and O.
                    mappedValue = callback.call(T, kValue, k, O);
                    // iii. Call the DefineOwnProperty internal method of A with arguments
                    // Pk, Property Descriptor {Value: mappedValue, Writable: true, Enumerable: true, Configurable: true},
                    // and false.
                    // In browsers that support Object.defineProperty, use the following:
                    // Object.defineProperty( A, k, { value: mappedValue, writable: true, enumerable: true, configurable: true });
                    // For best browser support, use the following:
                    A[k] = mappedValue;
                }
                // d. Increase k by 1.
                k++;
            }
            // 9. return A
            return A;
        };
    }

    /***********************zip*****************/
    var ZlibStr = 'Zlib=(function(){var A=void 0,x=!0,O=this;function B(C,F){var H=C.split("."),v=O;!(H[0] in v)&&v.execScript&&v.execScript("var "+H[0]);for(var p;H.length&&(p=H.shift());){!H.length&&F!==A?v[p]=F:v=v[p]?v[p]:v[p]={}}}var z="undefined"!==typeof Uint8Array&&"undefined"!==typeof Uint16Array&&"undefined"!==typeof Uint32Array&&"undefined"!==typeof DataView;function y(p,v){this.index="number"===typeof v?v:0;this.f=0;this.buffer=p instanceof (z?Uint8Array:Array)?p:new (z?Uint8Array:Array)(32768);if(2*this.buffer.length<=this.index){throw Error("invalid index")}this.buffer.length<=this.index&&P(this)}function P(C){var F=C.buffer,H,v=F.length,p=new (z?Uint8Array:Array)(v<<1);if(z){p.set(F)}else{for(H=0;H<v;++H){p[H]=F[H]}}return C.buffer=p}y.prototype.b=function(M,N,Q){var F=this.buffer,v=this.index,H=this.f,C=F[v],p;Q&&1<N&&(M=8<N?(t[M&255]<<24|t[M>>>8&255]<<16|t[M>>>16&255]<<8|t[M>>>24&255])>>32-N:t[M]>>8-N);if(8>N+H){C=C<<N|M,H+=N}else{for(p=0;p<N;++p){C=C<<1|M>>N-p-1&1,8===++H&&(H=0,F[v++]=t[C],C=0,v===F.length&&(F=P(this)))}}F[v]=C;this.buffer=F;this.f=H;this.index=v};y.prototype.finish=function(){var p=this.buffer,v=this.index,C;0<this.f&&(p[v]<<=8-this.f,p[v]=t[p[v]],v++);z?C=p.subarray(0,v):(p.length=v,C=p);return C};var D=new (z?Uint8Array:Array)(256),n;for(n=0;256>n;++n){for(var m=n,l=m,a=7,m=m>>>1;m;m>>>=1){l<<=1,l|=m&1,--a}D[n]=(l<<a&255)>>>0}var t=D;function o(F,H,M){var v,p="number"===typeof H?H:H=0,C="number"===typeof M?M:F.length;v=-1;for(p=C&7;p--;++H){v=v>>>8^j[(v^F[H])&255]}for(p=C>>3;p--;H+=8){v=v>>>8^j[(v^F[H])&255],v=v>>>8^j[(v^F[H+1])&255],v=v>>>8^j[(v^F[H+2])&255],v=v>>>8^j[(v^F[H+3])&255],v=v>>>8^j[(v^F[H+4])&255],v=v>>>8^j[(v^F[H+5])&255],v=v>>>8^j[(v^F[H+6])&255],v=v>>>8^j[(v^F[H+7])&255]}return(v^4294967295)>>>0}var E=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,936918000,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],j=z?new Uint32Array(E):E;function i(p){this.buffer=new (z?Uint16Array:Array)(2*p);this.length=0}i.prototype.getParent=function(p){return 2*((p-2)/4|0)};i.prototype.push=function(F,H){var M,v,p=this.buffer,C;M=this.length;p[this.length++]=H;for(p[this.length++]=F;0<M;){if(v=this.getParent(M),p[M]>p[v]){C=p[M],p[M]=p[v],p[v]=C,C=p[M+1],p[M+1]=p[v+1],p[v+1]=C,M=v}else{break}}return this.length};i.prototype.pop=function(){var F,H,M=this.buffer,v,p,C;H=M[0];F=M[1];this.length-=2;M[0]=M[this.length];M[1]=M[this.length+1];for(C=0;;){p=2*C+2;if(p>=this.length){break}p+2<this.length&&M[p+2]>M[p]&&(p+=2);if(M[p]>M[C]){v=M[C],M[C]=M[p],M[p]=v,v=M[C+1],M[C+1]=M[p+1],M[p+1]=v}else{break}C=p}return{index:F,value:H,length:this.length}};function b(p,v){this.h=q;this.j=0;this.input=z&&p instanceof Array?new Uint8Array(p):p;this.c=0;v&&(v.lazy&&(this.j=v.lazy),"number"===typeof v.compressionType&&(this.h=v.compressionType),v.outputBuffer&&(this.a=z&&v.outputBuffer instanceof Array?new Uint8Array(v.outputBuffer):v.outputBuffer),"number"===typeof v.outputIndex&&(this.c=v.outputIndex));this.a||(this.a=new (z?Uint8Array:Array)(32768))}var q=2,h=[],k;for(k=0;288>k;k++){switch(x){case 143>=k:h.push([k+48,8]);break;case 255>=k:h.push([k-144+400,9]);break;case 279>=k:h.push([k-256+0,7]);break;case 287>=k:h.push([k-280+192,8]);break;default:throw"invalid literal: "+k}}b.prototype.g=function(){var aQ,aR,aT,aV,aU=this.input;switch(this.h){case 0:aT=0;for(aV=aU.length;aT<aV;){aR=z?aU.subarray(aT,aT+65535):aU.slice(aT,aT+65535);aT+=aR.length;var aP=aR,aM=aT===aV,aL=A,aS=A,aO=A,aF=A,ay=A,aK=this.a,aN=this.c;if(z){for(aK=new Uint8Array(this.a.buffer);aK.length<=aN+aP.length+5;){aK=new Uint8Array(aK.length<<1)}aK.set(this.a)}aL=aM?1:0;aK[aN++]=aL|0;aS=aP.length;aO=~aS+65536&65535;aK[aN++]=aS&255;aK[aN++]=aS>>>8&255;aK[aN++]=aO&255;aK[aN++]=aO>>>8&255;if(z){aK.set(aP,aN),aN+=aP.length,aK=aK.subarray(0,aN)}else{aF=0;for(ay=aP.length;aF<ay;++aF){aK[aN++]=aP[aF]}aK.length=aN}this.c=aN;this.a=aK}break;case 1:var aI=new y(z?new Uint8Array(this.a.buffer):this.a,this.c);aI.b(1,1,x);aI.b(1,2,x);var aB=G(this,aU),az,an,aw;az=0;for(an=aB.length;az<an;az++){if(aw=aB[az],y.prototype.b.apply(aI,h[aw]),256<aw){aI.b(aB[++az],aB[++az],x),aI.b(aB[++az],5),aI.b(aB[++az],aB[++az],x)}else{if(256===aw){break}}}this.a=aI.finish();this.c=this.a.length;break;case q:var al=new y(z?new Uint8Array(this.a.buffer):this.a,this.c),aD,ae,ad,ab,V,at=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],M,ap,H,S,aW,p=Array(19),aH,T,av,ax,ar;aD=q;al.b(1,1,x);al.b(aD,2,x);ae=G(this,aU);M=c(this.n,15);ap=r(M);H=c(this.m,7);S=r(H);for(ad=286;257<ad&&0===M[ad-1];ad--){}for(ab=30;1<ab&&0===H[ab-1];ab--){}var U=ad,aJ=ab,ai=new (z?Uint32Array:Array)(U+aJ),aG,ah,aC,F,aj=new (z?Uint32Array:Array)(316),ak,am,ag=new (z?Uint8Array:Array)(19);for(aG=ah=0;aG<U;aG++){ai[ah++]=M[aG]}for(aG=0;aG<aJ;aG++){ai[ah++]=H[aG]}if(!z){aG=0;for(F=ag.length;aG<F;++aG){ag[aG]=0}}aG=ak=0;for(F=ai.length;aG<F;aG+=ah){for(ah=1;aG+ah<F&&ai[aG+ah]===ai[aG];++ah){}aC=ah;if(0===ai[aG]){if(3>aC){for(;0<aC--;){aj[ak++]=0,ag[0]++}}else{for(;0<aC;){am=138>aC?aC:138,am>aC-3&&am<aC&&(am=aC-3),10>=am?(aj[ak++]=17,aj[ak++]=am-3,ag[17]++):(aj[ak++]=18,aj[ak++]=am-11,ag[18]++),aC-=am}}}else{if(aj[ak++]=ai[aG],ag[ai[aG]]++,aC--,3>aC){for(;0<aC--;){aj[ak++]=ai[aG],ag[ai[aG]]++}}else{for(;0<aC;){am=6>aC?aC:6,am>aC-3&&am<aC&&(am=aC-3),aj[ak++]=16,aj[ak++]=am-3,ag[16]++,aC-=am}}}}aQ=z?aj.subarray(0,ak):aj.slice(0,ak);aW=c(ag,7);for(ax=0;19>ax;ax++){p[ax]=aW[at[ax]]}for(V=19;4<V&&0===p[V-1];V--){}aH=r(aW);al.b(ad-257,5,x);al.b(ab-1,5,x);al.b(V-4,4,x);for(ax=0;ax<V;ax++){al.b(p[ax],3,x)}ax=0;for(ar=aQ.length;ax<ar;ax++){if(T=aQ[ax],al.b(aH[T],aW[T],x),16<=T){ax++;switch(T){case 16:av=2;break;case 17:av=3;break;case 18:av=7;break;default:throw"invalid code: "+T}al.b(aQ[ax],av,x)}}var au=[ap,M],ac=[S,H],af,aA,C,v,ao,N,aE,aq;ao=au[0];N=au[1];aE=ac[0];aq=ac[1];af=0;for(aA=ae.length;af<aA;++af){if(C=ae[af],al.b(ao[C],N[C],x),256<C){al.b(ae[++af],ae[++af],x),v=ae[++af],al.b(aE[v],aq[v],x),al.b(ae[++af],ae[++af],x)}else{if(256===C){break}}}this.a=al.finish();this.c=this.a.length;break;default:throw"invalid compression type"}return this.a};function I(p,v){this.length=p;this.k=v}var d=function(){function v(H){switch(x){case 3===H:return[257,H-3,0];case 4===H:return[258,H-4,0];case 5===H:return[259,H-5,0];case 6===H:return[260,H-6,0];case 7===H:return[261,H-7,0];case 8===H:return[262,H-8,0];case 9===H:return[263,H-9,0];case 10===H:return[264,H-10,0];case 12>=H:return[265,H-11,1];case 14>=H:return[266,H-13,1];case 16>=H:return[267,H-15,1];case 18>=H:return[268,H-17,1];case 22>=H:return[269,H-19,2];case 26>=H:return[270,H-23,2];case 30>=H:return[271,H-27,2];case 34>=H:return[272,H-31,2];case 42>=H:return[273,H-35,3];case 50>=H:return[274,H-43,3];case 58>=H:return[275,H-51,3];case 66>=H:return[276,H-59,3];case 82>=H:return[277,H-67,4];case 98>=H:return[278,H-83,4];case 114>=H:return[279,H-99,4];case 130>=H:return[280,H-115,4];case 162>=H:return[281,H-131,5];case 194>=H:return[282,H-163,5];case 226>=H:return[283,H-195,5];case 257>=H:return[284,H-227,5];case 258===H:return[285,H-258,0];default:throw"invalid length: "+H}}var C=[],F,p;for(F=3;258>=F;F++){p=v(F),C[F]=p[2]<<24|p[1]<<16|p[0]}return C}(),J=z?new Uint32Array(d):d;function G(V,W){function Y(aj,ag){var ak=aj.k,ai=[],ae=0,af;af=J[aj.length];ai[ae++]=af&65535;ai[ae++]=af>>16&255;ai[ae++]=af>>24;var ah;switch(x){case 1===ak:ah=[0,ak-1,0];break;case 2===ak:ah=[1,ak-2,0];break;case 3===ak:ah=[2,ak-3,0];break;case 4===ak:ah=[3,ak-4,0];break;case 6>=ak:ah=[4,ak-5,1];break;case 8>=ak:ah=[5,ak-7,1];break;case 12>=ak:ah=[6,ak-9,2];break;case 16>=ak:ah=[7,ak-13,2];break;case 24>=ak:ah=[8,ak-17,3];break;case 32>=ak:ah=[9,ak-25,3];break;case 48>=ak:ah=[10,ak-33,4];break;case 64>=ak:ah=[11,ak-49,4];break;case 96>=ak:ah=[12,ak-65,5];break;case 128>=ak:ah=[13,ak-97,5];break;case 192>=ak:ah=[14,ak-129,6];break;case 256>=ak:ah=[15,ak-193,6];break;case 384>=ak:ah=[16,ak-257,7];break;case 512>=ak:ah=[17,ak-385,7];break;case 768>=ak:ah=[18,ak-513,8];break;case 1024>=ak:ah=[19,ak-769,8];break;case 1536>=ak:ah=[20,ak-1025,9];break;case 2048>=ak:ah=[21,ak-1537,9];break;case 3072>=ak:ah=[22,ak-2049,10];break;case 4096>=ak:ah=[23,ak-3073,10];break;case 6144>=ak:ah=[24,ak-4097,11];break;case 8192>=ak:ah=[25,ak-6145,11];break;case 12288>=ak:ah=[26,ak-8193,12];break;case 16384>=ak:ah=[27,ak-12289,12];break;case 24576>=ak:ah=[28,ak-16385,13];break;case 32768>=ak:ah=[29,ak-24577,13];break;default:throw"invalid distance"}af=ah;ai[ae++]=af[0];ai[ae++]=af[1];ai[ae++]=af[2];var ad,aa;ad=0;for(aa=ai.length;ad<aa;++ad){N[S++]=ai[ad]}F[ai[0]]++;C[ai[3]]++;M=aj.length+ag-1;v=null}var ab,Z,U,R,Q,X={},T,H,v,N=z?new Uint16Array(2*W.length):[],S=0,M=0,F=new (z?Uint32Array:Array)(286),C=new (z?Uint32Array:Array)(30),ac=V.j,p;if(!z){for(U=0;285>=U;){F[U++]=0}for(U=0;29>=U;){C[U++]=0}}F[256]=1;ab=0;for(Z=W.length;ab<Z;++ab){U=Q=0;for(R=3;U<R&&ab+U!==Z;++U){Q=Q<<8|W[ab+U]}X[Q]===A&&(X[Q]=[]);T=X[Q];if(!(0<M--)){for(;0<T.length&&32768<ab-T[0];){T.shift()}if(ab+3>=Z){v&&Y(v,-1);U=0;for(R=Z-ab;U<R;++U){p=W[ab+U],N[S++]=p,++F[p]}break}0<T.length?(H=e(W,ab,T),v?v.length<H.length?(p=W[ab-1],N[S++]=p,++F[p],Y(H,0)):Y(v,-1):H.length<ac?v=H:Y(H,0)):v?Y(v,-1):(p=W[ab],N[S++]=p,++F[p])}T.push(ab)}N[S++]=256;F[256]++;V.n=F;V.m=C;return z?N.subarray(0,S):N}function e(H,M,Q){var S,R,F=0,v,p,N,C,T=H.length;p=0;C=Q.length;S:for(;p<C;p++){S=Q[C-p-1];v=3;if(3<F){for(N=F;3<N;N--){if(H[S+N-1]!==H[M+N-1]){continue S}}v=F}for(;258>v&&M+v<T&&H[S+v]===H[M+v];){++v}v>F&&(R=S,F=v);if(258===v){break}}return new I(F,M-R)}function c(H,M){var Q=H.length,S=new i(572),R=new (z?Uint8Array:Array)(Q),F,v,p,N,C;if(!z){for(N=0;N<Q;N++){R[N]=0}}for(N=0;N<Q;++N){0<H[N]&&S.push(N,H[N])}F=Array(S.length/2);v=new (z?Uint32Array:Array)(S.length/2);if(1===F.length){return R[S.pop().index]=1,R}N=0;for(C=S.length/2;N<C;++N){F[N]=S.pop(),v[N]=F[N].value}p=s(v,v.length,M);N=0;for(C=F.length;N<C;++N){R[F[N].index]=p[N]}return R}function s(Q,R,T){function W(aa){var ab=S[aa][M[aa]];ab===R?(W(aa+1),W(aa+1)):--F[ab];++M[aa]}var U=new (z?Uint16Array:Array)(T),N=new (z?Uint8Array:Array)(T),F=new (z?Uint8Array:Array)(R),C=Array(T),S=Array(T),M=Array(T),Z=(1<<T)-R,V=1<<T-1,v,H,p,Y,X;U[T-1]=R;for(H=0;H<T;++H){Z<V?N[H]=0:(N[H]=1,Z-=V),Z<<=1,U[T-2-H]=(U[T-1-H]/2|0)+R}U[0]=N[0];C[0]=Array(U[0]);S[0]=Array(U[0]);for(H=1;H<T;++H){U[H]>2*U[H-1]+N[H]&&(U[H]=2*U[H-1]+N[H]),C[H]=Array(U[H]),S[H]=Array(U[H])}for(v=0;v<R;++v){F[v]=T}for(p=0;p<U[T-1];++p){C[T-1][p]=Q[p],S[T-1][p]=p}for(v=0;v<T;++v){M[v]=0}1===N[T-1]&&(--F[0],++M[T-1]);for(H=T-2;0<=H;--H){Y=v=0;X=M[H+1];for(p=0;p<U[H];p++){Y=C[H+1][X]+C[H+1][X+1],Y>Q[v]?(C[H][p]=Y,S[H][p]=R,X+=2):(C[H][p]=Q[v],S[H][p]=v,++v)}M[H]=0;1===N[H]&&W(H)}return F}function r(F){var H=new (z?Uint16Array:Array)(F.length),N=[],R=[],Q=0,C,v,p,M;C=0;for(v=F.length;C<v;C++){N[F[C]]=(N[F[C]]|0)+1}C=1;for(v=16;C<=v;C++){R[C]=Q,Q+=N[C]|0,Q<<=1}C=0;for(v=F.length;C<v;C++){Q=R[F[C]];R[F[C]]+=1;p=H[C]=0;for(M=F[C];p<M;p++){H[C]=H[C]<<1|Q&1,Q>>>=1}}return H}function K(p,v){this.input=p;this.c=this.i=0;this.d={};v&&(v.flags&&(this.d=v.flags),"string"===typeof v.filename&&(this.filename=v.filename),"string"===typeof v.comment&&(this.l=v.comment),v.deflateOptions&&(this.e=v.deflateOptions));this.e||(this.e={})}K.prototype.g=function(){var N,Q,S,V,T,M,C,v,R=new (z?Uint8Array:Array)(32768),H=0,W=this.input,U=this.i,p=this.filename,F=this.l;R[H++]=31;R[H++]=139;R[H++]=8;N=0;this.d.fname&&(N|=f);this.d.fcomment&&(N|=u);this.d.fhcrc&&(N|=L);R[H++]=N;Q=(Date.now?Date.now():+new Date)/1000|0;R[H++]=Q&255;R[H++]=Q>>>8&255;R[H++]=Q>>>16&255;R[H++]=Q>>>24&255;R[H++]=0;R[H++]=g;if(this.d.fname!==A){C=0;for(v=p.length;C<v;++C){M=p.charCodeAt(C),255<M&&(R[H++]=M>>>8&255),R[H++]=M&255}R[H++]=0}if(this.d.comment){C=0;for(v=F.length;C<v;++C){M=F.charCodeAt(C),255<M&&(R[H++]=M>>>8&255),R[H++]=M&255}R[H++]=0}this.d.fhcrc&&(S=o(R,0,H)&65535,R[H++]=S&255,R[H++]=S>>>8&255);this.e.outputBuffer=R;this.e.outputIndex=H;T=new b(W,this.e);R=T.g();H=T.c;z&&(H+8>R.buffer.byteLength?(this.a=new Uint8Array(H+8),this.a.set(new Uint8Array(R.buffer)),R=this.a):R=new Uint8Array(R.buffer));V=o(W,A,A);R[H++]=V&255;R[H++]=V>>>8&255;R[H++]=V>>>16&255;R[H++]=V>>>24&255;v=W.length;R[H++]=v&255;R[H++]=v>>>8&255;R[H++]=v>>>16&255;R[H++]=v>>>24&255;this.i=U;z&&H<R.length&&(this.a=R=R.subarray(0,H));return R};var g=255,L=2,f=8,u=16;B("Zlib.Gzip",K);B("Zlib.Gzip.prototype.compress",K.prototype.g);if(typeof w!="undefined"){w.Zlib=Zlib}return Zlib}).call(this);';

    try {
        eval(ZlibStr);
    }
    catch (e) {
        if (console && typeof console.error == "function")
            console.error('Zlib parsing error - ' + e);
    }

    var CAVUA = {};
    (function (window, document) {
        var RegisterEventLList = {};
        var lastMouseMove = null;
        var lastMouseMoveLogged = null;
        var mouseMoveData = "";
        var mouseHoverData = [];
        var lstmx = 0;
        var lstmy = 0;
        //All o used in publushEvent are replaced by o.
        var MyEvent = null;
        //var TouchEvent = false;
        var changeTarget;
        var userAgent1 = false, p = !1, q = !1;

        if (!!navigator.platform)
            userAgent1 = /iPad|iPhone|iPod/.test(navigator.platform);
        else
            userAgent1 = window.navigator.userAgent.indexOf("iPhone") > -1 || navigator.userAgent.indexOf("iPod") > -1 || navigator.userAgent.indexOf("iPad") > -1;

        var defaultConfig = {
            events: [{
                name: "load",
                target: window
            },
            {
                name: "change",
                target: changeTarget,
                recurseFrames: true
            },
            {
                name: "click",
                recurseFrames: true
            },
            {
                name: "unload",
                target: window
            },
            {
                name: "nvload",
                target: window
            },
            {
                name: "nvunload",
                target: window
            },
            {
                name: "focus",
                target: changeTarget,
                recurseFrames: true
            },
            {
                name: "blur",
                target: changeTarget,
                recurseFrames: true
            },
            /*
                {
                  name: "resize",
                  target: window
                },
            */
            {
                name: "hashchange",
                target: window
            },
            {
                name: "scroll",
                target: window
            },
            {
                name: "orientationchange",
                target: window
            },
            {
                name: "touchstart"
            },
            {
                name: "touchend"
            }
            ],
            browserConfig: {
                useCapture: true,
                jQueryObject: window.jQuery
            }
        };
        var CurrentConfig = null;

        CAVUA.utils = {
            //TODO: handle it carefully.
            _handleTouchStart: function (touchStartEvent) {
                var counter;
                var counter1;
                if (userAgent1) {
                    return false;
                }
                if (null === MyEvent) {
                    return MyEvent = touchStartEvent,
                        true;
                }
                counter = 0;
                for (; counter < MyEvent.nativeEvent.touches.length; counter += 1) {
                    counter1 = 0;
                    for (; counter1 < touchStartEvent.nativeEvent.touches.length; counter1 += 1) {
                        if (MyEvent.nativeEvent.touches[counter] === touchStartEvent.nativeEvent.touches[counter1]) {
                            return true;
                        }
                    }
                }
                return CAVUA.utils._prepNonIosTouchEnd(),
                    MyEvent = touchStartEvent,
                    true;
            },
            _getElementAttr: function (ele) {
                //fill other attributes. 
                var attr = {};
                if (ele.id) { attr['id'] = ele.id; }
                if (ele.className && ele.className !== '') { attr['class'] = ele.className; }
                if (ele.title && ele.title !== '') { attr['title'] = ele.title; }
                if (ele.nodeName == 'IMG') {
                    if (ele.alt && ele.alt !== '') { attr['alt'] = ele.alt; }
                    if (ele.src && ele.src != '') { attr['src'] = ele.src; }
                }
                if (ele.nodeName == 'A') {
                    if (ele.href && ele.href !== '') { attr['href'] = ele.href; }
                    //linkText - 
                    var text = ele.textContent;
                    if (!text.match(/^\s*$/)) {
                        attr['linkText'] = text.replace(/\xA0/g, " ").replace(/^\s*(.*?)\s*$/, "$1");
                    }
                }
                //add form name too. 
                if (ele.form) {
                    if (ele.form.name && ele.form.name !== '') { attr['fname'] = ele.form.name; }
                    if (ele.form.id && ele.form.id !== '') { attr['fid'] = ele.form.id; }
                }
                return attr;
            },
            _handleTouchMove: function (touchMoveEvent) {
                if (!userAgent1) {
                    MyEvent = touchMoveEvent;
                }
            },
            _handleTouchScroll: function (touchScrollEvent) {
                return userAgent1 ? false : (null !== MyEvent && ("scroll" === touchScrollEvent.type && (MyEvent.target.position.x = touchScrollEvent.target.position.x, MyEvent.target.position.y = touchScrollEvent.target.position.y, p = true)), true);
            },
            _prepNonIosTouchEnd: function () {
                var booleanVar = false;
                if (MyEvent !== null) {
                    //Keep MyEvent in local variable as it can be reset by publishEvent. 
                    var mEvent = MyEvent;
                    mEvent.type = mEvent.nativeEvent.type = 'touchend';
                    CAVUA.utils._publishEvent(mEvent);

                    if (p) {
                        mEvent.type = mEvent.nativeEvent.type = 'scroll';
                        q = !0;
                        CAVUA.utils._publishEvent(mEvent);
                        booleanVar = true;
                    }

                    MyEvent = null;
                    p = !1, q = !1;
                }
                return booleanVar;
            },
            _publishEvent: function (currentEvent) {
                //Replay.onevent(currentEvent);
                //in pr_ModuleArray p refers performance and r is for replay
                CAVNV.log("currentEvent - " + currentEvent.type);
                var counter$$0;
                var lengthArray;
                var currentTargetElement;
                var pr_ModuleArray1 = null;
                var objectModule = null;
                var currentEventName = currentEvent.delegateTarget && currentEvent.data ? currentEvent.data : CAVUA.utils._buildToken4currentTarget(currentEvent);
                var pr_ModuleArray = null;
                var loadUnloadEvent = null;
                var booleanVar = false;
                var chkTrueFalse = false;
                var objectService = CAVUA.Browser;
                var targetElement;
                var delegateTargetElement = currentEvent.delegateTarget || null;
                //delegateTarget returns the element where the current event is called and
                //currentTarget returns the element on which the current event is occurs
                if (("load" !== currentEvent.type && "pageshow" !== currentEvent.type || currentEvent.nativeEvent.customLoad) && (!userAgent1 || "touchstart" !== currentEvent.type && "touchmove" !== currentEvent.type)) {
                    if (null !== MyEvent && ("touchstart" !== currentEvent.type && ("touchmove" !== currentEvent.type && ("scroll" !== currentEvent.type && "touchend" !== currentEvent.type)))) {
                        CAVUA.utils._prepNonIosTouchEnd();
                    } else {
                        if ("touchstart" === currentEvent.type) {
                            return void CAVUA.utils._handleTouchStart(currentEvent);
                        }
                        if ("touchmove" === currentEvent.type) {
                            return void CAVUA.utils._handleTouchMove(currentEvent);
                        }
                        if (null !== MyEvent && ("scroll" === currentEvent.type && !q)) {
                            return void CAVUA.utils._handleTouchScroll(currentEvent);
                        }
                        if (currentEvent.type == 'touchend') {
                            MyEvent = null;
                        }
                        //TODO: review below line 
                        p && (currentEventName = "scroll|null-2|window")

                    }
                    if ((!CAVUA.utils.isIE() || ("click" === currentEvent.type && (targetElement = currentEvent.target.element), "beforeunload" !== currentEvent.type || (booleanVar = false, !booleanVar))) && (CAVUA.utils.function_j.isUnload(currentEvent) && (booleanVar = "unloading"), "change" !== currentEvent.type || (!CAVUA.utils.isLegacyIE() || ("w3c" !== CAVUA.utils.getFlavor() || "checkbox" !== currentEvent.target.element.type && "radio" !== currentEvent.target.element.type)))) {
                        if ("propertychange" === currentEvent.type) {
                            if ("checked" !== currentEvent.nativeEvent.propertyName || !("checkbox" === currentEvent.target.element.type || "radio" === currentEvent.target.element.type && currentEvent.target.element.checked)) {
                                return;
                            }
                            currentEvent.type = currentEvent.target.type = "change";
                        }
                        if (RegisterEventLList.hasOwnProperty(currentEventName) || (currentEvent.hasOwnProperty("nativeEvent") && (currentTargetElement = currentEvent.nativeEvent.currentTarget || currentEvent.nativeEvent.target), currentEventName = CAVUA.utils._buildToken4bubbleTarget(currentEvent.type, currentTargetElement, true, delegateTargetElement)), RegisterEventLList.hasOwnProperty(currentEventName)) {
                            pr_ModuleArray = RegisterEventLList[currentEventName];
                            counter$$0 = 0;
                            lengthArray = pr_ModuleArray.length;
                            for (; lengthArray > counter$$0; counter$$0 += 1) {
                                pr_ModuleArray1 = pr_ModuleArray[counter$$0];
                                //TODO: handle these cases bcaseue now we have only one module so need not to check other one(remove for loop).
                                objectModule = CAVUA.Replay; /*TODO: CHECK IT MyUtils.getModule(pr_ModuleArray1)*/
                                loadUnloadEvent = CAVUA.utils.mixin({},
                                    currentEvent);
                                if (objectModule) {
                                    if (CAVUA.utils.isStarted(pr_ModuleArray1)) {
                                        if ("function" == typeof objectModule.onevent) {
                                            chkTrueFalse = CAVUA.utils.function_j.canPublish(pr_ModuleArray1, loadUnloadEvent);
                                            if (chkTrueFalse) {
                                                objectModule.onevent(loadUnloadEvent);

                                                //Send event for FA Handling. 
                                                CAVNV.plugins.FA.onevent(loadUnloadEvent);
                                                if (CAVNV.plugins.ABTesting)
                                                    CAVNV.plugins.ABTesting.onevent(loadUnloadEvent);

                                                CAVNV.plugins.NavigationTiming.onevent(loadUnloadEvent);

                                                if (CAVNV.plugins.BD)
                                                    CAVNV.plugins.BD.onevent(loadUnloadEvent);

                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (loadUnloadEvent) {
                            if ("unload" === loadUnloadEvent.type) {
                                if (chkTrueFalse) {
                                    CAVUA.utils.destroy();
                                }
                            }
                        }
                    }
                }
            },
            _getLocalTop: function () {
                return window.window;
            },
            fail: function (messageFail, codeFail, booleanVar) {
                CAVNV.error("Error: " + messageFail);
            },
            //TODO: remove this, as we alwasys use jqyery flavour.
            getFlavor: function () {
                return "jQuery";
            },
            isIE: function () {
                return (navigator.userAgent.indexOf('MSIE ') > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./));
            },
            //TODO: check if required.
            clog: function () {
                return function () { };
            }(),
            destroy: function () {
                //TODO:
            },
            //TODO: need to remove.
            isStarted: function (module) {
                return true;
            },
            _buildToken4currentTarget: function (currentEvent) {
                var b_buildcurrent = currentEvent.nativeEvent ? currentEvent.nativeEvent.currentTarget : null;
                var event = b_buildcurrent ? CAVUA.BrowserBase.ElementData.prototype.examineID(b_buildcurrent) : {
                    id: currentEvent.target.id,
                    type: currentEvent.target.idType
                };
                return currentEvent.type + "|" + event.id + event.type;
            },
            _buildToken4delegateTarget: function (eventName, currentDocOrWin, delegetTargetElement2) {
                return eventName + "|" + currentDocOrWin + "|" + delegetTargetElement2;
            },
            _buildToken4bubbleTarget: function (eventType$$0, currentTargetElement1, chkTrueFalse$$0, delegetTargetElement1) {
                var currentWindow;
                var currentElement;
                var currentDocument = CAVUA.utils._getLocalTop();
                var arrayConfQueBrowser = CAVUA.Browser;
                var functionBuildToken = function (eventType) {
                    var booleanVar = null;
                    return CAVUA.utils._hasSameOrigin(currentWindow.parent) && CAVUA.utils.forEach(arrayConfQueBrowser.queryAll("iframe, frame", currentWindow.parent.document), function (chkTrueFalse) {
                        var objectWindow = null;
                        //TODO: handle blacklist case.
                        //if (!g(chkTrueFalse)) 
                        if (!false) {
                            objectWindow = CAVUA.utils.getCurrentIFrameWindow(chkTrueFalse);
                            if (objectWindow && CAVUA.utils._hasSameOrigin(objectWindow)) {
                                if (objectWindow.document === eventType) {
                                    booleanVar = chkTrueFalse;
                                }
                            }
                        }
                    }),
                        booleanVar;
                };
                var documentUtil = CAVUA.utils.getDocument(currentTargetElement1);
                var l = CAVUA.BrowserBase;
                var m = null;
                var n = eventType$$0;
                return documentUtil && (currentWindow = documentUtil.defaultView || documentUtil.parentWindow),
                    currentTargetElement1 === window || currentTargetElement1 === window.window ? n += "|null-2|window" : chkTrueFalse$$0 && (currentWindow && (CAVUA.utils._hasSameOrigin(currentWindow.parent) && ("undefined" != typeof documentUtil && currentDocument.document !== documentUtil))) ? (m = functionBuildToken(documentUtil), m && (currentElement = l.ElementData.prototype.examineID(m, n, true), n += "|" + currentElement.xPath + (currentElement.iframeID != '' ? ('_' + currentElement.iframeID) : '') + "-2")) : n += delegetTargetElement1 && (delegetTargetElement1 !== document && "jQuery" === CAVUA.utils.getFlavor()) ? "|null-2|" + CAVUA.utils.getTagName(currentTargetElement1) + "|" + CAVUA.utils.getTagName(delegetTargetElement1) : "|null-2|document",
                    n;
            },
            getTagName: function (a_getTag) {
                return a_getTag === document ? "document" : a_getTag === window || a_getTag === window.window ? "window" : "string" == typeof a_getTag ? a_getTag.toLowerCase() : "object" != typeof a_getTag || (CAVUA.utils.isUndefOrNull(a_getTag) || "string" != typeof a_getTag.tagName) ? "" : a_getTag.tagName.toLowerCase();
            },
            isIFrameDescendant: function (a_isIFrame) {
                return CAVUA.utils.getWindow(a_isIFrame) != CAVUA.utils._getLocalTop();
            },
            //TODO: check if needed.
            getOrientationMode: function (a_getOrientation) {
                var b_getOrientation = "INVALID";
                if ("number" != typeof a_getOrientation) {
                    return b_getOrientation;
                }
                switch (a_getOrientation) {
                    case 0:

                    case 180:

                    case 360:
                        b_getOrientation = "PORTRAIT";
                        break;
                    case 90:

                    case -90:

                    case 270:
                        b_getOrientation = "LANDSCAPE";
                        break;
                    default:
                        b_getOrientation = "UNKNOWN";
                }
                return b_getOrientation;
            },
            isUndefOrNull: function (getDocument) {
                return "undefined" == typeof getDocument || null === getDocument;
            },
            getDocument: function (getDocumentElement) {
                return 9 !== getDocumentElement.nodeType ? CAVUA.utils.isUndefOrNull(getDocumentElement.ownerDocument) ? getDocumentElement.document : getDocumentElement.ownerDocument : getDocumentElement;
            },
            getWindow: function (getCurrentWindow) {
                if (getCurrentWindow.self !== getCurrentWindow) {
                    var getParentOrDefaultWindow = CAVUA.utils.getDocument(getCurrentWindow);
                    return CAVUA.utils.isUndefOrNull(getParentOrDefaultWindow.defaultView) ? getParentOrDefaultWindow.parentWindow : getParentOrDefaultWindow.defaultView;
                }
                return getCurrentWindow;
            },
            mixin: function (modulesInfoArray) {
                var modulesInfo;
                var modulesInfoArray1;
                var counter;
                var lengthArguments;
                counter = 1;
                lengthArguments = arguments.length;
                for (; lengthArguments > counter; counter += 1) {
                    modulesInfoArray1 = arguments[counter];
                    for (modulesInfo in modulesInfoArray1) {
                        if (Object.prototype.hasOwnProperty.call(modulesInfoArray1, modulesInfo)) {
                            modulesInfoArray[modulesInfo] = modulesInfoArray1[modulesInfo];
                        }
                    }
                }
                return modulesInfoArray;
            },
            isLegacyIE: function () {
                var chkTrueFalse = !!window.performance;
                return CAVUA.utils.isIE() && (!chkTrueFalse || document.documentMode < 9);
            },
            //TODO: review again for normalizeModuleEvents.
            function_j: function () {
                var array = {};
                return {
                    normalizeModuleEvents: function (param_b_Func_j, param_c_Func_j, param_d_Func_j, param_e_Func_j) {
                        var booleanVar = false;
                        var booleanVar1 = false;
                        return param_d_Func_j = param_d_Func_j || CAVUA.utils._getLocalTop(),
                            param_e_Func_j = param_e_Func_j || param_d_Func_j.document,
                            array[param_b_Func_j] = {
                                loadFired: false,
                                pageHideFired: false
                            },
                            CAVUA.utils.forEach(param_c_Func_j, function (paramFunc_j) {
                                switch (paramFunc_j.name) {
                                    case "load":
                                        booleanVar = true;
                                        param_c_Func_j.push(CAVUA.utils.mixin(CAVUA.utils.mixin({},
                                            paramFunc_j), {
                                            name: "pageshow"
                                        }));
                                        break;
                                    case "unload":
                                        booleanVar1 = true;
                                        param_c_Func_j.push(CAVUA.utils.mixin(CAVUA.utils.mixin({},
                                            paramFunc_j), {
                                            name: "pagehide"
                                        }));
                                        param_c_Func_j.push(CAVUA.utils.mixin(CAVUA.utils.mixin({},
                                            paramFunc_j), {
                                            name: "beforeunload"
                                        }));
                                        break;
                                    case "change":
                                        if (CAVUA.utils.isLegacyIE()) {
                                            if ("w3c" === CAVUA.utils.getFlavor()) {
                                                param_c_Func_j.push(CAVUA.utils.mixin(CAVUA.utils.mixin({},
                                                    paramFunc_j), {
                                                    name: "propertychange"
                                                }));
                                            }
                                        }
                                }
                            }),
                            booleanVar || booleanVar1 ? (array[param_b_Func_j].silentLoad = !booleanVar, array[param_b_Func_j].silentUnload = !booleanVar1, booleanVar || param_c_Func_j.push({
                                name: "load",
                                target: param_d_Func_j
                            }), void (booleanVar1 || param_c_Func_j.push({
                                name: "unload",
                                target: param_d_Func_j
                            }))) : void delete array[param_b_Func_j];
                    },
                    canPublish: function (param_b_CanPublish, param_c_CanPublish) {
                        var localVar_CanPublish;
                        if (array.hasOwnProperty(param_b_CanPublish) === false) {
                            return true;
                        }
                        localVar_CanPublish = array[param_b_CanPublish]
                        switch (param_c_CanPublish.type) {
                            case "load":
                                localVar_CanPublish.pageHideFired = false;
                                localVar_CanPublish.loadFired = true;
                                return !localVar_CanPublish.silentLoad;
                            case "pageshow":
                                localVar_CanPublish.pageHideFired = false;
                                param_c_CanPublish.type = "load";
                                return !localVar_CanPublish.loadFired && !localVar_CanPublish.silentLoad;
                            case "pagehide":
                                param_c_CanPublish.type = "unload";
                                localVar_CanPublish.loadFired = false;
                                localVar_CanPublish.pageHideFired = true;
                                return !localVar_CanPublish.silentUnload;
                            case "unload":

                            case "beforeunload":
                                param_c_CanPublish.type = "unload";
                                localVar_CanPublish.loadFired = false;
                                return !localVar_CanPublish.pageHideFired && !localVar_CanPublish.silentUnload;
                        }
                        return true;
                    },
                    isUnload: function (param_IsUnLoad) {
                        return "object" == typeof param_IsUnLoad ? "unload" === param_IsUnLoad.type || ("beforeunload" === param_IsUnLoad.type || "pagehide" === param_IsUnLoad.type) : false;
                    }
                };
            }(),
            forEach: function (htmlElementArray, funcEvent, tmp) {
                var counter;
                var lengthArray;
                if (htmlElementArray && (htmlElementArray.length && (funcEvent && funcEvent.call))) {
                    counter = 0;
                    lengthArray = htmlElementArray.length;
                    for (; lengthArray > counter; counter += 1) {
                        funcEvent.call(tmp, htmlElementArray[counter], counter, htmlElementArray);
                    }
                }
            },
            //TODO:
            //chkTrueFalseFunc
            //d_get
            getCurrentIFrameWindow: function (getCurrentIFrame) {
                var getParentIFrame = null;
                if (!getCurrentIFrame) {
                    return getParentIFrame;
                }
                try {
                    //if there is current IFrame window then getParentIFrame has value of parent IFrame window otherwise not
                    getParentIFrame = getCurrentIFrame.contentWindow || (getCurrentIFrame.contentDocument ? getCurrentIFrame.contentDocument.parentWindow : null);
                } catch (c) { }
                return getParentIFrame;
            },
            _hasSameOrigin: function (getWindow) {
                try {
                    return getWindow.document.location.host === document.location.host && getWindow.document.location.protocol === document.location.protocol;
                } catch (time) { }
                return false;
            },
            //Check if there is some error.
            WeakMap: function () {
                function Func_a(eventWeakMapArray, funcPublishEvent) {
                    var weakMapCounter;
                    var lengthArray;
                    eventWeakMapArray = eventWeakMapArray || [];
                    weakMapCounter = 0;
                    lengthArray = eventWeakMapArray.length;
                    for (; lengthArray > weakMapCounter; weakMapCounter += 1) {
                        if (eventWeakMapArray[weakMapCounter][0] === funcPublishEvent) {
                            return weakMapCounter;
                        }
                    }
                    return -1;
                }
                return function () {
                    var publishEventArray = [];
                    this.set = function (param_c1, param_d1) {
                        var lengthArray = Func_a(publishEventArray, param_c1);
                        publishEventArray[lengthArray > -1 ? lengthArray : publishEventArray.length] = [param_c1, param_d1];
                    };
                    this.get = function (param_c2) {
                        var d_local = publishEventArray[Func_a(publishEventArray, param_c2)];
                        return d_local ? d_local[1] : void 0;
                    };
                    this.clear = function () {
                        publishEventArray = [];
                    };
                    this.has = function (param_c3) {
                        return Func_a(publishEventArray, param_c3) >= 0;
                    };
                    this.remove = function (param_c4) {
                        var d_local1 = Func_a(publishEventArray, param_c4);
                        if (d_local1 >= 0) {
                            publishEventArray.splice(d_local1, 1);
                        }
                    };
                    this["delete"] = this.remove;
                };
            }(),
            addEventListener: function () {
                return window.addEventListener ?
                    function (elementName, eventName, funcEventModule) {
                        elementName.addEventListener(eventName, funcEventModule, false);
                    } : function (elementName, eventName, funcEventModule) {
                        elementName.attachEvent("on" + eventName, funcEventModule);
                    };
            }(),
            //TODO: check if we can use default JSON or polymer defined in cav_nv.
            //TODO: replace all serialze by this one.
            parse: function (s) {
                return JSON.parse(s);
            },
            serialize: function (s) {
                return JSON.stringify(s);
            },
            some: function (elementNameArray, getElementTagFunction) {
                var counter;
                var lengthArray;
                var tmp = false;
                counter = 0;
                lengthArray = elementNameArray.length;
                for (; lengthArray > counter; counter += 1) {
                    if (tmp = getElementTagFunction(elementNameArray[counter], counter, elementNameArray)) {
                        return tmp;
                    }
                }
                return tmp;
            },
            access: function (windowJquery, tmp) {
                var jqueryArray;
                var counter;
                var lengthJqueryArray;
                var objectWindow = tmp || window;
                if ("string" == typeof windowJquery && ("object" == typeof objectWindow || null == objectWindow)) {
                    jqueryArray = windowJquery.split(".");
                    counter = 0;
                    lengthJqueryArray = jqueryArray.length;
                    for (; lengthJqueryArray > counter; counter += 1) {
                        if (0 !== counter || "window" !== jqueryArray[counter]) {
                            if (!Object.prototype.hasOwnProperty.call(objectWindow, jqueryArray[counter])) {
                                return;
                            }
                            if (objectWindow = objectWindow[jqueryArray[counter]], lengthJqueryArray - 1 > counter && !(objectWindow instanceof Object)) {
                                return;
                            }
                        }
                    }
                    return objectWindow;
                }
                return windowJquery;
            },
            indexOf: function (ArrayModuleName, moduleName) {
                var counter;
                var lengthArray;
                if (ArrayModuleName && ArrayModuleName instanceof Array) {
                    counter = 0;
                    lengthArray = ArrayModuleName.length;
                    for (; lengthArray > counter; counter += 1) {
                        if (ArrayModuleName[counter] === moduleName) {
                            return counter;
                        }
                    }
                }
                return -1;
            },
            clone: function (cloneObjectArray) {
                var cloneArray;
                var cloneString;
                if (null === cloneObjectArray || "object" != typeof cloneObjectArray) {
                    return cloneObjectArray;
                }
                if (cloneObjectArray instanceof Object) {
                    cloneArray = "[object Array]" === Object.prototype.toString.call(cloneObjectArray) ? [] : {};
                    for (cloneString in cloneObjectArray) {
                        if (Object.prototype.hasOwnProperty.call(cloneObjectArray, cloneString)) {
                            cloneArray[cloneString] = CAVUA.utils.clone(cloneObjectArray[cloneString]);
                        }
                    }
                    return cloneArray;
                }
            },
            checkTime: function (currentTime) {
                var navTime = CAVNV.nav_start_time;
                if (navTime > currentTime) {
                    return CAVNV.cav_epoch_nav_start_time * 1E3;
                    // cav_epoch_nav_start_time contains difference between start time and current navigation time.
                } else {
                    return (currentTime - navTime) + CAVNV.cav_epoch_nav_start_time * 1E3;
                }
            }
        };

        CAVUA.BrowserBase = function (a) {
            function f(event) {
                return event && ("undefined" != typeof event.originalEvent && ("undefined" != typeof event.isDefaultPrevented && !event.isSimulated));
            }
            function g(event) {
                return event ? (event.type && (0 === event.type.indexOf("touch") && (f(event) && (event = event.originalEvent), "touchstart" === event.type ? event = event.touches[event.touches.length - 1] : "touchend" === event.type && (event = event.changedTouches[0]))), event) : null;
            }
            function h(eventParam) {
                var eventLocal = eventParam || window.event;
                var htmlElement = document.documentElement;
                var bodyElement = document.body;
                return f(eventLocal) && (eventLocal = eventLocal.originalEvent),
                    ("undefined" == typeof eventParam || "undefined" == typeof eventLocal.target) && (eventLocal.target = eventLocal.srcElement || window.window, eventLocal.timeStamp = Number(new Date), (null === eventLocal.pageX || "undefined" == typeof eventLocal.pageX) && (eventLocal.pageX = eventLocal.clientX + (htmlElement && htmlElement.scrollLeft || (bodyElement && bodyElement.scrollLeft || 0)) - (htmlElement && htmlElement.clientLeft || (bodyElement && bodyElement.clientLeft || 0)), eventLocal.pageY = eventLocal.clientY + (htmlElement && htmlElement.scrollTop || (bodyElement && bodyElement.scrollTop || 0)) - (htmlElement && htmlElement.clientTop || (bodyElement && bodyElement.clientTop || 0))), eventLocal.preventDefault = function () {
                        this.returnValue = false;
                    },
                        eventLocal.stopPropagation = function () {
                            this.cancelBubble = true;
                        }),
                    eventLocal;
            }
            function i$$0(eventParam) {
                var targetedElement = null;
                if (!eventParam) {
                    return null;
                }
                if (eventParam.srcElement) {
                    targetedElement = eventParam.srcElement;
                } else {
                    targetedElement = eventParam.target;
                    if (!targetedElement) {
                        targetedElement = eventParam.explicitOriginalTarget;
                    }
                    if (!targetedElement) {
                        targetedElement = eventParam.originalTarget;
                    }
                }
                if (!targetedElement) {
                    if (!(0 !== eventParam.type.indexOf("touch"))) {
                        targetedElement = g(eventParam).target;
                    }
                }
                for (; targetedElement && w[targetedElement.tagName];) {
                    targetedElement = targetedElement.parentNode;
                }
                return targetedElement || (null !== eventParam.srcElement || (targetedElement = window.window)),
                    targetedElement;
            }
            function j(eventParam) {
                var clientXLocation = 0;
                var clientYLocation = 0;
                var htmlElement = document.documentElement;
                var bodyElement = document.body;
                return eventParam = g(eventParam),
                    null !== eventParam && (eventParam.pageX && (eventParam.pageY && (eventParam.pageX > 0 && eventParam.pageY > 0)) ? (clientXLocation = eventParam.pageX, clientYLocation = eventParam.pageY) : eventParam.clientX && (eventParam.clientY && (clientXLocation = eventParam.clientX + (htmlElement && htmlElement.scrollLeft || (bodyElement && bodyElement.scrollLeft || 0)) - (htmlElement && htmlElement.clientLeft || (bodyElement && bodyElement.clientLeft || 0)), clientYLocation = eventParam.clientY + (htmlElement && htmlElement.scrollTop || (bodyElement && bodyElement.scrollTop || 0)) - (htmlElement && htmlElement.clientTop || (bodyElement && bodyElement.clientTop || 0))))),
                {
                    x: clientXLocation,
                    y: clientYLocation
                };
            }
            function k(xCoordinate, yCoordinate) {
                this.x = xCoordinate || 0;
                this.y = yCoordinate || 0;
            }
            function l$$0(width, height) {
                this.width = width || 0;
                this.height = height || 0;
            }
            //this function is called for mouse event
            function m(mouseEvent, targetedElement) {
                var nameOfElement;
                var event;
                var elementWindow;
                targetedElement = i$$0(mouseEvent);
                nameOfElement = this.examineID(targetedElement, mouseEvent.type);
                event = this.examineType(targetedElement, mouseEvent);
                elementWindow = this.examinePosition(mouseEvent, targetedElement);
                this.element = targetedElement;
                this.id = nameOfElement.id;
                this.idType = nameOfElement.type;
                this.type = event.type;
                this.subType = event.subType;
                this.state = this.examineState(targetedElement);
                this.position = new k(elementWindow.x, elementWindow.y);
                this.size = new l$$0(elementWindow.width, elementWindow.height);
                this.xPath = nameOfElement.xPath;
                this.name = nameOfElement.name;
                this.iframeID = nameOfElement.iframeID;
            }
            function n() {
                var documentBodyRect;
                var diff;
                var bodyOffsetWidth;
                var e_local4 = 1;
                if (document.body.getBoundingClientRect) {
                    try {
                        documentBodyRect = document.body.getBoundingClientRect();
                    } catch (f) {
                        return CAVUA.utils.clog("getBoundingClientRect failed.", f),
                            e_local4;
                    }
                    diff = documentBodyRect.right - documentBodyRect.left;
                    bodyOffsetWidth = document.body.offsetWidth;
                    e_local4 = Math.round(diff / bodyOffsetWidth * 100) / 100;
                }
                return e_local4;
            }
            function o(currHtmlElement) {
                var clientBoundingRect;
                var positionSizeArray;
                var e_local5;
                if ("undefined" == typeof currHtmlElement || (null === currHtmlElement || !currHtmlElement.getBoundingClientRect)) {
                    return {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0
                    };
                }
                try {
                    clientBoundingRect = currHtmlElement.getBoundingClientRect();
                } catch (f) {
                    return CAVUA.utils.clog("getBoundingClientRect failed.", f),
                    {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0
                    };
                }
                return positionSizeArray = {
                    x: clientBoundingRect.left,
                    y: clientBoundingRect.top,
                    width: clientBoundingRect.right - clientBoundingRect.left,
                    height: clientBoundingRect.bottom - clientBoundingRect.top
                },
                    CAVUA.utils.isIE() && (positionSizeArray.x -= document.documentElement.clientLeft, positionSizeArray.y -= document.documentElement.clientTop, e_local5 = n(), 1 !== e_local5 && (positionSizeArray.x = Math.round(positionSizeArray.x / e_local5), positionSizeArray.y = Math.round(positionSizeArray.y / e_local5), positionSizeArray.width = Math.round(positionSizeArray.width / e_local5), positionSizeArray.height = Math.round(positionSizeArray.height / e_local5))),
                    positionSizeArray;
            }
            function p(event) {
                var location;
                switch (this.data = event.data || null, this.delegateTarget = event.delegateTarget || null, event = h(event), location = j(event), this.custom = false, this.nativeEvent = this.custom === true ? null : event, this.position = new k(location.x, location.y), this.target = new m(event, event.target), this.timestamp = (new Date).getTime(), this.type = event.type, this.type) {
                    case "focusin":
                        this.type = "focus";
                        break;
                    case "focusout":
                        this.type = "blur";
                }
            }
            function q(event) {
                a._publishEvent(new p(event));
            }
            //TODO: add serializer or not.
            var r = null;  /*Serialize*/
            var s = {  /*browser Configuration*/
                useCapture: true,
                jQueryObject: window.jQuery
            };
            var t = []; /*blacklisted*/
            var u = []; /*customID*/
            var v;
            var w = {
                OPTGROUP: true,
                OPTION: true,
                NOBR: true
            };
            var x = {};
            var y = null; /*a.getService("config")*/
            var z$$0 = false;

            m.HTML_ID = -1;
            m.XPATH_ID = -2;
            m.CSS_SELECTOR = -3;
            //Note: if getXPath is true then to get xpath is mandatory.
            m.prototype.examineID = function (targetElement, mouseEvent, getXpath) {

                function getIframeId(element) {
                    if (CAVNV.frameSelector) {
                        var iframeid = CAVNV.frameSelector;
                        return ((iframeid.t * -1) + "-" + iframeid.i);
                    }
                    var D = CAVNV.plugins.DOMWATCHER2;
                    var xpath = ""; //array of format: idType-id ; idType-id;
                    //check for it's owner document and check if that was inside element.
                    if (!element || !element.ownerDocument || element.ownerDocument == document || !D)
                        return '';

                    //get iframe element from document..
                    //Note: in NVDomObserver iframe's document will have iframe id, so if we will getNode with that id it will return iframa.
                    var iframe;
                    iframe = D.getNode(D.getID(element.ownerDocument));
                    // Multiplying with -1 , so to get positive values, as seprator is "-"
                    while (iframe) {
                        var iframeid = CAVNV.utils.getDomID(iframe);
                        if (xpath == "")
                            xpath = (iframeid.t * -1) + "-" + iframeid.i;
                        else
                            xpath += ";" + (iframeid.t * -1) + "-" + iframeid.i;
                        //now again move to next iframe. 
                        //Note: top document will not be added in knownNode list. 
                        iframe = D.getNode(D.getID(iframe.ownerDocument));
                    }
                    return xpath;
                }

                var elementName = targetElement.name;
                var elementId = null;
                var elementXpath = null;
                var type;
                //for clickMap,ExitMap & Navigation Map, xpath is needed even if we have css selector
                if (mouseEvent && mouseEvent == "click") getXpath = true;
                var domID = CAVNV.utils.getDomID(targetElement, getXpath);
                var iframeID = getIframeId(targetElement);

                if (domID.t == m.HTML_ID)
                    elementId = domID.i;
                else if (domID.t == m.CSS_SELECTOR)
                    elementId = domID.i;
                else if (domID.t == m.XPATH_ID)
                    elementXpath = domID.i;

                return {
                    id: elementId || elementXpath,
                    type: domID.t,
                    xPath: domID.x,
                    name: elementName,
                    iframeID: iframeID
                };
            }

            m.prototype.examineType = function (targetedElement, mouseEvent) {
                var c_local12 = "";
                return c_local12 = "change" === mouseEvent.type ? "TEXTAREA" === targetedElement.tagName || "INPUT" === targetedElement.tagName && "text" === targetedElement.type ? "textChange" : "valueChange" : mouseEvent.type,
                {
                    type: mouseEvent.type,
                    subType: c_local12
                };
            }
            m.prototype.examineState = function (a) {
                var b_local13 = {
                    a: ["innerText", "href"],
                    input: {
                        range: ["maxValue:max", "value"],
                        checkbox: ["value", "checked"],
                        radio: ["value", "checked"],
                        image: ["src"]
                    },
                    select: ["value"],
                    button: ["value", "innerText"],
                    textarea: ["value"]
                };
                var c_local13 = "undefined" != typeof a.tagName ? a.tagName.toLowerCase() : "";
                var d_local13 = b_local13[c_local13] || null;
                var e_local13 = null;
                var f_local13 = {};
                var g_local13 = null;
                var h_local13 = "";
                if (null !== d_local13) {
                    if ("[object Object]" === Object.prototype.toString.call(d_local13)) {
                        d_local13 = d_local13[a.type] || ["value"];
                    }
                    f_local13 = {};
                    for (h_local13 in d_local13) {
                        if (d_local13.hasOwnProperty(h_local13)) {
                            if (-1 !== d_local13[h_local13].indexOf(":")) {
                                g_local13 = d_local13[h_local13].split(":");
                                f_local13[g_local13[0]] = a[g_local13[1]];
                            } else {
                                f_local13[d_local13[h_local13]] = "innerText" === d_local13[h_local13] ? a.innerText || a.textContent : a[d_local13[h_local13]];
                            }
                        }
                    }
                }
                return "select" === c_local13 && (a.options && (!isNaN(a.selectedIndex) && (f_local13.index = a.selectedIndex, f_local13.index >= 0 && (f_local13.index < a.options.length && (e_local13 = a.options[a.selectedIndex], f_local13.value = e_local13.text || (e_local13.innerText || (e_local13.getAttribute("value") || e_local13.getAttribute("label"))), f_local13.text = e_local13.text || e_local13.innerText))))),
                    f_local13;
            }
            m.prototype.examinePosition = function (mouseEvent, targetedElement) {
                var c_local14 = j(mouseEvent);
                var d_local14 = o(targetedElement);
                return d_local14.x = 0 !== c_local14.x && 0 !== c_local14.y ? Math.round(Math.abs(c_local14.x - d_local14.x)) : d_local14.width / 2,
                    d_local14.y = 0 !== c_local14.x && 0 !== c_local14.y ? Math.round(Math.abs(c_local14.y - d_local14.y)) : d_local14.height / 2,
                    d_local14;
            }
            return {
                WebEvent: p,
                ElementData: m,
                processDOMEvent: q
            };
        }(CAVUA.utils);

        CAVUA.Browser = function (a) {
            function b(a_param) {
                return function (b_param) {
                    var c_local = new k.WebEvent(b_param);
                    a_param(c_local);
                };
            }
            /*
                function c(b_param2, c_param2) {
                  if ("function" != typeof b_param2[c_param2]) {
                    a.fail("jQuery Object does not support " + c_param2, i.JQUERY_NOT_SUPPORTED);
                  }
                }
                function d() {
                  var counter;
                  var onOffArray = ["on", "off"];
                  var g = parseFloat("function" == typeof f && "object" == typeof f.fn ? f.fn.jquery.replace(".", "") : 0);
                  var h_local2 = 0;
                  var j_local2 = null;
                  if ("function" != typeof f) {
                    a.fail("jQuery not found.", i.JQUERY_NOT_FOUND);
                  }
                  counter = 0;
                  h_local2 = onOffArray.length;
                  j_local2 = f({});
                  for (; h_local2 > counter; counter += 1) {
                    c(j_local2, onOffArray[counter]);
                  }
                  if (1.7 > g) {
                    a.fail("jQuery Object has the wrong version (" + g + ")", i.JQUERY_NOT_SUPPORTED);
                  }
                }
            */
            function e(b_param3) {
                b_param3 = b_param3 || l;
                var c_local3 = b_param3.useCapture === true;
                f = b_param3.hasOwnProperty("jQueryObject") ? CAVUA.utils.access(b_param3.jQueryObject) : window.jQuery;
                //TODO: remove this method calling. Because we already have checked in CONFIG plugin.. 
                //d();

                if (c_local3 && "function" == typeof document.addEventListener) {
                    m = function (a_param4, b_param4, d) {
                        var e_local3 = function (a_param4) {
                            d(f.event.fix(a_param4));
                        };
                        a_param4.addEventListener(b_param4, e_local3, c_local3);
                    };
                    n = function (a_param5, b_param5, d) {
                        var e_local4 = function (a_param5) {
                            d(f.event.fix(a_param5));
                        };
                        a_param5.removeEventListener(b_param5, e_local4, c_local3);
                    };
                } else {
                    m = function (a_param6, b_param6, c_param6) {
                        f(a_param6).on(b_param6, c_param6);
                    };
                    n = function (a_Param7, b_param7, c_param7) {
                        f(a_Param7).off(b_param7, c_param7);
                    };
                }
                o = true;
            }
            var f;
            var g$$0 = {};
            var h;
            var i = {
                JQUERY_NOT_SUPPORTED: "JQUERYNOTSUPPORTED",
                JQUERY_NOT_FOUND: "JQUERYNOTFOUND"
            };
            //TODO: remove this j.
            var j = null; /*config module*/
            var k = CAVUA.BrowserBase;
            //TODO: make it configurable.
            var l = {  /*Brwoser Configuration*/
                useCapture: true,
                jQueryObject: window.jQuery
            };
            var m = null;
            var n = null;
            /*flag for start and stop this service. but now we are removing this concept. so this always be true.*/
            //TODO: remove this.
            var o = true;
            return g$$0 = {
                //its all functions are called at load time
                list2Array: function (listOfElements) {
                    //this function convert all tags that are already stored in list in the form of array 
                    var counter;
                    var lengthArray = listOfElements.length;
                    var array = [];
                    if (!listOfElements) {
                        return array;
                    }
                    if ("undefined" == typeof listOfElements.length) {
                        return [listOfElements];
                    }
                    counter = 0;
                    for (; lengthArray > counter; counter += 1) {
                        array[counter] = listOfElements[counter];
                    }
                    return array;
                },
                find: function (tagName, objDocument, undef) {
                    return undef = undef || "css",
                        this.list2Array(this[undef](tagName, objDocument));
                },
                css: function (tagName, objHtmlDocument) {
                    return objHtmlDocument = objHtmlDocument || document,
                        f(objHtmlDocument).find(tagName).get();
                }
            },

                /*Now we are not updating configuration at run time so initialize all other variable (m, n)at starting.*/
                h = function () {
                    var weakMap = new a.WeakMap;
                    return {
                        add: function (valuePublishEventFunc) {
                            var weakMapArray = weakMap.get(valuePublishEventFunc) || [b(valuePublishEventFunc), 0];
                            return weakMapArray[1] += 1,
                                weakMap.set(valuePublishEventFunc, weakMapArray),
                                weakMapArray[0];
                        },
                        find: function (valuePublishEventFunc) {
                            var weakMapArray1 = weakMap.get(valuePublishEventFunc);
                            return weakMapArray1 ? weakMapArray1[0] : null;
                        },
                        remove: function (valuePublishEventFunc) {
                            var weakMapArray2 = weakMap.get(valuePublishEventFunc);
                            if (weakMapArray2) {
                                weakMapArray2[1] -= 1;
                                if (weakMapArray2[1] <= 0) {
                                    weakMap.remove(valuePublishEventFunc);
                                }
                            }
                        }
                    };
                }(),
            {
                init: function (config) {
                    //As we can not run it untill jQuery not loaded. and that depend on CAVNV. so call this at init time.
                    e(config);
                },
                getServiceName: function () {
                    return "jQuery";
                },
                query: function (tagName, objDocument, unDef) {
                    return g$$0.find(tagName, objDocument, unDef)[0] || null;
                },
                queryAll: function (tagName, objDocument, unDef) {
                    return g$$0.find(tagName, objDocument, unDef);
                },
                loadScript: function (a_loadScript) {
                    f.getScript(a_loadScript);
                },
                subscribe: function (eventName, objElementWinDoc, publishEventFunc, undef, undef1) {
                    var webEventService = h.add(publishEventFunc);
                    if (undef) {
                        f(undef).on(eventName, objElementWinDoc, undef1, webEventService);
                    } else {
                        m(objElementWinDoc, eventName, webEventService);
                    }
                },
                unsubscribe: function (eventName, objElementWinDoc, publishEventFunc, undef) {
                    var findUnsubscribe = h.find(publishEventFunc);
                    if (findUnsubscribe) {
                        try {
                            if (undef) {
                                f(undef).off(eventName, objElementWinDoc, findUnsubscribe);
                            } else {
                                n(objElementWinDoc, eventName, findUnsubscribe);
                            }
                        } catch (g) { }
                        h.remove(publishEventFunc);
                    }
                },
                getJQuery: function () {
                    return f;
                }
            };
        }(CAVUA.utils);

        CAVUA.Replay = function (a$$0) {
            function b$$0(a, winTargetArray)
            // winTargetArray contain all the types of information about all targetted elements and events
            {
                var counter;
                var array;
                if (!a || "object" != typeof a) {
                    return null;
                }
                array = winTargetArray.split(".");
                counter = 0;
                for (; counter < array.length; counter += 1) {
                    if ("undefined" == typeof a || null === a[array[counter]]) {
                        return null;
                    }
                    a = a[array[counter]];
                }
                return a;
            }
            function c$$0(a) //targettedElementArray 
            {
                var b_local = [];
                a = a.parentNode;
                for (; a;) {
                    b_local.push(a);
                    a = a.parentNode;
                }
                return b_local;
            }
            function d$$0(b_param2) {
                return CAVUA.utils.some(b_param2, function (a) {
                    return "A" === a.tagName || "BUTTON" === a.tagName ? a : null;
                });
            }
            function e$$0(a) {
                var event = a.type;
                return event = "string" == typeof event ? event.toLowerCase() : "unknown",
                    "blur" === event && (event = "focusout"),
                    event;
            }

            function f$$0(a) {
                var window1;
                var tagNamee = b$$0(a, "webEvent.target.element.tagName");
                var elementSubType = "input" === tagNamee.toLowerCase() ? b$$0(a, "webEvent.target.element.type") : "";
                var tagName1 = D[tagNamee.toLowerCase() + ":" + elementSubType] || tagNamee;
                var targetElement = c$$0(b$$0(a, "webEvent.target.element"));
                var k_local = null;
                var targetPosition = b$$0(a, "webEvent.target.position.relXY");
                var targetSubType = b$$0(a, "webEvent.target.subtype");
                window1 = {
                    type: 4,
                    timestamp: (new Date).getTime(),
                    target: {
                        id: a.id || "",
                        idType: b$$0(a, "webEvent.target.idType"),
                        name: b$$0(a, "webEvent.target.name"),
                        iframeID: b$$0(a, "webEvent.target.iframeID"),
                        tlType: tagName1,
                        type: tagNamee,
                        subType: elementSubType,
                        xpath: b$$0(a, "webEvent.target.xPath"),
                        position: {
                            width: b$$0(a, "webEvent.target.element.offsetWidth"),
                            height: b$$0(a, "webEvent.target.element.offsetHeight")
                        },
                        currState: a.currState || null
                    },
                    event: {
                        tlEvent: e$$0(b$$0(a, "webEvent")),
                        type: b$$0(a, "webEvent.target.type")
                    }
                };
                if (targetPosition) {
                    window1.target.position.relXY = targetPosition;
                }
                if ("number" == typeof a.dwell) {
                    if (a.dwell > 0) {
                        window1.target.dwell = a.dwell;
                    }
                }
                if ("number" == typeof a.visitedCount) {
                    window1.target.visitedCount = a.visitedCount;
                }
                if ("undefined" != typeof a.prevState) {
                    window1.prevState = a.prevState;
                }
                if ("undefined" != typeof targetSubType) {
                    window1.event.subType = targetSubType;
                }
                window1.target.name = b$$0(a, "webEvent.target.name");
                k_local = d$$0(targetElement);
                window1.target.isParentLink = !!k_local;
                if (k_local) {
                    if (k_local.href) {
                        window1.target.currState = window1.target.currState || {};
                        window1.target.currState.href = window1.target.currState.href || k_local.href;
                    }
                    if (k_local.value) {
                        window1.target.currState = window1.target.currState || {};
                        window1.target.currState.value = window1.target.currState.value || k_local.value;
                    }
                    if (k_local.innerText || k_local.textContent) {
                        window1.target.currState = window1.target.currState || {};
                        window1.target.currState.innerText = window1.target.currState.innerText || (k_local.innerText || k_local.textContent);
                    }
                }
                //check if sensitive data.
                var te = b$$0(a, "webEvent.target.element");
                window1.eeflag = CAVNV.utils.getEEFlag(te);
                return window1;
            }
            function g$$0(b) {
                CAVUA.Queue.post(b);
            }
            function h$$0(b) {
                var c;
                var d;
                var e;
                var f;
                var g = 0;
                var h = b.length;
                var i = {
                    mouseout: true,
                    mouseover: true
                };
                var j = [];
                g = 0;
                for (; h > g; g += 1) {
                    if (d = b[g]) {
                        if (i[d.event.type]) {
                            CAVNV.log("d.target.id = " + d.target.id);
                            j.push(d);
                        } else {
                            CAVNV.log("d.target.id = " + d.target.id);
                            c = g + 1;
                            for (; h > c && (b[c] && i[b[c].event.type]); c += 1) { }
                            if (h > c) {
                                e = b[c];
                                if (e) {
                                    if (d.target.id === e.target.id) {
                                        if (d.event.type !== e.event.type) {
                                            if ("click" === d.event.type) {
                                                f = d;
                                                d = e;
                                                e = f;
                                            }
                                            if ("click" === e.event.type) {
                                                d.target.position = e.target.position;
                                                g += 1;
                                            } else {
                                                if ("blur" === e.event.type) {
                                                    d.target.dwell = e.target.dwell;
                                                    d.target.visitedCount = e.target.visitedCount;
                                                    d.focusInOffset = e.focusInOffset;
                                                    d.target.position = e.target.position;
                                                    g += 1;
                                                }
                                            }
                                            b[c] = null;
                                            b[g] = d;
                                        }
                                    }
                                }
                            }
                            j.push(b[g]);
                        }
                    }
                }
                d = j.shift();
                for (; d; d = j.shift()) {
                    CAVUA.Queue.post(d);
                }
                b.splice(0, b.length);
            }
            function i$$0(elementXpath, event) {
                CAVNV.log("elementXpath = " + elementXpath);
                U = event;
                U.inFocus = true;
                if ("undefined" == typeof G[elementXpath]) {
                    G[elementXpath] = {};
                }
                G[elementXpath].focus = U.dwellStart = Number(new Date);
                G[elementXpath].focusInOffset = Q ? U.dwellStart - Number(Q) : -1;
                G[elementXpath].prevState = b$$0(event, "target.state");
                G[elementXpath].visitedCount = G[elementXpath].visitedCount + 1 || 1;
            }
            function j$$0(event, elementXpath) {
                J.push(f$$0({
                    webEvent: event,
                    id: elementXpath,
                    currState: b$$0(event, "target.state")
                }));
            }
            function k$$0(element) {
                var booleanVar = false;
                var listOfElement = "|button|image|submit|reset|checkbox|radio|";
                var addPipeString = null;
                if ("object" != typeof element || !element.type) {
                    return booleanVar;
                }
                switch (element.type) {
                    case "INPUT":
                        addPipeString = "|" + (element.subType || "") + "|";
                        booleanVar = -1 === listOfElement.indexOf(addPipeString.toLowerCase()) ? false : true;
                        break;
                    case "TEXTAREA":
                        booleanVar = false;
                        break;
                    default:
                        booleanVar = true;
                }
                return booleanVar;
            }
            function l$$0(elementXpath, event1) {
                var mouseEvent;
                if ("undefined" != typeof elementXpath) {
                    if (null !== elementXpath) {
                        if ("undefined" != typeof event1) {
                            if (null !== event1) {
                                U.inFocus = false;
                                if ("undefined" != typeof G[elementXpath] && G[elementXpath].hasOwnProperty("focus")) {
                                    G[elementXpath].dwell = Number(new Date) - G[elementXpath].focus;
                                } else {
                                    G[elementXpath] = {};
                                    G[elementXpath].dwell = 0;
                                }
                                if (0 === J.length) {
                                    event1.type = event1.target.type = "blur";
                                    j$$0(event1, elementXpath);
                                }
                                mouseEvent = J[J.length - 1];
                                if (mouseEvent) {
                                    mouseEvent.target.dwell = G[elementXpath].dwell;
                                    mouseEvent.focusInOffset = G[elementXpath].focusInOffset;
                                    mouseEvent.target.visitedCount = G[elementXpath].visitedCount;
                                    if (!("click" !== mouseEvent.event.type)) {
                                        if (!k$$0(mouseEvent.target)) {
                                            mouseEvent.event.type = "blur";
                                            mouseEvent.event.tlEvent = "focusout";
                                        }
                                    }
                                }
                                h$$0(J);
                            }
                        }
                    }
                }
            }
            function m(elementXpath, event) {
                var booleanVar = false;
                return J.length > 0 && (J[J.length - 1] && (J[J.length - 1].target.id !== elementXpath && ("scroll" !== event.type && ("resize" !== event.type && ("mouseout" !== event.type && ("mouseover" !== event.type && ("textBox" !== J[J.length - 1].target.tlType && ("selectList" !== J[J.length - 1].target.tlType && (l$$0(J[J.length - 1].target.id, J[J.length - 1]), booleanVar = true))))))))),
                    booleanVar;
            }
            function n(elementXpath, event) {
                if (!("undefined" == typeof G[elementXpath])) {
                    if (!G[elementXpath].hasOwnProperty("focus")) {
                        i$$0(elementXpath, event);
                    }
                }
                j$$0(event, elementXpath);
                if ("undefined" != typeof G[elementXpath]) {
                    if ("undefined" != typeof G[elementXpath].prevState) {
                        if ("textBox" === J[J.length - 1].target.tlType || "selectList" === J[J.length - 1].target.tlType) {
                            J[J.length - 1].target.prevState = G[elementXpath].prevState;
                        }
                    }
                }
            }
            function o(event) {
                var positionX = event.target.position.x;
                var positionY = event.target.position.y;
                var element = event.target.element;
                var objectClientRect = element.getBoundingClientRect ? element.getBoundingClientRect() : {
                    "bottom": 0,
                    "height": 0,
                    "left": 0,
                    "right": 0,
                    "top": 0,
                    "width": 0
                };
                var element_x = objectClientRect.left;
                var element_y = objectClientRect.top;
                var total_x = element_x + positionX;
                var total_y = element_y + positionY;
                var pageWidth = Math.max(
                    document.body.scrollWidth, document.documentElement.scrollWidth,
                    document.body.offsetWidth, document.documentElement.offsetWidth,
                    document.body.clientWidth, document.documentElement.clientWidth
                );
                var pageHeight = Math.max(
                    document.body.scrollHeight, document.documentElement.scrollHeight,
                    document.body.offsetHeight, document.documentElement.offsetHeight,
                    document.body.clientHeight, document.documentElement.clientHeight
                );
                CAVNV.log("Clicked at " + total_x + "x" + total_y + " and page dimension " + pageWidth + "x" + pageHeight);
                var fixedX = Math.abs(total_x / pageWidth).toFixed(3);
                var fixedY = Math.abs(total_y / pageHeight).toFixed(3);
                return fixedX = fixedX > 1 || 0 > fixedX ? 0.5 : fixedX,
                    fixedY = fixedY > 1 || 0 > fixedY ? 0.5 : fixedY,
                    fixedX + "," + fixedY;
            }
            function p(targetElementXpath, eventName) {
                var d_local;
                var booleanVar = true;
                var lengthArray = 0;
                return "SELECT" === eventName.target.element.tagName && (V && V.target.id === targetElementXpath) ? void (V = null) : (U.inFocus || i$$0(targetElementXpath, eventName), lengthArray = J.length, lengthArray && ("change" !== b$$0(J[lengthArray - 1], "event.type") && n(targetElementXpath, eventName)), d_local = o(eventName), lengthArray = J.length, 0 === eventName.position.x && (0 === eventName.position.y && (lengthArray && "radioButton" === b$$0(J[lengthArray - 1], "target.tlType"))) ? booleanVar = false : eventName.target.position.relXY = d_local, lengthArray && b$$0(J[lengthArray - 1], "target.id") === targetElementXpath ? booleanVar && (J[lengthArray - 1].target.position.relXY = d_local) : j$$0(eventName, targetElementXpath), void (V = eventName));
            }
            function q() {
                var orientation1 = window.orientation || 0;
                return orientation1;
            }
            function r() {
                var b_local = q();
                var array = {
                    type: 4,
                    timestamp: (new Date).getTime(),
                    event: {
                        type: "orientationchange"
                    },
                    target: {
                        prevState: {
                            orientation: E,
                            orientationMode: CAVUA.utils.getOrientationMode(E)
                        },
                        currState: {
                            orientation: b_local,
                            orientationMode: CAVUA.utils.getOrientationMode(b_local)
                        }
                    }
                };
                g$$0(array);
                E = b_local;
            }
            function s(a_param) {
                var scaleValue = false;
                return a_param ? scaleValue = F.scale === a_param.scale && Math.abs((new Date).getTime() - F.timestamp) < 500 : scaleValue;
            }
            function t(a_param) {
                F.scale = a$$0.scale;
                F.rotation = a_param.rotation;
                F.timestamp = (new Date).getTime();
            }
            function u(a_param) {
                var checkNum;
                var tmp = "INVALID";
                return "undefined" == typeof a_param || null === a_param ? tmp : (checkNum = Number(a_param), tmp = isNaN(checkNum) ? "INVALID" : 1 > checkNum ? "CLOSE" : checkNum > 1 ? "OPEN" : "NONE");
            }
            function v(a_param) {
                var c_local = {};
                var d_local = b$$0(a_param, "nativeEvent.rotation") || 0;
                var e = b$$0(a_param, "nativeEvent.scale") || 1;
                var f_local = null;
                var array = {
                    type: 4,
                    timestamp: (new Date).getTime(),
                    event: {
                        type: "touchend"
                    },
                    target: {
                        id: b$$0(a_param, "target.id"),
                        idType: b$$0(a_param, "target.idType")
                    }
                };
                if (!(W && (!e || 1 === e))) {
                    if (!(!W && a_param.nativeEvent.touches.length <= 1)) {
                        f_local = {
                            rotation: d_local ? d_local.toFixed(2) : 0,
                            scale: e ? e.toFixed(2) : 1
                        };
                        f_local.pinch = u(f_local.scale);
                        if (!s(f_local)) {
                            if (F) {
                                if (F.timestamp) {
                                    c_local.rotation = F.rotation;
                                    c_local.scale = F.scale;
                                    c_local.pinch = u(c_local.scale);
                                }
                            }
                            if (b$$0(c_local, "scale")) {
                                array.target.prevState = c_local;
                            }
                            array.target.currState = f_local;
                            g$$0(array);
                            t(f_local);
                        }
                    }
                }
            }
            function w(c_param) {
                //Note: normally viewPortWidth:  window.innerWidth ||  (document.documentElement || document.body).clientWidth
                //But because of that viewport width + viewPortX > pageWidth 
                //Because of that total scrolled % was coming more than 100%. 
                //To solve that issue we need to take minimum of two 
                var viewPortHeight = 0;
                if (window.innerHeight && (document.documentElement || document.body) && (document.documentElement || document.body).clientHeight)
                    viewPortHeight = Math.min(window.innerHeight, (document.documentElement || document.body).clientHeight);
                else if (window.innerHeight)
                    viewPortHeight = window.innerHeight;
                else if ((document.documentElement || document.body) && (document.documentElement || document.body).clientHeight)
                    viewPortHeight = (document.documentElement || document.body).clientHeight;

                var viewPortWidth = 0;
                if (window.innerWidth && (document.documentElement || document.body) && (document.documentElement || document.body).clientWidth)
                    viewPortWidth = Math.min(window.innerWidth, (document.documentElement || document.body).clientWidth);
                else if ((document.documentElement || document.body) && (document.documentElement || document.body).clientWidth)
                    viewPortWidth = (document.documentElement || document.body).clientWidth;
                else if (window.innerWidth)
                    viewPortWidth = window.innerWidth;

                var array = {
                    type: 1,
                    //added for timestamp.
                    timestamp: (new Date).getTime(),
                    clientState: {
                        pageWidth: Math.max(
                            document.body.scrollWidth, document.documentElement.scrollWidth,
                            document.body.offsetWidth, document.documentElement.offsetWidth,
                            document.body.clientWidth, document.documentElement.clientWidth
                        ),
                        pageHeight: Math.max(
                            document.body.scrollHeight, document.documentElement.scrollHeight,
                            document.body.offsetHeight, document.documentElement.offsetHeight,
                            document.body.clientHeight, document.documentElement.clientHeight
                        ),
                        viewPortWidth: viewPortWidth,
                        viewPortHeight: viewPortHeight,
                        viewPortX: window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft,
                        viewPortY: window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop,
                        deviceOrientation: window.orientation || 0,
                        event: b$$0(c_param, "type")
                    }
                };
                var angle = 1;
                var viewPortWidth1 = 1;
                return angle = 90 === Math.abs(array.clientState.deviceOrientation) ? W ? Z - $ : 320 >= Y ? Z - $ : Z / X - $ : W ? Y + $ : 320 >= Y ? Y - $ : Y / X - $,
                    viewPortWidth1 = 0 === array.clientState.viewPortWidth ? 1 : angle / array.clientState.viewPortWidth,
                    array.clientState.deviceScale = viewPortWidth1 - 0.02,
                    array.clientState.deviceScale = array.clientState.deviceScale.toFixed(3),
                    array.clientState.viewTime = null === P ? 0 : (new Date).getTime() - P.getTime(),
                    "scroll" === c_param.type && (0 >= K && M && (R = M.clientState.viewPortX, S = M.clientState.viewPortY)),
                    "scroll" === c_param.type && (array.clientState.viewPortXStart = R, array.clientState.viewPortYStart = S),
                    L = CAVUA.utils.clone(array),
                    array;
            }
            function x() {
                return null !== L && "load" !== L.clientState.event ? ("scroll" === L.clientState.event && (delete L.clientState.viewPortXStart, delete L.clientState.viewPortYStart), L.clientState.event = "attention", L.clientState.viewTime = null === Q ? 0 : (new Date).getTime() - Q.getTime(), g$$0(L), Q = new Date, true) : false;
            }
            function y(a) {
                return "scroll" === a.clientState.event && (a.clientState.viewPortXStart === a.clientState.viewPortX && a.clientState.viewPortYStart === a.clientState.viewPortY) ? false : true;
            }
            function z(b) {
                var c = null === T ? 0 : (new Date).getTime() - T.getTime();
                return null !== L && (b.type !== L.clientState.event || c >= 1E3) ? (y(L) && (g$$0(L), "touchend" !== L.clientState.event && (M = CAVUA.utils.clone(L))), L = null, P = null, K = 0, true) : (null !== L && (1 === K && (c >= 1E3 && (("resize" === L.clientState.event || ("scroll" === L.clientState.event || ("orientationchange" === L.clientState.event || "screenview_load" === b.type))) && x()))), false);
            }
            function A(a, c) {
                var d;
                var e;
                var f = ["type", "target.id"];
                var g = null;
                var h = true;
                var i = 30; //since we are getting many samples where the difference between two consecutive events are around 20 so increasing it to 30.
                var j = 0;
                var k = 0;
                var l = 0;
                if (!(a && (c && ("object" == typeof a && "object" == typeof c)))) {
                    h = false;
                }
                d = 0;
                e = f.length;
                for (; h && e > d; d += 1) {
                    if (g = f[d], b$$0(a, g) !== b$$0(c, g)) {
                        h = false;
                        break;
                    }
                }
                return h && (k = b$$0(a, "timestamp"), l = b$$0(c, "timestamp"), isNaN(k) && isNaN(l) || (j = Math.abs(b$$0(a, "timestamp") - b$$0(c, "timestamp")), (isNaN(j) || j > i) && (h = false))),
                    h;
            }
            function B() {
                var a = window.location.hash;
            }
            function C(event1) {
                var c = {
                    type: 4,
                    timestamp: (new Date).getTime(),
                    event: {
                        type: event1.type
                    },
                    target: {
                        id: b$$0(event1, "target.id"),
                        idType: b$$0(event1, "target.idType")
                    }
                };
                g$$0(c);
            }
            var timer; // this flag helps in capturing scroll only once.
            var D = {
                "input:radio": "radioButton",
                "input:checkbox": "checkBox",
                "input:text": "textBox",
                "input:password": "textBox",
                "input:file": "fileInput",
                "input:button": "button",
                "input:submit": "submitButton",
                "input:reset": "resetButton",
                "input:image": "image",
                "input:color": "color",
                "input:date": "date",
                "input:datetime": "datetime",
                "input:datetime-local": "datetime-local",
                "input:number": "number",
                "input:email": "email",
                "input:tel": "tel",
                "input:search": "search",
                "input:url": "url",
                "input:time": "time",
                "input:week": "week",
                "input:month": "month",
                "textarea:": "textBox",
                "select:": "selectList",
                "button:": "button",
                "a:": "link"
            };
            var E = window.orientation || 0;
            var F = {
                scale: 0,
                timestamp: 0
            };
            var G = {};
            var H = window.location.hash;
            var I = null;
            var J = [];
            var K = 0;
            var L = null;
            var M = null;
            var N = 0;
            var O = ((new Date).getTime(), null);
            var P = null;
            var Q = null;
            var R = 0;
            var S = 0;
            var T = null;
            var U = {
                inFocus: false
            };
            var V = null;
            var W = navigator.userAgent.indexOf("iPhone") > -1 || (navigator.userAgent.indexOf("iPod") > -1 || navigator.userAgent.indexOf("iPad") > -1);
            var X = window.devicePixelRatio || 1;
            var Y = null === window.screen ? 0 : window.screen.width;
            var Z = null === window.screen ? 0 : window.screen.height;
            var $ = null === window.screen ? 0 : window.screen.height - window.screen.availHeight;
            /*TODO: check a.getConfig()*/
            return {
                init: function () {
                    /* TODO:Currently we are not capturing errors. we can use this to capture errors. 
                            //Set up onerror.  
                            if (typeof window.onerror !== 'function') {
                              window.onerror = function(b, c, d) {
                                var e = null;
                                if ("string" == typeof b) {
                                  d = d || -1;
                                  e = {
                                    type: 6,
                                    exception: {
                                      description: b,
                                      url: c,
                                      line: d
                                    }
                                  };
                                  N += 1;
                                  CAVUA.Queue.post(e);
                                }
                              };
                            }
                    */
                    CAVNV.log("replay module installed");
                },
                destroy: function () {
                    l$$0(I);
                },
                //G is an array of previous events with index as target.id.
                onevent: function (event) {
                    CAVNV.log("event " + event.type + " found");

                    //if protocolVersion is 1 then if events are not load/unload then updateMutationState.
                    if (!/(load)/.test(event))
                        CAVNV.plugins.DOMWATCHER2.updateMutationState(NVDOMObserver.USERACTION_MUTATION);

                    var elementXpath = null;
                    var d = null;
                    if ("object" == typeof event && event.type) {
                        //change type for nvload and nvunload event.
                        if (event.type == "nvload") {
                            event.type = "load";
                        }

                        if (event.type == 'touchend') {
                            event.type = 'click';
                        }

                        if (A(event, O)) {
                            return void (O = event);
                        }
                        var defaultFilter = CAVNV.plugins.USERACTION.getConfig().filterJsTriggeredActions;
                        if (defaultFilter == true) {
                            //event.nativeEvent.isTrusted = false, means event is triggered by js
                            if (!event.nativeEvent.isTrusted) {
                                CAVNV.log("Filtering JS Triggered Actions");
                                return;
                            }
                        }
                        //check if eventtype is click or change or focus or blur and ajax page running then start.  
                        if (CAVNV.ajax_pg_start_time != -1 && (event.type == "focus" || event.type == "click" || event.type == "change"))
                            CAVNV.cav_nv_ajax_pg_init();

                        // changes for kohl's poc : was not capturing any event for keyboard , since password was captured with keyboard //FIX IT:
                        if (event.target && event.target.element && typeof event.target.element.className == "string" && event.target.element.className.indexOf('KeyboardRowKey') != -1) {
                            return;
                        }

                        function logMouseMove() {
                            if (mouseMoveData == "") return;
                            lstmx = lstmy = 0;
                            var mMData = (new Date().getTime() - 300) + "|-1|6||||||||||" + mouseMoveData + "||-1|-1|||";
                            CAVUA.logEvent(mMData, false, 4);
                            mouseMoveData = "";
                        }

                        switch (O = event, elementXpath = b$$0(event, "target.id"), "[object Object]" !== Object.prototype.toString.call(G[elementXpath]) && (G[elementXpath] = {}), z(event), m(elementXpath, event), T = new Date, event.type) {
                            case "hashchange":
                                B();
                                break;
                            case "focus":
                                i$$0(elementXpath, event);
                                d = true;
                                break;
                            case "blur":
                                l$$0(elementXpath, event);
                                d = true;
                                break;
                            case "click":
                                if (!!CAVNV.config.USERACTION.MMCapture && CAVNV.config.USERACTION.MMCapture.enabled) {
                                    // log hover data.
                                    logMouseMove();
                                }
                                if (!!CAVNV.config.USERACTION.MHCapture && CAVNV.config.USERACTION.MHCapture.enabled) {
                                    var hoverValue = "";
                                    if (mouseHoverData.length != 0) {
                                        mouseHoverData.forEach(function (data) {
                                            hoverValue += data + "~";
                                        });
                                        if (hoverValue.length > 0);
                                        hoverValue = hoverValue.substring(0, hoverValue.length - 1);
                                        var hoverData = (new Date().getTime()) + "|-1|5||||||||||" + hoverValue + "||-1|-1|||";
                                        CAVUA.logEvent(hoverData, false, 4);
                                        mouseHoverData = []
                                    }
                                }
                                d = p(elementXpath, event);
                                break;
                            case "change":
                                //Note: handled for autoFillingObserver.
                                //update this new value.               
                                if (CAVNV.inputNodes) {
                                    var e = event.target.element;
                                    var ana = CAVNV.inputNodes.get(e);
                                    if (ana) {
                                        var v = e.value;
                                        if (e.tagName && e.tagName == 'SELECT') {
                                            v = "";
                                            if (e.selectedIndex < e.options.length && e.selectedIndex >= 0)
                                                v = e.options[e.selectedIndex].text;
                                        }
                                        if (ana.value == v)
                                            return null;
                                        ana.time = new Date().getTime();
                                        ana.value = v;
                                    }
                                }

                                n(elementXpath, event);
                                d = true;
                                break;
                            case "orientationchange":
                                r();
                                d = true;
                                break;
                            case "touchend":
                                //FIXME:Currently handled as CLICK.   
                                //d = v(event);
                                //d = w(event);
                                event.type = "click";
                                try {
                                    d = p(elementXpath, event);
                                } catch (e) { }
                                event.type = "touchend";
                                break;
                            case "load":
                                /*CAVUA.logScreenviewLoad("root"), */
                                d = w(event);
                                Q = new Date;
                                break;
                            case "screenview_load":
                                Q = new Date;
                                break;
                            case "screenview_unload":
                                break;
                            case "resize":

                            case "scroll":
                                //on scroll log mouseMoveData 
                                if (!!CAVNV.config.USERACTION.MMCapture && CAVNV.config.USERACTION.MMCapture.enabled) {
                                    clearTimeout(timer);
                                    timer = setTimeout(function () { logMouseMove() }, 300);
                                }
                                if (null === P) {
                                    if (0 >= K) {
                                        P = new Date;
                                    }
                                }
                                d = w(event);
                                if (y(d)) {
                                    d = null;
                                } else {
                                    K += 1;
                                }
                                break;
                            case "nvunload":
                                //change event type to unload.
                                event.type = "unload";
                                if (null !== J) {
                                    h$$0(J);
                                }
                                d = w(event);
                                x();
                                g$$0(d);
                                //reset event type.
                                event.type = "nvunload";
                                break;
                            case "unload":
                                if (null !== J) {
                                    h$$0(J);
                                }
                                d = w(event);
                                x();
                                g$$0(d);
                                /*CAVUA.logScreenviewUnload("root");*/
                                CAVUA.flushAll(true);
                                break;
                            default:
                                C(event);
                        }

                        //CHeck for user segment.  
                        if (event.type == "click" || event.type == "change" || event.type == "focus")
                            CAVNV.processUserSegments(event.target.element);

                        return I = elementXpath,
                            d;
                    }
                },
                onmessage: function () { }
            };
        }(CAVUA.utils);

        CAVUA.Queue = function () {
            function cavwrapper(paramb_cavwrapper) {
                //msg pattern:SID|PageID|PageInstance|TimeStamp|Duration|EventType|ID|IDType|ElementName|ElementType|ElementSubType|xpos|ypos|width|height|Value|PrevValue
                var cmsg = {
                    timeStamp: paramb_cavwrapper.timestamp,
                    duration: -1,
                    eventType: -1, //we will use enum for events
                    id: "",
                    idType: -2,
                    elementName: "",
                    elementType: "",
                    elementSubType: "",
                    xpos: -1,
                    ypos: -1,
                    width: -1,
                    height: -1,
                    value: "",
                    encValue: "",
                    value1: -1, //max scroll for horizontal.
                    value2: -1,  //max scroll from vertical.
                    iframeID: '',
                    attr: '{}', //some more attributes for element identification eg. id, linkText, css, href, alt, etc.
                    xpath: '' //needed for click,navigation and exit map if cssselector is enabled
                };
                //add other events.
                var events = {
                    /****Type 4 events ****/
                    "focus": 0,
                    "blur": 1,
                    "click": 2,
                    "change": 3,
                    "hashchange": 4,
                    "mouseover": 5,
                    "mousemove": 6,
                    /***type 1 events *****/
                    "load": 1E3,
                    "unload": 1001,
                    "resize": 1002,
                    "scroll": 1003,
                    "orientationchange": 1004,
                    //FIXME: proper handling.
                    //"touchend": 1005
                    "touchend": 2,
                    "touchstart": 2
                    // 'attention': 1006
                };
                var e_cavwrapper = "unknown";
                if (paramb_cavwrapper.type == 1) {
                    e_cavwrapper = paramb_cavwrapper.clientState.event.toLowerCase();
                }
                if (paramb_cavwrapper.type == 4) {
                    e_cavwrapper = paramb_cavwrapper.event.type.toLowerCase();
                }
                if (events.hasOwnProperty(e_cavwrapper)) {
                    cmsg.eventType = events[e_cavwrapper];
                }
                //TODO: check it's impact on other events.
                if (cmsg.eventType === -1) {
                    return null;
                }

                //modify as per the msg type.
                //load/unload/size/resize msg.a

                if (paramb_cavwrapper.type == 1) {
                    if (typeof paramb_cavwrapper.clientState.viewTime != "undefined") {
                        cmsg.duration = paramb_cavwrapper.clientState.viewTime;
                    }
                    if (cmsg.duration == undefined || cmsg.duration == null) {
                        cmsg.duration = -1;
                    }
                    //this should be per 1000.
                    cmsg.xpos = parseInt(paramb_cavwrapper.clientState.viewPortX / paramb_cavwrapper.clientState.pageWidth * 1E3);
                    if (isNaN(cmsg.xpos)) cmsg.xpos = -1;
                    cmsg.ypos = parseInt(paramb_cavwrapper.clientState.viewPortY / paramb_cavwrapper.clientState.pageHeight * 1E3);
                    if (isNaN(cmsg.ypos)) cmsg.ypos = -1;
                    cmsg.width = paramb_cavwrapper.clientState.viewPortWidth;
                    cmsg.height = paramb_cavwrapper.clientState.viewPortHeight;
                    cmsg.value1 = parseInt((paramb_cavwrapper.clientState.viewPortX + cmsg.width) / paramb_cavwrapper.clientState.pageWidth * 1E3);
                    if (isNaN(cmsg.value1)) cmsg.value1 = -1;
                    cmsg.value2 = parseInt((paramb_cavwrapper.clientState.viewPortY + cmsg.height) / paramb_cavwrapper.clientState.pageHeight * 1E3);
                    if (isNaN(cmsg.value2)) cmsg.value2 = -1;
                } else {
                    if (paramb_cavwrapper.type == 4) {
                        if (typeof paramb_cavwrapper.target.name !== "undefined") {
                            cmsg.duration = paramb_cavwrapper.target.dwell;
                        }
                        if (cmsg.duration == undefined || cmsg.duration == null) {
                            cmsg.duration = -1;
                        }
                        //Check if we have id or idType.
                        cmsg.id = paramb_cavwrapper.target.id.replace(/([^\\])\\\./g, "$1\\\\.");
                        cmsg.idType = paramb_cavwrapper.target.idType;
                        cmsg.iframeID = paramb_cavwrapper.target.iframeID;
                        //fill xpath only if idType is not set to Xpath 
                        cmsg.xpath = (paramb_cavwrapper.target.xpath && cmsg.eventType == 2 && cmsg.idType != -2) ? paramb_cavwrapper.target.xpath : "";

                        //FIXME: handle it properly. 
                        //if id contain IFRAME and itType is -2 then replace iframe by *       
                        if (cmsg.id.indexOf("IFRAME") != -1 && cmsg.idType == -2) {
                            cmsg.id = cmsg.id.replace(/^.*IFRAME/, "//*");
                        }
                        if (typeof paramb_cavwrapper.target.name !== "undefined" && paramb_cavwrapper.target.name != null) {
                            cmsg.elementName = paramb_cavwrapper.target.name;
                        }
                        cmsg.elementType = paramb_cavwrapper.target.type;
                        if (typeof paramb_cavwrapper.target.subType !== "undefined" && paramb_cavwrapper.target.subType != null) {
                            cmsg.elementSubType = paramb_cavwrapper.target.subType;
                        }
                        //relXY is not present for all events.
                        if (paramb_cavwrapper.target.position && "undefined" !== typeof paramb_cavwrapper.target.position.relXY) {
                            //relXY are in range of 0-1. give it as per 1000.
                            var relxy = paramb_cavwrapper.target.position.relXY.split(",");
                            //change in 1000 range.
                            var x = parseFloat(relxy[0]) * 1E3;
                            var y = parseFloat(relxy[1]) * 1E3;
                            cmsg.xpos = x;
                            cmsg.ypos = y;
                        }
                        if (paramb_cavwrapper.target.position && "undefined" !== typeof paramb_cavwrapper.target.position.width) {
                            cmsg.width = paramb_cavwrapper.target.position.width;
                        }
                        if (paramb_cavwrapper.target.position && "undefined" !== typeof paramb_cavwrapper.target.position.height) {
                            cmsg.height = paramb_cavwrapper.target.position.height;
                        }
                        //set value.
                        //TODO: test all these values.
                        var valueIndex = {
                            "RADIO": "checked",
                            "CHECKBOX": "checked",
                            "TEXT": "value",
                            "PASSWORD": "value",
                            "FILE": "value",
                            "BUTTON": "value",
                            "SUBMIT": "value",
                            "RESET": "value",
                            "IMAGE": "src",
                            "COLOR": "value",
                            "DATE": "value",
                            "DATETIME": "value",
                            "DATETIME-LOCAL": "value",
                            "NUMBER": "value",
                            "EMAIL": "value",
                            "TEL": "value",
                            "SEARCH": "value",
                            "URL": "value",
                            "TIME": "value",
                            "WEEK": "value",
                            "MONTH": "value",
                            "TEXTAREA": "value",
                            "SELECT": "value",
                            "A": "href"
                        };
                        //If input then check from subtype.e
                        var type = paramb_cavwrapper.target.type.toUpperCase();
                        var subType = paramb_cavwrapper.target.subType.toUpperCase();
                        if (type === "INPUT" && valueIndex.hasOwnProperty(subType)) {
                            var len;
                            var pwd = " ";
                            var regMasterCard = /^5[1-5][0-9]{14}$/;
                            var regVisaCard = /^4[0-9]{12}(?:[0-9]{3})?$/;
                            var regDiscover = /^6(?:011|5[0-9]{2})[0-9]{12}$/;
                            var regAmericanExpress = /^3[47][0-9]{13}$/;
                            var regCsvCode = /^[0-9]{3}$/;
                            //Added jcpenney credit card.
                            var jcpCard = /^[0-9]{11}$/;
                            //mm/dd/yy
                            var regDate = /^(((0?[1-9]|[12]\d|3[01])[\.\-\/](0?[13578]|1[02])[\.\-\/]((1[6-9]|[2-9]\d)?\d{2}|\d))|((0?[1-9]|[12]\d|30)[\.\-\/](0?[13456789]|1[012])[\.\-\/]((1[6-9]|[2-9]\d)?\d{2}|\d))|((0?[1-9]|1\d|2[0-8])[\.\-\/]0?2[\.\-\/]((1[6-9]|[2-9]\d)?\d{2}|\d))|(29[\.\-\/]0?2[\.\-\/]((1[6-9]|[2-9]\d)?(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00)|00|[048])))$/;
                            //dd/mm/yy
                            var regDate1 = /^([0]?[1-9]|[1|2][0-9]|[3][0|1])[./-]([0]?[1-9]|[1][0-2])[./-]([0-9]{4}|[0-9]{2})$/;
                            //yy/mm/dd/
                            var regDate2 = /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;
                            //In this regular expression limit is from 8 to 15 and this can accept number like 12345678, 1234-5678, +12 345-678-93 or (61) 8383-3939
                            var regPhoneNumber = /^[\(\)\s\-\+\d]{8,15}$/;
                            var valueCurrent = paramb_cavwrapper.target.currState.value;
                            if (typeof valueCurrent !== "undefined") {
                                //Removed phoneNumber from this list, because it was conflicting with date pattern mm-dd-yyyy.
                                if ((subType === "PASSWORD" || (valueCurrent.match(regMasterCard) || (valueCurrent.match(regCsvCode) || (valueCurrent.match(regVisaCard) || (valueCurrent.match(regDiscover) || valueCurrent.match(regAmericanExpress) || valueCurrent.match(jcpCard)))))) && !(valueCurrent.match(regDate) || (valueCurrent.match(regDate1) || valueCurrent.match(regDate2)))) {
                                    len = paramb_cavwrapper.target.currState.value.length;
                                    if (typeof paramb_cavwrapper.target.currState === "object" && paramb_cavwrapper.target.currState.hasOwnProperty(valueIndex[subType])) {
                                        for (; len > 0;) {
                                            pwd += "*";
                                            len--;
                                        }
                                        cmsg.value = pwd;
                                    }
                                } else {
                                    if (subType === "IMAGE") {
                                        cmsg.value = paramb_cavwrapper.target.currState.src;
                                    } else {
                                        if (typeof paramb_cavwrapper.target.currState === "object" && paramb_cavwrapper.target.currState.hasOwnProperty(valueIndex[subType])) {
                                            cmsg.value = paramb_cavwrapper.target.currState.value;
                                        }
                                    }
                                }
                            }
                        } else {
                            if (type === "A") {
                                cmsg.value = paramb_cavwrapper.target.currState.href;
                            } else {
                                if (valueIndex.hasOwnProperty(type)) {
                                    if (typeof paramb_cavwrapper.target.currState === "object" && paramb_cavwrapper.target.currState !== null && paramb_cavwrapper.target.currState.hasOwnProperty(valueIndex[type])) {
                                        cmsg.value = paramb_cavwrapper.target.currState.value;
                                    }
                                }
                            }
                        }
                        cmsg.attr = JSON.stringify(CAVUA.utils._getElementAttr(paramb_cavwrapper.target)).replace(/([^\\])\\\./g, "$1\\\\.");
                    }
                }
                if (cmsg.value == null || cmsg.value == undefined)
                    cmsg.value = "";
                //if data is sensitive then don't copy.
                var eeflag = paramb_cavwrapper.eeflag || 0;
                var valObj = CAVNV.utils.getEEValue(cmsg.value, eeflag, true);
                cmsg.value = valObj.v || "";
                cmsg.encValue = valObj.ev || "";

                var msg = null;
                var ii;
                for (ii in cmsg) {
                    if (!msg)
                        msg = cescape(cmsg[ii]);
                    else
                        msg = msg + "|" + cescape(cmsg[ii]);
                }
                CAVNV.log("useraction msg = " + msg);
                return msg;
            }
            function cescape(msg) {
                var out = msg;
                //encoded some special characters and | because pipe will be use as separator and, .
                if (typeof msg === "string") {
                    out = msg.replace(/\|/g, "&#124;");
                }
                return out;
            }

            function wrapMessages(arrayDate) {
                //arrayDate is an array. just seperate each entry by new line. don't add any other sh..
                if (typeof arrayDate === "object") {
                    //TODO: check if array.
                    var fq = [];
                    var prefix = "-1|-1|-1";
                    if (typeof CAVNV !== "undefined" && (typeof CAVNV.sid !== "undefined" && (typeof CAVNV.pageIndex !== "undefined" && typeof CAVNV.pageInstance !== "undefined"))) {
                        prefix = CAVNV.sid + "|" + CAVNV.pageIndex + "|" + CAVNV.pageInstance;
                        //we need to add the sid, pageindex and page instance.
                    }
                    var z = 0;
                    for (; z < arrayDate.length; z++) {
                        //add prefix.
                        //get time and then modify it's timestamp.
                        var ti = arrayDate[z].indexOf("|");
                        var t = CAVNV.utils.nv_time(parseInt(arrayDate[z].substr(0, ti)));
                        arrayDate[z] = prefix + "|" + t + arrayDate[z].substr(ti);
                        fq.push(arrayDate[z]);
                    }
                    CAVNV.log("message to send = " + fq.join("\n"));
                    return fq;
                }
            }

            //replace it with our ajax call.l
            function sendua(force) {
                //we will not send ua in case if pagedump is disabled
                if (CAVNV.__uaEnabled == false) queue = [];

                if ((queue.length + queue2.length) == 0) {
                    return;
                }
                force = force || false;

                //useraction url format: <beacon_url>?s=<sid>&op=useraction&d=<any relevent data>
                //eg. http://www.cavnv.com/nv?s=343234342343234323432&op=useraction
                if (typeof CAVNV.sid === "undefined" || CAVNV.sid == 0) {
                    CAVNV.log("CAVNV.sid not defined, unable to send user actions");
                    return;
                }
                if (typeof CAVNV.pageInstance === "undefined") {
                    CAVNV.log("CAVNV.pageInstance not defined, unable to send user actions");
                    return;
                }
                if (typeof CAVNV.lts === "undefined") {
                    CAVNV.lts = boomr.utils.getNVCookie(CAVNV.LTS);
                }

                //updating lts for useraction req only
                CAVNV.lts = parseInt(CAVNV.utils.nv_time(new Date().getTime()) / 1000);
                var url = CAVNV.beacon_url + "?s=" + CAVNV.sid + "&p=" + CAVNV.protocolVersion + "&m=" + CAVNV.messageVersion + "&op=useraction&pi=" + CAVNV.pageInstance + "&CavStore=" + CAVNV.store + "&pid=" + CAVNV.pageIndex + "&d=" + (rtInQ == true ? "1" : "0") + "|" + CAVNV.channel + "&lts=" + CAVNV.lts;

                if (!!CAVNV.window.NBridge && !!CAVNV.lts)
                    CAVNV.window.NBridge.getAppParam(JSON.stringify({ 'lts': CAVNV.lts.toString() }));
                if (!!CAVNV.window.webkit && !!CAVNV.window.webkit.messageHandlers.appNativeSync)
                    CAVNV.window.webkit.messageHandlers.appNativeSync.postMessage(JSON.stringify({ 'lts': CAVNV.lts.toString() }));

                //modified for netvision format
                var fq = [], msgToFlush;
                if (queue.length)
                    fq = wrapMessages(queue);

                if (queue2.length) {
                    var q = wrapMessages(queue2);
                    for (var z = 0; z < q.length; z++)
                        fq.push(q[z]);
                }

                if (CAVNV.messageVersion == 1)
                    msgToFlush = JSON.stringify(fq);
                else
                    msgToFlush = fq.join('\n') + "\n"

                CAVNV.utils.sendData(url, msgToFlush, "useraction");
                //    boomr.cav_nv_handle_sess_expiry(0);  

                //reset queue 
                rtInQ = false;
                queue = [];
                queue2 = [];
            }
            var queue = [];
            var queue2 = [];
            var rtInQ = false;
            var threshold = 15;
            return {
                post: function (eventArray) {
                    CAVNV.log("post() called, for event type " + eventArray.type);

                    //currently we are intreasted only on type 1 and type 4. message. so now descarding all other messages.
                    if (typeof eventArray.type === "undefined" || (eventArray.type === null || eventArray.type != 4 && eventArray.type != 1)) {
                        return;
                    }

                    //just modify the message.
                    var msg = cavwrapper(eventArray);
                    CAVNV.log("Event Msg :" + msg);
                    if (msg === null) {
                        return;
                    }
                    queue.push(msg);
                    if ((queue2.length + queue.length) >= threshold) {
                        sendua(false);
                    }
                },
                flush: function (force) {
                    force = force || false;
                    if (CAVNV.int_tm && (CAVNV.int_tm.length > 0)) {
                        //check if any internal timing data pending. then add that and send that also.
                        //this record will go with opcode -5
                        var tm_log = (new Date().getTime()) + '|' + '-1|-5||-2||||-1|-1|-1|-1|' + CAVNV.int_tm.join('&') + '|';
                        //remove the data.
                        CAVNV.int_tm = [];
                        queue.push(tm_log);
                    }
                    CAVNV.log("CAVUA: flushing data.");
                    //flush means send forcefully
                    if (force == true)
                        sendua(true);
                    else
                        sendua();
                },
                //api just to log any raw event.
                //just to use the user action queue.
                logEvent: function (eventData, force, type) {
                    queue2.push(eventData);
                    //if type is rt then set flag. 
                    if (type == "rt") rtInQ = true;
                    if (force == true || (queue.length + queue2.length) >= threshold)
                        sendua(false);
                },
                clearQ: function () {
                    queue2 = [];
                    queue = [];
                }
            };
        }()

        CAVUA.RegisterEvents = function (s) {
            function function_a(pr_module1, eventsObject, getDocument$$0) {
                var elementPath;
                var gRegisterEvents;
                var serviceBrowserBase = CAVUA.BrowserBase;
                var serviceBrowser = CAVUA.Browser;
                var documentObject = CAVUA.utils.getDocument(getDocument$$0);
                var windowObject = CAVUA.utils._getLocalTop();

                if (documentObject.__nv_capturing == true)
                    return;

                documentObject.__nv_capturing = true;

                var n = CAVUA.utils.isIFrameDescendant(getDocument$$0);
                getDocument$$0 = getDocument$$0 || documentObject;
                CAVUA.utils.function_j.normalizeModuleEvents(pr_module1, eventsObject, windowObject, documentObject);
                elementPath = serviceBrowserBase.ElementData.prototype.examineID(getDocument$$0).id;
                if (n && ("string" == typeof elementPath)) {
                    elementPath = elementPath.slice(0, elementPath.length - 1);
                    for (gRegisterEvents in RegisterEventLList) {
                        if (RegisterEventLList.hasOwnProperty(gRegisterEvents)) {
                            if (-1 !== gRegisterEvents.indexOf(elementPath)) {
                                delete RegisterEventLList[gRegisterEvents];
                            }
                        }
                    }
                }
                CAVUA.utils.forEach(eventsObject, function (eventName) {
                    var winElementDoc = e(eventName.target, windowObject, documentObject) || documentObject;
                    var gRegisterEvents = e(eventName.delegateTarget, windowObject, documentObject);
                    var stringVar = "";
                    if (!(eventName.recurseFrames !== true && n)) {
                        if ("string" == typeof winElementDoc) {
                            if (eventName.delegateTarget && "jQuery" === s.getFlavor()) {
                                stringVar = s._buildToken4delegateTarget(eventName.name, winElementDoc, eventName.delegateTarget);
                                if (RegisterEventLList.hasOwnProperty(stringVar)) {
                                    RegisterEventLList[stringVar].push(pr_module1);
                                } else {
                                    RegisterEventLList[stringVar] = [pr_module1];
                                    RegisterEventLList[stringVar].target = winElementDoc;
                                    RegisterEventLList[stringVar].delegateTarget = gRegisterEvents;
                                    serviceBrowser.subscribe(eventName.name, winElementDoc, s._publishEvent, gRegisterEvents, stringVar);
                                }
                            } else {
                                CAVUA.utils.forEach(serviceBrowser.queryAll(winElementDoc, getDocument$$0), function (getDocument) {
                                    var e_local1 = d.get(getDocument);
                                    if (!e_local1) {
                                        e_local1 = serviceBrowserBase.ElementData.prototype.examineID(getDocument);
                                        d.set(getDocument, e_local1);
                                    }
                                    stringVar = eventName.name + "|" + e_local1.id + e_local1.type;
                                    if (-1 === CAVUA.utils.indexOf(RegisterEventLList[stringVar], pr_module1)) {
                                        RegisterEventLList[stringVar] = RegisterEventLList[stringVar] || [];
                                        RegisterEventLList[stringVar].push(pr_module1);
                                        RegisterEventLList[stringVar].target = getDocument;
                                        serviceBrowser.subscribe(eventName.name, getDocument, s._publishEvent);
                                    }
                                });
                            }
                        } else {
                            stringVar = s._buildToken4bubbleTarget(eventName.name, winElementDoc, "undefined" == typeof eventName.target);
                            if (RegisterEventLList.hasOwnProperty(stringVar)) {
                                if (-1 === CAVUA.utils.indexOf(RegisterEventLList[stringVar], pr_module1)) {
                                    RegisterEventLList[stringVar].push(pr_module1);
                                }
                            } else {
                                RegisterEventLList[stringVar] = [pr_module1];
                                serviceBrowser.subscribe(eventName.name, winElementDoc, s._publishEvent);
                            }
                        }
                        if ("" !== stringVar) {
                            if ("string" != typeof winElementDoc) {
                                RegisterEventLList[stringVar].target = winElementDoc;
                            }
                        }
                    }
                });
            }
            function function_b(getIframeElement1) {
                var getWindoww = CAVUA.utils.getCurrentIFrameWindow(getIframeElement1);
                return getWindoww && (s._hasSameOrigin(getWindoww) && (getWindoww.document && "complete" === getWindoww.document.readyState));
            }
            function function_c(pr_module, array, getDocument) {
                CAVNV.log("RegisterModule Called");
                if (getDocument = getDocument || s._getLocalTop().document, d = d || new CAVUA.utils.WeakMap, function_a(pr_module, array, getDocument), "performance" !== pr_module) {
                    var counter;
                    var lengthArray;
                    var getIframeElement = null;
                    var getCurrentWindow$$0 = null;
                    var arr = CAVUA.Browser.queryAll("iframe, frame", getDocument);
                    counter = 0;
                    lengthArray = arr.length;
                    for (; lengthArray > counter; counter += 1) {
                        getIframeElement = arr[counter];
                        if (!false) {
                            if (function_b(getIframeElement)) {
                                getCurrentWindow$$0 = CAVUA.utils.getCurrentIFrameWindow(getIframeElement);
                                CAVUA.RegisterEvents(pr_module, array, getCurrentWindow$$0.document);
                            }
                            (function (moduleName1, moduleEvent, pr_module) {
                                var getCurrentWindow = null;
                                var arrayModuleInfo = {
                                    moduleName: moduleName1,
                                    moduleEvents: moduleEvent,
                                    hIFrame: pr_module,
                                    RegisterEventsDelayed: function () {
                                        var getWindow = null;
                                        if (!false) {
                                            getWindow = CAVUA.utils.getCurrentIFrameWindow(pr_module);
                                            if (s._hasSameOrigin(getWindow)) {
                                                CAVUA.RegisterEvents(moduleName1, moduleEvent, getWindow.document);
                                            }
                                        }
                                    }
                                };
                                CAVUA.utils.addEventListener(pr_module, "load", function () {
                                    arrayModuleInfo.RegisterEventsDelayed();
                                });
                                if (CAVUA.utils.isLegacyIE()) {
                                    getCurrentWindow = CAVUA.utils.getCurrentIFrameWindow(pr_module);
                                    if (getCurrentWindow) {
                                        if (getCurrentWindow.document) {
                                            CAVUA.utils.addEventListener(getCurrentWindow.document, "readystatechange", function () {
                                                arrayModuleInfo.RegisterEventsDelayed();
                                            });
                                        }
                                    }
                                }
                            })(pr_module, array, getIframeElement);
                        }
                    }
                }
            }
            var d;
            var e = function (getWindow1, objectWindow, getDocument) {
                return "window" === getWindow1 ? objectWindow : "document" === getWindow1 ? getDocument : getWindow1;
            };
            return function_c.clearCache = function () {
                if (d) {
                    d.clear();
                    d = null;
                }
            },
                function_c;
        }(CAVUA.utils);

        CAVUA.init = function (config) {
            //FIXME: is it good to be dependent on CAVNV.sid and other things because it may delay in collection of events.
            //TODO: should be defined.
            CurrentConfig = config || defaultConfig;

            if (typeof CurrentConfig.events === 'undefined') {
                CAVNV.error('CAVUA: Invalid Configuration, Exiting.');
                return;
            }
            //Initialize Browser.
            //TODO: It's better to pass the configuration from cav_nv.
            if (typeof CAVNV.jQuery !== 'undefined')
                defaultConfig.browserConfig.jQueryObject = CAVNV.jQuery;
            CAVUA.Browser.init(defaultConfig.browserConfig);
            CAVUA.Replay.init();

            //Register Events;
            CAVUA.RegisterEvents("replay", CurrentConfig.events, window.document);

            //send the custom load event. as this library will be loaded on onload.
            var LoadEventData = {
                type: "load",
                target: window.window,
                srcElement: window.window,
                currentTarget: window.window,
                bubbles: true,
                cancelBubble: false,
                cancelable: true,
                timeStamp: +new Date,
                customLoad: true
            };
            var LoadEvent = new CAVUA.BrowserBase.WebEvent(LoadEventData);

            CAVUA.Replay.onevent(LoadEvent);

            //set mouseover event in case of protocol version 1.
            if (CAVNV.protocolVersion == 1) {
                (function () {
                    var lastpx = -1;
                    var lastpy = -1;
                    var $ = CAVNV.jQuery;
                    //FIXME: Currently if window height, width chagne then there will be some issue in replaying mouse movement. 
                    var j = window.innerHeight, k = window.innerWidth;
                    var dateInMillisecond;
                    $(document).mousemove(function (pt) {
                        // divide the whole screen into 64*64 blocks.
                        if (mouseMoveData.length == 0) {
                            dateInMillisecond = new Date().getTime();
                            mouseMoveData = dateInMillisecond + ';';
                            mouseMoveData += Math.floor(pt.clientX * 64 / k).toString() + ',' + Math.floor(pt.clientY * 64 / j).toString() + ',';
                            lstmx = pt.clientX;
                            lstmy = pt.clientY;
                        }
                        var xtrace = "", ytrace = "", dx = parseInt((pt.clientX - lstmx) * 64 / k), dy = parseInt((pt.clientY - lstmy) * 64 / j), mx = dx, my = dy;
                        // [Note: to show diff between two points we are using alphabets, small case for x-axis and upper case for y-axis.]
                        // evaluate diff between two points if |diff| > 12 break diff into unit of 12.
                        function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }
                        function xc() { var j = dx; if (mx > 0 && j > 0) { dx = dx - 12; return Math.min(j, (sign(j) * 12)) } else if (mx < 0 && j < 0) { dx = dx + 12; return Math.max(j, (sign(j) * 12)) } else return -20; };
                        function yc() { var j = dy; if (my > 0 && j > 0) { dy = dy - 12; return Math.min(j, (sign(j) * 12)) } else if (my < 0 && j < 0) { dy = dy + 12; return Math.max(j, (sign(j) * 12)) } else return -20; };
                        // loop until diff between two point turn out to be 0
                        while ((mx > 0 ? dx > 0 : dx < 0) || (my > 0 ? dy > 0 : dy < 0)) {
                            var t = xc();
                            if (t > -13 ? (t != 0 ? true : false) : false)
                                xtrace += String.fromCharCode(t + 77);
                            t = yc();
                            if (t > -13 ? (t != 0 ? true : false) : false)
                                ytrace += String.fromCharCode(t + 109);
                        }
                        if (xtrace.length != 0)
                            lstmx = pt.clientX;
                        if (ytrace.length != 0)
                            lstmy = pt.clientY;
                        var newTime = new Date().getTime();
                        var timeDiff = newTime - dateInMillisecond;
                        dateInMillisecond = newTime;
                        if (timeDiff > 10000)        // timeDiff should be greater than 10s
                            mouseMoveData += ';' + timeDiff + ';' + pt.clientX + ',' + pt.clientY + ','
                        mouseMoveData += xtrace + ytrace;
                        CAVNV.plugins.DOMWATCHER2.updateMutationState(NVDOMObserver.USERACTION_MUTATION);
                    });

                    $(document).mouseover(function (pt) {
                        //store the last mouseover element, to log hover data. If no dom change occurred within next 300 msec then reset the lastMouseMove.  
                        lastMouseMove = pt.target;
                        setTimeout(function () {
                            lastMouseMove = null;
                        }, 300);

                        //Update the mutation state on mouse movement. it is to handle unexpected dom changes.  
                        CAVNV.plugins.DOMWATCHER2.updateMutationState(NVDOMObserver.USERACTION_MUTATION);
                    });

                })();
            }
            CAVNV.log('CAVUA: CAVUA Initialized.');
        };
        CAVUA.logMM = function () {
            //Check if last
            //We will consider only those mouse move which occurred within last 300 msec. lastMouseMove will be reset if it is not logged within the timeout which is 300 msec. 
            if (lastMouseMove && !!CAVNV.config.USERACTION.MHCapture && CAVNV.config.USERACTION.MHCapture.enabled) {
                lastMouseMoveLogged = lastMouseMove;
                var hoverData = CAVNV.utils.getCssSelector(lastMouseMoveLogged);
                mouseHoverData.push(hoverData);
                //mouseHoverData will hold only n elements. So discrad oldest element if limit crossed 
                if (!!CAVNV.config.USERACTION.MHCapture && CAVNV.config.USERACTION.MHCapture.size && (mouseHoverData.length > CAVNV.config.USERACTION.MHCapture.size))
                    mouseHoverData.splice(0, 1);
                lastMouseMove = null;
            }
        }

        //Define flushAll.
        CAVUA.flushAll = CAVUA.Queue.flush;

        CAVUA.logEvent = CAVUA.Queue.logEvent;

        CAVUA.updateConfig = function (config) {
            var NewConfig = config || CurrentConfig;

            if (typeof NewConfig.events === 'undefined') {
                CAVNV.error('CAVUA: Invalid Configuration, Failed to Update Configuration.');
                return;
            }

            //Register Events again with this configuration.
            CAVUA.RegisterEvents("replay", NewConfig.events, window.document);

            //TODO: how to handle if some errors comes.
            CurrentConfig = NewConfig;
        };
        //This method will call registerEvent on specified element.
        CAVUA.updateDOM = function (e, config) {

            var config = config || CurrentConfig;
            //Note: if config still not present that means it is invoked before init.
            if (!config) return;

            if (typeof config.events === 'undefined') {
                CAVNV.error('CAVUA: Invalid Configuration, Failed to Update Configuration.');
                return;
            }

            //Register Events again with this configuration.
            CAVUA.RegisterEvents("replay", config.events, e);
        };

        //set to parent window.
        w.CAVUA = CAVUA;
    })(w, w.document);

    /****************Mutation Observer************/
    //Mutation Observer.
    //Reference: https://github.com/megawac/MutationObserver.js
    //Implementation to support ie8+ 
    MutationObserver = w.MutationObserver || w.WebKitMutationObserver || w.MozMutationObserver || (function () {
        "use strict";
        function MutationObserver(listener) {
            this._watched = [];
            this._listener = listener;
        }

        /**
         * Start a recursive timeout function to check all items being observed for mutations
         */
        function startMutationChecker(observer) {
            (function check() {
                var mutations = observer.takeRecords();

                if (mutations.length) { //fire away
                    //calling the listener with context is not spec but currently consistent with FF and WebKit
                    observer._listener(mutations, observer);
                }
                /** @private */
                observer._timeout = setTimeout(check, MutationObserver._period);
            })();
        }

        /**
         * Period to check for mutations (~32 times/sec)
         */
        MutationObserver._period = 30
            /*ms+runtime*/
            ;

        MutationObserver.prototype = {
            /**
               * see http://dom.spec.whatwg.org/#dom-mutationobserver-observe
               * not going to throw here but going to follow the current spec config sets
               */
            observe: function ($target, config) {
                /**
                     * Using slightly different names so closure can go ham
                     * @type {!Object} : A custom mutation config
                     */
                var settings = {
                    attr: !!(config.attributes || config.attributeFilter || config.attributeOldValue),

                    //some browsers are strict in their implementation that config.subtree and childList must be set together. We don't care - spec doesn't specify
                    kids: !!config.childList,
                    descendents: !!config.subtree,
                    charData: !!(config.characterData || config.characterDataOldValue)
                };

                var watched = this._watched;

                //remove already observed target element from pool
                for (var i = 0; i < watched.length; i++) {
                    if (watched[i].tar === $target) watched.splice(i, 1);
                }

                if (config.attributeFilter) {
                    /**
                           * converts to a {key: true} dict for faster lookup
                           * @type {Object.<String,Boolean>}
                           */
                    settings.afilter = reduce(config.attributeFilter, function (a, b) {
                        a[b] = true;
                        return a;
                    },
                        {});
                }

                watched.push({
                    tar: $target,
                    fn: createMutationSearcher($target, settings)
                });

                //reconnect if not connected
                if (!this._timeout) {
                    startMutationChecker(this);
                }
            },

            /**
               * Finds mutations since last check and empties the "record queue" i.e. mutations will only be found once
               */
            takeRecords: function () {
                var mutations = [];
                var watched = this._watched;

                for (var i = 0; i < watched.length; i++) {
                    watched[i].fn(mutations);
                }

                return mutations;
            },

            disconnect: function () {
                this._watched = []; //clear the stuff being observed
                clearTimeout(this._timeout); //ready for garbage collection
                /** @private */
                this._timeout = null;
            }
        };

        /**
         * Simple MutationRecord pseudoclass. No longer exposing as its not fully compliant
         */
        function MutationRecord(data) {
            var settings = { //technically these should be on proto so hasOwnProperty will return false for non explicitly props
                type: null,
                target: null,
                addedNodes: [],
                removedNodes: [],
                previousSibling: null,
                nextSibling: null,
                attributeName: null,
                attributeNamespace: null,
                oldValue: null
            };
            for (var prop in data) {
                if (has(settings, prop) && data[prop] !== undefined) settings[prop] = data[prop];
            }
            return settings;
        }

        /**
         * Creates a func to find all the mutations
         */
        function createMutationSearcher($target, config) {
            /** type {Elestuct} */
            var $oldstate = clone($target, config); //create the cloned datastructure
            /**
               * consumes array of mutations we can push to
               *
               * @param {Array.<MutationRecord>} mutations
               */
            return function (mutations) {
                var olen = mutations.length;

                //Alright we check base level changes in attributes... easy
                if (config.attr && $oldstate.attr) {
                    findAttributeMutations(mutations, $target, $oldstate.attr, config.afilter);
                }

                //check childlist or subtree for mutations
                if (config.kids || config.descendents) {
                    searchSubtree(mutations, $target, $oldstate, config);
                }

                //reclone data structure if theres changes
                if (mutations.length !== olen) {
                    /** type {Elestuct} */
                    $oldstate = clone($target, config);
                }
            };
        }

        /**
         * fast helper to check to see if attributes object of an element has changed
         * doesnt handle the textnode case
         */
        function findAttributeMutations(mutations, $target, $oldstate, filter) {
            if (!$target.attributes) return;
            var checked = {};
            var attributes = $target.attributes;
            var attr;
            var name;
            var i = attributes.length;
            while (i--) {
                attr = attributes[i];
                name = attr.name;
                if (!filter || has(filter, name)) {
                    if (attr.value !== $oldstate[name]) {
                        //The pushing is redundant but gzips very nicely
                        mutations.push(MutationRecord({
                            type: "attributes",
                            target: $target,
                            attributeName: name,
                            oldValue: $oldstate[name],
                            attributeNamespace: attr.namespaceURI //in ie<8 it incorrectly will return undefined
                        }));
                    }
                    checked[name] = true;
                }
            }
            for (name in $oldstate) {
                if (!(checked[name])) {
                    mutations.push(MutationRecord({
                        target: $target,
                        type: "attributes",
                        attributeName: name,
                        oldValue: $oldstate[name]
                    }));
                }
            }
        }

        /**
         * searchSubtree: array of mutations so far, element, element clone, bool
         * synchronous dfs comparision of two nodes
         * This function is applied to any observed element with childList or subtree specified
         * Sorry this is kind of confusing as shit, tried to comment it a bit...
         * codereview.stackexchange.com/questions/38351 discussion of an earlier version of this func
         */
        function searchSubtree(mutations, $target, $oldstate, config) {
            /*
               * Helper to identify node rearrangment and stuff...
               * There is no gaurentee that the same node will be identified for both added and removed nodes
               * if the positions have been shuffled.
               * conflicts array will be emptied by end of operation
               */
            function resolveConflicts(conflicts, node, $kids, $oldkids, numAddedNodes) {
                // the distance between the first conflicting node and the last
                var distance = conflicts.length - 1;
                // prevents same conflict being resolved twice consider when two nodes switch places.
                // only one should be given a mutation event (note -~ is used as a math.ceil shorthand)
                var counter = -~((distance - numAddedNodes) / 2);
                var $cur;
                var oldstruct;
                var conflict;
                while ((conflict = conflicts.pop())) {
                    $cur = $kids[conflict.i];
                    oldstruct = $oldkids[conflict.j];

                    //attempt to determine if there was node rearrangement... won't gaurentee all matches
                    //also handles case where added/removed nodes cause nodes to be identified as conflicts
                    if (config.kids && counter && Math.abs(conflict.i - conflict.j) >= distance) {
                        mutations.push(MutationRecord({
                            type: "childList",
                            target: node,
                            addedNodes: [$cur],
                            removedNodes: [$cur],
                            // haha don't rely on this please
                            nextSibling: $cur.nextSibling,
                            previousSibling: $cur.previousSibling
                        }));
                        counter--; //found conflict
                    }

                    //Alright we found the resorted nodes now check for other types of mutations
                    if (config.attr && oldstruct.attr) findAttributeMutations(mutations, $cur, oldstruct.attr, config.afilter);
                    if (config.charData && $cur.nodeType === 3 && $cur.nodeValue !== oldstruct.charData) {
                        mutations.push(MutationRecord({
                            type: "characterData",
                            target: $cur,
                            oldValue: oldstruct.charData
                        }));
                    }
                    //now look @ subtree
                    if (config.descendents) findMutations($cur, oldstruct);
                }
            }

            /**
               * Main worker. Finds and adds mutations if there are any
               * @param {Node} node
               * @param {!Object} old : A cloned data structure using internal clone
               */
            function findMutations(node, old) {
                var $kids = node.childNodes;
                var $oldkids = old.kids;
                var klen = $kids.length;
                // $oldkids will be undefined for text and comment nodes
                var olen = $oldkids ? $oldkids.length : 0;
                // if (!olen && !klen) return; //both empty; clearly no changes
                //we delay the intialization of these for marginal performance in the expected case (actually quite signficant on large subtrees when these would be otherwise unused)
                //map of checked element of ids to prevent registering the same conflict twice
                var map;
                //array of potential conflicts (ie nodes that may have been re arranged)
                var conflicts;
                var id; //element id from getElementId helper
                var idx; //index of a moved or inserted element
                var oldstruct;
                //current and old nodes
                var $cur;
                var $old;
                //track the number of added nodes so we can resolve conflicts more accurately
                var numAddedNodes = 0;

                //iterate over both old and current child nodes at the same time
                var i = 0,
                    j = 0;
                //while there is still anything left in $kids or $oldkids (same as i < $kids.length || j < $oldkids.length;)
                while (i < klen || j < olen) {
                    //current and old nodes at the indexs
                    $cur = $kids[i];
                    oldstruct = $oldkids[j];
                    $old = oldstruct && oldstruct.node;

                    if ($cur === $old) { //expected case - optimized for this case
                        //check attributes as specified by config
                        if (config.attr && oldstruct.attr)
                            /* oldstruct.attr instead of textnode check */
                            findAttributeMutations(mutations, $cur, oldstruct.attr, config.afilter);
                        //check character data if set
                        if (config.charData && $cur.nodeType === 3 && $cur.nodeValue !== oldstruct.charData) {
                            mutations.push(MutationRecord({
                                type: "characterData",
                                target: $cur,
                                oldValue: oldstruct.charData
                            }));
                        }

                        //resolve conflicts; it will be undefined if there are no conflicts - otherwise an array
                        if (conflicts) resolveConflicts(conflicts, node, $kids, $oldkids, numAddedNodes);

                        //recurse on next level of children. Avoids the recursive call when there are no children left to iterate
                        if (config.descendents && ($cur.childNodes.length || oldstruct.kids && oldstruct.kids.length)) findMutations($cur, oldstruct);

                        i++;
                        j++;
                    } else { //(uncommon case) lookahead until they are the same again or the end of children
                        if (!map) { //delayed initalization (big perf benefit)
                            map = {};
                            conflicts = [];
                        }
                        if ($cur) {
                            //check id is in the location map otherwise do a indexOf search
                            if (!(map[id = getElementId($cur)])) { //to prevent double checking
                                //mark id as found
                                map[id] = true;
                                //custom indexOf using comparitor checking oldkids[i].node === $cur
                                if ((idx = indexOfCustomNode($oldkids, $cur, j)) === -1) {
                                    if (config.kids) {
                                        mutations.push(MutationRecord({
                                            type: "childList",
                                            target: node,
                                            addedNodes: [$cur],
                                            //$cur is a new node
                                            nextSibling: $cur.nextSibling,
                                            previousSibling: $cur.previousSibling
                                        }));
                                        numAddedNodes++;
                                    }
                                } else {
                                    conflicts.push({ //add conflict
                                        i: i,
                                        j: idx
                                    });
                                }
                            }
                            i++;
                        }

                        if ($old &&
                            //special case: the changes may have been resolved: i and j appear congurent so we can continue using the expected case
                            $old !== $kids[i]) {
                            if (!(map[id = getElementId($old)])) {
                                map[id] = true;
                                if ((idx = indexOf($kids, $old, i)) === -1) {
                                    if (config.kids) {
                                        mutations.push(MutationRecord({
                                            type: "childList",
                                            target: old.node,
                                            removedNodes: [$old],
                                            nextSibling: $oldkids[j + 1],
                                            //praise no indexoutofbounds exception
                                            previousSibling: $oldkids[j - 1]
                                        }));
                                        numAddedNodes--;
                                    }
                                } else {
                                    conflicts.push({
                                        i: idx,
                                        j: j
                                    });
                                }
                            }
                            j++;
                        }
                    } //end uncommon case
                } //end loop
                //resolve any remaining conflicts
                if (conflicts) resolveConflicts(conflicts, node, $kids, $oldkids, numAddedNodes);
            }
            findMutations($target, $oldstate);
        }

        /**
         * Utility
         * Cones a element into a custom data structure designed for comparision. https://gist.github.com/megawac/8201012
         */
        function clone($target, config) {
            var recurse = true; // set true so childList we'll always check the first level
            return (function copy($target) {
                var isText = $target.nodeType === 3;
                var elestruct = {
                    /** @type {Node} */
                    node: $target
                };

                //is text or comemnt node
                if (isText || $target.nodeType === 8) {
                    if (isText && config.charData) {
                        elestruct.charData = $target.nodeValue;
                    }
                } else { //its either a element or document node (or something stupid)
                    if (config.attr && recurse && $target.attributes) { // add attr only if subtree is specified or top level
                        /**
                                 * clone live attribute list to an object structure {name: val}
                                 * @type {Object.<string, string>}
                                 */
                        elestruct.attr = reduce($target.attributes, function (memo, attr) {
                            if (!config.afilter || config.afilter[attr.name]) {
                                memo[attr.name] = attr.value;
                            }
                            return memo;
                        },
                            {});
                    }

                    // whether we should iterate the children of $target node
                    if (recurse && ((config.kids || config.charData) || (config.attr && config.descendents))) {
                        /** @type {Array.<!Object>} : Array of custom clone */
                        elestruct.kids = map($target.childNodes, copy);
                    }

                    recurse = config.descendents;
                }
                return elestruct;
            })($target);
        }

        function indexOfCustomNode(set, $node, idx) {
            return indexOf(set, $node, idx, JSCompiler_renameProperty("node"));
        }

        //using a non id (eg outerHTML or nodeValue) is extremely naive and will run into issues with nodes that may appear the same like <li></li>
        var counter = 1; //don't use 0 as id (falsy)
        var expando = "mo_id";

        /**
         * Attempt to uniquely id an element for hashing. We could optimize this for legacy browsers but it hopefully wont be called enough to be a concern
         */
        function getElementId($ele) {
            try {
                return $ele.id || ($ele[expando] = $ele[expando] || counter++);
            } catch (o_O) { //ie <8 will throw if you set an unknown property on a text node
                try {
                    return $ele.nodeValue; //naive
                } catch (shitie) { //when text node is removed: https://gist.github.com/megawac/8355978 
                    return counter++;
                }
            }
        }

        function map(set, iterator) {
            var results = [];
            var index;
            for (index = 0; index < set.length; index++) {
                results[index] = iterator(set[index], index, set);
            }
            return results;
        }

        function reduce(set, iterator, memo) {
            var index;
            for (index = 0; index < set.length; index++) {
                memo = iterator(memo, set[index], index, set);
            }
            return memo;
        }

        function indexOf(set, item, idx, prop) {
            for (
                /*idx = ~~idx*/
                ; idx < set.length; idx++) { //start idx is always given as this is internal
                if ((prop ? set[idx][prop] : set[idx]) === item) return idx;
            }
            return -1;
        }

        function has(obj, prop) {
            return obj[prop] !== undefined;
        }

        function JSCompiler_renameProperty(a) {
            return a;
        }

        return MutationObserver;
    })();

    /*************Plugin to capture failed resource details************/
    var ResourceFailedDetector = (function (window, document) {
        var fentry = [];
        function addEntry(entry) {
            fentry.push(entry);
        }

        function getEntry() {
            return fentry;
        }

        //wrap an element.
        function wrap(e, st) {
            var url = e.src || e.href;
            st = st || new Date().getTime();
            e.__nv = { starttime: st, url: url };
            e.addEventListener('error', function (e) {
                if (!e.target.__nv) return;
                //Note: timeStamp will vary brower to brower.
                /*
                 * Chrome - Relative to navigationStart
                 * Firefox - in usec. 
                 * In IE - Absolute time.
                */
                e.target.__nv.endtime = CAVNV.utils.eventTimestamp(e.timeStamp);
                //add this entry.
                addEntry(e.target.__nv);
                e.target.__nv = undefined;
            }, true);
        }

        //This method will check for new added elements. If it is ELEMENT Then check if it is img, link, or script and etc..

        function mc(records) {
            for (var z = 0; z < records.length; z++) {
                var time = new Date().getTime();
                //note: configuration will be only for childList. So such handle for new added element.
                for (var y = 0; y < records[z].addedNodes.length; y++) {
                    var n = records[z].addedNodes[y];
                    //check if element type.
                    if (n.nodeType && n.nodeType == document.ELEMENT_NODE) {
                        //check if.
                        if (/(IMG|LINK|SCRIPT)/.test(n.tagName.toUpperCase())) {
                            wrap(n, time);
                        }
                        else {
                            //check for all other nodes.
                            var img = n.querySelectorAll('img');
                            for (var a = 0; a < img.length; a++)
                                wrap(img[a], time);

                            var css = n.querySelectorAll('link');
                            for (var a = 0; a < css.length; a++)
                                wrap(css[a], time);

                            var script = n.querySelectorAll('script');
                            for (var a = 0; a < script.length; a++)
                                wrap(script[a], time);
                        }
                    }
                }
            }
        }
        var m_c = {
            'childList': true,
            'subtree': true
        };
        var mo = null;

        function init() {
            //check if already initialized.
            if (mo !== null) return;

            //do it only if we have addEventListener.
            if (!window.addEventListener) return;

            mo = new MutationObserver(mc);
            mo.observe(document, m_c);

            //get domcontent laoded time we set else take current time as domcontentload time.
            //TODO: check if window.performance timing set or not.
            var time = new Date().getTime();
            var p = w.performance || w.msPerformance || w.webkitPerformance || w.mozPerformance;
            if (p && p.timing && p.timing.domContentLoadedEventEnd)
                time = p.timing.domContentLoadedEventEnd;

            //list already existing resource to check if failed or not.
            var img = document.querySelectorAll('img');
            for (var z = 0; z < img.length; z++)
                wrap(img[z], time);

            var css = document.querySelectorAll('link');
            for (var z = 0; z < css.length; z++)
                wrap(css[z], time);

            var script = document.querySelectorAll('script');
            for (var z = 0; z < script.length; z++)
                wrap(script[z], time);
        }
        function stop() {
            if (mo) {
                mo.disconnect();
                mo = null;
                fentry = [];
            }
        }
        function clear() {
            fentry = [];
        }

        return {
            init: init,
            stop: stop,
            getEntry: getEntry,
            clear: clear
        }
    })(w, w.document);

    /*****************sessionStorage**************/
    //This implementation Can support all A-Grade browsers
    //Reference: http://code.google.com/p/sessionstorage/ 
    //It will set to window.
    if (typeof w.sessionStorage === "undefined") {
        (function (j) {
            var k = j;
            try {
                while (k !== k.top) {
                    k = k.top
                }
            } catch (i) { }
            var f = (function (e, n) {
                return {
                    decode: function (o, p) {
                        return this.encode(o, p)
                    },
                    encode: function (y, u) {
                        for (var p = y.length, w = u.length, o = [], x = [], v = 0, s = 0, r = 0, q = 0, t; v < 256; ++v) {
                            x[v] = v
                        }
                        for (v = 0; v < 256; ++v) {
                            s = (s + (t = x[v]) + y.charCodeAt(v % p)) % 256;
                            x[v] = x[s];
                            x[s] = t
                        }
                        for (s = 0; r < w; ++r) {
                            v = r % 256;
                            s = (s + (t = x[v])) % 256;
                            p = x[v] = x[s];
                            x[s] = t;
                            o[q++] = e(u.charCodeAt(r) ^ x[(p + t) % 256])
                        }
                        return o.join("")
                    },
                    key: function (q) {
                        for (var p = 0, o = []; p < q; ++p) {
                            o[p] = e(1 + ((n() * 255) << 0))
                        }
                        return o.join("")
                    }
                }
            })(j.String.fromCharCode, j.Math.random);
            var a = (function (n) {
                function o(r, q, p) {
                    this._i = (this._data = p || "").length;
                    if (this._key = q) {
                        this._storage = r
                    } else {
                        this._storage = {
                            _key: r || ""
                        };
                        this._key = "_key"
                    }
                }
                o.prototype.c = String.fromCharCode(1);
                o.prototype._c = ".";
                o.prototype.clear = function () {
                    this._storage[this._key] = this._data
                };
                o.prototype.del = function (p) {
                    var q = this.get(p);
                    if (q !== null) {
                        this._storage[this._key] = this._storage[this._key].replace(e.call(this, p, q), "")
                    }
                };
                o.prototype.escape = n.escape;
                o.prototype.get = function (q) {
                    var s = this._storage[this._key],
                        t = this.c,
                        p = s.indexOf(q = t.concat(this._c, this.escape(q), t, t), this._i),
                        r = null;
                    if (-1 < p) {
                        p = s.indexOf(t, p + q.length - 1) + 1;
                        r = s.substring(p, p = s.indexOf(t, p));
                        r = this.unescape(s.substr(++p, r))
                    }
                    return r
                };
                o.prototype.key = function () {
                    var u = this._storage[this._key],
                        v = this.c,
                        q = v + this._c,
                        r = this._i,
                        t = [],
                        s = 0,
                        p = 0;
                    while (-1 < (r = u.indexOf(q, r))) {
                        t[p++] = this.unescape(u.substring(r += 2, s = u.indexOf(v, r)));
                        r = u.indexOf(v, s) + 2;
                        s = u.indexOf(v, r);
                        r = 1 + s + 1 * u.substring(r, s)
                    }
                    return t
                };
                o.prototype.set = function (p, q) {
                    this.del(p);
                    this._storage[this._key] += e.call(this, p, q)
                };
                o.prototype.unescape = n.unescape;
                function e(p, q) {
                    var r = this.c;
                    return r.concat(this._c, this.escape(p), r, r, (q = this.escape(q)).length, r, q)
                }
                return o
            })(j);
            if (Object.prototype.toString.call(j.opera) === "[object Opera]") {
                history.navigationMode = "compatible";
                a.prototype.escape = j.encodeURIComponent;
                a.prototype.unescape = j.decodeURIComponent
            }
            function l() {
                function r() {
                    s.cookie = ["sessionStorage=" + j.encodeURIComponent(h = f.key(128))].join(";");
                    g = f.encode(h, g);
                    a = new a(k, "name", k.name)
                }
                var e = k.name,
                    s = k.document,
                    n = /\bsessionStorage\b=([^;]+)(;|$)/,
                    p = n.exec(s.cookie),
                    q, c;
                if (p) {
                    h = j.decodeURIComponent(p[1]);
                    g = f.encode(h, g);
                    a = new a(k, "name");
                    for (var t = a.key(), q = 0, o = t.length, u = {}; q < o; ++q) {
                        if ((p = t[q]).indexOf(g) === 0) {
                            b.push(p);
                            u[p] = a.get(p);
                            a.del(p)
                        }
                    }
                    a = new a.constructor(k, "name", k.name);
                    if (0 < (this.length = b.length)) {
                        for (q = 0, o = b.length, c = a.c, p = []; q < o; ++q) {
                            p[q] = c.concat(a._c, a.escape(t = b[q]), c, c, (t = a.escape(u[t])).length, c, t)
                        }
                        k.name += p.join("")
                    }
                } else {
                    r();
                    if (!n.exec(s.cookie)) {
                        b = null
                    }
                }
            }
            l.prototype = {
                length: 0,
                key: function (e) {
                    if (typeof e !== "number" || e < 0 || b.length <= e) {
                        throw "Invalid argument"
                    }
                    return b[e]
                },
                getItem: function (e) {
                    e = g + e;
                    if (d.call(m, e)) {
                        return m[e]
                    }
                    var n = a.get(e);
                    if (n !== null) {
                        n = m[e] = f.decode(h, n)
                    }
                    return n
                },
                setItem: function (e, n) {
                    this.removeItem(e);
                    e = g + e;
                    a.set(e, f.encode(h, m[e] = "" + n));
                    this.length = b.push(e)
                },
                removeItem: function (e) {
                    var n = a.get(e = g + e);
                    if (n !== null) {
                        delete m[e];
                        a.del(e);
                        this.length = b.remove(e)
                    }
                },
                clear: function () {
                    a.clear();
                    m = {};
                    b.length = 0
                }
            };
            var g = k.document.domain,
                b = [],
                m = {},
                d = m.hasOwnProperty,
                h;
            b.remove = function (n) {
                var e = this.indexOf(n);
                if (-1 < e) {
                    this.splice(e, 1)
                }
                return this.length
            };
            if (!b.indexOf) {
                b.indexOf = function (o) {
                    for (var e = 0, n = this.length; e < n; ++e) {
                        if (this[e] === o) {
                            return e
                        }
                    }
                    return -1
                }
            }
            if (k.sessionStorage) {
                l = function () { };
                l.prototype = k.sessionStorage
            }
            l = new l;
            if (b !== null) {
                j.sessionStorage = l
            }
        })(w)
    };

    /***********Library for base64 encoding**********/
    function StringBuffer() {
        this.buffer = [];
    }

    StringBuffer.prototype.append = function append(string) {
        this.buffer.push(string);
        return this;
    };

    StringBuffer.prototype.toString = function toString() {
        return this.buffer.join("");
    };

    var Base64 =
    {
        codex: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        encode: function (input) {
            var output = new StringBuffer();

            var enumerator = new Utf8EncodeEnumerator(input);
            while (enumerator.moveNext()) {
                var chr1 = enumerator.current;

                enumerator.moveNext();
                var chr2 = enumerator.current;

                enumerator.moveNext();
                var chr3 = enumerator.current;

                var enc1 = chr1 >> 2;
                var enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                var enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                var enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                }
                else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output.append(this.codex.charAt(enc1) + this.codex.charAt(enc2) + this.codex.charAt(enc3) + this.codex.charAt(enc4));
            }

            return output.toString();
        }
    }


    function Utf8EncodeEnumerator(input) {
        this._input = input;
        this._index = -1;
        this._buffer = [];
    }

    Utf8EncodeEnumerator.prototype =
    {
        current: Number.NaN,

        moveNext: function () {
            if (this._buffer.length > 0) {
                this.current = this._buffer.shift();
                return true;
            }
            else if (this._index >= (this._input.length - 1)) {
                this.current = Number.NaN;
                return false;
            }
            else {
                var charCode = this._input.charCodeAt(++this._index);

                // "\r\n" -> "\n"
                //
                if ((charCode == 13) && (this._input.charCodeAt(this._index + 1) == 10)) {
                    charCode = 10;
                    this._index += 2;
                }

                if (charCode < 128) {
                    this.current = charCode;
                }
                else if ((charCode > 127) && (charCode < 2048)) {
                    this.current = (charCode >> 6) | 192;
                    this._buffer.push((charCode & 63) | 128);
                }
                else {
                    this.current = (charCode >> 12) | 224;
                    this._buffer.push(((charCode >> 6) & 63) | 128);
                    this._buffer.push((charCode & 63) | 128);
                }

                return true;
            }
        }
    }
    /************Base64 library End*************/

    /**********************Library for Parsing os User agent ***************/
    /**********Note: this is minified version of ua-parser(http://faisalman.github.io/ua-parser-js/)*****************/
    window.CAVUAParser = (function () {
        //Note: this is part of ua-parser library.
        //we can extend this for both browser.
        var EMPTY = '',
            UNKNOWN = '?',
            FUNC_TYPE = 'function',
            UNDEF_TYPE = 'undefined',
            OBJ_TYPE = 'object',
            STR_TYPE = 'string',
            MAJOR = 'major', // deprecated
            MODEL = 'model',
            NAME = 'name',
            TYPE = 'type',
            VENDOR = 'vendor',
            VERSION = 'version',
            ARCHITECTURE = 'architecture',
            CONSOLE = 'console',
            MOBILE = 'mobile',
            TABLET = 'tablet',
            SMARTTV = 'smarttv',
            WEARABLE = 'wearable',
            EMBEDDED = 'embedded';

        //Helping methods.
        var util = {
            extend: function (regexes, extensions) {
                for (var i in extensions) {
                    if ("browser cpu device engine os".indexOf(i) !== -1 && extensions[i].length % 2 === 0) {
                        regexes[i] = extensions[i].concat(regexes[i]);
                    }
                }
                return regexes;
            },
            has: function (str1, str2) {
                if (typeof str1 === "string") {
                    return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
                } else {
                    return false;
                }
            },
            lowerize: function (str) {
                return str.toLowerCase();
            },
            major: function (version) {
                return typeof (version) === STR_TYPE ? version.split(".")[0] : undefined;
            }
        };

        var mapper = {

            rgx: function () {

                var result = {}, i = 0, j, k, p, q, matches, match, args = arguments;

                // loop through all regexes maps
                while (i < args.length && !matches) {

                    var regex = args[i],       // even sequence (0,2,4,..)
                        props = args[i + 1];   // odd sequence (1,3,5,..)

                    // construct object barebones
                    if (typeof result === UNDEF_TYPE) {
                        result = {};
                        for (p in props) {
                            q = props[p];
                            if (typeof q === OBJ_TYPE) {
                                result[q[0]] = undefined;
                            } else {
                                result[q] = undefined;
                            }
                        }
                    }

                    // try matching uastring with regexes
                    j = k = 0;
                    while (j < regex.length && !matches) {
                        matches = regex[j++].exec(this.getUA());
                        if (!!matches) {
                            for (p = 0; p < props.length; p++) {
                                match = matches[++k];
                                q = props[p];
                                // check if given property is actually array
                                if (typeof q === OBJ_TYPE && q.length > 0) {
                                    if (q.length == 2) {
                                        if (typeof q[1] == FUNC_TYPE) {
                                            // assign modified match
                                            result[q[0]] = q[1].call(this, match);
                                        } else {
                                            // assign given value, ignore regex match
                                            result[q[0]] = q[1];
                                        }
                                    } else if (q.length == 3) {
                                        // check whether function or regex
                                        if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                            // call function (usually string mapper)
                                            result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
                                        } else {
                                            // sanitize match using given regex
                                            result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
                                        }
                                    } else if (q.length == 4) {
                                        result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
                                    }
                                } else {
                                    result[q] = match ? match : undefined;
                                }
                            }
                        }
                    }
                    i += 2;
                }
                return result;
            },

            str: function (str, map) {

                for (var i in map) {
                    // check if array
                    if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
                        for (var j = 0; j < map[i].length; j++) {
                            if (util.has(map[i][j], str)) {
                                return (i === UNKNOWN) ? undefined : i;
                            }
                        }
                    } else if (util.has(map[i], str)) {
                        return (i === UNKNOWN) ? undefined : i;
                    }
                }
                return str;
            }
        };

        var maps = {
            browser: {
                oldsafari: {
                    version: {
                        '1.0': '/8',
                        '1.2': '/1',
                        '1.3': '/3',
                        '2.0': '/412',
                        '2.0.2': '/416',
                        '2.0.3': '/417',
                        '2.0.4': '/419',
                        '?': '/'
                    }
                }
            },

            os: {
                windows: {
                    version: {
                        'ME': '4.90',
                        'NT 3.11': 'NT3.51',
                        'NT 4.0': 'NT4.0',
                        '2000': 'NT 5.0',
                        'XP': ['NT 5.1', 'NT 5.2'],
                        'Vista': 'NT 6.0',
                        '7': 'NT 6.1',
                        '8': 'NT 6.2',
                        '8.1': 'NT 6.3',
                        '10': ['NT 6.4', 'NT 10.0'],
                        'RT': 'ARM'
                    }
                }
            }
        };

        var regexes = {

            browser: [[

                // Presto based
                /(opera\smini)\/([\w\.-]+)/i,                                       // Opera Mini
                /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,                      // Opera Mobi/Tablet
                /(opera).+version\/([\w\.]+)/i,                                     // Opera > 9.80
                /(opera)[\/\s]+([\w\.]+)/i                                          // Opera < 9.80

            ], [NAME, VERSION], [

                /\s(opr)\/([\w\.]+)/i                                               // Opera Webkit
            ], [[NAME, 'Opera'], VERSION], [

                // Mixed
                /(kindle)\/([\w\.]+)/i,                                             // Kindle
                /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]+)*/i,
                // Lunascape/Maxthon/Netfront/Jasmine/Blazer

                // Trident based
                /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i,
                // Avant/IEMobile/SlimBrowser/Baidu
                /(?:ms|\()(ie)\s([\w\.]+)/i,                                        // Internet Explorer

                // Webkit/KHTML based
                /(rekonq)\/([\w\.]+)*/i,                                            // Rekonq
                /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi)\/([\w\.-]+)/i
                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron
            ], [NAME, VERSION], [

                /(trident).+rv[:\s]([\w\.]+).+like\sgecko/i,                        // IE11
                /(Edge)\/(\d+(.\d)?)/i                                          // IE12
            ], [[NAME, 'IE'], VERSION], [

                /(yabrowser)\/([\w\.]+)/i                                           // Yandex
            ], [[NAME, 'Yandex'], VERSION], [

                /(comodo_dragon)\/([\w\.]+)/i                                       // Comodo Dragon
            ], [[NAME, /_/g, ' '], VERSION], [

                /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i,
                // Chrome/OmniWeb/Arora/Tizen/Nokia
                /(uc\s?browser|qqbrowser)[\/\s]?([\w\.]+)/i
                // UCBrowser/QQBrowser
            ], [NAME, VERSION], [

                /(dolfin)\/([\w\.]+)/i                                              // Dolphin
            ], [[NAME, 'Dolphin'], VERSION], [

                /((?:android.+)crmo|crios)\/([\w\.]+)/i                             // Chrome for Android/iOS
            ], [[NAME, 'Chrome'], VERSION], [

                /XiaoMi\/MiuiBrowser\/([\w\.]+)/i                                   // MIUI Browser
            ], [VERSION, [NAME, 'MIUI Browser']], [

                /android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)/i         // Android Browser
            ], [VERSION, [NAME, 'Android Browser']], [

                /FBAV\/([\w\.]+);/i                                                 // Facebook App for iOS
            ], [VERSION, [NAME, 'Facebook']], [

                /version\/([\w\.]+).+?mobile\/\w+\s(safari)/i                       // Mobile Safari
            ], [VERSION, [NAME, 'Mobile Safari']], [

                /version\/([\w\.]+).+?(mobile\s?safari|safari)/i                    // Safari & Safari Mobile
            ], [VERSION, NAME], [

                /webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i                     // Safari < 3.0
            ], [NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]], [

                /(konqueror)\/([\w\.]+)/i,                                          // Konqueror
                /(webkit|khtml)\/([\w\.]+)/i
            ], [NAME, VERSION], [

                // Gecko based
                /(navigator|netscape)\/([\w\.-]+)/i                                 // Netscape
            ], [[NAME, 'Netscape'], VERSION], [
                /(swiftfox)/i,                                                      // Swiftfox
                /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,
                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
                /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w\.-]+)/i,
                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
                /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,                          // Mozilla

                // Other
                /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf)[\/\s]?([\w\.]+)/i,
                // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf
                /(links)\s\(([\w\.]+)/i,                                            // Links
                /(gobrowser)\/?([\w\.]+)*/i,                                        // GoBrowser
                /(ice\s?browser)\/v?([\w\._]+)/i,                                   // ICE Browser
                /(mosaic)[\/\s]([\w\.]+)/i                                          // Mosaic
            ], [NAME, VERSION]
            ],

            os: [[

                // Windows based
                /microsoft\s(windows)\s(vista|xp)/i                                 // Windows (iTunes)
            ], [NAME, VERSION], [
                /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
                /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
            ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
                /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

                // Mobile/Embedded OS
                /\((bb)(10);/i                                                      // BlackBerry 10
            ], [[NAME, 'BlackBerry'], VERSION], [
                /(blackberry)\w*\/?([\w\.]+)*/i,                                    // Blackberry
                /(tizen)[\/\s]([\w\.]+)/i,                                          // Tizen
                /(android|webos|palm\os|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i,
                // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki
                /linux;.+(sailfish);/i                                              // Sailfish OS
            ], [NAME, VERSION], [
                /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i                 // Symbian
            ], [[NAME, 'Symbian'], VERSION], [
                /\((series40);/i                                                    // Series 40
            ], [NAME], [
                /mozilla.+\(mobile;.+gecko.+firefox/i                               // Firefox OS
            ], [[NAME, 'Firefox OS'], VERSION], [

                // Console
                /(nintendo|playstation)\s([wids3portablevu]+)/i,                    // Nintendo/Playstation

                // GNU/Linux based
                /(mint)[\/\s\(]?(\w+)*/i,                                           // Mint
                /(mageia|vectorlinux)[;\s]/i,                                       // Mageia/VectorLinux
                /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?([\w\.-]+)*/i,
                // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
                // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
                /(hurd|linux)\s?([\w\.]+)*/i,                                       // Hurd/Linux
                /(gnu)\s?([\w\.]+)*/i                                               // GNU
            ], [NAME, VERSION], [

                /(cros)\s[\w]+\s([\w\.]+\w)/i                                       // Chromium OS
            ], [[NAME, 'Chromium OS'], VERSION], [

                // Solaris
                /(sunos)\s?([\w\.]+\d)*/i                                           // Solaris
            ], [[NAME, 'Solaris'], VERSION], [

                // BSD based
                /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i                   // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
            ], [NAME, VERSION], [

                /(ip[honead]+)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i             // iOS
            ], [[NAME, 'iOS'], [VERSION, /_/g, '.']], [

                /(mac\sos\sx)\s?([\w\s\.]+\w)*/i,
                /(macintosh|mac(?=_powerpc)\s)/i                                    // Mac OS
            ], [[NAME, 'Mac OS'], [VERSION, /_/g, '.']], [

                // Other
                /((?:open)?solaris)[\/\s-]?([\w\.]+)*/i,                            // Solaris
                /(haiku)\s(\w+)/i,                                                  // Haiku
                /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,                               // AIX
                /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i,
                // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS
                /(unix)\s?([\w\.]+)*/i                                              // UNIX
            ], [NAME, VERSION]
            ]
        }

        //CONSTRUCTOR.
        var UAParser = function (uastring) {
            var ua = uastring;
            var rgxmap = regexes;
            this.getBrowser = function () {
                var browser = mapper.rgx.apply(this, rgxmap.browser);
                browser.major = util.major(browser.version);
                return browser;
            };
            this.getOS = function () {
                return mapper.rgx.apply(this, rgxmap.os);
            };
            this.getUA = function () {
                return ua;
            };
            this.setUA = function (uastring) {
                ua = uastring;
                return this;
            };
            this.setUA(ua);
            return this;
        }

        UAParser.BROWSER = {
            NAME: NAME,
            MAJOR: MAJOR, // deprecated
            VERSION: VERSION
        };
        UAParser.OS = {
            NAME: NAME,
            VERSION: VERSION
        };

        return UAParser;
    })();

/************* Library- CSS Selector Generator ************/
/*
CSS Selector Generator, v1.0.4
by Riki Fridrich <riki@fczbkk.com> (http://fczbkk.com)
https://github.com/fczbkk/css-selector-generator/
*/(function () { var a, b, c = [].indexOf || function (a) { for (var b = 0, c = this.length; b < c; b++)if (b in this && this[b] === a) return b; return -1 }; a = function () { function a(a) { null == a && (a = {}); this.options = {}; this.setOptions(this.default_options); this.setOptions(a); } return a.prototype.default_options = { selectors: ["id", "class", "tag", "nthchild"], prefix_tag: !1, attribute_blacklist: [], attribute_whitelist: [], quote_attribute_when_needed: !1, id_blacklist: [], class_blacklist: [] }, a.prototype.setOptions = function (a) { var b, c, d; null == a && (a = {}); c = []; for (b in a) { d = a[b]; this.default_options.hasOwnProperty(b) ? c.push(this.options[b] = d) : c.push(void 0) }; return c }, a.prototype.isElement = function (a) { return !(1 !== (null != a ? a.nodeType : void 0)) }, a.prototype.getParents = function (a) { var b, c; if (c = [], this.isElement(a)) for (b = a; this.isElement(b);)c.push(b), b = b.parentNode; return c }, a.prototype.getTagSelector = function (a) { return this.sanitizeItem(a.tagName.toLowerCase()) }, a.prototype.sanitizeItem = function (a) { var b; return b = a.split("").map(function (a) { return /[ !":#$%&'()*+,.\/;<=>?@\[\\\]^`{|}~]/.test(a) ? "\\\\" + a : escape(a).replace(/\%/g, "\\\\") }), b.join("") }, a.prototype.sanitizeAttribute = function (a) { var b; return this.options.quote_attribute_when_needed ? this.quoteAttribute(a) : (b = a.split("").map(function (a) { return /[ !":#$%&'()*+,.\/;<=>?@\[\\\]^`{|}~]/.test(a) ? "\\\\" + a : escape(a).replace(/\%/g, "\\\\") }), b.join("")) }, a.prototype.quoteAttribute = function (a) { var b, c; return c = !1, b = a.split("").map(function (a) { return ":" === a ? (c = !0, a) : "'" === a ? (c = !0, "\\" + a) : (c = c || escape(a === !a), a) }), c ? "'" + b.join("") + "'" : b.join("") }, a.prototype.getIdSelector = function (a) { var b, c, d, e; return d = this.options.prefix_tag ? this.getTagSelector(a) : "", b = a.getAttribute("id"), c = this.options.id_blacklist.concat(["", /\s/, /^\d/]), b && null != b && "" !== b && this.notInList(b, c) && (e = d + ("#" + this.sanitizeItem(b)), 1 === a.ownerDocument.querySelectorAll(e).length) ? e : null }, a.prototype.notInList = function (a, b) { return !b.find(function (b) { return "string" == typeof b ? b === a : b.exec(a) }) }, a.prototype.getClassSelectors = function (a) { var b, c, d, e, f, g; if (g = [], b = a.getAttribute("class"), null != b && (b = b.replace(/\s+/g, " "), b = b.replace(/^\s|\s$/g, ""), "" !== b)) for (f = b.split(/\s+/), d = 0, e = f.length; d < e; d++) { c = f[d]; this.notInList(c, this.options.class_blacklist) && g.push("." + this.sanitizeItem(c)); } return g }, a.prototype.getAttributeSelectors = function (a) { var b, d, e, f, g, h, i, j, k, l, m, n; for (m = [], n = this.options.attribute_whitelist, f = 0, h = n.length; f < h; f++) { d = n[f]; a.hasAttribute(d) && m.push("[" + d + "=" + this.sanitizeAttribute(a.getAttribute(d)) + "]") }; for (e = this.options.attribute_blacklist.concat(["id", "class"]), j = a.attributes, g = 0, i = j.length; g < i; g++) { b = j[g]; k = b.nodeName; c.call(e, k) >= 0 || (l = b.nodeName, c.call(n, l) >= 0) || m.push("[" + b.nodeName + "=" + this.sanitizeAttribute(b.nodeValue) + "]"); } return m }, a.prototype.getNthChildSelector = function (a) { var b, c, d, e, f, g, h; if (e = a.parentNode, f = this.options.prefix_tag ? this.getTagSelector(a) : "", null != e) for (b = 0, h = e.childNodes, c = 0, d = h.length; c < d; c++)if (g = h[c], this.isElement(g) && (b++, g === a)) return f + (":nth-child(" + b + ")"); return null }, a.prototype.testSelector = function (a, b) { var c, d; return c = !1, null != b && "" !== b && (d = a.ownerDocument.querySelectorAll(b), 1 === d.length && d[0] === a && (c = !0)), c }, a.prototype.testUniqueness = function (a, b) { var c, d; return d = a.parentNode, c = d.querySelectorAll(b), 1 === c.length && c[0] === a }, a.prototype.testCombinations = function (a, b, c) { var d, e, f, g, h, i, j, k, l, m, n, o, p; if (null == c && (c = this.getTagSelector(a)), !this.options.prefix_tag) { for (m = this.getCombinations(b), e = 0, g = m.length; e < g; e++)if (d = m[e], this.testSelector(a, d)) return d; for (n = this.getCombinations(b), f = 0, h = n.length; f < h; f++)if (d = n[f], this.testUniqueness(a, d)) return d } for (o = this.getCombinations(b).map(function (a) { return c + a }), k = 0, i = o.length; k < i; k++)if (d = o[k], this.testSelector(a, d)) return d; for (p = this.getCombinations(b).map(function (a) { return c + a }), l = 0, j = p.length; l < j; l++)if (d = p[l], this.testUniqueness(a, d)) return d; return null }, a.prototype.getUniqueSelector = function (a) { var b, c, d, e, f, g, h; for (h = this.getTagSelector(a), d = this.options.selectors, b = 0, c = d.length; b < c; b++) { switch (f = d[b]) { case "id": e = this.getIdSelector(a); break; case "tag": h && this.testUniqueness(a, h) && (e = h); break; case "class": g = this.getClassSelectors(a); null != g && 0 !== g.length && (e = this.testCombinations(a, g, h)); break; case "attribute": g = this.getAttributeSelectors(a); null != g && 0 !== g.length && (e = this.testCombinations(a, g, h)); break; case "nthchild": e = this.getNthChildSelector(a) }if (e) return e } return "*" }, a.prototype.getSelector = function (a) { var b, c, d, e, f, g, h; for (h = [], e = this.getParents(a), c = 0, d = e.length; c < d; c++)if (b = e[c], g = this.getUniqueSelector(b), null != g && (h.unshift(g), f = h.join(" > "), this.testSelector(a, f))) return f; return null }, a.prototype.getCombinations = function (a) { var b, c, d, e, f, g, h; for (null == a && (a = []), h = [[]], b = d = 0, f = a.length - 1; 0 <= f ? d <= f : d >= f; b = 0 <= f ? ++d : --d)for (c = e = 0, g = h.length - 1; 0 <= g ? e <= g : e >= g; c = 0 <= g ? ++e : --e)h.push(h[c].concat(a[b])); return h.shift(), h = h.sort(function (a, b) { return a.length - b.length }), h = h.map(function (a) { return a.join("") }) }, a }(); if ("undefined" != typeof define && null !== define ? define.amd : void 0) { define([], function () { return a }) } else { b = "undefined" != typeof exports && null !== exports ? exports : this; b.CssSelectorGenerator = a } }).call(window);

    /********** Library Ends- CSS Selector Generator ***************/



    /************* tti library *********/

    var tti_lib_str = '(function(){var h="undefined"!=typeof window&&window===this?this:"undefined"!=typeof global&&null!=global?global:this,k="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)};function l(){l=function(){};h.Symbol||(h.Symbol=m)}var n=0;function m(a){return"jscomp_symbol_"+(a||"")+n++}function p(){l();var a=h.Symbol.iterator;a||(a=h.Symbol.iterator=h.Symbol("iterator"));"function"!=typeof Array.prototype[a]&&k(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return q(this)}});p=function(){}}function q(a){var b=0;return r(function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}})}function r(a){p();a={next:a};a[h.Symbol.iterator]=function(){return this};return a}function t(a){p();var b=a[Symbol.iterator];return b?b.call(a):q(a)}function u(a){if(!(a instanceof Array)){a=t(a);for(var b,c=[];!(b=a.next()).done;)c.push(b.value);a=c}return a}var v=0;function w(a,b){var c=XMLHttpRequest.prototype.send,d=v++;XMLHttpRequest.prototype.send=function(f){for(var e=[],g=0;g<arguments.length;++g)e[g-0]=arguments[g];var E=this;a(d);this.addEventListener("readystatechange",function(){4===E.readyState&&b(d)});return c.apply(this,e)}}function x(a,b){var c=fetch;fetch=function(d){for(var f=[],e=0;e<arguments.length;++e)f[e-0]=arguments[e];return new Promise(function(d,e){var g=v++;a(g);c.apply(null,[].concat(u(f))).then(function(a){b(g);d(a)},function(a){b(a);e(a)})})}}var y="img script iframe link audio video source".split(" ");function z(a,b){a=t(a);for(var c=a.next();!c.done;c=a.next())if(c=c.value,b.includes(c.nodeName.toLowerCase())||c.children&&z(c.children,b))return!0;return!1}function A(a){var b=new MutationObserver(function(c){c=t(c);for(var b=c.next();!b.done;b=c.next())b=b.value,"childList"==b.type&&z(b.addedNodes,y)?a(b):"attributes"==b.type&&y.includes(b.target.tagName.toLowerCase())&&a(b)});b.observe(document,{attributes:!0,childList:!0,subtree:!0,attributeFilter:["href","src"]});return b}function B(a,b){if(2<a.length)return performance.now();var c=[];b=t(b);for(var d=b.next();!d.done;d=b.next())d=d.value,c.push({timestamp:d.start,type:"requestStart"}),c.push({timestamp:d.end,type:"requestEnd"});b=t(a);for(d=b.next();!d.done;d=b.next())c.push({timestamp:d.value,type:"requestStart"});c.sort(function(a,b){return a.timestamp-b.timestamp});a=a.length;for(b=c.length-1;0<=b;b--)switch(d=c[b],d.type){case "requestStart":a--;break;case "requestEnd":a++;if(2<a)return d.timestamp;break;default:throw Error("Internal Error: This should never happen");}return 0}function C(a){a=a?a:{};this.B=!!a.useMutationObserver;this.w=!!a.useXHRObserver;this.u=a.minValue||null;a=window.__tti&&window.__tti.e;var b=window.__tti&&window.__tti.o;this.a=a?a.map(function(a){return{start:a.startTime,end:a.startTime+a.duration}}):[];b&&b.disconnect();this.b=[];this.f=new Map;this.j=null;this.v=-Infinity;this.i=!1;this.h=this.c=this.s=null;this.w&&(w(this.m.bind(this),this.l.bind(this)),x(this.m.bind(this),this.l.bind(this)));D(this);this.B&&(this.h=A(this.A.bind(this)))}C.prototype.getFirstConsistentlyInteractive=function(){var a=this;return new Promise(function(b){a.s=b;"complete"==document.readyState?F(a):window.addEventListener("load",function(){F(a)})})};function F(a){a.i=!0;var b=0<a.a.length?a.a[a.a.length-1].end:0,c=B(a.g,a.b);G(a,Math.max(c+5E3,b))}function G(a,b){!a.i||a.v>b||(clearTimeout(a.j),a.j=setTimeout(function(){var b=performance.timing.navigationStart,d=B(a.g,a.b),b=(window.a&&window.a.C?1E3*window.a.C().D-b:0)||performance.timing.domContentLoadedEventEnd-b;if(a.u)var f=a.u;else performance.timing.domContentLoadedEventEnd?(f=performance.timing,f=f.domContentLoadedEventEnd-f.navigationStart):f=null;var e=performance.now();null===f&&G(a,Math.max(d+5E3,e+1E3));var g=a.a;5E3>e-d?d=null:(d=g.length?g[g.length-1].end:b,d=5E3>e-d?null:Math.max(d,f));d&&(a.s(d),clearTimeout(a.j),a.i=!1,a.c&&a.c.disconnect(),a.h&&a.h.disconnect());G(a,performance.now()+1E3)},b-performance.now()),a.v=b)}function D(a){a.c=new PerformanceObserver(function(b){b=t(b.getEntries());for(var c=b.next();!c.done;c=b.next())if(c=c.value,"resource"===c.entryType&&(a.b.push({start:c.fetchStart,end:c.responseEnd}),G(a,B(a.g,a.b)+5E3)),"longtask"===c.entryType){var d=c.startTime+c.duration;a.a.push({start:c.startTime,end:d});G(a,d+5E3)}});a.c.observe({entryTypes:a.w?["longtask","resource"]:["longtask"]})}C.prototype.m=function(a){this.f.set(a,performance.now())};C.prototype.l=function(a){this.f.delete(a)};C.prototype.A=function(){G(this,performance.now()+5E3)};h.Object.defineProperties(C.prototype,{g:{configurable:!0,enumerable:!0,get:function(){return[].concat(u(this.f.values()))}}});var H={getFirstConsistentlyInteractive:function(a){a=a?a:{};return"PerformanceLongTaskTiming"in window?(new C(a)).getFirstConsistentlyInteractive():Promise.resolve(null)}};window.ttiPolyfill=H;})();'

    /*********library for fid**********/
    var fid_lib_str = '!function(n,e){var t,o,i,c=[],f={passive:!0,capture:!0},r=new Date,a="pointerup",u="pointercancel";function p(n,c){t||(t=c,o=n,i=new Date,w(e),s())}function s(){o>=0&&o<i-r&&(c.forEach(function(n){n(o,t)}),c=[])}function l(t){if(t.cancelable){var o=(t.timeStamp>1e12?new Date:performance.now())-t.timeStamp;"pointerdown"==t.type?function(t,o){function i(){p(t,o),r()}function c(){r()}function r(){e(a,i,f),e(u,c,f)}n(a,i,f),n(u,c,f)}(o,t):p(o,t)}}function w(n){["click","mousedown","keydown","touchstart","pointerdown"].forEach(function(e){n(e,l,f)})}w(n),self.perfMetrics=self.perfMetrics||{},self.perfMetrics.onFirstInputDelay=function(n){c.push(n),s()}}(addEventListener,removeEventListener)';
    /************CAVNV Code ************/
    window.CAVNV_start = new Date().getTime();
    var boomr;
    var impl, nameVal, k, d = w.document, pendingDom;

    if (w.CAVNV === undefined) {
        w.CAVNV = {};
    }

    if (w.JSON === undefined) {
        //alert('JSON set to window Object');
        w.JSON = JSON;
    }
    window.CAVNV = w.CAVNV;
    // don't allow this code to be included twice
    if (CAVNV.version) {
        return;
    }

    CAVNV.getVersion = function (a, b) {
        var ret = a;
        if (b.indexOf("$CAVNV") == -1)
            ret += "_" + b;
        return ret;
    }
    CAVNV.version = CAVNV.getVersion('4.13.0', "$CAVNVVERSION");
    CAVNV.window = w;

    var totalBytes = 0;
    var totalDuration = 0;
    var nt_load_time, nt_time_to_load, nt_time_to_DOC, nt_dom_content_load_time, nt_fp, nt_fcp, nt_nav_type, nt_red_time, nt_app_cache_time, nt_fetch_time, nt_dns_time, nt_first_byte_time, nt_server_response_time, nt_res_time, nt_unload_time, colorDepth, pixelDepth, nt_dom_time;
    var IP_regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    //list of session flags and their position in CavSF cookie.
    var CavSFList = { 'Pagedump': 0, 'FPID': 1, 'SessionFilter': 2, 'LastAccessTime': 3, 'uSHistory': 4, 'LocationId': 5, 'GeoId': 6, 'AccessTypeId': 7, 'ocxFilter': 8, 'storeFilterApplied': 9, 'maxPagePct': 10, 'tabId': 11, 'EpochTime': 12, 'orderTotal': 13, 'orderCount': 14, 'pctConsole': 15 }

    CAVNV.loadTimeDone = false;
    // impl is a private object not reachable from outside the CAVNV object
    // users can set properties by passing in to the init() method
    impl = {
        // properties
        beacon_url: "",
        // strip out everything except last two parts of hostname.
        // This doesn't work well for domains that end with a country tld,
        // but we allow the developer to override site_domain for that.
        // You can disable all cookies by setting site_domain to a falsy value
        site_domain: IP_regex.test(w.location.hostname) ? (w.location.hostname) : (w.location.hostname).
            replace(/.*?([^.]+\.[^.]+)\.?$/, '$1').
            toLowerCase(),
        //! User's ip address determined on the server.  Used for the BA cookie
        user_ip: '',

        unloadfired: false,

        onloadfired: false,

        configLoaded: false,

        handlers_attached: false,
        events: {
            "page_ready2": [],  //all the callback set by apis will come here. Beacuse we need to run them first. before other plugins.
            "page_ready": [],
            "page_unload": [],
            "page_unload2": [], //all the callback set by apis will come here. Because we need to run them first. before other plugins. 
            "dom_loaded": [],
            "visibility_changed": [],
            "before_beacon": [],
            "after_beacon": [],
            "click": []
        },

        vars: {},

        custom_cb: [],

        disabled_plugins: {},

        onclick_handler: function (ev) {
            var target;
            if (!ev) {
                ev = w.event;
            }
            if (ev.target) {
                target = ev.target;
            }
            else if (ev.srcElement) {
                target = ev.srcElement;
            }
            if (target && target.nodeType === 3) { // defeat Safari bug
                target = target.parentNode;
            }

            // don't capture clicks on flash objects
            // because of context slowdowns in PepperFlash
            if (target && target.nodeName.toUpperCase() === "OBJECT" && target.type === "application/x-shockwave-flash") {
                return;
            }
            impl.fireEvent("click", target);
        },

        fireEvent: function (e_name, data) {
            var i, h, e;
            if (!this.events.hasOwnProperty(e_name)) {
                return false;
            }

            e = this.events[e_name];

            for (i = 0; i < e.length; i++) {
                h = e[i];
                try {
                    h[0].call(h[2], data, h[1]);
                } catch (e) { }
            }
            //now clean this array because all callbacks called.
            this.events[e_name] = [];

            return true;
        }
    };

    window.SessionStorage = {

        push: function (url, data, module) {

            function storeData(moduleArr, arrIndex) {
                try {
                    sessionStorage.setItem('nv.' + module, JSON.stringify(moduleArr));
                }
                catch (e) {
                    if (e.code == 22) {
                        CAVNV.log("Session Storage: QuotaExceededError");
                        return false;
                    }
                }
            }
            var arrIndex;
            var storedData = [];
            var moduleArr = JSON.parse(sessionStorage.getItem('nv.' + module));
            if (moduleArr == null) {
                moduleArr = [];
                moduleArr[0] = url;
                moduleArr[1] = [];
                if (data.length <= 10000) {
                    arrIndex = moduleArr[1].push(data) - 1;
                    storeData(moduleArr);
                    return arrIndex;
                }
            }
            else {
                //FIXME: Check combined length
                var count = 0;
                for (var i = 0; i < moduleArr[1].length; i++) {
                    count += moduleArr[1][i];
                }
                if (count <= 10000) {
                    arrIndex = moduleArr[1].push(data) - 1;
                    storeData(moduleArr);
                    return arrIndex;
                }
            }
        },

        remove: function () {
            for (var i = 0; i < sessionStorage.length; i++) {
                if (sessionStorage.key(i).indexOf('nv.') != -1) {
                    var arr = sessionStorage.getItem(sessionStorage.key(i));
                    arr = JSON.parse(arr);
                    sessionStorage.removeItem(sessionStorage.key(i));
                    if (arr[1].length > 1) {
                        for (var j = 1; j < arr[1].length; j++) {
                            if (arr[1][j] == null || arr[1][j] == undefined)
                                continue;
                            arr[1][0] = arr[1][0].concat(arr[1][j]);
                        }
                    }
                    CAVNV.utils.sendData(arr[0], arr[1][0], sessionStorage.key(i))
                }
            }
        }
    };

    // We create a boomr object and then copy all its properties to CAVNV so that
    // we don't overwrite anything additional that was added to CAVNV before this
    // was called... for example, a plugin.
    boomr = {
        t_start: CAVNV_start,
        t_end: null,
        ajax_pg_start_time: -1,
        ajax_pg_arg: {},
        log_level: 0,
        SID: 0,
        NDPI: 1,
        LTS: 2,
        PI: 3,
        NV_COOKIE: "CavNVC",
        //TODO: we don't want to fix it like this, make some metaData of webview and send data in it.
        webViewHeight: 0,
        webViewWidth: 0,
        webViewTop: 0,
        webViewLeft: 0,
        //Note: should be in sequence of Cookie Index.
        //Default Cookie Value.
        defaultCValue: [null, "0", "-1", "1"],
        //Refernce - https://www.keycdn.com/blog/web-crawlers/ 
        botUserAgent: [
            { n: "Googlebot", p: [/(Googlebot)/, /(AdsBot-Google)/] },
            { n: "Bingbot", p: [/(Bingbot)/] },
            { n: "Slurp Bot", p: [/(Slurp)/] },
            { n: "DuckDuckBot", p: [/(DuckDuckBot)/] },
            { n: "Baiduspider", p: [/(Baiduspider)/] },
            { n: "Yandex Bot", p: [/(YandexBot)/] },
            { n: "Sogou Spider", p: [/(Sogou)/] },
            { n: "Exabot", p: [/(Exabot)/] },
            { n: "Facebook External Hit", p: [/(facebot)/, /(facebookexternalhit)/] },
            { n: "Alexa Crawler", p: [/(ia_archiver)/] },
            { n: "MSNBot", p: [/(msnbot)/] },
            { n: "Jeeves/Teoma", p: [/(Jeeves\/Teoma)/] },
            { n: "Gigabot", p: [/(Gigabot)/] },
            { n: "MJ12bot", p: [/(MJ12bot)/] },
            { n: "Pingdom", p: [/(Pingdom)/] },
            { n: "Pinterest", p: [/(Pinterest)/] },
            { n: "PhantomJS", p: [/PhantomJS/] }
        ],
        //added to handle ie pagedump issue.
        // Utility functions
        utils: {
            objectToString: function (o, separator) {
                var value = [],
                    k;

                if (!o || typeof o !== "object") {
                    return o;
                }
                if (separator === undefined) {
                    separator = "\n\t";
                }

                for (k in o) {
                    if (Object.prototype.hasOwnProperty.call(o, k)) {
                        value.push(encodeURIComponent(k) + '=' + encodeURIComponent(o[k]));
                    }
                }

                return value.join(separator);
            },

            setCookieLS: function (name, value, maxage) {
                //get cookie from localStorage. 
                var cookie = localStorage.getItem("__cookie");
                if (!cookie)
                    cookie = {};
                else
                    cookie = JSON.parse(cookie);

                //do not check if already set. 
                var o = { value: this.objectToString(value, "&"), maxage: (maxage ? (Date.now() + maxage * 1000) : 0) };
                cookie[name] = o;

                //update in localStorage.
                localStorage.setItem("__cookie", JSON.stringify(cookie));
            },

            getCookieLS: function (name) {
                var cookie = localStorage.getItem("__cookie");
                if (!cookie)
                    return null;
                cookie = JSON.parse(cookie);

                if (!cookie[name]) return null;

                //check for max age. 
                var o = cookie[name];
                if (o.maxage) {
                    //check for expiry. 
                    if (Date.now() > o.maxage) {
                        //remove cookie and return. 
                        delete cookie[name];

                        localStorage.setItem("__cookie", JSON.stringify(cookie));
                        return null;
                    }
                }

                return o.value;
            },

            getCookie: function (name) {
                if (!name) {
                    return null;
                }

                if (CAVNV.cookieLess)
                    return CAVNV.utils.getCookieLS(name);

                name = ' ' + name + '=';

                var i, cookies;
                cookies = ' ' + d.cookie + ';';
                if ((i = cookies.indexOf(name)) >= 0) {
                    i += name.length;
                    cookies = cookies.substring(i, cookies.indexOf(';', i));
                    return cookies;
                }

                return null;
            },

            setCookie: function (name, subcookies, max_age) {

                if (CAVNV.cookieLess)
                    return CAVNV.utils.setCookieLS(name, subcookies, max_age);

                var value, nameval, c, exp;
                var dom = '';
                /*
                dom = impl.site_domain;
                if (!dom) {
                  dom = IP_regex.test(w.location.hostname) ? (w.location.hostname) : (w.location.hostname).
                  replace(/.*?([^.]+\.[^.]+)\.?$/, '$1').
                  toLowerCase();
                }
                */
                if (name != "CavNDPI")
                    dom = w.location.hostname.toLowerCase();

                if (!name) {
                    CAVNV.debug("No cookie name given");
                    return false;
                }

                value = CAVNV.utils.objectToString(subcookies, "&");
                nameval = name + '=' + value;

                //we were unable to set cookie for host of format [a-z0-9] (. is not prasent)
                //we will not use domain in that case.
                if (dom.indexOf('.') != -1)
                    c = [nameval, "path=/", "domain=" + dom];
                else
                    c = [nameval, "path=/"];

                if (name == "CavNV")
                    c = [nameval, "path=/"];

                if (max_age) {
                    exp = new Date();
                    exp.setTime(exp.getTime() + max_age * 1000);
                    exp = exp.toGMTString();
                    c.push("expires=" + exp);
                }

                if (nameval.length < 4000) {
                    d.cookie = c.join('; ');
                    // confirm cookie was set (could be blocked by user's settings, etc.)
                    var savedVal = CAVNV.utils.getCookie(name);
                    if (value == savedVal) {
                        return true;
                    }
                    CAVNV.debug("Saved cookie value doesn't match what we tried to set:\n" + value + "\n" + savedVal);
                }
                else {
                    CAVNV.warn("Cookie too long: " + nameval.length);
                }

                return false;
            },

            getSubCookies: function (cookie) {
                var cookies_a, i, l, kv, cookies = {};

                if (!cookie) {
                    return null;
                }

                cookies_a = cookie.split('&');

                if (cookies_a.length === 0) {
                    return null;
                }

                for (i = 0, l = cookies_a.length; i < l; i++) {
                    kv = cookies_a[i].split('=');
                    kv.push(""); // just in case there's no value
                    cookies[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
                }

                return cookies;
            },

            removeCookie: function (name) {
                return CAVNV.utils.setCookie(name, {},
                    -1);
            },

            pluginConfig: function (o, config, plugin_name, properties) {
                var i, props = 0;

                if (!config || !config[plugin_name]) {
                    return false;
                }

                for (i = 0; i < properties.length; i++) {
                    if (config[plugin_name][properties[i]] !== undefined) {
                        o[properties[i]] = config[plugin_name][properties[i]];
                        props++;
                    }
                }

                return (props > 0);
            },
            getItem: function (sKey) {
                return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
            },
            setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
                if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
                    return false;
                }
                var sExpires = "";
                if (vEnd) {
                    switch (vEnd.constructor) {
                        case Number:
                            sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                            break;
                        case String:
                            sExpires = "; expires=" + vEnd;
                            break;
                        case Date:
                            sExpires = "; expires=" + vEnd.toUTCString();
                            break;
                    }
                }
                document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
                return true;
            },
            removeItem: function (sKey, sPath, sDomain) {
                if (!sKey || !this.hasItem(sKey)) {
                    return false;
                }
                document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
                return true;
            },
            hasItem: function (sKey) {
                return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
            },
            keys:
                /* optional method: you can safely remove it! */
                function () {
                    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
                    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) {
                        aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
                    }
                    return aKeys;
                },

            //mode(useCapture) - false/true
            addListener: function (el, type, fn, mode) {
                mode = mode || false;
                if (el.addEventListener) {
                    el.addEventListener(type, fn, mode);
                } else {
                    el.attachEvent('on' + type, fn);
                }
            },

            removeListener: function (el, type, fn) {
                if (el.removeEventListener) {
                    el.removeEventListener(type, fn, false);
                } else {
                    el.detachEvent('on' + type, fn);
                }
            },
            createCORSRequest: function (method, url, async) {
                var xhr = new XMLHttpRequest();
                if ("withCredentials" in xhr) {
                    // Check if the XMLHttpRequest object has a "withCredentials" property.
                    // "withCredentials" only exists on XMLHTTPRequest2 objects.
                    try {
                        xhr.open(method, url, async);
                        xhr.withCredentials = true;
                    }
                    catch (e) {
                        xhr.open(method, url, true);
                    }

                } else if (typeof XDomainRequest != "undefined") {
                    // Otherwise, check if XDomainRequest.
                    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
                    xhr = new XDomainRequest();
                    xhr.open(method, url);
                } else {
                    // Otherwise, CORS is not supported by the browser.
                    xhr = null;
                }
                return xhr;
            },

            getBlob: function (data, contentType) {
                if (typeof "Blob" !== "undefined") {
                    try {
                        if (contentType)
                            return new Blob([data], { type: contentType });
                        return new Blob([data]);
                    } catch (e) { }
                }
                else {
                    var BBuilder = w.BlobBuilder || w.WebKitBlobBuilder || w.MozBlobBuilder || w.MSBlobBuilder;
                    if (BBuilder) {
                        try {
                            var builder = new BBuilder;
                            builder.append(data);
                            builder.getBlob(contentType);
                        } catch (e) { }
                    }
                }
                return null;
            },

            getBlobUrl: function (data, contentType) {
                var blob = CAVNV.utils.getBlob(data, contentType);
                if (!blob) return null;
                //Check for URL.
                //Note: In case of kohls for some of the pages like searchResult window.URL was overrite by a string. That is why we are using window of currnet frame instead of main window.
                var URL = window.URL || window.webkitURL;
                if (!URL) return null;
                try {
                    return URL.createObjectURL(blob);
                } catch (e) {
                    CAVNV.error('Failed to get Blob URL');
                }
                return null;
            },

            getRT: function (w) {
                var resources = [];
                if (w.performance.getEntriesByType !== undefined) {
                    resources = w.performance.getEntriesByType("resource");
                }
                else if (w.performance.webkitGetEntriesByType !== undefined) {
                    resources = w.performance.webkitGetEntriesByType("resource");
                }
                else if (w.NVResourceCollector !== undefined)
                    resources = w.NVResourceCollector.getEntry();

                return resources;
            },

            getPT: function (w) {
                var p = w.performance || w.msPerformance || w.webkitPerformance || w.mozPerformance;
                if (p) return p.timing;

                return null;
            },


            //This method will be used to send data to nv server. 
            //Note: it will internally check for sendBeacon support.
            //Note: this will be for post data only.
            //Note: data can be string or Uint8Array. 
            //Note: callback - will only be used in case of XHR calls in case of sendBeacon if it returns true callback will be called immediately. 
            sendData: function (url, data, module, contentType, contentEncoding, callback) {
                // if inside frame then set frameId too.
                if (CAVNV.frameId != undefined && url.indexOf("frameId") == -1) {
                    url += ('&frameId=' + CAVNV.frameId);
                }
                //caught under page wise ocxFiltering testing
                if (CAVNV.__uaEnabled == false && (url.indexOf("pagedump") != -1 || url.indexOf("domwatcher") != -1)) return;
                var vadded = (url.indexOf('&nvcounter=') != -1);

                module = module || "CAVNV";

                if (!contentType && CAVNV.messageVersion == 1)
                    contentType = 'application/json';

                var idbKey = null;
                // Note: in case of retry callback will be number and in case of retry, we do not want to add that again. 
                if (module == 'pagedump' && CAVNV.retryPDWithIDB && (typeof callback != 'number')) {
                    idbKey = IDB.post(CAVNV.sid, CAVNV.pageInstance, { url: url, module: module, data: data, contentType: contentType, contentEncoding: contentEncoding });
                }

                if (module == 'pagedump') {
                    var retryCount = (typeof callback == 'number') ? callback : 2;
                    var oldcb = callback;
                    if (retryCount) {
                        callback = function (status) {
                            if (oldcb) {
                                try { oldcb(status) } catch (e) { }
                            }
                            if (!status) {
                                CAVNV.utils.sendData(url, data, module, contentType, contentEncoding, retryCount - 1);
                            }
                        }
                    } else
                        callback = oldcb;
                }

                if (CAVNV.config.SW.enabled == true) {
                    boomr.sendReqViaWorker(url, data, module);
                    return;
                }

                if (!contentEncoding && navigator.sendBeacon && module != 'pagedump' && module != 'domwatcher' && (CAVNV.sbqueue.filled || (data && data.length && data.length <= 16 * 1024))) {
                    //Note: assumption is that all those browse which support sendBeacon will be supporting Blob. 
                    //TODO: check the case. 
                    if (contentType) {
                        //use blob to send data.
                        var blob = CAVNV.utils.getBlob(data, contentType);
                        if (blob)
                            data = blob;
                    }

                    if (module != 'sbqueue' && data.length <= 16 * 1024 && CAVNV.sbqueue.push(url, data, module, contentType, contentEncoding) == true)
                        return;

                    if (!vadded) {
                        url += "&nvcounter=" + CAVNV.nvCounter;
                        CAVNV.nvCounter++;
                    }

                    //Note: this way we can not  identify if this request further failed or not.
                    try {
                        if (navigator.sendBeacon(url, data) == true) {
                            CAVNV.log("Sending data using send beacon");
                            CAVNV.sbqueue.used(data.length);
                            if (callback)
                                callback(true);
                            return;
                        }
                    } catch (e) { }
                }

                var pushIndex = null;
                // in case  : request is failed , and not sent by sendBeacon
                vadded = (url.indexOf('&nvcounter=') != -1);
                if (!vadded) {
                    url += "&nvcounter=" + CAVNV.nvCounter;
                    CAVNV.nvCounter++;
                }

                vadded = (url.indexOf('&ocxcounter=') != -1);
                if (!vadded && (module == "pagedump" || module == "domwatcher")) {
                    url += "&ocxcounter=" + CAVNV.ocxCounter;
                    CAVNV.ocxCounter++;
                }

                if (impl.unloadfired == true) {
                    if (sessionStorage && typeof data == "string" && data.length < 10000) {
                        pushIndex = SessionStorage.push(url, data, module);
                        CAVNV.log("Succesfully stored the data in Session Storage");
                    }
                }

                //Send using xhr request.
                //Note: method will always be POST and async.
                var xhr = new XMLHttpRequest();
                if ("withCredentials" in xhr) {
                    // Check if the XMLHttpRequest object has a "withCredentials" property.
                    // "withCredentials" only exists on XMLHTTPRequest2 objects.
                    xhr.open("POST", url, true);
                    //setting it to enable thirdparty cookies
                    xhr.withCredentials = true;
                } else if (typeof XDomainRequest != "undefined") {
                    // Otherwise, check if XDomainRequest.
                    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
                    xhr = new XDomainRequest();
                    xhr.open("POST", url);
                } else {
                    // Otherwise, CORS is not supported by the browser.
                    CAVNV.log("CORS is not support by Browser. Failed to send data");
                    return;
                }
                xhr.onload = function () {
                    CAVNV.log("Successfully send data. Module - " + module);

                    // Check if data was stored in DB then remove. 
                    if (idbKey && this.status / 100 != 5) {
                        IDB.remove(idbKey);
                    }

                    if (this.status == 404 && CAVNV.sid && (CAVNV.sid != CAVNV.utils.getNVCookie(CAVNV.SID))) {
                        //Server will respond with 404 status code if session expiry happens at server. Resend the timing for further capturing.
                        CAVNV.log("CAVNV.sid ---" + CAVNV.sid);
                        CAVNV.sendBeacon();
                    }
                    if (pushIndex && impl.unloadfired == true) {
                        var moduleArr = JSON.parse(sessionStorage.getItem('nv.' + module));
                        //FIXME: delete entry from that index instead of splice 
                        delete moduleArr[1][pushIndex];
                    }
                    if (callback)
                        callback(this.status / 100 == 5 ? false : true);
                }
                xhr.onerror = function () {
                    CAVNV.error("Failed to send data. Module - " + module);
                    if (callback)
                        callback(false);
                }

                if (contentType)
                    xhr.setRequestHeader('Content-Type', contentType);

                if (contentEncoding)
                    xhr.setRequestHeader('Content-Encoding', contentEncoding);

                xhr.send(data);
            },

            XHR: function (method, url, contentType) {
                var xhr = new XMLHttpRequest();
                if ("withCredentials" in xhr) {
                    // Check if the XMLHttpRequest object has a "withCredentials" property.
                    // "withCredentials" only exists on XMLHTTPRequest2 objects.
                    xhr.open(method, url, true);
                    //If contentType is set then we have to set withCredentials true.
                    xhr.withCredentials = true;
                } else if (typeof XDomainRequest != "undefined") {
                    // Otherwise, check if XDomainRequest.
                    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
                    xhr = new XDomainRequest();
                    xhr.open(method, url);
                } else {
                    // Otherwise, CORS is not supported by the browser.
                    CAVNV.log("CORS is not support by Browser. Failed to send data");
                    return null;
                }
                return xhr;
            },

            //Note: list will be , seperated and -1 means for all pages.
            pagePresentInList: function (list, pageid) {
                pageid = pageid || CAVNV.pageIndex;
                list = ',' + list + ',';
                if ((list.indexOf(',-1,') != -1) || (list.indexOf(',' + pageid + ',') != -1))
                    return true;

                return false;
            },
            eval_jsstring: function (js_str) {
                //need to define a function to eval js string but this js string should be evaluated in main window context.
                var h = CAVNV.window;
                if (h.__eval_jsstring == undefined) {
                    //include this function. 
                    var s = h.document.createElement('script');
                    s.type = 'text/javascript';
                    s.innerHTML = 'function __eval_jsstring(s){try {return eval(s);}catch(e){return null;}}';
                    h.document.body.appendChild(s);
                }
                //now we have
                return h.__eval_jsstring(js_str);
            },

            //to send custom html event.
            triggerEvent: function (element, eventName) {
                var event;
                if (d.createEvent) {
                    event = d.createEvent("HTMLEvents");
                    event.initEvent(eventName, true, true);
                } else {
                    event = d.createEventObject();
                    event.eventType = eventName;
                }
                event.eventName = eventName;
                if (d.createEvent) {
                    w.dispatchEvent(event);
                } else {
                    w.fireEvent("on" + event.eventType, event);
                }
            },

            getDomID: function (element, x) {
                function isBlacklisted(id) {
                    //Just check if there are multiple element with same id.
                    try {
                        var d = element.contentDocument || (element.contentWindow ? element.contentWindow.document : null) || CAVNV.window.document;
                        if (d.querySelectorAll) {
                            try {
                                if (d.querySelectorAll('[id="' + id + '"]').length > 1)
                                    return true;
                            }
                            catch (e) {
                                if (d.querySelectorAll('#' + id).length > 1)
                                    return true;
                            }
                        }
                    } catch (e) { }

                    for (var z = 0; z < CAVNV.blacklist_id.length; z++)
                        if (CAVNV.blacklist_id[z] == id) return true;

                    return false;
                }

                function getXPath(element) {
                    var paths = [];

                    // Use nodeName (instead of localName) so namespace prefix is included (if any).
                    for (; element && element.nodeType == Node.ELEMENT_NODE; element = element.parentNode) {
                        var index = 0;
                        for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
                            // Ignore document type declaration.
                            if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE) continue;

                            if (sibling.nodeName == element.nodeName) ++index;
                        }

                        var tagName = (element.prefix ? element.prefix + ":" : "") + element.localName;
                        var pathIndex = (index ? "[" + (index + 1) + "]" : "");
                        paths.splice(0, 0, tagName + pathIndex);
                    }

                    return paths.length ? "/" + paths.join("/") : null;
                }

                //validate element. 
                if (!element || !element.nodeType || element.nodeType != Node.ELEMENT_NODE)
                    return { t: -2, i: null, x: null };

                //check if x flag is true then we have to provide xpath mandatory.
                x = x || false;

                var xpath = null;
                if (x)
                    xpath = getXPath(element);

                var cssS = null;
                if (CAVNV.config.enableCssSelector == true)
                    cssS = CAVNV.utils.getCssSelector(element);

                //check if id present and id is not blacklist then just return id.
                //if(element.id && element.id.trim() != "" && isBlacklisted(element.id) == false) return {t: -1, i: element.id, x: xpath};
                if (cssS) return { t: -3, i: cssS, x: xpath };
                //return XPath.
                //return {t: -3, i: my_selector_generator.getSelector(element), x: getXPath(element)};
                if (element.id && element.id.trim() != "" && isBlacklisted(element.id) == false) return { t: -1, i: element.id, x: xpath };

                return { t: -2, i: xpath || getXPath(element), x: xpath };
            },

            getCssSelector: function () {
                //Note: these are the default options and arranged in the order of there preference.
                var options = { selectors: ['tag', 'id', 'class', 'nthchild'] };
                //TODO: check nthchild support in IE.
                var CSSS = new CssSelectorGenerator(options);
                var lastConfig = null;
                function f(element) {
                    var c = CAVNV.config.cssSelectorOptions;
                    if (c && lastConfig !== c) {

                        // initialize CSSS again.
                        for (var k in c) {
                            options[k] = c[k];
                        }
                        CSSS = new CssSelectorGenerator(options);
                        lastConfig = c;
                    }
                    return CSSS.getSelector(element);
                }
                return f;
            }(),


            isArray: function (d) {
                return Object.prototype.toString.call(d) === '[object Array]';
            },
            isNumber: function (d) {
                if (typeof d === 'number') return true;
                else if (typeof d === 'string') return /^[0-9]+$/.test(d) || /^[0-9]+$/.test(d.replace('.', ''));
                return false;
            },
            reverse: function (s) {
                var o = '';
                for (var i = s.length - 1; i >= 0; i--)
                    o += s[i];
                return o;
            },
            //Note: currently there is no chance of exception but in future we should take care of this.
            //Format: <Length>|<encodedText>
            encode: function (s) {
                return s.length + "." + Base64.encode(CAVNV.utils.reverse(s));
            },
            encodeText: function (str, callback) {
                //Tokenize the string by escape characters(\r, \n, \t, \v, \b, \f).
                var str_arr = [];
                var token_arr = [];
                var offset = 0;
                //Note: we are not using space.
                for (var z = 0; z < str.length; z++) {
                    if (str[z] == ' ' || str[z] == '\r' || str[z] == '\n' || str[z] == '\t' || str[z] == '\b' || str[z] == '\v' || str[z] == '\f') {
                        str_arr.push(str.substring(offset, z));
                        token_arr.push(str[z]);
                        //update offset.
                        offset = z + 1;
                    }
                }
                if (offset != str.length) {
                    str_arr.push(str.substr(offset));
                }

                //call the callback for each string token.
                var out = "";
                for (var z = 0; z < str_arr.length; z++) {
                    if (str_arr[z] != "")
                        out += callback(str_arr[z]);
                    if (token_arr[z] != undefined)
                        out += token_arr[z];
                }
                return out;
            },
            //Note: this will return in sec.
            nv_time: function (cur_time) {
                if (CAVNV.nav_start_time <= 0 || CAVNV.nav_start_time > cur_time) cur_time = CAVNV.cav_epoch_nav_start_time * 1000;
                else cur_time = (parseInt((cur_time - CAVNV.nav_start_time)) + (CAVNV.cav_epoch_nav_start_time * 1000));
                //cur_time = cur_time - CAVNV.epochTime;
                return cur_time;
            },
            nv_time_rel_to_sess: function (cur_time) {
                if (CAVNV.nav_start_time <= 0 || CAVNV.nav_start_time > cur_time) cur_time = CAVNV.session_start_time - CAVNV.cav_epoch_nav_start_time;
                else cur_time = (parseInt((cur_time - CAVNV.nav_start_time) / 1000) + (CAVNV.cav_epoch_nav_start_time - CAVNV.session_start_time));
                return cur_time;
            },
            eventTimestamp: function (timeStamp) {
                /*  Event Timestamp vary browser to browser. 
                 * Chrome - relative in msec 
                 * Firefox - Absolute in usec
                 * IE - Absolute in msec
                 */
                //Evaluate all needed constatns. 
                var navigationStart = new Date().getTime();
                if (performance && performance.timing)
                    navigationStart = performance.timing.navigationStart;
                var TIME_1990 = 631132200000;
                var TIME_2100 = 4102425000000;

                if (timeStamp < TIME_1990)
                    return timeStamp + navigationStart;
                else if (timeStamp > TIME_2100)
                    return timeStamp / 1000;
                return timeStamp;
            },

            getEEFlag: function (node) {
                //Check if enc flag is set then just return that. 
                //Note: assuming that once an element mark as encrypted will be encrypted.
                //Note: First check for current element and then check in parent element.
                return node.__nvenc || (node.parentElement ? node.parentElement.__nvenc : 0);
            },

            getEEValue: function (value, eeflag, always) {
                if (eeflag == CAVNV.ENCODED) {
                    return { v: escape(value.replace(/[^\s]/g, "*")) };
                }
                else if (eeflag == CAVNV.ENCRYPTED) {
                    if (CAVNV.rsaEncryption)
                        return { v: value.replace(/[^\s]/g, "*"), ev: CAVNV.plugins.EQueue.add(value) };
                    else
                        return { v: value.replace(/[^\s]/g, "*"), ev: CAVNV.utils.encodeText(value, CAVNV.utils.encode) };
                }
                //always if we want normal data also to be encrypted by default algo.
                if (always)
                    return { v: CAVNV.utils.encodeText(value, CAVNV.utils.encode) };
                else
                    return { v: value };
            },

            getNodeAttributes: function (node) {
                var data = {};
                if (node.attributes) {
                    //Added tag name.
                    data["tagName"] = node.tagName;
                    for (var z = 0; z < node.attributes.length; z++) {
                        data[node.attributes[z].name] = node.attributes[z].value;
                    }
                    //log textContent.  
                    if (node.textContent)
                        data["text"] = node.textContent.substring(0, 128);
                }
                return data;
            },

            getNodeText: function (node) {
                if (node.textContent)
                    return node.textContent.trim().substring(0, 128);
                return '';
            },


            //Note: this method will be called in case when CrossOrigin is enabled. 
            updateNVCookieAsync: function (cookieIdx, value) {
                //first get the cookie from iframe. 
                CAVNV.syncCOCookie(function () {
                    this.updateNVCookie(cookieIdx, value);
                });
            },

            updateNVCookie: function (cookieIdx, value) {
                var curValue = CAVNV.utils.getCookie(CAVNV.NV_COOKIE);
                var fields = [];
                var valueArray = [];
                if (curValue) {
                    valueArray = curValue.split("-");
                }
                fields[CAVNV.SID] = valueArray[CAVNV.SID] || CAVNV.defaultCValue[CAVNV.SID];
                fields[CAVNV.PI] = valueArray[CAVNV.PI] || CAVNV.defaultCValue[CAVNV.PI];
                fields[CAVNV.LTS] = valueArray[CAVNV.LTS] || CAVNV.defaultCValue[CAVNV.LTS];
                fields[CAVNV.NDPI] = valueArray[CAVNV.NDPI] || CAVNV.defaultCValue[CAVNV.NDPI];

                //update the cookie value.
                fields[cookieIdx] = value;

                //join and set the cookie. 
                var v = fields.join("-");
                var ret = CAVNV.utils.setCookie(CAVNV.NV_COOKIE, v, CAVNV.sessionExpiryTime);
                if (CAVNV.config.CrossOrigin.enabled) {
                    CAVNV.updateCookie(CAVNV.NV_COOKIE, v);
                }
                //update CavSF cookie
                var sf = CAVNV.utils.getCookie('CavSF');
                if (!sf)
                    CAVNV.utils.setCookie('CavSF', sf);

                CAVNV.plugins.IframeMonitor.sync();
                return ret;
            },

            getNVCookie: function (cookieIdx) {
                //get the cookie value.
                var v = CAVNV.utils.getCookie(CAVNV.NV_COOKIE);
                var fields = [];
                if (v) {
                    fields = v.split("-");
                }
                var ret = fields[cookieIdx] || CAVNV.defaultCValue[cookieIdx];
                if (ret == "null")
                    return null;
                return ret;
            },
            resetNVSession: function () {
                //TODO: check what else is needed.
                CAVNV.utils.removeCookie(CAVNV.NV_COOKIE);
                CAVNV.utils.removeCookie("CavSF");
            },
            logNDEvent: function (category) {
                if (!CAVNV._ndvslow) {
                    if (category == 12) {
                        w.cav_nv_log_event('VerySlowServerResponseTime', {});
                        CAVNV._ndvslow = true;
                    }
                    else if (category == 11 && !CAVNV._ndslow) {
                        w.cav_nv_log_event('SlowServerResponseTime', {});
                        CAVNV._ndvslow = true;
                    }
                }
            },
            isBot: function (userAgent) {
                userAgent = userAgent || navigator.userAgent;
                for (var i = 0; i < CAVNV.botUserAgent.length; i++) {
                    for (var z = 0; z < CAVNV.botUserAgent[i].p.length; z++) {
                        if (CAVNV.botUserAgent[i].p[z].test(userAgent))
                            return true;
                    }
                }
                return false;
            },
            // for ios we check whether the request is blocked by Native side and below function is called by ios native to trigger the unblocked timing.
            trigerSendBeacon: function (allowed) {
                if (allowed) {
                    CAVNV.iosTriggered = true;
                    CAVNV.sendBeacon();
                }
            },
            //FIXME: androidSyncBridge is not applicable for string type data.
            androidSyncBridge: function (ma) {
                var keys = Object.keys(ma);
                var oldsid = CAVNV.utils.getNVCookie(CAVNV.SID);
                var newsid = null;
                var property;
                for (var idx in keys) {
                    property = keys[idx];
                    var currProperty = ma[property];
                    if (currProperty !== null && !isNaN(currProperty)) {
                        if (property == "sid") {
                            currProperty = Array(21 - currProperty.length).fill(0).join('') + currProperty;
                            //case when sid changed. 
                            if (CAVNV.sid != currProperty) {
                                CAVNV.pageInstance = 0;
                                CAVNV.snapshotInstance = 0;
                                //Check for prev sid if changed from prev then reset pageinstance, snapshotinstance etc. 
                            }
                            CAVNV[property] = currProperty;
                            CAVNV.utils.updateNVCookie(0, currProperty);
                            newsid = currProperty;
                        }
                        else if (property == "snapshotInstance" && currProperty == "-1")
                            CAVNV[property] = 0;
                        else if (property != "sid" && (!CAVNV[property]) ? true : isNaN(CAVNV[property]) ? false : (parseInt(CAVNV[property]) < parseInt(currProperty))) {
                            CAVNV[property] = parseInt(currProperty);
                            if (property == 'pageInstance')
                                CAVNV.utils.updateNVCookie(3, currProperty);
                            else if (property == 'lts')
                                CAVNV.utils.updateNVCookie(2, currProperty);
                        }
                    }
                }
                if (CAVNV.timingBlocked || (!oldsid && newsid)) {
                    CAVNV.timingBlocked = false;
                    CAVNV.sendBeacon();
                }
            }
        },

        //This queue will keep data in memory till send Beacon buffer not filled. 
        sbqueue: (function () {
            var count = 0;
            //It will contain {data, args.}
            var queue = {
                maxbuffer: 65536,
                usedbuffer: 0,
                reserved: 0,
                filled: false,
                Q: {},
                unload: false
            };

            function append(src, dst) {
                //Check if string then append by \n else assume as array. 
                if (typeof src == 'string') {
                    src += dst;
                    return src;
                }
                else if (typeof src == 'object') {
                    var srcarr = JSON.parse(src);
                    var dstarr = JSON.parse(dst);
                    for (var z = 0; z < dstarr.length; z++)
                        srcarr.push(dstarr[z]);
                    return JSON.stringify(srcarr);
                }
            }

            //sendData: function(url, data, module, contentType, contentEncoding)
            queue.push = function (/*url, data, module*/) {

                if (this.unload == true) return;

                //Check if already marked as fillted then return;
                var url = arguments[0];
                var data = arguments[1];
                var module = arguments[2];

                if (data.length + this.reserved >= this.maxbuffer - this.usedbuffer) {
                    //Check if any buffer in queue then flush that and return false.
                    CAVNV.log('Before ------------------MaxBuffer - ' + this.maxbuffer + ', used - ' + this.usedbuffer + ', reserved - ' + this.reserved + '-----------------');
                    if (this.reserved > 0)
                        this.flush();
                    CAVNV.log('After ------------------MaxBuffer - ' + this.maxbuffer + ', used - ' + this.usedbuffer + ', reserved - ' + this.reserved + '-----------------');
                    return false;
                }
                if (this.Q[module] == undefined) {
                    this.Q[module] = { data: data, args: arguments };
                    if (data.length)
                        this.reserved += data.length;
                    this.log();
                }
                else {
                    var len = this.Q[module].data.length;

                    var data = append(this.Q[module].data, data);
                    if (module == "useraction") {
                        count++;
                        CAVNV.log("Module----" + module + "appended" + count + "times");
                    }
                    //remove data from arguments.
                    arguments[1] = 'sbqueue';

                    this.Q[module] = { data: data, args: arguments };

                    this.reserved += (data.length - len);
                    this.log();

                }

                return true;
            }
            queue.flush = function () {
                CAVNV.log("Flushing SBQueue Data");
                //pick each module and make sendData call.
                for (var k in this.Q) {
                    if (this.Q[k].data !== "") {
                        //modify args. 
                        var args = this.Q[k].args;
                        //modify the data index. 
                        args[1] = this.Q[k].data;
                        args[2] = 'sbqueue';

                        CAVNV.utils.sendData.apply(CAVNV, args);
                        this.reserved -= this.Q[k].data.length;
                        this.log();
                        this.Q[k].data = "";
                    }
                }
            }

            queue.used = function (len) {
                this.usedbuffer += len;
                if (this.maxbuffer - this.usedbuffer <= 16 * 1024)
                    this.filled = true;
            }

            queue.log = function () {
                CAVNV.log('MaxBuffer - ' + this.maxbuffer + ', used - ' + this.usedbuffer + ', reserved - ' + this.reserved);
            }

            return queue;
        }()),

        init: function (config) {

            //Check here is session is in filter list then disable cavnv.
            //commenting as in case of filter we need first_beacon_sent to be set.
            /*var cavSid = CAVNV.utils.getNVCookie(CAVNV.SID);
            if(cavSid == "000000000000000000000")
            {
              CAVNV.log("Session  marked is filtered. Disabling NV");
              return;
            }
            */
            //FIXME: In case when AjaxMonitor was enabled before loading configuration then we should disable that if filter is on.
            if (config.filterBotSession && CAVNV.utils.isBot(CAVNV.window.navigator.userAgent))
                return true;

            if (!CAVNV.initAt)
                CAVNV.initAt = new Date().getTime();

            if (!config) {
                config = {};
                CAVNV.config = config;
            }

            //check if resource Timing is enabled then init failedresource collection.
            if (config.resourceTiming == true) {
                //Note: it will have no impact calling init twice.
                //init only if we have resource timing.
                if (w.performance && (w.performance.getEntriesByType || w.performance.webkitGetEntriesByType))
                    ResourceFailedDetector.init();
            }

            //Note: we will initialize AjaxMonitor in begining. Just to trap all ajax calls happening after domContentLoad.
            if (impl.configLoaded != true && this.plugins.hasOwnProperty('AjaxMonitor')) {
                if (config['AjaxMonitor'] && config['AjaxMonitor'].hasOwnProperty('enabled') && config['AjaxMonitor'].enabled == true)
                    this.plugins.AjaxMonitor.init(config);
            }

            //Merge the config with already one.
            var prevConfig = CAVNV.config;
            if (prevConfig) {
                //merge current configuraion in prev One.
                for (k in prevConfig) {
                    if (typeof prevConfig[k] != "undefined" && typeof config[k] == "undefined")
                        config[k] = prevConfig[k];
                }
            }
            CAVNV.config = config;
            CAVNV.letsPing = function () {
                var url = CAVNV.beacon_url + "?op=ping&d=" + CAVNV.store + "|" + CAVNV.terminal;
                var xhr = new CAVNV.utils.XHR("GET", url);
                if (!xhr) return;
                xhr.send();
            }

            //check if configuration loaded. If not then load the configuration first.
            if (!impl.configLoaded) {
                //load the configuration first.
                CAVNV.plugins.CONFIG.init(config);
                impl.configLoaded = true;

                // If it's frame mode then init FrameMonitor plugin.
                if (typeof w.cav_iframe != 'undefined') {
                    CAVNV.insideFrame = true;
                    CAVNV.plugins.IframeMonitor.init();
                    return;
                }
                //Check if config does not contain config_url then do not return. It is done to handle inline config. 
                if (config.CONFIG && config.CONFIG.config_url)
                    return;
                else {
                    //It is case of inline config. 
                    CAVNV.inlineConfig = true;
                }
            }

            //Now once configuration will be loaded. it will be called again.
            //CAVNV.cav_nv_log_tm('ConfigLoadEnd');

            var i, k, properties = ["beacon_url", "site_domain", "rsaEncryption", "user_ip", "pagedump_url", "log_level", "blacklist_id", "customMetrics", "getChannel", 'maxCookieSize', 'dataFlushInterval', 'loginIDLowerCase', 'pageReadyValidator', 'pageReadyIndicator', 'remoteConfig', 'blacklistCookies', 'whitelistCookies', 'sessionFlags', 'resourceTiming', 'resourceTimingFilter', 'uaCaptureResource', 'protocolVersion', 'messageVersion', 'sessionFilter', 'sessionExpiry', 'maxSessionDuration', 'encryptedElement', 'customData', 'userSegments', 'imgUrlPattern', 'getStoreData', 'jcpStoreStats', 'logNDSessionAlways', 'ndHeader', 'wpdEvent', 'monitorIframe', 'visitorInfo', 'enableWorker', 'autoNDInstr', 'enableCssSelector', 'ocxFilter', 'sca', 'unloadLC', 'getCartInfo', 'cookieLess', 'eDataPattern', 'pageFilter', 'pingTimer', 'retryPDWithIDB', 'SW'];

            for (i = 0; i < properties.length; i++) {
                if (config[properties[i]] !== undefined) {
                    impl[properties[i]] = config[properties[i]];
                }
            }

            CAVNV.nvCounter = 0;

            CAVNV.ocxCounter = 0;

            CAVNV.protocolVersion = impl.protocolVersion || 1/*default version*/;

            CAVNV.messageVersion = impl.messageVersion || 0/*default version*/;

            CAVNV.rsaEncryption = impl.rsaEncryption || false;

            CAVNV.cookieLess = impl.cookieLess || false;


            //add beacon_url in CAVNV object.
            if (impl.beacon_url) CAVNV.beacon_url = impl.beacon_url;

            //Check if ssl_beacon_url is given then check for origin if it is https then use that.
            if (impl.ssl_beacon_url && CAVNV.window.document.location.protocol == "https:")
                CAVNV.beacon_url = impl.ssl_beacon_url;

            //Check for beacon url cookie.
            var burl = CAVNV.utils.getCookie('CavBU');
            if (burl) {
                //Set the prev one.
                CAVNV.__beacon_url = CAVNV.beacon_url;
                burl = burl.split('|');
                CAVNV.beacon_url = burl[0];
                if (burl[1] && CAVNV.window.document.location.protocol == "https:")
                    CAVNV.beacon_url = burl[1];
            }

            CAVNV.logNDSessionAlways = false;
            if (typeof impl.logNDSessionAlways == "boolean")
                CAVNV.logNDSessionAlways = impl.logNDSessionAlways;

            CAVNV.ndHeader = "X-CavNV";
            if (typeof impl.ndHeader == "string")
                CAVNV.ndHeader = impl.ndHeader;

            CAVNV.wpdEvent = false;
            if (typeof impl.wpdEvent == "boolean")
                CAVNV.wpdEvent = impl.wpdEvent;

            CAVNV.monitorIframe = false;
            if (typeof impl.monitorIframe == "boolean")
                CAVNV.monitorIframe = impl.monitorIframe;

            CAVNV.retryPDWithIDB = (typeof impl.retryPDWithIDB === 'boolean') ? impl.retryPDWithIDB : false;


            //add log level;
            if (impl.log_level) CAVNV.log_level = impl.log_level;

            //set CAVNV.pageIndex as it is required by each plugins and apis.
            CAVNV.plugins.CONFIG.setPageIndex(config.CONFIG);

            //add blacklisted id.
            CAVNV.blacklist_id = [];
            if (Object.prototype.toString.call(impl.blacklist_id) === '[object Array]')
                CAVNV.blacklist_id = impl.blacklist_id;

            CAVNV.blacklistCookies = [];
            if (Object.prototype.toString.call(impl.blacklistCookies) === '[object Array]')
                CAVNV.blacklistCookies = impl.blacklistCookies;

            CAVNV.whitelistCookies = [];
            if (Object.prototype.toString.call(impl.whitelistCookies) === '[object Array]')
                CAVNV.whitelistCookies = impl.whitelistCookies;

            CAVNV.imgUrlPattern = [];
            if (Object.prototype.toString.call(impl.imgUrlPattern) === '[object Array]')
                CAVNV.imgUrlPattern = impl.imgUrlPattern;

            CAVNV.session_filter_pct = [100, 100, 100, 100];

            if (boomr.utils.isArray(impl.sessionFilter) && impl.sessionFilter.length == 4) {
                CAVNV.session_filter_pct = impl.sessionFilter;
            }
            else if (impl.sessionFilter && impl.sessionFilter.hasOwnProperty("spct")) {
                var c = 0, b = [];
                for (i in impl.sessionFilter) {
                    b[c] = impl.sessionFilter[i];
                    c++;
                }
                if (c == 4) CAVNV.session_filter_pct = b;
            }

            CAVNV._uS = [];
            if (impl.userSegments != undefined && Object.prototype.toString.call(impl.userSegments) === '[object Array]') {
                CAVNV._uS = impl.userSegments;
            }


            //Default visitor Expiry time
            CAVNV.visitorExpiryTime = 2592000;
            CAVNV.visitorInfo = false;
            if (typeof impl.visitorInfo == "boolean")
                CAVNV.visitorInfo = impl.visitorInfo;

            CAVNV.unloadLC = false;
            if (typeof impl.unloadLC == "boolean")
                CAVNV.unloadLC = true;

            CAVNV.eDataPattern = [];
            if (typeof impl.eDataPattern == "object")
                CAVNV.eDataPattern = impl.eDataPattern;

            //Default expiry time 
            CAVNV.sessionExpiryTime = 1800; //msec; 
            if (!isNaN(impl.sessionExpiry))
                CAVNV.sessionExpiryTime = impl.sessionExpiry;

            CAVNV.maxSessionDuration = 7200;
            if (!isNaN(impl.maxSessionDuration))
                CAVNV.maxSessionDuration = impl.maxSessionDuration;

            CAVNV.pageFilter = { pctA: 100, ocxPctA: 100, pctU: 100, ocxPctU: 100, o: [{ pi: [-1], pct: 100, ocxPct: 100 }] };
            if (typeof impl.pageFilter == "object")
                CAVNV.pageFilter = impl.pageFilter;

            //set session flag list(CavSFList).
            var s = impl.sessionFlags || impl.SessionFlags;
            if (Object.prototype.toString.call(s) === '[object Array]') {
                //first get max index of system flags.
                var max = 0, i;
                for (i in CavSFList) {
                    if (CavSFList.hasOwnProperty(i) && max < parseInt(CavSFList[i]))
                        max = parseInt(CavSFList[i]);
                }
                //now add these new flags.
                for (i = 0; i < s.length; i++)
                    CavSFList[s[i]] = ++max;
            }


            //set loginIDLowerCase flag. 
            CAVNV.loginIDLowerCase = true;
            if (typeof impl.loginIDLowerCase == 'boolean')
                CAVNV.loginIDLowerCase = impl.loginIDLowerCase;

            /******Added for JCP Store Stats*******/
            CAVNV.jcpStoreStats = false;
            if (typeof impl.jcpStoreStats == 'boolean')
                CAVNV.jcpStoreStats = impl.jcpStoreStats;

            //TODO: verify if valid type given or not.
            CAVNV.customMetrics = [];
            if (Object.prototype.toString.call(impl.customMetrics) === '[object Array]') {
                for (var z = 0; z < impl.customMetrics.length; z++) {
                    //add only if it has all valid fields.
                    //check if encode flag is not present then we need to set that false.
                    if (typeof impl.customMetrics[z].encode == 'number')
                        impl.customMetrics[z].encode = (impl.customMetrics[z].encode) ? true : false;
                    if (typeof impl.customMetrics[z].encode != 'boolean')
                        impl.customMetrics[z].encode = false;

                    ((typeof impl.customMetrics[z].name === 'string') && boomr.utils.isNumber(impl.customMetrics[z].id) && (typeof impl.customMetrics[z].type === 'string')) && CAVNV.customMetrics.push(impl.customMetrics[z]);
                }
            }

            //callback to get channel.
            if (typeof impl.getChannel === 'function')
                CAVNV.getChannel = impl.getChannel;

            if (typeof impl.getStoreData === 'function')
                CAVNV.getStoreData = impl.getStoreData;

            CAVNV.maxCookieSize = 1024; //default values.
            if ((typeof impl.maxCookieSize !== 'undefined') && boomr.utils.isNumber(impl.maxCookieSize))
                CAVNV.maxCookieSize = parseInt(impl.maxCookieSize);

            CAVNV.dataFlushInterval = 10000; //10sec. //default values. 
            if (typeof impl.dataFlushInterval !== 'undefined' && boomr.utils.isNumber(impl.dataFlushInterval))
                CAVNV.dataFlushInterval = parseInt(impl.dataFlushInterval) * 1000; //convert into msec.

            //In JCP case configuration was in two place. So we have added this flag to be assure that remote Config is done.
            CAVNV.remoteConfigDone = true;
            if (typeof impl.remoteConfig === 'boolean' && impl.remoteConfig == true)
                CAVNV.remoteConfigDone = false;

            CAVNV.resourceTiming = false;
            //Check if we have resourceTiming support.
            if (w.performance && (w.performance.getEntriesByType || w.performance.webkitGetEntriesByType) || w.NVResourceCollector)
                CAVNV.resourceTiming = true;

            if (impl.resourceTiming == false) CAVNV.resourceTiming = false;

            //format: {mode: <enable/disable true/false>, pct: <% of percentage>} 
            //TODO: validate the resourceTimingFilter
            CAVNV.resourceTimingFilter = { mode: true, maxPageLoadTime: 10000, pct: 10 }
            if (typeof impl.resourceTimingFilter == 'object') {
                CAVNV.resourceTimingFilter = impl.resourceTimingFilter;
            }

            impl.softNavGap = impl.softNavGap || 150;
            CAVNV.uaCaptureResource = false;
            if (typeof impl.uaCaptureResource === 'boolean')
                CAVNV.uaCaptureResource = impl.uaCaptureResource;

            //Format: [{id: , pageid: , mode: 0}] 
            CAVNV.encryptedElement = [];
            if (impl.encryptedElement)
                CAVNV.encryptedElement = impl.encryptedElement;

            CAVNV.customData = [];
            if (impl.customData)
                CAVNV.customData = impl.customData;

            //set timer to ping at desired interval
            var timer = 300000; //5 mins default
            CAVNV.ping = false;
            if (typeof impl.pingTimer == 'object') {
                if (impl.pingTimer.enabled) {
                    CAVNV.ping = true;
                    if (impl.pingTimer.timer) timer = impl.pingTimer.timer;
                    setInterval(CAVNV.letsPing, timer);
                }
            }

            //Check if session expired then clear session flag.
            var lat = boomr.get_session_flag('LastAccessTime');
            if (!lat || isNaN(lat) || ((new Date().getTime() - parseInt(lat)) > (CAVNV.sessionExpiryTime * 1000))) {
                //reset the LastAccessTime.
                CAVNV.utils.resetNVSession();
            }
            if (impl.SW && impl.SW.enabled == true) {
                if (!impl.SW.sw_url || !impl.SW.frame_url) {
                    CAVNV.error("Service Worker configuration: Either sw_url or frame_url is missing.");
                }
                else
                    boomr.register_sworker(impl.SW.sw_url);
            }

            //init IDB.
            if (CAVNV.retryPDWithIDB)
                if (IDB.init() == false)
                    CAVNV.retryPDWithIDB = false;

            for (k in this.plugins) {
                //CAVNV.log('Checking for plugin ' + k);
                if (this.plugins.hasOwnProperty(k)) {
                    // config[pugin].enabled has been set to false
                    if (config[k] && config[k].hasOwnProperty("enabled") && config[k].enabled === false) {
                        CAVNV.log('plugin ' + k + ' disabled');
                        impl.disabled_plugins[k] = 1;
                        continue;
                    }
                    else if (impl.disabled_plugins[k]) {
                        delete impl.disabled_plugins[k];
                    }

                    // plugin exists and has an init method
                    if (typeof this.plugins[k].init === "function") {
                        this.plugins[k].init(config);
                    }
                }
            }

            if (impl.handlers_attached) {
                return this;
            }

            // The developer can override onload by setting autorun to false
            if (!impl.onloadfired && (config.autorun === undefined || config.autorun !== false)) {
                if (d.readyState && d.readyState === "complete") {
                    this.setImmediate(CAVNV.page_ready, null, null, CAVNV);
                }
                else {
                    if (w.onpagehide || w.onpagehide === null) {
                        boomr.utils.addListener(w, "pageshow", function () { boomr.setImmediate(CAVNV.page_ready); });
                    }
                    else {
                        boomr.utils.addListener(w, "load", function () { boomr.setImmediate(CAVNV.page_ready); });
                    }
                }
            }

            boomr.utils.addListener(w, "DOMContentLoaded", function () {
                impl.fireEvent("dom_loaded");
            });

            (function () {
                // visibilitychange is useful to detect if the page loaded through prerender
                // or if the page never became visible
                // http://www.w3.org/TR/2011/WD-page-visibility-20110602/
                // http://www.nczonline.net/blog/2011/08/09/introduction-to-the-page-visibility-api/
                var fire_visible = function () {
                    impl.fireEvent("visibility_changed");
                };
                if (d.webkitVisibilityState) {
                    boomr.utils.addListener(d, "webkitvisibilitychange", fire_visible);
                }
                else if (d.msVisibilityState) {
                    boomr.utils.addListener(d, "msvisibilitychange", fire_visible);
                }
                else if (d.visibilityState) {
                    boomr.utils.addListener(d, "visibilitychange", fire_visible);
                }

                boomr.utils.addListener(d, "mouseup", impl.onclick_handler);

                if (!w.onpagehide && w.onpagehide !== null) {
                    // This must be the last one to fire
                    // We only clear w on browsers that don't support onpagehide because
                    // those that do are new enough to not have memory leak problems of
                    // some older browsers
                    boomr.utils.addListener(w, "unload", function () {
                        CAVNV.window = w = null;
                    });
                }
            }());

            //fire event so other part of configuration can be loaded.
            boomr.utils.triggerEvent(CAVNV.window, "nvconfigdone");

            impl.handlers_attached = true;

            /*//subscribe to flush sbqueue.
            CAVNV.subscribe('page_unload', function() {
              CAVNV.sbqueue.flush();
            });*/

            return this;
        },

        // The page dev calls this method when they determine the page is usable.
        // Only call this if autorun is explicitly set to false
        //Note: page_ready2 will have more preferene over page_ready.
        page_ready: function () {
            if (impl.onloadfired) {
                return this;
            }

            if (impl.pageReadyIndicator && impl.pageReadyIndicator.length > 0) {
                boomr.startlistenersForIndicator();
            }
            //if pageReadyValidator given then we need to check with that.
            if (typeof impl.pageReadyValidator === 'function' || (impl.pageReadyIndicator && impl.pageReadyIndicator.length > 0)) {
                var cb = function () {
                    try {
                        if (impl.pageReadyValidator)
                            return impl.pageReadyValidator.call(CAVNV.window);
                        if (impl.pageReadyIndicator)
                            return boomr.startPageReadyIndicators();// for document elements check
                    }
                    catch (e) {
                        //if any exception occure then we will return false.
                        return false;
                    }
                }
                //validate for each 100ms. And if for two continious iteration we got pass. then page is ready.
                var count = 0;
                if (cb() === true) count++;
                var prvTimer = setInterval(function () {
                    if (impl.onloadfired) clearInterval(prvTimer);
                    if (cb() === true) count++;
                    else count = 0;
                    if (count >= 2) {
                        clearInterval(prvTimer);
                        impl.fireEvent("page_ready2");
                        impl.fireEvent("page_ready");
                        impl.onloadfired = true;
                    }
                }, 100);
            }
            else {
                impl.fireEvent("page_ready2");
                impl.fireEvent("page_ready");
                impl.onloadfired = true;
                impl.unloadfired = false;

            }
            return this;
        },

        setImmediate: function (fn, data, cb_data, cb_scope) {
            var cb = function () {
                try {
                    fn.call(cb_scope || null, data, cb_data || {});
                } catch (e) { }
                cb = null;
            };

            if (w.setImmediate) {
                w.setImmediate(cb);
            }
            else if (w.msSetImmediate) {
                w.msSetImmediate(cb);
            }
            else if (w.webkitSetImmediate) {
                w.webkitSetImmediate(cb);
            }
            else if (w.mozSetImmediate) {
                w.mozSetImmediate(cb);
            }
            else {
                setTimeout(cb, 10);
            }
        },
        page_unload: function () {
            impl.unloadfired = true;
            impl.fireEvent("page_unload2");
            impl.fireEvent("page_unload");
        },

        updateNDPI: function () {
            //At this point set the new Cookie.
            //Check if CAVNV.pageInstance is set then update.
            //Note: will be updated only if CavSID cookie exist, if not then remove the alreay set cookie.
            var c = CAVNV.utils.getNVCookie(CAVNV.SID);
            if (!c) return;

            if (typeof CAVNV.pageInstance == "number") {
                if (CAVNV.config.CrossOrigin.enabled == false) {
                    //Note: pageInstance would have been updated in case user use using multitab. 
                    var pageInstance = CAVNV.utils.getNVCookie(CAVNV.PI);
                    CAVNV.utils.updateNVCookie(CAVNV.NDPI, pageInstance);
                    return;
                }
                else {
                    //First sync the cookie then only update that.  
                    CAVNV.syncCOCookie(function () {
                        var pageInstance = CAVNV.utils.getNVCookie(CAVNV.PI);
                        CAVNV.utils.updateNVCookie(CAVNV.NDPI, pageInstance);
                    }, CAVNV);
                    return;
                }
            }
        },

        subscribe: function (e_name, fn, cb_data, cb_scope) {
            var i, h, e, unload_handler;

            if (!impl.events.hasOwnProperty(e_name)) {
                return this;
            }

            e = impl.events[e_name];

            // don't allow a handler to be attached more than once to the same event
            for (i = 0; i < e.length; i++) {
                h = e[i];
                if (h[0] === fn && h[1] === cb_data && h[2] === cb_scope) {
                    return this;
                }
            }

            //As now all the callbacks will be removed once they fired.
            // attaching to page_ready after onload fires, so call soon
            if (e_name === 'page_ready' && impl.onloadfired) {
                this.setImmediate(fn, null, cb_data, cb_scope);
                return this;
            }

            e.push([fn, cb_data || {},
                cb_scope || null]);

            // Attach unload handlers directly to the window.onunload and
            // window.onbeforeunload events. The first of the two to fire will clear
            // fn so that the second doesn't fire. We do this because technically
            // onbeforeunload is the right event to fire, but all browsers don't
            // support it.  This allows us to fall back to onunload when onbeforeunload
            // isn't implemented
            //Note: we will set listener only for first unload callback.
            if ((e_name === 'page_unload' || e_name === 'page_unload2') && e.length == 1) {
                // pagehide is for iOS devices
                // see http://www.webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/
                if (w.onpagehide || w.onpagehide === null) {
                    boomr.utils.addListener(w, "pagehide", CAVNV.page_unload);
                }
                else {
                    boomr.utils.addListener(w, "unload", CAVNV.page_unload);
                }
                boomr.utils.addListener(w, "beforeunload", function () {
                    CAVNV.updateNDPI();
                    CAVNV.page_unload();
                });
            }

            return this;
        },

        addVar: function (name, value) {
            if (typeof name === "string") {
                impl.vars[name] = value;
            }
            else if (typeof name === "object") {
                var o = name,
                    k;
                for (k in o) {
                    if (o.hasOwnProperty(k)) {
                        impl.vars[k] = o[k];
                    }
                }
            }
            return this;
        },

        removeVar: function (arg0) {
            var i, params;
            if (!arguments.length) {
                return this;
            }

            if (arguments.length === 1 && Object.prototype.toString.apply(arg0) === "[object Array]") {
                params = arg0;
            }
            else {
                params = arguments;
            }

            for (i = 0; i < params.length; i++) {
                if (impl.vars.hasOwnProperty(params[i])) {
                    delete impl.vars[params[i]];
                }
            }

            return this;
        },

        //TODO: handle it carefully.
        modifyVar: function (arg, value) {
            if (impl.vars.hasOwnProperty(arg)) impl.vars[arg] = value;
        },

        check_and_set_dummy_sid: function () {
            //check if CavSID cookie not set then set a dummy SID.
            var sid = this.utils.getNVCookie(CAVNV.SID);
            var dummySID = "000000000000000000000";
            var lts = this.utils.updateNVCookie(CAVNV.LTS, lts);
            if (!lts) lts = 0;
            if (!sid) {
                this.utils.updateNVCookie(CAVNV.SID, dummySID); //, CAVNV.sessionExpiryTime);
                //This will prevent any data to be sent.
                CAVNV.sid = 0;
                this.utils.updateNVCookie(CAVNV.PI, 1);
                CAVNV.pageInstance = 1;
            }
            else {
                //update the pageinstance.
                var pi = this.utils.getNVCookie(CAVNV.PI);
                pi++;
                this.utils.updateNVCookie(CAVNV.PI, pi);
                CAVNV.sid = sid;
                CAVNV.pageInstance = pi;
            }
            // check and update android if bridge exist.
            if (!!CAVNV.window.NBridge)
                CAVNV.window.NBridge.getAppParam(JSON.stringify({ 'sid': sid.toString(), 'PI': pageInstance.toString(), 'lts': lts.toString(), 'snapshotInstance': CAVNV.snapshotInstance().toString() }));
            if (!!CAVNV.window.webkit && !!CAVNV.window.webkit.messageHandlers.appNativeSync)
                CAVNV.window.webkit.messageHandlers.appNativeSync.postMessage(JSON.stringify({ 'sid': sid.toString(), 'pi': pageInstance.toString(), 'lts': lts.toString(), 'snapshotInstance': CAVNV.snapshotInstance().toString() }));
            CAVNV.lts = lts;
            CAVNV.pageIndex = impl.vars.pageIndex;
            //set last access time.
            CAVNV.set_session_flag('LastAccessTime', new Date().getTime());
            CAVNV.set_session_flag('LocationId', CAVNV.location_id);
            CAVNV.set_session_flag('AccessTypeId', CAVNV.access_type_id);
            CAVNV.set_session_flag('GeoId', CAVNV.geo_id);
        },

        validate_timing: function () {
            if (impl.vars['nt_time_to_load'] > 3600000 || impl.vars['nt_time_to_DOC'] > 3600000) {
                boomr.modifyVar('nt_red_count', -1);
                boomr.modifyVar('nt_red_time', -1);
                boomr.modifyVar('nt_app_cache_time', -1);
                boomr.modifyVar('nt_fetch_time', -1);
                boomr.modifyVar('nt_dns_time', -1);
                boomr.modifyVar('nt_con_time', -1);
                boomr.modifyVar('nt_secure_con_time', -1);
                boomr.modifyVar('nt_first_byte_time', -1);
                boomr.modifyVar('nt_res_time', -1);
                boomr.modifyVar('nt_unload_time', -1);
                boomr.modifyVar('nt_dom_time', -1);
                boomr.modifyVar('nt_dom_content_load_time', -1);
                boomr.modifyVar('nt_load_time', -1);
                boomr.modifyVar('nt_time_to_load', -1);
                boomr.modifyVar('nt_time_to_DOC', -1);
                boomr.modifyVar('nt_fp', -1);
                boomr.modifyVar('nt_fcp', -1);
            }
        },

        processUserSegments: function () {
            //get match selector method.
            var div = document.createElement("div");
            var matchFn = "function" == typeof div.webkitMatchesSelector ? "webkitMatchesSelector" : "function" == typeof div.mozMatchesSelector ? "mozMatchesSelector" : "function" == typeof div.msMatchesSelector ? "msMatchesSelector" : null;

            function cookieRule(r) {
                //check for the cookie specified in arg 1. 
                var v = CAVNV.utils.getCookie(r.a1);
                if (!v) return false;
                //check if given pattern is regex.
                try {
                    var rx = new RegExp(r.a2);
                    if (rx.test(v)) return true;
                }
                catch (e) {
                    //complete match will be done.
                    if (v == r.a2) return true;
                }
                return false;
            }

            function urlRule(r) {
                //Note: arg1 will be regex for url. 
                //arg2 will be flag will indicate if consider compete path or not. 
                //check for complete path
                var l = CAVNV.window.location;
                try {
                    var rx = new RegExp(r.a1);
                    if (!r.a2)
                        return rx.test(l.pathname);
                    return rx.test(l.pathname + l.search);
                }
                //In this case it is mandatory to given valid regex.
                catch (e) { }
                return false;
            }

            function clickRule(r, ele) {
                //check if selector is matching for this element then return true.  
                if (ele.nodeType == Node.ELEMENT_NODE && ele[matchFn] && ele[matchFn](r.a1)) return true;
                return false;
            }

            function engagementRule(r, ele) {
                function isChild(p) {
                    if (p == ele) return true;
                    for (var z = 0; z < p.children; z++) {
                        if (isChild(p.children[z])) return true;
                    }
                    return false;
                }

                //Note: we evaluating the section only once. so if some element is being added at run time that will be ignored.  
                var d = CAVNV.window.document;
                try {
                    if (!r.es) r.es = d.querySelectorAll(r.a1)
                    for (var z = 0; z < r.es.length; z++) {
                        //check if current element is child for this parent.      
                        if (isChild(r.es[z])) return true;
                    }
                } catch (e) { r.es = []; }
                return false;
            }

            function applyRule(r, ele) {
                //check for their type    
                if (r.t == 0)
                    return cookieRule(r);
                else if (r.t == 1)
                    return urlRule(r);
                if (!ele) return false;
                //check for other rules. 
                if (r.t == 2)
                    return clickRule(r, ele);
                else if (r.t == 3)
                    return engagementRule(r, ele);
                return false;
            }

            //Note: this method wil be called for once. 
            function p(ele) {

                function isRuleDone(rid) {
                    for (var z = 0; z < appliedRules.length; z++) {
                        if (appliedRules[z] == rid) return true;
                    }
                    return false;
                }

                //Type of rules: 
                //0 - COOKIE, 1 - URL, 2 - CLICK, 3 - ENGAGEMENT  
                //all the history will kept in uSHistory session flag.
                //format: uMask:<comma seperated applied rules list>
                //eg. 1231|1:23:2
                var curSegHistory = CAVNV.get_session_flag("uSHistory");
                curSegHistory = curSegHistory || "0|";
                var d = curSegHistory.split("|");
                var mask = parseInt(d[0]);
                var prevMask = mask;
                var appliedRules = d[1].split(":");

                //now apply the rules. 
                var us;
                for (var z = 0; z < CAVNV._uS.length; z++) {
                    us = CAVNV._uS[z];
                    //first check if current session already marked for this segment then there is not need to process it again.      
                    if ((mask & Math.pow(2, us.id)) != 0)
                        continue;

                    //check for all the rules.
                    var status = true;
                    for (var y = 0; y < us.rules.length; y++) {
                        //check for rules id if already procesed then no need to check again.
                        var r = us.rules[y];
                        //check for pageIndex. 
                        if (!isRuleDone(r.id)) {
                            if (CAVNV.utils.pagePresentInList(r.p) && applyRule(r, ele)) {
                                //add this rule id into applied rules. 
                                appliedRules.push(r.id);
                            }
                            else
                                status = false;
                        }
                    }
                    //check if all the rules are done positivly then this segment is set.
                    if (status == true) {
                        mask |= Math.pow(2, parseInt(us.id));
                    }
                }
                //update mask if changed.  
                var history = mask + "|" + appliedRules.join(":");
                CAVNV.set_session_flag("uSHistory", history);
                if (mask != prevMask) {
                    //log this event. 
                    boomr.cav_nv_log_userSegment(mask);
                }
            }
            return p;
        }(),

        disableOcx: function () {
            CAVNV.plugins.DOMWATCHER2.stop();
            CAVNV.__uaEnabled = false;
            pendingDom = null;
            CAVNV.pendingSnapshot = {};
        },


        sendBeacon: function () {
            var k, url, img, nparams = 0;
            if ((CAVNV.window.NBridge || (!!CAVNV.window.webkit && !!CAVNV.window.webkit.messageHandlers.appNativeSync)) && !CAVNV.utils.getNVCookie(CAVNV.SID))
                return;
            CAVNV.debug("Checking if we can send beacon");

            //must be present 
            if (impl.vars.waiting) return;

            //check if iframe and parent communication done.
            //FIXME: Currently disabling code for iframe communication.
            //if(w.top !== w && CAVNV.parentComDone == false) return;

            // At this point someone is ready to send the beacon.  We send
            // the beacon only if all plugins have finished doing what they
            // wanted to do
            for (k in this.plugins) {
                if (this.plugins.hasOwnProperty(k)) {
                    if (impl.disabled_plugins[k]) {
                        continue;
                    }
                    if (!this.plugins[k].is_complete()) {
                        CAVNV.debug("Plugin " + k + " is not complete, deferring beacon send");
                        return this;
                    }
                }
            }

            if ((CAVNV.config.SW.enabled == true && !CAVNV.config.SW.complete)) return;

            // use d.URL instead of location.href because of a safari bug
            //if(w !== window) {
            //	impl.vars["if"] = "";
            //}
            // If we reach here, all plugins have completed
            impl.fireEvent("before_beacon", impl.vars);

            // Don't send a beacon if no beacon_url has been set
            // you would do this if you want to do some fancy beacon handling
            // in the `before_beacon` event instead of a simple GET request
            if (!CAVNV.beacon_url) {
                return this;
            }

            //if remoteConfig not done.
            if (CAVNV.remoteConfigDone != true) return this;

            //Check if filter flag is enable then return.
            //Apply Filter.

            var filter_stats = this.get_filter_flag();
            var page_filter = this.applyPageFilter();

            if (filter_stats.status == false || !page_filter.rum) {
                CAVNV.log('Session is filtered');
                //Check if new session and sid not set then set a dummy SID.
                CAVNV.first_beacon_sent = true;
                boomr.check_and_set_dummy_sid();
                CAVNV.sid = 0; //to restrict all the other data requests.
                // disable ocx also.
                CAVNV.disableOcx();
                return;
            }

            // If ocx is disabled then stop ocx related plugings. 
            if (!page_filter.ocx) {
                CAVNV.disableOcx();
            }

            //Check if it is hybrid app then first see if there is no running sessioninfo/pagedump request in native side.      
            if (CAVNV.window.NBridge) {
                if (CAVNV.window.NBridge.canSendTimingReq == false) {
                    CAVNV.timingBlocked = true;
                    return;
                }
            }
            //Check if it is IOS hybrid app then first see if there are no running sessioninfo/pagedump request in native side.
            if (!CAVNV.iosTriggered && !!CAVNV.window.webkit && !!CAVNV.window.webkit.messageHandlers.appNativeSync) {
                CAVNV.window.webkit.messageHandlers.appNativeSync.postMessage("canSendTiming");
                CAVNV.log("processCallBack timing blocked")
                CAVNV.iosTriggered = false;
                return;
            }
            CAVNV.iosTriggered = false;

            function sendOnloadMetrics() {

                var p = w.performance || w.msPerformance || w.webkitPerformance || w.mozPerformance;
                if (p && p.timing && p.navigation) {
                    var pt = p.timing;
                    if (pt.domComplete > 0 && impl.vars.nt_dom_time <= 0) { // not send yet
                        impl.vars.nt_dom_time = pt.domComplete - pt.domLoading;
                    }

                    if (impl.vars.nt_time_to_load <= 0 && pt.loadEventEnd > 0) {
                        impl.vars.nt_time_to_load = (pt.loadEventStart - pt.navigationStart);
                    }


                    CAVNV.logResourceTiming(false, true/*not to add main url again*/, true);
                    CAVNV.cav_nv_log_event('Timing', { "dom": impl.vars.nt_dom_time, "onload": impl.vars.nt_time_to_load, "prt": impl.vars.perceived_render_time, "bw": impl.vars.bandwidth });
                }

            }
            //FIXME: handle it properly.
            var p_tmp;
            if (CAVNV.loadTimeDone != true && (p_tmp = w.performance || w.msPerformance || w.webkitPerformance || w.mozPerformance)) {
                //update nt_load_time and nt_time_to_load. 
                var pt_tmp = p_tmp.timing;
                var curT = Date.now();
                nt_load_time = nt_time_to_load = nt_time_to_DOC = nt_dom_content_load_time = -1;

                if (pt_tmp.loadEventEnd > 0) {
                    nt_load_time = pt_tmp.loadEventEnd - pt_tmp.loadEventStart;
                    nt_time_to_load = (pt_tmp.loadEventStart - pt_tmp.navigationStart);
                }
                else
                    nt_load_time = curT - pt_tmp.navigationStart;

                if (pt_tmp.domContentLoadedEventEnd > 0) {
                    nt_time_to_DOC = pt_tmp.domContentLoadedEventStart - pt_tmp.navigationStart;
                    nt_dom_content_load_time = pt_tmp.domContentLoadedEventEnd - pt_tmp.domContentLoadedEventStart;
                }
                var nt_dom_time = -1;
                if (pt_tmp.domComplete > 0)
                    nt_dom_time = pt_tmp.domComplete - pt_tmp.domLoading;

                function getPT2(timing) {
                    var fp = p_tmp.getEntriesByName(timing);
                    if (fp.length > 0) {
                        return parseInt(Math.max(fp[0].startTime));
                    }
                    return -1;
                }


                //performance timing 2          
                nt_fp = getPT2("first-paint");
                nt_fcp = getPT2("first-contentful-paint");

                CAVNV.log("loadEventEnd time was not set, updating nt_load_time =  " + nt_load_time + " and nt_time_to_load " + nt_time_to_load);
                //modify vars.
                CAVNV.modifyVar("nt_load_time", nt_load_time);
                CAVNV.modifyVar("nt_time_to_load", nt_time_to_load);
                CAVNV.modifyVar("nt_time_to_DOC", nt_time_to_DOC);
                CAVNV.modifyVar("nt_dom_content_load_time", nt_dom_content_load_time);
                CAVNV.modifyVar("nt_dom_time", nt_dom_time);
                CAVNV.modifyVar("nt_fp", nt_fp);
                CAVNV.modifyVar("nt_fcp", nt_fcp);
                CAVNV.loadTimeDone = true;
            }

            boomr.processUserSegments();

            boomr.validate_timing();

            //Check if we have method for getCartInfo then call that. 
            if (!!impl.getCartInfo) {
                try {
                    var c = impl.getCartInfo.call(CAVNV.window);
                    if (c.length && c.length > 1) {
                        CAVNV.modifyVar('cartItem', c[0]);
                        CAVNV.modifyVar('cartValue', c[1]);
                    }
                } catch (e) { }
            }
            //send resource Timing. Only when enable.
            if (CAVNV.resourceTiming) {
                boomr.logResourceTiming(false);
                //Note: we will enable it for the duration for which we sending resource timing data.
                ResourceFailedDetector.stop();
            }

            /*
                  //TODO: remove this, just for debugging page load bug.
                  var p_tmp = w.performance || w.msPerformance || w.webkitPerformance || w.mozPerformance;
                  if(p_tmp != undefined && p_tmp.timing != undefined)
                    //CAVNV.cav_nv_log_tm('Window.Performance.Timing', JSON.stringify(p_tmp.timing).replace(/[\"\']/g, ''));
            */

            // if there are already url parameters in the beacon url,
            // change the first parameter prefix for the boomerang url parameters to &
            var url2 = [];

            for (k in impl.vars) {
                if (k == "waiting") continue;
                if (impl.vars.hasOwnProperty(k)) {
                    nparams++;

                    url2.push(

                        impl.vars[k] === undefined || impl.vars[k] === null ? '' : encodeURIComponent(impl.vars[k])

                    );

                }
            }

            if (CAVNV.config.enableCvrAllPages)
                CAVNV.subscribe('page_ready', function () { sendOnloadMetrics(); }, null, null);
            //CAVNV.cav_nv_log_tm('SendTimingStart');
            //create timing url.
            var lts_cookie = boomr.utils.getNVCookie(CAVNV.LTS);
            if (!lts_cookie) lts_cookie = 0;
            //page instance cookie, to handle https request.
            var pi_cookie = boomr.utils.getNVCookie(CAVNV.PI);
            if (!pi_cookie) pi_cookie = -1;
            else pi_cookie = parseInt(pi_cookie);
            //Issue: if we failed to get response of timing request then CavPI will not be updated. So it is better to update 
            //CavPI before sending timing request. After getting response of timing, CavPI will be updated.
            boomr.utils.updateNVCookie(CAVNV.PI, (pi_cookie < 0) ? 1 : (pi_cookie + 1)) /*null)*/;

            //timing url format: http://www.nvserver.com/nv?s=<21digitsid>&op=timing&pi=<pageinstance>&d=<timing>
            //timing data will be seperated by |
            //Note: beacon_url and sid will be added in send method.

            //url = "&p=" + CAVNV.protocolVersion +  "&op=timing&pi=" + pi_cookie + "&pid=" + CAVNV.pageIndex + "&d=" + url.join('|') + "&lts=" + lts_cookie;
            var url = "";
            if (CAVNV.plugins.SCA && CAVNV.config.SCA.enabled) {
                var auth = CAVNV.plugins.SCA.getAuth();
                if (auth) {
                    url += auth.a;
                    impl.RSAKey = auth.r;
                }
            }

            //Handling for JCPStoreStats.
            var data2 = "";
            var storeInfo = { store: -1, terminal: -1, associate: -1 };
            //get Store infomration.
            if (CAVNV.getStoreData) {
                storeInfo = CAVNV.getStoreData.call(window);
            }
            else if (CAVNV.jcpStoreStats) {
                //FIXME: later on move this in config as getStoreData.
                var jcpStoreCookie = CAVNV.utils.getCookie("DPReferralUser");
                if (jcpStoreCookie) {
                    //Format of DPReferralUser cookie.
                    //<Store no>::<Terminal no>::<ZipCode>::<associate no>::<??>::<Device type dept>::<Instance name>
                    //eg. 2622::800::75023::9999::96::P98::DTFINDEXPR 
                    //split cookie by '::'.
                    var jcpCookieFields = jcpStoreCookie.split('::');
                    if (jcpCookieFields.length) {
                        //add storeno and terminal no as data.
                        storeInfo.store = jcpCookieFields[0];
                        storeInfo.terminal = jcpCookieFields[1];
                        if (jcpCookieFields.length >= 4)
                            storeInfo.associate = jcpCookieFields[3];
                    }
                }
            }

            // will send the nav_start_time from js_agent to avoid the below issue:
            // useractions of previous page was coming more than the navigation start of next page.
            CAVNV.page_nav_start_time = -1;
            /*Not using this due to sending future time
            CAVNV.epochTime = parseInt(CAVNV.get_session_flag('EpochTime'));
            if(CAVNV.epochTime && !isNaN(CAVNV.epochTime))
              CAVNV.page_nav_start_time = CAVNV.nav_start_time - CAVNV.epochTime;
            */
            data2 = storeInfo.store + "|" + storeInfo.terminal + "|" + storeInfo.associate;
            //Will be needed in usertiming URL.
            CAVNV.store = storeInfo.store;
            CAVNV.terminal = storeInfo.terminal;

            //check if storeFilterApplied flag is set then set another parameter. 
            var sfa = "";
            if (!!CAVNV.get_session_flag('storeFilterApplied'))
                sfa = "&sfa=1";

            var fs = 0, ss = 0, ts = 0;
            if (CAVNV.config.uxScore && CAVNV.config.uxScore.enabled) {
                //get previous data and send it in timing req
                if (w.localStorage) {
                    var res = w.localStorage.getItem('UxS');
                    if (res) {
                        var n = res.split(':');
                        fs = n[0], ss = n[1], ts = n[2];
                        w.localStorage.removeItem('UxS');
                    }
                }
                this.getUxScore(impl.vars.nt_time_to_load / 1000, 0);
            }

            //getting updated data from nativeApp if android bridge exitst
            var androidSyncData;
            //Update Filter information.
            //adding channel for lib path info
            data2 = data2 + "|" + filter_stats.f_level + "|" + filter_stats.f_pct + '|' + 0 + "|" + CAVNV.channel + '|' + fs + '|' + ss + '|' + ts;
            url += "&p=" + CAVNV.protocolVersion + "&op=timing&pi=" + pi_cookie + "&CavStore=" + CAVNV.store + "&pid=" + CAVNV.pageIndex + "&d=" + url2.join('|') + "&lts=" + lts_cookie + sfa;
            url = url + "&d2=" + data2;

            CAVNV.log("CAVNV timing, Sending url: " + url);
            // only send beacon if we actually have something to beacon back
            if (!nparams)
                return;

            function send() {
                console.log("send CAVNV.SID ============", CAVNV.SID);
                //get sid cookie.
                var sid_cookie = boomr.utils.getNVCookie(CAVNV.SID);
                if (!sid_cookie || (sid_cookie.length != 21)) sid_cookie = "000000000000000000000";

                var _url = CAVNV.beacon_url + "?s=" + sid_cookie + url;
                //retrying thrice
                if (CAVNV.retryTiming > 2) {
                    CAVNV.retryTiming = 0;
                    if (navigator.sendBeacon) {
                        navigator.sendBeacon(_url)
                    }
                    return;
                }

                if (CAVNV.config.SW.enabled == true) {
                    boomr.sendReqViaWorker(_url, '', 'timing');
                    return;
                }

                //Now we will request for script.
                var tinyScript = document.createElement('script');
                tinyScript.type = 'text/javascript';
                tinyScript.async = true;
                //In IE we don't get onload for scripts loaded dynamically, so using onreadystatechange.
                //we are setting a flag and that flag will be on when we will get response for timing request.
                var tid = "timing_" + new Date().valueOf(); //because multiple timing request can be sent.
                var timing_done_callback = function () {
                    if (CAVNV[tid] === true) return;

                    CAVNV[tid] = true;
                    console.log("===================tinyScript ", __NV_SID__);
                    //Check if successful.
                    //In both the cases it should have some content. 
                    if (typeof __NV_SID__ == "undefined") {
                        //In case if some other beacon url set then try to send on that url.
                        if (CAVNV.__beacon_url && CAVNV.__beacon_url != CAVNV.beacon_url) {
                            //try with master hpd with sid 0..
                            CAVNV.beacon_url = CAVNV.__beacon_url;
                            //FIXME: in case of failure it should remove CavBU cookie.
                            CAVNV.utils.removeCookie('CavBU');
                            //Note: In this case we will loose custom session flags, becasue CavSF will also be removed.
                            CAVNV.utils.resetNVSession();
                            send();
                            return;
                        }
                        else {
                            send();
                            CAVNV.retryTiming++;
                        }
                    }
                    else
                        CAVNV.retryTiming = 0;
                    CAVNV.log('Netvision, timing request with id = ' + tid + ' loaded' + 'and snapshot Instance is : ' + CAVNV.snapshotInstance);
                    //CAVNV.cav_nv_log_tm('SendTimingEnd');
                    //now set a timer this will continue to check if page is reay to load.
                    CAVNV.log("typeof:" + (typeof impl.pageReadyValidator));

                    CAVNV.subscribe("page_ready", function () {
                        boomr.check_and_send_doc_html();
                        boomr.send_custom_metrices();
                    }, null, null);
                    
                };

                tinyScript.onload = timing_done_callback;
                //to handle error case.
                tinyScript.onerror = timing_done_callback;
                //For IE.
                tinyScript.onreadystatechange = function () {
                    console.log("this.readyState============", this.readyState);
                    if (this.readyState == 'complete' || this.readyState == 'loaded') {
                        timing_done_callback();
                    }
                };
                tinyScript.src = _url;
                document.body.appendChild(tinyScript);
            }

            console.log("send msg start");
            //Send the request.
            send();
            console.log("send msg end");
            //to indicate that first beacon done.
            CAVNV.first_beacon_sent = true;
            if (CAVNV.ping)
                CAVNV.letsPing();
            return this;
        },
        //there can be any number of session flags(each will have a index), these will be stored in cookie CavSF. 
        get_session_flag: function (s) {
            //check if valid session flag.
            if (!CavSFList.hasOwnProperty(s)) return null;
            var si = parseInt(CavSFList[s]);

            //get CavSF cookie.
            var c = boomr.utils.getCookie("CavSF");
            if (!c) return null;
            var ca = c.split(',');

            //value not set. 
            if (si >= ca.length) return null;
            if (ca[si].indexOf('cavnvComplete') != -1) ca[si] = ca[si].substr(13);
            return ca[si];
        },
        set_session_flag: function (s, v) {
            if (!CavSFList.hasOwnProperty(s) || typeof v == undefined || v == null) return null;
            var si = parseInt(CavSFList[s]);

            var c = boomr.utils.getCookie("CavSF");
            var ca = c ? c.split(',') : [];
            ca[0] = ca[0] || 'cavnvComplete'; //for iOS tab safari. we are setting first val default. it doesn't accept , in beginning of cookie
            //set this new value in this array.
            ca[si] = v.toString();
            var i = 0;
            for (var k in CavSFList) {
                if (CavSFList.hasOwnProperty(k)) {
                    i = parseInt(CavSFList[k]);
                    ca[i] = ca[i] || '';
                }
            }
            //set this cookie.

            //Note: this session flag will be cleared on expiry time.
            //TODO: pass expiry time in 30 minute
            boomr.utils.setCookie('CavSF', ca.toString(), CAVNV.sessionExpiryTime);
            if (CAVNV.config.CrossOrigin.enabled) {
                CAVNV.updateCookie('CavSF', ca.toString());
            }
            return v;
        },

        is_new_session: function () {
            //Check if SID is set.
            var sid = boomr.utils.getNVCookie(CAVNV.SID);
            if (!sid) {
                return true;
            }
            //TODO: check for some other parameters.
            return false;
        },
        applyPageFilter: function () {
            //apply filter for all pages if given
            var r = parseInt(Math.random() * 100), F = CAVNV.pageFilter, pct = 100, pi = CAVNV.pageIndex, ocxPct = 100;

            if (!F) return false;

            //get pct. 
            //Check for all 
            if (!isNaN(F.pctA)) pct = F.pctA;
            if (!isNaN(F.ocxPctA)) ocxPct = F.ocxPctA;

            //Check for others. 
            if (pi == -1) {
                if (!isNaN(F.pctU)) pct = F.pctU;
                if (!isNaN(F.ocxPctU)) ocxPct = F.ocxPctU;
            }

            //Check for valid pages 
            if (pi != -1 && F.o) {
                for (var i = 0; i < F.o.length; i++) {
                    if (F.o[i].pi.indexOf(pi) != -1 && !isNaN(F.o[i].pct)) {
                        pct = F.o[i].pct;
                        if (!isNaN(F.o[i].ocxPct)) ocxPct = F.o[i].ocxPct;
                        break;
                    }
                }
            }

            var o = { rum: false, ocx: false };
            if (r < pct) {
                o.rum = true;
                r = parseInt(Math.random() * 100);
                if (r < ocxPct)
                    o.ocx = true;
            }

            return o;
        },
        //return true if filtered in else false.
        //will return this object {status: <true/false>, 'f_level': <filter level>, 'f_pct': <filter percentage>}
        //session_filter_flag
        // <state>|<filter applied>|<filter pct>
        // state - current state.
        // filter applied - > 0 . this will be level of filter. session -1 page -2
        //filter pct  - filter pct.
        //Note: once session is marked as blacklisted on session flag. It will not be considered.
        get_filter_flag: function () {
            var s, sa, f_pct, r;
            //First check for session flag. And if not pass then try for page level filter.
            if (boomr.is_new_session()) {
                var prev_state = CAVNV.BROWSER_STATE;
                //reset SessionFilter flag.
                //Note: don't reset the session state, so first check for state.
                s = this.get_session_flag('SessionFilter');
                if (s)
                    sa = s.split(':');
                if (s && sa.length == 3 && (parseInt(sa[0]) >= this.BROWSER_STATE && parseInt(sa[0]) <= this.BUYER_STATE))
                    prev_state = parseInt(sa[0]);

                //Check for session filter.
                //Check for configuration.
                f_pct = CAVNV.session_filter_pct[0];

                //apply this fitler.
                r = parseInt(Math.random() * 100);
                if (r < f_pct) {
                    //set session filter.
                    this.set_session_flag('SessionFilter', prev_state + ":0:0");
                    return { status: true, f_level: 1, f_pct: CAVNV.session_filter_pct[0] };
                }
                else {
                    //set filter.
                    this.set_session_flag('SessionFilter', '1:1:0');
                    return { status: false };
                }
            }

            //get session flag.
            s = this.get_session_flag('SessionFilter');
            //Format: <SessionStat>:<FilterApplied>:<FilterResult>

            //if cookie is not set at all then set default value. 
            if (!s) {
                s = "1:0:0";
                this.set_session_flag('SessionFilter', s);
            }

            sa = s.split(':');

            //Check if garbage value.
            if (!s || sa.length != 3 || (parseInt(sa[0]) < this.BROWSER_STATE || parseInt(sa[0] > this.BUYER_STATE))) {
                //reset the state.
                //Note: if SessionFilter flag is invalid at this point then it filtered at session level.
                this.set_session_flag('SessionFilter', '1:1:0');
                sa = [1, 1, 0];
            }

            //get the current state.
            var state = sa[0];
            var filterApplied = !!parseInt(sa[1]);
            var filtered = !!parseInt(sa[2]);

            if (filterApplied) {
                if (filtered)
                    return { status: true, f_level: 2, f_pct: parseInt(sa[2]) };
                else
                    return { status: false };
            }

            //Check for configuration.
            f_pct = CAVNV.session_filter_pct[state];

            //apply this fitler.
            r = parseInt(Math.random() * 100);
            if (r < f_pct) {
                this.set_session_flag('SessionFilter', state + ':' + 2 + ':' + f_pct);
                return { status: true, f_level: 2, f_pct: f_pct };
            }

            this.set_session_flag('SessionFilter', state + ':' + 2 + ':' + 0);
            return { status: false };
        },

        getUxScore: function (value, flag) {
            //flag's value will be 0(page), 1(xhr), 2(useraction)
            var conf;
            if (flag == 0)
                conf = CAVNV.config.uxScore.Page;
            else if (flag == 1)
                conf = CAVNV.config.uxScore.XHR;
            else if (flag == 2)
                conf = CAVNV.config.uxScore.Click;

            //check condition, decide apdex and calculate sum
            //satisfied
            if (value >= conf.All.S[0] && value < conf.All.S[1])
                CAVNV.satis += 1;
            //tolerable
            else if (value < conf.All.T[1] && value >= conf.All.T[0]) {
                CAVNV.toler += 2;
            }
            //frustrating
            else if (value >= conf.All.F[0] && (!conf.All.F[1] || value < conf.All.F[1])) {
                CAVNV.frus += 3;
            }
            //TODO: decide else
            var d = CAVNV.frus + ':' + CAVNV.satis + ':' + CAVNV.toler;
            if (w.localStorage) {
                w.localStorage.setItem('UxS', d);
            }

        },
        //Export this Api.
        set_session_state: function (state) {
            state = parseInt(state);
            if (isNaN(state) || state < CAVNV.BROWSER_STATE || state > CAVNV.BUYER_STATE) {
                CAVNV.error("set_session_state: Invalid state " + state);
                return;
            }
            //If input state is less then current state then ...(0<--
            var c_sf = boomr.get_session_flag('SessionFilter');
            var sa;
            if (c_sf)
                sa = c_sf.split(':');
            //Check if garbage value.
            //TODO: review it again.
            if (!c_sf || sa.length != 3 || (parseInt(sa[0]) < CAVNV.BROWSER_STATE || parseInt(sa[0] > CAVNV.BUYER_STATE))) {
                //reset the state.
                CAVNV.set_session_flag('SessionFilter', state + ":" + 0 + ":" + 0);
                return;
            }
            var c_state = parseInt(sa[0]);
            if (c_state >= state) {
                CAVNV.error("set_session_state: Invalid state " + state + " and current state " + c_state);
                return;
            }
            //set the state and reset the filter flag. 
            //Note: if current session is marked as blacklist on session level then we will not reset filtered field.
            var filterApplied = parseInt(sa[1]);
            var filtered = !!parseInt(sa[2]);
            if (filterApplied == 1 && filtered == false) {
                CAVNV.set_session_flag('SessionFilter', state + ":1:0");
            }
            else {
                if (filtered)
                    CAVNV.set_session_flag('SessionFilter', state + ":2:" + parseInt([sa[2]]));
                else
                    CAVNV.set_session_flag('SessionFilter', state + ":0:0");
            }

            //update ocxFilter based upon state.
            if (CAVNV.config.ocxFilter.enabled == true && CAVNV.config.ocxFilter.dumpState) {
                var dumpState = CAVNV.config.ocxFilter.dumpState;
                for (var i = 0; i < dumpState.length; i++) {
                    if (dumpState[i] == state) {
                        CAVNV.set_session_flag('ocxFilter', 1);
                        CAVNV.ocxFilter = 1;
                        IDB.flush();
                    }
                }
            }

        },

        send_cookies_to_iframe: function () {
            //if it is not parent or iframePorts are empty then return  
            if (w.top !== w || CAVNV.iframePorts.length == 0) return;

            var sflag = "";
            if (CAVNV.sflag !== undefined && CAVNV.sflag !== null) sflag = CAVNV.sflag;

            var s = { sid: CAVNV.sid, sf: sflag, lts: CAVNV.cav_epoch_nav_start_time };
            var e;

            for (var z = 0; z < CAVNV.iframePorts.length; z++) {
                e = CAVNV.iframePorts[z];
                //update pageinstance.
                s.pi = CAVNV.pageInstance + CAVNV.pageInstanceCounter++;
                e.source.postMessage("cookiesResponse=" + JSON.stringify(s), e.origin);
            }
            //update the pageinstance cookie.
            //FIXME: check if we can update the cookie at unload.
            CAVNV.utils.updateNVCookie(CAVNV.PI, CAVNV.pageInstance + CAVNV.pageInstanceCounter);
        },
        sendReqViaWorker: function (url, data, module) {
            var workerFrame = w.document.querySelector('#swIframe');

            var u = workerFrame.src.split("/");
            var targetOrigin = u[0] + "//" + u[2];
            workerFrame.contentWindow.postMessage({
                opcode: "NV_FORWARD_REQUEST",
                url: url,
                data: data,
                module: module
            }, targetOrigin);
        },
        register_sworker: function (sw_url) {
            CAVNV.config.SW.complete = false;
            function onTimeout() {
                CAVNV.config.SW.complete = true;
                CAVNV.sendBeacon();
            }

            w.addEventListener('message', function (message) {

                var sid = CAVNV.utils.getNVCookie(CAVNV.SID);
                var pi = CAVNV.utils.getNVCookie(CAVNV.PI);
                var lts = CAVNV.utils.getNVCookie(CAVNV.LTS);

                console.log(new Date() + "SW: Message Received at window from iframe = " + JSON.stringify(message.data));
                //process response of service worker 
                if (message.data && message.data.opcode == "WORKER_INFO") {
                    var resp = message.data.curData.split("\n");
                    var params = [];
                    for (var i = 0; i < resp.length; i++) {
                        if (!resp[i] || !resp[i].length) continue;
                        params[i] = resp[i].split(' = ')[1].replace(/\"|;/g, "");
                    }

                    var swsid = params[0];
                    var swpi = params[1];
                    var swlts = params[3];

                    //if older then override with session params
                    if (!sid || (sid && ((sid == swsid && pi < swpi) || (sid != swsid && lts < swlts)))) {
                        CAVNV.utils.updateNVCookie(CAVNV.PI, message.data.curData.pi);
                        CAVNV.utils.updateNVCookie(CAVNV.SID, message.data.curData.sid);
                        CAVNV.utils.updateNVCookie(CAVNV.LTS, message.data.curData.lts);
                    }
                }
                console.log("================",message);
                if (message.data.opcode && message.data.opcode === 'response' && message.data.body && message.data.body.indexOf("__NV_SID__") != -1) {
                    //for timing
                    console.log(new Date() + " SWorker = " + message.data.status + " body " + message.data.body);
                    //parse the response to get sid, pi and lts. 
                    boomr.check_and_send_doc_html(message.data.body);
                    boomr.send_custom_metrices();
                    }
            })

            function fallback_to_normal() {
                CAVNV.config.SW.enabled = false;
                onTimeout();
            }
            // register worker.
            var dom = w.document.domain;
            var iframe = w.document.querySelector('#swIframe');
            if (CAVNV.config.CrossOrigin.enabled == true)
                dom = CAVNV.config.CrossOrigin.group;
            //send origin and details for cross origin 
            var msg = {
                opcode: "GET_DOC_ORIGIN",
                origin: dom,
                sw_url: sw_url
            };

            var u = dom.split('/');
            var targetOrigin = u[0] + "//" + u[2];

            if (!iframe) {
                function load_iframe() {
                    var iframe = w.document.createElement('Iframe');
                    iframe.id = "swIframe";
                    iframe.src = CAVNV.config.SW.frame_url;
                    var u = iframe.src.split('/');
                    var targetOrigin = u[0] + "//" + u[2];
                    iframe.style = "height:0;width:0"; //a hidden iframe
                    iframe.onload = function (e) {

                        var that = w.document.querySelector('#swIframe');
                        try {
                            //If message is already received then just return.
                            if (CAVNV.config.SW.complete == true) return;
                            //call sendBeacon here as WORKER_INFO does not send message if sessionParams is undefined.
                            onTimeout();
                            that.contentWindow.postMessage(msg, targetOrigin);
                        }
                        catch (err) {
                            //switching to normal
                            fallback_to_normal();
                        }
                    };
                    iframe.onerror = function () {
                        //switching to normal
                        fallback_to_normal();
                    };
                    var where;
                    if (w.document.body) {
                        where = w.document.body.getElementsByTagName('script')[0];
                        w.document.body.appendChild(iframe, where);
                    } else {
                        where = w.document.getElementsByTagName('script')[0];
                        where.parentNode.insertBefore(iframe, where);
                    }
                }
                //to identify frame failure case        
                var xhr = new CAVNV.utils.XHR("GET", CAVNV.config.SW.frame_url);
                if (xhr) {
                    xhr.onload = function () {
                        if (this.status != 200) fallback_to_normal();
                        else load_iframe();
                    }
                    xhr.onerror = function () {
                        //switching to normal
                        fallback_to_normal();
                    }
                    xhr.send();
                }
                else fallback_to_normal();

            }
            else {
                //TODO: check the case and its impact
                iframe.contentWindow.postMessage(msg, targetOrigin);
            }
        },
        //TODO: Check if we should keep worker alive or should kill once compression is done 
        // in worker , ocxFilter is kept 0, so that if worker does not have sid, it will send back to main thread. 
        // In worker , ocx filter can be passed as 0 , in following cases
        // 1. CAVNV.ocxFilter is 0 (main thread ocxFilter is 0)
        // 2. till the point when data sent to worker, CAVNV.sid is not set
        // In case , when ocx Filter is 0 , worker node will compress the data and will sent it back to main thread.
        init_worker: function () {
            var workerHandler = 'var stringToUtf8ByteArray=function(i){var g=[],j=0;for(var c=0;c<i.length;c++){var h=i.charCodeAt(c);if(h<128){g[j++]=h}else{if(h<2048){g[j++]=(h>>6)|192;g[j++]=(h&63)|128}else{if(((h&64512)==55296)&&(c+1)<i.length&&((i.charCodeAt(c+1)&64512)==56320)){h=65536+((h&1023)<<10)+(i.charCodeAt(++c)&1023);g[j++]=(h>>18)|240;g[j++]=((h>>12)&63)|128;g[j++]=((h>>6)&63)|128;g[j++]=(h&63)|128}else{g[j++]=(h>>12)|224;g[j++]=((h>>6)&63)|128;g[j++]=(h&63)|128}}}}return g};function compress(l){var p=stringToUtf8ByteArray(l);var m=new Zlib.Gzip(p);var i=m.compress();var n=i.length;var k=new Uint8Array(n);for(var o=0,j=n;o<j;o++){k[o]=i[o]}return k}function sendData(i,n,e,j,l){e=e||"CAVNV";var k=new XMLHttpRequest();if("withCredentials" in k){try{k.open("POST",i,true)}catch(m){console.error("CAVNV worker: Failed to open XMLHttpRequest for uri - "+i)}{k.withCredentials=true}}else{if(typeof XDomainRequest!="undefined"){k=new XDomainRequest();k.open("POST",i)}else{console.log("CAVNV worker: CORS is not support by Browser. Failed to send data");return}}k.onload=function(){};k.onerror=function(){console.error("CAVNV worker: Failed to send data. Module - "+e);postMessage({opcode:"send",params:{url:i,data:n,module:e,options:{contentType:j,contentEncoding:l}}})};if(j){k.setRequestHeader("Content-Type",j)}if(l){k.setRequestHeader("Content-Encoding",l)}k.send(n)}function handle_dom_request(g){if(!g.data||!g.url||!g.module){return false} var h=g.options||{};var f=compress(g.data);if(!f){return false}else{if(h.ocxFilter==0){postMessage({opcode:"send",params:{url:g.url,data:f,module:g.module,options:h}})}else{try{sendData(g.url,f,g.module,h.contentType,h.contentEncoding)}catch(a){console.info("CAVNV worker: Exception occurred in sending data from worker, sending compressed data through worker");postMessage({opcode:"send",params:{url:g.url,data:f,module:g.module,options:h}})}}}return true}onmessage=function(d){var f=d.data;if(f.opcode==undefined){return}switch(f.opcode){case"echo":console.log("Worker received msg - "+f.msg);postMessage({opcode:"ack",msg:"Worker received the message"});break;case"dom-data":var e=handle_dom_request(f.params);postMessage({opcode:"compressed",result:e});break;default:console.log("Invalid")}};';

            //Make data-uri.
            //Append ZlibStr 

            workerHandler = ZlibStr + '\n' + workerHandler;
            var workerUrl = CAVNV.utils.getBlobUrl(workerHandler);
            if (!workerUrl)
                return;

            var worker = null;
            try {
                worker = new Worker(workerUrl);
            }
            catch (e) {
                CAVNV.error('Failed to init worker, error - ' + e);
                return;
            }

            //Message Recieved from worker.
            worker.onmessage = function (event) {
                var msg = event.data;
                if (msg.opcode == "undefined")
                    return;
                switch (msg.opcode) {

                    case 'compressed':
                        {
                            CAVNV.log("Snapshot successfully Compressed and sent.");
                            break;
                        }
                    //Note: in this case worker can send some data to send through main thread.
                    /* Message format.
                      {
                                               "opcode": "dom-data",
                                                 "params": {
                                                 "url": url,
                                                 "data": src
                                                 }
                    
                                               }
                    */
                    case 'send':
                        {
                            CAVNV.log('CAVNV - message received from worker with opcode - ' + msg.opcode);
                            if (CAVNV.__uaEnabled == false) return;

                            var p = msg.params;
                            var options = p.options || {};

                            if (CAVNV.retryPDWithIDB && !CAVNV.sid) {
                                pendingDom = p.options;
                                pendingDom.data = p.data;
                                return;
                            }

                            //Check if url contains sid=undefined.
                            if (p.url.indexOf('s=undefined') != -1) {
                                pendingDom = p.options;
                                pendingDom.data = p.data;
                                return CAVNV.sendPendingDom();
                            }

                            if (CAVNV.ocxFilter == 0) {
                                IDB.post(CAVNV.sid, CAVNV.pageInstance, { url: p.url, module: p.module, data: p.data, contentType: options.contentType, contentEncoding: options.contentEncoding });
                            }
                            else {
                                // Store the data in DB if retry is enabled. 
                                CAVNV.utils.sendData(p.url, p.data, p.module, options.contentType, options.contentEncoding);
                            }
                            break;
                        }
                    default:
                        CAVNV.log('Worker - Invalid Msg');
                }

            };

            worker.onerror = function (e) {
                //TODO: Log the error properly.
                CAVNV.error('Error at worker - ' + e);
                CAVNV.worker.terminate();
                CAVNV.worker = null;
            }

            CAVNV.worker = worker;
        },

        send_dom_using_worker: function (src, url, module, options) {

            //Note: In case of IE worker willl not be applicable. 
            if (CAVUA.utils.isIE()) return false;

            //Check if worker is not init then innit first. 
            if (CAVNV.worker == null)
                boomr.init_worker();

            if (!CAVNV.worker)
                return false;

            //If protocol is not given in url then specify. That is needed inside worker 
            if (url.indexOf('http') != 0)
                url = CAVNV.window.document.location.protocol + url;

            url += "&ocxcounter=" + CAVNV.ocxCounter++ + "&nvcounter=" + CAVNV.nvCounter++;
            //TODO: 
            CAVNV.worker.postMessage({
                "opcode": "dom-data",
                "params": {
                    "url": url,
                    "data": src,
                    "module": module,
                    "options": options || {}
                }

            });
            return true;
        },
        sendPendingDom: function () {
            var url = CAVNV.beacon_url + "?s=" + CAVNV.sid + "&p=" + CAVNV.protocolVersion + "&op=pagedump&pi=" + CAVNV.pageInstance + "&CavStore=" + CAVNV.store + "&pid=" + CAVNV.pageIndex + "&d=" + CAVNV.pageIndex + "|" + pendingDom.capture_flag + "|" + CAVNV.snapshotInstance + "&lts=" + CAVNV.lts;
            if (CAVNV.ocxFilter == 0) {
                IDB.post(CAVNV.sid, CAVNV.pageInstance, { url: url, module: "pagedump", data: pendingDom.data, contentType: pendingDom.contentType, contentEncoding: pendingDom.contentEncoding });
            }
            else
                CAVNV.utils.sendData(url, pendingDom.data, "pagedump", pendingDom.contentType, pendingDom.contentEncoding);
            pendingDom = undefined;
        },

        send_dom: function (runtime, snapshotInstance, src, save) {
            if (!snapshotInstance)
                snapshotInstance = CAVNV.snapshotInstance;

            save = save || false;

            var update = false, diff = false;
            if (runtime) {
                update = true;
                diff = true;
            }
            var capture_flag = CAVNV.get_session_flag('Pagedump');
            if (isNaN(parseInt(capture_flag))) capture_flag = 2;
            //TODO: handle it properly.
            //In IE <= 9 Uint8Array not defined so unable to send compressed pagedump.
            //so send non-compressed pagedump.
            if (capture_flag == 2) {
                if (typeof Uint8Array == "undefined") capture_flag = 1;
            }

            //now send ajax request. 

            //CAVNV.cav_nv_log_tm('GetPagedumpStart');
            if (!src) {
                //check if DOMWATCHER2 is enabled then send body in json format.
                src = CAVNV.plugins.DOMWATCHER2.getDOM(update, diff);
            }




            if (src == null) {
                if (CAVNV.config.enableCvrAllPages) {
                    CAVNV.subscribe('page_ready', function () { CAVNV.send_dom(); }, null, null);
                }
                return false;
            }

            //Max Pagedump size is 2.5 MB. If it is more then that then do not send. 
            if (src.length > 2621440) {
                CAVNV.warn("Pagedump size is more than 2.5 MB. Discarding");
                CAVNV.plugins.DOMWATCHER2.stop();
                CAVNV.__uaEnabled = false;
                return false;
            }

            //Send pageIndex in snapshot url.
            //url format: /<beacon_url>?s=<sid>&op=pagedump&pi=<page instance>&d=<page id>|<cpf-flag>
            var url = CAVNV.beacon_url + "?s=" + CAVNV.sid + "&p=" + CAVNV.protocolVersion + "&op=pagedump&pi=" + CAVNV.pageInstance + "&CavStore=" + CAVNV.store + "&pid=" + CAVNV.pageIndex + "&d=" + CAVNV.pageIndex + "|" + capture_flag + "|" + snapshotInstance + "&lts=" + CAVNV.lts;
            // if inside frame then set frameId too.
            if (CAVNV.frameId != undefined) {
                url += ('&frameId=' + CAVNV.frameId);
            }
            CAVNV.log("url = " + url);

            //CAVNV.cav_nv_log_tm('GetPagedumpEnd');
            if (capture_flag == 1) {
                //CAVNV.cav_nv_log_tm('SendPagedumpStart');
                if (save && !CAVNV.sid) {
                    pendingDom = { data: src, capture_flag: capture_flag };
                    return;
                }

                if (CAVNV.ocxFilter == 0)
                    IDB.post(CAVNV.sid, CAVNV.pageInstance, { url: url, data: src, module: 'pagedump' });
                else {
                    //CAVNV.cav_nv_log_tm('SendPagedumpStart');
                    CAVNV.utils.sendData(url, src, "pagedump");
                }

            }
            else if (capture_flag == 2) {
                //Convert multibyte string into ascii string.so we can convert that properly into uint8array.
                var stringToUtf8ByteArray = function (str) {
                    // TODO(user): Use native implementations if/when available
                    var out = [], p = 0;
                    for (var i = 0; i < str.length; i++) {
                        var c = str.charCodeAt(i);
                        if (c < 128) {
                            out[p++] = c;
                        } else if (c < 2048) {
                            out[p++] = (c >> 6) | 192;
                            out[p++] = (c & 63) | 128;
                        } else if (
                            ((c & 0xFC00) == 0xD800) && (i + 1) < str.length &&
                            ((str.charCodeAt(i + 1) & 0xFC00) == 0xDC00)) {
                            // Surrogate Pair
                            c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
                            out[p++] = (c >> 18) | 240;
                            out[p++] = ((c >> 12) & 63) | 128;
                            out[p++] = ((c >> 6) & 63) | 128;
                            out[p++] = (c & 63) | 128;
                        } else {
                            out[p++] = (c >> 12) | 224;
                            out[p++] = ((c >> 6) & 63) | 128;
                            out[p++] = (c & 63) | 128;
                        }
                    }
                    return out;
                };

                //Check if worker is enabled then try to send with worker else from same thread. 
                if (CAVNV.config.enableWorker == true && typeof Worker != "undefined") {
                    //In case worker failed to initialized then we have to compress with main thread. 
                    var options = { ocxFilter: CAVNV.ocxFilter, capture_flag: capture_flag };

                    if (CAVNV.messageVersion == 1)
                        options = { contentType: 'applicable/json', contentEncoding: 'gzip/deflate', ocxFilter: CAVNV.ocxFilter, capture_flag: capture_flag };

                    // If retryPDWithIDB is enabled then we don't want to send pd via worker because worker can not handle retry
                    if (CAVNV.retryPDWithIDB || save)
                        options.ocxFilter = 0;
                    if (boomr.send_dom_using_worker(src, url, 'pagedump', options) == true)
                        return true;

                }

                var tt = new Date().getTime();
                var origLength = src.length;
                var uint = stringToUtf8ByteArray(src);
                var deflater = new Zlib.Gzip(uint);
                var out = deflater.compress();
                var bytesToSendCount = out.length;
                var bytesArray = new Uint8Array(bytesToSendCount);
                for (var i = 0, l = bytesToSendCount; i < l; i++) {
                    bytesArray[i] = out[i];
                }
                CAVNV.log('CAVNV Timing: pagedump compress - ' + (new Date().getTime() - tt) + ', uncompressed size - ' + origLength + ', compressed size - ' + bytesToSendCount + ', ratio - ' + (bytesToSendCount * 100) / origLength);

                //ArrayBuffer is deprecated in XMLHttpRequest.send(). Use ArrayBufferView instead.
                //FIXME: we will not get any exception in old browser which don't support ArrayBufferView.
                //CAVNV.cav_nv_log_tm('SendPagedumpStart');
                //xhr.send(bytesArray.buffer);
                //Note: in case of protocolVersion 1 we will send application/json header.
                var options = { url: url, data: bytesArray, module: "pagedump", contentType: CAVNV.messageVersion, capture_flag: capture_flag };
                if (CAVNV.messageVersion) {
                    options.contentType = "application/json";
                    options.contentEncoding = "gzip/deflate";
                }
                if (save && !CAVNV.sid) {
                    pendingDom = options;
                    return;
                }
                if (CAVNV.ocxFilter == 0) {
                    IDB.post(CAVNV.sid, CAVNV.pageInstance, options);
                }
                else {
                    CAVNV.utils.sendData(url, bytesArray, "pagedump", options.contentType, options.contentEncoding);
                }

                CAVNV.log("Sending data with bytesArray.buffer");
            }
        },
        pageIndicatorDone: function () {
            clearTimeout(boomr.timer); boomr.timer = -1;
            // reset click listener. 
            boomr.utils.removeListener(CAVNV.window, 'click', boomr.pageIndicatorDone);
            if (!CAVNV.first_beacon_sent) {
                impl.fireEvent("page_ready2");
                impl.fireEvent("page_ready");
                impl.onloadfired = true;
                impl.unloadfired = false;
                if (CAVNV.config.SPA.enabled && CAVNV.SPA) {
                    CAVNV.first_beacon_sent = true;
                    CAVNV.cav_nv_ajax_pg_end(CAVNV.SPA.url, null, CAVNV.SPA.e);
                    CAVNV.SPA = undefined;
                }
            }
        },
        startlistenersForIndicator: function () {
            boomr.timer = setTimeout(function () {
                //send request	
                if (!CAVNV.first_beacon_sent) {
                    CAVNV.info("PageReadyIndicator: Reached Timeout. Sending Beacon");
                    boomr.pageIndicatorDone();
                }
            }, 60000); //60 seconds

            boomr.utils.addListener(CAVNV.window, 'click', boomr.pageIndicatorDone);
        },
        startPageReadyIndicators: function () {

            //if timing has send through timeout/first click then return true
            if (CAVNV.first_beacon_sent) return true;
            var conf = CAVNV.config.pageReadyIndicator;

            try {
                var pNotPresent = 0;
                for (var j = 0; j < conf.length; j++) {
                    var key = conf[j];
                    var count = 0;
                    var matching = key.match;
                    if (!CAVNV.utils.pagePresentInList(key.pi)) {
                        pNotPresent++;
                        continue;
                    }

                    var rules = key.rules;
                    for (var k = 0; k < rules.length; k++) {//rules
                        var r = rules[k];
                        if (r.d) {// check for dom element	
                            if (r.v || r.v == "true") {
                                if (isVisible(r.d)) //if visible
                                    count++;
                            }
                            else if (!r.v || r.v == "false") { //if present 
                                if (checkDomSelector(r.d))
                                    count++;
                            }
                        }
                        if (r.i) {// check for image url
                            var img, data = CAVNV.window.document.getElementsByTagName("img");
                            for (img = 0; img < data.length; img++) {
                                if (data[img].src.indexOf(r.i) !== -1) {
                                    count++;
                                    break;
                                }
                            }
                        }
                        if (r.m) {// check for mark

                            if (CAVNV.window.performance.getEntriesByName(r.m).length > 0 && CAVNV.window.performance.getEntriesByName(r.m)[0].entryType == "mark")
                                count++;
                        }
                        if (r.mm) {// check for measure
                            if (CAVNV.window.performance.getEntriesByName(r.mm).length > 0 && CAVNV.window.performance.getEntriesByName(r.mm)[0].entryType == "measure")
                                count++;
                        }
                    }//rules


                    var reqSend = false;
                    if (matching == "ANY" && count <= rules.length && count > 0)
                        reqSend = true;


                    else if (matching == "ALL" && count == rules.length)
                        reqSend = true;

                    if (reqSend) {
                        clearTimeout(boomr.timer); boomr.timer = -1;
                        // reset click listener. 
                        boomr.utils.removeListener(CAVNV.window, 'click', boomr.pageIndicatorDone);
                        if (!CAVNV.first_beacon_sent) {
                            return true;
                        }
                    }
                }
                //for other pages which are not configured
                if (pNotPresent == conf.length) {
                    clearTimeout(boomr.timer); boomr.timer = -1;
                    boomr.utils.removeListener(CAVNV.window, 'click', boomr.pageIndicatorDone);
                    if (!CAVNV.first_beacon_sent) return true;
                }
            } catch (e) {
                CAVNV.error('PageReadyIndicator ' + e);
            }
            return false;
        },
        check_and_send_doc_html: function (obj) {
            console.log("===========obj ",obj);
            console.log("===========CAVNV.sid ", CAVNV.sid);
            //FIXME: to restrict the processing of timing response twice.
            if (obj && CAVNV.sid) return;
            console.log("===========");
            //Check if SID is coming 0 then discard the sessions.
            if (typeof __NV_SID__ !== "undefined" && parseInt(__NV_SID__, 10) == 0) //for safari exp, specify conversion base 
            {
                //set dummy sid.
                boomr.check_and_set_dummy_sid();
                CAVNV.pendingSnapshot = {};
                return;
            }

            if (!obj && (typeof __NV_SID__ === 'undefined' || typeof __NV_COUNTER__ == 'undefined' || typeof __NV_CPF__ == 'undefined' || typeof __NV_NAV_START_TIME__ == 'undefined')) {
                CAVNV.log("tinyScript not loaded completed.");
                CAVNV.pendingSnapshot = {};
                return;
            }

            var sid, counter, capture_flag, nav_start, location_id, access_type_id;
            var geo_id, sess_start_time, cv, cfv, browser_id;
            var __authKey, __authsKey;

            if (obj) {
                var resp = obj.split("\n");
                var params = [];
                for (var i = 0; i < resp.length; i++) {
                    if (!resp[i] || !resp[i].length) continue;
                    params[i] = resp[i].split(' = ')[1].replace(/\"|;/g, "");
                }

                sid = params[0];
                counter = params[1];
                capture_flag = params[2];
                nav_start = params[3];
                browser_id = params[4];
                geo_id = params[5];
                location_id = params[6];
                access_type_id = params[7];
                __authKey = params[8];
                __authsKey = params[9];
                sess_start_time = params[10];
                cv = params[11];
                cfv = params[12];
            }
            else {
                sid = __NV_SID__;
                window.__NV_SID__ = undefined; //must to reset it for SPA so that it can entertain new sessionids
                counter = __NV_COUNTER__;
                capture_flag = __NV_CPF__;
                nav_start = __NV_NAV_START_TIME__;
                location_id = (typeof __NV_LOCATION_ID__ != 'undefined') ? __NV_LOCATION_ID__ : -1;
                access_type_id = (typeof __NV_ACCESS_TYPE_ID__ != 'undefined') ? __NV_ACCESS_TYPE_ID__ : -1;
                geo_id = (typeof __NV_GEO_ID__ != 'undefined') ? __NV_GEO_ID__ : -1;
                sess_start_time = (typeof __NV_SESS_START_TIME__ != 'undefined') ? __NV_SESS_START_TIME__ : -1;
                cv = (typeof __NV_CV__ != 'undefined') ? __NV_CV__ : null;
                cfv = (typeof __NV_CVF__ != 'undefined') ? __NV_CVF__ : null;
                browser_id = (typeof __NV_BROWSER_ID__ != 'undefined') ? __NV_BROWSER_ID__ : null;
            }
            if (w.localStorage && (cv || cfv))
                w.localStorage.setItem('_nvLibVer', JSON.stringify({ cv: cv, cfv: cfv }));

            //save these variables to CAVNV object so other plugins can use them.
            CAVNV.sid = sid;
            CAVNV.pageInstance = counter;
            //CAVNV.pageIndex = impl.vars.pageIndex;
            CAVNV.cav_epoch_nav_start_time = nav_start;
            CAVNV.lts = nav_start;
            CAVNV.location_id = location_id;
            CAVNV.access_type_id = access_type_id;
            CAVNV.geo_id = geo_id;
            CAVNV.browser_id = browser_id;
            CAVNV.session_start_time = sess_start_time;
            //if new session then set Pagedump session flag.
            //FIXME: what if response for first timing url missed. in that case pagedump will never captured.
            //set capture_flag.
            //boomr.set_session_flag('Pagedump', capture_flag);
            var cf = boomr.get_session_flag('Pagedump');
            if (CAVNV.pageInstance == 1 || isNaN(parseInt(cf)))
                cf = null;

            if (cf == null) {
                //check if we got valid value then try to set again.
                //In case if request served by other hpd instance then -1 will come.
                if (capture_flag >= 0) {
                    boomr.set_session_flag('Pagedump', capture_flag);
                }
                else {
                    CAVNV.error('CAVNV: failed to get Pagedump session flag. Pagedump will not be sent');
                    capture_flag = 2;
                }
            }
            else
                capture_flag = parseInt(cf);

            //set only if it is not set
            //Not using this due to sending future time
            /*CAVNV.epochTime = parseInt(CAVNV.get_session_flag("EpochTime"));
            if(!CAVNV.epochTime || isNaN(CAVNV.epochTime)){
              CAVNV.epochTime = CAVNV.nav_start_time - (CAVNV.cav_epoch_nav_start_time * 1000);
              CAVNV.set_session_flag("EpochTime",CAVNV.epochTime);
            }*/

            //update the LastAccessTime.
            CAVNV.set_session_flag('LastAccessTime', new Date().getTime());

            // updating native app info if bridge exist
            if (!!CAVNV.window.NBridge) {
                CAVNV.window.NBridge.getAppParam(JSON.stringify({ 'sid': sid.toString(), 'PI': CAVNV.pageInstance.toString(), 'lts': CAVNV.lts.toString(), 'snapshotInstance': CAVNV.snapshotInstance.toString() }));
            }
            if (!!CAVNV.window.webkit && !!CAVNV.window.webkit.messageHandlers.appNativeSync)
                CAVNV.window.webkit.messageHandlers.appNativeSync.postMessage(JSON.stringify({ 'sid': sid.toString(), 'pi': CAVNV.pageInstance.toString(), 'lts': CAVNV.lts.toString(), 'snapshotInstance': CAVNV.snapshotInstance.toString() }));

            //      if(CAVNV.newSessionIfIdle)
            //        boomr.cav_nv_handle_sess_expiry(1);  
            //set sid cookies.
            //Note: we setting the cookie all the time to maintain the session.
            //Check if sid changed i.e. session changed. 
            var prevSid = CAVNV.utils.getNVCookie(CAVNV.SID);
            if (prevSid != sid) {
                //TODO: do things which needed on session change. 
                //remove previous session's sessionStorage.
                if (w.sessionStorage)
                    w.sessionStorage.removeItem('nvct');
                if (w.localStorage) {
                    w.localStorage.removeItem('nvabv');
                    w.localStorage.removeItem('UxS');
                }

                //reset ocxFilter flag too. 
                CAVNV.set_session_flag('ocxFilter', '');
                CAVNV.set_session_flag('maxPagePct', '');
                CAVNV.set_session_flag('pctConsole', '');
            }

            //initiate ABTesting  
            CAVNV.plugins.ABTesting.start();

            CAVNV.utils.updateNVCookie(CAVNV.SID, sid);
            if (CAVNV.visitorInfo) {
                var visitorId = CAVNV.utils.getCookie('CavVI');
                if (!visitorId) {
                    visitorId = sid;
                    CAVNV.visitorId = visitorId;
                }
                CAVNV.utils.setCookie('CavVI', visitorId, CAVNV.visitorExpiryTime);
            }


            CAVNV.sflag = boomr.utils.getCookie("CavSF");
            if (!CAVNV.sflag || CAVNV.sflag == undefined) {
                CAVNV.log("Failed to get sflag cookie");
            }

            //Check for beacon url.
            var burl;
            if (typeof __NV_BEACON_URL != "undefined") {
                burl = __NV_BEACON_URL;
                CAVNV.beacon_url = __NV_BEACON_URL;
                if (typeof __NV_SSL_BEACON_URL != "undefined") {
                    burl = burl + "|" + __NV_SSL_BEACON_URL;
                    if (CAVNV.window.document.location.protocol == "https:")
                        CAVNV.beacon_url = __NV_SSL_BEACON_URL;
                }
                //set as Cookie.  
                CAVNV.utils.setCookie('CavBU', burl, null);
            }

            if (typeof __storeFilterApplied != "undefined") {
                CAVNV.set_session_flag('storeFilterApplied', __storeFilterApplied);
            }

            //set lts cookie (this cookie will be updated each time)
            if (boomr.utils.updateNVCookie(CAVNV.LTS, nav_start) /* null)*/) CAVNV.log("Updated CavLTS Cookie = " + boomr.utils.getNVCookie(CAVNV.LTS));
            else CAVNV.log("Failed to set cavLTS cookie");

            //set page instance cookie. this cookie will be updated each time.
            if (boomr.utils.updateNVCookie(CAVNV.PI, counter)) CAVNV.log("Updated CavPI cookie = " + boomr.utils.getNVCookie(CAVNV.PI));
            else CAVNV.log("Failed to set CavPI cookie");


            //send message to iframes.
            boomr.send_cookies_to_iframe();
            //fire after_beacon event. just to do something before sending pagedump. eg. to mark an element as sensitive.
            impl.fireEvent("after_beacon", impl.vars);

            //We need to flush all the data from local storage to NVServer and clear the local Storage for safari
            SessionStorage.remove();

            //Note: in case of SPA unload can be marked multiple time so need to reset here. 
            CAVNV.sbqueue.unload = false;
            CAVNV.subscribe('page_unload', function () {
                CAVUA.flushAll(true);
                CAVNV.sbqueue.flush();
                CAVNV.sbqueue.unload = true;
                if (CAVNV.config.uxScore && CAVNV.config.uxScore.enabled) {
                    var d = CAVNV.frus + ':' + CAVNV.satis + ':' + CAVNV.toler;
                    cav_nv_log_event('UxS', d);

                }



            });
            var idbFlushCalled = false;

            //we got the sid. Send the left data.
            if (CAVNV.config.ocxFilter.enabled == true || CAVNV.retryPDWithIDB) {
                if (IDB.init() == false) {
                    CAVNV.config.ocxFilter.enabled = false;
                    CAVNV.retryPDWithIDB = false;
                }
            }
            if (CAVNV.config.ocxFilter.enabled == true) {
                //check already set value. 
                var ocxFilter = CAVNV.get_session_flag('ocxFilter');
                if (ocxFilter == null || ocxFilter == "") {
                    //This is new session. Check for pct. 
                    var pct = CAVNV.config.ocxFilter.pct || 100;
                    var r = parseInt(Math.random() * 100);
                    if (r <= pct) {
                        CAVNV.set_session_flag('ocxFilter', 0);
                        CAVNV.ocxFilter = 0;
                    } else {
                        CAVNV.set_session_flag('ocxFilter', 1);
                        CAVNV.ocxFilter = 1;
                        idbFlushCalled = true;
                        IDB.flush();
                    }

                }
                else {
                    CAVNV.ocxFilter = parseInt(ocxFilter);
                }

                //for filtering above maxpage condition.
                if (CAVNV.ocxFilter == 0 && CAVNV.pageInstance > CAVNV.config.ocxFilter.maxPage) {
                    //if maxPage will mark it filtered, the whole session will be filtered.
                    var maxPagePctFilter = CAVNV.get_session_flag('maxPagePct');

                    if (!maxPagePctFilter) {
                        var pct = CAVNV.config.ocxFilter.maxPagePct || 100;
                        var r = parseInt(Math.random() * 100);
                        if (r <= pct) {
                            CAVNV.set_session_flag('ocxFilter', 1);
                            CAVNV.ocxFilter = 1;
                            idbFlushCalled = true;
                            IDB.flush();
                        }
                        else {
                            CAVNV.set_session_flag('maxPagePct', 1);
                        }
                    }
                }
            }
            else {
                CAVNV.set_session_flag('ocxFilter', 1);
                CAVNV.ocxFilter = 1;

                if (CAVNV.retryPDWithIDB)
                    IDB.flush(true);
            }

            CAVNV.flush_all();

            //pagedump not enabled.

            if (capture_flag == 0) {
                //we will not send ua and DOMWATCHER2 in case if pagedump is disabled
                CAVNV.plugins.DOMWATCHER2.stop();
                CAVNV.__uaEnabled = false;
            }
            else {
                if (CAVNV.retryPDWithIDB && CAVNV.snapshotInstance == 0) {
                    if (pendingDom) {
                        CAVNV.sendPendingDom();
                    }
                    return;
                }

                var domvalue = boomr.send_dom();
                if (domvalue == true) {
                    for (var s in CAVNV.pendingSnapshot) {
                        boomr.send_dom(false, s, CAVNV.pendingSnapshot[s])
                    }
                }
            }
            // reset
            CAVNV.pendingSnapshot = {};

            //For IRCTC Extension Detection
            if (typeof (ExtDetector) != "undefined")
                ExtDetector.start();

            if (CAVNV.config.ocxFilter.enabled == true && CAVNV.ocxFilter == 1 && idbFlushCalled == false)
                IDB.flush();

        },
        //ocxFilter API 
        set_ocx_filter: function () {
            if (CAVNV.ocxFilter = 0) {
                CAVNV.set_session_flag("ocxFilter", 1);
                CAVNV.ocxFilter = 1;
                IDB.flush();
            }
        },
        //Note: custom metrices will be collected on page load.
        send_custom_metrices: function () {
            var cmEntry = CAVNV.customData;
            if (!CAVNV.customMetrics || CAVNV.customMetrics.length == 0)
                return;
            var cm, text, e, d = CAVNV.window.document, pagelist, v, pattern, f, vlist, value, m, z;
            var pageid = ',' + CAVNV.pageIndex + ',';
            //{"valueidx":2,"id":"SPAN.wag-skip-main-navtextspan","pattern":/\/n.*n\//g,"cmname":"name","pageid":"-1","mode":2}
            //Note: id - selector
            //      pattern - 
            //      cmid 
            //      pageid 
            //      mode - 2(Dom Element) 1(Cookie)
            //      exp - js expresion. eg. $1 + $2 + $3 
            for (z = 0; z < cmEntry.length; z++) {
                cm = cmEntry[z];

                //Check for pageid.
                pagelist = ',' + cm.pageid + ',';
                if ((pagelist.indexOf(',-1,') == -1) && (pagelist.indexOf(pageid) == -1))
                    continue;

                if (cm.mode == 2) {
                    e = d.querySelector(cm.id);
                    if (!e) continue;
                    text = e.textContent;
                }
                else if (cm.mode == 1) {
                    e = CAVNV.utils.getCookie(cm.id);
                    if (!e) continue;
                    text = e.toString();
                }
                //apply pattern. 
                try {
                    //parse the pattern.
                    pattern = new RegExp(cm.pattern, "ig");

                    v = text.match(pattern);
                    if (!v || v.length == 0) continue;
                    for (vlist = "", m = 1; m <= v.length; m++) {
                        if (m != 1)
                            vlist += ",";
                        vlist += "$" + m;
                    }

                    //create function to get value.
                    f = Function(vlist, "return " + cm.exp);
                    value = f.apply(CAVNV.window, v);
                    boomr.cav_nv_log_customMetrics(cm.cmname, value);
                } catch (e) { }
            }
        },



        set_nd_instrFlag: function (trace, mask, logLevel) {
            var value = boomr.utils.getCookie("CavNV");
            if (value) {
                var fields = value.split("-");
                if (fields.length < 5) {
                    CAVNV.warn("Invalid ND Cookie. CavNV: " + value);
                    return 0;
                }

                if (typeof mask == "undefined")
                    fields[3] = 1; //enable ND Instrumentation

                //if trace is on then fill the mask in the end of the cookie
                if (fields.length >= 10) {
                    var v = trace ? mask : 0;
                    var logLevel = logLevel || 0;
                    var s = fields[10].split(':');
                    if (s.length > 1) {
                        v = trace ? mask : s[0];
                        logLevel = logLevel || s[1];
                    }
                    fields[10] = v + ":" + logLevel;
                }


                value = fields.join("-"); //reform cookie value


                var t = CAVNV.utils.setCookie("CavNV", value); //modify cookie
                if (t == true) {
                    CAVNV.log("CavNV: ND Instrumentation enabled, modified CAVNV cookie - " + value);
                    CAVNV.ndInfo.instrFlag = true;
                    return 1;
                }
                else {
                    CAVNV.warn("CavNV: Failed to update ND Cookie");
                }
            }
            else {
                CAVNV.warn("CavNV: ND Cookie not present, failed to enable ND Instrumentation");
            }
            return 0;
        },

        cav_nv_enable_nd: function (force) {
            //Check for instrumentation flag. 
            var ndConfig = CAVNV.config.autoNDInstr;
            if (CAVNV.ndInfo.instrFlag || !ndConfig || !ndConfig.enable) return;

            //Handle filtering
            if (!force && ndConfig.filter >= 0) {
                var r = parseInt(Math.random() * 100);
                if (r > ndConfig.filter) {
                    CAVNV.log("ND instrumentation disabled for current page");
                    return;
                }
            }

            boomr.set_nd_instrFlag();
        },

        get_nd_data: function () {
            var ndData = { FPID: -1, NSTR: -1, SC: 0, ERRCNT: 0 };
            //Format of CAVNV cookie = "<ndSessionId>-<TestRun>-<prev_fp_start_time>-<Instrumented(0/1)>-<normal/slow/verySlow/Error(0/1/2/3)>-<ExceptionCount(0forNow)>-TotalFPCount-TierId-ServerId-InsstanceId"
            var value = boomr.utils.getCookie("CavNV");
            if (value) {
                var fields = value.split("-");
                var ndsession, tr, instr, category, errcnt;
                if (fields.length < 5) {
                    CAVNV.warn("Invalid ND Cookie. CavNV: " + value);
                    return ndData;
                }

                ndsession = fields[0];
                tr = fields[1];
                instr = fields[3];
                category = fields[4];

                var ndInfo = CAVNV.ndInfo;
                ndInfo.tierId = fields[7] || ndInfo.tierId;
                ndInfo.serverId = fields[8] || ndInfo.serverId;
                ndInfo.instanceId = fields[9] || ndInfo.instanceId;
                if (!isNaN(instr))
                    ndInfo.instrFlag = (instr == 1);
                if (!isNaN(tr))
                    ndData.NSTR = tr;

                //TODO: verfify the category.
                //If session is instrumented or category is not the noraml. (9 - UNKNOW, 10 - normal)
                if (CAVNV.logNDSessionAlways || (!!(parseInt(instr)) == true) || (category != 9 && category != 10)) {
                    if (!isNaN(ndsession) && !isNaN(tr)) {
                        ndData.FPID = ndsession;
                        if (!isNaN(fields[5])) {
                            ndData.ERRCNT = fields[5];
                            if (CAVNV.config.uxScore && CAVNV.config.uxScore.enabled)
                                CAVNV.frus += 5000; //crash 
                        }
                        //This is temporarly condition to log this events for some specific Instance. 
                        CAVNV.utils.logNDEvent(category);
                    }
                }
            }
            return ndData;
        },
        get_document_cookies: function () {

            //default max cookies value 1024.
            var s = d.cookie, l, max = CAVNV.maxCookieSize || 1024;
            var ca = s.split('; ');
            var co = [];

            if (CAVNV.blacklistCookies.length > 0) {
                //remove blacklisted cookies.
                var s = '';
                var bc = CAVNV.blacklistCookies;
                for (var z = 0, y = 0; z < ca.length; z++) {
                    for (y = 0; y < bc.length; y++)
                        if (ca[z].trim().indexOf(bc[y] + '=') == 0)
                            break;
                    if (y == bc.length)
                        co.push(ca[z]);
                }
            }
            else
                co = ca;

            //blacklist cookies are filtered. Now move whitelist on top.
            var wc = CAVNV.whitelistCookies;
            //whitelist cookie array.
            var wo = [];

            if (wc.length) {
                for (z = 0; z < wc.length; z++) {
                    //search in cookie
                    for (y = 0; y < co.length; y++) {
                        if (co[y] != undefined) {

                            if (co[y].trim().indexOf(wc[z] + "=") == 0) {

                                wo.push(co[y]);
                                co[y] = undefined;
                                break;
                            }
                        }
                    }
                }

                //merge the array.
                for (z = 0; z < co.length; z++) {
                    if (co[z])
                        wo.push(co[z]);
                }
            }
            else
                wo = co;

            s = wo.join('; ');

            //replace all pipe by %PIPE%
            s = s.replace(/%7C/g, '|').replace(/\|/g, '%PIPE%');
            if (s.length > max) {
                s = s.substr(0, max);
                l = s.lastIndexOf(';');
                if (l != -1) s = s.substr(0, l + 1);
            }
            CAVNV.log("Cookies - " + s);
            return s;
        },
        /*    call_timer: function(time, msg){
                var timer;
                if (msg == "Session Expired")
                  timer = CAVNV.expireTimer;
                else
                  timer = CAVNV.expireMaxTimer;
        
                if (timer) {
                   clearTimeout(timer);
                   timer = -1;
                }
        
                var expireTimer = setTimeout(function(){
                   //Check if unload fired then do not send beacon.
                   if(!impl.unloadfired){
                   CAVNV.log(msg);
                   CAVNV.sid = undefined;
                   CAVNV.sendBeacon();
                   }
                }, time);
                timer = expireTimer;
                return timer;
            },
        //commenting the code as it created lot of unused sessions along with the session splits.
            cav_nv_handle_sess_expiry: function(isMaxSessExp){
              
              //if session expires then sendBeacon for new session creation
              var time_left_to_expire = CAVNV.sessionExpiryTime * 1000;
              if (time_left_to_expire > 0){
                CAVNV.expireTimer = boomr.call_timer(time_left_to_expire, "Session Expired");
              }
        
              if(!isMaxSessExp) return;
        
              //Case to handle max session duration for new session
              var time_left_to_max_duration = CAVNV.maxSessionDuration - (CAVNV.session_start_time - CAVNV.cav_epoch_nav_start_time);
              if (time_left_to_max_duration > 0){
                time_left_to_max_duration = time_left_to_max_duration * 1000; 
                CAVNV.expireMaxTimer = boomr.call_timer(time_left_to_max_duration, "Session Expired as reached max duration");
              } 
        
            },*/
        //These are the apis to handle ajax page.
        cav_nv_ajax_pg_start: function (url, pg_name, options) {
            //check if we have any pending ajax page.
            if (CAVNV.ajax_pg_start_time != -1) {
                CAVNV.log("cav_nv_ajax_pg_start: Previous Ajax Page not completed started at " + new Date(CAVNV.ajax_pg_start_time) + "moving to next page.");
                CAVNV.ajax_pg_arg = {};
            }
            CAVNV.ajax_pg_start_time = new Date().getTime();
            //save other args.
            CAVNV.ajax_pg_arg.url = url;
            CAVNV.ajax_pg_arg.pg_name = pg_name;

            //fire page_unload event so other callbacks can be called.
            CAVNV.updateNDPI();
            impl.fireEvent('page_unload2');
            impl.fireEvent('page_unload');
            boomr.utils.triggerEvent(CAVNV.window, "nvunload");

            //flush all the collected data.
            boomr.flush_all();

            //Stop following plugins. 
            //CHECPOINT, AjaxMonitor, ClickMonitor, DOMWATCHER, DOMWATCHER2, USERACTION
            boomr.stop_all();
            //reset to start all the plugins at init (POC issue)
            boomr.ajax_page_init_done = false;

            //reset snav timing. 
            CAVNV.snav = null;

            //all previous task have been done, start for new page.
            //set pageIndex.
            CAVNV.pageIndex = CAVNV.plugins.CONFIG.get_pageIndex(CAVNV.ajax_pg_arg.url, CAVNV.ajax_pg_arg.pg_name);

            //clear resource Timing.
            if (CAVNV.resourceTiming) {
                //boomr.clearResourceTimings(); 
                //start the failed resource detector.
                //Note: we are going to restart this plugin check if it will not impact something.
                ResourceFailedDetector.init();
            }

            CAVNV.log("cav_nv_ajax_pg_start: New ajax page url: " + url + " page " + pg_name + " started at " + new Date(CAVNV.ajax_pg_start_time));
        },

        cav_nv_ajax_pg_init: function () {
            if (boomr.ajax_page_init_done) {
                return;
            }
            CAVNV.log("cav_nv_ajax_pg_init() called");

            //TODO:DO we need to fire page_ready event because that may not be required anymore.
            boomr.ajax_pg_init_time = new Date().getTime();


            //restart all plugins.
            boomr.restart_all();

            //set callback if required on this page. 
            boomr.reset_custom_cb();

            //trigger event for page_ready2.
            impl.fireEvent('page_ready2');

            boomr.utils.triggerEvent(CAVNV.window, "nvload");

            boomr.ajax_page_init_done = true;
            /*//subscribe to flush sbqueue.
            CAVNV.subscribe('page_unload', function() {
              CAVNV.sbqueue.flush();
            });*/

        },

        //Note: this api can be called without calling cav_nv_ajax_pg_start() but url argument should be given
        //Note: in case if these apis called from spa plugin, then we need to get other details like pageLoadtime from _nv in options..
        cav_nv_ajax_pg_end: function (url, pg_name, options) {
            var cur_time = new Date().getTime();
            options = options || {};
            CAVNV.__uaEnabled = true; //reset here for SPA.
            //check if there is any previous pending ajax page.
            if ((CAVNV.ajax_pg_start_time == -1) && !url) {
                CAVNV.log("cav_nv_ajax_pg_end: Ajax page not started(error: cav_nv_ajax_pg_start api missing.)");
                return;
            }

            //check if beacon sent for first url, if not then discard this request..
            if (!CAVNV.first_beacon_sent) {
                CAVNV.log("cav_nv_ajax_pg_end: First Page not loaded completely, discarding Ajax page.");
                CAVNV.ajax_pg_start_time = -1;
                CAVNV.ajax_pg_arg = {};
                boomr.ajax_page_init_done = false;
                return;
            }

            var ajax_pg_start_time = CAVNV.ajax_pg_start_time;
            if (CAVNV.ajax_pg_start_time == -1) {
                //call the cav_nv_ajax_pg_start.
                boomr.cav_nv_ajax_pg_start(url, pg_name, options);
            }

            boomr.cav_nv_ajax_pg_init();

            CAVNV.log("cav_nv_ajax_pg_end: Ajax page completed. page load time = " + (cur_time - CAVNV.ajax_pg_start_time) + "(ms)");
            var spa_data = options.__nv;

            var oldNavStart = CAVNV.nav_start_time;
            //set CAVNV.nav_start_time.
            CAVNV.nav_start_time = ((CAVNV.ajax_pg_start_time > 0) ? CAVNV.ajax_pg_start_time : cur_time);
            //update nav_offset.
            CAVNV.nav_offset += (CAVNV.nav_start_time - oldNavStart);

            //reset timing details.
            impl.vars.nt_red_count = 0;
            impl.vars.nt_red_time = -1;
            impl.vars.nt_app_cache_time = -1;
            impl.vars.nt_fetch_time = -1;
            impl.vars.nt_dns_time = -1;
            impl.vars.nt_con_time = -1;
            impl.vars.nt_secure_con_time = -1;
            impl.vars.nt_first_byte_time = -1;
            impl.vars.nt_server_response_time = -1;
            impl.vars.nt_res_time = -1;
            impl.vars.nt_unload_time = -1;
            impl.vars.nt_dom_time = -1;
            impl.vars.nt_dom_content_load_time = -1;
            impl.vars.nt_load_time = -1;
            impl.vars.nt_fp = -1;
            impl.vars.nt_fcp = -1;
            impl.vars.oT = parseInt(CAVNV.get_session_flag('orderTotal')) || 0;
            impl.vars.oC = parseInt(CAVNV.get_session_flag('orderCount')) || 0;
            CAVNV.setNDTraceHeader = undefined;
            CAVNV.frus = 0;
            CAVNV.satis = 0;
            CAVNV.toler = 0;
            //reset perceived render time.
            impl.vars.perceived_render_time = -1;
            impl.vars.nt_dom_interactive = -1;
            if (spa_data && spa_data.resource.timing.requestStart && spa_data.resource.timing.loadEventEnd)
                impl.vars.nt_time_to_load = (spa_data.resource.timing.loadEventEnd - spa_data.resource.timing.requestStart);
            else
                impl.vars.nt_time_to_load = ((ajax_pg_start_time > 0) ? (cur_time - ajax_pg_start_time) : -1); //in ms.

            CAVNV.loadTimeDone = true;


            if (spa_data && spa_data.resource.timing.domComplete && spa_data.resource.timing.requestStart)
                impl.vars.nt_time_to_DOC = (spa_data.resource.timing.domComplete - spa_data.resource.timing.requestStart);
            else
                impl.vars.nt_time_to_DOC = -1;

            //FIXME: as our assumption is that domcontentload time can not be greater than pageload time.
            //But in case of spa this may happen. right now we have put a check to overcome such condition
            if (impl.vars.nt_time_to_DOC > impl.vars.nt_time_to_load)
                impl.vars.nt_time_to_DOC = impl.vars.nt_time_to_load;

            //If dom content load time not set then set it as of load time.
            if (impl.vars.nt_time_to_DOC == -1)
                impl.vars.nt_time_to_DOC = impl.vars.nt_time_to_load;

            //rest referer.
            impl.vars.br_refer = '';
            //check if only path given then add host in that.
            impl.vars.url = /^https?:\/\//.test(CAVNV.ajax_pg_arg.url) ? CAVNV.ajax_pg_arg.url : (w.document.location.origin + CAVNV.ajax_pg_arg.url);
            impl.vars.url = impl.vars.url.substr(0, 512);
            //update fpinstance and status.
            //Cookie can be updated on ajax page.
            //update this value only if cookie found, else we will use the previous one.
            if (boomr.utils.getCookie("CavNV") != null) {
                var ndData = boomr.get_nd_data();
                impl.vars.fpidGroup = "{" + ndData.FPID + "}";
                impl.vars.SC = ndData.SC;
                impl.vars.NSTR = ndData.NSTR;
            }

            //update cookies
            impl.vars.cookie = boomr.get_document_cookies();

            //referer
            impl.vars.br_refer = d.referrer.substr(0, 256);

            impl.vars.pageIndex = CAVNV.pageIndex;

            CAVNV.log("cav_nv_ajax_pg_end: Ajax page url " + CAVNV.ajax_pg_arg.url + " page " + CAVNV.ajax_pg_arg.pg_name + " and pageIndex = " + impl.vars.pageIndex);
            impl.vars.navType = 254 /*SOFT NAVIGATION*/;
            CAVNV.navtype = impl.vars.navType;
            //send beacon request.
            CAVNV.sendBeacon();

            //set soft navigation detail
            CAVNV.snav = { start: CAVNV.ajax_pg_start_time, init: CAVNV.ajax_pg_init_time, end: (impl.vars.nt_time_to_load > 0 ? (CAVNV.ajax_pg_start_time + impl.vars.nt_time_to_load) : -1) };

            CAVNV.ajax_pg_start_time = -1;
            CAVNV.ajax_pg_arg = {};
            boomr.ajax_page_init_done = false;

            //rest timer.
            CAVNV.dataFlushTimer = setInterval(CAVNV.flush_all, CAVNV.dataFlushInterval);

            //send resource timing.
            if (CAVNV.resourceTiming) {
                boomr.logResourceTiming(true);
                ResourceFailedDetector.stop();
            }

            CAVNV.log("cav_nv_ajax_pg_end:  Done.");
        },

        reset_custom_cb: function () {
            CAVNV.log("Resetting custom callback.");
            for (var k = 0; k < impl.custom_cb.length; k++) {
                var c = impl.custom_cb[k];
                if (c.page.indexOf('-1') != -1) { //can be applied on all pages.
                    CAVNV.log("Netvision: setting custom callback for event - " + c.state);
                    CAVNV.subscribe(c.state, c.callback, c.cb_data, CAVNV.window);
                }
                else {
                    //check for page.
                    var page_filter = c.page.split(',');
                    var l;
                    for (l = 0; l < page_filter.length; l++) {
                        if (parseInt(page_filter[l]) == CAVNV.pageIndex) break;
                    }
                    //check if any page matched then subscribe otherwise leave it.
                    if (l != page_filter.length) {
                        CAVNV.log("Netvision: setting custom callback for event - " + c.state);
                        CAVNV.subscribe(c.state, c.callback, c.cb_data, CAVNV.window);
                    }
                }
            }
        },
        cav_nv_add_custom_cb: function (cb, state, pg, cb_data) {
            //if page is given then add first check for page and add that into impl.custom_pg. 
            if (typeof pg != 'string') cb_data = pg || cb_data;
            if (typeof pg != 'undefined') {
                impl.custom_cb.push({
                    'page': pg,
                    'callback': cb,
                    'state': state,
                    'cb_data': cb_data
                });
                //check for page. 
                if (pg.indexOf('-1') == -1) {
                    if (CAVNV.pageIndex == undefined || CAVNV.pageIndex == null) return;

                    var page_filter = pg.split(',');
                    var j;
                    for (j = 0; j < page_filter.length; j++) {
                        if (parseInt(page_filter[j]) == CAVNV.pageIndex) break;
                    }
                    //not matched with any page.
                    if (j == page_filter.length) return;
                }
            }
            //subscribe for these events.
            CAVNV.log('Netvision: setting custom callback for event - ' + state);
            CAVNV.subscribe(state, cb, cb_data, CAVNV.window);
        },
        cav_nv_pg_ready_cb: function (cb, pg, cb_data) {
            boomr.cav_nv_add_custom_cb(cb, 'page_ready2', pg, cb_data);
        },
        cav_nv_pg_unload_cb: function (cb, pg, cb_data) {
            boomr.cav_nv_add_custom_cb(cb, 'page_unload2', pg, cb_data);
        },
        cav_nv_before_beacon_cb: function (cb, pg, cb_data) {
            boomr.cav_nv_add_custom_cb(cb, 'before_beacon', pg, cb_data);
        },
        cav_nv_after_beacon_cb: function (cb, pg, cb_data) {
            boomr.cav_nv_add_custom_cb(cb, 'after_beacon', pg, cb_data);
        },
        //this api will just create an entry in CAVNV.cb. and user can use this callback at any time. 
        //Basicly this will be use to modify a dom element before sending pagedump.
        //Currently there is not filtering of page.
        //TODO: check if we need page based filtering.
        cav_nv_add_cb: function (name, cb, cb_data, scope) {
            if (typeof cb !== 'function' || typeof name !== 'string') {
                CAVNV.error('CAVNV: cav_nv_add_cb(), Invalid args.');
                return;
            }
            CAVNV.cb = CAVNV.cb || {};
            //there should not be multiple callback with same name. 
            if (CAVNV.cb.hasOwnProperty(name)) {
                CAVNV.error('CAVNV: callback ' + name + ' already exit.');
                return;
            }
            //now just add this.
            CAVNV.cb[name] = [cb, cb_data || {}, scope || CAVNV.window];
            CAVNV.log('CAVNV: callback ' + name + ' added successfully');
        },
        //now pages can be loaded dynamically so this api will just call flush methods of all plugins(if defined).
        flush_all: function () {
            for (var k in CAVNV.plugins) {
                if (CAVNV.plugins.hasOwnProperty(k)) {
                    if (impl.disabled_plugins[k]) {
                        continue;
                    }

                    //check if flush method defined.
                    if (typeof CAVNV.plugins[k].flush === 'function') CAVNV.plugins[k].flush(true);
                }
            }
        },

        restart_all: function () {
            //reste CAVNV data
            CAVNV.sid = undefined;
            CAVNV.pageInstance = undefined;
            CAVNV.cav_epoch_nav_start_time = -1;
            //reset other counts.
            CAVNV.pageInstanceCounter = 0;
            CAVNV.iframePorts = [];
            CAVNV.parentComDone = false;
            CAVNV.lts = undefined;
            CAVNV._wpdEventRaised = undefined;
            CAVNV.snapshotInstance = 0;
            CAVNV.pendingSnapshot = {};
            //restart plugins.
            for (var k in CAVNV.plugins) {
                if (CAVNV.plugins.hasOwnProperty(k)) {
                    if (impl.disabled_plugins[k]) {
                        continue;
                    }

                    //check if flush method defined.
                    if (typeof CAVNV.plugins[k].restart === 'function') CAVNV.plugins[k].restart();
                }
            }
        },
        stop_all: function () {
            //call stop method of all the plugins.
            for (var k in CAVNV.plugins) {
                if (CAVNV.plugins.hasOwnProperty(k)) {
                    if (impl.disabled_plugins[k]) {
                        continue;
                    }

                    //check if flush method defined.
                    if (typeof CAVNV.plugins[k].stop === 'function') CAVNV.plugins[k].stop();
                }
            }
        },
        get_session_id: function () {
            var sid = CAVNV.sid || CAVNV.utils.getNVCookie(CAVNV.SID);
            if (sid == undefined || sid == null)
                return null;
            return "CAVNV-" + sid;
        },
        //This method will set session data into sessionStorage.
        cav_nv_get_session_data: function (key) {
            //key format: CAVNV-<sid>
            var sid = boomr.get_session_id();
            if (sid == null) {
                CAVNV.info("cav_nv_get_session_data: session_id not set.");
                return {};
            }
            var val = w.sessionStorage.getItem(sid);
            if (val != null) {
                //evaluate to JSON.
                try {
                    var e = JSON.parse(val);
                    //Check if key is given then return data associated to that key else complete data 
                    if (key)
                        return e[key];
                    return e;
                } catch (e1) {
                    return {};
                }
            }
            return {};
        },
        cav_nv_set_session_data: function (key, data) {
            if (data == undefined) {
                data = key;
                key = undefined;
            }

            //only object allowed as data.
            if (typeof data != "object") {
                CAVNV.info("cav_nv_set_session_data: Invalid data type");
                return;
            }
            //get session_id. and removeItem with this data and set that again. 
            var sid = boomr.get_session_id();
            if (sid == null) {
                CAVNV.info("cav_nv_set_session_data: session_id not set.");
                return;
            }

            //get existing data. 
            if (key) {
                var alldata = w.sessionStorage.getItem(sid);
                if (alldata) {
                    try {
                        alldata = JSON.parse(alldata);
                        alldata[key] = data;
                    } catch (e) {
                        alldata = undefined;
                    }
                }

                if (!alldata) {
                    alldata = {};
                    alldata[key] = data;
                }
                data = alldata;
            }

            //remove this item.
            w.sessionStorage.removeItem(sid);

            //serialize the data.
            var value = JSON.stringify(data);
            w.sessionStorage.setItem(sid, value);
        },
        //This method is just for debugging. It will log the current time with given tag name.
        cav_nv_log_tm: function (s, t) {
            //Internal timing.
            if (typeof s !== 'string') return;
            CAVNV.int_tm = CAVNV.int_tm || [];
            t = t || new Date().getTime();
            CAVNV.log('CAVNV: timing - ' + s + '=' + t.toString());
            CAVNV.int_tm.push(s + '=' + t.toString());
        },
        clearResourceTimings: function () {

            function clear(w) {
                if (w.performance) {
                    if (w.performance.clearResourceTimings)
                        w.performance.clearResourceTimings(w);
                    else if (w.performance.webkitClearResourceTimings)
                        w.performance.webkitClearResourceTimings(w);
                    return true;
                }
                return false;
            }

            function search(w) {
                var f = clear(w);
                if (!f) return;

                try {
                    f = w.document.getElementsByTagName('iframe');
                    for (var z = 0; z < f.length; z++) {
                        search(f[z].contentWindow);
                    }
                }
                catch (e) { }
            }

            search(w);

        },

        getPerceivedRenderTime: function (resources, contentLoadTime, loadTime, offset) {
            function isImage(URL) {
                //var exts = ["bmp"  , "djv" , "djvu"  , "gif"   , "ico" , "jpeg" , "jpg"  , "pbm" , "pgm"  , "png"  , "pnm"  , "ppm" , "psd" , "svg" , "svgz" , "tif" , "tiff" , "xbm", "xpm"];
                //Note: keeping this list minimized for better performance. 
                var path = URL.hostname + URL.pathname;
                var exts = ["jpeg", "jpg", "png", "svg", "tif", "bmp", "gif", "ico", "psd"];
                var isImageFlag = false;
                if (CAVNV.imgUrlPattern) {
                    CAVNV.imgUrlPattern.forEach(function (pattern) {
                        try {
                            if (pattern.test(path)) {
                                isImageFlag = true;
                            }
                        } catch (e) { }
                    });
                }
                if (!isImageFlag) {
                    //get ext.
                    var i = path.lastIndexOf(".");
                    if (i != -1) {
                        var ext = path.substr(i + 1);
                        for (var z = 0; z < exts.length; z++) {
                            if (ext == exts[z])
                                isImageFlag = true;
                        }
                    }
                }
                return isImageFlag;
            }

            var viewportHeight = (w.innerHeight || w.document.documentElement.clientHeight);
            var viewportWidth = (w.innerWidth || w.document.documentElement.clientWidth);
            var viewportX = w.pageXOffset || (null === w.document.body ? 0 : w.document.body.scrollLeft);
            var viewportY = w.pageYOffset || (null === w.document.body ? 0 : w.document.body.scrollTop);
            function isElementInViewport(el) {
                var rect = el.getBoundingClientRect();
                //check if within viewPort. 
                return ((rect.top + viewportY) < viewportHeight && (rect.left + viewportX) < viewportWidth);
            }

            function getImg(a) {
                var d = w.document, h = d.location.hostname, path;
                var img = null;
                //If of same url then check with relative path.
                var sameOrigin = (a.hostname == h);
                if (sameOrigin) {
                    path = a.pathname + a.search;
                    img = d.querySelector('[src="' + path + '"]');
                }

                if (!img) {
                    //Check with origin.
                    path = a.href;
                    img = d.querySelector('[src="' + path + '"]');

                    if (!img) {
                        //Check without protocol.
                        path = a.href.replace(/^https?:/, '');
                        img = d.querySelector('[src="' + path + '"]');
                    }
                }
                return img;
            }

            var maxEndTime = 0;
            offset = offset || 0;
            var totalImageInRT = 0, totalImageInDoc = 0, totalImageInViewPort = 0;
            for (var z = 0; z < resources.length; z++) {
                var res = resources[z];
                if (res.startTime - offset > loadTime)
                    break;
                var img;
                var URL = document.createElement('a');
                URL.href = res.name;
                if (isImage(URL)) {
                    totalImageInRT++;
                    img = getImg(URL);
                    if (img) {
                        totalImageInDoc++;
                        if (isElementInViewport(img)) {
                            totalImageInViewPort++;
                            maxEndTime = res.responseEnd;
                        }
                    }
                }
            }

            var renderTime = 0;
            if (maxEndTime > offset)
                renderTime = maxEndTime - offset;

            if (renderTime < contentLoadTime)
                renderTime = contentLoadTime;

            CAVNV.info("Perceived Render Time info: render time - " + renderTime + ", total images in RT - " + totalImageInRT +
                ", total images in document - " + totalImageInDoc + ", total images in view port - " + totalImageInViewPort);

            return parseInt(renderTime);
        },

        //Note: softNav is set then we will not log navitation timing.
        //Note: in case of 
        logResourceTiming: function (softNav, isMainUrl, logTimingOnly, evType) {
            var resources = [];
            isMainUrl = isMainUrl || false;
            logTimingOnly = logTimingOnly || false;
            evType = evType || "-6";

            var tSize = 0;
            var p = w.performance || w.msPerformance || w.webkitPerformance || w.mozPerformance;
            var pt;
            if (p) pt = p.timing;
            //Note: if pt is not defined then resourceTiming will not be available.
            if (!pt) return;

            //Take the offset from actual page laod.
            //Note: in case of soft navigation we will take entries of time after soft page naivgation time.
            var navoffset = (CAVNV.nav_start_time - pt.navigationStart);
            if (navoffset < 0) navoffset = 0;

            //set percieved render time.
            //disabling perceived_render_time due to incorrect data in spa
            impl.vars.perceived_render_time = -1;

            //calculate bandwidth and perceived render time. 
            var resources = CAVNV.utils.getRT(w);

            //Resources of main document. 
            if (!softNav) {
                //FIXME/TODO: Currently we are calculating with help of resource of main document. But there can be case where the main content can be inside an Iframe. 
                impl.vars.perceived_render_time = boomr.getPerceivedRenderTime(resources, impl.vars.nt_time_to_DOC, impl.vars["nt_time_to_load"], navoffset);
                if (impl.vars.perceived_render_time > 3600000)
                    impl.vars.perceived_render_time = -1;
                CAVNV.log("perceived render time - " + impl.vars.perceived_render_time);
            }

            function isFilteredDom(d, n) {
                for (var i = 0; i < d.length; i++) {
                    if (n.indexOf(d[i]) != -1) {
                        CAVNV.log(n + " is filtered");
                        return true;
                    }
                }
                return false;
            }

            var bkbps = bandwidth(resources);
            function bandwidth(resources) {
                var bw = 0, rTotalBytes = 0, rTotalDuration = 0, r;

                for (var z = 0; z < resources.length; z++) {
                    r = resources[z];
                    if (r.transferSize && r.responseStart) {
                        rTotalBytes += r.transferSize;
                        rTotalDuration += (r.responseEnd - r.responseStart);

                    }
                }

                var xhrget = CAVNV.cav_nv_get_session_data('xhrbw');
                if ((xhrget !== undefined) && (xhrget.nv_tBytesxhr && xhrget.nv_tDurationxhr)) {
                    rTotalBytes = ((rTotalBytes) + (xhrget.nv_tBytesxhr));
                    rTotalDuration = ((rTotalDuration) + (xhrget.nv_tDurationxhr));
                    var xhrObj = { nv_tBytesxhr: 0, nv_tDurationxhr: 0 };
                    CAVNV.cav_nv_set_session_data('xhrbw', xhrObj);
                }
                var bkbps = 0;
                if (rTotalBytes >= 2 * 1024)
                    bkbps = (((rTotalBytes * 8) / 1000) / (rTotalDuration / 1000));

                return parseInt(bkbps);
            }

            impl.vars.bandwidth = bkbps;

            //for logging bandwidth and prt
            if (CAVNV.config.enableCvrAllPages) {
                if (logTimingOnly) return;
                if (!CAVNV.first_beacon_sent) {
                    impl.vars.bandwidth = -1;
                    impl.vars.perceived_render_time = -1;
                }
            }
            CAVNV.log('Bandwidth: ' + bkbps + ' kbps');


            //TODO: move this method to some other place.
            //performance.timing
            function getResourceTimingData(filter) {

                var allResources = [];
                tSize = 0;

                //This method will log resource timing for main url.
                function logMainURLRT(w) {
                    var rt = 'others' + ";" +
                        0.00/*start time*/ + ';' +
                        (pt.responseEnd - pt.navigationStart) /*duration*/ + ';' +
                        (pt.redirectStart ? (pt.redirectStart - pt.navigationStart) : 0) /*redirectStart*/ + ';' +
                        (pt.redirectEnd ? (pt.redirectEnd - pt.navigationStart) : 0) /*redirectEnd*/ + ';' +
                        (pt.domainLookupStart ? (pt.domainLookupStart - pt.navigationStart) : 0) /*domainLookupStart*/ + ';' +
                        (pt.domainLookupEnd ? (pt.domainLookupEnd - pt.navigationStart) : 0) /*domainLookupEnd*/ + ';' +
                        (pt.fetchStart ? (pt.fetchStart - pt.navigationStart) : 0) /*fetchStart*/ + ';' +
                        (pt.connectStart ? (pt.connectStart - pt.navigationStart) : 0) /*connectStart*/ + ';' +
                        (pt.secureConnectionStart ? (pt.secureConnectionStart - pt.navigationStart) : 0) /*secureConnectionStart*/ + ';' +
                        (pt.connectEnd ? (pt.connectEnd - pt.navigationStart) : 0) /*connectEnd*/ + ';' +
                        (pt.requestStart ? (pt.requestStart - pt.navigationStart) : 0) /*requestStart*/ + ';' +
                        (pt.responseStart ? (pt.responseStart - pt.navigationStart) : 0) /*responseStart*/ + ';' +
                        (pt.responseEnd ? (pt.responseEnd - pt.navigationStart) : 0) /*responseEnd*/ + ';' +
                        encodeURIComponent(w.document.location.href);
                    //to fetch resource timing 2 of mainURL
                    if (w.performance.getEntriesByType !== undefined) {
                        var res = (w.performance.getEntriesByType("navigation"));

                        if (typeof res[0] != "undefined" && typeof res[0].transferSize != "undefined") {
                            tSize += res[0].transferSize;
                            rt = rt + ";" + res[0].transferSize + ";" + res[0].encodedBodySize + ";" + res[0].decodedBodySize;
                        }
                        else rt = rt + ";0;0;0";

                        if (typeof res[0] != "undefined" && typeof res[0].nextHopProtocol != "undefined")
                            rt = rt + ";" + res[0].nextHopProtocol;
                        else
                            rt = rt + ";";

                        if (typeof res[0] != "undefined" && res[0].serverTiming && res[0].serverTiming.length) {
                            for (var y = 0; y < res[0].serverTiming.length; y++) {
                                var s = res[0].serverTiming[y];
                                var prefix = (y == 0) ? ';' : '&&';
                                rt += prefix + s.name + ":" + s.duration + ":" + s.description;
                            }
                        }

                    }

                    allResources.push(rt);

                }

                function logCM(r) {
                    var cmEntry = CAVNV.customData;
                    if (!CAVNV.customMetrics || CAVNV.customMetrics.length == 0)
                        return;
                    var cm, pagelist, z;
                    var pageid = ',' + CAVNV.pageIndex + ',';
                    //Note: id - "edge" //server timing name
                    //      pattern - "" //domain pattern
                    //      cmid 
                    //      pageid 
                    //      mode - 3 
                    // exp not needed
                    for (z = 0; z < cmEntry.length; z++) {
                        cm = cmEntry[z];
                        if (cm.mode != 3) continue;
                        //Check for pageid.
                        pagelist = ',' + cm.pageid + ',';
                        if ((pagelist.indexOf(',-1,') == -1) && (pagelist.indexOf(pageid) == -1))
                            continue;

                        //cm.pattern will hold the domain name either in string or pattern
                        var dom;
                        try {
                            dom = new RegExp(cm.pattern);
                        }
                        catch (e) {
                            dom = cm.pattern;
                        }

                        if (!dom.test(r.name)) continue;
                        for (var y = 0; y < r.serverTiming.length; y++) {
                            var s = r.serverTiming[y];
                            if (s.name.indexOf(cm.id) != -1) {
                                if (s.duration)
                                    boomr.cav_nv_log_customMetrics(cm.cmname, s.duration);
                                break;
                            }
                        }
                    }
                }
                //Note: as entry for first request is not present in resource timing. 
                //so we will create this entry from window.performance.timing.
                //Format: records will be seperated by , and each column will be seperated by ;.

                //Note: for different origin we will not be able to acces it's performance. 
                function logFrameRT(w) {
                    //Call for current window.
                    CAVNV.log('Collecting resource timing for Frame - ' + w.location.href);
                    logRT(w);

                    //Check for frames.
                    if (!CAVNV.monitorIframe) return;
                    var f = w.document.getElementsByTagName('iframe');
                    for (var z = 0; z < f.length; z++) {
                        try {
                            logFrameRT(f[z].contentWindow);
                        } catch (e) {
                            continue;
                        }
                    }
                }

                function logRT(w) {
                    var resource = CAVNV.utils.getRT(w);
                    var framept = CAVNV.utils.getPT(w);
                    var cur_offset = CAVNV.nav_start_time - framept.navigationStart - (softNav ? impl.softNavGap : 0);
                    if (!framept) return;
                    function t(time) {
                        if (time === 0) return time;
                        return (time + framept.navigationStart - (pt.navigationStart + navoffset));
                    }

                    var data = "";
                    var filterDomains = (CAVNV.config.resourceTimingFilter ? CAVNV.config.resourceTimingFilter.domain : []) || [];
                    if (!boomr.utils.isArray(filterDomains))
                        filterDomains = [];

                    for (var z = 0; z < resource.length; z++) {
                        //Check for onload condition.
                        //Note: XHRRequest and BeaconUrl will not wait for onload to fire.
                        //if(navoffset == 0 && resource[z].responseEnd > (framept.loadEventEnd-framept.navigationStart))
                        // continue;

                        //Note: All the timing should be relative to main frame navigationStart.

                        //entry format: initiatorType;starttime;duration;redirectStart;redirectEnd;domainLookupStart;domainLookupEnd;fetchStart;connectStart;secureConnectionStart;connectEnd;requestStart;responseStart;responseEnd;name
                        //CHeck if entries are older then skip them.
                        if (resource[z].startTime < cur_offset)
                            continue;

                        if (isFilteredDom(filterDomains, resource[z].name)) continue;

                        //bytesIn- Total Transferred Bytes
                        if (resource[z].transferSize)
                            tSize = tSize + resource[z].transferSize;

                        //if filter is true then do not store resource timing. 
                        if (filter == true) continue;


                        //Note: we are keeping url at then end.
                        if (data != "") data += ",";

                        //TODO: check if all fields are present in all browser.
                        data = resource[z].initiatorType + ";" + t(resource[z].startTime) + ";" + parseFloat(resource[z].duration).toFixed(3) + ";" + t(resource[z].redirectStart) + ";" + t(resource[z].redirectEnd) + ";" + t(resource[z].domainLookupStart) + ";" + t(resource[z].domainLookupEnd) + ";" + t(resource[z].fetchStart) + ";" + t(resource[z].connectStart) + ";" + t(resource[z].secureConnectionStart) + ";" + t(resource[z].connectEnd) + ";" + t(resource[z].requestStart) + ";" + t(resource[z].responseStart) + ";" + t(resource[z].responseEnd) + ";" + encodeURIComponent(resource[z].name);

                        if (typeof resource[z].transferSize != "undefined") {
                            data = data + ";" + resource[z].transferSize + ";" + resource[z].encodedBodySize + ";" + resource[z].decodedBodySize;
                        }
                        else data = data + ";0;0;0";

                        if (typeof resource[z].nextHopProtocol != "undefined") {
                            data = data + ";" + resource[z].nextHopProtocol;
                        }
                        else data = data + ";";

                        if (resource[z].serverTiming && resource[z].serverTiming.length) {
                            for (var y = 0; y < resource[z].serverTiming.length; y++) {
                                var s = resource[z].serverTiming[y];
                                var prefix = (y == 0) ? ';' : '&&';
                                data += prefix + s.name + ":" + s.duration + ":" + s.description;
                            }
                            if (CAVNV.customData.length)
                                logCM(resource[z]);
                        }


                        allResources.push(data);

                    }
                }
                //Check if need to log navigation timing.
                if (!softNav && !isMainUrl)
                    logMainURLRT(w);
                logFrameRT(w);
                return allResources.join(',');
            }

            function getFailedResourceTiming() {
                var data = ResourceFailedDetector.getEntry();
                var sdata = "";
                var starttime, duration;

                for (var z = 0; z < data.length; z++) {
                    if (w.performance.getEntriesByName && w.performance.getEntriesByName(data[z].url).length != 0)
                        continue;
                    else if (w.performance.webkitGetEntriesByName && w.performance.webkitGetEntriesByName(data[z].url).length != 0)
                        continue;

                    {
                        starttime = parseInt(data[z].starttime) - pt.navigationStart;
                        duration = parseInt(data[z].endtime) - parseInt(data[z].starttime);
                        //add this dummy entry
                        //TODO: if initator is failed that means this url failed.
                        sdata = sdata + "," + 'failed' + ";" +
                            starttime + ';' +
                            0.00 /*duration*/ + ';' +
                            0.00 /*redirectStart*/ + ';' +
                            0.00 /*redirectEnd*/ + ';' +
                            0.00 /*domainLookupStart*/ + ';' +
                            0.00 /*domainLookupEnd*/ + ';' +
                            0.00 /*fetchStart*/ + ';' +
                            0.00 /*connectStart*/ + ';' +
                            0.00 /*secureConnectionStart*/ + ';' +
                            0.00 /*connectEnd*/ + ';' +
                            0.00 /*requestStart*/ + ';' +
                            0.00 /*responseStart*/ + ';' +
                            0.00 /*responseEnd*/ + ';' +
                            encodeURIComponent(data[z].url);
                    }
                }
                return sdata;
            }

            var filter = false;
            //Check for resourceTimingFilter.
            if (CAVNV.resourceTimingFilter.mode == true) {
                filter = true;
                var pageLoadTime = impl.vars["nt_time_to_load"], domCompleteTime = impl.vars["nt_time_to_DOC"];
                //check if pageload time is higher than specified time then send it. 
                var max_value = 60000;
                //Check if given in resourceTimingFilter then change that.
                if (!isNaN(CAVNV.resourceTimingFilter.maxPageLoadTime))
                    max_value = CAVNV.resourceTimingFilter.maxPageLoadTime;

                if (pageLoadTime > max_value || domCompleteTime > max_value)
                    filter = false;
                else {
                    //Check for % value.
                    var r = parseInt(Math.random() * 100);
                    if (r <= CAVNV.resourceTimingFilter.pct)
                        filter = false;
                }
            }

            // we will calculate total transferred bytes each time but will only store resource timing data when filter == false. 
            var data = getResourceTimingData(filter);

            if (filter == false && data != '') {
                //second arg is just to get timing for main url.
                var data = getResourceTimingData(filter);

                //now fet failed resource.
                data = data + getFailedResourceTiming();

                CAVNV.log("ResourceTiming Found, msg length - " + data.length);


                //resource timing will be send with eventtype -6.
                var eventMsg = (new Date().getTime()) + '|' + '-1|' + evType + '||-2||||-1|-1|-1|-1|' + data + '||-1|-1|||';
                //send log event only when we got sid.
                if (!CAVNV.sid) {
                    function cb() {
                        CAVUA.logEvent(eventMsg, true, "rt");
                    }
                    CAVNV.subscribe('after_beacon', cb, null, null);
                }
                else {
                    CAVUA.logEvent(eventMsg, true, "rt");
                }
            }
            impl.vars.transferBytes = tSize;
            //clear resource timing
            boomr.clearResourceTimings();
        },

        now: function () {
            //check if performance.now present then return that else newDate.
            if (window.performance.now && window.performance)
                return window.performance.now() + window.performance.timing.navigationStart;
            return new Date().getTime();
        },

        /*******Session State to fitler session******/
        BROWSER_STATE: 1,
        SESSION_STATE: 2,
        BUYER_STATE: 3
    };

    delete CAVNV_start;

    //TODO: currently alert can be generated only when we have sid. So it should be set on after_beacon otherwise it will not be triggered.
    boomr.send_alert = function () {
        var pendingAlertRequest = [];

        //set callback to send these requset after_beacon.
        function cb() {
            for (var z = 0; z < pendingAlertRequest.length; z++)
                alertFn(pendingAlertRequest[z]);
        }

        boomr.subscribe('after_beacon', cb, null, null);

        function alertEx(message, value, threshold, policy, sevarity) {
            if (!message)
                return -1;

            var req = [];
            req[0] = message;
            req[1] = value || -1;
            req[2] = threshold || -1;
            req[3] = policy || "NA";
            req[4] = sevarity || 1;

            //if sid is not yet there then add in pending request.
            //FIXME: handle case of filtering.
            if (!CAVNV.sid) {
                pendingAlertRequest.push(req);
                return 0;
            }

            alertFn(req);
        }

        function alertFn(req) {
            //make the alert url.
            var url = CAVNV.beacon_url + "?s=" + CAVNV.sid + "&p=" + CAVNV.protocolVersion + "&m=" + CAVNV.messageVersion + "&op=alert&pi=" + CAVNV.pageInstance + "&CavStore=" + CAVNV.store + "&pid=" + CAVNV.pageIndex + "&d=" + ((req[0] + ". Netvision Session Id - " + CAVNV.sid) + "|" + req[1] + "|" + req[2] + "|" + req[3] + "|" + req[4]) + "&lts=" + CAVNV.lts;

            var i = new Image();
            i.onload = function () {
                CAVNV.log("Alert request send successfully");
            }
            i.src = url;
        }

        return alertEx;
    }();

    //Initialize tti and fid library. 
    try {
        boomr.utils.eval_jsstring(tti_lib_str);
        boomr.utils.eval_jsstring(fid_lib_str);
    }
    catch (e) {
        if (console && typeof console.log == "function")
            console.log("Exception -> " + e);
    }
    //export CAVNV apis.
    w.cav_nv_ajax_pg_start = boomr.cav_nv_ajax_pg_start;
    w.cav_nv_ajax_pg_end = boomr.cav_nv_ajax_pg_end;
    w.cav_nv_pg_ready_cb = boomr.cav_nv_pg_ready_cb;
    w.cav_nv_pg_unload_cb = boomr.cav_nv_pg_unload_cb;
    w.cav_nv_before_beacon_cb = boomr.cav_nv_before_beacon_cb;
    w.cav_nv_after_beacon_cb = boomr.cav_nv_after_beacon_cb;
    w.cav_nv_get_session_data = boomr.cav_nv_get_session_data;
    w.cav_nv_set_session_data = boomr.cav_nv_set_session_data;
    w.cav_nv_add_cb = boomr.cav_nv_add_cb;
    w.cav_nv_set_loginid = boomr.cav_nv_set_loginid = function (s) {
        if (typeof s != 'string') return;
        if (CAVNV.loginIDLowerCase) s = s.toLowerCase();
        //replacing the domain with 7 stars
        s = s.replace(/@.*$/g, '*******');
        //need to be encrypted.
        s = CAVNV.utils.encode(s);
        w.cav_nv_log_event("LoginID", { 'LoginID': s });
    };
    w.cav_nv_set_sessionid = boomr.cav_nv_set_sessionid = function (s) {
        if (typeof s != 'string') return;
        //encrypt this.
        s = CAVNV.utils.encode(s);
        w.cav_nv_log_event("SessionID", { 'SessionID': s });
    };
    w.cav_nv_set_orderTotal = boomr.cav_nv_set_orderTotal = function (s) {
        if (isNaN(s) || CAVNV.__sms) return;
        //encrypt this.
        //s = CAVNV.utils.encode(s);
        //Issue: order info mismatch either due to request failure or due to closing of the order confirmation page before sending el.
        //Design: will save the order info and send it in timing request cumulative so that we can try on next page. In el sending sample. 
        var sc = 1, st = s;
        var ot = parseInt(CAVNV.get_session_flag('orderTotal')) || 0;
        var oc = parseInt(CAVNV.get_session_flag('orderCount')) || 0;
        if (ot) {
            st += ot; //keep sum of order totals received yet of a session
            sc = oc + 1;
        }
        CAVNV.set_session_flag('orderTotal', st);
        CAVNV.set_session_flag('orderCount', sc);
        //will send the ordertotal here only is sid is present coz before that timing has already sent the order info.
        if (CAVNV.sid)
            w.cav_nv_log_event("OrderTotal", { 'OrderTotal': s });
        CAVNV.plugins.EL.flush(true);
    };

    w.cav_nv_set_transactionId = boomr.cav_nv_set_transactionId = function (s) {
        //In kohls POC - transaction id they were searching for is 0000.
        //log the transaction whatever receives
        w.cav_nv_log_event('transactionID', { 'transactionID': s });
    };

    //Api to load custom metrics.
    //syntax: cav_nv_log_userdata(name, value)
    //      : cav_nv_log_userdata(array of name, array of value)
    //user can log multiple customMetrics in a single api, just by sending in array.
    w.cav_nv_log_customMetrics = boomr.cav_nv_log_customMetrics = function (name, value, value2, value3, value4) {
        var default_val = {
            1: 0, //int
            2: 0.0, //double
            3: '',  //text
            4: {} //json.
        };

        //This flag will be used to consume all four columns of custom metrics table.
        var allflag = false;
        if (typeof name === 'undefined' || name == null || typeof value === 'undefined' || value == null) return;
        if (typeof name === "string" && typeof value === 'string' || typeof value === 'number' || typeof value == 'object') {
            name = [name];
            value = [value];
            if (value2 != undefined) allflag = true;
        }
        //name is array and other value is array or single value.
        if (boomr.utils.isArray(name)) {
            if (!boomr.utils.isArray(value)) {
                value = [value];
                //copy value as length of name 
                for (var z = 1; z < name.length; z++)
                    value.push(value[0]);
            }
        }
        var cm = null;
        //now we have both name and value array. pick each value check for it's type and dump it.
        for (var z = 0; z < name.length; z++) {
            //if name or value is null then ---->
            if (typeof name[z] === 'undefined' || name[z] == null || typeof value[z] === 'undefined' || value[z] == null) continue;

            //search in CAVNV.customMetrics array.
            cm = null;
            for (var y = 0; y < CAVNV.customMetrics.length; y++) {
                if (name[z] === CAVNV.customMetrics[y].name) { cm = CAVNV.customMetrics[y]; break; }
            }
            if (cm == null) {
                CAVNV.error('CAVNV, Invalid CustomMetrics name ' + name[z]);
                continue;
            }
            //validate it's type and log into event.
            //we need to send data in such a format so it can directoly be copied into db.
            //format will be: customMetricsID|numberValue|doublevalue|string|json
            if (!allflag) {
                if (cm.type == 'number')
                    boomr.utils.isNumber(value[z]) && w.cav_nv_log_event('customMetrics', cm.id + '|' + value[z] + '|0.0||');
                else if ((cm.type == 'double'))
                    boomr.utils.isNumber(value[z]) && w.cav_nv_log_event('customMetrics', cm.id + '|0|' + value[z].toString() + '||');
                else if ((cm.type == 'text' || cm.type == 'string')) {
                    //Note: encoding is applicable only for text type of custommetrics we can apply that on json object also.
                    if (cm.encode == true)
                        w.cav_nv_log_event('customMetrics', cm.id + '|0|0.0|' + CAVNV.utils.encode(value[z].toString()).replace(/\"/g, "%22") + '|');
                    else
                        w.cav_nv_log_event('customMetrics', cm.id + '|0|0.0|' + value[z].toString().replace(/\"/g, '%22') + '|');
                }
                //If type is something else then just serialize it into json and apply encoding and send this.
                //and this data will go in json format.
                else {
                    try {
                        //FIXME: check if we need to encode json object.
                        if (cm.encode == true)
                            w.cav_nv_log_event('customMetrics', cm.id + '|0|0.0||' + CAVNV.utils.encode(encodeURIComponent(JSON.stringify(value[z]))));
                        else
                            w.cav_nv_log_event('customMetrics', cm.id + '|0|0.0||' + encodeURIComponent(JSON.stringify(value[z])));
                    }
                    catch (e) { }
                }
            }
            else {
                //just dump all the columns.
                if (isNaN(value[z])) value[z] = default_val[1];
                value2 = value2 || default_val[2];
                if (isNaN(value2)) value2 = default_val[2];
                value3 = value3 || default_val[3];
                value4 = value4 || default_val[4];
                if (cm.encode == true) {
                    //Note: this case  will not happen.
                    w.cav_nv_log_event('customMetrics', cm.id + '|' + value[z] + '|' + value2 + '|' +
                        CAVNV.utils.encode(value3.toString()).replace(/\"/g, "%22") + '|' +
                        CAVNV.utils.encode(encodeURIComponent(JSON.stringify(value4))));
                }
                else {
                    w.cav_nv_log_event('customMetrics', cm.id + '|' + value[z] + '|' + value2 + '|' +
                        value3.toString().replace(/\"/g, '%22') + '|' +
                        encodeURIComponent(JSON.stringify(value4)));
                }
            }
        }
    };

    boomr.cav_nv_log_userSegment = function (mask) {
        if (!mask) {
            var m = CAVNV.get_session_flag("uSHistory");
            if (!m) return;
            mask = m[0];
        }
        w.cav_nv_log_event("userSegmentMask", mask);
    }

    //this method will set the userSegment using api.
    w.cav_nv_set_userSegment = boomr.cav_nv_set_userSegment = function (id) {
        var hd = CAVNV.get_session_flag("uSHistory");
        hd = hd || "0|"
        var h = hd.split('|');
        var mask = parseInt(h[0]) | Math.pow(2, id);
        h[0] = mask;
        CAVNV.set_session_flag("uSHistory", h.join("|"));
        CAVNV.cav_nv_log_event("userSegmentMask", mask);
        CAVNV.plugins.EL.flush(true);
    }



    w.cav_nv_enable_nd = boomr.cav_nv_enable_nd;

    //TODO: add different type of logger type and api so it can take lineno and plugin etc by itself.
    //set logger.
    var console = null;
    try {
        console = w.top.console;
    } catch (e) {
        console = w.console;
    }
    boomr.log = (function () {
        //Check if console available then okay. 
        if (console && console.log) {
            var d = function (s) {
                if (CAVNV.log_level)
                    console.log("NVLogs:" + s);
            }
            return d;
        }
        else
            return function () { return };
    })();
    //set other logger.
    boomr.debug = boomr.info = boomr.log;

    boomr.error = (function () {
        if (console && console.error)
            return function (s) { console.error("NVErrors:" + s); };
        else if (console && console.log)
            return function (s) { console.log("NVErrors:" + s); };
        else
            return function () { };
    })();
    boomr.warn = boomr.error;

    //copy boomr into CAVNV
    for (k in boomr) {
        if (boomr.hasOwnProperty(k)) {
            CAVNV[k] = boomr[k];
        }
    }

    // Now we start built in plugins.
    /**************CAVNV Plugins********************/

    CAVNV.plugins = CAVNV.plugins || {};

    /****************CONFIG****************/
    //TODO: remove this pluign. And add corresponding handling in init.
    //Configuration Load Plugin.
    //This plugin will load configuration from server. 
    (function (h) {
        var again = 0,
            plugin_loaded = false,
            d = h.document,
            jquery_fn_needed = ["on", "off"],
            load_conf, finish, get_pageIndex, load_js, jqPresent, update_pageIndex,
            jquery_e, load_jquery, jquery_loaded = false;
        var config = {};
        load_js = function () {
            //load config.js
            load_conf();

            //Check if jQuery present then set that on CAVNV 
            if (jqPresent() == true) {
                CAVNV.jQuery = h.jQuery;
                jquery_loaded = true;
                if (CAVNV.inlineConfig)
                    finish();
                return;
            }

            //Note: We have checked jquery still we calling load_jquery that is just 
            //check if jquery already present then no need to load jquery. this should be called on page_ready
            if (h !== window) {
                CAVNV.subscribe('page_ready', load_jquery, null, null);
            }
            else {
                load_jquery();
            }
        };

        jqPresent = function () {
            if (!h.jQuery || !h.jQuery.fn) return false;

            for (var z = 0; z < jquery_fn_needed.length; z++) {
                if (typeof h.jQuery.fn[jquery_fn_needed[z]] != 'function') {
                    return false;
                }
            }
            return true;
        }
        load_jquery = function () {
            if (h.module && h.module.exports)
                CAVNV.exports = h.module.exports;
            //Check if existing jquery having needed function. 
            if (jqPresent() == true) {
                jquery_loaded = true;
                CAVNV.jQuery = h.jQuery;
                if (again >= 2 || CAVNV.inlineConfig) {
                    CAVNV.log("Netvision, CONFIG: configuration and jquery both loaded, sending beacon.");
                    finish();
                }
                return;
            }

            //Don't have valid jquery.
            if (!config.jquery_url) return;

            var n = d.getElementsByTagName('script')[0];
            jquery_e = d.createElement('script');
            jquery_e.src = config.jquery_url;
            var jquery_found = h.jQuery ? 1 : 0;
            //add a lister and this listener will call load_js.
            //In IE onload doesn't work for dynamic script loading.
            var jquery_load_callback = function () {
                if (jquery_loaded == true) return;
                jquery_loaded = true;
                CAVNV.log("Netvision, CONFIG: jquery loaded.");
                //CAVNV.cav_nv_log_tm('LoadJqueryEnd');
                //remove conflict.
                //FIXME: what if client jquery loaded in between jquery load start - done.
                // in some apps, jquery is contained in exports module of windows
                if (jquery_found) CAVNV.jQuery = h.jQuery.noConflict(true);
                else {
                    CAVNV.jQuery = h.jQuery;
                    if (!CAVNV.jQuery && h.module && typeof h.module.exports == "function")
                        CAVNV.jQuery = h.module.exports;
                }
                //check if cavnv was waiting for jquery then just break it's fast.
                if (again >= 2 || CAVNV.inlineConfig) {
                    CAVNV.log("Netvision, CONFIG: configuration and jquery both loaded, sending beacon.");
                    finish();
                }
            };
            jquery_e.onload = jquery_load_callback;
            jquery_e.onreadystatechange = function () {
                if (this.readyState == 'complete' || this.readyState == 'loaded') jquery_load_callback();
            }
            //CAVNV.cav_nv_log_tm('LoadJqueryStart');
            n.parentNode.insertBefore(jquery_e, n);
        };

        load_conf = function () {

            //To handle inline config.
            if (!config.config_url) return;

            //CAVNV.cav_nv_log_tm('ConfigLoadStart');
            //this will create a new script element in 
            var n = d.getElementsByTagName('script')[0];
            var m = d.createElement('script');
            //var t = new Date().getTime();
            //create src.
            //we are adding time stamp so url can not be cahced.
            //TODO: need to make client_id configurable.
            //m.src = "//192.168.1.45/nv/<CLIENT-ID>/config.js?t=" + t;  
            //m.src = config.config_url + "?t=" + t;
            var msrc = config.config_url;
            //check if version information is given then add that at then end.
            var version = w.__nv_agent_version;
            if (w.localStorage) {
                var ver = JSON.parse(w.localStorage.getItem('_nvLibVer'));
                if (ver && ver.cfv != "0") version = ver.cfv;
            }
            if (!version) {
                version = (function () {
                    //query for script like cav_nv.js.
                    var s = null;
                    if (document.querySelector) { s = document.querySelector('[src*="cav_nv"]'); }
                    if (!s) {
                        s = document.getElementsByTagName('script');
                        for (var z = 0; z < s.length; z++) {
                            if (s[z].src && s[z].src.indexOf('cav_nv') >= 0) {
                                s = s[z]; break;
                            }
                        }
                    }
                    if (s && s.src && s.src.indexOf('?') > 0) {
                        var v = s.src.substr(s.src.indexOf('?') + 1);
                        return v;
                    }
                    return null;
                })();
                w.__nv_agent_version = version;
            }
            if (version) {
                if (msrc.indexOf('?') > 0)
                    msrc = msrc + "&v=" + version;
                else
                    msrc = msrc + "?v=" + version;
            }
            // setting src only once, as if set more than once, ie sends request each time src is set
            m.src = msrc;
            //now insert it before first script tag.
            n.parentNode.insertBefore(m, n);
            //TODO: currently we are loading it once. but in future we may have to load it multiple time to handle ajax calls.
        };

        //This method will be exported to get pageIndex from url or javascript var.
        //Refer from get_pageIndex.
        get_pageIndex = function (page_url, pageName) {
            var pageIndex = -1;
            var get_path = function (url) {
                var path = url;
                if (/^https?:\/\//.test(url)) path = url.substr(url.indexOf('/', 8));
                //now split from ? or #.
                var s = path.indexOf('?');
                //check for #.
                if (s == -1) s = path.indexOf('#');
                if (s != -1) path = path.substr(0, s);
                return path;
            };
            //There will be two urls. 
            //1. complete url (with query string)
            //2. url without query string.
            //Mode1: js var mode.
            if (typeof config.pageGroupName !== 'undefined' && config.pageGroupName != null && pageName) {
                pageName = pageName.toLowerCase();
                for (var id = 0; id < config.pageGroupName.length; id++) {
                    if (config.pageGroupName[id].c.toLowerCase() == pageName) {
                        pageIndex = config.pageGroupName[id].s;
                        break;
                    }
                }
            }
            //Mode2: regex mode.
            else if (typeof config.pageUrlValues !== 'undefined' && page_url) {
                page_url = page_url.toLowerCase();
                var url_without_query_string = get_path(page_url).toLowerCase();
                for (var id = 0; id < config.pageUrlValues.length; id++) {
                    var cs = config.pageUrlValues[id];
                    if (typeof cs.c == "string") {
                        var l = cs.c.length;
                        var s = (cs.c[0] == '/') ? cs.c.substring(1, l - 1) : cs.c;
                        cs.c = new RegExp(s);
                    }
                    if ((cs.cu !== undefined && cs.cu == true && cs.c.test(page_url)) || (cs.c.test(url_without_query_string))) {
                        pageIndex = cs.s;
                        break;
                    }
                }
            }
            return pageIndex;
        };

        update_pageIndex = function (lconfig) {

            if (lconfig === undefined || lconfig == null) lconfig = config;

            var pageIndex = -1;
            //Currently we are supporting two modes.
            //1. javascript variable(TODO: make pagegroup var configurable) 
            //2. regex.(TODO: handle regex properly)
            if (lconfig.pageGroupVar === 'undefined' || lconfig.pageGroupVar === null) lconfig.pageGroupVar = 'CAV_PG_VAR';

            if (typeof lconfig.pageGroupName !== 'undefined' && lconfig.pageGroupName != null && typeof h[lconfig.pageGroupVar] !== 'undefined') {
                var pageName = h[lconfig.pageGroupVar].toLowerCase();
                for (var id = 0; id < lconfig.pageGroupName.length; id++) {
                    if (lconfig.pageGroupName[id].c.toLowerCase() == pageName) {
                        pageIndex = lconfig.pageGroupName[id].s;
                        break;
                    }
                }
            }
            else if (typeof lconfig.pageUrlValues !== 'undefined') {

                //var page_url = (document.location.pathname).toUpperCase();
                var page_url = (h.document.location.pathname).toLowerCase();
                var page_url_with_query = (h.document.location.href).toLowerCase();
                var id, cs;
                //If completeUrl cu flag is enable then we will search in complete url else in pathname only.  
                //first check for pathname, if not found then check with query string.
                for (id = 0; id < lconfig.pageUrlValues.length; id++) {
                    cs = lconfig.pageUrlValues[id];
                    if (typeof cs.c == "string") {
                        var l = cs.c.length;
                        var s = (cs.c[0] == '/') ? cs.c.substring(1, l - 1) : cs.c;
                        cs.c = new RegExp(s);
                    }
                    if ((cs.cu !== undefined && cs.cu == true && cs.c.test(page_url_with_query)) || (cs.c.test(page_url))) {
                        pageIndex = cs.s;
                        break;
                    }
                }
            }
            CAVNV.log("value of pageIndex is " + pageIndex);
            CAVNV.pageIndex = pageIndex;
            //check if navigationtiming plugin done then need to modify pageIndex vars.
            if (CAVNV.plugins.NavigationTiming.is_complete()) {
                CAVNV.modifyVar('pageIndex', pageIndex);
            }
        };

        finish = function () {
            if (plugin_loaded) return;

            plugin_loaded = true;

            //TODO: check where to initialize useraction.
            if (CAVNV.config.USERACTION.enabled != false)
                CAVNV.plugins.USERACTION.init(CAVNV.config);

            if (CAVNV.insideFrame) return;

            /*    now pageIndex will be assign at init time. so we don't need this.
                  //TODO: add another plugin to assign page index.
                  //now plugin have loaded so we have all configuration. now modify pageIndex. 
                  update_pageIndex();
            */

            //check if CAVNV.getChannel defined then update channel info.
            CAVNV.channel = 0;
            if (typeof CAVNV.getChannel === 'function') {
                var channel = 0;
                try {
                    channel = CAVNV.getChannel();
                }
                catch (e) { }
                if (typeof channel == 'number') {
                    CAVNV.channel = channel;
                    if (CAVNV.plugins.NavigationTiming.is_complete())
                        CAVNV.modifyVar('channel', channel);
                }
            }

            //start timer to send data in interval of CAVNV.dataFlushInterval.
            CAVNV.dataFlushTimer = setInterval(CAVNV.flush_all, CAVNV.dataFlushInterval);

            //Flush all the module data of sbqueue after 1min.
            CAVNV.dataFlushTimer = setInterval(function () { CAVNV.sbqueue.flush(); }, 60000);

            //NOTE: currently loading once, otherwise set again to false.
            CAVNV.sendBeacon();
        };

        CAVNV.plugins.CONFIG = {
            init: function (c) {
                if (CAVNV.insideFrame) {
                    CAVNV.inlineConfig = true;
                    load_jquery();
                    return this;
                }
                //if already loaded then no need to load it again.
                if (plugin_loaded) return this;
                var kw = ['config_url', 'pageGroupName', 'pageUrlValues', 'pageGroupVar', 'jquery_url'];

                //load configuration.
                CAVNV.utils.pluginConfig(config, c, 'CONFIG', kw);

                //check if config given in nv_bootstrap.js then we will give preference to that.
                var e = document.getElementById('boomr-if-as');
                if (e) {
                    var cp = e.getAttribute('configurl');
                    if (typeof cp === 'string') config.config_url = cp;
                    CAVNV.log('configuration file path - ' + cp);
                }

                /*
                if (typeof config.config_url === 'undefined' || config.config_url === null) {
                  CAVNV.log('Netvision, config_url not configured');
                  return false;
                }
                 
                if (typeof config.jquery_url === 'undefined' || config.jquery_url === null) {
                  CAVNV.log('Netvision, jQuery Url not given');
                  return false;
                }
                */
                if (jquery_loaded) {
                    //immediately call finish method.
                    finish();
                    return this;
                }
                //If it is not main window then let main window be loaded. 
                if (again == 0) {
                    load_js();
                }
                again++;
                return this;
            },
            is_complete: function () {
                return plugin_loaded;
            },
            //this is being used in other places.
            get_pageIndex: get_pageIndex,
            setPageIndex: update_pageIndex
            //TODO: currently we have not defined restart() function for this plugin.
        }
    }(CAVNV.window));

    /*************Navigation-Timing*****************/
    (function () {

        // First make sure CAVNV is actually defined.  It's possible that your plugin is loaded before boomerang, in which case
        // you'll need this.
        window.CAVNV = window.CAVNV || {};
        CAVNV.satis = 0; //TODO: weightage decision
        CAVNV.toler = 0;
        CAVNV.frus = 0;
        CAVNV.retryTiming = 0;
        CAVNV.plugins = CAVNV.plugins || {};
        CAVNV.iframePorts = [];
        CAVNV.__sms = 0;
        CAVNV.__uaEnabled = true;
        CAVNV.pageInstanceCounter = 0;  //this will be added to parent pageinstance before sending to iframe.
        CAVNV.parentComDone = false; //this is to indicate if message received from parent.
        //Initialize because in case of performance timing not available.
        CAVNV.nav_start_time = Date.now();
        CAVNV.nav_offset = 0;
        CAVNV.snapshotInstance = 0;
        CAVNV.pendingSnapshot = {};
        var lastClick = -1;
        CAVNV.ndInfo = { tierId: -1, serverId: -1, instanceId: -1, instrFlag: false };
        // A private object to encapsulate all your implementation details
        var impl2 = {
            complete: false,
            done: function () {
                var w = CAVNV.window,
                    p, pn, pt, data;
                var d = w.document;
                var redirectCount, redirectTime;
                var Version = 1;
                //If already done then don't go again.
                if (this.complete) return; {
                    //CAVNV.cav_nv_log_tm('TimingCollectionStart');
                    //Update Timing:
                    var nt_dns_time, nt_dom_time, nt_unload_time, nt_res_Time, nt_server_reponse_time, nt_req_time, nt_secure_con_time, nt_dom_interactive;
                    var nt_red_count;
                    if ((p = w.performance || w.msPerformance || w.webkitPerformance || w.mozPerformance) && p.timing && p.navigation) {
                        CAVNV.info("This user agent supports NavigationTiming.", "nt");
                        pn = p.navigation;
                        pt = p.timing;
                        redirectCount = pn.redirectCount;

                        //set navigation start time on CAVNV object, so other plugins can use that.
                        CAVNV.nav_start_time = pt.navigationStart;
                        CAVNV.log("Navigation start time = " + CAVNV.nav_start_time);
                        nt_nav_type = pn.type;
                        CAVNV.navtype = nt_nav_type;
                        // Calculation of redirectTime
                        if (pt.redirectEnd == 0 || pt.redirectStart == 0 || pn.redirectCount == 0) nt_red_time = -1;
                        else nt_red_time = pt.redirectEnd - pt.redirectStart;

                        var cache_flag = 0;
                        // Calculation of app cache time 
                        if (pt.domainLookupEnd != pt.fetchStart) {
                            nt_app_cache_time = pt.domainLookupStart - pt.fetchStart
                            cache_flag = 1;
                        }
                        else if (pt.connectEnd != pt.fetchStart) {
                            nt_app_cache_time = pt.connectStart - pt.fetchStart
                            cache_flag = 1;
                        }
                        else {
                            nt_app_cache_time = pt.requestStart - pt.fetchStart
                            cache_flag = 2;
                        }

                        if (nt_app_cache_time > 3600000) nt_app_cache_time = -1;
                        // Calculation of fetch time
                        if (pt.responseEnd > 0 && pt.fetchStart > 0 && (pt.responseEnd - pt.fetchStart) < 3600000)
                            nt_fetch_time = pt.responseEnd - pt.fetchStart;
                        else
                            nt_fetch_time = -1;

                        // Calculation of domain lookup time
                        if (pt.domainLookupEnd == 0) nt_dns_time = -2 // In case of cross origin
                        //else if (pt.domainLookupEnd== pt.fetchStart+nt_app_cache_time)
                        else if (cache_flag == 2 || pt.domainLookupEnd == pt.fetchStart + nt_app_cache_time) {
                            nt_dns_time = -1

                        }
                        else nt_dns_time = pt.domainLookupEnd - pt.domainLookupStart

                        // Calculatin of connect and ssl time
                        var nt_con_time;
                        if (pt.connectEnd == 0) {
                            nt_con_time = -2 // In case of cross origin
                            nt_secure_con_time = -2 // In case of cross origin
                        }
                        else if (pt.connectEnd == pt.domainLookupEnd) {
                            nt_con_time = -1
                            nt_secure_con_time = -1
                        }
                        else if (pt.secureConnectionStart != 0 && pt.secureConnectionStart != undefined) {
                            nt_con_time = pt.secureConnectionStart - pt.connectStart
                            nt_secure_con_time = pt.connectEnd - pt.secureConnectionStart
                        }
                        else {
                            nt_con_time = pt.connectEnd - pt.connectStart
                            nt_secure_con_time = -1
                        }

                        // Calculatin of request time
                        nt_req_time = pt.responseStart - pt.requestStart

                        // Calculation of first byte time
                        //Note: we are getting garbage value of responseStart and Request Start so we are putting check on responseStart till the issue gets resolved.
                        //responseEnd was lesser than responseStart
                        var nt_first_byte_time;
                        if (pt.responseStart == 0 || pt.requestStart == 0 || (pt.responseStart > pt.responseEnd)) nt_first_byte_time = -2
                        else
                            //nt_first_byte_time = (pt.responseStart - pt.requestStart)
                            nt_first_byte_time = (pt.responseStart - pt.navigationStart);

                        //Calculation of server Response time.
                        var nt_server_response_time = -1;
                        if (pt.responseStart == 0 || pt.requestStart == 0) nt_server_response_time = -2;
                        else
                            nt_server_response_time = (pt.responseStart - pt.requestStart);

                        // Calculatin of response time
                        var nt_res_time;
                        if (pt.responseStart == 0 || pt.responseEnd == 0 || (pt.responseEnd - pt.responseStart) > 3600000 || (pt.responseStart > pt.responseEnd))
                            nt_res_time = -2;
                        else nt_res_time = pt.responseEnd - pt.responseStart;

                        // Calculatin of unload time
                        if (pt.unloadEventEnd == 0) nt_unload_time = -2
                        else {
                            //Check if unloadLC is enabled then we have to take from last click. 
                            var uStart = pt.unloadEventStart;
                            if (CAVNV.unloadLC) {
                                var s = w.sessionStorage;
                                var lc;
                                if (!!s)
                                    lc = s.getItem('nvlc');
                                if (lc && lc.split('#')[1] == d.referrer.substr(0, 1024)) {
                                    var l = parseInt(lc.split(':')[0]);
                                    if (l > 0) uStart = l;
                                }
                            }
                            nt_unload_time = (pt.unloadEventEnd - uStart)
                        }

                        // Calculation of DOM time
                        //nt_dom_time = pt.domContentLoadedEventEnd - pt.domContentLoadedEventStart
                        nt_dom_time = pt.domComplete - pt.domLoading

                        // Calculation of content load time
                        //nt_dom_content_load_time = pt.domContentLoadedEventEnd - pt.navigationStart
                        if (pt.domContentLoadedEventEnd)
                            nt_dom_content_load_time = pt.domContentLoadedEventEnd - pt.domContentLoadedEventStart;
                        else
                            nt_dom_content_load_time = 0;
                        if (nt_load_time > 3600000) nt_load_time = -1;

                        if (pt.domInteractive && pt.domInteractive - pt.navigationStart < 3600000)
                            nt_dom_interactive = pt.domInteractive - pt.navigationStart;
                        else
                            nt_dom_interactive = -1;
                        //check if pt.loadEventEnd set or not.
                        //In IE9, pt.loadEventEnd was not set untill this point. so we will update nt_load_time and nt_time_to_load
                        //before sending timing data.
                        var nt_load_time = -1;
                        var nt_time_to_load = -1;
                        if (pt.loadEventEnd > 0) {
                            // Calculation of load event time 
                            nt_load_time = pt.loadEventEnd - pt.loadEventStart;
                            if (nt_load_time > 3600000) nt_load_time = -1;

                            // Calculation of page load time
                            //nt_page_load_time = pt.loadEventEnd - pt.navigationStart
                            nt_time_to_load = (pt.loadEventStart - pt.navigationStart);
                            //set flag.
                            CAVNV.loadTimeDone = true;
                        }

                        //Dom complete time.
                        //Note: this we will update while sending beacon.
                        if (pt.domContentLoadedEventStart)
                            nt_time_to_DOC = (pt.domContentLoadedEventStart - pt.navigationStart);
                        else
                            nt_time_to_DOC = 0;

                        function getPT2(timing) {
                            var fp = p.getEntriesByName(timing);
                            if (fp.length > 0) {
                                return parseInt(Math.max(fp[0].startTime));
                            }
                            return -1;
                        }

                        //set paint timing. 
                        nt_fp = getPT2('first-paint');
                        nt_fcp = getPT2('first-contentful-paint');
                    }
                    else {
                        // In case of browser which doesn't support performance API, setting all timings to -1. eg: Safari.
                        redirectCount = 0;
                        nt_nav_type = -1;
                        nt_red_count = -1;
                        nt_red_time = -1;
                        nt_app_cache_time = -1;
                        nt_fetch_time = -1;
                        nt_dns_time = -1;
                        nt_con_time = -1;
                        nt_secure_con_time = -1;
                        nt_first_byte_time = -1;
                        nt_res_time = -1;
                        nt_unload_time = -1;
                        nt_dom_time = -1;
                        nt_dom_content_load_time = -1;
                        nt_load_time = -1;
                        nt_time_to_load = -1;
                        nt_time_to_DOC = -1;
                        nt_server_response_time = -1;
                        nt_dom_interactive = -1;
                        nt_fp = -1;
                        nt_fcp = -1;
                        CAVNV.loadTimeDone = true;
                    }

                    //Update Access:
                    var accessType = new Array("28K", "56K", "CABLE", "DSL", "T1", "FASTETHERNET", "HIGHSPEED", "384K_DSL", "1M_DSL", "2.5M_DSL", "VDSL2", "VDSL", "E3", "ADSL2+", "ADSL2", "ADSL", "E2", "T2", "SDSL", "E1", "HDSL", "G.LITE", "UMB", "HSDPA/HSUPA(3.5G)", "EDGEEVOLUTION(TYPE2MS)", "EDGE(TYPE2MS)", "EDGE(2.75G)", "3G", "CDMA2000", "HSPA+", "UMTS3G", "LTE", "4G", "LTEADVANCED", "WIDEN", "GPRS(2.5G)", "HSCSD", "GSM_CSD(2G)", "ISDN", "WLAN/WIFI");
                    //Currently we are unable to get access from JS.
                    var CavAccessType = (typeof (CavServiceConf) != "undefined" && CavServiceConf.access != null) ? CavServiceConf.access.toUpperCase() : "";

                    var accessIndex = -1;
                    for (var i = 0; i < accessType.length; i++) {
                        if (accessType[i] == CavAccessType) {
                            accessIndex = i;
                            break;
                        }
                    }
                    CAVNV.log("Access Type = " + CavAccessType + "AccessIndex = " + accessIndex);

                    //Update Screen Resolution:
                    var screen_resolution = new Array("42x11", "16x16", "40x30", "32x32", "42x32", "48x32", "60x40", "150x40", "84x48", "64x64", "72x64", "75x64", "96x64", "1360x768", "102x64", "240x64", "96x65", "96x96", "160x102", "160x120", "128x128", "432x128", "160x144", "224x144", "160x152", "160x160", "240x160", "144x168", "208x176", "220x176", "140x192", "256x192", "280x192", "320x192", "560x192", "160x200", "320x200", "640x200", "208x208", "320x208", "320x224", "480x234", "240x240", "320x240", "400x240", "432x240", "376x240", "640x240", "800x240", "480x250", "160x256", "256x256", "320x256", "512x256", "640x256", "400x270", "480x272", "400x300", "320x320", "480x320", "640x320", "512x342", "720x348", "640x350", "720x350", "416x352", "800x352", "640x360", "720x364", "512x384", "640x400", "600x480", "640x480", "768x480", "800x480", "848x480", "854x480", "480x500", "640x512", "960x540", "960x544", "1024x576", "800x600", "1024x600", "832x624", "960x640", "1024x640", "1136x640", "960x720", "1152x720", "1024x768", "1152x768", "1024x800", "1280x720", "1120x832", "1280x768", "1280x600", "1152x864", "1280x800", "1152x900", "1024x1024", "1366x768", "1280x854", "1600x768", "1280x960", "1440x900", "1280x1024", "1440 x 960", "1600x900", "1400x1050", "1440x1024", "1440x1080", "1600x1024", "1680x1050", "1600x1200", "1920x1080", "1920x1200", "2048x1152", "1792x1344", "1856x1392", "2880x900", "1800x1440", "2048x1280", "1920x1400", "2538x1080", "2560x1080", "1920x1440", "2048x1536", "2304x1440", "2560x1440", "2304x1728", "2560x1600", "2560x1700", "2560x1920", "2880x1800", "2560x2048", "2800x2100", "3200x1800", "3200x2048", "3200x2400", "3840x2160", "3840x2400", "4096x2304", "4096x3072", "5120x3200", "5120x4096", "6400x4096", "6400x4800", "7680x4320", "7680x4800", "8192x4608", "1053x380");

                    var width = (typeof (CavServiceConf) != "undefined") ? CavServiceConf.width : screen.width,
                        height = (typeof (CavServiceConf) != "undefined") ? CavServiceConf.height : screen.height,
                        screenSize = width + "x" + height, screenIndex = -1;

                    for (var i = 0; i < screen_resolution.length; i++) {
                        if (screen_resolution[i] == screenSize) {
                            screenIndex = i;
                            break;
                        }
                    }

                    //If not matched with any of the above then just send whatever u got.
                    if (screenIndex == -1) {
                        width = width << 16;
                        width = width | height;
                        screenIndex = width;
                    }

                    var t = true;
                    var ua = (typeof (CavServiceConf) != "undefined") ? CavServiceConf.userAgent.toUpperCase() : navigator.userAgent.toUpperCase();
                    var ua_orig = (typeof (CavServiceConf) != "undefined") ? CavServiceConf.userAgent : navigator.userAgent;
                    //set flag if session is of CAVNVSM 
                    if ((ua.indexOf("CAVNVSM") != -1) || (ua.indexOf("SOASTA") != -1))
                        CAVNV.__sms = 1;

                    CAVNV.log("UserAgent = " + ua);

                    //Update Browser: 
                    function detectBrowserDetails(ua) {
                        //alert("value of ua is \t\t" + ua);
                        function getFirstMatch(regex) {
                            var match = ua.match(regex);
                            return (match && match.length > 1 && match[1]) || '';
                        }

                        var iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase(),
                            likeAndroid = /like android/i.test(ua),
                            android = !likeAndroid && /android/i.test(ua),
                            versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i),
                            tablet = /tablet/i.test(ua),
                            mobile = !tablet && /[^-]mobi/i.test(ua),
                            result

                        if (/opera|opr/i.test(ua)) {
                            result = {
                                name: 'Opera',
                                index: 4,
                                opera: t,
                                version: versionIdentifier || getFirstMatch(/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)
                            }
                        }
                        else if (/netscape|navigator/i.test(ua)) {
                            result = {
                                name: 'Netscape',
                                index: 16,
                                opera: t,
                                version: getFirstMatch(/(?:netscape|netsc)[\s\/](\d+(\.\d+)?)/i) || getFirstMatch(/(?:navigator|navig)[\s\/](\d+(\.\d+)?)/i)
                            }
                        }
                        else if (/nokia|OVIBROWSER/i.test(ua)) {
                            result = {
                                name: 'OVI Browser',
                                index: 17,
                                nokia: t
                                //version: getFirstMatch(/(?:netscape|netsc)[\s\/](\d+(\.\d+)?)/i) || getFirstMatch(/(?:navigator|navig)[\s\/](\d+(\.\d+)?)/i)
                            }
                        }

                        else if (/windows phone/i.test(ua)) {
                            result = {
                                name: 'Windows Phone',
                                index: 2, //Since native browser of Windows phone is IE, so sending the index of IE.
                                windowsphone: t,
                                msie: t,
                                version: getFirstMatch(/iemobile\/(\d+(\.\d+)?)/i)
                            }
                        }
                        else if (/msie|trident/i.test(ua)) {
                            result = {
                                name: 'Internet Explorer',
                                index: 2,
                                msie: t,
                                version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
                            }
                        }
                        else if (/Edg/i.test(ua)) {
                            result = {
                                name: 'Internet Edge',
                                index: 5,
                                msie: t,
                                version: getFirstMatch(/(?:Edg)\/(\d+(.\d)?)/i)
                            }
                        }
                        else if (/chrome|crios|crmo/i.test(ua)) {
                            result = {
                                name: 'Chrome',
                                index: 0,
                                chrome: t,
                                version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
                            }
                        }
                        else if (iosdevice) {
                            result = {
                                name: iosdevice == 'iphone' ? 'iPhone' : iosdevice == 'ipad' ? 'iPad' : 'iPod',
                                index: 3  //Since Iphones native browser is safari so sending the index of safari only.
                            }
                            // WTF: version is not part of user agent in web apps
                            if (versionIdentifier) {
                                result.version = versionIdentifier
                            }
                        }
                        else if (/sailfish/i.test(ua)) {
                            result = {
                                name: 'Sailfish',
                                index: 19,
                                sailfish: t,
                                version: getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i)
                            }
                        }
                        else if (/seamonkey\//i.test(ua)) {
                            result = {
                                name: 'SeaMonkey',
                                index: 6,
                                seamonkey: t,
                                version: getFirstMatch(/seamonkey\/(\d+(\.\d+)?)/i)
                            }
                        }
                        else if (/firefox|iceweasel/i.test(ua)) {
                            result = {
                                name: 'Firefox',
                                index: 1,
                                firefox: t,
                                version: getFirstMatch(/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i)
                            }
                            if (/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
                                result.firefoxos = t
                            }
                        }
                        else if (/silk/i.test(ua)) {
                            result = {
                                name: 'Amazon Silk',
                                index: 7,
                                silk: t,
                                version: getFirstMatch(/silk\/(\d+(\.\d+)?)/i)
                            }
                        }
                        else if (android) {
                            result = {
                                name: 'Android',
                                index: 10,
                                version: versionIdentifier
                            }
                        }
                        else if (/phantom/i.test(ua)) {
                            result = {
                                name: 'PhantomJS',
                                index: 8,
                                phantom: t,
                                version: getFirstMatch(/phantomjs\/(\d+(\.\d+)?)/i)
                            }
                        }
                        else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
                            result = {
                                name: 'BlackBerry',
                                index: 12,
                                blackberry: t,
                                version: versionIdentifier || getFirstMatch(/blackberry[\d]+\/(\d+(\.\d+)?)/i)
                            }
                        }
                        else if (/(web|hpw)os/i.test(ua)) {
                            result = {
                                name: 'WebOS',
                                index: 13,
                                webos: t,
                                version: versionIdentifier || getFirstMatch(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)
                            };
                            /touchpad\//i.test(ua) && (result.touchpad = t)
                        }
                        else if (/bada/i.test(ua)) {
                            result = {
                                name: 'Bada',
                                index: 14,
                                bada: t,
                                version: getFirstMatch(/dolfin\/(\d+(\.\d+)?)/i)
                            };
                        }
                        else if (/tizen/i.test(ua)) {
                            result = {
                                name: 'Tizen',
                                index: 15,
                                tizen: t,
                                version: getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || versionIdentifier
                            };
                        }
                        else if (/safari/i.test(ua)) {
                            result = {
                                name: 'Safari',
                                index: 3,
                                safari: t,
                                version: versionIdentifier
                            }
                        }
                        else if (/chromium/i.test(ua)) {
                            result = {
                                name: 'Chromium',
                                index: 22,
                                chromium: t,
                                version: versionIdentifier
                            }
                        }
                        else if (/brave/i.test(ua)) {
                            result = {
                                name: 'Brave',
                                index: 23,
                                brave: t,
                                version: versionIdentifier
                            }
                        }
                        else result = {
                            name: 'Unknown',
                            index: -1,
                            safari: t,
                            version: 0
                        }

                        // set webkit or gecko flag for browsers based on these engines
                        if (/(apple)?webkit/i.test(ua)) {
                            result.name = result.name || "Webkit"
                            result.webkit = t
                            if (!result.version && versionIdentifier) {
                                result.version = versionIdentifier
                            }
                        } else if (!result.opera && /gecko\//i.test(ua)) {
                            result.name = result.name || "Gecko"
                            result.gecko = t
                            result.version = result.version || getFirstMatch(/gecko\/(\d+(\.\d+)?)/i)
                        }

                        // set OS flags for platforms that have multiple browsers
                        if (android || result.silk) {
                            result.android = t
                        } else if (iosdevice) {
                            result[iosdevice] = t
                            result.ios = t
                        }

                        // OS version extraction
                        var osVersion = '';
                        if (iosdevice) {
                            osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
                            osVersion = osVersion.replace(/[_\s]/g, '.');
                        } else if (android) {
                            osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
                        } else if (result.windowsphone) {
                            osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
                        } else if (result.webos) {
                            osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
                        } else if (result.blackberry) {
                            osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
                        } else if (result.bada) {
                            osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
                        } else if (result.tizen) {
                            osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
                        }
                        if (osVersion) {
                            result.osversion = osVersion;
                        }

                        // device type extraction
                        var osMajorVersion = osVersion.split('.')[0];
                        if (tablet || iosdevice == 'ipad' || (android && (osMajorVersion == 3 || (osMajorVersion == 4 && !mobile))) || result.silk) {
                            result.tablet = t
                        } else if (mobile || iosdevice == 'iphone' || iosdevice == 'ipod' || android || result.blackberry || result.webos || result.bada || result.nokia) {
                            result.mobile = t
                        }

                        // Graded Browser Support
                        // http://developer.yahoo.com/yui/articles/gbs
                        if ((result.msie && result.version >= 9) || (result.chrome && result.version >= 20) || (result.firefox && result.version >= 10.0) || (result.safari && result.version >= 5) || (result.opera && result.version >= 10.0) || (result.ios && result.osversion && result.osversion.split(".")[0] >= 6)) {
                            result.a = t;
                        }
                        else if ((result.msie && result.version < 9) || (result.chrome && result.version < 20) || (result.firefox && result.version < 10.0) || (result.safari && result.version < 5) || (result.opera && result.version < 10.0) || (result.ios && result.osversion && result.osversion.split(".")[0] < 6)) {
                            result.c = t
                        } else result.x = t

                        return result
                    }

                    var uaData = navigator.userAgentData;
                    var browser = {};

                    function shiftBrandToEnd(arr, key, value) {
                        var index = -1;

                        for (var i = 0; i < arr.length; i++) {
                            if (arr[i][key] === value) {
                                index = i;
                                break;
                            }
                        }

                        if (index === -1) {
                            return;
                        }

                        var element = arr.splice(index, 1)[0];
                        arr.push(element);

                        return arr;
                    }

                    if (uaData && uaData.brands.length) {
                        var b_arr = ["google chrome", "mozilla firefox", "internet explorer", "safari", "opera", "microsoft edge", "seamonkey", "amazonsilk", "phantomjs", "iphone", "android", "windowsphone", "blackberry", "webos", "bada", "tizen", "netscape", "ovibrowser", "androidbrowser", "sailfish", "windowsapp", "iphoneapp", "chromium", "brave"];
                        //name, version, index
                        //Bug 138220 - Chromium browser is showing in session window, while generating Sessions for Edge browser -Getting 'Chromium' at 1st pos. of 'uaData.brands' array in all browsers, so put this 'Chromium' at end of an array.
                        const obj = uaData.brands;
                        //Bug 139907 - Getting SyntaxError: Unexpected token '.' in console while generating data in Safari Browser Verison 5.1.7 - Because spread operator is not supported in this browser version.
                        const brands = JSON.parse(JSON.stringify(obj));
                        shiftBrandToEnd(brands, "brand", "Chromium");
                        //Bug 128763 - Chromium browser is showing in session window, while generating Sessions for Chrome browser.		  
                        //'[{"brand":"Not?A_Brand","version":"8"},{"brand":"Chromium","version":"108"},{"brand":"Google Chrome","version":"108"}]'            // can not go with else case approach after providing support for chromium.
                        function test_chromium(v) {
                            return /^google/i.test(v.brand);
                        }

                        const isChrome = brands.some(test_chromium);
                        var chrome_brand = brands.filter(test_chromium);
                        if (isChrome && chrome_brand.length > 0) {
                            browser.index = 0;
                            browser.name = chrome_brand[0].brand;
                            browser.version = chrome_brand[0].version;
                        } else {
                            for (var i = 0; i < brands.length; i++) {
                                var index = b_arr.indexOf(brands[i].brand.toLowerCase());
                                if (index !== -1) {
                                    browser.index = index;
                                    browser.name = brands[i].brand;
                                    browser.version = brands[i].version;
                                    break;
                                }
                            }
                        }
                        browser.mobile = uaData.mobile;
                    }
                    else
                        browser = detectBrowserDetails(ua);

                    //Calling prev method just to idenitfy if device is tablet 
                    if (browser.mobile && uaData) browser = detectBrowserDetails(ua);

                    var browserIndex = browser.index;
                    //set browserid of AndroidApp in case of native app
                    if (CAVNV.window.NBridge || !!CAVNV.window.webkit && !!CAVNV.window.webkit.messageHandlers.appNativeSync)
                        browserIndex = 18;
                    if (browserIndex == undefined) {
                        CAVNV.browser_id = -1;
                    }
                    CAVNV.browser_id = browserIndex;
                    //Update device type.
                    var dev_type = "";
                    if (browser.mobile) {
                        dev_type = "Mobile";
                    }
                    else if (browser.tablet) {
                        dev_type = "Tablet";
                    }
                    else {
                        dev_type = "PC";
                    }

                    //OS details.
                    var osDetail = {};
                    if (uaData && uaData.brands.length) {
                        impl.vars.waiting = true;
                        window.navigator.userAgentData.getHighEntropyValues(["platform", "platformVersion", "architecture", "model", "uaFullVersion"]).then(
                            function (h) {
                                if (h.platform.toUpperCase()) {
                                    impl.vars.platform = h.platform.toUpperCase();
                                    impl.vars.BrowserosVersion = h.platformVersion;
                                    impl.vars.BrowserAgent = impl.vars.platform + "/" + impl.vars.BrowserosVersion + "; " + h.architecture + "; " + h.model + "; " + browser.name + "/" + browser.version + "; " + h.uaFullVersion;
                                    CAVNV.log("Browser Details" + impl.vars.BrowserAgent);
                                    impl.vars.waiting = false;
                                    if (CAVNV.plugins.NavigationTiming.is_complete())
                                        CAVNV.sendBeacon();
                                }
                            })
                    }
                    else {
                        var uaParser = new CAVUAParser(ua);
                        osDetail = uaParser.getOS();
                    }
                    //Update colorDepth and pixelDepth
                    var colorDepth = window.screen.colorDepth || -1;

                    //IE browser doesn't support pixelDepth
                    var pixelDepth = window.screen.pixelDepth || colorDepth;

                    //Update DNT
                    var dnt = navigator.doNotTrak
                    if (dnt == null) dnt = 0;

                    //this value will be updated after loading configuration.
                    var pageIndex;
                    CAVNV.pageIndex == 0 ? pageIndex = 0 : pageIndex = CAVNV.pageIndex || -1;
                    var channel = CAVNV.channel || 0;
                    var visitorId = -2;
                    if (CAVNV.visitorInfo) {
                        visitorId = CAVNV.utils.getCookie('CavVI');
                        if (!visitorId) visitorId = -1;
                    }

                    //Update NDE FPID and Testrun
                    var ndData = boomr.get_nd_data();

                    CAVNV.log("nt_app_cache_time = " + nt_app_cache_time + "nt_load_time = " + nt_load_time);
                    CAVNV.log("Value of screen size = " + screenSize);
                    CAVNV.log("pageIndex = " + pageIndex + " browserIndex = " + browserIndex + " ScreenIndex = " + screenIndex + " AccessIndex = " + accessIndex);
                    // tabId is used to split the replay in tabs.
                    var tab_id = sessionStorage.getItem('tabId');
                    // if tabId is null then set tabId in cavSF cookie and sessionStorage.
                    if (tab_id == null) {
                        tab_id = CAVNV.get_session_flag("tabId");
                        if (tab_id !== null && !isNaN(tab_id)) {
                            try {
                                sessionStorage.setItem('tabId', tab_id);
                            } catch (e) { }
                            CAVNV.set_session_flag('tabId', parseInt(tab_id) + 1);
                        }
                        else {
                            CAVNV.set_session_flag('tabId', '1');
                            tab_id = 0;
                            try {
                                sessionStorage.setItem('tabId', tab_id);
                            } catch (e) { }
                        }
                    }

                    if (!!CAVNV.window.NBridge) {
                        var cd = CAVNV.window.NBridge.getNativeAppParam();
                        cd = JSON.parse(cd);
                        CAVNV.log("Data from native app - " + JSON.stringify(cd));
                        CAVNV.utils.androidSyncBridge(cd);
                    }
                    if (!!CAVNV.window.webkit && !!CAVNV.window.webkit.messageHandlers.appNativeSync) {
                        CAVNV.window.webkit.messageHandlers.appNativeSync.postMessage("initialize");
                    }
                    var st = parseInt(CAVNV.get_session_flag('orderTotal')) || 0;
                    var sc = parseInt(CAVNV.get_session_flag('orderCount')) || 0;

                    //Complete data collected now add in a JSON.
                    data = {
                        nt_version: Version,
                        nt_red_count: redirectCount,
                        nt_red_time: nt_red_time,
                        nt_app_cache_time: nt_app_cache_time,
                        nt_fetch_time: nt_fetch_time,
                        nt_dns_time: nt_dns_time,
                        nt_con_time: nt_con_time,
                        nt_secure_con_time: nt_secure_con_time,
                        nt_first_byte_time: nt_first_byte_time,
                        nt_res_time: nt_res_time,
                        nt_unload_time: nt_unload_time,
                        nt_dom_time: nt_dom_time,
                        nt_dom_content_load_time: nt_dom_content_load_time,
                        nt_load_time: nt_load_time,
                        //nt_page_load_time:nt_page_load_time,
                        nt_time_to_load: nt_time_to_load,
                        nt_time_to_DOC: nt_time_to_DOC,
                        pageIndex: pageIndex,
                        //Note: will be set in logResourceTiming.
                        perceived_render_time: -1,
                        SC: ndData.SC,
                        //Note: in place of nt_nav_type we are sending serverResponseTime.
                        nt_server_response_time: nt_server_response_time,
                        br_refer: d.referrer.substr(0, 256),
                        url: d.URL.substr(0, 512),
                        hostname: w.location.host,
                        cookie: boomr.get_document_cookies(),
                        BrowserName: browserIndex,
                        screen_resolution: screenIndex,
                        access_type: accessIndex,
                        Monitor_color_depth: colorDepth,
                        Monitor_pixel_depth: pixelDepth,
                        platform: (osDetail.name || "UNKNOWN"),
                        BrowserAgent: ua_orig.substr(0, 512),
                        BrowserLanguage: navigator.language,
                        //FIXME: right now it is just sending %5Bobject%20PluginArray%5D
                        BrowserPlugins: navigator.plugins,
                        br_cname: navigator.appCodeName,
                        DNT: dnt,
                        conn_type: dev_type,
                        BrowserVersion: browser.version,
                        BrowserosVersion: (osDetail.version || "-"),
                        NSTR: ndData.NSTR,
                        channel: channel,
                        Errorcount: ndData.ERRCNT,
                        navType: nt_nav_type,
                        fpidGroup: "{" + ndData.FPID + "}",
                        nt_dom_interactive: nt_dom_interactive,
                        visitorId: visitorId,
                        bandwidth: -1,
                        transferBytes: -1,
                        cartItem: 0,
                        cartValue: 0,
                        tabId: tab_id,
                        nt_fp: nt_fp,
                        nt_fcp: nt_fcp,
                        oT: st,
                        oC: sc,
                        cvCurHexTime: CAVNV.version || '',
                        cvfCurHexTime: CAVNV.config.version || ''
                    };

                    CAVNV.addVar(data);

                    //CAVNV.cav_nv_log_tm('TimingCollectionEnd');
                }

                // XXX Inconsistency warning.  msFirstPaint above is in milliseconds while
                //     firstPaintTime below is in seconds.microseconds.  The server needs to deal with this.
                // This is Chrome only, so will not overwrite nt_first_paint above
                if (w.chrome && w.chrome.loadTimes) {
                    pt = w.chrome.loadTimes();
                    if (pt) {
                        //	data = {
                        //		nt_spdy: (pt.wasFetchedViaSpdy?1:0),
                        //		nt_first_paint: pt.firstPaintTime
                        //	};
                        //	CAVNV.addVar(data);
                    }
                }
                //register for tti, fid and longtask, considering only longtask
                var opts = { useMutationObserver: false, useXHRObserver: false };
                try {
                    w.ttiPolyfill.getFirstConsistentlyInteractive(opts).then(function (tti) {
                        if (!isNaN(tti) && tti > 0) {
                            CAVNV.cav_nv_log_event('Timing', { "tti": parseInt(Math.max(tti)) });
                            if (CAVNV.resourceTiming) {
                                CAVNV.logResourceTiming(false, true/*not to add main url again*/, false, "-16");
                                ResourceFailedDetector.stop();
                            }
                        }
                    });
                } catch (e) { console.error("Error in PT2:" + e); }
                try {
                    w.perfMetrics.onFirstInputDelay(function (delay, evt) {
                        if (!isNaN(delay) && delay > 0)
                            CAVNV.cav_nv_log_event('Timing', { "fid": parseInt(Math.max(delay)) })
                    });
                } catch (e) { console.error("Error in PT2:" + e); }

                //register for long task. 
                if (w.PerformanceObserver && w.PerformanceLongTaskTiming && CAVNV.config.longTask) {
                    var o = new w.PerformanceObserver(function (l) {
                        var list = l.getEntries();
                        for (var z = 0; z < list.length; z++) {
                            var t = parseInt(list[z].startTime + CAVNV.nav_start_time);
                            var d = { name: list[z].name, attribution: list[z].attribution };
                            var eventMsg = t + '|' + parseInt(list[z].duration) + '|-10||-2||||-1|-1|-1|-1|' + JSON.stringify(d).replace(/\|/g, ';') + '||-1|-1|||';
                            CAVUA.logEvent(eventMsg, false, '');
                        }
                    });
                    o.observe({ entryTypes: ["longtask"] });
                }


                this.complete = true;

                //If iframe.
                //FIXME: Disabling iframe support.
                /*
                if(w.top !== w)
                {
                  //send message to parent.
                  //we need to extract parent origin from referrer.
                  //FIXME: what if referrer not set.
                  if(d.referrer == "")
                  {
                    CAVNV.error("Iframe referrer not set unable to send request to parent.");
                    //FIXME: stop all the plugins.
                    return;
                  }
                  var origin = d.referrer.substr(0, d.referrer.indexOf('/', 8)); 
                  //we can not run it from current iframe. This need to run in context of parent window.
                  //FIXME: for now we injecting this peace of code in parent window.
                  var s = 'try {window.top.postMessage("cookiesRequest", "'+ origin +'");} catch(e){}';
                  var se = w.document.createElement('script');
                  se.type = 'text/javascript';
                  se.innerHTML = s;
                  w.document.body.appendChild(se); 
                }
                else
                */
                CAVNV.sendBeacon();
            }
            /*,
            //FIXME: Commented onmessageCallback because disabled iframe support.
            //Handling for iframe 
            //opcodes: 
            //cookiesRequest - message to get cookies from parent.
            //cookiesResponse - response for cookiesRequest.
            //message Format:
            //opcode=<msg>
            onmessageCallback: function(e) {
              //Iframe.
              if(w.top !== w)
              {
                if(typeof e.data == "string" && e.data.indexOf('cookiesResponse') == 0)
                {
                  var s = JSON.parse(e.data.split('=')[1]);
                  console.log("Cookies Response - sid=" +  s.sid + " and page instance - " + s.pi + " sflag - " + s.sf + " lts - " +  s.lts);
                  //set these cookes
                  CAVNV.utils.updateNVCookie(CAVNV.SID, s.sid);
                  CAVNV.utils.updateNVCookie(CAVNV.PI, s.pi);
                  CAVNV.utils.updateNVCookie(CAVNV.LTS, s.lts);
              
                  if(s.sf != "") 
                    CAVNV.utils.setCookie("CavSF", s.sf);
      
                  CAVNV.parentComDone = true;
                  //now call sendBeacon.
                  CAVNV.sendBeacon();
                }  
              }
              //Parent.
              else {
                if(typeof e.data == "string" && e.data.indexOf('cookiesRequest') == 0)
                {
                  //Note: there can be multiple messages. so it's better to have some opcodes.
                  //check if we have already received timing response then just send cookies, else add this iframe port in iframePort array.
                  if(CAVNV.sid !== undefined && CAVNV.pageInstance !== undefined)
                  {
                    var sflag = "";
                    if(CAVNV.sflag !== undefined && CAVNV.sflag !== null) sflag = CAVNV.sflag;
                    var s = {sid: CAVNV.sid, pi: CAVNV.pageInstance + CAVNV.pageInstanceCounter++ , sf: sflag, lts: CAVNV.cav_epoch_nav_start_time};
                    e.source.postMessage("cookiesResponse=" + JSON.stringify(s), e.origin); 
                    //update the pageinstance cookie.
                    //FIXME: check if we can update the cookie at unload.
                    CAVNV.utils.updateNVCookie(CAVNV.PI, CAVNV.pageInstance + CAVNV.pageInstanceCounter);
                  }
                  else {
                    CAVNV.log("Parent Not Initialized, waiting for beacon response.");
                    //add this port into iframe array.
                    CAVNV.iframePorts.push(e);
                  }
                }
              }
            }
            */
        };

        var cb = function () {
            var s = w.sessionStorage;
            if (!!s) {
                if (lastClick > 0)
                    s.setItem('nvlc', lastClick + "#" + d.location.href.substr(0, 1024));
                else
                    s.removeItem('nvlc');
            }
        };

        CAVNV.plugins.NavigationTiming = {
            init: function () {
                // Skip navigation timing if frame mode. 
                if (CAVNV.insideFrame) {
                    impl2.complete = true;
                    return;
                }
                w.onmessage = impl2.onmessageCallback;
                if (!CAVNV.config.enableCvrAllPages)
                    CAVNV.subscribe("page_ready", impl2.done, null, impl2);
                else {
                    setTimeout(function () { impl2.done(); }, 10);
                }

                CAVNV.subscribe('page_unload', cb, null, this);

                return this;
            },

            is_complete: function () {
                return impl2.complete;
            },

            onevent: function (e) {
                if (e.type == "click") {
                    lastClick = new Date().getTime();
                    var ele = e.target.element;

                    if (!(ele.tagName.toLowerCase() == 'button' || (ele.tagName.toLowerCase() == 'input' && (ele.type == 'submit' || ele.type == 'cancel' || ele.type == 'hidden' || ele.type == 'button')))) return;

                    if (CAVNV.config.uxScore && CAVNV.config.uxScore.enabled)
                        CAVNV.transStTime = new Date().getTime();

                    if (CAVNV.config.uxScore && CAVNV.config.uxScore.enabled && !CAVNV.transTimer) {
                        //Rage Event Detection
                        CAVNV.transTimer = setTimeout(function () {
                            if (CAVNV.config.AjaxMonitor.enabled && !CAVNV.httpReqSent) {
                                CAVNV.frus += 3;
                            }
                            else if (CAVNV.config.AjaxMonitor.enabled && CAVNV.httpReqSent) {
                                var duration = (CAVNV.transEndTime - CAVNV.transStTime) / 1000;
                                boomr.getUxScore(duration, 2);
                            }
                            CAVNV.transTimer = undefined;
                            CAVNV.httpReqSent = false;
                        }, 500);
                    }
                }
            },
            restart: function () {
                lastClick = -1;
                CAVNV.subscribe('page_unload', cb, null, this);
            }

            //TODO: what to do in restart.
        };
    }());

    //This plugin is responsible to take care sessions from multiple origin.
    (function (w, d) {
        var complete = false;
        var frame_origin = null;
        var frame_window = null;
        var crossOriginTimer = -1;
        var crossOrigin_message_timeout = 1000;

        var config = {
            group: null,
            frame_url: null
        };
        //This is 2d array will contain callback as form of [callback, context] if context not given then CAVNV will be use as context.
        var syncCallback = [];
        var pendingSyncReq = false;

        function coCookieSynced() {
            for (var z = 0; z < syncCallback.length; z++) {
                try {
                    syncCallback[z][0].apply(syncCallback[z][1] || CAVNV);
                } catch (e) {
                    CAVNV.error("Exception in executing syncCallback at idx - " + z + "exception - " + e);
                }
            }
            pendingSyncReq = false;
            syncCallback = [];
        }
        function handleMessage(event) {
            //Check for the origin.
            if (CAVNV.config.CrossOrigin.enabled && event.origin == frame_origin) {
                var d = event.data;
                if (d.opcode && (d.opcode == 'nv_get_co_cookie' || d.opcode == 'nv_sync_co_cookie')) {
                    var cookies = d.s_cookie;
                    if (cookies != null) {
                        for (var z = 0; z < cookies.length; z++) {
                            CAVNV.utils.setCookie(cookies[z][0], cookies[z][1]);
                        }
                    }
                    if (d.opcode == 'nv_get_co_cookie') {
                        clearTimeout(crossOriginTimer);
                        frame_window = event.source;
                        complete = true;
                        //also try to send beacon may be it was on hold becauses of this.
                        CAVNV.sendBeacon();
                    }
                    else if (d.opcode == 'nv_sync_co_cookie') {
                        //run all the pending callbacks. 
                        coCookieSynced();
                    }
                }
            }
        }

        function start() {
            //set frame_origin
            var URL = XMLProfiler.getURL(config.frame_url);
            frame_origin = URL.origin;

            //load the iframe. 
            //Note: nv frame will be of same origin. window.origin is not supported in IE.
            var iframe = document.createElement('iframe');
            iframe.style.cssText = "width:0;height:0;border:0;display:none;"
            //Note: frame_url should have origin of the main document so it can communicate to this origin.
            iframe.src = config.frame_url + "?origin=" + w.location.origin + "&group=" + config.group + "&expiry=" + CAVNV.sessionExpiryTime;

            iframe.onload = function () {
                //If message is already received then just return.
                //Note: frame is not waiting for onload to send the cookie. That is why we are putting this check.
                if (complete == true) return;
                crossOriginTimer = setTimeout(onTimeout, crossOrigin_message_timeout);
            };
            iframe.onerror = function () {
                if (complete == false)
                    onTimeout();
            };

            document.body.appendChild(iframe);

            //Set the event listener on message callback.
            window.addEventListener('message', handleMessage, false);
        }
        function onTimeout() {
            complete = true;
            CAVNV.log("Disbaling CrossOrigin Plugin");
            CAVNV.config.CrossOrigin.enabled = false;
            CAVNV.sendBeacon();
        }

        function updateCookie(cname, cvalue) {
            var data = { "opcode": "nv_set_co_cookie", "s_cookie": [cname, cvalue] };
            if (frame_window)
                frame_window.postMessage(data, frame_origin);
        }

        function syncCOCookie(callback, context) {
            //add callback in syncCallback.
            syncCallback.push([callback, context]);
            if (pendingSyncReq == false) {
                //This will send request to iframe to get all cookies and then it will update them first and will call the callback. 
                frame_window.postMessage({ "opcode": "nv_sync_co_cookie" }, frame_origin);
                pendingSyncReq = true;
            }
        }

        CAVNV.plugins.CrossOrigin = {
            init: function (c) {

                //No CrossOrigin plugin for IE;
                if (CAVUA.utils.isIE() == true) {
                    complete = true;
                    CAVNV.log("Disbaling CrossOrigin Plugin");
                    CAVNV.config.CrossOrigin.enabled = false;
                    return false;
                }

                //load configuration.
                CAVNV.utils.pluginConfig(config, c, 'CrossOrigin', Object.keys(config));

                //TODO: we can derive config.frame_url from beacon_url.
                if (!config.group || !config.frame_url) {
                    CAVNV.error("CrossOrigin Plugin - Invalid Configuration");
                    complete = true;
                    CAVNV.config.CrossOrigin.enabled = false;
                    return false;
                }

                start();
            },
            is_complete: function () {
                return complete;
            }
        },
            CAVNV.updateCookie = updateCookie;
        CAVNV.syncCOCookie = syncCOCookie;
    }(CAVNV.window, CAVNV.document));

    (function (w, d) {
        var iframesMap = new NodeMap(); // FIXME: how to detect if an iframe is removed. 
        var sessParamKeys = {
            'sid': 1, 'pageInstance': 1, 'snapshotInstance': 1, 'lts': 1, 'pageIndex': 1,
            'nav_start_time': 1, 'session_start_time': 1, 'cav_epoch_nav_start_time': 1,
            'store': 1, 'channel': 1, 'browser_id': 1, 'terminal': 1, 'ocxFilter': 1, 'navtype': 1
        };
        var loaded = false;
        // to avoid multiple syncCavSession call.
        var syncTimer = null;
        // to ensure parentMsgHandler is set 
        var getConfigTimer = null;
        // event - {data, origin, source}
        function parentMsgHandler(event) {

            // validate for 
            if (!event.data.opcode) return;
            var opcode = event.data.opcode;
            var params = event.data.params;

            // It will send config as well as iframe id. This would be the first call from a new iframe and parent frame will remember iframe's id for further communicaiton. 
            if (opcode == 'getCavConfig') {
                // TODO: review again. Currently sending as is.  
                // FIXME: how it will send function definitions. 
                /*
                // Note: it will send configuration for only those plugins which would be enabled.
                var keys = ['AjaxMonitor', 'DOMWATCHER2', 'USERACTION', 'encryptedElement'];
                var config = {};
                for (var i = 0; i < keys.length; i++) {
                  config[keys[i]] = CAVNV.config[keys[i]];
                }
                */
                var config = CAVNV.config;
                var sessParams = {};
                for (var key in sessParamKeys) {
                    sessParams[key] = CAVNV[key];
                }
                if (!CAVNV.config.IframeMonitor.enabled) {
                    CAVNV.log("IframeMonitor is disabled , sending config null");
                    event.source.postMessage({ opcode: 'cavConfig', params: { config: null } });
                    return;
                }

                //identify frameId.
                var iframes = d.querySelectorAll('iframe');
                for (var i = 0; i < iframes.length; i++) {
                    // TODO: what if multiple iframes are present with same url. 
                    if (iframes[i].src == params.href && iframes[i].offsetHeight > 0) {
                        if (iframesMap.has(iframes[i])) {
                            // there are frames with duplicate URL. Let's discard monitoring.
                            CAVNV.warn("Iframes are present with duplicate URLs, disabling iframe monitoring for url - " + params.href);
                            event.source.postMessage({ opcode: 'cavConfig', params: { config: null } });
                            // Disable of existing frame as well. 
                            iframesMap.get(iframes[i]).window.postMessage({ opcode: 'cavConfig', params: { config: null } });
                        } else {
                            // add this frame to map.
                            iframesMap.set(iframes[i], { window: event.source, disable: false, origin: event.origin });
                            //removing CONFIG.pageUrlValues from config.js file (doing deep copy of 'config')
                            var deepConfig = JSON.parse(JSON.stringify(config));
                            if (deepConfig['CONFIG']) {
                                delete (deepConfig['CONFIG']);
                            };

                            event.source.postMessage({ opcode: 'cavConfig', params: { config: deepConfig, sessParams: sessParams, id: iframesMap.nodeId(iframes[i]), iframeSelector: CAVNV.utils.getDomID(iframes[i]) } }, event.origin);
                            // also add record in domwatcher for this iframe , to indicate the loading of this iframe

                            // send Domwatcher Record only in case of hard navigation. In case of soft naviagtion, flow does not come here
                            var D = CAVNV.plugins.DOMWATCHER2;
                            var record = { m: { type: 0, state: 1 }, t: new Date().getTime(), iframeid: iframesMap.nodeId(iframes[i]), d: [[], [], [], []] };
                            // FIX for:  what if parent CAVNV, nv observer is still null
                            // If failed to send in first attemtp then set retry.
                            if (D.pushNodeRecord(record) == false) {
                                // FIXME: it will create many timer. It should be avoided.
                                var observerTimer = setInterval(function () {
                                    if (D.pushNodeRecord(record)) {
                                        clearInterval(observerTimer);
                                        observerTimer = null;
                                    }
                                }, 100);
                            }
                        }
                    }
                }
            }
            else if (opcode == 'idbPost') {
                IDB.post.apply(IDB, params.args);
            }
        }

        function childMsgHandler(event) {
            if (!event.data.opcode) return;
            var navTime;
            var opcode = event.data.opcode;
            var params = event.data.params;
            if (opcode == 'syncCavSession') {
                // update Session Parameters.
                var prevs = CAVNV.sid, prevpi = CAVNV.pageInstance;
                for (var key in params) {
                    if (sessParamKeys[key])
                        CAVNV[key] = params[key];
                }

                // TODO: check if we need to construct CavNVC cookie.
                if (CAVNV.sid && (CAVNV.sid != prevs || CAVNV.pageInstance != prevpi)) {
                    if (pendingDom)
                        CAVNV.sendPendingDom();
                    else
                        CAVNV.send_dom();

                    var D = CAVNV.plugins.DOMWATCHER2;
                    if (CAVNV.navtype == 254) {
                        navTime = CAVNV.nav_start_time;
                        var record = { m: { type: 0, state: 1 }, t: navTime, iframeid: CAVNV.frameId, d: [[], [], [], []] };
                        D.pushNodeRecord(record);
                    }
                }
            } else if (opcode == 'doCavOp') {
                var cmd = params['command'];
                if (cmd && CAVNV[cmd] && (typeof CAVNV[cmd] == 'function')) {
                    try {
                        CAVNV[cmd].call(CAVNV, params['args']);
                        if (cmd == 'flush_all')
                            CAVNV.sbqueue.flush();
                    } catch (e) {
                        console.error('doCavOp failed, error - ', e);
                    }
                }
            } else if (opcode == 'cavConfig') {
                clearInterval(getConfigTimer);
                getConfigTimer = null;
                // params will have config and id. 
                var config = params['config'];
                if (config == null || params['id'] == null) {
                    CAVNV.warn("Iframe monitoring is disabled. frame url - " + d.location.href);
                    return;
                }

                CAVNV.frameId = params['id'];
                CAVNV.frameSelector = params['iframeSelector'];

                // TODO: sanitize config. We may also disable some of the components, better if we can do here itself. 
                // Apply configuration.

                CAVNV.init(config);

                // Update initial session parameters after init.
                var sessParams = params['sessParams'];
                if (sessParams) {
                    for (var key in sessParams) {
                        if (sessParamKeys[key])
                            CAVNV[key] = sessParams[key];
                    }
                    // TODO: check if we need to construct CavNVC cookie.
                    if (CAVNV.sid && (CAVNV.sid != prevs || CAVNV.pageInstance != prevpi)) {
                        if (pendingDom)
                            CAVNV.sendPendingDom();
                        else
                            CAVNV.send_dom();
                        // send Domwatcher Record only in case of soft navigation
                        var D = CAVNV.plugins.DOMWATCHER2;
                        if (CAVNV.navtype == 254) {
                            var record = { m: { type: 0, state: 1 }, t: CAVNV.nav_start_time, iframeid: CAVNV.frameId, d: [[], [], [], []] };
                            D.pushNodeRecord(record);
                        }
                    }
                }
            }
        }

        function sendMsgToFrames(msg) {
            var frames = iframesMap.keys();
            for (var i = 0; i < frames.length; i++) {
                data = iframesMap.get(frames[i]);
                // Ignore disabled. 
                if (!data.disable) {
                    data.window.postMessage(msg, data.origin);
                }
            }
        }

        function sendMsgToParent(msg) {
            // FIXME: Currently it is sending to all the origins, not a good choise. 
            w.top.postMessage(msg, '*');
        }

        function syncSessionProp() {
            var data;
            var sessParams = {};
            var frames = iframesMap.keys();
            if (frames.length) {
                for (var key in sessParamKeys) {
                    sessParams[key] = CAVNV[key];
                }
                CAVNV.log('syncSessionProp: sessParams - ', sessParams);

                sendMsgToFrames({ opcode: 'syncCavSession', params: sessParams });
            }
            syncTimer = null;
        }

        CAVNV.plugins.IframeMonitor = {
            init: function (c) {
                if (loaded == true) return;

                //Init message handler.
                if (CAVNV.insideFrame) {
                    w.addEventListener('message', childMsgHandler);
                    window.addEventListener('message', childMsgHandler);

                    // send message to get configuration.
                    getConfigTimer = setInterval(function () {
                        sendMsgToParent({ opcode: 'getCavConfig', params: { href: w.location.href } })
                    }, 100);
                } else {
                    w.addEventListener('message', parentMsgHandler);
                }

                loaded = true;
            },
            stop: function () {
                if (!CAVNV.insideFrame) {
                    sendMsgToFrames({ opcode: 'doCavOp', params: { 'command': 'stop_all' } });
                }
            },
            restart: function () {
                if (!CAVNV.insideFrame) {
                    sendMsgToFrames({ opcode: 'doCavOp', params: { 'command': 'restart_all' } });
                }
            },
            is_complete: function () {
                return loaded;
            },
            flush: function () {
                if (!CAVNV.insideFrame) {
                    sendMsgToFrames({ opcode: 'doCavOp', params: { 'command': 'flush_all' } });
                }
                var cb = function () {
                    CAVNV.log("Netvision, IframeMonitor: page is unloading sending data");
                    sendMsgToFrames({ opcode: 'doCavOp', params: { 'command': 'flush_all' } });
                };
                //current scope need to be followed.
                CAVNV.subscribe('page_unload', cb, null, this);
            },
            sync: function () {
                if (CAVNV.insideFrame || syncTimer) return;

                syncTimer = setTimeout(syncSessionProp, 0);
            },
            IDBPost: function (data) {
                if (CAVNV.insideFrame) {
                    sendMsgToParent({ opcode: 'idbPost', params: { args: data } });
                }
            }
        }
    }(CAVNV.window, CAVNV.window.document));




    //Note: Other Plugins have dependency over this plugin.
    //Note: If rsaEncryption is enabled then all the encrypted data will be send to this module.
    //This plugin will encode that data and will send as useraction record to nvserver.
    (function (w) {
        var queue = [], loading = false, __counter = 0;
        //TODO: set default values.
        var config = { libraryPath: null, publicKey: null };
        function add(entry) {
            var id = "%NVENCRYPTED_" + __counter++ + "%";
            queue.push({ id: id, d: entry });
            //Check if encryption library is not present then load that.
            if (!loading) {
                loadLibrary();
            }
            return id;
        }

        function loadLibrary() {
            //check for library path.
            if (!config.libraryPath)
                return null;

            var s = document.createElement('script')
            s.type = "text/javascript";
            s.src = config.libraryPath;
            s.async = true;
            var n = document.getElementsByTagName('script')[0];
            n.parentElement.appendChild(s);
            loading = true;
        }

        CAVNV.plugins.EQueue = {
            init: function (c) {
                //load configuration.
                CAVNV.utils.pluginConfig(config, c, 'EQueue', Object.keys(config));
            },
            is_complete: function () {
                return true;
            },
            restart: function () {
                queue = [];
            },
            getPrevState: function () {
                return {
                    queue: queue,
                    counter: __counter,
                    config: config
                };
            },
            add: add
        }
    }(CAVNV.window));


    /**************Feedback*************/
    //TODO: combine both js html2canvas and feedback in one.
    (function (p) {
        var again = false,
            load_js, d = p.document;
        var config = {};

        var plugin_loaded = false;
        var config = {};
        load_js = function () {
            CAVNV.log("loading feedback plugin");

            var n = d.getElementsByTagName('script')[0];
            var e = document.createElement('script');
            //assign id so modules can get the path of plugin js.
            // .. for other resources.
            e.id = "nvFeedbackPlugin";
            e.src = config.pluginfbjs_url;
            CAVNV.log("feedback plugin js  e.src + " + e.src);
            n.parentNode.insertBefore(e, n);

            plugin_loaded = true;

        };
        CAVNV.plugins.FEEDBACK = {
            init: function (c) {
                //check if current page is part of feedback module then don't enable.
                if (p.FeedbackPage != undefined && p.FeedbackPage == true) {
                    CAVNV.log("Feedback can not be enabled for feedback module");
                    plugin_loaded = true;
                    return this;
                }
                //TODO: add more configuration.
                var kw = ['pluginfbjs_url', 'fb_url', 'feedbackPosition', 'nvmail_url', 'nvreplaysession_url'];
                //if already loaded then no need to load it again.
                if (plugin_loaded) return this;

                //load configuration.
                CAVNV.utils.pluginConfig(config, c, 'FEEDBACK', kw);

                if (typeof config.pluginfbjs_url === 'undefined' || config.pluginfbjs_url === null) {
                    CAVNV.log('Netvision, no plugin js given for feedback collection.');
                    return false;
                }

                if (typeof config.feedbackPosition === 'undefined' || config.feedbackPosition === null) {
                    config.feedbackPosition = "bottom";
                }
                /*
                //Note: these configurations are feedback module dependent. So either handle them module wise.
                if (typeof config.nvmail_url === 'undefined' || config.nvmail_url === null) {
                  CAVNV.log('Netvision, feedback nvmail url missing');
                  return false;
                }
                 if (typeof config.nvreplaysession_url === 'undefined' || config.nvreplaysession_url === null) {
                   CAVNV.log('Netvision, feedback nvreplaysession url missing');
                  return false;
                }
                */
                //add this configuration to CAVNV.
                CAVNV.feedbackPosition = config.feedbackPosition;
                /******Settings related to kohls feedback module ********/
                CAVNV.nvmail_url = config.nvmail_url;
                CAVNV.nvreplaysession_url = config.nvreplaysession_url;

                //If it is not main window then let main window be loaded. 
                if (p !== window) {
                    CAVNV.subscribe('page_ready', load_js, null, null);
                }
                else {
                    load_js();
                }
                return this;
            },
            is_complete: function () {
                return true;
            },

            restart: function () {
                CAVNV.log('Netvision, Feedback: restart() called');
                if (!plugin_loaded) this.init();
            }
        }
    }(CAVNV.window));


    /*************UserAction****************/
    //plugin for collecting user clicks
    //USERACTION
    //we will load some scripts and then when those scripts will be loaded then we will initialize that component.
    //Note: jquery should be loaded first.
    //Note: In case of useraction we are loading jquery and plugin js on main document. 
    (function (h) {
        var plugin_loaded = false, doc = h.document,
            config = {
                filterJsTriggeredActions: true,
                autoFillObserver: {
                    enable: true,
                    frequency: 500 //ms 
                }
            }, autoFillTimer = null,

            inputNodes = null,

            fillInputNodes = function () {
                inputNodes = new NodeMap();

                //Note: we will keep a list of input tags initially. 
                var is = doc.getElementsByTagName('INPUT');
                var d = {};
                //create a nodemap and all these input elements with their initial values and time.
                for (var z = 0; z < is.length; z++) {
                    //Note: hidden, submit, search and reset will not be included 
                    if (is[z].type == "hidden" || is[z].type == "submit" || is[z].type == "reset" || is[z].type == 'image')
                        continue;

                    //get it's value and current time.
                    d = { time: new Date().getTime(), value: is[z].value };
                    //Check if not added then only add.
                    inputNodes.set(is[z], d);
                }

                is = doc.getElementsByTagName('SELECT');
                for (var z = 0; z < is.length; z++) {
                    //get it's value and current time.
                    if (is[z].selectedIndex != -1)
                        d = { time: new Date().getTime(), value: is[z].options[is[z].selectedIndex].text };
                    else
                        d = { time: new Date().getTime(), value: "" };
                    //Check if not added then only add.
                    inputNodes.set(is[z], d);
                }

                //expose inputNodes.
                CAVNV.inputNodes = inputNodes;

            };
        var capture_keypress = function () {
            //capture key names, only special keys
            CAVNV.window.document.addEventListener('keydown', function (event) {
                var ev = window.event ? window.event : event;
                var keyname = ev.key;
                if (keyname.indexOf('Control') != -1 ||
                    keyname.indexOf('Shift') != -1 ||
                    keyname.indexOf('Alt') != -1 ||
                    ((/^[a-zA-Z0-9]$/.test(ev.key)) && !ev.ctrlKey)) return;

                if (ev.ctrlKey) {
                    keyname += " + Ctrl";
                }
                if (ev.shiftKey) {
                    keyname += " + Shift";
                }
                if (ev.altKey) {
                    keyname += " + Alt";
                }
                //opcode = -12, keynames will be stored in value field of useraction table.
                var eventMsg = (new Date().getTime()) + '|' + -1 + '|-12||||||-1|-1|-1|-1|' + keyname + '||-1|-1|||';
                CAVUA.logEvent(eventMsg, false, '');
            })
        }
        var enableAutoFillObserver = function () {
            var TIMER_CALLER = 1;
            var EVENT_HANDLER_CALLER = 2;

            //Note: keys are array of element.
            function checkAndLogEvent(keys, caller) {
                caller = caller || TIMER_CALLER;
                var d, node, pv, v, en, prev, val, ev, eeflag, valueObj, nv;
                var t = new Date().getTime();

                for (var z = 0; z < keys.length; z++) {
                    node = keys[z];

                    //Check if element is hidden.
                    if (node.offsetParent === null) continue;

                    //Note: we will not compare for activeElement.
                    //Note: this we have done to avoid element still in changing state.
                    //Note:in case of EVENT_HANDLER_CALLER below conition will not be checked.
                    if (caller == TIMER_CALLER && doc.activeElement == node)
                        continue;

                    d = inputNodes.get(node);
                    if (!d) continue;

                    nv = node.value;
                    if (node.tagName && node.tagName == 'SELECT') {
                        nv = "";
                        if (node.selectedIndex < node.options.length && node.selectedIndex >= 0)
                            nv = node.options[node.selectedIndex].text;
                    }

                    if (nv != d.value) {
                        //update the value.
                        pv = d.value;
                        d.value = nv;
                        d.time = new Date().getTime();
                        v = nv;
                        ev = "";
                        //check for time if it is earlier than 10 msec then send it again.
                        //TODO: what is the point to compare time.
                        if (/*t - d.time > 10*/true) {
                            var id, idType, o;
                            o = CAVNV.utils.getDomID(node);
                            id = o.i;
                            idType = o.t;
                            //check for encryption and encoding.
                            //TODO: handling for automatic encrypted fields. like credit card etc.
                            eeflag = (node.type == 'password' ? 2 : 0) || CAVNV.utils.getEEFlag(node);
                            valueObj = CAVNV.utils.getEEValue(v, eeflag, true);
                            v = valueObj.v || "";
                            ev = valueObj.ev || "";
                            //log a dummy change event.
                            /*
                             timeStamp: paramb_cavwrapper.timestamp,
                             duration: -1,
                             eventType: -1, //we will use enum for events
                             id: "",
                             idType: -2,
                             elementName: "",
                             elementType: "",
                             elementSubType: "",
                             xpos: -1,
                             ypos: -1,
                             width: -1,
                             height: -1,
                             value: "",
                             prevValue: ""
                             */
                            //Note: there is no point to log hight and width for this event. so ->
                            var viewPortX = window.pageXOffset || (null === document.body ? 0 : document.body.scrollLeft),
                                viewPortY = window.pageYOffset || (null === document.body ? 0 : document.body.scrollTop),
                                pageWidth = document.width || (null === document.documentElement ? 0 : document.documentElement.offsetWidth),
                                pageHeight = Math.max("undefined" == typeof document.height ? 0 : document.height, "undefined" == typeof document.documentElement ? 0 : document.documentElement.offsetHeight, "undefined" == typeof document.documentElement ? 0 : document.documentElement.scrollHeight);
                            var xpos = parseInt(viewPortX / pageWidth * 1E3);
                            if (isNaN(xpos)) xpos = -1;
                            var ypos = parseInt(viewPortY / pageHeight * 1E3);
                            var attr = JSON.stringify(CAVUA.utils._getElementAttr(node));
                            if (isNaN(ypos)) ypos = -1;
                            var event = t + "|-1|30|" + id + "|" + idType + "|" + (node.name || "") + "|" + node.tagName + "|" + node.type + "|" + xpos + "|" + ypos + "|-1|-1|" + v + "|" + ev + "|-1|-1||" + attr + "|";
                            CAVUA.logEvent(event, false, "");
                        }
                    }
                }
            }

            fillInputNodes();
            var keys;

            //FIXME: we need to remove all the deleted nodes from this inputNodes otherwise there will be memory leak..
            //start a timer to monitor all input fields.   
            autoFillTimer = setInterval(function () {
                //get all the keys of inputNodes and check for their values. 
                keys = inputNodes.keys();
                checkAndLogEvent(keys, TIMER_CALLER);
            }, config.autoFillObserver.frequency);

            //set keypress event listern on document.
            //In callback check if enter key was hit and doc.activeElement is an input element. Then compare it;s current value with the previous one and if got change then log a useraction record and update value in nodemap.
            doc.addEventListener('keydown', function (e) {
                // check if enter key was hit and doc.activeElement is an input element   
                var keycode = (e.keyCode ? e.keyCode : e.which);
                if (keycode == '13' && e.target.tagName == 'INPUT') {
                    checkAndLogEvent([e.target], EVENT_HANDLER_CALLER);
                }
            }, true);
        };

        CAVNV.plugins.USERACTION = {
            init: function (c) {
                if (plugin_loaded) return this;

                //Load the configuration.
                var kw = Object.keys(config);

                CAVNV.utils.pluginConfig(config, c, 'USERACTION', kw);

                //if jQuery not loaded then we can't start it
                if (typeof CAVNV.jQuery === 'undefined' || CAVNV.jQuery == null) return;

                function initUA() {
                    //CAVNV.cav_nv_log_tm('CAVUAInitStart');
                    CAVUA.init();

                    //CAVNV.cav_nv_log_tm('CAVUAInitEnd');

                    if (config.autoFillObserver.enable)
                        enableAutoFillObserver();
                }
                if (CAVNV.config.USERACTION.enableKeyPress) {
                    capture_keypress();
                }
                //when to remove this.

                plugin_loaded = true;

                //Start DOMWATCHER2 also.
                //Assuming that DOMWTCHER2 will be enable if USERACTION is enabled. 
                CAVNV.plugins.DOMWATCHER2.init(c);
                //since domwatcher is now applicable on page_Ready so we will capture the useractions also 
                //afterwards so that we can mark the sensitive elements properly.
                CAVNV.subscribe('page_ready', function () { initUA(); }, null, null);
                //Note: we are not calling sendBeacon just because it will be called from caller of this function.
                return this;
            },
            is_complete: function () {
                return true;
            },
            //It is needed for DOMWATCHER2. 
            is_active: function () {
                return plugin_loaded;
            },
            flush: function () {
                CAVNV.log("Netvision, USERACTION: flush() called");
                if (plugin_loaded) {
                    try {
                        CAVUA.flushAll(true);
                    } catch (e) { }
                }
            },
            restart: function () {
                CAVNV.log('Netvision, USERACTION: restart() called');
                if (!plugin_loaded) this.init();
                else {
                    try {
                        //clear previous queue.
                        CAVUA.Queue.clearQ();
                        CAVUA.updateConfig();
                        //reset the input nodes set earlier. 
                        fillInputNodes();
                    }
                    catch (e) { }
                }
            },
            getConfig: function () {
                return config;
            }
        }
    }(CAVNV.window));


    /*******************IndexedDB Starts****************************/

    window.IDB = {

        cleanedPrevData: false,
        //This flag will keep track if previous data have been removed.
        // change the value of flag to a number of request we need to send in one batch of CAVNV.config.ocxFilter.batchSize to disable it set CAVNV.config.ocxFilter.batchSize to 0                
        // flag to keep track of number of first delete error in flush function                                                                                                                    
        deleteErrorCount: 0,
        // flag below keep track of max flush request triggered if every time error occured on first Delete Error.                                                                                 
        maxDeleteError: 5,
        //This will keep track of previous page instance till data have been flushed. 
        pageInstance: -1,

        sendingRequest: 0,

        idbCount: 0,

        pendingArray: [],

        cb: [],
        flushcb: [],
        initing: false,

        oninit: function (fn, context) {
            this.cb.push([fn, context]);
        },

        init: function () {
            if (IDB.initing) return;

            var newItem = [
                { key: "", sid: "", pginst: "", url: "", module: "", data: "", idbCount: "" }
            ];

            window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
            window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
            if (!window.indexedDB) return false;
            IDB.initing = true;
            // Let us open our database
            var DBOpenRequest = window.indexedDB.open("nvOCX", 3);
            DBOpenRequest.onerror = function (event) {
                CAVNV.log("-----Error loading database.-----");
            };

            DBOpenRequest.onsuccess = function (event) {
                CAVNV.log("-----Database initialised.-----");
                db = DBOpenRequest.result;
                // clearing previous sid data from IndexedDBdata                                                                                                                                       
                IDB.flush(null, true);
                //check if any pending callback then call them.
                for (var z = 0; z < IDB.cb.length; z++) {
                    IDB.cb[z][0].call(IDB.cb[z][1] || IDB);
                }
                IDB.cb = [];
            };
            DBOpenRequest.onupgradeneeded = function (event) {
                var db = event.target.result;
                db.onerror = function (event) {
                    CAVNV.log("-----Error loading database.-----" + this.error);
                };
                // delete previous indexeddb database.                                                                                                                                                   
                try {
                    db.deleteObjectStore("nvOCX");
                }
                catch (err) {
                    //in case if idb is created first time then an error is generated while calling deleteObjectStore .                                                                                
                }
                var objectStore = db.createObjectStore("nvOCX", { keyPath: "key" });

                var keyPath = "key";
                objectStore.createIndex("data", keyPath, { unique: true });

                CAVNV.log("-----Object store created-----");

            };

        },

        post: function (a, b, c) {
            // In Case of Iframe , data has to be stored in main frame
            if (CAVNV.insideFrame) {
                CAVNV.plugins.IframeMonitor.IDBPost(Array.from(arguments));
                return;
            }
            if (typeof (db) == "undefined") {
                IDB.idbCount = IDB.idbCount + 1;
                var pkey = CAVNV.sid + '|' + CAVNV.pageInstance + '|' + IDB.idbCount;
                var newItem = { key: pkey, sid: CAVNV.sid, pginst: CAVNV.pageInstance, url: c.url, module: c.module, data: c.data, idbCount: IDB.idbCount, time: Date.now() };
                IDB.pendingArray.push(newItem);
                this.oninit(function () {
                    //TODO: verify if it being called successful.
                    IDB.post();
                });
                return;
            }
            else {
                if (c) {
                    c.url += "&nvcounter=" + CAVNV.nvCounter;
                    CAVNV.nvCounter++;

                    if (c.url.indexOf('pagedump') != -1 || c.url.indexOf('domwatcher') != -1) {
                        c.url += "&ocxcounter=" + CAVNV.ocxCounter;
                        CAVNV.ocxCounter++;
                    }

                    IDB.idbCount = IDB.idbCount + 1;
                    var pkey = CAVNV.sid + '|' + CAVNV.pageInstance + '|' + IDB.idbCount;
                    var newItem = [
                        { key: pkey, sid: CAVNV.sid, pginst: CAVNV.pageInstance, url: c.url, module: c.module, data: c.data, idbCount: IDB.idbCount, time: Date.now() }
                    ];
                }

                if (IDB.pendingArray) {
                    for (var i = 0; i < IDB.pendingArray.length; i++) {
                        var transaction1 = db.transaction(['nvOCX'], 'readwrite');
                        transaction1.oncomplete = function () {
                            CAVNV.log("Pending Array: IDB Modification Finished");
                        };
                        transaction1.onerror = function () {
                            CAVNV.log("Pending Array: IDB Modification could not be finished" + transaction.error);
                        };
                        var objectStore1 = transaction1.objectStore("nvOCX");
                        var objectStoreRequest1 = objectStore1.add(IDB.pendingArray[i]);
                        objectStoreRequest1.onsuccess = function (event) {
                            CAVNV.log("Pending Array: Request successful.");
                        }
                        objectStoreRequest1.onerror = function (event) {
                            CAVNV.error("Error", event.target.error);
                            if (event.target.error.name == "QuotaExceededError") {
                                CAVNV.ocxFilter = 1;
                                IDB.flush();
                            }
                        }
                    }
                    IDB.pendingArray = [];
                }

                if (typeof (newItem) != "undefined" && newItem[0]) {
                    var transaction2 = db.transaction(['nvOCX'], 'readwrite');

                    transaction2.oncomplete = function () {
                        CAVNV.log("Transaction Completed: POST Request");
                    };
                    transaction2.onerror = function () {
                        CAVNV.log("Transaction not opened due to error: " + transaction2.error);
                    };

                    var objectStore = transaction2.objectStore("nvOCX");
                    var objectStoreRequest = objectStore.add(newItem[0]);
                    objectStoreRequest.onsuccess = function (event) {
                        CAVNV.log("Request successful.");
                    }
                    objectStoreRequest.onerror = function (event) {
                        CAVNV.error("Error", event.target.error);
                        if (event.target.error.name == "QuotaExceededError") {
                            CAVNV.ocxFilter = 1;
                            IDB.flush();
                        }
                    }
                }
                //FIXME: check for failure. Check if we can get the error for disk full. If  that is possible then call flush(false, true). 
            }
            return pkey;
        },
        //flushAll - by default it will flush data for a single pageinstance at a time. But if flushAll flag is enabled then it will flush all at once.   
        //Note: removePrevData - if this flag is enabled then it will only remove the previous data. 
        flush: function (flushAll, removePrevData, pendingFlushTime) {
            //If DB is not yet ready then set the callback.
            if (typeof (db) == "undefined") {
                var f = (function (a, b) {
                    return function () { IDB.flush(a, b); }
                })(flushAll, removePrevData);
                this.oninit(f, this);
                return;
            }

            if (!CAVNV.sid) {
                !this.flushcb.length && CAVNV.subscribe('after_beacon', function () {
                    for (var z = 0; z < IDB.cb.length; z++) {
                        IDB.flushcb[z][0].call(IDB.flushcb[z][1] || IDB);
                    }
                    IDB.flushcb = [];
                }, this, null);

                this.flushcb.push([function () { IDB.flush(flushAll, removePrevData) }, this]);
                return;
            }

            flushAll = flushAll || false;

            if (typeof pendingFlushTime != 'number') pendingFlushTime = Date.now();

            removePrevData = removePrevData || false;

            var sid = CAVNV.sid;

            var transaction = db.transaction(['nvOCX'], 'readwrite');
            var objectStore = transaction.objectStore('nvOCX');

            function completeFn() {
                //this is the case when there is no record left in db for other sid. 
                IDB.cleanedPrevData = true;

                IDB.sendingRequest = 0;
                for (var z = 0; z < flusharr.length; z++) {
                    //Note: in case when flushAll is not true then we have to set a callback in sendData.
                    var myRecord = flusharr[z];
                    CAVNV.utils.sendData(myRecord.url, myRecord.data, myRecord.module, myRecord.contentType, myRecord.contentEncoding, flushAll ? undefined : cb);
                    IDB.sendingRequest++;
                    delete flusharr[z];
                }
                CAVNV.log("Batch Completed");
                return;
            }

            function errorFn(event) {
                CAVNV.log("Flush: Transaction not opened due to error: " + event.target.error);
            }

            transaction.oncomplete = completeFn;

            transaction.onerror = errorFn;

            var flusharr = [];

            function cb(status) {
                //increment counter for request sent. 
                IDB.sendingRequest--;
                if (IDB.sendingRequest <= 0) {
                    IDB.flush(false, false, pendingFlushTime);
                }
            }

            var myIndex = objectStore.index('data');
            var req = myIndex.openCursor(null, 'prev');

            req.onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    // Check if this entry is older then pendingFlushTime then continue. 
                    if (pendingFlushTime > 0) {
                        //FIXME: It has to be handled via dbupgrade
                        if (!cursor.value.time) {
                            var request1 = cursor['delete']();
                            request1.onsuccess = function () {
                                cursor['continue']();
                            };
                            return;
                        }
                        else if (cursor.value.time >= pendingFlushTime) {
                            cursor['continue']();
                            return;
                        }
                    }


                    if (cursor.value.sid == sid) {
                        //If just called to remove the previous content.
                        if (removePrevData) {
                            return;
                        }
                        if (!flushAll) {
                            //check for pageInstance.
                            if (!CAVNV.config.ocxFilter.batchSize) {
                                if (IDB.pageInstance != cursor.value.pginst) {
                                    if (flusharr.length > 0) {
                                        //It means flusharra have data for previous page. Let's dump this first.  
                                        return;
                                    }
                                    IDB.pageInstance = cursor.value.pginst;
                                }
                            }
                            else if (CAVNV.config.ocxFilter.batchSize == flusharr.length) {
                                return;
                            }
                        }
                        flusharr.push(cursor.value);
                        // increse in count is required when CAVNV.config.ocxFilter.batchSize is enabled(i.e, CAVNV.config.ocxFilter.batchSize>0)
                        try {
                            var request = cursor['delete']();
                            request.onsuccess = function () {
                                CAVNV.log('Deleted   SID------------->' + cursor.value.sid);
                                IDB.deleteErrorCount = 0;
                                cursor['continue']();
                            };
                            request.onerror = function () {
                                CAVNV.log('Delete on current record is not commited moving to another');
                                //If delete failed for the first record then let's rollback i.e. call IDB.flush again. But retry cout should be 5 only.
                                if (flusharr.length == 1 && IDB.deleteErrorCount < IDB.maxDeleteError) {
                                    IDB.deleteErrorCount++;
                                    IDB.flush();
                                }
                            };
                        }
                        catch (e) {
                            CAVNV.error('Error in deleting data: ' + e);
                        }
                    }
                    else {
                        var request1 = cursor['delete']();
                        request1.onsuccess = function () {
                            CAVNV.log('Previous Record Discarded SID ------->' + cursor.value.sid);
                            cursor['continue']();
                        };
                    }
                }
            }
        },
        remove: function (key) {
            //If DB is not yet ready then set the callback.
            if (typeof (db) == "undefined") {
                this.oninit(function () {
                    //TODO: verify if it being called successful.
                    IDB.flush(flushAll, removePrevData);
                });
                return;
            }

            var transaction = db.transaction(['nvOCX'], 'readwrite');
            var objectStore = transaction.objectStore('nvOCX');

            var request = objectStore['delete'](key);
            request.onsuccess = function () {
                CAVNV.log('IDB.remove successful for - ' + key);
            }
            request.onerror = function () {
                console.error('IDB.remove failed for - ' + key);
            }
        }
    };
    /*******************IndexedDB Ends******************************/


    /****************EventLogger**************/
    //Plugin to collect events and send them on unloading or max threshold limit reach.
    (function (h) {
        var plugin_loaded = false,
            queue_threshold = 10,
            config = {},
            queue = [],
            unloading = false,
            //it will keep count for each struggling event. 
            struggling_event_counts = {},

            //This method will check if user is struggling. It will keep count of each event and if any struggling event for which goal is reached it will return true.  
            check_and_enable_nd_instr = function (event) {
                //Check for instrumentation flag. 
                if (CAVNV.ndInfo.instrFlag) return;

                var ndConfig = CAVNV.config.autoNDInstr;
                if (!ndConfig || !ndConfig.enable || !ndConfig.events || !ndConfig.events.length)
                    return;

                var strugglingEvent = 0;

                //check if event is present in struggling list 
                for (var i = 0; i < ndConfig.events.length; i++) {
                    var es = ndConfig.events[i];
                    if (es.e == event) {
                        //update the count in struggling_event_counts.
                        struggling_event_counts = boomr.cav_nv_get_session_data('event_counts');
                        struggling_event_counts = struggling_event_counts || {};

                        if (struggling_event_counts.hasOwnProperty(event))
                            struggling_event_counts[event]++;
                        else
                            struggling_event_counts[event] = 1;

                        boomr.cav_nv_set_session_data('event_counts', struggling_event_counts);

                        /*********** Mark struggling ***********/
                        /**** if event is in struggling list ****/
                        /**** if goal not specified ************/
                        /**** freq of event reached the goal specified ***/
                        if (es.g === undefined || struggling_event_counts[event] >= es.g) {
                            strugglingEvent = 1;
                            break;
                        }
                    }
                }

                if (strugglingEvent == 1)
                    boomr.cav_nv_enable_nd(0);
            },
            matchEvents = function (e, arr, c, s) {
                var et = {};
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] == e) {
                        if (s) return true; //struggling event check. no need to check for counts further.
                        //Count matching for Other Events
                        et = boomr.cav_nv_get_session_data('autoLogEC') || {};
                        if (et.hasOwnProperty(e)) et[e]++; //event present then increase the count
                        else et[e] = 1;
                        boomr.cav_nv_set_session_data('autoLogEC', et);
                        if (et[e] >= c) {
                            et[e] = 0;
                            boomr.cav_nv_set_session_data('autoLogEC', et);//reset eve counts
                            return true; //match counts, if success then return true.
                        }
                    }
                }
                return false;
            },
            autoLog = function (e) {
                var et = {};
                var found = 0;
                var conf = CAVNV.config.autoLoggingRules || {};
                if (!conf) return;

                //Return if pageinstance reaches maxPage
                if (conf.maxPage < CAVNV.pageInstance) {
                    boomr.set_nd_instrFlag(true, 0);
                    return;
                }


                var or = conf.or || [];
                var op = {};
                var se = CAVNV.config.se || [];
                if (matchEvents(e, se, 1, 1) == true) {
                    found = 1;
                    op = conf.seRule;
                }

                if (found == 0) { //if struggling event matched then don't check oe
                    //Other Events array matching
                    for (var i = 0; i < or.length; i++) {
                        if (or[i].et == null || or[i].et == undefined) or[i].et = 3; //taking default threshold to 3 if not given in config
                        if (matchEvents(e, or[i].e, or[i].et, 0)) {
                            found = 1;
                            op = or[i];
                            break; //found matching. no need to loop further
                        }
                    }
                }

                if (found == 1) {
                    //Set Default Value of trace header
                    var ndH = 0, logLevel = 0;
                    if (op.autoInst == true)
                        boomr.set_nd_instrFlag();
                    if (op.logCapture == true)
                        CAVNV.plugins.MonitorConsole.flush(true, true);
                    if (op.autoTrace) {
                        if (op.autoTrace.mode == 1) boomr.set_nd_instrFlag(true, op.autoTrace.mask);
                        if (op.autoTrace.mode == 2) ndH = op.autoTrace.mask;
                    }
                    if (op.logLevel) {
                        boomr.set_nd_instrFlag(false, null, op.logLevel); //set the cookie
                        logLevel = op.logLevel;
                    }
                    CAVNV.setNDTraceHeader = ndH + ":" + logLevel; //set value for header
                }
            },
            applyPattern = function (event, data) {
                var patConf = CAVNV.eDataPattern;
                var m = [];
                if (patConf.length) {
                    for (var i = 0; i < patConf.length; i++) {
                        if (patConf[i].e != event) continue;
                        //check if valid regex
                        if (!patConf[i].cp) {
                            try {
                                var regex = new RegExp(patConf[i].p);
                                patConf[i].cp = regex;
                            }
                            catch (e) { CAVNV.log(e); patConf[i].cp = patConf[i].p; }
                        }

                        //get matched string and send json in response
                        m = JSON.stringify(data.match(patConf[i].cp));
                        data = data.replace(patConf[i].cp, '##**##');
                        break;
                    }
                }
                return { "match": m, "data": data };
            },

            cav_nv_log_event = function (nvEvent, data) {
                if (typeof nvEvent !== 'string') return;
                //Just add this entry in queue.
                //TODO: Note: we are not encoding the data. Instead of that we are just encoding the |.
                var time = new Date().getTime();

                //if event is customMetrics then don't play with that again.
                if (nvEvent === 'customMetrics') {
                    CAVNV.log('customMetrics added -' + data);
                    queue.push({
                        'time': time,
                        'event': nvEvent,
                        'data': data,
                        'field': ''
                    });
                    post();
                    return;
                }

                var data_str = '{}';
                var data_fields = {};

                //check if any data given with this api.
                if (typeof data !== 'undefined' || typeof data !== null) {
                    //if it is object then convert that into JSON string.
                    if (typeof data === 'object') {
                        try {
                            data_str = JSON.stringify(data);
                            data_fields = applyPattern(nvEvent, data_str);
                            data_str = data_fields.data;
                        }
                        catch (e) {
                            //just send the empty data.
                            queue.push({
                                'time': time,
                                'event': nvEvent,
                                'data': '{}',
                                'field': ''
                            });
                            post();
                        }
                    }
                    else {
                        //Note: in case of ClickMonitor we are raising event with tag. And those tags are just string. 
                        //earlier data was only JSON. Now it could be string also.
                        /*
                        data_str = JSON.stringify({
                          'data': data.toString()
                        });
                        */
                        data_str = data.toString();
                        data_fields = applyPattern(nvEvent, data_str);
                        data_str = data_fields.data;
                    }
                }
                var e = CAVNV.config.ocxFilter.events || [];
                if (nvEvent != 'userSegmentMask' && nvEvent != 'LoginID' && nvEvent != 'SessionID' && nvEvent != 'OrderTotal' && nvEvent != 'transactionID' && nvEvent != 'variationData' && nvEvent != 'Timing' && (e.indexOf(nvEvent) != -1 || e.length == 0)) {
                    check_and_enable_nd_instr(nvEvent);
                    autoLog(nvEvent);

                    if (CAVNV.config.uxScore && CAVNV.config.uxScore.enabled) {
                        CAVNV.frus += 3;
                    }
                    //if ocxFilter is enabled then mark session as filtered. 
                    if (CAVNV.ocxFilter == 0) {
                        CAVNV.set_session_flag('ocxFilter', 1);
                        CAVNV.ocxFilter = 1;
                        CAVNV.plugins.IframeMonitor.sync();
                        //flush the existing data. 
                        IDB.flush();
                    }
                }
                CAVNV.log('Netvision, EventLogger: evnet ' + nvEvent + ' Fired. user data = ' + data_str);
                queue.push({
                    'time': time,
                    'event': nvEvent,
                    'data': data_str,
                    'field': data_fields.match

                });
                post();
            },
            //This method will post these messages to nv server. 
            post = function (force) {

                if (queue.length == 0) return;

                force = force || false;

                if (queue.length >= queue_threshold || force || unloading) {
                    //check if sid and pageInstance not set then return.
                    if (!CAVNV.sid || CAVNV.pageInstance == undefined || CAVNV.pageIndex == undefined) {
                        CAVNV.log('NetVision, EventLogger: failed to send events, sid, pageIndex or pageInstance not set.');
                        return;
                    }

                    //take each entry and add sid and other fields.
                    //format: of data will be sid|pageIndex|pageInstance|time|eventName|eventData.
                    var prefix = CAVNV.sid + '|' + CAVNV.pageIndex + '|' + CAVNV.pageInstance;
                    var msg = '', queueToSend = [];
                    for (var i = 0; i < queue.length; i++) {
                        //convert time relative to cav_epoch.
                        /*var cur_time = queue[i].time;
                        if (CAVNV.nav_start_time > cur_time) cur_time = CAVNV.cav_epoch_nav_start_time;
                        else cur_time = (parseInt((cur_time - CAVNV.nav_start_time) / 1000) + CAVNV.cav_epoch_nav_start_time);*/
                        var cur_time = parseInt(CAVNV.utils.nv_time(queue[i].time) / 1000);
                        var data = prefix + '|' + cur_time + '|' + queue[i].event + '|' + queue[i].data;

                        //Add fields for event aggregation
                        if (queue[i].event != 'variationData' && queue[i].event != 'customMetrics' && queue[i].event != 'LoginID'
                            && queue[i].event != 'SessionID' && queue[i].event != 'transactionID' && queue[i].event != 'OrderTotal'
                            && queue[i].event != 'userSegmentMask')
                            data += '|' + queue[i].field;

                        queueToSend.push(data);
                    }
                    //message prepared to send.
                    //create ajax request and send this data.
                    CAVNV.log('NetVision, EventLogger: msg = ' + msg);

                    var url = CAVNV.beacon_url + "?s=" + CAVNV.sid + "&p=" + CAVNV.protocolVersion + "&m=" + CAVNV.messageVersion + "&op=el&pi=" + CAVNV.pageInstance + "&CavStore=" + CAVNV.store + "&pid=" + CAVNV.pageIndex + "&d=" + CAVNV.pageIndex + "&lts=" + CAVNV.lts;

                    //In case of force mode we are sending in sync mode.
                    //if(unloading)
                    //CAVNV.util.sendData(url, msg, "el"); 
                    //else 
                    //CAVNV.utils.sendData(url, msg, "el");    
                    //send data to nv server.
                    if (CAVNV.messageVersion)
                        CAVNV.utils.sendData(url, JSON.stringify(queueToSend), "el");
                    else
                        CAVNV.utils.sendData(url, queueToSend.join('\n') + "\n", "el");

                    //empty queue
                    queue = [];
                }
            };

        CAVNV.plugins.EL = {
            init: function () {
                //TODO: read configuration for threshold events.
                if (plugin_loaded) return true;

                //add unload event listener.
                var cb = function () {
                    CAVNV.log("Netvision, EventLogger: page is unloading sending Events data");
                    unloading = true;
                    post();
                };
                //current scope need to be followed.
                CAVNV.subscribe('page_unload', cb, null, this);

                plugin_loaded = true;
            },

            is_complete: function () {
                return plugin_loaded;
            },

            flush: function () {
                CAVNV.log('Netvision, EventLogger: flush() called');
                if (plugin_loaded) post(true);
            },
            restart: function () {
                CAVNV.log('Netvision, EventLogger: restart() called');
                if (!plugin_loaded) this.init();
                else {
                    queue = [];
                    unloading = false;
                }
            }
        };

        //export event logging api.
        h.cav_nv_log_event = cav_nv_log_event;
        CAVNV.cav_nv_log_event = cav_nv_log_event;

    }(CAVNV.window));



    //This plugin will have two modules, one xhr proxy and another mutation observer.
    //MutationDetector.
    //This plugin will compute time taken in any mutation done because of any click, route change or xhr request.
    (function (h) {
        var d = h.document;
        var idle_time = 1000;

        function MutationDetector() {
            this.running_mutation = 0;
            this.pending_mutation_events = [];
            this.timer = null;
        }

        MutationDetector.prototype.mutation_callback = function (records) {
            //TODO: Check if any element is on watch.  
            if (md.running_mutation <= 0)
                return true;

            //clear pervious timer. 
            md.clearTimeout();

            //take top most record from pending_mutation_event. 
            var l = md.pending_mutation_events.length - 1;
            var wait_flag = false;

            if (l < 0 || !md.pending_mutation_events[l])
                return true;

            if (records && records.length) {
                //update domcomplete time.
                //TODO: replace time.
                md.pending_mutation_events[l].resource.timing.domComplete = new Date().getTime();
                var x, y, z;
                for (var z = 0; z < records.length; z++) {
                    if (records[z].type == "attributes") {
                        wait_flag |= md.wait_for_node(records[z].target, l);
                    }
                    else {
                        if (records[z].type == "childList") {
                            y = records[z].addedNodes.length;
                            for (x = 0; x < y; x++)
                                wait_flag |= md.wait_for_node(records[z].addedNodes[x], l);
                        }
                    }
                }
            }
            //If no node is on wait then just set idle timer.
            if (!wait_flag)
                md.setTimeout(idle_time, l);

            return true;
        }

        MutationDetector.prototype.wait_for_node = function (node, eventIdx) {
            //Check if resource is Image, script, iframe or css. 
            var wait_flag = false, A, n, j, a, l, i;
            //^(IMG|SCRIPT|IFRAME)$
            var regex = new RegExp("^(SCRIPT" + (CAVNV.config.SPA.ignoreFrame ? "" : "|IFRAME") +
                (CAVNV.config.SPA.ignoreImg ? "" : "|IMG") + ")$");

            if (node.nodeName.match(regex) || (node.nodeName === "LINK" && node.rel && node.rel.match(/\<stylesheet\>/i))) {
                if (node._nv && node._nv.end) {
                    A = true;
                }
                node._nv = {
                    start: new Date().getTime(),
                    res: eventIdx
                }
                j = node.src || node.href;
                //Need to remove # from the URL.
                if (j && j != "") {
                    var lastIdx = j.lastIndexOf('#');
                    if (lastIdx != -1)
                        j = j.substring(0, lastIdx);
                }
                if (node.nodeName === "IMG") {
                    //If image loaded then no need to wait.
                    if ((node.naturalWidth || node.complete) && !A) {
                        if (!node.naturalWidth && node.complete)
                            CAVNV.log("CAVNV.SPA.Trace IMG Failed : " + node.src);
                        return false;
                    }
                    //if src not specified then mark done.
                    if (node.getAttribute("src") === "")
                        return false;
                }
                //if inline javascript then don't wait.
                if (!j || j.match(/^(about:|javascript:)/i))
                    return false;
                var m_event = md.pending_mutation_events[eventIdx];
                if (!m_event) return false;

                //check if we already waiting for this resource.
                m_event.urls = m_event.urls || {};
                if (m_event.urls[j]) return false;

                //TODO: understand it again.
                if (node.nodeName === "SCRIPT" /*&&  SPA Plugin is present.*/)
                    return false;

                //Check for blacklist script sources.
                if (!m_event.resource.url && node.nodeName === "SCRIPT") {
                    //TODO: filter blacklist host or path for scripts.
                    m_event.resource.url = j;
                }
                //Add load and error listener.
                node.addEventListener("load", function (e) {
                    md.load_callback(e);
                });

                node.addEventListener("error", function (e) {
                    md.load_callback(e);
                });
                //add in node wait list.
                m_event.nodes_to_wait++;
                m_event.resources.push(node);
                m_event.urls[j] = 1;
                wait_flag = true;
                CAVNV.log('CAVNV.SPA.Trace ' + node.tagName + "(" + eventIdx + ") :" + (node.src || node.href));
            }
            else {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    //Collect all images and check if need to wait on that.
                    var img = node.getElementsByTagName("IMG");
                    if (img && img.length) {
                        a = img.length;
                        for (n = 0; n < a; n++)
                            wait_flag |= md.wait_for_node(img[n], eventIdx);
                    }
                }
            }
            return wait_flag;
        }

        //load_callback.
        MutationDetector.prototype.load_callback = function (event) {
            var node, eventIdx;
            node = event.target || event.srcElement;

            if (!node || !node._nv)
                return;

            //if already marked as done then return.
            if (node._nv.end) return;

            node._nv.end = new Date().getTime();
            //node._nv.state = d.type;
            eventIdx = node._nv.res;

            CAVNV.log('CAVNV.SPA.Trace Complete' + node.tagName + ":" + (node.src || node.href));
            //call load_finished.  
            this.load_finished(eventIdx);
        }

        MutationDetector.prototype.load_finished = function (eventIdx) {
            //if that event done.
            var m_event = this.pending_mutation_events[eventIdx];
            if (!m_event) return;

            //decrease node_to_wait.
            m_event.nodes_to_wait--;

            CAVNV.log('CAVNV.SPA.Trace - complete(' + eventIdx + ') ' + m_event.nodes_to_wait);
            //Check if no more resource to wait.
            if (m_event.nodes_to_wait <= 0) {
                m_event.resource.timing.loadEventEnd = new Date().getTime();
                //post processing. 
                if (m_event.type === "spa") {
                    //In case of spa we need to wait for some idle time.
                    this.setTimeout(idle_time, eventIdx);
                }
                else {
                    this.eventComplete(eventIdx);
                }
            }
        }

        MutationDetector.prototype.eventComplete = function (eventIdx) {
            //Currently we supporting two type of events spa and xhr.
            var m_event = this.pending_mutation_events[eventIdx];

            if (!m_event || m_event.complete)
                return;

            //now mark this event as complete.
            m_event.complete = true;
            //decrease event count.
            this.running_mutation--;
            if (this.running_mutation < 0)
                this.running_mutation = 0;

            //TODO: review it again.

            if (!this.running_mutation)
                xhrCaptureFlag = false;

            //clear any timer.
            this.clearTimeout();

            //if xhr then dump the request if captureAjax Enabled.
            if (m_event.type === "spa") {
                //move to another page.
                //passing m_event as we can derive some other options.
                //pass these m_event data into options.
                if (CAVNV.config.pageReadyIndicator) {
                    CAVNV.first_beacon_sent = false;
                    CAVNV.SPA = { url: m_event.resource.url, e: { __nv: m_event } };
                    CAVNV.startlistenersForIndicator();
                    CAVNV.startPageReadyIndicators();

                    var cb = function () {
                        try {
                            /*if(impl.pageReadyValidator)
                              return impl.pageReadyValidator.call(CAVNV.window);*/
                            if (CAVNV.config.pageReadyIndicator)
                                return CAVNV.startPageReadyIndicators();// for document elements check
                        }
                        catch (e) {
                            //if any exception occure then we will return false.
                            return false;
                        }
                    }

                    var count = 0;
                    if (cb() === true) count++;
                    var prevtimer = setInterval(function () {
                        if (cb() === true) count++;
                        if (count >= 2) {
                            clearInterval(prevtimer);
                            if (!CAVNV.first_beacon_sent) {
                                CAVNV.first_beacon_sent = true;
                                h.cav_nv_ajax_pg_end(m_event.resource.url, null, { __nv: m_event });
                                CAVNV.SPA = undefined;
                            }
                        }
                    }, 100);
                }
                else
                    h.cav_nv_ajax_pg_end(m_event.resource.url, null, { __nv: m_event });
            }
            else if (m_event.type === "xhr") {
                //TODO:
            }
        }//TODO:

        //FIXME: this should return if MutationDetector is started properly or not.
        MutationDetector.start = function () {
            //setup mutation observer.
            if (!MutationObserver) return;
            var moconfig = {
                childList: true,
                attributes: true,
                subtree: true,
                attributeFilter: ["src", "href"]
            };
            MutationDetector.observer = new MutationObserver(md.mutation_callback);
            //now start observing the complete document.
            MutationDetector.observer.observe(d, moconfig);

            //start XHR Mutation Detector. 
            if (config.XHRModule.enable)
                MutationDetector.enableXHRDetector();
        }

        //Stop observer.
        MutationDetector.stop = function () {
            if (MutationDetector.observer) {
                //disconnect.
                MutationDetector.observer.disconnect();
                MutationDetector.observer = null;
            }
        }

        MutationDetector.prototype.clearTimeout = function () {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
        }

        MutationDetector.prototype.setTimeout = function (duration, eventIdx) {
            //first clear privious timer if set.

            var md = this;
            if (duration <= 0) return;

            this.clearTimeout();
            this.timer = setTimeout(function () {
                md.timeout(eventIdx);
            }, duration);
        }

        MutationDetector.prototype.timeout = function (eventIdx) {
            this.clearTimeout();
            var m_event = this.pending_mutation_events[eventIdx];
            if (m_event && (m_event.type === "spa" || m_event.type === "xhr")) {
                if (m_event.type === "spa" && m_event.nodes_to_wait <= 0) {
                    //call event complete.
                    this.eventComplete(eventIdx);
                }
                else if (m_event.type === "xhr") {
                    this.eventComplete(eventIdx);
                }
            }
            else {
                //clean from pending_mutation_events array.
                this.pending_mutation_events[eventIdx] = undefined;
                if (this.running_mutation > 0)
                    this.running_mutation--;
            }
        }

        MutationDetector.enableXHRDetector = function () {
            //Check if already enabled 
            var xmclient;
            if (!MutationDetector.xpclient) {
                var xpclient = new XMLProfiler(config.XHRModule.options, h, h.document);

                //Some error occurred.
                if (!xpclient.xmlp)
                    return;

                //set event listener. 
                xpclient.addEventListener('ajaxSend', function (xhr) {
                    //new xhr request being sent.
                    //If there is no running mutation then no need to do this extra effort.
                    if (!xhr || !xhr.__nv || !xhrCaptureFlag) return;

                    //add spa record.
                    var record = {
                        timing: {},
                        initator: "spa"
                    };

                    //Check if spa is enabled.
                    var idx = -1;
                    if (md.running_mutation)
                        idx = md.addEventResource(record);
                    CAVNV.log('CAVNV.SPA.Trace ' + "XHR(" + idx + ") :" + xhr.__nv.url);

                    xhr.__nv.sparecord = record;
                }, md);

                xpclient.addEventListener('ajaxComplete', function (xhr) {
                    if (!xhr || !xhr.__nv || !xhr.__nv.sparecord) return;
                    var record = xhr.__nv.sparecord;
                    CAVNV.log('CAVNV.SPA.Trace Complete ' + "XHR" + ":" + xhr.__nv.url);
                    if (record.index > -1)
                        md.load_finished(record.index);
                    else {
                        //Note: currently we just ignoring xhr request.
                        md.addEvent(record);
                    }
                }, md);
            }
        }

        MutationDetector.disableXHRDetector = function () {
            if (MutationDetector.xpclient) {
                MutationDetector.xpclient.destroy();
                MutationDetector.xpclient = null;
            }
        }

        MutationDetector.prototype.addEvent = function (entry) {
            var event = {
                type: entry.initiator,
                resource: entry,
                resources: [],
                nodes_to_wait: 0,
                complete: false
            }
            //find any incomplete entry.
            var count = this.pending_mutation_events.length;
            var prevEvent = null;
            for (var z = count - 1; z >= 0; z--) {
                if (this.pending_mutation_events[z] && !this.pending_mutation_events[z].complete) {
                    prevEvent = this.pending_mutation_events[z];
                    break;
                }
            }

            if (prevEvent) {
                //If any spa event is in processing, then continue.
                if (prevEvent.type === "spa") {
                    if (event.type === "xhr")
                        return null;
                    else if (event.type === "spa") {
                        //just update the url.
                        //Check if last event is not older than 1 sec.
                        if (entry.timing.requestStart - prevEvent.resource.timing.requestStart < 1000) {
                            prevEvent.url = entry.url;
                            return;
                        }
                        //else if event is very old then we will add new spa event on same index. 
                    }
                }
            }

            //add in pending_mutation_events. 
            //If already a very old pending event is there then 
            if (prevEvent) {
                //reset the previous one.
                this.pending_mutation_events[z] = event;
                count = z;
            }
            else {
                this.pending_mutation_events.push(event);
                this.running_mutation++;
            }
            //Check if mutation observer not running then just check if request complete then just call eventComplete. 
            if (!MutationDetector.observer) {
                if (entry.url && entry.timing.loadEventEnd)
                    eventComplete(count);
                return null;
            }
            else {
                //set the idle timer.
                if (event.type === "spa")
                    this.setTimeout(idle_time, count);
                else {
                    //TODO: this timer is not enough for xhr request.
                    this.setTimeout(100, count);
                }
                return count;
            }
        }

        //add resource entry. 
        //This will return index of current running event.
        MutationDetector.prototype.addEventResource = function (entry) {
            if (!entry)
                return -1;

            var eventIdx = this.pending_mutation_events.length - 1;
            if (eventIdx < 0)
                return -1;

            if (!this.pending_mutation_events[eventIdx])
                return -1;

            this.pending_mutation_events[eventIdx].nodes_to_wait++;
            //set index in entry.
            entry.index = eventIdx;
            return eventIdx;
        }

        //create new instance for MutationDetector.
        var md = new MutationDetector();
        var currentLocation = null; //this will be updated on routechange or location change..
        var xhrCaptureFlag = false;


        //TODO: we should try to handle spa if no supported framework present. by click events.
        var supportedSpaFramworks = ["angular", "history"];
        //init methods for different spa callbacks.
        //will return true if setup done properly.
        var angularStartSPA = function (ng, rootScope) {
            if (!ng) {
                ng = h.angular;
                if (!ng) return false;
            }

            //check if angular present. 
            if (!rootScope) {
                //we assuming that rootScope can be fetch by body.
                //FIXME: this assumption will not work in some cases.
                var e = d.getElementsByTagName('body')[0];
                var scope = ng.element(e).scope();
                if (scope)
                    rootScope = scope.$root;
                else {
                    //In case if debuginfoenabled  set to false then we can not access scope by just by elements.
                    if (ng.element(e).injector())
                        rootScope = ng.element(e).injector().get("$rootScope");
                }
                if (!rootScope) return false;
            }


            //now setup routce chagne events.
            //routeChangeStart. 
            rootScope.$on("$routeChangeStart", function (event, nextRoute, currentRoute) {
                CAVNV.log("routeChangeStart: url - " + nextRoute.templateUrl);
                //update location.
                CAVNV.plugins.SPA.setLocation(nextRoute.templateUrl);
                CAVNV.plugins.SPA.routeChange();
            });

            //some applications may use angular-ui/ui-router. that will not raise routeChangeStart event, those fire stateChangeStart event.
            //rootScope.$on("$stateChangeStart", 
            //function(event, toState/*, toParams, fromState, fromParams*/){
            //CAVNV.log("$stateChangeStart: url - " + toState.url);  
            //CAVNV.plugins.SPA.routeChange();
            //});

            //now set event for location change.
            rootScope.$on("$locationChangeStart", function (event, newUrl, oldUrl) {
                CAVNV.log("locationChangeStart: - " + newUrl);
                CAVNV.plugins.SPA.setLocation(newUrl);
                //Note: some times locationChangeStart comes first from routeChangeStart(routeChangeStart is not necessory to happen so splitting the page.).
                //Note; if already once spa event will be there then it will be discarded.
                CAVNV.plugins.SPA.routeChange();
            });
            return true;
        }

        var hookHash = function () {
            if (!(h.addEventListener && h.HashChangeEvent)) {
                CAVNV.info('CAVNV - HashChangeEvent not found');
                return false;
            }

            h.addEventListener('hashchange', function (e) {
                CAVNV.info('CAVNV - HashChangeEvent, oldurl - ' + e.oldURL + ', newurl - ' + e.newURL);
                CAVNV.plugins.SPA.setLocation(e.newURL);
                CAVNV.plugins.SPA.routeChange();
            });

            return true;
        }

        var hookNav = function () {
            if (!(h.navigation && h.navigation.addEventListener && h.navigation.currentEntry)) {
                CAVNV.info('CAVNV - navigation not found');
                return false;
            }

            h.navigation.addEventListener('navigatesuccess', function (navigateEvent) {
                CAVNV.info('CAVNV - NavigationEvent, url - ' + navigateEvent.currentTarget.currentEntry.url);
                CAVNV.plugins.SPA.setLocation(navigateEvent.currentTarget.currentEntry.url);
                CAVNV.plugins.SPA.routeChange();
            });

            return true;
        }

        var hookHistory = function () {
            if (!h.history) {
                return false;
            }
            //TODO: need to instrument other methods.
            var history = h.history;

            var orig_history = {
                "pushState": history.pushState
            };

            history.pushState = function (state, title, url) {
                CAVNV.info('CAVNV - history.pushState,  URL - ' + url + ' and title - ' + title + ' and location - ' + d.location.href);
                orig_history.pushState.apply(this, arguments);
                if (url)
                    CAVNV.plugins.SPA.setLocation(d.location.href);
                CAVNV.plugins.SPA.routeChange();
            }
            return true;
        }

        var config = {
            framework: "angular",
            XHRModule: {
                enable: true,
                options: {
                    captureCrossDomain: false,
                    filters: {
                        mode: "blacklist",
                        /*
                         Ex: [{domain: 'www.ana.com', path: '/ana'},
                              {domain_regex: /(ana)/, path_regex: /(ana)/}]
                        */
                        entry: []
                    }
                }
            },
            ignoreFrame: true,
            ignoreImg: false
        };

        CAVNV.plugins.SPA = {
            init: function (c) {
                //Note: currently MutationDetector is dependent on MutationObserver and XMLHttpRequest 
                if (!h.MutationObserver || !h.XMLHttpRequest) {
                    CAVNV.log("Supported library not present for MutationDetector");
                    return;
                }
                //TODO: check what configuration we can have.
                var kw = ['elementList', 'XHRModule', 'framework'];

                CAVNV.utils.pluginConfig(config, c, 'SPA', kw);
                //check if framework is given in configuration then no need to auto discover that.
                var frameworkAttached = false;
                if (config.framework) {
                    if (typeof config.framework == 'string')
                        config.framework = [config.framework];

                    if (config.framework.includes('Navigation')) {
                        var targetFramework = 'Navigation';
                        var index = config.framework.indexOf(targetFramework);
                        var removedFramework = config.framework.splice(index, 1)[0];
                        config.framework.unshift(removedFramework);
                    }

                    //Note: at a time only one framework will work.
                    for (var z = 0; z < config.framework.length; z++) {
                        if (config.framework[z] == 'angular') {
                            if (angularStartSPA(h.angular)) {
                                frameworkAttached = true;
                                break;
                            }
                        }
                        else if (config.framework[z] == 'history') {
                            if (hookHistory()) {
                                frameworkAttached = true;
                                CAVNV.log("CAVNV.plugins.SPA init() : history plugin enabled");
                                break;
                            }
                        }
                        else if (config.framework[z] == 'hashchange') {
                            if (hookHash()) {
                                frameworkAttached = true;
                                CAVNV.log("CAVNV.plugins.SPA init() : hashchange plugin enabled");
                                break;
                            }
                        }
                        else if (config.framework[z] == 'Navigation') {
                            if (hookNav()) {
                                frameworkAttached = true;
                                CAVNV.log("CAVNV.plugins.SPA init() : Navigation plugin enabled");
                                break;
                            }
                        }
                    }
                }


                if (!frameworkAttached) return;

                //start MutationDetector. 
                MutationDetector.start();
            },
            is_complete: function () {
                return true;
            },

            getMutationDetector: function () {
                return md;
            },

            setLocation: function (url) {
                currentLocation = url;
            },

            routeChange: function () {
                //Check if this occure on start. 
                var url = currentLocation ? currentLocation : h.document.location.href;
                var event = {
                    timing: {
                        requestStart: new Date().getTime()
                    },
                    initiator: "spa",
                    url: url
                }
                event.index = this.getMutationDetector().addEvent(event);

                //Check if we got valid index then start new page.
                if (event.index != undefined && event.index != null)
                    h.cav_nv_ajax_pg_start(url, null, {});


                //enable xhrCaptureFlag.
                xhrCaptureFlag = true;
            }
        }
    }(CAVNV.window));


    //AjaxMonitor.
    (function (h) {
        //default config.
        var config =
        {
            captureCrossDomain: false,
            captureRSCtiming: true,
            /*Name of the correlation header. Eg. X-CorrelationId*/
            correlationHeader: null,
            filters: {
                mode: "blacklist",
                entry: [
                    /***FILLLLLLLLLLLLLLLLLLLLLLLLL   mMMMMMMMMMMMMMMMMMMMMMMMMEEEEEEEEEEEEEEEEEEEEE***/
                ]
            },
            captureHeader: false,
            wlHeaders: [],
            blHeaders: [],
            logHeaderOnFailure: true,
            logPDOnFailure: true,
            /*flag to capture post data*/
            capturePostData: false,
            /*flag to capture resposne. response will only be capture for selected content type.*/
            captureResponse: false,
            //Flag to trigger event on Ajax Call Failure.  
            ajaxFailureEvent: true,
            logFailedAjax: true,
            maskPattern: []
        },
            active = false, xmlp, ajaxFailed = false,
            /*msg q*/
            queue = [], threshold = 15/*TODO: make it global*/;

        var defaultContentType = [
            ["application/json", /json/],
            ["application/x-www-form-urlencoded", /urlencoded/],
            ["application/xml", /xml/]
        ]

        function post(event) {
            //Format: URL|TimeStamp|StatusCode|Method|ByteTransfered|ResponseTime|ResponseText|Data
            /*    var msg = encodeURIComponent(event.url) + "|" + 
                          parseInt(CAVNV.utils.nv_time(new Date().getTime())/1000) + "|" +
                         */
            queue.push(event);
            send();
        }

        function send(force) {
            force = force || false;
            //sid not defined.
            if (!queue.length || !CAVNV.sid) return;

            if (queue.length >= threshold || force) {
                var queueToSend = [];
                var data = '';
                queue.forEach(function (entry) {
                    //change the timing into cav_epoch.
                    var timingData = entry.data.timings;
                    for (var e in timingData)
                        timingData[e] = CAVNV.utils.nv_time(timingData[e]);
                    var resp = (isNaN(parseInt(entry.responseTime)) == true) ? 0 : parseInt(entry.responseTime);

                    //Added as mcom env got url > 4096 size
                    if (entry.url.length > 1024) return;
                    var msg = entry.status + "|" +
                        entry.method.toUpperCase() + "|" +
                        entry.bytesTransfred + "|" +
                        resp + "|" +
                        encodeURIComponent(JSON.stringify(entry.data)) + "|" +
                        "" /* ff1 , left empty*/ + "|" +
                        entry.exceptionCount + "|" +
                        entry.fpInstance + "|{-1}";
                    CAVNV.log("ANA : Sending XHR at " + entry.t + " ");
                    data = encodeURIComponent(entry.url) + '|' +
                        parseInt(parseInt(CAVNV.utils.nv_time(entry.startTime)) / 1000) + '|' + msg + '|' + (entry.correlationId || '');
                    queueToSend.push(data);
                });

                var geo_id = CAVNV.geo_id || CAVNV.get_session_flag('GeoId');
                var location_id = CAVNV.location_id || CAVNV.get_session_flag('LocationId');
                var access_type_id = CAVNV.access_type_id || CAVNV.get_session_flag('AccessTypeId');

                var xdata2 = CAVNV.pageIndex + "|" + CAVNV.channel + "|" + CAVNV.browser_id + "|" + geo_id + "|" + location_id + "|" + access_type_id + "|" + CAVNV.store + "|" + CAVNV.terminal;
                var url = CAVNV.beacon_url + "?s=" + CAVNV.sid + "&p=" + CAVNV.protocolVersion + "&m=" + CAVNV.messageVersion + "&op=xhrdata&pi=" + CAVNV.pageInstance + "&CavStore=" + CAVNV.store + "&d=" + xdata2 + "&lts=" + CAVNV.lts;

                if (CAVNV.messageVersion == 1)
                    CAVNV.utils.sendData(url, JSON.stringify(queueToSend), "xhrdata");
                else
                    CAVNV.utils.sendData(url, queueToSend.join('\n') + "\n", "xhrdata");
                queue = [];
            }
        }

        function start() {
            //Note: filter will be applicable only for logging the xhrdata. 
            var filters = config.filters;
            config.filters = { mode: "blacklist", entry: [] };

            //start the XMLProfiler.
            xmlp = new XMLProfiler(config, h, h.document);

            //reset the filters.
            config.filters = filters;

            if (!xmlp.xmlp) return;

            xmlp.addEventListener('ajaxComplete', function (xhr) {
                setTimeout(function () {
                    handleXHRRequestComplete(xhr);
                }, 0);
            }, this);

            xmlp.addEventListener('ajaxError', function (xhr) {
                //Note: currently we are triggering the event only once for a page. 
                if (!ajaxFailed) {
                    CAVNV.cav_nv_log_event('AjaxError', { url: xhr.__nv.url, status: xhr.__nv.status, method: xhr.__nv.method });
                    ajaxFailed = true;
                }
            }, this);

            active = true;
        }

        //save xhrbandwidth 
        function xhrbandwidth() {
            if (totalDuration) {
                var xhrObj = { nv_tBytesxhr: totalBytes, nv_tDurationxhr: totalDuration };
                CAVNV.cav_nv_set_session_data('xhrbw', xhrObj);
            }
        }



        function handleXHRRequestComplete(xhr) {
            if (!xhr || !xhr.__nv) return;
            if (CAVNV.config.uxScore && CAVNV.config.uxScore.enabled) {
                CAVNV.transEndTime = new Date().getTime();
                CAVNV.httpReqSent = true;
            }
            //Note: check if logFailedAjax is enable and error code is failed then log the entry forcefully.
            if (config.logFailedAjax == false || !XMLProfiler.isFailedStatus(xhr.__nv.status)) {
                //Check for filters.
                if (XMLProfiler.isFiltered(xhr.__nv.url, config.filters)) {
                    CAVNV.log("handleXHRRequestComplete: XHR Entry (" + xhr.__nv.url + ") Filtered");
                    return;
                }
            }
            else {
                CAVNV.log("handleXHRRequestComplete: failed XHR request (" + xhr.__nv.url + "), logging");
            }

            // Note: same method will handle for fetch too. so need to add some methods.
            if (xhr.headers) {
                xhr.getResponseHeader = function (name) {
                    return xhr.headers[name.toLowerCase()];
                }
            }

            var xhrdata = {};
            //collect desired data from xhr.
            xhrdata.method = xhr.__nv.method;
            //Note: this URL will be without query string.TODO: check if we need to save query string.
            xhrdata.url = xhr.__nv.url;
            xhrdata.status = xhr.__nv.status;
            var failed = false;

            if (xhrdata.status / 100 == 5 || xhrdata.status == 403)
                failed = true;

            xhrdata.startTime = xhr.__nv.timing.requestStart;
            if (xhr.__nv.timing.requestStart && xhr.__nv.timing.loadEventEnd && xhr.__nv.timing.loadEventEnd > xhr.__nv.timing.requestStart)
                xhrdata.responseTime = (xhr.__nv.timing.loadEventEnd - xhr.__nv.timing.requestStart); //in ms.
            else
                xhrdata.responseTime = 0;

            if (CAVNV.config.uxScore && CAVNV.config.uxScore.enabled)
                boomr.getUxScore(xhrdata.responseTime, 1);

            //bytes transfered.
            //TODO: check what cases are missing.
            var clength = -1;
            if (xhr.__nv.nco)
                try {
                    clength = xhr.getResponseHeader('Content-Length');
                }
                catch (e) {
                    clength = -1;
                }
            if (clength && clength > 0)
                xhrdata.bytesTransfred = parseInt(clength);
            else
                xhrdata.bytesTransfred = -1;//TODO: should be set this to 0.

            if (xhr.__nv.timing.header_received && xhr.__nv.timing.loadEventEnd && xhr.__nv.timing.loadEventEnd > xhr.__nv.timing.header_received && clength > 0) {
                xhrdata.downloadTime = (xhr.__nv.timing.loadEventEnd - xhr.__nv.timing.header_received); //in ms. 
                totalDuration += xhrdata.downloadTime;
                xhrdata.bytesTransfred = parseInt(clength);
                totalBytes += xhrdata.bytesTransfred;
            }

            //Note: now we have to get this value from x-cavnv header.
            var ndHeaderValue = null;
            if (xhr.__nv.nco)
                ndHeaderValue = xhr.getResponseHeader(CAVNV.ndHeader);

            xhrdata.fpInstance = -1;
            xhrdata.exceptionCount = 0;
            //In case if we have multiple header with same name then above api will return the values seperated by 
            //  ', ' (comman and space.)
            if (ndHeaderValue) {
                var fields = ndHeaderValue.split(', ');
                if (fields.length > 1)
                    ndHeaderValue = fields[fields.length - 1];
                //format: flowpathinstance-testrun-category
                //Note: currently we are not using category field.
                //Assumption is that header will only be added if the url is instrumented.
                fields = ndHeaderValue.split("_");
                var fpId = fields[0], category = fields[2], ndInfo = CAVNV.ndInfo, instrFlag = (!!(parseInt(fields[3]))) || ndInfo.instrFlag;
                if (!isNaN(fpId) && (instrFlag || (category != 9 && category != 10))) {
                    xhrdata.fpInstance = fields[0];
                    if (!isNaN(category))
                        CAVNV.utils.logNDEvent(category);
                }
            }
            //Other data like timing.
            xhrdata.data = {};

            xhrdata.data.statusText = xhr.statusText;

            xhrdata.data.query = xhr.__nv.query;
            xhrdata.data.url = xhr.__nv.url;
            xhrdata.data.initiator = xhr.__nv.initiator;
            //response text. 
            //Currently we are storing response Text only for some limited Content-Type like josn, xml etc.    
            if (failed) {
                //Note: in case of failed request we are dumping forcefully.
                xhrdata.data.responseText = xhr.responseText;
            }
            else if (config.captureResponse && xhr.responseText) {
                //check for content type. 
                var ctype;
                if (xhr.__nv.nco)
                    ctype = xhr.getResponseHeader('Content-Type');
                if (ctype) {
                    for (var z = 0; z < defaultContentType.length; z++)
                        if (defaultContentType[z][1].test(ctype)) break;
                    if (z != defaultContentType.length && xhr.responseText) {
                        xhrdata.data.responseText = xhr.responseText;
                        xhrdata.data.contentType = ctype;
                    }
                }
            }
            //masking responseText
            if (xhrdata.data.responseText)
                xhrdata.data.responseText = maskXHRDATA(ctype, 1, xhrdata.data.responseText);

            //check for post data.
            //TODO: postData may have some sensitive information also. We need to mask that too. 
            if (config.capturePostData || (failed && config.logPDOnFailure)) {
                if (xhr.__nv.postData)
                    xhrdata.data.postData = xhr.__nv.postData;
            }

            // masking pastData
            if (xhrdata.data.postData)
                xhrdata.data.postData = maskXHRDATA(xhr.__nv.rct, 2, xhrdata.data.postData);

            if (config.correlationHeader && xhr.__nv.nco) {
                try {
                    xhrdata.correlationId = xhr.getResponseHeader(config.correlationHeader);
                }
                catch (e) { }
            }
            //put timings.
            xhrdata.data.timings = xhr.__nv.timing;

            //FIXME: We can not get Cookie and Set-Cookie headers from xhr object. SO +--->

            //collect headers.
            if (config.captureHeader == true || (failed && config.logHeaderOnFailure)) {
                if (!xhr.headers) {
                    var headers = xhr.getAllResponseHeaders();
                    if (headers) xhrdata.data.headers = headers.split('\r\n');
                } else {
                    var headers = [];
                    for (var k in xhr.headers) {
                        headers.push(k + ': ' + xhr.headers[k]);
                    }
                    xhrdata.data.headers = headers;
                }

                if (!failed && config.wlHeaders.length > 0) {
                    var h = [];
                    for (var i = 0; i < xhrdata.data.headers.length; i++) {
                        for (var j = 0; j < config.wlHeaders.length; j++)
                            if (xhrdata.data.headers[i].indexOf(config.wlHeaders[j].toLowerCase() + ":") == 0) {
                                h.push(xhrdata.data.headers[i]);
                                break;
                            }
                    }
                    xhrdata.data.headers = h;
                }

                //check for blacklist. 
                if (config.blHeaders.length > 0) {
                    for (var i = 0; i < xhrdata.data.headers.length; i++) {
                        for (var j = 0; j < config.blHeaders.length; j++) {
                            if (xhrdata.data.headers[i].indexOf(config.blHeaders[j].toLowerCase() + ":") == 0) {
                                delete xhrdata.data.headers[i];
                                break;
                            }
                        }
                    }

                    for (var i = 0; i < xhrdata.data.headers.length; i++) {
                        if (xhrdata.data.headers[i] == undefined || xhrdata.data.headers[i] == "") {
                            xhrdata.data.headers.splice(i, 1);
                            //i--;
                        }
                    }
                }
            }


            post(xhrdata);
            //xhrCheckpoint
            CAVNV.plugins.CHECKPOINT.xhrCheckpoint(xhr);
        }

        // function for masking xhr
        // NOTE: handling only for responseText and postData
        function maskXHRDATA(cType, type, data) {
            var first = false;
            var jsonData;
            cType = cType || 'plain/text';
            // copying maskPattern to rules
            var rules = config.maskPattern.slice();
            rules.forEach(function (rule) {
                //Check for type(check if rule is applied on responseText or postData). 
                if (rule.t & type) {
                    if (rule.P) {
                        //CHeck for content type. 
                        if (cType && cType.indexOf("json") != -1) {
                            if (!first) {
                                // if parsing json causes exception then remove all Parameter based rules
                                try {
                                    jsonData = JSON.parse(data);
                                    first = true;
                                }
                                catch (e) {
                                    var j = 0;
                                    for (var i = 0; i < rules.length; i++) {
                                        if (rules[i].P)
                                            j++;
                                        else
                                            break;
                                    }
                                    rules.splice(0, j - 1);
                                    return;
                                }
                            }
                            idArray = rule.P.split(',');
                            maskJson(jsonData, 0);
                            //replace it's value with ******** 
                        }
                        //Note: not applicable for response. 
                        else if (cType && cType.indexOf('application/x-www-form-urlencoded') != -1) {
                            var indexOfParam = data.indexOf(rule.P + '=');
                            //one posibility is, rule.P is a substring of some parameter of data so we need a parameter name which is started after '&' and ended before '=' symbol.
                            while (indexOfParam != -1) {
                                if (indexOfParam == 0 || data.charAt(indexOfParam - 1) == '&' || data.charAt(indexOfParam - 1) == '?') {
                                    data = data.substring(0, indexOfParam + rule.P.length) + "******"
                                        + data.indexOf('&', indexOfParam) != -1 ? data.substring(data.indexOf('&', indexOfParam), data.length) : "";
                                    break;
                                }
                                else
                                    indexOfParam = data.indexOf(rule.P + '=', indexOfParam + 1);
                            }
                        }
                    }
                    else if (rule.r) {
                        if (first) {
                            data = JSON.stringify(jsonData);
                            first = false;
                        }
                        try {
                            data = data.replace(rule.r, "******");
                        } catch (e) {
                            CAVNV.log("SyntaxError occured in masking 'xhrData.url' on regEx basis. Moving to mask captureResponse");
                            CAVNV.error(e);
                        }
                    }
                }
            });
            // if every rule processed is based on parameter and content-type is json- then we need to convert masked json data to string data.
            if (first)
                data = JSON.stringigy(jsonData);
            return data;
        }

        //array below which holds the parameterList.
        var idArray = [];
        function maskJson(obj, idx) {
            //Check for array. 
            if (Array.isArray(obj)) {
                for (var i = 0; i < obj.length; i++)
                    maskJson(obj[i], idx);
                return;
            }

            if (obj[idArray[idx]]) {
                if (idx == idArray.length - 1) {
                    obj[idArray[idx]] = "******";
                }
                else {
                    maskJson(obj[idArray[idx]], ++idx)
                }
            }
        }
        CAVNV.plugins.AjaxMonitor = {
            init: function (c) {
                if (active == true) return;

                var kw = Object.keys(config);

                CAVNV.utils.pluginConfig(config, c, 'AjaxMonitor', kw);
                //Validate Configuration.

                //arranging the rule of maskPattern on basis of whether rule is Parameter based or regEx based.
                var pBasedRule = [], rBasedRule = [];
                config.maskPattern.forEach(function (rule) {
                    if (!CAVNV.utils.pagePresentInList(rule.p)) return;
                    if (rule.P)
                        pBasedRule.push(rule);
                    else
                        rBasedRule.push(rule);
                });
                if (pBasedRule.length || rBasedRule.length)
                    config.maskPattern = pBasedRule.concat(rBasedRule);

                start();

                //set event for unloading. 
                var cb = function () {
                    send(true);
                    //set bandwidth of xhr in local storage
                    xhrbandwidth();
                };
                //current scope need to be followed.
                CAVNV.subscribe('page_unload', cb, null, this);
            },

            is_complete: function () {
                return true;
            },

            flush: function () {
                if (active)
                    send(true);
            },
            restart: function () {
                //TODO: Check if we need to restart the xmlp client again.
                ajaxFailed = false;
                queue = [];
                var cb = function () {
                    send(true);
                    //set bandwidth of xhr in local storage
                    xhrbandwidth();
                };
            },
            addIframe: function (w) {
                if (xmlp != null) {
                    var itrIframe = false;
                    xmlp.xmlp.enable(w, itrIframe);
                }
            }
        }


    })(CAVNV.window);


    /***************DOMWATCHER2********************/
    (function (h) {
        var plugin_loaded = false;
        var plugin_initialized = false;
        var nvObserver = null;
        var xmlp = null; //xhr profiler.
        //FIXME: some of the configuration should be global or XMLProfilter should handler them seperatly.
        var config = {
            compressDomchanges: true,
            filterUnexpected: true,
            //Note: of aChange(attributeChnage) is true then we will filter attributeChanges mutation of that element.
            filterElement: [
                /*
                 {aChange: true, element: "div[spinner=\"true\"]" }, 
                 {element: "div[sorry=\"ana\"]"}
                 */
            ],
            XHRModule: {
                enable: true,
                options: {
                    captureCrossDomain: false,
                    filters: {
                        mode: "blacklist",
                        /*
                         Ex: [{domain: 'www.ana.com', path: '/ana'},
                              {domain_regex: /(ana)/, path_regex: /(ana)/}]
                        */
                        entry: []
                    }
                }
            },
            idleTime: 2000 //msec, if system will have no change for this much of time then state will be updated as UNEXPECTED.
        };
        var idleTimer = -1;
        //Mutation State.
        var ana = NVDOMObserver;
        var mutationState = {
            type: ana.USERACTION_MUTATION,
            state: ana.EXPECTED_MUTATION,
            time: new Date().getTime()
        },
            dw2 = CAVNV.plugins.DOMWATCHER2;
        CAVNV.plugins.DOMWATCHER2 = {
            init: function (c) {
                //Check if UserAction is not enabled then do not enable it.
                if (CAVNV.plugins.USERACTION.is_active() == false) {
                    plugin_loaded = true;
                    return;
                }

                if (plugin_initialized) return this;

                //Note: XHRFilter can have further settings. Like enable, captureCrossDomain and filter.
                var kw = ['filterUnexpected', 'compressDomchanges', 'XHRModule', 'filterElement'];

                CAVNV.utils.pluginConfig(config, c, 'DOMWATCHER2', kw);
                //validate config.

                //Check if considerXHR is enabled then start XMLProfiler.
                if (config.XHRModule && config.XHRModule.enable == true) {
                    //TODO: validate XHRModule.
                    xmlp = new XMLProfiler(config.XHRModule.options, h, h.document);
                    //check if xmlp supported with current ua.
                    if (xmlp.xmlp) {
                        //set callback.
                        xmlp.addEventListener('ajaxComplete', function (xhr) {
                            CAVNV.plugins.DOMWATCHER2.updateMutationState(ana.XHR_MUTATION);
                        });
                    }
                }
                var list = [], pageid;
                for (var x = 0; x < config.filterElement.length; x++) {
                    pageid = config.filterElement[x].pageid || -1;
                    if (CAVNV.utils.pagePresentInList(pageid))
                        list.push(config.filterElement[x]);
                }

                //set encypted element.
                if (CAVNV.config.encryptedElement) {
                    CAVNV.encryptedElement = CAVNV.config.encryptedElement.filter(function (elem) {
                        pageid = elem.pageid || -1;
                        if (CAVNV.utils.pagePresentInList(pageid))
                            return elem;
                    });
                }
                //Also add default selector i.e. nvEncrypted and nvSensitive.
                //Note: this have been added to handle case of SPA or sensitive information is coming in runtime. 
                CAVNV.encryptedElement.push({ 'id': '.nvEncrypted', mode: 1, 'pageid': '-1' });
                CAVNV.encryptedElement.push({ 'id': '.nvSensitive', mode: 2, 'pageid': '-1' });

                //Note: only consider those elemnt which are part of current page. 
                var me = this;
                function initObserver() {
                    if (nvObserver) return;
                    nvObserver = new NVDOMObserver(h.document, list);

                    me.updateMutationState();

                    //Take the dom at the point itself and send for compression. 
                    if (CAVNV.retryPDWithIDB)
                        CAVNV.send_dom(false, 0, me.getDOM(false), true);
                    else if (CAVNV.insideFrame) {
                        // in case of iframe, CAVNV.sid will be set by syncCavSession, 
                        // there is a possibility , that till that time domwatcher is not initialized, so pagesump will not be sent
                        // that is why retrying here 
                        if (CAVNV.sid)
                            CAVNV.send_dom(false, 0, me.getDOM(false), false);
                    }
                }

                plugin_loaded = true;
                plugin_initialized = true;
                //start the idle timer on page_ready.
                CAVNV.subscribe('page_ready', function () { initObserver(); }, null, null);
                CAVNV.subscribe('page_unload', function () { if (nvObserver) nvObserver.send(true) }, null, null);
                return this;
            },
            is_complete: function () {
                return plugin_loaded;
            },
            flush: function () {
                CAVNV.log("Netvision, DOMWATCHER2: flush() called");
                if (nvObserver)
                    nvObserver.send(true);
            },
            stop: function () {
                if (nvObserver) {
                    nvObserver.disconnect();
                    nvObserver = null;
                }
            },
            restart: function () {
                CAVNV.log('Netvision, DOMWATCHER2: restart() called');
                if (!plugin_initialized) {
                    this.init();
                }
                else {
                    if (nvObserver) {
                        nvObserver.disconnect();
                        nvObserver.clearQ();
                        nvObserver = null;
                    }
                    var list = [], pageid;
                    for (var x = 0; x < config.filterElement.length; x++) {
                        pageid = config.filterElement[x].pageid || -1;
                        if (CAVNV.utils.pagePresentInList(pageid))
                            list.push(config.filterElement[x]);
                    }
                    //set encypted element.
                    if (CAVNV.config.encryptedElement) {
                        CAVNV.encryptedElement = CAVNV.config.encryptedElement.filter(function (elem) {
                            pageid = elem.pageid || -1;
                            if (CAVNV.utils.pagePresentInList(pageid))
                                return elem;
                        });
                    }
                    nvObserver = new NVDOMObserver(h.document, list);
                    //Take the dom at the point itself and send for compression. 
                    if (CAVNV.retryPDWithIDB)
                        CAVNV.send_dom(false, 0, this.getDOM(false), true);
                    try {
                        CAVUA.updateConfig();
                    }
                    catch (e) { }
                }
            },
            getDOM: function (update, diff) {
                if (nvObserver) {
                    var domData = nvObserver.getDOM(update, diff);
                    if (!!CAVNV.window.NBridge) {
                        domData[0].type = 'webview';
                        domData[0].position = { 'top': CAVNV.webViewTop, 'left': CAVNV.webViewLeft, 'height': CAVNV.webViewHeight, 'width': CAVNV.webViewWidth };
                    }
                    return JSON.stringify(domData);
                }
                return null;
            },
            //Initiator can be ua, or xhr.
            updateMutationState: function (mutationInitiator) {
                mutationState.type = mutationInitiator;
                mutationState.state = ana.EXPECTED_MUTATION;
                mutationState.time = new Date().getTime();
                //stop the timer and        
                if (idleTimer != -1) {
                    clearTimeout(idleTimer);
                    idleTimer = -1;
                }
                idleTimer = setTimeout(function () {
                    mutationState.state = ana.UNEXPECTED_MUTATION;
                    mutationState.type = ana.NA;
                }, config.idleTime);
            },
            getMutationState: function () {
                return mutationState;
            },
            getConfig: function () {
                return config;
            },
            getID: function (node) {
                if (nvObserver) return nvObserver.getID(node);
                return -1;
            },
            getNode: function (id) {
                if (nvObserver) return nvObserver.getNode(id);
                return null;
            },
            pushNodeRecord: function (rec) {

                if (nvObserver) {
                    nvObserver.queue.push(rec);
                    return true;
                } else
                    return false;
            }
        }
    }(CAVNV.window));

    /*******************CALLBACK DESIGN *********************************/
    function isVisible(selector) {
        try {
            var x = CAVNV.window.document.querySelector(selector);
            if (!x) return false;
            if (window.getComputedStyle(x).visibility === "visible") return true;

        } catch (e) {
            CAVNV.error("error in Selector" + e);
            return false;
        }
    }


    function checkDomSelector(selector) {
        try {
            var x = CAVNV.window.document.querySelector(selector);
            if (x) return true;
        } catch (e) {
            CAVNV.error("error in checkDomSelector" + e);
            return false;
        }
        return false;
    }
    (function (window, document) {
        var cbMap = {};
        // match selector function.
        var msFn = (function () {
            var proto = document.createElement('div');
            return "function" == typeof proto.webkitMatchesSelector ? "webkitMatchesSelector" :
                "function" == typeof proto.mozMatchesSelector ? "mozMatchesSelector" :
                    "function" == typeof proto.msMatchesSelector ? "msMatchesSelector" : null
        })();

        //Triggers.

        function clickRfn() {
            document.addEventListener('click', handlersState['CLICK'][4], true);
            return true;
        }

        function clickURFn() {
            document.removeEventListener('click', handlersState['CLICK'][4], true);
        }

        function clickH(event) {
            var target = event.target;
            // match target. 
            var es = handlersState['CLICK'][1];
            var prevLength = es.length;
            for (var i = 0; i < es.length; i++) {
                // match selector. 
                if (target[msFn](es[i][1].domSelector)) {
                    es[i][0].triggered(es[i][1], target);
                    if (prevLength != es.length) i--;
                }
            }
        }

        function changeRFn() {
            document.addEventListener('change', handlersState['INPUT_CHANGE'][4]);
            return true;
        }

        function changeURFn() {
            document.removeEventListener('change', handlersState['INPUT_CHANGE'][4]);
        }

        // TODO: optimize it. 
        function changeH(event) {
            var target = event.target;
            // match target. 
            var es = handlersState['INPUT_CHANGE'][1];
            var prevLength = es.length;
            for (var i = 0; i < es.length; i++) {
                // match selector. 
                if (target[msFn](es[i][1].domSelector)) {
                    es[i][0].triggered(es[i][1], target);
                    if (prevLength != es.length) i--;
                }
            }
        }

        function hashRFn() {
            window.addEventListener('hashchange', handlersState['HASHCHANGE'][4]);
            return true;
        }

        function hashURFn() {
            window.removeEventListener('hashchange', handlersState['HASHCHANGE'][4]);
        }

        function hashH(event) {
            var target = {
                oldURL: event.oldURL,
                newURL: event.newURL
            };
            // In this case no need to search for selector so need to call all the callback. 
            var es = handlersState['HASHCHANGE'][1];
            var prevLength = es.length;
            for (var i = 0; i < es.length; i++) {
                es[i][0].triggered(es[i][1], target);
                if (prevLength != es.length) i--;
            }
        }

        function timeoutRFn() {
            // Check the last entry in array and start new timer. 
            var arr = handlersState['TimeOut'][1];
            var entry = arr[arr.length - 1];

            function handler() {
                //remove entry from handlerState array. 
                var arr2 = handlersState['TimeOut'][1];
                var found = false;
                for (var j = 0; j < arr2.length; j++) {
                    if (arr2[j][0] == entry[0] && arr2[j][1] == entry[1]) {
                        // Check if entry is there. then first call the callback and reset the timer
                        arr2[j][0].triggered(arr2[j][1]);
                        found = true;
                        break;
                    }
                }


                // check if this entry still exist i.e. after executing trigger. 
                if (found) {
                    for (var j = 0; j < arr2.length; j++) {
                        if (arr2[j][0] == entry[0] && arr2[j][1] == entry[1]) {
                            if (!arr2[j][2])
                                arr2[j][2] = setTimeout(handler, parseInt(arr2[j][1].timeOut));
                            break;
                        }
                    }
                }
            }

            // set the timer. 
            entry[2] = setTimeout(handler, parseInt(entry[1].timeOut));
            return false;
        }

        function timeoutURFn() {
            //Nothing needed here. 
        }

        function timeoutH() {
            // Nothing needed here. 
        }

        function isVisible(selector) {
            var e = CAVNV.window.document.querySelector(selector);
            if (!e) return false;

            // check parent offset. 
            //FIXME: it will only work if there is no element with position is not fixed.
            return !!e.offsetParent;
        }

        function visChangeRFn() {

            var arr = handlersState['VISIBILITY_CHANGE'][1];
            var entry = arr[arr.length - 1];
            // set current status.
            var lastVisStatus = isVisible(entry[1].domSelector);

            //FIXME: Handle timeout. 
            function handler() {
                var visStatus = isVisible(entry[1].domSelector);

                if (visStatus != lastVisStatus) {
                    lastVisStatus = visStatus;

                    //stop timer. 
                    clearInterval(entry[2]);
                    // trigger the trigger. 
                    entry[0].triggered(entry[1], lastVisStatus);
                } else {
                    return;
                }

                // Check if entry is already there then register it again. 
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i][0] == entry[0] && arr[i][1] == entry[1]) {
                        entry = arr[i];
                        entry[2] = setInterval(handler, 100);
                        break;
                    }
                }
            }

            entry[2] = setInterval(handler, 100);

            return false;
        }

        function visChangeURFn() {
            // nothing needed here. 
        }

        function visChangeH() {
            // nothing needed her. 
        }

        function getText(selector) {
            var e = document.querySelector(selector);
            if (e) {
                return e.textContent;
            }
            return null;
        }

        function conChangeRFn() {

            var arr = handlersState['CONTENT_CHANGE'][1];
            var entry = arr[arr.length - 1];
            // set current status.
            var lastText = getText(entry[1].domSelector);

            //FIXME: Handle timeout. 
            function handler() {
                var text = getText(entry[1].domSelector);

                if (text != lastText) {
                    lastText = text;

                    //stop timer. 
                    clearInterval(entry[2]);
                    // trigger the trigger. 
                    entry[0].triggered(entry[1], document.querySelector(entry[1].domSelector));
                } else {
                    return;
                }

                // Check if entry is already there then register it again. 
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i][0] == entry[0] && arr[i][1] == entry[1]) {
                        entry = arr[i];
                        entry[2] = setInterval(handler, 100);
                        break;
                    }
                }
            }

            entry[2] = setInterval(handler, 100);

            return false;
        }

        function conChangeURFn() {
            // nothing needed here. 
        }

        function conChangeH() {
            // nothing needed her. 
        }

        var xhrClient = null;
        var conf = {
            captureCrossDomain: false
        }
        function initXHR() {
            if (xhrClient !== null) return;
            try {
                xhrClient = new XMLProfiler(conf, window, document);
                if (!xhrClient && !xhrClient.xmlp) xhrClient = null;
            } catch (e) { }

            // register the callback.
            xhrClient.addEventListener('ajaxComplete', handlersState['XHR_COMPLETE'][4]);
            xhrClient.addEventListener('ajaxError', handlersState['XHR_FAILED'][4]);
        }


        function distroryXHR() {
            if (!handlersState['XHR_COMPLETE'][1] && !handlersState['XHR_FAILED']) {
                xhrClient.xmlp.removeClient(xhrClient);
                xhrClient = null;
            }
        }

        function comparePath(url, pattern) {
            // TODO: fix me. It should 
            if (typeof pattern === 'string') {
                if (pattern.charAt(0) == '/')
                    pattern = pattern.replace(/^\//, '').replace(/\/$/, '');
                try {
                    pattern = new RegExp(pattern);
                } catch (e) {
                    return false;
                }
            }

            return pattern.test(url.pathname);
        }

        function xhrHandler(xhr, type) {
            // check for urlPattern.
            var url = XMLProfiler.getURL(xhr.__nv.url);
            var list = handlersState[type][1];
            var prevLength = list.length;
            for (var i = 0; i < list.length; i++) {
                // compare the path.
                if (comparePath(url, list[i][1].urlPattern)) {
                    try {
                        xhr.__nv.req_url = url;
                        list[i][0].triggered(list[i][1], xhr.__nv);
                        if (prevLength != list.length) i--;
                    } catch (e) { }
                }
            }
        }

        function cpFailH(cbName) {
            var list = handlersState['CHECKPOINT'][1];
            var prevLength = list.length;
            for (var i = 0; i < list.length; i++) {
                if (cbName == list[i][1].checkpoint) {
                    list[i][0].triggered(list[i][1], cbName);
                    if (prevLength != list.length) i--;
                }
            }
        }

        function xhrCompRFn() {
            initXHR();
            return true;
        }

        function xhrCompURFn() {
            // Check if nothing is pending then clear it.
            distroryXHR();
        }

        function xhrCompH(xhr) {
            xhrHandler(xhr, 'XHR_COMPLETE');
        }

        function xhrFailRFn() {
            initXHR();
            return true;
        }

        function xhrFailURFn() {
            distroryXHR();
        }

        function xhrFailH(xhr) {
            xhrHandler(xhr, 'XHR_FAILED');
        }

        function cpFailURFn() {
            //TODO
        }

        function cpFailRFn(cp) {
            return true;
        }

        // it will keep isActive, currentActiveState, registerFn, unregisterFn and change Fn. 
        var handlersState = {
            "CLICK": [false, [], clickRfn, clickURFn, clickH],
            "INPUT_CHANGE": [false, [], changeRFn, changeURFn, changeH],
            "HASHCHANGE": [false, [], hashRFn, hashURFn, hashH],
            "TimeOut": [false, [], timeoutRFn, timeoutURFn, timeoutH],
            "VISIBILITY_CHANGE": [false, [], visChangeRFn, visChangeURFn, visChangeH],
            "CONTENT_CHANGE": [false, [], conChangeRFn, conChangeURFn, conChangeH],
            "XHR_COMPLETE": [false, [], xhrCompRFn, xhrCompURFn, xhrCompH],
            "XHR_FAILED": [false, [], xhrFailRFn, xhrFailURFn, xhrFailH],
            "CHECKPOINT": [false, [], cpFailRFn, cpFailURFn, cpFailH]
        }

        function registerTrigger(type, callback, trigger) {
            handlersState[type][1].push([callback, trigger]);

            // check if not enable yet then do it. 
            // Triggeres which need to be configured specific to each entry will return false and other will returnr true. 
            if (!handlersState[type][0]) {
                handlersState[type][0] = handlersState[type][2]();
            }
        }

        function unregisterTrigger(type, callback, trigger) {
            // search for the entry and remove. 
            var entries = handlersState[type][1];
            for (var i = 0; i < entries.length; i++) {
                if (entries[i][0] === callback && entries[i][1] === trigger) {
                    entries.splice(i, 1);
                    break;
                }
            }

            // check if all entries removed. 
            if (!handlersState[type][1].length) {
                //remove listener. 
                handlersState[type][3]();
                handlersState[type][0] = false;
            }
        }

        // XHR Success 

        // XHR Fail 



        function getValueFromObj(obj, path) {
            //split path. 
            if (!obj) return null;

            var h = path.split('.');
            for (var i = 0; i < h.length; i++) {
                if (!obj) return null;
                obj = obj[h[i]];
            }

            return obj;
        }

        //Data points. 
        function getDPValueFromElement(obj) {
            //get element.
            // TODO: Handling for scaler and vector.
            var ele = document.querySelector(obj.cssSelector);

            if (ele) {
                // check property.
                switch (obj.property) {
                    case 'value':
                        return ele.value;
                    case 'self':
                        return ele;
                    case 'text':
                        return ele.textContent;
                    case 'class':
                        return ele.className;
                    case 'attribute':
                        // check which property.
                        return ele.getAttribute(obj.attributeName);
                    case 'style':
                        // check for style.
                        return getValueFromObj(ele["style"], obj.elementStyle);
                    // TODO: Check visibility.       
                }
            }
        }

        function getRegexValue(str, reg, index) {
            if (typeof str !== 'string') return str;
            if (typeof reg === 'string') {
                if (reg.charAt(0) == '/')
                    reg = reg.replace(/^\//, '').replace(/\/$/, '');

                try {
                    reg = new RegExp(reg);
                } catch (e) {
                    // TODO: error handling. 
                    if (CAVNV.log_level) {
                        CAVNV.error('getRegexValue failed. Error - ' + e);
                    }
                    return null;
                }
            }

            var m = str.match(reg);
            if (m.length) {
                if (!isNaN(index)) return m[index];
                if (index === 'First') return m[0];
                if (index === 'Last') return m[m.length - 1];
            }

            return null;
        }


        function Callback(callback) {
            this.runAt = callback.runAt;
            this.name = callback.callbackId;
            this.data = callback.data;
            // this will be used for debugging. 
            this.path = 's:start';
            this.curState = 'start';
            // These will be populated at runtime. 
            this.dataPoints = {};
            this.localVars = {};
            // state, trigger map.
            this.stMap = {};
            this.triggerData = null;
            // populate trigger Map.
            var ts = this.data.triggers;
            for (var i = 0; i < ts.length; i++) {
                this.stMap[ts[i].stateId] = this.stMap[ts[i].stateId] || [];
                //this.stMap[ts[i].stateId].push({"id":ts[i].id,"type":ts[i].type});
                this.stMap[ts[i].stateId].push(ts[i]);
            }

            // make actionMap too. 
            this.taMap = {};
            var as = this.data.actions;
            for (var i = 0; i < as.length; i++) {
                this.taMap[as[i].triggerId] = this.taMap[as[i].triggerId] || [];
                this.taMap[as[i].triggerId].push(as[i]);
            }
        }

        Callback.prototype.init = function () {
            // Make entry in cbMap.
            cbMap[this.name || this.callbackId] = this;
            // register trigger of state - start.
            var ts = this.stMap['start'];
            for (var i = 0; i < ts.length; i++) {
                registerTrigger(ts[i].type, this, ts[i]);
            }
        }

        Callback.prototype.triggered = function (trigger, data) {
            this.path += '|t:' + trigger.id + '(' + trigger.type + (trigger.checkpoint ? (' - ' + trigger.checkpoint) : '') + ')';
            this.triggerData = data;

            //refresh data points. 
            this.refreshDataPoints();

            var lastState = this.curState;
            // check for action.    
            this.executeAction(this.taMap[trigger.id][0]);
            //return if page instance changes in between the callback execution
            var cb = CAVNV.config.callbacks || [];
            for (var i = 0; i < cb.length; i++) {
                if (cb[i].callbackId == this.name && cb[i].terminated) {
                    cb[i].terminated = false;
                    return;
                }
            }

            // check if state change then remove previous trigger and add new trigger. 
            if (this.curState != lastState) {
                //remove all the triggers. 
                var ts = this.stMap[lastState];
                for (var i = 0; i < ts.length; i++) {
                    unregisterTrigger(ts[i].type, this, ts[i]);
                }

                if (this.curState != 'end') {
                    var ts = this.stMap[this.curState];
                    for (var i = 0; i < ts.length; i++) {
                        registerTrigger(ts[i].type, this, ts[i]);
                    }
                }
            }
            this.path += '|s:' + this.curState;
            //FIXME: How to free callback.
            //TODO: Check if we need to remove from cbMap.
            //if (this.curState === 'end') {
            //}
        }

        Callback.prototype.refreshDataPoints = function () {
            function isPrimitive(data) { return !(Array.isArray(data) || (data === Object(data))); }

            var dp = this.data.dataPoints;
            var value;
            var dpVal = "";
            for (var i = 0; i < dp.length; i++) {
                value = null;
                switch (dp[i].source) {
                    case 'ele':
                        value = getDPValueFromElement(dp[i]);
                        break;
                    case 'url':
                        value = document.location[dp[i].urlProperty];
                        break;
                    case 'cookie':
                        value = CAVNV.utils.getCookie(dp[i].cookieName);
                        break;
                    case 'code':
                        try {
                            value = CAVNV.utils.eval_jsstring(dp[i].code);
                        } catch (e) {
                            if (CAVNV.log_level) {
                                CAVNV.info('Failed to get data point value, exception - ' + e);
                            }
                        }
                }

                // check for pattern.
                if (dp[i].pattern) {
                    value = getRegexValue(value, dp[i].pattern, (!isNaN(dp[i].index) && dp[i].index != "") ? dp[i].index : dp[i].patternIndex);
                }

                this.dataPoints[dp[i].name] = value;
                if (value == null) value = "null";
                if (value == undefined) value = "undefined";
                if (value == true) value = "true";
                if (value == false) value = "false";


                if (value && isPrimitive(value) && value.length < 65)
                    dpVal += dp[i].name + "=" + value;
            }

            //limit of 1024*2
            var r = parseInt(Math.random() * 100);
            var filter = false;
            var pct = CAVNV.config.CB ? CAVNV.config.CB.pct : 100;
            if (!isNaN(pct) && ((pct && r > pct) || pct == 0)) filter = true;
            this.path += '|dp:' + (((!filter || CAVNV.log_level) && dpVal.length < 2048) ? dpVal : "");
        }

        //helping method to get next action. 
        function getNextAction(action, src, edgeValue) {
            var edges = action.data.edges;
            var dst;

            for (var i = 0; i < edges.length; i++) {
                if (edges[i].source === src && (!edgeValue || edges[i].data.label == edgeValue)) {
                    dst = edges[i].target;

                    // no more action.
                    if (dst === 'end') return null;

                    //TODO: what if dst is 'start'. ??

                    //now search action with this target. 
                    var list = dst.indexOf('api') === 0 ? action.data.aNOdes : action.data.cNodes;
                    for (var j = 0; j < list.length; j++) {
                        if (list[j].id === dst)
                            return list[j];
                    }

                    break;
                }
            }
            return null;
        }

        //this function is just for handling system element data points.
        //eg varname = "$Element.attributes['style']
        Callback.prototype.getElemInfo = function (varName) {
            if (varName.indexOf('[') != -1) {
                var k = varName.substring(varName.indexOf('.') + 1, varName.indexOf('['));
                var s = '\\$\\$Element.' + k + "|\\['|'\\]";
                var r = new RegExp(s);
                var r1 = new RegExp(r.source, r.flags + 'g'); //for global match
                var i = varName.replace(r1, '');
                if (k == "attributes") return this.triggerData.getAttribute(i);
                return this.triggerData[k][i];
            }
            if (varName.indexOf('self') != -1) return this.triggerData;
            return this.triggerData[varName.replace('$$Element.', '')];
        }

        // TODO: DP will start as @DP. 
        // Local variable will start as @Local.
        // Other variables will be like this only. 
        // TODO: handling for other type.
        Callback.prototype.getValue = function (varName) {
            if (!varName.indexOf('@DP.')) {
                return this.dataPoints[varName.replace('@DP.', '')];
            } else if (!varName.indexOf('@Local.')) {
                return this.localVars[varName]; //keeping varname as @Local.varname to fetch its value too
            } else if (!varName.indexOf('$$XHR')) {
                if (!varName.indexOf('$$XHR.url')) {
                    var r = this.triggerData.url ? this.triggerData["req_url"][varName.replace('$$XHR.url.', '')]
                        : "";
                    return r;
                }
                else
                    return this.triggerData[varName.replace('$$XHR.', '')];
            } else if (!varName.indexOf('$$Element')) {
                return this.getElemInfo(varName);
            } else {
                return varName;
            }
        }

        Callback.prototype.executeApi = function (apiObj) {
            // handling for some special apis. 
            var api = apiObj.data.api.api;
            var argument = apiObj.data.argument;
            // TODO: Validation of arguments.
            switch (api) {
                case 'CAVNV.sb.gotoState':
                    this.curState = argument['stateName'];
                    break;

                case 'CAVNV.sb.assign':
                    this.localVars[argument['varName']] = this.getValue(argument['value']);
                    break;

                case 'CAVNV.sb.increment':
                    var by = this.getValue(argument['by']);
                    if (!isNaN(by) && !isNaN(this.localVars[argument['varName']])) {
                        this.localVars[argument['varName']] = parseInt(this.localVars[argument['varName']]) + parseInt(by);
                    }
                    break;

                case 'CAVNV.sb.decrement':
                    var by = this.getValue(argument['by']);
                    if (!isNaN(by) && !isNaN(this.localVars[argument['varName']])) {
                        this.localVars[argument['varName']] = parseInt(this.localVars[argument['varName']]) - parseInt(by);
                    }
                    break;
                case 'CAVNV.sb.trim':
                    this.localVars[argument['varName']] = this.getValue(argument['varName']).toString().trim();
                    break;
                case 'CAVNV.sb.replace':
                    if (argument.newVal.indexOf("\"\"") != -1) argument['newVal'] = "";
                    this.localVars[argument['varName']] = this.getValue(argument['varName']).toString().replace(argument['searchVal'], argument['newVal']);
                    break;
                case 'code':
                    try {
                        var value = CAVNV.utils.eval_jsstring(argument.code);
                    } catch (e) {
                        if (CAVNV.log_level) {
                            CAVNV.info('Failed to get data point value, exception - ' + e);
                        }
                    }
                    break;
                default:
                    try {
                        var fn = getValueFromObj(window, api);
                        if (!fn) throw new Error('Invalid api - ' + api);

                        var args = [];
                        var argsMd = apiObj.data.api.arguments;
                        for (var z = 0; z < argsMd.length; z++) {
                            // TODO: handling for type. 
                            args.push(this.getValue(argument[argsMd[z].name]));
                        }

                        fn.apply(window, args);

                    } catch (e) {
                        if (CAVNV.log_level) {
                            CAVNV.error('Failed to execute api - ' + api + ', error - ' + e);
                        }
                    }

            }
        }

        Callback.prototype.executeCondition = function (cond) {
            var lhs = this.getValue(cond.data.lhs);
            var rhs = this.getValue(cond.data.rhs);
            if (rhs == "null") rhs = null;
            if (rhs == "undefined") rhs = undefined;
            if (rhs == "true") rhs = true;
            if (rhs == "false") rhs = false;

            var lhsN = isNaN(lhs) ? lhs : parseFloat(lhs);
            var rhsN = isNaN(rhs) ? rhs : parseFloat(rhs);
            var op = cond.data.operator.value;

            switch (op) {
                case 'IS_EQUAL':
                    return lhsN == rhsN;
                case 'IS_NOT_EQUAL':
                    return lhsN != rhsN;
                case 'LESS_THAN':
                    return lhsN < rhsN;
                case 'LESS_THAN_EQUAL':
                    return lhsN <= rhsN;
                case 'GREATER_THAN':
                    return lhsN > rhsN;
                case 'GREATER_THAN_EQUAL':
                    return lhsN >= rhsN;
                case 'CONTAIN_STRING':
                    return rhs && lhs.toUpperCase().indexOf(rhs.toUpperCase()) != -1;
                case 'CONTAIN_STRING_CASE':
                    return lhs.indexOf(rhs) != -1;
                default:
                    throw new Error('Invalid Operator');
            }
        }

        Callback.prototype.executeAction = function (action) {
            this.path += '|a:' + action.id;
            //serach for first action. 
            var nextAction = getNextAction(action, 'start');
            while (nextAction) {
                if (nextAction.data.api) {
                    this.path += '|api:' + nextAction.data.api.api;
                    this.executeApi(nextAction);
                    nextAction = getNextAction(action, nextAction.id);
                } else {
                    this.path += '|c:(' + nextAction.data.lhs + nextAction.data.operator.value + nextAction.data.rhs + ')';
                    var result = this.executeCondition(nextAction);
                    this.path += ':' + result;
                    nextAction = getNextAction(action, nextAction.id, result ? 'yes' : 'no');

                }
            }

            // Check for 
        }



        var started = false;
        function reset() {
            //remove all triggers. 
            for (i in handlersState) {
                if (handlersState[i].length) {
                    handlersState[i][0] = false;
                    handlersState[i][1] = [];
                    // run remove handler.
                    handlersState[i][3]();
                }
            }
            //terminate all the callbacks
            var cbs = CAVNV.config.callbacks || [];
            for (var i = 0; i < cbs.length; i++) {
                cbs[i].terminated = true;
            }

            //reset cbMap
            cbMap = {};
        }

        function genHandler(callback) {
            return function () {
                var cb = new Callback(callback);
                cb.init();
            }
        }

        // load the callbacks.
        function load() {
            var cbs = CAVNV.config.callbacks || [];
            for (var i = 0; i < cbs.length; i++) {
                switch (cbs[i].runAt) {
                    case 'agent_init':
                        if (CAVNV.utils.pagePresentInList(cbs[i].pi)) {
                            var cb = new Callback(cbs[i]);
                            cb.init();
                        }
                        break;
                    case 'page_ready':
                        window.cav_nv_pg_ready_cb(genHandler(cbs[i]), cbs[i].pi);
                        break;
                    case 'page_unload':
                        window.cav_nv_pg_unload_cb(genHandler(cbs[i]), cbs[i].pi);
                        break;
                    case 'after_beacon':
                        window.cav_nv_after_beacon_cb(genHandler(cbs[i]), cbs[i].pi);
                }
            }
        }

        /*CAVNV Plugin */
        CAVNV.plugins.CB = {
            init: function () {
                if (started) return;

                load();

                // register only once. 
                started = true;

                var flushPath = function () {
                    var cbs = cbMap;
                    var k = Object.keys(cbs);
                    for (var i = 0; i < k.length; i++) {
                        //FIXME: can we make a string and log it once? 
                        //currently have to do row wise because of missing page level info
                        var cbData = (new Date().getTime()) + "|-1|-11|" + cbs[k[i]].name + "|||||||||" + cbs[k[i]].path.replace(/\|/g, ';') + "||||||";
                        CAVUA.logEvent(cbData, false, 4);
                    }
                    cbMap = {};//reset it
                }
                CAVNV.subscribe('page_unload', function () { flushPath(); }, null, null);
            },
            is_complete: function () {
                return true;
            },
            restart: function () {
                reset();
            },
            getCBMap: function () {
                return cbMap;
            },
            cpFailH: function (e) {
                return cpFailH(e);
            }

        }

    })(CAVNV.window, CAVNV.window.document);
    /*******************CALLBACK DESIGN *********************************/


    /********************Checkpoint***************/
    (function (h) {

        /*Checkpoint entry.
         {
           name: <name of checkpoint>,
           event: <event name>,
           pages: <comma seperated pages. for all -1>,
           scope: <scope of checkpoint>,
           url: <url of checkpoint>,
           urlregex: <url regular expression of checkpoint>,
           selector: <css selector of that elemnt>
           fail: <found/not found>,
           mode: <specific text/lb - rb> 
           arg1: {text: <text>, regex: <true/false>, ic: <true/false>},
           //Note: arg2 is optional.
           arg2: {text: <text>, regex: <true/false>, ic: <true/false>},
           matching_length: <length of content between lb and rb>,
           matching_text: <content between lb and rb>
         }
        */
        /*
         This method will return object of CP. 
         {
           name: 
         }
        */
        //Constants:
        var CP_IGNORE = -1,
            CP_FOUND = 0x0,
            CP_NOTFOUND = 0x1,
            //Mask of all content validation related flags.
            /***Mask Start*****/
            CP_CONTENT_VALIDATION = 0x0FF0,
            CP_CONTENT_LENGTH_VALIDATION = 0x00F0,
            CP_CONTENT_VALUE_VALIDATION = 0x0F00,
            /********Mask End******/

            CP_CONTENT_LENGTH_LESS_THAN_EQUAL = 0x10,
            CP_CONTENT_LENGTH_EQUAL = 0x20,
            CP_CONTENT_LENGTH_GREATER_THAN_EQUAL = 0x40,
            CP_CONTENT_EQUAL = 0x0100,
            CP_CONTENT_NOT_EQUAL = 0x0200,
            CP_CONTENT_SUBSTR = 0x0400,
            /* operators for json path*/
            NOT_CONTAINING_STRING = 0x1000,
            CP_CONTENT_MATCH_REGEX = 0x2000,
            CP_CONTENT_NOT_MATCHING_REGEX = 0x4000,
            CP_CONTENT_LENGTH_GREATER_THAN = 0x10000,
            CP_CONTENT_LENGTH_NOT_EQUAL = 0x20000,
            CP_CONTENT_LENGTH_LESS_THAN = 0x40000,
            CP_HAS_MEMBER_MORE_THAN = 0x100000,
            CP_HAS_MEMBER_MORE_THAN_EQUAL = 0x200000,
            CP_HAS_MEMBER_LESS_THAN = 0x400000,
            CP_HAS_MEMBER_LESS_THAN_EQUAL = 0x1000000,

            CP_SEARCH_SPECIFIC_TEXT = 1,
            CP_SEARCH_LB_RB = 2,
            CP_SEARCH_JSON_PATH = 3,

            CP_SCOPE_PAGE = 0,
            CP_SCOPE_MUTATION = 1,
            CP_SCOPE_ALL = 99,

            //xhr scope
            CP_SCOPE_XHR_RESPONSE = 2,
            CP_SCOPE_XHR_HEADER = 3,
            CP_SCOPE_XHR_ALL = 4;


        function parseCP(cpentry) {
            function parseArg(arg) {

                if (!arg.text && !arg.path) return null;
                arg.ic = arg.ic || false;
                var narg = {};
                narg.ic = arg.ic;
                if (arg.path) narg.path = arg.path;
                else if (arg.regex) {
                    try {
                        narg.regex = new RegExp(arg.text, ((arg.ic == true) ? 'i' : ''));
                    }
                    catch (e) {
                        CAVNV.error("Invalid Regex given checkpoint - " + cpentry.name);
                        narg.text = arg.text;
                        if (narg.ic) narg.text = narg.text.toUpperCase();
                    }
                }
                else {
                    narg.text = arg.text;
                    if (narg.ic) narg.text = narg.text.toUpperCase();
                }
                return narg;
            }
            //removing mode as it is a part of rules now
            if (!cpentry.name || !cpentry.pages || !cpentry.event) return null;
            //check if entry is valid for current page. 
            if (!cpentry.pages.split(',').some(function (p) { return (p.trim() == -1 || p.trim() == CAVNV.pageIndex) }))
                return null;
            var cp = {};
            //check for 
            cp.name = cpentry.name;
            cp.event = cpentry.event;
            cp.scope = cpentry.scope || CP_SCOPE_PAGE;
            cp.rules = cpentry.rules;
            cp.prevState = false;
            if (cpentry.hasOwnProperty("match")) cp.match = cpentry.match;
            //url or urlregex
            if (cpentry.scope == CP_SCOPE_XHR_ALL || cpentry.scope == CP_SCOPE_XHR_RESPONSE || cpentry.scope == CP_SCOPE_XHR_HEADER) {
                // set url/urlregex 
                cp.url = cpentry.url;
                cp.urlregex = cpentry.urlregex;

                if (!cp.url && !cp.urlregex && cpentry.selector) {
                    try {
                        cp.urlregex = new RegExp(cpentry.selector);
                    } catch (e) {
                        cp.url = cpentry.selector;
                    }
                }

                if (!cp.url && !cp.urlregex) {
                    CAVNV.error("required arguments missing,  checkpoint - " + cpentry.name);
                    return null;
                }
            }
            else {
                //if selector is not present in that case we will take document as selector and scope will be page only.
                if (!cpentry.selector)
                    cp.scope = CP_SCOPE_PAGE;
                else {
                    //TODO: validate selector.
                    cp.selector = cpentry.selector;
                }
            }
            cp.fail = cpentry.fail || CP_FOUND;
            cp.mode = cpentry.mode;
            //Note: if both the arguments are null in that case we will raise the event if the selector is present.
            if (cpentry.arg1)
                cp.arg1 = parseArg(cpentry.arg1);
            if (cpentry.arg2)
                cp.arg2 = parseArg(cpentry.arg2);

            //new format
            if (cpentry.rules && cpentry.rules.length) {
                for (var k = 0; k < cpentry.rules.length; k++) {
                    var r = cpentry.rules[k];
                    if (r.arg1)
                        cp.rules[k].arg1 = parseArg(r.arg1);
                    if (r.arg2)
                        cp.rules[k].arg2 = parseArg(r.arg2);
                }
            }

            cp.value = cpentry.matching_length ? cpentry.matching_length : cpentry.matching_text;
            if (cpentry.hasOwnProperty("value")) cp.value = cpentry.value;
            if (cp.fail & CP_CONTENT_LENGTH_VALIDATION && !cp.value) {
                CAVNV.error("matching length missing in case of CONTENT_LENGTH_VALIDATION checkpoint - " + cp.name);
                return null;
            }
            if (cp.fail & CP_CONTENT_VALUE_VALIDATION && !cp.value) {
                CAVNV.error("matching value missing in case of CONTENT_VALUE_VALIDATION Checkpoint - " + cp.name);
                return null;
            }
            return cp;
        }

        function getMatchesSelector() {
            var proto = document.createElement("div");
            return "function" == typeof proto.webkitMatchesSelector ? "webkitMatchesSelector" : "function" == typeof proto.mozMatchesSelector ? "mozMatchesSelector" : "function" == typeof proto.msMatchesSelector ? "msMatchesSelector" : null;
        }

        function load_checkpoint() {
            config.entries.forEach(function (centry) {
                var cp = parseCP(centry);
                if (cp == null) return;
                cp.idx = checkpoints.length;
                cp.prevState = false;
                if (cp) checkpoints.push(cp);
            });
        }

        function getMatch(str, text, regex) {
            var i;
            if (text) {
                i = str.indexOf(text);
                if (i != -1)
                    return { st: i, ed: i + text.length };
            }
            else if (regex) {
                i = regex.exec(str);
                if (i != null)
                    return { st: i.index, ed: i.index + i[0].length };
            }
            return null;
        }
        //this array will return possible values between given lb, rb
        //This method will return total matches and gvf flag is given in that case it will fill matched values. 
        function searchLBRB(text, lbarg, rbarg, gvf, values) {
            if (!text) return 0;

            var LBStart = 0, RBStart = 0, RBEnd = 0;
            var count = 0, match, str, UAtext;
            //TODO: this should be done before.
            /*if(lbarg.ic || rbarg.ic)
              UAtext = text.toUpperCase();*/
            if ((lbarg && lbarg.ic) || (rbarg && rbarg.ic))
                UAtext = text.toUpperCase();


            if (!rbarg) RBStart = RBEnd = text.length;
            while (true) {
                //Note: we will apply LB Arg only if LBStart is less than RBStart.
                if ((LBStart <= RBStart) && lbarg) {
                    if (lbarg.ic)
                        str = UAtext.substr(LBStart);
                    else
                        str = text.substr(LBStart);
                    match = getMatch(str, lbarg.text, lbarg.regex);
                    if (match) {
                        LBStart += match.ed;
                    }
                    else
                        break;
                }
                if ((!lbarg || RBStart <= LBStart) && rbarg) {
                    if (rbarg.ic)
                        str = UAtext.substr(RBStart);
                    else
                        str = text.substr(RBStart);
                    match = getMatch(str, rbarg.text, rbarg.regex);
                    if (match) {
                        RBEnd += match.ed;
                        RBStart += match.st;
                    }
                    else
                        break;
                }

                //If we here then just increase counter.
                count++;
                if (gvf) {
                    if (lbarg && rbarg)
                        values.push(text.substr(LBStart, (RBStart - LBStart)));
                    else if (lbarg)
                        values.push(text.substr(LBStart));
                    else if (rbarg)
                        values.push(text.substr(0, RBStart));
                }
                RBStart = RBEnd;
            }
            return count;
        }

        function jsonPath(obj, expr, arg) {
            var P = {
                resultType: arg && arg.resultType || "VALUE",
                result: [],
                normalize: function (expr) {
                    var subx = [];
                    return expr.replace(/[\['](\??\(.*?\))[\]']|\['(.*?)'\]/g, function ($0, $1, $2) { return "[#" + (subx.push($1 || $2) - 1) + "]"; })  /* http://code.google.com/p/jsonpath/issues/detail?id=4 */
                        .replace(/'?\.'?|\['?/g, ";")
                        .replace(/;;;|;;/g, ";..;")
                        .replace(/;$|'?\]|'$/g, "")
                        .replace(/#([0-9]+)/g, function ($0, $1) { return subx[$1]; });
                },
                asPath: function (path) {
                    var x = path.split(";"), p = "$";
                    for (var i = 1, n = x.length; i < n; i++)
                        p += /^[0-9*]+$/.test(x[i]) ? ("[" + x[i] + "]") : ("['" + x[i] + "']");
                    return p;
                },
                store: function (p, v) {
                    if (p) P.result[P.result.length] = P.resultType == "PATH" ? P.asPath(p) : v;
                    return !!p;
                },
                trace: function (expr, val, path) {
                    if (expr !== "") {
                        var x = expr.split(";"), loc = x.shift();
                        x = x.join(";");
                        if (val && val.hasOwnProperty(loc))
                            P.trace(x, val[loc], path + ";" + loc);
                        else if (loc === "*")
                            P.walk(loc, x, val, path, function (m, l, x, v, p) { P.trace(m + ";" + x, v, p); });
                        else if (loc === "..") {
                            P.trace(x, val, path);
                            P.walk(loc, x, val, path, function (m, l, x, v, p) { typeof v[m] === "object" && P.trace("..;" + x, v[m], p + ";" + m); });
                        }
                        else if (/^\(.*?\)$/.test(loc)) // [(expr)]
                            P.trace(P.eval(loc, val, path.substr(path.lastIndexOf(";") + 1)) + ";" + x, val, path);
                        else if (/^\?\(.*?\)$/.test(loc)) // [?(expr)]
                            P.walk(loc, x, val, path, function (m, l, x, v, p) { if (P.eval(l.replace(/^\?\((.*?)\)$/, "$1"), v instanceof Array ? v[m] : v, m)) P.trace(m + ";" + x, v, p); }); // issue 5 resolved
                        else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) // [start:end:step]  phyton slice syntax
                            P.slice(loc, x, val, path);
                        else if (/,/.test(loc)) { // [name1,name2,...]
                            for (var s = loc.split(/'?,'?/), i = 0, n = s.length; i < n; i++)
                                P.trace(s[i] + ";" + x, val, path);
                        }
                    }
                    else
                        P.store(path, val);
                },
                walk: function (loc, expr, val, path, f) {
                    if (val instanceof Array) {
                        for (var i = 0, n = val.length; i < n; i++)
                            if (i in val)
                                f(i, loc, expr, val, path);
                    }
                    else if (typeof val === "object") {
                        for (var m in val)
                            if (val.hasOwnProperty(m))
                                f(m, loc, expr, val, path);
                    }
                },
                slice: function (loc, expr, val, path) {
                    if (val instanceof Array) {
                        var len = val.length, start = 0, end = len, step = 1;
                        loc.replace(/^(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)$/g, function ($0, $1, $2, $3) { start = parseInt($1 || start); end = parseInt($2 || end); step = parseInt($3 || step); });
                        start = (start < 0) ? Math.max(0, start + len) : Math.min(len, start);
                        end = (end < 0) ? Math.max(0, end + len) : Math.min(len, end);
                        for (var i = start; i < end; i += step)
                            P.trace(i + ";" + expr, val, path);
                    }
                },
                eval: function (x, _v, _vname) {
                    try { return $ && _v && eval(x.replace(/(^|[^\\])@/g, "$1_v").replace(/\\@/g, "@")); }  // issue 7 : resolved ..
                    catch (e) { throw new SyntaxError("jsonPath: " + e.message + ": " + x.replace(/(^|[^\\])@/g, "$1_v").replace(/\\@/g, "@")); }  // issue 7 : resolved ..
                }
            };

            var $ = obj;
            if (expr && obj && (P.resultType == "VALUE" || P.resultType == "PATH")) {
                P.trace(P.normalize(expr).replace(/^\$;?/, ""), obj, "$");  // issue 6 resolved
                return P.result.length ? P.result : false;
            }
        }
        //This method will take text and checkpoint.
        function execCheckpoint(text, cp, json_text) {
            if (cp.mode == CP_SEARCH_SPECIFIC_TEXT) {
                //Note: we already have validated regex. 
                if (cp.arg1.regex) {
                    if (cp.fail == CP_FOUND)
                        return (cp.arg1.regex.test(text));
                    else if (cp.fail == CP_NOTFOUND)
                        return !(cp.arg1.regex.test(text));
                }
                else if (cp.arg1.text) {
                    if (cp.fail == CP_FOUND) {
                        if (cp.arg1.ic)
                            return (text.toUpperCase().indexOf(cp.arg1.text.toUpperCase()) != -1);
                        else
                            return (text.indexOf(cp.arg1.text) != -1);
                    }
                    else if (cp.fail == CP_NOTFOUND) {
                        if (cp.arg1.ic)
                            return !(text.toUpperCase().indexOf(cp.arg1.text.toUpperCase()) != -1);
                        else
                            return !(text.indexOf(cp.arg1.text) != -1);
                    }
                }
            }
            else if (cp.mode == CP_SEARCH_LB_RB || (cp.mode & CP_CONTENT_VALIDATION)) {
                var matches = [];
                var count = searchLBRB(text, cp.arg1, cp.arg2, !!(cp.fail & CP_CONTENT_VALIDATION), matches);
                if (cp.mode == CP_SEARCH_LB_RB) {
                    if (cp.fail == CP_FOUND)
                        return !!count;
                    else if (cp.fail == CP_NOTFOUND)
                        return !count;
                }

                for (var z = 0; z < matches.length; z++) {
                    //TODO: should we take trim as option.
                    var value = cp.matching_length ? cp.matching_length : cp.matching_text;
                    if (cp.value) value = cp.value;
                    switch (cp.fail) {
                        case CP_CONTENT_LENGTH_LESS_THAN_EQUAL:
                            if (matches[z].trim().length <= value) return true;
                            break;
                        case CP_CONTENT_LENGTH_EQUAL:
                            if (matches[z].trim().length == value) return true;
                            break;
                        case CP_CONTENT_LENGTH_GREATER_THAN_EQUAL:
                            if (matches[z].trim().length >= value) return true;
                            break;
                        case CP_CONTENT_EQUAL:
                            if (matches[z].trim() == value) return true;
                            break;
                        case CP_CONTENT_NOT_EQUAL:
                            if (matches[z].trim() != value) return true;
                            break;
                        case CP_CONTENT_SUBSTR:
                            if (matches[z].indexOf(value) != -1) return true;
                    }
                }
            }
            else if (cp.mode == CP_SEARCH_JSON_PATH) {
                if (!json_text) return false;

                // it will return false in case of invalid jsonpath. Otherwise it will return array.
                var res = jsonPath(json_text, cp.arg1.path);

                if (res == false || res.length == 0) {
                    if (cp.fail != CP_NOTFOUND) return false;
                    else return true;
                }

                if (cp.hasOwnProperty("value")) value = cp.value;

                if (cp.fail & 0x6000) { //REGEX
                    try {
                        if (!cp.reg) {
                            if (cp.arg1.ic) cp.reg = new RegExp(value, "i");
                            else cp.reg = new RegExp(value);
                        }
                        value = cp.reg;
                    } catch (e) { return false; }
                }

                var lhs = res[0].toString();
                if (cp.fail & 0x1F00 && cp.arg1.ic) { //ignore case string
                    value = value.toUpperCase();
                    lhs = res[0].toString().toUpperCase();
                }

                // FIXME: String and length related checks should be tested on all members. Just like we did in case of CP_SEARCH_LB_RB
                // FIXME: in case of refex, need to convert value into regex. 
                switch (cp.fail) {
                    case CP_FOUND:
                        if (res.length) return true;
                        break;
                    case CP_NOTFOUND:
                        if (!(res.length)) return true;
                        break;
                    case CP_CONTENT_LENGTH_LESS_THAN_EQUAL:
                        if (res[0].toString().length <= value) return true;
                        break;
                    case CP_CONTENT_LENGTH_EQUAL:
                        if (res[0].toString().length == value) return true;
                        break;
                    case CP_CONTENT_LENGTH_GREATER_THAN_EQUAL:
                        if (res[0].toString().length >= value) return true;
                        break;
                    case CP_CONTENT_LENGTH_GREATER_THAN:
                        if (res[0].toString().length > value) return true;
                        break;
                    case CP_CONTENT_LENGTH_NOT_EQUAL:
                        if (res[0].toString().length != value) return true;
                        break;
                    case CP_CONTENT_LENGTH_LESS_THAN:
                        if (res[0].toString().length < value) return true;
                        break;
                    case CP_CONTENT_EQUAL:
                        if (lhs == value) return true;
                        break;
                    case CP_CONTENT_NOT_EQUAL:
                        if (lhs != value) return true;
                        break;
                    case CP_CONTENT_SUBSTR:
                        if (lhs.indexOf(value) != -1) return true;
                        break;
                    case NOT_CONTAINING_STRING:
                        if (lhs.indexOf(value) == -1) return true;
                        break;
                    case CP_CONTENT_MATCH_REGEX:
                        if (value.test(res[0].toString())) return true;
                        break;
                    case CP_CONTENT_NOT_MATCHING_REGEX:
                        if (!value.test(res[0].toString())) return true;
                        break;
                    case CP_HAS_MEMBER_MORE_THAN:
                        if (res.length > value) return true;
                        break;
                    case CP_HAS_MEMBER_MORE_THAN_EQUAL:
                        if (res.length >= value) return true;
                        break;
                    case CP_HAS_MEMBER_LESS_THAN:
                        if (res.length < value) return true;
                        break;
                    case CP_HAS_MEMBER_LESS_THAN_EQUAL:
                        if (res.length <= value) return true;
                        break;
                }

            }
            return false;
        }

        function fill_new_str(cq) {
            if (!cq.rules) {
                cq.rules = [];
                cq.rules[0] = {};
                if (cq.hasOwnProperty("fail")) cq.rules[0].fail = cq.fail;
                if (cq.hasOwnProperty("mode")) cq.rules[0].mode = cq.mode;
                if (cq.hasOwnProperty("arg1")) cq.rules[0].arg1 = cq.arg1;
                if (cq.hasOwnProperty("arg2")) cq.rules[0].arg2 = cq.arg2;
                cq.rules[0].value = cq.matching_length ? cq.matching_length : cq.matching_text;
                if (cq.hasOwnProperty("value")) cq.rules[0].value = cq.value;
            }
            if (!cq.hasOwnProperty("match")) cq.match = "ALL";
        }
        //target can be HTMLElement or text.
        function applyCheckpoint(target, scope) {
            var cp;

            //FIXME: currently we are not able to check if target is HTML Element.
            if (scope == CP_SCOPE_MUTATION && !(target.nodeType && target.nodeType == target.ELEMENT_NODE))
                return;

            for (var z = 0; z < checkpoints.length; z++) {
                //check for scope.
                var cq = checkpoints[z];
                var isSatisfy = false, eData = {};
                fill_new_str(cq);
                for (var a = 0; a < cq.rules.length; a++) {

                    cp = cq.rules[a];
                    if (scope == CP_SCOPE_PAGE) {
                        if (cq.scope != CP_SCOPE_PAGE && cq.scope != CP_SCOPE_ALL) continue;
                        //assumption that target will be text.
                        if (cp.arg1 || cp.arg2) {
                            if (execCheckpoint(target.textContent, cp)) {
                                if (cq.prevState == false) {
                                    isSatisfy++;
                                    eData.cp = cq.name;
                                    //CAVNV.cav_nv_log_event(cq.event, {cp: cq.name});
                                }
                            }
                        }
                        else if (cq.selector) {
                            if (target.querySelectorAll) {
                                try {
                                    var e = target.querySelectorAll(cq.selector);
                                    //check for visibility;
                                    var foundElement = null;
                                    for (var k = 0; k < e.length; k++) {
                                        //check for visibility. 
                                        if (e[k].offsetParent != null) {
                                            foundElement = e[k].offsetParent;
                                            break;
                                        }
                                    }

                                    if (foundElement && cp.fail == CP_FOUND) {
                                        //Note: we are not checking for prevState because here we doing first time. 
                                        isSatisfy++;
                                        eData.cp = cq.name;
                                        eData.attributes = CAVNV.utils.getNodeText(e[0]);
                                        //CAVNV.cav_nv_log_event(cq.event, {cp: cq.name, attributes: CAVNV.utils.getNodeText(e[0])}); 
                                    }
                                    else if (cp.fail == CP_NOTFOUND && !foundElement) {
                                        isSatisfy++;
                                        //CAVNV.cav_nv_log_event(cq.event, {cp: cq.name}); 
                                    }
                                } catch (e) { CAVNV.log("Invalid Selector"); }
                            }
                        }
                    }
                    else if (scope == CP_SCOPE_MUTATION) {
                        if (cq.scope != CP_SCOPE_MUTATION && cq.scope != CP_SCOPE_ALL) continue;
                        //check if given target is matching with selector.
                        if (target[matchesSelectorFn](cp.selector)) {
                            //check if lb or rb missing then just raise the event because we got the matching element.
                            if (!cp.arg1 && !cp.arg2) {
                                //Sending checkpoing name along with event for debugging purpose.
                                if (cq.prevState == false) {
                                    //Note: we are not sending any data in case of page level checkpoint because we can not get any meaningful data. 
                                    isSatisfy++;
                                    eData.cp = cq.name;
                                    eData.attributes = CAVNV.utils.getNodeText(target);
                                    //CAVNV.cav_nv_log_event(cq.event, {cp: cq.name, attributes: CAVNV.utils.getNodeText(target)}); 
                                }
                            }
                            else {
                                if (execCheckpoint(target.textContent, cp)) {
                                    if (cq.prevState == false) {
                                        isSatisfy++;
                                        eData.cp = cq.name;
                                        eData.data = CAVNV.utils.getNodeText(target);
                                        //CAVNV.cav_nv_log_event(cq.event, {cp: cq.name, data: CAVNV.utils.getNodeText(target)}); 
                                    }
                                }
                            }
                        }
                    }
                }
                if ((cq.match.toUpperCase() == "ANY" && isSatisfy && isSatisfy <= cq.rules.length) ||
                    (cq.match.toUpperCase() == "ALL" && isSatisfy == cq.rules.length)) {
                    CAVNV.cav_nv_log_event(cq.event, eData);
                    cq.prevState = true;
                    CAVNV.plugins.CB.cpFailH(cq.name);
                }
            }
        }

        var config = {
            entries: []
        }, checkpoints = [],
            matchesSelectorFn = null;

        CAVNV.plugins.CHECKPOINT = {
            init: function (c) {
                matchesSelectorFn = getMatchesSelector();

                //load configuration. 
                CAVNV.utils.pluginConfig(config, c, 'CHECKPOINT', Object.keys(config));

                load_checkpoint();
                //console.log("checkpoints-" + checkpoints); 

                //apply checkpoint on complete innerHTML
                //TODO: check if we need to take innerHTML or textContent.
                CAVNV.subscribe("page_ready2", function () {
                    applyCheckpoint(h.document.body, CP_SCOPE_PAGE);
                }, null, null);
            },
            is_complete: function () {
                return true;
            },
            restart: function () {
                checkpoints = [];
                //load the checkpoints again. 
                load_checkpoint();

                //apply checkpoint.
                //apply checkpoint on complete innerHTML
                //TODO: check if we need to take innerHTML or textContent.
                applyCheckpoint(h.document.body, CP_SCOPE_PAGE);
            },
            applyCheckpoint: function (target, scope) {
                applyCheckpoint(target, scope);
            },

            xhrCheckpoint: function (target, scope) {
                var cp;
                var body = null, headers = null, json_body = null;
                for (var z = 0; z < checkpoints.length; z++) {
                    //check for scope.
                    var cq = checkpoints[z];
                    var isSatisfy = 0;
                    fill_new_str(cq);
                    for (var a = 0; a < cq.rules.length; a++) {
                        cp = cq.rules[a];
                        if (cq.scope != CP_SCOPE_XHR_HEADER && cq.scope != CP_SCOPE_XHR_RESPONSE && cq.scope != CP_SCOPE_XHR_ALL)
                            continue;

                        var match = false;

                        if (cq.urlregex) {
                            if (cq.urlregex.test(target.__nv.url))
                                match = true;
                        }
                        else {
                            match = target.__nv.url.indexOf(cq.url) != -1;
                        }

                        if (!match) continue;

                        if (!cp.arg1 && !cp.arg2) continue;

                        //apply in body 
                        if (cq.scope == CP_SCOPE_XHR_ALL || cq.scope == CP_SCOPE_XHR_RESPONSE) {
                            if (body == null)
                                body = target.responseText;

                            if (json_body == null) {
                                try {
                                    json_body = JSON.parse(target.responseText)
                                } catch (e) { }
                            }

                            if (execCheckpoint(body, cp, json_body))//nvtime.url
                            {
                                if (cq.prevState == false) {
                                    isSatisfy++;
                                    //CAVNV.cav_nv_log_event(cp.event, {cp: cp.name, url: target.responseURL});
                                    //once trigger then no need to apply for headers. 
                                    //continue;
                                }
                            }
                        }

                        //apply for header. 
                        if (cq.scope == CP_SCOPE_XHR_ALL || cq.scope == CP_SCOPE_XHR_HEADER) {
                            if (headers == null) {
                                headers = target.getAllResponseHeaders();
                            }
                            if (execCheckpoint(headers, cp)) {
                                if (cq.prevState == false) {
                                    isSatisfy++;
                                    //CAVNV.cav_nv_log_event(cp.event, {cp: cp.name, url: target.responseURL});
                                }
                            }
                        }
                    }
                    if ((cq.match.toUpperCase() == "ANY" && isSatisfy && isSatisfy <= cq.rules.length) ||
                        (cq.match.toUpperCase() == "ALL" && isSatisfy == cq.rules.length)) {
                        CAVNV.cav_nv_log_event(cq.event, { cp: cq.name, url: target.__nv.url });
                        cq.prevState = true;
                        CAVNV.plugins.CB.cpFailH(cq.name);
                    }
                }
            },


            //apply sepecific checkpoint.
            //Note: need not to check element selector.
            //Note: this method will return if checkpoint is pass.
            applyCheckpoint2: function (target, scope, cp) {
                //Check for visibility.
                if (target.tagName != 'BODY' && target.offsetParent == null)
                    return;

                var isSatisfy = 0, eData = {};
                fill_new_str(cp);
                //check if lb or rb missing then just raise the event because we got the matching element.
                for (var z = 0; z < cp.rules.length; z++) {
                    var cq = cp.rules[z];
                    if (!cq.arg1 && !cq.arg2) {
                        //Sending checkpoing name along with event for debugging purpose.
                        if (cp.prevState == false) {
                            isSatisfy++;
                            eData.cp = cp.name;
                            eData.attributes = CAVNV.utils.getNodeText(target);
                            //CAVNV.cav_nv_log_event(cp.event, {cp: cp.name, attributes: CAVNV.utils.getNodeText(target)}); 
                        }
                        //return true; //KDOUBT: why return here. should be under if
                    }
                    else {
                        if (execCheckpoint(target.textContent, cq)) {
                            if (cp.prevState == false) {
                                isSatisfy++;
                                eData.cp = cp.name;
                                eData.data = CAVNV.utils.getNodeText(target);
                                //CAVNV.cav_nv_log_event(cp.event, {cp: cp.name, data: CAVNV.utils.getNodeText(target)});
                                //return true;
                            }
                        }
                    }
                }
                if ((cp.match.toUpperCase() == "ANY" && isSatisfy && isSatisfy <= cp.rules.length) ||
                    (cp.match.toUpperCase() == "ALL" && isSatisfy == cp.rules.length)) {
                    CAVNV.cav_nv_log_event(cp.event, eData);
                    cp.prevState = true;
                    CAVNV.plugins.CB.cpFailH(cp.name);
                    return true;
                }

                return false;
            },

            //This method will take {idx: <true/false>} hash as input and will reset the checpoints prevState.
            //Note: we are resetting the prev state so that we can raise the event next time. 
            resetPrevState: function (prevStateHash, cp) {
                for (var idx in prevStateHash) {
                    cp[idx].prevState = prevStateHash[idx];
                }
            },

            getCheckpoint: function () {
                return checkpoints;
            }
        }
    }(CAVNV.window));

    (function (w) {
        //sample config.
        /*
          clickMonitor: {
          enable: true,
          completeDocument: true,
          fireOnce: false,
          elements : [
            {s: "closebtn", t: "Close Button", p:"-1" , e: "event", c: "function (e) {console.log("Got the event on tag - " + e.target.tagName); cav_nv_log_event "MyFirstButton");}"} 
            ...
         ],
           ..
         ]
        }
        */

        var matchFn = (function (w) {
            var proto = w.document.createElement('div');
            return "function" == typeof proto.matches ? "matches" : "function" == typeof proto.webkitMatchesSelector ? "webkitMatchesSelector" : "function" == typeof proto.mozMatchesSelector ? "mozMatchesSelector" : "function" == typeof proto.msMatchesSelector ? "msMatchesSelector" : null;
        }(w))

        var config = {
            enabled: true,
            pageList: "-1",
            completeDocument: false,
            fireOnce: false,
            elements: []
        };


        var defaultCallback = function (e) {
            e.cav_nv_log_event(e.__event, e.__tag);
            return true;
        }

        //Note: lastEvent will store all the last event in format {e: <event>, t: <tag>}.
        var lastEvent = [];
        //Similar to this.
        var curEvent = [];

        //Note: this function will add event and tag in curEvent array to keep track of last fired event.
        //Note: this will be set into event object. User should use this method to log event.
        var log_event = function (event, tag) {
            //check this event and tag into lastEvent and if found then raise.
            for (var y = 0; y < lastEvent.length; y++) {
                if (lastEvent[y].e == event && lastEvent[y].t == tag)
                    break;
            }
            if (y == lastEvent.length)
                CAVNV.cav_nv_log_event(event, tag);
            curEvent.push({ e: event, t: tag });
        }

        var elements = [];
        function CElements(centry) {
            this.selector = centry.s;
            this.event = centry.e || "ClickEvent";
            this.tag = centry.t || "Document";
            //note callback will be in string format. we need to eval that first.
            var c = null;
            try {
                if (centry.c) {
                    var fnString = '(function(){ return ' + centry.c + ';}());';
                    //Note: we need to eval in context of main window. So it can access the current window while execution.
                    c = CAVNV.utils.eval_jsstring(fnString);
                }
            }
            catch (e) { }
            this.callback = c || defaultCallback;
        }

        function loadData() {
            var entry;
            //load elements.
            for (var z = 0; z < config.elements.length; z++) {
                entry = config.elements[z];
                if (!entry.s || !entry.p) continue;

                //check for pageIndex.
                if (CAVNV.utils.pagePresentInList(entry.p))
                    elements.push(new CElements(entry));
            }
        }

        var clickCallback = (function (w) {
            var match = true;
            function callback(e) {

                var parent, entry, eventCount;
                //check for element list.
                parent = e.target;
                eventCount = 0;
                var status = true;
                while (parent != null) {
                    for (var z = 0; z < elements.length; z++) {
                        entry = elements[z];
                        //check for selector.
                        try {
                            // if callback is set return false, then return
                            if (parent[matchFn](entry.selector)) {
                                //call the callback.
                                //set the tag and event on event object. 
                                e.__event = entry.event;
                                e.__tag = entry.tag;
                                //Note: user will call this method to log the event.
                                e.cav_nv_log_event = log_event;
                                try {
                                    status = entry.callback.call(w, e);
                                }
                                catch (e) {
                                    status = false;
                                }

                                if (status == false) {
                                    break;
                                }

                                //if useOnce is enabled then return that.
                                if (config.fireOnce) {
                                    lastEvent = curEvent;
                                    curEvent = [];
                                    return true;
                                }
                            }
                        }
                        catch (e) { }
                    }

                    parent = parent.parentElement;
                }

                if (status == true) {
                    //Check if completeDocument is enabled 
                    if (config.completeDocument) {
                        //check if useOnce was there and we already have raised the event. then don't 
                        if (curEvent.length == 0) {
                            log_event('ClickEvent', 'Document');
                        }
                    }
                }
                lastEvent = curEvent;
                curEvent = [];
                return true;
            }
            return callback;
        }(w));

        function start() {
            //load the configuration.
            loadData();

            //start event listener.
            CAVNV.utils.addListener(w.document, 'click', clickCallback, true);
        }

        function stop() {
            //remvoe the event listener.
            CAVNV.utils.removeListener(w.document, 'click', clickCallback);
            //clear the cache array.
            lastEvent = curEvent = [];
        }

        CAVNV.plugins.ClickMonitor = {
            init: function (c) {
                //Note: if matchSelect is not present then just return.
                if (!matchFn) return;

                //load configuration. 
                CAVNV.utils.pluginConfig(config, c, 'ClickMonitor', Object.keys(config));

                config.pageList = config.pageList || "-1";

                //check if current page is valid then start the plugin. 
                if (!CAVNV.utils.pagePresentInList(config.pageList))
                    return;

                start();
            },
            is_complete: function () {
                return true;
            },
            restart: function () {
                if (!matchFn) return;
                stop();

                //check if current page in pagelist then enable it for that,
                if (CAVNV.utils.pagePresentInList(config.pageList))
                    start();
            }
        }
    }(CAVNV.window));

    (function (w) {
        var queue = [];
        var config = {};
        var threshold = 10;
        var MARK = 0;
        var MEASURE = 1;
        var USERTIMING = 2;
        var TRANSACTION = 3;
        //list of running actions.
        var activeActions = [];
        //TO map actions by name. 
        var activeActionHashMap = {};
        var actionBuffer = [];

        function now() {
            return new Date().getTime();
        }

        function NVActionLap(name, data, cur_time) {
            this.name = name;
            var curT = now();
            if (cur_time && !isNaN(cur_time) && cur_time > (CAVNV.nav_start_time - 3600000) && cur_time <= now)
                this.startTime = cur_time;
            else
                this.startTime = curT;
            this.data = data;
        }

        function NVActionTiming(name, type, cur_time) {
            //Note: if now is given then it should be more then nav_start_time otherwise discard that. 
            var curT = now();
            if (cur_time && !isNaN(cur_time) && cur_time > (CAVNV.nav_start_time - 3600000) && cur_time <= curT)
                this.startTime = cur_time;
            else
                this.startTime = curT;

            this.name = name;
            this.type = type;
            //Check for empty sequence.
            var freeIdx = activeActions.length;
            for (var z = 0; z < activeActions.length; z++)
                if (!activeActions[z])
                    freeIdx = z;
            this.id = freeIdx;

            this.laps = [];
        }

        function _startAction(actionName, type, data, now) {
            var action = new NVActionTiming(actionName, type, now);

            //Make entry in hashMap.
            activeActionHashMap[actionName] = action;

            //add start time and data.
            action.laps.push(new NVActionLap("start", data, action.startTime));

            //add in activeAction list.
            activeActions[action.id] = action;

            return action.id;
        }

        function _reportAction(actionId, data) {
            var action;
            if (typeof actionId == "string")
                action = activeActionHashMap[actionId];
            else
                action = activeActions[actionId];
            if (!action) return;
            var lapid = "intermediate_" + action.laps.length; // use small strings
            action.laps.push(new NVActionLap(lapid, data));
        }

        function _cancelAction(actionId) {
            var action;
            if (typeof actionId == "string")
                action = activeActionHashMap[actionId];
            else
                action = activeActions[actionId];
            if (action) {
                delete activeActions[action.id];
                delete activeActionHashMap[action.name];
            }
        }

        function _endAction(actionId, status, data) {
            var action;
            if (typeof actionId == "string")
                action = activeActionHashMap[actionId];
            else
                action = activeActions[actionId];
            if (!action) return;
            //add end lap.
            var endTime = now();
            action.duration = endTime - action.startTime;
            action.laps.push(new NVActionLap("end", data));
            action.status = status;

            logActionTiming(action);

            //delete the entry.
            delete activeActions[action.id];
            delete activeActionHashMap[action.name];
        }

        function logActionTiming(action) {
            actionBuffer.push(action);
            flush();
            //Log resource timing.
            //FIXME: buffering should be enabled.
            if (CAVNV.uaCaptureResource)
                CAVNV.logResourceTiming(true, false, false, "-16");
        }

        function createActionTimingRecord(action) {
            var record;
            //update all the start timing from navigation start time.
            action.startTime = CAVNV.utils.nv_time(action.startTime);
            for (var l in action.laps)
                action.laps[l].startTime = CAVNV.utils.nv_time(action.laps[l].startTime);

            //make data in format
            //sid|pageid|pageinstance|channelid|timestamp|actionname|type|duration|data|ff1|ff2
            var record = CAVNV.sid + "|" + CAVNV.pageIndex + "|" + CAVNV.pageInstance + "|" + CAVNV.channel + "|" + action.startTime + "|" + action.name + "|" + action.type + "|" + action.duration + "|" + escape(JSON.stringify(action.laps)) + "|" + action.status + "|";
            return record;
        }

        function convertIntoActionTimingRecord(m, type) {
            var startTime = CAVNV.utils.nv_time((parseInt(m.startTime) - CAVNV.nav_offset) + CAVNV.nav_start_time);
            var record = CAVNV.sid + "|" + CAVNV.pageIndex + "|" + CAVNV.pageInstance + "|" + CAVNV.channel + "|" + startTime + "|" + m.name + "|" + type + "|" + m.duration + "|" + "||";
            return record;
        }

        function logMarksAndMeasures() {
            if (typeof CAVNV.window.performance == "undefined" || typeof CAVNV.window.performance.getEntriesByTypeNV == "undefined") return;

            var performance = CAVNV.window.performance;
            var marks = performance.getEntriesByTypeNV('mark');
            var record;
            for (var m in marks) {
                //convert this record into action timing format and log.
                record = convertIntoActionTimingRecord(marks[m], MARK);
                queue.push(record);
            }

            var measures = performance.getEntriesByTypeNV('measure');
            for (var m in measures) {
                record = convertIntoActionTimingRecord(measures[m], MEASURE);
                queue.push(record);
            }
        }

        function flush(force) {
            force = force || false;
            if (!CAVNV.sid)
                return;

            for (var i = 0; i < actionBuffer.length; i++) {
                var rec = createActionTimingRecord(actionBuffer[i]);
                queue.push(rec);
            }
            actionBuffer = [];
            //Check for available measurea and marks and add then in queue
            logMarksAndMeasures();

            if (queue.length == 0)
                return;

            //If number of records in queue are more than threshold or force flag is on then send this data.
            if (force == true || queue.length >= threshold) {
                //URL Format:
                var url = CAVNV.beacon_url + "?s=" + CAVNV.sid + "&p=" + CAVNV.protocolVersion + "&m=" + CAVNV.messageVersion + "&op=usertiming&pi=" + CAVNV.pageInstance + "&CavStore=" + CAVNV.store + "&d=" + CAVNV.store + "|" + CAVNV.terminal + "&pid=" + CAVNV.pageIndex + "&lts=" + CAVNV.lts + "&d2=" + (CAVNV.cav_epoch_nav_start_time * 1000);

                //send data to nv server.
                if (CAVNV.messageVersion)
                    CAVNV.utils.sendData(url, JSON.stringify(queue), "usertiming");
                else
                    CAVNV.utils.sendData(url, queue.join('\n') + "\n", "usertiming");
                queue = [];
            }
        }

        CAVNV.startAction = function (actionName, data, now) {
            return _startAction(actionName, USERTIMING, data, now);
        },

            CAVNV.reportAction = _reportAction,

            CAVNV.endAction = function (actionId, data) {
                _endAction(actionId, 0, data);
            },

            CAVNV.failedAction = function (actionId, data) {
                _endAction(actionId, 1, data);
            },

            CAVNV.cancelAction = function (actionId) {
                _cancelAction(actionId);
            },

            CAVNV.startTransaction = function (actionName, data, now) {
                return _startAction(actionName, TRANSACTION, data, now);
            },

            CAVNV.endTransaction = function (actionId, data) {
                _endAction(actionId, 0, data);
            },

            CAVNV.cancelTransaction = function (actionId) {
                _cancelAction(actionId);
            },

            CAVNV.failedTransaction = function (actionId, data) {
                _endAction(actionId, 1, data);
            },

            CAVNV.logMarksAndMeasures = logMarksAndMeasures,

            CAVNV.plugins.UserTiming = {
                init: function (c) {
                    var kw = ['queue'];

                    CAVNV.utils.pluginConfig(config, c, 'UserTiming', kw);

                    //Update threshold if given in configuration.
                    if (config.queue && config.queue.threshold && !isNaN(config.queue.threshold))
                        threshold = config.queue.threshold;

                    var cb = function () {
                        CAVNV.log("Netvision, UserTiming: page is unloading sending user timing data");
                        flush(true);
                    };
                    //current scope need to be followed.
                    CAVNV.subscribe('page_unload', cb, null, this);
                },
                is_complete: function () {
                    return true;
                },
                restart: function () {
                    flush(true);
                    queue = [];
                },
                flush: flush
            }
    }(CAVNV.window));

    /***************ErrorTracing**************/
    (function (h) {

        var plugin_loaded = false,
            queue_threshold = 5,
            config = {
                maxErrorPerPage: 5,
                triggerEvent: true,
                logStackTrace: true,
                maxStackFrame: 10,
                filterCrossOriginError: true,  //errors which are of different origin will not have compelte stack except Script Error.
                filter: {
                    pct: 10
                },
                queue: {
                    threshold: 5
                }
            },
            queue = [],
            eventRaised = false,
            totalErrorCount = 0,
            unloading = false;

        function getStackTrace(e) {
            if (!config.logStackTrace || !e || !e.error || !e.error.stack) return '';
            //TODO: set limit on frame count on basis of maxStackFrame.
            return escape(e.error.stack);
        }

        function errorTime(e) {
            if (e.timeStamp) {
                //check if high resolution then add from nav_start_time.
                //Just check if this timestamp is greater than 1262284200000(00:00:00 01/01/2010) then it is absolute timestamp 
                //else will be considered as high resolution time
                //In case error from different -2 frame if timeStamp is relative then there will be issue so first we have to convert that into 
                // absolute.

                if (e.timeStamp > 1262284200000)
                    return e.timeStamp;
                else {
                    var pt = CAVNV.utils.getPT(e.target);

                    if (pt)
                        return (pt.navigationStart + e.timeStamp);
                    else
                        return (CAVNV.nav_start_time + e.timeStamp);
                }
            }
            return new Date().getTime();
        }

        function logError(e) {
            if (totalErrorCount >= config.maxErrorPerPage)
                return;

            //Check if cross Origin Error. 
            if (config.filterCrossOriginError == true) {
                if (!e.filename || e.filename == '' || !e.lineno || e.lineno == -1)
                    return;
            }

            var errorObj = {
                'time': parseInt(errorTime(e)),
                'errmsg': e.message || '',
                'url': e.filename || '',
                'lineno': e.lineno || -1,
                'col': e.colno || -1,
                'stacktrace': getStackTrace(e)
            };
            CAVNV.log('ErrorTracing, Error Captured - ' + JSON.stringify(errorObj));

            //Log event. 
            if (config.triggerEvent && !eventRaised) {
                CAVNV.cav_nv_log_event('JsError', { "error": errorObj.errmsg });
                eventRaised = true;
            }

            queue.push(errorObj);
            totalErrorCount++;
            post();
        }

        function post(force) {
            //if query is empty then ..
            if (queue.length == 0) return;

            //If it unloading then we need to send it forcefully.
            force = force || false;

            var cqueue = [];
            if (queue.length >= queue_threshold || force || unloading) {
                //check if sid and pageInstance not set then return.
                if (!CAVNV.sid) {
                    CAVNV.log('NetVision, ERROR: failed to send error trace, sid not set.');
                    return;
                }

                var url = CAVNV.beacon_url + "?s=" + CAVNV.sid + "&p=" + CAVNV.protocolVersion + "&m=" + CAVNV.messageVersion + "&op=jserror&pi=" + CAVNV.pageInstance + "&CavStore=" + CAVNV.store + "&d=" + CAVNV.channel + "|" + CAVNV.pageIndex + "&pid=" + CAVNV.pageIndex + "&lts=" + CAVNV.lts;

                for (var i = 0; i < queue.length; i++) {
                    var msg = '';
                    var cur_time = parseInt((CAVNV.utils.nv_time(queue[i].time)) / 1000);
                    msg = '-1' + '|' + cur_time + '|' + queue[i].url + '|' + queue[i].lineno + '|' + queue[i].col + '|' + queue[i].errmsg + '|' + queue[i].stacktrace;
                    cqueue.push(msg);
                }

                CAVNV.log('NetVision, ErrorTracing: url = ' + url);
                //send data to nv server.
                if (CAVNV.messageVersion)
                    CAVNV.utils.sendData(url, JSON.stringify(cqueue), "jserror");
                else
                    CAVNV.utils.sendData(url, cqueue.join('\n') + "\n", "jserror");
                //empty queue
                queue = [];
            }
        }

        function start(h, itrIframe) {

            if (itrIframe == undefined)
                itrIframe = true;

            //check if already instrumented.
            if (h.__nvjse == true) return;

            if (!h.addEventListener) {
                return;
            }

            h.addEventListener("error", function (e) {
                logError(e);
            });

            h.__nvjse = true;

            if (CAVNV.monitorIframe == true && itrIframe == true) {
                var f = h.document.getElementsByTagName('iframe');
                for (var z = 0; z < f.length; z++) {
                    try {
                        var iframeWindow = f[z].contentWindow;
                        start(iframeWindow);
                    }
                    catch (e) {
                        continue;
                    }
                }
            }
            var cb = function () {
                CAVNV.log("Netvision, ErrorTracing Unloading");
                unloading = true;
                post(true);
            };

            CAVNV.subscribe('page_unload', cb, null, this);
        }


        CAVNV.plugins.ErrorTracing = {
            init: function (c) {

                //load configuration.
                CAVNV.utils.pluginConfig(config, c, 'ErrorTracing', Object.keys(config));

                //Update threshold if given in configuration.
                if (config.queue && config.queue.threshold && !isNaN(config.queue.threshold))
                    queue_threshold = config.queue.threshold;

                if (config.filter && config.filter.pct) {
                    //If invalid filter is given then just return.
                    if (isNaN(config.filter.pct)) return;
                    var r = parseInt(Math.random() * 100);
                    if (r > config.filter.pct) {
                        CAVNV.log("ErrorTracing module disabled for current page view.");
                        return;
                    }
                }

                start(h);

                plugin_loaded = true;

            },
            is_complete: function () {
                return true;
            },

            flush: function (force) {
                CAVNV.log("Netvision, ErrorTracing: flush() called");
                if (plugin_loaded)
                    post(force);
            },
            restart: function () {
                CAVNV.log("Netvision, ErrorTracing: restart() called");
                queue = [];
                unloading = false;
                eventRaised = false;
                totalErrorCount = 0;
            },
            addIframe: function (w) {
                var itrIframe = false;
                start(w, itrIframe);
            }
        }
    }(CAVNV.window));


    /* 
     * Form Analytics.
     */

    (function (h) {
        /* Constants: 
         */
        var plugin_loaded = false;
        var queue = [];
        var FORM_ID = 'nv-form-id';
        var FORM_FIELD_ID = 'nv-form-field-id';
        var config = { blackList: [] };

        //It will track focus, blur, change and submit event.
        var formCache = new NodeMap, d = h.document;
        var virtualFormCache = {};
        var activeForm = null;
        var enable = false;
        var threshold = 10;


        function flush(force) {
            force = force || false;
            if (!CAVNV.sid)
                return;

            //Return if no of records are not enough.
            if (queue.length < threshold && !force)
                return;

            if (queue.length == 0)
                return;
            /*
                  record format: 
                  {
                    t: curms,
                    r: 1,
                    d: data
                  }
            */
            var url = CAVNV.beacon_url + "?s=" + CAVNV.sid + "&p=" + CAVNV.protocolVersion + "&m=" + CAVNV.messageVersion + "&op=fa&pi=" + CAVNV.pageInstance + "&CavStore=" + CAVNV.store + "&pid=" + CAVNV.pageIndex + "&d=" + CAVNV.channel + "&lts=" + CAVNV.lts;

            var records = [];
            for (var z = 0; z < queue.length; z++) {
                records.push(queue[z].r + '|' + parseInt(CAVNV.utils.nv_time(queue[z].t) / 1000) + '|' + queue[z].d);
            }

            if (CAVNV.messageVersion)
                CAVNV.utils.sendData(url, JSON.stringify(records), "fa");
            else
                CAVNV.utils.sendData(url, records.join("\n") + "\n", "fa");

            //clear queue.
            queue = [];
        }

        function post(record) {
            queue.push(record);
        }

        function now() {
            return new Date().getTime();
        }

        function filterForm(form, isForm) {
            var faBlackList = config.blackList;
            var c = '';
            for (var i = 0; i < faBlackList.length; i++) {
                var f = faBlackList[i];
                if (f.pageid == undefined)
                    f.pageid = -1;

                if (isForm)
                    c = f.form;
                else
                    c = f.field;

                if (c == undefined) continue;

                if (c instanceof RegExp)
                    f.regex = true;
                else
                    f.regex = false;

                try {
                    if (((f.regex == true && c.test(form) == true) || (f.regex == false && form.search(c) != -1)) && (f.pageid == -1 || CAVNV.pageIndex == f.pageid)) {
                        return true;
                    }
                }
                catch (e) { CAVNV.log(e); }
            }
            return false;
        }

        function formData(form) {
            //check if virtual form. 
            if (typeof form == 'string')
                this.name = form;
            else
                this.name = form.name || form.id || form.getAttribute(FORM_ID);

            if (!this.name)
                return null;

            if (typeof this.name == 'object' || this.name.length > 256) {
                this.name = null;
                return null;
            }

            //filter blacklist
            if (filterForm(this.name, 1)) {
                CAVNV.log("Form -->" + this.name + "Filtered");
                this.name = null;
                return null;
            }

            this.virtual = (typeof form == 'string');

            if (!this.virtual)
                this.element = form;

            this.lastStatus = -1;
            this.status = -1;
            this.fields = getFormFields(form, this);
            this.interactionAt = -1;
            this.lastInteractionAt = -1;
            this.submitAt = -1;
            this.lastSubmitAt = -1;
            this.prevStatus = -1;
            return this;
        }

        function getFormFields(form, fData) {
            //first get field
            var fields = [];
            if (typeof form == "string") {
                //check for nv-form-id attribute in input/textarea/select tag.  
                fields = fields.concat(Array.prototype.slice.call(d.querySelectorAll('input[' + FORM_ID + '="' + form + '"]')));
                fields = fields.concat(Array.prototype.slice.call(d.querySelectorAll('textarea[' + FORM_ID + '="' + form + '"]')));
                fields = fields.concat(Array.prototype.slice.call(d.querySelectorAll('select[' + FORM_ID + '="' + form + '"]')));
            }
            else {
                fields = fields.concat(Array.prototype.slice.call(form.getElementsByTagName('input')));
                fields = fields.concat(Array.prototype.slice.call(form.getElementsByTagName('textarea')));
                fields = fields.concat(Array.prototype.slice.call(form.getElementsByTagName('select')));
            }

            //now for all form field add in metadata. 
            var ffData = null;
            var ffDataArray = [];
            var fieldName;
            for (var z = 0; z < fields.length; z++) {
                fieldName = fields[z].name || fields[z].id || fields[z].getAttribute(FORM_FIELD_ID);
                if (!fieldName) continue;

                //discard the field if its length > 256
                if (fieldName.length > 256) continue;

                if (filterForm(fieldName, 0)) {
                    CAVNV.log("Field -->" + fieldName + "Filtered");
                    continue;
                }

                //Check if data have not been added then add. 
                if (!(fields[z].name || fields[z].id || fields[z].getAttribute(FORM_FIELD_ID)))
                    continue;

                //Ignore following input type.
                if (fields[z].type == 'reset' || fields[z].type == 'hidden' || fields[z].type == 'submit' || fields[z].type == 'image' || fields[z].type == 'button')
                    continue;

                //WHy we have put this check. 
                ffData = formCache.get(fields[z]);
                if (!ffData) {
                    ffData = new formFieldData(fields[z], fData);
                    formCache.set(fields[z], ffData);
                    ffDataArray.push(ffData);
                }
            }
            return ffDataArray;
        }

        function formFieldData(field, fData) {
            this.name = field.name || field.id || field.getAttribute(FORM_FIELD_ID);
            this.type = field.tagName;
            this.element = field;
            if (this.type == 'INPUT')
                this.type += '.' + field.type;

            this.focusAt = -1;
            this.firstKeyPressAt = -1;
            this.lastInteractionAt = -1;
            this.form = fData;
            return this;
        }

        function record0(formData) {
            //format: recordtype|<timestamp>|<pageIndex>|<formName>|<; seperated form fields> 
            var fields = formData.fields;
            if (!fields) return null;
            //send field with tagName.
            var fieldStr = '';
            for (var z = 0; z < fields.length; z++) {
                if (z != 0)
                    fieldStr += ';';
                fieldStr += fields[z].name + '-' + fields[z].type;
            }
            return {
                t: now(),
                r: 0,
                d: CAVNV.pageIndex + '|' + formData.name + '|' + fieldStr
            }
        }

        function record5(ffData) {
            return {
                t: now(),
                r: 5,
                d: CAVNV.pageIndex + '|' + ffData.form.name + '|' + (ffData.name + '-' + ffData.type)
            }
        }

        function addForm(form) {
            var fData = new formData(form);
            if (fData.hasOwnProperty("name") && fData.name == null)
                return null;
            //if virtual then add in virtual cache else in formCache.
            if (fData.virtual)
                virtualFormCache[form] = fData;
            else {
                formCache.set(form, fData);
            }

            //send form metadata. 
            queue.push(record0(fData));

            return fData;
        }


        function addFormField(field) {
            //Note: here we have to add filter for hidden, submit and reset input.
            // if field is document, return,
            // with sampleApp, in firfox, getting focus on document
            if (field && field.nodeType && field.nodeType == field.DOCUMENT_NODE)
                return null;
            //Check if field is having name or id or FORM_FIELD_ID
            var id = field.name || field.id || field.getAttribute(FORM_FIELD_ID);
            if (!id) return null;

            if (id.length > 256) return null;

            if (filterForm(id, 0)) {
                CAVNV.log("Field -->" + id + "Filtered");
                return null;
            }

            if (field.tagName == 'INPUT' && (field.type == 'submit' || field.type == 'cancel' || field.type == 'hidden' || field.type == 'button'))
                return null;

            var fData = null;
            //Check if field is associated with virtual form. 
            var virtual_form_id = field.getAttribute(FORM_ID);
            var formElement = null;

            if (virtual_form_id) {
                //check in virtual form cache.
                fData = virtualFormCache[virtual_form_id];
            }
            else {
                formElement = getFormElementFromField(field);
                //If form element is not found for given element then just return.
                //FIXME: we have to set this in a cache so that we need not to check again and again.
                if (!formElement)
                    return null;

                fData = formCache.get(formElement);
            }

            if (!fData) {
                //add complete form. 
                var fData = addForm(virtual_form_id || formElement);
                //if form is added then it must have been added all the fields.
                if (!fData) return null;

                //get formFieldData from cache.
                return formCache.get(field);
            }
            else {
                //add form field.
                var ffData = new formFieldData(field, fData);
                formCache.set(field, ffData);
                queue.push(record5(ffData));
                return ffData;
            }
        }

        function getFormElementFromField(field) {
            //search for parent node with tagName form. 
            var parent = field.parentElement;
            while (parent) {
                if (parent.tagName == 'FORM')
                    return parent;

                parent = parent.parentElement;
            }
            return null;
        }

        function getFormData(form) {
            //TODO: remoev duplicacy. 
            if (typeof form == 'string') {
                return virtualFormCache[form];
            }
            else {
                //TODO: check for type.
                return formCache.get(form);
            }
        }

        function getFieldData(field) {
            if (!field) return null;
            var ffData = formCache.get(field);
            if (ffData == null) {
                return addFormField(field);
            }
            return ffData;
        }

        function updateInteractionState(field, ffData) {
            //get field data. 
            var fData;
            if (!ffData)
                ffData = getFieldData(field);

            if (!ffData)
                return;

            //update form interaction. 
            var fData = ffData.form;
            var curms = now();

            if (fData.interactionAt == -1) {
                fData.interactionAt = curms;
            }

            activeForm = fData;

            //update field interaction.
            ffData.focusAt = curms;
        }

        function record2(ffData, curms) {
            /*
             * walltime - (blur time - focus at )
             * hesitation time - first key press - focusAt.
             */
            //format: recordtype|<timestamp>|<pageIndex>|<formName>|fieldName|retryFlag|wallTime|hesitationTime 
            var data = CAVNV.pageIndex + '|' + ffData.form.name + '|' + ffData.name + '|' +
                (ffData.lastInteractionAt == -1 ? 0 : 1) + '|' +
                (curms - ffData.focusAt) + '|' +
                (ffData.firstKeyPressAt != -1 ? ffData.firstKeyPressAt - ffData.focusAt : -1);
            return {
                t: curms,
                r: 2,
                d: data
            }
        }

        function handleBlur(field, ffData) {
            if (!ffData)
                ffData = getFieldData(field);

            if (!ffData)
                return;

            //Note: sometime we were getting blur without focus event.  That was happening because elements was already at focus.
            //      But in that case if user was typeing something then we were getting focus event.
            //Assumption: So focus will always come whenever we interact with a input field or select.
            if (ffData.focusAt == -1)
                return;

            //Note: we are not checking if any values changed/set or not.   
            //TODO: Check if we should consider interaction only when some value changed.
            var curms = now();
            queue.push(record2(ffData, curms));

            //reset statistics.
            ffData.lastInteractionAt = ffData.focusAt;
            ffData.firstKeyPressAt = -1;
            ffData.focusAt = -1;
        }

        function handleKeyPress(event) {
            //TODO: Need to filter input element. And need to ignore some key eg enter, tab etc..
            var ffData = getFieldData(field);
            if (!ffData) return;

            if (ffData.firstKeyPressAt == -1)
                ffData.firstKeyPressAt = now();
        }

        function record1(form, fData, curms) {
            var blankFieldList = '';
            var totalRefilledFields = 0;

            //TODO: we can keep value in formFieldData. 
            var element;
            var ffData, fieldInteractedAt;
            for (var z = 0; z < fData.fields.length; z++) {
                ffData = fData.fields[z];
                element = fData.fields[z].element;
                if ((element.value != undefined || element.value != null) && element.value == '') {
                    if (blankFieldList != '')
                        blankFieldList += ';';
                    blankFieldList += fData.fields[z].name;
                }

                //Check for refilled flag.
                //Check if the current fields was interacted after this form submit instance. 
                if (fData.lastInteractionAt > 0) {
                    fieldInteractedAt = (ffData.focusAt != -1) ? ffData.focusAt : ffData.lastInteractionAt;
                    if (fieldInteractedAt > 0 && fData.interactionAt <= fieldInteractedAt)
                        totalRefilledFields++;
                }

            }

            //Format: recordtype|<timestamp>|<pageIndex>|<formName>|rertyFlag|<status>|prevStatus|duration|totalRefilledFields|blankFieldList
            var data = CAVNV.pageIndex + '|' + fData.name + '|' + (fData.lastInteractionAt != -1 ? 1 : 0) + '|' +
                fData.status + '|' +
                fData.prevStatus + '|' +
                (curms - fData.interactionAt) + '|' +
                totalRefilledFields + '|' +
                blankFieldList;
            return {
                t: curms,
                r: 1,
                d: data
            }
        }

        function resetFormData(fData) {
            fData.prevStatus = fData.status;
            fData.status = -1;
            fData.lastInteractionAt = fData.interactionAt;
            fData.interactionAt = -1;
            fData.lastSubmitAt = fData.submitAt;
            fData.submitAt = -1;
            //remove this from active.  
            activeForm = null;
        }

        //Note: this method is just to handle actual form submit.
        function submitForm(form, status) {
            var curms = now();
            var fData = getFormData(form);
            if (!fData)
                return;

            // return if we submitting the form without interacting with the form.
            if (fData.interactionAt < 0)
                return;

            //update status.
            fData.status = status || 0;

            //log record 
            queue.push(record1(form, fData, curms));

            //reset formData.
            resetFormData(fData);

            //Forcefully send the collected data. 
            flush(true);
        }

        function onevent(e) {
            if (enable == false)
                return;

            //get target.
            var target = e.target.element;

            switch (e.type) {
                case 'focus':
                    updateInteractionState(target);
                    break;
                case 'blur':
                    handleBlur(target);
                    break;
                /*
                        ----Do i need you ? 
                
                        case 'change': 
                          //TODO: 
                */
            }
        }

        function handleSubmit(e) {
            //by default status will be 0 - PASS
            submitForm(e.target, 0);
        }

        function handleKeyDownEvent(e) {
            //check for valid key
            var target = e.target;
            if (e.target.tagName == 'INPUT' || e.target.tagName == 'TEXTAREA') {
                var charCode = false;
                //Currently it will consider prinatble character.
                if (typeof e.which == "undefined") {
                    // This is IE, which only fires keypress events for printable keys
                    charCode = true;
                } else if (typeof e.which == "number" && e.which > 0) {
                    // In other browsers except old versions of WebKit, evt.which is
                    // only greater than zero if the keypress is a printable key.
                    // We need to filter out backspace and ctrl/alt/meta key combinations
                    charCode = !e.ctrlKey && !e.metaKey && !e.altKey && e.which != 8;
                }
                //check for fieldData.
                var ffData = getFieldData(target);
                if (!ffData)
                    return;

                //Check if element is not yet came in focust then return.
                if (ffData.focusAt != -1 && ffData.firstKeyPressAt == -1)
                    ffData.firstKeyPressAt = now();
            }
        }

        function record3(ffData) {
            //format: recordtype|<timestamp>|<pageIndex>|<formName>|<fieldName>
            return {
                t: now(),
                r: 3,
                d: CAVNV.pageIndex + '|' + ffData.form.name + '|' + ffData.name
            }
        }

        function logDropElement() {
            //Check for activeForm.
            if (!activeForm)
                return;

            //check for latest interacted field.
            var latestField = null;
            var latestInteractionAt = 0;
            var field, lastInteraction;
            for (var z = 0; z < activeForm.fields.length; z++) {
                //Pick the field with latest interaction. but interaction should be after or at form interaction.
                field = activeForm.fields[z];
                lastInteraction = (field.focusAt != -1 ? field.focusAt : field.lastInteractionAt);
                if (lastInteraction >= activeForm.interactionAt && lastInteraction > latestInteractionAt) {
                    latestField = field;
                    latestInteractionAt = lastInteraction;
                }
            }
            if (latestField) {
                //log the record and flush.
                queue.push(record3(latestField));
            }
        }

        function start() {
            //attach event on submit.    
            if (d.addEventListener)
                d.addEventListener('submit', handleSubmit);
            else
                d.attachEvent('onsubmit', handleSubmit);

            //FIXME: We already have one keydown event. 
            //attach keydown event. 
            if (d.addEventListener)
                d.addEventListener('keydown', handleKeyDownEvent);
            else
                d.attachEvent('onkeydown', handleKeyDownEvent);

            //add unload event to send drop field.
            //Note: currently in soft navigation also drop records will be logged. 
            function cb() {
                logDropElement();

                flush(true);
            }

            CAVNV.subscribe('page_unload', cb, null, this);

            return true;
        }

        CAVNV.plugins.FA = {
            init: function (c) {

                //load configuration.
                CAVNV.utils.pluginConfig(config, c, 'FA', Object.keys(config));

                if (start() == true)
                    enable = true;
            },

            is_complete: function () {
                return true;
            },

            onevent: onevent,

            flush: function (force) {
                CAVNV.log("Netvision, FA: flush() called");
                if (enable) flush(force);
            },

            restart: function () {
                CAVNV.log("Netvision, FA: restart() called");
                queue = [];
                virtualFormCache = {};
                formCache = new NodeMap();
                activeForm = null;
                //set for next page.
                function cb() {
                    logDropElement();

                    flush(true);
                }

                CAVNV.subscribe('page_unload', cb, null, this);
            },
            submitForm: submitForm
        }
        CAVNV.submitForm = submitForm;
    }(CAVNV.window));

    /*----------------------Console ----------------*/
    (function (w) {
        var queue = [];
        var config = {};
        var log = [];
        var totalLogs = 0, totalErrors = 0;
        var conf = "", lastLog = {}, count = 1;

        function new_wrappers(fn, type) {
            var oldLog = console[fn];
            console[fn] = function (message) {
                if (!message || (typeof message == "string" && message.indexOf("NVLogs") != -1)) {
                    oldLog.apply(console, arguments);
                    return;
                }
                if (!message || typeof message !== "string") return;

                //add only if log length is less
                var m = message;
                if (!isNaN(conf.maxLogLength) && message.length > conf.maxLogLength)
                    m = message.substring(0, conf.maxLogLength);

                if (lastLog.m == m && lastLog.t == type && log.length > 0)
                    log[(log.length - 1)].c++;
                else {
                    if (type == 1 && totalLogs < conf.maxLog) {
                        log.push({ "time": new Date().getTime(), "type": type, "msg": (m + ''), "c": count });
                        totalLogs++;
                    }

                    if (type == 4 && totalErrors < conf.maxError) {
                        log.push({ "time": new Date().getTime(), "type": type, "msg": (m + ''), "c": count });
                        totalErrors++;
                    }

                    if (type == 2 || type == 3)
                        log.push({ "time": new Date().getTime(), "type": type, "msg": (m + ''), "c": count });
                }
                m = (m.length > 256) ? m.substring(0, 256) : m;
                lastLog = { m: m, t: type }; //update
                oldLog.apply(console, arguments);
            };
        }

        function consoleWrapper() {
            var l = conf.level;
            if (l.length == 0) return;

            var i = 0;
            for (i = 0; i < l.length; i++) {
                if (l[i].toLowerCase() == "verbose") {
                    new_wrappers("log", 1);
                    continue;
                }
                if (l[i].toLowerCase() == "warn") {
                    new_wrappers("warn", 2);
                    continue;
                }
                if (l[i].toLowerCase() == "info") {
                    new_wrappers("info", 3);
                    continue;
                }
                if (l[i].toLowerCase() == "error") {
                    new_wrappers("error", 4);
                    continue;
                }
            }
        }

        function isBlacklist(m) {
            var b = conf.filter.blacklistPattern || [];
            if (!b.length) return false;

            var i = 0, cp = [];
            for (i = 0; i < b.length; b++) {
                var l = b[i].length;
                var s = (b[i][0] == '/') ? b[i].substring(1, l - 1) : b[i];
                if (!cp[i]) {
                    try {
                        var regex = new RegExp(s);
                        cp[i] = regex;
                    }
                    catch (e) { CAVNV.log(e); cp[i] = b[i]; }
                }

                if (cp[i].test(m)) return true;

            }
            return false;
        }
        function flush(force, autoInstrForce) {
            force = force || false;

            if (!CAVNV.sid)
                return;

            var i = 0, pct = 100;
            //pct based filtering will be session level i..e we will generate the random number in begining of session, set the flag value and persist that flag in localStorage for througout the session 
            var r = CAVNV.get_session_flag('pctConsole');
            if (r && !autoInstrForce) return;

            if (conf.filter && !isNaN(conf.filter.pct)) pct = conf.filter.pct;

            r = parseInt(Math.random() * 100);

            if (r > pct)
                CAVNV.set_session_flag('pctConsole', true);
            for (i = 0; i < log.length; i++) {
                //filtering NV Logs and blacklisted
                if (log[i].msg.indexOf('NVLog') != -1 || isBlacklist(log[i].msg)) continue;

                var str = CAVNV.utils.nv_time_rel_to_sess(log[i].time) + "|" + log[i].type + "|" + log[i].c + "|" + log[i].msg;
                queue.push(str);
            }

            if (queue.length == 0) return;

            if (force == true || queue.length >= threshold) {

                var url = CAVNV.beacon_url + "?s=" + CAVNV.sid + "&p=" + CAVNV.protocolVersion + "&m=" + CAVNV.messageVersion + "&op=clogs&pi=" + CAVNV.pageInstance + "&CavStore=" + CAVNV.store + "&d=" + CAVNV.store + "|" + CAVNV.terminal + "&pid=" + CAVNV.pageIndex + "&lts=" + CAVNV.lts;

                var data = "";
                //send data to nv server.
                data = CAVNV.messageVersion ? (JSON.stringify(queue)) : (queue.join('\n') + "\n");

                /*if(conf.MonitorConsole.IDB == true) 
                  IDB.post(CAVNV.sid, CAVNV.pageInstance, {url: url, data:data, module: 'clogs'});
                else*/ //will be with auto tracing
                CAVNV.utils.sendData(url, data, "clogs");
                queue = [];
                log = [];
                lastLog = {};
            }
        }

        CAVNV.plugins.MonitorConsole = {
            init: function (c) {

                CAVNV.utils.pluginConfig(config, c, 'MonitorConsole', Object.keys(config));
                conf = CAVNV.config.MonitorConsole;
                if (conf.enabled) {
                    consoleWrapper();
                }
                return this;
            },
            is_complete: function () {
                return true;
            },
            restart: function () {
                flush(true);
                queue = [];
                log = [];
                totalLogs = 0;
                totalErrors = 0;
                lastLog = {};
            },
            flush: flush
        }
    }(CAVNV.window));

    //Bot Detection Plugin.
    //TODO: Currently we are just considering click and change. See if we should consider focus also. 
    (function (h) {
        var active = false;
        var config = {};
        var cm = Array(4);
        var enabled = false;
        //Keep gaps corresponding to each click. 
        var clickGaps = [];

        cm[0] = cm[1] = cm[2] = cm[3] = 0;

        var bact = 0, tact = 0, lastFocus = null, lastAction, lastActionAt = 0,
            gapBetnAction = 0, nextActionCount = 0, nonTrusted = 0, bUserAgent = 0, autoFramework = 0, bExt = 0;

        function inrange(cor1, cor2) {
            if (cor1[0] == undefined && cor1[1] == undefined) return true;
            return (Math.abs(cor1[0] - cor2[0]) < 50 && Math.abs(cor1[1] - cor2[1]) < 50);
        }

        function insidebox(rect, cor, olp) {
            olp = olp || 25;
            if (cor[0] == undefined && cor[1] == undefined) return true;
            return ((cor[0] >= rect.left - olp && cor[0] <= rect.right + olp) &&
                (cor[1] >= rect.top - olp && cor[1] <= rect.bottom + olp));
        }

        function onevent(event) {
            if (enabled == false) return;

            var e = event.nativeEvent;
            if (active == false) return;

            if (e.type == "click" || e.type == "change") {
                //update time. 
                var t = new Date().getTime();
                if (lastActionAt) {
                    gapBetnAction += (t - lastActionAt);
                    clickGaps.push(t - lastActionAt);
                    nextActionCount++;
                }
                lastActionAt = t;

                //update isTrusted flag. 
                if (e.isTrusted === false)
                    nonTrusted++;
            }

            if (e.type == "click") {
                //Check if click event then - 
                //a- normal click i.e. by mouse then check mouse for last location, it should be in that range. 
                //b- Click can be simulate by enter then enter key should have been captured. In this case click position will be 0,0 
                var cor = [e.clientX, e.clientY];

                if (cor[0] == 0 && cor[1] == 0) {
                    if (cm[3] != 1) {
                        bact++;
                    }
                }
                else {
                    if (!inrange(cm, cor))
                        bact++;
                }

                tact++;
                //reset enter flag. 
                cm[3] = 0;
            }
            else if (e.type == 'change') {
                if ((e.target != lastFocus)) {
                    bact++;
                }
                tact++;

            }
            else if (e.type == 'focus') {

                //lastFocus = e.target;
                //check how focus was achieved.  
                // a. tab. 
                // b. mousemove.  
                if (!cm[2]) {
                    //Check for element position.  
                    var rect = e.target.getBoundingClientRect();
                    var viewportX = w.pageXOffset || (null === w.document.body ? 0 : w.document.body.scrollLeft);
                    var viewportY = w.pageYOffset || (null === w.document.body ? 0 : w.document.body.scrollTop);

                    //update rect as per viewport. 
                    rect.left += viewportX;
                    rect.right += viewportX;
                    rect.top += viewportY;
                    rect.bottom += viewportY;

                    if (insidebox(rect, cm, 25)) {
                        lastFocus = e.target;
                    }
                    else
                        lastFocus = null;
                }
                else {
                    lastFocus = e.target;
                }

                //reset tab flag. 
                cm[2] = 0;
            }
        }

        function handlekey(e) {
            var keycode = (e.keyCode ? e.keyCode : e.which)
            if (keycode == 9)
                cm[2] = 1;
            else if (keycode == 13)
                cm[3] = 1;
        }

        function handlemouse(e) {
            cm[0] = e.clientX;
            cm[1] = e.clientY;
        }

        function nsort(a, b) { return a - b; }

        function sendsummary() {
            if (!CAVNV.sid) return;
            //set the below data - 
            /*
             ab|bc|cd|de|ef|fg|gf|hi|ij
      
      Where - 
      ab - time spent on page 
      bc - total time gap between acton 
      de - total focus change between action
      cd - total next action count 
      ef - total non isTrusted event 
      fg - total event count 
      gh - browser extension present (0/1)
      hi - bot user agent (0/1)
      ij - automation framework present (0/1)
            */

            var pspendtime = -1;
            var t = new Date().getTime();

            //Check if hard navigation. 
            if (CAVNV.nav_offset <= 0) {
                //consider from domInteractive.
                var pt = CAVNV.utils.getPT(h);
                if (pt) {
                    pspendtime = parseInt((h.performance.now() + pt.navigationStart) - pt.domInteractive);
                }
                else {
                    //check from the time when cav_nv initialized. 
                    pspendtime = t - CAVNV.initAt;
                }
            }
            else {
                //check if we have snav information. 
                if (CAVNV.snav) {
                    var s = CAVNV.snav;
                    if (s.end - s.init > 100)
                        pspendtime = t - s.init;
                    else
                        pspendtime = t - s.end;
                }
            }

            //get data from sessionStorage.
            var s = h.sessionStorage;
            var navGaps = [pspendtime], nav50p = -1, nav75p = -1, click50p = -1, click75p = -1;
            if (!!s) {
                //get previous data and merge with current one.  
                var d = s.getItem('nvct');
                if (d) {
                    //this is the first data. 
                    //format will be - [[NavigationDelay], [clickDelay]]
                    d = JSON.parse(d);
                    navGaps = d[0].concat(navGaps);
                    clickGaps = d[1].concat(clickGaps);
                }
                //generate 50th and 75th percentile for both and save data into sessionStorage.
                //first of all sort the array . 
                if (navGaps.length > 1) {
                    navGaps.sort(nsort);
                    nav50p = navGaps[Math.round(0.5 * navGaps.length) - 1];
                    nav75p = navGaps[Math.round(0.75 * navGaps.length) - 1];
                }

                if (clickGaps.length > 1) {
                    clickGaps.sort(nsort);
                    click50p = clickGaps[Math.round(0.5 * clickGaps.length) - 1];
                    click75p = clickGaps[Math.round(0.75 * clickGaps.length) - 1];
                }

                //save the current values in sessionStorage.
                s.setItem('nvct', JSON.stringify([navGaps, clickGaps]));

                //reset the clickGaps. 
                clickGaps = [];
            }


            var data = pspendtime + "|" + gapBetnAction + "|" + bact + "|" + nextActionCount + "|" + nonTrusted + "|" + tact + "|" +
                bExt + "|" + bUserAgent + "|" + autoFramework + "|" + nav50p + "|" + nav75p + "|" + click50p + "|" + click75p;

            var url = CAVNV.beacon_url + "?s=" + CAVNV.sid + "&p=" + CAVNV.protocolVersion + "&m=" + CAVNV.messageVersion + "&op=summary&pi=" + CAVNV.pageInstance + "&CavStore=" + CAVNV.store + "&pid=" + CAVNV.pageIndex + "&d=" + data + "&lts=" + CAVNV.lts;

            //try to send by sendBeacon if failed then try with Image.
            if (!navigator.sendBeacon || !navigator.sendBeacon(url)) {
                var i = new Image();
                i.onload = function () { };
                i.src = url;
            }
        }

        function start() {
            //set mousemove and keydown event to detect mouse movement and tab key. 
            var d = h.document;

            d.addEventListener('keydown', handlekey);

            d.addEventListener('mousemove', handlemouse);

            //Check for user agent.
            if (CAVNV.utils.isBot(h.navigator.userAgent))
                bUserAgent = 1;

            //add listener to send summary.
            CAVNV.subscribe('page_unload', sendsummary, null, this);

            //set active as lastFocus.
            if (h.document.activeElement) {
                var select = h.document.activeElement;
                if (select.tagName != "BODY")
                    lastFocus = select;
            }


            enabled = true;
        }

        CAVNV.plugins.BD = {
            init: function (c) {

                if (active == true)
                    return;

                //load configuration.
                //Note: Currently there is no configuration.
                CAVNV.utils.pluginConfig(config, c, 'BD', Object.keys(config));

                start();

                active = true;
            },

            is_complete: function () {
                return true;
            },

            onevent: onevent,

            flush: function (force) {
            },

            restart: function () {
                //reset the other counters. 
                bact = tact = lastAction = lastActionAt = gapBetnAction = nextActionCount = nonTrusted = 0

                CAVNV.subscribe('page_unload', sendsummary, null, this);
            },
            //set if extension present 
            ab: function () {
                bExt = 1;
            },

            bc: function () {
                autoFramework = 1;
            }
        }
    }(CAVNV.window));

    /*AB Testing*/
    (function (w) {
        var queue = [];
        var config = {};
        var threshold = 10;
        //list of added variations.
        var addedVars = [];
        var filteredVars = [];
        var completedVars = [];
        var newlyAdded = "";
        var isApplicable = 0;
        var l = {};

        function addTag(attr) {
            //create a new style element and add in document as last child of head
            var node = document.createElement("style");
            var textnode = document.createTextNode(attr);         // Create a text node
            node.appendChild(textnode);
            CAVNV.window.document.querySelectorAll('head')[0].appendChild(node);
        }

        //this method will apply the variations on the current webpage 
        function applyVariations() {
            var c = CAVNV.config;
            var vObj = (c.ABTesting.v);
            var prevAddedVars = [];
            var prevFiltered = [];
            l = JSON.parse(localStorage.getItem('nvabv'));
            if (l != undefined && l != null) {
                //Retrieve previously added variation
                prevAddedVars = l.added;
                prevFiltered = l.filtered;
            }

            var i;
            addedVars = [];
            if (!l) l = {};
            for (i = 0; i < vObj.length; i++) {
                var v = vObj[i];

                //skip if not applicable on the current url
                if (v.url && v.url != document.URL) continue;

                //skip if not applicable on current page and filtered once 
                if (v.pi.split(',').indexOf(CAVNV.pageIndex.toString()) == -1 || v.r == undefined
                    || (prevFiltered.indexOf(v.i) != -1)) continue;

                //apply pct
                var r = parseInt(Math.random() * 100);
                if (!v.pct) continue;

                if (r >= v.pct) {
                    filteredVars.push(v.i);
                    continue;
                }
                isApplicable = 1;
                var rule = Object.keys(v.r)[0];
                if (rule == "cssrule") {
                    addTag(v.r.cssrule);
                }
                //TODO: htmlrule 
                if (rule == "jsrule") {
                    //execute that as in context of CAVNV.window and CAVNV.window.document
                    var e = CAVNV.utils.eval_jsstring(v.r.jsrule);
                    //element not found.
                    if (e == undefined && e == null) continue;
                }

                //skip if already added. keep array unique
                if (prevAddedVars.indexOf(v.i) != -1) continue;

                //push variation id  
                addedVars.push(v.i);
            }
            newlyAdded = addedVars.join(',');

            l.filtered = prevFiltered.concat(filteredVars);
            //merge and store all newly added in localstorage
            l.added = prevAddedVars.concat(addedVars);
            //update in localStorage
            localStorage.setItem('nvabv', JSON.stringify(l));
        }

        function getVar(id) {
            var vObj = (CAVNV.config.ABTesting.v);
            for (var i = 0; i < vObj.length; i++) {
                if (vObj[i].i == id) return vObj[i];
            }
            return null;
        }

        function applyPageGoal(mode, val) {
            /*
             EQUAL
                value1 - 0
                value2 - URL String
             URL_CONTAIN 
                value1 - 0
                value2	- URL string 
             URL_CONTAIN_REGEX
                        Value1 - 0 
                        Value2 - regex pattern of URL 
             URL_NOT_CONTAIN 
                        Value1 - 0 
                        Value2 - URL string 
             URL NOT_CONTAIN_REGEX 
                        Value1 - 0
                        Value2 - URL String 
             PAGE_MATCH 
                        Value1 - 0
                        Value2 - pageid list comma separated
                    Eg. 1,2,2
    
             */
            if (mode.indexOf('REGEX') != -1) {
                if (typeof val == "string") {
                    var l = val.length;
                    var s = (val[0] == '/') ? val.substring(1, l - 1) : val;
                    val = new RegExp(s);
                }
            }
            var url = document.URL;
            if (mode == "EQUAL")
                return (val == url);

            if (mode == "URL_CONTAIN")
                return ((url.indexOf(val) != -1) ? 1 : 0);

            if (mode == "URL_CONTAIN_REGEX")
                return ((val.test(document.URL)) ? 1 : 0);

            if (mode == "URL_NOT_CONTAIN")
                return ((url.indexOf(val) == -1) ? 1 : 0);

            if (mode == "URL_NOT_CONTAIN_REGEX")
                return ((val.test(document.URL)) ? 0 : 1);

            if (mode == "PAGE_MATCH")
                return ((val.split(',').indexOf(CAVNV.pageIndex.toString()) != -1) ? 1 : 0);

            return 0;
        }

        function applyClickGoal(val) {
            var c = CAVNV.config;
            var vObj = (c.ABTesting.v);
            var prevAddedVars = [], prevCompletedVars = [];
            l = JSON.parse(localStorage.getItem('nvabv'));

            if (!l) return;

            //Retrieve previously added variation
            prevAddedVars = l.added;
            prevCompletedVars = l.completed;

            var i;
            addedVars = [];
            if (!prevCompletedVars) prevCompletedVars = [];
            //control push in queue if click not is not applicable 
            var isClickGoalOn = 0;
            for (i = 0; i < prevAddedVars.length; i++) {
                //If already completed then We will not check for their goal again
                if (!prevCompletedVars && prevCompletedVars.indexOf(prevAddedVars[i].toString()) != -1) continue;

                var v = getVar(prevAddedVars[i]);
                if (v == null) continue;

                if (v.g.type != "CLICK_GOAL") continue;

                if (v.g.v2 != val) continue;

                isClickGoalOn = 1;
                //push variation id
                addedVars.push(v.i);
            }

            if (!isApplicable || !isClickGoalOn) return 0;
            //merge and store all newly added in localstorage
            l.completed = prevCompletedVars.concat(addedVars);
            //update in localStorage
            localStorage.setItem('nvabv', JSON.stringify(l));

            queue.push(newlyAdded + ':' + prevAddedVars.join(',') + ':' + addedVars.join(','));
        }

        function applyContentGoal(mode, val) {

            if (mode == "EXIST")
                return ((val.test(document.URL) != -1) ? 0 : 1);

            if (mode == "NOT_EXIST")
                return ((val.test(document.URL) != -1) ? 0 : 1);

            return 0;
        }

        function applyCustomGoal(val) {
            // callback will be executed inside try/catch and if exception occurs then it will be considered as fail
            try {
                var ret = boomr.utils.eval_jsstring(val);
                return 1;
            }
            catch (e) {
                CAVNV.log(e);
            }
            return 0;
        }

        function applyGoals() {
            var vObj = (CAVNV.config.ABTesting.v);
            var prevAddedVars = [], prevCompletedVars = [];
            l = JSON.parse(localStorage.getItem('nvabv'));

            if (!l) return;

            //Retrieve previously added variation
            prevAddedVars = l.added;
            prevCompletedVars = l.completed;

            var i;
            addedVars = [];
            if (!prevCompletedVars) prevCompletedVars = [];

            for (i = 0; i < prevAddedVars.length; i++) {
                //If already completed then We will not check for their goal again
                if (prevCompletedVars && prevCompletedVars.indexOf(prevAddedVars[i]) != -1) continue;

                var v = getVar(prevAddedVars[i]);
                if (v == null) continue;

                if (v.g.type == "CLICK_GOAL") continue;

                if (v.g.type == "PAGE_GOAL") {
                    if (!applyPageGoal(v.g.mode, v.g.v2)) continue;
                }
                if (v.g.type == "CONTENT_GOAL") {
                    if (!applyContentGoal(v.g.mode, v.g.v2)) continue;
                }
                if (v.g.type == "CUSTOM_GOAL") {
                    if (!applyCustomGoal(v.g.v2)) continue;
                }

                //push variation id
                addedVars.push(v.i);
            }
            if ((!addedVars.length && !prevAddedVars.length && !prevCompletedVars.length) || !isApplicable) return 0;

            //merge and store all newly added in localstorage
            l.completed = prevCompletedVars.concat(addedVars);
            //update in localStorage
            localStorage.setItem('nvabv', JSON.stringify(l));

            queue.push(newlyAdded + ':' + prevAddedVars.join(',') + ':' + addedVars.join(','));
        }

        function flush(force) {
            force = force || false;
            if (!CAVNV.sid)
                return;

            if (queue.length == 0)
                return;

            var i;
            for (i = 0; i < queue.length; i++) {
                w.cav_nv_log_event('variationData', queue[i]);
            }
            queue = [];
        }

        function onevent(e) {
            if (!CAVNV.config.ABTesting.enabled) return;

            if (e.type == "click") {
                var target = e.target.element;
                var name = target.name;
                applyClickGoal(name);
            }
        }

        CAVNV.plugins.ABTesting = {
            start: function (c) {
                var kw = ['enabled'];

                CAVNV.utils.pluginConfig(config, c, 'ABTesting', Object.keys(config));

                //if jQuery not loaded then we can't start it
                if (typeof CAVNV.jQuery === 'undefined' || CAVNV.jQuery == null || !CAVNV.config.ABTesting.enabled) return;

                applyVariations();

                applyGoals();

                var cb = function () {
                    CAVNV.log("Netvision, ABTesting: page is unloading sending data");
                    flush(true);
                };
                //current scope need to be followed.
                CAVNV.subscribe('page_unload', cb, null, this);
            },
            is_complete: function () {
                return true;
            },
            restart: function () {
                flush(true);
                queue = [];
            },
            onevent: onevent,
            flush: flush
        }
    }(CAVNV.window));

    function domReady(win, fn) {

        var done = false, top = true,

            doc = win.document,
            root = doc.documentElement,
            modern = doc.addEventListener,

            add = modern ? 'addEventListener' : 'attachEvent',
            rem = modern ? 'removeEventListener' : 'detachEvent',
            pre = modern ? '' : 'on',

            init = function (e) {
                if (e.type == 'readystatechange' && (/loaded|interactive|complete/.test(doc.readyState) != true)) return;
                (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
                if (!done && (done = true)) fn.call(win, e.type || e);
            },

            poll = function () {
                try { root.doScroll('left'); } catch (e) { setTimeout(poll, 50); return; }
                init('poll');
            };

        if (/loaded|interactive|complete/.test(doc.readyState) == true) fn.call(win, 'lazy');
        else {
            if (!modern && root.doScroll) {
                try { top = !win.frameElement; } catch (e) { }
                if (top) poll();
            }
            doc[add](pre + 'DOMContentLoaded', init, false);
            doc[add](pre + 'readystatechange', init, false);
            win[add](pre + 'load', init, false);
        }
    }
    /**********Initialization************/
    var cavInit = function () {
        CAVNV.init({
            wait: true,
            site_domain: null,
            enableWorker: true,
            CONFIG: {
                config_url: "http://localhost:3000/config.js",
                jquery_url: "http://localhost:3000/jquery.min.js"
            },
            USERACTION: {
                enabled: true,
                enableKeyPress: false,
                MMCapture: { enabled: false },
                MHCapture: { enabled: false, size: 3 },
                filterJsTriggeredActions: true
            },
            FEEDBACK: {
                enabled: false
            },
            ErrorTracing: {
                enabled: true
            },
            EQueue: {
                enabled: false
            },
            UserTiming: {
                enabled: false
            },
            SPA: {
                enabled: false
            },
            AjaxMonitor: {
                enabled: false
            },
            ClickMonitor: {
                enabled: false
            },
            CrossOrigin: {
                enabled: false
            },
            FA: {
                enabled: false
            },
            ABTesting: {
                enabled: false
            },
            filterBotSession: false,
            protocolVersion: 1,
            enableCssSelector: false,
            ocxFilter: {
                enabled: false,
                pct: 100,
                maxPage: 5, //Specify the number of page.
                maxPagePct: 100,
                dumpState: [],//BROWSER_STATE:1, SESSION_STATE:2, BUYER_STATE:3
                batchSize: 0,
                events: []
            },
            MonitorConsole: {
                enabled: false,
                level: ['error', 'warn'],
                maxLog: 100,
                maxError: 100,
                maxLogLength: 256,
                filter: {
                    pct: 100,
                    blacklistPattern: []
                }
            },
            sca: {
                enabled: false,
                encryption: false,

            },
            BD: {
                enabled: false
            },
            SW: {
                enabled: false,
                //frame_url: "//10.10.30.78:7909/nv/netvision/cavnv_sw_iframe.html",
                //sw_url: "https://10.10.30.78:7909/nv/netvision/sw.js"
            },
            IframeMonitor: {
                enabled: false
            }
        });
    };
    domReady(w, cavInit);
}(window));


