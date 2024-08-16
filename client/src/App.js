// src/App.js
import React, { useState } from "react";
import "./App.css";

function TranslationApp() {
  // State variables for managing input and output
  const [text, setText] = useState(""); // Text to be translated
  const [translatedText, setTranslatedText] = useState(""); // Translated text
  const [sourceLang, setSourceLang] = useState("en"); // Source language
  const [targetLang, setTargetLang] = useState("es"); // Target language

  // Function to handle translation (to be implemented later)
  const handleTranslate = async () => {
    if (!text) return;

    try {
      const response = await fetch("http://localhost:3001/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error("Translation request failed");
      }

      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch (error) {
      console.error("Error translating text:", error);
      setTranslatedText("Translation failed. Please try again.");
    }
  };

  return (
    <div className="App">
      <h1>Text Translation App</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to translate"
      />
      <div>
        <label>
          Source Language:
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            {/* Add more language options as needed */}
          </select>
        </label>
        <label>
          Target Language:
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            {/* Add more language options as needed */}
          </select>
        </label>
      </div>
      <button onClick={handleTranslate}>Translate</button>
      <h2>Translated Text:</h2>
      <p>{translatedText}</p>
    </div>
  );
}

export default TranslationApp;
