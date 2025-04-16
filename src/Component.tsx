import React, { useEffect, useRef } from "react";
import plus from "./plus.svg";
import smile from "./smile.svg";
import { useSpring, animated } from "@react-spring/web";

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

const getChunkIndex = (props: Props, charIndex: number) => {
  const chunkIndex = props.input.findIndex((chunk, i) => {
    const prevChunksLength = props.input
      .slice(0, i)
      .reduce((acc, curr) => acc + curr.length, 0);

    return charIndex <= prevChunksLength + chunk.length;
  });

  return chunkIndex === -1 ? props.input.length - 1 : chunkIndex;
};

const getPreviousChunksLength = (props: Props, index: number) => {
  return props.input
    .slice(0, index)
    .reduce((acc, curr) => acc + curr.length, 0);
};

const addMention = (props: Props, currentChunkIndex: number, user: string) => {
  const newMention = `@${user}`;

  const newInput = props.input.map((chunk, i) => {
    if (i === currentChunkIndex) {
      return newMention;
    }

    if (i === currentChunkIndex + 1) {
      return ` ${chunk}`;
    }

    return chunk;
  });

  props.setInput(
    currentChunkIndex === props.input.length - 1
      ? newInput.concat(" ")
      : newInput
  );

  const newPosition =
    getPreviousChunksLength(props, currentChunkIndex) + newMention.length + 1;

  // Input should update first
  setTimeout(() => {
    props.setStartIndex(newPosition);
  }, 0);
};

const getMentionUsers = (props: Props, currentChunk: string) => {
  if (currentChunk === "@") {
    return props.users;
  }

  return props.users.filter((user) =>
    user
      .toLocaleLowerCase()
      .startsWith(currentChunk.slice(1).toLocaleLowerCase())
  );
};

const Message: React.FC<Props & { message: string[]; className?: string }> = ({
  message,
  ...props
}) => {
  return (
    <div className={props.className}>
      {message.map((chunk, i) => {
        if (chunk.startsWith("data:image")) {
          return (
            <div className="py-2">
              <img className="rounded-lg" key={i} src={chunk} alt="message" />
            </div>
          );
        }

        if (
          chunk.startsWith("@") &&
          props.users.some((user) => `@${user}` === chunk)
        ) {
          return (
            <span key={i} className="text-blue-400 whitespace-pre-wrap">
              {chunk}
            </span>
          );
        }

        return (
          <span key={i} className="whitespace-pre-wrap">
            {chunk}
          </span>
        );
      })}
    </div>
  );
};

