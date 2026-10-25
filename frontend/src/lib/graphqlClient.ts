import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql';

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

// The backend verifies a Cognito *access* token, so that is what we send.
export async function graphqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const { tokens } = await fetchAuthSession();
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens?.accessToken?.toString() ?? ''}`
    },
    body: JSON.stringify({ query, variables })
  });
  const body = (await response.json()) as GraphQLResponse<T>;
  if (body.errors?.length) throw new Error(body.errors[0].message);
  if (!response.ok || !body.data) throw new Error(`Request failed (${response.status})`);
  return body.data;
}
