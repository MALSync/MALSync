import { expect } from 'chai';

export function generalListTests(userlist, elements, responses, options: ObjectAnyType = {}) {
  it('Get List', function() {
    const list = new userlist(7, 'anime');

    return list.getCompleteList().then(list => {
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
          await new userlist(7, 'anime').getCompleteList();
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
          await new userlist(7, 'anime').getCompleteList();
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

  describe('errorHandling', async function() {
    const list = new userlist();
    it('js', async function() {
      expect(list.errorMessage('This is a error')).to.equal('This is a error');
    });

    it('400', async function() {
      expect(list.errorMessage({ code: 400, message: 'Invalid token' })).to.equal('lang');
    });

    it('999', async function() {
      expect(list.errorMessage({ code: 999, message: 'Invalid token' })).to.equal('Invalid token');
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
