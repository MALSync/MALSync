import { generateUniqueID } from './scriptProxyWrapper';

const logger = con.m('functionProxy');

export class FunctionProxy {
  protected callbacks: Record<
    string,
    {
      timer: NodeJS.Timer | undefined;
      resolve: (value: any) => void;
    }
  > = {};

  protected portPromise: Promise<MessagePort>;

  protected logger;

  constructor(protected port: 1 | 2) {
    this.portPromise = new Promise((resolve, reject) => {
      this.portResolver = resolve;
      this.portRejector = reject;
    });
    this.logger = logger.m(port);
    this.logger.log('created');
  }

  invoke<A extends any[], T>(method: string, args: A, timeout?: number) {
    this.logger.log('invoke', method, args, timeout);
    const id = generateUniqueID();
    return new Promise<T>((resolve, reject) => {
      this.portPromise.then(port => {
        this.callbacks[id] = {
          timer: timeout ? setTimeout(() => reject('invoke timeout'), timeout) : undefined,
          resolve,
        };
        port.postMessage({
          type: 'send',
          id,
          method,
          args,
        });
      });
    });
  }

  init(fn: (method: string, args: any[]) => any, timeout?: number) {
    this.logger.log('init', fn, timeout);
    return Promise.all([
      this.port === 1 ? this.getPort1(timeout) : this.getPort2(timeout),
      this.register(fn),
    ]);
  }

  protected portResolver: (value: MessagePort | PromiseLike<MessagePort>) => void = () => {};

  protected portRejector: (reason?: any) => void = () => {};

  protected async getPort1(timeout?: number) {
    const timer = timeout
      ? setTimeout(() => this.portRejector('getPort1 timeout'), timeout)
      : undefined;
    const channel = new MessageChannel();
    channel.port1.onmessage = e => {
      if (e.data === 'MAL_SYNC_FUNCTION_PROXY') {
        clearTimeout(timer);
        channel.port1.onmessage = null;
        this.portResolver(channel.port1);
        this.logger.log('getPort1 finished');
      }
    };
    window.postMessage('MAL_SYNC_FUNCTION_PROXY', '*', [channel.port2]);
    return this.portPromise;
  }

  protected getPort2(timeout?: number) {
    const timer = timeout
      ? setTimeout(() => this.portRejector('getPort2 timeout'), timeout)
      : undefined;
    window.addEventListener('message', e => {
      if (e.data === 'MAL_SYNC_FUNCTION_PROXY' && e.ports.length) {
        clearTimeout(timer);
        con.log('getPort2 finished');
        this.portResolver(e.ports[0]);
        e.ports[0].postMessage('MAL_SYNC_FUNCTION_PROXY');
        this.logger.log('getPort2 finished');
      }
    });
    return this.portPromise;
  }

  protected async register(fn: (method: string, args: any[]) => Promise<any> | any) {
    const port = await this.portPromise;
    port.onmessage = async e => {
      switch (e.data.type) {
        case 'send': {
          const value = await fn(e.data.method, e.data.args);
          this.logger.log('event send', e.data.id, e.data.method, e.data.args, value);
          port.postMessage({
            type: 'receive',
            id: e.data.id,
            value,
          });
          break;
        }
        case 'receive': {
          this.logger.log('event receive', e.data.id, e.data.value);
          const callback = this.callbacks[e.data.id];
          if (callback) {
            clearTimeout(callback.timer);
            callback.resolve(e.data.value);
          }
          break;
        }
        default:
      }
    };
    return port;
  }
}
