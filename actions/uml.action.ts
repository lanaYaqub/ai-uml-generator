'use server';
import { OpenAI } from 'openai';
import { diagramTemplates } from '@/constants';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateUMLAction(
  description: string,
  diagramType: string
): Promise<string | null> {
  const prompt = `
You are a senior software engineer specializing in UML design.
Generate a valid ${diagramType} diagram in raw PlantUML syntax based on the following system description:

"${description}"

Instructions:
- Only return plain PlantUML code. Do not use markdown formatting or wrap the code in triple backticks.
- Start with @startuml and end with @enduml.
- Use PlantUML keywords: 'class', '<|--' for inheritance, '-->' for associations, '*' for multiplicity.
- Include relevant class attributes and method stubs when they are clearly implied.
- Follow modern PlantUML best practices.
- Use logical assumptions where necessary to fill in missing details.
- Format code cleanly with indentation and spacing.

Reference syntax templates:
${JSON.stringify(diagramTemplates)}
  `;

  try {
    const result = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = result.choices[0].message.content || '';
    const umlCode = extractPlantUMLCode(responseText);

    if (!umlCode.includes('class')) {
      throw new Error('No class definitions found in the UML output.');
    }

    return umlCode;
  } catch (error) {
    console.error('Error generating UML:', error);
    throw error;
  }
}

function extractPlantUMLCode(responseText: string): string | null {
  // Normalize markdown formatting (if GPT mistakenly includes it)
  const codeBlockMatch = responseText.match(/```(?:plantuml)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    responseText = codeBlockMatch[1].trim();
  }

  // Ensure UML boundaries are present
  if (!responseText.includes('@startuml')) {
    responseText = `@startuml\n${responseText}`;
  }
  if (!responseText.includes('@enduml')) {
    responseText = `${responseText}\n@enduml`;
  }

  return responseText.trim();
}
