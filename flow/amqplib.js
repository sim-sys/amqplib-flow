
declare class events$EventEmitter {
  static listenerCount(emitter: events$EventEmitter, event: string): number;

  addListener(event: string, listener: Function): events$EventEmitter;
  emit(event: string, ...args:Array<any>): boolean;
  listeners(event: string): Array<Function>;
  on(event: string, listener: Function): events$EventEmitter;
  once(event: string, listener: Function): events$EventEmitter;
  removeAllListeners(event?: string): events$EventEmitter;
  removeListener(event: string, listener: Function): events$EventEmitter;
  setMaxListeners(n: number): void;
}

type SocketOptions = {}; // TODO
type Args = { [key: string]: string };
type Headers = { [key: string]: string };

type QueueOptions = {
  exclusive?: boolean,
  durable?: boolean,
  autoDelete?: boolean,
  arguments?: Args,
  /* extenstions */
  messageTtl?: number,
  expires?: number,
  deadLetterExchange?: string,
  maxLength?: number,
  maxPriority?: number
};

type QueueOk = {
  queue: string,
  messageCount: number,
  consumerCount: number
};

type DeleteOk = {
  messageCount: number
};

type DeleteQueueOpts = {
  ifUnused?: boolean,
  ifEmpty?: boolean
};

type ExchangeType =
  | 'fanout'
  | 'direct'
  | 'topic'
  | 'headers'
;

type ExchangeOpts = {
  durable?: boolean,
  internal?: boolean,
  autoDelete?: boolean,
  alternateExchange?: string,
  arguments?: Args
};

type ExchangeOk = {
  exchange: string
};

type ExchangeDeleteOpts = {
  ifUnused?: boolean;
};

type PublishOpts = {
  expiration?: number,
  userId?: string,
  CC?: string | Array<string>,
  BCC?: string | Array<string>,
  priority?: number,
  persistent?: boolean,
  deliveryMode?: 1 | 2,
  mandatory?: boolean,
  contentType?: string,
  contentEncoding?: string,
  headers?: Headers,
  correlationId?: string,
  replyTo?: string,
  messageId?: string,
  timestamp?: number,
  type?: string,
  appId?: string
};

type ConsumeOpts = {
  consumerTag?: string,
  noLocal?: boolean,
  noAck?: boolean,
  exclusive?: boolean,
  priority?: number,
  arguments?: Args
};

type GetOpts = {
  noAck?: boolean
};

type Callback<T> = (err: Error, res: T) => any;

declare module "amqplib" {

  declare class Message {
    content: Buffer;
    fields: {
      deliveryTag: string,
      consumerTag: string,
      exchange: string,
      routingKey: string,
      redelivered: boolean
    };
    properties: PublishOpts;
  }

  declare class Channel extends events$EventEmitter{
    close(): Promise<void>;
    assertQueue(queue: ?string, options?: QueueOptions): Promise<QueueOk>;
    checkQueue(queue: string): Promise<QueueOk>;
    deleteQueue(queue: string, opts?: DeleteQueueOpts): Promise<DeleteOk>;
    purgeQueue(queue: string): Promise<DeleteOk>;
    bindQueue(queue: string, exchange: string, routingKey: string, args?: Args): Promise<void>;
    unbindQueue(queue: string, exchange: string, routingKey: string, args?: Args): Promise<void>;

    assertExchange(exchange: string, type: ExchangeType, opts?: ExchangeOpts): Promise<ExchangeOk>;
    checkExchange(exchange: string): Promise<ExchangeOk>; // TODO check return val
    deleteExchange(exchange: string, opts?: ExchangeDeleteOpts): Promise<void>;
    bindExchange(dst: string, src: string, routingKey: string, args?: Args): Promise<void>;
    unbindExchange(dst: string, src: string, routingKey: string, args?: Args): Promise<void>;

    publish(exchange: string, routingKey: string, content: Buffer, opts?: PublishOpts): boolean;
    sendToQueue(queue: string, content: Buffer, opts?: PublishOpts): boolean;

    consume(queue: string, fn: (msg: ?Message) => any, opts?: ConsumeOpts): Promise<{ consumerTag: string }>;
    cancel(consumerTag: string): Promise<{}>; // TODO
    get(queue: string, opts?: GetOpts): Promise<false | Message>;
    ack(message: Message, allUpTo?: boolean): void;
    ackAll(): void;
    nack(message: Message, allUpTo?: boolean, requeue?: boolean): void;
    nackAll(requeue?: boolean): void;
    reject(message: Message, requeue?: boolean): void;
    prefetch(count: number, global?: boolean): void;
    recover(): Promise<{}>
  }

  declare class ConfirmChannel extends Channel {
    publish(exchange: string, routingKey: string, content: Buffer, opts?: PublishOpts, cb?: Callback<{}>): boolean;
    sendToQueue(queue: string, content: Buffer, opts?: PublishOpts, cb?: Callback<{}>): boolean;
    waitForConfirms(): Promise<void>;
  }

  declare class Connection extends events$EventEmitter {
    close(): Promise<void>;
    createChannel(): Promise<Channel>;
    createConfirmChannel(): Promise<ConfirmChannel>;
  }

  declare function connect(url?: string, socketOptions?: SocketOptions): Promise<Connection>;
}
