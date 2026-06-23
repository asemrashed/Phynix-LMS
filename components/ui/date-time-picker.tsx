'use client'

import * as React from 'react'
import { format, startOfDay } from 'date-fns'
import { CalendarIcon, Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, '0'),
)
const MINUTES = ['00', '15', '30', '45']

export interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  fromDate?: Date
  toDate?: Date
  invalid?: boolean
}

function applyTime(date: Date, hour: string, minute: string): Date {
  const next = new Date(date)
  next.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0)
  return next
}

function dayStart(date: Date): Date {
  return startOfDay(date)
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick date & time',
  disabled = false,
  className,
  id,
  fromDate,
  toDate,
  invalid = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [hour, setHour] = React.useState(
    value ? format(value, 'HH') : '09',
  )
  const [minute, setMinute] = React.useState(
    value ? format(value, 'mm') : '00',
  )

  React.useEffect(() => {
    if (value) {
      setHour(format(value, 'HH'))
      setMinute(format(value, 'mm'))
    }
  }, [value])

  const defaultBaseDate = React.useMemo(
    () => dayStart(fromDate ?? new Date()),
    [fromDate],
  )

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange?.(undefined)
      return
    }
    onChange?.(applyTime(date, hour, minute))
  }

  const handleTimeChange = (newHour: string, newMinute: string) => {
    setHour(newHour)
    setMinute(newMinute)
    const base = value ?? defaultBaseDate
    onChange?.(applyTime(base, newHour, newMinute))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(
            'w-full justify-start rounded-xl text-left font-normal',
            !value && 'text-muted-foreground',
            invalid && 'border-destructive',
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {value ? (
            format(value, 'PPP p')
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          disabled={(date) => {
            if (fromDate && dayStart(date) < dayStart(fromDate)) return true
            if (toDate && dayStart(date) > dayStart(toDate)) return true
            return false
          }}
          initialFocus
        />
        <div className="flex items-center gap-2 border-t p-3">
          <Clock className="size-4 text-muted-foreground" />
          <Select
            value={hour}
            onValueChange={(h) => handleTimeChange(h, minute)}
          >
            <SelectTrigger className="w-[72px]">
              <SelectValue placeholder="HH" />
            </SelectTrigger>
            <SelectContent>
              {HOURS.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">:</span>
          <Select
            value={minute}
            onValueChange={(m) => handleTimeChange(hour, m)}
          >
            <SelectTrigger className="w-[72px]">
              <SelectValue placeholder="mm" />
            </SelectTrigger>
            <SelectContent>
              {MINUTES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}
