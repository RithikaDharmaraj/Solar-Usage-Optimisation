import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Appliance schema
const applianceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  consumption: z.coerce
    .number()
    .min(0.1, "Consumption must be at least 0.1 kWh")
    .max(50, "Consumption must be less than 50 kWh"),
  priority: z.enum(["High", "Medium", "Low"]),
  flexibility: z.enum(["High", "Medium", "Low"]),
  runTime: z.coerce
    .number()
    .int()
    .min(1, "Run time must be at least 1 hour")
    .max(24, "Run time cannot exceed 24 hours"),
});

type ApplianceFormValues = z.infer<typeof applianceSchema>;

// Common appliance presets for quick selection
const appliancePresets = [
  {
    name: "Air Conditioner",
    consumption: 1.5,
    priority: "Medium",
    flexibility: "Medium",
    runTime: 6,
  },
  {
    name: "Washing Machine",
    consumption: 1.2,
    priority: "Medium",
    flexibility: "High",
    runTime: 2,
  },
  {
    name: "Water Heater",
    consumption: 2.0,
    priority: "Medium",
    flexibility: "Medium",
    runTime: 3,
  },
  {
    name: "Television",
    consumption: 0.2,
    priority: "Low",
    flexibility: "Low",
    runTime: 4,
  },
  {
    name: "Refrigerator",
    consumption: 0.9,
    priority: "High",
    flexibility: "Low",
    runTime: 24,
  },
  {
    name: "Microwave",
    consumption: 1.1,
    priority: "Low",
    flexibility: "High",
    runTime: 1,
  },
  {
    name: "Mixer Grinder",
    consumption: 0.75,
    priority: "Low",
    flexibility: "High",
    runTime: 1,
  },
  {
    name: "Rice Cooker",
    consumption: 0.6,
    priority: "Medium",
    flexibility: "High",
    runTime: 1,
  },
  {
    name: "Fan",
    consumption: 0.1,
    priority: "Medium",
    flexibility: "Medium",
    runTime: 10,
  },
  {
    name: "Iron Box",
    consumption: 1.0,
    priority: "Low",
    flexibility: "High",
    runTime: 1,
  },
];

interface Appliance extends ApplianceFormValues {
  id: string;
  optimalHours?: string;
  status?: string;
}

interface ApplianceManagementProps {
  appliances: Appliance[];
  onAppliancesChange: (appliances: Appliance[]) => void;
  electricityRate: number;
  onElectricityRateChange: (rate: number) => void;
}

