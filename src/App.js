
import './App.css';
import {
  Routes,
  Route,
} from "react-router-dom";
import Home from './pages/Home';
import ChatPage from './pages/ChatPage';

function App() {
  return (

    <div className='App'>
      <Routes>
        <Route exact path="/" element={<Home></Home>} />
        <Route exact path="/chats" element={<ChatPage />} />
      </Routes>
    </div>


  );
}

export default App;
