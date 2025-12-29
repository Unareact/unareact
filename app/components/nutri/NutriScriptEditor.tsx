'use client';

import { useState } from 'react';
import { ScriptSegment } from '@/app/types';
import { Edit2, Trash2, Plus, Save, Check } from 'lucide-react';

interface NutriScriptEditorProps {
  segments: ScriptSegment[];
  onUpdate: (segments: ScriptSegment[]) => void;
  onApprove: () => void;
  onBack: () => void;
}

export function NutriScriptEditor({ segments, onUpdate, onApprove, onBack }: NutriScriptEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [localSegments, setLocalSegments] = useState<ScriptSegment[]>(segments);

  const handleEdit = (segment: ScriptSegment) => {
    setEditingId(segment.id);
    setEditText(segment.text);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    
    const updated = localSegments.map(seg =>
      seg.id === editingId ? { ...seg, text: editText } : seg
    );
    setLocalSegments(updated);
    onUpdate(updated);
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = (id: string) => {
    const updated = localSegments.filter(seg => seg.id !== id);
    // Recalcular timestamps
    let currentTime = 0;
    const recalculated = updated.map(seg => {
      const newSeg = { ...seg, timestamp: currentTime };
      currentTime += seg.duration;
      return newSeg;
    });
    setLocalSegments(recalculated);
    onUpdate(recalculated);
  };

  const handleAdd = () => {
    const newSegment: ScriptSegment = {
      id: `new-${Date.now()}`,
      text: 'Novo segmento - edite o texto',
      duration: 5,
      timestamp: localSegments.length > 0 
        ? localSegments[localSegments.length - 1].timestamp + localSegments[localSegments.length - 1].duration
        : 0,
      type: 'content'
    };
    const updated = [...localSegments, newSegment];
    setLocalSegments(updated);
    onUpdate(updated);
    setEditingId(newSegment.id);
    setEditText(newSegment.text);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Edite seu Roteiro
        </h3>
        <p className="text-gray-600">
          Revise e edite cada segmento. Quando estiver satisfeito, aprove o roteiro para continuar.
        </p>
      </div>

      <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
        {localSegments.map((segment, index) => (
          <div
            key={segment.id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-blue-600 uppercase">
                      {segment.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(segment.timestamp)} - {formatTime(segment.timestamp + segment.duration)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({segment.duration}s)
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(segment)}
                  className="p-2 rounded hover:bg-gray-200 text-gray-600"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(segment.id)}
                  className="p-2 rounded hover:bg-red-100 text-red-600"
                  title="Deletar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {editingId === segment.id ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditText('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 text-sm leading-relaxed">
                {segment.text}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
        >
          <Plus className="w-4 h-4" />
          Adicionar Segmento
        </button>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Voltar
          </button>
          <button
            onClick={onApprove}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Aprovar e Ir para Edição
          </button>
        </div>
      </div>
    </div>
  );
}

