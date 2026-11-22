---
title: Halo Tone | Njenga Kariuki
url: https://njenga.ai/halo-tone/
updated: 2026-11-22
---

2018–2021 · Amazon Halo

# Halo Tone

The Halo Band sampled the wearer’s voice; the phone showed how it sounded to others, in words such as “Hopeful.”
Role
Led Tone end to end, from the listener panels to launch
Patents
Six US patents, granted 2022 to 2026
Launched
August 2020, in the United States
Launch illustration of Tone, 2020: the day’s tones and two notable moments. · 1 / 2
I led Halo Tone end to end: how your voice sounds to others, analyzed on the phone. I defined what that meant, built the listener panels that taught the model, and set the audio sampling the band’s battery was designed around. Six US patents came from it.

## What I decided

### Took the training labels from listener panels

How a voice sounds to others is a judgment people make, so the model’s labels came from listener panels. I defined what the panels rated and how they were built.

### Sampled the least audio a result needed

I worked back from the least audio a meaningful result needed. That became the hardware team’s requirement for the band’s battery and size. Three of the six patents describe this sampling.

### Replaced four labels with two scores and words

The first model aimed at accuracy on four labels: happy, sad, low energy and high energy. Playing results back to customers did not work: people wanted to know what a result meant. So we moved to two continuous scores and plain words.

## How it worked

Before

### No measure for how you come across

Social well-being affects long-term health, and there was no good measure of it. Tone began with a demo that placed the voices of two US presidents on two axes, energy and positivity. The two voices fell far apart.
01 Rate

### Listeners rated the clips the model learned from

Panels of listeners rated short clips from happy to sad and from low to high energy. Their ratings became the labels the model learned from. Amazon said its employees rated tens of thousands of voices across US regions and demographic groups.
Each listener rates the same clip; together their ratings set its label.
02 Score

### Two scores for every stretch of speech

The model gave each stretch of speech two scores: positivity, how happy or sad it sounded, and energy, how excited or tired. In live mode, the voice moved around a positivity and energy graph with each word.

### Two scores, one word

Tone placed each voice reading on two scales, energy and positivity, and named its region with a word, such as content or irritated.
Illustration
The data as a table
The word for each region of energy and positivity
Word · Energy · Positivity · Other words
Excited · Higher · Higher · amused, delighted
Content · Lower · Higher · appreciative, caring
Worried · Lower · Lower · reserved, discouraged
Irritated · Higher · Lower · displeased, enraged
03 Describe

### Plain words for the day, such as “Hopeful”

Tone showed the day’s moments as plain words with times, such as “Hopeful” at 10:30 AM. Customers wanted to see how their voice varied, so we made that variation a measured dimension.
Amazon’s Halo launch film, 2020: the day’s notable moments, each a word and a time.
04 Sample

### Sample just enough voice to save the battery

The band sampled speech at intervals through the day, which saved its battery. In the patents’ example, a wearable that listens nonstop lasts under 10 hours on a charge. One that sleeps between checks lasts 2 days or more.
Battery life on one charge, in the patents’ example.
05 Protect

### Only the wearer’s voice, and no audio kept

I defined the path from band to phone and balanced its privacy and legal requirements so Tone could launch. The band sent short, encrypted segments to the phone, which kept only the wearer’s speech, analyzed it and deleted the audio. Only positivity and energy summaries reached Amazon’s cloud, and no one heard a recording.
The audio’s path: what leaves each step gets smaller.

## Six US patents, by grant date

Drawn from each patent

## Launch

“I found the Tone feature to be eerily accurate”
Android Central’s review of Amazon Halo, September 2020
Tone launched with Amazon Halo on 27 August 2020, in early access in the United States.

## What came next

Amazon’s next band, Halo View, announced in September 2021, had no microphone; its owners ran Tone live on the phone.
Sources
Next
Halo Body
2018–2021