export const Component: React.FC<Props> = (props) => {
  const ref = useRef<HTMLInputElement>(null);
  const currentChunkIndex = getChunkIndex(props, props.startIndex);
  const currentChunk = props.input[currentChunkIndex];
  const isMention = currentChunk.startsWith("@");

  const springs = useSpring({
    from: { height: 0 },
    to: { height: props.isFocused ? 4 : 0 },
    config: { tension: 280, friction: 60 },
  });

  useEffect(() => {
    if (ref.current) {
      ref.current.setSelectionRange(props.startIndex, props.startIndex);
    }
  }, [props.startIndex]);

  return (
    <div className="flex flex-col items-start w-full">
      {props.messages.map((message, i) => (
        <Message
          className="bg-slate-200 px-4 py-2 rounded-xl mb-4 max-w-prose"
          {...props}
          message={message}
          key={i}
        />
      ))}
      <div className="relative w-full">
        <ul
          className={`absolute -left-2 bottom-[calc(100%+-.5rem)] border border-slate-300 bg-white rounded-lg overflow-hidden shadow`}
        >
          {isMention
            ? getMentionUsers(props, currentChunk).map((user, i) => (
                <li
                  key={i}
                  className={`px-2 py-1 cursor-pointer w-72 text-sm ${
                    props.mentionIndex === i ? "bg-blue-500 text-white" : ""
                  }`}
                  onMouseEnter={() => {
                    props.setMentionIndex(i);
                  }}
                  onClick={() => {
                    addMention(props, currentChunkIndex, user);
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
              ref={ref}
              type="text"
              value={props.input.join("")}
              onChange={(event) => {
                if (event.currentTarget.selectionStart !== null) {
                  props.setMentionIndex(0);
                  props.setStartIndex(event.currentTarget.selectionStart);
                  const currentLength = event.currentTarget.value.length;
                  const prevLength = props.input.join("").length;
                  const addedLength = currentLength - prevLength;
                  const selectionStart = event.currentTarget.selectionStart;
                  const charIndex =
                    addedLength > 0 ? selectionStart - 1 : selectionStart + 1;
                  const charChunkIndex = getChunkIndex(props, charIndex);

                  const input = props.input.flatMap((chunk, i) => {
                    if (i === charChunkIndex) {
                      const prevChunksLength = getPreviousChunksLength(
                        props,
                        charChunkIndex
                      );

                      if (
                        event.currentTarget.value.length <
                        props.input.join("").length
                      ) {
                        return (
                          chunk.slice(0, charIndex - prevChunksLength - 1) +
                          chunk.slice(charIndex - prevChunksLength)
                        );
                      }

                      const chunkStart = event.target.value.slice(
                        prevChunksLength,
                        charIndex
                      );

                      const chunkEnd = chunk.slice(
                        charIndex - prevChunksLength
                      );

                      const newChar = event.currentTarget.value[charIndex];

                      if (newChar === "@") {
                        return [chunkStart, newChar, chunkEnd].filter(Boolean);
                      } else {
                        return chunkStart + newChar + chunkEnd;
                      }
                    }

                    return chunk;
                  });

                  props.setInput(
                    input.filter((chunk, i) => {
                      if (i === 0) {
                        return true;
                      }

                      return chunk !== "";
                    })
                  );
                }
              }}
              onFocus={() => {
                props.setIsFocused(true);
              }}
              placeholder="Write something..."
              className={`${
                !props.isFocused ? "border" : ""
              } input rounded-xl p-4 border-slate-300 w-full focus:outline-0`}
              onKeyDown={(event) => {
                if (event.currentTarget.selectionStart !== null) {
                  if (isMention) {
                    if (event.key === "ArrowDown") {
                      props.setMentionIndex(props.mentionIndex + 1);
                      event.preventDefault();
                      event.stopPropagation();
                    }

                    if (event.key === "ArrowUp") {
                      props.setMentionIndex(props.mentionIndex - 1);
                      event.preventDefault();
                      event.stopPropagation();
                    }

                    if (event.key === "Enter") {
                      addMention(
                        props,
                        currentChunkIndex,
                        getMentionUsers(props, currentChunk)[props.mentionIndex]
                      );
                    }
                  } else {
                    if (event.key === "Enter") {
                      props.setMessages([...props.messages, props.input]);
                      props.setInput([""]);
                    }
                  }
                }
              }}
            ></input>
            <div className="absolute top-0 left-0 p-4 pointer-events-none">
              <Message {...props} message={props.input} />
            </div>
          </div>
          <animated.div
            className={"overflow-hidden"}
            style={{
              height: springs.height.to((h) => `${h}rem`),
            }}
          >
            <div className="flex gap-2 p-4">
              <div
                className="w-8 p-1 border-slate-300 border rounded-xl  relative"
                onClick={() => {}}
              >
                <img src={plus} alt="smile" className="cursor-pointer" />
                <input
                  accept="image/*"
                  type="file"
                  className="absolute top-0 left-0 w-full h-full opacity-0 hover:cursor-pointer"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const dataUrl = e.target?.result as string;
                        console.log(dataUrl);
                        props.setMessages([...props.messages, [dataUrl]]);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
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
          </animated.div>
        </div>
      </div>
    </div>
  );
};
