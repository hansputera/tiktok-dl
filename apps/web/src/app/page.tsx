'use client';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getTikTokURL } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

export default function Home() {
  const formSchema = z.object({
    url: z.url().refine((val) => getTikTokURL(val), {
      error: 'Invalid VT Tiktok URL',
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {

  }

  return (
    <div className="min-h-screen flex items-center justify-center lg:justify-center">
      <div className="w-full max-w-6xl mx-auto px-4">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <h1 className="text-4xl font-sans text-black mb-6">
            Download TikTok Videos!
          </h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="url" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl">VT URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Tiktok video URL (e.g. https://vt.tiktok.com/XXXXXX)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Please provide the tiktok video URL to download
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit">
                Download
              </Button>
            </form>
          </Form>
        </div>

        {/* Large Screen Hero Layout */}
        <div className="hidden lg:flex lg:items-center lg:gap-12">
          {/* Hero Title */}
          <div className="flex-shrink-0">
            <h1 className="text-6xl font-sans text-black leading-tight">
              Download<br />
              TikTok<br />
              Videos!
            </h1>
          </div>

          {/* Form Section */}
          <div className="flex-1 max-w-md">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="url" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl">VT URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Tiktok video URL (e.g. https://vt.tiktok.com/XXXXXX)" 
                        className="text-lg py-3"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-base">
                      Please provide the tiktok video URL to download
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" size="lg" className="w-full">
                  Download
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}