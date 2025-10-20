import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Send,
  X,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "👋 Halo! Saya adalah TryoutKan AI. Ada yang bisa saya bantu tentang persiapan tryout CPNS & BUMN?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when chat opens
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(
        "https://ai.sumopod.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_AI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4.1-nano",
            messages: [
              {
                role: "system",
                content:
                  "Kamu adalah TryoutKan AI, asisten virtual yang membantu pengguna mempersiapkan diri untuk tryout CPNS dan BUMN. Jawab dengan singkat, jelas, dan ramah. Fokus pada informasi tentang tryout, tips belajar, dan fitur platform TryoutKan.",
              },
              {
                role: "user",
                content: userMessage,
              },
            ],
            max_tokens: 150,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error generating response:", error);
      return "Maaf, saya sedang mengalami masalah teknis. Silakan coba lagi nanti atau hubungi tim support kami.";
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const botResponse = await generateResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
    } finally {
      setIsTyping(false);
      // Re-focus input after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "Bagaimana cara mendaftar?",
    "Apa saja paket tryout?",
    "Tips lulus CPNS?",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card
          className={`w-80 ${
            isMinimized ? "h-14" : "h-96"
          } mb-4 shadow-2xl border-0 bg-background transition-all duration-300`}
        >
          <CardHeader className="pb-2 bg-primary text-primary-foreground rounded-t-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bot size={18} />
                  <Sparkles
                    className="absolute -top-1 -right-1 text-yellow-300"
                    size={8}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">TryoutKan AI</h3>
                  <p className="text-xs opacity-90">Asisten Virtual</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/20 p-1 h-6 w-6"
                  onClick={() => setIsMinimized(!isMinimized)}
                  aria-label={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? (
                    <Maximize2 size={14} />
                  ) : (
                    <Minimize2 size={14} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/20 p-1 h-6 w-6"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted border border-border"
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {message.sender === "bot" ? (
                          <Bot size={12} className="text-primary" />
                        ) : (
                          <User size={12} />
                        )}
                        <span className="text-xs font-medium opacity-70">
                          {message.sender === "bot" ? "AI" : "Kamu"}
                        </span>
                      </div>
                      {message.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted border border-border rounded-2xl p-3 text-sm">
                      <div className="flex items-center gap-1 mb-1">
                        <Bot size={12} className="text-primary" />
                        <span className="text-xs font-medium opacity-70">
                          AI
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {messages.length === 1 && !isTyping && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {quickQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-1 px-2 rounded-full whitespace-nowrap"
                        onClick={() => {
                          setInputValue(question);
                          setTimeout(() => inputRef.current?.focus(), 100);
                        }}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pertanyaanmu..."
                    className="text-sm flex-1"
                    disabled={isTyping}
                  />
                  <Button
                    size="sm"
                    className="px-3"
                    onClick={handleSendMessage}
                    disabled={inputValue.trim() === "" || isTyping}
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Floating button */}
      <Button
        size="lg"
        className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <div className="relative">
            <MessageCircle size={24} />
            <Sparkles
              className="absolute -top-1 -right-1 text-yellow-300"
              size={10}
            />
          </div>
        )}
      </Button>

      {/* Tooltip */}
      {!isOpen && (
        <div className="absolute bottom-16 right-0 bg-background border border-border rounded-lg p-2 shadow-lg animate-fadeIn">
          <p className="text-xs font-medium whitespace-nowrap">
            Butuh bantuan?
          </p>
        </div>
      )}
    </div>
  );
}
