## Change Log

### Version 0.0

##### 3/18/2013
* Completed Point Object
    * Can only be created by a Juice.Animation
    * Added individualize Trails
    * instanceof = Juice.Point
* Completed Animation Object
    * Stored in the Canvas data.
    * instanceof = Juice.Animation
* Completed Path Object
    * instanceof = Juice.Path
    * Attached to Juice.Points at creation.
* Completed Trail Object
    * Attached (w/ defaults) to Juice.Animation.
    * May be Attached to Juice.Points
    * Missing properties in a Point Trail will defer to Animation Trails
    * Added options: 
        * `fade` - points in trail to fade away
        * `transform` - points in trail get progressively smaller
* Fixed Chaining for $().Juice() functions
    * $.('selector').Juice.play() now works.
    * $.('Selector').Juice().play() now works.
    * $.Juice('selector').play() now works.

##### 3/17/2013
* Added User Object
    * Accessed in options.user
* Added Point Object
    * Support for distinct paths (falls back to step)
    * Support for distinct trail object (falls back to global)
    * Support for distinct size, color and alpha (falls back to global)
* Added Trail Object
    * Added default values

##### 3/16/2013
* Changed/Optimized the way Trails are rendered.
    * `trailLength` is now measured in millseconds.
    * `trailPoints` is now the number of points along the trail.
    * `pointDistance` is now obsolete. 
    Point Distance is now automatically calculated using the following formula: `((Trail Length)/(Animation Length))/(Num of Trail Points)`.
    * Pre-stepping is no longer required to cache point positions.
* Changed to FPS/Length model from FPS/StepsPerFrame model
    * FPS no longer affects animation speed.
    * StepsPerFrame is deprecated.
    * Frame is no longer sent to `step()` function. 
    * `Step()` signature has changed. Step now receives the following parameters:
        * `context`  - The `2DContext` for the HTML Canvas.
        * `progress` - Point's progress along the current path. 
        * `options`  - Giving access to all user set options. See [User Options](#User Options) for full details...
    * `Step()` is still used to paint the trail.
    * Image Caching has changed: The number of Frames cached = (Animation Length / 1 second) * FPS

##### 3/14/2013
* Allow Juice to differentiate between jQuery and Options objects.
* Change returns and actions to the Canvas HTMLElement.
* Add better default handling. All options are optional. 

##### 3/13/2013
* Add data object to the Canvas HTMLElement.

## Road Map for Development

##### 1. Complete Chaining to allow the following Syntaxes:

* jQuery object

    `$.Juice({options}).appendTo('selector').play();     // Currently nonfunctional.`
    `$.Juice('play', {options});                         // Currently nonfunctional.`
    
* jQuery Selections

    `$('selector').Juice({options}).Sonic('play');       // Currently nonfunctional.`
    `$('selector').add($.Juice({options})).play();       // Currently nonfunctional.`
    `$('selector').prepend($.Juice('play',{options}));   // Currently nonfunctional.`

* Non-jQuery

    `domNode.appendChild(Juice({options}).play());`
    
