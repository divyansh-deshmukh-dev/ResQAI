import { useState, useEffect } from "react";
import { Megaphone, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase, Announcement } from "@/lib/supabase";

const AnnouncementsFeed = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetchAnnouncements();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('announcements')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'announcements' },
        () => fetchAnnouncements()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) setAnnouncements(data);
  };

  const getTimeAgo = (timestamp: string) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Card className="p-4 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Official Announcements</h3>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {announcements.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No announcements yet</p>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="p-3 bg-secondary/50 rounded-lg border border-border hover:bg-secondary/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary">
                  Official
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {getTimeAgo(announcement.created_at)}
                </div>
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">{announcement.title}</h4>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">{announcement.message}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default AnnouncementsFeed;
