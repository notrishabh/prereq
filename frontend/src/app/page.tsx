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
    const text = await x.text();
    const res = text
      .slice(1, -1)
      .replaceAll("\\n", "\n")
      .replaceAll("\\t", "\t");
    setOldQues([
      ...oldQues,
      {
        Role: "user",
        Content: ques,
      },
      {
        Role: "system",
        Content: res,
      },
    ]);
    setResponse(res);
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQues(event.target.value);
  };

  const handleSubmitForm = (event: React.FormEvent) => {
    event.preventDefault();
    getAiResponse();
    setQues("");
  };

  const chatScreen = () => {
    return (
      <div className="mt-10 mb-8 h-[calc(100vh-22rem)] w-2/3 overflow-auto">
        {oldQues.map((q: groqmsg, i) => (
          <div
            key={i}
            className={`flex ${q.Role === "user" ? "justify-end" : ""}`}
          >
            <Markdown
              key={i}
              className={`text-lg mb-8 whitespace-pre-line ${q.Role === "user" ? "bg-gray-700 px-4 py-2 rounded-2xl" : ""}`}
            >
              {q.Content}
            </Markdown>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main>
      <div className="fixed text-3xl p-8">First Step</div>
      <section className="min-h-screen flex flex-col justify-center items-center w-full">
        {response ? (
          chatScreen()
        ) : (
          <h1 className="text-3xl mb-8">What are you building?</h1>
        )}
        <form
          onSubmit={handleSubmitForm}
          className="flex w-full justify-center items-center"
        >
          <div className="relative w-2/3">
            <input
              onChange={handleInput}
              placeholder="Ask anything"
              value={ques}
              className="p-4 bg-gray-800 text-xl w-full rounded-2xl pr-20"
            />
            <button
              type="submit"
              className=" text-4xl text-gray-400 bg-gray-700 rounded-full px-4 pt-1 absolute top-0 right-0 bottom-0 m-1 mr-3"
            >
              &#8593;
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
