import pytest
from app.lib.bio_worker import calculate_melting_temp, codon_optimize

def test_calculate_melting_temp():
    data = {"sequence": "ATGCATGC"}
    result = calculate_melting_temp(data)
    assert "tm" in result
    assert "gc_content" in result
    assert result["length"] == 8
    # Tm_Wallace for ATGCATGC: (2 * 4) + (4 * 4) = 8 + 16 = 24
    assert result["tm"] == 24.0

def test_codon_optimize():
    data = {"sequence": "ATGCATAAA", "species": "human"}
    result = codon_optimize(data)
    assert "optimized" in result
    assert "original" in result
    assert result["species"] == "human"
    # Based on our simple mock implementation: AAA -> AAG
    assert result["optimized"] == "ATGCATAAG"

def test_melting_temp_no_sequence():
    result = calculate_melting_temp({})
    assert "error" in result
