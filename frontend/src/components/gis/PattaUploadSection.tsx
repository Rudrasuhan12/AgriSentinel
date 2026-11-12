import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Eye, 
  Sparkles, 
  ShieldCheck,
  Check,
  FileCheck2,
  Trash2
} from 'lucide-react';
import { api } from '../../api/client';

export interface ExtractedPattaData {
  state: string;
  district?: string;
  tahasil?: string;
  village?: string;
  thana?: string;
  thana_number?: string;
  khata_number?: string;
  plot_number?: string;
  landowner_name?: string;
  land_classification?: string;
  area_acres?: number;
  area_hectares?: number;
  form_type?: string;
  page_count?: number;
  extraction_method?: string;
}

interface PattaUploadResponse {
  success: boolean;
  document_id: string;
  filename: string;
  file_size_bytes: number;
  mime_type: string;
  status: string;
  extracted_fields: ExtractedPattaData;
  confidence_scores: Record<string, number>;
  overall_confidence: number;
  matched_administrative_record?: Record<string, any>;
  cadastral_polygon_found: boolean;
  message: string;
}

interface PattaUploadSectionProps {
  onApplyExtractedDetails: (details: ExtractedPattaData, shouldAutoLocate?: boolean) => void;
}

export const PattaUploadSection: React.FC<PattaUploadSectionProps> = ({
  onApplyExtractedDetails,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [processing, setProcessing] = useState<boolean>(false);
  const [extractionResult, setExtractionResult] = useState<PattaUploadResponse | null>(null);
  const [editableFields, setEditableFields] = useState<ExtractedPattaData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (selectedFile: File) => {
    setErrorMessage(null);
    setAppliedSuccess(false);

    // Validate size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setErrorMessage(`Selected file is too large (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`);
      return;
    }

    // Validate format
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(selectedFile.type) && !['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
      setErrorMessage('Unsupported file format. Please upload an Odisha Patta in PDF, JPG, or PNG format.');
      return;
    }

    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      setFilePreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setFilePreviewUrl(null);
    }

    // Trigger upload & extraction
    performUploadAndExtraction(selectedFile);
  };

  const performUploadAndExtraction = async (targetFile: File) => {
    setProcessing(true);
    setUploadProgress(20);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', targetFile);

    try {
      setUploadProgress(40);
      const res = await api.upload<PattaUploadResponse>('/api/documents/upload-patta', formData);

      setUploadProgress(100);
      setExtractionResult(res);
      setEditableFields({ ...res.extracted_fields });
      setProcessing(false);
    } catch (err: any) {
      setProcessing(false);
      setUploadProgress(0);
      const detail = err.message || 'Failed to process Patta document.';
      setErrorMessage(detail);
    }
  };

  const handleResetDocument = () => {
    setFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setExtractionResult(null);
    setEditableFields(null);
    setUploadProgress(0);
    setProcessing(false);
    setErrorMessage(null);
    setAppliedSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFieldChange = (key: keyof ExtractedPattaData, value: any) => {
    if (!editableFields) return;
    setEditableFields({
      ...editableFields,
      [key]: value,
    });
  };

  const handleApplyToRegistration = (autoLocate: boolean = false) => {
    if (!editableFields) return;
    if (autoLocate && !editableFields.plot_number?.trim()) {
      setErrorMessage('Please provide a Plot Number in the form below before locating on the satellite map.');
      return;
    }
    onApplyExtractedDetails(editableFields, autoLocate);
    setAppliedSuccess(true);

    // Confirm with backend if document_id exists
    if (extractionResult?.document_id) {
      api.post(`/api/documents/patta/${extractionResult.document_id}/confirm`, {
        verified_fields: editableFields,
      }).catch(err => console.error('Failed to confirm document verification:', err));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-[#F7F9F8] border border-[#E2E9E4] rounded-xl p-3.5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E6F4EA] border border-[#008C45]/20 flex items-center justify-center text-[#008C45]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#172B22] flex items-center gap-1.5">
              Upload Patta / Record of Rights
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">
                AI Auto-Fill
              </span>
            </h4>
            <p className="text-[11px] text-[#64746A]">
              Upload Odisha land ownership document (PDF, JPG, PNG) to automatically extract Khata, Plot, Mouza, Tahasil, and area.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Dropzone (When no file is selected) */}
      {!file && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            isDragOver 
              ? 'border-[#008C45] bg-[#E6F4EA]/40' 
              : 'border-[#CBD7CE] hover:border-[#008C45]/70 bg-white hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-[#E6F4EA] text-[#008C45] flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#172B22]">
              Drag & drop Patta document here, or <span className="text-[#008C45] underline">Browse files</span>
            </p>
            <p className="text-[10px] text-[#64746A]">
              Supported formats: PDF, JPG, JPEG, PNG (Max 10 MB) • Schedule I Form No. 39-A
            </p>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button 
            type="button" 
            onClick={() => setErrorMessage(null)} 
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Selected File Badge & Processing State */}
      {file && (
        <div className="bg-white border border-[#E2E9E4] rounded-lg p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#E6F4EA] text-[#008C45] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#172B22] truncate max-w-[240px]">
                  {file.name}
                </p>
                <p className="text-[10px] text-[#64746A]">
                  {formatFileSize(file.size)} • {file.type.toUpperCase() || 'DOCUMENT'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {filePreviewUrl && (
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-2 py-1 rounded text-[11px] border border-[#E2E9E4] hover:bg-slate-50 text-slate-600 flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </button>
              )}
              <button
                type="button"
                onClick={handleResetDocument}
                className="px-2 py-1 rounded text-[11px] border border-red-200 hover:bg-red-50 text-red-600 flex items-center gap-1 transition-colors"
                title="Remove and replace file"
              >
                <Trash2 className="w-3 h-3" />
                Replace
              </button>
            </div>
          </div>

          {/* Progress Bar while uploading / processing */}
          {processing && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#008C45] font-medium flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Analyzing Odisha Land Record with AI OCR...
                </span>
                <span className="font-mono text-[#64746A]">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#008C45] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Extracted Fields Review & Confirmation Card */}
      {extractionResult && editableFields && !processing && (
        <div className="bg-white border border-[#008C45]/30 rounded-xl p-3.5 space-y-3 shadow-xs">
          {/* Card Header & Confidence */}
          <div className="flex items-center justify-between border-b border-[#E2E9E4] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileCheck2 className="w-3.5 h-3.5" />
              </span>
              <div>
                <h5 className="text-xs font-bold text-[#172B22]">
                  Extracted Land Record Details
                </h5>
                <p className="text-[10px] text-[#64746A]">
                  Review or edit the extracted parameters below before applying to registration.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E6F4EA] text-[#008C45] border border-[#008C45]/20 flex items-center gap-1">
                <Check className="w-3 h-3" />
                {Math.round(extractionResult.overall_confidence * 100)}% Confidence
              </span>
              {extractionResult.cadastral_polygon_found && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  PostGIS Spatial Match
                </span>
              )}
            </div>
          </div>

          {/* Extracted Fields Grid (Editable) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {/* District */}
            <div>
              <label className="block text-[10px] font-medium text-[#64746A] mb-1">
                District (ଜିଲ୍ଲା)
              </label>
              <input
                type="text"
                value={editableFields.district || ''}
                onChange={(e) => handleFieldChange('district', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#F7F9F8] border border-[#E2E9E4] focus:border-[#008C45] rounded-lg text-xs font-medium text-[#172B22]"
                placeholder="e.g. Cuttack"
              />
            </div>

            {/* Tahasil */}
            <div>
              <label className="block text-[10px] font-medium text-[#64746A] mb-1">
                Tahasil (ତହସିଲ)
              </label>
              <input
                type="text"
                value={editableFields.tahasil || ''}
                onChange={(e) => handleFieldChange('tahasil', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#F7F9F8] border border-[#E2E9E4] focus:border-[#008C45] rounded-lg text-xs font-medium text-[#172B22]"
                placeholder="e.g. Cuttack"
              />
            </div>

            {/* Mouza / Village */}
            <div>
              <label className="block text-[10px] font-medium text-[#64746A] mb-1">
                Village / Mouza (ମୌଜା)
              </label>
              <input
                type="text"
                value={editableFields.village || ''}
                onChange={(e) => handleFieldChange('village', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#F7F9F8] border border-[#E2E9E4] focus:border-[#008C45] rounded-lg text-xs font-medium text-[#172B22]"
                placeholder="e.g. Andarpur"
              />
            </div>

            {/* Khata Number */}
            <div>
              <label className="block text-[10px] font-bold text-[#172B22] mb-1 flex items-center justify-between">
                <span>Khata No. (ଖତିୟାନ ନଂ) *</span>
                <span className="text-[9px] text-[#008C45] font-mono">
                  {Math.round((extractionResult.confidence_scores?.khata_number || 0.95) * 100)}%
                </span>
              </label>
              <input
                type="text"
                value={editableFields.khata_number || ''}
                onChange={(e) => handleFieldChange('khata_number', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-emerald-50/50 border border-emerald-300 focus:border-[#008C45] rounded-lg text-xs font-bold text-[#172B22] font-mono"
                placeholder="e.g. 299/611"
              />
            </div>

            {/* Plot Number */}
            <div>
              <label className="block text-[10px] font-bold text-[#172B22] mb-1 flex items-center justify-between">
                <span>Plot No. (ଡାଗ ନଂ) *</span>
                <span className="text-[9px] text-[#008C45] font-mono">
                  {Math.round((extractionResult.confidence_scores?.plot_number || 0.95) * 100)}%
                </span>
              </label>
              <input
                type="text"
                value={editableFields.plot_number || ''}
                onChange={(e) => handleFieldChange('plot_number', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-emerald-50/50 border border-emerald-300 focus:border-[#008C45] rounded-lg text-xs font-bold text-[#172B22] font-mono"
                placeholder="e.g. 640/2536"
              />
            </div>

            {/* Recorded Area */}
            <div>
              <label className="block text-[10px] font-bold text-[#172B22] mb-1 flex items-center justify-between">
                <span>Recorded Area (Acres) *</span>
                {editableFields.area_hectares && (
                  <span className="text-[9px] text-[#64746A]">
                    {editableFields.area_hectares} Ha
                  </span>
                )}
              </label>
              <input
                type="number"
                step="0.0001"
                value={editableFields.area_acres ?? ''}
                onChange={(e) => handleFieldChange('area_acres', parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-emerald-50/50 border border-emerald-300 focus:border-[#008C45] rounded-lg text-xs font-bold text-[#008C45] font-mono"
                placeholder="e.g. 0.0440"
              />
            </div>

            {/* Kisam / Land Classification */}
            <div>
              <label className="block text-[10px] font-medium text-[#64746A] mb-1">
                Kisam (କିସମ)
              </label>
              <input
                type="text"
                value={editableFields.land_classification || ''}
                onChange={(e) => handleFieldChange('land_classification', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#F7F9F8] border border-[#E2E9E4] focus:border-[#008C45] rounded-lg text-xs font-medium text-[#172B22]"
                placeholder="e.g. Gharabari"
              />
            </div>

            {/* Thana */}
            <div>
              <label className="block text-[10px] font-medium text-[#64746A] mb-1">
                Thana (ଥାନା)
              </label>
              <input
                type="text"
                value={editableFields.thana || ''}
                onChange={(e) => handleFieldChange('thana', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#F7F9F8] border border-[#E2E9E4] focus:border-[#008C45] rounded-lg text-xs font-medium text-[#172B22]"
                placeholder="e.g. Madhupatna"
              />
            </div>

            {/* Tenant / Raiyat */}
            <div>
              <label className="block text-[10px] font-medium text-[#64746A] mb-1">
                Tenant / Raiyat (ରୟତ)
              </label>
              <input
                type="text"
                value={editableFields.landowner_name || ''}
                onChange={(e) => handleFieldChange('landowner_name', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#F7F9F8] border border-[#E2E9E4] focus:border-[#008C45] rounded-lg text-xs font-medium text-[#172B22]"
                placeholder="e.g. Dilip Kumar Sahoo"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2E9E4]">
            {appliedSuccess ? (
              <span className="text-xs text-[#008C45] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Land details auto-filled into registration form!
              </span>
            ) : (
              <span className="text-[11px] text-[#64746A]">
                Click below to transfer verified values directly into registration fields.
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleApplyToRegistration(false)}
                className="px-3 py-1.5 bg-white border border-[#008C45] hover:bg-[#E6F4EA] text-[#008C45] rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              >
                Apply to Form
              </button>
              <button
                type="button"
                onClick={() => handleApplyToRegistration(true)}
                className="px-3.5 py-1.5 bg-[#008C45] hover:bg-[#006B36] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Fill & Locate Parcel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreviewModal && filePreviewUrl && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-4 py-3 border-b border-[#E2E9E4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#008C45]" />
                <h4 className="text-xs font-bold text-[#172B22] truncate">{file?.name}</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-50 flex items-center justify-center">
              <img
                src={filePreviewUrl}
                alt="Patta Document Preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg border border-[#E2E9E4] shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
