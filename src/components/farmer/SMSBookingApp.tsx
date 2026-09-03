import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Phone } from "lucide-react";
import { Crop } from "@/types";

interface Message {
  sender: "user" | "system";
  text: string;
  time: string;
}

export function SMSBookingApp() {
  const store = useAppStore();
  const [inputMsg, setInputMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "system",
      text: "Welcome to Smart Mandi SMS! Reply 'BOOK <CROP> <QTY>' (e.g., BOOK WHEAT 50) to get an instant booking token.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [bookingState, setBookingState] = useState<{
    step: "INIT" | "CENTRE" | "TIME";
    crop?: Crop;
    qty?: number;
    centreId?: string;
  }>({ step: "INIT" });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim().toUpperCase();
    const newMsg: Message = {
      sender: "user",
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMsg("");

    // Simulate SMS processing delay
    setTimeout(async () => {
      let replyText = "";
      
      if (bookingState.step === "INIT") {
        const parts = userText.split(" ");
        
        if (parts[0] === "STATUS" && parts.length === 2) {
           const tokenNum = parts[1];
           const token = store.tokens.find(t => t.number.toUpperCase() === tokenNum);
           if (!token) {
              replyText = `Token ${tokenNum} not found. Please check your token number.`;
           } else {
              const queueEntry = store.queue.find(q => q.tokenId === token.id);
              if (queueEntry && queueEntry.status === "WAITING") {
                 replyText = `Token ${tokenNum} Status: WAITING. You are #${queueEntry.position} in line. Estimated wait: ${queueEntry.estimatedWaitTime} mins.`;
              } else if (token.status === "PROCESSING") {
                 replyText = `Token ${tokenNum} Status: NOW SERVING. Please proceed to your assigned counter immediately!`;
              } else {
                 replyText = `Token ${tokenNum} Status: ${token.status.replace("_", " ")}.`;
              }
           }
        } else if (parts[0] === "BOOK" && parts.length >= 3) {
          const crop = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase() as Crop;
          const qty = parseFloat(parts[2]);
          const validCrops = ["Paddy", "Wheat", "Maize", "Chana", "Mustard", "Cotton", "Potato", "Onion"];
          
          if (!validCrops.includes(crop)) {
            replyText = `We do not procure ${crop}. Valid crops: ${validCrops.join(", ")}.`;
          } else if (isNaN(qty) || qty <= 0) {
            replyText = "Please provide a valid quantity in quintals. Example: BOOK WHEAT 50";
          } else {
            setBookingState({ step: "CENTRE", crop, qty });
            replyText = `Great! You want to sell ${qty}q of ${crop}.\nReply with Centre Number:\n1. Mandi Centre A (Khed)\n2. Mandi Centre B (Shirur)\n3. Mandi Centre C (Baramati)`;
          }
        } else {
          replyText = "Invalid format. Please reply with 'BOOK <CROP> <QTY>' or 'STATUS <TOKEN_ID>'.";
        }
      } else if (bookingState.step === "CENTRE") {
        const choice = parseInt(userText);
        if (choice >= 1 && choice <= 3) {
          const centreId = `c${choice}`;
          setBookingState(prev => ({ ...prev, step: "TIME", centreId }));
          replyText = `Centre selected.\nReply with Time Slot (1, 2 or 3) for Sep 10:\n1. 10:00 AM – 11:00 AM\n2. 11:00 AM – 12:00 PM\n3. 02:00 PM – 03:00 PM`;
        } else {
          replyText = "Invalid choice. Reply with 1, 2, or 3.";
        }
      } else if (bookingState.step === "TIME") {
        const choice = parseInt(userText);
        const slots = ["10:00 AM – 11:00 AM", "11:00 AM – 12:00 PM", "02:00 PM – 03:00 PM"];
        if (choice >= 1 && choice <= 3) {
          const timeSlot = slots[choice - 1];
          try {
            const farmerId = store.activeFarmerId || store.farmers[0]?.id;
            if (farmerId) {
              const booking = await store.bookSlot({
                farmerId,
                centreId: bookingState.centreId!,
                crop: bookingState.crop!,
                date: "2026-09-10",
                timeSlot,
                estimatedQuantity: bookingState.qty!
              });
              const newToken = await store.generateToken(booking.id);
              replyText = `SUCCESS! Slot booked for ${bookingState.crop} (${bookingState.qty}q) on Sep 10, ${timeSlot.split(" – ")[0]}. Your Token ID is: ${newToken.number}. Show this SMS at the gate.`;
              setBookingState({ step: "INIT" }); // reset
            } else {
              replyText = "Farmer profile not found. Please register first.";
              setBookingState({ step: "INIT" });
            }
          } catch (e) {
            replyText = "System error processing booking. Please try again later.";
            setBookingState({ step: "INIT" });
          }
        } else {
          replyText = "Invalid choice. Reply with 1, 2, or 3.";
        }
      }

      setMessages(prev => [...prev, {
        sender: "system",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[85vh] bg-slate-900 overflow-hidden relative border-[12px] border-slate-950 rounded-[3rem] shadow-2xl m-4">
      {/* Phone Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-slate-950 rounded-b-xl z-20"></div>
      
      {/* App Header */}
      <header className="bg-slate-800 text-white p-4 pt-8 shadow flex items-center gap-3 z-10">
        <div className="bg-emerald-500 p-2 rounded-full">
          <Phone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold">Mandi SMS Service</h2>
          <p className="text-xs text-emerald-400">55555</p>
        </div>
      </header>

      {/* Chat History */}
      <div className="flex-1 p-4 overflow-y-auto bg-[#e5ddd5] space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${msg.sender === 'user' ? 'bg-emerald-100 rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
              <p className="text-slate-800 text-sm leading-relaxed">{msg.text}</p>
              <p className="text-[10px] text-slate-400 text-right mt-1">{msg.time}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="bg-slate-100 p-4 pb-6 flex gap-2">
        <Input 
          className="flex-1 bg-white rounded-full border-0 focus-visible:ring-emerald-500" 
          placeholder="Type 'BOOK WHEAT 50'..." 
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button 
          className="rounded-full w-10 h-10 p-0 bg-emerald-600 hover:bg-emerald-700 shrink-0"
          onClick={handleSend}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
