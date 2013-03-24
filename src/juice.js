(function (J, $, undefined) {
    "use strict";
    /* Convenience variables (Mostly for saving keystrokes)
   ---------------------------------------------------- */
    var ns = 'Juice',
        NIL = function () {};

    (function (J, T) {
        T.prototype = {
            fader: function (b) {
                if (typeof b === 'boolean') {
                    this.fade = b;
                    return this;
                }
                
                if (typeof this.fade === undefined)
                    if (!(this.parent() instanceof Juice.Animation))
                        if (this.juice().trail().fade === undefined)
                            {return this.juice().trail().fade;}
                return this.fade;
            },
            resize: function (b) {
                var r, _ = this;
                if (typeof b === 'boolean') {
                    _.transform = b;
                    r = _;
                }
                if (_.transform === undefined) {
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

    var pathProgression = [];
    pathProgression['line'] = function (p, pt) {
        var _ = this,
            x = _.x1 + ((_.x2 - _.x1) * p),
            y = _.y1 + ((_.y2 - _.y1) * p);
        pt.render(x, y);
    };
    pathProgression['arc'] = function (progress, pt) {
        var _ = this,
            x = _.x,
            y = _.y,
            adj = pt.size() / 2,
            r = _.r - adj,
            start = _.start,
            end = _.end,
            angle = (Math.PI * (((end - start) * progress) + start) / 180) - Math.PI / 2;
        x = r * Math.cos(angle) + x;
        y = r * Math.sin(angle) + y;
        pt.render(x, y);
    };
    pathProgression['ellipse'] = NIL;
    pathProgression['bezier'] = function (p, pt) {
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

    var pathInit = [];
    pathInit['line'] = function (p, data) {
        var _ = this,
            d = data || {},
            w = _.juice().width(),
            h = _.juice().height();
        _.length = d.length || 'auto';
        _.x1 = d.x1 || 0 + p.size() / 2;
        _.y1 = d.y1 || h / 2;
        _.x2 = d.x2 || w - p.size() / 2;
        _.y2 = d.y2 || h / 2;
        return _;
    };
    pathInit['arc'] = function (p, data) {
        var _ = this,
            d = (data || {}),
            w = _.juice().width(),
            h = _.juice().height();
        _.length = d.length || 'auto';
        _.x = d.x || w / 2;
        _.y = d.y || h / 2;
        _.r = d.r || (w > h ? w / 2 : h / 2);
        _.start = d.start || 0;
        _.end = d.end || 360;
        return _;
    };
    pathInit['ellipse'] = function (p, data) {
        _.length = d.length || 'auto';
        return this;
    };
    pathInit['bezier'] = function (p, data) {
        p.setChild(this);
        var _ = this,
            d = data || {};
        _.length = d.length || 'auto';
        _.startX = d.startX;
        _.startY = d.startY;
        _.endX = d.endX;
        _.endY = d.endY;
        _.cp1x = d.cp1x;
        _.cp1y = d.cp1y;
        _.cp2x = d.cp2x;
        _.cp2y = d.cp2y;
        return _;
    };
    (function (J, P) {

    }
    (J, J.Path = J.Path || function (p, data) {
        p.setChild(this);
        var _ = this,
            d = data || {},
            w = _.juice().width(),
            h = _.juice().height();

        _.name = d.name || '';
        _.init = pathInit[_.name];
        _.init(p, data);
        _.draw = pathProgression[_.name];
        return _;
    }));


    var ptRender = [];
    ptRender['rect'] = function (x, y) {
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
        c2d.fillRect(x - adj, y - adj, s, s);
    };
    ptRender['round'] = function (x, y) {
        var _ = this,
            adj,
            c2d = _.juice().context(),
            s = _.size(),
            a = _.alpha();

        x = x || 0;
        y = y || 0;

        if (_.canResize()) {
            s = s * _.modifier;
        }
        if (_.canFade()) {
            a = a * _.modifier;
        }
        adj = s / 2;

        c2d.globalAlpha = a;
        // Draw the Point
        c2d.fillStyle = _.color();
        c2d.beginPath();
        c2d.arc(x, y, adj, 0, 360, false);
        c2d.fill();
        c2d.closePath();
    };
    (function (J, P) {
        var liquidate = function (pt) {
            var V = pt.paths(),
                iV = 0,
                nV = V.length,
                tV = 0,
                tMax = pt.juice().length(),
                tR = tMax,
                nAuto = 0;
            // Get all Path Lengths - (Absolutes FIRST)
            for (iV = 0; iV < nV && tR > 0; iV++) {
                tV = V[iV].length || 'auto';
                if (typeof tV === 'number') {
                    if (tV > tR) {
                        tV = tR;
                    }
                    tR = tR - tV;
                    V[iV].EndAt = tV / tMax;
                } else if (tV === 'auto') {
                    nAuto = nAuto + 1;
                }
            }
            // Automatics Next
            for (iV = 0; iV < nV && nAuto > 0 && tR > 0; iV++) {
                if (!V[iV].EndAt) {
                    V[iV].EndAt = (tR / nAuto) / tMax;
                }
            }

            var tmp = 0;
            for (iV = 0; iV < nV; iV++) {
                V[iV].EndAt = V[iV].EndAt + tmp;
                tmp = V[iV].EndAt;
            }
        },
        findCorrectPath = function (pt, time) {
            var V = pt.paths(),
                iV, nV = V.length,
                stop, r;
            // Quick Security Scan
            for (iV = 0; iV < nV; iV++)
            if (!V[iV].EndAt) liquidate(pt);

            for (iV = 0; iV < nV && !stop; iV++) {
                if (time <= V[iV].EndAt) stop = true;
            }
            if (stop) {
                if (iV == 0) {
                    r = iV;
                } else if (iV > 0) {
                    if (time > V[iV - 1].EndAt) {
                        r = iV;
                    } else {
                        r = iV - 1;
                    }
                }
            }
            return r;
        };
        P.prototype = {
            setChild: function (o) {
                if (o !== undefined) {
                    var _ = this;
                    o.parent = function () {
                        return _;
                    };
                    _.juice().chain(o);
                }
            },
            draw: function (pA) {
                var _ = this,
                    iPt, tPt = 0,
                    nTPts = _.trail().size()+1,
                    tMax = _.juice().length(),
                    dTPts = (_.trail().length() / tMax) / nTPts,
                    V = _.paths(),
                    nV = V.length,
                    useV;

                for (iPt = 0; iPt < nTPts; iPt++) {
                    _.modifier = (nTPts -iPt) / nTPts;
                    tPt = pA - iPt * dTPts;
                    // Align the Point...
                    if (tPt <= 0) {
                        tPt = tPt + 1;
                    }
                    if (tPt > 1) {
                        tPt = tPt - 1;
                    }

                    // Draw here...
                    useV = findCorrectPath(this, tPt);
                    var tPath;
                    if (useV == 0 && nV == 1) {
                        tPath = tPt;
                    } else if (useV == 0 && nV > 1) {
                        tPath = tPt / V[useV].EndAt;
                    } else if (useV > 0) {
                        tPath = (tPt - V[useV - 1].EndAt) / (V[useV].EndAt - V[useV - 1].EndAt);
                    }
                    V[useV].draw(tPath, _);
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
                    t.fader(o.fade);
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
                var r, p, _ = this;
                if (typeof i === 'object') {
                    _.Paths.push(new Juice.Path(_, i));
                    r = _;
                } else if (typeof i === 'number') {
                    if (typeof o === 'object') {
                        _.Paths[i] = new Juice.Path(_, o);
                        r = _;
                    } else {
                        r = _.Paths[i];
                    }
                } else {
                    r = _;
                }
                return r;
            },
            paths: function (o) {
                var i, r,
                _ = this;
                if (o instanceof Array) {
                    _.Paths = [];
                    var num = o.length;
                    for (i = 0; i < num; i++) {
                        _.path(i, o[i]);
                    }
                    r = _;
                } else if (typeof o === 'object') {
                    _.Paths = [];
                    _.path(o);
                    r = _;
                } else {
                    r = _.Paths
                }
                return r;
            },
            onDestroy: function () {}
        };
    }(J, J.Point = J.Point || function (A, data) {
        var _ = this,
            d = data || {};
        A.chain(_);

        _.type = d.type || 'rect';
        _.render = ptRender[_.type] || NIL;
        _.size(d.size);
        _.color(d.color);
        _.alpha(d.alpha);
        _.paths(d.paths);
        _.trail(d.trail);
        return _;
    }));

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
                h = _.hFull,
                p = _.progress(f);

            var n = _.points().length;
            for (var i = 0; i < n; i++) {
                _.point(i).draw(_.progress(f));
            }
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
                if (o !== undefined) {
                    var _ = this;
                    o.juice = function () {
                        return _;
                    };
                }
            },
            setChild: function (o) {
                if (o !== undefined) {
                    var _ = this;
                    o.parent = function () {
                        return _;
                    };
                    this.chain(o);
                }
            },
            progress: function (f) {
                return (f + 1) / getCacheSize(this);
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
                } else if (b === undefined) {
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
                        .size(o.points || 10);
                    if (o.fade === undefined)
                        t.fader(true);
                    else t.fader(o.fade);
                    if (o.transform === undefined)
                        t.resize(false);
                    else t.resize(o.transform);
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
            } else if (method === undefined) {
                r = link(this);
            }
            return r;
        }));
    }
}(window.Juice = window.Juice || function () {}, window.jQuery));