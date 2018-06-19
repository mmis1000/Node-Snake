/* global $, jQuery, io */
var VERSION = 1;
var Chunk = require('../../lib/map/map').Chunk;
var Map = require('../../lib/map/map').Map;
var constants = require("../../lib/constants");
var Renderer = require('./renderer');
var canvas = $('#game').get(0);
var ctx = canvas.getContext('2d');
var Vue = require("../components/vue/dist/vue.common.js")

var windowWidth = $(window).width();
var windowHeight = $(window).height();
canvas.width = Math.floor(windowWidth);
canvas.height = Math.floor(windowHeight);
console.log(windowWidth, windowHeight)

$(canvas).css({
    position: 'fixed',
    left: '0px',
    top: '0px',
    right: '0px',
    bottom: '0px'
})

;(function (window, r) {
    /* global Render, FPSMeter */
    var requestAnimationFrame = window.requestAnimationFrame;
    var cancelAnimationFrame = window.cancelAnimationFrame;
    function FrameInstance(cb, offset) {
        this.startTime = null;
        this.offset = offset || 0;
        this.cb = cb;
        
        this.running = false;
        this.id = null;
        
        this.monitor = null;
    }
    FrameInstance.prototype.start = function () {
        this.running = true
        this.startTime = null;
        cancelAnimationFrame(this.id);
        this.id = requestAnimationFrame(this._tick.bind(this));
    }
    FrameInstance.prototype._tick = function (time) {
        if (!this.running) return;
        
        if (this.monitor) {
            this.monitor.tickStart();
        }
        this.startTime = this.startTime == null ? time : this.startTime
        this.cb(time - this.startTime + this.offset);
        if (this.monitor) {
            this.monitor.tick();
        }
        
        if (!this.running) return;
        cancelAnimationFrame(this.id);
        this.id = requestAnimationFrame(this._tick.bind(this));
    }
    FrameInstance.prototype.stop = function () {
        if (!this.running) return;
        this.running = false;
        this.startTime = null;
        cancelAnimationFrame(this.id);
    }
    FrameInstance.prototype.createMonitor = function (container, option) {
        this.monitor = new FPSMeter(container, option);
    }
    
    r.getAnimate = function (cb, offset) {
        var instance = new FrameInstance(cb, offset);
        console.log(instance)
        instance.start();
        return instance;
    }
    r.FrameInstance = FrameInstance;
} (window, window.Render = {}));

var i, j;

var background = document.createElement('canvas');
background.width = 720;
background.height = 720;
var backgroundCtx = background.getContext('2d');
backgroundCtx.fillStyle = "#777777"
backgroundCtx.fillRect(0, 0, 660, 660);
backgroundCtx.fillStyle = "#ffffff";
for (i = 0; i < 33; i++) {
    for (j = 0; j < 33; j++) {
        backgroundCtx.fillStyle = "#ffffff"
        backgroundCtx.fillRect(i * 20 + 2, j * 20 + 2, 16, 16);
    }
}

var timer = Render.getAnimate(function (time) {
    // console.log(time);
    ctx.fillStyle = "#777777"
    ctx.fillRect(0, 0, 640, 640);
    if (!renderer) {
        ctx.drawImage(background, (time % 800) / 40 - 20, (time % 800) / 40 - 20);
    } else {
        renderer.draw(time);
    }
    
})
timer.createMonitor({
	theme: 'transparent',
	graph: 1,
	heat: 1
});

var status = new Vue({
  el: '#status',
  data: {
    x: 'loading...',
    y: 'loading...',
    status: 'loading',
    showHint: false
  },
  methods: {
      toggleHint: function() {
          this.showHint = !this.showHint
      }
  }
})

var map = null;
var renderer = null;
var game = io.connect('/game');
var start = null;
var currentPosition = null;
var currentDirection = null;

game.on('welcome', function (id) {
    console.log('connected to server with id ' + id);
    game.emit('pre-start', VERSION);
})
game.on('map_info', function (info) {
    console.log('got map info and chunk size, start to load map', info);
    start = Date.now();
    map = new Map(info.chunkWidth, info.chunkHeight);
    renderer = new Renderer(canvas, map, {x: 0, y: 0}, 32);
})
game.on('chunk', function (chunk) {
    // console.log('got map chunk', chunk);
    chunk = Chunk.fromJSON(chunk);
    map.setChunk(chunk.x, chunk.y, chunk);
})
game.on('start', function (data) {
    currentPosition = data;
    renderer.setOrigin(data, true);
    currentDirection = data.direction;
    console.log('game started, done loading chunk used ' + (Date.now() - start) + ' ms', data);
    startMove();
    status.status = 'play'
})

var interval = null;
var started = false;
var paused = false;

