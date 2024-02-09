import GPTEngine from '../../utils/gpt-engines';
import OpenAI from 'openai';
// import process from "process";

export class GeneratorEngine {
	constructor(engine) {
		// Input Type : String based on GPTEngine enum
		// Specifying the type of GPT engine to query response

		this.modelLock = false; // Lock variable for call

		if (engine) {
			this.engine = engine;
		} else {
			// Specifying the default GPT engine as CHATGPT engine in case of no inputs
			this.engine = GPTEngine.CHATGPT;
		}
		if (this.engine === GPTEngine.CHATGPT) {
			const configuration = new OpenAI({
				apiKey: process.env.OPENAI_API_KEY,
			});
			this.openai = configuration;
		}
	}

	async getResponse(promptText) {
		// Input Type : prompt:string containing the string
		// Get the personalized prompt based on type of question and value
		// Output Type : string containing the response or null if any error arose

		if (promptText !== null) {
			// Calling respective engine based on value
			if (this.engine === GPTEngine.CHATGPT) {
				let response = await Promise.resolve(this.askChatGPT(promptText));
				return response;
			} else if (this.engine === GPTEngine.BARD) {
				return this.askBard(promptText);
			}
		}

		return null;
	}

	async askChatGPT(prompt) {
		// Input Type : prompt:string containing the string
		// Output Type : string containing the output, null if any error
		// TODO
		// Call chatgpt using API, don't push API keys in code
		if (this.modelLock === false) {
			this.modelLock = true;
			let responseContent = null;
			try {
				const response = await this.openai.createChatCompletion({
					model: 'gpt-3.5-turbo',
					messages: [{ role: 'user', content: prompt }],
				});
				responseContent = response.data.choices[0].message.content;
				console.log(responseContent);
			} catch (error) {
				if (error.response && error.response.status === 429) {
					const retryAfter =
						parseInt(error.response.headers['retry-after']) || 1;
					console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
				} else if (error.response) {
					console.error('API call error:', error.message);
					const retryAfter =
						parseInt(error.response.headers['retry-after']) || 1;
					console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
				} else {
					console.warn(error);
				}
			}
			this.modelLock = false;
			return responseContent;
		}
		// Promise.resolve((resolve) => setTimeout(resolve, 1000))
		return 'Already processing some other request! Try later';
	}

	askBard(prompt) {
		// Input Type : prompt:string containing the string
		// Output Type : string containing the output, null if any error
		// TODO
		// Call Bard using API calls, don't push API keys in code
		return 'Response of Prompt from Bard based on prompt';
	}
}
