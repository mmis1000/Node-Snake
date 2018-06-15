/* global Tile */
var Tile = require("./tile")

var tileSetImage = document.createElement('img');
tileSetImage.src = '/img/tileset.png'

var monsterImage = document.createElement('img');
monsterImage.src = '/img/monster.png'

var coinImage = document.createElement('img');
coinImage.src = '/img/coin.png'

var tiles = {
    grass: new Tile(tileSetImage, 1000, [{
        time: 0,
        positions: [{
            x1: 304,
            y1: 272,
            x2: 320,
            y2: 288,
            map_x1: 304,
            map_y1: 272,
            map_x2: 320,
            map_y2: 288,
            rate: 0
        },{
            x1: 240,
            y1: 256,
            x2: 256,
            y2: 272,
            map_x1: 240,
            map_y1: 256,
            map_x2: 256,
            map_y2: 272,
            rate: 0.95
        },{
            x1: 208,
            y1: 256,
            x2: 224,
            y2: 272,
            map_x1: 208,
            map_y1: 256,
            map_x2: 224,
            map_y2: 272,
            rate: 0.975
        },{
            x1: 288,
            y1: 272,
            x2: 304,
            y2: 288,
            map_x1: 288,
            map_y1: 272,
            map_x2: 304,
            map_y2: 288,
            rate: 0.995
        }]
    }]),
    stone: new Tile(tileSetImage, 1000, [{
        time: 0,
        positions: [{
            x1: 272,
            y1: 144,
            x2: 288,
            y2: 160,
            map_x1: 272,
            map_y1: 144,
            map_x2: 288,
            map_y2: 160,
            rate: 0
        }]
    }]),
    snake: new Tile(monsterImage, 1000, [{
        time: 0,
        positions: [{
            x1: 0,
            y1: 0,
            x2: 16,
            y2: 16,
            map_x1: 0,
            map_y1: 0,
            map_x2: 16,
            map_y2: 16,
            rate: 0
        }]
    }, {
        time: 0.25,
        positions: [{
            x1: 0,
            y1: 16,
            x2: 16,
            y2: 32,
            map_x1: 0,
            map_y1: 16,
            map_x2: 16,
            map_y2: 32,
            rate: 0
        }]
    }, {
        time: 0.5,
        positions: [{
            x1: 0,
            y1: 32,
            x2: 16,
            y2: 48,
            map_x1: 0,
            map_y1: 32,
            map_x2: 16,
            map_y2: 48,
            rate: 0
        }]
    }, {
        time: 0.75,
        positions: [{
            x1: 0,
            y1: 48,
            x2: 16,
            y2: 64,
            map_x1: 0,
            map_y1: 48,
            map_x2: 16,
            map_y2: 64,
            rate: 0
        }]
    }]),
    coin: new Tile(coinImage, 1000, [{
        time: 0,
        positions: [{
            x1: 0,
            y1: 0,
            x2: 10,
            y2: 10,
            map_x1: -3,
            map_y1: -3,
            map_x2: 13,
            map_y2: 13,
            rate: 0
        }]
    }, {
        time: 0.25,
        positions: [{
            x1: 10,
            y1: 0,
            x2: 20,
            y2: 10,
            map_x1: 7,
            map_y1: -3,
            map_x2: 23,
            map_y2: 13,
            rate: 0
        }]
    }, {
        time: 0.5,
        positions: [{
            x1: 20,
            y1: 0,
            x2: 30,
            y2: 10,
            map_x1: 17,
            map_y1: -3,
            map_x2: 33,
            map_y2: 13,
            rate: 0
        }]
    }, {
        time: 0.75,
        positions: [{
            x1: 30,
            y1: 0,
            x2: 40,
            y2: 10,
            map_x1: 27,
            map_y1: -3,
            map_x2: 43,
            map_y2: 13,
            rate: 0
        }]
    }]),
    snake_nx: new Tile(monsterImage, 1000, [{
        time: 0,
        positions: [{
            x1: 48,
            y1: 0,
            x2: 64,
            y2: 16,
            map_x1: 48,
            map_y1: 0,
            map_x2: 64,
            map_y2: 16,
            rate: 0
        }]
    }, {
        time: 0.25,
        positions: [{
            x1: 48,
            y1: 16,
            x2: 64,
            y2: 32,
            map_x1: 48,
            map_y1: 16,
            map_x2: 64,
            map_y2: 32,
            rate: 0
        }]
    }, {
        time: 0.5,
        positions: [{
            x1: 48,
            y1: 32,
            x2: 64,
            y2: 48,
            map_x1: 48,
            map_y1: 32,
            map_x2: 64,
            map_y2: 48,
            rate: 0
        }]
    }, {
        time: 0.75,
        positions: [{
            x1: 48,
            y1: 48,
            x2: 64,
            y2: 64,
            map_x1: 48,
            map_y1: 48,
            map_x2: 64,
            map_y2: 64,
            rate: 0
        }]
    }]),
    snake_px: new Tile(monsterImage, 1000, [{
        time: 0,
        positions: [{
            x1: 32,
            y1: 0,
            x2: 48,
            y2: 16,
            map_x1: 32,
            map_y1: 0,
            map_x2: 48,
            map_y2: 16,
            rate: 0
        }]
    }, {
        time: 0.25,
        positions: [{
            x1: 32,
            y1: 16,
            x2: 48,
            y2: 32,
            map_x1: 32,
            map_y1: 16,
            map_x2: 48,
            map_y2: 32,
            rate: 0
        }]
    }, {
        time: 0.5,
        positions: [{
            x1: 32,
            y1: 32,
            x2: 48,
            y2: 48,
            map_x1: 32,
            map_y1: 32,
            map_x2: 48,
            map_y2: 48,
            rate: 0
        }]
    }, {
        time: 0.75,
        positions: [{
            x1: 32,
            y1: 48,
            x2: 48,
            y2: 64,
            map_x1: 32,
            map_y1: 48,
            map_x2: 48,
            map_y2: 64,
            rate: 0
        }]
    }]),
    snake_ny: new Tile(monsterImage, 1000, [{
        time: 0,
        positions: [{
            x1: 16,
            y1: 0,
            x2: 32,
            y2: 16,
            map_x1: 16,
            map_y1: 0,
            map_x2: 32,
            map_y2: 16,
            rate: 0
        }]
    }, {
        time: 0.25,
        positions: [{
            x1: 16,
            y1: 16,
            x2: 32,
            y2: 32,
            map_x1: 16,
            map_y1: 16,
            map_x2: 32,
            map_y2: 32,
            rate: 0
        }]
    }, {
        time: 0.5,
        positions: [{
            x1: 16,
            y1: 32,
            x2: 32,
            y2: 48,
            map_x1: 16,
            map_y1: 32,
            map_x2: 32,
            map_y2: 48,
            rate: 0
        }]
    }, {
        time: 0.75,
        positions: [{
            x1: 16,
            y1: 48,
            x2: 32,
            y2: 64,
            map_x1: 16,
            map_y1: 48,
            map_x2: 32,
            map_y2: 64,
            rate: 0
        }]
    }]),
    snake_py: new Tile(monsterImage, 1000, [{
        time: 0,
        positions: [{
            x1: 0,
            y1: 0,
            x2: 16,
            y2: 16,
            map_x1: 0,
            map_y1: 0,
            map_x2: 16,
            map_y2: 16,
            rate: 0
        }]
    }, {
        time: 0.25,
        positions: [{
            x1: 0,
            y1: 16,
            x2: 16,
            y2: 32,
            map_x1: 0,
            map_y1: 16,
            map_x2: 16,
            map_y2: 32,
            rate: 0
        }]
    }, {
        time: 0.5,
        positions: [{
            x1: 0,
            y1: 32,
            x2: 16,
            y2: 48,
            map_x1: 0,
            map_y1: 32,
            map_x2: 16,
            map_y2: 48,
            rate: 0
        }]
    }, {
        time: 0.75,
        positions: [{
            x1: 0,
            y1: 48,
            x2: 16,
            y2: 64,
            map_x1: 0,
            map_y1: 48,
            map_x2: 16,
            map_y2: 64,
            rate: 0
        }]
    }]),
}

module.exports = tiles;