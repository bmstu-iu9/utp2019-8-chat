'use strict'

const PING_INTERVAL = 30; //In seconds

let wss;
let ids = 1;
let aliveCheckerId = undefined;

module.exports.broadcast = (channel_id, msg) => {
    wss.clients.forEach((e) => {
        if (e.channel_id === channel_id) {
            e.send(JSON.stringify({
                success: true,
                type: "new_message",
                data: msg
            }));
        }
    })
}

module.exports.init = (WebSocket) => {
    wss = WebSocket;
    wss.on('connection', (ws) => {
        ws.isAlive = true;
        
        ws.on('pong', () => {
            ws.isAlive = true;
        });
    
        ws.on('message', (message) => {
            // console.log('received: %s', message);
            let res = JSON.parse(message);
            if (res.type === "send_message") {
                this.broadcast(res.channel_id, {
                    message_id: ids++,
                    author_id: res.author_id,
                    author_name: res.author_name,
                    message: res.message
                });
            }
            else if (res.type === "set_channel") {
                ws.channel_id = res.channel_id;
            }
        });
    });
    
    aliveCheckerId = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (!ws.isAlive) 
                return ws.terminate();
            ws.isAlive = false;
            ws.ping(null, false, true);
        });
    }, PING_INTERVAL * 1000);
}