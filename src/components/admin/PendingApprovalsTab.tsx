import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCheck,
  UserX,
  Clock,
  Building2,
  Filter,
  CheckCircle2,
  AlertCircle,
  Search,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  School,
  Calendar,
  Layers,
} from 'lucide-react';
import { StudentPendingRecord, SchoolPendingGroup } from '../../types';
import { logStudentStatusChange } from '../../utils/auditLogger';
import { getStoredAuthUser } from '../../data/authConfig';

interface PendingApprovalsTabProps {
  onApprovalCountChange?: (count: number) => void;
}

export const PendingApprovalsTab: React.FC<PendingApprovalsTabProps> = ({ onApprovalCountChange }) => {
  const [groups, setGroups] = useState<SchoolPendingGroup[]>([]);
  const [totalPending, setTotalPending] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check current logged-in user authority
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('mvm_active_auth_user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const isSuperAdmin = currentUser?.isSuperAdmin === true || currentUser?.roleType === 'super_admin';

  const fetchPendingData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/pending-students');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setGroups(data.groups || []);
          setTotalPending(data.totalPending || 0);
          if (onApprovalCountChange) {
            onApprovalCountChange(data.totalPending || 0);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingData();
  }, []);

  const handleStatusChange = async (udiseCode: string, studentId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    if (!isSuperAdmin) {
      setFeedbackMessage({
        type: 'error',
        text: 'Super Admin Only: Principals and Teachers cannot approve or reject students. (केवळ सुपर ॲडमिन मंजुरी देऊ शकतात)',
      });
      return;
    }

    setActionLoadingId(studentId);
    setFeedbackMessage(null);

    // Find student details for comprehensive audit entry
    const targetStudent = groups.flatMap((g) => g.students).find((s) => s.id === studentId);
    const studentDisplayName = targetStudent?.name || studentId;
    const currentUser = getStoredAuthUser();

    try {
      const res = await fetch('/api/admin/students/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          udiseCode,
          studentId,
          newStatus,
          isSuperAdmin: true,
          roleType: 'super_admin',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Log critical action into Firestore
        logStudentStatusChange({
          udiseCode,
          studentId,
          studentName: studentDisplayName,
          previousStatus: targetStudent?.status || 'PENDING',
          newStatus,
          adminUser: currentUser?.name || 'Super Admin (Owner)',
          adminRole: currentUser?.roleType || 'super_admin',
        }).catch((err) => console.warn('Audit log status change note:', err));

        setGroups(data.groups || []);
        setTotalPending(data.totalPending || 0);
        if (onApprovalCountChange) {
          onApprovalCountChange(data.totalPending || 0);
        }
        setFeedbackMessage({
          type: 'success',
          text: `Student ${newStatus === 'APPROVED' ? 'Approved successfully! The student can now login.' : 'Rejected.'}`,
        });
      } else {
        setFeedbackMessage({
          type: 'error',
          text: data.message || 'Failed to update student approval status.',
        });
      }
    } catch (err) {
      console.error('Approval status change error:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Network error communicating with school authentication server.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered groups & students
  const filteredGroups = useMemo(() => {
    let result = groups;

    if (selectedSchoolFilter !== 'all') {
      result = result.filter((g) => g.udiseCode === selectedSchoolFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result
        .map((g) => ({
          ...g,
          students: g.students.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.rollNo.toLowerCase().includes(q) ||
              s.className.toLowerCase().includes(q) ||
              g.schoolName.toLowerCase().includes(q) ||
              g.udiseCode.includes(q)
          ),
        }))
        .filter((g) => g.students.length > 0);
    }

    return result;
  }, [groups, selectedSchoolFilter, searchQuery]);

  return (
    <div id="pendingApprovalsTabRoot" className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-black text-white">Student Registration Approvals</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Pending ({totalPending})
                </span>
                {isSuperAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Super Admin Approval Mode Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/25 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Read-Only (Super Admin Approval Required)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Maharashtra Multi-School Partition (UDISE). New registrations stay PENDING until Super Admin approves them.
              </p>
            </div>
          </div>

          <button
            onClick={fetchPendingData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 active:scale-95 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh List</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2.5 border ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* School Dropdown Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-300 whitespace-nowrap">Filter School:</span>
          <select
            value={selectedSchoolFilter}
            onChange={(e) => setSelectedSchoolFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Schools ({groups.length})</option>
            {groups.map((g) => (
              <option key={g.udiseCode} value={g.udiseCode}>
                {g.schoolName} ({g.udiseCode}) - {g.pendingCount} Pending
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student name, roll no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-300">Loading pending student registrations across schools...</p>
        </div>
      ) : totalPending === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-white">All Caught Up!</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            There are currently no pending student registrations awaiting Super Admin approval across any connected schools.
          </p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-400">No pending students match the selected filter or search term.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <div
              key={group.udiseCode}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* School Group Header */}
              <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-white">{group.schoolName}</h3>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-800 border border-slate-700 text-amber-300">
                        UDISE: {group.udiseCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {group.city || 'District City'} • {group.district || 'Maharashtra'} • Partition:{' '}
                      <span className="font-mono text-slate-300">schools/{group.udiseCode}/students</span>
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 w-fit">
                  {group.students.length} Pending Approval
                </span>
              </div>

              {/* Student Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-950/40">
                      <th className="py-3 px-4">Student Full Name</th>
                      <th className="py-3 px-4">Class &amp; Div</th>
                      <th className="py-3 px-4">Roll No</th>
                      <th className="py-3 px-4">Registration Date</th>
                      <th className="py-3 px-4">Contact / Phone</th>
                      <th className="py-3 px-4 text-right">Super Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {group.students.map((student) => {
                      const isActing = actionLoadingId === student.id;

                      return (
                        <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                          {/* Name & ID */}
                          <td className="py-3 px-4 font-bold text-white">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-amber-400 shrink-0">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="text-white font-bold">{student.name}</span>
                                <span className="block text-[10px] font-mono text-slate-500 font-normal">
                                  ID: {student.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Class & Div */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold text-[11px]">
                              <Layers className="w-3 h-3" />
                              {student.className} {student.section ? `• Div ${student.section}` : ''}
                            </span>
                          </td>

                          {/* Roll No */}
                          <td className="py-3 px-4 font-mono font-bold text-slate-200">
                            #{student.rollNo || '01'}
                          </td>

                          {/* Date */}
                          <td className="py-3 px-4 text-slate-300">
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              <span>{student.date || new Date().toISOString().split('T')[0]}</span>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="py-3 px-4 text-[11px] font-mono text-slate-400">
                            {student.mobile || student.parentPhone || '+91 98000 00000'}
                          </td>

                          {/* Actions: Super Admin ONLY */}
                          <td className="py-3 px-4 text-right">
                            {isSuperAdmin ? (
                              <div className="inline-flex items-center gap-2 justify-end">
                                <button
                                  onClick={() => handleStatusChange(group.udiseCode, student.id, 'APPROVED')}
                                  disabled={isActing}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30 disabled:opacity-50 cursor-pointer"
                                  title="Approve Student Account (सुपर ॲडमिन मंजुरी)"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleStatusChange(group.udiseCode, student.id, 'REJECTED')}
                                  disabled={isActing}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/30 active:scale-95 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                  title="Reject Student Registration"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                                <span>Super Admin Only</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
