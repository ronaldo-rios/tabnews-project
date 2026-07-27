import bcryptjs from 'bcryptjs'

async function hash(password) {
  const rounds = getNumberOfRounds()
  const passwordWithPepper = password + process.env.PEPPER
  return await bcryptjs.hash(passwordWithPepper, rounds)
}

async function compare(providedPassword, storedPasswordHash) {
  const providedPasswordWithPepper = providedPassword + process.env.PEPPER
  return await bcryptjs.compare(providedPasswordWithPepper, storedPasswordHash)
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === 'development' ? 7 : 14
}

const password = {
  hash,
  compare,
}

export default password
