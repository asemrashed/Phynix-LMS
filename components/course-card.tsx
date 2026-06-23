"use client"

import { AppImage } from "@/components/ui/app-image"
import Link from "next/link"
import { Clock, Users, ArrowRight, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { formatPrice } from "@/lib/money"
import { cn } from "@/lib/utils"
import { SaveButton } from "@/components/save-button"

interface CourseCardProps {
  id: string
  courseId?: string
  title: string
  image: string
  batch?: string
  seatsLeft?: number
  daysLeft?: number
  price?: number
  originalPrice?: number
  rating?: number
  students?: number
  duration?: string
  category?: string
  isLive?: boolean
  isFree?: boolean
  progress?: number
  isEnrolled?: boolean
  className?: string
}

export function CourseCard({
  id,
  courseId,
  title,
  image,
  batch,
  seatsLeft,
  daysLeft,
  price,
  originalPrice,
  rating,
  students,
  duration,
  category,
  isLive = false,
  isFree = false,
  progress,
  isEnrolled = false,
  className,
}: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={cn(
        "group overflow-hidden rounded-[20px] bg-card shadow-sm transition-all hover:shadow-lg",
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        <AppImage
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isLive && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            <span className="text-xs font-medium text-white">LIVE</span>
          </div>
        )}
        {isFree && (
          <Badge className="absolute right-3 top-3 bg-accent text-accent-foreground">
            Free
          </Badge>
        )}
        {courseId && (
          <div className="absolute bottom-3 right-3 z-10">
            <SaveButton entityType="COURSE" entityId={courseId} mode="bookmark" />
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Meta info */}
        {(batch || seatsLeft || daysLeft) && (
          <div className="mb-3 flex flex-wrap gap-2">
            {batch && (
              <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {batch}
              </span>
            )}
            {seatsLeft && (
              <span className="rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                {seatsLeft} seats left
              </span>
            )}
            {daysLeft && (
              <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {daysLeft} days left
              </span>
            )}
          </div>
        )}

        {/* Category */}
        {category && (
          <p className="mb-1 text-xs font-medium text-muted-foreground">{category}</p>
        )}

        {/* Title */}
        <h3 className="mb-3 line-clamp-2 min-h-[48px] text-base font-semibold text-foreground">
          {title}
        </h3>

        {/* Stats */}
        {(rating || students || duration) && (
          <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
            {rating && (
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{rating}</span>
              </div>
            )}
            {students && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{students.toLocaleString()}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{duration}</span>
              </div>
            )}
          </div>
        )}

        {/* Price */}
        {price !== undefined && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {isFree ? "Free" : formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        )}

        {isEnrolled && progress !== undefined && (
          <div className="mb-4 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* CTA */}
        <Link href={isEnrolled ? `/dashboard/courses/${id}` : `/courses/${id}`}>
          <Button
            variant="outline"
            className="w-full rounded-xl border-border bg-muted/50 transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            {isEnrolled ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </>
            ) : (
              <>
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
