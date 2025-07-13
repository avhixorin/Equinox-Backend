import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";
dotenv.config();

const client = new InferenceClient(process.env.HF_TOKEN);

for (let i = 0; i < 100; i++) {
    const chatCompletion = await client.chatCompletion({
        model: "deepseek-ai/DeepSeek-V3-0324",
        messages: [
            {
                role: "user",
                content: "How many 'G's in 'huggingface'?",
            },
        ],
    });

    console.log(chatCompletion.choices[0].message);
}