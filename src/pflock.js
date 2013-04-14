/*global module*/

var each        = require('foreach'),
    event       = require('event'),
    emitter     = require('emitter'),
    extend      = require('extend'),
    jsonpointer = require('json-pointer');

exports = module.exports = pflock;

var defaults = {
    events: [
        'checked',
        'selected',
        'input',
        'change',
        'read'
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

    element.isPflockRoot = true;
    element = element || document.body;
    options = extend({}, defaults, options);

    var instance = emitter({
            element:        element,
            data:           data,
            toDocument:     toDocument,
            fromDocument:   fromDocument,
            options:        options
        }),

        dirty = false;


    each(options.plugins, function (plugin) {
        require(plugin)(instance);
    });


    event.bind(instance.element, 'read', function () {
        instance.emit('read');
    });

    instance.emit('init');
    instance.emit('write');

    instance.on('add-change',   addChange);
    instance.on('send-changes', sendChanges);

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
        sendChanges();
    }

    /**
     * Returns the data from the document
     *
     * @return {Object} the data object
     */
    function fromDocument () {
        instance.emit('read');
        sendChanges();
        return instance.data;
    }

    /**
     * Writes a value back to the data object
     *
     * @param pointer
     * @param value
     */
    function addChange (pointer, value) {
        var oldValue;
        if (jsonpointer.has(instance.data, pointer)) {
            oldValue = jsonpointer.get(instance.data, pointer);
        }
        if (oldValue !== value) {
            jsonpointer.set(instance.data, pointer, value);
            dirty = true;
        }
    }

    /**
     * Emits changed event if data is dirty
     *
     */
    function sendChanges () {
        if (dirty) {
            instance.emit('changed');
            dirty = false;
        }
    }
}
