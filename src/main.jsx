import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./component/Home";
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import Card from "./component/Card";




function App() {
  return(

    <Routes>
        <Route path="/" element={<Home />} />
  </ Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<BrowserRouter><App /></BrowserRouter>);

