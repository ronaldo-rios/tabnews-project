import bcryptjs from 'bcryptjs'

async function hash(password) {
  const rounds = getNumberOfRounds()
  return await bcryptjs.hash(password, rounds)
}

async function compare(providedPassword, storedPasswordHash) {
  return await bcryptjs.compare(providedPassword, storedPasswordHash)
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === 'development' ? 7 : 14
}

const password = {
  hash,
  compare,
}

export default password
