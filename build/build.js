

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("matthewp-attr/index.js", Function("exports, require, module",
"/*\n** Fallback for older IE without get/setAttribute\n */\nfunction fetch(el, attr) {\n  var attrs = el.attributes;\n  for(var i = 0; i < attrs.length; i++) {\n    if (attr[i] !== undefined) {\n      if(attr[i].nodeName === attr) {\n        return attr[i];\n      }\n    }\n  }\n  return null;\n}\n\nfunction Attr(el) {\n  this.el = el;\n}\n\nAttr.prototype.get = function(attr) {\n  return (this.el.getAttribute && this.el.getAttribute(attr))\n    || fetch(this.el, attr).value;\n};\n\nAttr.prototype.set = function(attr, val) {\n  if(this.el.setAttribute) {\n    this.el.setAttribute(attr, val);\n  } else {\n    fetch(this.el, attr).value = val;\n  }\n  \n  return this;\n};\n\nAttr.prototype.has = function(attr) {\n  return (this.el.hasAttribute && this.el.hasAttribute(attr))\n    || fetch(this.el, attr) !== null;\n};\n\nmodule.exports = function(el) {\n  return new Attr(el);\n};\n\nmodule.exports.Attr = Attr;\n//@ sourceURL=matthewp-attr/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n/**\n * Expose `Emitter`.\n */\n\nmodule.exports = Emitter;\n\n/**\n * Initialize a new `Emitter`.\n *\n * @api public\n */\n\nfunction Emitter(obj) {\n  if (obj) return mixin(obj);\n};\n\n/**\n * Mixin the emitter properties.\n *\n * @param {Object} obj\n * @return {Object}\n * @api private\n */\n\nfunction mixin(obj) {\n  for (var key in Emitter.prototype) {\n    obj[key] = Emitter.prototype[key];\n  }\n  return obj;\n}\n\n/**\n * Listen on the given `event` with `fn`.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.on = function(event, fn){\n  this._callbacks = this._callbacks || {};\n  (this._callbacks[event] = this._callbacks[event] || [])\n    .push(fn);\n  return this;\n};\n\n/**\n * Adds an `event` listener that will be invoked a single\n * time then automatically removed.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.once = function(event, fn){\n  var self = this;\n  this._callbacks = this._callbacks || {};\n\n  function on() {\n    self.off(event, on);\n    fn.apply(this, arguments);\n  }\n\n  fn._off = on;\n  this.on(event, on);\n  return this;\n};\n\n/**\n * Remove the given callback for `event` or all\n * registered callbacks.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.off =\nEmitter.prototype.removeListener =\nEmitter.prototype.removeAllListeners = function(event, fn){\n  this._callbacks = this._callbacks || {};\n\n  // all\n  if (0 == arguments.length) {\n    this._callbacks = {};\n    return this;\n  }\n\n  // specific event\n  var callbacks = this._callbacks[event];\n  if (!callbacks) return this;\n\n  // remove all handlers\n  if (1 == arguments.length) {\n    delete this._callbacks[event];\n    return this;\n  }\n\n  // remove specific handler\n  var i = callbacks.indexOf(fn._off || fn);\n  if (~i) callbacks.splice(i, 1);\n  return this;\n};\n\n/**\n * Emit `event` with the given args.\n *\n * @param {String} event\n * @param {Mixed} ...\n * @return {Emitter}\n */\n\nEmitter.prototype.emit = function(event){\n  this._callbacks = this._callbacks || {};\n  var args = [].slice.call(arguments, 1)\n    , callbacks = this._callbacks[event];\n\n  if (callbacks) {\n    callbacks = callbacks.slice(0);\n    for (var i = 0, len = callbacks.length; i < len; ++i) {\n      callbacks[i].apply(this, args);\n    }\n  }\n\n  return this;\n};\n\n/**\n * Return array of callbacks for `event`.\n *\n * @param {String} event\n * @return {Array}\n * @api public\n */\n\nEmitter.prototype.listeners = function(event){\n  this._callbacks = this._callbacks || {};\n  return this._callbacks[event] || [];\n};\n\n/**\n * Check if this emitter has `event` handlers.\n *\n * @param {String} event\n * @return {Boolean}\n * @api public\n */\n\nEmitter.prototype.hasListeners = function(event){\n  return !! this.listeners(event).length;\n};\n//@ sourceURL=component-emitter/index.js"
));
require.register("manuelstofer-foreach/index.js", Function("exports, require, module",
"\nvar hasOwn = Object.prototype.hasOwnProperty;\n\nmodule.exports = function forEach (obj, fn, ctx) {\n    if (obj == null) return;\n    var l = obj.length;\n    if (l === +l) {\n        for (var i = 0; i < l; i++) {\n            fn.call(ctx, obj[i], i, obj);\n        }\n    } else {\n        for (var k in obj) {\n            if (hasOwn.call(obj, k)) {\n                fn.call(ctx, obj[k], k, obj);\n            }\n        }\n    }\n};\n//@ sourceURL=manuelstofer-foreach/index.js"
));
require.register("manuelstofer-extend/index.js", Function("exports, require, module",
"\"use strict\";\nvar each = require('foreach'),\n    slice = [].slice;\n\n// Extend a given object with all the properties in passed-in object(s).\nmodule.exports = function (obj) {\n    each(slice.call(arguments, 1), function (source) {\n        for (var prop in source) {\n            obj[prop] = source[prop];\n        }\n    });\n    return obj;\n};\n//@ sourceURL=manuelstofer-extend/index.js"
));
require.register("manuelstofer-json-pointer/index.js", Function("exports, require, module",
"'use strict';\n\nvar each = require('foreach');\nmodule.exports = api;\n\n\n/**\n * Convenience wrapper around the api.\n * Calls `.get` when called with an `object` and a `pointer`.\n * Calls `.set` when also called with `value`.\n * If only supplied `object`, returns a partially applied function, mapped to the object.\n *\n * @param obj\n * @param pointer\n * @param value\n * @returns {*}\n */\n\nfunction api(obj, pointer, value) {\n    // .set()\n    if (arguments.length === 3) {\n        return api.set(obj, pointer, value);\n    }\n    // .get()\n    if (arguments.length === 2) {\n        return api.get(obj, pointer);\n    }\n    // Return a partially applied function on `obj`.\n    var wrapped = api.bind(api, obj);\n\n    // Support for oo style\n    for (var name in api) {\n        if (api.hasOwnProperty(name)) {\n            wrapped[name] = api[name].bind(wrapped, obj);\n        }\n    }\n    return wrapped;\n}\n\n\n/**\n * Lookup a json pointer in an object\n *\n * @param obj\n * @param pointer\n * @returns {*}\n */\napi.get = function get(obj, pointer) {\n    var tok,\n        refTokens = api.parse(pointer);\n    while (refTokens.length) {\n        tok = refTokens.shift();\n        if (!obj.hasOwnProperty(tok)) {\n            throw new Error('Invalid reference token:' + tok);\n        }\n        obj = obj[tok];\n    }\n    return obj;\n};\n\n/**\n * Sets a value on an object\n *\n * @param obj\n * @param pointer\n * @param value\n */\napi.set = function set(obj, pointer, value) {\n    var refTokens = api.parse(pointer),\n        tok,\n        nextTok = refTokens[0];\n    while (refTokens.length > 1) {\n        tok = refTokens.shift();\n        nextTok = refTokens[0];\n\n        if (!obj.hasOwnProperty(tok)) {\n            if (nextTok.match(/^\\d+$/)) {\n                obj[tok] = [];\n            } else {\n                obj[tok] = {};\n            }\n        }\n        obj = obj[tok];\n    }\n    obj[nextTok] = value;\n    return this;\n};\n\n/**\n * Returns a (pointer -> value) dictionary for an object\n *\n * @param obj\n * @returns {{}}\n */\napi.dict = function dict(obj) {\n    var results = {},\n        refTokens = [],\n\n        mapObj = function (cur) {\n            var type = Object.prototype.toString.call(cur);\n            if (type === '[object Object]' || type === '[object Array]') {\n\n                each(cur, function (value, key) {\n                    refTokens.push(String(key));\n                    mapObj(value);\n                    refTokens.pop();\n                });\n\n            } else {\n                results[api.compile(refTokens)] = cur;\n            }\n        };\n\n    mapObj(obj);\n    return results;\n};\n\n/**\n * Iterates over an object\n * Iterator: function (value, pointer) {}\n *\n * @param obj\n * @param iterator\n */\napi.walk = function walk(obj, iterator) {\n    each(api.dict(obj), iterator);\n};\n\n/**\n * Tests if an object has a value for a json pointer\n *\n * @param obj\n * @param pointer\n * @returns {boolean}\n */\napi.has = function has(obj, pointer) {\n    try {\n        api.get(obj, pointer);\n    } catch (e) {\n        return false;\n    }\n    return true;\n};\n\n/**\n * Escapes a reference token\n *\n * @param str\n * @returns {string}\n */\napi.escape = function escape(str) {\n    return str.replace(/~/g, '~0').replace(/\\//g, '~1');\n};\n\n/**\n * Unescapes a reference token\n *\n * @param str\n * @returns {string}\n */\napi.unescape = function unescape(str) {\n    return str.replace(/~1/g, '/').replace(/~0/g, '~');\n};\n\n/**\n * Converts a json pointer into a array of reference tokens\n *\n * @param pointer\n * @returns {Array}\n */\napi.parse = function parse(pointer) {\n    if (pointer === '') { return []; }\n    if (pointer.charAt(0) !== '/') { throw new Error('Invalid JSON pointer:' + pointer); }\n    return pointer.substring(1).split(/\\//).map(api.unescape);\n};\n\n/**\n * Builds a json pointer from a array of reference tokens\n *\n * @param refTokens\n * @returns {string}\n */\napi.compile = function compile(refTokens) {\n    return '/' + refTokens.map(api.escape).join('/');\n};\n//@ sourceURL=manuelstofer-json-pointer/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n/**\n * Bind `el` event `type` to `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.bind = function(el, type, fn, capture){\n  if (el.addEventListener) {\n    el.addEventListener(type, fn, capture || false);\n  } else {\n    el.attachEvent('on' + type, fn);\n  }\n  return fn;\n};\n\n/**\n * Unbind `el` event `type`'s callback `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.unbind = function(el, type, fn, capture){\n  if (el.removeEventListener) {\n    el.removeEventListener(type, fn, capture || false);\n  } else {\n    el.detachEvent('on' + type, fn);\n  }\n  return fn;\n};\n//@ sourceURL=component-event/index.js"
));
require.register("pflock/index.js", Function("exports, require, module",
"module.exports = require('./src/pflock');\n//@ sourceURL=pflock/index.js"
));
require.register("pflock/src/pflock.js", Function("exports, require, module",
"/*global module*/\n\nvar each        = require('foreach'),\n    event       = require('event'),\n    attr        = require('attr'),\n    emitter     = require('emitter'),\n    extend      = require('extend'),\n    jsonpointer = require('json-pointer');\n\nexports = module.exports = pflock;\n\nvar defaults = {\n    events: [\n        'checked',\n        'selected',\n        'input',\n        'change',\n        'read'\n    ],\n    plugins: [\n        './plugins/x-each',\n        './plugins/x-bind'\n    ]\n};\n\n/**\n * Bind data to the document\n *\n * @param element   Root element for bindings\n * @param data      The data to be bound\n * @param options\n * @return {Object}\n */\nfunction pflock (element, data, options) {\n    'use strict';\n\n    element.isPflockRoot = true;\n    element = element || document.body;\n    options = extend({}, defaults, options);\n\n    var instance = emitter({\n            element:        element,\n            data:           data,\n            toDocument:     toDocument,\n            fromDocument:   fromDocument,\n            options:        options\n        }),\n\n        dirty = false;\n\n\n    each(options.plugins, function (plugin) {\n        require(plugin)(instance);\n    });\n\n\n    event.bind(instance.element, 'read', function () {\n        instance.emit('read');\n    });\n\n    instance.emit('init');\n    instance.emit('write');\n\n    instance.on('add-change',   addChange);\n    instance.on('send-changes', sendChanges);\n\n    return instance;\n\n    /**\n     * Write the data to the document\n     *\n     * @param {Object} [replace] replace the used data\n     */\n    function toDocument (replace) {\n        if (replace !== undefined) {\n            instance.data = replace;\n        }\n        instance.emit('write');\n        sendChanges();\n    }\n\n    /**\n     * Returns the data from the document\n     *\n     * @return {Object} the data object\n     */\n    function fromDocument () {\n        instance.emit('read');\n        sendChanges();\n        return instance.data;\n    }\n\n    /**\n     * Writes a value back to the data object\n     *\n     * @param pointer\n     * @param value\n     */\n    function addChange (pointer, value) {\n        var oldValue;\n        if (jsonpointer.has(instance.data, pointer)) {\n            oldValue = jsonpointer.get(instance.data, pointer);\n        }\n        if (oldValue !== value) {\n            jsonpointer.set(instance.data, pointer, value);\n            dirty = true;\n        }\n    }\n\n    /**\n     * Emits changed event if data is dirty\n     *\n     */\n    function sendChanges () {\n        if (dirty) {\n            instance.emit('changed');\n            dirty = false;\n        }\n    }\n}\n//@ sourceURL=pflock/src/pflock.js"
));
require.register("pflock/src/util.js", Function("exports, require, module",
"'use strict';\nvar attr = require('attr'),\n    each = require('foreach');\n\nmodule.exports = {\n    getEventTarget:     getEventTarget,\n    getQueryEngine:     getQueryEngine,\n    isIterable:         isIterable,\n    parseXBind:         parseXBind\n};\n\n\n/**\n * Returns the target of an event\n *\n * @param event\n * @return {Object}\n */\nfunction getEventTarget (event) {\n    return event.target || event.srcElement;\n}\n\n/**\n * Returns the pflock root node of a element,\n * (The DOM Element the pflock instance is bound to)\n * @param el\n */\nfunction getPflockRootElement (el) {\n\n    if (!el.parentNode) {\n        return undefined;\n\n    } else if (el.parentNode.isPflockRoot === true) {\n        return el.parentNode;\n    }\n\n    return getPflockRootElement(el.parentNode);\n}\n\nfunction filterSamePflockRoot (elements, root) {\n    if (!root) { return elements; }\n    var results = [];\n    for (var i = 0; i < elements.length; i++) {\n        if (getPflockRootElement(elements[i]) === root) {\n            results.push(elements[i]);\n        }\n    }\n    return results;\n}\n\n/**\n * Get querySelectorAll with jQuery fallback, if available\n *\n * @param root scope of the query (default to element)\n * @return function\n */\nfunction getQueryEngine (root) {\n    if (root.querySelectorAll) {\n        return function (selector) {\n            return filterSamePflockRoot(\n                [].slice.call(root.querySelectorAll(selector)) || [],\n                root\n            );\n        };\n    }\n    return function (selector) {\n        return filterSamePflockRoot(\n            window.$(root).find(selector).get(),\n            root\n        );\n    };\n}\n\n/**\n * Checks if obj is iterable using each\n *\n * @param obj\n * @return {Boolean}\n */\nfunction isIterable (obj) {\n    return obj instanceof Array || Object.prototype.toString.call(obj) === '[object Object]';\n}\n\n/**\n * Gets the element binding definition\n *\n * @param el\n * @return {Object}\n */\nfunction parseXBind(el) {\n    var bindValue   = attr(el).get('x-bind'),\n        bindParts   = bindValue.split(/:/),\n        attribute   = bindParts.length > 1 ? bindParts.shift(): '',\n        pointer     = bindParts.shift();\n    return {\n        attribute:  attribute,\n        pointer:    pointer,\n        element:    el\n    };\n}//@ sourceURL=pflock/src/util.js"
));
require.register("pflock/src/plugins/x-each.js", Function("exports, require, module",
"'use strict';\nvar attr        = require('attr'),\n    each        = require('foreach'),\n    util        = require('../util'),\n    jsonpointer = require('json-pointer');\n\n/**\n * Pflock plugin that provides the x-each syntax\n *\n * @param instance\n */\nmodule.exports = function (instance) {\n\n    var $ = util.getQueryEngine(instance.element);\n\n    instance.on('write', prepareEachNodes);\n    instance.on('read', readEachNodes);\n\n    function readEachNodes () {\n        each($('[x-each]').sort(cmpNestingLevel), readEachNode);\n        instance.emit('send-changes');\n    }\n\n    function prepareEachNodes () {\n        each($('[x-each]').sort(cmpNestingLevel), prepareEachNode);\n    }\n\n\n    function readEachNode (eachNode) {\n        var pointer = attr(eachNode).get('x-each');\n\n        if (!jsonpointer.has(instance.data, pointer)) {\n            jsonpointer.set(instance.data, pointer, []);\n        }\n\n        var originalData = jsonpointer.get(instance.data, pointer),\n            result       = [],\n            hasChanged   = eachNode.children !== originalData.length;\n\n        each(eachNode.children, function (child, index) {\n\n            if (child.pflockNodeIndex !== index) {\n                hasChanged = true;\n            }\n\n            if (typeof child.pflockNodeIndex !== 'undefined') {\n                result.push(originalData[child.pflockNodeIndex]);\n            } else {\n                result.push({});\n            }\n            child.pflockNodeIndex = index;\n        });\n\n        if (hasChanged) {\n            prepareChildNodes(eachNode, pointer);\n            instance.emit('add-change', pointer, result);\n        }\n    }\n\n    /**\n     * Creates the necessary DOM Structure to match the data of the array\n     * Updates the binding pointer of child x-each and x-bind nodes\n     *\n     * @param eachNode\n     */\n    function prepareEachNode (eachNode) {\n        var pointer = attr(eachNode).get('x-each');\n        if (jsonpointer.has(instance.data, pointer)) {\n            var elData = jsonpointer.get(instance.data, pointer);\n            if (elData) {\n                createChildNodes(eachNode, elData);\n                prepareChildNodes(eachNode, pointer);\n            }\n        }\n    }\n\n    /**\n     * Adds removes child nodes to match the amount of elements in the array\n     *\n     * @param container\n     * @param data\n     */\n    function createChildNodes (container, data) {\n        var children = container.children,\n            templateNode = getTemplateNode(container);\n\n        // if there are too many elements the last ones are removed\n        while (children.length > data.length) {\n            container.removeChild(children[children.length - 1]);\n        }\n\n        // the first element is cloned and appended at the end until\n        // the number of children matches the amount of items in the array\n        while (children.length < data.length) {\n            var clone = templateNode.cloneNode(true);\n            container.appendChild(clone);\n        }\n    }\n\n    /**\n     * Updates the pointer of child nodes of a x-each node\n     *\n     * @param container\n     * @param pointer\n     */\n    function prepareChildNodes (container, pointer) {\n        var children = container.children;\n        each(children, function (childNode, childIndex) {\n            var $$= util.getQueryEngine(childNode),\n                childBinds  = $$('[x-bind]'),\n                childEach   = attr(childNode).has('x-each') ? childNode : $$('[x-each]')[0];\n\n            childNode.pflockNodeIndex = childIndex;\n\n            if (attr(childNode).has('x-bind')) {\n                childBinds.push(childNode);\n            }\n            each(childBinds, function (childBind) {\n                setBindingPointer(childBind, pointer, childIndex);\n            });\n\n            if (childEach) {\n                setEachPointer(childEach, pointer, childIndex);\n                prepareEachNode(childEach);\n            }\n        });\n    }\n\n    /**\n     * Returns the template node of a x-each node\n     *\n     * @param container\n     * @return Template node\n     */\n    function getTemplateNode(container) {\n        container.pflockTemplateNode = container.pflockTemplateNode || container.children[0];\n        if (!container.pflockTemplateNode) {\n            throw new Error('x-each needs a template node');\n        }\n        return container.pflockTemplateNode;\n    }\n\n    /**\n     * Updates the each pointer of sub x-each node\n     *\n     * @param el\n     * @param prefix\n     * @param index\n     */\n    function setEachPointer (el, prefix, index) {\n        var pointer = attr(el).get('x-each');\n        attr(el).set('x-each', replaceIndex(prefix, index, pointer));\n    }\n\n    /**\n     * Update the binding pointer of a node in a x-each\n     *\n     * @param el\n     * @param prefixPointer\n     * @param index\n     */\n    function setBindingPointer (el, prefixPointer, index) {\n        var binding     = util.parseXBind(el),\n            attribute   = binding.attribute ? binding.attribute + ':' : '',\n            newBinding  = attribute + replaceIndex(prefixPointer, index, binding.pointer);\n       attr(el).set('x-bind', newBinding);\n    }\n\n    /**\n     * Replace an index of a pointer\n     *\n     * @param prefix\n     * @param index\n     * @param pointer\n     * @return {*}\n     */\n    function replaceIndex (prefix, index, pointer) {\n        if (pointer.indexOf(prefix) === 0) {\n            var restPointer = pointer.substr(prefix.length);\n            return prefix + restPointer.replace(/^\\/[^\\/]+/, '/' + index);\n        }\n        return pointer;\n    }\n\n    /**\n     * Gets the nesting level of DOM Element.\n     * - Required for sorting processing order of x-each\n     *\n     * @param el\n     * @param n\n     * @return {*}\n     */\n    function getNestingLevel (el, n) {\n        n = n || 0;\n        if (el.parentNode) {\n            return getNestingLevel(el.parentNode, n + 1);\n        }\n        return n;\n    }\n\n    /**\n     * Compare function to sort DOM elements by nesting level\n     *\n     * @param el1\n     * @param el2\n     * @return {*}\n     */\n    function cmpNestingLevel(el1, el2) {\n        return getNestingLevel(el1) - getNestingLevel(el2);\n    }\n};\n//@ sourceURL=pflock/src/plugins/x-each.js"
));
require.register("pflock/src/plugins/x-bind.js", Function("exports, require, module",
"var each = require('foreach'),\n    attr = require('attr'),\n    event = require('event'),\n    util = require('../util'),\n    jsonpointer = require('json-pointer');\n\n/**\n * Pflock plugin: provides x-bind syntax\n *\n * @param instance\n */\nmodule.exports = function (instance) {\n    'use strict';\n\n    var $ = util.getQueryEngine(instance.element);\n\n    instance.on('init', setupEvents);\n    instance.on('write', function () {\n        jsonpointer.walk(instance.data, function (value, pointer) {\n            writeToDocument(value, pointer);\n        });\n    });\n\n    instance.on('read', readFromDocument);\n\n    /**\n     * Adds the required event listeners\n     */\n    function setupEvents () {\n        var events = instance.options.events;\n        each(events, function (eventName) {\n            event.bind(instance.element, eventName, function (event) {\n                if (util.getEventTarget(event).attributes['x-bind'] !== undefined) {\n                    handleEvent(event);\n                }\n            });\n        });\n    }\n\n    /**\n     * Handles changes in document\n     *\n     * @param event\n     */\n    function handleEvent (event) {\n        var target  = util.getEventTarget(event),\n            binding = util.parseXBind(target),\n            value   = readElement(target, binding.attribute);\n\n        writeToDocument(value, binding.pointer, binding.element);\n        instance.emit('add-change', binding.pointer, value);\n        instance.emit('send-changes');\n\n        event.stopPropagation();\n    }\n\n    function readFromDocument () {\n        each($('[x-bind]'), function (el) {\n            var binding = util.parseXBind(el),\n                value   = readElement(el, binding.attribute);\n            instance.emit('add-change', binding.pointer, value);\n        });\n    }\n\n    /**\n     * Reads the current value of an element\n     *\n     * @param el\n     * @param attribute\n     * @return {String}\n     */\n    function readElement (el, attribute) {\n        if (attribute === 'value') {\n            if (el.type === 'checkbox') {\n                return el.checked;\n            }\n            return el.value;\n        }\n        if (attribute === '') {\n            return el.innerHTML;\n        }\n        return attr(el).get(attribute);\n    }\n\n    /**\n     * Writes a value to all elements bound to pointer\n     *\n     * @param value\n     * @param pointer\n     * @param src\n     */\n    function writeToDocument (value, pointer, src) {\n        each($('[x-bind]'), function (el) {\n            if (el !== src) {\n                var currentBinding = util.parseXBind(el);\n                if (pointer === currentBinding.pointer) {\n                    writeToElement(el, value);\n                }\n            }\n        });\n    }\n\n    /**\n     * Writes a value to an element\n     *\n     * @param el\n     * @param value\n     */\n    function writeToElement(el, value) {\n        var binding = util.parseXBind(el),\n            attribute = binding.attribute;\n\n        if (attribute === 'value') {\n            if (el.type === 'checkbox') {\n                el.checked = !!value;\n            } else {\n                el.value = value;\n            }\n        } else if(attribute === '') {\n            if (el.innerHTML !== value) {\n                el.innerHTML = value;\n            }\n        } else {\n            attr(el).set(attribute, value);\n        }\n    }\n};\n//@ sourceURL=pflock/src/plugins/x-bind.js"
));
require.alias("matthewp-attr/index.js", "pflock/deps/attr/index.js");

require.alias("component-emitter/index.js", "pflock/deps/emitter/index.js");

require.alias("manuelstofer-foreach/index.js", "pflock/deps/foreach/index.js");

require.alias("manuelstofer-extend/index.js", "pflock/deps/extend/index.js");
require.alias("manuelstofer-foreach/index.js", "manuelstofer-extend/deps/foreach/index.js");

require.alias("manuelstofer-json-pointer/index.js", "pflock/deps/json-pointer/index.js");
require.alias("manuelstofer-foreach/index.js", "manuelstofer-json-pointer/deps/foreach/index.js");

require.alias("component-event/index.js", "pflock/deps/event/index.js");

