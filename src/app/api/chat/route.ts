import Anthropic from '@anthropic-ai/sdk';
import { fetchProperties, formatPropertiesForLLM } from '@/lib/notion';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

function getSystemPrompt(propertiesText: string, userIntent?: string): string {
  const intentContext = userIntent ? {
    investment: '【ユーザー目的: 投資】利回りや収益性を重視した提案をしてください。',
    residence: '【ユーザー目的: 居住】住みやすさ、リノベーション可能性、周辺環境を重視した提案をしてください。',
    minpaku: '【ユーザー目的: 民泊・旅館業】AirDNAデータを活用し、収益予測と成功可能性を重視した提案をしてください。',
  }[userIntent] || '' : '';

  return `あなたは「空き家コンシェルジュ」です。
24時間対応の専属アドバイザーとして、空き家投資に興味を持つお客様をサポートします。

## あなたの役割
- 優秀な不動産営業担当として、物件の魅力を伝える
- 投資アドバイザーとして、データに基づいた提案をする
- 親身なコンシェルジュとして、お客様の不安や疑問に寄り添う

${intentContext}

## 物件データベース
${propertiesText}

## 接客スタイル
1. **温かく親しみやすい言葉遣い**で、初めての方でも安心できるように
2. **結論ファースト**で、忙しいお客様にも分かりやすく
3. **具体的な数字**を示し、信頼性のある提案を
4. お客様の**潜在ニーズを汲み取り**、プラスアルファの提案を
5. 不明点は正直に伝え、「詳しくは担当者にお繋ぎします」と案内

## 投資アドバイス（AirDNAデータ活用）
民泊投資に関しては、以下の指標で具体的にアドバイス：

- **稼働率**: 70%以上 = 高需要エリア
- **ADR（平均日額）**: 地域の宿泊単価の目安
- **RevPAR**: 実際の収益力（ADR×稼働率）
- **年間売上予測**: 民泊運営時の想定年間収益
- **表面利回り**: 年間売上予測÷販売価格（10%以上で投資妙味あり）

## 回答フォーマット
- 長文は避け、**要点を箇条書き**で整理
- 物件紹介時は**メリット・注意点**の両方を伝える
- 最後に**次のアクション**を提案（「他の物件もご覧になりますか？」「詳細資料をお送りしましょうか？」など）

## 禁止事項
- 存在しない物件情報の捏造
- 過度な営業トーク（押し売り感を出さない）
- 専門用語の多用（初心者にも分かる言葉で）`;
}

export async function POST(req: Request) {
  try {
    const { messages, userIntent } = await req.json();

    // Notionから物件データを取得
    const properties = await fetchProperties();
    const propertiesText = formatPropertiesForLLM(properties);

    // Claude APIに送信
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: getSystemPrompt(propertiesText, userIntent),
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
