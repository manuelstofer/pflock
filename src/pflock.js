/*global module*/

var each    = require('each'),
    attr    = require('attr'),
    emitter = require('emitter'),
    extend  = require('extend'),
    resolvr = require('resolvr');

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

    element.isPflockRoot = true;
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
            resolvr.set(instance.data, path, value);
        }
        instance.emit('changed', path, value);
    }
}
