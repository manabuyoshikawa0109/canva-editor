'use client';

import { FC, useRef, useState } from 'react';
import { useEditor } from 'canva-editor/hooks';
import {
  useWorksheetContent,
  TemplateType,
  WorksheetLineStyle,
} from '../../contexts/WorksheetContentContext';
import CloseButton from './CloseButton';
import type { RootLayerProps } from '../../layers/RootLayer';

// ─── Subject / material definitions ────────────────────────────────────────

type Material = { id: TemplateType; name: string };
type Subject = { id: string; name: string; emoji: string; available: boolean; materials: Material[] };

const SUBJECTS: Subject[] = [
  {
    id: 'english',
    name: '英語',
    emoji: '🔤',
    available: true,
    materials: [{ id: 'english-worksheet', name: '英語ワークシート' }],
  },
  { id: 'japanese', name: '国語', emoji: '📖', available: false, materials: [] },
  { id: 'math',     name: '算数', emoji: '➕', available: false, materials: [] },
];

// ─── Worksheet controls ─────────────────────────────────────────────────────

const LINE_INDEXES = [1, 2, 3, 4];
const LINE_GROUP_INDEXES = Array.from({ length: 9 }, (_, i) => i + 1);

const WorksheetControls: FC<{ pageIndex: number }> = ({ pageIndex }) => {
  const { getPageData, updateWorksheetData, lastActiveInputRef } = useWorksheetContent();
  const data = getPageData(pageIndex);
  const savedRangeRef = useRef<Range | null>(null);

  const [selectedLineKey, setSelectedLineKey] = useState('line1');
  const [selectedInputKey, setSelectedInputKey] = useState('lineInput1');

  const updateLineStyle = (partial: Partial<WorksheetLineStyle>) => {
    updateWorksheetData(pageIndex, prev => ({
      ...prev,
      lineStyles: {
        ...prev.lineStyles,
        [selectedLineKey]: { ...prev.lineStyles[selectedLineKey], ...partial },
      },
    }));
  };

  const updateXScale = (value: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(value) ? 100 : value));
    updateWorksheetData(pageIndex, prev => ({
      ...prev,
      lineInputXScales: { ...prev.lineInputXScales, [selectedInputKey]: clamped },
    }));
  };

  const currentLine = data.lineStyles[selectedLineKey] ?? { color: '#000000', style: 'solid' };
  const currentScale = data.lineInputXScales[selectedInputKey] ?? 100;

  // テキストスタイル適用 (B/I/U: mousedown で focus を奪わず execCommand)
  const execStyle = (command: string, value?: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, value);
    lastActiveInputRef.current?.focus();
  };

  // color input 用: focus を失う前に selection を保存
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
    <div css={{ padding: '0 16px 16px' }}>

      {/* ── 文字のスタイル ──────────────────────────── */}
      <div style={sectionTitle}>文字のスタイル</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        {/* 色 */}
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

        {/* B / I / U ボタン */}
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

      {/* ── 罫線のスタイル ──────────────────────────── */}
      {/* Line style section */}
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

      {/* Line width section */}
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
  );
};

// ─── Main MaterialContent component ─────────────────────────────────────────

interface Props {
  onClose: () => void;
}

