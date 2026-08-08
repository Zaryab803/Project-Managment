// src/components/ui/Loader.tsx
import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: number;
  text?: string;
  fullScreen?: boolean;
}

export default function Loader({ size = 10, text = "Loading...", fullScreen = false }: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-3 p-6">
      <Loader2 className="animate-spin text-indigo-600" style={{ width: size, height: size }} />
      {text && <p className="text-sm font-medium text-muted-foreground">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        {content}
      </div>
    );
  }

  return content;
}