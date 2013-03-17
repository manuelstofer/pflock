/*global describe, it, $, beforeEach*/
'use strict';

var pflock = require('pflock');

describe('x-each', function () {
    var data,
        el,
        bindings;

    beforeEach(function () {
        data = {
            users: [
                {name: 'example 1'},
                {name: 'example 2'}
            ]
        };
        el = $('.document:first').clone(false);
        el.appendTo('body');
        bindings = pflock(el.get(0), data, {updateData: false});
    });

    function checkData() {

        it('should create the right amount child nodes', function () {
            el.find('.each-users li').length.should.equal(data.users.length);
        });

        it('should write the correct data', function () {
            el.find('.each-users li').each(function (index) {
                $(this).text().should.equal(data.users[index].name);
            });
        });
    }

    describe('without adding/removing', function () {
        checkData();
    });

    describe('removing items', function () {
        beforeEach(function () {
            data.users.pop();
            bindings.toDocument();

            data.users.shift();
            bindings.toDocument();
        });
        checkData();
        it('should have 0 items', function () {
            data.users.length.should.equal(0);
        });
    });

    describe('adding items', function () {
        beforeEach(function () {
            data.users.push({name: 'example 3'});
            bindings.toDocument();

            data.users.unshift({name: 'example 4'});
            bindings.toDocument();
        });
        checkData();
        it('should have 4 items', function () {
            data.users.length.should.equal(4);
        });
    });

    describe('when removing items to zero and adding again', function () {
        beforeEach(function () {
            data.users.pop();
            data.users.shift();
            bindings.toDocument();
            data.users.unshift({name: 'example 5'});
            bindings.toDocument();
        });
        checkData();
        it('should have 1 item', function () {
            data.users.length.should.equal(1);
        });
    });


    describe('invalid x-each', function () {

        beforeEach(function () {
            data = {
                users: [
                    {name: 'example 1'},
                    {name: 'example 2'}
                ]
            };
            el = $('.invalid-each:first').clone(false);
            el.appendTo('body');

        });

        it('should throw an exception when no template node is avaiable', function () {
            chai.expect(function () {
                pflock(el.get(0), data, {updateData: false});
            }).to.throw(/x-each needs a template node/);
        });
    });


    describe('x-each indexes', function () {

        beforeEach(function () {
            data = {
                numbers: [2,3]
            };
            el = $('.x-each-indexes:first').clone(false);
            $('body').append(el);
        });

        it('does update correct', function () {
            bindings = pflock(el.get(0), data);
            bindings.toDocument({numbers: [1,2,3]});
            var elements = $(el).find('li');
            elements.each(function (index, element) {
                $(element).attr('x-id').should.equal((index + 1).toString(10));
            });
            elements.length.should.equal(3);
        });
    });

    describe('nested x-each', function () {

        beforeEach(function () {
            data = {
                users: [
                    {name: 'Edwin', pets: ['Dog', 'Cat']},
                    {name: 'Bla',   pets: ['Bird', 'Rabbit']}
                ]
            };
            el = $('.nested-each:first').clone(false);
            $('body').append(el);
        });

        it('should render correct data and structure', function () {
            bindings = pflock(el.get(0), data, {updateData: false});
            $(el).find('ul.outer > li').each(function (outerIndex) {
                var outerEl = $(this);
                outerEl.find('ul.inner > li').each(function (innerIndex) {
                    $(this).text().should.equal(data.users[outerIndex].pets[innerIndex]);
                });
            });
        });
    });

    describe('x-each dom-changes', function () {
        var data,
            bindings,
            el;

        beforeEach(function () {
            data = {
                list: [10,20,30]
            };
            el = document.getElementById('each-dom-changes').cloneNode(true);
            document.body.appendChild(el);
        });

        it('should render correct data and structure', function () {
            bindings = pflock(el, data);
            var firstEl = el.querySelectorAll('li')[0];
            firstEl.parentNode.removeChild(firstEl);
            var readData = bindings.fromDocument();
            readData.list.length.should.equal(2);
            readData.list[0].should.equal("20");
            readData.list[1].should.equal("30");
        });
    });
});

