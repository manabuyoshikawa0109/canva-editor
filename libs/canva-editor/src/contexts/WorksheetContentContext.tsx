'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export type TemplateType = 'none' | 'english-worksheet';

export type WorksheetLineStyle = {
  color: string;
  style: 'solid' | 'dotted' | 'dashed';
};

export type WorksheetPageData = {
  lineStyles: Record<string, WorksheetLineStyle>;
  lineInputXScales: Record<string, number>;
  contentEditableValues: Record<string, string>;
};

const DEFAULT_LINE_STYLES: Record<string, WorksheetLineStyle> = {
  line1: { color: '#000000', style: 'solid' },
  line2: { color: '#000000', style: 'dashed' },
  line3: { color: '#33CCFF', style: 'solid' },
  line4: { color: '#000000', style: 'solid' },
};

const DEFAULT_LINE_INPUT_X_SCALES: Record<string, number> = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => [`lineInput${i + 1}`, 100])
);

const DEFAULT_CONTENT_EDITABLE_VALUES: Record<string, string> = {
  worksheetTitle: '',
  studentGrade: '',
  studentClass: '',
  studentNo: '',
  nameDate: '',
  ...Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`lineInput${i + 1}`, ''])),
};

export const createDefaultWorksheetData = (): WorksheetPageData => ({
  lineStyles: { ...DEFAULT_LINE_STYLES },
  lineInputXScales: { ...DEFAULT_LINE_INPUT_X_SCALES },
  contentEditableValues: { ...DEFAULT_CONTENT_EDITABLE_VALUES },
});

type WorksheetContextType = {
  pageTemplates: Record<number, TemplateType>;
  worksheetData: Record<number, WorksheetPageData>;
  setPageTemplate: (pageIndex: number, type: TemplateType) => void;
  updateWorksheetData: (pageIndex: number, updater: (prev: WorksheetPageData) => WorksheetPageData) => void;
  getPageData: (pageIndex: number) => WorksheetPageData;
  serialize: () => { pageTemplates: Record<number, TemplateType>; worksheetData: Record<number, WorksheetPageData> };
  lastActiveInputRef: { current: HTMLDivElement | null };
};

const WorksheetContentContext = createContext<WorksheetContextType | null>(null);

export const WorksheetContentProvider = ({ children }: { children: ReactNode }) => {
  const [pageTemplates, setPageTemplates] = useState<Record<number, TemplateType>>({});
  const [worksheetData, setWorksheetData] = useState<Record<number, WorksheetPageData>>({});
  const lastActiveInputRef = useRef<HTMLDivElement | null>(null);

  const setPageTemplate = useCallback((pageIndex: number, type: TemplateType) => {
    setPageTemplates(prev => ({ ...prev, [pageIndex]: type }));
    setWorksheetData(prev => {
      if (type === 'english-worksheet' && !prev[pageIndex]) {
        return { ...prev, [pageIndex]: createDefaultWorksheetData() };
      }
      return prev;
    });
  }, []);

  const updateWorksheetData = useCallback(
    (pageIndex: number, updater: (prev: WorksheetPageData) => WorksheetPageData) => {
      setWorksheetData(prev => ({
        ...prev,
        [pageIndex]: updater(prev[pageIndex] ?? createDefaultWorksheetData()),
      }));
    },
    []
  );

  const getPageData = useCallback(
    (pageIndex: number): WorksheetPageData =>
      worksheetData[pageIndex] ?? createDefaultWorksheetData(),
    [worksheetData]
  );

  const serialize = useCallback(
    () => ({ pageTemplates, worksheetData }),
    [pageTemplates, worksheetData]
  );

  return (
    <WorksheetContentContext.Provider
      value={{ pageTemplates, worksheetData, setPageTemplate, updateWorksheetData, getPageData, serialize, lastActiveInputRef }}
    >
      {children}
    </WorksheetContentContext.Provider>
  );
};

export const useWorksheetContent = (): WorksheetContextType => {
  const ctx = useContext(WorksheetContentContext);
  if (!ctx) throw new Error('useWorksheetContent must be used within WorksheetContentProvider');
  return ctx;
};
