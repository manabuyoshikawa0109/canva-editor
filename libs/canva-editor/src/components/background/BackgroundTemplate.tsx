'use client';

import { FC } from 'react';
import { useWorksheetContent } from '../../contexts/WorksheetContentContext';
import WorksheetBackground from './WorksheetBackground';

interface Props {
  pageIndex: number;
  width: number;
  height: number;
}

const BackgroundTemplate: FC<Props> = ({ pageIndex, width, height }) => {
  const { pageTemplates } = useWorksheetContent();
  const templateType = pageTemplates[pageIndex] ?? 'none';

  if (templateType === 'english-worksheet') {
    return <WorksheetBackground pageIndex={pageIndex} width={width} height={height} />;
  }

  return null;
};

export default BackgroundTemplate;
