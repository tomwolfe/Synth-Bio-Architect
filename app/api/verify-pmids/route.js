import { verifyPMIDs } from '../../../lib/ncbi_verifier';

export async function POST(request) {
  try {
    const { pmids } = await request.json();
    
    if (!pmids || !Array.isArray(pmids)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid pmids' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await verifyPMIDs(pmids);
    return new Response(JSON.stringify({ results: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Verify PMIDs API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
