const hslToColor = require("../lib/color").hslToColor
const Map = require("../lib/map").Map;
const VERSION = 1;

module.exports = function gameConnection (app, io, config) {
    var sio = io.of('/game');
    var map = new Map(64, 64);
    
    map.on('new_chunk', function (chunk) {
        for (var i = 0; i < 200; i++) {
            var slot = chunk.tree.findEmptySlot()
            // slot.setSolid(true)
            slot.setUsed(true);
            slot.color = hslToColor(Math.random(), 0.7, 0.3)
            if (Math.random() > 0.7) {
                slot.setSolid(true);
                slot.color = '#000000';
            }
        }
    })
    
    sio.on('connection', function (socket) {
        socket.playerId = config.getId(8);
        socket.color = hslToColor(Math.random(), 1, 0.7)
        socket.snakeParts = [];
        socket.currentListenChunks = [];
        console.log( socket.playerId + ' connected');
        
        function setSnakeBody(slot) {
            slot.setSolid(true);
            slot.setUsed(true);
            slot.setBoolean('own-' + socket.playerId, true);
            slot.display = 'snack-head-right'
            slot.owner = socket.playerId;
            slot.color = socket.color;
            slot.color = socket.color;
        }
        
        function removeSnakeBody(slot) {
            slot.setSolid(false);
            slot.setUsed(false);
            slot.setBoolean('own-' + socket.playerId, false);
            delete slot.display;
            delete slot.owner;
            delete slot.color;
        }
        
        socket.on('disconnect', function () {
            console.log(socket.playerId + ' disconnected');
        })
        
        socket.emit('welcome', socket.playerId)

        
        socket.on('pre-start', function(version) {
            if (version !== VERSION) socket.disconnect();
            
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
            
            setSnakeBody(initialSlot)
            
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
                // removedSnakePart
                
                removeSnakeBody(removedSnakePart)
                
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
            
            setSnakeBody(secondSlot)
            
            var roomChanged = false;
            chunksToLoad.forEach(function(targetRoom) {
                var hasChunk = false;
                socket.currentListenChunks.forEach(function(room) {
                    if (room[0] === targetRoom[0] && room[1] === targetRoom[1]) {
                        hasChunk = true;
                    }
                })
                if (!hasChunk) {
                    // socket.currentListenChunks.push([targetRoom[0], targetRoom[1]])
                    console.log(socket.playerId + ' sending new chunk ' + 'chunk_' + targetRoom[0] + ',' + targetRoom[1])
                    socket.emit('chunk', map.getChunk(targetRoom[0], targetRoom[1]));
                    roomChanged = true
                }
            })
            if (roomChanged) {
                console.log(socket.playerId + ' center changed, sending new view for him')
                socket.currentListenChunks.forEach(function(room) {
                    var shouldUnload = true;
                    chunksToLoad.forEach(function(newRoom) {
                        if (room[0] === newRoom[0] && room[1] === newRoom[1]) {
                            shouldUnload = false;
                        }
                    })
                    if (shouldUnload) {
                        console.log(socket.playerId + ' leaving room ' + 'chunk_' + room[0] + ',' + room[1])
                        socket.leave('chunk_' + room[0] + ',' + room[1])
                    }
                })
                chunksToLoad.forEach(function(room) {
                    console.log(socket.playerId + ' join room ' + 'chunk_' + room[0] + ',' + room[1])
                    socket.join('chunk_' + room[0] + ',' + room[1])
                })
                socket.currentListenChunks = chunksToLoad;
                //leave 
            }
            // socket.join('chunk_' + chunkIndex.x + ',' + chunkIndex.y)
            
            console.log('brocasting changed chunk to room chunk_'  + chunkIndex.x + ',' + chunkIndex.y)
            sio.to('chunk_' + chunkIndex.x + ',' + chunkIndex.y)
                .emit('chunk', map.getChunk(chunkIndex.x, chunkIndex.y));
        })
        
        function killSnake() {
            
            console.log(socket.playerId + ' is dead')
            var chunksToHandle = {};
            
            socket.snakeParts.forEach(function (part) {
                var chunkIndex = map.getChunkIndex(part.x, part.y)
                chunksToHandle[chunkIndex.x + ',' + chunkIndex.y] = true
            });
            
            var chunks = Object.keys(chunksToHandle)
            .map(function (coord) {
                return coord.split(',').map(function (x) {
                    return parseInt(x, 10);
                })
            })
            .map(function (coord) {
                return map.getChunk(coord[0], coord[1])
            })
            
            chunks.forEach(function (chunk) {
                chunk.tree.findAllNode('own-' + socket.playerId, true).forEach(removeSnakeBody)
                
                sio.to('chunk_' + chunk.x + ',' + chunk.y)
                    .emit('chunk', chunk);
            })
            
            socket.snakeParts = [];
        }
        
        socket.on('dead', killSnake)
        socket.on('disconnect', killSnake)
    })
    
}