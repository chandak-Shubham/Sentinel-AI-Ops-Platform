import { Hash, MessageSquare, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const channels = ["Incident Response", "Tech Team", "Sales Team", "Talent Acquisition", "Admin"];
const members = ["Team Lead", "Backend Engineer", "DevOps Engineer", "Frontend Engineer", "Intern"];
const previewMessages = [
  { author: "System", body: "Real-time team chat will be connected using WebSockets.", time: "Pending" },
  { author: "Incident Response", body: "This workspace is prepared for live channel traffic and operational handoffs.", time: "Ready" }
];

export default function TeamChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Team Chat</h1>
        <p className="text-sm text-muted-foreground">Real-time team chat will be connected using WebSockets.</p>
      </div>
      <div className="grid min-h-[calc(100vh-12rem)] gap-6 xl:grid-cols-[280px_1fr_260px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Hash className="h-4 w-4" />
              Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {channels.map((channel, index) => (
              <button
                key={channel}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${index === 0 ? "bg-primary/12 text-primary" : "hover:bg-muted"}`}
              >
                <MessageSquare className="h-4 w-4" />
                {channel}
              </button>
            ))}
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Incident Response</CardTitle>
              <Badge variant="outline">Frontend ready</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col p-0">
            <div className="flex flex-1 flex-col gap-4 p-5">
              {previewMessages.map((message) => (
                <div key={message.author} className="max-w-2xl rounded-lg border bg-muted/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{message.author}</p>
                    <p className="text-xs text-muted-foreground">{message.time}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{message.body}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t p-4">
              <Input placeholder="Message Incident Response" disabled />
              <Button size="icon" disabled>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((member) => (
              <div key={member} className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{member}</p>
                  <p className="text-xs text-muted-foreground">Future presence</p>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
