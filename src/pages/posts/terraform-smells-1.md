---
layout: "../../layouts/MarkdownPostLayout.astro"
title: Terraform Smells - Part 1
pubDate: "2023-07-19"
image:
  url: "https://docs.astro.build/assets/arc.webp"
  alt: "Thumbnail of Astro arcs."
tags:
  - Terraform
summary: |
  A couple common terraform codebase smells, and how to fix them.

# draft: true
---

There are two common codebase smells I find commonly in terraform projects related to not using submodules properly. While it's possible to continue working with either, they can cause a good amount of heartburn and can be fixed without too much issue.

## The `for_each` Siblings

## The _up and down_ Inputs/Outputs
