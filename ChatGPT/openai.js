import dotenv from 'dotenv'
import {ChatGPTUnofficialProxyAPI} from 'chatgpt'
import OpenAITokenGen from 'aikey'
import {Client, GatewayIntentBits, REST, Routes, Partials, ChannelType, AttachmentBuilder } from 'discord.js';
import Conversations from '../ChatGPT/conversation.js'
import stableDiffusion from '../ChatGPT/stablediffusion.js';

const MRCL = process.env.MAX_RESPONSE_CHUNK_LENGTH
dotenv.config()

// Initialize OpenAI Session
const chatGPT = {
    init: false,
    sendMessage: null,
}
async function initChatGPT() {
    const tokengen = new OpenAITokenGen();
    const accessToken = await (await tokengen.login(process.env.OPENAI_EMAIL, process.env.OPENAI_PASSWORD)).accessToken
    const api = new ChatGPTUnofficialProxyAPI ({
        accessToken: accessToken ,
        apiReverseProxyUrl: process.env.REVERSE_PROXY_SERVER
    })

    chatGPT.sendMessage = async (message, opts = {}) => {
        let result = await api.sendMessage(message, {
            ...opts
        })

        result.parentMessageId = result.id
        return result
    }
    chatGPT.init = true
    
    setTimeout(initChatGPT, 8*60*60*1000) //renew Access token every 8 hours
}

export async function aifr() {
    const chatGTP = await initChatGPT().catch(e => {
        console.error(e)
        process.exit()
    })


    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.DirectMessageTyping,
            GatewayIntentBits.MessageContent,
        ],
        partials: [Partials.Channel]
    });

    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
        console.log(new Date())
    });

    async function askQuestion(question, cb, opts = {}) {

        if (!chatGPT.init) {
            cb("Chatgpt not initialized!")
            return;
        }
    
        const { conversationInfo } = opts
    
        let tmr = setTimeout(() => {
            cb("Oppss, something went wrong! (Timeout)")
        }, 600000)
    
        if (process.env.CONVERSATION_START_PROMPT.toLowerCase() != "false" && conversationInfo.newConversation) {
            question = process.env.CONVERSATION_START_PROMPT + "\n\n" + question
        }
    
        try{
            const response = await chatGPT.sendMessage(question, {
                conversationId: conversationInfo.conversationId,
                parentMessageId: conversationInfo.parentMessageId
            })
            conversationInfo.conversationId = response.conversationId
            conversationInfo.parentMessageId = response.parentMessageId
            cb(response.text)
        }catch(e){
            cb("Oppss, something went wrong! (Error)")
            console.error("dm error : " + e)
        }finally{
            clearTimeout(tmr)
        }
    }


    const targetWords = ["gpt", "ai", "chatgpt", "openai"];

    client.on("messageCreate", async message => {
        if (!message.author.bot && (message.channel.type == ChannelType.DM || targetWords.some(word => message.channel.name.includes(word)))) {

            const user = message.author

            console.log("----New Prompt---")
            console.log("Date    : " + new Date())
            console.log("UserId  : " + user.id)
            console.log("User    : " + user.username)
            console.log("Message : " + message.content)
            console.log("--------------")

            if (message.content.toLowerCase() == "reset") {
                Conversations.resetConversation(user.id)
                message.reply("Alright!")
                return;
            }
            
            if (message.content.toLowerCase() == "who developed this bot?") {
                await message.channel.sendTyping();
                message.reply("Ghellab Abderrahmane (Rhaym), Computer Sciences student at University of Boumerdes Faculty of Sciences, Apps/Games developer (Windows/MacOS/iOS), Gamer, frontend web dev and UI/UX designer developed this bot")
                return;
            }

            if (message.content.toLowerCase().includes("generate image:")) {
                const prompt = message.content.substring(15)
                try {
                    await message.channel.sendTyping();
                    stableDiffusion.generate(prompt, async (result) => {
                        if (result.error) {
                            await message.reply("Error happened while generating image...")
                            return;
                        }
                        try {
                            const attachments = []
                            for (let i = 0; i < result.results.length; i++) {
                                let data = result.results[i].split(",")[1]
                                const buffer = Buffer.from(data, "base64")
                                let attachment = new AttachmentBuilder(buffer, { name: "result0.jpg" })
                                attachments.push(buffer)
                            }
                            await message.reply(attachments)
                            console.log(attachments)
                        } catch (e) {
                            console.error(e)
                            await message.reply("Error happened while attaching image...")
                        }
            
                    })
                } catch (e) {
                    console.error(e)
                }
                return;
            }
            

            let conversationInfo = Conversations.getConversation(user.id)
            try {
                await message.channel.sendTyping();
                askQuestion(message.content, async (response) => {
                    if (response.length >= MRCL) {
                        const attachment = new AttachmentBuilder(Buffer.from(content, 'utf-8'), { name: 'response.txt' });
                        await message.reply(`Sorry, but response is longer than discord message length limit, so I've attached the response as a txt file.`, { files: [attachment] });
                    } else {
                        await message.reply(response)
                    }
                }, { conversationInfo })
            } catch (e) {
                console.error(e)
            }
        }
        else {
            return;
        }
    })

    client.login(process.env.DISCORD_BOT_TOKEN);
}