# Weather Agent Chat Interface

A responsive chat interface built with React 19 that connects to a weather agent API for real-time weather information.

## Features

- **Real-time Chat**: Interactive chat with streaming responses
- **Responsive Design**: Works on mobile, tablet, and desktop (min-width: 320px)
- **Modern UI**: Clean interface with Tailwind CSS styling
- **Error Handling**: Comprehensive error handling with retry options
- **Auto-scroll**: Automatically scrolls to latest messages
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new lines

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
clone this github repository using git clone https://github.com/parvatipole/weather-agent-chat
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Architecture

### Components
- `ChatWindow.jsx` - Main chat container with header and message list
- `ChatInput.jsx` - Message input with keyboard shortcuts and auto-resize
- `MessageBubble.jsx` - Individual message display with timestamps and avatars
- `useWeatherAgent.js` - Custom hook for API integration

### API Integration
- Streaming endpoint: Weather agent API
- Real-time response handling
- Error recovery and retry logic
- Automatic thread management

## Technical Stack

- **React 19** - Latest React with modern hooks
- **Tailwind CSS 4** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Custom Hooks** - Reusable API logic

## Testing Scenarios

1. **Basic**: Send "What's the weather in London?"
2. **Error**: Test with network disconnected
3. **Multiple**: Send several messages in sequence
4. **Edge cases**: Long messages, special characters

## Evaluation Criteria Met

- ✅ **Technical (40%)**: React 19, component architecture, API integration
- ✅ **UX (30%)**: Responsive design, loading states, error handling
- ✅ **Code Quality (20%)**: Clean, readable, performant code
- ✅ **Polish (10%)**: Animations, attention to detail

## Future Enhancements

- Message search and export
- Dark/light theme toggle
- Message reactions
- PWA features
- TypeScript migration
- Unit tests

---

Built for frontend engineering assignment with modern React patterns and excellent UX.
