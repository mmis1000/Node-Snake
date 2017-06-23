/* global $ */
function Tile(img, duration, frames) {
    this.img = img; // image or canvas el
    this.duration = duration; // ms
    this.frames = frames;
    /* this.frames = [
        {
            positions: [{
                x1: Number, 
                y1: Number, 
                x2: Number, 
                y2: Number,
                map_x1: Number,
                map_y1: Number,
                map_x2: Number,
                map_y2: Number
            }], 
            time: Number
        }
    ]*/
}

Tile.prototype.getFrame = function draw(time, seed) {
    seed = seed || 0;
    
    var timePosition = (time % this.duration) / this.duration;
    var frames = this.frames
    var frame = frames[0];
    
    for (var i = 0, length = frames.length; i < length; i++) {
        if (timePosition >= frames[i].time) {
            frame = frames[i]
        } else {
            break;
        }
    }
    
    var positions = frame.positions
    var position = positions[0];
    
    for (var i = 0, length = positions.length; i < length; i++) {
        if (seed >= positions[i].rate) {
            position = positions[i]
        } else {
            break;
        }
    }
    
    return position;
}

Tile.prototype.getBox = function getBox(to_x1, to_y1, to_x2, to_y2, time, seed) {
    var originalPosition = this.getFrame(time, seed);
    var {x1, y1, x2, y2, map_x1, map_y1, map_x2, map_y2} = originalPosition;
    
    var mapWidth = map_x2 - map_x1;
    var mapHeight = map_y2 - map_y1;
    var targetWidth= to_x2 - to_x1
    var targetHeight = to_y2 - to_y1
    
    var new_x1 = to_x1 - (map_x1 - x1) / mapWidth * targetWidth;
    var new_y1 = to_y1 - (map_y1 - y1) / mapHeight * targetHeight;
    var new_x2 = to_x2 + (x2 - map_x2) / mapWidth * targetWidth;
    var new_y2 = to_y2 + (y2 - map_y2) / mapHeight * targetHeight;
    
    return {
        x1, y1, x2, y2,
        new_x1, new_y1, new_x2, new_y2
    }
}

Tile.prototype.draw = function draw(ctx, x1, y1, x2, y2, time, seed) {
    var box = this.getBox(x1, y1, x2, y2, time, seed);
    ctx.drawImage(
        this.img,
        box.x1, box.y1,
        box.x2 - box.x1, box.y2 - box.y1,
        box.new_x1, box.new_y1, 
        box.new_x2 - box.new_x1, box.new_y2 - box.new_y1
    )
}

Tile.prototype.load = function load() {
    return new Promise(function (resolve, reject) {
        
        if (this.img.tagName.match(/^canvas$/i)) {
            return resolve();
        }
        
        if (this.img.height > 1 || this.img.naturalHeight > 1) {
            return resolve();
        }
        
        $(this.img).load(function() {
            return resolve();
        })
    }.bind(this))
}