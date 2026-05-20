// ─── Pipefy OAuth 2.0 Client-Credentials Service ────────────────────────────
// Docs: https://developers.pipefy.com/reference/authentication
//
// This service authenticates using OAuth 2.0 "client_credentials" grant type.
// Credentials live in .env.local and are NEVER exposed to the browser.

export interface PipefyCard {
  id: string;
  title: string;
  currentPhase: { id: string; name: string };
  fields: { name: string; value: string }[];
  assignees: { id: string; name: string; email: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface PipefyPhase {
  id: string;
  name: string;
  cards_count: number;
}

export interface PipefyFieldDef {
  id: string;
  label: string;
  type: string;
  options: string[];
  required: boolean;
  description: string;
}

export interface PipefyCardPhaseData {
  id: string;
  title: string;
  current_phase: {
    name: string;
    fields: PipefyFieldDef[];
  };
  fields: {
    name: string;
    value: string;
    field: { id: string };
  }[];
}

const PIPEFY_GRAPHQL = 'https://api.pipefy.com/graphql';
const PIPEFY_TOKEN_URL = process.env.PIPEFY_OAUTH_TOKEN_URL ?? 'https://app.pipefy.com/oauth/token';

// ── Token Cache ────────────────────────────────────────────────────────────
// Reuse tokens within their lifetime so we don't hammer the auth endpoint.
let _cachedToken: string | null = null;
let _tokenExpiresAt = 0; // unix ms

async function getAccessToken(): Promise<string> {
  if (_cachedToken && Date.now() < _tokenExpiresAt - 30_000) {
    return _cachedToken;
  }

  const clientId = process.env.PIPEFY_CLIENT_ID;
  const clientSecret = process.env.PIPEFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'PIPEFY_CLIENT_ID e PIPEFY_CLIENT_SECRET não configurados em .env.local'
    );
  }

  const res = await fetch(PIPEFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pipefy OAuth falhou: ${res.status} — ${body}`);
  }

  const json = await res.json() as { access_token: string; expires_in?: number };
  _cachedToken = json.access_token;
  // Default to 1 hour if expires_in is not provided
  _tokenExpiresAt = Date.now() + (json.expires_in ?? 3600) * 1000;

  return _cachedToken;
}

// ── GraphQL Helper ─────────────────────────────────────────────────────────
async function pipefyQuery(query: string, variables?: Record<string, unknown>) {
  const token = await getAccessToken();

  const res = await fetch(PIPEFY_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Pipefy GraphQL HTTP error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Pipefy GraphQL error: ${json.errors[0].message}`);
  }

  return json.data;
}

// ── Public Methods ─────────────────────────────────────────────────────────

/** Tests the OAuth connection — returns the pipe name. */
export async function testConnection(pipeId: string): Promise<string> {
  const query = `
    query TestPipe($pipeId: ID!) {
      pipe(id: $pipeId) { id name }
    }
  `;
  const data = await pipefyQuery(query, { pipeId });
  return data.pipe.name as string;
}

/** Lists all phases in a pipe with their card counts. */
export async function getPipePhases(pipeId: string): Promise<PipefyPhase[]> {
  const query = `
    query GetPhases($pipeId: ID!) {
      pipe(id: $pipeId) {
        phases { id name cards_count }
      }
    }
  `;
  const data = await pipefyQuery(query, { pipeId });
  return data.pipe.phases as PipefyPhase[];
}

