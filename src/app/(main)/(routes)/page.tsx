import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Home() {
  return (
    <div className="">
      <p className="text-3xl font-bold text-indigo-500">Hello Pikscord </p>
      <Button variant="destructive">Click me</Button>
    </div>
  );
}
