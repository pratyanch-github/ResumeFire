import React, { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ResumeData, WorkExperience, Education, Project, SectionKey } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { TEMPLATES } from '../../constants';
import { generateAISummary } from '../../services/geminiService';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import Spinner from '../ui/Spinner';


const SectionContainer: React.FC<{
  title: string;
  children: ReactNode;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}> = ({ title, children, onMoveUp, onMoveDown, isFirst, isLast }) => {
  return (
    <section className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
            <div className="flex space-x-2">
                <button onClick={onMoveUp} disabled={isFirst} className="p-1 rounded-full hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                </button>
                 <button onClick={onMoveDown} disabled={isLast} className="p-1 rounded-full hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>
        </div>
        {children}
    </section>
  );
};


const EditorPage: React.FC = () => {
  const { getActiveResume, updateResume } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const data = getActiveResume();
    if (data) {
       // Ensure sectionOrder exists and has all keys, in case of old data structure
      const allKeys: SectionKey[] = ['summary', 'experience', 'projects', 'education', 'skills'];
      const existingKeys = new Set(data.sectionOrder || []);
      const mergedOrder = [
        ...(data.sectionOrder || []),
        ...allKeys.filter(k => !existingKeys.has(k))
      ];
      
      const sanitizedData: ResumeData = {
          ...data,
          projects: data.projects || [],
          education: data.education || [],
          experience: data.experience || [],
          skills: data.skills || [],
          sectionOrder: mergedOrder,
      }
      setResumeData(sanitizedData);
    }
    setLoading(false);
  }, [getActiveResume]);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      personalInfo: { ...resumeData.personalInfo, [e.target.name]: e.target.value },
    });
  };

  const handleFieldChange = <T,>(section: keyof ResumeData, index: number, field: keyof T, value: string) => {
    if (!resumeData) return;
    const sectionData = resumeData[section] as T[];
    const updatedSection = [...sectionData];
    updatedSection[index] = { ...updatedSection[index], [field]: value };
    setResumeData({ ...resumeData, [section]: updatedSection });
  };
  
  const addItem = <T,>(section: keyof ResumeData, newItem: T) => {
    if(!resumeData) return;
    const sectionData = resumeData[section] as T[];
    setResumeData({...resumeData, [section]: [...sectionData, newItem]});
  }

  const removeItem = (section: keyof ResumeData, id: string) => {
    if(!resumeData) return;
    const sectionData = resumeData[section] as ({id: string})[];
    setResumeData({...resumeData, [section]: sectionData.filter(item => item.id !== id)});
  }

  const handleMoveSection = (direction: 'up' | 'down', index: number) => {
    if(!resumeData) return;
    const { sectionOrder } = resumeData;
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newOrder.length) {
        [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]]; // Swap
        setResumeData({...resumeData, sectionOrder: newOrder});
    }
  };

  const handleGenerateSummary = async () => {
    if (!resumeData) return;
    setGenerating(true);
    try {
      const summary = await generateAISummary(resumeData.personalInfo.title, resumeData.experience, resumeData.skills);
      setResumeData({ ...resumeData, summary });
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!resumeData) return;
    setSaving(true);
    await updateResume(resumeData);
    setSaving(false);
    alert('Resume saved successfully! A new version has been added to your history.');
    navigate('/dashboard');
  };
  
  const renderSectionEditor = (key: SectionKey, index: number) => {
    if (!resumeData) return null;
    const sectionCount = resumeData.sectionOrder.length;

    switch(key) {
        case 'summary':
            return (
                <SectionContainer key={key} title="Professional Summary" onMoveUp={() => handleMoveSection('up', index)} onMoveDown={() => handleMoveSection('down', index)} isFirst={index === 0} isLast={index === sectionCount - 1}>
                     <div className="flex justify-end items-center mb-4">
                      <Button onClick={handleGenerateSummary} variant="secondary" isLoading={generating}>Generate with AI</Button>
                    </div>
                    <textarea className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2" rows={5} value={resumeData.summary} onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}></textarea>
                </SectionContainer>
            );
        case 'experience':
            return (
                 <SectionContainer key={key} title="Work Experience" onMoveUp={() => handleMoveSection('up', index)} onMoveDown={() => handleMoveSection('down', index)} isFirst={index === 0} isLast={index === sectionCount - 1}>
                    {resumeData.experience.map((exp, itemIndex) => (
                      <div key={exp.id} className="p-4 border rounded-md mb-4 space-y-3 bg-slate-50">
                        <Input label="Job Title" value={exp.jobTitle} onChange={e => handleFieldChange<WorkExperience>('experience', itemIndex, 'jobTitle', e.target.value)} />
                        <Input label="Company" value={exp.company} onChange={e => handleFieldChange<WorkExperience>('experience', itemIndex, 'company', e.target.value)} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Start Date" type="text" placeholder="e.g., Jan 2022" value={exp.startDate} onChange={e => handleFieldChange<WorkExperience>('experience', itemIndex, 'startDate', e.target.value)} />
                            <Input label="End Date" type="text" placeholder="e.g., Present" value={exp.endDate} onChange={e => handleFieldChange<WorkExperience>('experience', itemIndex, 'endDate', e.target.value)} />
                        </div>
                        <textarea placeholder="Description of your role and achievements..." rows={4} className="w-full rounded-md border-slate-300" value={exp.description} onChange={e => handleFieldChange<WorkExperience>('experience', itemIndex, 'description', e.target.value)}></textarea>
                        <Button variant="danger" onClick={() => removeItem('experience', exp.id)}>Remove</Button>
                      </div>
                    ))}
                    <Button onClick={() => addItem<WorkExperience>('experience', {id: uuidv4(), jobTitle: '', company: '', startDate: '', endDate: '', description: ''})}>Add Experience</Button>
                </SectionContainer>
            )
        case 'projects':
            return (
                 <SectionContainer key={key} title="Projects" onMoveUp={() => handleMoveSection('up', index)} onMoveDown={() => handleMoveSection('down', index)} isFirst={index === 0} isLast={index === sectionCount - 1}>
                    {resumeData.projects.map((proj, itemIndex) => (
                      <div key={proj.id} className="p-4 border rounded-md mb-4 space-y-3 bg-slate-50">
                        <Input label="Project Name" value={proj.name} onChange={e => handleFieldChange<Project>('projects', itemIndex, 'name', e.target.value)} />
                         <textarea placeholder="A brief description of your project..." rows={3} className="w-full rounded-md border-slate-300" value={proj.description} onChange={e => handleFieldChange<Project>('projects', itemIndex, 'description', e.target.value)}></textarea>
                        <Input label="Live Link (optional)" placeholder="https://..." value={proj.liveLink} onChange={e => handleFieldChange<Project>('projects', itemIndex, 'liveLink', e.target.value)} />
                        <Input label="Repository Link (optional)" placeholder="https://github.com/..." value={proj.repoLink} onChange={e => handleFieldChange<Project>('projects', itemIndex, 'repoLink', e.target.value)} />
                        <Button variant="danger" onClick={() => removeItem('projects', proj.id)}>Remove</Button>
                      </div>
                    ))}
                    <Button onClick={() => addItem<Project>('projects', {id: uuidv4(), name: '', description: '', liveLink: '', repoLink: ''})}>Add Project</Button>
                </SectionContainer>
            )
        case 'education':
            return (
                 <SectionContainer key={key} title="Education" onMoveUp={() => handleMoveSection('up', index)} onMoveDown={() => handleMoveSection('down', index)} isFirst={index === 0} isLast={index === sectionCount - 1}>
                    {resumeData.education.map((edu, itemIndex) => (
                      <div key={edu.id} className="p-4 border rounded-md mb-4 space-y-3 bg-slate-50">
                        <Input label="Institution" value={edu.institution} onChange={e => handleFieldChange<Education>('education', itemIndex, 'institution', e.target.value)} />
                        <Input label="Degree/Certificate" value={edu.degree} onChange={e => handleFieldChange<Education>('education', itemIndex, 'degree', e.target.value)} />
                         <div className="grid grid-cols-2 gap-4">
                            <Input label="Start Date" type="text" placeholder="e.g., Sep 2018" value={edu.startDate} onChange={e => handleFieldChange<Education>('education', itemIndex, 'startDate', e.target.value)} />
                            <Input label="End Date" type="text" placeholder="e.g., May 2022" value={edu.endDate} onChange={e => handleFieldChange<Education>('education', itemIndex, 'endDate', e.target.value)} />
                        </div>
                        <Button variant="danger" onClick={() => removeItem('education', edu.id)}>Remove</Button>
                      </div>
                    ))}
                    <Button onClick={() => addItem<Education>('education', {id: uuidv4(), institution: '', degree: '', startDate: '', endDate: ''})}>Add Education</Button>
                </SectionContainer>
            )
        case 'skills':
             return (
                 <SectionContainer key={key} title="Skills" onMoveUp={() => handleMoveSection('up', index)} onMoveDown={() => handleMoveSection('down', index)} isFirst={index === 0} isLast={index === sectionCount - 1}>
                    <p className="text-sm text-slate-500 mb-2">Enter skills separated by commas.</p>
                    <Input placeholder="e.g., React, TypeScript, Node.js" value={(resumeData.skills || []).join(', ')} onChange={e => setResumeData({...resumeData, skills: e.target.value.split(',').map(s => s.trim())})} />
                </SectionContainer>
            )
        default:
            return null;
    }
  }
  
  if (loading || !resumeData) return <div className="mt-20"><Spinner /></div>;
  
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Resume Editor</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Info - remains at top */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" name="name" value={resumeData.personalInfo.name} onChange={handlePersonalInfoChange} />
              <Input label="Job Title" name="title" value={resumeData.personalInfo.title} onChange={handlePersonalInfoChange} />
              <Input label="Phone" name="phone" type="tel" value={resumeData.personalInfo.phone} onChange={handlePersonalInfoChange} />
              <Input label="Email" name="email" type="email" value={resumeData.personalInfo.email} onChange={handlePersonalInfoChange} />
              <Input label="LinkedIn Profile URL" name="linkedin" value={resumeData.personalInfo.linkedin} onChange={handlePersonalInfoChange} />
              <Input label="Website/Portfolio" name="website" value={resumeData.personalInfo.website} onChange={handlePersonalInfoChange} />
            </div>
          </section>

          {/* Dynamically Ordered Sections */}
          {resumeData.sectionOrder.map((key, index) => renderSectionEditor(key, index))}

        </div>

        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Settings</h2>
                <Input label="Username" value={resumeData.username} disabled className="bg-slate-100" />
                <p className="text-xs text-slate-500 mt-1">Username cannot be changed.</p>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Template</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {TEMPLATES.map(template => (
                             <div key={template.id} onClick={() => setResumeData({...resumeData, templateId: template.id})} className={`rounded-lg overflow-hidden border-4 cursor-pointer transition-all ${resumeData.templateId === template.id ? 'border-primary-500' : 'border-transparent hover:border-primary-200'}`}>
                                 <img src={template.thumbnailUrl} alt={template.name} className="w-full h-auto object-cover"/>
                                 <p className="text-center font-semibold p-2 bg-slate-50">{template.name}</p>
                             </div>
                        ))}
                    </div>
                </div>

                 <div className="mt-8">
                     <Button className="w-full" onClick={handleSave} isLoading={saving}>Save & Create New Version</Button>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;