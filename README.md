# M4A2: Sip Trail: Town Guide

**Kind:** take-home practice. Do it on your own time before the next meeting. Searching, AI and helping each other are allowed, because this is practice; record what you used in `SOURCES-AND-ASSISTANCE.md`. The lab exam is closed book, so make sure you understand every line you submit.

**Sip Trail** now needs a guide to the towns on the café crawl. The demo linked pages that sat side by side. Here you plan the links yourself: one long page with a table of contents that jumps to each town, and a glossary page in a folder that links back.

## Before you start

Start the activity with the shared-lab launcher, exactly as in M1A0: follow the [setup guide](SETUP.md) to run the Mac launcher in Terminal or the Windows launcher in PowerShell, then clone your private repository `m4a2-CLASSCODE-USERNAME` in VS Code. Check that the repository name has your class code and your GitHub username before you continue.

```sh
npm ci
```

## What to build

You choose the towns, the ids and the folder layout.

- `src/index.html` is the guide: the HTML5 skeleton, a title, one `h1` and at least four `h2` sections, one per town. Every section has an `id`, written in lowercase letters, numbers and hyphens, and no two ids repeat.
- A table of contents sits in a `nav` element that has its own `id` and holds a list. It links to every section.
- Every section has a link back to the table of contents.
- A second page, the glossary, lives in a folder inside `src`, for example `src/extras/glossary.html`. It has the HTML5 skeleton, a title, and a description list with at least three terms.
- The guide links to the glossary. The glossary links back to a section of the guide with `../`, for example `../index.html#contents`.
- Link text says where the link goes.

## Concepts to research

- Choosing ids: what makes a good `id` value, and which characters to avoid.
- Tables of contents: how to build one as a list of in-page links.
- Paths that go up: how many `../` your subfolder page needs.
- Returning to the top: how to let a reader get back to the contents from any section.

## How it is graded

6 test points. The tests open your guide and your glossary, check that every id exists and every relative link reaches a real file or a real id. 4 rubric points for a navigation that is labelled and consistent (4, 3, 2 or 1).

Every activity also checks `student.json`: fill in your full name, student number, school email, class code **2006**, GitHub username, `room` and `pcNumber`, all as text.

## Check and save your work

Click through your guide in the browser, starting from the table of contents. Then run the checks:

```sh
npm test
```

The tests in your repository are a guide. The instructor grades from the course's own copy of the tests, so do not edit the tests to make them pass. In VS Code, open **Source Control**, commit your files with a short message, choose **Push**, and check that the commit appears on GitHub.

## Submit the exact commit link in Canvas

Open your repository's commit history on GitHub, open the commit with your finished work, copy its full URL (it contains **/commit/**), and submit it in the Canvas assignment for M4A2 using the Website URL option. Submit the commit page, not the repository home page or a screenshot.
