'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PRODUCTS } from '@/lib/products'
import Image from 'next/image'

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (productId: number) => void
  disabled?: boolean
}

export default function ProductsPopup({ open, onClose, onSelect, disabled }: Props) {
  const [images, setImages] = useState<Record<number, string>>({})

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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-full left-3 right-3 mb-2 bg-bg-card border border-bg-hover rounded-2xl p-3 shadow-2xl z-10"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-primary font-semibold text-sm">שלח מוצר</span>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary text-lg leading-none">×</button>
          </div>
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {PRODUCTS.map(product => (
              <button
                key={product.id}
                onClick={() => onSelect(product.id)}
                disabled={disabled}
                className="bg-bg-secondary hover:bg-bg-hover border border-bg-hover rounded-xl p-2 text-right transition-colors disabled:opacity-50"
              >
                <div className="w-full h-16 rounded-lg mb-1.5 overflow-hidden bg-bg-hover flex items-center justify-center">
                  {images[product.id] ? (
                    <Image src={images[product.id]} alt={product.name} width={80} height={64} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    <span className="text-xl">📷</span>
                  )}
                </div>
                <p className="text-text-primary text-xs font-medium leading-tight">{product.name}</p>
                <p className="text-accent-green text-xs font-bold">₪{product.price}</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
