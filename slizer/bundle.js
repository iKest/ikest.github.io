(function () {
    'use strict';

    /**
     * Also fix for the absent console in IE9
     */
    if (!window.console)
    {
        window.console = {};
        window.console.log = window.console.assert = function(){};
        window.console.warn = window.console.assert = function(){};
    }

    // ES6 Math.trunc - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc
    if (!Math.trunc) {
        Math.trunc = function trunc(x) {
            return x < 0 ? Math.ceil(x) : Math.floor(x);
        };
    }

    /* Copyright 2013 Chris Wilson

       Licensed under the Apache License, Version 2.0 (the "License");
       you may not use this file except in compliance with the License.
       You may obtain a copy of the License at

           http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing, software
       distributed under the License is distributed on an "AS IS" BASIS,
       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
       See the License for the specific language governing permissions and
       limitations under the License.
    */

    /*

    This monkeypatch library is intended to be included in projects that are
    written to the proper AudioContext spec (instead of webkitAudioContext),
    and that use the new naming and proper bits of the Web Audio API (e.g.
    using BufferSourceNode.start() instead of BufferSourceNode.noteOn()), but may
    have to run on systems that only support the deprecated bits.

    This library should be harmless to include if the browser supports
    unprefixed "AudioContext", and/or if it supports the new names.

    The patches this library handles:
    if window.AudioContext is unsupported, it will be aliased to webkitAudioContext().
    if AudioBufferSourceNode.start() is unimplemented, it will be routed to noteOn() or
    noteGrainOn(), depending on parameters.

    The following aliases only take effect if the new names are not already in place:

    AudioBufferSourceNode.stop() is aliased to noteOff()
    AudioContext.createGain() is aliased to createGainNode()
    AudioContext.createDelay() is aliased to createDelayNode()
    AudioContext.createScriptProcessor() is aliased to createJavaScriptNode()
    AudioContext.createPeriodicWave() is aliased to createWaveTable()
    OscillatorNode.start() is aliased to noteOn()
    OscillatorNode.stop() is aliased to noteOff()
    OscillatorNode.setPeriodicWave() is aliased to setWaveTable()
    AudioParam.setTargetAtTime() is aliased to setTargetValueAtTime()

    This library does NOT patch the enumerated type changes, as it is
    recommended in the specification that implementations support both integer
    and string types for AudioPannerNode.panningModel, AudioPannerNode.distanceModel
    BiquadFilterNode.type and OscillatorNode.type.

    */

    (function () {

      function fixSetTarget(param) {
        if (!param)	// if NYI, just return
          return;
        if (!param.setTargetAtTime)
          param.setTargetAtTime = param.setTargetValueAtTime;
      }

      if (window.hasOwnProperty('webkitAudioContext') &&
          !window.hasOwnProperty('AudioContext')) {
        window.AudioContext = webkitAudioContext;

        if (!AudioContext.prototype.hasOwnProperty('createGain'))
          AudioContext.prototype.createGain = AudioContext.prototype.createGainNode;
        if (!AudioContext.prototype.hasOwnProperty('createDelay'))
          AudioContext.prototype.createDelay = AudioContext.prototype.createDelayNode;
        if (!AudioContext.prototype.hasOwnProperty('createScriptProcessor'))
          AudioContext.prototype.createScriptProcessor = AudioContext.prototype.createJavaScriptNode;
        if (!AudioContext.prototype.hasOwnProperty('createPeriodicWave'))
          AudioContext.prototype.createPeriodicWave = AudioContext.prototype.createWaveTable;


        AudioContext.prototype.internal_createGain = AudioContext.prototype.createGain;
        AudioContext.prototype.createGain = function() {
          var node = this.internal_createGain();
          fixSetTarget(node.gain);
          return node;
        };

        AudioContext.prototype.internal_createDelay = AudioContext.prototype.createDelay;
        AudioContext.prototype.createDelay = function(maxDelayTime) {
          var node = maxDelayTime ? this.internal_createDelay(maxDelayTime) : this.internal_createDelay();
          fixSetTarget(node.delayTime);
          return node;
        };

        AudioContext.prototype.internal_createBufferSource = AudioContext.prototype.createBufferSource;
        AudioContext.prototype.createBufferSource = function() {
          var node = this.internal_createBufferSource();
          if (!node.start) {
            node.start = function ( when, offset, duration ) {
              if ( offset || duration )
                this.noteGrainOn( when || 0, offset, duration );
              else
                this.noteOn( when || 0 );
            };
          } else {
            node.internal_start = node.start;
            node.start = function( when, offset, duration ) {
              if( typeof duration !== 'undefined' )
                node.internal_start( when || 0, offset, duration );
              else
                node.internal_start( when || 0, offset || 0 );
            };
          }
          if (!node.stop) {
            node.stop = function ( when ) {
              this.noteOff( when || 0 );
            };
          } else {
            node.internal_stop = node.stop;
            node.stop = function( when ) {
              node.internal_stop( when || 0 );
            };
          }
          fixSetTarget(node.playbackRate);
          return node;
        };

        AudioContext.prototype.internal_createDynamicsCompressor = AudioContext.prototype.createDynamicsCompressor;
        AudioContext.prototype.createDynamicsCompressor = function() {
          var node = this.internal_createDynamicsCompressor();
          fixSetTarget(node.threshold);
          fixSetTarget(node.knee);
          fixSetTarget(node.ratio);
          fixSetTarget(node.reduction);
          fixSetTarget(node.attack);
          fixSetTarget(node.release);
          return node;
        };

        AudioContext.prototype.internal_createBiquadFilter = AudioContext.prototype.createBiquadFilter;
        AudioContext.prototype.createBiquadFilter = function() {
          var node = this.internal_createBiquadFilter();
          fixSetTarget(node.frequency);
          fixSetTarget(node.detune);
          fixSetTarget(node.Q);
          fixSetTarget(node.gain);
          return node;
        };

        if (AudioContext.prototype.hasOwnProperty( 'createOscillator' )) {
          AudioContext.prototype.internal_createOscillator = AudioContext.prototype.createOscillator;
          AudioContext.prototype.createOscillator = function() {
            var node = this.internal_createOscillator();
            if (!node.start) {
              node.start = function ( when ) {
                this.noteOn( when || 0 );
              };
            } else {
              node.internal_start = node.start;
              node.start = function ( when ) {
                node.internal_start( when || 0);
              };
            }
            if (!node.stop) {
              node.stop = function ( when ) {
                this.noteOff( when || 0 );
              };
            } else {
              node.internal_stop = node.stop;
              node.stop = function( when ) {
                node.internal_stop( when || 0 );
              };
            }
            if (!node.setPeriodicWave)
              node.setPeriodicWave = node.setWaveTable;
            fixSetTarget(node.frequency);
            fixSetTarget(node.detune);
            return node;
          };
        }
      }

      if (window.hasOwnProperty('webkitOfflineAudioContext') &&
          !window.hasOwnProperty('OfflineAudioContext')) {
        window.OfflineAudioContext = webkitOfflineAudioContext;
      }

    })();

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var stats_min = createCommonjsModule(function (module, exports) {
    !function(e,t){module.exports=t();}(commonjsGlobal,function(){var c=function(){var n=0,l=document.createElement("div");function e(e){return l.appendChild(e.dom),e}function t(e){for(var t=0;t<l.children.length;t++)l.children[t].style.display=t===e?"block":"none";n=e;}l.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000",l.addEventListener("click",function(e){e.preventDefault(),t(++n%l.children.length);},!1);var i=(performance||Date).now(),a=i,o=0,f=e(new c.Panel("FPS","#0ff","#002")),r=e(new c.Panel("MS","#0f0","#020"));if(self.performance&&self.performance.memory)var d=e(new c.Panel("MB","#f08","#201"));return t(0),{REVISION:16,dom:l,addPanel:e,showPanel:t,begin:function(){i=(performance||Date).now();},end:function(){o++;var e=(performance||Date).now();if(r.update(e-i,200),a+1e3<=e&&(f.update(1e3*o/(e-a),100),a=e,o=0,d)){var t=performance.memory;d.update(t.usedJSHeapSize/1048576,t.jsHeapSizeLimit/1048576);}return e},update:function(){i=this.end();},domElement:l,setMode:t}};return c.Panel=function(n,l,i){var a=1/0,o=0,f=Math.round,r=f(window.devicePixelRatio||1),d=80*r,e=48*r,c=3*r,p=2*r,u=3*r,s=15*r,m=74*r,h=30*r,y=document.createElement("canvas");y.width=d,y.height=e,y.style.cssText="width:80px;height:48px";var v=y.getContext("2d");return v.font="bold "+9*r+"px Helvetica,Arial,sans-serif",v.textBaseline="top",v.fillStyle=i,v.fillRect(0,0,d,e),v.fillStyle=l,v.fillText(n,c,p),v.fillRect(u,s,m,h),v.fillStyle=i,v.globalAlpha=.9,v.fillRect(u,s,m,h),{dom:y,update:function(e,t){a=Math.min(a,e),o=Math.max(o,e),v.fillStyle=i,v.globalAlpha=1,v.fillRect(0,0,d,s),v.fillStyle=l,v.fillText(f(e)+" "+n+" ("+f(a)+"-"+f(o)+")",c,p),v.drawImage(y,u+r,s,m-r,h,u,s,m-r,h),v.fillRect(u+m-r,s,r,h),v.fillStyle=i,v.globalAlpha=.9,v.fillRect(u+m-r,s,r,f((1-e/t)*h));}}},c});
    });

    var version="0.3.2",classCallCheck=function(e,o){if(!(e instanceof o))throw new TypeError("Cannot call a class as a function")},createClass=function(){function e(e,o){for(var t=0;t<o.length;t++){var n=o[t];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}return function(o,t,n){return t&&e(o.prototype,t),n&&e(o,n),o}}(),toConsumableArray=function(e){if(Array.isArray(e)){for(var o=0,t=Array(e.length);o<e.length;o++)t[o]=e[o];return t}return Array.from(e)},MicroModal=function(){var e=["a[href]","area[href]",'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',"select:not([disabled]):not([aria-hidden])","textarea:not([disabled]):not([aria-hidden])","button:not([disabled]):not([aria-hidden])","iframe","object","embed","[contenteditable]",'[tabindex]:not([tabindex^="-"])'],o=function(){function o(e){var t=e.targetModal,n=e.triggers,i=void 0===n?[]:n,a=e.onShow,r=void 0===a?function(){}:a,s=e.onClose,l=void 0===s?function(){}:s,c=e.openTrigger,d=void 0===c?"data-micromodal-trigger":c,u=e.closeTrigger,h=void 0===u?"data-micromodal-close":u,f=e.disableScroll,v=void 0!==f&&f,m=e.disableFocus,g=void 0!==m&&m,b=e.awaitCloseAnimation,y=void 0!==b&&b,k=e.debugMode,w=void 0!==k&&k;classCallCheck(this,o),this.modal=document.getElementById(t),this.config={debugMode:w,disableScroll:v,openTrigger:d,closeTrigger:h,onShow:r,onClose:l,awaitCloseAnimation:y,disableFocus:g},i.length>0&&this.registerTriggers.apply(this,toConsumableArray(i)),this.onClick=this.onClick.bind(this),this.onKeydown=this.onKeydown.bind(this);}return createClass(o,[{key:"registerTriggers",value:function(){for(var e=this,o=arguments.length,t=Array(o),n=0;n<o;n++)t[n]=arguments[n];t.filter(Boolean).forEach(function(o){o.addEventListener("click",function(){return e.showModal()});});}},{key:"showModal",value:function(){this.activeElement=document.activeElement,this.modal.setAttribute("aria-hidden","false"),this.modal.classList.add("is-open"),this.setFocusToFirstNode(),this.scrollBehaviour("disable"),this.addEventListeners(),this.config.onShow(this.modal);}},{key:"closeModal",value:function(){var e=this.modal;this.modal.setAttribute("aria-hidden","true"),this.removeEventListeners(),this.scrollBehaviour("enable"),this.activeElement&&this.activeElement.focus(),this.config.onClose(this.modal),this.config.awaitCloseAnimation?this.modal.addEventListener("animationend",function o(){e.classList.remove("is-open"),e.removeEventListener("animationend",o,!1);},!1):e.classList.remove("is-open");}},{key:"closeModalById",value:function(e){this.modal=document.getElementById(e),this.modal&&this.closeModal();}},{key:"scrollBehaviour",value:function(e){if(this.config.disableScroll){var o=document.querySelector("body");switch(e){case"enable":Object.assign(o.style,{overflow:"",height:""});break;case"disable":Object.assign(o.style,{overflow:"hidden",height:"100vh"});}}}},{key:"addEventListeners",value:function(){this.modal.addEventListener("touchstart",this.onClick),this.modal.addEventListener("click",this.onClick),document.addEventListener("keydown",this.onKeydown);}},{key:"removeEventListeners",value:function(){this.modal.removeEventListener("touchstart",this.onClick),this.modal.removeEventListener("click",this.onClick),document.removeEventListener("keydown",this.onKeydown);}},{key:"onClick",value:function(e){e.target.hasAttribute(this.config.closeTrigger)&&(this.closeModal(),e.preventDefault());}},{key:"onKeydown",value:function(e){27===e.keyCode&&this.closeModal(e),9===e.keyCode&&this.maintainFocus(e);}},{key:"getFocusableNodes",value:function(){var o=this.modal.querySelectorAll(e);return Array.apply(void 0,toConsumableArray(o))}},{key:"setFocusToFirstNode",value:function(){if(!this.config.disableFocus){var e=this.getFocusableNodes();e.length&&e[0].focus();}}},{key:"maintainFocus",value:function(e){var o=this.getFocusableNodes();if(this.modal.contains(document.activeElement)){var t=o.indexOf(document.activeElement);e.shiftKey&&0===t&&(o[o.length-1].focus(),e.preventDefault()),e.shiftKey||t!==o.length-1||(o[0].focus(),e.preventDefault());}else o[0].focus();}}]),o}(),t=null,n=function(e,o){var t=[];return e.forEach(function(e){var n=e.attributes[o].value;void 0===t[n]&&(t[n]=[]),t[n].push(e);}),t},i=function(e){if(!document.getElementById(e))return console.warn("MicroModal v"+version+": ❗Seems like you have missed %c'"+e+"'","background-color: #f8f9fa;color: #50596c;font-weight: bold;","ID somewhere in your code. Refer example below to resolve it."),console.warn("%cExample:","background-color: #f8f9fa;color: #50596c;font-weight: bold;",'<div class="modal" id="'+e+'"></div>'),!1},a=function(e){if(e.length<=0)return console.warn("MicroModal v"+version+": ❗Please specify at least one %c'micromodal-trigger'","background-color: #f8f9fa;color: #50596c;font-weight: bold;","data attribute."),console.warn("%cExample:","background-color: #f8f9fa;color: #50596c;font-weight: bold;",'<a href="#" data-micromodal-trigger="my-modal"></a>'),!1},r=function(e,o){if(a(e),!o)return !0;for(var t in o)i(t);return !0};return {init:function(e){var t=Object.assign({},{openTrigger:"data-micromodal-trigger"},e),i=[].concat(toConsumableArray(document.querySelectorAll("["+t.openTrigger+"]"))),a=n(i,t.openTrigger);if(!0!==t.debugMode||!1!==r(i,a))for(var s in a){var l=a[s];t.targetModal=s,t.triggers=[].concat(toConsumableArray(l)),new o(t);}},show:function(e,n){var a=n||{};a.targetModal=e,!0===a.debugMode&&!1===i(e)||(t=new o(a)).showModal();},close:function(e){e?t.closeModalById(e):t.closeModal();}}}();

    var has = Object.prototype.hasOwnProperty;
    var isArray = Array.isArray;

    var hexTable = (function () {
        var array = [];
        for (var i = 0; i < 256; ++i) {
            array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
        }

        return array;
    }());

    var compactQueue = function compactQueue(queue) {
        while (queue.length > 1) {
            var item = queue.pop();
            var obj = item.obj[item.prop];

            if (isArray(obj)) {
                var compacted = [];

                for (var j = 0; j < obj.length; ++j) {
                    if (typeof obj[j] !== 'undefined') {
                        compacted.push(obj[j]);
                    }
                }

                item.obj[item.prop] = compacted;
            }
        }
    };

    var arrayToObject = function arrayToObject(source, options) {
        var obj = options && options.plainObjects ? Object.create(null) : {};
        for (var i = 0; i < source.length; ++i) {
            if (typeof source[i] !== 'undefined') {
                obj[i] = source[i];
            }
        }

        return obj;
    };

    var merge = function merge(target, source, options) {
        if (!source) {
            return target;
        }

        if (typeof source !== 'object') {
            if (isArray(target)) {
                target.push(source);
            } else if (target && typeof target === 'object') {
                if ((options && (options.plainObjects || options.allowPrototypes)) || !has.call(Object.prototype, source)) {
                    target[source] = true;
                }
            } else {
                return [target, source];
            }

            return target;
        }

        if (!target || typeof target !== 'object') {
            return [target].concat(source);
        }

        var mergeTarget = target;
        if (isArray(target) && !isArray(source)) {
            mergeTarget = arrayToObject(target, options);
        }

        if (isArray(target) && isArray(source)) {
            source.forEach(function (item, i) {
                if (has.call(target, i)) {
                    var targetItem = target[i];
                    if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                        target[i] = merge(targetItem, item, options);
                    } else {
                        target.push(item);
                    }
                } else {
                    target[i] = item;
                }
            });
            return target;
        }

        return Object.keys(source).reduce(function (acc, key) {
            var value = source[key];

            if (has.call(acc, key)) {
                acc[key] = merge(acc[key], value, options);
            } else {
                acc[key] = value;
            }
            return acc;
        }, mergeTarget);
    };

    var assign = function assignSingleSource(target, source) {
        return Object.keys(source).reduce(function (acc, key) {
            acc[key] = source[key];
            return acc;
        }, target);
    };

    var decode = function (str, decoder, charset) {
        var strWithoutPlus = str.replace(/\+/g, ' ');
        if (charset === 'iso-8859-1') {
            // unescape never throws, no try...catch needed:
            return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
        }
        // utf-8
        try {
            return decodeURIComponent(strWithoutPlus);
        } catch (e) {
            return strWithoutPlus;
        }
    };

    var encode = function encode(str, defaultEncoder, charset) {
        // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
        // It has been adapted here for stricter adherence to RFC 3986
        if (str.length === 0) {
            return str;
        }

        var string = typeof str === 'string' ? str : String(str);

        if (charset === 'iso-8859-1') {
            return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
                return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
            });
        }

        var out = '';
        for (var i = 0; i < string.length; ++i) {
            var c = string.charCodeAt(i);

            if (
                c === 0x2D // -
                || c === 0x2E // .
                || c === 0x5F // _
                || c === 0x7E // ~
                || (c >= 0x30 && c <= 0x39) // 0-9
                || (c >= 0x41 && c <= 0x5A) // a-z
                || (c >= 0x61 && c <= 0x7A) // A-Z
            ) {
                out += string.charAt(i);
                continue;
            }

            if (c < 0x80) {
                out = out + hexTable[c];
                continue;
            }

            if (c < 0x800) {
                out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
                continue;
            }

            if (c < 0xD800 || c >= 0xE000) {
                out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
                continue;
            }

            i += 1;
            c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
            out += hexTable[0xF0 | (c >> 18)]
                + hexTable[0x80 | ((c >> 12) & 0x3F)]
                + hexTable[0x80 | ((c >> 6) & 0x3F)]
                + hexTable[0x80 | (c & 0x3F)];
        }

        return out;
    };

    var compact = function compact(value) {
        var queue = [{ obj: { o: value }, prop: 'o' }];
        var refs = [];

        for (var i = 0; i < queue.length; ++i) {
            var item = queue[i];
            var obj = item.obj[item.prop];

            var keys = Object.keys(obj);
            for (var j = 0; j < keys.length; ++j) {
                var key = keys[j];
                var val = obj[key];
                if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                    queue.push({ obj: obj, prop: key });
                    refs.push(val);
                }
            }
        }

        compactQueue(queue);

        return value;
    };

    var isRegExp = function isRegExp(obj) {
        return Object.prototype.toString.call(obj) === '[object RegExp]';
    };

    var isBuffer = function isBuffer(obj) {
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
    };

    var combine = function combine(a, b) {
        return [].concat(a, b);
    };

    var utils = {
        arrayToObject: arrayToObject,
        assign: assign,
        combine: combine,
        compact: compact,
        decode: decode,
        encode: encode,
        isBuffer: isBuffer,
        isRegExp: isRegExp,
        merge: merge
    };

    var replace = String.prototype.replace;
    var percentTwenties = /%20/g;

    var formats = {
        'default': 'RFC3986',
        formatters: {
            RFC1738: function (value) {
                return replace.call(value, percentTwenties, '+');
            },
            RFC3986: function (value) {
                return value;
            }
        },
        RFC1738: 'RFC1738',
        RFC3986: 'RFC3986'
    };

    var has$1 = Object.prototype.hasOwnProperty;

    var arrayPrefixGenerators = {
        brackets: function brackets(prefix) { // eslint-disable-line func-name-matching
            return prefix + '[]';
        },
        comma: 'comma',
        indices: function indices(prefix, key) { // eslint-disable-line func-name-matching
            return prefix + '[' + key + ']';
        },
        repeat: function repeat(prefix) { // eslint-disable-line func-name-matching
            return prefix;
        }
    };

    var isArray$1 = Array.isArray;
    var push = Array.prototype.push;
    var pushToArray = function (arr, valueOrArray) {
        push.apply(arr, isArray$1(valueOrArray) ? valueOrArray : [valueOrArray]);
    };

    var toISO = Date.prototype.toISOString;

    var defaults = {
        addQueryPrefix: false,
        allowDots: false,
        charset: 'utf-8',
        charsetSentinel: false,
        delimiter: '&',
        encode: true,
        encoder: utils.encode,
        encodeValuesOnly: false,
        formatter: formats.formatters[formats['default']],
        // deprecated
        indices: false,
        serializeDate: function serializeDate(date) { // eslint-disable-line func-name-matching
            return toISO.call(date);
        },
        skipNulls: false,
        strictNullHandling: false
    };

    var stringify = function stringify( // eslint-disable-line func-name-matching
        object,
        prefix,
        generateArrayPrefix,
        strictNullHandling,
        skipNulls,
        encoder,
        filter,
        sort,
        allowDots,
        serializeDate,
        formatter,
        encodeValuesOnly,
        charset
    ) {
        var obj = object;
        if (typeof filter === 'function') {
            obj = filter(prefix, obj);
        } else if (obj instanceof Date) {
            obj = serializeDate(obj);
        } else if (generateArrayPrefix === 'comma' && isArray$1(obj)) {
            obj = obj.join(',');
        }

        if (obj === null) {
            if (strictNullHandling) {
                return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset) : prefix;
            }

            obj = '';
        }

        if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || utils.isBuffer(obj)) {
            if (encoder) {
                var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset);
                return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset))];
            }
            return [formatter(prefix) + '=' + formatter(String(obj))];
        }

        var values = [];

        if (typeof obj === 'undefined') {
            return values;
        }

        var objKeys;
        if (isArray$1(filter)) {
            objKeys = filter;
        } else {
            var keys = Object.keys(obj);
            objKeys = sort ? keys.sort(sort) : keys;
        }

        for (var i = 0; i < objKeys.length; ++i) {
            var key = objKeys[i];

            if (skipNulls && obj[key] === null) {
                continue;
            }

            if (isArray$1(obj)) {
                pushToArray(values, stringify(
                    obj[key],
                    typeof generateArrayPrefix === 'function' ? generateArrayPrefix(prefix, key) : prefix,
                    generateArrayPrefix,
                    strictNullHandling,
                    skipNulls,
                    encoder,
                    filter,
                    sort,
                    allowDots,
                    serializeDate,
                    formatter,
                    encodeValuesOnly,
                    charset
                ));
            } else {
                pushToArray(values, stringify(
                    obj[key],
                    prefix + (allowDots ? '.' + key : '[' + key + ']'),
                    generateArrayPrefix,
                    strictNullHandling,
                    skipNulls,
                    encoder,
                    filter,
                    sort,
                    allowDots,
                    serializeDate,
                    formatter,
                    encodeValuesOnly,
                    charset
                ));
            }
        }

        return values;
    };

    var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
        if (!opts) {
            return defaults;
        }

        if (opts.encoder !== null && opts.encoder !== undefined && typeof opts.encoder !== 'function') {
            throw new TypeError('Encoder has to be a function.');
        }

        var charset = opts.charset || defaults.charset;
        if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
            throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
        }

        var format = formats['default'];
        if (typeof opts.format !== 'undefined') {
            if (!has$1.call(formats.formatters, opts.format)) {
                throw new TypeError('Unknown format option provided.');
            }
            format = opts.format;
        }
        var formatter = formats.formatters[format];

        var filter = defaults.filter;
        if (typeof opts.filter === 'function' || isArray$1(opts.filter)) {
            filter = opts.filter;
        }

        return {
            addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
            allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
            charset: charset,
            charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
            delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
            encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
            encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
            encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
            filter: filter,
            formatter: formatter,
            serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
            skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
            sort: typeof opts.sort === 'function' ? opts.sort : null,
            strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
        };
    };

    var stringify_1 = function (object, opts) {
        var obj = object;
        var options = normalizeStringifyOptions(opts);

        var objKeys;
        var filter;

        if (typeof options.filter === 'function') {
            filter = options.filter;
            obj = filter('', obj);
        } else if (isArray$1(options.filter)) {
            filter = options.filter;
            objKeys = filter;
        }

        var keys = [];

        if (typeof obj !== 'object' || obj === null) {
            return '';
        }

        var arrayFormat;
        if (opts && opts.arrayFormat in arrayPrefixGenerators) {
            arrayFormat = opts.arrayFormat;
        } else if (opts && 'indices' in opts) {
            arrayFormat = opts.indices ? 'indices' : 'repeat';
        } else {
            arrayFormat = 'indices';
        }

        var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

        if (!objKeys) {
            objKeys = Object.keys(obj);
        }

        if (options.sort) {
            objKeys.sort(options.sort);
        }

        for (var i = 0; i < objKeys.length; ++i) {
            var key = objKeys[i];

            if (options.skipNulls && obj[key] === null) {
                continue;
            }
            pushToArray(keys, stringify(
                obj[key],
                key,
                generateArrayPrefix,
                options.strictNullHandling,
                options.skipNulls,
                options.encode ? options.encoder : null,
                options.filter,
                options.sort,
                options.allowDots,
                options.serializeDate,
                options.formatter,
                options.encodeValuesOnly,
                options.charset
            ));
        }

        var joined = keys.join(options.delimiter);
        var prefix = options.addQueryPrefix === true ? '?' : '';

        if (options.charsetSentinel) {
            if (options.charset === 'iso-8859-1') {
                // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
                prefix += 'utf8=%26%2310003%3B&';
            } else {
                // encodeURIComponent('✓')
                prefix += 'utf8=%E2%9C%93&';
            }
        }

        return joined.length > 0 ? prefix + joined : '';
    };

    var has$2 = Object.prototype.hasOwnProperty;

    var defaults$1 = {
        allowDots: false,
        allowPrototypes: false,
        arrayLimit: 20,
        charset: 'utf-8',
        charsetSentinel: false,
        comma: false,
        decoder: utils.decode,
        delimiter: '&',
        depth: 5,
        ignoreQueryPrefix: false,
        interpretNumericEntities: false,
        parameterLimit: 1000,
        parseArrays: true,
        plainObjects: false,
        strictNullHandling: false
    };

    var interpretNumericEntities = function (str) {
        return str.replace(/&#(\d+);/g, function ($0, numberStr) {
            return String.fromCharCode(parseInt(numberStr, 10));
        });
    };

    // This is what browsers will submit when the ✓ character occurs in an
    // application/x-www-form-urlencoded body and the encoding of the page containing
    // the form is iso-8859-1, or when the submitted form has an accept-charset
    // attribute of iso-8859-1. Presumably also with other charsets that do not contain
    // the ✓ character, such as us-ascii.
    var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

    // These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
    var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

    var parseValues = function parseQueryStringValues(str, options) {
        var obj = {};
        var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
        var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
        var parts = cleanStr.split(options.delimiter, limit);
        var skipIndex = -1; // Keep track of where the utf8 sentinel was found
        var i;

        var charset = options.charset;
        if (options.charsetSentinel) {
            for (i = 0; i < parts.length; ++i) {
                if (parts[i].indexOf('utf8=') === 0) {
                    if (parts[i] === charsetSentinel) {
                        charset = 'utf-8';
                    } else if (parts[i] === isoSentinel) {
                        charset = 'iso-8859-1';
                    }
                    skipIndex = i;
                    i = parts.length; // The eslint settings do not allow break;
                }
            }
        }

        for (i = 0; i < parts.length; ++i) {
            if (i === skipIndex) {
                continue;
            }
            var part = parts[i];

            var bracketEqualsPos = part.indexOf(']=');
            var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

            var key, val;
            if (pos === -1) {
                key = options.decoder(part, defaults$1.decoder, charset);
                val = options.strictNullHandling ? null : '';
            } else {
                key = options.decoder(part.slice(0, pos), defaults$1.decoder, charset);
                val = options.decoder(part.slice(pos + 1), defaults$1.decoder, charset);
            }

            if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
                val = interpretNumericEntities(val);
            }

            if (val && options.comma && val.indexOf(',') > -1) {
                val = val.split(',');
            }

            if (has$2.call(obj, key)) {
                obj[key] = utils.combine(obj[key], val);
            } else {
                obj[key] = val;
            }
        }

        return obj;
    };

    var parseObject = function (chain, val, options) {
        var leaf = val;

        for (var i = chain.length - 1; i >= 0; --i) {
            var obj;
            var root = chain[i];

            if (root === '[]' && options.parseArrays) {
                obj = [].concat(leaf);
            } else {
                obj = options.plainObjects ? Object.create(null) : {};
                var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
                var index = parseInt(cleanRoot, 10);
                if (!options.parseArrays && cleanRoot === '') {
                    obj = { 0: leaf };
                } else if (
                    !isNaN(index)
                    && root !== cleanRoot
                    && String(index) === cleanRoot
                    && index >= 0
                    && (options.parseArrays && index <= options.arrayLimit)
                ) {
                    obj = [];
                    obj[index] = leaf;
                } else {
                    obj[cleanRoot] = leaf;
                }
            }

            leaf = obj;
        }

        return leaf;
    };

    var parseKeys = function parseQueryStringKeys(givenKey, val, options) {
        if (!givenKey) {
            return;
        }

        // Transform dot notation to bracket notation
        var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

        // The regex chunks

        var brackets = /(\[[^[\]]*])/;
        var child = /(\[[^[\]]*])/g;

        // Get the parent

        var segment = brackets.exec(key);
        var parent = segment ? key.slice(0, segment.index) : key;

        // Stash the parent if it exists

        var keys = [];
        if (parent) {
            // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
            if (!options.plainObjects && has$2.call(Object.prototype, parent)) {
                if (!options.allowPrototypes) {
                    return;
                }
            }

            keys.push(parent);
        }

        // Loop through children appending to the array until we hit depth

        var i = 0;
        while ((segment = child.exec(key)) !== null && i < options.depth) {
            i += 1;
            if (!options.plainObjects && has$2.call(Object.prototype, segment[1].slice(1, -1))) {
                if (!options.allowPrototypes) {
                    return;
                }
            }
            keys.push(segment[1]);
        }

        // If there's a remainder, just add whatever is left

        if (segment) {
            keys.push('[' + key.slice(segment.index) + ']');
        }

        return parseObject(keys, val, options);
    };

    var normalizeParseOptions = function normalizeParseOptions(opts) {
        if (!opts) {
            return defaults$1;
        }

        if (opts.decoder !== null && opts.decoder !== undefined && typeof opts.decoder !== 'function') {
            throw new TypeError('Decoder has to be a function.');
        }

        if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
            throw new Error('The charset option must be either utf-8, iso-8859-1, or undefined');
        }
        var charset = typeof opts.charset === 'undefined' ? defaults$1.charset : opts.charset;

        return {
            allowDots: typeof opts.allowDots === 'undefined' ? defaults$1.allowDots : !!opts.allowDots,
            allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults$1.allowPrototypes,
            arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults$1.arrayLimit,
            charset: charset,
            charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults$1.charsetSentinel,
            comma: typeof opts.comma === 'boolean' ? opts.comma : defaults$1.comma,
            decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults$1.decoder,
            delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults$1.delimiter,
            depth: typeof opts.depth === 'number' ? opts.depth : defaults$1.depth,
            ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
            interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults$1.interpretNumericEntities,
            parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults$1.parameterLimit,
            parseArrays: opts.parseArrays !== false,
            plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults$1.plainObjects,
            strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults$1.strictNullHandling
        };
    };

    var parse = function (str, opts) {
        var options = normalizeParseOptions(opts);

        if (str === '' || str === null || typeof str === 'undefined') {
            return options.plainObjects ? Object.create(null) : {};
        }

        var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
        var obj = options.plainObjects ? Object.create(null) : {};

        // Iterate over the keys and setup the new object

        var keys = Object.keys(tempObj);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            var newObj = parseKeys(key, tempObj[key], options);
            obj = utils.merge(obj, newObj, options);
        }

        return utils.compact(obj);
    };

    var lib = {
        formats: formats,
        parse: parse,
        stringify: stringify_1
    };
    var lib_2 = lib.parse;

    function angleBetweenCoords(x0, y0, x1, y1) {
        const dx = x1 - x0;
        const dy = y1 - y0;
        return Math.atan2(dy, dx);
    }

    const MAP_RADIUS = 10000; // Радиус игрового мира

    const MIN_SPEED = 500; // Минимальная линейная скорость червяка (пикселей/сек)
    const MAX_SPEED = 1000; //Максимальная линейная скорость червяка (пикселей/сек)
    const ANGLE_SPEED = 10; // Угловая скорость червяка (радиан/сек)
    const ACCELERATION = 0.02; // Линейное ускорение (пикселей / сек^2)
    const LIGHT_SPEED = 5; // Скорость "пульсации" еды (пикселей/сек)
    const BOTS_UPDATE_COUNT = 0.1; // частота обновления логики ботов (ботов/сек)

    const SNAKE_IMG_SIZE = 40; // Начальная ширина червяка
    const SNAKE_LENGTH = 0; // Начальная длина червяка
    const SNAKE_SIZE_STEP = 20; // Шаг приращения размера AABB коллайдеров сегментов червяка
    const SNAKE_OFFSET = -6; // Смещение головы червяка относительно основания (высота);
    const SHADOW_OFFSET_X = 0; // Горизонтальный оффсет тени червяка и границы игрового мира
    const SHADOW_OFFSET_Y = 4; // Вертикальный оффсет тени червяка и границы игрового мира
    const SHADOW_BLUR = 7; // Радиус размытия тени червяка и границы игрового мира
    const SPEED_SHADOW_BLUR = 0.3; // Максимальный радиус размытия свечения червяка при движениии с повышенной скоростью
    const SNAKE_TO_SNAKE_VISION_DISTANCE = 800; // Дистанция на которой червяк "видит" других червяков

    const INIT_FOODS_COUNT = 1000; // Максимальное количество еды на поле
    const INIT_UNITS_COUNT = 150; // Максимальное количество червяков на поле.
    const DRAW_DEBUG = false; // Нужно-ли рисовать дебаг граффику при старте игры

    const { PI, sqrt, sin, cos } = Math;
    const M_1_SQRTPI = 1.0 / sqrt(PI);
    const M_SQRTTWO = sqrt(2.0);
    const M_1_SQRTTWO = 1.0 / sqrt(2.0);
    const ZEROSIN = sin(0);
    const ZEROCOS = cos(0);
    const MSSEC = 1 / 1e3;

    var eventemitter3 = createCommonjsModule(function (module) {

    var has = Object.prototype.hasOwnProperty
      , prefix = '~';

    /**
     * Constructor to create a storage for our `EE` objects.
     * An `Events` instance is a plain object whose properties are event names.
     *
     * @constructor
     * @private
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
     * @param {*} context The context to invoke the listener with.
     * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
     * @constructor
     * @private
     */
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }

    /**
     * Add a listener for a given event.
     *
     * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn The listener function.
     * @param {*} context The context to invoke the listener with.
     * @param {Boolean} once Specify if the listener is a one-time listener.
     * @returns {EventEmitter}
     * @private
     */
    function addListener(emitter, event, fn, context, once) {
      if (typeof fn !== 'function') {
        throw new TypeError('The listener must be a function');
      }

      var listener = new EE(fn, context || emitter, once)
        , evt = prefix ? prefix + event : event;

      if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
      else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
      else emitter._events[evt] = [emitter._events[evt], listener];

      return emitter;
    }

    /**
     * Clear event by name.
     *
     * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
     * @param {(String|Symbol)} evt The Event name.
     * @private
     */
    function clearEvent(emitter, evt) {
      if (--emitter._eventsCount === 0) emitter._events = new Events();
      else delete emitter._events[evt];
    }

    /**
     * Minimal `EventEmitter` interface that is molded against the Node.js
     * `EventEmitter` interface.
     *
     * @constructor
     * @public
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
     * @public
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
     * @param {(String|Symbol)} event The event name.
     * @returns {Array} The registered listeners.
     * @public
     */
    EventEmitter.prototype.listeners = function listeners(event) {
      var evt = prefix ? prefix + event : event
        , handlers = this._events[evt];

      if (!handlers) return [];
      if (handlers.fn) return [handlers.fn];

      for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
        ee[i] = handlers[i].fn;
      }

      return ee;
    };

    /**
     * Return the number of listeners listening to a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @returns {Number} The number of listeners.
     * @public
     */
    EventEmitter.prototype.listenerCount = function listenerCount(event) {
      var evt = prefix ? prefix + event : event
        , listeners = this._events[evt];

      if (!listeners) return 0;
      if (listeners.fn) return 1;
      return listeners.length;
    };

    /**
     * Calls each of the listeners registered for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @returns {Boolean} `true` if the event had listeners, else `false`.
     * @public
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
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn The listener function.
     * @param {*} [context=this] The context to invoke the listener with.
     * @returns {EventEmitter} `this`.
     * @public
     */
    EventEmitter.prototype.on = function on(event, fn, context) {
      return addListener(this, event, fn, context, false);
    };

    /**
     * Add a one-time listener for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn The listener function.
     * @param {*} [context=this] The context to invoke the listener with.
     * @returns {EventEmitter} `this`.
     * @public
     */
    EventEmitter.prototype.once = function once(event, fn, context) {
      return addListener(this, event, fn, context, true);
    };

    /**
     * Remove the listeners of a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn Only remove the listeners that match this function.
     * @param {*} context Only remove the listeners that have this context.
     * @param {Boolean} once Only remove one-time listeners.
     * @returns {EventEmitter} `this`.
     * @public
     */
    EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;

      if (!this._events[evt]) return this;
      if (!fn) {
        clearEvent(this, evt);
        return this;
      }

      var listeners = this._events[evt];

      if (listeners.fn) {
        if (
          listeners.fn === fn &&
          (!once || listeners.once) &&
          (!context || listeners.context === context)
        ) {
          clearEvent(this, evt);
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (
            listeners[i].fn !== fn ||
            (once && !listeners[i].once) ||
            (context && listeners[i].context !== context)
          ) {
            events.push(listeners[i]);
          }
        }

        //
        // Reset the array, or remove it completely if we have no more listeners.
        //
        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
        else clearEvent(this, evt);
      }

      return this;
    };

    /**
     * Remove all listeners, or those of the specified event.
     *
     * @param {(String|Symbol)} [event] The event name.
     * @returns {EventEmitter} `this`.
     * @public
     */
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
      var evt;

      if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt]) clearEvent(this, evt);
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

    var sort = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	module.exports = factory();
    }(commonjsGlobal, (function () {
    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    /* eslint no-use-before-define: 0 */

    // >>> SORTERS <<<

    var sorter = function sorter(direction, a, b) {
      if (a === b) return 0;
      if (a < b) return -direction;
      if (a == null) return 1;
      if (b == null) return -1;

      return direction;
    };

    /**
     * stringSorter does not support nested property.
     * For nested properties or value transformation (e.g toLowerCase) we should use functionSorter
     * Based on benchmark testing using stringSorter is bit faster then using equivalent function sorter
     * @example sort(users).asc('firstName')
     */
    var stringSorter = function stringSorter(direction, sortBy, a, b) {
      return sorter(direction, a[sortBy], b[sortBy]);
    };

    /**
     * @example sort(users).asc(p => p.address.city)
     */
    var functionSorter = function functionSorter(direction, sortBy, a, b) {
      return sorter(direction, sortBy(a), sortBy(b));
    };

    /**
     * Used when we have sorting by multyple properties and when current sorter is function
     * @example sort(users).asc([p => p.address.city, p => p.firstName])
     */
    var multiPropFunctionSorter = function multiPropFunctionSorter(sortBy, thenBy, depth, direction, a, b) {
      return multiPropEqualityHandler(sortBy(a), sortBy(b), thenBy, depth, direction, a, b);
    };

    /**
     * Used when we have sorting by multiple properties and when current sorter is string
     * @example sort(users).asc(['firstName', 'lastName'])
     */
    var multiPropStringSorter = function multiPropStringSorter(sortBy, thenBy, depth, direction, a, b) {
      return multiPropEqualityHandler(a[sortBy], b[sortBy], thenBy, depth, direction, a, b);
    };

    /**
     * Used with 'by' sorter when we have sorting in multiple direction
     * @example sort(users).asc(['firstName', 'lastName'])
     */
    var multiPropObjectSorter = function multiPropObjectSorter(sortByObj, thenBy, depth, _direction, a, b) {
      var sortBy = sortByObj.asc || sortByObj.desc;
      var direction = sortByObj.asc ? 1 : -1;

      if (!sortBy) {
        throw Error('sort: Invalid \'by\' sorting configuration.\n      Expecting object with \'asc\' or \'desc\' key');
      }

      var multiSorter = getMultiPropertySorter(sortBy);
      return multiSorter(sortBy, thenBy, depth, direction, a, b);
    };

    // >>> HELPERS <<<

    /**
     * Return multiProperty sort handler based on sortBy value
     */
    var getMultiPropertySorter = function getMultiPropertySorter(sortBy) {
      var type = typeof sortBy === 'undefined' ? 'undefined' : _typeof(sortBy);
      if (type === 'string') {
        return multiPropStringSorter;
      } else if (type === 'function') {
        return multiPropFunctionSorter;
      }

      return multiPropObjectSorter;
    };

    var multiPropEqualityHandler = function multiPropEqualityHandler(valA, valB, thenBy, depth, direction, a, b) {
      if (valA === valB || valA == null && valB == null) {
        if (thenBy.length > depth) {
          var multiSorter = getMultiPropertySorter(thenBy[depth]);
          return multiSorter(thenBy[depth], thenBy, depth + 1, direction, a, b);
        }
        return 0;
      }

      return sorter(direction, valA, valB);
    };

    /**
     * Pick sorter based on provided sortBy value
     */
    var sort = function sort(direction, ctx, sortBy) {
      if (!Array.isArray(ctx)) return ctx;

      // Unwrap sortBy if array with only 1 value
      if (Array.isArray(sortBy) && sortBy.length < 2) {
        var _sortBy = sortBy;

        var _sortBy2 = _slicedToArray(_sortBy, 1);

        sortBy = _sortBy2[0];
      }

      var _sorter = void 0;

      if (!sortBy) {
        _sorter = sorter.bind(undefined, direction);
      } else if (typeof sortBy === 'string') {
        _sorter = stringSorter.bind(undefined, direction, sortBy);
      } else if (typeof sortBy === 'function') {
        _sorter = functionSorter.bind(undefined, direction, sortBy);
      } else {
        _sorter = getMultiPropertySorter(sortBy[0]).bind(undefined, sortBy.shift(), sortBy, 0, direction);
      }

      return ctx.sort(_sorter);
    };

    // >>> PUBLIC <<<

    var sort_1 = function sort_1(ctx) {
      return {
        asc: function asc(sortBy) {
          return sort(1, ctx, sortBy);
        },
        desc: function desc(sortBy) {
          return sort(-1, ctx, sortBy);
        },
        by: function by(sortBy) {
          if (!Array.isArray(ctx)) return ctx;

          if (!Array.isArray(sortBy)) {
            throw Error('sort: Invalid usage of \'by\' sorter. Array syntax is required.\n          Did you mean to use \'asc\' or \'desc\' sorter instead?');
          }

          // Unwrap sort by to faster path
          if (sortBy.length === 1) {
            var direction = sortBy[0].asc ? 1 : -1;
            var sortOnProp = sortBy[0].asc || sortBy[0].desc;
            if (!sortOnProp) {
              throw Error('sort: Invalid \'by\' sorting configuration.\n            Expecting object with \'asc\' or \'desc\' key');
            }
            return sort(direction, ctx, sortOnProp);
          }

          var _sorter = multiPropObjectSorter.bind(undefined, sortBy.shift(), sortBy, 0, undefined);
          return ctx.sort(_sorter);
        }
      };
    };

    return sort_1;

    })));
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
     * circleOutline-box (axis-aligned) collision
     * @param {number} xc center of circle
     * @param {number} yc center of circle
     * @param {radius} rc radius of circle
     * @param {number} x top-left corner of box
     * @param {number} y top-left corner of box
     * @param {number} width of box
     * @param {number} height of box
     * @param {number} thickness of circle outline
     */
    var circleOutlineBox = function circleOutlineBox(xc, yc, rc, x, y, width, height, thickness)
    {
        thickness = thickness || 1;
        var count = 0;
        count += circlePoint(xc, yc, rc, x, y) ? 1 : 0;
        count += circlePoint(xc, yc, rc, x + width, y) ? 1 : 0;
        count += circlePoint(xc, yc, rc, x, y + height) ? 1 : 0;
        count += circlePoint(xc, yc, rc, x + width, y + height) ? 1 : 0;

        // if no corners are inside the circle, then intersects only if box encloses circle-outline
        if (count === 0)
        {
            return boxCircle(x, y, width, height, xc, yc, rc)
        }

        // if one corner is inside and one corner is outside then box intersects circle-outline
        if (count >= 1 && count <= 3)
        {
            return true
        }

        // last check is if box is inside circle, need to check that a corner is not inside the inner circle
        if (count === 4)
        {
            return !circlePoint(xc, yc, rc - thickness, x, y) ||
                !circlePoint(xc, yc, rc - thickness, x + width, y) ||
                !circlePoint(xc, yc, rc - thickness, x, y + height) ||
                !circlePoint(xc, yc, rc - thickness, x + width, y + height)
        }
    };

    /**
     * circleOutline-line collision
     * @param {number} xc center of circle
     * @param {number} yc center of circle
     * @param {radius} rc radius of circle
     * @param {number} x1 of point 1 of line
     * @param {number} y1 of point 1 of line
     * @param {number} x2 of point 2 of line
     * @param {number} y2 of point 2 of line
     * @param {number} thickness of circle outline
     */
    var circleOutlineLine = function circleOutlineLine(xc, yc, rc, x1, y1, x2, y2, thickness)
    {
        thickness = thickness || 1;
        return lineCircle(x1, y1, x2, y2, xc, yc, rc) && !(circlePoint(xc, yc, rc - thickness, x1, y1) && circlePoint(xc, yc, rc - thickness, x2, y2))
    };

    /**
     * circleOutline-point collision
     * @param {number} xc center of circle
     * @param {number} yc center of circle
     * @param {radius} rc radius of circle
     * @param {number} x of point
     * @param {number} y of point
     * @param {number} thickness of circle outline
     */
    var circleOutlinePoint = function circleOutlinePoint(xc, yc, rc, x, y, thickness)
    {
        thickness = thickness || 1;
        return circlePoint(xc, yc, rc, x, y) && !circlePoint(xc, yc, rc - thickness, x, y)
    };

    /**
     * lineToLine helper function (to avoid circular dependencies)
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
    var lineToLine = function lineToLine(x1, y1, x2, y2, x3, y3, x4, y4)
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
            if (lineToLine(x1, y1, x2, y2, points[i], points[i + 1], points[j], points[j + 1]))
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
     * turns a line into a polygon using thickness
     * @param {number} x1 first point of line
     * @param {number} y1 first point of line
     * @param {number} x2 second point of line
     * @param {number} y2 second point of line
     * @param {number} thickness of line
     */
    var lineToPolygon = function lineToPolygon(x1, y1, x2, y2, thickness)
    {
        const angle = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2;
        const half = thickness / 2;
        const cos = Math.cos(angle) * half;
        const sin = Math.sin(angle) * half;
        return [
            x1 - cos, y1 - sin,
            x2 - cos, y2 - sin,
            x2 + cos, y2 + sin,
            x1 + cos, y1 + sin
        ]
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
     * @param {number} [thickness1] of line 1 (the line is centered in its thickness--see demo)
     * @param {number} [thickness2] of line 2 (the line is centered in its thickness--see demo)
     * @return {boolean}
     */
    var lineLine = function lineLine(x1, y1, x2, y2, x3, y3, x4, y4, thickness1, thickness2)
    {
        if (thickness1 || thickness2)
        {
            return lineLineThickness(x1, y1, x2, y2, x3, y3, x4, y4, thickness1, thickness2)
        }
        else
        {
            return lineToLine(x1, y1, x2, y2, x3, y3, x4, y4)
        }
    };

    function lineLineThickness(x1, y1, x2, y2, x3, y3, x4, y4, thickness1, thickness2)
    {
        if (thickness1 && thickness2)
        {
            return polygonPolygon(lineToPolygon(x1, y1, x2, y2, thickness1), lineToPolygon(x3, y3, x4, y4, thickness2))
        }
        else if (thickness1)
        {
            return linePolygon(x3, y3, x4, y4, lineToPolygon(x1, y1, x2, y2, thickness1))
        }
        else if (thickness2)
        {
            return linePolygon(x1, y1, x2, y2, lineToPolygon(x3, y3, x4, y4, thickness1))
        }
    }

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
     * circleOutline-box (axis-aligned) collision
     * @param {number} xc center of circle
     * @param {number} yc center of circle
     * @param {radius} rc radius of circle
     * @param {number} x top-left corner of box
     * @param {number} y top-left corner of box
     * @param {number} width of box
     * @param {number} height of box
     * @param {number} thickness of circle outline
     */
    var boxCircleOutline = function boxCircleOutline(x, y, width, height, xc, yc, rc, thickness)
    {
        return circleOutlineBox(xc, yc, rc, x, y, width, height, thickness)
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
     * point-circleOutline collision
     * @param {number} x of point
     * @param {number} y of point
     * @param {number} xc center of circle
     * @param {number} yc center of circle
     * @param {radius} rc radius of circle
     * @param {number} thickness of circle outline
     */
    var pointCircleOutline = function pointCircleOutline(x, y, xc, yc, rc, thickness)
    {
        return circleOutlinePoint(x, y, xc, yc, rc, thickness)
    };

    /**
     * line-circleOutline collision
     * @param {number} x1 of point 1 of line
     * @param {number} y1 of point 1 of line
     * @param {number} x2 of point 2 of line
     * @param {number} y2 of point 2 of line
     * @param {number} xc center of circle
     * @param {number} yc center of circle
     * @param {radius} rc radius of circle
     * @param {number} thickness of circle outline
     */
    var lineCircleOutline = function lineCircleOutline(x1, y1, x2, y2, xc, yc, rc, thickness)
    {
        return circleOutlineLine(xc, yc, rc, x1, y1, x2, y2, thickness)
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
        // circleCircleOutline: require('./circle-circleOutline'),

        circleOutlineBox: circleOutlineBox,
        circleOutlineLine: circleOutlineLine,
        circleOutlinePoint: circleOutlinePoint,
        // circleOutlineCircle: require('./circleOutline-circle'),

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
        boxCircleOutline: boxCircleOutline,

        pointBox: pointBox,
        pointPolygon: pointPolygon,
        pointCircle: pointCircle,
        pointLine: pointLine,
        pointEllipse: pointEllipse,
        pointCircleOutline: pointCircleOutline,

        lineLine: lineLine,
        lineBox: lineBox,
        linePolygon: linePolygon,
        lineCircle: lineCircle,
        linePoint: linePoint,
        lineEllipse: lineEllipse,
        lineCircleOutline: lineCircleOutline,

        ellipsePoint: ellipsePoint,
        ellipseLine: ellipseLine,
        ellipseBox: ellipseBox,
        ellipseCircle: ellipseCircle$1,
        ellipseEllipse: ellipseEllipse$1,
        ellipsePolygon: ellipsePolygon
    };
    var intersects_12 = intersects.polygonPolygon;
    var intersects_14 = intersects.polygonCircle;

    var rbush_min = createCommonjsModule(function (module, exports) {
    !function(t,i){module.exports=i();}(commonjsGlobal,function(){function t(t,r,e,a,h){!function t(n,r,e,a,h){for(;a>e;){if(a-e>600){var o=a-e+1,s=r-e+1,l=Math.log(o),f=.5*Math.exp(2*l/3),u=.5*Math.sqrt(l*f*(o-f)/o)*(s-o/2<0?-1:1),m=Math.max(e,Math.floor(r-s*f/o+u)),c=Math.min(a,Math.floor(r+(o-s)*f/o+u));t(n,r,m,c,h);}var p=n[r],d=e,x=a;for(i(n,e,r),h(n[a],p)>0&&i(n,e,a);d<x;){for(i(n,d,x),d++,x--;h(n[d],p)<0;)d++;for(;h(n[x],p)>0;)x--;}0===h(n[e],p)?i(n,e,x):i(n,++x,a),x<=r&&(e=x+1),r<=x&&(a=x-1);}}(t,r,e||0,a||t.length-1,h||n);}function i(t,i,n){var r=t[i];t[i]=t[n],t[n]=r;}function n(t,i){return t<i?-1:t>i?1:0}var r=function(t){void 0===t&&(t=9),this._maxEntries=Math.max(4,t),this._minEntries=Math.max(2,Math.ceil(.4*this._maxEntries)),this.clear();};function e(t,i,n){if(!n)return i.indexOf(t);for(var r=0;r<i.length;r++)if(n(t,i[r]))return r;return -1}function a(t,i){h(t,0,t.children.length,i,t);}function h(t,i,n,r,e){e||(e=p(null)),e.minX=1/0,e.minY=1/0,e.maxX=-1/0,e.maxY=-1/0;for(var a=i;a<n;a++){var h=t.children[a];o(e,t.leaf?r(h):h);}return e}function o(t,i){return t.minX=Math.min(t.minX,i.minX),t.minY=Math.min(t.minY,i.minY),t.maxX=Math.max(t.maxX,i.maxX),t.maxY=Math.max(t.maxY,i.maxY),t}function s(t,i){return t.minX-i.minX}function l(t,i){return t.minY-i.minY}function f(t){return (t.maxX-t.minX)*(t.maxY-t.minY)}function u(t){return t.maxX-t.minX+(t.maxY-t.minY)}function m(t,i){return t.minX<=i.minX&&t.minY<=i.minY&&i.maxX<=t.maxX&&i.maxY<=t.maxY}function c(t,i){return i.minX<=t.maxX&&i.minY<=t.maxY&&i.maxX>=t.minX&&i.maxY>=t.minY}function p(t){return {children:t,height:1,leaf:!0,minX:1/0,minY:1/0,maxX:-1/0,maxY:-1/0}}function d(i,n,r,e,a){for(var h=[n,r];h.length;)if(!((r=h.pop())-(n=h.pop())<=e)){var o=n+Math.ceil((r-n)/e/2)*e;t(i,o,n,r,a),h.push(n,o,o,r);}}return r.prototype.all=function(){return this._all(this.data,[])},r.prototype.search=function(t){var i=this.data,n=[];if(!c(t,i))return n;for(var r=this.toBBox,e=[];i;){for(var a=0;a<i.children.length;a++){var h=i.children[a],o=i.leaf?r(h):h;c(t,o)&&(i.leaf?n.push(h):m(t,o)?this._all(h,n):e.push(h));}i=e.pop();}return n},r.prototype.collides=function(t){var i=this.data;if(!c(t,i))return !1;for(var n=[];i;){for(var r=0;r<i.children.length;r++){var e=i.children[r],a=i.leaf?this.toBBox(e):e;if(c(t,a)){if(i.leaf||m(t,a))return !0;n.push(e);}}i=n.pop();}return !1},r.prototype.load=function(t){if(!t||!t.length)return this;if(t.length<this._minEntries){for(var i=0;i<t.length;i++)this.insert(t[i]);return this}var n=this._build(t.slice(),0,t.length-1,0);if(this.data.children.length)if(this.data.height===n.height)this._splitRoot(this.data,n);else{if(this.data.height<n.height){var r=this.data;this.data=n,n=r;}this._insert(n,this.data.height-n.height-1,!0);}else this.data=n;return this},r.prototype.insert=function(t){return t&&this._insert(t,this.data.height-1),this},r.prototype.clear=function(){return this.data=p([]),this},r.prototype.remove=function(t,i){if(!t)return this;for(var n,r,a,h=this.data,o=this.toBBox(t),s=[],l=[];h||s.length;){if(h||(h=s.pop(),r=s[s.length-1],n=l.pop(),a=!0),h.leaf){var f=e(t,h.children,i);if(-1!==f)return h.children.splice(f,1),s.push(h),this._condense(s),this}a||h.leaf||!m(h,o)?r?(n++,h=r.children[n],a=!1):h=null:(s.push(h),l.push(n),n=0,r=h,h=h.children[0]);}return this},r.prototype.toBBox=function(t){return t},r.prototype.compareMinX=function(t,i){return t.minX-i.minX},r.prototype.compareMinY=function(t,i){return t.minY-i.minY},r.prototype.toJSON=function(){return this.data},r.prototype.fromJSON=function(t){return this.data=t,this},r.prototype._all=function(t,i){for(var n=[];t;)t.leaf?i.push.apply(i,t.children):n.push.apply(n,t.children),t=n.pop();return i},r.prototype._build=function(t,i,n,r){var e,h=n-i+1,o=this._maxEntries;if(h<=o)return a(e=p(t.slice(i,n+1)),this.toBBox),e;r||(r=Math.ceil(Math.log(h)/Math.log(o)),o=Math.ceil(h/Math.pow(o,r-1))),(e=p([])).leaf=!1,e.height=r;var s=Math.ceil(h/o),l=s*Math.ceil(Math.sqrt(o));d(t,i,n,l,this.compareMinX);for(var f=i;f<=n;f+=l){var u=Math.min(f+l-1,n);d(t,f,u,s,this.compareMinY);for(var m=f;m<=u;m+=s){var c=Math.min(m+s-1,u);e.children.push(this._build(t,m,c,r-1));}}return a(e,this.toBBox),e},r.prototype._chooseSubtree=function(t,i,n,r){for(;r.push(i),!i.leaf&&r.length-1!==n;){for(var e=1/0,a=1/0,h=void 0,o=0;o<i.children.length;o++){var s=i.children[o],l=f(s),u=(m=t,c=s,(Math.max(c.maxX,m.maxX)-Math.min(c.minX,m.minX))*(Math.max(c.maxY,m.maxY)-Math.min(c.minY,m.minY))-l);u<a?(a=u,e=l<e?l:e,h=s):u===a&&l<e&&(e=l,h=s);}i=h||i.children[0];}var m,c;return i},r.prototype._insert=function(t,i,n){var r=n?t:this.toBBox(t),e=[],a=this._chooseSubtree(r,this.data,i,e);for(a.children.push(t),o(a,r);i>=0&&e[i].children.length>this._maxEntries;)this._split(e,i),i--;this._adjustParentBBoxes(r,e,i);},r.prototype._split=function(t,i){var n=t[i],r=n.children.length,e=this._minEntries;this._chooseSplitAxis(n,e,r);var h=this._chooseSplitIndex(n,e,r),o=p(n.children.splice(h,n.children.length-h));o.height=n.height,o.leaf=n.leaf,a(n,this.toBBox),a(o,this.toBBox),i?t[i-1].children.push(o):this._splitRoot(n,o);},r.prototype._splitRoot=function(t,i){this.data=p([t,i]),this.data.height=t.height+1,this.data.leaf=!1,a(this.data,this.toBBox);},r.prototype._chooseSplitIndex=function(t,i,n){for(var r,e,a,o,s,l,u,m=1/0,c=1/0,p=i;p<=n-i;p++){var d=h(t,0,p,this.toBBox),x=h(t,p,n,this.toBBox),v=(e=d,a=x,o=void 0,s=void 0,l=void 0,u=void 0,o=Math.max(e.minX,a.minX),s=Math.max(e.minY,a.minY),l=Math.min(e.maxX,a.maxX),u=Math.min(e.maxY,a.maxY),Math.max(0,l-o)*Math.max(0,u-s)),M=f(d)+f(x);v<m?(m=v,r=p,c=M<c?M:c):v===m&&M<c&&(c=M,r=p);}return r},r.prototype._chooseSplitAxis=function(t,i,n){var r=t.leaf?this.compareMinX:s,e=t.leaf?this.compareMinY:l;this._allDistMargin(t,i,n,r)<this._allDistMargin(t,i,n,e)&&t.children.sort(r);},r.prototype._allDistMargin=function(t,i,n,r){t.children.sort(r);for(var e=this.toBBox,a=h(t,0,i,e),s=h(t,n-i,n,e),l=u(a)+u(s),f=i;f<n-i;f++){var m=t.children[f];o(a,t.leaf?e(m):m),l+=u(a);}for(var c=n-i-1;c>=i;c--){var p=t.children[c];o(s,t.leaf?e(p):p),l+=u(s);}return l},r.prototype._adjustParentBBoxes=function(t,i,n){for(var r=n;r>=0;r--)o(i[r],t);},r.prototype._condense=function(t){for(var i=t.length-1,n=void 0;i>=0;i--)0===t[i].children.length?i>0?(n=t[i-1].children).splice(n.indexOf(t[i]),1):this.clear():a(t[i],this.toBBox);},r});
    });

    var tinyqueue = TinyQueue;
    var default_1 = TinyQueue;

    function TinyQueue(data, compare) {
        if (!(this instanceof TinyQueue)) return new TinyQueue(data, compare);

        this.data = data || [];
        this.length = this.data.length;
        this.compare = compare || defaultCompare;

        if (this.length > 0) {
            for (var i = (this.length >> 1) - 1; i >= 0; i--) this._down(i);
        }
    }

    function defaultCompare(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    TinyQueue.prototype = {

        push: function (item) {
            this.data.push(item);
            this.length++;
            this._up(this.length - 1);
        },

        pop: function () {
            if (this.length === 0) return undefined;

            var top = this.data[0];
            this.length--;

            if (this.length > 0) {
                this.data[0] = this.data[this.length];
                this._down(0);
            }
            this.data.pop();

            return top;
        },

        peek: function () {
            return this.data[0];
        },

        _up: function (pos) {
            var data = this.data;
            var compare = this.compare;
            var item = data[pos];

            while (pos > 0) {
                var parent = (pos - 1) >> 1;
                var current = data[parent];
                if (compare(item, current) >= 0) break;
                data[pos] = current;
                pos = parent;
            }

            data[pos] = item;
        },

        _down: function (pos) {
            var data = this.data;
            var compare = this.compare;
            var halfLength = this.length >> 1;
            var item = data[pos];

            while (pos < halfLength) {
                var left = (pos << 1) + 1;
                var right = left + 1;
                var best = data[left];

                if (right < this.length && compare(data[right], best) < 0) {
                    left = right;
                    best = data[right];
                }
                if (compare(best, item) >= 0) break;

                data[pos] = best;
                pos = left;
            }

            data[pos] = item;
        }
    };
    tinyqueue.default = default_1;

    var rbushKnn = knn;
    var default_1$1 = knn;

    function knn(tree, x, y, n, predicate, maxDistance) {
        var node = tree.data,
            result = [],
            toBBox = tree.toBBox,
            i, child, dist, candidate;

        var queue = new tinyqueue(null, compareDist);

        while (node) {
            for (i = 0; i < node.children.length; i++) {
                child = node.children[i];
                dist = boxDist(x, y, node.leaf ? toBBox(child) : child);
                if (!maxDistance || dist <= maxDistance) {
                    queue.push({
                        node: child,
                        isItem: node.leaf,
                        dist: dist
                    });
                }
            }

            while (queue.length && queue.peek().isItem) {
                candidate = queue.pop().node;
                if (!predicate || predicate(candidate))
                    result.push(candidate);
                if (n && result.length === n) return result;
            }

            node = queue.pop();
            if (node) node = node.node;
        }

        return result;
    }

    function compareDist(a, b) {
        return a.dist - b.dist;
    }

    function boxDist(x, y, box) {
        var dx = axisDist(x, box.minX, box.maxX),
            dy = axisDist(y, box.minY, box.maxY);
        return dx * dx + dy * dy;
    }

    function axisDist(k, min, max) {
        return k < min ? min - k : k <= max ? 0 : k - max;
    }
    rbushKnn.default = default_1$1;

    var numberEpsilon = 'EPSILON' in Number ? Number.EPSILON : 2.220446049250313e-16;

    var floatEqual = function (a, b) {
    	return Math.abs(a - b) < numberEpsilon;
    };

    // # Vector2
    // An object representing a 2D vector.
    // Based on the [Vector2 class from LibGDX.](http://libgdx.badlogicgames.com/nightlies/docs/api/com/badlogic/gdx/math/Vector2.html)

    // Written by [Rahat Ahmed](http://rahatah.me/d).

    // ## Vector2(Vector2)
    // ## Vector2(x, y)
    // Constructor for Vector2.
    function Vector2(x, y) {
    	this.set(x, y);
    }

    // ## add(Vector2)
    // ## add(x, y)
    // Adds given values to this vector.
    // Returns this vector for chaining.
    Vector2.prototype.add = function(x, y) {
    	if(x instanceof Vector2)
    	{
    		this.x += x.x;
    		this.y += x.y;
    	}
    	else
    	{
    		this.x += x || 0;
    		this.y += y || 0;
    	}
    	return this;
    };

    // ## angle
    // ### angle()
    // Returns the angle in radians of this vector
    // relative to the x-axis (counter-clockwise)
    // in the range 0 to 2 * PI.
    // ### angle(radians)
    // Rotates this vector to the given angle in radians.
    // Returns this vector for chaining.
    Vector2.prototype.angle = function(rad) {
    	if(rad !== undefined)
    		return this.set(this.length(), 0).rotate(rad);
    	var angle = Math.atan2(this.y, this.x);
    	if(angle < 0) angle += Math.PI*2;
    	return angle;
    };

    // ## angleDeg
    // ### angleDeg()
    // Same as angle() but in degrees.
    // ### angleDeg(degrees)
    // Same as angle(radians) but in degrees.
    Vector2.prototype.angleDeg = function(deg) {
    	if(deg !== undefined)
    		return this.angle(deg / 180 * Math.PI);
    	return this.angle() * 180 / Math.PI;
    };

    // ## clone()
    // ## copy()
    // Returns a new identical Vector2.
    Vector2.prototype.clone = Vector2.prototype.copy = function() {
    	return new Vector2(this.x, this.y);
    };

    // ## cross(Vector2)
    // ## cross(x, y)
    // Returns the cross product of this vector and another.
    Vector2.prototype.cross = function(x, y) {
    	if(x instanceof Vector2)
    		return this.x * x.y - this.y * x.x;
    	return this.x * y - this.y * x;
    };

    // ## distance(Vector2)
    // ## distance(x, y)
    // Returns the distance between this vector and another.
    Vector2.prototype.distance = function(x, y) {
    	var distSq = this.distanceSq(x, y);
    	if(distSq === undefined)
    		return undefined;
    	return Math.sqrt(distSq);
    };

    // ## distanceSq(Vector2)
    // ## distanceSq(x, y)
    // Returns the distance squared of this vector and another.
    Vector2.prototype.distanceSq = function(x, y) {
    	var dx, dy;
    	if(x instanceof Vector2)
    	{
    		dx = x.x - this.x;
    		dy = x.y - this.y;
    	}
    	else if(y !== undefined)
    	{
    		dx = x - this.x;
    		dy = y - this.y;
    	}
    	else
    		return undefined;
    	return dx * dx + dy * dy;
    };

    // ## dot(Vector2)
    // ## dot(x, y)
    // Returns the dot product of this vector and another.
    Vector2.prototype.dot = function(x, y) {
    	if(x instanceof Vector2)
    		return this.x * x.x + this.y * x.y;
    	return this.x * x + this.y * y;
    };

    // ## equals
    // ### equals(Vector2)
    // Returns true if this and another vector2 are equal.
    // ### equals(Vector2, epsilon)
    // Returns true if this and another vector2 are equal within an epsilon.
    // ### equals(x, y)
    // Returns true if this vector equals given x, y components.
    // ### equals(x, y, epsilon)
    // Returns true if this vector equals given x, y components within an epsilon.
    Vector2.prototype.equals = function(x, y, epsilon) {
    	
    	if(x instanceof Vector2)
    	{
    		y = y || 0;
    		return Math.abs(this.x - x.x) <= y && Math.abs(this.y - x.y) <= y;
    	}
    	else if(y !== undefined)
    	{
    		epsilon = epsilon || 0;
    		return Math.abs(this.x - x) <= epsilon && Math.abs(this.y - y) <= epsilon;
    	}
    	else
    		return false;
    };

    // ## length()
    // Returns the length of this vector.
    Vector2.prototype.length = function() {
    	return Math.sqrt(this.lengthSq());
    };

    // ## lengthSq()
    // Returns the length squared of this vector.
    Vector2.prototype.lengthSq = function() {
    	return this.x * this.x + this.y * this.y;
    };

    // ## negate()
    // Negates this vector. (Multiplies x and y by -1).
    // Returns this vector for chaining.
    Vector2.prototype.negate = function() {
    	return this.scale(-1);
    };

    // ##normalize()
    // Normalizes this vector.
    // Returns this vector for chaining.
    Vector2.prototype.normalize = function() {
    	return this.scale(1/this.length());
    };

    // ## rotate(radians)
    // Rotates this vector by an angle in degrees counter-clockwise.
    // Returns this vector for chaining.
    Vector2.prototype.rotate = function(rad) {
    	var cos = Math.cos(rad);
    	var sin = Math.sin(rad);
    	return this.set(this.x * cos - this.y * sin,
    			this.x * sin + this.y * cos);
    };

    // ## rotateDeg(degrees)
    // Same as rotate but in degrees.
    Vector2.prototype.rotateDeg = function(deg) {
    	return this.rotate(deg / 180 * Math.PI)
    };

    // ## scale(scale)
    // ## scale(scaleX, scaleY)
    // Scales this vector by a scalar.
    // Second argument to scale y separate from x is optional.
    // Returns this vector for chaining.
    Vector2.prototype.scale = function(scaleX, scaleY) {
    	this.x *= scaleX;
    	this.y *= (scaleY || scaleX);
    	return this;
    };

    // ## set(Vector2)
    // ## set(x, y)
    // Sets this vector to the given values.
    // Returns this vector for chaining.
    Vector2.prototype.set = function(x, y) {
    	if(x instanceof Vector2)
    	{
    		this.x = x.x;
    		this.y = x.y;
    	}
    	else
    	{
    		this.x = x || 0;
    		this.y = y || 0;
    	}
    	return this;
    };

    // ## setPolar(radians, length)
    // Set this vector by angle in degrees and magnitude.
    // Returns this vector for chaining.
    Vector2.prototype.setPolar = function(rad, length) {
    	return this.set(length, 0).rotate(rad);
    };

    // ## setPolarDeg(degrees, length)
    // Same as setPolar but in degrees.
    Vector2.prototype.setPolarDeg = function(deg, length) {
    	return this.setPolar(deg / 180 * Math.PI, length);
    };

    // ## sub(Vector2)
    // ## sub(x, y)
    // Same as add, but subtracting.
    // Returns this vector for chaining.
    Vector2.prototype.sub = function(x, y) {
    	if(y !== undefined)
    	{
    		this.x -= x;
    		this.y -= y;
    	}
    	else
    	{
    		this.x -= x.x;
    		this.y -= x.y;
    	}
    	return this;
    };

    // ## toString()
    // Returns a string representation of this vector.
    Vector2.prototype.toString = function() {
    	return "(" + this.x + ", " + this.y + ")";
    };

    var vector2Node = Vector2;

    var fastList = createCommonjsModule(function (module, exports) {
    (function() { // closure for web browsers

    function Item (data, prev, next) {
      this.next = next;
      if (next) next.prev = this;
      this.prev = prev;
      if (prev) prev.next = this;
      this.data = data;
    }

    function FastList () {
      if (!(this instanceof FastList)) return new FastList
      this._head = null;
      this._tail = null;
      this.length = 0;
    }

    FastList.prototype =
    { push: function (data) {
        this._tail = new Item(data, this._tail, null);
        if (!this._head) this._head = this._tail;
        this.length ++;
      }

    , pop: function () {
        if (this.length === 0) return undefined
        var t = this._tail;
        this._tail = t.prev;
        if (t.prev) {
          t.prev = this._tail.next = null;
        }
        this.length --;
        if (this.length === 1) this._head = this._tail;
        else if (this.length === 0) this._head = this._tail = null;
        return t.data
      }

    , unshift: function (data) {
        this._head = new Item(data, null, this._head);
        if (!this._tail) this._tail = this._head;
        this.length ++;
      }

    , shift: function () {
        if (this.length === 0) return undefined
        var h = this._head;
        this._head = h.next;
        if (h.next) {
          h.next = this._head.prev = null;
        }
        this.length --;
        if (this.length === 1) this._tail = this._head;
        else if (this.length === 0) this._head = this._tail = null;
        return h.data
      }

    , item: function (n) {
        if (n < 0) n = this.length + n;
        var h = this._head;
        while (n-- > 0 && h) h = h.next;
        return h ? h.data : undefined
      }

    , slice: function (n, m) {
        if (!n) n = 0;
        if (!m) m = this.length;
        if (m < 0) m = this.length + m;
        if (n < 0) n = this.length + n;

        if (m === n) {
          return []
        }

        if (m < n) {
          throw new Error("invalid offset: "+n+","+m+" (length="+this.length+")")
        }

        var len = m - n
          , ret = new Array(len)
          , i = 0
          , h = this._head;
        while (n-- > 0 && h) h = h.next;
        while (i < len && h) {
          ret[i++] = h.data;
          h = h.next;
        }
        return ret
      }

    , drop: function () {
        FastList.call(this);
      }

    , forEach: function (fn, thisp) {
        var p = this._head
          , i = 0
          , len = this.length;
        while (i < len && p) {
          fn.call(thisp || this, p.data, i, this);
          p = p.next;
          i ++;
        }
      }

    , map: function (fn, thisp) {
        var n = new FastList();
        this.forEach(function (v, i, me) {
          n.push(fn.call(thisp || me, v, i, me));
        });
        return n
      }

    , filter: function (fn, thisp) {
        var n = new FastList();
        this.forEach(function (v, i, me) {
          if (fn.call(thisp || me, v, i, me)) n.push(v);
        });
        return n
      }

    , reduce: function (fn, val, thisp) {
        var i = 0
          , p = this._head
          , len = this.length;
        if (!val) {
          i = 1;
          val = p && p.data;
          p = p && p.next;
        }
        while (i < len && p) {
          val = fn.call(thisp || this, val, p.data, this);
          i ++;
          p = p.next;
        }
        return val
      }
    };

    module.exports = FastList;

    })();
    });

    class FList extends fastList {
        // eslint-disable-next-line no-useless-constructor
        constructor() {
            super();
        }

        every(fn, thisp) {
            let prev;
            let p = this._head;
            let i = 0;
            const len = this.length;
            let d = true;
            while (i < len && p && d) {
                d = fn.call(thisp || this, p.data, prev, i, this);
                prev = p.data;
                p = p.next;
                i += 1;
            }
        }

        getHead() {
            if (this._head) {
                return this._head.data;
            }
            // eslint-disable-next-line consistent-return
            return undefined;
        }

        getTail() {
            if (this._tail) {
                return this._tail.data;
            }
            // eslint-disable-next-line consistent-return
            return undefined;
        }
    }

    const PI2 = Math.PI * 2.0;

    const randomInteger = (min, max) => {
        let rand = min + Math.random() * (max + 1 - min);
        rand = Math.floor(rand);
        return rand;
    };

    const toInt = value => value | 0;

    const rotatePoint = (pivotX, pivotY, pointX, pointY, sin, cos) => {
        const deltaX = pointX - pivotX;
        const deltaY = pointY - pivotY;
        // Rotate clockwise, angle in radians
        return {
            x: toInt(cos * deltaX - sin * deltaY + pivotX),
            y: toInt(sin * deltaX + cos * deltaY + pivotY)
        };
    };

    const randomInCircle = (x, y, radius, pointSize) => {
        const t = PI2 * Math.random();
        const u = Math.random() + Math.random();
        const r = u > 1 ? 2 - u : u;
        const s = r * (radius - 0.5 * pointSize);
        return {
            x: Math.trunc(Math.cos(t) * s + x),
            y: Math.trunc(Math.sin(t) * s + y)
        };
    };

    const lerp = (a1, a2, t) => a1 + (a2 - a1) * t;

    const signedDeltaAngle = (to, from) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

    const oscillate = (vMin, vMax, t) => {
        const halfRange = ((vMax - vMin) / vMax) * 0.5;
        return (Math.sin(t) * halfRange + (1.0 - halfRange)) * vMax;
    };

    const limit = (value, minVal, maxVal) => Math.max(minVal, Math.min(maxVal, value));

    const wrap = (value, min, max) => {
        const range = max - min;
        return min + ((((value - min) % range) + range) % range);
    };

    const wrapAngle = angle => wrap(angle, -Math.PI, Math.PI);

    const shortestBetween = (angle1, angle2) => {
        const a1 = wrapAngle(angle1);
        const a2 = wrapAngle(angle2);
        const difference = a2 - a1;

        if (difference === 0) {
            return 0;
        }
        const times = Math.floor((difference - -Math.PI) / PI2);
        return difference - times * PI2;
    };

    const PI2$1 = 2.0 * Math.PI;

    function normalizeAngle(angle) {
        const a = angle % PI2$1;
        return a < 0 ? a + PI2$1 : a;
    }

    const { sqrt: sqrt$1 } = Math;

    const intersectCircleLine = (cx, cy, cr, x1, y1, x2, y2) => {
        const points = [];
        const a = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
        const b = 2.0 * ((x2 - x1) * (x1 - cx) + (y2 - y1) * (y1 - cy));
        const cc = cx * cx + cy * cy + x1 * x1 + y1 * y1 - 2 * (cx * x1 + cy * y1) - cr * cr;
        const deter = b * b - 4.0 * a * cc;

        if (deter > 0) {
            const e = sqrt$1(deter);
            const u1 = (-b + e) / (2 * a);
            const u2 = (-b - e) / (2 * a);
            if (u1 >= 0 && u1 <= 1) {
                points.push({
                    x: lerp(x1, x2, u1),
                    y: lerp(y1, y2, u1)
                });
            }
            if (u2 >= 0 && u2 <= 1) {
                points.push({
                    x: lerp(x1, x2, u2),
                    y: lerp(y1, y2, u2)
                });
            }
        }

        return points;
    };

    const intersectCircleRectangle = (cx, cy, cr, x, y, x2, y2) => {
        const top = intersectCircleLine(cx, cy, cr, x, y, x2, y);
        const right = intersectCircleLine(cx, cy, cr, x2, y, x2, y2);
        const bottom = intersectCircleLine(cx, cy, cr, x2, y2, x, y2);
        const left = intersectCircleLine(cx, cy, cr, x, y2, x, y);
        const result = [];
        const pow2r = cr * cr;
        const dx = x - cx;
        const dy = y - cy;
        const dx2 = x2 - cx;
        const dy2 = y2 - cy;
        const pow2x = dx * dx;
        const pow2y = dy * dy;
        const pow2x2 = dx2 * dx2;
        const pow2y2 = dy2 * dy2;
        if (top.length > 0) {
            if (top.length === 2) {
                if (top[0].x > top[1].x) result.push(top[1], top[0]);
                else result.push(top[0], top[1]);
            } else result.push(top[0]);
        }
        if (pow2x2 + pow2y < pow2r) {
            result.push({
                x: x2,
                y
            });
        }

        if (right.length > 0) {
            if (right.length === 2) {
                if (right[0].y > right[1].y) result.push(right[1], right[0]);
                else result.push(right[0], right[1]);
            } else result.push(right[0]);
        }
        if (pow2x2 + pow2y2 < pow2r) {
            result.push({
                x: x2,
                y: y2
            });
        }

        if (bottom.length > 0) {
            if (bottom.length === 2) {
                if (bottom[0].x < bottom[1].x) result.push(bottom[1], bottom[0]);
                else result.push(bottom[0], bottom[1]);
            } else result.push(bottom[0]);
        }
        if (pow2x + pow2y2 < pow2r) {
            result.push({
                x,
                y: y2
            });
        }

        if (left.length > 0) {
            if (left.length === 2) {
                if (left[0].y < left[1].y) result.push(left[1], left[0]);
                else result.push(left[0], left[1]);
            } else result.push(left[0]);
        }
        if (pow2x + pow2y < pow2r) {
            result.push({
                x,
                y
            });
        }

        return result;
    };
    // Направление луча должно быть нормализованнно;
    const intersectCircleRay = (ox, oy, dx, dy, cx, cy, cr) => {
        const result = {
            type: 0,
            isec: []
        };
        const hx = cx - ox;
        const hy = cy - oy;
        const lf = dx * hx + dy * hy;
        let s = cr * cr - (hx * hx + hy * hy) + lf * lf;
        if (s < 0.0) return result;
        s = Math.sqrt(s);
        if (lf < s) {
            if (floatEqual(s, 0)) {
                result.type = 1;
                result.isec.push({
                    x: dx * lf + ox,
                    y: dy * lf + oy
                });
                return result;
            }
            if (lf + s >= 0) {
                s = -s;
                result.type = 2;
                const p1 = lf - s;
                result.isec.push({
                    x: dx * p1 + ox,
                    y: dy * p1 + oy
                });
                return result;
            }
            return result;
        }
        result.type = 3;
        const p1 = lf - s;
        const p2 = lf + s;
        result.isec.push(
            {
                x: dx * p1 + ox,
                y: dy * p1 + oy
            },
            {
                x: dx * p2 + ox,
                y: dy * p2 + oy
            }
        );
        return result;
    };

    class Food {
        constructor(gameMap, options) {
            this.gameMap = gameMap;
            this.x = +(options.x || 0);
            this.y = +(options.y || 0);
            this.width = options.size || options.width || 0;
            this.height = options.size || options.height || 0;
            if (!this.width || !this.height) {
                throw new Error('element size can not be undefined');
            }
            this.lightDirection = true;
            this.lightSpeed = options.lightSpeed;
            this.point = options.point;
            this.lightSize = this.width / 2;
            this.minX = this.x - this.width;
            this.minY = this.y - this.width;
            this.maxX = this.x + this.width;
            this.maxY = this.y + this.width;
            this.delta = Math.random() * 0.5 * Math.PI;
        }

        render(dt) {
            this.delta += this.lightSpeed * dt;
            this.lightSize = oscillate(0.5 * this.width, this.width, this.delta);
            const paintX = this.gameMap.view.relativeX(this.x);
            const paintY = this.gameMap.view.relativeY(this.y);
            const paintWidth = this.gameMap.view.relativeW(this.width);

            // draw light
            this.gameMap.ctx.fillStyle = `hsla(${oscillate(180, 360, this.delta * 0.5)}, ${oscillate(
            80,
            100,
            this.delta * 0.4
        )}%, 50%, 0.2)`;
            this.gameMap.ctx.beginPath();
            this.gameMap.ctx.arc(
                paintX,
                paintY,
                (this.lightSize * paintWidth) / this.width,
                0,
                Math.PI * 2
            );
            this.gameMap.ctx.fill();
            this.gameMap.ctx.fillStyle = `hsl(${oscillate(180, 360, this.delta * 0.5)}, ${oscillate(
            80,
            100,
            this.delta * 0.4
        )}%, 50%)`;
            // this.gameMap.ctx.shadowColor = `hsl(${this.step}, 100%, 50%)`;
            // this.gameMap.ctx.shadowBlur = (this.lightSize * paintWidth) / this.width;
            this.gameMap.ctx.beginPath();
            this.gameMap.ctx.arc(paintX, paintY, 0.5 * paintWidth, 0, Math.PI * 2);
            this.gameMap.ctx.fill();
        }
    }

    class Movement {
        constructor(x, y, vx, vy, speed, angle, width, idx, snake) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.speed = speed;
            this.angle = angle;
            this.sin = Math.sin(angle);
            this.cos = Math.cos(angle);
            this.nextAngle = angle;
            this.poly = {};
            this.aabb = {};
            this.aabb.parent = this;
            this.snake = snake;
            this.aabb.snakeIdx = snake.idx;
            this.setIdx(idx);
            this.calcPoly(width);
            this.isHead = false;
            this.isTail = false;
        }

        setNext(x, y, angle) {
            this.nextX = x;
            this.nextY = y;
            this.nextAngle = angle;
            this.nextSin = Math.sin(angle);
            this.nextCos = Math.cos(angle);
            this.calcPoly(this.width * 0.5);
        }

        setXY(x, y) {
            this.x = x;
            this.y = y;
            this.calcPoly(this.width * 0.5);
        }

        calcRotates(halfWidth) {
            const rotateRight = rotatePoint(
                this.x,
                this.y,
                this.x,
                this.y + halfWidth,
                this.sin,
                this.cos
            );
            const rotateLeft = rotatePoint(
                this.x,
                this.y,
                this.x,
                this.y - halfWidth,
                this.sin,
                this.cos
            );
            const nextRotateRight = rotatePoint(
                this.nextX,
                this.nextY,
                this.nextX,
                this.nextY + halfWidth,
                this.nextSin,
                this.nextCos
            );
            const nextRotateLeft = rotatePoint(
                this.nextX,
                this.nextY,
                this.nextX,
                this.nextY - halfWidth,
                this.nextSin,
                this.nextCos
            );
            return {
                rotateLeft,
                rotateRight,
                nextRotateLeft,
                nextRotateRight
            };
        }

        setIdx(idx) {
            this.aabb.idx = idx;
        }

        calcPoly(width) {
            const rotates = this.calcRotates(0.5 * width);
            this.poly.l0X = rotates.nextRotateLeft.x;
            this.poly.l0Y = rotates.nextRotateLeft.y;
            this.poly.r0X = rotates.nextRotateRight.x;
            this.poly.r0Y = rotates.nextRotateRight.y;
            this.poly.l1X = rotates.rotateLeft.x;
            this.poly.l1Y = rotates.rotateLeft.y;
            this.poly.r1X = rotates.rotateRight.x;
            this.poly.r1Y = rotates.rotateRight.y;
            this.width = width;
        }

        getPoly(width) {
            if (!floatEqual(width, this.width)) this.calcPoly(width);
            return this.poly;
        }

        setAABB(shadowWidth) {
            const rotates = this.calcRotates(0.5 * shadowWidth);
            this.aabb.minX = Math.min(
                rotates.rotateRight.x,
                rotates.rotateLeft.x,
                rotates.nextRotateLeft.x,
                rotates.nextRotateRight.x
            );
            this.aabb.minY = Math.min(
                rotates.rotateRight.y,
                rotates.rotateLeft.y,
                rotates.nextRotateLeft.y,
                rotates.nextRotateRight.y
            );
            this.aabb.maxX = Math.max(
                rotates.rotateRight.x,
                rotates.rotateLeft.x,
                rotates.nextRotateLeft.x,
                rotates.nextRotateRight.x
            );
            this.aabb.maxY = Math.max(
                rotates.rotateRight.y,
                rotates.rotateLeft.y,
                rotates.nextRotateLeft.y,
                rotates.nextRotateRight.y
            );
        }

        getAABB() {
            return this.aabb;
        }

        destroy() {
            this.poly = undefined;
            this.aabb.parent = undefined;
            this.aabb = undefined;
        }
    }

    function angleFromOrig(x, y) {
        return Math.atan2(y, x);
    }

    // import rbush from 'rbush';

    const { log } = console;

    class Snake {
        constructor(gameMap, options) {
            this.gameMap = gameMap; // ссылка на игру
            this.x = +(options.x || 0);
            this.y = +(options.y || 0);
            // eslint-disable-next-line no-multi-assign
            this.minWidth = this.width = +(options.size || options.width || 0);
            // eslint-disable-next-line no-multi-assign
            this.minHeight = this.height = +(options.size || options.height || 0);
            this.shadowSize = this.width + SNAKE_SIZE_STEP;
            this.needResize = false;
            this.point = 0;
            this.isSpeedUp = false;
            this.fillColor = '';
            this.stopped = false;
            this.isActive = options.isAcive || true;
            this.head = {};
            this.head.aabb = {};
            // eslint-disable-next-line no-multi-assign
            this.head.aabb.snakeIdx = this.idx = options.idx;
            this.head.aabb.parent = this.head;
            this.head.snake = this;
            this.head.getPoly = width => this.head.poly;
            this.head.getAABB = () => this.head.aabb;
            this.head.isHead = true;
            this.head.isTail = true;
            this.head.poly = {};
            this.head.width = this.width;
            this.visionAngle = 170;
            this.colliders = this.gameMap.globalColliders;
            this.movementQueue = new FList();
            this.mIdx = 0;
            this.collidersArray = [];
            // eslint-disable-next-line no-multi-assign
            this.speed = this.oldSpeed = MIN_SPEED;
            this.turnSpeed = ANGLE_SPEED;
            this.oldVx = 0;
            this.oldVy = 0;
            this.fillColor = options.fillColor || '#fff';
            // eslint-disable-next-line no-multi-assign
            this.angle = this.toAngle = this.oldAngle = options.angle || 0;
            // eslint-disable-next-line no-multi-assign
            this.length = this.minLength = options.length || 0;
            this.viewLength = 0;
            this.isPlayer = options.isPlayer;
            this.key = options.key;
            this.inQuene = false;
            this.acceleration = 0;
            this.isSpeedUp = false;
            this.distances = [];
            this.vel = 0;
            this.boundsAway = false;
            this.snakesAway = false;
            this.huntEat = false;
            this.isUpdated = false;
            this.boundsVec = [];
            this.updateSize();
            this.vx = Math.cos(this.angle);
            this.vy = Math.sin(this.angle);
            this.calcHead();
        }

        setXY(x, y) {
            this.x = x;
            this.y = y;
            this.calcHead();
        }

        setAngle(angle) {
            this.angle = angle;
            this.toAngle = angle;
            this.oldAngle = angle;
            this.vx = Math.cos(this.angle);
            this.vy = Math.sin(this.angle);
            this.calcHead();
        }

        updateSize(added = 0) {
            this.length += added * 15;
            this.width += added * 0.4;
            this.height += added * 0.4;
            if (this.length <= this.minLength) {
                this.lenth = this.minLength;
                this.width = this.minWidth;
                this.height = this.minHeight;
                this.speedDown();
            }
            if (this.width > this.shadowSize - 0.1 * SNAKE_SIZE_STEP) {
                this.needResize = true;
            }
            this.head.width = this.width;
            const half = 0.5 * this.width * ANGLE_SPEED * 10000;
            const angle1 = angleFromOrig(this.height, -half);
            const angle2 = angleFromOrig(this.height, half);
            this.halfVisionAngle = 0.5 * signedDeltaAngle(angle2, angle1);
            // this.turnSpeed -= added / 100;
            // this.movementQueueLen = Math.ceil(this.length / this.oldSpeed);
        }

        // turn around
        turnAround(dt) {
            const angleDistance = shortestBetween(this.angle, this.toAngle);
            if (floatEqual(angleDistance, 0)) {
                return;
            }
            const sign = Math.sign(angleDistance);
            this.vel += sign * ANGLE_SPEED * dt * this.gameMap.scale;
            // this.vel *= 1.0 - FRICTION;
            // this.toAngle += this.vel * dt;
            if (Math.abs(this.vel) > Math.abs(angleDistance)) {
                this.vel = 0;
                this.angle = this.toAngle;
            } else {
                this.angle += this.vel;
            }
            this.vx = Math.cos(this.angle);
            this.vy = Math.sin(this.angle);
            this.oldAngle = this.toAngle;
        }

        speedUp() {
            if (this.isSpeedUp) {
                return;
            }

            this.isSpeedUp = true;
            this.acceleration = ACCELERATION;
        }

        speedDown() {
            if (!this.isSpeedUp) {
                return;
            }

            this.isSpeedUp = false;
            this.acceleration = -ACCELERATION;
        }

        // eat food
        eat(food) {
            this.point += food.point;
            // add points
            const added = food.point / 200;
            if (!this.isPlayer) this.speedDown();
            this.updateSize(added);
        }

        // snake action
        update(dt) {
            if (this.stopped || floatEqual(this.speed, 0)) {
                return;
            }
            let added = false;
            const oldSpeed = this.speed;
            if (this.isSpeedUp) {
                this.updateSize((-1 * (dt * 0.006)) / 15);
            }
            if (
                (this.isSpeedUp && this.acceleration.speed >= MAX_SPEED) ||
                (!this.isSpeedUp && this.speed <= MIN_SPEED)
            )
                this.acceleration = 0;
            else this.acceleration += Math.sign(this.acceleration) * ACCELERATION * dt;

            this.speed = limit(oldSpeed + this.acceleration * dt, MIN_SPEED, MAX_SPEED);

            const ds = 0.5 * dt * (this.speed + oldSpeed);
            let last = this.movementQueue.getTail();
            if (last && floatEqual(last.angle, this.angle)) {
                this.colliders.remove(last.getAABB());
                last.speed += ds;
                added = true;
            }
            if (!added) {
                last = new Movement(
                    this.x,
                    this.y,
                    this.vx,
                    this.vy,
                    ds,
                    this.angle,
                    this.width,
                    this.mIdx,
                    this
                );
                this.movementQueue.push(last);
                this.mIdx += 1;
            }
            this.viewLength += ds;
            this.turnAround(dt);
            this.x += this.vx * ds;
            this.y += this.vy * ds;
            // avoid moving to outside
            // this.gameMap.limit(this);
            last.setNext(this.x, this.y, this.angle);
            last.setAABB(this.shadowSize);
            this.colliders.insert(last.getAABB());

            if (this.movementQueue.length > 0 && this.viewLength > this.length) {
                let tail;
                while (this.movementQueue.length > 0 && this.viewLength > this.length) {
                    tail = this.movementQueue.shift();
                    this.colliders.remove(tail.getAABB());
                    this.viewLength -= tail.speed;
                }
                const delta = this.length - this.viewLength;
                if (delta > 0) {
                    const ratio = delta / tail.speed;
                    tail.speed = delta;
                    const x = tail.nextX - (tail.nextX - tail.x) * ratio;
                    const y = tail.nextY - (tail.nextY - tail.y) * ratio;
                    tail.setXY(x, y);
                    tail.setAABB(this.shadowSize);
                    this.movementQueue.unshift(tail);
                    this.colliders.insert(tail.getAABB());
                    this.viewLength += tail.speed;
                }
            }
            if (this.needResize && !this.inQuene) {
                this.gameMap.updateQuene.push(this);
                this.inQuene = true;
            }
            if (this.movementQueue.length > 0) {
                this.head.isTail = false;
                const tail = this.movementQueue.getTail();
                tail.isTail = true;
            } else this.head.isTail = true;
            this.colliders.remove(this.head.getAABB());
            this.calcHead();
            this.head.aabb.idx = this.mIdx;
            this.colliders.insert(this.head.getAABB());
        }

        updateAABBs() {
            this.mIdx = 0;
            this.movementQueue.forEach(movement => {
                this.colliders.remove(movement.getAABB());
                movement.setAABB(this.shadowSize);
                movement.setIdx(this.mIdx);
                this.mIdx += 1;
                this.collidersArray.push(movement.getAABB());
            });
            log(`${this.key} resize width ${this.collidersArray.length} colliders`);
            this.colliders.load(this.collidersArray);
            this.collidersArray.length = 0;
            this.head.aabb.idx = this.mIdx;
        }

        calcHead() {
            const rotateLeftTop = rotatePoint(
                this.x,
                this.y,
                this.x + this.height,
                this.y - this.width * 0.5,
                this.vy,
                this.vx
            );
            const rotateRightTop = rotatePoint(
                this.x,
                this.y,
                this.x + this.height,
                this.y + this.width * 0.5,
                this.vy,
                this.vx
            );
            const rotateRightBottom = rotatePoint(
                this.x,
                this.y,
                this.x,
                this.y + this.width * 0.5,
                this.vy,
                this.vx
            );
            const rotateLeftBottom = rotatePoint(
                this.x,
                this.y,
                this.x,
                this.y - this.width * 0.5,
                this.vy,
                this.vx
            );

            const rotateEnd = rotatePoint(
                this.x,
                this.y,
                this.x + this.width,
                this.y,
                this.vy,
                this.vx
            );

            this.head.poly[0] = rotateLeftTop.x;
            this.head.poly[1] = rotateLeftTop.y;
            this.head.poly[2] = rotateRightTop.x;
            this.head.poly[3] = rotateRightTop.y;
            this.head.poly[4] = rotateRightBottom.x;
            this.head.poly[5] = rotateRightBottom.y;
            this.head.poly[6] = rotateLeftBottom.x;
            this.head.poly[7] = rotateLeftBottom.y;
            this.head.nextX = rotateEnd.x;
            this.head.nextY = rotateEnd.y;
            this.head.x = this.x;
            this.head.y = this.y;
            this.head.cX = (this.head.x + this.head.nextX) * 0.5;
            this.head.cY = (this.head.y + this.head.nextY) * 0.5;
            this.head.aabb.minX = Math.min(
                this.head.poly.l0X,
                this.head.poly.l1X,
                this.head.poly.r0X,
                this.head.poly.r1X
            );
            this.head.aabb.minY = Math.min(
                this.head.poly.l0Y,
                this.head.poly.l1Y,
                this.head.poly.r0Y,
                this.head.poly.r1Y
            );
            this.head.aabb.maxX = Math.max(
                this.head.poly.l0X,
                this.head.poly.l1X,
                this.head.poly.r0X,
                this.head.poly.r1X
            );
            this.head.aabb.maxY = Math.max(
                this.head.poly.l0Y,
                this.head.poly.l1Y,
                this.head.poly.r0Y,
                this.head.poly.r1Y
            );
        }
    }

    class SmallMap {
        constructor(gameMap, marginX, mariginY, radius, pixelRatio) {
            this.gameMap = gameMap;
            this.marginX = marginX;
            this.marginY = mariginY;
            this.radius = radius;
            this.pixelRatio = pixelRatio;
            this.image = document.createElement('canvas');

            this.initImage();
        }

        initImage() {
            this.image.width = (this.radius + 2) * 2;
            this.image.height = (this.radius + 2) * 2;
            this.x = this.gameMap.view.width - (this.radius + 2) * 2 - this.marginX;
            this.y = this.gameMap.view.height - (this.radius + 2) * 2 - this.marginY;
            this.mapX = this.x + this.radius + 2;
            this.mapY = this.y + this.radius + 2;
            const ctx = this.image.getContext('2d');

            /* this.smallMapWidth =
                this.gameMap.width > this.gameMap.height
                    ? this.radius
                    : (this.gameMap.width * this.radius) / this.gameMap.height;
            this.smallMapHeight =
                this.gameMap.width > this.gameMap.height
                    ? (this.gameMap.height * this.radius) / this.gameMap.width
                    : this.radius;

            const smallRectX = this.radius - this.smallMapWidth / 2;
             const smallRectY = this.radius - this.smallMapHeight / 2; */

            // draw background
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.radius + 2, this.radius + 2, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#ccc';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.radius + 2, this.radius + 2, this.radius + 1, 0, Math.PI * 2);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#fff';
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.radius + 2, this.radius + 2, this.radius + 1, 0, Math.PI * 2);
            ctx.strokeStyle = '#FF0000';
            ctx.setLineDash([5, 5]);
            ctx.stroke();

            /* draw map
            ctx.fillStyle = '#ccc';
            ctx.fillRect(smallRectX, smallRectY, this.smallMapWidth, this.smallMapHeight); */
            ctx.restore();
        }

        render() {
            // relative ratio
            const ratio = this.radius / this.gameMap.paintRadius;
            const globalRatio = this.radius / this.gameMap.radius;
            const {
                ctx
            } = this.gameMap;

            // area and position of window
            const smallViewX = this.gameMap.view.x * ratio + this.mapX;
            const smallViewY = this.gameMap.view.y * ratio + this.mapY;
            const smallViewW = this.gameMap.view.width * ratio;
            const smallViewH = this.gameMap.view.height * ratio;

            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.drawImage(this.image, this.x, this.y);

            // draw window
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(smallViewX, smallViewY, smallViewW, smallViewH);
            let i = -1;
            // eslint-disable-next-line no-plusplus
            while (++i < this.gameMap.units.length) {
                const unit = this.gameMap.units[i];
                const smallX = unit.x * globalRatio + this.mapX;
                const smallY = unit.y * globalRatio + this.mapY;
                ctx.fillStyle = unit.isPlayer ? '#1E90FF' : '#F00';
                ctx.fillRect(smallX - 1, smallY - 1, 2, 2);
            }

            /* ctx.fillStyle = '#f00';
            ctx.fillRect(smallViewX + smallViewW / 2 - 2, smallViewY + smallViewH / 2 - 2, 4, 4);
            */
            ctx.restore();
        }
    }

    class View {
        constructor({
            gameMap,
            width,
            height,
            x = 0,
            y = 0,
        }) {
            this.width = width;
            this.height = height;
            this.x = x;
            this.y = y;
            this.gameMap = gameMap;
            this.scale = this.gameMap.scale * this.gameMap.pixelRatio;
            this.aabb = {};
            this.gameMap.on('scale_changed', this.updateScale, this);
        }

        updateScale() {
            this.scale = this.gameMap.scale * this.gameMap.pixelRatio;
        }

        trace(obj) {
            // eslint-disable-next-line no-multi-assign
            this.x = this.aabb.minX = obj.x / this.scale - this.width * 0.5;
            // eslint-disable-next-line no-multi-assign
            this.y = this.aabb.minY = obj.y / this.scale - this.height * 0.5;
            this.aabb.minX = this.absoluteW(this.x);
            this.aabb.minY = this.absoluteW(this.y);
            this.aabb.maxX = this.aabb.minX + this.absoluteW(this.width);
            this.aabb.maxY = this.aabb.minY + this.absoluteH(this.height);
        }

        absoluteX(x) {
            return (x + this.x) * this.scale;
        }

        absoluteY(y) {
            return (y + this.y) * this.scale;
        }

        absoluteW(width) {
            return width * this.scale;
        }

        absoluteH(height) {
            return height * this.scale;
        }

        relativeX(x) {
            return x / this.scale - this.x;
        }

        relativeY(y) {
            return y / this.scale - this.y;
        }

        relativeW(width) {
            return width / this.scale;
        }

        relativeH(height) {
            return height / this.scale;
        }
    }

    function getDistanceSq(ax, ay, bx, by) {
        const dx = bx - ax;
        const dy = by - ay;
        return dx * dx + dy * dy;
    }

    function getDistance(ax, ay, bx, by) {
        return Math.sqrt(getDistanceSq(ax, ay, bx, by));
    }

    function dot$1(a0x, a0y, a1x, a1y) {
        return a0x * a1x + a0y * a1y;
    }

    function dirInsideAngle(tx, ty, fx, fy, half) {
        return Math.acos(dot$1(tx, ty, fx, fy)) <= half;
    }

    function clamp(value, minVal, maxVal) {
        return Math.max(minVal, Math.min(maxVal, value));
    }

    function closestPtSegmentSegment(p1x, p1y, q1x, q1y, p2x, p2y, q2x, q2y) {
        const d1x = q1x - p1x;
        const d1y = q1y - p1y;
        const d2x = q2x - p2x;
        const d2y = q2y - p2y;
        const rx = p1x - p2x;
        const ry = p1y - p2y;
        const a = dot$1(d1x, d1y, d1x, d1y);
        const e = dot$1(d2x, d2y, d2x, d2y);
        const f = dot$1(d2x, d2y, rx, ry);
        let s, t;
        if (floatEqual(a, 0.0) && floatEqual(e, 0.0)) {
            return [p1x, p1y, p2x, p2y];
        }
        if (floatEqual(a, 0.0)) {
            s = 0.0;
            t = f / e;
            t = clamp(t, 0.0, 1.0);
        } else {
            const c = dot$1(d1x, d1y, rx, ry);
            if (floatEqual(e, 0.0)) {
                t = 0.0;
                s = clamp(-c / a, 0.0, 1.0);
            } else {
                const b = dot$1(d1x, d1y, d2x, d2y);
                const denom = a * e - b * b;
                if (!floatEqual(denom, 0.0)) {
                    s = clamp((b * f - c * e) / denom, 0.0, 1.0);
                } else s = 0.0;
                const tnom = b * s + f;
                if (tnom < 0.0) {
                    t = 0.0;
                    s = clamp(-c / a, 0.0, 1.0);
                } else if (tnom > e) {
                    t = 1.0;
                    s = clamp((b - c) / a, 0.0, 1.0);
                } else {
                    t = tnom / e;
                }
            }
        }
        return [p1x + d1x * s, p1y + d1y * s, p2x + d2x * t, p2y + d2y * t];
    }

    function reflect(vx, vy, nx, ny) {
        const d = dot$1(vx, vy, nx, ny) * 2.0;
        return [vx - d * nx, vy - d * ny];
    }

    const { log: log$1 } = console;

    const PI_2 = 0.5 * Math.PI;

    const compare = (snake, c) => {
        if (c.snakeIdx === snake.idx) return false;
        const poly = c.parent.getPoly(c.parent.snake.width);
        let dist = getDistance(poly.l0X, poly.l0Y, snake.x, snake.y);
        let vx = (poly.l0X - snake.x) / dist;
        let vy = (poly.l0Y - snake.y) / dist;
        if (!dirInsideAngle(vx, vy, snake.vx, snake.vy, PI_2)) return false;
        dist = getDistance(poly.l1X, poly.l1Y, snake.x, snake.y);
        vx = (poly.l1X - snake.x) / dist;
        vy = (poly.l1Y - snake.y) / dist;
        if (!dirInsideAngle(vx, vy, snake.vx, snake.vy, PI_2)) return false;
        dist = getDistance(poly.r0X, poly.r0Y, snake.x, snake.y);
        vx = (poly.r0X - snake.x) / dist;
        vy = (poly.r0Y - snake.y) / dist;
        if (!dirInsideAngle(vx, vy, snake.vx, snake.vy, PI_2)) return false;
        dist = getDistance(poly.r1X, poly.r1Y, snake.x, snake.y);
        vx = (poly.r1X - snake.x) / dist;
        vy = (poly.r1Y - snake.y) / dist;
        if (!dirInsideAngle(vx, vy, snake.vx, snake.vy, PI_2)) return false;
        return true;
    };
    const compare1 = (snake, c) => {
        const dist = getDistance(c.x, c.y, snake.x, snake.y);
        const vx = (c.x - snake.x) / dist;
        const vy = (c.y - snake.y) / dist;
        const extAngle = Math.asin((0.5 * c.width) / dist);
        return dirInsideAngle(vx, vy, snake.vx, snake.vy, snake.halfVisionAngle + extAngle);
    };

    // Map class
    class GameMap extends eventemitter3 {
        constructor({
            playerID = 'player',
            canvas = document.createElement('canvas'),
            vWidth = window.innerWidth,
            vHeight = window.innerHeight,
            scale = 1,
            x = 0,
            y = 0,
            radius = MAP_RADIUS,
            drawDebug = DRAW_DEBUG,
            pixelRatio = 1
        }) {
            super();
            this.canvas = canvas;
            this.radius = radius;
            this.pow2R = radius * radius;
            this.x = x;
            this.y = y;
            this.scale = scale;
            this.vWidth = vWidth;
            this.vHeight = vHeight;
            this.canvas.width = vWidth;
            this.canvas.height = vHeight;
            this.ctx = this.canvas.getContext('2d');
            this.drawDebug = drawDebug;
            this.pixelRatio = pixelRatio;
            // this.tileImage = drawPattern(MAP_RECT_WIDTH * 8, MAP_RECT_HEIGHT * 8);
            this.view = new View({
                gameMap: this,
                width: vWidth,
                height: vHeight
            });
            this.smallMap = new SmallMap(this, 30, 30, 50, pixelRatio);
            this.units = [];
            this.playerID = playerID;
            // R-tree для проверки попадания еды в область видимого окна
            this.foods = new rbush_min();
            this.globalColliders = new rbush_min();
            this.updateQuene = new FList();
            this.toScale = this.scale;
            this.numBotsToUpdate = 0;
            this.botUpdateIdx = 0;
            this.foodsOnField = 0;
            this.paintRadius = this.view.relativeW(this.radius);
            this.isScaled = false;
            this.tempVec = new vector2Node();
            this.tempVec1 = new vector2Node();
            this.globalSnakesPool = [];
            this.globalMovementsPool = [];
            this.globalEatsPool = [];
        }

        initUnits(numUnits) {
            let idx = -1;
            // eslint-disable-next-line no-plusplus
            while (++idx < numUnits) {
                let coords = randomInCircle(this.x, this.y, this.radius, 2.0 * SNAKE_IMG_SIZE * 4);
                const isPlayer = idx === numUnits - 1;
                const unit = new Snake(this, {
                    // x: randomInteger(0.5 * 100, MAP_WIDTH - 0.5 * 100),
                    // y: randomInteger(0.5 * 100, MAP_HEIGHT - 0.5 * 100),
                    x: coords.x,
                    y: coords.y,
                    size: SNAKE_IMG_SIZE,
                    length: SNAKE_LENGTH,
                    angle: lerp(0, 2.0 * Math.PI, Math.random()),
                    fillColor: '#00FF00',
                    idx,
                    isPlayer,
                    isActive: true,
                    key: isPlayer ? this.playerID : `unit${idx}`
                });
                while (this.globalColliders.collides(unit.head.getAABB())) {
                    coords = randomInCircle(this.x, this.y, this.radius, 2.0 * SNAKE_IMG_SIZE * 4);
                    unit.setXY(coords.x, coords.y);
                }
                this.units.push(unit);
                this.globalColliders.insert(unit.head.getAABB());
            }
            this.player = this.units[this.units.length - 1];
            this.numBotsToUpdate = Math.ceil(this.units.length / (BOTS_UPDATE_COUNT * 60));
            log$1(`${this.numBotsToUpdate} bots will be updated in one tick`);
        }

        initFoods(numFoods) {
            this.foodsOnField = numFoods;
            for (let i = numFoods; i; i -= 1) {
                const point = randomInteger(1, 10);
                const size = Math.floor(point * 2 + 10);
                const coords = randomInCircle(this.x, this.y, this.radius, size * 2);
                this.foods.insert(
                    new Food(this, {
                        size,
                        point,
                        x: coords.x,
                        y: coords.y,
                        lightSpeed: LIGHT_SPEED
                        // x: randomInteger(size, MAP_WIDTH - size),
                        // y: randomInteger(size, MAP_HEIGHT - size)
                    })
                );
            }
        }

        updateAABBsQuene() {
            let updating = true;
            while (this.updateQuene.length > 0 && updating) {
                const snake = this.updateQuene.shift();
                snake.inQuene = false;
                snake.needResize = snake.width > snake.shadowSize - 0.1 * SNAKE_SIZE_STEP;
                if (snake.isActive && snake.needResize && snake.width > 0.9 * snake.shadowSize) {
                    updating = false;
                    snake.needResize = false;
                    snake.shadowSize += SNAKE_SIZE_STEP;
                    snake.updateAABBs();
                    log$1(
                        `AABBs Quene updated. Quene length: ${this.updateQuene.length}, updated Snake ${
                        snake.idx
                    }`
                    );
                } else {
                    log$1(`Snake ${snake.idx} shift from quene without update`);
                }
            }
        }

        // set scale
        setScale(scale) {
            if (floatEqual(this.scale, scale)) {
                return;
            }

            this.scale = scale < 1 ? 1 : scale;
            this.emit('scale_changed');
            this.paintRadius = this.view.relativeW(this.radius);
        }

        // set toScale for creating animate
        setToScale(scale) {
            this.toScale = scale;
            log$1('toScale set to:', this.toScale);
        }

        clear() {
            this.ctx.clearRect(0, 0, this.view.width, this.view.height);
        }

        update(dt) {
            this.updateAABBsQuene();
            this.checkCollisions();
            let i = -1;
            // eslint-disable-next-line no-plusplus
            while (++i < this.units.length) {
                const snake = this.units[i];
                snake.isUpdated = false;
                snake.update(dt);
                const collider = snake.head.getPoly();
                const colliderArr = [
                    collider.l0X,
                    collider.l0Y,
                    collider.r0X,
                    collider.r0Y,
                    collider.r1X,
                    collider.r1Y,
                    collider.l1X,
                    collider.l1Y
                ];
                snake.boundsAway = false;
                const ls = getDistanceSq(collider.l1X, collider.l1Y, this.x, this.y);
                const rs = getDistanceSq(collider.r1X, collider.r1Y, this.x, this.y);
                if (ls < this.pow2R && rs < this.pow2R) {
                    const toBoundsLeft = intersectCircleRay(
                        collider.l1X,
                        collider.l1Y,
                        snake.vx,
                        snake.vy,
                        this.x,
                        this.y,
                        this.radius
                    );
                    const toBoundsRight = intersectCircleRay(
                        collider.r1X,
                        collider.r1Y,
                        snake.vx,
                        snake.vy,
                        this.x,
                        this.y,
                        this.radius
                    );
                    const distToBoundsR = getDistance(
                        toBoundsRight.isec[0].x,
                        toBoundsRight.isec[0].y,
                        collider.r1X,
                        collider.r1Y
                    );
                    const distToBoundsL = getDistance(
                        toBoundsLeft.isec[0].x,
                        toBoundsLeft.isec[0].y,
                        collider.l1X,
                        collider.l1Y
                    );
                    if (distToBoundsL > distToBoundsR) {
                        snake.boundsVec[0] = collider.r1X;
                        snake.boundsVec[1] = collider.r1Y;
                        snake.boundsVec[2] = toBoundsRight.isec[0].x;
                        snake.boundsVec[3] = toBoundsRight.isec[0].y;
                        snake.distToBounds = distToBoundsR;
                    } else {
                        snake.boundsVec[0] = collider.l1X;
                        snake.boundsVec[1] = collider.l1Y;
                        snake.boundsVec[2] = toBoundsLeft.isec[0].x;
                        snake.boundsVec[3] = toBoundsLeft.isec[0].y;
                        snake.distToBounds = distToBoundsL;
                    }
                    this.tempVec.set(this.x - snake.boundsVec[2], this.y - snake.boundsVec[3]);
                    this.tempVec.normalize();
                    const rotR = (0.5 * snake.speed) / (ANGLE_SPEED * Math.PI);
                    if (snake.distToBounds < rotR && !snake.isPlayer) {
                        const refl = reflect(snake.vx, snake.vy, this.tempVec.x, this.tempVec.y);
                        snake.speedDown();
                        snake.toAngle = Math.atan2(refl[1], refl[0]);
                        snake.boundsAway = true;
                    }
                    const foodsToEat = this.foods.search(snake.head.getAABB());
                    let j = -1;
                    // eslint-disable-next-line no-plusplus
                    while (++j < foodsToEat.length) {
                        if (
                            intersects_14(
                                colliderArr,
                                foodsToEat[j].x,
                                foodsToEat[j].y,
                                foodsToEat[j].width * 0.5
                            )
                        ) {
                            this.foods.remove(foodsToEat[j]);
                            this.units[i].eat(foodsToEat[j]);
                            const point = Math.floor(Math.random() * 30 + 50);
                            const size = Math.floor(point / 3);
                            const coords = randomInCircle(this.x, this.y, this.radius, size * 2);
                            this.foods.insert(
                                new Food(this, {
                                    size,
                                    point,
                                    x: coords.x,
                                    y: coords.y,
                                    lightSpeed: LIGHT_SPEED
                                })
                            );
                        }
                    }
                } else this.kill(snake);
            }
            this.updateBots();
        }

        // eslint-disable-next-line class-methods-use-this
        kill(snake) {
            // log(`${snake.key} killed`);
        }

        // render map
        render(dt) {
            if (!floatEqual(this.scale, this.toScale)) {
                this.setScale(
                    limit(this.scale + 0.005 * dt * (this.toScale > this.scale ? 1 : -1), 1, 2)
                );
            }
            this.view.trace(this.player);
            this.clear();
            this.drawBackup();
            this.drawFoods(dt);
            this.drawSnakes();
            this.smallMap.render();
        }

        drawBackup() {
            const { view, ctx } = this;
            const { aabb } = view;
            const dMinX = aabb.minX - this.x;
            const dMinY = aabb.minY - this.y;
            const dMaxX = aabb.maxX - this.x;
            const dMaxY = aabb.maxY - this.y;
            const pow2MinX = dMinX * dMinX;
            const pow2MinY = dMinY * dMinY;
            const pow2MaxX = dMaxX * dMaxX;
            const pow2MaxY = dMaxY * dMaxY;
            const tl = pow2MinX + pow2MinY;
            const tr = pow2MaxX + pow2MinY;
            const dl = pow2MinX + pow2MaxY;
            const dr = pow2MaxX + pow2MaxY;
            if (Math.max(tl, tr, dl, dr) > this.pow2R) {
                this.drawBounds();
            } else {
                ctx.save();
                ctx.fillStyle = '#FFFFE0';
                ctx.fillRect(0, 0, view.width, view.height);
                ctx.restore();
            }
            ctx.restore();
        }

        checkCollisions() {
            let i = -1;
            // eslint-disable-next-line no-plusplus
            while (++i < this.units.length) {
                this.units[i].isCollided = false;
                const collider = this.units[i].head.getPoly();
                const colliders = this.globalColliders.search(this.units[i].head.getAABB());
                let k = -1;
                // eslint-disable-next-line no-plusplus
                while (++k < colliders.length) {
                    if (colliders[k].snakeIdx !== this.units[i].idx) {
                        const poly = colliders[k].parent.getPoly(colliders[k].parent.width);
                        if (
                            intersects_12(
                                [
                                    collider.l0X,
                                    collider.l0Y,
                                    collider.r0X,
                                    collider.r0Y,
                                    collider.r1X,
                                    collider.r1Y,
                                    collider.l1X,
                                    collider.l1Y
                                ],
                                [
                                    poly.l0X,
                                    poly.l0Y,
                                    poly.r0X,
                                    poly.r0Y,
                                    poly.r1X,
                                    poly.r1Y,
                                    poly.l1X,
                                    poly.l1Y
                                ]
                            )
                        ) {
                            this.units[i].isCollided = true;
                            break;
                        }
                    }
                }
            }
        }

        updateBots() {
            const start = this.botUpdateIdx;
            let i = 0;
            let notComplete = true;
            // eslint-disable-next-line no-plusplus
            while (notComplete) {
                if (this.units[this.botUpdateIdx].isActive) {
                    i += 1;
                    const snake = this.units[this.botUpdateIdx];
                    snake.isUpdated = true;
                    const unitCompare = compare.bind(null, snake);
                    const { cX, cY, x, y } = snake.head;
                    const collider = snake.head.getPoly();
                    if (!snake.boundsAway && !snake.snakesAway) {
                        const foodCompare = compare1.bind(null, snake);
                        const neighbors = rbushKnn(this.foods, cX, cY, 1, foodCompare);
                        if (neighbors.length > 0) {
                            snake.toAngle = Math.atan2(neighbors[0].y - y, neighbors[0].x - x);
                            const dist = getDistanceSq(neighbors[0].x, neighbors[0].y, x, y);
                            if (
                                dist < (600 + snake.width) * (600 + snake.width) &&
                                dist > (150 + snake.width) * (150 + snake.width) &&
                                Math.abs(shortestBetween(snake.angle, snake.toAngle)) < 0.261799
                            )
                                snake.speedUp();
                            else snake.speedDown();
                        }
                    }
                    snake.snakesAway = false;
                    if (snake.distances.length !== 0) snake.distances.length = 0;
                    const r =
                        SNAKE_TO_SNAKE_VISION_DISTANCE * snake.speed +
                        getDistance(cX, cY, collider.l0X, collider.l0Y);
                    const evils = rbushKnn(this.globalColliders, cX, cY, false, unitCompare, r * r);
                    if (evils.length > 0 && !snake.boundsAway) {
                        let k = -1;
                        let vx = 0;
                        let vy = 0;
                        // eslint-disable-next-line no-plusplus
                        while (++k < evils.length) {
                            const poly = evils[k].parent.getPoly(evils[k].parent.snake.width);
                            let [ax, ay, bx, by] = closestPtSegmentSegment(
                                collider.r1X,
                                collider.r1Y,
                                collider.l1X,
                                collider.l1Y,
                                poly.r0X,
                                poly.r0Y,
                                poly.r1X,
                                poly.r1Y
                            );
                            let sqDist = getDistanceSq(ax, ay, bx, by);

                            let check = closestPtSegmentSegment(
                                collider.r1X,
                                collider.r1Y,
                                collider.r0X,
                                collider.r0Y,
                                poly.r0X,
                                poly.r0Y,
                                poly.r1X,
                                poly.r1Y
                            );
                            let d = getDistanceSq(check[0], check[1], check[2], check[3]);
                            if (d < sqDist) {
                                sqDist = d;
                                [ax, ay, bx, by] = check;
                            }
                            check = closestPtSegmentSegment(
                                collider.l1X,
                                collider.l1Y,
                                collider.l0X,
                                collider.l0Y,
                                poly.r0X,
                                poly.r0Y,
                                poly.r1X,
                                poly.r1Y
                            );
                            d = getDistanceSq(check[0], check[1], check[2], check[3]);
                            if (d < sqDist) {
                                sqDist = d;
                                [ax, ay, bx, by] = check;
                            }
                            check = closestPtSegmentSegment(
                                collider.r1X,
                                collider.r1Y,
                                collider.l1X,
                                collider.l1Y,
                                poly.l0X,
                                poly.l0Y,
                                poly.l1X,
                                poly.l1Y
                            );
                            d = getDistanceSq(check[0], check[1], check[2], check[3]);
                            if (d < sqDist) {
                                sqDist = d;
                                [ax, ay, bx, by] = check;
                            }
                            check = closestPtSegmentSegment(
                                collider.r1X,
                                collider.r1Y,
                                collider.r0X,
                                collider.r0Y,
                                poly.l0X,
                                poly.l0Y,
                                poly.l1X,
                                poly.l1Y
                            );
                            d = getDistanceSq(check[0], check[1], check[2], check[3]);
                            if (d < sqDist) {
                                sqDist = d;
                                [ax, ay, bx, by] = check;
                            }
                            check = closestPtSegmentSegment(
                                collider.l1X,
                                collider.l1Y,
                                collider.l0X,
                                collider.l0Y,
                                poly.l0X,
                                poly.l0Y,
                                poly.l1X,
                                poly.l1Y
                            );
                            d = getDistanceSq(check[0], check[1], check[2], check[3]);
                            if (d < sqDist) {
                                sqDist = d;
                                [ax, ay, bx, by] = check;
                            }
                            if (evils[k].parent.isHead) {
                                check = closestPtSegmentSegment(
                                    collider.r1X,
                                    collider.r1Y,
                                    collider.l1X,
                                    collider.l1Y,
                                    poly.l1X,
                                    poly.l1Y,
                                    poly.r1X,
                                    poly.r1Y
                                );
                                d = getDistanceSq(check[0], check[1], check[2], check[3]);
                                if (d < sqDist) {
                                    sqDist = d;
                                    [ax, ay, bx, by] = check;
                                }
                                check = closestPtSegmentSegment(
                                    collider.r1X,
                                    collider.r1Y,
                                    collider.r0X,
                                    collider.r0Y,
                                    poly.l1X,
                                    poly.l1Y,
                                    poly.r1X,
                                    poly.r1Y
                                );
                                d = getDistanceSq(check[0], check[1], check[2], check[3]);
                                if (d < sqDist) {
                                    sqDist = d;
                                    [ax, ay, bx, by] = check;
                                }
                                check = closestPtSegmentSegment(
                                    collider.l1X,
                                    collider.l1Y,
                                    collider.l0X,
                                    collider.l0Y,
                                    poly.l1X,
                                    poly.l1Y,
                                    poly.r1X,
                                    poly.r1Y
                                );
                                d = getDistanceSq(check[0], check[1], check[2], check[3]);
                                if (d < sqDist) {
                                    sqDist = d;
                                    [ax, ay, bx, by] = check;
                                }
                            }
                            if (evils[k].parent.isTail) {
                                check = closestPtSegmentSegment(
                                    collider.r1X,
                                    collider.r1Y,
                                    collider.l1X,
                                    collider.l1Y,
                                    poly.l0X,
                                    poly.l0Y,
                                    poly.r0X,
                                    poly.r0Y
                                );
                                d = getDistanceSq(check[0], check[1], check[2], check[3]);
                                if (d < sqDist) {
                                    sqDist = d;
                                    [ax, ay, bx, by] = check;
                                }
                                check = closestPtSegmentSegment(
                                    collider.r1X,
                                    collider.r1Y,
                                    collider.r0X,
                                    collider.r0Y,
                                    poly.l0X,
                                    poly.l0Y,
                                    poly.r0X,
                                    poly.r0Y
                                );
                                d = getDistanceSq(check[0], check[1], check[2], check[3]);
                                if (d < sqDist) {
                                    sqDist = d;
                                    [ax, ay, bx, by] = check;
                                }
                                check = closestPtSegmentSegment(
                                    collider.l1X,
                                    collider.l1Y,
                                    collider.l0X,
                                    collider.l0Y,
                                    poly.l0X,
                                    poly.l0Y,
                                    poly.r0X,
                                    poly.r0Y
                                );
                                d = getDistanceSq(check[0], check[1], check[2], check[3]);
                                if (d < sqDist) {
                                    sqDist = d;
                                    [ax, ay, bx, by] = check;
                                }
                            }

                            // distance.idx = evils[k].parent.snake.idx;
                            if (sqDist > 0) {
                                snake.distances.push(ax, ay, bx, by);
                                const di = getDistance(snake.x, snake.y, bx, by) * Math.sqrt(sqDist);
                                vx += (snake.x - bx) / di;
                                vy += (snake.y - by) / di;
                            }
                        }
                        if (snake.distances.length > 0) {
                            snake.head.sumDirectionX = (4 * vx) / snake.distances.length;
                            snake.head.sumDirectionY = (4 * vy) / snake.distances.length;
                            const len = getDistance(
                                0,
                                0,
                                snake.head.sumDirectionX,
                                snake.head.sumDirectionY
                            );
                            snake.head.sumDirectionX /= len;
                            snake.head.sumDirectionY /= len;
                            snake.toAngle = Math.atan2(
                                snake.head.sumDirectionY,
                                snake.head.sumDirectionX
                            );
                            snake.speedDown();
                            snake.snakesAway = true;
                        }
                    }
                }
                this.botUpdateIdx = (this.botUpdateIdx + 1) % (this.units.length - 1);
                notComplete = this.botUpdateIdx !== start && i < this.numBotsToUpdate;
            }
        }

        drawBounds() {
            const { ctx, view } = this;
            const arcs = [];
            const x = view.relativeX(this.x);
            const y = view.relativeY(this.y);
            const points = intersectCircleRectangle(
                x,
                y,
                this.paintRadius,
                0,
                0,
                view.width,
                view.height
            );
            if (points.length > 0) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                let i = -1;
                // eslint-disable-next-line no-plusplus
                while (++i < points.length) {
                    const next = points[(i + 1) % points.length];
                    if (!floatEqual(points[i].x, next.x) || !floatEqual(points[i].y, next.y)) {
                        const x1 = points[i].x;
                        const y1 = points[i].y;
                        const x2 = next.x;
                        const y2 = next.y;
                        let angle1 = normalizeAngle(Math.atan2(y1 - y, x1 - x));
                        let angle2 = normalizeAngle(Math.atan2(y2 - y, x2 - x));
                        const mX = (x1 + x2) * 0.5;
                        const mY = (y1 + y2) * 0.5;
                        const dist = signedDeltaAngle(angle2, angle1);
                        if (dist < 0) {
                            const temp = angle1;
                            angle1 = angle2;
                            angle2 = temp;
                        }
                        if (mX > 0 && mX < view.width && mY > 0 && mY < view.height) {
                            ctx.arc(x, y, this.paintRadius, angle1, angle2);
                            arcs.push({
                                angle1,
                                angle2
                            });
                        } else {
                            ctx.lineTo(x2, y2);
                        }
                    }
                }
                ctx.fillStyle = '#FFFFE0';
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                i = -1;
                ctx.save();
                ctx.lineCap = 'square';
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = view.relativeW(10);
                ctx.shadowOffsetY = view.relativeW(SHADOW_OFFSET_Y);
                ctx.shadowOffsetX = view.relativeW(SHADOW_OFFSET_X);
                ctx.shadowBlur = view.relativeW(SHADOW_BLUR);
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.beginPath();
                // eslint-disable-next-line no-plusplus
                while (++i < arcs.length) {
                    ctx.beginPath();
                    ctx.arc(
                        x,
                        y,
                        this.paintRadius + view.relativeW(10) * 0.5,
                        arcs[i].angle1,
                        arcs[i].angle2
                    );
                    ctx.stroke();
                }

                ctx.restore();
                i = -1;
                ctx.save();
                const lineCapLen = view.relativeW(15);
                const lineCapDist = view.relativeW(30);
                ctx.lineCap = 'square';
                ctx.strokeStyle = '#FF0000';
                ctx.lineWidth = view.relativeW(10);

                // if (arcs.length > 1) console.log(JSON.stringify(arcs));
                // eslint-disable-next-line no-plusplus
                while (++i < arcs.length) {
                    ctx.beginPath();
                    ctx.arc(
                        x,
                        y,
                        this.paintRadius + view.relativeW(10) * 0.5,
                        arcs[i].angle1,
                        arcs[i].angle2
                    );
                    const arcLength = this.paintRadius * arcs[i].angle1;
                    const lineCapOff = arcLength;
                    ctx.setLineDash([lineCapLen, lineCapDist]);
                    ctx.lineDashOffset = lineCapOff;
                    ctx.stroke();
                }
                ctx.restore();
            }
        }

        drawFoods(dt) {
            const renderFoods = this.foods.search(this.view.aabb);
            let i = -1;
            this.ctx.save();
            // eslint-disable-next-line no-plusplus
            while (++i < renderFoods.length) {
                renderFoods[i].render(dt);
            }
            this.ctx.restore();
        }

        drawSnakes() {
            const { view, ctx } = this;
            const draws = this.globalColliders.search(view.aabb);
            sort(draws).asc(['snakeIdx', 'idx']);
            let i = 0;
            let j = 0;
            // eslint-disable-next-line no-plusplus
            while (i < draws.length) {
                const snake = draws[i].parent.snake;
                const lastSnakeIdx = snake.idx;
                const width = snake.width;
                const fillColor = snake.fillColor;
                ctx.save();
                ctx.lineCap = 'butt';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = fillColor;
                ctx.lineWidth = view.relativeW(width);
                // this.gameMap.ctx.shadowOffsetX = Math.round(0.4 * 10);
                if (snake.speed !== MIN_SPEED) {
                    const shadowWidth = snake.width * SPEED_SHADOW_BLUR;
                    ctx.shadowBlur = view.relativeW(randomInteger(shadowWidth - 3, shadowWidth + 3));
                    ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
                } else {
                    ctx.shadowColor = 'rgba(0, 0, 0, 0)';
                }
                let dH = false;
                let lastIdx = draws[j].idx;
                ctx.beginPath();
                ctx.moveTo(view.relativeX(draws[j].parent.x), view.relativeY(draws[j].parent.y));
                // eslint-disable-next-line no-plusplus
                while (j < draws.length && draws[j].snakeIdx === lastSnakeIdx) {
                    dH = draws[j].parent.isHead;
                    const idx = draws[j].idx;
                    if (!dH) {
                        if (lastIdx !== idx) {
                            ctx.moveTo(
                                view.relativeX(draws[j].parent.x),
                                view.relativeY(draws[j].parent.y)
                            );
                        }
                        ctx.lineTo(
                            view.relativeX(draws[j].parent.nextX),
                            view.relativeY(draws[j].parent.nextY)
                        );
                    }
                    lastIdx = idx + 1;
                    j += 1;
                }
                ctx.stroke();
                ctx.restore();
                if (dH) this.drawHead(snake);
                i = j;
            }
            if (this.drawDebug) {
                ctx.save();
                ctx.lineWidth = 1;
                i = -1;
                // eslint-disable-next-line no-plusplus
                while (++i < draws.length) {
                    const collider = draws[i].parent.getPoly(draws[i].parent.snake.width);
                    const aabb = draws[i];
                    ctx.strokeStyle = '#000';
                    ctx.beginPath();
                    ctx.moveTo(view.relativeX(collider.l0X), view.relativeY(collider.l0Y));
                    ctx.lineTo(view.relativeX(collider.r0X), view.relativeY(collider.r0Y));
                    ctx.lineTo(view.relativeX(collider.r1X), view.relativeY(collider.r1Y));
                    ctx.lineTo(view.relativeX(collider.l1X), view.relativeY(collider.l1Y));
                    ctx.closePath();
                    ctx.stroke();
                    ctx.strokeStyle = '#FF1493';
                    ctx.beginPath();
                    ctx.moveTo(view.relativeX(aabb.minX), view.relativeY(aabb.minY));
                    ctx.lineTo(view.relativeX(aabb.maxX), view.relativeY(aabb.minY));
                    ctx.lineTo(view.relativeX(aabb.maxX), view.relativeY(aabb.maxY));
                    ctx.lineTo(view.relativeX(aabb.minX), view.relativeY(aabb.maxY));
                    ctx.closePath();
                    ctx.stroke();
                }
                ctx.strokeStyle = 'FF0000';
                ctx.beginPath();
                ctx.moveTo(view.relativeX(view.aabb.minX), view.relativeY(view.aabb.minY));
                ctx.lineTo(view.relativeX(view.aabb.maxX), view.relativeY(view.aabb.minY));
                ctx.lineTo(view.relativeX(view.aabb.maxX), view.relativeY(view.aabb.maxY));
                ctx.lineTo(view.relativeX(view.aabb.minX), view.relativeY(view.aabb.maxY));
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
            }
        }

        drawHead(snake) {
            const { view, ctx } = this;
            ctx.save();
            ctx.translate(view.relativeX(snake.x), view.relativeY(snake.y));
            ctx.rotate(snake.angle);
            ctx.fillStyle = 'blue';
            ctx.shadowOffsetY = view.relativeW(4);
            ctx.shadowBlur = view.relativeW(7);
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(
                0,
                -0.5 * view.relativeW(snake.width),
                view.relativeH(snake.height),
                view.relativeW(snake.width)
            );
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.translate(view.relativeX(snake.x), view.relativeY(snake.y + SNAKE_OFFSET));
            ctx.rotate(snake.angle);
            ctx.fillStyle = this.drawDebug && snake.isCollided ? '#FF0000' : 'blue';
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'rgba(0, 0, 0, 0)';
            ctx.fillRect(
                0,
                -0.5 * view.relativeW(snake.width),
                view.relativeH(snake.height),
                view.relativeW(snake.width)
            );
            ctx.fillStyle = 'white';
            const w = view.relativeW(snake.width);
            const h = view.relativeH(snake.height);
            ctx.fillRect(0.2 * h, -0.3 * w, 0.6 * h, 0.6 * w);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.restore();
            if (this.drawDebug) {
                ctx.save();
                ctx.lineWidth = 1;
                const { head } = snake;
                const poly = head.getPoly();
                const l = view.relativeH(snake.height + 50);
                const x = view.relativeX(head.x);
                const y = view.relativeY(head.y);
                if (!snake.isPlayer) {
                    ctx.beginPath();
                    ctx.globalAlpha = snake.boundsAway ? 0.2 : 0.1;
                    ctx.fillStyle = snake.boundsAway ? '#FF0000' : '#A9A9A9';
                    ctx.arc(
                        x,
                        y,
                        view.relativeW((0.5 * snake.speed) / (ANGLE_SPEED * Math.PI)),
                        0,
                        2.0 * Math.PI
                    );
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(
                        x,
                        y,
                        view.relativeH(
                            SNAKE_TO_SNAKE_VISION_DISTANCE * snake.speed +
                                getDistance(head.cX, head.cY, poly.l0X, poly.l0Y)
                        ),
                        snake.angle - PI_2,
                        snake.angle + PI_2
                    );
                    ctx.globalAlpha = 0.1;
                    ctx.fillSyle = '#8A2BE2';
                    ctx.fill();
                }
                const leftVX = view.relativeX(
                    snake.x + Math.cos(snake.angle - snake.halfVisionAngle) * (snake.height + 100)
                );
                const leftVY = view.relativeY(
                    snake.y + Math.sin(snake.angle - snake.halfVisionAngle) * (snake.height + 100)
                );
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(leftVX, leftVY);
                ctx.arc(
                    x,
                    y,
                    l + 50,
                    snake.angle - snake.halfVisionAngle,
                    snake.angle + snake.halfVisionAngle
                );
                ctx.globalAlpha = 0.2;
                ctx.fillStyle = '#228B22';
                ctx.fill();
                if (snake.angle !== snake.toAngle) {
                    const toX = x + Math.cos(snake.toAngle) * l;
                    const toY = y + Math.sin(snake.toAngle) * l;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(toX, toY);
                    ctx.arc(
                        x,
                        y,
                        l,
                        snake.toAngle,
                        snake.angle,
                        signedDeltaAngle(snake.angle, snake.toAngle) < 0
                    );
                    ctx.globalAlpha = 0.3;
                    ctx.fillStyle = '#DC143C';
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(toX, toY);
                    ctx.strokeStyle = '#DC143C';
                    ctx.stroke();
                }
                ctx.globalAlpha = 1;
                ctx.strokeStyle = '#8A2BE2';
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + snake.vx * l, y + snake.vy * l);
                ctx.stroke();
                if (snake.boundsAway) {
                    ctx.beginPath();
                    ctx.strokeStyle = '#CD853F';
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + head.sumDirectionX * l * 1.5, y + head.sumDirectionY * l * 1.5);
                    ctx.stroke();
                }

                if (!snake.isPlayer) {
                    if (snake.boundsAway) {
                        ctx.beginPath();
                        ctx.moveTo(
                            view.relativeX(snake.boundsVec[0]),
                            view.relativeY(snake.boundsVec[1])
                        );
                        ctx.lineTo(
                            view.relativeX(snake.boundsVec[2]),
                            view.relativeY(snake.boundsVec[3])
                        );
                        ctx.globalAlpha = 1;
                        ctx.strokeStyle = '#CD853F';
                        ctx.stroke();
                    }

                    const aabb = head.getAABB();
                    ctx.font = `${toInt(view.relativeH(24))}px serif`;
                    ctx.fillStyle = '#00FFFF';
                    ctx.fillText(
                        `SA:${snake.snakesAway}`,
                        view.relativeX(head.cX),
                        view.relativeY(aabb.minY - 10)
                    );
                    ctx.fillText(
                        `BA:${snake.boundsAway}`,
                        view.relativeX(head.cX),
                        view.relativeY(aabb.minY - 36)
                    );
                }
                ctx.restore();
            }
        }
    }

    var Events = {
        BLUR: 'blur',
        BOOT: 'boot',
        DESTROY: 'destroy',
        FOCUS: 'focus',
        HIDDEN: 'hidden',
        PAUSE: 'pause',
        POST_RENDER: 'postrender',
        POST_STEP: 'poststep',
        PRE_RENDER: 'prerender',
        PRE_STEP: 'prestep',
        READY: 'ready',
        RESUME: 'resume',
        STEP: 'step',
        VISIBLE: 'visible'
    };

    var global$1 = (typeof global !== "undefined" ? global :
                typeof self !== "undefined" ? self :
                typeof window !== "undefined" ? window : {});

    // shim for using process in browser
    // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
    }
    var cachedSetTimeout = defaultSetTimout;
    var cachedClearTimeout = defaultClearTimeout;
    if (typeof global$1.setTimeout === 'function') {
        cachedSetTimeout = setTimeout;
    }
    if (typeof global$1.clearTimeout === 'function') {
        cachedClearTimeout = clearTimeout;
    }

    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
        } catch(e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                return cachedSetTimeout.call(null, fun, 0);
            } catch(e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                return cachedSetTimeout.call(this, fun, 0);
            }
        }


    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
        } catch (e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                return cachedClearTimeout.call(null, marker);
            } catch (e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                return cachedClearTimeout.call(this, marker);
            }
        }



    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
        if (!draining || !currentQueue) {
            return;
        }
        draining = false;
        if (currentQueue.length) {
            queue = currentQueue.concat(queue);
        } else {
            queueIndex = -1;
        }
        if (queue.length) {
            drainQueue();
        }
    }

    function drainQueue() {
        if (draining) {
            return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;

        var len = queue.length;
        while(len) {
            currentQueue = queue;
            queue = [];
            while (++queueIndex < len) {
                if (currentQueue) {
                    currentQueue[queueIndex].run();
                }
            }
            queueIndex = -1;
            len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
    }
    function nextTick(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
            runTimeout(drainQueue);
        }
    }
    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };
    var title = 'browser';
    var platform = 'browser';
    var browser = true;
    var env = {};
    var argv = [];
    var version$1 = ''; // empty string to avoid regexp issues
    var versions = {};
    var release = {};
    var config = {};

    function noop() {}

    var on = noop;
    var addListener = noop;
    var once = noop;
    var off = noop;
    var removeListener = noop;
    var removeAllListeners = noop;
    var emit = noop;

    function binding(name) {
        throw new Error('process.binding is not supported');
    }

    function cwd () { return '/' }
    function chdir (dir) {
        throw new Error('process.chdir is not supported');
    }function umask() { return 0; }

    // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
    var performance$1 = global$1.performance || {};
    var performanceNow =
      performance$1.now        ||
      performance$1.mozNow     ||
      performance$1.msNow      ||
      performance$1.oNow       ||
      performance$1.webkitNow  ||
      function(){ return (new Date()).getTime() };

    // generate timestamp or delta
    // see http://nodejs.org/api/process.html#process_process_hrtime
    function hrtime(previousTimestamp){
      var clocktime = performanceNow.call(performance$1)*1e-3;
      var seconds = Math.floor(clocktime);
      var nanoseconds = Math.floor((clocktime%1)*1e9);
      if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds<0) {
          seconds--;
          nanoseconds += 1e9;
        }
      }
      return [seconds,nanoseconds]
    }

    var startTime = new Date();
    function uptime() {
      var currentTime = new Date();
      var dif = currentTime - startTime;
      return dif / 1000;
    }

    var process = {
      nextTick: nextTick,
      title: title,
      browser: browser,
      env: env,
      argv: argv,
      version: version$1,
      versions: versions,
      on: on,
      addListener: addListener,
      once: once,
      off: off,
      removeListener: removeListener,
      removeAllListeners: removeAllListeners,
      emit: emit,
      binding: binding,
      cwd: cwd,
      chdir: chdir,
      umask: umask,
      hrtime: hrtime,
      platform: platform,
      release: release,
      config: config,
      uptime: uptime
    };

    const OS = {
        android: false,
        chromeOS: false,
        cordova: false,
        crosswalk: false,
        desktop: false,
        ejecta: false,
        electron: false,
        iOS: false,
        iOSVersion: 0,
        iPad: false,
        iPhone: false,
        kindle: false,
        linux: false,
        macOS: false,
        node: false,
        nodeWebkit: false,
        pixelRatio: 1,
        webApp: false,
        windows: false,
        windowsPhone: false
    };

    const init = () => {
        const ua = navigator.userAgent;
        if (/Windows/.test(ua)) {
            OS.windows = true;
        } else if (/Mac OS/.test(ua) && !/like Mac OS/.test(ua)) {
            OS.macOS = true;
        } else if (/Android/.test(ua)) {
            OS.android = true;
        } else if (/Linux/.test(ua)) {
            OS.linux = true;
        } else if (/iP[ao]d|iPhone/i.test(ua)) {
            OS.iOS = true;
            navigator.appVersion.match(/OS (\d+)/);
            OS.iOSVersion = parseInt(RegExp.$1, 10);
            OS.iPhone = ua.toLowerCase().indexOf('iphone') !== -1;
            OS.iPad = ua.toLowerCase().indexOf('ipad') !== -1;
        } else if (/Kindle/.test(ua) || /\bKF[A-Z][A-Z]+/.test(ua) || /Silk.*Mobile Safari/.test(ua)) {
            OS.kindle = true;
        } else if (/CrOS/.test(ua)) {
            OS.chromeOS = true;
        }
        if (/Windows Phone/i.test(ua) || /IEMobile/i.test(ua)) {
            OS.android = false;
            OS.iOS = false;
            OS.macOS = false;
            OS.windows = true;
            OS.windowsPhone = true;
        }
        const silk = /Silk/.test(ua);
        if (OS.windows || OS.macOS || (OS.linux && !silk) || OS.chromeOS) {
            OS.desktop = true;
        }
        if (OS.windowsPhone || (/Windows NT/i.test(ua) && /Touch/i.test(ua))) {
            OS.desktop = false;
        }
        if (navigator.standalone) {
            OS.webApp = true;
        }
        if (window.cordova !== undefined) {
            OS.cordova = true;
        }
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
            OS.node = true;
        }
        if (OS.node && typeof process.versions === 'object') {
            OS.nodeWebkit = !!process.versions['node-webkit'];
            OS.electron = !!process.versions.electron;
        }
        if (window.ejecta !== undefined) {
            OS.ejecta = true;
        }
        if (/Crosswalk/.test(ua)) {
            OS.crosswalk = true;
        }
        OS.pixelRatio = window.devicePixelRatio || 1;
        return OS;
    };

    var OS$1 = init();

    const Browser = {
        chrome: false,
        chromeVersion: 0,
        edge: false,
        firefox: false,
        firefoxVersion: 0,
        ie: false,
        ieVersion: 0,
        mobileSafari: false,
        opera: false,
        safari: false,
        safariVersion: 0,
        silk: false,
        trident: false,
        tridentVersion: 0
    };

    function init$1() {
        const ua = navigator.userAgent;
        if (/Edge\/\d+/.test(ua)) {
            Browser.edge = true;
        } else if (/Chrome\/(\d+)/.test(ua) && !OS$1.windowsPhone) {
            Browser.chrome = true;
            Browser.chromeVersion = parseInt(RegExp.$1, 10);
        } else if (/Firefox\D+(\d+)/.test(ua)) {
            Browser.firefox = true;
            Browser.firefoxVersion = parseInt(RegExp.$1, 10);
        } else if (/AppleWebKit/.test(ua) && OS$1.iOS) {
            Browser.mobileSafari = true;
        } else if (/MSIE (\d+\.\d+);/.test(ua)) {
            Browser.ie = true;
            Browser.ieVersion = parseInt(RegExp.$1, 10);
        } else if (/Opera/.test(ua)) {
            Browser.opera = true;
        } else if (/Safari/.test(ua) && !OS$1.windowsPhone) {
            Browser.safari = true;
        } else if (/Trident\/(\d+\.\d+)(.*)rv:(\d+\.\d+)/.test(ua)) {
            Browser.ie = true;
            Browser.trident = true;
            Browser.tridentVersion = parseInt(RegExp.$1, 10);
            Browser.ieVersion = parseInt(RegExp.$3, 10);
        }
        if (/Silk/.test(ua)) {
            Browser.silk = true;
        }
        return Browser;
    }

    var Browser$1 = init$1();

    const Audio = {
        audioData: false,
        dolby: false,
        m4a: false,
        mp3: false,
        ogg: false,
        opus: false,
        wav: false,
        webAudio: false,
        webm: false
    };

    function init$2() {
        Audio.audioData = !!window.Audio;
        Audio.webAudio = !!(window.AudioContext || window.webkitAudioContext);
        const audioElement = document.createElement('audio');
        const result = !!audioElement.canPlayType;
        try {
            if (result) {
                if (audioElement.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '')) {
                    Audio.ogg = true;
                }
                if (
                    audioElement.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, '') ||
                    audioElement.canPlayType('audio/opus;').replace(/^no$/, '')
                ) {
                    Audio.opus = true;
                }
                if (audioElement.canPlayType('audio/mpeg;').replace(/^no$/, '')) {
                    Audio.mp3 = true;
                }
                if (audioElement.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '')) {
                    Audio.wav = true;
                }
                if (
                    audioElement.canPlayType('audio/x-m4a;') ||
                    audioElement.canPlayType('audio/aac;').replace(/^no$/, '')
                ) {
                    Audio.m4a = true;
                }
                if (audioElement.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')) {
                    Audio.webm = true;
                }
                if (audioElement.canPlayType('audio/mp4;codecs="ec-3"') !== '') {
                    if (Browser$1.edge) {
                        Audio.dolby = true;
                    } else if (Browser$1.safari && Browser$1.safariVersion >= 9) {
                        if (/Mac OS X (\d+)_(\d+)/.test(navigator.userAgent)) {
                            const major = parseInt(RegExp.$1, 10);
                            const minor = parseInt(RegExp.$2, 10);

                            if ((major === 10 && minor >= 11) || major > 10) {
                                Audio.dolby = true;
                            }
                        }
                    }
                }
            }
        } catch (e) {
            //  Nothing to do here
        }
        return Audio;
    }

    var Audio$1 = init$2();

    const Fullscreen = {
        available: false,
        cancel: '',
        keyboard: false,
        request: ''
    };

    function init$3() {
        const suffix1 = 'Fullscreen';
        const suffix2 = 'FullScreen';

        const fs = [
            `request${suffix1}`,
            `request${suffix2}`,
            `webkitRequest${suffix1}`,
            `webkitRequest${suffix2}`,
            `msRequest${suffix1}`,
            `msRequest${suffix2}`,
            `mozRequest${suffix2}`,
            `mozRequest${suffix1}`
        ];
        for (let i = 0; i < fs.length; i++) {
            if (document.documentElement[fs[i]]) {
                Fullscreen.available = true;
                Fullscreen.request = fs[i];
                break;
            }
        }
        const cfs = [
            `cancel${suffix2}`,
            `exit${suffix1}`,
            `webkitCancel${suffix2}`,
            `webkitExit${suffix1}`,
            `msCancel${suffix2}`,
            `msExit${suffix1}`,
            `mozCancel${suffix2}`,
            `mozExit${suffix1}`
        ];
        if (Fullscreen.available) {
            for (let i = 0; i < cfs.length; i++) {
                if (document[cfs[i]]) {
                    Fullscreen.cancel = cfs[i];
                    break;
                }
            }
        }
        if (
            window.Element &&
            Element.ALLOW_KEYBOARD_INPUT &&
            !/ Version\/5\.1(?:\.\d+)? Safari\//.test(navigator.userAgent)
        ) {
            Fullscreen.keyboard = true;
        }
        Object.defineProperty(Fullscreen, 'active', {
            get() {
                return !!(
                    document.fullscreenElement ||
                    document.webkitFullscreenElement ||
                    document.mozFullScreenElement ||
                    document.msFullscreenElement
                );
            }
        });
        return Fullscreen;
    }

    var Fullscreen$1 = init$3();

    const Input = {
        gamepads: false,
        mspointer: false,
        touch: false,
        wheelEvent: null
    };

    function init$4() {
        if (
            'ontouchstart' in document.documentElement ||
            (navigator.maxTouchPoints && navigator.maxTouchPoints >= 1)
        ) {
            Input.touch = true;
        }
        if (navigator.msPointerEnabled || navigator.pointerEnabled) {
            Input.mspointer = true;
        }
        if (navigator.getGamepads) {
            Input.gamepads = true;
        }
        if ('onwheel' in window || (Browser$1.ie && 'WheelEvent' in window)) {
            Input.wheelEvent = 'wheel';
        } else if ('onmousewheel' in window) {
            Input.wheelEvent = 'mousewheel';
        } else if (Browser$1.firefox && 'MouseScrollEvent' in window) {
            // FF prior to 17. This should probably be scrubbed.
            Input.wheelEvent = 'DOMMouseScroll';
        }
        return Input;
    }

    var Input$1 = init$4();

    let prefix = '';

    const Smoothing = () => {
        const getPrefix = context => {
            const vendors = ['i', 'webkitI', 'msI', 'mozI', 'oI'];

            for (let i = 0; i < vendors.length; i++) {
                const s = `${vendors[i]}mageSmoothingEnabled`;
                if (s in context) {
                    return s;
                }
            }
            return null;
        };
        const enable = context => {
            if (prefix === '') {
                prefix = getPrefix(context);
            }
            if (prefix) {
                context[prefix] = true;
            }
            return context;
        };
        const disable = context => {
            if (prefix === '') {
                prefix = getPrefix(context);
            }
            if (prefix) {
                context[prefix] = false;
            }
            return context;
        };
        const isEnabled = context => (prefix !== null ? context[prefix] : null);

        return {
            disable,
            enable,
            getPrefix,
            isEnabled
        };
    };

    var Smoothing$1 = Smoothing();

    const CANVAS = 1; // Canvas
    const WEBGL = 2; // WebGL

    const pool = [];

    let disableContextSmoothing = false;

    const CanvasPool = () => {
        const create = (parent, width = 1, height = 1, canvasType = CANVAS, selfParent = false) => {
            let canvas;
            let container = first(canvasType);

            if (container === null) {
                container = {
                    parent,
                    canvas: document.createElement('canvas'),
                    type: canvasType
                };

                if (canvasType === CANVAS) {
                    pool.push(container);
                }

                canvas = container.canvas;
            } else {
                container.parent = parent;

                canvas = container.canvas;
            }

            if (selfParent) {
                container.parent = canvas;
            }

            canvas.width = width;
            canvas.height = height;

            if (disableContextSmoothing && canvasType === CANVAS) {
                Smoothing$1.disable(canvas.getContext('2d'));
            }

            return canvas;
        };

        const create2D = (parent, width, height) => create(parent, width, height, CANVAS);
        const createWebGL = (parent, width, height) => create(parent, width, height, WEBGL);

        const first = (canvasType = CANVAS) => {
            if (canvasType === WEBGL) {
                return null;
            }

            for (let i = 0; i < pool.length; i++) {
                const container = pool[i];

                if (!container.parent && container.type === canvasType) {
                    return container;
                }
            }
            return null;
        };

        const remove = parent => {
            const isCanvas = parent instanceof HTMLCanvasElement;
            pool.forEach(container => {
                if (
                    (isCanvas && container.canvas === parent) ||
                    (!isCanvas && container.parent === parent)
                ) {
                    container.parent = null;
                    container.canvas.width = 1;
                    container.canvas.height = 1;
                }
            });
        };

        const total = () => {
            let c = 0;
            pool.forEach(container => {
                if (container.parent) {
                    c += 1;
                }
            });
            return c;
        };

        const free = () => pool.length - total();

        const disableSmoothing = () => {
            disableContextSmoothing = true;
        };

        const enableSmoothing = () => {
            disableContextSmoothing = false;
        };

        return {
            create2D,
            create,
            createWebGL,
            disableSmoothing,
            enableSmoothing,
            first,
            free,
            pool,
            remove,
            total
        };
    };

    var CanvasPool$1 = CanvasPool();

    const Features = {
        canvas: false,
        canvasBitBltShift: null,
        file: false,
        fileSystem: false,
        getUserMedia: true,
        littleEndian: false,
        localStorage: false,
        pointerLock: false,
        support32bit: false,
        vibration: false,
        webGL: false,
        worker: false
    };

    function checkIsLittleEndian() {
        const a = new ArrayBuffer(4);
        const b = new Uint8Array(a);
        const c = new Uint32Array(a);
        b[0] = 0xa1;
        b[1] = 0xb2;
        b[2] = 0xc3;
        b[3] = 0xd4;
        if (c[0] === 0xd4c3b2a1) {
            return true;
        }
        if (c[0] === 0xa1b2c3d4) {
            return false;
        }
        return null;
    }

    function init$5() {
        Features.canvas = !!window.CanvasRenderingContext2D;
        try {
            Features.localStorage = !!localStorage.getItem;
        } catch (error) {
            Features.localStorage = false;
        }
        Features.file = !!window.File && !!window.FileReader && !!window.FileList && !!window.Blob;
        Features.fileSystem = !!window.requestFileSystem;
        let isUint8 = false;
        const testWebGL = () => {
            if (window.WebGLRenderingContext) {
                try {
                    const canvas = CanvasPool$1.createWebGL(this);
                    const ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                    const canvas2D = CanvasPool$1.create2D(this);
                    const ctx2D = canvas2D.getContext('2d');
                    const image = ctx2D.createImageData(1, 1);
                    isUint8 = image.data instanceof Uint8ClampedArray;
                    CanvasPool$1.remove(canvas);
                    CanvasPool$1.remove(canvas2D);
                    return !!ctx;
                } catch (e) {
                    return false;
                }
            }
            return false;
        };
        Features.webGL = testWebGL();
        Features.worker = !!window.Worker;
        Features.pointerLock =
            'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document;
        navigator.getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia ||
            navigator.oGetUserMedia;
        window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
        Features.getUserMedia = Features.getUserMedia && !!navigator.getUserMedia && !!window.URL;
        if (Browser$1.firefox && Browser$1.firefoxVersion < 21) {
            Features.getUserMedia = false;
        }
        if (!OS$1.iOS && (Browser$1.ie || Browser$1.firefox || Browser$1.chrome)) {
            Features.canvasBitBltShift = true;
        }
        if (Browser$1.safari || Browser$1.mobileSafari) {
            Features.canvasBitBltShift = false;
        }
        navigator.vibrate =
            navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

        if (navigator.vibrate) {
            Features.vibration = true;
        }
        if (
            typeof ArrayBuffer !== 'undefined' &&
            typeof Uint8Array !== 'undefined' &&
            typeof Uint32Array !== 'undefined'
        ) {
            Features.littleEndian = checkIsLittleEndian();
        }
        Features.support32bit =
            typeof ArrayBuffer !== 'undefined' &&
            typeof Uint8ClampedArray !== 'undefined' &&
            typeof Int32Array !== 'undefined' &&
            Features.littleEndian !== null &&
            isUint8;
        return Features;
    }

    var Features$1 = init$5();

    const CanvasFeatures = {
        supportInverseAlpha: false,
        supportNewBlendModes: false
    };

    function checkBlendMode() {
        const pngHead =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABAQMAAADD8p2OAAAAA1BMVEX/';
        const pngEnd = 'AAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==';
        const magenta = new Image();
        magenta.onload = () => {
            const yellow = new Image();
            yellow.onload = () => {
                const canvas = CanvasPool$1.create(yellow, 6, 1);
                const context = canvas.getContext('2d');
                context.globalCompositeOperation = 'multiply';
                context.drawImage(magenta, 0, 0);
                context.drawImage(yellow, 2, 0);
                if (!context.getImageData(2, 0, 1, 1)) {
                    return;
                }
                const { data } = context.getImageData(2, 0, 1, 1);
                CanvasPool$1.remove(yellow);
                CanvasFeatures.supportNewBlendModes = data[0] === 255 && data[1] === 0 && data[2] === 0;
            };

            yellow.src = `${pngHead}/wCKxvRF${pngEnd}`;
        };
        magenta.src = `${pngHead}AP804Oa6${pngEnd}`;
        return false;
    }

    function checkInverseAlpha() {
        const canvas = CanvasPool$1.create(this, 2, 1);
        const context = canvas.getContext('2d');
        context.fillStyle = 'rgba(10, 20, 30, 0.5)';
        context.fillRect(0, 0, 1, 1);
        const s1 = context.getImageData(0, 0, 1, 1);
        if (s1 === null) {
            return false;
        }
        context.putImageData(s1, 1, 0);
        const s2 = context.getImageData(1, 0, 1, 1);
        return (
            s2.data[0] === s1.data[0] &&
            s2.data[1] === s1.data[1] &&
            s2.data[2] === s1.data[2] &&
            s2.data[3] === s1.data[3]
        );
    }

    function init$6() {
        if (document !== undefined) {
            CanvasFeatures.supportNewBlendModes = checkBlendMode();
            CanvasFeatures.supportInverseAlpha = checkInverseAlpha();
        }
        return CanvasFeatures;
    }
    var CanvasFeatures$1 = init$6();

    const Video = {
        h264Video: false,
        hlsVideo: false,
        mp4Video: false,
        oggVideo: false,
        vp9Video: false,
        webmVideo: false
    };

    const init$7 = () => {
        const videoElement = document.createElement('video');
        const result = !!videoElement.canPlayType;
        try {
            if (result) {
                if (videoElement.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, '')) {
                    Video.oggVideo = true;
                }
                if (videoElement.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, '')) {
                    Video.h264Video = true;
                    Video.mp4Video = true;
                }
                if (videoElement.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '')) {
                    Video.webmVideo = true;
                }
                if (videoElement.canPlayType('video/webm; codecs="vp9"').replace(/^no$/, '')) {
                    Video.vp9Video = true;
                }
                if (
                    videoElement
                        .canPlayType('application/x-mpegURL; codecs="avc1.42E01E"')
                        .replace(/^no$/, '')
                ) {
                    Video.hlsVideo = true;
                }
            }
        } catch (e) {
            //  Nothing to do
        }
        return Video;
    };

    var Video$1 = init$7();

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
    }

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    var Options =
    /*#__PURE__*/
    function () {
      /**
       * The lowest the fps can drop to before the Deltaframe restarts to attempt to fix the
        * problem.
       * 
       * @since 1.0.0
       * 
       * @property {number}
        * 
        * @default 15
       */

      /**
       * The fps that the game loop should aim to  achieve.
       * 
       * @since 1.0.0
       * 
       * @property {number}
        * 
        * @default 60
       */

      /**
       * When the fps goes below the minFps Deltaframe will restart. This indicates how many times it will 
        * restart before stopping permanently.
       * 
       * @since 1.0.0
       * 
       * @property {number}
        * 
        * @default Infinity
       */

      /**
       * Specify the amount of milliseconds that Deltaframe should run for.
       * 
       * @since 1.0.0
       * 
       * @property {number}
        * 
        * @default Infinity
       */

      /**
       * Indicates whether setTimeout should be used even if requestAnimationFrame is supported by the user's browser.
       * 
       * @since 1.0.0
       * 
       * @property {number}
        * 
        * @default false
       */

      /**
        * @param {Object} options The initialization options passed to Deltaframe.
        */
      function Options() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Options);

        _defineProperty(this, "minFps", 15);

        _defineProperty(this, "targetFps", 60);

        _defineProperty(this, "maxRestartAttempts", Infinity);

        _defineProperty(this, "runTime", Infinity);

        _defineProperty(this, "forceSetTimeout", false);

        Object.assign(this, options);
      }
      /**
       * Return the minFps as a decimal representing the amount of time before a frame should occur.
       * 
       * @since 1.0.0
       * 
       * @returns {number}
       */


      _createClass(Options, [{
        key: "minFpsCalc",
        get: function get() {
          return Math.floor(1000 / this.minFps);
        }
        /**
         * Return the targetFps as a decimal representing the amount of time before a frame should occur.
         * 
         * @since 1.0.0
         * 
         * @returns {number}
         */

      }, {
        key: "targetFpsCalc",
        get: function get() {
          return Math.floor(1000 / this.targetFps);
        }
      }]);

      return Options;
    }();

    var RequestAnimationFrame =
    /*#__PURE__*/
    function () {
      /**
       * A reference to the id returned by requestAnimationFrame or setTimeout so 
       * that we can cancel their operation when needed.
       * 
       * @since 0.1.0
       * 
       * @property {number}
       */

      /**
       * Keeps track of whether the loop is already running or not so it's not accidently 
       * restarted.
       * 
       * @since 0.1.0
       * 
       * @property {boolean}
       * 
       * @default false
       */

      /**
       * The function that should be run on every update of the loop.
       * 
       * @since 0.1.0
       * 
       * @property {Function}
       * 
       * @default ()=>{}
       */

      /**
       * Indicates whether setTImeout is being used instead of requestAnimationFrame.
       * 
       * @since 0.1.0
       * 
       * @property {boolean}
       * 
       * @default false
       */
      function RequestAnimationFrame() {
        _classCallCheck(this, RequestAnimationFrame);

        _defineProperty(this, "id", 0);

        _defineProperty(this, "running", false);

        _defineProperty(this, "fn", function () {});

        _defineProperty(this, "usingSetTimeout", false);

        /**
         * Use the version of requestAnimationFrame that is supported by the user's browser and if none are 
         * supported, use setTimeout instead.
         * 
         * @property {RequestAnimationFrame|setTimeout}
         */
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (f) {
          return setTimeout(f, 1000 / 60);
        };
        /**
         * Use the version of cancelAnimationFrame that is supported by the user's browser and if none are supported, 
         * then setTimeout was used and so we use clearTimeout instead.
         * 
         * @property {cancelAnimationFrame}
         */


        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || function () {
          clearTimeout(this.id);
        };
      }
      /**
       * Start the operation of the requestAnimationFrame or setTimeout loop.
       * 
       * @since 0.1.0
       * 
       * @param {Function} fn The function to run every update of the loop.
       * @param {boolean} forceSetTimeout Indicates whether setTimeout should be used even if the user's browser supports requestAnimationFrame.
       */


      _createClass(RequestAnimationFrame, [{
        key: "start",
        value: function start(fn, forceSetTimeout) {
          var _this = this;

          if (this.running) return;
          this.running = true;
          this.fn = fn;

          if (forceSetTimeout) {
            this.usingSetTimeout = true;
            this.updateTimeout();
          } else {
            window.requestAnimationFrame(function (time) {
              return _this.updateRAF(time);
            });
          }
        }
        /**
         * Call requestAnimationFrame recursively so that the loop keeps going and
         * also send the timestamps over to Deltaframe.
         * 
         * @since 0.1.0
         * 
         * @param {number} timestamp The timestamp from the most recent requestAnimationFrame request.
         */

      }, {
        key: "updateRAF",
        value: function updateRAF(timestamp) {
          var _this2 = this;

          this.running = true;
          this.fn(timestamp);
          this.id = window.requestAnimationFrame(function (time) {
            return _this2.updateRAF(time);
          });
        }
        /**
         * Call setTimeout recursively so that the loop keeps going and also send
         * the timestamps over to Deltaframe.
         * 
         * @since 0.1.0
         */

      }, {
        key: "updateTimeout",
        value: function updateTimeout() {
          var _this3 = this;

          var timestamp = window.performance.now();
          this.fn(timestamp);
          this.id = window.setTimeout(function () {
            return _this3.updateTimeout();
          }, 1000 / 60);
        }
        /**
         * Restart the requestAnimation or setTimeout loop.
         * 
         * @since 0.1.0
         */

      }, {
        key: "restart",
        value: function restart() {
          var _this4 = this;

          if (this.usingSetTimeout) window.clearTimeout(this.id);else window.cancelAnimationFrame(this.id);
          this.id = 0;
          this.running = false;
          if (this.usingSetTimeout) this.updateTimeout();else window.requestAnimationFrame(function (time) {
            return _this4.updateRAF(time);
          });
          this.running = true;
        }
        /**
         * Stop the loop by calling cancelAnimationFrame or clearTimeout.
         * 
         * @since 0.1.0
         */

      }, {
        key: "stop",
        value: function stop() {
          if (this.usingSetTimeout) window.clearTimeout(this.id);else window.cancelAnimationFrame(this.id);
          this.id = 0;
          this.running = false;

          this.fn = function () {};

          return;
        }
      }]);

      return RequestAnimationFrame;
    }();

    /**
     * Deltaframe is an animation and game loop manager that makes sure your application
     * is punctual and performant.
     * 
     * @author Robert Corponoi <robertcorponoi@gmail.com>
     * 
     * @version 1.0.2
     */

    var Deltaframe =
    /*#__PURE__*/
    function () {
      /**
       * A reference to the options for this instance of Deltaframe.
       * 
       * @since 0.1.0
       * @private
       * 
       * @property {Options}
       */

      /**
       * The amount of times Deltaframe has had to restart due to the average fps
       * dipping below the minimum fps for a series of frames.
       * 
       * @since 0.1.0
       * @private
       * 
       * @property {number}
       */

      /**
       * Indicates whether Deltaframe is currently is currently running and not paused
       * or stopped.
       * 
       * @since 0.1.0
       * @private
       * 
       * @property {boolean}
       */

      /**
       * Indicates whether Deltaframe is currently paused.
       * 
       * @since 0.1.0
       * @private
       * 
       * @property {boolean}
       */

      /**
       * The function that will be called on every Deltaframe update.
       * 
       * @since 0.1.0
       * @private
       * 
       * @property {Function}
       */

      /**
       * The current frame that Deltaframe is on.
       * 
       * @since 0.1.0
       * @private
       * 
       * @property {number}
       */

      /**
       * The current timestamp as of the latest call to RequestAnimationFrame.
       * 
       * @since 0.1.0
       * @private
       * 
       * @property {DOMHighResTimeStamp|number}
       */

      /**
       * The timestamp before the current timestamp.
       * 
       * @since 0.1.0
       * @private
       * 
       * @property {DOMHighResTimeStamp|number}
       */

      /**
       * The difference in time between the current time and the last time.
       * 
       * @since 0.1.0
       * @private
       * 
       * @property {number}
       */

      /**
       * The average difference in time between frames.
       * 
       * @since 0.1.0
       * @private
       * 
       * @property {number}
       */

      /**
       * A set of up to 10 recent previous delta values that are used to get the mean delta.
       * 
       * @since 0.1.0
       * @private
       * 
       * @property {Array<number>}
       */

      /**
       * Since we only want to go up to 10 on the deltaHistory, we keep track of what index we're 
       * on so we can reset to 0 once were at 10.
       * 
       * @since 0.1.0
       * @private
       * 
       * @property {number}
       */

      /**
       * Initialize the RequestAnimationFrame abstraction module.
       * 
       * @since 0.1.0
       * @private
       * 
       * @property {RequestAnimationFrame}
       */

      /**
       * Use the version of hidden that's supported by the user's browser.
       * 
       * @since 1.0.0
       * @private
       * 
       * @property {document.hidden}
       */

      /**
       * @param {Object} [options] The options to pass to this Deltaframe instance.
       * @param {number} [options.minFps=15] The minimum fps value allowed before Deltaframe will restart to try to correct the issue.
       * @param {number} [options.targetFps=60] The fps that Deltaframe should aim to achieve.
       * @param {number} [options.maxRestartAttempts=Infinity] The number of times Deltaframe will restart due to problems before stopping entirely.
       * @param {number} [options.runTime=Infinity] The length of time that this instance of Deltaframe will run. This can be used to create an animation that lasts a specific amount of time.
       * @param {boolean} [options.forceSetTimeout=false] If set to true, Deltaframe will use setTimeout for the loop instead of requestAnimationFrame.
       */
      function Deltaframe(options) {
        _classCallCheck(this, Deltaframe);

        _defineProperty(this, "_options", void 0);

        _defineProperty(this, "_restartAttempts", void 0);

        _defineProperty(this, "_running", void 0);

        _defineProperty(this, "_paused", void 0);

        _defineProperty(this, "_fn", void 0);

        _defineProperty(this, "_frame", void 0);

        _defineProperty(this, "_time", void 0);

        _defineProperty(this, "_prevTime", void 0);

        _defineProperty(this, "_delta", void 0);

        _defineProperty(this, "_deltaAverage", void 0);

        _defineProperty(this, "_deltaHistory", void 0);

        _defineProperty(this, "_deltaIndex", void 0);

        _defineProperty(this, "_raf", void 0);

        _defineProperty(this, "_hidden", void 0);

        this._options = new Options(options);
        this._restartAttempts = 0;
        this._running = false;
        this._paused = false;

        this._fn = function () {};

        this._frame = 0;
        this._time = 0;
        this._prevTime = 0;
        this._delta = 0;
        this._deltaAverage = 0;
        this._deltaHistory = [];
        this._deltaIndex = 0;
        this._raf = new RequestAnimationFrame();
        this._hidden = document.hidden;

        this._boot();
      }
      /**
       * Return the number of times that Deltafram has restarted.
       * 
       * @since 1.0.0
       * 
       * @returns {number}
       */


      _createClass(Deltaframe, [{
        key: "start",

        /**
         * Start the loop.
         * 
         * @since 0.1.0
         * 
         * @param {Function} fn The function to be called every step by the loop.
         */
        value: function start(fn) {
          var _this = this;

          this._fn = fn;
          this._prevTime = 0;
          this._running = true;

          this._raf.start(function (timestamp) {
            return _this._update(timestamp);
          }, this._options.forceSetTimeout);
        }
        /**
         * Pause the loop operation saving the state to be resumed at a later time.
         * 
         * @since 0.1.0
         */

      }, {
        key: "pause",
        value: function pause() {
          this._paused = true;
          this._running = false;
        }
        /**
         * Resume the loop from a paused state.
         * 
         * @since 0.1.0
         */

      }, {
        key: "resume",
        value: function resume() {
          this._paused = false;
          this._prevTime = window.performance.now();
          this._running = true;
        }
        /**
         * Stop the loop and reset all time values of Deltaframe.
         * 
         * @since 0.1.0
         */

      }, {
        key: "stop",
        value: function stop() {
          var _this2 = this;

          this._restartAttempts = 0;
          this._running = false;
          this._paused = false;

          this._fn = function () {};

          this._frame = 0;
          this._time = 0;
          this._prevTime = 0;
          this._delta = 0;
          this._deltaHistory = [];
          this._deltaIndex = 0;
          document.removeEventListener('visibilitychange', function () {
            return _this2._visibilityChange;
          });

          this._raf.stop();

          return;
        }
        /**
         * Initialize the page visibility events which will let us save resources by pausing
         * our updates when the user is not interacting with the page running Deltaframe.
         * 
         * @since 0.1.0
         * @private
         */

      }, {
        key: "_boot",
        value: function _boot() {
          var _this3 = this;

          document.addEventListener('visibilitychange', function () {
            return _this3._visibilityChange;
          });
        }
        /**
         * Update is called whenever requestAnimationFrame decides it can process the next step of the loop 
         * or roughly 60 times per second using setTimeout.
         * 
         * @since 0.1.0
         * @private
         * 
         * @param {DOMHighResTimeStamp|number} timestamp The timestamp as returned from requestAnimationFrame.
         */

      }, {
        key: "_update",
        value: function _update(timestamp) {
          if (this._paused) return;

          if (timestamp >= this._options.runTime) {
            this.stop();
            return;
          }

          this._time = timestamp;
          this._delta = timestamp - this._prevTime;
          if (this._deltaIndex === 10) this._deltaIndex = 0;
          this._deltaHistory[this._deltaIndex] = this._delta;
          this._deltaIndex++;
          var mean = 0;

          for (var i = 0; i < this._deltaHistory.length; ++i) {
            mean += this._deltaHistory[i];
          }

          mean /= 10;
          this._deltaAverage = mean;

          if (this._deltaAverage >= this._options.minFpsCalc) {
            if (this._restartAttempts === this._options.maxRestartAttempts) {
              this.stop();
              return;
            }

            this._raf.restart();

            this._restartAttempts++;
          }

          if (this._deltaAverage >= this._options.targetFpsCalc) {
            this._frame++;

            this._fn(timestamp, this._delta, this._deltaAverage);

            this._prevTime = timestamp;
          }
        }
        /**
         * When the the user has switched to a different tab and is not on the same page that
         * Deltaframe is running on, Deltaframe will pause and when the user comes back it will resume.
         * 
         * @since 0.2.0
         * @private
         */

      }, {
        key: "_visibilityChange",
        value: function _visibilityChange() {
          var visibility = document.visibilityState;
          if (visibility === 'visible') this.resume();else if (visibility === 'hidden') this.pause();
        }
      }, {
        key: "timesRestarted",
        get: function get() {
          return this._restartAttempts;
        }
        /**
         * Returns if Deltaframe is running or not.
         * 
         * @since 1.0.0
         * 
         * @returns {boolean}
         */

      }, {
        key: "isRunning",
        get: function get() {
          return this._running;
        }
        /**
         * Returns if Deltaframe is paused or not.
         * 
         * @since 0.1.0
         * 
         * @returns {boolean}
         */

      }, {
        key: "isPaused",
        get: function get() {
          return this._paused;
        }
        /**
         * Returns the current frame.
         * 
         * @since 1.0.0
         * 
         * @returns {number}
         */

      }, {
        key: "frame",
        get: function get() {
          return this._frame;
        }
      }]);

      return Deltaframe;
    }();

    const stats = new stats_min();
    const { log: log$2, info } = console;
    MicroModal.init({
        onShow: modal => info(`${modal.id} is shown`), // [1]
        onClose: modal => info(`${modal.id} is hidden`), // [2]
        disableScroll: true, // [5]
        disableFocus: false, // [6]
        awaitCloseAnimation: false, // [7]
        debugMode: true // [8]
    });

    MicroModal.show('modal-1');
    const search = lib_2(window.location.search, {
        ignoreQueryPrefix: true
    });
    log$2(OS$1);
    log$2(Browser$1);
    log$2(Audio$1);
    log$2(Fullscreen$1);
    log$2(Input$1);
    log$2(Features$1);
    log$2(CanvasFeatures$1);
    log$2(Video$1);

    const numUnits = parseInt(search.units, 10);
    const numFoods = parseInt(search.foods, 10);
    const radius = parseInt(search.radius, 10);

    stats.showPanel(0);
    document.body.appendChild(stats.dom);
    const canvas = document.getElementById('cas');

    // window's width and height
    const vWidth = window.innerWidth;
    const vHeight = window.innerHeight;

    const KeyCodes = {
        SPACE: 32,
        SHIFT: 16
    };

    let dt = 0;

    const gameMap = new GameMap({
        playerID: 'player',
        canvas,
        vWidth,
        vHeight,
        radius: radius || MAP_RADIUS,
        pixelRatio: OS$1.pixelRatio
    });
    log$2(`Создан игровой мир с радиусом ${gameMap.radius}`);

    const mouseCoords = {};

    const deltaframe = new Deltaframe({
        targetFps: 120
    });

    log$2('Инициализация игры');
    initGame();
    deltaframe.start(draw);

    /** dt
     * game init
     */
    function initGame() {
        log$2('Инициализация слайзеров');
        gameMap.initUnits(numUnits || INIT_UNITS_COUNT);
        log$2(`Создано ${gameMap.units.length} слайзеров`);
        log$2('Инициализация еды');
        gameMap.initFoods(numFoods || INIT_FOODS_COUNT);
        log$2(`Создано ${gameMap.foodsOnField} единиц еды`);
        log$2('Биндинг глобальных листенеров');
        binding$1();
        log$2('Старт игрового процесса');
        gameMap.emit(Events.VISIBLE);
    }

    function draw(time, delta, deltaAverage) {
        stats.begin();
        dt = delta * MSSEC;
        gameMap.update(dt);
        gameMap.render(dt);
        stats.end();
    }

    /**
     * event binding
     */

    function binding$1() {
        // finger|mouse move event
        if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {
            window.addEventListener('touchstart', mousemove);
            window.addEventListener('touchmove', mousemove);
        } else {
            // change snake's direction when mouse moving
            window.addEventListener('mousemove', mousemove);

            // speed up
            window.addEventListener('mousedown', () => {
                if (gameMap.player.length <= gameMap.player.minLength) return;

                gameMap.player.speedUp();
            });

            // speed down
            window.addEventListener('mouseup', () => {
                gameMap.player.speedDown();
            });

            window.addEventListener('keyup', e => {
                switch (e.keyCode) {
                    case KeyCodes.SPACE:
                        gameMap.drawDebug = !gameMap.drawDebug;
                        log$2(`Draw debug: ${gameMap.drawDebug}`);
                        break;
                    case KeyCodes.SHIFT:
                        gameMap.isScaled = !gameMap.isScaled;
                        gameMap.setToScale(gameMap.isScaled ? 2 : 1);
                        log$2(
                            `Scale game: ${gameMap.isScaled} from ${gameMap.scale} to ${
                            gameMap.toScale
                        }`
                        );
                        break;
                    default:
                        break;
                }
            });
        }

        /* VisibilityHandler(gameMap);
        gameMap.on(Events.HIDDEN, onHidden);
        gameMap.on(Events.VISIBLE, onVisible); */

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
            gameMap.player.toAngle = angleBetweenCoords(
                gameMap.player.x,
                gameMap.player.y,
                gameMap.view.absoluteX(mouseCoords.x),
                gameMap.view.absoluteY(mouseCoords.y)
            );
        }

        /* function onHidden() {
            deltaframe.pause();
            gameMap.emit(Events.PAUSE);
            log('Игра остановлена');
        }

        function onVisible() {
            deltaframe.resume();
            gameMap.emit(Events.RESUME);
            log('Игра запущена');
    } */
    }

}());
//# sourceMappingURL=bundle.js.map
