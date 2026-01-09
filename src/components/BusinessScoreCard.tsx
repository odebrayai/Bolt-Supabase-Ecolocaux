import { Star, MessageCircle, CheckCircle } from 'lucide-react';
import type { Business } from '../utils/scoring';
import { calculateBusinessScore, getScorePriorityDark, getScoreBreakdown } from '../utils/scoring';

interface BusinessScoreBadgeProps {
  business: Business;
  compact?: boolean;
}

export function BusinessScoreBadge({ business, compact = false }: BusinessScoreBadgeProps) {
  const score = calculateBusinessScore(business);
  const priority = getScorePriorityDark(score);

  return (
    <div
      className={`
        ${compact ? 'px-3 py-1' : 'px-4 py-2'}
        rounded-full text-xs font-medium border
        ${priority.colorClasses}
        shadow-sm hover:shadow-md hover:scale-105
        transition-all duration-200
        inline-flex items-center gap-1.5
      `}
    >
      <span>{priority.emoji}</span>
      <span className="font-mono font-bold">{score}</span>
    </div>
  );
}

interface BusinessScoreCardProps {
  business: Business;
  showBreakdown?: boolean;
}

export function BusinessScoreCard({ business, showBreakdown = false }: BusinessScoreCardProps) {
  const score = calculateBusinessScore(business);
  const priority = getScorePriorityDark(score);
  const breakdown = showBreakdown ? getScoreBreakdown(business) : null;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-1">Score de Prospection</h3>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold font-mono text-cyan-400">{score}</span>
            <span className="text-lg text-gray-500">/100</span>
          </div>
        </div>
        <div className={`
          px-4 py-2 rounded-full text-sm font-medium border
          ${priority.colorClasses}
        `}>
          <span className="mr-2">{priority.emoji}</span>
          {priority.label}
        </div>
      </div>

      {showBreakdown && breakdown && (
        <div className="space-y-3 pt-4 border-t border-gray-700">
          <ScoreBreakdownBar
            icon={<Star className="w-4 h-4 text-yellow-400" />}
            label="Note Google"
            score={breakdown.noteGoogle.score}
            max={breakdown.noteGoogle.max}
            color="bg-yellow-400"
          />
          <ScoreBreakdownBar
            icon={<MessageCircle className="w-4 h-4 text-blue-400" />}
            label="Nombre d'avis"
            score={breakdown.nombreAvis.score}
            max={breakdown.nombreAvis.max}
            color="bg-blue-400"
          />
          <ScoreBreakdownBar
            icon={<CheckCircle className="w-4 h-4 text-cyan-400" />}
            label="Complétude (site, tél, email, panier)"
            score={breakdown.completude.score}
            max={breakdown.completude.max}
            color="bg-cyan-400"
          />
        </div>
      )}
    </div>
  );
}

interface ScoreBreakdownBarProps {
  icon: React.ReactNode;
  label: string;
  score: number;
  max: number;
  color: string;
}

function ScoreBreakdownBar({ icon, label, score, max, color }: ScoreBreakdownBarProps) {
  const percentage = (score / max) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-gray-300">{label}</span>
        </div>
        <span className="font-mono text-xs text-gray-400">
          {score}/{max}
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label}: ${score} sur ${max}`}
        />
      </div>
    </div>
  );
}
