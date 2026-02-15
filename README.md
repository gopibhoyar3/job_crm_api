# job_crm_api

GraphQL-first Job Application CRM API built with NestJS, TypeScript, Prisma, and PostgreSQL.

## Stack
- NestJS + GraphQL (Apollo)
- Prisma ORM
- PostgreSQL (Docker)
- JWT auth + basic RBAC

## Run locally
```bash
npm install
docker run --name jobcrm-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=jobcrm -p 5432:5432 -d postgres:16
npx prisma migrate dev --name init
npm run start:dev
```

GraphQL endpoint: `http://localhost:3000/graphql`
Health endpoint: `http://localhost:3000/health`

## Core features
- Auth: `signup`, `login`, `me`
- Company: `companies`, `createCompany`
- Job: `jobs`, `createJob`
- Application: `application`, `applicationsConnection`, `createApplication`, `moveApplicationStatus`, `addNote`
- Cursor pagination + filtering for applications
- Activity log entries on key mutations
