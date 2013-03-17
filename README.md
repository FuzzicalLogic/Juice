## Sonic(jQ) Plugin

Sonic(jQ) uses the HTML5 Canvas to allow dynamic, fluid loading animations without requiring animated GIFs. With the addition of the HTML5shiv, Sonic(jQ) is able to perform reliably on most browsers. Without HTML5shiv, Sonic(jQ) works natively on IE9+, Firefox, Chrome, Safari and Opera, with or without jQuery.

Sonc(jQ) is a complete rework of [Sonic.js](https://github.com/padolsey/Sonic). The primary goal of this redesign was to take advantage of the usability of the jQuery framework without making it a dependency. Secondary goals included providing more consistent expected behavior and reducing the overall amount of code required to begin using Sonic as a whole.

#### Current Usage (with jQuery)

    $('css').Sonic({options})
    
Create a loading animation and play immediately.

    $('selector').Sonic({options}).play();

This will create, or retrieve a canvas object (if one is not already provided) within each item in the $() jQuery. For chainability, you may then .play() or .stop() the animation. 

#### Usage (without jQuery)

If jQuery is not included, Sonic(jQ) works within its own Sonic namespace and works similarly to [Sonic.js](https://github.com/padolsey/Sonic). There are some significant differences, however, to improve usability.

* All options are optional now

### Sonic(jQ) Options

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

    fillColor (default:'#000000')
Sets the drawing color (in fill mode) for the canvas.

    strokeColor (default:'#000000')
Sets the drawing color (in stroke mode) for the canvas.

    trailLength (default:500)
Sets the length (in milliseconds) of trail points in the animation.

    trailPoints (default:5)
Sets the distance between points in the animation.

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
    
#### 2. Multiple Particles

Currently, Sonic keeps `points` as an array of "stops" for a given animation. Handling multiple points requires a special `step()` function. Additionally, Sonic assumes all `path`s run given a single animated point. In order to facilitate simpler use, this plugin will move to a `particle`s model:

Each `particle` will have its own `path`, `fillcolor`, `strokecolor`, `alpha`, and `length`. For special function, each `particle` may also have its own `step()` function. 

The above will necessitate changes to Sonic(jQ) in the following ways:

The `step()` function will cycle through all `particle`s and run their `step()`s. Image Caching cannot occur without including all `particle`s. The options `fps` and `length` shall determine the overall imaging behavior. The `length` of a given particle will only be used to determine how the HTML Canvas will render it in its frames.
    
### Completed Milestones

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
