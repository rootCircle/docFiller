import GPTEngine from '../../utils/gpt-engines';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv'; 
// Import dotenv for handling environment variables

dotenv.config({ path: './develop.sample.env' });

export class GeneratorEngine {
	constructor(engine) {
		this.modelLock = false;

		if (engine) {
			this.selectedEngine = engine;
		} else {
			this.selectedEngine = GPTEngine.CHATGPT; 
		}

		if (this.selectedEngine === GPTEngine.CHATGPT) {
			const openaiConfiguration = new Configuration({
				apiKey: process.env.OPENAI_API_KEY, 
			});
			this.chatGpt = new OpenAIApi(openaiConfiguration);
		}
	}

	async getResponse(promptText) {
		if (promptText !== null) {
			if (this.selectedEngine === GPTEngine.CHATGPT) {
				let chatGptResponse = await this.askChatGpt(promptText);
				return chatGptResponse;
			} else if (this.selectedEngine === GPTEngine.BARD) {
				let bardResponse = await this.askBard(promptText);
				return bardResponse;
			}
		}

		return null;
	}

	async askChatGpt(prompt) {
		if (this.modelLock === false) {
			this.modelLock = true;
			let chatGptResponseContent = null;
			try {
				const chatGptResponse = await this.chatGpt.createChatCompletion({
					model: 'gpt-3.5-turbo',
					messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: prompt }],
				});
				chatGptResponseContent = chatGptResponse.data.choices[0].message.content;
				console.log(chatGptResponseContent);
			} catch (error) {
				if (error.response && error.response.status === 429) {
					const retryAfter = parseInt(error.response.headers['retry-after']) || 1;
					console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
				} else if (error.response) {
					console.error('ChatGPT API call error:', error.message);
					const retryAfter = parseInt(error.response.headers['retry-after']) || 1;
					console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
				} else {
					console.warn(error);
				}
			}
			this.modelLock = false;
			return chatGptResponseContent;
		}
		return 'Already processing some other request! Try later';
	}

	async askBard(prompt) {
		if (this.modelLock === false) {
			this.modelLock = true;
			let bardResponseContent = null;
			try { 
				// BARD API Call, Replace 'BARD_API_KEY' with your actual Bard API key
				const bardApiResponse = await fetch('https://api.bardengine.com/endpoint', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': 'BARD_API_KEY',
					},
					body: JSON.stringify({ prompt }),
				});

				bardResponseContent = await bardApiResponse.text();
				console.log(bardResponseContent);
			} catch (error) {
				console.error('Bard API call error:', error);
			}
			this.modelLock = false;
			return bardResponseContent;
		}
		return 'Already processing some other request! Try later';
	}
}
