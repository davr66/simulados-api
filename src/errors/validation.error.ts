export class ValidationError extends Error {
  public readonly statusCode = 400;

  public constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
