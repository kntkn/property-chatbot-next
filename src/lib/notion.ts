// Notion API連携モジュール

interface NotionProperty {
  id: string;
  物件名: string | null;
  都道府県: string | null;
  市区町村: string | null;
  町名番地: string | null;
  販売価格: number | null;
  土地面積㎡: number | null;
  建物面積㎡: number | null;
  築年月: string | null;
  構造: string | null;
  用途地域: string | null;
  都市計画: string | null;
  アクセス: string | null;
  物件の状態: string | null;
  建ぺい率容積率: string | null;
}

export async function fetchProperties(): Promise<NotionProperty[]> {
  const response = await fetch(
    `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({}),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch properties from Notion');
  }

  const data = await response.json();
  return data.results.map(parseProperty);
}

function parseProperty(item: any): NotionProperty {
  const props = item.properties || {};

  return {
    id: item.id,
    物件名: getTitle(props['物件名']),
    都道府県: getSelect(props['都道府県']),
    市区町村: getRichText(props['市区町村']),
    町名番地: getRichText(props['町名番地']),
    販売価格: getNumber(props['販売価格']),
    土地面積㎡: getNumber(props['土地面積㎡']),
    建物面積㎡: getNumber(props['建物面積㎡']),
    築年月: getDate(props['築年月']),
    構造: getSelect(props['構造']),
    用途地域: getSelect(props['用途地域']),
    都市計画: getSelect(props['都市計画']),
    アクセス: getRichText(props['アクセス']),
    物件の状態: getSelect(props['物件の状態']),
    建ぺい率容積率: getRichText(props['建ぺい率/容積率']),
  };
}

function getTitle(prop: any): string | null {
  return prop?.title?.[0]?.plain_text || null;
}

function getRichText(prop: any): string | null {
  return prop?.rich_text?.[0]?.plain_text || null;
}

function getSelect(prop: any): string | null {
  return prop?.select?.name || null;
}

function getNumber(prop: any): number | null {
  return prop?.number ?? null;
}

function getDate(prop: any): string | null {
  return prop?.date?.start || null;
}

export function formatPropertiesForLLM(properties: NotionProperty[]): string {
  if (!properties.length) return '物件データがありません。';

  const lines = ['【登録物件一覧】\n'];

  properties.forEach((prop, i) => {
    lines.push(`--- 物件${i + 1}: ${prop.物件名 || '名称未設定'} ---`);

    const location = [prop.都道府県, prop.市区町村, prop.町名番地].filter(Boolean).join('');
    if (location) lines.push(`所在地: ${location}`);

    if (prop.販売価格) {
      const price = prop.販売価格;
      const priceStr = price >= 100000000
        ? `${(price / 100000000).toFixed(1)}億円`
        : `${Math.round(price / 10000)}万円`;
      lines.push(`販売価格: ${priceStr}`);
    } else {
      lines.push('販売価格: 相談');
    }

    if (prop.土地面積㎡) lines.push(`土地面積: ${prop.土地面積㎡.toFixed(2)}㎡`);
    if (prop.建物面積㎡) lines.push(`建物面積: ${prop.建物面積㎡.toFixed(2)}㎡`);
    if (prop.築年月) lines.push(`築年月: ${prop.築年月}`);
    if (prop.構造) lines.push(`構造: ${prop.構造}`);
    if (prop.用途地域) lines.push(`用途地域: ${prop.用途地域}`);
    if (prop.都市計画) lines.push(`都市計画: ${prop.都市計画}`);
    if (prop.アクセス) lines.push(`アクセス: ${prop.アクセス}`);
    if (prop.物件の状態) lines.push(`状態: ${prop.物件の状態}`);

    lines.push('');
  });

  return lines.join('\n');
}
