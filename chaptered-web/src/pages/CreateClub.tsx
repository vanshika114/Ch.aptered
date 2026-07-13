import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClubStore } from '../store/useClubStore';
import { LoadingButton } from '../components/ui/LoadingButton';

const CLUB_TYPES = [
  {
    value: 'public',
    title: 'Public Club',
    desc: 'Visible to everyone. Anyone can join instantly — no approval needed.',
    icon: '🌐',
  },
  {
    value: 'semi_private',
    title: 'Semi-Private Club',
    desc: 'Visible to everyone. Join requests require admin approval.',
    icon: '🔒',
  },
  {
    value: 'private',
    title: 'Private Club',
    desc: 'Hidden from discovery. Join via invite code only.',
    icon: '🔑',
  },
];

export const CreateClub: React.FC = () => {
  const navigate = useNavigate();
  const { createClub } = useClubStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('public');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    const res = await createClub(name.trim(), description.trim(), type);
    setIsSubmitting(false);
    if (res.success) navigate('/clubs');
    else setErrors({ general: res.error || 'Failed to create club' });
  };

  return (
    <div className="page-pad min-h-screen flex items-center justify-center">
      <div className="page-med w-full">
        <div className="card-r p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-black text-ink">Create a Book Club</h1>
            <p className="text-muted mt-2 text-sm">Start your own reading community and invite fellow readers.</p>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-5 py-3.5 rounded-xl mb-5">{errors.general}</div>
          )}

          <div className="space-y-6">
            <div>
              <label className="label-f">Club Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fantasy Readers" className={`input-f ${errors.name ? '!border-red-400' : ''}`} />
              {errors.name && <p className="text-red-600 text-xs font-semibold mt-1.5">{errors.name}</p>}
            </div>

            <div>
              <label className="label-f">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell readers what your club is about — what genres you read, how often, etc." rows={4} className={`input-f resize-y ${errors.description ? '!border-red-400' : ''}`} />
              {errors.description && <p className="text-red-600 text-xs font-semibold mt-1.5">{errors.description}</p>}
            </div>

            <div>
              <label className="label-f">Club Type</label>
              <div className="grid gap-3 mt-1">
                {CLUB_TYPES.map((ct) => (
                  <button
                    key={ct.value}
                    type="button"
                    onClick={() => setType(ct.value)}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      type === ct.value
                        ? 'border-amber bg-amber/5 shadow-sm'
                        : 'border-border/60 hover:border-border bg-card'
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{ct.icon}</span>
                    <div>
                      <p className="font-bold text-sm text-ink-soft">{ct.title}</p>
                      <p className="text-xs text-muted mt-0.5 leading-relaxed">{ct.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <LoadingButton onClick={handleSubmit} loading={isSubmitting} className="flex-1 justify-center">Create Club</LoadingButton>
              <button onClick={() => navigate('/clubs')} className="btn-o">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
