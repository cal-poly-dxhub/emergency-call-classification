import { BrowserRouter, Link, Route, Routes } from "react-router-dom"

//pages
import Landing from "./pages/Landing"
import Call from "./pages/Call"
import PoliceInfo from "./pages/PoliceInfo"

function App() {
  

  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/calls/:id/" element={<Call />} />
          <Route path="/PoliceInfo/" element={<PoliceInfo />}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
