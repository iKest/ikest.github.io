(function () {
	'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var stats_min = createCommonjsModule(function (module, exports) {
	!function(e,t){module.exports=t();}(commonjsGlobal,function(){var c=function(){var n=0,l=document.createElement("div");function e(e){return l.appendChild(e.dom),e}function t(e){for(var t=0;t<l.children.length;t++)l.children[t].style.display=t===e?"block":"none";n=e;}l.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000",l.addEventListener("click",function(e){e.preventDefault(),t(++n%l.children.length);},!1);var i=(performance||Date).now(),a=i,o=0,f=e(new c.Panel("FPS","#0ff","#002")),r=e(new c.Panel("MS","#0f0","#020"));if(self.performance&&self.performance.memory)var d=e(new c.Panel("MB","#f08","#201"));return t(0),{REVISION:16,dom:l,addPanel:e,showPanel:t,begin:function(){i=(performance||Date).now();},end:function(){o++;var e=(performance||Date).now();if(r.update(e-i,200),a+1e3<=e&&(f.update(1e3*o/(e-a),100),a=e,o=0,d)){var t=performance.memory;d.update(t.usedJSHeapSize/1048576,t.jsHeapSizeLimit/1048576);}return e},update:function(){i=this.end();},domElement:l,setMode:t}};return c.Panel=function(n,l,i){var a=1/0,o=0,f=Math.round,r=f(window.devicePixelRatio||1),d=80*r,e=48*r,c=3*r,p=2*r,u=3*r,s=15*r,m=74*r,h=30*r,y=document.createElement("canvas");y.width=d,y.height=e,y.style.cssText="width:80px;height:48px";var v=y.getContext("2d");return v.font="bold "+9*r+"px Helvetica,Arial,sans-serif",v.textBaseline="top",v.fillStyle=i,v.fillRect(0,0,d,e),v.fillStyle=l,v.fillText(n,c,p),v.fillRect(u,s,m,h),v.fillStyle=i,v.globalAlpha=.9,v.fillRect(u,s,m,h),{dom:y,update:function(e,t){a=Math.min(a,e),o=Math.max(o,e),v.fillStyle=i,v.globalAlpha=1,v.fillRect(0,0,d,s),v.fillStyle=l,v.fillText(f(e)+" "+n+" ("+f(a)+"-"+f(o)+")",c,p),v.drawImage(y,u+r,s,m-r,h,u,s,m-r,h),v.fillRect(u+m-r,s,r,h),v.fillStyle=i,v.globalAlpha=.9,v.fillRect(u+m-r,s,r,f((1-e/t)*h));}}},c});
	});

	const MAP_WIDTH = 5000; // map width
	const MAP_HEIGHT = 5000; // map height

	const SPEED = 300; // speed of snake
	const BASE_ANGLE = 200 * Math.PI; // base angle of snake

	const MAP_RECT_WIDTH = 200; // map small rect width
	const MAP_RECT_HEIGHT = 200; // map small rect height

	const SNAKE_IMG_SIZE = 40; // size of snake's image
	const SNAKE_LENGTH = 1; // length of snake
	const SNAKE_OFFSET = -6;

	const INIT_FOOD_COUNT = 1000;
	const FOOD_SIZE = 15;

	const COLORS = new Map([
	    ['purple-lavender', ['#911eb4', '#e6beff']],
	    ['green-mint', ['#3cb44b', '#aaffc3']],
	    ['blue-cian', ['#4363d8', '#42d4f4']],
	    ['navi-teal', ['#000075', '#469990']],
	    ['olive-lime', ['#808000', '#bfef45']],
	    ['yellow-biege', ['#ffe119', '#fffac8']],
	    ['orange-apricot', ['#f58231', '#ffd8b1']],
	    ['red-pink', ['#e6194B', '#fabebe']],
	    ['maroon-brown', ['#800000', '#9A6324']]
	]);

	var eventemitter3 = createCommonjsModule(function (module) {

	var has = Object.prototype.hasOwnProperty
	  , prefix = '~';

	/**
	 * Constructor to create a storage for our `EE` objects.
	 * An `Events` instance is a plain object whose properties are event names.
	 *
	 * @constructor
	 * @api private
	 */
	function Events() {}

	//
	// We try to not inherit from `Object.prototype`. In some engines creating an
	// instance in this way is faster than calling `Object.create(null)` directly.
	// If `Object.create(null)` is not supported we prefix the event names with a
	// character to make sure that the built-in object properties are not
	// overridden or used as an attack vector.
	//
	if (Object.create) {
	  Events.prototype = Object.create(null);

	  //
	  // This hack is needed because the `__proto__` property is still inherited in
	  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
	  //
	  if (!new Events().__proto__) prefix = false;
	}

	/**
	 * Representation of a single event listener.
	 *
	 * @param {Function} fn The listener function.
	 * @param {Mixed} context The context to invoke the listener with.
	 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
	 * @constructor
	 * @api private
	 */
	function EE(fn, context, once) {
	  this.fn = fn;
	  this.context = context;
	  this.once = once || false;
	}

	/**
	 * Minimal `EventEmitter` interface that is molded against the Node.js
	 * `EventEmitter` interface.
	 *
	 * @constructor
	 * @api public
	 */
	function EventEmitter() {
	  this._events = new Events();
	  this._eventsCount = 0;
	}

	/**
	 * Return an array listing the events for which the emitter has registered
	 * listeners.
	 *
	 * @returns {Array}
	 * @api public
	 */
	EventEmitter.prototype.eventNames = function eventNames() {
	  var names = []
	    , events
	    , name;

	  if (this._eventsCount === 0) return names;

	  for (name in (events = this._events)) {
	    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
	  }

	  if (Object.getOwnPropertySymbols) {
	    return names.concat(Object.getOwnPropertySymbols(events));
	  }

	  return names;
	};

	/**
	 * Return the listeners registered for a given event.
	 *
	 * @param {String|Symbol} event The event name.
	 * @param {Boolean} exists Only check if there are listeners.
	 * @returns {Array|Boolean}
	 * @api public
	 */
	EventEmitter.prototype.listeners = function listeners(event, exists) {
	  var evt = prefix ? prefix + event : event
	    , available = this._events[evt];

	  if (exists) return !!available;
	  if (!available) return [];
	  if (available.fn) return [available.fn];

	  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
	    ee[i] = available[i].fn;
	  }

	  return ee;
	};

	/**
	 * Calls each of the listeners registered for a given event.
	 *
	 * @param {String|Symbol} event The event name.
	 * @returns {Boolean} `true` if the event had listeners, else `false`.
	 * @api public
	 */
	EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
	  var evt = prefix ? prefix + event : event;

	  if (!this._events[evt]) return false;

	  var listeners = this._events[evt]
	    , len = arguments.length
	    , args
	    , i;

	  if (listeners.fn) {
	    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

	    switch (len) {
	      case 1: return listeners.fn.call(listeners.context), true;
	      case 2: return listeners.fn.call(listeners.context, a1), true;
	      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
	      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
	      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
	      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
	    }

	    for (i = 1, args = new Array(len -1); i < len; i++) {
	      args[i - 1] = arguments[i];
	    }

	    listeners.fn.apply(listeners.context, args);
	  } else {
	    var length = listeners.length
	      , j;

	    for (i = 0; i < length; i++) {
	      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

	      switch (len) {
	        case 1: listeners[i].fn.call(listeners[i].context); break;
	        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
	        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
	        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
	        default:
	          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
	            args[j - 1] = arguments[j];
	          }

	          listeners[i].fn.apply(listeners[i].context, args);
	      }
	    }
	  }

	  return true;
	};

	/**
	 * Add a listener for a given event.
	 *
	 * @param {String|Symbol} event The event name.
	 * @param {Function} fn The listener function.
	 * @param {Mixed} [context=this] The context to invoke the listener with.
	 * @returns {EventEmitter} `this`.
	 * @api public
	 */
	EventEmitter.prototype.on = function on(event, fn, context) {
	  var listener = new EE(fn, context || this)
	    , evt = prefix ? prefix + event : event;

	  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
	  else if (!this._events[evt].fn) this._events[evt].push(listener);
	  else this._events[evt] = [this._events[evt], listener];

	  return this;
	};

	/**
	 * Add a one-time listener for a given event.
	 *
	 * @param {String|Symbol} event The event name.
	 * @param {Function} fn The listener function.
	 * @param {Mixed} [context=this] The context to invoke the listener with.
	 * @returns {EventEmitter} `this`.
	 * @api public
	 */
	EventEmitter.prototype.once = function once(event, fn, context) {
	  var listener = new EE(fn, context || this, true)
	    , evt = prefix ? prefix + event : event;

	  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
	  else if (!this._events[evt].fn) this._events[evt].push(listener);
	  else this._events[evt] = [this._events[evt], listener];

	  return this;
	};

	/**
	 * Remove the listeners of a given event.
	 *
	 * @param {String|Symbol} event The event name.
	 * @param {Function} fn Only remove the listeners that match this function.
	 * @param {Mixed} context Only remove the listeners that have this context.
	 * @param {Boolean} once Only remove one-time listeners.
	 * @returns {EventEmitter} `this`.
	 * @api public
	 */
	EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
	  var evt = prefix ? prefix + event : event;

	  if (!this._events[evt]) return this;
	  if (!fn) {
	    if (--this._eventsCount === 0) this._events = new Events();
	    else delete this._events[evt];
	    return this;
	  }

	  var listeners = this._events[evt];

	  if (listeners.fn) {
	    if (
	         listeners.fn === fn
	      && (!once || listeners.once)
	      && (!context || listeners.context === context)
	    ) {
	      if (--this._eventsCount === 0) this._events = new Events();
	      else delete this._events[evt];
	    }
	  } else {
	    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
	      if (
	           listeners[i].fn !== fn
	        || (once && !listeners[i].once)
	        || (context && listeners[i].context !== context)
	      ) {
	        events.push(listeners[i]);
	      }
	    }

	    //
	    // Reset the array, or remove it completely if we have no more listeners.
	    //
	    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
	    else if (--this._eventsCount === 0) this._events = new Events();
	    else delete this._events[evt];
	  }

	  return this;
	};

	/**
	 * Remove all listeners, or those of the specified event.
	 *
	 * @param {String|Symbol} [event] The event name.
	 * @returns {EventEmitter} `this`.
	 * @api public
	 */
	EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
	  var evt;

	  if (event) {
	    evt = prefix ? prefix + event : event;
	    if (this._events[evt]) {
	      if (--this._eventsCount === 0) this._events = new Events();
	      else delete this._events[evt];
	    }
	  } else {
	    this._events = new Events();
	    this._eventsCount = 0;
	  }

	  return this;
	};

	//
	// Alias methods names because people roll like that.
	//
	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
	EventEmitter.prototype.addListener = EventEmitter.prototype.on;

	//
	// This function doesn't apply anymore.
	//
	EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
	  return this;
	};

	//
	// Expose the prefix.
	//
	EventEmitter.prefixed = prefix;

	//
	// Allow `EventEmitter` to be imported as module namespace.
	//
	EventEmitter.EventEmitter = EventEmitter;

	//
	// Expose the module.
	//
	{
	  module.exports = EventEmitter;
	}
	});

	/**
	 * circle-point collision
	 * @param {number} x1 center of circle
	 * @param {number} y1 center of circle
	 * @param {radius} r1 radius of circle
	 * @param {number} x2 point
	 * @param {number} y2 point
	 * @return {boolean}
	 */
	var circlePoint = function circlePoint(x1, y1, r1, x2, y2)
	{
	    var x = x2 - x1;
	    var y = y2 - y1;
	    return x * x + y * y <= r1 * r1
	};

	/**
	 * circle-circle collision
	 * @param {number} x1 center of circle 1
	 * @param {number} y1 center of circle 1
	 * @param {number} r1 radius of circle 1
	 * @param {number} x2 center of circle 2
	 * @param {number} y2 center of circle 2
	 * @param {number} r2 radius of circle 2
	 * @return {boolean}
	 */
	var circleCircle = function circleCircle(x1, y1, r1, x2, y2, r2)
	{
	    var x = x1 - x2;
	    var y = y2 - y1;
	    var radii = r1 + r2;
	    return x * x + y * y <= radii * radii
	};

	/**
	 * line-circle collision
	 number @param {number} x1 point 1 of line
	 number @param {number} y1 point 1 of line
	 number @param {number} x2 point 2 of line
	 number @param {number} y2 point 2 of line
	 number @param {number} xc center of circle
	 number @param {number} yc center of circle
	 number @param {number} rc radius of circle
	 */
	var lineCircle = function lineCircle(x1, y1, x2, y2, xc, yc, rc)
	{
	    var ac = [xc - x1, yc - y1];
	    var ab = [x2 - x1, y2 - y1];
	    var ab2 = dot(ab, ab);
	    var acab = dot(ac, ab);
	    var t = acab / ab2;
	    t = (t < 0) ? 0 : t;
	    t = (t > 1) ? 1 : t;
	    var h = [(ab[0] * t + x1) - xc, (ab[1] * t + y1) - yc];
	    var h2 = dot(h, h);
	    return h2 <= rc * rc
	};

	function dot(v1, v2)
	{
	    return (v1[0] * v2[0]) + (v1[1] * v2[1])
	}

	/**
	 * circle-line collision
	 * from http://stackoverflow.com/a/10392860/1955997
	 * @param {number} xc center of circle
	 * @param {number} yc center of circle
	 * @param {radius} rc radius of circle
	 * @param {number} x1 first point of line
	 * @param {number} y1 first point of line
	 * @param {number} x2 second point of line
	 * @param {number} y2 second point of line
	 * @return {boolean}
	 */
	var circleLine = function circleLine(xc, yc, rc, x1, y1, x2, y2)
	{
	    return lineCircle(x1, y1, x2, y2, xc, yc, rc)
	};

	/**
	 * box-circle collision
	 * @param {number} xb top-left corner of box
	 * @param {number} yb top-left corner of box
	 * @param {number} wb width of box
	 * @param {number} hb height of box
	 * @param {number} xc center of circle
	 * @param {number} yc center of circle
	 * @param {number} rc radius of circle
	 */
	var boxCircle = function boxCircle(xb, yb, wb, hb, xc, yc, rc)
	{
	    var hw = wb / 2;
	    var hh = hb / 2;
	    var distX = Math.abs(xc - (xb + wb / 2));
	    var distY = Math.abs(yc - (yb + hb / 2));

	    if (distX > hw + rc || distY > hh + rc)
	    {
	        return false
	    }

	    if (distX <= hw || distY <= hh)
	    {
	        return true
	    }

	    var x = distX - hw;
	    var y = distY - hh;
	    return x * x + y * y <= rc * rc
	};

	/**
	 * circle-box (axis-oriented rectangle) collision
	 * from http://stackoverflow.com/a/402010/1955997
	 * @param {number} xc center of circle
	 * @param {number} yc center of circle
	 * @param {radius} rc radius of circle
	 * @param {number} xb top-left corner of rectangle
	 * @param {number} yb top-left corner of rectangle
	 * @param {number} wb width of rectangle
	 * @param {number} hb height of rectangle
	 */
	var circleBox = function circleBox(xc, yc, rc, xb, yb, wb, hb)
	{
	    return boxCircle(xb, yb, wb, hb, xc, yc, rc)
	};

	function distanceSquared(x1, y1, x2, y2)
	{
	    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
	}

	/**
	 * line-point collision
	 * from https://stackoverflow.com/a/17693146/1955997
	 * @param {number} x1 first point in line
	 * @param {number} y1 first point in line
	 * @param {number} x2 second point in line
	 * @param {number} y2 second point in line
	 * @param {number} xp point
	 * @param {number} yp point
	 * @param {number} [tolerance=1]
	 * @return {boolean}
	 */
	var linePoint = function linePoint(x1, y1, x2, y2, xp, yp, tolerance)
	{
	    tolerance = tolerance || 1;
	    return Math.abs(distanceSquared(x1, y1, x2, y2) - (distanceSquared(x1, y1, xp, yp) + distanceSquared(x2, y2, xp, yp))) <= tolerance
	};

	/**
	 * polygon-point collision
	 * based on https://stackoverflow.com/a/17490923/1955997
	 * @param {number[]} points [x1, y1, x2, y2, ... xn, yn] of polygon
	 * @param {number} x of point
	 * @param {number} y of point
	 * @param {number} [tolerance=1] maximum distance of point to polygon's edges that triggers collision (see pointLine)
	 */
	var polygonPoint = function polygonPoint(points, x, y, tolerance)
	{
	    var length = points.length;
	    var c = false;
	    var i, j;
	    for (i = 0, j = length - 2; i < length; i += 2)
	    {
	        if (((points[i + 1] > y) !== (points[j + 1] > y)) && (x < (points[j] - points[i]) * (y - points[i + 1]) / (points[j + 1] - points[i + 1]) + points[i]))
	        {
	            c = !c;
	        }
	        j = i;
	    }
	    if (c)
	    {
	        return true
	    }
	    for (i = 0; i < length; i += 2)
	    {
	        var p1x = points[i];
	        var p1y = points[i + 1];
	        var p2x, p2y;
	        if (i === length - 2)
	        {
	            p2x = points[0];
	            p2y = points[1];
	        }
	        else
	        {
	            p2x = points[i + 2];
	            p2y = points[i + 3];
	        }
	        if (linePoint(p1x, p1y, p2x, p2y, x, y, tolerance))
	        {
	            return true
	        }
	    }
	    return false
	};

	/**
	 * polygon-circle collision
	 * @param {number[]} points [x1, y1, x2, y2, ... xn, yn] of polygon
	 * @param {number} xc center of circle
	 * @param {number} yc center of circle
	 * @param {number} rc radius of circle
	 */
	var polygonCircle = function polygonCircle(points, xc, yc, rc)
	{
	    if (polygonPoint(points, xc, yc))
	    {
	        return true
	    }
	    var count = points.length;
	    for (var i = 0; i < count - 2; i += 2)
	    {
	        if (lineCircle(points[i], points[i + 1], points[i + 2], points[i + 3], xc, yc, rc))
	        {
	            return true
	        }
	    }
	    return lineCircle(points[0], points[1], points[count - 2], points[count - 1], xc, yc, rc)
	};

	/**
	 * circle-polygon collision
	 * from http://stackoverflow.com/a/402019/1955997
	 * @param {number} xc center of circle
	 * @param {number} yc center of circle
	 * @param {radius} rc radius of circle
	 * @param {number[]} points [x1, y1, x2, y2, ... xn, yn] of polygon
	 */
	var circlePolygon = function circlePolygon(xc, yc, rc, points)
	{
	    return polygonCircle(points, xc, yc, rc)
	};

	// from http://yehar.com/blog/?p=2926

	var MAX_ITERATIONS = 10;
	var innerPolygonCoef, outerPolygonCoef, initialized;

	function initialize()
	{
	    innerPolygonCoef = [];
	    outerPolygonCoef = [];
	    for (var t = 0; t <= MAX_ITERATIONS; t++)
	    {
	        var numNodes = 4 << t;
	        innerPolygonCoef[t] = 0.5 / Math.cos(4 * Math.acos(0) / numNodes);
	        outerPolygonCoef[t] = 0.5 / (Math.cos(2 * Math.acos(0) / numNodes) * Math.cos(2 * Math.acos(0) / numNodes));
	    }
	    initialized = true;
	}

	function iterate(x, y, c0x, c0y, c2x, c2y, rr)
	{
	    for (var t = 1; t <= MAX_ITERATIONS; t++)
	    {
	        var c1x = (c0x + c2x) * innerPolygonCoef[t];
	        var c1y = (c0y + c2y) * innerPolygonCoef[t];
	        var tx = x - c1x;
	        var ty = y - c1y;
	        if (tx * tx + ty * ty <= rr)
	        {
	            return true
	        }
	        var t2x = c2x - c1x;
	        var t2y = c2y - c1y;
	        if (tx * t2x + ty * t2y >= 0 && tx * t2x + ty * t2y <= t2x * t2x + t2y * t2y &&
	            (ty * t2x - tx * t2y >= 0 || rr * (t2x * t2x + t2y * t2y) >= (ty * t2x - tx * t2y) * (ty * t2x - tx * t2y)))
	        {
	            return true
	        }
	        var t0x = c0x - c1x;
	        var t0y = c0y - c1y;
	        if (tx * t0x + ty * t0y >= 0 && tx * t0x + ty * t0y <= t0x * t0x + t0y * t0y &&
	            (ty * t0x - tx * t0y <= 0 || rr * (t0x * t0x + t0y * t0y) >= (ty * t0x - tx * t0y) * (ty * t0x - tx * t0y)))
	        {
	            return true
	        }
	        var c3x = (c0x + c1x) * outerPolygonCoef[t];
	        var c3y = (c0y + c1y) * outerPolygonCoef[t];
	        if ((c3x - x) * (c3x - x) + (c3y - y) * (c3y - y) < rr)
	        {
	            c2x = c1x;
	            c2y = c1y;
	            continue
	        }
	        var c4x = c1x - c3x + c1x;
	        var c4y = c1y - c3y + c1y;
	        if ((c4x - x) * (c4x - x) + (c4y - y) * (c4y - y) < rr)
	        {
	            c0x = c1x;
	            c0y = c1y;
	            continue
	        }
	        var t3x = c3x - c1x;
	        var t3y = c3y - c1y;
	        if (ty * t3x - tx * t3y <= 0 || rr * (t3x * t3x + t3y * t3y) > (ty * t3x - tx * t3y) * (ty * t3x - tx * t3y))
	        {
	            if (tx * t3x + ty * t3y > 0)
	            {
	                if (Math.abs(tx * t3x + ty * t3y) <= t3x * t3x + t3y * t3y || (x - c3x) * (c0x - c3x) + (y - c3y) * (c0y - c3y) >= 0)
	                {
	                    c2x = c1x;
	                    c2y = c1y;
	                    continue
	                }
	            } else if (-(tx * t3x + ty * t3y) <= t3x * t3x + t3y * t3y || (x - c4x) * (c2x - c4x) + (y - c4y) * (c2y - c4y) >= 0)
	            {
	                c0x = c1x;
	                c0y = c1y;
	                continue
	            }
	        }
	        return false
	    }
	    return false // Out of iterations so it is unsure if there was a collision. But have to return something.
	}

	// Test for collision between an ellipse of horizontal radius w0 and vertical radius h0 at (x0, y0) and
	// an ellipse of horizontal radius w1 and vertical radius h1 at (x1, y1)
	function ellipseEllipse(x0, y0, w0, h0, x1, y1, w1, h1)
	{
	    if (!initialized)
	    {
	        initialize();
	    }

	    var x = Math.abs(x1 - x0) * h1;
	    var y = Math.abs(y1 - y0) * w1;
	    w0 *= h1;
	    h0 *= w1;
	    var r = w1 * h1;

	    if (x * x + (h0 - y) * (h0 - y) <= r * r || (w0 - x) * (w0 - x) + y * y <= r * r || x * h0 + y * w0 <= w0 * h0
	        || ((x * h0 + y * w0 - w0 * h0) * (x * h0 + y * w0 - w0 * h0) <= r * r * (w0 * w0 + h0 * h0) && x * w0 - y * h0 >= -h0 * h0 && x * w0 - y * h0 <= w0 * w0))
	    {
	        return true
	    }
	    else
	    {
	        if ((x - w0) * (x - w0) + (y - h0) * (y - h0) <= r * r || (x <= w0 && y - r <= h0) || (y <= h0 && x - r <= w0))
	        {
	            return iterate(x, y, w0, 0, 0, h0, r * r)
	        }
	        return false
	    }
	}

	// Test for collision between an ellipse of horizontal radius w and vertical radius h at (x0, y0) and
	// a circle of radius r at (x1, y1)
	function ellipseCircle(x0, y0, w, h, x1, y1, r)
	{
	    if (!initialized)
	    {
	        initialize();
	    }
	    var x = Math.abs(x1 - x0);
	    var y = Math.abs(y1 - y0);

	    if (x * x + (h - y) * (h - y) <= r * r || (w - x) * (w - x) + y * y <= r * r || x * h + y * w <= w * h
	        || ((x * h + y * w - w * h) * (x * h + y * w - w * h) <= r * r * (w * w + h * h) && x * w - y * h >= -h * h && x * w - y * h <= w * w))
	    {
	        return true
	    }
	    else
	    {
	        if ((x - w) * (x - w) + (y - h) * (y - h) <= r * r || (x <= w && y - r <= h) || (y <= h && x - r <= w))
	        {
	            return iterate(x, y, w, 0, 0, h, r * r)
	        }
	        return false
	    }
	}

	var ellipseHelper = {
	    ellipseCircle: ellipseCircle,
	    ellipseEllipse: ellipseEllipse
	};

	/**
	 * ellipse-circle collision
	 * @param {number} xe center of ellipse
	 * @param {number} ye center of ellipse
	 * @param {number} rex radius-x of ellipse
	 * @param {number} rey radius-y of ellipse
	 * @param {number} xc center of circle
	 * @param {number} yc center of circle
	 * @param {number} rc radius of circle
	 * @return {boolean}
	 */
	var ellipseCircle$1 = function ellipseCircle(xe, ye, rex, rey, xc, yc, rc)
	{
	    return ellipseHelper.ellipseCircle(xe, ye, rex, rey, xc, yc, rc)
	};

	/**
	 * circle-ellipse collision
	 * @param {number} xc center of circle
	 * @param {number} yc center of circle
	 * @param {number} rc radius of circle
	 * @param {number} xe center of ellipse
	 * @param {number} ye center of ellipse
	 * @param {number} rex radius-x of ellipse
	 * @param {number} rey radius-y of ellipse
	 * @return {boolean}
	 */
	var circleEllipse = function circleEllipse(xc, yc, rc, xe, ye, rex, rey)
	{
	    return ellipseCircle$1(xe, ye, rex, rey, xc, yc, rc)
	};

	/**
	 * line-line collision
	 * from http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
	 * @param {number} x1 first point in line 1
	 * @param {number} y1 first point in line 1
	 * @param {number} x2 second point in line 1
	 * @param {number} y2 second point in line 1
	 * @param {number} x3 first point in line 2
	 * @param {number} y3 first point in line 2
	 * @param {number} x4 second point in line 2
	 * @param {number} y4 second point in line 2
	 * @return {boolean}
	 */
	var lineLine = function lineLine(x1, y1, x2, y2, x3, y3, x4, y4)
	{
	    var s1_x = x2 - x1;
	    var s1_y = y2 - y1;
	    var s2_x = x4 - x3;
	    var s2_y = y4 - y3;
	    var s = (-s1_y * (x1 - x3) + s1_x * (y1 - y3)) / (-s2_x * s1_y + s1_x * s2_y);
	    var t = (s2_x * (y1 - y3) - s2_y * (x1 - x3)) / (-s2_x * s1_y + s1_x * s2_y);
	    return s >= 0 && s <= 1 && t >= 0 && t <= 1
	};

	/**
	 * line-polygon collision
	 @param {number} x1 point 1 of line
	 @param {number} y1 point 1 of line
	 @param {number} x2 point 2 of line
	 @param {number} y2 point 2 of line
	 @param {number[]} points of polygon
	 @param {tolerance=1} maximum distance of point to polygon's edges that triggers collision (see pointLine)
	 */
	var linePolygon = function linePolygon(x1, y1, x2, y2, points, tolerance)
	{
	    var length = points.length;

	    // check if first point is inside the shape (this covers if the line is completely enclosed by the shape)
	    if (polygonPoint(points, x1, y1, tolerance))
	    {
	        return true
	    }

	    // check for intersections for all of the sides
	    for (var i = 0; i < length; i += 2)
	    {
	        var j = (i + 2) % length;
	        if (lineLine(x1, y1, x2, y2, points[i], points[i + 1], points[j], points[j + 1]))
	        {
	            return true
	        }
	    }
	    return false
	};

	/**
	 * polygon-line collisions
	 * @param {number[]} points [x1, y1, x2, y2, ... xn, yn] of polygon
	 * @param {number} x1 first point in line
	 * @param {number} y1 first point in line
	 * @param {number} x2 second point in line
	 * @param {number} y2 second point in line
	 * @param {tolerance=1} maximum distance of point to polygon's edges that triggers collision (see pointLine)
	 * @return {boolean}
	 */
	var polygonLine = function polygonLine(points, x1, y1, x2, y2, tolerance)
	{
	    return linePolygon(x1, y1, x2, y2, points, tolerance)
	};

	/**
	 * polygon-polygon collision
	 * based on http://stackoverflow.com/questions/10962379/how-to-check-intersection-between-2-rotated-rectangles
	 * @param {number[]} points1 [x1, y1, x2, y2, ... xn, yn] of first polygon
	 * @param {number[]} points2 [x1, y1, x2, y2, ... xn, yn] of second polygon
	 * @return {boolean}
	 */
	var polygonPolygon = function polygonPolygon(points1, points2)
	{
	    var a = points1;
	    var b = points2;
	    var polygons = [a, b];
	    var minA, maxA, projected, minB, maxB, j;
	    for (var i = 0; i < polygons.length; i++)
	    {
	        var polygon = polygons[i];
	        for (var i1 = 0; i1 < polygon.length; i1 += 2)
	        {
	            var i2 = (i1 + 2) % polygon.length;
	            var normal = { x: polygon[i2 + 1] - polygon[i1 + 1], y: polygon[i1] - polygon[i2] };
	            minA = maxA = null;
	            for (j = 0; j < a.length; j += 2)
	            {
	                projected = normal.x * a[j] + normal.y * a[j + 1];
	                if (minA === null || projected < minA)
	                {
	                    minA = projected;
	                }
	                if (maxA === null || projected > maxA)
	                {
	                    maxA = projected;
	                }
	            }
	            minB = maxB = null;
	            for (j = 0; j < b.length; j += 2)
	            {
	                projected = normal.x * b[j] + normal.y * b[j + 1];
	                if (minB === null || projected < minB)
	                {
	                    minB = projected;
	                }
	                if (maxB === null || projected > maxB)
	                {
	                    maxB = projected;
	                }
	            }
	            if (maxA < minB || maxB < minA)
	            {
	                return false
	            }
	        }
	    }
	    return true
	};

	/**
	 * polygon-box collision
	 * @param {number[]} points [x1, y1, x2, y2, ... xn, yn] of polygon
	 * @param {number} x of box
	 * @param {number} y of box
	 * @param {number} w of box
	 * @param {number} h of box
	 */
	var polygonBox = function polygonBox(points, x, y, w, h)
	{
	    var points2 = [x, y, x + w, y, x + w, y + h, x, y + h];
	    return polygonPolygon(points, points2)
	};

	/**
	 * ellipse-line collision
	 * adapted from http://csharphelper.com/blog/2017/08/calculate-where-a-line-segment-and-an-ellipse-intersect-in-c/
	 * @param {number} xe center of ellipse
	 * @param {number} ye center of ellipse
	 * @param {number} rex radius-x of ellipse
	 * @param {number} rey radius-y of ellipse
	 * @param {number} x1 first point of line
	 * @param {number} y1 first point of line
	 * @param {number} x2 second point of line
	 * @param {number} y2 second point of line
	 */
	var ellipseLine = function ellipseLine(xe, ye, rex, rey, x1, y1, x2, y2)
	{
	    x1 -= xe;
	    x2 -= xe;
	    y1 -= ye;
	    y2 -= ye;

	    var A = Math.pow(x2 - x1, 2) / rex / rex + Math.pow(y2 - y1, 2) / rey / rey;
	    var B = 2 * x1 * (x2 - x1) / rex / rex + 2 * y1 * (y2 - y1) / rey / rey;
	    var C = x1 * x1 / rex / rex + y1 * y1 / rey / rey - 1;
	    var D = B * B - 4 * A * C;
	    if (D === 0)
	    {
	        var t = -B / 2 / A;
	        return t >= 0 && t <= 1
	    }
	    else if (D > 0)
	    {
	        var sqrt = Math.sqrt(D);
	        var t1 = (-B + sqrt) / 2 / A;
	        var t2 = (-B - sqrt) / 2 / A;
	        return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)
	    }
	    else
	    {
	        return false
	    }
	};

	/**
	 * line-ellipse collision
	 * @param {number} x1 first point of line
	 * @param {number} y1 first point of line
	 * @param {number} x2 second point of line
	 * @param {number} y2 second point of line
	 * @param {number} xe center of ellipse
	 * @param {number} ye center of ellipse
	 * @param {number} rx radius-x of ellipse
	 * @param {number} ry radius-y of ellipse
	 */
	var lineEllipse = function lineEllipse(x1, y1, x2, y2, xe, ye, rex, rey)
	{
	    return ellipseLine(xe, ye, rex, rey, x1, y1, x2, y2)
	};

	/**
	 * polygon-ellipse collision
	 * @param {number[]} points [x1, y1, x2, y2, ... xn, yn] of polygon
	 * @param {number} xe center of ellipse
	 * @param {number} ye center of ellipse
	 * @param {number} rex radius-x of ellipse
	 * @param {number} rey radius-y of ellipse
	 */
	var polygonEllipse = function polygonEllipse(points, xe, ye, rex, rey)
	{
	    if (polygonPoint(points, xe, ye))
	    {
	        return true
	    }
	    var count = points.length;
	    for (var i = 0; i < count - 2; i += 2)
	    {
	        if (lineEllipse(points[i], points[i + 1], points[i + 2], points[i + 3], xe, ye, rex, rey))
	        {
	            return true
	        }
	    }
	    return lineEllipse(points[0], points[1], points[count - 2], points[count - 1], xe, ye, rex, rey)
	};

	/**
	 * box-point collision
	 * @param {number} x1 top-left corner of box
	 * @param {number} y1 top-left corner of box
	 * @param {number} w1 width of box
	 * @param {number} h1 height of box
	 * @param {number} x2 of point
	 * @param {number} y2 of point
	 * @return {boolean}
	 */
	var boxPoint = function boxPoint(x1, y1, w1, h1, x2, y2)
	{
	    return x2 >= x1 && x2 <= x1 + w1 && y2 >= y1 && y2 <= y1 + h1
	};

	/**
	 * box-box collision
	 * @param {number} x1 top-left corner of first box
	 * @param {number} y1 top-left corner of first box
	 * @param {number} w1 width of first box
	 * @param {number} h1 height of first box
	 * @param {number} x2 top-left corner of second box
	 * @param {number} y2 top-left corner of second box
	 * @param {number} w2 width of second box
	 * @param {number} h2 height of second box
	 */
	var boxBox = function boxBox(x1, y1, w1, h1, x2, y2, w2, h2)
	{
	    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2
	};

	/**
	 * line-box collision
	 number @param {number} x1 point 1 of line
	 number @param {number} y1 point 1 of line
	 number @param {number} x2 point 2 of line
	 number @param {number} y2 point 2 of line
	 number @param {number} xb top-left of box
	 number @param {number} yb top-left of box
	 number @param {number} wb width of box
	 number @param {number} hb height of box
	 */
	var lineBox = function lineBox(x1, y1, x2, y2, xb, yb, wb, hb)
	{
	    if (boxPoint(xb, yb, wb, hb, x1, y1) || boxPoint(xb, yb, wb, hb, x2, y2))
	    {
	        return true
	    }
	    return lineLine(x1, y1, x2, y2, xb, yb, xb + wb, yb) ||
	        lineLine(x1, y1, x2, y2, xb + wb, yb, xb + wb, yb + hb) ||
	        lineLine(x1, y1, x2, y2, xb, yb + hb, xb + wb, yb + hb) ||
	        lineLine(x1, y1, x2, y2, xb, yb, xb, yb + hb)
	};

	/**
	 * box-line collision
	 * @param {number} xb top-left corner of box
	 * @param {number} yb top-left corner of box
	 * @param {number} wb width of box
	 * @param {number} hb height of box
	 * @param {number} x1 first point of line
	 * @param {number} y1 first point of line
	 * @param {number} x2 second point of line
	 * @param {number} y2 second point of line
	 */
	var boxLine = function boxLine(xb, yb, wb, hb, x1, y1, x2, y2)
	{
	    return lineBox(x1, y1, x2, y2, xb, yb, wb, hb)
	};

	/**
	 * box-polygon collision
	 * @param {number} xb top-left corner of box
	 * @param {number} yb top-left corner of box
	 * @param {number} wb width of box
	 * @param {number} hb height of box
	 * @param {number[]} points of polygon
	 */
	var boxPolygon = function boxPolygon(xb, yb, wb, hb, points)
	{
	    return polygonBox(points, xb, yb, wb, hb)
	};

	/**
	 * ellipse-box (axis-oriented rectangle) collision
	 * @param {number} xe center of ellipse
	 * @param {number} ye center of ellipse
	 * @param {radius} rex radius-x of ellipse
	 * @param {radius} rey radius-y of ellipse
	 * @param {number} xb top-left corner of box
	 * @param {number} yb top-left corner of box
	 * @param {number} wb width of box
	 * @param {number} hb height of box
	 */
	var ellipseBox = function ellipseBox(xe, ye, rex, rey, xb, yb, wb, hb)
	{
	    return boxPoint(xb, yb, wb, hb, xe, ye) ||
	        ellipseLine(xe, ye, rex, rey, xb, yb, xb + wb, yb) ||
	        ellipseLine(xe, ye, rex, rey, xb, yb + hb, xb + wb, yb + hb) ||
	        ellipseLine(xe, ye, rex, rey, xb, yb, xb, yb + hb) ||
	        ellipseLine(xe, ye, rex, rey, xb + wb, yb, xb + wb, yb + hb)
	};

	/**
	 * box-ellipse (axis-oriented rectangle) collision
	 * @param {number} xb top-left corner of rectangle
	 * @param {number} yb top-left corner of rectangle
	 * @param {number} wb width of rectangle
	 * @param {number} hb height of rectangle
	 * @param {number} xe center of ellipse
	 * @param {number} ye center of ellipse
	 * @param {radius} rex radius-x of ellipse
	 * @param {radius} rey radius-y of ellipse
	 */
	var boxEllipse = function boxEllipse(xb, yb, wb, hb, xe, ye, rex, rey)
	{
	    return ellipseBox(xe, ye, rex, rey, xb, yb, wb, hb)
	};

	/**
	 * point-box collision
	 * @param {number} x1 point
	 * @param {number} y1 point
	 * @param {number} xb top-left corner of box
	 * @param {number} yb top-left corner of box
	 * @param {number} wb width of box
	 * @param {number} hb height of box
	 * @return {boolean}
	 */
	var pointBox = function pointBox(x1, y1, xb, yb, wb, hb)
	{
	    return boxPoint(xb, yb, wb, hb, x1, y1)
	};

	/**
	 * polygon-point collision
	 * based on https://stackoverflow.com/a/17490923/1955997
	 * @param {number} x1
	 * @param {number} y1
	 * @param {number[]} points
	 * @param {number} [tolerance=1] maximum distance of point to polygon's edges that triggers collision (see pointLine)
	 * @return {boolean}
	 */
	var pointPolygon = function pointPolygon(x1, y1, points, tolerance)
	{
	    return polygonPoint(points, x1, y1, tolerance)
	};

	var pointCircle = function pointCircle(x1, y1, xc, yc, rc)
	{
	    return circlePoint(xc, yc, rc, x1, y1)
	};

	/**
	 * point-line collision
	 * @param {number} xp point
	 * @param {number} yp point
	 * @param {number} x1 first point in line
	 * @param {number} y1 first point in line
	 * @param {number} x2 second point in line
	 * @param {number} y2 second point in line
	 * @return {boolean}
	 */
	var pointLine = function pointLine(xp, yp, x1, y1, x2, y2)
	{
	    return linePoint(x1, y1, x2, y2, xp, yp)
	};

	/**
	 * ellipse-point collision
	 * @param {number} xe center of ellipse
	 * @param {number} ye center of ellipse
	 * @param {radius} rex radius-x of ellipse
	 * @param {radius} rey radius-y of ellipse
	 * @param {number} x1 point
	 * @param {number} y1 point
	 * @return {boolean}
	 */
	var ellipsePoint = function ellipsePoint(xe, ye, rex, rey, x1, y1)
	{
	    var x = Math.pow(x1 - xe, 2) / (rex * rex);
	    var y = Math.pow(y1 - ye, 2) / (rey * rey);
	    return x + y <= 1
	};

	/**
	 * point-ellipse collision
	 * @param {number} x1 point
	 * @param {number} y1 point
	 * @param {number} xe center of ellipse
	 * @param {number} ye center of ellipse
	 * @param {radius} rex radius-x of ellipse
	 * @param {radius} rey radius-y of ellipse
	 * @return {boolean}
	 */
	var pointEllipse = function pointEllipse(x1, y1, xe, ye, rex, rey)
	{
	    return ellipsePoint(xe, ye, rex, rey, x1, y1)
	};

	/**
	 * ellipse-ellipse collision
	 * @param {number} x1 center of ellipse 1
	 * @param {number} y1 center of ellipse 1
	 * @param {number} r1x radius-x of ellipse 1
	 * @param {number} r1y radius-y of ellipse 1
	 * @param {number} x2 center of ellipse 2
	 * @param {number} y2 center of ellipse 2
	 * @param {number} r2x radius of ellipse 2
	 * @param {number} r2y radius of ellipse 2
	 * @return {boolean}
	 */
	var ellipseEllipse$1 = function ellipseEllipse(x1, y1, r1x, r1y, x2, y2, r2x, r2y)
	{
	    return ellipseHelper.ellipseEllipse(x1, y1, r1x, r1y, x2, y2, r2x, r2y)
	};

	/**
	 * ellipse-polygon collision
	 * @param {number} xe center of ellipse
	 * @param {number} ye center of ellipse
	 * @param {number} rex radius-x of ellipse
	 * @param {number} rey radius-y of ellipse
	 * @param {number[]} points [x1, y1, x2, y2, ... xn, yn] of polygon
	 */
	var ellipsePolygon = function ellipsePolygon(xe, ye, rex, rey, points)
	{
	    return polygonEllipse(points, xe, ye, rex, rey)
	};

	var intersects = {
	    circlePoint: circlePoint,
	    circleCircle: circleCircle,
	    circleLine: circleLine,
	    circleBox: circleBox,
	    circlePolygon: circlePolygon,
	    circleEllipse: circleEllipse,

	    polygonPoint: polygonPoint,
	    polygonLine: polygonLine,
	    polygonPolygon: polygonPolygon,
	    polygonBox: polygonBox,
	    polygonCircle: polygonCircle,
	    polygonEllipse: polygonEllipse,

	    boxPoint: boxPoint,
	    boxBox: boxBox,
	    boxLine: boxLine,
	    boxPolygon: boxPolygon,
	    boxCircle: boxCircle,
	    boxEllipse: boxEllipse,

	    pointBox: pointBox,
	    pointPolygon: pointPolygon,
	    pointCircle: pointCircle,
	    pointLine: pointLine,
	    pointEllipse: pointEllipse,

	    lineLine: lineLine,
	    lineBox: lineBox,
	    linePolygon: linePolygon,
	    lineCircle: lineCircle,
	    linePoint: linePoint,
	    lineEllipse: lineEllipse,

	    ellipsePoint: ellipsePoint,
	    ellipseLine: ellipseLine,
	    ellipseBox: ellipseBox,
	    ellipseCircle: ellipseCircle$1,
	    ellipseEllipse: ellipseEllipse$1,
	    ellipsePolygon: ellipsePolygon
	};
	var intersects_9 = intersects.polygonPolygon;
	var intersects_11 = intersects.polygonCircle;

	const randomInteger = (min, max) => {
	    let rand = min + Math.random() * (max + 1 - min);
	    rand = Math.floor(rand);
	    return rand;
	};

	const getAngle = (x, y) => {
	    let angle = Math.atan(Math.abs(x / y));

	    // calculate angle, value is 0-360
	    if (x > 0 && y < 0) {
	        angle = Math.PI - angle;
	    } else if (x < 0 && y < 0) {
	        angle = Math.PI + angle;
	    } else if (x < 0 && y > 0) {
	        angle = Math.PI * 2 - angle;
	    }

	    return angle;
	};

	const rotatePoint = (pivotX, pivotY, pointX, pointY, angle) => {
	    // Rotate clockwise, angle in radians
	    const x = Math.cos(angle) * (pointX - pivotX) - Math.sin(angle) * (pointY - pivotY) + pivotX;

	    const y = Math.sin(angle) * (pointX - pivotX) + Math.cos(angle) * (pointY - pivotY) + pivotY;

	    return {
	        x,
	        y
	    };
	};

	const velocityFromAngle = (angle, speed) => {
	    let vx = Math.abs(speed * Math.sin(angle));
	    let vy = Math.abs(speed * Math.cos(angle));

	    if (angle < Math.PI / 2) {
	        vy *= -1;
	    } else if (angle < Math.PI) {
	        vx *= 1;
	        vy *= 1;
	    } else if (angle < (Math.PI * 3) / 2) {
	        vx *= -1;
	    } else {
	        vx *= -1;
	        vy *= -1;
	    }
	    return {
	        vx,
	        vy
	    };
	};

	class Base {
	    constructor(gameMap, options) {
	        this.gameMap = gameMap;
	        this.x = +(options.x || 0);
	        this.y = +(options.y || 0);
	        this.width = options.size || options.width || 0;
	        this.height = options.size || options.height || 0;
	        this.id = options.id || '';
	        if (!this.width || !this.height) {
	            throw new Error('element size can not be undefined');
	        }
	    }

	    prepare() {
	        this.paintX = this.gameMap.view.relativeX(this.x);
	        this.paintY = this.gameMap.view.relativeY(this.y);
	        this.paintWidth = this.gameMap.view.relativeW(this.width);
	        this.paintHeight = this.gameMap.view.relativeH(this.height);
	        const halfWidth = this.paintWidth / 2;
	        const halfHeight = this.paintHeight / 2;
	        this.visible =
	            this.paintX + halfWidth > 0 &&
	            this.paintX - halfWidth < this.gameMap.view.width &&
	            this.paintY + halfHeight > 0 &&
	            this.paintY - halfHeight < this.gameMap.view.height;
	    }
	}

	class Food extends Base {
	    constructor(gameMap, options) {
	        super(gameMap, options);
	        this.lightDirection = true;
	        this.point = options.point;
	        this.lightSize = this.width / 2;
	        this.onField = options.onField;
	    }

	    update() {
	        this.action();
	    }

	    action() {
	        if (!this.visible) {
	            return;
	        }
	        const lightSpeed = 1;
	        this.lightSize += this.lightDirection ? lightSpeed : -lightSpeed;
	        // light animate
	        if (this.lightSize > this.width || this.lightSize < this.width / 2) {
	            this.lightDirection = !this.lightDirection;
	        }
	    }

	    render() {
	        this.prepare();
	        if (!this.visible) {
	            return;
	        }
	        this.gameMap.ctx.save();
	        this.gameMap.ctx.fillStyle = '#f032e6';
	        // draw light
	        this.gameMap.ctx.globalAlpha = 0.2;
	        this.gameMap.ctx.beginPath();
	        this.gameMap.ctx.arc(
	            this.paintX,
	            this.paintY,
	            (this.lightSize * this.paintWidth) / this.width,
	            0,
	            Math.PI * 2
	        );
	        this.gameMap.ctx.fill();

	        this.gameMap.ctx.globalAlpha = 1;
	        this.gameMap.ctx.beginPath();
	        this.gameMap.ctx.arc(
	            this.paintX,
	            this.paintY,
	            Math.floor(this.paintWidth / 2),
	            0,
	            Math.PI * 2
	        );
	        this.gameMap.ctx.fill();
	        this.gameMap.ctx.restore();
	    }
	}

	class Movement {
	    constructor(x, y, speed, dt, angle) {
	        this.x = x;
	        this.y = y;
	        this.speed = speed;
	        this.angle = angle;
	        this.dt = dt;
	        // return this;
	    }
	}

	class Collider {
	    constructor(cX, cY, lX, lY, rX, rY) {
	        this.cX = cX;
	        this.cY = cY;
	        this.lX = lX;
	        this.lY = lY;
	        this.rX = rX;
	        this.rY = rY;
	    }

	    set(cX, cY, lX, lY, rX, rY) {
	        this.cX = cX;
	        this.cY = cY;
	        this.lX = lX;
	        this.lY = lY;
	        this.rX = rX;
	        this.rY = rY;
	    }
	}

	class Snake extends Base {
	    constructor(gameMap, options) {
	        super(gameMap, options);

	        this.point = 0;
	        this.isSpeedUp = false;
	        this.status = 'idle';
	        this.color = options.color;
	        this.stopped = false;
	        this.head = [];
	        // Угол зрения червяка
	        this.visionAngle = 170;
	        this.closestSnakeDistance = 5000;
	        this.closestFoodDistance = 5000;
	        this.closestSnakeID = '';
	        this.foodID = '';
	        this.closestSnake = {};
	        this.closestFood = {};
	        this.seeSnake = false;
	        this.collidedV = false;
	        this.collidedH = false;
	        // save snake's movement
	        this.movementQueue = [];
	        this.colliderIdx = 0;
	        this.colliders = [];

	        // max length of queue
	        this.speed = SPEED;
	        this.oldSpeed = SPEED;
	        this.turnSpeed = 0.2;
	        this.vx = 0;
	        this.vy = 0;
	        this.toAngle = (options.angle || 0) + BASE_ANGLE;
	        this.angle = (options.angle || 0) + BASE_ANGLE;
	        this.length = options.length || 0;
	        this.isPlayer = options.isPlayer || false;
	        this.updateSize();
	        this.velocity();
	        this.calcHead();
	    }

	    resetSnake() {
	        this.point = 0;
	        this.isSpeedUp = false;
	        this.status = 'idle';
	        this.stopped = false;
	        this.foodsEated = new Map();
	        this.head = [];
	        // Угол зрения червяка
	        this.visionAngle = 170;
	        this.closestSnakeDistance = 5000;
	        this.closestFoodDistance = 5000;
	        this.closestSnakeID = '';
	        this.foodID = '';
	        this.closestSnake = {};
	        this.closestFood = {};
	        this.seeSnake = false;
	        this.collidedV = false;
	        this.collidedH = false;
	        // save snake's movement
	        this.movementQueue = [];
	        this.colliderIdx = 0;

	        // max length of queue
	        this.speed = SPEED;
	        this.oldSpeed = SPEED;
	        this.turnSpeed = 1;
	        this.vx = 0;
	        this.vy = 0;
	    }

	    setStatus(status) {
	        this.status = status;
	    }

	    zeroFood() {
	        this.closestFoodDistance = 50000;
	        if (this.status === 'eating' || this.status === 'seefood') this.status = 'idle';
	    }

	    zeroSnake() {
	        this.closestSnakeDistance = 50000;
	        this.closestSnakeID = '';
	    }

	    setFood(distance, foodX, foodY, id) {
	        this.closestFoodDistance = distance;
	        this.closestFood.x = foodX;
	        this.closestFood.y = foodY;
	        this.foodID = id;
	        this.status = 'seefood';
	    }

	    setSnake(distance, snakeX, snakeY, snakeID) {
	        this.closestSnakeDistance = distance;
	        this.closestSnake.x = snakeX;
	        this.closestSnake.y = snakeY;
	        this.closestSnakeID = snakeID;
	    }

	    updateSize(added = 0) {
	        this.width += added;
	        this.height += added;
	        this.length += added * 100;
	        this.speed += added;
	        // this.turnSpeed -= added / 100;
	        this.movementQueueLen = Math.ceil(this.length / (this.oldSpeed * this.dt));
	    }

	    directionTo(angle) {
	        const oldAngle = Math.abs(this.toAngle % (Math.PI * 2));

	        // number of turns
	        let rounds = Math.floor(this.toAngle / (Math.PI * 2));

	        this.toAngle = angle;

	        if (oldAngle >= (Math.PI * 3) / 2 && this.toAngle <= Math.PI / 2) {
	            // move from fourth quadrant to first quadrant
	            rounds += 1;
	        } else if (oldAngle <= Math.PI / 2 && this.toAngle >= (Math.PI * 3) / 2) {
	            // move from first quadrant to fourth quadrant
	            rounds -= 1;
	        }

	        // calculate the real angle by rounds
	        this.toAngle += rounds * Math.PI * 2;
	    }

	    // move to new position
	    moveTo(nx, ny, fromPlayer = false) {
	        if (fromPlayer && (this.collidedV || this.collidedH)) return;
	        const x = nx - this.x;
	        const y = this.y - ny;
	        const angle = getAngle(x, y);

	        this.directionTo(angle);
	    }

	    // calculate horizontal speed and vertical speed by angle of snake header
	    velocity() {
	        const angle = this.angle % (Math.PI * 2);
	        const vx = Math.abs(this.speed * Math.sin(angle));
	        const vy = Math.abs(this.speed * Math.cos(angle));

	        if (angle < Math.PI / 2) {
	            this.vx = vx;
	            this.vy = -vy;
	        } else if (angle < Math.PI) {
	            this.vx = vx;
	            this.vy = vy;
	        } else if (angle < (Math.PI * 3) / 2) {
	            this.vx = -vx;
	            this.vy = vy;
	        } else {
	            this.vx = -vx;
	            this.vy = -vy;
	        }
	    }

	    // turn around
	    turnAround(dt) {
	        const angleDistance = this.toAngle - this.angle;

	        if (Math.abs(angleDistance) <= this.turnSpeed * this.gameMap.scale) {
	            // reset angle
	            const {
	                toAngle
	            } = this;
	            this.toAngle = BASE_ANGLE + (toAngle % (Math.PI * 2));
	            this.angle = BASE_ANGLE + (toAngle % (Math.PI * 2));
	        } else {
	            this.angle += Math.sign(angleDistance) * this.turnSpeed * this.gameMap.scale;
	        }
	    }

	    speedUp() {
	        if (this.isSpeedUp) {
	            return;
	        }

	        this.isSpeedUp = true;
	        this.oldSpeed = this.speed;
	        this.speed *= 2;
	    }

	    speedDown() {
	        if (!this.isSpeedUp) {
	            return;
	        }

	        this.isSpeedUp = false;
	        this.speed = this.oldSpeed;
	    }

	    // eat food
	    eat(idx, food) {
	        this.point += food.point;

	        // add points
	        const added = food.point / 15;
	        this.updateSize(added);
	    }

	    // snake action
	    action() {
	        this.colliderIdx = 0;
	        if (this.stopped) {
	            return;
	        }

	        // save movement
	        this.movementQueue.push(new Movement(this.x, this.y, this.speed, this.dt, this.angle));

	        if (this.movementQueue.length > this.movementQueueLen) {
	            this.movementQueue.shift();
	        }

	        this.turnAround();
	        this.velocity();
	        this.x += this.vx * this.dt;
	        this.y += this.vy * this.dt;
	        this.calcHead();

	        let wholeLength = this.length;
	        if (this.movementQueue.length) {
	            let i = this.movementQueue.length - 1;
	            while (i) {
	                const movement = this.movementQueue[i];
	                let {
	                    x,
	                    y,
	                    angle,
	                    dt,
	                    speed
	                } = movement;
	                if (wholeLength > 0 && wholeLength < speed * dt) {
	                    const lm = this.movementQueue[i + 1] || this;
	                    const ratio = wholeLength / (speed * dt);
	                    x = lm.x - (lm.x - x) * ratio;
	                    y = lm.y - (lm.y - y) * ratio;
	                    // speed = lm.speed - (lm.speed - speed) * ratio;
	                    // dt = lm.dt - (lm.dt - dt) * ratio;
	                    // angle = lm.angle - (lm.angle - angle) * ratio;
	                } else if (wholeLength < 0) {
	                    break;
	                }

	                i -= 1;
	                wholeLength -= speed * dt;
	                const rotateRight = rotatePoint(x, y, x + 0.5 * this.width, y, angle);
	                const rotateLeft = rotatePoint(x, y, x - 0.5 * this.width, y, angle);
	                this.addCollider(x, y, rotateLeft.x, rotateLeft.y, rotateRight.x, rotateRight.y);
	            }
	        }

	        // this.gameMap.view.trace(this);
	        if (this.x > 2 * this.width && this.x < this.gameMap.width - 2 * this.width)
	            this.collidedH = false;
	        if (this.y > 2 * this.height && this.y < this.gameMap.height - 2 * this.height)
	            this.collidedV = false;

	        this.gameMap.bounds.forEach((bound, id) => {
	            if (intersects_9(this.head, bound)) {
	                const vec = velocityFromAngle(this.angle % (Math.PI * 2), this.speed);
	                switch (id) {
	                    case 'UP':
	                        if (!this.collideV) {
	                            this.moveTo(this.x + vec.vx, this.y - vec.vy);
	                            this.collidedV = true;
	                        }
	                        break;
	                    case 'LEFT':
	                        if (!this.collideH) {
	                            this.moveTo(this.x - vec.vx, this.y + vec.vy);
	                            this.collidedH = true;
	                        }
	                        break;
	                    case 'RIGHT':
	                        if (!this.collideH) {
	                            this.moveTo(this.x - vec.vx, this.y + vec.vy);
	                            this.collidedH = true;
	                        }
	                        break;
	                    default:
	                        if (!this.collideV) {
	                            this.moveTo(this.x + vec.vx, this.y - vec.vy);
	                            this.collidedV = true;
	                        }
	                }
	            }
	        });

	        // avoid moving to outside
	        // this.gameMap.limit(this);
	    }

	    // render snake
	    render() {
	        this.prepare();
	        const offset = SNAKE_OFFSET / this.gameMap.scale;
	        this.gameMap.ctx.save();
	        this.gameMap.ctx.beginPath();
	        this.gameMap.ctx.moveTo(this.paintX, this.paintY);

	        for (let i = 2; i < this.colliderIdx; i += 1) {
	            this.gameMap.ctx.lineTo(
	                this.gameMap.view.relativeX(this.colliders[i].cX),
	                this.gameMap.view.relativeY(this.colliders[i].cY)
	            );
	        }

	        this.gameMap.ctx.lineCap = 'butt';
	        this.gameMap.ctx.lineJoin = 'round';
	        [, this.gameMap.ctx.strokeStyle] = this.color;
	        this.gameMap.ctx.lineWidth = this.paintWidth;
	        // this.gameMap.ctx.shadowOffsetX = Math.round(0.4 * 10);
	        this.gameMap.ctx.shadowOffsetY = Math.round(0.4 * 10) / this.gameMap.scale;
	        this.gameMap.ctx.shadowBlur = Math.round(0.7 * 10) / this.gameMap.scale;
	        this.gameMap.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
	        this.gameMap.ctx.stroke();
	        this.gameMap.ctx.restore();

	        /* while (this.collisionPointsX.length) {
	            const x = this.collisionPointsX.pop();
	            const y = this.collisionPointsY.pop();
	            const angle = this.collisionAngle.pop();
	            const rotateRight = rotatePoint(x, y, x + 0.5 * this.width, y, angle);
	            const rotateLeft = rotatePoint(x, y, x - 0.5 * this.width, y, angle);
	            this.gameMap.ctx.save();
	            this.gameMap.ctx.beginPath();
	            this.gameMap.ctx.moveTo(
	                this.gameMap.view.relativeX(rotateLeft.x),
	                this.gameMap.view.relativeY(rotateLeft.y)
	            );
	            this.gameMap.ctx.lineTo(
	                this.gameMap.view.relativeX(rotateRight.x),
	                this.gameMap.view.relativeY(rotateRight.y)
	            );

	            this.gameMap.ctx.strokeStyle = '#000';
	            this.gameMap.ctx.lineWidth = 2;
	            this.gameMap.ctx.stroke();
	            this.gameMap.ctx.restore();
	        } */

	        // draw header
	        let rotateLeftTop = rotatePoint(
	            this.paintX,
	            this.paintY,
	            this.paintX - 0.5 * this.paintWidth,
	            this.paintY - this.paintHeight,
	            this.angle
	        );
	        let rotateRightTop = rotatePoint(
	            this.paintX,
	            this.paintY,
	            this.paintX + 0.5 * this.paintWidth,
	            this.paintY - this.paintHeight,
	            this.angle
	        );
	        let rotateRightBottom = rotatePoint(
	            this.paintX,
	            this.paintY,
	            this.paintX + 0.5 * this.paintWidth,
	            this.paintY,
	            this.angle
	        );
	        let rotateLeftBottom = rotatePoint(
	            this.paintX,
	            this.paintY,
	            this.paintX - 0.5 * this.paintWidth,
	            this.paintY,
	            this.angle
	        );
	        this.gameMap.ctx.save();
	        this.gameMap.ctx.beginPath();
	        this.gameMap.ctx.moveTo(rotateLeftTop.x, rotateLeftTop.y);
	        this.gameMap.ctx.lineTo(rotateRightTop.x, rotateRightTop.y);
	        this.gameMap.ctx.lineTo(rotateRightBottom.x, rotateRightBottom.y);
	        this.gameMap.ctx.lineTo(rotateLeftBottom.x, rotateLeftBottom.y);
	        this.gameMap.ctx.closePath();
	        [this.gameMap.ctx.fillStyle] = this.color;
	        this.gameMap.ctx.shadowOffsetY = Math.round(0.4 * 10) / this.gameMap.scale;
	        this.gameMap.ctx.shadowBlur = Math.round(0.7 * 10) / this.gameMap.scale;
	        this.gameMap.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
	        this.gameMap.ctx.fill();
	        this.gameMap.ctx.restore();
	        this.gameMap.ctx.save();
	        this.gameMap.ctx.beginPath();
	        this.gameMap.ctx.moveTo(rotateLeftTop.x, rotateLeftTop.y + offset);
	        this.gameMap.ctx.lineTo(rotateRightTop.x, rotateRightTop.y + offset);
	        this.gameMap.ctx.lineTo(rotateRightBottom.x, rotateRightBottom.y + offset);
	        this.gameMap.ctx.lineTo(rotateLeftBottom.x, rotateLeftBottom.y + offset);
	        this.gameMap.ctx.closePath();
	        [this.gameMap.ctx.fillStyle] = this.color;
	        this.gameMap.ctx.fill();

	        this.gameMap.ctx.restore();
	        rotateLeftTop = rotatePoint(
	            this.paintX,
	            this.paintY,
	            this.paintX - 0.3 * this.paintWidth,
	            this.paintY - 0.8 * this.paintHeight,
	            this.angle
	        );
	        rotateRightTop = rotatePoint(
	            this.paintX,
	            this.paintY,
	            this.paintX + 0.3 * this.paintWidth,
	            this.paintY - 0.8 * this.paintHeight,
	            this.angle
	        );
	        rotateRightBottom = rotatePoint(
	            this.paintX,
	            this.paintY,
	            this.paintX + 0.3 * this.paintWidth,
	            this.paintY - 0.2 * this.paintHeight,
	            this.angle
	        );
	        rotateLeftBottom = rotatePoint(
	            this.paintX,
	            this.paintY,
	            this.paintX - 0.3 * this.paintWidth,
	            this.paintY - 0.2 * this.paintHeight,
	            this.angle
	        );

	        this.gameMap.ctx.save();
	        this.gameMap.ctx.beginPath();
	        this.gameMap.ctx.moveTo(rotateLeftTop.x, rotateLeftTop.y + offset);
	        this.gameMap.ctx.lineTo(rotateRightTop.x, rotateRightTop.y + offset);
	        this.gameMap.ctx.lineTo(rotateRightBottom.x, rotateRightBottom.y + offset);
	        this.gameMap.ctx.lineTo(rotateLeftBottom.x, rotateLeftBottom.y + offset);
	        this.gameMap.ctx.closePath();
	        [, this.gameMap.ctx.fillStyle] = this.color;
	        this.gameMap.ctx.fill();
	        this.gameMap.ctx.restore();
	    }

	    update(dt) {
	        this.dt = dt;
	        this.action();
	    }

	    calcHead() {
	        const rotateLeftTop = rotatePoint(
	            this.x,
	            this.y,
	            this.x - 0.5 * this.width,
	            this.y - this.height,
	            this.angle
	        );
	        const rotateRightTop = rotatePoint(
	            this.x,
	            this.y,
	            this.x + 0.5 * this.width,
	            this.y - this.height,
	            this.angle
	        );
	        const rotateRightBottom = rotatePoint(
	            this.x,
	            this.y,
	            this.x + 0.5 * this.width,
	            this.y,
	            this.angle
	        );
	        const rotateLeftBottom = rotatePoint(
	            this.x,
	            this.y,
	            this.x - 0.5 * this.width,
	            this.y,
	            this.angle
	        );

	        this.head[0] = rotateLeftTop.x;
	        this.head[1] = rotateLeftTop.y;
	        this.head[2] = rotateRightTop.x;
	        this.head[3] = rotateRightTop.y;
	        this.head[4] = rotateRightBottom.x;
	        this.head[5] = rotateRightBottom.y;
	        this.head[6] = rotateLeftBottom.x;
	        this.head[7] = rotateLeftBottom.y;
	        this.addCollider(
	            0.5 * (rotateLeftTop.x + rotateRightTop.x),
	            0.5 * (rotateLeftTop.y + rotateRightTop.y),
	            rotateLeftTop.x,
	            rotateLeftTop.y,
	            rotateRightTop.x,
	            rotateRightTop.y
	        );
	        this.addCollider(
	            this.x,
	            this.y,
	            rotateLeftBottom.x,
	            rotateLeftBottom.y,
	            rotateRightBottom.x,
	            rotateRightBottom.y
	        );
	    }

	    addCollider(cX, cY, lX, lY, rX, rY) {
	        if (this.colliderIdx === this.colliders.length) {
	            this.colliders.push(new Collider(cX, cY, lX, lY, rX, rY));
	        } else {
	            this.colliders[this.colliderIdx].set(cX, cY, lX, lY, rX, rY);
	        }
	        this.colliderIdx += 1;
	    }
	}

	const drawPattern = (width, height, ratio = 1) => {
	    const tileImage = document.createElement('canvas');
	    tileImage.width = width * ratio;
	    tileImage.height = height * ratio;
	    const ctx = tileImage.getContext('2d');
	    const colors = ['#eee', '#aaa'];
	    const mrw = MAP_RECT_WIDTH / ratio;
	    const mrh = MAP_RECT_HEIGHT / ratio;
	    for (let x = 0, i = 0; x <= width; x += mrw, i += 1) {
	        for (let y = 0, j = 0; y <= height; y += mrh, j += 1) {
	            const cx = width * ratio - x;
	            const cy = height * ratio - y;
	            const w = cx < mrw ? cx : mrw;
	            const h = cy < mrh ? cy : mrh;
	            ctx.fillStyle = colors[(i + j) % colors.length];
	            ctx.fillRect(x, y, w, h);
	        }
	    }
	    ctx.lineWidth = 3;
	    ctx.strokeRect(0, 0, width * ratio, height * ratio);
	    return tileImage;
	};

	class SmallMap {
	    constructor(gameMap, margin, radius) {
	        this.gameMap = gameMap;
	        this.margin = margin;
	        this.radius = radius;
	        this.image = document.createElement('canvas');

	        this.initImage();
	    }

	    initImage() {
	        this.image.width = this.radius * 2;
	        this.image.height = this.radius * 2;
	        this.x = this.gameMap.view.width - this.radius * 2 - this.margin;
	        this.y = this.gameMap.view.height - this.radius * 2 - this.margin;
	        this.mapX = this.x + this.radius / 2;
	        this.mapY = this.y + this.radius / 2;
	        const ctx = this.image.getContext('2d');

	        this.smallMapWidth =
	            this.gameMap.width > this.gameMap.height
	                ? this.radius
	                : (this.gameMap.width * this.radius) / this.gameMap.height;
	        this.smallMapHeight =
	            this.gameMap.width > this.gameMap.height
	                ? (this.gameMap.height * this.radius) / this.gameMap.width
	                : this.radius;

	        const smallRectX = this.radius - this.smallMapWidth / 2;
	        const smallRectY = this.radius - this.smallMapHeight / 2;

	        // draw background
	        ctx.save();
	        ctx.beginPath();
	        ctx.arc(this.radius, this.radius, this.radius - 1, 0, Math.PI * 2);
	        ctx.fillStyle = '#000';
	        ctx.fill();

	        ctx.lineWidth = 2;
	        ctx.strokeStyle = '#fff';
	        ctx.stroke();

	        // draw map
	        ctx.fillStyle = '#ccc';
	        ctx.fillRect(smallRectX, smallRectY, this.smallMapWidth, this.smallMapHeight);
	        ctx.restore();
	    }

	    resize() {
	        this.x = this.gameMap.view.width - this.radius * 2 - this.margin;
	        this.y = this.gameMap.view.height - this.radius * 2 - this.margin;
	        this.mapX = this.x + this.radius / 2;
	        this.mapY = this.y + this.radius / 2;
	    }

	    render() {
	        // relative ratio
	        const radio = this.smallMapWidth / this.gameMap.paintWidth;
	        const globalRadio = this.smallMapWidth / this.gameMap.width;
	        const { ctx } = this.gameMap;

	        // area and position of window
	        const smallViewX = this.gameMap.view.x * radio + this.mapX;
	        const smallViewY = this.gameMap.view.y * radio + this.mapY;
	        const smallViewW = this.gameMap.view.width * radio;
	        const smallViewH = this.gameMap.view.height * radio;

	        ctx.save();
	        ctx.globalAlpha = 0.8;
	        ctx.drawImage(this.image, this.x, this.y);

	        // draw window
	        ctx.strokeStyle = '#fff';
	        ctx.strokeRect(smallViewX, smallViewY, smallViewW, smallViewH);

	        this.gameMap.units.forEach(unit => {
	            const smallX = unit.x * globalRadio + this.mapX;
	            const smallY = unit.y * globalRadio + this.mapY;
	            ctx.fillStyle = '#f00';
	            ctx.fillRect(smallX - 2, smallY - 2, 4, 4);
	        });

	        /* ctx.fillStyle = '#f00';
	        ctx.fillRect(smallViewX + smallViewW / 2 - 2, smallViewY + smallViewH / 2 - 2, 4, 4);
	        */

	        ctx.restore();
	    }
	}

	class View {
	    constructor(gameMap, width, height, x = 0, y = 0) {
	        this.width = width;
	        this.height = height;
	        this.x = x;
	        this.y = y;
	        this.gameMap = gameMap;
	    }

	    trace(x, y) {
	        this.x = x / this.gameMap.scale - this.width / 2;
	        this.y = y / this.gameMap.scale - this.height / 2;
	    }

	    absoluteX(x) {
	        return (x + this.x) * this.gameMap.scale;
	    }

	    absoluteY(y) {
	        return (y + this.y) * this.gameMap.scale;
	    }

	    relativeX(x) {
	        return x / this.gameMap.scale - this.x;
	    }

	    relativeY(y) {
	        return y / this.gameMap.scale - this.y;
	    }

	    relativeW(width) {
	        return width / this.gameMap.scale;
	    }

	    relativeH(height) {
	        return height / this.gameMap.scale;
	    }
	}

	// Map class
	class GameMap extends eventemitter3 {
	    constructor(
	        canvas = document.createElement('canvas'),
	        vWidth = MAP_WIDTH,
	        vHeight = MAP_HEIGHT,
	        scale = 1
	    ) {
	        super();
	        this.canvas = canvas;
	        this.width = MAP_WIDTH;
	        this.height = MAP_HEIGHT;
	        this.bounds = new Map([
	            ['UP', [-50, 0, MAP_WIDTH + 50, 0, MAP_WIDTH + 50, -50, -50, -50]],
	            ['LEFT', [0, 0, 0, MAP_HEIGHT, -50, MAP_HEIGHT, -50, 0]],
	            [
	                'RIGHT',
	                [MAP_WIDTH, 0, MAP_WIDTH + 50, 0, MAP_WIDTH + 50, MAP_HEIGHT, MAP_WIDTH, MAP_HEIGHT]
	            ],
	            [
	                'DOWN',
	                [
	                    -50,
	                    MAP_HEIGHT,
	                    -50,
	                    MAP_HEIGHT + 50,
	                    MAP_WIDTH + 50,
	                    MAP_HEIGHT + 50,
	                    MAP_WIDTH + 50,
	                    MAP_HEIGHT
	                ]
	            ]
	        ]);
	        this.aviableColors = [];
	        COLORS.forEach(color => this.aviableColors.push(color));
	        this.vWidth = vWidth;
	        this.vHeight = vHeight;
	        this.scale = scale;
	        this.scaled = false;
	        this.canvas.width = vWidth;
	        this.canvas.height = vHeight;
	        this.ctx = this.canvas.getContext('2d');
	        this.paintSizeReset();
	        this.tileImage = drawPattern(MAP_RECT_WIDTH * 8, MAP_RECT_HEIGHT * 8);
	        this.view = new View(this, vWidth, vHeight);
	        this.smallMap = new SmallMap(this, 30, 50);
	        this.units = [];
	        this.foods = [];
	        this.foodEatedPool = [];
	    }

	    resize(width, height) {
	        this.vWidth = width;
	        this.vHeight = height;
	        this.canvas.width = width;
	        this.canvas.height = height;
	        this.view.width = width;
	        this.view.height = height;
	        this.smallMap.resize();
	    }

	    initUnits(numUnits, playerID) {
	        // Инициируем игрока
	        this.player = new Snake(this, {
	            x: randomInteger(0.5 * 100, MAP_WIDTH - 0.5 * 100),
	            y: randomInteger(0.5 * 100, MAP_HEIGHT - 0.5 * 100),
	            size: SNAKE_IMG_SIZE,
	            length: SNAKE_LENGTH,
	            angle: Math.random() * 2 * Math.PI,
	            id: playerID,
	            color: this.aviableColors.splice(randomInteger(0, this.aviableColors.length - 1), 1)[0],
	            isPlayer: true
	        });
	        this.units.push(this.player);
	        // Инициируем остальных червяков
	        for (let i = numUnits - 1; i; i -= 1) {
	            this.units.push(
	                new Snake(this, {
	                    x: randomInteger(0.5 * 100, MAP_WIDTH - 0.5 * 100),
	                    y: randomInteger(0.5 * 100, MAP_HEIGHT - 0.5 * 100),
	                    size: SNAKE_IMG_SIZE,
	                    length: SNAKE_LENGTH,
	                    angle: Math.random() * 2 * Math.PI,
	                    color: this.aviableColors.splice(
	                        randomInteger(0, this.aviableColors.length - 1),
	                        1
	                    )[0],
	                    id: `unit${i}`
	                })
	            );
	        }
	    }

	    // Инициируем еду
	    initFoods(numFoods) {
	        this.foodsOnFields = numFoods;
	        for (let i = 0; i < numFoods; i += 1) {
	            this.foods.push(
	                new Food(this, {
	                    size: FOOD_SIZE,
	                    point: 1,
	                    x: randomInteger(FOOD_SIZE, MAP_WIDTH - FOOD_SIZE),
	                    y: randomInteger(FOOD_SIZE, MAP_HEIGHT - FOOD_SIZE),
	                    id: i,
	                    onField: true
	                })
	            );
	        }
	    }

	    // set scale
	    setScale(scale) {
	        if (this.scale === scale) {
	            return;
	        }

	        this.scale = scale < 1 ? 1 : scale;
	        this.paintSizeReset();
	        this.emit('scale_changed');
	    }

	    // set toScale for creating animate
	    setToScale(scale) {
	        this.toScale = scale;
	    }

	    // relative to scale
	    relative(val) {
	        return val / this.scale;
	    }

	    clear() {
	        this.ctx.clearRect(0, 0, this.view.width, this.view.height);
	    }

	    update(dt) {
	        if (this.scaled && this.scale < 2.0) {
	            this.setToScale(this.scale + 0.1);
	        } else if (this.scale > 1.0 && !this.scaled) {
	            this.setToScale(this.scale - 0.1);
	        }
	        if (this.toScale && this.scale !== this.toScale) {
	            this.setScale(this.toScale);
	        }
	        this.updateFood();
	        this.updateUnits(dt);
	        this.view.trace(this.player.x, this.player.y);
	        this.clear();
	        this.render();
	        this.renderFood();
	        this.renderUnits();
	        this.addFood();
	        this.units.forEach(unit => {
	            const i = window.devicePixelRatio;
	            const s = Math.floor((0.8 * unit.width) / (i * this.scale));
	            this.ctx.save();
	            this.ctx.translate(unit.paintX, unit.paintY);
	            this.ctx.font = 'bold '.concat(s, 'px Quicksand');
	            this.ctx.textAlign = 'center';
	            this.ctx.textBaseline = 'bottom';
	            [this.ctx.fillStyle] = unit.color;
	            this.ctx.fillText(unit.id, 0, -Math.floor((unit.width + 10) / (i * this.scale)));
	            this.ctx.restore();
	        });
	        this.smallMap.render();

	        this.ctx.save();
	        this.ctx.translate(100, 100);
	        /// this.ctx.moveTo(-12, -12);
	        this.ctx.beginPath();
	        this.ctx.lineTo(10, -12);
	        this.ctx.lineTo(14, -6);
	        this.ctx.lineTo(12, 4);
	        this.ctx.lineTo(8, 6);
	        this.ctx.lineTo(6, 12);
	        this.ctx.lineTo(0, 14);
	        this.ctx.lineTo(-6, 12);
	        this.ctx.lineTo(-8, 6);
	        this.ctx.lineTo(-12, 4);
	        this.ctx.lineTo(-14, -6);
	        this.ctx.lineTo(-10, -12);
	        this.ctx.closePath();
	        this.ctx.arc(-6, -2, 4, 0, 2 * Math.PI, !0);
	        this.ctx.closePath();
	        this.ctx.arc(6, -2, 4, 0, 2 * Math.PI, !0);
	        this.ctx.closePath();
	        this.ctx.moveTo(0, 2);
	        this.ctx.lineTo(-4, 6);
	        this.ctx.lineTo(0, 8);
	        this.ctx.lineTo(4, 6);
	        this.ctx.closePath();
	        this.ctx.fillStyle = 'red';
	        // this.ctx.lineWidth = 1;
	        this.ctx.fill();
	        this.ctx.restore();
	        this.checkCollisions();
	    }

	    // render map
	    render() {
	        const { view } = this;
	        const tileWid = this.relative(this.tileImage.width);
	        const tileHei = this.relative(this.tileImage.height);
	        const beginX = view.x < 0 ? -view.x : -view.x % tileWid;
	        const beginY = view.y < 0 ? -view.y : -view.y % tileHei;
	        const endX =
	            view.x + view.width > this.paintWidth
	                ? this.paintWidth - view.x
	                : beginX + view.width + tileWid;
	        const endY =
	            view.y + view.height > this.paintHeight
	                ? this.paintHeight - view.y
	                : beginY + view.height + tileHei;

	        for (let x = beginX; x <= endX; x += tileWid) {
	            for (let y = beginY; y <= endY; y += tileHei) {
	                const cx = endX - x;
	                const cy = endY - y;
	                const w = cx < tileWid ? cx : tileWid;
	                const h = cy < tileHei ? cy : tileHei;
	                this.ctx.drawImage(
	                    this.tileImage,
	                    0,
	                    0,
	                    w * this.scale,
	                    h * this.scale,
	                    x,
	                    y,
	                    w,
	                    h
	                );
	            }
	        }
	    }

	    paintSizeReset() {
	        this.paintWidth = this.relative(this.width);
	        this.paintHeight = this.relative(this.height);
	    }

	    checkCollisions() {
	        this.units.forEach(unit0 => {
	            unit0.zeroSnake();
	            this.units.forEach(unit => {
	                if (unit0.id !== unit.id) {
	                    for (let i = 1; i < unit.colliderIdx; i += 1) {
	                        if (
	                            intersects_9(unit0.head, [
	                                unit.colliders[i].lX,
	                                unit.colliders[i].lY,
	                                unit.colliders[i].rX,
	                                unit.colliders[i].rY,
	                                unit.colliders[i - 1].rX,
	                                unit.colliders[i - 1].rY,
	                                unit.colliders[i - 1].lX,
	                                unit.colliders[i - 1].lY
	                            ])
	                        ) {
	                            console.log('BAAM!!!');
	                            break;
	                        } else if (unit0.id !== this.player.id) {
	                            const distanceX = Math.round(unit.colliders[i].cX - unit0.x);
	                            const distanceY = Math.round(unit.colliders[i].cY - unit0.y);
	                            const distance = Math.abs(distanceX) + Math.abs(distanceY);
	                            const angle = getAngle(
	                                unit0.x - unit.colliders[i].cX,
	                                unit.colliders[i].cY - unit0.y
	                            );
	                            const unitAngle = getAngle(unit0.vx, unit0.vy);
	                            if (
	                                angle <= unit.angle + (Math.PI * unit0.visionAngle) / 360 &&
	                                angle >= unit.angle - (Math.PI * unit0.visionAngle) / 360
	                            ) {
	                                if (distance < unit0.closestSnakeDistance) {
	                                    unit0.setSnake(
	                                        distance,
	                                        unit.colliders[i].cX,
	                                        unit.colliders[i].cY,
	                                        unit.id
	                                    );
	                                }
	                            }
	                        }
	                    }
	                }
	            });
	        });
	    }

	    updateUnits(dt) {
	        this.units.forEach(unit => {
	            if (unit.id !== this.player.id) {
	                if (unit.closestSnakeDistance < 3 * unit.width) {
	                    unit.zeroFood();
	                    const angleSnake = getAngle(
	                        unit.x - unit.closestSnake.x,
	                        unit.y - unit.closestSnake.y
	                    );
	                    unit.moveTo(unit.x - unit.closestSnake.x, unit.y - unit.closestSnake.y);
	                }
	                if (
	                    (unit.status === 'eating' || unit.status === 'seefood') &&
	                    !this.foods[unit.foodID].onField
	                )
	                    unit.zeroFood();
	                if (unit.status === 'seefood') {
	                    unit.setStatus('eating');
	                    unit.moveTo(unit.closestFood.x, unit.closestFood.y);
	                }
	            }
	            unit.update(dt);
	        });
	    }

	    updateFood() {
	        for (let i = this.foods.length - 1; i > 0; i -= 1) {
	            const food = this.foods[i];
	            if (this.foods[i].onField) {
	                food.update();
	                this.units.forEach(unit => {
	                    if (intersects_11(unit.head, food.x, food.y, food.width * 0.5)) {
	                        unit.eat(food.id, food);
	                        // eslint-disable-next-line no-param-reassign
	                        food.onField = false;
	                        this.foodsOnFields -= 1;
	                        this.foodEatedPool.push(i);
	                        unit.zeroFood();
	                    } else if (unit.status === 'idle' || unit.status === 'seefood') {
	                        // Ищем наименьшее расстояние от червяка до еды
	                        const distanceX = Math.round(food.x - unit.x);
	                        const distanceY = Math.round(food.y - unit.y);
	                        const distance = Math.abs(distanceX) + Math.abs(distanceY);
	                        const angle = getAngle(food.x - unit.x, food.y - unit.y);
	                        const unitAngle = getAngle(unit.vx, unit.vy);
	                        if (
	                            angle <= unitAngle + (Math.PI * unit.visionAngle) / 360 &&
	                            angle >= unitAngle - (Math.PI * unit.visionAngle) / 360
	                        ) {
	                            if (distance < unit.closestFoodDistance) {
	                                unit.setFood(distance, food.x, food.y, i);
	                            }
	                        }
	                    }
	                });
	            }
	        }
	    }

	    addFood() {
	        if (this.foodsOnFields < 500) {
	            const food = this.foodEatedPool.pop();
	            if (food) {
	                this.foodsOnFields += 1;
	                this.foods[food].onField = true;
	                this.foods[food].x = randomInteger(FOOD_SIZE, MAP_WIDTH - FOOD_SIZE);
	                this.foods[food].y = randomInteger(FOOD_SIZE, MAP_HEIGHT - FOOD_SIZE);
	            }
	        }
	    }

	    renderFood() {
	        for (let i = 0; i < this.foods.length; i += 1) {
	            if (this.foods[i].onField) {
	                this.foods[i].render();
	            }
	        }
	    }

	    renderUnits() {
	        for (let i = 0; i < this.units.length; i += 1) {
	            this.units[i].render();
	        }
	    }
	}

	const stats = new stats_min();
	stats.showPanel(0);
	document.body.appendChild(stats.dom);
	const raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
	const timestamp = () => {
	    return window.performance && window.performance.now
	        ? window.performance.now()
	        : new Date().getTime();
	};
	const canvas = document.getElementById('cas');

	// window's width and height
	const vWidth = window.innerWidth;
	const vHeight = window.innerHeight;

	// game map
	const gameMap = new GameMap(canvas, vWidth, vHeight);

	const mouseCoords = {};

	// animation loop
	let now;
	let dt = 0;
	let last = timestamp();
	const step = 1 / 60;

	let player;

	initGame();

	/**
	 * game init
	 */
	function initGame() {
	    gameMap.initUnits(6, 'player');
	    [player] = gameMap.units.filter(unit => unit.id === 'player');
	    gameMap.initFoods(INIT_FOOD_COUNT);
	    binding();
	    animate();
	}

	function animate() {
	    stats.begin();
	    now = timestamp();
	    dt = Math.min(step, (now - last) / 1000);
	    gameMap.update(dt);
	    stats.end();
	    last = now;
	    raf(animate);
	}

	/**
	 * event binding
	 */
	function binding() {
	    window.addEventListener('resize', () => {
	        const width = window.innerWidth;
	        const height = window.innerHeight;
	        gameMap.resize(width, height);
	    });
	    // finger|mouse move event
	    if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {
	        window.addEventListener('touchstart', mousemove);
	        window.addEventListener('touchmove', mousemove);
	    } else {
	        // change snake's direction when mouse moving
	        window.addEventListener('mousemove', mousemove);

	        // speed up
	        window.addEventListener('mousedown', () => {
	            player.speedUp();
	            gameMap.scaled = true;
	        });

	        // speed down
	        window.addEventListener('mouseup', () => {
	            player.speedDown();
	            gameMap.scaled = false;
	        });
	    }

	    function mousemove(e) {
	        e.preventDefault();
	        if (e.touches) {
	            mouseCoords.x = e.touches[0].pageX;
	            mouseCoords.y = e.touches[0].pageY;
	        } else {
	            const evt = e || window.event;
	            mouseCoords.x = evt.clientX;
	            mouseCoords.y = evt.clientY;
	        }
	        const nx = (mouseCoords.x + gameMap.view.x) * gameMap.scale;
	        const ny = (mouseCoords.y + gameMap.view.y) * gameMap.scale;

	        player.moveTo(nx, ny, true);
	    }
	}

}());
//# sourceMappingURL=bundle.js.map
