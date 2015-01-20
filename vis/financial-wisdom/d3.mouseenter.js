(function() {
 
  // get a reference to the d3.selection prototype,
  // and keep a reference to the old d3.selection.on
  var d3_selectionPrototype = d3.selection.prototype,
      d3_on = d3_selectionPrototype.on;
 
  // our shims are organized by event:
  // "desired-event": ["shimmed-event", wrapperFunction]
  var shims = {
    "mouseenter": ["mouseover", relatedTarget],
    "mouseleave": ["mouseout", relatedTarget]
  };
 
  // rewrite the d3.selection.on function to shim the events with wrapped
  // callbacks
  d3_selectionPrototype.on = function(evt, callback, useCapture) {
    var bits = evt.split("."),
        type = bits.shift(),
        shim = shims[type];
    if (shim) {
      evt = [shim[0], bits].join(".");
      if (callback === null) {
        // then do the d3 on call with null to remove the callback
        return d3_on.call(this, evt, callback);
      } else {
        // wrap the callback to check the related target
        callback = shim[1].call(null, callback);
        return d3_on.call(this, evt, callback, useCapture);
      }
    } else {
      return d3_on.apply(this, arguments);
    } 
  };
 
  function relatedTarget(callback) {
    // wrap the callback to prevent too many mouseout fires
    // if the related target is a child of the target, don't fire
    return function() {
      var related = d3.event.relatedTarget;
      if (this === related || childOf(this, related)) {
        // it's a child (or it's the same thing), 
        // so don't fire
        return undefined; 
      }
      // otherwise fire, because the related target is something else
      return callback.apply(this, arguments);
    };
  }
 
  function childOf(p, c) {
    if (p === c) return false;
    while (c && c !== p) c = c.parentNode;
    return c === p;
  }
 
})();