'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { publicChat } from '@/ai/flows/public-chat-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, User, Wand2, X, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"

const FormSchema = z.object({
  query: z.string().min(1, { message: 'Message cannot be empty.' }),
});

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function PublicAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { query: '' },
  });
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    
    const userMessage: Message = { role: 'user', content: data.query };
    setMessages(prev => [...prev, userMessage]);
    form.reset();

    try {
      const result = await publicChat({ query: data.query });
      const aiMessage: Message = { role: 'assistant', content: result.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error with public AI chat:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'There was a problem communicating with the AI. Please try again.',
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
        setMessages([]); // Reset chat when closing
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
             <Button
                className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50"
                size="icon"
                aria-label="Open AI Chat"
            >
                <Wand2 className="h-8 w-8" />
            </Button>
        </SheetTrigger>
        <SheetContent className="w-full max-w-full sm:max-w-md p-0 flex flex-col" side="right">
           <SheetHeader className="p-6 border-b flex-shrink-0">
               <SheetTitle className="flex items-center gap-2 font-headline">
                   <MessageSquare className="h-6 w-6 text-primary" />
                   Asisten Aroma
               </SheetTitle>
               <SheetDescription>
                    Tanyakan apa saja tentang koleksi parfum kami!
               </SheetDescription>
           </SheetHeader>
           <div className="flex-1 flex flex-col min-h-0">
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
                    {messages.length === 0 && !isLoading && (
                        <div className="text-center text-muted-foreground pt-16">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary/30"/>
                            <h3 className="font-semibold text-lg">Selamat Datang!</h3>
                            <p>Saya bisa bantu Anda menemukan parfum yang sempurna.</p>
                            <p className="text-xs mt-2">Coba tanyakan: "Carikan saya parfum bunga untuk siang hari"</p>
                        </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t bg-background/80 flex-shrink-0">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name="query"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                                <Input placeholder="Ketik pesan Anda..." {...field} disabled={isLoading} />
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
            </div>
        </SheetContent>
    </Sheet>
  );
}
