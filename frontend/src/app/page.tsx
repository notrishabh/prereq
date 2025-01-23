"use client";

import React, { useEffect, useState } from "react";
import Markdown from "react-markdown";

type groqmsg = {
  Role: string;
  Content: string;
};

export default function Home() {
  const [ques, setQues] = useState("");
  const [chat, setChat] = useState<groqmsg[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const lastMsgRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    lastMsgRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lastMsgRef]);

  const getAiResponse = async () => {
    const x = await fetch(`http://localhost:8080/ai?q=${ques}`, {
      method: "post",
      body: JSON.stringify(chat),
    });
    const text = await x.text();
    const res = text
      .slice(1, -1)
      .replaceAll("\\n", "\n")
      .replaceAll("\\t", "\t");
    setChat([
      ...chat,
      {
        Role: "user",
        Content: ques,
      },
      {
        Role: "system",
        Content: res,
      },
    ]);
    setLoading(false);
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQues(event.target.value);
  };

  const handleSubmitForm = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    getAiResponse();
    setQues("");
  };

  const Loading = () => {
    return (
      <div className="loader mx-auto animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid" />
    );
  };

  const chatScreen = () => {
    return (
      <div className="mt-10 mb-8 h-[calc(100vh-22rem)] w-2/3 overflow-auto">
        {chat.map((q: groqmsg, i) => (
          <div
            key={i}
            className={`flex ${q.Role === "user" ? "justify-end" : ""}`}
          >
            <Markdown
              className={`text-lg mb-8 whitespace-pre-line ${q.Role === "user" ? "bg-gray-700 px-4 py-2 rounded-2xl" : ""}`}
            >
              {q.Content}
            </Markdown>
          </div>
        ))}
        {loading && <Loading />}
        <div ref={lastMsgRef} />
      </div>
    );
  };

  return (
    <main>
      <div className="fixed text-3xl p-8">First Step</div>
      <section className="min-h-screen flex flex-col justify-center items-center w-full">
        {chat.length ? (
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
