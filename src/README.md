# Minification Instructions

The structure of this file requires a special minification process.

* Minify with [UglifyJS](http://marijnhaverbeke.nl/uglifyjs)
* Find all of the missing "undefined". They're typically marked c. Run through debugger as it will tell you.
* Take the modified Uglify, and place it through Closure.
* Take the Closure, and put it through [Compressorrater](http://compressorrater.thruhere.net/).
* You may then take your pick.
