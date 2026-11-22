---
title: Halo Body | Njenga Kariuki
url: https://njenga.ai/halo-body/
updated: 2026-11-22
---

2018–2021 · Amazon Halo

# Halo Body

A phone scan that returned a member’s body fat percentage and a 3D model of their body.
Role
Product lead for Body, end to end
Validated
[npj Digital Medicine, 2022](https://www.nature.com/articles/s41746-022-00628-3)
Accuracy
About half the error of the best smart scale, against a clinical scan
Halo Body at launch, 2020: a member’s 3D model, body fat and weight.
I led Halo Body end to end: body fat and a 3D model from a phone scan. Amazon’s CEO set the challenge, a scan close to the best body fat scanners. I moved its training labels to clinical instruments; in the published study its error was about half the best smart scale’s.

## What I decided

### Started from the claim we could publish

I started from what the customer would read: an accuracy claim we could publish. A claim measured against the most accurate scanners needed their readings to learn from.

### Moved the training labels to clinical instruments

Our first models learned from fitness experts who judged body fat by eye. We changed the labels to readings from reference instruments: the model we validated learned from the body fat values of clinical X-ray (DXA) scans and never saw the images.

### Made the scan itself part of quality

Feedback showed the scan itself was part of the quality members perceived, so we measured and improved it. From August 2021, members could stand about 1 to 2 feet (30 to 60 centimeters) closer, so Body worked in smaller rooms.

## How it worked

Before

### An accurate body fat number needed a clinic

In 2020, measuring body fat accurately meant a DXA scan in a clinic, with a doctor’s prescription. An accurate scan cost people $75 to $150, a price we judged too high for customers.
01 Capture

### Four coached photos, in any room

The aim was a fully automatic phone scan that worked at home, in any room and any light. A member stood 4 to 6 feet (1.2 to 1.8 meters) from the phone, in tight, minimal clothing, for four coached photos: front, back and each side.

### The capture coach, step by step

The app coached four photos, checking the phone’s level, the distance and the pose, so any room could produce a usable scan.
Illustration
The data as a table
The four steps of a scan
Step · What the app coached
Level · The phone stands upright on a surface, about knee to waist high.
Distance · The member steps back, about 4 to 6 feet (1.2 to 1.8 m).
Pose · Arms and legs move into the outline on the screen.
Photos · Four photos: front, back, left and right.
02 Analyze

### Three neural networks, results in seconds

In Amazon’s cloud, one neural network separated the person from the room. A second read body fat from the front and back photos only, and a third built a 3D model from the silhouettes. Results came back in seconds.
03 Show

### A 3D model, a number and a slider

Each member saw a 3D model of their own body beside their body fat percentage. A slider showed the same body at more or less body fat. The Verge, a technology news site, wrote that the slider “could also be literally dangerous for people with body dysmorphic disorder.” From launch day it stopped at the bottom of a healthy range for the member’s sex and age, and Body was for adults only.
The same body at less body fat, down to the slider’s floor: a drawing of the idea.
04 Test

### Tested at two clinics against DXA

Massachusetts General Hospital and Pennington Biomedical Research Center tested Body in a blinded study. Its average error against DXA was the lowest of seven methods, and stayed the lowest in every group by sex, body mass index and race. Amazon saw no DXA result until Body’s estimates were with the investigators, and the model had never trained on clinic data.
Amazon’s Halo launch film, 2020.
A drawing of the idea.

## Average error against a clinical X-ray scan (DXA), in points

2022 study

## Launch

Amazon’s launch illustration, 2020: a scan at home, and the 3D model it returns.
“Amazon’s Halo passes Pennington’s test for accurately measuring percentage of body fat”
The Advocate, on the study’s results, June 2021
Body launched with Halo on 27 August 2020. The study’s results came out on 16 June 2021, and npj Digital Medicine, a Nature Portfolio journal, published the paper on 29 June 2022.

## What came next

In September 2022, an independent study tested Body against a reference more thorough than DXA, and only Body’s estimate passed. In 2025, four obesity and nutrition societies cited the 2022 study in an advisory on nutrition during GLP-1 obesity treatment.
Sources
Next
Amazon Halo
2018–2021
