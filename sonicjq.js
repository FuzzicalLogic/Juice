(function ($) {
/* Convenience variables (Mostly for saving keystrokes)
   ---------------------------------------------------- */
    var namespace = 'Sonic';
    var nil = function(){};
    var tmpItems;

/* Default values for all Sonic(jQ) objects 
   ---------------------------------------------------- */
    var defCanvas = {
        cache:[],
        width:50, height:50, padding:0,
        fps:40, 
        size:10,
        alpha:.9,
        points:[
            {    
                
            }
        ],
        length:1000,
        setup:nil,
        teardown:nil,
        preStep:nil,
        domClass:"Sonic"
    };
    var defPoint = {
        size: 4,
        color:'#000000',
        paths: {
             length:1000,
             name:'line', 
             startX: 1, 
             startY: 1, 
             endX: 1, 
             endY: 1
        }
    };
    var defTrail = {
        length: 500,
        points:15
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
    var paths = {
        bezier: function (data, progress, pt, trail) {
            
            var c2d = data.context,
                path = pt.path,
                adj = pt.size / 2;
                
            var p1x = path.startX,
                p1y = path.startY,
                p2x = path.endX,
                p2y = path.endY,
                cp1x = path.cp1x,
                cp1y = path.cp1y,
                cp2x = path.cp2x,
                cp2y = path.cp2y;
            
            var e = 1 - progress;
                f = 1 - e,
                l = e * e,
                c = f * f,
                h = l * e,
                p = 3 * l * f,
                d = 3 * e * c,
                v = c * f;
                //t, n, r, i, s, o, u, a
                
            var x = h * p1x + p * cp1x + d * cp2x + v * p2x,
                y = h * p1y + p * cp1y + d * cp2y + v * p2y;
                
            c2d.fillRect(x - adj, y - adj, pt.size, pt.size);
        },
        arc: function (data, progress, pt, trail) {
            var c2d = data.context,
                path = pt.path;
            
            var ctrX    = path.ctrX,
                ctrY    = path.ctrY,
                adj     = pt.size / 2,
                r       = path.radius - adj,
                start   = path.start,
                end     = path.end;
                
            var angle = Math.PI * (end + (progress * (start - end))) / 180,
                x = r * Math.sin(angle) + ctrX;// - adj,
                y = r * Math.cos(angle) + ctrY;// - adj;
            //c2d.fillRect(x - adj, y - adj, pt.size, pt.size);
            c2d.beginPath();
            c2d.arc(x,y,adj,0,360,false);
            c2d.fill();
            c2d.closePath();
        },
        line: function (data, progress, pt, trail) {
            var c2d = data.context;
            var path = pt.path;
            var ctrX = path.startX + ((path.endX - path.startX) * progress),
                ctrY = path.startY + ((path.endY - path.startY) * progress),
                adj = pt.size / 2;
            c2d.fillRect(ctrX,
                         ctrY,
                         pt.size,
                         pt.size);
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
                console.log(data);
            var fps = data.fps,
                len = data.length,
                sec = 1e3,
                nFrames = fps * (len / sec);
            data.maxFrames = nFrames;
        // Setup the animation
            data.setup(data);
            data.isStopped = false;
        // Clear the timer, in case of multiple play()s
            if (data.timer)
                clearInterval(data.timer);
        // Begin drawing
            data.timer = setInterval(
                function() {    draw(data);    }, 
                1e3 / fps
            );    
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
    
    var draw = function (data) 
    {   var f = data.frame,
            max = data.maxFrames,
            c2d = data.context,
            cache = data.cache;
    // Init frames
        if (!f) data.frame = 0;
    // Clear the image entirely
        c2d.clearRect(0, 0, data.fullWidth, data.fullWidth);
    // If frame is cached, draw immediately
        if (f in cache)
            c2d.putImageData(cache[f], 0, 0)
    // Otherwise draw the frame manually
        else data.cache[f] = drawFrame(data);
        
    // Increment the frame and store it.
        if (++data.frame >= max) 
            data.frame = 0;
    };
    
    var drawFrame = function (options) 
    {   var f = options.frame,
            c2d = options.context;
    // Image Properties
        var w = options.fullWidth, 
            h = options.fullHeight;
            
        c2d.globalAlpha = options.alpha;
        var pts = 0,
            ptDistance = 0;
        if (options.trail)
        {   pts = options.trail.points + 1;
            ptDistance = (options.trail.length / options.length) / pts;
        }
        var curProgress = f / options.maxFrames;
        var ptProgress, modTrail;
        $.each(options.points, function() {
        for (var pt = 0, a = pts; pt++ < a  && !options.isStopped;)
        {   ptProgress = curProgress - ((a - pt) * ptDistance);
            if (ptProgress < 0)
                ptProgress = ptProgress + 1;
            modTrail = (pt / a);
            c2d.globalAlpha = (pt / a) * options.alpha;
            if (this.color)
            {   c2d.fillStyle = this.color;
                c2d.strokeStyle = this.color;
            }
        // Default to global color
            else
            {   c2d.fillStyle = options.color;
                c2d.fillStyle = options.color;
            }
            //options.preStep();
            if (this.paths)
            {   this.path = this.paths;
                if (typeof this.paths == 'function')
                    this.paths(options, ptProgress, this, modTrail);
                else if (typeof this.paths == 'object')
                {   var doThis = getNamedPath(this.paths.name);
                    if (typeof doThis == 'function')
                        doThis(options, ptProgress, this, modTrail);
                }
            }
        // Default to global Step() function
            else
                options.step(options,ptProgress, this, modTrail);
        }
        });
        //options.teardown();
    // Cache the image
        return c2d.getImageData(0, 0, w, h);
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
            if (options.trail)
                options.trail = $.extend(defTrail,options.trail);
        // Add the new links
            link.play = jQPlay;
            link.stop = jQStop;
            tmpItems = link;
        // Add the loaders
            return $.each(link, function () 
            {//Key savers
                var me = this,
                    $me = $(this),
                    data = $me.data(namespace);
                
            // If the plugin hasn't been initialized yet
                if (!data) 
                {//Clone options and attach to canvas
                    $me.data(namespace, $.extend({}, options));
                // Save Keystrokes
                    data = $me.data(namespace);
                    if (typeof data.step != 'function')
                        data.step = getPathStep(data.path);
                    data.context = me.getContext("2d");
                    data.fullWidth = data.width + 2 * data.padding;
                    data.fullHeight = data.height + 2 * data.padding;
                    data.play = function(){};
                    $me.attr('height', data.fullHeight);
                    $me.attr('width', data.fullWidth);
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
            {   var list = jQFind(options, create);
                list.play = function(){}
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
    $.fn.Sonic.play = function(items) {};

/* Helper Methods
   ---------------------------------------------------- */
/* Finds the Sonic objects in the given list. */
    var jQFind = function(items, addMissing)
    {   var list = [];
        items.each(function()
        {   if($(this).prop('tagName') != 'CANVAS')
            {   if (addMissing)
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
    
    var getNamedPath = function(name)
    {   if (name)
        {   if (name == 'line')
                return paths.line;
            else if (name == 'arc')
                return paths.arc;
            else if (name == 'bezier')
                return paths.bezier;
        }
    }
    
    var getPathStep = function(path)
    {
        
    };
}(jQuery));
