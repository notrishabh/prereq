"use client";

import { useState } from "react";
import parse from "html-react-parser";

export default function Home() {
  const [response, setResponse] = useState("");
  const [ques, setQues] = useState("");
  const getAiResponse = async () => {
    const x = await fetch(`http://localhost:8080/ai?q=${ques}`);
    setResponse(await x.text());
  };
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQues(event.target.value);
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <section className="space-y-8 flex flex-col justify-center items-center w-full">
        <h1 className="text-3xl">What are you building?</h1>
        <input
          onChange={handleInput}
          className="p-4 bg-gray-800 text-xl w-2/3 rounded-2xl"
        />
        <button
          onClick={getAiResponse}
          className="rounded-xl border-2 border-white p-2"
        >
          Generate
        </button>
        <p>{parse(response)}</p>
      </section>
    </main>
  );
}
