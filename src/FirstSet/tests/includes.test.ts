import { assert } from 'chai';
import includes from '../JS/includes';

describe('Inlcudes Function', function () {
    it('Should be a function', function () {
        assert.typeOf(includes, 'function');
    });
});
