const Map = require("../lib/map").Map;

module.exports = function gameConnection (app, io, config) {
    var sio = io.of('/game');
    var map = new Map(64, 64);
    
    sio.on('connection', function (socket) {
        socket.playerId = config.getId(8);
        
        socket.snakeParts = [];
        socket.currentListenChunks = [];
        
        console.log( socket.playerId + ' connected');
        socket.on('disconnect', function () {
            console.log(socket.playerId + ' disconnected');
        })
        socket.emit('welcome', socket.playerId)
        
        
        socket.on('pre-start', function() {
            console.log(socket.playerId + ' wish to start the game, preparing for him...');
            
            var x = Math.floor(Math.random() * 64 - 32);
            var y = Math.floor(Math.random() * 64 - 32);
            
            var chunkIndex = map.getChunkIndex(x, y);
            
            // var node = map.getChunk(chunkIndex.x    , chunkIndex.y    ).findEmptySlot();
            // node.setUsed(true);
            // node.setBoolean('own-' + socket.playerId, true);
            
            socket.snakeParts.push({
                x: x,
                y: y
            })
            
            var initialSlot = map
            .getChunk(chunkIndex.x    , chunkIndex.y    )
            .getSlot(chunkIndex.offsetX, chunkIndex.offsetY);
            initialSlot.setSolid(true);
            initialSlot.setUsed(true);
            initialSlot.setBoolean('own-' + socket.playerId, true);
            initialSlot.display = 'snack-head-right'
            initialSlot.owner = socket.playerId;
            
            var chunksToLoad = [
                [chunkIndex.x - 1, chunkIndex.y - 1],
                [chunkIndex.x - 1, chunkIndex.y    ],
                [chunkIndex.x - 1, chunkIndex.y + 1],
                [chunkIndex.x    , chunkIndex.y - 1],
                [chunkIndex.x    , chunkIndex.y    ],
                [chunkIndex.x    , chunkIndex.y + 1],
                [chunkIndex.x + 1, chunkIndex.y - 1],
                [chunkIndex.x + 1, chunkIndex.y    ],
                [chunkIndex.x + 1, chunkIndex.y + 1],
            ];
            var preStartMessage = {
                chunkWidth: map.chunkWidth,
                chunkHeight: map.chunkHeight
            }
            var message = {
                x : x, y : y
            }
            
            socket.currentListenChunks = chunksToLoad;
            
            var start = Date.now();
            
            socket.emit('map_info', preStartMessage);
            
            socket.currentListenChunks.forEach(function(room) {
                socket.join('chunk_' + room[0] + ',' + room[1]);
                console.log(socket.playerId + ' joined room chunk_' + room[0] + ',' + room[1])
            })
            
            socket.currentListenChunks.forEach(function(room) {
                console.log('sending chunk to room ' + 'chunk_' + room[0] + ',' + room[1])
                socket.emit('chunk', map.getChunk(room[0], room[1]));
            })
            sio.to('chunk_' + chunkIndex.x + ',' + chunkIndex.y)
                .emit('chunk', map.getChunk(chunkIndex.x, chunkIndex.y));
            console.log(socket.playerId + ' prepared map used ' + (Date.now() - start) + ' ms');
            
            socket.emit('start', message)
            socket.gameStarted = true;
        })
        socket.on('move', function(position, addLength) {
            if (!socket.gameStarted) {
                return socket.emit('reset');
            }
            
            var chunkIndex = map.getChunkIndex(position.x, position.y);
            var chunksToLoad = [
                [chunkIndex.x - 1, chunkIndex.y - 1],
                [chunkIndex.x - 1, chunkIndex.y    ],
                [chunkIndex.x - 1, chunkIndex.y + 1],
                [chunkIndex.x    , chunkIndex.y - 1],
                [chunkIndex.x    , chunkIndex.y    ],
                [chunkIndex.x    , chunkIndex.y + 1],
                [chunkIndex.x + 1, chunkIndex.y - 1],
                [chunkIndex.x + 1, chunkIndex.y    ],
                [chunkIndex.x + 1, chunkIndex.y + 1],
            ];
            
            if (!addLength) {
                var removedSnakePartIndexTemp = socket.snakeParts.shift();
                var removedSnakePartIndex = map.getChunkIndex(removedSnakePartIndexTemp.x, removedSnakePartIndexTemp.y);
                // console.log(removedSnakePartIndexTemp, removedSnakePartIndex)
                var removedSnakePart = map
                .getChunk(removedSnakePartIndex.x, removedSnakePartIndex.y)
                .getSlot(removedSnakePartIndex.offsetX, removedSnakePartIndex.offsetY);
                removedSnakePart
                
                removedSnakePart.setSolid(false);
                removedSnakePart.setUsed(false);
                removedSnakePart.setBoolean('own-' + socket.playerId, false);
                delete removedSnakePart.display;
                delete removedSnakePart.owner;
                
                console.log('brocasting changed chunk to room chunk_'  + removedSnakePartIndex.x + ',' + removedSnakePartIndex.y)
                
                sio.to('chunk_' + removedSnakePartIndex.x + ',' + removedSnakePartIndex.y)
                    .emit('chunk', map.getChunk(removedSnakePartIndex.x, removedSnakePartIndex.y));
                /*
                socket.currentListenChunks.forEach(function(room) {
                    console.log('sending chunk to room ' + 'chunk_' + room[0] + ',' + room[1])
                    sio.of('chunk_' + room[0] + ',' + room[1]).emit('chunk', map.getChunk(room[0], room[1]));
                })*/
            }
            socket.snakeParts.push({x: position.x, y: position.y});
            
            var secondSlot = map
            .getChunk(chunkIndex.x    , chunkIndex.y    )
            .getSlot(chunkIndex.offsetX, chunkIndex.offsetY);
            secondSlot.setSolid(true);
            secondSlot.setUsed(true);
            secondSlot.setBoolean('own-' + socket.playerId, true);
            secondSlot.display = 'snack-head-right'
            secondSlot.owner = socket.playerId;
            
            var hasChunk = false;
            socket.currentListenChunks.forEach(function(room) {
                if (room[0] === chunkIndex.x && room[1] === chunkIndex.y) {
                    hasChunk = true;
                }
            })
            if (!hasChunk) {
                socket.currentListenChunks.push([chunkIndex.x, chunkIndex.y])
                socket.join('chunk_' + chunkIndex.x + ',' + chunkIndex.y)
            }
            console.log('brocasting changed chunk to room chunk_'  + chunkIndex.x + ',' + chunkIndex.y)
            sio.to('chunk_' + chunkIndex.x + ',' + chunkIndex.y)
                .emit('chunk', map.getChunk(chunkIndex.x, chunkIndex.y));
        })
    })
}