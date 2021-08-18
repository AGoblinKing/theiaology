import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8080 })

const bridges: {[k: string]: Set<WebSocketServer>} = {}
const users = {}
wss.on('connection', (ws) => {
    ws.on('close', () => {
        bridges[]
    })
  ws.on('message', (msg) => {
 
      switch (typeof msg) {
     
     // subscribe or unsubscribe to room
        case "number":
            
        break
      case "object":
        // first
        const data = new DataView(msg)


        const bridge = data.getUint32(0)
        if(!bridges[bridge]) {
            bridges[bridge] = new Set()
        }
        break
    }
  })
})
