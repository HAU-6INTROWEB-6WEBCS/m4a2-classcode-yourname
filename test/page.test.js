// Adapted from the course engine's INTROWEB m1a1 Vitest/jsdom checks.
// See NOTICE for source attribution and license information.
import { describe, expect, it } from "vitest"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { JSDOM } from "jsdom"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "src")
const identity = JSON.parse(readFileSync(new URL("../student.json", import.meta.url), "utf8"))
const parse = (path) => new JSDOM(readFileSync(path, "utf8")).window.document
const index = existsSync(join(root, "index.html")) ? parse(join(root, "index.html")) : null
const subPages = existsSync(root)
  ? readdirSync(root).filter((d) => statSync(join(root, d)).isDirectory())
      .flatMap((d) => readdirSync(join(root, d)).filter((f) => f.endsWith(".html")).map((f) => join(d, f)))
  : []
const glossaryFile = subPages[0]
const glossary = glossaryFile ? parse(join(root, glossaryFile)) : null
const isExternal = (href) => /^(https?:)?\/\//.test(href) || /^(mailto|tel):/.test(href)
const links = (doc) => [...(doc?.querySelectorAll("a[href]") ?? [])]
const headings = () => [...(index?.querySelectorAll("h2") ?? [])].filter((h) => !h.closest("nav"))
const sectionId = (h) => h.id || h.closest("section[id]")?.id || ""
const tocLinks = () => {
  const nav = index?.querySelector("nav[id]")
  return [...(nav?.querySelectorAll("a[href^='#']") ?? [])]
}

describe("M4A2: Sip Trail Town Guide", () => {
  it("starts the guide with the HTML5 skeleton, a title and one h1", () => {
    expect(index?.doctype?.name.toLowerCase(), "Create src/index.html and start with <!DOCTYPE html>.").toBe("html")
    expect(index?.documentElement.getAttribute("lang"), "Set lang=\"en\".").toBe("en")
    expect(index?.title.trim().length ?? 0, "Give the guide a title.").toBeGreaterThan(3)
    expect(index?.querySelectorAll("h1").length ?? 0, "Use exactly one h1.").toBe(1)
  })

  it("has at least four sections, each reachable by an id", () => {
    expect(headings().length, "Write at least four h2 sections, one per town.").toBeGreaterThanOrEqual(4)
    for (const h of headings()) {
      expect(sectionId(h), `The section "${h.textContent.trim()}" needs an id on its h2 or its section element.`).not.toBe("")
    }
  })

  it("uses clean, unique ids", () => {
    const ids = [...(index?.querySelectorAll("[id]") ?? [])].map((e) => e.id)
    expect(ids.length, "Add ids to your sections.").toBeGreaterThanOrEqual(5)
    for (const id of ids) {
      expect(id, `The id "${id}" should use lowercase letters, numbers and hyphens, and start with a letter.`).toMatch(/^[a-z][a-z0-9-]*$/)
    }
    expect(new Set(ids).size, "Every id must be used only once.").toBe(ids.length)
  })

  it("has a table of contents that links to every section", () => {
    const targets = tocLinks().map((a) => a.getAttribute("href").slice(1))
    expect(index?.querySelector("nav[id] ol, nav[id] ul"), "Put the table of contents in a nav element with an id, holding a list.").not.toBeNull()
    for (const h of headings()) {
      expect(targets, `The table of contents has no link to the section "${h.textContent.trim()}".`).toContain(sectionId(h))
    }
  })

  it("makes every in-page link land on an element that exists", () => {
    const local = links(index).filter((a) => a.getAttribute("href").startsWith("#") && a.getAttribute("href").length > 1)
    expect(local.length, "Add in-page links.").toBeGreaterThan(0)
    for (const a of local) {
      expect(index.getElementById(a.getAttribute("href").slice(1)), `The link "${a.getAttribute("href")}" has no element with that id.`).not.toBeNull()
    }
  })

  it("lets the reader return to the contents from every section", () => {
    const navId = index?.querySelector("nav[id]")?.id
    expect(navId, "Give the table of contents nav an id so sections can link back to it.").toBeTruthy()
    for (const h of headings()) {
      const scope = h.closest("section") ?? h.parentElement
      const back = [...scope.querySelectorAll("a[href]")].some((a) => a.getAttribute("href") === `#${navId}`)
      expect(back, `The section "${h.textContent.trim()}" needs a link back to #${navId}.`).toBe(true)
    }
  })

  it("has a glossary page in a subfolder with at least three terms", () => {
    expect(glossaryFile, "Create a second page inside a folder, such as src/extras/glossary.html.").toBeTruthy()
    expect(glossary?.doctype?.name.toLowerCase(), "The glossary page needs the HTML5 skeleton.").toBe("html")
    expect(glossary?.title.trim().length ?? 0, "Give the glossary a title.").toBeGreaterThan(3)
    expect(glossary?.querySelectorAll("dt").length ?? 0, "List at least three terms with dt and dd.").toBeGreaterThanOrEqual(3)
    expect(glossary?.querySelectorAll("dd").length ?? 0, "Give every term a dd.").toBeGreaterThanOrEqual(3)
  })

  it("links the guide to the glossary and back with ../", () => {
    const hrefs = (doc) => links(doc).map((a) => a.getAttribute("href"))
    expect(hrefs(index).some((h) => resolve(root, h.split("#")[0]) === join(root, glossaryFile)), "Link the guide to the glossary page.").toBe(true)
    const back = hrefs(glossary).find((h) => /^\.\.\/index\.html#[a-z]/.test(h))
    expect(back, "Link the glossary back to a section of the guide, such as ../index.html#contents.").toBeTruthy()
    expect(index.getElementById(back.split("#")[1]), `The guide has no element with the id in "${back}".`).not.toBeNull()
  })

  it("makes every relative link reach a real file", () => {
    for (const [name, doc, base] of [["index.html", index, root], [glossaryFile, glossary, join(root, glossaryFile ?? "x", "..")]]) {
      for (const a of links(doc)) {
        const href = a.getAttribute("href")
        if (isExternal(href) || href.startsWith("#")) continue
        expect(existsSync(resolve(base, href.split("#")[0])), `${name}: the link "${href}" points at a file that does not exist.`).toBe(true)
      }
    }
    expect(links(index).filter((a) => !a.getAttribute("href").startsWith("#")).length, "Link the guide to the glossary.").toBeGreaterThan(0)
  })

  it("writes link text that says where the link goes", () => {
    const all = [...links(index), ...links(glossary)]
    expect(all.length, "The guide needs links.").toBeGreaterThan(0)
    for (const a of all) {
      expect(a.textContent.trim().toLowerCase(), "Link text such as \"click here\" tells the reader nothing.").not.toMatch(/^(click here|here|link|read more)$/)
    }
  })
})

describe("Student identity in your private copy", () => {
  it("contains the required details as non-empty text", () => {
    for (const field of ["fullName", "studentNumber", "studentEmail", "classCode", "githubAccount", "room", "pcNumber"]) {
      expect(typeof identity[field], `Keep ${field} as text.`).toBe("string")
      expect(identity[field]?.trim(), `Fill in ${field} in student.json.`).toBeTruthy()
    }
  })

  it("uses class code 2006", () => {
    expect(identity.classCode).toBe("2006")
  })
})
