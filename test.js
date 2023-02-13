import stableDiffusion from './ChatGPT/stablediffusion.js';
const prompt = "mars planet"
console.log("Prompt:", prompt);
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
        }
        console.log(`Done.`, result);
    } catch (e) {
        console.log("Error happened while attaching image...");
    }

})
