import dotenv from 'dotenv'
dotenv.config()

const conversationMap = {}
let conversationTimeLimit = parseInt(process.env.CONVERSATION_MEMORY_SECONDS)*1000 //set timelimit for conversations

if(!conversationTimeLimit || conversationTimeLimit <= 0) {
    conversationTimeLimit = 300000
}

function getConversation(userid) { //getting conversations from users, and set last seen time
    let conversation  = {
        conversationID:undefined,
        parentMessageID:undefined
    }

    if(conversationMap[userid]) {
        conversation = conversationMap[userid]
        conversation.newConversation = false
    }
    else {
        conversationMap[userid] = conversation
        conversation.newConversation = true
    }

    conversationTimeLimit.lastSeen = Date.now()

    return conversation
}

function resetConversation(userid){ // function to reset conversations
    delete conversationMap[userid]
}

function rmUnactive(){ // Function to delete Unactive converations/threads
    try {
        const users = Object.keys(conversationMap)
        users.forEach((user)=>{
            const lastSeen = conversationMap[user].lastSeen
            if(Date.now() - lastSeen - conversationTimeLimit >= 0){
                delete conversationMap[user]
            }
        })
    } catch(e){}

    finally{
        setTimeout(rmUnactive, 60000)
    }

} 

rmUnactive()

export default {
    getConversation,
    resetConversation
}