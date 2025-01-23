"use client";

import React, { useEffect, useState } from "react";
import Markdown from "react-markdown";

type groqmsg = {
  Role: string;
  Content: string;
};

type hexRes = {
  chat: groqmsg;
  hexArr?: string[];
};

export default function Home() {
  const [ques, setQues] = useState("");
  const [chatWithHex, setChatWithHex] = useState<hexRes[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const lastMsgRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    lastMsgRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lastMsgRef]);

  const extractHex = (content: string): string[] => {
    let idx = 0;
    const hexArr: string[] = [];
    while (idx < content.length) {
      idx = content.indexOf("#", idx);
      const hex = content.slice(idx, idx + 7);
      if (idx != -1) {
        // Validate if it's a valid hex code
        if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
          if (!hexArr.includes(hex)) {
            hexArr.push(hex);
          }
        }
      } else {
        break;
      }
      idx += 7;
    }
    return hexArr;
  };

  const getAiResponse = async () => {
    const x = await fetch(`http://localhost:8080/ai?q=${ques}`, {
      method: "post",
      body: JSON.stringify(chatWithHex.map((r) => r.chat)),
    });
    const text = await x.text();
    const res = text
      .slice(1, -1)
      .replaceAll("\\n", "\n")
      .replaceAll("\\t", "\t");
    setChatWithHex([
      ...chatWithHex,
      {
        chat: {
          Role: "user",
          Content: ques,
        },
      },
      {
        chat: {
          Role: "system",
          Content: res,
        },
        hexArr: extractHex(res),
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
        {chatWithHex.map((q: hexRes, i) => (
          <div
            key={i}
            className={`flex ${q.chat.Role === "user" ? "justify-end" : ""}`}
          >
            <Markdown
              className={`text-lg mb-8 whitespace-pre-line ${q.chat.Role === "user" ? "bg-gray-700 px-4 py-2 rounded-2xl" : "flex-1"}`}
            >
              {q.chat.Content}
            </Markdown>
            {q.hexArr && q.hexArr.length ? (
              <div className="border border-gray-700 rounded-xl h-max p-4 min-w-48 space-y-2">
                {q.hexArr.map((hex, i) => (
                  <p key={i} className="flex gap-2">
                    <span>{hex}</span>
                    <span>&#8594;</span>
                    <div style={{ background: hex }} className="w-20 h-5"></div>
                  </p>
                ))}
              </div>
            ) : (
              ""
            )}
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
        {chatWithHex.length ? (
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
              placeholder="Enter your million dollar idea"
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
