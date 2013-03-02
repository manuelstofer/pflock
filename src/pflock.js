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
