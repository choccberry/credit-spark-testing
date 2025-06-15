import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthProvider';
import MessageList from '@/components/messaging/MessageList';
import ChatWindow from '@/components/messaging/ChatWindow';

const Messages = () => {
  const { authState } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    otherUser: any;
  } | null>(null);

  if (!authState.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSelectConversation = (conversationId: string, otherUser: any) => {
    setSelectedConversation({ id: conversationId, otherUser });
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          {!selectedConversation ? (
            <div className="md:col-span-3">
              <MessageList onSelectConversation={handleSelectConversation} />
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <MessageList onSelectConversation={handleSelectConversation} />
              </div>
              <div className="md:col-span-2">
                <ChatWindow
                  conversationId={selectedConversation.id}
                  otherUser={selectedConversation.otherUser}
                  onBack={handleBack}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;