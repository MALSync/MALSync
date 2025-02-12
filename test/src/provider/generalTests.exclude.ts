import { expect } from 'chai';
import { NotAuthenticatedError, ServerOfflineError } from '../../../src/_provider/Errors';

export function generalListTests(userlist, elements, responses, options: ObjectAnyType = {}) {
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
          let errorRes = 'UnexpectedResponseError';
          expect(error.name).to.equal(errorRes);
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
          let errorRes = 'UnexpectedResponseError';
          expect(error.name).to.equal(errorRes);
        }

        responses[index].data = temp;
      });
    });
  });

  describe('errorHandling', async function() {
    const list = new userlist();
    it('js', async function() {
      expect(list.errorMessage(new Error('This is a error'), 'url')).to.equal('This is a error');
    });

    it('Authentication', async function() {
      expect(list.errorMessage(new NotAuthenticatedError('No Authentication'), 'url')).to.equal('lang');
    });

    it('Server offline', async function() {
      expect(list.errorMessage(new ServerOfflineError('Offline'), 'url')).to.equal('Server Offline');
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
