"use client";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import qs from "query-string";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "@/components/ui/button";

export const DeleteChannelModal = () => {
  const { onOpen, isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const isModalOpen = isOpen && type === "deleteChannel";

  const { server, channel } = data;

  const [isLoading, setIsLoading] = useState(false);

  const onClcik = async () => {
    try {
      setIsLoading(true);

      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id,
        },
      });

      await axios.delete(url);

      onClose();
      router.push(`/servers/${server?.id}`);
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Dialog open={isModalOpen} onOpenChange={onClose}>
        <DialogContent className="bg-white text-black p-0 overflow-hidden">
          <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center">
              채널 삭제하기
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
              정말로 삭제하시겠습니까?
              <span className="font-semibold text-indigo-500 p-1">
                #{channel?.name}
              </span>
              한번 삭제시 영구적으로 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-gray-100 px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <Button disabled={isLoading} variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button disabled={isLoading} variant="primary" onClick={onClcik}>
                Confirm
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
