'use client'

import { useEffect, useState } from 'react'
import { PRODUCTS } from '@/lib/products'
import Image from 'next/image'

export default function AdminProductsPage() {
  const [images, setImages] = useState<Record<number, string>>({})
  const [saved, setSaved] = useState<Record<number, boolean>>({})

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/product-images')
      const data = await res.json()
      const map: Record<number, string> = {}
      for (const img of data.images || []) map[img.product_id] = img.image_url
      setImages(map)
    }
    load()
  }, [])

  async function handleSave(productId: number) {
    await fetch('/api/admin/product-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, image_url: images[productId] || '' }),
    })
    setSaved(prev => ({ ...prev, [productId]: true }))
    setTimeout(() => setSaved(prev => ({ ...prev, [productId]: false })), 2000)
  }

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-2">תמונות מוצרים</h1>
        <p className="text-text-secondary text-sm mb-8">הכנס URL של תמונה לכל מוצר. התמונות יופיעו בפופ-אפ המוצרים בצ'אט.</p>

        <div className="grid gap-4">
          {PRODUCTS.map(product => (
            <div key={product.id} className="bg-bg-card border border-bg-hover rounded-2xl p-4 flex items-center gap-4">
              {/* Preview */}
              <div className="w-16 h-16 rounded-xl bg-bg-hover overflow-hidden shrink-0 flex items-center justify-center">
                {images[product.id] ? (
                  <Image src={images[product.id]} alt={product.name} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                ) : (
                  <span className="text-2xl">📷</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-text-primary font-medium text-sm">{product.name}</span>
                  <span className="text-accent-green text-xs font-bold">₪{product.price}</span>
                </div>
                <input
                  type="url"
                  value={images[product.id] || ''}
                  onChange={e => setImages(prev => ({ ...prev, [product.id]: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-bg-secondary border border-bg-hover rounded-xl px-3 py-2 text-text-primary text-xs focus:outline-none focus:border-accent-purple transition-colors placeholder-text-muted"
                />
              </div>

              {/* Save */}
              <button
                onClick={() => handleSave(product.id)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${saved[product.id] ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30'}`}
              >
                {saved[product.id] ? '✓' : 'שמור'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
