'use strict';
var attr = require('attr'),
    each = require('foreach');

module.exports = {
    getEventTarget:     getEventTarget,
    getQueryEngine:     getQueryEngine,
    isIterable:         isIterable,
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

    if (!el.parentNode) {
        return undefined;

    } else if (el.parentNode.isPflockRoot === true) {
        return el.parentNode;
    }

    return getPflockRootElement(el.parentNode);
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
 * @param root scope of the query (default to element)
 * @return function
 */
function getQueryEngine (root) {
    if (root.querySelectorAll) {
        return function (selector) {
            return filterSamePflockRoot(
                [].slice.call(root.querySelectorAll(selector)) || [],
                root
            );
        };
    }
    return function (selector) {
        return filterSamePflockRoot(
            window.$(root).find(selector).get(),
            root
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
 * Gets the element binding definition
 *
 * @param el
 * @return {Object}
 */
function parseXBind(el) {
    var bindValue   = attr(el).get('x-bind'),
        bindParts   = bindValue.split(/:/),
        attribute   = bindParts.length > 1 ? bindParts.shift(): '',
        pointer     = bindParts.shift();
    return {
        attribute:  attribute,
        pointer:    pointer,
        element:    el
    };
}