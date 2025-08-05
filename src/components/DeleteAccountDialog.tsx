import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/SupabaseAuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Mail } from "lucide-react";

const DeleteAccountDialog = () => {
  const { authState, signOut } = useAuth();
  const { toast } = useToast();
  const { isAdmin } = useAdminCheck();
  const [confirmText, setConfirmText] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const generateVerificationCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const sendVerificationEmail = async () => {
    if (!authState.user?.email) return;

    setIsSendingCode(true);
    const code = generateVerificationCode();
    setSentCode(code);

    try {
      const response = await supabase.functions.invoke('send-admin-verification', {
        body: {
          email: authState.user.email,
          verificationCode: code
        }
      });

      if (response.error) {
        throw response.error;
      }

      setShowVerification(true);
      toast({
        title: "Verification Code Sent",
        description: "Please check your email for the verification code.",
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      toast({
        title: "Error",
        description: "Please type 'DELETE' to confirm account deletion.",
        variant: "destructive"
      });
      return;
    }

    if (isAdmin && verificationCode !== sentCode) {
      toast({
        title: "Error",
        description: "Invalid verification code. Please check your email.",
        variant: "destructive"
      });
      return;
    }

    if (!authState.user) return;

    setIsDeleting(true);

    try {
      // Call the database function to delete the user account completely
      const { error: deleteError } = await supabase.rpc('delete_user_account');

      if (deleteError) {
        console.error('Error deleting account:', deleteError);
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });

    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetDialog = () => {
    setConfirmText("");
    setVerificationCode("");
    setSentCode("");
    setShowVerification(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Account</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account,
            all your campaigns, ad views, and remove your data from our servers.
            {isAdmin && " As an admin, you'll need to verify your email before deletion."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-4">
          {isAdmin && !showVerification && (
            <div>
              <Label>Admin Verification Required</Label>
              <p className="text-sm text-muted-foreground mb-2">
                For security, admin accounts require email verification before deletion.
              </p>
              <Button 
                onClick={sendVerificationEmail}
                disabled={isSendingCode}
                variant="outline"
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                {isSendingCode ? "Sending..." : "Send Verification Code"}
              </Button>
            </div>
          )}
          
          {isAdmin && showVerification && (
            <div>
              <Label htmlFor="verification">
                Enter verification code from your email:
              </Label>
              <Input
                id="verification"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter verification code"
                className="mt-2"
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="confirm">
              Type <strong>DELETE</strong> to confirm:
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="mt-2"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={resetDialog}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={
              confirmText !== "DELETE" || 
              isDeleting || 
              (isAdmin && (!showVerification || verificationCode !== sentCode))
            }
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountDialog;