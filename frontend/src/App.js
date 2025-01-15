import "./App.css";
import ChatPage from "./Pages/ChatPage";
import HomePage from "./Pages/HomePage";
import { Routes, Route } from "react-router-dom";
function App() {
  return (
    <div className="App" style={{ backgroundColor: "#d4cccc" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
    </div>
  );
}

export default App;
