import Anthropic from '@anthropic-ai/sdk';
import { fetchProperties, formatPropertiesForLLM } from '@/lib/notion';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

function getSystemPrompt(propertiesText: string): string {
  return `あなたは空き家・不動産の販売を支援する専門家アシスタントです。

以下の物件データベースを基に、ユーザーの質問に回答してください。

${propertiesText}

## 回答ルール
1. 物件データに基づいた正確な情報を提供してください
2. ユーザーの予算や条件に合った物件を提案してください
3. 物件の特徴やメリット・デメリットを分かりやすく説明してください
4. 投資物件の場合は、利回りや将来性についても考慮してください
5. データにない情報は「情報がありません」と正直に伝えてください
6. 複数の物件を比較する際は表形式で分かりやすく整理してください
7. 日本語で丁寧に回答してください
8. 回答は簡潔に、要点を押さえて`;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Notionから物件データを取得
    const properties = await fetchProperties();
    const propertiesText = formatPropertiesForLLM(properties);

    // Claude APIに送信
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: getSystemPrompt(propertiesText),
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';

    return Response.json({ message: text });
  } catch (error) {
    console.error('Chat API Error:', error);
    return Response.json(
      { error: 'エラーが発生しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}
