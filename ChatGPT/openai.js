import dotenv from 'dotenv'
import {ChatGPTAPIBrowser} from 'chatgpt'
import {Client, GatewayIntentBits, REST, Routes, Partials, ChannelType, AttachmentBuilder } from 'discord.js';
import Conversations from '../ChatGPT/conversation.js'
import stableDiffusion from '../ChatGPT/stablediffusion.js';

const MRCL = process.env.MAX_RESPONSE_CHUNK_LENGTH
dotenv.config()

// Initialize OpenAI Session
async function initChatGPT() {
    const loginType = process.env.LOGIN_TYPE;
    const accountType = process.env.ACCOUNT_TYPE;

    if (loginType === 'openai' && accountType === 'free') {
        const api = new ChatGPTAPIBrowser({
            email: process.env.EMAIL,
            password: process.env.PASSWORD
        });
        await api.initSession();
        return api;
    }
    else if (loginType === 'google' && accountType === 'free') {
        const api = new ChatGPTAPIBrowser({
            email: process.env.EMAIL,
            password: process.env.PASSWORD,
            isGoogleLogin: true
        });
        await api.initSession();
        return api;
    }
    else if (loginType === 'openai' && accountType === 'pro') {
        const api = new ChatGPTAPIBrowser({
            email: process.env.EMAIL,
            password: process.env.PASSWORD,
            isProAccount: true
        });
        await api.initSession();
        return api;
    }
    else if (loginType === 'google' && accountType === 'pro') {
        const api = new ChatGPTAPIBrowser({
            email: process.env.EMAIL,
            password: process.env.PASSWORD,
            isGoogleLogin: true,
            isProAccount: true
        });
        await api.initSession();
        return api;
    }
    else {
        console.log(chalk.red('AI-Bot Error: Not a valid loginType or accountType'));
    }
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

        const { conversationInfo } = opts

        let tmr = setTimeout(() => {
            cb("Oppss, something went wrong! (Timeout)")
        }, 120000)

        if (process.env.CONVERSATION_START_PROMPT.toLowerCase() != "false" && conversationInfo.newConversation) {
            await chatGTP.sendMessage(process.env.CONVERSATION_START_PROMPT, {
                conversationId: conversationInfo.conversationId,
                parentMessageId: conversationInfo.parentMessageId
            }).then(response => {
                conversationInfo.conversationId = response.conversationId
                conversationInfo.parentMessageId = response.messageId
                clearTimeout(tmr)
                tmr = setTimeout(() => {
                    cb("Oppss, something went wrong! (Timeout)")
                }, 45000)
            }).catch((e) => {
                cb("Oppss, something went wrong! (Error)")
                console.error("dm error : " + e)
            })
        }

        if (conversationInfo) {
            chatGTP.sendMessage(question, {
                conversationId: conversationInfo.conversationId,
                parentMessageId: conversationInfo.parentMessageId
            }).then(response => {
                conversationInfo.conversationId = response.conversationId
                conversationInfo.parentMessageId = response.messageId
                clearTimeout(tmr)
                cb(response.response)
            }).catch((e) => {
                cb("Oppss, something went wrong! (Error)")
                console.error("dm error : " + e)
            })
        } else {
            chatGTP.sendMessage(question).then(({ response }) => {
                //console.log(response)
                clearTimeout(tmr)
                cb(response)
            }).catch((e) => {
                cb("Oppss, something went wrong! (Error)")
                console.error("/ask error : " + e)
            })
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