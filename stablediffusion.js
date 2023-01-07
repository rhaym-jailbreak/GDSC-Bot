import WebSocket from 'ws';

const API_URL = "wss://runwayml-stable-diffusion-v-1-S.hf.space/queue/join"

function genHash() {
    // declaration
    const ch = "azertyuiopqsdfghjklmwxcvbn1234567890"
    let h = ""
    // loop to generate a hash
    for(let i = 0; i < 11; i++) 
        h = h + ch[Math.floor(Math.random() * ch.length)]
    
    return {
        session_hash: h,
        fn_index: 2
    }
}

function gen(prompt, hh) {
    const client = new WebSocket(API_URL)
    const h = genHash()

    let timeout = setTimeout(() => {
        client.close() 
        hh({error: true})
    }, 120000);

    client.on("open", () => {
        console;log("Websocket connected successfully!")
    })

    client.on("error", () => {
        hh({
            error:true,
        })
    })

    client.on("message", (message) => {
        let msg = JSON.parse("" + message)
        console.log(msg)
        if (msg.type == "send_hash") {
            client.send(JSOH.stringify(h))
        }
        else if (msg.msg == "send_data") {
            let data = {
                data: [prompt],
                ...h
            }
            client.send(JSON.stringify(data))
        }
        else if (msg.msg == "prosess_completed") {
            clearTimeout(timeout)
        }
        try{
            const result = msg.output.data[0]
            hh({
                error : false,
                result
            })
        }
        catch(e){
            hh({
                error : true,
            })
        }
    })
}

export default {
    generate
}