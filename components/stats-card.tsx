"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  icon?: LucideIcon
  value: string
  label: string
  color?: "teal" | "blue" | "coral" | "amber"
}

const colorClasses = {
  teal: "bg-primary/15 text-sidebar-accent-foreground",
  blue: "bg-blue-50 text-blue-700",
  coral: "bg-rose-50 text-rose-700",
  amber: "bg-sidebar-accent text-sidebar-accent-foreground",
}

export function StatsCard({ icon: Icon, value, label, color = "teal" }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className={`flex flex-col items-center justify-center rounded-[20px] p-8 ${colorClasses[color]}`}
    >
      {Icon && <Icon className="mb-3 h-8 w-8" />}
      <span className="text-3xl font-bold md:text-4xl">{value}</span>
      <span className="mt-2 text-sm font-medium opacity-80">{label}</span>
    </motion.div>
  )
}
