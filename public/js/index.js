/* global $, jQuery */
var canvas = $('#game').get(0);
var ctx = canvas.getContext('2d');

;(function (window, r) {
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
    
    ctx.drawImage(background, (time % 800) / 40 - 20, (time % 800) / 40 - 20);
    
})
timer.createMonitor({
	theme: 'transparent',
	graph: 1,
	heat: 1
});

var game = io.connect('/game')
game.on('welcome', function (id) {
    console.log('connected to server with id ' + id);
    game.emit('pre-start');
})
game.on('start', function (data) {
    console.log('game started', data);
})