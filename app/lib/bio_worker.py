import sys
import json
from Bio.Seq import Seq
from Bio.SeqUtils import MeltingTemp as mt
from Bio.SeqUtils import gc_fraction

def calculate_melting_temp(data):
    sequence = data.get('sequence', '')
    if not sequence:
        return {"error": "No sequence provided"}
    
    # Simple Tm calculation
    tm = mt.Tm_Wallace(Seq(sequence))
    gc_content = gc_fraction(sequence) * 100
    
    return {
        "tm": round(tm, 2),
        "gc_content": round(gc_content, 2),
        "length": len(sequence)
    }

def codon_optimize(data):
    # Simplified mock codon optimization for prototype
    # In a real app, this would use a codon usage table
    sequence = data.get('sequence', '').upper()
    species = data.get('species', 'human')
    
    # Just a placeholder transformation for now
    # Real implementation would involve Biopython or other libs
    optimized = sequence.replace('AAA', 'AAG') # Example
    
    return {
        "original": sequence,
        "optimized": optimized,
        "species": species
    }

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing task or data"}))
        return

    task = sys.argv[1]
    try:
        data = json.loads(sys.argv[2])
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON data"}))
        return

    if task == 'melting_temp':
        result = calculate_melting_temp(data)
    elif task == 'codon_optimize':
        result = codon_optimize(data)
    else:
        result = {"error": f"Unknown task: {task}"}

    print(json.dumps(result))

if __name__ == "__main__":
    main()
