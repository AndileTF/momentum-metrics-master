
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface ExcelUploaderProps {
  onUploadComplete: () => void;
}

interface ExcelRow {
  Agent: string;
  Email?: string;
  Date: string;
  "Helpdesk ticketing": number;
  Calls: number;
  "Live Chat": number;
  "Support/DNS Emails": number;
  "Social Tickets": number;
  "Billing Tickets": number;
  "Walk-Ins": number;
  Group?: string;
  "Team Lead Group"?: string;
}

export function ExcelUploader({ onUploadComplete }: ExcelUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    processed: number;
    duplicates: number;
  } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const processExcelFile = async (file: File): Promise<ExcelRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const excelData = await processExcelFile(file);
      
      if (excelData.length === 0) {
        throw new Error("No data found in the Excel file");
      }

      let processedCount = 0;
      let duplicateCount = 0;

      for (const row of excelData) {
        // Skip rows with missing agent names
        if (!row.Agent || typeof row.Agent !== 'string') {
          continue;
        }
        
        // Calculate total issues
        const totalIssues = (row["Helpdesk ticketing"] || 0) + 
                           (row.Calls || 0) +
                           (row["Live Chat"] || 0) + 
                           (row["Support/DNS Emails"] || 0) + 
                           (row["Social Tickets"] || 0) + 
                           (row["Billing Tickets"] || 0) + 
                           (row["Walk-Ins"] || 0);

        // Check if record already exists (Agent + Date combination)
        const { data: existing } = await supabase
          .from("daily_stats")
          .select("*")
          .eq("Agent", row.Agent)
          .eq("Date", row.Date)
          .maybeSingle();

        if (existing) {
          duplicateCount++;
          continue;
        }

        // Generate a UUID for agentid
        const agentid = crypto.randomUUID();
        
        // Insert new record
        const { error } = await supabase
          .from("daily_stats")
          .insert({
            Agent: row.Agent,
            agentid: agentid,
            Email: row.Email || null,
            Date: row.Date,
            "Helpdesk ticketing": row["Helpdesk ticketing"] || 0,
            Calls: row.Calls || 0,
            "Live Chat": row["Live Chat"] || 0,
            "Support/DNS Emails": row["Support/DNS Emails"] || 0,
            "Social Tickets": row["Social Tickets"] || 0,
            "Billing Tickets": row["Billing Tickets"] || 0,
            "Walk-Ins": row["Walk-Ins"] || 0,
            "Total Issues handled": totalIssues,
            Group: row.Group || null,
            "Team Lead Group": row["Team Lead Group"] || null
          });

        if (error) {
          console.error("Error inserting row:", error);
        } else {
          processedCount++;
        }
      }

      setUploadResult({
        success: true,
        message: `Upload completed successfully!`,
        processed: processedCount,
        duplicates: duplicateCount
      });

      toast({
        title: "Upload Successful",
        description: `Processed ${processedCount} records, ${duplicateCount} duplicates skipped`,
      });

      onUploadComplete();

    } catch (error) {
      console.error("Upload error:", error);
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
        processed: 0,
        duplicates: 0
      });
      
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Excel Data Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="excel-file">Select Excel File</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="mt-2"
            />
          </div>

          {file && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Selected file: {file.name}</p>
              <p className="text-xs text-muted-foreground">
                Size: {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Data
              </>
            )}
          </Button>
        </div>

        {uploadResult && (
          <div className={`p-4 rounded-lg ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2">
              {uploadResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <p className={`font-medium ${uploadResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {uploadResult.message}
              </p>
            </div>
            {uploadResult.success && (
              <div className="mt-2 text-sm text-green-700">
                <p>Records processed: {uploadResult.processed}</p>
                <p>Duplicates skipped: {uploadResult.duplicates}</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Expected Excel Format:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Agent (required)</p>
            <p>• Email (optional)</p>
            <p>• Date (required, format: YYYY-MM-DD)</p>
            <p>• Helpdesk ticketing (number)</p>
            <p>• Calls (number)</p>
            <p>• Live Chat (number)</p>
            <p>• Support/DNS Emails (number)</p>
            <p>• Social Tickets (number)</p>
            <p>• Billing Tickets (number)</p>
            <p>• Walk-Ins (number)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
