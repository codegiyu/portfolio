export class ContentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: 400 | 404 | 409 | 503
  ) {
    super(message);
    this.name = 'ContentError';
  }
}

export class ContentUnavailableError extends ContentError {
  constructor() {
    super('Content storage is temporarily unavailable', 'CONTENT_UNAVAILABLE', 503);
    this.name = 'ContentUnavailableError';
  }
}

export class ContentNotFoundError extends ContentError {
  constructor(message = 'Content not found') {
    super(message, 'CONTENT_NOT_FOUND', 404);
    this.name = 'ContentNotFoundError';
  }
}

export class ContentConflictError extends ContentError {
  constructor(message = 'Content changed or already exists') {
    super(message, 'CONTENT_CONFLICT', 409);
    this.name = 'ContentConflictError';
  }
}

export class ContentValidationError extends ContentError {
  constructor(message = 'Content validation failed') {
    super(message, 'CONTENT_INVALID', 400);
    this.name = 'ContentValidationError';
  }
}
