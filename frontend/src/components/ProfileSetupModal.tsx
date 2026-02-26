import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Class } from '../backend';
import type { UserProfile } from '../backend';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Phone, GraduationCap, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const navigate = useNavigate();
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();

  const [fullName, setFullName] = useState('');
  const [userClass, setUserClass] = useState<Class | ''>('');
  const [contactNumber, setContactNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    }
    if (!userClass) {
      newErrors.userClass = 'Please select your class';
    }
    if (contactNumber.length !== 10 || isNaN(Number(contactNumber))) {
      newErrors.contactNumber = 'Enter a valid 10-digit mobile number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const profile: UserProfile = {
      fullName: fullName.trim(),
      userClass: userClass as Class,
      contactNumber: BigInt(contactNumber),
      hasVisitedAdmin: false,
    };

    try {
      await saveProfile(profile);
      toast.success('Profile saved! Welcome to Concept Delta 🎉');
      navigate({ to: '/dashboard' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      toast.error(message.includes('trap') ? 'Please check your details and try again.' : message);
    }
  };

  return (
    <Dialog open={true}>
      <DialogPortal>
        {/* Fully opaque dark overlay — no page content bleeds through */}
        <DialogOverlay
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'none',
          }}
          className="fixed inset-0 z-50"
        />

        {/* Solid white card — no transparency */}
        <div
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              color: '#0A1F44',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              border: '1px solid #e2e8f0',
            }}
            className="p-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                style={{ backgroundColor: '#0A1F44' }}
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2
                  style={{ color: '#0A1F44' }}
                  className="font-bold text-lg leading-tight"
                >
                  Complete Your Profile
                </h2>
                <p style={{ color: '#64748b' }} className="text-sm mt-0.5">
                  Just a few details to get you started on Concept Delta
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="fullName"
                  style={{ color: '#0A1F44' }}
                  className="font-semibold text-sm block"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: '#94a3b8' }}
                  />
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0A1F44',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
                    className="w-full pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0A1F44] focus:border-[#0A1F44] transition-colors"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0A1F44';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                    }}
                  />
                </div>
                {errors.fullName && (
                  <p style={{ color: '#dc2626' }} className="text-xs">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Class */}
              <div className="space-y-1.5">
                <label
                  htmlFor="userClass"
                  style={{ color: '#0A1F44' }}
                  className="font-semibold text-sm block"
                >
                  Class
                </label>
                <div className="relative">
                  <GraduationCap
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10 pointer-events-none"
                    style={{ color: '#94a3b8' }}
                  />
                  <Select value={userClass} onValueChange={(v) => setUserClass(v as Class)}>
                    <SelectTrigger
                      className="pl-9 w-full"
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#0A1F44',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                      }}
                    >
                      <SelectValue placeholder="Select your class" />
                    </SelectTrigger>
                    <SelectContent
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#0A1F44',
                        border: '1px solid #cbd5e1',
                      }}
                    >
                      <SelectItem value={Class.eleventh}>11th</SelectItem>
                      <SelectItem value={Class.twelfth}>12th</SelectItem>
                      <SelectItem value={Class.dropper}>Dropper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.userClass && (
                  <p style={{ color: '#dc2626' }} className="text-xs">
                    {errors.userClass}
                  </p>
                )}
              </div>

              {/* Contact Number */}
              <div className="space-y-1.5">
                <label
                  htmlFor="contactNumber"
                  style={{ color: '#0A1F44' }}
                  className="font-semibold text-sm block"
                >
                  Contact Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: '#94a3b8' }}
                  />
                  <input
                    id="contactNumber"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={contactNumber}
                    onChange={(e) =>
                      setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    maxLength={10}
                    autoComplete="tel"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0A1F44',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
                    className="w-full pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0A1F44] focus:border-[#0A1F44] transition-colors"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0A1F44';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                    }}
                  />
                </div>
                {errors.contactNumber && (
                  <p style={{ color: '#dc2626' }} className="text-xs">
                    {errors.contactNumber}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                style={{
                  backgroundColor: isPending ? '#1a3a6e' : '#0A1F44',
                  color: '#ffffff',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  opacity: isPending ? 0.8 : 1,
                  width: '100%',
                  padding: '11px 0',
                  fontWeight: 600,
                  fontSize: '15px',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isPending) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0d2a5e';
                }}
                onMouseLeave={(e) => {
                  if (!isPending) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0A1F44';
                }}
              >
                {isPending ? (
                  <>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#ffffff',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                    Saving...
                  </>
                ) : (
                  'Save & Continue →'
                )}
              </button>
            </form>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
