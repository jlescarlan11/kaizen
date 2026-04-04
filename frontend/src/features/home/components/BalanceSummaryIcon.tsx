import { useNavigate } from 'react-router-dom'
import { SharedIcon } from '../../../shared/components/IconRegistry'

export const BalanceSummaryIcon = () => {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/balance-summary')}
      aria-label="View Balance Summary"
      title="View Balance Summary"
      className="p-1 hover:bg-ui-accent-subtle/30 rounded-full transition-colors group focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <SharedIcon
        type="ui"
        name="chart-bar"
        size={20}
        className="text-muted-foreground group-hover:text-primary transition-colors"
      />
    </button>
  )
}
