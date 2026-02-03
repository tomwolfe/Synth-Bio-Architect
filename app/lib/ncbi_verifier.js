/**
 * Verifies PubMed IDs using NCBI E-utilities.
 * @param {string[]} pmids - Array of PubMed IDs to verify.
 * @returns {Promise<Object[]>} - Array of verification results.
 */
export async function verifyPMIDs(pmids) {
  if (!pmids || pmids.length === 0) return [];

  const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
  const ids = pmids.join(',');
  const url = `${baseUrl}?db=pubmed&id=${ids}&retmode=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NCBI API returned status ${response.status}`);
    }

    const data = await response.json();
    const results = pmids.map(pmid => {
      const entry = data.result[pmid];
      if (entry && !entry.error) {
        return {
          pmid,
          valid: true,
          title: entry.title,
          authors: entry.authors.map(a => a.name).join(', '),
          pubdate: entry.pubdate,
          source: entry.source
        };
      } else {
        return {
          pmid,
          valid: false,
          error: entry ? entry.error : 'Not found'
        };
      }
    });

    return results;
  } catch (error) {
    console.error('Error verifying PMIDs:', error);
    return pmids.map(pmid => ({ pmid, valid: false, error: error.message }));
  }
}
