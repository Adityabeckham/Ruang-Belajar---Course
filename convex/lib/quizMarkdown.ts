import yaml from 'js-yaml';

export interface QuizQuestion {
  id: string;
  questionMd: string;
  options: string[];
  correctIndex: number;
}

/**
 * Parses markdown containing a quiz block
 * Expects a block like:
 * ```quiz
 * - q: Apa fungsi tag `<h1>`?
 *   options: ["Membuat paragraf", "Heading utama", "Membuat link"]
 *   answer: 1
 * ```
 */
export function parseQuizMarkdown(markdown: string): { questions: QuizQuestion[] } {
  // Extract the content inside ```quiz ... ```
  const match = markdown.match(/```quiz\n([\s\S]*?)\n```/);
  if (!match) {
    return { questions: [] };
  }

  const quizYamlContent = match[1];
  try {
    const parsed = yaml.load(quizYamlContent) as any[];
    
    if (!Array.isArray(parsed)) {
      throw new Error("Quiz content must be an array of questions");
    }

    const questions: QuizQuestion[] = parsed.map((item, index) => {
      return {
        id: `q-${index}-${Date.now()}`,
        questionMd: item.q,
        options: item.options,
        correctIndex: item.answer,
      };
    });

    return { questions };
  } catch (error) {
    console.error("Failed to parse quiz markdown", error);
    return { questions: [] };
  }
}
