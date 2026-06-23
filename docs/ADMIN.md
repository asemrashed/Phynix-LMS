# Admin User Guide

Login: `admin@fxprimeacademy.com` / `password123` (after `bun run db:seed`)

Demo student with sample certificate: `student@fxprime.test` / `password123`

URL: http://localhost:3000/admin

## Courses

- **Courses** — create/edit courses, sections, lessons (VIDEO, TEXT, QUIZ)
- Publish when ready; students see courses at `/courses`
- Upload thumbnails via the course editor

## Blog

- **Blog** — write posts with categories, scheduling, premium gating
- Scheduled drafts auto-publish via backend cron

## Site Content

- **Site Content** (`/admin/site`) — contact info, FAQ, static pages (About, Terms, Privacy), homepage sections, consultation type copy
- Changes appear on the public site after save (homepage may need refresh)

## Products

- **Digital products** — upload files, set price
- **Physical products** — images, stock, shipping via cart checkout

## Mentors & Live Sessions

- **Mentors** — assign instructor users, add availability slots, post-session notes on bookings
- **Sessions** — schedule live webinars; meeting auto-created when Zoom is configured
- **Course class** — link a session to a course; only enrolled students can register
- **Private sessions** — turn off “Public session” to hide from everyone except enrolled course students and registrants
- **Registrants** — on session edit page, view who registered and mark attendance manually
- Paste **Recording URL** after session ends for `/live` recordings tab
- Students receive registration confirmation + 24h/1h reminder emails

## Community

- **Community** (`/admin/community`) — review reports, hide/delete posts, pin announcements

## Users & Certificates

- **Users** — view profiles, manual enrollments, device reset
- **Certificates** — search, filter, paginate, export CSV, manual issue, regenerate PDF, revoke (email + notification), retry failed generations

## Tips

- Set `RESEND_API_KEY` for real transactional emails
- Set Zoom credentials in `backend/.env` for real meeting links
- Use Prisma Studio (`bun run db:studio`) for direct DB inspection
