import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { generateModifiedResume } from '../../services/geminiService';
import { ResumeData, SectionKey } from '../../types';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import ToggleSwitch from '../ui/ToggleSwitch';
import { SECTIONS } from '../../constants';
import { useNavigate } from 'react-router-dom';

const DEGREE_LABELS: { [key: number]: string } = {
  1: 'Subtle Tweaks',
  4: 'Balanced',
  7: 'Targeted Rewrite',
  10: 'Aggressive Match',
};

const ModifyPage: React.FC = () => {
    const { getActiveResume, updateResume } = useAuth();
    const navigate = useNavigate();

    const [jobDescription, setJobDescription] = useState('');
    const [modificationDegree, setModificationDegree] = useState(5);
    const [excludedSections, setExcludedSections] = useState<SectionKey[]>(['education']);
    
    const [originalResume, setOriginalResume] = useState<ResumeData | null>(getActiveResume());
    const [modifiedResume, setModifiedResume] = useState<ResumeData | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleToggleSection = (key: SectionKey, isIncluded: boolean) => {
        if (isIncluded) {
            setExcludedSections(prev => prev.filter(s => s !== key));
        } else {
            setExcludedSections(prev => [...prev, key]);
        }
    };
    
    const handleGenerate = async () => {
        if (!originalResume || !jobDescription) {
            setError('Please provide a job description.');
            return;
        }
        setError('');
        setIsLoading(true);
        setModifiedResume(null);

        try {
            const result = await generateModifiedResume(jobDescription, originalResume, modificationDegree, excludedSections);
            setModifiedResume(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptAndSave = async () => {
        if (!modifiedResume) return;
        setIsSaving(true);
        try {
            await updateResume(modifiedResume);
            alert("Modified resume saved successfully! Your previous version is now in your history.");
            navigate('/edit');
        } catch (err: any) {
            setError(err.message || 'Failed to save the resume.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">AI Resume Modifier</h1>
            <p className="text-slate-600 mb-6">Paste a job description, and our AI will tailor your resume to match. The result will be saved as a new version.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Controls Column */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md space-y-6 sticky top-8">
                    <div>
                        <label htmlFor="job-desc" className="block text-lg font-semibold text-slate-700 mb-2">Job Description</label>
                        <textarea
                            id="job-desc"
                            rows={8}
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"
                            placeholder="Paste the job description here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="degree" className="block text-lg font-semibold text-slate-700 mb-2">Modification Degree</label>
                        <input
                            id="degree"
                            type="range"
                            min="1"
                            max="10"
                            value={modificationDegree}
                            onChange={(e) => setModificationDegree(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>Subtle</span>
                            <span className="font-bold text-primary-600">{DEGREE_LABELS[modificationDegree] || modificationDegree}</span>
                            <span>Aggressive</span>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-3">Modify Sections</h3>
                        <div className="space-y-3">
                           {SECTIONS.map(section => (
                                <ToggleSwitch
                                    key={section.key}
                                    id={`toggle-${section.key}`}
                                    label={section.name}
                                    checked={!excludedSections.includes(section.key)}
                                    onChange={(checked) => handleToggleSection(section.key, checked)}
                                />
                           ))}
                        </div>
                    </div>
                    <Button className="w-full" onClick={handleGenerate} isLoading={isLoading}>Generate Modified Resume</Button>
                    {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                </div>

                {/* Results Column */}
                <div className="lg:col-span-2">
                    {isLoading && <div className="bg-white p-8 rounded-lg shadow-md"><Spinner /></div>}
                    {!isLoading && !modifiedResume && (
                        <div className="bg-white p-8 rounded-lg shadow-md text-center">
                            <h2 className="text-xl font-semibold text-slate-700">Awaiting Generation</h2>
                            <p className="text-slate-500 mt-2">Your AI-modified resume will appear here after you click "Generate".</p>
                        </div>
                    )}
                    {modifiedResume && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b">
                                <h2 className="text-2xl font-bold text-slate-800">Review Your New Resume</h2>
                                <div className="flex space-x-2">
                                    <Button variant="secondary" onClick={() => setModifiedResume(null)}>Discard</Button>
                                    <Button onClick={handleAcceptAndSave} isLoading={isSaving}>Accept & Save</Button>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {SECTIONS.map(({key, name}) => {
                                    const originalContent = JSON.stringify(originalResume?.[key], null, 2);
                                    const modifiedContent = JSON.stringify(modifiedResume?.[key], null, 2);
                                    const isChanged = originalContent !== modifiedContent;
                                    
                                    return (
                                        <div key={key}>
                                            <h3 className={`text-lg font-semibold mb-2 ${isChanged ? 'text-primary-600' : 'text-slate-700'}`}>{name} {isChanged && "(Modified)"}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500 mb-1">Original</p>
                                                    <pre className="text-xs bg-slate-100 p-3 rounded-md whitespace-pre-wrap font-sans">{originalContent}</pre>
                                                </div>
                                                <div className={`${isChanged ? 'bg-primary-50' : 'bg-slate-100'} rounded-md`}>
                                                    <p className="text-sm font-medium text-slate-500 mb-1 pl-3 pt-2">New</p>
                                                    <pre className="text-xs p-3 rounded-md whitespace-pre-wrap font-sans">{modifiedContent}</pre>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModifyPage;
