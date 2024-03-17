"use client";

import { Check, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "@/components/ui/button";
import { useOrigin } from "@/hooks/use-origin";
import axios from "axios";

export const InviteModal = () => {
  const { onOpen, isOpen, onClose, type, data } = useModal();

  const origin = useOrigin();

  const isModalOpen = isOpen && type === "invite";

  const { server } = data;

  const [copied, setCopied] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

  const onCopyClick = () => {
    navigator.clipboard.writeText(inviteUrl);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const onNewLink = async () => {
    try {
      setIsLoading(true);
      const response = await axios.patch(
        `/api/servers/${server?.id}/invite-code`
      );

      onOpen("invite", { server: response.data });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div>
      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-white text-black p-0 overflow-hidden">
          <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center">
              친구 초대하기
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
              Dialog 설명
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
              채팅서버 초대
            </Label>
            <div className="flex items-center mt-2 gap-x-2">
              <Input
                className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                disabled={isLoading}
                value={inviteUrl}
                readOnly
              />
              <Button size="icon" onClick={onCopyClick} disabled={isLoading}>
                {copied ? <Check /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <Button
              onClick={onNewLink}
              disabled={isLoading}
              variant="link"
              size="sm"
              className="text-xs text-zinc-500 mt-4"
            >
              채팅서버 새로운 링크 생성
              <RefreshCw className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
