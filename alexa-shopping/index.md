---
title: Alexa Shopping | Njenga Kariuki
url: https://njenga.ai/alexa-shopping/
updated: 2026-11-22
---

2017–2018 · Alexa, Amazon

# Alexa Shopping

Ordering by voice on an Echo speaker: one spoken request, one offer read back, then a “yes.”
Role
First product lead for how Alexa understood shopping requests
Team
Built and led a 10-person evaluation team
Result
Shopping success from about 50% to 85%
A voice order, drawn from Amazon’s 2017 examples.
I was the first product lead for how Alexa understood shopping requests. Alexa’s overall measures said shopping worked; I set out to test that. I listened to 1,000 requests a week and wrote how each would be judged. Success rose from about 50% to 85%.

## What I decided

### Judged each request by its one offer

A request counted as a success only when Alexa’s one offer was the product the customer asked for. Shopping success was the share of sampled requests that met that bar.

### Held a 10-person team to one written standard

Each type of error had a written definition and a set of examples, so 10 people would judge the same request the same way. When the team found a case the rubric did not cover, we added it. The models learned from the team’s judgments.

### Ranked one customer measure above model measures

Three steps that are each 90% accurate leave about one customer in four with an error. So shopping success ranked above model measures such as speech recognition accuracy.

## How it worked

Before

### One request, one offer, no screen

A customer could say “Alexa, order,” name a product, hear one offer with Prime delivery, and say “yes.” An Echo speaker had no screen and no list of results, so only that offer counted. A request could break at any step: a misheard brand, the wrong task or the wrong offer.
Echo Plus, drawn: the light ring glows when Alexa hears its wake word.
01 Hear

### Brand names were easy to mishear

Speech recognition in Amazon’s cloud turned the sound into words. Brand names were easy to mishear, and a speaker could not suggest completions the way a search box does. In one published case, background noise turned “epilepsy bracelets” into “apple upci uhhh bracelets.”
02 Understand

### The same words could mean another task

Language understanding models then decided what the customer wanted done, and which words named the product. The same verb could mean different tasks; Amazon’s own 2018 example was “order me a cab” and “order me an Echo Dot.” Fixing one could weaken the other.
Labels on each word let Alexa split one spoken request into separate list items. Drawn from an Amazon Science example, 2018.
03 Offer

### Only the one offer counted

Alexa offered an item from the customer’s order history first, then an Amazon’s Choice product, popular and well priced, then the top search result. In one of Amazon’s 2017 examples, “Alexa, order Bose Soundlink three,” an offer of any other model was a wrong order.
04 Judge

### Judge every request, then fix what failed

Each week I listened to 1,000 sampled interactions and marked every turn, one request and Alexa’s reply, a success or a failure. From that listening I wrote the rubric, the written guide to what counted as success, with examples. Each failure went to the scientists and engineers who could fix it, in quick rounds. I led the fine-tuning of Alexa’s base language model for shopping requests.

### One request, judged by its offer

Under my rubric, a spoken shopping request succeeded only if Alexa offered the product the customer asked for.
Example
The data as a table
“Alexa, order Bose Soundlink three.” Three example replies, judged
Alexa’s reply · Where it broke · Words the offer kept · Judged
The requested Bose SoundLink model, with price, then a request to confirm · Nowhere · Bose, Soundlink, three · Success. The customer gets the speaker they asked for.
A different Bose SoundLink model · Understand · Bose, Soundlink · Failure. The customer would get the wrong speaker.
A reply that no matching product was found · Offer · None · Failure. The customer gets no product.

## Sampled shopping requests that ended in the right offer

## What came next

In December 2018, Amazon said customers’ use of Alexa for shopping had more than tripled from 2017. In May 2026, Amazon combined its Rufus and Alexa+ assistants into Alexa for Shopping, which works by voice, touch or both.
Sources
Next
Prime Now
2015–2017
