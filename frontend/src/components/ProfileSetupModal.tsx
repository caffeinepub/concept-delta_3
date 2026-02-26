import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Class } from '../backend';
import type { UserProfile } from '../backend';
import {
  Dialog,
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
      <DialogContent
        className="sm:max-w-md border-0 shadow-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-11 h-11 rounded-full bg-[#0A1F44] flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-[#0A1F44] font-bold text-lg leading-tight">
                Complete Your Profile
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Just a few details to get you started on Concept Delta
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-[#0A1F44] font-semibold text-sm">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-9 focus-visible:ring-[#0A1F44]"
                autoComplete="name"
              />
            </div>
            {errors.fullName && (
              <p className="text-destructive text-xs">{errors.fullName}</p>
            )}
          </div>

          {/* Class */}
          <div className="space-y-1.5">
            <Label htmlFor="userClass" className="text-[#0A1F44] font-semibold text-sm">
              Class
            </Label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
              <Select value={userClass} onValueChange={(v) => setUserClass(v as Class)}>
                <SelectTrigger className="pl-9 focus:ring-[#0A1F44]">
                  <SelectValue placeholder="Select your class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Class.eleventh}>11th</SelectItem>
                  <SelectItem value={Class.twelfth}>12th</SelectItem>
                  <SelectItem value={Class.dropper}>Dropper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.userClass && (
              <p className="text-destructive text-xs">{errors.userClass}</p>
            )}
          </div>

          {/* Contact Number */}
          <div className="space-y-1.5">
            <Label htmlFor="contactNumber" className="text-[#0A1F44] font-semibold text-sm">
              Contact Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="contactNumber"
                type="tel"
                placeholder="10-digit mobile number"
                value={contactNumber}
                onChange={(e) =>
                  setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                }
                className="pl-9 focus-visible:ring-[#0A1F44]"
                maxLength={10}
                autoComplete="tel"
              />
            </div>
            {errors.contactNumber && (
              <p className="text-destructive text-xs">{errors.contactNumber}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#0A1F44] hover:bg-[#0d2a5e] text-white font-semibold h-11 mt-2"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save & Continue →'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
