import React from "react";
import plus from "./plus.svg";
import smile from "./smile.svg";

interface Props {
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

export const Component: React.FC<Props> = (props) => {
  const getChunkIndex = (charIndex: number) => {
    return props.input.findIndex((chunk, i) => {
      const prevChunksLength = props.input
        .slice(0, i)
        .reduce((acc, curr) => acc + curr.length, 0);

      return charIndex <= prevChunksLength + chunk.length;
    });
  };

  const getPreviousChunksLength = (index: number) => {
    return props.input
      .slice(0, index)
      .reduce((acc, curr) => acc + curr.length, 0);
  };

  const addMention = (user: string) => {
    const newInput = props.input
      .map((chunk, i) => {
        return i === getChunkIndex(props.startIndex) ? `@${user}` : chunk;
      })
      .concat([""]);

    props.setInput(newInput);
  };

  const currentChunkIndex = getChunkIndex(props.startIndex);
  const currentChunk = props.input[currentChunkIndex];
  const isMention = currentChunk.startsWith("@");

  return (
    <div className="flex flex-col items-start">
      {props.messages.map((message) => (
        <div className="bg-slate-200 px-4 py-2 rounded-xl mb-4 max-w-prose">
          {message.map((chunk, i) =>
            chunk.startsWith("@") ? (
              <span key={i} className="text-blue-400">
                {chunk}
              </span>
            ) : (
              <span key={i}>{chunk}</span>
            )
          )}
        </div>
      ))}
      <div className="relative">
        <ul
          className={`absolute bottom-full border border-slate-300 bg-white rounded-lg overflow-hidden mb-1`}
        >
          {isMention
            ? props.users
                .filter((user) =>
                  user
                    .toLocaleLowerCase()
                    .startsWith(currentChunk.slice(1).toLocaleLowerCase())
                )
                .map((user, i) => (
                  <li
                    key={i}
                    className={`px-4 py-2 cursor-pointer w-72  ${
                      props.mentionIndex === i ? "bg-blue-100" : ""
                    }`}
                    onMouseEnter={() => props.setMentionIndex(i)}
                    onClick={() => {
                      addMention(user);
                    }}
                  >
                    {user}
                  </li>
                ))
            : null}
        </ul>
        <div
          className={`${
            props.isFocused ? "shadow-lg" : ""
          } rounded-xl bg-white`}
        >
          <div className="relative">
            <input
              type="text"
              value={props.input.join("")}
              onChange={(event) => {
                if (event.target.selectionStart !== null) {
                  const charIndex = event.target.selectionStart - 1;
                  const charChunkIndex = getChunkIndex(charIndex);
                  const newChar = event.target.value[charIndex - 1];
                  const startMention = newChar === "@";
                  const deleteChar =
                    event.target.value.length < props.input.join("").length;

                  if (startMention) {
                    props.setInput(
                      props.input.flatMap((chunk, i) => {
                        if (i === charChunkIndex) {
                          return [
                            chunk.slice(
                              0,
                              charIndex - getPreviousChunksLength(i) - 1
                            ),
                            newChar,
                            chunk.slice(charIndex - 1),
                          ].filter(Boolean);
                        }

                        return chunk;
                      })
                    );
                  } else if (deleteChar) {
                    props.setInput(
                      props.input
                        .map((chunk, i) => {
                          const prevChunksLength = props.input
                            .slice(0, i)
                            .reduce((acc, curr) => acc + curr.length, 0);

                          if (prevChunksLength === charIndex) {
                            return "";
                          }

                          if (i === charChunkIndex) {
                            return (
                              chunk.slice(0, charIndex - prevChunksLength) +
                              chunk.slice(charIndex - prevChunksLength + 1)
                            );
                          }

                          return chunk;
                        })
                        .filter((v, i) => (i === 0 ? true : Boolean(v)))
                    );
                  } else {
                    props.setInput(
                      props.input.map((chunk, i) => {
                        return i === getChunkIndex(charIndex) // Get current chunk
                          ? chunk.slice(0, charIndex - 1) +
                              newChar +
                              chunk.slice(charIndex - 1)
                          : chunk;
                      })
                    );
                  }
                }
              }}
              onFocus={(event) => {
                if (event.currentTarget.selectionStart !== null) {
                  props.setStartIndex(event.currentTarget.selectionStart);
                }

                props.setIsFocused(true);
              }}
              placeholder="Write something..."
              className={`${
                !props.isFocused ? "border" : ""
              } input rounded-xl p-4 border-slate-300 w-192 focus:outline-0`}
              onKeyDown={(event) => {
                console.log(event.currentTarget.selectionStart);
                if (event.currentTarget.selectionStart !== null) {
                  console.log("event.currentTarget.selectionStart");
                  props.setStartIndex(event.currentTarget.selectionStart);
                }

                if (currentChunk.startsWith("@")) {
                  if (event.key === "ArrowDown") {
                    props.setMentionIndex(props.mentionIndex + 1);
                    event.preventDefault();
                  }

                  if (event.key === "ArrowUp") {
                    props.setMentionIndex(props.mentionIndex - 1);
                    event.preventDefault();
                  }

                  if (event.key === "Enter") {
                    addMention(props.users[props.mentionIndex]);
                  }
                } else {
                  if (event.key === "Enter") {
                    props.setMessages([...props.messages, props.input]);
                    props.setInput([""]);
                  }
                }
              }}
            ></input>
            <div className="absolute top-0 left-0 p-4 pointer-events-none">
              {props.input.map((input, i) =>
                input.startsWith("@") ? (
                  <span key={i} className="text-blue-400 lin rounded">
                    {input}
                  </span>
                ) : (
                  <span key={i}>{input}</span>
                )
              )}
            </div>
          </div>
          {props.isFocused ? (
            <div className="flex  gap-1 p-4">
              <button className="w-8 p-1 border-slate-300 border rounded-xl cursor-pointer">
                <img src={plus} alt="smile" />
              </button>
              <button className="w-8 p-1 border-slate-300 border rounded-xl cursor-pointer">
                <img src={smile} alt="smile" />
              </button>
              <button
                className="ml-auto bg-black text-white rounded-lg px-2 py-0 text-xs cursor-pointer"
                onClick={() => {
                  props.setMessages([...props.messages, props.input]);
                  props.setInput([""]);
                }}
              >
                Send
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
