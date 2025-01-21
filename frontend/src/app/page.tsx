"use client";

import { useState } from "react";
import Markdown from "react-markdown";

type groqmsg = {
  Role: string;
  Content: string;
};

export default function Home() {
  const [response, setResponse] = useState("");
  const [ques, setQues] = useState("");
  const [oldQues, setOldQues] = useState<groqmsg[]>([]);

  const getAiResponse = async () => {
    const x = await fetch(`http://localhost:8080/ai?q=${ques}`, {
      method: "post",
      body: JSON.stringify(oldQues),
    });
    setOldQues([
      ...oldQues,
      {
        Role: "user",
        Content: ques,
      },
    ]);
    const text = await x.text();
    const res = text.slice(1, -1).replaceAll("\\n", "\n");
    setResponse(res);
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQues(event.target.value);
  };

  const handleSubmitForm = (event: React.FormEvent) => {
    event.preventDefault();
    getAiResponse();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <section className="space-y-8 flex flex-col justify-center items-center w-full">
        <h1 className="text-3xl">What are you building?</h1>
        <form onSubmit={handleSubmitForm}>
          <input
            onChange={handleInput}
            className="p-4 bg-gray-800 text-xl w-2/3 rounded-2xl"
          />
          <button
            type="submit"
            className="rounded-xl border-2 border-white p-2"
          >
            Generate
          </button>
        </form>
        {response && (
          <div className="space-y-2 p-4 border-2 border-white rounded-xl">
            <Markdown>{response}</Markdown>
          </div>
        )}
      </section>
    </main>
  );
}
