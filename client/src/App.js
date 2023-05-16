import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";


import CreateJSON from "./CreateJSON";
import IndexData from "./indexData";

function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        
        <Route exact path="/" element={<CreateJSON />} />
        <Route exact path="/indexdata" element={<IndexData />} />
       
        {/* <Route exact path="/nftdashboard" element={<Dashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
