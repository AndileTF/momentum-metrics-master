
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Globe, FileSpreadsheet, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function OnlineExcelViewer() {
  const [excelUrl, setExcelUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOpenExcel = () => {
    if (!excelUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid Excel URL",
        variant: "destructive"
      });
      return;
    }

    // Validate URL format
    try {
      new URL(excelUrl);
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Open in new tab
    window.open(excelUrl, '_blank', 'noopener,noreferrer');
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Success",
        description: "Excel sheet opened in new tab"
      });
    }, 1000);
  };

  const predefinedUrls = [
    {
      name: "SharePoint Excel",
      url: "https://your-sharepoint-site.sharepoint.com/sites/your-site/Shared%20Documents/your-excel-file.xlsx",
      description: "Main performance tracking sheet"
    },
    {
      name: "Google Sheets",
      url: "https://docs.google.com/spreadsheets/d/your-sheet-id/edit#gid=0",
      description: "Backup data sheet"
    },
    {
      name: "OneDrive Excel",
      url: "https://onedrive.live.com/edit.aspx?your-file-id",
      description: "Monthly reports"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Online Excel Viewer</h2>
      </div>

      {/* Custom URL Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Access Online Excel Sheet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="excel-url">Excel Sheet URL</Label>
            <Input
              id="excel-url"
              type="url"
              placeholder="https://your-excel-url.com/sheet"
              value={excelUrl}
              onChange={(e) => setExcelUrl(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Button 
            onClick={handleOpenExcel}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Opening...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Open Excel Sheet
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Predefined URLs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Quick Access Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefinedUrls.map((item, index) => (
              <Card key={index} className="border-2 border-dashed border-muted hover:border-primary transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setExcelUrl(item.url);
                        window.open(item.url, '_blank', 'noopener,noreferrer');
                      }}
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>1. <strong>SharePoint:</strong> Copy the sharing link from your SharePoint Excel file</p>
            <p>2. <strong>Google Sheets:</strong> Use the shareable link from Google Sheets</p>
            <p>3. <strong>OneDrive:</strong> Copy the edit link from OneDrive</p>
            <p>4. <strong>Custom URL:</strong> Enter any direct link to an online Excel sheet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
