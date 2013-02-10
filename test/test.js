/*global describe, it, $, beforeEach*/
var pflock = require('pflock');


pflock($('.document').get(0), {});

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
                    checked:        'checked-value',
                    selected:       '2',
                    text:           'bla',
                    editable:       'edit here'
            }
        };
    });

    var documentEqualsData = function () {
        el.find('.user-name').text().should.equal(data.user.name);
        el.find('.user-checked').text().should.equal(data.user.checked);
        el.find('.user-selected').text().should.equal(data.user.selected);
        el.find('.user-text').text().should.equal(data.user.text);
        el.find('.user-editable').text().should.equal(data.user.editable);
    };

    describe('with default settings', function () {

        beforeEach(function () {
            el = $('.document').clone();
            el.appendTo('body');
            bindings = pflock(el.get(0), data);
        });

        afterEach(function () {
            el.remove();
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

        it('should emit an event when values values change', function (done) {
            var userName = el.find('.input-user-name');
            userName.val('different');
            bindings.on('changed', function (path, value) {
                path.should.equal('.user.name');
                value.should.equal('different');
                done();
            });
            triggerEvent(userName.get(0), 'input');
        });

    });

    describe('without updating data', function () {

        beforeEach(function () {
            el = $('.document').clone();
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

});



function triggerEvent (element, event) {
    var evt = document.createEvent('Event');
    evt.initEvent(event, true, true);
    element.dispatchEvent(evt);
}
