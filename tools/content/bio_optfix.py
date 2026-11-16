"""Second-pass length balancing for Bio choices already rewritten in the batches.

After the batches, tell_done.py listed items where the key was still the longest
choice by five or more characters. Each entry here rewords one choice (never the
meaning of the key) so the key no longer stands out. id -> {option index: text}
"""
PATCH = {
"BIO_g005": {3: "Sex-linked inheritance"},
"BIO_g038": {2: "Only by a brand new mutation"},
"BIO_g049": {0: "Rearrangement of genes within one chromosome"},
"BIO_g053": {1: "Ribosome speed on the leader peptide"},
"BIO_g057": {0: "Earlier onset in each generation"},
"BIO_g070": {1: "DNA quantity as it is amplified", 3: "The methylation state of a promoter"},
"BIO_g071": {3: "Choosing PCR annealing temperatures"},
"BIO_g075": {0: "How many offspring inherit the allele"},
"BIO_g076": {3: "The equal expression of both alleles at once"},
"BIO_g089": {2: "They are diploid flowering plants"},
"BIO_p013": {0: "Water reabsorption without sodium"},
"BIO_p020": {3: "Enzymes secreted by the liver"},
"BIO_p022": {0: "All nucleated body cells"},
"BIO_p027": {0: "It is continuous from puberty"},
"BIO_p035": {2: "The lung tissue itself"},
"BIO_p046": {0: "Oxygen level in the blood"},
"BIO_p053": {3: "Hormone release into blood"},
"BIO_p059": {3: "Increases sodium and water excretion"},
"BIO_p060": {1: "A damaged, leaky glomerular filter"},
"BIO_p061": {2: "Insulin, glucagon and somatostatin"},
"BIO_p066": {3: "Diet and physical inactivity"},
"BIO_p070": {2: "Chemical synapses between cells"},
"BIO_p085": {3: "Prostate and seminal vesicles"},
"BIO_p090": {0: "The back and shoulders"},
"BIO_p099": {3: "Thalamus and hypothalamus"},
"BIO_p100": {3: "The placenta and nothing else"},
}
