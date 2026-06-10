import { useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useUploadCurriculumItem from '@/hooks/use-upload-curriculum-item';
import { validateMimeType, validateFileSize } from '@/lib/mime-type-label';

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
].join(',');

type CurriculumFileUploaderProps = {
  subjectId: string;
  studentId: string | null;
  householdId: string;
};

/**
 * Pure helper that constructs the FormData payload for a curriculum upload.
 * Exported for direct testing without rendering.
 */
export function buildUploadFormData(params: {
  file: File;
  subjectId: string;
  studentId: string | null;
  householdId: string;
}): FormData {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('subjectId', params.subjectId);
  formData.append('householdId', params.householdId);
  if (params.studentId) {
    formData.append('studentId', params.studentId);
  }
  return formData;
}

function CurriculumFileUploader({
  subjectId,
  studentId,
  householdId,
}: CurriculumFileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputKey, setInputKey] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const { mutate, isPending, error: mutationError } = useUploadCurriculumItem({
    subjectId,
    studentId,
    householdId,
  });

  const resetInput = () => {
    setInputKey((k) => k + 1);
    setSelectedFileName(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);

    if (!validateMimeType(file.type)) {
      setValidationError(
        'Unsupported file type. Please upload a PDF, Word document, JPEG, or PNG.',
      );
      resetInput();
      return;
    }

    if (!validateFileSize(file.size)) {
      setValidationError('File is too large. Maximum allowed size is 50 MB.');
      resetInput();
      return;
    }

    setSelectedFileName(file.name);

    mutate(file, {
      onSuccess: () => {
        resetInput();
      },
      onError: () => {
        resetInput();
      },
    });
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const displayError = validationError ?? (mutationError ? mutationError.message : null);

  return (
    <div className="flex flex-col gap-2 pt-2 border-t">
      <input
        key={inputKey}
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME_TYPES}
        className="hidden"
        onChange={handleFileChange}
        data-testid="curriculum-file-input"
      />
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={handleButtonClick}
        data-testid="curriculum-upload-button"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Upload className="mr-2 size-4" />
            Upload File
          </>
        )}
      </Button>
      {selectedFileName && !displayError && (
        <p
          className="text-sm text-muted-foreground truncate"
          data-testid="curriculum-selected-file-name"
        >
          {selectedFileName}
        </p>
      )}
      {displayError && (
        <p
          className="text-sm text-destructive"
          data-testid="curriculum-upload-error"
        >
          {displayError}
        </p>
      )}
    </div>
  );
}

export default CurriculumFileUploader;
