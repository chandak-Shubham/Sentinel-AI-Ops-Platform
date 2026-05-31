import { MessageSquare, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const channels = ["Incident Response", "Tech Team", "Sales Team", "Talent Acquisition", "Admin"];

export default function TeamChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Team Chat</h1>
        <p className="text-sm text-muted-foreground">Real-time team chat will be connected using WebSockets.</p>
      </div>
      <div className="grid min-h-[calc(100vh-12rem)] gap-6 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
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
            <CardTitle>Incident Response</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col p-0">
            <div className="flex flex-1 items-center justify-center p-6 text-center text-muted-foreground">
              <div>
                <MessageSquare className="mx-auto h-10 w-10" />
                <p className="mt-3 font-medium text-foreground">Real-time team chat will be connected using WebSockets.</p>
                <p className="mt-1 text-sm">The layout is ready for channel lists, message history, and live delivery.</p>
              </div>
            </div>
            <div className="flex gap-2 border-t p-4">
              <Input placeholder="Message Incident Response" disabled />
              <Button size="icon" disabled>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
