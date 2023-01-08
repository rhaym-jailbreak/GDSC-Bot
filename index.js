import dotenv from 'dotenv'
import { ChatGPTAPIBrowser } from 'chatgpt'
import { AttachmentBuilder, ChannelType, Client, GatewayIntentBits, REST } from 'discord.js'
import conversation from './conversation'
import stablediffusion from './stablediffusion'

const MRCL = 1500 //Max response chunk length

dotenv.config()

const commands = [{
    name: 'Question',
    description: 'Feel free to ask the bot',
    type: '3',
    required: true
},
{
    name: 'help',
    description: 'Get all commands',
    type: '3',
    required: true
}];

async function ChatGPT() {
    // we use puppeteer to bypass cloudflare check (headful because of captchas)
    const api = new ChatGPTAPIBrowser({
        email: process.env.OPENAI_EMAIL,
        password: process.env.OPENAI_PASSWORD
    })

    await api.initSession()

    const result = await api.sendMessage('Here we go...')
    console.log(result.response)

    return {
        sendMessage: (message, opts = {}) => {
            return api.sendMessage(message, opts)
        }
    }
}

async function Commands() {
    const rest = new REST({ version: '10'}).setToken(process.env.DISCORD_BOT_TOKEN);

    try {
        console.log('refreshing commands...');
        await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {body: commands});
        console.log('reloaded commands successfully');
    }
    catch (error) {
        console.error(error);
    }
}

async function main() {
    const OpenAI = await ChatGPT().catch(e => {
        console.error(e)
        process.exit()
    })

    await Commands()

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.DirectMessageTyping,
            GatewayIntentBits.MessageContent
        ],
        partials: [Partials.Channel]
    });

    client.on('ready', () => {
        console.log('Logged in as ${client.user.tag} successfully!');
        console.log(new Date())
    });

    async function Ask(question, hh, opts = {}) {

        const {conversationfo} = opts

        let timeout = setTimeout(() => { 
            hh("Oh no, something went wrong!, (Timeout)")
        }, 4500)

        if(process.env.CONVERSATION_START_PROMPET.toLowerCase() != "false" && conversationfo.newConversation){
            await OpenAI.sendMessage(process.env.CONVERSATION_START_PROMPET, {
                conversationID: conversationfo.conversationID,
                parentMessageID: conversationfo.parentMessageID
                }).then(resonse => {
                clearTimeout(timeout)
                timeout = setTimeout(() => {
                    hh("Oh no, something went wrong!, (Timeout)")
                }, 4500)
            }).catch((e) => {
                hh("Oh no, something went wrong!, (Error)")
                console.error("DM error: " + e)
            })
        }
        
        if (conversationfo) {
            OpenAI.sendMessage(question, {
                conversationID: conversationfo.conversationID,
                parentMessageID: conversationfo.parentMessageID
            }).then(responce => {
                conversationfo.conversationID = response.conversationID
                conversationfo.parentMessageID = response.messageID
                clearTimeout(timeout)
                hh(response.response)
            }).catch((e) => {
                hh("Oh no, something went wrong!, (Error)")
                console.error("DM error: " + e)
            })
        }
        else {
            OpenAI.sendMessage(question).then(({response}) => {
                console.log(response)
                clearTimeout(timeout)
                hh(response)
            }).catch((e) => {
                hh("Oh no, something went wrong!, (Error)")
                console.error("/question error: " + e)
            })
        }
    }

    async function SSR(resp, usr) { // a function to split and send ChatGPT's response to user
        let tcount = 3;
        while (resp.length > 0 && tcount > 0) {
            try {
                let End = Math.min(MRCL, resp.length)
                await usr.send(resp.slice(0, End))
                resp = resp.slice(End, resp.length)
            } catch(e) {
                tcount--
                console.error("SSR error: " + e + "/ Counter " + tcount)
            }
        }

        if(tcount <= 0)
            throw "Failed to send DM :("
    }

    client.on("messageCreate", async message => {
        if(process.env.ENABLE_DMS !== "true" || message.channel.type != ChannelType.DM || message.author.bot)
            return;
        
        const usr = message.author

        console.log("--------DMs--------")
        console.log("Date       : " + new Date())
        console.log("UserID     : " + usr.id)
        console.log("User       : " + usr.username)
        console.log("Message    : " + message.content)
        console.log("--------------------")

        if(message.content.toLocaleLowerCase() == "rest") {
            conversation.resetConversation(usr.id)
            usr.send("Who are you ?")
            return;
        }

        let conversationfo = conversation.getConversation(usr.id)
        try {
            let sentMessage = await usr.send("GDSC bot is thinking...")
            question(message.content, async(response) => {
                if(response.length >= MRCL)
                    SSR(response, usr)
                else
                    await sentMessage.edit(response)
            }, {conversationfo})
        } catch(e) {
            console.error(e)
        }
    })

    async function hinteraction_ask(interactions) {
        const usr = interactions.usr

        //Here we start the coversation

        let conversationfo = conversation.getConversation(usr.id)

        const question = interactions.options.getString("question")
        try {
            await interactions.deferReply()
            Ask(question, async(content) => {
                if(content.length >= MRCL){
                    const attachment = new AttachmentBuilder(Buffer.from(content, 'utf-8'), { name : 'response.txt' });
                    await interactions.editReply({files: [attachment]})
                }
                else {
                    await interactions.editReply({content})
                }
            }, {conversationfo})
        } catch(e) {
            console.log(e)
        }
    }

    client.on("interactionCreate", async interactions => {
        if(interactions.commandName == "ask") 
            hinteraction_ask(interactions)
    });

    client.loggin(process.env.DISCORD_BOT_TOKEN);
}

main()