'use strict';
var attr = require('attr'),
    each = require('each');

module.exports = {
    getEventTarget:     getEventTarget,
    getQueryEngine:     getQueryEngine,
    isIterable:         isIterable,
    toPathValueHash:    toPathValueHash,
    parseXBind:         parseXBind
};


/**
 * Returns the target of an event
 *
 * @param event
 * @return {Object}
 */
function getEventTarget (event) {
    return event.target || event.srcElement;
}

/**
 * Get querySelectorAll with jQuery fallback, if available
 *
 * @param from scope of the query (default to element)
 * @return function
 */
function getQueryEngine (from) {
    if (from.querySelectorAll) {
        return function (selector) {
            return [].slice.call(from.querySelectorAll(selector)) || [];
        };
    }
    return function (selector) {
        return window.$(from).find(selector).get();
    };
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
 * Gets the element binding definition
 *
 * @param el
 * @return {Object}
 */
function parseXBind(el) {
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