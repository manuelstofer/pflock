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
 * Returns the pflock root node of a element,
 * (The DOM Element the pflock instance is bound to)
 * @param el
 */
function getPflockRootElement (el) {
    if (el.isPflockRoot === true) {
        return el;
    } else if (el.parentNode) {
        return getPflockRootElement(el.parentNode);
    }
    return undefined;
}

function filterSamePflockRoot (elements, root) {
    if (!root) { return elements; }
    var results = [];
    for (var i = 0; i < elements.length; i++) {
        if (getPflockRootElement(elements[i]) === root) {
            results.push(elements[i]);
        }
    }
    return results;
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
            return filterSamePflockRoot(
                [].slice.call(from.querySelectorAll(selector)) || [],
                getPflockRootElement(from)
            );
        };
    }
    return function (selector) {
        return filterSamePflockRoot(
            window.$(from).find(selector).get(),
            getPflockRootElement(from)
        );
    };
}

/**
 * Checks if obj is iterable using each
 *
 * @param obj
 * @return {Boolean}
 */
function isIterable (obj) {
    return obj instanceof Array || Object.prototype.toString.call(obj) === '[object Object]';
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