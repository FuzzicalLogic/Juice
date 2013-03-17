## Sonic(jQ) Plugin

Sonic(jQ) uses the HTML5 Canvas to allow dynamic, fluid loading animations without requiring animated GIFs. With the addition of the HTML5shiv, Sonic(jQ) is able to perform reliably on most browsers. Without HTML5shiv, Sonic(jQ) works natively on IE9+, Firefox, Chrome, Safari and Opera, with or without jQuery.

Sonc(jQ) is a complete rework of [Sonic.js](https://github.com/padolsey/Sonic). The primary goal of this redesign was to take advantage of the usability of the jQuery framework without making it a dependency. Secondary goals included providing more consistent expected behavior and reducing the overall amount of code required to begin using Sonic as a whole.

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

    width (default:100)
Sets the width of the Canvas.

    height (default:100)
Sets the height of the Canvas.

    padding (default:0)
Sets the padding of the Canvas.

    cssClass (default:'Sonic')
Sets the CSS Class(es) of the Canvas.

    cssID (default:'')
Sets the CSS ID of the Canvas. *(Ignored when creating multiple animations)*

    style (default:'')
Sets the inline style of the Canvas.

#### Drawing Options

    color (default:'#000000')
Sets the drawing color (in fill mode) for the canvas.


#### Animation Options

    fps (default:25)
Sets the refresh rate for the animation.

    length (default:1000)
The length (in milliseconds) of the animation.

    setup (default:empty)
Sets the function that sets up the canvas before rendering a frame.

    preStep (default:empty)
Sets the function that runs before every `step()` is drawn.
    
    step (default:line)
Sets the function for stepping through frames within the animation. See [Step Functions](#Step Functions) 

    path (default:[ ['line', 1, 1, 1, 1] ])
Sets the path for the animation. See the section [Animation Paths](#Animation Paths) *(soon Changing)*

### Sonic(jQ) Objects

#### Trail Objects

A Trail Object may be placed in the [Sonic(jQ) Options](#sonicjq-options) or within a given [Point Object](#point-objects) in the `points` array. If placed in the Options, all points without a Trail Object will use the one in the Options. If no trail is desired, you may use the string 'none' (trail: 'none').

##### Options

* `length` - The amount of time (in msec) to follow the point
* `points` - The number of points within the trail.

##### Example

    trail: {
        length: 500,
        points: 10
    },
    
#### Point Objects

These objects are placed into the `points` array, enabling each point to have their own configuration. This allows every point to be rendered in a completely different way. This even lends the ability for each point to follow their own path (or paths). All Point options, if omitted, will fallback to same named settings in the Global Options.

##### Options

* `type` - __(not yet implemented)__ `round` or `rect`. Only works with a standard path.
* `size` - The size of the point. 
* `color` - The color of the point in HTML hex notation. _(Ex: '#FFFFFF')_ 
* `alpha` - The alpha of the point. 
* `offset` - __(not yet implemented)__ offset for path calculation, in msec. 
* `paths` - [Path Object](#path-objects), or an array of Path Objects. 
* `trail` - [Trail Object](#trail-objects) definition.

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

#### Path Functions

#### Step Functions

Step Functions in Sonic(jQ) are significantly different from the sonic.js Step Functions. One major difference is that Step Functions are attached to the animation's total progress. In general, if using [multiple points](#point-objects), you consider using [Path Functions](#path-functions) instead. Below is the signature for a step function.

    step: function(data, progress, trail) {
        ... add code here
    }

* `data` is the [Options Object](#options)
* `progress` _(.01 to 1.00)_ represents the percentage of the animation's completion (modified by the trail for convenience).
* `trail` _(.01 to 1.00)_ represents the current percentage of the trail's completion.

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
    
#### Trailing Points

In Sonic(jQ), trails are handling almost automatically. Simply add a [Trail Object](#trail-objects) either to the Options or to a [Point Object](#point-objects).

### Note: Differences from Sonic.js

Sonic.js assumed and tracked a single point (and its trail points) along a single progression. In order to accomplish what Sonic(jQ) accomplishes naturally, one had to create a custom `step()` function that manually drew each additional point. In order to get the best use from Sonic(jQ), think of each point object as a sonic.js instance. While this does not accurately illustrate the differences, it should be sufficient for most situations. 

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
    
### Completed Milestones

* (3/17/2013) Added User Object
    * Accessed in options.user
* (3/17/2013) Added Point Object
    * Support for distinct paths (falls back to step)
    * Support for distinct trail object (falls back to global)
    * Support for distinct size, color and alpha (falls back to global)
* (3/17/2013) Added Trail Object
    * Added default values
* (3/16/2013) Changed/Optimized the way Trails are rendered.
    * `trailLength` is now measured in millseconds.
    * `trailPoints` is now the number of points along the trail.
    * `pointDistance` is now obsolete. 
    Point Distance is now automatically calculated using the following formula: `((Trail Length)/(Animation Length))/(Num of Trail Points)`.
    * Pre-stepping is no longer required to cache point positions.
* (3/16/2013) Changed to FPS/Length model from FPS/StepsPerFrame model
    * FPS no longer affects animation speed.
    * StepsPerFrame is deprecated.
    * Frame is no longer sent to `step()` function. 
    * `Step()` signature has changed. Step now receives the following parameters:
        * `context`  - The `2DContext` for the HTML Canvas.
        * `progress` - Point's progress along the current path. 
        * `options`  - Giving access to all user set options. See [User Options](#User Options) for full details...
    * `Step()` is still used to paint the trail.
    * Image Caching has changed: The number of Frames cached = (Animation Length / 1 second) * FPS
* (3/14/2013) Allow Sonic to differentiate between jQuery and Options objects.
* (3/14/2013) Change returns and actions to the Canvas HTMLElement.
* (3/14/2013) Add better default handling. All options are optional. This allows Sonic to play a very uninteresting line animation.
* (3/13/2013) Add data object to the Canvas HTMLElement.
