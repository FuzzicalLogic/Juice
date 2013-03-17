## Sonic(jQ) Plugin

Sonic(jQ) uses the HTML5 Canvas to allow dynamic, fluid loading animations without requiring animated GIFs. With the addition of the HTML5shiv, Sonic(jQ) is able to perform reliably on most browsers. Without HTML5shiv, Sonic(jQ) works natively on IE9+, Firefox, Chrome, Safari and Opera, with or without jQuery.

Sonc(jQ) is a complete rework of [Sonic.js](https://github.com/padolsey/Sonic). The primary goal of this redesign was to take advantage of the usability of the jQuery framework without making it a dependency. Secondary goals included providing more consistent expected behavior and reducing the overall amount of code required to begin using Sonic as a whole.

See the [Change Log](https://github.com/FuzzicalLogic/Sonic-jQ-Plugin/blob/master/changelog.md) for milestones and roadmap.

### Usage

Currently, the plugin requires jQuery (tested with 1.9+). 

#### jQuery Commands

    $('css').Sonic({options})
    
Create a loading animation and play immediately.

    $('selector').Sonic({options}).play();

This will create, or retrieve a canvas object (if one is not already provided) within each item in the $() jQuery. For chainability, you may then .play() or .stop() the animation. 

#### Non-jQuery Commands _(in development)_

If jQuery is not included, Sonic(jQ) works within its own Sonic namespace and works similarly to [Sonic.js](https://github.com/padolsey/Sonic). There are some significant differences, however, to improve usability.

### Sonic(jQ) Options

All options are optional and Sonic(jQ) may be run without typing a single line. It should be mentioned that it will be a very boring animation. Options should be in JSON format. In order to make the coolest animations, it is best to get familiar with the conifiguration options and [objects](#sonicjq-objects) that can be set. 

#### Canvas Style/Formatting Options

* `width        (100)` - Sets the width of the Canvas.
* `height       (100)` - Sets the height of the Canvas.
* `padding        (0)` - Sets the padding of the Canvas.
* `cssClass ('Sonic')` - Sets the CSS Class(es) of the Canvas.
* `cssID         ('')` - Sets the CSS ID of the Canvas. *(Ignored when creating multiple animations)*
* `style         ('')` - Sets the inline style of the Canvas.

#### Drawing Options

* `color ('#000000')` - Sets the drawing color (in fill mode) for the canvas.


#### Animation Options

* `fps       (25)` - Sets the refresh rate for the animation.
* `length  (1000)` - The length (in msec) of the animation.
* `setup  (empty)` - Sets the function that sets up the canvas before rendering a frame.
* `step   (empty)` - Sets the function for stepping through frames within the animation. See [Step Functions](#Step Functions) 

### Sonic(jQ) Objects

#### Trail Objects

A Trail Object may be placed in the [Sonic(jQ) Options](#sonicjq-options) or within a given [Point Object](#point-objects) in the `points` array. If placed in the Options, all points without a Trail Object will use the one in the Options. If no trail is desired, you may use the string 'none' (trail: 'none').

##### Options

* `length (500)` - The amount of time (in msec) to follow the point
* `points  (10)` - The number of points within the trail.

##### Example

    trail: {
        length: 500,
        points: 10
    },
    
#### Point Objects

These objects are placed into the `points` array, enabling each point to have their own configuration. This allows every point to be rendered in a completely different way. This even lends the ability for each point to follow their own path (or paths). All Point options, if omitted, will fallback to same named settings in the Global Options.

##### Options

* `type` - __(not yet implemented)__ `round` or `rect`. Only works with a standard path.
* `size   (5)` - The size of the point. 
* `color` - The color of the point in HTML hex notation. _(Ex: '#FFFFFF')_ 
* `alpha  (1)` - The alpha of the point. 
* `offset (0)` - __(not yet implemented)__ offset for path calculation, in msec. 
* `paths     ` - [Path Object](#path-objects), or an array of Path Objects. 
* `trail     ` - [Trail Object](#trail-objects) definition.

##### Example

    points: [
        {   
            size: 4,
            // Will use Global offset, if present
            color: '#342FCD'
            alpha: .5,
            paths: function(data, ptP, ptTrail, pt) {
                ... custom code
            }
            // Will use Global Trail, if present
        },
        {
            size: 6,
            offset: 125,
            // Will use Global color, if present
            // Will use Global alpha, if present
            // Will use Global paths, if present
            trail: {
                length: 250,
                points: 15
            }
        }
    ],
    
#### Path Objects __(not yet implemented)__

##### Options

* `length` - The amount of time, in msec, the point will use this path.
* `path` - A valid path array or custom [Path Function](#path-functions)

### Advanced Usage

#### Setup Function

The setup function allows for specialized programming and calculations before drawing even begins. It only has one argument, `options`, which gives the function the ability to view all options. This is an optimal place to pre-calculate values that are used often, but might be constant, given specific parameters.

For instance, imagine an custom elliptical path function that scales with the canvas size. You might prefer to calculate the center and ratios prior to the actual animation to save processing. Once these are calculated, you can store them in the `options` for use by your path. Here's an example:

    setup: function(options) {
    // Calculate Centers based on dimensions
        var ctrX = (options.width - options.size) / 2,
            ctrY = (options.height - options.size) / 2;
    // Calculate Width and Height Adjustments for ellipse
        var modW = ctrX / 2,
            modH = ctrY / 4;
            
    // Store values in the options
        options.centerX = ctrX;
        options.centerY = ctrY;
        options.adjustX = modX;
        options.adjustY = modY;
    },

#### Path Functions

Path Functions allow you to program a custom path for each and every point. Each path will have its own progress indicator and will receive the current point (and trailpoints if trails are active). Below is the signature for a Path Function.

    path: function(data, progress, pt, trail) {
        ... add code here ...
    },

* `data    ` - the [Options Object](#options)
* `progress` - the percentage (in decimal form) of the point's progress along the path (modified by the trail for convenience).
* `pt      ` - The point object from the options.
* `trail   ` - the percentage (in decimal form) of the trail's completion.

##### Drawing in a Path Function

To draw during the path function, don't forget to grab the [Context2D](http://www.w3.org/html/wg/drafts/2dcontext/html5_canvas/) from the `data` argument. After you have the context, you may utilize the context's drawing methods to draw upon the canvas. It is important to note that `data` is the entire [Options Object](#options). Avoid setting any values here, but feel free to grab and use any values that it provides. 

#### Step Functions

Step Functions in Sonic(jQ) are significantly different from the sonic.js Step Functions. One major difference is that Step Functions are attached to the animation's total progress. This function fires before any paths have been drawn, but after the frame has been initialized. In general, if using [multiple points](#point-objects), you consider using [Path Functions](#path-functions) instead. Below is the signature for a step function.

    step: function(data, progress) {
        ... add code here
    }

* `data    ` - the [Options Object](#options)
* `progress` - the percentage of the animation's completion.

##### Drawing in a Step Function

To draw during the step function, don't forget to grab the [Context2D](http://www.w3.org/html/wg/drafts/2dcontext/html5_canvas/) from the `data` argument. After you have the context, you may utilize the context's drawing methods to draw upon the canvas. It is important to note that `data` is the entire [Options Object](#options). Avoid setting any values here, but feel free to grab and use any values that it provides. 

##### Example with Shrinking Trailpoints

    step: function(data, progress, trail) {
        var c2d = data.context;

        var size;
        if (data.size)
            size = size * trail;
        if (data.color)
            c2d.fillStyle = data.color;
            
        c2d.beginPath();
        c2d.fillArc(data.width * progress, data.height * progress, 0, 360);
        c2d.closePath();
    }
    
### Note: Differences from Sonic.js

Sonic.js assumed and tracked a single point (and its trail points) along a single progression. In order to accomplish what Sonic(jQ) accomplishes naturally, one had to create a custom `step()` function that manually drew each additional point. In order to get the best use from Sonic(jQ), think of each point object as a sonic.js instance. While this does not accurately illustrate the differences, it should be sufficient for most situations. 

#### Trailing Points

In Sonic(jQ), trails are handling almost automatically. Simply add a [Trail Object](#trail-objects) either to the Options or to a [Point Object](#point-objects).

### Road Map for Development

The road to completion requires significant changes to the way the original Sonic.js worked. In keeping with jQuery's philosophy, focus should instead be on the HTML Canvas Element rather than the Sonic object itself. The Sonic object should be attached to the Canvas, rather than the other way around. Due to jQuery's focus on HTMLElements, each Sonic animation must be able to be retrieved and played by reading the Canvas's data (via `.data()`).

#### 1. Complete Chaining to allow the following Syntaxes:

* jQuery object

    `$.Sonic({options}).appendTo('selector').play();     // Currently nonfunctional.`
    `$.Sonic('play', {options});                         // Currently nonfunctional.`
    
* jQuery Selections

    `$('selector').Sonic({options}).Sonic('play');       // Currently nonfunctional.`
    `$('selector').add($.Sonic({options})).play();       // Currently nonfunctional.`
    `$('selector').prepend($.Sonic('play',{options}));   // Currently nonfunctional.`

* Non-jQuery

    `domNode.appendChild(Sonic({options}).play());`
    

