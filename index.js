/*global module*/
var each    = require('each'),
    attr    = require('attr'),
    val     = require('val');

exports = module.exports = pflock;

function pflock(element, data) {
    'use strict';

    element = element || document.body;

    var $ = getQueryEngine();
    setupEvents();

    return {
        toDocument: toDocument
    };

    function toDocument () {

    }

    function fromDocument (event) {
        var target = event.target || event.srcElement,
            binding = getElementBinding(target),
            value = readAttribute(target, binding.attribute);
        writeToOther(binding, value);
    }

    /**
     * Get querySelectorAll with jQuery fallback, if available
     *
     * @return function
     */
    function getQueryEngine () {
        if (element.querySelectorAll) {
            return element.querySelectorAll.bind(element);
        }
        return function (selector) {
            return window.$(element).find(selector).get();
        };
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
     * Reads the current value of an element
     *
     * @param el
     * @param attribute
     * @return {*}
     */
    function readAttribute (el, attribute) {
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
    function writeAttribute(el, value) {
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
    function writeToOther (binding, value) {
        each($('[x-bind]'), function (el) {
            if (el !== binding.element) {
                var currentBinding = getElementBinding(el);
                if (binding.path === currentBinding.path) {
                    writeAttribute(el, value);
                }
            }
        });
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
            /*'DOMSubtreeModified',
             'DOMAttrModified',
             'DOMAttributeNameChanged',
             'DOMCharacterDataModified',
             'DOMElementNameChanged',
             'DOMNodeInserted',
             'DOMNodeInsertedIntoDocument',
             'DOMNodeRemoved',
             'DOMNodeRemovedFromDocument',
             'DOMSubtreeModified'*/
        ];

        each(events, function (eventName) {
            element.addEventListener(eventName, function (event) {
                fromDocument(event);
            });
        });
    }
}

