import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ModeToggle } from "@/components/toggle/mode-toggle";

export default function Home() {
  return (
    <div className="h-full flex  flex-col items-center justify-center">
      <p className="text-3xl font-bold text-indigo-500">Hello Pikscord </p>
      <Button variant="test">Click me</Button>
      <ModeToggle />
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
