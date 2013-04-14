/*global describe, it, $, beforeEach*/
var pflock = require('pflock');

pflock($('.document').get(0), {
    users: [
        {name: 'example 1'},
        {name: 'example 2'}
    ]
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
                editable:       'edit here',
                date:           new Date('1984-10-16')
            }
        };
    });

    var documentEqualsData = function () {
        el.find('.user-name').text().should.equal(data.user.name);
        el.find('.user-selected').text().should.equal(data.user.selected);
        el.find('.user-checked').text().should.equal(data.user.checked.toString());
        el.find('.user-text').text().should.equal(data.user.text);
        el.find('.user-editable').text().should.equal(data.user.editable);
        el.find('.user-date').text().indexOf('Tue Oct 16 1984').should.equal(0);

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

        it('should update the document when data changes changes', function () {
            data.user.name = 'changed-data';
            bindings.toDocument();
            el.find('.input-user-name').val().should.equal('changed-data');
        });

        it('should update the data when the document changes', function () {
            var userName = el.find('.input-user-name');
            userName.val('changed');
            triggerEvent(userName.get(0), 'input');
            data.user.name.should.equal('changed');
            documentEqualsData();
        });

        it('should emit path-changed event', function (done) {
            var userName = el.find('.input-user-name');
            userName.val('changed');
            bindings.on('path-changed', function (path, value) {
                path.should.equal('/user/name');
                value.should.equal('changed');
                done();
            });
            triggerEvent(userName.get(0), 'input');
        });

        it('should emit `changed` event when values change', function (done) {
            var userName = el.find('.input-user-name');
            userName.val('different');
            bindings.on('changed', function (data) {
                data.should.equal(bindings.data);
                done();
            });
            triggerEvent(userName.get(0), 'input');
        });

        it('should not emit changed event when nothing changed', function (done) {
            var userName = el.find('.input-user-name');

            // @todo: find better way to check an event is not emitted
            bindings.on('changed', function () {
                true.should.equal(false);
                done();
            });
            setTimeout(done, 200);

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

    describe('nested pflock', function () {

        it('should not affect other nested instances', function () {

            var outerEl = document.getElementById('outer-pflock'),
                innerEl = document.getElementById('inner-pflock'),

                outerData = {
                    title: 'outer'
                },
                innerData = {
                    title: 'inner'
                },
                outerBindings = pflock(outerEl, outerData),
                innerBindings = pflock(innerEl, innerData),
                outerTitle = document.getElementById('outer-title'),
                innerTitle = document.getElementById('inner-title');

            outerTitle.value.should.equal('outer');
            innerTitle.value.should.equal('inner');

            outerTitle.value = 'changed-outer';
            triggerEvent(outerTitle, 'input');
            outerData.title.should.equal('changed-outer');
            innerTitle.value.should.equal('inner');

            outerData.title = 'outer-changed-again';
            outerBindings.toDocument();

            outerTitle.value.should.equal('outer-changed-again');
            innerTitle.value.should.equal('inner');


            innerTitle.value = 'changed-inner';
            triggerEvent(innerTitle, 'input');
            innerData.title.should.equal('changed-inner');

            outerTitle.value.should.equal('outer-changed-again');
            innerTitle.value.should.equal('changed-inner');

            innerData.title = 'inner-changed-again';
            innerBindings.toDocument();
            outerTitle.value.should.equal('outer-changed-again');
            innerTitle.value.should.equal('inner-changed-again');
        });
    });
});



function triggerEvent (element, event) {
    var evt = document.createEvent('Event');
    evt.initEvent(event, true, true);
    element.dispatchEvent(evt);
}
