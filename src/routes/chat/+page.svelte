<script lang="ts">
	import { onMount } from 'svelte';

	interface Message {
		id: string;
		role: 'user' | 'assistant';
		content: string;
		timestamp: Date;
	}

	let messages: Message[] = [];
	let inputValue = '';
	let isLoading = false;
	let error: string | null = null;
	let messagesContainer: HTMLDivElement;

	const API_ENDPOINT = '/api/ai_agent';

	onMount(() => {
		// Scroll to bottom on mount
		scrollToBottom();
	});

	function scrollToBottom() {
		if (messagesContainer) {
			setTimeout(() => {
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			}, 0);
		}
	}

	async function sendMessage() {
		if (!inputValue.trim()) return;

		// Add user message
		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: inputValue,
			timestamp: new Date()
		};

		messages = [...messages, userMessage];
		inputValue = '';
		isLoading = true;
		error = null;

		scrollToBottom();

		try {
			const response = await fetch(API_ENDPOINT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: userMessage.content,
					conversationHistory: messages.slice(0, -1).map(m => ({
						role: m.role,
						content: m.content
					}))
				})
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();

			// Add assistant message
			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: data.response || data.message || data.result || JSON.stringify(data),
				timestamp: new Date()
			};

			messages = [...messages, assistantMessage];
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
			console.error('API Error:', err);
		} finally {
			isLoading = false;
			scrollToBottom();
		}
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}
</script>

<div class="chat-container">
	<div class="chat-header">
		<h1>AI Agent Chat</h1>
		<p class="endpoint-info">Connected to: {API_ENDPOINT}</p>
	</div>

	<div class="messages-container" bind:this={messagesContainer}>
		{#if messages.length === 0}
			<div class="welcome-message">
				<h2>Welcome to AI Agent Chat</h2>
				<p>Start a conversation with the AI agent. Type your message below and press Enter or click Send.</p>
			</div>
		{/if}

		{#each messages as message (message.id)}
			<div class="message message-{message.role}">
				<div class="message-content">
					<div class="message-role">{message.role === 'user' ? 'You' : 'AI Agent'}</div>
					<div class="message-text">{message.content}</div>
					<div class="message-time">
						{message.timestamp.toLocaleTimeString()}
					</div>
				</div>
			</div>
		{/each}

		{#if isLoading}
			<div class="message message-assistant">
				<div class="message-content">
					<div class="message-role">AI Agent</div>
					<div class="message-text loading">
						<span></span>
						<span></span>
						<span></span>
					</div>
				</div>
			</div>
		{/if}

		{#if error}
			<div class="error-message">
				<strong>Error:</strong> {error}
			</div>
		{/if}
	</div>

	<div class="input-section">
		<textarea
			bind:value={inputValue}
			placeholder="Type your message... (Shift+Enter for new line, Enter to send)"
			disabled={isLoading}
			on:keypress={handleKeyPress}
		></textarea>
		<button on:click={sendMessage} disabled={isLoading || !inputValue.trim()}>
			{isLoading ? 'Sending...' : 'Send'}
		</button>
	</div>
</div>

<style>
	.chat-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}

	.chat-header {
		background: rgba(0, 0, 0, 0.1);
		padding: 20px;
		color: white;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.chat-header h1 {
		margin: 0 0 8px 0;
		font-size: 24px;
	}

	.endpoint-info {
		margin: 0;
		font-size: 12px;
		opacity: 0.8;
		word-break: break-all;
	}

	.messages-container {
		flex: 1;
		overflow-y: auto;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		background: rgba(255, 255, 255, 0.05);
	}

	.welcome-message {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: rgba(255, 255, 255, 0.7);
		text-align: center;
	}

	.welcome-message h2 {
		margin: 0 0 12px 0;
		font-size: 28px;
	}

	.welcome-message p {
		margin: 0;
		font-size: 16px;
		max-width: 400px;
	}

	.message {
		display: flex;
		margin-bottom: 4px;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.message-user {
		justify-content: flex-end;
	}

	.message-assistant {
		justify-content: flex-start;
	}

	.message-content {
		max-width: 70%;
		padding: 12px 16px;
		border-radius: 12px;
		word-wrap: break-word;
	}

	.message-user .message-content {
		background: #667eea;
		color: white;
		border-bottom-right-radius: 4px;
	}

	.message-assistant .message-content {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border-bottom-left-radius: 4px;
	}

	.message-role {
		font-size: 12px;
		font-weight: 600;
		opacity: 0.8;
		margin-bottom: 4px;
	}

	.message-text {
		font-size: 15px;
		line-height: 1.5;
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	.message-time {
		font-size: 11px;
		opacity: 0.7;
		margin-top: 4px;
	}

	.loading {
		display: flex;
		gap: 4px;
		align-items: center;
		height: 20px;
	}

	.loading span {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.7);
		animation: bounce 1.4s infinite;
	}

	.loading span:nth-child(2) {
		animation-delay: 0.2s;
	}

	.loading span:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes bounce {
		0%,
		80%,
		100% {
			transform: scale(1);
			opacity: 0.7;
		}
		40% {
			transform: scale(1.2);
			opacity: 1;
		}
	}

	.error-message {
		background: rgba(239, 68, 68, 0.3);
		border: 1px solid rgba(239, 68, 68, 0.5);
		color: #fca5a5;
		padding: 12px 16px;
		border-radius: 8px;
		font-size: 14px;
	}

	.input-section {
		display: flex;
		gap: 12px;
		padding: 20px;
		background: rgba(0, 0, 0, 0.1);
		border-top: 1px solid rgba(255, 255, 255, 0.2);
	}

	textarea {
		flex: 1;
		padding: 12px 16px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		font-size: 15px;
		font-family: inherit;
		resize: none;
		min-height: 50px;
		max-height: 120px;
		transition: all 0.3s ease;
	}

	textarea::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	textarea:focus {
		outline: none;
		border-color: rgba(255, 255, 255, 0.5);
		background: rgba(255, 255, 255, 0.15);
	}

	textarea:disabled {
		opacity: 0.6;
	}

	button {
		padding: 12px 28px;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		min-width: 100px;
	}

	button:hover:not(:disabled) {
		background: #5568d3;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	button:active:not(:disabled) {
		transform: translateY(0);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Scrollbar styling */
	.messages-container::-webkit-scrollbar {
		width: 8px;
	}

	.messages-container::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
	}

	.messages-container::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
	}

	.messages-container::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.3);
	}
</style>
