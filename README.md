# job_crm_api

Job Application CRM API built with NestJS, TypeScript, Prisma, and PostgreSQL.

## Stack
- NestJS + GraphQL (Apollo)
- Prisma ORM
- PostgreSQL (Docker)
- JWT auth + basic RBAC

## List of APIs to Test

GraphQL APIs To Test
Base URL: http://localhost:3000/graphql
Health: GET http://localhost:3000/health

Use header for protected APIs:

{ "Authorization": "Bearer <accessToken>" }

1) Signup
mutation Signup($input: SignupInput!) {
  signup(input: $input) {
    accessToken
  }
}
Variables:

{
  "input": {
    "email": "user1@test.com",
    "password": "password123",
    "name": "User One"
  }
}

2) Login
mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
  }
}
Variables:

{
  "input": {
    "email": "user1@test.com",
    "password": "password123"
  }
}

3) Me
query Me {
  me {
    userId
    email
  }
}

4) Create Company
mutation CreateCompany($input: CreateCompanyInput!) {
  createCompany(input: $input) {
    id
    name
    website
    createdAt
  }
}
Variables:

{
  "input": {
    "name": "Acme Inc",
    "website": "https://acme.com"
  }
}

5) List Companies
query Companies {
  companies {
    id
    name
    website
    createdAt
  }
}

6) Create Job
mutation CreateJob($input: CreateJobInput!) {
  createJob(input: $input) {
    id
    title
    description
    location
    createdAt
    company {
      id
      name
    }
  }
}
Variables:

{
  "input": {
    "companyId": "PASTE_COMPANY_ID",
    "title": "Backend Engineer",
    "description": "Node + GraphQL",
    "location": "Remote"
  }
}

7) List Jobs
query Jobs($companyId: ID) {
  jobs(companyId: $companyId) {
    id
    title
    description
    location
    createdAt
    company {
      id
      name
    }
  }
}
Variables (optional):

{
  "companyId": "PASTE_COMPANY_ID"
}

8) Create Application
mutation CreateApplication($input: CreateApplicationInput!) {
  createApplication(input: $input) {
    id
    status
    sourceUrl
    appliedAt
    createdAt
    updatedAt
    job {
      id
      title
    }
    notes {
      id
      body
      createdAt
    }
  }
}
Variables:

{
  "input": {
    "jobId": "PASTE_JOB_ID",
    "sourceUrl": "https://example.com/job"
  }
}

9) Get Application by ID
query Application($id: ID!) {
  application(id: $id) {
    id
    status
    sourceUrl
    appliedAt
    createdAt
    updatedAt
    job {
      id
      title
      company {
        id
        name
      }
    }
    notes {
      id
      body
      createdAt
    }
  }
}
Variables:

{
  "id": "PASTE_APPLICATION_ID"
}


10) Applications Connection (Cursor Pagination + Filter)
query ApplicationsConnection($first: Int!, $after: String, $filter: ApplicationsFilterInput) {
  applicationsConnection(first: $first, after: $after, filter: $filter) {
    edges {
      cursor
      node {
        id
        status
        sourceUrl
        createdAt
        job {
          id
          title
          company {
            id
            name
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
Variables:

{
  "first": 10,
  "after": null,
  "filter": {
    "statuses": ["APPLIED", "RECRUITER_SCREEN"],
    "search": "backend"
  }
}
