import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, MapPin, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ReportsPage = () => {
  const [formData, setFormData] = useState({
    disasterType: "",
    description: "",
    location: "",
    image: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get current location
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const report = {
        type: formData.disasterType,
        description: formData.description,
        location: formData.location || `${position.coords.latitude}, ${position.coords.longitude}`,
        user_id: 'anonymous-' + Date.now(),
        status: 'pending'
      };

      const { error } = await supabase
        .from('reports')
        .insert(report);

      if (error) {
        toast.error("Failed to submit report", {
          description: error.message,
        });
        return;
      }

      toast.success("✅ Report sent successfully!", {
        description: "Authorities have been notified of your report",
      });

      // Reset form
      setFormData({
        disasterType: "",
        description: "",
        location: "",
        image: null,
      });
    } catch (error) {
      toast.error("Could not get location", {
        description: "Please enable location services",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Anonymous Reporting</h1>
          <p className="text-muted-foreground">
            Report disasters or safety concerns to help authorities respond faster
          </p>
        </div>

        <Card className="p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Disaster Type */}
            <div className="space-y-2">
              <Label htmlFor="disaster-type">Disaster Type *</Label>
              <Select
                value={formData.disasterType}
                onValueChange={(value) => setFormData({ ...formData, disasterType: value })}
              >
                <SelectTrigger id="disaster-type">
                  <SelectValue placeholder="Select disaster type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flood">Flood</SelectItem>
                  <SelectItem value="earthquake">Earthquake</SelectItem>
                  <SelectItem value="wildfire">Wildfire</SelectItem>
                  <SelectItem value="cyclone">Cyclone</SelectItem>
                  <SelectItem value="landslide">Landslide</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Enter location or leave blank for auto-detect"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your GPS location will be automatically captured
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what you're seeing or experiencing..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Photo (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.files?.[0] || null })
                  }
                  className="hidden"
                />
                <Label
                  htmlFor="image"
                  className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                >
                  {formData.image ? formData.image.name : "Click to upload image"}
                </Label>
              </div>
            </div>

            {/* Privacy notice */}
            <div className="bg-secondary/50 p-4 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground">
                🔒 Your report is anonymous. We only collect your location data to help emergency
                responders. No personal information is stored.
              </p>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!formData.disasterType || !formData.description}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Report
            </Button>
          </form>
        </Card>

        {/* Info cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4 bg-rescue/10 border-rescue shadow-card">
            <h3 className="font-semibold text-foreground mb-2">Why Report?</h3>
            <p className="text-sm text-muted-foreground">
              Your reports help authorities understand the ground situation and deploy resources
              effectively.
            </p>
          </Card>
          <Card className="p-4 bg-safety/10 border-safety shadow-card">
            <h3 className="font-semibold text-foreground mb-2">Response Time</h3>
            <p className="text-sm text-muted-foreground">
              Reports are reviewed within 5 minutes and forwarded to relevant emergency teams.
            </p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
