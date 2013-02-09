/*global describe, it*/
var pflock = require('pflock'),

    data = {
        user: {
            name: 'Manuel'
        }
    };

pflock(window.document, data);

describe('test setup', function () {
    it('should work', function () {
        true.should.not.equal(false);
    });
});

