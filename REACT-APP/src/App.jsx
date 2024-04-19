import { BrowserRouter, Link, Route, Routes } from "react-router-dom"

//pages
import Landing from "./pages/Landing";
import Call from "./pages/Call";

function App() {
  

  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/calls/:id/" element={<Call />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
