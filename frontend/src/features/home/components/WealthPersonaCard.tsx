import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useWealthPersona } from '../hooks/useWealthPersona'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { DashboardCard, CardHeader } from '../../../shared/components'

export const WealthPersonaCard: React.FC = () => {
  const personaData = useWealthPersona()
  const navigate = useNavigate()

  if (!personaData) return null

  const { persona, description, icon, streak } = personaData

  return (
    <DashboardCard className="flex flex-col h-full group relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/5 blur-3xl rounded-full opacity-50 group-hover:bg-primary/10 transition-colors duration-1000" />

      <CardHeader
        icon={<SharedIcon type="ui" name="target" size={14} className="text-primary" />}
        title="Wealth Persona"
        titleClassName="text-3xs font-black uppercase tracking-widest text-text-primary"
        className="mb-5"
      />

      <div className="flex flex-col gap-2 flex-grow justify-center relative z-10">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-inner">
          <SharedIcon type="ui" name={icon} size={24} strokeWidth={2.5} />
        </div>
        <h3 className="text-2xl font-black text-text-primary tracking-tight leading-none">
          {persona}
        </h3>
        <p className="text-xs font-bold text-text-secondary opacity-60 leading-relaxed max-w-[180px]">
          {description}
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-border/5 flex items-center justify-between relative z-10">
        <div>
          <p className="text-5xs font-black uppercase text-text-tertiary opacity-40 mb-1">
            Savings Streak
          </p>
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-3 rounded-full border border-surface ${i < streak ? 'bg-primary' : 'bg-surface-secondary opacity-30'}`}
                />
              ))}
            </div>
            <span className="text-3xs font-black text-primary">{streak}d</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/your-account/profile')}
          className="text-4xs font-black uppercase text-primary hover:underline transition-all"
        >
          Profile XP →
        </button>
      </div>
    </DashboardCard>
  )
}
