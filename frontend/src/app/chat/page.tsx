'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import { api, tokenStore } from '@/lib/api';
import { io, Socket } from 'socket.io-client';

interface Conversation {
  userId: string;
  lastMessageAt: string;
  unread: number;
  email?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const socket = io(
      (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001') + '/chat',
      { auth: { token: tokenStore.access } },
    );
    socketRef.current = socket;

    socket.on('new_message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api<Conversation[]>('/chat/conversations');
      setConversations(res ?? []);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  async function selectConversation(userId: string) {
    setSelectedUser(userId);
    try {
      const res = await api<{ items: ChatMessage[] }>(`/chat/messages/${userId}`);
      setMessages(res.items ?? []);
      socketRef.current?.emit('mark_read', { senderId: userId });
    } catch {
      setMessages([]);
    }
  }

  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!newMsg.trim() || !selectedUser || !socketRef.current) return;
    socketRef.current.emit('send_message', {
      recipientId: selectedUser,
      content: newMsg.trim(),
    });
    setNewMsg('');
  }

  if (!user) {
    return (
      <>
        <SiteHeader />
        <main className="container max-w-4xl py-10">
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              Please log in to access chat.
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="container max-w-4xl py-10">
        <h1 className="text-2xl font-semibold mb-4">Messages</h1>
        <div className="flex gap-4 h-[500px]">
          {/* Conversations list */}
          <Card className="w-64 flex-shrink-0 overflow-auto">
            <CardContent className="p-2">
              {loading ? (
                <div className="space-y-2 p-2">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              ) : conversations.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  No conversations yet. Visit a profile and send a message!
                </p>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.userId}
                    onClick={() => selectConversation(c.userId)}
                    className={`w-full flex items-center gap-2 p-2 rounded-md text-left text-sm transition-colors ${
                      selectedUser === c.userId
                        ? 'bg-primary/10 text-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px]">
                        {(c.email ?? c.userId).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate">
                      <p className="truncate font-medium">{c.email ?? c.userId.slice(0, 8)}</p>
                    </div>
                    {c.unread > 0 && (
                      <span className="bg-secondary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                        {c.unread}
                      </span>
                    )}
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Message area */}
          <Card className="flex-1 flex flex-col">
            <CardContent className="flex-1 overflow-auto p-4 space-y-3">
              {!selectedUser ? (
                <p className="text-center text-muted-foreground mt-20">
                  Select a conversation to start chatting
                </p>
              ) : messages.length === 0 ? (
                <p className="text-center text-muted-foreground mt-20">
                  No messages yet. Say hi!
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                        msg.senderId === user.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-[10px] opacity-60 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            {selectedUser && (
              <div className="border-t p-3">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Type a message..."
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                  />
                  <Button type="submit" size="sm" disabled={!newMsg.trim()}>
                    Send
                  </Button>
                </form>
              </div>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}
