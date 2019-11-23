import { expect } from 'chai';

export function generalListTests(userlist, elements, responses) {
  it('Get List', function () {
    var list = new userlist(7, 'anime')

    return list.get().then((list) => {
      expect(list).to.deep.include(elements[0]);
      expect(list).to.deep.include(elements[1]);

    });

  });

  describe('Empty responses', async function () {
    Object.keys(responses).forEach(async function(index) {
      var value = responses[index].data;
      it( index, async function () {

        var temp = responses[index].data;
        responses[index].data = '';
        try {
          await new userlist(7, 'anime').get();
        } catch (error) {
          responses[index].data = temp;
          var errorRes = 444;
          if(responses[index].errorCode) errorRes = responses[index].errorCode;
          expect(error.code).to.equal(errorRes)
        }

        responses[index].data = temp;

      });
    });
  });

  describe('No json responses', async function () {
    Object.keys(responses).forEach(async function(index) {
      var value = responses[index].data;
      it( index, async function () {

        var temp = responses[index].data;
        responses[index].data = 'This is not valid json';
        try {
          await new userlist(7, 'anime').get();
        } catch (error) {
          responses[index].data = temp;
          var errorRes = 406;
          if(responses[index].errorCode) errorRes = responses[index].errorCode;
          expect(error.code).to.equal(errorRes)
        }

        responses[index].data = temp;

      });
    });
  });

  it('continueCall', async function () {
    var testArray = [];
    var list = new userlist(7, 'anime', {continueCall: function(list) {
      return new Promise(function(resolve, reject) {
        testArray.push(1);

        expect(list).to.deep.include(elements[0]);

        if(testArray.length > 1){
          expect(list).to.deep.include(elements[1]);
        }else{
          expect(list).to.not.deep.include(elements[1]);
        }

        setTimeout(function(){
          testArray.push(2);
          resolve();
        }, 200);
      });
    }})

    return list.get().then((list) => {
      expect(testArray).to.deep.equal([1,2,1,2,1])
    });
  });

  describe('errorHandling', async function () {
    var list = new userlist();
    it('js', async function () {
      expect(list.errorMessage('This is a error')).to.equal('This is a error');
    });

    it('400', async function () {
      expect(list.errorMessage({code: 400, message: 'Invalid token'})).to.equal('lang');
    });

    it('999', async function () {
      expect(list.errorMessage({code: 999, message: 'Invalid token'})).to.equal('Invalid token');
    });
  });
}
