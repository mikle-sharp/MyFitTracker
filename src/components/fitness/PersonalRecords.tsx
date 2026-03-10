'use client';

import { useMemo } from 'react';
import { Trophy, Calendar } from 'lucide-react';
import { calculatePersonalRecords, formatPersonalRecord } from '@/lib/pr';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WORKOUT_TYPE_COLORS, WORKOUT_TYPE_ICONS } from '@/lib/types';
import { cn } from '@/lib/utils';

export function PersonalRecords() {
  const records = useMemo(() => calculatePersonalRecords(), []);

  if (records.length === 0) {
    return (
      <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 text-center">
        <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-zinc-400 mb-1">Нет рекордов</h3>
        <p className="text-sm text-zinc-500">
          Начните тренироваться, чтобы установить первые рекорды!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Личные рекорды</h3>
        </div>
      </div>

      <ScrollArea className="max-h-[400px]">
        <div className="p-2">
          {records.map((record, index) => {
            const colors = WORKOUT_TYPE_COLORS[record.workoutType];
            const icon = WORKOUT_TYPE_ICONS[record.workoutType];
            return (
              <motion.div
                key={record.exerciseName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-colors border-l-2",
                  colors.bg,
                  colors.border,
                  "hover:bg-zinc-800/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors.bg)}>
                    <span className="text-base">{icon}</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">{record.exerciseName}</div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Calendar className="w-3 h-3" />
                      {format(parseISO(record.date), 'd MMM yyyy', { locale: ru })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-amber-400">
                    {formatPersonalRecord(record)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
