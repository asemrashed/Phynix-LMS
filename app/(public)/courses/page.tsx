"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CourseCard } from "@/components/course-card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, Grid3X3 } from "lucide-react"
import { motion } from "framer-motion"
import type { CourseListItem } from "@fxprime/types"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { getMediaUrl } from "@/lib/media-url"
import { Badge } from "@/components/ui/badge"

function CoursesContent() {
  const searchParams = useSearchParams()
  const freeOnly = searchParams.get("free") === "true"

  const [courses, setCourses] = useState<CourseListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [level, setLevel] = useState<string>("all")
  const [sort, setSort] = useState<string>("newest")

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (level !== "all") params.set("level", level)
        if (sort !== "newest") params.set("sort", sort)
        if (freeOnly) params.set("free", "true")
        const query = params.toString() ? `?${params.toString()}` : ""
        const data = await api<{ courses: CourseListItem[]; total: number }>(
          `/courses${query}`
        )
        setCourses(data.courses)
      } catch (err) {
        console.error("Failed to load courses:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [level, sort, freeOnly])

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {freeOnly ? "Free IELTS Courses" : "IELTS Courses"}
          </h1>
          {freeOnly && <Badge className="rounded-full">Free</Badge>}
        </div>
        <p className="mt-2 text-muted-foreground">
          {freeOnly
            ? "Start learning IELTS at no cost — upgrade anytime for full access"
            : "Structured IELTS preparation in English"}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl bg-white pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-40 rounded-xl bg-white">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-40 rounded-xl bg-white">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn("h-80 animate-pulse rounded-[20px] bg-muted")} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[20px] bg-card p-12 text-center">
          <Grid3X3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No courses found</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CourseCard
                id={course.slug}
                courseId={course.id}
                title={course.title}
                image={
                  getMediaUrl(course.thumbnailUrl) ||
                  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop"
                }
                price={course.price}
                originalPrice={course.originalPrice ?? undefined}
                rating={course.averageRating}
                students={course.enrollmentCount}
                duration={`${Math.round(course.totalDuration / 3600)}h`}
                category={course.level}
                isFree={course.price === 0}
                progress={course.progress}
                isEnrolled={course.isEnrolled}
              />
            </motion.div>
          ))}
        </div>
      )}
    </main>
  )
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto px-4 py-8">
          <div className="h-64 animate-pulse rounded-[20px] bg-muted" />
        </main>
      }
    >
      <CoursesContent />
    </Suspense>
  )
}
