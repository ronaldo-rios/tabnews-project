export class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super('Um erro interno inesperado ocorreu.', { cause: cause })
    this.name = 'InternalServerError'
    this.action = 'Entre em contato com o suporte.'
    this.statusCode = statusCode || 500
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    }
  }
}

export class MethotNotAllowedError extends Error {
  constructor() {
    super('Método não autorizado para este endpoint.')
    this.name = 'MethotNotAllowedError'
    this.action =
      'Verifique se o método HTTP enviado é válido para este endpoint.'
    this.statusCode = 405
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    }
  }
}

export class ServiceError extends Error {
  constructor({ cause, message }) {
    super(message || 'Serviço indisponível no momento.', { cause: cause })
    this.name = 'ServiceError'
    this.action = 'Verifique se o serviço está disponível.'
    this.statusCode = 503
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    }
  }
}

export class ValidationError extends Error {
  constructor({ cause, message, action }) {
    super(message || 'Um erro de validação ocorreu.', { cause: cause })
    this.name = 'ValidationError'
    this.action = action || 'Ajuste os dados enviados e tente novamente.'
    this.statusCode = 400
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    }
  }
}

export class NotFoundError extends Error {
  constructor({ cause, message, action }) {
    super(message || 'Não foi possível encontrar esse recurso.', {
      cause: cause,
    })
    this.name = 'NotFoundError'
    this.action =
      action || 'Verifique se os parâmetros na consulta estão corretos.'
    this.statusCode = 404
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    }
  }
}

export class UnauthorizedError extends Error {
  constructor({ cause, message, action }) {
    super(message || 'Usuário não autenticado!', {
      cause: cause,
    })
    this.name = 'UnauthorizedError'
    this.action =
      action || 'Verifique se os dados de login enviados estão corretos.'
    this.statusCode = 401
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    }
  }
}
