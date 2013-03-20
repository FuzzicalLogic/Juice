(function (S, $, undefined) {
    "use strict";
    var ns = 'Juice',
        /* Convenience variables (Mostly for saving keystrokes)
   ---------------------------------------------------- */
        NIL = function () {};

    //Animation Namespace
    (function (S, A) {
        A.prototype = {
            play: function () {
                var _ = this,
                    fps = _.fps;
                // Setup the animation
                _.setup(_);
                _.loops = 0;
                _.isStopped = false;
                // Begin drawing
                setTimeout(function () {
                    _.draw();
                }, 1e3 / fps);
            },
            stop: function () {
                this.isStopped = true;
            },

            draw: function () {
                var _ = this,
                    f = _.frame,
                    fps = _.fps,
                    len = _.length,
                    max = _.maxFrames,
                    c2d = _.context,
                    cache = _.cache || [];


                // Init frames
                if (!f) {
                    _.frame = 0;
                }
                _.maxFrames = fps * (len / 1e3);
                // Clear the image entirely
                c2d.clearRect(0, 0, _.wFull, _.hFull);
                // If frame is cached, draw immediately
                if (f in cache) {
                    c2d.putImageData(cache[f], 0, 0);
                }
                // Otherwise draw the frame manually
                else {
                    _.cache[f] = _.drawFrame();
                }

                // Increment the frame and store it.
                if (++_.frame >= max) {
                    _.loops++;
                    _.frame = 0;
                    if (_.onLoop) {
                        _.onLoop(_, _.loops);
                    }
                }
                // Set the next frame...
                if (!(_.isStopped)) {
                    setTimeout(function () {
                        _.draw();
                    }, 1e3 / fps);
                }
            },

            drawFrame: function () {
                var _ = this,
                    f = _.frame,
                    c2d = _.context,
                    // Image Properties
                    w = _.wFull,
                    h = _.hFull;

                c2d.globalAlpha = _.alpha;
                $.each(_.points, function () {
                    this.draw(f / _.maxFrames);
                });
                //options.teardown();
                // Cache the image
                return c2d.getImageData(0, 0, w, h);
            }

        };
    }
    (S, S.Animation = S.Animation || function (data) { //Initialize
        var PT = S.Point,
            l, i, trl, pts,
            _ = this,
            d = !data ? {} : data;
        // Set defaults... the hard way!
        _.cssID = !d.cssID ? null : d.cssID;
        _.cssClass = !d.cssClass ? ns : d.cssClass;
        _.w = !d.w ? 50 : d.w;
        _.h = !d.h ? 50 : d.h;
        _.padding = !d.padding ? 0 : d.padding;
        _.wFull = _.w + 2 * _.padding;
        _.hFull = _.h + 2 * _.padding;
        // Animation Defaults
        _.cache = [];
        _.context = !d.context ? null : d.context;
        _.length = !d.length ? 1000 : d.length;
        _.fps = !d.fps ? 30 : d.fps;
        _.alpha = !d.alpha ? 1 : d.alpha;
        // Global Fallbacks
        _.ptSize = !d.ptSize ? 10 : d.ptSize;
        // Animation Functions
        _.setup = !d.setup ? NIL : d.setup;
        _.onSetup = !d.onSetup ? NIL : d.onSetup;
        _.onLoop = !d.onLoop ? NIL : d.onLoop;
        // Child Objects w/o Siblings
        trl = !d.trail ? {} : d.trail;
        _.trail = new S.Trail(trl);
        // Child Objects w/ Siblings
        _.points = [];
        pts = !d.points ? [{}] : d.points;
        l = pts.length;
        for (i = 0; i < l; i++) { // Create the new element...
            _.points[i] = new PT(_, pts[i]);
        }
        // Return the results            
        return _;
    }));

    (function (S, P) { //Namespace
        // Inherited Functions
        P.prototype.draw = function (p) { //Initialize
            var pt, n,
            _ = this,
                t = _.trail,
                A = _.Animation,
                ptProgress = 0,
                d = (t.length / A.length) / (t.points + 1);

            for (pt = 0, n = t.points + 1; pt < n; pt++) {
                ptProgress = p - ((n - pt) * d);
                if (ptProgress < 0) {
                    ptProgress = ptProgress + 1;
                }
                _.modifier = (pt / n);
                if (_.paths) {
                    _.path = _.paths;
                    if (typeof _.paths === 'function') {
                        _.paths(ptProgress, _);
                    } else if (typeof _.paths === 'object') {
                        _.paths.draw(ptProgress, _);
                    }
                }
                // Default to global Step() function
                else {
                    _.step(ptProgress, this);
                }
            }
        };
        P.prototype.canFade = function () {
            return this.trail.fade;
        };
        P.prototype.canResize = function () {
            return this.trail.transform;
        };
        P.prototype.onDestroy = function () {
            if (this.Animation) {
                this.Animation = null;
            }
        };
        // Round Point Objects
        (function (P, C) { //Inherited Functions
            C.prototype.draw = P.prototype.draw;
            C.prototype.canFade = P.prototype.canFade;
            C.prototype.canResize = P.prototype.canResize;
            C.prototype.onDestroy = P.prototype.onDestroy;
            // New/Overridden Functions
            C.prototype.render = function (x, y) { //ERROR:No Context
                var c2d, s, a,
                _ = this,
                    A = _.Animation;
                if (A) {
                    if (A.context) {
                        c2d = A.context;
                    }
                }
                // Initialize
                x = x || 0;
                y = y || 0;
                s = _.ptSize || 1;
                // Account for Trailing
                if (this.canResize()) {
                    s = s * this.modifier;
                }
                a = s / 2;
                if (this.canFade()) {
                    c2d.globalAlpha = _.alpha * _.modifier;
                }
                // Draw the Point
                c2d.fillStyle = _.color;
                c2d.beginPath();
                c2d.arc(x, y, a, 0, 360, false);
                c2d.fill();
                c2d.closePath();
            };
        }
        (P, P.Round = P.Round || function (anim, data) { //Initialize
            var _ = this,
                d = !data ? {} : data;
            // Set the parent appropriately
            if (anim) {
                this.Animation = anim;
            }
            // Set defaults... the hard way!
            _.ptSize = d.size || anim.ptSize;
            _.color = d.color || anim.color;
            _.alpha = d.alpha || anim.alpha;
            _.paths = new S.Path(anim, d.paths);
            // Possible Siblings Objects Last
            _.trail = (!d.trail) ? new T(anim.trail) : new T(d.trail);
            // Return the results            
            return _;
        }));
        // Rectangular Point Objects
        (function (P, R) { //Inherited Functions
            R.prototype.draw = P.prototype.draw;
            R.prototype.canFade = P.prototype.canFade;
            R.prototype.canResize = P.prototype.canResize;
            R.prototype.onDestroy = P.prototype.onDestroy;
            // New/Overridden Functionality
            R.prototype.render = function (x, y) { //ERROR:No Context
                var c2d, s, a,
                A = this.Animation;
                if (A) {
                    if (A.context) {
                        c2d = A.context;
                    }
                }
                // Initialize
                x = !x ? 0 : x;
                y = !y ? 0 : y;
                s = !this.ptSize ? 1 : this.ptSize;
                a = s / 2;
                // Account for Trailing
                if (this.canResize()) {
                    s = s * this.modifier;
                }
                if (this.canFade()) {
                    c2d.globalAlpha = this.alpha * this.modifier;
                }
                // Draw the Point
                c2d.fillStyle = this.color;
                c2d.fillRect(x + a, y + a, s, s);
            };
        }
        (P, P.Rect = P.Rect || function (anim, data) { //Initialize
            var _ = this,
                d = !data ? {} : data;
            // Set the parent appropriately
            if (anim) {
                _.Animation = anim;
            }
            // Set defaults... the hard way!
            _.ptSize = d.size || anim.ptSize;
            _.color = d.color || anim.color;
            _.alpha = d.alpha || anim.alpha;
            _.paths = new S.Path(anim, d.paths);
            // Possible Siblings Objects Last
            _.trail = (!d.trail) ? new T(anim.trail) : new T(d.trail);
            // Return the results            
            return _;
        }));
    }
    (S, S.Point = S.Point || function (anim, data) { //Initialize
        var r, 
            d = data || {};
        // Get the right kind of Point
        this.type = d.type || 'rect';
        if (this.type === 'round') {
            r = new S.Point.Round(anim, data);
        } else {
            r = new S.Point.Rect(anim, data);
        }
        return r;
    }));

    (function (S) {}
    (S, S.Trail = S.Trail || function (data) { //Initialize
        // Save keystrokes
        var me = this,
            d = data || {};
        // Set defaults... the hard way!
        me.length = d.length || 500;
        me.points = d.points || 10;
        me.fade = !d.fade ? typeof d.fade === 'undefined' ? true : d.fade : d.fade;
        me.transform = !d.transform ? typeof d.transform === 'undefined' ? false : d.transform : d.transform;
        // Return the results            
        return me;
    }));

    (function (S, P) {
        (function (P, L) {
            L.prototype.draw = function (p, pt) {
                var _ = this,
                    x = _.x1 + ((_.x2 - _.x1) * p),
                    y = _.y1 + ((_.y2 - _.y1) * p);
                pt.render(x, y);
            };

        }(P, P.Line = P.Line || function (anim, data) {
            var _ = this,
                d = !data ? {} : data;
            _.x1 = d.x1 || 0;
            _.y1 = !d.y1 ? anim.h / 2 : d.y2;
            _.x2 = !d.x2 ? anim.w : d.x2;
            _.y2 = !d.y2 ? anim.h / 2 : d.y2;
            return this;
        }));
        (function (P, A) {
            A.prototype.draw = function (progress, pt) {
                var _ = this,
                    x = _.x,
                    y = _.y,
                    adj = pt.ptSize / 2,
                    r = _.r - adj,
                    start = _.start,
                    end = _.end,
                    angle = Math.PI * (end + (progress * (start - end))) / 180;
                x = r * Math.sin(angle) + x;
                y = r * Math.cos(angle) + y;
                pt.render(x, y);
            };

        }(P, P.Arc = P.Arc || function (anim, data) {
            var _ = this,
                d = !data ? {} : data;
            _.x = d.x || anim.w / 2;
            _.y = d.y || anim.h / 2;
            _.r = !d.r ? ((anim.w > anim.h) ? anim.w / 2 : anim.h / 2) : d.r;
            _.start = d.start || 0;
            _.end = d.end || 360;
            return _;
        }));
        (function (P) {

        }(P, P.Ellipse = P.Ellipse || function (anim, data) {
            return this;
        }));
        (function (P, B) {
            B.prototype.draw = function (p, pt) {
                var _ = this,
                    p1x = _.startX,
                    p1y = _.startY,
                    p2x = _.endX,
                    p2y = _.endY,
                    cp1x = _.cp1x,
                    cp1y = _.cp1y,
                    cp2x = _.cp2x,
                    cp2y = _.cp2y,
                    h = (1 - p) * (1 - p) * (1 - p),
                    p2 = 3 * (1 - p) * (1 - p) * p,
                    d = 3 * (1 - p) * p * p,
                    v = p * p * p,
                    x = h * p1x + p2 * cp1x + d * cp2x + v * p2x,
                    y = h * p1y + p2 * cp1y + d * cp2y + v * p2y;

                pt.render(x, y);
            };
        }(P, P.Bezier = P.Bezier || function (anim, data) {
            var _ = this,
                d = data || {};
            _.startX = d.startX;
            _.startY = d.startY;
            _.endX = d.endX;
            _.endY = d.endY;
            _.cp1x = d.cp1x;
            _.cp1y = d.cp1y;
            _.cp2x = d.cp2x;
            _.cp2y = d.cp2y;
            return _;
        }));

    }
    (S, S.Path = S.Path || function (anim, data) { //Initialize
        var r,
            d = data || {},
        // Save keystrokes
        me = this;
        // Get the right kind of Point
        me.name = d.name || '';
        if (me.name === 'line') {
            r = new S.Path.Line(anim, data);
        } else if (me.name === 'arc') {
            r = new S.Path.Arc(anim, data);
        } else if (me.name === 'bezier') {
            r = new S.Path.Bezier(anim, data);
        } else if (me.name === 'ellipse') {
            r = new S.Path.Ellipse(anim, data);
        }
        return r;
    }));

    /* Sub-Namespaces (all should be created by now)
   ---------------------------------------------------- */
    var A = S.Animation,
        PT = S.Point,
        P = S.Path,
        T = S.Trail;

    if ($) { //Alias - data()
        var tmpItems,
        d = function (jq, o) {
            var r;
            if (typeof o === 'object') {
                r = $(jq).data(ns, o);
            } else {
                r = $(jq).data(ns);
            }
            return r;
        },
        // Alias - instanceof
        isQ = function (chk) {
            return chk instanceof $;
        },
        isJ = function (chk) {
            return chk instanceof A;
        },
        link = function (items) {
            var tmp = $(items);
            tmp.play = function () {
                return tmp.Juice('play');
            };
            tmp.stop = function () {
                return tmp.Juice('stop');
            };
            return tmp;
        },
        jQFind = function (items, addMissing) {
            var list = [];
            items.each(function () {
                if ($(this).prop('tagName') !== 'CANVAS') {
                    if (addMissing) {
                        var a = document.createElement('canvas');
                        $(a).addClass('Juice');
                        $(this).prepend($(a));
                        list.push(a);
                    }
                } else {
                    list.push(this);
                }
            });
            return list;
        };
        // Juice Namespace in $
        (function (S) {
            S.play = function (jQ) {
                return jQ.Juice('play');
            };
            S.stop = function (jQ) {
                return jQ.Juice('stop');
            };
        }
        ($.Juice = $.Juice || function (list) {
            if (isQ(list)) {
                return link(list);
            }
        }, $));
        //Juice Namespace in $.fn
        (function (S) {
            S.methods = {
                init: function (options) {
                    var list = jQFind(this, true);
                    // Add the new links
                    tmpItems = list;
                    // Add the loaders
                    $.each(list, function () { //Key savers
                        var me = this,
                            j = d(me);

                        // If the plugin hasn't been initialized yet
                        if (!j) { //Clone options and attach to canvas
                            options.context = me.getContext('2d');
                            d(me, new A(options));
                            j = d(me);
                            $(me).attr('height', j.hFull);
                            $(me).attr('width', j.wFull);
                        }
                    });
                    return link(list);
                },
                play: function () {
                    var list = jQFind(this, false);
                    return link($.each(list, function () {
                        var j = d(this);
                        if (isJ(j)) {
                            j.play();
                        }
                    }));
                },
                stop: function () {
                    var list = jQFind(this, false);
                    return link($.each(list, function () {
                        var j = d(this);
                        if (isJ(j)) {
                            j.stop();
                        }
                    }));
                }
            };
            S.play = function (jQ) {
                return $(jQ).Juice('play');
            };
            S.stop = function (jQ) {
                return $(jQ).Juice('stop');
            };
        }
        ($.fn.Juice = $.fn.Juice || function (method) {
            var r,
                fn = $.fn.Juice.methods;

            if (fn[method]) {
                r = fn[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object') {
                r = fn.init.apply(this, arguments);
            } else if (typeof method === 'undefined') {
                r = link(this);
            }
            return r;
        }, $.fn));
    }
}
(window.Juice = window.Juice || function () {}, window.jQuery));
