'use server';

import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

export async function improveUMLAction({
  currentUML,
  userMessage,
  diagramType,
  originalStory,
}: {
  currentUML: string;
  userMessage: string;
  diagramType: string;
  originalStory: string;
}) {
  const prompt = `
You are a senior software engineer and UML assistant.

TASK:
- If the user is asking a question, answer it clearly based on the diagram and story.
- If the user is asking for a change, apply it to the diagram.
- In either case, explain what was done, then return a valid PlantUML diagram if updated.

ORIGINAL SYSTEM DESCRIPTION:
"${originalStory}"

CURRENT UML CODE:
@startuml
${currentUML}
@enduml

USER REQUEST:
"${userMessage}"

Your response must contain:
1. A brief explanation of what was changed or an answer to the question.
2. The updated UML diagram in a \`\`\`plantuml\`\`\` code block if applicable.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = completion.choices?.[0]?.message?.content ?? '';

    console.log('🧠 OpenAI Response:', responseText);

    const umlCode = extractPlantUMLCode(responseText);

    const explanation = responseText
      .replace(/```plantuml[\s\S]*?```/gi, '') // remove plantuml block
      .replace(/```[\s\S]*?```/gi, '')         // remove other code blocks
      .trim();

    return {
      uml: umlCode,
      rawText: explanation || 'No explanation provided.',
    };
  } catch (error) {
    console.error('❌ Error improving UML:', error);
    return null;
  }
}

// Extract UML block content between ```plantuml ... ```
function extractPlantUMLCode(responseText: string): string | null {
  const plantUMLRegex = /```plantuml([\s\S]*?)```/i;
  const match = responseText.match(plantUMLRegex);

  if (match && match[1]) return match[1].trim();

  // fallback: match @startuml ... @enduml
  const fallbackRegex = /@startuml([\s\S]*?)@enduml/i;
  const fallbackMatch = responseText.match(fallbackRegex);

  if (fallbackMatch) {
    return `@startuml\n${fallbackMatch[1].trim()}\n@enduml`;
  }

  return null;
}
