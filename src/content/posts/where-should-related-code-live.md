---
title: "Where should related code live? A structured look at an unresolved debate"
date: "2026-04-25"
description: "Frontend development has been arguing about colocation for decades without settling it. This article maps the debate and traces what changes when a compiler sits between the developer and the runtime."
---

## Abstract

This article does not take sides. The intention is to map a debate that has been running through frontend development for years without reaching a conclusion, because it probably cannot reach one:

_Where should related code live, and who gets to decide?_

The question touches file structure, framework philosophy, compiler design, and underneath all of it, what we think the unit of work in UI development actually is. We will look at how different frameworks have answered it, what tradeoffs each answer carries, and what changes when a compiler sits between the developer and the runtime.

---

## Table of Contents

1. [Thesis](#1-thesis)
2. [Historical context](#2-historical-context)
3. [Evidence and positions](#3-evidence-and-positions)
    1. [Vue and the Single File Component](#31-vue-and-the-single-file-component)
    2. [React and the absence of a position](#32-react-and-the-absence-of-a-position)
    3. [A critical voice from within Vue](#33-a-critical-voice-from-within-vue)
4. [Analysis](#4-analysis)
    1. [The implicit constraint](#41-the-implicit-constraint)
    2. [The paradox of the compile step](#42-the-paradox-of-the-compile-step)
    3. [What the debate is actually about](#43-what-the-debate-is-actually-about)
5. [A concrete case: Origami](#5-a-concrete-case-origami)
    1. [The file as a feature boundary](#51-the-file-as-a-feature-boundary)
    2. [Styling as a language-level concern](#52-styling-as-a-language-level-concern)
    3. [What the compiler changes, and what it does not](#53-what-the-compiler-changes-and-what-it-does-not)
6. [Open questions](#6-open-questions)
    1. [Is the component the right unit of work?](#61-is-the-component-the-right-unit-of-work)
    2. [Where should discipline be enforced?](#62-where-should-discipline-be-enforced)
    3. [What does the developer actually need to know?](#63-what-does-the-developer-actually-need-to-know)
    4. [Is the output the right place to look?](#64-is-the-output-the-right-place-to-look)
    5. [What happens when the target changes?](#65-what-happens-when-the-target-changes)

---

## 1. Thesis

Every frontend project makes a structural decision that is rarely made explicitly: what is the right unit of colocation?

Colocation, in the broad sense, means keeping things that belong together close to each other in the codebase. The harder question is what "belonging together" means. Does it mean same technology, all the CSS in one place, all the JavaScript in another? Does it mean same component, template, logic, and styles of a single UI unit in one file? Does it mean same feature, all the components that compose a product boundary, regardless of how many they are, grouped together?

Each of these answers has been the dominant convention at some point in the history of frontend development. None has ever been universally correct, and each carries assumptions about how developers work, how codebases scale, and what the framework owes the developer versus what the developer owes the framework.

This article does not resolve the question, but tries to make it more precise.

---

## 2. Historical context

The separation of HTML, CSS, and JavaScript into distinct files was not a design philosophy. It was a practical response to the constraints of the early commercial web: the period, roughly from the mid-1990s onward, when writing code for browsers became a professional activity rather than an academic one.

In that context, the separation made sense, within limits. Pages were primarily documents with interactivity layered on top, and as long as that interactivity remained marginal (form validation, simple animations, occasional DOM manipulation) the three layers could be treated as largely independent. You could change the stylesheet without touching the markup, and the scripts would survive. The file boundary reflected something that was at least approximately true about the conceptual boundary.

That approximation eroded quickly. As interactivity grew more ambitious, and as libraries like jQuery made deep DOM manipulation the norm, the independence assumption became harder to sustain. JavaScript selected elements by class and ID, which meant the markup could not change without breaking the scripts. CSS began depending on classes toggled dynamically by JavaScript, and the markup itself started being generated and modified at runtime.

The three layers continued to live in separate files, but they were no longer independent: changing one almost always meant changing the others. The physical boundary between files remained; the conceptual boundary that had justified it dissolved.

The convention outlasted the reasoning. By the time the component model became dominant, through the successive iterations of Angular, React, and Vue, the separation of file types was already more habit than principle. The frameworks that emerged in this period made different choices about whether to preserve it, challenge it, or ignore it entirely.

---

## 3. Evidence and positions

The three positions examined here represent meaningfully different answers to the same question, grounded in documented reasoning rather than convention alone.

### 3.1 Vue and the Single File Component

Vue's position is the most explicitly argued. The SFC format (one `.vue` file containing a `<template>`, a `<script>`, and a `<style>` block) is presented as a philosophical stance, and the <a href="https://vuejs.org/guide/scaling-up/sfc.html#what-about-separation-of-concerns" target="_blank" rel="noopener noreferrer">documentation states it directly</a>:

> "Separation of concerns is not equal to the separation of file types. The ultimate goal of engineering principles is to improve the maintainability of codebases. Separation of concerns, when applied dogmatically as separation of file types, does not help us reach that goal in the context of increasingly complex frontend applications."
> _— Vue.js official documentation_

The argument is precise: the old separation was a proxy for maintainability, not maintainability itself. Inside a component, template, logic, and styles are inherently coupled, colocating them makes the component more cohesive, not less disciplined. The SFC is Vue's answer to what the right unit of colocation is: the component, with all its concerns, in one place.

This was a coherent position and a meaningful intervention at the time it was made. It gave developers a clear convention and the ecosystem a shared vocabulary. It also introduced a constraint that was never fully declared as such: one file, one component. The format enforces it structurally (one `<template>` block, one `<script>` block) without ever stating it as a rule.

Vue itself has iterated on this model over time. The introduction of the Composition API in Vue 3 was in part a response to limitations that emerged from the Options API's structure: logic related to the same concern was scattered across different option blocks (data, computed, methods, watch), making large components harder to navigate. The Composition API allowed grouping by logical concern rather than by option type. The unit of colocation shifted, slightly, even within the SFC model itself.

### 3.2 React and the absence of a position

React's stance on file organization is, by design, not a stance. The framework has never prescribed how components should be distributed across files, how folders should be structured, or what the relationship between a file and a component should be. This absence is deliberate and has been articulated by members of the React core team over the years.

Dan Abramov's oft-cited advice on project structure <a href="https://react-file-structure.surge.sh/" target="_blank" rel="noopener noreferrer">"move files around until they feel right"</a> *(original tweet no longer available)* is sometimes read as flippant, but it reflects a genuine philosophical choice: the framework should not impose organizational opinions that belong to the team and the project. A single `.tsx` file can export one component or twenty. Nothing in React prevents either, nothing in the ecosystem has ever standardized around one approach.

Abramov has also been more precise about the underlying principle, as reported by Kent C. Dodds, <a href="https://kentcdodds.com/blog/colocation#:~:text=Things%20that%20change%20together%20should%20be%20located%20as%20close%20as%20reasonable." target="_blank" rel="noopener noreferrer">who wrote one of the more thorough treatments of the subject</a>:

> "Things that change together should be located as close as reasonable."
> _— Dan Abramov, as cited in Colocation by Kent C. Dodds_

This is a principle, not a rule. It shifts the question from "how should files be organized" to "what changes together in this codebase", and leaves the answer to the developer. The cost is visible in practice: React codebases vary enormously in structure, and the variance is not always a sign of flexibility. Sometimes it is a sign that the team never made the decision explicitly and accumulated the consequences of not making it.

### 3.3 A critical voice from within Vue

The most instructive position may be the one that emerged from inside the Vue ecosystem itself. In 2019, Markus Oberlehner published <a href="https://markus.oberlehner.net/blog/separation-of-concerns-re-revisited" target="_blank" rel="noopener noreferrer">_"Separation of Concerns Re-Revisited"_</a>, challenging the colocation-by-component model from a direction the framework's own documentation did not address.

His argument centered on a blind spot in the model: logic reuse. If two components share the same reactive logic but render different things, the SFC model offers no clean path. The concern is real and cannot be colocated with both components simultaneously. You extract it, it loses its home, and the colocation principle breaks down at exactly the moment it is most needed.

<a href="https://markus.oberlehner.net/blog/separation-of-concerns-re-revisited#:~:text=And%20here%20the%20new%20paradigm%20of%20separating%20concerns%20not%20by%20file%20type%20but%20by%20logical%20units%20has%20led%20us%20astray." target="_blank" rel="noopener noreferrer">As Oberlehner wrote</a>:

> "Here the new paradigm of separating concerns not by file type but by logical units has led us astray."
> _— Separation of Concerns Re-Revisited, Markus Oberlehner, 2019_

This critique arrived before the Composition API, and it is one of the pressures that made the Composition API necessary. Composables, reactive logic extracted into standalone functions, importable across components, are Vue's answer to the problem Oberlehner identified. They work, but they also mean that not all logic lives in the SFC anymore, and the clean "everything in one place" model becomes a partial truth rather than a complete one.

None of this invalidates the SFC. It shows that the model has edges, and that the framework's own evolution has been shaped by the pressure of those edges.

---

## 4. Analysis

The three positions described above are not simply different preferences. They encode different assumptions about what the framework owes the developer, what the developer owes the codebase, and where the boundary between the two should sit. Putting them in tension reveals something that none of them states explicitly.

### 4.1 The implicit constraint

Vue's SFC model introduces a constraint that is never declared as a design principle: one file, one component. It is a structural consequence of the format (the `<template>` block is singular, the `<script>` block is singular) but it is never presented as a rule the developer must follow. It simply follows from the shape of the file.

In practice, the unit of authoring and the unit of the component are forced to coincide. When a developer is working on a feature (something with a natural boundary in the product but composed of several related components) those components must live in separate files. The feature, as a concept, has no representation in the file structure unless the developer imposes one through folder organization. The file boundary is drawn by the format, not by the problem.

Consistent boundaries have value: they make codebases predictable, tooling easier to write, and onboarding faster. The question is whether the boundary drawn by the format is always the right one, or whether it is one reasonable choice that has been made invisible by its own consistency.

React's absence of constraint makes the same question visible from the other side: without a format that enforces anything, the boundary must be chosen explicitly, and that choice is frequently not made. Codebases end up structured by inertia, by the path of least resistance at the moment a new file was created. The principle, things that change together should live close together, is sound, but a principle without a mechanism is advice, and advice is easy to ignore under deadline pressure.

Both approaches carry a cost. Vue's cost is rigidity at the authoring level: the format decides the boundary. React's cost is inconsistency at the team level: the team must decide the boundary, and frequently doesn't.

### 4.2 The paradox of the compile step

One detail disappears from most colocation discussions: regardless of where components live at the authoring level, what arrives at the runtime is structurally similar across all modern frameworks.

Vue compiles SFCs into JavaScript modules and CSS. React compiles JSX into JavaScript. Svelte compiles its own format into JavaScript and CSS. The output in all cases is a collection of assets that, in their general shape, resembles what the early commercial web produced by hand: markup logic encoded in JavaScript, styles in CSS, structure determined by the DOM. The difference is that the output is not written for human reading. It is optimized for the runtime, minified for the network, and largely opaque to anyone who opens it in a text editor.

This matters for the colocation discussion because the separation that component-based development sought to overcome at the authoring level is reproduced at the output level as a consequence of how browsers work. The framework abstracts the authoring experience; it cannot abstract the runtime target. Every `<style scoped>` block in a Vue SFC becomes, after compilation, a stylesheet with generated attribute selectors applied to every rule. The developer writes colocation; the browser receives separation.

Vue's scoped styles are a concrete example of this indirection. When a developer writes a `<style scoped>` block, Vue generates a unique attribute (something like `data-v-xxxxxxxx`[^4]), adds it to every element in the template, and mirrors it in every CSS selector in the style block. The result is style encapsulation that works reliably (well, usually), but the mechanism is invisible to the developer and introduces a layer of transformation between what is written and what is shipped.

This is not a criticism of the approach. It is a description of what the approach actually is: a compiler convention that manages complexity on behalf of the developer. The developer does not need to know about `data-v-xxxxxxxx`. The question is whether not knowing is always preferable to knowing, and we will return to it in section 6.3.

### 4.3 What the debate is actually about

The colocation debate is not primarily about file structure: file structure is the surface. Underneath it, the debate is about three things that are rarely separated cleanly.

The first is the unit of work. What is the thing a developer is working on at any given moment, a component, a feature, a concern, a module? Different answers produce different organizational instincts[^1], and frameworks that encode one answer make the others harder to express.

The second is the locus of discipline. Every organizational approach requires discipline to work at scale. The question is where that discipline is enforced: by the format, by the framework, by the team's conventions, or by the developer's judgment. Enforcing it at the format level[^2] makes it consistent and invisible; leaving it to individual judgment makes it variable and honest[^3].

The third is the relationship between authoring and output. What the developer writes and what the runtime receives are not the same thing, and the distance between them is managed by the compiler. That distance can be small and transparent, or large and opaque. Neither extreme is obviously better, transparency has costs in verbosity and cognitive load, opacity has costs in debuggability and trust, but the choice shapes everything else.

None of these three questions has a universal answer. What the frameworks have done is make one set of answers the default, and defaults, once established, tend to look like facts.

---

## 5. A concrete case: Origami

<a href="https://github.com/lucabro81/origami" target="_blank" rel="noopener noreferrer">Origami</a> is a full-stack framework with a closed-vocabulary DSL and a compiler written in Rust. Its authoring format is the `.ori` file. It currently compiles to Vue SFCs, which means Vue is the runtime target, but a temporary one, chosen for its runtime characteristics, not because the language it exposes to the developer is Vue or is constrained by Vue's conventions.

This distinction matters for the colocation discussion because decisions made at the authoring level, how components are organized, how styles are expressed, what a file represents, are not bound by what the compilation target expects. The compiler mediates between the two: what Vue receives is what Vue expects; what the developer writes is what the problem requires.

### 5.1 The file as a feature boundary

In Origami, a `.ori` file can contain multiple component definitions. The compiler reads each definition, understands its boundaries, and generates one Vue SFC per component. Vue receives a set of files that conform exactly to its format. The fact that several of those components were authored together, in the same file, because they belong to the same feature or share a conceptual boundary, is information that exists at the authoring level and is resolved at compile time.

This is the concrete consequence of having a compiler between the developer and the runtime: the unit of authoring and the unit of the compilation target no longer need to coincide. In Vue, they must, the format enforces it. In Origami, they can diverge, because the format is not the SFC; the SFC is the output.

This does not resolve the discipline problem, and it is worth naming it directly. A compiler that permits colocation does not prescribe when colocation is appropriate. A `.ori` file containing thirty components compiles without complaint. The freedom is real, and so is the responsibility it transfers to the developer and the team. The framework can enforce vocabulary and token compliance at compile time; architectural judgment remains a human problem.

### 5.2 Styling as a language-level concern

Origami's approach to styling makes the authoring-to-output distance visible in a way worth examining separately.

In a `.ori` file, styling is not a block appended to the component definition. It integrates at the DSL level: every style value must exist in the token dictionary, and if it does not, the build fails.

The type system and the design system are the same thing. A developer cannot write an arbitrary color value, a spacing value that does not exist in the system, or a typography setting that has not been defined. The compiler enforces compliance, not by convention or linting, but by making non-compliant values grammatically invalid.

This differs from the relationship Vue's scoped styles establish between the developer and the styling layer. In Vue, the developer writes CSS inside a `<style scoped>` block, and the compiler handles encapsulation through generated attribute selectors. The mechanism is invisible and reliable, and in most cases not knowing how it works is the right default.

In Origami, the mechanism is not hidden. The compiler's behavior with respect to styles is a consequence of explicit rules in the grammar, not a convention layered on top of a general-purpose language. Whether this is an advantage depends on what the developer values and what the project requires. For a team working within a strict design system, where token compliance is a hard requirement rather than a guideline, compile-time enforcement removes an entire category of review feedback and runtime divergence. For a team that needs flexibility in the styling layer, it is a constraint that may not be appropriate.

What both approaches share, and this connects back to the paradox in section 4.2, is that the output after compilation reproduces the structure of the old web. Origami generates Vue SFCs; Vue compiles those SFCs into JavaScript and CSS; the browser receives assets not meaningfully different in structure from what a developer in the late 1990s would have produced by hand, only optimized beyond legibility. The colocation that exists at the authoring level does not survive to the runtime. It was never meant to. It exists to serve the developer, and it ends where the compiler begins.

### 5.3 What the compiler changes, and what it does not

The principle Origami illustrates is this: when a compiler sits between the developer and the runtime, architectural constraints that would otherwise be enforced by the format can move to the level of convention[^5]. The SFC format enforces one-component-per-file because the format has no mechanism for anything else[^6]. A compiler that targets SFCs but accepts a different authoring format can make different choices, because the format is no longer the contract: the compiler is.

This is not unique to Origami. Any sufficiently expressive compilation layer could make the same move. What Origami makes concrete is that the move is available, that it does not require changes to the runtime, and that the runtime remains entirely unaware that it happened.

The compiler makes these choices available and leaves them to the people using it. Colocation at the feature level is more expressive and more flexible than vertical colocation at the component level, but it requires more discipline to keep coherent at scale. Styling integrated into the DSL is more enforceable and more consistent than styling in a general-purpose block, but it is also less flexible and more opinionated. These are not problems the compiler solves. They are choices the compiler makes available.

---

## 6. Open questions

This article began with a question about where related code should live and who gets to decide. It has not answered that question, because the question does not have an answer independent of context. What it has is more precise edges.

What follows is not a conclusion but a set of questions the analysis leaves open, questions that any team or framework designer working in this space will eventually have to confront, explicitly or by default.

### 6.1 Is the component the right unit of work?

The component model has been so dominant for so long that it has become difficult to see it as a choice. But it is one. A component is a useful unit for reasoning about UI behavior and encapsulation; it is less obviously useful as the primary unit of authoring organization.

Features, in practice, do not map cleanly onto components. A feature is a product boundary, something a user can do, something the product offers, and it is almost always composed of multiple components with shared state, shared styling decisions, and shared conceptual context. When the authoring unit is the component, the feature has no natural home. It lives in a folder, if the team is disciplined, or it lives nowhere in particular, if the team is not.

Whether this mismatch between the unit of authoring and the unit of product thinking is a problem to solve, a tradeoff to manage, or an irreducible consequence of component-based development is a question different frameworks have answered implicitly. None has addressed it directly.

### 6.2 Where should discipline be enforced?

Every organizational approach requires discipline to remain coherent as a codebase scales. The frameworks examined here place that discipline in different locations: Vue places it in the format, React leaves it to the team, Origami places some of it in the compiler and the rest in the team's conventions.

Each placement has consequences. Format-level discipline is consistent and invisible: it works without requiring the team to think about it, and it works the same way regardless of who is writing the code. Its cost is that it cannot adapt to cases the format did not anticipate. Team-level discipline is flexible and fragile, it can adapt to anything, but it depends on the team maintaining it under pressure, across time, through turnover.

Compiler-level discipline is precise and enforceable for the things it covers, and silent about everything else.

The open question is whether any single placement is sufficient, or whether coherent codebases at scale require discipline enforced at multiple levels simultaneously, and if so, how those levels should be designed to reinforce rather than contradict each other.

### 6.3 What does the developer actually need to know?

Vue's scoped styles work by generating attribute selectors the developer never writes and rarely inspects. The mechanism is invisible by design. React's styling solutions vary enormously, CSS modules, styled components, utility classes, inline styles, each with its own relationship between what is written and what is shipped. Origami's token enforcement makes the compiler's behavior explicit in the grammar rather than in the output.

These are different answers to a question that is rarely asked directly: how much should the developer know about what the compiler does with their code?

Transparency has costs: it requires the developer to understand mechanisms that could otherwise be abstracted away, and to make decisions the framework could make on their behalf. Opacity has different costs: it makes debugging harder when the abstraction leaks, it creates distance between intent and output that becomes visible at the worst moments, and it requires trust in the framework's judgment that may or may not be warranted.

Neither extreme is obviously correct. The right balance depends on the team's expertise, the project's constraints, and the degree to which the framework's judgment can be trusted to align with the project's requirements. This is a balance, a point on a spectrum that has been chosen, not a natural state of affairs.

### 6.4 Is the output the right place to look?

Section 4.2 noted that all modern frameworks, regardless of their authoring conventions, produce output that structurally resembles the early commercial web: JavaScript for behavior, CSS for presentation, HTML structure encoded in the DOM. The colocation that exists at the authoring level does not survive compilation. It was designed not to.

This raises a question easy to overlook: if the output is always separation, and the authoring experience is always some form of colocation, then the debate about colocation is entirely a debate about developer experience, about what it is like to write and navigate a codebase, not about what the runtime receives or how it performs.

This doesn't dismiss the debate. Developer experience has real consequences: it affects how quickly bugs are found, how confidently changes are made, how successfully a codebase is understood by someone new to it. But arguments about colocation cannot be settled by looking at the output. The output is the same. The question is entirely about the humans on the other side of the compiler.

### 6.5 What happens when the target changes?

This question is specific to architectures like Origami's, where the compilation target is explicit and, in principle, replaceable. If the authoring format is decoupled from the runtime target, if the `.ori` file is a genuinely independent language that the compiler translates to Vue, not a Vue file that happens to have a different extension, then changing the target should not require changing the source.

In practice, this is an aspiration more than a guarantee. Compilation targets impose constraints that propagate upward: the semantics of the target language, the component model it expects, the styling primitives it supports. A compiler targeting Vue and a compiler targeting a WASM runtime are not interchangeable back-ends for the same front-end language without careful design. The answer will depend on decisions not yet made.

What the question points toward, though:

> If the unit of authoring, the unit of compilation, and the unit of runtime execution are three distinct things — and if a compiler can manage the translation between them — then many of the constraints that currently feel architectural may turn out to be conventional after all.

Whether that possibility is realized depends on the quality of the abstraction, and abstractions are only as good as the clarity of the thinking behind them.

[^1]: **"Organizational instincts"** refers to the implicit structural choices developers make when creating or moving files, where to put a new component, when to split a file, what a folder should represent. These choices are rarely made explicitly; they accumulate into the structure of the codebase over time.

[^2]: **"Format level"** means the constraint is embedded in the grammar of the file format itself, not in a rule or convention. A `.vue` file has a single `<template>` block by specification, there is no syntax for defining more than one. This is distinct from compiler-level enforcement, where the constraint is a deliberate rule written into the compiler's logic: real and enforceable, but also writable, modifiable, and extensible by whoever controls the compiler.

[^3]: **"Variable and honest"** is not a compliment. It means that code organized by individual judgment reflects, accurately and without filter, the priorities and habits of whoever wrote it, which in a team context produces inconsistency that compounds over time.

[^4]: Vue's scoped style encapsulation works by generating a unique attribute (typically `data-v-xxxxxxxx`, where the suffix is a hash derived from the component) and adding it to every element in the template and every selector in the style block. The result is CSS that only applies within the component's own DOM tree. The mechanism is reliable; it is also entirely invisible at the authoring level.

[^5]: When a compiler accepts an authoring format independent of its output format, the constraints of the output format no longer apply to the author. A `.vue` file cannot contain more than one component because the format has no syntax for it. A `.ori` file can, because `.ori` is not `.vue`, the compiler handles the translation. What was an architectural limit of the format becomes a convention the team can choose to follow or not.

[^6]: The grammar of a `.vue` file does not support the syntax for defining multiple components. It is not a rule that someone wrote which you could potentially bypass, it is simply absent from the format specification. There is no `<component name="Foo">` and `<component name="Bar">` within the same `.vue` file. The structure doesn't exist, so the behavior is not possible.