const MaterialContent: FC<Props> = ({ onClose }) => {
  const { activePage, actions } = useEditor(state => ({ activePage: state.activePage }));
  const { pageTemplates, setPageTemplate } = useWorksheetContent();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const currentTemplate = pageTemplates[activePage] ?? 'none';

  const selectedSubject = SUBJECTS.find(s => s.id === selectedSubjectId) ?? null;

  // A4 portrait at 96dpi
  const A4_PORTRAIT = { width: 794, height: 1123 };
  // Default canvas size (landscape)
  const DEFAULT_SIZE = { width: 1640, height: 924 };

  const handleSelectMaterial = (materialId: TemplateType) => {
    setPageTemplate(activePage, materialId);
    actions.setProp<RootLayerProps>(activePage, 'ROOT', { color: 'transparent' });
    if (materialId === 'english-worksheet') {
      actions.changePageSize(A4_PORTRAIT);
    }
  };

  const handleClearTemplate = () => {
    setPageTemplate(activePage, 'none');
    actions.setProp<RootLayerProps>(activePage, 'ROOT', { color: '#ffffff' });
    actions.changePageSize(DEFAULT_SIZE);
  };

  const templateLabel: Record<TemplateType, string> = {
    'none': 'なし',
    'english-worksheet': '英語ワークシート',
  };

  return (
    <div css={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
        <span css={{ fontWeight: 700, fontSize: 15 }}>教材</span>
        <CloseButton onClose={onClose} />
      </div>

      {/* Current page status */}
      <div
        css={{
          padding: '10px 16px',
          background: '#F9FAFB',
          borderBottom: '1px solid #F3F4F6',
          fontSize: 12,
          color: '#6B7280',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>このページ: <strong css={{ color: '#111' }}>{templateLabel[currentTemplate]}</strong></span>
        {currentTemplate !== 'none' && (
          <button
            onClick={handleClearTemplate}
            css={{
              fontSize: 11,
              color: '#EF4444',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '2px 4px',
              ':hover': { textDecoration: 'underline' },
            }}
          >
            解除
          </button>
        )}
      </div>

      <div css={{ flex: 1, overflowY: 'auto' }}>
        {/* Subject list */}
        {!selectedSubjectId ? (
          <div css={{ padding: 16 }}>
            <div css={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>教科を選択</div>
            <div css={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SUBJECTS.map(subject => (
                <button
                  key={subject.id}
                  disabled={!subject.available}
                  onClick={() => subject.available && setSelectedSubjectId(subject.id)}
                  css={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 10,
                    background: subject.available ? '#fff' : '#F9FAFB',
                    cursor: subject.available ? 'pointer' : 'not-allowed',
                    opacity: subject.available ? 1 : 0.5,
                    textAlign: 'left',
                    transition: 'border-color 0.15s',
                    ':hover': subject.available ? { borderColor: '#6366F1' } : {},
                  }}
                >
                  <span css={{ fontSize: 24 }}>{subject.emoji}</span>
                  <div>
                    <div css={{ fontWeight: 600, fontSize: 14 }}>{subject.name}</div>
                    {!subject.available && (
                      <div css={{ fontSize: 11, color: '#9CA3AF' }}>準備中</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Material list for selected subject */
          <div>
            <button
              onClick={() => setSelectedSubjectId(null)}
              css={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                fontSize: 13,
                color: '#6366F1',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid #F3F4F6',
                width: '100%',
                ':hover': { background: '#F9FAFB' },
              }}
            >
              ← 教科一覧に戻る
            </button>

            <div css={{ padding: 16 }}>
              <div css={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
                {selectedSubject?.emoji} {selectedSubject?.name} の教材
              </div>
              <div css={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedSubject?.materials.map(material => (
                  <button
                    key={material.id}
                    onClick={() => handleSelectMaterial(material.id)}
                    css={{
                      padding: '12px 14px',
                      border: `2px solid ${currentTemplate === material.id ? '#6366F1' : '#E5E7EB'}`,
                      borderRadius: 10,
                      background: currentTemplate === material.id ? '#EEF2FF' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: 14,
                      color: currentTemplate === material.id ? '#6366F1' : '#111',
                      transition: 'all 0.15s',
                      ':hover': { borderColor: '#6366F1' },
                    }}
                  >
                    {material.name}
                    {currentTemplate === material.id && (
                      <span css={{ marginLeft: 8, fontSize: 12, fontWeight: 400 }}>✓ 適用中</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Worksheet controls (shown when a worksheet template is active) */}
        {currentTemplate === 'english-worksheet' && (
          <div css={{ borderTop: '1px solid #F3F4F6', marginTop: 8 }}>
            <div
              css={{
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 700,
                color: '#374151',
                background: '#F9FAFB',
              }}
            >
              ワークシート設定
            </div>
            <WorksheetControls pageIndex={activePage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialContent;
