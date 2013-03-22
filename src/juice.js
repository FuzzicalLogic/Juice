(function (J, $, undefined) {
    "use strict";
    /* Convenience variables (Mostly for saving keystrokes)
   ---------------------------------------------------- */
    var ns = 'Juice',
        NIL = function () {};

    var nPath = function (p, data) {
        var r,
        d = data || {},
        // Save keystrokes
        me = this;
        // Get the right kind of Point
        me.name = d.name || '';
        if (me.name === 'line') {
            r = new J.Path.Line(p, data);
        } else if (me.name === 'arc') {
            r = new J.Path.Arc(p, data);
        } else if (me.name === 'bezier') {
            r = new J.Path.Bezier(p, data);
        } else if (me.name === 'ellipse') {
            r = new J.Path.Ellipse(p, data);
        }
        return r;
    },
    nPoint = function (A, data) {
        //Initialize
        var r,
        d = data || {};
        // Get the right kind of Point
        this.type = d.type || 'rect';
        if (this.type === 'round') {
            r = new J.Point.Round(A, data);
        } else {
            r = new J.Point.Rect(A, data);
        }
        return r;
    };

    (function (J, T) {
        T.prototype = {
            fader: function (b) {
                if (typeof b === 'boolean') {
                    this.fade = b;
                    return this;
                }
                if (typeof this.fade === 'undefined') return this.juice().trail().fade;
                return this.fade;
            },
            resize: function (b) {
                var r, _ = this;
                if (typeof b === 'boolean') {
                    _.transform = b;
                    r = _;
                }
                if (typeof _.transform === 'undefined') {
                    r = _.juice().trail().transform;
                }
                return r || this.transform;
            },
            size: function (n) {
                var _ = this;
                if (typeof n === 'number' && n > -1) {
                    _.followers = n;
                    return _;
                }
                return _.followers || _.juice().trail().followers;
            },
            length: function (n) {
                var _ = this;
                if (typeof n === 'number') {
                    _.lag = n;
                    return _;
                }
                return _.lag || _.juice().trail().lag;
            }
        };
    }
    (J, J.Trail = J.Trail || function (p, data) {
        p.setChild(this);
        return this;
    }));



    (function (J, P) {
        var nLine = function (p, data) {
            p.setChild(this);
            var _ = this,
                d = data || {},
                w = _.juice().width(),
                h = _.juice().height();
            _.x1 = d.x1 || 0;
            _.y1 = d.y1 || h / 2;
            _.x2 = d.x2 || w;
            _.y2 = d.y2 || h / 2;
            return _;
        },
        nArc = function (p, data) {
            p.setChild(this);
            var _ = this,
                d = (data || {}),
                w = _.juice().width(),
                h = _.juice().height();
            _.x = d.x || w / 2;
            _.y = d.y || h / 2;
            _.r = d.r || w > h ? w / 2 : h / 2;
            _.start = d.start || 0;
            _.end = d.end || 360;
            return _;
        },
        nBez = function (p, data) {
            p.setChild(this);
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
        },
        nEll = function (p, data) {
            p.setChild(this);
            return this;
        };
        (function (P, L) {
            Juice.Path.Line.prototype.draw = function (p, pt) {
                var _ = this,
                    x = _.x1 + ((_.x2 - _.x1) * p),
                    y = _.y1 + ((_.y2 - _.y1) * p);
                pt.render(x, y);
            };

        }(P, P.Line = P.Line || nLine));
        (function (P, A) {
            A.prototype.draw = function (progress, pt) {
                var _ = this,
                    x = _.x,
                    y = _.y,
                    adj = pt.size() / 2,
                    r = _.r - adj,
                    start = _.start,
                    end = _.end,
                    angle = Math.PI * (end + (progress * (start - end))) / 180;
                x = r * Math.sin(angle) + x;
                y = r * Math.cos(angle) + y;
                pt.render(x, y);
            };

        }(P, P.Arc = P.Arc || nArc));
        (function (J, P, E) {

        }(J, P, P.Ellipse = Juice.Ellipse || nEll));

        (function (J, P, B) {
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
        }(J, P, P.Bezier = P.Bezier || nBez));
    }
    (J, J.Path = J.Path || nPath));


    (function (J, P) {
        P.prototype = {
            setChild: function (o) {
                if (typeof o !== 'undefined') {
                    var _ = this;
                    o.parent = function () {
                        return _;
                    };
                    _.juice().chain(o);
                }
            },
            draw: function (f) { //Initialize
                var pt, n,
                _ = this,
                    j = _.juice(),
                    t = _.trail(),
                    ptProgress = 0,
                    d = (t.length() / j.length()) / (t.size() + 1),
                    p = j.progress(f);

                for (pt = 0, n = t.size() + 1; pt < n; pt++) {
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
            },
            type: function () {},
            size: function (n) {
                var _ = this;
                if (typeof n === 'number') {
                    _.ptSize = n;
                    return _;
                }
                return _.ptSize || _.juice().size();
            },
            color: function (s) {
                var _ = this;
                if (typeof s === 'string') {
                    _.fill = s;
                    return _;
                }
                return _.fill || _.juice().color();
            },
            alpha: function (n) {
                var _ = this;
                if (typeof n === 'number') {
                    _.a = n;
                    return _;
                }
                return _.a || _.juice().alpha();
            },
            trail: function (o) {
                var t, _ = this;
                if (typeof o === 'object') {
                    _.PointTrail = new J.Trail(this, o);
                    t = _.PointTrail;
                    t.length(o.length);
                    t.size(o.points);
                    if (typeof o.fade === 'undefined') o.fade = true;
                    t.fader(o.fade);
                    if (typeof o.transform === 'undefined') o.transform = false;
                    t.resize(o.transform);
                    return _;
                }
                return _.PointTrail || _.juice().trail();
            },
            canFade: function () {
                return this.trail().fader();
            },
            canResize: function () {
                return this.trail().resize();
            },
            path: function (i, o) {
                var _ = this;
                if (typeof i === 'number') {
                    if (typeof o === 'object') {
                        _.paths[i] = new J.Path(_, o);
                    }
                    return _.paths[i];
                } else if (typeof i === 'object') {
                    paths = new J.Path(_, i);
                }
                return _.paths || _.juice().paths();
            },
            onDestroy: function () {}
        };
        var extend = function (c) {
            var O = P.prototype,
                C = c.prototype;
            C.setChild = O.setChild;
            C.draw = O.draw;
            C.size = O.size;
            C.color = O.color;
            C.type = O.type;
            C.alpha = O.alpha;
            C.trail = O.trail;
            C.path = O.path;
            C.canFade = O.canFade;
            C.canResize = O.canResize;
            C.onDestroy = O.onDestroy;

        };

        // Round Point Objects
        var nRoundPoint = function (j, data) { //Initialize
            var _ = this,
                d = data || {};
            // Set the parent appropriately
            j.chain(_);
            // Set defaults... the hard way!
            _.size(d.size);
            _.color(d.color);
            _.alpha(d.alpha);
            this.paths = new J.Path(_, d.paths);
            // Possible Siblings Objects Last
            _.trail(d.trail);

            // Return the results            
            return this;
        };
        // Rectangular Point Objects
        var nRectPoint = function (j, data) { //Initialize
            var _ = this,
                d = data || {};
            // Create Linkage
            j.chain(_);

            // Set defaults... the hard way!
            _.size(d.size);
            _.color(d.color);
            _.alpha(d.alpha);
            this.paths = new Juice.Path(_, d.paths);
            // Possible Siblings Objects Last
            _.trail(d.trail);
            // Return the results            
            return _;
        };
        (function (P, C) {
            extend(C);
            C.prototype.render = function (x, y) { //ERROR:No Context
                var _ = this,
                    c2d = _.juice().context(),
                    adj,
                    s = _.size(),
                    a = _.alpha();

                // Initialize
                x = x || 0;
                y = y || 0;

                // Account for Trailing
                if (_.canResize()) {
                    s = s * _.modifier;
                }
                adj = s / 2;
                if (_.canFade()) {
                    a = a * _.modifier;
                }
                c2d.globalAlpha = a;
                // Draw the Point
                c2d.fillStyle = _.color();
                c2d.beginPath();
                c2d.arc(x, y, adj, 0, 360, false);
                c2d.fill();
                c2d.closePath();
            };
        }(P, P.Round = P.Round || nRoundPoint));
        (function (P, R) { //Inherited Functions
            extend(R);
            R.prototype.render = function (x, y) {
                var adj, _ = this,
                    c2d = _.juice().context(),
                    s = _.size(),
                    a = _.alpha();

                // Initialize
                x = x || 0;
                y = y || 0;
                // Account for Trailing
                if (_.canResize()) {
                    s = s * _.modifier;
                }
                adj = s / 2;
                if (this.canFade()) {
                    a = a * _.modifier;
                }
                c2d.globalAlpha = a;
                // Draw the Point
                c2d.fillStyle = _.color();
                c2d.fillRect(x + adj, y + adj, s, s);
            };
        }(P, P.Rect = P.Rect || nRectPoint));
    }(J, J.Point = J.Point || nPoint));

    //Animation Namespace
    (function (J, A) {
        var loop = function (_, f) {
            if (!(_.isStopped)) {
                setTimeout(function () {
                    onRefresh(_, f);
                }, _.RefreshRate);
            }
            return _;
        },
        onRefresh = function (_, f) {
            getFrame(_, f);
            if (++f >= getCacheSize(_)) {
                f = 0;
                _.loops++;
                _.OnLoop(_.loops);
            }
            loop(_, f);
        },
        getFrame = function (_, f) {
            var c2d = _.context();

            c2d.clearRect(0, 0, _.wFull, _.hFull);
            if (_.isCaching()) {
                if (f in _.frames) {
                    c2d.putImageData(_.frames[f], 0, 0);
                } else {
                    _.frames[f] = renderFrame(_, f);
                }
            } else {
                renderFrame(_, f);
            }
        },
        renderFrame = function (_, f) {
            var c2d = _.context(),
                w = _.wFull,
                h = _.hFull;
            $.each(_.points(), function () {
                this.draw(f);
            });
            return c2d.getImageData(0, 0, w, h);
        },
        setDimensions = function (a) {
            a.wFull = a.width() + a.padding() * 2;
            a.hFull = a.height() + a.padding() * 2;
        },
        getCacheSize = function (a) {
            return a.fps() * a.length() / 1e3;
        };
        A.prototype = {
            chain: function (o) {
                if (typeof o !== 'undefined') {
                    var _ = this;
                    o.juice = function () {
                        return _;
                    };
                }
            },
            setChild: function (o) {
                if (typeof o !== 'undefined') {
                    var _ = this;
                    o.parent = function () {
                        return _;
                    };
                    this.chain(o);
                }
            },
            progress: function (f) {
                return f / getCacheSize(this);
            },
            fps: function (n) {
                var r, _ = this;
                if (typeof n === 'number' && n > 0) {
                    _.FPS = n;
                    _.RefreshRate = 1e3 / n;
                    _.frames = [];
                    r = _;
                }
                return r || _.FPS || 30;
            },
            length: function (n) {
                if (typeof n === 'number' && n > 0) {
                    this.len = n;
                    return this;
                }
                return this.len || 1000;
            },
            cache: function (b) {
                if (typeof b === 'boolean') {
                    this.CacheFrames = b;
                } else if (typeof b === 'undefined') {
                    this.CacheFrames = true;
                }
                return this;
            },
            isCaching: function () {
                return this.CacheFrames;
            },
            color: function (s) {
                if (typeof s === 'string') {
                    this.defaultColor = s;
                    return this;
                }
                return this.defaultColor || '#000000';
            },
            alpha: function (n) {
                if (typeof n === 'number') {
                    if (n >= 0 && n <= 1) this.defaultAlpha = n;
                    else if (n > 1) this.defaultAlpha = n / 100;
                    return this;
                }
                return this.defaultAlpha || 1;
            },
            size: function (n) {
                if (typeof n === 'number' && n > 0) {
                    this.defaultSize = n;
                    return this;
                }
                return this.defaultSize || 10;
            },
            width: function (n) {
                if (typeof n === 'number' && n > 0) {
                    this.w = n;
                    setDimensions(this);
                    return this;
                }
                return this.w || 50;
            },
            height: function (n) {
                if (typeof n === 'number' && n > 0) {
                    this.h = n;
                    setDimensions(this);
                    return this;
                }
                return this.h || 50;
            },
            padding: function (n) {
                if (typeof n === 'number' && n >= 0) {
                    this.pad = n;
                    setDimensions(this);
                    return this;
                }
                return this.pad || 0;
            },
            trail: function (o) {
                if (typeof o === 'object') {
                    this.DefaultTrail = new J.Trail(this, o);
                    var t = this.DefaultTrail;
                    t.length(o.length || 500)
                        .size(o.points || 10)
                        .fader(o.fade);
                    t.resize(o.transform);
                    return this;
                }
                return this.DefaultTrail || {};
            },
            context: function (o) {
                if (typeof o === 'object') {
                    this.Context = o;
                    return this;
                }
                return this.Context || null;
            },
            point: function (i, o) {
                if (typeof i === 'object') {
                    this.Points.push(new J.Point(this, o));
                    return this;
                } else if (typeof i === 'number') {
                    if (typeof o === 'object') {
                        this.Points[i] = new J.Point(this, o);
                        return this;
                    }
                    return this.Points[i];
                }
                return this;
            },
            points: function (get) {
                var i, rtn,
                pts = this.Points;
                if (get instanceof Array) {
                    this.Points = [];
                    var num = get.length;
                    for (i = 0; i < num; i++) {
                        this.point(i, get[i]);
                    }
                    return this;
                }
                return this.Points || [{}];
            },

            play: function () {
                console.log(this);
                var _ = this,
                    fps = _.fps();
                // Setup the animation
                _.OnSetup();
                _.loops = 0;
                _.isStopped = false;
                loop(_, 0);
            },
            refresh: function () {
                if (this.CacheFrames) {
                    this.frames = [];
                }
                return this;
            },
            stop: function () {
                this.isStopped = true;
            },
            onSetup: function (f) {
                if (typeof f === 'function') {
                    this.OnSetup = f;
                    return this;
                }
                return this.OnSetup || NIL;
            },
            onLoop: function (f) {
                if (typeof f === 'function') {
                    this.OnLoop = f;
                    return this;
                }
                return this.OnLoop || NIL;
            }
        };
    }(J, J.Animation = J.Animation || function (data) {
        var _ = this,
            d = data || {};
        this.cssID = d.cssID || '';
        this.cssClass = d.cssClass || ns;
        return this.context(d.context || _.context())
            .width(d.w || _.width())
            .height(d.h || _.height())
            .padding(d.padding || _.padding())
            .fps(d.fps || _.fps())
            .length(d.length || _.length())
            .cache(d.cache)
            .size(d.size || _.size())
            .color(d.color || _.color())
            .alpha(d.alpha || _.alpha())
            .trail(d.trail || _.trail())
            .points(d.points || _.points())
            .onSetup(d.onSetup || _.onSetup())
            .onLoop(d.onLoop || _.onLoop());
    }));

    if ($) {
        var NS = 'Juice',
            tmpItems;

        /* Alias - data() */
        var d = function (jq, o) {
            var r;
            if (typeof o === 'object') {
                r = $(jq).data(NS, o);
            } else {
                r = $(jq).data(NS);
            }
            return r;
        },
        /* Alias - instanceof jQuery */
        isQ = function (chk) {
            return chk instanceof $;
        },
        /* Alias - instanceof Juice.Animation */
        isJ = function (chk) {
            return chk instanceof Juice.Animation;
        },
        /* Chain Propagation */
        link = function (items) {
            var tmp = $(items);
            tmp.play = function () {
                return tmp.Juice('play');
            };
            tmp.stop = function () {
                return tmp.Juice('stop');
            };
            tmp.refresh = function () {
                return tmp.Juice('refresh');
            };
            tmp.get = function () {
                return tmp.Juice('get', arguments);
            };
            tmp.set = function () {
                return tmp.Juice('set', arguments);
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

        (function ($, $J, undefined) {
            $J.play = function (jQ) {
                return jQ.Juice('play');
            };
            $J.stop = function (jQ) {
                return jQ.Juice('stop');
            };
        }($, $.Juice = $.Juice || function (list) {
            if (isQ(list)) {
                return link(list);
            }
        }));

        (function (fn, $fJ, undefined) {
            $fJ.methods = {
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
                            d(me, new J.Animation(options));
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
                        var me = d(this);
                        if (isJ(me)) {
                            me.play();
                        }
                    }));
                },
                refresh: function () {
                    var list = jQFind(this, false);
                    return link($.each(list, function () {
                        var me = d(this);
                        if (isJ(me)) {
                            me.refresh();
                        }
                    }));
                },
                stop: function () {
                    var list = jQFind(this, false);
                    return link($.each(list, function () {
                        var me = d(this);
                        if (isJ(me)) {
                            me.stop();
                        }
                    }));
                }
            };
            $fJ.play = function (jQ) {
                return $(jQ).Juice('play');
            };
            $fJ.stop = function (jQ) {
                return $(jQ).Juice('stop');
            };
            $fJ.get = function (jQ) {
                return $(jQ).Juice('get', arguments);
            };
            $fJ.refresh = function (jQ) {
                return $(jQ).Juice('refresh');
            };
        }($.fn, $.fn.Juice = $.fn.Juice || function (method) {
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
        }));
    }
}(window.Juice = window.Juice || function () {}, window.jQuery));
