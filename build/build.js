

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
require.register("pflock/index.js", function(exports, require, module){
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
    options = extend(defaults, options);

    var $ = getQueryEngine();

    var api = {
        toDocument:     toDocument,
        fromDocument:   fromDocument
    };

    emitter(api);
    setupEvents();
    toDocument();

    return api;

    /**
     * Write the data to the document
     *
     * @param {Object} [replace] replace the used data
     */
    function toDocument (replace) {
        if (replace !== undefined) {
            data = replace;
        }
        each(toPathValueHash(data), updateDocument);
    }

    /**
     * Returns the data from the document
     *
     * @return {Object} the data object
     */
    function fromDocument () {
       return data;
    }

    /**
     * Handles changes in document
     *
     * @param event
     */
    function handleEvent (event) {
        var target  = getEventTarget(event),
            binding = getElementBinding(target),
            value   = readElement(target, binding.attribute);
        updateDocument(value, binding.path, binding.element);

        if (options.updateData) {
            toData(binding.path, value);
        }
        api.emit('changed', binding.path, value);
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
            return val(el).value();
        }
        if (attribute === '') {
            return el.innerHTML;
        }
        return attr(el, attribute);
    }

    /**
     * Writes a value to an element
     *
     * @param el
     * @param value
     */
    function writeToElement(el, value) {
        var binding = getElementBinding(el),
            attribute = binding.attribute;

        if (attribute === 'value') {
            return val(el).value(value);
        }
        if (attribute === '') {
            el.innerHTML = value;
        }
        attr(el, attribute, value);
    }

    /**
     * Writes a value to all elements bound to path
     *
     * @param value
     * @param path
     * @param src
     */
    function updateDocument (value, path, src) {
        each($('[x-bind]'), function (el) {
            if (el !== src) {
                var currentBinding = getElementBinding(el);
                if (path === currentBinding.path) {
                    writeToElement(el, value);
                }
            }
        });
    }

    /**
     * Writes a value back to the data object
     *
     * @param path
     * @param value
     */
    function toData (path, value) {
        var pathParts = path.split(/\./),
            obj = data,
            part;

        while (pathParts.length > 1) {
            part = pathParts.shift();
            obj = obj[part] || (obj = obj[part] = {});
        }
        obj[pathParts.shift()] = value;
    }

    /**
     * Gets the element binding definition
     *
     * @param el
     * @return {Object}
     */
    function getElementBinding(el) {
        var bindValue       = el.attributes['x-bind'].value,
            bindParts       = bindValue.split(/:/),
            attribute       = bindParts.length > 1 ? bindParts.shift(): '',
            path            = bindParts.shift();
        return {
            attribute: attribute,
            path: path,
            element: el
        };
    }

    /**
     * Adds the required event listeners
     */
    function setupEvents () {
        each(options.events, function (eventName) {
            element.addEventListener(eventName, function (event) {
                if (getEventTarget(event).attributes['x-bind'] !== undefined) {
                    handleEvent(event);
                }
            });
        });
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
     * Get querySelectorAll with jQuery fallback, if available
     *
     * @return function
     */
    function getQueryEngine () {
        if (element.querySelectorAll) {
            return function (selector) {
                return element.querySelectorAll(selector);
            };
        }
        return function (selector) {
            return window.$(element).find(selector).get();
        };
    }

    /**
     * Returns the target of an event
     *
     * @param event
     * @return {*|Object}
     */
    function getEventTarget (event) {
        return event.target || event.srcElement;
    }
}

});
require.alias("manuelstofer-each/index.js", "pflock/deps/each/index.js");

require.alias("nickjackson-val/index.js", "pflock/deps/val/index.js");

require.alias("manuelstofer-extend/index.js", "pflock/deps/extend/index.js");
require.alias("manuelstofer-each/index.js", "manuelstofer-extend/deps/each/index.js");

require.alias("matthewp-attr/index.js", "pflock/deps/attr/index.js");

require.alias("component-emitter/index.js", "pflock/deps/emitter/index.js");

