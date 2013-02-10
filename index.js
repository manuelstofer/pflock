/*global module*/

var each    = require('each'),
    attr    = require('attr'),
    val     = require('val'),
    emitter = require('emitter');

exports = module.exports = pflock;

function pflock (element, data) {
    'use strict';

    element = element || document.body;

    var $ = getQueryEngine();

    var api = {
        toDocument: toDocument
    };

    emitter(api);
    setupEvents();
    toDocument();

    return api;


    function toDocument () {
        var values = toPathValueHash(data);
        each(values, updateDocument);
    }

    function fromDocument (event) {
        var target  = event.target || event.srcElement,
            binding = getElementBinding(target),
            value   = readElement(target, binding.attribute);
        updateDocument(value, binding.path, binding.element);
        toData(binding.path, value);
        api.emit('changed', binding.path, value);
    }

    /**
     * Reads the current value of an element
     *
     * @param el
     * @param attribute
     * @return {*}
     */
    function readElement (el, attribute) {
        if (attribute === 'value') {
            return val(el);
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
            return val(el, value);
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
     * @param path
     * @param value
     */
    function toData (path, value) {
        var pathParts = path
                .replace(/^\.+/, '')
                .replace(/\.+$/, '')
                .split(/\./),
            obj = data,
            part;

        while (pathParts.length > 1) {
            part = pathParts.shift();
            obj = obj[part] || (obj = obj[part] = {});
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
        var events = [
            'checked',
            'selected',
            'input',
            'change'
        ];

        each(events, function (eventName) {
            element.addEventListener(eventName, function (event) {
                fromDocument(event);
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
     *
     * @param data
     * @return {Object}
     */
    function toPathValueHash (data) {
        var result = {};
        function convert (obj, path) {
            each(obj, function (item, key) {
                if (isIterable(item)) {
                    convert(item, path + '.' + key);
                } else {
                    result[path + '.' + key] = item;
                }
            });
        }
        convert(data, '');
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
}
