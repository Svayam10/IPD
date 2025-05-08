import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Form from "./Components/Form";
import Recommendations from "./Components/Recommendations";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/recommendations" element={<Recommendations />} />
      </Routes>
    </Router>
  );
};

export default App;