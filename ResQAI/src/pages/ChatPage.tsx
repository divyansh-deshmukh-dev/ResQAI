import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Users, User } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState("team1");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "Team Leader",
      content: "Status update: Rescue operation at Ward 12 completed successfully.",
      timestamp: new Date(Date.now() - 5 * 60000),
      isOwn: false,
    },
    {
      id: "2",
      sender: "You",
      content: "Great work! Moving to Ward 15 now.",
      timestamp: new Date(Date.now() - 3 * 60000),
      isOwn: true,
    },
    {
      id: "3",
      sender: "Medical Team",
      content: "Need more medical supplies at Sector 8 shelter.",
      timestamp: new Date(Date.now() - 1 * 60000),
      isOwn: false,
    },
  ]);

  const teams = [
    { id: "team1", name: "Rescue Team Alpha", members: 8, online: 6 },
    { id: "team2", name: "Medical Unit", members: 5, online: 5 },
    { id: "team3", name: "Logistics Team", members: 12, online: 9 },
  ];

  const quickMessages = [
    "Need more supplies",
    "Evacuation complete",
    "Requesting backup",
    "All clear",
  ];

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "You",
      content: message,
      timestamp: new Date(),
      isOwn: true,
    };

    setMessages([...messages, newMessage]);
    setMessage("");
    toast.success("Message sent");
  };

  return (
    <DashboardLayout>
      <div className="p-6 h-[calc(100vh-2rem)]">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">Team Communication</h1>
          <p className="text-muted-foreground">Coordinate with rescue teams in real-time</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100%-5rem)]">
          {/* Teams list */}
          <Card className="p-4 shadow-card overflow-auto">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Teams</h2>
            </div>

            <div className="space-y-2">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedChat(team.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedChat === team.id
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-secondary/50 hover:bg-secondary border-2 border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-sm truncate">{team.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {team.members} members
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-safety/10 text-safety border-safety text-xs ml-2"
                    >
                      {team.online} online
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Chat area */}
          <Card className="lg:col-span-3 flex flex-col shadow-card">
            {/* Chat header */}
            <div className="p-4 border-b border-border bg-card/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-foreground">
                    {teams.find((t) => t.id === selectedChat)?.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {teams.find((t) => t.id === selectedChat)?.online} members online
                  </p>
                </div>
                <Badge variant="outline" className="bg-safety/10 text-safety border-safety">
                  Active
                </Badge>
              </div>
            </div>

            {/* Quick messages */}
            <div className="p-3 border-b border-border bg-secondary/30">
              <div className="flex flex-wrap gap-2">
                {quickMessages.map((msg) => (
                  <Button
                    key={msg}
                    size="sm"
                    variant="outline"
                    onClick={() => setMessage(msg)}
                    className="text-xs"
                  >
                    {msg}
                  </Button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] ${msg.isOwn ? "" : "flex gap-2"}`}>
                    {!msg.isOwn && (
                      <div className="p-2 bg-secondary rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      {!msg.isOwn && (
                        <p className="text-xs text-muted-foreground mb-1 ml-1">{msg.sender}</p>
                      )}
                      <div
                        className={`p-3 rounded-lg ${
                          msg.isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card/50">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;
