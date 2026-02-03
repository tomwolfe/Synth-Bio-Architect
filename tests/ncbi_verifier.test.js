import { describe, it, expect, vi } from 'vitest';
import { verifyPMIDs } from '../app/lib/ncbi_verifier';

global.fetch = vi.fn();

describe('ncbi_verifier', () => {
  it('should verify PMIDs via NCBI API', async () => {
    const mockResponse = {
      result: {
        "12345": { title: "Test Article", authors: [{ name: "Author A" }], pubdate: "2020", source: "Nature" },
        "uids": ["12345"]
      }
    };
    
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const results = await verifyPMIDs(['12345']);
    expect(results[0].valid).toBe(true);
    expect(results[0].title).toBe("Test Article");
  });

  it('should handle invalid PMIDs', async () => {
    const mockResponse = {
      result: {
        "999": { error: "not found" },
        "uids": ["999"]
      }
    };
    
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const results = await verifyPMIDs(['999']);
    expect(results[0].valid).toBe(false);
  });
});
