---
summary: A headless magazine platform for BGE, with Drupal on Pantheon for editors and Astro for the front end.
---

<dl class="case-facts">
	<div><dt>Client</dt><dd>BGE, The Efficient Home magazine</dd></div>
	<div><dt>Role</dt><dd>Lead front-end developer and architect of the Astro build</dd></div>
	<div><dt>Year</dt><dd>2025–2026</dd></div>
	<div><dt>Stack</dt><dd>Astro, Drupal (JSON:API), Pantheon, Fuse.js, Sass, Node.js, GitHub Actions</dd></div>
</dl>

## The challenge

For years, our organization needed a way for BGE's marketing group to edit the magazine without taking on the full weight of a traditional Drupal site. Every issue was a static build, so each change and each new issue went through developers.

Headless was the obvious answer, but technical restrictions on our group made it hard to get there. We couldn't simply stand up the servers and services a headless setup usually needs.

## Finding a way through

The breakthrough came from working with another group. They hosted a Drupal site on **Pantheon**, where marketing could write and edit content. I built the front end in **Astro**, which pulls that content from Drupal and turns it into a fast, static magazine.

Each tool does the job it's best at. Drupal is the editing tool, and Astro is the reading experience.

## How it works

- **Content at build time:** during each build, a custom Astro integration fetches every configured page from Drupal's **JSON:API**. It downloads and normalizes the images and writes a manifest for each issue. The live site makes no calls to the CMS, so it stays fast and has nothing to break at runtime.
- **The whole archive in one place:** every issue used to be its own static site. Now all five issues, from 2022 to 2026, live in one Astro project. Issues 4 and 5 are dynamic and pull their content from Drupal. Issues 1 to 3 stay static but are housed in Astro, sharing the same navigation, directory and search.
- **Templates and components:** shared layouts and components cover every section of an issue: hero, feature, Toy Box, editor's desk, download box, next article and navigation.
- **Search across every issue:** a new site-wide search built on **Fuse.js**. The build creates a search index of every issue, weighting titles and headings above body text. Readers get fuzzy, typo-tolerant results right in the browser.
- **Automated deployment:** GitHub Actions builds the site and deploys it to Pantheon's Dev environment. The team then promotes it to Test and Live.

## Guardrails in the build

A site editors update weekly needs checks that don't depend on someone remembering them. Before each build, scripts check that the Drupal endpoints respond and validate editors' image tags and the directory data. Issue styles are compiled and their hashes verified, and a GitHub check stops generated files from being committed by mistake.

## AI-assisted development

I used AI to assist with parts of the technical work, such as the build scripts and the Drupal data handling, and I reviewed and tested everything it suggested.

## My role

I led the front-end build and made most of the project's commits, from June 2025 through October 2026. I worked alongside the group that ran the Drupal and Pantheon side of the project.

## The result

Marketing can now edit the magazine in Drupal without depending on developers for every change. A new issue starts from templates and components, so going from a new issue to a finished one takes far less time than it did when every issue was built from scratch. After years of trying, the organization finally has a headless magazine.

## What I'd take to the next project

- When restrictions block the usual path, look for partners who can open another one.
- Fetch content at build time when you can. The site stays fast and can't go down with the CMS.
- Put the checks in the build. Every weekly update is safer when the build checks itself.
