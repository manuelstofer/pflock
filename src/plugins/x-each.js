'use strict';
var attr        = require('attr'),
    each        = require('foreach'),
    util        = require('../util'),
    jsonpointer = require('json-pointer');

/**
 * Pflock plugin that provides the x-each syntax
 *
 * @param instance
 */
module.exports = function (instance) {

    var $ = util.getQueryEngine(instance.element);

    instance.on('write', prepareEachNodes);
    instance.on('read', readEachNodes);

    function readEachNodes () {
        each($('[x-each]').sort(cmpNestingLevel), readEachNode);
        instance.emit('send-changes');
    }

    function prepareEachNodes () {
        each($('[x-each]').sort(cmpNestingLevel), prepareEachNode);
    }


    function readEachNode (eachNode) {
        var pointer = attr(eachNode).get('x-each');

        if (!jsonpointer.has(instance.data, pointer)) {
            jsonpointer.set(instance.data, pointer, []);
        }

        var originalData = jsonpointer.get(instance.data, pointer),
            result       = [],
            hasChanged   = eachNode.children !== originalData.length;

        each(eachNode.children, function (child, index) {

            if (child.pflockNodeIndex !== index) {
                hasChanged = true;
            }

            if (typeof child.pflockNodeIndex !== 'undefined') {
                result.push(originalData[child.pflockNodeIndex]);
            } else {
                result.push({});
            }
            child.pflockNodeIndex = index;
        });

        if (hasChanged) {
            prepareChildNodes(eachNode, pointer);
            instance.emit('path-changed', pointer, result);
        }
    }

    /**
     * Creates the necessary DOM Structure to match the data of the array
     * Updates the binding pointer of child x-each and x-bind nodes
     *
     * @param eachNode
     */
    function prepareEachNode (eachNode) {
        var pointer = attr(eachNode).get('x-each');
        if (jsonpointer.has(instance.data, pointer)) {
            var elData = jsonpointer.get(instance.data, pointer);
            if (elData) {
                createChildNodes(eachNode, elData);
                prepareChildNodes(eachNode, pointer);
            }
        }
    }

    /**
     * Adds removes child nodes to match the amount of elements in the array
     *
     * @param container
     * @param data
     */
    function createChildNodes (container, data) {
        var children = container.children,
            templateNode = getTemplateNode(container);

        // if there are too many elements the last ones are removed
        while (children.length > data.length) {
            container.removeChild(children[children.length - 1]);
        }

        // the first element is cloned and appended at the end until
        // the number of children matches the amount of items in the array
        while (children.length < data.length) {
            var clone = templateNode.cloneNode(true);
            container.appendChild(clone);
        }
    }

    /**
     * Updates the pointer of child nodes of a x-each node
     *
     * @param container
     * @param pointer
     */
    function prepareChildNodes (container, pointer) {
        var children = container.children;
        each(children, function (childNode, childIndex) {
            var $$= util.getQueryEngine(childNode),
                childBinds  = $$('[x-bind]'),
                childEach   = attr(childNode).has('x-each') ? childNode : $$('[x-each]')[0];

            childNode.pflockNodeIndex = childIndex;

            if (attr(childNode).has('x-bind')) {
                childBinds.push(childNode);
            }
            each(childBinds, function (childBind) {
                setBindingPointer(childBind, pointer, childIndex);
            });

            if (childEach) {
                setEachPointer(childEach, pointer, childIndex);
                prepareEachNode(childEach);
            }
        });
    }

    /**
     * Returns the template node of a x-each node
     *
     * @param container
     * @return Template node
     */
    function getTemplateNode(container) {
        container.pflockTemplateNode = container.pflockTemplateNode || container.children[0];
        if (!container.pflockTemplateNode) {
            throw new Error('x-each needs a template node');
        }
        return container.pflockTemplateNode;
    }

    /**
     * Updates the each pointer of sub x-each node
     *
     * @param el
     * @param prefix
     * @param index
     */
    function setEachPointer (el, prefix, index) {
        var pointer = attr(el).get('x-each');
        attr(el).set('x-each', replaceIndex(prefix, index, pointer));
    }

    /**
     * Update the binding pointer of a node in a x-each
     *
     * @param el
     * @param prefixPointer
     * @param index
     */
    function setBindingPointer (el, prefixPointer, index) {
        var binding     = util.parseXBind(el),
            attribute   = binding.attribute ? binding.attribute + ':' : '',
            newBinding  = attribute + replaceIndex(prefixPointer, index, binding.pointer);
       attr(el).set('x-bind', newBinding);
    }

    /**
     * Replace an index of a pointer
     *
     * @param prefix
     * @param index
     * @param pointer
     * @return {*}
     */
    function replaceIndex (prefix, index, pointer) {
        if (pointer.indexOf(prefix) === 0) {
            var restPointer = pointer.substr(prefix.length);
            return prefix + restPointer.replace(/^\/[^\/]+/, '/' + index);
        }
        return pointer;
    }

    /**
     * Gets the nesting level of DOM Element.
     * - Required for sorting processing order of x-each
     *
     * @param el
     * @param n
     * @return {*}
     */
    function getNestingLevel (el, n) {
        n = n || 0;
        if (el.parentNode) {
            return getNestingLevel(el.parentNode, n + 1);
        }
        return n;
    }

    /**
     * Compare function to sort DOM elements by nesting level
     *
     * @param el1
     * @param el2
     * @return {*}
     */
    function cmpNestingLevel(el1, el2) {
        return getNestingLevel(el1) - getNestingLevel(el2);
    }
};
