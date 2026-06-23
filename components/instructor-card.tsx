"use client"

import Image from "next/image"
import { Star } from "lucide-react"
import { motion } from "framer-motion"

interface InstructorCardProps {
  name: string
  title: string
  image: string
  rating?: number
  students?: number
  courses?: number
}

export function InstructorCard({
  name,
  title,
  image,
  rating,
  students,
  courses,
}: InstructorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="group rounded-[20px] bg-card p-6 shadow-sm transition-all hover:shadow-lg"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full ring-4 ring-primary/10">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-110"
          />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{title}</p>
        
        <div className="flex items-center gap-6 text-sm">
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{rating}</span>
            </div>
          )}
          {students && (
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">{students.toLocaleString()}</span> students
            </div>
          )}
          {courses && (
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">{courses}</span> courses
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
