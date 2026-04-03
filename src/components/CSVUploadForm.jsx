import React, { useState } from 'react';
import { X, Upload, AlertCircle, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import readXlsxFile from 'read-excel-file';
import dataService from '../services/dataService';

const CSVUploadForm = ({ isOpen, onClose, userId, onSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        setError(null);

        try {
            if (file.name.endsWith('.csv')) {
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => processData(results.data),
                    error: () => setError("Failed to parse CSV")
                });
            } else {
                const rows = await readXlsxFile(file);

                if (rows.length === 0) throw new Error("File is empty");

                const headers = rows[0].map(h => h.toString().toLowerCase().trim());
                const dataObjects = rows.slice(1).map(row => {
                    let obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index];
                    });
                    return obj;
                });

                await processData(dataObjects);
            }
        } catch (error) {
            console.error("Upload error:", error);
            setError("Invalid file format or structure.");
            setIsProcessing(false);
        }
    };

    const processData = async (data) => {
        try {
            const count = await dataService.importTransactions(userId, data);
            onSuccess(count);
            onClose();
        } catch (error) {
            setError(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[300] flex items-center justify-center p-4">
            <div className="bg-background-secondary border border-white/10 rounded-[2.5rem] p-10 w-full max-w-xl relative shadow-2xl space-y-8">
                <button onClick={onClose} className="absolute right-8 top-8 text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white">Import Records</h2>
                    <p className="text-gray-400 text-sm">Upload a .csv or .xlsx file. Ensure columns match: <b>date, merchant, amount, category, account</b>.</p>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                    <label className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center gap-4 hover:border-accent-main/50 hover:bg-accent-main/5 transition-all cursor-pointer group">
                        <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} disabled={isProcessing} />
                        {isProcessing ? (
                            <Loader2 className="animate-spin text-accent-main" size={48} />
                        ) : (
                            <Upload className="text-gray-600 group-hover:text-accent-main transition-colors" size={48} />
                        )}
                        <span className="text-sm font-black uppercase tracking-widest text-gray-500 group-hover:text-white">
                            {isProcessing ? "Processing Data..." : "Choose File"}
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
}

export default CSVUploadForm;