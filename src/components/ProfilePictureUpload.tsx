import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/SupabaseAuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, User } from 'lucide-react';

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string;
  onUploadComplete?: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentAvatarUrl,
  onUploadComplete,
  size = 'md'
}) => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentAvatarUrl || '');

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authState.user) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please choose an image smaller than 2MB.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please choose an image file (PNG, JPG, WebP).',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const fileExt = file.name.split('.').pop();
      const fileName = `${authState.user.id}/avatar.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', authState.user.id);

      if (updateError) {
        throw updateError;
      }

      // The profile will be updated automatically via the database update

      onUploadComplete?.(publicUrl);

      toast({
        title: 'Profile picture updated',
        description: 'Your profile picture has been uploaded successfully.',
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = () => {
    if (authState.profile?.display_name) {
      return authState.profile.display_name
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);
    }
    if (authState.profile?.username) {
      return authState.profile.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={preview} alt="Profile picture" />
        <AvatarFallback>
          {preview ? (
            <User className="h-4 w-4" />
          ) : (
            getInitials()
          )}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <Label htmlFor="profilePicture" className="text-sm font-medium">
          Profile Picture
        </Label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            id="profilePicture"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => document.getElementById('profilePicture')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Max 2MB. Supports PNG, JPG, WebP
        </p>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;