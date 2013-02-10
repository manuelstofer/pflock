/*global module*/
var each    = require('each'),
    attr    = require('attr'),
    val     = require('val');

exports = module.exports = pflock;

function pflock (element, data) {
    'use strict';

    element = element || document.body;

    var $ = getQueryEngine();
    setupEvents();
    toDocument();

    return {
        toDocument: toDocument
    };

    function toDocument () {
        var values = toPathValueHash(data);
        each(values, function (value, path) {
            updateDocument(path, value);
        });
    }

    function fromDocument (event) {
        var target = event.target || event.srcElement,
            binding = getElementBinding(target),
            value = readElement(target, binding.attribute);
        updateDocument(binding.path, value, binding.element);
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
     * Writes a read value of a binding to other
     * elements with the same path
     *
     * @param binding
     * @param value
     */
    function updateDocument (path, value, src) {
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

    function isIterable (obj) {
        return obj instanceof Array || obj === Object(obj);
    }

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
