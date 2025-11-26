import Anthropic from '@anthropic-ai/sdk';
import { fetchProperties, formatPropertiesForLLM } from '@/lib/notion';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

function getSystemPrompt(propertiesText: string): string {
  return `あなたは空き家・不動産の販売を支援する専門家アシスタントです。
特に民泊・旅館業への投資に詳しく、データに基づいた投資アドバイスを行います。

以下の物件データベースを基に、ユーザーの質問に回答してください。

${propertiesText}

## 回答ルール
1. 物件データに基づいた正確な情報を提供してください
2. ユーザーの予算や条件に合った物件を提案してください
3. 物件の特徴やメリット・デメリットを分かりやすく説明してください
4. データにない情報は「情報がありません」と正直に伝えてください
5. 複数の物件を比較する際は表形式で分かりやすく整理してください
6. 日本語で丁寧に回答してください
7. 回答は簡潔に、要点を押さえて

## 投資アドバイス（重要）
AirDNAデータがある物件については、民泊投資の観点から積極的に分析・提案してください：

- **稼働率**: 地域の民泊需要の指標。70%以上なら高需要エリア
- **ADR（平均日額）**: 1泊あたりの平均収益。高いほど収益性が良い
- **RevPAR**: ADR×稼働率。実際の収益力を示す最重要指標
- **年間売上予測**: 民泊運営した場合の想定年間収益
- **リスティング数**: 競合物件数。多すぎると価格競争になりやすい

投資判断のポイント：
1. 年間売上予測 ÷ 販売価格 = 表面利回り（目安: 10%以上で投資妙味あり）
2. 稼働率が高く、リスティング数が少ないエリアは民泊の穴場
3. ADRが高いエリアは観光需要が旺盛
4. RevPARが高い物件は安定した収益が期待できる

投資の質問には、これらの指標を用いて具体的な数字で回答してください。`;
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
