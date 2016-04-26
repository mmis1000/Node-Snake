const Map = require("../lib/map").Map;

module.exports = function gameConnection (app, io, config) {
    var sio = io.of('/game');
    var map = new Map(64, 64);
    
    sio.on('connection', function (socket) {
        socket.playerId = config.getId(8);
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
            var start = Date.now();
            var node = map.getChunk(chunkIndex.x    , chunkIndex.y    ).findEmptySlot();
            
            node.setUsed(true);
            node.setBoolean('own-' + socket.playerId, true);
            
            var message = {
                x : x, y : y,
                chunks: [
                    map.getChunk(chunkIndex.x - 1, chunkIndex.y - 1),
                    map.getChunk(chunkIndex.x - 1, chunkIndex.y    ),
                    map.getChunk(chunkIndex.x - 1, chunkIndex.y + 1),
                    map.getChunk(chunkIndex.x    , chunkIndex.y - 1),
                    map.getChunk(chunkIndex.x    , chunkIndex.y    ),
                    map.getChunk(chunkIndex.x    , chunkIndex.y + 1),
                    map.getChunk(chunkIndex.x + 1, chunkIndex.y - 1),
                    map.getChunk(chunkIndex.x + 1, chunkIndex.y    ),
                    map.getChunk(chunkIndex.x + 1, chunkIndex.y + 1)
                ]
            }
            console.log(socket.playerId + ' prepared map used ' + (Date.now() - start) + ' ms')
            socket.emit('start', message)
        })
    })
}