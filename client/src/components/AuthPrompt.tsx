import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideShieldAlert } from "lucide-react";

interface AuthPromptProps {
  message?: string;
  title?: string;
}

export default function AuthPrompt({ 
  message = "You need to log in to access this content.",
  title = "Authentication Required"
}: AuthPromptProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-[400px] border-accent/20 bg-card/80 backdrop-blur">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2">
            <LucideShieldAlert className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-display">{title}</CardTitle>
          </div>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="default" 
              className="w-full" 
              onClick={() => window.location.href = "/api/login"}
            >
              Log In
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = "/"}
            >
              Return Home
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Logging in with Replit provides a secure way to access NovaLink.
        </CardFooter>
      </Card>
    </div>
  );
}