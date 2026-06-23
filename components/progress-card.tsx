"use client"

import Link from "next/link"
import Image from "next/image"
import { Play, Clock, CheckCircle2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface ProgressCardProps {
  title: string
  image: string
  progress: number
  totalLessons: number
  completedLessons: number
  href: string
  nextLesson?: string
  lastAccessed?: string
}

export function ProgressCard({
  title,
  image,
  progress,
  totalLessons,
  completedLessons,
  href,
  nextLesson,
  lastAccessed,
}: ProgressCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="group overflow-hidden rounded-[20px] bg-card shadow-sm transition-all hover:shadow-lg"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative aspect-video w-full sm:aspect-square sm:w-48">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex-1">
            <h3 className="mb-2 font-semibold text-foreground line-clamp-2">
              {title}
            </h3>
            
            {/* Progress */}
            <div className="mb-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {completedLessons}/{totalLessons} lessons
                </span>
                <span className="font-medium text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {nextLesson && (
                <div className="flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  <span>Next: {nextLesson}</span>
                </div>
              )}
              {lastAccessed && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{lastAccessed}</span>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-4">
            <Link href={href}>
              <Button className="w-full rounded-xl sm:w-auto">
                {progress > 0 ? "Continue Learning" : "Start Learning"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