function startMove() {
    started = true;
    
    clearInterval(interval);
    interval = setTimeout(function () {
        tick()
        interval = setInterval(tick, 200)
    }, 1000)
    
    function tick() {
        // var nextVec= null;
        var extend = false;
        
        switch (currentDirection) {
            case constants.directions.NX:
                currentPosition = {
                    x: currentPosition.x - 1,
                    y: currentPosition.y
                }
                break;
            case constants.directions.PX:
                currentPosition = {
                    x: currentPosition.x + 1,
                    y: currentPosition.y
                }
                break;
            case constants.directions.NY:
                currentPosition = {
                    x: currentPosition.x,
                    y: currentPosition.y - 1
                }
                break;
            case constants.directions.PY:
                currentPosition = {
                    x: currentPosition.x,
                    y: currentPosition.y + 1
                }
                break;
        }
        
        var chunkIndex = map.getChunkIndex(currentPosition.x, currentPosition.y);
        
        var nextSlot = map
            .getChunk(chunkIndex.x, chunkIndex.y)
            .getSlot(chunkIndex.offsetX, chunkIndex.offsetY)
        
        if (nextSlot.isSolid() && !window.god) {
            clearInterval(interval);
            started = false;
            game.emit('dead');
            game.emit('pre-start', VERSION);
            return;
        } else if (nextSlot.isSolid() && window.god){
            return
        }
        
        if (nextSlot.isUsed() && nextSlot.type === 'item') {
            extend = true;
        }
        
        renderer.setOrigin(currentPosition);
        game.emit('move', currentPosition, extend, currentDirection);
        
        status.x = currentPosition.x
        status.y = currentPosition.y
    }
}

$(document).keydown(function(ev) {
    switch (ev.which) {
        case 38:
            currentDirection = constants.directions.NY;
            break
        case 40:
            currentDirection = constants.directions.PY;
            break
        case 37:
            currentDirection = constants.directions.NX;
            break
        case 39:
            currentDirection = constants.directions.PX;
            break;
        case 80: // pause
            if (!started) return;
            if (!paused) {
                status.status = 'paused'
                paused = true;
                renderer.setOrigin(currentPosition, true); // cleer the animat
                clearTimeout(interval);
            } else {
                status.status = 'play'
                paused = false;
                renderer.setOrigin(currentPosition, true); // cleer the animate
                startMove()
            }
            break;
    }
    game.emit('direction', currentPosition, currentDirection)
})

var MIN_DISTANCE = 50;

var gesture = {
    X_start: 0,
    Y_start: 0,
    X_end: 0,
    Y_end: 0,
};

var tapped = null

function gestureCheck(type, ev) {
    if (type === 'start') {
        ev.preventDefault();
    }
    
    var distance, side;
    
    try {
        var x = ev.pageX || ev.originalEvent.targetTouches[0].pageX;
        var y = ev.pageY || ev.originalEvent.targetTouches[0].pageY;
    }
    catch (e) {
        if (type !== 'check') {
            return;
        }
    }
    
    function move() {
        clearTimeout(tapped); //stop single tap callback
        tapped = null
    
        var side = Math.abs(gesture.X_start - gesture.X_end) > Math.abs(gesture.Y_start - gesture.Y_end) ? 'X' : 'Y';
        var positive = (gesture[side + '_end'] - gesture[side + '_start']) > 0 ? 'P' : 'N';
        if (currentDirection !== constants.directions[positive + side]) {
            currentDirection = constants.directions[positive + side]
            game.emit('direction', currentPosition, currentDirection)
        }
    }
    
    switch (type) {
        case 'start':
            gesture.X_start = x;
            gesture.Y_start = y;
            gesture.X_end = x;
            gesture.Y_end = y;
            break;
        case 'move':
            gesture.X_end = x;
            gesture.Y_end = y;
            
            distance = Math.sqrt(
                Math.pow(gesture.X_start - gesture.X_end, 2) +
                Math.pow(gesture.Y_start - gesture.Y_end, 2)
            );
            
            if (distance < MIN_DISTANCE) {
                return;
            }
            
            move()
            break;
        case 'check':
            distance = Math.sqrt(
                Math.pow(gesture.X_start - gesture.X_end, 2) +
                Math.pow(gesture.Y_start - gesture.Y_end, 2)
            );
            
            if (distance < MIN_DISTANCE) {
                return;
            }
            
            move();
    }
}

$('#game').on('touchstart', gestureCheck.bind(null, 'start'))
$('#game').on('touchmove', gestureCheck.bind(null, 'move'))
$('#game').on('touchend', gestureCheck.bind(null, 'check'))

$('#game').on("touchstart", function(e) {
    if (!tapped) { //if tap is not set, set up single tap
        tapped = setTimeout(function() {
            tapped = null
        }, 300); //wait 300ms then run single click code
    }
    else { //tapped within 300ms of last tap. double tap
        clearTimeout(tapped); //stop single tap callback
        tapped = null
            // pause
        if (!started) return;
        if (!paused) {
            status.status = 'paused'
            paused = true;
            renderer.setOrigin(currentPosition, true); // cleer the animat
            clearTimeout(interval);
        }
        else {
            status.status = 'play'
            paused = false;
            renderer.setOrigin(currentPosition, true); // cleer the animate
            startMove()
        }
    }
    e.preventDefault()
});