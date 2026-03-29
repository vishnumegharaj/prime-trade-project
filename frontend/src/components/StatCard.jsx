const StatCard = ({ label, value, icon, color = 'sky' }) => {
  const colors = {
    sky: 'from-sky-500/10 to-transparent border-sky-500/20 text-sky-400',
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400',
    indigo: 'from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-400',
  };

  return (
    <div className={`card p-5 bg-gradient-to-br ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-100">{value}</p>
        </div>
        <div className={`p-2 rounded-xl bg-current/10 ${colors[color].split(' ')[2]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
