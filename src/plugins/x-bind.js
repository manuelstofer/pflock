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
