import React, { useState } from "react";
import { ReactTransliterate } from "react-transliterate";
import "react-transliterate/dist/index.css";
// import "bootstrap/dist/css/bootstrap.min.css";

const HindiInputBootstrap = () => {
  const [text, setText] = useState("");
  const [lang] = useState("hi"); // Hindi language

  return (
    <div className="container mt-4" style={{ fontFamily: "Mangal, sans-serif" }}>
      <h4 className="mb-3 text-center">
        Type in English → Automatically Converts to Hindi
      </h4>

      <div className="mb-3">
        <ReactTransliterate
          lang={lang}
          value={text}
          onChangeText={(txt) => setText(txt)}
          renderComponent={(props) => (
            <textarea
              {...props}
              className="form-control"
              rows={5}
              placeholder="Type here in English..."
              style={{
                fontFamily: "Mangal, sans-serif",
                fontSize: "18px",
                borderRadius: "10px",
              }}
            />
          )}
        />
      </div>

      <div
        className="p-3 border rounded bg-light"
        style={{ fontSize: "20px", minHeight: "80px" }}
      >
        {text}
      </div>
    </div>
  );
};

export default HindiInputBootstrap;
