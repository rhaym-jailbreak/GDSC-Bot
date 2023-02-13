import { aifr } from "./ChatGPT/openai.js";

async function launch() {
    try {
        await aifr();
    } catch (error) {
        console.error(error);
    }
}

launch();