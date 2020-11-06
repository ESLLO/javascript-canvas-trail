const loop = (() => {
  const callbacks = [];
  let flag = true;
  const _on = (cb) => callbacks.push(cb);
  const _off = (cb) => (delete callbacks[callbacks.indexOf(cb)]);
  const _loop = (d) => {
    callbacks.forEach(cb => cb(d));
    flag && requestAnimationFrame(_loop);
  };
  _loop();
  return {
    on: _on,
    off: _off
  }
})();