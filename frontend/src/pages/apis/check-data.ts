export type ApiCheck = {
  id: number
  apiId: number
  status: "UP" | "DOWN" | "DEGRADED"
  statusCode: number | null
  responseTime: number | null
  checkedAt: string
}

export const initialChecks: ApiCheck[] = [
  {
    id: 1,
    apiId: 1,
    status: "UP",
    statusCode: 200,
    responseTime: 124,
    checkedAt: "14:20",
  },
  {
    id: 2,
    apiId: 1,
    status: "UP",
    statusCode: 200,
    responseTime: 118,
    checkedAt: "14:15",
  },
  {
    id: 3,
    apiId: 1,
    status: "UP",
    statusCode: 200,
    responseTime: 131,
    checkedAt: "14:10",
  },
  {
    id: 4,
    apiId: 1,
    status: "DOWN",
    statusCode: 500,
    responseTime: null,
    checkedAt: "14:05",
  },
  {
    id: 5,
    apiId: 1,
    status: "UP",
    statusCode: 200,
    responseTime: 109,
    checkedAt: "14:00",
  },
  {
    id: 6,
    apiId: 1,
    status: "UP",
    statusCode: 200,
    responseTime: 115,
    checkedAt: "13:55",
  },
]