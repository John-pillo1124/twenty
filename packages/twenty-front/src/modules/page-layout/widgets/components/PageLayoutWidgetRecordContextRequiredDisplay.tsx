import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { AppTooltip, Status } from 'twenty-ui/display';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

export const PageLayoutWidgetRecordContextRequiredDisplay = () => {
  const widget = useCurrentWidget();
  const tooltipId = `widget-record-context-required-tooltip-${widget.id}`;

  const text = t`Record Required`;
  const tooltipContent = t`This widget requires a record context and cannot be displayed on this page.`;

  return (
    <StyledContainer>
      <div id={tooltipId}>
        <Status color="gray" text={text} />
      </div>
      <AppTooltip
        anchorSelect={`#${tooltipId}`}
        content={tooltipContent}
        place="top"
      />
    </StyledContainer>
  );
};
