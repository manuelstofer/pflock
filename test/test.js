/*global describe, it, $, beforeEach*/
var pflock = require('pflock');

pflock($('.document').get(0), {
    users: [
        {name: 'example 1'},
        {name: 'example 2'}
    ]
});

describe('test setup', function () {
    it('should work', function () {
        true.should.not.equal(false);
    });
});

describe('pflock', function () {

    var el, bindings,
        data;

    beforeEach(function () {
        data = {
            user: {
                name:           'pflock',
                checked:        true,
                selected:       '2',
                text:           'bla',
                editable:       'edit here'
            }
        };
    });

    var documentEqualsData = function () {
        el.find('.user-name').text().should.equal(data.user.name);
        el.find('.user-selected').text().should.equal(data.user.selected);
        el.find('.user-checked').text().should.equal(data.user.checked.toString());
        el.find('.user-text').text().should.equal(data.user.text);
        el.find('.user-editable').text().should.equal(data.user.editable);

        (!!el.find('.input-user-checked').prop('checked')).should.equal(data.user.checked);
    };

    describe('with default settings', function () {

        beforeEach(function () {
            el = $('.document:first').clone();
            el.appendTo('body');
            bindings = pflock(el.get(0), data);
        });

        it('should write the data to the document', function () {
            documentEqualsData();
        });

        it('should update other bindings when the document changes', function () {
            var userNameInput = el.find('.input-user-name');
            var userNameStatus = el.find('.user-name');
            userNameInput.val('changed');
            triggerEvent(userNameInput.get(0), 'input');
            String(userNameStatus.text()).should.equal('changed');
        });

        it('should update the data when the document changes', function () {
            var userName = el.find('.input-user-name');
            userName.val('changed');
            triggerEvent(userName.get(0), 'input');
            data.user.name.should.equal('changed');
            documentEqualsData();
        });

        it('should emit an event when values change', function (done) {
            var userName = el.find('.input-user-name');
            userName.val('different');
            bindings.on('changed', function (path, value) {
                path.should.equal('user.name');
                value.should.equal('different');
                done();
            });
            triggerEvent(userName.get(0), 'input');
        });

        describe('triggering an event on an element without data binding', function () {
            it('should not throw an exception', function () {
                triggerEvent($('#unbound').get(0), 'input');
            });
        });

        it('fromDocument should return the correct data', function () {
            var userNameInput = el.find('.input-user-name');
            bindings.toDocument({user: {name: 'changed'}});
            userNameInput.val('changed again');
            triggerEvent(userNameInput.get(0), 'input');
            bindings.fromDocument().user.name.should.equal('changed again');
        });
    });

    describe('with option updateData: false', function () {

        beforeEach(function () {
            el = $('.document:first').clone();
            el.appendTo('body');
            bindings = pflock(el.get(0), data, {updateData: false});

        });

        it('should not update the data when the document changes', function () {
            var userName = el.find('.input-user-name');
            userName.val('not the same');
            triggerEvent(userName.get(0), 'input');
            data.user.name.should.not.equal('not the same');
        });
    });

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

        describe('when removing items', function () {
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

        describe('when adding items', function () {
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
    });

    describe('invalid x-each', function () {
        var data,
            el;

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

    describe('nested x-each', function () {
        var data,
            el,
            bindings;

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
});



function triggerEvent (element, event) {
    var evt = document.createEvent('Event');
    evt.initEvent(event, true, true);
    element.dispatchEvent(evt);
}
