let model: any = null
let tokenizer: any = null

async function load() {
  if (!model) {
    const { AutoTokenizer, AutoModelForSequenceClassification } = await import('@huggingface/transformers')
    tokenizer = await AutoTokenizer.from_pretrained('Xenova/ms-marco-MiniLM-L-4-v2')
    model = await AutoModelForSequenceClassification.from_pretrained('Xenova/ms-marco-MiniLM-L-4-v2')
  }
  return { model, tokenizer }
}

export async function rerank<T extends { content: string }>(
  query: string,
  items: T[],
  topK: number,
): Promise<T[]> {
  if (!items.length || items.length <= topK) return items

  try {
    const { model, tokenizer } = await load()
    const features = await tokenizer(
      items.map(() => query),
      { text_pair: items.map(i => i.content), padding: true, truncation: true },
    )
    const outputs = await model(features)
    const logits = outputs.logits.data as Float32Array
    const scored = items.map((item, i) => ({ item, score: logits[i] }))
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, topK).map(s => s.item)
  } catch (err) {
    console.error('[Reranker] Failed, falling back to vector-only:', err)
    return items.slice(0, topK)
  }
}
