/* global $, jQuery */
function Renderer(canvas, map, origin, slotSize) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
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
    
    this.init();
}

Renderer.prototype.init = function () {
    var background = this.background = document.createElement('canvas');
    var backgroundCtx = this.backgroundCtx = this.background.getContext('2d');
    
    background.width = this.chunkWidth * this.slotSize;
    background.height = this.chunkHeight * this.slotSize;
    
    backgroundCtx.fillStyle = "#777777";
    backgroundCtx.fillRect(0, 0, this.chunkWidth * this.slotSize, this.chunkHeight * this.slotSize);
    
    backgroundCtx.fillStyle = "#ffffff";
    for (var i = 0; i < this.chunkWidth; i++) {
        for (var j = 0; j < this.chunkHeight; j++) {
            backgroundCtx.fillRect(this.slotSize * i + 2, this.slotSize * j + 2, this.slotSize - 4, this.slotSize - 4)
        }
    }
    
    backgroundCtx.fillStyle = "#ff0000";
    backgroundCtx.fillRect(0, 0, 2, background.height);
    backgroundCtx.fillRect(0, 0, background.width, 2);
}

Renderer.prototype.setOrigin = function setOrigin(origin) {
    this.origin = origin;
}

Renderer.prototype.draw = function (origin) {
    if (origin) {
        this.origin = origin;
    } else {
        origin = this.origin;
    }
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
                x: screenCenterOffsetX - centerChunkOffsetX + index[0] * this.chunkWidth * this.slotSize,
                y: screenCenterOffsetY - centerChunkOffsetY + index[1] * this.chunkWidth * this.slotSize
            }
        )
    }.bind(this));
}

Renderer.prototype.drawChunk = function (chunkIndex, canvasOffset) {
    var slot;
    var chunk = this.map.getChunk(chunkIndex.x, chunkIndex.y);
    this.ctx.drawImage(this.background, canvasOffset.x, canvasOffset.y);
    if (!chunk) {
        console.log('chunk no loaded yet', chunkIndex);
        return;
    }
    this.ctx.fillStyle = "#000000";
    
    for (var i = 0; i < this.chunkWidth; i++) {
        for (var j = 0; j < this.chunkHeight; j++) {
            slot = chunk.getSlot(i, j);
            if (slot.isSolid()) {
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