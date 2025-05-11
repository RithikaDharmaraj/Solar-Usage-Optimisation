import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { Shield, User, Building, Phone, MapPin } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  companyName: string;
  address: string;
  phone: string;
  createdAt: string;
}

export default function Profile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: profile, isLoading, error } = useQuery<UserProfile>({
    queryKey: ['/api/profile'],
    queryFn: async () => {
      const res = await apiRequest('/api/profile', 'GET');
      return await res.json();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedProfile: Partial<UserProfile>) => {
      const res = await apiRequest('/api/profile', 'PUT', updatedProfile);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    companyName: "",
    address: "",
    phone: "",
    email: ""
  });

  const handleEdit = () => {
    if (profile) {
      setFormData({
        companyName: profile.companyName,
        address: profile.address,
        phone: profile.phone,
        email: profile.email
      });
      setIsEditing(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-semibold mb-6">User Profile</h1>
        <div className="animate-pulse">
          <div className="bg-secondary-800 rounded-lg p-6 h-64"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-semibold mb-6">User Profile</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">Error loading profile. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center mb-6">
        <Shield className="mr-2 h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold">User Profile</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-medium">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Your Company"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Security St, Cityville"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start">
                <User className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">Username</h3>
                  <p className="text-sm text-muted-foreground">{profile?.username}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 h-5 w-5 text-muted-foreground">
                  <path d="M22 17.5l-9.3-9.3c-1.1-1.1-2.9-1.1-4 0l-5.5 5.5c-1.1 1.1-1.1 2.9 0 4l9.3 9.3c1.1 1.1 2.9 1.1 4 0l5.5-5.5c1.1-1.1 1.1-2.9 0-4z" />
                  <circle cx="7.5" cy="7.5" r="1" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground">{profile?.email || "Not provided"}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Building className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">Company</h3>
                  <p className="text-sm text-muted-foreground">{profile?.companyName || "Not provided"}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">Address</h3>
                  <p className="text-sm text-muted-foreground">{profile?.address || "Not provided"}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">Phone</h3>
                  <p className="text-sm text-muted-foreground">{profile?.phone || "Not provided"}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4 mt-6">
                <Button onClick={handleEdit}>
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}