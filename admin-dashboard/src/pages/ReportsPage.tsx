import { useEffect } from 'react'
import { useAdminStore } from '@/store/adminStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, MapPin, Camera, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

export function ReportsPage() {
  const { reports, fetchReports, updateReportStatus } = useAdminStore()

  useEffect(() => {
    fetchReports()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-600'
      case 'under_review': return 'bg-yellow-500'
      case 'pending': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return CheckCircle
      case 'under_review': return Clock
      case 'pending': return AlertTriangle
      default: return AlertTriangle
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Reports Management</h1>
      
      {/* Reports Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === 'verified').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>User Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No reports submitted yet.
            </p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => {
                const StatusIcon = getStatusIcon(report.status)
                return (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(report.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {report.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="font-medium text-lg">{report.type}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(report.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-700 mb-2">{report.description}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {report.location}
                        </div>
                      </div>
                      
                      {report.photo_url && (
                        <div className="flex items-center gap-2">
                          <Camera className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Photo attached</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateReportStatus(report.id, 'under_review')}
                        disabled={report.status === 'under_review'}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Under Review
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateReportStatus(report.id, 'verified')}
                        disabled={report.status === 'verified'}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}