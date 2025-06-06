exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    // For reference, Github limits username to 39 characters
    username: {
      type: 'varchar(30)',
      notNull: true,
      unique: true,
    },
    email: {
      type: 'varchar(254)',
      notNull: true,
      unique: true,
    },
    // Why 72 in length? https://security.stackexchange.com/q/39849
    password: {
      type: 'varchar(72)',
      notNull: true,
    },
    // Why timestamp with timezone? https://justatheory.com/2012/04/postgres-use-timestamptz/
    created_at: {
      type: 'timestamptz',
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      default: pgm.func('now()'),
    },
  })
}

exports.down = false
