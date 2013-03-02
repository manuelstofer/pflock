

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
require.register("nickjackson-val/index.js", function(exports, require, module){
/**
 * Initalizes and returns the correct API
 * for the specified `el`.
 *
 * @param {Element} el
 * @return {Mixed}
 * @api public
 */

module.exports = function Val(el) {
  if (!el) throw Error('no el specified');

  var fn;
  var type = nodeType(el);

  switch (type) {
    case 'text':
      fn = new TextAPI(el);
      break;

    case 'checkbox':
      fn = new CheckboxAPI(el);
      break;

    case 'textarea':
      fn = new TextareaAPI(el);
      break;

    case 'select':
      fn = new SelectAPI(el);
      break;

    default:
      throw new Error(el.nodeName + ' not supported!');
  }

  fn.type = type;
  return fn;
}


/**
 * Returns a single string to identify the
 * current `el`
 *
 * @param {Element} el
 * @return {String} node
 * @api private
 */

function nodeType(el){
  var node = el.nodeName.toLowerCase();
  var type = el.type;

  if (node == 'select') return 'select';
  if (node == 'textarea') return 'textarea';
  if (node == 'input') {
    if (type == 'text') return 'text';
    if (type == 'checkbox') return 'checkbox';
  }
  return;
}


/**
 * Initalizes a new `TextAPI` with `el`
 * `<input type="text">`
 *
 * @param {Element} el
 * @api private
 */

function TextAPI(el){
  this.el = el;
}


/**
 * Getter/Setter for the value of textbox:
 * - Set by providing `string`
 * - Get by providing no args
 *
 * @param {String} string
 * @return {TextAPI}
 * @api public
 */

TextAPI.prototype.value = function(string){
  if (typeof string === 'undefined'){
    return this.el.value;
  }

  this.el.setAttribute('value', string);
  return this;
}




/**
 * Initalizes a new `CheckboxAPI` with `el`
 * `<input type="checkbox">`
 *
 * @param {Element} el
 * @api private
 */

function CheckboxAPI(el){
  this.el = el;
}


/**
 * Getter/Setter for the value of a checkbox:
 * - Set by providing `string`
 * - Gets element value or true if item is checked
 *   otherwise it is undefined
 *
 * @param {String} string
 * @return {CheckboxAPI} for chaining
 * @api public
 */

CheckboxAPI.prototype.value = function(string){
  if (typeof string === 'undefined'){
    return this.checked() ? this.el.value || true : undefined;
  }

  this.el.setAttribute('value', string);
  return this;
}


/**
 * Getter/Setter for the checked state of a checkbox:
 * - Set by providing a boolean to `state`
 * - Get by providing no args
 *
 * @param {Boolean} state
 * @return {CheckboxAPI} for chaining
 * @api public
 */

CheckboxAPI.prototype.checked = function(state){
  if (typeof state === 'undefined'){
    return this.el.checked ? true : false
  }

  if (state == true) {
    this.el.setAttribute('checked', 'checked');
  }

  if (state == false) {
    this.el.removeAttribute('checked');
  }

  return this;
}


/**
 * Gets the value of a checkbox if it was checked
 *
 * @param {Boolean} state
 * @return {String}
 * @api public
 */

CheckboxAPI.prototype.checkedValue = function(){
  return this.el.value;
}


/**
 * Initalizes a new `TextareaAPI` with `el`
 * `<textarea>`
 *
 * @param {Element} el
 * @api private
 */

function TextareaAPI(el){
  this.el = el;
}


/**
 * Getter/Setter for the value of a textarea:
 * - Set by providing `string`
 * - Get by providing no args
 *
 * @param {String} string
 * @return {TextareaAPI}
 * @api public
 */

TextareaAPI.prototype.value = function(string){
  if (typeof string === 'undefined'){
    return this.el.value;
  }

  this.el.value = string;
  return this;
}




/**
 * Initalizes a new `SelectAPI` with `el`
 * `<select>`
 *
 * @param {Element} el
 * @api private
 */

function SelectAPI(el){
  this.el = el;
  this.options = [];

  // loop through select el option attributes and
  // find dom <option> and store in options array.
  for (var i=0; i < el.options.length; i++) {
    var opt = el.options[i];
    if (opt.nodeType == 1) {
      if (opt.selected) this.selected = opt;
      this.options.push(opt);
    }
  };
}


/**
 * Getter/Setter for the selected option:

 * @params {string} selector `type`
 * @param {String} string
 * @return {SelectAPI}
 * @api private
 */

SelectAPI.prototype.select = function(type, string) {
  if (typeof string === 'undefined'){
    return this.selected[type];
  }

  this.options.forEach(function(option){
    option.selected = (option[type] == string);
  })

  return this;
}


/**
 * Getter/Setter for the value of a select:
 * - Set by providing `string`
 * - Get by providing no args
 *
 * @param {String} string
 * @return {SelectAPI}
 * @api public
 */

SelectAPI.prototype.value = function(string){
  return this.select.call(this, 'value', string);
}


/**
 * Getter/Setter for the text of a select:
 * - Set by providing `string`
 * - Get by providing no args
 *
 * @param {String} string
 * @return {SelectAPI}
 * @api public
 */

SelectAPI.prototype.text = function(string){
  return this.select.call(this, 'innerText', string);
}
});
require.register("matthewp-attr/index.js", function(exports, require, module){
/*
** Fallback for older IE without get/setAttribute
 */
function fetch(el, attr) {
  var attrs = el.attributes;
  for(var i = 0; i < attrs.length; i++) {
    if (attr[i] !== undefined) {
      if(attr[i].nodeName === attr) {
        return attr[i];
      }
    }
  }
  return null;
}

function Attr(el) {
  this.el = el;
}

Attr.prototype.get = function(attr) {
  return (this.el.getAttribute && this.el.getAttribute(attr))
    || fetch(this.el, attr).value;
};

Attr.prototype.set = function(attr, val) {
  if(this.el.setAttribute) {
    this.el.setAttribute(attr, val);
  } else {
    fetch(this.el, attr).value = val;
  }
  
  return this;
};

Attr.prototype.has = function(attr) {
  return (this.el.hasAttribute && this.el.hasAttribute(attr))
    || fetch(this.el, attr) !== null;
};

module.exports = function(el) {
  return new Attr(el);
};

module.exports.Attr = Attr;

});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = callbacks.indexOf(fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("manuelstofer-each/index.js", function(exports, require, module){
"use strict";

var nativeForEach = [].forEach;

// Underscore's each function
module.exports = function (obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (iterator.call(context, obj[i], i, obj) === {}) return;
        }
    } else {
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === {}) return;
            }
        }
    }
};

});
require.register("manuelstofer-extend/index.js", function(exports, require, module){
"use strict";
var each = require('each'),
    slice = [].slice;

// Extend a given object with all the properties in passed-in object(s).
module.exports = function (obj) {
    each(slice.call(arguments, 1), function (source) {
        for (var prop in source) {
            obj[prop] = source[prop];
        }
    });
    return obj;
};

});
require.register("pflock/index.js", function(exports, require, module){
module.exports = require('./src/pflock');

});
require.register("pflock/src/pflock.js", function(exports, require, module){
/*global module*/

var each    = require('each'),
    attr    = require('attr'),
    val     = require('val'),
    emitter = require('emitter'),
    extend  = require('extend');

exports = module.exports = pflock;

var defaults = {
    updateData: true,
    events: [
        'checked',
        'selected',
        'input',
        'change'
    ],
    plugins: [
        './plugins/x-each',
        './plugins/x-bind'
    ]
};

/**
 * Bind data to the document
 *
 * @param element   Root element for bindings
 * @param data      The data to be bound
 * @param options
 * @return {Object}
 */
function pflock (element, data, options) {
    'use strict';

    element = element || document.body;
    options = extend({}, defaults, options);

    var instance = emitter({
        element:        element,
        data:           data,
        toDocument:     toDocument,
        fromDocument:   fromDocument,
        options:        options
    });


    each(options.plugins, function (plugin) {
        require(plugin)(instance);
    });

    instance.emit('init');
    instance.emit('write');
    instance.on('document-change', toData);

    return instance;

    /**
     * Write the data to the document
     *
     * @param {Object} [replace] replace the used data
     */
    function toDocument (replace) {
        if (replace !== undefined) {
            instance.data = replace;
        }
        instance.emit('write');
    }

    /**
     * Returns the data from the document
     *
     * @return {Object} the data object
     */
    function fromDocument () {
        instance.emit('read');
        return instance.data;
    }

    /**
     * Writes a value back to the data object
     *
     * @param path
     * @param value
     */
    function toData (path, value) {
        if (instance.options.updateData) {
            var pathParts = path.split(/\./),
                obj = instance.data,
                part;

            while (pathParts.length > 1) {
                part = pathParts.shift();
                obj = obj[part] || (obj = obj[part] = {});
            }
            obj[pathParts.shift()] = value;
        }
        instance.emit('changed', path, value);
    }
}

});
require.register("pflock/src/util.js", function(exports, require, module){
'use strict';
var attr = require('attr'),
    each = require('each');

module.exports = {
    resolvePath:        resolvePath,
    getEventTarget:     getEventTarget,
    getQueryEngine:     getQueryEngine,
    isIterable:         isIterable,
    toPathValueHash:    toPathValueHash,
    parseXBind:         parseXBind
};


/**
 * Resolves a path in the data object
 *
 * @param path
 * @param data
 * @return {*}
 */
function resolvePath (path, data) {
    var objects = data,
        pathParts = path.split(/\./),
        part;
    // get the good part of data (theorically an array)
    while (pathParts.length > 0) {
        part = pathParts.shift();
        objects = objects[part] || (objects = objects[part] = {});
    }
    return objects;
}

/**
 * Returns the target of an event
 *
 * @param event
 * @return {Object}
 */
function getEventTarget (event) {
    return event.target || event.srcElement;
}

/**
 * Get querySelectorAll with jQuery fallback, if available
 *
 * @param from scope of the query (default to element)
 * @return function
 */
function getQueryEngine (from) {
    if (from.querySelectorAll) {
        return function (selector) {
            return [].slice.call(from.querySelectorAll(selector)) || [];
        };
    }
    return function (selector) {
        return window.$(from).find(selector).get();
    };
}

/**
 * Checks if obj is iterable using each
 *
 * @param obj
 * @return {Boolean}
 */
function isIterable (obj) {
    return obj instanceof Array || obj === Object(obj);
}

/**
 * Converts the object data to a hash with path and value
 *
 * Example:
 *  toPathValue({user: 'test', foo: {bla: 'word'}})
 * Returns:
 *  {
     *      'user': 'test',
     *      'foo.bla': 'word'
     *  }
 *
 * @param data
 * @return {Object}
 */
function toPathValueHash (data) {
    var result = {};
    function convert (obj, path) {
        each(obj, function (item, key) {
            var itemPath = (path ? path + '.' : '') + key;
            if (isIterable(item)) {
                convert(item, itemPath);
            } else {
                result[itemPath] = item;
            }
        });
    }
    convert(data);
    return result;
}

/**
 * Gets the element binding definition
 *
 * @param el
 * @return {Object}
 */
function parseXBind(el) {
    var bindValue   = attr(el).get('x-bind'),
        bindParts   = bindValue.split(/:/),
        attribute   = bindParts.length > 1 ? bindParts.shift(): '',
        path        = bindParts.shift();
    return {
        attribute:  attribute,
        path:       path,
        element:    el
    };
}
});
require.register("pflock/src/plugins/x-each.js", function(exports, require, module){
'use strict';
var attr    = require('attr'),
    each    = require('each'),
    util    = require('../util');

/**
 * Pflock plugin that provides the x-each syntax
 *
 * @param instance
 */
module.exports = function (instance) {

    var $ = util.getQueryEngine(instance.element);

    instance.on('write', prepareEachNodes);

    function prepareEachNodes () {
        each($('[x-each]').sort(cmpNestingLevel), prepareEachNode);
    }

    /**
     * Creates the necessary DOM Structure to match the data of the array
     * Updates the binding path of child x-each and x-bind nodes
     *
     * @param eachNode
     */
    function prepareEachNode (eachNode) {
        var path         = attr(eachNode).get('x-each'),
            elData       = util.resolvePath(path, instance.data),
            children     = eachNode.children;

        createChildNodes(eachNode, elData);
        prepareChildNodes(children, elData, path);
    }

    /**
     * Adds removes child nodes to match the amount of elements in the array
     *
     * @param container
     * @param data
     */
    function createChildNodes (container, data) {
        var children = container.children,
            templateNode = getTemplateNode(container);

        // if there are too elements the last ones are removed
        while (children.length > data.length) {
            container.removeChild(children[children.length - 1]);
        }

        // the first element is cloned and appended at the end until
        // the number of children matches the amount of items in the array
        while (children.length < data.length) {
            var clone = templateNode.cloneNode(true);
            container.appendChild(clone);
        }
    }

    /**
     * Updates the path of child nodes of a x-each node
     *
     * @param children
     * @param data
     * @param path
     */
    function prepareChildNodes (children, data, path) {
        each(data, function (childData, childIndex) {
            var childNode   = children[childIndex],
                $$          = util.getQueryEngine(childNode),
                childBinds  = $$('[x-bind]'),
                childEach   = attr(childNode).has('x-each') ? childNode : $$('[x-each]')[0];

            if (attr(childNode).has('x-bind')) {
                childBinds.push(childNode);
            }
            each(childBinds, function (childBind) {
                setBindingPath(childBind, path, childIndex);
            });

            if (childEach) {
                setEachPath(childEach, path, childIndex);
                prepareEachNode(childEach);
            }
        });
    }

    /**
     * Returns the template node of a x-each node
     *
     * @param container
     * @return Template node
     */
    function getTemplateNode(container) {
        container.pflockTemplateNode = container.pflockTemplateNode || container.children[0];
        if (!container.pflockTemplateNode) {
            throw new Error('x-each needs a template node');
        }
        return container.pflockTemplateNode;
    }

    /**
     * Updates the each path of sub x-each node
     *
     * @param el
     * @param prefix
     * @param index
     */
    function setEachPath (el, prefix, index) {
        var path = attr(el).get('x-each');
        attr(el).set('x-each', replaceIndex(prefix, index, path));
    }

    /**
     * Update the binding path of a node in a x-each
     *
     * @param el
     * @param prefixPath
     * @param index
     */
    function setBindingPath (el, prefixPath, index) {
        var binding     = util.parseXBind(el),
            attribute   = binding.attribute ? binding.attribute + ':' : '',
            newBinding  = attribute + replaceIndex(prefixPath, index, binding.path);
       attr(el).set('x-bind', newBinding);
    }

    /**
     * Replace an index of a path
     *
     * @param prefix
     * @param index
     * @param path
     * @return {*}
     */
    function replaceIndex(prefix, index, path) {
        if (path.indexOf(prefix) === 0) {
            var restPath = path.substr(prefix.length);
            return prefix + restPath.replace(/^\.[^\.]/, '.' + index);
        }
        return path;
    }

    /**
     * Gets the nesting level of DOM Element.
     * - Required for sorting processing order of x-each
     *
     * @param el
     * @param n
     * @return {*}
     */
    function getNestingLevel (el, n) {
        n = n || 0;
        if (el.parentNode) {
            return getNestingLevel(el.parentNode, n + 1);
        }
        return n;
    }

    /**
     * Compare function to sort DOM elements by nesting level
     *
     * @param el1
     * @param el2
     * @return {*}
     */
    function cmpNestingLevel(el1, el2) {
        return getNestingLevel(el1) - getNestingLevel(el2);
    }
};

});
require.register("pflock/src/plugins/x-bind.js", function(exports, require, module){
var each = require('each'),
    attr = require('attr'),
    val  = require('val'),
    util = require('../util');

/**
 * Pflock plugin: provides x-bind syntax
 *
 * @param instance
 */
module.exports = function (instance) {
    'use strict';

    var $ = util.getQueryEngine(instance.element);

    instance.on('init', setupEvents);
    instance.on('write', function () {
        each(util.toPathValueHash(instance.data), writeToDocument);
    });

    /**
     * Adds the required event listeners
     */
    function setupEvents () {
        var events = instance.options.events;
        each(events, function (eventName) {
            instance.element.addEventListener(eventName, function (event) {
                if (util.getEventTarget(event).attributes['x-bind'] !== undefined) {
                    handleEvent(event);
                }
            });
        });
    }

    /**
     * Handles changes in document
     *
     * @param event
     */
    function handleEvent (event) {
        var target  = util.getEventTarget(event),
            binding = util.parseXBind(target),
            value   = readElement(target, binding.attribute);
        writeToDocument(value, binding.path, binding.element);

        instance.emit('document-change', binding.path, value);
        event.stopPropagation();
    }

    /**
     * Reads the current value of an element
     *
     * @param el
     * @param attribute
     * @return {String}
     */
    function readElement (el, attribute) {
        if (attribute === 'value') {
            if (el.type === 'checkbox') {
                return el.checked;
            }
            return val(el).value();
        }
        if (attribute === '') {
            return el.innerHTML;
        }
        return attr(el).get(attribute);
    }

    /**
     * Writes a value to all elements bound to path
     *
     * @param value
     * @param path
     * @param src
     */
    function writeToDocument (value, path, src) {
        each($('[x-bind]'), function (el) {
            if (el !== src) {
                var currentBinding = util.parseXBind(el);
                if (path === currentBinding.path) {
                    writeToElement(el, value);
                }
            }
        });
    }

    /**
     * Writes a value to an element
     *
     * @param el
     * @param value
     */
    function writeToElement(el, value) {
        var binding = util.parseXBind(el),
            attribute = binding.attribute;

        if (attribute === 'value') {
            if (el.type === 'checkbox') {
                el.checked = !!value;
            } else {
                val(el).value(value);
            }
        } else if(attribute === '') {
            el.innerHTML = value;
        } else {
            attr(el).set(attribute, value);
        }
    }
};

});
require.alias("nickjackson-val/index.js", "pflock/deps/val/index.js");

require.alias("matthewp-attr/index.js", "pflock/deps/attr/index.js");

require.alias("component-emitter/index.js", "pflock/deps/emitter/index.js");

require.alias("manuelstofer-each/index.js", "pflock/deps/each/index.js");

require.alias("manuelstofer-extend/index.js", "pflock/deps/extend/index.js");
require.alias("manuelstofer-each/index.js", "manuelstofer-extend/deps/each/index.js");

