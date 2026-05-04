import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { RecordContextRequiredError } from '@/ui/layout/contexts/RecordContextRequiredError';

export const useTargetRecord = () => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  if (!targetRecordIdentifier) {
    throw new RecordContextRequiredError(
      'useTargetRecord must be used within a record page context (targetRecordIdentifier is required)',
    );
  }

  return targetRecordIdentifier;
};
