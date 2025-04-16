import { useState } from "react";
import { Component } from "./Component";

interface State {
  users: string[];
  messages: string[][];
  mentionIndex: number;
  input: string[];
  startIndex: number;
  isFocused: boolean;
  setInput: (input: string[]) => void;
  setMessages: (messages: string[][]) => void;
  setIsFocused: (isFocused: boolean) => void;
  setMentionIndex: (mentionIndex: number) => void;
  setStartIndex: (startIndex: number) => void;
}

function App() {
  const [state, setState] = useState<State>({
    input: [""],
    mentionIndex: 0,
    startIndex: 0,
    messages: [],
    setStartIndex: (startIndex: number) => {
      setState((prev) => ({
        ...prev,
        startIndex,
      }));
    },
    setInput: (input: string[]) => {
      setState((prev) => ({
        ...prev,
        input: input,
      }));
    },
    setMessages: (messages: string[][]) => {
      setState((prev) => ({
        ...prev,
        messages,
      }));
    },
    setIsFocused: (isFocused: boolean) => {
      setState((prev) => ({
        ...prev,
        isFocused,
      }));
    },
    setMentionIndex: (mentionIndex: number) => {
      setState((prev) => ({
        ...prev,
        mentionIndex,
      }));
    },
    isFocused: false,
    users: ["John doe", "Jane", "Jim", "Jill"],
  });

  return (
    <div className="h-dvh w-screen flex flex-col items-center justify-end bg-slate-50 p-8 lg:p-16">
      <div className="w-full lg:w-192">
        <Component {...state} />
      </div>
    </div>
  );
}

export default App;
