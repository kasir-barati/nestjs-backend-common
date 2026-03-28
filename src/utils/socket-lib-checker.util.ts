import type { DefaultEventsMap, Socket as IoSocket } from 'socket.io';
import type { WebSocket as WsSocket } from 'ws';

export interface CorrelationWs extends WsSocket {
  correlationId?: string;
}
export interface CorrelationData {
  correlationId?: string;
}
export type TypedIoSocket = IoSocket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  CorrelationData
>;

export function isSocketIo(x: unknown): x is TypedIoSocket {
  const s = x as TypedIoSocket;
  return (
    !!s &&
    !!s.handshake &&
    typeof s.emit === 'function' &&
    typeof s.join === 'function'
  );
}

export function isWs(x: unknown): x is CorrelationWs {
  const s = x as CorrelationWs;
  return !!s && typeof s.send === 'function' && !('handshake' in s);
}
