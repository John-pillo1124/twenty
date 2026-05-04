/**
 * Error thrown when a component requires a record context (targetRecordIdentifier)
 * but is rendered in a context where no record is available (e.g., dashboard pages).
 *
 * This is distinct from a configuration error - the widget may be correctly configured,
 * but simply cannot function in the current page context.
 */
export class RecordContextRequiredError extends Error {
  constructor(message: string = 'This widget requires a record context but none is available') {
    super(message);
    this.name = 'RecordContextRequiredError';
  }
}
