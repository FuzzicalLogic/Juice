Sonic(jQ) Plugin
================

Sonic(jQ) uses the HTML5 Canvas to allow dynamic, fluid loading animations without requiring animated GIFs. With the addition of the HTML5shiv, Sonic(jQ) is able to perform reliably on most browsers. Without HTML5shiv, Sonic(jQ) works natively on IE9+, Firefox, Chrome, Safari and Opera, with or without jQuery.

Sonc(jQ) is a complete rework of [Sonic.js](https://github.com/padolsey/Sonic). The primary goal of this redesign was to take advantage of the usability of the jQuery framework without making it a dependency. Secondary goals included providing more consistent expected behavior and reducing the overall amount of code required to begin using Sonic as a whole.

### Usage (with jQuery)

$('css').Sonic()

This will create, or retrieve a canvas object (if one is not already provided) within each item in the $() jQuery. For chainability, you may then .play() or .stop() the animation. 

### Usage (without jQuery)

If jQuery is not included, Sonic(jQ) works within its own Sonic namespace and works similarly to [Sonic.js](https://github.com/padolsey/Sonic). There are some significant differences, however, to improve usability.

* All options are optional now
* `fps` no longer affects the speed of the animation itself, only the refresh rate. This is handled by `duration`.
* Sonic(jQ) now accepts multiple `points`, each with their own `paths` and `duration`. This is to avoid the need for complex step functions, if they aren't necessary.
