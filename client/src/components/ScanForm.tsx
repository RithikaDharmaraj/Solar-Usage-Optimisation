import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Scan name must be at least 2 characters.",
  }),
  networkRange: z.string().min(5, {
    message: "Please enter a valid network range (e.g., 192.168.1.0/24)",
  }),
  scanType: z.enum(["standard", "deep", "solar_focused"], {
    required_error: "Please select a scan type.",
  }),
});

interface ScanFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

export default function ScanForm({ onSubmit, onCancel }: ScanFormProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      networkRange: "",
      scanType: "standard",
    },
  });
  
  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit({
      scan_name: values.name,
      network_range: values.networkRange,
      scan_type: values.scanType
    });
  }
  
  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scan Name</FormLabel>
                <FormControl>
                  <Input placeholder="Office Network Scan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="networkRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Network Range</FormLabel>
                <FormControl>
                  <Input placeholder="192.168.1.0/24" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="scanType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scan Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a scan type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="standard">
                      Standard (Quick Scan)
                    </SelectItem>
                    <SelectItem value="deep">
                      Deep (Comprehensive Scan)
                    </SelectItem>
                    <SelectItem value="solar_focused">
                      Solar-Focused (Solar + IoT Devices)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
            >
              Start Scan
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}