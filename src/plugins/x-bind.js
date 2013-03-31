var each = require('foreach'),
    attr = require('attr'),
    event = require('event'),
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

    instance.on('read', readFromDocument);

    /**
     * Adds the required event listeners
     */
    function setupEvents () {
        var events = instance.options.events;
        each(events, function (eventName) {
            event.bind(instance.element, eventName, function (event) {
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
        instance.emit('add-change', binding.path, value);
        instance.emit('send-changes');

        event.stopPropagation();
    }

    function readFromDocument () {
        each($('[x-bind]'), function (el) {
            var binding = util.parseXBind(el),
                value   = readElement(el, binding.attribute);
            instance.emit('add-change', binding.path, value);
        });
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
            return el.value;
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
                el.value = value;
            }
        } else if(attribute === '') {
            if (el.innerHTML !== value) {
                el.innerHTML = value;
            }
        } else {
            attr(el).set(attribute, value);
        }
    }
};
