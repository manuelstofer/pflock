var attr = require('attr'),
    each = require('each'),
    util = require('./../util');

module.exports = function (instance) {
    'use strict';

    var $ = util.getQueryEngine(instance.element);

    instance.on('init',  updateXEachs);
    instance.on('write', updateXEachs);

    /**
     * Adds / removes childNodes for items in x-each
     * Updates all bound path
     *
     */
    function updateXEachs () {

        // Outer x-each must be processed first.
        var xEachs = $('[x-each]').sort(cmpNestingLevel);

        while (xEachs.length) {

            var container = xEachs.shift(),
                path      = attr(container).get('x-each'),
                elData    = util.resolvePath(path, instance.data),
                children  = container.children;

            container.pflockTemplateNode = container.pflockTemplateNode || children[0];

            if (!container.pflockTemplateNode) {
                throw new Error('x-each needs a template node');
            }

            // if there are too elements the last ones are removed
            while (children.length > elData.length) {
                container.removeChild(children[children.length - 1]);
            }

            // the first element is cloned and appended at the end until
            // the number of children matches the amount of items in the array
            while (children.length < elData.length) {
                var clone = container.pflockTemplateNode.cloneNode(true);
                container.appendChild(clone);

                // a element is cloned there might be new subeachs created
                var clonedXEachs = util.getQueryEngine(clone)('[x-each]');
                if (attr(clone).has('x-each')) {
                    clonedXEachs.push(clone);
                }
                if (clonedXEachs.length) {
                    each(clonedXEachs, function (clonedXEach) {
                        xEachs.push(clonedXEach);
                    });
                }
            }

            // the path is updated on all child elements
            each(elData, function (childData, childIndex) {
                var childNode   = children[childIndex],
                    $$          = util.getQueryEngine(childNode),
                    subBindings = $$('[x-bind]'),
                    subXEachs   = $$('[x-each]');

                if (attr(childNode).has('x-bind')) {
                    subBindings.push(childNode);
                }
                each(subBindings, function (boundElement) {
                    setBindPrefix(boundElement, path, childIndex);
                });

                if (attr(childNode).has('x-each')) {
                    subXEachs.push(childNode);
                }
                each(subXEachs, function (subEach) {
                    setSubEachPath(subEach, path, childIndex);
                });
            });
        }
    }

    /**
     * Updates the each path of sub x-each node
     *
     * @param el
     * @param eachPrefix
     * @param index
     */
    function setSubEachPath (el, eachPrefix, index) {
        var path            = attr(el).get('x-each'),
            testPathPrefix  = path.substr(0, eachPrefix.length);

        if (testPathPrefix === eachPrefix) {
            var subPath     = path.substr(eachPrefix.length),
                newSubPath  = subPath.replace(/^\.[^\.]+/, '.' + index),
                newPath     = eachPrefix + newSubPath;
            attr(el).set('x-each', newPath);
        }
    }

    /**
     * Update the binding path of a node in a x-each
     *
     * @param el
     * @param eachPrefix
     * @param index
     */
    function setBindPrefix (el, eachPrefix, index) {
        var binding         = util.parseXBind(el),
            path            = binding.path,
            testPathPrefix  = path.substr(0, eachPrefix.length);

        if (testPathPrefix === eachPrefix) {
            var subPath     = path.substr(eachPrefix.length),
                newSubPath  = subPath.replace(/^\.[^\.]+/, '.' + index),
                newPath     = eachPrefix + newSubPath;
            attr(el).set('x-bind', newPath);
        }
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
