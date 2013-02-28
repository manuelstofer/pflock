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
        updateCollections();
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
     * Writes a value to an element
     *
     * @param el
     * @param value
     */
    function writeToElement(el, value) {
        var binding = getElementBinding(el),
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

    /**
     * Adds / removes childNodes for items in x-each
     * Updates all bound path
     *
     * @todo Support the same for objects and allow to bindings of keys
     * @todo Support nested each bindings
     */
    function updateCollections () {

        each($('[x-each]'), function (container) {

            var path        = attr(container).get('x-each'),
                elData      = resolvePath(path),
                children    = container.children;

            container.pflockTemplateNode = container.pflockTemplateNode || children[0];

            if (!container.pflockTemplateNode) {
                throw new Error('x-each needs a template node');
            }

            // if there are too elements the last ones are removed
            while (children.length > elData.length) {
                container.removeChild(children[children.length - 1]);
            }

            // the first element is cloned and appended at the end until
            // the number of children matches the amount of items in the array
            while (children.length < elData.length) {
                container.appendChild(container.pflockTemplateNode.cloneNode(true));
            }

            // the path is updated on all child elements
            each(elData, function (childData, childIndex) {
                var childNode = children[childIndex],
                    $$        = getQueryEngine(childNode),
                    bindings  = $$('[x-bind]');

                if (attr(childNode, 'x-bind')) {
                    setBindPrefix(childNode, path, childIndex);
                }
                each(bindings, function (boundElement) {
                    setBindPrefix(boundElement, path, childIndex);
                });
            });
        });
    }

    /**
     * Update the binding path of a node in a x-each
     *
     * @param el
     * @param eachPrefix
     * @param index
     */
    function setBindPrefix (el, eachPrefix, index) {
        var binding         = getElementBinding(el),
            path            = binding.path,
            testPathPrefix  = path.substr(0, eachPrefix.length);

        if (testPathPrefix === eachPrefix) {
            var subPath     = path.substr(eachPrefix.length),
                newSubPath  = subPath.replace(/^\.[^\.]+\./, '.' + index + '.'),
                newPath     = eachPrefix + newSubPath;
            attr(el).set('x-bind', newPath);
        }
    }

    /**
     * Resolves a path in the data object
     *
     * @param path
     * @return {*}
     */
    function resolvePath (path) {
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
     * @param from scope of the query (default to element)
     * @return function
     */
    function getQueryEngine (from) {
        from = from || element;
        if (from.querySelectorAll) {
            return function (selector) {
                return from.querySelectorAll(selector);
            };
        }
        return function (selector) {
            return window.$(from).find(selector).get();
        };
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
}
