import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAcceptInvitation } from '../hooks/useWorkspace';
import { Building, ShieldCheck, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';

export const AcceptInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const acceptMutation = useAcceptInvitation();

  const [loadingInviteDetails, setLoadingInviteDetails] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchInviteDetails = async () => {
      if (!token) {
        setErrorMsg('Invitation token is missing from the link url.');
        setLoadingInviteDetails(false);
        return;
      }
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          // If not logged in, redirect to login with redirect back path
          navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          return;
        }

        // Just let them click "Accept & Join" directly. This is much simpler and robust!
        setLoadingInviteDetails(false);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || 'Failed to validate invitation link.');
        setLoadingInviteDetails(false);
      }
    };
    fetchInviteDetails();
  }, [token, navigate]);

  const handleAccept = async () => {
    setErrorMsg(null);
    try {
      const membership = await acceptMutation.mutateAsync(token);
      // Switch active workspace in localStorage
      localStorage.setItem('activeWorkspaceId', membership.workspaceId);
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to accept invitation. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />

      <div className="w-full max-w-md border border-white/10 rounded-2xl bg-card/60 backdrop-blur-md p-8 relative z-10 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-4">
            <Building className="h-8 w-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white font-heading tracking-tight">Ledgerly Workspace Invite</h2>
          <p className="text-xs text-gray-400 mt-1">You have been invited to collaborate in a workspace.</p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-6 text-xs text-red-400 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Action:</span>
              <span className="font-semibold text-white">Accept Invitation & Join</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Security Check:</span>
              <span className="flex items-center gap-1 font-semibold text-green-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Link Secure
              </span>
            </div>
          </div>

          <button
            onClick={handleAccept}
            disabled={acceptMutation.isPending || loadingInviteDetails}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold disabled:opacity-50 transition shadow-lg cursor-pointer"
          >
            {acceptMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Accept & Join Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full text-center text-xs text-gray-400 hover:text-white transition cursor-pointer"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
export default AcceptInvitationPage;
