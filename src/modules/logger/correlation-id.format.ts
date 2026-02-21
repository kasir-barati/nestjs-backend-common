import type { Format } from 'logform';

import { format } from 'winston';

/**
 * Custom Winston format that extracts correlationId and extra metadata from metadata
 * and formats them for PLAIN_TEXT mode output.
 */
export const correlationIdFormat: Format = format((info) => {
  // Known winston/logger fields that should not be treated as extra metadata
  const knownFields = new Set([
    'level',
    'message',
    'context',
    'timestamp',
    'ms',
    'stack',
    'correlationId',
    'splat',
    'symbol',
  ]);

  // Extract correlationId if present
  if (info.correlationId) {
    info.message = `(correlationId: ${String(info.correlationId)}) ${String(info.message)}`;
    delete info.correlationId;
  }

  // Extract any extra metadata fields
  const extraFields: Record<string, any> = {};
  for (const key in info) {
    if (
      !knownFields.has(key) &&
      Object.prototype.hasOwnProperty.call(info, key)
    ) {
      extraFields[key] = info[key];
      delete info[key];
    }
  }

  // If there are extra fields, JSON.stringify them and append to the message
  if (Object.keys(extraFields).length > 0) {
    info.message = `${String(info.message)} ${JSON.stringify(extraFields)}`;
  }

  return info;
})();
