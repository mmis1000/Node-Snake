/* global $, jQuery */

var constants = require("../../lib/constants");
var tiles = require("./resource");

function disableSmooth(ctx) {
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
}

function Renderer(canvas, map, origin, slotSize) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    disableSmooth(this.ctx)
    
    this.map = map;
    
    // slot size in px
    this.slotSize = slotSize || 20;
    
    // view size in px
    this.viewWidth = canvas.width;
    this.viewHeight = canvas.height;
    
    // chunk size in slot
    this.chunkWidth = map.chunkWidth;
    this.chunkHeight = map.chunkHeight;
    
    // a object looks like {x: 0, y : 0} in slot
    this.origin = origin;
    
    this.currentPosition = origin;
    this.oldOrigin = origin;
    
    this.animateStartTime = null;
    this.animateEndTime = null;
    this.animateLength = 200;
    
    this.init();
}

Renderer.prototype.init = function () {
    var background = this.background = document.createElement('canvas');
    var backgroundCtx = this.backgroundCtx = this.background.getContext('2d');
    
    background.width = this.chunkWidth * this.slotSize;
    background.height = this.chunkHeight * this.slotSize;
    
    backgroundCtx.fillStyle = "#007700";
    backgroundCtx.fillRect(0, 0, this.chunkWidth * this.slotSize, this.chunkHeight * this.slotSize);
    
    disableSmooth(this.backgroundCtx);
    
    tiles.grass.load().then(function () {
        for (var i = 0; i < this.chunkWidth; i++) {
            for (var j = 0; j < this.chunkHeight; j++) {
                // backgroundCtx.fillRect(this.slotSize * i + 2, this.slotSize * j + 2, this.slotSize - 4, this.slotSize - 4)
                tiles.grass.draw(
                    backgroundCtx, 
                    this.slotSize * i, this.slotSize * j,
                    this.slotSize * (i + 1), this.slotSize * (j + 1),
                    0,
                    Math.random()
                )
            }
        }
        //backgroundCtx.fillRect(0, 0, 2, background.height);
        //backgroundCtx.fillRect(0, 0, background.width, 2);
    }.bind(this))
    /*
    backgroundCtx.fillStyle = "#ffffff";
    for (var i = 0; i < this.chunkWidth; i++) {
        for (var j = 0; j < this.chunkHeight; j++) {
            backgroundCtx.fillRect(this.slotSize * i + 2, this.slotSize * j + 2, this.slotSize - 4, this.slotSize - 4)
        }
    }
    
    backgroundCtx.fillStyle = "#ff0000";
    backgroundCtx.fillRect(0, 0, 2, background.height);
    backgroundCtx.fillRect(0, 0, background.width, 2);
    */
}

Renderer.prototype.setOrigin = function setOrigin(origin, flush) { 
    if (flush) {
        this.currentPosition = origin;
    }
    this.currentPosition = this.currentPosition || origin;
    this.oldOrigin = this.currentPosition;
    this.origin = origin;
    
    if (this.time) {
        this.animateStartTime = this.time;
        this.animateEndTime = this.time + this.animateLength;
    }
}

Renderer.prototype.draw = function (time) {
    this.time = time;
    
    if (!this.animateStartTime) {
        this.animateStartTime = this.time
        this.animateEndTime = this.time + this.animateLength;
    }
    
    var origin = this.origin;
    
    this.currentPosition = {
        x: (this.oldOrigin.x * (this.animateEndTime - time) + this.origin.x * (time - this.animateStartTime)) / this.animateLength,
        y: (this.oldOrigin.y * (this.animateEndTime - time) + this.origin.y * (time - this.animateStartTime)) / this.animateLength
    }
    
    var positionOffset;
    
    if (this.animateEndTime + this.animateLength > this.time) {
        this.currentPosition = {
            x: (this.oldOrigin.x * (this.animateEndTime - time) + this.origin.x * (time - this.animateStartTime)) / this.animateLength,
            y: (this.oldOrigin.y * (this.animateEndTime - time) + this.origin.y * (time - this.animateStartTime)) / this.animateLength
        }
        
        positionOffset = {
            x: this.currentPosition.x - this.origin.x,
            y: this.currentPosition.y - this.origin.y
        }
    } else {
        positionOffset = {
            x: 0,
            y: 0
        }
    }
    
    
    /*console.log(JSON.stringify({
        positionOffset,
        currentPosition: this.currentPosition,
        remain:this.animateEndTime - time
    }), 0, 4)*/
    
    var x = origin.x;
    var y = origin.y;
    
    var chunkOffset = this.map.getChunkIndex(x, y);
    
    var chunkOriginOffset = {
        x: chunkOffset.offsetX,
        y: chunkOffset.offsetY
    }
    
    var chunkIndex = {
        x: chunkOffset.x,
        y: chunkOffset.y
    }
    
    var toDraw = [
        [-1, -1],
        [-1,  0],
        [-1,  1],
        [ 0, -1],
        [ 0,  0],
        [ 0,  1],
        [ 1, -1],
        [ 1,  0],
        [ 1,  1]
    ]
    
    // offset relative to canvas's x: 0, y: 0
    var screenCenterOffsetX = this.viewWidth / 2;
    var screenCenterOffsetY = this.viewHeight / 2;
    
    // offset relative to chunks's x: 0, y: 0
    var centerChunkOffsetX = (chunkOriginOffset.x + 0.5) * this.slotSize;
    var centerChunkOffsetY = (chunkOriginOffset.y + 0.5) * this.slotSize;
    
    toDraw.forEach(function (index) {
        this.drawChunk(
            {
                x: chunkIndex.x + index[0],
                y: chunkIndex.y + index[1]
            },
            {
                x: screenCenterOffsetX - centerChunkOffsetX + (index[0] * this.chunkWidth - positionOffset.x) * this.slotSize,
                y: screenCenterOffsetY - centerChunkOffsetY + (index[1] * this.chunkWidth - positionOffset.y) * this.slotSize
            },
            time
        )
    }.bind(this));
}

