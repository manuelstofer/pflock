'use strict';
var attr    = require('attr'),
    each    = require('each'),
    util    = require('../util');

/**
 * Pflock plugin that provides the x-each syntax
 *
 * @param instance
 */
module.exports = function (instance) {

    var $ = util.getQueryEngine(instance.element);

    instance.on('init',  prepareEachNodes);
    instance.on('write', prepareEachNodes);

    function prepareEachNodes () {
        each($('[x-each]').sort(cmpNestingLevel), prepareEachNode);
    }

    /**
     * Creates the necessary DOM Structure to match the data of the array
     * Updates the binding path of child x-each and x-bind nodes
     *
     * @param eachNode
     */
    function prepareEachNode (eachNode) {
        var path         = attr(eachNode).get('x-each'),
            elData       = util.resolvePath(path, instance.data),
            children     = eachNode.children;

        createChildNodes(eachNode, elData);
        prepareChildNodes(children, elData, path);
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

        // if there are too elements the last ones are removed
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
     * Updates the path of child nodes of a x-each node
     *
     * @param children
     * @param data
     * @param path
     */
    function prepareChildNodes (children, data, path) {
        each(data, function (childData, childIndex) {
            var childNode   = children[childIndex],
                $$          = util.getQueryEngine(childNode),
                childBinds  = $$('[x-bind]'),
                childEach   = attr(childNode).has('x-each') ? childNode : $$('[x-each]')[0];

            if (attr(childNode).has('x-bind')) {
                childBinds.push(childNode);
            }
            each(childBinds, function (childBind) {
                setBindingPath(childBind, path, childIndex);
            });

            if (childEach) {
                setEachPath(childEach, path, childIndex);
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
     * Updates the each path of sub x-each node
     *
     * @param el
     * @param prefix
     * @param index
     */
    function setEachPath (el, prefix, index) {
        var path = attr(el).get('x-each');
        attr(el).set('x-each', replaceIndex(prefix, index, path));
    }

    /**
     * Update the binding path of a node in a x-each
     *
     * @param el
     * @param prefixPath
     * @param index
     */
    function setBindingPath (el, prefixPath, index) {
        var binding     = util.parseXBind(el),
            attribute   = binding.attribute ? binding.attribute + ':' : '',
            newBinding  = attribute + replaceIndex(prefixPath, index, binding.path);
       attr(el).set('x-bind', newBinding);
    }

    /**
     * Replace an index of a path
     *
     * @param prefix
     * @param index
     * @param path
     * @return {*}
     */
    function replaceIndex(prefix, index, path) {
        if (path.indexOf(prefix) === 0) {
            var restPath = path.substr(prefix.length);
            return prefix + restPath.replace(/^\.[^\.]/, '.' + index);
        }
        return path;
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