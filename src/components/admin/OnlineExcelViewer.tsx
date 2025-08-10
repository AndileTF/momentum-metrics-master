import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileSpreadsheet, Loader2, AlertCircle, Download, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

export function OnlineExcelViewer() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoadFile = async () => {
    if (!url) {
      setError("Please enter a valid URL");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length > 0) {
        const firstRow = jsonData[0] as any;
        const headerKeys = Object.keys(firstRow);
        setHeaders(headerKeys);
        setData(jsonData);
        toast.success("Excel file loaded successfully");
      } else {
        setError("No data found in the Excel file");
      }
    } catch (err) {
      console.error('Error loading file:', err);
      setError("Failed to load Excel file. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    if (data.length === 0) return;
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "downloaded-data.xlsx");
    toast.success("Excel file downloaded successfully");
  };

  const handleUpdateStats = async () => {
    if (data.length === 0) {
      toast.error("No data to update");
      return;
    }

    try {
      setLoading(true);
      
      // Transform data to match daily_stats table structure
      const transformedData = data.map((row: any) => ({
        Agent: row.Agent || row.agent || row.Name || row.name,
        Email: row.Email || row.email,
        Date: row.Date || row.date || new Date().toISOString().split('T')[0],
        Calls: parseInt(row.Calls || row.calls || '0'),
        "Sales Tickets": parseInt(row["Sales Tickets"] || row.sales_tickets || '0'),
        Group: row.Group || row.group,
        "Billing Tickets": row["Billing Tickets"] || row.billing_tickets || '0',
        "Walk-Ins": row["Walk-Ins"] || row.walk_ins || '0',
        "Support/DNS Emails": row["Support/DNS Emails"] || row.support_emails || '0',
        "Live Chat": row["Live Chat"] || row.live_chat || '0',
        "Social Tickets": row["Social Tickets"] || row.social_tickets || '0',
        "Team Lead Group": row["Team Lead Group"] || row.team_lead_group,
        Profile: row.Profile || row.profile
      }));

      // Insert data into daily_stats table
      const { error } = await supabase
        .from('daily_stats' as any)
        .upsert(transformedData as any, { onConflict: 'Agent,Date' as any });

      if (error) throw error;

      toast.success(`Successfully updated ${transformedData.length} records`);
    } catch (error) {
      console.error('Error updating stats:', error);
      toast.error('Failed to update stats in database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Online Excel Viewer</CardTitle>
          <CardDescription>
            View and manage Excel files from online sources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Excel file URL (e.g., Google Sheets, OneDrive, etc.)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleLoadFile} disabled={loading || !url}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              Load File
            </Button>
          </div>
          
          {data.length > 0 && (
            <div className="flex gap-2">
              <Button onClick={handleDownloadExcel} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Excel
              </Button>
              <Button onClick={handleUpdateStats} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                Update Stats in Database
              </Button>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Excel Data ({data.length} rows)</CardTitle>
            <CardDescription>
              Data loaded from: {url}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    {headers.map((header, index) => (
                      <th key={index} className="border border-gray-300 px-4 py-2 text-left font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 100).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {headers.map((header, colIndex) => (
                        <td key={colIndex} className="border border-gray-300 px-4 py-2">
                          {row[header] || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.length > 100 && (
              <p className="mt-4 text-sm text-gray-500">
                Showing first 100 rows of {data.length} total rows
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}