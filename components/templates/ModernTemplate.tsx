import React from 'react';
import { ResumeData, SectionKey } from '../../types';

const RightColumnHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-xl font-bold text-primary-700 uppercase tracking-wider mb-4 pb-2 border-b-2 border-primary-200">{children}</h3>
);

const LeftColumnHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-3 pb-2 border-b-2 border-primary-200">{children}</h3>
);

const renderRightColumnSection = (key: SectionKey, data: ResumeData) => {
    switch (key) {
        case 'summary':
            return (
                <section key="summary" className="mb-8">
                    <RightColumnHeader>Summary</RightColumnHeader>
                    <p className="text-slate-700 leading-relaxed">{data.summary || 'A brief professional summary about you.'}</p>
                </section>
            );
        case 'experience':
            return (
                <section key="experience" className="mb-8">
                    <RightColumnHeader>Experience</RightColumnHeader>
                    {data.experience.map((exp) => (
                      <div key={exp.id} className="mb-6">
                        <div className="flex justify-between items-baseline">
                           <h4 className="text-lg font-bold text-slate-800">{exp.jobTitle || 'Job Title'}</h4>
                           <p className="text-sm text-slate-500">{exp.startDate} - {exp.endDate}</p>
                        </div>
                        <h5 className="font-semibold text-slate-600 mb-2">{exp.company || 'Company Name'}</h5>
                        <p className="text-slate-700 whitespace-pre-line">{exp.description || 'Description of your role and accomplishments.'}</p>
                      </div>
                    ))}
                    {data.experience.length === 0 && <p className="text-slate-500">Add work experience to see it here.</p>}
                </section>
            );
        case 'projects':
            return (
                <section key="projects" className="mb-8">
                    <RightColumnHeader>Projects</RightColumnHeader>
                     {data.projects.map((proj) => (
                      <div key={proj.id} className="mb-6">
                        <h4 className="text-lg font-bold text-slate-800">{proj.name || 'Project Name'}</h4>
                        <p className="text-slate-700 whitespace-pre-line mb-1">{proj.description || 'Project description.'}</p>
                        <div className="flex space-x-4 text-sm">
                            {proj.liveLink && <a href={proj.liveLink} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Live Demo</a>}
                            {proj.repoLink && <a href={proj.repoLink} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Code Repository</a>}
                        </div>
                      </div>
                    ))}
                    {data.projects.length === 0 && <p className="text-slate-500">Add projects to see them here.</p>}
                </section>
            );
        default:
            return null;
    }
}

const renderLeftColumnSection = (key: SectionKey, data: ResumeData) => {
     switch (key) {
        case 'skills':
             return (
                <section key="skills" className="mt-8">
                    <LeftColumnHeader>Skills</LeftColumnHeader>
                    <ul className="flex flex-wrap gap-2 text-sm">
                      {(data.skills && data.skills.length > 0 ? data.skills : ['Your Skills']).map((skill, index) => (
                        <li key={index} className="bg-primary-100 text-primary-800 rounded-full px-3 py-1">{skill}</li>
                      ))}
                    </ul>
                </section>
             );
        case 'education':
             return (
                <section key="education" className="mt-8">
                    <LeftColumnHeader>Education</LeftColumnHeader>
                    {data.education.map((edu) => (
                      <div key={edu.id} className="mb-4">
                        <h4 className="font-bold text-slate-800">{edu.institution || 'Institution'}</h4>
                        <p className="text-sm text-slate-600">{edu.degree || 'Degree'}</p>
                        <p className="text-xs text-slate-500">{edu.startDate} - {edu.endDate}</p>
                      </div>
                    ))}
                    {data.education.length === 0 && <p className="text-slate-500">Add education to see it here.</p>}
                </section>
             );
        default:
            return null;
     }
}

const ModernTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  // Modern template has a fixed layout of sections in left/right columns.
  // We'll respect the user's order *within* those columns.
  const sectionOrder = data.sectionOrder || ['summary', 'experience', 'projects', 'education', 'skills'];
  
  const rightColumnKeys: SectionKey[] = ['summary', 'experience', 'projects'];
  const leftColumnKeys: SectionKey[] = ['skills', 'education'];
  
  const orderedRight = sectionOrder.filter(k => rightColumnKeys.includes(k));
  const orderedLeft = sectionOrder.filter(k => leftColumnKeys.includes(k));

  return (
    <div className="bg-white p-8 font-sans text-slate-800 shadow-lg print:shadow-none">
      <div className="grid grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="col-span-1 pr-8 border-r border-slate-200">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary-700">{data.personalInfo.name || 'Your Name'}</h1>
            <h2 className="text-lg font-medium text-slate-600">{data.personalInfo.title || 'Professional Title'}</h2>
          </header>
          <section>
            <LeftColumnHeader>Contact</LeftColumnHeader>
            <ul className="space-y-2 text-sm break-all">
              <li>{data.personalInfo.phone || 'Phone'}</li>
              <li>{data.personalInfo.email || 'Email'}</li>
              {data.personalInfo.linkedin && <li>{data.personalInfo.linkedin}</li>}
              {data.personalInfo.website && <li>{data.personalInfo.website}</li>}
            </ul>
          </section>

          {orderedLeft.map(key => renderLeftColumnSection(key, data))}
          
        </div>
        
        {/* Right Column */}
        <div className="col-span-2">
          {orderedRight.map(key => renderRightColumnSection(key, data))}
        </div>
      </div>
    </div>
  );
};

export default ModernTemplate;
