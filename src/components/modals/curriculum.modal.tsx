import { useCallback, useRef, useState } from 'react';
import {
  Download,
  FileText,
  ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Subject } from '@/api/services/subjects.services';
import CurriculumServices, {
  type CurriculumItem,
} from '@/api/services/curriculum.services';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useManagedUser } from '@/contexts/managed-user-context';
import useCurriculumItems from '@/hooks/use-curriculum-items';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import useUploadCurriculumItem from '@/hooks/use-upload-curriculum-item';
import { validateFileSize, validateMimeType } from '@/lib/mime-type-label';

type CurriculumModalProps = {
  subject: Subject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <ImageIcon className="size-5 text-muted-foreground" />;
  return <FileText className="size-5 text-muted-foreground" />;
}

const CurriculumModal = ({
  subject,
  open,
  onOpenChange,
}: CurriculumModalProps) => {
  const { data: profileData } = useLoggedInUser();
  const { activeManagedUser } = useManagedUser();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const managedUserId = activeManagedUser?.managedUserId ?? null;
  const householdId = profileData?.data?._id ?? '';

  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const queryKey = ['curriculum', subject._id, managedUserId ?? householdId];

  const { data, isLoading } = useCurriculumItems({
    subjectId: subject._id,
    managedUserId,
    householdId,
  });

  const uploadMutation = useUploadCurriculumItem({
    subjectId: subject._id,
    managedUserId,
    householdId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => CurriculumServices.deleteCurriculumItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const validateAndStage = useCallback((file: File) => {
    setValidationError(null);

    if (!validateMimeType(file.type)) {
      setValidationError(
        'Unsupported file type. Please upload PNG, JPG, PDF, or DOCX.',
      );
      return;
    }

    if (!validateFileSize(file.size)) {
      setValidationError('File exceeds the 50 MB size limit.');
      return;
    }

    setPendingFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) validateAndStage(file);
    },
    [validateAndStage],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndStage(file);
      // Reset so same file can be re-selected
      e.target.value = '';
    },
    [validateAndStage],
  );

  const handleUpload = useCallback(() => {
    if (!pendingFile) return;
    uploadMutation.mutate(pendingFile, {
      onSuccess: () => setPendingFile(null),
    });
  }, [pendingFile, uploadMutation]);

  const handleDownload = (item: CurriculumItem) => {
    const baseUrl = import.meta.env.VITE_API_URL;
    window.open(`${baseUrl}/curriculum/download/${item._id}`, '_blank');
  };

  const items = data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-h-[80vh] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{subject.name} — View Files</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
          {/* Drag-and-drop upload area */}
          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            data-testid="drop-zone"
          >
            <Upload className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Drag & drop a file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, PDF, DOCX — Max 50 MB
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
            data-testid="curriculum-file-input"
          />

          {/* Validation error */}
          {validationError && (
            <p className="text-sm text-destructive" data-testid="curriculum-upload-error">
              {validationError}
            </p>
          )}

          {/* Pending file + upload progress */}
          {pendingFile && (
            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
              {fileIcon(pendingFile.type)}
              <span className="flex-1 truncate text-sm">{pendingFile.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatFileSize(pendingFile.size)}
              </span>
              {uploadMutation.isPending && (
                <Loader2 className="size-4 animate-spin text-primary" data-testid="upload-progress" />
              )}
            </div>
          )}

          {/* Recently Uploaded */}
          {items.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recently Uploaded</h4>
              <ul className="space-y-1" data-testid="recently-uploaded-list">
                {items.map((item) => (
                  <li
                    key={item._id}
                    className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted/50"
                  >
                    {fileIcon(item.mimeType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.fileName}</p>
                      {/* ponytail: file size not stored in entity, showing timestamp only */}
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDownload(item)}
                      aria-label={`Download ${item.fileName}`}
                    >
                      <Download className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteMutation.mutate(item._id)}
                      disabled={deleteMutation.isPending}
                      aria-label={`Delete ${item.fileName}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isLoading && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Loading files…
            </p>
          )}

          {!isLoading && items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No files uploaded yet.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!pendingFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading…
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CurriculumModal;
