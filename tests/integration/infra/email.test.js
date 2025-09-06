import email from 'infra/email'
import orchestrator from 'tests/orchestrator'

beforeAll(async () => await orchestrator.waitForServerAvailability())

describe('infra/email', () => {
  test('send()', async () => {
    await orchestrator.deleteAllEmails()

    await email.send({
      from: '<testlocalemail@test.com>',
      to: 'contact@emailtest.com',
      subject: 'Test email',
      text: 'Body text.',
    })

    await email.send({
      from: '<testlocalemail@test.com>',
      to: 'contact@emailtest.com',
      subject: 'Last email sended',
      text: 'Last body text.',
    })

    const lastEmail = await orchestrator.getLastEmail()
    expect(lastEmail.sender).toBe('<testlocalemail@test.com>')
    expect(lastEmail.recipients[0]).toBe('<contact@emailtest.com>')
    expect(lastEmail.subject).toBe('Last email sended')
    expect(lastEmail.text.trimEnd()).toBe('Last body text.')
  })
})
