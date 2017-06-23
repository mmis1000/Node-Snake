var VERSION = 1;

/* global $, jQuery, io, Chunk */
var canvas = $('#game').get(0);
var ctx = canvas.getContext('2d');

/*
$(canvas).css({
    position: 'fixed',
    left: '0px',
    top: '0px',
    right: '0px',
    bottom: '0px'
})
*/
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

var map = null;
var renderer = null;
var game = io.connect('/game');
var start = null;
var currentPosition = null;
var nextVec = [1, 0];

game.on('welcome', function (id) {
    console.log('connected to server with id ' + id);
    game.emit('pre-start', VERSION);
})
game.on('map_info', function (info) {
    console.log('got map info and chunk size, start to load map', info);
    start = Date.now();
    map = new Map(info.chunkWidth, info.chunkHeight);
    renderer = new Renderer(canvas, map, {x: 0, y: 0}, 30);
})
game.on('chunk', function (chunk) {
    // console.log('got map chunk', chunk);
    chunk = Chunk.fromJSON(chunk);
    map.setChunk(chunk.x, chunk.y, chunk);
})
game.on('start', function (data) {
    currentPosition = data;
    renderer.setOrigin(data, true);
    console.log('game started, done loading chunk used ' + (Date.now() - start) + ' ms', data);
    startMove();
})

var interval = null;
var started = false;
var paused = false;

function startMove() {
    started = true;
    
    clearInterval(interval);
    interval = setInterval(function () {
        // var nextVec= null;
        var extend = false;
        /*
        if (Math.random() > 0.5) {
            nextVec = [0, 1];
        } else {
            nextVec = [1, 0];
        }*/
        /*if (Math.random() > 0.5) {
            extend = false;
        }*/
        currentPosition = {
            x: currentPosition.x + nextVec[0],
            y: currentPosition.y + nextVec[1]
        };
        
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
        
        if (nextSlot.isUsed()) {
            extend = true;
        }
        
        renderer.setOrigin(currentPosition);
        game.emit('move', currentPosition, extend)
    }, 200)
}


$(document).keydown(function(ev) {
    console.log(ev.which);

    switch (ev.which) {
        case 38:
            nextVec = [0, -1];
            break
        case 40:
            nextVec = [0, 1];
            break
        case 37:
            nextVec = [-1, 0];
            break
        case 39:
            nextVec = [1, 0];
            break;
        case 80: // p
            if (!started) return;
            if (!paused) {
                paused = true;
                clearTimeout(interval);
            } else {
                paused = false;
                renderer.setOrigin(currentPosition, true); // claer the animate
                startMove()
            }
            break
        default:
    }
})
