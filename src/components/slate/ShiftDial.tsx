import React from 'react';
import { Shift } from '../../types';
import { Sun, Sunset, Moon, Bed, FastForward, AlertTriangle } from 'lucide-react';
import { SlateButton } from './SlateButton';

interface ShiftDialProps {
  currentShift: Shift;
  day: number;
  isFatigued: boolean;
  onAdvanceShift: () => void;
  onRestAtBar: () => void;
  isInterrupt?: boolean;
}

export const ShiftDial: React.FC<ShiftDialProps> = ({
  currentShift,
  day,
  isFatigued,
  onAdvanceShift,
  onRestAtBar,
  isInterrupt = false,
}) => {
  const isNight = currentShift === 'NIGHT';

  const getShiftIcon = () => {
    switch (currentShift) {
      case 'DAWN':
        return <Sun className="w-4 h-4 text-hazard" />;
      case 'DUSK':
        return <Sunset className="w-4 h-4 text-amber-500" />;
      case 'NIGHT':
        return <Moon className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="p-3.5 rounded-lg border border-noir-border bg-noir-ink/80 flex flex-wrap items-center justify-between gap-3 font-mono text-xs shadow-inner">
      {/* Shift Segment Telemetry */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-noir-surface border border-noir-border">
          {getShiftIcon()}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wider text-noir-chalk">
              DAY {day} // {currentShift} SHIFT
            </span>
            {isFatigued && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-crisis/20 border border-crisis text-crisis flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                FATIGUED (-1)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            {/* 3 Shift Segment Bars */}
            <div className="flex gap-1 w-24">
              <div className={`h-1.5 flex-1 rounded-sm ${currentShift === 'DAWN' || currentShift === 'DUSK' || currentShift === 'NIGHT' ? 'bg-hazard' : 'bg-zinc-800'}`} />
              <div className={`h-1.5 flex-1 rounded-sm ${currentShift === 'DUSK' || currentShift === 'NIGHT' ? 'bg-hazard' : 'bg-zinc-800'}`} />
              <div className={`h-1.5 flex-1 rounded-sm ${currentShift === 'NIGHT' ? 'bg-hazard' : 'bg-zinc-800'}`} />
            </div>

            <span className="text-[10px] text-zinc-400">
              {currentShift === 'DAWN' ? '1/3 SHIFT' : currentShift === 'DUSK' ? '2/3 SHIFT' : '3/3 SHIFT'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      {!isInterrupt && (
        <div className="flex items-center gap-2">
          {isNight ? (
            <>
              <SlateButton
                variant="hazard"
                onClick={onRestAtBar}
                className="text-[11px] flex items-center gap-1.5"
                title="Return to the 1860s Bar to clear fatigue and heal Agent 0"
              >
                <Bed className="w-3.5 h-3.5" />
                REST AT BAR (CLEAR FATIGUE)
              </SlateButton>

              <SlateButton
                variant="neutral"
                onClick={onAdvanceShift}
                className="text-[11px] flex items-center gap-1.5 hover:border-crisis hover:text-crisis"
                title="Push into the field at night: Inflicts [FATIGUED] -1 Forward"
              >
                <FastForward className="w-3.5 h-3.5" />
                PUSH FIELD (-1 FATIGUE)
              </SlateButton>
            </>
          ) : (
            <SlateButton
              variant="neutral"
              onClick={onAdvanceShift}
              className="text-[11px] flex items-center gap-1.5"
            >
              <FastForward className="w-3.5 h-3.5" />
              ADVANCE SHIFT
            </SlateButton>
          )}
        </div>
      )}
    </div>
  );
};
