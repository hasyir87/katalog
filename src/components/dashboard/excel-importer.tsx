'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Loader2, FileCheck2 } from 'lucide-react';
import { addPerfumesBatch } from '@/lib/actions';
import { ScrollArea } from '../ui/scroll-area';

interface ExcelImporterProps {
  onUploadSuccess: () => void;
}

export function ExcelImporter({ onUploadSuccess }: ExcelImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          toast({
              variant: 'destructive',
              title: 'Invalid File Type',
              description: 'Please upload a valid .xlsx Excel file.',
          });
          return;
      }
      setFile(selectedFile);
      handleParseFile(selectedFile);
    }
  };

  const handleParseFile = (fileToParse: File) => {
    setIsParsing(true);
    setParsedData([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setParsedData(json);
        toast({
            title: "File Ready",
            description: `Found ${json.length} rows to import. Click 'Impor Data' to proceed.`
        });
      } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Error Parsing File',
            description: 'Could not read the Excel file. Please ensure it is not corrupted.',
        });
        setFile(null);
        setParsedData([]);
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsArrayBuffer(fileToParse);
  };
  
  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data to Import',
        description: 'The file seems to be empty or could not be read.',
      });
      return;
    }

    setIsImporting(true);
    try {
      const plainData = JSON.parse(JSON.stringify(parsedData));
      const result = await addPerfumesBatch(plainData);
      
      if (result.errors.length > 0) {
         toast({
            variant: 'destructive',
            title: `Import completed with ${result.errors.length} errors`,
            description: (
              <div className="mt-2">
                <p>Successfully imported {result.successCount} items.</p>
                <p className="font-bold mt-2">Errors:</p>
                <ScrollArea className="h-20 mt-1">
                  <ul className="list-disc pl-4 text-xs">
                    {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                    {result.errors.length > 5 && <li>And {result.errors.length - 5} more...</li>}
                  </ul>
                </ScrollArea>
              </div>
            ),
            duration: 10000,
         });
      } else {
         toast({
            title: 'Import Successful!',
            description: `${result.successCount} perfumes have been added to the database.`,
            action: <div className="p-2 rounded-full bg-green-500"><FileCheck2 className="h-5 w-5 text-white" /></div>
         });
      }
      // Panggil callback setelah sukses
      onUploadSuccess();

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: error.message || 'An unexpected error occurred during import.',
      });
    } finally {
      setIsImporting(false);
      setOpen(false);
      resetState();
    }
  };

  const resetState = () => {
      setFile(null);
      setParsedData([]);
      setIsImporting(false);
      setIsParsing(false);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) resetState();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"> {/* Menambahkan size=sm */}
          <UploadCloud className="mr-2 h-4 w-4" />
          Impor dari Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Impor Parfum dari File Excel</DialogTitle>
          <DialogDescription>
            Pilih file .xlsx untuk mengimpor data parfum secara massal. Pastikan kolom sesuai dengan template.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="excel-file" className="sr-only">
            Pilih file Excel
          </Label>
          <Input id="excel-file" type="file" onChange={handleFileChange} accept=".xlsx" className="text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" disabled={isParsing || isImporting} />
        </div>

        {isParsing && (
            <div className="flex items-center justify-center h-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Membaca file...</p>
            </div>
        )}

        {parsedData.length > 0 && !isParsing && (
             <div className="flex items-center justify-center h-20 bg-secondary/30 rounded-lg border-2 border-dashed">
                <FileCheck2 className="h-8 w-8 text-green-600" />
                <p className="ml-4 text-muted-foreground">{`Siap mengimpor ${parsedData.length} baris.`}</p>
            </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isImporting}>Batal</Button>
          </DialogClose>
          <Button onClick={handleImport} disabled={!file || parsedData.length === 0 || isImporting || isParsing}>
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Impor Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
