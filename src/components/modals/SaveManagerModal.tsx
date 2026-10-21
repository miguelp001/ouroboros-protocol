import React, { useState, useEffect } from 'react';
import { 
  HardDrive, 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Clock, 
  Copy 
} from 'lucide-react';
import { persistenceEngine, SaveSlotId, SaveMetadata } from '../../engine/persistenceEngine';
import { useGameStore } from '../../engine/store';
import { soundFx } from '../../audio/soundFx';

interface SaveManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaveManagerModal: React.FC<SaveManagerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'slots' | 'export' | 'import' | 'reset'>('slots');
  const [slotsMetadata, setSlotsMetadata] = useState<Record<SaveSlotId, SaveMetadata | null>>(
    persistenceEngine.getAllSlotMetadata()
  );
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Export state
  const [exportSlot, setExportSlot] = useState<SaveSlotId>('slot_1');
  const [exportJson, setExportJson] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Import state
  const [importSlot, setImportSlot] = useState<SaveSlotId>('slot_1');
  const [importJson, setImportJson] = useState<string>('');

  const refreshMetadata = () => {
    setSlotsMetadata(persistenceEngine.getAllSlotMetadata());
  };

  useEffect(() => {
    if (isOpen) {
      refreshMetadata();
      setStatusMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'export') {
      const json = persistenceEngine.exportSaveToJson(exportSlot);
      setExportJson(json ?? '');
    }
  }, [activeTab, exportSlot]);

  if (!isOpen) return null;

  const handleSaveToSlot = (slotId: SaveSlotId) => {
    soundFx.playClick();
    const res = persistenceEngine.saveGame(slotId);
    if (res.success) {
      refreshMetadata();
      setStatusMessage({ type: 'success', text: `Game successfully saved to ${slotId.toUpperCase()}.` });
    } else {
      soundFx.playGlitch();
      setStatusMessage({ type: 'error', text: res.error ?? 'Failed to save game state.' });
    }
  };

  const handleLoadFromSlot = (slotId: SaveSlotId) => {
    soundFx.playBoot();
    const res = persistenceEngine.loadGame(slotId);
    if (res.success) {
      setStatusMessage({ type: 'success', text: `Loaded state from ${slotId.toUpperCase()}! Telemetry synced.` });
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      soundFx.playGlitch();
      setStatusMessage({ type: 'error', text: res.error ?? 'Failed to load game state.' });
    }
  };

  const handleDeleteSlot = (slotId: SaveSlotId) => {
    soundFx.playClick();
    persistenceEngine.deleteSave(slotId);
    refreshMetadata();
    setStatusMessage({ type: 'success', text: `Memory Bank ${slotId.toUpperCase()} wiped clean.` });
  };

  const handleCopyExport = () => {
    if (!exportJson) return;
    navigator.clipboard.writeText(exportJson);
    soundFx.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadExport = () => {
    if (!exportJson) return;
    soundFx.playClick();
    const blob = new Blob([exportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ouroboros_protocol_${exportSlot}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    if (!importJson.trim()) return;
    const res = persistenceEngine.importSaveFromJson(importJson, importSlot);
    if (res.success) {
      soundFx.playBoot();
      refreshMetadata();
      setStatusMessage({ type: 'success', text: `Valid save imported into ${importSlot.toUpperCase()}! You can now load it.` });
      setImportJson('');
    } else {
      soundFx.playGlitch();
      setStatusMessage({ type: 'error', text: res.error ?? 'Save validation failed.' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJson(content);
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    soundFx.playGlitch();
    persistenceEngine.wipeAllSaves();
    useGameStore.getState().resetGame();
    refreshMetadata();
    setStatusMessage({ type: 'success', text: 'Factory Reset complete. NVRAM wiped and Slate initialized to Day 1 Dawn.' });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const slotKeys: SaveSlotId[] = ['auto', 'slot_1', 'slot_2', 'slot_3'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-noir-ink/85 backdrop-blur-sm animate-fade-in font-mono select-none">
      <div 
        className="w-full max-w-2xl bg-noir-surface border-2 border-noir-border rounded-xl shadow-2xl p-5 md:p-6 relative overflow-hidden flex flex-col gap-4 text-noir-chalk"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-manager-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-noir-border pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-hazard animate-pulse" />
            <div>
              <h2 id="save-manager-title" className="text-sm font-bold text-hazard uppercase tracking-wider">
                OUROBOROS SLATE-4B // MEMORY CORE ARCHIVE
              </h2>
              <p className="text-[10px] text-zinc-500">
                Non-volatile local storage bus // Multi-slot state persistence
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1 rounded text-zinc-400 hover:text-hazard transition-colors"
            title="Close Save Manager"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <div className={`p-2.5 rounded text-xs flex items-center gap-2 border font-mono ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-300'
              : 'bg-crisis/20 border-crisis text-crisis'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-noir-border text-xs gap-1">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('slots');
            }}
            className={`px-3 py-2 border-b-2 font-bold transition-colors ${
              activeTab === 'slots'
                ? 'border-hazard text-hazard'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            MEMORY BANKS
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('export');
            }}
            className={`px-3 py-2 border-b-2 font-bold transition-colors ${
              activeTab === 'export'
                ? 'border-hazard text-hazard'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            JSON EXPORT
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('import');
            }}
            className={`px-3 py-2 border-b-2 font-bold transition-colors ${
              activeTab === 'import'
                ? 'border-hazard text-hazard'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            RESTORE / IMPORT
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('reset');
            }}
            className={`px-3 py-2 border-b-2 font-bold transition-colors ${
              activeTab === 'reset'
                ? 'border-crisis text-crisis'
                : 'border-transparent text-zinc-500 hover:text-crisis'
            }`}
          >
            FACTORY RESET
          </button>
        </div>

        {/* --- TAB 1: SLOTS MANAGEMENT --- */}
        {activeTab === 'slots' && (
          <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {slotKeys.map((slotId) => {
              const meta = slotsMetadata[slotId];
              const isAuto = slotId === 'auto';
              const displayName = isAuto ? 'AUTO-SAVE BANK' : `MEMORY BANK ${slotId.replace('slot_', '0')}`;

              return (
                <div 
                  key={slotId}
                  className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    meta 
                      ? 'bg-noir-ink/90 border-noir-border/80' 
                      : 'bg-zinc-950/40 border-zinc-800 border-dashed text-zinc-500'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        isAuto ? 'bg-hazard/20 text-hazard' : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {displayName}
                      </span>
                      {meta && (
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(meta.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      )}
                    </div>

                    {meta ? (
                      <div className="text-xs space-y-0.5">
                        <div className="text-noir-chalk font-semibold">
                          D{meta.day} {meta.shift} // LOC: <span className="text-hazard font-bold">{meta.location}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          AGENT HP: <span className="text-emerald-400 font-bold">{meta.agentHp}/{meta.maxHp}</span> | COMP: <span className="text-noir-chalk">{meta.companionName ?? 'SOLO'}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          KEYS: <span className="text-hazard font-bold">{meta.keysCount}</span> | CHIP: {meta.chipCred}C | DIGI: {meta.digitalCred}D
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs italic text-zinc-600">
                        [EMPTY MEMORY BANK // NO TELEMETRY RECORDED]
                      </div>
                    )}
                  </div>

                  {/* Slot Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isAuto && (
                      <button
                        onClick={() => handleSaveToSlot(slotId)}
                        className="px-2.5 py-1.5 rounded border border-hazard/50 bg-hazard/10 hover:bg-hazard hover:text-noir-ink text-hazard text-xs font-bold transition-colors flex items-center gap-1"
                        title={`Save active game state to ${displayName}`}
                      >
                        <Save className="w-3.5 h-3.5" />
                        SAVE
                      </button>
                    )}

                    {meta && (
                      <button
                        onClick={() => handleLoadFromSlot(slotId)}
                        className="px-2.5 py-1.5 rounded border border-emerald-500/50 bg-emerald-950/30 hover:bg-emerald-500 hover:text-noir-ink text-emerald-300 text-xs font-bold transition-colors flex items-center gap-1"
                        title={`Restore game state from ${displayName}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        LOAD
                      </button>
                    )}

                    {meta && !isAuto && (
                      <button
                        onClick={() => handleDeleteSlot(slotId)}
                        className="p-1.5 rounded border border-zinc-800 text-zinc-500 hover:border-crisis hover:text-crisis transition-colors"
                        title={`Wipe record in ${displayName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- TAB 2: JSON EXPORT --- */}
        {activeTab === 'export' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">SELECT BANK TO ENCODE:</span>
              <select
                value={exportSlot}
                onChange={(e) => setExportSlot(e.target.value as SaveSlotId)}
                className="bg-zinc-900 border border-zinc-700 text-hazard text-xs rounded px-2 py-1 font-mono focus:outline-none"
              >
                <option value="slot_1">Slot 1</option>
                <option value="slot_2">Slot 2</option>
                <option value="slot_3">Slot 3</option>
                <option value="auto">Auto-Save Bank</option>
              </select>
            </div>

            <textarea
              readOnly
              value={exportJson}
              rows={8}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-[11px] font-mono text-zinc-300 focus:outline-none select-all"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleCopyExport}
                className="px-3 py-1.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-hazard hover:text-hazard text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'COPIED TO CLIPBOARD' : 'COPY CIPHERTEXT'}
              </button>

              <button
                onClick={handleDownloadExport}
                className="px-3 py-1.5 rounded bg-hazard text-noir-ink hover:bg-yellow-400 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                DOWNLOAD .JSON
              </button>
            </div>
          </div>
        )}

        {/* --- TAB 3: JSON RESTORE / IMPORT --- */}
        {activeTab === 'import' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">TARGET MEMORY BANK:</span>
              <select
                value={importSlot}
                onChange={(e) => setImportSlot(e.target.value as SaveSlotId)}
                className="bg-zinc-900 border border-zinc-700 text-hazard text-xs rounded px-2 py-1 font-mono focus:outline-none"
              >
                <option value="slot_1">Slot 1</option>
                <option value="slot_2">Slot 2</option>
                <option value="slot_3">Slot 3</option>
              </select>
            </div>

            {/* File Upload Input */}
            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-hazard hover:text-hazard text-xs font-bold transition-colors flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                SELECT .JSON FILE
                <input 
                  type="file" 
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden" 
                />
              </label>
              <span className="text-[11px] text-zinc-500">or paste JSON raw ciphertext below:</span>
            </div>

            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste JSON save record ciphertext here..."
              rows={6}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-[11px] font-mono text-zinc-300 focus:outline-none focus:border-hazard"
            />

            <button
              onClick={handleImportJson}
              disabled={!importJson.trim()}
              className={`w-full py-2.5 rounded font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                importJson.trim()
                  ? 'bg-hazard text-noir-ink hover:bg-yellow-400 cursor-pointer'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              VERIFY ZOD SCHEMA & WRITE TO BANK
            </button>
          </div>
        )}

        {/* --- TAB 4: FACTORY RESET --- */}
        {activeTab === 'reset' && (
          <div className="p-4 rounded-lg border border-crisis/50 bg-crisis/10 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-crisis text-xs font-bold uppercase">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>IRREVERSIBLE HARD RESET WARNING</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Performing a Factory Reset will permanently erase all local storage memory banks (Auto-save, Slot 1, Slot 2, Slot 3), wipe the Epitaph Ledger, and reset Agent 0 back to Day 1 Dawn at Pontoon Junction (S-01).
            </p>
            <p className="text-[11px] text-zinc-500 italic">
              Make sure you have downloaded or copied a JSON backup from the Export tab if you wish to preserve your campaign progress.
            </p>
            <button
              onClick={handleFactoryReset}
              className="mt-2 py-2.5 rounded bg-crisis text-white font-bold text-xs tracking-wider uppercase hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              CONFIRM COMPLETE FACTORY WIPE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
