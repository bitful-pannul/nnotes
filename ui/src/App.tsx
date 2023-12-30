import { useState, useEffect, useCallback } from "react";
import "./App.css";

const BASE_URL = import.meta.env.BASE_URL;
if (window.our) window.our.process = BASE_URL?.replace("/", "");


function App() {
  useEffect(() => {
    // Fetch notes when the component mounts
    fetch("/necnotes:necnotes:template.uq/notes")
      .then(response => response.json())
      .then(data => console.log("Fetched notes:", data.notes));
  }, []);


  return (
    <div style={{ width: "100%" }}>
      <h2>necnotes</h2>
      <div>yes hello test.</div>
    </div>
  );
}

export default App;