Renderer.prototype.drawChunk = function (chunkIndex, canvasOffset, time) {
    /* global constants */
    var width = this.chunkWidth * this.slotSize;
    
    if (!Renderer.crossOver(
        0, 0, this.viewWidth, this.viewHeight, 
        canvasOffset.x, canvasOffset.y, canvasOffset.x + width, canvasOffset.y + width)
    ) {
        return;
    }
    
    var slot;
    var chunk = this.map.getChunk(chunkIndex.x, chunkIndex.y);
    this.ctx.drawImage(this.background, canvasOffset.x, canvasOffset.y);
    if (!chunk) {
        this.ctx.fillStyle = "rgba(127, 127, 127, 0.5)"
        this.ctx.fillRect(
            canvasOffset.x, 
            canvasOffset.y, 
            this.slotSize * this.chunkWidth, 
            this.slotSize * this.chunkHeight
        );
        console.log('chunk no loaded yet', chunkIndex);
        return;
    }
    
    for (var i = 0; i < this.chunkWidth; i++) {
        for (var j = 0; j < this.chunkHeight; j++) {
            slot = chunk.getSlot(i, j);
            if (slot.isUsed()) {
                if (slot.type === 'stone') {
                    tiles.stone.draw(
                        this.ctx,
                        canvasOffset.x + this.slotSize * i, canvasOffset.y + this.slotSize * j,
                        canvasOffset.x + this.slotSize * (i + 1), canvasOffset.y + this.slotSize * (j + 1),
                        time,
                        ((3 * i + 7 * j) % this.chunkWidth) / this.chunkWidth
                    )
                } else if (slot.type === 'snake') {
                    var tile;
                    switch(slot.direction) {
                        case constants.directions.NX:
                            tile = tiles.snake_nx;
                            break;
                        case constants.directions.NY:
                            tile = tiles.snake_ny;
                            break;
                        case constants.directions.PX:
                            tile = tiles.snake_px;
                            break;
                        case constants.directions.PY:
                            tile = tiles.snake_py;
                            break;
                        default:
                            console.error(slot.direction, slot)
                    }
                    
                    
                    tile.draw(
                        this.ctx,
                        canvasOffset.x + this.slotSize * i, canvasOffset.y + this.slotSize * j,
                        canvasOffset.x + this.slotSize * (i + 1), canvasOffset.y + this.slotSize * (j + 1),
                        time,
                        0
                    )
                } else if (slot.type === 'item') {
                    tiles.coin.draw(
                        this.ctx,
                        canvasOffset.x + this.slotSize * i, canvasOffset.y + this.slotSize * j,
                        canvasOffset.x + this.slotSize * (i + 1), canvasOffset.y + this.slotSize * (j + 1),
                        time + ((3 * i + 7 * j) % this.chunkWidth) / this.chunkWidth * 1000,
                        ((3 * i + 7 * j) % this.chunkWidth) / this.chunkWidth
                    )
                } else {
                    this.ctx.fillStyle = slot.color;
                    
                    this.ctx.fillRect(
                        canvasOffset.x + this.slotSize * i + 2,
                        canvasOffset.y + this.slotSize * j + 2,
                        this.slotSize - 4,
                        this.slotSize - 4
                    )
                }
            }
        }
    }
    
}

Renderer.crossOver = function crossOver(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    if (ax1 > ax2) {
        [ax1, ax2] = [ax2, ax1]
    }
    
    if (ay1 > ay2) {
        [ay1, ay2] = [ay2, ay1]
    }
    
    if (bx1 > bx2) {
        [bx1, bx2] = [bx2, bx1]
    }
    
    if (by1 > by2) {
        [by1, by2] = [by2, by1]
    }
    
    return bx2 > ax1 && ax2 > bx1 && by2 > ay1 && ay2 > by1;
}

module.exports = Renderer;