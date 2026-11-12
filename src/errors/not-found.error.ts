export class NotFoundError extends Error {
  public readonly statusCode = 404;

  public constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
