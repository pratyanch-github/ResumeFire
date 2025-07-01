import { GoogleGenAI } from "@google/genai";
import { ResumeData, SectionKey, WorkExperience } from "../types";

// const API_KEY = process.env.API_KEY;
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this project, we'll proceed and expect it to be set in the environment.
  console.warn(
    "API_KEY environment variable not set. Gemini API calls will fail."
  );
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateAISummary = async (
  title: string,
  experience: WorkExperience[],
  skills: string[]
): Promise<string> => {
  if (!API_KEY) {
    return "AI features are currently unavailable. Please configure the API Key.";
  }

  const experienceText = experience
    .map((exp) => `- ${exp.jobTitle} at ${exp.company}: ${exp.description}`)
    .join("\n");

  const prompt = `
    Based on the following information, write a compelling and professional resume summary of 2-3 sentences.
    The summary should be from a first-person perspective.

    **Target Role:** ${title}

    **Key Skills:** ${skills.join(", ")}

    **Work Experience:**
    ${experienceText}

    Generate only the summary text, without any introductory phrases like "Here is the summary:".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return "There was an error generating the summary. Please try again.";
  }
};

export const generateModifiedResume = async (
  jobDescription: string,
  resumeData: ResumeData,
  modificationDegree: number, // 1-10
  excludedSections: SectionKey[]
): Promise<ResumeData> => {
  if (!API_KEY) {
    throw new Error(
      "AI features are currently unavailable. Please configure the API Key."
    );
  }

  // Create a copy of the resume data to avoid modifying the original object
  const resumeDataForPrompt = JSON.parse(JSON.stringify(resumeData));
  // Remove sections that should be excluded from the data sent to the model
  excludedSections.forEach((section) => {
    if (resumeDataForPrompt.hasOwnProperty(section)) {
      // For arrays, we clear them. For summary (string), we clear it.
      if (Array.isArray(resumeDataForPrompt[section])) {
        resumeDataForPrompt[section] = [];
      } else {
        resumeDataForPrompt[section] = "";
      }
    }
  });

  const degreeDescription =
    modificationDegree <= 3
      ? "Make subtle changes. Focus on rephrasing existing content to use keywords from the job description. Do not invent new skills or experiences. Preserve the original tone and details."
      : modificationDegree <= 7
      ? "Significantly rewrite content to highlight relevant achievements. Reorder bullet points for impact. Adjust the summary to directly address the role. You can infer closely related skills but do not add completely new ones."
      : "Rewrite the resume heavily to align with the job description. You have creative freedom to extrapolate from the user's experience and present it in the most favorable way. The output should strongly reflect the requirements of the job description.";

  const prompt = `
        You are an expert resume writer. Your task is to tailor a user's resume for a specific job description.
        You will be given the user's current resume data in JSON format, a job description, a list of sections to IGNORE, and a modification degree from 1 (subtle) to 10 (aggressive).

        **Job Description:**
        ---
        ${jobDescription}
        ---

        **Modification Degree:** ${modificationDegree}/10
        **Instruction:** ${degreeDescription}

        **User's Current Resume (JSON):**
        ---
        ${JSON.stringify(resumeDataForPrompt, null, 2)}
        ---

        **Instructions for output:**
        1.  Modify the user's resume data based on ALL the instructions.
        2.  The sections to modify are: 'summary', 'experience', 'projects', 'skills'.
        3.  The following sections MUST NOT be changed: ${
          excludedSections.join(", ") || "None"
        }.
        4.  Return the COMPLETE, MODIFIED resume data as a single, valid JSON object.
        5.  The JSON object must conform to the structure of the input resume data.
        6.  Do NOT wrap the JSON in markdown fences like \`\`\`json.
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const textResponse = response.text;
    let jsonStr = textResponse.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const modifiedData = JSON.parse(jsonStr);

    // Merge back the excluded sections from the original data
    excludedSections.forEach((section) => {
      modifiedData[section] = resumeData[section];
    });

    // Ensure critical fields from original data are preserved
    modifiedData.versionId = resumeData.versionId;
    modifiedData.createdAt = resumeData.createdAt;
    modifiedData.userId = resumeData.userId;
    modifiedData.username = resumeData.username;
    modifiedData.templateId = resumeData.templateId;
    modifiedData.isPublished = resumeData.isPublished;
    modifiedData.personalInfo = resumeData.personalInfo;
    modifiedData.sectionOrder = resumeData.sectionOrder;

    return modifiedData as ResumeData;
  } catch (error) {
    console.error("Error generating modified resume:", error);
    throw new Error(
      "There was an error generating the modified resume. The AI may have returned an invalid format. Please try again."
    );
  }
};
