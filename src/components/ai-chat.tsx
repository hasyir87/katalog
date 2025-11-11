'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { chatWithAI } from '@/ai/flows/chat-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Paperclip, Send, User, Wand2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const FormSchema = z.object({
  query: z.string().min(1, { message: 'Message cannot be empty.' }),
});

type Message = {
  role: 'user' | 'assistant';
  content: string;
  filePreview?: string;
};

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { query: '' },
  });
  
  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // For this PoC, we'll only handle text-based files.
      if (selectedFile.type.startsWith('text/')) {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          // For text files, we can show a snippet of the content.
          const textContent = reader.result as string;
          setFilePreview(textContent.substring(0, 100) + (textContent.length > 100 ? '...' : ''));
        };
        reader.readAsText(selectedFile);
      } else {
        toast({
          variant: 'destructive',
          title: 'Unsupported File Type',
          description: 'For this demo, please upload a text-based file (e.g., .txt, .md).',
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };
  
  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    
    // Add user message to chat
    const userMessage: Message = { role: 'user', content: data.query, filePreview: file ? file.name : undefined };
    setMessages(prev => [...prev, userMessage]);
    form.reset();

    let fileDataUri: string | undefined = undefined;
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      fileDataUri = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result as string);
      });
      removeFile(); // Clear file after processing
    }

    try {
      const result = await chatWithAI({ query: data.query, fileDataUri });
      const aiMessage: Message = { role: 'assistant', content: result.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error with AI chat:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'There was a problem communicating with the AI. Please try again.',
      });
      // Optionally remove the user's last message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="h-full flex flex-col shadow-none border-none rounded-none bg-transparent">
      <CardContent className="p-0 flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : '')}>
                {message.role === 'assistant' && (
                  <Avatar className="h-9 w-9 border-2 border-primary/50">
                    <AvatarFallback><Wand2/></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                    "max-w-md rounded-lg px-4 py-3 text-sm",
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                  {message.filePreview && (
                    <div className="mb-2 p-2 border border-dashed rounded-md bg-white/10">
                        <p className="text-xs font-bold flex items-center gap-1"><Paperclip className="h-3 w-3"/>Attached: {message.filePreview}</p>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                 {message.role === 'user' && (
                  <Avatar className="h-9 w-9">
                    <AvatarFallback><User/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9 border-2 border-primary/50">
                    <AvatarFallback><Wand2/></AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-3 text-sm flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin"/>
                </div>
              </div>
            )}
            {messages.length === 0 && (
                <div className="text-center text-muted-foreground pt-16">
                    <Wand2 className="h-12 w-12 mx-auto mb-4 text-primary/30"/>
                    <h3 className="font-semibold text-lg">AI Assistant</h3>
                    <p>Ask me about the perfume collection!</p>
                    <p className="text-xs mt-2">Try: "Find me a floral perfume for daytime use"</p>
                </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background/80">
          {filePreview && (
            <div className="mb-2 p-2 border rounded-lg relative bg-muted/50">
                <p className="text-xs font-semibold text-muted-foreground">Attached file:</p>
                <p className="text-sm italic text-foreground/80 truncate">{file?.name}</p>
                <Button onClick={removeFile} variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6">
                    <X className="h-4 w-4"/>
                </Button>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Ask about perfumes or attach a file..." {...field} disabled={isLoading} />
                         <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                        >
                            <Paperclip className="h-5 w-5"/>
                        </Button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="icon">
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
