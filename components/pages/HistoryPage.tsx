import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ResumeData } from '../../types';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const HistoryPage: React.FC = () => {
    const { getResumeHistory, restoreFromHistory, deleteFromHistory } = useAuth();
    const [history, setHistory] = useState<ResumeData[]>(getResumeHistory());
    const [loadingAction, setLoadingAction] = useState<string | null>(null); // versionId of item being processed
    const navigate = useNavigate();

    const handleRestore = async (versionId: string) => {
        if (!window.confirm("Are you sure you want to restore this version? Your current active resume will be moved to history.")) return;
        setLoadingAction(versionId);
        try {
            await restoreFromHistory(versionId);
            setHistory(getResumeHistory()); // Refresh history
            alert("Resume restored successfully!");
            navigate('/edit');
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setLoadingAction(null);
        }
    };

    const handleDelete = async (versionId: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this version?")) return;
        setLoadingAction(versionId);
        try {
            await deleteFromHistory(versionId);
            setHistory(getResumeHistory()); // Refresh history
            alert("Version deleted successfully!");
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setLoadingAction(null);
        }
    };
    
    const handlePreview = (resumeData: ResumeData) => {
        navigate(`/view/${resumeData.username}`, { state: { resumeDataForPreview: resumeData } });
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Resume History</h1>
            <p className="text-slate-600 mb-6">You can keep up to 3 previous versions of your resume. Restoring a version will make it your active resume for editing.</p>
            
            {history.length === 0 ? (
                <div className="text-center bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-slate-700">No History Yet</h2>
                    <p className="text-slate-500 mt-2">Your previous resume versions will appear here after you save changes in the editor.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map(version => (
                        <div key={version.versionId} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-slate-800">Version saved on:</p>
                                <p className="text-sm text-slate-600">{new Date(version.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => handlePreview(version)}
                                    isLoading={loadingAction === version.versionId}
                                    disabled={!!loadingAction}
                                >
                                    Preview
                                </Button>
                                <Button
                                    onClick={() => handleRestore(version.versionId)}
                                    isLoading={loadingAction === version.versionId}
                                    disabled={!!loadingAction}
                                >
                                    Restore
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => handleDelete(version.versionId)}
                                    isLoading={loadingAction === version.versionId}
                                    disabled={!!loadingAction}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
