const memos = new WeakMap();

function getMemo(obj) {
  let m = memos.get(obj);
  if (!m) {
    m = Object.create(null);
    memos.set(obj, m);
  }
  return m;
}

function memo(prop, getter) {
  return function () {
    const m = getMemo(this);
    return prop in m ? m[prop] : (m[prop] = getter.call(this));
  };
}

export function defineGetter(proto, prop, get) {
  Object.defineProperty(proto, prop, {
    configurable: false,
    enumerable: true,
    get
  });
}

export function defineMemoGetter(proto, prop, get) {
  defineGetter(proto, prop, memo(prop, get));
}
