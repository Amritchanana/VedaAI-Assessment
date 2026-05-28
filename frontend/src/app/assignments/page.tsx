'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/ui/Sidebar';
import { Topbar } from '@/components/ui/Topbar';
import { Search, Filter, MoreVertical, Plus, FileX } from 'lucide-react';
import { listAssignments, deleteAssignment } from '@/lib/api';
import { format } from 'date-fns';

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  status: string;
  totalQuestions: number;
  totalMarks: number;
  dueDate: string;
  createdAt: string;
}

type MenuState = { id: string; open: boolean } | null;

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<MenuState>(null);

  useEffect(() => {
    listAssignments()
      .then(setAssignments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      await deleteAssignment(id);
      setAssignments(assignments.filter(a => a._id !== id));
      setMenu(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete assignment');
    }
  };

  const filtered = assignments.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <Sidebar assignmentCount={assignments.length} />
      <Topbar showBack breadcrumb="Assignment"/>

      {/* Added pt-10 and increased px-10 for more overall breathing room */}
      <main className="main-content pu-10 pb-24 md:ml-[280px] px-6 md:px-10 pt-10">
        
        {/* Page header */}
        <div className="flex items-start mb-4">
          {/* The Green Dot */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#4CD964] ring-[4px] ring-[#4CD964]/20 mt-3 mr-4 flex-shrink-0"></div>
          
          <div>
            <h1 className="text-[22px] font-bold text-[#1A1A18]">Assignments</h1>
            <p className="text-[14px] text-[#9B9B8E] mt-1">Manage and create assignments for your classes.</p>
          </div>
        </div>

        {/* Filters + Search */}
        {assignments.length > 0 && (
          <div className="bg-white rounded-[20px] py-3 px-6 flex items-center justify-between mb-3 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
            
            {/* Left side: Filter */}
            <button className="flex items-center gap-2 text-[#9B9B8E] font-medium text-[14px] hover:text-[#1A1A18] transition-colors">
              <Filter size={18} strokeWidth={2} />
              Filter By
            </button>

            {/* Right side: Search */}
            <div className="relative w-full max-w-[400px]">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B9B8E]" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search Assignment"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[13px] rounded-full border border-[#E8E8E3] focus:outline-none focus:border-[#1A1A18] text-[#1A1A18] placeholder:text-[#9B9B8E]"
              />
            </div>
            
          </div>
        )}

        {/* Empty state */}
        {!loading && assignments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 fade-up">
            <div className="w-28 h-28 mb-6 relative">
              <div className="w-full h-full bg-white rounded-2xl border-2 border-dashed border-[#E8E8E3] flex items-center justify-center">
                <FileX size={40} className="text-[#D4D4CC]" />
              </div>
            </div>
            <h2 className="text-[16px] font-semibold text-[#1A1A18] mb-2">No assignments yet</h2>
            <p className="text-[13px] text-[#9B9B8E] text-center max-w-sm mb-6">
              Create your first assignment to start collecting and grading student submissions.
            </p>
            <Link href="/assignments/create" className="bg-[#1A1A18] text-white py-2.5 px-5 rounded-full flex items-center gap-2 text-[13px]">
              <Plus size={15} />
              Create Your First Assignment
            </Link>
          </div>
        )}

        {/* Assignment grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-0.5">
            {filtered.map(a => (
              <div key={a._id} className="relative group fade-up bg-white rounded-[16px] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[160px]">
                
                {/* Three-dot menu - Kept outside the Link tag to avoid invalid HTML */}
                <div className="absolute top-5 right-4 z-20">
                  <button
                    onClick={e => { 
                      e.preventDefault(); 
                      e.stopPropagation(); 
                      setMenu(menu?.id === a._id ? null : { id: a._id, open: true }); 
                    }}
                    className="p-1 rounded-md hover:bg-[#F5F5F0] text-[#888888] transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {menu?.id === a._id && (
                    <div className="absolute right-0 top-8 bg-white border border-[#E8E8E3] rounded-lg shadow-lg z-30 min-w-[140px] py-1">
                      <Link href={`/result/${a._id}`}
                        className="block px-4 py-2 text-[13px] font-medium text-[#1A1A18] hover:bg-[#F5F5F0]">
                        View Assignment
                      </Link>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(a._id, a.title);
                        }}
                        className="block w-full text-left px-4 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Main clickable area */}
                <Link href={a.status === 'completed' ? `/result/${a._id}` : `/assignments/${a._id}`} className="flex flex-col h-full relative z-10">
                  
                  {/* Title - Bold, with right padding so it never overlaps the absolute menu icon */}
                  <h3 className="text-[20px] font-extrabold text-[#1A1A18] mb-8 pr-8 leading-tight tracking-tight">
                    {a.title}
                  </h3>

                  {/* Footer Dates - Dark text matching Figma */}
                  <div className="flex items-center justify-between text-[13px] font-bold text-[#1A1A18] mt-auto">
                    <span>Assigned on : {format(new Date(a.createdAt), 'dd-MM-yyyy')}</span>
                    {a.dueDate && (
                      <span>Due : {format(new Date(a.dueDate), 'dd-MM-yyyy')}</span>
                    )}
                  </div>
                  
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Loading skeleton - Updated to match new card styling */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-[16px] p-6 shadow-sm flex flex-col justify-between min-h-[160px] animate-pulse">
                <div className="h-6 bg-[#F0F0EC] rounded w-3/4 mb-8" />
                <div className="flex justify-between mt-auto">
                   <div className="h-4 bg-[#F0F0EC] rounded w-1/3" />
                   <div className="h-4 bg-[#F0F0EC] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating create btn - Centered layout */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <Link href="/assignments/create" className="bg-[#1A1A18] text-white py-3 px-6 shadow-[0_8px_20px_rgba(0,0,0,0.15)] rounded-full flex items-center gap-2 hover:bg-[#2A2A28] transition-colors">
          <Plus size={18} />
          <span className="text-[14px] font-semibold">Create Assignment</span>
        </Link>
      </div>
    </div>
  );
}