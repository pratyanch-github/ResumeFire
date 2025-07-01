import React from 'react';
import { ResumeData, SectionKey } from '../../types';

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-2xl font-bold border-b border-slate-200 pb-1 mb-3">{children}</h3>
);

const renderSection = (key: SectionKey, data: ResumeData) => {
    switch(key) {
        case 'summary':
            return (
                <section key="summary" className="mb-6">
                    <SectionHeader>Summary</SectionHeader>
                    <p className="text-slate-700 leading-relaxed">{data.summary || 'A brief professional summary about you.'}</p>
                </section>
            );
        case 'experience':
            return (
                <section key="experience" className="mb-6">
                    <SectionHeader>Experience</SectionHeader>
                    {data.experience.map((exp) => (
                      <div key={exp.id} className="mb-4">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-lg font-semibold">{exp.jobTitle || 'Job Title'}</h4>
                          <p className="text-sm text-slate-600">{exp.startDate} - {exp.endDate}</p>
                        </div>
                        <h5 className="font-medium text-slate-700 mb-1">{exp.company || 'Company Name'}</h5>
                        <p className="text-slate-700 whitespace-pre-line text-sm">{exp.description || 'Description of your role and accomplishments.'}</p>
                      </div>
                    ))}
                    {data.experience.length === 0 && <p className="text-slate-500">Add work experience to see it here.</p>}
                </section>
            );
        case 'projects':
             return (
                <section key="projects" className="mb-6">
                    <SectionHeader>Projects</SectionHeader>
                    {data.projects.map((proj) => (
                      <div key={proj.id} className="mb-4">
                        <h4 className="text-lg font-semibold">{proj.name || 'Project Name'}</h4>
                        <p className="text-slate-700 whitespace-pre-line text-sm mb-1">{proj.description || 'Project description.'}</p>
                        <div className="flex space-x-4 text-sm">
                            {proj.liveLink && <a href={proj.liveLink} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Live Demo</a>}
                            {proj.repoLink && <a href={proj.repoLink} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Code Repository</a>}
                        </div>
                      </div>
                    ))}
                    {data.projects.length === 0 && <p className="text-slate-500">Add projects to see them here.</p>}
                </section>
            );
        case 'education':
            return (
                <section key="education" className="mb-6">
                    <SectionHeader>Education</SectionHeader>
                    {data.education.map((edu) => (
                      <div key={edu.id} className="mb-3">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-lg font-semibold">{edu.institution || 'Institution'}</h4>
                          <p className="text-sm text-slate-600">{edu.startDate} - {edu.endDate}</p>
                        </div>
                        <p className="text-slate-700">{edu.degree || 'Degree'}</p>
                      </div>
                    ))}
                     {data.education.length === 0 && <p className="text-slate-500">Add your education to see it here.</p>}
                </section>
            );
        case 'skills':
            return (
                <section key="skills">
                    <SectionHeader>Skills</SectionHeader>
                    <p className="text-slate-700">{data.skills.join(', ') || 'List your skills'}</p>
                </section>
            );
        default:
            return null;
    }
}

const ClassicTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const sectionOrder = data.sectionOrder || ['summary', 'experience', 'projects', 'education', 'skills'];

  return (
    <div className="bg-white p-10 font-serif text-slate-900 shadow-lg print:shadow-none">
      <header className="text-center border-b-2 border-slate-300 pb-4 mb-6">
        <h1 className="text-5xl font-bold tracking-tight">{data.personalInfo.name || 'Your Name'}</h1>
        <h2 className="text-xl font-light text-slate-700 mt-1">{data.personalInfo.title || 'Professional Title'}</h2>
        <div className="flex justify-center flex-wrap gap-x-4 text-sm mt-3 text-slate-600">
          <span>{data.personalInfo.phone || 'Phone'}</span>
          <span className="text-slate-400">&bull;</span>
          <span>{data.personalInfo.email || 'Email'}</span>
          {data.personalInfo.linkedin && (
            <>
              <span className="text-slate-400">&bull;</span>
              <span>{data.personalInfo.linkedin}</span>
            </>
          )}
           {data.personalInfo.website && (
            <>
              <span className="text-slate-400">&bull;</span>
              <span>{data.personalInfo.website}</span>
            </>
          )}
        </div>
      </header>
      
      {sectionOrder.map(key => renderSection(key, data))}

    </div>
  );
};

export default ClassicTemplate;
