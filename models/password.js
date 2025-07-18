import bcryptjs from 'bcryptjs'

async function hash(password) {
  const rounds = getNumberOfRounds()
  return await bcryptjs.hash(password, rounds)
}

async function compare(providedPassword, storedPasswordHash) {
  return await bcryptjs.compare(providedPassword, storedPasswordHash)
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === 'production' ? 14 : 7
}

const password = {
  hash,
  compare,
}

export default password
