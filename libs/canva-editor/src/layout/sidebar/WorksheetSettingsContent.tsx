'use client';

import { FC, useRef, useState } from 'react';
import { useEditor } from 'canva-editor/hooks';
import { useWorksheetContent, WorksheetLineStyle } from '../../contexts/WorksheetContentContext';
import CloseButton from './CloseButton';

const LINE_INDEXES = [1, 2, 3, 4];
const LINE_GROUP_INDEXES = Array.from({ length: 9 }, (_, i) => i + 1);

interface Props {
  onClose: () => void;
}

const WorksheetSettingsContent: FC<Props> = ({ onClose }) => {
  const { activePage } = useEditor(state => ({ activePage: state.activePage }));
  const { getPageData, updateWorksheetData, lastActiveInputRef } = useWorksheetContent();
  const data = getPageData(activePage);
  const savedRangeRef = useRef<Range | null>(null);

  const [selectedLineKey, setSelectedLineKey] = useState('line1');
  const [selectedInputKey, setSelectedInputKey] = useState('lineInput1');

  const updateLineStyle = (partial: Partial<WorksheetLineStyle>) => {
    updateWorksheetData(activePage, prev => ({
      ...prev,
      lineStyles: {
        ...prev.lineStyles,
        [selectedLineKey]: { ...prev.lineStyles[selectedLineKey], ...partial },
      },
    }));
  };

  const updateXScale = (value: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(value) ? 100 : value));
    updateWorksheetData(activePage, prev => ({
      ...prev,
      lineInputXScales: { ...prev.lineInputXScales, [selectedInputKey]: clamped },
    }));
  };

  const currentLine = data.lineStyles[selectedLineKey] ?? { color: '#000000', style: 'solid' };
  const currentScale = data.lineInputXScales[selectedInputKey] ?? 100;

  const execStyle = (command: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, undefined);
    lastActiveInputRef.current?.focus();
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const applyColor = (color: string) => {
    const el = lastActiveInputRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (savedRangeRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('foreColor', false, color);
  };

  const sectionTitle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: 13,
    marginBottom: 8,
    marginTop: 16,
    color: '#374151',
  };

  const label: React.CSSProperties = {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  };

  const select: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #D1D5DB',
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 8,
    background: '#fff',
  };

  return (
    <div css={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <CloseButton onClose={onClose} />

      {/* Header */}
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #F3F4F6',
        }}
      >
        <span css={{ fontWeight: 700, fontSize: 15 }}>ワークシート設定</span>
      </div>

      <div css={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
        {/* 文字のスタイル */}
        <div style={sectionTitle}>文字のスタイル</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={label}>色</div>
            <input
              type="color"
              defaultValue="#000000"
              onMouseDown={saveSelection}
              onChange={e => applyColor(e.target.value)}
              css={{
                width: 44,
                height: 36,
                border: '1px solid #D1D5DB',
                borderRadius: 6,
                padding: 2,
                cursor: 'pointer',
              }}
            />
          </div>

          {(
            [
              { label: 'B', cmd: 'bold',      css_: { fontWeight: 700 } },
              { label: 'I', cmd: 'italic',    css_: { fontStyle: 'italic' } },
              { label: 'U', cmd: 'underline', css_: { textDecoration: 'underline' } },
            ] as const
          ).map(({ label: lbl, cmd, css_ }) => (
            <button
              key={cmd}
              onMouseDown={execStyle(cmd)}
              css={{
                width: 36,
                height: 36,
                border: '1px solid #D1D5DB',
                borderRadius: 6,
                background: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'flex-end',
                ':hover': { background: '#F3F4F6' },
                ':active': { background: '#E5E7EB' },
                ...css_,
              }}
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* 罫線のスタイル */}
        <div style={sectionTitle}>罫線のスタイル</div>

        <div style={label}>変更する罫線</div>
        <select
          style={select}
          value={selectedLineKey}
          onChange={e => setSelectedLineKey(e.target.value)}
        >
          {LINE_INDEXES.map(i => (
            <option key={i} value={`line${i}`}>第 {i} 罫線</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={label}>線種</div>
            <select
              style={{ ...select, marginBottom: 0 }}
              value={currentLine.style}
              onChange={e => updateLineStyle({ style: e.target.value as WorksheetLineStyle['style'] })}
            >
              <option value="solid">直線</option>
              <option value="dashed">ダッシュ</option>
              <option value="dotted">点線</option>
            </select>
          </div>
          <div>
            <div style={label}>色</div>
            <input
              type="color"
              value={currentLine.color}
              onChange={e => updateLineStyle({ color: e.target.value })}
              css={{ width: 44, height: 36, border: '1px solid #D1D5DB', borderRadius: 6, padding: 2, cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* 罫線の幅 */}
        <div style={sectionTitle}>罫線の幅</div>

        <div style={label}>変更する行</div>
        <select
          style={select}
          value={selectedInputKey}
          onChange={e => setSelectedInputKey(e.target.value)}
        >
          {LINE_GROUP_INDEXES.map(i => (
            <option key={i} value={`lineInput${i}`}>{i} 行目</option>
          ))}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={currentScale}
            onChange={e => updateXScale(Number(e.target.value))}
            css={{ flex: 1 }}
          />
          <span css={{ fontSize: 13, minWidth: 36, textAlign: 'right' }}>{currentScale}%</span>
        </div>
        <input
          type="number"
          min={0}
          max={100}
          value={currentScale}
          onChange={e => updateXScale(Number(e.target.value))}
          css={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid #D1D5DB',
            borderRadius: 6,
            fontSize: 13,
          }}
        />
      </div>
    </div>
  );
};

export default WorksheetSettingsContent;
