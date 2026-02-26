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
import { User, Phone, GraduationCap } from 'lucide-react';
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
    if (fullName.trim().length < 3) newErrors.fullName = 'Name must be at least 3 characters';
    if (!userClass) newErrors.userClass = 'Please select your class';
    const contact = parseInt(contactNumber, 10);
    if (isNaN(contact) || contactNumber.length !== 10) {
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
    } catch (err) {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-navy-800 font-display text-lg">Complete Your Profile</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Just a few details to get you started
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-navy-800 font-medium text-sm">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-9 border-border focus:border-navy-800 focus:ring-navy-800"
              />
            </div>
            {errors.fullName && <p className="text-destructive text-xs">{errors.fullName}</p>}
          </div>

          {/* Class */}
          <div className="space-y-1.5">
            <Label htmlFor="userClass" className="text-navy-800 font-medium text-sm">
              Class
            </Label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
              <Select value={userClass} onValueChange={(v) => setUserClass(v as Class)}>
                <SelectTrigger className="pl-9 border-border focus:border-navy-800">
                  <SelectValue placeholder="Select your class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Class.eleventh}>11th</SelectItem>
                  <SelectItem value={Class.twelfth}>12th</SelectItem>
                  <SelectItem value={Class.dropper}>Dropper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.userClass && <p className="text-destructive text-xs">{errors.userClass}</p>}
          </div>

          {/* Contact Number */}
          <div className="space-y-1.5">
            <Label htmlFor="contactNumber" className="text-navy-800 font-medium text-sm">
              Contact Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="contactNumber"
                type="tel"
                placeholder="10-digit mobile number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="pl-9 border-border focus:border-navy-800"
                maxLength={10}
              />
            </div>
            {errors.contactNumber && <p className="text-destructive text-xs">{errors.contactNumber}</p>}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-navy-800 hover:bg-navy-700 text-white font-semibold h-11 mt-2"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save & Continue'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
