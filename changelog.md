## Change Log

### Version 0.0
#### 3/17/2013
* Added User Object
    * Accessed in options.user
* Added Point Object
    * Support for distinct paths (falls back to step)
    * Support for distinct trail object (falls back to global)
    * Support for distinct size, color and alpha (falls back to global)
* Added Trail Object
    * Added default values
#### 3/16/2013
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
#### 3/14/2013
* Allow Sonic to differentiate between jQuery and Options objects.
* Change returns and actions to the Canvas HTMLElement.
* Add better default handling. All options are optional. This allows Sonic to play a very uninteresting line animation.
#### 3/13/2013
* Add data object to the Canvas HTMLElement.
