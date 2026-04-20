"use client";

import { useEffect } from "react";
import { triggerConfetti } from "@/lib/utils";
import Script from "next/script";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SentenceBlock } from "@/components/course/SentenceBlock";
import { CompletionLesson } from "@/components/lesson/CompletionLesson";
import { SpeakingLesson } from "@/components/lesson/SpeakingLesson";
import { BrainCircuit } from "lucide-react";

export function CourseContent({
  activeLesson,
  moduleTitle,
  onLessonComplete,
  isCompleted,
}: any) {
  if (!activeLesson) return null;

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtu.be/"))
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    else if (url.includes("youtube.com/watch?v="))
      videoId = url.split("v=")[1]?.split("&")[0];
    else return url;
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
  };

  const content = (() => {
    if (!activeLesson.content) return { description: "", videoUrl: "" };

    if (typeof activeLesson.content === "string") {
      try {
        if (!activeLesson.content.trim())
          return { description: "", videoUrl: "" };

        return JSON.parse(activeLesson.content);
      } catch (e) {
        console.error("Erro no parse do conteúdo:", e);
        return { description: activeLesson.content, videoUrl: "" };
      }
    }

    return activeLesson.content;
  })();

  const handleComplete = async () => {
    triggerConfetti();
    try {
      await fetch("/api/course/progress", {
        method: "POST",
        body: JSON.stringify({ lessonId: activeLesson.id, completed: true }),
      });

      if (onLessonComplete) {
        onLessonComplete(activeLesson.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeLesson.type !== "CLASS") return;

    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      // @ts-ignore
      new window.YT.Player("youtube-player", {
        events: {
          onStateChange: (event: any) => {
            // @ts-ignore
            if (event.data === window.YT.PlayerState.ENDED) {
              handleComplete();
            }
          },
        },
      });
    };
  }, [activeLesson.id]);

  return (
    <div className="pt-12 md:p-12 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      <Script
        src="https://www.youtube.com/iframe_api"
        strategy="afterInteractive"
      />

      <header className="mb-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
          {moduleTitle}
        </span>
        <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
          {activeLesson.title}
        </h1>
      </header>

      <div className="space-y-8">
        {(activeLesson.type === "CLASS" ||
          activeLesson.type === "STORY" ||
          activeLesson.type === "COMPLETION" ||
          activeLesson.type === "SPEAKING") &&
          content?.videoUrl && (
            <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-900 shadow-lg">
              <iframe
                id="youtube-player"
                src={getEmbedUrl(content.videoUrl)}
                className="w-full h-full border-0"
                allowFullScreen
              />
            </div>
          )}

        {activeLesson.type === "STORY" ? (
          <div className="bg-blue-50 p-8 rounded-[32px] border border-blue-100 mt-6 wrap-break-word">
            <h4 className="text-[10px] font-black uppercase text-blue-400 mb-2 italic">
              Contexto da Cena
            </h4>
            <p className="text-blue-900 font-medium italic">
              "{content.script}"
            </p>
          </div>
        ) : activeLesson.type === "READING" ? (
          <div className="w-full">
            {content?.sentences && Array.isArray(content.sentences) ? (
              <div className="space-y-4">
                {content.sentences.map((sentence: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 ml-10">
                    <span className="shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <SentenceBlock sentence={sentence} index={index} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-lg text-slate-600 leading-relaxed wrap-break-word">
                {content?.description || content?.text || ""}
              </div>
            )}
          </div>
        ) : activeLesson.type === "COMPLETION" ? (
          <div className="w-full">
            <CompletionLesson
              content={content}
              lessonId={activeLesson.id}
              onComplete={() => {
                triggerConfetti();
                if (onLessonComplete) {
                  onLessonComplete(activeLesson.id);
                }
              }}
            />
          </div>
        ) : activeLesson.type === "SPEAKING" ? (
          <div className="w-full">
            <SpeakingLesson
              content={content}
              lessonId={activeLesson.id}
              onComplete={() => {
                triggerConfetti();
                if (onLessonComplete) {
                  onLessonComplete(activeLesson.id);
                }
              }}
            />
          </div>
        ) : (
          <div className="w-full ml-20 max-w-3xl wrap-break-word">
            <div className="text-lg text-slate-600 leading-relaxed wrap-break-word">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ ...props }) => (
                    <h1
                      className="text-3xl font-black text-s-900 mb-6 mt-8"
                      {...props}
                    />
                  ),
                  h2: ({ ...props }) => (
                    <h2
                      className="text-2xl font-black text-s-900 mb-4 mt-6 border-b pb-2"
                      {...props}
                    />
                  ),
                  h3: ({ ...props }) => (
                    <h3
                      className="text-xl font-bold text-s-800 mb-3 mt-5"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="mb-6 whitespace-pre-wrap" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc ml-6 mb-6 space-y-2" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-black text-slate-900" {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a
                      className="text-blue-600 underline hover:text-blue-800"
                      {...props}
                    />
                  ),
                  pre: ({ node, ...props }) => (
                    <div className="w-full my-6 overflow-hidden rounded-[2rem]">
                      {" "}
                      <pre
                        className="bg-slate-900 p-6 overflow-x-auto custom-scrollbar text-slate-200 text-sm md:text-base"
                        {...props}
                      />
                    </div>
                  ),
                  code: ({ node, ...props }: any) => {
                    const isInline = !props.children?.toString().includes("\n");

                    if (isInline) {
                      return (
                        <code
                          className="bg-slate-100 text-pink-500 px-1.5 py-0.5 rounded-md font-bold text-[0.85em] break-all"
                          {...props}
                        />
                      );
                    }

                    return (
                      <code
                        className="block w-full text-slate-200 text-sm md:text-base leading-relaxed"
                        {...props}
                      />
                    );
                  },
                }}
              >
                {content?.description || content?.text || ""}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {content?.flashcards?.length > 0 && (
          <FlashcardPromotion
            flashcards={content.flashcards}
            lessonCompleted={isCompleted}
          />
        )}

        {activeLesson.type !== "SPEAKING" &&
          activeLesson.type !== "COMPLETION" &&
          activeLesson.type !== "FLASHCARD" && (
            <div className="pt-16 pb-20 flex justify-end border-t border-slate-50 mt-12">
              <button
                onClick={handleComplete}
                className="group flex items-center gap-3 bg-slate-900 hover:bg-emerald-600 text-white px-8 h-14 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200 cursor-pointer"
              >
                <span className="text-[11px] font-black uppercase tracking-widest">
                  Entendi, Clara!
                </span>
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

function FlashcardPromotion({
  flashcards,
  lessonCompleted,
}: {
  flashcards: any[];
  lessonCompleted: boolean;
}) {
  if (!flashcards || flashcards.length === 0) return null;

  return (
    <div className="mt-12 p-8 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
          <BrainCircuit className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-emerald-900 font-black uppercase italic tracking-tighter text-xl">
            Fixação Memorizada
          </h3>
          <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest">
            {flashcards.length} novos cards disponíveis
          </p>
        </div>
      </div>

      <p className="text-emerald-800/80 mb-6 font-medium leading-relaxed">
        Esta aula gerou flashcards exclusivos. Você pode praticar agora para
        consolidar o vocabulário ou encontrá-los na sua biblioteca de revisão.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => (window.location.href = "/flashcards/practice")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-200"
        >
          Praticar Agora
        </button>
        <button className="bg-white hover:bg-emerald-100 text-emerald-600 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border border-emerald-200">
          Ver na Biblioteca
        </button>
      </div>
    </div>
  );
}
