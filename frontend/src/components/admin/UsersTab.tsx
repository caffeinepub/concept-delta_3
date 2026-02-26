import React from 'react';
import { useGetAllUsers } from '../../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

const CLASS_LABELS: Record<string, string> = {
  eleventh: 'Class 11',
  twelfth: 'Class 12',
  dropper: 'Dropper',
};

export default function UsersTab() {
  const { data: users, isLoading } = useGetAllUsers();

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-lg font-semibold text-[#0A1F44]">
        Registered Users{' '}
        {users && <span className="text-gray-400 font-normal text-base">({users.length})</span>}
      </h2>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-lg bg-gray-100" />)}
        </div>
      ) : users && users.length > 0 ? (
        <div className="bg-white border border-[#0A1F44]/15 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0A1F44]">
                  <th className="text-left px-5 py-3 text-white font-medium">Name</th>
                  <th className="text-left px-5 py-3 text-white font-medium hidden sm:table-cell">Principal</th>
                  <th className="text-left px-5 py-3 text-white font-medium">Class</th>
                  <th className="text-left px-5 py-3 text-white font-medium hidden md:table-cell">Contact</th>
                </tr>
              </thead>
              <tbody>
                {users.map(([principal, profile], idx) => (
                  <tr
                    key={principal.toString()}
                    className={`border-t border-[#0A1F44]/8 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#0A1F44]/2'}`}
                  >
                    <td className="px-5 py-3 font-medium text-[#0A1F44]">{profile.fullName}</td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs hidden sm:table-cell">
                      {principal.toString().slice(0, 16)}…
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0A1F44]/5 border border-[#0A1F44]/20 text-[#0A1F44]">
                        {CLASS_LABELS[profile.userClass] ?? profile.userClass}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell">
                      {profile.contactNumber.toString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-[#0A1F44]/20 rounded-lg">
          <Users className="w-10 h-10 text-[#0A1F44]/20 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No users registered yet.</p>
        </div>
      )}
    </div>
  );
}
