---
title: Amazon Bio Discovery (AWS Agentic AI) | Njenga Kariuki
url: https://njenga.ai/bio-discovery/
updated: 2026-11-22
---

2025–2026 · AWS Applied AI, Life Sciences

# Amazon Bio Discovery

Scientists design antibodies with AI agents in one application, and partner labs test the designs.
Role
Head of Product, AWS Applied AI, Life Sciences, from the start to the launch
Scale
Directed a cross-functional organization of 100+ engineers, scientists and product managers
Launched
14 April 2026, at the AWS Life Sciences Symposium in New York
Choosing the target protein, then asking for recommended binding sites. · 1 / 2
I led product for Amazon Bio Discovery, an agentic AI application for antibody design, from its start to its launch on 14 April 2026, with an organization of 100+ engineers, scientists and product managers. Memorial Sloan Kettering said its launch campaign went from target to lab order in weeks.

## What I decided

### Set the bar at the scientists’ own work

Drug discovery scientists work at the frontier of their field, so my bar was a product that fit the way they already worked. Access to models was only the first step. Fitting them into daily work meant working closely with those scientists.

### Checked the interface and its usefulness

From my earlier products I brought frequent checkpoints on two things beyond the models: the interface, and how useful scientists found it. Our team ran a design campaign with Memorial Sloan Kettering Cancer Center (MSK), and the scientists’ feedback shaped the product.

### Launched once the product met the bar

We checked each version against that bar and launched when the product met it. It opened on 14 April 2026 with AI agents and more than 40 biological AI models.

## How it worked

Before

### Months from a target to a candidate

A paper AWS published at launch put conventional antibody discovery at 6 to 12 months, from a target protein to the antibody chosen for development. Scientists had little control over where on the target an antibody would bind. Bench scientists knew the biology and waited for computational biologists to run the models.
01 Ask

### The agent proposes where to bind

A scientist uploads a target protein and presses “Recommend hotspots,” and an AI agent proposes where on the protein to bind. The agent runs bioinformatics tools, and a language model turns their results into ranked regions, each with written evidence. On known antibody-target pairs, one of its top five regions overlapped the true binding site about 80% of the time.
The agent’s ranked binding regions on a target, each with its evidence and rationale.
02 Design

### Three models, 288,000 designs

In the campaign with MSK, three design models, each working a different way, produced 96,000 nanobody designs apiece: 288,000 in all. A nanobody is a small antibody. The run used 2,000 GPUs in two AWS regions.
A workflow built from models in the catalog, ready to publish for others to run.
03 Judge

### What a design must pass to reach a lab

A second agent ranked the designs on five scores at once and kept the best trade-offs, until 100,000 remained.
04 Test

### Only a lab test confirms a binder

Twist Bioscience, a launch lab partner, made the DNA for 100,000 designs, and a first lab screen sent 116 on to a binding test. Of the 116, 46 were confirmed to bind the target.
Each lab result returns to the experiment that produced it and is checked before any model retrains on it. At launch, MSK said the campaign went from target to a lab order in weeks.
Before · Target to candidate antibody
Conventional discovery took 6 to 12 months; the launch campaign reached a lab order in weeks.
Conventional discovery · Bench → handoff → computational → screening
6 to 12 months
Amazon Bio Discovery · MSK launch campaign
Weeks · target to lab order
0 · 3 mo · 6 mo · 9 mo · 12 mo
01 Ask · Hotspot reasoning agent (tap a ranked region)
An AI agent runs bioinformatics tools and ranks five binding regions on the target protein.
Target protein structure (Chain A / B) · ~80% top-5 overlap on known pairs
Region 1 · Top ranked — Exposed loop pocket; bioinformatics tools + language model rationale.
02 Design · 2,000 GPUs across two AWS regions
Three distinct generative models produced 96,000 nanobody designs apiece: 288,000 in all.
Design model 1 · 96,000
Design model 2 · 96,000
Design model 3 · 96,000
2,000 GPUs →
288,000
Candidate nanobodies
Generated in parallel from 40+ biological AI models in the catalog.
03 Judge · Multi-objective ranking across five scores
A second agent keeps the best trade-off fronts in sequence until 100,000 remain.
Outer fronts kept in sequence until 100,000 candidates remained for DNA synthesis.
04 Test · Closed wet-lab validation loop
46 of 116 tested designs bound the target; every lab result returns to the experiment.
100,000
Made as DNA
Twist Bioscience first lab screen
116
Binding assays
Measured one by one for target affinity
46 of 116
Confirmed binders
Target to lab order in weeks (MSK)
↺ Lab results return to the experiment & are checked before retraining
Interactive pipeline — click any step rail below or explore controls inside the stage.

## The launch campaign, design by design

46 of the 116 tested candidates were confirmed to bind the target (~40% confirmation rate).

## Launch

At launch: candidate designs filtered to the ones sent for lab testing.
“Patients come here with a clock. We need results sooner.”
Nai-Kong Cheung of Memorial Sloan Kettering, in Amazon’s launch announcement
Amazon Bio Discovery opened on 14 April 2026 at the AWS Life Sciences Symposium in New York. Scientists could design with its agents and more than 40 models, and send designs to partner labs with cost and turnaround shown before ordering. Amazon named Bayer, the Broad Institute, Fred Hutch Cancer Center and Voyager Therapeutics as early adopters.

## What came next

On 10 August 2026, Novo Nordisk made AWS its preferred cloud provider and strategic AI partner, and said it would use Bio Discovery to identify drug targets and design therapies faster. In October 2026, NVIDIA and the University of Washington’s Institute for Protein Design released an open protein design model, “available today through partners including Amazon Bio Discovery.”
Sources
Next
Stanford AI Institute
2024–2025
