
import { email } from '../lib/email';

describe("Email", () => {

  it('sendEmail should be a function', async () => {

    assert(typeof email.sendEmail === 'function');

  });

});