/** Lists all cards of a pipe by paginating through all results. */
export async function getPipeCards(pipeId: string): Promise<PipefyCard[]> {
  const query = `
    query GetAllCards($pipeId: ID!, $after: String) {
      allCards(pipeId: $pipeId, first: 50, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            current_phase { id name }
            fields { name value }
            assignees { id name email }
            created_at
            updated_at
          }
        }
      }
    }
  `;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allEdges: any[] = [];
  let hasNextPage = true;
  let afterCursor: string | null = null;

  while (hasNextPage) {
    const data = await pipefyQuery(query, { pipeId, after: afterCursor });
    const connection = data.allCards;
    
    allEdges = allEdges.concat(connection.edges);
    hasNextPage = connection.pageInfo.hasNextPage;
    afterCursor = connection.pageInfo.endCursor;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return allEdges.map((e: any) => ({
    id: e.node.id,
    title: e.node.title,
    currentPhase: e.node.current_phase,
    fields: e.node.fields,
    assignees: e.node.assignees,
    createdAt: e.node.created_at,
    updatedAt: e.node.updated_at,
  }));
}

/** Moves a card to a different phase. */
export async function moveCardToPhase(cardId: string, destinationPhaseId: string) {
  const query = `
    mutation MoveCard($cardId: ID!, $destinationPhaseId: ID!) {
      moveCardToPhase(input: { card_id: $cardId, destination_phase_id: $destinationPhaseId }) {
        card { id current_phase { id name } }
      }
    }
  `;
  const data = await pipefyQuery(query, { cardId, destinationPhaseId });
  return data.moveCardToPhase.card;
}

/** Fetches phase fields and current field values for a specific card */
export async function getCardPhaseFields(cardId: string): Promise<PipefyCardPhaseData> {
  const query = `
    query GetCardPhaseFields($cardId: ID!) {
      card(id: $cardId) {
        id
        title
        current_phase {
          name
          fields {
            id
            label
            type
            options
            required
            description
          }
        }
        fields {
          name
          value
          field {
            id
          }
        }
      }
    }
  `;
  const data = await pipefyQuery(query, { cardId });
  return data.card as PipefyCardPhaseData;
}

/** Updates a specific field value on a card */
export async function updateCardField(cardId: string, fieldId: string, newValue: string) {
  const query = `
    mutation UpdateCardField($cardId: ID!, $fieldId: ID!, $newValue: [String]) {
      updateCardField(input: { card_id: $cardId, field_id: $fieldId, new_value: $newValue }) {
        card {
          id
        }
      }
    }
  `;
  
  // O tipo do new_value no GraphQL do Pipefy costuma ser genérico ou String/List of Strings
  // Mas para valores simples, passar como string ou array de string depende do campo.
  // Vamos usar string genérica ou a tipagem correta de acordo com a documentação.
  // Na verdade a mutação no Pipefy aceita `new_value: AnyValue` se definido assim.
  // Como `AnyValue` não é GraphQL nativo mas sim scalar costumizado deles, a mutação exata é:
  const mutation = `
    mutation UpdateCardField($input: UpdateCardFieldInput!) {
      updateCardField(input: $input) {
        card { id }
      }
    }
  `;
  
  const data = await pipefyQuery(mutation, { 
    input: {
      card_id: cardId,
      field_id: fieldId,
      new_value: newValue
    }
  });
  
  return data.updateCardField.card;
}

/** Creates a new card in a pipe. */
export async function createPipeCard(pipeId: string, fields: { field_id: string; field_value: any }[]) {
  // Map field_value to value format expected by Pipefy GraphQL
  const mappedFields = fields.map(f => ({
    field_id: f.field_id,
    field_value: f.field_value
  }));

    const query = `
      mutation CreateCard($pipeId: ID!, $fields: [FieldValueInput]) {
        createCard(input: { pipe_id: $pipeId, fields_attributes: $fields }) {
          card { id title }
        }
      }
    `;
    const data = await pipefyQuery(query, { pipeId, fields: mappedFields });
    return data.createCard.card;
  }
  
  export interface FoundCardInfo {
    id: string;
    pipeId: string;
    name?: string;
    role?: string;
  }

  /** Searches for a card by email in the specified auth pipes (305896989, 305586959). */
  export async function findCardByEmail(email: string): Promise<FoundCardInfo | null> {
    const pipesToSearch = ['305896989', '305586959'];
    
    for (const pipeId of pipesToSearch) {
      // Fetch all cards from this pipe and check locally (more reliable to get fields)
      const cards = await getPipeCards(pipeId);
      for (const card of cards) {
        const hasEmail = card.fields.some(f => f.value && typeof f.value === 'string' && f.value.toLowerCase() === email.toLowerCase());
        
        if (hasEmail) {
          let name = "";
          let role = "";
          
          // Try to extract name
          const nameField = card.fields.find(f => f.name.toLowerCase().includes("nome"));
          if (nameField && typeof nameField.value === 'string') name = nameField.value;

          // Determine role
          if (pipeId === '305586959') {
            role = 'Coordenador';
          } else if (pipeId === '305896989') {
            const permField = card.fields.find(f => f.name.toLowerCase().includes("permiss"));
            if (permField && typeof permField.value === 'string') {
              if (permField.value.toLowerCase().includes("admin")) role = "Admin";
              else if (permField.value.toLowerCase().includes("colaborador")) role = "Diretor";
            }
          }

          return { id: card.id, pipeId, name, role };
        }
      }
    }
    
    return null;
  }
  
  /** Updates the 'senha' field in a card */
  export async function updatePasswordInCard(cardId: string, password: string) {
    return await updateCardField(cardId, 'senha', password);
  }

  /** Creates a new access request card in pipe 305896989 */
  export async function createAccessRequestCard(name: string, email: string, reason: string) {
    // start_form_fields from inspect_pipes: [nome_completo], [email_coordenador], [motivo_da_solicita_o]
    const fields = [
      { field_id: "nome_completo", field_value: name },
      { field_id: "email_coordenador", field_value: email },
      { field_id: "motivo_da_solicita_o", field_value: reason }
    ];
    return await createPipeCard('305896989', fields);
  }

