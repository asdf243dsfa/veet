# IntelliMeet

Enterprise-grade AI-powered multilingual video communications platform built with [Cloudflare Pages](https://developers.cloudflare.com/pages/) and [Durable Objects](https://developers.cloudflare.com/durable-objects/).

## Features

- 🌐 **Multilingual Support**: Real-time AI translation across 11 languages
- 🤖 **AI-Powered**: Built with OpenAI GPT-4o-mini for accurate translations
- 🚀 **Enterprise-Ready**: Professional interface and branding
- 📱 **Responsive Design**: Works seamlessly across all devices
- ⚡ **Real-time**: WebRTC peer-to-peer video with WebSocket signaling
- 🔒 **Secure**: End-to-end encrypted video communications

## Video tutorials 

- [Build a Video Call App with Durable Objects](https://www.youtube.com/playlist?list=PLzfTyn6__SjgC2ty1_BAl0RGgr2jKjngz)

## How It Works

![Architecture](./images/arch.jpg)
Peer to peer connection for video and audio stream is delivered over [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API). Peer discovery and signalling is powered by [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) over [Durable Objects](https://developers.cloudflare.com/durable-objects/api/websockets/).

The diagram below explains how signalling over WebSocket happens on the frontend
![Signalling](./images/timing.png)

# Setup & Translation

## Prerequisites
- OpenAI API key for translations ([Get here](https://platform.openai.com/api-keys))

## Local Development
Clone the repository:
```sh
git clone https://github.com/megaconfidence/veet.git
cd veet
```

### Generate Translations
```sh
cd client
npm install
npm run translate -- --api-key=your-openai-key-here
```

### Start Development Server
```sh
npm run dev  # Available on http://localhost:8788
```

### Start Server (separate terminal)
```sh
cd ../server
npm install
npm start  # Available on ws://localhost:8787
```

## Deployment
Deploy client and server:
```sh
# Client
cd client && npm run deploy

# Server  
cd ../server && npm run deploy
```

Update `env.ws` in [`client/public/call/index.js`](https://github.com/megaconfidence/veet/blob/bb50f00158571b8ab2fa755f8e33476941ee393d/client/public/call/index.js#L12) with deployed server address.

## Supported Languages
English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese (Simplified), Arabic, Hindi

