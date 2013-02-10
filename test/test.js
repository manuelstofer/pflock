/*global describe, it*/
var pflock = require('pflock'),

    data = {
        user: {
            name:           'pflock',
            checked:        'checked-value',
            selected:       '2',
            text:           'bla',
            editable:       'edit here'
        }
    };

    describe('test setup', function () {
        it('should work', function () {
            true.should.not.equal(false);
        });
    });

    var bind = pflock(document.body, data);

    describe('pflock', function () {

        var documentEqualsData = function () {
            $('#user-name').text().should.equal(data.user.name);
            $('#user-checked').text().should.equal(data.user.checked);
            $('#user-selected').text().should.equal(data.user.selected);
            $('#user-text').text().should.equal(data.user.text);
            $('#user-editable').text().should.equal(data.user.editable);
        };

        it('should write the data to the document', function () {
            documentEqualsData();
        });
    });

