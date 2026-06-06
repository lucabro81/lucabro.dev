---
title: "Socratic AI: how I learned formal grammars (and built a compiler) without losing control of what I was building"
date: "2026-04-05"
description: "How I built a compiler for a language I had in my head but couldn't formalize, using AI to ask the right questions instead of writing the answers."
---

## Table of Contents

1. [The context](#1-the-context)
1. [The problem](#2-the-problem)
1. [The method](#3-the-method)
1. [How it works in practice](#4-how-it-works-in-practice)
1. [When the method isn't needed](#5-when-the-method-isnt-needed)
1. [The limits of the method](#6-the-limits-of-the-method)
1. [One way among many](#7-one-way-among-many)
1. [Links](#links)

---

**TL;DR:** I used Claude as a Socratic interlocutor while building the Origami compiler, no direct answers, only questions, until I could answer them myself. It's slower than delegating, and for most projects it's the wrong tradeoff. For a compiler I needed to fully own, it was the only approach that made sense.

## 1. The context

About a month ago I started building [Clutter](https://github.com/lucabro81/clutter): a compiler for a custom markup language that outputs Vue SFCs. The idea was to enforce design system compliance at compile time: if a value isn't in the token dictionary, the build fails. It stayed a POC, proved its point, and opened larger questions that are evolving into a different project.
I wrote it in Rust, which I'm learning. I had no background in formal grammars beyond a university course I took over twenty years ago and mostly forgot.

The goal was to have a working compiler I fully understood, every design choice and the reasoning behind it. To know how it worked well enough to make deliberate decisions about it.
That's a different problem from "I need a lexer and a parser." It's closer to: I need to know what I'm choosing, and why, before I write a single line of it.

## 2. The problem

There are two ways to use AI when you're building something you don't fully understand yet, especially when the edges aren't clearly defined.

**The first:** you delegate. You describe what you need, as clearly as you can given your knowledge at that moment, and your best idea of how to approach the problem. It works, and it's one of the concrete possibilities this era has brought us. But it has a limit that becomes more visible as the scope grows and touches more layers of the process: it gets hard to track decisions you didn't make. In the end, ownership disappears. What's left is possession of a file someone else built.

**The second:** you do it yourself. The old way. You sit in front of your IDE and write code one line at a time. This requires deep knowledge of the domain and the tools; if that knowledge isn't there, you have to build it first, or the quality of what you produce suffers. Ownership is total, but it's incredibly slow, and the pace is no longer compatible with how software gets built now.

There is a third way, and that's what this article is about.

## 3. The method

The Socratic method, or maieutics, is a philosophical method of inquiry based on dialogue. Socrates didn't teach by transferring knowledge, he asked questions, one after another, until the other person arrived at understanding on their own. The underlying idea is that knowledge can't be transferred, it has to be drawn out, it has to emerge.

Applied to software development, the principle is the same. Instead of asking AI to write a solution, you ask it to ask you the right questions. Not "write me a lexer", but "I need to understand what a lexer does in the context of my specific compiler, keep asking me questions until I can answer them myself." The code comes later, and it comes from understanding, not in place of it.

This connects naturally to the practice of breaking a complex problem into simpler ones. The difference is that here the decomposition doesn't happen upfront, it emerges from the dialogue. Every question the model asks forces you to make explicit what you know and what you don't, and the gaps become visible before they become bugs.

After Clutter, working on its evolution, I decided to rewrite the compiler from scratch starting from the formal grammar: the ownership problem we talked about was too present to ignore. That's where I ran the first real Socratic session. It didn't come from urgency, or from needing to recover ground on something broken. It was a deliberate choice to understand before building, knowing that what I was about to tackle was larger, and that I couldn't afford opaque parts in the middle. Everything had to be known to me, no shortcuts.

One clarification: this approach works when you already have an idea, even a rough one, of what you want to build. AI is not an oracle, it doesn't know where you're going better than you do. It's an interlocutor that helps you make your idea explicit and test its solidity. Every decision remains yours. We'll come back to this.

## 4. How it works in practice

Clutter worked. It parsed `.clutter` files, validated tokens against the design system, emitted Vue SFCs. The problem was that a significant part of the compiler (lexer, parser, the entire pipeline) had been written in fast sessions, with the AI producing code while I tried to keep up. It worked, but it wasn't mine, and if something had broken I wouldn't have known where to put my hands without starting to ask again, which isn't a foundation you can build on long term.

When I decided to evolve Clutter into Origami, a larger project with routing, data layer, and i18n, it was clear I couldn't carry that fragility forward. I decided to rewrite the compiler from scratch because everything I would build on top of it depended on the solidity of that foundation. I needed to be its author.

I had to start from the grammar, the formal specification that formal languages are built on.

I opened a session with Claude with a precise instruction: no direct answers, only questions. The first question wasn't technical:

> **Claude:** [...] You said that in a template there are three types of tags. Let's take the simplest one: the self-closing tag.
> Write in natural language — not in Bison — the sentence that completes this:
> "A self-closing tag is made up of..."

I wasn't sure I was enjoying it, but it forced me to put my ideas in order, as if I had to explain it to someone who knew nothing about the language. Not "how does the parser work", but "what are tags to you".
I started answering and realized I was building the grammar from the inside, starting from how I thought about the language. Not from a spec, not from a Bison manual, from what I had in my head. The formal grammar that came out of it didn't describe an abstract language. It described exactly what I had in mind, made precise and verifiable.

A formal grammar defines what a language can express and what it cannot. It's a contract. If you write the grammar first, you know exactly which constructs your parser must recognize, which checks belong to the lexer, and which must be deferred to semantic analysis. It's the perimeter of what you're building, made explicit.

What followed was about four hours of dialogue, spread across two sessions.

---

One moment worth showing involves closing tags. In a `.ori` file, every opened element must be closed, `<Column>...</Column>`. The question was whether the parser should verify that the opening tag name matches the closing one.

> **Claude:** Should the parser verify that `<Column>...</Column>` matches, or can you do without this check at the grammar level?

> **Me:** I don't know... don't the rules we wrote serve that purpose?

> **Claude:** The rules use tokens to distinguish cases. If `<if>` and `<Column>` emit the same `TAG_NAME` token, the parser sees them as identical and can't apply different rules.

> **Me:** Does that matter for the lexer? They're tag symbols like any other, a tag name can be if or each too, right?

> **Claude:** Exactly — from a character standpoint, if and `Column` are both sequences of letters. The lexer could emit both as `TAG_NAME`. But then who distinguishes a `<if>` from a `<Column>` to apply the correct grammar rules?

A real fork opened up. I could keep distinct tokens for control tags (`OPEN_IF`, `OPEN_EACH`, `OPEN_UNSAFE`) because their syntactic structure differs from a normal tag: they have specific mandatory attributes the parser must enforce. Or I could use `TAG_NAME` for everything and push the distinction past parsing. The answer wasn't technical, it was a design choice about where I wanted the controls to live.

I kept the tokens distinct. A control tag has a structure the parser must recognize, and that's syntax, not semantics. That boundary was mine to draw, and I drew it consciously.

---

The second moment involves `else`. In the grammar I was building, an `<if>` block could be followed by zero or more `<else-if>` blocks and a final `<else>`. The question was whether the final else should be mandatory.

> **Claude:** Are you sure about this choice? Imagine being a developer writing a component. Consider this concrete case: `<if condition={isLoggedIn}><UserProfile /></if>`. Without else, what should the UI show when `isLoggedIn` is false?

> **Me:** Nothing, but if you add an `else-if`, isn't it logically sensible to also add an `else`? Why don't other languages enforce this?

> **Claude:** In general-purpose languages `else` isn't mandatory because "do nothing" is a legitimate and common case. Origami is a markup language — "do nothing" simply means render nothing. The question is: do you want Origami to enforce a more explicit style, or do you want to leave that freedom to the developer? You already decided to force reason in unsafe — is this the same philosophy?

> **Me:** I'm not sure... no, not in this case. I think it would end up being frustrating for the developer.

So `else` stays optional, not because it's the objectively right answer, but because I evaluated the consequences, made a choice, and the grammar reflects it.

---

What follows risks sounding trivial, but it's the actual point: the AI never told me that else should be optional, or that grouping tokens by category was the wrong abstraction. It asked the right questions until I was the one telling myself. Every choice that appears in `grammar.y` and `tokens.rs` is a choice I made explicitly, aware of its consequences. I can defend it, change it, explain why.

It's a slower way to work, and for most applications (the ones that need to exist and ship and move on) it's probably the wrong choice. But for projects that need to hold up across layers of a complex system, I think it's necessary. It requires having a rough idea of what you want to build, the AI doesn't generate the idea, it facilitates the process of making it precise. The result is real ownership.

## 5. When the method isn't needed

Not all the work on Origami was done this way. I delegated without hesitation: CLI, Cargo workspace configuration, CI setup, initial crate scaffolding. No Socratic session to configure GitHub Actions, no maieutic questions to write the `Cargo.toml`.

These are parts of the project where there's no design decision to internalize: documented APIs, established conventions, configuration that follows them. Doing it yourself would just be a waste of time. The same applies, at different levels, to everything that comes after the codegen in the compilation pipeline, parts where the structure is already determined by upstream choices, and the work is implementation.

The Socratic method makes sense where there's a decision to be made that needs to be yours. Where that decision doesn't exist, it's just unnecessary friction.

## 6. The limits of the method

There's something worth saying clearly, because the approach can seem more universal than it actually is.

In the original Socratic dialogue, Socrates already knows where he wants to go: the questions are maieutic, designed to bring out in the interlocutor knowledge they already possess in some form. If Socrates didn't know where he was going, the dialogue wouldn't be maieutics, it would just be conversation.

The same applies here. This approach worked because there was a precise balance: I knew nothing about formal grammars, but I knew exactly what I wanted to build and I had a very clear language in my head, its syntax and its boundaries. What I was missing was the formalization, the tool to make it precise and verifiable. The AI helped bridge that gap, asking questions that started from what I knew to arrive at what I didn't yet know how to express.

If that balance isn't there, if both the theoretical knowledge and the knowledge of the specific problem are missing, the approach produces answers that seem right without giving you the tools to realize they're wrong. Socratic questions need ground to work on; without it, it becomes the blind leading the blind, with the illusion that someone knows where they're going.

You don't need to be an expert in the technical domain, but you do need a solid and clear understanding of the problem you want to solve, the intention and the specific context. That part can't come from the AI, because it's exactly what the AI doesn't have. It's what you bring.

## 7. One way among many

There's a real tension in this moment for anyone who's been doing this work for a while. The tools that have arrived in recent years seem to call into question the value of what you've learned, and of the time it took. It's an uncomfortable feeling, and I understand those who get stuck on it.

I don't have a general answer, I only have what I did: I used these tools to build something I couldn't have built without them. Partly for lack of time, partly for lack of knowledge I had no reason to acquire before (well, maybe lack of ability too...). Origami will exist because I used AI well, and will keep using it that way: where it accelerates without taking anything from me, and kept in check where decisions need to remain mine.

It's not the only way to work. It's one of the ways. For me, on this project, it worked.

---

### Links

- <a href="https://github.com/lucabro81/clutter" target="_blank" rel="noopener noreferrer">Clutter</a>: A Rust compiler for `.clutter`, a UI markup language with a closed vocabulary that enforces design system compliance at compile time
- <a href="https://github.com/lucabro81/origami" target="_blank" rel="noopener noreferrer">Origami</a>: A fullstack opinionated framework with a closed-vocabulary DSL that enforces design system compliance at compile time.
- <a href="https://github.com/lucabro81/origami/blob/main/grammar.y" target="_blank" rel="noopener noreferrer">Origami grammar</a>