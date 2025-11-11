import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Satellite, Globe, AlertTriangle } from 'lucide-react';
import SatelliteDetection from '../../satellite-detection/SatelliteDetection';

const SatellitePage = () => {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Satellite Detection</h1>
            <p className="text-muted-foreground">Real-time wildfire tracking via NASA satellite data</p>
          </div>
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            <Satellite className="h-3 w-3 mr-1" />
            Live Tracking
          </Badge>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 border-l-4 border-red-500">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold text-foreground">Active Wildfires</h3>
                <p className="text-sm text-muted-foreground">NASA EONET Data</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-blue-500">
            <div className="flex items-center space-x-3">
              <Globe className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-foreground">Global Coverage</h3>
                <p className="text-sm text-muted-foreground">Worldwide monitoring</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-green-500">
            <div className="flex items-center space-x-3">
              <Satellite className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-foreground">Real-time Updates</h3>
                <p className="text-sm text-muted-foreground">Live satellite feeds</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Satellite Detection Component */}
        <Card className="overflow-hidden">
          <SatelliteDetection />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SatellitePage;