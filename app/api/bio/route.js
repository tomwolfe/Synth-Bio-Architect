import { runBioTask } from '../../lib/sandbox';

export async function POST(request) {
  try {
    const { task, data } = await request.json();
    
    if (!task || !data) {
      return new Response(JSON.stringify({ error: 'Missing task or data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await runBioTask(task, data);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Bio API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