export default function ApplianceManagement({
  appliances,
  onAppliancesChange,
  electricityRate,
  onElectricityRateChange,
}: ApplianceManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false);

  const form = useForm<ApplianceFormValues>({
    resolver: zodResolver(applianceSchema),
    defaultValues: {
      name: "",
      consumption: 1.0,
      priority: "Medium",
      flexibility: "Medium",
      runTime: 2,
    },
  });

  const handleSubmit = (values: ApplianceFormValues) => {
    const newAppliance: Appliance = {
      ...values,
      id: Date.now().toString(),
    };
    
    onAppliancesChange([...appliances, newAppliance]);
    setIsOpen(false);
    form.reset();
  };

  const handleDelete = (id: string) => {
    onAppliancesChange(appliances.filter(appliance => appliance.id !== id));
  };

  const addPreset = (preset: ApplianceFormValues) => {
    const newAppliance: Appliance = {
      ...preset,
      id: Date.now().toString(),
    };
    
    onAppliancesChange([...appliances, newAppliance]);
    setIsPresetDialogOpen(false);
  };

  const totalConsumption = appliances.reduce(
    (total, appliance) => total + appliance.consumption * appliance.runTime,
    0
  );

  // Calculate daily cost in rupees
  const dailyCost = totalConsumption * electricityRate;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500 hover:bg-red-600";
      case "Medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Low":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "";
    }
  };

  const getFlexibilityColor = (flexibility: string) => {
    switch (flexibility) {
      case "High":
        return "bg-blue-500 hover:bg-blue-600";
      case "Medium":
        return "bg-indigo-500 hover:bg-indigo-600";
      case "Low":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Appliance Management</h3>
          <p className="text-sm text-muted-foreground">
            Add and manage your appliances for optimization
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Button onClick={() => setIsPresetDialogOpen(true)} variant="outline">
            Add Common Appliances
          </Button>
          <Button onClick={() => setIsOpen(true)}>Add Custom Appliance</Button>
        </div>
      </div>

      {/* Electricity rate input */}
      <div className="border p-4 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="font-medium">Electricity Rate</h4>
            <p className="text-sm text-muted-foreground">
              Current cost per kWh in Indian rupees
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              type="number"
              min="1"
              max="20"
              step="0.1"
              value={electricityRate}
              onChange={(e) => onElectricityRateChange(parseFloat(e.target.value) || 7.0)}
              className="w-full md:w-[120px]"
            />
            <span className="text-sm">₹/kWh</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border p-4 rounded-lg">
          <h4 className="text-sm text-muted-foreground">Total Appliances</h4>
          <p className="text-2xl font-bold">{appliances.length}</p>
        </div>
        <div className="border p-4 rounded-lg">
          <h4 className="text-sm text-muted-foreground">Daily Consumption</h4>
          <p className="text-2xl font-bold">{totalConsumption.toFixed(2)} kWh</p>
        </div>
        <div className="border p-4 rounded-lg">
          <h4 className="text-sm text-muted-foreground">Daily Cost</h4>
          <p className="text-2xl font-bold">₹{dailyCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Appliance List */}
      {appliances.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-3">Appliance</th>
                  <th className="text-center p-3">Consumption (kWh)</th>
                  <th className="text-center p-3">Run Time (hrs)</th>
                  <th className="text-center p-3">Priority</th>
                  <th className="text-center p-3">Flexibility</th>
                  <th className="text-center p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appliances.map((appliance) => (
                  <tr key={appliance.id} className="border-t">
                    <td className="p-3 font-medium">{appliance.name}</td>
                    <td className="p-3 text-center">{appliance.consumption}</td>
                    <td className="p-3 text-center">{appliance.runTime}</td>
                    <td className="p-3 text-center">
                      <Badge className={getPriorityColor(appliance.priority)}>
                        {appliance.priority}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={getFlexibilityColor(appliance.flexibility)}>
                        {appliance.flexibility}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(appliance.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            No appliances added yet. Add appliances to start optimizing.
          </p>
        </div>
      )}

      {/* Add Custom Appliance Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Appliance</DialogTitle>
            <DialogDescription>
              Enter the details of your appliance for energy optimization.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appliance Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Air Conditioner" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="consumption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Power Consumption (kWh)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="50"
                        placeholder="1.5"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The average hourly power consumption
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How important is this appliance?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flexibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Flexibility</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select flexibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Can this appliance run at any time?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="runTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Run Time (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="24"
                        placeholder="2"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      How many hours does this appliance run per day?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Appliance</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Preset Appliances Dialog */}
      <Dialog open={isPresetDialogOpen} onOpenChange={setIsPresetDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Common Appliances</DialogTitle>
            <DialogDescription>
              Select from common household appliances to quickly add to your list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {appliancePresets.map((preset, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium">{preset.name}</h4>
                <div className="text-sm">
                  <p>
                    <span className="text-muted-foreground">Consumption:</span>{" "}
                    {preset.consumption} kWh
                  </p>
                  <p>
                    <span className="text-muted-foreground">Run Time:</span>{" "}
                    {preset.runTime} hrs
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className={getPriorityColor(preset.priority)}>
                      {preset.priority}
                    </Badge>
                    <Badge className={getFlexibilityColor(preset.flexibility)}>
                      {preset.flexibility}
                    </Badge>
                  </div>
                </div>
                <Button
                  className="w-full mt-2"
                  size="sm"
                  onClick={() => addPreset(preset)}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPresetDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}