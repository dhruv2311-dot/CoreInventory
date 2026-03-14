export default function StatusBadge({ status }) {
  const getColors = (status) => {
    switch (status) {
      case 'Draft': return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
      case 'Waiting': return 'bg-warning/20 text-warning border-warning/50';
      case 'Ready': return 'bg-accent/20 text-accent border-accent/50';
      case 'Done': return 'bg-primary/20 text-primary border-primary/50';
      case 'Canceled': return 'bg-danger/20 text-danger border-danger/50';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getColors(status)}`}>
      {status}
    </span>
  );
}
