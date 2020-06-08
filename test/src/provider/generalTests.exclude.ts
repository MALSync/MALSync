import { expect } from 'chai';

export function generalListTests(userlist, elements, responses, options = {}) {
  it('Get List', function() {
    const list = new userlist(7, 'anime');

    return list.get().then(list => {
      list = removeFn(list);
      expect(list).to.deep.include(elements[0]);
      expect(list).to.deep.include(elements[1]);
    });
  });

  describe('Empty responses', async function() {
    Object.keys(responses).forEach(async function(index) {
      const value = responses[index].data;
      it(index, async function() {
        const temp = responses[index].data;
        responses[index].data = '';
        try {
          await new userlist(7, 'anime').get();
        } catch (error) {
          responses[index].data = temp;
          let errorRes = 444;
          if (responses[index].errorCode) errorRes = responses[index].errorCode;
          expect(error.code).to.equal(errorRes);
        }

        responses[index].data = temp;
      });
    });
  });

  describe('No json responses', async function() {
    Object.keys(responses).forEach(async function(index) {
      const value = responses[index].data;
      it(index, async function() {
        const temp = responses[index].data;
        responses[index].data = 'This is not valid json';
        try {
          await new userlist(7, 'anime').get();
        } catch (error) {
          responses[index].data = temp;
          let errorRes = 406;
          if (responses[index].errorCode) errorRes = responses[index].errorCode;
          expect(error.code).to.equal(errorRes);
        }

        responses[index].data = temp;
      });
    });
  });

  it('continueCall', async function() {
    if (options.noContinueCall) return;
    const testArray = [];
    const list = new userlist(7, 'anime', {
      continueCall(list) {
        list = removeFn(list, false);
        return new Promise(function(resolve, reject) {
          testArray.push(1);

          expect(list).to.deep.include(elements[0]);

          if (testArray.length > 1) {
            expect(list).to.deep.include(elements[1]);
          } else {
            expect(list).to.not.deep.include(elements[1]);
          }

          setTimeout(function() {
            testArray.push(2);
            resolve();
          }, 200);
        });
      },
    });

    return list.get().then(list => {
      expect(testArray).to.deep.equal([1, 2, 1, 2, 1]);
    });
  });

  describe('errorHandling', async function() {
    const list = new userlist();
    it('js', async function() {
      expect(list.errorMessage('This is a error')).to.equal('This is a error');
    });

    it('400', async function() {
      expect(
        list.errorMessage({ code: 400, message: 'Invalid token' }),
      ).to.equal('lang');
    });

    it('999', async function() {
      expect(
        list.errorMessage({ code: 999, message: 'Invalid token' }),
      ).to.equal('Invalid token');
    });
  });
}

export function removeFn(list, test = true) {
  for (const key in list) {
    if (test) expect(list[key]).to.have.property('fn');
    if (test) expect(list[key]).to.have.property('options');
    delete list[key].fn;
    delete list[key].options;
  }
  return list;
}
