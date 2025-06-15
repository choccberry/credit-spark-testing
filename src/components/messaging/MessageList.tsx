import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthProvider';

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
  other_user?: {
    display_name?: string;
    username?: string;
    email?: string;
  };
  unread_count?: number;
}

interface MessageListProps {
  onSelectConversation: (conversationId: string, otherUser: any) => void;
}

const MessageList: React.FC<MessageListProps> = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { authState } = useAuth();

  useEffect(() => {
    if (authState.user) {
      fetchConversations();
    }
  }, [authState.user]);

  const fetchConversations = async () => {
    if (!authState.user) return;

    try {
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages(count)
        `)
        .or(`participant_1.eq.${authState.user.id},participant_2.eq.${authState.user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      // Fetch other user details for each conversation
      const conversationsWithUsers = await Promise.all(
        conversationsData.map(async (conv) => {
          const otherUserId = conv.participant_1 === authState.user!.id 
            ? conv.participant_2 
            : conv.participant_1;

          const { data: userProfile } = await supabase
            .from('profiles')
            .select('display_name, username, email')
            .eq('user_id', otherUserId)
            .single();

          // Get unread message count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('read', false)
            .neq('sender_id', authState.user!.id);

          return {
            ...conv,
            other_user: userProfile,
            unread_count: unreadCount || 0,
          };
        })
      );

      setConversations(conversationsWithUsers);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading conversations...</div>
        </CardContent>
      </Card>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm">Start a conversation by messaging an advertiser!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="p-4 hover:bg-muted cursor-pointer border-b last:border-b-0"
              onClick={() => onSelectConversation(conversation.id, conversation.other_user)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {conversation.other_user?.display_name || 
                       conversation.other_user?.username || 
                       conversation.other_user?.email || 
                       'Unknown User'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(conversation.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {conversation.unread_count! > 0 && (
                  <Badge variant="default" className="text-xs">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageList;