"use client"

import Image from "next/image"
import { Star, Quote } from "lucide-react"
import { motion } from "framer-motion"

interface ReviewCardProps {
  name: string
  image: string
  rating: number
  review: string
  date?: string
  course?: string
}

export function ReviewCard({
  name,
  image,
  rating,
  review,
  date,
  course,
}: ReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="rounded-[20px] bg-card p-6 shadow-sm"
    >
      <Quote className="mb-4 h-8 w-8 text-primary/20" />
      
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        {review}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{name}</h4>
            {course && (
              <p className="text-xs text-muted-foreground">{course}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < rating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
          {date && (
            <span className="mt-1 text-xs text-muted-foreground">{date}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
