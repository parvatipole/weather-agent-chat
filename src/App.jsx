import ChatWindow from "./components/ChatWindow";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-4 px-4">
      <div className="max-w-6xl mx-auto h-full">
        <div className="flex items-center justify-center min-h-[calc(100vh-2rem)]">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}

export default App;
