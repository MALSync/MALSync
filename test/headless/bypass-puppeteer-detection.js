const {addEventListener, alert, confirm, prompt, console} = window;

addEventListener('load', () => {
  // Anti ondevtoolopen
  Object.defineProperty(document.body, 'innerHTML', {
    get() {
      return document.body.outerHTML.match(/(?<=<body[^>]*>)(?:(?!<\/body>).)*(?=<\/body>)/s)[0];
    },
    set() {
      throw 'ondevtoolopen stopped';
    }
  });

  // Anti script-use
  document.querySelector('[disable-devtool-auto]')?.remove();

  // Anti debug-lib
  delete window.eruda;
  delete window._vcOrigConsole;

  // Anti hackAlert
  window.alert = alert;
  window.confirm = confirm;
  window.prompt = prompt;

  console.log('Done disabling disable-devtool');
});

const keyMenuEvents = ['keydown', 'contextmenu', 'selectstart', 'copy', 'cut', 'paste'];

Object.assign(window, {
  addEventListener: new Proxy(window.addEventListener, {
    apply(target, thisArg, [type, listener, options]) {

      // Anti key-menu
      return target.call(thisArg, type, keyMenuEvents.includes(type) ? (e) => {
        let defaultPrevented = false;
        e = new Proxy(e ?? window.event, {
          get(target, property, receiver) {
            switch (property) {
              case 'preventDefault':
                return () => (defaultPrevented = true);
              default:
                return target[property];
            }
          },
          set(target, property, value, receiver) {
            if (property !== 'returnValue') {
              target[property] = value;
            }
            return true;
          }
        });
        if (listener(e) === false || !e.returnValue) {
          defaultPrevented = true;
        };
        if (defaultPrevented) {
          console.log('preventDefault on', type, 'prevented', {target, thisArg, type, listener, options});
        }
        return true;
      } : listener, options);
    }
  }),
  console: {
    ...console,
    log(...args) {
      if (args.length) {
        for (let arg of args) {

          if (arg?.__disable_devtool_flag__) {
            return;
          }

          if ((
            // Anti date-to-string
            arg instanceof Date && arg.hasOwnProperty('toString')
          ) || (
            // Anti func-to-string
            arg instanceof Function && arg.hasOwnProperty('toString')
          ) || (
            // Anti performance
            (arg instanceof Array && arg.length === 50 && new Set(arg).size === 1)
          ) || (
            // Anti reg-to-string
            arg instanceof RegExp && arg.hasOwnProperty('toString')
          )) {
            arg.__disable_devtool_flag__ === true;
            return;
          }
        }
        console.groupCollapsed(...args);
        console.trace();
        console.groupEnd();
      }
    },
    table(data, columns) {
      if (data instanceof Object) {

        if (data?.__disable_devtool_flag__) {
          return;
        }

        // Anti performance
        if (data instanceof Array && data.length === 50 && new Set(data).size === 1) {
          data.__disable_devtool_flag__ === true;
          return;
        }
        console.group('table');
        console.table(data, columns);
        console.groupCollapsed('trace');
        console.trace();
        console.groupEnd();
        console.groupEnd();
      } else if (arguments.length) {
        console.groupCollapsed(...arguments);
        console.trace();
        console.groupEnd();
      }
    },
    clear() {}
  },

  // Anti size
  innerWidth: Math.max(window.innerWidth, Math.ceil((window.outerWidth - 200) / window.devicePixelRatio)),
  innerHeight: Math.max(window.innerHeight, Math.ceil((window.outerHeight - 200) / window.devicePixelRatio)),

  Function: Function.prototype.constructor = new Proxy(Function, {
    apply(target, thisArg, argumentsList) {

      // Anti debugger statement
      if (argumentsList.length) {
        argumentsList[argumentsList.length - 1] = argumentsList[argumentsList.length - 1].replaceAll('debugger', '');
      }
      return target(...argumentsList);
    },
    construct(target, argumentsList, newTarget) {

      // Anti debugger statement
      if (argumentsList.length) {
        argumentsList[argumentsList.length - 1] = argumentsList[argumentsList.length - 1].replaceAll('debugger', '');
      }
      return new target(...argumentsList);
    }
  }),
  setInterval: new Proxy(window.setInterval, {
    apply(target, thisArg, [arg0, delay, ...args]) {
      const func = arg0 instanceof Function ? arg0 : new Function(arg0);
      return target.call(thisArg, function () {

        // Anti app_version cookie
        document.cookie = 'app_version=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

        // Anti sourceVersion cookie
        document.cookie = 'sourceVersion=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        return func.apply(this, arguments);
      }, delay, ...args);
    }
  }),
  setTimeout: new Proxy(window.setTimeout, {
    apply(target, thisArg, [arg0, delay, ...args]) {
      const func = arg0 instanceof Function ? arg0 : new Function(arg0);
      return target.call(thisArg, function () {

        // Anti app_version cookie
        document.cookie = 'app_version=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

        // Anti sourceVersion cookie
        document.cookie = 'sourceVersion=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        return func.apply(this, arguments);
      }, delay, ...args);
    }
  })
});

// Anti define-id
Object.assign(Object.prototype, {
  __defineGetter__: new Proxy(Object.prototype.__defineGetter__, {
    apply(target, thisArg, [prop, descriptor]) {
      if (thisArg instanceof HTMLDivElement) {
        thisArg.__disable_devtool_flag__ = true;
        return thisArg;
      } else {
        return target.apply(thisArg, [prop, descriptor]);
      }
    }
  })
});
Object.assign(Object, {
  defineProperty: new Proxy(Object.defineProperty, {
    apply(target, thisArg, [obj, prop, descriptor]) {
      if (obj instanceof HTMLDivElement) {
        thisArg.__disable_devtool_flag__ = true;
        return obj;
      } else {
        return target.apply(thisArg, [obj, prop, descriptor]);
      }
    }
  })
});

// Destroy onDevToolOpen
const dummyOnDevToolOpen = () => {};
Object.assign(Array.prototype, {
  push: new Proxy(Array.prototype.push, {
    apply(target, thisArg, args) {
      for (let elem of args) {
        if (elem?.onDevToolOpen && elem?.onDevToolOpen !== dummyOnDevToolOpen) {
          while (!elem.hasOwnProperty('onDevToolOpen')) {
            elem = Object.getPrototypeOf(elem);
          }
          elem.onDevToolOpen = dummyOnDevToolOpen;
        }
      }
      return target.apply(thisArg, args);
    }
  })
});
