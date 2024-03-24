---
layout: "../../layouts/MarkdownPostLayout.astro"
title: Notes on Notes of the Synthesis of Form
pubDate: "2023-08-01"
image:
  url: "https://docs.astro.build/assets/arc.webp"
  alt: "Thumbnail of Astro arcs."
tags:
  - Design
summary: |
  The past few years I've been reading through most of Christopher Alexander's works on design and architecture. I've found myself returning to his works time and again, as his approach to design is so singularly unique. There is an observable evolution throughout his works where design becomes a deeply human problem.
---

## Reading Christopher Alexander

The past few years I've been reading through most of Christopher Alexander's works on design and architecture. I've found myself returning to his works time and again, as his approach to design is so singularly unique. While his early works, like Notes on the Synthesis of Form, place logic at the front and center of his process, there is an observable evolution throughout his works where design becomes a deeply human problem.

While a good amount has already been written on this book, I wanted to share just a couple small thoughts.

## Quick Summary

Notes on the Synthesis of Form (SoF) aimed to solve a central problem of how to clearly define good design, and how we could (almost programmatically) arrive at a good design for any problem. SoF was one of his earliest works attacking the issue, though his later works took far different approaches. Critically in SoF:

- Design problems are defined as two parts: **Form** and **Context**
- The goal of design is to achieve **Good Fit** between the **Form** and the **Context**
- **Good Fit** is better defined as the _absence_ of **Bad Fit**

The example he gives is making a metal face perfectly smooth and level:

> It is common practice in engineering, if we wish to make a
> metal face perfectly smooth and level, to fit it against the
> surface of a standard steel block, which is level within finer
> limits than those we are aiming at, by inking the surface of
> this standard block and rubbing our metal face against the
> inked surface. If our metal face is not quite level, ink marks
> appear on it at those points which are higher than the rest.
> We grind away these high spots, and try to fit it against the
> block again. The face is level when it fits the block perfectly,
> so that there are no high spots which stand out any more.

In the case of the metal face, achieveing goodness of fit is near trivial compared to real world problems. However he believes the same approach can fundamentally be used to tackle larger non-trivial problems. We can define the criteria and demands of the context, and we simultaneously understand the constraints on the solution/form.

One key thing to call out is this approach to design is _empirical_. We can test and see when ink marks appear on high spots. We can test and see when the **Form** does not properly marry **Context**. Good design becomes objective in a sense, susceptible to scientific analysis and experimentation. Going further, if a design problem can be mathematically _articulated_, it follows that it can be mathematically _solved_. As Christopher works to wrangle such a generic problem of design into a formal mathematical logic, it's hard not to be impressed by the novelty of the approach alone. It's easy to see why Christopher gained a large following within Computer Science and Software Design. Good design seems almost _computable_.

## The Indian Village

Towards the end of the book there's a large section where Christopher designs an village in India based on his method. He enumerates 141 criteria related to material, social, caste, agriculture, husbandry, transportation, and political forces. He then groups and resolves these into an Indian Village. It reads quite like the following:

![rest-of-the-fucking-owl](/images/blogposts/notes-on-the-synthesis-of-form/rest-of-the-owl.webp)

As scientific and exact as the process claims to be, it doesn't provide enough practical guidelines as a framework to truly work. There's some amount of architectural inspiration to just leap from beginning to end, even if the intermediate steps possibly help frame your thoughts better. It shows the process put forward as, at least alone, insufficient to create good design.

## But Why an Indian Village?

However I stumbled across an interview with Christopher Alexander much later in his life, where he unrelatedly mentions one of the first opportunities he had as an architect being the design and construction of such a village in India. He described himself as turning down the offer, sure he would make a mess of things without understanding the forces at play or how to ensure the designed village would be alive.

I found this deeply moving, and in many ways changed how I viewed this earlier work. While it reads like the workings of an ivory tower mathematician, there is a sense that _all_ of this book was built with this past shortcoming in mind, and a deep desire to do better. A book that was written to tackle both the general problem of design, but also meant to tackle a truly personal problem for Christopher.
