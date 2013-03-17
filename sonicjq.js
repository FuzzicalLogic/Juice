(function ($) {
/* Convenience variables (Mostly for saving keystrokes)
   ---------------------------------------------------- */
    var namespace = 'Sonic';
    var nil = function(){};
    var tmpItems;
/* Default values for all Sonic(jQ) objects 
   ---------------------------------------------------- */
    var defCanvas = {
        width:0, height:0, padding:0,
        fps:25, stepsPerFrame:1,
        cache:[],
        multiplier:1,
        trailLength:1,
        pointDistance:.05,
        points:[],
        path:[ 
            ['line', 1, 1, 1, 1] 
        ],
        fillColor:"#FFF", strokeColor:"#FFF",
        setup:nil,
        teardown:nil,
        preStep:nil,
        domClass:"Sonic"
    };
    var defPoint = {
        path:[
            ['line', 1, 1, 1, 1]
            ],
        fillColor:"#FFF", strokeColor:"#FFF",
    };


    var n = argTypes = {
        DIM: 1,
        DEGREE: 2,
        RADIUS: 3,
        OTHER: 0
    };
    var r = argSignatures = {
        arc: [1, 1, 3, 2, 2, 0],
        bezier: [1, 1, 1, 1, 1, 1, 1, 1],
        line: [1, 1, 1, 1]
    };
    var i = pathMethods = {
        bezier: function (e, t, n, r, i, s, o, u, a) {
            e = 1 - e;
            var f = 1 - e,
                l = e * e,
                c = f * f,
                h = l * e,
                p = 3 * l * f,
                d = 3 * e * c,
                v = c * f;
            return [h * t + p * s + d * u + v * r, h * n + p * o + d * a + v * i]
        },
        arc: function (e, t, n, r, i, s) {
            var o = (s - i) * e + i;
            var u = [Math.cos(o) * r + t, Math.sin(o) * r + n];
            u.angle = o;
            u.t = e;
            return u
        },
        line: function (e, t, n, r, i) {
            return [(r - t) * e + t, (i - n) * e + n]
        }
    };
    var s = stepMethods = {
        square: function (e, t, n, r, i) {
            r.fillRect(e.x - 3, e.y - 3, 6, 6)
        },
        fader: function (e, t, n, r, i) {
            r.beginPath();
            if (this._last) {
                this._.moveTo(this._last.x, this._last.y)
            }
            r.lineTo(e.x, e.y);
            r.closePath();
            r.stroke();
            this._last = e
        }
    };

/* Actual Working Methods for the jQuery Plugin
   ---------------------------------------------------- */
/* Plays the list of Sonic Canvases. */
    var jQPlay = function(items)
    {   if (typeof items == 'undefined')
            items = tmpItems;
        return $.each(items, function () {
            var $me = $(this),
                data = $me.data(namespace);
        // Set flag
            data.isStopped = false;
        // Clear the timer, in case of multiple play()s
            if (data.timer)
                clearInterval(data.timer);
        // Begin drawing
            data.timer = setInterval(function() {draw(data.context, data);}, 1e3 / data.fps);    
        });
    };
    
/* Stops the list of Sonic Canvases. */
    var jQStop = function(items)
    {   console.log('Stopping all animations!');
        list.each(function(){
            var $me = $(this),
                data = $me.data(namespace);
            data.isStopped = true;
        });
    };
    
    var draw = function (context, data) 
    {   if (!prep(context, data, data.frame)) {
            context.clearRect(0, 0, data.fullWidth, data.fullWidth);
            context.putImageData(data.imageData[data.frame], 0, 0)
        }
        nextFrame(data);
    };
    
    var setup = function(options) {
        var e, t, s, o, u = options.path;
        options.points = [];
        for (var a = -1, f = u.length; ++a < f;) {
            e = u[a].slice(1);
            s = u[a][0];
            if (s in r) for (var l = -1, c = e.length; ++l < c;) {
                t = r[s][l];
                o = e[l];
                switch (t) {
                    case n.RADIUS:
                        o *= options.multiplier;
                        break;
                    case n.DIM:
                        o *= options.multiplier;
                        o += options.padding;
                        break;
                    case n.DEGREE:
                        o *= Math.PI / 180;
                        break
                }
                e[l] = o
            }
            e.unshift(0);
            for (var h, p = options.pointDistance, d = p; d <= 1; d += p) {
                d = Math.round(d * 1 / p) / (1 / p);
                e[0] = d;
                h = i[s].apply(null, e);
                options.points.push({
                    x: h[0],
                    y: h[1],
                    progress: d
                })
            }
        }
    };
    var prep = function (context, options, frame) 
    {//Check our image Cache
        if (frame in options.imageData) 
            return;
        context.clearRect(0, 0, options.fullWidth, options.fullHeight);
        var t = options.points,
            n = t.length,
            r = options.pointDistance,
            i, s, o;
            options.setup(options);
        
        for (var u = -1, a = n * options.trailLength; ++u < a && !options.isStopped;) {
            s = frame + u;
            i = t[s] || t[s - n];
            if (!i) continue;
            options.alpha = Math.round(1e3 * (u / (a - 1))) / 1e3;
            context.globalAlpha = options.alpha;
            context.fillStyle = options.fillColor;
            context.strokeStyle = options.strokeColor;
            o = frame / (options.points.length - 1);
            indexD = u / (a - 1);
            options.preStep(i, indexD, o);
            options.stepMethod(i, indexD, o, context);
        }
        options.teardown();
        options.imageData[frame] = context.getImageData(0, 0, options.fullWidth, options.fullHeight);
        return true;
    };
    
    var nextFrame = function (options) {
        options.frame += options.stepsPerFrame;
        if (options.frame >= options.points.length) {
            options.frame = 0
        }
    };
    
/* jQuery Methods
   ---------------------------------------------------- */
/* These methods simply point to the appropriate working 
   methods.
*/
    var methods = {
        init: function (options) {
            var jQ = $,
                link = jQFind(this, true);
        // Default Settings... so that Sonic always works
            options = $.extend(defCanvas,options);
        // Add the new links
            link.play = jQPlay;
            link.stop = jQStop;
            tmpItems = link;
        // Add the loaders
            return $.each(link, function () {
                var me = this,
                    $me = $(this);
                
                var data = $me.data('Sonic');
                // If the plugin hasn't been initialized yet
                if (!data) {
                // Attach the data to the element
                    $me.data('Sonic', options);
                // Save Keystrokes
                    data = $me.data('Sonic');
                    data.stepMethod = typeof data.step == "string" ? s[data.step] : data.step || s.square;
                    data.context = me.getContext("2d");
                    data.fullWidth = data.width + 2 * data.padding;
                    data.fullHeight = data.height + 2 * data.padding;
                    data.play = function(){console.log('My data just got played');};
                    data.imageData = [];
                    $me.attr('height', data.fullHeight);
                    $me.attr('width', data.fullWidth);
                    data.frame = 0
                    setup(data);
                }
            });
        },
        play: function () {
            console.log('jQuery just played me');
            var list = jQFind(this, false);
            return jQPlay(list);
        },
        stop: function () { 
            console.log('jQuery just played me');
            var list = jQFind(this, false);
            return jQStop(list);
        },
        play: function(){}
    };
    
// Creates and Returns a new Sonic Canvas
    $.Sonic = function(options, create) {
        console.log(options instanceof $);
        if (typeof options == 'object')
        {   if (options instanceof $)
            {   console.log('Adding links to Chain');
                var list = jQFind(options, create);
                list.play = function(){console.log('We just got played');}
                return list;
            }
            else 
            {   options = $.extend(defCanvas,options);
                var me = document.createElement('canvas');
                $(me).addClass(options.domClass);
                $(me).data(namespace, options);
                return $(me);
            }
        }
    };
   
    
    $.fn.Sonic = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.tooltip');
        }
    };
    $.fn.Sonic.play = function(items) {console.log('You just played some jQ Sonics');};

/* Helper Methods
   ---------------------------------------------------- */
/* Finds the Sonic objects in the given list. */
    var jQFind = function(items, addMissing)
    {   var list = [];
        console.log(addMissing);
        var addNew = addMissing;
        items.each(function()
        {   if($(this).prop('tagName') != 'CANVAS')
            {   console.log(addMissing);
                if (addNew)
                {   var a = document.createElement('canvas');
                    $(a).addClass('Sonic');
                    $(this).prepend($(a));
                    list.push(a);
                }
            }
            else list.push(this);
        });
        return list;
    };
}(jQuery));
